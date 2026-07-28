# Repository inventory

Audit date: 2026-07-28

Repository: `D:\ThatAssistantCo`

Branch at audit: `codex/specification-traceability`

## Summary

The repository contains two materially different bodies of work:

1. The authoritative ThatAssistant OS VA Edition documentation package and the initialized source-of-truth documents.
2. A committed, runnable Project Atlas application for “Partner” and “Founder” product modes. It predates the VA Edition package and conflicts with the current product model.

There were 160 tracked files before this audit branch’s new reports. Ignored/generated trees materially increase the physical file count, especially `node_modules/` and `.next/`.

## Documentation

### Current authoritative or controlling

- Root: `AGENTS.md`.
- Initialized controls: `docs/source-of-truth-index.md`, `docs/open-decisions.md`, `docs/product-summary.md`, `docs/domain-model.md`, `docs/release-1-scope.md`, `docs/build-journal.md`.
- Supplied package: `thatassistant-os-project-docs-v1.1/README.md`, `CLAUDE.md`, `MANIFEST.json`, the full `docs/00`–`10` series, `docs/11-build-specification/README.md`, `11A-documentation-setup.md`, bootstrap prompt, fixture instructions, and `What you should do next.docx`.
- Governing implementation roadmap: `thatassistant-os-project-docs-v1.1/What you should do next.docx`.

### Historical / legacy documentation

- Root `README.md` and `CLAUDE.md`.
- `docs/product-brief.md`, `mvp-scope.md`, `architecture.md`, `data-model.md`, `roles-and-permissions.md`, `security-and-approval-policy.md`, `ai-orchestration.md`, `build-plan.md`, and `decisions.md`.

These describe Project Atlas’s Partner/Founder product, OpenAI email drafting, and Milestones 1–5. They are useful only as implementation evidence and should not govern VA Edition requirements.

### Duplicate or overlapping documentation

- Two source indexes: package `docs/00-source-of-truth-index.md` and repository `docs/source-of-truth-index.md`.
- Two product summaries: legacy `docs/product-brief.md` and current `docs/product-summary.md`.
- Two scope documents: legacy `docs/mvp-scope.md` and current `docs/release-1-scope.md`.
- Two AI documents: legacy `docs/ai-orchestration.md` and package `docs/07-ai-orchestration.md`.
- Two architecture documents: legacy `docs/architecture.md` and package `docs/06-technical-architecture.md`.
- Two data/domain documents: legacy `docs/data-model.md` and current `docs/domain-model.md`.
- Legacy security/roles documents overlap package `docs/08-security-permissions.md`.
- Root and package `CLAUDE.md` files have different histories and purposes.

## Source code and UI

| Area | Paths | Classification |
|---|---|---|
| Next.js routes | `app/` | Legacy Project Atlas; conflicts with VA Edition navigation and product model |
| Auth/onboarding | `app/(auth)/`, `app/auth/`, `app/onboarding/` | Potentially reusable with modification |
| Partner client UI | `app/[orgSlug]/clients/`, `components/clients/` | Reusable patterns only; data model and UX require major modification |
| Founder contacts UI | `app/[orgSlug]/contacts/`, `components/contacts/` | Obsolete for Release 1; possible later reference |
| AI output UI | `app/[orgSlug]/outputs/`, `components/ai/` | Conflicts with roadmap workflow; limited review-form patterns reusable |
| Shell/dashboard/settings | `app/[orgSlug]/`, `components/shell/`, `components/dashboard/`, `components/settings/` | Reusable with modification; current navigation is wrong |
| Shared UI primitives | `components/ui/` | Reusable, subject to accessibility/design verification |
| Server services | `lib/server/` | Mixed; audit, auth-aware access, and entitlement patterns may be reusable |
| AI services | `lib/ai/` | Architecture pattern partly reusable; provider, contracts, context, prompts, and workflow are incompatible |
| Supabase clients | `lib/supabase/` | Reusable with modification after stack/version verification |
| Validation | `lib/validations/` | Patterns reusable; current schemas are legacy-domain specific |
| Generated DB types | `lib/types/database.ts` | Historical/generated from legacy schema; obsolete after new migrations |
| Styling/assets | `app/globals.css`, `public/*.svg`, `app/favicon.ico` | Generic assets; review during T000/T012 |

