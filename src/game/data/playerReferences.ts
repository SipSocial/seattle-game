/**
 * Player Reference Data with Actual Photo URLs for Accurate AI Generation
 * 
 * These are real player photos from official sources (NFL.com, Seahawks.com)
 * Used with Leonardo AI Character Reference for accurate likenesses
 */

export interface PlayerReference {
  jersey: number
  name: string
  position: string
  
  // Physical attributes for proportional rendering
  height: string
  heightInches: number
  weight: number
  build: 'lean' | 'athletic' | 'massive'
  
  // Reference photos
  headshotUrl: string        // Face reference
  fullBodyUrl?: string       // Body proportion reference
  
  // Physical description for prompts
  physicalDescription: string
  poseStyle: string          // Unique pose for variety
}

/**
 * DEFENSIVE STARTERS with verified reference photos
 */
export const PLAYER_REFERENCES: PlayerReference[] = [
  {
    jersey: 0,
    name: 'DeMarcus Lawrence',
    position: 'DE',
    height: '6-3',
    heightInches: 75,
    weight: 254,
    build: 'athletic',
    headshotUrl: 'https://static.www.nfl.com/image/private/f_auto/league/rjniavknilzwoxuin0po',
    physicalDescription: '6-3, 254 lbs, powerful athletic build with broad shoulders, muscular arms, dark skin, full beard, intense focused expression',
    poseStyle: 'defensive stance ready to rush, weight forward, hands ready',
  },
  {
    jersey: 99,
    name: 'Leonard Williams',
    position: 'DT',
    height: '6-5',
    heightInches: 77,
    weight: 310,
    build: 'massive',
    headshotUrl: 'https://static.www.nfl.com/image/upload/t_player_profile_landscape/f_auto/league/fxkmgmlnwv0gdl2c8t1g',
    physicalDescription: '6-5, 310 lbs, MASSIVE powerful frame, very tall, extremely broad shoulders, long arms, dark skin, goatee, imposing presence',
    poseStyle: 'standing tall with arms crossed, dominant posture, looking down at camera',
  },
  {
    jersey: 91,
    name: 'Byron Murphy II',
    position: 'NT',
    height: '6-0',
    heightInches: 72,
    weight: 306,
    build: 'massive',
    headshotUrl: '', // No reliable NFL headshot available
    physicalDescription: '6-0, 306 lbs, stocky powerful build, thick neck, low center of gravity, dark skin, clean-shaven, determined look, 7 sacks 2025',
    poseStyle: 'three-point stance, coiled and ready to explode, low to ground',
  },
  {
    jersey: 58,
    name: 'Derick Hall',
    position: 'RUSH',
    height: '6-3',
    heightInches: 75,
    weight: 254,
    build: 'athletic',
    headshotUrl: 'https://static.www.nfl.com/image/upload/t_player_profile_landscape/f_auto/league/clftxhugfcp2gqri0v3y',
    physicalDescription: '6-3, 254 lbs, lean explosive build, defined muscles, dark skin, short beard, hungry expression',
    poseStyle: 'speed rush stance, leaning forward aggressively, explosive first step ready',
  },
  {
    jersey: 7,
    name: 'Uchenna Nwosu',
    position: 'SLB',
    height: '6-2',
    heightInches: 74,
    weight: 265,
    build: 'athletic',
    headshotUrl: 'https://static.www.nfl.com/image/private/t_player_profile_landscape/f_auto/league/z6fbgjrfgltuiq1okiex',
    physicalDescription: '6-2, 265 lbs, athletic balanced build, dark skin, clean-shaven, focused and calm expression, 7 sacks 2025',
    poseStyle: 'linebacker coverage stance, balanced on balls of feet, reading the play',
  },
  {
    jersey: 13,
    name: 'Ernest Jones IV',
    position: 'MLB',
    height: '6-2',
    heightInches: 74,
    weight: 230,
    build: 'athletic',
    headshotUrl: 'https://static.www.nfl.com/image/private/t_player_profile_landscape/f_auto/league/mg6e3spfi0x2znzxr918',
    physicalDescription: '6-2, 230 lbs, compact muscular build, dark skin, short beard, captain leadership presence',
    poseStyle: 'pointing and calling defensive signals, commanding the defense',
  },
  {
    jersey: 42,
    name: 'Drake Thomas',
    position: 'WLB',
    height: '6-0',
    heightInches: 72,
    weight: 230,
    build: 'athletic',
    headshotUrl: '', // No reliable NFL headshot available
    physicalDescription: '6-0, 230 lbs, smaller but physical frame, light brown skin, clean-shaven, chip on shoulder attitude',
    poseStyle: 'blitzing stance, coming off the edge, aggressive attack mode',
  },
  {
    jersey: 21,
    name: 'Devon Witherspoon',
    position: 'CB',
    height: '6-0',
    heightInches: 72,
    weight: 185,
    build: 'lean',
    headshotUrl: 'https://static.www.nfl.com/image/private/f_auto/league/zmbnlawu8kebfownqlt0',
    physicalDescription: '6-0, 185 lbs, lean athletic build, long arms, dark skin, clean-shaven, confident swagger',
    poseStyle: 'press coverage stance, hands up ready to jam, elite corner posture',
  },
  {
    jersey: 29,
    name: 'Josh Jobe',
    position: 'CB',
    height: '5-11',
    heightInches: 71,
    weight: 190,
    build: 'lean',
    headshotUrl: '', // No reliable NFL headshot available
    physicalDescription: '5-11, 190 lbs, lean frame, dark skin, clean-shaven, focused intensity, 39 solo tackles 2025',
    poseStyle: 'backpedaling in coverage, eyes on quarterback, textbook CB technique',
  },
  {
    jersey: 20,
    name: 'Julian Love',
    position: 'S',
    height: '5-11',
    heightInches: 71,
    weight: 195,
    build: 'lean',
    headshotUrl: 'https://static.www.nfl.com/image/upload/t_player_profile_landscape/f_auto/league/aeodojl99cyqfh9ykmsa',
    physicalDescription: '5-11, 195 lbs, compact athletic build, medium brown skin, clean-shaven, smart cerebral look',
    poseStyle: 'deep safety read, scanning the field, quarterback of the secondary',
  },
  {
    jersey: 8,
    name: 'Coby Bryant',
    position: 'S',
    height: '6-1',
    heightInches: 73,
    weight: 193,
    build: 'lean',
    headshotUrl: 'https://static.www.nfl.com/image/upload/t_player_profile_landscape/f_auto/league/kqygk55yo1zil3w7bxgb',
    physicalDescription: '6-1, 193 lbs, rangy athletic frame, dark skin, clean-shaven, ball hawk instincts',
    poseStyle: 'intercepting a pass, jumping with arms extended, making the big play',
  },
  {
    jersey: 3,
    name: 'Nick Emmanwori',
    position: 'S',
    height: '6-3',
    heightInches: 75,
    weight: 220,
    build: 'athletic',
    headshotUrl: 'https://static.www.nfl.com/image/upload/t_player_profile_landscape/f_auto/league/nick-emmanwori-seahawks-2025',
    physicalDescription: '6-3, 220 lbs, tall rangy athletic frame, dark brown skin, clean-shaven, intense focus, Rookie of the Week 2025, 55 tackles, 2.5 sacks, 1 INT',
    poseStyle: 'attacking the line of scrimmage, explosive tackle form, Legion of Boom energy',
  },
]

