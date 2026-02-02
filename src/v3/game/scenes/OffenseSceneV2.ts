/**
 * V3 Offense Scene - WORLD CLASS REBUILD
 * 
 * This scene implements the complete offensive gameplay flow with:
 * - Explicit state machine with proper transitions
 * - Timing-based throwing (not tap-and-hope)
 * - Smooth camera with anticipation
 * - Dark Side energy system
 * - Proper micro-animations at every phase
 * 
 * NORTH STAR: Every action has (1) Anticipation, (2) Execution, (3) Consequence
 */

import Phaser from 'phaser'
import { V3_CONFIG, getDifficultyForWeek, getPocketTime, getDefenderSpeed } from '../config/gameConfig'
import { PlayStateMachine, PlayResolution } from '../core/PlayStateMachine'
import { CameraController } from '../systems/CameraController'
import { RouteRunner, PLAY_BOOK, ThrowQuality, getThrowQualityConfig } from '../systems/RouteSystem'
import { AudioManager } from '../../../game/systems/AudioManager'
import { getOpponentColors } from '../data/stadiumBackgrounds'
import { GENERATED_ASSETS } from '../../../game/data/campaignAssets'

// Field coordinate system:
// Y = 0 ............. Opponent end zone TOP (where we score)
// Y = 100 ........... Opponent goal line  
// Y = 600 ........... Midfield (50 yard line)
// Y = 850 ........... Default LOS (own 25 yard line)
// Y = 1100 .......... Own goal line
// Y = 1200 .......... Own end zone BOTTOM

// ============================================================================
// TYPES
// ============================================================================

interface PlayerSprite {
  container: Phaser.GameObjects.Container
  body: Phaser.GameObjects.Arc
  glow?: Phaser.GameObjects.Arc
  number?: Phaser.GameObjects.Text
  jersey: number
  name: string
}

interface ReceiverSprite extends PlayerSprite {
  routeRunner: RouteRunner
  routeIndex: number
  isHighlighted: boolean
  openGlow?: Phaser.GameObjects.Arc
}

interface DefenderSprite extends PlayerSprite {
  speed: number
  targetIndex: number // Which receiver they're covering
  baseX: number
  baseY: number
}

interface BallSprite {
  container: Phaser.GameObjects.Container
  body: Phaser.GameObjects.Arc
  shadow: Phaser.GameObjects.Ellipse
  trail: Phaser.GameObjects.Arc[]
  targetPosition: { x: number, y: number }
  startPosition: { x: number, y: number }
  flightProgress: number
  quality: ThrowQuality
}

// ============================================================================
// CONSTANTS
// ============================================================================

const COLORS = {
  darkSide: 0x111111,
  darkSideGlow: 0x69BE28,
  openHighlight: 0xFFD700,
  perfectHighlight: 0x00FF00,
  danger: 0xFF4444,
  white: 0xFFFFFF,
  ball: 0x7C4A03,
  grass1: 0x2E8B2E,
  grass2: 0x348C34,
  blue: 0x0066CC,
  yellow: 0xFFD700,
}

// ============================================================================
// SCENE
// ============================================================================

export class OffenseSceneV2 extends Phaser.Scene {
  // Core systems
  private stateMachine!: PlayStateMachine
  private cameraController!: CameraController
  
  // Week/Difficulty
  private weekId: number = 1
  private difficulty!: ReturnType<typeof getDifficultyForWeek>
  private oppColors = { primary: 0xAA0000, accent: 0xFF4444 }
  
  // Field state
  private lineOfScrimmage: number = 0
  private firstDownLine: number = 0
  private down: number = 1
  private yardsToGo: number = 10
  private score = { home: 0, away: 0 }
  
  // Players
  private qb?: PlayerSprite
  private receivers: ReceiverSprite[] = []
  private defenders: DefenderSprite[] = []
  private linemen: PlayerSprite[] = []
  
  // Ball
  private ball?: BallSprite
  private ballCarrierIndex: number = -1
  
  // Dark Side Energy
  private darkSideEnergy: number = 0
  
  // Selected play
  private selectedPlayIndex: number = 0
  
  // Graphics layers
  private fieldGraphics!: Phaser.GameObjects.Graphics
  private uiGraphics!: Phaser.GameObjects.Graphics
  
  // Stadium background
  private stadiumBg?: Phaser.GameObjects.Image
  
  constructor() {
    super({ key: 'OffenseSceneV2' })
  }
  
  // ============================================================================
  // LIFECYCLE
  // ============================================================================
  
  init(data: { weekId?: number } = {}): void {
    this.weekId = data.weekId || 1
    this.difficulty = getDifficultyForWeek(this.weekId)
    
    const colors = getOpponentColors(this.weekId)
    this.oppColors = { primary: colors.primary, accent: colors.accent }
    
    // Initialize field position - Start at OUR OWN 20-yard line
    // Own goal line is at Y=1100 (FIELD.height - FIELD.endZoneHeight)
    // 20 yards upfield = 200 pixels less = Y=900
    // We play UPWARD (decreasing Y) toward opponent's end zone (Y=100)
    const FIELD = V3_CONFIG.field
    this.lineOfScrimmage = FIELD.height - FIELD.endZoneHeight - 200 // Y=900 (own 20 yard line)
    this.firstDownLine = this.lineOfScrimmage - 100
    this.down = 1
    this.yardsToGo = 10
    this.score = { home: 0, away: 0 }
    this.darkSideEnergy = 0
  }
  
  preload(): void {
    // Load the FULL stadium image - ultra realistic
    const stadiumUrl = GENERATED_ASSETS.stadiumFields?.['Seattle']
    if (stadiumUrl) {
      this.load.image('stadiumField', stadiumUrl)
    }
  }
  
  create(): void {
    // Initialize camera controller FIRST (it sets bounds)
    this.cameraController = new CameraController(this.cameras.main)
    
    // Initialize state machine
    this.initializeStateMachine()
    
    // Create field
    this.createField()
    this.createFieldMarkings()
    
    // Create QB
    this.createQB()
    
    // Create offensive line
    this.createOffensiveLine()
    
    // Position camera - tight on the action
    // QB is at ~Y=950, show contained play area
    this.cameraController.lookAt(this.qb!.container.y - 150, true)
    this.cameraController.setZoom(1.25)
    
    // Setup input
    this.setupInput()
    
    // Start audio
    try {
      AudioManager.startCrowdAmbience()
    } catch (e) { /* ignore */ }
    
    // Start state machine
    this.stateMachine.start('PRE_SNAP')
    
    // Emit initial state to React
    this.emitState()
  }
  
  update(time: number, delta: number): void {
    // Update state machine
    this.stateMachine.update(delta)
    
    // Update camera (always - handles its own easing)
    this.cameraController.update()
    
    // Update based on current state
    const currentState = this.stateMachine.getCurrentState()
    
    // READ phase: routes develop, defenders cover
    if (currentState === 'READ') {
      this.updateRoutes(delta)
      this.updateDefendersCoverage(delta)
    }
    
    // BALL_FLIGHT: animate the ball
    if (currentState === 'BALL_FLIGHT' && this.ball) {
      this.updateBallFlight(delta)
    }
    
    // No YAC running phase - catches auto-resolve to yards gained
  }
  
