/**
 * V3 Offense Scene - COMPLETE PREMIUM REBUILD
 * 
 * NFL-QUALITY MOBILE QB GAME:
 * - Photorealistic stadium atmosphere background
 * - Clean programmatic field with proper markings
 * - Full offensive line blocking animation
 * - Premium player sprites with glow effects
 * - Smooth dynamic camera following action
 * - Polished YAC with swipe controls
 */

import Phaser from 'phaser'
import { AudioManager } from '../../../game/systems/AudioManager'
import { getOpponentColors } from '../data/stadiumBackgrounds'

// ============================================================================
// GAME CONSTANTS
// ============================================================================

const FIELD = {
  WIDTH: 400,
  HEIGHT: 1200, // Full field for scrolling (end zone to end zone)
  PLAYABLE_WIDTH: 370,
  MARGIN: 15,
  END_ZONE_HEIGHT: 100,
  YARD: 10, // 10 pixels per yard
}

// Initial LOS - near our goal line (0 yard line is at bottom)
// Y = 0 is opponent end zone (TOP)
// Y = FIELD.HEIGHT is our end zone (BOTTOM)
const INITIAL_LOS_Y = FIELD.HEIGHT - FIELD.END_ZONE_HEIGHT - 250 // 25 yards from our end zone

const TIMING = {
  COUNTDOWN_MS: 1000,
  ROUTE_DURATION_MS: 4000,
  POCKET_TIME_MS: 5000,
  THROW_SPEED: 14,
  YAC_SPEED: 5,
  DEFENDER_SPEED: 2.8,
  DEFENDER_YAC_SPEED: 4.5,
}

const COLORS = {
  // Grass
  grass1: 0x2E8B2E,
  grass2: 0x348C34,
  grass3: 0x3A9E3A,
  
  // Dark Side team
  darkSide: 0x111111,
  darkSideGlow: 0x69BE28,
  
  // Field markings
  white: 0xFFFFFF,
  yellow: 0xFFD700,
  blue: 0x0066CC,
  
  // Football
  football: 0x7C4A03,
}

// ============================================================================
// TYPES
// ============================================================================

type Phase = 'preSnap' | 'countdown' | 'inPocket' | 'throwing' | 'yac' | 'tackled' | 'touchdown' | 'playOver'

interface Player {
  container: Phaser.GameObjects.Container
  helmet: Phaser.GameObjects.Arc
  glow?: Phaser.GameObjects.Arc
  x: number
  y: number
  jersey: number
  name: string
}

interface Receiver extends Player {
  startX: number
  startY: number
  targetX: number
  targetY: number
  routeProgress: number
  isOpen: boolean
  hasBall: boolean
  openWindow: { start: number; end: number }
}

interface Defender extends Player {
  speed: number
  targetReceiver?: Receiver
}

interface Lineman extends Player {
  isBlocking: boolean
}

interface PlayRoute {
  startOffsetX: number
  startOffsetY: number
  endOffsetX: number
  endOffsetY: number
  openStart: number
  openEnd: number
}

interface PlayDef {
  name: string
  routes: PlayRoute[]
}

// ============================================================================
// PLAY DEFINITIONS - Routes relative to LOS
// ============================================================================

const PLAYS: PlayDef[] = [
  {
    name: 'Slant Flood',
    routes: [
      { startOffsetX: -140, startOffsetY: -15, endOffsetX: -60, endOffsetY: -300, openStart: 0.25, openEnd: 0.65 },
      { startOffsetX: 0, startOffsetY: -10, endOffsetX: -100, endOffsetY: -180, openStart: 0.35, openEnd: 0.75 },
      { startOffsetX: 140, startOffsetY: -15, endOffsetX: 140, endOffsetY: -350, openStart: 0.45, openEnd: 0.9 },
    ],
  },
  {
    name: 'Curl Flat',
    routes: [
      { startOffsetX: -130, startOffsetY: -12, endOffsetX: -100, endOffsetY: -200, openStart: 0.4, openEnd: 0.85 },
      { startOffsetX: 60, startOffsetY: 30, endOffsetX: -120, endOffsetY: -50, openStart: 0.2, openEnd: 0.5 },
      { startOffsetX: 130, startOffsetY: -12, endOffsetX: 50, endOffsetY: -280, openStart: 0.45, openEnd: 0.85 },
    ],
  },
  {
    name: 'Four Verts',
    routes: [
      { startOffsetX: -150, startOffsetY: -15, endOffsetX: -140, endOffsetY: -450, openStart: 0.35, openEnd: 1.0 },
      { startOffsetX: -50, startOffsetY: -10, endOffsetX: -60, endOffsetY: -420, openStart: 0.4, openEnd: 0.95 },
      { startOffsetX: 50, startOffsetY: -10, endOffsetX: 60, endOffsetY: -420, openStart: 0.4, openEnd: 0.95 },
      { startOffsetX: 150, startOffsetY: -15, endOffsetX: 140, endOffsetY: -450, openStart: 0.35, openEnd: 1.0 },
    ],
  },
]

