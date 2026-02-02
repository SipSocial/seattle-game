/**
 * V4 Defense Scene
 * 
 * Main Phaser scene for defensive gameplay:
 * 
 * PHASES:
 * 1. Pre-Snap: See offensive formation, select defensive play, adjust positions
 * 2. Snap: Quick transition animation
 * 3. In Play: Control defender, react to offense
 * 4. Ball In Air: Jump timing for interceptions
 * 5. YAC/Tackle: Chase and tackle ball carrier
 * 6. Play End: Result display, scoring
 * 
 * CONTROL SCHEME (Mobile-First):
 * - Tap defender to switch control
 * - Drag/swipe to move controlled defender
 * - Swipe up to jump (for INTs)
 * - Swipe patterns for D-line rush moves
 * - Two-finger touch for sprint
 */

import Phaser from 'phaser'
import { DefenseControls, createDefenseControls, DefensePhase } from '../systems/DefenseControls'
import { 
  DefensivePlay, 
  DefenderPosition, 
  DEFENSE_PLAYBOOK,
  getDefensivePlay,
  isInCoverage,
} from '../systems/DefensePlaybook'
import { StateMachine, StateConfig } from '../../../v3/game/core/StateMachine'

// ============================================================================
// CONSTANTS
// ============================================================================

const FIELD = {
  WIDTH: 400,
  HEIGHT: 1200,
  PLAYABLE_WIDTH: 370,
  MARGIN: 15,
  END_ZONE_HEIGHT: 100,
  YARD: 10,
}

const TIMING = {
  PRE_SNAP_MIN_MS: 1000,
  SNAP_DURATION_MS: 200,
  ROUTE_DURATION_MS: 4000,
  POCKET_TIME_MS: 5000,
  BALL_FLIGHT_MS: 600,
}

const COLORS = {
  // Field
  grass1: 0x2E8B2E,
  grass2: 0x348C34,
  white: 0xFFFFFF,
  yellow: 0xFFD700,
  blue: 0x0066CC,
  
  // Dark Side (our defense)
  darkSide: 0x111111,
  darkSideGlow: 0x69BE28,
  
  // Opponent offense
  opponent: 0xAA0000,
  opponentAccent: 0xFF4444,
  
  // UI
  controlledHighlight: 0x00FFFF,
  openReceiver: 0xFFD700,
  ball: 0x7C4A03,
}

// ============================================================================
// TYPES
// ============================================================================

type DefensePhaseState = 
  | 'init'
  | 'preSnap' 
  | 'countdown' 
  | 'snap'
  | 'inPlay' 
  | 'ballInAir' 
  | 'yac' 
  | 'playEnd'

interface Defender {
  container: Phaser.GameObjects.Container
  sprite: Phaser.GameObjects.Arc
  glow?: Phaser.GameObjects.Arc
  x: number
  y: number
  jersey: number
  role: string
  assignment: string
  isControlled: boolean
  baseX: number  // Original position for resetting
  baseY: number
  targetX?: number  // For AI movement
  targetY?: number
  speed: number
}

interface OffensivePlayer {
  container: Phaser.GameObjects.Container
  sprite: Phaser.GameObjects.Arc
  x: number
  y: number
  jersey: number
  role: 'qb' | 'receiver' | 'lineman' | 'rb'
  routeProgress: number
  targetX: number
  targetY: number
  hasBall: boolean
  isOpen: boolean
}

interface PlayResult {
  type: 'sack' | 'tackle' | 'tackleForLoss' | 'interception' | 'passBreakup' | 
        'incompleteCoverage' | 'touchdown' | 'firstDown' | 'completion'
  yardsAllowed: number
  scoringPlay: boolean
  defender?: string
}

// ============================================================================
// SCENE CLASS
// ============================================================================

export class DefenseScene extends Phaser.Scene {
  // State machine
  private stateMachine!: StateMachine<DefensePhaseState>
  
  // Controls
  private controls!: DefenseControls
  
  // Current play
  private selectedPlay: DefensivePlay | null = null
  private selectedPlayIndex: number = 0
  
  // Game objects
  private defenders: Defender[] = []
  private offensivePlayers: OffensivePlayer[] = []
  private ball?: Phaser.GameObjects.Arc
  private ballShadow?: Phaser.GameObjects.Ellipse
  
  // Field elements
  private fieldBg!: Phaser.GameObjects.Graphics
  private losY: number = FIELD.HEIGHT - FIELD.END_ZONE_HEIGHT - 300
  private firstDownY: number = 0
  
  // Camera
  private cameraViewHeight = 700
  
  // Game state
  private down: number = 1
  private yardsToGo: number = 10
  private score = { home: 0, away: 0 }
  
  // Timing
  private playStartTime: number = 0
  private countdownStep: number = 3
  
  // Controlled defender index
  private controlledDefenderIndex: number = 0
  
  // Opponent colors (set via init)
  private oppColors = { primary: COLORS.opponent, accent: COLORS.opponentAccent }
  
  constructor() {
    super({ key: 'DefenseScene' })
  }
  
