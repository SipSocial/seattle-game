import * as Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/phaserConfig'

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload(): void {
    // Create loading bar
    const width = GAME_WIDTH * 0.6
    const height = 20
    const x = (GAME_WIDTH - width) / 2
    const y = GAME_HEIGHT / 2 + 50

    const progressBar = this.add.graphics()
    const progressBox = this.add.graphics()
    progressBox.fillStyle(0x222222, 0.8)
    progressBox.fillRect(x, y, width, height)

    // Loading text
    const loadingText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'LOADING...', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial Black',
    })
    loadingText.setOrigin(0.5)

    // Update progress bar
    this.load.on('progress', (value: number) => {
      progressBar.clear()
      progressBar.fillStyle(COLORS.accent, 1)
      progressBar.fillRect(x + 5, y + 5, (width - 10) * value, height - 10)
    })

    this.load.on('complete', () => {
      progressBar.destroy()
      progressBox.destroy()
      loadingText.destroy()
    })

    // Load any assets here
    // For now we're using procedural graphics, so minimal loading needed
  }

  create(): void {
    // Show branding splash
    this.showBranding()
  }

  private showBranding(): void {
    // Background
    this.cameras.main.setBackgroundColor(COLORS.trim)

    // DrinkSip + Darkside branding
    const centerX = GAME_WIDTH / 2
    const centerY = GAME_HEIGHT / 2

    // "DARKSIDE" title
    const title = this.add.text(centerX, centerY - 60, 'DARKSIDE', {
      fontSize: '48px',
      color: '#' + COLORS.primary.toString(16).padStart(6, '0'),
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 4,
    })
    title.setOrigin(0.5)

    // "DEFENSE" subtitle
    const subtitle = this.add.text(centerX, centerY, 'DEFENSE', {
      fontSize: '32px',
      color: '#' + COLORS.accent.toString(16).padStart(6, '0'),
      fontFamily: 'Arial Black',
    })
    subtitle.setOrigin(0.5)

    // "Powered by DrinkSip" 
    const poweredBy = this.add.text(centerX, centerY + 80, 'Powered by', {
      fontSize: '14px',
      color: '#888888',
      fontFamily: 'Arial',
    })
    poweredBy.setOrigin(0.5)

    const drinkSip = this.add.text(centerX, centerY + 105, 'DrinkSip', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial Black',
    })
    drinkSip.setOrigin(0.5)

    // "Wake Up Happy" tagline
    const tagline = this.add.text(centerX, centerY + 140, 'Wake Up Happy™', {
      fontSize: '12px',
      color: '#666666',
      fontFamily: 'Arial',
      fontStyle: 'italic',
    })
    tagline.setOrigin(0.5)

    // Fade in and transition
    this.cameras.main.fadeIn(500)

    // Transition to menu after delay
    this.time.delayedCall(2000, () => {
      this.cameras.main.fadeOut(500)
      this.time.delayedCall(500, () => {
        this.scene.start('MenuScene')
      })
    })
  }
}
