/**
 * Prize Store - Zustand store for scratch card prize management
 * 
 * Manages:
 * - Prize inventory and configuration
 * - Win history tracking
 * - Roll logic with odds calculation
 * - Admin CRUD operations
 * 
 * Uses localStorage persistence with SSR safety.
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { DEFAULT_PRIZES, getTierPriority } from '../data/defaultPrizes'

// ============================================================================
// Types
// ============================================================================

export type PrizeTier = 'gold' | 'silver' | 'bronze'

export interface Prize {
  id: string
  name: string
  description: string
  tier: PrizeTier
  odds: number // 0-100 percentage
  totalInventory: number
  remainingInventory: number
  isActive: boolean
  imageUrl?: string
  value?: number // Dollar value for display
}

export interface PrizeWin {
  id: string
  prizeId: string
  prizeName: string
  tier: PrizeTier
  wonAt: number // Timestamp
  userId?: string
  claimed: boolean
}

interface PrizeState {
  prizes: Prize[]
  wins: PrizeWin[]
  isInitialized: boolean
}

interface PrizeActions {
  // Initialization
  initializePrizes: () => void
  resetToDefaults: () => void
  
  // Prize management (CRUD)
  addPrize: (prize: Omit<Prize, 'id'>) => string
  updatePrize: (id: string, updates: Partial<Prize>) => boolean
  deletePrize: (id: string) => boolean
  togglePrize: (id: string) => boolean
  
  // Gameplay
  rollForPrize: () => { won: boolean; prize?: Prize }
  recordWin: (prizeId: string, userId?: string) => PrizeWin | null
  markWinClaimed: (winId: string) => boolean
  
  // Stats
  getTotalWins: () => number
  getWinRate: () => number
  getPrizeInventory: () => { total: number; remaining: number }
  getActivePrizes: () => Prize[]
  getAvailablePrizes: () => Prize[]
  getPrizeById: (id: string) => Prize | undefined
  getWinsByPrize: (prizeId: string) => PrizeWin[]
  getUnclaimedWins: () => PrizeWin[]
}

type PrizeStore = PrizeState & PrizeActions

// ============================================================================
// Helpers
// ============================================================================

/**
 * Generate a unique ID for prizes and wins
 */
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Sort prizes by tier priority (gold first) then by odds
 */
function sortPrizesByTier(prizes: Prize[]): Prize[] {
  return [...prizes].sort((a, b) => {
    const tierDiff = getTierPriority(a.tier) - getTierPriority(b.tier)
    if (tierDiff !== 0) return tierDiff
    return b.odds - a.odds // Higher odds first within tier
  })
}

/**
 * Create initial prizes from defaults
 */
function createInitialPrizes(): Prize[] {
  return DEFAULT_PRIZES.map((prize, index) => ({
    ...prize,
    id: `prize_default_${index}`,
  }))
}

