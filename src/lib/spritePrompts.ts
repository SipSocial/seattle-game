/**
 * SEATTLE SEAHAWKS DEFENSE - Premium Sprite Generation
 * Leonardo AI Optimized Prompts for Game Assets
 * 
 * Design Language:
 * - Modern, dynamic sports aesthetics
 * - Seattle Seahawks colors: Navy (#002244), Action Green (#69BE28), Wolf Grey (#A5ACAF)
 * - Professional NFL stadium atmosphere
 * - Top-down perspective for gameplay sprites
 * - Clean, stylized art suitable for mobile games
 */

export interface SpritePrompt {
  name: string
  key: string
  prompt: string
  negativePrompt?: string
  width: number
  height: number
  frameCount?: number
  description: string
  category: 'defender' | 'runner' | 'powerup' | 'field' | 'ui' | 'background'
}

// Seattle Seahawks Official Colors
const SEAHAWKS = {
  navy: '#002244',
  green: '#69BE28',
  grey: '#A5ACAF',
  white: '#FFFFFF',
}

// Opponent team colors for variety
const OPPONENT_PALETTES = [
  { name: 'Crimson', primary: '#8B1E2D', accent: '#F2C14E' },
  { name: 'Purple', primary: '#4B2E83', accent: '#CBB7FF' },
  { name: 'Orange', primary: '#C4511E', accent: '#FFD29D' },
  { name: 'Black', primary: '#1A1A1A', accent: '#C0C0C0' },
  { name: 'Blue', primary: '#0033A0', accent: '#FFFFFF' },
]

// Common negative prompts for consistency
const COMMON_NEGATIVE = 'blurry, low quality, distorted, text, watermark, logo, realistic, photorealistic, 3D render, anime'
const SPRITE_NEGATIVE = `${COMMON_NEGATIVE}, complex background, detailed environment`

/**
 * DEFENDER SPRITES - Seahawks Players
 */
export const DEFENDER_SPRITES: SpritePrompt[] = [
  {
    name: 'Player Defender (Main)',
    key: 'defender-player',
    prompt: `Top-down view 2D game sprite, NFL football defensive player, Seattle Seahawks style, navy blue jersey ${SEAHAWKS.navy}, action green accents ${SEAHAWKS.green}, white helmet with hawk wing design, athletic stance ready to tackle, circular design, bold outlines, stylized cartoon art, mobile game asset, transparent background, 64x64 pixel art style`,
    negativePrompt: SPRITE_NEGATIVE,
    width: 64,
    height: 64,
    description: 'Main player-controlled Seahawks defender',
    category: 'defender',
  },
  {
    name: 'AI Teammate Defender',
    key: 'defender-teammate',
    prompt: `Top-down view 2D game sprite, NFL football defensive player, Seattle Seahawks backup player, darker navy jersey, wolf grey accents ${SEAHAWKS.grey}, star symbol on chest, supporting teammate look, circular design, stylized cartoon art, mobile game asset, transparent background, 64x64 pixels`,
    negativePrompt: SPRITE_NEGATIVE,
    width: 64,
    height: 64,
    description: 'AI-controlled teammate defenders',
    category: 'defender',
  },
  {
    name: 'Defensive Lineman',
    key: 'defender-dl',
    prompt: `Top-down view 2D game sprite, NFL defensive lineman, large muscular build, Seattle Seahawks navy jersey, red position indicator, powerful stance, holding ground, circular design, bold outlines, stylized cartoon art, transparent background, 72x72 pixels`,
    negativePrompt: SPRITE_NEGATIVE,
    width: 72,
    height: 72,
    description: 'Defensive line position sprite',
    category: 'defender',
  },
  {
    name: 'Linebacker',
    key: 'defender-lb',
    prompt: `Top-down view 2D game sprite, NFL linebacker, medium athletic build, Seattle Seahawks navy jersey, teal position indicator, aggressive stance ready to blitz, circular design, bold outlines, stylized cartoon art, transparent background, 64x64 pixels`,
    negativePrompt: SPRITE_NEGATIVE,
    width: 64,
    height: 64,
    description: 'Linebacker position sprite',
    category: 'defender',
  },
  {
    name: 'Cornerback',
    key: 'defender-cb',
    prompt: `Top-down view 2D game sprite, NFL cornerback, sleek athletic build, Seattle Seahawks navy jersey, gold position indicator, coverage stance, fast agile look, circular design, bold outlines, stylized cartoon art, transparent background, 56x56 pixels`,
    negativePrompt: SPRITE_NEGATIVE,
    width: 56,
    height: 56,
    description: 'Cornerback position sprite',
    category: 'defender',
  },
  {
    name: 'Safety',
    key: 'defender-s',
    prompt: `Top-down view 2D game sprite, NFL safety, athletic build, Seattle Seahawks navy jersey, gold position indicator, last line of defense stance, keen awareness look, circular design, bold outlines, stylized cartoon art, transparent background, 56x56 pixels`,
    negativePrompt: SPRITE_NEGATIVE,
    width: 56,
    height: 56,
    description: 'Safety position sprite',
    category: 'defender',
  },
]

