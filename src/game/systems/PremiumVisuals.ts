/**
 * PREMIUM VISUALS SYSTEM
 * 
 * Manages photo-realistic visual assets for the game
 * including player sprites, stadium backgrounds, and team branding
 */

import * as Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/phaserConfig'
import { CampaignStage } from '../data/campaign'

// ============================================================================
// SEATTLE SEAHAWKS DEFENDER SPRITES
// Photo-realistic player images for gameplay
// ============================================================================

export interface DefenderSprite {
  jersey: number
  name: string
  imageUrl: string
  transparentUrl?: string
}

// Curated selection of 11 starting defenders with transparent renders
export const DEFENDER_SPRITES: DefenderSprite[] = [
  { 
    jersey: 0, 
    name: 'DeMarcus Lawrence',
    imageUrl: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/332d7473-6c1f-4bb8-b05f-3153ead9f23e/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_332d7473-6c1f-4bb8-b05f-3153ead9f23e_0.png',
  },
  { 
    jersey: 99, 
    name: 'Leonard Williams',
    imageUrl: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/140da1c5-350a-435a-9020-e0dcb37e5bd3/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_140da1c5-350a-435a-9020-e0dcb37e5bd3_0.png',
  },
  { 
    jersey: 91, 
    name: 'Byron Murphy II',
    imageUrl: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/8e36992d-ac71-49b5-b3ad-7b1b2c8c6278/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_8e36992d-ac71-49b5-b3ad-7b1b2c8c6278_0.png',
  },
  { 
    jersey: 58, 
    name: 'Derick Hall',
    imageUrl: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/9d86de1b-8b70-4cab-a879-0fea0e2e5880/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_9d86de1b-8b70-4cab-a879-0fea0e2e5880_0.png',
  },
  { 
    jersey: 7, 
    name: 'Uchenna Nwosu',
    imageUrl: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/5e219974-5422-4683-ac72-ffb5b321819c/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_5e219974-5422-4683-ac72-ffb5b321819c_0.png',
  },
  { 
    jersey: 13, 
    name: 'Ernest Jones IV',
    imageUrl: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/f982ec62-3c44-4672-adf4-b1dbeb228012/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_f982ec62-3c44-4672-adf4-b1dbeb228012_0.png',
  },
  { 
    jersey: 42, 
    name: 'Drake Thomas',
    imageUrl: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/d2833c29-06cf-43b8-a66f-d90d72a09c51/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_d2833c29-06cf-43b8-a66f-d90d72a09c51_0.png',
  },
  { 
    jersey: 21, 
    name: 'Devon Witherspoon',
    imageUrl: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/df5df5a0-9f26-463f-a540-bf0e2fd20f83/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_df5df5a0-9f26-463f-a540-bf0e2fd20f83_0.png',
  },
  { 
    jersey: 29, 
    name: 'Josh Jobe',
    imageUrl: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/89892bc5-c800-4790-95aa-e7a50a4cc1b6/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_89892bc5-c800-4790-95aa-e7a50a4cc1b6_0.png',
  },
  { 
    jersey: 20, 
    name: 'Julian Love',
    imageUrl: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/4cf6ca19-acc7-43ac-ab46-893692b85a36/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_4cf6ca19-acc7-43ac-ab46-893692b85a36_0.png',
  },
  { 
    jersey: 8, 
    name: 'Coby Bryant',
    imageUrl: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/10d006eb-a852-43cc-acc2-748cefc882bc/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_10d006eb-a852-43cc-acc2-748cefc882bc_0.png',
  },
]

// ============================================================================
// STADIUM BACKGROUNDS
// Animated video backgrounds for immersive gameplay
// ============================================================================

export interface StadiumBackground {
  type: 'video' | 'image' | 'generated'
  url: string
  fallbackColor: number
  skyGradient?: [string, string]
}

// Default Seattle Lumen Field atmosphere
export const DEFAULT_STADIUM_VIDEO = 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/4b5f0ad3-9f4e-413f-b44a-053e9af6240c/4b5f0ad3-9f4e-413f-b44a-053e9af6240c.mp4'

