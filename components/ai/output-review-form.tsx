"use client";

import { useActionState } from "react";
import type { Output } from "@/lib/server/ai-workflows";
import type { ReviewFormState } from "@/lib/validations/ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const initialState: ReviewFormState = {};

type StructuredDraftEmail = {
  subject?: string;
  body?: string;
  tone_notes?: string;
  context_sources_used?: string[];
  confidence_flag?: "high" | "medium" | "low";
};

export function OutputReviewForm({
  output,
  approveAction,
  rejectAction,
}: {
  output: Output;
  approveAction: (prevState: ReviewFormState, formData: FormData) => Promise<ReviewFormState>;
  rejectAction: (prevState: ReviewFormState, formData: FormData) => Promise<ReviewFormState>;
}) {
  const structured = output.structured_content as StructuredDraftEmail;

  const [approveState, approveFormAction, isApproving] = useActionState(approveAction, initialState);
  const [rejectState, rejectFormAction, isRejecting] = useActionState(rejectAction, initialState);

  const error = approveState.error || rejectState.error;
  const isPending = isApproving || isRejecting;

  return (
    <div className="space-y-4">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span>Confidence:</span>
        <Badge
          variant={structured.confidence_flag === "low" ? "destructive" : "secondary"}
          className="capitalize"
        >
          {structured.confidence_flag ?? "unknown"}
        </Badge>
      </div>

      {structured.tone_notes ? (
        <p className="rounded-md border border-dashed border-border bg-muted/40 p-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Tone notes: </span>
          {structured.tone_notes}
        </p>
      ) : null}

      {structured.context_sources_used && structured.context_sources_used.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span>Used:</span>
          {structured.context_sources_used.map((source) => (
            <Badge key={source} variant="outline" className="text-xs">
              {source}
            </Badge>
          ))}
        </div>
      ) : null}

      <form id="review-form" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            name="subject"
            form="review-form"
            defaultValue={structured.subject ?? ""}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="body">Body</Label>
          <textarea
            id="body"
            name="body"
            form="review-form"
            rows={12}
            defaultValue={structured.body ?? output.draft_content}
            required
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" formAction={approveFormAction} disabled={isPending}>
            {isApproving ? "Approving…" : "Approve"}
          </Button>
          <Button type="submit" formAction={rejectFormAction} variant="ghost" disabled={isPending}>
            {isRejecting ? "Rejecting…" : "Reject"}
          </Button>
        </div>
      </form>
    </div>
  );
}
