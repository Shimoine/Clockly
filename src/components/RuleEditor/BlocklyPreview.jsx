import { useEffect, useRef } from "react";
import * as Blockly from "blockly";
import { arrangeTopBlocks } from "@/core/blocklyLayout";

/**
 * 読み取り専用のBlocklyワークスペースを表示するだけのコンポーネント。
 * 元実装では PageOfMakeRule.js の PreviewBlock と UseBlockly.js の
 * PreviewWorkspace にほぼ同じロジックが重複していたため、ここに統合した。
 */
export default function BlocklyPreview({
  xml,
  className,
  zoomControls = false,
  fitToContent = false,
  arrangeBlocks = true,
  arrangeLayout = "vertical",
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !xml) return undefined;
    const container = containerRef.current;

    const workspace = Blockly.inject(containerRef.current, {
      toolbox: null,
      readOnly: true,
      move: {
        scrollbars: true,
        drag: true,
        wheel: false,
      },
      zoom: {
        controls: zoomControls,
        wheel: true,
        startScale: 0.7,
        maxScale: 1.5,
        minScale: 0.3,
        scaleSpeed: 1.2,
      },
    });

    const fitPreview = () => {
      workspace.resize();
      const blocks = workspace.getTopBlocks();
      if (blocks.length === 0) return;

      if (fitToContent && typeof workspace.zoomToFit === "function") {
        workspace.zoomToFit();
        return;
      }

      workspace.centerOnBlock(blocks[0].id);
    };

    try {
      const dom = Blockly.utils.xml.textToDom(xml);
      Blockly.Xml.domToWorkspace(dom, workspace);
      if (arrangeBlocks) arrangeTopBlocks(workspace, { layout: arrangeLayout });
    } catch (error) {
      console.error("ブロックXMLの読み込みに失敗しました:", error);
    }

    const observer = new ResizeObserver(() => fitPreview());
    observer.observe(container);
    requestAnimationFrame(fitPreview);

    return () => {
      observer.disconnect();
      workspace.dispose();
    };
  }, [xml, zoomControls, fitToContent, arrangeBlocks, arrangeLayout]);

  return (
    <div
      ref={containerRef}
      className={`blockly-preview ${className ?? "h-[300px] w-full rounded-md border bg-muted/30"}`}
    />
  );
}
