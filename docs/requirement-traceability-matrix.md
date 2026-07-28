# Requirement traceability matrix

Audit basis: all repository documentation, with the authority hierarchy in `docs/source-of-truth-index.md`. “Current implementation” means evidence in the checked-in repository, not historical claims. Project Atlas requirements are included as `SUPERSEDED` where they materially explain existing code.

Status vocabulary: `NOT STARTED`, `PARTIALLY COMPLETE`, `COMPLETE`, `SUPERSEDED`, `BLOCKED`, `UNKNOWN`.

## Product, authority, and cross-cutting requirements

| ID | Requirement summary | Source / section | Status | Implementation location / existing files | Related entities | Dependencies | Missing work | Next ticket |
|---|---|---|---|---|---|---|---|---|
| PROD-001 | VA Edition serves professional VAs/EAs managing multiple clients | Blueprint §2; Product Foundation | NOT STARTED | Legacy Partner/Founder copy conflicts | tenant, client, user | T000/T001 | Replace product modes/copy/navigation | T012 |
| PROD-002 | VA remains Head of Client Delivery and final authority | Blueprint §3; Human+AI Organisation | NOT STARTED | Governance states the rule; no product workflow exists | user, approval | Role/permission model | Apply authority across all workflows | T001/T026 |
| PROD-003 | Seven pillars are core but released in vertical slices | Blueprint §§4–6; Scope | NOT STARTED | No pillar model | service pillar, capability | Client schema | Model/select pillars and defer depth | T015 |
| PROD-004 | Founder and Agency Editions remain future | Blueprint §15; Product Summary | NOT STARTED | Current app exposes Founder mode | edition, organisation | Legacy archive | Remove current Founder surface from initial build | T000/T012 |
| PROD-005 | First proof is complete Request-to-Delivery loop | Blueprint §8; Part 11 §27 | NOT STARTED | No request/delivery workflow | request, plan, work, waiting | R1A and T020 | Build T021–T033 in order | T020 |
| GOV-001 | Blueprint is highest product authority | Blueprint status; source index | COMPLETE | `docs/source-of-truth-index.md`, `AGENTS.md` | knowledge source | Product-owner decision | Keep updated | T001 |
| GOV-002 | Word Part 11 governs implementation | Product-owner instruction; Part 11 | COMPLETE | Source index/open decisions updated | roadmap, ticket | Explicit decision | Convert to diffable Markdown later | T001 |
| GOV-003 | Execute one approved ticket and stop for review | Part 11 §§0.3,18,20 | COMPLETE | Root `CLAUDE.md`, aligned `AGENTS.md`, ticket/journal templates, governance check | ticket, audit | T001 | Continue ticket-boundary discipline | Per ticket |
| GOV-004 | Never invent missing requirements or later tickets | Part 11 §§0.3,18 | COMPLETE | `AGENTS.md`, roadmap later-release guard | ticket | Source hierarchy | Maintain discipline | T001 |
| GOV-005 | Update build journal after each task | Part 11 §§19–20 | COMPLETE | `docs/build-journal.md`, `AGENTS.md` | ticket, evidence | None | Continue entries | T001 |
| ARCH-001 | Modular monolith with clear domain modules | Technical Architecture; Part 11 §2 | PARTIALLY COMPLETE | T000 creates one minimal Next.js app; domain modules intentionally absent | module | T000 | Add modules only through approved tickets | T010 onward |
| ARCH-002 | Relational database is authoritative state | Blueprint; Part 11 §2 | NOT STARTED | Legacy migrations archived; no active database code | all domain entities | Canonical schema | Build approved schema from clean baseline | T010 onward |
| ARCH-003 | Durable workers handle retries/delays/background steps | Architecture; Part 11 §3 | NOT STARTED | No Inngest | workflow event, job | Env setup | Add worker config/contracts | T002/T020 |
| ARCH-004 | Workflows/prompts/events are explicit and versioned | Workflows; AI; Part 11 §§8–9 | NOT STARTED | No active workflow or prompt code | definition, prompt | Workflow foundation | Full versions/transitions/events | T020/T023 |
| ARCH-005 | Typed boundaries plus runtime validation | CLAUDE; Part 11 §2 | PARTIALLY COMPLETE | Strict TypeScript baseline passes; runtime domain boundaries do not exist | command, event, AI result | Domain tickets | Add runtime schemas with each boundary | T010 onward |
| SAFE-001 | Every client-owned record carries tenant and client scope | Blueprint; Security; Part 11 §5 | NOT STARTED | No active client-owned records | tenant, client | T010/T013 | Client access/invariants everywhere | T013 |
| SAFE-002 | Resolve identity/access/client before retrieval or AI | AI; Security; Part 11 §§5,9 | NOT STARTED | No active identity, client, retrieval, or AI code | user, membership, client access | Canonical client access | Add deterministic client resolution | T013/T024 |
| SAFE-003 | AI output is proposal, schema-validated, reviewable | Human+AI; AI; Part 11 §9 | NOT STARTED | Legacy AI archived; active root has no AI | ai run, output | T023 | Implement through governed gateway | T023 |
| SAFE-004 | AI cannot grant scope/permissions or self-approve | Security; Part 11 §§5,9 | NOT STARTED | Governance rule only; no active AI | scope rule, approval | T015/T023 | Deterministic enforcement/tests | T015/T023 |
| SAFE-005 | No silent Client Brain learning/publication | AI; Security; Part 11 §7 | NOT STARTED | Legacy knowledge is mutable; no publication lifecycle | brain item, feedback | T016 | Draft/publish/supersede and feedback separation | T016/T034 |
| SAFE-006 | Material claims retain source support and uncertainty | AI; Part 11 §9 | NOT STARTED | No active AI/source implementation | source, claim, evidence | Context manifest | Source validator and evidence links | T024/T025 |
| SAFE-007 | Retrieved/uploaded content is untrusted; injection escalates | Security; Part 11 §§9,14 | NOT STARTED | Prompt safety prose only | source, exception | File/context pipeline | Injection fixtures and controls | T017/T025 |
| SAFE-008 | External actions require permission, bound approval, idempotency, verification | Security; Part 11 §13 | NOT STARTED | No external action system | action, approval, attempt | Later integration gate | Full lifecycle/adapters | T500+ |
| SAFE-009 | Release 1 has no live send/action capability | Scope; Part 11 §§13,17 | COMPLETE | No send/publish path | communication draft | None | Preserve through T038 | T030/T038 |
| SAFE-010 | Secrets/real client data never enter commits, fixtures, logs, analytics | Security; Part 11 §§14–15 | PARTIALLY COMPLETE | T000 removes credentials/legacy fixtures; T001 adds tracked/unignored secret scanning; later telemetry controls absent | source, log, event | T003/T035 | Redaction and analytics allowlist | T003/T035 |
| UX-001 | Home is “What Needs You” across decisions/waiting/work | UX §3; Part 11 §11 | NOT STARTED | Legacy dashboard cards | decision, waiting, work | T026/T029 | Build prioritized home | T026/T029 |
| UX-002 | Active client is visible and switching is safe | UX; Part 11 §11 | NOT STARTED | Org slug only | client, client access | T013/T012 | Active-client shell/control | T012 |
| UX-003 | Responsive, keyboard-accessible mobile capture path | UX; Part 11 §11 | PARTIALLY COMPLETE | T000 placeholder is responsive/semantic; capture workflow absent | request | T012/T021 | Accessibility and mobile capture verification | T012/T035 |
| UX-004 | Unavailable modules are honest, not fake-functional | UX; Part 11 §11 | COMPLETE | T000 exposes only an honest placeholder and no fake controls | feature flag | T012 | Preserve when shell/modules arrive | T012 |