/**
 * RUNNER SPRITES - Offensive Enemies
 */
export const RUNNER_SPRITES: SpritePrompt[] = [
  {
    name: 'Normal Runner',
    key: 'runner-normal',
    prompt: `Top-down view 2D game sprite, NFL running back opponent, gray jersey, holding football, running downward, standard athletic build, circular design, bold outlines, stylized cartoon art, mobile game enemy sprite, transparent background, 48x48 pixels`,
    negativePrompt: SPRITE_NEGATIVE,
    width: 48,
    height: 48,
    description: 'Standard offensive runner',
    category: 'runner',
  },
  {
    name: 'Fast Runner (Speed)',
    key: 'runner-fast',
    prompt: `Top-down view 2D game sprite, NFL speed receiver opponent, bright yellow jersey with lightning bolt, small slim build, motion blur lines, extremely fast appearance, circular design, glowing speed effect, stylized cartoon art, transparent background, 40x40 pixels`,
    negativePrompt: SPRITE_NEGATIVE,
    width: 40,
    height: 40,
    description: 'Fast but fragile runner with 1.8x speed',
    category: 'runner',
  },
  {
    name: 'Tank Runner (Heavy)',
    key: 'runner-tank',
    prompt: `Top-down view 2D game sprite, NFL fullback opponent, red jersey with shield icon, large bulky muscular build, intimidating powerful appearance, two hit points indicator, circular design, bold outlines, stylized cartoon art, transparent background, 64x64 pixels`,
    negativePrompt: SPRITE_NEGATIVE,
    width: 64,
    height: 64,
    description: 'Slow but tough runner requiring 2 hits',
    category: 'runner',
  },
  {
    name: 'Zigzag Runner (Evasive)',
    key: 'runner-zigzag',
    prompt: `Top-down view 2D game sprite, NFL slot receiver opponent, green jersey with spiral swirl pattern, agile athletic build, evasive dodging appearance, motion trail effect, circular design, stylized cartoon art, transparent background, 48x48 pixels`,
    negativePrompt: SPRITE_NEGATIVE,
    width: 48,
    height: 48,
    description: 'Runner that weaves side to side',
    category: 'runner',
  },
]

/**
 * POWER-UP SPRITES - DrinkSip Branded
 */
