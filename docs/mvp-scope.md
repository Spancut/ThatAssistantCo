# MVP Scope

## In scope (Milestones 1–5)

1. **Foundation** — auth, workspace creation, product mode selection, shared shell with mode-specific nav/dashboards, schema + RLS + migrations + seed, settings foundation, audit utility.
2. **Knowledge & Relationships** — Partner Client Hub (client profiles, brand voice, services, preferences, restrictions, approval rules, recurring responsibilities); Founder Contact & Lead Hub (relationship types, lifecycle stages, follow-ups); shared knowledge records, document metadata, search/filter, activity history.
3. **AI Workbench & Outputs** — shared AI service, four workflows per product, structured output validation, approval/rejection/revision states, usage/error logging.
4. **Product Operations** — Partner Delivery Board + Human Value Layer + Weekly Client Value Report; Founder Daily Command Centre + Follow-Up Operator + Weekly Business Review.
5. **Hardening** — privacy controls, data export/deletion, entitlements, rate limiting, input/file limits, accessibility/responsive review, E2E smoke tests, deployment docs.

## Explicitly out of scope for the MVP

- Sending email, publishing content, changing calendars, contacting customers, issuing quotes, or any other automatic external action (durable constraint, see [security-and-approval-policy.md](security-and-approval-policy.md), not a temporary gap)
- Multi-agent AI orchestration (one controlled service with workflow-specific instructions instead)
- `client_reviewer` / `certified_operator` role behavior (schema exists, no UI/capabilities)
- Workspace member invitations (only the creator has a membership in the MVP)
- Billing/payment collection (subscription entitlement *model* exists in Milestone 5; no payment processing)
- Native mobile apps

## Definition of done, per milestone

A milestone is done when: the vertical slice described in the spec's acceptance criteria is implemented end-to-end (not partially), `npm run typecheck`, `npm run lint`, `npm run build`, and `npm test` all pass, any relevant live-data verification has actually been executed (not assumed), `docs/build-plan.md` is updated, and the work is committed.