## Roadmap ticket requirements

| ID | Requirement summary | Source / section | Status | Implementation location / existing files | Related entities | Dependencies | Missing work | Next ticket |
|---|---|---|---|---|---|---|---|---|
| T000-R | Repository bootstrap meets fixed stack and clean-install gate | Part 11 §18 T000 | COMPLETE | Pinned pnpm/Next app, strict TS, format/lint, Vitest/Playwright, env example, README | repository | OD-005 resolved | None | T001 |
| T001-R | Claude Code governance package | Part 11 §18 T001 | COMPLETE | Root `CLAUDE.md`, architecture governance, aligned agent rules, complete ADR/ticket/journal templates, read-only governance check | ticket, ADR | T000 | None | T002 |
| T002-R | Local/staging Supabase+Inngest, env validation, health | Part 11 §18 T002 | NOT STARTED | T000 `.env.example` contains public URL only | environment | T000 | Entire ticket | T002 |
| T003-R | CI, Sentry, correlation, privacy-safe logs | Part 11 §18 T003 | NOT STARTED | No CI/observability config | log, trace | T002 | Entire ticket | T003 |
| T010-R | Identity/organisation schema, types, RLS, empty migration | Part 11 §18 T010 | NOT STARTED | Legacy migration archived; no active schema | profile, org, membership | T003 | Entire ticket | T010 |
| T011-R | Complete auth experience and membership gate | Part 11 §18 T011 | NOT STARTED | Legacy auth archived | user, membership | T010 | Entire ticket | T011 |
| T012-R | Accessible application shell with active client | Part 11 §18 T012 | NOT STARTED | T000 placeholder is not the application shell | client, org | T011 | Entire ticket | T012 |
| T013-R | Client workspace schema, access, RLS, archive invariant | Part 11 §18 T013 | NOT STARTED | Legacy client schema archived | client, contact, client access | T010 | Entire ticket | T013 |
| T014-R | Client create/list/overview/archive with timezone | Part 11 §18 T014 | NOT STARTED | Legacy client UI archived | client | T013 | Entire ticket | T014 |
| T015-R | Seven pillars and deterministic scope rules | Part 11 §18 T015 | NOT STARTED | None | pillar, capability, scope rule | T013/T014 | Entire ticket | T015 |
| T016-R | Governed Client Brain | Part 11 §18 T016 | NOT STARTED | Legacy mutable knowledge archived | brain item, source | T015 | Entire ticket | T016 |
| T017-R | Private validated file/source foundation | Part 11 §18 T017 | NOT STARTED | Storage planned only | source, file | T016 | Entire ticket | T017 |
| T018-R | Append-only scoped client activity timeline | Part 11 §18 T018 | NOT STARTED | Legacy audit service archived | activity, audit | T013–T017 | Entire ticket | T018 |
| T019-R | Release 1A security gate | Part 11 §18 T019 | NOT STARTED | Historical throwaway RLS checks only | security evidence | T010–T018 | Permanent suite and sign-off | T019 |
| T020-R | Versioned workflow engine | Part 11 §18 T020 | NOT STARTED | Legacy `workflow_runs` is invocation log only | workflow definition/run/event | T019 | Entire ticket | T020 |
| T021-R | Client-confirmed request capture | Part 11 §18 T021 | NOT STARTED | Email prompt is not request record | request | T020 | Schema/form/list/detail/conflict warning | T021 |
| T022-R | Deterministic scope-check workflow step | Part 11 §18 T022 | NOT STARTED | None | request, scope rule, decision | T015/T021 | Entire ticket | T022 |
| T023-R | Anthropic AI gateway with full run metadata | Part 11 §18 T023 | NOT STARTED | Legacy OpenAI implementation archived | ai run, prompt version | T002/T020 | Entire ticket | T023 |
| T024-R | Published, sensitive, scoped context assembler/manifest | Part 11 §18 T024 | NOT STARTED | Legacy context assembly archived | context manifest, source | T016/T023 | Entire ticket | T024 |
| T025-R | Director request interpretation and evaluations | Part 11 §18 T025 | NOT STARTED | Email draft workflow conflicts | interpretation, evidence | T021–T024 | Prompt/schema/source validator/fixtures | T025 |
| T026-R | Blocking Decision Queue with single resume | Part 11 §18 T026 | NOT STARTED | None | decision, workflow | T025 | Entire ticket | T026 |
| T027-R | Editable delivery plan and idempotent approval | Part 11 §18 T027 | NOT STARTED | Legacy output approval is different artifact | plan, approval, work | T026 | Entire ticket | T027 |
| T028-R | Work items with criteria and verification | Part 11 §18 T028 | NOT STARTED | None | work item, request | T027 | Entire ticket | T028 |
| T029-R | Waiting queue, ageing, due/resolution evidence | Part 11 §18 T029 | NOT STARTED | None | waiting item, evidence | T028 | Entire ticket | T029 |
| T030-R | Versioned communication draft with recipient snapshot | Part 11 §18 T030 | NOT STARTED | Legacy email output archived | communication draft, recipient | T023–T027 | Entire ticket | T030 |
| T031-R | Controlled Follow-Up with stop/escalate/idempotency | Part 11 §18 T031 | NOT STARTED | None | follow-up, waiting, draft | T029/T030 | Entire ticket | T031 |
| T032-R | Deterministic completion and manual evidence gate | Part 11 §18 T032 | BLOCKED | None | completion verification, evidence | T026–T031; OD-006 | Resolve representation then build | T032 |
| T033-R | Evidence-grounded editable client update draft | Part 11 §18 T033 | NOT STARTED | None | update draft, evidence | T032 | Entire ticket | T033 |
| T034-R | Preserve AI corrections and evaluation metrics | Part 11 §18 T034 | NOT STARTED | Legacy approval records archived | feedback, ai run | T023/T025/T030 | Entire ticket | T034 |
| T035-R | Four-client vertical-slice browser/failure/mobile suite | Part 11 §18 T035 | NOT STARTED | Legacy Playwright scenarios only | fixture client, workflow | T020–T034 | Entire roadmap suite | T035 |
| T036-R | Fictional-data founder-led pilot onboarding/feedback | Part 11 §18 T036 | NOT STARTED | Legacy seed uses product modes/personal aliases | sample workspace, feedback | T035 | Safe fixtures/hints/feedback | T036 |
| T037-R | Privacy-safe analytics, duration, AI cost, allowances | Part 11 §18 T037 | NOT STARTED | Legacy usage/entitlement code archived | analytics event, ai run | T023/T034 | Entire ticket | T037 |
| T038-R | Full Release 1B security/evaluation go/no-go | Part 11 §18 T038 | NOT STARTED | No roadmap gate evidence | release evidence | T020–T037 | Entire gate | T038 |
| LATER-001 | Do not detail T100+ until prior gate passes | Part 11 §18 later groups | COMPLETE | `build-roadmap.md`, `AGENTS.md` | ticket group | T038 | Preserve hold | T100+ |

