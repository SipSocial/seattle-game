import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PowerUpType } from '../game/data/powerups'
import { DEFAULT_DEFENDER } from '../game/data/roster'

export interface LeaderboardEntry {
  id: string
  playerName: string
  jerseyNumber: number
  score: number
  wave: number
  tackles: number
  date: string
}

export interface ActivePowerUp {
  type: PowerUpType
  remainingTime: number
}

interface GameState {
  // Player selection
  selectedDefender: number
  playerName: string

  // Game session state (reset each game)
  score: number
  lives: number
  wave: number
  combo: number
  maxCombo: number
  tackles: number
  
  // Power-up state
  activePowerUp: ActivePowerUp | null

  // Leaderboard (persisted)
  leaderboard: LeaderboardEntry[]

  // High score tracking
  highScore: number

  // Actions
  setSelectedDefender: (jersey: number) => void
  setPlayerName: (name: string) => void
  
  // Game actions
  startGame: () => void
  addScore: (points: number) => void
  loseLife: () => void
  addLife: () => void
  incrementWave: () => void
  addTackle: () => void
  incrementCombo: () => void
  resetCombo: () => void
  
  // Power-up actions
  setActivePowerUp: (powerUp: ActivePowerUp | null) => void
  
  // Leaderboard actions
  addLeaderboardEntry: (entry: Omit<LeaderboardEntry, 'id' | 'date'>) => void
  
  // Reset
  resetGame: () => void
}

const INITIAL_GAME_STATE = {
  score: 0,
  lives: 3,
  wave: 1,
  combo: 0,
  maxCombo: 0,
  tackles: 0,
  activePowerUp: null,
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedDefender: DEFAULT_DEFENDER,
      playerName: '',
      ...INITIAL_GAME_STATE,
      leaderboard: [],
      highScore: 0,

      // Player selection
      setSelectedDefender: (jersey) => set({ selectedDefender: jersey }),
      setPlayerName: (name) => set({ playerName: name.toUpperCase().slice(0, 3) }),

      // Game actions
      startGame: () => set({ ...INITIAL_GAME_STATE }),
      
      addScore: (points) => {
        const { score, combo, highScore } = get()
        const multiplier = 1 + (combo * 0.5) // 1x, 1.5x, 2x, 2.5x, 3x
        const cappedMultiplier = Math.min(multiplier, 3)
        const newScore = score + Math.floor(points * cappedMultiplier)
        set({ 
          score: newScore,
          highScore: Math.max(highScore, newScore),
        })
      },
      
      loseLife: () => {
        const { lives } = get()
        set({ lives: Math.max(0, lives - 1) })
      },
      
      addLife: () => {
        const { lives } = get()
        set({ lives: Math.min(5, lives + 1) }) // Max 5 lives
      },
      
      incrementWave: () => {
        const { wave } = get()
        set({ wave: wave + 1 })
      },
      
      addTackle: () => {
        const { tackles } = get()
        set({ tackles: tackles + 1 })
      },
      
      incrementCombo: () => {
        const { combo, maxCombo } = get()
        const newCombo = Math.min(combo + 1, 4) // Max 4 for 3x multiplier
        set({ 
          combo: newCombo,
          maxCombo: Math.max(maxCombo, newCombo),
        })
      },
      
      resetCombo: () => set({ combo: 0 }),

      // Power-up actions
      setActivePowerUp: (powerUp) => set({ activePowerUp: powerUp }),

      // Leaderboard
      addLeaderboardEntry: (entry) => {
        const { leaderboard } = get()
        const newEntry: LeaderboardEntry = {
          ...entry,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          date: new Date().toISOString(),
        }
        
        // Add and sort by score, keep top 10
        const updated = [...leaderboard, newEntry]
          .sort((a, b) => b.score - a.score)
          .slice(0, 10)
        
        set({ leaderboard: updated })
      },

      // Reset
      resetGame: () => set({ ...INITIAL_GAME_STATE }),
    }),
    {
      name: 'darkside-defense-storage',
      partialize: (state) => ({
        selectedDefender: state.selectedDefender,
        playerName: state.playerName,
        leaderboard: state.leaderboard,
        highScore: state.highScore,
      }),
    }
  )
)

// Selector hooks for common state
export const useScore = () => useGameStore((state) => state.score)
export const useLives = () => useGameStore((state) => state.lives)
export const useWave = () => useGameStore((state) => state.wave)
export const useCombo = () => useGameStore((state) => state.combo)
export const useLeaderboard = () => useGameStore((state) => state.leaderboard)
