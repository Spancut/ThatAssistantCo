import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/server/workspaces";
import { getBillingSummary } from "@/lib/server/entitlements";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UsageList } from "@/components/settings/usage-list";

export const metadata: Metadata = { title: "Billing — ThatAssistant" };

const STATUS_VARIANT: Record<string, "secondary" | "destructive" | "outline"> = {
  active: "secondary",
  past_due: "destructive",
  canceled: "outline",
};

export default async function BillingPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const workspace = await getWorkspaceBySlug(supabase, orgSlug, user.id);
  if (!workspace) notFound();

  const billing = await getBillingSummary(supabase, workspace.id);
  if (!billing) notFound();

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <Link
          href={`/${workspace.slug}/settings`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Settings
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Billing</h1>
        <p className="mt-1 text-muted-foreground">
          Your current plan and usage this period. Upgrading and payment aren&apos;t available
          yet.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base capitalize">{billing.plan} plan</CardTitle>
            <Badge variant={STATUS_VARIANT[billing.status] ?? "outline"} className="capitalize">
              {billing.status.replace("_", " ")}
            </Badge>
          </div>
          <CardDescription>
            Every new workspace starts on a generous trial so nothing here blocks you.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usage this period</CardTitle>
          <CardDescription>Resets at the start of each calendar month (UTC).</CardDescription>
        </CardHeader>
        <CardContent>
          <Separator className="mb-1" />
          <UsageList features={billing.features} />
        </CardContent>
      </Card>
    </div>
  );
}
