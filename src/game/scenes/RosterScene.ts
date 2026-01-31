import * as Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONTS, hexToCSS, getPositionGroupColor } from '../config/phaserConfig'
import { FULL_ROSTER, Defender } from '../data/roster'
import { useGameStore } from '../../store/gameStore'
import { AudioManager } from '../systems/AudioManager'

// ===========================================
// ROSTER SCENE - List-Based Player Selection
// ===========================================
// New Design: Scrollable list with player cards
// showing jersey, name, and position
// ===========================================

const LAYOUT = {
  safeTop: 16,
  headerHeight: 100,
  listTop: 110,
  listBottom: 580,
  buttonY: 640,
  cardHeight: 64,
  cardGap: 8,
}

export class RosterScene extends Phaser.Scene {
  private selectedJersey: number = 21
  private playerCards: Map<number, Phaser.GameObjects.Container> = new Map()
  private scrollContainer!: Phaser.GameObjects.Container
  private scrollY: number = 0
  private maxScroll: number = 0
  private isDragging: boolean = false
  private dragStartY: number = 0
  private scrollStartY: number = 0

  constructor() {
    super({ key: 'RosterScene' })
  }

  create(): void {
    this.cameras.main.fadeIn(400)
    this.cameras.main.setBackgroundColor(COLORS.navy)

    const { selectedDefender } = useGameStore.getState()
    this.selectedJersey = selectedDefender || FULL_ROSTER[0]?.jersey || 21

    this.createBackground()
    this.createHeader()
    this.createPlayerList()
    this.createStartButton()
    this.setupScrolling()
  }

  // =========================================
  // BACKGROUND
  // =========================================
  private createBackground(): void {
    const graphics = this.add.graphics()
    
    for (let y = 0; y < GAME_HEIGHT; y++) {
      const progress = y / GAME_HEIGHT
      const r = Math.floor(0 + progress * 10)
      const g = Math.floor(20 + progress * 25)
      const b = Math.floor(40 + progress * 20)
      graphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1)
      graphics.fillRect(0, y, GAME_WIDTH, 1)
    }
    
