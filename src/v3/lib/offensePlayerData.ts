/**
 * Offensive Player Physical Data for V3
 * 
 * Complete physical attributes and reference data for offensive starters
 * Used with Leonardo AI for accurate Dark Side uniform generation
 */

import type { BuildType } from '@/src/game/data/playerPhysicals'

export interface OffensePlayerPhysical {
  jersey: number
  name: string
  position: 'QB' | 'RB' | 'WR' | 'TE'
  height: string
  heightInches: number
  weight: number
  age: number
  build: BuildType
  skinTone: string
  facialHair?: string
  distinctFeatures?: string[]
  college: string
  experience: number
  
  // Reference photos for Character Reference generation
  headshotUrl?: string
  fullBodyUrl?: string
  
  // Pose style for variation
  poseStyle: string
  
  // Physical description for prompts
  physicalDescription: string
}

/**
 * OFFENSIVE STARTERS - Complete Physical Data
 * 
 * These are the key players for V3 offense mode
 */
export const OFFENSE_PLAYER_PHYSICALS: OffensePlayerPhysical[] = [
  // ========== QUARTERBACK ==========
  {
    jersey: 14,
    name: 'Sam Darnold',
    position: 'QB',
    height: '6-3',
    heightInches: 75,
    weight: 225,
    age: 28,
    build: 'ATHLETIC',
    skinTone: 'light',
    facialHair: 'light stubble',
    distinctFeatures: ['strong jaw', 'athletic frame', 'confident demeanor'],
    college: 'USC',
    experience: 8,
    // Real NFL headshot URL - Sam Darnold
    headshotUrl: 'https://static.www.nfl.com/image/private/f_auto/league/qdmxzlzpz7qsrxzrqxnm',
    poseStyle: 'quarterback dropback stance, ball raised, scanning downfield, ready to throw',
    physicalDescription: '6-3, 225 lbs, athletic QB build, light skin, light stubble, strong jaw, confident demeanor, poised in pocket',
  },
  
  // ========== WIDE RECEIVERS ==========
  {
    jersey: 11,
    name: 'Jaxon Smith-Njigba',
    position: 'WR',
    height: '6-0',
    heightInches: 72,
    weight: 197,
    age: 23,
    build: 'LEAN',
    skinTone: 'dark brown',
    facialHair: 'clean-shaven',
    distinctFeatures: ['quick feet', 'precise routes', 'sure hands', 'young star', 'NFL receptions leader'],
    college: 'Ohio State',
    experience: 3,
    // Real NFL headshot URL - Jaxon Smith-Njigba
    headshotUrl: 'https://static.www.nfl.com/image/private/f_auto/league/pln4ythvlqlpm0y7yosv',
    poseStyle: 'explosive route-running stance, arms pumping, bursting off the line',
    physicalDescription: '6-0, 197 lbs, lean explosive receiver build, dark brown skin, clean-shaven young face, quick agile movements, elite route runner',
  },
  {
    jersey: 10,
    name: 'Cooper Kupp',
    position: 'WR',
    height: '6-2',
    heightInches: 74,
    weight: 205, // Updated 2025
    age: 32,
    build: 'ATHLETIC',
    skinTone: 'light',
    facialHair: 'beard',
    distinctFeatures: ['precise route runner', 'strong hands', 'veteran presence', 'Super Bowl MVP'],
    college: 'Eastern Washington',
    experience: 9, // Updated 2025
    // Real NFL headshot URL - Cooper Kupp
    headshotUrl: 'https://static.www.nfl.com/image/private/f_auto/league/bszivnclruuynpwzusxi',
    poseStyle: 'crisp route-running form, head turned looking for ball, veteran technique',
    physicalDescription: '6-2, 205 lbs, athletic receiver build, light skin, full beard, veteran wide receiver, championship pedigree, precise movements',
  },
  
  // ========== TIGHT END ==========
  {
    jersey: 88,
    name: 'AJ Barner',
    position: 'TE',
    height: '6-6', // Updated 2025
    heightInches: 78, // Updated 2025
    weight: 251, // Updated 2025
    age: 23,
    build: 'ATHLETIC',
    skinTone: 'light',
    facialHair: 'clean-shaven',
    distinctFeatures: ['tall frame', 'good hands', 'blocking ability', 'young talent', '519 rec yards 2025'],
    college: 'Michigan',
    experience: 2,
    // NFL landscape image - AJ Barner
    headshotUrl: 'https://static.www.nfl.com/image/upload/t_player_profile_landscape/f_auto/league/ul77k5rqbqzd5zzqsaea',
    poseStyle: 'pass-catching stance, hands ready, athletic blocking posture',
    physicalDescription: '6-6, 251 lbs, tall athletic tight end build, light skin, clean-shaven, emerging young weapon, big target',
  },
  
  // ========== RUNNING BACK ==========
  {
    jersey: 9,
    name: 'Kenneth Walker III',
    position: 'RB',
    height: '5-9',
    heightInches: 69,
    weight: 211,
    age: 25,
    build: 'ATHLETIC',
    skinTone: 'dark brown',
    facialHair: 'clean-shaven',
    distinctFeatures: ['explosive speed', 'powerful legs', 'elusive runner', 'home run threat'],
    college: 'Michigan State',
    experience: 4,
    // Real NFL headshot URL - Kenneth Walker III
    headshotUrl: 'https://static.www.nfl.com/image/private/f_auto/league/dwfmmd0eoqozpxilb36w',
    poseStyle: 'ball-carrier stance, football tucked, ready to explode through hole',
    physicalDescription: '5-9, 211 lbs, compact powerful running back build, dark brown skin, clean-shaven, explosive legs, game-breaking speed, low center of gravity',
  },
]

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get offensive player physical data by jersey number
 */
