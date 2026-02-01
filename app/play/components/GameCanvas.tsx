'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GameHUD } from '@/components/game/GameHUD'
import { GameOver } from '@/components/game/GameOver'
import { PauseMenu } from '@/components/game/PauseMenu'
import { Leaderboard } from '@/components/game/Leaderboard'
import { UpgradeSelect } from '@/components/game/UpgradeSelect'
import { CampaignVictory } from '@/components/game/CampaignVictory'
import { BossIntro } from '@/components/game/BossIntro'
import { StageBanner } from '@/components/game/StageBanner'
import { CameraStream } from './CameraStream'
import { AROverlay } from './AROverlay'
import { useGyroscope } from '../hooks/useGyroscope'
import { useGameStore, useArMode } from '@/src/store/gameStore'

interface GameCanvasProps {
  onChangePlayer?: () => void
}

export default function GameCanvas({ onChangePlayer }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [gameLoaded, setGameLoaded] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const gameRef = useRef<any>(null)
  const gameInitializedRef = useRef(false)

  const lives = useGameStore((s) => s.lives)
  const resetGame = useGameStore((s) => s.resetGame)
  const setArMode = useGameStore((s) => s.setArMode)
  
  // AR Mode state
  const arMode = useArMode()
  const isArEnabled = arMode.enabled
  
  // Gyroscope for AR parallax effect (only when camera is ready)
  const gyro = useGyroscope(isArEnabled && cameraReady)

  // Watch for game over (lives = 0)
  useEffect(() => {
    if (gameLoaded && lives <= 0) {
      setIsGameOver(true)
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
    // Clean up AR mode before leaving
    setArMode(false)
    setCameraReady(false)
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }, [setArMode])

  const handlePlayAgain = useCallback(() => {
    setIsGameOver(false)
    resetGame()
    if (gameRef.current) {
      gameRef.current.scene.stop('GameScene')
      gameRef.current.scene.start('GameScene')
    }
  }, [resetGame])

  const handleChangePlayer = useCallback(() => {
    // Clean up AR mode before leaving
    setArMode(false)
    setCameraReady(false)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('selectedDefender')
      window.location.reload()
    }
  }, [setArMode])

  // Handle camera ready state
  const handleCameraReady = useCallback(() => {
    setCameraReady(true)
  }, [])

  // Handle camera error or disable
  const handleCameraDisabled = useCallback(() => {
    setCameraReady(false)
  }, [])

  // Initialize Phaser game ONCE (not on AR toggle)
  useEffect(() => {
    if (gameInitializedRef.current) return
    
    let isMounted = true
    
    const initGame = async () => {
      if (typeof window === 'undefined') return
      if (!containerRef.current) return

      try {
        const { createGame } = await import('../../../src/game/main')
        
        if (!isMounted) return
        
        await new Promise((resolve) => setTimeout(resolve, 50))
        
        if (!isMounted) return
        
        // Create game with transparent canvas - AR is handled dynamically
        gameRef.current = createGame()
        gameInitializedRef.current = true
        setGameLoaded(true)

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
      // Clean up AR when component unmounts
      setArMode(false)
      if (gameRef.current) {
        import('../../../src/game/main').then(({ destroyGame }) => {
          destroyGame()
          gameRef.current = null
          gameInitializedRef.current = false
        })
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // Clean up camera when AR is disabled
  useEffect(() => {
    if (!isArEnabled) {
      setCameraReady(false)
    }
  }, [isArEnabled])

  return (
    <div 
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{
        height: '100dvh',
        width: '100vw',
        backgroundColor: '#002244',
      }}
    >
      {/* AR Camera Stream Layer (z-index: 0) */}
      <CameraStream 
        isActive={isArEnabled}
        onCameraReady={handleCameraReady}
        onCameraDisabled={handleCameraDisabled}
      />

      {/* Background layer - shows when camera not ready in AR mode */}
      <AnimatePresence>
        {(!isArEnabled || !cameraReady) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0"
            style={{ 
              backgroundColor: '#002244',
              zIndex: 1,
            }}
          />
        )}
      </AnimatePresence>

      {/* Game Container (z-index: 10) */}
      <motion.div
        ref={containerRef}
        id="game-container"
        className="flex-1 flex items-center justify-center w-full"
        style={{
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          minHeight: 0,
          zIndex: 10,
          position: 'relative',
        }}
        animate={{
          // Gyroscope parallax only when AR is fully active
          rotateY: isArEnabled && cameraReady && gyro.isActive ? gyro.tiltX * 3 : 0,
          rotateX: isArEnabled && cameraReady && gyro.isActive ? -gyro.tiltY * 2 : 0,
          x: isArEnabled && cameraReady && gyro.isActive ? gyro.tiltX * 8 : 0,
          y: isArEnabled && cameraReady && gyro.isActive ? gyro.tiltY * 5 : 0,
          // Scale down slightly in AR mode for floating effect
          scale: isArEnabled && cameraReady ? 0.92 : 1,
        }}
        transition={{ 
          type: 'spring', 
          stiffness: 200, 
          damping: 30,
          mass: 0.5,
        }}
      />

      {/* AR Overlay - only show when camera is ready */}
      <AROverlay isActive={isArEnabled && cameraReady} />

      {/* AR Mode indicator glow around game */}
      <AnimatePresence>
        {isArEnabled && cameraReady && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none"
            style={{ 
              zIndex: 9,
              boxShadow: 'inset 0 0 100px rgba(105,190,40,0.1)',
            }}
          />
        )}
      </AnimatePresence>

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

      {/* Upgrade Selection Modal (between waves) */}
      <UpgradeSelect />

      {/* Campaign Victory Modal */}
      <CampaignVictory />

      {/* Boss Wave Intro */}
      <BossIntro />

      {/* Stage Banner */}
      <StageBanner />

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
            onClick={(e) => {
              e.preventDefault()
              handleQuit()
            }}
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
