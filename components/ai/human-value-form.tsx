"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import type { HumanValueFormState } from "@/lib/validations/ai";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const initialState: HumanValueFormState = {};

const FIELDS = [
  { name: "contextAdded", key: "context_added", label: "Context you added" },
  { name: "judgmentApplied", key: "judgment_applied", label: "Judgment you applied" },
  { name: "preferenceConsidered", key: "preference_considered", label: "Preference you considered" },
  { name: "riskIdentified", key: "risk_identified", label: "Risk you identified" },
  { name: "recommendationMade", key: "recommendation_made", label: "Recommendation you made" },
  { name: "correctionsMade", key: "corrections_made", label: "Corrections you made" },
] as const;

type ExistingHumanValueEntry = {
  context_added: string | null;
  judgment_applied: string | null;
  preference_considered: string | null;
  risk_identified: string | null;
  recommendation_made: string | null;
  corrections_made: string | null;
} | null;

export function HumanValueForm({
  action,
  existing,
}: {
  action: (prevState: HumanValueFormState, formData: FormData) => Promise<HumanValueFormState>;
  existing: ExistingHumanValueEntry;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) toast.success("Saved");
  }, [state.success]);

  if (existing) {
    const filled = FIELDS.filter((f) => existing[f.key]);
    return (
      <div className="space-y-3">
        {filled.length === 0 ? (
          <p className="text-sm text-muted-foreground">No human value notes were added for this draft.</p>
        ) : (
          filled.map((f) => (
            <div key={f.name}>
              <p className="text-sm font-medium text-foreground">{f.label}</p>
              <p className="text-sm text-muted-foreground">{existing[f.key]}</p>
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      {FIELDS.map((f) => (
        <div key={f.name} className="space-y-2">
          <Label htmlFor={f.name}>{f.label}</Label>
          <textarea
            id={f.name}
            name={f.name}
            rows={2}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          />
        </div>
      ))}
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
