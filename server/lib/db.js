import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const DB_PATH = process.env.DB_PATH ?? "./db";

function ensureDir() {
  if (!existsSync(DB_PATH)) mkdirSync(DB_PATH, { recursive: true });
}

export function dbLoad(filename) {
  ensureDir();
  const path = join(DB_PATH, filename);
  if (!existsSync(path)) return null;
  const content = readFileSync(path, "utf-8").trim();
  return content ? JSON.parse(content) : null;
}

export function dbStore(filename, data) {
  ensureDir();
  const path = join(DB_PATH, filename);
  writeFileSync(path, JSON.stringify(data, null, 2));
}

/* ---------------------------------------------------------------- */
/* チャット履歴                                                      */
/* ---------------------------------------------------------------- */

export function loadChatHistory(sessionId) {
  const all = dbLoad("chat-history.json") ?? {};
  return all[sessionId] ?? [];
}

export function saveChatHistory(sessionId, history) {
  const all = dbLoad("chat-history.json") ?? {};
  all[sessionId] = history;
  dbStore("chat-history.json", all);
}