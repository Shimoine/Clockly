import { useCallback, useEffect, useRef, useState } from "react";
import * as Blockly from "blockly";

import "@/core/blocks/registerBlocks.js"; // 副作用: Blockly.Blocksへのカスタムブロック登録
import { toolboxConfig } from "@/core/toolbox.js";
import generateAllBlocksXml from "@/core/generateAllBlocksXml.js";
import { arrangeTopBlocks } from "@/core/blocklyLayout.js";
import { getCalendarList, requestGeminiCompletion } from "@/lib/api.js";

/**
 * Blocklyワークスペースの注入・カレンダー変数登録・AI補完を扱うフック。
 *
 * 元 UseBlockly.js との主な違い:
 * - UI(Modal/Button)を含まない。表示は呼び出し側(コンポーネント)が行う。
 * - カレンダー一覧をモジュール直下の `var calendar_list` (グローバル変数)
 *   ではなく useRef で保持するようにした。元実装には
 *   「ここのスコープがよくわからない」というコメントがあったが、
 *   複数のワークスペースを同時に開いた場合に状態が混ざるバグの原因になり得るため修正。
 * - アンマウント時に workspace.dispose() するようにした
 *   (元実装は一度injectしたら破棄されず、SPA内でページ遷移を繰り返すとリークしていた)。
 * - initialXml が後から(非同期に)変わった場合にも反映されるようにした
 *   (編集ページでfetch後にXMLが届くケースに対応)。
 *
 * @param {Object} params
 * @param {React.RefObject<HTMLElement>} params.containerRef - Blocklyを注入するdivのref
 * @param {string|null} params.initialXml - 初期表示するブロックXML(あれば)
 * @param {string} params.ruleName - AI補完に渡すルール名
 */
