import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";

import "../../src/core/blocks/registerBlocks.js";
import { gFetch } from "./googleClient.js";
import { loadSettings } from "./settings.js";

const BASE = "https://www.googleapis.com/calendar/v3";

export function generateJavaScriptFromBlockXml(blockXml) {
  const workspace = new Blockly.Workspace();
  try {
    const dom = Blockly.utils.xml.textToDom(blockXml);
    Blockly.Xml.domToWorkspace(dom, workspace);
    return javascriptGenerator.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

export function extractCalendarIdsFromBlockXml(blockXml) {
  try {
    const dom = Blockly.utils.xml.textToDom(blockXml);
    return [...dom.querySelectorAll('block[type="calendar"] field[name="id"]')]
      .map((field) => field.textContent?.trim())
      .filter(Boolean)
      .filter((id, index, list) => list.indexOf(id) === index);
  } catch {
    return [];
  }
}

function normalizeEvent(event) {
  if (!event || typeof event !== "object") return event;
  return {
    ...event,
    start: normalizeDateValue(event.start),
    end: normalizeDateValue(event.end),
  };
}

function normalizeDateValue(value) {
  if (!value || typeof value !== "object") return value;
  return {
    ...value,
    date_time: value.date_time ?? value.dateTime ?? value.date,
  };
}

function toGoogleEvent(event) {
  const startObj = {};
  const endObj = {};
  
  if (event.start?.date) {
    startObj.date = event.start.date;
  } else if (event.start?.dateTime || event.start?.date_time) {
    startObj.dateTime = event.start.dateTime ?? event.start.date_time;
  }
  
  if (event.end?.date) {
    endObj.date = event.end.date;
  } else if (event.end?.dateTime || event.end?.date_time) {
    endObj.dateTime = event.end.dateTime ?? event.end.date_time;
  }
  
  return {
    summary: event.summary,
    location: event.location,
    description: event.description,
    start: startObj,
    end: endObj,
  };
}

async function get_events(calendarId) {
  const encodedCalendarId = encodeURIComponent(calendarId);
  const events = [];
  let pageToken = undefined;

  do {
    const params = new URLSearchParams({
      singleEvents: "true",
      maxResults: "2500",
      showDeleted: "true",
      ...(pageToken ? { pageToken } : {}),
    });
    const data = await gFetch(`${BASE}/calendars/${encodedCalendarId}/events?${params}`);
    events.push(...(data.items ?? []).map(normalizeEvent));
    pageToken = data.nextPageToken;
  } while (pageToken);

  return events;
}

async function insert_event(events, calendarId) {
  const config = loadSettings();
  if (!config.writable_calendar_id?.includes(calendarId)) return;

  const list = Array.isArray(events) ? events : [events];
  for (const event of list) {
    if (!event || event.status === "cancelled") continue;
    await gFetch(`${BASE}/calendars/${encodeURIComponent(calendarId)}/events`, {
      method: "POST",
      body: JSON.stringify(toGoogleEvent(event)),
    });
  }
}

async function update_event(sourceEvents, targetEvents, calendarId) {
  const config = loadSettings();
  if (!config.writable_calendar_id?.includes(calendarId)) return;

  const sources = Array.isArray(sourceEvents) ? sourceEvents : (sourceEvents ? [sourceEvents] : []);
  const targets = Array.isArray(targetEvents) ? targetEvents : (targetEvents ? [targetEvents] : []);
  const encodedCalendarId = encodeURIComponent(calendarId);

  for (const source of sources) {
    const match = targets.find((target) => target.id === source.id);
    if (!match) {
      await gFetch(`${BASE}/calendars/${encodedCalendarId}/events`, {
        method: "POST",
        body: JSON.stringify(toGoogleEvent(source)),
      });
      continue;
    }

    const sourceUpdated = new Date(source.updated).getTime();
    const targetUpdated = new Date(match.updated).getTime();
    const targetCreated = new Date(match.created).getTime();
    if (match.status === "cancelled" || (sourceUpdated > targetUpdated && sourceUpdated > targetCreated)) {
      await gFetch(`${BASE}/calendars/${encodedCalendarId}/events/${encodeURIComponent(match.id)}`, {
        method: "PUT",
        body: JSON.stringify(toGoogleEvent(source)),
      });
    }
  }

  for (const target of targets) {
    if (!sources.find((source) => source.id === target.id)) {
      await gFetch(`${BASE}/calendars/${encodedCalendarId}/events/${encodeURIComponent(target.id)}`, {
        method: "DELETE",
      });
    }
  }
}

async function delete_event(events, calendarId) {
  const config = loadSettings();
  if (!config.writable_calendar_id?.includes(calendarId)) return;

  const list = Array.isArray(events) ? events : [events];
  for (const event of list) {
    if (!event?.id) continue;
    await gFetch(`${BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(event.id)}`, {
      method: "DELETE",
    });
  }
}

export function normalize_date(value) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const resolveNestedDate = (node, carry = {}) => {
    if (!node || typeof node !== "object") {
      return { type: "date", start: new Date(today), end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1) };
    }

    if (node.type === "year") {
      const year = Number(node.year ?? carry.year ?? today.getFullYear());
      if (node.month && typeof node.month === "object") {
        return resolveNestedDate(node.month, { ...carry, year, type: "year" });
      }
      return { type: "year", start: new Date(year, 0, 1), end: new Date(year + 1, 0, 1) };
    }

    if (node.type === "month") {
      const year = Number(node.year ?? carry.year ?? today.getFullYear());
      const month = Number(node.month ?? carry.month ?? today.getMonth() + 1);
      if (node.date && typeof node.date === "object") {
        return resolveNestedDate(node.date, { ...carry, year, month, type: "month" });
      }
      return {
        type: "month",
        start: new Date(year, month - 1, 1),
        end: new Date(year, month, 1),
      };
    }

    if (node.type === "date") {
      const year = Number(node.year ?? carry.year ?? today.getFullYear());
      const month = Number(node.month ?? carry.month ?? today.getMonth() + 1);
      const day = Number(node.day ?? node.date ?? carry.day ?? 1);
      return {
        type: "date",
        start: new Date(year, month - 1, day),
        end: new Date(year, month - 1, day + 1),
      };
    }

    return normalize_date(node);
  };

  switch (value.type) {
    case "relative_date": {
      const start = new Date(today);
      if (value.unit === "tomorrow") start.setDate(start.getDate() + 1);
      if (value.unit === "yesterday") start.setDate(start.getDate() - 1);
      return { start, end: new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1) };
    }
    case "relative_year": {
      const year = value.unit === "this_year"
        ? today.getFullYear()
        : value.unit === "next_year"
          ? today.getFullYear() + 1
          : value.unit === "last_year"
            ? today.getFullYear() - 1
            : Number(value.unit);
      return { type: "year", start: new Date(year, 0, 1), end: new Date(year + 1, 0, 1) };
    }
    case "relative_month": {
      const year = today.getFullYear();
      const month = value.unit === "this_month"
        ? today.getMonth() + 1
        : value.unit === "next_month"
          ? today.getMonth() === 11 ? 1 : today.getMonth() + 2
          : value.unit === "last_month"
            ? today.getMonth() === 0 ? 12 : today.getMonth()
            : Number(value.unit);
      const yearValue = value.unit === "next_month" && today.getMonth() === 11
        ? today.getFullYear() + 1
        : value.unit === "last_month" && today.getMonth() === 0
          ? today.getFullYear() - 1
          : today.getFullYear();
      return { type: "month", start: new Date(yearValue, month - 1, 1), end: new Date(yearValue, month, 1) };
    }
    case "relative_week": {
      const offset = value.unit === "next_week" ? 7 : value.unit === "last_week" ? -7 : 0;
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay() + offset);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      return { type: "week", start, end };
    }
    case "year": {
      if (value.month && typeof value.month === "object") {
        return resolveNestedDate(value.month, { year: Number(value.year), type: "year" });
      }
      return { type: "year", start: new Date(Number(value.year), 0, 1), end: new Date(Number(value.year) + 1, 0, 1) };
    }
    case "month": {
      const year = Number(value.year || today.getFullYear());
      const month = Number(value.month || today.getMonth() + 1);
      if (value.date && typeof value.date === "object") {
        return resolveNestedDate(value.date, { year, month, type: "month" });
      }
      return {
        type: "month",
        start: new Date(year, month - 1, 1),
        end: new Date(year, month, 1),
      };
    }
    case "date": {
      const year = Number(value.year || today.getFullYear());
      const month = Number(value.month || today.getMonth() + 1);
      const day = Number(value.day || 1);
      return {
        type: "date",
        start: new Date(year, month - 1, day),
        end: new Date(year, month - 1, day + 1),
      };
    }
    case "day": {
      const target = new Date(today);
      const diff = (Number(value.weekday) - target.getDay() + 7) % 7;
      target.setDate(target.getDate() + diff);
      return { type: "day", start: target, end: new Date(target.getFullYear(), target.getMonth(), target.getDate() + 1) };
    }
    default:
      return normaliseLegacyDateValue(value);
  }
}

