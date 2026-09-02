import { getCalendarEvents } from "@/lib/api";
import "temporal-polyfill/global";

/**
 * カレンダーイベントをTTL付きでキャッシュするモジュール。
 * CalendarPageがマウントされるたびにAPIを叩くのを防ぐ。
 * カレンダーIDごとにキャッシュを管理する。
 */

const TTL_MS = 3 * 60 * 1000; // 3分

// { calendarId: { data: [...], cachedAt: timestamp, calendar: { ... } } }
const cache = {};
const fetchPromises = {};

const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

function isCacheValid(calendarId) {
  const entry = cache[calendarId];
  return entry && Date.now() - entry.cachedAt < TTL_MS;
}

function toCalendarCacheEntry(calendar) {
  if (!calendar?.id) return null;
  return {
    id: calendar.id,
    summary: calendar.summary ?? "",
    backgroundColor: calendar.backgroundColor ?? null,
    foregroundColor: calendar.foregroundColor ?? null,
  };
}

function primeCalendarColorCache(calendars) {
  calendars.forEach((calendar) => {
    const calendarEntry = toCalendarCacheEntry(calendar);
    if (!calendarEntry) return;
    cache[calendarEntry.id] = {
      data: cache[calendarEntry.id]?.data ?? [],
      cachedAt: cache[calendarEntry.id]?.cachedAt ?? 0,
      calendar: calendarEntry,
    };
  });
}

function toScheduleXStart(googleStart) {
  if (!googleStart) return null;
  if (googleStart.date) return Temporal.PlainDate.from(googleStart.date);
  const iso = googleStart.date_time ?? googleStart.dateTime;
  if (!iso) return null;
  return Temporal.Instant.from(iso).toZonedDateTimeISO(TIMEZONE);
}

function toScheduleXEnd(googleEnd, isAllDay) {
  if (!googleEnd) return null;
  if (googleEnd.date) {
    const end = Temporal.PlainDate.from(googleEnd.date);
    return isAllDay ? end.subtract({ days: 1 }) : end;
  }
  const iso = googleEnd.date_time ?? googleEnd.dateTime;
  if (!iso) return null;
  return Temporal.Instant.from(iso).toZonedDateTimeISO(TIMEZONE);
}

function keepMidnightEndOnPreviousDay(start, end) {
  if (!start || !end || end instanceof Temporal.PlainDate) return end;
  if (end.hour !== 0 || end.minute !== 0 || end.second !== 0 || end.millisecond !== 0) {
    return end;
  }

  const startDate = start instanceof Temporal.PlainDate ? start : start.toPlainDate();
  if (Temporal.PlainDate.compare(end.toPlainDate(), startDate) <= 0) return end;

  return end.subtract({ minutes: 1 });
}

function convertEvents(items, calendarId) {
  return items
    .filter((e) => e.status !== "cancelled")
    .flatMap((event) => {
      const isAllDay = Boolean(event.start?.date && event.end?.date);
      const start = toScheduleXStart(event.start);
      const end = keepMidnightEndOnPreviousDay(start, toScheduleXEnd(event.end, isAllDay));
      if (!start || !end) return [];
      return [{
        id: event.id,
        title: event.summary ?? "(タイトルなし)",
        start,
        end,
        calendarId,
        description: event.description ?? "",
        location: event.location ?? "",
        htmlLink: event.htmlLink ?? "",
      }];
    });
}

// 指定カレンダーのイベントをキャッシュ付きで取得する
async function fetchEvents(calendarId) {
  if (fetchPromises[calendarId]) return fetchPromises[calendarId];

  fetchPromises[calendarId] = getCalendarEvents(calendarId)
    .then((data) => {
      const events = convertEvents(data.items ?? [], calendarId);
      cache[calendarId] = {
        data: events,
        cachedAt: Date.now(),
        calendar: cache[calendarId]?.calendar ?? null,
      };
      fetchPromises[calendarId] = null;
      return events;
    })
    .catch((e) => {
      fetchPromises[calendarId] = null;
      throw e;
    });

  return fetchPromises[calendarId];
}

/**
 * 選択されたカレンダーのイベントをキャッシュ付きで取得する。
 *
 * @param {string[]} selectedCalendars
 * @param {(events: any[]) => void} onUpdate - イベント一覧が更新されたときのコールバック
 * @param {{id: string, summary?: string, backgroundColor?: string, foregroundColor?: string}[]} calendars
 */
export async function loadEvents(selectedCalendars, onUpdate, calendars = []) {
  primeCalendarColorCache(calendars);

  if (selectedCalendars.length === 0) {
    onUpdate([]);
    return;
  }

  // キャッシュがあるものは即座に返す
  const cached = selectedCalendars.flatMap((id) => cache[id]?.data ?? []);
  if (cached.length > 0) onUpdate(cached);

  // キャッシュ切れのものだけ再フェッチ
  const expired = selectedCalendars.filter((id) => !isCacheValid(id));
  if (expired.length === 0) return;

  const results = await Promise.allSettled(expired.map(fetchEvents));
  results
    .filter((r) => r.status === "rejected")
    .forEach((r) => console.error("カレンダーイベントの取得に失敗しました:", r.reason));

  // フェッチ完了後はキャッシュが全て最新なので、全選択カレンダーのキャッシュをまとめて通知
  const allEvents = selectedCalendars.flatMap((id) => cache[id]?.data ?? []);
  onUpdate(allEvents);
}

export function getCachedCalendarColor(calendarId) {
  return cache[calendarId]?.calendar ?? null;
}

export function getCachedCalendarColors() {
  return Object.fromEntries(
    Object.entries(cache)
      .filter(([, entry]) => entry.calendar)
      .map(([calendarId, entry]) => [calendarId, entry.calendar])
  );
}

// 強制的にキャッシュをクリアする
export function clearEventCache(calendarId) {
  if (calendarId) {
    delete cache[calendarId];
  } else {
    Object.keys(cache).forEach((k) => delete cache[k]);
  }
}
