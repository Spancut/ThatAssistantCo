# Legacy Project Atlas audit

## Disposition key

- **Reusable:** aligns with the roadmap and can likely be retained after verification.
- **Reusable with modification:** useful pattern or implementation, but wrong domain, contract, provider, or controls.
- **Documentation only:** evidence of historical behavior; not an implementation source.
- **Obsolete:** should not be carried into the VA Edition build.
- **Conflicts with VA Edition:** directly encodes a contradictory product or safety model.

## Module audit

| Module | Evidence | Disposition | Reason / required modification |
|---|---|---|---|
| Next.js project shell | `package.json`, `app/layout.tsx`, configs | Reusable with modification | Stack family aligns, but npm, existing feature routes, dependencies, and version choices must be reconciled under T000 |
| Authentication | `app/(auth)`, callback, `lib/validations/auth.ts` | Reusable with modification | Sign-up/sign-in exist; roadmap also requires verification, recovery, membership gating, session tests |
| Session proxy | `proxy.ts`, `lib/supabase/proxy.ts` | Reusable with modification | Correctly treats proxy as UX rather than sole authorization; verify against current Next.js docs |
| Organisation/workspace | onboarding, settings, `lib/server/workspaces.ts` | Reusable with modification | Tenant primitive aligns; `product_mode` and Partner/Founder branching conflict |
| Membership/RLS helpers | migration 000001 | Reusable with modification | Strong org RLS foundation; role enum and missing explicit client access do not match roadmap |
| Audit events | `lib/server/audit.ts`, test | Reusable | Append-oriented service and tests align, subject to sensitive-metadata review |
| Entitlements/usage | migration 000002, `lib/server/entitlements.ts` | Reusable with modification | Useful allowance pattern; roadmap requires AI cost reconciliation, budget alerts, and privacy-minimized metrics |
| Notifications | migration 000002, bell/actions | Reusable with modification | Internal notification primitive may support queues; current payload and UX need roadmap mapping |
| Partner client profiles | migration 000003, clients routes/components | Reusable with modification | Client CRUD and archive patterns useful; lacks timezone, contacts model depth, `client_access`, service scope, and client-level RLS |
| Founder contacts | migration 000003, contacts routes/components | Conflicts with VA Edition | Founder product mode is explicitly future; remove from initial navigation/build |
| Knowledge base items | migration 000003, knowledge component/service | Reusable with modification | Basic client-linked content exists; lacks source lifecycle, publication, supersession, sensitivity, immutability, and safe file processing |
| Client Brain text fields | `brand_voice`, `preferences`, `key_facts` | Reusable with modification | Seed concept aligns, but freeform mutable JSON is not governed Client Brain |
| AI model abstraction | `lib/ai/client.ts`, tests | Reusable with modification | Interface and schema retry tests are useful; implementation is OpenAI, not Anthropic, and lacks roadmap work-order/run metadata |
| AI context assembly | `lib/ai/context.ts` | Reusable with modification | Server-side scoped retrieval pattern is useful; lacks published-only, sensitivity, supersession, manifest, and client-access controls |
| Email prompt | `lib/ai/prompts/draft-email.ts` | Conflicts with VA Edition | Legacy workflow, wrong role architecture, and insufficient source/exception controls |
| AI orchestration | `lib/ai/orchestrator.ts` | Reusable with modification | Entitlement→context→model→validation→persistence pattern is useful; not the roadmap workflow engine or Director interpretation |
| Workflow templates/runs | migration 000004 | Reusable with modification | Run persistence exists; no versioned state-machine definitions, transitions, events, concurrency, or idempotency |
| Outputs/approvals | migration 000004, output actions | Reusable with modification | Human review and no-send boundary align; approvals are not payload/recipient-bound and mutable output loses original proposal semantics |
| Human value entries | migration 000004, form | Documentation only | May inform later VA value evidence, but not a governing Release 1 entity |
| Client/contact pages | routes/components | Reusable with modification | Form/list/detail patterns useful; UX and information architecture must be rebuilt to roadmap |
| Dashboard/mode navigation | shell/dashboard components | Conflicts with VA Edition | Encodes Partner/Founder product split and lacks What Needs You, active client, decisions, waiting, and requests |
| Settings/billing | settings routes/components | Reusable with modification | Account/tenant controls useful; billing is not a Release 1 product priority |
| UI primitives | `components/ui/*` | Reusable | Generic accessible primitives, subject to T012 accessibility validation |
| Seed script | `scripts/seed.ts` | Obsolete | Uses legacy modes, hosted-project service role, personal Gmail aliases, and non-roadmap fixtures |
| Unit fake Supabase | `test/helpers/fake-supabase.ts` | Reusable with modification | Useful service-test support, but cannot substitute for SQL/RLS tests |
| Legacy unit tests | `lib/**/*.test.ts` | Reusable with modification | Validate reusable patterns; assertions target legacy schema/contracts |
| Legacy Playwright tests | `e2e/*` | Documentation only | Historical evidence; use patterns selectively, replace scenarios and live OpenAI calls |
| Legacy migrations | `supabase/migrations/*` | Conflicts with VA Edition | Wrong canonical schema and insufficient client scoping; archive rather than evolve blindly |
| Root legacy docs | root README/CLAUDE and nine old `docs/*.md` | Documentation only | Valuable audit evidence but superseded as requirements |
| Generated types/cache | `lib/types/database.ts`, `.next`, `next-env.d.ts`, `tsconfig.tsbuildinfo` | Obsolete | Regenerate from an approved clean schema/build |
| Dependencies | `node_modules/`, `package-lock.json` | Obsolete | Roadmap requires pnpm/lockfile and fresh version validation |
| Generic public assets | `public/*.svg`, favicon | Reusable with modification | No product requirement; retain only if selected during T000/T012 |

## Recommendation

Archive Project Atlas before controlled implementation. Preserve commit `d316d91` and/or a named archival branch/tag, then create the VA Edition foundation from the governing roadmap on a clean `main` history or clean repository root. Selectively port only audited primitives after their new ticket acceptance criteria are defined. Do not perform an in-place rename-and-continue of the legacy schema or product-mode UI.
