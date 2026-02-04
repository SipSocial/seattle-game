/**
 * Scan Store - Product scan state management for retail execution
 * 
 * Tracks:
 * - Daily scan limit (one per day per user)
 * - Last scan timestamp
 * - Scan history with verification status
 * - Instant win results
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Prize types for instant win
export type PrizeType = 'merch' | 'discount' | 'bonus_entries' | 'grand_prize'
export type PrizeTier = 'gold' | 'silver' | 'bronze'

export interface Prize {
  id: string
  type: PrizeType
  tier: PrizeTier
  name: string
  description: string
  value: string // "20% OFF" or "5 Entries" or "DrinkSip Hat"
  imageUrl?: string
}

// Available prizes with configurable odds (total should equal 100%)
export const PRIZES: Prize[] = [
  {
    id: 'bonus-5',
    type: 'bonus_entries',
    tier: 'bronze',
    name: '5 Bonus Entries',
    description: 'Five extra entries into the Big Game giveaway!',
    value: '+5 Entries',
  },
  {
    id: 'bonus-10',
    type: 'bonus_entries',
    tier: 'silver',
    name: '10 Bonus Entries',
    description: 'Ten extra entries into the Big Game giveaway!',
    value: '+10 Entries',
  },
  {
    id: 'discount-20',
    type: 'discount',
    tier: 'bronze',
    name: '20% Off',
    description: '20% off your next DrinkSip order!',
    value: '20% OFF',
  },
  {
    id: 'merch-hat',
    type: 'merch',
    tier: 'silver',
    name: 'DrinkSip Hat',
    description: 'Official DrinkSip Dark Side Football cap!',
    value: 'Free Hat',
  },
  {
    id: 'merch-shirt',
    type: 'merch',
    tier: 'gold',
    name: 'DrinkSip T-Shirt',
    description: 'Limited edition Dark Side Football tee!',
    value: 'Free Shirt',
  },
]

// Prize odds (index matches PRIZES array, must sum to 100)
// 10% overall win rate, distributed across prizes
export const PRIZE_ODDS: number[] = [4, 2, 2.5, 1, 0.5] // 10% total win rate

// Scan result structure
export interface ScanResult {
  id: string
  photoUrl?: string
  verified: boolean
  verifiedAt?: string
  scannedAt: string
  entriesEarned: number
  instantWinResult: {
    won: boolean
    prize?: Prize
  } | null
}

// Store state
interface ScanState {
  // Daily limit tracking
  lastScanDate: string | null // ISO date string (YYYY-MM-DD)
  canScanToday: boolean
  
  // Scan history
  scans: ScanResult[]
  currentScan: ScanResult | null
  
  // Stats
  totalScans: number
  totalWins: number
  totalEntriesFromScans: number
}

// Store actions
interface ScanActions {
  // Check if user can scan today
  checkDailyLimit: () => boolean
  
  // Start a new scan
  startScan: () => void
  
  // Submit photo for verification
  submitPhoto: (photoUrl: string) => Promise<void>
  
  // Simulate verification (for demo)
  simulateVerification: () => Promise<boolean>
  
  // Roll for instant win
  rollInstantWin: () => { won: boolean; prize?: Prize }
  
  // Complete the scan
  completeScan: (won: boolean, prize?: Prize) => void
  
  // Reset current scan (cancel)
  resetCurrentScan: () => void
  
  // Get time until next scan
  getTimeUntilNextScan: () => { hours: number; minutes: number; seconds: number } | null
  
  // Debug: reset daily limit
  debugResetDailyLimit: () => void
}

type ScanStore = ScanState & ScanActions

// Get today's date in YYYY-MM-DD format in local timezone
function getTodayDateString(): string {
  const now = new Date()
  return now.toLocaleDateString('en-CA') // Returns YYYY-MM-DD
}

// Generate unique ID
function generateScanId(): string {
  return `scan_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// Get milliseconds until midnight local time
function getMsUntilMidnight(): number {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  return midnight.getTime() - now.getTime()
}

// Initial state
const initialState: ScanState = {
  lastScanDate: null,
  canScanToday: true,
  scans: [],
  currentScan: null,
  totalScans: 0,
  totalWins: 0,
  totalEntriesFromScans: 0,
}

// Create the store with persistence
export const useScanStore = create<ScanStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      checkDailyLimit: () => {
        const { lastScanDate } = get()
        const today = getTodayDateString()
        
        if (lastScanDate === today) {
          set({ canScanToday: false })
          return false
        }
        
        set({ canScanToday: true })
        return true
      },

      startScan: () => {
        const canScan = get().checkDailyLimit()
        if (!canScan) return
        
        const newScan: ScanResult = {
          id: generateScanId(),
          verified: false,
          scannedAt: new Date().toISOString(),
          entriesEarned: 0,
          instantWinResult: null,
        }
        
        set({ currentScan: newScan })
      },

      submitPhoto: async (photoUrl: string) => {
        const { currentScan } = get()
        if (!currentScan) return
        
        set({
          currentScan: {
            ...currentScan,
            photoUrl,
          },
        })
      },

      simulateVerification: async () => {
        // Simulate network delay for verification
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const { currentScan } = get()
        if (!currentScan) return false
        
        // For demo, always verify successfully
        // In production, this would call an API to verify the photo
        const verified = true
        const entriesEarned = 1 // Base entry for valid scan
        
        set({
          currentScan: {
            ...currentScan,
            verified,
            verifiedAt: verified ? new Date().toISOString() : undefined,
            entriesEarned,
          },
        })
        
        return verified
      },

      rollInstantWin: () => {
        // Roll a random number 0-100
        const roll = Math.random() * 100
        let cumulative = 0
        
        for (let i = 0; i < PRIZE_ODDS.length; i++) {
          cumulative += PRIZE_ODDS[i]
          if (roll < cumulative) {
            return { won: true, prize: PRIZES[i] }
          }
        }
        
        return { won: false }
      },

      completeScan: (won: boolean, prize?: Prize) => {
        const { currentScan, scans, totalScans, totalWins, totalEntriesFromScans } = get()
        if (!currentScan) return
        
        const completedScan: ScanResult = {
          ...currentScan,
          instantWinResult: { won, prize },
        }
        
        // Calculate bonus entries from prize
        let bonusEntries = 0
        if (won && prize?.type === 'bonus_entries') {
          const match = prize.value.match(/\+(\d+)/)
          if (match) {
            bonusEntries = parseInt(match[1], 10)
          }
        }
        
        completedScan.entriesEarned += bonusEntries
        
        set({
          scans: [completedScan, ...scans],
          currentScan: null,
          lastScanDate: getTodayDateString(),
          canScanToday: false,
          totalScans: totalScans + 1,
          totalWins: totalWins + (won ? 1 : 0),
          totalEntriesFromScans: totalEntriesFromScans + completedScan.entriesEarned,
        })
      },

      resetCurrentScan: () => {
        set({ currentScan: null })
      },

      getTimeUntilNextScan: () => {
        const { canScanToday } = get()
        if (canScanToday) return null
        
        const msUntil = getMsUntilMidnight()
        const hours = Math.floor(msUntil / (1000 * 60 * 60))
        const minutes = Math.floor((msUntil % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((msUntil % (1000 * 60)) / 1000)
        
        return { hours, minutes, seconds }
      },

      debugResetDailyLimit: () => {
        set({
          lastScanDate: null,
          canScanToday: true,
        })
      },
    }),
    {
      name: 'v5-scan-store',
      version: 1,
    }
  )
)

// Hook to get countdown timer that updates every second
export function useNextScanCountdown() {
  const getTimeUntilNextScan = useScanStore(state => state.getTimeUntilNextScan)
  const [countdown, setCountdown] = useState<{ hours: number; minutes: number; seconds: number } | null>(null)

  useEffect(() => {
    const update = () => {
      setCountdown(getTimeUntilNextScan())
    }
    
    update()
    const interval = setInterval(update, 1000)
    
    return () => clearInterval(interval)
  }, [getTimeUntilNextScan])

  return countdown
}

// Need to import these for the hook
import { useState, useEffect } from 'react'
