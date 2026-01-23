import { create } from 'zustand'

/**
 * Power-up types available in the game
 */
export type PowerUpId =
  | 'DOUBLE_TAP_POWER'
  | 'EXTEND_TIME'
  | 'HEAD_START'
  | 'MOMENTUM_BOOST'
  | 'EXTRA_LINEMAN'

/**
 * Modifiers applied during clash based on power-ups
 */
export interface ClashModifiers {
  tapPowerMultiplier: number    // Default 1.0, DOUBLE_TAP_POWER adds 1.0
  extraTime: number             // Default 0, EXTEND_TIME adds 2.0
  headStartPercent: number      // Default 0, HEAD_START adds 0.20
  resistanceMultiplier: number  // Default 1.0, MOMENTUM_BOOST sets to 0.80
  extraLineman: boolean         // Default false, EXTRA_LINEMAN sets to true
  extraLinemanBoost: number     // Default 1.0, EXTRA_LINEMAN sets to 1.10
}

export function getDefaultModifiers(): ClashModifiers {
  return {
    tapPowerMultiplier: 1.0,
    extraTime: 0,
    headStartPercent: 0,
    resistanceMultiplier: 1.0,
    extraLineman: false,
    extraLinemanBoost: 1.0,
  }
}

/**
 * Apply a power-up to modifiers
 */
export function applyPowerUp(powerUpId: PowerUpId, modifiers: ClashModifiers): ClashModifiers {
  const newModifiers = { ...modifiers }

  switch (powerUpId) {
    case 'DOUBLE_TAP_POWER':
      newModifiers.tapPowerMultiplier += 1.0 // Doubles tap power
      break
    case 'EXTEND_TIME':
      newModifiers.extraTime += 2.0
      break
    case 'HEAD_START':
      newModifiers.headStartPercent = 0.20
      break
    case 'MOMENTUM_BOOST':
      newModifiers.resistanceMultiplier *= 0.80 // Reduce resistance by 20%
      break
    case 'EXTRA_LINEMAN':
      newModifiers.extraLineman = true
      newModifiers.extraLinemanBoost = 1.10 // +10% tap power
      break
  }

  return newModifiers
}

/**
 * Power-up definition for UI
 */
export interface PowerUpDef {
  id: PowerUpId
  name: string
  description: string
  icon: string
}

export const POWERUP_POOL: PowerUpDef[] = [
  {
    id: 'DOUBLE_TAP_POWER',
    name: 'Power Surge',
    description: 'Double tap power next clash',
    icon: 'Z',
  },
  {
    id: 'EXTEND_TIME',
    name: 'Time Extension',
    description: '+2 seconds on timer',
    icon: 'T',
  },
  {
    id: 'HEAD_START',
    name: 'Head Start',
    description: 'Start meter at 20%',
    icon: 'R',
  },
  {
    id: 'MOMENTUM_BOOST',
    name: 'Momentum Boost',
    description: 'Reduce opponent resistance 20%',
    icon: 'M',
  },
  {
    id: 'EXTRA_LINEMAN',
    name: 'Extra Lineman',
    description: '6th defender + 10% power',
    icon: 'S',
  },
]

export function getRandomPowerUps(count: number = 3): PowerUpDef[] {
  const shuffled = [...POWERUP_POOL].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

/**
 * Game state store using Zustand
 */
interface GameState {
  // Current level (1-9)
  currentLevel: number

  // Retry count for current level (for assist calculation)
  retryCount: number

  // Power-ups selected for next clash
  pendingPowerUps: PowerUpId[]

  // Stats
  totalTaps: number
  totalWins: number

  // Debug mode
  debugMode: boolean

  // Actions
  startGame: () => void
  setLevel: (level: number) => void
  advanceLevel: () => void
  incrementRetry: () => void
  resetRetryCount: () => void
  addPowerUp: (powerUpId: PowerUpId) => void
  clearPowerUps: () => void
  getModifiers: () => ClashModifiers
  consumePowerUps: () => ClashModifiers
  recordTap: () => void
  recordWin: () => void
  toggleDebug: () => void
  resetGame: () => void
}

export const useGameStore = create<GameState>((set, get) => ({
  currentLevel: 1,
  retryCount: 0,
  pendingPowerUps: [],
  totalTaps: 0,
  totalWins: 0,
  debugMode: false,

  startGame: () => {
    set({
      currentLevel: 1,
      retryCount: 0,
      pendingPowerUps: [],
      totalTaps: 0,
      totalWins: 0,
    })
  },

  setLevel: (level: number) => {
    set({ currentLevel: level })
  },

  advanceLevel: () => {
    set((state) => ({
      currentLevel: Math.min(state.currentLevel + 1, 9),
      retryCount: 0,
    }))
  },

  incrementRetry: () => {
    set((state) => ({
      retryCount: state.retryCount + 1,
    }))
  },

  resetRetryCount: () => {
    set({ retryCount: 0 })
  },

  addPowerUp: (powerUpId: PowerUpId) => {
    set((state) => ({
      pendingPowerUps: [...state.pendingPowerUps, powerUpId],
    }))
  },

  clearPowerUps: () => {
    set({ pendingPowerUps: [] })
  },

  getModifiers: () => {
    const { pendingPowerUps } = get()
    let modifiers = getDefaultModifiers()
    for (const powerUpId of pendingPowerUps) {
      modifiers = applyPowerUp(powerUpId, modifiers)
    }
    return modifiers
  },

  consumePowerUps: () => {
    const modifiers = get().getModifiers()
    set({ pendingPowerUps: [] })
    return modifiers
  },

  recordTap: () => {
    set((state) => ({
      totalTaps: state.totalTaps + 1,
    }))
  },

  recordWin: () => {
    set((state) => ({
      totalWins: state.totalWins + 1,
    }))
  },

  toggleDebug: () => {
    set((state) => ({
      debugMode: !state.debugMode,
    }))
  },

  resetGame: () => {
    set({
      currentLevel: 1,
      retryCount: 0,
      pendingPowerUps: [],
      totalTaps: 0,
      totalWins: 0,
    })
  },
}))

// Non-reactive getter for use in Phaser scenes
export function getGameState() {
  return useGameStore.getState()
}
