/**
 * Deterministic dev-only seed script.
 *
 * Why not supabase/seed.sql: seeding auth.users directly with raw SQL is
 * fragile against a hosted Supabase project (password hashing/identity rows
 * are GoTrue-internal, not something a plain INSERT should fabricate). This
 * script uses the Supabase Admin API (service role key) instead, which is
 * the supported way to create users programmatically. Never run this
 * against a production project.
 *
 * Usage: npm run seed
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../lib/types/database";

if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    // no .env.local present; rely on already-exported env vars
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set them in .env.local before running the seed script."
  );
  process.exit(1);
}

const admin = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEV_PASSWORD = "dev-password-only-123!";

type SeedWorkspace = {
  email: string;
  fullName: string;
  orgName: string;
  slug: string;
  productMode: "partner" | "founder";
};

const SEEDS: SeedWorkspace[] = [
  {
    email: "partner-demo@thatassistant.dev",
    fullName: "Partner Demo User",
    orgName: "Acme Partner Demo",
    slug: "partner-demo",
    productMode: "partner",
  },
  {
    email: "founder-demo@thatassistant.dev",
    fullName: "Founder Demo User",
    orgName: "Acme Founder Demo",
    slug: "founder-demo",
    productMode: "founder",
  },
];

async function findUserByEmail(email: string) {
  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (error) throw error;
  return data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase()) ?? null;
}

async function ensureUser(seed: SeedWorkspace) {
  const existing = await findUserByEmail(seed.email);
  if (existing) {
    console.log(`  user already exists: ${seed.email}`);
    return existing;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: seed.email,
    password: DEV_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: seed.fullName },
  });
  if (error) throw error;
  console.log(`  created user: ${seed.email}`);
  return data.user;
}

async function ensureWorkspace(seed: SeedWorkspace, userId: string) {
  const { data: existingOrg } = await admin
    .from("organizations")
    .select("id")
    .eq("slug", seed.slug)
    .maybeSingle();

  if (existingOrg) {
    console.log(`  workspace already exists: ${seed.slug}`);
    return existingOrg.id as string;
  }

  const { data: org, error: orgError } = await admin
    .from("organizations")
    .insert({
      name: seed.orgName,
      slug: seed.slug,
      product_mode: seed.productMode,
      created_by: userId,
    })
    .select("id")
    .single();
  if (orgError) throw orgError;

  const { error: membershipError } = await admin.from("memberships").insert({
    org_id: org.id,
    user_id: userId,
    role: "owner",
  });
  if (membershipError) throw membershipError;

  const { error: auditError } = await admin.from("audit_events").insert({
    org_id: org.id,
    actor_user_id: userId,
    action: "workspace.created",
    target_type: "organization",
    target_id: org.id,
    metadata: { source: "seed_script" },
  });
  if (auditError) throw auditError;

  console.log(`  created workspace: ${seed.slug} (${seed.productMode})`);
  return org.id as string;
}

async function main() {
  console.log("Seeding dev data (never run against production)...");
  for (const seed of SEEDS) {
    console.log(`\n${seed.productMode} demo:`);
    const user = await ensureUser(seed);
    if (!user) throw new Error(`Failed to resolve user for ${seed.email}`);
    await ensureWorkspace(seed, user.id);
  }
  console.log(`\nDone. Dev login password for seeded users: ${DEV_PASSWORD}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
