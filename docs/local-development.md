# Local development

## Prerequisites

- Node.js 24.11.x and Corepack/pnpm 11.17.0.
- Docker Desktop running with Linux containers. Supabase CLI requires a
  Docker-compatible container runtime.
- A clean clone with no hosted-provider credentials.

On this Windows workstation, Node registry access may require the trusted Windows
certificate store: set `NODE_OPTIONS=--use-system-ca` for the install process. Never
disable strict TLS validation.

## First run

1. Run `corepack pnpm install --frozen-lockfile`.
2. Copy `.env.example` to ignored `.env.local`.
3. Run `corepack pnpm env:check`.
4. Run `corepack pnpm supabase:start`.
5. In one terminal run `corepack pnpm dev`.
6. In another run `corepack pnpm inngest:dev`.
7. Open the app at `http://localhost:3000`, Inngest at
   `http://localhost:8288`, and Supabase Studio at
   `http://127.0.0.1:54323`.
8. Check `http://localhost:3000/api/health`; all enabled services should be
   `healthy`.

`corepack pnpm dev:local` validates the environment, starts Supabase, then starts the
app and Inngest together. It deliberately stops if Supabase cannot start. It does not
reset data and does not stop Supabase automatically.

## Service commands

- `corepack pnpm supabase:status`
- `corepack pnpm supabase:stop`
- `corepack pnpm supabase:reset:local` — destructive to local database data only
- `corepack pnpm inngest:dev`
- `corepack pnpm env:check:example`

The safe Inngest function
`thatassistant/infrastructure.health.requested` returns infrastructure-only metadata.
It performs no AI call, provider mutation, message, deployment, or external action.

## Troubleshooting

- If Supabase reports that Docker is unavailable, install/start Docker Desktop and
  retry `corepack pnpm supabase:start`.
- If package install reports `UNABLE_TO_VERIFY_LEAF_SIGNATURE`, configure the
  organisation CA for Node or use Node 24's `--use-system-ca`. Do not set
  `strict-ssl=false` or disable certificate verification.
- If health is `degraded`, run the Supabase status command, confirm the Inngest UI,
  and re-run environment validation. The endpoint intentionally does not expose
  connection strings or provider errors.
