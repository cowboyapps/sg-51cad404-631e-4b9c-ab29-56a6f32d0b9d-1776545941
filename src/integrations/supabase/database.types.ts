 
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      businesses: {
        Row: {
          created_at: string | null
          custom_domain: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          primary_color: string | null
          slug: string
          status: Database["public"]["Enums"]["business_status"] | null
          support_email: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_domain?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          primary_color?: string | null
          slug: string
          status?: Database["public"]["Enums"]["business_status"] | null
          support_email?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_domain?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          primary_color?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["business_status"] | null
          support_email?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          business_id: string
          created_at: string | null
          id: string
          profile_id: string
          subscription_status:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          updated_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          id?: string
          profile_id: string
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          id?: string
          profile_id?: string
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          business_id: string
          created_at: string | null
          customer_id: string
          due_date: string | null
          id: string
          paid_at: string | null
          status: Database["public"]["Enums"]["invoice_status"] | null
          subscription_id: string
          tax: number | null
          total: number
        }
        Insert: {
          amount: number
          business_id: string
          created_at?: string | null
          customer_id: string
          due_date?: string | null
          id?: string
          paid_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subscription_id: string
          tax?: number | null
          total: number
        }
        Update: {
          amount?: number
          business_id?: string
          created_at?: string | null
          customer_id?: string
          due_date?: string | null
          id?: string
          paid_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subscription_id?: string
          tax?: number | null
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          business_id: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          business_id?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          business_id?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          business_id: string
          connection_limit: number | null
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          business_id: string
          connection_limit?: number | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          business_id?: string
          connection_limit?: number | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_plans_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          customer_id: string
          id: string
          iptv_mac_address: string | null
          iptv_password: string | null
          iptv_server_url: string | null
          iptv_username: string | null
          plan_id: string
          status: Database["public"]["Enums"]["subscription_status"] | null
          trial_end: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          customer_id: string
          id?: string
          iptv_mac_address?: string | null
          iptv_password?: string | null
          iptv_server_url?: string | null
          iptv_username?: string | null
          plan_id: string
          status?: Database["public"]["Enums"]["subscription_status"] | null
          trial_end?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          customer_id?: string
          id?: string
          iptv_mac_address?: string | null
          iptv_password?: string | null
          iptv_server_url?: string | null
          iptv_username?: string | null
          plan_id?: string
          status?: Database["public"]["Enums"]["subscription_status"] | null
          trial_end?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          business_id: string
          created_at: string | null
          customer_id: string
          id: string
          priority: Database["public"]["Enums"]["ticket_priority"] | null
          status: Database["public"]["Enums"]["ticket_status"] | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          customer_id: string
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"] | null
          status?: Database["public"]["Enums"]["ticket_status"] | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          customer_id?: string
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"] | null
          status?: Database["public"]["Enums"]["ticket_status"] | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          created_at: string | null
          id: string
          is_from_customer: boolean | null
          message: string
          sender_id: string
          ticket_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_from_customer?: boolean | null
          message: string
          sender_id: string
          ticket_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_from_customer?: boolean | null
          message?: string
          sender_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      billing_cycle: "monthly" | "yearly"
      business_status: "active" | "suspended" | "trial"
      invoice_status: "paid" | "pending" | "overdue" | "cancelled"
      subscription_status: "active" | "past_due" | "cancelled" | "trial"
      ticket_priority: "low" | "medium" | "high" | "urgent"
      ticket_status: "open" | "in_progress" | "resolved" | "closed"
      user_role: "master_admin" | "business_owner" | "customer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      billing_cycle: ["monthly", "yearly"],
      business_status: ["active", "suspended", "trial"],
      invoice_status: ["paid", "pending", "overdue", "cancelled"],
      subscription_status: ["active", "past_due", "cancelled", "trial"],
      ticket_priority: ["low", "medium", "high", "urgent"],
      ticket_status: ["open", "in_progress", "resolved", "closed"],
      user_role: ["master_admin", "business_owner", "customer"],
    },
  },
} as const
