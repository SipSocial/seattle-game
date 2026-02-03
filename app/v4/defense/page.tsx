'use client'

/**
 * V4 Defense Game Page
 * 
 * The blockbuster horde-style defense game where you control a defender
 * and tackle waves of runners. Premium mobile-first design.
 * 
 * NEW: Properly stops music, tracks dual progress, mobile-optimized.
 */

import { Suspense, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { LoadingSpinner } from '@/components/ui'
import { SoundtrackManager } from '@/src/game/systems/SoundtrackManager'
import { useGameStore } from '@/src/store/gameStore'

// Dynamic import for Phaser game - no SSR
const GameCanvas = dynamic(
  () => import('../../play/components/GameCanvas'),
  { 
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'var(--seahawks-navy-dark, #002244)' }}>
        <LoadingSpinner size="xl" text="Loading Defense Mode..." />
      </div>
    ),
  }
)

function DefenseGameContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const weekId = parseInt(searchParams.get('weekId') || '1', 10)
  
  const setPlayMode = useGameStore((state) => state.setPlayMode)
  const completeStageDefense = useGameStore((state) => state.completeStageDefense)
  
  // Stop music on mount and set play mode
  useEffect(() => {
    // Stop all music
    SoundtrackManager.stop()
    
    // Also stop any other audio elements
    if (typeof document !== 'undefined') {
      const audioElements = document.querySelectorAll('audio')
      audioElements.forEach(audio => {
        if (!audio.hasAttribute('data-game-audio')) {
          audio.pause()
          audio.currentTime = 0
        }
      })
    }
    
    // Set the play mode
    setPlayMode('defense')
  }, [setPlayMode])
  
  // Handle game completion - called from GameCanvas
  const handleGameComplete = useCallback((score: number, won: boolean) => {
    if (won) {
      // Calculate stars based on score
      const stars = score >= 10000 ? 3 : score >= 5000 ? 2 : score > 0 ? 1 : 0
      completeStageDefense(weekId, score, stars as 0 | 1 | 2 | 3)
    }
    
    // Navigate to results or giveaway
    router.push('/v4/giveaway')
  }, [weekId, completeStageDefense, router])
  
  // Store the callback in window for GameCanvas to access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as unknown as Record<string, unknown>).onDefenseGameComplete = handleGameComplete
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as unknown as Record<string, unknown>).onDefenseGameComplete
      }
    }
  }, [handleGameComplete])

  return (
    <motion.div
      className="fixed inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ background: 'var(--seahawks-navy-dark, #002244)' }}
    >
      <GameCanvas />
    </motion.div>
  )
}

export default function DefenseGamePage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'var(--seahawks-navy-dark, #002244)' }}>
        <LoadingSpinner size="xl" text="Loading Defense Mode..." />
      </div>
    }>
      <DefenseGameContent />
    </Suspense>
  )
}
