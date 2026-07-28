# AI Orchestration, Prompt Architecture and Evaluation

## Operating rule

AI may analyse, propose and coordinate within bounded roles. Deterministic software controls identity, permissions, workflow state, approvals and external execution.

## Orchestration path

```text
Workflow requires AI
→ create typed work order
→ confirm tenant and client
→ assemble minimum context
→ build versioned prompt package
→ choose model profile
→ execute
→ validate schema
→ check sources, quality and risk
→ accept, repair, retry or escalate
→ return validated result to workflow engine
```

Feature modules must not call models directly.

## Prompt layers

1. Platform instruction
2. Specialist role instruction
3. Workflow instruction
4. Current work order
5. Approved context package
6. Required output schema

Source material must be clearly marked as untrusted evidence.

## Work-order requirements

- bounded objective
- permitted inputs
- source references
- required output schema
- prohibited actions
- risk class
- escalation rules
- maximum cost and retries

## Agent result contract

- status
- objective completed
- validated output
- proposed actions
- confirmed facts
- uncertain items
- missing information
- assumptions
- risks
- source references
- confidence class
- recommended next step

## Confidence classes

- Confirmed
- Supported
- Needs confirmation
- Conflicting information
- Insufficient information

Confidence should attach to material fields, not only the whole response.

## Mandatory escalation examples

- uncertain client identity
- unsupported owner
- ambiguous material deadline
- unverified recipient
- conflicting sources
- commercial commitment
- legal or financial judgement
- sensitive performance or relationship issue
- out-of-scope request
- uncertain provider result

## Hallucination controls

Names, recipients, owners, dates, prices, commitments, scope, project status and completion must be source-supported or system-verified.

No-source behaviour:

- mark unresolved
- ask a targeted question
- omit the claim
- use neutral wording

## Model profiles

- fast classification
- operational reasoning
- communication
- quality review

Keep routing simple in the first release.

## Evaluation layers

1. schema
2. specialist task
3. full workflow
4. product usefulness

## Critical metrics

- wrong-client retrieval incidents
- unsupported-claim rate
- invented-owner rate
- invented-date rate
- wrong-recipient proposal rate
- source-reference accuracy
- ambiguity detection
- first-pass approval
- human correction burden
- workflow completion usefulness
- latency and cost

Cross-client incidents have a target of zero.

## Human corrections

Record:

- original value
- corrected value
- field and category
- role and prompt version
- workflow instance
- item-only versus reusable
- correcting user

Reusable changes become proposed Client Brain records and require approval.

## Release process

- Draft
- Evaluation
- Shadow
- Limited pilot
- Production
- Rolled back

Prompt, schema or routing changes require evaluation evidence and rollback capability.
