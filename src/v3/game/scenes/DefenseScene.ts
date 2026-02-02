/**
 * V3 Defense Scene - Simplified Defense Gameplay
 * 
 * Core Loop:
 * 1. Pre-snap: Select coverage/blitz
 * 2. Snap: Control DeMarcus Lawrence (default)
 * 3. Rush: Swipe toward QB or pursue ball carrier
 * 4. Play ends: Sack, tackle, or opponent scores
 * 
 * Defense is simplified - only key snaps (3rd downs, red zone, etc.)
 */

import Phaser from 'phaser'
import { 
  DEFENSE_CONFIG,
  RULES_CONFIG,
  getDifficultyModifiers,
  getSnapDelay,
  SNAP_TIMING,
  type DifficultyModifiers,
  type DefensePlay,
} from '../data/v3Config'
import { AudioManager } from '../../../game/systems/AudioManager'
import { getOpponentColors } from '../data/stadiumBackgrounds'

// ============================================================================
// Types
// ============================================================================

type GamePhase = 'preSnap' | 'countdown' | 'passRush' | 'coverage' | 'tackle' | 'playComplete'

interface DefenderState {
  id: string
  jersey: number
  name: string
  position: string
  sprite: Phaser.GameObjects.Ellipse
  isPlayerControlled: boolean
  speed: number
  currentX: number
  currentY: number
}

interface OffensePlayerState {
  id: string
  role: 'qb' | 'receiver' | 'runner'
  sprite: Phaser.GameObjects.Ellipse
  hasBall: boolean
  currentX: number
  currentY: number
  targetX: number
  targetY: number
}

interface BlockerState {
  id: string
  position: 'LT' | 'LG' | 'C' | 'RG' | 'RT'
  sprite: Phaser.GameObjects.Ellipse
  currentX: number
  currentY: number
  blockStrength: number // 0-1, how well they're holding the block
  isEngaged: boolean // Currently blocking a defender
  engagedDefenderId: string | null
}

interface GameState {
  phase: GamePhase
  down: number
  yardsToGo: number
  ballPosition: number
  score: {
    home: number
    away: number
  }
  quarter: number
  clockMs: number
  selectedCoverage: DefensePlay
  tackleAttempts: number
  sackPressure: number // 0-1, how close to sacking QB
}

// ============================================================================
// Constants
// ============================================================================

const FIELD_WIDTH = 360
const FIELD_HEIGHT = 640
const YARD_HEIGHT = FIELD_HEIGHT / 50
const LINE_OF_SCRIMMAGE_Y = FIELD_HEIGHT * 0.35 // Defense starts higher on screen (looking down at offense)

const COLORS = {
  field: 0x2D5A27,
  fieldLines: 0xFFFFFF,
  defender: 0x69BE28, // Player controlled - green
  defenderAI: 0x4A9A1C, // AI controlled - darker green
  playerControlled: 0xFFD700, // Gold highlight
  // Opponent colors - defaults, overridden per game
  qb: 0xFF4444,
  receiver: 0xFF6666,
  blocker: 0xCC3333, // O-line blocker (darker red)
  blockerEngaged: 0xFF6600, // Blocker actively blocking
  ball: 0x8B4513,
}

// Dynamic opponent colors based on weekId
let OPPONENT_COLORS = {
  primary: 0xFF4444,
  accent: 0xFF6666,
}

// ============================================================================
// Scene
// ============================================================================

export class DefenseScene extends Phaser.Scene {
  // Game state
  private gameState!: GameState
  private difficulty!: DifficultyModifiers
  
  // Game objects
  private defenders: DefenderState[] = []
  private offensePlayers: OffensePlayerState[] = []
  private blockers: BlockerState[] = []
  private playerDefender: DefenderState | null = null
  private ball: Phaser.GameObjects.Ellipse | undefined = undefined
  
  // Input
  private targetPosition: { x: number; y: number } | null = null
  private lastTackleTime = 0
  
  // AI timing
  private aiThrowTimer = 0
  private playStartTime = 0
  
  // Interception timing system
  private interceptionWindowActive = false
  private interceptionWindowStart = 0
  private interceptionWindowDuration = 400 // 400ms window to tap for INT
  
  // Auto-snap countdown state
  private countdownStartTime = 0
  private countdownDuration = 3000
  private countdownRemaining = 0
  private lastCountdownStep = -1
  private weekId = 1
  
  constructor() {
    super({ key: 'DefenseScene' })
  }
  
  init(data: { weekId?: number } = {}) {
    this.weekId = data.weekId || 1
    this.difficulty = getDifficultyModifiers(this.weekId)
    
    // Set opponent colors based on weekId
    const oppColors = getOpponentColors(this.weekId)
    OPPONENT_COLORS = {
      primary: oppColors.primary,
      accent: oppColors.accent,
    }
    
    this.gameState = {
      phase: 'preSnap',
      down: 3, // Defense usually plays key downs
      yardsToGo: 8,
      ballPosition: 65, // Opponent at our 35
      score: { home: 14, away: 10 },
      quarter: 2,
      clockMs: 45000,
      selectedCoverage: 'man',
      tackleAttempts: 0,
      sackPressure: 0,
    }
  }
  
  create() {
    // Draw field (from defense perspective - looking down at offense)
    this.createField()
    
    // Create offense (AI controlled)
    this.createOffense()
    
    // Create defense (player + AI)
    this.createDefense()
    
    // Setup input
    this.setupInput()
    
    // Emit ready event
    this.events.emit('gameReady', this.gameState)
  }
  
