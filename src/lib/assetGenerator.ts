/**
 * Asset Generator for Seattle Game
 * Generates game assets using Leonardo.ai API
 */

import { createLeonardoClient, GAME_ASSET_PROMPTS } from './leonardo'
import { OPPONENTS, SEATTLE_DARKSIDE } from '../game/data/teams'

export interface GeneratedAsset {
  name: string
  type: 'helmet' | 'player' | 'texture' | 'icon' | 'trophy'
  url: string
  teamId?: string
}

/**
 * Generate all game assets
 * Note: This should be run as a build step or admin action, not on every page load
 */
export async function generateAllGameAssets(): Promise<GeneratedAsset[]> {
  const client = createLeonardoClient()

  if (!client) {
    throw new Error('Leonardo API client not initialized - check LEONARDO_API_KEY')
  }

  const assets: GeneratedAsset[] = []

  console.log('Starting asset generation...')

  // Generate Seattle Darkside helmet
  console.log('Generating Seattle Darkside helmet...')
  try {
    const seattleHelmetUrls = await client.generateAndWait({
      ...GAME_ASSET_PROMPTS.seattleHelmet,
      numImages: 1,
    })
    assets.push({
      name: 'seattle-darkside-helmet',
      type: 'helmet',
      url: seattleHelmetUrls[0],
      teamId: SEATTLE_DARKSIDE.id,
    })
  } catch (error) {
    console.error('Failed to generate Seattle helmet:', error)
  }

  // Generate opponent helmets
  for (const opponent of OPPONENTS) {
    console.log(`Generating ${opponent.name} helmet...`)
    try {
      const helmetPrompt = GAME_ASSET_PROMPTS.opponentHelmet(
        opponent.name,
        opponent.colors.primary,
        opponent.colors.secondary
      )
      const helmetUrls = await client.generateAndWait({
        ...helmetPrompt,
        numImages: 1,
      })
      assets.push({
        name: `${opponent.id}-helmet`,
        type: 'helmet',
        url: helmetUrls[0],
        teamId: opponent.id,
      })
    } catch (error) {
      console.error(`Failed to generate ${opponent.name} helmet:`, error)
    }
  }

  // Generate trophy
  console.log('Generating trophy...')
  try {
    const trophyUrls = await client.generateAndWait({
      ...GAME_ASSET_PROMPTS.trophy,
      numImages: 1,
    })
    assets.push({
      name: 'championship-trophy',
      type: 'trophy',
      url: trophyUrls[0],
    })
  } catch (error) {
    console.error('Failed to generate trophy:', error)
  }

  // Generate power-up icons
  const powerUpTypes = [
    { id: 'lightning', name: 'Power Surge' },
    { id: 'clock', name: 'Time Extension' },
    { id: 'rocket', name: 'Head Start' },
    { id: 'momentum', name: 'Momentum Boost' },
    { id: 'shield', name: 'Extra Lineman' },
  ]

  for (const powerUp of powerUpTypes) {
    console.log(`Generating ${powerUp.name} icon...`)
    try {
      const iconPrompt = GAME_ASSET_PROMPTS.powerUpIcon(powerUp.name)
      const iconUrls = await client.generateAndWait({
        ...iconPrompt,
        numImages: 1,
      })
      assets.push({
        name: `powerup-${powerUp.id}`,
        type: 'icon',
        url: iconUrls[0],
      })
    } catch (error) {
      console.error(`Failed to generate ${powerUp.name} icon:`, error)
    }
  }

  console.log(`Asset generation complete! Generated ${assets.length} assets.`)
  return assets
}

/**
 * Generate a single asset on demand
 */
export async function generateSingleAsset(
  type: 'helmet' | 'player' | 'trophy' | 'powerup',
  options?: { teamId?: string; powerUpType?: string }
): Promise<string | null> {
  const client = createLeonardoClient()

  if (!client) {
    console.error('Leonardo API client not initialized')
    return null
  }

  try {
    let prompt: { prompt: string; width: number; height: number }

    switch (type) {
      case 'helmet':
        if (options?.teamId === SEATTLE_DARKSIDE.id) {
          prompt = GAME_ASSET_PROMPTS.seattleHelmet
        } else {
          const team = OPPONENTS.find((t) => t.id === options?.teamId)
          if (!team) throw new Error('Team not found')
          prompt = GAME_ASSET_PROMPTS.opponentHelmet(
            team.name,
            team.colors.primary,
            team.colors.secondary
          )
        }
        break
      case 'trophy':
        prompt = GAME_ASSET_PROMPTS.trophy
        break
      case 'powerup':
        prompt = GAME_ASSET_PROMPTS.powerUpIcon(options?.powerUpType || 'power')
        break
      default:
        throw new Error('Unknown asset type')
    }

    const urls = await client.generateAndWait({ ...prompt, numImages: 1 })
    return urls[0]
  } catch (error) {
    console.error('Failed to generate asset:', error)
    return null
  }
}
