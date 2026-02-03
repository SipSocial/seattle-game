'use client'

/**
 * Play Page - Simplified Player Selection
 * 
 * NEW Flow (game type selected on homepage):
 * 1. Read game mode from store (qb or defense)
 * 2. Show only relevant players (offense for QB, defense for Defense)
 * 3. Single selection, then navigate directly to game
 */

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import PlayerSelect from './components/PlayerSelect'
import { LoadingSpinner, SoundtrackPlayer } from '@/components/ui'
import { useGlobalAudioUnlock } from './hooks/useAudio'
import { SoundtrackManager } from '@/src/game/systems/SoundtrackManager'
import { useSoundtrackStore } from '@/src/store/soundtrackStore'
import { useGameStore } from '@/src/store/gameStore'

// Page states
type PageState = 'player-select' | 'loading'

// Smooth page transition variants
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

const pageTransition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1] as const,
}

export default function PlayPage() {
  const router = useRouter()
  const [pageState, setPageState] = useState<PageState>('player-select')
  const musicEnabled = useSoundtrackStore((state) => state.musicEnabled)
  const closePlayer = useSoundtrackStore((state) => state.closePlayer)
  
  // Get the game mode that was selected on the homepage
  const playMode = useGameStore((state) => state.playMode)
  const setSelectedDefender = useGameStore((state) => state.setSelectedDefender)
  const setSelectedOffense = useGameStore((state) => state.setSelectedOffense)
  
  // Initialize audio system and set up global unlock on first interaction
  useGlobalAudioUnlock()
  
  // Redirect to homepage if no game mode selected
  useEffect(() => {
    if (!playMode) {
      router.push('/')
    }
  }, [playMode, router])
  
  // Start player select music when entering this page
  useEffect(() => {
    SoundtrackManager.init()
    if (musicEnabled) {
      SoundtrackManager.playForScreen('playerSelect', { crossfade: true })
      const currentView = useSoundtrackStore.getState().playerView
      if (currentView === 'hidden') {
        useSoundtrackStore.getState().setPlayerView('mini')
      }
    }
  }, [musicEnabled])

  // Handle player selection complete - navigate directly to game
  const handlePlayerSelect = useCallback(async (selectedJersey: number) => {
    setPageState('loading')
    
    // Store selection in localStorage for Phaser to read
    if (typeof window !== 'undefined') {
      if (playMode === 'qb') {
        localStorage.setItem('selectedOffense', String(selectedJersey))
        setSelectedOffense(selectedJersey)
      } else {
        localStorage.setItem('selectedDefender', String(selectedJersey))
        setSelectedDefender(selectedJersey)
      }
    }
    
    // Stop music with whistle transition
    await SoundtrackManager.stopWithWhistle()
    
    // Hide the player UI during gameplay
    closePlayer()
    
    // Get week ID for campaign context
    const weekId = typeof window !== 'undefined' 
      ? localStorage.getItem('currentWeekId') || '1'
      : '1'
    
    // Navigate to appropriate game based on mode selected on homepage
    if (playMode === 'qb') {
      router.push(`/v4/qb-game?weekId=${weekId}`)
    } else {
      router.push('/v4/defense')
    }
  }, [playMode, closePlayer, router, setSelectedDefender, setSelectedOffense])
  
  // Don't render if no game mode
  if (!playMode) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#002244]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      {pageState === 'loading' && (
        <motion.div 
          key="loading"
          className="fixed inset-0 flex items-center justify-center"
          style={{ background: 'var(--seahawks-navy-dark, #002244)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <LoadingSpinner size="xl" text="Entering Game..." />
        </motion.div>
      )}
      
      {pageState === 'player-select' && (
        <motion.div
          key="player-select"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
          className="fixed inset-0"
        >
          <PlayerSelect 
            gameMode={playMode}
            onSelect={handlePlayerSelect} 
          />
        </motion.div>
      )}
      
      {/* Soundtrack Player - slim bar at very bottom during selection */}
      {pageState !== 'loading' && <SoundtrackPlayer />}
    </AnimatePresence>
  )
}
