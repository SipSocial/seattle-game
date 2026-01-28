import * as Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, COLORS, FIELD_TOP, END_ZONE_Y } from '../config/phaserConfig'
import { useGameStore } from '../../store/gameStore'
import { AudioManager } from '../systems/AudioManager'

// ============================================
// VAMPIRE SURVIVORS STYLE - HORDE DEFENSE
// ============================================

// Game constants - SLOW AND FORGIVING
const DEFENDER_RADIUS = 28
const RUNNER_RADIUS = 14
const POWER_UP_RADIUS = 20

// Speeds - HARD MODE
const BASE_RUNNER_SPEED = 70 // Fast from the start
const SPEED_PER_WAVE = 10 // Aggressive scaling
const MAX_RUNNER_SPEED = 220 // High cap
const DEFENDER_SPEED = 350 // Player needs to be fast
const AI_DEFENDER_SPEED = 90 // AI is slow

// Wave settings - INTENSE
const BASE_SPAWN_INTERVAL = 900 // Fast spawns from start
const MIN_SPAWN_INTERVAL = 200 // Crazy fast at high waves
const SPAWN_REDUCTION_PER_WAVE = 50 // Gets harder quick

const BASE_WAVE_DURATION = 12000 // 12 seconds
const WAVE_DURATION_INCREASE = 1500 // +1.5s per wave
const MAX_WAVE_DURATION = 30000 // Cap at 30 seconds

const STARTING_LIVES = 4 // Fewer lives

// Calculate wave duration based on current wave
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
  ADD_DEFENDER: { type: 'ADD_DEFENDER', name: 'Teammate', description: '+1 AI Defender', color: 0x4ecdc4, icon: '🏈' },
  SPEED_BOOST: { type: 'SPEED_BOOST', name: 'Speed', description: '+20% Movement', color: 0xadff2f, icon: '⚡' },
  TACKLE_RADIUS: { type: 'TACKLE_RADIUS', name: 'Reach', description: '+15% Tackle Range', color: 0xff6b6b, icon: '💪' },
  EXTRA_LIFE: { type: 'EXTRA_LIFE', name: 'Life', description: '+1 Extra Life', color: 0xff69b4, icon: '❤️' },
  HAZY_IPA: { type: 'HAZY_IPA', name: 'Hazy IPA', description: 'Slow all enemies 20%', color: 0xf4a460, icon: '🍺' },
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

// Runner types for variety
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
  FAST: { type: 'FAST', speedMult: 1.8, size: 0.8, points: 15, color: 0xffff00, icon: '⚡' },
  TANK: { type: 'TANK', speedMult: 0.6, size: 1.4, points: 25, color: 0xff4444, icon: '🛡️' },
  ZIGZAG: { type: 'ZIGZAG', speedMult: 1.2, size: 1, points: 20, color: 0x44ff44, icon: '🌀' },
}

interface Runner {
  sprite: Phaser.GameObjects.Container
  speed: number
  health: number
  type: RunnerType
  zigzagPhase: number
}

export class GameScene extends Phaser.Scene {
  // Defenders (player + AI teammates)
  private defenders: Defender[] = []
  private runners: Runner[] = []
  
  // UI
  private scoreText!: Phaser.GameObjects.Text
  private waveText!: Phaser.GameObjects.Text
  private livesText!: Phaser.GameObjects.Text
  private killsText!: Phaser.GameObjects.Text
  private statsText!: Phaser.GameObjects.Text
  private timerBar!: Phaser.GameObjects.Graphics
  private timerBg!: Phaser.GameObjects.Graphics
  
  // Game state
  private isGameOver = false
  private isPaused = false
  private waveTimer = 0
  private spawnTimer = 0
  private runnersThisWave = 0
  private waveKills = 0
  
  // Player stats (upgradeable)
  private stats = {
    speedMultiplier: 1,
    tackleRadiusMultiplier: 1,
    enemySpeedMultiplier: 1,
    defenderCount: 1,
    lives: STARTING_LIVES,
  }
  