// ============================================================================
// SCENE
// ============================================================================

export class OffenseScene extends Phaser.Scene {
  // State
  private phase: Phase = 'preSnap'
  private lineOfScrimmage: number = INITIAL_LOS_Y
  private firstDownLine: number = INITIAL_LOS_Y - 100 // 10 yards upfield
  private down: number = 1
  private yardsToGo: number = 10
  private score = { home: 0, away: 0 }
  private selectedPlayIndex: number = 0
  
  // Timing
  private phaseStartTime: number = 0
  private countdownStep: number = 3
  
  // Game objects
  private qb?: Player
  private receivers: Receiver[] = []
  private defenders: Defender[] = []
  private linemen: Lineman[] = []
  private ball?: Phaser.GameObjects.Arc
  private ballShadow?: Phaser.GameObjects.Ellipse
  private ballTarget?: Receiver
  
  // Field graphics
  private fieldBg!: Phaser.GameObjects.Graphics
  private fieldLines!: Phaser.GameObjects.Graphics
  private firstDownMarker?: Phaser.GameObjects.Rectangle
  private losMarker?: Phaser.GameObjects.Rectangle
  private stadiumAtmosphere?: Phaser.GameObjects.Image
  
  // Opponent colors
  private oppColors = { helmet: 0xAA0000, accent: 0xFF4444 }
  
  // Camera
  private cameraViewHeight = 700
  
  constructor() {
    super({ key: 'OffenseScene' })
  }
  
  init(data: { weekId?: number } = {}) {
    const weekId = data.weekId || 1
    const colors = getOpponentColors(weekId)
    this.oppColors = { helmet: colors.primary, accent: colors.accent }
  }
  
  preload() {
    // Load stadium atmosphere
    this.load.image('stadium-atmosphere', '/stadiums/sf-49ers-atmosphere.jpg')
  }
  
  create() {
    // Audio
    try {
      AudioManager.startCrowdAmbience()
    } catch (e) { /* ignore */ }
    
    // Setup camera
    this.cameras.main.setBounds(0, 0, FIELD.WIDTH, FIELD.HEIGHT)
    
    // Create field layers
    this.createStadiumAtmosphere()
    this.createField()
    this.createFieldMarkings()
    
    // Create QB
    this.createQB()
    
    // Create offensive line
    this.createOffensiveLine()
    
    // Position camera at LOS
    this.resetCameraToLOS()
    
    // Setup input
    this.input.on('pointerdown', this.handleTap, this)
    
    // Setup YAC swipe
    this.input.on('pointermove', this.handleSwipe, this)
    
    // Emit initial state
    this.emitState()
  }
  
  update(time: number, delta: number) {
    switch (this.phase) {
      case 'countdown':
        this.updateCountdown(time)
        break
      case 'inPocket':
        this.updateInPocket(time, delta)
        break
      case 'throwing':
        this.updateThrowing(delta)
        break
      case 'yac':
        this.updateYAC(delta)
        break
    }
    
    // Camera always follows action
    this.updateCamera()
  }
  
  // ============================================================================
  // FIELD CREATION - Premium Quality
  // ============================================================================
  
  private createStadiumAtmosphere() {
    // Dark gradient behind everything
    const bg = this.add.graphics()
    bg.fillGradientStyle(0x0a1a0d, 0x0a1a0d, 0x1a3d1a, 0x1a3d1a, 1)
    bg.fillRect(0, 0, FIELD.WIDTH, FIELD.HEIGHT)
    bg.setDepth(0)
    
    // Stadium atmosphere image (if loaded)
    if (this.textures.exists('stadium-atmosphere')) {
      this.stadiumAtmosphere = this.add.image(FIELD.WIDTH / 2, FIELD.HEIGHT / 2, 'stadium-atmosphere')
      this.stadiumAtmosphere.setDisplaySize(FIELD.WIDTH, FIELD.HEIGHT)
      this.stadiumAtmosphere.setAlpha(0.25)
      this.stadiumAtmosphere.setDepth(1)
    }
  }
  