  update(time: number, delta: number) {
    switch (this.gameState.phase) {
      case 'preSnap':
        // Waiting for coverage selection (handled by React UI)
        break
        
      case 'countdown':
        // Auto-snap countdown
        this.updateCountdown(time)
        break
        
      case 'passRush':
        this.updatePassRush(time, delta)
        break
        
      case 'coverage':
        this.updateCoverage(delta)
        break
        
      case 'tackle':
        this.updateTackle(delta)
        break
        
      case 'playComplete':
        // Wait for next play
        break
    }
    
    // Update clock
    if (this.gameState.phase !== 'preSnap' && this.gameState.phase !== 'playComplete') {
      this.gameState.clockMs -= delta
      if (this.gameState.clockMs <= 0) {
        this.handleQuarterEnd()
      }
    }
    
    // Emit state
    this.events.emit('gameStateUpdate', this.gameState)
  }
  
  // ============================================================================
  // Field Creation
  // ============================================================================
  
  private createField() {
    // Field background
    this.add.rectangle(FIELD_WIDTH / 2, FIELD_HEIGHT / 2, FIELD_WIDTH, FIELD_HEIGHT, COLORS.field)
    
    // Yard lines
    const graphics = this.add.graphics()
    graphics.lineStyle(2, COLORS.fieldLines, 0.3)
    
    for (let i = 0; i <= 50; i += 5) {
      const y = LINE_OF_SCRIMMAGE_Y + (i * YARD_HEIGHT)
      graphics.moveTo(0, y)
      graphics.lineTo(FIELD_WIDTH, y)
    }
    graphics.strokePath()
    
    // Line of scrimmage
    graphics.lineStyle(3, 0xFF4444, 0.6)
    graphics.moveTo(0, LINE_OF_SCRIMMAGE_Y)
    graphics.lineTo(FIELD_WIDTH, LINE_OF_SCRIMMAGE_Y)
    graphics.strokePath()
  }
  
  // ============================================================================
  // Player Creation
  // ============================================================================
  
  private createOffense() {
    // QB
    const qb: OffensePlayerState = {
      id: 'qb',
      role: 'qb',
      sprite: this.add.ellipse(FIELD_WIDTH / 2, LINE_OF_SCRIMMAGE_Y + 60, 30, 30, OPPONENT_COLORS.primary),
      hasBall: true,
      currentX: FIELD_WIDTH / 2,
      currentY: LINE_OF_SCRIMMAGE_Y + 60,
      targetX: FIELD_WIDTH / 2,
      targetY: LINE_OF_SCRIMMAGE_Y + 60,
    }
    qb.sprite.setStrokeStyle(3, OPPONENT_COLORS.accent)
    
    // Receivers
    const receiverPositions = [
      { x: FIELD_WIDTH * 0.15, y: LINE_OF_SCRIMMAGE_Y - 5 },
      { x: FIELD_WIDTH * 0.85, y: LINE_OF_SCRIMMAGE_Y - 5 },
      { x: FIELD_WIDTH * 0.35, y: LINE_OF_SCRIMMAGE_Y - 5 },
    ]
    
    const receivers = receiverPositions.map((pos, i) => {
      const sprite = this.add.ellipse(pos.x, pos.y, 25, 25, OPPONENT_COLORS.accent)
      sprite.setStrokeStyle(2, OPPONENT_COLORS.primary)
      
      return {
        id: `rec_${i}`,
        role: 'receiver' as const,
        sprite,
        hasBall: false,
        currentX: pos.x,
        currentY: pos.y,
        targetX: pos.x,
        targetY: pos.y - 150, // Route target
      }
    })
    
    this.offensePlayers = [qb, ...receivers]
    
    // Create offensive line
    this.createBlockers()
  }
  
  private createBlockers() {
    // 5 O-linemen positions (from left to right: LT, LG, C, RG, RT)
    const blockerConfigs: Array<{ position: BlockerState['position']; x: number }> = [
      { position: 'LT', x: FIELD_WIDTH * 0.25 },
      { position: 'LG', x: FIELD_WIDTH * 0.38 },
      { position: 'C', x: FIELD_WIDTH * 0.5 },
      { position: 'RG', x: FIELD_WIDTH * 0.62 },
      { position: 'RT', x: FIELD_WIDTH * 0.75 },
    ]
    
    const blockerY = LINE_OF_SCRIMMAGE_Y + 15 // Just behind the LOS
    
    blockerConfigs.forEach((config, i) => {
      const sprite = this.add.ellipse(config.x, blockerY, 32, 28, OPPONENT_COLORS.primary)
      sprite.setStrokeStyle(2, OPPONENT_COLORS.accent)
      
      const blocker: BlockerState = {
        id: `ol_${i}`,
        position: config.position,
        sprite,
        currentX: config.x,
        currentY: blockerY,
        blockStrength: 1.0, // Full strength at start
        isEngaged: false,
        engagedDefenderId: null,
      }
      
      this.blockers.push(blocker)
    })
  }
  
