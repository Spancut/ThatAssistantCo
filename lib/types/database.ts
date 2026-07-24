/**
 * Hand-written to match supabase/migrations/20260724000001_init_platform_schema.sql,
 * 20260724000002_billing_entitlements_notifications.sql, and
 * 20260724000003_clients_contacts_knowledge.sql.
 * Once a live project exists, regenerate with:
 *   npx supabase gen types typescript --linked > lib/types/database.ts
 * and re-apply any manual additions.
 */

export type ProductMode = "partner" | "founder";
export type MembershipRole =
  | "owner"
  | "admin"
  | "member"
  | "client_reviewer"
  | "certified_operator";
export type SubscriptionPlan = "trial" | "starter" | "pro";
export type SubscriptionStatus = "active" | "past_due" | "canceled";
export type PipelineStage =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal"
  | "customer"
  | "dormant";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          product_mode: ProductMode;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          product_mode: ProductMode;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          product_mode?: ProductMode;
          created_by?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      memberships: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          role: MembershipRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          role: MembershipRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          user_id?: string;
          role?: MembershipRole;
          created_at?: string;
        };
        Relationships: [];
      };
      audit_events: {
        Row: {
          id: string;
          org_id: string;
          actor_user_id: string;
          action: string;
          target_type: string;
          target_id: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          actor_user_id: string;
          action: string;
          target_type: string;
          target_id?: string | null;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          actor_user_id?: string;
          action?: string;
          target_type?: string;
          target_id?: string | null;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          org_id: string;
          plan: SubscriptionPlan;
          status: SubscriptionStatus;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          plan?: SubscriptionPlan;
          status?: SubscriptionStatus;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          plan?: SubscriptionPlan;
          status?: SubscriptionStatus;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      entitlements: {
        Row: {
          id: string;
          org_id: string;
          feature_key: string;
          limit_value: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          feature_key: string;
          limit_value?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          feature_key?: string;
          limit_value?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      usage_events: {
        Row: {
          id: string;
          org_id: string;
          feature_key: string;
          amount: number;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          feature_key: string;
          amount?: number;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          feature_key?: string;
          amount?: number;
          created_by?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          type: string;
          payload: Record<string, unknown>;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          type: string;
          payload?: Record<string, unknown>;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          user_id?: string;
          type?: string;
          payload?: Record<string, unknown>;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      client_profiles: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          brand_voice: string | null;
          preferences: Record<string, unknown>;
          key_facts: Record<string, unknown>;
          archived_at: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          brand_voice?: string | null;
          preferences?: Record<string, unknown>;
          key_facts?: Record<string, unknown>;
          archived_at?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          brand_voice?: string | null;
          preferences?: Record<string, unknown>;
          key_facts?: Record<string, unknown>;
          archived_at?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      contacts: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          company: string | null;
          email: string | null;
          phone: string | null;
          pipeline_stage: PipelineStage;
          source: string | null;
          notes: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          company?: string | null;
          email?: string | null;
          phone?: string | null;
          pipeline_stage?: PipelineStage;
          source?: string | null;
          notes?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          company?: string | null;
          email?: string | null;
          phone?: string | null;
          pipeline_stage?: PipelineStage;
          source?: string | null;
          notes?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      knowledge_base_items: {
        Row: {
          id: string;
          org_id: string;
          title: string;
          content: string;
          tags: string[];
          linked_client_profile_id: string | null;
          linked_contact_id: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          title: string;
          content?: string;
          tags?: string[];
          linked_client_profile_id?: string | null;
          linked_contact_id?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          title?: string;
          content?: string;
          tags?: string[];
          linked_client_profile_id?: string | null;
          linked_contact_id?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_workspace: {
        Args: { workspace_name: string; mode: ProductMode };
        Returns: Database["public"]["Tables"]["organizations"]["Row"];
      };
      is_org_member: {
        Args: { target_org_id: string; uid: string };
        Returns: boolean;
      };
      is_org_admin: {
        Args: { target_org_id: string; uid: string };
        Returns: boolean;
      };
      create_notification: {
        Args: {
          target_org_id: string;
          target_user_id: string;
          notification_type: string;
          notification_payload?: Record<string, unknown>;
        };
        Returns: Database["public"]["Tables"]["notifications"]["Row"];
      };
    };
    Enums: {
      product_mode: ProductMode;
      membership_role: MembershipRole;
      subscription_plan: SubscriptionPlan;
      subscription_status: SubscriptionStatus;
      pipeline_stage: PipelineStage;
    };
  };
}
