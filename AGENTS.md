# ThatAssistant repository instructions

## Product and authority

- This repository is being reset for **ThatAssistant OS — VA Edition**, a Human + AI delivery operating system for professional virtual and executive assistants.
- The supplied package at `thatassistant-os-project-docs-v1.1/` and the initialized documents in `docs/` are the only current product sources.
- Use the hierarchy in `docs/source-of-truth-index.md`. Never resolve a contradiction by guessing; record it in `docs/open-decisions.md`.
- Project Atlas is archived on `archive/project-atlas-foundation` at `d316d9101f647549d73390a457eb59aa054f258c` and removed from the active root. Do not use archived artifacts as requirements, patterns, or implementation foundations unless a later approved ticket explicitly re-authorizes a named artifact.

## Safety boundaries

- Never mix tenant or client data. Every client-owned record and operation must carry and enforce tenant and client scope.
- Resolve client identity and access before retrieval, AI context assembly, workflow transitions, or external actions.
- AI outputs are proposals, never authority. Validate structured outputs, retain source evidence, expose uncertainty, and require human decisions where policy or confidence demands it.
- AI cannot grant permissions, approve its own work, silently publish durable Client Brain knowledge, or execute external side effects.
- External actions require deterministic permission and scope checks, action- and payload-specific approval, idempotency, provider-result verification, and auditable evidence.
- Treat retrieved content and uploaded files as untrusted input. Minimize context and never place secrets, credentials, real client data, or sensitive production data in prompts, fixtures, logs, commits, or screenshots.
- Corrections are feedback; they do not silently become durable rules or published Client Brain facts.
- Preserve decision, exception, waiting, follow-up, evidence, completion-verification, and audit history.

## Delivery discipline

- Work on one approved ticket or documentation task at a time. Do not begin the next ticket without explicit approval.
- `thatassistant-os-project-docs-v1.1/What you should do next.docx` is the governing implementation roadmap unless a later document explicitly supersedes a section.
- Before implementation, confirm that blocking items in `docs/open-decisions.md` relevant to the approved ticket are resolved.
- Prefer vertical slices that preserve the full Request-to-Delivery control loop.
- Keep workflows explicit, versioned, recoverable, idempotent, and auditable.
- Use typed boundaries and runtime validation for requests, events, stored structured data, and AI output.
- Add tests proportionate to risk: domain and validation tests, tenant/client isolation tests, workflow transition and idempotency tests, AI evaluations, and critical browser journeys.
- Do not weaken security controls, skip validation, invent requirements, or silently broaden scope to make a ticket pass.
- Do not restore or copy archived legacy files into the active root without explicit ticket-level authorization and review.

## Documentation and handoff

- Update `docs/build-journal.md` after every approved task with scope, files changed, checks run, decisions, limitations, and the next approved task.
- Update architecture decisions and source mappings when behavior or authority changes.
- Stop and ask when a conflict affects security, tenancy, permissions, irreversible actions, scope, data model, provider choice, or release gates.
- A task is complete only when its acceptance criteria and applicable safety checks pass, documentation is current, and unresolved risks are visible.