  private createDefense() {
    // DeMarcus Lawrence (player controlled)
    const demarcus = this.createDefender({
      id: 'dl_0',
      jersey: 0,
      name: 'DeMarcus Lawrence',
      position: 'DE',
      x: FIELD_WIDTH * 0.3,
      y: LINE_OF_SCRIMMAGE_Y - 40,
      isPlayerControlled: true,
    })
    this.playerDefender = demarcus
    
    // Other defenders (AI)
    const aiPositions = [
      { id: 'dl_1', jersey: 99, name: 'L. Williams', position: 'DT', x: FIELD_WIDTH * 0.5, y: LINE_OF_SCRIMMAGE_Y - 35 },
      { id: 'dl_2', jersey: 91, name: 'J. Jones', position: 'DE', x: FIELD_WIDTH * 0.7, y: LINE_OF_SCRIMMAGE_Y - 40 },
      { id: 'lb_0', jersey: 54, name: 'B. Wagner', position: 'LB', x: FIELD_WIDTH * 0.5, y: LINE_OF_SCRIMMAGE_Y - 80 },
      { id: 'cb_0', jersey: 21, name: 'D. Witherspoon', position: 'CB', x: FIELD_WIDTH * 0.15, y: LINE_OF_SCRIMMAGE_Y - 100 },
      { id: 'cb_1', jersey: 4, name: 'R. James', position: 'CB', x: FIELD_WIDTH * 0.85, y: LINE_OF_SCRIMMAGE_Y - 100 },
    ]
    
    aiPositions.forEach(config => {
      this.createDefender({ ...config, isPlayerControlled: false })
    })
  }
  
  private createDefender(config: {
    id: string
    jersey: number
    name: string
    position: string
    x: number
    y: number
    isPlayerControlled: boolean
  }): DefenderState {
    const color = config.isPlayerControlled ? COLORS.defender : COLORS.defenderAI
    const sprite = this.add.ellipse(config.x, config.y, config.isPlayerControlled ? 32 : 28, config.isPlayerControlled ? 32 : 28, color)
    
    if (config.isPlayerControlled) {
      sprite.setStrokeStyle(4, COLORS.playerControlled)
      
      // Add pulsing glow ring for player-controlled defender
      const glowRing = this.add.ellipse(config.x, config.y, 50, 50)
      glowRing.setStrokeStyle(3, COLORS.playerControlled, 0.4)
      glowRing.setFillStyle(0x000000, 0) // Transparent fill
      
      // Pulsing animation
      this.tweens.add({
        targets: glowRing,
        scaleX: 1.2,
        scaleY: 1.2,
        alpha: 0.2,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })
      
      // Store glow ring reference on sprite
      sprite.setData('glowRing', glowRing)
      
      // Player name label
      this.add.text(config.x, config.y - 28, 'YOU', {
        fontSize: '10px',
        fontFamily: 'Oswald',
        color: '#FFD700',
        fontStyle: 'bold',
      }).setOrigin(0.5).setAlpha(0.9)
    } else {
      sprite.setStrokeStyle(2, 0x2D5A27)
    }
    
    // Jersey number
    this.add.text(config.x, config.y, config.jersey.toString(), {
      fontSize: config.isPlayerControlled ? '14px' : '12px',
      fontFamily: 'Oswald',
      color: config.isPlayerControlled ? '#FFFFFF' : '#002244',
      fontStyle: config.isPlayerControlled ? 'bold' : 'normal',
    }).setOrigin(0.5)
    
    const baseSpeed = config.isPlayerControlled 
      ? DEFENSE_CONFIG.movement.playerDefenderSpeed
      : DEFENSE_CONFIG.movement.aiDefenderSpeed
    
    const defender: DefenderState = {
      id: config.id,
      jersey: config.jersey,
      name: config.name,
      position: config.position,
      sprite,
      isPlayerControlled: config.isPlayerControlled,
      speed: baseSpeed * this.difficulty.defenderSpeedMultiplier,
      currentX: config.x,
      currentY: config.y,
    }
    
    this.defenders.push(defender)
    return defender
  }
  
  // ============================================================================
  // Input
  // ============================================================================
  