export const POWERUP_SPRITES: SpritePrompt[] = [
  {
    name: 'Hazy IPA Power-Up',
    key: 'powerup-hazy-ipa',
    prompt: `2D game power-up icon, craft beer can, amber golden color, foam top bubbles, "HAZY" label text, glowing aura effect, floating in air, stylized cartoon art, mobile game collectible, transparent background, 48x48 pixels`,
    negativePrompt: COMMON_NEGATIVE,
    width: 48,
    height: 48,
    description: 'Hazy IPA - Slows all enemies by 20%',
    category: 'powerup',
  },
  {
    name: 'Watermelon Refresher',
    key: 'powerup-watermelon',
    prompt: `2D game power-up icon, refreshing beverage can, pink and green watermelon colors, water droplets condensation, heart health symbol, glowing aura, stylized cartoon art, mobile game collectible, transparent background, 48x48 pixels`,
    negativePrompt: COMMON_NEGATIVE,
    width: 48,
    height: 48,
    description: 'Watermelon Refresher - +2 Extra Lives',
    category: 'powerup',
  },
  {
    name: 'Lemon Lime Boost',
    key: 'powerup-lemon-lime',
    prompt: `2D game power-up icon, energy drink can, bright yellow and lime green colors, citrus slice decorations, lightning bolt speed symbol, electric glow effect, stylized cartoon art, mobile game collectible, transparent background, 48x48 pixels`,
    negativePrompt: COMMON_NEGATIVE,
    width: 48,
    height: 48,
    description: 'Lemon Lime - +30% Movement Speed',
    category: 'powerup',
  },
  {
    name: 'Blood Orange Power',
    key: 'powerup-blood-orange',
    prompt: `2D game power-up icon, premium drink can, deep orange and red blood orange colors, explosion burst effect, power fist symbol, fiery glow aura, stylized cartoon art, mobile game collectible, transparent background, 48x48 pixels`,
    negativePrompt: COMMON_NEGATIVE,
    width: 48,
    height: 48,
    description: 'Blood Orange - +25% Tackle Radius',
    category: 'powerup',
  },
  {
    name: 'Teammate Power-Up',
    key: 'powerup-teammate',
    prompt: `2D game power-up icon, football helmet, Seattle Seahawks teal color, star teammate symbol, glowing recruitment aura, plus one indicator, stylized cartoon art, mobile game collectible, transparent background, 48x48 pixels`,
    negativePrompt: COMMON_NEGATIVE,
    width: 48,
    height: 48,
    description: 'Teammate - +1 AI Defender',
    category: 'powerup',
  },
  {
    name: 'Speed Boost',
    key: 'powerup-speed',
    prompt: `2D game power-up icon, winged boots, action green color ${SEAHAWKS.green}, motion speed lines, lightning fast symbol, glowing energy aura, stylized cartoon art, mobile game collectible, transparent background, 48x48 pixels`,
    negativePrompt: COMMON_NEGATIVE,
    width: 48,
    height: 48,
    description: 'Speed Boost - +20% Movement Speed',
    category: 'powerup',
  },
  {
    name: 'Tackle Range',
    key: 'powerup-reach',
    prompt: `2D game power-up icon, muscular arm flexing, red power color, expansion radius effect, strength symbol, glowing aura, stylized cartoon art, mobile game collectible, transparent background, 48x48 pixels`,
    negativePrompt: COMMON_NEGATIVE,
    width: 48,
    height: 48,
    description: 'Reach - +15% Tackle Radius',
    category: 'powerup',
  },
  {
    name: 'Extra Life Heart',
    key: 'powerup-life',
    prompt: `2D game power-up icon, glowing heart, vibrant pink and red colors, pulsing life energy, health restoration symbol, sparkle effects, stylized cartoon art, mobile game collectible, transparent background, 48x48 pixels`,
    negativePrompt: COMMON_NEGATIVE,
    width: 48,
    height: 48,
    description: 'Life - +1 Extra Life',
    category: 'powerup',
  },
]

/**
 * FIELD & BACKGROUND SPRITES
 */
export const FIELD_SPRITES: SpritePrompt[] = [
  {
    name: 'Football Field Turf',
    key: 'field-turf',
    prompt: `Top-down view seamless tileable texture, NFL football field grass, rich vibrant green turf, subtle mowing stripe pattern, yard line markings, high quality game texture, 128x128 pixels`,
    negativePrompt: 'distorted, uneven, patchy, dead grass',
    width: 128,
    height: 128,
    description: 'Repeating field turf background texture',
    category: 'field',
  },
  {
    name: 'Seahawks End Zone',
    key: 'field-endzone',
    prompt: `Top-down view NFL end zone, Seattle Seahawks colors navy blue ${SEAHAWKS.navy}, diagonal stripe pattern, faded "SEAHAWKS" text, professional stadium quality, game texture, 400x80 pixels`,
    negativePrompt: COMMON_NEGATIVE,
    width: 400,
    height: 80,
    description: 'End zone area at bottom of field',
    category: 'field',
  },
  {
    name: 'Spawn Zone',
    key: 'field-spawn',
    prompt: `Top-down view football field opponent zone, red danger tint, enemy territory marking, warning stripe pattern, game texture, 400x60 pixels`,
    negativePrompt: COMMON_NEGATIVE,
    width: 400,
    height: 60,
    description: 'Spawn zone indicator at top of field',
    category: 'field',
  },
  {
    name: 'Yard Line',
    key: 'field-yardline',
    prompt: `Top-down view NFL yard line marking, white chalk line, hash marks, professional stadium quality, seamless horizontal stripe, game texture, 400x4 pixels`,
    negativePrompt: COMMON_NEGATIVE,
    width: 400,
    height: 4,
    description: 'Yard line marking overlay',
    category: 'field',
  },
]

/**
 * BACKGROUND SPRITES - Stadium Atmosphere
 */
