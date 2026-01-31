import * as Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONTS, hexToCSS, getPositionGroupColor } from '../config/phaserConfig'
import { useGameStore } from '../../store/gameStore'
import { AudioManager } from '../systems/AudioManager'
import { FULL_ROSTER } from '../data/roster'
import { getStageByGame, CampaignStage, GAMES_PER_STAGE } from '../data/campaign'

// ============================================
// SEAHAWKS DEFENSE - PREMIUM GAME EXPERIENCE
// ============================================

// Game constants
const DEFENDER_RADIUS = 28
const RUNNER_RADIUS = 14
const POWER_UP_RADIUS = 20

// Speeds
const BASE_RUNNER_SPEED = 70
const SPEED_PER_WAVE = 10
const MAX_RUNNER_SPEED = 220
const DEFENDER_SPEED = 350
const AI_DEFENDER_SPEED = 90

// Wave settings
const BASE_SPAWN_INTERVAL = 900
const MIN_SPAWN_INTERVAL = 200
const SPAWN_REDUCTION_PER_WAVE = 50
const BASE_WAVE_DURATION = 12000
const WAVE_DURATION_INCREASE = 1500
const MAX_WAVE_DURATION = 30000
const STARTING_LIVES = 4

// Defender movement restriction - defenders stay in bottom 33% of field
// GAME_HEIGHT is 700, so 67% from top = 469px (defender can't go ABOVE this line)
const DEFENDER_MIN_Y = 469

function getWaveDuration(wave: number): number {
  return Math.min(MAX_WAVE_DURATION, BASE_WAVE_DURATION + (wave - 1) * WAVE_DURATION_INCREASE)
}

// Upgrade types
type UpgradeType = 
  | 'ADD_DEFENDER' 
  | 'SPEED_BOOST' 
  | 'TACKLE_RADIUS' 
  | 'EXTRA_LIFE'
  | 'HAZY_IPA' 
  | 'WATERMELON' 
  | 'LEMON_LIME' 
  | 'BLOOD_ORANGE'

interface Upgrade {
  type: UpgradeType
  name: string
  description: string
  color: number
  icon: string
}

const UPGRADES: Record<UpgradeType, Upgrade> = {
  ADD_DEFENDER: { type: 'ADD_DEFENDER', name: 'Teammate', description: '+1 AI Defender', color: 0x00897B, icon: '🏈' },
  SPEED_BOOST: { type: 'SPEED_BOOST', name: 'Speed', description: '+20% Movement', color: 0x69BE28, icon: '⚡' },
  TACKLE_RADIUS: { type: 'TACKLE_RADIUS', name: 'Reach', description: '+15% Tackle Range', color: 0xE53935, icon: '💪' },
  EXTRA_LIFE: { type: 'EXTRA_LIFE', name: 'Life', description: '+1 Extra Life', color: 0xff69b4, icon: '❤️' },
  HAZY_IPA: { type: 'HAZY_IPA', name: 'Hazy IPA', description: 'Slow enemies 20%', color: 0xf4a460, icon: '🍺' },
  WATERMELON: { type: 'WATERMELON', name: 'Watermelon', description: '+2 Lives', color: 0xff6b8a, icon: '🍉' },
  LEMON_LIME: { type: 'LEMON_LIME', name: 'Lemon Lime', description: '+30% Speed', color: 0xadff2f, icon: '🍋' },
  BLOOD_ORANGE: { type: 'BLOOD_ORANGE', name: 'Blood Orange', description: '+25% Tackle Range', color: 0xff4500, icon: '🍊' },
}

interface Defender {
  sprite: Phaser.GameObjects.Container
  isPlayer: boolean
  targetX: number
  targetY: number
}

type RunnerType = 'NORMAL' | 'FAST' | 'TANK' | 'ZIGZAG' | 'BOSS'

interface RunnerDef {
  type: RunnerType
  speedMult: number
  size: number
  points: number
  color: number
  icon: string
}

// Default runner colors (used in endless mode)
const DEFAULT_RUNNER_TYPES: Record<RunnerType, RunnerDef> = {
  NORMAL: { type: 'NORMAL', speedMult: 1, size: 1, points: 10, color: 0x888888, icon: '🏈' },
  FAST: { type: 'FAST', speedMult: 1.8, size: 0.8, points: 15, color: 0xFFB300, icon: '⚡' },
  TANK: { type: 'TANK', speedMult: 0.6, size: 1.4, points: 25, color: 0xE53935, icon: '🛡️' },
  ZIGZAG: { type: 'ZIGZAG', speedMult: 1.2, size: 1, points: 20, color: 0x69BE28, icon: '🌀' },
  BOSS: { type: 'BOSS', speedMult: 0.4, size: 2.2, points: 100, color: 0x800080, icon: '👑' },
}

// Will be set based on stage in campaign mode
let RUNNER_TYPES = { ...DEFAULT_RUNNER_TYPES }

interface Runner {
  sprite: Phaser.GameObjects.Container
  speed: number
  health: number
  type: RunnerType
  zigzagPhase: number
}

interface Megaphone {
  sprite: Phaser.GameObjects.Container
  speed: number
  pulseTimer: number
}

export class GameScene extends Phaser.Scene {
  private defenders: Defender[] = []
  private runners: Runner[] = []
  private megaphone: Megaphone | null = null
  
  // UI Elements
  private scoreText!: Phaser.GameObjects.Text
  private waveText!: Phaser.GameObjects.Text
  private livesContainer!: Phaser.GameObjects.Container
  private killsText!: Phaser.GameObjects.Text
  private statsText!: Phaser.GameObjects.Text
  private timerBar!: Phaser.GameObjects.Graphics
  private timerBg!: Phaser.GameObjects.Graphics
  private comboText!: Phaser.GameObjects.Text
  
  // 12th Man (Fan Meter) UI
  private fanMeterBar!: Phaser.GameObjects.Graphics
  private fanMeterBg!: Phaser.GameObjects.Graphics
  private fanMeterLabel!: Phaser.GameObjects.Text
  private fanMeterGlow!: Phaser.GameObjects.Graphics
  
  // Pause Button
  private pauseButton!: Phaser.GameObjects.Container
  private pauseOverlay!: Phaser.GameObjects.Container | null
  
  // Game state
  private isGameOver = false
  private isPaused = false
  private waveTimer = 0
  private spawnTimer = 0
  private runnersThisWave = 0
  private waveKills = 0
  private comboCount = 0
  private lastTackleTime = 0
  
  // 12th Man (Fan Meter) state
  private fanMeter = 0 // 0-100
  private fanMeterReady = false
  private fanMeterCooldown = false
  private consecutiveTackles = 0
  
  // Campaign mode state
  private isCampaignMode = false
  private currentStage: CampaignStage | null = null
  private difficultyModifier = 1
  private maxWaves = 5 // For campaign mode, each game has fixed waves
  private bossSpawned = false
  private bossCount = 0
  
  // Player stats
  private stats = {
    speedMultiplier: 1,
    tackleRadiusMultiplier: 1,
    enemySpeedMultiplier: 1,
    defenderCount: 1,
    lives: STARTING_LIVES,
  }
  
  // Input
  private pointer = { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 }
  
  // Background elements
  private fieldParticles: Phaser.GameObjects.Graphics[] = []
  private stageAtmosphere: Phaser.GameObjects.Graphics[] = []

  constructor() {
    super({ key: 'GameScene' })
  }

  create(): void {
    this.cameras.main.fadeIn(400)
    
    // Detect game mode and setup campaign if applicable
    const { gameMode, campaign } = useGameStore.getState()
    this.isCampaignMode = gameMode === 'campaign'
    
    if (this.isCampaignMode) {
      this.currentStage = getStageByGame(campaign.currentGame)
      this.difficultyModifier = 1 + (this.currentStage.difficulty * 0.1)
      this.maxWaves = 5 // Fixed waves per campaign game
      
      // Set runner colors based on stage opponent
      const opponentColors = this.currentStage.visuals.opponent
      RUNNER_TYPES = {
        NORMAL: { ...DEFAULT_RUNNER_TYPES.NORMAL, color: opponentColors.primary },
        FAST: { ...DEFAULT_RUNNER_TYPES.FAST, color: opponentColors.accent },
        TANK: { ...DEFAULT_RUNNER_TYPES.TANK, color: opponentColors.primary },
        ZIGZAG: { ...DEFAULT_RUNNER_TYPES.ZIGZAG, color: opponentColors.accent },
        BOSS: { ...DEFAULT_RUNNER_TYPES.BOSS, color: opponentColors.primary },
      }
      
      // Set crowd intensity based on stage
      AudioManager.setCrowdIntensity(this.currentStage.visuals.crowdIntensity)
    } else {
      this.currentStage = null
      this.difficultyModifier = 1
      this.maxWaves = Infinity // Endless mode
      RUNNER_TYPES = { ...DEFAULT_RUNNER_TYPES }
    }
    
    this.resetState()
    
    this.drawPremiumField()
    this.createAtmosphereEffects()
    this.createDefenders()
    this.createPremiumUI()
    this.createFanMeterUI()
    this.createPauseButton()
    this.setupInput()
    
    // Show stage info banner for campaign mode
    if (this.isCampaignMode && this.currentStage) {
      this.showCampaignBanner()
    }
    
    this.startWave()
  }
  
