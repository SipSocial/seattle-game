/**
 * TypeScript Types for Dark Side Game Database
 * Auto-generated from Supabase schema
 */

export interface Database {
  public: {
    Tables: {
      // ==============================================
      // NEW V5 HUB TABLES
      // ==============================================
      
      users: {
        Row: {
          id: string
          email: string
          username: string | null
          avatar_url: string | null
          first_name: string | null
          last_name: string | null
          street_address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          terms_accepted_at: string | null
          terms_ip: string | null
          terms_user_agent: string | null
          privacy_accepted_at: string | null
          pwa_installed: boolean
          pwa_installed_at: string | null
          push_enabled: boolean
          push_subscription: PushSubscription | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username?: string | null
          avatar_url?: string | null
          first_name?: string | null
          last_name?: string | null
          street_address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          terms_accepted_at?: string | null
          terms_ip?: string | null
          terms_user_agent?: string | null
          privacy_accepted_at?: string | null
          pwa_installed?: boolean
          pwa_installed_at?: string | null
          push_enabled?: boolean
          push_subscription?: PushSubscription | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          username?: string | null
          avatar_url?: string | null
          first_name?: string | null
          last_name?: string | null
          street_address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          terms_accepted_at?: string | null
          terms_ip?: string | null
          terms_user_agent?: string | null
          privacy_accepted_at?: string | null
          pwa_installed?: boolean
          pwa_installed_at?: string | null
          push_enabled?: boolean
          push_subscription?: PushSubscription | null
          updated_at?: string
        }
      }

      campaigns: {
        Row: {
          id: string
          slug: string
          name: string
          description: string | null
          starts_at: string | null
          ends_at: string | null
          config: CampaignConfig | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description?: string | null
          starts_at?: string | null
          ends_at?: string | null
          config?: CampaignConfig | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          slug?: string
          name?: string
          description?: string | null
          starts_at?: string | null
          ends_at?: string | null
          config?: CampaignConfig | null
          active?: boolean
          updated_at?: string
        }
      }

      sponsors: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          website_url: string | null
          description: string | null
          tier: 'presenting' | 'major' | 'supporting' | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          website_url?: string | null
          description?: string | null
          tier?: 'presenting' | 'major' | 'supporting' | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          logo_url?: string | null
          website_url?: string | null
          description?: string | null
          tier?: 'presenting' | 'major' | 'supporting' | null
          active?: boolean
          updated_at?: string
        }
      }

      prizes: {
        Row: {
          id: string
          name: string
          description: string | null
          image_url: string | null
          quantity: number
          claimed_count: number
          tier: 'grand' | 'major' | 'minor' | 'instant' | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          image_url?: string | null
          quantity?: number
          claimed_count?: number
          tier?: 'grand' | 'major' | 'minor' | 'instant' | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          image_url?: string | null
          quantity?: number
          claimed_count?: number
          tier?: 'grand' | 'major' | 'minor' | 'instant' | null
          active?: boolean
          updated_at?: string
        }
      }

