import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * JavaScript/XML/JSONタブの中身。
 * 元実装では各タブごとに <pre><code>{...}</code></pre> がそのまま
 * 重複していたので共通化し、コピー機能を追加した。
 */
export default function CodeViewer({ code, language, emptyMessage }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="absolute right-2 top-2"
        onClick={handleCopy}
        disabled={!code}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "コピーしました" : "コピー"}
      </Button>
      <pre className="max-h-[560px] overflow-auto whitespace-pre-wrap break-all rounded-lg border bg-muted/30 p-4 pr-24 text-sm">
        <code data-language={language}>
          {code || emptyMessage || "（内容がありません）"}
        </code>
      </pre>
    </div>
  );
}