## Domain and workflow requirements not safely reducible to one ticket

| ID | Requirement summary | Source / section | Status | Implementation location / existing files | Related entities | Dependencies | Missing work | Next ticket |
|---|---|---|---|---|---|---|---|---|
| DATA-001 | Published Brain items are immutable; corrections supersede | Technical Architecture; Part 11 §7 | NOT STARTED | Legacy mutable JSON/knowledge | brain item, source | T016 | Version/status/source lifecycle | T016 |
| DATA-002 | Audit/activity preserves actors, reasons, transitions, evidence | Security; Part 11 §§7–8,14 | NOT STARTED | Legacy audit implementation archived | audit, activity | T018/T020 | Entire requirement | T018/T020 |
| DATA-003 | Archived clients cannot start workflows | Part 11 §§7,18 | NOT STARTED | Client archive exists; no workflows | client, workflow | T013/T020 | Database/service invariant and test | T013 |
| FLOW-001 | State transition service is sole mutation path | Workflows; Part 11 §8 | NOT STARTED | Direct legacy status updates | workflow transition | T020 | Central transition command | T020 |
| FLOW-002 | Transition, event, state commit atomically | Part 11 §8 | NOT STARTED | No state/event pair | transition, event | T020 | Transactional service/tests | T020 |
| FLOW-003 | Retries cannot duplicate operational records | Workflows; Part 11 §8 | NOT STARTED | No domain idempotency | idempotency key | T020 | Keys/constraints/replay tests | T020 |
| FLOW-004 | AI failure preserves prior valid workflow state | Workflows; Part 11 §8 | NOT STARTED | No active workflow/AI implementation | workflow run, ai run | T020/T023 | Recovery transitions and UI | T020/T023 |
| FLOW-005 | Completion requires work, decisions, waits, evidence, verification | Workflows; Part 11 §§8,27 | BLOCKED | None | work, decision, waiting, evidence | OD-006; T032 | Model and deterministic gate | T032 |
| APPR-001 | Approval binds exact payload, target, expiry, approver | Security; Part 11 §§13–14 | NOT STARTED | Legacy approval is output/status only | approval, action | Action architecture | Hash/snapshot/expiry/invalidation | T030 then T500+ |
| APPR-002 | Permission, approval, execution, verification are distinct | Security; Part 11 §13 | NOT STARTED | No action lifecycle | action, attempt, evidence | Later integration | Explicit states/services | T500+ |
| AI-001 | Work order carries tenant/client/task/context/risk/schema | AI; Part 11 §9 | NOT STARTED | Legacy prompt/context arguments | work order, ai run | T023 | Envelope/schema/validation | T023 |
| AI-002 | Context is minimum necessary and inspectable | AI; Part 11 §9 | NOT STARTED | Legacy context assembly archived | context manifest | T024 | Selection policy/minimization/manifest | T024 |
| AI-003 | Unknown facts remain unknown/proposed | AI; Part 11 §§9–10 | NOT STARTED | Legacy AI archived | interpretation, field status | T025 | Field-level status/source validation/evals | T025 |
| AI-004 | Prompt/model/schema versions link to every run | AI; Part 11 §§9–10 | NOT STARTED | Legacy workflow template archived | ai run, prompt version | T023 | Persist all versions per run | T023 |
| AI-005 | Release thresholds include zero cross-client leakage | AI evals; Part 11 §10 | NOT STARTED | No eval harness | eval case, result | T025/T035 | Fixtures/metrics/gates | T025/T038 |
| FILE-001 | Files are private, hashed, validated, safely downloaded | Technical Architecture; Security; Part 11 §§7,14 | NOT STARTED | No file implementation | source, storage object | T017 | Entire pipeline | T017 |
| OBS-001 | Logs/traces redact client content and correlate operations | Part 11 §15 | NOT STARTED | No Sentry/correlation policy | trace, log | T003 | Redaction and test | T003 |
| TEST-001 | Unit, integration, E2E, AI eval, SQL security pyramid | Part 11 §16 | PARTIALLY COMPLETE | T000 Vitest and Playwright baselines pass | test case | Per ticket | SQL/eval/accessibility/workflow layers | T003 onward |
| TEST-002 | No flaky-success or unexplained skipped tests | Part 11 §16 | PARTIALLY COMPLETE | T000 checks pass with no skips; CI/release enforcement absent | test run | CI | CI enforcement and release evidence | T003/T038 |
| PILOT-001 | Pilot uses fictional/anonymized scenarios before client data | Validation; Part 11 §23 | NOT STARTED | Legacy seed uses named fictional businesses but real personal aliases | fixture, pilot | T035/T036 | Approved four-client fixtures and privacy review | T035/T036 |
| PILOT-002 | Claims and time-saved metrics require evidence | Validation; Part 11 §§15,24 | NOT STARTED | No product metrics | metric, evidence | T037 | Baselines/method/claim review | T037 |