  // ============================================================================
  // LIFECYCLE
  // ============================================================================
  
  init(data: { weekId?: number, oppColors?: { primary: number, accent: number } } = {}): void {
    if (data.oppColors) {
      this.oppColors = data.oppColors
    }
  }
  
  preload(): void {
    // Load stadium assets
    this.load.image('stadium-atmosphere', '/stadiums/sf-49ers-atmosphere.jpg')
  }
  
  create(): void {
    // Setup controls
    this.controls = createDefenseControls(this)
    this.setupControlEvents()
    
    // Setup state machine
    this.setupStateMachine()
    
    // Setup camera
    this.cameras.main.setBounds(0, 0, FIELD.WIDTH, FIELD.HEIGHT)
    
    // Create field
    this.createField()
    
    // Initialize to pre-snap
    this.stateMachine.start('preSnap')
    
    // Position camera
    this.resetCameraToLOS()
    
    // Emit initial state
    this.emitGameState()
  }
  
  update(time: number, delta: number): void {
    // Update state machine
    this.stateMachine.update(delta)
    
    // Update controls and get movement
    const movement = this.controls.update(delta)
    
    // Apply movement to controlled defender
    this.applyDefenderMovement(movement, delta)
    
    // Update camera
    this.updateCamera()
  }
  
  // ============================================================================
  // STATE MACHINE SETUP
  // ============================================================================
  
  private setupStateMachine(): void {
    this.stateMachine = new StateMachine<DefensePhaseState>()
    
    const states: StateConfig<DefensePhaseState>[] = [
      {
        id: 'init',
        onEnter: () => this.controls.setPhase('preSnap'),
      },
      {
        id: 'preSnap',
        minDuration: TIMING.PRE_SNAP_MIN_MS,
        onEnter: () => this.enterPreSnap(),
        onUpdate: (delta, timeInState) => this.updatePreSnap(timeInState),
      },
      {
        id: 'countdown',
        minDuration: 1000,
        onEnter: () => this.enterCountdown(),
        onUpdate: (delta, timeInState) => this.updateCountdown(timeInState),
      },
      {
        id: 'snap',
        minDuration: TIMING.SNAP_DURATION_MS,
        onEnter: () => this.enterSnap(),
        onExit: () => this.exitSnap(),
      },
      {
        id: 'inPlay',
        onEnter: () => this.enterInPlay(),
        onUpdate: (delta, timeInState) => this.updateInPlay(delta, timeInState),
      },
      {
        id: 'ballInAir',
        onEnter: () => this.enterBallInAir(),
        onUpdate: (delta, timeInState) => this.updateBallInAir(delta),
      },
      {
        id: 'yac',
        onEnter: () => this.enterYAC(),
        onUpdate: (delta, timeInState) => this.updateYAC(delta),
      },
      {
        id: 'playEnd',
        minDuration: 1500,
        onEnter: () => this.enterPlayEnd(),
        onUpdate: () => {},
        onExit: () => this.exitPlayEnd(),
      },
    ]
    
    this.stateMachine.addStates(states)
    
    // Listen for state changes
    this.stateMachine.on('stateChange', ((...args: unknown[]) => {
      const data = args[0] as { from: string | null, to: string }
      console.log(`[DefenseScene] State: ${data.from} -> ${data.to}`)
      this.emitGameState()
    }))
  }
  
  // ============================================================================
  // STATE: PRE-SNAP
  // ============================================================================
  
  private enterPreSnap(): void {
    this.controls.setPhase('preSnap')
    
    // Clear previous play objects
    this.clearPlayObjects()
    
    // Create defensive formation based on selected play
    if (!this.selectedPlay) {
      this.selectedPlay = DEFENSE_PLAYBOOK[0]
    }
    this.createDefenders(this.selectedPlay)
    
    // Create AI-controlled offense (for preview)
    this.createOffensiveFormation()
    
    // Auto-select initial controlled defender (closest to ball)
    this.autoSelectDefender()
    
    // Emit event for UI
    this.events.emit('preSnapReady', {
      availablePlays: DEFENSE_PLAYBOOK,
      selectedPlayIndex: this.selectedPlayIndex,
    })
  }
  
  private updatePreSnap(timeInState: number): void {
    // Animate defenders in ready stance (subtle idle animation)
    this.defenders.forEach((def, i) => {
      const offset = Math.sin((timeInState / 500) + i) * 1.5
      def.container.setY(def.baseY + offset)
    })
  }
  
  // ============================================================================
  // STATE: COUNTDOWN
  // ============================================================================
  
  private enterCountdown(): void {
    this.countdownStep = 3
    this.playStartTime = this.time.now
    this.events.emit('countdown', 3)
  }
  
  private updateCountdown(timeInState: number): void {
    const step = 3 - Math.floor(timeInState / 350)
    
    if (step !== this.countdownStep && step >= 0) {
      this.countdownStep = step
      this.events.emit('countdown', step)
    }
    
    if (timeInState >= 1000) {
      this.stateMachine.transition('snap', true)
    }
  }
  