function date_match(eventDateValue, dateCondition, operator) {
  const eventDate = new Date(eventDateValue?.date_time ?? eventDateValue?.dateTime ?? eventDateValue?.date);
  const start = dateCondition.start;
  const end = dateCondition.end;
  if (!start || Number.isNaN(eventDate.getTime())) return false;

  if (!end || Number.isNaN(end.getTime())) {
    switch (operator) {
      case "==":
        return (
          eventDate.getFullYear() === start.getFullYear() &&
          eventDate.getMonth() === start.getMonth() &&
          eventDate.getDate() === start.getDate()
        );
      case "<=": {
        const nextDay = new Date(start);
        nextDay.setDate(start.getDate() + 1);
        return eventDate <= nextDay;
      }
      case ">=":
        return eventDate >= start;
      default:
        return false;
    }
  }

  // day が undefined または NaN の場合は期間チェックのみ
  if (dateCondition.day === undefined || Number.isNaN(dateCondition.day)) {
    return eventDate >= start && eventDate < end;
  }

  // day が指定されている場合は曜日もチェック
  return eventDate >= start && eventDate < end && eventDate.getDay() === dateCondition.day;
}

function time_match(eventDateValue, time, operator) {
  const eventDate = new Date(eventDateValue?.date_time ?? eventDateValue?.dateTime ?? eventDateValue?.date);
  if (Number.isNaN(eventDate.getTime())) return false;

  const eventTime = eventDate.getHours() * 60 + eventDate.getMinutes();
  const targetTime = Number(time);
  switch (operator) {
    case "==":
      return eventTime === targetTime;
    case "<=":
      return eventTime <= targetTime;
    case ">=":
      return eventTime >= targetTime;
    default:
      return false;
  }
}

function print(value) {
  console.log(Array.isArray(value) ? value.map((event) => event.summary ?? event).join("\n") : value);
}

function move(oldDate, newDate) {
  return { oldDate, newDate };
}

export async function executeRuleJavaScript(jsCode) {
  const fn = new Function(
    "get_events",
    "insert_event",
    "update_event",
    "delete_event",
    "print",
    "normalize_date",
    "date_match",
    "time_match",
    "move",
    `"use strict"; return (async () => { ${jsCode} })();`
  );

  await fn(
    get_events,
    insert_event,
    update_event,
    delete_event,
    print,
    normalize_date,
    date_match,
    time_match,
    move
  );
}

export async function executeBlockXml(blockXml) {
  const jsCode = generateJavaScriptFromBlockXml(blockXml);
  await executeRuleJavaScript(jsCode);
  return { jsCode };
}