  private createField() {
    this.fieldBg = this.add.graphics()
    this.fieldBg.setDepth(2)
    
    const g = this.fieldBg
    const centerX = FIELD.WIDTH / 2
    
    // Grass base with mowing stripes
    for (let y = 0; y < FIELD.HEIGHT; y += 30) {
      const stripeIndex = Math.floor(y / 30) % 2
      const baseColor = stripeIndex === 0 ? COLORS.grass1 : COLORS.grass2
      g.fillStyle(baseColor, 1)
      g.fillRect(FIELD.MARGIN, y, FIELD.PLAYABLE_WIDTH, 30)
    }
    
    // Opponent end zone (TOP - y = 0 to END_ZONE_HEIGHT)
    const ezGradient = this.add.graphics().setDepth(2)
    ezGradient.fillStyle(this.oppColors.helmet, 1)
    ezGradient.fillRect(FIELD.MARGIN, 0, FIELD.PLAYABLE_WIDTH, FIELD.END_ZONE_HEIGHT)
    
    // Add end zone pattern
    ezGradient.lineStyle(2, this.oppColors.accent, 0.3)
    for (let i = 0; i < 10; i++) {
      const x = FIELD.MARGIN + (i * FIELD.PLAYABLE_WIDTH / 10)
      ezGradient.moveTo(x, 0)
      ezGradient.lineTo(x + 20, FIELD.END_ZONE_HEIGHT)
    }
    ezGradient.strokePath()
    
    // "END ZONE" text
    const ezText = this.add.text(centerX, FIELD.END_ZONE_HEIGHT / 2, 'END ZONE', {
      fontSize: '28px',
      fontFamily: 'Arial Black',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setAlpha(0.6).setDepth(3)
    
    // Our end zone (BOTTOM) - but we shouldn't need it in normal play
  }
  
  private createFieldMarkings() {
    this.fieldLines = this.add.graphics()
    this.fieldLines.setDepth(4)
    
    const g = this.fieldLines
    const leftX = FIELD.MARGIN
    const rightX = FIELD.WIDTH - FIELD.MARGIN
    const centerX = FIELD.WIDTH / 2
    
    // Goal line (thick white)
    g.lineStyle(6, COLORS.white, 1)
    g.moveTo(leftX, FIELD.END_ZONE_HEIGHT)
    g.lineTo(rightX, FIELD.END_ZONE_HEIGHT)
    g.strokePath()
    
    // Yard lines (every 10 yards = 100px)
    g.lineStyle(2, COLORS.white, 0.5)
    for (let yard = 1; yard <= 10; yard++) {
      const y = FIELD.END_ZONE_HEIGHT + (yard * 100)
      if (y < FIELD.HEIGHT - FIELD.END_ZONE_HEIGHT) {
        g.moveTo(leftX, y)
        g.lineTo(rightX, y)
      }
    }
    g.strokePath()
    
    // Hash marks (smaller marks between yard lines)
    g.lineStyle(1, COLORS.white, 0.3)
    for (let i = 0; i < 100; i++) {
      const y = FIELD.END_ZONE_HEIGHT + (i * 10)
      if (y < FIELD.HEIGHT - FIELD.END_ZONE_HEIGHT && i % 10 !== 0) {
        // Left hash
        g.moveTo(centerX - 25, y)
        g.lineTo(centerX - 15, y)
        // Right hash
        g.moveTo(centerX + 15, y)
        g.lineTo(centerX + 25, y)
      }
    }
    g.strokePath()
    
    // Yard numbers (every 10 yards)
    const yardNumbers = [10, 20, 30, 40, 50, 40, 30, 20, 10]
    yardNumbers.forEach((num, i) => {
      const y = FIELD.END_ZONE_HEIGHT + ((i + 1) * 100)
      if (y < FIELD.HEIGHT - FIELD.END_ZONE_HEIGHT - 50) {
        // Left side
        this.add.text(leftX + 15, y, `${num}`, {
          fontSize: '20px',
          fontFamily: 'Arial Black',
          color: '#FFFFFF',
        }).setOrigin(0.5).setAlpha(0.35).setAngle(-90).setDepth(4)
        
        // Right side
        this.add.text(rightX - 15, y, `${num}`, {
          fontSize: '20px',
          fontFamily: 'Arial Black',
          color: '#FFFFFF',
        }).setOrigin(0.5).setAlpha(0.35).setAngle(90).setDepth(4)
      }
    })
    
    // Sideline strips
    g.fillStyle(COLORS.white, 0.8)
    g.fillRect(leftX - 3, FIELD.END_ZONE_HEIGHT, 3, FIELD.HEIGHT - FIELD.END_ZONE_HEIGHT * 2)
    g.fillRect(rightX, FIELD.END_ZONE_HEIGHT, 3, FIELD.HEIGHT - FIELD.END_ZONE_HEIGHT * 2)
    
    // First down line (yellow, prominent)
    this.firstDownMarker = this.add.rectangle(
      centerX, this.firstDownLine,
      FIELD.PLAYABLE_WIDTH, 4,
      COLORS.yellow
    ).setDepth(5).setAlpha(0.9)
    
    // Add glow to first down line
    this.add.rectangle(
      centerX, this.firstDownLine,
      FIELD.PLAYABLE_WIDTH, 12,
      COLORS.yellow
    ).setDepth(4).setAlpha(0.2)
    
    // Line of scrimmage (blue)
    this.losMarker = this.add.rectangle(
      centerX, this.lineOfScrimmage,
      FIELD.PLAYABLE_WIDTH, 3,
      COLORS.blue
    ).setDepth(5).setAlpha(0.8)
  }
  
  // ============================================================================
  // PLAYER CREATION - Premium Sprites
  // ============================================================================
  
  private createPlayer(
    x: number, 
    y: number, 
    jersey: number, 
    name: string,
    teamColor: number,
    glowColor?: number,
    size: number = 16
  ): Player {
    const container = this.add.container(x, y)
    
    // Shadow
    const shadow = this.add.ellipse(0, 6, size * 1.4, size * 0.6, 0x000000, 0.4)
    
    // Glow (if specified)
    let glow: Phaser.GameObjects.Arc | undefined
    if (glowColor) {
      glow = this.add.arc(0, 0, size + 8, 0, 360, false, glowColor, 0.3)
      container.add(glow)
      
      // Pulse animation
      this.tweens.add({
        targets: glow,
        scale: 1.2,
        alpha: 0.15,
        duration: 800,
        yoyo: true,
        repeat: -1,
      })
    }
    
    // Helmet
    const helmet = this.add.arc(0, 0, size, 0, 360, false, teamColor)
    helmet.setStrokeStyle(2, glowColor || 0xFFFFFF)
    
    // Jersey number
    const num = this.add.text(0, 0, `${jersey}`, {
      fontSize: `${Math.floor(size * 0.7)}px`,
      fontFamily: 'Arial Black',
      color: '#FFFFFF',
    }).setOrigin(0.5)
    
    container.add([shadow, helmet, num])
    container.setDepth(10)
    
    return { container, helmet, glow, x, y, jersey, name }
  }
  
  private createQB() {
    const centerX = FIELD.WIDTH / 2
    const qbY = this.lineOfScrimmage + 50
    
    this.qb = this.createPlayer(
      centerX, qbY,
      14, 'DARNOLD',
      COLORS.darkSide,
      COLORS.darkSideGlow,
      18
    )
    
    // Extra QB glow effect
    const qbRing = this.add.arc(0, 0, 28, 0, 360, false, COLORS.darkSideGlow, 0)
    qbRing.setStrokeStyle(2, COLORS.darkSideGlow, 0.5)
    this.qb.container.addAt(qbRing, 0)
    
    this.tweens.add({
      targets: qbRing,
      scale: 1.4,
      alpha: 0,
      strokeAlpha: 0,
      duration: 1500,
      repeat: -1,
    })
  }
  
  private createOffensiveLine() {
    this.linemen.forEach(l => l.container.destroy())
    this.linemen = []
    
    const centerX = FIELD.WIDTH / 2
    const lineY = this.lineOfScrimmage + 5
    
    // 5 O-linemen
    const positions = [-70, -35, 0, 35, 70]
    const jerseys = [72, 63, 52, 66, 75]
    const names = ['LT', 'LG', 'C', 'RG', 'RT']
    
    positions.forEach((offsetX, i) => {
      const player = this.createPlayer(
        centerX + offsetX, lineY,
        jerseys[i], names[i],
        COLORS.darkSide,
        COLORS.darkSideGlow,
        14
      ) as Lineman
      player.isBlocking = false
      this.linemen.push(player)
    })
  }
  
  private createReceivers(playIndex: number) {
    this.receivers.forEach(r => r.container.destroy())
    this.receivers = []
    
    const play = PLAYS[playIndex]
    const centerX = FIELD.WIDTH / 2
    
    const receiverData = [
      { jersey: 11, name: 'JSN' },
      { jersey: 10, name: 'KUPP' },
      { jersey: 16, name: 'LOCKETT' },
      { jersey: 88, name: 'BARNER' },
    ]
    
    play.routes.forEach((route, i) => {
      const data = receiverData[i] || { jersey: 80 + i, name: `WR${i + 1}` }
      const startX = centerX + route.startOffsetX
      const startY = this.lineOfScrimmage + route.startOffsetY
      const targetX = centerX + route.endOffsetX
      const targetY = this.lineOfScrimmage + route.endOffsetY
      
      const player = this.createPlayer(
        startX, startY,
        data.jersey, data.name,
        COLORS.darkSide,
        COLORS.darkSideGlow,
        14
      )
      
      player.helmet.setInteractive({ useHandCursor: true })
      
      const receiver: Receiver = {
        ...player,
        startX,
        startY,
        targetX,
        targetY,
        routeProgress: 0,
        isOpen: false,
        hasBall: false,
        openWindow: { start: route.openStart, end: route.openEnd },
      }
      
      this.receivers.push(receiver)
    })
  }
  
  private createDefenders() {
    this.defenders.forEach(d => d.container.destroy())
    this.defenders = []
    
    const centerX = FIELD.WIDTH / 2
    
    // Defensive positions relative to LOS
    const positions = [
      { x: -100, y: -120 }, // CB left
      { x: -40, y: -160 },  // LB left
      { x: 0, y: -140 },    // MLB
      { x: 40, y: -160 },   // LB right
      { x: 100, y: -120 },  // CB right
      { x: 0, y: -250 },    // FS
      { x: -60, y: -280 },  // SS left
    ]
    
    const jerseys = [24, 55, 50, 56, 22, 29, 33]
    
    positions.forEach((pos, i) => {
      const player = this.createPlayer(
        centerX + pos.x, 
        this.lineOfScrimmage + pos.y,
        jerseys[i], `DEF${i}`,
        this.oppColors.helmet,
        undefined,
        12
      )
      
      player.helmet.setFillStyle(this.oppColors.helmet)
      player.helmet.setStrokeStyle(2, this.oppColors.accent)
      
      const defender: Defender = {
        ...player,
        speed: TIMING.DEFENDER_SPEED + (Math.random() * 0.8),
      }
      
      this.defenders.push(defender)
    })
  }
  
  // ============================================================================
  // GAME FLOW
  // ============================================================================
  
  public selectPlay(index: number) {
    if (this.phase !== 'preSnap') return
    
    this.selectedPlayIndex = index
    
    // Create players
    this.createReceivers(index)
    this.createDefenders()
    
    // Start countdown
    this.phase = 'countdown'
    this.phaseStartTime = this.time.now
    this.countdownStep = 3
    
    this.emitState()
  }
  
  private updateCountdown(time: number) {
    const elapsed = time - this.phaseStartTime
    const step = 3 - Math.floor(elapsed / 350)
    
    if (step !== this.countdownStep && step >= 0) {
      this.countdownStep = step
      this.events.emit('countdown', step)
    }
    
    if (elapsed >= TIMING.COUNTDOWN_MS) {
      this.phase = 'inPocket'
      this.phaseStartTime = time
      this.events.emit('snap')
      
      // Animate O-line blocking forward
      this.linemen.forEach(l => {
        this.tweens.add({
          targets: l.container,
          y: l.y - 15,
          duration: 300,
          ease: 'Power2',
        })
      })
    }
  }
  
  private updateInPocket(time: number, delta: number) {
    const elapsed = time - this.phaseStartTime
    const progress = Math.min(1, elapsed / TIMING.ROUTE_DURATION_MS)
    
    // Move receivers along routes
    this.receivers.forEach(rec => {
      rec.routeProgress = progress
      rec.x = Phaser.Math.Linear(rec.startX, rec.targetX, progress)
      rec.y = Phaser.Math.Linear(rec.startY, rec.targetY, progress)
      rec.container.setPosition(rec.x, rec.y)
      
      // Check if open based on window
      const wasOpen = rec.isOpen
      rec.isOpen = progress >= rec.openWindow.start && progress <= rec.openWindow.end
      
      // Check defender proximity
      let closestDefender = 999
      this.defenders.forEach(def => {
        const dist = Phaser.Math.Distance.Between(rec.x, rec.y, def.x, def.y)
        if (dist < closestDefender) closestDefender = dist
      })
      
      // Covered if defender within 40px
      if (closestDefender < 40) rec.isOpen = false
      
      // Visual feedback
      if (rec.isOpen && !wasOpen) {
        rec.helmet.setStrokeStyle(3, COLORS.yellow)
        if (rec.glow) rec.glow.setFillStyle(COLORS.yellow, 0.4)
        
        this.tweens.add({
          targets: rec.container,
          scale: 1.15,
          duration: 150,
          yoyo: true,
        })
      } else if (!rec.isOpen && wasOpen) {
        rec.helmet.setStrokeStyle(2, COLORS.darkSideGlow)
        if (rec.glow) rec.glow.setFillStyle(COLORS.darkSideGlow, 0.3)
      }
    })
    
    // Move defenders - coverage
    this.defenders.forEach((def, i) => {
      // Find assigned receiver or zone
      const assignedRec = this.receivers[i % this.receivers.length]
      if (assignedRec) {
        const angle = Phaser.Math.Angle.Between(def.x, def.y, assignedRec.x, assignedRec.y)
        def.x += Math.cos(angle) * def.speed
        def.y += Math.sin(angle) * def.speed
        def.container.setPosition(def.x, def.y)
      }
    })
    
    // Pressure timer (sack)
    if (elapsed >= TIMING.POCKET_TIME_MS) {
      this.endPlay('sack')
    }
    
    this.emitState()
  }
  
  private handleTap(pointer: Phaser.Input.Pointer) {
    if (this.phase !== 'inPocket') return
    
    // Convert to world coords
    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y)
    
    // Find tapped receiver
    for (const rec of this.receivers) {
      if (!rec.isOpen) continue
      
      const dist = Phaser.Math.Distance.Between(worldPoint.x, worldPoint.y, rec.x, rec.y)
      if (dist < 50) {
        this.throwBall(rec)
        return
      }
    }
  }
  
  private handleSwipe(pointer: Phaser.Input.Pointer) {
    if (this.phase !== 'yac' || !pointer.isDown) return
    
    const carrier = this.receivers.find(r => r.hasBall)
    if (!carrier) return
    
    // Follow pointer X position
    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y)
    const targetX = Phaser.Math.Clamp(worldPoint.x, FIELD.MARGIN + 20, FIELD.WIDTH - FIELD.MARGIN - 20)
    
    // Smooth movement toward finger
    const diff = targetX - carrier.x
    if (Math.abs(diff) > 5) {
      carrier.x += diff * 0.15
      carrier.container.setPosition(carrier.x, carrier.y)
      
      // Lean animation
      carrier.container.setAngle(diff * 0.1)
    }
  }
  