export const BACKGROUND_SPRITES: SpritePrompt[] = [
  {
    name: 'Stadium Crowd',
    key: 'bg-crowd',
    prompt: `NFL stadium crowd background, thousands of cheering fans, Seattle Seahawks colors navy and green, 12th man atmosphere, blurred bokeh effect, stadium lights, night game atmosphere, wide panoramic view, 800x200 pixels`,
    negativePrompt: 'individual faces, detailed people, empty seats',
    width: 800,
    height: 200,
    description: 'Stadium crowd background for menus',
    category: 'background',
  },
  {
    name: 'Stadium Lights',
    key: 'bg-lights',
    prompt: `NFL stadium lights at night, dramatic lighting beams, lens flare effects, Seattle Seahawks game night atmosphere, fog light rays, epic sports atmosphere, 400x300 pixels`,
    negativePrompt: COMMON_NEGATIVE,
    width: 400,
    height: 300,
    description: 'Stadium lights overlay effect',
    category: 'background',
  },
  {
    name: 'Field Texture (Rain)',
    key: 'bg-rain',
    prompt: `Top-down view football field in rain, wet grass reflections, rain drops on turf, Seattle weather atmosphere, dramatic sports mood, seamless tile texture, 256x256 pixels`,
    negativePrompt: COMMON_NEGATIVE,
    width: 256,
    height: 256,
    description: 'Rainy field texture for special modes',
    category: 'background',
  },
]

/**
 * UI SPRITES
 */
export const UI_SPRITES: SpritePrompt[] = [
  {
    name: 'Seahawks Logo Badge',
    key: 'ui-logo',
    prompt: `Seattle Seahawks style team badge, circular emblem, hawk bird silhouette, navy blue and action green colors, 12 number, modern sports logo design, clean vector style, transparent background, 128x128 pixels`,
    negativePrompt: 'official NFL logo, trademarked design, realistic',
    width: 128,
    height: 128,
    description: 'Team logo badge for menus',
    category: 'ui',
  },
  {
    name: 'Trophy Icon',
    key: 'ui-trophy',
    prompt: `Championship trophy icon, golden metallic finish, football theme, Lombardi style trophy, victory celebration sparkles, game UI asset, transparent background, 64x64 pixels`,
    negativePrompt: COMMON_NEGATIVE,
    width: 64,
    height: 64,
    description: 'Trophy icon for leaderboard',
    category: 'ui',
  },
  {
    name: 'Tackle Effect',
    key: 'ui-tackle',
    prompt: `Impact explosion effect sprite sheet, collision burst, starburst pattern, action green and white colors, comic book style impact, 4 frame animation, transparent background, 128x32 pixels`,
    negativePrompt: COMMON_NEGATIVE,
    width: 128,
    height: 32,
    frameCount: 4,
    description: 'Tackle impact effect animation',
    category: 'ui',
  },
]

/**
 * Get all sprite prompts organized by category
 */
export function getAllSpritePrompts(): SpritePrompt[] {
  return [
    ...DEFENDER_SPRITES,
    ...RUNNER_SPRITES,
    ...POWERUP_SPRITES,
    ...FIELD_SPRITES,
    ...BACKGROUND_SPRITES,
    ...UI_SPRITES,
  ]
}

/**
 * Get sprites by category
 */
export function getSpritesByCategory(category: SpritePrompt['category']): SpritePrompt[] {
  return getAllSpritePrompts().filter(s => s.category === category)
}

/**
 * Get sprite prompt by key
 */
export function getSpritePromptByKey(key: string): SpritePrompt | undefined {
  return getAllSpritePrompts().find((s) => s.key === key)
}

/**
 * Generate opponent runner with specific team colors
 */
export function getOpponentRunnerPrompt(
  baseType: 'normal' | 'fast' | 'tank' | 'zigzag',
  teamIndex: number
): SpritePrompt {
  const team = OPPONENT_PALETTES[teamIndex % OPPONENT_PALETTES.length]
  const base = RUNNER_SPRITES.find((s) => s.key === `runner-${baseType}`)!
  
  return {
    ...base,
    key: `runner-${baseType}-${team.name.toLowerCase()}`,
    name: `${team.name} ${base.name}`,
    prompt: base.prompt
      .replace(/gray jersey/gi, `${team.primary} jersey`)
      .replace(/yellow jersey/gi, `${team.primary} jersey`)
      .replace(/red jersey/gi, `${team.primary} jersey`)
      .replace(/green jersey/gi, `${team.primary} jersey`)
      + ` with ${team.accent} accent details`,
  }
}

/**
 * Get generation batch for a complete sprite set
 */
export function getSpriteBatch(type: 'minimal' | 'standard' | 'complete'): SpritePrompt[] {
  switch (type) {
    case 'minimal':
      return [
        ...DEFENDER_SPRITES.slice(0, 2),
        ...RUNNER_SPRITES,
        ...POWERUP_SPRITES.slice(0, 4),
      ]
    case 'standard':
      return [
        ...DEFENDER_SPRITES,
        ...RUNNER_SPRITES,
        ...POWERUP_SPRITES,
        ...FIELD_SPRITES,
      ]
    case 'complete':
      return getAllSpritePrompts()
    default:
      return getAllSpritePrompts()
  }
}
