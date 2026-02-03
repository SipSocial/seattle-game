'use client'

/**
 * QB Game - Clean, minimal mobile football game
 * 
 * Stripped down for clarity:
 * - Simple field
 * - Clear player positions
 * - Minimal HUD
 * - One button to catch
 */

import { useEffect, useCallback, useMemo, Suspense, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameState, PlayerRole } from './hooks/useGameState'
import { Field } from './components/Field'
import { Players } from './components/Players'
import { Ball } from './components/Ball'
import { PlaybookPanel } from './components/PlaybookPanel'
import { CatchButton } from './components/CatchButton'
import { ResultOverlay, GameOverOverlay } from './components/GameOverlay'
import { TouchdownCelebration } from './components/TouchdownCelebration'
import { ActionWordOverlay } from './components/ActionWordOverlay'
import { SuperheroReplay } from './components/SuperheroReplay'
import { CoverageShell } from './components/CoverageShell'
import { DefenderInterception } from './components/DefenderInterception'
import { getTouchButtonProps, triggerHaptic } from './hooks/useTouchHandlers'
import { PlayDefinition, getAvailablePlays } from './lib/playbook'
import { LoadingSpinner } from '@/components/ui'
import { SoundtrackManager } from '@/src/game/systems/SoundtrackManager'
import { useGameStore } from '@/src/store/gameStore'
import { OFFENSE_PLAYERS } from '@/src/game/data/playerRosters'
import { playSoundForPhase, playSoundForResult, resumeAudioContext, startAmbientCrowd, stopAmbientCrowd } from './lib/sounds'

// ============================================================================
// HELPERS
// ============================================================================

function determinePlayerRole(selectedOffense: number): { role: PlayerRole; receiverIndex: number | undefined } {
  const player = OFFENSE_PLAYERS.find(p => p.jersey === selectedOffense)
  if (!player) return { role: 'qb', receiverIndex: undefined }
  
  const position = player.position.toUpperCase()
  if (position === 'QB') {
    return { role: 'qb', receiverIndex: undefined }
  }
  
  let receiverIndex = 0
  if (position === 'TE' || position === 'RB') receiverIndex = 1
  else if (player.jersey === 10) receiverIndex = 2
  
  return { role: 'receiver', receiverIndex }
}

// ============================================================================
// MINIMAL HUD - Just score and down
// ============================================================================

