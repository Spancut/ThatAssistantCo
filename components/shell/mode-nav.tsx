"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Compass, Settings } from "lucide-react";
import type { ProductMode } from "@/lib/types/database";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
};

function navItemsFor(orgSlug: string, productMode: ProductMode): NavItem[] {
  const overview: NavItem =
    productMode === "founder"
      ? { label: "Command Centre", href: `/${orgSlug}/dashboard`, icon: Compass }
      : { label: "Dashboard", href: `/${orgSlug}/dashboard`, icon: LayoutDashboard };

  return [overview, { label: "Settings", href: `/${orgSlug}/settings`, icon: Settings }];
}

export function ModeNav({ orgSlug, productMode }: { orgSlug: string; productMode: ProductMode }) {
  const pathname = usePathname();
  const items = navItemsFor(orgSlug, productMode);

  return (
    <nav className="flex items-center gap-1">
      {items.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
