import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";

const requiredFiles = [
  "AGENTS.md",
  "CLAUDE.md",
  "docs/architecture.md",
  "docs/adr/000-template.md",
  "docs/tickets/000-template.md",
  "docs/build-journal.md",
  "docs/build-journal-template.md",
  "docs/source-of-truth-index.md",
  "thatassistant-os-project-docs-v1.1/What you should do next.docx",
];

const failures = [];

for (const path of requiredFiles) {
  if (!existsSync(path)) {
    failures.push(`Missing required governance file: ${path}`);
  }
}

const requiredContent = {
  "CLAUDE.md": [
    "What you should do next.docx",
    "AGENTS.md",
    "one explicitly approved ticket",
    "tenant_id",
    "client_id",
    "stop before the next ticket",
  ],
  "docs/adr/000-template.md": [
    "Related ticket:",
    "Governing requirements:",
    "## Alternatives considered",
    "## Security and privacy impact",
    "## Tenant and client isolation impact",
    "## AI safety impact",
    "## Migration or rollback considerations",
    "## Superseded ADRs",
  ],
  "docs/tickets/000-template.md": [
    "## Authorised scope",
    "## Source requirements",
    "## Data and tenancy impact",
    "## Security and permissions impact",
    "## AI and source-grounding impact",
    "## Prohibited work",
    "## Tests required",
    "## Stop condition",
    "## Completion report",
  ],
  "docs/build-journal-template.md": [
    "Starting commit:",
    "### Documents reviewed",
    "### Authorised scope",
    "Migrations:",
    "Decisions made:",
    "Tests and validation:",
    "Unresolved issues:",
    "Final commit:",
    "Pull request:",
    "Work stopped at the approved ticket boundary.",
  ],
};

for (const [path, tokens] of Object.entries(requiredContent)) {
  if (!existsSync(path)) continue;
  const content = readFileSync(path, "utf8");
  for (const token of tokens) {
    if (!content.includes(token)) {
      failures.push(`Missing required content in ${path}: ${token}`);
    }
  }
}

const branch = execFileSync("git", ["branch", "--show-current"], {
  encoding: "utf8",
}).trim();
const allowedBranch =
  branch === "main" ||
  branch === "master" ||
  /^codex\/t\d{3}-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(branch);

if (!allowedBranch) {
  failures.push(`Branch "${branch}" is not main/master or codex/tNNN-kebab-case.`);
}

const trackedFiles = execFileSync(
  "git",
  ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
  {
    encoding: "utf8",
  },
)
  .split("\0")
  .filter(Boolean);

const prohibitedTrackedPaths = trackedFiles.filter(
  (path) =>
    (/^\.env(?:\.|$)/.test(path) && path !== ".env.example") ||
    path === ".vercel/project.json" ||
    path === "supabase/.temp/project-ref",
);

for (const path of prohibitedTrackedPaths) {
  failures.push(`Prohibited environment or hosted-project metadata: ${path}`);
}

const textExtensions =
  /\.(?:cjs|css|env|example|html|js|json|jsx|md|mjs|sql|toml|ts|tsx|txt|yaml|yml)$/i;
const secretPatterns = [
  ["OpenAI key", /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/],
  ["GitHub token", /\bgh[oprsu]_[A-Za-z0-9]{20,}\b/],
  ["AWS access key", /\bAKIA[0-9A-Z]{16}\b/],
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ["Supabase service-role value", /\bservice_role\s*=\s*["'][^"']+["']/i],
];

for (const path of trackedFiles.filter((file) => textExtensions.test(file))) {
  const content = readFileSync(path, "utf8");
  for (const [label, pattern] of secretPatterns) {
    if (pattern.test(content)) {
      failures.push(`Possible ${label} in tracked file: ${path}`);
    }
  }
}

const hooksResult = spawnSync("git", ["config", "--local", "--get", "core.hooksPath"], {
  encoding: "utf8",
});
const hooksPath = hooksResult.status === 0 ? hooksResult.stdout.trim() : "";

if (hooksPath) {
  failures.push(
    `Local Git hooks path is configured (${hooksPath}); remove it unless an approved ticket authorises reviewed safe hooks.`,
  );
}

if (existsSync(".git/hooks")) {
  const activeLocalHooks = readdirSync(".git/hooks").filter((name) => !name.endsWith(".sample"));
  for (const name of activeLocalHooks) {
    failures.push(
      `Active local Git hook detected (.git/hooks/${name}); review and remove it unless an approved ticket authorises it.`,
    );
  }
}

if (failures.length > 0) {
  console.error("Governance check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  console.error("Correct the reported governance issue and rerun this check.");
  process.exit(1);
}

console.log(
  `Governance check passed for ${branch}: required files, branch naming, tracked-secret patterns, hosted-project metadata, and local hook configuration are safe.`,
);
