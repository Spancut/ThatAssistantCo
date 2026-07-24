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

// Real inbox we own (+alias), not a fake/unowned domain: these go through
// Supabase Auth's admin API. That doesn't send a confirmation email today
// (email_confirm: true bypasses it), but if that ever changes — a resend,
// a future invite flow, a dashboard action — mail should land somewhere
// real instead of bouncing. See docs/decisions.md.
const SEEDS: SeedWorkspace[] = [
  {
    email: "danielcutrona+seed-partner@gmail.com",
    fullName: "Partner Demo User",
    orgName: "Acme Partner Demo",
    slug: "partner-demo",
    productMode: "partner",
  },
  {
    email: "danielcutrona+seed-founder@gmail.com",
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

const DEFAULT_ENTITLEMENTS: { feature_key: string; limit_value: number | null }[] = [
  { feature_key: "ai_generations_per_month", limit_value: 200 },
  { feature_key: "max_clients", limit_value: null },
  { feature_key: "max_contacts", limit_value: null },
];

/**
 * Idempotent: runs for both newly-created and pre-existing seeded
 * workspaces, so re-running `npm run seed` also backfills billing rows for
 * workspaces created before this migration existed.
 */
async function ensureBilling(orgId: string) {
  const { error: subscriptionError } = await admin
    .from("subscriptions")
    .upsert({ org_id: orgId, plan: "trial", status: "active" }, { onConflict: "org_id", ignoreDuplicates: true });
  if (subscriptionError) throw subscriptionError;

  const { error: entitlementsError } = await admin.from("entitlements").upsert(
    DEFAULT_ENTITLEMENTS.map((e) => ({ org_id: orgId, ...e })),
    { onConflict: "org_id,feature_key", ignoreDuplicates: true }
  );
  if (entitlementsError) throw entitlementsError;

  console.log("  subscription + entitlements ensured");
}

// ---------------------------------------------------------------------------
// Milestone 2 seed content: realistic clients (Partner) / contacts (Founder)
// + a few linked knowledge_base_items, so every new screen has real content
// on first login. Idempotent by name, so re-running `npm run seed` doesn't
// duplicate rows.
// ---------------------------------------------------------------------------

type ClientSeed = {
  name: string;
  brandVoice: string;
  preferencesNotes: string;
  keyFactsNotes: string;
  knowledgeItem: { title: string; content: string; tags: string[] };
};

const CLIENT_SEEDS: ClientSeed[] = [
  {
    name: "Brightleaf Bakery",
    brandVoice: "Warm, friendly, a little playful — think handwritten notes, not corporate memos.",
    preferencesNotes: "Reviews all social copy before it goes out. Prefers Tuesday check-ins.",
    keyFactsNotes: "Family-owned since 2011. Two locations. Owner's name is Maria.",
    knowledgeItem: {
      title: "Do not mention gluten-free options",
      content: "They stopped offering a gluten-free line in 2025 — don't reference it in any copy.",
      tags: ["constraint"],
    },
  },
  {
    name: "Nordholt Legal Group",
    brandVoice: "Formal, precise, no contractions. Every claim needs to be defensible.",
    preferencesNotes: "Legal review required on anything mentioning case outcomes.",
    keyFactsNotes: "Boutique employment law firm. 6 attorneys. Founded by Erik Nordholt.",
    knowledgeItem: {
      title: "Preferred CTA phrasing",
      content: "Use \"Schedule a confidential consultation\" rather than \"Book a call\".",
      tags: ["voice", "cta"],
    },
  },
  {
    name: "Cedar & Vine Landscaping",
    brandVoice: "Down-to-earth, practical, seasonal.",
    preferencesNotes: "Wants a monthly newsletter draft by the 25th.",
    keyFactsNotes: "Residential + light commercial. Busy season is April through October.",
    knowledgeItem: {
      title: "Service area",
      content: "Only serves the greater Millbrook County area — don't imply broader coverage.",
      tags: ["facts"],
    },
  },
];

type ContactSeed = {
  name: string;
  company: string;
  email: string;
  pipelineStage: Database["public"]["Enums"]["pipeline_stage"];
  source: string;
  knowledgeItem?: { title: string; content: string; tags: string[] };
};

const CONTACT_SEEDS: ContactSeed[] = [
  {
    name: "Jordan Reyes",
    company: "Skyline Coffee Roasters",
    email: "jordan@skylineroasters.example.com",
    pipelineStage: "new",
    source: "Website form",
    knowledgeItem: {
      title: "Interested in weekly specials automation",
      content: "Mentioned wanting help drafting weekly specials posts. Budget-conscious.",
      tags: ["interest"],
    },
  },
  {
    name: "Priya Natarajan",
    company: "Natarajan & Co",
    email: "priya@natarajanco.example.com",
    pipelineStage: "contacted",
    source: "Referral",
    knowledgeItem: {
      title: "Referred by Jordan Reyes",
      content: "Came through Jordan's referral — mention that in follow-up.",
      tags: ["referral"],
    },
  },
  {
    name: "Tomas Vidal",
    company: "Vidal Events Co",
    email: "tomas@vidalevents.example.com",
    pipelineStage: "contacted",
    source: "Website form",
  },
  {
    name: "Marcus Webb",
    company: "Webb Fitness Studio",
    email: "marcus@webbfitness.example.com",
    pipelineStage: "qualified",
    source: "Instagram DM",
  },
  {
    name: "Elena Cho",
    company: "Cho Interiors",
    email: "elena@chointeriors.example.com",
    pipelineStage: "proposal",
    source: "Trade show",
    knowledgeItem: {
      title: "Proposal sent 2026-07-20",
      content: "Sent a 3-month content retainer proposal. Follow up if no response by end of month.",
      tags: ["proposal"],
    },
  },
  {
    name: "Devon Okafor",
    company: "Okafor Consulting",
    email: "devon@okaforconsulting.example.com",
    pipelineStage: "customer",
    source: "Referral",
    knowledgeItem: {
      title: "Renewal date",
      content: "Annual contract renews in January. Check in during Q4.",
      tags: ["renewal"],
    },
  },
  {
    name: "Sam Patterson",
    company: "Patterson Auto Repair",
    email: "sam@pattersonauto.example.com",
    pipelineStage: "customer",
    source: "Google search",
  },
  {
    name: "Ruth Iversen",
    company: "Iversen Family Dentistry",
    email: "ruth@iversendentistry.example.com",
    pipelineStage: "dormant",
    source: "Cold outreach",
  },
];

async function ensureClients(orgId: string, userId: string) {
  for (const seed of CLIENT_SEEDS) {
    const { data: existing } = await admin
      .from("client_profiles")
      .select("id")
      .eq("org_id", orgId)
      .eq("name", seed.name)
      .maybeSingle();

    let clientId = existing?.id;

    if (!clientId) {
      const { data: created, error } = await admin
        .from("client_profiles")
        .insert({
          org_id: orgId,
          created_by: userId,
          name: seed.name,
          brand_voice: seed.brandVoice,
          preferences: { notes: seed.preferencesNotes },
          key_facts: { notes: seed.keyFactsNotes },
        })
        .select("id")
        .single();
      if (error) throw error;
      clientId = created.id;
      console.log(`  created client: ${seed.name}`);
    }

    const { data: existingItem } = await admin
      .from("knowledge_base_items")
      .select("id")
      .eq("org_id", orgId)
      .eq("title", seed.knowledgeItem.title)
      .maybeSingle();

    if (!existingItem) {
      const { error } = await admin.from("knowledge_base_items").insert({
        org_id: orgId,
        created_by: userId,
        title: seed.knowledgeItem.title,
        content: seed.knowledgeItem.content,
        tags: seed.knowledgeItem.tags,
        linked_client_profile_id: clientId,
      });
      if (error) throw error;
    }
  }
  console.log(`  ${CLIENT_SEEDS.length} client(s) ensured`);
}

async function ensureContacts(orgId: string, userId: string) {
  for (const seed of CONTACT_SEEDS) {
    const { data: existing } = await admin
      .from("contacts")
      .select("id")
      .eq("org_id", orgId)
      .eq("name", seed.name)
      .maybeSingle();

    let contactId = existing?.id;

    if (!contactId) {
      const { data: created, error } = await admin
        .from("contacts")
        .insert({
          org_id: orgId,
          created_by: userId,
          name: seed.name,
          company: seed.company,
          email: seed.email,
          pipeline_stage: seed.pipelineStage,
          source: seed.source,
        })
        .select("id")
        .single();
      if (error) throw error;
      contactId = created.id;
      console.log(`  created contact: ${seed.name} (${seed.pipelineStage})`);
    }

    if (seed.knowledgeItem) {
      const { data: existingItem } = await admin
        .from("knowledge_base_items")
        .select("id")
        .eq("org_id", orgId)
        .eq("title", seed.knowledgeItem.title)
        .maybeSingle();

      if (!existingItem) {
        const { error } = await admin.from("knowledge_base_items").insert({
          org_id: orgId,
          created_by: userId,
          title: seed.knowledgeItem.title,
          content: seed.knowledgeItem.content,
          tags: seed.knowledgeItem.tags,
          linked_contact_id: contactId,
        });
        if (error) throw error;
      }
    }
  }
  console.log(`  ${CONTACT_SEEDS.length} contact(s) ensured`);
}

async function main() {
  console.log("Seeding dev data (never run against production)...");
  for (const seed of SEEDS) {
    console.log(`\n${seed.productMode} demo:`);
    const user = await ensureUser(seed);
    if (!user) throw new Error(`Failed to resolve user for ${seed.email}`);
    const orgId = await ensureWorkspace(seed, user.id);
    await ensureBilling(orgId);

    if (seed.productMode === "partner") {
      await ensureClients(orgId, user.id);
    } else {
      await ensureContacts(orgId, user.id);
    }
  }
  console.log(`\nDone. Dev login password for seeded users: ${DEV_PASSWORD}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
