/**
 * V4 Defense Controls
 * 
 * Mobile-first touch/swipe handling for defensive gameplay:
 * - Pre-snap: Drag to reposition defenders, tap to select play
 * - During play: Tap to switch controlled player, swipe to move
 * - Timing buttons: Jump/dive for interceptions, rush moves for D-line
 */

import Phaser from 'phaser'

// ============================================================================
// TYPES
// ============================================================================

export type DefensePhase = 'preSnap' | 'snap' | 'inPlay' | 'ballInAir' | 'yac' | 'playEnd'

export type RushMove = 'swim' | 'bull' | 'spin' | 'rip'

export type CoverageAction = 'jump' | 'dive' | 'swat' | 'intercept'

export interface TouchState {
  isDown: boolean
  startX: number
  startY: number
  currentX: number
  currentY: number
  startTime: number
  velocity: { x: number, y: number }
}

export interface SwipeResult {
  direction: 'up' | 'down' | 'left' | 'right' | null
  distance: number
  velocity: number
  angle: number
}

export interface DefenderControl {
  /** Index of the currently controlled defender */
  controlledIndex: number
  /** Whether the player is actively controlling movement */
  isMoving: boolean
  /** Current movement direction */
  moveDirection: { x: number, y: number }
  /** Active rush move (for D-linemen) */
  activeRushMove: RushMove | null
  /** Cooldowns for special moves */
  cooldowns: Map<string, number>
}

export interface PreSnapAdjustment {
  defenderIndex: number
  originalX: number
  originalY: number
  adjustedX: number
  adjustedY: number
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CONTROL_CONFIG = {
  // Swipe thresholds
  swipe: {
    minDistance: 30,        // Minimum distance to register as swipe
    minVelocity: 0.3,       // Minimum velocity (pixels/ms)
    tapMaxDistance: 15,     // Maximum distance for tap
    tapMaxDuration: 200,    // Maximum duration for tap (ms)
  },
  
  // Movement
  movement: {
    baseSpeed: 3.5,         // Base defender movement speed
    sprintMultiplier: 1.4,  // Speed boost when sprinting
    joystickRadius: 60,     // Virtual joystick dead zone radius
    maxMoveDistance: 100,   // Max joystick distance from center
  },
  
  // Rush moves
  rushMoves: {
    swim: { cooldown: 2000, duration: 300, speedBoost: 1.8 },
    bull: { cooldown: 2500, duration: 400, speedBoost: 1.2 },
    spin: { cooldown: 3000, duration: 350, speedBoost: 2.0 },
    rip: { cooldown: 2000, duration: 280, speedBoost: 1.6 },
  },
  
  // Coverage actions
  coverageActions: {
    jump: { cooldown: 1500, timing: { perfect: 150, good: 300 } },
    dive: { cooldown: 2000, timing: { perfect: 200, good: 400 } },
    swat: { cooldown: 1000, timing: { perfect: 100, good: 200 } },
    intercept: { cooldown: 0, timing: { perfect: 120, good: 250 } }, // Auto on perfect jump
  },
  
  // Pre-snap
  preSnap: {
    maxAdjustDistance: 50,  // Maximum distance to adjust defender position
    showGuidelines: true,   // Show zone/man guidelines
  },
}

// ============================================================================
// DEFENSE CONTROLS CLASS
// ============================================================================

export class DefenseControls {
  private scene: Phaser.Scene
  private phase: DefensePhase = 'preSnap'
  
  // Touch state
  private touchState: TouchState = {
    isDown: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    startTime: 0,
    velocity: { x: 0, y: 0 },
  }
  
  // Control state
  private control: DefenderControl = {
    controlledIndex: -1,
    isMoving: false,
    moveDirection: { x: 0, y: 0 },
    activeRushMove: null,
    cooldowns: new Map(),
  }
  
  // Pre-snap adjustments
  private preSnapAdjustments: PreSnapAdjustment[] = []
  private draggedDefenderIndex: number = -1
  
  // Event emitter for scene communication
  private events: Phaser.Events.EventEmitter
  
  // Pointer tracking for multi-touch
  private activePointers: Map<number, TouchState> = new Map()
  
