import * as Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONTS, hexToCSS } from '../config/phaserConfig'

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload(): void {
    // Premium loading screen
    const centerX = GAME_WIDTH / 2
    const centerY = GAME_HEIGHT / 2
    
    // Background
    this.cameras.main.setBackgroundColor(COLORS.navy)
    
    // Loading bar container
    const barWidth = GAME_WIDTH * 0.6
    const barHeight = 8
    const barX = (GAME_WIDTH - barWidth) / 2
    const barY = centerY + 100
    
    // Progress bar background
    const progressBox = this.add.graphics()
    progressBox.fillStyle(COLORS.navyLight, 1)
    progressBox.fillRoundedRect(barX, barY, barWidth, barHeight, 4)
    
    // Progress bar fill
    const progressBar = this.add.graphics()
    
    // Loading text
    const loadingText = this.add.text(centerX, centerY + 130, 'LOADING', {
      fontSize: '12px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
      letterSpacing: 4,
    })
    loadingText.setOrigin(0.5)
    
    // 12 logo animation during load
    const logoCircle = this.add.graphics()
    logoCircle.lineStyle(3, COLORS.green, 0.5)
    logoCircle.strokeCircle(centerX, centerY - 20, 50)
    
    // Spinning ring animation
    this.tweens.add({
      targets: logoCircle,
      angle: 360,
      duration: 2000,
      repeat: -1,
      ease: 'Linear'
    })
    
    // Update progress bar
    this.load.on('progress', (value: number) => {
      progressBar.clear()
      progressBar.fillStyle(COLORS.green, 1)
      progressBar.fillRoundedRect(barX + 2, barY + 2, (barWidth - 4) * value, barHeight - 4, 3)
    })

    this.load.on('complete', () => {
      progressBar.destroy()
      progressBox.destroy()
      loadingText.destroy()
      logoCircle.destroy()
    })

    // Preload any assets here (for future Leonardo AI assets)
    // this.load.image('stadium-bg', '/assets/stadium.png')
  }

  create(): void {
    this.showPremiumBranding()
  }

  private showPremiumBranding(): void {
    this.cameras.main.setBackgroundColor(COLORS.navy)
    
    const centerX = GAME_WIDTH / 2
    const centerY = GAME_HEIGHT / 2

    // Stadium lights effect
    const lightsGlow = this.add.graphics()
    lightsGlow.fillStyle(0xffffff, 0.02)
    lightsGlow.fillEllipse(centerX, -50, GAME_WIDTH * 1.5, 300)
    
    // Field glow at bottom
    const fieldGlow = this.add.graphics()
    fieldGlow.fillStyle(COLORS.green, 0.08)
    fieldGlow.fillEllipse(centerX, GAME_HEIGHT + 50, GAME_WIDTH, 200)

    // Outer ring (pulsing)
    const outerRing = this.add.graphics()
    outerRing.lineStyle(2, COLORS.green, 0.3)
    outerRing.strokeCircle(centerX, centerY - 60, 70)
    
    this.tweens.add({
      targets: outerRing,
      scaleX: 1.2,
      scaleY: 1.2,
      alpha: 0,
      duration: 1500,
      repeat: -1,
      ease: 'Sine.easeOut'
    })

    // Main circle
    const logoCircle = this.add.graphics()
    logoCircle.fillStyle(COLORS.navyLight, 1)
    logoCircle.fillCircle(centerX, centerY - 60, 55)
    logoCircle.lineStyle(4, COLORS.green, 1)
    logoCircle.strokeCircle(centerX, centerY - 60, 55)
    
    // 12 text (12th Man)
    const twelveText = this.add.text(centerX, centerY - 60, '12', {
      fontSize: '48px',
      color: hexToCSS(COLORS.white),
      fontFamily: FONTS.display,
    })
    twelveText.setOrigin(0.5)
    
    // Entrance animation for logo
    logoCircle.setScale(0)
    twelveText.setScale(0)
    
    this.tweens.add({
      targets: [logoCircle, twelveText],
      scale: 1,
      duration: 600,
      delay: 200,
      ease: 'Back.easeOut'
    })

    // "SEAHAWKS" title
    const title = this.add.text(centerX, centerY + 30, 'SEAHAWKS', {
      fontSize: '42px',
      color: hexToCSS(COLORS.green),
      fontFamily: FONTS.display,
    })
    title.setOrigin(0.5)
    title.setAlpha(0)
    title.setShadow(0, 0, hexToCSS(COLORS.green), 15, true, true)

    // "DEFENSE" subtitle
    const subtitle = this.add.text(centerX, centerY + 75, 'DEFENSE', {
      fontSize: '28px',
      color: hexToCSS(COLORS.white),
      fontFamily: FONTS.display,
    })
    subtitle.setOrigin(0.5)
    subtitle.setAlpha(0)
    
    // Tagline
    const tagline = this.add.text(centerX, centerY + 115, 'The Legion Lives On', {
      fontSize: '13px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
      fontStyle: 'italic',
    })
    tagline.setOrigin(0.5)
    tagline.setAlpha(0)

    // Animate text in
    this.tweens.add({
      targets: title,
      alpha: 1,
      y: title.y - 10,
      duration: 500,
      delay: 500,
      ease: 'Power2'
    })
    
    this.tweens.add({
      targets: subtitle,
      alpha: 1,
      y: subtitle.y - 10,
      duration: 500,
      delay: 600,
      ease: 'Power2'
    })
    
    this.tweens.add({
      targets: tagline,
      alpha: 1,
      duration: 500,
      delay: 700,
      ease: 'Power2'
    })

    // Powered by section
    const poweredByBg = this.add.graphics()
    poweredByBg.fillStyle(COLORS.navyDark, 0.6)
    poweredByBg.fillRoundedRect(centerX - 100, GAME_HEIGHT - 130, 200, 70, 12)
    poweredByBg.setAlpha(0)
    
    const poweredBy = this.add.text(centerX, GAME_HEIGHT - 110, 'POWERED BY', {
      fontSize: '9px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
      letterSpacing: 2,
    })
    poweredBy.setOrigin(0.5)
    poweredBy.setAlpha(0)

    const drinkSip = this.add.text(centerX, GAME_HEIGHT - 90, 'DrinkSip', {
      fontSize: '22px',
      color: hexToCSS(COLORS.white),
      fontFamily: FONTS.heading,
    })
    drinkSip.setOrigin(0.5)
    drinkSip.setAlpha(0)

    const wakeUp = this.add.text(centerX, GAME_HEIGHT - 68, 'Wake Up Happy™', {
      fontSize: '11px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
      fontStyle: 'italic',
    })
    wakeUp.setOrigin(0.5)
    wakeUp.setAlpha(0)
    
    // Animate powered by section
    this.tweens.add({
      targets: [poweredByBg, poweredBy, drinkSip, wakeUp],
      alpha: 1,
      duration: 600,
      delay: 900,
      ease: 'Power2'
    })

    // Fade in
    this.cameras.main.fadeIn(600)

    // Transition directly to game (React handles player selection before Phaser loads)
    this.time.delayedCall(2500, () => {
      this.cameras.main.fadeOut(500)
      this.time.delayedCall(500, () => {
        // Go directly to GameScene - player selection is handled by React
        this.scene.start('GameScene')
      })
    })
  }
}
