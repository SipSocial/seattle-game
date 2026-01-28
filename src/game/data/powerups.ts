/**
 * DrinkSip Power-Up Definitions
 * Each power-up is branded with a DrinkSip product
 */

export type PowerUpType = 'SLOW_MO' | 'EXTRA_LIFE' | 'SPEED_BOOST' | 'BIG_HIT'

export interface PowerUpDefinition {
  type: PowerUpType
  name: string
  product: string
  description: string
  duration: number // seconds, 0 = instant
  color: number
  effect: {
    // Effect multipliers
    enemySpeedMultiplier?: number
    playerSpeedMultiplier?: number
    tackleRadiusMultiplier?: number
    extraLives?: number
  }
}

export const POWER_UPS: Record<PowerUpType, PowerUpDefinition> = {
  SLOW_MO: {
    type: 'SLOW_MO',
    name: 'Slow-Mo',
    product: 'Hazy IPA',
    description: 'Things get hazy...',
    duration: 5,
    color: 0xf4a460, // Sandy brown (beer color)
    effect: {
      enemySpeedMultiplier: 0.5,
    },
  },
  EXTRA_LIFE: {
    type: 'EXTRA_LIFE',
    name: 'Extra Life',
    product: 'Watermelon Refresher',
    description: 'Stay refreshed!',
    duration: 0, // Instant
    color: 0xff6b8a, // Watermelon pink
    effect: {
      extraLives: 1,
    },
  },
  SPEED_BOOST: {
    type: 'SPEED_BOOST',
    name: 'Speed Boost',
    product: 'Lemon Lime Refresher',
    description: 'Citrus energy!',
    duration: 6,
    color: 0xadff2f, // Green-yellow (lime)
    effect: {
      playerSpeedMultiplier: 1.5,
    },
  },
  BIG_HIT: {
    type: 'BIG_HIT',
    name: 'Big Hit',
    product: 'Blood Orange Refresher',
    description: 'Explosive reach!',
    duration: 5,
    color: 0xff4500, // Orange-red
    effect: {
      tackleRadiusMultiplier: 1.75,
    },
  },
}

// Drop rate for power-ups
export const POWER_UP_DROP_CHANCE = 0.20 // 20% chance on tackle

// Get random power-up type
export function getRandomPowerUpType(): PowerUpType {
  const types = Object.keys(POWER_UPS) as PowerUpType[]
  return types[Math.floor(Math.random() * types.length)]
}

// Max lives cap
export const MAX_LIVES = 5
export const STARTING_LIVES = 3
