# Governing build roadmap

Extracted from `thatassistant-os-project-docs-v1.1/What you should do next.docx`, sections 17–18. Order is unchanged. Complexity and risk are audit estimates, not source requirements. Every ticket is executed independently and stops for human review.

## Release 0 — Environment and governance

| Ticket | Title | Description / deliverables | Prerequisites and dependencies | Acceptance criteria | Complexity | Risk |
|---|---|---|---|---|---|---|
| T000 | Repository bootstrap | Private repo structure; Next.js TypeScript app; pnpm scripts/lock; strict TypeScript; lint/format; Vitest/Playwright baseline; `.env.example`; README | Governing roadmap; OD-005 legacy disposition | Clean checkout installs/runs; lint, typecheck, test, build pass; only placeholder shell | Medium | High |
| T001 | Claude Code governance | Root `CLAUDE.md`; architecture docs; ADR, ticket, build-journal templates; safe deterministic hooks/checks | T000 | Rules reference specification; concise `CLAUDE.md`; no destructive/production hook | Low | Medium |
| T002 | Local/staging services | Supabase local config; Inngest dev config; env validation; health checks; staging instructions | T000; current official service docs; accounts | Missing variables fail clearly; local/staging cannot use production identifiers | Medium | High |
| T003 | CI and observability baseline | CI; Sentry redaction; correlation IDs; privacy-safe logging | T000–T002; staging | Intentional staging error visible; raw fixture request content absent | Medium | High |

Release 0 gate: clean install/run, CI green, no secrets, preview deploy works, production remains empty.

## Release 1A — Secure foundation

| Ticket | Title | Description / deliverables | Prerequisites and dependencies | Acceptance criteria | Complexity | Risk |
|---|---|---|---|---|---|---|
| T010 | Identity and organisation schema | Profiles, organisations, memberships, migrations, generated types, RLS | Release 0 | Authorized org CRUD; cross-user denial tests; empty-database migration | High | Critical |
| T011 | Authentication experience | Sign-up, verification, sign-in/out, recovery, protected routes | T010 | Session/route tests; no app access without valid membership | Medium | High |
| T012 | Application shell | Responsive navigation, active-client indicator, account/org controls, honest empty states | T011 | Keyboard accessible; mobile capture path; unavailable modules feature-flagged | Medium | Medium |
| T013 | Client workspace schema and RLS | Clients, contacts, client access, archive status | T010 | Org/client invariants; cross-client access tests; archived client blocks workflows | High | Critical |
| T014 | Client creation and list | Client form/list/workspace overview/archive control | T012–T013 | Fictional clients; status/timezone; plain-language validation | Medium | Medium |
| T015 | Service pillars and scope | Seven-pillar selection and versioned capability rules | T013–T014 | Allowed/conditional/prohibited/unknown tests; rule source/version; AI cannot change scope | High | Critical |
| T016 | Client Brain foundation | Preferences, Brain items, sources, publication, supersession | T013–T015; OD-006 where relevant | Published item immutable; correction versions; drafts excluded from AI; sensitivity filter | High | Critical |
| T017 | File/source foundation | Private storage, metadata, hash, validation, safe download | T013, T016 | Guessed path and wrong-client denied; unsupported file rejected; AI processing waits for safe status | High | Critical |
| T018 | Activity timeline | Append-only activity service and client timeline | T010, T013–T017 | Key events visible; no raw secret/confidential payload; scoped access | Medium | High |
| T019 | Release 1A security gate | Run and fix full RLS/security suite; no features | T010–T018 | Release 1A gate signed in build journal | High | Critical |

## Release 1B — Daily delivery

