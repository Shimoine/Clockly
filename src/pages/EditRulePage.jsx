import { useLocation, useNavigate, useParams } from "react-router-dom";
import * as Blockly from "blockly";

import RuleEditorForm from "@/components/RuleEditor/RuleEditorForm";
import { arrangeTopBlocks } from "@/core/blocklyLayout";
import { updateProgram } from "@/lib/api";

/**
 * 「ルールの編集」ページ。
 * RuleCard の「編集」ボタンから navigate("/edit/:id", { state: { id, name, block } })
 * という形で遷移してくる想定(state経由で初期値を受け取る)。
 * リロード等でstateが失われた場合は id だけ URLパラメータから復元できるが、
 * 名前・ブロックXMLまでは復元できないため、その場合は別途
 * 「IDから1件取得するAPI」を足すまでは空のフォームになる。
 */
export default function EditRulePage() {
  const { id: idFromUrl } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const id = location.state?.id ?? idFromUrl;
  const initialName = location.state?.name ?? "";
  const initialBlockXml = location.state?.block ?? null;

  const handleSubmit = async ({ workspace, name }) => {
    arrangeTopBlocks(workspace);

    const payload = {
      id,
      name,
      blockXml: Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace)),
      enable_auto: false,
    };

    const res = await updateProgram(payload);
    if (!res.ok) throw new Error("ルールの更新に失敗しました");
    navigate("/rules");
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="shrink-0">
        <h1 className="text-2xl font-semibold">ルールの編集</h1>
        <p className="text-sm text-muted-foreground">
          Blocklyの内容を調整して、既存のカレンダールールを更新します。
        </p>
      </div>
      <RuleEditorForm
        initialName={initialName}
        initialBlockXml={initialBlockXml}
        submitLabel="ルールを変更"
        onSubmit={handleSubmit}
        className="flex-1"
      />
    </div>
  );
}
