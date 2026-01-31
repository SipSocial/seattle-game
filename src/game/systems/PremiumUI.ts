/**
 * PremiumUI - Shared UI utilities for premium mockup-style visuals
 * 
 * Design System:
 * - Glass-morphism panels with 40% opacity black + green border
 * - Gradient buttons with shine animation
 * - Pulsing spotlight glow from top
 * - Top/bottom gradient overlays for text readability
 * - Stadium poster background
 */

import * as Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONTS, hexToCSS } from '../config/phaserConfig'

// Stadium poster for backgrounds
export const STADIUM_POSTER = 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/16412705-ca65-400e-bb78-80ff29be860a/segments/2:2:1/Phoenix_Empty_NFL_football_field_at_night_dramatic_billowing_s_0.jpg'

// Green accent color values
const GREEN_HEX = 0x69BE28
const GREEN_DARK = 0x4a9c1c

/**
 * Create a glass-morphism panel
 */
export function createGlassPanel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  options: {
    radius?: number
    opacity?: number
    borderColor?: number
    borderOpacity?: number
    borderWidth?: number
  } = {}
): Phaser.GameObjects.Graphics {
  const {
    radius = 16,
    opacity = 0.4,
    borderColor = COLORS.green,
    borderOpacity = 0.3,
    borderWidth = 1,
  } = options

  const panel = scene.add.graphics()
  
  // Glass background
  panel.fillStyle(0x000000, opacity)
  panel.fillRoundedRect(x - width / 2, y - height / 2, width, height, radius)
  
  // Border
  panel.lineStyle(borderWidth, borderColor, borderOpacity)
  panel.strokeRoundedRect(x - width / 2, y - height / 2, width, height, radius)
  
  return panel
}

/**
 * Create a gradient button with shine effect
 */
export function createGradientButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  onClick: () => void,
  options: {
    width?: number
    height?: number
    fontSize?: string
  } = {}
): Phaser.GameObjects.Container {
  const {
    width = 220,
    height = 50,
    fontSize = '18px',
  } = options

  const container = scene.add.container(x, y)

  // Glow behind button
  const glow = scene.add.graphics()
  glow.fillStyle(GREEN_HEX, 0.3)
  glow.fillRoundedRect(-width / 2 - 8, -height / 2 - 8, width + 16, height + 16, 20)
  glow.setAlpha(0)
  container.add(glow)

  // Main button background - simulate gradient with layers
  const bg = scene.add.graphics()
  
  // Base green
  bg.fillStyle(GREEN_HEX, 1)
  bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12)
  
  // Darker bottom half for gradient effect
  bg.fillStyle(GREEN_DARK, 0.5)
  bg.fillRect(-width / 2 + 4, 0, width - 8, height / 2 - 4)
  
  // Top shine
  bg.fillStyle(0xffffff, 0.2)
  bg.fillRoundedRect(-width / 2 + 4, -height / 2 + 4, width - 8, height / 2 - 8, { tl: 8, tr: 8, bl: 0, br: 0 })
  
  container.add(bg)

  // Button text
  const label = scene.add.text(0, 0, text, {
    fontSize,
    color: '#002244', // Navy
    fontFamily: FONTS.display,
  })
  label.setOrigin(0.5)
  container.add(label)

  // Make interactive
  container.setSize(width, height)
  container.setInteractive({ useHandCursor: true })

  // Hover effects
  container.on('pointerover', () => {
    scene.tweens.add({ targets: container, scale: 1.05, duration: 100 })
    scene.tweens.add({ targets: glow, alpha: 1, duration: 100 })
  })

  container.on('pointerout', () => {
    scene.tweens.add({ targets: container, scale: 1, duration: 100 })
    scene.tweens.add({ targets: glow, alpha: 0, duration: 100 })
  })

  container.on('pointerdown', () => {
    container.setScale(0.95)
  })

  container.on('pointerup', () => {
    container.setScale(1)
    onClick()
  })

  return container
}

/**
 * Create secondary (glass) button
 */
