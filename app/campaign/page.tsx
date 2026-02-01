'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CampaignMapV2 } from '@/components/game/CampaignMapV2'
import { SoundtrackPlayer } from '@/components/ui/SoundtrackPlayer'
import { useGameStore } from '@/src/store/gameStore'
import { useSoundtrackStore } from '@/src/store/soundtrackStore'
import { GENERATED_ASSETS } from '@/src/game/data/campaignAssets'
import { AudioManager } from '@/src/game/systems/AudioManager'
import { SoundtrackManager } from '@/src/game/systems/SoundtrackManager'

export default function CampaignPage() {
  const router = useRouter()
  const setGameMode = useGameStore((s) => s.setGameMode)
  const musicEnabled = useSoundtrackStore((s) => s.musicEnabled)
  const [mounted, setMounted] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Initialize audio system
    AudioManager.init()
    SoundtrackManager.init()
    
    // Set up global audio unlock on first user interaction
    const handleInteraction = () => {
      AudioManager.unlock()
      // Start campaign music after first interaction
      if (musicEnabled) {
        SoundtrackManager.playForScreen('campaign', { crossfade: true })
        // Show mini player
        useSoundtrackStore.getState().setPlayerView('mini')
      }
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
    }
    
    if (!AudioManager.isReady()) {
      document.addEventListener('click', handleInteraction, { once: true })
      document.addEventListener('touchstart', handleInteraction, { once: true })
    } else if (musicEnabled) {
      // Audio already unlocked, crossfade to campaign music
      SoundtrackManager.playForScreen('campaign', { crossfade: true })
      // Ensure mini player is visible
      const currentView = useSoundtrackStore.getState().playerView
      if (currentView === 'hidden') {
        useSoundtrackStore.getState().setPlayerView('mini')
      }
    }
    
    return () => {
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
    }
  }, [musicEnabled])

  const handleSelectStage = useCallback((stageId: number) => {
    setIsExiting(true)
    // Set campaign mode and navigate to play
    setGameMode('campaign')
    setTimeout(() => {
      router.push('/play')
    }, 200)
  }, [setGameMode, router])

  const handleBack = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => {
      router.push('/')
    }, 200)
  }, [router])

  return (
    <motion.div
      className="fixed inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: mounted && !isExiting ? 1 : 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <CampaignMapV2 
        onSelectStage={handleSelectStage}
        onBack={handleBack}
        mapImageUrl={GENERATED_ASSETS.mapImageUrl}
        airplaneUrl={GENERATED_ASSETS.airplaneUrl}
      />
      
      {/* Soundtrack Player - slim bar at very bottom */}
      <SoundtrackPlayer />
    </motion.div>
  )
}
