import { Router } from "express";
import { gFetch, loadTokens } from "../lib/googleClient.js";
import { loadSettings } from "../lib/settings.js";

const router = Router();
const BASE = "https://www.googleapis.com/calendar/v3";

function checkAuth(res) {
  if (!loadTokens()) {
    res.status(401).json({ error: "未認証です。先にGoogle Calendarを認証してください。" });
    return false;
  }
  return true;
}

// カレンダー一覧
router.get("/calendar_list", async (req, res) => {
  if (!checkAuth(res)) return;
  try {
    const config = loadSettings();
    const writableIds = config.writable_calendar_id ?? [];
    const data = await gFetch(`${BASE}/users/me/calendarList`);
    const list = (data.items ?? []).map((c) => ({
      summary: c.summary,
      id: c.id,
      writable: writableIds.includes(c.id),
      backgroundColor: c.backgroundColor ?? null,
      foregroundColor: c.foregroundColor ?? null,
    }));
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// 指定カレンダーの予定一覧(ページネーション対応)
router.get("/calendar/:id", async (req, res) => {
  if (!checkAuth(res)) return;
  try {
    const calendarId = encodeURIComponent(req.params.id);
    let events = [];
    let pageToken = undefined;
    let meta = {};

    do {
      const params = new URLSearchParams({
        singleEvents: "true",
        maxResults: "2500",
        showDeleted: "true",
        ...(pageToken ? { pageToken } : {}),
      });
      const data = await gFetch(`${BASE}/calendars/${calendarId}/events?${params}`);

      if (!pageToken) {
        meta = {
          access_role: data.accessRole,
          etag: data.etag,
          summary: data.summary,
        };
      }
      events = events.concat(data.items ?? []);
      pageToken = data.nextPageToken;
    } while (pageToken);

    res.json({ ...meta, items: events });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// 予定を新規作成
router.post("/insert_event", async (req, res) => {
  if (!checkAuth(res)) return;
  try {
    const { calendar_id, event } = req.body;
    const config = loadSettings();
    if (!config.writable_calendar_id?.includes(calendar_id)) {
      return res.status(403).json({ error: "このカレンダーへの書き込み権限がありません" });
    }
    const calendarId = encodeURIComponent(calendar_id);
    await gFetch(`${BASE}/calendars/${calendarId}/events`, {
      method: "POST",
      body: JSON.stringify({
        summary: event.summary,
        location: event.location,
        description: event.description,
        start: { date: event.start?.date, dateTime: event.start?.date_time },
        end: { date: event.end?.date, dateTime: event.end?.date_time },
      }),
    });
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// 予定を更新
router.post("/update_event", async (req, res) => {
  if (!checkAuth(res)) return;
  try {
    const { calendar_id, event_id, event } = req.body;
    const config = loadSettings();
    if (!config.writable_calendar_id?.includes(calendar_id)) {
      return res.status(403).json({ error: "このカレンダーへの書き込み権限がありません" });
    }
    const calendarId = encodeURIComponent(calendar_id);
    const eventId = encodeURIComponent(event_id);
    await gFetch(`${BASE}/calendars/${calendarId}/events/${eventId}`, {
      method: "PUT",
      body: JSON.stringify({
        id: event.id,
        summary: event.summary,
        location: event.location,
        start: { date: event.start?.date, dateTime: event.start?.date_time },
        end: { date: event.end?.date, dateTime: event.end?.date_time },
      }),
    });
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// 予定を削除
router.post("/delete_event", async (req, res) => {
  if (!checkAuth(res)) return;
  try {
    const { calendar_id, event_id } = req.body;
    const config = loadSettings();
    if (!config.writable_calendar_id?.includes(calendar_id)) {
      return res.status(403).json({ error: "このカレンダーへの書き込み権限がありません" });
    }
    const calendarId = encodeURIComponent(calendar_id);
    const eventId = encodeURIComponent(event_id);
    await gFetch(`${BASE}/calendars/${calendarId}/events/${eventId}`, {
      method: "DELETE",
    });
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;