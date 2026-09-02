import { useCallback, useEffect, useState } from "react";
import { getLibrary, createLibrary, deleteLibrary } from "@/lib/api";

/**
 * 「ライブラリ」タブのデータ取得・追加・削除を扱うフック。
 * 元々 PageOfMakeRule.js / PageOfEditRule.js にそれぞれ
 * ほぼ同じ実装が重複していたため、ここに統合した。
 *
 * 元実装の library state は { id: [], name: [], xml: [] } という
 * 構造的に配列で扱いづらい形だったので、ここでは
 * [{ id, name, xml }, ...] の配列に変えている。
 * (UI側でindexを使った対応付けをしなくて済む)
 */
export function useLibrary() {
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    return getLibrary()
      .then((data) => {
        // バックエンドは { id: [], name: [], xml: [] } 形式で返してくる想定
        const items = (data.id ?? []).map((id, i) => ({
          id,
          name: data.name?.[i] ?? "",
          xml: data.xml?.[i] ?? "",
        }));
        setLibrary(items);
      })
      .catch((error) => console.error("ライブラリの取得に失敗しました:", error))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addToLibrary = useCallback(async (name, blockXmlText) => {
    const item = {
      id: crypto.randomUUID(),
      name,
      blockXml: blockXmlText
        .replace('<xml xmlns="https://developers.google.com/blockly/xml">', "")
        .replace("</xml>", ""),
    };
    const res = await createLibrary(item);
    if (!res.ok) {
      throw new Error("ライブラリへの追加に失敗しました。");
    }
    setLibrary((prev) => [...prev, { id: item.id, name: item.name, xml: item.blockXml }]);
  }, []);

  const removeFromLibrary = useCallback(async (id) => {
    const res = await deleteLibrary(id);
    if (!res.ok) {
      throw new Error("削除に失敗しました。");
    }
    setLibrary((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return { library, loading, refresh, addToLibrary, removeFromLibrary };
}

export default useLibrary;