      retail_partners: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          website_url: string | null
          description: string | null
          address: string | null
          city: string | null
          state: string | null
          featured: boolean
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          website_url?: string | null
          description?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          featured?: boolean
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          logo_url?: string | null
          website_url?: string | null
          description?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          featured?: boolean
          active?: boolean
          updated_at?: string
        }
      }

      live_questions: {
        Row: {
          id: string
          campaign_id: string | null
          quarter: number
          question_text: string
          question_type: 'boolean' | 'multiple_choice' | 'numeric'
          options: string[] | null
          correct_answer: AnswerValue | null
          points_value: number
          pushed_at: string | null
          closes_at: string | null
          resolved_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id?: string | null
          quarter: number
          question_text: string
          question_type: 'boolean' | 'multiple_choice' | 'numeric'
          options?: string[] | null
          correct_answer?: AnswerValue | null
          points_value?: number
          pushed_at?: string | null
          closes_at?: string | null
          resolved_at?: string | null
          created_at?: string
        }
        Update: {
          campaign_id?: string | null
          quarter?: number
          question_text?: string
          question_type?: 'boolean' | 'multiple_choice' | 'numeric'
          options?: string[] | null
          correct_answer?: AnswerValue | null
          points_value?: number
          pushed_at?: string | null
          closes_at?: string | null
          resolved_at?: string | null
        }
      }

      picks: {
        Row: {
          id: string
          user_id: string
          campaign_id: string
          question_id: string
          answer: PickAnswer
          locked_at: string | null
          correct: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          campaign_id: string
          question_id: string
          answer: PickAnswer
          locked_at?: string | null
          correct?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          question_id?: string
          answer?: PickAnswer
          locked_at?: string | null
          correct?: boolean | null
          updated_at?: string
        }
      }

      live_answers: {
        Row: {
          id: string
          user_id: string
          question_id: string
          answer: AnswerValue
          answered_at: string
          correct: boolean | null
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          answer: AnswerValue
          answered_at?: string
          correct?: boolean | null
        }
        Update: {
          answer?: AnswerValue
          correct?: boolean | null
        }
      }

      claims: {
        Row: {
          id: string
          user_id: string
          prize_id: string
          campaign_id: string | null
          status: 'pending' | 'claimed' | 'declined' | 'expired' | 'shipped'
          fulfillment_code: string | null
          shipping_address: ShippingAddress | null
          claimed_at: string | null
          declined_at: string | null
          shipped_at: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prize_id: string
          campaign_id?: string | null
          status?: 'pending' | 'claimed' | 'declined' | 'expired' | 'shipped'
          fulfillment_code?: string | null
          shipping_address?: ShippingAddress | null
          claimed_at?: string | null
          declined_at?: string | null
          shipped_at?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: 'pending' | 'claimed' | 'declined' | 'expired' | 'shipped'
          fulfillment_code?: string | null
          shipping_address?: ShippingAddress | null
          claimed_at?: string | null
          declined_at?: string | null
          shipped_at?: string | null
          expires_at?: string | null
          updated_at?: string
        }
      }

      sponsor_clicks: {
        Row: {
          id: string
          user_id: string | null
          sponsor_id: string
          page: string | null
          clicked_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          sponsor_id: string
          page?: string | null
          clicked_at?: string
        }
        Update: {
          page?: string | null
        }
      }

      sponsor_impressions: {
        Row: {
          id: string
          user_id: string | null
          sponsor_id: string
          page: string
          viewed_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          sponsor_id: string
          page: string
          viewed_at?: string
        }
        Update: {
          page?: string
        }
      }

      product_scans: {
        Row: {
          id: string
          user_id: string
          campaign_id: string | null
          photo_url: string | null
          verified: boolean
          verified_at: string | null
          rejected_at: string | null
          rejection_reason: string | null
          instant_win_result: InstantWinResult | null
          scanned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          campaign_id?: string | null
          photo_url?: string | null
          verified?: boolean
          verified_at?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          instant_win_result?: InstantWinResult | null
          scanned_at?: string
        }
        Update: {
          photo_url?: string | null
          verified?: boolean
          verified_at?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          instant_win_result?: InstantWinResult | null
        }
      }

      deep_link_events: {
        Row: {
          id: string
          user_id: string | null
          campaign_id: string | null
          source: string | null
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_term: string | null
          retailer: string | null
          referrer_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          campaign_id?: string | null
          source?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_term?: string | null
          retailer?: string | null
          referrer_url?: string | null
          created_at?: string
        }
        Update: {
          source?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_term?: string | null
          retailer?: string | null
          referrer_url?: string | null
        }
      }

      hub_game_entries: {
        Row: {
          id: string
          user_id: string
          campaign_id: string | null
          source: 'game' | 'picks' | 'live' | 'share' | 'scan' | 'bonus'
          entries_earned: number
          metadata: GameEntryMetadata | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          campaign_id?: string | null
          source: 'game' | 'picks' | 'live' | 'share' | 'scan' | 'bonus'
          entries_earned?: number
          metadata?: GameEntryMetadata | null
          created_at?: string
        }
        Update: {
          source?: 'game' | 'picks' | 'live' | 'share' | 'scan' | 'bonus'
          entries_earned?: number
          metadata?: GameEntryMetadata | null
        }
      }

      // ==============================================
      // LEGACY GAME TABLES
      // ==============================================

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

// ==============================================
// ENUM TYPES
// ==============================================

