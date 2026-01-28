/**
 * Sprite Generation Prompts for Darkside Defense
 * Top-down view sprites for horde defense gameplay
 * Stylized/cartoon art style
 */

export interface SpritePrompt {
  name: string
  key: string
  prompt: string
  width: number
  height: number
  frameCount?: number
  description: string
}

// Darkside colors
const DARKSIDE_COLORS = {
  primary: '#0F6E6A', // Teal
  accent: '#7ED957', // Green
  trim: '#0B1F24', // Navy
}

// Opponent team colors (for offensive runners)
const OPPONENT_COLORS = [
  { name: 'Crimson', primary: '#8B1E2D', accent: '#F2C14E' },
  { name: 'Gold', primary: '#C9A227', accent: '#2D2D2D' },
  { name: 'Storm', primary: '#5B6C77', accent: '#D7E0E7' },
  { name: 'Violet', primary: '#4B2E83', accent: '#CBB7FF' },
  { name: 'Orange', primary: '#C4511E', accent: '#FFD29D' },
]

/**
 * Player Defender Sprites - Top-down view
 */
export const DEFENDER_SPRITES: SpritePrompt[] = [
  {
    name: 'Player Defender',
    key: 'defender-player',
    prompt: `Top-down view 2D stylized football defender, circular design, teal jersey ${DARKSIDE_COLORS.primary} with green trim ${DARKSIDE_COLORS.accent}, white helmet, athletic build, cartoon style, bold outlines, transparent background, game sprite, 64x64 pixels`,
    width: 64,
    height: 64,
    description: 'Main player-controlled defender sprite',
  },
  {
    name: 'AI Teammate Defender',
    key: 'defender-teammate',
    prompt: `Top-down view 2D stylized football defender, circular design, slightly darker teal jersey, star symbol on helmet, cartoon style, supportive teammate look, transparent background, game sprite, 64x64 pixels`,
    width: 64,
    height: 64,
    description: 'AI-controlled teammate defender sprite',
  },
]

/**
 * Offensive Runner Sprites - Top-down view, different types
 */
export const RUNNER_SPRITES: SpritePrompt[] = [
  {
    name: 'Normal Runner',
    key: 'runner-normal',
    prompt: `Top-down view 2D stylized football running back, circular design, gray jersey, holding football, cartoon style, bold outlines, facing downward, transparent background, game sprite, 48x48 pixels`,
    width: 48,
    height: 48,
    description: 'Standard offensive runner',
  },
  {
    name: 'Fast Runner',
    key: 'runner-fast',
    prompt: `Top-down view 2D stylized football speedster, small circular design, yellow jersey with lightning bolt, motion lines, very fast looking, cartoon style, transparent background, game sprite, 40x40 pixels`,
    width: 40,
    height: 40,
    description: 'Fast but fragile runner',
  },
  {
    name: 'Tank Runner',
    key: 'runner-tank',
    prompt: `Top-down view 2D stylized football fullback, large circular design, red jersey, bulky muscular build, shield icon, intimidating, cartoon style, transparent background, game sprite, 64x64 pixels`,
    width: 64,
    height: 64,
    description: 'Slow but tough runner (2 hits)',
  },
  {
    name: 'Zigzag Runner',
    key: 'runner-zigzag',
    prompt: `Top-down view 2D stylized football receiver, circular design, green jersey, spiral/swirl pattern, agile looking, cartoon style, transparent background, game sprite, 48x48 pixels`,
    width: 48,
    height: 48,
    description: 'Runner that weaves side to side',
  },
]

/**
 * DrinkSip Power-Up Sprites
 */
export const POWERUP_SPRITES: SpritePrompt[] = [
  {
    name: 'Hazy IPA Can',
    key: 'powerup-hazy-ipa',
    prompt: `2D stylized beer can icon, amber/brown color, "HAZY" text, foam top, glowing aura, cartoon style, transparent background, game power-up sprite, 48x48 pixels`,
    width: 48,
    height: 48,
    description: 'Hazy IPA power-up - slows enemies',
  },
  {
    name: 'Watermelon Refresher Can',
    key: 'powerup-watermelon',
    prompt: `2D stylized beverage can icon, pink/green watermelon colors, refreshing look, water droplets, heart symbol, cartoon style, transparent background, game power-up sprite, 48x48 pixels`,
    width: 48,
    height: 48,
    description: 'Watermelon Refresher - extra lives',
  },
  {
    name: 'Lemon Lime Refresher Can',
    key: 'powerup-lemon-lime',
    prompt: `2D stylized beverage can icon, bright yellow/green lime colors, citrus slices, speed lines, lightning bolt, cartoon style, transparent background, game power-up sprite, 48x48 pixels`,
    width: 48,
    height: 48,
    description: 'Lemon Lime Refresher - speed boost',
  },
  {
    name: 'Blood Orange Refresher Can',
    key: 'powerup-blood-orange',
    prompt: `2D stylized beverage can icon, orange/red blood orange colors, explosion effect, power symbol, cartoon style, transparent background, game power-up sprite, 48x48 pixels`,
    width: 48,
    height: 48,
    description: 'Blood Orange Refresher - bigger tackle radius',
  },
]

/**
 * Field and UI Sprites
 */
export const FIELD_SPRITES: SpritePrompt[] = [
  {
    name: 'Football Field Turf',
    key: 'field-turf',
    prompt: `Top-down view football field grass texture, rich green color, subtle yard line markings, tileable seamless pattern, game texture, 128x128 pixels`,
    width: 128,
    height: 128,
    description: 'Repeating field turf background',
  },
  {
    name: 'End Zone',
    key: 'field-endzone',
    prompt: `Top-down view football end zone, teal color ${DARKSIDE_COLORS.primary}, diagonal stripes, "DARKSIDE" text faded, game texture, 400x60 pixels`,
    width: 400,
    height: 60,
    description: 'End zone at bottom of field',
  },
]

/**
 * Get all sprite prompts
 */
export function getAllSpritePrompts(): SpritePrompt[] {
  return [
    ...DEFENDER_SPRITES,
    ...RUNNER_SPRITES,
    ...POWERUP_SPRITES,
    ...FIELD_SPRITES,
  ]
}

/**
 * Get sprite prompt by key
 */
export function getSpritePromptByKey(key: string): SpritePrompt | undefined {
  return getAllSpritePrompts().find((s) => s.key === key)
}

/**
 * Generate opponent runner prompt with specific team colors
 */
export function getOpponentRunnerPrompt(
  baseType: 'normal' | 'fast' | 'tank' | 'zigzag',
  teamIndex: number
): SpritePrompt {
  const team = OPPONENT_COLORS[teamIndex % OPPONENT_COLORS.length]
  const base = RUNNER_SPRITES.find((s) => s.key === `runner-${baseType}`)!
  
  return {
    ...base,
    key: `runner-${baseType}-${team.name.toLowerCase()}`,
    prompt: base.prompt.replace(/gray|yellow|red|green/gi, team.primary) + ` with ${team.accent} accents`,
  }
}
