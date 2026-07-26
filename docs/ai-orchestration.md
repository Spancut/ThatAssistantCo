# AI Orchestration

Built in Milestone 3. This describes what's actually implemented; see [decisions.md](decisions.md) for why a few specifics diverged from the original plan below.

## One service, not a multi-agent system

`lib/ai/` is a single, controlled AI orchestration module, not a multi-agent architecture. There is currently one workflow ("draft_email," shared by both products — see [data-model.md](data-model.md#milestone-3--implemented-ai-workbench--outputs)), run through one shared execution path:

```
assembleClientContext | assembleContactContext (lib/ai/context.ts)
  -> buildDraftEmailPrompt (lib/ai/prompts/draft-email.ts)
  -> generateStructured (lib/ai/client.ts — OpenAI Responses API, server-side only)
  -> Zod validation, retry once on failure (lib/ai/client.ts:generateWithValidation)
  -> persist workflow_run + output (lib/ai/orchestrator.ts, status = "draft")
```

`lib/ai/orchestrator.ts:generateDraftEmail` is the only place all of this is wired together, and `lib/ai/client.ts` is the only file that imports the `openai` package — no route, Server Action, or component calls the model directly.

## Context assembly

Context is assembled server-side from stored records only ([lib/ai/context.ts](../lib/ai/context.ts)) — the client only ever supplies a client/contact id (via which detail page the "Draft email"/"Draft response" button was clicked) and the free-text prompt describing what the email needs to say. This is where Partner and Founder actually differ, expressed as a discriminated union (`AssembledContext` in `lib/ai/types.ts`):

- **Partner** (`assembleClientContext`): `client_profiles.brand_voice`/`.preferences`/`.key_facts`, plus any `knowledge_base_items` linked to that client.
- **Founder** (`assembleContactContext`): `contacts.notes`/`.pipeline_stage`, plus any `knowledge_base_items` linked to that contact.

Everything downstream (prompt building, the model call, persistence) is shared and doesn't branch on which union member it received.

## Structured output contract

This workflow's Zod schema (`lib/ai/schema.ts:draftEmailOutputSchema`) is narrower than an earlier, more general draft of this document described — the actual spec for this milestone fixed the exact shape:

```ts
{
  subject: string,
  body: string,
  tone_notes: string,
  context_sources_used: string[],
  confidence_flag: "high" | "medium" | "low",
}
```

Every model response is validated against this schema. On a validation failure, `generateWithValidation` retries once (a fresh model call, not a re-parse of the same response); if the second attempt also fails validation, it throws `ModelOutputValidationError` and the orchestrator marks `workflow_run.status = "failed"` — no partial/invalid output is ever persisted or shown as usable. A network/API-level error from the model call itself is not retried the same way — it fails the run immediately.

## Storage

Every run persists (`workflow_runs`): `workflow_template_id`, `org_id`, `initiated_by`, `input_snapshot` (the user's prompt *and* the full assembled context — enough to debug a bad output against exactly what it was given), `status`, `created_at`. Every successful generation also persists (`outputs`): `workflow_run_id`, `org_id`, `output_type`, `draft_content` (current human-readable text), `structured_content` (the full structured response — mutable, see decisions.md), `status` (`draft` → `approved`/`edited_and_approved`/`rejected`), `created_at`. Model name and token usage are captured by `lib/ai/client.ts`'s return value but not currently persisted as separate columns (`workflow_runs`/`outputs` don't have `model`/`usage` columns in this milestone's schema — a reasonable future addition once cost tracking matters).

## Safety policy checks

Guidance against earnings/health/legal/financial claims, invented testimonials, impersonation, spam-like/bulk messaging, deceptive urgency, and unsupported guarantees is embedded directly in the single prompt (`lib/ai/prompts/draft-email.ts`), instructing the model to omit any such claim from the draft and lower `confidence_flag` accordingly rather than comply. This is deliberately *not* a separate pre-flight classifier call — see decisions.md for why (this milestone is explicitly one model call, not multi-step). No policy-event table exists yet; a flagged/adjusted request is only visible via the resulting draft's low `confidence_flag` and `tone_notes`, not a separately stored record.

## No external side effects

The AI service only ever produces a stored draft with `status = "draft"`. There is no send/publish button anywhere in the product. Approving an output ([app/[orgSlug]/outputs/actions.ts](../app/%5BorgSlug%5D/outputs/actions.ts)) only changes its own status and writes an `audit_events` row — it never sends email, publishes content, changes a calendar, contacts a customer, issues a quote, or modifies an external system. See [security-and-approval-policy.md](security-and-approval-policy.md).

## Model abstraction

`lib/ai/client.ts` exposes a `ModelClient` interface (`generateStructured<T>(schema, prompt, schemaName) -> GeneratedResult<T>`) implemented by `createOpenAIModelClient()` (wraps `openai.responses.parse()` with `zodTextFormat`). `lib/ai/orchestrator.ts:generateDraftEmail` takes an optional `modelClient` parameter defaulting to the real OpenAI-backed one — unit tests inject a fake `ModelClient` instead (see `lib/ai/orchestrator.test.ts`), so the full entitlement-gate → context → persist flow is tested without any network call, while the live Playwright suite exercises the real OpenAI path end to end.
