# Technical Architecture

## Initial architecture

Use a modular monolith with background workers.

### Core infrastructure

- web application
- application API
- authentication and authorisation
- relational database
- private object storage
- background queue
- scheduler
- AI gateway
- integration adapters
- notification service
- activity and audit service
- observability
- secrets management

## Domain modules

1. Identity and Access
2. Tenants and Users
3. Client Workspaces
4. Client Service Scope
5. Client Brain
6. Sources and Files
7. Workflow Engine
8. Work Items and Projects
9. Decisions and Approvals
10. Waiting and Follow-Up
11. Communications
12. Calendar and Meetings
13. Client Lifecycle
14. Systems and SOPs
15. Executive and Personal Assistance
16. Client Updates and Weekly Operations
17. External Actions
18. Integrations
19. Notifications
20. Activity, Audit and Usage

## Core data entities

- Tenant
- User
- TenantMembership
- ClientWorkspace
- ClientServiceScope
- Contact
- ClientBrainRecord
- ClientBrainRule
- Source
- SourceSegment
- WorkflowDefinition
- WorkflowConfiguration
- WorkflowInstance
- WorkflowEvent
- WorkItem
- Project
- Milestone
- WorkDependency
- AgentWorkOrder
- AgentResult
- Decision
- Approval
- WaitingState
- FollowUpAttempt
- CommunicationDraft
- CalendarRule
- MeetingRecord
- ClientLifecycleRecord
- SOPRecord
- SOPVersion
- ExecutiveBrief
- TravelPlan
- EventPlan
- PrivatePreference
- ExternalAction
- ActivityEvent
- ClientUpdate
- WeeklyOperationsReview
- IntegrationConnection
- ClientIntegrationBinding
- Notification

## Client isolation

Every client-scoped record must carry:

- `tenant_id`
- `client_id`

Enforcement should include:

- database constraints
- row-level security where available
- scope-aware repositories
- client-scoped cache keys
- context validation before AI calls
- release-blocking cross-client tests

## Workflow engine

The engine is responsible for:

- creating workflow instances
- enforcing transitions
- issuing work orders
- managing decisions and waiting states
- scheduling checks
- launching child workflows
- checkpointing
- failure recovery
- completion

Use commands for requested changes and events for confirmed facts.

## Client Brain

Store:

1. structured records
2. approved source content
3. client-scoped retrieval index

Context assembly must:

- resolve tenant and client
- check role and purpose
- select minimum necessary structured context
- filter sources by authority and status
- include conflicts and staleness warnings
- produce a versioned context snapshot

## External actions

Pipeline:

```text
proposal
→ deterministic permission result
→ approval where required
→ source and workflow freshness check
→ target validation
→ idempotency check
→ queued execution
→ provider response
→ provider verification
→ activity event
```

Provider timeout after possible success must create an uncertain state, not an immediate blind retry.

## Data consistency

Use:

- database transactions for tightly coupled internal changes
- transactional outbox for asynchronous post-commit work
- idempotency for jobs and provider actions
- explicit checkpoints for recovery

## Build sequence

1. Foundation
2. Client Brain
3. Workflow engine
4. Request-to-Delivery vertical slice
5. Meetings and projects
6. Client lifecycle and SOPs
7. Executive and personal assistance
8. Weekly operating layer
9. External integrations
