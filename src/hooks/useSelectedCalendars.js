import { useEffect, useState } from "react";

const STORAGE_KEY = "selectedCalendars";

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

/**
 * 「カレンダーページに表示するカレンダー」の選択状態を扱うフック。
 * SettingsPage(選択するUI) と CalendarPage(選択結果を使う側) の
 * 両方から使うため、localStorageへの永続化込みでここに切り出した。
 */
export function useSelectedCalendars() {
  const [selectedCalendars, setSelectedCalendars] = useState(loadFromStorage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedCalendars));
  }, [selectedCalendars]);

  const toggleCalendar = (calendarId, checked) => {
    setSelectedCalendars((prev) =>
      checked
        ? [...prev, calendarId]
        : prev.filter((id) => id !== calendarId)
    );
  };

  return { selectedCalendars, setSelectedCalendars, toggleCalendar };
}

export default useSelectedCalendars;