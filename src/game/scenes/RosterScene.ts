import * as Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/phaserConfig'
import { FULL_ROSTER, getPositionColor, Defender } from '../data/roster'
import { useGameStore } from '../../store/gameStore'
import { AudioManager } from '../systems/AudioManager'

export class RosterScene extends Phaser.Scene {
  private selectedJersey: number = 21
  private jerseyButtons: Map<number, Phaser.GameObjects.Container> = new Map()
  private previewText!: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'RosterScene' })
  }

  create(): void {
    this.cameras.main.fadeIn(300)
    this.cameras.main.setBackgroundColor(COLORS.trim)

    // Get current selection from store
    const { selectedDefender } = useGameStore.getState()
    this.selectedJersey = selectedDefender

    const centerX = GAME_WIDTH / 2

    // Title
    const title = this.add.text(centerX, 40, 'SELECT YOUR DEFENDER', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial Black',
    })
    title.setOrigin(0.5)

    // Preview area
    this.createPreview(centerX, 120)

    // Jersey grid
    this.createJerseyGrid()

    // Play button
    this.createPlayButton(centerX, GAME_HEIGHT - 70)

    // Back button
    this.createBackButton()
  }

  private createPreview(x: number, y: number): void {
    // Large jersey number display
    const jerseyBg = this.add.graphics()
    jerseyBg.fillStyle(COLORS.primary, 1)
    jerseyBg.fillCircle(x, y, 50)
    jerseyBg.lineStyle(4, COLORS.accent)
    jerseyBg.strokeCircle(x, y, 50)

    this.previewText = this.add.text(x, y, `#${this.selectedJersey}`, {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial Black',
    })
    this.previewText.setOrigin(0.5)

    // Position label
    const defender = FULL_ROSTER.find((d) => d.jersey === this.selectedJersey)
    const posText = this.add.text(x, y + 70, defender?.position || '', {
      fontSize: '16px',
      color: '#' + COLORS.accent.toString(16).padStart(6, '0'),
      fontFamily: 'Arial',
    })
    posText.setOrigin(0.5)
    posText.setName('positionLabel')
  }

  private createJerseyGrid(): void {
    const startY = 220
    const cols = 6
    const cellWidth = 55
    const cellHeight = 55
    const startX = (GAME_WIDTH - cols * cellWidth) / 2 + cellWidth / 2

    FULL_ROSTER.forEach((defender, index) => {
      const col = index % cols
      const row = Math.floor(index / cols)
      const x = startX + col * cellWidth
      const y = startY + row * cellHeight

      const button = this.createJerseyButton(x, y, defender)
      this.jerseyButtons.set(defender.jersey, button)
    })

    this.updateSelection()
  }

  private createJerseyButton(x: number, y: number, defender: Defender): Phaser.GameObjects.Container {
    const size = 45
    const isSelected = defender.jersey === this.selectedJersey

    const bg = this.add.graphics()
    bg.fillStyle(getPositionColor(defender.positionGroup), isSelected ? 1 : 0.3)
    bg.fillRoundedRect(-size / 2, -size / 2, size, size, 8)

    if (isSelected) {
      bg.lineStyle(3, COLORS.accent)
      bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 8)
    }

    const label = this.add.text(0, 0, `${defender.jersey}`, {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial Black',
    })
    label.setOrigin(0.5)

    const container = this.add.container(x, y, [bg, label])
    container.setSize(size, size)
    container.setInteractive({ useHandCursor: true })
    container.setData('defender', defender)

    container.on('pointerdown', () => {
      this.selectDefender(defender.jersey)
    })

    container.on('pointerover', () => {
      if (defender.jersey !== this.selectedJersey) {
        container.setScale(1.1)
      }
    })

    container.on('pointerout', () => {
      container.setScale(1)
    })

    return container
  }

  private selectDefender(jersey: number): void {
    AudioManager.unlock()
    AudioManager.playClick()
    
    this.selectedJersey = jersey
    this.updateSelection()

    // Update preview
    this.previewText.setText(`#${jersey}`)
    const defender = FULL_ROSTER.find((d) => d.jersey === jersey)
    const posLabel = this.children.getByName('positionLabel') as Phaser.GameObjects.Text
    if (posLabel && defender) {
      posLabel.setText(defender.position)
    }
  }

  private updateSelection(): void {
    this.jerseyButtons.forEach((container, jersey) => {
      const defender = container.getData('defender') as Defender
      const bg = container.getAt(0) as Phaser.GameObjects.Graphics
      const isSelected = jersey === this.selectedJersey

      bg.clear()
      bg.fillStyle(getPositionColor(defender.positionGroup), isSelected ? 1 : 0.3)
      bg.fillRoundedRect(-22.5, -22.5, 45, 45, 8)

      if (isSelected) {
        bg.lineStyle(3, COLORS.accent)
        bg.strokeRoundedRect(-22.5, -22.5, 45, 45, 8)
      }
    })
  }

  private createPlayButton(x: number, y: number): void {
    const width = 180
    const height = 50

    const bg = this.add.graphics()
    bg.fillStyle(COLORS.accent, 1)
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12)

    const label = this.add.text(0, 0, 'START GAME', {
      fontSize: '18px',
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
      AudioManager.unlock()
      AudioManager.playClick()
      
      // Save selection to store
      useGameStore.getState().setSelectedDefender(this.selectedJersey)
      useGameStore.getState().startGame()

      this.cameras.main.fadeOut(200)
      this.time.delayedCall(200, () => {
        this.scene.start('GameScene')
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