  // ============================================================================
  // STATE: SNAP
  // ============================================================================
  
  private enterSnap(): void {
    this.controls.setPhase('snap')
    
    // Camera shake
    this.cameras.main.shake(80, 0.004)
    
    // Snap animation - offensive line fires out
    this.offensivePlayers
      .filter(p => p.role === 'lineman')
      .forEach(lineman => {
        this.tweens.add({
          targets: lineman.container,
          y: lineman.y + 15,
          duration: 150,
          ease: 'Power2',
        })
      })
    
    this.events.emit('snap')
  }
  
  private exitSnap(): void {
    this.stateMachine.transition('inPlay', true)
  }
  
  // ============================================================================
  // STATE: IN PLAY
  // ============================================================================
  
  private enterInPlay(): void {
    this.controls.setPhase('inPlay')
    this.playStartTime = this.time.now
    
    // Start routes for receivers
    this.startOffensiveRoutes()
  }
  
  private updateInPlay(delta: number, timeInState: number): void {
    const routeProgress = Math.min(1, timeInState / TIMING.ROUTE_DURATION_MS)
    
    // Update receiver positions along routes
    this.updateReceiverRoutes(routeProgress)
    
    // Update AI defenders (those not controlled)
    this.updateAIDefenders(delta)
    
    // Update QB behavior
    this.updateQBBehavior(timeInState)
    
    // Check for sack
    if (this.checkForSack()) {
      this.endPlay({ 
        type: 'sack', 
        yardsAllowed: -8, 
        scoringPlay: false,
        defender: this.defenders[this.controlledDefenderIndex]?.jersey.toString(),
      })
      return
    }
    
    // Check if QB throws (AI decision)
    if (this.shouldQBThrow(timeInState)) {
      this.stateMachine.transition('ballInAir', true)
    }
    
    // Check for pocket collapse timeout
    if (timeInState >= TIMING.POCKET_TIME_MS) {
      // Force throw to avoid sack
      this.stateMachine.transition('ballInAir', true)
    }
  }
  
  // ============================================================================
  // STATE: BALL IN AIR
  // ============================================================================
  
  private targetReceiver: OffensivePlayer | null = null
  
  private enterBallInAir(): void {
    this.controls.setPhase('ballInAir')
    
    // Pick target receiver (AI chooses most open)
    this.targetReceiver = this.pickTargetReceiver()
    
    if (!this.targetReceiver) {
      // No open receiver - bad throw
      this.endPlay({ type: 'incompleteCoverage', yardsAllowed: 0, scoringPlay: false })
      return
    }
    
    // Create ball
    const qb = this.offensivePlayers.find(p => p.role === 'qb')
    if (qb) {
      this.createBall(qb.x, qb.y)
    }
    
    this.events.emit('ballThrown', { 
      targetX: this.targetReceiver.x, 
      targetY: this.targetReceiver.y,
    })
  }
  
  private updateBallInAir(delta: number): void {
    if (!this.ball || !this.targetReceiver) return
    
    // Move ball toward target
    const speed = 16
    const angle = Phaser.Math.Angle.Between(
      this.ball.x, this.ball.y,
      this.targetReceiver.x, this.targetReceiver.y
    )
    
    this.ball.x += Math.cos(angle) * speed
    this.ball.y += Math.sin(angle) * speed
    
    // Update shadow
    if (this.ballShadow) {
      this.ballShadow.x = this.ball.x
      this.ballShadow.y = this.ball.y + 15
    }
    
    // Move defenders toward ball
    this.updateDefendersOnBall(delta)
    
    // Check for interception
    const intResult = this.checkForInterception()
    if (intResult) {
      this.endPlay({
        type: 'interception',
        yardsAllowed: 0,
        scoringPlay: false,
        defender: intResult.defender,
      })
      return
    }
    
    // Check for pass breakup
    if (this.checkForPassBreakup()) {
      this.endPlay({ type: 'passBreakup', yardsAllowed: 0, scoringPlay: false })
      return
    }
    
    // Check ball arrival
    const distToCatch = Phaser.Math.Distance.Between(
      this.ball.x, this.ball.y,
      this.targetReceiver.x, this.targetReceiver.y
    )
    
    if (distToCatch < 25) {
      // Caught - transition to YAC
      this.targetReceiver.hasBall = true
      this.destroyBall()
      this.stateMachine.transition('yac', true)
    }
  }
  
  // ============================================================================
  // STATE: YAC (Yards After Catch)
  // ============================================================================
  
  private enterYAC(): void {
    this.controls.setPhase('yac')
    
    // Highlight ball carrier
    const carrier = this.offensivePlayers.find(p => p.hasBall)
    if (carrier) {
      carrier.sprite.setFillStyle(COLORS.openReceiver)
    }
    
    this.events.emit('catch', { receiver: carrier?.jersey })
  }
  
