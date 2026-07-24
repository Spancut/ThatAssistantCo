# Product Brief

## What ThatAssistant is

ThatAssistant is one platform that ships as two products, selected per workspace:

- **ThatAssistant Partner** — a client-delivery workspace for people who do ongoing work for other businesses (agencies, consultants, freelancers, fractional operators). It centers on managing multiple client relationships, drafting client-facing work with AI assistance, and tracking delivery.
- **ThatAssistant Founder** — an administrative command center for small business owners/operators. It centers on leads and contacts, follow-ups, and a daily operating view of what needs attention.

Both products share the same authentication, workspace, permissions, AI orchestration, approval, and audit infrastructure. They differ in the domain objects they manage (clients vs. contacts/leads), the workflows they expose, and the shape of their dashboards — not in cosmetic labels.

## Who it's for

- **Partner**: solo consultants and small agency operators who deliver recurring work (content, marketing, ops support) for multiple clients and need to track what's owed to whom, in what voice, under what constraints.
- **Founder**: small business owners running day-to-day operations who need a single place to see what's overdue, what's next, and what AI-assisted drafts are waiting for their sign-off.

## Product principles

1. **AI drafts, humans decide.** Every AI output lands as a reviewable draft with an approval boundary. Nothing AI produces is sent, published, or committed externally without an explicit human action.
2. **One platform, two products.** Shared plumbing (auth, orgs, permissions, AI service, approvals, audit) is built once. Product-specific surfaces (nav, dashboards, domain objects, workflows) are genuinely different per mode.
3. **Small, real, working slices.** Every milestone ships a complete vertical slice with no placeholder buttons and no fake data pretending to be live.
4. **Trust is structural, not cosmetic.** Row Level Security on every organisation-owned table, audit events on every consequential action, no automatic external side effects in the MVP.

## MVP outcome

By the end of the MVP build (Milestones 1–5), a user can sign up, create a Partner or Founder workspace, manage the relevant relationship records, run AI workflows against real stored context, review/approve/reject the output, track delivery or follow-up work derived from real records, and export or delete their workspace data.
