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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agent_chats: {
        Row: {
          agent_id: string
          agent_type: string
          client_id: string | null
          created_at: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          agent_type?: string
          client_id?: string | null
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          agent_type?: string
          client_id?: string | null
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_chats_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_handoffs: {
        Row: {
          chat_id: string
          completed_at: string | null
          created_at: string
          from_agent_id: string
          id: string
          reason: string | null
          status: string
          to_agent_id: string
        }
        Insert: {
          chat_id: string
          completed_at?: string | null
          created_at?: string
          from_agent_id: string
          id?: string
          reason?: string | null
          status?: string
          to_agent_id: string
        }
        Update: {
          chat_id?: string
          completed_at?: string | null
          created_at?: string
          from_agent_id?: string
          id?: string
          reason?: string | null
          status?: string
          to_agent_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_handoffs_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "agent_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_messages: {
        Row: {
          chat_id: string
          content: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
        }
        Insert: {
          chat_id: string
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
        }
        Update: {
          chat_id?: string
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "agent_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_briefs: {
        Row: {
          brief_type: string | null
          company_id: string | null
          content: Json
          generated_at: string
          id: string
          meeting_id: string | null
          user_id: string
        }
        Insert: {
          brief_type?: string | null
          company_id?: string | null
          content: Json
          generated_at?: string
          id?: string
          meeting_id?: string | null
          user_id: string
        }
        Update: {
          brief_type?: string | null
          company_id?: string | null
          content?: Json
          generated_at?: string
          id?: string
          meeting_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_briefs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_briefs_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_otps: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          identifier: string
          identifier_type: string
          otp_code: string
          verified: boolean | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          identifier: string
          identifier_type: string
          otp_code: string
          verified?: boolean | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          identifier?: string
          identifier_type?: string
          otp_code?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      client_feedback: {
        Row: {
          additional_comments: string | null
          communication_rating: number | null
          company_id: string | null
          competitor_name: string | null
          created_at: string
          deal_value: string | null
          feedback_type: string
          id: string
          improvement_suggestions: string | null
          is_repeat_customer: boolean | null
          overall_rating: number | null
          professionalism_rating: number | null
          reason: string | null
          response_time_rating: number | null
          user_id: string
          would_recommend: boolean | null
        }
        Insert: {
          additional_comments?: string | null
          communication_rating?: number | null
          company_id?: string | null
          competitor_name?: string | null
          created_at?: string
          deal_value?: string | null
          feedback_type: string
          id?: string
          improvement_suggestions?: string | null
          is_repeat_customer?: boolean | null
          overall_rating?: number | null
          professionalism_rating?: number | null
          reason?: string | null
          response_time_rating?: number | null
          user_id: string
          would_recommend?: boolean | null
        }
        Update: {
          additional_comments?: string | null
          communication_rating?: number | null
          company_id?: string | null
          competitor_name?: string | null
          created_at?: string
          deal_value?: string | null
          feedback_type?: string
          id?: string
          improvement_suggestions?: string | null
          is_repeat_customer?: boolean | null
          overall_rating?: number | null
          professionalism_rating?: number | null
          reason?: string | null
          response_time_rating?: number | null
          user_id?: string
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "client_feedback_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      client_requirements: {
        Row: {
          area_sqft: string | null
          budget: string | null
          company_id: string | null
          created_at: string
          id: string
          location: string | null
          notes: string | null
          requirement_type: string
          status: string | null
          timeline: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          area_sqft?: string | null
          budget?: string | null
          company_id?: string | null
          created_at?: string
          id?: string
          location?: string | null
          notes?: string | null
          requirement_type: string
          status?: string | null
          timeline?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          area_sqft?: string | null
          budget?: string | null
          company_id?: string | null
          created_at?: string
          id?: string
          location?: string | null
          notes?: string | null
          requirement_type?: string
          status?: string | null
          timeline?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_requirements_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          contact_number: string | null
          created_at: string
          description: string | null
          email: string | null
          employee_count: string | null
          headquarters: string | null
          id: string
          name: string
          revenue: string | null
          sector: string | null
          status: string | null
          updated_at: string
          user_id: string
          verification_token: string | null
          verified: boolean | null
          website: string | null
        }
        Insert: {
          contact_number?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          employee_count?: string | null
          headquarters?: string | null
          id?: string
          name: string
          revenue?: string | null
          sector?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          verification_token?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          contact_number?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          employee_count?: string | null
          headquarters?: string | null
          id?: string
          name?: string
          revenue?: string | null
          sector?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          verification_token?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      demo_requests: {
        Row: {
          company_name: string | null
          company_size: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          phone: string | null
          role: string | null
          status: string | null
        }
        Insert: {
          company_name?: string | null
          company_size?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          role?: string | null
          status?: string | null
        }
        Update: {
          company_name?: string | null
          company_size?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          role?: string | null
          status?: string | null
        }
        Relationships: []
      }
      meetings: {
        Row: {
          agenda: string | null
          attendees: string[] | null
          company_id: string | null
          created_at: string
          id: string
          location: string | null
          meeting_date: string
          notes: string | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agenda?: string | null
          attendees?: string[] | null
          company_id?: string | null
          created_at?: string
          id?: string
          location?: string | null
          meeting_date: string
          notes?: string | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agenda?: string | null
          attendees?: string[] | null
          company_id?: string | null
          created_at?: string
          id?: string
          location?: string | null
          meeting_date?: string
          notes?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      news_items: {
        Row: {
          category: string | null
          created_at: string
          id: string
          published_at: string | null
          relevance_sectors: string[] | null
          source: string | null
          summary: string | null
          title: string
          url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          published_at?: string | null
          relevance_sectors?: string[] | null
          source?: string | null
          summary?: string | null
          title: string
          url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          published_at?: string | null
          relevance_sectors?: string[] | null
          source?: string | null
          summary?: string | null
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: Json | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          plan: string | null
          role: string | null
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          plan?: string | null
          role?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          plan?: string | null
          role?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