export function createGlassButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  onClick: () => void,
  options: {
    width?: number
    height?: number
    fontSize?: string
  } = {}
): Phaser.GameObjects.Container {
  const {
    width = 180,
    height = 44,
    fontSize = '14px',
  } = options

  const container = scene.add.container(x, y)

  // Glass background
  const bg = scene.add.graphics()
  bg.fillStyle(0x000000, 0.4)
  bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10)
  bg.lineStyle(1, COLORS.green, 0.3)
  bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10)
  container.add(bg)

  // Button text
  const label = scene.add.text(0, 0, text, {
    fontSize,
    color: hexToCSS(COLORS.grey),
    fontFamily: FONTS.body,
  })
  label.setOrigin(0.5)
  container.add(label)

  // Make interactive
  container.setSize(width, height)
  container.setInteractive({ useHandCursor: true })

  container.on('pointerover', () => {
    label.setColor(hexToCSS(COLORS.green))
    bg.clear()
    bg.fillStyle(COLORS.green, 0.15)
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10)
    bg.lineStyle(1, COLORS.green, 0.5)
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10)
  })

  container.on('pointerout', () => {
    label.setColor(hexToCSS(COLORS.grey))
    bg.clear()
    bg.fillStyle(0x000000, 0.4)
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10)
    bg.lineStyle(1, COLORS.green, 0.3)
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10)
  })

  container.on('pointerdown', () => container.setScale(0.95))
  container.on('pointerup', () => {
    container.setScale(1)
    onClick()
  })

  return container
}

/**
 * Create top and bottom gradient overlays for text readability
 */
export function createOverlays(scene: Phaser.Scene): {
  top: Phaser.GameObjects.Graphics
  bottom: Phaser.GameObjects.Graphics
} {
  // Top gradient overlay
  const top = scene.add.graphics()
  for (let y = 0; y < 128; y++) {
    const alpha = 0.7 * (1 - y / 128)
    top.fillStyle(0x000000, alpha)
    top.fillRect(0, y, GAME_WIDTH, 1)
  }
  top.setDepth(5)

  // Bottom gradient overlay
  const bottom = scene.add.graphics()
  for (let y = 0; y < 200; y++) {
    const progress = y / 200
    const alpha = 0.9 * progress
    bottom.fillStyle(0x000000, alpha)
    bottom.fillRect(0, GAME_HEIGHT - 200 + y, GAME_WIDTH, 1)
  }
  bottom.setDepth(5)

  return { top, bottom }
}

/**
 * Create pulsing spotlight glow at top of screen
 */
export function createSpotlight(scene: Phaser.Scene): Phaser.GameObjects.Graphics {
  const spotlight = scene.add.graphics()
  
  // Radial gradient effect using ellipse layers
  for (let i = 10; i > 0; i--) {
    const alpha = 0.02 * (11 - i)
    spotlight.fillStyle(GREEN_HEX, alpha)
    spotlight.fillEllipse(GAME_WIDTH / 2, -50, GAME_WIDTH * (0.6 + i * 0.08), 300 + i * 30)
  }
  
  spotlight.setDepth(1)
  
  // Pulsing animation
  scene.tweens.add({
    targets: spotlight,
    alpha: { from: 0.6, to: 1 },
    scaleX: { from: 1, to: 1.05 },
    scaleY: { from: 1, to: 1.05 },
    duration: 2000,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  })
  
  return spotlight
}

/**
 * Create stadium poster background with overlays
 */
