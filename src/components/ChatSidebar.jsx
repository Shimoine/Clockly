import { useEffect, useRef, useState } from "react";
import * as Blockly from "blockly";
import { Bot, History, Plus, Square, Send, X, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import BlocklyPreview from "@/components/RuleEditor/BlocklyPreview";
import generateAllBlocksXml from "@/core/generateAllBlocksXml";
import {
  streamGeminiChat,
  getChatSessions,
  getChatHistory,
  deleteChatHistory,
  getCalendarList,
} from "@/lib/api";

/* ---------------------------------------------------------------- */
/* ユーティリティ関数(元実装からそのまま移植)                         */
/* ---------------------------------------------------------------- */

function parseMessageWithXML(text) {
  const xmlRegex = /<xml[^>]*>[\s\S]*?<\/xml>/g;
  const matches = [...text.matchAll(xmlRegex)];
  if (matches.length === 0) return { hasXML: false, text };

  const parts = [];
  let lastIndex = 0;
  matches.forEach((match) => {
    const beforeText = text.substring(lastIndex, match.index).trim();
    if (beforeText) parts.push({ type: "text", content: beforeText });
    parts.push({ type: "xml", content: match[0] });
    lastIndex = match.index + match[0].length;
  });
  const afterText = text.substring(lastIndex).trim();
  if (afterText) parts.push({ type: "text", content: afterText });
  return { hasXML: true, parts };
}

function markdownToHtml(text) {
  if (!text) return "";
  return text
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/_([^_]+)_/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function sanitizeHtml(dirty) {
  if (!dirty) return "";
  dirty = markdownToHtml(dirty);
  const parser = new DOMParser();
  const doc = parser.parseFromString(String(dirty), "text/html");
  const ALLOWED = new Set(["BR","B","I","STRONG","EM","U","PRE","CODE","A","P","UL","OL","LI","SPAN"]);

  function clean(node) {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        if (!ALLOWED.has(child.tagName)) {
          node.replaceChild(document.createTextNode(child.textContent || ""), child);
        } else {
          Array.from(child.attributes || []).forEach((attr) => {
            if (child.tagName === "A" && attr.name === "href") {
              if (!/^(https?:\/\/|mailto:)/i.test(attr.value || "")) {
                child.removeAttribute("href");
              }
            } else {
              child.removeAttribute(attr.name);
            }
          });
          clean(child);
        }
      } else if (child.nodeType !== Node.TEXT_NODE) {
        node.removeChild(child);
      }
    });
  }

  clean(doc.body);
  return doc.body.innerHTML.replace(/\r\n?/g, "\n").replace(/\n/g, "<br/>");
}

function newSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/* ---------------------------------------------------------------- */
/* ChatSidebar 本体                                                  */
/* ---------------------------------------------------------------- */

/**
 * AIチャットサイドバー。元 ChatSidebar.js を shadcn/ui で再構築したもの。
 * 右スライドパネルはshadcnのSheetに置き換え、フローティングボタンで開閉する。
 *
 * @param {Object} props
 * @param {import('blockly').WorkspaceSvg} props.workspace
 * @param {string} props.ruleName
 */
