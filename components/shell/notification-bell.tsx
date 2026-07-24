"use client";

import { useState, useTransition } from "react";
import { Bell } from "lucide-react";
import { markNotificationReadAction } from "@/app/[orgSlug]/notifications-actions";
import type { NotificationRow } from "@/lib/server/notifications";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TYPE_LABELS: Record<string, string> = {
  "workspace.created": "Workspace created",
};

function labelFor(type: string): string {
  return TYPE_LABELS[type] ?? type.replace(/[._]/g, " ");
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function NotificationBell({
  initialNotifications,
  initialUnreadCount,
}: {
  initialNotifications: NotificationRow[];
  initialUnreadCount: number;
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [, startTransition] = useTransition();

  function handleSelect(notification: NotificationRow) {
    if (notification.read_at) return;

    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n))
    );
    setUnreadCount((prev) => Math.max(prev - 1, 0));

    startTransition(() => {
      markNotificationReadAction(notification.id);
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative rounded-full p-1.5 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring">
        <Bell className="size-4 text-muted-foreground" />
        {unreadCount > 0 ? (
          <Badge className="absolute -right-1 -top-1 flex size-4 min-w-4 items-center justify-center rounded-full p-0 text-[10px]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        ) : null}
        <span className="sr-only">Notifications ({unreadCount} unread)</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="px-1.5 py-3 text-center text-sm text-muted-foreground">
            Nothing yet.
          </p>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              onClick={() => handleSelect(notification)}
              className="flex flex-col items-start gap-0.5 whitespace-normal"
            >
              <span className="flex w-full items-center gap-1.5 font-medium text-foreground">
                {!notification.read_at ? (
                  <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                ) : null}
                {labelFor(notification.type)}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatTimestamp(notification.created_at)}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
