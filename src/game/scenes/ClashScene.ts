import * as Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT } from '../config/phaserConfig'
import { SEATTLE_DARKSIDE, getOpponentById, hexToNumber } from '../data/teams'
import { getLevelConfig, getAdjustedTargetForce, BASE_TAP_POWER, TOTAL_LEVELS } from '../data/levels'
import { getGameState, type ClashModifiers } from '../../store/gameStore'

/**
 * ClashScene - The button-mash gameplay phase
 * 
 * Features:
 * - READY...GO! countdown before taps count
 * - Large mobile-friendly PUSH button
 * - Force meter with continuous decay
 * - Keyboard, mouse, and touch support
 */

type Phase = 'COUNTDOWN' | 'ACTIVE' | 'WIN' | 'LOSE'

const METER_WIDTH = 500
const METER_HEIGHT = 50
const PUSH_BUTTON_WIDTH = 300
const PUSH_BUTTON_HEIGHT = 100

export class ClashScene extends Phaser.Scene {
  // Phase management
  private phase: Phase = 'COUNTDOWN'

  // Game state
  private force: number = 0
  private targetForce: number = 120
  private timeRemaining: number = 8
  private modifiers!: ClashModifiers

  // Level config
  private levelConfig!: ReturnType<typeof getLevelConfig>

  // UI Elements
  private meterBg!: Phaser.GameObjects.Graphics
  private meterFill!: Phaser.GameObjects.Graphics
  private meterTargetLine!: Phaser.GameObjects.Graphics
  private timerText!: Phaser.GameObjects.Text
  private forceText!: Phaser.GameObjects.Text
  private levelText!: Phaser.GameObjects.Text
  private opponentText!: Phaser.GameObjects.Text
  private countdownText!: Phaser.GameObjects.Text
  private pushButton!: Phaser.GameObjects.Container
  private pushButtonBg!: Phaser.GameObjects.Graphics
  private modifierChips!: Phaser.GameObjects.Container

  // Player lines
  private defenderLine!: Phaser.GameObjects.Container
  private opponentLine!: Phaser.GameObjects.Container
  private lineBaseX: number = GAME_WIDTH / 2

