import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Users, ClipboardList, Compass, Radar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/server/workspaces";
import { WorkspaceSummaryCard } from "@/components/dashboard/workspace-summary-card";
import { ComingSoonCard } from "@/components/dashboard/coming-soon-card";

export const metadata: Metadata = { title: "Dashboard — ThatAssistant" };

export default async function DashboardPage({
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

  const isFounder = workspace.product_mode === "founder";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {isFounder ? "Command Centre" : "Dashboard"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {isFounder
            ? "Your daily view of leads, follow-ups, and what needs attention."
            : "Your view across clients, delivery, and drafted work."}
        </p>
      </div>

      <WorkspaceSummaryCard workspace={workspace} />

      <div>
        <h2 className="text-sm font-medium text-muted-foreground">What&apos;s next</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {isFounder ? (
            <>
              <ComingSoonCard
                icon={Users}
                title="Contact & Lead Hub"
                description="Track leads, customers, and relationship stages, with last interaction and next follow-up."
                milestone="Milestone 2"
              />
              <ComingSoonCard
                icon={Radar}
                title="Follow-Up Operator"
                description="Overdue follow-ups, suggested next actions, and outputs awaiting your approval, all derived from real records."
                milestone="Milestone 4"
              />
            </>
          ) : (
            <>
              <ComingSoonCard
                icon={Users}
                title="Client Hub"
                description="Client profiles with brand voice, services, preferences, restrictions, and approval rules."
                milestone="Milestone 2"
              />
              <ComingSoonCard
                icon={ClipboardList}
                title="Delivery Board"
                description="Tasks by client with due dates, status, and the outputs attached to each one."
                milestone="Milestone 4"
              />
            </>
          )}
        </div>
      </div>

      <ComingSoonCard
        icon={Compass}
        title="AI Workbench"
        description="Run workflows against real stored context and review structured, approvable drafts — no automatic sending."
        milestone="Milestone 3"
      />
    </div>
  );
}