export function createStadiumBackground(
  scene: Phaser.Scene,
  textureKey: string = 'stadium_bg'
): Phaser.GameObjects.Container {
  const container = scene.add.container(0, 0)
  container.setDepth(0)

  // Dark base
  const darkBase = scene.add.graphics()
  darkBase.fillStyle(0x0a1628, 1)
  darkBase.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
  container.add(darkBase)

  // Stadium image if loaded
  if (scene.textures.exists(textureKey)) {
    const stadiumImg = scene.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, textureKey)
    stadiumImg.setDisplaySize(GAME_WIDTH * 1.1, GAME_HEIGHT * 1.1)
    stadiumImg.setAlpha(0.4)
    container.add(stadiumImg)
  }

  // Spotlight glow
  const spotlight = scene.add.graphics()
  for (let i = 8; i > 0; i--) {
    const alpha = 0.015 * (9 - i)
    spotlight.fillStyle(GREEN_HEX, alpha)
    spotlight.fillEllipse(GAME_WIDTH / 2, -30, GAME_WIDTH * (0.5 + i * 0.1), 250 + i * 25)
  }
  container.add(spotlight)
  
  // Animate spotlight
  scene.tweens.add({
    targets: spotlight,
    alpha: { from: 0.7, to: 1 },
    scaleY: { from: 1, to: 1.08 },
    duration: 2500,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  })

  return container
}

/**
 * Create premium header text
 */
export function createHeader(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  options: {
    fontSize?: string
    color?: number
    glow?: boolean
  } = {}
): Phaser.GameObjects.Text {
  const {
    fontSize = '28px',
    color = COLORS.white,
    glow = true,
  } = options

  const header = scene.add.text(x, y, text, {
    fontSize,
    color: hexToCSS(color),
    fontFamily: FONTS.display,
    letterSpacing: 2,
  })
  header.setOrigin(0.5)
  
  if (glow) {
    header.setShadow(0, 0, hexToCSS(COLORS.green), 10, true, true)
  }
  
  return header
}

/**
 * Create premium label (small uppercase text)
 */
export function createLabel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  options: {
    color?: number
    fontSize?: string
  } = {}
): Phaser.GameObjects.Text {
  const {
    color = COLORS.grey,
    fontSize = '9px',
  } = options

  const label = scene.add.text(x, y, text.toUpperCase(), {
    fontSize,
    color: hexToCSS(color),
    fontFamily: FONTS.body,
    letterSpacing: 2,
  })
  label.setOrigin(0.5)
  
  return label
}

/**
 * Create premium stat value display
 */
export function createStatValue(
  scene: Phaser.Scene,
  x: number,
  y: number,
  value: string | number,
  options: {
    fontSize?: string
    color?: number
  } = {}
): Phaser.GameObjects.Text {
  const {
    fontSize = '32px',
    color = COLORS.green,
  } = options

  const stat = scene.add.text(x, y, `${value}`, {
    fontSize,
    color: hexToCSS(color),
    fontFamily: FONTS.display,
  })
  stat.setOrigin(0.5)
  stat.setShadow(0, 0, hexToCSS(COLORS.green), 15, true, true)
  
  return stat
}

/**
 * Create defender photo display with glow
 */
export function createDefenderPhoto(
  scene: Phaser.Scene,
  x: number,
  y: number,
  textureKey: string,
  options: {
    height?: number
    glowColor?: number
  } = {}
): Phaser.GameObjects.Container {
  const {
    height = 300,
    glowColor = COLORS.green,
  } = options

  const container = scene.add.container(x, y)

  // Glow behind player
  const glow = scene.add.graphics()
  glow.fillStyle(glowColor, 0.2)
  glow.fillEllipse(0, height * 0.3, height * 0.8, height)
  container.add(glow)
  
  // Pulse glow
  scene.tweens.add({
    targets: glow,
    alpha: 0.35,
    scaleX: 1.1,
    scaleY: 1.1,
    duration: 2000,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  })

  // Player image
  if (scene.textures.exists(textureKey)) {
    const playerImg = scene.add.image(0, 0, textureKey)
    const scale = height / playerImg.height
    playerImg.setScale(scale)
    playerImg.setOrigin(0.5, 0.5)
    container.add(playerImg)
  }

  // Ground shadow
  const shadow = scene.add.graphics()
  shadow.fillStyle(0x000000, 0.5)
  shadow.fillEllipse(0, height * 0.45, height * 0.6, height * 0.1)
  container.add(shadow)

  return container
}
