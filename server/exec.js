/**
 * 自動実行スクリプト。元の exec.rb を Node.js に置き換えたもの。
 *
 * Blockly が生成した JavaScript コード(code)を実行する。
 *
 * 使い方:
 *   node exec.js [etag1] [etag2] ...
 *
 * auto_exec.sh から定期的に呼ばれる想定。
 */

import "dotenv/config";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { executeBlockXml } from "./lib/ruleEngine.js";
import { gFetch } from "./lib/googleClient.js";

const DB_PATH = process.env.DB_PATH ?? "./db";
const BASE = "https://www.googleapis.com/calendar/v3";

// --- etag変化チェック ---
async function hasUpdated(calendarIdList, etagList) {
  for (const calendarId of calendarIdList) {
    const params = new URLSearchParams({ singleEvents: "true" });
    const data = await gFetch(`${BASE}/calendars/${encodeURIComponent(calendarId)}/events?${params}`);
    if (!etagList.includes(data.etag)) return true;
  }
  return false;
}

// --- メイン処理 ---
const etags = process.argv.slice(2);
const programFile = join(DB_PATH, "program-repository.json");

if (!existsSync(programFile)) {
  console.log("program-repository.json が見つかりません");
  process.exit(0);
}

const content = readFileSync(programFile, "utf-8").trim();
const programs = content ? JSON.parse(content) : [];

for (const program of programs) {
  if (String(program.enable_auto) !== "true") continue;

  const updated = await hasUpdated(program.calendar_id_list ?? [], etags);
  if (!updated) continue;

  console.log(`実行: ${program.name}`);
  try {
    await executeBlockXml(program.block);
  } catch (e) {
    console.error(`エラー (${program.name}):`, e.message);
  }
}
