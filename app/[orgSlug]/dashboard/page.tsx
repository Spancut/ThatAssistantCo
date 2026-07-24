import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Users, ClipboardList, Compass, Radar, Contact } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/server/workspaces";
import { countActiveClientProfiles } from "@/lib/server/clients";
import { countContacts } from "@/lib/server/contacts";
import { WorkspaceSummaryCard } from "@/components/dashboard/workspace-summary-card";
import { ComingSoonCard } from "@/components/dashboard/coming-soon-card";
import { EntitySummaryCard } from "@/components/dashboard/entity-summary-card";

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
  const entityCount = isFounder
    ? await countContacts(supabase, workspace.id)
    : await countActiveClientProfiles(supabase, workspace.id);

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
              <EntitySummaryCard
                icon={Contact}
                title="Contact & Lead Hub"
                description="Track leads, customers, and relationship stages."
                count={entityCount}
                countLabel={entityCount === 1 ? "contact" : "contacts"}
                href={`/${orgSlug}/contacts`}
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
              <EntitySummaryCard
                icon={Users}
                title="Client Hub"
                description="Client profiles with brand voice, preferences, and key facts."
                count={entityCount}
                countLabel={entityCount === 1 ? "client" : "clients"}
                href={`/${orgSlug}/clients`}
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
