/**
 * Dark Side Superhero Prompts v2
 * 
 * OPTIMIZED based on the approved DeMarcus Lawrence reference image.
 * 
 * Key principles for consistent quality:
 * 1. SHORT, FOCUSED prompts (under 500 chars) - prevents face mushing
 * 2. BLANK jerseys - just colors and number, no logos
 * 3. Batman-level intimidation - cape, dark visor, mean stance
 * 4. Physical descriptions are BRIEF - just build type and skin tone
 * 5. Strong negative prompt to prevent AI from adding logos
 */

import { PLAYER_REFERENCES, type PlayerReference } from '@/src/game/data/playerReferences'
import { OFFENSE_PLAYER_PHYSICALS, type OffensePlayerPhysical } from '@/src/v3/lib/offensePlayerData'

// ============================================================================
// Dark Side Uniform Template - KEEP IT SIMPLE
// ============================================================================

/**
 * The CORE visual style that made the DeMarcus image great.
 * This is the foundation - player-specific details layer on top.
 */
const DARK_SIDE_CORE = {
  uniform: 'tactical navy blue #002244 football uniform with neon green #69BE28 stripe accents',
  helmet: 'navy football helmet with dark tinted visor completely covering face',
  cape: 'flowing navy cape',
  accessories: 'navy gloves, black cleats with green accents',
  number: 'large neon green jersey number',
  background: 'dark NFL stadium at night, volumetric fog, dramatic rim lighting',
  quality: '8K photorealistic, Madden NFL 25 quality render',
}

// ============================================================================
// Prompt Generator - SHORT BUT ACCURATE
// ============================================================================

/**
 * Generate Dark Side superhero prompt
 * 
 * CRITICAL: Include skin tone to get accurate player appearance
 * Keep other details minimal to prevent face artifacts
 */
export function generateDarkSidePrompt(
  jersey: number,
  position: string,
  skinTone: string,
  buildType: 'lean' | 'athletic' | 'massive' = 'athletic'
): string {
  // Map build to simple descriptor
  const build = buildType === 'massive' ? 'massive' : buildType === 'lean' ? 'lean' : 'athletic'
  
  // Include skin tone - this is essential for accurate player appearance
  const skinDesc = skinTone ? `${skinTone} skin, ` : ''
  
  // Short prompt with essential physical identifiers
  return `Photorealistic NFL superhero, ${skinDesc}${build} build, #${jersey} ${position}, ${DARK_SIDE_CORE.uniform}, ${DARK_SIDE_CORE.number} ${jersey}, ${DARK_SIDE_CORE.helmet}, ${DARK_SIDE_CORE.cape}, holding football, intimidating Batman-like stance, FULL BODY from helmet to cleats, ${DARK_SIDE_CORE.background}, ${DARK_SIDE_CORE.quality}`
}

/**
 * STRONG negative prompt - this is critical for quality
 * 
 * Key things to exclude:
 * - Logos (Nike swoosh, NFL shield, team wordmarks)
 * - Face issues (deformed, mushed, multiple faces)
 * - Quality issues (blurry, low res, cartoon)
 * - Composition issues (cropped, headshot only)
 */
export const DARK_SIDE_NEGATIVE_PROMPT = [
  // Face quality
  'deformed face', 'mushed face', 'blurry face', 'multiple faces', 'disfigured',
  // Logos - be explicit
  'Nike swoosh', 'NFL shield', 'team logo', 'brand logo', 'wordmark', 'text on jersey',
  // Style issues
  'cartoon', 'anime', 'illustration', 'painting', 'CGI', 'plastic', 'doll',
  // Quality issues
  'blurry', 'low quality', 'low resolution', 'pixelated', 'grainy',
  // Composition issues
  'cropped', 'headshot only', 'face only', 'close-up', 'partial body',
  // Background issues
  'white background', 'grey background', 'daytime', 'bright lighting',
  // Anatomy issues
  'extra limbs', 'missing limbs', 'wrong proportions',
].join(', ')

// ============================================================================
// Player-Specific Prompt Generators - WITH SKIN TONE
// ============================================================================

/**
 * Extract skin tone from physical description
 * Looks for patterns like "dark skin", "light skin", "brown skin"
 */
function extractSkinTone(physicalDescription: string): string {
  const match = physicalDescription.match(/(light|dark|dark brown|medium brown|light brown)\s*skin/i)
  if (match) return match[1]
  
  // Fallback: check for just the tone words in context
  if (physicalDescription.toLowerCase().includes('dark brown')) return 'dark brown'
  if (physicalDescription.toLowerCase().includes('dark skin')) return 'dark'
  if (physicalDescription.toLowerCase().includes('light skin')) return 'light'
  if (physicalDescription.toLowerCase().includes('medium brown')) return 'medium brown'
  
  return '' // Unknown - let AI decide
}

