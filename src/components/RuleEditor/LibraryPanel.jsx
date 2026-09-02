import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BlocklyPreview from "./BlocklyPreview";
import { useLibrary } from "@/hooks/useLibrary";

/**
 * 「Library」タブの中身。元 PageOfMakeRule.js / PageOfEditRule.js の
 * TabPanel内にベタ書きされていた一覧表示・Import/削除ボタンを切り出した。
 *
 * @param {Object} props
 * @param {(xml: string) => void} props.onImport - 選択したライブラリのXMLを
 *   現在のワークスペースに結合する処理(呼び出し側でBlocklyタブへの切替も行う)
 */
export default function LibraryPanel({ onImport }) {
  const { library, loading, removeFromLibrary } = useLibrary();

  const handleRemove = async (id) => {
    if (!window.confirm("本当に削除してよろしいですか？")) return;
    try {
      await removeFromLibrary(id);
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">読み込み中…</p>;
  }

  if (library.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        まだライブラリに追加されたブロックはありません。
      </p>
    );
  }

  return (
    <div className="grid gap-3 xl:grid-cols-2">
      {library.map((item) => (
        <Card key={item.id} className="gap-0">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-base">{item.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-3">
            {item.xml && (
              <div className="rounded-lg border bg-muted/20 p-2">
                <BlocklyPreview
                  xml={`<xml xmlns="https://developers.google.com/blockly/xml">${item.xml}</xml>`}
                  fitToContent
                  className="h-[280px] w-full rounded-md bg-background"
                />
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => onImport(item.xml)}>
                Import
              </Button>
              <Button variant="destructive" onClick={() => handleRemove(item.id)}>
                削除
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
