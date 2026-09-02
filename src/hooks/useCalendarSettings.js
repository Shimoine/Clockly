import { useMemo, useState } from "react";

import { setCalendarWritable } from "@/lib/api";
import { useCalendarList } from "@/hooks/useCalendarList";
import { useSelectedCalendars } from "@/hooks/useSelectedCalendars";

export function useCalendarSettings() {
  const [writableOverrides, setWritableOverrides] = useState({});
  const { selectedCalendars, toggleCalendar } = useSelectedCalendars();
  const { calendars: calendarList, loading } = useCalendarList();

  const calendars = useMemo(
    () =>
      calendarList.map((calendar) => ({
        ...calendar,
        writable: writableOverrides[calendar.id] ?? calendar.writable,
      })),
    [calendarList, writableOverrides]
  );

  const updateWritable = async (calendarId, checked) => {
    const previousValue = calendars.find((calendar) => calendar.id === calendarId)?.writable ?? false;

    setWritableOverrides((prev) => ({ ...prev, [calendarId]: checked }));
    try {
      const res = await setCalendarWritable(calendarId, checked);
      if (!res.ok) throw new Error(`Failed to update writable calendar: ${res.status}`);
    } catch (error) {
      console.error(error);
      setWritableOverrides((prev) => ({ ...prev, [calendarId]: previousValue }));
    }
  };

  return {
    calendars,
    loading,
    selectedCalendars,
    toggleCalendar,
    updateWritable,
  };
}

export default useCalendarSettings;
