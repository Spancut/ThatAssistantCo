import { serve } from "inngest/next";

import { inngest } from "@/lib/inngest/client";
import { infrastructureHealth } from "@/lib/inngest/functions/infrastructure-health";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [infrastructureHealth],
});