  private updateYAC(delta: number): void {
    const carrier = this.offensivePlayers.find(p => p.hasBall)
    if (!carrier) return
    
    // Ball carrier runs upfield (toward lower Y)
    const runSpeed = 4.5
    carrier.y -= runSpeed
    carrier.container.setPosition(carrier.x, carrier.y)
    
    // Defenders pursue
    this.updateDefenderPursuit(delta, carrier)
    
    // Check for tackle
    if (this.checkForTackle(carrier)) {
      const yardsGained = this.calculateYardsGained(carrier.y)
      const isTouchdown = carrier.y <= FIELD.END_ZONE_HEIGHT
      const isTFL = yardsGained < 0
      
      this.endPlay({
        type: isTouchdown ? 'touchdown' : (isTFL ? 'tackleForLoss' : 'tackle'),
        yardsAllowed: yardsGained,
        scoringPlay: isTouchdown,
      })
      return
    }
    
    // Check for touchdown
    if (carrier.y <= FIELD.END_ZONE_HEIGHT) {
      this.endPlay({
        type: 'touchdown',
        yardsAllowed: 100 - (this.losY - FIELD.END_ZONE_HEIGHT) / FIELD.YARD,
        scoringPlay: true,
      })
    }
  }
  
  // ============================================================================
  // STATE: PLAY END
  // ============================================================================
  
  private lastPlayResult: PlayResult | null = null
  
  private enterPlayEnd(): void {
    this.controls.setPhase('playEnd')
    
    if (this.lastPlayResult) {
      this.events.emit('playResult', this.lastPlayResult)
      
      // Update score
      if (this.lastPlayResult.type === 'touchdown') {
        this.score.away += 7
      }
    }
  }
  
  private exitPlayEnd(): void {
    // Advance down/distance
    if (this.lastPlayResult) {
      this.advancePlay(this.lastPlayResult)
    }
    
    this.lastPlayResult = null
    this.stateMachine.transition('preSnap', true)
  }
  
  private endPlay(result: PlayResult): void {
    this.lastPlayResult = result
    this.stateMachine.transition('playEnd', true)
  }
  
  // ============================================================================
  // CONTROL EVENTS
  // ============================================================================
  
  private setupControlEvents(): void {
    // Pre-snap: Tap to select defender
    this.controls.on('preSnapTap', ((...args: unknown[]) => {
      const data = args[0] as { worldX: number, worldY: number }
      const tappedIdx = this.findDefenderAt(data.worldX, data.worldY)
      if (tappedIdx >= 0) {
        this.setControlledDefender(tappedIdx)
      }
    }))
    
    // Pre-snap: Drag defender
    this.controls.on('preSnapDrag', ((...args: unknown[]) => {
      const data = args[0] as { defenderIndex: number, worldX: number, worldY: number }
      const def = this.defenders[data.defenderIndex]
      if (def) {
        const maxDist = this.controls.getMaxAdjustDistance()
        const dx = data.worldX - def.baseX
        const dy = data.worldY - def.baseY
        const dist = Math.sqrt(dx * dx + dy * dy)
        
        if (dist <= maxDist) {
          def.x = data.worldX
          def.y = data.worldY
          def.container.setPosition(def.x, def.y)
        }
      }
    }))
    
    // In play: Tap to switch control
    this.controls.on('inPlayTap', ((...args: unknown[]) => {
      const data = args[0] as { worldX: number, worldY: number }
      const tappedIdx = this.findDefenderAt(data.worldX, data.worldY)
      if (tappedIdx >= 0) {
        this.setControlledDefender(tappedIdx)
      }
    }))
    
    // Rush moves (D-line)
    this.controls.on('rushMove', ((...args: unknown[]) => {
      const data = args[0] as { move: string, speedBoost: number, duration: number }
      const def = this.defenders[this.controlledDefenderIndex]
      if (def) {
        // Visual feedback
        this.tweens.add({
          targets: def.container,
          scaleX: 1.3,
          scaleY: 0.9,
          duration: data.duration / 2,
          yoyo: true,
        })
        
        // Speed boost applied in update via controls
        this.events.emit('rushMoveActivated', data)
      }
    }))
    
    // Coverage actions (jump/dive for INTs)
    this.controls.on('coverageAction', ((...args: unknown[]) => {
      const data = args[0] as { action: string }
      const def = this.defenders[this.controlledDefenderIndex]
      if (def) {
        if (data.action === 'jump') {
          this.tweens.add({
            targets: def.container,
            y: def.y - 40,
            duration: 200,
            yoyo: true,
            ease: 'Sine.easeOut',
          })
        } else if (data.action === 'dive') {
          this.tweens.add({
            targets: def.container,
            y: def.y + 20,
            scaleY: 0.6,
            duration: 180,
            yoyo: true,
          })
        }
      }
    }))
  }
  
  // ============================================================================
  // DEFENDER MANAGEMENT
  // ============================================================================
  
