import * as Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT } from '../config/phaserConfig'
import { SEATTLE_DARKSIDE, hexToNumber } from '../data/teams'
import { getGameState } from '../../store/gameStore'

/**
 * MenuScene - Main menu with Play button
 */

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' })
  }

  create(): void {
    const centerX = GAME_WIDTH / 2
    const centerY = GAME_HEIGHT / 2

    // Background gradient
    const bg = this.add.graphics()
    bg.fillGradientStyle(
      hexToNumber(SEATTLE_DARKSIDE.colors.trim),
      hexToNumber(SEATTLE_DARKSIDE.colors.trim),
      0x1a472a,
      0x1a472a,
      1
    )
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

    // Title
    const title = this.add.text(centerX, 100, 'ROAD TO THE\nSUPER BOWL', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '44px',
      color: '#ffffff',
      align: 'center',
      stroke: '#0b1f24',
      strokeThickness: 5,
      lineSpacing: 8,
    })
    title.setOrigin(0.5)

    // Team name
    const teamName = this.add.text(centerX, 210, 'SEATTLE DARKSIDE', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '30px',
      color: SEATTLE_DARKSIDE.colors.accent,
      stroke: SEATTLE_DARKSIDE.colors.trim,
      strokeThickness: 4,
    })
    teamName.setOrigin(0.5)

    // Subtitle
    const subtitle = this.add.text(centerX, 250, 'Defensive Dynasty', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#aaaaaa',
      fontStyle: 'italic',
    })
    subtitle.setOrigin(0.5)

    // Helmet preview
    this.drawHelmet(centerX, 350)

    // Play button
    this.createPlayButton(centerX, 480)

    // Instructions
    const instructions = this.add.text(centerX, 540, 'Tap rapidly to push through the defense!', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#777777',
    })
    instructions.setOrigin(0.5)

    // Debug toggle hint
    const debugHint = this.add.text(centerX, GAME_HEIGHT - 20, 'Press D for debug mode', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#444444',
    })
    debugHint.setOrigin(0.5)
  }

  private drawHelmet(x: number, y: number): void {
    const g = this.add.graphics()
    const colors = SEATTLE_DARKSIDE.colors

    // Helmet base
    g.fillStyle(hexToNumber(colors.primary), 1)
    g.fillEllipse(x, y, 90, 75)

    // Facemask
    g.lineStyle(5, hexToNumber(colors.trim), 1)
    g.beginPath()
    g.moveTo(x + 35, y - 12)
    g.lineTo(x + 50, y - 5)
    g.lineTo(x + 50, y + 18)
    g.lineTo(x + 35, y + 25)
    g.strokePath()

    // Stripe
    g.lineStyle(7, hexToNumber(colors.accent), 1)
    g.beginPath()
    g.moveTo(x - 25, y - 38)
    g.lineTo(x, y - 44)
    g.lineTo(x + 25, y - 38)
    g.strokePath()
  }

  private createPlayButton(x: number, y: number): void {
    const buttonWidth = 200
    const buttonHeight = 65

    const container = this.add.container(x, y)

    const bg = this.add.graphics()
    bg.fillStyle(hexToNumber(SEATTLE_DARKSIDE.colors.primary), 1)
    bg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 16)
    bg.lineStyle(4, hexToNumber(SEATTLE_DARKSIDE.colors.accent), 1)
    bg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 16)

    const text = this.add.text(0, 0, 'PLAY NOW', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '26px',
      color: '#ffffff',
    })
    text.setOrigin(0.5)

    container.add([bg, text])

    // Interactive
    const hitArea = new Phaser.Geom.Rectangle(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight)
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains)

    container.on('pointerover', () => {
      bg.clear()
      bg.fillStyle(hexToNumber(SEATTLE_DARKSIDE.colors.accent), 1)
      bg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 16)
      text.setColor('#0B1F24')
    })

    container.on('pointerout', () => {
      bg.clear()
      bg.fillStyle(hexToNumber(SEATTLE_DARKSIDE.colors.primary), 1)
      bg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 16)
      bg.lineStyle(4, hexToNumber(SEATTLE_DARKSIDE.colors.accent), 1)
      bg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 16)
      text.setColor('#ffffff')
    })

    container.on('pointerdown', () => {
      this.startGame()
    })

    // Pulse animation
    this.tweens.add({
      targets: container,
      scaleX: 1.03,
      scaleY: 1.03,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
  }

  private startGame(): void {
    const state = getGameState()
    state.startGame()

    this.cameras.main.fadeOut(300, 0, 0, 0)
    this.time.delayedCall(300, () => {
      this.scene.start('RoadScene')
    })
  }
}