  // ============================================================================
  // STATE MACHINE INITIALIZATION
  // ============================================================================
  
  private initializeStateMachine(): void {
    this.stateMachine = new PlayStateMachine({
      // PRE_SNAP
      onPreSnapEnter: () => {
        if (this.qb) {
          this.cameraController.preSnapMode(this.qb.container.y)
        }
        this.emitState()
      },
      onPreSnapUpdate: (delta, progress) => {
        // QB idle animation (subtle sway)
        if (this.qb) {
          this.qb.container.setAngle(Math.sin(this.time.now / 500) * 1.5)
        }
        
        // Receiver shuffle animations (only if receivers exist)
        this.receivers.forEach((rec, i) => {
          const baseY = rec.routeRunner.getPositionAtProgress(0).y
          rec.container.y = baseY + Math.sin(this.time.now / 400 + i) * 2
        })
      },
      onPreSnapExit: () => {
        if (this.qb) this.qb.container.setAngle(0)
      },
      
      // SNAP
      onSnapEnter: () => {
        this.cameraController.shake(100, 0.003)
        this.playSound('snap')
        this.emitState()
        
        // O-line fires forward
        this.linemen.forEach((lineman) => {
          this.tweens.add({
            targets: lineman.container,
            y: lineman.container.y - 15,
            duration: 200,
            ease: 'Power2',
          })
        })
      },
      
      // DROPBACK
      onDropbackEnter: () => {
        if (this.qb) {
          this.cameraController.dropbackMode(this.qb.container.y)
          
          // QB drops back
          const dropDistance = V3_CONFIG.timing.dropback.qbDropDistance
          this.tweens.add({
            targets: this.qb.container,
            y: this.qb.container.y + dropDistance,
            duration: V3_CONFIG.timing.dropback.duration,
            ease: 'Power1',
          })
        }
        this.emitState()
      },
      onDropbackUpdate: () => {
        // Camera already tracking via mode - no need to update here
      },
      
      // READ
      onReadEnter: () => {
        if (this.qb) {
          this.cameraController.pocketMode(this.qb.container.y)
        }
        this.emitState()
        
        // Set pocket duration based on difficulty
        const pocketTime = getPocketTime(this.weekId)
        this.stateMachine.setPocketDuration(pocketTime)
      },
      onReadUpdate: (delta, pocketTimeRemaining) => {
        // Emit pressure level to React
        const pressure = this.stateMachine.getPocketPressure()
        this.events.emit('pressureUpdate', { pressure, timeRemaining: pocketTimeRemaining })
        
        // Visual pressure indicator (screen edge glow as pressure builds)
        if (pressure > 0.7) {
          // Edge glow would be handled by React, we just emit the event
          this.events.emit('highPressure', { pressure })
        }
      },
      onReadExit: () => {
        // Clear receiver highlights
        this.receivers.forEach(rec => this.setReceiverHighlight(rec, false))
      },
      
      // THROW
      onThrowEnter: (targetReceiver) => {
        this.ballCarrierIndex = targetReceiver
        const receiver = this.receivers[targetReceiver]
        if (!receiver) return
        
        // Determine throw quality based on current route progress
        const routeState = receiver.routeRunner.update(0, V3_CONFIG.timing.read.routeDuration)
        const quality = routeState.throwQuality
        
        // Create ball and initiate throw
        this.createBall(quality, receiver)
        
        this.playSound('throw')
        this.emitState()
      },
      
      // BALL_FLIGHT
      onBallFlightEnter: () => {
        if (this.ball) {
          this.cameraController.ballFlightMode(this.ball.container)
        }
        this.emitState()
      },
      
      // CATCH - Now receives full CatchResult with auto-calculated yards
      onCatchEnter: (result) => {
        const receiver = this.receivers[result.receiverIndex]
        if (!receiver) return
        
        // Destroy ball
        this.destroyBall()
        
        // Receiver has ball - brief celebration animation
        receiver.isHighlighted = true
        
        // Catch animation with emphasis based on throw quality
        const catchScale = result.throwQuality === 'perfect' ? 1.4 : 1.2
        this.tweens.add({
          targets: receiver.container,
          scaleX: catchScale,
          scaleY: catchScale,
          duration: 150,
          yoyo: true,
        })
        
        // Highlight ball carrier
        this.setReceiverHighlight(receiver, true, COLORS.darkSideGlow)
        
        // Camera: quick zoom to catch point
        this.cameraController.lookAt(receiver.container.y - 50)
        this.cameraController.setZoom(1.25)
        
        // Emit yards gained event for UI
        this.events.emit('catch', { 
          yardsGained: result.yardsGained,
          throwQuality: result.throwQuality,
          isTouchdown: result.isTouchdown,
          receiver: receiver.name,
        })
        
        this.playSound('catch')
        this.emitState()
      },
      
      // TOUCHDOWN
      onTouchdownEnter: () => {
        this.score.home += 7
        
        // Camera: zoom to end zone
        this.cameraController.touchdownMode(V3_CONFIG.field.endZoneHeight)
        this.cameraController.flash(300, 105, 190, 40) // Green flash
        
        // Celebration
        this.createTouchdownCelebration()
        
        // Dark Side energy boost
        this.addDarkSideEnergy(V3_CONFIG.darkSideEnergy.gains.touchdown)
        
        this.playSound('touchdown')
        this.events.emit('touchdown')
        this.emitState()
      },
      
      // TACKLED - Now receives pre-calculated yards from catch resolution
      onTackledEnter: (yardsGained) => {
        this.cameraController.shake(100, 0.005)
        
        // Quick "tackled" visual on receiver
        const carrier = this.receivers[this.ballCarrierIndex]
        if (carrier) {
          this.tweens.add({
            targets: carrier.container,
            scaleX: 0.8,
            scaleY: 0.8,
            duration: 100,
            yoyo: true,
          })
        }
        
        // Emit yards gained event with the pre-calculated value
        this.events.emit('yardsGained', { 
          yards: yardsGained,
          isFirstDown: yardsGained >= this.yardsToGo,
        })
        
        // Add Dark Side energy for positive plays
        if (yardsGained >= 10) {
          this.addDarkSideEnergy(V3_CONFIG.darkSideEnergy.gains.bigPlay)
        } else if (yardsGained > 0) {
          this.addDarkSideEnergy(V3_CONFIG.darkSideEnergy.gains.goodThrow)
        }
        
        this.emitState()
      },
      
      // INCOMPLETE - Ball drops
      onIncompleteEnter: () => {
        // Let ball fall to ground before destroying
        if (this.ball) {
          this.tweens.add({
            targets: this.ball.container,
            y: this.ball.container.y + 40,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => this.destroyBall(),
          })
        } else {
          this.destroyBall()
        }
        
        // Receiver drops animation
        const receiver = this.receivers[this.ballCarrierIndex]
        if (receiver) {
          this.tweens.add({
            targets: receiver.container,
            angle: [-10, 0],
            duration: 200,
          })
        }
        
        this.playSound('incomplete')
        this.addDarkSideEnergy(-V3_CONFIG.darkSideEnergy.decay.onIncomplete)
        this.events.emit('incomplete')
        this.emitState()
      },
      
      // SACKED - Dramatic collapse
      onSackedEnter: () => {
        // Big screen shake and red flash
        this.cameraController.shake(300, 0.02)
        this.cameraController.flash(200, 200, 50, 50)
        
        // QB goes down hard
        if (this.qb) {
          this.tweens.add({
            targets: this.qb.container,
            angle: -90,
            y: this.qb.container.y + 30,
            scaleX: 0.8,
            scaleY: 0.8,
            duration: 400,
            ease: 'Bounce',
          })
        }
        
        // Defenders celebrate
        this.defenders.forEach((def, i) => {
          this.tweens.add({
            targets: def.container,
            y: def.container.y - 15,
            duration: 200,
            delay: i * 50,
            yoyo: true,
          })
        })
        
        this.playSound('sack')
        this.addDarkSideEnergy(-V3_CONFIG.darkSideEnergy.decay.onSack)
        this.events.emit('sack', { yardsLost: 8 })
        this.emitState()
      },
      
      // INTERCEPTION - Dramatic animation
      onInterceptionEnter: () => {
        this.destroyBall()
        
        // Flash red
        this.cameraController.flash(300, 255, 50, 50)
        this.cameraController.shake(200, 0.015)
        
        // Find nearest defender and animate them catching it
        const closestDef = this.defenders[0]
        if (closestDef) {
          // Defender jumps and celebrates
          this.tweens.add({
            targets: closestDef.container,
            y: closestDef.container.y - 30,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 300,
            yoyo: true,
            ease: 'Power2',
          })
        }
        
        this.playSound('interception')
        this.addDarkSideEnergy(-V3_CONFIG.darkSideEnergy.decay.onInterception)
        this.events.emit('interception')
        this.emitState()
      },
      
      // POST_PLAY
      onPostPlayEnter: (resolution) => {
        this.handlePostPlay(resolution)
      },
      onPostPlayExit: () => {
        // Reset for next play
        this.resetFieldForNextPlay()
      },
      
      // QUARTER_END
      onQuarterEndEnter: () => {
        this.events.emit('quarterEnd')
        this.emitState()
      },
      
      // GAME_END
      onGameEndEnter: () => {
        const won = this.score.home > this.score.away
        this.events.emit('gameEnd', { won, score: this.score })
        this.emitState()
      },
    }, this.weekId)
  }
  
