/**
 * Default Prize Configuration
 * 
 * Defines the initial prize pool for the scratch card instant win feature.
 * Prizes are organized by tier (gold, silver, bronze) with decreasing rarity.
 */

import type { Prize } from '../store/prizeStore'

/**
 * Default prizes for the DrinkSip Dark Side Football promotion
 * 
 * Odds breakdown:
 * - Gold tier: 0.6% total (rare, high-value)
 * - Silver tier: 5% total (uncommon, medium-value)
 * - Bronze tier: 35% total (common, entry-level)
 * - No win: 59.4%
 */
export const DEFAULT_PRIZES: Omit<Prize, 'id'>[] = [
  // === GOLD TIER (0.6% total) ===
  {
    name: 'Big Game Tickets',
    description: 'Two tickets to the Super Bowl! Includes premium seating and VIP tailgate access.',
    tier: 'gold',
    odds: 0.1,
    totalInventory: 1,
    remainingInventory: 1,
    isActive: true,
    imageUrl: '/sprites/trophy-gold.png',
    value: 10000, // $10,000
  },
  {
    name: 'DeMarcus Meet & Greet',
    description: 'VIP experience with DeMarcus Lawrence. Includes photo op, signed memorabilia, and exclusive stadium tour.',
    tier: 'gold',
    odds: 0.5,
    totalInventory: 5,
    remainingInventory: 5,
    isActive: true,
    imageUrl: '/sprites/vip-pass.png',
    value: 2500, // $2,500
  },

  // === SILVER TIER (5% total) ===
  {
    name: 'DrinkSip Yeti Cooler',
    description: 'Premium Yeti cooler featuring exclusive DrinkSip Dark Side branding. Keeps your drinks cold for days!',
    tier: 'silver',
    odds: 2,
    totalInventory: 20,
    remainingInventory: 20,
    isActive: true,
    imageUrl: '/sprites/yeti-cooler.png',
    value: 350, // $350
  },
  {
    name: 'Signed Game Jersey',
    description: 'Authentic game-worn style jersey signed by Dark Side defensive stars. Includes certificate of authenticity.',
    tier: 'silver',
    odds: 3,
    totalInventory: 25,
    remainingInventory: 25,
    isActive: true,
    imageUrl: '/sprites/jersey-signed.png',
    value: 500, // $500
  },

  // === BRONZE TIER (35% total) ===
  {
    name: 'Free 6-Pack',
    description: 'Redeem for a free 6-pack of any DrinkSip flavor at participating retailers.',
    tier: 'bronze',
    odds: 15,
    totalInventory: 500,
    remainingInventory: 500,
    isActive: true,
    imageUrl: '/sprites/sixpack.png',
    value: 12, // $12
  },
  {
    name: 'DrinkSip Hat',
    description: 'Official DrinkSip Dark Side Football snapback cap. One size fits all.',
    tier: 'bronze',
    odds: 20,
    totalInventory: 1000,
    remainingInventory: 1000,
    isActive: true,
    imageUrl: '/sprites/hat.png',
    value: 25, // $25
  },
]

/**
 * Prize tier display configuration
 */
export const PRIZE_TIER_CONFIG = {
  gold: {
    label: 'Grand Prize',
    color: '#FFD700',
    bgGradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    glowColor: 'rgba(255, 215, 0, 0.5)',
    icon: '🏆',
  },
  silver: {
    label: 'Major Prize',
    color: '#C0C0C0',
    bgGradient: 'linear-gradient(135deg, #E8E8E8 0%, #A8A8A8 100%)',
    glowColor: 'rgba(192, 192, 192, 0.5)',
    icon: '🥈',
  },
  bronze: {
    label: 'Instant Win',
    color: '#CD7F32',
    bgGradient: 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)',
    glowColor: 'rgba(205, 127, 50, 0.5)',
    icon: '🎁',
  },
} as const

/**
 * Format dollar value for display
 */
export function formatPrizeValue(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`
  }
  return `$${value}`
}

/**
 * Get tier priority for sorting (gold first, then silver, then bronze)
 */
export function getTierPriority(tier: 'gold' | 'silver' | 'bronze'): number {
  switch (tier) {
    case 'gold': return 0
    case 'silver': return 1
    case 'bronze': return 2
  }
}
