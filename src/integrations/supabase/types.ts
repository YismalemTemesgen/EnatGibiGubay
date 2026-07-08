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
      donations: {
        Row: {
          amount: number
          created_at: string
          currency: string
          donor_id: string
          donor_name: string
          id: string
          method: string
          note: string | null
          proof_path: string | null
          purpose: string | null
          reference: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["donation_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          donor_id: string
          donor_name: string
          id?: string
          method: string
          note?: string | null
          proof_path?: string | null
          purpose?: string | null
          reference?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["donation_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          donor_id?: string
          donor_name?: string
          id?: string
          method?: string
          note?: string | null
          proof_path?: string | null
          purpose?: string | null
          reference?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["donation_status"]
          updated_at?: string
        }
        Relationships: []
      }
      feedback_items: {
        Row: {
          admin_reply: string | null
          body: string
          category: Database["public"]["Enums"]["feedback_category"]
          contact: string | null
          created_at: string
          id: string
          is_anonymous: boolean
          replied_at: string | null
          replied_by: string | null
          status: Database["public"]["Enums"]["feedback_status"]
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_reply?: string | null
          body: string
          category: Database["public"]["Enums"]["feedback_category"]
          contact?: string | null
          created_at?: string
          id?: string
          is_anonymous?: boolean
          replied_at?: string | null
          replied_by?: string | null
          status?: Database["public"]["Enums"]["feedback_status"]
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_reply?: string | null
          body?: string
          category?: Database["public"]["Enums"]["feedback_category"]
          contact?: string | null
          created_at?: string
          id?: string
          is_anonymous?: boolean
          replied_at?: string | null
          replied_by?: string | null
          status?: Database["public"]["Enums"]["feedback_status"]
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      history_entries: {
        Row: {
          author_id: string
          body: string | null
          created_at: string
          external_url: string | null
          file_path: string | null
          id: string
          kind: Database["public"]["Enums"]["history_kind"]
          section: string | null
          title: string
          updated_at: string
          year: string | null
        }
        Insert: {
          author_id: string
          body?: string | null
          created_at?: string
          external_url?: string | null
          file_path?: string | null
          id?: string
          kind: Database["public"]["Enums"]["history_kind"]
          section?: string | null
          title: string
          updated_at?: string
          year?: string | null
        }
        Update: {
          author_id?: string
          body?: string | null
          created_at?: string
          external_url?: string | null
          file_path?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["history_kind"]
          section?: string | null
          title?: string
          updated_at?: string
          year?: string | null
        }
        Relationships: []
      }
      library_items: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          external_url: string | null
          file_path: string | null
          id: string
          kind: Database["public"]["Enums"]["library_kind"]
          status: Database["public"]["Enums"]["library_status"]
          title: string
          updated_at: string
          uploader_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          external_url?: string | null
          file_path?: string | null
          id?: string
          kind: Database["public"]["Enums"]["library_kind"]
          status?: Database["public"]["Enums"]["library_status"]
          title: string
          updated_at?: string
          uploader_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          external_url?: string | null
          file_path?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["library_kind"]
          status?: Database["public"]["Enums"]["library_status"]
          title?: string
          updated_at?: string
          uploader_id?: string
        }
        Relationships: []
      }
      mezmur_items: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          external_url: string | null
          file_path: string | null
          id: string
          kind: Database["public"]["Enums"]["mezmur_kind"]
          status: Database["public"]["Enums"]["mezmur_status"]
          title: string
          updated_at: string
          uploader_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          external_url?: string | null
          file_path?: string | null
          id?: string
          kind: Database["public"]["Enums"]["mezmur_kind"]
          status?: Database["public"]["Enums"]["mezmur_status"]
          title: string
          updated_at?: string
          uploader_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          external_url?: string | null
          file_path?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["mezmur_kind"]
          status?: Database["public"]["Enums"]["mezmur_status"]
          title?: string
          updated_at?: string
          uploader_id?: string
        }
        Relationships: []
      }
      notices: {
        Row: {
          attachment_type: string | null
          attachment_url: string | null
          author_id: string
          body: string
          category: string | null
          created_at: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          attachment_type?: string | null
          attachment_url?: string | null
          author_id: string
          body: string
          category?: string | null
          created_at?: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          attachment_type?: string | null
          attachment_url?: string | null
          author_id?: string
          body?: string
          category?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          academic_year: string | null
          avatar_url: string | null
          created_at: string
          department: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          academic_year?: string | null
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          academic_year?: string | null
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      registrations: {
        Row: {
          academic_year: string | null
          age: number | null
          baptism_name: string | null
          created_at: string
          department: string | null
          dormitory: string | null
          father_confessor: string | null
          full_name: string
          home_place: string | null
          id: string
          notes: string | null
          phone: string | null
          sex: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          academic_year?: string | null
          age?: number | null
          baptism_name?: string | null
          created_at?: string
          department?: string | null
          dormitory?: string | null
          father_confessor?: string | null
          full_name: string
          home_place?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          sex?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          academic_year?: string | null
          age?: number | null
          baptism_name?: string | null
          created_at?: string
          department?: string | null
          dormitory?: string | null
          father_confessor?: string | null
          full_name?: string
          home_place?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          sex?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      donation_status: "pending" | "approved" | "rejected"
      feedback_category:
        | "other_religion"
        | "tewahedo"
        | "about_gbi"
        | "suggestion"
      feedback_status: "open" | "answered" | "closed"
      history_kind:
        | "history"
        | "report"
        | "plan"
        | "future_plan"
        | "section_control"
      library_kind: "pdf" | "video"
      library_status: "pending" | "approved"
      mezmur_kind: "audio" | "video"
      mezmur_status: "pending" | "approved"
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
      app_role: ["admin", "user"],
      donation_status: ["pending", "approved", "rejected"],
      feedback_category: [
        "other_religion",
        "tewahedo",
        "about_gbi",
        "suggestion",
      ],
      feedback_status: ["open", "answered", "closed"],
      history_kind: [
        "history",
        "report",
        "plan",
        "future_plan",
        "section_control",
      ],
      library_kind: ["pdf", "video"],
      library_status: ["pending", "approved"],
      mezmur_kind: ["audio", "video"],
      mezmur_status: ["pending", "approved"],
    },
  },
} as const
