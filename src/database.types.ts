// src/database.types.ts
// This is a simplified version of what would be generated with the Supabase CLI
// You would typically generate more complete types with `supabase gen types typescript`

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
      games: {
        Row: {
          id: number
          created_at: string
          meta_game_on: boolean
          status: string
        }
        Insert: {
          id?: number
          created_at?: string
          meta_game_on?: boolean
          status?: string
        }
        Update: {
          id?: number
          created_at?: string
          meta_game_on?: boolean
          status?: string
        }
      }
      game_questions: {
        Row: {
          id: number
          game_id: number
          question_text: string
          correct_answer: number
          ante: number
          status: string
          order_num: number
          created_at: string
        }
        Insert: {
          id?: number
          game_id: number
          question_text: string
          correct_answer: number
          ante?: number
          status?: string
          order_num: number
          created_at?: string
        }
        Update: {
          id?: number
          game_id?: number
          question_text?: string
          correct_answer?: number
          ante?: number
          status?: string
          order_num?: number
          created_at?: string
        }
      }
      hints: {
        Row: {
          id: number
          question_id: number
          hint_order: number
          hint_text: string
          revealed_at: string | null
        }
        Insert: {
          id?: number
          question_id: number
          hint_order: number
          hint_text: string
          revealed_at?: string | null
        }
        Update: {
          id?: number
          question_id?: number
          hint_order?: number
          hint_text?: string
          revealed_at?: string | null
        }
      }
      players: {
        Row: {
          id: number
          game_id: number
          session_id: string
          display_name: string
          chips: number
          status: string
          correct_preds: number
          created_at: string
        }
        Insert: {
          id?: number
          game_id: number
          session_id: string
          display_name: string
          chips?: number
          status?: string
          correct_preds?: number
          created_at?: string
        }
        Update: {
          id?: number
          game_id?: number
          session_id?: string
          display_name?: string
          chips?: number
          status?: string
          correct_preds?: number
          created_at?: string
        }
      }
      player_question_status: {
        Row: {
          id: number
          player_id: number
          question_id: number
          status: string
        }
        Insert: {
          id?: number
          player_id: number
          question_id: number
          status?: string
        }
        Update: {
          id?: number
          player_id?: number
          question_id?: number
          status?: string
        }
      }
      player_guesses: {
        Row: {
          id: number
          player_id: number
          question_id: number
          lower_bound: number
          upper_bound: number
          final: boolean
          created_at: string
        }
        Insert: {
          id?: number
          player_id: number
          question_id: number
          lower_bound: number
          upper_bound: number
          final?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          player_id?: number
          question_id?: number
          lower_bound?: number
          upper_bound?: number
          final?: boolean
          created_at?: string
        }
      }
      bets: {
        Row: {
          id: number
          player_id: number
          question_id: number
          round_number: number
          action: string
          amount: number
          timestamp: string
        }
        Insert: {
          id?: number
          player_id: number
          question_id: number
          round_number: number
          action: string
          amount?: number
          timestamp?: string
        }
        Update: {
          id?: number
          player_id?: number
          question_id?: number
          round_number?: number
          action?: string
          amount?: number
          timestamp?: string
        }
      }
      predictions: {
        Row: {
          id: number
          player_id: number
          question_id: number
          predicted_winner_player_id: number
          is_correct: boolean | null
          created_at: string
        }
        Insert: {
          id?: number
          player_id: number
          question_id: number
          predicted_winner_player_id: number
          is_correct?: boolean | null
          created_at?: string
        }
        Update: {
          id?: number
          player_id?: number
          question_id?: number
          predicted_winner_player_id?: number
          is_correct?: boolean | null
          created_at?: string
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
