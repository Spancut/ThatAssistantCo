# ThatAssistant OS — VA Edition
# Blueprint Revision 1.1 — Core Product Scope Amendment

**Status:** Approved working amendment  
**Authority:** This document overrides earlier conflicting blueprint decisions.

## Amendment purpose

Earlier blueprint stages centred the first product mainly on requests, meetings, follow-up and weekly visibility. This amendment recognises that professional VAs and EAs also commonly support calendars, project delivery, client lifecycle, systems and SOPs, and executive or personal administration.

Those areas are now core pillars of ThatAssistant OS — VA Edition.

Future upgrades deepen integrations, automation, volume and specialist workflows. They do not unlock the basic responsibilities of a professional VA.

## Revised product definition

> ThatAssistant OS is a Human + AI client-delivery operating system for professional VAs and EAs. It helps them organise and deliver communication, meetings, projects, client lifecycle work, systems, executive support and follow-up across multiple clients—without carrying every detail in their heads.

The VA remains Head of Client Delivery.

## Revised product promise

> Set each client up once. Manage their communication, meetings, projects, systems and ongoing support from one client-delivery operating system—while keeping every action, follow-up and decision moving.

## Seven core pillars

1. Communication and Client Requests
2. Calendar and Meetings
3. Projects and Delivery
4. Client Lifecycle
5. Systems and SOPs
6. Executive and Personal Assistance
7. Follow-Up, Reporting and Weekly Visibility

## Pillar 1 — Communication and Client Requests

First-release capabilities:

- selected request or message intake
- client identification
- request interpretation
- multiple-request separation
- urgency, sensitivity and scope flags
- missing-information detection
- acknowledgement and reply drafting
- progress and completion communication
- communication-related follow-up

Later depth:

- controlled Gmail or Outlook triage
- thread-state monitoring
- folder monitoring
- sender-authority checks
- controlled automatic replies

## Pillar 2 — Calendar and Meetings

First-release capabilities:

- client scheduling rules
- working hours
- protected time and buffers
- attendees and time zones
- meeting purpose
- scheduling and rescheduling proposals
- recurring meeting records
- agendas
- executive meeting briefs
- transcript or notes intake
- Meeting-to-Delivery
- post-meeting communication and follow-up

Later depth:

- live Google or Microsoft availability
- multi-calendar negotiation
- event creation
- recurring-series management
- automatic rescheduling
- conflict optimisation

## Pillar 3 — Projects and Delivery

First-release capabilities:

- quick actions, tasks and projects
- owners and due dates
- milestones
- dependencies
- blockers
- project risk
- completion criteria
- delivery evidence
- project and client-delivery summaries

Later depth:

- two-way ClickUp, Asana, Monday or Trello synchronisation
- custom-field mapping
- provider webhooks
- duplicate resolution
- advanced risk reporting

## Pillar 4 — Client Lifecycle

First-release capabilities:

- client workspace and records
- contacts
- service scope
- onboarding
- access and document collection
- readiness to begin
- relationship review
- renewal dates and review
- offboarding
- client archive
- Client Brain lifecycle

Later depth:

- CRM triggers
- contract and payment signals
- automatic onboarding activation
- CRM synchronisation
- renewal scoring

## Pillar 5 — Systems and SOPs

First-release capabilities:

- recording, transcript or notes to SOP
- process analysis
- steps, owners, systems, inputs and exceptions
- checklists
- unanswered questions
- approval and publication
- version history
- Client Brain process knowledge

Later depth:

- diagrams
- change-impact analysis
- SOP review reminders
- knowledge-platform connections
- workflow-template generation

## Pillar 6 — Executive and Personal Assistance

First-release capabilities:

- executive briefs
- personal work items
- private preferences
- important dates and commitments
- travel planning records
- itinerary preparation
- event plans
- guest and supplier tracking
- sensitive-context controls

Later depth:

- live travel search
- bookings and changes
- supplier integrations
- ticketing
- direct purchases and payments

The first release must not autonomously purchase travel, agree to terms, enter passport information, make payments or sign contracts.

## Pillar 7 — Follow-Up, Reporting and Weekly Visibility

First-release capabilities:

- waiting states
- missing responses and documents
- reminder preparation
- attempt limits and stop conditions
- escalation
- Decision and Exception Queue
- Weekly Client Update
- Weekly VA Operations Review
- activity and completion evidence

## Revised client service scope

Each client workspace records which services the VA is authorised to provide.

Service types include:

