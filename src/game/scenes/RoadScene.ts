import * as Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT } from '../config/phaserConfig'
import { SEATTLE_DARKSIDE, getOpponentById, hexToNumber } from '../data/teams'
import { getLevelConfig, TOTAL_LEVELS } from '../data/levels'
import { getGameState } from '../../store/gameStore'

/**
 * RoadScene - The approach phase before clash
 * 
 * CRITICAL FIX: Both teams physically move toward center.
 * Encounter triggers when lead players reach encounterX threshold.
 */

type Phase = 'APPROACH' | 'ENCOUNTER' | 'TRANSITION'

interface PlayerSprite {
  container: Phaser.GameObjects.Container
  graphics: Phaser.GameObjects.Graphics
  numberText: Phaser.GameObjects.Text
  baseY: number
}

export class RoadScene extends Phaser.Scene {
  // Game dimensions
  private worldWidth: number = GAME_WIDTH
  private encounterX: number = GAME_WIDTH / 2

  // Phase management
  private phase: Phase = 'APPROACH'

  // Team containers
  private defenders: PlayerSprite[] = []
  private opponents: PlayerSprite[] = []

  // Config
  private approachSpeed: number = 140
  private levelConfig!: ReturnType<typeof getLevelConfig>

  // Visual elements
  private turfGraphics!: Phaser.GameObjects.Graphics
  private levelText!: Phaser.GameObjects.Text
  private opponentNameText!: Phaser.GameObjects.Text
  private debugText!: Phaser.GameObjects.Text

  // Animation
  private walkTime: number = 0
  private scrollOffset: number = 0

  constructor() {
    super({ key: 'RoadScene' })
  }

  create(): void {
    // Reset state
    this.phase = 'APPROACH'
    this.walkTime = 0
    this.scrollOffset = 0
    this.defenders = []
    this.opponents = []

    // Get level config
    const state = getGameState()
    const currentLevel = state.currentLevel
    this.levelConfig = getLevelConfig(currentLevel)
    this.approachSpeed = this.levelConfig.approachSpeed

    const opponent = getOpponentById(this.levelConfig.opponentId)

    // Background
    this.cameras.main.setBackgroundColor('#2d5a27')

    // Turf graphics
    this.turfGraphics = this.add.graphics()
    this.drawTurf()

    // Level indicator
    const levelLabel = this.levelConfig.isSuperBowl 
      ? 'SUPER BOWL' 
      : `LEVEL ${currentLevel}`
    this.levelText = this.add.text(GAME_WIDTH / 2, 30, levelLabel, {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '28px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    })
    this.levelText.setOrigin(0.5)
    this.levelText.setDepth(100)

    // Opponent name
    this.opponentNameText = this.add.text(GAME_WIDTH / 2, 65, `VS ${opponent.name.toUpperCase()}`, {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '20px',
      color: opponent.colors.accent,
      stroke: opponent.colors.trim,
      strokeThickness: 3,
    })
    this.opponentNameText.setOrigin(0.5)
    this.opponentNameText.setDepth(100)

    // Create Seattle Darkside defenders (LEFT side, moving RIGHT)
    // Staggered formation: x = 120 + i*8, y = 220 + i*40
    for (let i = 0; i < 5; i++) {
      const x = 120 + i * 8
      const y = 220 + i * 40
      const player = this.createPlayer(x, y, SEATTLE_DARKSIDE.colors, `${50 + i}`, true)
      this.defenders.push(player)
    }

    // Check for extra lineman power-up
    const modifiers = state.getModifiers()
    if (modifiers.extraLineman) {
      const x = 120 + 5 * 8
      const y = 220 + 5 * 40
      const player = this.createPlayer(x, y, SEATTLE_DARKSIDE.colors, '56', true)
      this.defenders.push(player)
    }

    // Create opponent offensive line (RIGHT side, moving LEFT)
    // Mirrored staggered formation
    for (let i = 0; i < 5; i++) {
      const x = this.worldWidth - 120 - i * 8
      const y = 220 + i * 40
      const player = this.createPlayer(x, y, opponent.colors, `${70 + i}`, false)
      this.opponents.push(player)
    }

    // Debug text (toggle with D key)
    this.debugText = this.add.text(10, GAME_HEIGHT - 80, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#00ff00',
      backgroundColor: '#000000aa',
      padding: { x: 5, y: 5 },
    })
    this.debugText.setDepth(200)
    this.debugText.setVisible(state.debugMode)

    // Debug toggle key
    this.input.keyboard?.on('keydown-D', () => {
      const gameState = getGameState()
      gameState.toggleDebug()
      this.debugText.setVisible(gameState.debugMode)
    })

    // Draw encounter line (debug visual)
    this.drawEncounterLine()
  }

  update(time: number, delta: number): void {
    const dt = delta / 1000
    this.walkTime += dt

    if (this.phase === 'APPROACH') {
      this.updateApproach(dt)
      this.checkEncounter()
    }

    // Always update turf scroll for motion effect
    this.scrollOffset += this.approachSpeed * dt * 0.5
    this.drawTurf()

    // Update debug display
    this.updateDebugText()

    // Bob animation for all players
    this.animatePlayers()
  }

  private updateApproach(dt: number): void {
    const moveAmount = this.approachSpeed * dt

    // Move defenders RIGHT (toward center)
    for (const defender of this.defenders) {
      defender.container.x += moveAmount
    }

    // Move opponents LEFT (toward center)
    for (const opponent of this.opponents) {
      opponent.container.x -= moveAmount
    }
  }

  private checkEncounter(): void {
    if (this.phase !== 'APPROACH') return

    // Get lead player positions
    const leadDefenderX = this.getLeadDefenderX()
    const leadOpponentX = this.getLeadOpponentX()

    // Encounter threshold: when both leads are within 40px of center
    const defenderReached = leadDefenderX >= this.encounterX - 40
    const opponentReached = leadOpponentX <= this.encounterX + 40

    if (defenderReached && opponentReached) {
      this.triggerEncounter()
    }
  }

  private getLeadDefenderX(): number {
    // Lead defender is the one with highest X (furthest right)
    let maxX = 0
    for (const defender of this.defenders) {
      if (defender.container.x > maxX) {
        maxX = defender.container.x
      }
    }
    return maxX
  }

  private getLeadOpponentX(): number {
    // Lead opponent is the one with lowest X (furthest left)
    let minX = this.worldWidth
    for (const opponent of this.opponents) {
      if (opponent.container.x < minX) {
        minX = opponent.container.x
      }
    }
    return minX
  }

  private triggerEncounter(): void {
    this.phase = 'ENCOUNTER'

    // Snap teams to encounter positions
    this.snapTeamsToEncounter()

    // Flash effect
    this.cameras.main.flash(200, 255, 255, 255)

    // Show "CLASH!" text
    const clashText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'CLASH!', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '64px',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 6,
    })
    clashText.setOrigin(0.5)
    clashText.setDepth(150)
    clashText.setScale(0)