  private createDefenders(play: DefensivePlay): void {
    this.defenders = []
    const centerX = FIELD.WIDTH / 2
    
    play.positions.forEach((pos, i) => {
      const x = centerX + pos.offsetX
      const y = this.losY + pos.offsetY
      
      const container = this.add.container(x, y)
      
      // Shadow
      const shadow = this.add.ellipse(0, 6, 24, 10, 0x000000, 0.4)
      
      // Glow
      const glow = this.add.arc(0, 0, 20, 0, 360, false, COLORS.darkSideGlow, 0.3)
      
      // Main sprite
      const sprite = this.add.arc(0, 0, 12, 0, 360, false, COLORS.darkSide)
      sprite.setStrokeStyle(2, COLORS.darkSideGlow)
      
      // Jersey number
      const jersey = 50 + i // Placeholder jersey numbers
      const text = this.add.text(0, 0, `${jersey}`, {
        fontSize: '10px',
        fontFamily: 'Arial Black',
        color: '#FFFFFF',
      }).setOrigin(0.5)
      
      container.add([shadow, glow, sprite, text])
      container.setDepth(10)
      
      // Make interactive for tap selection
      sprite.setInteractive({ useHandCursor: true })
      sprite.on('pointerdown', () => this.setControlledDefender(i))
      
      const defender: Defender = {
        container,
        sprite,
        glow,
        x,
        y,
        baseX: x,
        baseY: y,
        jersey,
        role: pos.role,
        assignment: pos.assignment,
        isControlled: false,
        speed: isInCoverage(pos.assignment) ? 3.2 : 4.0,
      }
      
      this.defenders.push(defender)
    })
  }
  
  private setControlledDefender(index: number): void {
    // Remove highlight from previous
    const prev = this.defenders[this.controlledDefenderIndex]
    if (prev) {
      prev.isControlled = false
      prev.sprite.setStrokeStyle(2, COLORS.darkSideGlow)
      if (prev.glow) prev.glow.setFillStyle(COLORS.darkSideGlow, 0.3)
    }
    
    // Set new controlled
    this.controlledDefenderIndex = index
    const next = this.defenders[index]
    if (next) {
      next.isControlled = true
      next.sprite.setStrokeStyle(3, COLORS.controlledHighlight)
      if (next.glow) next.glow.setFillStyle(COLORS.controlledHighlight, 0.5)
      
      // Notify controls of player type
      const isDLineman = ['nose-tackle', 'defensive-tackle', 'defensive-end'].includes(next.role)
      this.controls.setControllingDLineman(isDLineman)
      this.controls.setControlledDefender(index)
    }
    
    this.events.emit('controlledDefenderChanged', { index, defender: next })
  }
  
  private autoSelectDefender(): void {
    // Select the most relevant defender (MLB or first DB)
    const mlb = this.defenders.findIndex(d => d.role === 'middle-linebacker')
    const db = this.defenders.findIndex(d => d.role === 'cornerback' || d.role === 'free-safety')
    
    this.setControlledDefender(mlb >= 0 ? mlb : (db >= 0 ? db : 0))
  }
  
  private findDefenderAt(worldX: number, worldY: number): number {
    for (let i = 0; i < this.defenders.length; i++) {
      const def = this.defenders[i]
      const dist = Phaser.Math.Distance.Between(worldX, worldY, def.x, def.y)
      if (dist < 40) return i
    }
    return -1
  }
  
  private applyDefenderMovement(movement: { x: number, y: number }, delta: number): void {
    const def = this.defenders[this.controlledDefenderIndex]
    if (!def || (movement.x === 0 && movement.y === 0)) return
    
    def.x += movement.x * def.speed
    def.y += movement.y * def.speed
    
    // Clamp to field bounds
    def.x = Phaser.Math.Clamp(def.x, FIELD.MARGIN + 10, FIELD.WIDTH - FIELD.MARGIN - 10)
    def.y = Phaser.Math.Clamp(def.y, FIELD.END_ZONE_HEIGHT, FIELD.HEIGHT - FIELD.END_ZONE_HEIGHT)
    
    def.container.setPosition(def.x, def.y)
  }
  
  private updateAIDefenders(delta: number): void {
    this.defenders.forEach((def, i) => {
      if (def.isControlled) return
      
      // AI coverage logic based on assignment
      this.updateDefenderAI(def, delta)
    })
  }
  
  private updateDefenderAI(def: Defender, delta: number): void {
    // Simplified AI - in full implementation, check assignment type
    // For now, defenders track nearest receiver
    const nearestReceiver = this.findNearestReceiver(def.x, def.y)
    
    if (nearestReceiver) {
      const angle = Phaser.Math.Angle.Between(def.x, def.y, nearestReceiver.x, nearestReceiver.y)
      const speed = def.speed * 0.8 // AI slightly slower than player
      
      def.x += Math.cos(angle) * speed * (delta / 16)
      def.y += Math.sin(angle) * speed * (delta / 16)
      def.container.setPosition(def.x, def.y)
    }
  }
  
  private updateDefendersOnBall(delta: number): void {
    if (!this.ball) return
    
    this.defenders.forEach(def => {
      if (def.isControlled) return
      
      // All defenders break toward ball
      const angle = Phaser.Math.Angle.Between(def.x, def.y, this.ball!.x, this.ball!.y)
      const speed = def.speed * 1.2 // Extra speed on ball in air
      
      def.x += Math.cos(angle) * speed * (delta / 16)
      def.y += Math.sin(angle) * speed * (delta / 16)
      def.container.setPosition(def.x, def.y)
    })
  }
  
