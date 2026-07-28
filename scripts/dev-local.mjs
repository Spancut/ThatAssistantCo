import { spawn, spawnSync } from "node:child_process";

const packageManager = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const validated = spawnSync(packageManager, ["env:check"], {
  stdio: "inherit",
  env: process.env,
});
if (validated.status !== 0) process.exit(validated.status ?? 1);

const supabase = spawnSync(packageManager, ["supabase:start"], {
  stdio: "inherit",
  env: process.env,
});
if (supabase.status !== 0) process.exit(supabase.status ?? 1);

const children = [
  spawn(packageManager, ["dev"], { stdio: "inherit", env: process.env }),
  spawn(packageManager, ["inngest:dev"], { stdio: "inherit", env: process.env }),
];

function stop(signal) {
  for (const child of children) child.kill(signal);
}
process.on("SIGINT", () => stop("SIGINT"));
process.on("SIGTERM", () => stop("SIGTERM"));
for (const child of children) {
  child.on("exit", (code) => {
    stop("SIGTERM");
    process.exitCode = code ?? 1;
  });
}