// Stadium backgrounds by stage
export const STADIUM_BACKGROUNDS: Record<number, StadiumBackground> = {
  // Seattle home games - Lumen Field
  1: { type: 'video', url: DEFAULT_STADIUM_VIDEO, fallbackColor: 0x002244 },
  3: { type: 'video', url: DEFAULT_STADIUM_VIDEO, fallbackColor: 0x002244 },
  5: { type: 'video', url: DEFAULT_STADIUM_VIDEO, fallbackColor: 0x002244 },
  7: { type: 'video', url: DEFAULT_STADIUM_VIDEO, fallbackColor: 0x002244 },
  9: { type: 'video', url: DEFAULT_STADIUM_VIDEO, fallbackColor: 0x002244 },
  12: { type: 'video', url: DEFAULT_STADIUM_VIDEO, fallbackColor: 0x002244 },
  14: { type: 'video', url: DEFAULT_STADIUM_VIDEO, fallbackColor: 0x002244 },
  15: { type: 'video', url: DEFAULT_STADIUM_VIDEO, fallbackColor: 0x002244 },
  18: { type: 'video', url: DEFAULT_STADIUM_VIDEO, fallbackColor: 0x002244 },
  19: { type: 'video', url: DEFAULT_STADIUM_VIDEO, fallbackColor: 0x002244 },
  
  // Away games - use generated backgrounds or fallback colors
  2: { type: 'generated', url: '', fallbackColor: 0xFFB612, skyGradient: ['#1a1a2a', '#3a3a4a'] }, // Pittsburgh
  4: { type: 'generated', url: '', fallbackColor: 0x97233F, skyGradient: ['#FF6B35', '#FFB347'] }, // Arizona
  6: { type: 'generated', url: '', fallbackColor: 0x006778, skyGradient: ['#006778', '#99D9D9'] }, // Jacksonville
  8: { type: 'generated', url: '', fallbackColor: 0x5A1414, skyGradient: ['#1a1a2a', '#3a2a3a'] }, // Washington
  10: { type: 'generated', url: '', fallbackColor: 0x003594, skyGradient: ['#2a1a3a', '#4a2a5a'] }, // LA Rams
  11: { type: 'generated', url: '', fallbackColor: 0x4B92DB, skyGradient: ['#2a3a4a', '#4a5a6a'] }, // Nashville
  13: { type: 'generated', url: '', fallbackColor: 0xA71930, skyGradient: ['#2a1a1a', '#4a2a2a'] }, // Atlanta
  16: { type: 'generated', url: '', fallbackColor: 0x0085CA, skyGradient: ['#0085CA', '#101820'] }, // Carolina
  17: { type: 'generated', url: '', fallbackColor: 0xAA0000, skyGradient: ['#001a33', '#003366'] }, // San Francisco
  20: { type: 'generated', url: '', fallbackColor: 0x002244, skyGradient: ['#0a0a1a', '#1a1a3a'] }, // Super Bowl
}

// ============================================================================
// PREMIUM VISUAL MANAGER
// ============================================================================

