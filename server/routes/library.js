import { Router } from "express";
import { dbLoad, dbStore } from "../lib/db.js";

const router = Router();
const FILE = "library.json";

function loadLibrary() {
  return dbLoad(FILE) ?? { id: [], name: [], xml: [] };
}

router.get("/get_library", (req, res) => {
  res.json(loadLibrary());
});

router.post("/create_library", (req, res) => {
  const data = req.body;
  if (!data.name || !data.blockXml) {
    return res.status(400).json({ error: "無効なデータです" });
  }

  const library = loadLibrary();
  library.id.push(data.id);
  library.name.push(data.name);
  library.xml.push(data.blockXml);
  dbStore(FILE, library);
  res.status(201).json({ message: "ライブラリが追加されました" });
});

router.post("/delete_library", (req, res) => {
  const targetId = req.body; // 元実装が body 直接をIDとして受け取っていた形式を踏襲
  const library = loadLibrary();
  const index = library.id.indexOf(targetId);

  if (index === -1) {
    return res.status(404).json({ error: "削除対象が見つかりませんでした" });
  }

  library.id.splice(index, 1);
  library.name.splice(index, 1);
  library.xml.splice(index, 1);
  dbStore(FILE, library);
  res.json({ message: "削除に成功しました" });
});

export default router;