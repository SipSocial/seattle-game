import * as Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONTS, hexToCSS, getPositionGroupColor } from '../config/phaserConfig'
import { useGameStore } from '../../store/gameStore'
import { AudioManager } from '../systems/AudioManager'
import { FULL_ROSTER } from '../data/roster'

export class LeaderboardScene extends Phaser.Scene {
  private fromGameOver = false
  private fromMenu = false

  constructor() {
    super({ key: 'LeaderboardScene' })
  }

  init(data: { fromGameOver?: boolean; fromMenu?: boolean }): void {
    this.fromGameOver = data.fromGameOver || false
    this.fromMenu = data.fromMenu || false
  }

  create(): void {
    this.cameras.main.fadeIn(400)
    this.cameras.main.setBackgroundColor(COLORS.navy)

    this.createBackground()
    this.createHeader()
    this.createLeaderboard()
    this.createButtons()
  }

  private createBackground(): void {
    const graphics = this.add.graphics()
    
    // Dark gradient
    for (let y = 0; y < GAME_HEIGHT; y++) {
      const progress = y / GAME_HEIGHT
      const r = Math.floor(0)
      const g = Math.floor(26 + progress * 15)
      const b = Math.floor(51 + progress * 10)
      graphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1)
      graphics.fillRect(0, y, GAME_WIDTH, 1)
    }
    
    // Trophy glow
    const glow = this.add.graphics()
    glow.fillStyle(COLORS.gold, 0.05)
    glow.fillEllipse(GAME_WIDTH / 2, 50, 200, 100)
    
