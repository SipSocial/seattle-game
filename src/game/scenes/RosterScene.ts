import * as Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONTS, hexToCSS, getPositionGroupColor } from '../config/phaserConfig'
import { FULL_ROSTER, Defender } from '../data/roster'
import { useGameStore } from '../../store/gameStore'
import { AudioManager } from '../systems/AudioManager'

export class RosterScene extends Phaser.Scene {
  private selectedJersey: number = 21
  private jerseyCards: Map<number, Phaser.GameObjects.Container> = new Map()
  private previewContainer!: Phaser.GameObjects.Container
  private previewJerseyText!: Phaser.GameObjects.Text
  private previewPositionText!: Phaser.GameObjects.Text
  private previewGlow!: Phaser.GameObjects.Graphics
  private scrollContainer!: Phaser.GameObjects.Container
  private scrollMask!: Phaser.GameObjects.Graphics

  constructor() {
    super({ key: 'RosterScene' })
  }

  create(): void {
    this.cameras.main.fadeIn(400)
    this.cameras.main.setBackgroundColor(COLORS.navy)

    // Get current selection from store
    const { selectedDefender } = useGameStore.getState()
    this.selectedJersey = selectedDefender

    // Create background
    this.createBackground()
    
    // Create header
    this.createHeader()
    
    // Create player preview
    this.createPlayerPreview()
    
    // Create scrollable roster grid
    this.createRosterGrid()
    
    // Create play button
    this.createPlayButton()
    
    // Create back button
    this.createBackButton()
  }

  private createBackground(): void {
    const graphics = this.add.graphics()
    
    // Stadium-like gradient
    for (let y = 0; y < GAME_HEIGHT; y++) {
      const progress = y / GAME_HEIGHT
      const r = Math.floor(0 + progress * 0)
      const g = Math.floor(26 + progress * 20)
      const b = Math.floor(51 + progress * 15)
      graphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1)
      graphics.fillRect(0, y, GAME_WIDTH, 1)
    }
    
    // Spotlight effect on preview area
    const spotlight = this.add.graphics()
    spotlight.fillStyle(0xffffff, 0.03)
    spotlight.fillEllipse(GAME_WIDTH / 2, 150, 300, 200)
    
