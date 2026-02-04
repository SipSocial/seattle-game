'use client'

/**
 * V5 QB Game Page
 * 
 * Wraps the V4 QB game with V5 session management.
 * - Hides bottom nav during gameplay
 * - Routes to V5 results on completion
 * - Integrates with V5 campaign tracking
 */

import { Suspense, useEffect, useCallback, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { LoadingSpinner } from '@/components/ui'
import { StageTransition } from '@/components/game'
import { SoundtrackManager } from '@/src/game/systems/SoundtrackManager'
import { useGameStore } from '@/src/store/gameStore'
import { getStageById } from '@/src/game/data/campaign'

// Dynamic import for QB game - no SSR
const QBGameComponent = dynamic(
  () => import('@/app/v4/qb-game/page').then(mod => ({ default: mod.default })),
  { 
    ssr: false,
    loading: () => (
      <div 
        className="fixed inset-0 flex items-center justify-center" 
        style={{ background: 'var(--seahawks-navy-dark, #002244)' }}
      >
        <LoadingSpinner size="xl" text="Loading QB Legend..." />
      </div>
    ),
  }
)

function QBGameContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const weekId = parseInt(searchParams.get('weekId') || '1', 10)
  
  // Get stage info for transition
  const stage = getStageById(weekId)
  
  // Use V4 store with V5 session extensions
  const startGameSession = useGameStore((state) => state.startGameSession)
  const endGameSession = useGameStore((state) => state.endGameSession)
  const setHideBottomNav = useGameStore((state) => state.setHideBottomNav)
  const completeStageQB = useGameStore((state) => state.completeStageQB)
  
  const [showTransition, setShowTransition] = useState(true)
  const [isExiting, setIsExiting] = useState(false)
  const gameEndedRef = useRef(false)
  
  // Hide bottom nav and stop music on mount
  useEffect(() => {
    // Hide bottom nav
    setHideBottomNav(true)
    
    // Start game session with stage ID
    startGameSession('qb', weekId)
    
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
    
    // Cleanup on unmount
    return () => {
      setHideBottomNav(false)
    }
  }, [setHideBottomNav, startGameSession, weekId])
  
  // Handle game completion - called from QB game via window event
  const handleGameComplete = useCallback((event: CustomEvent<{
    score: number
    won: boolean
    stats: {
      touchdowns: number
      interceptions: number
      yardsGained: number
      completions: number
      attempts: number
    }
  }>) => {
    if (gameEndedRef.current) return
    gameEndedRef.current = true
    
    const { score, won, stats } = event.detail
    
    // Calculate stars based on score
    const stars = score >= 500 ? 3 : score >= 300 ? 2 : score >= 100 ? 1 : 0
    
    // Update campaign progress
    completeStageQB(weekId, score, stars as 0 | 1 | 2 | 3)
    
    // End session
    endGameSession({
      won,
      score,
      tackles: 0,
      sacks: 0,
      interceptions: stats.interceptions,
    })
    
    // Navigate to results with stats
    setIsExiting(true)
    
    setTimeout(() => {
      const params = new URLSearchParams({
        score: score.toString(),
        won: won.toString(),
        weekId: weekId.toString(),
        mode: 'qb',
        touchdowns: stats.touchdowns.toString(),
        interceptions: stats.interceptions.toString(),
        yards: stats.yardsGained.toString(),
        completions: stats.completions.toString(),
        attempts: stats.attempts.toString(),
      })
      router.push(`/v5/game/results?${params.toString()}`)
    }, 500)
  }, [completeStageQB, endGameSession, weekId, router])
  
  // Listen for game end event
  useEffect(() => {
    const handler = (e: Event) => handleGameComplete(e as CustomEvent)
    window.addEventListener('v5-qb-game-complete', handler)
    return () => window.removeEventListener('v5-qb-game-complete', handler)
  }, [handleGameComplete])
  
  // Handle back navigation
  const handleBack = useCallback(() => {
    setHideBottomNav(false)
    router.push('/v5/game')
  }, [router, setHideBottomNav])
  
  // Show StageTransition first, then game
  if (showTransition && stage) {
    return (
      <StageTransition 
        stage={stage}
        autoStartDelay={1500}
        onStart={() => setShowTransition(false)}
      />
    )
  }
  
  return (
    <AnimatePresence mode="wait">
      {isExiting ? (
        <motion.div
          key="exiting"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 flex items-center justify-center"
          style={{ background: '#002244' }}
        >
          <LoadingSpinner size="xl" text="Calculating score..." />
        </motion.div>
      ) : (
        <motion.div
          key="game"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0"
        >
          <QBGameComponent />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function V5QBGamePage() {
  return (
    <Suspense 
      fallback={
        <div 
          className="fixed inset-0 flex items-center justify-center" 
          style={{ background: '#002244' }}
        >
          <LoadingSpinner size="xl" text="Loading QB Legend..." />
        </div>
      }
    >
      <QBGameContent />
    </Suspense>
  )
}