    // Field glow at bottom
    const fieldGlow = this.add.graphics()
    fieldGlow.fillStyle(COLORS.green, 0.08)
    fieldGlow.fillEllipse(GAME_WIDTH / 2, GAME_HEIGHT, GAME_WIDTH, 150)
  }

  private createHeader(): void {
    const centerX = GAME_WIDTH / 2
    
    // Trophy icon
    const trophy = this.add.text(centerX, 40, '🏆', { fontSize: '36px' })
    trophy.setOrigin(0.5)
    trophy.setAlpha(0)
    
    this.tweens.add({
      targets: trophy,
      alpha: 1,
      y: trophy.y - 10,
      duration: 500,
      delay: 200,
      ease: 'Back.easeOut'
    })

    // Title
    const title = this.add.text(centerX, 85, 'LEADERBOARD', {
      fontSize: '28px',
      color: hexToCSS(COLORS.white),
      fontFamily: FONTS.display,
      letterSpacing: 3,
    })
    title.setOrigin(0.5)
    title.setAlpha(0)

    // Subtitle
    const subtitle = this.add.text(centerX, 115, 'TOP 10 DEFENDERS', {
      fontSize: '11px',
      color: hexToCSS(COLORS.green),
      fontFamily: FONTS.body,
      letterSpacing: 2,
    })
    subtitle.setOrigin(0.5)
    subtitle.setAlpha(0)
    
    this.tweens.add({
      targets: [title, subtitle],
      alpha: 1,
      duration: 400,
      delay: 300
    })
  }

  private createLeaderboard(): void {
    const centerX = GAME_WIDTH / 2
    const { leaderboard } = useGameStore.getState()
    
    // Column headers background
    const headerBg = this.add.graphics()
    headerBg.fillStyle(COLORS.navyLight, 0.5)
    headerBg.fillRect(20, 140, GAME_WIDTH - 40, 30)
    
    const headerY = 155
    this.add.text(45, headerY, '#', { fontSize: '10px', color: hexToCSS(COLORS.grey), fontFamily: FONTS.body }).setOrigin(0.5)
    this.add.text(95, headerY, 'NAME', { fontSize: '10px', color: hexToCSS(COLORS.grey), fontFamily: FONTS.body })
    this.add.text(180, headerY, 'JERSEY', { fontSize: '10px', color: hexToCSS(COLORS.grey), fontFamily: FONTS.body })
    this.add.text(260, headerY, 'SCORE', { fontSize: '10px', color: hexToCSS(COLORS.grey), fontFamily: FONTS.body })
    this.add.text(350, headerY, 'W', { fontSize: '10px', color: hexToCSS(COLORS.grey), fontFamily: FONTS.body })

    if (leaderboard.length === 0) {
      const noScores = this.add.text(centerX, 300, 'No scores yet!\nBe the first defender.', {
        fontSize: '16px',
        color: hexToCSS(COLORS.grey),
        fontFamily: FONTS.body,
        align: 'center',
      })
      noScores.setOrigin(0.5)
      noScores.setAlpha(0)
      
      this.tweens.add({
        targets: noScores,
        alpha: 1,
        duration: 400,
        delay: 500
      })
    } else {
      leaderboard.slice(0, 10).forEach((entry, index) => {
        const y = 185 + index * 42
        const isRecent = this.fromGameOver && index === leaderboard.findIndex((e) => e.id === entry.id)
        
        // Row background
        const rowBg = this.add.graphics()
        if (isRecent) {
          rowBg.fillStyle(COLORS.green, 0.15)
          rowBg.lineStyle(1, COLORS.green, 0.5)
        } else if (index % 2 === 0) {
          rowBg.fillStyle(COLORS.navyLight, 0.3)
        }
        rowBg.fillRoundedRect(25, y - 8, GAME_WIDTH - 50, 36, 8)
        if (isRecent) {
          rowBg.strokeRoundedRect(25, y - 8, GAME_WIDTH - 50, 36, 8)
        }
        rowBg.setAlpha(0)
        
        // Rank with medal colors
        const rankColors = [COLORS.gold, 0xC0C0C0, 0xCD7F32]
        const rankColor = index < 3 ? rankColors[index] : COLORS.grey
        const rankMedals = ['🥇', '🥈', '🥉']
        
        if (index < 3) {
          const medal = this.add.text(45, y + 10, rankMedals[index], { fontSize: '16px' })
          medal.setOrigin(0.5)
          medal.setAlpha(0)
          
          this.tweens.add({
            targets: medal,
            alpha: 1,
            duration: 300,
            delay: 400 + index * 50
          })
        } else {
          const rank = this.add.text(45, y + 10, `${index + 1}`, {
            fontSize: '14px',
            color: hexToCSS(rankColor),
            fontFamily: FONTS.display,
          })
          rank.setOrigin(0.5)
          rank.setAlpha(0)
          
          this.tweens.add({
            targets: rank,
            alpha: 1,
            duration: 300,
            delay: 400 + index * 50
          })
        }

        // Name
        const name = this.add.text(95, y + 10, entry.playerName, {
          fontSize: '16px',
          color: hexToCSS(isRecent ? COLORS.green : COLORS.white),
          fontFamily: FONTS.display,
        })
        name.setOrigin(0, 0.5)
        name.setAlpha(0)

        // Jersey with position color
        const defender = FULL_ROSTER.find(d => d.jersey === entry.jerseyNumber)
        const posColor = defender ? getPositionGroupColor(defender.positionGroup) : COLORS.grey
        
        const jerseyBg = this.add.graphics()
        jerseyBg.fillStyle(posColor, 0.3)
        jerseyBg.fillRoundedRect(175, y, 45, 22, 6)
        jerseyBg.setAlpha(0)
        
        const jersey = this.add.text(197, y + 11, `#${entry.jerseyNumber}`, {
          fontSize: '12px',
          color: hexToCSS(posColor),
          fontFamily: FONTS.body,
        })
        jersey.setOrigin(0.5)
        jersey.setAlpha(0)

        // Score
        const score = this.add.text(260, y + 10, entry.score.toLocaleString(), {
          fontSize: '14px',
          color: hexToCSS(isRecent ? COLORS.green : COLORS.white),
          fontFamily: FONTS.display,
        })
        score.setOrigin(0, 0.5)
        score.setAlpha(0)

        // Wave
        const wave = this.add.text(350, y + 10, `${entry.wave}`, {
          fontSize: '12px',
          color: hexToCSS(COLORS.grey),
          fontFamily: FONTS.body,
        })
        wave.setOrigin(0, 0.5)
        wave.setAlpha(0)

        // Animate row in
        const elements = [rowBg, name, jerseyBg, jersey, score, wave]
        elements.forEach((el, i) => {
          this.tweens.add({
            targets: el,
            alpha: 1,
            duration: 300,
            delay: 400 + index * 50 + i * 20
          })
        })
      })
    }
  }

  private createButtons(): void {
    const centerX = GAME_WIDTH / 2

    if (this.fromGameOver) {
      this.createPlayAgainButton(centerX, GAME_HEIGHT - 100)
      this.createMenuButton(centerX, GAME_HEIGHT - 50)
    } else {
      this.createBackButton()
    }
  }

  private createPlayAgainButton(x: number, y: number): void {
    const width = 200
    const height = 48
    
    const glow = this.add.graphics()
    glow.fillStyle(COLORS.green, 0.3)
    glow.fillRoundedRect(x - width/2 - 5, y - height/2 - 5, width + 10, height + 10, 14)
    glow.setAlpha(0)

    const bg = this.add.graphics()
    bg.fillStyle(COLORS.green, 1)
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12)
    
    const shine = this.add.graphics()
    shine.fillStyle(0xffffff, 0.2)
    shine.fillRoundedRect(-width / 2 + 4, -height / 2 + 4, width - 8, height/2 - 4, { tl: 8, tr: 8, bl: 0, br: 0 })

    const label = this.add.text(0, 0, 'PLAY AGAIN', {
      fontSize: '18px',
      color: hexToCSS(COLORS.navy),
      fontFamily: FONTS.display,
    })
    label.setOrigin(0.5)

    const container = this.add.container(x, y, [bg, shine, label])
    container.setSize(width, height)
    container.setInteractive({ useHandCursor: true })
    container.setAlpha(0)
    
    this.tweens.add({
      targets: container,
      alpha: 1,
      duration: 400,
      delay: 800
    })

    container.on('pointerover', () => {
      this.tweens.add({ targets: container, scale: 1.05, duration: 150 })
      this.tweens.add({ targets: glow, alpha: 1, duration: 150 })
    })
    
    container.on('pointerout', () => {
      this.tweens.add({ targets: container, scale: 1, duration: 150 })
      this.tweens.add({ targets: glow, alpha: 0, duration: 150 })
    })
    
    container.on('pointerdown', () => container.setScale(0.95))

    container.on('pointerup', () => {
      AudioManager.playClick()
      useGameStore.getState().startGame()
      this.cameras.main.fadeOut(300)
      this.time.delayedCall(300, () => {
        this.scene.start('GameScene')
      })
    })
  }

  private createMenuButton(x: number, y: number): void {
    const menuBtn = this.add.text(x, y, 'MAIN MENU', {
      fontSize: '13px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
    })
    menuBtn.setOrigin(0.5)
    menuBtn.setInteractive({ useHandCursor: true })
    menuBtn.setAlpha(0)
    
    this.tweens.add({
      targets: menuBtn,
      alpha: 1,
      duration: 400,
      delay: 900
    })

    menuBtn.on('pointerover', () => {
      menuBtn.setColor(hexToCSS(COLORS.green))
      this.tweens.add({ targets: menuBtn, y: y - 2, duration: 150 })
    })
    
    menuBtn.on('pointerout', () => {
      menuBtn.setColor(hexToCSS(COLORS.grey))
      this.tweens.add({ targets: menuBtn, y: y, duration: 150 })
    })
    
    menuBtn.on('pointerdown', () => {
      AudioManager.playClick()
      this.cameras.main.fadeOut(300)
      this.time.delayedCall(300, () => {
        this.scene.start('MenuScene')
      })
    })
  }

  private createBackButton(): void {
    const backBtn = this.add.text(25, 25, '← BACK', {
      fontSize: '14px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
    })
    backBtn.setInteractive({ useHandCursor: true })
    backBtn.setAlpha(0)
    
    this.tweens.add({
      targets: backBtn,
      alpha: 1,
      duration: 400,
      delay: 400
    })

    backBtn.on('pointerover', () => {
      backBtn.setColor(hexToCSS(COLORS.green))
      this.tweens.add({ targets: backBtn, x: 30, duration: 150 })
    })
    
    backBtn.on('pointerout', () => {
      backBtn.setColor(hexToCSS(COLORS.grey))
      this.tweens.add({ targets: backBtn, x: 25, duration: 150 })
    })
    
    backBtn.on('pointerdown', () => {
      AudioManager.playClick()
      this.cameras.main.fadeOut(300)
      this.time.delayedCall(300, () => {
        this.scene.start('MenuScene')
      })
    })
  }
}
