import * as Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONTS, hexToCSS } from '../config/phaserConfig'
import { useGameStore } from '../../store/gameStore'
import { AudioManager } from '../systems/AudioManager'

export class MenuScene extends Phaser.Scene {
  private particles: Phaser.GameObjects.Graphics[] = []
  private stadiumLights!: Phaser.GameObjects.Graphics
  
  constructor() {
    super({ key: 'MenuScene' })
  }

  create(): void {
    this.cameras.main.fadeIn(500)
    this.cameras.main.setBackgroundColor(COLORS.navy)

    // Create stadium atmosphere
    this.createStadiumBackground()
    this.createFloatingParticles()
    
    // Create UI elements
    this.createLogo()
    this.createTitle()
    this.createHighScore()
    this.createButtons()
    this.createFooter()
    
    // Animate stadium lights
    this.animateStadiumLights()
  }

  private createStadiumBackground(): void {
    const graphics = this.add.graphics()
    
    // Gradient background - dark navy to lighter
    for (let y = 0; y < GAME_HEIGHT; y++) {
      const progress = y / GAME_HEIGHT
      const r = Math.floor(0 + progress * 0)
      const g = Math.floor(26 + progress * 25)
      const b = Math.floor(51 + progress * 20)
      graphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1)
      graphics.fillRect(0, y, GAME_WIDTH, 1)
    }
    
    // Stadium lights effect (top)
    this.stadiumLights = this.add.graphics()
    this.stadiumLights.fillStyle(0xffffff, 0.03)
    this.stadiumLights.fillEllipse(GAME_WIDTH / 2, -100, GAME_WIDTH * 1.5, 300)
    
    // Field glow at bottom
    const fieldGlow = this.add.graphics()
    fieldGlow.fillStyle(COLORS.green, 0.1)
    fieldGlow.fillEllipse(GAME_WIDTH / 2, GAME_HEIGHT + 50, GAME_WIDTH * 1.2, 200)
    
