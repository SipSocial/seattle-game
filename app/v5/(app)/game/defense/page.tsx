'use client'

/**
 * V5 Dark Side Defense Game Page
 * 
 * Full-screen Phaser game integration:
 * - Stage transition before game
 * - Dynamic import for Phaser (no SSR)
 * - Hides bottom nav during gameplay
 * - Emits game end event to React
 * - Navigates to results on completion
 * - Uses V4 gameStore for proper state management
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

// Dynamic import for Phaser game - no SSR
const GameCanvas = dynamic(
  () => import('@/app/play/components/GameCanvas'),
  { 
    ssr: false,
    loading: () => (
      <div 
        className="fixed inset-0 flex items-center justify-center" 
        style={{ background: 'var(--seahawks-navy-dark, #002244)' }}
      >
        <LoadingSpinner size="xl" text="Loading Dark Side Defense..." />
      </div>
    ),
  }
)

function DefenseGameContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const weekId = parseInt(searchParams.get('weekId') || '1', 10)
  const selectedPlayer = parseInt(searchParams.get('player') || '54', 10) // Default to Bobby Wagner #54
  
  // Get stage info for transition
  const stage = getStageById(weekId)
  
  // Use V4 store with V5 session extensions
  const startGameSession = useGameStore((state) => state.startGameSession)
  const endGameSession = useGameStore((state) => state.endGameSession)
  const setHideBottomNav = useGameStore((state) => state.setHideBottomNav)
  const completeStageDefense = useGameStore((state) => state.completeStageDefense)
  const setSelectedDefender = useGameStore((state) => state.setSelectedDefender)
  
  const [showTransition, setShowTransition] = useState(true)
  const [isExiting, setIsExiting] = useState(false)
  const gameEndedRef = useRef(false)
  
  // Hide bottom nav and stop music on mount
  useEffect(() => {
    // Hide bottom nav
    setHideBottomNav(true)
    
    // Set selected player from URL param - BOTH store AND localStorage
    // The game's main.ts checks localStorage to skip boot scene
    setSelectedDefender(selectedPlayer)
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedDefender', selectedPlayer.toString())
      // Also signal campaign mode so main.ts doesn't override to endless
      localStorage.setItem('gameMode', 'campaign')
    }
    
    // Start game session with stage ID
    startGameSession('defense', weekId)
    
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
  }, [setHideBottomNav, setSelectedDefender, selectedPlayer, startGameSession, weekId])
  
  // Handle game completion - called from GameCanvas via window
  const handleGameComplete = useCallback((score: number, won: boolean, stats?: {
    tackles?: number
    sacks?: number
    interceptions?: number
    passBreakups?: number
    yardsAllowed?: number
    touchdownsAllowed?: number
  }) => {
    if (gameEndedRef.current) return
    gameEndedRef.current = true
    
    // Calculate stars based on score
    const stars: 0 | 1 | 2 | 3 = score >= 10000 ? 3 : score >= 5000 ? 2 : score > 0 ? 1 : 0
    
    // Complete stage in V4 store (unlocks next stage, tracks progress)
    if (won) {
      completeStageDefense(weekId, score, stars)
    }
    
    // End the game session (tracks entries, updates session state)
    endGameSession({
      tackles: stats?.tackles || 0,
      sacks: stats?.sacks || 0,
      interceptions: stats?.interceptions || 0,
      passBreakups: stats?.passBreakups || 0,
      yardsAllowed: stats?.yardsAllowed || 0,
      touchdownsAllowed: stats?.touchdownsAllowed || 0,
      score,
      won,
    })
    
    // Navigate to results with animation
    setIsExiting(true)
    
    setTimeout(() => {
      const params = new URLSearchParams({
        score: score.toString(),
        won: won.toString(),
        weekId: weekId.toString(),
        tackles: (stats?.tackles || 0).toString(),
        sacks: (stats?.sacks || 0).toString(),
        interceptions: (stats?.interceptions || 0).toString(),
      })
      router.push(`/v5/game/results?${params.toString()}`)
    }, 300)
  }, [weekId, endGameSession, completeStageDefense, router])
  
  // Store the callback in window for GameCanvas/Phaser to access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as unknown as Record<string, unknown>).onDefenseGameComplete = handleGameComplete
      
      // Also listen for custom game end event
      const handleGameEndEvent = (e: CustomEvent) => {
        const { score, won, stats } = e.detail
        handleGameComplete(score, won, stats)
      }
      
      window.addEventListener('v5GameEnd', handleGameEndEvent as EventListener)
      
      return () => {
        delete (window as unknown as Record<string, unknown>).onDefenseGameComplete
        window.removeEventListener('v5GameEnd', handleGameEndEvent as EventListener)
      }
    }
  }, [handleGameComplete])

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
    <div 
      className="fixed inset-0"
      style={{ background: '#002244', zIndex: 100 }}
    >
      <GameCanvas />
      
      {/* Back button (for testing) - positioned in safe area */}
      <button
        onClick={() => {
          setHideBottomNav(false)
          router.push('/v5/game')
        }}
        className="fixed z-[200]"
        style={{
          top: 'calc(env(safe-area-inset-top, 0px) + 12px)',
          right: '12px',
          width: '40px',
          height: '40px',
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          color: 'rgba(255, 255, 255, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </div>
  )
}

export default function DefenseGamePage() {
  return (
    <Suspense fallback={
      <div 
        className="fixed inset-0 flex items-center justify-center" 
        style={{ background: '#002244' }}
      >
        <LoadingSpinner size="xl" text="Loading Dark Side Defense..." />
      </div>
    }>
      <DefenseGameContent />
    </Suspense>
  )
}
