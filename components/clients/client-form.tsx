"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import {
  createClientAction,
  updateClientAction,
  type ClientFormState,
} from "@/app/[orgSlug]/clients/actions";
import type { ClientProfile } from "@/lib/server/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const initialState: ClientFormState = {};

function notesFrom(json: Record<string, unknown>): string {
  const notes = json?.notes;
  return typeof notes === "string" ? notes : "";
}

export function ClientForm({
  orgSlug,
  client,
}: {
  orgSlug: string;
  client?: ClientProfile;
}) {
  const action = client
    ? updateClientAction.bind(null, orgSlug, client.id)
    : createClientAction.bind(null, orgSlug);
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) toast.success("Client saved");
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="name">Client name</Label>
        <Input id="name" name="name" defaultValue={client?.name} required minLength={1} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="brandVoice">Brand voice</Label>
        <textarea
          id="brandVoice"
          name="brandVoice"
          defaultValue={client?.brand_voice ?? ""}
          rows={3}
          placeholder="How this client sounds — tone, phrases to use or avoid, formality level…"
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferencesNotes">Preferences</Label>
        <textarea
          id="preferencesNotes"
          name="preferencesNotes"
          defaultValue={client ? notesFrom(client.preferences) : ""}
          rows={3}
          placeholder="Working preferences, approval rules, recurring responsibilities…"
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="keyFactsNotes">Key facts</Label>
        <textarea
          id="keyFactsNotes"
          name="keyFactsNotes"
          defaultValue={client ? notesFrom(client.key_facts) : ""}
          rows={3}
          placeholder="Anything worth remembering about this client's business…"
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : client ? "Save changes" : "Add client"}
      </Button>
    </form>
  );
}