export class PremiumVisualsManager {
  private scene: Phaser.Scene
  private defenderSprites: Map<number, Phaser.GameObjects.Image> = new Map()
  private backgroundVideo: Phaser.GameObjects.Video | null = null
  private backgroundImage: Phaser.GameObjects.Image | null = null
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }
  
  /**
   * Preload all premium visual assets for a stage
   */
  preloadStageAssets(stageId?: number): void {
    // Load defender sprites
    DEFENDER_SPRITES.forEach(defender => {
      const key = `defender_sprite_${defender.jersey}`
      if (!this.scene.textures.exists(key)) {
        this.scene.load.image(key, defender.imageUrl)
      }
    })
    
    // Load stadium background
    if (stageId) {
      const bg = STADIUM_BACKGROUNDS[stageId]
      if (bg && bg.type === 'video' && bg.url) {
        const key = `stadium_bg_${stageId}`
        if (!this.scene.cache.video.exists(key)) {
          this.scene.load.video(key, bg.url, true)
        }
      }
    }
  }
  
  /**
   * Create premium stadium background
   */
  createStadiumBackground(stageId?: number): void {
    const bgConfig = stageId ? STADIUM_BACKGROUNDS[stageId] : null
    
    if (bgConfig?.type === 'video' && bgConfig.url) {
      try {
        const key = `stadium_bg_${stageId}`
        if (this.scene.cache.video.exists(key)) {
          this.backgroundVideo = this.scene.add.video(GAME_WIDTH / 2, GAME_HEIGHT / 2, key)
          this.backgroundVideo.setDisplaySize(GAME_WIDTH * 1.2, GAME_HEIGHT * 1.2)
          this.backgroundVideo.setLoop(true)
          this.backgroundVideo.setDepth(-100)
          this.backgroundVideo.play(true)
          
          // Add dark overlay for readability
          const overlay = this.scene.add.graphics()
          overlay.fillStyle(0x000000, 0.4)
          overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
          overlay.setDepth(-99)
        }
      } catch {
        this.createFallbackBackground(bgConfig.fallbackColor, bgConfig.skyGradient)
      }
    } else if (bgConfig) {
      this.createFallbackBackground(bgConfig.fallbackColor, bgConfig.skyGradient)
    } else {
      this.createFallbackBackground(COLORS.navy)
    }
  }
  
  /**
   * Create gradient fallback background
   */
  private createFallbackBackground(baseColor: number, skyGradient?: [string, string]): void {
    const graphics = this.scene.add.graphics()
    graphics.setDepth(-100)
    
    if (skyGradient) {
      const topColor = Phaser.Display.Color.HexStringToColor(skyGradient[0])
      const bottomColor = Phaser.Display.Color.HexStringToColor(skyGradient[1])
      
      for (let y = 0; y < GAME_HEIGHT; y++) {
        const progress = y / GAME_HEIGHT
        const color = Phaser.Display.Color.Interpolate.ColorWithColor(
          topColor, bottomColor, GAME_HEIGHT, y
        )
        graphics.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b), 1)
        graphics.fillRect(0, y, GAME_WIDTH, 1)
      }
    } else {
      const colorObj = Phaser.Display.Color.IntegerToColor(baseColor)
      
      for (let y = 0; y < GAME_HEIGHT; y++) {
        const progress = y / GAME_HEIGHT
        const darkFactor = 0.5 + progress * 0.5
        const r = Math.floor(colorObj.red * darkFactor)
        const g = Math.floor(colorObj.green * darkFactor)
        const b = Math.floor(colorObj.blue * darkFactor)
        
        graphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1)
        graphics.fillRect(0, y, GAME_WIDTH, 1)
      }
    }
  }
  
  /**
   * Create premium defender display with player sprite
   */
  createDefenderDisplay(jersey: number, x: number, y: number, scale: number = 0.15): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y)
    
    const key = `defender_sprite_${jersey}`
    const spriteData = DEFENDER_SPRITES.find(d => d.jersey === jersey)
    
    // Try to use photo sprite
    if (this.scene.textures.exists(key)) {
      const sprite = this.scene.add.image(0, 0, key)
      sprite.setScale(scale)
      sprite.setOrigin(0.5, 1)
      container.add(sprite)
      
      // Add glow behind sprite
      const glow = this.scene.add.graphics()
      glow.fillStyle(COLORS.green, 0.3)
      glow.fillEllipse(0, -sprite.displayHeight / 2, sprite.displayWidth * 0.8, sprite.displayHeight * 0.6)
      container.addAt(glow, 0)
      
      // Add name badge
      if (spriteData) {
        const nameBadge = this.scene.add.text(0, 10, spriteData.name.split(' ')[1].toUpperCase(), {
          fontSize: '10px',
          color: '#69BE28',
          fontFamily: 'Bebas Neue, sans-serif',
        })
        nameBadge.setOrigin(0.5, 0)
        container.add(nameBadge)
      }
    } else {
      // Fallback to circle with jersey number
      const circle = this.scene.add.graphics()
      circle.fillStyle(COLORS.navy, 1)
      circle.fillCircle(0, 0, 28)
      circle.lineStyle(4, COLORS.green, 1)
      circle.strokeCircle(0, 0, 28)
      container.add(circle)
      
      const jerseyText = this.scene.add.text(0, 0, `${jersey}`, {
        fontSize: '22px',
        color: '#FFFFFF',
        fontFamily: 'Bebas Neue, sans-serif',
      })
      jerseyText.setOrigin(0.5)
      container.add(jerseyText)
    }
    
    return container
  }
  
  /**
   * Create opponent runner with team colors
   */
  createOpponentRunner(
    x: number, 
    y: number, 
    primaryColor: number, 
    accentColor: number, 
    radius: number = 14,
    runnerType: string = 'NORMAL'
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y)
    
    // Holographic outer ring
    const hologramRing = this.scene.add.graphics()
    hologramRing.lineStyle(1, accentColor, 0.4)
    hologramRing.strokeCircle(0, 0, radius + 6)
    container.add(hologramRing)
    
    // Neon glow
    const glowOuter = this.scene.add.graphics()
    glowOuter.fillStyle(primaryColor, 0.15)
    glowOuter.fillCircle(0, 0, radius + 4)
    container.add(glowOuter)
    
    // Motion trail
    const trail = this.scene.add.graphics()
    trail.fillStyle(primaryColor, 0.3)
    trail.fillRect(-radius * 0.3, -radius - 2, radius * 0.6, 4)
    trail.fillStyle(primaryColor, 0.2)
    trail.fillRect(-radius * 0.2, -radius - 6, radius * 0.4, 4)
    container.add(trail)
    
    // Main body with gradient effect
    const body = this.scene.add.graphics()
    const lighterColor = Phaser.Display.Color.IntegerToColor(primaryColor)
    const brightColor = Phaser.Display.Color.GetColor(
      Math.min(255, lighterColor.red + 40),
      Math.min(255, lighterColor.green + 40),
      Math.min(255, lighterColor.blue + 40)
    )
    body.fillStyle(primaryColor, 1)
    body.fillCircle(0, 0, radius)
    body.fillStyle(brightColor, 0.4)
    body.fillCircle(-radius * 0.2, -radius * 0.2, radius * 0.5)
    container.add(body)
    
    // Neon border
    const neonBorder = this.scene.add.graphics()
    neonBorder.lineStyle(3, accentColor, 0.7)
    neonBorder.strokeCircle(0, 0, radius)
    neonBorder.lineStyle(1, 0xffffff, 0.5)
    neonBorder.strokeCircle(0, 0, radius - 1)
    container.add(neonBorder)
    
    // Helmet face
    const face = this.scene.add.graphics()
    face.fillStyle(0x000000, 0.4)
    face.fillEllipse(0, -radius * 0.1, radius * 1.2, radius * 0.8)
    face.fillStyle(0xffffff, 0.3)
    face.fillEllipse(-radius * 0.2, -radius * 0.3, radius * 0.4, radius * 0.2)
    container.add(face)
    
    // Type icon
    const iconMap: Record<string, string> = {
      NORMAL: '🏈',
      FAST: '⚡',
      TANK: '🛡️',
      ZIGZAG: '🌀',
      BOSS: '👑',
    }
    const icon = this.scene.add.text(0, radius * 0.1, iconMap[runnerType] || '🏈', { 
      fontSize: `${Math.max(10, 8 + radius * 0.3)}px` 
    })
    icon.setOrigin(0.5)
    container.add(icon)
    
    // Hologram shimmer animation
    this.scene.tweens.add({
      targets: hologramRing,
      alpha: { from: 0.2, to: 0.6 },
      scaleX: { from: 1, to: 1.15 },
      scaleY: { from: 1, to: 1.15 },
      duration: 800 + Math.random() * 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
    
    container.setData('radius', radius)
    container.setData('runnerType', runnerType)
    
    return container
  }
  
  /**
   * Create stage-specific atmosphere effects
   */
  createAtmosphereEffects(stage: CampaignStage): Phaser.GameObjects.Graphics[] {
    const effects: Phaser.GameObjects.Graphics[] = []
    const weather = stage.visuals.weather
    const atmoColorNum = parseInt(stage.visuals.atmosphereColor.replace('#', ''), 16)
    
    // Stage glow at top
    const stageGlow = this.scene.add.graphics()
    stageGlow.fillStyle(atmoColorNum, 0.05 * stage.visuals.crowdIntensity)
    stageGlow.fillEllipse(GAME_WIDTH / 2, -30, GAME_WIDTH * 1.2, 150)
    effects.push(stageGlow)
    
    this.scene.tweens.add({
      targets: stageGlow,
      alpha: 0.1 * stage.visuals.crowdIntensity,
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
    
    // Weather particles
    const particleCount = Math.floor(weather.intensity * 40)
    
    for (let i = 0; i < particleCount; i++) {
      const particle = this.scene.add.graphics()
      
      switch (weather.type) {
        case 'rain':
          this.createRainParticle(particle, weather.intensity)
          break
        case 'snow':
          this.createSnowParticle(particle, weather.intensity)
          break
        case 'fog':
          this.createFogParticle(particle, weather.intensity)
          break
        default:
          this.createDefaultParticle(particle, atmoColorNum)
      }
      
      effects.push(particle)
    }
    
    return effects
  }
  
  private createRainParticle(particle: Phaser.GameObjects.Graphics, intensity: number): void {
    particle.lineStyle(1, 0xaaccff, 0.4 + intensity * 0.3)
    particle.lineBetween(0, 0, 2, 8 + intensity * 6)
    
    const startX = Math.random() * GAME_WIDTH
    const startY = -20 - Math.random() * 100
    particle.setPosition(startX, startY)
    
    this.scene.tweens.add({
      targets: particle,
      y: GAME_HEIGHT + 30,
      x: startX + 40 * intensity,
      duration: 600 + Math.random() * 400,
      repeat: -1,
      delay: Math.random() * 1000,
      onRepeat: () => {
        particle.x = Math.random() * GAME_WIDTH
        particle.y = -20
      }
    })
  }
  
  private createSnowParticle(particle: Phaser.GameObjects.Graphics, intensity: number): void {
    const size = 1 + Math.random() * 2
    particle.fillStyle(0xffffff, 0.6 + Math.random() * 0.3)
    particle.fillCircle(0, 0, size)
    
    const startX = Math.random() * GAME_WIDTH
    const startY = -20 - Math.random() * 100
    particle.setPosition(startX, startY)
    
    this.scene.tweens.add({
      targets: particle,
      y: GAME_HEIGHT + 30,
      x: startX + (Math.random() - 0.5) * 100 * intensity,
      duration: 3000 + Math.random() * 2000,
      repeat: -1,
      delay: Math.random() * 2000,
      onRepeat: () => {
        particle.x = Math.random() * GAME_WIDTH
        particle.y = -20
      }
    })
  }
  
  private createFogParticle(particle: Phaser.GameObjects.Graphics, intensity: number): void {
    const size = 30 + Math.random() * 50
    particle.fillStyle(0xffffff, 0.03 + intensity * 0.05)
    particle.fillCircle(0, 0, size)
    
    const startX = Math.random() * GAME_WIDTH
    const startY = 100 + Math.random() * (GAME_HEIGHT - 200)
    particle.setPosition(startX, startY)
    
    this.scene.tweens.add({
      targets: particle,
      x: startX + (Math.random() - 0.5) * 80,
      alpha: { from: 0.02, to: 0.08 * intensity },
      duration: 4000 + Math.random() * 3000,
      yoyo: true,
      repeat: -1
    })
  }
  
  private createDefaultParticle(particle: Phaser.GameObjects.Graphics, color: number): void {
    particle.fillStyle(color, 0.3 + Math.random() * 0.3)
    particle.fillCircle(0, 0, 2 + Math.random() * 2)
    
    const startX = Math.random() * GAME_WIDTH
    const startY = Math.random() * GAME_HEIGHT * 0.3
    particle.setPosition(startX, startY)
    
    this.scene.tweens.add({
      targets: particle,
      alpha: { from: 0.2, to: 0.6 },
      scaleX: { from: 1, to: 1.5 },
      scaleY: { from: 1, to: 1.5 },
      duration: 1500 + Math.random() * 1000,
      yoyo: true,
      repeat: -1
    })
  }
  
  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.backgroundVideo) {
      this.backgroundVideo.destroy()
      this.backgroundVideo = null
    }
    if (this.backgroundImage) {
      this.backgroundImage.destroy()
      this.backgroundImage = null
    }
    this.defenderSprites.clear()
  }
}

/**
 * Get defender sprite data by jersey number
 */
export function getDefenderSprite(jersey: number): DefenderSprite | undefined {
  return DEFENDER_SPRITES.find(d => d.jersey === jersey)
}

/**
 * Get stadium background for a stage
 */
export function getStadiumBackground(stageId: number): StadiumBackground | undefined {
  return STADIUM_BACKGROUNDS[stageId]
}
