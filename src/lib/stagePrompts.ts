/**
 * SEATTLE SEAHAWKS DEFENSE - Stage Environment Prompts
 * Leonardo AI Optimized Prompts for Dynamic Stage Backgrounds
 * 
 * These prompts are designed to generate cohesive, game-ready
 * environment assets for each stage of the Road to the Super Bowl campaign.
 */

import { CampaignStage, CAMPAIGN_STAGES } from '../game/data/campaign'

export interface StageEnvironmentAsset {
  key: string
  prompt: string
  negativePrompt: string
  width: number
  height: number
  description: string
}

// Common negative prompts for consistency
const ENVIRONMENT_NEGATIVE = 'blurry, low quality, distorted, text, watermark, logo, photorealistic, 3D render, anime, human faces, people, players, crowded'

/**
 * Generate environment prompt for a specific stage
 */
export function getStageBackgroundPrompt(stage: CampaignStage): StageEnvironmentAsset {
  return {
    key: `stage-bg-${stage.id}`,
    prompt: buildBackgroundPrompt(stage),
    negativePrompt: ENVIRONMENT_NEGATIVE,
    width: 400, // Match game width
    height: 300, // Background section height
    description: `Background for ${stage.name} (${stage.location.city})`,
  }
}

/**
 * Build a detailed background prompt based on stage visuals
 */
function buildBackgroundPrompt(stage: CampaignStage): string {
  const { visuals, location } = stage
  
  // Base prompt components
  const style = 'stylized illustration, game background art, mobile game asset, flat colors, clean edges'
  const perspective = 'horizontal panorama view, stadium backdrop'
  const mood = getMoodFromWeather(visuals.weather.type)
  
  // Landmark descriptions
  const landmarks = visuals.landmarks.slice(0, 3).join(', ')
  
  // Color guidance from stage visuals
  const colors = `color palette ${visuals.skyGradient[0]} to ${visuals.skyGradient[1]}, accent ${visuals.atmosphereColor}`
  
  // Weather effects
  const weather = getWeatherDescription(visuals.weather)
  
  // Compose full prompt
  const prompt = [
    `${location.city} ${location.state} cityscape`,
    landmarks,
    mood,
    weather,
    perspective,
    style,
    colors,
    'no text, no logos, no people'
  ].filter(Boolean).join(', ')
  
  return prompt
}

function getMoodFromWeather(weatherType: string): string {
  switch (weatherType) {
    case 'rain': return 'moody overcast, dramatic atmosphere'
    case 'snow': return 'winter atmosphere, cold blue tones'
    case 'fog': return 'mysterious misty, ethereal atmosphere'
    case 'wind': return 'dynamic movement, weather in motion'
    case 'heat': return 'warm golden hour, heat shimmer'
    case 'night': return 'night scene, stadium lights, dramatic lighting'
    case 'clear': return 'clear sky, bright atmosphere'
    default: return 'atmospheric'
  }
}

function getWeatherDescription(weather: { type: string; intensity: number }): string {
  const intensity = weather.intensity > 0.7 ? 'heavy' : weather.intensity > 0.4 ? 'moderate' : 'light'
  
  switch (weather.type) {
    case 'rain': return `${intensity} rain falling, wet surfaces`
    case 'snow': return `${intensity} snowfall, snow covered`
    case 'fog': return `${intensity} fog, visibility effect`
    case 'wind': return 'wind effects, motion blur'
    case 'heat': return 'heat waves, warm glow'
    case 'night': return 'night sky, city lights, stadium glow'
    case 'clear': return 'clear weather, bright'
    default: return ''
  }
}

/**
 * Get atmosphere/particle overlay prompt for a stage
 */
export function getStageAtmospherePrompt(stage: CampaignStage): StageEnvironmentAsset {
  const { visuals } = stage
  
  return {
    key: `stage-atmo-${stage.id}`,
    prompt: `Abstract particle overlay, ${getWeatherDescription(visuals.weather)}, transparent particles, game effect layer, ${visuals.atmosphereColor} tint, seamless tile, transparent background, subtle effect`,
    negativePrompt: 'solid colors, opaque, text, faces, objects',
    width: 400,
    height: 700,
    description: `Atmosphere overlay for ${stage.name}`,
  }
}

