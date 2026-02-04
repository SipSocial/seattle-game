/**
 * Claim Store - Zustand store for prize claims state
 * 
 * Manages:
 * - Available prizes to claim
 * - Claim history
 * - Claim/decline actions
 * - Deadline tracking
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Prize tiers
export type PrizeTier = 'grand' | 'major' | 'minor'

// Claim statuses
export type ClaimStatus = 
  | 'pending'   // Prize available to claim
  | 'claimed'   // User accepted, processing
  | 'shipped'   // Prize sent
  | 'expired'   // Deadline passed
  | 'declined'  // User declined

// Prize definition
export interface Prize {
  id: string
  name: string
  description: string
  imageUrl: string
  tier: PrizeTier
  value?: number  // Prize value in cents
}

// Claim record
export interface Claim {
  id: string
  prizeId: string
  prize: Prize
  status: ClaimStatus
  wonAt: number           // Timestamp when prize was won
  expiresAt: number       // Deadline to claim (7 days)
  claimedAt?: number      // When user claimed
  declinedAt?: number     // When user declined
  shippedAt?: number      // When prize shipped
  trackingNumber?: string // Shipping tracking
  shippingAddress?: ShippingAddress
}

// Shipping address
export interface ShippingAddress {
  name: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  zip: string
  phone?: string
}

interface ClaimState {
  // Claims data
  claims: Claim[]
  
  // User's default shipping address
  defaultAddress: ShippingAddress | null
  
  // UI state
  selectedClaimId: string | null
  showConfetti: boolean
  
  // Actions
  addClaim: (claim: Claim) => void
  claimPrize: (claimId: string, address: ShippingAddress) => boolean
  declinePrize: (claimId: string) => boolean
  setDefaultAddress: (address: ShippingAddress) => void
  setSelectedClaimId: (id: string | null) => void
  setShowConfetti: (show: boolean) => void
  
  // Check for expired claims
  updateExpiredClaims: () => void
  
  // Computed
  getPendingClaims: () => Claim[]
  getClaimedClaims: () => Claim[]
  getHistoryClaims: () => Claim[]
  getClaimById: (id: string) => Claim | undefined
  getTimeRemaining: (claimId: string) => number
  hasPendingClaims: () => boolean
  getPendingCount: () => number
}

// 7 days in milliseconds
const CLAIM_DEADLINE_MS = 7 * 24 * 60 * 60 * 1000

// Sample prizes for demo
const SAMPLE_PRIZES: Prize[] = [
  {
    id: 'prize-big-game',
    name: 'Big Game Tickets',
    description: 'Two tickets to the Big Game in San Francisco! Includes VIP tailgate access.',
    imageUrl: '/sprites/trophy-gold.png',
    tier: 'grand',
    value: 500000, // $5,000
  },
  {
    id: 'prize-jersey',
    name: 'Signed Jersey',
    description: 'Authentic DeMarcus Lawrence signed jersey with certificate of authenticity.',
    imageUrl: '/sprites/jersey-signed.png',
    tier: 'major',
    value: 50000, // $500
  },
  {
    id: 'prize-merch',
    name: 'DrinkSip Merch Pack',
    description: 'Exclusive Dark Side Football merch pack including hat, shirt, and koozie.',
    imageUrl: '/sprites/merch-pack.png',
    tier: 'minor',
    value: 10000, // $100
  },
]

export const useClaimStore = create<ClaimState>()(
  persist(
    (set, get) => ({
      // Initial state
      claims: [],
      defaultAddress: null,
      selectedClaimId: null,
      showConfetti: false,

      // Add a new claim (when user wins a prize)
      addClaim: (claim) => {
        set((state) => ({
          claims: [...state.claims, claim],
        }))
      },

      // Claim a prize
      claimPrize: (claimId, address) => {
        const { claims } = get()
        const claim = claims.find(c => c.id === claimId)
        
        if (!claim) return false
        if (claim.status !== 'pending') return false
        
        // Check if expired
        const now = Date.now()
        if (now > claim.expiresAt) {
          // Update to expired
          set((state) => ({
            claims: state.claims.map(c => 
              c.id === claimId 
                ? { ...c, status: 'expired' as const }
                : c
            ),
          }))
          return false
        }
        
        // Claim the prize
        set((state) => ({
          claims: state.claims.map(c => 
            c.id === claimId 
              ? { 
                  ...c, 
                  status: 'claimed' as const,
                  claimedAt: now,
                  shippingAddress: address,
                }
              : c
          ),
          defaultAddress: address, // Save as default
          showConfetti: true,
        }))
        
        return true
      },

      // Decline a prize
      declinePrize: (claimId) => {
        const { claims } = get()
        const claim = claims.find(c => c.id === claimId)
        
        if (!claim) return false
        if (claim.status !== 'pending') return false
        
        set((state) => ({
          claims: state.claims.map(c => 
            c.id === claimId 
              ? { 
                  ...c, 
                  status: 'declined' as const,
                  declinedAt: Date.now(),
                }
              : c
          ),
        }))
        
        return true
      },

      // Set default shipping address
      setDefaultAddress: (address) => set({ defaultAddress: address }),

      // Set selected claim for sheet
      setSelectedClaimId: (id) => set({ selectedClaimId: id }),

      // Show/hide confetti
      setShowConfetti: (show) => set({ showConfetti: show }),

      // Check and update expired claims
      updateExpiredClaims: () => {
        const now = Date.now()
        
        set((state) => ({
          claims: state.claims.map(c => {
            if (c.status === 'pending' && now > c.expiresAt) {
              return { ...c, status: 'expired' as const }
            }
            return c
          }),
        }))
      },

      // Get pending claims (available to claim)
      // NOTE: Don't call updateExpiredClaims here - it causes infinite render loop
      // Call updateExpiredClaims in a useEffect in the component instead
      getPendingClaims: () => {
        const { claims } = get()
        const now = Date.now()
        // Filter out expired claims without updating state
        return claims.filter(c => c.status === 'pending' && now <= c.expiresAt)
      },

      // Get claimed claims (processing/shipped)
      getClaimedClaims: () => {
        const { claims } = get()
        return claims.filter(c => c.status === 'claimed' || c.status === 'shipped')
      },

      // Get history claims (all non-pending)
      getHistoryClaims: () => {
        const { claims } = get()
        return claims.filter(c => c.status !== 'pending')
          .sort((a, b) => (b.claimedAt || b.declinedAt || 0) - (a.claimedAt || a.declinedAt || 0))
      },

      // Get claim by ID
      getClaimById: (id) => {
        const { claims } = get()
        return claims.find(c => c.id === id)
      },

      // Get time remaining to claim
      getTimeRemaining: (claimId) => {
        const { claims } = get()
        const claim = claims.find(c => c.id === claimId)
        
        if (!claim || claim.status !== 'pending') return 0
        
        const now = Date.now()
        return Math.max(0, claim.expiresAt - now)
      },

      // Check if there are pending claims
      hasPendingClaims: () => {
        const { getPendingClaims } = get()
        return getPendingClaims().length > 0
      },

      // Get pending claims count
      getPendingCount: () => {
        const { getPendingClaims } = get()
        return getPendingClaims().length
      },
    }),
    {
      name: 'drinksip-claims-storage',
      partialize: (state) => ({
        claims: state.claims,
        defaultAddress: state.defaultAddress,
      }),
    }
  )
)

// Format countdown for display
export function formatClaimCountdown(ms: number): string {
  if (ms <= 0) return 'Expired'
  
  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  
  if (days > 0) {
    return `${days}d ${hours}h left`
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m left`
  }
  return `${minutes}m left`
}

// Format deadline date
export function formatDeadlineDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// Get status display info
export function getStatusDisplay(status: ClaimStatus): {
  label: string
  color: string
  bg: string
} {
  switch (status) {
    case 'pending':
      return {
        label: 'Claim Now',
        color: '#69BE28',
        bg: 'rgba(105, 190, 40, 0.15)',
      }
    case 'claimed':
      return {
        label: 'Processing',
        color: '#3B82F6',
        bg: 'rgba(59, 130, 246, 0.15)',
      }
    case 'shipped':
      return {
        label: 'Shipped',
        color: '#10B981',
        bg: 'rgba(16, 185, 129, 0.15)',
      }
    case 'expired':
      return {
        label: 'Expired',
        color: '#EF4444',
        bg: 'rgba(239, 68, 68, 0.15)',
      }
    case 'declined':
      return {
        label: 'Declined',
        color: '#6B7280',
        bg: 'rgba(107, 114, 128, 0.15)',
      }
  }
}

// Create a demo claim for testing
export function createDemoClaim(): Claim {
  const now = Date.now()
  const randomPrize = SAMPLE_PRIZES[Math.floor(Math.random() * SAMPLE_PRIZES.length)]
  
  return {
    id: `claim-${now}`,
    prizeId: randomPrize.id,
    prize: randomPrize,
    status: 'pending',
    wonAt: now,
    expiresAt: now + CLAIM_DEADLINE_MS,
  }
}

// Selector hooks
export const usePendingClaims = () => useClaimStore(state => state.getPendingClaims())
export const useClaimedClaims = () => useClaimStore(state => state.getClaimedClaims())
export const useHistoryClaims = () => useClaimStore(state => state.getHistoryClaims())
export const useDefaultAddress = () => useClaimStore(state => state.defaultAddress)
export const useShowConfetti = () => useClaimStore(state => state.showConfetti)