export default function ChatSidebar({ workspace, ruleName }) {
  const [open, setOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatController, setChatController] = useState(null);
  const [sessionId, setSessionId] = useState(newSessionId);
  const [sessions, setSessions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  // テキストエリアの高さ自動調整
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(400, ta.scrollHeight)}px`;
  }, [chatInput]);

  // メッセージ追加時に最下部へスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // セッション切り替え時に履歴を読み込む
  useEffect(() => {
    let cancelled = false;
    getChatHistory(sessionId)
      .then((history) => {
        if (!cancelled) setChatMessages(history);
      })
      .catch((e) => console.error("履歴の読み込みに失敗しました:", e));
    loadSessions();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const loadSessions = async () => {
    try {
      setSessions(await getChatSessions());
    } catch (e) {
      console.error("セッション一覧の読み込みに失敗しました:", e);
    }
  };

  const createNewChat = () => {
    setSessionId(newSessionId());
    setChatMessages([]);
    setShowHistory(false);
  };

  const switchSession = (id) => {
    setSessionId(id);
    setShowHistory(false);
  };

  const deleteSession = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("このチャット履歴を削除しますか？")) return;
    const ok = await deleteChatHistory(id);
    if (ok) {
      loadSessions();
      if (id === sessionId) createNewChat();
    }
  };

  // ワークスペースのXMLをブロックに追加する
  const handleAddToWorkspace = (xmlContent) => {
    if (!workspace) return alert("ワークスペースが初期化されていません");
    try {
      const xmlDom = Blockly.utils.xml.textToDom(xmlContent);
      const beforeIds = workspace.getTopBlocks().map((b) => b.id);
      Blockly.Xml.domToWorkspace(xmlDom, workspace);
      const newBlocks = workspace.getTopBlocks().filter((b) => !beforeIds.includes(b.id));
      let maxY = 20;
      workspace.getTopBlocks().forEach((b) => {
        const xy = b.getRelativeToSurfaceXY();
        if (xy.y + b.height > maxY) maxY = xy.y + b.height + 20;
      });
      newBlocks.forEach((b, i) => b.moveBy(20, maxY + i * 100));
      if (newBlocks[0]) workspace.centerOnBlock(newBlocks[0].id);
    } catch (e) {
      alert("ブロックの追加に失敗しました: " + e.message);
    }
  };

  // ワークスペースのXMLを置き換える
  const handleReplaceWorkspace = (xmlContent) => {
    if (!workspace) return alert("ワークスペースが初期化されていません");
    if (!window.confirm("現在のワークスペースの内容をすべて置き換えますか？")) return;
    try {
      workspace.clear();
      const xmlDom = Blockly.utils.xml.textToDom(xmlContent);
      Blockly.Xml.domToWorkspace(xmlDom, workspace);
      const blocks = workspace.getTopBlocks();
      if (blocks[0]) workspace.centerOnBlock(blocks[0].id);
    } catch (e) {
      alert("ワークスペースの置き換えに失敗しました: " + e.message);
    }
  };

  // SSEストリーミング開始
  const startChatStreaming = async (userMessage) => {
    if (!workspace) {
      setChatMessages((prev) => [...prev, { role: "assistant", text: "[ワークスペースが未初期化です]" }]);
      return;
    }

    setIsStreaming(true);
    setChatMessages((prev) => [
      ...prev,
      { role: "user", text: userMessage },
      { role: "assistant", text: "" },
    ]);

    let availableCalendars = [];
    try {
      const list = await getCalendarList();
      availableCalendars = list.map((c) => ({ summary: c.summary, id: c.id }));
    } catch (e) {
      console.error("カレンダー一覧の取得に失敗しました:", e);
    }

    const currentXml = Blockly.Xml.workspaceToDom(workspace);
    currentXml.querySelectorAll("block, shadow").forEach((b) => b.removeAttribute("id"));

    const controller = new AbortController();
    setChatController(controller);

    try {
      const resp = await streamGeminiChat(
        {
          currentWorkspace: Blockly.Xml.domToText(currentXml),
          xmlExample: generateAllBlocksXml(Blockly, workspace),
          ruleName,
          availableCalendars,
          userMessage,
          sessionId,
        },
        { signal: controller.signal }
      );

      if (!resp.ok) {
        const txt = await resp.text();
        setChatMessages((prev) => [...prev, { role: "assistant", text: `[エラー] ${resp.status} ${txt}` }]);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          for (const line of part.split("\n")) {
            if (!line.startsWith("data:")) continue;
            const dataText = line.substring(5).trim();
            if (dataText === "[DONE]") { setIsStreaming(false); continue; }

            let content = dataText;
            try {
              content = JSON.parse(dataText);
            } catch {
              // JSONではない通常テキストのチャンクとして扱う
            }

            if (typeof content === "object" && content?.error) {
              setChatMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.role === "assistant") {
                  updated[updated.length - 1] = { ...last, text: last.text + `[エラー: ${content.error}]` };
                }
                return updated;
              });
              setIsStreaming(false);
              continue;
            }

            setChatMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last?.role === "assistant") {
                updated[updated.length - 1] = { ...last, text: last.text + content };
              } else {
                updated.push({ role: "assistant", text: String(content) });
              }
              return updated;
            });
          }
        }
      }
    } catch (e) {
      if (e.name === "AbortError") {
        setChatMessages((prev) => [...prev, { role: "assistant", text: "[ストリーム中断]" }]);
      } else {
        setChatMessages((prev) => [...prev, { role: "assistant", text: `[通信エラー: ${e.message}]` }]);
      }
    } finally {
      setIsStreaming(false);
      setChatController(null);
    }
  };

  const stopChatStreaming = () => {
    try {
      chatController?.abort();
    } catch (e) {
      console.error("チャットストリームの中断に失敗しました:", e);
    }
    setIsStreaming(false);
    setChatController(null);
  };

  const handleSend = () => {
    if (isStreaming) return stopChatStreaming();
    const msg = chatInput.trim();
    if (!msg) return;
    setChatInput("");
    startChatStreaming(msg);
  };

  return (
    <>
      {/* フローティングボタン */}
      {!open && (
        <button
          type="button"
          aria-label="Open AI Chat"
          onClick={() => setOpen(true)}
          className="fixed right-4 bottom-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 sm:right-6 sm:bottom-6"
        >
          <Bot className="h-6 w-6" />
        </button>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          style={{
            width: "min(500px, calc(100vw - 1rem))",
            maxWidth: "calc(100vw - 1rem)",
          }}
          className="flex min-w-0 flex-col overflow-hidden p-0"
        >
          {/* ヘッダー */}
          <SheetHeader className="flex min-w-0 flex-row items-center justify-between border-b px-4 py-3">
            <SheetTitle className="min-w-0 truncate text-base">AIアシスタント</SheetTitle>
            <div className="flex shrink-0 items-center gap-1">
              <Button type="button" variant="ghost" size="icon" onClick={createNewChat} title="新規チャット">
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={showHistory ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setShowHistory((v) => !v)}
                title="履歴"
              >
                <History className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          {/* 履歴パネル */}
          {showHistory ? (
            <div className="min-w-0 max-w-full flex-1 overflow-x-hidden overflow-y-auto p-4">
              <h3 className="mb-3 text-sm font-medium">チャット履歴</h3>
              {sessions.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">履歴がありません</p>
              ) : (
                <div className="min-w-0 max-w-full space-y-2">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => switchSession(session.id)}
                      className={`box-border flex w-full min-w-0 max-w-full cursor-pointer items-center justify-between gap-2 rounded-lg border p-3 transition-colors hover:bg-muted ${
                        session.id === sessionId ? "bg-muted" : ""
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{session.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          メッセージ数: {session.message_count}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-destructive hover:text-destructive"
                        onClick={(e) => deleteSession(session.id, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* メッセージ一覧 */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {chatMessages.map((msg, index) => {
                    const parsed =
                      msg.role === "assistant"
                        ? parseMessageWithXML(msg.text)
                        : { hasXML: false, text: msg.text };

                    return (
                      <div
                        key={index}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`rounded-2xl px-3 py-2 text-sm ${
                            msg.role === "user"
                              ? "max-w-[80%] bg-[#9CF29A] text-foreground"
                              : "max-w-[95%] bg-muted text-foreground"
                          }`}
                        >
                          {!msg.text && isStreaming && index === chatMessages.length - 1 ? (
                            <span className="flex items-center gap-2">
                              思考中
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-foreground" />
                            </span>
                          ) : parsed.hasXML ? (
                            parsed.parts.map((part, i) =>
                              part.type === "text" ? (
                                <div
                                  key={i}
                                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(part.content) }}
                                />
                              ) : (
                                <div key={i} className="my-2">
                                  <BlocklyPreview
                                    xml={part.content}
                                    className="h-[280px] w-full rounded-md border bg-background sm:h-[320px]"
                                    arrangeLayout="grid"
                                  />
                                  <div className="mt-2 flex justify-end gap-2">
                                    <Button type="button" size="sm" variant="outline" onClick={() => handleAddToWorkspace(part.content)}>
                                      追加
                                    </Button>
                                    <Button type="button" size="sm" variant="outline" onClick={() => handleReplaceWorkspace(part.content)}>
                                      置換
                                    </Button>
                                  </div>
                                </div>
                              )
                            )
                          ) : (
                            <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(msg.text) }} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* 入力エリア */}
              <div className="border-t p-3">
                <div className="flex items-end gap-2">
                  <Textarea
                    ref={textareaRef}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="メッセージを入力… (Shift+Enterで改行)"
                    disabled={isStreaming}
                    rows={1}
                    className="max-h-[400px] min-h-[40px] resize-none"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant={isStreaming ? "destructive" : "default"}
                    onClick={handleSend}
                    disabled={!isStreaming && !chatInput.trim()}
                    className="shrink-0"
                    title={isStreaming ? "中止" : "送信"}
                  >
                    {isStreaming ? <Square className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
