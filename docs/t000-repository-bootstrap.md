# T000 — Repository bootstrap

Release: Release 0 — Environment and governance

Status: Complete

Specification sections: Part 11 §§3–5, 17–20, 22; T000 execution prompt

## Initial repository state

- Starting reviewed commit: `5d7ba39` on `codex/specification-traceability`.
- Active root contained authoritative VA Edition docs mixed with a committed Project Atlas Next.js/Supabase/OpenAI application.
- Ignored/local artifacts included `.next/`, `node_modules/`, `.env.local`, Supabase link metadata, and generated TypeScript files.
- Local checkout had no configured Git remote.

## Archive confirmation

- Archive branch: `archive/project-atlas-foundation`.
- Archive commit: `d316d9101f647549d73390a457eb59aa054f258c`.
- Commit contains the final Project Atlas implementation and 135 tracked files at that historical point.
- Generated dependencies/caches are deliberately excluded from archival material.
- Cleanup commit: `407049a`.
- Bootstrap foundation commit: `e3754e2`.

## Initial top-level disposition

| Initial item | Disposition | Outcome |
|---|---|---|
| `.git/` | KEEP | Preserved with archive branch |
| `thatassistant-os-project-docs-v1.1/` | KEEP | Preserved intact |
| `docs/` current audit/spec files | KEEP | Preserved and updated |
| `docs/` nine Project Atlas files | REMOVE | Removed; recoverable from archive |
| `AGENTS.md` | KEEP | Preserved; no speculative rules added |
| `.gitignore` | KEEP / UPDATE | Simplified for pnpm/T000 and secret-file exclusions |
| `app/` | REMOVE / REGENERATE | Legacy routes removed; three-file placeholder app created |
| `components/`, `lib/`, `public/` | REMOVE | Legacy implementation/assets removed |
| `supabase/` and migrations | REMOVE / REGENERATE LATER | Removed; T002/T010+ recreate approved structure |
| `scripts/` | REMOVE / REGENERATE LATER | Legacy seed removed |
| `e2e/`, `test/` | REMOVE / REGENERATE | Legacy tests removed; T000 baseline created under `tests/` |
| `.next/`, `node_modules/`, caches | REMOVE / GENERATED | Legacy copies deleted; validation regenerates ignored local copies |
| Root app/dependency/config files | REMOVE / REGENERATE | Replaced with pinned T000 equivalents |
| `.env.local` | REMOVE | Deleted; not committed or archived as source |
| `.env.example` | REMOVE / REGENERATE | Replaced with non-secret T000 public URL only |
| Root legacy `README.md`, `CLAUDE.md` | REMOVE | README replaced; root CLAUDE remains T001 |
| Generic old assets | REMOVE | No active product assets retained |

## Files retained

- Entire authoritative documentation package, including the governing Word document.
- Current product summary, domain model, scope, source hierarchy, decisions, audits, roadmap, traceability, progress, and build journal.
- `AGENTS.md` and Git history.

## Files created or regenerated

- Minimal `app/` placeholder.
- `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`.
- Strict TypeScript, Next.js, ESLint, Prettier, Vitest, and Playwright configuration.
- `.env.example`, README, contribution guidance.
- Unit/browser baseline tests.
- Approved ADR, ticket, PR, and issue templates.

## Selected versions

| Tool | Version | Note |
|---|---:|---|
| Node.js | 24.11.0 | Installed runtime; supported by Next.js and Playwright |
| pnpm | 11.17.0 | Pinned through Corepack and `packageManager` |
| Next.js | 16.2.12 | Current stable at initialization |
| React / React DOM | 19.2.8 | Current stable pair at initialization |
| TypeScript | 5.9.3 | Current compatible stable line for Next ESLint tooling |
| ESLint | 9.39.5 | Current compatible stable line for Next plugins |
| Prettier | 3.9.6 | Current stable at initialization |
| Vitest | 4.1.10 | Current stable at initialization |
| Playwright Test | 1.61.1 | Current stable at initialization |

TypeScript 7 and ESLint 10 were evaluated but rejected because the current Next.js lint toolchain reported unmet peer ranges. The lockfile records the selected compatible versions.

## Native dependency policy

pnpm allows install scripts only for:

- `sharp` — Next.js image/runtime dependency.
- `unrs-resolver` — resolver native package used by the lint toolchain.

No broad build-script approval is enabled.

## Final root structure

```text
.github/
app/
docs/
  adr/
  tickets/
tests/
  e2e/
  unit/
thatassistant-os-project-docs-v1.1/
.env.example
.gitignore
.prettierignore
.prettierrc.json
AGENTS.md
CONTRIBUTING.md
README.md
eslint.config.mjs
next.config.ts
package.json
playwright.config.ts
pnpm-lock.yaml
pnpm-workspace.yaml
tsconfig.json
vitest.config.ts
```

Ignored validation artifacts such as `.next/`, `node_modules/`, `next-env.d.ts`, and test reports are not part of the canonical source tree.

## Validation results

- Archive branch resolves to the recorded legacy SHA.
- Project Atlas source, migrations, tests, configuration, scripts, and assets are absent from the active root.
- Authoritative package and Word document remain.
- `pnpm install` completed; lockfile passes pnpm supply-chain policies.
- `pnpm peers check`: no peer dependency issues.
- `pnpm format:check`: passed.
- `pnpm lint`: passed.
- `pnpm typecheck`: passed.
- `pnpm test`: 1/1 passed.
- `pnpm build`: passed; only `/` and framework `_not-found` routes.
- `pnpm test:e2e`: 1/1 Chromium smoke test passed.
- Legacy browser tests were not run.

## Acceptance criteria

- [x] Clean checkout has pinned pnpm install/run instructions and lockfile.
- [x] Lint, format, typecheck, unit test, browser baseline, and production build pass.
- [x] No application feature exists beyond the placeholder shell.
- [x] Legacy Project Atlas is recoverable and absent from the active root.
- [x] No Release 1 implementation began.

## Deferred and unresolved

- OD-006 and OD-007 remain open but do not block T000.
- Root `CLAUDE.md`, architecture docs, ADR process, ticket governance, and safe hooks are T001 work; templates alone do not complete T001.
- Git remote/push/PR status is checked after the final T000 commit.

## Next ticket

T001 — Claude Code governance. It must be explicitly approved before work begins.
