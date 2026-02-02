/**
 * V4 Stats Store
 * 
 * Comprehensive QB and game stats tracking system for Dark Side Football.
 * Handles per-play tracking, game summaries, and Supabase leaderboard sync.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/src/lib/supabase/client'
import {
  calculateNFLPasserRating,
  calculateGameRating,
  calculateCompletionPercentage,
  calculateYardsPerAttempt,
  type ThrowTiming,
  type ThrowQuality,
  type PocketStats,
  type QBPassingStats,
  calculatePlayBonus,
  calculateTotalGameScore,
  getPasserRatingGrade,
  getStarRating,
} from '../lib/qbRating'

// ============================================================================
// Types - QB Stats
// ============================================================================

export interface QBStats {
  // Core passing stats
  completions: number
  attempts: number
  passingYards: number
  touchdowns: number
  interceptions: number
  
  // Calculated stats (updated on each play)
  completionPercentage: number
  yardsPerAttempt: number
  passerRating: number
  
  // Sacks & pressure
  sacksTaken: number
  sacksYardsLost: number
  
  // Pocket stats
  totalPocketTimeMs: number
  avgPocketTimeMs: number
  dropbacks: number
  quickReleases: number      // Throws under 2s
  pressuredThrows: number
  escapesFromPocket: number
  
  // Throw quality tracking
  throwQuality: ThrowQuality
  
  // Play-by-play for this game
  passLog: PassPlay[]
}

export interface PassPlay {
  id: string
  playNumber: number
  quarter: 1 | 2 | 3 | 4
  timeMs: number
  
  // Pre-snap
  down: 1 | 2 | 3 | 4
  distance: number
  yardLine: number
  
  // Throw details
  targetReceiverId: number
  targetReceiverName: string
  routeType: string
  
  // Results
  completed: boolean
  yardsGained: number
  yardsAfterCatch: number
  
  // Timing
  pocketTimeMs: number
  throwTiming: ThrowTiming
  
  // Outcome
  isTouchdown: boolean
  isInterception: boolean
  isFirstDown: boolean
  isSack: boolean
  
  // Scoring
  bonusPoints: number
  
  timestamp: number
}

// ============================================================================
// Types - Receiver Stats
// ============================================================================

export interface ReceiverStats {
  playerId: number
  playerName: string
  position: 'WR' | 'TE' | 'RB'
  
  // Targets & catches
  targets: number
  receptions: number
  receivingYards: number
  yardsAfterCatch: number
  
  // Performance
  drops: number
  contestedCatches: number
  catchPercentage: number
  
  // Quality catches
  perfectCatches: number    // Caught on perfect throws
  difficultCatches: number  // Caught despite poor throw/coverage
  
  // Big plays
  touchdowns: number
  firstDowns: number
  longestReception: number
  
  // Average
  avgYardsPerReception: number
  avgYardsPerTarget: number
}

// ============================================================================
// Types - Drive Summary
// ============================================================================

export type DriveResult = 
  | 'touchdown'
  | 'field_goal'
  | 'punt'
  | 'turnover_downs'
  | 'interception'
  | 'fumble'
  | 'safety'
  | 'end_of_half'
  | 'end_of_game'

export interface DriveSummary {
  id: string
  driveNumber: number
  quarter: 1 | 2 | 3 | 4
  startTimeMs: number
  endTimeMs: number
  
  // Field position
  startYardLine: number
  endYardLine: number
  yardsGained: number
  
  // Plays
  totalPlays: number
  passingPlays: number
  rushingPlays: number
  
  // Result
  result: DriveResult
  points: number
  
  // Key plays
  bigPlays: string[]  // Human-readable descriptions
}

// ============================================================================
// Types - Quarter Stats
// ============================================================================

export interface QuarterStats {
  quarter: 1 | 2 | 3 | 4
  
  // Scoring
  pointsScored: number
  pointsAllowed: number
  
  // Passing
  completions: number
  attempts: number
  passingYards: number
  touchdowns: number
  interceptions: number
  
  // Efficiency
  completionPercentage: number
  yardsPerAttempt: number
  
  // Time of possession (ms)
  possessionTimeMs: number
}

// ============================================================================
// Types - Game Summary
// ============================================================================

export interface GameSummary {
  gameId: string
  weekId: number
  opponentName: string
  opponentLogo: string
  
  // Final score
  homeScore: number   // Dark Side
  awayScore: number   // Opponent
  won: boolean
  
  // QB Performance
  qbStats: QBStats
  gameRating: number
  starRating: number
  
  // Receiver breakdown
  receiverStats: Record<number, ReceiverStats>
  
  // Quarter breakdown
  quarterStats: QuarterStats[]
  
  // Drive summaries
  drives: DriveSummary[]
  
  // Game totals
  totalYards: number
  turnovers: number
  possessionTimeMs: number
  
  // Scoring
  totalPoints: number        // Game points scored
  bonusPoints: number        // Accumulated bonuses
  finalScore: number         // Combined for leaderboard
  
  // Timestamps
  startedAt: number
  endedAt: number
  durationMs: number
}

// ============================================================================
// Types - Career Stats (Aggregated)
// ============================================================================

export interface CareerStats {
  gamesPlayed: number
  gamesWon: number
  winPercentage: number
  
  // Passing totals
  totalCompletions: number
  totalAttempts: number
  totalPassingYards: number
  totalTouchdowns: number
  totalInterceptions: number
  
  // Career averages
  avgCompletionPercentage: number
  avgYardsPerGame: number
  avgPasserRating: number
  avgGameRating: number
  
  // Best performances
  highestPasserRating: number
  highestGameRating: number
  mostPassingYards: number
  mostTouchdowns: number
  longestPass: number
  
  // Worst performances (for comparison)
  lowestPasserRating: number
  
  // Totals
  totalGameScore: number
  totalBonusPoints: number
}

// ============================================================================
// Types - Leaderboard
// ============================================================================

export interface LeaderboardEntry {
  id: string
  rank: number
  
  // Player info
  playerId: string | null
  email: string | null
  username: string
  avatarUrl: string | null
  
  // Scores
  weekScore: number
  totalScore: number
  
  // Stats summary
  gamesWon: number
  avgPasserRating: number
  totalTouchdowns: number
  
  // Week
  week: number
  
  // Timestamp
  createdAt: string
}

export interface LeaderboardState {
  entries: LeaderboardEntry[]
  userRank: number | null
  isLoading: boolean
  lastFetched: number | null
  error: string | null
}

// ============================================================================
// Store State
// ============================================================================

interface StatsState {
  // ========== Current Game Stats ==========
  currentGame: {
    isActive: boolean
    gameId: string | null
    weekId: number | null
    startedAt: number | null
    
    // Live QB stats
    qbStats: QBStats
    
    // Live receiver stats
    receiverStats: Record<number, ReceiverStats>
    
    // Quarter tracking
    currentQuarter: 1 | 2 | 3 | 4
    quarterStats: QuarterStats[]
    
    // Drive tracking
    currentDriveNumber: number
    currentDriveStartYardLine: number
    currentDriveStartTimeMs: number
    currentDrivePlays: number
    drives: DriveSummary[]
    
    // Score tracking
    homeScore: number
    awayScore: number
    bonusPoints: number
  }
  
  // ========== Game History ==========
  gameHistory: GameSummary[]
  
  // ========== Career Stats ==========
  careerStats: CareerStats
  
  // ========== Leaderboard ==========
  leaderboard: LeaderboardState
  
  // ========== Actions - Game Lifecycle ==========
  startGame: (weekId: number, opponentName: string) => void
  endGame: (won: boolean, homeScore: number, awayScore: number) => GameSummary
  resetCurrentGame: () => void
  
  // ========== Actions - Play Recording ==========
  recordPass: (play: Omit<PassPlay, 'id' | 'playNumber' | 'bonusPoints'>) => void
  recordSack: (yardsLost: number, pocketTimeMs: number) => void
  recordPocketTime: (timeMs: number, escaped: boolean) => void
  
  // ========== Actions - Receiver Stats ==========
  recordTarget: (receiverId: number, receiverName: string, position: 'WR' | 'TE' | 'RB') => void
  recordReception: (
    receiverId: number,
    yards: number,
    yac: number,
    throwTiming: ThrowTiming,
    isTouchdown: boolean,
    isFirstDown: boolean
  ) => void
  recordDrop: (receiverId: number) => void
  
  // ========== Actions - Drive Tracking ==========
  startDrive: (yardLine: number, quarter: 1 | 2 | 3 | 4, timeMs: number) => void
  endDrive: (
    result: DriveResult,
    endYardLine: number,
    points: number,
    quarter: 1 | 2 | 3 | 4,
    timeMs: number
  ) => void
  
  // ========== Actions - Quarter Tracking ==========
  advanceQuarter: () => void
  updateQuarterScore: (team: 'home' | 'away', points: number) => void
  
  // ========== Actions - Scoring ==========
  addBonusPoints: (points: number) => void
  
  // ========== Actions - Leaderboard ==========
  fetchLeaderboard: (week?: number, limit?: number) => Promise<void>
  submitScore: (email: string, username: string) => Promise<boolean>
  
  // ========== Selectors ==========
  getCurrentPasserRating: () => number
  getCurrentGameRating: () => number
  getTopReceiver: () => ReceiverStats | null
  getGameSummary: () => GameSummary | null
}

// ============================================================================
// Initial States
// ============================================================================

const INITIAL_QB_STATS: QBStats = {
  completions: 0,
  attempts: 0,
  passingYards: 0,
  touchdowns: 0,
  interceptions: 0,
  completionPercentage: 0,
  yardsPerAttempt: 0,
  passerRating: 0,
  sacksTaken: 0,
  sacksYardsLost: 0,
  totalPocketTimeMs: 0,
  avgPocketTimeMs: 0,
  dropbacks: 0,
  quickReleases: 0,
  pressuredThrows: 0,
  escapesFromPocket: 0,
  throwQuality: {
    perfect: 0,
    good: 0,
    late: 0,
    inaccurate: 0,
  },
  passLog: [],
}

const INITIAL_QUARTER_STATS: QuarterStats[] = [
  { quarter: 1, pointsScored: 0, pointsAllowed: 0, completions: 0, attempts: 0, passingYards: 0, touchdowns: 0, interceptions: 0, completionPercentage: 0, yardsPerAttempt: 0, possessionTimeMs: 0 },
  { quarter: 2, pointsScored: 0, pointsAllowed: 0, completions: 0, attempts: 0, passingYards: 0, touchdowns: 0, interceptions: 0, completionPercentage: 0, yardsPerAttempt: 0, possessionTimeMs: 0 },
  { quarter: 3, pointsScored: 0, pointsAllowed: 0, completions: 0, attempts: 0, passingYards: 0, touchdowns: 0, interceptions: 0, completionPercentage: 0, yardsPerAttempt: 0, possessionTimeMs: 0 },
  { quarter: 4, pointsScored: 0, pointsAllowed: 0, completions: 0, attempts: 0, passingYards: 0, touchdowns: 0, interceptions: 0, completionPercentage: 0, yardsPerAttempt: 0, possessionTimeMs: 0 },
]

const INITIAL_CURRENT_GAME = {
  isActive: false,
  gameId: null as string | null,
  weekId: null as number | null,
  startedAt: null as number | null,
  qbStats: { ...INITIAL_QB_STATS },
  receiverStats: {} as Record<number, ReceiverStats>,
  currentQuarter: 1 as 1 | 2 | 3 | 4,
  quarterStats: INITIAL_QUARTER_STATS.map(q => ({ ...q })),
  currentDriveNumber: 0,
  currentDriveStartYardLine: 25,
  currentDriveStartTimeMs: 0,
  currentDrivePlays: 0,
  drives: [] as DriveSummary[],
  homeScore: 0,
  awayScore: 0,
  bonusPoints: 0,
}

const INITIAL_CAREER_STATS: CareerStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  winPercentage: 0,
  totalCompletions: 0,
  totalAttempts: 0,
  totalPassingYards: 0,
  totalTouchdowns: 0,
  totalInterceptions: 0,
  avgCompletionPercentage: 0,
  avgYardsPerGame: 0,
  avgPasserRating: 0,
  avgGameRating: 0,
  highestPasserRating: 0,
  highestGameRating: 0,
  mostPassingYards: 0,
  mostTouchdowns: 0,
  longestPass: 0,
  lowestPasserRating: 158.3,
  totalGameScore: 0,
  totalBonusPoints: 0,
}

const INITIAL_LEADERBOARD: LeaderboardState = {
  entries: [],
  userRank: null,
  isLoading: false,
  lastFetched: null,
  error: null,
}

// ============================================================================
// Utility Functions
// ============================================================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function recalculateQBStats(stats: QBStats): QBStats {
  const passingStats: QBPassingStats = {
    completions: stats.completions,
    attempts: stats.attempts,
    passingYards: stats.passingYards,
    touchdowns: stats.touchdowns,
    interceptions: stats.interceptions,
  }
  
  return {
    ...stats,
    completionPercentage: calculateCompletionPercentage(stats.completions, stats.attempts),
    yardsPerAttempt: calculateYardsPerAttempt(stats.passingYards, stats.attempts),
    passerRating: calculateNFLPasserRating(passingStats),
    avgPocketTimeMs: stats.dropbacks > 0 ? stats.totalPocketTimeMs / stats.dropbacks : 0,
  }
}

function recalculateReceiverStats(stats: ReceiverStats): ReceiverStats {
  return {
    ...stats,
    catchPercentage: stats.targets > 0 ? (stats.receptions / stats.targets) * 100 : 0,
    avgYardsPerReception: stats.receptions > 0 ? stats.receivingYards / stats.receptions : 0,
    avgYardsPerTarget: stats.targets > 0 ? stats.receivingYards / stats.targets : 0,
  }
}

function recalculateQuarterStats(stats: QuarterStats): QuarterStats {
  return {
    ...stats,
    completionPercentage: stats.attempts > 0 ? (stats.completions / stats.attempts) * 100 : 0,
    yardsPerAttempt: stats.attempts > 0 ? stats.passingYards / stats.attempts : 0,
  }
}

// ============================================================================
// Store
// ============================================================================

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      // ========== Initial State ==========
      currentGame: { ...INITIAL_CURRENT_GAME },
      gameHistory: [],
      careerStats: { ...INITIAL_CAREER_STATS },
      leaderboard: { ...INITIAL_LEADERBOARD },
      
      // ========== Game Lifecycle ==========
      startGame: (weekId, opponentName) => {
        const gameId = generateId()
        const startedAt = Date.now()
        
        set({
          currentGame: {
            ...INITIAL_CURRENT_GAME,
            isActive: true,
            gameId,
            weekId,
            startedAt,
            quarterStats: INITIAL_QUARTER_STATS.map(q => ({ ...q })),
            qbStats: { ...INITIAL_QB_STATS },
            receiverStats: {},
            drives: [],
          },
        })
      },
      
      endGame: (won, homeScore, awayScore) => {
        const state = get()
        const { currentGame, careerStats, gameHistory } = state
        
        if (!currentGame.isActive || !currentGame.gameId || !currentGame.weekId || !currentGame.startedAt) {
          throw new Error('No active game to end')
        }
        
        const endedAt = Date.now()
        const durationMs = endedAt - currentGame.startedAt
        
        // Calculate final stats
        const qbStats = recalculateQBStats(currentGame.qbStats)
        const pocketStats: PocketStats = {
          avgTimeInPocket: qbStats.avgPocketTimeMs,
          quickReleases: qbStats.quickReleases,
          pressuredThrows: qbStats.pressuredThrows,
          sacksAllowed: qbStats.sacksTaken,
          escapesFromPocket: qbStats.escapesFromPocket,
        }
        
        const gameRating = calculateGameRating(
          {
            completions: qbStats.completions,
            attempts: qbStats.attempts,
            passingYards: qbStats.passingYards,
            touchdowns: qbStats.touchdowns,
            interceptions: qbStats.interceptions,
          },
          qbStats.throwQuality,
          pocketStats
        )
        
        const starRating = getStarRating(gameRating)
        const finalScore = calculateTotalGameScore(
          {
            completions: qbStats.completions,
            attempts: qbStats.attempts,
            passingYards: qbStats.passingYards,
            touchdowns: qbStats.touchdowns,
            interceptions: qbStats.interceptions,
          },
          qbStats.throwQuality,
          currentGame.bonusPoints
        )
        
        // Build game summary
        const gameSummary: GameSummary = {
          gameId: currentGame.gameId,
          weekId: currentGame.weekId,
          opponentName: '', // Would be passed in or stored
          opponentLogo: '',
          homeScore,
          awayScore,
          won,
          qbStats,
          gameRating,
          starRating,
          receiverStats: { ...currentGame.receiverStats },
          quarterStats: currentGame.quarterStats.map(q => recalculateQuarterStats(q)),
          drives: [...currentGame.drives],
          totalYards: qbStats.passingYards,
          turnovers: qbStats.interceptions,
          possessionTimeMs: qbStats.totalPocketTimeMs,
          totalPoints: homeScore,
          bonusPoints: currentGame.bonusPoints,
          finalScore,
          startedAt: currentGame.startedAt,
          endedAt,
          durationMs,
        }
        
        // Update career stats
        const newGamesPlayed = careerStats.gamesPlayed + 1
        const newGamesWon = careerStats.gamesWon + (won ? 1 : 0)
        const newTotalCompletions = careerStats.totalCompletions + qbStats.completions
        const newTotalAttempts = careerStats.totalAttempts + qbStats.attempts
        const newTotalYards = careerStats.totalPassingYards + qbStats.passingYards
        const newTotalTDs = careerStats.totalTouchdowns + qbStats.touchdowns
        const newTotalINTs = careerStats.totalInterceptions + qbStats.interceptions
        
        // Find longest pass from this game
        const longestPass = Math.max(0, ...qbStats.passLog.filter(p => p.completed).map(p => p.yardsGained))
        
        const updatedCareerStats: CareerStats = {
          gamesPlayed: newGamesPlayed,
          gamesWon: newGamesWon,
          winPercentage: (newGamesWon / newGamesPlayed) * 100,
          totalCompletions: newTotalCompletions,
          totalAttempts: newTotalAttempts,
          totalPassingYards: newTotalYards,
          totalTouchdowns: newTotalTDs,
          totalInterceptions: newTotalINTs,
          avgCompletionPercentage: newTotalAttempts > 0 ? (newTotalCompletions / newTotalAttempts) * 100 : 0,
          avgYardsPerGame: newTotalYards / newGamesPlayed,
          avgPasserRating: (careerStats.avgPasserRating * careerStats.gamesPlayed + qbStats.passerRating) / newGamesPlayed,
          avgGameRating: (careerStats.avgGameRating * careerStats.gamesPlayed + gameRating) / newGamesPlayed,
          highestPasserRating: Math.max(careerStats.highestPasserRating, qbStats.passerRating),
          highestGameRating: Math.max(careerStats.highestGameRating, gameRating),
          mostPassingYards: Math.max(careerStats.mostPassingYards, qbStats.passingYards),
          mostTouchdowns: Math.max(careerStats.mostTouchdowns, qbStats.touchdowns),
          longestPass: Math.max(careerStats.longestPass, longestPass),
          lowestPasserRating: Math.min(careerStats.lowestPasserRating, qbStats.passerRating),
          totalGameScore: careerStats.totalGameScore + finalScore,
          totalBonusPoints: careerStats.totalBonusPoints + currentGame.bonusPoints,
        }
        
        set({
          currentGame: { ...INITIAL_CURRENT_GAME },
          gameHistory: [...gameHistory, gameSummary],
          careerStats: updatedCareerStats,
        })
        
        return gameSummary
      },
      
      resetCurrentGame: () => {
        set({
          currentGame: { ...INITIAL_CURRENT_GAME },
        })
      },
      
      // ========== Play Recording ==========
      recordPass: (play) => {
        const state = get()
        const { currentGame } = state
        
        if (!currentGame.isActive) return
        
        const playNumber = currentGame.qbStats.passLog.length + 1
        const bonusPoints = calculatePlayBonus(
          play.completed ? play.yardsGained : 0,
          play.throwTiming,
          play.isTouchdown,
          play.isFirstDown && play.down >= 3,
          play.yardsAfterCatch
        )
        
        const fullPlay: PassPlay = {
          ...play,
          id: generateId(),
          playNumber,
          bonusPoints,
        }
        
        // Update QB stats
        const updatedQbStats: QBStats = {
          ...currentGame.qbStats,
          attempts: currentGame.qbStats.attempts + 1,
          completions: currentGame.qbStats.completions + (play.completed ? 1 : 0),
          passingYards: currentGame.qbStats.passingYards + (play.completed ? play.yardsGained : 0),
          touchdowns: currentGame.qbStats.touchdowns + (play.isTouchdown ? 1 : 0),
          interceptions: currentGame.qbStats.interceptions + (play.isInterception ? 1 : 0),
          dropbacks: currentGame.qbStats.dropbacks + 1,
          totalPocketTimeMs: currentGame.qbStats.totalPocketTimeMs + play.pocketTimeMs,
          quickReleases: currentGame.qbStats.quickReleases + (play.pocketTimeMs < 2000 ? 1 : 0),
          throwQuality: {
            ...currentGame.qbStats.throwQuality,
            [play.throwTiming]: currentGame.qbStats.throwQuality[play.throwTiming] + 1,
          },
          passLog: [...currentGame.qbStats.passLog, fullPlay],
        }
        
        // Update quarter stats
        const quarterIndex = currentGame.currentQuarter - 1
        const updatedQuarterStats = [...currentGame.quarterStats]
        updatedQuarterStats[quarterIndex] = {
          ...updatedQuarterStats[quarterIndex],
          attempts: updatedQuarterStats[quarterIndex].attempts + 1,
          completions: updatedQuarterStats[quarterIndex].completions + (play.completed ? 1 : 0),
          passingYards: updatedQuarterStats[quarterIndex].passingYards + (play.completed ? play.yardsGained : 0),
          touchdowns: updatedQuarterStats[quarterIndex].touchdowns + (play.isTouchdown ? 1 : 0),
          interceptions: updatedQuarterStats[quarterIndex].interceptions + (play.isInterception ? 1 : 0),
        }
        
        set({
          currentGame: {
            ...currentGame,
            qbStats: recalculateQBStats(updatedQbStats),
            quarterStats: updatedQuarterStats,
            currentDrivePlays: currentGame.currentDrivePlays + 1,
            bonusPoints: currentGame.bonusPoints + bonusPoints,
          },
        })
      },
      
      recordSack: (yardsLost, pocketTimeMs) => {
        const state = get()
        const { currentGame } = state
        
        if (!currentGame.isActive) return
        
        const updatedQbStats: QBStats = {
          ...currentGame.qbStats,
          sacksTaken: currentGame.qbStats.sacksTaken + 1,
          sacksYardsLost: currentGame.qbStats.sacksYardsLost + yardsLost,
          dropbacks: currentGame.qbStats.dropbacks + 1,
          totalPocketTimeMs: currentGame.qbStats.totalPocketTimeMs + pocketTimeMs,
          pressuredThrows: currentGame.qbStats.pressuredThrows + 1,
        }
        
        set({
          currentGame: {
            ...currentGame,
            qbStats: recalculateQBStats(updatedQbStats),
            currentDrivePlays: currentGame.currentDrivePlays + 1,
          },
        })
      },
      
      recordPocketTime: (timeMs, escaped) => {
        const state = get()
        const { currentGame } = state
        
        if (!currentGame.isActive) return
        
        set({
          currentGame: {
            ...currentGame,
            qbStats: {
              ...currentGame.qbStats,
              escapesFromPocket: currentGame.qbStats.escapesFromPocket + (escaped ? 1 : 0),
            },
          },
        })
      },
      
      // ========== Receiver Stats ==========
      recordTarget: (receiverId, receiverName, position) => {
        const state = get()
        const { currentGame } = state
        
        if (!currentGame.isActive) return
        
        const existingStats = currentGame.receiverStats[receiverId] || {
          playerId: receiverId,
          playerName: receiverName,
          position,
          targets: 0,
          receptions: 0,
          receivingYards: 0,
          yardsAfterCatch: 0,
          drops: 0,
          contestedCatches: 0,
          catchPercentage: 0,
          perfectCatches: 0,
          difficultCatches: 0,
          touchdowns: 0,
          firstDowns: 0,
          longestReception: 0,
          avgYardsPerReception: 0,
          avgYardsPerTarget: 0,
        }
        
        const updatedStats: ReceiverStats = {
          ...existingStats,
          targets: existingStats.targets + 1,
        }
        
        set({
          currentGame: {
            ...currentGame,
            receiverStats: {
              ...currentGame.receiverStats,
              [receiverId]: recalculateReceiverStats(updatedStats),
            },
          },
        })
      },
      
      recordReception: (receiverId, yards, yac, throwTiming, isTouchdown, isFirstDown) => {
        const state = get()
        const { currentGame } = state
        
        if (!currentGame.isActive) return
        
        const existingStats = currentGame.receiverStats[receiverId]
        if (!existingStats) return
        
        const isPerfectCatch = throwTiming === 'perfect'
        const isDifficultCatch = throwTiming === 'late' || throwTiming === 'inaccurate'
        
        const updatedStats: ReceiverStats = {
          ...existingStats,
          receptions: existingStats.receptions + 1,
          receivingYards: existingStats.receivingYards + yards,
          yardsAfterCatch: existingStats.yardsAfterCatch + yac,
          perfectCatches: existingStats.perfectCatches + (isPerfectCatch ? 1 : 0),
          difficultCatches: existingStats.difficultCatches + (isDifficultCatch ? 1 : 0),
          touchdowns: existingStats.touchdowns + (isTouchdown ? 1 : 0),
          firstDowns: existingStats.firstDowns + (isFirstDown ? 1 : 0),
          longestReception: Math.max(existingStats.longestReception, yards),
        }
        
        set({
          currentGame: {
            ...currentGame,
            receiverStats: {
              ...currentGame.receiverStats,
              [receiverId]: recalculateReceiverStats(updatedStats),
            },
          },
        })
      },
      
      recordDrop: (receiverId) => {
        const state = get()
        const { currentGame } = state
        
        if (!currentGame.isActive) return
        
        const existingStats = currentGame.receiverStats[receiverId]
        if (!existingStats) return
        
        const updatedStats: ReceiverStats = {
          ...existingStats,
          drops: existingStats.drops + 1,
        }
        
        set({
          currentGame: {
            ...currentGame,
            receiverStats: {
              ...currentGame.receiverStats,
              [receiverId]: recalculateReceiverStats(updatedStats),
            },
          },
        })
      },
      
      // ========== Drive Tracking ==========
      startDrive: (yardLine, quarter, timeMs) => {
        const state = get()
        const { currentGame } = state
        
        if (!currentGame.isActive) return
        
        set({
          currentGame: {
            ...currentGame,
            currentDriveNumber: currentGame.currentDriveNumber + 1,
            currentDriveStartYardLine: yardLine,
            currentDriveStartTimeMs: timeMs,
            currentDrivePlays: 0,
          },
        })
      },
      
      endDrive: (result, endYardLine, points, quarter, timeMs) => {
        const state = get()
        const { currentGame } = state
        
        if (!currentGame.isActive) return
        
        const yardsGained = endYardLine - currentGame.currentDriveStartYardLine
        
        const driveSummary: DriveSummary = {
          id: generateId(),
          driveNumber: currentGame.currentDriveNumber,
          quarter,
          startTimeMs: currentGame.currentDriveStartTimeMs,
          endTimeMs: timeMs,
          startYardLine: currentGame.currentDriveStartYardLine,
          endYardLine,
          yardsGained,
          totalPlays: currentGame.currentDrivePlays,
          passingPlays: currentGame.currentDrivePlays, // All passing in this game
          rushingPlays: 0,
          result,
          points,
          bigPlays: [],
        }
        
        set({
          currentGame: {
            ...currentGame,
            drives: [...currentGame.drives, driveSummary],
            currentDrivePlays: 0,
          },
        })
      },
      
      // ========== Quarter Tracking ==========
      advanceQuarter: () => {
        const state = get()
        const { currentGame } = state
        
        if (!currentGame.isActive || currentGame.currentQuarter >= 4) return
        
        set({
          currentGame: {
            ...currentGame,
            currentQuarter: (currentGame.currentQuarter + 1) as 1 | 2 | 3 | 4,
          },
        })
      },
      
      updateQuarterScore: (team, points) => {
        const state = get()
        const { currentGame } = state
        
        if (!currentGame.isActive) return
        
        const quarterIndex = currentGame.currentQuarter - 1
        const updatedQuarterStats = [...currentGame.quarterStats]
        
        if (team === 'home') {
          updatedQuarterStats[quarterIndex] = {
            ...updatedQuarterStats[quarterIndex],
            pointsScored: updatedQuarterStats[quarterIndex].pointsScored + points,
          }
        } else {
          updatedQuarterStats[quarterIndex] = {
            ...updatedQuarterStats[quarterIndex],
            pointsAllowed: updatedQuarterStats[quarterIndex].pointsAllowed + points,
          }
        }
        
        set({
          currentGame: {
            ...currentGame,
            quarterStats: updatedQuarterStats,
            homeScore: team === 'home' ? currentGame.homeScore + points : currentGame.homeScore,
            awayScore: team === 'away' ? currentGame.awayScore + points : currentGame.awayScore,
          },
        })
      },
      
      // ========== Scoring ==========
      addBonusPoints: (points) => {
        const state = get()
        const { currentGame } = state
        
        if (!currentGame.isActive) return
        
        set({
          currentGame: {
            ...currentGame,
            bonusPoints: currentGame.bonusPoints + points,
          },
        })
      },
      
      // ========== Leaderboard ==========
      fetchLeaderboard: async (week, limit = 50) => {
        set((state) => ({
          leaderboard: {
            ...state.leaderboard,
            isLoading: true,
            error: null,
          },
        }))
        
        try {
          let query = supabase
            .from('game_scores')
            .select('*')
            .order('total_score', { ascending: false })
            .limit(limit)
          
          if (week !== undefined) {
            query = query.eq('week', week)
          }
          
          const { data, error } = await query
          
          if (error) throw error
          
          // Type the raw data from Supabase
          interface GameScoreRow {
            id: string
            player_id: string
            email: string
            username: string | null
            score: number
            total_score: number
            games_won: number
            week: number
            created_at: string
          }
          
          const entries: LeaderboardEntry[] = ((data as GameScoreRow[] | null) || []).map((row, index) => ({
            id: row.id,
            rank: index + 1,
            playerId: row.player_id,
            email: row.email,
            username: row.username || 'Anonymous',
            avatarUrl: null,
            weekScore: row.score,
            totalScore: row.total_score,
            gamesWon: row.games_won,
            avgPasserRating: 0,
            totalTouchdowns: 0,
            week: row.week,
            createdAt: row.created_at,
          }))
          
          set({
            leaderboard: {
              entries,
              userRank: null, // Would need user context to determine
              isLoading: false,
              lastFetched: Date.now(),
              error: null,
            },
          })
        } catch (err) {
          set((state) => ({
            leaderboard: {
              ...state.leaderboard,
              isLoading: false,
              error: err instanceof Error ? err.message : 'Failed to fetch leaderboard',
            },
          }))
        }
      },
      
      submitScore: async (email, username) => {
        const state = get()
        const { currentGame, careerStats } = state
        
        if (!currentGame.weekId) return false
        
        const finalScore = calculateTotalGameScore(
          {
            completions: currentGame.qbStats.completions,
            attempts: currentGame.qbStats.attempts,
            passingYards: currentGame.qbStats.passingYards,
            touchdowns: currentGame.qbStats.touchdowns,
            interceptions: currentGame.qbStats.interceptions,
          },
          currentGame.qbStats.throwQuality,
          currentGame.bonusPoints
        )
        
        try {
          // Use type assertion for untyped Supabase table
          const { error } = await (supabase.from('game_scores') as unknown as {
            insert: (data: Record<string, unknown>) => Promise<{ error: Error | null }>
          }).insert({
            email,
            username,
            week: currentGame.weekId,
            score: finalScore,
            total_score: careerStats.totalGameScore + finalScore,
            games_won: careerStats.gamesWon + (currentGame.homeScore > currentGame.awayScore ? 1 : 0),
          })
          
          if (error) throw error
          
          // Refresh leaderboard after submission
          await get().fetchLeaderboard(currentGame.weekId)
          
          return true
        } catch (err) {
          console.error('Failed to submit score:', err)
          return false
        }
      },
      
      // ========== Selectors ==========
      getCurrentPasserRating: () => {
        const state = get()
        return state.currentGame.qbStats.passerRating
      },
      
      getCurrentGameRating: () => {
        const state = get()
        const { qbStats } = state.currentGame
        
        const pocketStats: PocketStats = {
          avgTimeInPocket: qbStats.avgPocketTimeMs,
          quickReleases: qbStats.quickReleases,
          pressuredThrows: qbStats.pressuredThrows,
          sacksAllowed: qbStats.sacksTaken,
          escapesFromPocket: qbStats.escapesFromPocket,
        }
        
        return calculateGameRating(
          {
            completions: qbStats.completions,
            attempts: qbStats.attempts,
            passingYards: qbStats.passingYards,
            touchdowns: qbStats.touchdowns,
            interceptions: qbStats.interceptions,
          },
          qbStats.throwQuality,
          pocketStats
        )
      },
      
      getTopReceiver: () => {
        const state = get()
        const receivers = Object.values(state.currentGame.receiverStats)
        
        if (receivers.length === 0) return null
        
        return receivers.reduce((top, current) => 
          current.receivingYards > top.receivingYards ? current : top
        )
      },
      
      getGameSummary: () => {
        const state = get()
        const { gameHistory } = state
        
        if (gameHistory.length === 0) return null
        
        return gameHistory[gameHistory.length - 1]
      },
    }),
    {
      name: 'dark-side-v4-stats',
      partialize: (state) => ({
        gameHistory: state.gameHistory,
        careerStats: state.careerStats,
        // Don't persist currentGame - it's session-only
        // Don't persist leaderboard - fetched fresh
      }),
    }
  )
)

// ============================================================================
// Selector Hooks
// ============================================================================

export function useCurrentQBStats() {
  return useStatsStore((state) => state.currentGame.qbStats)
}

export function useCurrentReceiverStats() {
  return useStatsStore((state) => state.currentGame.receiverStats)
}

export function useCurrentQuarterStats() {
  return useStatsStore((state) => state.currentGame.quarterStats)
}

export function useCurrentDrives() {
  return useStatsStore((state) => state.currentGame.drives)
}

export function useGameHistory() {
  return useStatsStore((state) => state.gameHistory)
}

export function useCareerStats() {
  return useStatsStore((state) => state.careerStats)
}

export function useLeaderboard() {
  return useStatsStore((state) => state.leaderboard)
}

export function useCurrentScore() {
  return useStatsStore((state) => ({
    home: state.currentGame.homeScore,
    away: state.currentGame.awayScore,
  }))
}

export function useIsGameActive() {
  return useStatsStore((state) => state.currentGame.isActive)
}

// ============================================================================
// Derived Selectors
// ============================================================================

export function usePasserRatingGrade() {
  const rating = useStatsStore((state) => state.currentGame.qbStats.passerRating)
  return getPasserRatingGrade(rating)
}

export function useStarRating() {
  const store = useStatsStore()
  return getStarRating(store.getCurrentGameRating())
}

export function useCompletionTrend() {
  const passLog = useStatsStore((state) => state.currentGame.qbStats.passLog)
  
  // Return last 5 plays completion status
  return passLog.slice(-5).map(p => p.completed)
}