  // Timing state for actions
  private lastActionTime: number = 0
  private actionBuffer: CoverageAction | RushMove | null = null
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.events = new Phaser.Events.EventEmitter()
    this.setupInputHandlers()
  }
  
  // ============================================================================
  // SETUP
  // ============================================================================
  
  private setupInputHandlers(): void {
    const input = this.scene.input
    
    // Primary touch/mouse
    input.on('pointerdown', this.handlePointerDown, this)
    input.on('pointermove', this.handlePointerMove, this)
    input.on('pointerup', this.handlePointerUp, this)
    input.on('pointerupoutside', this.handlePointerUp, this)
    
    // Multi-touch for simultaneous move + action
    input.on('pointerdown', this.trackPointer, this)
    input.on('pointerup', this.untrackPointer, this)
  }
  
  // ============================================================================
  // PHASE MANAGEMENT
  // ============================================================================
  
  public setPhase(phase: DefensePhase): void {
    const previousPhase = this.phase
    this.phase = phase
    
    // Reset state on phase change
    if (previousPhase !== phase) {
      this.control.isMoving = false
      this.control.moveDirection = { x: 0, y: 0 }
      this.draggedDefenderIndex = -1
      
      // Clear action buffer between phases
      this.actionBuffer = null
      
      this.events.emit('phaseChanged', { from: previousPhase, to: phase })
    }
  }
  
  public getPhase(): DefensePhase {
    return this.phase
  }
  
  // ============================================================================
  // POINTER HANDLERS
  // ============================================================================
  
  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    this.touchState = {
      isDown: true,
      startX: pointer.x,
      startY: pointer.y,
      currentX: pointer.x,
      currentY: pointer.y,
      startTime: this.scene.time.now,
      velocity: { x: 0, y: 0 },
    }
    
