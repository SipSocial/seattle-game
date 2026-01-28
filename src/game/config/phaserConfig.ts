import * as Phaser from 'phaser'
import { BootScene } from '../scenes/BootScene'
import { MenuScene } from '../scenes/MenuScene'
import { RosterScene } from '../scenes/RosterScene'
import { GameScene } from '../scenes/GameScene'
import { GameOverScene } from '../scenes/GameOverScene'
import { LeaderboardScene } from '../scenes/LeaderboardScene'

// Portrait orientation for mobile-first
export const GAME_WIDTH = 400
export const GAME_HEIGHT = 700

// Field zones
export const FIELD_TOP = 80 // Score/wave display area
export const FIELD_BOTTOM = GAME_HEIGHT - 20 // End zone line
export const END_ZONE_Y = GAME_HEIGHT - 40 // Where TDs are scored

// Darkside colors
export const COLORS = {
  primary: 0x0f6e6a, // Teal
  accent: 0x7ed957, // Green
  trim: 0x0b1f24, // Navy
  field: 0x2d5a27, // Turf green
  white: 0xffffff,
  red: 0xff4444,
  gold: 0xffd700,
}

export const phaserConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#1a472a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, MenuScene, RosterScene, GameScene, GameOverScene, LeaderboardScene],
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
  },
  input: {
    activePointers: 2, // Support multi-touch
  },
}
