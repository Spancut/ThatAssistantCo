# Implementation progress

Percentages measure conformance to the governing VA Edition roadmap, not how much Project Atlas code exists. Passing legacy tests does not increase an area unless the implemented behavior maps to a current requirement.

| Area | Progress | Justification |
|---|---:|---|
| Platform | 25% | Next.js/TypeScript/Supabase shell exists, but wrong package manager, product modes, schema, and repo baseline |
| Authentication | 50% | Sign-up/sign-in/out, callback, proxy, memberships exist; recovery, verification, full membership route tests and roadmap roles incomplete |
| Tenancy and client access | 25% | Organisation RLS exists; no canonical `client_access`, client-scoped policies, isolation gate, or VA role matrix |
| Client Brain | 10% | Mutable brand voice/preferences/key facts and knowledge exist; no governed items, sources, publication, supersession, sensitivity, or immutable history |
| Service scope | 0% | No seven-pillar capability model or deterministic allowed/conditional/prohibited/unknown evaluation |
| Workflow Engine | 10% | AI run records exist; no workflow definitions/instances/transitions/events, versioning, concurrency, or idempotency engine |
| Requests | 0% | Free-text email prompt is not a client request record or request UI |
| Tasks / work items | 0% | No roadmap work-item entity, views, dependencies, criteria, or cancellation controls |
| Approvals | 25% | Human review statuses and audit exist; no action/payload/recipient binding, expiry, stale-plan control, or materialization gate |
| Waiting Queue | 0% | No waiting entity, ageing, due logic, resolution evidence, or home queue |
| Decision Queue | 0% | No decision records, cards, blocking/resume flow, or evidence |
| Exceptions | 0% | No explicit exception lifecycle; legacy low-confidence output is insufficient |
| AI Gateway | 25% | Provider interface, Zod validation, retry-on-schema-failure and injected mock exist; wrong provider and missing envelope/version/run/cost/privacy controls |
| AI Employees | 0% | No Client Operations Director or specialist role work orders/prompts |
| Context assembly | 25% | Server-side org/client-linked retrieval exists; no published-only/sensitivity/supersession/context manifest |
| Communications | 25% | Reviewable email draft and no-send boundary exist; no recipient snapshot, version lifecycle, Communication role, or workflow grounding |
| Knowledge / sources | 10% | Freeform linked records exist; no private file pipeline, validation, hashes, safe downloads, governed source states |
| Evidence | 10% | Audit events and context source labels exist; no durable evidence model or material-claim validator |
| Completion verification | 0% | No deterministic completion gate or manual evidence path |
| Client Portal | 0% | Not a Release 1 deliverable and no roadmap-compliant portal exists |
| VA Workspace | 10% | Generic shell/client screens exist; no What Needs You, active-client control, request/decision/waiting workspaces |
| Admin / settings | 25% | Organisation rename, billing read view, notifications exist; roadmap governance and incident controls absent |
| Reporting / analytics | 10% | Usage events exist; no privacy-minimized product analytics, duration, AI cost reconciliation, pilot dashboards, or weekly layer |
| Security | 25% | Org RLS, secret separation, Zod and no-send boundary exist; client isolation, approval binding, source safety, redaction, incident controls and permanent SQL suite absent |
| Testing | 25% | 48 unit tests and legacy Playwright coverage exist; roadmap fixture, SQL/RLS, workflow, AI eval, accessibility, mobile and vertical-slice gates missing |
| Infrastructure | 10% | Supabase config and npm setup exist; no pnpm baseline, Inngest, health/env validation, CI, Sentry or correlation IDs |
| Deployment | 10% | Legacy README instructions exist; no staging isolation, preview evidence, Vercel release/rollback/feature-flag process |
| Documentation/governance | 75% | Authoritative package, AGENTS, traceability and journal exist; root `CLAUDE.md`, ADR/ticket templates, package manifest and Word-to-Markdown normalization remain |

## Weighted overall estimate

**14% complete** against Release 0 + Release 1A + Release 1B requirements.

This is higher than zero because several platform primitives are demonstrably implemented and tested, but lower than a simple file-count estimate because the core VA Edition control loop has not started. No governing roadmap ticket is fully complete as written.
