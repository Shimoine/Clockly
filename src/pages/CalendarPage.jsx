import { useEffect, useMemo, useState } from "react";
import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import {
  createViewDay,
  createViewWeek,
  createViewMonthGrid,
  createViewMonthAgenda,
} from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import "@schedule-x/theme-shadcn/dist/index.css";
import "temporal-polyfill/global";

import { hashToColor } from "@/lib/calendarColors";
import { useSelectedCalendars } from "@/hooks/useSelectedCalendars";
import { useCalendarList } from "@/hooks/useCalendarList";
import { getCachedCalendarColors, loadEvents } from "@/hooks/useCalendarEvents";
import EventDetailDialog from "@/components/calendar/EventDetailDialog";

const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

function scheduleAfterPaint(callback) {
  let frameId = requestAnimationFrame(() => {
    frameId = requestAnimationFrame(callback);
  });

  return () => {
    cancelAnimationFrame(frameId);
  };
}

function scheduleIdleTask(callback) {
  if ("requestIdleCallback" in window) {
    const idleId = window.requestIdleCallback(callback, { timeout: 500 });
    return () => window.cancelIdleCallback(idleId);
  }

  const timeoutId = window.setTimeout(callback, 0);
  return () => window.clearTimeout(timeoutId);
}

function buildCalendarsConfig(calendars) {
  const config = {};
  calendars.forEach((calendar, index) => {
    // GoogleカレンダーのbackgroundColorがあればそれを使い、
    // なければhashToColorでフォールバック
    const color = calendar.backgroundColor ?? hashToColor(calendar.id);
    const onContainer = calendar.foregroundColor ?? "#ffffff";
    config[calendar.id] = {
      colorName: `cal${index}`,
      lightColors: {
        main: color,
        container: `${color}33`,
        onContainer,
      },
    };
  });
  return config;
}

function CalendarView({ calendars, selectedCalendars }) {
  const [eventsService] = useState(() => createEventsServicePlugin());
  const [selectedEvent, setSelectedEvent] = useState(null);

  // useMemoで計算することで、カレンダー一覧がキャッシュから即座に取れる場合は
  // 最初のレンダリングからcalendarsConfigが確定した状態になり、
  // Schedule-Xの二重初期化を防ぐ
  const calendarsConfig = useMemo(() => buildCalendarsConfig(calendars), [calendars]);

  const calendarApp = useCalendarApp({
    views: [
      createViewMonthGrid(),
      createViewWeek(),
      createViewDay(),
      createViewMonthAgenda(),
    ],
    defaultView: "month-grid",
    firstDayOfWeek: 7, // ISO曜日番号: 7 = 日曜始まり(0〜6ではなく1〜7)
    calendars: calendarsConfig,
    events: [],
    timezone: TIMEZONE,
    theme: "shadcn",
    plugins: [eventsService],
    callbacks: {
      onEventClick: (event) => setSelectedEvent(event),
    },
  });

  // eventsService.set()をrequestAnimationFrameで遅らせて、
  // ページの初回レンダリングを先に完了させてから大量のTemporalオブジェクトを処理する
  useEffect(() => {
    let cancelled = false;
    let cancelSetEvents = null;
    const cancelLoad = scheduleAfterPaint(() => {
      loadEvents(selectedCalendars, (events) => {
        if (cancelled) return;
        cancelSetEvents?.();
        cancelSetEvents = scheduleIdleTask(() => {
          if (!cancelled) eventsService.set(events);
        });
      }, calendars);
    });

    return () => {
      cancelled = true;
      cancelLoad();
      cancelSetEvents?.();
    };
  }, [selectedCalendars, eventsService, calendars]);

  return (
    <div style={{ height: "calc(100vh - 80px)", minHeight: 600 }}>
      <ScheduleXCalendar calendarApp={calendarApp} />
      <EventDetailDialog
        event={selectedEvent}
        calendars={calendars}
        open={Boolean(selectedEvent)}
        onOpenChange={(open) => {
          if (!open) setSelectedEvent(null);
        }}
      />
    </div>
  );
}

export default function CalendarPage() {
  const { selectedCalendars } = useSelectedCalendars();
  const { calendars, loading } = useCalendarList();
  const [canMountCalendar, setCanMountCalendar] = useState(false);
  const cachedCalendars = calendars.length > 0 ? [] : Object.values(getCachedCalendarColors());
  const calendarColors = calendars.length > 0 ? calendars : cachedCalendars;
  const hasCalendarColors = calendarColors.length > 0;
  const canPrepareCalendar = hasCalendarColors || !loading;

  useEffect(() => {
    if (!canPrepareCalendar) return;

    const cancel = scheduleAfterPaint(() => setCanMountCalendar(true));
    return cancel;
  }, [canPrepareCalendar]);

  if (!canPrepareCalendar || !canMountCalendar) {
    return <div style={{ height: "calc(100vh - 80px)", minHeight: 600 }} />;
  }

  return <CalendarView calendars={calendarColors} selectedCalendars={selectedCalendars} />;
}
