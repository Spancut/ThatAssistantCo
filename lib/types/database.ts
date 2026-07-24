/**
 * Hand-written to match supabase/migrations/20260724000001_init_platform_schema.sql.
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
    };
    Enums: {
      product_mode: ProductMode;
      membership_role: MembershipRole;
    };
  };
}
