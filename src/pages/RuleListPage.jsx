import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LayoutGrid, List, Plus, Search, Workflow, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import RuleCard from "@/components/RuleCard";
import { getPrograms, deleteProgram } from "@/lib/api";

const VIEW_MODE_STORAGE_KEY = "ruleListViewMode";

/**
 * 「Rule List」ページ。元 PageOfRuleList.js を shadcn/ui で再構築したもの。
 */
function countBlocks(blockXml) {
  if (!blockXml) return 0;
  try {
    return new DOMParser().parseFromString(blockXml, "text/xml").querySelectorAll("block").length;
  } catch {
    return 0;
  }
}

export default function RuleListPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    return saved === "list" ? "list" : "card";
  });

  useEffect(() => {
    getPrograms()
      .then((programs) => {
        const list = programs.map((p) => ({
          id: p.id,
          name: p.name,
          blockXml: p.block,
          calendar_id_list: p.calendar_id_list,
          enable_auto: p.enable_auto,
          blockCount: countBlocks(p.block),
        }));
        setRules(list);
      })
      .catch((error) => console.error("ルール一覧の取得に失敗しました:", error))
      .finally(() => setLoading(false));
  }, []);

  const removeRule = async (id) => {
    if (!window.confirm("本当に削除してよろしいですか？")) return;

    const res = await deleteProgram(id);
    if (res.ok) {
      alert("削除が完了しました。");
      setRules((prev) => prev.filter((rule) => rule.id !== id));
    } else {
      alert("削除に失敗しました。");
    }
  };

  const updateRuleAuto = (id, enableAuto) => {
    setRules((prev) => {
      const updatedRule = prev.find((rule) => rule.id === id);
      if (!updatedRule) return prev;
      return [
        { ...updatedRule, enable_auto: enableAuto },
        ...prev.filter((rule) => rule.id !== id),
      ];
    });
  };

  const changeViewMode = (nextViewMode) => {
    setViewMode(nextViewMode);
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, nextViewMode);
  };

  const filteredRules = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return rules;
    return rules.filter((rule) => rule.name.toLowerCase().includes(normalizedQuery));
  }, [query, rules]);

  const autoCount = rules.filter((rule) => rule.enable_auto === true || rule.enable_auto === "true").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Rule List</h1>
          <p className="text-sm text-muted-foreground">
            カレンダー操作を自動化するルールを管理します。
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/make-rule">
            <Plus className="size-4" />
            新しいルールを作成
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card size="sm">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">ルール数</p>
              <p className="text-2xl font-semibold">{rules.length}</p>
            </div>
            <Workflow className="size-5 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">自動実行</p>
              <p className="text-2xl font-semibold">{autoCount}</p>
            </div>
            <Zap className="size-5 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">表示中</p>
              <p className="text-2xl font-semibold">{filteredRules.length}</p>
            </div>
            <Badge variant="secondary">Filtered</Badge>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-lg border bg-card px-3 py-2">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ルール名で検索"
            className="h-8 border-0 px-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="flex shrink-0 rounded-lg border bg-card p-1">
          <Button
            variant={viewMode === "card" ? "secondary" : "ghost"}
            size="sm"
            className="gap-1"
            onClick={() => changeViewMode("card")}
          >
            <LayoutGrid className="size-4" />
            カード
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            className="gap-1"
            onClick={() => changeViewMode("list")}
          >
            <List className="size-4" />
            リスト
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3 xl:grid-cols-2">
          {[0, 1, 2, 3].map((item) => (
            <Card key={item} className="h-40 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : rules.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
            <Workflow className="size-8 text-muted-foreground" />
            <div>
              <p className="font-medium">まだルールが作成されていません</p>
              <p className="text-sm text-muted-foreground">
                Blocklyで最初のカレンダールールを作成できます。
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/make-rule">ルールを作成</Link>
            </Button>
          </CardContent>
        </Card>
      ) : filteredRules.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-32 items-center justify-center text-sm text-muted-foreground">
            一致するルールがありません。
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === "card" ? "grid gap-3 xl:grid-cols-2" : "space-y-2"}>
          {filteredRules.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onRemove={removeRule}
              onAutoChange={updateRuleAuto}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}
