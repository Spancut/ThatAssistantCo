"use client";

import { useActionState, useState } from "react";
import { createWorkspaceAction, type CreateWorkspaceState } from "@/app/onboarding/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const initialState: CreateWorkspaceState = {};

const PRODUCTS = [
  {
    value: "partner" as const,
    title: "ThatAssistant Partner",
    description:
      "For consultants and agencies delivering ongoing work for clients: a Client Hub, delivery tracking, and drafts in each client's voice.",
  },
  {
    value: "founder" as const,
    title: "ThatAssistant Founder",
    description:
      "For small business owners: a Contact & Lead Hub, daily command centre, and follow-up drafts ready for your review.",
  },
];

export function CreateWorkspaceForm() {
  const [state, formAction, isPending] = useActionState(createWorkspaceAction, initialState);
  const [productMode, setProductMode] = useState<"partner" | "founder">("partner");

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="name">Workspace name</Label>
        <Input id="name" name="name" placeholder="e.g. Acme Consulting" required minLength={2} />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">Choose your product</legend>
        <input type="hidden" name="productMode" value={productMode} />
        <div className="grid gap-3 sm:grid-cols-2">
          {PRODUCTS.map((product) => (
            <label
              key={product.value}
              className={cn(
                "cursor-pointer rounded-lg border bg-card p-4 transition-colors",
                productMode === product.value
                  ? "border-primary ring-1 ring-primary"
                  : "border-border hover:border-primary/50"
              )}
            >
              <input
                type="radio"
                name="productModeChoice"
                value={product.value}
                checked={productMode === product.value}
                onChange={() => setProductMode(product.value)}
                className="sr-only"
              />
              <div className="font-medium text-foreground">{product.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{product.description}</p>
            </label>
          ))}
        </div>
      </fieldset>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating workspace…" : "Create workspace"}
      </Button>
    </form>
  );
}
