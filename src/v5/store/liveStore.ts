/**
 * Live Store - Zustand store for live questions state
 * 
 * Manages:
 * - Current game/quarter state
 * - Question timing and status
 * - User answers for live questions
 * - Push notification subscription
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Quarter,
  LiveQuestion,
  LiveAnswer,
  LiveQuestionStatus,
  QUARTER_ORDER,
  LIVE_QUESTIONS,
  getQuestionsByQuarter,
  getQuestionById,
  getTotalLiveScore,
} from '../data/liveQuestions'

// Game start time - Sunday Feb 8, 2026 at 6:30 PM ET
export const GAME_START_TIME = new Date('2026-02-08T18:30:00-05:00').getTime()

// Game status
export type GameStatus = 
  | 'pre_game'      // Before kickoff
  | 'in_progress'   // Game is live
  | 'halftime'      // Halftime break
  | 'post_game'     // Game ended

// Question with runtime state
export interface LiveQuestionState {
  question: LiveQuestion
  status: LiveQuestionStatus
  droppedAt?: number      // When question became active
  expiresAt?: number      // When answer window closes
  resolvedAt?: number     // When correct answer was revealed
}

interface LiveState {
  // Game state
  gameStatus: GameStatus
  currentQuarter: Quarter
  
  // Question states
  questionStates: Record<string, LiveQuestionState>
  
  // User answers
  answers: LiveAnswer[]
  
  // Push notifications
  pushEnabled: boolean
  pushSubscription: string | null  // Subscription JSON
  
  // UI state
  selectedQuarter: Quarter
  
  // Actions
  setGameStatus: (status: GameStatus) => void
  setCurrentQuarter: (quarter: Quarter) => void
  setSelectedQuarter: (quarter: Quarter) => void
  
  // Question actions
  dropQuestion: (questionId: string) => void
  lockQuestion: (questionId: string) => void
  resolveQuestion: (questionId: string, correctOptionId: string) => void
  
  // Answer actions
  submitAnswer: (questionId: string, optionId: string) => boolean
  
  // Push actions
  setPushEnabled: (enabled: boolean) => void
  setPushSubscription: (subscription: string | null) => void
  
  // Reset
  resetLive: () => void
  
  // Computed
  getTimeUntilGame: () => number
  getQuestionState: (questionId: string) => LiveQuestionState | undefined
  getTimeRemaining: (questionId: string) => number
  getQuarterQuestions: (quarter: Quarter) => LiveQuestionState[]
  getQuarterScore: (quarter: Quarter) => { correct: number; total: number; points: number }
  getTotalScore: () => number
  hasAnswered: (questionId: string) => boolean
  getAnswer: (questionId: string) => LiveAnswer | undefined
  isQuarterComplete: (quarter: Quarter) => boolean
  isQuarterActive: (quarter: Quarter) => boolean
}

// Initialize question states
function initializeQuestionStates(): Record<string, LiveQuestionState> {
  const states: Record<string, LiveQuestionState> = {}
  
  LIVE_QUESTIONS.forEach(question => {
    states[question.id] = {
      question,
      status: 'pending',
    }
  })
  
  return states
}

export const useLiveStore = create<LiveState>()(
  persist(
    (set, get) => ({
      // Initial state
      gameStatus: 'pre_game',
      currentQuarter: 'Q1',
      questionStates: initializeQuestionStates(),
      answers: [],
      pushEnabled: false,
      pushSubscription: null,
      selectedQuarter: 'Q1',

      // Game state actions
      setGameStatus: (status) => set({ gameStatus: status }),
      
      setCurrentQuarter: (quarter) => set({ 
        currentQuarter: quarter,
        selectedQuarter: quarter,
      }),
      
      setSelectedQuarter: (quarter) => set({ selectedQuarter: quarter }),

      // Question actions
      dropQuestion: (questionId) => {
        const { questionStates } = get()
        const state = questionStates[questionId]
        if (!state) return
        
        const now = Date.now()
        const expiresAt = now + (state.question.timeLimit * 1000)
        
        set({
          questionStates: {
            ...questionStates,
            [questionId]: {
              ...state,
              status: 'active',
              droppedAt: now,
              expiresAt,
            },
          },
        })
      },

      lockQuestion: (questionId) => {
        const { questionStates } = get()
        const state = questionStates[questionId]
        if (!state) return
        
        set({
          questionStates: {
            ...questionStates,
            [questionId]: {
              ...state,
              status: 'locked',
            },
          },
        })
      },

      resolveQuestion: (questionId, correctOptionId) => {
        const { questionStates, answers } = get()
        const state = questionStates[questionId]
        if (!state) return
        
        // Update question state
        const newQuestionStates = {
          ...questionStates,
          [questionId]: {
            ...state,
            status: 'resolved' as const,
            resolvedAt: Date.now(),
            question: {
              ...state.question,
              correctOptionId,
            },
          },
        }
        
        // Update answer correctness
        const newAnswers = answers.map(answer => {
          if (answer.questionId === questionId) {
            return {
              ...answer,
              correct: answer.optionId === correctOptionId,
            }
          }
          return answer
        })
        
        set({
          questionStates: newQuestionStates,
          answers: newAnswers,
        })
      },

      // Answer actions
      submitAnswer: (questionId, optionId) => {
        const { questionStates, answers, hasAnswered } = get()
        const state = questionStates[questionId]
        
        // Validate
        if (!state) return false
        if (state.status !== 'active') return false
        if (hasAnswered(questionId)) return false
        
        // Check time remaining
        const now = Date.now()
        if (state.expiresAt && now > state.expiresAt) return false
        
        // Add answer
        const answer: LiveAnswer = {
          questionId,
          optionId,
          answeredAt: now,
        }
        
        set({ answers: [...answers, answer] })
        return true
      },

      // Push actions
      setPushEnabled: (enabled) => set({ pushEnabled: enabled }),
      setPushSubscription: (subscription) => set({ pushSubscription: subscription }),

      // Reset
      resetLive: () => set({
        gameStatus: 'pre_game',
        currentQuarter: 'Q1',
        questionStates: initializeQuestionStates(),
        answers: [],
        selectedQuarter: 'Q1',
      }),

      // Computed values
      getTimeUntilGame: () => {
        const now = Date.now()
        return Math.max(0, GAME_START_TIME - now)
      },

      getQuestionState: (questionId) => {
        const { questionStates } = get()
        return questionStates[questionId]
      },

      getTimeRemaining: (questionId) => {
        const { questionStates } = get()
        const state = questionStates[questionId]
        
        if (!state || state.status !== 'active' || !state.expiresAt) {
          return 0
        }
        
        const now = Date.now()
        return Math.max(0, state.expiresAt - now)
      },

      getQuarterQuestions: (quarter) => {
        const { questionStates } = get()
        const quarterQuestions = getQuestionsByQuarter(quarter)
        
        return quarterQuestions
          .map(q => questionStates[q.id])
          .filter((s): s is LiveQuestionState => s !== undefined)
      },

      getQuarterScore: (quarter) => {
        const { answers, questionStates } = get()
        const quarterQuestions = getQuestionsByQuarter(quarter)
        
        let correct = 0
        let points = 0
        
        quarterQuestions.forEach(question => {
          const answer = answers.find(a => a.questionId === question.id)
          const state = questionStates[question.id]
          
          if (answer?.correct === true) {
            correct++
            points += question.points
          }
        })
        
        return {
          correct,
          total: quarterQuestions.length,
          points,
        }
      },

      getTotalScore: () => {
        const { answers } = get()
        return getTotalLiveScore(answers)
      },

      hasAnswered: (questionId) => {
        const { answers } = get()
        return answers.some(a => a.questionId === questionId)
      },

      getAnswer: (questionId) => {
        const { answers } = get()
        return answers.find(a => a.questionId === questionId)
      },

      isQuarterComplete: (quarter) => {
        const { questionStates } = get()
        const quarterQuestions = getQuestionsByQuarter(quarter)
        
        return quarterQuestions.every(q => {
          const state = questionStates[q.id]
          return state?.status === 'resolved'
        })
      },

      isQuarterActive: (quarter) => {
        const { currentQuarter, gameStatus } = get()
        return gameStatus === 'in_progress' && currentQuarter === quarter
      },
    }),
    {
      name: 'drinksip-live-storage',
      partialize: (state) => ({
        answers: state.answers,
        pushEnabled: state.pushEnabled,
        pushSubscription: state.pushSubscription,
      }),
    }
  )
)

// Selector hooks
export const useGameStatus = () => useLiveStore(state => state.gameStatus)
export const useCurrentQuarter = () => useLiveStore(state => state.currentQuarter)
export const useSelectedQuarter = () => useLiveStore(state => state.selectedQuarter)
export const usePushEnabled = () => useLiveStore(state => state.pushEnabled)
export const useLiveAnswers = () => useLiveStore(state => state.answers)

// Format countdown for display
export function formatCountdown(ms: number): string {
  if (ms <= 0) return '0:00'
  
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// Format time until game for display
export function formatTimeUntilGame(ms: number): {
  days: number
  hours: number
  minutes: number
  seconds: number
} {
  if (ms <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }
  
  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  
  return { days, hours, minutes, seconds }
}

// Get game start date formatted
export function getGameStartDateFormatted(): string {
  const date = new Date(GAME_START_TIME)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}
