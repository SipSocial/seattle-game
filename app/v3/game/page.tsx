'use client'

/**
 * V3 Game Page - PREMIUM QB GAME
 * 
 * - Full screen Phaser game
 * - Minimal floating HUD (ESPN-style)
 * - Madden-style playbook control panel
 * - Timing-based catch mechanic
 * - Plays unlock as you progress
 * - Proper pause menu and game end handling
 */

import { useEffect, useState, useRef, Suspense, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { getTeamAsset } from '@/src/game/data/teamAssets'
import { SoundtrackManager } from '@/src/game/systems/SoundtrackManager'
import { PlaybookPanel, PLAYBOOK } from './components/PlaybookPanel'
import { PauseMenu } from '@/components/game/PauseMenu'
import { GradientButton } from '@/components/ui/GradientButton'
import { GhostButton } from '@/components/ui/GhostButton'

// ============================================================================
// Types
// ============================================================================

// Maps to PlayState from the state machine
type GamePhase = 
  | 'loading'
  | 'PRE_SNAP'
  | 'SNAP'
  | 'DROPBACK'
  | 'READ'
  | 'THROW'
  | 'BALL_FLIGHT'
  | 'CATCH'
  | 'YAC'
  | 'TOUCHDOWN'
  | 'TACKLED'
  | 'INCOMPLETE'
  | 'SACKED'
  | 'POST_PLAY'
  | 'QUARTER_END'
  | 'GAME_END'

// Old PLAY_CARDS and PlayCardComponent removed - now using PlaybookPanel

// ============================================================================
// Main Component
// ============================================================================

function V3GameContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const weekId = parseInt(searchParams.get('weekId') || '1')
  const gameContainerRef = useRef<HTMLDivElement>(null)
  const phaserGameRef = useRef<Phaser.Game | null>(null)
  
  const teamAsset = getTeamAsset(weekId)
  
  // Game state
  const [phase, setPhase] = useState<GamePhase>('loading')
  const [quarter, setQuarter] = useState(1)
  const [clock, setClock] = useState('1:00') // 1 minute per quarter
  const [score, setScore] = useState({ home: 0, away: 0 })
  const [down, setDown] = useState(1)
  const [yardsToGo, setYardsToGo] = useState(10)
  const [yardLine, setYardLine] = useState(25)
  const [showTouchdown, setShowTouchdown] = useState(false)
  const [lastEvent, setLastEvent] = useState<string | null>(null)
  
  // V2 additions: pressure and Dark Side energy
  const [pressure, setPressure] = useState(0) // 0-1 pressure level
  const [darkSideEnergy, setDarkSideEnergy] = useState(0) // 0-100
  const [darkSideActive, setDarkSideActive] = useState(false)
  
  // Ball flight & catch timing
  const [ballFlightProgress, setBallFlightProgress] = useState(0)
  const [showCatchButton, setShowCatchButton] = useState(false)
  const [isPerfectWindow, setIsPerfectWindow] = useState(false)
  const [catchResult, setCatchResult] = useState<string | null>(null)
  
  // Playbook selection
  const [selectedPlayId, setSelectedPlayId] = useState<string | null>(null)
  
  // Game flow states
  const [isPaused, setIsPaused] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  
  // Stop menu music
  useEffect(() => {
    SoundtrackManager.stopWithWhistle()
  }, [])
  
  // Clock timer - 1 MINUTE quarters (not 15!)
  useEffect(() => {
    if (phase !== 'loading' && phase !== 'GAME_END') {
      const interval = setInterval(() => {
        setClock(prev => {
          const [mins, secs] = prev.split(':').map(Number)
          let newSecs = secs - 1
          let newMins = mins
          
          if (newSecs < 0) {
            newSecs = 59
            newMins -= 1
          }
          
          if (newMins < 0) {
            // Quarter over - reset to 1:00 (1 minute quarters!)
            if (quarter < 4) {
              setQuarter(q => q + 1)
              return '1:00'
            }
            return '0:00'
          }
          
          return `${newMins}:${newSecs.toString().padStart(2, '0')}`
        })
      }, 1000)
      
      return () => clearInterval(interval)
    }
  }, [phase, quarter])
  
  // Initialize Phaser
  useEffect(() => {
    if (!gameContainerRef.current || phaserGameRef.current) return
    
    const initPhaser = async () => {
      try {
        const Phaser = (await import('phaser')).default
        // Use the new V2 scene with full state machine
        const { OffenseSceneV2 } = await import('@/src/v3/game/scenes/OffenseSceneV2')
        const { DefenseScene } = await import('@/src/v3/game/scenes/DefenseScene')
        
        const config: Phaser.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          parent: gameContainerRef.current!,
          width: 400,
          height: 700,
          backgroundColor: '#0a1a0d',
          scale: {
            mode: Phaser.Scale.ENVELOP,
            autoCenter: Phaser.Scale.CENTER_BOTH,
          },
          scene: [OffenseSceneV2, DefenseScene],
          physics: {
            default: 'arcade',
            arcade: { debug: false },
          },
          render: {
            antialias: true,
            pixelArt: false,
          },
        }
        
        const game = new Phaser.Game(config)
        phaserGameRef.current = game
        
        game.events.once('ready', () => {
          const scene = game.scene.getScene('OffenseSceneV2')
          if (scene) {
            // State updates
            scene.events.on('gameStateUpdate', (state: any) => {
              if (state.phase) {
                setPhase(state.phase as GamePhase)
                // Detect game end
                if (state.phase === 'GAME_END') {
                  setTimeout(() => {
                    setGameWon(state.score?.home > state.score?.away)
                    setShowResults(true)
                  }, 1500)
                }
              }
              if (state.down) setDown(state.down)
              if (state.yardsToGo) setYardsToGo(state.yardsToGo)
              if (state.score) setScore(state.score)
              // Calculate yard line from lineOfScrimmage (Y: 900=own 20, 100=opp goal)
              if (state.lineOfScrimmage) {
                const yl = Math.round((900 - state.lineOfScrimmage) / 8) // Convert to yards
                setYardLine(Math.max(1, Math.min(99, yl)))
              }
            })
            
            // Game end event
            scene.events.on('gameEnd', (data: { won: boolean }) => {
              setGameWon(data.won)
              setTimeout(() => setShowResults(true), 1500)
            })
            
            // Haptic helper for events
            const vibrate = (pattern: number[]) => {
              if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                navigator.vibrate(pattern)
              }
            }
            
            // Events with haptic feedback
            scene.events.on('touchdown', () => {
              vibrate([50, 100, 50, 100, 100]) // Victory pattern
              setShowTouchdown(true)
              setLastEvent('TOUCHDOWN!')
              setTimeout(() => setShowTouchdown(false), 2500)
            })
            
            scene.events.on('catch', (data: any) => {
              if (data.isTouchdown) {
                vibrate([50, 100, 50, 100, 100])
                setLastEvent(`TD CATCH! ${data.yardsGained} yards`)
              } else if (data.yardsGained >= 20) {
                vibrate([30, 50, 30]) // Big play
                setLastEvent(`🔥 BIG PLAY! +${data.yardsGained} YARDS!`)
              } else if (data.throwQuality === 'perfect') {
                vibrate([20, 40, 20])
                setLastEvent(`🎯 PERFECT! +${data.yardsGained} yards`)
              } else {
                vibrate([15])
                setLastEvent(`+${data.yardsGained} yards`)
              }
            })
            
            scene.events.on('yardsGained', (data: any) => {
              if (data.isFirstDown) {
                vibrate([25, 50, 25])
                setLastEvent(`FIRST DOWN! +${data.yards} yards`)
              }
            })
            
            scene.events.on('firstDown', () => {
              vibrate([25, 50, 25])
              setLastEvent('FIRST DOWN!')
            })
            
            scene.events.on('sack', () => {
              vibrate([100, 50, 100]) // Error/fail pattern
              setLastEvent('SACKED!')
            })
            
            scene.events.on('interception', () => {
              vibrate([100, 50, 100, 50, 100])
              setLastEvent('INTERCEPTED!')
            })
            
            scene.events.on('incomplete', () => {
              vibrate([40, 30, 40])
              setLastEvent('INCOMPLETE')
            })
            
            // V2: Pressure updates
            scene.events.on('pressureUpdate', (data: { pressure: number }) => {
              setPressure(data.pressure)
            })
            
            // V2: Dark Side energy updates
            scene.events.on('darkSideEnergy', (data: { energy: number, active: boolean }) => {
              setDarkSideEnergy(data.energy)
              setDarkSideActive(data.active)
            })
            
            // V2: High pressure warning with haptic
            scene.events.on('highPressure', () => {
              vibrate([30, 30, 30])
            })
            
            // Ball flight progress for catch button timing
            scene.events.on('ballFlight', (data: { 
              progress: number, 
              inCatchWindow: boolean, 
              isPerfectWindow: boolean 
            }) => {
              setBallFlightProgress(data.progress)
              setShowCatchButton(data.inCatchWindow)
              setIsPerfectWindow(data.isPerfectWindow)
            })
            
            // Catch attempt result
            scene.events.on('catchAttempt', (data: { timing: string }) => {
              setCatchResult(data.timing)
              setShowCatchButton(false)
              // Clear result after animation
              setTimeout(() => setCatchResult(null), 1000)
            })
          }
          
          setTimeout(() => setPhase('PRE_SNAP'), 500)
        })
        
        // Fallback
        setTimeout(() => {
          if (phase === 'loading') setPhase('PRE_SNAP')
        }, 2000)
        
      } catch (error) {
        console.error('Failed to init Phaser:', error)
      }
    }
    
    initPhaser()
    
    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true)
        phaserGameRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekId])
  
  // Handle play selection from Playbook panel - INSTANT PLAY
  const handleSelectPlay = useCallback((playIndex: number) => {
    if (!phaserGameRef.current) return
    
    const play = PLAYBOOK[playIndex]
    if (!play) return
    
    // Instantly start the play - no double tap needed
    const scene = phaserGameRef.current.scene.getScene('OffenseSceneV2') as any
    if (scene && scene.selectPlay) {
      setSelectedPlayId(play.id)
      scene.selectPlay(playIndex)
      setPhase('SNAP')
      setLastEvent(null)
      
      // Reset selection after play starts
      setTimeout(() => setSelectedPlayId(null), 500)
    }
  }, [])
  
  // Haptic feedback utility
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [40],
        success: [10, 50, 20],
        error: [50, 30, 50],
      }
      navigator.vibrate(patterns[type])
    }
  }, [])
  
  // Catch button handler with haptics
  const handleCatch = useCallback(() => {
    if (!phaserGameRef.current) return
    
    const scene = phaserGameRef.current.scene.getScene('OffenseSceneV2') as any
    if (scene && scene.attemptCatch) {
      // Determine timing based on progress
      const timing = isPerfectWindow ? 'perfect' : ballFlightProgress < 0.7 ? 'early' : 'late'
      
      // Haptic feedback based on timing
      if (timing === 'perfect') {
        triggerHaptic('success')
      } else {
        triggerHaptic('medium')
      }
      
      scene.attemptCatch(timing)
    }
  }, [isPerfectWindow, ballFlightProgress, triggerHaptic])
  
  const downText = down === 1 ? '1ST' : down === 2 ? '2ND' : down === 3 ? '3RD' : '4TH'
  
  // Pause handlers
  const handlePause = useCallback(() => {
    setIsPaused(true)
    if (phaserGameRef.current) {
      const scene = phaserGameRef.current.scene.getScene('OffenseSceneV2')
      if (scene) scene.scene.pause()
    }
  }, [])
  
  const handleResume = useCallback(() => {
    setIsPaused(false)
    if (phaserGameRef.current) {
      const scene = phaserGameRef.current.scene.getScene('OffenseSceneV2')
      if (scene) scene.scene.resume()
    }
  }, [])
  
  const handleRestart = useCallback(() => {
    setIsPaused(false)
    setShowResults(false)
    setPhase('loading')
    setScore({ home: 0, away: 0 })
    setQuarter(1)
    setClock('1:00')
    setDown(1)
    setYardsToGo(10)
    
    if (phaserGameRef.current) {
      const scene = phaserGameRef.current.scene.getScene('OffenseSceneV2') as any
      if (scene && scene.restartGame) {
        scene.restartGame()
      } else {
        phaserGameRef.current.scene.stop('OffenseSceneV2')
        phaserGameRef.current.scene.start('OffenseSceneV2')
      }
    }
    
    setTimeout(() => setPhase('PRE_SNAP'), 500)
  }, [])
  
  const handleQuit = useCallback(() => {
    if (phaserGameRef.current) {
      phaserGameRef.current.destroy(true)
      phaserGameRef.current = null
    }
    router.push('/')
  }, [router])
  
  const handlePlayAgain = useCallback(() => {
    setShowResults(false)
    handleRestart()
  }, [handleRestart])
  
  const handleReturnToMap = useCallback(() => {
    if (phaserGameRef.current) {
      phaserGameRef.current.destroy(true)
      phaserGameRef.current = null
    }
    router.push('/campaign')
  }, [router])
  
  const handleGiveaway = useCallback(() => {
    if (phaserGameRef.current) {
      phaserGameRef.current.destroy(true)
      phaserGameRef.current = null
    }
    router.push('/v4/giveaway')
  }, [router])
  
  return (
    <div className="fixed inset-0 bg-black overflow-hidden no-overscroll touch-manipulation">
      {/* FULL SCREEN GAME CANVAS */}
      <div 
        ref={gameContainerRef}
        className="absolute inset-0"
        style={{ touchAction: 'pan-y pinch-zoom' }}
      />
      
      {/* ================================================================ */}
      {/* ESPN-STYLE SCORE BUG - Top Center */}
      {/* ================================================================ */}
      <div 
        className="absolute top-0 inset-x-0 z-20 pointer-events-none"
        style={{ 
          padding: 'calc(env(safe-area-inset-top, 0px) + 8px) 16px 0',
        }}
      >
        <motion.div 
          className="flex items-center justify-center gap-4 mx-auto"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          style={{
            maxWidth: '300px',
          }}
        >
          {/* Score Container */}
          <div 
            className="flex items-center"
            style={{
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(16px)',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
              overflow: 'hidden',
            }}
          >
            {/* Home Team */}
            <div 
              className="flex items-center gap-2 px-3 py-1.5"
              style={{ borderRight: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div 
                style={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  background: '#69BE28',
                  boxShadow: '0 0 8px #69BE28',
                }} 
              />
              <span style={{ 
                fontSize: '11px', 
                color: 'rgba(255,255,255,0.7)', 
                fontWeight: 600,
                fontFamily: 'var(--font-oswald)',
              }}>
                DS
              </span>
              <motion.span 
                key={score.home}
                initial={{ scale: 1.3, color: '#69BE28' }}
                animate={{ scale: 1, color: '#FFFFFF' }}
                style={{ 
                  fontSize: '20px', 
                  fontWeight: 800, 
                  fontFamily: 'var(--font-bebas)',
                  minWidth: '24px',
                  textAlign: 'center',
                }}
              >
                {score.home}
              </motion.span>
            </div>
            
            {/* Clock */}
            <div className="px-3 py-1.5 text-center" style={{ minWidth: '60px' }}>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: 700, 
                color: 'white',
                fontFamily: 'var(--font-bebas)',
                letterSpacing: '0.05em',
              }}>
                {clock}
              </div>
              <div style={{ 
                fontSize: '8px', 
                color: 'rgba(255,255,255,0.4)',
                marginTop: '-2px',
              }}>
                Q{quarter}
              </div>
            </div>
            
            {/* Away Team */}
            <div 
              className="flex items-center gap-2 px-3 py-1.5"
              style={{ borderLeft: '1px solid rgba(255,255,255,0.1)' }}
            >
              <span 
                style={{ 
                  fontSize: '20px', 
                  fontWeight: 800, 
                  color: 'rgba(255,255,255,0.9)',
                  fontFamily: 'var(--font-bebas)',
                  minWidth: '24px',
                  textAlign: 'center',
                }}
              >
                {score.away}
              </span>
              <span style={{ 
                fontSize: '11px', 
                color: 'rgba(255,255,255,0.5)', 
                fontWeight: 600,
                fontFamily: 'var(--font-oswald)',
              }}>
                {teamAsset?.abbreviation || 'OPP'}
              </span>
            </div>
          </div>
        </motion.div>
        
        {/* Down & Distance Pill */}
        <motion.div 
          className="flex justify-center mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#FFD700',
            background: 'rgba(0,0,0,0.7)',
            padding: '3px 12px',
            borderRadius: '10px',
            border: '1px solid rgba(255,215,0,0.3)',
            fontFamily: 'var(--font-oswald)',
            letterSpacing: '0.05em',
          }}>
            {downText} & {yardsToGo}
          </div>
        </motion.div>
      </div>
      
      {/* ================================================================ */}
      {/* PRESSURE INDICATOR - Edge glow that intensifies as pressure builds */}
      {/* ================================================================ */}
      <AnimatePresence>
        {(phase === 'READ' || phase === 'THROW') && pressure > 0.3 && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Left edge */}
            <motion.div
              className="absolute left-0 top-0 bottom-0 w-16"
              animate={{
                opacity: [pressure * 0.4, pressure * 0.7, pressure * 0.4],
                background: pressure > 0.7 
                  ? 'linear-gradient(90deg, rgba(255,50,50,0.5) 0%, transparent 100%)'
                  : 'linear-gradient(90deg, rgba(255,150,50,0.3) 0%, transparent 100%)',
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
            {/* Right edge */}
            <motion.div
              className="absolute right-0 top-0 bottom-0 w-16"
              animate={{
                opacity: [pressure * 0.4, pressure * 0.7, pressure * 0.4],
                background: pressure > 0.7 
                  ? 'linear-gradient(-90deg, rgba(255,50,50,0.5) 0%, transparent 100%)'
                  : 'linear-gradient(-90deg, rgba(255,150,50,0.3) 0%, transparent 100%)',
              }}
              transition={{ duration: 0.5, repeat: Infinity, delay: 0.25 }}
            />
            
            {/* Pressure meter bar at bottom */}
            <div 
              className="absolute bottom-16 left-1/2 -translate-x-1/2"
              style={{ width: '200px' }}
            >
              <div style={{
                fontSize: '10px',
                color: pressure > 0.7 ? '#FF4444' : 'rgba(255,255,255,0.6)',
                textAlign: 'center',
                marginBottom: '4px',
                fontWeight: 600,
                letterSpacing: '0.1em',
              }}>
                {pressure > 0.8 ? '⚠️ THROW NOW!' : 'POCKET TIME'}
              </div>
              <div style={{
                height: '6px',
                background: 'rgba(0,0,0,0.5)',
                borderRadius: '3px',
                overflow: 'hidden',
              }}>
                <motion.div
                  style={{
                    height: '100%',
                    background: pressure > 0.7 
                      ? 'linear-gradient(90deg, #FF4444, #FF0000)' 
                      : 'linear-gradient(90deg, #69BE28, #FFD700)',
                    borderRadius: '3px',
                  }}
                  animate={{ width: `${(1 - pressure) * 100}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* ================================================================ */}
      {/* DARK SIDE ENERGY - Subtle pulse when active */}
      {/* ================================================================ */}
      <AnimatePresence>
        {darkSideActive && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0"
              animate={{
                boxShadow: [
                  'inset 0 0 60px rgba(105,190,40,0.1)',
                  'inset 0 0 100px rgba(105,190,40,0.2)',
                  'inset 0 0 60px rgba(105,190,40,0.1)',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* ================================================================ */}
      {/* PLAYBOOK CONTROL PANEL - Madden-style at bottom */}
      {/* ================================================================ */}
      <PlaybookPanel
        currentWeek={weekId}
        selectedPlayId={selectedPlayId}
        onSelectPlay={handleSelectPlay}
        isVisible={phase === 'PRE_SNAP'}
        gameState={{
          down,
          yardsToGo,
          yardLine,
          quarter,
          clock,
        }}
      />
      
      {/* ================================================================ */}
      {/* COUNTDOWN - HUT! */}
      {/* ================================================================ */}
      <AnimatePresence>
        {(phase === 'SNAP' || phase === 'DROPBACK') && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              style={{
                fontSize: 'clamp(60px, 20vw, 100px)',
                fontWeight: 900,
                color: '#69BE28',
                textShadow: '0 0 60px rgba(105,190,40,0.8), 0 4px 20px rgba(0,0,0,0.5)',
                fontFamily: 'var(--font-bebas)',
                letterSpacing: '0.05em',
              }}
            >
              HUT!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* ================================================================ */}
      {/* IN POCKET - Tap Hint */}
      {/* ================================================================ */}
      <AnimatePresence>
        {phase === 'READ' && (
          <motion.div
            className="absolute bottom-24 inset-x-0 z-20 text-center pointer-events-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <motion.div
              style={{
                display: 'inline-block',
                fontSize: '12px',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.7)',
                background: 'rgba(0,0,0,0.6)',
                padding: '8px 20px',
                borderRadius: '20px',
                border: '1px solid rgba(255,215,0,0.3)',
              }}
              animate={{ 
                borderColor: ['rgba(255,215,0,0.3)', 'rgba(255,215,0,0.7)', 'rgba(255,215,0,0.3)'],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              TAP OPEN RECEIVER
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* ================================================================ */}
      {/* CATCH BUTTON - Large Mobile-Friendly Touch Target */}
      {/* ================================================================ */}
      <AnimatePresence>
        {(phase === 'BALL_FLIGHT' || showCatchButton) && (
          <motion.div
            className="absolute inset-0 flex items-end justify-center z-40 pb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 40px)' }}
          >
            {/* Large catch button - easy to tap */}
            <motion.button
              onClick={handleCatch}
              className="relative touch-manipulation"
              initial={{ scale: 0.3, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.3, opacity: 0, y: 30 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              style={{
                width: isPerfectWindow ? '160px' : '140px',
                height: isPerfectWindow ? '160px' : '140px',
                borderRadius: '50%',
                background: isPerfectWindow 
                  ? 'radial-gradient(circle, rgba(105,190,40,1) 0%, rgba(74,156,28,0.9) 100%)'
                  : 'radial-gradient(circle, rgba(255,215,0,0.85) 0%, rgba(255,180,0,0.7) 100%)',
                border: isPerfectWindow ? '5px solid #8BD44A' : '4px solid #FFE066',
                boxShadow: isPerfectWindow 
                  ? '0 0 60px rgba(105,190,40,0.9), 0 0 100px rgba(105,190,40,0.5), inset 0 0 40px rgba(255,255,255,0.3)'
                  : '0 0 40px rgba(255,215,0,0.6)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                WebkitTapHighlightColor: 'transparent',
                transition: 'width 0.2s, height 0.2s',
              }}
            >
              {/* Pulsing ring when in perfect window */}
              {isPerfectWindow && (
                <motion.div
                  style={{
                    position: 'absolute',
                    inset: '-15px',
                    borderRadius: '50%',
                    border: '4px solid #69BE28',
                  }}
                  animate={{
                    scale: [1, 1.15, 1],
                    opacity: [1, 0.3, 1],
                  }}
                  transition={{
                    duration: 0.4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}
              
              {/* Progress ring */}
              <svg
                style={{
                  position: 'absolute',
                  width: '180px',
                  height: '180px',
                  transform: 'rotate(-90deg)',
                }}
              >
                <circle
                  cx="90"
                  cy="90"
                  r="80"
                  fill="none"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="6"
                />
                <motion.circle
                  cx="90"
                  cy="90"
                  r="80"
                  fill="none"
                  stroke={isPerfectWindow ? '#fff' : 'rgba(255,255,255,0.7)'}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={502}
                  strokeDashoffset={502 * (1 - ballFlightProgress)}
                />
              </svg>
              
              {/* Text */}
              <motion.span 
                style={{
                  fontSize: isPerfectWindow ? '28px' : '22px',
                  fontWeight: 900,
                  color: isPerfectWindow ? '#000' : '#000',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  fontFamily: 'var(--font-bebas)',
                  letterSpacing: '0.05em',
                }}
                animate={isPerfectWindow ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3, repeat: Infinity }}
              >
                {isPerfectWindow ? 'NOW!' : 'CATCH'}
              </motion.span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Catch result feedback */}
      <AnimatePresence>
        {catchResult && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <motion.div
              style={{
                fontSize: '32px',
                fontWeight: 900,
                color: catchResult === 'perfect' ? '#69BE28' : 
                       catchResult === 'missed' ? '#FF4444' : '#FFD700',
                textShadow: '0 4px 20px rgba(0,0,0,0.8)',
                fontFamily: 'var(--font-bebas)',
                letterSpacing: '0.1em',
              }}
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 0.3 }}
            >
              {catchResult === 'perfect' ? 'PERFECT!' : 
               catchResult === 'early' ? 'EARLY' :
               catchResult === 'late' ? 'LATE' : 'DROPPED!'}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* ================================================================ */}
      {/* TOUCHDOWN CELEBRATION */}
      {/* ================================================================ */}
      <AnimatePresence>
        {showTouchdown && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Overlay */}
            <motion.div 
              className="absolute inset-0"
              style={{ background: 'rgba(105, 190, 40, 0.2)' }}
              animate={{ opacity: [0.3, 0.1, 0.3] }}
              transition={{ duration: 0.5, repeat: 4 }}
            />
            
            {/* Text */}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              style={{
                textAlign: 'center',
              }}
            >
              <div style={{
                fontSize: 'clamp(50px, 18vw, 90px)',
                fontWeight: 900,
                color: '#69BE28',
                textShadow: '0 0 80px rgba(105,190,40,0.9), 0 4px 30px rgba(0,0,0,0.8)',
                fontFamily: 'var(--font-bebas)',
                letterSpacing: '0.05em',
                lineHeight: 1,
              }}>
                TOUCHDOWN!
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                  fontSize: 'clamp(16px, 5vw, 24px)',
                  color: 'white',
                  marginTop: '10px',
                  fontFamily: 'var(--font-oswald)',
                  letterSpacing: '0.1em',
                }}
              >
                DARK SIDE
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* ================================================================ */}
      {/* EVENT TOAST */}
      {/* ================================================================ */}
      <AnimatePresence>
        {lastEvent && !showTouchdown && phase !== 'PRE_SNAP' && (
          <motion.div
            key={lastEvent}
            className="absolute top-32 inset-x-0 z-20 text-center pointer-events-none"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <span style={{
              fontSize: '14px',
              fontWeight: 700,
              color: 'white',
              background: 'rgba(0,0,0,0.7)',
              padding: '6px 16px',
              borderRadius: '16px',
              fontFamily: 'var(--font-oswald)',
            }}>
              {lastEvent}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* ================================================================ */}
      {/* LOADING */}
      {/* ================================================================ */}
      <AnimatePresence>
        {phase === 'loading' && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-50 bg-black"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <motion.div
                style={{ 
                  fontSize: '14px', 
                  color: '#69BE28', 
                  letterSpacing: '0.3em',
                  fontFamily: 'var(--font-oswald)',
                }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                LOADING
              </motion.div>
              <motion.div
                style={{
                  width: '100px',
                  height: '3px',
                  background: 'rgba(105,190,40,0.2)',
                  borderRadius: '2px',
                  marginTop: '16px',
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  style={{
                    width: '50%',
                    height: '100%',
                    background: '#69BE28',
                    borderRadius: '2px',
                  }}
                  animate={{ x: ['-50%', '150%'] }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* ================================================================ */}
      {/* PAUSE BUTTON */}
      {/* ================================================================ */}
      {phase !== 'loading' && !showResults && (
        <motion.button
          onClick={handlePause}
          className="absolute z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            top: 'calc(env(safe-area-inset-top, 0px) + 12px)',
            left: '16px',
            width: '36px',
            height: '36px',
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '10px',
            color: 'rgba(255,255,255,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          whileHover={{ background: 'rgba(0,0,0,0.7)' }}
          whileTap={{ scale: 0.9 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        </motion.button>
      )}
      
      {/* ================================================================ */}
      {/* PAUSE MENU */}
      {/* ================================================================ */}
      <PauseMenu
        isOpen={isPaused}
        onResume={handleResume}
        onRestart={handleRestart}
        onQuit={handleQuit}
      />
      
      {/* ================================================================ */}
      {/* GAME RESULTS - Premium Design */}
      {/* ================================================================ */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop with gradient */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: gameWon
                  ? 'radial-gradient(circle at 50% 30%, rgba(105,190,40,0.12) 0%, rgba(0,15,30,0.98) 60%)'
                  : 'linear-gradient(180deg, rgba(0,15,30,0.95) 0%, rgba(0,10,20,0.98) 100%)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
              }}
            />
            
            {/* Confetti for wins */}
            {gameWon && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    style={{
                      position: 'absolute',
                      width: '8px',
                      height: '8px',
                      borderRadius: '2px',
                      background: ['#69BE28', '#FFD700', '#fff', '#4ECDC4'][i % 4],
                      left: `${Math.random() * 100}%`,
                      top: '-20px',
                    }}
                    animate={{ 
                      y: '120vh',
                      rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                      opacity: [0, 1, 1, 0],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      delay: i * 0.1,
                      ease: 'linear',
                      repeat: Infinity,
                    }}
                  />
                ))}
              </div>
            )}
            
            <motion.div
              className="relative z-10 w-full px-5"
              style={{ maxWidth: '400px' }}
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            >
              {/* Main Card */}
              <div
                style={{
                  background: 'linear-gradient(180deg, rgba(30,50,70,0.85) 0%, rgba(15,30,50,0.95) 100%)',
                  backdropFilter: 'blur(40px)',
                  WebkitBackdropFilter: 'blur(40px)',
                  borderRadius: '28px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: gameWon
                    ? '0 30px 100px rgba(105,190,40,0.2), inset 0 1px 0 rgba(255,255,255,0.05)'
                    : '0 25px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
                  padding: '32px 28px',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {/* Top accent */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: gameWon
                      ? 'linear-gradient(90deg, transparent, #69BE28, #FFD700, transparent)'
                      : 'linear-gradient(90deg, transparent, #FF6B6B, transparent)',
                  }}
                />
                
                {/* Result Banner */}
                <motion.div
                  className="text-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, type: 'spring' }}
                  style={{ marginBottom: '24px' }}
                >
                  <motion.div
                    style={{
                      width: '80px',
                      height: '80px',
                      margin: '0 auto 16px',
                      borderRadius: '50%',
                      background: gameWon
                        ? 'linear-gradient(135deg, rgba(105,190,40,0.2) 0%, rgba(105,190,40,0.05) 100%)'
                        : 'rgba(255,255,255,0.05)',
                      border: gameWon
                        ? '2px solid rgba(105,190,40,0.4)'
                        : '1px solid rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '40px',
                    }}
                    animate={gameWon ? { 
                      rotate: [0, -10, 10, -5, 5, 0],
                      scale: [1, 1.1, 1],
                    } : {}}
                    transition={{ duration: 1, delay: 0.3 }}
                  >
                    {gameWon ? '🏆' : '💪'}
                  </motion.div>
                  <h1
                    className="font-display"
                    style={{
                      fontSize: 'clamp(2rem, 10vw, 3rem)',
                      color: gameWon ? '#69BE28' : '#FF6B6B',
                      textShadow: gameWon 
                        ? '0 0 40px rgba(105,190,40,0.4)'
                        : '0 0 40px rgba(255,107,107,0.4)',
                      lineHeight: 1,
                    }}
                  >
                    {gameWon ? 'VICTORY' : 'DEFEAT'}
                  </h1>
                </motion.div>
                
                {/* Score Display */}
                <motion.div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '24px',
                    padding: '20px',
                    background: 'rgba(0,0,0,0.25)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    marginBottom: '28px',
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  {/* Home Team */}
                  <div className="text-center flex-1">
                    <motion.span 
                      className="font-display block"
                      style={{ 
                        fontSize: 'clamp(2.5rem, 12vw, 4rem)',
                        color: '#69BE28',
                        lineHeight: 1,
                        textShadow: '0 0 30px rgba(105,190,40,0.3)',
                      }}
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: 'spring' }}
                    >
                      {score.home}
                    </motion.span>
                    <span 
                      style={{ 
                        fontSize: '10px',
                        color: 'rgba(255,255,255,0.4)',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        marginTop: '8px',
                        display: 'block',
                      }}
                    >
                      Dark Side
                    </span>
                  </div>
                  
                  {/* Divider */}
                  <div 
                    style={{ 
                      width: '2px',
                      height: '60px',
                      background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.2), transparent)',
                    }}
                  />
                  
                  {/* Away Team */}
                  <div className="text-center flex-1">
                    <motion.span 
                      className="font-display block"
                      style={{ 
                        fontSize: 'clamp(2.5rem, 12vw, 4rem)',
                        color: 'rgba(255,255,255,0.5)',
                        lineHeight: 1,
                      }}
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.35, type: 'spring' }}
                    >
                      {score.away}
                    </motion.span>
                    <span 
                      style={{ 
                        fontSize: '10px',
                        color: 'rgba(255,255,255,0.3)',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        marginTop: '8px',
                        display: 'block',
                      }}
                    >
                      {teamAsset?.abbreviation || 'OPP'}
                    </span>
                  </div>
                </motion.div>
                
                {/* Action Buttons */}
                <motion.div
                  style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.button
                    onClick={handlePlayAgain}
                    style={{
                      width: '100%',
                      padding: '18px 24px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #69BE28 0%, #4a9c1c 100%)',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: 700,
                      fontFamily: 'var(--font-oswald), sans-serif',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: '#000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      boxShadow: '0 8px 32px rgba(105, 190, 40, 0.4)',
                    }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    Play Again
                  </motion.button>
                  
                  <motion.button
                    onClick={handleGiveaway}
                    style={{
                      width: '100%',
                      padding: '18px 24px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: 700,
                      fontFamily: 'var(--font-oswald), sans-serif',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: '#000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      boxShadow: '0 8px 32px rgba(255, 215, 0, 0.35)',
                    }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>🎁</span>
                    Enter Giveaway
                  </motion.button>
                  
                  <motion.button
                    onClick={handleReturnToMap}
                    style={{
                      width: '100%',
                      padding: '16px 24px',
                      borderRadius: '14px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 600,
                      fontFamily: 'var(--font-oswald), sans-serif',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.5)',
                    }}
                    whileHover={{ color: 'rgba(255,255,255,0.8)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Return to Map
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function V3GamePage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-black">
          <motion.div
            style={{ 
              fontSize: '14px', 
              color: '#69BE28', 
              letterSpacing: '0.3em',
              fontFamily: 'var(--font-oswald)',
            }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            LOADING
          </motion.div>
        </div>
      }
    >
      <V3GameContent />
    </Suspense>
  )
}
