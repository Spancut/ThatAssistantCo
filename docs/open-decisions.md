# Open decisions

Only genuine contradictions or choices with implementation impact belong here. Product implementation remains blocked where noted.

## OD-001 — Is the supplied Word Part 11 approved and governing?

- **Conflicting sources:** package `README.md`, `MANIFEST.json`, `docs/00-source-of-truth-index.md`, `docs/11-build-specification/README.md`; versus `What you should do next.docx`.
- **Exact issue:** the Markdown package says only Part 11A is complete, Part 11 is not complete, the next step is Part 11B, and production code is unauthorized. The Word file contains a complete Part 11, calls itself the “Governing build specification,” and directs work to T000.
- **Impact:** determines whether the fixed stack, schema, releases, ticket sequence, and implementation gates may be used.
- **Safe options:** (A) formally approve the Word Part 11 and update the package metadata; (B) mark it as a draft/input and continue the staged Part 11 process; (C) approve selected sections with explicit exceptions.
- **Recommendation:** choose A only after a short product-owner review, convert the approved content into versioned repository Markdown, and update the manifest/index in the same decision.
- **Blocked:** all production implementation, including T000.

## OD-002 — Which internal hierarchy applies to Part 11?

- **Conflicting sources:** package `CLAUDE.md`; Word Part 11 section 0.1.
- **Exact issue:** `CLAUDE.md` places an approved Part 11 immediately below the Blueprint. The Word document places itself below Parts 1–10 while still calling itself governing.
- **Impact:** affects conflict resolution between implementation details and topic specifications.
- **Safe options:** (A) product intent in Blueprint and Parts 1–10 always prevails, with Part 11 filling implementation gaps; (B) approved Part 11 prevails for implementation-only detail, never product intent or safety; (C) publish a field-by-field precedence matrix.
- **Recommendation:** adopt B and state it identically in all package indexes.
- **Blocked:** only implementation choices where Part 11 and a topic document differ.

## OD-003 — Is the fixed technology stack accepted?

- **Conflicting sources:** `MANIFEST.json`, package `README.md`, bootstrap prompt, and Part 11 placeholder; versus Word Part 11 section 3.
- **Exact issue:** package metadata says “Part 11B — Technology Stack Decision” is next and prohibits stack decisions. The Word file fixes TypeScript, pnpm, Next.js, Supabase, Inngest, Anthropic, Vercel, and supporting services.
- **Impact:** repository bootstrap, dependencies, provider credentials, hosting, data layer, jobs, observability, and cost.
- **Safe options:** (A) accept the Word stack as written; (B) run Part 11B and validate each choice; (C) accept core choices and defer optional services.
- **Recommendation:** perform a focused Part 11B ratification against current official documentation and record accepted choices as ADRs.
- **Blocked:** production bootstrap and provider setup.

## OD-004 — What does “Release 1” mean?

- **Conflicting sources:** Blueprint Revision 1.1 and `02-product-scope.md`; versus Word Part 11 sections 17–18.
- **Exact issue:** the Blueprint describes Release 1 as the foundation and daily-delivery loop, while the Word specification divides it into Release 1A (secure foundation) and 1B (daily delivery), preceded by Release 0.
- **Impact:** milestone naming, acceptance gates, planning, and statements about MVP completion.
- **Safe options:** (A) treat 1A and 1B as internal increments of Blueprint Release 1; (B) rename milestones; (C) retain both labels with a published mapping.
- **Recommendation:** adopt A and require both 1A and 1B before declaring Blueprint Release 1 complete.
- **Blocked:** release reporting; not documentation initialization.

## OD-005 — How should the old Project Atlas implementation be disposed?

- **Conflicting inputs:** the product owner declared Project Atlas abandoned and the folder clean; repository inspection found a committed Next.js/Supabase application through Milestone 3, plus tests, migrations, generated output, dependencies, and old documentation.
- **Exact issue:** the code physically coexists with the new package and could contaminate or obstruct a clean bootstrap.
- **Impact:** repository structure, history, dependency choices, security assumptions, build commands, and accidental reuse.
- **Safe options:** (A) archive the legacy tree/tag and establish a clean root; (B) create a new empty repository and import only approved docs; (C) retain legacy files in place but explicitly quarantine them until a later controlled replacement.
- **Recommendation:** B is cleanest; A is acceptable if historical traceability in this repository matters. Do not perform either without explicit approval and a recovery plan.
- **Blocked:** production implementation and repository bootstrap. No files may be deleted automatically.

## OD-006 — Should exceptions and completion evidence be first-class records?

- **Conflicting/unclear sources:** workflow and UX documents require visible exceptions and completion evidence; the Word logical schema specifies decisions, waiting items, activity, workflow events, and completion fields but no explicit `exceptions`, `evidence`, or `completion_verifications` table.
- **Exact issue:** it is unclear whether these are distinct durable entities or typed records represented through decisions, events, activity, and work-item fields.
- **Impact:** auditability, reporting, workflow recovery, and schema design.
- **Safe options:** (A) dedicated entities; (B) typed event/activity records with strict schemas; (C) a hybrid where only blocking exceptions and completion attestations are first-class.
- **Recommendation:** choose C during schema design and document lifecycle/retention rules before migrations.
- **Blocked:** relevant schema migrations; not documentation initialization.

## OD-007 — Which document representation is the durable source?

- **Conflicting inputs:** the manifest and package index enumerate Markdown sources, while the only complete Part 11 is an unlisted `.docx`.
- **Exact issue:** Word content is difficult to diff, review, link, and keep synchronized with the package manifest.
- **Impact:** change control, review quality, agent retrieval, and audit history.
- **Safe options:** (A) convert approved Part 11 to sectioned Markdown and retain the Word file as historical input; (B) keep Word authoritative and generate Markdown mirrors; (C) split it across the planned `11A`–`11N` files.
- **Recommendation:** C, with one manifest and explicit status on every section.
- **Blocked:** formal Part 11 approval/versioning; not this initialization.