## Database

Four tracked migrations exist:

- `20260724000001_init_platform_schema.sql`
- `20260724000002_billing_entitlements_notifications.sql`
- `20260724000003_clients_contacts_knowledge.sql`
- `20260724000004_ai_workflows.sql`

They implement organisations, memberships, audit, entitlements, notifications, Partner clients, Founder contacts, ungoverned knowledge items, OpenAI workflow templates/runs, outputs, approvals, and human-value entries. They do not implement the governing canonical VA Edition schema. They must not be applied to a new VA Edition environment without an explicit reuse/migration decision.

## Scripts

- `scripts/seed.ts`: legacy hosted-Supabase seed using personally controlled Gmail aliases and Partner/Founder fixtures. Obsolete and unsafe for the roadmap’s fictional-fixture standard without modification.
- Package `prompts/00-claude-code-bootstrap.md`: current template.
- No Inngest, environment-validation, health-check, CI, migration-verification, or roadmap ticket scripts exist.

## Tests

- Unit tests: seven Vitest files, 48 tests, all passing during this audit.
- Browser tests: five Playwright spec/helper files for legacy auth, billing, entities, and live OpenAI drafting.
- Test support: `test/helpers/fake-supabase.ts`, `test/mocks/server-only.ts`.
- Roadmap fixture directory contains only instructions; four VA Edition fixture clients do not exist.
- Missing: persistent database/RLS suite, client-level isolation suite, workflow engine/idempotency/concurrency suite, Anthropic mock/evaluations, prompt-injection fixtures, accessibility gate, mobile VA critical path, and full Request-to-Delivery browser suite.

## Configuration

- Application: `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `components.json`.
- Tests: `vitest.config.ts`, `playwright.config.ts`.
- Supabase: `supabase/config.toml`, `supabase/.gitignore`.
- Environment: `.env.example` (tracked), `.env.local` (ignored).
- Git: `.gitignore`.
- There is no pnpm lockfile, CI workflow, Prettier configuration, Inngest configuration, Sentry configuration, PostHog setup, Vercel project metadata, or architecture-decision directory.

## Assets

- `public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`.
- `app/favicon.ico`.
- Package `.DS_Store` metadata is ignored and obsolete.
- No authoritative VA Edition brand asset set is present.

## Generated, ignored, and local-only files

- `.next/`: generated Next.js build/cache output; obsolete after any clean bootstrap.
- `node_modules/`: generated dependency installation; reproducible only from the legacy npm lockfile.
- `next-env.d.ts`: generated Next.js type declaration.
- `tsconfig.tsbuildinfo`: generated TypeScript incremental cache.
- `supabase/.temp/`: generated Supabase CLI link/runtime metadata; includes environment-specific project references and must not be treated as source.
- `.env.local`: local secrets/configuration; ignored and not inspected for values.
- `thatassistant-os-project-docs-v1.1/.DS_Store` and `docs/.DS_Store`: historical macOS metadata.

## Obsolete or conflicting artifacts

- All Partner/Founder mode requirements, routes, seed fixtures, enums, and navigation conflict with VA Edition.
- OpenAI-specific environment, SDK, prompt, and live E2E path conflict with the governing Anthropic adapter requirement.
- `package-lock.json` and npm commands conflict with the governing pnpm requirement.
- Legacy migrations conflict with the canonical roadmap schema and client-level scoping requirements.
- Root legacy documentation conflicts with current authority and should be archived with the old implementation.

No files were deleted or moved during this audit.