/**
 * Generate Dark Side prompt for a defensive player
 * Includes skin tone for accurate appearance
 */
export function generateDefensePrompt(player: PlayerReference): string {
  const skinTone = extractSkinTone(player.physicalDescription)
  
  return generateDarkSidePrompt(
    player.jersey,
    player.position,
    skinTone,
    player.build
  )
}

/**
 * Generate Dark Side prompt for an offensive player
 * Uses skinTone field directly from player data
 */
export function generateOffensePrompt(player: OffensePlayerPhysical): string {
  const buildMap: Record<string, 'lean' | 'athletic' | 'massive'> = {
    LEAN: 'lean',
    ATHLETIC: 'athletic',
    MASSIVE: 'massive',
  }
  
  return generateDarkSidePrompt(
    player.jersey,
    player.position,
    player.skinTone, // Use the explicit skinTone field
    buildMap[player.build] || 'athletic'
  )
}

/**
 * Get player data by jersey and type
 */
export function getPlayerForPrompt(jersey: number, type: 'defense' | 'offense'): {
  prompt: string
  negativePrompt: string
  player: PlayerReference | OffensePlayerPhysical | null
} {
  if (type === 'defense') {
    const player = PLAYER_REFERENCES.find(p => p.jersey === jersey)
    if (player) {
      return {
        prompt: generateDefensePrompt(player),
        negativePrompt: DARK_SIDE_NEGATIVE_PROMPT,
        player,
      }
    }
  } else {
    const player = OFFENSE_PLAYER_PHYSICALS.find(p => p.jersey === jersey)
    if (player) {
      return {
        prompt: generateOffensePrompt(player),
        negativePrompt: DARK_SIDE_NEGATIVE_PROMPT,
        player,
      }
    }
  }
  
  return { prompt: '', negativePrompt: DARK_SIDE_NEGATIVE_PROMPT, player: null }
}

// ============================================================================
// All Players Combined
// ============================================================================

export interface DarkSidePlayer {
  jersey: number
  name: string
  position: string
  type: 'defense' | 'offense'
  headshotUrl?: string
  physicalDescription: string
  poseStyle: string
  build: 'lean' | 'athletic' | 'massive'
  skinTone: string // Added for accurate player appearance
}

/**
 * Get all Dark Side players (defense + offense)
 */
export function getAllDarkSidePlayers(): DarkSidePlayer[] {
  const defensePlayers: DarkSidePlayer[] = PLAYER_REFERENCES.map(p => ({
    jersey: p.jersey,
    name: p.name,
    position: p.position,
    type: 'defense' as const,
    headshotUrl: p.headshotUrl,
    physicalDescription: p.physicalDescription,
    poseStyle: p.poseStyle,
    build: p.build,
    skinTone: extractSkinTone(p.physicalDescription), // Extract from description
  }))

  const offensePlayers: DarkSidePlayer[] = OFFENSE_PLAYER_PHYSICALS.map(p => ({
    jersey: p.jersey,
    name: p.name,
    position: p.position,
    type: 'offense' as const,
    headshotUrl: p.headshotUrl,
    physicalDescription: p.physicalDescription,
    poseStyle: p.poseStyle,
    build: (p.build === 'LEAN' ? 'lean' : p.build === 'MASSIVE' ? 'massive' : 'athletic') as 'lean' | 'athletic' | 'massive',
    skinTone: p.skinTone, // Use explicit field
  }))

  return [...defensePlayers, ...offensePlayers]
}

/**
 * Generate prompt for any Dark Side player
 * Using simplified template with skin tone for accuracy
 */
export function generatePromptForPlayer(player: DarkSidePlayer): string {
  return generateDarkSidePrompt(
    player.jersey,
    player.position,
    player.skinTone, // Include skin tone for accurate appearance
    player.build
  )
}

// ============================================================================
// OPPONENT TEAM HELMET PROMPTS
// ============================================================================

export interface OpponentTeam {
  id: number
  teamName: string
  abbreviation: string
  primaryColor: string      // Hex code for UI display
  accentColor: string       // Hex code for UI display
  primaryColorName: string  // Human-readable for AI prompts
  accentColorName: string   // Human-readable for AI prompts
  helmetImage?: string
}

/**
 * Generate helmet prompt for an opponent team
 * 
 * Style matches Dark Side quality - photorealistic, dark stadium, dramatic lighting
 * NO LOGOS - just solid team colors, like the Dark Side player uniforms
 * Uses human-readable color names for better AI understanding
 */
export function generateHelmetPrompt(team: OpponentTeam): string {
  return `Photorealistic NFL football helmet, solid ${team.primaryColorName} helmet color with ${team.accentColorName} accent stripe down center, NO logos NO decals NO text NO emblems, clean solid color design, glossy reflective surface, chrome grey facemask, 3/4 front angle view, dark NFL stadium background with volumetric fog, dramatic rim lighting, 8K photorealistic, Madden NFL 25 quality`
}

