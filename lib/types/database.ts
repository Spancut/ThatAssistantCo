/**
 * Hand-written to match supabase/migrations/20260724000001_init_platform_schema.sql,
 * 20260724000002_billing_entitlements_notifications.sql,
 * 20260724000003_clients_contacts_knowledge.sql, and
 * 20260724000004_ai_workflows.sql.
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
export type WorkflowProductMode = "partner" | "founder" | "both";
export type WorkflowRunStatus = "pending" | "completed" | "failed";
export type OutputStatus = "draft" | "approved" | "edited_and_approved" | "rejected";
export type ApprovalStatus = "pending" | "approved" | "rejected" | "edited_and_approved";

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
      workflow_templates: {
        Row: {
          id: string;
          key: string;
          product_mode: WorkflowProductMode;
          input_schema: Record<string, unknown>;
          prompt_version: string;
          output_schema_key: string;
          requires_approval: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          product_mode: WorkflowProductMode;
          input_schema?: Record<string, unknown>;
          prompt_version: string;
          output_schema_key: string;
          requires_approval?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          product_mode?: WorkflowProductMode;
          input_schema?: Record<string, unknown>;
          prompt_version?: string;
          output_schema_key?: string;
          requires_approval?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      workflow_runs: {
        Row: {
          id: string;
          workflow_template_id: string;
          org_id: string;
          initiated_by: string;
          input_snapshot: Record<string, unknown>;
          status: WorkflowRunStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          workflow_template_id: string;
          org_id: string;
          initiated_by: string;
          input_snapshot?: Record<string, unknown>;
          status?: WorkflowRunStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          workflow_template_id?: string;
          org_id?: string;
          initiated_by?: string;
          input_snapshot?: Record<string, unknown>;
          status?: WorkflowRunStatus;
          created_at?: string;
        };
        Relationships: [];
      };
      outputs: {
        Row: {
          id: string;
          workflow_run_id: string;
          org_id: string;
          output_type: string;
          draft_content: string;
          structured_content: Record<string, unknown>;
          status: OutputStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          workflow_run_id: string;
          org_id: string;
          output_type: string;
          draft_content: string;
          structured_content: Record<string, unknown>;
          status?: OutputStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          workflow_run_id?: string;
          org_id?: string;
          output_type?: string;
          draft_content?: string;
          structured_content?: Record<string, unknown>;
          status?: OutputStatus;
          created_at?: string;
        };
        Relationships: [];
      };
      approvals: {
        Row: {
          id: string;
          output_id: string;
          approver_id: string;
          status: ApprovalStatus;
          edited_content: string | null;
          approved_at: string;
        };
        Insert: {
          id?: string;
          output_id: string;
          approver_id: string;
          status: ApprovalStatus;
          edited_content?: string | null;
          approved_at?: string;
        };
        Update: {
          id?: string;
          output_id?: string;
          approver_id?: string;
          status?: ApprovalStatus;
          edited_content?: string | null;
          approved_at?: string;
        };
        Relationships: [];
      };
      human_value_entries: {
        Row: {
          id: string;
          output_id: string;
          org_id: string;
          created_by: string;
          context_added: string | null;
          judgment_applied: string | null;
          preference_considered: string | null;
          risk_identified: string | null;
          recommendation_made: string | null;
          corrections_made: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          output_id: string;
          org_id: string;
          created_by: string;
          context_added?: string | null;
          judgment_applied?: string | null;
          preference_considered?: string | null;
          risk_identified?: string | null;
          recommendation_made?: string | null;
          corrections_made?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          output_id?: string;
          org_id?: string;
          created_by?: string;
          context_added?: string | null;
          judgment_applied?: string | null;
          preference_considered?: string | null;
          risk_identified?: string | null;
          recommendation_made?: string | null;
          corrections_made?: string | null;
          created_at?: string;
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
      workflow_product_mode: WorkflowProductMode;
      workflow_run_status: WorkflowRunStatus;
      output_status: OutputStatus;
      approval_status: ApprovalStatus;
    };
  };
}
