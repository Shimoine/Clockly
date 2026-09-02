import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Pencil, Play, Trash2, Workflow, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import BlocklyPreview from "@/components/RuleEditor/BlocklyPreview";
import { executeProgram, updateProgram } from "@/lib/api";

/**
 * ルール一覧の1件分のカード。元 Rule.js のUI部分を shadcn/ui で再構築したもの。
 * ルール実行はブロックXMLをバックエンドへ渡して行う。
 *
 * @param {Object} props
 * @param {Object} props.rule - { id, name, blockXml, enable_auto, ... }
 * @param {(id: string) => void} props.onRemove
 * @param {(id: string, enableAuto: boolean) => void} props.onAutoChange
 * @param {"card"|"list"} [props.viewMode]
 */
export default function RuleCard({ rule, onRemove, onAutoChange, viewMode = "card" }) {
  const navigate = useNavigate();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [autoEnabled, setAutoEnabled] = useState(rule.enable_auto === true || rule.enable_auto === "true");
  const isList = viewMode === "list";

  const handleEdit = () => {
    navigate(`/edit/${rule.id}`, {
      state: { id: rule.id, name: rule.name, block: rule.blockXml },
    });
  };

  const handleToggleAuto = (checked) => {
    setAutoEnabled(checked);
    onAutoChange?.(rule.id, checked);
    updateProgram({ ...rule, enable_auto: checked });
  };

  const handleExecute = async () => {
    try {
      const res = await executeProgram({ id: rule.id, blockXml: rule.blockXml });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "ルールの実行に失敗しました");
      }
      alert("実行が完了しました");
    } catch (error) {
      console.error(error);
      alert(error.message ?? "ルールの実行に失敗しました");
    }
  };

  return (
    <Card className="gap-0">
      <CardHeader className={isList ? "pb-3" : "border-b pb-3"}>
        <div className={isList ? "flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between" : "flex items-start justify-between gap-3"}>
          <div className="min-w-0 space-y-2">
            <div className="flex min-w-0 items-center gap-2">
              <CardTitle className="truncate">{rule.name}</CardTitle>
              {autoEnabled ? (
                <Badge className="gap-1">
                  <Zap className="size-3" />
                  Auto
                </Badge>
              ) : (
                <Badge variant="outline">Manual</Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Workflow className="size-3" />
                {rule.blockCount ?? 0} blocks
              </span>
              {/* <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-3" />
                {rule.calendar_id_list?.length ?? 0} calendars
              </span> */}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <div className="mr-1 flex items-center gap-2">
              <Switch
                id={`auto-${rule.id}`}
                checked={autoEnabled}
                onCheckedChange={handleToggleAuto}
              />
              <Label htmlFor={`auto-${rule.id}`} className="text-xs text-muted-foreground">
                自動
              </Label>
            </div>
            {isList && (
              <>
                <Button variant="default" className="gap-2" onClick={handleExecute}>
                  <Play className="size-4" />
                  実行
                </Button>
                <Button variant="outline" className="gap-2" onClick={handleEdit}>
                  <Pencil className="size-4" />
                  編集
                </Button>
                <Button variant="destructive" className="gap-2" onClick={() => onRemove(rule.id)}>
                  <Trash2 className="size-4" />
                  削除
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      {!isList && (
        <CardContent className="space-y-3 pt-3">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="default"
              className="gap-2"
              onClick={handleExecute}
            >
              <Play className="size-4" />
              実行
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleEdit}>
              <Pencil className="size-4" />
              編集
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setPreviewOpen((current) => !current)}
            >
              <ChevronDown className={`size-4 transition-transform ${previewOpen ? "rotate-180" : ""}`} />
              プレビュー
            </Button>
            <Button variant="destructive" className="ml-auto gap-2" onClick={() => onRemove(rule.id)}>
              <Trash2 className="size-4" />
              削除
            </Button>
          </div>

          {previewOpen && (
            <div className="rounded-lg border bg-muted/20 p-2">
              {rule.blockXml ? (
                <BlocklyPreview
                  xml={rule.blockXml}
                  fitToContent
                  className="h-[280px] w-full rounded-md bg-background"
                />
              ) : (
                <div className="flex h-28 items-center justify-center text-sm text-muted-foreground">
                  プレビューできるブロックがありません。
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