/**
 * Generate the prompt for a player in the ORIGINAL GOOD STYLE
 * (Full body, dramatic stadium, less zoomed in, proportional to real body type)
 */
export function generateAccuratePlayerPrompt(player: PlayerReference): string {
  return `Photorealistic 3D render of NFL football player, Seattle Seahawks #${player.jersey} ${player.position}, ${player.physicalDescription}, ${player.poseStyle}, wearing Seattle Seahawks navy blue jersey with number ${player.jersey} clearly visible, Action Green #69BE28 accents, Seahawks helmet with chrome facemask, FULL BODY visible from head to knees, dramatic dark NFL stadium at night, volumetric fog and atmospheric lighting, stadium spotlights creating rim lighting behind player, moody cinematic atmosphere, Madden NFL 25 game quality, 8K ultra detailed, professional sports photography composition, player centered with space around them, NOT too zoomed in`
}

export const PLAYER_NEGATIVE_PROMPT = 'cartoon, anime, illustration, painting, blurry, low quality, distorted proportions, too zoomed in, cropped, wrong jersey color, wrong number, text overlay, watermark, duplicate limbs, deformed face, unrealistic lighting, close-up face shot, headshot only'

/**
 * Get player reference by jersey number
 */
export function getPlayerReference(jersey: number): PlayerReference | undefined {
  return PLAYER_REFERENCES.find(p => p.jersey === jersey)
}
