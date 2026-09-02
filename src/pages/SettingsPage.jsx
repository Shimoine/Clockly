import { CalendarCheck2, Eye, Pencil } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useCalendarSettings } from "@/hooks/useCalendarSettings";
import { useGoogleAccount } from "@/hooks/useGoogleAccount";
import CalendarSettingsCard from "@/components/settings/CalendarSettingsCard";
import GoogleAuthCard from "@/components/settings/GoogleAuthCard";
import GoogleAccountMenu from "@/components/settings/GoogleAccountMenu";

export default function SettingsPage() {
  const { account, isAuthenticated, login, logout } = useGoogleAccount();
  const {
    calendars,
    loading,
    selectedCalendars,
    toggleCalendar,
    updateWritable,
  } = useCalendarSettings();
  const writableCount = calendars.filter((calendar) => calendar.writable).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">設定</h1>
          <p className="text-sm text-muted-foreground">
            Google Calendar連携と表示・編集対象のカレンダーを管理します。
          </p>
        </div>

        {isAuthenticated && (
          <GoogleAccountMenu
            account={account}
            onLogout={logout}
          />
        )}
      </div>

      {!isAuthenticated && (
        <GoogleAuthCard onAuthenticate={login} />
      )}

      {isAuthenticated && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Card size="sm">
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">カレンダー数</p>
                  <p className="text-2xl font-semibold">{calendars.length}</p>
                </div>
                <CalendarCheck2 className="size-5 text-muted-foreground" />
              </CardContent>
            </Card>
            <Card size="sm">
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">表示対象</p>
                  <p className="text-2xl font-semibold">{selectedCalendars.length}</p>
                </div>
                <Eye className="size-5 text-muted-foreground" />
              </CardContent>
            </Card>
            <Card size="sm">
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">編集可能</p>
                  <p className="text-2xl font-semibold">{writableCount}</p>
                </div>
                <Pencil className="size-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </div>

          <CalendarSettingsCard
            calendars={calendars}
            loading={loading}
            selectedCalendars={selectedCalendars}
            onToggleCalendar={toggleCalendar}
            onWritableChange={updateWritable}
          />
        </>
      )}
    </div>
  );
}
