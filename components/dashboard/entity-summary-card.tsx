import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function EntitySummaryCard({
  icon: Icon,
  title,
  description,
  count,
  countLabel,
  href,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  count: number;
  countLabel: string;
  href: string;
}) {
  return (
    <Link href={href} className="block h-full">
      <Card className="h-full transition-colors hover:border-primary/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-foreground">{count}</p>
          <p className="text-sm text-muted-foreground">{countLabel}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
