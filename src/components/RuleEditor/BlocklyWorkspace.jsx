import { useEffect, useRef, useState } from "react";
import { Undo2, Redo2, Sparkles, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useBlocklyWorkspace } from "@/hooks/useBlocklyWorkspace";
import AICompletionDialog from "./AICompletionDialog";

/**
 * 元 UseBlockly.js のUI部分(react-bootstrapのButton/Modal)を
 * shadcn/uiに置き換えたもの。Blockly本体のロジックは
 * hooks/useBlocklyWorkspace.js に委譲している。
 *
 * @param {Object} props
 * @param {string|null} props.blockXml - 初期表示するブロックXML
 * @param {string} props.ruleName - AI補完に渡すルール名
 * @param {(workspace: import('blockly').WorkspaceSvg) => void} [props.onWorkspaceReady]
 *   - ワークスペースが用意できたら呼ばれる(親ページでコード生成等に使う)
 * @param {string} [props.className] - 外枠のクラス(高さ指定など)
 */
export default function BlocklyWorkspace({
  blockXml,
  ruleName,
  onWorkspaceReady,
  className = "h-[560px] w-full",
}) {
  const containerRef = useRef(null);
  const { workspace, undo, redo, loadXml, isAIGenerating, requestAICompletion } =
    useBlocklyWorkspace({ containerRef, initialXml: blockXml, ruleName });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState({
    originalXml: "",
    completedXml: "",
  });

  useEffect(() => {
    if (workspace) onWorkspaceReady?.(workspace);
  }, [workspace, onWorkspaceReady]);

  const handleAICompletion = async () => {
    try {
      const { originalXml, completedXml } = await requestAICompletion();
      setPreviewData({ originalXml, completedXml });
      setPreviewOpen(true);
    } catch (error) {
      console.error("AI補完エラー:", error);
      alert(error.message ?? "AI補完中にエラーが発生しました");
    }
  };

  const applyCompletion = () => {
    loadXml(previewData.completedXml);
    setPreviewOpen(false);
  };

  return (
    <div className={`blockly-workspace relative z-0 isolate overflow-hidden rounded-lg border ${className}`}>
      <div ref={containerRef} className="h-full w-full" />

      <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon"
          disabled={!workspace}
          onClick={undo}
          title="元に戻す"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          disabled={!workspace}
          onClick={redo}
          title="やり直す"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          disabled={isAIGenerating || !workspace}
          onClick={handleAICompletion}
        >
          {isAIGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              AI生成中…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              AI補完
            </>
          )}
        </Button>
      </div>

      <AICompletionDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        originalXml={previewData.originalXml}
        completedXml={previewData.completedXml}
        onApply={applyCompletion}
        onCancel={() => setPreviewOpen(false)}
      />
    </div>
  );
}
