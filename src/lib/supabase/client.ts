/**
 * Supabase Client for Dark Side Game
 * Super Bowl 2026 Campaign
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eucqorvufliiuwmmbgjf.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseAnonKey && typeof window !== 'undefined') {
  console.warn('Supabase anon key not found. Set NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Helper to check if we have a valid connection
export async function isSupabaseConnected(): Promise<boolean> {
  try {
    const { error } = await supabase.from('game_players').select('id').limit(1)
    return !error
  } catch {
    return false
  }
}
