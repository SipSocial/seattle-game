import * as Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONTS, hexToCSS } from '../config/phaserConfig'
import { useGameStore } from '../../store/gameStore'
import { AudioManager } from '../systems/AudioManager'
import { 
  CAMPAIGN_STAGES, 
  CampaignStage, 
  getStageByGame, 
  getGameInStage,
  getCampaignProgress,
  GAMES_PER_STAGE,
  TOTAL_GAMES,
  TOTAL_STAGES
} from '../data/campaign'

/**
 * MapScene - Road to the Super Bowl
 * 
 * A scrollable U.S. map showing the player's journey from Seattle to San Francisco.
 * Inspired by classic arcade racing games and Donkey Kong-style progression maps.
 */
export class MapScene extends Phaser.Scene {
  private mapContainer!: Phaser.GameObjects.Container
  private routePath!: Phaser.GameObjects.Graphics
  private cityNodes: Map<number, Phaser.GameObjects.Container> = new Map()
  private currentMarker!: Phaser.GameObjects.Container
  private scrollY = 0
  private targetScrollY = 0
  private isDragging = false
  private dragStartY = 0
  private lastDragY = 0
  
  // Stage preview modal
  private previewModal: Phaser.GameObjects.Container | null = null
  private modalOverlay: Phaser.GameObjects.Graphics | null = null
  
  // Map dimensions (taller than screen for scrolling)
  private readonly MAP_HEIGHT = 1800
  private readonly MAP_PADDING = 100
  
  constructor() {
    super({ key: 'MapScene' })
  }

  create(): void {
    this.cameras.main.fadeIn(500)
    this.cameras.main.setBackgroundColor(0x0a1628)
    
    const { campaign } = useGameStore.getState()
    
    // Create the scrollable map container
    this.mapContainer = this.add.container(0, 0)
    
    // Draw map background
    this.createMapBackground()
    
    // Draw route path connecting all cities
    this.createRoutePath()
    
    // Create city nodes
    this.createCityNodes()
    
    // Create current position marker
    this.createCurrentMarker()
    
    // Create UI overlay (fixed position)
    this.createUIOverlay()
    
    // Setup scrolling input
    this.setupScrollInput()
    
    // Scroll to current stage
    this.scrollToCurrentStage(campaign.currentStageId)
    
    // Check for stage unlock celebration
    if (this.registry.get('justUnlockedStage')) {
      this.registry.remove('justUnlockedStage')
      this.celebrateStageUnlock(campaign.currentStageId)
    }
  }
  
  private celebrateStageUnlock(stageId: number): void {
    // Celebration effect when arriving at a new stage
    const node = this.cityNodes.get(stageId)
    const prevNode = this.cityNodes.get(stageId - 1)
    
    if (!node) return
    
    // Animate the route line from previous stage to this one
    if (prevNode && stageId > 1) {
      this.animateRouteLine(prevNode.x, prevNode.y, node.x, node.y)
    }
    
    // Flash effect at the new node (delayed to sync with route animation)
    this.time.delayedCall(800, () => {
      const flash = this.add.graphics()
      flash.fillStyle(COLORS.green, 0.8)
      flash.fillCircle(node.x, node.y, 50)
      this.mapContainer.add(flash)
      
      this.tweens.add({
        targets: flash,
        scaleX: 3,
        scaleY: 3,
        alpha: 0,
        duration: 800,
        ease: 'Power2',
        onComplete: () => flash.destroy()
      })
      
      // Pulse rings
      for (let i = 0; i < 3; i++) {
        const ring = this.add.graphics()
        ring.lineStyle(3, COLORS.green, 1)
        ring.strokeCircle(node.x, node.y, 20)
        this.mapContainer.add(ring)
        
        this.tweens.add({
          targets: ring,
          scaleX: 4,
          scaleY: 4,
          alpha: 0,
          duration: 1000,
          delay: i * 200,
          ease: 'Power2',
          onComplete: () => ring.destroy()
        })
      }
    })
  }
  