  // ============================================================================
  // FIELD CREATION
  // ============================================================================
  
  private createField(): void {
    const FIELD = V3_CONFIG.field
    
    this.fieldGraphics = this.add.graphics()
    this.fieldGraphics.setDepth(1)
    
    // Use the photorealistic field image as background
    // The image shows the ENTIRE field from end zone to end zone
    // FLIP VERTICALLY so opponent's end zone (where we score) is at TOP (Y=0)
    // and our end zone (where we start) is at BOTTOM (Y=1200)
    if (this.textures.exists('stadiumField')) {
      this.stadiumBg = this.add.image(FIELD.width / 2, FIELD.height / 2, 'stadiumField')
      this.stadiumBg.setDisplaySize(FIELD.width, FIELD.height)
      this.stadiumBg.setFlipY(true) // Flip so opponent end zone is at top
      this.stadiumBg.setDepth(0)
      // Default scrollFactor is 1,1 - image is part of the world and camera scrolls over it
    } else {
      // Fallback: simple gradient field with grass stripes
      const bg = this.add.graphics()
      for (let y = 0; y < FIELD.height; y += 100) {
        const color = Math.floor(y / 100) % 2 === 0 ? 0x3d8b40 : 0x2d7a30
        bg.fillStyle(color, 1)
        bg.fillRect(0, y, FIELD.width, 100)
      }
      bg.setDepth(0)
    }
  }
  
  // Store line references for updates
  private firstDownLineGraphic?: Phaser.GameObjects.Rectangle
  private losLineGraphic?: Phaser.GameObjects.Rectangle
  private firstDownMarker?: Phaser.GameObjects.Container
  
  private createFieldMarkings(): void {
    const FIELD = V3_CONFIG.field
    
    // First down line (YELLOW) - animated pulsing
    this.firstDownLineGraphic = this.add.rectangle(
      FIELD.width / 2, this.firstDownLine,
      FIELD.width, 8,
      COLORS.yellow
    ).setDepth(10).setAlpha(0.9)
    
    // Pulse animation for first down line
    this.tweens.add({
      targets: this.firstDownLineGraphic,
      alpha: { from: 0.9, to: 0.5 },
      duration: 800,
      yoyo: true,
      repeat: -1,
    })
    
    // LOS line (BLUE) - solid
    this.losLineGraphic = this.add.rectangle(
      FIELD.width / 2, this.lineOfScrimmage,
      FIELD.width, 5,
      COLORS.blue
    ).setDepth(10).setAlpha(0.85)
    
    // First down marker (like NFL first down marker)
    this.firstDownMarker = this.add.container(FIELD.width - 15, this.firstDownLine)
    
    // Pole
    const pole = this.add.rectangle(0, 0, 4, 40, 0xFFD700)
    this.firstDownMarker.add(pole)
    
    // Arrow pointing to line
    const arrow = this.add.triangle(0, -25, -8, 0, 8, 0, 0, -12, 0xFFD700)
    this.firstDownMarker.add(arrow)
    
    this.firstDownMarker.setDepth(12)
  }
  
  private updateFieldMarkings(): void {
    // Update line positions after play
    if (this.firstDownLineGraphic) {
      this.firstDownLineGraphic.setY(this.firstDownLine)
    }
    if (this.losLineGraphic) {
      this.losLineGraphic.setY(this.lineOfScrimmage)
    }
    if (this.firstDownMarker) {
      this.firstDownMarker.setY(this.firstDownLine)
    }
  }
  
  // ============================================================================
  // PLAYER CREATION
  // ============================================================================
  
