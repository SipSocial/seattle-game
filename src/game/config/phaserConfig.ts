import * as Phaser from 'phaser'
import { BootScene } from '../scenes/BootScene'
import { MenuScene } from '../scenes/MenuScene'
import { RoadScene } from '../scenes/RoadScene'
import { ClashScene } from '../scenes/ClashScene'
import { PowerUpScene } from '../scenes/PowerUpScene'
import { VictoryScene } from '../scenes/VictoryScene'

export const GAME_WIDTH = 800
export const GAME_HEIGHT = 600

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
  scene: [BootScene, MenuScene, RoadScene, ClashScene, PowerUpScene, VictoryScene],
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
}