  private setupInput() {
    // Tap/drag to set target, tap to tackle
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // During countdown, allow changing coverage but don't start manually
      if (this.gameState.phase === 'preSnap' || this.gameState.phase === 'countdown') {
        // Just set target position for when play starts
        this.targetPosition = { x: pointer.x, y: pointer.y }
        return
      }
      
      // Set movement target for player-controlled defender
      this.targetPosition = { x: pointer.x, y: pointer.y }
      
      // Check for tackle attempt
      if (this.gameState.phase === 'passRush' || this.gameState.phase === 'coverage') {
        this.attemptTackle()
      }
    })
    
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown && this.gameState.phase !== 'preSnap' && this.gameState.phase !== 'countdown') {
        this.targetPosition = { x: pointer.x, y: pointer.y }
      }
    })
  }
  
  // ============================================================================
  // Game Phases
  // ============================================================================
  
  // ============================================================================
  // Auto-Snap Countdown
  // ============================================================================
  
  private updateCountdown(time: number) {
    const elapsed = time - this.countdownStartTime
    this.countdownRemaining = Math.max(0, this.countdownDuration - elapsed)
    
    // Calculate current countdown step (3, 2, 1, 0)
    const progress = elapsed / this.countdownDuration
    const stepIndex = Math.min(
      SNAP_TIMING.countdownSteps.length - 1,
      Math.floor(progress * SNAP_TIMING.countdownSteps.length)
    )
    const currentStep = SNAP_TIMING.countdownSteps[stepIndex]
    
    // Emit countdown step changes for React UI
    if (currentStep !== this.lastCountdownStep) {
      this.lastCountdownStep = currentStep
      this.events.emit('countdownStep', { 
        step: currentStep,
        remaining: this.countdownRemaining,
        isSnap: currentStep === 0
      })
    }
    
    // Auto-snap when countdown reaches 0
    if (this.countdownRemaining <= 0) {
      this.snapBall()
    }
  }
  
  public startCountdown() {
    this.gameState.phase = 'countdown'
    this.countdownStartTime = this.time.now
    this.countdownDuration = getSnapDelay(this.weekId)
    this.countdownRemaining = this.countdownDuration
    this.lastCountdownStep = -1
    
    this.events.emit('countdownStarted', {
      duration: this.countdownDuration,
      weekId: this.weekId
    })
  }
  
  private snapBall() {
    this.gameState.phase = 'passRush'
    this.playStartTime = this.time.now
    this.aiThrowTimer = DEFENSE_CONFIG.passRush.aiQbThrowWindowMs
    this.gameState.sackPressure = 0
    
    this.events.emit('playStarted')
  }
  
  private updatePassRush(time: number, delta: number) {
    // Update blocker engagements first
    this.updateBlockerEngagements()
    
    // Move player-controlled defender (with blocker collision)
    if (this.playerDefender && this.targetPosition) {
      this.moveDefenderToTarget(this.playerDefender, delta)
    }
    
    // AI defenders rush QB (with blocker collision)
    this.defenders.forEach(def => {
      if (!def.isPlayerControlled) {
        this.aiRushQB(def, delta)
      }
    })
    
    // Check sack pressure
    const qb = this.offensePlayers.find(p => p.role === 'qb')
    if (qb) {
      this.checkSackPressure(qb)
    }
    
    // AI QB throw timer
    this.aiThrowTimer -= delta
    if (this.aiThrowTimer <= 0) {
      this.aiQBThrow()
    }
    
    // Run receiver routes
    this.runReceiverRoutes(delta)
  }
  
  /**
   * Check which blockers are engaged with which defenders
   */
  private updateBlockerEngagements() {
    const BLOCK_ENGAGE_RADIUS = 40 // Distance to engage a blocker
    
    // Reset all blocker engagements
    this.blockers.forEach(b => {
      b.isEngaged = false
      b.engagedDefenderId = null
    })
    
    // Check each defender against each blocker
    this.defenders.forEach(defender => {
      // Find closest unengaged blocker
      let closestBlocker: BlockerState | null = null
      let closestDist = Infinity
      
      this.blockers.forEach(blocker => {
        const dist = Phaser.Math.Distance.Between(
          defender.currentX, defender.currentY,
          blocker.currentX, blocker.currentY
        )
        
        if (dist < BLOCK_ENGAGE_RADIUS && dist < closestDist && !blocker.isEngaged) {
          closestDist = dist
          closestBlocker = blocker
        }
      })
      
      if (closestBlocker) {
        closestBlocker.isEngaged = true
        closestBlocker.engagedDefenderId = defender.id
        
        // Visual feedback - blocker turns orange when engaged
        closestBlocker.sprite.setFillStyle(COLORS.blockerEngaged)
      }
    })
    
    // Reset non-engaged blockers to normal color
    this.blockers.forEach(b => {
      if (!b.isEngaged) {
        b.sprite.setFillStyle(COLORS.blocker)
      }
    })
  }
  
  /**
   * Check if a defender is being blocked and return speed multiplier
   */
  private getBlockedSpeedMultiplier(defender: DefenderState): number {
    const engagingBlocker = this.blockers.find(b => b.engagedDefenderId === defender.id)
    
    if (engagingBlocker && engagingBlocker.blockStrength > 0) {
      // Blocked! Speed reduced based on block strength
      // blockStrength 1.0 = 80% speed reduction, 0 = no reduction
      return 1 - (engagingBlocker.blockStrength * 0.8)
    }
    
    return 1.0 // Not blocked, full speed
  }
  
  private moveDefenderToTarget(defender: DefenderState, delta: number) {
    if (!this.targetPosition) return
    
    const angle = Phaser.Math.Angle.Between(
      defender.currentX,
      defender.currentY,
      this.targetPosition.x,
      this.targetPosition.y
    )
    
    const distance = Phaser.Math.Distance.Between(
      defender.currentX,
      defender.currentY,
      this.targetPosition.x,
      this.targetPosition.y
    )
    
    if (distance > 10) {
      // Apply coverage bonus if in blitz
      let speed = defender.speed
      if (this.gameState.selectedCoverage === 'blitz') {
        speed *= DEFENSE_CONFIG.coverage.blitz.passRushSpeedBonus
      }
      
      // Apply blocking penalty
      const blockMultiplier = this.getBlockedSpeedMultiplier(defender)
      speed *= blockMultiplier
      
      const moveDistance = (speed * delta) / 1000
      defender.currentX += Math.cos(angle) * moveDistance
      defender.currentY += Math.sin(angle) * moveDistance
      
      // Clamp to field
      defender.currentX = Phaser.Math.Clamp(defender.currentX, 20, FIELD_WIDTH - 20)
      defender.currentY = Phaser.Math.Clamp(defender.currentY, 20, FIELD_HEIGHT - 20)
      
      defender.sprite.setPosition(defender.currentX, defender.currentY)
      
      // Update glow ring position if this is player defender
      if (defender.isPlayerControlled) {
        const glowRing = defender.sprite.getData('glowRing') as Phaser.GameObjects.Ellipse
        if (glowRing) {
          glowRing.setPosition(defender.currentX, defender.currentY)
        }
      }
    }
  }
  
  private aiRushQB(defender: DefenderState, delta: number) {
    const qb = this.offensePlayers.find(p => p.role === 'qb')
    if (!qb) return
    
    const angle = Phaser.Math.Angle.Between(
      defender.currentX,
      defender.currentY,
      qb.currentX,
      qb.currentY
    )
    
    // Apply blocking penalty to AI defenders too
    let speed = defender.speed
    const blockMultiplier = this.getBlockedSpeedMultiplier(defender)
    speed *= blockMultiplier
    
    const moveDistance = (speed * delta) / 1000
    defender.currentX += Math.cos(angle) * moveDistance
    defender.currentY += Math.sin(angle) * moveDistance
    
    defender.sprite.setPosition(defender.currentX, defender.currentY)
  }
  
  private runReceiverRoutes(delta: number) {
    this.offensePlayers.forEach(player => {
      if (player.role !== 'receiver') return
      
      const angle = Phaser.Math.Angle.Between(
        player.currentX,
        player.currentY,
        player.targetX,
        player.targetY
      )
      
      const speed = 200 * (delta / 1000)
      player.currentX += Math.cos(angle) * speed
      player.currentY += Math.sin(angle) * speed
      
      player.sprite.setPosition(player.currentX, player.currentY)
    })
  }
  
  private checkSackPressure(qb: OffensePlayerState) {
    let closestDistance = Infinity
    
    this.defenders.forEach(def => {
      const dist = Phaser.Math.Distance.Between(
        def.currentX,
        def.currentY,
        qb.currentX,
        qb.currentY
      )
      
      if (dist < closestDistance) {
        closestDistance = dist
      }
      
      // Check for sack
      if (dist < DEFENSE_CONFIG.passRush.sackRadius) {
        this.handleSack()
        return
      }
    })
    
    // Update pressure level based on closest defender
    if (closestDistance < DEFENSE_CONFIG.passRush.pressureRadius) {
      this.gameState.sackPressure = 1 - (closestDistance / DEFENSE_CONFIG.passRush.pressureRadius)
    } else {
      this.gameState.sackPressure = 0
    }
  }
  
  private attemptTackle() {
    const now = this.time.now
    if (now - this.lastTackleTime < DEFENSE_CONFIG.tackle.tackleCooldownMs) return
    
    this.lastTackleTime = now
    this.gameState.tackleAttempts++
    
    // Check if near ball carrier
    const ballCarrier = this.offensePlayers.find(p => p.hasBall)
    if (!ballCarrier || !this.playerDefender) return
    
    const dist = Phaser.Math.Distance.Between(
      this.playerDefender.currentX,
      this.playerDefender.currentY,
      ballCarrier.currentX,
      ballCarrier.currentY
    )
    
    if (dist < DEFENSE_CONFIG.tackle.tackleRadius) {
      // Roll for tackle success
      const missChance = DEFENSE_CONFIG.tackle.earlyTackleMissRate
      if (Math.random() > missChance) {
        if (ballCarrier.role === 'qb') {
          this.handleSack()
        } else {
          this.handleTackle(ballCarrier)
        }
      } else {
        // Missed tackle
        this.events.emit('missedTackle')
      }
    }
  }
  
  private aiQBThrow() {
    // AI QB throws to random receiver
    const receivers = this.offensePlayers.filter(p => p.role === 'receiver')
    const target = receivers[Phaser.Math.Between(0, receivers.length - 1)]
    
    if (target) {
      const qb = this.offensePlayers.find(p => p.role === 'qb')
      if (!qb) return
      
      // Create ball sprite for interception window
      this.ball = this.add.ellipse(qb.currentX, qb.currentY, 14, 10, COLORS.ball)
      this.ball.setStrokeStyle(2, 0xFFFFFF, 0.5)
      this.ball.setData('targetReceiver', target)
      this.ball.setData('startX', qb.currentX)
      this.ball.setData('startY', qb.currentY)
      this.ball.setData('progress', 0)
      this.ball.setData('interceptable', false) // Becomes true at interception window
      
      qb.hasBall = false
      
      this.gameState.phase = 'coverage'
      this.interceptionWindowActive = false
      this.events.emit('ballThrown', { target: target.id })
    }
  }
  
  // Timing-based interception - player must tap at the right moment
  public attemptInterception() {
    if (!this.ball || !this.interceptionWindowActive) {
      this.events.emit('interceptionMissed', { reason: 'no_window' })
      return false
    }
    
    const target = this.ball.getData('targetReceiver') as OffensePlayerState
    if (!target || !this.playerDefender) return false
    
    // Check if player defender is close enough to the ball's path
    const ballX = this.ball.x
    const ballY = this.ball.y
    const distToPlayer = Phaser.Math.Distance.Between(
      this.playerDefender.currentX,
      this.playerDefender.currentY,
      ballX,
      ballY
    )
    
    const interceptRadius = 50 // How close you need to be
    
    if (distToPlayer < interceptRadius) {
      // INTERCEPTION! 
      this.handleInterception()
      return true
    } else {
      // Too far - missed opportunity
      this.events.emit('interceptionMissed', { reason: 'too_far', distance: distToPlayer })
      return false
    }
  }
  
  private handleInterception() {
    this.ball?.destroy()
    this.ball = undefined
    this.interceptionWindowActive = false
    
    // Play interception sound
    AudioManager.playInterception()
    
    // Turnover!
    this.events.emit('interception', { 
      interceptedBy: this.playerDefender?.id,
      position: { x: this.playerDefender?.currentX, y: this.playerDefender?.currentY }
    })
    
    // End play with turnover
    this.endPlay({ 
      type: 'interception', 
      yardsGained: 0, 
      result: 'turnover' 
    })
  }
  
  private updateCoverage(delta: number) {
    // First, animate the ball if it exists (ball in air phase)
    if (this.ball) {
      this.updateBallInFlight(delta)
      return // Don't run coverage until ball is caught
    }
    
    const ballCarrier = this.offensePlayers.find(p => p.hasBall)
    if (!ballCarrier) return
    
    // Ball carrier runs downfield
    ballCarrier.currentY += 180 * (delta / 1000)
    ballCarrier.sprite.setPosition(ballCarrier.currentX, ballCarrier.currentY)
    
    // Move player defender
    if (this.playerDefender && this.targetPosition) {
      this.moveDefenderToTarget(this.playerDefender, delta)
    }
    
    // AI defenders pursue
    this.defenders.forEach(def => {
      if (!def.isPlayerControlled) {
        const angle = Phaser.Math.Angle.Between(
          def.currentX,
          def.currentY,
          ballCarrier.currentX,
          ballCarrier.currentY
        )
        
        const speed = def.speed * 0.9 // Slightly slower in coverage
        const moveDistance = (speed * delta) / 1000
        
        def.currentX += Math.cos(angle) * moveDistance
        def.currentY += Math.sin(angle) * moveDistance
        def.sprite.setPosition(def.currentX, def.currentY)
        
        // Check for AI tackle
        const dist = Phaser.Math.Distance.Between(
          def.currentX,
          def.currentY,
          ballCarrier.currentX,
          ballCarrier.currentY
        )
        
        if (dist < 30) {
          this.handleTackle(ballCarrier)
        }
      }
    })
    
    // Check if TD scored
    if (ballCarrier.currentY > FIELD_HEIGHT) {
      this.handleOpponentTouchdown()
    }
  }
  
  private updateBallInFlight(delta: number) {
    if (!this.ball) return
    
    const target = this.ball.getData('targetReceiver') as OffensePlayerState
    const startX = this.ball.getData('startX') as number
    const startY = this.ball.getData('startY') as number
    let progress = this.ball.getData('progress') as number
    
    // Move ball toward receiver
    const ballSpeed = 450 * (delta / 1000)
    const totalDist = Phaser.Math.Distance.Between(startX, startY, target.currentX, target.currentY)
    progress += ballSpeed / totalDist
    
    // Update ball position with arc
    const x = Phaser.Math.Linear(startX, target.currentX, progress)
    const arcHeight = 40
    const arc = Math.sin(progress * Math.PI) * arcHeight
    const y = Phaser.Math.Linear(startY, target.currentY, progress) - arc
    
    this.ball.setPosition(x, y)
    this.ball.setData('progress', progress)
    
    // INTERCEPTION WINDOW - active when ball is 40-70% of the way there
    const windowStart = 0.35
    const windowEnd = 0.65
    
    if (progress >= windowStart && progress <= windowEnd) {
      if (!this.interceptionWindowActive) {
        this.interceptionWindowActive = true
        this.interceptionWindowStart = this.time.now
        
        // Visual indicator - ball glows
        this.ball.setStrokeStyle(4, 0xFFD700, 1)
        
        // Emit event for React to show "TAP NOW" overlay
        this.events.emit('interceptionWindow', { active: true })
      }
    } else if (this.interceptionWindowActive && progress > windowEnd) {
      // Window closed
      this.interceptionWindowActive = false
      this.ball.setStrokeStyle(2, 0xFFFFFF, 0.5)
      this.events.emit('interceptionWindow', { active: false })
    }
    
    // Ball arrives at receiver
    if (progress >= 1) {
      this.ball.destroy()
      this.ball = undefined
      this.interceptionWindowActive = false
      
      // Receiver now has the ball
      target.hasBall = true
      this.events.emit('ballCaught', { receiverId: target.id })
    }
  }
  
  private updateTackle(_delta: number) {
    // Animation handled elsewhere
  }
  
  // ============================================================================
  // Play Outcomes
  // ============================================================================
  
  private handleSack() {
    this.gameState.phase = 'playComplete'
    this.gameState.yardsToGo += 7 // Loss of 7 yards
    this.gameState.down++
    
    // Play sack sound
    AudioManager.playSack()
    
    this.events.emit('sack')
    
    if (this.gameState.down > 4) {
      // Turnover on downs!
      this.handleTurnoverOnDowns()
    } else {
      this.scheduleNextPlay()
    }
  }
  
  private handleTackle(ballCarrier: OffensePlayerState) {
    this.gameState.phase = 'playComplete'
    
    // Play tackle sound
    AudioManager.playTackle()
    
    // Calculate yards gained by offense
    const yardsGained = Math.round((ballCarrier.currentY - LINE_OF_SCRIMMAGE_Y) / YARD_HEIGHT)
    this.gameState.yardsToGo -= yardsGained
    
    if (this.gameState.yardsToGo <= 0) {
      // Offense got first down
      this.gameState.down = 1
      this.gameState.yardsToGo = 10
      this.events.emit('offenseFirstDown', { yards: yardsGained })
    } else {
      this.gameState.down++
      this.events.emit('tackle', { yards: yardsGained })
      
      if (this.gameState.down > 4) {
        this.handleTurnoverOnDowns()
        return
      }
    }
    
    this.scheduleNextPlay()
  }
  
  private handleOpponentTouchdown() {
    this.gameState.phase = 'playComplete'
    this.gameState.score.away += 7
    
    this.events.emit('opponentTouchdown', { score: this.gameState.score })
    
    // Reset for next drive
    this.time.delayedCall(2000, () => {
      this.resetForNewDrive()
    })
  }
  
  private handleTurnoverOnDowns() {
    this.events.emit('turnoverOnDowns')
    
    // Big defensive stop!
    this.time.delayedCall(1500, () => {
      this.events.emit('defensiveStop')
    })
  }
  
  private handleQuarterEnd() {
    this.gameState.quarter++
    this.gameState.clockMs = 60000
    
    if (this.gameState.quarter > 4) {
      this.events.emit('gameOver', { score: this.gameState.score })
    } else {
      this.events.emit('quarterEnd', { quarter: this.gameState.quarter - 1 })
    }
  }
  
  // ============================================================================
  // Play Setup
  // ============================================================================
  
  private scheduleNextPlay() {
    this.time.delayedCall(1000, () => {
      this.setupNextPlay()
    })
  }
  
  private setupNextPlay() {
    // Reset offense positions
    this.offensePlayers.forEach((player, i) => {
      if (player.role === 'qb') {
        player.currentX = FIELD_WIDTH / 2
        player.currentY = LINE_OF_SCRIMMAGE_Y + 60
        player.hasBall = true
      } else {
        const positions = [
          { x: FIELD_WIDTH * 0.15, y: LINE_OF_SCRIMMAGE_Y - 5 },
          { x: FIELD_WIDTH * 0.85, y: LINE_OF_SCRIMMAGE_Y - 5 },
          { x: FIELD_WIDTH * 0.35, y: LINE_OF_SCRIMMAGE_Y - 5 },
        ]
        const pos = positions[i - 1] || positions[0]
        player.currentX = pos.x
        player.currentY = pos.y
        player.targetY = pos.y - 150
        player.hasBall = false
      }
      player.sprite.setPosition(player.currentX, player.currentY)
    })
    
    // Reset defense positions
    const defensePositions = [
      { x: FIELD_WIDTH * 0.3, y: LINE_OF_SCRIMMAGE_Y - 40 },
      { x: FIELD_WIDTH * 0.5, y: LINE_OF_SCRIMMAGE_Y - 35 },
      { x: FIELD_WIDTH * 0.7, y: LINE_OF_SCRIMMAGE_Y - 40 },
      { x: FIELD_WIDTH * 0.5, y: LINE_OF_SCRIMMAGE_Y - 80 },
      { x: FIELD_WIDTH * 0.15, y: LINE_OF_SCRIMMAGE_Y - 100 },
      { x: FIELD_WIDTH * 0.85, y: LINE_OF_SCRIMMAGE_Y - 100 },
    ]
    
    this.defenders.forEach((def, i) => {
      const pos = defensePositions[i] || defensePositions[0]
      def.currentX = pos.x
      def.currentY = pos.y
      def.sprite.setPosition(pos.x, pos.y)
    })
    
    // Reset blockers
    const blockerConfigs = [
      { x: FIELD_WIDTH * 0.25 },
      { x: FIELD_WIDTH * 0.38 },
      { x: FIELD_WIDTH * 0.5 },
      { x: FIELD_WIDTH * 0.62 },
      { x: FIELD_WIDTH * 0.75 },
    ]
    const blockerY = LINE_OF_SCRIMMAGE_Y + 15
    
    this.blockers.forEach((blocker, i) => {
      const config = blockerConfigs[i]
      blocker.currentX = config.x
      blocker.currentY = blockerY
      blocker.blockStrength = 1.0
      blocker.isEngaged = false
      blocker.engagedDefenderId = null
      blocker.sprite.setPosition(config.x, blockerY)
      blocker.sprite.setFillStyle(COLORS.blocker)
    })
    
    // Reset state
    this.gameState.phase = 'preSnap'
    this.gameState.sackPressure = 0
    this.gameState.tackleAttempts = 0
    this.targetPosition = null
    
    this.events.emit('playReady', this.gameState)
  }
  
  private resetForNewDrive() {
    this.gameState.down = 1
    this.gameState.yardsToGo = 10
    this.gameState.ballPosition = 75 // Opponent starts at their 25
    this.setupNextPlay()
  }
  
  // ============================================================================
  // Coverage Selection (called from React)
  // ============================================================================
  
  public setCoverage(coverage: DefensePlay) {
    this.gameState.selectedCoverage = coverage
    
    // Adjust AI behavior based on coverage
    this.defenders.forEach(def => {
      if (!def.isPlayerControlled) {
        if (coverage === 'blitz') {
          def.speed = DEFENSE_CONFIG.movement.aiDefenderSpeed * 
            DEFENSE_CONFIG.coverage.blitz.passRushSpeedBonus * 
            this.difficulty.defenderSpeedMultiplier
        } else {
          def.speed = DEFENSE_CONFIG.movement.aiDefenderSpeed * 
            this.difficulty.defenderSpeedMultiplier
        }
      }
    })
    
    this.events.emit('coverageChanged', coverage)
  }
  
  // ============================================================================
  // Pass Rush Moves (called from React swipe gestures)
  // ============================================================================
  
  /**
   * Perform a pass rush move to beat the blocker
   * Called from React when player swipes during passRush phase
   */
  public performPassRushMove(move: 'swim' | 'spin' | 'bull') {
    if (this.gameState.phase !== 'passRush') return
    if (!this.playerDefender) return
    
    const qb = this.offensePlayers.find(p => p.role === 'qb')
    if (!qb) return
    
    // Check if we're engaged with a blocker
    const engagingBlocker = this.blockers.find(b => b.engagedDefenderId === this.playerDefender?.id)
    
    // Calculate direction to QB
    const angleToQb = Phaser.Math.Angle.Between(
      this.playerDefender.currentX,
      this.playerDefender.currentY,
      qb.currentX,
      qb.currentY
    )
    
    // Each move has different effects
    let boostDistance = 0
    let lateralShift = 0
    let speedBoostDuration = 0
    let blockDamage = 0 // How much this move weakens the blocker
    
    switch (move) {
      case 'swim':
        // Swim move: Quick burst forward + slight lateral, good for beating edge
        boostDistance = 40
        lateralShift = 15
        speedBoostDuration = 300
        blockDamage = 0.3
        break
        
      case 'spin':
        // Spin move: Large lateral move + forward, best for disengaging
        boostDistance = 25
        lateralShift = 35
        speedBoostDuration = 400
        blockDamage = 0.5 // Most effective at breaking blocks
        break
        
      case 'bull':
        // Bull rush: Straight power forward, pushes blocker back
        boostDistance = 50
        lateralShift = 0
        speedBoostDuration = 200
        blockDamage = 0.25
        break
    }
    
    // Apply damage to blocker if engaged
    if (engagingBlocker) {
      engagingBlocker.blockStrength = Math.max(0, engagingBlocker.blockStrength - blockDamage)
      
      // If block is broken, disengage
      if (engagingBlocker.blockStrength <= 0) {
        engagingBlocker.isEngaged = false
        engagingBlocker.engagedDefenderId = null
        engagingBlocker.sprite.setFillStyle(0x666666) // Beaten blocker turns gray
        
        this.events.emit('blockBroken', { blockerId: engagingBlocker.id, move })
      } else {
        this.events.emit('blockWeakened', { 
          blockerId: engagingBlocker.id, 
          strength: engagingBlocker.blockStrength 
        })
      }
    }
    
    // Apply movement
    const lateralAngle = angleToQb + (Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2)
    
    this.playerDefender.currentX += Math.cos(angleToQb) * boostDistance
    this.playerDefender.currentY += Math.sin(angleToQb) * boostDistance
    this.playerDefender.currentX += Math.cos(lateralAngle) * lateralShift
    
    // Clamp to field
    this.playerDefender.currentX = Phaser.Math.Clamp(this.playerDefender.currentX, 20, FIELD_WIDTH - 20)
    this.playerDefender.currentY = Phaser.Math.Clamp(this.playerDefender.currentY, 20, FIELD_HEIGHT - 20)
    
    this.playerDefender.sprite.setPosition(
      this.playerDefender.currentX,
      this.playerDefender.currentY
    )
    
    // Temporary speed boost
    const originalSpeed = this.playerDefender.speed
    this.playerDefender.speed *= 1.3
    
    this.time.delayedCall(speedBoostDuration, () => {
      if (this.playerDefender) {
        this.playerDefender.speed = originalSpeed
      }
    })
    
    // Emit for visual/audio feedback
    this.events.emit('passRushMove', { move, success: true })
    
    // Check if this move resulted in getting close to QB
    const distToQb = Phaser.Math.Distance.Between(
      this.playerDefender.currentX,
      this.playerDefender.currentY,
      qb.currentX,
      qb.currentY
    )
    
    if (distToQb < DEFENSE_CONFIG.passRush.pressureRadius) {
      // In pressure zone - increase QB pressure
      this.gameState.sackPressure = Math.min(1, this.gameState.sackPressure + 0.2)
      this.events.emit('qbPressured', { pressure: this.gameState.sackPressure })
    }
  }
  
  /**
   * Switch control to a different defender (called from React tap)
   */
  public switchDefender(defenderId: string) {
    const newDefender = this.defenders.find(d => d.id === defenderId)
    if (!newDefender) return
    
    // Remove highlight from current
    if (this.playerDefender) {
      this.playerDefender.isPlayerControlled = false
      this.playerDefender.sprite.setFillStyle(COLORS.defenderAI)
      this.playerDefender.sprite.setStrokeStyle(2, 0x2D5A27)
    }
    
    // Set new player-controlled defender
    newDefender.isPlayerControlled = true
    newDefender.sprite.setFillStyle(COLORS.defender)
    newDefender.sprite.setStrokeStyle(4, COLORS.playerControlled)
    
    this.playerDefender = newDefender
    
    this.events.emit('defenderSwitched', { id: defenderId, name: newDefender.name })
  }
}
