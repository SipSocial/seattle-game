import * as Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONTS, hexToCSS } from '../config/phaserConfig'
import { AudioManager } from '../systems/AudioManager'
import { CampaignStage, getGameInStage, GAMES_PER_STAGE } from '../data/campaign'
import { useGameStore } from '../../store/gameStore'

/**
 * StageTransitionScene - "Entering [City]" Cinematic
 * 
 * Inspired by classic arcade racing game transitions where you
 * visually move from one region to the next. Shows:
 * - Stage name and location
 * - Visual preview of the environment
 * - Difficulty indicator
 * - Brief atmospheric buildup
 */
export class StageTransitionScene extends Phaser.Scene {
  private stage!: CampaignStage
  
  constructor() {
    super({ key: 'StageTransitionScene' })
  }

  init(data: { stage: CampaignStage }): void {
    this.stage = data.stage
  }

  create(): void {
    const { campaign } = useGameStore.getState()
    const gameInStage = getGameInStage(campaign.currentGame)
    
    this.cameras.main.fadeIn(400)
    
    // Create dynamic background based on stage visuals
    this.createStageBackground()
    
    // Create atmospheric particles
    this.createAtmosphereParticles()
    
    // Create transition content
    this.createTransitionContent(gameInStage)
    
    // Auto-advance after delay
    this.time.delayedCall(3500, () => {
      this.proceedToGame()
    })
    
    // Allow tap to skip
    this.input.once('pointerdown', () => {
      this.proceedToGame()
    })
  }

