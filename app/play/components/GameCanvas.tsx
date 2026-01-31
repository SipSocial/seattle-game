'use client'

import { useEffect, useRef, useState } from 'react'

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [gameLoaded, setGameLoaded] = useState(false)
  const gameRef = useRef<any>(null)

  useEffect(() => {
    let isMounted = true
    
    // Initialize Phaser game only on client side
    const initGame = async () => {
      if (typeof window === 'undefined') return
      if (gameRef.current) return
      if (!containerRef.current) return

      try {
        // Dynamic import of game module to avoid SSR issues
        const { createGame } = await import('../../../src/game/main')
        
        if (!isMounted) return
        
        // Small delay to ensure container is ready
        await new Promise((resolve) => setTimeout(resolve, 50))
        
        if (!isMounted) return
        
        gameRef.current = createGame()
        setGameLoaded(true)
      } catch (error) {
        console.error('Failed to initialize game:', error)
      }
    }

    initGame()

    // Cleanup on unmount
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
        backgroundColor: 'var(--seahawks-navy)',
      }}
    >
      {/* Game Container - takes full space */}
      <div
        ref={containerRef}
        id="game-container"
        className="flex-1 flex items-center justify-center w-full"
        style={{
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          minHeight: 0, // Important for flex shrinking
        }}
      />

      {/* Back to Menu Link */}
      <div 
        className="absolute z-50"
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
    </div>
  )
}