    // Field glow at bottom
    const fieldGlow = this.add.graphics()
    fieldGlow.fillStyle(COLORS.green, 0.08)
    fieldGlow.fillEllipse(GAME_WIDTH / 2, GAME_HEIGHT + 50, GAME_WIDTH, 200)
  }

  private createHeader(): void {
    const centerX = GAME_WIDTH / 2
    
    // Title
    const title = this.add.text(centerX, 45, 'SELECT YOUR DEFENDER', {
      fontSize: '22px',
      color: hexToCSS(COLORS.white),
      fontFamily: FONTS.display,
      letterSpacing: 3,
    })
    title.setOrigin(0.5)
    title.setAlpha(0)
    
    // Subtitle
    const subtitle = this.add.text(centerX, 70, '24-MAN DEFENSIVE ROSTER', {
      fontSize: '11px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
      letterSpacing: 2,
    })
    subtitle.setOrigin(0.5)
    subtitle.setAlpha(0)
    
    // Animate in
    this.tweens.add({
      targets: [title, subtitle],
      alpha: 1,
      y: '-=10',
      duration: 500,
      delay: 200,
      ease: 'Power2'
    })
  }

  private createPlayerPreview(): void {
    const centerX = GAME_WIDTH / 2
    const previewY = 150
    
    this.previewContainer = this.add.container(centerX, previewY)
    
    // Outer glow ring (animated)
    this.previewGlow = this.add.graphics()
    this.previewGlow.lineStyle(4, COLORS.green, 0.4)
    this.previewGlow.strokeCircle(0, 0, 65)
    
    // Pulsing animation
    this.tweens.add({
      targets: this.previewGlow,
      scaleX: 1.15,
      scaleY: 1.15,
      alpha: 0.6,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
    
    // Position-colored ring
    const defender = FULL_ROSTER.find((d) => d.jersey === this.selectedJersey)
    const posColor = getPositionGroupColor(defender?.positionGroup || 'DB')
    
    const positionRing = this.add.graphics()
    positionRing.lineStyle(6, posColor, 1)
    positionRing.strokeCircle(0, 0, 52)
    positionRing.setName('positionRing')
    
    // Main circle background
    const bgCircle = this.add.graphics()
    bgCircle.fillStyle(COLORS.navyLight, 1)
    bgCircle.fillCircle(0, 0, 48)
    
    // Inner gradient effect
    const innerGlow = this.add.graphics()
    innerGlow.fillStyle(COLORS.green, 0.1)
    innerGlow.fillCircle(0, -15, 30)
    
    // Jersey number
    this.previewJerseyText = this.add.text(0, -5, `${this.selectedJersey}`, {
      fontSize: '42px',
      color: hexToCSS(COLORS.white),
      fontFamily: FONTS.display,
    })
    this.previewJerseyText.setOrigin(0.5)
    
    // Position label
    this.previewPositionText = this.add.text(0, 75, defender?.position || 'CB', {
      fontSize: '16px',
      color: hexToCSS(posColor),
      fontFamily: FONTS.heading,
      letterSpacing: 2,
    })
    this.previewPositionText.setOrigin(0.5)
    
    // Position group badge
    const groupBadge = this.createPositionBadge(defender?.positionGroup || 'DB', 0, 100)
    groupBadge.setName('groupBadge')
    
    this.previewContainer.add([this.previewGlow, positionRing, bgCircle, innerGlow, this.previewJerseyText, this.previewPositionText, groupBadge])
    
    // Entrance animation
    this.previewContainer.setScale(0)
    this.tweens.add({
      targets: this.previewContainer,
      scale: 1,
      duration: 600,
      delay: 300,
      ease: 'Back.easeOut'
    })
  }

  private createPositionBadge(group: Defender['positionGroup'], x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y)
    
    const groupNames: Record<Defender['positionGroup'], string> = {
      'DL': 'DEFENSIVE LINE',
      'LB': 'LINEBACKER',
      'DB': 'DEFENSIVE BACK'
    }
    
    const bg = this.add.graphics()
    bg.fillStyle(getPositionGroupColor(group), 0.2)
    bg.fillRoundedRect(-70, -12, 140, 24, 12)
    bg.lineStyle(1, getPositionGroupColor(group), 0.6)
    bg.strokeRoundedRect(-70, -12, 140, 24, 12)
    
    const text = this.add.text(0, 0, groupNames[group], {
      fontSize: '10px',
      color: hexToCSS(getPositionGroupColor(group)),
      fontFamily: FONTS.body,
      letterSpacing: 1,
    })
    text.setOrigin(0.5)
    
    container.add([bg, text])
    return container
  }

  private createRosterGrid(): void {
    const startY = 250
    const gridHeight = 280
    const cols = 6
    const cellWidth = 58
    const cellHeight = 62
    const startX = (GAME_WIDTH - cols * cellWidth) / 2 + cellWidth / 2
    const rows = Math.ceil(FULL_ROSTER.length / cols)
    const contentHeight = rows * cellHeight
    
    // Create scroll container
    this.scrollContainer = this.add.container(0, startY)
    
    // Position group headers
    const groups = ['DL', 'LB', 'DB'] as const
    const groupLabels = { DL: 'D-LINE', LB: 'LINEBACKERS', DB: 'SECONDARY' }
    
    // Create player cards
    FULL_ROSTER.forEach((defender, index) => {
      const col = index % cols
      const row = Math.floor(index / cols)
      const x = startX + col * cellWidth
      const y = row * cellHeight
      
      const card = this.createPlayerCard(x, y, defender, index)
      this.jerseyCards.set(defender.jersey, card)
      this.scrollContainer.add(card)
    })
    
    this.updateSelection()
    
    // Make scrollable if content is taller than visible area
    if (contentHeight > gridHeight) {
      this.setupScrolling(gridHeight, contentHeight)
    }
    
    // Entrance animation for cards
    this.jerseyCards.forEach((card, jersey) => {
      const defender = FULL_ROSTER.find(d => d.jersey === jersey)
      const index = FULL_ROSTER.indexOf(defender!)
      card.setAlpha(0)
      card.setScale(0.8)
      
      this.tweens.add({
        targets: card,
        alpha: 1,
        scale: 1,
        duration: 300,
        delay: 400 + index * 30,
        ease: 'Back.easeOut'
      })
    })
  }

  private createPlayerCard(x: number, y: number, defender: Defender, index: number): Phaser.GameObjects.Container {
    const size = 50
    const isSelected = defender.jersey === this.selectedJersey
    const posColor = getPositionGroupColor(defender.positionGroup)
    
    // Card background
    const bg = this.add.graphics()
    this.drawCardBackground(bg, size, posColor, isSelected)
    
    // Jersey number
    const jerseyText = this.add.text(0, 0, `${defender.jersey}`, {
      fontSize: '18px',
      color: hexToCSS(COLORS.white),
      fontFamily: FONTS.display,
    })
    jerseyText.setOrigin(0.5)
    jerseyText.setName('jerseyText')
    
    // Position indicator (small dot)
    const posIndicator = this.add.graphics()
    posIndicator.fillStyle(posColor, 1)
    posIndicator.fillCircle(0, size/2 - 8, 3)
    
    const container = this.add.container(x, y, [bg, jerseyText, posIndicator])
    container.setSize(size, size)
    container.setInteractive({ useHandCursor: true })
    container.setData('defender', defender)
    container.setData('bg', bg)
    
    // Hover effects
    container.on('pointerover', () => {
      if (defender.jersey !== this.selectedJersey) {
        this.tweens.add({
          targets: container,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 150,
          ease: 'Power2'
        })
        this.drawCardBackground(bg, size, posColor, false, true)
      }
    })
    
    container.on('pointerout', () => {
      if (defender.jersey !== this.selectedJersey) {
        this.tweens.add({
          targets: container,
          scaleX: 1,
          scaleY: 1,
          duration: 150,
          ease: 'Power2'
        })
        this.drawCardBackground(bg, size, posColor, false, false)
      }
    })
    
    container.on('pointerdown', () => {
      this.selectDefender(defender.jersey)
    })
    
    return container
  }

  private drawCardBackground(graphics: Phaser.GameObjects.Graphics, size: number, posColor: number, selected: boolean, hovered: boolean = false): void {
    graphics.clear()
    
    const halfSize = size / 2
    
    if (selected) {
      // Selected state - full color with glow
      graphics.fillStyle(posColor, 0.9)
      graphics.fillRoundedRect(-halfSize, -halfSize, size, size, 10)
      graphics.lineStyle(3, COLORS.green, 1)
      graphics.strokeRoundedRect(-halfSize, -halfSize, size, size, 10)
    } else if (hovered) {
      // Hovered state
      graphics.fillStyle(posColor, 0.5)
      graphics.fillRoundedRect(-halfSize, -halfSize, size, size, 10)
      graphics.lineStyle(2, COLORS.grey, 0.8)
      graphics.strokeRoundedRect(-halfSize, -halfSize, size, size, 10)
    } else {
      // Default state
      graphics.fillStyle(COLORS.navyLight, 0.6)
      graphics.fillRoundedRect(-halfSize, -halfSize, size, size, 10)
      graphics.lineStyle(1, posColor, 0.4)
      graphics.strokeRoundedRect(-halfSize, -halfSize, size, size, 10)
    }
  }

  private selectDefender(jersey: number): void {
    AudioManager.unlock()
    AudioManager.playClick()
    
    const previousJersey = this.selectedJersey
    this.selectedJersey = jersey
    
    this.updateSelection()
    this.updatePreview(jersey)
    
    // Animate the newly selected card
    const newCard = this.jerseyCards.get(jersey)
    if (newCard) {
      this.tweens.add({
        targets: newCard,
        scaleX: 1.15,
        scaleY: 1.15,
        duration: 100,
        yoyo: true,
        ease: 'Power2'
      })
    }
  }

  private updateSelection(): void {
    this.jerseyCards.forEach((container, jersey) => {
      const defender = container.getData('defender') as Defender
      const bg = container.getData('bg') as Phaser.GameObjects.Graphics
      const isSelected = jersey === this.selectedJersey
      const posColor = getPositionGroupColor(defender.positionGroup)
      
      this.drawCardBackground(bg, 50, posColor, isSelected)
      container.setScale(isSelected ? 1.05 : 1)
    })
  }

  private updatePreview(jersey: number): void {
    const defender = FULL_ROSTER.find((d) => d.jersey === jersey)
    if (!defender) return
    
    const posColor = getPositionGroupColor(defender.positionGroup)
    
    // Animate jersey number change
    this.tweens.add({
      targets: this.previewJerseyText,
      scaleX: 0,
      scaleY: 0,
      duration: 100,
      onComplete: () => {
        this.previewJerseyText.setText(`${jersey}`)
        this.tweens.add({
          targets: this.previewJerseyText,
          scaleX: 1,
          scaleY: 1,
          duration: 200,
          ease: 'Back.easeOut'
        })
      }
    })
    
    // Update position text
    this.previewPositionText.setText(defender.position)
    this.previewPositionText.setColor(hexToCSS(posColor))
    
    // Update position ring
    const positionRing = this.previewContainer.getByName('positionRing') as Phaser.GameObjects.Graphics
    if (positionRing) {
      positionRing.clear()
      positionRing.lineStyle(6, posColor, 1)
      positionRing.strokeCircle(0, 0, 52)
    }
    
    // Update group badge
    const oldBadge = this.previewContainer.getByName('groupBadge') as Phaser.GameObjects.Container
    if (oldBadge) {
      oldBadge.destroy()
    }
    const newBadge = this.createPositionBadge(defender.positionGroup, 0, 100)
    newBadge.setName('groupBadge')
    this.previewContainer.add(newBadge)
    
    // Pulse the glow
    this.tweens.add({
      targets: this.previewGlow,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0.8,
      duration: 200,
      yoyo: true,
      ease: 'Power2'
    })
  }

  private setupScrolling(visibleHeight: number, contentHeight: number): void {
    const maxScroll = contentHeight - visibleHeight
    let currentScroll = 0
    
    // Enable dragging
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown && pointer.y > 250 && pointer.y < 250 + visibleHeight) {
        const deltaY = pointer.prevPosition.y - pointer.y
        currentScroll = Phaser.Math.Clamp(currentScroll + deltaY, 0, maxScroll)
        this.scrollContainer.y = 250 - currentScroll
      }
    })
    
    // Mouse wheel support
    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: unknown, _deltaX: number, deltaY: number) => {
      currentScroll = Phaser.Math.Clamp(currentScroll + deltaY * 0.5, 0, maxScroll)
      this.scrollContainer.y = 250 - currentScroll
    })
  }

  private createPlayButton(): void {
    const centerX = GAME_WIDTH / 2
    const y = GAME_HEIGHT - 65
    const width = 220
    const height = 52
    
    // Button glow
    const glow = this.add.graphics()
    glow.fillStyle(COLORS.green, 0.3)
    glow.fillRoundedRect(centerX - width/2 - 5, y - height/2 - 5, width + 10, height + 10, 16)
    glow.setAlpha(0)
    
    // Main button
    const bg = this.add.graphics()
    bg.fillStyle(COLORS.green, 1)
    bg.fillRoundedRect(-width/2, -height/2, width, height, 14)
    
    // Shine effect
    const shine = this.add.graphics()
    shine.fillStyle(0xffffff, 0.2)
    shine.fillRoundedRect(-width/2 + 4, -height/2 + 4, width - 8, height/2 - 4, { tl: 10, tr: 10, bl: 0, br: 0 })
    
    const label = this.add.text(0, 0, 'START GAME', {
      fontSize: '22px',
      color: hexToCSS(COLORS.navy),
      fontFamily: FONTS.display,
    })
    label.setOrigin(0.5)
    
    const container = this.add.container(centerX, y, [bg, shine, label])
    container.setSize(width, height)
    container.setInteractive({ useHandCursor: true })
    
    // Entrance animation
    container.setAlpha(0)
    container.setScale(0.9)
    this.tweens.add({
      targets: container,
      alpha: 1,
      scale: 1,
      duration: 500,
      delay: 800,
      ease: 'Back.easeOut'
    })
    
    // Hover effects
    container.on('pointerover', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 150
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
        duration: 150
      })
      this.tweens.add({
        targets: glow,
        alpha: 0,
        duration: 150
      })
    })
    
    container.on('pointerdown', () => container.setScale(0.95))
    
    container.on('pointerup', () => {
      AudioManager.unlock()
      AudioManager.playClick()
      
      // Save selection
      useGameStore.getState().setSelectedDefender(this.selectedJersey)
      useGameStore.getState().startGame()
      
      this.cameras.main.fadeOut(300)
      this.time.delayedCall(300, () => {
        this.scene.start('GameScene')
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
      delay: 500
    })
    
    backBtn.on('pointerover', () => {
      backBtn.setColor(hexToCSS(COLORS.green))
      this.tweens.add({
        targets: backBtn,
        x: 30,
        duration: 150
      })
    })
    
    backBtn.on('pointerout', () => {
      backBtn.setColor(hexToCSS(COLORS.grey))
      this.tweens.add({
        targets: backBtn,
        x: 25,
        duration: 150
      })
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
