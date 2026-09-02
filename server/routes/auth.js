import { Router } from "express";
import { clearTokens, getAuthUrl, exchangeCodeForTokens, gFetch, loadTokens } from "../lib/googleClient.js";
import { loadSettings, saveSettings } from "../lib/settings.js";

const router = Router();

// Google OAuth認証URLを返す
// フロントエンドは ?redirect=http://localhost:5173/settings のように渡す
router.get("/authorize", (req, res) => {
  const redirectTo = req.query.redirect ?? "";
  const prompt = req.query.prompt ?? "select_account";
  res.json(getAuthUrl(redirectTo, prompt));
});

// OAuthコールバック: stateパラメータのURLにリダイレクトする
router.get("/auth/google_oauth2/callback", async (req, res) => {
  const { code, state } = req.query;
  if (!code) return res.status(400).json({ error: "code が見つかりません" });

  try {
    await exchangeCodeForTokens(code);
    const redirectTo = state && state.startsWith("http") ? state : "/";
    res.redirect(redirectTo);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "認証に失敗しました" });
  }
});

// 認証済みかどうかを返す
router.get("/auth-status", (req, res) => {
  const tokens = loadTokens();
  res.json({ authenticated: !!tokens });
});

router.get("/account", async (req, res) => {
  if (!loadTokens()) return res.status(401).json({ error: "未認証です。" });

  try {
    const account = await gFetch("https://www.googleapis.com/oauth2/v2/userinfo");
    res.json({
      email: account.email ?? "",
      name: account.name ?? "",
      picture: account.picture ?? "",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post("/logout", (req, res) => {
  clearTokens();
  res.sendStatus(200);
});

// カレンダーの編集権限を切り替える
router.post("/writable", (req, res) => {
  const { id, status } = req.body;
  const config = loadSettings();
  const list = config.writable_calendar_id ?? [];
  const updated = list.filter((cid) => cid !== id);
  if (status) updated.push(id);
  config.writable_calendar_id = updated;
  saveSettings(config);
  res.sendStatus(200);
});

router.get("/get_writable", (req, res) => {
  const config = loadSettings();
  res.json(config.writable_calendar_id ?? []);
});

export default router;
