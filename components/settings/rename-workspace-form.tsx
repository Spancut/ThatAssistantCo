"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { renameWorkspaceAction, type RenameWorkspaceState } from "@/app/[orgSlug]/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const initialState: RenameWorkspaceState = {};

export function RenameWorkspaceForm({
  orgId,
  orgSlug,
  currentName,
  canRename,
}: {
  orgId: string;
  orgSlug: string;
  currentName: string;
  canRename: boolean;
}) {
  const action = renameWorkspaceAction.bind(null, orgId, orgSlug);
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.updatedAt) {
      toast.success("Workspace renamed");
    }
  }, [state.updatedAt]);

  if (!canRename) {
    return (
      <div className="space-y-2">
        <Label>Workspace name</Label>
        <p className="text-sm text-foreground">{currentName}</p>
        <p className="text-sm text-muted-foreground">
          Only workspace owners and admins can rename the workspace.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="name">Workspace name</Label>
        <div className="flex gap-2">
          <Input id="name" name="name" defaultValue={currentName} required minLength={2} />
          <Button type="submit" disabled={isPending} className="shrink-0">
            {isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </form>
  );
}
