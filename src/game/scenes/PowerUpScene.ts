import * as Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT } from '../config/phaserConfig'
import { getLevelConfig } from '../data/levels'
import { getOpponentById, hexToNumber } from '../data/teams'
import { getGameState, getRandomPowerUps, type PowerUpDef, type PowerUpId } from '../../store/gameStore'

/**
 * PowerUpScene - Select a power-up after winning a clash
 * 
 * Shows 3 random power-up cards, player picks 1.
 * Power-up is applied to the NEXT clash.
 */

const CARD_WIDTH = 170
const CARD_HEIGHT = 210
const CARD_GAP = 25

export class PowerUpScene extends Phaser.Scene {
  private cards: Phaser.GameObjects.Container[] = []
  private powerUps: PowerUpDef[] = []
  private selected: boolean = false

  constructor() {
    super({ key: 'PowerUpScene' })
  }

  create(): void {
    this.cards = []
    this.selected = false

    const state = getGameState()
    const nextLevel = state.currentLevel
    const nextLevelConfig = getLevelConfig(nextLevel)
    const nextOpponent = getOpponentById(nextLevelConfig.opponentId)

    // Background
    this.cameras.main.setBackgroundColor('#0B1F24')

    // Victory particles
    this.createCelebrationParticles()

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 50, 'VICTORY!', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '52px',
      color: '#7ED957',
      stroke: '#0B1F24',
      strokeThickness: 5,
    })
    title.setOrigin(0.5)

    // Subtitle
    const subtitle = this.add.text(GAME_WIDTH / 2, 100, 'Choose Your Power-Up', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#ffffff',
    })
    subtitle.setOrigin(0.5)

    // Next opponent preview
    const nextLabel = nextLevelConfig.isSuperBowl ? 'SUPER BOWL' : `NEXT: LEVEL ${nextLevel}`
    const nextText = this.add.text(GAME_WIDTH / 2, 135, `${nextLabel} - ${nextOpponent.name}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: nextOpponent.colors.accent,
    })
    nextText.setOrigin(0.5)

    // Get 3 random power-ups
    this.powerUps = getRandomPowerUps(3)

    // Create cards
    const totalWidth = CARD_WIDTH * 3 + CARD_GAP * 2
    const startX = (GAME_WIDTH - totalWidth) / 2 + CARD_WIDTH / 2
    const cardY = GAME_HEIGHT / 2 + 30

    this.powerUps.forEach((powerUp, index) => {
      const x = startX + index * (CARD_WIDTH + CARD_GAP)
      const card = this.createCard(x, cardY, powerUp, index)
      this.cards.push(card)
    })

    // Instructions
    const instructions = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 35, 'Tap a card to select your power-up', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#666666',
    })
    instructions.setOrigin(0.5)
  }

  private createCard(
    x: number,
    y: number,
    powerUp: PowerUpDef,
    index: number
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y)

    // Card background
    const bg = this.add.graphics()
    bg.fillStyle(0x1a3d3d, 1)
    bg.fillRoundedRect(-CARD_WIDTH / 2, -CARD_HEIGHT / 2, CARD_WIDTH, CARD_HEIGHT, 14)
    bg.lineStyle(3, 0x0f6e6a, 1)
    bg.strokeRoundedRect(-CARD_WIDTH / 2, -CARD_HEIGHT / 2, CARD_WIDTH, CARD_HEIGHT, 14)

    // Icon circle
    const iconBg = this.add.graphics()
    iconBg.fillStyle(0x0f6e6a, 1)
    iconBg.fillCircle(0, -55, 32)

    // Icon letter
    const icon = this.add.text(0, -55, powerUp.icon, {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '28px',
      color: '#ffffff',
    })
    icon.setOrigin(0.5)

    // Power-up name
    const name = this.add.text(0, 5, powerUp.name, {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '16px',
      color: '#7ED957',
      align: 'center',
      wordWrap: { width: CARD_WIDTH - 20 },
    })
    name.setOrigin(0.5)

    // Description
    const desc = this.add.text(0, 50, powerUp.description, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      color: '#cccccc',
      align: 'center',
      wordWrap: { width: CARD_WIDTH - 20 },
    })
    desc.setOrigin(0.5)

    container.add([bg, iconBg, icon, name, desc])

    // Make interactive
    const hitArea = new Phaser.Geom.Rectangle(
      -CARD_WIDTH / 2,
      -CARD_HEIGHT / 2,
      CARD_WIDTH,
      CARD_HEIGHT
    )
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains)

    // Hover effect
    container.on('pointerover', () => {
      if (!this.selected) {
        this.tweens.add({
          targets: container,
          scaleX: 1.08,
          scaleY: 1.08,
          duration: 100,
        })
      }
    })

    container.on('pointerout', () => {
      if (!this.selected) {
        this.tweens.add({
          targets: container,
          scaleX: 1,
          scaleY: 1,
          duration: 100,
        })
      }
    })

    container.on('pointerdown', () => {
      if (!this.selected) {
        this.selectCard(container, powerUp.id, bg)
      }
    })

    // Entrance animation
    container.setScale(0)
    container.setAlpha(0)
    this.tweens.add({
      targets: container,
      scale: 1,
      alpha: 1,
      duration: 350,
      delay: index * 120,
      ease: 'Back.easeOut',
    })

    return container
  }

  private selectCard(
    container: Phaser.GameObjects.Container,
    powerUpId: PowerUpId,
    bg: Phaser.GameObjects.Graphics
  ): void {
    this.selected = true

    // Highlight selected card
    bg.clear()
    bg.fillStyle(0x0f6e6a, 1)
    bg.fillRoundedRect(-CARD_WIDTH / 2, -CARD_HEIGHT / 2, CARD_WIDTH, CARD_HEIGHT, 14)
    bg.lineStyle(5, 0x7ed957, 1)
    bg.strokeRoundedRect(-CARD_WIDTH / 2, -CARD_HEIGHT / 2, CARD_WIDTH, CARD_HEIGHT, 14)

    // Pulse animation
    this.tweens.add({
      targets: container,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 200,
    })

    // Fade out other cards
    this.cards.forEach((card) => {
      if (card !== container) {
        this.tweens.add({
          targets: card,
          alpha: 0.3,
          scale: 0.9,
          duration: 200,
        })
      }
    })

    // Add power-up to state (will be consumed in ClashScene)
    const state = getGameState()
    state.addPowerUp(powerUpId)

    // Show selection confirmation
    const confirmText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 80, 'POWER-UP SELECTED!', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '24px',
      color: '#7ED957',
      stroke: '#000000',
      strokeThickness: 3,
    })
    confirmText.setOrigin(0.5)
    confirmText.setAlpha(0)
    this.tweens.add({
      targets: confirmText,
      alpha: 1,
      duration: 200,
    })

    // Transition to next level's RoadScene
    this.time.delayedCall(900, () => {
      this.cameras.main.fadeOut(300, 0, 0, 0)
      this.time.delayedCall(300, () => {
        this.scene.start('RoadScene')
      })
    })
  }

  private createCelebrationParticles(): void {
    for (let i = 0; i < 25; i++) {
      const x = Math.random() * GAME_WIDTH
      const startY = -20
      const endY = 60 + Math.random() * 100
      const size = 4 + Math.random() * 6
      const color = Math.random() > 0.5 ? 0x7ed957 : 0x0f6e6a

      const particle = this.add.circle(x, startY, size, color)

      this.tweens.add({
        targets: particle,
        y: endY,
        alpha: 0,
        duration: 700 + Math.random() * 400,
        delay: Math.random() * 300,
        ease: 'Cubic.easeOut',
        onComplete: () => particle.destroy(),
      })
    }
  }
}