/**
 * SSR-safe storage that returns a no-op storage on server
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

const initialState: PrizeState = {
  prizes: [],
  wins: [],
  isInitialized: false,
}

export const usePrizeStore = create<PrizeStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ========================================
      // Initialization
      // ========================================

      initializePrizes: () => {
        const { isInitialized, prizes } = get()
        
        // Only initialize if not already done or no prizes exist
        if (isInitialized && prizes.length > 0) return
        
        set({
          prizes: createInitialPrizes(),
          isInitialized: true,
        })
      },

      resetToDefaults: () => {
        set({
          prizes: createInitialPrizes(),
          wins: [],
          isInitialized: true,
        })
      },

      // ========================================
      // Prize Management (CRUD)
      // ========================================

      addPrize: (prizeData) => {
        const id = generateId('prize')
        const newPrize: Prize = {
          ...prizeData,
          id,
        }
        
        set((state) => ({
          prizes: sortPrizesByTier([...state.prizes, newPrize]),
        }))
        
        return id
      },

      updatePrize: (id, updates) => {
        const { prizes } = get()
        const index = prizes.findIndex(p => p.id === id)
        
        if (index === -1) return false
        
        set((state) => {
          const updated = state.prizes.map(p =>
            p.id === id ? { ...p, ...updates } : p
          )
          return { prizes: sortPrizesByTier(updated) }
        })
        
        return true
      },

      deletePrize: (id) => {
        const { prizes } = get()
        const exists = prizes.some(p => p.id === id)
        
        if (!exists) return false
        
        set((state) => ({
          prizes: state.prizes.filter(p => p.id !== id),
        }))
        
        return true
      },

      togglePrize: (id) => {
        const { prizes } = get()
        const prize = prizes.find(p => p.id === id)
        
        if (!prize) return false
        
        set((state) => ({
          prizes: state.prizes.map(p =>
            p.id === id ? { ...p, isActive: !p.isActive } : p
          ),
        }))
        
        return true
      },

      // ========================================
      // Gameplay
      // ========================================

      rollForPrize: () => {
        const { prizes, recordWin } = get()
        
        // Get available prizes (active and have inventory)
        const availablePrizes = prizes.filter(
          p => p.isActive && p.remainingInventory > 0
        )
        
        // No prizes available
        if (availablePrizes.length === 0) {
          return { won: false }
        }
        
        // Sort by tier priority (gold first, then silver, then bronze)
        const sortedPrizes = sortPrizesByTier(availablePrizes)
        
        // Generate random number 0-100
        const roll = Math.random() * 100
        
        // Check against each prize's odds in tier order
        // Each prize is checked independently based on its odds
        for (const prize of sortedPrizes) {
          // Roll for this specific prize
          const prizeRoll = Math.random() * 100
          if (prizeRoll < prize.odds) {
            // Winner! Decrement inventory
            set((state) => ({
              prizes: state.prizes.map(p =>
                p.id === prize.id
                  ? { ...p, remainingInventory: p.remainingInventory - 1 }
                  : p
              ),
            }))
            
            return { won: true, prize }
          }
        }
        
        // No win
        return { won: false }
      },

      recordWin: (prizeId, userId) => {
        const { prizes } = get()
        const prize = prizes.find(p => p.id === prizeId)
        
        if (!prize) return null
        
        const win: PrizeWin = {
          id: generateId('win'),
          prizeId,
          prizeName: prize.name,
          tier: prize.tier,
          wonAt: Date.now(),
          userId,
          claimed: false,
        }
        
        set((state) => ({
          wins: [win, ...state.wins],
        }))
        
        return win
      },

      markWinClaimed: (winId) => {
        const { wins } = get()
        const exists = wins.some(w => w.id === winId)
        
        if (!exists) return false
        
        set((state) => ({
          wins: state.wins.map(w =>
            w.id === winId ? { ...w, claimed: true } : w
          ),
        }))
        
        return true
      },

      // ========================================
      // Stats & Queries
      // ========================================

      getTotalWins: () => {
        return get().wins.length
      },

      getWinRate: () => {
        const { prizes } = get()
        const activePrizes = prizes.filter(p => p.isActive && p.remainingInventory > 0)
        
        // Calculate total win probability
        // Using independent probability: P(any win) = 1 - P(no wins)
        // P(no win for prize i) = 1 - (odds_i / 100)
        // P(no wins) = product of all P(no win for prize i)
        const noWinProbability = activePrizes.reduce((acc, prize) => {
          return acc * (1 - prize.odds / 100)
        }, 1)
        
        return (1 - noWinProbability) * 100
      },

      getPrizeInventory: () => {
        const { prizes } = get()
        return prizes.reduce(
          (acc, prize) => ({
            total: acc.total + prize.totalInventory,
            remaining: acc.remaining + prize.remainingInventory,
          }),
          { total: 0, remaining: 0 }
        )
      },

      getActivePrizes: () => {
        const { prizes } = get()
        return sortPrizesByTier(prizes.filter(p => p.isActive))
      },

      getAvailablePrizes: () => {
        const { prizes } = get()
        return sortPrizesByTier(
          prizes.filter(p => p.isActive && p.remainingInventory > 0)
        )
      },

      getPrizeById: (id) => {
        return get().prizes.find(p => p.id === id)
      },

      getWinsByPrize: (prizeId) => {
        return get().wins.filter(w => w.prizeId === prizeId)
      },

      getUnclaimedWins: () => {
        return get().wins.filter(w => !w.claimed)
      },
    }),
    {
      name: 'v5-prize-store',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        prizes: state.prizes,
        wins: state.wins,
        isInitialized: state.isInitialized,
      }),
      onRehydrateStorage: () => (state) => {
        // Initialize prizes if empty after rehydration
        if (state && (!state.prizes || state.prizes.length === 0)) {
          state.initializePrizes()
        }
      },
    }
  )
)

// ============================================================================
// Selector Hooks
// ============================================================================

export const usePrizes = () => usePrizeStore(state => state.prizes)
export const useWins = () => usePrizeStore(state => state.wins)
export const useActivePrizes = () => usePrizeStore(state => state.getActivePrizes())
export const useAvailablePrizes = () => usePrizeStore(state => state.getAvailablePrizes())
export const useUnclaimedWins = () => usePrizeStore(state => state.getUnclaimedWins())
export const useTotalWins = () => usePrizeStore(state => state.getTotalWins())
export const useWinRate = () => usePrizeStore(state => state.getWinRate())
export const usePrizeInventory = () => usePrizeStore(state => state.getPrizeInventory())

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format win timestamp for display
 */
export function formatWinDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/**
 * Get remaining inventory percentage
 */
export function getInventoryPercentage(prize: Prize): number {
  if (prize.totalInventory === 0) return 0
  return (prize.remainingInventory / prize.totalInventory) * 100
}

/**
 * Check if prize is running low on inventory
 */
export function isLowInventory(prize: Prize, threshold = 10): boolean {
  return prize.remainingInventory <= threshold && prize.remainingInventory > 0
}

/**
 * Check if prize is out of stock
 */
export function isOutOfStock(prize: Prize): boolean {
  return prize.remainingInventory === 0
}
