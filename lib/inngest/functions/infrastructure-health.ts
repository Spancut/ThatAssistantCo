import { inngest } from "../client";

export const infrastructureHealth = inngest.createFunction(
  {
    id: "infrastructure-health",
    triggers: [{ event: "thatassistant/infrastructure.health.requested" }],
  },
  async ({ event }) => ({
    status: "ok",
    scope: "infrastructure-only",
    requestId: event.id ?? null,
  }),
);
