import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import BlocklyPreview from "./BlocklyPreview";

/**
 * 元 UseBlockly.js の <Modal> を shadcn の <Dialog> に置き換えたもの。
 * ロジック(補完の取得・適用)は useBlocklyWorkspace 側にあるので、
 * ここは表示と「適用/キャンセル」の橋渡しのみを担当する。
 */
export default function AICompletionDialog({
  open,
  onOpenChange,
  originalXml,
  completedXml,
  onApply,
  onCancel,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[1000] sm:max-w-[min(calc(100vw-2rem),1280px)]">
        <DialogHeader>
          <DialogTitle>AI補完プレビュー</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
              補完前
            </h3>
            <BlocklyPreview
              xml={originalXml}
              className="relative z-0 h-[min(62vh,620px)] min-h-[420px] w-full rounded-md border bg-muted/30"
              zoomControls={false}
            />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
              補完後
            </h3>
            <BlocklyPreview xml={completedXml} className="relative z-0 h-[min(62vh,620px)] min-h-[420px] w-full rounded-md border bg-muted/30" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onCancel}>
            キャンセル
          </Button>
          <Button onClick={onApply}>変更を適用</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
