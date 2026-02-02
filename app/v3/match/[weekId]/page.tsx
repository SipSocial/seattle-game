'use client'

/**
 * V3 Match Preview Page
 * 
 * Shows CityPreview modal on a dark background
 * Routes to V3 game when player clicks "Start Game"
 */

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { CityPreview } from '@/components/game/CityPreview'
import { SoundtrackPlayer } from '@/components/ui/SoundtrackPlayer'
import { getStageById, CAMPAIGN_STAGES } from '@/src/game/data/campaign'
import { useGameStore } from '@/src/store/gameStore'

export default function V3MatchPage() {
  const params = useParams()
  const router = useRouter()
  const weekId = parseInt(params.weekId as string) || 1
  
  // Get the stage data
  const stage = getStageById(weekId) || CAMPAIGN_STAGES[0]
  
  // Get campaign state for high scores and unlock status
  const campaign = useGameStore((s) => s.campaign)
  const highScore = campaign.stageHighScores[weekId]
  const isLocked = !campaign.stagesUnlocked.includes(weekId)

  // Modal is always open on this page
  const [isOpen, setIsOpen] = useState(true)

  // When modal closes, go back to map
  const handleClose = () => {
    setIsOpen(false)
    // Small delay for exit animation
    setTimeout(() => {
      router.push('/campaign')
    }, 200)
  }

  // When player clicks play, go to V3 game
  const handlePlay = () => {
    if (!isLocked) {
      router.push(`/v3/game?weekId=${weekId}&mode=season`)
    }
  }

  return (
    <div className="fixed inset-0 bg-[#0a0a0a]">
      {/* City Preview Modal */}
      <CityPreview
        stage={stage}
        isOpen={isOpen}
        onClose={handleClose}
        onPlay={handlePlay}
        highScore={highScore}
        isLocked={isLocked}
      />

      {/* Soundtrack Player */}
      <SoundtrackPlayer />
    </div>
  )
}