  private throwBall(target: Receiver) {
    this.phase = 'throwing'
    this.ballTarget = target
    target.hasBall = true
    
    // Create ball at QB position
    if (this.qb) {
      // Ball shadow
      this.ballShadow = this.add.ellipse(this.qb.x, this.qb.y + 10, 12, 5, 0x000000, 0.4)
      this.ballShadow.setDepth(14)
      
      // Ball
      this.ball = this.add.arc(this.qb.x, this.qb.y, 7, 0, 360, false, COLORS.football)
      this.ball.setStrokeStyle(2, 0xFFFFFF)
      this.ball.setDepth(15)
    }
    
    this.events.emit('throw')
  }
  
  private updateThrowing(delta: number) {
    if (!this.ball || !this.ballTarget) return
    
    // Track target (receiver may still be moving)
    const targetX = this.ballTarget.x
    const targetY = this.ballTarget.y
    
    // Move ball toward target
    const angle = Phaser.Math.Angle.Between(
      this.ball.x, this.ball.y,
      targetX, targetY
    )
    
    this.ball.x += Math.cos(angle) * TIMING.THROW_SPEED
    this.ball.y += Math.sin(angle) * TIMING.THROW_SPEED
    
    // Update shadow (lags slightly for depth effect)
    if (this.ballShadow) {
      this.ballShadow.x = this.ball.x
      this.ballShadow.y = this.ball.y + 15
      
      // Ball "arc" - scale shadow as ball is in air
      const dist = Phaser.Math.Distance.Between(this.ball.x, this.ball.y, targetX, targetY)
      const maxDist = 300
      const airProgress = 1 - Math.min(dist / maxDist, 1)
      this.ballShadow.setScale(0.5 + airProgress * 0.5)
    }
    
    // Check catch
    const dist = Phaser.Math.Distance.Between(this.ball.x, this.ball.y, targetX, targetY)
    
    if (dist < 25) {
      // CATCH!
      this.ball.destroy()
      this.ball = undefined
      this.ballShadow?.destroy()
      this.ballShadow = undefined
      
      this.phase = 'yac'
      this.phaseStartTime = this.time.now
      
      // Highlight ball carrier
      this.ballTarget.helmet.setFillStyle(COLORS.darkSideGlow)
      if (this.ballTarget.glow) {
        this.ballTarget.glow.setFillStyle(COLORS.darkSideGlow, 0.6)
        this.tweens.add({
          targets: this.ballTarget.glow,
          scale: 2,
          alpha: 0.3,
          duration: 300,
        })
      }
      
      this.events.emit('catch', { receiver: this.ballTarget.name })
    }
    
    this.emitState()
  }
  
