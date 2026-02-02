/**
 * Generic State Machine
 * 
 * Provides a clean, reusable state machine with:
 * - Entry/update/exit hooks per state
 * - Minimum duration enforcement
 * - Transition validation
 * - Event emission
 */

export interface StateConfig<T extends string> {
  id: T
  minDuration?: number
  onEnter?: () => void
  onUpdate?: (delta: number, timeInState: number) => void
  onExit?: () => void
}

export interface StateTransition<T extends string> {
  from: T
  to: T
  timestamp: number
  duration: number
}

export class StateMachine<T extends string> {
  private states: Map<T, StateConfig<T>> = new Map()
  private currentState: StateConfig<T> | null = null
  private stateStartTime: number = 0
  private transitions: StateTransition<T>[] = []
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map()
  
  /**
   * Register a state
   */
  addState(state: StateConfig<T>): this {
    this.states.set(state.id, state)
    return this
  }
  
  /**
   * Register multiple states at once
   */
  addStates(states: StateConfig<T>[]): this {
    states.forEach(s => this.addState(s))
    return this
  }
  
  /**
   * Attempt to transition to a new state
   * Returns true if transition succeeded
   */
  transition(to: T, force: boolean = false): boolean {
    const newState = this.states.get(to)
    if (!newState) {
      console.warn(`[StateMachine] Unknown state: ${to}`)
      return false
    }
    
    // Already in this state
    if (this.currentState?.id === to) {
      return false
    }
    
    const now = performance.now()
    
    // Check minimum duration unless forced
    if (!force && this.currentState?.minDuration) {
      const elapsed = now - this.stateStartTime
      if (elapsed < this.currentState.minDuration) {
        return false
      }
    }
    
    const previousState = this.currentState
    const duration = now - this.stateStartTime
    
    // Exit current state
    if (previousState) {
      previousState.onExit?.()
      
      // Record transition
      this.transitions.push({
        from: previousState.id,
        to,
        timestamp: now,
        duration,
      })
      
      // Keep last 50 transitions for debugging
      if (this.transitions.length > 50) {
        this.transitions.shift()
      }
    }
    
    // Enter new state
    this.currentState = newState
    this.stateStartTime = now
    
    // Emit state change event
    this.emit('stateChange', { 
      from: previousState?.id ?? null, 
      to, 
      timestamp: now 
    })
    
    newState.onEnter?.()
    
    return true
  }
  
  /**
   * Call this every frame to update the current state
   */
  update(delta: number): void {
    if (this.currentState?.onUpdate) {
      const timeInState = performance.now() - this.stateStartTime
      this.currentState.onUpdate(delta, timeInState)
    }
  }
  
  /**
   * Get current state ID
   */
  getCurrentState(): T | null {
    return this.currentState?.id ?? null
  }
  
  /**
   * Get time in current state (ms)
   */
  getTimeInState(): number {
    return performance.now() - this.stateStartTime
  }
  
  /**
   * Get normalized progress through state (0-1)
   * Returns 1 if no minDuration set
   */
  getStateProgress(): number {
    if (!this.currentState?.minDuration) return 1
    return Math.min(1, this.getTimeInState() / this.currentState.minDuration)
  }
  
  /**
   * Check if we can leave current state (minDuration met)
   */
  canTransition(): boolean {
    if (!this.currentState?.minDuration) return true
    return this.getTimeInState() >= this.currentState.minDuration
  }
  
  /**
   * Get recent transitions for debugging
   */
  getTransitionHistory(): StateTransition<T>[] {
    return [...this.transitions]
  }
  
  /**
   * Initialize to a starting state
   */
  start(initialState: T): void {
    const state = this.states.get(initialState)
    if (!state) {
      console.error(`[StateMachine] Cannot start - unknown state: ${initialState}`)
      return
    }
    
    this.currentState = state
    this.stateStartTime = performance.now()
    this.emit('stateChange', { from: null, to: initialState, timestamp: this.stateStartTime })
    state.onEnter?.()
  }
  
  /**
   * Reset the state machine
   */
  reset(): void {
    this.currentState?.onExit?.()
    this.currentState = null
    this.stateStartTime = 0
    this.transitions = []
  }
  
  // ============================================================================
  // Event System
  // ============================================================================
  
  on(event: string, callback: (...args: unknown[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }
  
  off(event: string, callback: (...args: unknown[]) => void): void {
    this.listeners.get(event)?.delete(callback)
  }
  
  private emit(event: string, data: unknown): void {
    this.listeners.get(event)?.forEach(cb => cb(data))
  }
}