- communication
- request management
- calendar management
- meeting support
- project delivery
- onboarding
- renewal
- offboarding
- SOP management
- executive support
- personal administration
- travel coordination
- event coordination
- social media
- finance administration
- custom scope

The coordinator must check service scope before starting work.

## Revised Human + AI organisation

- VA — Head of Client Delivery
- Client Operations Director — coordinator
- Client Context Steward
- Client Communications Agent
- Calendar and Meetings Agent
- Projects and Delivery Agent
- Client Lifecycle Agent
- Follow-Up and Coordination Agent
- Systems and SOP Agent
- Executive and Personal Assistance Agent
- Quality, Risk and Permissions Agent

Agents are bounded logical responsibilities, not separate user-facing chatbots.

## Revised first product release

Foundation:

- secure user and tenant structure
- client workspaces
- Client Brain
- service scope
- contacts
- sources and files
- permissions and autonomy
- workflow-state engine
- Decision and Exception Queue
- waiting states
- activity and notifications

Core operational capability:

- selected request intake
- Request-to-Delivery
- scheduling rules and proposals
- meeting briefs and Meeting-to-Delivery
- internal projects, milestones and dependencies
- onboarding, renewal and offboarding
- transcript-to-SOP and versioning
- executive briefs, personal work, travel and event plans
- controlled follow-up
- weekly updates and reviews

## First-build boundaries

Initially manual or approval-based:

- email sending
- calendar creation
- project-tool actions
- CRM updates
- travel or supplier bookings
- external file publication
- client-facing sends

Not in earliest release:

- unrestricted inbox monitoring
- autonomous external email
- travel purchasing
- financial transactions
- complex multi-calendar negotiation
- broad two-way project synchronisation
- arbitrary customer workflow builder
- enterprise team management

## Revised information architecture

Primary navigation:

1. Home
2. Clients
3. Work
4. Calendar & Meetings
5. Projects
6. Waiting
7. Systems
8. Weekly Review
9. Activity
10. Settings

Client workspace:

- Overview
- Requests
- Calendar & Meetings
- Projects
- Waiting
- Lifecycle
- Systems & SOPs
- Executive Support
- Updates
- Client Brain
- Activity
- Settings

Navigation adapts to the client's enabled service scope.

## Revised technical requirements

Add or expand:

- ClientServiceScope
- CalendarRule
- MeetingRecord
- Project
- Milestone
- ClientLifecycleRecord
- SOPRecord
- SOPVersion
- ExecutiveBrief
- TravelPlan
- EventPlan
- PrivatePreference

Every client-scoped entity must carry valid tenant and client scope.

## Revised privacy requirements

Context classes:

- general business
- operational
- communication
- project
- financial administrative
- personal
- executive confidential
- travel identity
- highly sensitive

The system must provide role-based minimum access, stricter storage controls, audit, masking and retention for sensitive fields.

## Revised build strategy

### Release 1 — Foundation and Daily Delivery

- tenancy
- client workspaces
- Client Brain
- service scope
- request intake
- Request-to-Delivery
- internal work items
- Decision Queue
- waiting states
- drafts
- activity

### Release 2 — Meetings and Projects

- calendar rules
- scheduling proposals
- meeting briefs
- Meeting-to-Delivery
- projects
- milestones
- dependencies
- project risk

### Release 3 — Client Lifecycle and Systems

- onboarding
- readiness
- renewal
- offboarding
- Recording-to-SOP
- checklists
- version history
- Client Brain publication

### Release 4 — Executive and Personal Assistance

- executive briefs
- private preferences
- personal work
- travel plans
- itineraries
- event plans
- stronger privacy controls

### Release 5 — Weekly Operating Layer

- Weekly Client Update
- Weekly VA Operations Review
- cross-pillar reporting
- priority planning
- delivery evidence

### Release 6 — Integrations and Specialist Expansion

- inbox
- calendar
- project tools
- CRM
- social media
- finance administration

## Specialist products

Remain separate because they are not part of every VA's service model or require additional risk controls:

- Social Media Operations
- Finance Administration
- Agency Edition
- Advanced Integrations

## Decisions superseded

This amendment replaces earlier decisions that treated the following as primarily optional future packs:

- Calendar and Meetings
- Projects and Delivery
- Client Lifecycle beyond onboarding
- Systems and SOPs
- Executive and Personal Assistance

They are now core product pillars. Later releases deepen their automation and integrations.

## Final build principle

> Build broad enough to support the true role of a professional VA, but release each area at a focused and reliable level before deepening its automation.
