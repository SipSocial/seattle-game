import * as Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/phaserConfig'
import { useGameStore } from '../../store/gameStore'

export class GameOverScene extends Phaser.Scene {
  private nameInput: string = ''
  private nameText!: Phaser.GameObjects.Text
  private cursorVisible = true

  constructor() {
    super({ key: 'GameOverScene' })
  }

  create(): void {
    this.cameras.main.fadeIn(300)
    this.cameras.main.setBackgroundColor(COLORS.trim)
    
    this.nameInput = ''
    
    const centerX = GAME_WIDTH / 2
    const { score, wave, tackles, highScore, playerName } = useGameStore.getState()
    
    // If player already has a name, use it
    if (playerName) {
      this.nameInput = playerName
    }

    // Game Over title
    const title = this.add.text(centerX, 80, 'GAME OVER', {
      fontSize: '36px',
      color: '#ffffff',
      fontFamily: 'Arial Black',
    })
    title.setOrigin(0.5)

    // Stats display
    const isNewHighScore = score >= highScore && score > 0
    
    const scoreLabel = this.add.text(centerX, 150, isNewHighScore ? 'NEW HIGH SCORE!' : 'FINAL SCORE', {
      fontSize: '14px',
      color: isNewHighScore ? '#' + COLORS.gold.toString(16).padStart(6, '0') : '#888888',
      fontFamily: 'Arial',
    })
    scoreLabel.setOrigin(0.5)

    const scoreText = this.add.text(centerX, 190, score.toLocaleString(), {
      fontSize: '48px',
      color: '#' + COLORS.accent.toString(16).padStart(6, '0'),
      fontFamily: 'Arial Black',
    })
    scoreText.setOrigin(0.5)

    // Wave and tackles
    const statsText = this.add.text(centerX, 250, `Wave ${wave}  •  ${tackles} Tackles`, {
      fontSize: '16px',
      color: '#aaaaaa',
      fontFamily: 'Arial',
    })
    statsText.setOrigin(0.5)

    // Name entry
    const enterNameLabel = this.add.text(centerX, 320, 'ENTER YOUR INITIALS', {
      fontSize: '14px',
      color: '#888888',
      fontFamily: 'Arial',
    })
    enterNameLabel.setOrigin(0.5)

    // Name input display
    const nameBg = this.add.graphics()
    nameBg.fillStyle(0x333333, 1)
    nameBg.fillRoundedRect(centerX - 80, 345, 160, 50, 10)
    nameBg.lineStyle(2, COLORS.accent)
    nameBg.strokeRoundedRect(centerX - 80, 345, 160, 50, 10)

    this.nameText = this.add.text(centerX, 370, this.nameInput + '_', {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'Arial Black',
      letterSpacing: 10,
    })
    this.nameText.setOrigin(0.5)

    // Blinking cursor
    this.time.addEvent({
      delay: 500,
      callback: () => {
        this.cursorVisible = !this.cursorVisible
        this.updateNameDisplay()
      },
      loop: true,
    })

    // Keyboard input
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Backspace') {
        this.nameInput = this.nameInput.slice(0, -1)
      } else if (event.key.length === 1 && /[a-zA-Z0-9]/.test(event.key) && this.nameInput.length < 3) {
        this.nameInput += event.key.toUpperCase()
      }
      this.updateNameDisplay()
    })

    // On-screen keyboard for mobile
    this.createOnScreenKeyboard(centerX, 440)

    // Submit button
    this.createSubmitButton(centerX, 580)

    // Retry button
    this.createRetryButton(centerX, 640)
  }

  private updateNameDisplay(): void {
    const cursor = this.cursorVisible && this.nameInput.length < 3 ? '_' : ''
    const display = this.nameInput.padEnd(3, ' ') 
    this.nameText.setText(this.nameInput + cursor)
  }

  private createOnScreenKeyboard(x: number, y: number): void {
    const keys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const cols = 9
    const keyWidth = 35
    const keyHeight = 35
    const spacing = 5

    const startX = x - ((cols * (keyWidth + spacing)) / 2) + keyWidth / 2

    keys.split('').forEach((key, index) => {
      const col = index % cols
      const row = Math.floor(index / cols)
      const kx = startX + col * (keyWidth + spacing)
      const ky = y + row * (keyHeight + spacing)

      const bg = this.add.graphics()
      bg.fillStyle(0x444444, 1)
      bg.fillRoundedRect(-keyWidth / 2, -keyHeight / 2, keyWidth, keyHeight, 5)

      const label = this.add.text(0, 0, key, {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'Arial Black',
      })
      label.setOrigin(0.5)

      const container = this.add.container(kx, ky, [bg, label])
      container.setSize(keyWidth, keyHeight)
      container.setInteractive({ useHandCursor: true })

      container.on('pointerdown', () => {
        if (this.nameInput.length < 3) {
          this.nameInput += key
          this.updateNameDisplay()
        }
      })

      container.on('pointerover', () => {
        bg.clear()
        bg.fillStyle(COLORS.primary, 1)
        bg.fillRoundedRect(-keyWidth / 2, -keyHeight / 2, keyWidth, keyHeight, 5)
      })

      container.on('pointerout', () => {
        bg.clear()
        bg.fillStyle(0x444444, 1)
        bg.fillRoundedRect(-keyWidth / 2, -keyHeight / 2, keyWidth, keyHeight, 5)
      })
    })

    // Backspace button
    const bsX = startX + 7 * (keyWidth + spacing)
    const bsY = y + 4 * (keyHeight + spacing)

    const bsBg = this.add.graphics()
    bsBg.fillStyle(0x664444, 1)
    bsBg.fillRoundedRect(-keyWidth / 2, -keyHeight / 2, keyWidth * 2 + spacing, keyHeight, 5)

    const bsLabel = this.add.text(keyWidth / 2, 0, '←', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial Black',
    })
    bsLabel.setOrigin(0.5)

    const bsContainer = this.add.container(bsX, bsY, [bsBg, bsLabel])
    bsContainer.setSize(keyWidth * 2 + spacing, keyHeight)
    bsContainer.setInteractive({ useHandCursor: true })

    bsContainer.on('pointerdown', () => {
      this.nameInput = this.nameInput.slice(0, -1)
      this.updateNameDisplay()
    })
  }

  private createSubmitButton(x: number, y: number): void {
    const width = 200
    const height = 45

    const bg = this.add.graphics()
    bg.fillStyle(COLORS.accent, 1)
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10)

    const label = this.add.text(0, 0, 'SUBMIT SCORE', {
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
      const store = useGameStore.getState()
      const name = this.nameInput || 'AAA'
      
      // Save name
      store.setPlayerName(name)
      
      // Add to leaderboard
      store.addLeaderboardEntry({
        playerName: name,
        jerseyNumber: store.selectedDefender,
        score: store.score,
        wave: store.wave,
        tackles: store.tackles,
      })

      this.cameras.main.fadeOut(200)
      this.time.delayedCall(200, () => {
        this.scene.start('LeaderboardScene', { fromGameOver: true })
      })
    })
  }

  private createRetryButton(x: number, y: number): void {
    const retryBtn = this.add.text(x, y, 'PLAY AGAIN', {
      fontSize: '14px',
      color: '#888888',
      fontFamily: 'Arial',
    })
    retryBtn.setOrigin(0.5)
    retryBtn.setInteractive({ useHandCursor: true })

    retryBtn.on('pointerover', () => retryBtn.setColor('#ffffff'))
    retryBtn.on('pointerout', () => retryBtn.setColor('#888888'))
    retryBtn.on('pointerdown', () => {
      useGameStore.getState().startGame()
      this.cameras.main.fadeOut(200)
      this.time.delayedCall(200, () => {
        this.scene.start('GameScene')
      })
    })
  }
}
