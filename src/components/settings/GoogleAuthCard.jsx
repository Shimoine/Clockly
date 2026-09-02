import { CalendarDays } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function GoogleAuthCard({ onAuthenticate }) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="size-4" />
          カレンダ認証
        </CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-40 flex-col items-start justify-center gap-3">
        <div>
          <p className="font-medium">Google Calendarと連携してください</p>
          <p className="text-sm text-muted-foreground">
            連携するとカレンダー一覧の表示、予定取得、ルール実行が使えるようになります。
          </p>
        </div>
        <Button onClick={onAuthenticate}>
          Google Calendar を認証
        </Button>
      </CardContent>
    </Card>
  );
}
