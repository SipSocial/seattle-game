'use client'

/**
 * V5 Campaign Map - Uses production CampaignMapV2 component
 * 
 * Full reuse of V4's production-quality map:
 * - Flight path with draggable airplane
 * - Dual completion badges (QB/Defense)
 * - City markers with unlock states
 * - Location picker modal for multi-game cities
 */

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { CampaignMapV2 } from '@/components/game/CampaignMapV2'
import { useGameStore } from '@/src/store/gameStore'
import { GENERATED_ASSETS } from '@/src/game/data/campaignAssets'

export default function V5CampaignMapPage() {
  const router = useRouter()
  const setGameMode = useGameStore((state) => state.setGameMode)
  
  // Handle stage selection - navigate to V5 game with weekId
  const handleSelectStage = useCallback((stageId: number) => {
    // Ensure campaign mode is set
    setGameMode('campaign')
    
    // Store the week in localStorage for game to access
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentWeekId', stageId.toString())
    }
    
    // Navigate to V5 player select, then to defense game
    router.push(`/v5/game/defense/select?weekId=${stageId}`)
  }, [setGameMode, router])
  
  // Handle back navigation
  const handleBack = useCallback(() => {
    router.push('/v5/game')
  }, [router])
  
  return (
    <CampaignMapV2
      onSelectStage={handleSelectStage}
      onBack={handleBack}
      airplaneUrl={GENERATED_ASSETS.airplaneUrl}
      mapImageUrl={GENERATED_ASSETS.mapImageUrl}
    />
  )
}
