import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WorkspaceSummary } from "@/lib/server/workspaces";

const roleLabels: Record<WorkspaceSummary["role"], string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  client_reviewer: "Client reviewer",
  certified_operator: "Certified operator",
};

export function WorkspaceSummaryCard({ workspace }: { workspace: WorkspaceSummary }) {
  const created = new Date(workspace.created_at);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Workspace</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-muted-foreground">Your role</dt>
          <dd className="mt-0.5 font-medium text-foreground">{roleLabels[workspace.role]}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Product</dt>
          <dd className="mt-0.5 font-medium capitalize text-foreground">
            {workspace.product_mode}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Created</dt>
          <dd className="mt-0.5 font-medium text-foreground">
            {created.toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </dd>
        </div>
      </CardContent>
    </Card>
  );
}