  private updateYAC(delta: number) {
    const carrier = this.receivers.find(r => r.hasBall)
    if (!carrier) return
    
    // Run toward end zone (Y decreases)
    carrier.y -= TIMING.YAC_SPEED
    carrier.container.setPosition(carrier.x, carrier.y)
    
    // Animate carrier
    carrier.container.setAngle(Math.sin(this.time.now / 100) * 3)
    
    // Defenders pursue
    this.defenders.forEach(def => {
      const angle = Phaser.Math.Angle.Between(def.x, def.y, carrier.x, carrier.y)
      def.x += Math.cos(angle) * TIMING.DEFENDER_YAC_SPEED
      def.y += Math.sin(angle) * TIMING.DEFENDER_YAC_SPEED
      def.container.setPosition(def.x, def.y)
      
      // Check tackle
      const dist = Phaser.Math.Distance.Between(def.x, def.y, carrier.x, carrier.y)
      if (dist < 20) {
        this.endPlay('tackle', carrier.y)
        return
      }
    })
    
    // Check touchdown
    if (carrier.y <= FIELD.END_ZONE_HEIGHT) {
      this.endPlay('touchdown')
    }
    
    this.emitState()
  }
  
  private endPlay(result: 'touchdown' | 'tackle' | 'sack' | 'incomplete', yardLine?: number) {
    this.phase = 'playOver'
    
    if (result === 'touchdown') {
      this.score.home += 7
      this.events.emit('touchdown')
      
      // Celebration effects
      const carrier = this.receivers.find(r => r.hasBall)
      if (carrier) {
        // Flash the field
        this.cameras.main.flash(300, 105, 190, 40)
        
        // Particle burst
        for (let i = 0; i < 20; i++) {
          const particle = this.add.arc(
            carrier.x + Phaser.Math.Between(-50, 50),
            carrier.y + Phaser.Math.Between(-50, 50),
            Phaser.Math.Between(3, 8),
            0, 360, false,
            COLORS.darkSideGlow
          ).setDepth(20)
          
          this.tweens.add({
            targets: particle,
            y: particle.y - 100,
            alpha: 0,
            duration: 1000,
            onComplete: () => particle.destroy(),
          })
        }
      }
      
      // Reset after delay
      this.time.delayedCall(2500, () => this.resetForNewDrive(FIELD.HEIGHT - FIELD.END_ZONE_HEIGHT - 250))
      
    } else if (result === 'tackle') {
      const yardsGained = this.lineOfScrimmage - (yardLine || this.lineOfScrimmage)
      this.advancePlay(yardsGained)
      
    } else if (result === 'sack') {
      this.events.emit('sack')
      this.advancePlay(-80) // Lose 8 yards
      
    } else {
      this.events.emit('incomplete')
      this.advancePlay(0)
    }
    
    this.emitState()
  }
  
