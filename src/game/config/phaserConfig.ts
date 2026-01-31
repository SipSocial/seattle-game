import * as Phaser from 'phaser'
import { BootScene } from '../scenes/BootScene'
import { GameScene } from '../scenes/GameScene'

// NOTE: All menu/UI scenes have been migrated to React components
// See: /components/game/ for React overlays (GameOver, Leaderboard, etc.)
// See: /components/ui/ for shared UI components

// Portrait orientation for mobile-first
// Using 400x700 base resolution - Phaser FIT mode will scale crisp to any screen
export const GAME_WIDTH = 400
export const GAME_HEIGHT = 700

// Field zones
export const FIELD_TOP = 80 // Score/wave display area  
export const FIELD_BOTTOM = GAME_HEIGHT - 20 // End zone line
export const END_ZONE_Y = GAME_HEIGHT - 40 // Where TDs are scored

// ============================================
// SEATTLE SEAHAWKS OFFICIAL COLORS
// ============================================
export const COLORS = {
  // Primary Seahawks Palette
  navy: 0x002244,        // College Navy - Primary
  green: 0x69BE28,       // Action Green - Accent
  grey: 0xA5ACAF,        // Wolf Grey
  white: 0xFFFFFF,
  
  // Extended Navy Shades
  navyLight: 0x003366,
  navyDark: 0x001a33,
  
  // Extended Green Shades
  greenLight: 0x8BD44A,
  greenDark: 0x4A9A1C,
  
  // Position Group Colors
  dlRed: 0xE53935,       // Defensive Line - Red
  lbTeal: 0x00897B,      // Linebackers - Teal
  dbGold: 0xFFB300,      // Defensive Backs - Gold
  
  // Game Colors
  field: 0x2D5A27,       // Turf green
  fieldLight: 0x3A7233,
  endzone: 0x002244,     // Navy endzone
  
  // UI Colors
  gold: 0xFFD700,        // Achievement gold
  red: 0xE53935,         // Danger/damage
  success: 0x69BE28,     // Success green
  warning: 0xFFB300,     // Warning amber
  
  // Legacy aliases for compatibility
  primary: 0x002244,     // Navy (was teal)
  accent: 0x69BE28,      // Green (same)
  trim: 0x001a33,        // Dark navy
}

// Typography settings for Phaser
export const FONTS = {
  display: 'Bebas Neue, Oswald, Arial Black, sans-serif',
  heading: 'Oswald, Arial Black, sans-serif',
  body: 'Inter, Arial, sans-serif',
}

// Animation easings
export const EASINGS = {
  spring: 'Back.easeOut',
  smooth: 'Sine.easeInOut',
  bounce: 'Bounce.easeOut',
  elastic: 'Elastic.easeOut',
}

export const phaserConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#002244', // Seahawks Navy
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, GameScene], // UI scenes migrated to React
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  render: {
    pixelArt: false,
    antialias: true,
    roundPixels: false, // Allow sub-pixel positioning for smoother movement
    transparent: false,
    clearBeforeRender: true,
    powerPreference: 'high-performance', // Request high-perf GPU for smooth rendering
  },
  input: {
    activePointers: 2, // Support multi-touch
  },
}

// Utility: Convert hex color to CSS string
export function hexToCSS(hex: number): string {
  return '#' + hex.toString(16).padStart(6, '0')
}

// Utility: Get position group color
export function getPositionGroupColor(group: 'DL' | 'LB' | 'DB'): number {
  switch (group) {
    case 'DL': return COLORS.dlRed
    case 'LB': return COLORS.lbTeal
    case 'DB': return COLORS.dbGold
    default: return COLORS.grey
  }
}
