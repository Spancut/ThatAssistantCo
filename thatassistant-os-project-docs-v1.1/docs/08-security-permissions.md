# Security, Privacy, Permissions and Action Safety

## Security priorities

- tenant isolation
- client isolation
- least privilege
- minimum necessary context
- secure credential storage
- file security
- prompt-injection defence
- explicit approvals
- external-action verification
- traceable activity and audit
- safe failure

## Effective permission

Calculate from the strictest combination of:

1. platform limits
2. tenant setting
3. user role
4. client rule
5. client service scope
6. workflow configuration
7. action type
8. target
9. risk state
10. explicit approval

Possible results:

- allowed
- approval_required
- blocked
- configuration_missing
- permission_conflict

## Autonomy levels

- Prepare
- Approve
- Controlled automatic

The first release should default to Prepare and Approve.

## Approval binding

An approval must be tied to:

- actor
- tenant
- client
- workflow instance
- action type
- payload or payload hash
- target
- expiry
- relevant source version

Material changes invalidate stale approval.

## Sensitive context categories

- general business
- operational
- communication
- project
- financial administrative
- personal
- executive confidential
- travel identity
- highly sensitive

Store and expose sensitive information using stricter permissions, retention and audit controls.

## Prompt injection

Source content:

- is untrusted
- cannot redefine system instructions
- cannot invoke tools
- cannot add recipients
- cannot widen permissions
- cannot request another client's information

## Files

Upload flow:

```text
validate
→ scan
→ checksum
→ duplicate check
→ private storage
→ source record
→ parse
→ segment
→ approve authority and status
```

Use short-lived signed URLs and audited access.

## Emergency stop

Support external-action stops at:

- platform
- tenant
- client
- workflow
- integration

Safe mode may allow intake and drafting while pausing external execution.

## Release-blocking incidents

- cross-client data exposure
- unauthorised send
- wrong recipient
- approval bypass
- uncontrolled duplicate external action
- source content successfully changing tool permissions