function MinimalHUD({ 
  score, 
  down, 
  distance, 
  quarter,
  pocketTime,
  pocketTimeMax,
  showPocket,
}: { 
  score: { home: number; away: number }
  down: number
  distance: number
  quarter: number
  pocketTime: number
  pocketTimeMax: number
  showPocket: boolean
}) {
  const pocketPercent = Math.min(100, (pocketTime / pocketTimeMax) * 100)
  
  return (
    <div
      style={{
        position: 'fixed',
        top: 'calc(env(safe-area-inset-top, 0px) + 8px)',
        left: '12px',
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      {/* Score */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: '12px',
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
          Q{quarter}
        </span>
        <span style={{ fontSize: '18px', fontWeight: 900, color: '#69BE28', fontFamily: 'var(--font-oswald)' }}>
          {score.home}
        </span>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>-</span>
        <span style={{ fontSize: '18px', fontWeight: 900, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-oswald)' }}>
          {score.away}
        </span>
      </div>
      
      {/* Down & Distance */}
      <div
        style={{
          padding: '4px 10px',
          borderRadius: '10px',
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFD700' }}>
          {down === 1 ? '1st' : down === 2 ? '2nd' : down === 3 ? '3rd' : '4th'} & {distance}
        </span>
      </div>
      
      {/* Pocket Timer */}
      <AnimatePresence>
        {showPocket && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              padding: '4px 10px',
              borderRadius: '10px',
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>
                POCKET
              </span>
              <div
                style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '2px',
                  background: 'rgba(255,255,255,0.2)',
                  overflow: 'hidden',
                  minWidth: '50px',
                }}
              >
                <motion.div
                  style={{
                    height: '100%',
                    borderRadius: '2px',
                    background: pocketPercent > 70 ? '#FF4444' : pocketPercent > 40 ? '#FFD700' : '#69BE28',
                  }}
                  animate={{ width: `${100 - pocketPercent}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// GAME CONTENT
// ============================================================================

function QBGameContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const weekId = parseInt(searchParams.get('weekId') || '1', 10)
  
  const selectedOffense = useGameStore((state) => state.selectedOffense)
  const { role, receiverIndex } = useMemo(() => determinePlayerRole(selectedOffense), [selectedOffense])
  const [state, actions] = useGameState(weekId, role, receiverIndex)
  
  // Track phase for sounds
  const previousPhaseRef = useRef(state.phase)
  
  useEffect(() => {
    if (state.phase !== previousPhaseRef.current) {
      playSoundForPhase(state.phase, previousPhaseRef.current)
      previousPhaseRef.current = state.phase
    }
  }, [state.phase])
  
  // Celebration states (touchdown and superhero replay for big plays)
  const [showTouchdown, setShowTouchdown] = useState(false)
  const [showSuperhero, setShowSuperhero] = useState(false)
  const [showInterception, setShowInterception] = useState(false)
  const [celebrationData, setCelebrationData] = useState<{ jersey: number; yards: number; isTouchdown: boolean } | null>(null)
  const [interceptionData, setInterceptionData] = useState<{ x: number; y: number; jersey: number } | null>(null)
  
  useEffect(() => {
    if (state.lastResult) {
      playSoundForResult(state.lastResult.outcome, state.lastResult.isFirstDown)
      
      // Get the scoring player
      const receiverJerseys = [11, 88, 10, 16, 14] // JSN, AJ Barner, Kupp, Lockett, Metcalf
      const scoringJersey = state.targetReceiverIndex !== null
        ? receiverJerseys[state.targetReceiverIndex] || 11
        : 14
      
      if (state.lastResult.outcome === 'touchdown') {
        setCelebrationData({
          jersey: scoringJersey,
          yards: state.lastResult.yardsGained,
          isTouchdown: true,
        })
        // Show superhero replay first for TDs, then touchdown celebration
        setShowSuperhero(true)
        triggerHaptic('heavy')
      } else if (state.lastResult.outcome === 'interception') {
        // Show diving interception animation at ball target location
        const defenderJerseys = [24, 21, 33, 29, 54, 52, 58]
        setInterceptionData({
          x: state.ball.targetX,
          y: state.ball.targetY,
          jersey: defenderJerseys[Math.floor(Math.random() * defenderJerseys.length)],
        })
        setShowInterception(true)
        triggerHaptic('heavy')
      } else if (state.showSuperheroReplay) {
        // Big play (25+ yards) - show superhero replay
        setCelebrationData({
          jersey: scoringJersey,
          yards: state.lastResult.yardsGained,
          isTouchdown: false,
        })
        setShowSuperhero(true)
        triggerHaptic('heavy')
      }
    }
  }, [state.lastResult, state.targetReceiverIndex, state.showSuperheroReplay, state.ball.targetX, state.ball.targetY])
  
  const handleSuperheroComplete = useCallback(() => {
    setShowSuperhero(false)
    if (celebrationData?.isTouchdown) {
      // After superhero replay, show TD celebration
      setShowTouchdown(true)
    } else {
      // For big plays, go back to game
      setCelebrationData(null)
      actions.nextPlay()
    }
  }, [celebrationData, actions])
  
  const handleTouchdownComplete = useCallback(() => {
    setShowTouchdown(false)
    setCelebrationData(null)
    actions.nextPlay()
  }, [actions])
  
  const handleInterceptionComplete = useCallback(() => {
    setShowInterception(false)
    setInterceptionData(null)
    // Auto-advance happens in useGameState
  }, [])
  
  // Stop music and start ambient crowd
  useEffect(() => {
    SoundtrackManager.stop()
    
    // Start ambient crowd on first interaction
    const startCrowd = () => {
      startAmbientCrowd()
      document.removeEventListener('click', startCrowd)
      document.removeEventListener('touchstart', startCrowd)
    }
    document.addEventListener('click', startCrowd, { once: true })
    document.addEventListener('touchstart', startCrowd, { once: true })
    
    return () => {
      stopAmbientCrowd()
      document.removeEventListener('click', startCrowd)
      document.removeEventListener('touchstart', startCrowd)
    }
  }, [])
  
  // Handlers
  const handleSelectPlay = useCallback((play: PlayDefinition) => {
    if (state.phase !== 'PRE_SNAP') return
    resumeAudioContext()
    triggerHaptic('medium')
    actions.selectPlay(play)
  }, [state.phase, actions])
  
  // Auto-select play in receiver mode
  useEffect(() => {
    if (role === 'receiver' && state.phase === 'PRE_SNAP') {
      const timer = setTimeout(() => {
        const plays = getAvailablePlays(weekId)
        if (plays.length > 0) {
          actions.selectPlay(plays[Math.floor(Math.random() * plays.length)])
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [role, state.phase, weekId, actions])
  
  const handleTargetReceiver = useCallback((idx: number) => {
    if (role === 'receiver' || state.phase !== 'READ') return
    triggerHaptic('heavy')
    actions.throwToReceiver(idx)
  }, [role, state.phase, actions])
  
  const handleCatch = useCallback(() => {
    if (state.phase !== 'BALL_FLIGHT') return
    actions.attemptCatch()
  }, [state.phase, actions])
  
  const handleContinue = useCallback(() => actions.nextPlay(), [actions])
  const handleReplay = useCallback(() => actions.resetGame(), [actions])
  const handleExit = useCallback(() => router.push('/campaign'), [router])
  
  const handlePause = useCallback(() => {
    triggerHaptic('light')
    if (confirm('Exit game?')) router.push('/campaign')
  }, [router])
  
  // UI visibility
  const showPlaybook = state.phase === 'PRE_SNAP' && role === 'qb'
  const showCatchButton = state.phase === 'BALL_FLIGHT'
  const showResult = state.phase === 'RESULT' && !showTouchdown && !showInterception
  const showGameOver = state.phase === 'GAME_OVER'
  const showPocket = state.phase === 'READ'
  
  // Calculate line of scrimmage Y position (UNIFIED)
  const lineOfScrimmageY = useMemo(() => {
    // yardLine 0 → Y=88% (bottom), yardLine 100 → Y=12% (top)
    // You advance UPWARD toward opponent's end zone at top
    return 88 - (state.drive.yardLine / 100) * 76
  }, [state.drive.yardLine])
  
  const qbJerseyNumber = useMemo(() => {
    // Always use the team's actual QB (Sam Darnold #14)
    const qb = OFFENSE_PLAYERS.find(p => p.position === 'QB')
    return qb?.jersey || 14
  }, [])
  
  return (
    <div 
      className="fixed inset-0 overflow-hidden"
      style={{ background: '#002244', touchAction: 'none' }}
    >
      {/* Field with dynamic zoom and shake */}
      <Field 
        yardLine={state.drive.yardLine} 
        firstDownLine={state.drive.yardLine + state.drive.yardsToGo}
        phase={state.phase}
        shake={state.cameraShake}
      />
      
      {/* Players - 5 receivers + 7 defenders with hybrid coverage */}
      <div className="absolute inset-0 pointer-events-auto">
        <Players
          qbPosition={state.qbPosition}
          receivers={state.receivers}
          phase={state.phase}
          onTargetReceiver={handleTargetReceiver}
          qbJerseyNumber={qbJerseyNumber}
          lineOfScrimmage={lineOfScrimmageY}
          difficulty={state.difficulty}
          coverageType={state.coverageType}
          ballThrown={state.ballThrown}
          ballTarget={state.ball.inFlight ? { x: state.ball.targetX, y: state.ball.targetY } : null}
        />
        <Ball ball={state.ball} phase={state.phase} />
      </div>
      
      {/* Action Word Overlay - SNAP!, OPEN!, TOUCHDOWN!, etc */}
      <ActionWordOverlay word={state.actionWord} />
      
      {/* Pre-snap coverage shell display */}
      <CoverageShell
        isVisible={state.phase === 'PRE_SNAP' && role === 'qb'}
        coverageType={state.coverageType}
        showHotRoutes={weekId >= 3} // Unlock hot routes at week 3
      />
      
      {/* Minimal HUD */}
      <MinimalHUD
        score={state.drive.score}
        down={state.drive.down}
        distance={state.drive.yardsToGo}
        quarter={state.drive.quarter}
        pocketTime={state.pocketTime}
        pocketTimeMax={state.pocketTimeMax}
        showPocket={showPocket}
      />
      
      {/* Pause button */}
      <motion.div
        {...getTouchButtonProps(handlePause)}
        whileTap={{ scale: 0.9 }}
        style={{
          position: 'fixed',
          top: 'calc(env(safe-area-inset-top, 0px) + 8px)',
          right: '12px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 45,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)">
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      </motion.div>
      
      {/* Superhero Replay - 5-second cinematic for big plays */}
      <SuperheroReplay
        isActive={showSuperhero}
        scoringPlayerJersey={celebrationData?.jersey || 11}
        yardsGained={celebrationData?.yards || 0}
        isTouchdown={celebrationData?.isTouchdown || false}
        onComplete={handleSuperheroComplete}
      />
      
      {/* Touchdown celebration - Card reveal after superhero replay */}
      {showTouchdown && celebrationData && (
        <TouchdownCelebration
          scoringPlayerJersey={celebrationData.jersey}
          yardsGained={celebrationData.yards}
          onComplete={handleTouchdownComplete}
        />
      )}
      
      {/* Interception diving catch animation */}
      <DefenderInterception
        isActive={showInterception}
        x={interceptionData?.x || 0}
        y={interceptionData?.y || 50}
        jersey={interceptionData?.jersey || 24}
        onComplete={handleInterceptionComplete}
      />
      
      {/* Playbook */}
      <PlaybookPanel
        weekId={weekId}
        onSelectPlay={handleSelectPlay}
        isVisible={showPlaybook}
      />
      
      {/* Catch button */}
      <CatchButton
        isVisible={showCatchButton}
        ballProgress={state.ball.progress}
        onCatch={handleCatch}
      />
      
      {/* Result overlay */}
      <ResultOverlay
        result={state.lastResult}
        throwTiming={state.throwTiming}
        catchTiming={state.catchTiming}
        onContinue={handleContinue}
        isVisible={showResult}
      />
      
      {/* Game over */}
      <GameOverOverlay
        score={state.drive.score}
        onReplay={handleReplay}
        onExit={handleExit}
        isVisible={showGameOver}
      />
    </div>
  )
}

// ============================================================================
// PAGE
// ============================================================================

export default function QBGamePage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-[#002244]">
          <LoadingSpinner size="xl" text="Loading..." />
        </div>
      }
    >
      <QBGameContent />
    </Suspense>
  )
}