  private createPlayerSprite(
    x: number,
    y: number,
    jersey: number,
    name: string,
    color: number,
    glowColor?: number,
    radius: number = 14
  ): PlayerSprite {
    const container = this.add.container(x, y)
    
    // Shadow
    const shadow = this.add.ellipse(0, 6, radius * 1.4, radius * 0.6, 0x000000, 0.4)
    container.add(shadow)
    
    // Glow (if specified)
    let glow: Phaser.GameObjects.Arc | undefined
    if (glowColor) {
      glow = this.add.arc(0, 0, radius + 6, 0, 360, false, glowColor, 0.25)
      container.add(glow)
      
      // Pulse animation
      this.tweens.add({
        targets: glow,
        scale: 1.15,
        alpha: 0.15,
        duration: 800,
        yoyo: true,
        repeat: -1,
      })
    }
    
    // Body (helmet)
    const body = this.add.arc(0, 0, radius, 0, 360, false, color)
    body.setStrokeStyle(2, glowColor || COLORS.white)
    container.add(body)
    
    // Jersey number
    const number = this.add.text(0, 0, `${jersey}`, {
      fontSize: `${Math.floor(radius * 0.7)}px`,
      fontFamily: 'Arial Black',
      color: '#FFFFFF',
    }).setOrigin(0.5)
    container.add(number)
    
    container.setDepth(10)
    
    return { container, body, glow, number, jersey, name }
  }
  
  private createQB(): void {
    const FIELD = V3_CONFIG.field
    const cfg = V3_CONFIG.players.qb
    
    const qbY = this.lineOfScrimmage + FIELD.losToQb
    
    this.qb = this.createPlayerSprite(
      FIELD.width / 2,
      qbY,
      14, // Darnold
      'DARNOLD',
      cfg.color,
      cfg.glowColor,
      cfg.radius
    )
    
    // Extra QB ring
    const ring = this.add.arc(0, 0, cfg.glowRadius, 0, 360, false, cfg.glowColor, 0)
    ring.setStrokeStyle(2, cfg.glowColor, 0.5)
    this.qb.container.addAt(ring, 0)
    
    this.tweens.add({
      targets: ring,
      scale: 1.3,
      alpha: 0,
      strokeAlpha: 0,
      duration: 1500,
      repeat: -1,
    })
  }
  
  private createOffensiveLine(): void {
    const FIELD = V3_CONFIG.field
    const cfg = V3_CONFIG.players.lineman
    const lineY = this.lineOfScrimmage + 5
    
    // Scale positions to fit within visible field area
    const PLAYER_SCALE = 0.55
    const positions = [-70 * PLAYER_SCALE, -35 * PLAYER_SCALE, 0, 35 * PLAYER_SCALE, 70 * PLAYER_SCALE]
    const jerseys = [72, 63, 52, 66, 75]
    const names = ['LT', 'LG', 'C', 'RG', 'RT']
    
    this.linemen = positions.map((offsetX, i) => {
      return this.createPlayerSprite(
        FIELD.width / 2 + offsetX,
        lineY,
        jerseys[i],
        names[i],
        cfg.color,
        cfg.glowColor,
        cfg.radius
      )
    })
  }
  
  private createReceivers(playIndex: number): void {
    // Clear existing receivers
    this.receivers.forEach(r => r.container.destroy())
    this.receivers = []
    
    const play = PLAY_BOOK[playIndex]
    if (!play) return
    
    const FIELD = V3_CONFIG.field
    const cfg = V3_CONFIG.players.receiver
    const receiverData = [
      { jersey: 11, name: 'JSN' },
      { jersey: 10, name: 'KUPP' },
      { jersey: 16, name: 'LOCKETT' },
      { jersey: 88, name: 'BARNER' },
    ]
    
    play.routes.forEach((route, i) => {
      const data = receiverData[i] || { jersey: 80 + i, name: `WR${i + 1}` }
      
      // Create route runner
      const routeRunner = new RouteRunner(
        route,
        FIELD.width / 2,
        this.lineOfScrimmage,
        this.weekId,
        this.darkSideEnergy >= V3_CONFIG.darkSideEnergy.activeThreshold 
          ? V3_CONFIG.darkSideEnergy.bonuses.windowExpansion 
          : 0
      )
      
      const startPos = routeRunner.getPositionAtProgress(0)
      
      const sprite = this.createPlayerSprite(
        startPos.x,
        startPos.y,
        data.jersey,
        data.name,
        cfg.color,
        cfg.glowColor,
        cfg.radius
      )
      
      // Make tappable
      sprite.body.setInteractive({ useHandCursor: true })
      
      // Open indicator ring - SMALL, SUBTLE
      const openGlow = this.add.arc(0, 0, cfg.radius + 5, 0, 360, false, cfg.openHighlight, 0)
      sprite.container.addAt(openGlow, 0)
      
      const receiver: ReceiverSprite = {
        ...sprite,
        routeRunner,
        routeIndex: i,
        isHighlighted: false,
        openGlow,
      }
      
      this.receivers.push(receiver)
    })
  }
  
  private createDefenders(playIndex: number): void {
    // Clear existing defenders
    this.defenders.forEach(d => d.container.destroy())
    this.defenders = []
    
    const FIELD = V3_CONFIG.field
    const cfg = V3_CONFIG.players.defender
    
    // Scale to fit within visible field area
    const PLAYER_SCALE = 0.55
    
    // Defensive positions - MUCH MORE SEPARATION for clear reads
    // CBs start 10-12 yards off, LBs 7-8 yards, Safeties 15+ yards
    const positions = [
      { x: -95 * PLAYER_SCALE, y: -100 },  // CB left - 10 yards off
      { x: -45 * PLAYER_SCALE, y: -70 },   // LB left - 7 yards off
      { x: 0, y: -60 },                     // MLB - 6 yards off
      { x: 45 * PLAYER_SCALE, y: -70 },    // LB right - 7 yards off
      { x: 95 * PLAYER_SCALE, y: -100 },   // CB right - 10 yards off
      { x: 0, y: -180 },                    // FS - 18 yards deep
      { x: -55 * PLAYER_SCALE, y: -150 },  // SS - 15 yards deep
    ]
    
    const jerseys = [24, 55, 50, 56, 22, 29, 33]
    
    positions.forEach((pos, i) => {
      const x = FIELD.width / 2 + pos.x
      const y = this.lineOfScrimmage + pos.y
      
      const sprite = this.createPlayerSprite(
        x, y,
        jerseys[i],
        `DEF${i}`,
        this.oppColors.primary,
        undefined,
        cfg.radius
      )
      
      sprite.body.setFillStyle(this.oppColors.primary)
      sprite.body.setStrokeStyle(2, this.oppColors.accent)
      
      // Faster base speed for aggressive closing
      const defender: DefenderSprite = {
        ...sprite,
        speed: cfg.baseSpeed * this.difficulty.defenderSpeedMult * 1.3, // 30% faster closing
        targetIndex: i % this.receivers.length,
        baseX: x,
        baseY: y,
      }
      
      this.defenders.push(defender)
    })
  }
  
  // ============================================================================
  // ROUTE & DEFENDER UPDATES
  // ============================================================================
  
  private updateRoutes(delta: number): void {
    const routeDuration = V3_CONFIG.timing.read.routeDuration
    
    this.receivers.forEach((receiver, i) => {
      const state = receiver.routeRunner.update(delta, routeDuration)
      
      // Update position
      receiver.container.setPosition(state.position.x, state.position.y)
      
      // Update visual feedback based on openness
      this.updateReceiverVisual(receiver, state.openness, state.isOpen)
    })
  }
  
