"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import {
  createContactAction,
  updateContactAction,
  type ContactFormState,
} from "@/app/[orgSlug]/contacts/actions";
import type { Contact } from "@/lib/server/contacts";
import { PIPELINE_STAGES, PIPELINE_STAGE_LABELS } from "@/lib/validations/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const initialState: ContactFormState = {};

export function ContactForm({ orgSlug, contact }: { orgSlug: string; contact?: Contact }) {
  const action = contact
    ? updateContactAction.bind(null, orgSlug, contact.id)
    : createContactAction.bind(null, orgSlug);
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) toast.success("Contact saved");
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={contact?.name} required minLength={1} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input id="company" name="company" defaultValue={contact?.company ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pipelineStage">Pipeline stage</Label>
          <select
            id="pipelineStage"
            name="pipelineStage"
            defaultValue={contact?.pipeline_stage ?? "new"}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            {PIPELINE_STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {PIPELINE_STAGE_LABELS[stage]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={contact?.email ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={contact?.phone ?? ""} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="source">Source</Label>
        <Input
          id="source"
          name="source"
          defaultValue={contact?.source ?? ""}
          placeholder="e.g. Referral, website form, event"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          name="notes"
          defaultValue={contact?.notes ?? ""}
          rows={4}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : contact ? "Save changes" : "Add contact"}
      </Button>
    </form>
  );
}
