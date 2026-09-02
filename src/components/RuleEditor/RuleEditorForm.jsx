import { useCallback, useState } from "react";
import * as Blockly from "blockly";
import {
  Blocks,
  BookMarked,
  Braces,
  Code2,
  Library,
  Save,
} from "lucide-react";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import BlocklyWorkspace from "@/components/RuleEditor/BlocklyWorkspace";
import CodeViewer from "@/components/RuleEditor/CodeViewer";
import LibraryPanel from "@/components/RuleEditor/LibraryPanel";
import { getDisplayXml, getDisplayJson } from "@/core/xmlJsonUtils";
import { useLibrary } from "@/hooks/useLibrary";
import { cn } from "@/lib/utils";
import { generateProgramCode } from "@/lib/api";

const TAB_ITEMS = [
  { value: "blockly", label: "Blockly", icon: Blocks },
  { value: "javascript", label: "JavaScript", icon: Code2 },
  { value: "xml", label: "XML", icon: Braces },
  { value: "json", label: "JSON", icon: Braces },
  { value: "library", label: "Library", icon: Library },
];

/**
 * 「ルールの作成」「ルールの編集」で共有するフォーム本体。
 * 元 PageOfMakeRule.js と PageOfEditRule.js はロジックがほぼ同じだったため、
 * 差分(タイトル文言・送信ボタンのラベル・送信処理)だけを props で外から渡し、
 * このコンポーネントは「タブ切り替え」「ブロック編集」「ライブラリ連携」という
 * 共通部分だけを持つ。
 *
 * @param {Object} props
 * @param {string} props.title - 見出し(「ルールの作成」/「ルールの編集」)
 * @param {string} [props.initialName] - 初期ルール名
 * @param {string|null} [props.initialBlockXml] - 初期表示するブロックXML(編集時のみ)
 * @param {string} props.submitLabel - 送信ボタンのラベル(「ルールを作成」/「ルールを変更」)
 * @param {(payload: { workspace: import('blockly').WorkspaceSvg, name: string }) => Promise<void>} props.onSubmit
 *   - 送信ボタン押下時に呼ばれる。workspace と入力中のルール名を渡すので、
 *     ペイロード組み立て・API呼び出し・遷移は呼び出し側(ページ)が行う。
 */
export default function RuleEditorForm({
  initialName = "",
  initialBlockXml = null,
  submitLabel,
  onSubmit,
  onWorkspaceReady,
  onNameChange,
  className,
}) {
  const [name, setName] = useState(initialName);
  const [workspace, setWorkspace] = useState(null);
  const [activeTab, setActiveTab] = useState("blockly");
  const [submitting, setSubmitting] = useState(false);
  const { addToLibrary } = useLibrary();

  const [jsCode, setJsCode] = useState("");
  const [xmlText, setXmlText] = useState("");
  const [jsonText, setJsonText] = useState("");

  const handleTabChange = async (value) => {
    setActiveTab(value);
    if (!workspace) return;

    switch (value) {
      case "javascript": {
        const blockXml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));
        try {
          const result = await generateProgramCode(blockXml);
          setJsCode(result.jsCode ?? "");
        } catch (error) {
          console.error(error);
          setJsCode("JavaScriptコードの生成に失敗しました。");
        }
        break;
      }
      case "xml":
        setXmlText(getDisplayXml(workspace));
        break;
      case "json":
        setJsonText(getDisplayJson(workspace));
        break;
      default:
        break;
    }
  };

  const handleWorkspaceReady = useCallback((ws) => {
    setWorkspace(ws);
    onWorkspaceReady?.(ws);
  }, [onWorkspaceReady]);

  const handleSubmit = async () => {
    if (!workspace) return;
    if (!name.trim()) {
      alert("ルール名を入力してください");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ workspace, name });
    } catch (error) {
      console.error(error);
      alert(error.message ?? "保存に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  const exportLibrary = async () => {
    if (!workspace) return;
    const libraryName = prompt("ライブラリの名前を入力してください:");
    if (!libraryName) return;

    try {
      const xml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));
      await addToLibrary(libraryName, xml);
      alert("ライブラリに追加しました。");
    } catch (error) {
      alert(error.message);
    }
  };

  const importFromLibrary = (xml) => {
    if (!workspace) return;
    setActiveTab("blockly");
    const dom = Blockly.utils.xml.textToDom(
      `<xml xmlns="https://developers.google.com/blockly/xml">${xml}</xml>`
    );
    Blockly.Xml.domToWorkspace(dom, workspace);
  };

  return (
    <Card className={cn("flex min-h-0 flex-col overflow-hidden", className)}>
      <CardHeader className="shrink-0 border-b bg-muted/20">
        <div className="w-full space-y-1.5">
          <Label htmlFor="rule-name">ルール名</Label>
          <Input
            id="rule-name"
            value={name}
            placeholder="例: 今月のシフトカレンダの予定の合計時間を集計する"
            className="h-10 bg-background"
            onChange={(e) => { setName(e.target.value); onNameChange?.(e.target.value); }}
          />
        </div>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 p-4 sm:p-5">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full min-h-0 gap-4">
          <div className="shrink-0 overflow-x-auto pb-1">
            <TabsList className="h-10 w-max min-w-full justify-start">
              {TAB_ITEMS.map(({ value, label, icon: Icon }) => (
                <TabsTrigger key={value} value={value} className="h-8 px-3">
                  <Icon className="size-3.5" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* forceMount: タブ切り替えでBlocklyWorkspaceがアンマウントされると
              ワークスペースの内容が消えてしまうため、常時マウントしつつ
              非表示中はCSSで隠す方式にしている。 */}
          <TabsContent
            value="blockly"
            forceMount
            className="min-h-0 data-[state=inactive]:hidden"
          >
            <BlocklyWorkspace
              blockXml={initialBlockXml}
              ruleName={name}
              className="h-full min-h-0 w-full"
              onWorkspaceReady={handleWorkspaceReady}
            />
          </TabsContent>

          <TabsContent value="javascript" className="min-h-0">
            <CodeViewer code={jsCode} language="javascript" />
          </TabsContent>

          <TabsContent value="xml" className="min-h-0">
            <CodeViewer code={xmlText} language="xml" />
          </TabsContent>

          <TabsContent value="json" className="min-h-0">
            <CodeViewer code={jsonText} language="json" />
          </TabsContent>

          <TabsContent value="library" className="min-h-0">
            <LibraryPanel onImport={importFromLibrary} />
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="shrink-0 flex flex-col-reverse gap-2 border-t bg-background/95 px-4 py-3 sm:flex-row sm:items-center sm:justify-end sm:px-5">
        <Button variant="outline" onClick={exportLibrary} className="w-full sm:w-auto">
          <BookMarked className="size-4" />
          ライブラリに追加
        </Button>
        <Button onClick={handleSubmit} disabled={submitting} className="w-full sm:w-auto">
          <Save className="size-4" />
          {submitLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}
