/**
 * useGameState - React state machine for QB game
 * 
 * Manages all game state and phase transitions without Phaser.
 * This is a pure React implementation for reliable mobile support.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { 
  DriveState, 
  calculatePassOutcome, 
  processPlayResult,
  getThrowTiming,
  getCatchTiming,
  getPocketTime,
  getDifficultyMultiplier,
  getBallFlightDuration,
  getBallArcHeight,
  isBigPlay,
  FIELD_BOUNDS,
  QUARTER_DURATION,
  ThrowTiming,
  CatchTiming,
  PassOutcome,
  PlayResult,
} from '../lib/gameLogic'
import type { ActionWord } from '../components/ActionWordOverlay'
import { PlayDefinition, ReceiverRoute, getReceiverPosition, isInPerfectWindow, CoverageType, getDefenseCoverage } from '../lib/playbook'

// ============================================================================
// TYPES
// ============================================================================

export type GamePhase = 
  | 'PRE_SNAP'      // Selecting play
  | 'SNAP'          // Ball snapped, 0.3s animation
  | 'DROPBACK'      // QB dropping back, 0.4s
  | 'READ'          // Reading defense, pocket timer active
  | 'THROW'         // Ball released, 0.2s
  | 'BALL_FLIGHT'   // Ball in air, catch window active
  | 'CATCH'         // Catch animation, 0.3s
  | 'RESULT'        // Showing outcome, 1.5s
  | 'POST_PLAY'     // Resetting for next play
  | 'GAME_OVER'     // Game ended

export type PlayerRole = 'qb' | 'receiver'

export interface ReceiverState {
  index: number
  x: number
  y: number
  progress: number
  isOpen: boolean
  isTargeted: boolean
  isPlayer: boolean // True if this is the user's receiver (in receiver mode)
}

export interface BallState {
  x: number
  y: number
  progress: number
  startX: number
  startY: number
  targetX: number
  targetY: number
  visible: boolean
  inFlight: boolean
}

export interface GameState {
  phase: GamePhase
  drive: DriveState
  selectedPlay: PlayDefinition | null
  receivers: ReceiverState[]
  ball: BallState
  qbPosition: { x: number; y: number }
  pocketTime: number
  pocketTimeMax: number
  routeProgress: number
  throwTiming: ThrowTiming | null
  catchTiming: CatchTiming | null
  lastResult: PlayResult | null
  targetReceiverIndex: number | null
  isGameOver: boolean
  difficulty: number
  playerRole: PlayerRole
  playerReceiverIndex: number | null // Which receiver the player controls (in receiver mode)
  // New cinematic features
  actionWord: ActionWord | null
  showSuperheroReplay: boolean
  cameraShake: { intensity: number; duration: number } | null
  ballFlightDuration: number // Variable based on throw distance
  ballArcHeight: number // Variable based on throw distance
  // Defense coverage
  coverageType: CoverageType
  ballThrown: boolean // Triggers break-on-ball behavior
}

export interface GameActions {
  selectPlay: (play: PlayDefinition) => void
  throwToReceiver: (receiverIndex: number) => void
  attemptCatch: () => void
  nextPlay: () => void
  resetGame: () => void
  setPlayerRole: (role: PlayerRole, receiverIndex?: number) => void
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const createInitialDrive = (): DriveState => ({
  down: 1,
  yardsToGo: 10, // Standard football - 10 yards for first down
  yardLine: 20,  // Start at own 20 yard line
  quarter: 1,
  timeRemaining: QUARTER_DURATION,
  score: { home: 0, away: 0 },
})

const createInitialState = (weekId: number, playerRole: PlayerRole = 'qb', playerReceiverIndex: number | null = null): GameState => {
  // UNIFIED COORDINATE SYSTEM:
  // yardLine 0 (your goal) → Y = 88% (bottom of screen)
  // yardLine 100 (their goal) → Y = 12% (top of screen)
  // Formula: screenY = 88 - (yardLine / 100) * 76
  const initialYardLine = FIELD_BOUNDS.OWN_20 // Start at own 20
  const lineOfScrimmageY = 88 - (initialYardLine / 100) * 76
  const qbY = lineOfScrimmageY + 3.8 // QB ~5 yards behind LOS (3.8% = 5 yards at 0.76%/yard)
  
  return {
    phase: 'PRE_SNAP',
    drive: createInitialDrive(),
    selectedPlay: null,
    receivers: [],
    ball: { x: 0, y: qbY, progress: 0, startX: 0, startY: qbY, targetX: 0, targetY: 30, visible: false, inFlight: false },
    qbPosition: { x: 0, y: qbY },
    pocketTime: 0,
    pocketTimeMax: getPocketTime(weekId),
    routeProgress: 0,
    throwTiming: null,
    catchTiming: null,
    lastResult: null,
    targetReceiverIndex: null,
    isGameOver: false,
    difficulty: getDifficultyMultiplier(weekId),
    playerRole,
    playerReceiverIndex: playerRole === 'receiver' ? (playerReceiverIndex ?? 0) : null,
    // New cinematic features
    actionWord: null,
    showSuperheroReplay: false,
    cameraShake: null,
    ballFlightDuration: 800, // Default, updated per throw
    ballArcHeight: 12, // Default, updated per throw
    // Defense coverage
    coverageType: 'zone',
    ballThrown: false,
  }
}

// ============================================================================
// HOOK
// ============================================================================

export function useGameState(weekId: number = 1, initialRole: PlayerRole = 'qb', initialReceiverIndex?: number): [GameState, GameActions] {
  const [state, setState] = useState<GameState>(() => createInitialState(weekId, initialRole, initialReceiverIndex))
  
  // Refs for timers
  const pocketTimerRef = useRef<number | null>(null)
  const routeTimerRef = useRef<number | null>(null)
  const ballFlightTimerRef = useRef<number | null>(null)
  const phaseTimerRef = useRef<number | null>(null)
  
  // Clear all timers
  const clearAllTimers = useCallback(() => {
    if (pocketTimerRef.current) {
      cancelAnimationFrame(pocketTimerRef.current)
      pocketTimerRef.current = null
    }
    if (routeTimerRef.current) {
      cancelAnimationFrame(routeTimerRef.current)
      routeTimerRef.current = null
    }
    if (ballFlightTimerRef.current) {
      cancelAnimationFrame(ballFlightTimerRef.current)
      ballFlightTimerRef.current = null
    }
    if (phaseTimerRef.current) {
      clearTimeout(phaseTimerRef.current)
      phaseTimerRef.current = null
    }
  }, [])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => clearAllTimers()
  }, [clearAllTimers])
  
  // ============================================================================
  // PHASE TRANSITIONS
  // ============================================================================
  
  const transitionTo = useCallback((phase: GamePhase, delay: number = 0) => {
    if (delay > 0) {
      phaseTimerRef.current = window.setTimeout(() => {
        setState(s => ({ ...s, phase }))
      }, delay)
    } else {
      setState(s => ({ ...s, phase }))
    }
  }, [])
  
  // ============================================================================
  // PLAY SELECTION
  // ============================================================================
  
  const selectPlay = useCallback((play: PlayDefinition) => {
    if (state.phase !== 'PRE_SNAP') return
    
    // UNIFIED: yardLine 0 → Y=88%, yardLine 100 → Y=12%
    const lineOfScrimmageY = 88 - (state.drive.yardLine / 100) * 76
    
    // QB 5% behind LOS (higher Y = toward your end zone)
    const qbY = lineOfScrimmageY + 3.8
    
    const playerReceiverIdx = state.playerReceiverIndex
    const receivers: ReceiverState[] = play.routes.map((route, index) => {
      const pos = getReceiverPosition(route, 0, lineOfScrimmageY)
      return {
        index,
        x: pos.x,
        y: pos.y,
        progress: 0,
        isOpen: false,
        isTargeted: false,
        isPlayer: state.playerRole === 'receiver' && index === playerReceiverIdx,
      }
    })
    
    // Determine defense coverage based on difficulty
    const coverageType = getDefenseCoverage(state.difficulty)
    
    setState(s => ({
      ...s,
      selectedPlay: play,
      receivers,
      phase: 'SNAP',
      qbPosition: { x: 0, y: qbY },
      routeProgress: 0,
      throwTiming: null,
      catchTiming: null,
      targetReceiverIndex: null,
      ball: { x: 0, y: qbY, startX: 0, startY: qbY, targetX: 0, targetY: 30, progress: 0, visible: false, inFlight: false },
      actionWord: 'SNAP!', // Flash action word on snap
      cameraShake: { intensity: 3, duration: 100 }, // Micro-shake on snap
      coverageType,
      ballThrown: false,
    }))
    
    // Auto-transition through phases
    // SNAP -> DROPBACK (200ms) - faster snap animation
    phaseTimerRef.current = window.setTimeout(() => {
      setState(s => ({ ...s, phase: 'DROPBACK' }))
      
      // DROPBACK -> READ (250ms) - quick dropback
      phaseTimerRef.current = window.setTimeout(() => {
        setState(s => ({ 
          ...s, 
          phase: 'READ',
          pocketTime: 0,
        }))
        
        // Start pocket timer and route progression
        startPocketTimer()
        startRouteProgression(play)
        
        // In receiver mode, AI QB will auto-throw after a delay
        if (state.playerRole === 'receiver') {
          scheduleAIThrow(play, playerReceiverIdx ?? 0)
        }
      }, 250)
    }, 200)
  }, [state.phase, state.drive.yardLine, state.playerRole, state.playerReceiverIndex])
  
  // ============================================================================
  // POCKET TIMER
  // ============================================================================
  
  const startPocketTimer = useCallback(() => {
    let lastTime = performance.now()
    
    const tick = (currentTime: number) => {
      const delta = currentTime - lastTime
      lastTime = currentTime
      
      setState(s => {
        if (s.phase !== 'READ') return s
        
        const newPocketTime = s.pocketTime + delta
        
        // Check for sack
        if (newPocketTime >= s.pocketTimeMax) {
          clearAllTimers()
          
          // Process sack
          const { newDrive, playResult } = processPlayResult(s.drive, {
            outcome: 'sack',
            yardsGained: 0,
          })
          
          return {
            ...s,
            phase: 'RESULT',
            pocketTime: s.pocketTimeMax,
            drive: newDrive,
            lastResult: playResult,
            actionWord: 'SACKED!',
            cameraShake: { intensity: 12, duration: 400 }, // Heavy shake on sack
          }
        }
        
        return { ...s, pocketTime: newPocketTime }
      })
      
      pocketTimerRef.current = requestAnimationFrame(tick)
    }
    
    pocketTimerRef.current = requestAnimationFrame(tick)
  }, [clearAllTimers])
  
  // ============================================================================
  // ROUTE PROGRESSION
  // ============================================================================
  
  const startRouteProgression = useCallback((play: PlayDefinition) => {
    const routeDuration = 3000 // 3 seconds for routes - faster, more realistic pace
    let lastTime = performance.now()
    
    const tick = (currentTime: number) => {
      const delta = currentTime - lastTime
      lastTime = currentTime
      
      setState(s => {
        if (s.phase !== 'READ') return s
        
        const newProgress = Math.min(1, s.routeProgress + delta / routeDuration)
        // UNIFIED: yardLine 0 → Y=88%, yardLine 100 → Y=12%
        const lineOfScrimmageY = 88 - (s.drive.yardLine / 100) * 76
        
        // Update receiver positions
        const receivers = play.routes.map((route, index) => {
          const pos = getReceiverPosition(route, newProgress, lineOfScrimmageY)
          const isOpen = isInPerfectWindow(route, newProgress)
          return {
            index,
            x: pos.x,
            y: pos.y,
            progress: newProgress,
            isOpen,
            isTargeted: s.receivers[index]?.isTargeted || false,
            isPlayer: s.playerRole === 'receiver' && index === s.playerReceiverIndex,
          }
        })
        
        return { ...s, routeProgress: newProgress, receivers }
      })
      
      routeTimerRef.current = requestAnimationFrame(tick)
    }
    
    routeTimerRef.current = requestAnimationFrame(tick)
  }, [])
  
  // ============================================================================
  // AI THROW (for receiver mode)
  // ============================================================================
  
  const scheduleAIThrow = useCallback((play: PlayDefinition, targetIndex: number) => {
    // AI will throw when the receiver is in their perfect window (around 50-60% route progress)
    // Random timing between 1.5 and 2.5 seconds
    const throwDelay = 1500 + Math.random() * 1000
    
    phaseTimerRef.current = window.setTimeout(() => {
      setState(s => {
        if (s.phase !== 'READ') return s
        
        // AI always targets the player's receiver in receiver mode
        const route = play.routes[targetIndex]
        if (!route) return s
        
        const throwTiming = getThrowTiming(s.routeProgress)
        // Consistent formula: 85% at yardLine 0, 15% at yardLine 100
        const lineOfScrimmageY = 88 - (s.drive.yardLine / 100) * 76
        const targetPos = getReceiverPosition(route, Math.min(1, s.routeProgress + 0.15), lineOfScrimmageY)
        
        clearAllTimers()
        
        // Start ball flight
        const newState: GameState = {
          ...s,
          phase: 'THROW',
          throwTiming,
          targetReceiverIndex: targetIndex,
          receivers: s.receivers.map((r, i) => ({
            ...r,
            isTargeted: i === targetIndex,
          })),
          ball: {
            x: s.qbPosition.x,
            y: s.qbPosition.y,
            progress: 0,
            startX: s.qbPosition.x,
            startY: s.qbPosition.y,
            targetX: targetPos.x,
            targetY: targetPos.y,
            visible: true,
            inFlight: false,
          },
        }
        
        // Start ball flight after brief delay
        setTimeout(() => {
          setState(prev => ({ 
            ...prev, 
            phase: 'BALL_FLIGHT',
            ball: { ...prev.ball, inFlight: true },
          }))
          startBallFlight()
        }, 200)
        
        return newState
      })
    }, throwDelay)
  }, [clearAllTimers])
  
  // ============================================================================
  // THROW TO RECEIVER
  // ============================================================================
  
  const throwToReceiver = useCallback((receiverIndex: number) => {
    if (state.phase !== 'READ') return
    if (!state.selectedPlay) return
    
    clearAllTimers()
    
    const route = state.selectedPlay.routes[receiverIndex]
    if (!route) return
    
    const throwTiming = getThrowTiming(state.routeProgress)
    const targetReceiver = state.receivers[receiverIndex]
    
    // Calculate target position (lead the receiver slightly)
    // UNIFIED: yardLine 0 → Y=88%, yardLine 100 → Y=12%
    const lineOfScrimmageY = 88 - (state.drive.yardLine / 100) * 76
    const targetPos = getReceiverPosition(route, Math.min(1, state.routeProgress + 0.15), lineOfScrimmageY)
    
    // VARIABLE THROW PHYSICS - distance affects flight time and arc
    const flightDuration = getBallFlightDuration(route.expectedYards)
    const arcHeight = getBallArcHeight(route.expectedYards)
    
    // Show action word for perfect throws
    const actionWord: ActionWord | null = throwTiming === 'perfect' ? 'PERFECT!' : null
    
    setState(s => ({
      ...s,
      phase: 'THROW',
      throwTiming,
      targetReceiverIndex: receiverIndex,
      ballFlightDuration: flightDuration,
      ballArcHeight: arcHeight,
      actionWord,
      ballThrown: true, // Triggers break-on-ball behavior
      receivers: s.receivers.map((r, i) => ({
        ...r,
        isTargeted: i === receiverIndex,
      })),
      ball: {
        x: s.qbPosition.x,
        y: s.qbPosition.y,
        progress: 0,
        startX: s.qbPosition.x,
        startY: s.qbPosition.y,
        targetX: targetPos.x,
        targetY: targetPos.y,
        visible: true,
        inFlight: false,
      },
    }))
    
    // THROW -> BALL_FLIGHT (200ms)
    phaseTimerRef.current = window.setTimeout(() => {
      setState(s => ({ 
        ...s, 
        phase: 'BALL_FLIGHT',
        ball: { ...s.ball, inFlight: true },
      }))
      startBallFlight()
    }, 200)
  }, [state.phase, state.selectedPlay, state.routeProgress, state.receivers, state.drive.yardLine, state.qbPosition, clearAllTimers])
  
  // ============================================================================
  // BALL FLIGHT - Variable duration based on throw distance
  // ============================================================================
  
  const startBallFlight = useCallback(() => {
    // Get flight duration from state (set when throw initiated)
    let flightDuration = 800 // Default fallback
    setState(s => {
      flightDuration = s.ballFlightDuration
      return s
    })
    
    let lastTime = performance.now()
    
    const tick = (currentTime: number) => {
      const delta = currentTime - lastTime
      lastTime = currentTime
      
      setState(s => {
        if (s.phase !== 'BALL_FLIGHT') return s
        
        const newProgress = Math.min(1, s.ball.progress + delta / flightDuration)
        
        // Interpolate ball position from start to target with arc
        const x = s.ball.startX + (s.ball.targetX - s.ball.startX) * newProgress
        const y = s.ball.startY + (s.ball.targetY - s.ball.startY) * newProgress
        
        // Auto-catch if ball reaches target (player didn't press catch)
        if (newProgress >= 1) {
          clearAllTimers()
          return resolveCatch(s, 'late')
        }
        
        return {
          ...s,
          ball: { ...s.ball, x, y, progress: newProgress },
        }
      })
      
      ballFlightTimerRef.current = requestAnimationFrame(tick)
    }
    
    ballFlightTimerRef.current = requestAnimationFrame(tick)
  }, [clearAllTimers])
  
  // ============================================================================
  // CATCH ATTEMPT
  // ============================================================================
  
  const attemptCatch = useCallback(() => {
    if (state.phase !== 'BALL_FLIGHT') return
    
    clearAllTimers()
    
    const catchTiming = getCatchTiming(state.ball.progress)
    setState(s => resolveCatch(s, catchTiming))
  }, [state.phase, state.ball.progress, clearAllTimers])
  
  // Resolve catch and update state
  const resolveCatch = (s: GameState, catchTiming: CatchTiming): GameState => {
    if (!s.selectedPlay || s.targetReceiverIndex === null) return s
    
    const route = s.selectedPlay.routes[s.targetReceiverIndex]
    const receiver = s.receivers[s.targetReceiverIndex]
    
    // Calculate defender distance (simplified - use openness)
    const defenderDistance = receiver.isOpen ? 60 : 25
    
    // Calculate outcome
    const { outcome, yardsGained } = calculatePassOutcome(
      s.throwTiming || 'late',
      catchTiming,
      route.expectedYards,
      defenderDistance,
      s.difficulty
    )
    
    // Process result
    const { newDrive, playResult } = processPlayResult(s.drive, { outcome, yardsGained })
    
    // Determine action word and superhero replay trigger
    let actionWord: ActionWord | null = null
    let showSuperheroReplay = false
    let cameraShake: { intensity: number; duration: number } | null = null
    
    if (outcome === 'touchdown') {
      actionWord = 'TOUCHDOWN!'
      showSuperheroReplay = true // Always show for TDs
      cameraShake = { intensity: 8, duration: 300 }
    } else if (outcome === 'interception') {
      actionWord = 'PICKED!'
      cameraShake = { intensity: 10, duration: 400 }
    } else if (outcome === 'complete' && playResult.isFirstDown) {
      actionWord = 'FIRST DOWN!'
    } else if (outcome === 'incomplete') {
      actionWord = 'INCOMPLETE'
    } else if (isBigPlay(outcome, yardsGained)) {
      // Big play (25+ yards) - trigger superhero replay
      showSuperheroReplay = true
    }
    
    return {
      ...s,
      phase: 'RESULT',
      catchTiming,
      drive: newDrive,
      lastResult: playResult,
      ball: { ...s.ball, visible: outcome === 'complete' || outcome === 'touchdown' },
      actionWord,
      showSuperheroReplay,
      cameraShake,
    }
  }
  
  // ============================================================================
  // NEXT PLAY
  // ============================================================================
  
  const nextPlay = useCallback(() => {
    if (state.phase !== 'RESULT') return
    
    // Check for game over conditions
    const isGameOver = state.drive.quarter >= 4 && state.drive.timeRemaining <= 0
    
    if (isGameOver) {
      setState(s => ({ ...s, phase: 'GAME_OVER', isGameOver: true }))
      return
    }
    
    // Reset for next play
    setState(s => {
      // UNIFIED: yardLine 0 → Y=88%, yardLine 100 → Y=12%
      const lineOfScrimmageY = 88 - (s.drive.yardLine / 100) * 76
      const qbY = lineOfScrimmageY + 3.8 // QB 5% behind LOS
      
      return {
        ...s,
        phase: 'PRE_SNAP',
        selectedPlay: null,
        receivers: [],
        ball: { x: 0, y: qbY, progress: 0, startX: 0, startY: qbY, targetX: 0, targetY: 50, visible: false, inFlight: false },
        qbPosition: { x: 0, y: qbY },
        routeProgress: 0,
        throwTiming: null,
        catchTiming: null,
        lastResult: null,
        targetReceiverIndex: null,
        pocketTime: 0,
        // Reset cinematic states
        actionWord: null,
        showSuperheroReplay: false,
        cameraShake: null,
        // Decrement game clock
        drive: {
          ...s.drive,
          timeRemaining: Math.max(0, s.drive.timeRemaining - 8),
        },
      }
    })
  }, [state.phase, state.drive])
  
  // Auto-advance from RESULT phase for non-special outcomes
  useEffect(() => {
    if (state.phase === 'RESULT' && state.lastResult) {
      // Touchdown and interception get longer display
      const isBigPlay = state.lastResult.outcome === 'touchdown' || 
                        state.lastResult.outcome === 'interception'
      const delay = isBigPlay ? 2000 : 800 // Snappy transitions between plays
      
      const timer = setTimeout(() => {
        nextPlay()
      }, delay)
      
      return () => clearTimeout(timer)
    }
  }, [state.phase, state.lastResult, nextPlay])
  
  // ============================================================================
  // SET PLAYER ROLE
  // ============================================================================
  
  const setPlayerRole = useCallback((role: PlayerRole, receiverIndex?: number) => {
    setState(s => ({
      ...s,
      playerRole: role,
      playerReceiverIndex: role === 'receiver' ? (receiverIndex ?? 0) : null,
    }))
  }, [])
  
  // ============================================================================
  // RESET GAME
  // ============================================================================
  
  const resetGame = useCallback(() => {
    clearAllTimers()
    setState(s => createInitialState(weekId, s.playerRole, s.playerReceiverIndex))
  }, [weekId, clearAllTimers])
  
  // ============================================================================
  // RETURN
  // ============================================================================
  
  const actions: GameActions = {
    selectPlay,
    throwToReceiver,
    attemptCatch,
    nextPlay,
    resetGame,
    setPlayerRole,
  }
  
  return [state, actions]
}
