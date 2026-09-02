import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Blockly from "blockly";

import RuleEditorForm from "@/components/RuleEditor/RuleEditorForm";
import ChatSidebar from "@/components/ChatSidebar";
import { arrangeTopBlocks } from "@/core/blocklyLayout";
import { createProgram } from "@/lib/api";

export default function MakeRulePage() {
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState(null);
  const [name, setName] = useState("");

  const handleSubmit = async ({ workspace, name }) => {
    arrangeTopBlocks(workspace);

    const payload = {
      id: crypto.randomUUID(),
      name,
      blockXml: Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace)),
      enable_auto: false,
    };

    const res = await createProgram(payload);
    if (!res.ok) throw new Error("ルールの作成に失敗しました");
    navigate("/rules");
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 pb-20 sm:pr-20 sm:pb-0">
      <div className="shrink-0">
        <h1 className="text-2xl font-semibold">ルールの作成</h1>
        <p className="text-sm text-muted-foreground">
          Blocklyでカレンダー操作を自動化するルールを作成します。
        </p>
      </div>
      <RuleEditorForm
        submitLabel="ルールを作成"
        onSubmit={handleSubmit}
        onWorkspaceReady={setWorkspace}
        onNameChange={setName}
        className="flex-1"
      />
      <ChatSidebar workspace={workspace} ruleName={name} />
    </div>
  );
}
