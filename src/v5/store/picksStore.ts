/**
 * Picks Store - Zustand store for prop picks state
 * 
 * Manages:
 * - User answers for all 25 picks
 * - Lock status (before/after deadline)
 * - Progress tracking
 * - Current category navigation
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  PickAnswer, 
  PickCategory, 
  PROP_PICKS, 
  getPicksByCategory,
  isAllPicksComplete,
  CATEGORY_ORDER,
} from '../data/propPicks'

// Big Game kickoff time - Sunday Feb 9, 2025 at 3:30 PM PT
// (Adjust this for the actual game date)
export const PICKS_LOCK_TIME = new Date('2026-02-08T18:30:00-05:00').getTime()

export interface TiebreakerScore {
  seattle: number
  patriots: number
}

interface PicksState {
  // User answers
  answers: PickAnswer[]
  tiebreakerScore: TiebreakerScore | null
  
  // UI state
  currentCategory: PickCategory
  currentPickIndex: number // Within category
  
  // Lock state
  lockedAt: number | null
  
  // Actions
  setAnswer: (pickId: string, optionId: string) => void
  setTiebreakerScore: (score: TiebreakerScore) => void
  clearAnswer: (pickId: string) => void
  
  setCurrentCategory: (category: PickCategory) => void
  setCurrentPickIndex: (index: number) => void
  nextPick: () => boolean // Returns false if at end
  prevPick: () => boolean // Returns false if at start
  
  lockPicks: () => void
  resetPicks: () => void
  
  // Computed
  isLocked: () => boolean
  isComplete: () => boolean
  getProgress: () => { answered: number; total: number }
  getCategoryProgress: (category: PickCategory) => { answered: number; total: number }
  getTimeUntilLock: () => number // milliseconds
  getAnswerForPick: (pickId: string) => PickAnswer | undefined
}

export const usePicksStore = create<PicksState>()(
  persist(
    (set, get) => ({
      // Initial state
      answers: [],
      tiebreakerScore: null,
      currentCategory: 'game',
      currentPickIndex: 0,
      lockedAt: null,

      // Set/update an answer
      setAnswer: (pickId, optionId) => {
        const { answers, isLocked } = get()
        
        // Don't allow changes after lock
        if (isLocked()) return
        
        const now = Date.now()
        const existingIndex = answers.findIndex(a => a.pickId === pickId)
        
        if (existingIndex >= 0) {
          // Update existing answer
          const newAnswers = [...answers]
          newAnswers[existingIndex] = {
            pickId,
            optionId,
            answeredAt: now,
          }
          set({ answers: newAnswers })
        } else {
          // Add new answer
          set({
            answers: [...answers, {
              pickId,
              optionId,
              answeredAt: now,
            }]
          })
        }
      },

      // Set tiebreaker score
      setTiebreakerScore: (score) => {
        const { isLocked } = get()
        if (isLocked()) return
        
        set({ tiebreakerScore: score })
        
        // Also add as a regular answer for tracking
        const totalScore = score.seattle + score.patriots
        set(state => {
          const answers = [...state.answers]
          const existingIndex = answers.findIndex(a => a.pickId === 'final-score')
          const answer: PickAnswer = {
            pickId: 'final-score',
            optionId: `${score.seattle}-${score.patriots}`,
            value: totalScore,
            answeredAt: Date.now(),
          }
          
          if (existingIndex >= 0) {
            answers[existingIndex] = answer
          } else {
            answers.push(answer)
          }
          
          return { answers }
        })
      },

      // Clear a specific answer
      clearAnswer: (pickId) => {
        const { answers, isLocked } = get()
        if (isLocked()) return
        
        set({
          answers: answers.filter(a => a.pickId !== pickId)
        })
      },

      // Navigation
      setCurrentCategory: (category) => {
        set({ currentCategory: category, currentPickIndex: 0 })
      },

      setCurrentPickIndex: (index) => {
        set({ currentPickIndex: index })
      },

      nextPick: () => {
        const { currentCategory, currentPickIndex } = get()
        const categoryPicks = getPicksByCategory(currentCategory)
        
        if (currentPickIndex < categoryPicks.length - 1) {
          // More picks in current category
          set({ currentPickIndex: currentPickIndex + 1 })
          return true
        } else {
          // Move to next category
          const currentCategoryIndex = CATEGORY_ORDER.indexOf(currentCategory)
          if (currentCategoryIndex < CATEGORY_ORDER.length - 1) {
            const nextCategory = CATEGORY_ORDER[currentCategoryIndex + 1]
            set({ currentCategory: nextCategory, currentPickIndex: 0 })
            return true
          }
        }
        
        return false // At the end
      },

      prevPick: () => {
        const { currentCategory, currentPickIndex } = get()
        
        if (currentPickIndex > 0) {
          // More picks in current category
          set({ currentPickIndex: currentPickIndex - 1 })
          return true
        } else {
          // Move to previous category
          const currentCategoryIndex = CATEGORY_ORDER.indexOf(currentCategory)
          if (currentCategoryIndex > 0) {
            const prevCategory = CATEGORY_ORDER[currentCategoryIndex - 1]
            const prevCategoryPicks = getPicksByCategory(prevCategory)
            set({ 
              currentCategory: prevCategory, 
              currentPickIndex: prevCategoryPicks.length - 1 
            })
            return true
          }
        }
        
        return false // At the start
      },

      // Lock picks
      lockPicks: () => {
        const { isComplete } = get()
        if (isComplete()) {
          set({ lockedAt: Date.now() })
        }
      },

      // Reset all picks
      resetPicks: () => {
        set({
          answers: [],
          tiebreakerScore: null,
          currentCategory: 'game',
          currentPickIndex: 0,
          lockedAt: null,
        })
      },

      // Computed values
      isLocked: () => {
        const { lockedAt } = get()
        const now = Date.now()
        
        // Locked if manually locked OR past deadline
        return lockedAt !== null || now >= PICKS_LOCK_TIME
      },

      isComplete: () => {
        const { answers, tiebreakerScore } = get()
        // Need all picks answered AND tiebreaker filled
        return isAllPicksComplete(answers) && tiebreakerScore !== null
      },

      getProgress: () => {
        const { answers } = get()
        return {
          answered: answers.length,
          total: PROP_PICKS.length,
        }
      },

      getCategoryProgress: (category) => {
        const { answers } = get()
        const categoryPicks = getPicksByCategory(category)
        const answeredCount = categoryPicks.filter(pick =>
          answers.some(a => a.pickId === pick.id)
        ).length
        
        return {
          answered: answeredCount,
          total: categoryPicks.length,
        }
      },

      getTimeUntilLock: () => {
        const now = Date.now()
        return Math.max(0, PICKS_LOCK_TIME - now)
      },

      getAnswerForPick: (pickId) => {
        const { answers } = get()
        return answers.find(a => a.pickId === pickId)
      },
    }),
    {
      name: 'drinksip-picks-storage',
      partialize: (state) => ({
        answers: state.answers,
        tiebreakerScore: state.tiebreakerScore,
        lockedAt: state.lockedAt,
      }),
    }
  )
)

// Selector hooks
export const usePicksProgress = () => usePicksStore(state => state.getProgress())
export const useIsPicksLocked = () => usePicksStore(state => state.isLocked())
export const useIsPicksComplete = () => usePicksStore(state => state.isComplete())
export const usePicksAnswers = () => usePicksStore(state => state.answers)
export const useTiebreakerScore = () => usePicksStore(state => state.tiebreakerScore)
export const useCurrentPick = () => {
  const category = usePicksStore(state => state.currentCategory)
  const index = usePicksStore(state => state.currentPickIndex)
  const categoryPicks = getPicksByCategory(category)
  return categoryPicks[index] || null
}

// Format time until lock for display
export function formatTimeUntilLock(ms: number): string {
  if (ms <= 0) return 'Locked'
  
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) {
    return `${days}d ${hours % 24}h`
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}