  private updateDefenderPursuit(delta: number, carrier: OffensivePlayer): void {
    this.defenders.forEach(def => {
      // Pursuit angle - lead the ball carrier
      const leadFactor = def.isControlled ? 0 : 0.5
      const targetY = carrier.y - (carrier.y - def.y) * leadFactor
      
      const angle = Phaser.Math.Angle.Between(def.x, def.y, carrier.x, targetY)
      const speed = def.speed * (def.isControlled ? 1.0 : 0.95)
      
      def.x += Math.cos(angle) * speed * (delta / 16)
      def.y += Math.sin(angle) * speed * (delta / 16)
      def.container.setPosition(def.x, def.y)
    })
  }
  
  // ============================================================================
  // OFFENSE MANAGEMENT (AI Controlled)
  // ============================================================================
  
  private createOffensiveFormation(): void {
    this.offensivePlayers = []
    const centerX = FIELD.WIDTH / 2
    
    // QB
    this.createOffensivePlayer(centerX, this.losY + 50, 14, 'qb')
    
    // Receivers (3 WR set)
    this.createOffensivePlayer(centerX - 120, this.losY - 5, 11, 'receiver')
    this.createOffensivePlayer(centerX + 120, this.losY - 5, 10, 'receiver')
    this.createOffensivePlayer(centerX + 40, this.losY + 5, 88, 'receiver')
    
    // O-Line (simplified)
    for (let i = -2; i <= 2; i++) {
      this.createOffensivePlayer(centerX + i * 30, this.losY + 8, 70 + i + 2, 'lineman')
    }
  }
  
  private createOffensivePlayer(x: number, y: number, jersey: number, role: OffensivePlayer['role']): void {
    const container = this.add.container(x, y)
    
    const shadow = this.add.ellipse(0, 6, 24, 10, 0x000000, 0.4)
    const sprite = this.add.arc(0, 0, role === 'lineman' ? 14 : 12, 0, 360, false, this.oppColors.primary)
    sprite.setStrokeStyle(2, this.oppColors.accent)
    
    const text = this.add.text(0, 0, `${jersey}`, {
      fontSize: '10px',
      fontFamily: 'Arial Black',
      color: '#FFFFFF',
    }).setOrigin(0.5)
    
    container.add([shadow, sprite, text])
    container.setDepth(9)
    
    this.offensivePlayers.push({
      container,
      sprite,
      x,
      y,
      jersey,
      role,
      routeProgress: 0,
      targetX: x,
      targetY: y - 200, // Default target
      hasBall: role === 'qb',
      isOpen: false,
    })
  }
  
  private startOffensiveRoutes(): void {
    // Set route targets for receivers
    const receivers = this.offensivePlayers.filter(p => p.role === 'receiver')
    const routes = [
      { dx: 50, dy: -250 },   // Slant
      { dx: -30, dy: -180 },  // Out
      { dx: 0, dy: -300 },    // Go
    ]
    
    receivers.forEach((rec, i) => {
      const route = routes[i % routes.length]
      rec.targetX = rec.x + route.dx
      rec.targetY = rec.y + route.dy
    })
  }
  
  private updateReceiverRoutes(progress: number): void {
    const receivers = this.offensivePlayers.filter(p => p.role === 'receiver')
    
    receivers.forEach(rec => {
      rec.routeProgress = progress
      rec.x = Phaser.Math.Linear(rec.container.x, rec.targetX, progress * 0.05)
      rec.y = Phaser.Math.Linear(rec.container.y, rec.targetY, progress * 0.05)
      rec.container.setPosition(rec.x, rec.y)
      
      // Check if open (simplified - based on defender distance)
      rec.isOpen = this.isReceiverOpen(rec)
      rec.sprite.setFillStyle(rec.isOpen ? COLORS.openReceiver : this.oppColors.primary)
    })
  }
  
  private isReceiverOpen(receiver: OffensivePlayer): boolean {
    for (const def of this.defenders) {
      const dist = Phaser.Math.Distance.Between(receiver.x, receiver.y, def.x, def.y)
      if (dist < 35) return false
    }
    return true
  }
  
  private findNearestReceiver(x: number, y: number): OffensivePlayer | null {
    let nearest: OffensivePlayer | null = null
    let minDist = Infinity
    
    for (const p of this.offensivePlayers) {
      if (p.role !== 'receiver') continue
      const dist = Phaser.Math.Distance.Between(x, y, p.x, p.y)
      if (dist < minDist) {
        minDist = dist
        nearest = p
      }
    }
    
    return nearest
  }
  
  private updateQBBehavior(timeInState: number): void {
    // QB drops back
    const qb = this.offensivePlayers.find(p => p.role === 'qb')
    if (qb && timeInState < 500) {
      qb.y += 0.5 // Dropback
      qb.container.setY(qb.y)
    }
  }
  