  private updateReceiverVisual(receiver: ReceiverSprite, openness: number, isOpen: boolean): void {
    if (!receiver.openGlow) return
    
    // MINIMAL, CLEAN visual feedback - no crazy flashing
    if (isOpen && openness > 0.5) {
      // OPEN - simple ring, no pulsing
      receiver.openGlow.setScale(1.0)
      receiver.openGlow.setAlpha(0.5)
      receiver.openGlow.setFillStyle(COLORS.darkSideGlow, 0.5)
      
      // Simple border highlight
      receiver.body.setStrokeStyle(2, COLORS.darkSideGlow)
    } else if (isOpen && openness > 0.3) {
      // GETTING OPEN - subtle
      receiver.openGlow.setScale(0.9)
      receiver.openGlow.setAlpha(0.25)
      receiver.openGlow.setFillStyle(COLORS.openHighlight, 0.25)
      
      receiver.body.setStrokeStyle(2, 0x666666)
    } else {
      // NOT OPEN - no glow, dim
      receiver.openGlow.setAlpha(0)
      receiver.body.setStrokeStyle(1, 0x444444)
    }
  }
  
  private setReceiverHighlight(receiver: ReceiverSprite, active: boolean, color?: number): void {
    if (active) {
      receiver.body.setFillStyle(color || COLORS.openHighlight)
      receiver.isHighlighted = true
    } else {
      receiver.body.setFillStyle(COLORS.darkSide)
      receiver.isHighlighted = false
    }
  }
  
  private updateDefendersCoverage(delta: number): void {
    // Get pocket pressure - determines closing speed
    const pressure = this.stateMachine.getPocketPressure()
    
    // Field boundaries - don't go past goal line or sidelines
    const GOAL_LINE = 100
    const SIDELINE_MIN = 15
    const SIDELINE_MAX = 385
    
    const clamp = (x: number, y: number) => ({
      x: Math.max(SIDELINE_MIN, Math.min(SIDELINE_MAX, x)),
      y: Math.max(GOAL_LINE, y),
    })
    
    // Closing speed ramps up over time
    // Early: slow (routes develop), Late: fast (closing the window)
    const closeSpeedMult = 0.6 + pressure * 0.8 // 0.6 early, 1.4 at max pressure
    
    this.defenders.forEach((defender) => {
      const targetReceiver = this.receivers[defender.targetIndex]
      if (!targetReceiver) return
      
      // Move toward assigned receiver - AGGRESSIVE closing
      const dx = targetReceiver.container.x - defender.container.x
      const dy = targetReceiver.container.y - defender.container.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      
      if (dist > 25) { // Don't overlap
        const speed = defender.speed * closeSpeedMult * (delta / 16)
        const newX = defender.container.x + (dx / dist) * speed
        const newY = defender.container.y + (dy / dist) * speed
        const clamped = clamp(newX, newY)
        defender.container.x = clamped.x
        defender.container.y = clamped.y
      }
      
      // NO crazy color changes - keep it clean
      defender.body.setFillStyle(this.oppColors.primary)
    })
    
    // PASS RUSH - More aggressive timing-based rush
    // D-linemen (index 0) rush immediately, LBs (1,2,3) rush as pressure builds
    if (this.qb) {
      // D-lineman always rushes from snap
      const dLine = this.defenders[0]
      if (dLine) {
        const dx = this.qb.container.x - dLine.container.x
        const dy = this.qb.container.y - dLine.container.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist > 25) {
          // D-line gets faster as play develops
          const dLineSpeed = (2.0 + pressure * 2.5) * (delta / 16)
          const newX = dLine.container.x + (dx / dist) * dLineSpeed
          const newY = dLine.container.y + (dy / dist) * dLineSpeed
          const clamped = clamp(newX, newY)
          dLine.container.x = clamped.x
          dLine.container.y = clamped.y
        }
      }
      
      // LBs rush when pressure passes 0.4 (earlier than before)
      if (pressure > 0.4) {
        const rushers = [this.defenders[1], this.defenders[2], this.defenders[3]].filter(Boolean)
        const rushMult = Math.min(1, (pressure - 0.4) / 0.4) // 0 at 0.4 pressure, 1 at 0.8+
        
        rushers.forEach(rusher => {
          const dx = this.qb!.container.x - rusher.container.x
          const dy = this.qb!.container.y - rusher.container.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist > 30) {
            // Speed ramps up as pressure increases
            const rushSpeed = (1.5 + rushMult * 2.5) * (delta / 16)
            const newX = rusher.container.x + (dx / dist) * rushSpeed
            const newY = rusher.container.y + (dy / dist) * rushSpeed
            const clamped = clamp(newX, newY)
            rusher.container.x = clamped.x
            rusher.container.y = clamped.y
          }
        })
      }
      