  private advancePlay(yardsGained: number) {
    // Move LOS (positive yardsGained = upfield = lower Y)
    this.lineOfScrimmage -= yardsGained
    
    // Check first down
    if (this.lineOfScrimmage <= this.firstDownLine) {
      this.down = 1
      this.yardsToGo = 10
      this.firstDownLine = this.lineOfScrimmage - 100
      this.events.emit('firstDown')
    } else {
      this.down++
      this.yardsToGo = Math.max(1, Math.round((this.lineOfScrimmage - this.firstDownLine) / FIELD.YARD))
    }
    
    // Check turnover on downs
    if (this.down > 4) {
      this.events.emit('turnover')
      this.time.delayedCall(1500, () => this.resetForNewDrive(FIELD.HEIGHT - FIELD.END_ZONE_HEIGHT - 250))
      return
    }
    
    // Reset for next play
    this.time.delayedCall(1500, () => this.resetForNextPlay())
  }
  
  private resetForNewDrive(yardLine: number) {
    this.lineOfScrimmage = yardLine
    this.firstDownLine = yardLine - 100
    this.down = 1
    this.yardsToGo = 10
    
    this.resetForNextPlay()
  }
  
  private resetForNextPlay() {
    // Clear players
    this.receivers.forEach(r => r.container.destroy())
    this.receivers = []
    this.defenders.forEach(d => d.container.destroy())
    this.defenders = []
    
    // Update markers
    if (this.firstDownMarker) this.firstDownMarker.setY(this.firstDownLine)
    if (this.losMarker) this.losMarker.setY(this.lineOfScrimmage)
    
    // Reposition QB
    if (this.qb) {
      this.qb.y = this.lineOfScrimmage + 50
      this.qb.container.setY(this.qb.y)
    }
    
    // Reposition O-line
    this.linemen.forEach((l, i) => {
      l.y = this.lineOfScrimmage + 5
      l.container.setY(l.y)
    })
    
    // Reset camera
    this.resetCameraToLOS()
    
    // Back to preSnap
    this.phase = 'preSnap'
    this.emitState()
  }
  
