# ThatAssistant

One platform, two products — **ThatAssistant Partner** (client-delivery workspace) and **ThatAssistant Founder** (business operations command centre). See [docs/](docs/) for the product brief, architecture, data model, and build plan.

## Stack

Next.js 16 (App Router) · TypeScript strict · Tailwind CSS v4 · shadcn/ui · Supabase (Postgres + Auth + Storage) · Zod · Vitest · Playwright.

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a Supabase project at [supabase.com](https://supabase.com) (there's no local Docker stack requirement — everything here runs against a hosted project).
3. Copy the env file and fill in your project's credentials (Project Settings → API):
   ```bash
   cp .env.example .env.local
   ```
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — safe for the browser.
   - `SUPABASE_SERVICE_ROLE_KEY` — server-only, used by `scripts/seed.ts`. Never expose this.
   - `OPENAI_API_KEY` — server-only, used by `lib/ai/client.ts` (the AI draft workflow). Never expose this.
   - `E2E_TEST_EMAIL_BASE` — Playwright only, not used by the app itself. A real inbox you own; seeded/test accounts are created as `+alias` addresses under it so nothing bounces. See "Seed data" below and docs/decisions.md.
4. In your Supabase project's **Authentication → Providers → Email** settings, consider turning **Confirm email** off during local development so sign-up doesn't require clicking an emailed link. Turn it back on before going to production.

## Supabase migrations

Migrations live in `supabase/migrations/`. Apply them to your linked project:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

`npx supabase db push` applies every migration in order. Re-running it is safe — already-applied migrations are skipped.

## Seed data

`scripts/seed.ts` creates two deterministic dev accounts (never run against production):

- `danielcutrona+seed-partner@gmail.com` — a Partner workspace
- `danielcutrona+seed-founder@gmail.com` — a Founder workspace

Both use the password printed at the end of the script run. Requires `.env.local` to be filled in (uses the service role key via the Supabase Admin API — this is why seeding isn't done as a plain SQL file: fabricating `auth.users` rows directly isn't a supported pattern against a hosted project).

**Before changing these emails:** they're deliberately `+alias` addresses under a real inbox someone on the team owns, not a fabricated domain — Supabase flagged this project for bounces once already from fake-domain test addresses. If you fork this for your own project, swap in an inbox you control. See docs/decisions.md.

```bash
npm run seed
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tests

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm test            # vitest (unit tests)
npm run test:e2e    # playwright (requires the dev server, a real Supabase project, and E2E_TEST_EMAIL_BASE set to an inbox you own)
```

## Deployment

1. Push `supabase/migrations/` to your production Supabase project (`npx supabase db push` against the prod project ref) — do **not** run `scripts/seed.ts` against production.
2. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `OPENAI_API_KEY` as server environment variables on your hosting platform. Never commit them. (`E2E_TEST_EMAIL_BASE` is Playwright-only — don't set it in production.)
3. In Supabase Auth settings, turn **Confirm email** back on and set the site URL / redirect URLs to your production domain (needed for `/auth/callback` to work).
4. `npm run build && npm start`, or deploy to a platform that runs `next build`/`next start` for you (Turbopack is the default build/dev engine in Next.js 16).