  private shouldQBThrow(timeInState: number): boolean {
    // AI decision to throw - based on pressure and open receivers
    if (timeInState < 1500) return false // Min time before throw
    
    const openReceivers = this.offensivePlayers.filter(p => p.role === 'receiver' && p.isOpen)
    const pressure = this.checkPressure()
    
    if (pressure > 0.8) return true // Under heavy pressure
    if (openReceivers.length > 0 && timeInState > 2000) return true
    if (timeInState > TIMING.POCKET_TIME_MS * 0.8) return true
    
    return false
  }
  
  private pickTargetReceiver(): OffensivePlayer | null {
    const receivers = this.offensivePlayers.filter(p => p.role === 'receiver')
    
    // Prefer open receivers
    const openReceivers = receivers.filter(r => r.isOpen)
    if (openReceivers.length > 0) {
      return openReceivers[Math.floor(Math.random() * openReceivers.length)]
    }
    
    // Force throw to random receiver
    return receivers[Math.floor(Math.random() * receivers.length)]
  }
  
  // ============================================================================
  // GAME MECHANICS
  // ============================================================================
  
  private checkPressure(): number {
    const qb = this.offensivePlayers.find(p => p.role === 'qb')
    if (!qb) return 0
    
    let pressure = 0
    for (const def of this.defenders) {
      const dist = Phaser.Math.Distance.Between(qb.x, qb.y, def.x, def.y)
      if (dist < 100) {
        pressure += (100 - dist) / 100
      }
    }
    
    return Math.min(1, pressure)
  }
  
  private checkForSack(): boolean {
    const qb = this.offensivePlayers.find(p => p.role === 'qb')
    if (!qb) return false
    
    for (const def of this.defenders) {
      const dist = Phaser.Math.Distance.Between(qb.x, qb.y, def.x, def.y)
      if (dist < 20) return true
    }
    
    return false
  }
  
  private checkForInterception(): { defender: string } | null {
    if (!this.ball) return null
    
    for (const def of this.defenders) {
      const dist = Phaser.Math.Distance.Between(this.ball.x, this.ball.y, def.x, def.y)
      
      // Check timing if defender jumped
      if (dist < 30) {
        const timing = this.controls.checkInterceptionTiming(this.time.now)
        if (timing === 'perfect') {
          return { defender: def.jersey.toString() }
        } else if (timing === 'good' && Math.random() < 0.4) {
          return { defender: def.jersey.toString() }
        }
      }
    }
    
    return null
  }
  
  private checkForPassBreakup(): boolean {
    if (!this.ball || !this.targetReceiver) return false
    
    for (const def of this.defenders) {
      const distToBall = Phaser.Math.Distance.Between(this.ball.x, this.ball.y, def.x, def.y)
      const distToReceiver = Phaser.Math.Distance.Between(def.x, def.y, this.targetReceiver.x, this.targetReceiver.y)
      
      if (distToBall < 35 && distToReceiver < 35) {
        // Contested catch - 50% breakup
        return Math.random() < 0.5
      }
    }
    
    return false
  }
  
  private checkForTackle(carrier: OffensivePlayer): boolean {
    for (const def of this.defenders) {
      const dist = Phaser.Math.Distance.Between(carrier.x, carrier.y, def.x, def.y)
      if (dist < 18) return true
    }
    return false
  }
  
  private calculateYardsGained(carrierY: number): number {
    return Math.round((this.losY - carrierY) / FIELD.YARD)
  }
  
  private advancePlay(result: PlayResult): void {
    // Update LOS based on result
    if (result.type !== 'interception') {
      this.losY -= result.yardsAllowed * FIELD.YARD
    }
    
    // Update down and distance
    const madeFirstDown = result.yardsAllowed >= this.yardsToGo
    
    if (result.type === 'touchdown' || result.type === 'interception') {
      // Reset
      this.down = 1
      this.yardsToGo = 10
      this.losY = FIELD.HEIGHT - FIELD.END_ZONE_HEIGHT - 300
    } else if (madeFirstDown) {
      this.down = 1
      this.yardsToGo = 10
      this.firstDownY = this.losY - 100
    } else {
      this.down++
      this.yardsToGo -= result.yardsAllowed
      
      if (this.down > 4) {
        // Turnover on downs
        this.down = 1
        this.yardsToGo = 10
        this.events.emit('turnoverOnDowns')
      }
    }
    
    this.emitGameState()
  }
  
  // ============================================================================
  // BALL MANAGEMENT
  // ============================================================================
  
  private createBall(x: number, y: number): void {
    this.ballShadow = this.add.ellipse(x, y + 15, 12, 5, 0x000000, 0.4)
    this.ballShadow.setDepth(14)
    
    this.ball = this.add.arc(x, y, 7, 0, 360, false, COLORS.ball)
    this.ball.setStrokeStyle(2, 0xFFFFFF)
    this.ball.setDepth(15)
  }
  
  private destroyBall(): void {
    this.ball?.destroy()
    this.ball = undefined
    this.ballShadow?.destroy()
    this.ballShadow = undefined
  }
  
