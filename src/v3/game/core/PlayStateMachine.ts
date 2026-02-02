/**
 * Play State Machine
 * 
 * Implements the complete offensive play flow:
 * PRE_SNAP → SNAP → DROPBACK → READ → THROW → BALL_FLIGHT → CATCH → YAC → RESOLUTION
 * 
 * Each state has proper entry animations, minimum durations, and transitions.
 */

import { StateMachine, StateConfig } from './StateMachine'
import { V3_CONFIG } from '../config/gameConfig'

// ============================================================================
// STATE TYPES
// ============================================================================

export type PlayState = 
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
  | 'OUT_OF_BOUNDS'
  | 'INCOMPLETE'
  | 'SACKED'
  | 'INTERCEPTION'
  | 'POST_PLAY'
  | 'QUARTER_END'
  | 'GAME_END'

export type PlayResolution = 
  | 'touchdown' 
  | 'tackle' 
  | 'outOfBounds' 
  | 'incomplete' 
  | 'sack' 
  | 'interception'

// ============================================================================
// CALLBACK TYPES
// ============================================================================

// Catch result data for auto-resolution
export interface CatchResult {
  receiverIndex: number
  catchY: number              // Where the catch happened (Y coordinate)
  yardsGained: number         // Calculated yards from LOS
  isTouchdown: boolean        // Did they score?
  throwQuality: 'perfect' | 'good' | 'late' | 'early'
  bonusYards: number          // Extra yards from throw quality
}

export interface PlayStateCallbacks {
  // State entry
  onPreSnapEnter?: () => void
  onSnapEnter?: () => void
  onDropbackEnter?: () => void
  onReadEnter?: () => void
  onThrowEnter?: (targetReceiver: number) => void
  onBallFlightEnter?: () => void
  onCatchEnter?: (result: CatchResult) => void  // Now receives full result
  onTouchdownEnter?: () => void
  onTackledEnter?: (yardsGained: number) => void  // Now receives yards gained
  onIncompleteEnter?: () => void
  onSackedEnter?: () => void
  onInterceptionEnter?: () => void
  onPostPlayEnter?: (resolution: PlayResolution) => void
  onQuarterEndEnter?: () => void
  onGameEndEnter?: () => void
  
  // State updates (called every frame while in state)
  onPreSnapUpdate?: (delta: number, progress: number) => void
  onDropbackUpdate?: (delta: number, progress: number) => void
  onReadUpdate?: (delta: number, pocketTimeRemaining: number) => void
  onBallFlightUpdate?: (delta: number, ball: { x: number, y: number }) => void
  
  // State exit
  onPreSnapExit?: () => void
  onSnapExit?: () => void
  onReadExit?: () => void
  onCatchExit?: () => void
  onPostPlayExit?: () => void
}

// ============================================================================
// PLAY STATE MACHINE
// ============================================================================

export class PlayStateMachine extends StateMachine<PlayState> {
  private callbacks: PlayStateCallbacks
  private pocketTimeStart: number = 0
  private pocketDuration: number = V3_CONFIG.timing.read.basePocketTime
  private throwTarget: number = -1
  private lastResolution: PlayResolution = 'incomplete'
  private catchResult: CatchResult | null = null  // Stores result for auto-resolution
  private yardsGained: number = 0
  
  constructor(callbacks: PlayStateCallbacks, weekDifficulty: number = 1) {
    super()
    this.callbacks = callbacks
    this.initializeStates()
  }
  
