import * as Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONTS, hexToCSS } from '../config/phaserConfig'
import { useGameStore } from '../../store/gameStore'
import { AudioManager } from '../systems/AudioManager'

/**
 * EngageScene - End screen with social engagement CTAs
 * Features slide-in animations like YouTube end screens
 * - Follow: DrinkSipGo and Tank Lawrence socials
 * - Enter: Giveaway entry
 * - Share: Share the game
 */
export class EngageScene extends Phaser.Scene {
  private cards: Phaser.GameObjects.Container[] = []
  
  constructor() {
    super({ key: 'EngageScene' })
  }

  create(): void {
    this.cameras.main.fadeIn(400)
    this.cameras.main.setBackgroundColor(COLORS.navy)
    
    this.cards = []
    
    this.createBackground()
    this.createHeader()
    this.createFollowCard()
    this.createEnterCard()
    this.createShareCard()
    this.createContinueButton()
  }

  private createBackground(): void {
    const graphics = this.add.graphics()
    
    // Dark gradient
    for (let y = 0; y < GAME_HEIGHT; y++) {
      const progress = y / GAME_HEIGHT
      const r = Math.floor(0)
      const g = Math.floor(26 + progress * 10)
      const b = Math.floor(51 + progress * 15)
      graphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1)
      graphics.fillRect(0, y, GAME_WIDTH, 1)
    }
    
    // Stadium lights effect
    const lightsGlow = this.add.graphics()
    lightsGlow.fillStyle(COLORS.green, 0.08)
    lightsGlow.fillEllipse(GAME_WIDTH / 2, 0, GAME_WIDTH, 200)
    
    // Bottom glow
    const bottomGlow = this.add.graphics()
    bottomGlow.fillStyle(COLORS.green, 0.05)
    bottomGlow.fillEllipse(GAME_WIDTH / 2, GAME_HEIGHT, GAME_WIDTH, 150)
    
