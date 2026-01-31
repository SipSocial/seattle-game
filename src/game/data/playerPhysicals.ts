/**
 * Player Physical Attributes for Accurate AI Generation
 * Used with Leonardo AI Character Reference to generate proportionally accurate players
 * 
 * Build Types:
 * - LEAN: Lighter, fast players (CBs, Safeties) - emphasize speed/agility
 * - ATHLETIC: Medium build, balanced (LBs, Edge rushers) - powerful but mobile
 * - MASSIVE: Heavy, powerful players (DTs, NTs) - emphasize size/strength
 */

export type BuildType = 'LEAN' | 'ATHLETIC' | 'MASSIVE'

export interface PlayerPhysical {
  jersey: number
  name: string
  position: string
  height: string      // e.g., "6-3"
  heightInches: number // total inches for calculations
  weight: number      // lbs
  age: number
  build: BuildType
  skinTone: string    // for accurate representation
  facialHair?: string // beard, goatee, clean-shaven
  distinctFeatures?: string[] // dreads, tattoos, etc.
  college: string
  experience: number  // NFL years
  // Reference photo URLs (to be populated)
  headshotUrl?: string
  actionPhotoUrl?: string
}

// Defensive Starters - Verified Physical Stats
export const PLAYER_PHYSICALS: PlayerPhysical[] = [
  // DEFENSIVE LINE
  {
    jersey: 0,
    name: 'DeMarcus Lawrence',
    position: 'DE',
    height: '6-3',
    heightInches: 75,
    weight: 254,
    age: 33,
    build: 'ATHLETIC',
    skinTone: 'dark brown',
    facialHair: 'full beard',
    distinctFeatures: ['muscular arms', 'intense expression'],
    college: 'Boise State',
    experience: 12,
  },
  {
    jersey: 99,
    name: 'Leonard Williams',
    position: 'DT',
    height: '6-5',
    heightInches: 77,
    weight: 310,
    age: 31,
    build: 'MASSIVE',
    skinTone: 'dark brown',
    facialHair: 'goatee',
    distinctFeatures: ['very tall', 'broad shoulders', 'long arms'],
    college: 'USC',
    experience: 11,
  },
  {
    jersey: 91,
    name: 'Byron Murphy II',
    position: 'NT',
    height: '6-1',
    heightInches: 73,
    weight: 295,
    age: 26,
    build: 'MASSIVE',
    skinTone: 'dark brown',
    facialHair: 'clean-shaven',
    distinctFeatures: ['stocky build', 'low center of gravity'],
    college: 'Texas',
    experience: 4,
  },
  
  // LINEBACKERS
  {
    jersey: 58,
    name: 'Derick Hall',
    position: 'RUSH',
    height: '6-3',
    heightInches: 75,
    weight: 254,
    age: 25,
    build: 'ATHLETIC',
    skinTone: 'dark brown',
    facialHair: 'short beard',
    distinctFeatures: ['lean but powerful', 'explosive stance'],
    college: 'Auburn',
    experience: 3,
  },
  {
    jersey: 7,
    name: 'Uchenna Nwosu',
    position: 'SLB',
    height: '6-2',
    heightInches: 74,
    weight: 251,
    age: 28,
    build: 'ATHLETIC',
    skinTone: 'dark brown',
    facialHair: 'clean-shaven',
    distinctFeatures: ['athletic frame', 'quick first step'],
    college: 'USC',
    experience: 7,
  },
  {
    jersey: 13,
    name: 'Ernest Jones IV',
    position: 'MLB',
    height: '6-2',
    heightInches: 74,
    weight: 230,
    age: 27,
    build: 'ATHLETIC',
    skinTone: 'dark brown',
    facialHair: 'short beard',
    distinctFeatures: ['compact build', 'intense focus'],
    college: 'South Carolina',
    experience: 5,
  },
  {
    jersey: 42,
    name: 'Drake Thomas',
    position: 'WLB',
    height: '6-0',
    heightInches: 72,
    weight: 230,
    age: 25,
    build: 'ATHLETIC',
    skinTone: 'light brown',
    facialHair: 'clean-shaven',
    distinctFeatures: ['agile', 'undersized but physical'],
    college: 'NC State',
    experience: 3,
  },
  
  // CORNERBACKS
  {
    jersey: 21,
    name: 'Devon Witherspoon',
    position: 'CB',
    height: '6-0',
    heightInches: 72,
    weight: 185,
    age: 25,
    build: 'LEAN',
    skinTone: 'dark brown',
    facialHair: 'clean-shaven',
    distinctFeatures: ['slim athletic build', 'long arms', 'confident demeanor'],
    college: 'Illinois',
    experience: 3,
  },
  {
    jersey: 29,
    name: 'Josh Jobe',
    position: 'CB',
    height: '6-1',
    heightInches: 73,
    weight: 192,
    age: 26,
    build: 'LEAN',
    skinTone: 'dark brown',
    facialHair: 'clean-shaven',
    distinctFeatures: ['long and lean', 'athletic'],
    college: 'Alabama',
    experience: 3,
  },
  
  // SAFETIES
  {
    jersey: 20,
    name: 'Julian Love',
    position: 'S',
    height: '5-11',
    heightInches: 71,
    weight: 195,
    age: 27,
    build: 'LEAN',
    skinTone: 'medium brown',
    facialHair: 'clean-shaven',
    distinctFeatures: ['quick feet', 'smart player'],
    college: 'Notre Dame',
    experience: 6,
  },
  {
    jersey: 8,
    name: 'Coby Bryant',
    position: 'S',
    height: '6-1',
    heightInches: 73,
    weight: 193,
    age: 26,
    build: 'LEAN',
    skinTone: 'dark brown',
    facialHair: 'clean-shaven',
    distinctFeatures: ['rangy', 'ball hawk'],
    college: 'Cincinnati',
    experience: 4,
  },
]

