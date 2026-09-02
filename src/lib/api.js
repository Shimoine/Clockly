/**
 * Clockly バックエンドAPIクライアント。
 * 全エンドポイントは /api プレフィックス以下にある。
 * Viteの開発サーバーは /api を http://localhost:4567 にproxyする設定になっている。
 */

const BASE = "/api";

async function getJson(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

async function postJson(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res;
}

/* ---------------------------------------------------------------- */
/* カレンダー                                                        */
/* ---------------------------------------------------------------- */

export async function startGoogleAuth({ prompt = "select_account" } = {}) {
  const redirectTo = `${window.location.origin}/settings`;
  const params = new URLSearchParams({ redirect: redirectTo, prompt });
  const url = await getJson(`/authorize?${params}`);
  window.location.href = url;
}

export function getCalendarList() {
  return getJson("/calendar_list");
}

export function getCalendarEvents(calendarId) {
  return getJson(`/calendar/${encodeURIComponent(calendarId)}`);
}

export function setCalendarWritable(calendarId, status) {
  return postJson("/writable", { id: calendarId, status });
}

/* ---------------------------------------------------------------- */
/* イベントCRUD                                                      */
/* ---------------------------------------------------------------- */

export function insertEvent(calendarId, event) {
  return postJson("/insert_event", { calendar_id: calendarId, event });
}

export function updateEvent(calendarId, eventId, event) {
  return postJson("/update_event", { calendar_id: calendarId, event_id: eventId, event });
}

export function deleteEvent(calendarId, eventId) {
  return postJson("/delete_event", { calendar_id: calendarId, event_id: eventId });
}

/* ---------------------------------------------------------------- */
/* ルール                                                            */
/* ---------------------------------------------------------------- */

export function getPrograms() {
  return getJson("/programs/");
}

export function createProgram(program) {
  return postJson("/create_program", program);
}

export function updateProgram(program) {
  return postJson("/update_program", program);
}

export function deleteProgram(id) {
  return postJson("/delete_program", { id });
}

export function executeProgram({ id, blockXml }) {
  return postJson("/execute_program", { id, blockXml });
}

export async function generateProgramCode(blockXml) {
  const res = await postJson("/generate_program_code", { blockXml });
  if (!res.ok) throw new Error("JavaScriptコードの生成に失敗しました");
  return res.json();
}

/* ---------------------------------------------------------------- */
/* ライブラリ                                                        */
/* ---------------------------------------------------------------- */

export function getLibrary() {
  return getJson("/get_library");
}

export function createLibrary(library) {
  return postJson("/create_library", library);
}

export function deleteLibrary(id) {
  return postJson("/delete_library", id);
}

/* ---------------------------------------------------------------- */
/* AI補完 / AIチャット                                               */
/* ---------------------------------------------------------------- */

export async function requestGeminiCompletion({ currentWorkspace, xmlExample, ruleName, availableCalendars }) {
  const res = await postJson("/gemini-completion", {
    currentWorkspace, xmlExample, ruleName, availableCalendars,
  });
  if (!res.ok) throw new Error("Gemini APIの呼び出しに失敗しました");
  return res.json();
}

export function streamGeminiChat(
  { currentWorkspace, xmlExample, ruleName, availableCalendars, userMessage, sessionId },
  { signal } = {}
) {
  return fetch(`${BASE}/gemini-ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      currentWorkspace, xmlExample, ruleName, availableCalendars, userMessage, sessionId,
    }),
    signal,
  });
}

/* ---------------------------------------------------------------- */
/* チャット履歴                                                      */
/* ---------------------------------------------------------------- */

export function getChatSessions() {
  return getJson("/chat-sessions");
}

export function getChatHistory(sessionId) {
  return getJson(`/chat-history/${sessionId}`);
}

export async function deleteChatHistory(sessionId) {
  const res = await fetch(`${BASE}/chat-history/${sessionId}`, { method: "DELETE" });
  return res.ok;
}

/* ---------------------------------------------------------------- */
/* 認証状態確認                                                      */
/* ---------------------------------------------------------------- */

// token_store.jsonが存在するか確認する(認証済みかどうかの判定に使う)
export async function checkAuthStatus() {
  try {
    const res = await fetch(`${BASE}/auth-status`);
    return res.ok && (await res.json()).authenticated;
  } catch {
    return false;
  }
}

export async function getGoogleAccount() {
  const res = await fetch(`${BASE}/account`);
  if (!res.ok) return null;
  return res.json();
}

export async function logoutGoogleAccount() {
  const res = await fetch(`${BASE}/logout`, { method: "POST" });
  return res.ok;
}