  private initializeStates(): void {
    const timing = V3_CONFIG.timing
    
    // PRE_SNAP - Build anticipation
    this.addState({
      id: 'PRE_SNAP',
      minDuration: timing.preSnap.minDuration,
      onEnter: () => {
        this.callbacks.onPreSnapEnter?.()
      },
      onUpdate: (delta, timeInState) => {
        const progress = Math.min(1, timeInState / 1500) // 1.5s anticipation build
        this.callbacks.onPreSnapUpdate?.(delta, progress)
      },
      onExit: () => {
        this.callbacks.onPreSnapExit?.()
      },
    })
    
    // SNAP - Quick transition with impact
    this.addState({
      id: 'SNAP',
      minDuration: timing.snap.duration,
      onEnter: () => {
        this.callbacks.onSnapEnter?.()
        
        // Auto-transition to DROPBACK after snap animation
        setTimeout(() => {
          this.transition('DROPBACK', true)
        }, timing.snap.duration)
      },
      onExit: () => {
        this.callbacks.onSnapExit?.()
      },
    })
    
    // DROPBACK - QB drops back into pocket
    this.addState({
      id: 'DROPBACK',
      minDuration: timing.dropback.duration,
      onEnter: () => {
        this.callbacks.onDropbackEnter?.()
        
        // Auto-transition to READ after dropback
        setTimeout(() => {
          this.transition('READ', true)
        }, timing.dropback.duration)
      },
      onUpdate: (delta, timeInState) => {
        const progress = Math.min(1, timeInState / timing.dropback.duration)
        this.callbacks.onDropbackUpdate?.(delta, progress)
      },
    })
    
    // READ - Main decision phase
    this.addState({
      id: 'READ',
      onEnter: () => {
        this.pocketTimeStart = performance.now()
        this.callbacks.onReadEnter?.()
      },
      onUpdate: (delta) => {
        const elapsed = performance.now() - this.pocketTimeStart
        const remaining = this.pocketDuration - elapsed
        
        this.callbacks.onReadUpdate?.(delta, remaining)
        
        // Check for sack (pocket collapse)
        if (remaining <= 0) {
          this.transition('SACKED', true)
        }
      },
      onExit: () => {
        this.callbacks.onReadExit?.()
      },
    })
    
    // THROW - Ball released
    this.addState({
      id: 'THROW',
      minDuration: timing.throw.windupDuration + timing.throw.releaseDuration,
      onEnter: () => {
        this.callbacks.onThrowEnter?.(this.throwTarget)
        
        // Transition to BALL_FLIGHT after throw animation
        const throwDuration = timing.throw.windupDuration + timing.throw.releaseDuration
        setTimeout(() => {
          this.transition('BALL_FLIGHT', true)
        }, throwDuration)
      },
    })
    
    // BALL_FLIGHT - Ball in air
    this.addState({
      id: 'BALL_FLIGHT',
      onEnter: () => {
        this.callbacks.onBallFlightEnter?.()
      },
      onUpdate: (delta) => {
        // Ball position is managed by scene, this just tracks updates
        // Scene will call transitionToCatch() when ball reaches target
      },
    })
    
    // CATCH - Reception with AUTO-RESOLUTION (no YAC running!)
    // After catch animation, immediately resolve to TD or TACKLED based on catch result
    this.addState({
      id: 'CATCH',
      minDuration: timing.catch.cleanDuration,
      onEnter: () => {
        if (this.catchResult) {
          this.callbacks.onCatchEnter?.(this.catchResult)
          this.yardsGained = this.catchResult.yardsGained
          
          // Auto-resolve after catch animation
          setTimeout(() => {
            if (this.catchResult?.isTouchdown) {
              this.transition('TOUCHDOWN', true)
            } else {
              this.transition('TACKLED', true)
            }
          }, timing.catch.cleanDuration + 200) // Small delay for visual
        }
      },
      onExit: () => {
        this.callbacks.onCatchExit?.()
      },
    })
    
    // YAC state kept for backwards compatibility but not used in main flow
    this.addState({
      id: 'YAC',
      onEnter: () => {
        // Immediately resolve - no running phase
        this.transition('TACKLED', true)
      },
    })
    
    // TOUCHDOWN
    this.addState({
      id: 'TOUCHDOWN',
      minDuration: timing.postPlay.touchdownCelebration,
      onEnter: () => {
        this.lastResolution = 'touchdown'
        this.callbacks.onTouchdownEnter?.()
        
        // Auto to POST_PLAY
        setTimeout(() => {
          this.transition('POST_PLAY', true)
        }, timing.postPlay.touchdownCelebration)
      },
    })
    
    // TACKLED - Now receives yards gained from catch resolution
    this.addState({
      id: 'TACKLED',
      minDuration: timing.postPlay.tackleAnimation,
      onEnter: () => {
        this.lastResolution = 'tackle'
        this.callbacks.onTackledEnter?.(this.yardsGained)
        
        setTimeout(() => {
          this.transition('POST_PLAY', true)
        }, timing.postPlay.tackleAnimation)
      },
    })
    
    // OUT_OF_BOUNDS
    this.addState({
      id: 'OUT_OF_BOUNDS',
      minDuration: 300,
      onEnter: () => {
        this.lastResolution = 'outOfBounds'
        
        setTimeout(() => {
          this.transition('POST_PLAY', true)
        }, 300)
      },
    })
    
    // INCOMPLETE
    this.addState({
      id: 'INCOMPLETE',
      minDuration: timing.postPlay.incompleteDelay,
      onEnter: () => {
        this.lastResolution = 'incomplete'
        this.callbacks.onIncompleteEnter?.()
        
        setTimeout(() => {
          this.transition('POST_PLAY', true)
        }, timing.postPlay.incompleteDelay)
      },
    })
    
    // SACKED
    this.addState({
      id: 'SACKED',
      minDuration: timing.postPlay.sackAnimation,
      onEnter: () => {
        this.lastResolution = 'sack'
        this.callbacks.onSackedEnter?.()
        
        setTimeout(() => {
          this.transition('POST_PLAY', true)
        }, timing.postPlay.sackAnimation)
      },
    })
    
    // INTERCEPTION
    this.addState({
      id: 'INTERCEPTION',
      minDuration: 800,
      onEnter: () => {
        this.lastResolution = 'interception'
        this.callbacks.onInterceptionEnter?.()
        
        setTimeout(() => {
          this.transition('POST_PLAY', true)
        }, 800)
      },
    })
    
    // POST_PLAY - Reset
    this.addState({
      id: 'POST_PLAY',
      minDuration: timing.postPlay.fieldResetDuration,
      onEnter: () => {
        this.callbacks.onPostPlayEnter?.(this.lastResolution)
      },
      onExit: () => {
        this.callbacks.onPostPlayExit?.()
      },
    })
    
    // QUARTER_END
    this.addState({
      id: 'QUARTER_END',
      minDuration: 2000,
      onEnter: () => {
        this.callbacks.onQuarterEndEnter?.()
      },
    })
    
    // GAME_END
    this.addState({
      id: 'GAME_END',
      onEnter: () => {
        this.callbacks.onGameEndEnter?.()
      },
    })
  }
  