    // Subtle grid lines (like a field)
    const lines = this.add.graphics()
    lines.lineStyle(1, 0xffffff, 0.02)
    for (let y = 100; y < GAME_HEIGHT; y += 80) {
      lines.moveTo(20, y)
      lines.lineTo(GAME_WIDTH - 20, y)
      lines.strokePath()
    }
  }

  private createFloatingParticles(): void {
    // Create floating particles for atmosphere
    for (let i = 0; i < 15; i++) {
      const particle = this.add.graphics()
      particle.fillStyle(COLORS.green, 0.3 + Math.random() * 0.3)
      particle.fillCircle(0, 0, 1 + Math.random() * 2)
      
      const startX = Math.random() * GAME_WIDTH
      const startY = Math.random() * GAME_HEIGHT
      particle.setPosition(startX, startY)
      
      // Floating animation
      this.tweens.add({
        targets: particle,
        y: particle.y - 100 - Math.random() * 100,
        x: particle.x + (Math.random() - 0.5) * 50,
        alpha: 0,
        duration: 4000 + Math.random() * 3000,
        repeat: -1,
        delay: Math.random() * 3000,
        onRepeat: () => {
          particle.setPosition(Math.random() * GAME_WIDTH, GAME_HEIGHT + 20)
          particle.setAlpha(0.3 + Math.random() * 0.3)
        }
      })
      
      this.particles.push(particle)
    }
  }

  private createLogo(): void {
    const centerX = GAME_WIDTH / 2
    const logoY = 90
    
    // Outer glow ring
    const outerRing = this.add.graphics()
    outerRing.lineStyle(3, COLORS.green, 0.3)
    outerRing.strokeCircle(centerX, logoY, 55)
    
    // Pulsing glow
    this.tweens.add({
      targets: outerRing,
      alpha: 0.6,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
    
    // Main circle
    const logoBg = this.add.graphics()
    logoBg.fillStyle(COLORS.navy, 1)
    logoBg.fillCircle(centerX, logoY, 45)
    logoBg.lineStyle(4, COLORS.green, 1)
    logoBg.strokeCircle(centerX, logoY, 45)
    
    // 12 text (12th Man)
    const logoText = this.add.text(centerX, logoY, '12', {
      fontSize: '36px',
      color: hexToCSS(COLORS.white),
      fontFamily: FONTS.display,
    })
    logoText.setOrigin(0.5)
    
    // Entrance animation
    logoBg.setScale(0)
    logoText.setScale(0)
    
    this.tweens.add({
      targets: [logoBg, logoText],
      scale: 1,
      duration: 600,
      delay: 200,
      ease: 'Back.easeOut'
    })
  }

  private createTitle(): void {
    const centerX = GAME_WIDTH / 2
    
    // Main title - SEAHAWKS
    const title = this.add.text(centerX, 175, 'SEAHAWKS', {
      fontSize: '48px',
      color: hexToCSS(COLORS.green),
      fontFamily: FONTS.display,
      stroke: hexToCSS(COLORS.navyDark),
      strokeThickness: 2,
    })
    title.setOrigin(0.5)
    title.setAlpha(0)
    
    // Add glow effect
    title.setShadow(0, 0, hexToCSS(COLORS.green), 20, true, true)
    
    // Subtitle - DEFENSE
    const subtitle = this.add.text(centerX, 220, 'DEFENSE', {
      fontSize: '32px',
      color: hexToCSS(COLORS.white),
      fontFamily: FONTS.display,
    })
    subtitle.setOrigin(0.5)
    subtitle.setAlpha(0)
    
    // Tagline
    const tagline = this.add.text(centerX, 260, 'The Legion Lives On', {
      fontSize: '14px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
      fontStyle: 'italic',
    })
    tagline.setOrigin(0.5)
    tagline.setAlpha(0)
    
    // Animate in
    this.tweens.add({
      targets: title,
      alpha: 1,
      y: title.y - 10,
      duration: 600,
      delay: 400,
      ease: 'Power2'
    })
    
    this.tweens.add({
      targets: subtitle,
      alpha: 1,
      y: subtitle.y - 10,
      duration: 600,
      delay: 500,
      ease: 'Power2'
    })
    
    this.tweens.add({
      targets: tagline,
      alpha: 1,
      duration: 600,
      delay: 600,
      ease: 'Power2'
    })
  }

  private createHighScore(): void {
    const { highScore } = useGameStore.getState()
    const centerX = GAME_WIDTH / 2
    
    if (highScore > 0) {
      // High score container
      const container = this.add.container(centerX, 310)
      
      const bg = this.add.graphics()
      bg.fillStyle(COLORS.navyLight, 0.5)
      bg.fillRoundedRect(-100, -20, 200, 40, 10)
      bg.lineStyle(1, COLORS.gold, 0.5)
      bg.strokeRoundedRect(-100, -20, 200, 40, 10)
      
      const trophy = this.add.text(-70, 0, '🏆', { fontSize: '18px' })
      trophy.setOrigin(0.5)
      
      const scoreText = this.add.text(10, 0, `HIGH SCORE: ${highScore.toLocaleString()}`, {
        fontSize: '14px',
        color: hexToCSS(COLORS.gold),
        fontFamily: FONTS.heading,
      })
      scoreText.setOrigin(0.5)
      
      container.add([bg, trophy, scoreText])
      container.setAlpha(0)
      
      this.tweens.add({
        targets: container,
        alpha: 1,
        y: container.y - 10,
        duration: 600,
        delay: 700,
        ease: 'Power2'
      })
    }
  }

  private createButtons(): void {
    const centerX = GAME_WIDTH / 2
    const { highScore } = useGameStore.getState()
    const buttonStartY = highScore > 0 ? 380 : 340

    // Play button - primary action
    const playButton = this.createPrimaryButton(centerX, buttonStartY, 'PLAY', () => {
      this.cameras.main.fadeOut(300)
      this.time.delayedCall(300, () => {
        this.scene.start('RosterScene')
      })
    })
    
    // Leaderboard button - secondary
    const leaderboardButton = this.createSecondaryButton(centerX, buttonStartY + 70, 'LEADERBOARD', () => {
      this.cameras.main.fadeOut(300)
      this.time.delayedCall(300, () => {
        this.scene.start('LeaderboardScene', { fromMenu: true })
      })
    })
    
    // Stagger entrance
    playButton.setAlpha(0).setScale(0.9)
    leaderboardButton.setAlpha(0).setScale(0.9)
    
    this.tweens.add({
      targets: playButton,
      alpha: 1,
      scale: 1,
      duration: 500,
      delay: 800,
      ease: 'Back.easeOut'
    })
    
    this.tweens.add({
      targets: leaderboardButton,
      alpha: 1,
      scale: 1,
      duration: 500,
      delay: 900,
      ease: 'Back.easeOut'
    })
  }

  private createPrimaryButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
    const width = 240
    const height = 56
    
    // Button glow (behind)
    const glow = this.add.graphics()
    glow.fillStyle(COLORS.green, 0.3)
    glow.fillRoundedRect(-width/2 - 5, -height/2 - 5, width + 10, height + 10, 16)
    glow.setAlpha(0)
    
    // Main button background
    const bg = this.add.graphics()
    this.drawGradientButton(bg, width, height, COLORS.green, COLORS.greenDark)
    
    // Shine effect
    const shine = this.add.graphics()
    shine.fillStyle(0xffffff, 0.2)
    shine.fillRoundedRect(-width/2 + 4, -height/2 + 4, width - 8, height/2 - 4, { tl: 10, tr: 10, bl: 0, br: 0 })
    
    // Icon + Text
    const icon = this.add.text(-40, 0, '🏈', { fontSize: '24px' })
    icon.setOrigin(0.5)
    
    const label = this.add.text(20, 0, text, {
      fontSize: '24px',
      color: hexToCSS(COLORS.navy),
      fontFamily: FONTS.display,
    })
    label.setOrigin(0.5)
    
    const container = this.add.container(x, y, [glow, bg, shine, icon, label])
    container.setSize(width, height)
    container.setInteractive({ useHandCursor: true })
    
    // Hover effects
    container.on('pointerover', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 150,
        ease: 'Power2'
      })
      this.tweens.add({
        targets: glow,
        alpha: 1,
        duration: 150
      })
    })
    
    container.on('pointerout', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 150,
        ease: 'Power2'
      })
      this.tweens.add({
        targets: glow,
        alpha: 0,
        duration: 150
      })
    })
    
    container.on('pointerdown', () => {
      container.setScale(0.95)
    })
    
    container.on('pointerup', () => {
      AudioManager.resume()
      AudioManager.playClick()
      container.setScale(1.05)
      callback()
    })
    
    return container
  }

  private createSecondaryButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
    const width = 200
    const height = 48
    
    const bg = this.add.graphics()
    bg.fillStyle(COLORS.navyLight, 0.5)
    bg.fillRoundedRect(-width/2, -height/2, width, height, 12)
    bg.lineStyle(2, COLORS.grey, 0.5)
    bg.strokeRoundedRect(-width/2, -height/2, width, height, 12)
    
    const label = this.add.text(0, 0, text, {
      fontSize: '16px',
      color: hexToCSS(COLORS.white),
      fontFamily: FONTS.heading,
    })
    label.setOrigin(0.5)
    
    const container = this.add.container(x, y, [bg, label])
    container.setSize(width, height)
    container.setInteractive({ useHandCursor: true })
    
    container.on('pointerover', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1.03,
        scaleY: 1.03,
        duration: 150
      })
      bg.clear()
      bg.fillStyle(COLORS.navyLight, 0.7)
      bg.fillRoundedRect(-width/2, -height/2, width, height, 12)
      bg.lineStyle(2, COLORS.green, 0.8)
      bg.strokeRoundedRect(-width/2, -height/2, width, height, 12)
      label.setColor(hexToCSS(COLORS.green))
    })
    
    container.on('pointerout', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 150
      })
      bg.clear()
      bg.fillStyle(COLORS.navyLight, 0.5)
      bg.fillRoundedRect(-width/2, -height/2, width, height, 12)
      bg.lineStyle(2, COLORS.grey, 0.5)
      bg.strokeRoundedRect(-width/2, -height/2, width, height, 12)
      label.setColor(hexToCSS(COLORS.white))
    })
    
    container.on('pointerdown', () => container.setScale(0.95))
    
    container.on('pointerup', () => {
      AudioManager.resume()
      AudioManager.playClick()
      container.setScale(1)
      callback()
    })
    
    return container
  }

  private drawGradientButton(graphics: Phaser.GameObjects.Graphics, width: number, height: number, color1: number, color2: number): void {
    // Simulated gradient with multiple fills
    const steps = 10
    for (let i = 0; i < steps; i++) {
      const progress = i / steps
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.IntegerToColor(color1),
        Phaser.Display.Color.IntegerToColor(color2),
        steps,
        i
      )
      const y = -height/2 + (height * progress)
      graphics.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b), 1)
      graphics.fillRect(-width/2, y, width, height/steps + 1)
    }
    
    // Rounded corners mask (draw over with navy at corners)
    graphics.fillStyle(color1, 1)
    graphics.fillRoundedRect(-width/2, -height/2, width, height, 14)
  }

  private createFooter(): void {
    const centerX = GAME_WIDTH / 2
    
    // DrinkSip branding
    const drinkSipBg = this.add.graphics()
    drinkSipBg.fillStyle(COLORS.navyDark, 0.6)
    drinkSipBg.fillRoundedRect(centerX - 150, GAME_HEIGHT - 100, 300, 70, 15)
    
    const poweredBy = this.add.text(centerX, GAME_HEIGHT - 85, 'POWERED BY', {
      fontSize: '9px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
      letterSpacing: 2,
    })
    poweredBy.setOrigin(0.5)
    
    const drinkSip = this.add.text(centerX, GAME_HEIGHT - 65, 'DrinkSip', {
      fontSize: '20px',
      color: hexToCSS(COLORS.white),
      fontFamily: FONTS.heading,
    })
    drinkSip.setOrigin(0.5)
    
    const wakeUp = this.add.text(centerX, GAME_HEIGHT - 45, 'Wake Up Happy™', {
      fontSize: '11px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
      fontStyle: 'italic',
    })
    wakeUp.setOrigin(0.5)
    
    // Fade in footer
    const footerElements = [drinkSipBg, poweredBy, drinkSip, wakeUp]
    footerElements.forEach((el, i) => {
      el.setAlpha(0)
      this.tweens.add({
        targets: el,
        alpha: 1,
        duration: 600,
        delay: 1000 + i * 50,
        ease: 'Power2'
      })
    })
  }

  private animateStadiumLights(): void {
    this.tweens.add({
      targets: this.stadiumLights,
      alpha: 0.8,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }
}
