/**
 * TypeScript Types for Dark Side Game Database
 * Auto-generated from Supabase schema
 */

export interface Database {
  public: {
    Tables: {
      game_players: {
        Row: {
          id: string
          email: string
          username: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      game_entries: {
        Row: {
          id: string
          player_id: string | null
          email: string
          entry_type: 'email' | 'play' | 'share'
          game_week: number | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          player_id?: string | null
          email: string
          entry_type: 'email' | 'play' | 'share'
          game_week?: number | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          player_id?: string | null
          email?: string
          entry_type?: 'email' | 'play' | 'share'
          game_week?: number | null
        }
      }
      game_sessions: {
        Row: {
          id: string
          player_id: string | null
          email: string | null
          week: number
          score: number
          completed: boolean
          won: boolean
          offense_stats: OffenseStats
          defense_stats: DefenseStats
          duration_ms: number | null
          created_at: string
        }
        Insert: {
          id?: string
          player_id?: string | null
          email?: string | null
          week: number
          score?: number
          completed?: boolean
          won?: boolean
          offense_stats?: OffenseStats
          defense_stats?: DefenseStats
          duration_ms?: number | null
          created_at?: string
        }
        Update: {
          score?: number
          completed?: boolean
          won?: boolean
          offense_stats?: OffenseStats
          defense_stats?: DefenseStats
          duration_ms?: number | null
        }
      }
      game_scores: {
        Row: {
          id: string
          player_id: string | null
          email: string | null
          username: string | null
          week: number
          score: number
          total_score: number
          games_won: number
          created_at: string
        }
        Insert: {
          id?: string
          player_id?: string | null
          email?: string | null
          username?: string | null
          week: number
          score: number
          total_score?: number
          games_won?: number
          created_at?: string
        }
        Update: {
          username?: string | null
          score?: number
          total_score?: number
          games_won?: number
        }
      }
      game_reactions: {
        Row: {
          id: string
          score_id: string
          player_id: string | null
          reaction_type: ReactionType
          created_at: string
        }
        Insert: {
          id?: string
          score_id: string
          player_id?: string | null
          reaction_type: ReactionType
          created_at?: string
        }
        Update: {
          reaction_type?: ReactionType
        }
      }
      game_comments: {
        Row: {
          id: string
          score_id: string
          player_id: string | null
          text: string
          created_at: string
        }
        Insert: {
          id?: string
          score_id: string
          player_id?: string | null
          text: string
          created_at?: string
        }
        Update: {
          text?: string
        }
      }
      game_progress: {
        Row: {
          id: string
          player_id: string | null
          email: string
          current_week: number
          total_score: number
          games_won: number
          games_played: number
          unlocked_weeks: number[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          player_id?: string | null
          email: string
          current_week?: number
          total_score?: number
          games_won?: number
          games_played?: number
          unlocked_weeks?: number[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          player_id?: string | null
          current_week?: number
          total_score?: number
          games_won?: number
          games_played?: number
          unlocked_weeks?: number[]
          updated_at?: string
        }
      }
    }
  }
}

// Enum types
export type ReactionType = 'fire' | 'skull' | 'football' | 'trophy' | 'goat'

// JSON types for game stats
export interface OffenseStats {
  touchdowns?: number
  completions?: number
  attempts?: number
  yards?: number
  interceptions?: number
  sacks_taken?: number
}

export interface DefenseStats {
  sacks?: number
  tackles?: number
  interceptions?: number
  forced_fumbles?: number
  touchdowns_allowed?: number
}

// Convenience type aliases
export type Player = Database['public']['Tables']['game_players']['Row']
export type Entry = Database['public']['Tables']['game_entries']['Row']
export type GameSession = Database['public']['Tables']['game_sessions']['Row']
export type Score = Database['public']['Tables']['game_scores']['Row']
export type Reaction = Database['public']['Tables']['game_reactions']['Row']
export type Comment = Database['public']['Tables']['game_comments']['Row']
export type Progress = Database['public']['Tables']['game_progress']['Row']

// Insert types
export type NewPlayer = Database['public']['Tables']['game_players']['Insert']
export type NewEntry = Database['public']['Tables']['game_entries']['Insert']
export type NewGameSession = Database['public']['Tables']['game_sessions']['Insert']
export type NewScore = Database['public']['Tables']['game_scores']['Insert']
export type NewReaction = Database['public']['Tables']['game_reactions']['Insert']
export type NewComment = Database['public']['Tables']['game_comments']['Insert']
export type NewProgress = Database['public']['Tables']['game_progress']['Insert']
