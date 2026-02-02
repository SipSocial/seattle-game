'use client'

/**
 * Play Page - Player Selection + Game Mode Flow
 * 
 * Flow:
 * 1. Player Selection (offense + defense)
 * 2. Game Mode Selection (QB Legend vs Dark Side Defense)
 * 3. Navigate to appropriate game
 */

import { Suspense, useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import PlayerSelect from './components/PlayerSelect'
import GameModeSelect from './components/GameModeSelect'
import { LoadingSpinner, SoundtrackPlayer } from '@/components/ui'
import { useGlobalAudioUnlock } from './hooks/useAudio'
import { SoundtrackManager } from '@/src/game/systems/SoundtrackManager'
import { useSoundtrackStore } from '@/src/store/soundtrackStore'
import { OFFENSE_PLAYERS, DEFENSE_PLAYERS } from '@/src/game/data/playerRosters'

// Page states
type PageState = 'player-select' | 'mode-select' | 'loading'

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
  const [selections, setSelections] = useState<{ offense: number; defense: number } | null>(null)
  const musicEnabled = useSoundtrackStore((state) => state.musicEnabled)
  const closePlayer = useSoundtrackStore((state) => state.closePlayer)
  
  // Initialize audio system and set up global unlock on first interaction
  useGlobalAudioUnlock()
  
  // Get player names for display
  const offensePlayerName = useMemo(() => {
    if (!selections) return undefined
    const player = OFFENSE_PLAYERS.find(p => p.jersey === selections.offense)
    return player?.name
  }, [selections])

  const defensePlayerName = useMemo(() => {
    if (!selections) return undefined
    const player = DEFENSE_PLAYERS.find(p => p.jersey === selections.defense)
    return player?.name
  }, [selections])
  
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

  // Handle player selection complete - move to mode selection
  const handlePlayerSelect = useCallback((playerSelections: { offense: number; defense: number }) => {
    // Store selections
    setSelections(playerSelections)
    
    // Store in localStorage for Phaser to read
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedOffense', String(playerSelections.offense))
      localStorage.setItem('selectedDefender', String(playerSelections.defense))
      
      // Update zustand store
      try {
        const { useGameStore } = require('../../src/store/gameStore')
        useGameStore.getState().setSelectedDefender(playerSelections.defense)
        useGameStore.getState().setSelectedOffense(playerSelections.offense)
      } catch (e) {
        // Store not available yet
      }
    }
    
    // Move to mode selection
    setPageState('mode-select')
  }, [])

  // Handle game mode selection - navigate to game
  const handleModeSelect = useCallback(async (mode: 'qb' | 'defense') => {
    setPageState('loading')
    
    // Update store with play mode
    try {
      const { useGameStore } = require('../../src/store/gameStore')
      useGameStore.getState().setPlayMode(mode)
    } catch (e) {
      // Store not available yet
    }
    
    // Stop music with whistle transition
    await SoundtrackManager.stopWithWhistle()
    
    // Hide the player UI during gameplay
    closePlayer()
    
    // Get week ID for campaign context
    const weekId = typeof window !== 'undefined' 
      ? localStorage.getItem('currentWeekId') || '1'
      : '1'
    
    // Navigate to appropriate game
    if (mode === 'qb') {
      router.push(`/v3/game?weekId=${weekId}`)
    } else {
      router.push('/v4/defense')
    }
  }, [closePlayer, router])

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
          <PlayerSelect onComplete={handlePlayerSelect} />
        </motion.div>
      )}
      
      {pageState === 'mode-select' && (
        <motion.div
          key="mode-select"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
          className="fixed inset-0"
        >
          <GameModeSelect 
            onSelectMode={handleModeSelect}
            offensePlayerName={offensePlayerName}
            defensePlayerName={defensePlayerName}
          />
        </motion.div>
      )}
      
      {/* Soundtrack Player - slim bar at very bottom during selection */}
      {pageState !== 'loading' && <SoundtrackPlayer />}
    </AnimatePresence>
  )
}