    // Floating particles for atmosphere
    for (let i = 0; i < 15; i++) {
      const particle = this.add.graphics()
      particle.fillStyle(COLORS.green, 0.3 + Math.random() * 0.2)
      particle.fillCircle(0, 0, 1 + Math.random() * 2)
      particle.setPosition(Math.random() * GAME_WIDTH, Math.random() * GAME_HEIGHT)
      
      this.tweens.add({
        targets: particle,
        y: particle.y - 100,
        alpha: 0,
        duration: 3000 + Math.random() * 2000,
        repeat: -1,
        delay: Math.random() * 2000,
        onRepeat: () => {
          particle.setPosition(Math.random() * GAME_WIDTH, GAME_HEIGHT + 20)
          particle.setAlpha(0.3 + Math.random() * 0.2)
        }
      })
    }
  }

  private createHeader(): void {
    const centerX = GAME_WIDTH / 2
    
    // Thanks for playing text
    const thanksText = this.add.text(centerX, 50, 'THANKS FOR PLAYING!', {
      fontSize: '22px',
      color: hexToCSS(COLORS.green),
      fontFamily: FONTS.display,
      letterSpacing: 2,
    })
    thanksText.setOrigin(0.5)
    thanksText.setAlpha(0)
    
    this.tweens.add({
      targets: thanksText,
      alpha: 1,
      y: thanksText.y - 10,
      duration: 500,
      delay: 200,
      ease: 'Power2'
    })
    
    // Subtitle
    const subtitle = this.add.text(centerX, 80, 'Connect with us for more!', {
      fontSize: '12px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
    })
    subtitle.setOrigin(0.5)
    subtitle.setAlpha(0)
    
    this.tweens.add({
      targets: subtitle,
      alpha: 1,
      duration: 400,
      delay: 400
    })
  }

  private createFollowCard(): void {
    const y = 160
    const card = this.createCard(
      y,
      '📱',
      'FOLLOW',
      'Follow for updates & more games',
      COLORS.green,
      0,
      () => this.showFollowOptions()
    )
    this.cards.push(card)
  }

  private createEnterCard(): void {
    const y = 310
    const card = this.createCard(
      y,
      '🎁',
      'ENTER GIVEAWAY',
      'Win a signed jersey & DrinkSip gear',
      COLORS.gold,
      1,
      () => this.showGiveawayEntry()
    )
    this.cards.push(card)
  }

  private createShareCard(): void {
    const y = 460
    const card = this.createCard(
      y,
      '🔗',
      'SHARE',
      'Challenge your friends!',
      COLORS.greenLight,
      2,
      () => this.shareGame()
    )
    this.cards.push(card)
  }

  private createCard(
    y: number,
    icon: string,
    title: string,
    description: string,
    accentColor: number,
    index: number,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const width = 340
    const height = 120
    const x = GAME_WIDTH / 2
    
    // Card background
    const bg = this.add.graphics()
    bg.fillStyle(COLORS.navyLight, 0.9)
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 16)
    bg.lineStyle(2, accentColor, 0.6)
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 16)
    
    // Left accent bar
    const accent = this.add.graphics()
    accent.fillStyle(accentColor, 1)
    accent.fillRoundedRect(-width / 2, -height / 2, 8, height, { tl: 16, bl: 16, tr: 0, br: 0 })
    
    // Icon container
    const iconBg = this.add.graphics()
    iconBg.fillStyle(accentColor, 0.2)
    iconBg.fillCircle(-width / 2 + 55, 0, 35)
    
    const iconText = this.add.text(-width / 2 + 55, 0, icon, { fontSize: '36px' })
    iconText.setOrigin(0.5)
    
    // Title
    const titleText = this.add.text(-width / 2 + 110, -15, title, {
      fontSize: '20px',
      color: hexToCSS(COLORS.white),
      fontFamily: FONTS.display,
    })
    
    // Description
    const descText = this.add.text(-width / 2 + 110, 15, description, {
      fontSize: '12px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
    })
    
    // Arrow indicator
    const arrow = this.add.text(width / 2 - 30, 0, '→', {
      fontSize: '24px',
      color: hexToCSS(accentColor),
      fontFamily: FONTS.display,
    })
    arrow.setOrigin(0.5)
    arrow.setAlpha(0.5)
    
    // Checkmark for completed (hidden initially)
    const check = this.add.text(width / 2 - 30, 0, '✓', {
      fontSize: '24px',
      color: hexToCSS(COLORS.green),
      fontFamily: FONTS.display,
    })
    check.setOrigin(0.5)
    check.setAlpha(0)
    check.setName('check')
    
    const container = this.add.container(x, y, [bg, accent, iconBg, iconText, titleText, descText, arrow, check])
    container.setSize(width, height)
    
    // Start off-screen to the right
    container.setX(GAME_WIDTH + width)
    container.setAlpha(0)
    
    // Slide-in animation (like YouTube end screens)
    this.tweens.add({
      targets: container,
      x: x,
      alpha: 1,
      duration: 500,
      delay: 500 + index * 150,
      ease: 'Power3.easeOut',
      onComplete: () => {
        // Make interactive after animation completes
        this.time.delayedCall(200, () => {
          container.setInteractive({ useHandCursor: true })
          
          container.on('pointerover', () => {
            this.tweens.add({ targets: container, scaleX: 1.03, scaleY: 1.03, duration: 150 })
            arrow.setAlpha(1)
            bg.clear()
            bg.fillStyle(COLORS.navyLight, 1)
            bg.fillRoundedRect(-width / 2, -height / 2, width, height, 16)
            bg.lineStyle(3, accentColor, 1)
            bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 16)
          })
          
          container.on('pointerout', () => {
            this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 150 })
            arrow.setAlpha(0.5)
            bg.clear()
            bg.fillStyle(COLORS.navyLight, 0.9)
            bg.fillRoundedRect(-width / 2, -height / 2, width, height, 16)
            bg.lineStyle(2, accentColor, 0.6)
            bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 16)
          })
          
          container.on('pointerdown', () => {
            AudioManager.playClick()
            callback()
          })
        })
      }
    })
    
    return container
  }

  private showFollowOptions(): void {
    const store = useGameStore.getState()
    
    // Create overlay
    const overlay = this.add.graphics()
    overlay.fillStyle(0x000000, 0.85)
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    overlay.setAlpha(0)
    
    const overlayContainer = this.add.container(0, 0, [overlay])
    overlayContainer.setDepth(10)
    
    this.tweens.add({
      targets: overlay,
      alpha: 1,
      duration: 200
    })
    
    // Title
    const title = this.add.text(GAME_WIDTH / 2, 60, 'FOLLOW US', {
      fontSize: '28px',
      color: hexToCSS(COLORS.green),
      fontFamily: FONTS.display,
    })
    title.setOrigin(0.5)
    title.setAlpha(0)
    overlayContainer.add(title)
    
    this.tweens.add({
      targets: title,
      alpha: 1,
      y: title.y - 10,
      duration: 300,
      delay: 100
    })
    
    // DrinkSipGo section
    const drinkSipTitle = this.add.text(GAME_WIDTH / 2, 120, 'DrinkSipGo', {
      fontSize: '18px',
      color: hexToCSS(COLORS.white),
      fontFamily: FONTS.display,
    })
    drinkSipTitle.setOrigin(0.5)
    overlayContainer.add(drinkSipTitle)
    
    // Social buttons for DrinkSipGo
    const drinkSipSocials = [
      { icon: '📸', label: 'Instagram', url: 'https://instagram.com/DrinkSipGo' },
      { icon: '🎵', label: 'TikTok', url: 'https://tiktok.com/@DrinkSipGo' },
      { icon: '𝕏', label: 'X', url: 'https://x.com/DrinkSipGo' },
    ]
    
    drinkSipSocials.forEach((social, i) => {
      const btn = this.createSocialButton(
        80 + i * 115 + 35,
        170,
        social.icon,
        social.label,
        social.url
      )
      overlayContainer.add(btn)
    })
    
    // Tank Lawrence section
    const tankTitle = this.add.text(GAME_WIDTH / 2, 250, 'DeMarcus Lawrence', {
      fontSize: '18px',
      color: hexToCSS(COLORS.white),
      fontFamily: FONTS.display,
    })
    tankTitle.setOrigin(0.5)
    overlayContainer.add(tankTitle)
    
    const tankHandle = this.add.text(GAME_WIDTH / 2, 275, '@TankLawrence', {
      fontSize: '12px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
    })
    tankHandle.setOrigin(0.5)
    overlayContainer.add(tankHandle)
    
    // Tank's social button
    const tankBtn = this.createSocialButton(
      GAME_WIDTH / 2,
      330,
      '📸',
      'Instagram',
      'https://instagram.com/TankLawrence'
    )
    overlayContainer.add(tankBtn)
    
    // Done button
    const doneBtn = this.createActionButton(GAME_WIDTH / 2, 430, 'DONE', COLORS.green, () => {
      store.setFollowed()
      this.markCardComplete(0)
      this.closeOverlay(overlayContainer)
    })
    overlayContainer.add(doneBtn)
    
    // Close button
    const closeBtn = this.add.text(GAME_WIDTH - 30, 30, '✕', {
      fontSize: '24px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
    })
    closeBtn.setOrigin(0.5)
    closeBtn.setInteractive({ useHandCursor: true })
    closeBtn.on('pointerdown', () => this.closeOverlay(overlayContainer))
    closeBtn.on('pointerover', () => closeBtn.setColor(hexToCSS(COLORS.white)))
    closeBtn.on('pointerout', () => closeBtn.setColor(hexToCSS(COLORS.grey)))
    overlayContainer.add(closeBtn)
  }

  private createSocialButton(x: number, y: number, icon: string, label: string, url: string): Phaser.GameObjects.Container {
    const width = 100
    const height = 50
    
    const bg = this.add.graphics()
    bg.fillStyle(COLORS.navyLight, 0.9)
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10)
    bg.lineStyle(1, COLORS.grey, 0.4)
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10)
    
    const iconText = this.add.text(0, -8, icon, { fontSize: '20px' })
    iconText.setOrigin(0.5)
    
    const labelText = this.add.text(0, 15, label, {
      fontSize: '10px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
    })
    labelText.setOrigin(0.5)
    
    const container = this.add.container(x, y, [bg, iconText, labelText])
    container.setSize(width, height)
    container.setInteractive({ useHandCursor: true })
    
    container.on('pointerover', () => {
      bg.clear()
      bg.fillStyle(COLORS.green, 0.2)
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10)
      bg.lineStyle(1, COLORS.green, 0.6)
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10)
      labelText.setColor(hexToCSS(COLORS.green))
    })
    
    container.on('pointerout', () => {
      bg.clear()
      bg.fillStyle(COLORS.navyLight, 0.9)
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10)
      bg.lineStyle(1, COLORS.grey, 0.4)
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10)
      labelText.setColor(hexToCSS(COLORS.grey))
    })
    
    container.on('pointerdown', () => {
      AudioManager.playClick()
      window.open(url, '_blank')
    })
    
    return container
  }

  private showGiveawayEntry(): void {
    const store = useGameStore.getState()
    
    // Create overlay
    const overlay = this.add.graphics()
    overlay.fillStyle(0x000000, 0.85)
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    overlay.setAlpha(0)
    
    const overlayContainer = this.add.container(0, 0, [overlay])
    overlayContainer.setDepth(10)
    
    this.tweens.add({
      targets: overlay,
      alpha: 1,
      duration: 200
    })
    
    // Title
    const title = this.add.text(GAME_WIDTH / 2, 80, '🎁 GIVEAWAY', {
      fontSize: '32px',
      color: hexToCSS(COLORS.gold),
      fontFamily: FONTS.display,
    })
    title.setOrigin(0.5)
    overlayContainer.add(title)
    
    // Prize info
    const prizeText = this.add.text(GAME_WIDTH / 2, 130, 'Win a signed DeMarcus Lawrence jersey\n& exclusive DrinkSip merchandise!', {
      fontSize: '14px',
      color: hexToCSS(COLORS.white),
      fontFamily: FONTS.body,
      align: 'center',
    })
    prizeText.setOrigin(0.5)
    overlayContainer.add(prizeText)
    
    // Instructions
    const instructText = this.add.text(GAME_WIDTH / 2, 200, 'To enter:', {
      fontSize: '16px',
      color: hexToCSS(COLORS.green),
      fontFamily: FONTS.display,
    })
    instructText.setOrigin(0.5)
    overlayContainer.add(instructText)
    
    const steps = [
      '1. Follow @DrinkSipGo on Instagram',
      '2. Follow @TankLawrence on Instagram',
      '3. Share this game with friends',
      '4. Comment your high score!'
    ]
    
    steps.forEach((step, i) => {
      const stepText = this.add.text(GAME_WIDTH / 2, 240 + i * 30, step, {
        fontSize: '12px',
        color: hexToCSS(COLORS.grey),
        fontFamily: FONTS.body,
      })
      stepText.setOrigin(0.5)
      overlayContainer.add(stepText)
    })
    
    // Visit giveaway link button
    const enterBtn = this.createActionButton(GAME_WIDTH / 2, 400, 'ENTER NOW', COLORS.gold, () => {
      window.open('https://instagram.com/DrinkSipGo', '_blank')
      store.setEntered()
      this.markCardComplete(1)
    })
    overlayContainer.add(enterBtn)
    
    // Done button
    const doneBtn = this.add.text(GAME_WIDTH / 2, 460, 'Done', {
      fontSize: '14px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
    })
    doneBtn.setOrigin(0.5)
    doneBtn.setInteractive({ useHandCursor: true })
    doneBtn.on('pointerdown', () => {
      store.setEntered()
      this.markCardComplete(1)
      this.closeOverlay(overlayContainer)
    })
    doneBtn.on('pointerover', () => doneBtn.setColor(hexToCSS(COLORS.green)))
    doneBtn.on('pointerout', () => doneBtn.setColor(hexToCSS(COLORS.grey)))
    overlayContainer.add(doneBtn)
    
    // Close button
    const closeBtn = this.add.text(GAME_WIDTH - 30, 30, '✕', {
      fontSize: '24px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
    })
    closeBtn.setOrigin(0.5)
    closeBtn.setInteractive({ useHandCursor: true })
    closeBtn.on('pointerdown', () => this.closeOverlay(overlayContainer))
    closeBtn.on('pointerover', () => closeBtn.setColor(hexToCSS(COLORS.white)))
    closeBtn.on('pointerout', () => closeBtn.setColor(hexToCSS(COLORS.grey)))
    overlayContainer.add(closeBtn)
  }

  private shareGame(): void {
    const store = useGameStore.getState()
    const { score, wave } = store
    
    const shareText = `I scored ${score.toLocaleString()} points and reached wave ${wave} in SEAHAWKS DEFENSE! 🏈\n\nCan you beat my score?\n\nPlay now: https://seattle-game.vercel.app`
    const shareUrl = 'https://seattle-game.vercel.app'
    
    // Try native share if available
    if (navigator.share) {
      navigator.share({
        title: 'SEAHAWKS DEFENSE',
        text: shareText,
        url: shareUrl,
      }).then(() => {
        store.setShared()
        this.markCardComplete(2)
      }).catch((err) => {
        console.log('Share cancelled or failed:', err)
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        store.setShared()
        this.markCardComplete(2)
        this.showCopiedNotification()
      }).catch(() => {
        // Fallback: open Twitter share
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
        window.open(twitterUrl, '_blank')
        store.setShared()
        this.markCardComplete(2)
      })
    }
  }

  private showCopiedNotification(): void {
    const notification = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 100, '✓ Copied to clipboard!', {
      fontSize: '14px',
      color: hexToCSS(COLORS.green),
      fontFamily: FONTS.body,
      backgroundColor: hexToCSS(COLORS.navyLight),
      padding: { x: 16, y: 8 },
    })
    notification.setOrigin(0.5)
    notification.setAlpha(0)
    notification.setDepth(100)
    
    this.tweens.add({
      targets: notification,
      alpha: 1,
      y: notification.y - 20,
      duration: 300,
      onComplete: () => {
        this.tweens.add({
          targets: notification,
          alpha: 0,
          duration: 300,
          delay: 2000,
          onComplete: () => notification.destroy()
        })
      }
    })
  }

  private createActionButton(x: number, y: number, label: string, color: number, callback: () => void): Phaser.GameObjects.Container {
    const width = 200
    const height = 50
    
    const glow = this.add.graphics()
    glow.fillStyle(color, 0.3)
    glow.fillRoundedRect(-width/2 - 4, -height/2 - 4, width + 8, height + 8, 14)
    glow.setAlpha(0)
    
    const bg = this.add.graphics()
    bg.fillStyle(color, 1)
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12)
    
    const shine = this.add.graphics()
    shine.fillStyle(0xffffff, 0.2)
    shine.fillRoundedRect(-width / 2 + 4, -height / 2 + 4, width - 8, height/2 - 4, { tl: 8, tr: 8, bl: 0, br: 0 })
    
    const text = this.add.text(0, 0, label, {
      fontSize: '18px',
      color: hexToCSS(COLORS.navy),
      fontFamily: FONTS.display,
    })
    text.setOrigin(0.5)
    
    const container = this.add.container(x, y, [glow, bg, shine, text])
    container.setSize(width, height)
    container.setInteractive({ useHandCursor: true })
    
    container.on('pointerover', () => {
      this.tweens.add({ targets: container, scale: 1.05, duration: 100 })
      this.tweens.add({ targets: glow, alpha: 1, duration: 100 })
    })
    
    container.on('pointerout', () => {
      this.tweens.add({ targets: container, scale: 1, duration: 100 })
      this.tweens.add({ targets: glow, alpha: 0, duration: 100 })
    })
    
    container.on('pointerdown', () => {
      AudioManager.playClick()
      callback()
    })
    
    return container
  }

  private markCardComplete(cardIndex: number): void {
    const card = this.cards[cardIndex]
    if (!card) return
    
    const check = card.getByName('check') as Phaser.GameObjects.Text
    if (check) {
      check.setAlpha(1)
      this.tweens.add({
        targets: check,
        scale: 1.3,
        duration: 200,
        yoyo: true,
        ease: 'Back.easeOut'
      })
    }
  }

  private closeOverlay(container: Phaser.GameObjects.Container): void {
    this.tweens.add({
      targets: container,
      alpha: 0,
      duration: 200,
      onComplete: () => container.destroy()
    })
  }

  private createContinueButton(): void {
    const y = GAME_HEIGHT - 60
    
    const continueBtn = this.add.text(GAME_WIDTH / 2, y, 'CONTINUE TO LEADERBOARD →', {
      fontSize: '14px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
    })
    continueBtn.setOrigin(0.5)
    continueBtn.setInteractive({ useHandCursor: true })
    continueBtn.setAlpha(0)
    
    this.tweens.add({
      targets: continueBtn,
      alpha: 1,
      duration: 400,
      delay: 1200
    })
    
    continueBtn.on('pointerover', () => {
      continueBtn.setColor(hexToCSS(COLORS.green))
      this.tweens.add({ targets: continueBtn, y: y - 2, duration: 100 })
    })
    
    continueBtn.on('pointerout', () => {
      continueBtn.setColor(hexToCSS(COLORS.grey))
      this.tweens.add({ targets: continueBtn, y: y, duration: 100 })
    })
    
    continueBtn.on('pointerdown', () => {
      AudioManager.playClick()
      this.cameras.main.fadeOut(300)
      this.time.delayedCall(300, () => {
        this.scene.start('LeaderboardScene', { fromGameOver: true })
      })
    })
  }
}
