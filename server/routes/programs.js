import { Router } from "express";
import { dbLoad, dbStore } from "../lib/db.js";
import {
  executeBlockXml,
  extractCalendarIdsFromBlockXml,
  generateJavaScriptFromBlockXml,
} from "../lib/ruleEngine.js";

const router = Router();
const FILE = "program-repository.json";

function loadPrograms() {
  return dbLoad(FILE) ?? [];
}

function normalizeProgramPayload(data) {
  const blockXml = data.blockXml ?? data.block ?? "";
  return {
    id: data.id,
    name: data.name,
    block: blockXml,
    calendar_id_list: extractCalendarIdsFromBlockXml(blockXml),
    enable_auto: String(data.enable_auto ?? false),
  };
}

// 一覧取得 or 1件取得
router.get("/programs/:id?", (req, res) => {
  const programs = loadPrograms();
  if (!req.params.id) return res.json(programs);

  const found = programs.find((p) => p.id === req.params.id);
  if (!found) return res.status(404).json({ error: "見つかりませんでした" });
  res.json(found);
});

// 新規作成
router.post("/create_program", (req, res) => {
  const data = req.body;
  const programs = loadPrograms();
  programs.unshift(normalizeProgramPayload(data));
  dbStore(FILE, programs);
  res.sendStatus(201);
});

// 更新(idが一致するものを差し替える)
router.post("/update_program", (req, res) => {
  const data = req.body;
  let programs = loadPrograms();
  programs = programs.filter((p) => p.id !== data.id);
  programs.unshift(normalizeProgramPayload(data));
  dbStore(FILE, programs);
  res.sendStatus(200);
});

router.post("/execute_program", async (req, res) => {
  try {
    const { id, blockXml } = req.body;
    const program = id ? loadPrograms().find((p) => p.id === id) : null;
    const xml = blockXml ?? program?.block;

    if (!xml) {
      return res.status(400).json({ error: "実行するブロックXMLがありません" });
    }

    const result = await executeBlockXml(xml);
    res.json({ ok: true, ...result });
  } catch (e) {
    console.error("ルール実行に失敗しました:", e);
    res.status(500).json({ error: e.message });
  }
});

router.post("/generate_program_code", (req, res) => {
  try {
    const { blockXml } = req.body;
    if (!blockXml) {
      return res.status(400).json({ error: "変換するブロックXMLがありません" });
    }

    res.json({ jsCode: generateJavaScriptFromBlockXml(blockXml) });
  } catch (e) {
    console.error("JavaScript生成に失敗しました:", e);
    res.status(500).json({ error: e.message });
  }
});

// 削除
router.post("/delete_program", (req, res) => {
  const { id } = req.body;
  let programs = loadPrograms();
  const before = programs.length;
  programs = programs.filter((p) => p.id !== id);

  if (programs.length === before) {
    return res.status(404).json({ error: "削除対象が見つかりませんでした" });
  }
  dbStore(FILE, programs);
  res.json({ message: "削除に成功しました" });
});

export default router;
