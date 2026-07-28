# Source-of-truth index

Status: initialized 2026-07-28. This index governs documentation discovery only; it does not authorize production implementation.

## Authority hierarchy

Use the narrowest applicable source at the highest available level:

1. Explicit written product-owner decisions recorded after 2026-07-28.
2. `thatassistant-os-project-docs-v1.1/docs/10-blueprint-revision-1.1.md` for product intent and revision 1.1 decisions.
3. An explicitly approved Part 11 build specification for implementation detail. The supplied Word document is a candidate, but its approval and package status conflict is unresolved in OD-001.
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
| `.../docs/04-workflows.md` | Supporting specification | Shared states, universal pattern, workflow catalogue, first vertical slice | Topic authority beneath Blueprint | Word Part 11 uses a more specific Release 1 state model; mapping needs approval with Part 11 (OD-001) | Workflows, waiting, completion |
| `.../docs/05-ux-specification.md` | Supporting specification | Navigation, core screens, activation and exception states | Topic authority beneath Blueprint | Depends on workflow and role model | UX and information architecture |
| `.../docs/06-technical-architecture.md` | Supporting specification | Modular architecture, data domains, workflow and action principles | Topic authority beneath Blueprint | Word Part 11 fixes concrete technology while package says that decision is pending (OD-003) | Architecture, data, integrations |
| `.../docs/07-ai-orchestration.md` | Supporting specification | AI work orders, context, schemas, evidence, uncertainty and evaluations | Topic authority beneath Blueprint | Provider choice in Word Part 11 is not approved by package status (OD-003) | AI orchestration and evaluation |
| `.../docs/08-security-permissions.md` | Supporting specification | Roles, approval binding, privacy, injection defenses, release blockers | Binding safety constraint beneath Blueprint | Must be reconciled with any implementation spec | Security, permissions, approvals |
| `.../docs/09-validation-commercialisation.md` | Supporting specification | Hypotheses, pilot design, validation and packaging | Topic authority beneath Blueprint | Commercial claims remain unproven | Pilot, evidence, commercialization |
| `.../docs/10-blueprint-revision-1.1.md` | Authoritative specification | Revision 1.1 product blueprint and release strategy | Highest supplied product authority | Must prevail over implementation detail | Product, scope, release roadmap, safety |
| `.../docs/11-build-specification/README.md` | Supporting placeholder | Planned Part 11 section map and authorization warning | Governing phase warning unless superseded explicitly | Conflicts with full Word Part 11 (OD-001) | Build-spec process |
| `.../docs/11-build-specification/11A-documentation-setup.md` | Authoritative instruction | Completed documentation setup phase and permanent rules | Authoritative for Part 11A only | Does not authorize production code | Documentation initialization |
| `.../prompts/00-claude-code-bootstrap.md` | Template | Readiness-review prompt for a future coding agent | Template only | Says no stack decisions and no code | Bootstrap/readiness |
| `.../tests/fixtures/README.md` | Template | Rules for fictional, anonymized evaluation fixtures | Governing fixture safety when tests begin | No current fixtures supplied | Test data safety |
| `.../What you should do next.docx` | Unresolved candidate specification | Complete 27-section Part 11 build specification, fixed stack, schema, workflows, releases R0–R6 and tickets T000–T038 | Claims “governing build specification,” but is not listed in the manifest and conflicts with package phase status | OD-001, OD-002, OD-003, OD-004; do not implement from it yet | Full implementation detail |
| `.../.DS_Store` | Historical metadata | macOS folder metadata; no specification content | None | Omitted from manifest; Git-ignored | None |
| `.../docs/.DS_Store` | Historical metadata | macOS folder metadata; no specification content | None | Omitted from manifest; Git-ignored | None |

`...` in the table means `thatassistant-os-project-docs-v1.1`.

## Excluded legacy repository surface

The following pre-date the authoritative package and must not influence the rebuild:

- Production-looking code and assets: `app/`, `components/`, `lib/`, `public/`, `scripts/`, `supabase/`.
- Existing tests: `e2e/`, `test/`.
- Generated/dependency directories: `.next/`, `node_modules/`.
- Existing application configuration and package files in the repository root.
- Pre-existing root `README.md`, `CLAUDE.md`, and the former contents of `AGENTS.md`.
- Pre-existing topic documents in `docs/`: `ai-orchestration.md`, `architecture.md`, `build-plan.md`, `data-model.md`, `decisions.md`, `mvp-scope.md`, `product-brief.md`, `roles-and-permissions.md`, and `security-and-approval-policy.md`.
- Git commits through `d316d91` (“Milestone 3”) and their Project Atlas assumptions.

These artifacts were identified by path and Git history only and were not used to derive the initialized product specification. Their deletion, archival, or reuse requires an explicit decision (OD-005).

## Coverage check

The inventory contains all 21 files physically supplied in the package: 19 substantive files plus two `.DS_Store` metadata files. The manifest lists 17 files and omits itself, the Word specification, and the two metadata files; that mismatch is intentionally unresolved.
