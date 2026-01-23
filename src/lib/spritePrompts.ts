/**
 * Sprite Generation Prompts for Seattle Darkside
 * Designed for consistent 2D pixel art character sprites
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

// Seattle Darkside colors
const SEATTLE_COLORS = {
  jersey: '#0F6E6A',
  accent: '#7ED957',
  trim: '#0B1F24',
}

/**
 * Defensive Lineman Sprite Prompts
 * All sprites are side-view facing right, transparent background
 */
export const DEFENDER_SPRITES: SpritePrompt[] = [
  {
    name: 'Idle Pose',
    key: 'defender-idle',
    prompt: `2D pixel football defensive lineman idle pose, side-view facing right, athletic stance, knees bent, arms relaxed but ready, helmet on, shoulder pads visible, jersey color ${SEATTLE_COLORS.jersey} with accent ${SEATTLE_COLORS.accent}, helmet trim ${SEATTLE_COLORS.trim}, no logos, no text, transparent background, designed for 48x48 or 64x64 sprite grid, clean readable silhouette`,
    width: 64,
    height: 64,
    frameCount: 1,
    description: 'Default standing pose for menu and idle states',
  },
  {
    name: 'Walking Frame',
    key: 'defender-walk',
    prompt: `2D pixel football defensive lineman walking animation frame, side-view facing right, forward stride, slight arm swing, confident posture, same uniform colors (${SEATTLE_COLORS.jersey} jersey, ${SEATTLE_COLORS.accent} accents, ${SEATTLE_COLORS.trim} trim), designed as one frame in a looping walk cycle, transparent background, consistent scale with idle frame`,
    width: 64,
    height: 64,
    frameCount: 4,
    description: 'Walking animation for Road scene march',
  },
  {
    name: 'Running Frame',
    key: 'defender-run',
    prompt: `2D pixel football defensive lineman running animation frame, side-view facing right, aggressive forward lean, arms pumping, legs mid-stride, same Seattle Darkside colors, designed as one frame in a 5-6 frame run loop, no motion blur, transparent background, consistent proportions`,
    width: 64,
    height: 64,
    frameCount: 6,
    description: 'Running animation for fast movement',
  },
  {
    name: 'Pushing Frame',
    key: 'defender-push',
    prompt: `2D pixel football defensive lineman pushing animation frame, side-view facing right, low powerful stance, both arms extended forward as if pushing an opponent, intense posture, helmet lowered, same uniform colors, designed as one frame of a clash animation loop, transparent background`,
    width: 64,
    height: 64,
    frameCount: 3,
    description: 'Clash scene pushing animation',
  },
  {
    name: 'Breakthrough Frame',
    key: 'defender-breakthrough',
    prompt: `2D pixel football defensive lineman breakthrough animation frame, side-view facing right, explosive forward movement, arms driving through, chest up, victorious energy, same uniform colors, designed as a single impact frame, transparent background`,
    width: 64,
    height: 64,
    frameCount: 1,
    description: 'Victory breakthrough moment in clash',
  },
  {
    name: 'Sack Celebration',
    key: 'defender-sack',
    prompt: `2D pixel football defensive lineman sack celebration frame, side-view facing right, holding football securely, slightly crouched or triumphant stance, confident body language, same Seattle Darkside colors, no violence depiction, transparent background`,
    width: 64,
    height: 64,
    frameCount: 1,
    description: 'Post-sack celebration with ball',
  },
  {
    name: 'Victory Celebration',
    key: 'defender-celebrate',
    prompt: `2D pixel football defensive lineman celebration animation frame, side-view facing right, arms raised or flexed, proud victorious posture, helmet on, same uniform colors, designed as loopable celebration frame, transparent background`,
    width: 64,
    height: 64,
    frameCount: 2,
    description: 'Victory scene celebration loop',
  },
]

/**
 * Generate opponent version of a sprite prompt
 */
