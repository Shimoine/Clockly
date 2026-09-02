import { LogOut, UserCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function GoogleAccountMenu({ account, onLogout }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="size-12 cursor-pointer rounded-full">
          {account?.picture ? (
            <img
              src={account.picture}
              alt={account.email || "Google アカウント"}
              className="size-10 rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <UserCircle className="size-8" />
          )}
          <span className="sr-only">Google アカウント</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="flex items-center gap-3 border-b pb-3">
          {account?.picture ? (
            <img
              src={account.picture}
              alt={account.email || "Google アカウント"}
              className="size-10 rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <UserCircle className="size-10 text-muted-foreground" />
          )}
          <div className="min-w-0">
            <div className="truncate font-medium">{account?.name || "Google アカウント"}</div>
            <div className="truncate text-xs text-muted-foreground">{account?.email || "ログイン中"}</div>
          </div>
        </div>

        <div className="grid gap-1">
          <Button variant="ghost" className="justify-start gap-2" onClick={onLogout}>
            <LogOut className="size-4" />
            ログアウト
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