  private createStageBackground(): void {
    const graphics = this.add.graphics()
    
    // Parse sky gradient colors
    const topColor = Phaser.Display.Color.HexStringToColor(this.stage.visuals.skyGradient[0])
    const bottomColor = Phaser.Display.Color.HexStringToColor(this.stage.visuals.skyGradient[1])
    
    // Draw gradient background
    for (let y = 0; y < GAME_HEIGHT; y++) {
      const progress = y / GAME_HEIGHT
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        topColor, bottomColor, GAME_HEIGHT, y
      )
      graphics.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b), 1)
      graphics.fillRect(0, y, GAME_WIDTH, 1)
    }
    
    // Add horizon line
    const horizonY = GAME_HEIGHT * 0.55
    const horizon = this.add.graphics()
    horizon.lineStyle(2, 0xffffff, 0.1)
    horizon.lineBetween(0, horizonY, GAME_WIDTH, horizonY)
    
    // Add simplified landmark silhouettes based on stage
    this.createLandmarkSilhouettes()
    
    // Add atmospheric glow at top (stadium lights feel)
    const lightsGlow = this.add.graphics()
    lightsGlow.fillStyle(0xffffff, 0.05)
    lightsGlow.fillEllipse(GAME_WIDTH / 2, -50, GAME_WIDTH * 1.5, 200)
    
    // Animate glow
    this.tweens.add({
      targets: lightsGlow,
      alpha: 0.1,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }

  private createLandmarkSilhouettes(): void {
    const silhouettes = this.add.graphics()
    const horizonY = GAME_HEIGHT * 0.55
    
    // Different silhouettes based on stage location
    switch (this.stage.id) {
      case 1: // Seattle
        this.drawSeattleSilhouette(silhouettes, horizonY)
        break
      case 3: // Denver
        this.drawMountainSilhouette(silhouettes, horizonY)
        break
      case 4: // Las Vegas
        this.drawVegasSilhouette(silhouettes, horizonY)
        break
      case 7: // Chicago
        this.drawChicagoSilhouette(silhouettes, horizonY)
        break
      case 10: // New York
        this.drawNYCSilhouette(silhouettes, horizonY)
        break
      case 17: // San Francisco - Super Bowl
        this.drawSFSilhouette(silhouettes, horizonY)
        break
      default:
        this.drawGenericCitySilhouette(silhouettes, horizonY)
    }
  }

  private drawSeattleSilhouette(g: Phaser.GameObjects.Graphics, y: number): void {
    g.fillStyle(0x000000, 0.3)
    
    // Space Needle
    g.fillRect(GAME_WIDTH / 2 - 5, y - 120, 10, 100)
    g.fillTriangle(GAME_WIDTH / 2 - 30, y - 100, GAME_WIDTH / 2 + 30, y - 100, GAME_WIDTH / 2, y - 130)
    g.fillRect(GAME_WIDTH / 2 - 25, y - 105, 50, 15)
    
    // Mountains in background
    g.fillTriangle(50, y, 150, y - 80, 250, y)
    g.fillTriangle(180, y, 320, y - 100, 400, y)
    
    // Trees
    for (let x = 20; x < GAME_WIDTH; x += 40) {
      g.fillTriangle(x - 10, y, x + 10, y, x, y - 30 - Math.random() * 20)
    }
  }

  private drawMountainSilhouette(g: Phaser.GameObjects.Graphics, y: number): void {
    g.fillStyle(0x000000, 0.4)
    
    // Rocky Mountains
    g.fillTriangle(-50, y, 100, y - 150, 200, y)
    g.fillTriangle(80, y, 200, y - 180, 350, y)
    g.fillTriangle(250, y, 380, y - 140, 450, y)
    
    // Snow caps
    g.fillStyle(0xffffff, 0.3)
    g.fillTriangle(90, y - 140, 100, y - 150, 110, y - 140)
    g.fillTriangle(185, y - 165, 200, y - 180, 215, y - 165)
  }

  private drawVegasSilhouette(g: Phaser.GameObjects.Graphics, y: number): void {
    g.fillStyle(0x000000, 0.3)
    
    // Casino buildings
    g.fillRect(50, y - 80, 40, 80)
    g.fillRect(120, y - 120, 50, 120)
    g.fillRect(200, y - 100, 45, 100)
    g.fillRect(280, y - 140, 60, 140)
    g.fillRect(350, y - 90, 35, 90)
    
    // Add neon light accents
    const neon = this.add.graphics()
    neon.lineStyle(2, COLORS.gold, 0.6)
    neon.strokeRect(122, y - 118, 46, 116)
    neon.strokeRect(282, y - 138, 56, 136)
    
    this.tweens.add({
      targets: neon,
      alpha: 0.2,
      duration: 500,
      yoyo: true,
      repeat: -1
    })
  }

  private drawChicagoSilhouette(g: Phaser.GameObjects.Graphics, y: number): void {
    g.fillStyle(0x000000, 0.35)
    
    // Chicago skyline
    g.fillRect(40, y - 100, 35, 100)
    g.fillRect(90, y - 160, 50, 160)
    g.fillRect(155, y - 130, 40, 130)
    g.fillRect(210, y - 180, 60, 180) // Willis Tower
    g.fillRect(285, y - 150, 45, 150)
    g.fillRect(340, y - 90, 40, 90)
  }

  private drawNYCSilhouette(g: Phaser.GameObjects.Graphics, y: number): void {
    g.fillStyle(0x000000, 0.35)
    
    // NYC skyline with Empire State
    g.fillRect(30, y - 80, 30, 80)
    g.fillRect(75, y - 120, 40, 120)
    g.fillRect(130, y - 100, 35, 100)
    g.fillRect(180, y - 200, 50, 200) // Empire State
    g.fillTriangle(180, y - 200, 205, y - 230, 230, y - 200) // Spire
    g.fillRect(250, y - 150, 45, 150)
    g.fillRect(310, y - 130, 40, 130)
    g.fillRect(360, y - 90, 30, 90)
  }

  private drawSFSilhouette(g: Phaser.GameObjects.Graphics, y: number): void {
    g.fillStyle(0x000000, 0.25)
    
    // Golden Gate Bridge towers
    g.fillRect(80, y - 160, 15, 160)
    g.fillRect(300, y - 160, 15, 160)
    
    // Bridge cables (catenary)
    g.lineStyle(3, 0x000000, 0.3)
    g.beginPath()
    g.moveTo(87, y - 155)
    
    // Main cable curve
    const points = []
    for (let t = 0; t <= 1; t += 0.05) {
      const x = 87 + (307 - 87) * t
      const sag = 50 * Math.sin(Math.PI * t)
      points.push({ x, y: y - 155 + sag })
    }
    
    for (const p of points) {
      g.lineTo(p.x, p.y)
    }
    g.strokePath()
    
    // Vertical cables
    g.lineStyle(1, 0x000000, 0.2)
    for (let x = 100; x < 300; x += 20) {
      const t = (x - 87) / (307 - 87)
      const cableY = y - 155 + 50 * Math.sin(Math.PI * t)
      g.moveTo(x, cableY)
      g.lineTo(x, y - 30)
      g.strokePath()
    }
    
    // Bridge deck
    g.fillStyle(0x000000, 0.3)
    g.fillRect(60, y - 35, 280, 8)
    
    // Bay water
    g.fillStyle(0x003366, 0.3)
    g.fillRect(0, y, GAME_WIDTH, GAME_HEIGHT - y)
    
    // Super Bowl special: Trophy glow
    if (this.stage.isSuperBowl) {
      const trophyGlow = this.add.graphics()
      trophyGlow.fillStyle(COLORS.gold, 0.2)
      trophyGlow.fillCircle(GAME_WIDTH / 2, y + 80, 60)
      
      this.tweens.add({
        targets: trophyGlow,
        alpha: 0.4,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 1000,
        yoyo: true,
        repeat: -1
      })
    }
  }

  private drawGenericCitySilhouette(g: Phaser.GameObjects.Graphics, y: number): void {
    g.fillStyle(0x000000, 0.3)
    
    // Random buildings
    const buildings = [
      { x: 30, w: 35, h: 70 },
      { x: 80, w: 45, h: 100 },
      { x: 140, w: 40, h: 85 },
      { x: 195, w: 55, h: 130 },
      { x: 265, w: 45, h: 95 },
      { x: 325, w: 50, h: 110 },
      { x: 385, w: 35, h: 75 },
    ]
    
    buildings.forEach(b => {
      g.fillRect(b.x, y - b.h, b.w, b.h)
    })
  }

  private createAtmosphereParticles(): void {
    const weather = this.stage.visuals.weather
    
    if (!weather.particles) return
    
    const particleCount = Math.floor(weather.intensity * 50)
    
    for (let i = 0; i < particleCount; i++) {
      const particle = this.add.graphics()
      
      switch (weather.type) {
        case 'rain':
          particle.lineStyle(1, 0xaaccff, 0.5)
          particle.lineBetween(0, 0, 2, 10)
          break
        case 'snow':
          particle.fillStyle(0xffffff, 0.8)
          particle.fillCircle(0, 0, 1.5 + Math.random())
          break
        case 'fog':
          particle.fillStyle(0xffffff, 0.1)
          particle.fillCircle(0, 0, 20 + Math.random() * 30)
          break
        default:
          particle.fillStyle(0xffffff, 0.3)
          particle.fillCircle(0, 0, 1)
      }
      
      const startX = Math.random() * GAME_WIDTH
      const startY = Math.random() * GAME_HEIGHT
      particle.setPosition(startX, startY)
      
      // Animate based on weather type
      if (weather.type === 'rain') {
        this.tweens.add({
          targets: particle,
          y: GAME_HEIGHT + 20,
          x: startX + 30,
          duration: 1000 + Math.random() * 500,
          repeat: -1,
          delay: Math.random() * 1000,
          onRepeat: () => {
            particle.x = Math.random() * GAME_WIDTH
            particle.y = -20
          }
        })
      } else if (weather.type === 'snow') {
        this.tweens.add({
          targets: particle,
          y: GAME_HEIGHT + 20,
          x: startX + (Math.random() - 0.5) * 100,
          duration: 3000 + Math.random() * 2000,
          repeat: -1,
          delay: Math.random() * 2000,
          onRepeat: () => {
            particle.x = Math.random() * GAME_WIDTH
            particle.y = -20
          }
        })
      } else if (weather.type === 'fog') {
        this.tweens.add({
          targets: particle,
          x: startX + (Math.random() - 0.5) * 100,
          alpha: 0.05,
          duration: 4000 + Math.random() * 3000,
          yoyo: true,
          repeat: -1
        })
      }
    }
  }

  private createTransitionContent(gameInStage: number): void {
    const centerX = GAME_WIDTH / 2
    
    // "ENTERING" text
    const entering = this.add.text(centerX, 180, 'ENTERING', {
      fontSize: '16px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
      letterSpacing: 4,
    })
    entering.setOrigin(0.5)
    entering.setAlpha(0)
    
    // City name (big, dramatic)
    const cityName = this.add.text(centerX, 230, this.stage.location.city.toUpperCase(), {
      fontSize: this.stage.isSuperBowl ? '42px' : '36px',
      color: hexToCSS(this.stage.isSuperBowl ? COLORS.gold : COLORS.green),
      fontFamily: FONTS.display,
      stroke: '#000000',
      strokeThickness: 3,
    })
    cityName.setOrigin(0.5)
    cityName.setAlpha(0)
    cityName.setScale(0.5)
    
    // State/region
    const state = this.add.text(centerX, 275, this.stage.location.state.toUpperCase(), {
      fontSize: '14px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
    })
    state.setOrigin(0.5)
    state.setAlpha(0)
    
    // Stage name
    const stageName = this.add.text(centerX, 320, `"${this.stage.name}"`, {
      fontSize: '18px',
      color: hexToCSS(COLORS.white),
      fontFamily: FONTS.heading,
      fontStyle: 'italic',
    })
    stageName.setOrigin(0.5)
    stageName.setAlpha(0)
    
    // Game progress indicator
    const progressContainer = this.add.container(centerX, 380)
    
    const progressBg = this.add.graphics()
    progressBg.fillStyle(COLORS.navyLight, 0.8)
    progressBg.fillRoundedRect(-80, -25, 160, 50, 10)
    progressContainer.add(progressBg)
    
    const gameLabel = this.add.text(0, -10, `GAME ${gameInStage} OF ${GAMES_PER_STAGE}`, {
      fontSize: '12px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
    })
    gameLabel.setOrigin(0.5)
    progressContainer.add(gameLabel)
    
    // Progress dots
    for (let i = 1; i <= GAMES_PER_STAGE; i++) {
      const dotX = (i - 2) * 25
      const isCurrent = i === gameInStage
      
      const dot = this.add.graphics()
      dot.fillStyle(i < gameInStage ? COLORS.green : (isCurrent ? COLORS.green : COLORS.grey), 
                   isCurrent ? 1 : 0.5)
      dot.fillCircle(dotX, 10, isCurrent ? 8 : 6)
      progressContainer.add(dot)
    }
    
    progressContainer.setAlpha(0)
    
    // Difficulty indicator
    const difficultyContainer = this.add.container(centerX, 450)
    
    const diffLabel = this.add.text(-50, 0, 'DIFFICULTY:', {
      fontSize: '11px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
    })
    diffLabel.setOrigin(0, 0.5)
    difficultyContainer.add(diffLabel)
    
    // Difficulty bars
    for (let i = 1; i <= 10; i++) {
      const bar = this.add.graphics()
      const isActive = i <= this.stage.difficulty
      bar.fillStyle(isActive ? COLORS.green : COLORS.navyLight, isActive ? 1 : 0.3)
      bar.fillRect(20 + i * 12, -6, 8, 12)
      difficultyContainer.add(bar)
    }
    
    difficultyContainer.setAlpha(0)
    
    // Super Bowl special text
    if (this.stage.isSuperBowl) {
      const sbText = this.add.text(centerX, 500, '🏆 THE ULTIMATE CHALLENGE 🏆', {
        fontSize: '16px',
        color: hexToCSS(COLORS.gold),
        fontFamily: FONTS.display,
      })
      sbText.setOrigin(0.5)
      sbText.setAlpha(0)
      
      this.tweens.add({
        targets: sbText,
        alpha: 1,
        duration: 500,
        delay: 1500
      })
      
      this.tweens.add({
        targets: sbText,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 800,
        yoyo: true,
        repeat: -1,
        delay: 2000
      })
    }
    
    // Tap to continue hint
    const hint = this.add.text(centerX, GAME_HEIGHT - 60, 'TAP TO CONTINUE', {
      fontSize: '12px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
    })
    hint.setOrigin(0.5)
    hint.setAlpha(0)
    
    this.tweens.add({
      targets: hint,
      alpha: 0.7,
      duration: 400,
      delay: 2500,
      onComplete: () => {
        this.tweens.add({
          targets: hint,
          alpha: 0.3,
          duration: 600,
          yoyo: true,
          repeat: -1
        })
      }
    })
    
    // Animate content in
    this.tweens.add({
      targets: entering,
      alpha: 1,
      y: entering.y - 10,
      duration: 400,
      delay: 200
    })
    
    this.tweens.add({
      targets: cityName,
      alpha: 1,
      scale: 1,
      duration: 600,
      delay: 400,
      ease: 'Back.easeOut'
    })
    
    this.tweens.add({
      targets: state,
      alpha: 1,
      duration: 400,
      delay: 600
    })
    
    this.tweens.add({
      targets: stageName,
      alpha: 1,
      duration: 400,
      delay: 800
    })
    
    this.tweens.add({
      targets: progressContainer,
      alpha: 1,
      y: progressContainer.y - 10,
      duration: 400,
      delay: 1000
    })
    
    this.tweens.add({
      targets: difficultyContainer,
      alpha: 1,
      duration: 400,
      delay: 1200
    })
  }

  private proceedToGame(): void {
    this.cameras.main.fadeOut(400)
    this.time.delayedCall(400, () => {
      this.scene.start('RosterScene')
    })
  }
}