## Superseded Project Atlas requirements

| ID | Requirement summary | Source / section | Status | Implementation location / existing files | Related entities | Dependencies | Missing work | Next ticket |
|---|---|---|---|---|---|---|---|---|
| OLD-001 | One platform exposes Partner and Founder modes | Legacy product brief | SUPERSEDED | `product_mode`, mode nav/routes | organisation | None | Archive/remove from VA Edition | T000/T012 |
| OLD-002 | OpenAI Responses API is production AI provider | Legacy architecture/AI docs | SUPERSEDED | `lib/ai/client.ts`, env/package | ai run | None | Replace per governing Anthropic ticket | T023 |
| OLD-003 | Draft email is the first shared workflow | Legacy AI/build plan | SUPERSEDED | prompt/orchestrator/output UI | workflow run, output | None | Replace with Request-to-Delivery | T020–T025 |
| OLD-004 | Founder contact/lead hub is MVP core | Legacy scope/data model | SUPERSEDED | contacts routes/table | contact | None | Archive from initial edition | T000 |
| OLD-005 | Partner client profile is primary client model | Legacy data model | SUPERSEDED | `client_profiles` | client | None | Replace with canonical client workspace | T013 |
| OLD-006 | npm is repository package manager | Root README/package lock | SUPERSEDED | `package-lock.json`, scripts docs | repository | None | Adopt pnpm | T000 |
| OLD-007 | Hosted Supabase is sufficient for local development | Root README | SUPERSEDED | hosted-project instructions | environment | None | Local Supabase + isolated staging | T002 |
| OLD-008 | Mutable knowledge item is sufficient context | Legacy data/AI docs | SUPERSEDED | `knowledge_base_items` | knowledge | None | Governed Client Brain/source lifecycle | T016 |
| OLD-009 | Approval is an output status transition | Legacy security/AI docs | SUPERSEDED | `approvals`, output actions | approval | None | Adopt roadmap approval semantics | T027/T030 |
| OLD-010 | Milestones 1–5 define the active roadmap | Legacy build plan | SUPERSEDED | legacy docs/history | milestone | None | Use T000–T038 | T000 |

## Matrix totals

Totals are generated from the rows above during audit validation and reported in `docs/readiness-review.md` and the final task report. A `COMPLETE` row means the current behavior directly satisfies the stated requirement; it does not imply its enclosing roadmap ticket is complete.
