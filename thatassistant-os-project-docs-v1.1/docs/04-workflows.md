# Workflow Specification Summary

## Shared workflow states

- `draft`
- `ready`
- `queued`
- `in_progress`
- `waiting_for_context`
- `waiting_for_dependency`
- `waiting_for_human`
- `waiting_for_external_response`
- `completed`
- `completed_with_warning`
- `blocked`
- `failed`
- `cancelled`
- `archived`

## Universal operating pattern

```text
Trigger
→ tenant and client resolution
→ service-scope and workflow eligibility
→ approved context assembly
→ work orders
→ specialist execution
→ structured validation
→ quality, risk and permission checks
→ human decision where required
→ approved internal or external actions
→ provider verification where applicable
→ workflow-state update
→ outcome, activity and value evidence
```

## Foundation workflows

- VA Workspace Setup
- Client Workspace Setup
- Progressive Client Brain
- Client Service Scope Setup
- Permissions and Autonomy
- Decision and Exception Queue
- Activity and Verification

## Communication workflows

- Client Request-to-Delivery
- Missing Information Resolution
- Communication Draft Review
- Sensitive Communication Escalation
- Completion Update

## Calendar and meeting workflows

- Meeting Request-to-Scheduling Plan
- Rescheduling Plan
- Meeting Brief
- Meeting-to-Delivery
- Recurring Meeting Review

## Projects and delivery workflows

- Request-to-Work Item
- Request-to-Project
- Milestone Setup
- Dependency Tracking
- Project Risk Review
- Completion Verification
- Client-Delivery Report

## Client lifecycle workflows

- Client Onboarding
- Onboarding Readiness
- Client Review
- Renewal Review
- Client Offboarding
- Client Archive

## Systems and SOP workflows

- Recording-to-SOP
- SOP Gap Review
- Checklist Generation
- SOP Approval
- SOP Version Update
- Client Brain Publication

## Executive and personal workflows

- Executive Brief
- Personal Administration Request
- Travel Planning
- Itinerary Preparation
- Event Coordination
- Sensitive Decision Escalation

## Follow-up and visibility workflows

- Controlled Follow-Up
- Waiting-State Review
- Weekly Client Update
- Weekly VA Operations Review

## First technical vertical slice

```text
Create client
→ complete minimum Client Brain
→ add client request
→ analyse request
→ review delivery plan
→ resolve decisions
→ create approved work
→ create waiting states
→ track follow-up
→ verify completion
→ prepare client update
```

## Completion principle

A workflow does not complete merely because an automation ran. Completion requires the workflow definition's required evidence, resolved decisions and valid waiting or verification states.
