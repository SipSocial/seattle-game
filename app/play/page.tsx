'use client'

import dynamic from 'next/dynamic'
import { Suspense, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PlayerSelect from './components/PlayerSelect'
import { LoadingSpinner, SoundtrackPlayer } from '@/components/ui'
import { useGlobalAudioUnlock } from './hooks/useAudio'
import { SoundtrackManager } from '@/src/game/systems/SoundtrackManager'
import { useSoundtrackStore } from '@/src/store/soundtrackStore'

// Dynamically import the game component with no SSR
const GameCanvas = dynamic(() => import('./components/GameCanvas'), {
  ssr: false,
  loading: () => (
    <motion.div 
      className="fixed inset-0 bg-[#002244] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <LoadingSpinner size="xl" text="Loading Game..." />
    </motion.div>
  ),
})

// Smooth page transition variants
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

const pageTransition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1] as const, // Smooth easing (typed as tuple)
}

export default function PlayPage() {
  const [gameState, setGameState] = useState<'select' | 'playing'>('select')
  const musicEnabled = useSoundtrackStore((state) => state.musicEnabled)
  const closePlayer = useSoundtrackStore((state) => state.closePlayer)
  
  // Initialize audio system and set up global unlock on first interaction
  useGlobalAudioUnlock()
  
  // Start player select music when entering this page
  useEffect(() => {
    SoundtrackManager.init()
    if (musicEnabled && gameState === 'select') {
      // Crossfade from home music to player select music
      SoundtrackManager.playForScreen('playerSelect', { crossfade: true })
      // Ensure mini player is visible
      const currentView = useSoundtrackStore.getState().playerView
      if (currentView === 'hidden') {
        useSoundtrackStore.getState().setPlayerView('mini')
      }
    }
  }, [musicEnabled, gameState])

  const handlePlayerSelect = useCallback(async (jersey: number) => {
    // Store selection in localStorage for Phaser to read
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedDefender', String(jersey))
      // Also update zustand store directly
      try {
        const { useGameStore } = require('../../src/store/gameStore')
        useGameStore.getState().setSelectedDefender(jersey)
      } catch (e) {
        // Store not available yet
      }
    }
    
    // Stop music with whistle transition before game starts
    await SoundtrackManager.stopWithWhistle()
    
    // Hide the player UI during gameplay
    closePlayer()
    
    // Transition to game immediately (PlayerSelect handles its own exit animation)
    setGameState('playing')
  }, [closePlayer])

  const handleChangePlayer = useCallback(() => {
    setGameState('select')
    // Resume player select music when going back to selection
    if (musicEnabled) {
      SoundtrackManager.playForScreen('playerSelect')
      // Re-show the mini player
      useSoundtrackStore.getState().setPlayerView('mini')
    }
  }, [musicEnabled])

  return (
    <AnimatePresence mode="wait">
      {gameState === 'select' ? (
        <motion.div
          key="player-select"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
          className="fixed inset-0"
        >
          <PlayerSelect onSelect={handlePlayerSelect} />
        </motion.div>
      ) : (
        <motion.div
          key="game-canvas"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
          className="fixed inset-0"
        >
          <Suspense
            fallback={
              <motion.div 
                className="fixed inset-0 bg-[#002244] flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <LoadingSpinner size="xl" text="Loading..." />
              </motion.div>
            }
          >
            <GameCanvas onChangePlayer={handleChangePlayer} />
          </Suspense>
        </motion.div>
      )}
      
      {/* Soundtrack Player - slim variant for player select, sits at very bottom */}
      {gameState === 'select' && <SoundtrackPlayer position="bottom" offset={0} variant="slim" />}
    </AnimatePresence>
  )
}