  // ============================================================================
  // FIELD & CAMERA
  // ============================================================================
  
  private createField(): void {
    this.fieldBg = this.add.graphics()
    this.fieldBg.setDepth(1)
    
    const g = this.fieldBg
    const centerX = FIELD.WIDTH / 2
    
    // Grass stripes
    for (let y = 0; y < FIELD.HEIGHT; y += 30) {
      const color = (Math.floor(y / 30) % 2 === 0) ? COLORS.grass1 : COLORS.grass2
      g.fillStyle(color, 1)
      g.fillRect(FIELD.MARGIN, y, FIELD.PLAYABLE_WIDTH, 30)
    }
    
    // End zones
    g.fillStyle(this.oppColors.primary, 1)
    g.fillRect(FIELD.MARGIN, 0, FIELD.PLAYABLE_WIDTH, FIELD.END_ZONE_HEIGHT)
    
    // Yard lines
    g.lineStyle(2, COLORS.white, 0.5)
    for (let yard = 1; yard <= 10; yard++) {
      const y = FIELD.END_ZONE_HEIGHT + yard * 100
      if (y < FIELD.HEIGHT - FIELD.END_ZONE_HEIGHT) {
        g.moveTo(FIELD.MARGIN, y)
        g.lineTo(FIELD.WIDTH - FIELD.MARGIN, y)
      }
    }
    g.strokePath()
    
    // LOS marker
    const losMarker = this.add.rectangle(
      centerX, this.losY, FIELD.PLAYABLE_WIDTH, 3, COLORS.blue
    ).setDepth(5).setAlpha(0.8)
    
    // First down marker
    this.firstDownY = this.losY - 100
    this.add.rectangle(
      centerX, this.firstDownY, FIELD.PLAYABLE_WIDTH, 4, COLORS.yellow
    ).setDepth(5).setAlpha(0.9)
  }
  
  private resetCameraToLOS(): void {
    const targetY = this.losY - this.cameraViewHeight * 0.6
    this.cameras.main.setScroll(0, Math.max(0, targetY))
  }
  
  private updateCamera(): void {
    let targetY = this.losY - this.cameraViewHeight * 0.6
    
    const state = this.stateMachine.getCurrentState()
    
    if (state === 'yac') {
      const carrier = this.offensivePlayers.find(p => p.hasBall)
      if (carrier) {
        targetY = carrier.y - this.cameraViewHeight * 0.5
      }
    } else if (state === 'ballInAir' && this.ball) {
      targetY = this.ball.y - this.cameraViewHeight * 0.5
    }
    
    targetY = Phaser.Math.Clamp(targetY, 0, FIELD.HEIGHT - this.cameraViewHeight)
    
    const currentY = this.cameras.main.scrollY
    const newY = currentY + (targetY - currentY) * 0.08
    this.cameras.main.setScroll(0, newY)
  }
  
  // ============================================================================
  // UTILITY
  // ============================================================================
  
  private clearPlayObjects(): void {
    this.defenders.forEach(d => d.container.destroy())
    this.defenders = []
    
    this.offensivePlayers.forEach(p => p.container.destroy())
    this.offensivePlayers = []
    
    this.destroyBall()
    this.targetReceiver = null
  }
  
  private emitGameState(): void {
    this.events.emit('gameStateUpdate', {
      phase: this.stateMachine.getCurrentState(),
      down: this.down,
      yardsToGo: this.yardsToGo,
      score: this.score,
      selectedPlay: this.selectedPlay?.displayName,
    })
  }
  
  // ============================================================================
  // PUBLIC API
  // ============================================================================
  
  /**
   * Select a defensive play (called from UI)
   */
  public selectPlay(playId: string): void {
    const play = getDefensivePlay(playId)
    if (play) {
      this.selectedPlay = play
      this.selectedPlayIndex = DEFENSE_PLAYBOOK.findIndex(p => p.id === playId)
      
      // Recreate defenders if in pre-snap
      if (this.stateMachine.getCurrentState() === 'preSnap') {
        this.clearPlayObjects()
        this.createDefenders(play)
        this.createOffensiveFormation()
        this.autoSelectDefender()
      }
      
      this.events.emit('playSelected', { play })
    }
  }
  
  /**
   * Snap the ball (called from UI or auto)
   */
  public snapBall(): void {
    if (this.stateMachine.getCurrentState() === 'preSnap') {
      this.stateMachine.transition('countdown', true)
    }
  }
  
  /**
   * Get available defensive plays
   */
  public getAvailablePlays(): DefensivePlay[] {
    return DEFENSE_PLAYBOOK
  }
  
  /**
   * Get current game state
   */
  public getGameState() {
    return {
      phase: this.stateMachine.getCurrentState(),
      down: this.down,
      yardsToGo: this.yardsToGo,
      score: this.score,
      controlledDefender: this.controlledDefenderIndex,
    }
  }
}

// ============================================================================
// FACTORY
// ============================================================================

export function createDefenseScene(): DefenseScene {
  return new DefenseScene()
}
