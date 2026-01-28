import * as Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/phaserConfig'
import { useGameStore } from '../../store/gameStore'
import { AudioManager } from '../systems/AudioManager'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' })
  }

  create(): void {
    this.cameras.main.fadeIn(300)
    this.cameras.main.setBackgroundColor(COLORS.trim)

    const centerX = GAME_WIDTH / 2

    // Title
    const title = this.add.text(centerX, 120, 'DARKSIDE', {
      fontSize: '42px',
      color: '#' + COLORS.primary.toString(16).padStart(6, '0'),
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 3,
    })
    title.setOrigin(0.5)

    const subtitle = this.add.text(centerX, 165, 'DEFENSE', {
      fontSize: '28px',
      color: '#' + COLORS.accent.toString(16).padStart(6, '0'),
      fontFamily: 'Arial Black',
    })
    subtitle.setOrigin(0.5)

    // Tagline
    const tagline = this.add.text(centerX, 210, 'Tackle Everything.', {
      fontSize: '14px',
      color: '#888888',
      fontFamily: 'Arial',
      fontStyle: 'italic',
    })
    tagline.setOrigin(0.5)

    // High score display
    const { highScore } = useGameStore.getState()
    if (highScore > 0) {
      const highScoreText = this.add.text(centerX, 260, `HIGH SCORE: ${highScore.toLocaleString()}`, {
        fontSize: '16px',
        color: '#' + COLORS.gold.toString(16).padStart(6, '0'),
        fontFamily: 'Arial Black',
      })
      highScoreText.setOrigin(0.5)
    }

    // Play button
    const playButton = this.createButton(centerX, 350, 'PLAY', COLORS.accent, () => {
      this.cameras.main.fadeOut(200)
      this.time.delayedCall(200, () => {
        this.scene.start('RosterScene')
      })
    })

    // Leaderboard button
    const leaderboardButton = this.createButton(centerX, 430, 'LEADERBOARD', COLORS.primary, () => {
      this.cameras.main.fadeOut(200)
      this.time.delayedCall(200, () => {
        this.scene.start('LeaderboardScene', { fromMenu: true })
      })
    })

    // DrinkSip branding at bottom
    const drinkSip = this.add.text(centerX, GAME_HEIGHT - 60, 'Powered by DrinkSip', {
      fontSize: '12px',
      color: '#666666',
      fontFamily: 'Arial',
    })
    drinkSip.setOrigin(0.5)

    const wakeUp = this.add.text(centerX, GAME_HEIGHT - 40, 'Wake Up Happy™', {
      fontSize: '10px',
      color: '#444444',
      fontFamily: 'Arial',
      fontStyle: 'italic',
    })
    wakeUp.setOrigin(0.5)
  }

  private createButton(
    x: number,
    y: number,
    text: string,
    color: number,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const width = 200
    const height = 50

    const bg = this.add.graphics()
    bg.fillStyle(color, 1)
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10)

    const label = this.add.text(0, 0, text, {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial Black',
    })
    label.setOrigin(0.5)

    const container = this.add.container(x, y, [bg, label])
    container.setSize(width, height)
    container.setInteractive({ useHandCursor: true })

    // Hover effects
    container.on('pointerover', () => {
      container.setScale(1.05)
    })

    container.on('pointerout', () => {
      container.setScale(1)
    })

    container.on('pointerdown', () => {
      container.setScale(0.95)
    })

    container.on('pointerup', () => {
      AudioManager.resume()
      AudioManager.playClick()
      container.setScale(1)
      callback()
    })

    return container
  }
}
