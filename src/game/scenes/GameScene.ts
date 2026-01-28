import * as Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONTS, hexToCSS, getPositionGroupColor } from '../config/phaserConfig'
import { useGameStore } from '../../store/gameStore'
import { AudioManager } from '../systems/AudioManager'
import { FULL_ROSTER } from '../data/roster'

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

type RunnerType = 'NORMAL' | 'FAST' | 'TANK' | 'ZIGZAG'

interface RunnerDef {
  type: RunnerType
  speedMult: number
  size: number
  points: number
  color: number
  icon: string
}

const RUNNER_TYPES: Record<RunnerType, RunnerDef> = {
  NORMAL: { type: 'NORMAL', speedMult: 1, size: 1, points: 10, color: 0x888888, icon: '🏈' },
  FAST: { type: 'FAST', speedMult: 1.8, size: 0.8, points: 15, color: 0xFFB300, icon: '⚡' },
  TANK: { type: 'TANK', speedMult: 0.6, size: 1.4, points: 25, color: 0xE53935, icon: '🛡️' },
  ZIGZAG: { type: 'ZIGZAG', speedMult: 1.2, size: 1, points: 20, color: 0x69BE28, icon: '🌀' },
}

interface Runner {
  sprite: Phaser.GameObjects.Container
  speed: number
  health: number
  type: RunnerType
  zigzagPhase: number
}

export class GameScene extends Phaser.Scene {
  private defenders: Defender[] = []
  private runners: Runner[] = []
  
  // UI Elements
  private scoreText!: Phaser.GameObjects.Text
  private waveText!: Phaser.GameObjects.Text
  private livesContainer!: Phaser.GameObjects.Container
  private killsText!: Phaser.GameObjects.Text
  private statsText!: Phaser.GameObjects.Text
  private timerBar!: Phaser.GameObjects.Graphics
  private timerBg!: Phaser.GameObjects.Graphics
  private comboText!: Phaser.GameObjects.Text
  
  // Game state
  private isGameOver = false
  private isPaused = false
  private waveTimer = 0
  private spawnTimer = 0
  private runnersThisWave = 0
  private waveKills = 0
  private comboCount = 0
  private lastTackleTime = 0
  
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

  constructor() {
    super({ key: 'GameScene' })
  }

  create(): void {
    this.cameras.main.fadeIn(400)
    this.resetState()
    
    this.drawPremiumField()
    this.createAtmosphereEffects()
    this.createDefenders()
    this.createPremiumUI()
    this.setupInput()
    
    this.startWave()
  }

  private resetState(): void {
    this.defenders = []
    this.runners = []
    this.isGameOver = false
    this.isPaused = false
    this.waveTimer = 0
    this.spawnTimer = 0
    this.runnersThisWave = 0
    this.comboCount = 0
    this.lastTackleTime = 0
    
    this.stats = {
      speedMultiplier: 1,
      tackleRadiusMultiplier: 1,
      enemySpeedMultiplier: 1,
      defenderCount: 1,
      lives: STARTING_LIVES,
    }
    
    useGameStore.getState().startGame()
  }

  private drawPremiumField(): void {
    const graphics = this.add.graphics()
    
    // Rich turf gradient
    for (let y = 0; y < GAME_HEIGHT; y++) {
      const progress = y / GAME_HEIGHT
      const baseGreen = { r: 45, g: 90, b: 39 }
      const lightGreen = { r: 58, g: 114, b: 51 }
      
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
    // Floating particles for stadium atmosphere
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
    
    const waveValue = this.add.text(GAME_WIDTH - 15, 24, '1', {
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

  private setupInput(): void {
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.pointer.x = pointer.x
      this.pointer.y = pointer.y
    })
    
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      AudioManager.resume()
      this.pointer.x = pointer.x
      this.pointer.y = pointer.y
    })
  }