      // Check for sack if defender is very close to QB
      const allRushers = [this.defenders[0], this.defenders[1], this.defenders[2], this.defenders[3]].filter(Boolean)
      for (const rusher of allRushers) {
        const dist = Phaser.Math.Distance.Between(
          this.qb.container.x, this.qb.container.y,
          rusher.container.x, rusher.container.y
        )
        if (dist < 35 && pressure > 0.85) {
          // Sack! End the play
          this.events.emit('sack')
          this.stateMachine.qbSacked()
          break
        }
      }
    }
  }
  
  // ============================================================================
  // BALL MECHANICS
  // ============================================================================
  
  private createBall(quality: ThrowQuality, targetReceiver: ReceiverSprite): void {
    if (!this.qb) return
    
    // Reset manual catch flag for new throw
    this.manualCatchAttempted = false
    
    const cfg = V3_CONFIG.players.ball
    const qbPos = { x: this.qb.container.x, y: this.qb.container.y }
    
    // Target position (lead the receiver slightly)
    const receiverPos = targetReceiver.container
    const targetPos = {
      x: receiverPos.x,
      y: receiverPos.y - 20, // Lead slightly
    }
    
    // Container
    const container = this.add.container(qbPos.x, qbPos.y)
    
    // Shadow - LARGER
    const shadow = this.add.ellipse(0, 18, 16, 6, 0x000000, 0.5)
    container.add(shadow)
    
    // Glow ring behind ball for visibility
    const glow = this.add.arc(0, 0, cfg.radius + 8, 0, 360, false, COLORS.darkSideGlow, 0.4)
    container.add(glow)
    
    // Ball - LARGER and BRIGHTER
    const ballRadius = cfg.radius * 1.4 // 40% bigger
    const body = this.add.arc(0, 0, ballRadius, 0, 360, false, 0x8B4513) // Saddle brown
    body.setStrokeStyle(3, COLORS.white)
    container.add(body)
    
    // White laces detail
    const laces = this.add.rectangle(0, 0, ballRadius * 0.4, 2, COLORS.white)
    container.add(laces)
    
    container.setDepth(20) // Higher depth to be above everything
    
    // Trail particles - BIGGER and BRIGHTER
    const trail: Phaser.GameObjects.Arc[] = []
    for (let i = 0; i < 10; i++) { // More particles
      const particle = this.add.arc(0, 0, ballRadius * 0.5, 0, 360, false, 
        COLORS.darkSideGlow, 
        0.7 * (1 - i / 10)
      )
      particle.setDepth(19)
      trail.push(particle)
    }
    
    this.ball = {
      container,
      body,
      shadow,
      trail,
      targetPosition: targetPos,
      startPosition: qbPos,
      flightProgress: 0,
      quality,
    }
  }
  
  private updateBallFlight(delta: number): void {
    if (!this.ball) return
    
    const cfg = V3_CONFIG.timing.throw
    const qualityCfg = getThrowQualityConfig(this.ball.quality)
    
    // Calculate flight speed - SLOWER for timing-based catch
    const speed = cfg.baseSpeed * qualityCfg.ballSpeed * 0.7 // Slower for better timing window
    const flightDuration = V3_CONFIG.timing.ballFlight.maxDuration
    
    // Advance progress
    this.ball.flightProgress += (delta / flightDuration) * speed
    
    // Calculate position with arc
    const p = Math.min(1, this.ball.flightProgress)
    const start = this.ball.startPosition
    const target = this.ball.targetPosition
    
    // Parabolic arc - MORE PRONOUNCED for visibility
    const arcHeight = (V3_CONFIG.timing.ballFlight.arcHeight * 1.5) * (1 - qualityCfg.spiralTightness * 0.5)
    const arc = Math.sin(p * Math.PI) * arcHeight
    
    const x = Phaser.Math.Linear(start.x, target.x, p)
    const y = Phaser.Math.Linear(start.y, target.y, p) - arc
    
    this.ball.container.setPosition(x, y)
    
    // Make ball more visible - pulsing scale
    const pulseScale = 1 + Math.sin(this.time.now / 80) * 0.15
    this.ball.body.setScale(pulseScale)
    
    // Update shadow (offset increases with arc height)
    this.ball.shadow.setPosition(0, 10 + arc * 0.3)
    this.ball.shadow.setScale(0.6 + (1 - arc / arcHeight) * 0.4)
    
    // Update trail - BRIGHTER
    this.ball.trail.forEach((particle, i) => {
      const trailP = Math.max(0, p - (i * 0.03)) // Wider spacing
      const trailArc = Math.sin(trailP * Math.PI) * arcHeight
      particle.setPosition(
        Phaser.Math.Linear(start.x, target.x, trailP),
        Phaser.Math.Linear(start.y, target.y, trailP) - trailArc
      )
      // Fade trail as it ages
      particle.setAlpha(0.6 * (1 - i / this.ball!.trail.length))
    })
    
    // Wobble animation for bad throws
    if (qualityCfg.spiralTightness < 0.6) {
      this.ball.container.setAngle(Math.sin(this.time.now / 50) * (20 - qualityCfg.spiralTightness * 20))
    }
    
    // EMIT BALL FLIGHT PROGRESS for React UI (catch button timing)
    // Perfect catch window is 0.7 - 0.9 progress
    const catchWindowStart = 0.6
    const catchWindowPerfect = 0.8
    const catchWindowEnd = 0.95
    
    this.events.emit('ballFlight', {
      progress: p,
      inCatchWindow: p >= catchWindowStart && p <= catchWindowEnd,
      isPerfectWindow: p >= 0.75 && p <= 0.88,
      catchWindowProgress: p >= catchWindowStart ? (p - catchWindowStart) / (catchWindowEnd - catchWindowStart) : 0,
    })
    
    // Check if ball reached target (auto-catch if player didn't tap)
    if (p >= 1) {
      // Auto-resolve with "late" timing if player didn't manually catch
      if (!this.manualCatchAttempted) {
        this.attemptCatch('auto')
      }
    }
  }
  
  // Flag to track if player attempted manual catch
  private manualCatchAttempted: boolean = false
  
  /**
   * PUBLIC: Called when player taps CATCH button
   */
  public attemptCatch(timing: 'early' | 'perfect' | 'late' | 'auto'): void {
    if (this.stateMachine.getCurrentState() !== 'BALL_FLIGHT') return
    if (!this.ball) return
    
    this.manualCatchAttempted = true
    const p = this.ball.flightProgress
    
    // Determine catch timing based on when player tapped
    let catchTiming: 'early' | 'perfect' | 'late' | 'missed'
    if (timing === 'auto') {
      catchTiming = 'late' // Auto-catch is always "late"
    } else if (p < 0.5) {
      catchTiming = 'missed' // Way too early
    } else if (p < 0.7) {
      catchTiming = 'early'
    } else if (p >= 0.75 && p <= 0.88) {
      catchTiming = 'perfect'
    } else if (p <= 0.95) {
      catchTiming = 'late'
    } else {
      catchTiming = 'missed' // Too late
    }
    
    // Emit catch timing for UI feedback
    this.events.emit('catchAttempt', { timing: catchTiming, progress: p })
    
    // Animate receiver jump
    const receiver = this.receivers[this.ballCarrierIndex]
    if (receiver) {
      this.animateReceiverCatch(receiver, catchTiming)
    }
    
    // Process catch result
    if (catchTiming === 'missed') {
      this.stateMachine.ballIncomplete()
    } else {
      this.resolveCatchWithTiming(catchTiming)
    }
  }
  
  private animateReceiverCatch(receiver: ReceiverSprite, timing: string): void {
    // Jump animation - higher for perfect timing
    const jumpHeight = timing === 'perfect' ? 25 : timing === 'early' ? 15 : 10
    
    this.tweens.add({
      targets: receiver.container,
      y: receiver.container.y - jumpHeight,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 150,
      yoyo: true,
      ease: 'Power2',
    })
    
    // Flash effect for perfect catch
    if (timing === 'perfect') {
      this.cameraController.flash(100, 105, 190, 40)
    }
  }
  
  private resolveCatchWithTiming(timing: 'early' | 'perfect' | 'late'): void {
    if (!this.ball) return
    
    const receiver = this.receivers[this.ballCarrierIndex]
    if (!receiver) {
      this.stateMachine.ballIncomplete()
      return
    }
    
    // Check for interception based on timing
    const qualityCfg = getThrowQualityConfig(this.ball.quality)
    let interceptChance = qualityCfg.interceptChance
    
    // Timing affects interception chance
    if (timing === 'perfect') {
      interceptChance = 0 // Perfect timing = no INT
    } else if (timing === 'early') {
      interceptChance *= 1.5 // Early = higher INT risk
    } else if (timing === 'late') {
      interceptChance *= 2 // Late = much higher INT risk
    }
    
    if (Math.random() < interceptChance) {
      this.stateMachine.ballIntercepted()
      return
    }
    
    // === NEW: Check for drop based on coverage and timing ===
    let dropChance = 0
    
    // Find nearest defender to receiver
    let nearestDefenderDist = Infinity
    for (const def of this.defenders) {
      const dist = Phaser.Math.Distance.Between(
        receiver.container.x, receiver.container.y,
        def.container.x, def.container.y
      )
      nearestDefenderDist = Math.min(nearestDefenderDist, dist)
    }
    
    // Base drop chance based on coverage tightness
    if (nearestDefenderDist < 30) {
      dropChance = 0.35 // Tight coverage = 35% drop
    } else if (nearestDefenderDist < 50) {
      dropChance = 0.15 // Moderate coverage = 15% drop
    } else if (nearestDefenderDist < 80) {
      dropChance = 0.05 // Light coverage = 5% drop
    }
    
    // Timing reduces or increases drop chance
    if (timing === 'perfect') {
      dropChance *= 0.2 // Perfect timing = 80% less likely to drop
    } else if (timing === 'early') {
      dropChance *= 1.3 // Early = more likely to bobble
    } else if (timing === 'late') {
      dropChance *= 1.5 // Late = highest drop chance
    }
    
    // Throw quality also affects drops
    if (this.ball.quality === 'perfect') {
      dropChance *= 0.5 // Perfect throw = easier to catch
    } else if (this.ball.quality === 'late' || this.ball.quality === 'early') {
      dropChance *= 1.4 // Poor throw = harder to catch
    }
    
    // Auto-catch timing has higher drop chance
    if (timing === 'late' && !this.manualCatchAttempted) {
      dropChance += 0.1 // Auto-catches have 10% additional drop chance
    }
    
    if (Math.random() < dropChance) {
      this.events.emit('incomplete', { reason: 'drop', timing })
      this.stateMachine.ballIncomplete()
      return
    }
    
    // === Calculate yards with timing bonus ===
    const FIELD = V3_CONFIG.field
    const GOAL_LINE = FIELD.endZoneHeight
    const catchY = receiver.container.y
    const baseYards = Math.floor((this.lineOfScrimmage - catchY) / FIELD.yardLength)
    
    // Timing bonus yards
    const timingBonusMap = {
      'perfect': 8,  // Perfect catch = +8 yards (receiver in stride, YAC)
      'early': 2,    // Early = +2 yards
      'late': 0,     // Late = no bonus (had to stop)
    }
    const timingBonus = timingBonusMap[timing]
    
    // Throw quality bonus (stacks with timing)
    const throwBonus = this.ball.quality === 'perfect' ? 5 : 
                       this.ball.quality === 'good' ? 2 : 0
    
    const yardsGained = Math.max(0, baseYards + timingBonus + throwBonus)
    const isTouchdown = catchY <= GOAL_LINE + 50
    
    const catchResult = {
      receiverIndex: this.ballCarrierIndex,
      catchY,
      yardsGained: isTouchdown ? baseYards : yardsGained,
      isTouchdown,
      throwQuality: this.ball.quality as 'perfect' | 'good' | 'late' | 'early',
      bonusYards: timingBonus + throwBonus,
    }
    
    this.stateMachine.ballCaught(catchResult)
  }
  
  private resolveCatch(): void {
    if (!this.ball) return
    
    const receiver = this.receivers[this.ballCarrierIndex]
    if (!receiver) {
      this.stateMachine.ballIncomplete()
      return
    }
    
    // Check for interception
    const qualityCfg = getThrowQualityConfig(this.ball.quality)
    if (Math.random() < qualityCfg.interceptChance) {
      this.stateMachine.ballIntercepted()
      return
    }
    
    // === AUTO-RESOLVE: Calculate yards gained at catch point ===
    const FIELD = V3_CONFIG.field
    const GOAL_LINE = FIELD.endZoneHeight // Y=100
    
    // Where did the receiver catch it?
    const catchY = receiver.container.y
    
    // Base yards gained = distance from LOS to catch point
    const baseYards = Math.floor((this.lineOfScrimmage - catchY) / FIELD.yardLength)
    
    // Bonus yards based on throw quality
    const qualityBonusMap: Record<string, number> = {
      'perfect': 5,  // Perfect throw = 5 extra yards (receiver in stride)
      'good': 2,     // Good throw = 2 extra yards
      'late': 0,     // Late throw = no bonus (had to stop)
      'early': -2,   // Early throw = lose 2 yards (off balance catch)
    }
    const throwQuality = this.ball.quality
    const bonusYards = qualityBonusMap[throwQuality] || 0
    
    // Total yards gained
    const yardsGained = Math.max(0, baseYards + bonusYards)
    
    // Is it a touchdown? (catch point in or past end zone)
    const isTouchdown = catchY <= GOAL_LINE + 50 // Caught within 5 yards of goal = TD
    
    // Create catch result for state machine
    const catchResult = {
      receiverIndex: this.ballCarrierIndex,
      catchY,
      yardsGained: isTouchdown ? baseYards : yardsGained, // TD = full distance
      isTouchdown,
      throwQuality: throwQuality as 'perfect' | 'good' | 'late' | 'early',
      bonusYards,
    }
    
    // Pass result to state machine - it will auto-resolve to TD or TACKLED
    this.stateMachine.ballCaught(catchResult)
  }
  
  private destroyBall(): void {
    if (!this.ball) return
    
    this.ball.container.destroy()
    this.ball.trail.forEach(p => p.destroy())
    this.ball = undefined
  }
  
  // ============================================================================
  // NOTE: YAC running phase removed - catches now auto-resolve to yards gained
  // The game is now focused on QB precision passing, not running after catch
  // ============================================================================
  
  // ============================================================================
  // DARK SIDE ENERGY
  // ============================================================================
  
  private addDarkSideEnergy(amount: number): void {
    this.darkSideEnergy = Phaser.Math.Clamp(
      this.darkSideEnergy + amount,
      0,
      V3_CONFIG.darkSideEnergy.maxEnergy
    )
    
    this.events.emit('darkSideEnergy', { 
      energy: this.darkSideEnergy,
      active: this.darkSideEnergy >= V3_CONFIG.darkSideEnergy.activeThreshold,
    })
  }
  
  // ============================================================================
  // TOUCHDOWN CELEBRATION
  // ============================================================================
  
  private createTouchdownCelebration(): void {
    const carrier = this.receivers[this.ballCarrierIndex]
    if (!carrier) return
    
    // Particle burst
    const cfg = V3_CONFIG.effects.touchdown
    for (let i = 0; i < cfg.particleCount; i++) {
      const particle = this.add.arc(
        carrier.container.x + Phaser.Math.Between(-60, 60),
        carrier.container.y + Phaser.Math.Between(-60, 60),
        Phaser.Math.Between(3, 10),
        0, 360, false,
        COLORS.darkSideGlow
      ).setDepth(20)
      
      this.tweens.add({
        targets: particle,
        y: particle.y - 150,
        alpha: 0,
        scale: 0.5,
        duration: 1200,
        ease: 'Power2',
        onComplete: () => particle.destroy(),
      })
    }
    
    // Camera flash 
    this.cameraController.flash(200, 105, 190, 40) // Green flash
  }
  
  // ============================================================================
  // POST-PLAY HANDLING
  // ============================================================================
  
  private handlePostPlay(resolution: PlayResolution): void {
    switch (resolution) {
      case 'touchdown':
        // Reset to own 25 after TD
        this.time.delayedCall(V3_CONFIG.timing.postPlay.touchdownCelebration, () => {
          this.resetDrive()
          this.stateMachine.resetToPreSnap()
        })
        break
        
      case 'tackle':
      case 'outOfBounds':
        this.advanceDown()
        break
        
      case 'incomplete':
        this.advanceDown(false)
        break
        
      case 'sack':
        this.advanceDown(true, -8) // Lose 8 yards
        break
        
      case 'interception':
        // Turnover
        this.events.emit('turnover')
        this.time.delayedCall(1500, () => {
          this.resetDrive()
          this.stateMachine.resetToPreSnap()
        })
        break
    }
  }
  
  private advanceDown(gainYards: boolean = true, yardsOverride?: number): void {
    // Get yards from state machine (pre-calculated from catch resolution)
    let yardsGained = yardsOverride ?? 0
    if (gainYards && yardsOverride === undefined) {
      yardsGained = this.stateMachine.getYardsGained()
    }
    
    // Update LOS (move closer to opponent end zone = lower Y)
    this.lineOfScrimmage -= yardsGained * V3_CONFIG.field.yardLength
    
    // Clamp LOS to valid field range
    const FIELD = V3_CONFIG.field
    this.lineOfScrimmage = Math.max(FIELD.endZoneHeight + 10, this.lineOfScrimmage)
    
    // Check first down
    if (yardsGained >= this.yardsToGo) {
      this.down = 1
      this.yardsToGo = 10
      this.firstDownLine = this.lineOfScrimmage - 100
      this.addDarkSideEnergy(V3_CONFIG.darkSideEnergy.gains.firstDown)
      this.events.emit('firstDown', { yardsGained })
    } else {
      this.down++
      this.yardsToGo = Math.max(1, this.yardsToGo - yardsGained)
    }
    
    // Check turnover on downs
    if (this.down > 4) {
      this.events.emit('turnover')
      this.time.delayedCall(1500, () => {
        this.resetDrive()
        this.stateMachine.resetToPreSnap()
      })
      return
    }
    
    // Reset for next play
    this.time.delayedCall(V3_CONFIG.timing.postPlay.fieldResetDuration, () => {
      this.stateMachine.resetToPreSnap()
    })
    
    this.emitState()
  }
  
  private resetDrive(): void {
    const FIELD = V3_CONFIG.field
    // Reset to OUR OWN 20-yard line (start of new drive)
    // Own goal line at Y=1100, minus 20 yards (200px) = Y=900
    this.lineOfScrimmage = FIELD.height - FIELD.endZoneHeight - 200 // Y=900
    this.firstDownLine = this.lineOfScrimmage - 100
    this.down = 1
    this.yardsToGo = 10
    
    // Decay Dark Side energy
    this.addDarkSideEnergy(-V3_CONFIG.darkSideEnergy.decay.perPlay)
  }
  
  private resetFieldForNextPlay(): void {
    // Destroy receivers and defenders
    this.receivers.forEach(r => r.container.destroy())
    this.receivers = []
    this.defenders.forEach(d => d.container.destroy())
    this.defenders = []
    
    // Reset QB position
    if (this.qb) {
      this.qb.container.setPosition(
        V3_CONFIG.field.width / 2,
        this.lineOfScrimmage + V3_CONFIG.field.losToQb
      )
      this.qb.container.setAngle(0)
    }
    
    // Reset O-line (scaled to fit field)
    const PLAYER_SCALE = 0.55
    this.linemen.forEach((lineman, i) => {
      const offsets = [-70 * PLAYER_SCALE, -35 * PLAYER_SCALE, 0, 35 * PLAYER_SCALE, 70 * PLAYER_SCALE]
      lineman.container.setPosition(
        V3_CONFIG.field.width / 2 + offsets[i],
        this.lineOfScrimmage + 5
      )
    })
    
    // Reset ball carrier index
    this.ballCarrierIndex = -1
    
    // Update field markings to new positions
    this.updateFieldMarkings()
    
    // Update camera
    this.cameraController.resetMode(this.lineOfScrimmage)
  }
  
  // ============================================================================
  // INPUT HANDLING
  // ============================================================================
  
  private setupInput(): void {
    // TAP TO THROW - The core gameplay mechanic
    // Tap an open receiver during READ phase to throw
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.stateMachine.getCurrentState() !== 'READ') return
      
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y)
      
      // Find tapped receiver - allow throwing to any receiver, open or not
      // Throw quality determines if it's catchable
      for (let i = 0; i < this.receivers.length; i++) {
        const receiver = this.receivers[i]
        
        const dist = Phaser.Math.Distance.Between(
          worldPoint.x, worldPoint.y,
          receiver.container.x, receiver.container.y
        )
        
        // Larger tap target for better mobile UX
        if (dist < 70) {
          this.stateMachine.throwToReceiver(i)
          return
        }
      }
    })
    
    // Note: YAC swipe input removed - catches now auto-resolve
  }
  
  // ============================================================================
  // PUBLIC API
  // ============================================================================
  
  public selectPlay(playIndex: number): void {
    if (this.stateMachine.getCurrentState() !== 'PRE_SNAP') return
    
    this.selectedPlayIndex = playIndex
    
    // Create receivers and defenders for this play
    this.createReceivers(playIndex)
    this.createDefenders(playIndex)
    
    // Start the play
    this.stateMachine.startPlay()
  }
  
  public getState(): {
    phase: PlayState | null
    down: number
    yardsToGo: number
    score: { home: number, away: number }
    lineOfScrimmage: number
    darkSideEnergy: number
  } {
    return {
      phase: this.stateMachine.getCurrentState(),
      down: this.down,
      yardsToGo: this.yardsToGo,
      score: this.score,
      lineOfScrimmage: this.lineOfScrimmage,
      darkSideEnergy: this.darkSideEnergy,
    }
  }
  
  // ============================================================================
  // UTILITIES
  // ============================================================================
  
  private emitState(): void {
    this.events.emit('gameStateUpdate', this.getState())
  }
  
  private playSound(type: string): void {
    try {
      // Placeholder - integrate with AudioManager
      switch (type) {
        case 'snap':
          // AudioManager.playSnap()
          break
        case 'throw':
          // AudioManager.playThrow()
          break
        case 'catch':
          // AudioManager.playCatch()
          break
        case 'juke':
          // AudioManager.playJuke()
          break
        case 'tackle':
          // AudioManager.playTackle()
          break
        case 'touchdown':
          AudioManager.playTouchdown()
          break
        case 'sack':
          // AudioManager.playSack()
          break
      }
    } catch (e) {
      // Ignore audio errors
    }
  }
}
