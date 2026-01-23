import * as Phaser from 'phaser'

/**
 * BootScene - Initial scene that sets up the game
 */

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload(): void {
    // No external assets - using procedural graphics
  }

  create(): void {
    // Set default background
    this.cameras.main.setBackgroundColor('#0B1F24')

    // Transition to menu
    this.scene.start('MenuScene')
  }
}