export function getOpponentSpritePrompt(
  basePrompt: SpritePrompt,
  teamColors: { primary: string; secondary: string; trim: string }
): SpritePrompt {
  // Replace Seattle colors with opponent colors
  let modifiedPrompt = basePrompt.prompt
    .replace(new RegExp(SEATTLE_COLORS.jersey, 'gi'), teamColors.primary)
    .replace(new RegExp(SEATTLE_COLORS.accent, 'gi'), teamColors.secondary)
    .replace(new RegExp(SEATTLE_COLORS.trim, 'gi'), teamColors.trim)
    .replace(/Seattle Darkside/gi, 'opponent team')

  return {
    ...basePrompt,
    key: basePrompt.key.replace('defender', 'opponent'),
    prompt: modifiedPrompt,
  }
}

/**
 * Additional game asset prompts
 */
export const GAME_OBJECT_SPRITES: SpritePrompt[] = [
  {
    name: 'Football',
    key: 'football',
    prompt:
      '2D pixel art American football, brown leather with white laces, side view, designed for 32x32 sprite, clean edges, transparent background, game asset style',
    width: 32,
    height: 32,
    description: 'Football for sack and turnover scenes',
  },
  {
    name: 'QB Placeholder',
    key: 'qb-down',
    prompt:
      '2D pixel art football quarterback fallen down, side view, red jersey, lying on ground after sack, defeated pose, transparent background, 64x64 sprite',
    width: 64,
    height: 64,
    description: 'QB down after sack animation',
  },
  {
    name: 'Trophy',
    key: 'trophy',
    prompt:
      '2D pixel art golden championship trophy, football theme, shiny metallic gold, front view, 64x64 sprite, game asset, transparent background',
    width: 64,
    height: 64,
    description: 'Super Bowl trophy for victory scene',
  },
  {
    name: 'Confetti',
    key: 'confetti',
    prompt:
      '2D pixel art confetti pieces, various colors including gold green and teal, scattered celebration particles, designed for particle effect, transparent background',
    width: 32,
    height: 32,
    description: 'Victory celebration particles',
  },
]

/**
 * Power-up icon sprites
 */
export const POWERUP_SPRITES: SpritePrompt[] = [
  {
    name: 'Power Surge',
    key: 'powerup-lightning',
    prompt:
      '2D pixel art lightning bolt icon, electric blue and yellow glow, power symbol, 32x32 game UI icon, clean edges, transparent background',
    width: 32,
    height: 32,
    description: 'Double tap power icon',
  },
  {
    name: 'Time Extension',
    key: 'powerup-clock',
    prompt:
      '2D pixel art clock icon, golden with teal accents, +2 time symbol feel, 32x32 game UI icon, clean edges, transparent background',
    width: 32,
    height: 32,
    description: 'Extra time icon',
  },
  {
    name: 'Head Start',
    key: 'powerup-rocket',
    prompt:
      '2D pixel art rocket icon, teal and green colors, upward trajectory, speed lines, 32x32 game UI icon, clean edges, transparent background',
    width: 32,
    height: 32,
    description: 'Starting meter boost icon',
  },
  {
    name: 'Momentum Boost',
    key: 'powerup-momentum',
    prompt:
      '2D pixel art forward arrow icon, green glowing, motion trails, momentum symbol, 32x32 game UI icon, clean edges, transparent background',
    width: 32,
    height: 32,
    description: 'Slower decay icon',
  },
  {
    name: 'Extra Lineman',
    key: 'powerup-shield',
    prompt:
      '2D pixel art shield icon with plus symbol, teal and silver, protective emblem, 32x32 game UI icon, clean edges, transparent background',
    width: 32,
    height: 32,
    description: 'Extra lineman passive boost icon',
  },
]

/**
 * Get all sprite prompts
 */
export function getAllSpritePrompts(): SpritePrompt[] {
  return [...DEFENDER_SPRITES, ...GAME_OBJECT_SPRITES, ...POWERUP_SPRITES]
}

/**
 * Get sprite prompt by key
 */
export function getSpritePromptByKey(key: string): SpritePrompt | undefined {
  return getAllSpritePrompts().find((s) => s.key === key)
}