/**
 * Get field/ground texture prompt for a stage
 */
export function getStageFieldPrompt(stage: CampaignStage): StageEnvironmentAsset {
  const { visuals } = stage
  
  return {
    key: `stage-field-${stage.id}`,
    prompt: `Top-down football field turf texture, ${visuals.fieldTint} tint, ${getWeatherDescription(visuals.weather)}, professional stadium grass, yard line markings, game texture, seamless tileable`,
    negativePrompt: 'people, objects, text, logos, distorted',
    width: 400,
    height: 200,
    description: `Field texture for ${stage.name}`,
  }
}

/**
 * Get all environment assets needed for a stage
 */
export function getAllStageAssets(stage: CampaignStage): StageEnvironmentAsset[] {
  return [
    getStageBackgroundPrompt(stage),
    getStageAtmospherePrompt(stage),
    getStageFieldPrompt(stage),
  ]
}

/**
 * Get all assets for all stages (batch generation)
 */
export function getAllCampaignAssets(): StageEnvironmentAsset[] {
  return CAMPAIGN_STAGES.flatMap(stage => getAllStageAssets(stage))
}

/**
 * Pre-defined high-quality prompts for key stages
 * Updated for 2025 Seahawks Schedule
 */
export const KEY_STAGE_PROMPTS: Record<number, string> = {
  // Stage 1: Seattle vs 49ers - Week 1 Home Opener
  1: `Seattle Washington cityscape at dusk, Space Needle silhouette center, Mount Rainier in foggy background, evergreen forest treeline, misty rain atmosphere, navy blue and action green color scheme, stadium lights glow, 12th Man energy, stylized game background art, no text, no people, 400x300px`,

  // Stage 2: Pittsburgh - Week 2 Away
  2: `Pittsburgh Pennsylvania three rivers, steel bridges silhouette, industrial skyline, black and gold atmosphere, Acrisure Stadium lights, AFC showdown energy, fog and smoke, stylized game background, no text, no people, 400x300px`,

  // Stage 4: Arizona - Week 4 Away
  4: `Arizona desert sunset, saguaro cacti silhouettes, State Farm Stadium dome, red rock mountains, orange and crimson sky gradient, desert heat atmosphere, NFC West rivalry, stylized game background, no text, no people, 400x300px`,

  // Stage 10: Los Angeles - Week 10 @ Rams
  10: `Los Angeles SoFi Stadium, Hollywood sign in distance, palm tree silhouettes, purple California sunset, celebrity atmosphere, NFC West showdown, stylized game illustration, no text, no people, 400x300px`,

  // Stage 17: San Francisco - Week 17 Season Finale
  17: `San Francisco Bay at dusk, Golden Gate Bridge fog, Levi's Stadium lights, scarlet and gold atmosphere, rivalry intensity, season finale energy, stylized game illustration, no text, no people, 400x300px`,

  // Stage 18: Divisional Playoff - Seattle Home
  18: `Seattle January playoff atmosphere, light snow falling, Lumen Field packed, Space Needle backdrop, navy and green playoff banner, NFC Divisional championship energy, stylized game art, no text, no people, 400x300px`,

  // Stage 19: NFC Championship - Seattle Home
  19: `Seattle NFC Championship night, heavy snow, Lumen Field glowing, championship atmosphere, gold confetti cannons ready, one game from glory, stylized dramatic illustration, no text, no people, 400x300px`,

  // Stage 20: Super Bowl - San Francisco (Levi's Stadium)
  20: `San Francisco Super Bowl at Levi's Stadium, Golden Gate Bridge fog background, Bay Area night sky, Lombardi Trophy golden glow, confetti celebration, ultimate championship atmosphere, Seahawks vs Patriots showdown, stylized game finale art, no text, no people, 400x300px`,
}

/**
 * Get the best prompt for a stage (uses curated if available)
 */
export function getBestStagePrompt(stageId: number): string {
  if (KEY_STAGE_PROMPTS[stageId]) {
    return KEY_STAGE_PROMPTS[stageId]
  }
  
  const stage = CAMPAIGN_STAGES.find(s => s.id === stageId)
  if (!stage) return ''
  
  return getStageBackgroundPrompt(stage).prompt
}