  // ============================================================================
  // PUBLIC METHODS FOR SCENE CONTROL
  // ============================================================================
  
  /**
   * Start a new play (called when player selects a play)
   */
  startPlay(): void {
    if (this.getCurrentState() === 'PRE_SNAP') {
      this.transition('SNAP', true)
    }
  }
  
  /**
   * Throw to receiver (called when player taps an open receiver)
   */
  throwToReceiver(receiverIndex: number): void {
    if (this.getCurrentState() === 'READ') {
      this.throwTarget = receiverIndex
      this.transition('THROW', true)
    }
  }
  
  /**
   * Ball caught (called by scene when ball reaches receiver)
   * Now accepts the full catch result for auto-resolution
   */
  ballCaught(result: CatchResult): void {
    if (this.getCurrentState() === 'BALL_FLIGHT') {
      this.catchResult = result
      this.transition('CATCH', true)
    }
  }
  
  /**
   * Ball incomplete (called by scene if catch fails)
   */
  ballIncomplete(): void {
    if (this.getCurrentState() === 'BALL_FLIGHT' || this.getCurrentState() === 'CATCH') {
      this.transition('INCOMPLETE', true)
    }
  }
  
  /**
   * Ball intercepted
   */
  ballIntercepted(): void {
    if (this.getCurrentState() === 'BALL_FLIGHT') {
      this.transition('INTERCEPTION', true)
    }
  }
  
  /**
   * Get the last catch result
   */
  getCatchResult(): CatchResult | null {
    return this.catchResult
  }
  
  /**
   * Get yards gained from last play
   */
  getYardsGained(): number {
    return this.yardsGained
  }
  
  /**
   * Reset for next play
   */
  resetToPreSnap(): void {
    this.transition('PRE_SNAP', true)
  }
  
  /**
   * End the quarter
   */
  endQuarter(): void {
    this.transition('QUARTER_END', true)
  }
  
  /**
   * End the game
   */
  endGame(): void {
    this.transition('GAME_END', true)
  }
  
  /**
   * Set pocket duration (based on difficulty)
   */
  setPocketDuration(durationMs: number): void {
    this.pocketDuration = durationMs
  }
  
  /**
   * Get remaining pocket time
   */
  getPocketTimeRemaining(): number {
    if (this.getCurrentState() !== 'READ') return this.pocketDuration
    return Math.max(0, this.pocketDuration - (performance.now() - this.pocketTimeStart))
  }
  
  /**
   * Get pocket time as 0-1 progress (0 = just snapped, 1 = about to be sacked)
   */
  getPocketPressure(): number {
    if (this.getCurrentState() !== 'READ') return 0
    const elapsed = performance.now() - this.pocketTimeStart
    return Math.min(1, elapsed / this.pocketDuration)
  }
  
  /**
   * Get last play resolution
   */
  getLastResolution(): PlayResolution {
    return this.lastResolution
  }
}