  private animateRouteLine(x1: number, y1: number, x2: number, y2: number): void {
    // Create animated traveling dot along the route
    const traveler = this.add.graphics()
    traveler.fillStyle(COLORS.green, 1)
    traveler.fillCircle(0, 0, 6)
    traveler.setPosition(x1, y1)
    this.mapContainer.add(traveler)
    
    // Glow around traveler
    const glow = this.add.graphics()
    glow.fillStyle(COLORS.green, 0.4)
    glow.fillCircle(0, 0, 15)
    glow.setPosition(x1, y1)
    this.mapContainer.add(glow)
    
    // Calculate bezier curve points
    const midX = (x1 + x2) / 2
    const midY = (y1 + y2) / 2
    const offsetX = (y2 - y1) * 0.2
    
    const curve = new Phaser.Curves.QuadraticBezier(
      new Phaser.Math.Vector2(x1, y1),
      new Phaser.Math.Vector2(midX + offsetX, midY),
      new Phaser.Math.Vector2(x2, y2)
    )
    
    // Draw the path progressively
    const pathGraphics = this.add.graphics()
    pathGraphics.lineStyle(4, COLORS.green, 1)
    this.mapContainer.add(pathGraphics)
    
    let progress = 0
    const animDuration = 800
    const startTime = this.time.now
    
    const updatePath = () => {
      const elapsed = this.time.now - startTime
      progress = Math.min(1, elapsed / animDuration)
      
      // Get current point on curve
      const point = curve.getPoint(progress)
      traveler.setPosition(point.x, point.y)
      glow.setPosition(point.x, point.y)
      
      // Draw path up to current point
      pathGraphics.clear()
      pathGraphics.lineStyle(4, COLORS.green, 1)
      pathGraphics.beginPath()
      pathGraphics.moveTo(x1, y1)
      
      const curvePoints = curve.getPoints(Math.floor(20 * progress))
      for (const p of curvePoints) {
        pathGraphics.lineTo(p.x, p.y)
      }
      pathGraphics.strokePath()
      
      if (progress < 1) {
        this.time.delayedCall(16, updatePath)
      } else {
        // Cleanup traveler
        this.tweens.add({
          targets: [traveler, glow],
          alpha: 0,
          scale: 2,
          duration: 300,
          onComplete: () => {
            traveler.destroy()
            glow.destroy()
          }
        })
      }
    }
    
    updatePath()
  }

  private createMapBackground(): void {
    // Create a stylized U.S. map background
    const bg = this.add.graphics()
    
    // Deep navy gradient background
    for (let y = 0; y < this.MAP_HEIGHT; y++) {
      const progress = y / this.MAP_HEIGHT
      const r = Math.floor(10 + progress * 5)
      const g = Math.floor(22 + progress * 10)
      const b = Math.floor(40 + progress * 15)
      bg.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1)
      bg.fillRect(0, y, GAME_WIDTH, 1)
    }
    
    this.mapContainer.add(bg)
    
    // Simplified U.S. outline (stylized)
    const mapOutline = this.add.graphics()
    mapOutline.lineStyle(2, COLORS.grey, 0.2)
    
    // Draw stylized continental US shape
    const usShape = [
      { x: 50, y: 200 },   // Pacific Northwest
      { x: 30, y: 400 },   // California coast
      { x: 50, y: 600 },   // Southwest
      { x: 150, y: 650 },  // Texas
      { x: 280, y: 700 },  // Gulf coast
      { x: 350, y: 600 },  // Southeast
      { x: 380, y: 450 },  // East coast
      { x: 370, y: 300 },  // Northeast
      { x: 320, y: 200 },  // Great Lakes
      { x: 200, y: 180 },  // Northern border
      { x: 50, y: 200 },   // Back to start
    ]
    
    mapOutline.beginPath()
    mapOutline.moveTo(usShape[0].x, usShape[0].y)
    for (let i = 1; i < usShape.length; i++) {
      mapOutline.lineTo(usShape[i].x, usShape[i].y)
    }
    mapOutline.strokePath()
    
    this.mapContainer.add(mapOutline)
    
    // Add subtle grid lines
    const grid = this.add.graphics()
    grid.lineStyle(1, COLORS.grey, 0.05)
    for (let x = 0; x < GAME_WIDTH; x += 40) {
      grid.moveTo(x, 0)
      grid.lineTo(x, this.MAP_HEIGHT)
      grid.strokePath()
    }
    for (let y = 0; y < this.MAP_HEIGHT; y += 40) {
      grid.moveTo(0, y)
      grid.lineTo(GAME_WIDTH, y)
      grid.strokePath()
    }
    this.mapContainer.add(grid)
    
    // Add "ROAD TO THE SUPER BOWL" title at top of map
    const title = this.add.text(GAME_WIDTH / 2, 60, 'ROAD TO THE\nSUPER BOWL', {
      fontSize: '28px',
      color: hexToCSS(COLORS.green),
      fontFamily: FONTS.display,
      align: 'center',
      lineSpacing: 5,
    })
    title.setOrigin(0.5)
    title.setAlpha(0.8)
    this.mapContainer.add(title)
    