// Helper functions
export function getPlayerPhysical(jersey: number): PlayerPhysical | undefined {
  return PLAYER_PHYSICALS.find(p => p.jersey === jersey)
}

export function getBuildDescription(build: BuildType): string {
  switch (build) {
    case 'LEAN':
      return 'lean athletic build, toned muscles, fast and agile physique'
    case 'ATHLETIC':
      return 'muscular athletic build, powerful shoulders, balanced physique'
    case 'MASSIVE':
      return 'massive powerful build, very broad shoulders, intimidating size, heavy muscular frame'
  }
}

export function getPhysicalPrompt(player: PlayerPhysical): string {
  const buildDesc = getBuildDescription(player.build)
  const features = player.distinctFeatures?.join(', ') || ''
  
  return `${player.height} tall, ${player.weight} lbs, ${buildDesc}, ${player.skinTone} skin, ${player.facialHair || 'clean-shaven'}, ${features}`
}

/**
 * Generate Leonardo prompt for accurate player rendering
 */
export function generatePlayerPrompt(player: PlayerPhysical, style: 'fullscreen' | 'card' | 'action' = 'fullscreen'): string {
  const physicalDesc = getPhysicalPrompt(player)
  
  const basePrompt = `Photorealistic 3D render of NFL football player, Seattle Seahawks #${player.jersey}, ${player.position}, ${physicalDesc}`
  
  const stylePrompts = {
    fullscreen: `${basePrompt}, wearing navy blue Seattle Seahawks jersey with neon green accents, dramatic stadium lighting, dark atmospheric background with volumetric fog and spotlights, powerful confident pose, Madden NFL game quality, 8K cinematic sports photography, full body shot from waist up`,
    
    card: `${basePrompt}, professional headshot portrait, wearing Seattle Seahawks navy jersey, studio lighting, grey gradient background, sharp focus on face, trading card quality, upper body shot`,
    
    action: `${basePrompt}, dynamic action pose, mid-tackle or rush motion, Seattle Seahawks navy jersey with green trim, motion blur background, stadium atmosphere, sports photography, intense expression, full body in motion`
  }
  
  return stylePrompts[style]
}

/**
 * Negative prompt to avoid common issues
 */
export const PLAYER_NEGATIVE_PROMPT = 'cartoon, anime, illustration, painting, blurry, low quality, distorted proportions, wrong jersey color, wrong number, text overlay, watermark, duplicate limbs, deformed face, unrealistic lighting'
