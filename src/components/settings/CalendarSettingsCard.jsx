import { CalendarDays, Eye, Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function CalendarSettingsCard({
  calendars,
  loading,
  selectedCalendars,
  onToggleCalendar,
  onWritableChange,
}) {
  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex flex-col gap-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="size-4" />
            カレンダの設定
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            表示するカレンダーと、ルールから予定を書き込めるカレンダーを選択します。
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-12 animate-pulse rounded-lg bg-muted/60" />
            ))}
          </div>
        ) : calendars.length === 0 ? (
          <div className="flex min-h-32 items-center justify-center text-sm text-muted-foreground">
            カレンダーが見つかりませんでした。
          </div>
        ) : (
          <table className="w-full table-fixed border-collapse">
            <colgroup>
              <col className="w-20" />
              <col className="w-24" />
              <col />
              <col className="hidden w-48 md:table-column" />
            </colgroup>
            <thead>
              <tr className="border-b">
                <th className="px-2 py-2 text-center text-xs font-medium text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="size-3" />
                    表示
                  </span>
                </th>
                <th className="px-2 py-2 text-center text-xs font-medium text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Pencil className="size-3" />
                    編集
                  </span>
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground">カレンダ</th>
                <th className="hidden px-2 py-2 text-left text-xs font-medium text-muted-foreground md:table-cell">状態</th>
              </tr>
            </thead>
            <tbody>
              {calendars.map((calendar) => (
                <tr
                  key={calendar.id}
                  className="border-b last:border-b-0 hover:bg-muted/40"
                >
                  <td className="px-2 py-3 text-center">
                    <Switch
                      id={`show-${calendar.id}`}
                      checked={selectedCalendars.includes(calendar.id)}
                      onCheckedChange={(checked) => onToggleCalendar(calendar.id, !!checked)}
                    />
                  </td>
                  <td className="px-2 py-3 text-center">
                    <Switch
                      id={`writable-${calendar.id}`}
                      checked={calendar.writable}
                      onCheckedChange={(checked) => onWritableChange(calendar.id, !!checked)}
                    />
                  </td>
                  <td className="min-w-0 px-2 py-3">
                    <Label
                      htmlFor={`show-${calendar.id}`}
                      className="flex min-w-0 cursor-pointer items-center gap-2"
                    >
                      <span
                        className="size-3 shrink-0 rounded-full ring-1 ring-foreground/10"
                        style={{ backgroundColor: calendar.backgroundColor ?? "#64748b" }}
                      />
                      <span className="truncate">{calendar.summary}</span>
                    </Label>
                    <div className="mt-1 truncate text-xs text-muted-foreground md:hidden">
                      {calendar.id}
                    </div>
                  </td>
                  <td className="hidden px-2 py-3 md:table-cell">
                    <div className="flex min-h-6 flex-wrap items-center gap-1">
                      {selectedCalendars.includes(calendar.id) && (
                        <Badge
                          variant="outline"
                          className="w-14 justify-center border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/70 dark:bg-sky-950/50 dark:text-sky-300"
                        >
                          表示中
                        </Badge>
                      )}
                      {calendar.writable && (
                        <Badge
                          variant="outline"
                          className="w-18 justify-center border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/50 dark:text-emerald-300"
                        >
                          編集可能
                        </Badge>
                      )}
                      {!selectedCalendars.includes(calendar.id) && !calendar.writable && (
                        <Badge
                          variant="outline"
                          className="w-14 justify-center border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400"
                        >
                          未使用
                        </Badge>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
