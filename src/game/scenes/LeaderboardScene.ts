import * as Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/phaserConfig'
import { useGameStore } from '../../store/gameStore'

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
    this.cameras.main.fadeIn(300)
    this.cameras.main.setBackgroundColor(COLORS.trim)

    const centerX = GAME_WIDTH / 2
    const { leaderboard } = useGameStore.getState()

    // Title
    const title = this.add.text(centerX, 50, 'LEADERBOARD', {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'Arial Black',
    })
    title.setOrigin(0.5)

    // Top 10 subtitle
    const subtitle = this.add.text(centerX, 85, 'TOP 10', {
      fontSize: '14px',
      color: '#' + COLORS.accent.toString(16).padStart(6, '0'),
      fontFamily: 'Arial',
    })
    subtitle.setOrigin(0.5)

    // Column headers
    const headerY = 130
    this.add.text(40, headerY, 'RANK', { fontSize: '12px', color: '#666666', fontFamily: 'Arial' })
    this.add.text(90, headerY, 'NAME', { fontSize: '12px', color: '#666666', fontFamily: 'Arial' })
    this.add.text(160, headerY, '#', { fontSize: '12px', color: '#666666', fontFamily: 'Arial' })
    this.add.text(210, headerY, 'SCORE', { fontSize: '12px', color: '#666666', fontFamily: 'Arial' })
    this.add.text(300, headerY, 'WAVE', { fontSize: '12px', color: '#666666', fontFamily: 'Arial' })

    // Divider
    const divider = this.add.graphics()
    divider.lineStyle(1, 0x444444)
    divider.moveTo(30, headerY + 20)
    divider.lineTo(GAME_WIDTH - 30, headerY + 20)
    divider.strokePath()

    // Leaderboard entries
    if (leaderboard.length === 0) {
      const noScores = this.add.text(centerX, 250, 'No scores yet!\nBe the first to play.', {
        fontSize: '16px',
        color: '#666666',
        fontFamily: 'Arial',
        align: 'center',
      })
      noScores.setOrigin(0.5)
    } else {
      leaderboard.slice(0, 10).forEach((entry, index) => {
        const y = 165 + index * 40
        const isRecent = this.fromGameOver && index === leaderboard.findIndex((e) => e.id === entry.id)
        const color = isRecent ? '#' + COLORS.accent.toString(16).padStart(6, '0') : '#ffffff'

        // Rank
        const rankColor = index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : color
        this.add.text(50, y, `${index + 1}`, {
          fontSize: '16px',
          color: rankColor,
          fontFamily: 'Arial Black',
        }).setOrigin(0.5, 0)

        // Name
        this.add.text(90, y, entry.playerName, {
          fontSize: '16px',
          color: color,
          fontFamily: 'Arial Black',
        })

        // Jersey
        this.add.text(165, y, `${entry.jerseyNumber}`, {
          fontSize: '14px',
          color: '#' + COLORS.primary.toString(16).padStart(6, '0'),
          fontFamily: 'Arial',
        })

        // Score
        this.add.text(210, y, entry.score.toLocaleString(), {
          fontSize: '16px',
          color: color,
          fontFamily: 'Arial Black',
        })

        // Wave
        this.add.text(310, y, `${entry.wave}`, {
          fontSize: '14px',
          color: '#888888',
          fontFamily: 'Arial',
        })

        // Row highlight for recent entry
        if (isRecent) {
          const highlight = this.add.graphics()
          highlight.fillStyle(COLORS.accent, 0.1)
          highlight.fillRoundedRect(25, y - 5, GAME_WIDTH - 50, 30, 5)
          highlight.setDepth(-1)
        }
      })
    }

    // Buttons at bottom
    if (this.fromGameOver) {
      this.createPlayAgainButton(centerX, GAME_HEIGHT - 100)
      this.createMenuButton(centerX, GAME_HEIGHT - 50)
    } else {
      this.createBackButton()
    }
  }

  private createPlayAgainButton(x: number, y: number): void {
    const width = 180
    const height = 45

    const bg = this.add.graphics()
    bg.fillStyle(COLORS.accent, 1)
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10)

    const label = this.add.text(0, 0, 'PLAY AGAIN', {
      fontSize: '16px',
      color: '#000000',
      fontFamily: 'Arial Black',
    })
    label.setOrigin(0.5)

    const container = this.add.container(x, y, [bg, label])
    container.setSize(width, height)
    container.setInteractive({ useHandCursor: true })

    container.on('pointerover', () => container.setScale(1.05))
    container.on('pointerout', () => container.setScale(1))
    container.on('pointerdown', () => container.setScale(0.95))

    container.on('pointerup', () => {
      useGameStore.getState().startGame()
      this.cameras.main.fadeOut(200)
      this.time.delayedCall(200, () => {
        this.scene.start('GameScene')
      })
    })
  }

  private createMenuButton(x: number, y: number): void {
    const menuBtn = this.add.text(x, y, 'MAIN MENU', {
      fontSize: '14px',
      color: '#888888',
      fontFamily: 'Arial',
    })
    menuBtn.setOrigin(0.5)
    menuBtn.setInteractive({ useHandCursor: true })

    menuBtn.on('pointerover', () => menuBtn.setColor('#ffffff'))
    menuBtn.on('pointerout', () => menuBtn.setColor('#888888'))
    menuBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(200)
      this.time.delayedCall(200, () => {
        this.scene.start('MenuScene')
      })
    })
  }

  private createBackButton(): void {
    const backBtn = this.add.text(20, 20, '← BACK', {
      fontSize: '14px',
      color: '#888888',
      fontFamily: 'Arial',
    })
    backBtn.setInteractive({ useHandCursor: true })

    backBtn.on('pointerover', () => backBtn.setColor('#ffffff'))
    backBtn.on('pointerout', () => backBtn.setColor('#888888'))
    backBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(200)
      this.time.delayedCall(200, () => {
        this.scene.start('MenuScene')
      })
    })
  }
}