  // Input
  private pointer = { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 }

  constructor() {
    super({ key: 'GameScene' })
  }

  create(): void {
    this.cameras.main.fadeIn(300)
    this.resetState()
    
    this.drawField()
    this.createDefenders()
    this.createUI()
    this.setupInput()
    
    // Start first wave
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
    
    this.stats = {
      speedMultiplier: 1,
      tackleRadiusMultiplier: 1,
      enemySpeedMultiplier: 1,
      defenderCount: 1,
      lives: STARTING_LIVES,
    }
    
    useGameStore.getState().startGame()
  }

  private drawField(): void {
    const graphics = this.add.graphics()
    
    // Full field background
    graphics.fillStyle(COLORS.field, 1)
    graphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    
    // Yard lines
    graphics.lineStyle(2, 0xffffff, 0.2)
    for (let y = 80; y < GAME_HEIGHT; y += 60) {
      graphics.moveTo(20, y)
      graphics.lineTo(GAME_WIDTH - 20, y)
      graphics.strokePath()
    }
    
    // Top spawn zone indicator
    graphics.fillStyle(0xff0000, 0.1)
    graphics.fillRect(0, 0, GAME_WIDTH, 60)
    
    // Field border
    graphics.lineStyle(3, COLORS.accent, 0.5)
    graphics.strokeRect(5, 5, GAME_WIDTH - 10, GAME_HEIGHT - 10)
  }

  private createDefenders(): void {
    // Create player-controlled defender
    const playerDefender = this.createDefenderSprite(GAME_WIDTH / 2, GAME_HEIGHT - 150, true)
    this.defenders.push(playerDefender)
    
    // Add AI defenders based on stats
    for (let i = 1; i < this.stats.defenderCount; i++) {
      this.addAIDefender()
    }
  }

  private createDefenderSprite(x: number, y: number, isPlayer: boolean): Defender {
    const { selectedDefender } = useGameStore.getState()
    
    // Glow
    const glow = this.add.graphics()
    glow.lineStyle(3, isPlayer ? COLORS.accent : 0x4ecdc4, 0.4)
    glow.strokeCircle(0, 0, DEFENDER_RADIUS + 6)
    
    // Body
    const body = this.add.graphics()
    body.fillStyle(isPlayer ? COLORS.primary : 0x2a7a7a, 1)
    body.fillCircle(0, 0, DEFENDER_RADIUS)
    body.lineStyle(3, isPlayer ? COLORS.accent : 0x4ecdc4)
    body.strokeCircle(0, 0, DEFENDER_RADIUS)
    
    // Jersey number
    const jersey = this.add.text(0, 0, isPlayer ? `${selectedDefender}` : '★', {
      fontSize: isPlayer ? '20px' : '24px',
      color: '#ffffff',
      fontFamily: 'Arial Black',
    })
    jersey.setOrigin(0.5)
    
    const sprite = this.add.container(x, y, [glow, body, jersey])
    sprite.setSize(DEFENDER_RADIUS * 2, DEFENDER_RADIUS * 2)
    
    // Pulse effect
    this.tweens.add({
      targets: glow,
      alpha: 0.8,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 600,
      yoyo: true,
      repeat: -1,
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
      duration: 300,
      ease: 'Back.out',
    })
  }

  private createUI(): void {
    // Score (top left)
    this.scoreText = this.add.text(15, 12, 'SCORE: 0', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial Black',
    })
    
    // Wave (top right)
    this.waveText = this.add.text(GAME_WIDTH - 15, 12, 'WAVE 1', {
      fontSize: '16px',
      color: '#' + COLORS.accent.toString(16).padStart(6, '0'),
      fontFamily: 'Arial Black',
    })
    this.waveText.setOrigin(1, 0)
    
    // Lives (center top)
    this.livesText = this.add.text(GAME_WIDTH / 2, 12, '', {
      fontSize: '14px',
    })
    this.livesText.setOrigin(0.5, 0)
    this.updateLivesDisplay()
    
