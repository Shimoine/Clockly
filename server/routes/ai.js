import { Router } from "express";
import { loadChatHistory, saveChatHistory, dbLoad, dbStore } from "../lib/db.js";

const router = Router();

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const FLASH_MODEL = "gemini-2.5-flash";

function removeCodeBlocks(text) {
  return text.replace(/^```[a-z]*\s*$/gm, "").replace(/^```\s*$/gm, "");
}

function buildCalendarInstructions(availableCalendars) {
  if (!availableCalendars?.length) return "";
  return availableCalendars.map((c) => `- ${c.summary} (id: ${c.id})`).join("\n");
}

// AI補完(一括レスポンス)
router.post("/gemini-completion", async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY が設定されていません" });

  const { currentWorkspace, xmlExample, ruleName, availableCalendars } = req.body;

  const prompt = `【ブロックプログラミング補完ルール】
あなたはBlocklyを使ったカレンダー操作のブロックプログラミング補完AIです。

## ルール名
${ruleName ?? "不明なルール"}

## 基本ルール
1. 現在のワークスペースの意図を理解し、不完全な部分を補完する
2. shadow blockや接続されていない値は適切なブロックで置き換える
3. field name と value name は必ず XML 例にある通りにする
4. カレンダーブロックは次の形式のみ使用すること:
<block type="calendar"><field name="summary">名前</field><field name="id">id</field></block>

## 利用可能なカレンダー
${buildCalendarInstructions(availableCalendars)}

## 出力形式
完成したBlockly XMLのみを返してください。説明文は不要です。

現在のワークスペース:
${currentWorkspace}

XML例:
${xmlExample}`;

  try {
    const response = await fetch(
      `${GEMINI_BASE}/${FLASH_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 8192 },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: `Gemini API エラー: ${response.status}`, details: err });
    }

    const result = await response.json();
    let completedXml = result.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const xmlMatch = completedXml.match(/<xml[^>]*>[\s\S]*?<\/xml>/);
    if (xmlMatch) completedXml = xmlMatch[0];

    res.json({ completedXml });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// AIチャット(SSEストリーミング)
router.post("/gemini-ask", async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY が設定されていません" });

  const {
    userMessage,
    currentWorkspace = "",
    ruleName = "",
    xmlExample = "",
    availableCalendars = [],
    sessionId = "default",
  } = req.body;

  if (!userMessage) return res.status(400).json({ error: "userMessage が必要です" });

  const chatHistory = loadChatHistory(sessionId);

  const systemInstruction = {
    role: "user",
    parts: [{
      text: `あなたは Clockly のプログラミングアシスタントです。
### 基本ルール
- 決して任意の field name，value name を生成しないでください．
- 例えば calendarSummaryField, calendarIdField, TEXT などの新しい field name を作らないでください．
- カレンダーブロックは必ず次の正確な形式を使ってください（例）：

<block type="calendar">
  <field name="summary">マイカレンダ</field>
  <field name="id">nomura.laboratory@gmail.com</field>
</block>

- カレンダーブロックで使用する summary と id の値は、必ず利用可能なカレンダー一覧にあるものを使ってください。存在しないカレンダー名や ID を勝手に生成しないこと
- 利用可能なブロックは「利用可能な XML 一覧」に記載されているもののみです．
- 出力は出力形式に”必ず”従って出力してください．

### 出力形式 (重要・厳守)
- 回答は Blockly XML と解説文に分けて出力してください．
- Blockly XML は <xml xmlns="https://developers.google.com/blockly/xml"> タグで始まり </xml> タグで終わる形式にしてください．
- **絶対に XML を Markdown のコードブロックで囲まないでください！**
- **XML はそのまま生のテキストとして、マークダウン記法なしで出力してください！**
- **コードブロックは一切使用しないでください！**
- 解説文は Blockly XML の後に改行を2つ挟んで出力してください．

【正しい出力例】

ここに会話文が入ります．

<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="calendar">
    <field name="summary">マイカレンダ</field>
    <field name="id">calendar@gmail.com</field>
  </block>
</xml>

ここに解説文が入ります．

- 解説文が不要な場合は，Blockly XML のみを出力してください．
- XML が不要な場合は，テキストのみを出力してください．

現在のワークスペース: ${currentWorkspace}
ルール名: ${ruleName}
利用可能なカレンダー: ${buildCalendarInstructions(availableCalendars)}
利用可能なブロック: ${xmlExample}`
    }]
  };

  const contents = [
    systemInstruction,
    ...chatHistory.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    })),
    { role: "user", parts: [{ text: userMessage }] },
  ];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  try {
    const geminiRes = await fetch(
      `${GEMINI_BASE}/${FLASH_MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
        body: JSON.stringify({
          contents,
          generationConfig: { maxOutputTokens: 8192, temperature: 0.7 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const details = await geminiRes.text();
      throw new Error(`Gemini API エラー: ${geminiRes.status} ${details}`);
    }
    if (!geminiRes.body) {
      throw new Error("Gemini API からストリーム本文を取得できませんでした");
    }

    let assistantResponse = "";
    let buffer = "";
    const reader = geminiRes.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      for (const line of decoder.decode(value, { stream: true }).split("\n")) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const payload = trimmed.startsWith("data: ") ? trimmed.slice(6) : trimmed;
        if (payload === "[DONE]") { res.write("data: [DONE]\n\n"); continue; }

        let parsed = null;
        try { parsed = JSON.parse(payload); buffer = ""; }
        catch { buffer += payload; try { parsed = JSON.parse(buffer); buffer = ""; } catch { continue; } }

        if (parsed) {
          const items = Array.isArray(parsed) ? parsed : [parsed];
          for (const obj of items) {
            const text = (obj?.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? "").join("");
            if (!text.trim()) continue;
            const cleaned = removeCodeBlocks(text);
            assistantResponse += cleaned;
            res.write(`data: ${JSON.stringify(cleaned)}\n\n`);
          }
        }
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();

    chatHistory.push({ role: "user", text: userMessage });
    chatHistory.push({ role: "assistant", text: assistantResponse });
    saveChatHistory(sessionId, chatHistory);
  } catch (e) {
    console.error(e);
    res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`);
    res.end();
  }
});

// チャット履歴を取得
router.get("/chat-history/:sessionId", (req, res) => {
  res.json(loadChatHistory(req.params.sessionId));
});

// 全セッション一覧
router.get("/chat-sessions", (req, res) => {
  const all = dbLoad("chat-history.json") ?? {};
  const sessions = Object.entries(all).map(([id, messages]) => {
    const firstUser = messages.find((m) => m.role === "user");
    return {
      id,
      title: firstUser ? firstUser.text.slice(0, 30) : "新しいチャット",
      message_count: messages.length,
      created_at: parseInt(id.split("_")[1] ?? 0),
    };
  });
  res.json(sessions.sort((a, b) => b.created_at - a.created_at));
});

// チャット履歴を削除
router.delete("/chat-history/:sessionId", (req, res) => {
  const all = dbLoad("chat-history.json") ?? {};
  delete all[req.params.sessionId];
  dbStore("chat-history.json", all);
  res.json({ message: "会話履歴を削除しました" });
});

export default router;
