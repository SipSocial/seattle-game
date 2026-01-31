import * as Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONTS, hexToCSS } from '../config/phaserConfig'
import { useGameStore } from '../../store/gameStore'
import { AudioManager } from '../systems/AudioManager'

/**
 * SuperBowlScene - Ultimate Victory Celebration
 * 
 * The culmination of the Road to the Super Bowl campaign.
 * Features:
 * - Golden Gate Bridge backdrop
 * - Confetti celebration
 * - Lombardi Trophy presentation
 * - Stats recap
 * - Social sharing prompts
 */
export class SuperBowlScene extends Phaser.Scene {
  private confettiParticles: Phaser.GameObjects.Graphics[] = []
  
  constructor() {
    super({ key: 'SuperBowlScene' })
  }

  create(): void {
    this.cameras.main.fadeIn(800)
    
    // Create the epic backdrop
    this.createBackground()
    
    // Golden Gate Bridge silhouette
    this.createGoldenGateBridge()
    
    // Confetti celebration
    this.createConfetti()
    
    // Trophy presentation
    this.createTrophyPresentation()
    
    // Stats and achievements
    this.createStatsRecap()
    
    // Action buttons
    this.createButtons()
    
    // Celebration audio
    AudioManager.playCrowdRoar()
    
    // Haptic celebration pattern
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200, 100, 400])
    }
  }

  private createBackground(): void {
    const graphics = this.add.graphics()
    
    // Night sky gradient with golden tones
    for (let y = 0; y < GAME_HEIGHT; y++) {
      const progress = y / GAME_HEIGHT
      const r = Math.floor(0 + progress * 20)
      const g = Math.floor(20 + progress * 30)
      const b = Math.floor(50 + progress * 20)
      graphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1)
      graphics.fillRect(0, y, GAME_WIDTH, 1)
    }
    
    // Golden glow at bottom
    const goldGlow = this.add.graphics()
    goldGlow.fillStyle(COLORS.gold, 0.1)
    goldGlow.fillEllipse(GAME_WIDTH / 2, GAME_HEIGHT + 50, GAME_WIDTH * 1.5, 300)
    
    // Animated glow
    this.tweens.add({
      targets: goldGlow,
      alpha: 0.2,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
    
    // Stadium lights
    for (let i = 0; i < 5; i++) {
      const light = this.add.graphics()
      light.fillStyle(0xffffff, 0.03)
      const x = (i + 0.5) * (GAME_WIDTH / 5)
      light.fillEllipse(x, -20, 80, 150)
      
      this.tweens.add({
        targets: light,
        alpha: 0.08,
        duration: 1500 + i * 200,
        yoyo: true,
        repeat: -1
      })
    }
  }

  private createGoldenGateBridge(): void {
    const bridgeY = GAME_HEIGHT * 0.55
    const bridge = this.add.graphics()
    
    // Semi-transparent to not distract
    bridge.setAlpha(0.3)
    
    // Main towers
    bridge.fillStyle(0xc04000, 1)
    bridge.fillRect(70, bridgeY - 120, 12, 120)
    bridge.fillRect(GAME_WIDTH - 82, bridgeY - 120, 12, 120)
    
    // Tower tops
    bridge.fillRect(65, bridgeY - 130, 22, 15)
    bridge.fillRect(GAME_WIDTH - 87, bridgeY - 130, 22, 15)
    
    // Main cables (catenary curve)
    bridge.lineStyle(4, 0xc04000, 1)
    bridge.beginPath()
    bridge.moveTo(76, bridgeY - 115)
    
    // Draw catenary
    for (let t = 0; t <= 1; t += 0.02) {
      const x = 76 + (GAME_WIDTH - 76 - 76) * t
      const sag = 60 * Math.sin(Math.PI * t)
      bridge.lineTo(x, bridgeY - 115 + sag)
    }
    bridge.strokePath()
    
    // Vertical cables
    bridge.lineStyle(1, 0xc04000, 0.7)
    for (let x = 90; x < GAME_WIDTH - 90; x += 15) {
      const t = (x - 76) / (GAME_WIDTH - 152)
      const cableY = bridgeY - 115 + 60 * Math.sin(Math.PI * t)
      bridge.moveTo(x, cableY)
      bridge.lineTo(x, bridgeY - 20)
      bridge.strokePath()
    }
    
    // Bridge deck
    bridge.fillStyle(0x333333, 1)
    bridge.fillRect(40, bridgeY - 25, GAME_WIDTH - 80, 10)
    
    // Bay water
    const water = this.add.graphics()
    water.fillStyle(0x003366, 0.5)
    water.fillRect(0, bridgeY, GAME_WIDTH, GAME_HEIGHT - bridgeY)
    
    // Water shimmer
    for (let i = 0; i < 10; i++) {
      const shimmer = this.add.graphics()
      shimmer.fillStyle(0x6699cc, 0.2)
      shimmer.fillRect(
        Math.random() * GAME_WIDTH, 
        bridgeY + 20 + Math.random() * 100, 
        20 + Math.random() * 40, 
        2
      )
      
      this.tweens.add({
        targets: shimmer,
        alpha: 0.05,
        x: shimmer.x + 20,
        duration: 2000 + Math.random() * 1000,
        yoyo: true,
        repeat: -1
      })
    }
  }

  private createConfetti(): void {
    const colors = [COLORS.green, COLORS.gold, 0xff69b4, 0x00bfff, 0xff6b6b, COLORS.white]
    
    for (let i = 0; i < 150; i++) {
      const confetti = this.add.graphics()
      const color = colors[Math.floor(Math.random() * colors.length)]
      confetti.fillStyle(color, 0.9)
      
      // Random shape: rectangle or square
      if (Math.random() > 0.5) {
        confetti.fillRect(0, 0, 4 + Math.random() * 4, 8 + Math.random() * 8)
      } else {
        confetti.fillRect(0, 0, 6, 6)
      }
      
      confetti.setPosition(Math.random() * GAME_WIDTH, -30 - Math.random() * 300)
      confetti.setRotation(Math.random() * Math.PI * 2)
      
      const fallDuration = 4000 + Math.random() * 3000
      const swayAmount = (Math.random() - 0.5) * 200
      
      this.tweens.add({
        targets: confetti,
        y: GAME_HEIGHT + 50,
        x: confetti.x + swayAmount,
        rotation: confetti.rotation + Math.PI * 4 * (Math.random() > 0.5 ? 1 : -1),
        duration: fallDuration,
        delay: Math.random() * 2000,
        repeat: -1,
        onRepeat: () => {
          confetti.x = Math.random() * GAME_WIDTH
          confetti.y = -30
        }
      })
      
      this.confettiParticles.push(confetti)
    }
  }

  private createTrophyPresentation(): void {
    const centerX = GAME_WIDTH / 2
    const { campaign } = useGameStore.getState()
    
    // Trophy glow
    const trophyGlow = this.add.graphics()
    trophyGlow.fillStyle(COLORS.gold, 0.3)
    trophyGlow.fillCircle(centerX, 160, 80)
    
    this.tweens.add({
      targets: trophyGlow,
      scaleX: 1.2,
      scaleY: 1.2,
      alpha: 0.5,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
    
    // Trophy emoji (large)
    const trophy = this.add.text(centerX, 160, '🏆', { fontSize: '80px' })
    trophy.setOrigin(0.5)
    trophy.setScale(0)
    
    this.tweens.add({
      targets: trophy,
      scale: 1,
      duration: 800,
      delay: 500,
      ease: 'Back.easeOut'
    })
    
    // Floating animation
    this.tweens.add({
      targets: trophy,
      y: 150,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 1300
    })
    
    // "SUPER BOWL CHAMPIONS" text
    const champText = this.add.text(centerX, 260, 'SUPER BOWL\nCHAMPIONS', {
      fontSize: '36px',
      color: hexToCSS(COLORS.gold),
      fontFamily: FONTS.display,
      align: 'center',
      lineSpacing: 5,
      stroke: '#000000',
      strokeThickness: 4,
    })
    champText.setOrigin(0.5)
    champText.setAlpha(0)
    
    this.tweens.add({
      targets: champText,
      alpha: 1,
      y: champText.y - 10,
      duration: 600,
      delay: 1000,
      ease: 'Power2'
    })
    
    // Season complete subtitle
    const seasonText = this.add.text(centerX, 340, 'THE ROAD TO SAN FRANCISCO IS COMPLETE', {
      fontSize: '12px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
    })
    seasonText.setOrigin(0.5)
    seasonText.setAlpha(0)
    
    this.tweens.add({
      targets: seasonText,
      alpha: 1,
      duration: 500,
      delay: 1500
    })
  }

  private createStatsRecap(): void {
    const { campaign, highScore } = useGameStore.getState()
    const centerX = GAME_WIDTH / 2
    
    // Stats container
    const statsContainer = this.add.container(centerX, 420)
    
    const statsBg = this.add.graphics()
    statsBg.fillStyle(COLORS.navyLight, 0.8)
    statsBg.fillRoundedRect(-150, -50, 300, 100, 16)
    statsBg.lineStyle(2, COLORS.gold, 0.5)
    statsBg.strokeRoundedRect(-150, -50, 300, 100, 16)
    statsContainer.add(statsBg)
    
    // Total score
    const scoreLabel = this.add.text(-100, -30, 'TOTAL SCORE', {
      fontSize: '10px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
    })
    scoreLabel.setOrigin(0.5)
    statsContainer.add(scoreLabel)
    
    const scoreValue = this.add.text(-100, -5, campaign.totalScore.toLocaleString(), {
      fontSize: '22px',
      color: hexToCSS(COLORS.green),
      fontFamily: FONTS.display,
    })
    scoreValue.setOrigin(0.5)
    statsContainer.add(scoreValue)
    
    // Games won
    const gamesLabel = this.add.text(0, -30, 'GAMES WON', {
      fontSize: '10px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
    })
    gamesLabel.setOrigin(0.5)
    statsContainer.add(gamesLabel)
    
    const gamesValue = this.add.text(0, -5, `${campaign.gamesWon}/51`, {
      fontSize: '22px',
      color: hexToCSS(COLORS.white),
      fontFamily: FONTS.display,
    })
    gamesValue.setOrigin(0.5)
    statsContainer.add(gamesValue)
    
    // Stages
    const stagesLabel = this.add.text(100, -30, 'STAGES', {
      fontSize: '10px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
    })
    stagesLabel.setOrigin(0.5)
    statsContainer.add(stagesLabel)
    
    const stagesValue = this.add.text(100, -5, '17/17', {
      fontSize: '22px',
      color: hexToCSS(COLORS.gold),
      fontFamily: FONTS.display,
    })
    stagesValue.setOrigin(0.5)
    statsContainer.add(stagesValue)
    
    // Perfect season indicator
    if (campaign.gamesWon >= 51) {
      const perfectText = this.add.text(0, 35, '⭐ PERFECT SEASON ⭐', {
        fontSize: '14px',
        color: hexToCSS(COLORS.gold),
        fontFamily: FONTS.display,
      })
      perfectText.setOrigin(0.5)
      statsContainer.add(perfectText)
    }
    
    statsContainer.setAlpha(0)
    statsContainer.setY(statsContainer.y + 30)
    
    this.tweens.add({
      targets: statsContainer,
      alpha: 1,
      y: statsContainer.y - 30,
      duration: 600,
      delay: 2000,
      ease: 'Power2'
    })
  }

  private createButtons(): void {
    const centerX = GAME_WIDTH / 2
    
    // Play Again (New Campaign) button
    const playAgainBtn = this.add.container(centerX, 540)
    
    const playBg = this.add.graphics()
    playBg.fillStyle(COLORS.green, 1)
    playBg.fillRoundedRect(-100, -22, 200, 44, 12)
    playAgainBtn.add(playBg)
    
    const playShine = this.add.graphics()
    playShine.fillStyle(0xffffff, 0.2)
    playShine.fillRoundedRect(-98, -20, 196, 18, { tl: 10, tr: 10, bl: 0, br: 0 })
    playAgainBtn.add(playShine)
    
    const playLabel = this.add.text(0, 0, 'NEW CAMPAIGN', {
      fontSize: '18px',
      color: hexToCSS(COLORS.navy),
      fontFamily: FONTS.display,
    })
    playLabel.setOrigin(0.5)
    playAgainBtn.add(playLabel)
    
    playAgainBtn.setSize(200, 44)
    playAgainBtn.setInteractive({ useHandCursor: true })
    playAgainBtn.setAlpha(0)
    
    this.tweens.add({
      targets: playAgainBtn,
      alpha: 1,
      duration: 500,
      delay: 2500
    })
    
    playAgainBtn.on('pointerover', () => {
      this.tweens.add({ targets: playAgainBtn, scaleX: 1.05, scaleY: 1.05, duration: 100 })
    })
    
    playAgainBtn.on('pointerout', () => {
      this.tweens.add({ targets: playAgainBtn, scaleX: 1, scaleY: 1, duration: 100 })
    })
    
    playAgainBtn.on('pointerup', () => {
      AudioManager.playClick()
      useGameStore.getState().resetCampaign()
      this.cameras.main.fadeOut(500)
      this.time.delayedCall(500, () => {
        this.scene.start('MapScene')
      })
    })
    
    // Back to Menu button
    const menuBtn = this.add.text(centerX, 590, 'BACK TO MENU', {
      fontSize: '14px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
    })
    menuBtn.setOrigin(0.5)
    menuBtn.setInteractive({ useHandCursor: true })
    menuBtn.setAlpha(0)
    
    this.tweens.add({
      targets: menuBtn,
      alpha: 0.7,
      duration: 500,
      delay: 2700
    })
    
    menuBtn.on('pointerover', () => menuBtn.setColor(hexToCSS(COLORS.white)))
    menuBtn.on('pointerout', () => menuBtn.setColor(hexToCSS(COLORS.grey)))
    
    menuBtn.on('pointerdown', () => {
      AudioManager.playClick()
      this.cameras.main.fadeOut(400)
      this.time.delayedCall(400, () => {
        this.scene.start('MenuScene')
      })
    })
    
    // Share button (bottom)
    const shareBtn = this.add.container(centerX, 640)
    
    const shareBg = this.add.graphics()
    shareBg.fillStyle(COLORS.navyLight, 0.8)
    shareBg.fillRoundedRect(-80, -18, 160, 36, 10)
    shareBg.lineStyle(1, COLORS.gold, 0.5)
    shareBg.strokeRoundedRect(-80, -18, 160, 36, 10)
    shareBtn.add(shareBg)
    
    const shareLabel = this.add.text(0, 0, '📸 SHARE VICTORY', {
      fontSize: '12px',
      color: hexToCSS(COLORS.gold),
      fontFamily: FONTS.body,
    })
    shareLabel.setOrigin(0.5)
    shareBtn.add(shareLabel)
    
    shareBtn.setSize(160, 36)
    shareBtn.setInteractive({ useHandCursor: true })
    shareBtn.setAlpha(0)
    
    this.tweens.add({
      targets: shareBtn,
      alpha: 1,
      duration: 500,
      delay: 2900
    })
    
    shareBtn.on('pointerup', () => {
      AudioManager.playClick()
      this.shareVictory()
    })
  }

  private shareVictory(): void {
    const { campaign } = useGameStore.getState()
    const shareText = `🏆 I just won the Super Bowl in Seahawks Defense! Final Score: ${campaign.totalScore.toLocaleString()} points across 51 games. The Legion Lives On! #SeahawksDefense #12thMan`
    
    if (navigator.share) {
      navigator.share({
        title: 'Super Bowl Champion!',
        text: shareText,
        url: window.location.href,
      }).catch(() => {
        // Fallback to clipboard
        this.copyToClipboard(shareText)
      })
    } else {
      this.copyToClipboard(shareText)
    }
  }

  private copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // Show copied confirmation
      const confirmation = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'COPIED TO CLIPBOARD!', {
        fontSize: '16px',
        color: hexToCSS(COLORS.green),
        fontFamily: FONTS.display,
        backgroundColor: hexToCSS(COLORS.navy),
        padding: { x: 20, y: 10 },
      })
      confirmation.setOrigin(0.5)
      
      this.tweens.add({
        targets: confirmation,
        alpha: 0,
        y: confirmation.y - 50,
        duration: 1500,
        delay: 1000,
        onComplete: () => confirmation.destroy()
      })
    })
  }
}