    // Add mini landmarks across the map
    this.createMapLandmarks()
  }
  
  private createMapLandmarks(): void {
    // Decorative landmarks to make the map feel alive
    const landmarks = [
      // Pacific Northwest
      { x: 40, y: 220, icon: '🌲', scale: 0.8 },
      { x: 70, y: 250, icon: '🌲', scale: 0.7 },
      { x: 35, y: 320, icon: '🌲', scale: 0.9 },
      
      // Rocky Mountains
      { x: 150, y: 380, icon: '⛰️', scale: 1.0 },
      { x: 200, y: 400, icon: '🏔️', scale: 1.1 },
      { x: 170, y: 420, icon: '⛰️', scale: 0.8 },
      
      // Desert Southwest
      { x: 90, y: 520, icon: '🌵', scale: 0.9 },
      { x: 140, y: 580, icon: '🌵', scale: 0.7 },
      { x: 70, y: 560, icon: '☀️', scale: 0.8 },
      
      // Texas
      { x: 200, y: 620, icon: '⛽', scale: 0.7 },
      { x: 250, y: 590, icon: '🤠', scale: 0.8 },
      
      // Great Lakes
      { x: 300, y: 290, icon: '🌊', scale: 0.7 },
      { x: 340, y: 310, icon: '🌊', scale: 0.8 },
      
      // East Coast cities
      { x: 380, y: 350, icon: '🏙️', scale: 0.8 },
      { x: 370, y: 410, icon: '🗽', scale: 0.9 },
      
      // South
      { x: 290, y: 580, icon: '🎷', scale: 0.8 },
      { x: 340, y: 540, icon: '🍑', scale: 0.7 },
      
      // California coast
      { x: 30, y: 440, icon: '🎬', scale: 0.8 },
      { x: 25, y: 500, icon: '🌴', scale: 0.9 },
      
      // Golden Gate for Super Bowl
      { x: 60, y: 450, icon: '🌉', scale: 1.0 },
      
      // Trophy at center (goal)
      { x: 200, y: 750, icon: '🏆', scale: 1.2 },
    ]
    
    landmarks.forEach(lm => {
      const text = this.add.text(lm.x, lm.y + 100, lm.icon, {
        fontSize: `${Math.floor(16 * lm.scale)}px`,
      })
      text.setOrigin(0.5)
      text.setAlpha(0.4)
      this.mapContainer.add(text)
      
      // Subtle float animation for some landmarks
      if (Math.random() > 0.5) {
        this.tweens.add({
          targets: text,
          y: text.y - 3,
          duration: 2000 + Math.random() * 1000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        })
      }
    })
  }

  private createRoutePath(): void {
    const { campaign } = useGameStore.getState()
    this.routePath = this.add.graphics()
    
    // Calculate city positions on map
    const positions = this.getCityPositions()
    
    // Draw inactive route (grey, dashed)
    this.routePath.lineStyle(3, COLORS.grey, 0.3)
    
    for (let i = 0; i < positions.length - 1; i++) {
      const start = positions[i]
      const end = positions[i + 1]
      
      // Curved path between cities
      this.drawCurvedPath(this.routePath, start.x, start.y, end.x, end.y, COLORS.grey, 0.3)
    }
    
    // Draw completed route (green, solid)
    const completedStages = campaign.stagesUnlocked.length - 1
    
    if (completedStages > 0) {
      for (let i = 0; i < Math.min(completedStages, positions.length - 1); i++) {
        const start = positions[i]
        const end = positions[i + 1]
        this.drawCurvedPath(this.routePath, start.x, start.y, end.x, end.y, COLORS.green, 0.8)
      }
    }
    
    this.mapContainer.add(this.routePath)
  }

  private drawCurvedPath(
    graphics: Phaser.GameObjects.Graphics,
    x1: number, y1: number,
    x2: number, y2: number,
    color: number,
    alpha: number
  ): void {
    graphics.lineStyle(3, color, alpha)
    
    // Calculate control points for smooth curve
    const midX = (x1 + x2) / 2
    const midY = (y1 + y2) / 2
    const offsetX = (y2 - y1) * 0.2 // Curve offset based on direction
    
    graphics.beginPath()
    graphics.moveTo(x1, y1)
    
    // Use quadratic bezier for smooth curve
    const curve = new Phaser.Curves.QuadraticBezier(
      new Phaser.Math.Vector2(x1, y1),
      new Phaser.Math.Vector2(midX + offsetX, midY),
      new Phaser.Math.Vector2(x2, y2)
    )
    
    const points = curve.getPoints(20)
    for (const point of points) {
      graphics.lineTo(point.x, point.y)
    }
    graphics.strokePath()
  }

  private getCityPositions(): { x: number; y: number; stage: CampaignStage }[] {
    // Position cities on the map based on ACTUAL 2025 Seahawks schedule
    // Cities positioned roughly on US map coordinates
    // Y increases as we go down the map (scrollable)
    const positions: { x: number; y: number; stage: CampaignStage }[] = []
    
    // Map dimensions for reference: GAME_WIDTH (400) x MAP_HEIGHT (scrollable ~2200)
    const stagePositions: Record<number, { x: number; y: number }> = {
      // Regular Season - chronological order (20 stages total)
      1: { x: 60, y: 180 },    // Week 1: Seattle vs 49ers (Home) - Season Opener
      2: { x: 340, y: 250 },   // Week 2: @ Pittsburgh
      3: { x: 65, y: 280 },    // Week 3: Seattle vs Saints (Home)
      4: { x: 130, y: 420 },   // Week 4: @ Arizona
      5: { x: 70, y: 340 },    // Week 5: Seattle vs Bucs (Home)
      6: { x: 340, y: 500 },   // Week 6: @ Jacksonville
      7: { x: 75, y: 400 },    // Week 7: Seattle vs Texans (Home)
      8: { x: 355, y: 340 },   // Week 8: @ Washington DC
      9: { x: 80, y: 460 },    // Week 9: Seattle vs Cardinals (Home)
      10: { x: 50, y: 520 },   // Week 10: @ LA Rams
      11: { x: 280, y: 450 },  // Week 11: @ Nashville
      12: { x: 85, y: 580 },   // Week 12: Seattle vs Vikings (Home)
      13: { x: 320, y: 510 },  // Week 13: @ Atlanta
      14: { x: 90, y: 640 },   // Week 14: Seattle vs Colts (Home)
      15: { x: 95, y: 700 },   // Week 15: Seattle vs Rams (Home)
      16: { x: 340, y: 440 },  // Week 16: @ Charlotte
      17: { x: 45, y: 480 },   // Week 17: @ San Francisco
      
      // Playoffs
      18: { x: 100, y: 770 },  // Divisional: Seattle vs 49ers (Home)
      19: { x: 105, y: 840 },  // NFC Championship: Seattle vs Rams (Home)
      
      // Super Bowl
      20: { x: 45, y: 920 },   // Super Bowl: San Francisco (Levi's Stadium)
    }
    
    CAMPAIGN_STAGES.forEach(stage => {
      const pos = stagePositions[stage.id]
      if (pos) {
        positions.push({ x: pos.x, y: pos.y + 100, stage })
      }
    })
    
    return positions
  }

  private createCityNodes(): void {
    const { campaign } = useGameStore.getState()
    const positions = this.getCityPositions()
    
    positions.forEach(({ x, y, stage }) => {
      const isUnlocked = campaign.stagesUnlocked.includes(stage.id)
      const isCurrent = stage.id === campaign.currentStageId
      const isCompleted = campaign.stagesUnlocked.includes(stage.id) && 
                         stage.id < campaign.currentStageId
      
      const node = this.createCityNode(x, y, stage, isUnlocked, isCurrent, isCompleted)
      this.cityNodes.set(stage.id, node)
      this.mapContainer.add(node)
    })
  }

  private createCityNode(
    x: number, 
    y: number, 
    stage: CampaignStage,
    isUnlocked: boolean,
    isCurrent: boolean,
    isCompleted: boolean
  ): Phaser.GameObjects.Container {
    const { campaign } = useGameStore.getState()
    const container = this.add.container(x, y)
    
    // Node size based on importance
    const baseSize = stage.isSuperBowl ? 28 : stage.isPlayoff ? 24 : 18
    
    // Outer glow (for current/important nodes)
    if (isCurrent || stage.isSuperBowl) {
      const glow = this.add.graphics()
      glow.fillStyle(stage.isSuperBowl ? COLORS.gold : COLORS.green, 0.3)
      glow.fillCircle(0, 0, baseSize + 10)
      container.add(glow)
      
      // Pulsing animation for current
      if (isCurrent) {
        this.tweens.add({
          targets: glow,
          alpha: 0.6,
          scaleX: 1.3,
          scaleY: 1.3,
          duration: 1000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        })
      }
    }
    
    // Main node circle
    const circle = this.add.graphics()
    let nodeColor = COLORS.grey
    
    if (isCompleted) {
      nodeColor = COLORS.green
    } else if (isCurrent) {
      nodeColor = COLORS.green
    } else if (stage.isSuperBowl) {
      nodeColor = COLORS.gold
    } else if (!isUnlocked) {
      nodeColor = COLORS.navyLight
    }
    
    circle.fillStyle(nodeColor, isUnlocked ? 1 : 0.4)
    circle.fillCircle(0, 0, baseSize)
    
    if (isUnlocked) {
      circle.lineStyle(2, 0xffffff, 0.5)
      circle.strokeCircle(0, 0, baseSize)
    }
    
    container.add(circle)
    
    // Completed checkmark or stage number
    if (isCompleted) {
      const check = this.add.text(0, 0, '✓', {
        fontSize: `${baseSize}px`,
        color: '#ffffff',
      })
      check.setOrigin(0.5)
      container.add(check)
    } else if (isUnlocked || stage.isSuperBowl) {
      const num = this.add.text(0, 0, stage.isSuperBowl ? '🏆' : `${stage.id}`, {
        fontSize: stage.isSuperBowl ? '20px' : '14px',
        color: '#ffffff',
        fontFamily: FONTS.display,
      })
      num.setOrigin(0.5)
      container.add(num)
    } else {
      // Locked icon
      const lock = this.add.text(0, 0, '🔒', {
        fontSize: '12px',
      })
      lock.setOrigin(0.5)
      lock.setAlpha(0.5)
      container.add(lock)
    }
    
    // City label
    const label = this.add.text(0, baseSize + 12, stage.location.city, {
      fontSize: stage.isSuperBowl ? '12px' : '10px',
      color: hexToCSS(isCurrent ? COLORS.green : COLORS.grey),
      fontFamily: FONTS.body,
    })
    label.setOrigin(0.5, 0)
    container.add(label)
    
    // High score display for completed stages
    const highScore = campaign.stageHighScores[stage.id]
    if (highScore && isCompleted) {
      const scoreText = this.add.text(0, baseSize + 26, `${highScore.toLocaleString()}`, {
        fontSize: '8px',
        color: hexToCSS(COLORS.gold),
        fontFamily: FONTS.display,
      })
      scoreText.setOrigin(0.5, 0)
      container.add(scoreText)
      
      // Small trophy icon for high scores
      const trophy = this.add.text(-scoreText.width / 2 - 8, baseSize + 26, '🏆', {
        fontSize: '7px',
      })
      trophy.setOrigin(0.5, 0)
      container.add(trophy)
    }
    
    // Make ALL nodes interactive - show preview modal on tap
    container.setSize(baseSize * 2.5, baseSize * 2.5)
    container.setInteractive({ useHandCursor: true })
    
    container.on('pointerdown', () => {
      if (this.previewModal) return // Don't open if modal already open
      AudioManager.playClick()
      this.showStagePreviewModal(stage, isUnlocked, isCurrent, isCompleted)
    })
    
    container.on('pointerover', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1.15,
        scaleY: 1.15,
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
    })
    
    return container
  }
  
  private showStagePreviewModal(
    stage: CampaignStage, 
    isUnlocked: boolean, 
    isCurrent: boolean,
    isCompleted: boolean
  ): void {
    const { campaign } = useGameStore.getState()
    
    // Create dark overlay
    this.modalOverlay = this.add.graphics()
    this.modalOverlay.fillStyle(0x000000, 0.7)
    this.modalOverlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    this.modalOverlay.setDepth(200)
    this.modalOverlay.setInteractive()
    
    // Close modal on overlay tap
    this.modalOverlay.on('pointerdown', () => {
      this.closePreviewModal()
    })
    
    // Modal container
    const modalHeight = 320
    this.previewModal = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT + modalHeight / 2)
    this.previewModal.setDepth(201)
    
    // Modal background
    const bg = this.add.graphics()
    bg.fillStyle(COLORS.navy, 0.98)
    bg.fillRoundedRect(-180, -modalHeight / 2, 360, modalHeight, { tl: 20, tr: 20, bl: 0, br: 0 })
    bg.lineStyle(2, COLORS.green, 0.6)
    bg.strokeRoundedRect(-180, -modalHeight / 2, 360, modalHeight, { tl: 20, tr: 20, bl: 0, br: 0 })
    this.previewModal.add(bg)
    
    // Handle / drag indicator
    const handle = this.add.graphics()
    handle.fillStyle(COLORS.grey, 0.5)
    handle.fillRoundedRect(-25, -modalHeight / 2 + 10, 50, 4, 2)
    this.previewModal.add(handle)
    
    // Stage name
    const stageName = this.add.text(0, -modalHeight / 2 + 35, stage.name.toUpperCase(), {
      fontSize: '24px',
      color: hexToCSS(stage.isSuperBowl ? COLORS.gold : COLORS.green),
      fontFamily: FONTS.display,
    })
    stageName.setOrigin(0.5)
    this.previewModal.add(stageName)
    
    // Location
    const location = this.add.text(0, -modalHeight / 2 + 62, `${stage.location.city}, ${stage.location.state}`, {
      fontSize: '12px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
    })
    location.setOrigin(0.5)
    this.previewModal.add(location)
    
    // Difficulty bar
    const diffY = -modalHeight / 2 + 95
    const diffLabel = this.add.text(-140, diffY, 'DIFFICULTY', {
      fontSize: '10px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
      letterSpacing: 1,
    })
    this.previewModal.add(diffLabel)
    
    // Difficulty dots
    for (let i = 1; i <= 10; i++) {
      const dot = this.add.graphics()
      const isFilled = i <= stage.difficulty
      dot.fillStyle(isFilled ? (i <= 3 ? COLORS.green : i <= 6 ? COLORS.gold : COLORS.dlRed) : COLORS.navyLight, isFilled ? 1 : 0.5)
      dot.fillCircle(-140 + 90 + i * 18, diffY + 5, 6)
      this.previewModal.add(dot)
    }
    
    // Weather info
    const weatherY = -modalHeight / 2 + 125
    const weatherIcons: Record<string, string> = {
      clear: '☀️', rain: '🌧️', snow: '❄️', fog: '🌫️', wind: '💨', heat: '🔥', night: '🌙'
    }
    const weatherIcon = weatherIcons[stage.visuals.weather.type] || '☀️'
    const weatherText = this.add.text(-140, weatherY, `WEATHER: ${weatherIcon} ${stage.visuals.weather.type.toUpperCase()}`, {
      fontSize: '11px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
    })
    this.previewModal.add(weatherText)
    
    // Opponent info
    const opponentY = -modalHeight / 2 + 150
    const opponentText = this.add.text(-140, opponentY, `VS: ${stage.visuals.opponent.name}`, {
      fontSize: '12px',
      color: hexToCSS(COLORS.white),
      fontFamily: FONTS.display,
    })
    this.previewModal.add(opponentText)
    
    // Opponent color preview
    const colorPreview = this.add.graphics()
    colorPreview.fillStyle(stage.visuals.opponent.primary, 1)
    colorPreview.fillCircle(130, opponentY + 6, 8)
    colorPreview.fillStyle(stage.visuals.opponent.accent, 1)
    colorPreview.fillCircle(150, opponentY + 6, 8)
    this.previewModal.add(colorPreview)
    
    // High score (if exists)
    const highScore = campaign.stageHighScores[stage.id]
    if (highScore) {
      const scoreY = -modalHeight / 2 + 180
      const scoreLabel = this.add.text(-140, scoreY, 'YOUR BEST:', {
        fontSize: '10px',
        color: hexToCSS(COLORS.grey),
        fontFamily: FONTS.body,
      })
      this.previewModal.add(scoreLabel)
      
      const scoreValue = this.add.text(-50, scoreY, `🏆 ${highScore.toLocaleString()}`, {
        fontSize: '14px',
        color: hexToCSS(COLORS.gold),
        fontFamily: FONTS.display,
      })
      this.previewModal.add(scoreValue)
    }
    
    // Action button
    const buttonY = modalHeight / 2 - 60
    const buttonBg = this.add.graphics()
    const buttonWidth = 200
    const buttonHeight = 50
    
    if (isUnlocked) {
      // Play/Replay button
      buttonBg.fillStyle(COLORS.green, 1)
      buttonBg.fillRoundedRect(-buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, 12)
      
      const buttonLabel = isCurrent ? '🏈  PLAY NOW' : '🔄  REPLAY'
      const buttonText = this.add.text(0, buttonY, buttonLabel, {
        fontSize: '18px',
        color: hexToCSS(COLORS.navy),
        fontFamily: FONTS.display,
      })
      buttonText.setOrigin(0.5)
      this.previewModal.add(buttonBg)
      this.previewModal.add(buttonText)
      
      // Make button interactive
      const buttonZone = this.add.zone(0, buttonY, buttonWidth, buttonHeight)
      buttonZone.setInteractive({ useHandCursor: true })
      buttonZone.on('pointerdown', () => {
        AudioManager.playClick()
        this.closePreviewModal()
        
        if (isCurrent) {
          this.startStage(stage)
        } else if (isCompleted) {
          // Replay mode
          this.replayStage(stage)
        }
      })
      this.previewModal.add(buttonZone)
    } else {
      // Locked indicator
      buttonBg.fillStyle(COLORS.navyLight, 0.8)
      buttonBg.fillRoundedRect(-buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, 12)
      
      const lockText = this.add.text(0, buttonY, '🔒  LOCKED', {
        fontSize: '18px',
        color: hexToCSS(COLORS.grey),
        fontFamily: FONTS.display,
      })
      lockText.setOrigin(0.5)
      this.previewModal.add(buttonBg)
      this.previewModal.add(lockText)
      
      // Show unlock hint
      const hintText = this.add.text(0, buttonY + 35, `Complete Stage ${stage.id - 1} to unlock`, {
        fontSize: '10px',
        color: hexToCSS(COLORS.grey),
        fontFamily: FONTS.body,
      })
      hintText.setOrigin(0.5)
      this.previewModal.add(hintText)
    }
    
    // Slide up animation
    this.tweens.add({
      targets: this.previewModal,
      y: GAME_HEIGHT - modalHeight / 2,
      duration: 300,
      ease: 'Back.easeOut'
    })
  }
  
  private closePreviewModal(): void {
    if (!this.previewModal) return
    
    // Slide down animation
    this.tweens.add({
      targets: this.previewModal,
      y: GAME_HEIGHT + 200,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        if (this.previewModal) {
          this.previewModal.destroy()
          this.previewModal = null
        }
        if (this.modalOverlay) {
          this.modalOverlay.destroy()
          this.modalOverlay = null
        }
      }
    })
  }
  
  private replayStage(stage: CampaignStage): void {
    // Set replay mode in store
    const store = useGameStore.getState()
    store.setGameMode('campaign')
    
    // Store the stage we're replaying for GameScene to use
    this.registry.set('replayStageId', stage.id)
    
    this.cameras.main.fadeOut(400)
    this.time.delayedCall(400, () => {
      this.scene.start('StageTransitionScene', { stage, isReplay: true })
    })
  }

  private createCurrentMarker(): void {
    const { campaign } = useGameStore.getState()
    const positions = this.getCityPositions()
    const currentPos = positions.find(p => p.stage.id === campaign.currentStageId)
    
    if (!currentPos) return
    
    // Animated marker showing current position
    this.currentMarker = this.add.container(currentPos.x, currentPos.y - 40)
    
    // Arrow pointing down
    const arrow = this.add.graphics()
    arrow.fillStyle(COLORS.green, 1)
    arrow.fillTriangle(0, 15, -10, 0, 10, 0)
    this.currentMarker.add(arrow)
    
    // "YOU ARE HERE" text
    const text = this.add.text(0, -10, 'YOU ARE HERE', {
      fontSize: '9px',
      color: hexToCSS(COLORS.green),
      fontFamily: FONTS.body,
    })
    text.setOrigin(0.5, 1)
    this.currentMarker.add(text)
    
    // Bouncing animation
    this.tweens.add({
      targets: this.currentMarker,
      y: currentPos.y - 35,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
    
    this.mapContainer.add(this.currentMarker)
  }

  private createUIOverlay(): void {
    const { campaign } = useGameStore.getState()
    const currentStage = getStageByGame(campaign.currentGame)
    const progress = getCampaignProgress(campaign.gamesWon)
    
    // Top bar (fixed)
    const topBar = this.add.graphics()
    topBar.fillStyle(COLORS.navy, 0.95)
    topBar.fillRect(0, 0, GAME_WIDTH, 80)
    topBar.lineStyle(1, COLORS.green, 0.3)
    topBar.lineBetween(0, 80, GAME_WIDTH, 80)
    
    // Back button
    const backBtn = this.createButton(50, 40, '← BACK', () => {
      this.cameras.main.fadeOut(300)
      this.time.delayedCall(300, () => {
        this.scene.start('MenuScene')
      })
    })
    
    // Journey progress bar (top center)
    this.createJourneyProgressBar(campaign.gamesWon)
    
    // Progress text
    const progressText = this.add.text(GAME_WIDTH - 20, 20, 
      `GAME ${campaign.currentGame}/${TOTAL_GAMES}`, {
      fontSize: '11px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
    })
    progressText.setOrigin(1, 0)
    
    const stageText = this.add.text(GAME_WIDTH - 20, 38,
      `${currentStage.location.city.toUpperCase()}`, {
      fontSize: '13px',
      color: hexToCSS(COLORS.green),
      fontFamily: FONTS.display,
    })
    stageText.setOrigin(1, 0)
    
    // Progress percentage
    const pctText = this.add.text(GAME_WIDTH - 20, 55,
      `${progress}% COMPLETE`, {
      fontSize: '10px',
      color: hexToCSS(progress >= 100 ? COLORS.gold : COLORS.grey),
      fontFamily: FONTS.body,
    })
    pctText.setOrigin(1, 0)
    
    // Create the bottom panel
    this.createBottomPanel()
  }
  
  private createJourneyProgressBar(gamesWon: number): void {
    const barWidth = 140
    const barHeight = 8
    const barX = (GAME_WIDTH - barWidth) / 2
    const barY = 36
    
    // Background
    const barBg = this.add.graphics()
    barBg.fillStyle(COLORS.navyLight, 0.8)
    barBg.fillRoundedRect(barX, barY, barWidth, barHeight, 4)
    
    // Fill based on progress
    const progress = gamesWon / TOTAL_GAMES
    const fillWidth = Math.max(0, (barWidth - 4) * progress)
    
    if (fillWidth > 0) {
      const barFill = this.add.graphics()
      barFill.fillStyle(progress >= 1 ? COLORS.gold : COLORS.green, 1)
      barFill.fillRoundedRect(barX + 2, barY + 2, fillWidth, barHeight - 4, 2)
    }
    
    // Stage markers on the bar
    for (let i = 1; i <= TOTAL_STAGES; i++) {
      const stageProgress = (i * GAMES_PER_STAGE) / TOTAL_GAMES
      const markerX = barX + stageProgress * barWidth
      
      const marker = this.add.graphics()
      marker.fillStyle(i * GAMES_PER_STAGE <= gamesWon ? COLORS.green : COLORS.grey, 
                      i * GAMES_PER_STAGE <= gamesWon ? 1 : 0.3)
      marker.fillCircle(markerX, barY + barHeight / 2, 2)
    }
    
    // Label
    const label = this.add.text(GAME_WIDTH / 2, barY - 12, 'ROAD TO THE SUPER BOWL', {
      fontSize: '9px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
      letterSpacing: 1,
    })
    label.setOrigin(0.5)
  }
  
  private createBottomPanel(): void {
    const { campaign } = useGameStore.getState()
    const currentStage = getStageByGame(campaign.currentGame)
    
    // Bottom panel with current stage info (fixed)
    const bottomPanel = this.add.graphics()
    bottomPanel.fillStyle(COLORS.navy, 0.95)
    bottomPanel.fillRoundedRect(15, GAME_HEIGHT - 160, GAME_WIDTH - 30, 140, 16)
    bottomPanel.lineStyle(2, COLORS.green, 0.5)
    bottomPanel.strokeRoundedRect(15, GAME_HEIGHT - 160, GAME_WIDTH - 30, 140, 16)
    
    // Stage name
    const stageName = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 140, 
      currentStage.name.toUpperCase(), {
      fontSize: '22px',
      color: hexToCSS(COLORS.white),
      fontFamily: FONTS.display,
    })
    stageName.setOrigin(0.5)
    
    // Stage description
    const stageDesc = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 115,
      currentStage.description, {
      fontSize: '12px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
      wordWrap: { width: GAME_WIDTH - 80 },
      align: 'center',
    })
    stageDesc.setOrigin(0.5, 0)
    
    // Game progress within stage
    const gameInStage = getGameInStage(campaign.currentGame)
    const progressDots = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT - 75)
    
    for (let i = 1; i <= GAMES_PER_STAGE; i++) {
      const dotX = (i - 2) * 30 // Center the 3 dots
      const isComplete = i < gameInStage
      const isCurrent = i === gameInStage
      
      const dot = this.add.graphics()
      dot.fillStyle(isComplete ? COLORS.green : (isCurrent ? COLORS.green : COLORS.grey), 
                   isComplete || isCurrent ? 1 : 0.3)
      dot.fillCircle(dotX, 0, isCurrent ? 10 : 8)
      
      if (isCurrent) {
        dot.lineStyle(2, 0xffffff, 0.5)
        dot.strokeCircle(dotX, 0, 10)
      }
      
      progressDots.add(dot)
      
      // Game number
      const num = this.add.text(dotX, 0, `${i}`, {
        fontSize: '10px',
        color: '#ffffff',
        fontFamily: FONTS.display,
      })
      num.setOrigin(0.5)
      progressDots.add(num)
    }
    
    // Play button
    this.createPlayButton(GAME_WIDTH / 2, GAME_HEIGHT - 35)
  }

  private createButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y)
    
    const bg = this.add.graphics()
    bg.fillStyle(COLORS.navyLight, 0.8)
    bg.fillRoundedRect(-40, -18, 80, 36, 8)
    
    const label = this.add.text(0, 0, text, {
      fontSize: '12px',
      color: hexToCSS(COLORS.white),
      fontFamily: FONTS.body,
    })
    label.setOrigin(0.5)
    
    container.add([bg, label])
    container.setSize(80, 36)
    container.setInteractive({ useHandCursor: true })
    
    container.on('pointerdown', callback)
    
    return container
  }

  private createPlayButton(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y)
    
    const bg = this.add.graphics()
    bg.fillStyle(COLORS.green, 1)
    bg.fillRoundedRect(-80, -22, 160, 44, 12)
    
    const shine = this.add.graphics()
    shine.fillStyle(0xffffff, 0.2)
    shine.fillRoundedRect(-78, -20, 156, 18, { tl: 10, tr: 10, bl: 0, br: 0 })
    
    const label = this.add.text(0, 0, '🏈  PLAY GAME', {
      fontSize: '18px',
      color: hexToCSS(COLORS.navy),
      fontFamily: FONTS.display,
    })
    label.setOrigin(0.5)
    
    container.add([bg, shine, label])
    container.setSize(160, 44)
    container.setInteractive({ useHandCursor: true })
    
    container.on('pointerover', () => {
      this.tweens.add({ targets: container, scaleX: 1.05, scaleY: 1.05, duration: 100 })
    })
    
    container.on('pointerout', () => {
      this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100 })
    })
    
    container.on('pointerdown', () => {
      container.setScale(0.95)
    })
    
    container.on('pointerup', () => {
      AudioManager.playClick()
      const { campaign } = useGameStore.getState()
      const currentStage = getStageByGame(campaign.currentGame)
      this.startStage(currentStage)
    })
    
    return container
  }

  private setupScrollInput(): void {
    // Drag scrolling
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Ignore if clicking on UI elements (top 80px or bottom 160px)
      if (pointer.y < 80 || pointer.y > GAME_HEIGHT - 160) return
      
      this.isDragging = true
      this.dragStartY = pointer.y
      this.lastDragY = this.scrollY
    })
    
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.isDragging) return
      
      const deltaY = this.dragStartY - pointer.y
      this.targetScrollY = this.lastDragY + deltaY
      this.clampScroll()
    })
    
    this.input.on('pointerup', () => {
      this.isDragging = false
    })
    
    // Mouse wheel scrolling
    this.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: any, deltaX: number, deltaY: number) => {
      this.targetScrollY += deltaY * 0.5
      this.clampScroll()
    })
  }

  private clampScroll(): void {
    const maxScroll = this.MAP_HEIGHT - GAME_HEIGHT + 200
    this.targetScrollY = Phaser.Math.Clamp(this.targetScrollY, -100, maxScroll)
  }

  private scrollToCurrentStage(stageId: number): void {
    const positions = this.getCityPositions()
    const currentPos = positions.find(p => p.stage.id === stageId)
    
    if (currentPos) {
      // Center the current stage in view
      this.targetScrollY = currentPos.y - GAME_HEIGHT / 2 + 100
      this.clampScroll()
      this.scrollY = this.targetScrollY // Instant scroll on load
    }
  }

  private startStage(stage: CampaignStage): void {
    // Store current stage for GameScene to use
    useGameStore.getState().startCampaignGame()
    
    this.cameras.main.fadeOut(400)
    this.time.delayedCall(400, () => {
      // Go to stage transition scene
      this.scene.start('StageTransitionScene', { stage })
    })
  }

  update(): void {
    // Smooth scrolling
    if (Math.abs(this.scrollY - this.targetScrollY) > 0.5) {
      this.scrollY += (this.targetScrollY - this.scrollY) * 0.15
      this.mapContainer.y = -this.scrollY
    }
  }
}
