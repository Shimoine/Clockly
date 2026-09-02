import "temporal-polyfill/global";

import { hashToColor } from "@/lib/calendarColors";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function isPlainDate(value) {
  return value instanceof Temporal.PlainDate;
}

function formatDateTime(value) {
  if (!value) return "";
  if (isPlainDate(value)) {
    return value.toLocaleString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  }

  return value.toLocaleString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EventDetailDialog({ event, calendars, open, onOpenChange }) {
  const calendar = calendars.find((item) => item.id === event?.calendarId);
  const calendarColor = calendar?.backgroundColor ?? (event?.calendarId ? hashToColor(event.calendarId) : "#64748b");
  const isAllDay = event?.start && event?.end && isPlainDate(event.start) && isPlainDate(event.end);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="pr-8 text-lg leading-6">{event?.title ?? "予定"}</DialogTitle>
          <DialogDescription>
            {isAllDay ? "終日" : "予定の詳細"}
          </DialogDescription>
        </DialogHeader>

        {event && (
          <div className="grid gap-3 text-sm">
            <div className="grid grid-cols-[72px_1fr] gap-3">
              <div className="text-muted-foreground">日時</div>
              <div>
                {formatDateTime(event.start)}
                <span className="mx-1 text-muted-foreground">-</span>
                {formatDateTime(event.end)}
              </div>
            </div>

            <div className="grid grid-cols-[72px_1fr] gap-3">
              <div className="text-muted-foreground">カレンダ</div>
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: calendarColor }}
                />
                <span className="truncate">{calendar?.summary ?? event.calendarId}</span>
              </div>
            </div>

            {event.location && (
              <div className="grid grid-cols-[72px_1fr] gap-3">
                <div className="text-muted-foreground">場所</div>
                <div className="whitespace-pre-wrap break-words">{event.location}</div>
              </div>
            )}

            {event.description && (
              <div className="grid grid-cols-[72px_1fr] gap-3">
                <div className="text-muted-foreground">説明</div>
                <div className="max-h-48 overflow-auto whitespace-pre-wrap break-words">
                  {event.description}
                </div>
              </div>
            )}

            {event.htmlLink && (
              <div className="grid grid-cols-[72px_1fr] gap-3">
                <div className="text-muted-foreground">リンク</div>
                <a
                  className="w-fit text-primary underline underline-offset-4"
                  href={event.htmlLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  Google Calendarで開く
                </a>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
