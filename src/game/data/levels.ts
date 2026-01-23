/**
 * Level Configuration for Road to the Super Bowl
 * 9 Levels with increasing difficulty
 */

export interface LevelConfig {
  level: number
  opponentId: string
  opponentName: string
  targetForce: number
  timeLimitSec: number
  opponentResistance: number
  approachSpeed: number
  isSuperBowl: boolean
}

// Base tap power (force added per tap)
export const BASE_TAP_POWER = 10

// Exact level configurations as specified
export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    opponentId: 'crimson-forge',
    opponentName: 'Crimson Forge',
    targetForce: 120,
    timeLimitSec: 8.0,
    opponentResistance: 4.0,
    approachSpeed: 140,
    isSuperBowl: false,
  },
  {
    level: 2,
    opponentId: 'iron-gold',
    opponentName: 'Iron Gold',
    targetForce: 150,
    timeLimitSec: 7.5,
    opponentResistance: 4.8,
    approachSpeed: 150,
    isSuperBowl: false,
  },
  {
    level: 3,
    opponentId: 'slate-storm',
    opponentName: 'Slate Storm',
    targetForce: 180,
    timeLimitSec: 7.2,
    opponentResistance: 5.6,
    approachSpeed: 155,
    isSuperBowl: false,
  },
  {
    level: 4,
    opponentId: 'midnight-violet',
    opponentName: 'Midnight Violet',
    targetForce: 215,
    timeLimitSec: 7.0,
    opponentResistance: 6.4,
    approachSpeed: 160,
    isSuperBowl: false,
  },
  {
    level: 5,
    opponentId: 'burnt-orange',
    opponentName: 'Burnt Orange',
    targetForce: 255,
    timeLimitSec: 6.8,
    opponentResistance: 7.4,
    approachSpeed: 165,
    isSuperBowl: false,
  },
  {
    level: 6,
    opponentId: 'arctic-surge',
    opponentName: 'Arctic Surge',
    targetForce: 300,
    timeLimitSec: 6.6,
    opponentResistance: 8.6,
    approachSpeed: 170,
    isSuperBowl: false,
  },
  {
    level: 7,
    opponentId: 'forest-black',
    opponentName: 'Forest Black',
    targetForce: 350,
    timeLimitSec: 6.4,
    opponentResistance: 10.0,
    approachSpeed: 175,
    isSuperBowl: false,
  },
  {
    level: 8,
    opponentId: 'solar-red',
    opponentName: 'Solar Red',
    targetForce: 410,
    timeLimitSec: 6.2,
    opponentResistance: 11.6,
    approachSpeed: 180,
    isSuperBowl: false,
  },
  {
    level: 9,
    opponentId: 'black-gold-legion',
    opponentName: 'Black Gold Legion',
    targetForce: 480,
    timeLimitSec: 6.0,
    opponentResistance: 13.5,
    approachSpeed: 190,
    isSuperBowl: true,
  },
]

export function getLevelConfig(level: number): LevelConfig {
  const index = Math.max(0, Math.min(level - 1, LEVELS.length - 1))
  return LEVELS[index]
}

export const TOTAL_LEVELS = LEVELS.length

// Retry assist: reduce target by 5% per retry, max 20%
export const RETRY_ASSIST_PERCENT = 0.05
export const MAX_RETRY_ASSIST = 0.20

export function getAdjustedTargetForce(baseTarget: number, retryCount: number): number {
  const reduction = Math.min(retryCount * RETRY_ASSIST_PERCENT, MAX_RETRY_ASSIST)
  return Math.round(baseTarget * (1 - reduction))
}
