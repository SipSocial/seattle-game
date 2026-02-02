/**
 * Stadium Backgrounds for V3 Game
 * 
 * Maps opponent/week data to stadium background images
 * Uses existing Leonardo AI generated city images
 */

import { CAMPAIGN_STAGES, getStageById } from '@/src/game/data/campaign'
import { GENERATED_ASSETS } from '@/src/game/data/campaignAssets'

export interface StadiumBackground {
  weekId: number
  city: string
  stadium: string
  imageUrl: string | null
  opponentName: string
  opponentColors: {
    primary: number
    accent: number
  }
}

/**
 * Get stadium background for a specific week/opponent
 */
export function getStadiumBackground(weekId: number): StadiumBackground | null {
  const stage = getStageById(weekId)
  if (!stage) return null
  
  // Map city to generated asset
  const city = stage.location.city
  const imageUrl = GENERATED_ASSETS.cities[city as keyof typeof GENERATED_ASSETS.cities] || null
  
  return {
    weekId,
    city: stage.location.city,
    stadium: stage.visuals.landmarks.find(l => l.includes('Stadium') || l.includes('Field')) || 'Stadium',
    imageUrl,
    opponentName: stage.visuals.opponent.name,
    opponentColors: {
      primary: stage.visuals.opponent.primary,
      accent: stage.visuals.opponent.accent,
    },
  }
}

/**
 * Get all stadium backgrounds for the campaign
 */
export function getAllStadiumBackgrounds(): StadiumBackground[] {
  return CAMPAIGN_STAGES.map(stage => ({
    weekId: stage.id,
    city: stage.location.city,
    stadium: stage.visuals.landmarks.find(l => l.includes('Stadium') || l.includes('Field')) || 'Stadium',
    imageUrl: GENERATED_ASSETS.cities[stage.location.city as keyof typeof GENERATED_ASSETS.cities] || null,
    opponentName: stage.visuals.opponent.name,
    opponentColors: {
      primary: stage.visuals.opponent.primary,
      accent: stage.visuals.opponent.accent,
    },
  }))
}

/**
 * Get opponent colors for a specific week
 */
export function getOpponentColors(weekId: number): { primary: number; accent: number } {
  const stage = getStageById(weekId)
  if (!stage) {
    return { primary: 0x880000, accent: 0xff4444 } // Default red
  }
  return {
    primary: stage.visuals.opponent.primary,
    accent: stage.visuals.opponent.accent,
  }
}

/**
 * Get opponent city name for a specific week
 */
export function getOpponentCity(weekId: number): string {
  const stage = getStageById(weekId)
  return stage?.location.city || 'Seattle'
}

/**
 * Get stadium field background URL for a specific week (top-down gameplay view)
 */
export function getStadiumFieldUrl(weekId: number): string | null {
  const city = getOpponentCity(weekId)
  return GENERATED_ASSETS.stadiumFields?.[city as keyof typeof GENERATED_ASSETS.stadiumFields] || null
}

/**
 * Placeholder gradient backgrounds when no image is available
 * Each opponent has a unique gradient
 */
export const FALLBACK_GRADIENTS: Record<string, [string, string]> = {
  'Seattle': ['#002244', '#69BE28'],
  'Pittsburgh': ['#101820', '#FFB612'],
  'Phoenix': ['#97233F', '#FF6B35'],
  'Jacksonville': ['#006778', '#D7A22A'],
  'Washington DC': ['#5A1414', '#FFB612'],
  'Los Angeles': ['#003594', '#FFA300'],
  'Nashville': ['#0C2340', '#4B92DB'],
  'Atlanta': ['#A71930', '#000000'],
  'Charlotte': ['#101820', '#0085CA'],
  'San Francisco': ['#AA0000', '#B3995D'],
  'Indianapolis': ['#002C5F', '#A2AAAD'],
  'Minneapolis': ['#4F2683', '#FFC62F'],
}

/**
 * Get fallback gradient for a city
 */
export function getFallbackGradient(city: string): [string, string] {
  return FALLBACK_GRADIENTS[city] || ['#1a2a3a', '#2d4a5a']
}
