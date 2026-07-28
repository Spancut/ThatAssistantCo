# Gap analysis

Comparison baseline: current repository versus the governing Part 11 roadmap.

## Missing architecture

- Clean pnpm-based repository baseline and explicit modular domain structure.
- Durable worker/event processing through Inngest.
- Versioned workflow engine with transactional transitions/events, optimistic concurrency, and idempotency.
- Canonical tenant + client scope propagated through every domain and boundary.
- Provider-neutral external-action adapter/lifecycle and outbox semantics.
- ADR process and accepted architecture records.

## Missing database work

- Canonical profiles/organisations/memberships schema aligned to roadmap roles.
- `client_access`, canonical clients/contacts, service pillars, capabilities, and scope rules.
- Governed Client Brain items, preferences/rules, source metadata, publication/supersession, sensitivity.
- Requests, interpretations, delivery plans, work items, waiting items, decisions, workflow definitions/instances/transitions/events.
- AI run/prompt/feedback model with work-order, model, token, cost, context-manifest, and error metadata.
- Communication drafts with versions/recipient snapshots.
- External actions, attempts, approvals, verification.
- Explicit evidence/completion representation per OD-006.
- Permanent SQL/RLS tests and empty-database migration proof.

## Missing services

- Environment validation and health services.
- Deterministic permission/client-access/scope services.
- Client Brain publication and retrieval services.
- Workflow transition/event/idempotency services.
- Request interpretation, decision/resume, plan materialization, waiting/follow-up, completion, and client-update services.
- Anthropic gateway, prompt registry, source validator, evaluation runner.
- File validation/scanning status and safe download.
- Privacy-safe logging, correlation, analytics, AI cost, and budget services.

## Missing workflows

- Request-to-Delivery.
- Controlled Follow-Up.
- Communication Draft integrated with request delivery.
- Decision Queue and blocking/resume behavior.
- Completion verification and client update.
- All later release workflows; these are correctly deferred.

## Missing UI

- VA Edition navigation and active-client indicator.
- “What Needs You” home.
- Request capture/list/detail/review.
- Decision Cards and Decision Queue.
- Delivery plan review with sources/assumptions.
- Work and waiting views.
- Approval Bundles and stale-state handling.
- Client Brain source/publication/sensitivity controls.
- Completion review, client update draft, AI feedback/evaluation.
- Mobile capture/decision critical path and verified accessibility.

## Missing tests and validation

- Four fictional VA client fixture sets and injection/contradiction cases.
- Database migration-from-empty and permanent RLS/security suite.
- Cross-client isolation at database, files, retrieval, AI, analytics, and UI.
- Workflow transition, concurrency, idempotency, duplicate-event, retry, and recovery tests.
- AI source support, uncertainty, prompt injection, schema, privacy, and threshold evaluations.
- No-AI fallback and provider failure recovery.
- Accessibility and mobile critical path.
- Complete Release 1 browser suite and release-gate evidence.

## Missing integrations

- Inngest, Sentry, privacy-minimized PostHog, Vercel environment/release setup.
- Resend/Stripe are later or gate-dependent and should not be added early.
- Live inbox/calendar/project/CRM actions are deliberately excluded until separate release gates.

## Missing documentation

- Root roadmap-aligned `CLAUDE.md`.
- ADR and ticket templates.
- Approved Part 11 split into versioned Markdown and corrected manifest.
- Current setup/deployment/staging/runbook documentation.
- Threat model, data classification/retention, incident procedures, release checklists, rollback records.

## Missing security

- Client-level access and isolation enforcement.
- File path/access validation and processing states.
- Prompt-injection and untrusted-source controls.
- Published-only/sensitivity-aware AI context.
- Action/payload/recipient-specific approval, expiry, invalidation, and provider verification.
- Redacted telemetry and analytics field allowlists.
- Incident stop states, audit retention, and security/evaluation release gates.

## Legacy conflicts requiring removal or quarantine

- Partner/Founder product modes and Founder routes.
- OpenAI provider/env/live test path.
- Legacy migrations and mutable knowledge/output model.
- npm lock/install contract.
- Real personal email aliases in seed/test operating instructions.
- Historical root docs presenting Project Atlas as current.

## Recommended closure sequence

1. Archive Project Atlas and establish a clean recoverable baseline.
2. Execute T000, then T001–T003.
3. Build and gate Release 1A in exact ticket order.
4. Build Release 1B as the full Request-to-Delivery control loop.
5. Do not detail or implement later releases before T038 passes.
