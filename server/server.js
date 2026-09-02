import "dotenv/config";
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { join, dirname } from "path";
import { existsSync } from "fs";

import authRoutes from "./routes/auth.js";
import calendarRoutes from "./routes/calendar.js";
import programRoutes from "./routes/programs.js";
import libraryRoutes from "./routes/library.js";
import aiRoutes from "./routes/ai.js";

const app = express();
const PORT = process.env.PORT ?? 4567;
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// APIルート(全て /api プレフィックス以下にマウント)
app.use("/api", authRoutes);
app.use("/api", calendarRoutes);
app.use("/api", programRoutes);
app.use("/api", libraryRoutes);
app.use("/api", aiRoutes);

// フロントエンドのstaticファイル配信
const distPath = join(__dirname, "../dist");
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Clockly server running on http://localhost:${PORT}`);
});