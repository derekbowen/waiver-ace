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
      api_keys: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          org_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          org_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_scans: {
        Row: {
          analysis_json: Json | null
          created_at: string
          credits_charged: number
          error_message: string | null
          filename: string
          id: string
          org_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_json?: Json | null
          created_at?: string
          credits_charged?: number
          error_message?: string | null
          filename?: string
          id?: string
          org_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_json?: Json | null
          created_at?: string
          credits_charged?: number
          error_message?: string | null
          filename?: string
          id?: string
          org_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_scans_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_disputes: {
        Row: {
          created_at: string
          credits_granted: number
          credits_requested: number
          details: string | null
          id: string
          org_id: string
          reason: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_granted?: number
          credits_requested: number
          details?: string | null
          id?: string
          org_id: string
          reason: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_granted?: number
          credits_requested?: number
          details?: string | null
          id?: string
          org_id?: string
          reason?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_disputes_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          balance_after: number
          created_at: string
          credits_delta: number
          id: string
          notes: string | null
          org_id: string
          reference_id: string | null
          type: string
        }
        Insert: {
          balance_after: number
          created_at?: string
          credits_delta: number
          id?: string
          notes?: string | null
          org_id: string
          reference_id?: string | null
          type: string
        }
        Update: {
          balance_after?: number
          created_at?: string
          credits_delta?: number
          id?: string
          notes?: string | null
          org_id?: string
          reference_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          content_type: string
          created_at: string
          envelope_id: string | null
          file_size: number
          filename: string
          id: string
          org_id: string
          source: string
          storage_key: string
          user_id: string
        }
        Insert: {
          content_type: string
          created_at?: string
          envelope_id?: string | null
          file_size?: number
          filename: string
          id?: string
          org_id: string
          source?: string
          storage_key: string
          user_id: string
        }
        Update: {
          content_type?: string
          created_at?: string
          envelope_id?: string | null
          file_size?: number
          filename?: string
          id?: string
          org_id?: string
          source?: string
          storage_key?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_envelope_id_fkey"
            columns: ["envelope_id"]
            isOneToOne: false
            referencedRelation: "envelopes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      envelope_events: {
        Row: {
          created_at: string
          envelope_id: string
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          envelope_id: string
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          envelope_id?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "envelope_events_envelope_id_fkey"
            columns: ["envelope_id"]
            isOneToOne: false
            referencedRelation: "envelopes"
            referencedColumns: ["id"]
          },
        ]
      }
      envelopes: {
        Row: {
          booking_id: string | null
          created_at: string
          credits_charged: number
          customer_id: string | null
          expires_at: string | null
          group_token: string | null
          host_id: string | null
          id: string
          ip_address: string | null
          is_group_waiver: boolean
          listing_id: string | null
          org_id: string
          payload: Json
          pdf_hash: string | null
          pdf_storage_key: string | null
          photo_storage_key: string | null
          reminder_count: number
          signature_data: Json | null
          signed_at: string | null
          signer_email: string
          signer_name: string | null
          signing_token: string
          status: Database["public"]["Enums"]["envelope_status"]
          template_version_id: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          credits_charged?: number
          customer_id?: string | null
          expires_at?: string | null
          group_token?: string | null
          host_id?: string | null
          id?: string
          ip_address?: string | null
          is_group_waiver?: boolean
          listing_id?: string | null
          org_id: string
          payload?: Json
          pdf_hash?: string | null
          pdf_storage_key?: string | null
          photo_storage_key?: string | null
          reminder_count?: number
          signature_data?: Json | null
          signed_at?: string | null
          signer_email: string
          signer_name?: string | null
          signing_token?: string
          status?: Database["public"]["Enums"]["envelope_status"]
          template_version_id: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          credits_charged?: number
          customer_id?: string | null
          expires_at?: string | null
          group_token?: string | null
          host_id?: string | null
          id?: string
          ip_address?: string | null
          is_group_waiver?: boolean
          listing_id?: string | null
          org_id?: string
          payload?: Json
          pdf_hash?: string | null
          pdf_storage_key?: string | null
          photo_storage_key?: string | null
          reminder_count?: number
          signature_data?: Json | null
          signed_at?: string | null
          signer_email?: string
          signer_name?: string | null
          signing_token?: string
          status?: Database["public"]["Enums"]["envelope_status"]
          template_version_id?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "envelopes_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "envelopes_template_version_id_fkey"
            columns: ["template_version_id"]
            isOneToOne: false
            referencedRelation: "template_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      group_signatures: {
        Row: {
          envelope_id: string
          id: string
          initials: string | null
          ip_address: string | null
          photo_storage_key: string | null
          signature_data: Json | null
          signed_at: string
          signer_email: string | null
          signer_name: string
          user_agent: string | null
        }
        Insert: {
          envelope_id: string
          id?: string
          initials?: string | null
          ip_address?: string | null
          photo_storage_key?: string | null
          signature_data?: Json | null
          signed_at?: string
          signer_email?: string | null
          signer_name: string
          user_agent?: string | null
        }
        Update: {
          envelope_id?: string
          id?: string
          initials?: string | null
          ip_address?: string | null
          photo_storage_key?: string | null
          signature_data?: Json | null
          signed_at?: string
          signer_email?: string | null
          signer_name?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_signatures_envelope_id_fkey"
            columns: ["envelope_id"]
            isOneToOne: false
            referencedRelation: "envelopes"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_analyses: {
        Row: {
          categories: Json | null
          created_at: string
          credits_charged: number
          estimated_revenue_increase: string | null
          id: string
          listing_url: string
          org_id: string
          overall_score: number | null
          platform: string
          potential_score: number | null
          status: string
          summary: string | null
          top_priorities: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          categories?: Json | null
          created_at?: string
          credits_charged?: number
          estimated_revenue_increase?: string | null
          id?: string
          listing_url: string
          org_id: string
          overall_score?: number | null
          platform: string
          potential_score?: number | null
          status?: string
          summary?: string | null
          top_priorities?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          categories?: Json | null
          created_at?: string
          credits_charged?: number
          estimated_revenue_increase?: string | null
          id?: string
          listing_url?: string
          org_id?: string
          overall_score?: number | null
          platform?: string
          potential_score?: number | null
          status?: string
          summary?: string | null
          top_priorities?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      marketplace_integrations: {
        Row: {
          api_base_url: string | null
          client_id: string | null
          client_secret: string | null
          created_at: string
          default_template_id: string | null
          id: string
          is_active: boolean
          org_id: string
          platform: string
          updated_at: string
          webhook_secret: string | null
        }
        Insert: {
          api_base_url?: string | null
          client_id?: string | null
          client_secret?: string | null
          created_at?: string
          default_template_id?: string | null
          id?: string
          is_active?: boolean
          org_id: string
          platform?: string
          updated_at?: string
          webhook_secret?: string | null
        }
        Update: {
          api_base_url?: string | null
          client_id?: string | null
          client_secret?: string | null
          created_at?: string
          default_template_id?: string | null
          id?: string
          is_active?: boolean
          org_id?: string
          platform?: string
          updated_at?: string
          webhook_secret?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_integrations_default_template_id_fkey"
            columns: ["default_template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_integrations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          brand_color: string | null
          brand_font: string | null
          created_at: string
          email_sender_domain: string | null
          id: string
          logo_url: string | null
          name: string
          retention_years: number
          tier_override: string | null
          updated_at: string
        }
        Insert: {
          brand_color?: string | null
          brand_font?: string | null
          created_at?: string
          email_sender_domain?: string | null
          id?: string
          logo_url?: string | null
          name: string
          retention_years?: number
          tier_override?: string | null
          updated_at?: string
        }
        Update: {
          brand_color?: string | null
          brand_font?: string | null
          created_at?: string
          email_sender_domain?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          retention_years?: number
          tier_override?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      photo_jobs: {
        Row: {
          analysis_json: Json | null
          completed_at: string | null
          created_at: string
          credits_used: number
          error_message: string | null
          id: string
          org_id: string
          original_content_type: string | null
          original_filename: string | null
          original_storage_key: string | null
          processed_keys: Json | null
          processing_time_ms: number | null
          settings: Json | null
          status: string
          user_id: string
        }
        Insert: {
          analysis_json?: Json | null
          completed_at?: string | null
          created_at?: string
          credits_used?: number
          error_message?: string | null
          id?: string
          org_id: string
          original_content_type?: string | null
          original_filename?: string | null
          original_storage_key?: string | null
          processed_keys?: Json | null
          processing_time_ms?: number | null
          settings?: Json | null
          status?: string
          user_id: string
        }
        Update: {
          analysis_json?: Json | null
          completed_at?: string | null
          created_at?: string
          credits_used?: number
          error_message?: string | null
          id?: string
          org_id?: string
          original_content_type?: string | null
          original_filename?: string | null
          original_storage_key?: string | null
          processed_keys?: Json | null
          processing_time_ms?: number | null
          settings?: Json | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "photo_jobs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          org_id: string | null
          referral_code: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          org_id?: string | null
          referral_code?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          org_id?: string | null
          referral_code?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          referral_code: string
          referred_email: string
          referred_org_id: string | null
          referrer_org_id: string
          reward_credited: boolean
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code: string
          referred_email: string
          referred_org_id?: string | null
          referrer_org_id: string
          reward_credited?: boolean
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code?: string
          referred_email?: string
          referred_org_id?: string | null
          referrer_org_id?: string
          reward_credited?: boolean
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_org_id_fkey"
            columns: ["referred_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_org_id_fkey"
            columns: ["referrer_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      team_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          id: string
          invited_by: string
          org_id: string
          role: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          id?: string
          invited_by: string
          org_id: string
          role?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          id?: string
          invited_by?: string
          org_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invites_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      template_versions: {
        Row: {
          content: Json
          created_at: string
          id: string
          is_current: boolean
          template_id: string
          variables: string[]
          version: number
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          is_current?: boolean
          template_id: string
          variables?: string[]
          version?: number
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          is_current?: boolean
          template_id?: string
          variables?: string[]
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "template_versions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          brand_color: string | null
          brand_font: string | null
          created_at: string
          created_by: string | null
          default_expiration_days: number | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          org_id: string
          require_photo: boolean
          require_video: boolean
          updated_at: string
          video_url: string | null
        }
        Insert: {
          brand_color?: string | null
          brand_font?: string | null
          created_at?: string
          created_by?: string | null
          default_expiration_days?: number | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          org_id: string
          require_photo?: boolean
          require_video?: boolean
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          brand_color?: string | null
          brand_font?: string | null
          created_at?: string
          created_by?: string | null
          default_expiration_days?: number | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
          require_photo?: boolean
          require_video?: boolean
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          org_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          org_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          org_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          auto_recharge_enabled: boolean
          auto_recharge_package: string
          auto_recharge_threshold: number
          created_at: string
          credits: number
          id: string
          org_id: string
          storage_used_bytes: number
          stripe_customer_id: string | null
          stripe_payment_method_id: string | null
          updated_at: string
        }
        Insert: {
          auto_recharge_enabled?: boolean
          auto_recharge_package?: string
          auto_recharge_threshold?: number
          created_at?: string
          credits?: number
          id?: string
          org_id: string
          storage_used_bytes?: number
          stripe_customer_id?: string | null
          stripe_payment_method_id?: string | null
          updated_at?: string
        }
        Update: {
          auto_recharge_enabled?: boolean
          auto_recharge_package?: string
          auto_recharge_threshold?: number
          created_at?: string
          credits?: number
          id?: string
          org_id?: string
          storage_used_bytes?: number
          stripe_customer_id?: string | null
          stripe_payment_method_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_deliveries: {
        Row: {
          attempt: number
          created_at: string
          delivered_at: string | null
          envelope_id: string | null
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          response_status: number | null
          webhook_endpoint_id: string
        }
        Insert: {
          attempt?: number
          created_at?: string
          delivered_at?: string | null
          envelope_id?: string | null
          event_type: string
          id?: string
          payload: Json
          response_body?: string | null
          response_status?: number | null
          webhook_endpoint_id: string
        }
        Update: {
          attempt?: number
          created_at?: string
          delivered_at?: string | null
          envelope_id?: string | null
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          webhook_endpoint_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_envelope_id_fkey"
            columns: ["envelope_id"]
            isOneToOne: false
            referencedRelation: "envelopes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_deliveries_webhook_endpoint_id_fkey"
            columns: ["webhook_endpoint_id"]
            isOneToOne: false
            referencedRelation: "webhook_endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_endpoints: {
        Row: {
          created_at: string
          events: string[]
          id: string
          is_active: boolean
          org_id: string
          secret: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          events?: string[]
          id?: string
          is_active?: boolean
          org_id: string
          secret: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          events?: string[]
          id?: string
          is_active?: boolean
          org_id?: string
          secret?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_endpoints_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_credits:
        | {
            Args: {
              p_amount: number
              p_notes?: string
              p_org_id: string
              p_reference_id?: string
              p_type?: Database["public"]["Enums"]["credit_transaction_type"]
            }
            Returns: {
              new_balance: number
              success: boolean
            }[]
          }
        | {
            Args: {
              p_amount: number
              p_notes?: string
              p_org_id: string
              p_reference_id: string
              p_type: string
            }
            Returns: number
          }
      add_credits_internal: {
        Args: {
          p_amount: number
          p_notes?: string
          p_org_id: string
          p_reference_id: string
          p_type: string
        }
        Returns: number
      }
      deduct_credit:
        | {
            Args: {
              p_amount?: number
              p_notes?: string
              p_org_id: string
              p_reference_id?: string
              p_type?: Database["public"]["Enums"]["credit_transaction_type"]
            }
            Returns: {
              error_message: string
              needs_recharge: boolean
              new_balance: number
              success: boolean
            }[]
          }
        | {
            Args: { p_org_id: string; p_reference_id: string; p_type?: string }
            Returns: {
              error_message: string
              success: boolean
            }[]
          }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      find_waivers_by_email: {
        Args: { p_email: string }
        Returns: {
          created_at: string
          envelope_id: string
          org_name: string
          signed_at: string
          signer_name: string
          status: string
          template_name: string
        }[]
      }
      get_envelope_by_token: { Args: { p_token: string }; Returns: Json }
      get_user_org_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      sign_envelope:
        | {
            Args: {
              p_signature_data: Json
              p_signer_name: string
              p_token: string
              p_user_agent?: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_photo_storage_key?: string
              p_signature_data: Json
              p_signer_name: string
              p_token: string
              p_user_agent?: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_ip_address?: string
              p_photo_storage_key?: string
              p_signature_data: Json
              p_signer_name: string
              p_token: string
              p_user_agent?: string
            }
            Returns: Json
          }
      view_envelope: {
        Args: { p_token: string; p_user_agent?: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "host" | "customer"
      credit_transaction_type:
        | "purchase"
        | "waiver_deduction"
        | "group_deduction"
        | "admin_adjustment"
        | "refund"
        | "starter_bonus"
      envelope_status:
        | "draft"
        | "sent"
        | "viewed"
        | "signed"
        | "completed"
        | "expired"
        | "canceled"
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
      app_role: ["admin", "host", "customer"],
      credit_transaction_type: [
        "purchase",
        "waiver_deduction",
        "group_deduction",
        "admin_adjustment",
        "refund",
        "starter_bonus",
      ],
      envelope_status: [
        "draft",
        "sent",
        "viewed",
        "signed",
        "completed",
        "expired",
        "canceled",
      ],
    },
  },
} as const