    // Wave timer bar
    this.timerBg = this.add.graphics()
    this.timerBg.fillStyle(0x333333, 0.8)
    this.timerBg.fillRect(15, 38, GAME_WIDTH - 30, 10)
    
    this.timerBar = this.add.graphics()
    
    // Wave kills counter
    this.killsText = this.add.text(15, 55, 'Tackles: 0', {
      fontSize: '12px',
      color: '#aaaaaa',
      fontFamily: 'Arial',
    })
    
    // Stats panel (bottom left) - shows current upgrades
    this.statsText = this.add.text(10, GAME_HEIGHT - 60, '', {
      fontSize: '10px',
      color: '#888888',
      fontFamily: 'Arial',
      lineSpacing: 4,
    })
    this.updateStatsDisplay()
  }
  
  private updateStatsDisplay(): void {
    const lines = []
    if (this.stats.defenderCount > 1) lines.push(`🏈 ${this.stats.defenderCount} Defenders`)
    if (this.stats.speedMultiplier > 1) lines.push(`⚡ ${Math.round((this.stats.speedMultiplier - 1) * 100)}% Speed`)
    if (this.stats.tackleRadiusMultiplier > 1) lines.push(`💪 ${Math.round((this.stats.tackleRadiusMultiplier - 1) * 100)}% Reach`)
    if (this.stats.enemySpeedMultiplier < 1) lines.push(`🍺 ${Math.round((1 - this.stats.enemySpeedMultiplier) * 100)}% Slow`)
    
    this.statsText.setText(lines.join('\n'))
  }

  private setupInput(): void {
    // Track pointer for player movement
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.pointer.x = pointer.x
      this.pointer.y = pointer.y
    })
    
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Resume audio context on first interaction (browser autoplay policy)
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
    
    // Reset kills display
    this.killsText.setText('Tackles: 0')
    
    const { wave } = useGameStore.getState()
    
    // Show wave start
    const waveText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, `WAVE ${wave}`, {
      fontSize: '42px',
      color: '#ffffff',
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 4,
    })
    waveText.setOrigin(0.5)
    waveText.setScale(0)
    
    this.tweens.add({
      targets: waveText,
      scale: 1,
      duration: 300,
      ease: 'Back.out',
      onComplete: () => {
        this.tweens.add({
          targets: waveText,
          alpha: 0,
          y: waveText.y - 50,
          duration: 500,
          delay: 500,
          onComplete: () => waveText.destroy(),
        })
      },
    })
  }

  private spawnRunner(): void {
    const { wave } = useGameStore.getState()
    
    // Determine runner type based on wave - LOTS OF SPECIALS
    let runnerType: RunnerType = 'NORMAL'
    const roll = Math.random()
    
    // Special enemy chance increases with wave - starts higher, scales faster
    const specialChance = Math.min(0.75, 0.2 + (wave * 0.05)) // 20% wave 1, up to 75% by wave 11
    
    if (roll < specialChance) {
      const specialRoll = Math.random()
      
      // All specials available from wave 1, just different rates
      if (specialRoll < 0.35) {
        runnerType = 'FAST' // 35% of specials are Fast
      } else if (specialRoll < 0.6) {
        runnerType = 'ZIGZAG' // 25% of specials are Zigzag
      } else {
        runnerType = 'TANK' // 40% of specials are Tank
      }
    }
    
    // Guaranteed special spawns - more frequent
    if (wave >= 5 && this.runnersThisWave % 3 === 0) {
      runnerType = 'TANK' // Every 3rd is Tank after wave 5
    }
    if (wave >= 7 && this.runnersThisWave % 2 === 0) {
      runnerType = 'FAST' // Every 2nd is Fast after wave 7
    }
    
    const typeDef = RUNNER_TYPES[runnerType]
    
    // Random spawn position at top
    const x = Phaser.Math.Between(40, GAME_WIDTH - 40)
    const y = -RUNNER_RADIUS
    
    // Speed scales with wave - gets noticeably faster each wave
    const waveSpeed = Math.min(MAX_RUNNER_SPEED, BASE_RUNNER_SPEED + (wave * SPEED_PER_WAVE))
    const speed = waveSpeed * typeDef.speedMult * this.stats.enemySpeedMultiplier
    
    // Runner size based on type
    const radius = RUNNER_RADIUS * typeDef.size
    
    // Runner sprite with type-specific color
    const body = this.add.graphics()
    body.fillStyle(typeDef.color, 1)
    body.fillCircle(0, 0, radius)
    body.lineStyle(2, 0xffffff, 0.5)
    body.strokeCircle(0, 0, radius)
    
    const icon = this.add.text(0, 0, typeDef.icon, { fontSize: `${10 + typeDef.size * 4}px` })
    icon.setOrigin(0.5)
    
    const sprite = this.add.container(x, y, [body, icon])
    sprite.setData('radius', radius)
    
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
    
    // Update wave timer
    this.waveTimer += delta
    this.updateTimerBar(store.wave)
    
    // Spawn runners - spawn rate increases each wave
    const spawnInterval = Math.max(MIN_SPAWN_INTERVAL, BASE_SPAWN_INTERVAL - (store.wave * SPAWN_REDUCTION_PER_WAVE))
    this.spawnTimer += delta
    
    if (this.spawnTimer >= spawnInterval && this.waveTimer < currentWaveDuration) {
      // Spawn burst - more enemies at once at higher waves
      // Wave 1-3: 1, Wave 4-6: 2, Wave 7-9: 3, Wave 10+: 4
      const burstCount = Math.min(4, 1 + Math.floor(store.wave / 3))
      
      for (let i = 0; i < burstCount; i++) {
        this.spawnRunner()
      }
      this.spawnTimer = 0
    }
    
    // Update player defender (follows pointer)
    this.updatePlayerDefender(delta)
    
    // Update AI defenders (chase nearest runner)
    this.updateAIDefenders(delta)
    
    // Update runners
    this.updateRunners(delta)
    
    // Check collisions
    this.checkCollisions()
    
    // Check wave complete - wave ends when timer done AND all runners cleared
    if (this.waveTimer >= currentWaveDuration && this.runners.length === 0) {
      this.completeWave()
    }
    
    // Update UI
    this.scoreText.setText(`SCORE: ${store.score.toLocaleString()}`)
    this.waveText.setText(`WAVE ${store.wave}`)
  }

  private updateTimerBar(wave: number): void {
    const waveDuration = getWaveDuration(wave)
    const progress = Math.min(1, this.waveTimer / waveDuration)
    const width = (GAME_WIDTH - 40) * progress
    
    this.timerBar.clear()
    this.timerBar.fillStyle(COLORS.accent, 1)
    this.timerBar.fillRect(20, 50, width, 12)
  }

  private updatePlayerDefender(delta: number): void {
    const player = this.defenders.find(d => d.isPlayer)
    if (!player) return
    
    // Move toward pointer
    const speed = DEFENDER_SPEED * this.stats.speedMultiplier * (delta / 1000)
    const dx = this.pointer.x - player.sprite.x
    const dy = this.pointer.y - player.sprite.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    
    if (dist > 5) {
      const moveX = (dx / dist) * Math.min(speed, dist)
      const moveY = (dy / dist) * Math.min(speed, dist)
      
      player.sprite.x += moveX
      player.sprite.y += moveY
      
      // Clamp to field
      player.sprite.x = Phaser.Math.Clamp(player.sprite.x, DEFENDER_RADIUS, GAME_WIDTH - DEFENDER_RADIUS)
      player.sprite.y = Phaser.Math.Clamp(player.sprite.y, 70, GAME_HEIGHT - DEFENDER_RADIUS)
    }
  }

  private updateAIDefenders(delta: number): void {
    const aiDefenders = this.defenders.filter(d => !d.isPlayer)
    
    aiDefenders.forEach((defender, index) => {
      // AI defenders are slow and imperfect
      // Add reaction delay - only update every few frames based on index
      if (Math.random() > 0.7) return // 30% chance to skip update (reaction time)
      
      // Find a runner to chase (not always the nearest - makes them less perfect)
      let targetRunner: Runner | undefined = undefined
      
      if (this.runners.length > 0) {
        // Each AI picks a different runner to avoid all chasing the same one
        const runnerIndex = index % this.runners.length
        targetRunner = this.runners[runnerIndex]
        
        // But only chase if runner is in the lower 2/3 of the screen (closer to danger)
        if (targetRunner && targetRunner.sprite.y < GAME_HEIGHT * 0.3) {
          targetRunner = undefined // Too far away, don't chase
        }
      }
      
      if (targetRunner !== undefined) {
        // Move toward target runner - SLOW
        const speed = AI_DEFENDER_SPEED * this.stats.speedMultiplier * (delta / 1000)
        const dx = targetRunner.sprite.x - defender.sprite.x
        const dy = targetRunner.sprite.y - defender.sprite.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        
        if (dist > 20) { // Stay further back, don't crowd
          // Add some wobble to movement (imperfect pathing)
          const wobbleX = (Math.random() - 0.5) * 0.3
          const wobbleY = (Math.random() - 0.5) * 0.3
          
          defender.sprite.x += ((dx / dist) + wobbleX) * speed
          defender.sprite.y += ((dy / dist) + wobbleY) * speed
          
          // Clamp to field
          defender.sprite.x = Phaser.Math.Clamp(defender.sprite.x, DEFENDER_RADIUS, GAME_WIDTH - DEFENDER_RADIUS)
          defender.sprite.y = Phaser.Math.Clamp(defender.sprite.y, 100, GAME_HEIGHT - DEFENDER_RADIUS)
        }
      } else {
        // No target - patrol near bottom of field
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
      
      // Move down
      runner.sprite.y += runner.speed * (delta / 1000)
      
      // PROGRESSIVE AI - gets smarter each wave
      let horizontalMove = 0
      
      // Base movement pattern by type
      if (runner.type === 'ZIGZAG') {
        runner.zigzagPhase += delta * 0.006
        horizontalMove = Math.sin(runner.zigzagPhase) * 4
      } else if (runner.type === 'FAST') {
        // Fast enemies weave slightly
        horizontalMove = Math.sin(runner.sprite.y * 0.03) * 2
      } else {
        horizontalMove = Math.sin(runner.sprite.y * 0.02) * 0.5
      }
      
      // WAVE 3+: Start reacting to defenders
      if (wave >= 3) {
        const nearestDefender = this.findNearestDefender(runner.sprite.x, runner.sprite.y)
        
        if (nearestDefender) {
          const dx = runner.sprite.x - nearestDefender.sprite.x
          const dy = runner.sprite.y - nearestDefender.sprite.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          
          // Dodge range increases with wave
          const dodgeRange = 80 + (wave * 5) // 80 at wave 3, 130 at wave 10
          
          if (dist < dodgeRange && dist > 0) {
            // Dodge intensity increases with wave
            const dodgeStrength = Math.min(3, 0.5 + (wave * 0.15)) // 0.5 at wave 3, up to 3
            
            // Move away from defender horizontally
            const dodgeDir = dx > 0 ? 1 : -1
            horizontalMove += dodgeDir * dodgeStrength * (1 - dist / dodgeRange)
            
            // WAVE 6+: Speed boost when dodging
            if (wave >= 6 && dist < dodgeRange * 0.5) {
              runner.sprite.y += runner.speed * 0.3 * (delta / 1000) // Extra forward speed
            }
          }
        }
      }
      
      // WAVE 8+: Spread out from other runners
      if (wave >= 8) {
        for (const other of this.runners) {
          if (other === runner) continue
          const ox = runner.sprite.x - other.sprite.x
          const oy = runner.sprite.y - other.sprite.y
          const oDist = Math.sqrt(ox * ox + oy * oy)
          
          if (oDist < 40 && oDist > 0) {
            // Push away from other runners
            horizontalMove += (ox / oDist) * 0.5
          }
        }
      }
      
      // Apply horizontal movement
      runner.sprite.x += horizontalMove
      
      // Clamp to field
      runner.sprite.x = Phaser.Math.Clamp(runner.sprite.x, radius + 10, GAME_WIDTH - radius - 10)
      
      // Check if scored (reached bottom)
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
      // Tank hit but not killed - show damage effect
      this.cameras.main.shake(20, 0.002)
      
      // Flash the runner
      const body = runner.sprite.getAt(0) as Phaser.GameObjects.Graphics
      this.tweens.add({
        targets: runner.sprite,
        alpha: 0.5,
        duration: 100,
        yoyo: true,
      })
      
      // Show damage number
      this.showFloatingPoints(runner.sprite.x, runner.sprite.y - 20, 5, 0xffff00)
      
      // Add score for hit
      useGameStore.getState().addScore(5)
    }
  }

  private tackleRunner(runner: Runner, defender: Defender): void {
    const store = useGameStore.getState()
    const typeDef = RUNNER_TYPES[runner.type]
    
    // Remove runner
    const index = this.runners.indexOf(runner)
    if (index !== -1) {
      this.runners.splice(index, 1)
    }
    
    // Effects - bigger shake for tanks
    const shakeIntensity = runner.type === 'TANK' ? 0.006 : 0.003
    this.cameras.main.shake(30, shakeIntensity)
    this.createTackleEffect(runner.sprite.x, runner.sprite.y, typeDef.color)
    
    // Sound - different for tanks
    if (runner.type === 'TANK') {
      AudioManager.playBigTackle()
    } else {
      AudioManager.playTackle()
    }
    
    // Show floating points
    this.showFloatingPoints(runner.sprite.x, runner.sprite.y, typeDef.points, COLORS.accent)
    
    runner.sprite.destroy()
    
    // Score based on runner type
    store.addTackle()
    store.addScore(typeDef.points)
    
    // Update wave kills
    this.waveKills++
    this.killsText.setText(`Tackles: ${this.waveKills}`)
  }
  
  private showFloatingPoints(x: number, y: number, points: number, color: number): void {
    const text = this.add.text(x, y, `+${points}`, {
      fontSize: '18px',
      color: '#' + color.toString(16).padStart(6, '0'),
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 2,
    })
    text.setOrigin(0.5)
    
    this.tweens.add({
      targets: text,
      y: y - 40,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    })
  }

  private createTackleEffect(x: number, y: number, color: number = COLORS.accent): void {
    // Burst particles with runner color
    for (let i = 0; i < 8; i++) {
      const particle = this.add.graphics()
      particle.fillStyle(i % 2 === 0 ? color : COLORS.accent, 1)
      particle.fillCircle(0, 0, 4)
      particle.setPosition(x, y)
      
      const angle = (i / 8) * Math.PI * 2
      
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * 35,
        y: y + Math.sin(angle) * 35,
        alpha: 0,
        scale: 0.5,
        duration: 300,
        onComplete: () => particle.destroy(),
      })
    }
    
    // Impact ring
    const ring = this.add.graphics()
    ring.lineStyle(3, color)
    ring.strokeCircle(x, y, 10)
    
    this.tweens.add({
      targets: ring,
      scaleX: 2.5,
      scaleY: 2.5,
      alpha: 0,
      duration: 300,
      onComplete: () => ring.destroy(),
    })
  }

  private runnerScored(runner: Runner): void {
    // Remove runner
    const index = this.runners.indexOf(runner)
    if (index !== -1) {
      this.runners.splice(index, 1)
    }
    runner.sprite.destroy()
    
    // Lose life
    this.stats.lives--
    this.updateLivesDisplay()
    
    // Sound
    AudioManager.playTouchdown()
    
    // Flash
    this.cameras.main.flash(150, 255, 0, 0)
    
    // Check game over
    if (this.stats.lives <= 0) {
      this.gameOver()
    }
  }

  private updateLivesDisplay(): void {
    const hearts = '❤️'.repeat(Math.max(0, this.stats.lives))
    this.livesText.setText(hearts)
  }

  private completeWave(): void {
    this.isPaused = true
    const store = useGameStore.getState()
    
    // Sound
    AudioManager.playWaveComplete()
    
    // Wave complete bonus
    store.addScore(100)
    store.incrementWave()
    
    // Show upgrade selection
    this.showUpgradeSelection()
  }

  private showUpgradeSelection(): void {
    // Dim background
    const overlay = this.add.graphics()
    overlay.fillStyle(0x000000, 0.7)
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    
    // Title
    const title = this.add.text(GAME_WIDTH / 2, 80, 'CHOOSE UPGRADE', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial Black',
    })
    title.setOrigin(0.5)
    
    // Get 3 random upgrades
    const upgradeTypes = Object.keys(UPGRADES) as UpgradeType[]
    const shuffled = upgradeTypes.sort(() => Math.random() - 0.5)
    const choices = shuffled.slice(0, 3)
    
    const cards: Phaser.GameObjects.Container[] = []
    
    choices.forEach((type, index) => {
      const upgrade = UPGRADES[type]
      const y = 180 + index * 150
      
      const card = this.createUpgradeCard(GAME_WIDTH / 2, y, upgrade, () => {
        AudioManager.playUpgrade()
        this.applyUpgrade(upgrade.type)
        
        // Clean up
        overlay.destroy()
        title.destroy()
        cards.forEach(c => c.destroy())
        
        // Continue
        this.startWave()
      })
      
      cards.push(card)
    })
  }

  private createUpgradeCard(x: number, y: number, upgrade: Upgrade, callback: () => void): Phaser.GameObjects.Container {
    const width = 320
    const height = 110
    
    const bg = this.add.graphics()
    bg.fillStyle(0x222222, 1)
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 15)
    bg.lineStyle(3, upgrade.color)
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 15)
    
    const icon = this.add.text(-width / 2 + 40, 0, upgrade.icon, {
      fontSize: '36px',
    })
    icon.setOrigin(0.5)
    
    const name = this.add.text(-width / 2 + 90, -15, upgrade.name, {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial Black',
    })
    
    const desc = this.add.text(-width / 2 + 90, 15, upgrade.description, {
      fontSize: '14px',
      color: '#aaaaaa',
      fontFamily: 'Arial',
    })
    
    const container = this.add.container(x, y, [bg, icon, name, desc])
    container.setSize(width, height)
    container.setInteractive({ useHandCursor: true })
    
    container.on('pointerover', () => {
      container.setScale(1.05)
      bg.clear()
      bg.fillStyle(0x333333, 1)
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 15)
      bg.lineStyle(4, upgrade.color)
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 15)
    })
    
    container.on('pointerout', () => {
      container.setScale(1)
      bg.clear()
      bg.fillStyle(0x222222, 1)
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 15)
      bg.lineStyle(3, upgrade.color)
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 15)
    })
    
    container.on('pointerdown', callback)
    
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
        this.stats.enemySpeedMultiplier *= 0.8 // Enemies 20% slower
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
    
    // Update stats display
    this.updateStatsDisplay()
    
    // Show upgrade applied text
    const text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'UPGRADED!', {
      fontSize: '28px',
      color: '#' + COLORS.accent.toString(16).padStart(6, '0'),
      fontFamily: 'Arial Black',
    })
    text.setOrigin(0.5)
    
    this.tweens.add({
      targets: text,
      y: text.y - 50,
      alpha: 0,
      duration: 800,
      onComplete: () => text.destroy(),
    })
  }

  private gameOver(): void {
    this.isGameOver = true
    
    // Sound
    AudioManager.playGameOver()
    
    // Clean up
    this.runners.forEach(r => r.sprite.destroy())
    this.runners = []
    
    this.cameras.main.fadeOut(500)
    this.time.delayedCall(500, () => {
      this.scene.start('GameOverScene')
    })
  }
}
