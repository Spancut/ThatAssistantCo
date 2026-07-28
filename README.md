# ThatAssistant OS — VA Edition

ThatAssistant OS is a Human + AI client-delivery operating system for professional virtual and executive assistants. The VA remains Head of Client Delivery.

## Current stage

- Edition: **VA Edition**
- Release: **Release 0 — Environment and governance**
- Completed tickets: **T000–T002**
- Active ticket: **T003 — CI and observability baseline** (implementation complete;
  external staging Sentry acceptance pending)
- Next roadmap ticket: **T010 — Identity and organisation schema**, not authorised
  until T003 acceptance is complete and explicitly approved

The previous Project Atlas implementation is archived on `archive/project-atlas-foundation` at commit `d316d9101f647549d73390a457eb59aa054f258c`. It is not part of the active implementation root.

## Authoritative documentation

Read in this order:

1. `AGENTS.md`
2. `docs/source-of-truth-index.md`
3. `thatassistant-os-project-docs-v1.1/docs/10-blueprint-revision-1.1.md`
4. `thatassistant-os-project-docs-v1.1/What you should do next.docx`

The Word document governs build sequence and implementation detail unless a later product-owner decision explicitly supersedes a section.

## Requirements

- Node.js 24.11.x
- Corepack
- pnpm 11.17.0
- Docker Desktop with Linux containers for local Supabase

## Local setup

```powershell
$env:NODE_OPTIONS='--use-system-ca'
corepack prepare pnpm@11.17.0 --activate
corepack pnpm install --frozen-lockfile
Copy-Item .env.example .env.local
corepack pnpm env:check
corepack pnpm dev:local
```

Open `http://localhost:3000`.

`NODE_OPTIONS=--use-system-ca` is only needed on machines whose Node runtime must use the operating-system certificate store.

## Checks

```powershell
corepack pnpm format:check
corepack pnpm env:check:example
corepack pnpm governance:check
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm test:e2e
corepack pnpm build
```

See `docs/local-development.md` for separate service commands and
`docs/staging.md` for isolated staging setup. See `docs/observability.md` for the
T003 privacy boundary and staging acceptance procedure. The repository contains no authentication,
application schema, AI, domain workflow, integration, or Release 1 feature.

## Ticket discipline

Work on one explicitly approved numbered ticket at a time. Update `docs/build-journal.md`, satisfy the ticket acceptance criteria, and stop for review before starting the next ticket.