  // Debug
  private debugText!: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'ClashScene' })
  }

  create(): void {
    this.phase = 'COUNTDOWN'

    // Get state and config
    const state = getGameState()
    const currentLevel = state.currentLevel
    const retryCount = state.retryCount

    this.levelConfig = getLevelConfig(currentLevel)
    const opponent = getOpponentById(this.levelConfig.opponentId)

    // Consume power-ups and get modifiers
    this.modifiers = state.consumePowerUps()

    // Calculate adjusted values
    const baseTarget = this.levelConfig.targetForce
    this.targetForce = getAdjustedTargetForce(baseTarget, retryCount)
    this.timeRemaining = this.levelConfig.timeLimitSec + this.modifiers.extraTime
    this.force = this.targetForce * this.modifiers.headStartPercent

    // Background
    this.cameras.main.setBackgroundColor('#1a3d1a')
    this.drawTurf()

    // HUD - Level
    const levelLabel = this.levelConfig.isSuperBowl ? 'SUPER BOWL' : `LEVEL ${currentLevel}`
    this.levelText = this.add.text(20, 15, levelLabel, {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '20px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    })

    // HUD - Opponent
    this.opponentText = this.add.text(GAME_WIDTH - 20, 15, `VS ${opponent.name.toUpperCase()}`, {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '20px',
      color: opponent.colors.accent,
      stroke: opponent.colors.trim,
      strokeThickness: 2,
    })
    this.opponentText.setOrigin(1, 0)

    // Timer
    this.timerText = this.add.text(GAME_WIDTH / 2, 55, this.formatTime(this.timeRemaining), {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '48px',
      color: '#ffffff',
      stroke: '#333333',
      strokeThickness: 4,
    })
    this.timerText.setOrigin(0.5)

    // Force percentage text (must be created before meter so updateMeter can use it)
    this.forceText = this.add.text(GAME_WIDTH / 2, 175, '0%', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
    })
    this.forceText.setOrigin(0.5)

    // Force meter
    this.createForceMeter()

    // Modifier chips (show active power-ups)
    this.createModifierChips()

    // Create player lines
    this.defenderLine = this.createPlayerLine(this.lineBaseX - 60, SEATTLE_DARKSIDE.colors, true)
    this.opponentLine = this.createPlayerLine(this.lineBaseX + 60, opponent.colors, false)

    // PUSH button
    this.createPushButton()

    // Countdown text
    this.countdownText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, '', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '80px',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 8,
    })
    this.countdownText.setOrigin(0.5)
    this.countdownText.setDepth(200)

    // Debug text
    this.debugText = this.add.text(10, GAME_HEIGHT - 60, '', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#00ff00',
      backgroundColor: '#000000aa',
      padding: { x: 4, y: 4 },
    })
    this.debugText.setDepth(200)
    this.debugText.setVisible(state.debugMode)

    // Debug toggle
    this.input.keyboard?.on('keydown-D', () => {
      const gameState = getGameState()
      gameState.toggleDebug()
      this.debugText.setVisible(gameState.debugMode)
    })

    // Start countdown
    this.startCountdown()
  }

  update(time: number, delta: number): void {
    if (this.phase !== 'ACTIVE') return

    const dt = delta / 1000

    // Apply continuous decay (opponent resistance)
    const resistance = this.levelConfig.opponentResistance * this.modifiers.resistanceMultiplier
    this.force = Math.max(0, this.force - resistance * dt)

    // Update timer
    this.timeRemaining -= dt

    // Update UI
    this.updateMeter()
    this.updateTimer()
    this.updateLines()
    this.updateDebug()

    // Check win/lose conditions
    if (this.force >= this.targetForce) {
      this.handleWin()
    } else if (this.timeRemaining <= 0) {
      this.handleLose()
    }
  }

  private startCountdown(): void {
    this.phase = 'COUNTDOWN'
    
    // Show "READY..."
    this.countdownText.setText('READY...')
    this.countdownText.setScale(0)

    this.tweens.add({
      targets: this.countdownText,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut',
    })

    // After 0.4s show "GO!"
    this.time.delayedCall(400, () => {
      this.countdownText.setText('GO!')
      this.countdownText.setColor('#7ED957')

      this.tweens.add({
        targets: this.countdownText,
        scale: 1.3,
        duration: 200,
        yoyo: true,
        onComplete: () => {
          // Fade out countdown
          this.tweens.add({
            targets: this.countdownText,
            alpha: 0,
            duration: 200,
          })

          // Start active phase
          this.phase = 'ACTIVE'
          this.enableInput()
        },
      })
    })
  }

  private enableInput(): void {
    // Keyboard - Spacebar
    this.input.keyboard?.on('keydown-SPACE', this.handleTap, this)

    // Pointer (touch/click) anywhere
    this.input.on('pointerdown', this.handleTap, this)
  }

  private disableInput(): void {
    this.input.keyboard?.off('keydown-SPACE', this.handleTap, this)
    this.input.off('pointerdown', this.handleTap, this)
  }

  private handleTap = (): void => {
    if (this.phase !== 'ACTIVE') return

    const state = getGameState()
    state.recordTap()

    // Calculate tap power with modifiers
    let tapPower = BASE_TAP_POWER
    tapPower *= this.modifiers.tapPowerMultiplier
    tapPower *= this.modifiers.extraLinemanBoost

    this.force += tapPower

    // Visual feedback
    this.pushFeedback()
  }

  private pushFeedback(): void {
    // Button pulse
    this.tweens.add({
      targets: this.pushButton,
      scaleX: 0.92,
      scaleY: 0.92,
      duration: 40,
      yoyo: true,
    })

    // Line push effect
    const pushAmount = 4
    this.tweens.add({
      targets: this.defenderLine,
      x: this.defenderLine.x + pushAmount,
      duration: 40,
      yoyo: true,
    })
    this.tweens.add({
      targets: this.opponentLine,
      x: this.opponentLine.x + pushAmount,
      duration: 40,
      yoyo: true,
    })

    // Flash the button color briefly
    this.pushButtonBg.clear()
    this.pushButtonBg.fillStyle(0x7ed957, 1)
    this.pushButtonBg.fillRoundedRect(-PUSH_BUTTON_WIDTH / 2, -PUSH_BUTTON_HEIGHT / 2, PUSH_BUTTON_WIDTH, PUSH_BUTTON_HEIGHT, 20)

    this.time.delayedCall(50, () => {
      if (this.phase === 'ACTIVE') {
        this.pushButtonBg.clear()
        this.pushButtonBg.fillStyle(0x0f6e6a, 1)
        this.pushButtonBg.fillRoundedRect(-PUSH_BUTTON_WIDTH / 2, -PUSH_BUTTON_HEIGHT / 2, PUSH_BUTTON_WIDTH, PUSH_BUTTON_HEIGHT, 20)
      }
    })
  }

  private createForceMeter(): void {
    const meterX = (GAME_WIDTH - METER_WIDTH) / 2
    const meterY = 115

    // Background
    this.meterBg = this.add.graphics()
    this.meterBg.fillStyle(0x222222, 1)
    this.meterBg.fillRoundedRect(meterX, meterY, METER_WIDTH, METER_HEIGHT, 10)
    this.meterBg.lineStyle(3, 0xffffff, 0.8)
    this.meterBg.strokeRoundedRect(meterX, meterY, METER_WIDTH, METER_HEIGHT, 10)

    // Fill
    this.meterFill = this.add.graphics()
    this.updateMeter()

    // Target line (at 100% - right edge)
    this.meterTargetLine = this.add.graphics()
    this.meterTargetLine.lineStyle(4, 0xffd700, 1)
    this.meterTargetLine.beginPath()
    this.meterTargetLine.moveTo(meterX + METER_WIDTH, meterY - 5)
    this.meterTargetLine.lineTo(meterX + METER_WIDTH, meterY + METER_HEIGHT + 5)
    this.meterTargetLine.strokePath()
  }

  private updateMeter(): void {
    this.meterFill.clear()

    const fillPercent = Math.min(this.force / this.targetForce, 1)
    const fillWidth = (METER_WIDTH - 6) * fillPercent
    const meterX = (GAME_WIDTH - METER_WIDTH) / 2 + 3
    const meterY = 118

    // Color based on progress
    let fillColor = 0x0f6e6a // Teal
    if (fillPercent >= 0.9) fillColor = 0x7ed957 // Green - almost there!
    else if (fillPercent >= 0.6) fillColor = 0x5aab4e

    this.meterFill.fillStyle(fillColor, 1)
    this.meterFill.fillRoundedRect(meterX, meterY, Math.max(0, fillWidth), METER_HEIGHT - 6, 8)

    // Update percentage text
    const percent = Math.round(fillPercent * 100)
    this.forceText.setText(`${percent}%`)
  }

  private updateTimer(): void {
    const displayTime = Math.max(0, Math.ceil(this.timeRemaining))
    this.timerText.setText(this.formatTime(displayTime))

    // Warning color when low
    if (this.timeRemaining <= 3) {
      this.timerText.setColor('#ff4444')
      this.timerText.setStroke('#660000', 4)
    }
  }

  private updateLines(): void {
    // Move lines based on force ratio
    const forceRatio = Math.min(this.force / this.targetForce, 1)
    const maxPush = 50

    this.defenderLine.x = this.lineBaseX - 60 + forceRatio * maxPush
    this.opponentLine.x = this.lineBaseX + 60 + forceRatio * maxPush
  }

  private handleWin(): void {
    this.phase = 'WIN'
    this.disableInput()

    const state = getGameState()
    state.recordWin()

    // Breakthrough animation
    this.tweens.add({
      targets: this.defenderLine,
      x: this.lineBaseX + 200,
      duration: 400,
      ease: 'Power2',
    })

    this.tweens.add({
      targets: this.opponentLine,
      x: GAME_WIDTH + 100,
      alpha: 0.5,
      duration: 400,
      ease: 'Power2',
    })

    // SACK! text
    const sackText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'SACK!', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '80px',
      color: '#7ED957',
      stroke: '#0B1F24',
      strokeThickness: 8,
    })
    sackText.setOrigin(0.5)
    sackText.setDepth(150)
    sackText.setScale(0)

    this.tweens.add({
      targets: sackText,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut',
    })

    // QB down placeholder
    this.time.delayedCall(500, () => {
      const qb = this.add.graphics()
      qb.fillStyle(0xcc4444, 1)
      qb.fillCircle(GAME_WIDTH / 2 + 80, GAME_HEIGHT / 2 + 80, 20)
      qb.fillRoundedRect(GAME_WIDTH / 2 + 60, GAME_HEIGHT / 2 + 90, 40, 50, 6)
      qb.setDepth(100)

      const qbText = this.add.text(GAME_WIDTH / 2 + 80, GAME_HEIGHT / 2 + 150, 'QB DOWN!', {
        fontFamily: 'Arial Black',
        fontSize: '20px',
        color: '#FFD700',
        stroke: '#000',
        strokeThickness: 2,
      })
      qbText.setOrigin(0.5)
    })

    // Transition after celebration
    this.time.delayedCall(1800, () => {
      const currentLevel = state.currentLevel

      if (currentLevel >= TOTAL_LEVELS) {
        // Super Bowl won!
        this.scene.start('VictoryScene')
      } else {
        // Advance and go to power-up selection
        state.advanceLevel()
        this.scene.start('PowerUpScene')
      }
    })
  }

  private handleLose(): void {
    this.phase = 'LOSE'
    this.disableInput()

    // Screen shake
    this.cameras.main.shake(300, 0.015)

    // Darken screen
    const overlay = this.add.graphics()
    overlay.fillStyle(0x000000, 0.7)
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    overlay.setDepth(100)

    // Lose text
    const loseText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 'HOLD THE LINE', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '40px',
      color: '#ff4444',
      stroke: '#000000',
      strokeThickness: 4,
    })
    loseText.setOrigin(0.5)
    loseText.setDepth(150)

    const retryText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, 'TRY AGAIN', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    })
    retryText.setOrigin(0.5)
    retryText.setDepth(150)

    // Increment retry and restart
    this.time.delayedCall(1200, () => {
      const state = getGameState()
      state.incrementRetry()
      this.scene.restart()
    })
  }

  private createPlayerLine(
    x: number,
    colors: { primary: string; accent: string; trim: string },
    facingRight: boolean
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, GAME_HEIGHT / 2 + 60)

    const primary = hexToNumber(colors.primary)
    const accent = hexToNumber(colors.accent)
    const trim = hexToNumber(colors.trim)

    // Check for extra lineman
    const state = getGameState()
    const playerCount = (this.modifiers?.extraLineman && facingRight) ? 6 : 5

    for (let i = 0; i < playerCount; i++) {
      const yOffset = (i - (playerCount - 1) / 2) * 45
      const g = this.add.graphics()

      // Body
      g.fillStyle(primary, 1)
      g.fillRoundedRect(-14, yOffset - 18, 28, 40, 5)

      // Shoulders
      g.fillStyle(trim, 1)
      g.fillRoundedRect(-18, yOffset - 16, 36, 10, 3)

      // Helmet
      g.fillStyle(primary, 1)
      g.fillCircle(0, yOffset - 28, 13)

      // Facemask
      g.lineStyle(2, trim, 1)
      const dir = facingRight ? 1 : -1
      g.beginPath()
      g.arc(6 * dir, yOffset - 28, 8, -0.5 * dir, 0.5 * dir)
      g.strokePath()

      // Number
      const num = this.add.text(0, yOffset - 3, `${i + 1}`, {
        fontFamily: 'Arial Black',
        fontSize: '12px',
        color: `#${accent.toString(16).padStart(6, '0')}`,
      })
      num.setOrigin(0.5)

      container.add([g, num])
    }

    container.setDepth(50)
    return container
  }

  private createPushButton(): void {
    const y = GAME_HEIGHT - 80

    this.pushButton = this.add.container(GAME_WIDTH / 2, y)

    // Button background
    this.pushButtonBg = this.add.graphics()
    this.pushButtonBg.fillStyle(0x0f6e6a, 1)
    this.pushButtonBg.fillRoundedRect(-PUSH_BUTTON_WIDTH / 2, -PUSH_BUTTON_HEIGHT / 2, PUSH_BUTTON_WIDTH, PUSH_BUTTON_HEIGHT, 20)
    this.pushButtonBg.lineStyle(4, 0x7ed957, 1)
    this.pushButtonBg.strokeRoundedRect(-PUSH_BUTTON_WIDTH / 2, -PUSH_BUTTON_HEIGHT / 2, PUSH_BUTTON_WIDTH, PUSH_BUTTON_HEIGHT, 20)

    // Button text
    const buttonText = this.add.text(0, 0, 'PUSH!', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '40px',
      color: '#ffffff',
      stroke: '#0B1F24',
      strokeThickness: 3,
    })
    buttonText.setOrigin(0.5)

    // Tap instruction
    const tapText = this.add.text(0, 35, 'TAP RAPIDLY!', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#7ED957',
    })
    tapText.setOrigin(0.5)

    this.pushButton.add([this.pushButtonBg, buttonText, tapText])
    this.pushButton.setDepth(80)
  }

  private createModifierChips(): void {
    this.modifierChips = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT - 160)

    const chips: string[] = []

    if (this.modifiers.tapPowerMultiplier > 1) {
      chips.push('2x POWER')
    }
    if (this.modifiers.extraTime > 0) {
      chips.push(`+${this.modifiers.extraTime}s TIME`)
    }
    if (this.modifiers.headStartPercent > 0) {
      chips.push('HEAD START')
    }
    if (this.modifiers.resistanceMultiplier < 1) {
      chips.push('MOMENTUM')
    }
    if (this.modifiers.extraLineman) {
      chips.push('+1 LINEMAN')
    }

    const chipWidth = 90
    const startX = -(chips.length - 1) * (chipWidth / 2 + 5)

    chips.forEach((label, i) => {
      const x = startX + i * (chipWidth + 10)

      const bg = this.add.graphics()
      bg.fillStyle(0x7ed957, 0.8)
      bg.fillRoundedRect(x - chipWidth / 2, -12, chipWidth, 24, 12)

      const text = this.add.text(x, 0, label, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '11px',
        color: '#0B1F24',
        fontStyle: 'bold',
      })
      text.setOrigin(0.5)

      this.modifierChips.add([bg, text])
    })

    this.modifierChips.setDepth(90)
  }

  private drawTurf(): void {
    const g = this.add.graphics()

    // Grass
    g.fillStyle(0x265221, 1)
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

    // Center line
    g.lineStyle(4, 0xffffff, 0.4)
    g.beginPath()
    g.moveTo(GAME_WIDTH / 2, 180)
    g.lineTo(GAME_WIDTH / 2, GAME_HEIGHT - 170)
    g.strokePath()

    // Yard markers
    g.lineStyle(2, 0xffffff, 0.2)
    for (let x = 80; x < GAME_WIDTH; x += 80) {
      if (x !== GAME_WIDTH / 2) {
        g.beginPath()
        g.moveTo(x, 180)
        g.lineTo(x, GAME_HEIGHT - 170)
        g.strokePath()
      }
    }

    g.setDepth(0)
  }

  private formatTime(seconds: number): string {
    const s = Math.max(0, seconds)
    return s.toFixed(1)
  }

  private updateDebug(): void {
    if (!this.debugText.visible) return

    const state = getGameState()

    this.debugText.setText([
      `Phase: ${this.phase}`,
      `Force: ${this.force.toFixed(1)} / ${this.targetForce}`,
      `Time: ${this.timeRemaining.toFixed(2)}s`,
      `Retry: ${state.retryCount}`,
      `TapMult: ${this.modifiers.tapPowerMultiplier}x`,
      `Resist: ${(this.levelConfig.opponentResistance * this.modifiers.resistanceMultiplier).toFixed(1)}`,
    ].join('\n'))
  }

  shutdown(): void {
    this.disableInput()
  }
}
