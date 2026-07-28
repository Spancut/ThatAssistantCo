# Build journal

## 2026-07-28 — Specification initialization

### Repository state

- Working directory confirmed as `D:\ThatAssistantCo`.
- Started from branch `master` at commit `d316d91`, whose message identifies Project Atlas “Milestone 3.”
- Created branch `codex/va-edition-spec-initialisation`.
- The authoritative package was untracked at task start.
- A substantial old Next.js/Supabase application remains present, including `app/`, `components/`, `lib/`, `supabase/`, tests, configuration, `.next/`, and `node_modules/`.
- No legacy files were deleted, moved, or used as product authority.

### Documentation reviewed

- Every file in `thatassistant-os-project-docs-v1.1/` was inventoried.
- All substantive Markdown, JSON, prompt, and template files were reviewed.
- `What you should do next.docx` was extracted and reviewed, including its five tables, full section structure, releases, tickets, definition of done, and final directive.
- Two `.DS_Store` files were identified as non-specification metadata.
- Existing root application code and old root documentation were inspected only by structure, Git state, and filenames to avoid importing Project Atlas assumptions.

### Files changed

- `AGENTS.md`
- `docs/source-of-truth-index.md`
- `docs/open-decisions.md`
- `docs/product-summary.md`
- `docs/domain-model.md`
- `docs/release-1-scope.md`
- `docs/build-journal.md`

Only documentation and agent instructions were changed. No production source, migration, configuration, dependency, fixture, or test file was added or modified.

### Decisions captured

- Blueprint Revision 1.1 is the highest supplied product authority.
- The Word Part 11 is treated as a candidate specification, not implementation authorization, until its conflict with package status is explicitly resolved.
- Blueprint Release 1 is documented as secure foundation plus the daily delivery loop; the 1A/1B mapping remains subject to OD-004.
- All pre-existing implementation and root documentation are quarantined as suspected Project Atlas legacy material.
- The conceptual domain model avoids migrations and marks uncertain storage decisions explicitly.

### Unresolved

- OD-001 through OD-007 in `docs/open-decisions.md`.
- Most importantly: Part 11 approval, technology stack ratification, and legacy repository disposition block production work.

### Verification

- [x] Full supplied folder inventory completed.
- [x] Old application code presence confirmed and reported.
- [x] No files deleted automatically.
- [x] Every supplied package file classified.
- [x] Source hierarchy documented.
- [x] Contradictions recorded rather than guessed.
- [x] Product summary, domain model, Release 1 boundary, and repository rules created.
- [x] No production implementation begun.
- [x] No Project Atlas product assumptions used.

### Next task

Product-owner decision review for OD-001, OD-003, and OD-005. After those decisions are recorded, approve one documentation or implementation ticket explicitly. Do not start T000 or any production ticket yet.

## 2026-07-28 — Specification-to-repository traceability audit

### Authority update

- Product owner designated `thatassistant-os-project-docs-v1.1/What you should do next.docx` as the governing implementation roadmap.
- OD-001 and OD-003 were marked resolved.
- Earlier “candidate Part 11” and stack-approval language was corrected in current control documents.

### Repository state

- Started from `fb46629` on `codex/va-edition-spec-initialisation`.
- Created `codex/specification-traceability`.
- Audited all current and historical documentation, all tracked source/config/test/migration groups, and ignored/generated categories.
- No production source, configuration, dependency, test, migration, asset, or script was modified.

### Files added

- `docs/repository-inventory.md`
- `docs/requirement-traceability-matrix.md`
- `docs/implementation-progress.md`
- `docs/legacy-audit.md`
- `docs/build-roadmap.md`
- `docs/gap-analysis.md`
- `docs/readiness-review.md`

### Files corrected

- `AGENTS.md`
- `docs/source-of-truth-index.md`
- `docs/open-decisions.md`
- `docs/domain-model.md`
- `docs/release-1-scope.md`
- `docs/build-journal.md`

### Audit results

- 98 significant requirements traced.
- 8 complete, 34 partially complete, 40 not started, 2 blocked, 10 superseded, 0 unknown.
- Weighted Release 0 + Release 1 progress estimate: 14%.
- Highest risks: mixed legacy repository, tenant/client isolation, canonical schema, workflow/idempotency, governed Client Brain, AI context/source safety, completion evidence, and missing release gates.
- Recommended first controlled implementation ticket: T000, after explicit approval of OD-005 archive/recovery handling.

### Checks

- `npm test -- --run`: 48/48 legacy unit tests passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- Browser tests were not run because they use live hosted services and the legacy OpenAI path; this audit did not authorize external test side effects.

### Next task

Approve and execute a recoverable Project Atlas archive strategy, then explicitly authorize T000. Do not begin feature work before the clean repository bootstrap.

## 2026-07-28 — T000 Repository bootstrap

### Outcome

- T000 started and completed on `codex/t000-repository-bootstrap`.
- OD-005 resolved: Project Atlas was archived in recoverable Git history and removed from the active root.
- A pinned, strict, testable Next.js placeholder foundation was created.
- No authentication, database, AI, workflow, integration, or Release 1 feature was added.

### Archive and cleanup

- Archive branch: `archive/project-atlas-foundation`.
- Archive commit: `d316d9101f647549d73390a457eb59aa054f258c`.
- Cleanup commit: `407049a`.
- Bootstrap foundation commit: `e3754e2`.
- Removed 133 tracked legacy files and 22,441 lines, including old application routes/components/services, migrations, tests, scripts, assets, dependencies/configuration, and historical requirement docs.
- Removed legacy `.next/`, `node_modules/`, `.env.local`, `supabase/.temp/`, `next-env.d.ts`, and TypeScript cache.
- Generated artifacts were not treated as archive material.

