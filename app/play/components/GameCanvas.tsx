'use client'

import { useEffect, useRef, useState } from 'react'

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [gameLoaded, setGameLoaded] = useState(false)
  const gameRef = useRef<any>(null)

  useEffect(() => {
    // Initialize Phaser game only on client side
    const initGame = async () => {
      if (typeof window === 'undefined') return
      if (gameRef.current) return
      if (!containerRef.current) return

      try {
        // Dynamic import of game module to avoid SSR issues
        const { createGame } = await import('../../../src/game/main')
        
        // Small delay to ensure container is ready
        await new Promise((resolve) => setTimeout(resolve, 100))
        
        gameRef.current = createGame()
        setGameLoaded(true)
      } catch (error) {
        console.error('Failed to initialize game:', error)
      }
    }

    initGame()

    // Cleanup on unmount
    return () => {
      const cleanup = async () => {
        if (gameRef.current) {
          const { destroyGame } = await import('../../../src/game/main')
          destroyGame()
          gameRef.current = null
          setGameLoaded(false)
        }
      }
      cleanup()
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#0b1f24] flex flex-col">
      {/* Game Container */}
      <div
        ref={containerRef}
        id="game-container"
        className="flex-1 flex items-center justify-center"
        style={{
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      />

      {/* Back to Menu Link */}
      <div className="absolute top-4 left-4 z-50">
        <a
          href="/"
          className="text-white/30 hover:text-white/70 text-sm flex items-center gap-2 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
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
    </div>
  )
}
