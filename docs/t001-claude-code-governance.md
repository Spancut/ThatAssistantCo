# T001 — Claude Code governance

Status: complete pending final Git delivery

## Initial state

- Started from completed T000 commit `ec49106e64763f0d9bb1c1b8795f283d069e726a`.
- Created `codex/t001-claude-code-governance` from the T000 branch, not from archived Project Atlas history.
- T000 draft PR #1 was open, draft, and unmerged.
- `archive/project-atlas-foundation` remained available locally and remotely at `d316d9101f647549d73390a457eb59aa054f258c`.
- No Release 1 feature implementation was present or authorised.

## Required-output classification

| Output | Initial classification | T001 result |
|---|---|---|
| Root `CLAUDE.md` | Missing | Created as a concise entry point |
| Architecture documentation | Requires modification | Added focused architecture governance; retained the conceptual domain model |
| ADR template | Requires modification | Added all required decision, safety, isolation, migration, and supersession fields |
| Ticket template | Requires modification | Added scope, impact, tests, rollback, completion, and stop-boundary fields |
| Build-journal template | Missing | Added separately without replacing the live journal |
| Deterministic governance checks | Missing | Added a safe read-only validation command |
| `AGENTS.md` alignment | Requires modification | Added explicit reading order, roadmap order, and stop-boundary language |

## Sources reviewed

- Governing Word document: authority hierarchy, build rules, completion rules, and the complete T001 section.
- `AGENTS.md` and `docs/source-of-truth-index.md`.
- Supplied Human + AI Organisation, Technical Architecture, AI Orchestration, and Security/Permissions specifications.
- Existing domain model, ADR template, ticket template, live build journal, roadmap, progress, traceability, inventory, and open decisions.

## Files created

- `CLAUDE.md`
- `docs/architecture.md`
- `docs/build-journal-template.md`
- `docs/t001-claude-code-governance.md`
- `scripts/check-governance.mjs`

## Files modified

- `AGENTS.md`
- `docs/adr/000-template.md`
- `docs/tickets/000-template.md`
- `package.json`
- `tsconfig.json` (mechanical formatting required by the repository check)
- `docs/build-journal.md`
- `docs/implementation-progress.md`
- `docs/requirement-traceability-matrix.md`
- `docs/repository-inventory.md`

## Governance established

- Agents begin with the governing Word roadmap, `AGENTS.md`, the source hierarchy, and the authorised ticket.
- Work proceeds one approved numbered ticket at a time and stops at its boundary.
- Product or architecture ambiguity is recorded and escalated rather than invented or silently overridden.
- Tenant/client isolation, source evidence, uncertainty, human approval, deterministic permissions, external-action control, and completion evidence are preserved.
- Production credentials/resources, real client data, autonomous external actions, and unauthorised destructive commands are prohibited.
- Mocks, stubs, placeholders, and fictional fixtures must be explicit.

## Deterministic checks

`pnpm governance:check` performs read-only checks for:

- required governance files;
- approved branch naming;
- prohibited tracked environment/hosted-project metadata;
- common credential patterns in tracked and unignored text files;
- an unexpected configured local Git hooks path.

The check fails with a corrective message. It does not edit files, commit, push, merge, deploy, migrate, call paid services, contact providers, or use production resources.

## Checks deliberately not added

- No automatic Git hook was configured because a direct, portable command provides sufficient T001 enforcement without changing developer Git behavior.
- No automatic formatting, committing, pushing, merging, deployment, migration, provider call, message, or email action was added.
- No future service, database, AI, workflow, CI, or Release 1 architecture was introduced.

## Validation

- Frozen pnpm install: passed.
- `pnpm governance:check`: passed.
- `pnpm format:check`: passed after mechanical formatting of `tsconfig.json`.
- `pnpm lint`: passed.
- `pnpm typecheck`: passed.
- `pnpm test`: passed, 1/1.
- `pnpm build`: passed; only `/` and the framework `_not-found` route were generated.
- `pnpm test:e2e`: passed, 1/1 local Chromium test.
- `git diff --check`: passed.
- Manual destructive/production-action review: passed; no active custom Git hook exists and the governance command is read-only.

## Acceptance criteria

- [x] Governance rules reference the governing specification.
- [x] Root `CLAUDE.md` is concise and practical.
- [x] Required architecture and reusable templates exist without duplication.
- [x] Deterministic governance enforcement is safe and non-destructive.
- [x] No hook performs destructive or production actions; no active hook is configured.
- [x] T001 contains no T002 or Release 1 feature work.

## Next authorised ticket

T002 — Local/staging services. It requires separate explicit approval. Work stopped before T002.
