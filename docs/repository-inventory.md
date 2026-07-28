# Repository inventory

Audit updated: 2026-07-28 after T001

Repository: `D:\ThatAssistantCo`

Active branch: `codex/t001-claude-code-governance`

## Current state

The active root is a clean ThatAssistant OS VA Edition repository. Project Atlas is not mixed into the active implementation. Its final implementation state is recoverable from:

- Branch: `archive/project-atlas-foundation`
- Commit: `d316d9101f647549d73390a457eb59aa054f258c`

The active application is only the T000 placeholder shell. It contains no authentication, database, AI, workflow, integration, or Release 1 feature.

## Top-level inventory

| Item | Classification | Purpose |
|---|---|---|
| `.git/` | KEEP | Git history, branches, and recoverable archive |
| `.github/` | KEEP | Pull-request and numbered-ticket issue templates |
| `app/` | KEEP | New T000-only Next.js placeholder layout/page/styles |
| `docs/` | KEEP | Current specifications, audits, roadmap, decisions, templates, and build record |
| `scripts/` | KEEP | T001 read-only deterministic governance validation |
| `tests/` | KEEP | New T000 unit and browser baseline only |
| `thatassistant-os-project-docs-v1.1/` | KEEP | Supplied authoritative package and governing Word document |
| `.env.example` | KEEP | Non-secret T000 public URL placeholder only |
| `.gitignore` | KEEP | Dependency, build, test, environment, and secret-file exclusions |
| `.prettierignore`, `.prettierrc.json` | KEEP | T000 formatting configuration |
| `AGENTS.md` | KEEP | Repository authority, safety, and delivery rules |
| `CLAUDE.md` | KEEP | Concise coding-agent entry point aligned with the governing roadmap |
| `CONTRIBUTING.md` | KEEP | Concise ticket and safety contribution workflow |
| `README.md` | KEEP | Product/stage/authority/setup/checks/next-ticket entry point |
| `eslint.config.mjs` | KEEP | T000 lint baseline |
| `next.config.ts` | KEEP | Empty typed Next.js configuration |
| `package.json` | KEEP | Pinned T000 dependencies and scripts |
| `playwright.config.ts` | KEEP | T000 Chromium smoke-test baseline |
| `pnpm-lock.yaml` | KEEP | Reproducible dependency lock |
| `pnpm-workspace.yaml` | KEEP | Narrow native build-script allowlist |
| `tsconfig.json` | KEEP | Strict TypeScript configuration |
| `vitest.config.ts` | KEEP | T000 unit-test baseline |

## Retained documentation

- Source hierarchy and decisions: `source-of-truth-index.md`, `open-decisions.md`.
- Product and scope: `product-summary.md`, `domain-model.md`, `release-1-scope.md`.
- Audit and planning: traceability matrix, progress, legacy audit, roadmap, gap analysis, readiness review.
- Architecture governance and model: `architecture.md`, `domain-model.md`.
- Delivery records: `build-journal.md`, `t000-repository-bootstrap.md`, `t001-claude-code-governance.md`.
- Approved templates: `docs/adr/000-template.md`, `docs/tickets/000-template.md`, `docs/build-journal-template.md`, `.github/` templates.
- Complete supplied package, including `What you should do next.docx`.

## New T000 application and tests

- `app/layout.tsx`
- `app/page.tsx`
- `app/styles.css`
- `tests/unit/bootstrap.test.ts`
- `tests/e2e/bootstrap.spec.ts`

The page communicates only product name, edition, Release 0/T000 status, and the numbered-ticket boundary.

## Removed Project Atlas surface

T000 removed 133 tracked legacy files (22,441 deleted lines), including:

- Old `app/`, `components/`, `lib/`, `public/`, `scripts/`, `supabase/`, `e2e/`, and `test/` trees.
- Four legacy database migrations.
- Partner/Founder application routes and product-mode UI.
- OpenAI email-drafting code, prompts, output/approval UI, and live browser tests.
- Hosted-Supabase seed/configuration and personal-email fixture instructions.
- npm lockfile and abandoned dependency/configuration files.
- Nine historical Project Atlas requirement documents.
- Old root `README.md`, `CLAUDE.md`, and environment example.

Generated/local artifacts removed:

- `.next/`
- `node_modules/` from the legacy install
- `supabase/.temp/`
- `next-env.d.ts`
- `tsconfig.tsbuildinfo`
- `.env.local`

The new T000 dependency install regenerates `node_modules/`, and validation regenerates `.next/`, `next-env.d.ts`, and TypeScript cache locally. All remain ignored and are not archival material.

## Deferred / regenerate later

- Domain modules, Supabase directories, Inngest, prompts, schemas, and domain test suites are created only by their numbered tickets.
- Product assets and design-system components are deferred to the relevant UI ticket.
- Local/staging services, environment validation, health checks, Supabase, and Inngest remain T002 work.
- No Git hook is configured. T001 uses an explicit read-only `pnpm governance:check` command.

## Obsolete historical references

The `docs/legacy-audit.md` and traceability history retain filenames and evidence from the pre-cleanup audit. They describe archived state, not active files.

## Secrets and local state

- No `.env.local` remains.
- `.env.example` contains no credential values.
- No Supabase project link/temp metadata remains active.
- Secret-bearing extensions and environment files are ignored.
- No real client fixture or provider payload exists in the active application/tests.