    this.tweens.add({
      targets: clashText,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(400, () => {
          this.phase = 'TRANSITION'
          this.transitionToClash()
        })
      },
    })
  }

  private snapTeamsToEncounter(): void {
    // Snap defenders so lead is at encounterX - 30
    const leadDefenderX = this.getLeadDefenderX()
    const defenderOffset = (this.encounterX - 30) - leadDefenderX

    for (const defender of this.defenders) {
      defender.container.x += defenderOffset
    }

    // Snap opponents so lead is at encounterX + 30
    const leadOpponentX = this.getLeadOpponentX()
    const opponentOffset = (this.encounterX + 30) - leadOpponentX

    for (const opponent of this.opponents) {
      opponent.container.x += opponentOffset
    }
  }

  private transitionToClash(): void {
    // Fade out and transition to ClashScene
    this.cameras.main.fadeOut(300, 0, 0, 0)
    
    this.time.delayedCall(300, () => {
      this.scene.start('ClashScene')
    })
  }

  private createPlayer(
    x: number,
    y: number,
    colors: { primary: string; accent: string; trim: string },
    number: string,
    facingRight: boolean
  ): PlayerSprite {
    const container = this.add.container(x, y)
    const g = this.add.graphics()

    const primary = hexToNumber(colors.primary)
    const accent = hexToNumber(colors.accent)
    const trim = hexToNumber(colors.trim)

    // Body/jersey (rectangle)
    g.fillStyle(primary, 1)
    g.fillRoundedRect(-18, -12, 36, 45, 6)

    // Shoulder pads
    g.fillStyle(trim, 1)
    g.fillRoundedRect(-22, -10, 44, 12, 4)

    // Helmet
    g.fillStyle(primary, 1)
    g.fillCircle(0, -28, 16)

    // Facemask (direction based)
    g.lineStyle(3, trim, 1)
    const facemaskDir = facingRight ? 1 : -1
    g.beginPath()
    g.arc(8 * facemaskDir, -28, 10, -0.6 * facemaskDir, 0.6 * facemaskDir)
    g.strokePath()

    // Helmet stripe
    g.lineStyle(4, hexToNumber(colors.accent), 1)
    g.beginPath()
    g.moveTo(-12, -40)
    g.lineTo(0, -44)
    g.lineTo(12, -40)
    g.strokePath()

    // Jersey number
    const numText = this.add.text(0, 8, number, {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '14px',
      color: colors.accent,
      stroke: colors.trim,
      strokeThickness: 2,
    })
    numText.setOrigin(0.5)

    // Legs
    g.fillStyle(trim, 1)
    g.fillRect(-10, 33, 7, 18)
    g.fillRect(3, 33, 7, 18)

    container.add([g, numText])
    container.setDepth(50)

    return {
      container,
      graphics: g,
      numberText: numText,
      baseY: y,
    }
  }

  private animatePlayers(): void {
    const bobAmount = Math.sin(this.walkTime * 8) * 3

    // Only bob during approach phase
    if (this.phase === 'APPROACH') {
      for (let i = 0; i < this.defenders.length; i++) {
        const player = this.defenders[i]
        player.container.y = player.baseY + bobAmount
      }

      for (let i = 0; i < this.opponents.length; i++) {
        const player = this.opponents[i]
        // Offset opponent bob slightly for variety
        player.container.y = player.baseY + Math.sin(this.walkTime * 8 + 0.5) * 3
      }
    }
  }

  private drawTurf(): void {
    const g = this.turfGraphics
    g.clear()

    // Grass stripes
    const stripeWidth = 50
    for (let x = -stripeWidth - (this.scrollOffset % (stripeWidth * 2)); x < GAME_WIDTH + stripeWidth; x += stripeWidth) {
      const isLight = Math.floor((x + this.scrollOffset) / stripeWidth) % 2 === 0
      g.fillStyle(isLight ? 0x2d5a27 : 0x265221, 1)
      g.fillRect(x, 0, stripeWidth, GAME_HEIGHT)
    }

    // Yard lines
    g.lineStyle(3, 0xffffff, 0.7)
    const yardLineSpacing = 80
    for (let x = -yardLineSpacing - (this.scrollOffset % yardLineSpacing); x < GAME_WIDTH + yardLineSpacing; x += yardLineSpacing) {
      g.beginPath()
      g.moveTo(x, 100)
      g.lineTo(x, GAME_HEIGHT - 80)
      g.strokePath()
    }

    // Hash marks
    g.lineStyle(2, 0xffffff, 0.4)
    const hashY1 = GAME_HEIGHT / 3
    const hashY2 = (GAME_HEIGHT * 2) / 3
    for (let x = -15 - (this.scrollOffset % 15); x < GAME_WIDTH + 15; x += 15) {
      g.beginPath()
      g.moveTo(x, hashY1 - 4)
      g.lineTo(x, hashY1 + 4)
      g.moveTo(x, hashY2 - 4)
      g.lineTo(x, hashY2 + 4)
      g.strokePath()
    }

    // Sidelines
    g.lineStyle(4, 0xffffff, 1)
    g.beginPath()
    g.moveTo(0, 100)
    g.lineTo(GAME_WIDTH, 100)
    g.moveTo(0, GAME_HEIGHT - 80)
    g.lineTo(GAME_WIDTH, GAME_HEIGHT - 80)
    g.strokePath()
  }

  private drawEncounterLine(): void {
    // Visual debug line at encounter point
    const g = this.add.graphics()
    g.lineStyle(2, 0xff0000, 0.3)
    g.setDepth(5)
    g.beginPath()
    g.moveTo(this.encounterX, 100)
    g.lineTo(this.encounterX, GAME_HEIGHT - 80)
    g.strokePath()
  }

  private updateDebugText(): void {
    if (!this.debugText.visible) return

    const leadDefX = this.getLeadDefenderX()
    const leadOppX = this.getLeadOpponentX()

    this.debugText.setText([
      `Phase: ${this.phase}`,
      `Defender Lead X: ${Math.round(leadDefX)}`,
      `Opponent Lead X: ${Math.round(leadOppX)}`,
      `Encounter X: ${this.encounterX}`,
      `Trigger: Def >= ${this.encounterX - 40} && Opp <= ${this.encounterX + 40}`,
      `DefReached: ${leadDefX >= this.encounterX - 40}`,
      `OppReached: ${leadOppX <= this.encounterX + 40}`,
    ].join('\n'))
  }
}
