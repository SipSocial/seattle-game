'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { GameHUD } from '@/components/game/GameHUD'
import { GameOver } from '@/components/game/GameOver'
import { PauseMenu } from '@/components/game/PauseMenu'
import { Leaderboard } from '@/components/game/Leaderboard'
import { useGameStore } from '@/src/store/gameStore'

interface GameCanvasProps {
  onChangePlayer?: () => void
}

export default function GameCanvas({ onChangePlayer }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [gameLoaded, setGameLoaded] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const gameRef = useRef<any>(null)

  const lives = useGameStore((s) => s.lives)
  const resetGame = useGameStore((s) => s.resetGame)

  // Watch for game over (lives = 0)
  useEffect(() => {
    if (gameLoaded && lives <= 0) {
      setIsGameOver(true)
      // Pause the Phaser game
      if (gameRef.current) {
        gameRef.current.scene.pause('GameScene')
      }
    }
  }, [lives, gameLoaded])

  // Handle pause
  const handlePause = useCallback(() => {
    setIsPaused(true)
    if (gameRef.current) {
      gameRef.current.scene.pause('GameScene')
    }
  }, [])

  const handleResume = useCallback(() => {
    setIsPaused(false)
    if (gameRef.current) {
      gameRef.current.scene.resume('GameScene')
    }
  }, [])

  const handleRestart = useCallback(() => {
    setIsPaused(false)
    setIsGameOver(false)
    resetGame()
    if (gameRef.current) {
      gameRef.current.scene.stop('GameScene')
      gameRef.current.scene.start('GameScene')
    }
  }, [resetGame])

  const handleQuit = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }, [])

  const handlePlayAgain = useCallback(() => {
    setIsGameOver(false)
    resetGame()
    if (gameRef.current) {
      gameRef.current.scene.stop('GameScene')
      gameRef.current.scene.start('GameScene')
    }
  }, [resetGame])

  const handleChangePlayer = useCallback(() => {
    // Reload the page to go back to player select
    if (typeof window !== 'undefined') {
      localStorage.removeItem('selectedDefender')
      window.location.reload()
    }
  }, [])

  // Initialize Phaser game
  useEffect(() => {
    let isMounted = true
    
    const initGame = async () => {
      if (typeof window === 'undefined') return
      if (gameRef.current) return
      if (!containerRef.current) return

      try {
        const { createGame } = await import('../../../src/game/main')
        
        if (!isMounted) return
        
        await new Promise((resolve) => setTimeout(resolve, 50))
        
        if (!isMounted) return
        
        gameRef.current = createGame()
        setGameLoaded(true)

        // Listen for game events from Phaser
        if (gameRef.current) {
          gameRef.current.events.on('gameOver', () => {
            setIsGameOver(true)
          })
        }
      } catch (error) {
        console.error('Failed to initialize game:', error)
      }
    }

    initGame()

    return () => {
      isMounted = false
      if (gameRef.current) {
        import('../../../src/game/main').then(({ destroyGame }) => {
          destroyGame()
          gameRef.current = null
        })
      }
    }
  }, [])

  return (
    <div 
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{
        height: '100dvh',
        width: '100vw',
        backgroundColor: '#002244',
      }}
    >
      {/* Game Container */}
      <div
        ref={containerRef}
        id="game-container"
        className="flex-1 flex items-center justify-center w-full"
        style={{
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          minHeight: 0,
        }}
      />

      {/* React HUD Overlay */}
      {gameLoaded && !isGameOver && !isPaused && (
        <GameHUD onPause={handlePause} />
      )}

      {/* Pause Menu */}
      <AnimatePresence>
        {isPaused && (
          <PauseMenu
            isOpen={isPaused}
            onResume={handleResume}
            onRestart={handleRestart}
            onQuit={handleQuit}
          />
        )}
      </AnimatePresence>

      {/* Game Over Screen */}
      <AnimatePresence>
        {isGameOver && (
          <GameOver
            isOpen={isGameOver}
            onPlayAgain={handlePlayAgain}
            onChangePlayer={handleChangePlayer}
            onViewLeaderboard={() => setShowLeaderboard(true)}
          />
        )}
      </AnimatePresence>

      {/* Leaderboard Modal */}
      <Leaderboard
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />

      {/* Back to Menu Link (only when playing) */}
      {gameLoaded && !isGameOver && !isPaused && (
        <div 
          className="absolute z-30"
          style={{
            top: 'max(env(safe-area-inset-top), 8px)',
            left: 'max(env(safe-area-inset-left), 8px)',
          }}
        >
          <a
            href="/"
            className="text-white/30 hover:text-white/70 text-xs flex items-center gap-1 transition-colors p-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Exit
          </a>
        </div>
      )}
    </div>
  )
}
