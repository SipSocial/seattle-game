/**
 * V3 Game Store
 * 
 * Separate from V1 gameStore to avoid breaking existing game
 * Handles V3-specific state: offense/defense, full game flow, new mechanics
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_QB, STARTING_RECEIVERS } from '@/src/game/data/offenseRoster'
import { DEFAULT_DEFENDER } from '@/src/game/data/roster'

// ============================================================================
// Types
// ============================================================================

export type GamePhase = 'menu' | 'map' | 'matchPreview' | 'roster' | 'playing' | 'results'
export type Possession = 'offense' | 'defense'
export type PlayState = 'preSnap' | 'inPlay' | 'playEnd' | 'quarterEnd' | 'gameEnd'
export type CoverageType = 'man' | 'zone' | 'blitz'

export interface GameClock {
  quarter: 1 | 2 | 3 | 4
  timeMs: number // milliseconds remaining in quarter
  isRunning: boolean
}

export interface DriveState {
  possession: Possession
  down: 1 | 2 | 3 | 4
  distance: number // yards to first down
  yardLine: number // 0-100, 0 = own endzone, 100 = opponent endzone
  firstDownMarker: number // yard line for first down
}

export interface GameScore {
  home: number // Dark Side
  away: number // Opponent
}

export interface OffenseStats {
  passingYards: number
  passingTDs: number
  completions: number
  attempts: number
  interceptions: number
  rushingYards: number
  rushingTDs: number
}

export interface DefenseStats {
  sacks: number
  tackles: number
  tacklesForLoss: number
  passBreakups: number
  interceptions: number
  forcedFumbles: number
}

export interface GameStats {
  offense: OffenseStats
  defense: DefenseStats
}

export interface V3CampaignProgress {
  currentWeek: number
  weeksCompleted: number[]
  totalWins: number
  totalLosses: number
  isSuperBowlWon: boolean
}

// ============================================================================
// Entry & User Types (for giveaway/leaderboard)
// ============================================================================

export interface UserProfile {
  email: string | null
  username: string | null
  createdAt: string | null
}

export interface EntryRecord {
  type: 'email' | 'play' | 'share'
  gameWeek?: number
  timestamp: string
}

export interface LeaderboardScore {
  email: string
  username: string
  totalScore: number
  gamesWon: number
  week: number
  timestamp: string
}

export interface DailyUnlocks {
  // Day 1: weeks 1-3, Day 2: weeks 4-6, etc.
  // Super Bowl Sunday all unlock
  unlockedWeeks: number[]
  lastUnlockDate: string // ISO date string
}

export interface V3GameState {
  // ========== Phase & Mode ==========
  gamePhase: GamePhase
  currentWeekId: number | null
  
  // ========== Selected Players ==========
  selectedQB: number
  selectedReceivers: number[]
  selectedDefender: number
  
  // ========== In-Game State ==========
  playState: PlayState
  score: GameScore
  clock: GameClock
  drive: DriveState
  stats: GameStats
  
  // ========== Defense Playcall ==========
  selectedCoverage: CoverageType
  
  // ========== Upgrades ==========
  upgrades: {
    qbAccuracy: number      // 0-10 bonus
    qbArmStrength: number   // 0-10 bonus
    receiverSpeed: number   // 0-10 bonus
    catchRadius: number     // 0-10 bonus
    jukeBonus: number       // 0-10 bonus
    tackleRadius: number    // 0-10 bonus
    passRushSpeed: number   // 0-10 bonus
  }
  
  // ========== Campaign ==========
  campaign: V3CampaignProgress
  
  // ========== User & Entries (for giveaway) ==========
  user: UserProfile
  entries: EntryRecord[]
  dailyUnlocks: DailyUnlocks
  
  // ========== Leaderboard (local cache) ==========
  localScores: LeaderboardScore[]
  
  // ========== Actions ==========
  // Phase management
  setGamePhase: (phase: GamePhase) => void
  setCurrentWeek: (weekId: number) => void
  
  // Player selection
  setSelectedQB: (jersey: number) => void
  setSelectedDefender: (jersey: number) => void
  
  // Game state
  startGame: (weekId: number) => void
  updateScore: (team: 'home' | 'away', points: number) => void
  updateClock: (timeMs: number) => void
  advanceQuarter: () => void
  updateDrive: (updates: Partial<DriveState>) => void
  changePossession: () => void
  
  // Playcall
  setSelectedCoverage: (coverage: CoverageType) => void
  
  // Stats
  recordPass: (completed: boolean, yards: number) => void
  recordTD: (type: 'passing' | 'rushing') => void
  recordSack: () => void
  recordTackle: (forLoss: boolean) => void
  recordInterception: (byDefense: boolean) => void
  
  // End game
  endGame: (won: boolean) => void
  
  // Upgrades
  applyUpgrade: (upgrade: keyof V3GameState['upgrades']) => void
  
  // User & Entries
  setUserEmail: (email: string) => void
  setUsername: (username: string) => void
  addEntry: (type: 'email' | 'play' | 'share', gameWeek?: number) => void
  getEntryCount: () => number
  
  // Daily unlocks
  refreshDailyUnlocks: () => void
  isWeekUnlocked: (week: number) => boolean
  
  // Leaderboard
  saveScore: () => void
  getLocalScores: () => LeaderboardScore[]
  
  // Reset
  resetGame: () => void
  resetCampaign: () => void
}

// ============================================================================
// Initial State
// ============================================================================

const INITIAL_CLOCK: GameClock = {
  quarter: 1,
  timeMs: 60000, // 1 minute per quarter (QB Legend style)
  isRunning: false,
}

const INITIAL_DRIVE: DriveState = {
  possession: 'offense',
  down: 1,
  distance: 20,
  yardLine: 25, // Start at own 25 after touchback
  firstDownMarker: 45,
}

const INITIAL_STATS: GameStats = {
  offense: {
    passingYards: 0,
    passingTDs: 0,
    completions: 0,
    attempts: 0,
    interceptions: 0,
    rushingYards: 0,
    rushingTDs: 0,
  },
  defense: {
    sacks: 0,
    tackles: 0,
    tacklesForLoss: 0,
    passBreakups: 0,
    interceptions: 0,
    forcedFumbles: 0,
  },
}

const INITIAL_UPGRADES = {
  qbAccuracy: 0,
  qbArmStrength: 0,
  receiverSpeed: 0,
  catchRadius: 0,
  jukeBonus: 0,
  tackleRadius: 0,
  passRushSpeed: 0,
}

const INITIAL_CAMPAIGN: V3CampaignProgress = {
  currentWeek: 1,
  weeksCompleted: [],
  totalWins: 0,
  totalLosses: 0,
  isSuperBowlWon: false,
}

const INITIAL_USER: UserProfile = {
  email: null,
  username: null,
  createdAt: null,
}

// Calculate which weeks should be unlocked based on current date
// Super Bowl is Feb 8, 2026. We release Feb 2, so:
// Feb 2: weeks 1-3, Feb 3: weeks 4-6, Feb 4: weeks 7-9, 
// Feb 5: weeks 10-12, Feb 6: weeks 13-15, Feb 7: weeks 16-18
function calculateUnlockedWeeks(): number[] {
  const superBowlDate = new Date('2026-02-08')
  const launchDate = new Date('2026-02-02')
  const now = new Date()
  
  // If it's Super Bowl day or after, all weeks unlocked
  if (now >= superBowlDate) {
    return Array.from({ length: 18 }, (_, i) => i + 1)
  }
  
  // Calculate days since launch
  const daysSinceLaunch = Math.floor((now.getTime() - launchDate.getTime()) / (1000 * 60 * 60 * 24))
  
  // 3 games per day
  const gamesUnlocked = Math.min(18, (daysSinceLaunch + 1) * 3)
  
  return Array.from({ length: gamesUnlocked }, (_, i) => i + 1)
}

const INITIAL_DAILY_UNLOCKS: DailyUnlocks = {
  unlockedWeeks: calculateUnlockedWeeks(),
  lastUnlockDate: new Date().toISOString().split('T')[0],
}

// ============================================================================
// Store
// ============================================================================

export const useV3GameStore = create<V3GameState>()(
  persist(
    (set, get) => ({
      // ========== Initial State ==========
      gamePhase: 'menu',
      currentWeekId: null,
      
      selectedQB: DEFAULT_QB,
      selectedReceivers: STARTING_RECEIVERS,
      selectedDefender: DEFAULT_DEFENDER,
      
      playState: 'preSnap',
      score: { home: 0, away: 0 },
      clock: INITIAL_CLOCK,
      drive: INITIAL_DRIVE,
      stats: INITIAL_STATS,
      
      selectedCoverage: 'zone',
      upgrades: INITIAL_UPGRADES,
      campaign: INITIAL_CAMPAIGN,
      
      user: INITIAL_USER,
      entries: [],
      dailyUnlocks: INITIAL_DAILY_UNLOCKS,
      localScores: [],
      
      // ========== Phase Management ==========
      setGamePhase: (phase) => set({ gamePhase: phase }),
      setCurrentWeek: (weekId) => set({ currentWeekId: weekId }),
      
      // ========== Player Selection ==========
      setSelectedQB: (jersey) => set({ selectedQB: jersey }),
      setSelectedDefender: (jersey) => set({ selectedDefender: jersey }),
      
      // ========== Game State ==========
      startGame: (weekId) => set({
        currentWeekId: weekId,
        gamePhase: 'playing',
        playState: 'preSnap',
        score: { home: 0, away: 0 },
        clock: INITIAL_CLOCK,
        drive: INITIAL_DRIVE,
        stats: INITIAL_STATS,
      }),
      
      updateScore: (team, points) => set((state) => ({
        score: {
          ...state.score,
          [team === 'home' ? 'home' : 'away']: state.score[team === 'home' ? 'home' : 'away'] + points,
        },
      })),
      
      updateClock: (timeMs) => set((state) => ({
        clock: { ...state.clock, timeMs: Math.max(0, timeMs) },
      })),
      
      advanceQuarter: () => set((state) => {
        const nextQuarter = (state.clock.quarter + 1) as 1 | 2 | 3 | 4
        if (nextQuarter > 4) {
          return { playState: 'gameEnd' }
        }
        return {
          clock: { ...INITIAL_CLOCK, quarter: nextQuarter },
          playState: 'quarterEnd',
        }
      }),
      
      updateDrive: (updates) => set((state) => ({
        drive: { ...state.drive, ...updates },
      })),
      
      changePossession: () => set((state) => ({
        drive: {
          ...INITIAL_DRIVE,
          possession: state.drive.possession === 'offense' ? 'defense' : 'offense',
          yardLine: 100 - state.drive.yardLine, // Flip field position
        },
      })),
      
      // ========== Playcall ==========
      setSelectedCoverage: (coverage) => set({ selectedCoverage: coverage }),
      
      // ========== Stats ==========
      recordPass: (completed, yards) => set((state) => ({
        stats: {
          ...state.stats,
          offense: {
            ...state.stats.offense,
            attempts: state.stats.offense.attempts + 1,
            completions: state.stats.offense.completions + (completed ? 1 : 0),
            passingYards: state.stats.offense.passingYards + (completed ? yards : 0),
          },
        },
      })),
      
      recordTD: (type) => set((state) => ({
        stats: {
          ...state.stats,
          offense: {
            ...state.stats.offense,
            passingTDs: state.stats.offense.passingTDs + (type === 'passing' ? 1 : 0),
            rushingTDs: state.stats.offense.rushingTDs + (type === 'rushing' ? 1 : 0),
          },
        },
      })),
      
      recordSack: () => set((state) => ({
        stats: {
          ...state.stats,
          defense: {
            ...state.stats.defense,
            sacks: state.stats.defense.sacks + 1,
          },
        },
      })),
      
      recordTackle: (forLoss) => set((state) => ({
        stats: {
          ...state.stats,
          defense: {
            ...state.stats.defense,
            tackles: state.stats.defense.tackles + 1,
            tacklesForLoss: state.stats.defense.tacklesForLoss + (forLoss ? 1 : 0),
          },
        },
      })),
      
      recordInterception: (byDefense) => set((state) => ({
        stats: {
          ...state.stats,
          offense: {
            ...state.stats.offense,
            interceptions: state.stats.offense.interceptions + (byDefense ? 0 : 1),
          },
          defense: {
            ...state.stats.defense,
            interceptions: state.stats.defense.interceptions + (byDefense ? 1 : 0),
          },
        },
      })),
      
      // ========== End Game ==========
      endGame: (won) => set((state) => ({
        gamePhase: 'results',
        playState: 'gameEnd',
        campaign: {
          ...state.campaign,
          weeksCompleted: state.currentWeekId 
            ? [...state.campaign.weeksCompleted, state.currentWeekId]
            : state.campaign.weeksCompleted,
          totalWins: state.campaign.totalWins + (won ? 1 : 0),
          totalLosses: state.campaign.totalLosses + (won ? 0 : 1),
          currentWeek: state.currentWeekId 
            ? state.currentWeekId + 1 
            : state.campaign.currentWeek,
        },
      })),
      
      // ========== Upgrades ==========
      applyUpgrade: (upgrade) => set((state) => ({
        upgrades: {
          ...state.upgrades,
          [upgrade]: Math.min(10, state.upgrades[upgrade] + 1),
        },
      })),
      
      // ========== User & Entries ==========
      setUserEmail: (email) => set((state) => ({
        user: {
          ...state.user,
          email,
          createdAt: state.user.createdAt || new Date().toISOString(),
        },
        // Auto-add email entry if not already added
        entries: state.entries.some(e => e.type === 'email')
          ? state.entries
          : [...state.entries, { type: 'email', timestamp: new Date().toISOString() }],
      })),
      
      setUsername: (username) => set((state) => ({
        user: {
          ...state.user,
          username,
        },
      })),
      
      addEntry: (type, gameWeek) => set((state) => {
        // Don't add duplicate entries for same type+week
        const isDuplicate = state.entries.some(
          e => e.type === type && (type !== 'play' || e.gameWeek === gameWeek)
        )
        if (isDuplicate && type !== 'play') return state
        
        return {
          entries: [
            ...state.entries,
            { type, gameWeek, timestamp: new Date().toISOString() },
          ],
        }
      }),
      
      getEntryCount: () => {
        return get().entries.length
      },
      
      // ========== Daily Unlocks ==========
      refreshDailyUnlocks: () => set(() => ({
        dailyUnlocks: {
          unlockedWeeks: calculateUnlockedWeeks(),
          lastUnlockDate: new Date().toISOString().split('T')[0],
        },
      })),
      
      isWeekUnlocked: (week) => {
        const state = get()
        // Refresh if date changed
        const today = new Date().toISOString().split('T')[0]
        if (state.dailyUnlocks.lastUnlockDate !== today) {
          get().refreshDailyUnlocks()
        }
        return get().dailyUnlocks.unlockedWeeks.includes(week)
      },
      
      // ========== Leaderboard ==========
      saveScore: () => set((state) => {
        if (!state.user.email) return state
        
        const newScore: LeaderboardScore = {
          email: state.user.email,
          username: state.user.username || state.user.email.split('@')[0],
          totalScore: state.campaign.weeksCompleted.length * 1000 + 
            state.stats.offense.passingTDs * 100 +
            state.stats.defense.sacks * 50 +
            state.stats.defense.interceptions * 75,
          gamesWon: state.campaign.totalWins,
          week: state.currentWeekId || state.campaign.currentWeek,
          timestamp: new Date().toISOString(),
        }
        
        // Keep top 100 local scores
        const updatedScores = [...state.localScores, newScore]
          .sort((a, b) => b.totalScore - a.totalScore)
          .slice(0, 100)
        
        return { localScores: updatedScores }
      }),
      
      getLocalScores: () => {
        return get().localScores
      },
      
      // ========== Reset ==========
      resetGame: () => set({
        gamePhase: 'menu',
        currentWeekId: null,
        playState: 'preSnap',
        score: { home: 0, away: 0 },
        clock: INITIAL_CLOCK,
        drive: INITIAL_DRIVE,
        stats: INITIAL_STATS,
      }),
      
      resetCampaign: () => set({
        campaign: INITIAL_CAMPAIGN,
        upgrades: INITIAL_UPGRADES,
      }),
    }),
    {
      name: 'dark-side-v3-storage',
      partialize: (state) => ({
        selectedQB: state.selectedQB,
        selectedDefender: state.selectedDefender,
        campaign: state.campaign,
        upgrades: state.upgrades,
        user: state.user,
        entries: state.entries,
        dailyUnlocks: state.dailyUnlocks,
        localScores: state.localScores,
      }),
    }
  )
)

// ============================================================================
// Selectors / Hooks
// ============================================================================

export function useV3Clock() {
  return useV3GameStore((state) => state.clock)
}

export function useV3Drive() {
  return useV3GameStore((state) => state.drive)
}

export function useV3Score() {
  return useV3GameStore((state) => state.score)
}

export function useV3Stats() {
  return useV3GameStore((state) => state.stats)
}

export function useV3Campaign() {
  return useV3GameStore((state) => state.campaign)
}

export function useV3User() {
  return useV3GameStore((state) => state.user)
}

export function useV3Entries() {
  return useV3GameStore((state) => state.entries)
}

export function useV3DailyUnlocks() {
  return useV3GameStore((state) => state.dailyUnlocks)
}

export function useV3Leaderboard() {
  return useV3GameStore((state) => state.localScores)
}

// ============================================================================
// Utilities
// ============================================================================

export function formatClock(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function getDownLabel(down: 1 | 2 | 3 | 4): string {
  switch (down) {
    case 1: return '1st'
    case 2: return '2nd'
    case 3: return '3rd'
    case 4: return '4th'
  }
}

export function getYardLineLabel(yardLine: number): string {
  if (yardLine <= 50) {
    return `OWN ${yardLine}`
  } else {
    return `OPP ${100 - yardLine}`
  }
}