  private startWave(): void {
    this.waveTimer = 0
    this.spawnTimer = 0
    this.runnersThisWave = 0
    this.waveKills = 0
    this.isPaused = false
    
    this.killsText.setText('TACKLES: 0')
    
    const { wave } = useGameStore.getState()
    
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

  private spawnRunner(): void {
    const { wave } = useGameStore.getState()
    
    let runnerType: RunnerType = 'NORMAL'
    const roll = Math.random()
    const specialChance = Math.min(0.75, 0.2 + (wave * 0.05))
    
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
    
    if (wave >= 5 && this.runnersThisWave % 3 === 0) runnerType = 'TANK'
    if (wave >= 7 && this.runnersThisWave % 2 === 0) runnerType = 'FAST'
    
    const typeDef = RUNNER_TYPES[runnerType]
    
    const x = Phaser.Math.Between(40, GAME_WIDTH - 40)
    const y = -RUNNER_RADIUS
    
    const waveSpeed = Math.min(MAX_RUNNER_SPEED, BASE_RUNNER_SPEED + (wave * SPEED_PER_WAVE))
    const speed = waveSpeed * typeDef.speedMult * this.stats.enemySpeedMultiplier
    
    const radius = RUNNER_RADIUS * typeDef.size
    
    // Runner body with type-specific styling
    const body = this.add.graphics()
    body.fillStyle(typeDef.color, 1)
    body.fillCircle(0, 0, radius)
    
    // Border glow
    body.lineStyle(2, 0xffffff, 0.4)
    body.strokeCircle(0, 0, radius)
    
    // Type icon
    const icon = this.add.text(0, 0, typeDef.icon, { fontSize: `${10 + typeDef.size * 4}px` })
    icon.setOrigin(0.5)
    
    const sprite = this.add.container(x, y, [body, icon])
    sprite.setData('radius', radius)
    
    // Spawn animation
    sprite.setScale(0)
    this.tweens.add({
      targets: sprite,
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut'
    })
    
    this.runners.push({ 
      sprite, 
      speed, 
      health: runnerType === 'TANK' ? 2 : 1,
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
    
    if (this.spawnTimer >= spawnInterval && this.waveTimer < currentWaveDuration) {
      const burstCount = Math.min(4, 1 + Math.floor(store.wave / 3))
      for (let i = 0; i < burstCount; i++) {
        this.spawnRunner()
      }
      this.spawnTimer = 0
    }
    
    this.updatePlayerDefender(delta)
    this.updateAIDefenders(delta)
    this.updateRunners(delta)
    this.checkCollisions()
    
    if (this.waveTimer >= currentWaveDuration && this.runners.length === 0) {
      this.completeWave()
    }
    
    // Update UI
    const scoreValue = this.children.getByName('scoreValue') as Phaser.GameObjects.Text
    if (scoreValue) scoreValue.setText(store.score.toLocaleString())
    
    const waveValue = this.children.getByName('waveValue') as Phaser.GameObjects.Text
    if (waveValue) waveValue.setText(`${store.wave}`)
    
    // Update combo decay
    if (time - this.lastTackleTime > 2000 && this.comboCount > 0) {
      this.comboCount = 0
      this.tweens.add({
        targets: this.comboText,
        alpha: 0,
        duration: 200
      })
    }
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
      player.sprite.y = Phaser.Math.Clamp(player.sprite.y, 70, GAME_HEIGHT - DEFENDER_RADIUS)
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
    
    aiDefenders.forEach((defender, index) => {
      if (Math.random() > 0.7) return
      
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
          defender.sprite.y = Phaser.Math.Clamp(defender.sprite.y, 100, GAME_HEIGHT - DEFENDER_RADIUS)
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
      
      if (wave >= 8) {
        for (const other of this.runners) {
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
      if (this.comboCount >= 2) {
        this.showCombo(this.comboCount)
      }
    } else {
      this.comboCount = 1
    }
    this.lastTackleTime = now
    
    // Effects
    const shakeIntensity = runner.type === 'TANK' ? 0.006 : 0.003
    this.cameras.main.shake(30, shakeIntensity)
    this.createPremiumTackleEffect(runner.sprite.x, runner.sprite.y, typeDef.color)
    
    // Sound
    if (runner.type === 'TANK') {
      AudioManager.playBigTackle()
    } else {
      AudioManager.playTackle()
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
    this.isPaused = true
    const store = useGameStore.getState()
    
    AudioManager.playWaveComplete()
    store.addScore(100)
    store.incrementWave()
    
    this.showUpgradeSelection()
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
    container.setInteractive({ useHandCursor: true })
    
    // Entrance animation
    container.setAlpha(0)
    container.setX(x + 50)
    
    this.tweens.add({
      targets: container,
      alpha: 1,
      x: x,
      duration: 400,
      delay: 300 + index * 100,
      ease: 'Power2'
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
    this.isGameOver = true
    
    AudioManager.playGameOver()
    
    this.runners.forEach(r => r.sprite.destroy())
    this.runners = []
    
    this.cameras.main.fadeOut(600)
    this.time.delayedCall(600, () => {
      this.scene.start('GameOverScene')
    })
  }
}
