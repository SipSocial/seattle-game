/**
 * Referral Store - Zustand store for referral system
 * 
 * Manages:
 * - Referral code generation and storage
 * - Referral tracking
 * - Bonus entries calculation
 * 
 * Uses localStorage persistence with SSR safety.
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ============================================================================
// Constants
// ============================================================================

const REFERRAL_PREFIX = 'DARKSIDE-'
const CODE_LENGTH = 6
const ENTRIES_PER_REFERRAL = 5
const MAX_BONUS_ENTRIES = 50 // 10 referrals max

// ============================================================================
// Types
// ============================================================================

export interface ReferralRecord {
  code: string // The referrer's code
  referredUserId: string
  timestamp: number
}

interface ReferralState {
  referralCode: string // Unique per user, e.g., "DARKSIDE-ABC123"
  referralLink: string // Full URL with code
  referralCount: number // How many people signed up with this code
  bonusEntries: number // Entries earned from referrals
  referredBy?: string // Code that referred this user
  referrals: ReferralRecord[] // List of people who used this user's code
  isInitialized: boolean
}

interface ReferralActions {
  // Core actions
  generateReferralCode: (userId?: string) => string
  trackReferral: (referrerCode: string) => void
  getReferralStats: () => { count: number; entries: number }
  
  // Helpers
  initialize: () => void
  getShareableLink: () => string
  canEarnMoreEntries: () => boolean
}

type ReferralStore = ReferralState & ReferralActions

// ============================================================================
// Helpers
// ============================================================================

/**
 * Generate a random alphanumeric string
 */
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Excluded I, O, 0, 1 for clarity
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Generate a referral code
 */
function createReferralCode(userId?: string): string {
  // Use userId hash if provided, otherwise random
  if (userId) {
    // Create a simple hash from userId
    const hash = userId
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0)
      .toString(36)
      .toUpperCase()
      .substring(0, CODE_LENGTH)
      .padEnd(CODE_LENGTH, 'X')
    return `${REFERRAL_PREFIX}${hash}`
  }
  return `${REFERRAL_PREFIX}${generateRandomString(CODE_LENGTH)}`
}

/**
 * Build the full referral link
 */
function buildReferralLink(code: string): string {
  // Use window.location.origin if available, otherwise use a placeholder
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://darksidefootball.com'
  return `${baseUrl}?ref=${code}`
}

/**
 * Calculate bonus entries from referral count
 */
function calculateBonusEntries(referralCount: number): number {
  return Math.min(referralCount * ENTRIES_PER_REFERRAL, MAX_BONUS_ENTRIES)
}

/**
 * SSR-safe storage
 */
const safeStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(name)
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(name, value)
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(name)
  },
}

// ============================================================================
// Store
// ============================================================================

const initialState: ReferralState = {
  referralCode: '',
  referralLink: '',
  referralCount: 0,
  bonusEntries: 0,
  referredBy: undefined,
  referrals: [],
  isInitialized: false,
}

export const useReferralStore = create<ReferralStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ========================================
      // Initialization
      // ========================================

      initialize: () => {
        const { isInitialized, referralCode } = get()
        
        if (isInitialized && referralCode) return
        
        // Generate code on first access
        const code = createReferralCode()
        const link = buildReferralLink(code)
        
        set({
          referralCode: code,
          referralLink: link,
          isInitialized: true,
        })
      },

      // ========================================
      // Core Actions
      // ========================================

      generateReferralCode: (userId?: string) => {
        const { referralCode, isInitialized } = get()
        
        // If already initialized and has a code, return existing
        if (isInitialized && referralCode) {
          return referralCode
        }
        
        // Generate new code
        const code = createReferralCode(userId)
        const link = buildReferralLink(code)
        
        set({
          referralCode: code,
          referralLink: link,
          isInitialized: true,
        })
        
        return code
      },

      trackReferral: (referrerCode: string) => {
        const { referredBy, referralCode } = get()
        
        // Don't allow self-referral
        if (referrerCode === referralCode) return
        
        // Don't allow re-setting referrer
        if (referredBy) return
        
        // Validate code format
        if (!referrerCode.startsWith(REFERRAL_PREFIX)) return
        
        set({ referredBy: referrerCode })
        
        // In a real app, this would also notify the referrer's account
        // For now, we just store locally
      },

      getReferralStats: () => {
        const { referralCount, bonusEntries } = get()
        return {
          count: referralCount,
          entries: bonusEntries,
        }
      },

      // ========================================
      // Helpers
      // ========================================

      getShareableLink: () => {
        const { referralLink, referralCode } = get()
        
        // Regenerate link if code exists but link doesn't
        if (referralCode && !referralLink) {
          const link = buildReferralLink(referralCode)
          set({ referralLink: link })
          return link
        }
        
        return referralLink
      },

      canEarnMoreEntries: () => {
        const { bonusEntries } = get()
        return bonusEntries < MAX_BONUS_ENTRIES
      },
    }),
    {
      name: 'v5-referral-store',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        referralCode: state.referralCode,
        referralLink: state.referralLink,
        referralCount: state.referralCount,
        bonusEntries: state.bonusEntries,
        referredBy: state.referredBy,
        referrals: state.referrals,
        isInitialized: state.isInitialized,
      }),
      onRehydrateStorage: () => (state) => {
        // Initialize if no code exists after rehydration
        if (state && !state.referralCode) {
          state.initialize()
        }
        // Update link with current origin after rehydration
        if (state && state.referralCode) {
          state.referralLink = buildReferralLink(state.referralCode)
        }
      },
    }
  )
)

// ============================================================================
// Selector Hooks
// ============================================================================

export const useReferralCode = () => useReferralStore(state => state.referralCode)
export const useReferralLink = () => useReferralStore(state => state.referralLink)
export const useReferralCount = () => useReferralStore(state => state.referralCount)
export const useBonusEntries = () => useReferralStore(state => state.bonusEntries)
export const useReferredBy = () => useReferralStore(state => state.referredBy)

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a referral code is valid format
 */
export function isValidReferralCode(code: string): boolean {
  if (!code.startsWith(REFERRAL_PREFIX)) return false
  const suffix = code.substring(REFERRAL_PREFIX.length)
  return suffix.length === CODE_LENGTH && /^[A-Z0-9]+$/.test(suffix)
}

/**
 * Get the maximum referrals before cap
 */
export function getMaxReferrals(): number {
  return MAX_BONUS_ENTRIES / ENTRIES_PER_REFERRAL
}

/**
 * Get entries per referral
 */
export function getEntriesPerReferral(): number {
  return ENTRIES_PER_REFERRAL
}

/**
 * Format referral code for display (add spaces for readability)
 */
export function formatReferralCode(code: string): string {
  // DARKSIDE-ABC123 -> DARKSIDE-ABC 123
  const parts = code.split('-')
  if (parts.length !== 2) return code
  const suffix = parts[1]
  if (suffix.length <= 3) return code
  return `${parts[0]}-${suffix.slice(0, 3)} ${suffix.slice(3)}`
}