export function getOffensePlayerPhysical(jersey: number): OffensePlayerPhysical | undefined {
  return OFFENSE_PLAYER_PHYSICALS.find(p => p.jersey === jersey)
}

/**
 * Get build description for prompts
 */
export function getOffenseBuildDescription(build: BuildType): string {
  switch (build) {
    case 'LEAN':
      return 'lean athletic build, toned muscles, fast and agile physique'
    case 'ATHLETIC':
      return 'muscular athletic build, powerful shoulders, balanced physique'
    case 'MASSIVE':
      return 'massive powerful build, very broad shoulders, intimidating size'
  }
}

/**
 * Generate Dark Side uniform prompt for an offensive player
 * 
 * UPDATED: Includes skin tone for accurate player appearance
 */
export function generateDarkSideOffensePrompt(player: OffensePlayerPhysical): string {
  const build = player.build === 'MASSIVE' ? 'massive' : player.build === 'LEAN' ? 'lean' : 'athletic'
  
  // Include skin tone - essential for accurate player appearance
  return `Photorealistic NFL superhero, ${player.skinTone} skin, ${build} build, #${player.jersey} ${player.position}, tactical navy blue #002244 football uniform with neon green #69BE28 stripe accents, large neon green jersey number ${player.jersey}, navy football helmet with dark tinted visor completely covering face, flowing navy cape, holding football, intimidating Batman-like stance, FULL BODY from helmet to cleats, dark NFL stadium at night, volumetric fog, dramatic rim lighting, 8K photorealistic, Madden NFL 25 quality render`
}

/**
 * Negative prompt for offense players - same as defense
 */
export const OFFENSE_NEGATIVE_PROMPT = [
  'deformed face', 'mushed face', 'blurry face', 'multiple faces', 'disfigured',
  'Nike swoosh', 'NFL shield', 'team logo', 'brand logo', 'wordmark', 'text on jersey',
  'cartoon', 'anime', 'illustration', 'painting', 'CGI', 'plastic', 'doll',
  'blurry', 'low quality', 'low resolution', 'pixelated', 'grainy',
  'cropped', 'headshot only', 'face only', 'close-up', 'partial body',
  'white background', 'grey background', 'daytime', 'bright lighting',
  'extra limbs', 'missing limbs', 'wrong proportions',
].join(', ')

// ============================================================================
// Exports
// ============================================================================

export const OFFENSE_STARTERS = OFFENSE_PLAYER_PHYSICALS.filter(p => 
  [14, 11, 10, 88, 9].includes(p.jersey)
)

export const DEFAULT_QB_JERSEY = 14
export const STARTING_RECEIVER_JERSEYS = [11, 10, 88]
export const STARTING_RB_JERSEY = 9