    switch (this.phase) {
      case 'preSnap':
        this.handlePreSnapDown(pointer)
        break
      case 'inPlay':
      case 'ballInAir':
      case 'yac':
        this.handleInPlayDown(pointer)
        break
    }
  }
  
  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.touchState.isDown) return
    
    const now = this.scene.time.now
    const dt = Math.max(1, now - this.touchState.startTime)
    
    // Update velocity
    this.touchState.velocity = {
      x: (pointer.x - this.touchState.currentX) / dt * 16, // Normalize to ~60fps
      y: (pointer.y - this.touchState.currentY) / dt * 16,
    }
    
    this.touchState.currentX = pointer.x
    this.touchState.currentY = pointer.y
    
    switch (this.phase) {
      case 'preSnap':
        this.handlePreSnapMove(pointer)
        break
      case 'inPlay':
      case 'ballInAir':
      case 'yac':
        this.handleInPlayMove(pointer)
        break
    }
  }
  
  private handlePointerUp(pointer: Phaser.Input.Pointer): void {
    if (!this.touchState.isDown) return
    
    const swipe = this.detectSwipe()
    const isTap = this.detectTap()
    
    switch (this.phase) {
      case 'preSnap':
        this.handlePreSnapUp(pointer, isTap)
        break
      case 'inPlay':
      case 'ballInAir':
      case 'yac':
        this.handleInPlayUp(pointer, isTap, swipe)
        break
    }
    
    // Reset touch state
    this.touchState.isDown = false
    this.control.isMoving = false
  }
  
  // ============================================================================
  // PRE-SNAP CONTROLS
  // ============================================================================
  
  private handlePreSnapDown(pointer: Phaser.Input.Pointer): void {
    // Check if tapping a defender to select/drag
    const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y)
    
    this.events.emit('preSnapTapDown', {
      worldX: worldPoint.x,
      worldY: worldPoint.y,
      screenX: pointer.x,
      screenY: pointer.y,
    })
  }
  
  private handlePreSnapMove(pointer: Phaser.Input.Pointer): void {
    if (this.draggedDefenderIndex < 0) return
    
    const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y)
    
    this.events.emit('preSnapDrag', {
      defenderIndex: this.draggedDefenderIndex,
      worldX: worldPoint.x,
      worldY: worldPoint.y,
    })
  }
  
  private handlePreSnapUp(pointer: Phaser.Input.Pointer, isTap: boolean): void {
    if (this.draggedDefenderIndex >= 0) {
      // Finalize drag adjustment
      this.events.emit('preSnapDragEnd', {
        defenderIndex: this.draggedDefenderIndex,
      })
      this.draggedDefenderIndex = -1
    } else if (isTap) {
      // Tap to select defender or UI element
      const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y)
      this.events.emit('preSnapTap', {
        worldX: worldPoint.x,
        worldY: worldPoint.y,
        screenX: pointer.x,
        screenY: pointer.y,
      })
    }
  }
  
  /**
   * Called by scene when a defender is selected for dragging
   */
  public startDraggingDefender(index: number): void {
    this.draggedDefenderIndex = index
  }
  
  /**
   * Set max adjustment distance for a specific defender
   */
  public getMaxAdjustDistance(): number {
    return CONTROL_CONFIG.preSnap.maxAdjustDistance
  }
  
  // ============================================================================
  // IN-PLAY CONTROLS
  // ============================================================================
  
  private handleInPlayDown(pointer: Phaser.Input.Pointer): void {
    // Start movement tracking
    this.control.isMoving = true
    
    // Check for tap on defender to switch control
    const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y)
    
    this.events.emit('inPlayTapDown', {
      worldX: worldPoint.x,
      worldY: worldPoint.y,
      pointer,
    })
  }
  
  private handleInPlayMove(pointer: Phaser.Input.Pointer): void {
    // Calculate movement direction from drag
    const dx = pointer.x - this.touchState.startX
    const dy = pointer.y - this.touchState.startY
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance > CONTROL_CONFIG.movement.joystickRadius) {
      // Normalize direction
      const normalizedDist = Math.min(distance, CONTROL_CONFIG.movement.maxMoveDistance)
      const strength = normalizedDist / CONTROL_CONFIG.movement.maxMoveDistance
      
      this.control.moveDirection = {
        x: (dx / distance) * strength,
        y: (dy / distance) * strength,
      }
      
      this.events.emit('moveDefender', {
        index: this.control.controlledIndex,
        direction: this.control.moveDirection,
        strength,
      })
    } else {
      this.control.moveDirection = { x: 0, y: 0 }
    }
  }
  
  private handleInPlayUp(
    pointer: Phaser.Input.Pointer, 
    isTap: boolean, 
    swipe: SwipeResult
  ): void {
    if (isTap) {
      // Quick tap - switch to nearest defender OR trigger action
      const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y)
      
      this.events.emit('inPlayTap', {
        worldX: worldPoint.x,
        worldY: worldPoint.y,
      })
    } else if (swipe.direction) {
      // Swipe detected - trigger special move
      this.handleSwipeAction(swipe)
    }
    
    // Stop movement
    this.control.moveDirection = { x: 0, y: 0 }
    this.events.emit('stopMoving', { index: this.control.controlledIndex })
  }
  
  // ============================================================================
  // SWIPE DETECTION
  // ============================================================================
  
  private detectSwipe(): SwipeResult {
    const dx = this.touchState.currentX - this.touchState.startX
    const dy = this.touchState.currentY - this.touchState.startY
    const distance = Math.sqrt(dx * dx + dy * dy)
    const duration = this.scene.time.now - this.touchState.startTime
    const velocity = distance / Math.max(1, duration)
    
    if (distance < CONTROL_CONFIG.swipe.minDistance || 
        velocity < CONTROL_CONFIG.swipe.minVelocity) {
      return { direction: null, distance, velocity, angle: 0 }
    }
    
    const angle = Math.atan2(dy, dx) * (180 / Math.PI)
    let direction: 'up' | 'down' | 'left' | 'right'
    
    if (angle >= -45 && angle < 45) {
      direction = 'right'
    } else if (angle >= 45 && angle < 135) {
      direction = 'down'
    } else if (angle >= -135 && angle < -45) {
      direction = 'up'
    } else {
      direction = 'left'
    }
    
    return { direction, distance, velocity, angle }
  }
  
  private detectTap(): boolean {
    const dx = this.touchState.currentX - this.touchState.startX
    const dy = this.touchState.currentY - this.touchState.startY
    const distance = Math.sqrt(dx * dx + dy * dy)
    const duration = this.scene.time.now - this.touchState.startTime
    
    return distance <= CONTROL_CONFIG.swipe.tapMaxDistance && 
           duration <= CONTROL_CONFIG.swipe.tapMaxDuration
  }
  
  // ============================================================================
  // SPECIAL MOVES
  // ============================================================================
  
  private handleSwipeAction(swipe: SwipeResult): void {
    // Different actions based on phase and controlled player type
    if (this.isControllingDLineman()) {
      this.handleDLineSwipe(swipe)
    } else {
      this.handleCoverageSwipe(swipe)
    }
  }
  
  private handleDLineSwipe(swipe: SwipeResult): void {
    let move: RushMove | null = null
    
    switch (swipe.direction) {
      case 'up':
        move = 'bull'
        break
      case 'left':
      case 'right':
        move = 'swim'
        break
      case 'down':
        move = 'spin'
        break
    }
    
    if (move && this.canUseMove(move)) {
      this.activateRushMove(move)
    }
  }
  
  private handleCoverageSwipe(swipe: SwipeResult): void {
    // Up swipe = jump for interception
    // Down swipe = dive tackle
    let action: CoverageAction | null = null
    
    switch (swipe.direction) {
      case 'up':
        action = this.phase === 'ballInAir' ? 'jump' : 'swat'
        break
      case 'down':
        action = 'dive'
        break
    }
    
    if (action && this.canUseAction(action)) {
      this.activateCoverageAction(action)
    }
  }
  
  private activateRushMove(move: RushMove): void {
    const config = CONTROL_CONFIG.rushMoves[move]
    
    this.control.activeRushMove = move
    this.control.cooldowns.set(move, this.scene.time.now + config.cooldown)
    this.lastActionTime = this.scene.time.now
    
    this.events.emit('rushMove', {
      move,
      defenderIndex: this.control.controlledIndex,
      speedBoost: config.speedBoost,
      duration: config.duration,
    })
    
    // Clear after duration
    this.scene.time.delayedCall(config.duration, () => {
      if (this.control.activeRushMove === move) {
        this.control.activeRushMove = null
        this.events.emit('rushMoveEnd', { move })
      }
    })
  }
  
  private activateCoverageAction(action: CoverageAction): void {
    const config = CONTROL_CONFIG.coverageActions[action]
    
    if (config.cooldown > 0) {
      this.control.cooldowns.set(action, this.scene.time.now + config.cooldown)
    }
    this.lastActionTime = this.scene.time.now
    
    this.events.emit('coverageAction', {
      action,
      defenderIndex: this.control.controlledIndex,
      timing: config.timing,
    })
  }
  
  private canUseMove(move: RushMove): boolean {
    const cooldownEnd = this.control.cooldowns.get(move) || 0
    return this.scene.time.now >= cooldownEnd
  }
  
  private canUseAction(action: CoverageAction): boolean {
    const cooldownEnd = this.control.cooldowns.get(action) || 0
    return this.scene.time.now >= cooldownEnd
  }
  
  // ============================================================================
  // CONTROLLED PLAYER MANAGEMENT
  // ============================================================================
  
  public setControlledDefender(index: number): void {
    const previous = this.control.controlledIndex
    this.control.controlledIndex = index
    
    if (previous !== index) {
      this.events.emit('controlChanged', { from: previous, to: index })
    }
  }
  
  public getControlledDefender(): number {
    return this.control.controlledIndex
  }
  
  /**
   * Check if current controlled defender is a D-lineman
   * Scene should set this based on defender role
   */
  private _isControllingDLineman: boolean = false
  
  public setControllingDLineman(value: boolean): void {
    this._isControllingDLineman = value
  }
  
  private isControllingDLineman(): boolean {
    return this._isControllingDLineman
  }
  
  // ============================================================================
  // ACTION TIMING
  // ============================================================================
  
  /**
   * Check timing quality for interception attempt
   * Called when ball is near the controlled defender
   */
  public checkInterceptionTiming(ballArrivalMs: number): 'perfect' | 'good' | 'miss' {
    const actionTimeDiff = Math.abs(this.lastActionTime - ballArrivalMs)
    const config = CONTROL_CONFIG.coverageActions.intercept.timing
    
    if (actionTimeDiff <= config.perfect) {
      return 'perfect'
    } else if (actionTimeDiff <= config.good) {
      return 'good'
    }
    return 'miss'
  }
  
  /**
   * Buffer an action to execute when opportunity arises
   */
  public bufferAction(action: CoverageAction | RushMove): void {
    this.actionBuffer = action
  }
  
  /**
   * Check and consume buffered action
   */
  public consumeBufferedAction(): CoverageAction | RushMove | null {
    const action = this.actionBuffer
    this.actionBuffer = null
    return action
  }
  
  // ============================================================================
  // MULTI-TOUCH
  // ============================================================================
  
  private trackPointer(pointer: Phaser.Input.Pointer): void {
    this.activePointers.set(pointer.id, {
      isDown: true,
      startX: pointer.x,
      startY: pointer.y,
      currentX: pointer.x,
      currentY: pointer.y,
      startTime: this.scene.time.now,
      velocity: { x: 0, y: 0 },
    })
  }
  
  private untrackPointer(pointer: Phaser.Input.Pointer): void {
    this.activePointers.delete(pointer.id)
  }
  
  /**
   * Get number of active touches
   */
  public getActiveTouchCount(): number {
    return this.activePointers.size
  }
  
  /**
   * Check if player is using two-finger input (sprint/boost)
   */
  public isSprinting(): boolean {
    return this.activePointers.size >= 2 && this.control.isMoving
  }
  
  // ============================================================================
  // EVENT SUBSCRIPTION
  // ============================================================================
  
  public on(event: string, callback: (...args: unknown[]) => void): void {
    this.events.on(event, callback)
  }
  
  public off(event: string, callback: (...args: unknown[]) => void): void {
    this.events.off(event, callback)
  }
  
  public once(event: string, callback: (...args: unknown[]) => void): void {
    this.events.once(event, callback)
  }
  
  // ============================================================================
  // UPDATE & CLEANUP
  // ============================================================================
  
  /**
   * Called every frame to update movement
   */
  public update(delta: number): { x: number, y: number } {
    if (!this.control.isMoving) {
      return { x: 0, y: 0 }
    }
    
    let speed = CONTROL_CONFIG.movement.baseSpeed
    
    // Sprint boost with two-finger touch
    if (this.isSprinting()) {
      speed *= CONTROL_CONFIG.movement.sprintMultiplier
    }
    
    // Rush move speed boost
    if (this.control.activeRushMove) {
      const config = CONTROL_CONFIG.rushMoves[this.control.activeRushMove]
      speed *= config.speedBoost
    }
    
    return {
      x: this.control.moveDirection.x * speed * (delta / 16),
      y: this.control.moveDirection.y * speed * (delta / 16),
    }
  }
  
  /**
   * Get current cooldowns for UI display
   */
  public getCooldowns(): Map<string, { remaining: number, total: number }> {
    const now = this.scene.time.now
    const result = new Map<string, { remaining: number, total: number }>()
    
    for (const [key, endTime] of this.control.cooldowns) {
      const remaining = Math.max(0, endTime - now)
      const config = (CONTROL_CONFIG.rushMoves as Record<string, { cooldown: number }>)[key] ||
                     (CONTROL_CONFIG.coverageActions as Record<string, { cooldown: number }>)[key]
      
      if (config && remaining > 0) {
        result.set(key, { remaining, total: config.cooldown })
      }
    }
    
    return result
  }
  
  /**
   * Reset all state
   */
  public reset(): void {
    this.phase = 'preSnap'
    this.touchState = {
      isDown: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      startTime: 0,
      velocity: { x: 0, y: 0 },
    }
    this.control = {
      controlledIndex: -1,
      isMoving: false,
      moveDirection: { x: 0, y: 0 },
      activeRushMove: null,
      cooldowns: new Map(),
    }
    this.preSnapAdjustments = []
    this.draggedDefenderIndex = -1
    this.activePointers.clear()
    this.actionBuffer = null
  }
  
  /**
   * Cleanup when scene is destroyed
   */
  public destroy(): void {
    this.events.removeAllListeners()
    this.activePointers.clear()
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createDefenseControls(scene: Phaser.Scene): DefenseControls {
  return new DefenseControls(scene)
}
