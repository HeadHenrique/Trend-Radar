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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      collection_runs: {
        Row: {
          collection_type: string
          created_at: string
          error_message: string | null
          finished_at: string | null
          id: string
          inserted_count: number
          monitored_profile_id: string
          orchestrator: string
          orchestrator_run_id: string | null
          provider_key: string
          provider_run_id: string | null
          received_count: number
          started_at: string
          status: string
          updated_count: number
        }
        Insert: {
          collection_type: string
          created_at?: string
          error_message?: string | null
          finished_at?: string | null
          id?: string
          inserted_count?: number
          monitored_profile_id: string
          orchestrator?: string
          orchestrator_run_id?: string | null
          provider_key: string
          provider_run_id?: string | null
          received_count?: number
          started_at?: string
          status?: string
          updated_count?: number
        }
        Update: {
          collection_type?: string
          created_at?: string
          error_message?: string | null
          finished_at?: string | null
          id?: string
          inserted_count?: number
          monitored_profile_id?: string
          orchestrator?: string
          orchestrator_run_id?: string | null
          provider_key?: string
          provider_run_id?: string | null
          received_count?: number
          started_at?: string
          status?: string
          updated_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "collection_runs_monitored_profile_id_fkey"
            columns: ["monitored_profile_id"]
            isOneToOne: false
            referencedRelation: "monitored_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      instagram_posts: {
        Row: {
          audio_name: string | null
          author_instagram_external_id: string | null
          author_instagram_username: string | null
          caption: string | null
          content_type: string
          created_at: string
          duration_seconds: number | null
          first_collected_at: string
          hashtags: string[] | null
          id: string
          instagram_media_id: string | null
          instagram_shortcode: string | null
          last_collected_at: string
          permalink: string | null
          published_at: string | null
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          audio_name?: string | null
          author_instagram_external_id?: string | null
          author_instagram_username?: string | null
          caption?: string | null
          content_type?: string
          created_at?: string
          duration_seconds?: number | null
          first_collected_at?: string
          hashtags?: string[] | null
          id?: string
          instagram_media_id?: string | null
          instagram_shortcode?: string | null
          last_collected_at?: string
          permalink?: string | null
          published_at?: string | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          audio_name?: string | null
          author_instagram_external_id?: string | null
          author_instagram_username?: string | null
          caption?: string | null
          content_type?: string
          created_at?: string
          duration_seconds?: number | null
          first_collected_at?: string
          hashtags?: string[] | null
          id?: string
          instagram_media_id?: string | null
          instagram_shortcode?: string | null
          last_collected_at?: string
          permalink?: string | null
          published_at?: string | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      monitored_profile_posts: {
        Row: {
          association_type: string
          created_at: string
          first_seen_at: string
          instagram_post_id: string
          last_seen_at: string
          monitored_profile_id: string
        }
        Insert: {
          association_type: string
          created_at?: string
          first_seen_at?: string
          instagram_post_id: string
          last_seen_at?: string
          monitored_profile_id: string
        }
        Update: {
          association_type?: string
          created_at?: string
          first_seen_at?: string
          instagram_post_id?: string
          last_seen_at?: string
          monitored_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitored_profile_posts_instagram_post_id_fkey"
            columns: ["instagram_post_id"]
            isOneToOne: false
            referencedRelation: "instagram_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitored_profile_posts_monitored_profile_id_fkey"
            columns: ["monitored_profile_id"]
            isOneToOne: false
            referencedRelation: "monitored_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      monitored_profiles: {
        Row: {
          active: boolean
          category: string | null
          created_at: string
          created_by: string | null
          display_name: string | null
          followers_count: number | null
          id: string
          instagram_external_id: string | null
          instagram_username: string
          last_collected_at: string | null
          last_collection_error: string | null
          monitoring_status: string
          next_collection_at: string | null
          niche: string | null
          primary_market_code: string
          priority: number
          profile_group: string
          profile_picture_url: string | null
          tags: string[]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          active?: boolean
          category?: string | null
          created_at?: string
          created_by?: string | null
          display_name?: string | null
          followers_count?: number | null
          id?: string
          instagram_external_id?: string | null
          instagram_username: string
          last_collected_at?: string | null
          last_collection_error?: string | null
          monitoring_status?: string
          next_collection_at?: string | null
          niche?: string | null
          primary_market_code: string
          priority?: number
          profile_group: string
          profile_picture_url?: string | null
          tags?: string[]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          active?: boolean
          category?: string | null
          created_at?: string
          created_by?: string | null
          display_name?: string | null
          followers_count?: number | null
          id?: string
          instagram_external_id?: string | null
          instagram_username?: string
          last_collected_at?: string | null
          last_collection_error?: string | null
          monitoring_status?: string
          next_collection_at?: string | null
          niche?: string | null
          primary_market_code?: string
          priority?: number
          profile_group?: string
          profile_picture_url?: string | null
          tags?: string[]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      post_metric_snapshots: {
        Row: {
          captured_at: string
          collection_run_id: string
          comments_count: number | null
          created_at: string
          id: string
          likes_count: number | null
          monitored_profile_id: string
          plays_count: number | null
          post_id: string
          saves_count: number | null
          shares_count: number | null
          views_count: number | null
        }
        Insert: {
          captured_at: string
          collection_run_id: string
          comments_count?: number | null
          created_at?: string
          id?: string
          likes_count?: number | null
          monitored_profile_id: string
          plays_count?: number | null
          post_id: string
          saves_count?: number | null
          shares_count?: number | null
          views_count?: number | null
        }
        Update: {
          captured_at?: string
          collection_run_id?: string
          comments_count?: number | null
          created_at?: string
          id?: string
          likes_count?: number | null
          monitored_profile_id?: string
          plays_count?: number | null
          post_id?: string
          saves_count?: number | null
          shares_count?: number | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "post_metric_snapshots_profile_post_fkey"
            columns: ["monitored_profile_id", "post_id"]
            isOneToOne: false
            referencedRelation: "monitored_profile_posts"
            referencedColumns: ["monitored_profile_id", "instagram_post_id"]
          },
          {
            foreignKeyName: "post_metric_snapshots_run_profile_fkey"
            columns: ["collection_run_id", "monitored_profile_id"]
            isOneToOne: false
            referencedRelation: "collection_runs"
            referencedColumns: ["id", "monitored_profile_id"]
          },
        ]
      }
      profile_metric_snapshots: {
        Row: {
          captured_at: string
          collection_run_id: string
          created_at: string
          followers_count: number | null
          following_count: number | null
          id: string
          monitored_profile_id: string
          posts_count: number | null
        }
        Insert: {
          captured_at: string
          collection_run_id: string
          created_at?: string
          followers_count?: number | null
          following_count?: number | null
          id?: string
          monitored_profile_id: string
          posts_count?: number | null
        }
        Update: {
          captured_at?: string
          collection_run_id?: string
          created_at?: string
          followers_count?: number | null
          following_count?: number | null
          id?: string
          monitored_profile_id?: string
          posts_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_metric_snapshots_run_profile_fkey"
            columns: ["collection_run_id", "monitored_profile_id"]
            isOneToOne: false
            referencedRelation: "collection_runs"
            referencedColumns: ["id", "monitored_profile_id"]
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