| Ticket | Title | Description / deliverables | Prerequisites and dependencies | Acceptance criteria | Complexity | Risk |
|---|---|---|---|---|---|---|
| T020 | Workflow foundation | Versioned definitions, instances, transitions, events, idempotency, concurrency | T019 | Valid transitions pass; invalid/duplicate safe; state/event transaction test | High | Critical |
| T021 | Request capture | Request schema, form, list, detail | T020, T014 | Client confirmed; conflicting-client warning; no AI call on refresh | Medium | High |
| T022 | Scope-check step | Deterministic service-scope evaluation connected to requests | T015, T020–T021 | In-scope proceeds; conditional/unknown decision; prohibited boundary path only | High | Critical |
| T023 | AI gateway | Anthropic adapter, work-order envelope, prompt/model versions, run/token/cost records, mock provider | T002–T003, T019–T020 | Provider interface; mandatory schema validation; visible timeout/retry/failure; no secrets/client content in logs | High | Critical |
| T024 | Context assembler | Scoped retrieval and inspectable context manifest | T016–T017, T023 | Same-client published permitted context only; sensitivity/supersession tests; deterministic selection | High | Critical |
| T025 | Request interpretation | Director prompt/schema, source validator, evaluation fixtures | T021–T024 | Release 1 smoke gates; unknown owners/dates stay unknown/proposed; injection escalates | High | Critical |
| T026 | Decision Queue | Decision records, home cards, answer/resume flow | T020, T025 | Blocking prevents progress; answer resumes once; evidence recorded | High | High |
| T027 | Delivery plan review | Editable plan, sources, assumptions, approval and idempotent materialization | T025–T026 | Human edits preserved; stale AI cannot overwrite; materializes once | High | Critical |
| T028 | Work items | Creation, status, criteria, verification | T020, T027 | Correct client/request; incomplete work blocks completion; cancellation reason | Medium | High |
| T029 | Waiting items | Waiting state, follow-up date, ageing, resolution, home view | T020, T028 | Due logic; blocking wait prevents completion; resolution traceable | Medium | High |
| T030 | Communication drafts | Communication-role prompt/schema, draft review/versioning | T023–T025, T027 | Recipient snapshot; no send; source/tone visible; recipient change invalidates approval | High | Critical |
| T031 | Controlled Follow-Up | Due event, Follow-Up role, attempt limit, stop/escalate rules | T029–T030 | No autonomous recurring send; duplicate due event no duplicate draft; resolved wait cancels follow-up | High | Critical |
| T032 | Completion verification | Deterministic completion gate and manual evidence path | T026–T031; OD-006 | Open decisions/waits/work block; unverified external action not completed | High | Critical |
| T033 | Client update draft | Evidence-grounded completion update | T030, T032 | Recorded work only; editable/acceptable; copy-ready, no live send | Medium | High |
| T034 | AI feedback and evaluation dashboard | Correction/rejection capture and pilot metrics | T023–T025, T030, T033 | Original/corrected retained; no silent prompt/Brain update; task/model/prompt linked | High | High |
| T035 | Release 1B vertical-slice browser tests | Full path across four fixture clients and failure paths | T020–T034 | Complete path; cross-client isolation; provider recovery; mobile critical path | High | Critical |
| T036 | Founder-led pilot build | Onboarding hints, optional sample workspace, feedback capture only | T035 | Cresta tests without real client data; no feature expansion | Medium | Medium |
| T037 | Pilot analytics and cost controls | Privacy-minimized events, duration, AI cost, allowances, budget alerts | T023, T034–T036 | No identifying/content analytics; browser duplicates do not inflate counts; cost reconciles to `ai_runs`; allowance failure recoverable | High | High |
| T038 | Release 1B security and evaluation gate | Run complete security, isolation, workflow, AI, accessibility, and vertical-slice suites; fix gate failures only | T020–T037 | All section 10/16/17 evidence; no high-severity findings; accepted limitations; journal go/no-go | High | Critical |

## Later releases

Detailed tickets must be created only after the previous release gate passes:

1. **T100–T129:** meetings, calendar rules, and projects.
2. **T200–T229:** lifecycle and SOPs.
3. **T300–T329:** executive/personal support.
4. **T400–T419:** weekly operating layer.
5. **T500+:** integrations and specialist packs.

Do not invent detailed later-release tickets from headings alone.

## Global dependencies and controls

- Preserve tenant and client scope across data, files, retrieval, AI, workflows, events, and analytics.
- Use a modular monolith, relational source of truth, workers for durable jobs, versioned workflows/prompts, and typed/runtime-validated boundaries.
- Treat AI and retrieved content as untrusted proposals; record sources and uncertainty.
- Human approval never substitutes for permission, payload binding, execution, or provider verification.
- Use fictional/anonymized fixtures and never commit secrets or real client data.
- Complete applicable functional, data, security, AI, workflow, quality, and documentation definition-of-done checks for every ticket.