### Governance and bootstrap files

- Created new README, contribution guidance, ADR/ticket templates, PR/issue templates, and `docs/t000-repository-bootstrap.md`.
- Updated `AGENTS.md`, source index, open decisions, repository inventory, traceability matrix, and implementation progress.
- Created minimal placeholder `app/`, T000 unit/browser tests, and pinned pnpm/Next/TypeScript/lint/format/test configuration.

### Selected versions

- Node.js 24.11.0
- pnpm 11.17.0
- Next.js 16.2.12
- React / React DOM 19.2.8
- TypeScript 5.9.3
- ESLint 9.39.5
- Prettier 3.9.6
- Vitest 4.1.10
- Playwright Test 1.61.1

TypeScript 7.0.2 and ESLint 10.7.0 were evaluated but rejected because the current Next.js lint dependency graph reported unmet peer ranges. pnpm reports no peer issues with the selected compatible versions.

### Validation

- Archive ref and commit verified.
- Legacy production paths absent from active source.
- Authoritative package and governing Word document present.
- pnpm lockfile supply-chain policy: passed.
- `pnpm peers check`: passed.
- `pnpm format:check`: passed.
- `pnpm lint`: passed.
- `pnpm typecheck`: passed.
- `pnpm test`: 1/1 passed.
- `pnpm build`: passed; placeholder `/` only.
- `pnpm test:e2e`: 1/1 Chromium smoke test passed.
- Legacy browser tests were not run.

### Known limitations

- Root `CLAUDE.md`, architecture documentation package, complete ADR/ticket governance, and deterministic safe checks remain T001.
- Local checkout remote/push/PR availability is evaluated after the final T000 commit.
- OD-006 and OD-007 remain open and do not block T000.

### Next approved ticket

T001 — Claude Code governance. Do not begin until explicitly approved.

## 2026-07-28 — T001 Claude Code governance

### Repository state

- Branch: `codex/t001-claude-code-governance`.
- Starting commit: `ec49106e64763f0d9bb1c1b8795f283d069e726a`.
- T000 draft PR #1 remained open, draft, and unmerged.
- Project Atlas archive remained available locally and remotely at `archive/project-atlas-foundation` / `d316d9101f647549d73390a457eb59aa054f258c`.
- Final commit and stacked draft PR are recorded by Git/GitHub delivery metadata for this entry.

### Documents reviewed

- Governing Word authority, build, completion, and complete T001 sections.
- `AGENTS.md`, source-of-truth index, open decisions, roadmap, existing templates, and T000 records.
- Supplied Human + AI Organisation, Technical Architecture, AI Orchestration, and Security/Permissions specifications.

### Authorised scope

- T001 governance outputs only.
- T002 services and all Release 1 feature work were explicitly excluded.

### Changes

- Added concise root `CLAUDE.md` and focused architecture governance.
- Completed the ADR and implementation-ticket templates.
- Added a separate reusable build-journal template without replacing this journal.
- Added a read-only deterministic governance check and package command.
- Aligned `AGENTS.md` and updated T001 evidence, progress, traceability, and inventory.
- No migration or production architecture change was made; no ADR was necessary.

### Validation and security

- Frozen pnpm install passed.
- Required governance-file, branch-name, hosted-metadata, common-secret-pattern, and local-hook checks passed.
- Formatting, lint, and type checking passed.
- Unit test passed, 1/1.
- Production build passed with only `/` and the framework `_not-found` route.
- Local Playwright Chromium baseline passed, 1/1.
- `git diff --check` passed.
- Manual review confirmed that no hook or check deletes, commits, pushes, merges, deploys, migrates, contacts providers, sends messages, or uses production resources.

### Exceptions and follow-up

- No product or architecture deviation.
- No unresolved T001 blocker.
- T002 remains unstarted and requires explicit approval.

### Boundary and next ticket

- Next ticket in the Word roadmap: T002 — Local/staging services.
- [x] Work stopped at the approved T001 boundary.

## 2026-07-28 — T002 Local/staging services

### Repository state and scope

- Branch: `codex/t002-local-staging-services`.
- Starting commit: `6552ad55e73268c33210b0d33a2e4532ad399c25`.
- T001 draft PR #2 remained open, draft, and unmerged.
- Only T002 infrastructure was authorised; no T003 or Release 1 implementation was added.

### Changes

- Added pinned Supabase/Inngest/Zod dependencies and current local Supabase configuration.
- Added a strict runtime environment model with local/staging/production isolation guards.
- Added safe app/database/Supabase/Inngest health reporting.
- Added the Inngest serve route and infrastructure-only health function.
- Added local commands, combined launcher, staging instructions, and focused unit tests.

### Security and external actions

- No hosted project was created or linked, no remote migration ran, and no production
  credential or real client data was used.
- Local reset is explicitly scoped with `supabase db reset --local`.
- Health results exclude URLs, connection strings, errors, and secrets.
- Node package TLS remained strict; the Windows trusted certificate store was used
  rather than disabling verification.

### Blockers and validation

- Docker is unavailable, blocking live Supabase start/status/stop and complete
  multi-service health verification. Install/start Docker Desktop with Linux
  containers and run the commands in `docs/local-development.md`.
- Vercel CLI/log access is unavailable locally. GitHub reports the T001 Vercel check
  failure and deployment URL but not the underlying log; exact attribution remains
  an external read-only follow-up.
- Final frozen install, governance, formatting, lint, type, unit, build, Inngest,
  health, Chromium, diff, and credential-scan results are recorded in the T002
  delivery document and Git/PR evidence.

### Boundary and next ticket

- Next ticket: T003 — CI and observability baseline.
- [x] Work stopped at the approved T002 boundary.
