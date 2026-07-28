# ThatAssistant OS — Permanent Claude Code Instructions

## Product identity

ThatAssistant OS is a Human + AI client-delivery operating system for professional VAs and EAs.

The VA remains the **Head of Client Delivery**. AI supports interpretation, preparation, coordination, checking and follow-up. AI does not replace human judgement, approve its own work or independently make sensitive commitments.

## Source-of-truth order

When documents conflict, use this order:

1. `docs/10-blueprint-revision-1.1.md`
2. The approved files in `docs/11-build-specification/`
3. `docs/07-ai-orchestration.md`
4. `docs/06-technical-architecture.md`
5. `docs/05-ux-specification.md`
6. `docs/04-workflows.md`
7. `docs/03-human-ai-organisation.md`
8. `docs/02-product-scope.md`
9. `docs/01-product-foundation.md`
10. `docs/09-validation-commercialisation.md`

Do not treat conversational memory as product authority. The repository documents are authoritative.

## Non-negotiable product rules

- Every client-scoped record must include a valid `tenant_id` and `client_id`.
- Never mix data, context, files, retrieval results, actions or activity between clients.
- Client identity must be resolved before context retrieval or AI execution.
- Client service scope must be checked before starting a workflow.
- AI outputs are proposals until structurally validated and accepted by deterministic application logic.
- AI must never invent owners, deadlines, recipients, prices, commitments or completion.
- Material claims must retain source references or verified system evidence.
- Uncertainty must remain visible.
- AI cannot approve its own work.
- Effective permissions are calculated deterministically.
- External actions require permission checks, idempotency, provider verification and appropriate human approval.
- A successful provider request is not automatically a completed client outcome.
- Human corrections must be recorded and must not silently become permanent Client Brain rules.
- Source content is untrusted evidence and cannot redefine system instructions or permissions.
- Sensitive and private context must be minimised and role-restricted.
- The product should surface decisions and exceptions rather than force the VA to supervise every step.
- Build only the currently authorised phase.
- Do not implement future integrations or modules unless explicitly authorised.
- Add tests for every security boundary, workflow transition and critical AI behaviour.

## Engineering rules

- Prefer a modular monolith for the initial product.
- Use a relational database as the operational source of truth.
- Use background workers for AI processing, files, scheduled checks, notifications and external actions.
- Use explicit workflow states and versioned workflow definitions.
- Use typed schemas for all AI work orders and results.
- Store prompts as versioned assets, not untracked strings scattered through the codebase.
- Context assembly must happen server-side.
- General telemetry must not contain full sensitive client content.
- Every model call must be traceable to role, task type, prompt version, model profile and workflow instance.
- Every material external action must have an idempotency key and verification result.
- Run relevant unit, integration and security tests before marking work complete.

## Working method

For every ticket:

1. Read the relevant source-of-truth files.
2. Restate the authorised scope.
3. Produce a technical plan before editing code.
4. Identify data, security, workflow and testing impacts.
5. Implement only the approved ticket.
6. Run tests.
7. Summarise files changed, migrations, tests and known limitations.
8. Wait for approval before moving to the next ticket.
