/**
 * Supabase Database 型別定義
 * 這個檔案會根據 user_log 表的結構定義型別
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_log: {
        Row: {
          id: string
          session_id: string
          form_type: string
          event_type: string
          event_data: Json | null
          timestamp: string
        }
        Insert: {
          id?: string
          session_id: string
          form_type: string
          event_type: string
          event_data?: Json | null
          timestamp?: string
        }
        Update: {
          id?: string
          session_id?: string
          form_type?: string
          event_type?: string
          event_data?: Json | null
          timestamp?: string
        }
      }
      user_sessions: {
        Row: {
          id: string
          session_id: string
          github_username: string
          discord_id: string
          discord_name: string | null
          email: string | null
          form_type: string
          status: string
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          session_id: string
          github_username: string
          discord_id: string
          discord_name?: string | null
          email?: string | null
          form_type?: string
          status?: string
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          session_id?: string
          github_username?: string
          discord_id?: string
          discord_name?: string | null
          email?: string | null
          form_type?: string
          status?: string
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
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