    // Top accent line
    const accent = this.add.graphics()
    accent.fillStyle(COLORS.green, 0.8)
    accent.fillRect(0, 0, GAME_WIDTH, 3)
  }

  // =========================================
  // HEADER
  // =========================================
  private createHeader(): void {
    const centerX = GAME_WIDTH / 2
    
    // Back button
    this.createBackButton()
    
    // Title
    const title = this.add.text(centerX, 45, 'CHOOSE YOUR DEFENDER', {
      fontSize: '20px',
      color: hexToCSS(COLORS.white),
      fontFamily: FONTS.display,
      letterSpacing: 1,
    })
    title.setOrigin(0.5)
    
    // Subtitle
    const subtitle = this.add.text(centerX, 70, '2025 SEAHAWKS DEFENSE', {
      fontSize: '11px',
      color: hexToCSS(COLORS.green),
      fontFamily: FONTS.body,
      letterSpacing: 2,
    })
    subtitle.setOrigin(0.5)
    
    // Roster count
    const count = this.add.text(centerX, 92, `${FULL_ROSTER.length} PLAYERS`, {
      fontSize: '9px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
    })
    count.setOrigin(0.5)
  }

  private createBackButton(): void {
    const btnSize = 40
    const x = 28
    const y = 36
    
    const bg = this.add.graphics()
    bg.fillStyle(COLORS.navyLight, 0.8)
    bg.fillRoundedRect(-btnSize/2, -btnSize/2, btnSize, btnSize, 10)
    
    const arrow = this.add.text(0, 0, '←', {
      fontSize: '20px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.display,
    })
    arrow.setOrigin(0.5)
    
    const btn = this.add.container(x, y, [bg, arrow])
    btn.setSize(btnSize, btnSize)
    btn.setInteractive({ useHandCursor: true })
    
    btn.on('pointerover', () => arrow.setColor(hexToCSS(COLORS.green)))
    btn.on('pointerout', () => arrow.setColor(hexToCSS(COLORS.grey)))
    btn.on('pointerdown', () => btn.setScale(0.9))
    btn.on('pointerup', () => {
      btn.setScale(1)
      AudioManager.playClick()
      this.cameras.main.fadeOut(300)
      this.time.delayedCall(300, () => this.scene.start('MenuScene'))
    })
  }

  // =========================================
  // PLAYER LIST
  // =========================================
  private createPlayerList(): void {
    const listHeight = LAYOUT.listBottom - LAYOUT.listTop
    const totalHeight = FULL_ROSTER.length * (LAYOUT.cardHeight + LAYOUT.cardGap)
    this.maxScroll = Math.max(0, totalHeight - listHeight)
    
    // Create scroll container
    this.scrollContainer = this.add.container(0, LAYOUT.listTop)
    
    // Group players by position group
    const groups = this.groupPlayersByPosition()
    
    let yOffset = 0
    
    groups.forEach((players, groupName) => {
      // Section header
      const sectionHeader = this.createSectionHeader(groupName, yOffset)
      this.scrollContainer.add(sectionHeader)
      yOffset += 36
      
      // Player cards
      players.forEach((defender, index) => {
        const card = this.createPlayerCard(defender, yOffset, index)
        this.playerCards.set(defender.jersey, card)
        this.scrollContainer.add(card)
        yOffset += LAYOUT.cardHeight + LAYOUT.cardGap
      })
      
      yOffset += 12 // Gap between sections
    })
    
    // Update max scroll based on actual content
    this.maxScroll = Math.max(0, yOffset - listHeight + 20)
    
    // Entrance animation - fade in from right
    let delay = 0
    this.playerCards.forEach((card) => {
      const originalX = card.x
      card.setAlpha(0)
      card.x = originalX + 80
      this.tweens.add({
        targets: card,
        alpha: 1,
        x: originalX,
        duration: 250,
        delay: delay,
        ease: 'Power2'
      })
      delay += 20
    })
  }

  private groupPlayersByPosition(): Map<string, Defender[]> {
    const groups = new Map<string, Defender[]>()
    
    const dl = FULL_ROSTER.filter(d => d.positionGroup === 'DL')
    const lb = FULL_ROSTER.filter(d => d.positionGroup === 'LB')
    const db = FULL_ROSTER.filter(d => d.positionGroup === 'DB')
    
    if (dl.length > 0) groups.set('DEFENSIVE LINE', dl)
    if (lb.length > 0) groups.set('LINEBACKERS', lb)
    if (db.length > 0) groups.set('SECONDARY', db)
    
    return groups
  }

  private createSectionHeader(title: string, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(GAME_WIDTH / 2, y + 18)
    
    // Left line
    const leftLine = this.add.graphics()
    leftLine.lineStyle(1, COLORS.grey, 0.3)
    leftLine.lineBetween(-170, 0, -80, 0)
    
    // Title
    const text = this.add.text(0, 0, title, {
      fontSize: '10px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
      letterSpacing: 2,
    })
    text.setOrigin(0.5)
    
    // Right line
    const rightLine = this.add.graphics()
    rightLine.lineStyle(1, COLORS.grey, 0.3)
    rightLine.lineBetween(80, 0, 170, 0)
    
    container.add([leftLine, text, rightLine])
    return container
  }

  private createPlayerCard(defender: Defender, y: number, index: number): Phaser.GameObjects.Container {
    const width = GAME_WIDTH - 32
    const height = LAYOUT.cardHeight
    const isSelected = defender.jersey === this.selectedJersey
    const posColor = getPositionGroupColor(defender.positionGroup)
    
    // Card background
    const bg = this.add.graphics()
    this.drawPlayerCard(bg, width, height, posColor, isSelected)
    
    // Position accent bar (left side)
    const accentBar = this.add.graphics()
    accentBar.fillStyle(posColor, isSelected ? 1 : 0.6)
    accentBar.fillRoundedRect(-width/2, -height/2, 5, height, { tl: 12, bl: 12, tr: 0, br: 0 })
    accentBar.setName('accentBar')
    
    // Jersey number circle
    const jerseyBg = this.add.graphics()
    jerseyBg.fillStyle(isSelected ? posColor : COLORS.navyLight, 1)
    jerseyBg.fillCircle(-width/2 + 40, 0, 22)
    if (!isSelected) {
      jerseyBg.lineStyle(2, posColor, 0.5)
      jerseyBg.strokeCircle(-width/2 + 40, 0, 22)
    }
    jerseyBg.setName('jerseyBg')
    
    // Jersey number
    const jerseyText = this.add.text(-width/2 + 40, 0, `${defender.jersey}`, {
      fontSize: '18px',
      color: isSelected ? hexToCSS(COLORS.navy) : hexToCSS(COLORS.white),
      fontFamily: FONTS.display,
    })
    jerseyText.setOrigin(0.5)
    jerseyText.setName('jerseyText')
    
    // Player name
    const nameText = this.add.text(-width/2 + 75, -8, defender.name.toUpperCase(), {
      fontSize: '14px',
      color: hexToCSS(COLORS.white),
      fontFamily: FONTS.display,
      letterSpacing: 0.5,
    })
    nameText.setName('nameText')
    
    // Position badge
    const posBadge = this.add.graphics()
    const posWidth = 45
    posBadge.fillStyle(posColor, 0.2)
    posBadge.fillRoundedRect(-width/2 + 75, 8, posWidth, 18, 4)
    
    const posText = this.add.text(-width/2 + 75 + posWidth/2, 17, defender.position, {
      fontSize: '10px',
      color: hexToCSS(posColor),
      fontFamily: FONTS.body,
    })
    posText.setOrigin(0.5)
    
    // Selection indicator (right side)
    const checkmark = this.add.text(width/2 - 25, 0, isSelected ? '✓' : '', {
      fontSize: '20px',
      color: hexToCSS(COLORS.green),
      fontFamily: FONTS.display,
    })
    checkmark.setOrigin(0.5)
    checkmark.setName('checkmark')
    
    const container = this.add.container(GAME_WIDTH / 2, y + height/2)
    container.add([bg, accentBar, jerseyBg, jerseyText, nameText, posBadge, posText, checkmark])
    container.setSize(width, height)
    container.setInteractive({ useHandCursor: true })
    container.setData('defender', defender)
    container.setData('bg', bg)
    container.setData('width', width)
    container.setData('height', height)
    
    // Interactions
    container.on('pointerover', () => {
      if (defender.jersey !== this.selectedJersey) {
        this.tweens.add({ targets: container, scaleX: 1.02, duration: 100 })
        bg.clear()
        this.drawPlayerCard(bg, width, height, posColor, false, true)
      }
    })
    
    container.on('pointerout', () => {
      if (defender.jersey !== this.selectedJersey) {
        this.tweens.add({ targets: container, scaleX: 1, duration: 100 })
        bg.clear()
        this.drawPlayerCard(bg, width, height, posColor, false, false)
      }
    })
    
    container.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.dragStartY = pointer.y
      this.scrollStartY = this.scrollY
    })
    
    container.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      // Only select if it wasn't a scroll gesture
      const dragDistance = Math.abs(pointer.y - this.dragStartY)
      if (dragDistance < 10) {
        this.selectDefender(defender.jersey)
      }
    })
    
    return container
  }

  private drawPlayerCard(g: Phaser.GameObjects.Graphics, w: number, h: number, posColor: number, selected: boolean, hovered: boolean = false): void {
    g.clear()
    const half = { w: w/2, h: h/2 }
    
    if (selected) {
      g.fillStyle(COLORS.navyLight, 1)
      g.fillRoundedRect(-half.w, -half.h, w, h, 12)
      g.lineStyle(2, COLORS.green, 1)
      g.strokeRoundedRect(-half.w, -half.h, w, h, 12)
    } else if (hovered) {
      g.fillStyle(COLORS.navyLight, 0.9)
      g.fillRoundedRect(-half.w, -half.h, w, h, 12)
      g.lineStyle(1, posColor, 0.6)
      g.strokeRoundedRect(-half.w, -half.h, w, h, 12)
    } else {
      g.fillStyle(COLORS.navyLight, 0.6)
      g.fillRoundedRect(-half.w, -half.h, w, h, 12)
    }
  }

  private selectDefender(jersey: number): void {
    if (jersey === this.selectedJersey) return
    
    AudioManager.unlock()
    AudioManager.playClick()
    
    const oldJersey = this.selectedJersey
    this.selectedJersey = jersey
    
    // Update old card
    const oldCard = this.playerCards.get(oldJersey)
    if (oldCard) {
      this.updateCardVisuals(oldCard, false)
    }
    
    // Update new card
    const newCard = this.playerCards.get(jersey)
    if (newCard) {
      this.updateCardVisuals(newCard, true)
      
      // Pop animation
      this.tweens.add({
        targets: newCard,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
        yoyo: true,
        ease: 'Power2'
      })
    }
  }

  private updateCardVisuals(card: Phaser.GameObjects.Container, selected: boolean): void {
    const defender = card.getData('defender') as Defender
    const bg = card.getData('bg') as Phaser.GameObjects.Graphics
    const width = card.getData('width') as number
    const height = card.getData('height') as number
    const posColor = getPositionGroupColor(defender.positionGroup)
    
    // Update background
    this.drawPlayerCard(bg, width, height, posColor, selected)
    
    // Update accent bar
    const accentBar = card.getByName('accentBar') as Phaser.GameObjects.Graphics
    if (accentBar) {
      accentBar.clear()
      accentBar.fillStyle(posColor, selected ? 1 : 0.6)
      accentBar.fillRoundedRect(-width/2, -height/2, 5, height, { tl: 12, bl: 12, tr: 0, br: 0 })
    }
    
    // Update jersey background
    const jerseyBg = card.getByName('jerseyBg') as Phaser.GameObjects.Graphics
    if (jerseyBg) {
      jerseyBg.clear()
      jerseyBg.fillStyle(selected ? posColor : COLORS.navyLight, 1)
      jerseyBg.fillCircle(-width/2 + 40, 0, 22)
      if (!selected) {
        jerseyBg.lineStyle(2, posColor, 0.5)
        jerseyBg.strokeCircle(-width/2 + 40, 0, 22)
      }
    }
    
    // Update jersey text color
    const jerseyText = card.getByName('jerseyText') as Phaser.GameObjects.Text
    if (jerseyText) {
      jerseyText.setColor(selected ? hexToCSS(COLORS.navy) : hexToCSS(COLORS.white))
    }
    
    // Update checkmark
    const checkmark = card.getByName('checkmark') as Phaser.GameObjects.Text
    if (checkmark) {
      checkmark.setText(selected ? '✓' : '')
    }
  }

  // =========================================
  // SCROLLING
  // =========================================
  private setupScrolling(): void {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.y > LAYOUT.listTop && pointer.y < LAYOUT.listBottom) {
        this.isDragging = true
        this.dragStartY = pointer.y
        this.scrollStartY = this.scrollY
      }
    })
    
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging && pointer.isDown) {
        const deltaY = this.dragStartY - pointer.y
        this.scrollY = Phaser.Math.Clamp(this.scrollStartY + deltaY, 0, this.maxScroll)
        this.scrollContainer.y = LAYOUT.listTop - this.scrollY
      }
    })
    
    this.input.on('pointerup', () => {
      this.isDragging = false
    })
    
    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: unknown, _dx: number, dy: number) => {
      this.scrollY = Phaser.Math.Clamp(this.scrollY + dy * 0.5, 0, this.maxScroll)
      this.scrollContainer.y = LAYOUT.listTop - this.scrollY
    })
  }

  // =========================================
  // START BUTTON
  // =========================================
  private createStartButton(): void {
    const centerX = GAME_WIDTH / 2
    const width = 280
    const height = 58
    
    // Glow
    const glow = this.add.graphics()
    glow.fillStyle(COLORS.green, 0.2)
    glow.fillRoundedRect(centerX - width/2 - 8, LAYOUT.buttonY - height/2 - 8, width + 16, height + 16, 20)
    glow.setAlpha(0)
    
    // Background
    const bg = this.add.graphics()
    bg.fillStyle(COLORS.green, 1)
    bg.fillRoundedRect(-width/2, -height/2, width, height, 14)
    
    // Shine
    const shine = this.add.graphics()
    shine.fillStyle(0xffffff, 0.15)
    shine.fillRoundedRect(-width/2 + 4, -height/2 + 4, width - 8, height/2 - 6, { tl: 10, tr: 10, bl: 0, br: 0 })
    
    // Label
    const label = this.add.text(0, 0, 'START GAME', {
      fontSize: '24px',
      color: hexToCSS(COLORS.navy),
      fontFamily: FONTS.display,
      letterSpacing: 2,
    })
    label.setOrigin(0.5)
    
    const btn = this.add.container(centerX, LAYOUT.buttonY, [bg, shine, label])
    btn.setSize(width, height)
    btn.setInteractive({ useHandCursor: true })
    btn.setAlpha(0)
    btn.setScale(0.9)
    
    // Entrance animation
    this.tweens.add({
      targets: btn,
      alpha: 1,
      scale: 1,
      duration: 400,
      delay: 800,
      ease: 'Back.easeOut'
    })
    
    // Hover
    btn.on('pointerover', () => {
      this.tweens.add({ targets: btn, scale: 1.03, duration: 100 })
      this.tweens.add({ targets: glow, alpha: 1, duration: 100 })
    })
    
    btn.on('pointerout', () => {
      this.tweens.add({ targets: btn, scale: 1, duration: 100 })
      this.tweens.add({ targets: glow, alpha: 0, duration: 100 })
    })
    
    btn.on('pointerdown', () => btn.setScale(0.97))
    
    btn.on('pointerup', () => {
      btn.setScale(1.03)
      AudioManager.unlock()
      AudioManager.playClick()
      
      useGameStore.getState().setSelectedDefender(this.selectedJersey)
      useGameStore.getState().startGame()
      
      this.cameras.main.fadeOut(300)
      this.time.delayedCall(300, () => this.scene.start('GameScene'))
    })
  }
}
