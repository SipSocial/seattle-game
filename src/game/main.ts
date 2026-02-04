import * as Phaser from 'phaser'
import { createPhaserConfig } from './config/phaserConfig'
import { BootScene } from './scenes/BootScene'
import { GameScene } from './scenes/GameScene'
import { useGameStore } from '../store/gameStore'

let gameInstance: Phaser.Game | null = null
let isDestroying = false

export function createGame(): Phaser.Game {
  // Prevent creation while destroying (race condition guard)
  if (isDestroying) {
    console.warn('[Game] Waiting for previous game to destroy...')
  }
  
  if (gameInstance) {
    return gameInstance
  }
  
  // Always use transparent config - AR mode is handled dynamically in GameScene
  const config = createPhaserConfig()

  // Check if we're coming from React player selection
  // If so, read the selected defender and skip to GameScene
  const selectedDefender = localStorage.getItem('selectedDefender')
  const storedGameMode = localStorage.getItem('gameMode') as 'campaign' | 'endless' | null
  
  if (selectedDefender) {
    // Update the store with the selected defender
    const jersey = parseInt(selectedDefender, 10)
    if (!isNaN(jersey)) {
      useGameStore.getState().setSelectedDefender(jersey)
      // Use stored game mode if provided, otherwise default to endless
      useGameStore.getState().setGameMode(storedGameMode || 'endless')
    }
    
    // Clear the flags so next time we show the menu
    localStorage.removeItem('selectedDefender')
    localStorage.removeItem('gameMode')
    
    // Create game config with GameScene FIRST so it auto-starts
    // This avoids the race condition with the 'ready' event
    const quickStartConfig: Phaser.Types.Core.GameConfig = {
      ...config,
      scene: [GameScene, BootScene], // GameScene first = auto-starts immediately
    }
    
    gameInstance = new Phaser.Game(quickStartConfig)
  } else {
    // Normal game start with boot screen
    gameInstance = new Phaser.Game(config)
  }
  
  return gameInstance
}


export function destroyGame(): void {
  if (gameInstance) {
    isDestroying = true
    try {
      gameInstance.destroy(true)
    } catch (e) {
      console.error('[Game] Error during destroy:', e)
    }
    gameInstance = null
    isDestroying = false
  }
}

export function getGame(): Phaser.Game | null {
  return gameInstance
}
