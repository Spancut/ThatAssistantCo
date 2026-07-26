import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/server/workspaces";
import { getHumanValueEntryForOutput, getOutput, getWorkflowRun } from "@/lib/server/ai-workflows";
import {
  approveOutputAction,
  rejectOutputAction,
  saveHumanValueEntryAction,
} from "@/app/[orgSlug]/outputs/actions";
import { OutputReviewForm } from "@/components/ai/output-review-form";
import { HumanValueForm } from "@/components/ai/human-value-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { OutputStatus } from "@/lib/types/database";

export const metadata: Metadata = { title: "Review draft — ThatAssistant" };

const STATUS_LABELS: Record<OutputStatus, string> = {
  draft: "Awaiting review",
  approved: "Approved",
  edited_and_approved: "Edited & approved",
  rejected: "Rejected",
};

export default async function OutputReviewPage({
  params,
}: {
  params: Promise<{ orgSlug: string; outputId: string }>;
}) {
  const { orgSlug, outputId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const workspace = await getWorkspaceBySlug(supabase, orgSlug, user.id);
  if (!workspace) notFound();

  const output = await getOutput(supabase, workspace.id, outputId);
  if (!output) notFound();

  const run = await getWorkflowRun(supabase, workspace.id, output.workflow_run_id);
  const sourceName =
    run && typeof run.input_snapshot === "object" && run.input_snapshot !== null
      ? ((run.input_snapshot as { context?: { sourceName?: string } }).context?.sourceName ?? null)
      : null;

  const structured = output.structured_content as { subject?: string };
  const isPending = output.status === "draft";

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <Link
          href={`/${orgSlug}/dashboard`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {structured.subject || "Draft"}
          </h1>
          <Badge variant={isPending ? "secondary" : output.status === "rejected" ? "destructive" : "outline"}>
            {STATUS_LABELS[output.status]}
          </Badge>
        </div>
        {sourceName ? <p className="mt-1 text-sm text-muted-foreground">Drafted for {sourceName}</p> : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{isPending ? "Review draft" : "Final text"}</CardTitle>
          {!isPending ? (
            <CardDescription>
              Reviewed — nothing was sent anywhere automatically. Copy this text into your own email
              tool.
            </CardDescription>
          ) : (
            <CardDescription>
              Edit anything before approving. Approving only marks this reviewed — it doesn&apos;t send
              it.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {isPending ? (
            <OutputReviewForm
              output={output}
              approveAction={approveOutputAction.bind(null, orgSlug, outputId)}
              rejectAction={rejectOutputAction.bind(null, orgSlug, outputId)}
            />
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">{structured.subject}</p>
              <p className="whitespace-pre-wrap text-sm text-foreground">{output.draft_content}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {workspace.product_mode === "partner" && !isPending ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Human value</CardTitle>
            <CardDescription>
              What you added beyond the draft — this is what makes the work yours, not just the AI&apos;s.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HumanValueForm
              action={saveHumanValueEntryAction.bind(null, orgSlug, outputId)}
              existing={await getHumanValueEntryForOutput(supabase, outputId)}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
