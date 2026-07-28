# Architecture governance

## Authority and decisions

Architecture is governed by the hierarchy in `docs/source-of-truth-index.md`, with `thatassistant-os-project-docs-v1.1/What you should do next.docx` controlling implementation sequencing and detail. Topic constraints come from the supplied architecture, AI, workflow, and security specifications.

Material choices, conflicts, exceptions, or changes to an accepted architecture are recorded as Architecture Decision Records in `docs/adr/` using `docs/adr/000-template.md`. An ADR explains an implementation decision; it cannot silently override the governing Word document or a higher-authority product decision. If an implementation constraint would require such an override, stop and obtain an explicit product-owner decision.

## Non-negotiable boundaries

- Every client-owned record and operation carries and enforces both `tenant_id` and `client_id`.
- Identity, membership, client access, purpose, and sensitivity are resolved before queries, retrieval, AI context assembly, workflow transitions, or external actions.
- Database policy, scope-aware application boundaries, cache keys, background jobs, audit records, and tests must preserve the same tenant/client scope.
- Cross-client access or retrieval is release-blocking.

## Deterministic controls and AI reasoning

AI performs bounded analysis and creates proposals. Deterministic application code owns identity, permissions, validation, workflow state, approval validity, idempotency, and external execution. Model output and retrieved content are untrusted until schema, source, policy, and risk checks pass.

The Client Brain is governed, client-scoped context: structured records, approved source content, and a client-scoped retrieval index. Context assembly uses the minimum necessary approved sources, retains source references, and surfaces conflicts, staleness, sensitivity, and uncertainty. Corrections do not silently become durable Client Brain knowledge.

## Workflow control and evidence

The workflow engine preserves explicit decisions, approvals, exceptions, waiting and follow-up states, completion criteria, and auditable evidence. These records are distinct controls, not interchangeable labels. Completion requires verified criteria and evidence; generating an AI output or receiving a provider response is not completion by itself.

External actions remain human-controlled. They require deterministic permission and scope checks, payload- and target-bound approval where required, freshness checks, idempotency, queued execution, provider-result verification, and an auditable outcome. An uncertain provider result remains uncertain and must not trigger a blind retry.

## Change discipline

Architecture work follows one approved ticket at a time. Use an ADR when a material decision is needed, keep migrations and rollback paths explicit, update affected tests and documentation, and stop at the ticket boundary. Do not design future-release modules during an earlier ticket.
