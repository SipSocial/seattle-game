import * as Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT } from '../config/phaserConfig'
import { SEATTLE_DARKSIDE, hexToNumber } from '../data/teams'
import { getGameState } from '../../store/gameStore'

/**
 * VictoryScene - Super Bowl Champions celebration!
 * 
 * Features:
 * - Confetti animation
 * - Trophy display
 * - Stats summary
 * - Restart option
 */

const CONFETTI_COUNT = 120

export class VictoryScene extends Phaser.Scene {
  private confettiParticles: Phaser.GameObjects.Rectangle[] = []

  constructor() {
    super({ key: 'VictoryScene' })
  }

  create(): void {
    const state = getGameState()
    this.confettiParticles = []

    // Background gradient
    const bg = this.add.graphics()
    bg.fillGradientStyle(
      hexToNumber(SEATTLE_DARKSIDE.colors.trim),
      hexToNumber(SEATTLE_DARKSIDE.colors.trim),
      hexToNumber(SEATTLE_DARKSIDE.colors.primary),
      hexToNumber(SEATTLE_DARKSIDE.colors.primary),
      1
    )
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

    // Confetti
    this.createConfetti()

    // Trophy
    this.drawTrophy(GAME_WIDTH / 2, 190)

    // Main title
    const superBowl = this.add.text(GAME_WIDTH / 2, 330, 'SUPER BOWL', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '52px',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 6,
    })
    superBowl.setOrigin(0.5)

    const champions = this.add.text(GAME_WIDTH / 2, 385, 'CHAMPIONS!', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '44px',
      color: '#ffffff',
      stroke: '#0B1F24',
      strokeThickness: 5,
    })
    champions.setOrigin(0.5)

    // Team name
    const teamName = this.add.text(GAME_WIDTH / 2, 440, SEATTLE_DARKSIDE.name.toUpperCase(), {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '28px',
      color: SEATTLE_DARKSIDE.colors.accent,
      stroke: SEATTLE_DARKSIDE.colors.trim,
      strokeThickness: 3,
    })
    teamName.setOrigin(0.5)

    // Stats
    const statsText = `Total Taps: ${state.totalTaps} | Victories: ${state.totalWins}`
    const stats = this.add.text(GAME_WIDTH / 2, 485, statsText, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#cccccc',
    })
    stats.setOrigin(0.5)

    // Play Again button
    this.createRestartButton()

    // Pulse animation on titles
    this.tweens.add({
      targets: [superBowl, champions],
      scaleX: 1.03,
      scaleY: 1.03,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
  }

  update(): void {
    // Animate confetti
    for (const particle of this.confettiParticles) {
      particle.y += 1.5 + Math.random() * 1.5
      particle.x += Math.sin(particle.y * 0.03) * 0.8
      particle.rotation += 0.04

      // Reset if off screen
      if (particle.y > GAME_HEIGHT + 20) {
        particle.y = -20
        particle.x = Math.random() * GAME_WIDTH
      }
    }
  }

  private createConfetti(): void {
    const colors = [
      hexToNumber(SEATTLE_DARKSIDE.colors.primary),
      hexToNumber(SEATTLE_DARKSIDE.colors.accent),
      0xffd700, // Gold
      0xffffff, // White
      0xff6b6b, // Red
      0x6b9fff, // Blue
    ]

    for (let i = 0; i < CONFETTI_COUNT; i++) {
      const x = Math.random() * GAME_WIDTH
      const y = Math.random() * GAME_HEIGHT - GAME_HEIGHT
      const width = 6 + Math.random() * 8
      const height = 3 + Math.random() * 5
      const color = colors[Math.floor(Math.random() * colors.length)]

      const particle = this.add.rectangle(x, y, width, height, color)
      particle.rotation = Math.random() * Math.PI
      particle.setDepth(10)
      this.confettiParticles.push(particle)
    }
  }

  private drawTrophy(x: number, y: number): void {
    const g = this.add.graphics()
    g.setDepth(20)

    // Trophy cup body
    g.fillStyle(0xffd700, 1)
    g.beginPath()
    g.moveTo(x - 45, y - 55)
    g.lineTo(x + 45, y - 55)
    g.lineTo(x + 35, y + 15)
    g.lineTo(x - 35, y + 15)
    g.closePath()
    g.fillPath()

    // Rim
    g.fillStyle(0xffec8b, 1)
    g.fillRect(x - 50, y - 65, 100, 14)

    // Handles
    g.lineStyle(10, 0xffd700, 1)
    g.beginPath()
    g.arc(x - 50, y - 30, 22, -Math.PI / 2, Math.PI / 2)
    g.strokePath()
    g.beginPath()
    g.arc(x + 50, y - 30, 22, Math.PI / 2, -Math.PI / 2)
    g.strokePath()

    // Base
    g.fillStyle(0xffd700, 1)
    g.fillRect(x - 18, y + 15, 36, 28)
    g.fillRect(x - 35, y + 43, 70, 14)

    // Star decoration
    g.fillStyle(hexToNumber(SEATTLE_DARKSIDE.colors.primary), 1)
    this.drawStar(g, x, y - 25, 14, 5)

    // Shine
    g.fillStyle(0xffffff, 0.25)
    g.fillRect(x - 32, y - 50, 8, 55)
  }

  private drawStar(
    g: Phaser.GameObjects.Graphics,
    cx: number,
    cy: number,
    radius: number,
    points: number
  ): void {
    const innerRadius = radius * 0.5

    g.beginPath()
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? radius : innerRadius
      const angle = (i * Math.PI) / points - Math.PI / 2
      const px = cx + r * Math.cos(angle)
      const py = cy + r * Math.sin(angle)

      if (i === 0) {
        g.moveTo(px, py)
      } else {
        g.lineTo(px, py)
      }
    }
    g.closePath()
    g.fillPath()
  }

  private createRestartButton(): void {
    const buttonY = 545
    const buttonWidth = 180
    const buttonHeight = 50

    const container = this.add.container(GAME_WIDTH / 2, buttonY)

    const bg = this.add.graphics()
    bg.fillStyle(hexToNumber(SEATTLE_DARKSIDE.colors.primary), 1)
    bg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 12)
    bg.lineStyle(3, hexToNumber(SEATTLE_DARKSIDE.colors.accent), 1)
    bg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 12)

    const text = this.add.text(0, 0, 'PLAY AGAIN', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '20px',
      color: '#ffffff',
    })
    text.setOrigin(0.5)

    container.add([bg, text])
    container.setDepth(30)

    // Interactive
    const hitArea = new Phaser.Geom.Rectangle(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight)
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains)

    container.on('pointerover', () => {
      bg.clear()
      bg.fillStyle(hexToNumber(SEATTLE_DARKSIDE.colors.accent), 1)
      bg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 12)
      text.setColor('#0B1F24')
    })

    container.on('pointerout', () => {
      bg.clear()
      bg.fillStyle(hexToNumber(SEATTLE_DARKSIDE.colors.primary), 1)
      bg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 12)
      bg.lineStyle(3, hexToNumber(SEATTLE_DARKSIDE.colors.accent), 1)
      bg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 12)
      text.setColor('#ffffff')
    })

    container.on('pointerdown', () => {
      const state = getGameState()
      state.resetGame()
      this.scene.start('MenuScene')
    })
  }
}
