"use client";

import { useActionState } from "react";
import { Sparkles } from "lucide-react";
import type { DraftGenerationState } from "@/lib/validations/ai";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const initialState: DraftGenerationState = {};

export function DraftGeneratorForm({
  action,
  title,
  description,
  placeholder,
  buttonLabel,
  remaining,
}: {
  action: (prevState: DraftGenerationState, formData: FormData) => Promise<DraftGenerationState>;
  title: string;
  description: string;
  placeholder: string;
  buttonLabel: string;
  /** From checkEntitlement's `remaining` — null means unlimited. */
  remaining: number | null;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const blocked = remaining !== null && remaining <= 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-1.5 text-base font-medium text-foreground">
            <Sparkles className="size-4 text-muted-foreground" />
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">
          {remaining === null
            ? "Unlimited this month"
            : `${remaining} draft${remaining === 1 ? "" : "s"} remaining this month`}
        </span>
      </div>

      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <form action={formAction} className="space-y-3">
        <Label htmlFor="userPrompt" className="sr-only">
          {title}
        </Label>
        <textarea
          id="userPrompt"
          name="userPrompt"
          rows={3}
          required
          placeholder={placeholder}
          disabled={blocked}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <Button type="submit" disabled={isPending || blocked} size="sm">
          {isPending ? "Generating…" : blocked ? "Limit reached" : buttonLabel}
        </Button>
      </form>
    </div>
  );
}
