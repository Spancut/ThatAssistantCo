# AI Orchestration

## One service, not a multi-agent system

ThatAssistant uses a single, controlled AI orchestration service (`lib/ai/` — built in Milestone 3) rather than a multi-agent architecture. Each "workflow" (e.g. Partner's *Draft Client Email*, Founder's *Enquiry Response Draft*) is a workflow-specific instruction set + a Zod schema for its structured output, run through one shared execution path:

```
assembleContext(orgId, workflowType, refs) -> buildPrompt(workflow, context, input)
  -> callModel(prompt)  [OpenAI Responses API, server-side only]
  -> validateOutput(schema, rawResponse)  [Zod]
  -> persistOutput(...)  [generated_outputs row, status = draft]
```

There is exactly one place model calls happen (`lib/ai/client.ts`), one place prompts are versioned (`lib/ai/prompts/<workflow>.ts`, tagged with a version string stored on every run), and one place structured output is validated before it ever reaches storage or the UI.

## Context assembly

Context for a workflow run is assembled server-side from stored records only — the client never supplies free-text "context," only references (a client/contact id, a date range, etc.). This keeps AI output grounded in what the org has actually recorded (client brand voice/preferences/restrictions for Partner; contact history/notes for Founder) and auditable after the fact (the assembled context is stored alongside the run).

## Structured output contract

Every workflow's Zod schema requires the model to return, at minimum:

- the primary drafted content
- `assumptions: string[]` — things the model inferred without being told
- `missingInformation: string[]` — what would have made the output better/safer
- `confidence: "low" | "medium" | "high"`
- `reviewChecklist: string[]` — specific things a human should check before approving

If the model's response fails schema validation, the run is marked `failed`, the raw error is logged (not silently discarded), and no partial/invalid output is ever shown as if it were usable.

## Storage

Every run persists: `org_id`, optional `client_id`/`contact_id`, `workflow_type`, `title`, the structured output, assumptions, missing information, confidence, review checklist, `prompt_version`, `model`, token usage, `status` (`draft`/`pending_review`/`approved`/`rejected`/`revised`), timestamps, and `created_by`. See [data-model.md](data-model.md#milestone-3--planned-ai-workbench--outputs).

## Safety policy checks

Before a workflow runs, the input is screened for request categories that must never be silently fulfilled: earnings/health/legal/financial claims, invented testimonials, impersonation, spam-like or bulk unsolicited messaging, deceptive urgency, unsupported guarantees. A flagged request does not silently comply — it returns a clear warning plus an accurate, ethical alternative framing, and the policy event itself is stored (linked to the attempted run) so patterns are visible later. The model is never asked to invent supporting evidence to satisfy a flagged request.

## No external side effects

The AI service only ever produces a stored draft. Nothing in the orchestration path sends email, publishes content, changes a calendar, contacts a customer, issues a quote, or modifies an external system — see [security-and-approval-policy.md](security-and-approval-policy.md).

## Model abstraction

`lib/ai/client.ts` wraps the OpenAI Responses API behind a small interface (`generateStructured(schema, prompt, options) -> result`) so the model/provider is swappable without touching workflow code. Until a real API key is supplied, this module can be backed by a deterministic mock implementation for development — the workflow and validation code is identical either way.
