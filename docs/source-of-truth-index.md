# Source-of-truth index

Status: updated 2026-07-28 after the product owner designated the supplied Word document as the governing implementation roadmap.

## Authority hierarchy

Use the narrowest applicable source at the highest available level:

1. Explicit written product-owner decisions recorded after 2026-07-28.
2. `thatassistant-os-project-docs-v1.1/docs/10-blueprint-revision-1.1.md` for product intent and revision 1.1 decisions.
3. `thatassistant-os-project-docs-v1.1/What you should do next.docx` for implementation detail. The product owner explicitly made it governing on 2026-07-28.
4. Topic documents `01`–`09`, with security and AI constraints overriding convenience but not the Blueprint.
5. Documentation-phase instructions in `11A-documentation-setup.md`, this initialized documentation set, and repository `AGENTS.md`.
6. Templates and bootstrap prompts, which guide format and process but cannot create product requirements.

If sources at any level conflict, do not guess. Record the conflict in `docs/open-decisions.md` and stop only the affected work. The pre-existing repository implementation and root documentation are excluded legacy material, not a lower authority tier.

## Supplied package inventory

| File | Class | Purpose and scope | Authority | Dependencies / conflicts | Areas governed |
|---|---|---|---|---|---|
| `thatassistant-os-project-docs-v1.1/README.md` | Supporting instruction | Package entry point, reading order, phase status | Governing for package navigation; not product requirements | Conflicts with the Word document on Part 11 completeness (OD-001) | Package use, implementation hold |
| `thatassistant-os-project-docs-v1.1/CLAUDE.md` | Supporting instruction | Permanent build behavior and safety rules | Governing operational instruction where consistent with higher sources | Its hierarchy differs from the Word document (OD-002) | Tenancy, AI safety, actions, testing, modularity |
| `thatassistant-os-project-docs-v1.1/MANIFEST.json` | Supporting metadata | Machine-readable package status and file list | Evidence of intended package state | Omits the Word file and metadata files; conflicts on next step (OD-001, OD-003) | Package completeness, next phase |
| `thatassistant-os-project-docs-v1.1/docs/00-source-of-truth-index.md` | Supporting index | Original document map and conflict rule | Superseded for repository navigation by this file; retained as package evidence | Says Part 11 is incomplete (OD-001) | Reading order, source relationships |
| `.../docs/01-product-foundation.md` | Supporting specification | User, problem, promise, principles, non-goals | Topic authority beneath Blueprint | Depends on Blueprint | Product foundation |
| `.../docs/02-product-scope.md` | Supporting specification | Seven operating pillars, first-release breadth, expansion boundaries | Topic authority beneath Blueprint | Release naming differs in granularity from Word Part 11 (OD-004) | Scope and sequencing |
| `.../docs/03-human-ai-organisation.md` | Supporting specification | Human authority and logical AI specialist roles | Topic authority beneath Blueprint | Consistent with security and AI docs | Roles, delegation, human control |
| `.../docs/04-workflows.md` | Supporting specification | Shared states, universal pattern, workflow catalogue, first vertical slice | Topic authority beneath Blueprint | Word Part 11 supplies the governing Release 1 implementation state model | Workflows, waiting, completion |
| `.../docs/05-ux-specification.md` | Supporting specification | Navigation, core screens, activation and exception states | Topic authority beneath Blueprint | Depends on workflow and role model | UX and information architecture |
| `.../docs/06-technical-architecture.md` | Supporting specification | Modular architecture, data domains, workflow and action principles | Topic authority beneath Blueprint | Word Part 11 now governs concrete technology choices | Architecture, data, integrations |
| `.../docs/07-ai-orchestration.md` | Supporting specification | AI work orders, context, schemas, evidence, uncertainty and evaluations | Topic authority beneath Blueprint | Word Part 11 governs the Anthropic provider implementation | AI orchestration and evaluation |
| `.../docs/08-security-permissions.md` | Supporting specification | Roles, approval binding, privacy, injection defenses, release blockers | Binding safety constraint beneath Blueprint | Must be reconciled with any implementation spec | Security, permissions, approvals |
| `.../docs/09-validation-commercialisation.md` | Supporting specification | Hypotheses, pilot design, validation and packaging | Topic authority beneath Blueprint | Commercial claims remain unproven | Pilot, evidence, commercialization |
| `.../docs/10-blueprint-revision-1.1.md` | Authoritative specification | Revision 1.1 product blueprint and release strategy | Highest supplied product authority | Must prevail over implementation detail | Product, scope, release roadmap, safety |
| `.../docs/11-build-specification/README.md` | Historical placeholder | Planned Part 11 section map and former authorization warning | Superseded by the product-owner approval of the full Word Part 11 | Retained as package history | Build-spec process |
| `.../docs/11-build-specification/11A-documentation-setup.md` | Authoritative instruction | Completed documentation setup phase and permanent rules | Authoritative for Part 11A only | Does not authorize production code | Documentation initialization |
| `.../prompts/00-claude-code-bootstrap.md` | Template | Readiness-review prompt for a future coding agent | Template only | Says no stack decisions and no code | Bootstrap/readiness |
| `.../tests/fixtures/README.md` | Template | Rules for fictional, anonymized evaluation fixtures | Governing fixture safety when tests begin | No current fixtures supplied | Test data safety |
| `.../What you should do next.docx` | Authoritative implementation roadmap | Complete 27-section Part 11 build specification, fixed stack, schema, workflows, releases R0–R6 and tickets T000–T038 | Governing for implementation unless explicitly superseded | Product-owner instruction resolves former OD-001 and OD-003; hierarchy interpretation remains recorded | Full implementation detail |
| `.../.DS_Store` | Removed metadata | macOS folder metadata; no specification content | None | Removed from the active root by T000 | None |
| `.../docs/.DS_Store` | Removed metadata | macOS folder metadata; no specification content | None | Removed from the active root by T000 | None |

`...` in the table means `thatassistant-os-project-docs-v1.1`.

## Archived legacy repository surface

The following pre-date the authoritative package and were removed from the active root by T000. They remain recoverable on `archive/project-atlas-foundation` at `d316d9101f647549d73390a457eb59aa054f258c` and must not influence the rebuild:

- Production-looking code and assets: `app/`, `components/`, `lib/`, `public/`, `scripts/`, `supabase/`.
- Existing tests: `e2e/`, `test/`.
- Generated/dependency directories: `.next/`, `node_modules/`.
- Existing application configuration and package files in the repository root.
- Pre-existing root `README.md`, `CLAUDE.md`, and the former contents of `AGENTS.md`.
- Pre-existing topic documents in `docs/`: `ai-orchestration.md`, `architecture.md`, `build-plan.md`, `data-model.md`, `decisions.md`, `mvp-scope.md`, `product-brief.md`, `roles-and-permissions.md`, and `security-and-approval-policy.md`.
- Git commits through `d316d91` (“Milestone 3”) and their Project Atlas assumptions.

OD-005 authorized their archival and removal. Reuse of any specific artifact requires a later explicit ticket-level decision and review.

## Coverage check

The active package contains all 19 substantive supplied files. T000 removed two `.DS_Store` metadata files because they carried no specification content. The manifest lists 17 files and omits itself and the Word specification; that historical mismatch remains documented.