  // ============================================================================
  // CAMERA
  // ============================================================================
  
  private resetCameraToLOS() {
    const targetY = this.lineOfScrimmage - this.cameraViewHeight * 0.7
    this.cameras.main.setScroll(0, Math.max(0, targetY))
  }
  
  private updateCamera() {
    let targetY = this.lineOfScrimmage - this.cameraViewHeight * 0.7
    
    if (this.phase === 'inPocket' || this.phase === 'throwing') {
      // Follow receivers upfield
      let minY = this.lineOfScrimmage
      this.receivers.forEach(rec => {
        if (rec.y < minY) minY = rec.y
      })
      targetY = minY - this.cameraViewHeight * 0.4
    }
    
    if (this.phase === 'yac') {
      // Follow ball carrier closely
      const carrier = this.receivers.find(r => r.hasBall)
      if (carrier) {
        targetY = carrier.y - this.cameraViewHeight * 0.5
      }
    }
    
    // Clamp to field bounds
    targetY = Math.max(0, Math.min(targetY, FIELD.HEIGHT - this.cameraViewHeight))
    
    // Smooth camera movement
    const currentY = this.cameras.main.scrollY
    const speed = this.phase === 'yac' ? 0.12 : 0.06
    const newY = currentY + (targetY - currentY) * speed
    
    this.cameras.main.setScroll(0, newY)
  }
  
  // ============================================================================
  // STATE
  // ============================================================================
  
  private emitState() {
    this.events.emit('gameStateUpdate', {
      phase: this.phase,
      down: this.down,
      yardsToGo: this.yardsToGo,
      score: this.score,
      lineOfScrimmage: this.lineOfScrimmage,
    })
  }
  
  // ============================================================================
  // EXTERNAL CONTROLS
  // ============================================================================
  
  public performJuke(direction: 'left' | 'right') {
    if (this.phase !== 'yac') return
    
    const carrier = this.receivers.find(r => r.hasBall)
    if (!carrier) return
    
    const jukeDistance = direction === 'left' ? -60 : 60
    carrier.x = Phaser.Math.Clamp(
      carrier.x + jukeDistance, 
      FIELD.MARGIN + 20, 
      FIELD.WIDTH - FIELD.MARGIN - 20
    )
    carrier.container.setPosition(carrier.x, carrier.y)
    
    // Juke animation
    this.tweens.add({
      targets: carrier.container,
      scaleX: direction === 'left' ? 0.7 : 1.3,
      angle: direction === 'left' ? -20 : 20,
      duration: 100,
      yoyo: true,
    })
    
    // Shake camera slightly
    this.cameras.main.shake(100, 0.005)
  }
}
