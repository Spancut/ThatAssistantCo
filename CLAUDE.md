# Claude Code instructions

Before implementation, read:

1. `thatassistant-os-project-docs-v1.1/What you should do next.docx`
2. `AGENTS.md`
3. `docs/source-of-truth-index.md`
4. the approved ticket and every source it references

The Word document is the governing implementation roadmap. Follow the source-of-truth hierarchy, execute one explicitly approved ticket at a time, preserve Cresta's roadmap order, and stop at the ticket boundary. Never invent a missing requirement; record a material conflict or blocker and ask rather than bypassing it.

Inspect before editing and make the smallest safe, complete change. Preserve `tenant_id` and `client_id` isolation, human approvals, source grounding, evidence, uncertainty, decisions, exceptions, waiting states, and completion verification. AI may propose; deterministic application controls permissions, state changes, and external actions. Do not autonomously send, publish, deploy, migrate hosted data, or act on external systems.

Do not use destructive commands unless explicitly authorised. Never use production credentials, production resources, secrets, or real client data during local development, and never expose or commit them. Label mocks, fictional fixtures, stubs, and placeholders clearly.

Update proportionate tests and documentation, run the ticket's required validation, update `docs/build-journal.md`, report blockers and deviations, and stop before the next ticket.