export function useBlocklyWorkspace({ containerRef, initialXml, ruleName }) {
  const [workspace, setWorkspace] = useState(null);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const calendarListRef = useRef([]); // [[summary, id], ...]
  const loadedInitialXmlRef = useRef(null);

  // カレンダー変数の登録 + 「カレンダ」カテゴリの動的生成コールバック登録
  const registerCalendarVariables = useCallback((ws) => {
    getCalendarList()
      .then((list) => {
        const sorted = list
          .map((c) => [c.summary, c.id])
          .sort((a, b) => a[0].localeCompare(b[0]));
        calendarListRef.current = sorted;
        sorted.forEach(([summary]) => {
          ws.getVariableMap().createVariable(summary, "Calendar");
        });
      })
      .catch((e) => console.error("カレンダー一覧の取得に失敗しました:", e));

    ws.registerToolboxCategoryCallback("CALENDAR_VARIABLE", () => {
      return calendarListRef.current.map(([summary, id]) => {
        const xmlString =
          `<block type="calendar">` +
          `<field name="summary">${summary}</field>` +
          `<field name="id">${id}</field>` +
          `</block>`;
        return Blockly.utils.xml.textToDom(xmlString);
      });
    });
  }, []);

  // Blocklyワークスペースの注入(マウント時に1回)
  useEffect(() => {
    if (!containerRef.current) return undefined;

    // 開発時はReact 18のStrictModeにより、このeffectが
    // 「実行→クリーンアップ→再実行」と短時間に2回走る。
    // Blocklyは連続inject/disposeを想定しきれておらず、
    // flyoutのスクロールバーやゴミ箱まわりの状態が壊れることがあるため、
    // 注入前に念のためコンテナの残留要素を掃除しておく(保険的な対策)。
    containerRef.current.innerHTML = "";

    const ws = Blockly.inject(containerRef.current, {
      toolbox: toolboxConfig,
      move: {
        scrollbars: true,
        drag: true,
        wheel: false,
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1,
        maxScale: 1.5,
        minScale: 0.3,
        scaleSpeed: 1.2,
      },
    });

    if (initialXml) {
      const dom = Blockly.utils.xml.textToDom(initialXml);
      Blockly.Xml.domToWorkspace(dom, ws);
      arrangeTopBlocks(ws);
      loadedInitialXmlRef.current = initialXml;
    }

    registerCalendarVariables(ws);
    ws.resize();
    ws.scrollCenter();
    setWorkspace(ws);

    // ゴミ箱の当たり判定を調整する。
    // デフォルトの Trashcan.getClientRect() はアイコンの実サイズぴったりの
    // 矩形を返すため、ブロック全体(＝左端)がアイコンに重ならないと
    // 削除扱いにならず使いづらい。
    //
    // ゴミ箱は画面右下にあり、ブロックは左→右にドラッグして近づけるので、
    // 「ブロックの右端〜中央あたりが触れた時点で反応してほしい」という要望に対しては、
    // 上下左右に均等な余白を足すのではなく、ブロックが来る方向(左側・上側)へ
    // 大きく非対称に広げるのが正しいアプローチ。
    // こうすると、ブロック全体ではなく右側の一部が拡張エリアに入った時点で
    // rect同士が交差するようになる。
    if (ws.trashcan) {
      const TRASHCAN_HIT_PADDING = {
        top: 60, // 上方向にどれだけ広げるか
        left: 220, // 左方向(ブロックが来る方向)。ここを一番大きくする
        right: 10, // 右方向はほぼ広げない(アイコンの外側にはみ出させない)
        bottom: 20, // 下方向は少しだけ
      };
      const originalGetClientRect = ws.trashcan.getClientRect.bind(ws.trashcan);
      ws.trashcan.getClientRect = () => {
        const rect = originalGetClientRect();
        if (!rect) return rect;
        return new Blockly.utils.Rect(
          rect.top - TRASHCAN_HIT_PADDING.top,
          rect.bottom + TRASHCAN_HIT_PADDING.bottom,
          rect.left - TRASHCAN_HIT_PADDING.left,
          rect.right + TRASHCAN_HIT_PADDING.right
        );
      };
    }

    // タブ切り替え(forceMount + display:none)で表示/非表示が切り替わると
    // コンテナの幅・高さが 0 ⇔ 実サイズ で変化する。Blockly側はこれを
    // 自動検知しないため、ResizeObserverで検知して都度resizeさせる。
    // これをやらないと、非表示中に積まれたサイズ計算が狂い、
    // 再表示時にスクロールバーやゴミ箱の位置がズレたままになる。
    let resizeObserver;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver((entries) => {
        const { width, height } = entries[0].contentRect;
        // タブが非表示(display:none)の間はコンテナが幅0・高さ0になる。
        // この状態でresizeすると、Blocklyがスクロール位置を
        // 0サイズ基準で再計算してしまい、再表示時にブロックが
        // 左上(原点)にリセットされたように見えるバグになる。
        // 実サイズに戻ったときだけresizeさせることで回避する。
        if (width === 0 || height === 0) return;
        Blockly.svgResize(ws);
        ws.resize();
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver?.disconnect();
      ws.dispose();
      setWorkspace(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // initialXml が後から届いた/変わった場合に反映する(編集ページ向け)
  useEffect(() => {
    if (!workspace || !initialXml) return;
    if (initialXml === loadedInitialXmlRef.current) return;

    const dom = Blockly.utils.xml.textToDom(initialXml);
    Blockly.Xml.clearWorkspaceAndLoadFromXml(dom, workspace);
    arrangeTopBlocks(workspace);
    workspace.resize();
    workspace.scrollCenter();
    loadedInitialXmlRef.current = initialXml;
  }, [workspace, initialXml]);

  const undo = useCallback(() => workspace?.undo(false), [workspace]);
  const redo = useCallback(() => workspace?.undo(true), [workspace]);

  /**
   * 指定したXMLでワークスペースを置き換える
   * (AI補完の適用、ライブラリのインポートなどで使用)
   */
  const loadXml = useCallback(
    (xmlText) => {
      if (!workspace) return;
      workspace.clear();
      const dom = Blockly.utils.xml.textToDom(xmlText);
      Blockly.Xml.domToWorkspace(dom, workspace);
      arrangeTopBlocks(workspace);

      const topBlocks = workspace.getTopBlocks();
      if (topBlocks.length > 0) {
        workspace.centerOnBlock(topBlocks[0].id);
      }
    },
    [workspace]
  );

  /**
   * AI補完をリクエストする。
   * 戻り値の completedXml をプレビューに使い、適用するかは呼び出し側が判断する
   * (UI側で確認ダイアログを出してから loadXml(completedXml) を呼ぶ想定)。
   */
  const requestAICompletion = useCallback(async () => {
    if (!ruleName) {
      throw new Error("ルール名が未定義です");
    }
    if (!workspace) {
      throw new Error("ワークスペースが未初期化です");
    }

    setIsAIGenerating(true);
    try {
      const currentXmlDom = Blockly.Xml.workspaceToDom(workspace);
      currentXmlDom
        .querySelectorAll("block, shadow")
        .forEach((b) => b.removeAttribute("id"));
      const currentWorkspaceXml = Blockly.Xml.domToText(currentXmlDom);

      const calendarList = await getCalendarList().catch(() => []);
      const availableCalendars = calendarList.map((c) => ({
        summary: c.summary,
        id: c.id,
      }));
      const xmlExample = generateAllBlocksXml(Blockly, workspace);

      const result = await requestGeminiCompletion({
        currentWorkspace: currentWorkspaceXml,
        xmlExample,
        ruleName,
        availableCalendars,
      });

      if (!result.completedXml) {
        throw new Error("AI補完の結果を取得できませんでした");
      }

      return {
        originalXml: currentWorkspaceXml,
        completedXml: result.completedXml,
      };
    } finally {
      setIsAIGenerating(false);
    }
  }, [ruleName, workspace]);

  return {
    workspace,
    undo,
    redo,
    loadXml,
    isAIGenerating,
    requestAICompletion,
  };
}

export default useBlocklyWorkspace;
