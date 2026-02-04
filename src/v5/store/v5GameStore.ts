/**
 * V5 Game Store - Compatibility Layer
 * 
 * Re-exports V4 store with V5-friendly naming.
 * Uses CAMPAIGN_STAGES (20 real games) not simplified weeks.
 * 
 * V5 adds:
 * - Entry tracking (totalEntries, shareBonusUsed)
 * - Session management (hideBottomNav, startGameSession, endGameSession)
 * - Drawing countdown
 */

import { useState, useEffect, useMemo } from 'react'

import { 
  useGameStore,
  useCampaign,
  useTotalEntries,
  useHideBottomNav,
  useSession,
  useAllStageProgress,
  type GameSession,
  type CampaignProgress,
  type StageProgress,
} from '@/src/store/gameStore'

import { 
  CAMPAIGN_STAGES, 
  CampaignStage,
  getStageById,
  TOTAL_STAGES,
} from '@/src/game/data/campaign'

// Re-export the main store
export { useGameStore }
export { useGameStore as useV5GameStore }

// Re-export types
export type { GameSession, CampaignProgress, StageProgress, CampaignStage }

// Re-export campaign data
export { CAMPAIGN_STAGES, getStageById, TOTAL_STAGES }

// ============================================
// V5 Compatibility Hooks
// ============================================

/**
 * Get hide bottom nav state from session
 */
export function useV5HideBottomNav(): boolean {
  return useHideBottomNav()
}

/**
 * Get total entries
 */
export function useV5Entries(): number {
  return useTotalEntries()
}

/**
 * Get campaign progress in V5 format
 * Uses direct store selector to avoid infinite loops
 */
export function useV5Campaign() {
  return useGameStore((state) => {
    const campaign = state.campaign
    const stageProgress = campaign.stageProgress || {}
    
    // Calculate completed stages (either mode completed)
    const completedWeekIds = Object.keys(stageProgress)
      .map(Number)
      .filter(id => {
        const progress = stageProgress[id]
        return progress?.qbCompleted || progress?.defenseCompleted
      })
    
    return {
      currentWeek: campaign.currentStageId,
      completedWeeks: completedWeekIds,
      totalWins: campaign.gamesWon,
      totalLosses: 0,
      progress: Math.round((completedWeekIds.length / TOTAL_STAGES) * 100),
      totalScore: campaign.totalScore,
    }
  })
}

/**
 * Get drawing countdown - static calculation (use useMemo in component for live updates)
 * Drawing is Saturday Feb 8, 2026 at 2 PM PST
 */
export function getDrawingCountdown() {
  const drawingDate = new Date('2026-02-08T14:00:00-08:00')
  const now = new Date()
  const diff = drawingDate.getTime() - now.getTime()
  
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true }
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  return { days, hours, minutes, seconds, isLive: false }
}

/**
 * Hook for drawing countdown - updates every minute
 * Use this in components that need live countdown
 */
export function useV5Drawing() {
  const [tick, setTick] = useState(0)
  
  // Update every minute
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000)
    return () => clearInterval(interval)
  }, [])
  
  // Memoize to prevent unnecessary re-renders
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => getDrawingCountdown(), [tick])
}

/**
 * Check if a stage is unlocked
 */
export function useV5IsStageUnlocked(stageId: number): boolean {
  const campaign = useCampaign()
  return campaign.stagesUnlocked.includes(stageId)
}

/**
 * Check if a stage is completed (either mode)
 */
export function useV5IsStageCompleted(stageId: number): boolean {
  const stageProgress = useAllStageProgress()
  const progress = stageProgress[stageId]
  return progress?.qbCompleted || progress?.defenseCompleted || false
}

/**
 * Get stage result (for results page)
 */
export function useV5StageResult(stageId: number) {
  const stageProgress = useAllStageProgress()
  const progress = stageProgress[stageId]
  
  if (!progress) return null
  
  return {
    qbCompleted: progress.qbCompleted,
    defenseCompleted: progress.defenseCompleted,
    qbScore: progress.qbHighScore,
    defenseScore: progress.defenseHighScore,
    qbStars: progress.qbStars,
    defenseStars: progress.defenseStars,
  }
}

/**
 * Get current stage info
 */
export function useV5CurrentStage(): CampaignStage | undefined {
  const campaign = useCampaign()
  return getStageById(campaign.currentStageId)
}

// ============================================
// Helper to get stage label
// ============================================

export function getStageLabel(stage: CampaignStage): string {
  if (stage.isSuperBowl) return 'The Big Game'
  if (stage.isPlayoff) return stage.weekLabel
  return `Week ${stage.id}`
}

export function getStageDifficultyStars(stage: CampaignStage): string {
  const stars = Math.min(5, Math.ceil(stage.difficulty / 2))
  return '★'.repeat(stars) + '☆'.repeat(5 - stars)
}