  private showCampaignBanner(): void {
    if (!this.currentStage) return
    
    const { campaign } = useGameStore.getState()
    const gameInStage = ((campaign.currentGame - 1) % GAMES_PER_STAGE) + 1
    
    // Stage banner at top
    const banner = this.add.container(GAME_WIDTH / 2, 100)
    
    const bg = this.add.graphics()
    bg.fillStyle(COLORS.navy, 0.9)
    bg.fillRoundedRect(-150, -40, 300, 80, 12)
    bg.lineStyle(2, COLORS.green, 0.5)
    bg.strokeRoundedRect(-150, -40, 300, 80, 12)
    banner.add(bg)
    
    const stageName = this.add.text(0, -15, this.currentStage.location.city.toUpperCase(), {
      fontSize: '22px',
      color: hexToCSS(COLORS.green),
      fontFamily: FONTS.display,
    })
    stageName.setOrigin(0.5)
    banner.add(stageName)
    
    const gameInfo = this.add.text(0, 12, `Stage ${this.currentStage.id} • Game ${gameInStage}/${GAMES_PER_STAGE}`, {
      fontSize: '12px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
    })
    gameInfo.setOrigin(0.5)
    banner.add(gameInfo)
    
    banner.setAlpha(0)
    banner.setScale(0.8)
    
    // Animate in then out
    this.tweens.add({
      targets: banner,
      alpha: 1,
      scale: 1,
      duration: 400,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: banner,
          alpha: 0,
          y: banner.y - 30,
          duration: 400,
          delay: 1500,
          onComplete: () => banner.destroy()
        })
      }
    })
  }

  private resetState(): void {
    this.defenders = []
    this.runners = []
    this.megaphone = null
    this.isGameOver = false
    this.isPaused = false
    this.waveTimer = 0
    this.spawnTimer = 0
    this.runnersThisWave = 0
    this.comboCount = 0
    this.lastTackleTime = 0
    this.pauseOverlay = null
    this.stageAtmosphere = []
    
    // 12th Man reset
    this.fanMeter = 0
    this.fanMeterReady = false
    this.fanMeterCooldown = false
    this.consecutiveTackles = 0
    
    // Adjust starting lives based on campaign stage
    let startingLives = STARTING_LIVES
    if (this.isCampaignMode && this.currentStage) {
      // Playoffs and Super Bowl are harder
      if (this.currentStage.isPlayoff || this.currentStage.isSuperBowl) {
        startingLives = 3
      }
    }
    
    this.stats = {
      speedMultiplier: 1,
      tackleRadiusMultiplier: 1,
      enemySpeedMultiplier: 1,
      defenderCount: 1,
      lives: startingLives,
    }
    
    useGameStore.getState().startGame()
  }

  private drawPremiumField(): void {
    const graphics = this.add.graphics()
    
    // Get field tint and sky gradient from stage if in campaign mode
    let baseGreen = { r: 45, g: 90, b: 39 }
    let lightGreen = { r: 58, g: 114, b: 51 }
    let skyTop = { r: 26, g: 42, b: 58 }  // Default dark navy
    let skyBottom = { r: 45, g: 74, b: 90 } // Default lighter navy
    
    if (this.isCampaignMode && this.currentStage) {
      // Field tint
      const fieldTint = this.currentStage.visuals.fieldTint
      const tintColor = Phaser.Display.Color.HexStringToColor(fieldTint)
      baseGreen = { r: tintColor.red, g: tintColor.green, b: tintColor.blue }
      lightGreen = { 
        r: Math.min(255, tintColor.red + 15), 
        g: Math.min(255, tintColor.green + 25), 
        b: Math.min(255, tintColor.blue + 15) 
      }
      
      // Sky gradient from stage visuals
      const [skyTopHex, skyBottomHex] = this.currentStage.visuals.skyGradient
      const skyTopColor = Phaser.Display.Color.HexStringToColor(skyTopHex)
      const skyBottomColor = Phaser.Display.Color.HexStringToColor(skyBottomHex)
      skyTop = { r: skyTopColor.red, g: skyTopColor.green, b: skyTopColor.blue }
      skyBottom = { r: skyBottomColor.red, g: skyBottomColor.green, b: skyBottomColor.blue }
    }
    
    // Sky gradient at the top portion (top 25% of screen)
    const skyHeight = Math.floor(GAME_HEIGHT * 0.25)
    for (let y = 0; y < skyHeight; y++) {
      const progress = y / skyHeight
      const r = Math.floor(skyTop.r + (skyBottom.r - skyTop.r) * progress)
      const g = Math.floor(skyTop.g + (skyBottom.g - skyTop.g) * progress)
      const b = Math.floor(skyTop.b + (skyBottom.b - skyTop.b) * progress)
      
      graphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1)
      graphics.fillRect(0, y, GAME_WIDTH, 1)
    }
    
    // Blend zone from sky to field (next 10%)
    const blendHeight = Math.floor(GAME_HEIGHT * 0.10)
    for (let y = 0; y < blendHeight; y++) {
      const progress = y / blendHeight
      const r = Math.floor(skyBottom.r + (baseGreen.r - skyBottom.r) * progress)
      const g = Math.floor(skyBottom.g + (baseGreen.g - skyBottom.g) * progress)
      const b = Math.floor(skyBottom.b + (baseGreen.b - skyBottom.b) * progress)
      
      graphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1)
      graphics.fillRect(0, skyHeight + y, GAME_WIDTH, 1)
    }
    
    // Rich turf gradient for the rest of the field
    const fieldStart = skyHeight + blendHeight
    for (let y = fieldStart; y < GAME_HEIGHT; y++) {
      const progress = (y - fieldStart) / (GAME_HEIGHT - fieldStart)
      
      const r = Math.floor(baseGreen.r + (lightGreen.r - baseGreen.r) * progress * 0.5)
      const g = Math.floor(baseGreen.g + (lightGreen.g - baseGreen.g) * progress * 0.3)
      const b = Math.floor(baseGreen.b + (lightGreen.b - baseGreen.b) * progress * 0.5)
      
      graphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1)
      graphics.fillRect(0, y, GAME_WIDTH, 1)
    }
    
    // Turf texture pattern
    const texture = this.add.graphics()
    texture.lineStyle(1, 0xffffff, 0.02)
    for (let x = 0; x < GAME_WIDTH; x += 8) {
      texture.moveTo(x, 0)
      texture.lineTo(x + 4, GAME_HEIGHT)
      texture.strokePath()
    }
    
    // Yard lines with glow
    const yardLines = this.add.graphics()
    for (let y = 80; y < GAME_HEIGHT - 20; y += 80) {
      // Glow
      yardLines.lineStyle(6, 0xffffff, 0.05)
      yardLines.moveTo(30, y)
      yardLines.lineTo(GAME_WIDTH - 30, y)
      yardLines.strokePath()
      
      // Main line
      yardLines.lineStyle(2, 0xffffff, 0.25)
      yardLines.moveTo(30, y)
      yardLines.lineTo(GAME_WIDTH - 30, y)
      yardLines.strokePath()
      
      // Hash marks
      yardLines.lineStyle(1, 0xffffff, 0.15)
      for (let x = 30; x < GAME_WIDTH - 30; x += 20) {
        yardLines.fillStyle(0xffffff, 0.15)
        yardLines.fillRect(x, y - 3, 2, 6)
      }
    }
    
    // Endzone at bottom (Seahawks Navy)
    const endzone = this.add.graphics()
    endzone.fillStyle(COLORS.navy, 0.4)
    endzone.fillRect(0, GAME_HEIGHT - 60, GAME_WIDTH, 60)
    
    // Endzone text
    const endzoneText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 30, 'SEAHAWKS', {
      fontSize: '24px',
      color: hexToCSS(COLORS.green),
      fontFamily: FONTS.display,
    })
    endzoneText.setOrigin(0.5)
    endzoneText.setAlpha(0.15)
    
    // Spawn zone indicator (top)
    const spawnZone = this.add.graphics()
    spawnZone.fillStyle(0xff0000, 0.05)
    spawnZone.fillRect(0, 0, GAME_WIDTH, 65)
    
    // Field border with glow
    const border = this.add.graphics()
    border.lineStyle(4, COLORS.green, 0.3)
    border.strokeRect(8, 8, GAME_WIDTH - 16, GAME_HEIGHT - 16)
    border.lineStyle(2, COLORS.green, 0.6)
    border.strokeRect(10, 10, GAME_WIDTH - 20, GAME_HEIGHT - 20)
  }

  private createAtmosphereEffects(): void {
    // If in campaign mode, use stage-specific atmosphere
    if (this.isCampaignMode && this.currentStage) {
      this.createStageAtmosphere()
      return
    }
    
    // Default: Floating particles for stadium atmosphere
    for (let i = 0; i < 10; i++) {
      const particle = this.add.graphics()
      particle.fillStyle(COLORS.green, 0.2 + Math.random() * 0.2)
      particle.fillCircle(0, 0, 1 + Math.random())
      
      particle.setPosition(Math.random() * GAME_WIDTH, Math.random() * GAME_HEIGHT)
      
      this.tweens.add({
        targets: particle,
        y: particle.y - 80,
        alpha: 0,
        duration: 3000 + Math.random() * 2000,
        repeat: -1,
        delay: Math.random() * 2000,
        onRepeat: () => {
          particle.setPosition(Math.random() * GAME_WIDTH, GAME_HEIGHT)
          particle.setAlpha(0.2 + Math.random() * 0.2)
        }
      })
      
      this.fieldParticles.push(particle)
    }
    
    // Stadium lights glow at top
    const lightsGlow = this.add.graphics()
    lightsGlow.fillStyle(0xffffff, 0.02)
    lightsGlow.fillEllipse(GAME_WIDTH / 2, -50, GAME_WIDTH, 200)
    
    this.tweens.add({
      targets: lightsGlow,
      alpha: 0.8,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }
  
  private createStageAtmosphere(): void {
    if (!this.currentStage) return
    
    const { weather, atmosphereColor, crowdIntensity } = this.currentStage.visuals
    const atmoColorNum = parseInt(atmosphereColor.replace('#', ''), 16)
    
    // Stage-specific atmospheric glow at top
    const stageGlow = this.add.graphics()
    stageGlow.fillStyle(atmoColorNum, 0.05 * crowdIntensity)
    stageGlow.fillEllipse(GAME_WIDTH / 2, -30, GAME_WIDTH * 1.2, 150)
    
    this.tweens.add({
      targets: stageGlow,
      alpha: 0.1 * crowdIntensity,
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
    
    // Weather-specific particles
    const particleCount = Math.floor(weather.intensity * 40)
    
    for (let i = 0; i < particleCount; i++) {
      const particle = this.add.graphics()
      
      switch (weather.type) {
        case 'rain':
          this.createRainParticle(particle, weather.intensity)
          break
        case 'snow':
          this.createSnowParticle(particle, weather.intensity)
          break
        case 'fog':
          this.createFogParticle(particle, weather.intensity)
          break
        case 'wind':
          this.createWindParticle(particle, weather.intensity)
          break
        case 'heat':
          this.createHeatParticle(particle, weather.intensity)
          break
        case 'night':
          this.createNightParticle(particle, atmoColorNum, crowdIntensity)
          break
        default:
          this.createDefaultParticle(particle)
      }
      
      this.stageAtmosphere.push(particle)
    }
    
    // Crowd energy effect for high-intensity stages
    if (crowdIntensity > 0.9) {
      this.createCrowdEnergyEffect(atmoColorNum)
    }
  }
  
  private createRainParticle(particle: Phaser.GameObjects.Graphics, intensity: number): void {
    particle.lineStyle(1, 0xaaccff, 0.4 + intensity * 0.3)
    particle.lineBetween(0, 0, 2, 8 + intensity * 6)
    
    const startX = Math.random() * GAME_WIDTH
    const startY = -20 - Math.random() * 100
    particle.setPosition(startX, startY)
    
    this.tweens.add({
      targets: particle,
      y: GAME_HEIGHT + 30,
      x: startX + 40 * intensity,
      duration: 600 + Math.random() * 400,
      repeat: -1,
      delay: Math.random() * 1000,
      onRepeat: () => {
        particle.x = Math.random() * GAME_WIDTH
        particle.y = -20
      }
    })
  }
  
  private createSnowParticle(particle: Phaser.GameObjects.Graphics, intensity: number): void {
    const size = 1 + Math.random() * 2
    particle.fillStyle(0xffffff, 0.6 + Math.random() * 0.3)
    particle.fillCircle(0, 0, size)
    
    const startX = Math.random() * GAME_WIDTH
    const startY = -20 - Math.random() * 100
    particle.setPosition(startX, startY)
    
    this.tweens.add({
      targets: particle,
      y: GAME_HEIGHT + 30,
      x: startX + (Math.random() - 0.5) * 100 * intensity,
      duration: 3000 + Math.random() * 2000,
      repeat: -1,
      delay: Math.random() * 2000,
      onRepeat: () => {
        particle.x = Math.random() * GAME_WIDTH
        particle.y = -20
      }
    })
  }
  
  private createFogParticle(particle: Phaser.GameObjects.Graphics, intensity: number): void {
    const size = 30 + Math.random() * 50
    particle.fillStyle(0xffffff, 0.03 + intensity * 0.05)
    particle.fillCircle(0, 0, size)
    
    const startX = Math.random() * GAME_WIDTH
    const startY = 100 + Math.random() * (GAME_HEIGHT - 200)
    particle.setPosition(startX, startY)
    
    this.tweens.add({
      targets: particle,
      x: startX + (Math.random() - 0.5) * 80,
      alpha: { from: 0.02, to: 0.08 * intensity },
      duration: 4000 + Math.random() * 3000,
      yoyo: true,
      repeat: -1
    })
  }
  
  private createWindParticle(particle: Phaser.GameObjects.Graphics, intensity: number): void {
    particle.lineStyle(1, 0xcccccc, 0.2)
    particle.lineBetween(0, 0, 15 + intensity * 10, 2)
    
    const startX = -50
    const startY = Math.random() * GAME_HEIGHT
    particle.setPosition(startX, startY)
    
    this.tweens.add({
      targets: particle,
      x: GAME_WIDTH + 50,
      y: startY + (Math.random() - 0.5) * 50,
      duration: 1000 + Math.random() * 500,
      repeat: -1,
      delay: Math.random() * 2000,
      onRepeat: () => {
        particle.x = -50
        particle.y = Math.random() * GAME_HEIGHT
      }
    })
  }
  
  private createHeatParticle(particle: Phaser.GameObjects.Graphics, intensity: number): void {
    particle.lineStyle(1, 0xffaa00, 0.1 + intensity * 0.1)
    // Wavy line for heat shimmer
    particle.beginPath()
    particle.moveTo(0, 0)
    for (let x = 0; x < 40; x += 5) {
      particle.lineTo(x, Math.sin(x * 0.3) * 3)
    }
    particle.strokePath()
    
    const startX = Math.random() * GAME_WIDTH
    const startY = GAME_HEIGHT - 50 - Math.random() * 100
    particle.setPosition(startX, startY)
    
    this.tweens.add({
      targets: particle,
      y: startY - 80,
      alpha: 0,
      duration: 2000 + Math.random() * 1000,
      repeat: -1,
      delay: Math.random() * 2000,
      onRepeat: () => {
        particle.x = Math.random() * GAME_WIDTH
        particle.y = GAME_HEIGHT - 50 - Math.random() * 100
        particle.setAlpha(0.1 + intensity * 0.1)
      }
    })
  }
  
  private createNightParticle(particle: Phaser.GameObjects.Graphics, color: number, intensity: number): void {
    // Stadium light rays
    const size = 2 + Math.random() * 2
    particle.fillStyle(color, 0.3 + Math.random() * 0.3)
    particle.fillCircle(0, 0, size)
    
    const startX = Math.random() * GAME_WIDTH
    const startY = Math.random() * GAME_HEIGHT * 0.3
    particle.setPosition(startX, startY)
    
    this.tweens.add({
      targets: particle,
      alpha: { from: 0.2, to: 0.6 * intensity },
      scaleX: { from: 1, to: 1.5 },
      scaleY: { from: 1, to: 1.5 },
      duration: 1500 + Math.random() * 1000,
      yoyo: true,
      repeat: -1
    })
  }
  
  private createDefaultParticle(particle: Phaser.GameObjects.Graphics): void {
    particle.fillStyle(COLORS.green, 0.2 + Math.random() * 0.2)
    particle.fillCircle(0, 0, 1 + Math.random())
    
    particle.setPosition(Math.random() * GAME_WIDTH, Math.random() * GAME_HEIGHT)
    
    this.tweens.add({
      targets: particle,
      y: particle.y - 80,
      alpha: 0,
      duration: 3000 + Math.random() * 2000,
      repeat: -1,
      delay: Math.random() * 2000,
      onRepeat: () => {
        particle.setPosition(Math.random() * GAME_WIDTH, GAME_HEIGHT)
        particle.setAlpha(0.2 + Math.random() * 0.2)
      }
    })
  }
  
  private createCrowdEnergyEffect(color: number): void {
    // Pulsing crowd energy at the edges
    const leftEnergy = this.add.graphics()
    leftEnergy.fillStyle(color, 0.05)
    leftEnergy.fillRect(0, 0, 30, GAME_HEIGHT)
    
    const rightEnergy = this.add.graphics()
    rightEnergy.fillStyle(color, 0.05)
    rightEnergy.fillRect(GAME_WIDTH - 30, 0, 30, GAME_HEIGHT)
    
    // Pulse animation
    this.tweens.add({
      targets: [leftEnergy, rightEnergy],
      alpha: 0.15,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }

  private createDefenders(): void {
    const playerDefender = this.createDefenderSprite(GAME_WIDTH / 2, GAME_HEIGHT - 150, true)
    this.defenders.push(playerDefender)
    
    for (let i = 1; i < this.stats.defenderCount; i++) {
      this.addAIDefender()
    }
  }

  private createDefenderSprite(x: number, y: number, isPlayer: boolean): Defender {
    const { selectedDefender } = useGameStore.getState()
    const defender = FULL_ROSTER.find(d => d.jersey === selectedDefender)
    const posColor = defender ? getPositionGroupColor(defender.positionGroup) : COLORS.green
    
    // Outer pulse ring
    const pulseRing = this.add.graphics()
    pulseRing.lineStyle(2, isPlayer ? COLORS.green : 0x00897B, 0.3)
    pulseRing.strokeCircle(0, 0, DEFENDER_RADIUS + 12)
    
    // Tackle radius indicator
    const tackleRadius = this.add.graphics()
    tackleRadius.lineStyle(1, COLORS.green, 0.15)
    tackleRadius.strokeCircle(0, 0, DEFENDER_RADIUS * this.stats.tackleRadiusMultiplier + RUNNER_RADIUS)
    tackleRadius.setName('tackleRadius')
    
    // Main body with gradient effect
    const body = this.add.graphics()
    if (isPlayer) {
      body.fillStyle(COLORS.navy, 1)
      body.fillCircle(0, 0, DEFENDER_RADIUS)
      body.lineStyle(4, posColor, 1)
      body.strokeCircle(0, 0, DEFENDER_RADIUS)
    } else {
      body.fillStyle(COLORS.navyLight, 1)
      body.fillCircle(0, 0, DEFENDER_RADIUS - 2)
      body.lineStyle(3, 0x00897B, 0.8)
      body.strokeCircle(0, 0, DEFENDER_RADIUS - 2)
    }
    
    // Inner highlight
    const highlight = this.add.graphics()
    highlight.fillStyle(0xffffff, 0.1)
    highlight.fillCircle(-5, -8, 12)
    
    // Jersey number
    const jersey = this.add.text(0, 0, isPlayer ? `${selectedDefender}` : '★', {
      fontSize: isPlayer ? '22px' : '20px',
      color: '#ffffff',
      fontFamily: FONTS.display,
    })
    jersey.setOrigin(0.5)
    
    const sprite = this.add.container(x, y, [pulseRing, tackleRadius, body, highlight, jersey])
    sprite.setSize(DEFENDER_RADIUS * 2, DEFENDER_RADIUS * 2)
    
    // Pulse animation
    this.tweens.add({
      targets: pulseRing,
      scaleX: 1.2,
      scaleY: 1.2,
      alpha: 0,
      duration: 1000,
      repeat: -1,
      ease: 'Sine.easeOut'
    })
    
    return {
      sprite,
      isPlayer,
      targetX: x,
      targetY: y,
    }
  }

  private addAIDefender(): void {
    const angle = Math.random() * Math.PI * 2
    const dist = 80 + Math.random() * 50
    const x = GAME_WIDTH / 2 + Math.cos(angle) * dist
    const y = GAME_HEIGHT / 2 + Math.sin(angle) * dist
    
    const defender = this.createDefenderSprite(x, y, false)
    this.defenders.push(defender)
    
    // Spawn effect
    defender.sprite.setScale(0)
    this.tweens.add({
      targets: defender.sprite,
      scale: 1,
      duration: 400,
      ease: 'Back.easeOut',
    })
  }

  private createPremiumUI(): void {
    // Top bar background
    const topBar = this.add.graphics()
    topBar.fillStyle(COLORS.navy, 0.7)
    topBar.fillRect(0, 0, GAME_WIDTH, 70)
    topBar.lineStyle(1, COLORS.green, 0.3)
    topBar.lineBetween(0, 70, GAME_WIDTH, 70)
    
    // Score
    this.scoreText = this.add.text(15, 12, 'SCORE', {
      fontSize: '10px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
      letterSpacing: 1,
    })
    
    const scoreValue = this.add.text(15, 24, '0', {
      fontSize: '20px',
      color: hexToCSS(COLORS.white),
      fontFamily: FONTS.display,
    })
    scoreValue.setName('scoreValue')
    
    // Wave indicator
    this.waveText = this.add.text(GAME_WIDTH - 15, 12, 'WAVE', {
      fontSize: '10px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
      letterSpacing: 1,
    })
    this.waveText.setOrigin(1, 0)
    
    // In campaign mode, show wave X/Y format
    const waveDisplay = this.isCampaignMode ? `1/${this.maxWaves}` : '1'
    const waveValue = this.add.text(GAME_WIDTH - 15, 24, waveDisplay, {
      fontSize: '20px',
      color: hexToCSS(COLORS.green),
      fontFamily: FONTS.display,
    })
    waveValue.setOrigin(1, 0)
    waveValue.setName('waveValue')
    
    // Lives (center)
    this.livesContainer = this.add.container(GAME_WIDTH / 2, 22)
    this.updateLivesDisplay()
    
    // Timer bar background
    this.timerBg = this.add.graphics()
    this.timerBg.fillStyle(COLORS.navyLight, 0.8)
    this.timerBg.fillRoundedRect(15, 50, GAME_WIDTH - 30, 12, 6)
    
    // Timer bar
    this.timerBar = this.add.graphics()
    
    // Tackles counter
    this.killsText = this.add.text(15, GAME_HEIGHT - 25, 'TACKLES: 0', {
      fontSize: '11px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
    })
    
    // Combo indicator (hidden initially)
    this.comboText = this.add.text(GAME_WIDTH / 2, 120, '', {
      fontSize: '24px',
      color: hexToCSS(COLORS.gold),
      fontFamily: FONTS.display,
    })
    this.comboText.setOrigin(0.5)
    this.comboText.setAlpha(0)
    
    // Stats panel
    this.statsText = this.add.text(GAME_WIDTH - 10, GAME_HEIGHT - 60, '', {
      fontSize: '10px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
      lineSpacing: 4,
      align: 'right',
    })
    this.statsText.setOrigin(1, 0)
    this.updateStatsDisplay()
  }
  
  private updateStatsDisplay(): void {
    const lines = []
    if (this.stats.defenderCount > 1) lines.push(`🏈 ${this.stats.defenderCount} Defenders`)
    if (this.stats.speedMultiplier > 1) lines.push(`⚡ +${Math.round((this.stats.speedMultiplier - 1) * 100)}% Speed`)
    if (this.stats.tackleRadiusMultiplier > 1) lines.push(`💪 +${Math.round((this.stats.tackleRadiusMultiplier - 1) * 100)}% Reach`)
    if (this.stats.enemySpeedMultiplier < 1) lines.push(`🍺 -${Math.round((1 - this.stats.enemySpeedMultiplier) * 100)}% Enemy`)
    
    this.statsText.setText(lines.join('\n'))
  }

  private createFanMeterUI(): void {
    const { wave } = useGameStore.getState()
    const meterWidth = 120
    const meterHeight = 16
    const meterX = GAME_WIDTH - meterWidth - 15
    const meterY = GAME_HEIGHT - 30
    
    // Background glow (hidden initially, shown when meter is full)
    this.fanMeterGlow = this.add.graphics()
    this.fanMeterGlow.fillStyle(COLORS.green, 0.3)
    this.fanMeterGlow.fillRoundedRect(meterX - 4, meterY - 4, meterWidth + 8, meterHeight + 8, 10)
    this.fanMeterGlow.setAlpha(0)
    
    // Background
    this.fanMeterBg = this.add.graphics()
    this.fanMeterBg.fillStyle(COLORS.navyLight, 0.8)
    this.fanMeterBg.fillRoundedRect(meterX, meterY, meterWidth, meterHeight, 6)
    this.fanMeterBg.lineStyle(1, COLORS.grey, 0.4)
    this.fanMeterBg.strokeRoundedRect(meterX, meterY, meterWidth, meterHeight, 6)
    
    // Fill bar
    this.fanMeterBar = this.add.graphics()
    
    // Label with 12 icon
    this.fanMeterLabel = this.add.text(meterX - 5, meterY + meterHeight / 2, '12', {
      fontSize: '12px',
      color: hexToCSS(COLORS.green),
      fontFamily: FONTS.display,
    })
    this.fanMeterLabel.setOrigin(1, 0.5)
    
    // Initially hidden until wave 3
    const isVisible = wave >= 3
    this.fanMeterGlow.setAlpha(0)
    this.fanMeterBg.setAlpha(isVisible ? 1 : 0)
    this.fanMeterBar.setAlpha(isVisible ? 1 : 0)
    this.fanMeterLabel.setAlpha(isVisible ? 0.7 : 0)
  }

  private updateFanMeterDisplay(): void {
    const { wave } = useGameStore.getState()
    const meterWidth = 120
    const meterHeight = 16
    const meterX = GAME_WIDTH - meterWidth - 15
    const meterY = GAME_HEIGHT - 30
    
    // Show/hide based on wave
    const isVisible = wave >= 3
    if (!isVisible) {
      this.fanMeterBg.setAlpha(0)
      this.fanMeterBar.setAlpha(0)
      this.fanMeterLabel.setAlpha(0)
      return
    }
    
    this.fanMeterBg.setAlpha(1)
    this.fanMeterBar.setAlpha(1)
    this.fanMeterLabel.setAlpha(0.7)
    
    this.fanMeterBar.clear()
    
    // Calculate fill width
    const fillWidth = (meterWidth - 4) * (this.fanMeter / 100)
    
    // Color changes based on meter level
    let barColor = COLORS.grey
    if (this.fanMeter >= 100) {
      barColor = COLORS.green
    } else if (this.fanMeter >= 75) {
      barColor = COLORS.gold
    } else if (this.fanMeter >= 50) {
      barColor = COLORS.greenLight
    }
    
    if (fillWidth > 0) {
      this.fanMeterBar.fillStyle(barColor, 1)
      this.fanMeterBar.fillRoundedRect(meterX + 2, meterY + 2, fillWidth, meterHeight - 4, 4)
    }
    
    // Pulsing glow when megaphone is on screen
    if (this.megaphone) {
      this.fanMeterGlow.setAlpha(0.6 + Math.sin(Date.now() * 0.015) * 0.4)
      this.fanMeterLabel.setColor(hexToCSS(COLORS.green))
      this.fanMeterLabel.setText('📣 GET IT!')
    } else if (this.fanMeter >= 100 && this.fanMeterReady) {
      this.fanMeterGlow.setAlpha(0.6 + Math.sin(Date.now() * 0.01) * 0.4)
      this.fanMeterLabel.setColor(hexToCSS(COLORS.gold))
      this.fanMeterLabel.setText('12 READY!')
    } else {
      this.fanMeterGlow.setAlpha(0)
      this.fanMeterLabel.setColor(hexToCSS(COLORS.grey))
      this.fanMeterLabel.setText('12')
    }
  }

  private createPauseButton(): void {
    const buttonSize = 36
    const x = GAME_WIDTH - buttonSize / 2 - 10
    const y = 85
    
    const bg = this.add.graphics()
    bg.fillStyle(COLORS.navyLight, 0.8)
    bg.fillRoundedRect(-buttonSize / 2, -buttonSize / 2, buttonSize, buttonSize, 8)
    
    const icon = this.add.text(0, 0, '⏸', { fontSize: '18px' })
    icon.setOrigin(0.5)
    icon.setName('pauseIcon')
    
    this.pauseButton = this.add.container(x, y, [bg, icon])
    this.pauseButton.setSize(buttonSize, buttonSize)
    this.pauseButton.setInteractive({ useHandCursor: true })
    this.pauseButton.setDepth(100)
    
    this.pauseButton.on('pointerdown', () => {
      AudioManager.playClick()
      this.togglePause()
    })
    
    this.pauseButton.on('pointerover', () => {
      this.tweens.add({ targets: this.pauseButton, scale: 1.1, duration: 100 })
    })
    
    this.pauseButton.on('pointerout', () => {
      this.tweens.add({ targets: this.pauseButton, scale: 1, duration: 100 })
    })
  }

  private togglePause(): void {
    if (this.isGameOver) return
    
    this.isPaused = !this.isPaused
    
    const icon = this.pauseButton.getByName('pauseIcon') as Phaser.GameObjects.Text
    
    if (this.isPaused) {
      icon.setText('▶')
      this.showPauseOverlay()
    } else {
      icon.setText('⏸')
      this.hidePauseOverlay()
    }
  }

  private showPauseOverlay(): void {
    if (this.pauseOverlay) return
    
    const overlay = this.add.graphics()
    overlay.fillStyle(0x000000, 0.7)
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    
    const pausedText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, 'PAUSED', {
      fontSize: '42px',
      color: hexToCSS(COLORS.white),
      fontFamily: FONTS.display,
    })
    pausedText.setOrigin(0.5)
    
    const resumeHint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, 'Tap pause button to resume', {
      fontSize: '14px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
    })
    resumeHint.setOrigin(0.5)
    
    this.pauseOverlay = this.add.container(0, 0, [overlay, pausedText, resumeHint])
    this.pauseOverlay.setDepth(99)
    this.pauseOverlay.setAlpha(0)
    
    this.tweens.add({
      targets: this.pauseOverlay,
      alpha: 1,
      duration: 200
    })
  }

  private hidePauseOverlay(): void {
    if (!this.pauseOverlay) return
    
    this.tweens.add({
      targets: this.pauseOverlay,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        if (this.pauseOverlay) {
          this.pauseOverlay.destroy()
          this.pauseOverlay = null
        }
      }
    })
  }

  private show12thManText(): void {
    const text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, '12th MAN!', {
      fontSize: '48px',
      color: hexToCSS(COLORS.green),
      fontFamily: FONTS.display,
      stroke: hexToCSS(COLORS.navy),
      strokeThickness: 4,
    })
    text.setOrigin(0.5)
    text.setScale(0)
    text.setDepth(100)
    
    this.tweens.add({
      targets: text,
      scale: 1.3,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: text,
          y: text.y - 80,
          alpha: 0,
          scale: 0.8,
          duration: 800,
          delay: 500,
          onComplete: () => text.destroy()
        })
      }
    })
    
    // Fan noise text
    const fanText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'CROWD GOES WILD!', {
      fontSize: '18px',
      color: hexToCSS(COLORS.white),
      fontFamily: FONTS.body,
    })
    fanText.setOrigin(0.5)
    fanText.setAlpha(0)
    fanText.setDepth(100)
    
    this.tweens.add({
      targets: fanText,
      alpha: 1,
      duration: 300,
      delay: 300,
      onComplete: () => {
        this.tweens.add({
          targets: fanText,
          alpha: 0,
          y: fanText.y - 30,
          duration: 600,
          delay: 600,
          onComplete: () => fanText.destroy()
        })
      }
    })
  }

  private show12thManPoints(points: number): void {
    const text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, `+${points}`, {
      fontSize: '36px',
      color: hexToCSS(COLORS.gold),
      fontFamily: FONTS.display,
      stroke: hexToCSS(COLORS.navy),
      strokeThickness: 3,
    })
    text.setOrigin(0.5)
    text.setScale(0)
    text.setDepth(100)
    
    this.tweens.add({
      targets: text,
      scale: 1,
      duration: 200,
      delay: 200,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: text,
          y: text.y - 60,
          alpha: 0,
          duration: 600,
          delay: 400,
          onComplete: () => text.destroy()
        })
      }
    })
  }

  private spawnMegaphone(): void {
    if (this.megaphone) return // Only one megaphone at a time
    
    const x = Phaser.Math.Between(60, GAME_WIDTH - 60)
    const y = -POWER_UP_RADIUS * 2
    
    // Create megaphone container with eye-catching design
    const megaphoneRadius = POWER_UP_RADIUS * 1.5
    
    // Outer glow ring (animated)
    const glowRing = this.add.graphics()
    glowRing.lineStyle(4, COLORS.green, 0.8)
    glowRing.strokeCircle(0, 0, megaphoneRadius + 8)
    glowRing.setName('glowRing')
    
    // Inner glow
    const innerGlow = this.add.graphics()
    innerGlow.fillStyle(COLORS.green, 0.3)
    innerGlow.fillCircle(0, 0, megaphoneRadius + 4)
    
    // Main body - gold/green gradient look
    const body = this.add.graphics()
    body.fillStyle(COLORS.gold, 1)
    body.fillCircle(0, 0, megaphoneRadius)
    body.lineStyle(3, COLORS.green, 1)
    body.strokeCircle(0, 0, megaphoneRadius)
    
    // Highlight
    const highlight = this.add.graphics()
    highlight.fillStyle(0xffffff, 0.3)
    highlight.fillCircle(-6, -8, 10)
    
    // Megaphone icon
    const icon = this.add.text(0, 0, '📣', { fontSize: '28px' })
    icon.setOrigin(0.5)
    
    // "12" label below
    const label = this.add.text(0, megaphoneRadius + 15, '12th MAN', {
      fontSize: '10px',
      color: hexToCSS(COLORS.green),
      fontFamily: FONTS.display,
    })
    label.setOrigin(0.5)
    
    const sprite = this.add.container(x, y, [glowRing, innerGlow, body, highlight, icon, label])
    sprite.setData('radius', megaphoneRadius)
    sprite.setDepth(50) // Above runners
    
    // Pulsing glow animation
    this.tweens.add({
      targets: glowRing,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0,
      duration: 800,
      repeat: -1,
      ease: 'Sine.easeOut'
    })
    
    // Spawn animation - dramatic entrance
    sprite.setScale(0)
    sprite.setAlpha(0)
    
    this.tweens.add({
      targets: sprite,
      scale: 1,
      alpha: 1,
      duration: 400,
      ease: 'Back.easeOut'
    })
    
    // Camera attention effect
    this.cameras.main.flash(150, 105, 190, 40) // Green flash
    
    // Show spawn notification
    this.showMegaphoneSpawnText()
    
    this.megaphone = {
      sprite,
      speed: BASE_RUNNER_SPEED * 2.1, // Fast descent - 50% faster, urgency to catch it!
      pulseTimer: 0
    }
  }
  
  private showMegaphoneSpawnText(): void {
    const text = this.add.text(GAME_WIDTH / 2, 140, '📣 MEGAPHONE INCOMING!', {
      fontSize: '20px',
      color: hexToCSS(COLORS.green),
      fontFamily: FONTS.display,
      stroke: hexToCSS(COLORS.navy),
      strokeThickness: 3,
    })
    text.setOrigin(0.5)
    text.setScale(0)
    text.setDepth(100)
    
    this.tweens.add({
      targets: text,
      scale: 1.1,
      duration: 250,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: text,
          y: text.y - 40,
          alpha: 0,
          duration: 600,
          delay: 800,
          onComplete: () => text.destroy()
        })
      }
    })
  }
  
  private updateMegaphone(delta: number): void {
    if (!this.megaphone) return
    
    const megaphone = this.megaphone
    const radius = megaphone.sprite.getData('radius') || POWER_UP_RADIUS * 1.5
    
    // Move down the field - faster descent with urgency!
    megaphone.sprite.y += megaphone.speed * (delta / 1000)
    
    // Subtle wobble - less movement so it descends more directly
    megaphone.pulseTimer += delta * 0.004
    megaphone.sprite.x += Math.sin(megaphone.pulseTimer) * 0.4
    megaphone.sprite.x = Phaser.Math.Clamp(megaphone.sprite.x, radius + 20, GAME_WIDTH - radius - 20)
    
    // Check if megaphone escaped (went past endzone)
    if (megaphone.sprite.y > GAME_HEIGHT + radius) {
      this.megaphoneMissed()
    }
  }
  
  private checkMegaphoneCollision(): void {
    if (!this.megaphone) return
    
    const megaphone = this.megaphone
    const megaphoneRadius = megaphone.sprite.getData('radius') || POWER_UP_RADIUS * 1.5
    
    for (const defender of this.defenders) {
      const dx = defender.sprite.x - megaphone.sprite.x
      const dy = defender.sprite.y - megaphone.sprite.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      
      const hitRadius = DEFENDER_RADIUS * this.stats.tackleRadiusMultiplier + megaphoneRadius
      
      if (dist < hitRadius) {
        this.triggerMegaphonePowerUp()
        return
      }
    }
  }
  
  private triggerMegaphonePowerUp(): void {
    if (!this.megaphone) return
    
    const megaphoneX = this.megaphone.sprite.x
    const megaphoneY = this.megaphone.sprite.y
    
    // Destroy megaphone sprite
    this.megaphone.sprite.destroy()
    this.megaphone = null
    
    // Reset fan meter state
    this.fanMeterReady = false
    this.fanMeterCooldown = true
    this.fanMeter = 0
    
    // === MASSIVE FEEDBACK - THIS IS THE REWARD! ===
    
    // Strong haptics pattern - celebration!
    if (navigator.vibrate) {
      navigator.vibrate([100, 30, 100, 30, 100, 30, 200, 50, 300])
    }
    
    // Intense screen shake
    this.cameras.main.shake(600, 0.025)
    
    // Bright flash
    this.cameras.main.flash(400, 105, 190, 40) // Seahawks green
    
    // Audio: Crowd goes absolutely wild!
    AudioManager.playCrowdRoar()
    
    // Create epic shockwave from megaphone position
    this.createMegaphoneShockwave(megaphoneX, megaphoneY)
    
    // === CLEAR EVERYTHING ON THE FIELD ===
    // Destroys all currently visible runners, but game continues spawning new ones
    let bonusPoints = 0
    const runnersCleared = this.runners.length
    
    for (const runner of this.runners) {
      // Create explosion effect at each runner
      this.createPremiumTackleEffect(runner.sprite.x, runner.sprite.y, COLORS.green)
      
      // Add points - double points for 12th Man megaphone kills
      const typeDef = RUNNER_TYPES[runner.type]
      bonusPoints += typeDef.points * 2
      
      runner.sprite.destroy()
    }
    
    // Clear the runners array - new ones will continue to spawn
    this.runners = []
    
    // Show mega points
    if (bonusPoints > 0) {
      useGameStore.getState().addScore(bonusPoints)
      this.show12thManPoints(bonusPoints)
    }
    
    // Show epic 12th Man text
    this.show12thManText()
    
    // Show runners cleared count
    this.showRunnersClearedText(runnersCleared)
    
    // Reset cooldown after a delay (shorter cooldown on higher waves)
    const cooldownTime = Math.max(5000, 8000 - (useGameStore.getState().wave * 200))
    this.time.delayedCall(cooldownTime, () => {
      this.fanMeterCooldown = false
    })
  }
  
  
  private createMegaphoneShockwave(x: number, y: number): void {
    // Primary shockwave from megaphone position
    const shockwave = this.add.graphics()
    shockwave.lineStyle(6, COLORS.green, 1)
    shockwave.strokeCircle(x, y, 30)
    
    this.tweens.add({
      targets: shockwave,
      scaleX: 20,
      scaleY: 20,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => shockwave.destroy()
    })
    
    // Secondary wave
    this.time.delayedCall(100, () => {
      const wave2 = this.add.graphics()
      wave2.lineStyle(4, COLORS.gold, 0.9)
      wave2.strokeCircle(x, y, 25)
      
      this.tweens.add({
        targets: wave2,
        scaleX: 18,
        scaleY: 18,
        alpha: 0,
        duration: 700,
        ease: 'Power2',
        onComplete: () => wave2.destroy()
      })
    })
    
    // Third wave
    this.time.delayedCall(200, () => {
      const wave3 = this.add.graphics()
      wave3.lineStyle(3, COLORS.greenLight, 0.8)
      wave3.strokeCircle(x, y, 20)
      
      this.tweens.add({
        targets: wave3,
        scaleX: 15,
        scaleY: 15,
        alpha: 0,
        duration: 600,
        ease: 'Power2',
        onComplete: () => wave3.destroy()
      })
    })
    
    // Particle burst from megaphone
    for (let i = 0; i < 20; i++) {
      const particle = this.add.graphics()
      const particleColor = i % 3 === 0 ? COLORS.green : (i % 3 === 1 ? COLORS.gold : COLORS.white)
      particle.fillStyle(particleColor, 1)
      particle.fillCircle(0, 0, 3 + Math.random() * 4)
      particle.setPosition(x, y)
      
      const angle = (i / 20) * Math.PI * 2
      const distance = 100 + Math.random() * 80
      
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        scale: 0.2,
        duration: 600,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      })
    }
  }
  
  private showRunnersClearedText(count: number): void {
    if (count === 0) return
    
    const text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80, `${count} RUNNERS CLEARED!`, {
      fontSize: '22px',
      color: hexToCSS(COLORS.white),
      fontFamily: FONTS.display,
      stroke: hexToCSS(COLORS.navy),
      strokeThickness: 3,
    })
    text.setOrigin(0.5)
    text.setAlpha(0)
    text.setDepth(100)
    
    this.tweens.add({
      targets: text,
      alpha: 1,
      duration: 300,
      delay: 400,
      onComplete: () => {
        this.tweens.add({
          targets: text,
          y: text.y - 40,
          alpha: 0,
          duration: 600,
          delay: 800,
          onComplete: () => text.destroy()
        })
      }
    })
  }
  
  private megaphoneMissed(): void {
    if (!this.megaphone) return
    
    // Megaphone escaped - player missed it!
    this.megaphone.sprite.destroy()
    this.megaphone = null
    
    // Reset fan meter - they'll have to build it up again
    this.fanMeterReady = false
    this.fanMeterCooldown = true
    this.fanMeter = 0
    
    // Brief sad haptic
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
    
    // Show missed text
    const text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'MEGAPHONE MISSED!', {
      fontSize: '18px',
      color: hexToCSS(COLORS.dlRed),
      fontFamily: FONTS.display,
    })
    text.setOrigin(0.5)
    text.setDepth(100)
    
    this.tweens.add({
      targets: text,
      y: text.y - 50,
      alpha: 0,
      duration: 800,
      delay: 400,
      onComplete: () => text.destroy()
    })
    
    // Shorter cooldown since they didn't get the reward
    this.time.delayedCall(3000, () => {
      this.fanMeterCooldown = false
    })
  }

  private setupInput(): void {
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.pointer.x = pointer.x
      this.pointer.y = pointer.y
    })
    
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      AudioManager.resume()
      this.pointer.x = pointer.x
      this.pointer.y = pointer.y
      // Megaphone power-up is now activated by tackling it, not tapping the meter
    })
  }

  private startWave(): void {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5051b6de-b0ce-411d-bf90-110293cecd7e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GameScene.ts:startWave',message:'Starting new wave',data:{wave:useGameStore.getState().wave,stats:{...this.stats}},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    this.waveTimer = 0
    this.spawnTimer = 0
    this.runnersThisWave = 0
    this.waveKills = 0
    this.isPaused = false
    this.bossSpawned = false
    
    this.killsText.setText('TACKLES: 0')
    
    const { wave } = useGameStore.getState()
    
    // Spawn boss on final wave for playoff/super bowl stages
    const isPlayoffStage = this.currentStage?.isPlayoff || this.currentStage?.isSuperBowl
    const isFinalWave = wave === this.maxWaves
    
    if (isPlayoffStage && isFinalWave && !this.bossSpawned) {
      this.time.delayedCall(1500, () => {
        this.showBossIntro()
      })
    }
    
    // Epic wave announcement
    const waveContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2)
    
    const waveBg = this.add.graphics()
    waveBg.fillStyle(COLORS.navy, 0.8)
    waveBg.fillRoundedRect(-100, -50, 200, 100, 20)
    
    const waveLabel = this.add.text(0, -15, 'WAVE', {
      fontSize: '16px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
      letterSpacing: 3,
    })
    waveLabel.setOrigin(0.5)
    
    const waveNumber = this.add.text(0, 20, `${wave}`, {
      fontSize: '48px',
      color: hexToCSS(COLORS.green),
      fontFamily: FONTS.display,
    })
    waveNumber.setOrigin(0.5)
    
    waveContainer.add([waveBg, waveLabel, waveNumber])
    waveContainer.setScale(0)
    
    this.tweens.add({
      targets: waveContainer,
      scale: 1,
      duration: 400,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: waveContainer,
          alpha: 0,
          y: waveContainer.y - 50,
          duration: 400,
          delay: 600,
          onComplete: () => waveContainer.destroy(),
        })
      },
    })
  }

  private spawnRunner(forceBoss: boolean = false): void {
    const { wave } = useGameStore.getState()
    
    let runnerType: RunnerType = 'NORMAL'
    
    // Boss spawn logic for playoff/super bowl stages
    if (forceBoss) {
      runnerType = 'BOSS'
    } else {
      const roll = Math.random()
      
      // Apply difficulty modifier to special spawn chance
      const baseSpecialChance = 0.2 + (wave * 0.05)
      const specialChance = Math.min(0.75, baseSpecialChance * this.difficultyModifier)
      
      if (roll < specialChance) {
        const specialRoll = Math.random()
        if (specialRoll < 0.35) {
          runnerType = 'FAST'
        } else if (specialRoll < 0.6) {
          runnerType = 'ZIGZAG'
        } else {
          runnerType = 'TANK'
        }
      }
    }
    
    // Adjusted difficulty curve - smoother progression
    // In campaign mode, also consider stage difficulty
    const effectiveWave = Math.floor(wave * this.difficultyModifier)
    if (effectiveWave >= 5 && this.runnersThisWave % 4 === 0) runnerType = 'TANK'
    if (effectiveWave >= 8 && this.runnersThisWave % 3 === 0) runnerType = 'FAST'
    
    const typeDef = RUNNER_TYPES[runnerType]
    
    const x = Phaser.Math.Between(40, GAME_WIDTH - 40)
    const y = -RUNNER_RADIUS
    
    // Apply difficulty modifier to runner speed
    const waveSpeed = Math.min(MAX_RUNNER_SPEED, BASE_RUNNER_SPEED + (wave * SPEED_PER_WAVE))
    const speed = waveSpeed * typeDef.speedMult * this.stats.enemySpeedMultiplier * this.difficultyModifier
    
    const radius = RUNNER_RADIUS * typeDef.size
    
    // Get opponent accent color for holographic effects
    const accentColor = this.currentStage?.visuals.opponent.accent || 0xFFFFFF
    
    const spriteChildren: Phaser.GameObjects.GameObject[] = []
    
    // === FUTURISTIC HOLOGRAPHIC RUNNER DESIGN ===
    
    // Outer holographic shimmer ring (pulsing)
    const hologramRing = this.add.graphics()
    hologramRing.lineStyle(1, accentColor, 0.4)
    hologramRing.strokeCircle(0, 0, radius + 6)
    hologramRing.setName('hologramRing')
    spriteChildren.push(hologramRing)
    
    // Neon glow effect
    const glowOuter = this.add.graphics()
    glowOuter.fillStyle(typeDef.color, 0.15)
    glowOuter.fillCircle(0, 0, radius + 4)
    spriteChildren.push(glowOuter)
    
    // Motion trail indicator (vertical lines behind)
    const trail = this.add.graphics()
    trail.fillStyle(typeDef.color, 0.3)
    trail.fillRect(-radius * 0.3, -radius - 2, radius * 0.6, 4)
    trail.fillStyle(typeDef.color, 0.2)
    trail.fillRect(-radius * 0.2, -radius - 6, radius * 0.4, 4)
    trail.setName('trail')
    spriteChildren.push(trail)
    
    // Runner body with gradient effect (simulated)
    const body = this.add.graphics()
    // Inner lighter color (center highlight)
    const lighterColor = Phaser.Display.Color.IntegerToColor(typeDef.color)
    const brightColor = Phaser.Display.Color.GetColor(
      Math.min(255, lighterColor.red + 40),
      Math.min(255, lighterColor.green + 40),
      Math.min(255, lighterColor.blue + 40)
    )
    body.fillStyle(typeDef.color, 1)
    body.fillCircle(0, 0, radius)
    body.fillStyle(brightColor, 0.4)
    body.fillCircle(-radius * 0.2, -radius * 0.2, radius * 0.5)
    spriteChildren.push(body)
    
    // Neon border glow (accent color)
    const neonBorder = this.add.graphics()
    neonBorder.lineStyle(3, accentColor, 0.7)
    neonBorder.strokeCircle(0, 0, radius)
    neonBorder.lineStyle(1, 0xffffff, 0.5)
    neonBorder.strokeCircle(0, 0, radius - 1)
    spriteChildren.push(neonBorder)
    
    // Helmet face indicator (stylized)
    const faceIndicator = this.add.graphics()
    faceIndicator.fillStyle(0x000000, 0.4)
    faceIndicator.fillEllipse(0, -radius * 0.1, radius * 1.2, radius * 0.8)
    // Visor shine
    faceIndicator.fillStyle(0xffffff, 0.3)
    faceIndicator.fillEllipse(-radius * 0.2, -radius * 0.3, radius * 0.4, radius * 0.2)
    spriteChildren.push(faceIndicator)
    
    // Type icon (jersey number or type indicator)
    const iconText = runnerType === 'BOSS' ? '👑' : runnerType === 'FAST' ? '⚡' : runnerType === 'TANK' ? '🛡️' : runnerType === 'ZIGZAG' ? '🌀' : '🏈'
    const icon = this.add.text(0, radius * 0.1, iconText, { 
      fontSize: `${Math.max(10, 8 + typeDef.size * 4)}px` 
    })
    icon.setOrigin(0.5)
    spriteChildren.push(icon)
    
    // Add boss-specific effects
    if (runnerType === 'BOSS') {
      // Gold crown aura
      const aura = this.add.graphics()
      aura.fillStyle(0xFFD700, 0.25)
      aura.fillCircle(0, 0, radius + 12)
      aura.lineStyle(3, 0xFFD700, 0.9)
      aura.strokeCircle(0, 0, radius + 8)
      spriteChildren.unshift(aura) // Add behind everything
      
      // Pulsing aura animation
      this.tweens.add({
        targets: aura,
        alpha: 0.5,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })
      
      // Electric particles around boss
      for (let i = 0; i < 3; i++) {
        const particle = this.add.graphics()
        particle.fillStyle(0xFFD700, 0.8)
        particle.fillCircle(0, 0, 2)
        const angle = (i / 3) * Math.PI * 2
        particle.setPosition(Math.cos(angle) * (radius + 6), Math.sin(angle) * (radius + 6))
        spriteChildren.push(particle)
        
        // Orbit animation
        this.tweens.add({
          targets: particle,
          x: Math.cos(angle + Math.PI * 2) * (radius + 6),
          y: Math.sin(angle + Math.PI * 2) * (radius + 6),
          duration: 1500,
          repeat: -1,
          ease: 'Linear'
        })
      }
    }
    
    // Add hologram shimmer animation
    this.tweens.add({
      targets: hologramRing,
      alpha: { from: 0.2, to: 0.6 },
      scaleX: { from: 1, to: 1.15 },
      scaleY: { from: 1, to: 1.15 },
      duration: 800 + Math.random() * 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
    
    const sprite = this.add.container(x, y, spriteChildren)
    sprite.setData('radius', radius)
    sprite.setData('runnerType', runnerType)
    
    // Spawn animation - dramatic entrance
    sprite.setScale(0)
    sprite.setAlpha(0)
    this.tweens.add({
      targets: sprite,
      alpha: 1,
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut'
    })
    
    // Boss has 5 health, Tank has 2, others have 1
    let health = 1
    if (runnerType === 'BOSS') health = 5
    else if (runnerType === 'TANK') health = 2
    
    this.runners.push({ 
      sprite, 
      speed, 
      health,
      type: runnerType,
      zigzagPhase: Math.random() * Math.PI * 2,
    })
    this.runnersThisWave++
  }

  update(time: number, delta: number): void {
    if (this.isGameOver || this.isPaused) return
    
    const store = useGameStore.getState()
    const currentWaveDuration = getWaveDuration(store.wave)
    
    this.waveTimer += delta
    this.updateTimerBar(store.wave)
    
    const spawnInterval = Math.max(MIN_SPAWN_INTERVAL, BASE_SPAWN_INTERVAL - (store.wave * SPAWN_REDUCTION_PER_WAVE))
    this.spawnTimer += delta
    
    // Performance optimization: Cap max runners on screen to prevent freezing
    const maxRunners = 20 + Math.floor(store.wave * 2) // Scales with wave but has reasonable cap
    const currentRunners = this.runners.length
    
    if (this.spawnTimer >= spawnInterval && this.waveTimer < currentWaveDuration && currentRunners < maxRunners) {
      // Limit burst count to prevent performance issues
      const burstCount = Math.min(3, 1 + Math.floor(store.wave / 4)) // Reduced from 4 to 3, slower scaling
      const runnersToSpawn = Math.min(burstCount, maxRunners - currentRunners)
      
      for (let i = 0; i < runnersToSpawn; i++) {
        this.spawnRunner()
      }
      this.spawnTimer = 0
    }
    
    this.updatePlayerDefender(delta)
    this.updateAIDefenders(delta)
    this.updateRunners(delta)
    this.updateMegaphone(delta)
    this.checkCollisions()
    this.checkMegaphoneCollision()
    
    if (this.waveTimer >= currentWaveDuration && this.runners.length === 0) {
      this.completeWave()
    }
    
    // Update UI
    const scoreValue = this.children.getByName('scoreValue') as Phaser.GameObjects.Text
    if (scoreValue) scoreValue.setText(store.score.toLocaleString())
    
    const waveValue = this.children.getByName('waveValue') as Phaser.GameObjects.Text
    if (waveValue) {
      if (this.isCampaignMode) {
        waveValue.setText(`${store.wave}/${this.maxWaves}`)
      } else {
        waveValue.setText(`${store.wave}`)
      }
    }
    
    // Update combo decay
    if (time - this.lastTackleTime > 2000 && this.comboCount > 0) {
      this.comboCount = 0
      this.consecutiveTackles = 0
      this.tweens.add({
        targets: this.comboText,
        alpha: 0,
        duration: 200
      })
    }
    
    // Update fan meter display
    this.updateFanMeterDisplay()
  }

  private updateTimerBar(wave: number): void {
    const waveDuration = getWaveDuration(wave)
    const progress = Math.min(1, this.waveTimer / waveDuration)
    const width = (GAME_WIDTH - 40) * progress
    
    this.timerBar.clear()
    
    // Gradient effect
    const color = progress < 0.7 ? COLORS.green : (progress < 0.9 ? COLORS.gold : COLORS.dlRed)
    this.timerBar.fillStyle(color, 1)
    this.timerBar.fillRoundedRect(20, 52, width, 8, 4)
    
    // Shine
    this.timerBar.fillStyle(0xffffff, 0.2)
    this.timerBar.fillRoundedRect(20, 52, width, 3, { tl: 4, tr: 4, bl: 0, br: 0 })
  }

  private updatePlayerDefender(delta: number): void {
    const player = this.defenders.find(d => d.isPlayer)
    if (!player) return
    
    const speed = DEFENDER_SPEED * this.stats.speedMultiplier * (delta / 1000)
    const dx = this.pointer.x - player.sprite.x
    const dy = this.pointer.y - player.sprite.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    
    if (dist > 5) {
      const moveX = (dx / dist) * Math.min(speed, dist)
      const moveY = (dy / dist) * Math.min(speed, dist)
      
      player.sprite.x += moveX
      player.sprite.y += moveY
      
      player.sprite.x = Phaser.Math.Clamp(player.sprite.x, DEFENDER_RADIUS, GAME_WIDTH - DEFENDER_RADIUS)
      player.sprite.y = Phaser.Math.Clamp(player.sprite.y, DEFENDER_MIN_Y, GAME_HEIGHT - DEFENDER_RADIUS)
    }
    
    // Update tackle radius indicator
    const tackleRadiusIndicator = player.sprite.getByName('tackleRadius') as Phaser.GameObjects.Graphics
    if (tackleRadiusIndicator) {
      tackleRadiusIndicator.clear()
      tackleRadiusIndicator.lineStyle(1, COLORS.green, 0.15)
      tackleRadiusIndicator.strokeCircle(0, 0, DEFENDER_RADIUS * this.stats.tackleRadiusMultiplier + RUNNER_RADIUS)
    }
  }

  private updateAIDefenders(delta: number): void {
    const aiDefenders = this.defenders.filter(d => !d.isPlayer)
    
    // Performance optimization: Stagger AI updates across frames
    const frameIndex = Math.floor(Date.now() / 50) % 3
    
    aiDefenders.forEach((defender, index) => {
      // Only update 1/3 of defenders each frame cycle for performance
      if (index % 3 !== frameIndex) return
      if (Math.random() > 0.8) return // Slightly reduced update frequency
      
      let targetRunner: Runner | undefined = undefined
      
      if (this.runners.length > 0) {
        const runnerIndex = index % this.runners.length
        targetRunner = this.runners[runnerIndex]
        
        if (targetRunner && targetRunner.sprite.y < GAME_HEIGHT * 0.3) {
          targetRunner = undefined
        }
      }
      
      if (targetRunner !== undefined) {
        const speed = AI_DEFENDER_SPEED * this.stats.speedMultiplier * (delta / 1000)
        const dx = targetRunner.sprite.x - defender.sprite.x
        const dy = targetRunner.sprite.y - defender.sprite.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        
        if (dist > 20) {
          const wobbleX = (Math.random() - 0.5) * 0.3
          const wobbleY = (Math.random() - 0.5) * 0.3
          
          defender.sprite.x += ((dx / dist) + wobbleX) * speed
          defender.sprite.y += ((dy / dist) + wobbleY) * speed
          
          defender.sprite.x = Phaser.Math.Clamp(defender.sprite.x, DEFENDER_RADIUS, GAME_WIDTH - DEFENDER_RADIUS)
          defender.sprite.y = Phaser.Math.Clamp(defender.sprite.y, DEFENDER_MIN_Y, GAME_HEIGHT - DEFENDER_RADIUS)
        }
      } else {
        const patrolY = GAME_HEIGHT - 120
        const patrolX = GAME_WIDTH / 2 + Math.sin(Date.now() * 0.001 + index) * 100
        
        const dx = patrolX - defender.sprite.x
        const dy = patrolY - defender.sprite.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        
        if (dist > 30) {
          const speed = (AI_DEFENDER_SPEED * 0.5) * (delta / 1000)
          defender.sprite.x += (dx / dist) * speed
          defender.sprite.y += (dy / dist) * speed
        }
      }
    })
  }

  private updateRunners(delta: number): void {
    const { wave } = useGameStore.getState()
    
    for (let i = this.runners.length - 1; i >= 0; i--) {
      const runner = this.runners[i]
      if (!runner || !runner.sprite) continue
      const radius = runner.sprite.getData('radius') || RUNNER_RADIUS
      
      runner.sprite.y += runner.speed * (delta / 1000)
      
      let horizontalMove = 0
      
      if (runner.type === 'ZIGZAG') {
        runner.zigzagPhase += delta * 0.006
        horizontalMove = Math.sin(runner.zigzagPhase) * 4
      } else if (runner.type === 'FAST') {
        horizontalMove = Math.sin(runner.sprite.y * 0.03) * 2
      } else {
        horizontalMove = Math.sin(runner.sprite.y * 0.02) * 0.5
      }
      
      if (wave >= 3) {
        const nearestDefender = this.findNearestDefender(runner.sprite.x, runner.sprite.y)
        
        if (nearestDefender) {
          const dx = runner.sprite.x - nearestDefender.sprite.x
          const dy = runner.sprite.y - nearestDefender.sprite.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          
          const dodgeRange = 80 + (wave * 5)
          
          if (dist < dodgeRange && dist > 0) {
            const dodgeStrength = Math.min(3, 0.5 + (wave * 0.15))
            const dodgeDir = dx > 0 ? 1 : -1
            horizontalMove += dodgeDir * dodgeStrength * (1 - dist / dodgeRange)
            
            if (wave >= 6 && dist < dodgeRange * 0.5) {
              runner.sprite.y += runner.speed * 0.3 * (delta / 1000)
            }
          }
        }
      }
      
      // Performance optimization: Only calculate runner-to-runner avoidance occasionally
      // and only for a subset of runners to prevent O(n²) performance issues
      if (wave >= 8 && i % 3 === 0 && this.runners.length < 30) {
        // Sample only nearby runners instead of all runners
        const nearbyRunners = this.runners.slice(Math.max(0, i - 5), Math.min(this.runners.length, i + 5))
        for (const other of nearbyRunners) {
          if (other === runner) continue
          const ox = runner.sprite.x - other.sprite.x
          const oy = runner.sprite.y - other.sprite.y
          const oDist = Math.sqrt(ox * ox + oy * oy)
          
          if (oDist < 40 && oDist > 0) {
            horizontalMove += (ox / oDist) * 0.5
          }
        }
      }
      
      runner.sprite.x += horizontalMove
      runner.sprite.x = Phaser.Math.Clamp(runner.sprite.x, radius + 10, GAME_WIDTH - radius - 10)
      
      if (runner.sprite.y > GAME_HEIGHT + radius) {
        this.runnerScored(runner)
      }
    }
  }
  
  private findNearestDefender(x: number, y: number): Defender | null {
    let nearest: Defender | null = null
    let nearestDist = Infinity
    
    for (const defender of this.defenders) {
      const dx = x - defender.sprite.x
      const dy = y - defender.sprite.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      
      if (dist < nearestDist) {
        nearestDist = dist
        nearest = defender
      }
    }
    
    return nearest
  }

  private checkCollisions(): void {
    for (let i = this.runners.length - 1; i >= 0; i--) {
      const runner = this.runners[i]
      const runnerRadius = runner.sprite.getData('radius') || RUNNER_RADIUS
      const tackleRadius = DEFENDER_RADIUS * this.stats.tackleRadiusMultiplier + runnerRadius
      
      for (const defender of this.defenders) {
        const dx = defender.sprite.x - runner.sprite.x
        const dy = defender.sprite.y - runner.sprite.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        
        if (dist < tackleRadius) {
          this.hitRunner(runner, defender)
          break
        }
      }
    }
  }
  
  private hitRunner(runner: Runner, defender: Defender): void {
    runner.health--
    
    if (runner.health <= 0) {
      this.tackleRunner(runner, defender)
    } else {
      this.cameras.main.shake(20, 0.002)
      
      this.tweens.add({
        targets: runner.sprite,
        alpha: 0.5,
        duration: 100,
        yoyo: true,
      })
      
      this.showFloatingPoints(runner.sprite.x, runner.sprite.y - 20, 5, COLORS.gold)
      useGameStore.getState().addScore(5)
    }
  }

  private tackleRunner(runner: Runner, defender: Defender): void {
    const store = useGameStore.getState()
    const typeDef = RUNNER_TYPES[runner.type]
    const now = Date.now()
    
    // Remove runner
    const index = this.runners.indexOf(runner)
    if (index !== -1) {
      this.runners.splice(index, 1)
    }
    
    // Combo system
    if (now - this.lastTackleTime < 2000) {
      this.comboCount++
      this.consecutiveTackles++
      if (this.comboCount >= 2) {
        this.showCombo(this.comboCount)
      }
    } else {
      this.comboCount = 1
      this.consecutiveTackles = 1
    }
    this.lastTackleTime = now
    
    // 12th Man (Fan Meter) building - only after wave 3
    if (store.wave >= 3 && !this.fanMeterReady && !this.fanMeterCooldown && !this.megaphone) {
      // Build meter faster with consecutive tackles
      const meterGain = 5 + Math.min(10, this.consecutiveTackles * 2)
      this.fanMeter = Math.min(100, this.fanMeter + meterGain)
      
      // Play pulse sound at certain thresholds
      if (this.fanMeter >= 50 && this.fanMeter - meterGain < 50) {
        AudioManager.playFanMeterPulse()
      }
      if (this.fanMeter >= 75 && this.fanMeter - meterGain < 75) {
        AudioManager.playFanMeterPulse()
      }
      
      // Check if meter is full - spawn megaphone!
      if (this.fanMeter >= 100) {
        this.fanMeterReady = true
        AudioManager.playFanMeterPulse()
        
        // Light haptic to indicate megaphone spawning
        if (navigator.vibrate) {
          navigator.vibrate([50, 30, 50])
        }
        
        // Spawn the megaphone power-up!
        this.spawnMegaphone()
      }
    }
    
    // Effects
    const shakeIntensity = runner.type === 'TANK' ? 0.006 : 0.003
    this.cameras.main.shake(30, shakeIntensity)
    this.createPremiumTackleEffect(runner.sprite.x, runner.sprite.y, typeDef.color)
    
    // Sound
    if (runner.type === 'BOSS') {
      AudioManager.playBigTackle()
      AudioManager.playCrowdRoar() // Boss takedown gets a roar!
    } else if (runner.type === 'TANK') {
      AudioManager.playBigTackle()
    } else {
      AudioManager.playTackle()
    }
    
    // Add crowd cheer for big combos in campaign mode
    if (this.isCampaignMode && this.comboCount >= 3) {
      AudioManager.playCrowdCheer()
    }
    
    // Score with combo multiplier
    const comboMultiplier = Math.min(3, 1 + (this.comboCount - 1) * 0.5)
    const points = Math.floor(typeDef.points * comboMultiplier)
    
    this.showFloatingPoints(runner.sprite.x, runner.sprite.y, points, COLORS.green)
    
    runner.sprite.destroy()
    
    store.addTackle()
    store.addScore(points)
    
    this.waveKills++
    this.killsText.setText(`TACKLES: ${this.waveKills}`)
  }
  
  private showCombo(count: number): void {
    this.comboText.setText(`${count}x COMBO!`)
    this.comboText.setAlpha(1)
    this.comboText.setScale(0.5)
    
    this.tweens.add({
      targets: this.comboText,
      scale: 1.2,
      duration: 150,
      yoyo: true,
      ease: 'Back.easeOut'
    })
  }
  
  private showFloatingPoints(x: number, y: number, points: number, color: number): void {
    const text = this.add.text(x, y, `+${points}`, {
      fontSize: '20px',
      color: hexToCSS(color),
      fontFamily: FONTS.display,
      stroke: hexToCSS(COLORS.navy),
      strokeThickness: 3,
    })
    text.setOrigin(0.5)
    
    this.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      scale: 1.3,
      duration: 700,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    })
  }

  private createPremiumTackleEffect(x: number, y: number, color: number): void {
    // Burst particles
    for (let i = 0; i < 12; i++) {
      const particle = this.add.graphics()
      const particleColor = i % 3 === 0 ? COLORS.green : (i % 3 === 1 ? color : COLORS.white)
      particle.fillStyle(particleColor, 1)
      particle.fillCircle(0, 0, 2 + Math.random() * 3)
      particle.setPosition(x, y)
      
      const angle = (i / 12) * Math.PI * 2
      const distance = 40 + Math.random() * 20
      
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        scale: 0.3,
        duration: 400,
        ease: 'Power2',
        onComplete: () => particle.destroy(),
      })
    }
    
    // Impact ring
    const ring = this.add.graphics()
    ring.lineStyle(4, COLORS.green, 1)
    ring.strokeCircle(x, y, 15)
    
    this.tweens.add({
      targets: ring,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => ring.destroy(),
    })
    
    // Flash
    const flash = this.add.graphics()
    flash.fillStyle(0xffffff, 0.3)
    flash.fillCircle(x, y, 30)
    
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2,
      duration: 200,
      onComplete: () => flash.destroy(),
    })
  }

  private runnerScored(runner: Runner): void {
    const index = this.runners.indexOf(runner)
    if (index !== -1) {
      this.runners.splice(index, 1)
    }
    runner.sprite.destroy()
    
    this.stats.lives--
    this.updateLivesDisplay()
    
    AudioManager.playTouchdown()
    this.cameras.main.flash(200, 255, 0, 0)
    
    if (this.stats.lives <= 0) {
      this.gameOver()
    }
  }

  private updateLivesDisplay(): void {
    this.livesContainer.removeAll(true)
    
    const totalWidth = this.stats.lives * 22
    const startX = -totalWidth / 2 + 11
    
    for (let i = 0; i < this.stats.lives; i++) {
      const heart = this.add.text(startX + i * 22, 0, '❤️', { fontSize: '16px' })
      heart.setOrigin(0.5)
      this.livesContainer.add(heart)
    }
  }

  private completeWave(): void {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5051b6de-b0ce-411d-bf90-110293cecd7e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GameScene.ts:completeWave',message:'Wave complete called',data:{wave:useGameStore.getState().wave,runnersLength:this.runners.length,defendersLength:this.defenders.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    this.isPaused = true
    const store = useGameStore.getState()
    
    AudioManager.playWaveComplete()
    store.addScore(100)
    
    // Check if this is the final wave in campaign mode
    if (this.isCampaignMode && store.wave >= this.maxWaves) {
      this.campaignGameWon()
      return
    }
    
    store.incrementWave()
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5051b6de-b0ce-411d-bf90-110293cecd7e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GameScene.ts:completeWave:afterIncrement',message:'After wave increment',data:{newWave:store.wave,score:store.score},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    this.showUpgradeSelection()
  }
  
  private campaignGameWon(): void {
    const store = useGameStore.getState()
    const previousStageId = store.campaign.currentStageId
    
    // Record the win
    store.winCampaignGame()
    
    // Check if we just unlocked a new stage
    const newStageId = store.campaign.currentStageId
    if (newStageId !== previousStageId) {
      // Flag for map scene to show celebration
      this.registry.set('justUnlockedStage', true)
    }
    
    // Big celebration
    AudioManager.playWaveComplete()
    this.cameras.main.flash(500, 105, 190, 40) // Green flash
    
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200])
    }
    
    // Show victory screen
    this.showCampaignVictory()
  }
  
  private showCampaignVictory(): void {
    const store = useGameStore.getState()
    
    // Overlay
    const overlay = this.add.graphics()
    overlay.fillStyle(0x000000, 0.85)
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    overlay.setAlpha(0)
    
    this.tweens.add({
      targets: overlay,
      alpha: 1,
      duration: 400
    })
    
    // Victory container
    const container = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2)
    
    // Check if this was the Super Bowl
    const isSuperBowlVictory = store.campaign.superBowlWon
    
    // Check if we just completed a stage (games won is divisible by 3)
    const isStageComplete = store.campaign.gamesWon % GAMES_PER_STAGE === 0
    const nextStage = isStageComplete ? getStageByGame(store.campaign.currentGame) : null
    
    // Big text - different for stage complete
    let mainLabel = 'VICTORY!'
    let mainColor = COLORS.green
    let mainSize = '42px'
    
    if (isSuperBowlVictory) {
      mainLabel = '🏆 SUPER BOWL\nCHAMPION! 🏆'
      mainColor = COLORS.gold
      mainSize = '32px'
    } else if (isStageComplete) {
      mainLabel = '🎉 STAGE\nCOMPLETE! 🎉'
      mainColor = COLORS.gold
      mainSize = '32px'
    }
    
    const mainText = this.add.text(0, -80, mainLabel, {
      fontSize: mainSize,
      color: hexToCSS(mainColor),
      fontFamily: FONTS.display,
      align: 'center',
      lineSpacing: 10,
    })
    mainText.setOrigin(0.5)
    container.add(mainText)
    
    // Score
    const scoreText = this.add.text(0, 0, `SCORE: ${store.score.toLocaleString()}`, {
      fontSize: '24px',
      color: hexToCSS(COLORS.white),
      fontFamily: FONTS.display,
    })
    scoreText.setOrigin(0.5)
    container.add(scoreText)
    
    // Stage progress / next destination
    if (!isSuperBowlVictory && this.currentStage) {
      let progressLabel = ''
      let progressColor = COLORS.grey
      
      if (isStageComplete && nextStage) {
        progressLabel = `Next: ${nextStage.location.city.toUpperCase()}`
        progressColor = COLORS.green
        
        // Show stage completion bonus
        const bonusText = this.add.text(0, 70, '+500 STAGE BONUS!', {
          fontSize: '18px',
          color: hexToCSS(COLORS.gold),
          fontFamily: FONTS.display,
        })
        bonusText.setOrigin(0.5)
        bonusText.setScale(0)
        container.add(bonusText)
        
        this.tweens.add({
          targets: bonusText,
          scale: 1.2,
          duration: 300,
          delay: 500,
          ease: 'Back.easeOut',
          onComplete: () => {
            this.tweens.add({
              targets: bonusText,
              scale: 1,
              duration: 200
            })
          }
        })
        
        // Add bonus score
        store.addScore(500)
      } else {
        const gamesRemaining = GAMES_PER_STAGE - (store.campaign.gamesWon % GAMES_PER_STAGE)
        progressLabel = `${gamesRemaining} game${gamesRemaining > 1 ? 's' : ''} to next stage`
      }
      
      const progressText = this.add.text(0, 40, progressLabel, {
        fontSize: '14px',
        color: hexToCSS(progressColor),
        fontFamily: FONTS.body,
      })
      progressText.setOrigin(0.5)
      container.add(progressText)
    }
    
    // Add celebration effects for stage complete
    if (isStageComplete && !isSuperBowlVictory) {
      this.createStageCelebration()
      AudioManager.playVictoryFanfare()
    }
    
    // Super Bowl victory gets extra fanfare
    if (isSuperBowlVictory) {
      AudioManager.playVictoryFanfare()
      AudioManager.playCrowdRoar()
    }
    
    // Continue button
    const continueBtn = this.add.container(0, 120)
    
    const btnBg = this.add.graphics()
    btnBg.fillStyle(COLORS.green, 1)
    btnBg.fillRoundedRect(-80, -22, 160, 44, 12)
    continueBtn.add(btnBg)
    
    const btnText = this.add.text(0, 0, isSuperBowlVictory ? 'CELEBRATE!' : 'CONTINUE', {
      fontSize: '18px',
      color: hexToCSS(COLORS.navy),
      fontFamily: FONTS.display,
    })
    btnText.setOrigin(0.5)
    continueBtn.add(btnText)
    
    continueBtn.setSize(160, 44)
    continueBtn.setInteractive({ useHandCursor: true })
    
    continueBtn.on('pointerup', () => {
      AudioManager.playClick()
      this.cameras.main.fadeOut(400)
      this.time.delayedCall(400, () => {
        if (isSuperBowlVictory) {
          // Go to the ultimate Super Bowl celebration scene!
          this.scene.start('SuperBowlScene')
        } else {
          // Back to map to continue journey
          this.scene.start('MapScene')
        }
      })
    })
    
    container.add(continueBtn)
    
    // Animate in
    container.setScale(0)
    this.tweens.add({
      targets: container,
      scale: 1,
      duration: 500,
      delay: 300,
      ease: 'Back.easeOut'
    })
    
    // Confetti effect for Super Bowl
    if (isSuperBowlVictory) {
      this.createConfettiEffect()
    }
  }
  
  private showBossIntro(): void {
    if (this.bossSpawned) return
    this.bossSpawned = true
    
    // Dramatic boss intro
    const centerX = GAME_WIDTH / 2
    const centerY = GAME_HEIGHT / 2
    
    // Play boss warning sound
    AudioManager.playBossWarning()
    
    // Screen shake
    this.cameras.main.shake(500, 0.02)
    
    // Flash to red
    this.cameras.main.flash(200, 150, 50, 50)
    
    // Warning container
    const warningContainer = this.add.container(centerX, centerY - 50)
    
    const warningBg = this.add.graphics()
    warningBg.fillStyle(0x800000, 0.9)
    warningBg.fillRoundedRect(-150, -40, 300, 80, 12)
    warningBg.lineStyle(3, 0xFFD700, 1)
    warningBg.strokeRoundedRect(-150, -40, 300, 80, 12)
    
    const warningText = this.add.text(0, -10, '👑 BOSS WAVE 👑', {
      fontSize: '28px',
      color: '#FFD700',
      fontFamily: FONTS.display,
    })
    warningText.setOrigin(0.5)
    
    const bossName = this.currentStage?.visuals.opponent.name || 'ELITE RUNNER'
    const bossSubtext = this.add.text(0, 20, bossName.toUpperCase(), {
      fontSize: '14px',
      color: '#FFFFFF',
      fontFamily: FONTS.body,
    })
    bossSubtext.setOrigin(0.5)
    
    warningContainer.add([warningBg, warningText, bossSubtext])
    warningContainer.setScale(0)
    warningContainer.setDepth(1000)
    
    // Animate warning
    this.tweens.add({
      targets: warningContainer,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Pulse
        this.tweens.add({
          targets: warningContainer,
          scale: 1.05,
          duration: 200,
          yoyo: true,
          repeat: 2,
          onComplete: () => {
            this.tweens.add({
              targets: warningContainer,
              alpha: 0,
              y: warningContainer.y - 30,
              duration: 400,
              delay: 200,
              onComplete: () => {
                warningContainer.destroy()
                // Spawn the boss
                this.spawnRunner(true)
                this.bossCount++
                
                // Maybe spawn additional bosses for super bowl
                if (this.currentStage?.isSuperBowl && this.bossCount < 2) {
                  this.time.delayedCall(3000, () => this.spawnRunner(true))
                }
              }
            })
          }
        })
      }
    })
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200])
    }
  }
  
  private createStageCelebration(): void {
    // Burst of particles from center
    const centerX = GAME_WIDTH / 2
    const centerY = GAME_HEIGHT / 2
    
    // Firework-style bursts
    for (let burst = 0; burst < 3; burst++) {
      this.time.delayedCall(burst * 300, () => {
        const burstX = centerX + (Math.random() - 0.5) * 200
        const burstY = centerY - 100 + (Math.random() - 0.5) * 100
        
        // Create burst particles
        for (let i = 0; i < 20; i++) {
          const particle = this.add.graphics()
          const color = [COLORS.green, COLORS.gold, COLORS.white][Math.floor(Math.random() * 3)]
          particle.fillStyle(color, 1)
          particle.fillCircle(0, 0, 2 + Math.random() * 3)
          particle.setPosition(burstX, burstY)
          
          const angle = (i / 20) * Math.PI * 2
          const distance = 50 + Math.random() * 80
          
          this.tweens.add({
            targets: particle,
            x: burstX + Math.cos(angle) * distance,
            y: burstY + Math.sin(angle) * distance + 50, // Gravity
            alpha: 0,
            scale: 0.3,
            duration: 800,
            ease: 'Power2',
            onComplete: () => particle.destroy()
          })
        }
      })
    }
    
    // Screen flash
    this.cameras.main.flash(300, 255, 215, 0) // Gold flash
    
    // Haptic celebration
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200])
    }
  }
  
  private createConfettiEffect(): void {
    const colors = [COLORS.green, COLORS.gold, COLORS.white, 0xff69b4, 0x00bfff]
    
    for (let i = 0; i < 100; i++) {
      const confetti = this.add.graphics()
      const color = colors[Math.floor(Math.random() * colors.length)]
      confetti.fillStyle(color, 1)
      confetti.fillRect(0, 0, 4 + Math.random() * 4, 8 + Math.random() * 8)
      
      confetti.setPosition(Math.random() * GAME_WIDTH, -20 - Math.random() * 200)
      confetti.setRotation(Math.random() * Math.PI * 2)
      
      this.tweens.add({
        targets: confetti,
        y: GAME_HEIGHT + 50,
        x: confetti.x + (Math.random() - 0.5) * 200,
        rotation: confetti.rotation + Math.PI * 4 * (Math.random() > 0.5 ? 1 : -1),
        duration: 3000 + Math.random() * 2000,
        delay: Math.random() * 1000,
        repeat: -1,
        onRepeat: () => {
          confetti.x = Math.random() * GAME_WIDTH
          confetti.y = -20
        }
      })
    }
  }

  private showUpgradeSelection(): void {
    // Overlay
    const overlay = this.add.graphics()
    overlay.fillStyle(0x000000, 0.85)
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    overlay.setAlpha(0)
    
    this.tweens.add({
      targets: overlay,
      alpha: 1,
      duration: 300
    })
    
    // Title
    const title = this.add.text(GAME_WIDTH / 2, 70, 'CHOOSE UPGRADE', {
      fontSize: '26px',
      color: hexToCSS(COLORS.white),
      fontFamily: FONTS.display,
      letterSpacing: 2,
    })
    title.setOrigin(0.5)
    title.setAlpha(0)
    
    const subtitle = this.add.text(GAME_WIDTH / 2, 100, 'Power up your defense', {
      fontSize: '12px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
    })
    subtitle.setOrigin(0.5)
    subtitle.setAlpha(0)
    
    this.tweens.add({
      targets: [title, subtitle],
      alpha: 1,
      y: '-=10',
      duration: 400,
      delay: 200
    })
    
    // Get 3 random upgrades
    const upgradeTypes = Object.keys(UPGRADES) as UpgradeType[]
    const shuffled = upgradeTypes.sort(() => Math.random() - 0.5)
    const choices = shuffled.slice(0, 3)
    
    const cards: Phaser.GameObjects.Container[] = []
    
    choices.forEach((type, index) => {
      const upgrade = UPGRADES[type]
      const y = 180 + index * 160
      
      const card = this.createPremiumUpgradeCard(GAME_WIDTH / 2, y, upgrade, index, () => {
        AudioManager.playUpgrade()
        this.applyUpgrade(upgrade.type)
        
        // Clean up
        overlay.destroy()
        title.destroy()
        subtitle.destroy()
        cards.forEach(c => c.destroy())
        
        this.startWave()
      })
      
      cards.push(card)
    })
  }

  private createPremiumUpgradeCard(x: number, y: number, upgrade: Upgrade, index: number, callback: () => void): Phaser.GameObjects.Container {
    const width = 340
    const height = 120
    
    // Card background with gradient
    const bg = this.add.graphics()
    bg.fillStyle(COLORS.navyLight, 0.9)
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 16)
    bg.lineStyle(2, upgrade.color, 0.8)
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 16)
    
    // Left accent bar
    const accent = this.add.graphics()
    accent.fillStyle(upgrade.color, 1)
    accent.fillRoundedRect(-width / 2, -height / 2, 8, height, { tl: 16, bl: 16, tr: 0, br: 0 })
    
    // Icon container
    const iconBg = this.add.graphics()
    iconBg.fillStyle(upgrade.color, 0.2)
    iconBg.fillCircle(-width / 2 + 55, 0, 35)
    
    const icon = this.add.text(-width / 2 + 55, 0, upgrade.icon, { fontSize: '36px' })
    icon.setOrigin(0.5)
    
    // Text
    const name = this.add.text(-width / 2 + 110, -15, upgrade.name.toUpperCase(), {
      fontSize: '20px',
      color: hexToCSS(COLORS.white),
      fontFamily: FONTS.display,
    })
    
    const desc = this.add.text(-width / 2 + 110, 15, upgrade.description, {
      fontSize: '14px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
    })
    
    // Select indicator
    const selectArrow = this.add.text(width / 2 - 30, 0, '→', {
      fontSize: '24px',
      color: hexToCSS(upgrade.color),
      fontFamily: FONTS.display,
    })
    selectArrow.setOrigin(0.5)
    selectArrow.setAlpha(0.5)
    
    const container = this.add.container(x, y, [bg, accent, iconBg, icon, name, desc, selectArrow])
    container.setSize(width, height)
    
    // IMPORTANT: Don't make interactive immediately - add delay to prevent accidental selection
    // This fixes the bug where user's finger position triggers immediate selection
    container.disableInteractive()
    
    // Entrance animation
    container.setAlpha(0)
    container.setX(x + 50)
    
    this.tweens.add({
      targets: container,
      alpha: 1,
      x: x,
      duration: 400,
      delay: 300 + index * 100,
      ease: 'Power2',
      onComplete: () => {
        // Enable interaction only after animation completes + additional delay
        this.time.delayedCall(300, () => {
          container.setInteractive({ useHandCursor: true })
        })
      }
    })
    
    // Hover effects
    container.on('pointerover', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1.03,
        scaleY: 1.03,
        duration: 150
      })
      
      bg.clear()
      bg.fillStyle(COLORS.navyLight, 1)
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 16)
      bg.lineStyle(3, upgrade.color, 1)
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 16)
      
      selectArrow.setAlpha(1)
      
      this.tweens.add({
        targets: selectArrow,
        x: width / 2 - 25,
        duration: 150
      })
    })
    
    container.on('pointerout', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 150
      })
      
      bg.clear()
      bg.fillStyle(COLORS.navyLight, 0.9)
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 16)
      bg.lineStyle(2, upgrade.color, 0.8)
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 16)
      
      selectArrow.setAlpha(0.5)
      selectArrow.x = width / 2 - 30
    })
    
    container.on('pointerdown', () => container.setScale(0.98))
    container.on('pointerup', callback)
    
    return container
  }

  private applyUpgrade(type: UpgradeType): void {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5051b6de-b0ce-411d-bf90-110293cecd7e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GameScene.ts:applyUpgrade',message:'Applying upgrade',data:{type,statsBefore:{...this.stats},wave:useGameStore.getState().wave},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    switch (type) {
      case 'ADD_DEFENDER':
        this.stats.defenderCount++
        this.addAIDefender()
        break
      case 'SPEED_BOOST':
        this.stats.speedMultiplier *= 1.2
        break
      case 'TACKLE_RADIUS':
        this.stats.tackleRadiusMultiplier *= 1.15
        break
      case 'EXTRA_LIFE':
        this.stats.lives++
        this.updateLivesDisplay()
        break
      case 'HAZY_IPA':
        this.stats.enemySpeedMultiplier *= 0.8
        break
      case 'WATERMELON':
        this.stats.lives += 2
        this.updateLivesDisplay()
        break
      case 'LEMON_LIME':
        this.stats.speedMultiplier *= 1.3
        break
      case 'BLOOD_ORANGE':
        this.stats.tackleRadiusMultiplier *= 1.25
        break
    }
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5051b6de-b0ce-411d-bf90-110293cecd7e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GameScene.ts:applyUpgrade:after',message:'After upgrade applied',data:{type,statsAfter:{...this.stats}},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    
    this.updateStatsDisplay()
    
    // Upgrade applied text
    const text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'UPGRADED!', {
      fontSize: '32px',
      color: hexToCSS(COLORS.green),
      fontFamily: FONTS.display,
    })
    text.setOrigin(0.5)
    text.setScale(0)
    
    this.tweens.add({
      targets: text,
      scale: 1.2,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: text,
          alpha: 0,
          y: text.y - 40,
          duration: 400,
          delay: 200,
          onComplete: () => text.destroy()
        })
      }
    })
  }

  private gameOver(): void {
    // #region agent log
    const storeState = useGameStore.getState();
    fetch('http://127.0.0.1:7242/ingest/5051b6de-b0ce-411d-bf90-110293cecd7e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GameScene.ts:gameOver',message:'GameOver called',data:{wave:storeState.wave,score:storeState.score,lives:storeState.lives,tackles:storeState.tackles},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    this.isGameOver = true
    
    AudioManager.playGameOver()
    
    this.runners.forEach(r => r.sprite.destroy())
    this.runners = []
    
    // Clean up megaphone if present
    if (this.megaphone) {
      this.megaphone.sprite.destroy()
      this.megaphone = null
    }
    
    // Handle campaign mode loss
    if (this.isCampaignMode) {
      useGameStore.getState().loseCampaignGame()
    }
    
    this.cameras.main.fadeOut(600)
    this.time.delayedCall(600, () => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5051b6de-b0ce-411d-bf90-110293cecd7e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GameScene.ts:gameOver:beforeSceneStart',message:'About to start GameOverScene',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      this.scene.start('GameOverScene', { isCampaignMode: this.isCampaignMode })
    })
  }
}
