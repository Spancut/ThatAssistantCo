# Release 1 scope

This document describes the product boundary, not an implementation authorization. “Release 1” means the Blueprint foundation and daily-delivery loop. Pending OD-004, the candidate Part 11 labels its two internal increments Release 1A and Release 1B and places environment/governance work in Release 0.

## Included

### Secure foundation (proposed 1A)

- Authentication, profile, tenant/organisation membership, roles, and client-team access.
- Client workspaces, contacts, strict tenant/client isolation, and auditable activity.
- Minimum Client Brain setup without requiring AI.
- Governed sources and storage metadata.
- Seven service pillars represented at a foundational level.
- Client-specific services, capabilities, preferences, and allowed/conditional/prohibited scope.
- Responsive application shell and clear empty, loading, unauthorized, failure, and recovery states.

### Daily delivery vertical slice (proposed 1B)

- Manual request capture and client resolution.
- Deterministic scope check.
- Bounded request interpretation with source references and visible uncertainty.
- Reviewable delivery plan.
- Decision Queue and explicit exception surfacing.
- Human plan approval and idempotent work-item creation.
- Tasks/work items, waiting items, dependencies, and controlled follow-up.
- Communication drafts only; no live sending.
- Completion criteria, evidence, verification, and client update draft.
- Workflow history, recoverable failure, activity evidence, AI run records, and human feedback.

## Excluded from Release 1

- Autonomous or unreviewed external actions.
- Live email/inbox sends, calendar writes, project-tool writes, CRM writes, purchases, bookings, cancellations, or deletions.
- Native mobile applications.
- Deep automation across all seven pillars.
- Broad semantic/embedding retrieval before measured need.
- Founder Edition or Agency Edition product surfaces.
- Claims that AI replaces a VA or that unvalidated time/cost outcomes are guaranteed.
- Real client data in development, tests, evaluation, or demonstrations.

## Deferred

- Release 2: calendar, scheduling, meetings, Meeting-to-Delivery, projects, milestones, blockers, and evidence-based project reporting.
- Release 3: onboarding, readiness, renewals, offboarding, Recording-to-SOP, SOP versioning, and controlled knowledge publication.
- Release 4: executive briefs, private preferences, personal administration, travel/event planning, and stronger confidential-context controls.
- Release 5: weekly client updates, VA operations review, cross-client planning, workload, and capacity evidence.
- Release 6+: validated integrations, social media, finance administration, specialist packs, and Agency Edition capabilities.

## MVP end-to-end loop

1. Create a fictional client and authorize access.
2. Complete minimum Client Brain and service scope.
3. Capture a request for that client.
4. Resolve identity/access, check scope, and assemble minimal approved context.
5. Produce a validated interpretation and grounded plan proposal.
6. Surface and resolve blocking decisions or exceptions.
7. Review and approve the plan; materialize work idempotently.
8. Track delivery, dependencies, waiting, and controlled follow-up.
9. Verify completion against criteria and evidence.
10. Prepare a client update draft and retain the activity/audit trail.

## Safety boundaries

- Zero cross-tenant and cross-client access.
- Server-side deterministic authorization and client scoping at every boundary.
- AI output is schema-validated, source-aware, uncertain where appropriate, correctable, and never permission-bearing.
- No silent Client Brain publication or learning.
- Approval is human, action-specific, payload-specific, expiring, and invalidated by material change.
- External action execution remains off for Release 1.
- Workflow retries and concurrent events are idempotent and recoverable.
- Sensitive content is minimized in AI context, telemetry, fixtures, and logs.

## Success criteria

Release 1 is successful only when:

- A VA can complete the full loop with at least four varied fictional/anonymized client scenarios.
- A second unauthorized user cannot access any tenant/client record, file, workflow, or AI context.
- Every proposal can be corrected, and corrections do not silently become published knowledge.
- Material claims and completion states have traceable evidence.
- Blocking decisions and waiting items remain visible and recoverable.
- Duplicate requests, events, retries, and action attempts do not create duplicate operational records.
- AI, security, isolation, workflow, accessibility, and critical browser gates pass with no unexplained skips.
- The product remains usable for core tracking and review when AI fails.
- No live send integration is enabled.

## Pilot assumptions

- Initial pilot: founder-led with fictional or de-identified scenarios.
- Small external pilot only after security and evaluation gates, using approximately 3–8 recurring clients per participating professional VA as the validation context described in the supplied package.
- Hypotheses remain unproven: willingness to adopt, reduction in coordination overhead, trust in bounded AI, and commercial packaging require evidence.
- Analytics must be privacy-minimized and cannot fabricate “time saved.”

## Blockers before implementation

1. OD-001: approve or reject the supplied Word Part 11.
2. OD-003: ratify the technology stack.
3. OD-005: choose a recoverable disposition for the old Project Atlas repository contents.
4. OD-006: resolve first-class storage for exceptions/evidence/completion before affected migrations.
5. Confirm the first implementation ticket and its acceptance criteria after the above decisions. No production ticket is approved by this documentation task.
