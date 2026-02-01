import * as Phaser from 'phaser'
import { createPhaserConfig } from './config/phaserConfig'
import { useGameStore } from '../store/gameStore'

let gameInstance: Phaser.Game | null = null

export function createGame(): Phaser.Game {
  if (gameInstance) {
    return gameInstance
  }
  
  // Always use transparent config - AR mode is handled dynamically in GameScene
  const config = createPhaserConfig()

  // Check if we're coming from React player selection
  // If so, read the selected defender and skip to GameScene
  const selectedDefender = localStorage.getItem('selectedDefender')
  
  if (selectedDefender) {
    // Update the store with the selected defender
    const jersey = parseInt(selectedDefender, 10)
    if (!isNaN(jersey)) {
      useGameStore.getState().setSelectedDefender(jersey)
      useGameStore.getState().setGameMode('endless') // Set to endless mode
    }
    
    // Clear the flag so next time we show the menu
    localStorage.removeItem('selectedDefender')
    
    // Create game config that starts at GameScene directly
    const quickStartConfig: Phaser.Types.Core.GameConfig = {
      ...config,
      scene: config.scene, // Keep all scenes registered
    }
    
    gameInstance = new Phaser.Game(quickStartConfig)
    
    // Start at GameScene directly after a brief moment
    gameInstance.events.once('ready', () => {
      const bootScene = gameInstance?.scene.getScene('BootScene')
      if (bootScene) {
        // Skip boot and menu, go straight to game
        gameInstance?.scene.stop('BootScene')
        gameInstance?.scene.start('GameScene')
      }
    })
  } else {
    // Normal game start with boot screen
    gameInstance = new Phaser.Game(config)
  }
  
  return gameInstance
}


export function destroyGame(): void {
  if (gameInstance) {
    gameInstance.destroy(true)
    gameInstance = null
  }
}

export function getGame(): Phaser.Game | null {
  return gameInstance
}