export type ReactionType = 'fire' | 'skull' | 'football' | 'trophy' | 'goat'
export type SponsorTier = 'presenting' | 'major' | 'supporting'
export type PrizeTier = 'grand' | 'major' | 'minor' | 'instant'
export type ClaimStatus = 'pending' | 'claimed' | 'declined' | 'expired' | 'shipped'
export type QuestionType = 'boolean' | 'multiple_choice' | 'numeric'
export type EntrySource = 'game' | 'picks' | 'live' | 'share' | 'scan' | 'bonus'

// ==============================================
// JSON TYPES FOR V5 HUB TABLES
// ==============================================

// Push subscription data (Web Push API format)
export interface PushSubscription {
  endpoint: string
  expirationTime?: number | null
  keys: {
    p256dh: string
    auth: string
  }
}

// Campaign configuration
export interface CampaignConfig {
  prizes?: string[]
  rules?: string[]
  entryMethods?: EntrySource[]
  maxEntriesPerDay?: number
  instantWinOdds?: number
  [key: string]: unknown
}

// Answer value for picks and live questions
export interface AnswerValue {
  value: boolean | string | number
}

// Pick answer with type information
export interface PickAnswer {
  type: 'boolean' | 'numeric' | 'multiple_choice'
  value: boolean | string | number
}

// Shipping address snapshot
export interface ShippingAddress {
  first_name: string
  last_name: string
  street_address: string
  city: string
  state: string
  zip_code: string
}

// Instant win result
export interface InstantWinResult {
  won: boolean
  prize_id?: string
  prize_name?: string
}

// Game entry metadata
export interface GameEntryMetadata {
  score?: number
  week?: number
  pick_results?: {
    correct: number
    total: number
  }
  [key: string]: unknown
}

// ==============================================
// JSON TYPES FOR LEGACY GAME TABLES
// ==============================================

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

// ==============================================
// V5 HUB TYPE ALIASES
// ==============================================

// Row types (read from database)
export type User = Database['public']['Tables']['users']['Row']
export type Campaign = Database['public']['Tables']['campaigns']['Row']
export type Sponsor = Database['public']['Tables']['sponsors']['Row']
export type Prize = Database['public']['Tables']['prizes']['Row']
export type RetailPartner = Database['public']['Tables']['retail_partners']['Row']
export type LiveQuestion = Database['public']['Tables']['live_questions']['Row']
export type Pick = Database['public']['Tables']['picks']['Row']
export type LiveAnswer = Database['public']['Tables']['live_answers']['Row']
export type Claim = Database['public']['Tables']['claims']['Row']
export type SponsorClick = Database['public']['Tables']['sponsor_clicks']['Row']
export type SponsorImpression = Database['public']['Tables']['sponsor_impressions']['Row']
export type ProductScan = Database['public']['Tables']['product_scans']['Row']
export type DeepLinkEvent = Database['public']['Tables']['deep_link_events']['Row']
export type HubGameEntry = Database['public']['Tables']['hub_game_entries']['Row']

// Insert types (write to database)
export type NewUser = Database['public']['Tables']['users']['Insert']
export type NewCampaign = Database['public']['Tables']['campaigns']['Insert']
export type NewSponsor = Database['public']['Tables']['sponsors']['Insert']
export type NewPrize = Database['public']['Tables']['prizes']['Insert']
export type NewRetailPartner = Database['public']['Tables']['retail_partners']['Insert']
export type NewLiveQuestion = Database['public']['Tables']['live_questions']['Insert']
export type NewPick = Database['public']['Tables']['picks']['Insert']
export type NewLiveAnswer = Database['public']['Tables']['live_answers']['Insert']
export type NewClaim = Database['public']['Tables']['claims']['Insert']
export type NewSponsorClick = Database['public']['Tables']['sponsor_clicks']['Insert']
export type NewSponsorImpression = Database['public']['Tables']['sponsor_impressions']['Insert']
export type NewProductScan = Database['public']['Tables']['product_scans']['Insert']
export type NewDeepLinkEvent = Database['public']['Tables']['deep_link_events']['Insert']
export type NewHubGameEntry = Database['public']['Tables']['hub_game_entries']['Insert']

// ==============================================
// LEGACY GAME TYPE ALIASES
// ==============================================

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
