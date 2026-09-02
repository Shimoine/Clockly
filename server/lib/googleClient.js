import { readFileSync, writeFileSync, existsSync, unlinkSync } from "fs";

/**
 * googleapis(gaxios)がNode.js 26と相性が悪く "Premature close" を起こすため、
 * Google APIの呼び出しをすべてNode.js標準のfetchで直接実装している。
 */

const TOKEN_PATH = () => process.env.TOKEN_STORE_PATH ?? "./token_store.json";
const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
].join(" ");

export function loadTokens() {
  if (!existsSync(TOKEN_PATH())) return null;
  try { return JSON.parse(readFileSync(TOKEN_PATH(), "utf-8")); }
  catch { return null; }
}

export function saveTokens(tokens) {
  writeFileSync(TOKEN_PATH(), JSON.stringify(tokens, null, 2));
}

export function clearTokens() {
  if (existsSync(TOKEN_PATH())) unlinkSync(TOKEN_PATH());
}

// アクセストークンが期限切れなら refresh_token で更新する
async function getFreshAccessToken() {
  const tokens = loadTokens();
  if (!tokens) throw new Error("未認証です。先にGoogle Calendarを認証してください。");

  const expiryDate = tokens.expiry_date ?? 0;
  if (Date.now() < expiryDate - 60_000) {
    return tokens.access_token;
  }

  // リフレッシュ
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: tokens.refresh_token,
      grant_type: "refresh_token",
    }).toString(),
  });

  if (!res.ok) throw new Error(`トークンのリフレッシュに失敗しました: ${res.status}`);
  const refreshed = await res.json();
  const updated = {
    ...tokens,
    access_token: refreshed.access_token,
    expiry_date: Date.now() + refreshed.expires_in * 1000,
  };
  saveTokens(updated);
  return updated.access_token;
}

// 認証済みfetchヘルパー
export async function gFetch(url, options = {}) {
  const accessToken = await getFreshAccessToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google API エラー ${res.status}: ${text}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// 認証URL生成
export function getAuthUrl(redirectTo = "", prompt = "select_account") {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_CALLBACK_URL,
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",
    state: redirectTo,
  });
  if (prompt) params.set("prompt", prompt);
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

// 認証コード→トークン交換
export async function exchangeCodeForTokens(code) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL,
      grant_type: "authorization_code",
    }).toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`トークン取得失敗: ${res.status} ${text}`);
  }

  const tokens = await res.json();
  tokens.expiry_date = Date.now() + (tokens.expires_in ?? 3600) * 1000;
  saveTokens(tokens);
  return tokens;
}
