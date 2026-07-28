# Domain model

This is a conceptual model only. It does not authorize schema or migration work. Status labels are:

- **Confirmed:** directly required by the Blueprint and supporting specifications.
- **Likely:** strongly implied by workflows or the candidate Part 11.
- **Unresolved:** representation or lifecycle requires a decision.

## Identity, tenancy, and access

| Entity | Status | Purpose and key relationships |
|---|---|---|
| Tenant / organisation | Confirmed | Security, billing, policy, and ownership boundary. Owns memberships, clients, workflows, and operational records. |
| User / profile | Confirmed | A human identity. Participates in tenants through memberships. |
| Membership | Confirmed | Links user to tenant with role and lifecycle state. |
| Role / permission policy | Confirmed | Owner, member, and viewer are named in the candidate Part 11; deterministic permissions combine role, membership, client access, sensitivity, capability, and action policy. Exact matrix awaits Part 11 approval. |
| Client-team access | Confirmed | Links an authorized membership/user to specific clients. Required before retrieval or action. |

Every client-owned entity must include tenant and client scope. Tenant/client scope is validated server-side and enforced in storage/query policy, not inferred from UI routes or AI.

## Client context and scope

| Entity | Status | Purpose and key relationships |
|---|---|---|
| Client | Confirmed | Tenant-owned workspace for one client relationship; has contacts, access, scope, Client Brain, requests, workflows, and activity. |
| Client contact | Confirmed | A client-scoped person and communication target; recipient authority remains separate. |
| Client Brain | Confirmed | Governed aggregate of structured client context and approved knowledge. |
| Brain item / preference / rule | Confirmed | Versioned client-scoped fact, preference, communication rule, or operating context with status, sensitivity, source, and publication lifecycle. |
| Knowledge source | Confirmed | Uploaded file, note, transcript, link, or other approved input. Content is untrusted until processed; source metadata and access scope remain attached. |
| Service pillar | Confirmed | One of the seven product areas. |
| Service / capability / scope rule | Confirmed | Defines allowed, conditional, or prohibited work for a client and may create a decision during scope check. |

Relationships: a tenant owns many clients; a client has many contacts, sources, Brain items, services, and scope rules. Brain items derive from one or more sources or explicit human entry and may supersede earlier versions.

## Requests, workflow, and delivery

| Entity | Status | Purpose and key relationships |
|---|---|---|
| Client request | Confirmed | Captured unstructured or structured request with channel, requester, client, scope, and status. Starts or links to a workflow run. |
| Request interpretation | Likely | Bounded AI proposal containing intent, constraints, missing facts, risks, evidence references, and confidence. |
| Delivery plan | Confirmed | Reviewed plan for fulfilling a request; materializes work only after approval. |
| Workflow definition | Confirmed | Versioned state machine describing triggers, inputs, controls, transitions, actions, waiting, evidence, and completion rules. |
| Workflow run / instance | Confirmed | One execution of a definition for a tenant/client and usually a request. |
| Workflow transition / event | Confirmed | Immutable transition and event history with actor, reason, idempotency key, and correlation. |
| Task / work item | Confirmed | Actionable unit derived from an approved plan; may depend on decisions, waiting items, or other work. |
| Deliverable | Likely | The user-visible result of one or more work items. The candidate schema appears to represent this through plans, work items, drafts, files, and completion state rather than a dedicated entity. |

Relationships: a request may have interpretations and plan versions, and normally drives one primary workflow run. An approved plan creates work items transactionally and idempotently. Workflow definitions version independently from runs.

## Control and exception records

| Entity | Status | Purpose and key relationships |
|---|---|---|
| Decision | Confirmed | A human choice with question, options, recommendation, evidence, impact, blocking scope, answer, actor, and timestamp. |
| Exception | Unresolved | A typed contradiction, safety issue, scope violation, unsupported claim, or workflow failure. May be a dedicated record or a strict subtype of decision/event/activity (OD-006). |
| Approval | Confirmed | Actor authorization bound to action, exact payload hash/snapshot, recipient or target, expiry, and status. |
| Waiting item | Confirmed | Dependency with owner, reason, follow-up time, status, resolution, and evidence. |
| Follow-up | Confirmed | Controlled follow-up intent/attempt linked to waiting, draft, approval, and any external action. |

Decisions and approvals are not interchangeable. AI may recommend but cannot answer a human decision or approve an action. A material payload change invalidates approval.

## Outputs, communications, evidence, and completion

| Entity | Status | Purpose and key relationships |
|---|---|---|
| Communication draft | Confirmed | Reviewable client/team message grounded in approved context and workflow evidence; sending is separate. |
| External action | Confirmed | Proposed side effect with adapter, target, payload, permission result, approval, idempotency, attempts, and provider verification. Deferred for live sending in Release 1. |
| Evidence item | Unresolved | Source reference, provider receipt, artifact, test result, or human attestation supporting a claim or state; may be first-class or typed activity (OD-006). |
| Completion verification | Confirmed concept; unresolved storage | Check of explicit completion criteria with verifier, evidence, exceptions, and outcome before completion. |
| Activity / audit event | Confirmed | Immutable human-readable activity plus security/audit context. Sensitive payloads are minimized or referenced, not copied broadly. |

Relationships: drafts link to the request/workflow and supporting evidence. An external action requires permission and approval before execution and provider verification afterward. Completion verification aggregates work state, decisions, waiting, deliverables, and evidence; only a passing result allows completion.

## AI and provenance

| Entity | Status | Purpose and key relationships |
|---|---|---|
| AI work order / run | Confirmed | Tenant/client-scoped invocation with task type, model/prompt version, context manifest, schema version, result status, usage, and errors. |
| Prompt version | Confirmed | Reviewed, versioned instruction/schema asset used by AI runs. |
| AI feedback / correction | Confirmed | Human evaluation of an output. Does not directly mutate durable Client Brain truth. |
| Context manifest | Confirmed | Exact minimal sources and structured records supplied to a run, with scope and sensitivity. |

## Relationship invariants

1. A user accesses a client only through an active tenant membership and explicit client access/policy.
2. Every request, workflow run, task, decision, approval, waiting item, draft, AI run, action, and evidence reference is tenant- and client-scoped.
3. Retrieval and context assembly occur only after identity, membership, client access, and sensitivity checks.
4. A workflow transition must be valid for the current definition version and lock/version; transition, event, and materialized records commit consistently.
5. Retries use idempotency keys and cannot duplicate tasks, drafts, approvals, follow-ups, or external actions.
6. Published Client Brain knowledge has source and human-governed lifecycle; feedback alone cannot publish it.
7. Completion requires explicit verification and evidence, not merely an AI success response or all tasks marked done.
8. Audit history is append-oriented and preserves actors, decisions, approvals, corrections, failures, and provider verification.

## Model questions before schema work

OD-001/003 must establish the approved implementation spec and stack. OD-006 must decide the storage shape for exceptions, evidence, deliverables, and completion verification. Retention, deletion, sensitivity tiers, role capabilities, client-access inheritance, and cross-client aggregate reporting also require ticket-level design and security review before migrations.
