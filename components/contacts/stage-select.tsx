"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { updateContactStageAction, type StageFormState } from "@/app/[orgSlug]/contacts/actions";
import { PIPELINE_STAGES, PIPELINE_STAGE_LABELS } from "@/lib/validations/contact";
import type { PipelineStage } from "@/lib/types/database";

const initialState: StageFormState = {};

export function StageSelect({
  orgSlug,
  contactId,
  contactName,
  currentStage,
}: {
  orgSlug: string;
  contactId: string;
  contactName: string;
  currentStage: PipelineStage;
}) {
  const action = updateContactStageAction.bind(null, orgSlug, contactId, currentStage);
  const [state, formAction] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  return (
    <form ref={formRef} action={formAction}>
      <select
        name="pipelineStage"
        defaultValue={currentStage}
        onChange={() => formRef.current?.requestSubmit()}
        aria-label={`Pipeline stage for ${contactName}`}
        className="w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
      >
        {PIPELINE_STAGES.map((stage) => (
          <option key={stage} value={stage}>
            {PIPELINE_STAGE_LABELS[stage]}
          </option>
        ))}
      </select>
    </form>
  );
}
