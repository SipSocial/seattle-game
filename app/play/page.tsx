'use client'

import dynamic from 'next/dynamic'
import { Suspense, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PlayerSelect from './components/PlayerSelect'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

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
  ease: [0.4, 0, 0.2, 1], // Smooth easing
}

export default function PlayPage() {
  const [gameState, setGameState] = useState<'select' | 'playing'>('select')

  const handlePlayerSelect = useCallback((jersey: number) => {
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
    
    // Transition to game immediately (PlayerSelect handles its own exit animation)
    setGameState('playing')
  }, [])

  const handleChangePlayer = useCallback(() => {
    setGameState('select')
  }, [])

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
    </AnimatePresence>
  )
}