/**
 * Negative prompt for helmet generation
 * STRONG logo blocking to keep helmets clean like Dark Side uniforms
 */
export const HELMET_NEGATIVE_PROMPT = [
  // LOGOS - be very explicit
  'team logo', 'NFL logo', 'brand logo', 'decal', 'sticker', 'emblem', 'mascot', 'team name',
  'letters', 'numbers', 'text on helmet', 'wordmark',
  // Quality issues
  'blurry', 'low quality', 'low resolution', 'pixelated', 'grainy', 'noisy',
  // Style issues
  'cartoon', 'anime', 'illustration', 'painting', 'sketch', 'drawing',
  // Color issues
  'wrong colors', 'faded colors', 'desaturated',
  // Composition issues
  'multiple helmets', 'cropped', 'partial helmet', 'cut off',
  // Background issues
  'white background', 'grey background', 'bright background', 'daytime',
  // Deformation
  'deformed', 'distorted', 'warped', 'bent', 'crushed',
  // Text
  'text', 'watermark', 'signature', 'words',
].join(', ')

/**
 * Get all unique opponent teams from the campaign
 * De-duplicated by abbreviation since some teams appear multiple times
 * Includes human-readable color names for AI prompts
 */
export function getUniqueOpponentTeams(): OpponentTeam[] {
  return [
    { id: 1, teamName: 'San Francisco 49ers', abbreviation: 'SF', primaryColor: '#AA0000', accentColor: '#B3995D', primaryColorName: 'scarlet red', accentColorName: 'metallic gold' },
    { id: 2, teamName: 'Pittsburgh Steelers', abbreviation: 'PIT', primaryColor: '#FFB612', accentColor: '#101820', primaryColorName: 'gold yellow', accentColorName: 'black' },
    { id: 3, teamName: 'New Orleans Saints', abbreviation: 'NO', primaryColor: '#D3BC8D', accentColor: '#101820', primaryColorName: 'old gold', accentColorName: 'black' },
    { id: 4, teamName: 'Arizona Cardinals', abbreviation: 'ARI', primaryColor: '#97233F', accentColor: '#FFB612', primaryColorName: 'cardinal red', accentColorName: 'gold yellow' },
    { id: 5, teamName: 'Tampa Bay Buccaneers', abbreviation: 'TB', primaryColor: '#D50A0A', accentColor: '#34302B', primaryColorName: 'red', accentColorName: 'pewter grey' },
    { id: 6, teamName: 'Jacksonville Jaguars', abbreviation: 'JAX', primaryColor: '#006778', accentColor: '#D7A22A', primaryColorName: 'teal', accentColorName: 'gold' },
    { id: 7, teamName: 'Houston Texans', abbreviation: 'HOU', primaryColor: '#03202F', accentColor: '#A71930', primaryColorName: 'deep navy blue', accentColorName: 'battle red' },
    { id: 8, teamName: 'Washington Commanders', abbreviation: 'WAS', primaryColor: '#5A1414', accentColor: '#FFB612', primaryColorName: 'burgundy', accentColorName: 'gold' },
    { id: 10, teamName: 'Los Angeles Rams', abbreviation: 'LAR', primaryColor: '#003594', accentColor: '#FFA300', primaryColorName: 'royal blue', accentColorName: 'sol yellow' },
    { id: 11, teamName: 'Tennessee Titans', abbreviation: 'TEN', primaryColor: '#4B92DB', accentColor: '#0C2340', primaryColorName: 'titans blue', accentColorName: 'navy' },
    { id: 12, teamName: 'Minnesota Vikings', abbreviation: 'MIN', primaryColor: '#4F2683', accentColor: '#FFC62F', primaryColorName: 'purple', accentColorName: 'gold yellow' },
    { id: 13, teamName: 'Atlanta Falcons', abbreviation: 'ATL', primaryColor: '#A71930', accentColor: '#000000', primaryColorName: 'falcon red', accentColorName: 'black' },
    { id: 14, teamName: 'Indianapolis Colts', abbreviation: 'IND', primaryColor: '#002C5F', accentColor: '#A2AAAD', primaryColorName: 'royal blue', accentColorName: 'silver grey' },
    { id: 16, teamName: 'Carolina Panthers', abbreviation: 'CAR', primaryColor: '#0085CA', accentColor: '#101820', primaryColorName: 'panther blue', accentColorName: 'black' },
    { id: 20, teamName: 'New England Patriots', abbreviation: 'NE', primaryColor: '#002244', accentColor: '#C60C30', primaryColorName: 'navy blue', accentColorName: 'red' },
  ]
}
