/**
 * SEATTLE SEAHAWKS DEFENSE - Road to the Super Bowl
 * 
 * Campaign Structure based on ACTUAL 2025 Seattle Seahawks Schedule:
 * - Preseason tutorial game
 * - 17 Regular Season games
 * - Divisional Playoff
 * - Conference Championship
 * - Super Bowl
 * 
 * Each stage represents a real opponent from the schedule
 */

export interface StageLocation {
  city: string
  state: string
  abbreviation: string
  coordinates: { x: number; y: number } // Normalized 0-1 position on US map
  isHome: boolean // True if game is in Seattle
}

export interface StageWeather {
  type: 'clear' | 'rain' | 'snow' | 'fog' | 'wind' | 'heat' | 'night'
  intensity: number // 0-1
  particles?: boolean
}

export interface OpponentColors {
  primary: number // Main runner color
  accent: number // Secondary/highlight color
  name: string // Team name for display
}

export interface StageVisuals {
  skyGradient: [string, string] // Top to bottom gradient
  fieldTint: string
  atmosphereColor: string
  landmarks: string[] // Silhouette descriptions for Leonardo AI
  weather: StageWeather
  crowdIntensity: number // 0-1, affects audio and visual crowd
  opponent: OpponentColors // Colors for enemy runners this stage
}

export interface StagePrompt {
  background: string // Leonardo AI prompt for stage background
  atmosphere: string // Leonardo AI prompt for particle/atmosphere overlay
}

export interface CampaignStage {
  id: number
  name: string
  weekLabel: string // e.g., "Week 1", "Preseason", "Divisional"
  location: StageLocation
  description: string
  gamesRequired: number // Games to complete this stage (default 3)
  difficulty: number // 1-10 multiplier for enemy speed/spawn rate
  visuals: StageVisuals
  prompts: StagePrompt
  unlockMessage: string
  isPlayoff: boolean
  isSuperBowl: boolean
  isTutorial: boolean
}

// Games per stage (can be adjusted for pacing)
export const GAMES_PER_STAGE = 3
export const TOTAL_STAGES = 20 // 17 Regular Season + 2 Playoffs + Super Bowl
export const TOTAL_GAMES = GAMES_PER_STAGE * TOTAL_STAGES // 60 games

/**
 * 2025 Seattle Seahawks Schedule - ACTUAL GAMES
 * 
 * Note: Tutorial/Training Camp is handled by TutorialScene (separate from campaign)
 * Campaign starts at Week 1 vs 49ers
 */
export const CAMPAIGN_STAGES: CampaignStage[] = [
  // ===== WEEK 1: vs 49ers (HOME) - SEASON OPENER =====
  {
    id: 1,
    name: 'Rivalry Renewed',
    weekLabel: 'Week 1',
    location: {
      city: 'Seattle',
      state: 'Washington',
      abbreviation: 'SEA',
      coordinates: { x: 0.12, y: 0.15 },
      isHome: true,
    },
    description: 'Season opener vs the hated 49ers. The 12th Man is LOUD.',
    gamesRequired: 3,
    difficulty: 2,
    visuals: {
      skyGradient: ['#1a2a3a', '#2d4a5a'],
      fieldTint: '#2a5a3a',
      atmosphereColor: '#69BE28',
      landmarks: ['Space Needle', 'Mount Rainier', 'Lumen Field'],
      weather: { type: 'rain', intensity: 0.4, particles: true },
      crowdIntensity: 1.0,
      opponent: { primary: 0xAA0000, accent: 0xB3995D, name: 'San Francisco 49ers' },
    },
    prompts: {
      background: 'Seattle skyline at dusk, Space Needle, Mount Rainier, misty rain, navy and green stadium lights, stylized illustration',
      atmosphere: 'Light rain, electric home crowd, rivalry intensity',
    },
    unlockMessage: 'The 12th Man rises! Beat our biggest rivals!',
    isPlayoff: false,
    isSuperBowl: false,
    isTutorial: false,
  },

  // ===== WEEK 2: @ Steelers (AWAY) =====
  {
    id: 2,
    name: 'Steel City',
    weekLabel: 'Week 2',
    location: {
      city: 'Pittsburgh',
      state: 'Pennsylvania',
      abbreviation: 'PIT',
      coordinates: { x: 0.72, y: 0.35 },
      isHome: false,
    },
    description: 'Battle the Steel Curtain legacy in Pittsburgh.',
    gamesRequired: 3,
    difficulty: 3,
    visuals: {
      skyGradient: ['#1a1a2a', '#3a3a4a'],
      fieldTint: '#2a4a3a',
      atmosphereColor: '#FFB612',
      landmarks: ['Three Rivers', 'Steel bridges', 'Acrisure Stadium'],
      weather: { type: 'fog', intensity: 0.5, particles: true },
      crowdIntensity: 0.9,
      opponent: { primary: 0xFFB612, accent: 0x101820, name: 'Pittsburgh Steelers' },
    },
    prompts: {
      background: 'Pittsburgh skyline, three rivers, steel bridges, industrial atmosphere, black and gold, stylized game art',
      atmosphere: 'Industrial fog, steel mill glow, tough blue-collar crowd',
    },
    unlockMessage: 'Into the Steel City! Face the Steelers legacy.',
    isPlayoff: false,
    isSuperBowl: false,
    isTutorial: false,
  },

  // ===== WEEK 3: vs Saints (HOME) =====
  {
    id: 3,
    name: 'Who Dat?',
    weekLabel: 'Week 3',
    location: {
      city: 'Seattle',
      state: 'Washington',
      abbreviation: 'SEA',
      coordinates: { x: 0.12, y: 0.15 },
      isHome: true,
    },
    description: 'The Saints march into Seattle. Silence them.',
    gamesRequired: 3,
    difficulty: 3,
    visuals: {
      skyGradient: ['#1a2a3a', '#2d4a5a'],
      fieldTint: '#2a5a3a',
      atmosphereColor: '#69BE28',
      landmarks: ['Space Needle', 'Mount Rainier', 'Lumen Field'],
      weather: { type: 'rain', intensity: 0.3, particles: true },
      crowdIntensity: 1.0,
      opponent: { primary: 0xD3BC8D, accent: 0x101820, name: 'New Orleans Saints' },
    },
    prompts: {
      background: 'Seattle night game, Lumen Field lights, rain mist, stylized illustration',
      atmosphere: 'Autumn rain, home field advantage, 12th Man energy',
    },
    unlockMessage: 'Saints coming to town! Make it loud!',
    isPlayoff: false,
    isSuperBowl: false,
    isTutorial: false,
  },

  // ===== WEEK 4: @ Cardinals (AWAY) =====
  {
    id: 4,
    name: 'Desert Heat',
    weekLabel: 'Week 4',
    location: {
      city: 'Phoenix',
      state: 'Arizona',
      abbreviation: 'AZ',
      coordinates: { x: 0.22, y: 0.58 },
      isHome: false,
    },
    description: 'Division showdown in the Arizona desert.',
    gamesRequired: 3,
    difficulty: 4,
    visuals: {
      skyGradient: ['#FF6B35', '#FFB347'],
      fieldTint: '#3a5a2a',
      atmosphereColor: '#FF4500',
      landmarks: ['Saguaro cacti', 'Desert sunset', 'State Farm Stadium'],
      weather: { type: 'heat', intensity: 0.7, particles: true },
      crowdIntensity: 0.8,
      opponent: { primary: 0x97233F, accent: 0xFFB612, name: 'Arizona Cardinals' },
    },
    prompts: {
      background: 'Arizona desert sunset, saguaro cacti, State Farm Stadium dome, red and orange sky, stylized game background',
      atmosphere: 'Desert heat waves, harsh sun, dry atmosphere',
    },
    unlockMessage: 'Into the desert! Division rival awaits.',
    isPlayoff: false,
    isSuperBowl: false,
    isTutorial: false,
  },

  // ===== WEEK 5: vs Buccaneers (HOME) =====
  {
    id: 5,
    name: 'Pirate Raid',
    weekLabel: 'Week 5',
    location: {
      city: 'Seattle',
      state: 'Washington',
      abbreviation: 'SEA',
      coordinates: { x: 0.12, y: 0.15 },
      isHome: true,
    },
    description: 'The Bucs bring their cannons. Fire back!',
    gamesRequired: 3,
    difficulty: 4,
    visuals: {
      skyGradient: ['#1a2a3a', '#3a4a5a'],
      fieldTint: '#2a5a3a',
      atmosphereColor: '#69BE28',
      landmarks: ['Space Needle', 'Mount Rainier', 'Lumen Field'],
      weather: { type: 'rain', intensity: 0.5, particles: true },
      crowdIntensity: 1.0,
      opponent: { primary: 0xD50A0A, accent: 0x34302B, name: 'Tampa Bay Buccaneers' },
    },
    prompts: {
      background: 'Seattle rainy night, Lumen Field ablaze with lights, October football, stylized illustration',
      atmosphere: 'Heavy rain, pirate invasion repelled, October intensity',
    },
    unlockMessage: 'Pirates invading! Defend your turf!',
    isPlayoff: false,
    isSuperBowl: false,
    isTutorial: false,
  },

  // ===== WEEK 6: @ Jaguars (AWAY) =====
  {
    id: 6,
    name: 'Duval Showdown',
    weekLabel: 'Week 6',
    location: {
      city: 'Jacksonville',
      state: 'Florida',
      abbreviation: 'JAX',
      coordinates: { x: 0.75, y: 0.65 },
      isHome: false,
    },
    description: 'Florida heat and Jaguar speed in Jacksonville.',
    gamesRequired: 3,
    difficulty: 4,
    visuals: {
      skyGradient: ['#006778', '#99D9D9'],
      fieldTint: '#2a5a2a',
      atmosphereColor: '#006778',
      landmarks: ['St. Johns River', 'TIAA Bank Field', 'Florida palms'],
      weather: { type: 'heat', intensity: 0.6, particles: true },
      crowdIntensity: 0.75,
      opponent: { primary: 0x006778, accent: 0xD7A22A, name: 'Jacksonville Jaguars' },
    },
    prompts: {
      background: 'Jacksonville Florida, St. Johns River, palm trees, teal and gold atmosphere, stylized illustration',
      atmosphere: 'Humid Florida air, tropical heat, October sunshine',
    },
    unlockMessage: 'Journey to Jacksonville! Jaguar territory.',
    isPlayoff: false,
    isSuperBowl: false,
    isTutorial: false,
  },

  // ===== WEEK 7: vs Texans (HOME) =====
  {
    id: 7,
    name: 'Texas Sized',
    weekLabel: 'Week 7',
    location: {
      city: 'Seattle',
      state: 'Washington',
      abbreviation: 'SEA',
      coordinates: { x: 0.12, y: 0.15 },
      isHome: true,
    },
    description: 'Houston brings their bulls. Stand your ground!',
    gamesRequired: 3,
    difficulty: 5,
    visuals: {
      skyGradient: ['#1a2a3a', '#2d4a5a'],
      fieldTint: '#2a5a3a',
      atmosphereColor: '#69BE28',
      landmarks: ['Space Needle', 'Mount Rainier', 'Lumen Field'],
      weather: { type: 'night', intensity: 0.6 },
      crowdIntensity: 1.0,
      opponent: { primary: 0x03202F, accent: 0xA71930, name: 'Houston Texans' },
    },
    prompts: {
      background: 'Seattle night game, October atmosphere, Lumen Field prime time, stylized illustration',
      atmosphere: 'Prime time football, night game energy, deep navy sky',
    },
    unlockMessage: 'Texas-sized challenge at home!',
    isPlayoff: false,
    isSuperBowl: false,
    isTutorial: false,
  },

  // ===== WEEK 8: @ Commanders (AWAY) =====
  {
    id: 8,
    name: 'Capital Clash',
    weekLabel: 'Week 8',
    location: {
      city: 'Washington',
      state: 'DC',
      abbreviation: 'WAS',
      coordinates: { x: 0.78, y: 0.38 },
      isHome: false,
    },
    description: 'Sunday battle in the nation\'s capital.',
    gamesRequired: 3,
    difficulty: 5,
    visuals: {
      skyGradient: ['#1a1a2a', '#3a2a3a'],
      fieldTint: '#2a4a2a',
      atmosphereColor: '#5A1414',
      landmarks: ['Capitol dome', 'Washington Monument', 'Northwest Stadium'],
      weather: { type: 'clear', intensity: 0.4 },
      crowdIntensity: 0.85,
      opponent: { primary: 0x5A1414, accent: 0xFFB612, name: 'Washington Commanders' },
    },
    prompts: {
      background: 'Washington DC monuments, Capitol dome silhouette, autumn colors, burgundy and gold, stylized game background',
      atmosphere: 'Fall foliage, political intensity, November football',
    },
    unlockMessage: 'Taking on the capital! Commanders await.',
    isPlayoff: false,
    isSuperBowl: false,
    isTutorial: false,
  },

  // ===== WEEK 9: vs Cardinals (HOME) =====
  {
    id: 9,
    name: 'Division Revenge',
    weekLabel: 'Week 9',
    location: {
      city: 'Seattle',
      state: 'Washington',
      abbreviation: 'SEA',
      coordinates: { x: 0.12, y: 0.15 },
      isHome: true,
    },
    description: 'Cardinals fly north. Time for revenge!',
    gamesRequired: 3,
    difficulty: 5,
    visuals: {
      skyGradient: ['#1a2a3a', '#2d4a5a'],
      fieldTint: '#2a5a3a',
      atmosphereColor: '#69BE28',
      landmarks: ['Space Needle', 'Mount Rainier', 'Lumen Field'],
      weather: { type: 'rain', intensity: 0.4, particles: true },
      crowdIntensity: 1.0,
      opponent: { primary: 0x97233F, accent: 0xFFB612, name: 'Arizona Cardinals' },
    },
    prompts: {
      background: 'Seattle November rain, Lumen Field, division showdown atmosphere, stylized illustration',
      atmosphere: 'Cold rain, division rivalry, November intensity',
    },
    unlockMessage: 'Cardinals invading! Division revenge time!',
    isPlayoff: false,
    isSuperBowl: false,
    isTutorial: false,
  },

  // ===== WEEK 10: @ Rams (AWAY) =====
  {
    id: 10,
    name: 'Hollywood Showdown',
    weekLabel: 'Week 10',
    location: {
      city: 'Los Angeles',
      state: 'California',
      abbreviation: 'LA',
      coordinates: { x: 0.12, y: 0.52 },
      isHome: false,
    },
    description: 'Battle the Rams in the City of Angels.',
    gamesRequired: 3,
    difficulty: 6,
    visuals: {
      skyGradient: ['#2a1a3a', '#4a2a5a'],
      fieldTint: '#2a4a2a',
      atmosphereColor: '#003594',
      landmarks: ['Hollywood sign', 'Palm trees', 'SoFi Stadium'],
      weather: { type: 'night', intensity: 0.5 },
      crowdIntensity: 0.9,
      opponent: { primary: 0x003594, accent: 0xFFA300, name: 'Los Angeles Rams' },
    },
    prompts: {
      background: 'Los Angeles SoFi Stadium, Hollywood sign distance, palm trees, purple sunset, stylized game illustration',
      atmosphere: 'Hollywood lights, California cool, November night',
    },
    unlockMessage: 'Division clash in LA! Beat the Rams!',
    isPlayoff: false,
    isSuperBowl: false,
    isTutorial: false,
  },

  // ===== WEEK 11: @ Titans (AWAY) =====
  {
    id: 11,
    name: 'Music City',
    weekLabel: 'Week 11',
    location: {
      city: 'Nashville',
      state: 'Tennessee',
      abbreviation: 'NSH',
      coordinates: { x: 0.58, y: 0.50 },
      isHome: false,
    },
    description: 'Country strong meets Seahawks tough in Nashville.',
    gamesRequired: 3,
    difficulty: 6,
    visuals: {
      skyGradient: ['#2a3a4a', '#4a5a6a'],
      fieldTint: '#2a4a3a',
      atmosphereColor: '#4B92DB',
      landmarks: ['Broadway neon', 'Nissan Stadium', 'Country music heritage'],
      weather: { type: 'clear', intensity: 0.3 },
      crowdIntensity: 0.85,
      opponent: { primary: 0x4B92DB, accent: 0x0C2340, name: 'Tennessee Titans' },
    },
    prompts: {
      background: 'Nashville Tennessee, Broadway neon lights, Nissan Stadium, country music atmosphere, stylized game art',
      atmosphere: 'Southern charm, country music energy, November football',
    },
    unlockMessage: 'Music City showdown! Titans await.',
    isPlayoff: false,
    isSuperBowl: false,
    isTutorial: false,
  },

  // ===== WEEK 12: vs Vikings (HOME) =====
  {
    id: 12,
    name: 'Nordic Invasion',
    weekLabel: 'Week 12',
    location: {
      city: 'Seattle',
      state: 'Washington',
      abbreviation: 'SEA',
      coordinates: { x: 0.12, y: 0.15 },
      isHome: true,
    },
    description: 'The Vikings sail west. Repel the raiders!',
    gamesRequired: 3,
    difficulty: 6,
    visuals: {
      skyGradient: ['#1a2a3a', '#2d4a5a'],
      fieldTint: '#2a5a3a',
      atmosphereColor: '#69BE28',
      landmarks: ['Space Needle', 'Mount Rainier', 'Lumen Field'],
      weather: { type: 'rain', intensity: 0.5, particles: true },
      crowdIntensity: 1.0,
      opponent: { primary: 0x4F2683, accent: 0xFFC62F, name: 'Minnesota Vikings' },
    },
    prompts: {
      background: 'Seattle late November, cold rain, prime time atmosphere, Lumen Field, stylized illustration',
      atmosphere: 'Late autumn cold, Viking invasion, purple and gold clash',
    },
    unlockMessage: 'Vikings invading! The 12s will be loud!',
    isPlayoff: false,
    isSuperBowl: false,
    isTutorial: false,
  },

  // ===== WEEK 13: @ Falcons (AWAY) =====
  {
    id: 13,
    name: 'Southern Dome',
    weekLabel: 'Week 13',
    location: {
      city: 'Atlanta',
      state: 'Georgia',
      abbreviation: 'ATL',
      coordinates: { x: 0.68, y: 0.56 },
      isHome: false,
    },
    description: 'Rise up against the Falcons in Atlanta.',
    gamesRequired: 3,
    difficulty: 7,
    visuals: {
      skyGradient: ['#2a1a1a', '#4a2a2a'],
      fieldTint: '#2a3a2a',
      atmosphereColor: '#A71930',
      landmarks: ['Mercedes-Benz Stadium', 'Atlanta skyline', 'Dome interior'],
      weather: { type: 'clear', intensity: 0.4 },
      crowdIntensity: 0.9,
      opponent: { primary: 0xA71930, accent: 0x000000, name: 'Atlanta Falcons' },
    },
    prompts: {
      background: 'Atlanta Mercedes-Benz Stadium, futuristic dome, red and black atmosphere, stylized game art',
      atmosphere: 'Indoor dome energy, December football, southern heat',
    },
    unlockMessage: 'Flying to Atlanta! Falcon territory.',
    isPlayoff: false,
    isSuperBowl: false,
    isTutorial: false,
  },

  // ===== WEEK 14: vs Colts (HOME) =====
  {
    id: 14,
    name: 'Blue Stampede',
    weekLabel: 'Week 14',
    location: {
      city: 'Seattle',
      state: 'Washington',
      abbreviation: 'SEA',
      coordinates: { x: 0.12, y: 0.15 },
      isHome: true,
    },
    description: 'Indianapolis rides into town. Hold the line!',
    gamesRequired: 3,
    difficulty: 7,
    visuals: {
      skyGradient: ['#0a1628', '#1a2a3a'],
      fieldTint: '#2a5a3a',
      atmosphereColor: '#69BE28',
      landmarks: ['Space Needle', 'Mount Rainier', 'Lumen Field'],
      weather: { type: 'snow', intensity: 0.3, particles: true },
      crowdIntensity: 1.0,
      opponent: { primary: 0x002C5F, accent: 0xA2AAAD, name: 'Indianapolis Colts' },
    },
    prompts: {
      background: 'Seattle December, light snow, Lumen Field winter, stylized illustration',
      atmosphere: 'Winter football, light snow, playoff push energy',
    },
    unlockMessage: 'Colts stampeding in! December showdown!',
    isPlayoff: false,
    isSuperBowl: false,
    isTutorial: false,
  },

  // ===== WEEK 15: vs Rams (HOME) =====
  {
    id: 15,
    name: 'Division Showdown',
    weekLabel: 'Week 15',
    location: {
      city: 'Seattle',
      state: 'Washington',
      abbreviation: 'SEA',
      coordinates: { x: 0.12, y: 0.15 },
      isHome: true,
    },
    description: 'Rams return for round 2. This time at home!',
    gamesRequired: 3,
    difficulty: 7,
    visuals: {
      skyGradient: ['#0a1628', '#1a2a3a'],
      fieldTint: '#2a5a3a',
      atmosphereColor: '#69BE28',
      landmarks: ['Space Needle', 'Mount Rainier', 'Lumen Field'],
      weather: { type: 'rain', intensity: 0.4, particles: true },
      crowdIntensity: 1.0,
      opponent: { primary: 0x003594, accent: 0xFFA300, name: 'Los Angeles Rams' },
    },
    prompts: {
      background: 'Seattle December night, division rivalry, Lumen Field packed, stylized illustration',
      atmosphere: 'December rain, division championship implications, intense',
    },
    unlockMessage: 'Rams rematch at home! Win the division!',
    isPlayoff: false,
    isSuperBowl: false,
    isTutorial: false,
  },

  // ===== WEEK 16: @ Panthers (AWAY) =====
  {
    id: 16,
    name: 'Carolina Clash',
    weekLabel: 'Week 16',
    location: {
      city: 'Charlotte',
      state: 'North Carolina',
      abbreviation: 'CLT',
      coordinates: { x: 0.72, y: 0.48 },
      isHome: false,
    },
    description: 'Keep pounding... the Panthers into the turf!',
    gamesRequired: 3,
    difficulty: 7,
    visuals: {
      skyGradient: ['#0085CA', '#101820'],
      fieldTint: '#2a4a3a',
      atmosphereColor: '#0085CA',
      landmarks: ['Bank of America Stadium', 'Charlotte skyline', 'Carolina blue'],
      weather: { type: 'clear', intensity: 0.4 },
      crowdIntensity: 0.8,
      opponent: { primary: 0x0085CA, accent: 0x101820, name: 'Carolina Panthers' },
    },
    prompts: {
      background: 'Charlotte North Carolina, Bank of America Stadium, December football, stylized game background',
      atmosphere: 'Late December, playoff race, Carolina cool',
    },
    unlockMessage: 'Charlotte bound! Panthers territory.',
    isPlayoff: false,
    isSuperBowl: false,
    isTutorial: false,
  },

  // ===== WEEK 17: @ 49ers (AWAY) - SEASON FINALE =====
  {
    id: 17,
    name: 'Bay Area Finale',
    weekLabel: 'Week 17',
    location: {
      city: 'San Francisco',
      state: 'California',
      abbreviation: 'SF',
      coordinates: { x: 0.08, y: 0.40 },
      isHome: false,
    },
    description: 'Season finale. Beat the 49ers in their house!',
    gamesRequired: 3,
    difficulty: 8,
    visuals: {
      skyGradient: ['#001a33', '#003366'],
      fieldTint: '#2a4a2a',
      atmosphereColor: '#B3995D',
      landmarks: ['Golden Gate Bridge', 'Bay fog', 'Levi\'s Stadium'],
      weather: { type: 'fog', intensity: 0.4, particles: true },
      crowdIntensity: 0.95,
      opponent: { primary: 0xAA0000, accent: 0xB3995D, name: 'San Francisco 49ers' },
    },
    prompts: {
      background: 'San Francisco bay, Golden Gate Bridge fog, Levi\'s Stadium, red and gold, stylized illustration',
      atmosphere: 'Bay fog, rivalry intensity, New Year football',
    },
    unlockMessage: 'Season finale in the Bay! Beat the 9ers!',
    isPlayoff: false,
    isSuperBowl: false,
    isTutorial: false,
  },

  // ===== DIVISIONAL PLAYOFF: vs 49ers (HOME) =====
  {
    id: 18,
    name: 'Divisional Revenge',
    weekLabel: 'Divisional',
    location: {
      city: 'Seattle',
      state: 'Washington',
      abbreviation: 'SEA',
      coordinates: { x: 0.12, y: 0.15 },
      isHome: true,
    },
    description: 'Playoff football! 49ers want revenge. Deny them!',
    gamesRequired: 3,
    difficulty: 9,
    visuals: {
      skyGradient: ['#0a0a1a', '#1a1a2a'],
      fieldTint: '#2a5a3a',
      atmosphereColor: '#FFD700',
      landmarks: ['Space Needle', 'Mount Rainier', 'Lumen Field playoff banner'],
      weather: { type: 'snow', intensity: 0.4, particles: true },
      crowdIntensity: 1.0,
      opponent: { primary: 0xAA0000, accent: 0xB3995D, name: 'San Francisco 49ers' },
    },
    prompts: {
      background: 'Seattle playoff atmosphere, January football, snow falling, championship energy, stylized illustration',
      atmosphere: 'Playoff snow, 12th Man deafening, gold championship glow',
    },
    unlockMessage: 'PLAYOFFS! Divisional round at home!',
    isPlayoff: true,
    isSuperBowl: false,
    isTutorial: false,
  },

  // ===== CONFERENCE CHAMPIONSHIP: vs Rams (HOME) =====
  {
    id: 19,
    name: 'NFC Championship',
    weekLabel: 'NFC Championship',
    location: {
      city: 'Seattle',
      state: 'Washington',
      abbreviation: 'SEA',
      coordinates: { x: 0.12, y: 0.15 },
      isHome: true,
    },
    description: 'One win from the Super Bowl. Beat the Rams!',
    gamesRequired: 3,
    difficulty: 9,
    visuals: {
      skyGradient: ['#0a0a1a', '#1a1a2a'],
      fieldTint: '#2a5a3a',
      atmosphereColor: '#FFD700',
      landmarks: ['Space Needle', 'Mount Rainier', 'NFC Championship banner'],
      weather: { type: 'snow', intensity: 0.5, particles: true },
      crowdIntensity: 1.0,
      opponent: { primary: 0x003594, accent: 0xFFA300, name: 'Los Angeles Rams' },
    },
    prompts: {
      background: 'Seattle NFC Championship, January snow, confetti ready, trophy stage, stylized illustration',
      atmosphere: 'Championship atmosphere, heavy snow, destiny calling',
    },
    unlockMessage: 'NFC CHAMPIONSHIP! One game from glory!',
    isPlayoff: true,
    isSuperBowl: false,
    isTutorial: false,
  },

  // ===== SUPER BOWL: vs Patriots (in San Francisco) =====
  {
    id: 20,
    name: 'Super Bowl',
    weekLabel: 'Super Bowl',
    location: {
      city: 'San Francisco',
      state: 'California',
      abbreviation: 'SF',
      coordinates: { x: 0.08, y: 0.40 },
      isHome: false,
    },
    description: 'THE SUPER BOWL! Seahawks vs Patriots at Levi\'s Stadium. Claim the Lombardi!',
    gamesRequired: 3,
    difficulty: 10,
    visuals: {
      skyGradient: ['#0a0a1a', '#1a1a3a'],
      fieldTint: '#2a4a3a',
      atmosphereColor: '#FFD700',
      landmarks: ['Golden Gate Bridge', 'Bay fog', 'Levi\'s Stadium', 'Lombardi Trophy'],
      weather: { type: 'night', intensity: 0.8 },
      crowdIntensity: 1.0,
      opponent: { primary: 0x002244, accent: 0xC60C30, name: 'New England Patriots' },
    },
    prompts: {
      background: 'Super Bowl Levi\'s Stadium San Francisco, Golden Gate Bridge in fog, confetti cannons, Lombardi Trophy glow, ultimate showdown, stylized game finale',
      atmosphere: 'Super Bowl magic, Bay Area fog, confetti rain, championship or bust',
    },
    unlockMessage: 'SUPER BOWL! THIS IS IT! CLAIM YOUR LEGACY!',
    isPlayoff: false,
    isSuperBowl: true,
    isTutorial: false,
  },
]

/**
 * Get stage by ID
 */
export function getStageById(id: number): CampaignStage | undefined {
  return CAMPAIGN_STAGES.find(stage => stage.id === id)
}

/**
 * Get stage by game number (1-63)
 */
export function getStageByGame(gameNumber: number): CampaignStage {
  const stageIndex = Math.min(
    Math.floor((gameNumber - 1) / GAMES_PER_STAGE),
    TOTAL_STAGES - 1
  )
  return CAMPAIGN_STAGES[stageIndex]
}

/**
 * Get game number within stage (1-3)
 */
export function getGameInStage(gameNumber: number): number {
  return ((gameNumber - 1) % GAMES_PER_STAGE) + 1
}

/**
 * Check if game completes a stage
 */
export function isStageComplete(gameNumber: number): boolean {
  return gameNumber % GAMES_PER_STAGE === 0
}

/**
 * Check if game is the final Super Bowl victory
 */
export function isCampaignComplete(gameNumber: number): boolean {
  return gameNumber >= TOTAL_GAMES
}

/**
 * Get next stage after completing current
 */
export function getNextStage(currentStageId: number): CampaignStage | null {
  const nextId = currentStageId + 1
  if (nextId > TOTAL_STAGES) return null
  return getStageById(nextId) || null
}

/**
 * Calculate difficulty modifier for game
 * Returns 1.0 (easy) to 3.0+ (Super Bowl)
 */
export function getDifficultyModifier(gameNumber: number): number {
  const stage = getStageByGame(gameNumber)
  const gameInStage = getGameInStage(gameNumber)
  
  // Base difficulty from stage (difficulty 1-10 → modifier 0.15-1.5)
  const baseDifficulty = stage.difficulty * 0.15
  
  // Increase for each game in stage (0.05 per game)
  const gameModifier = (gameInStage - 1) * 0.05
  
  return 1 + baseDifficulty + gameModifier
}

/**
 * Get all stages for map display
 */
export function getAllStages(): CampaignStage[] {
  return CAMPAIGN_STAGES
}

/**
 * Calculate campaign progress percentage
 */
export function getCampaignProgress(gamesWon: number): number {
  return Math.min(100, Math.round((gamesWon / TOTAL_GAMES) * 100))
}

/**
 * Get stages by type
 */
export function getRegularSeasonStages(): CampaignStage[] {
  return CAMPAIGN_STAGES.filter(s => !s.isPlayoff && !s.isSuperBowl && !s.isTutorial)
}

export function getPlayoffStages(): CampaignStage[] {
  return CAMPAIGN_STAGES.filter(s => s.isPlayoff)
}

export function getTutorialStage(): CampaignStage | undefined {
  return CAMPAIGN_STAGES.find(s => s.isTutorial)
}

export function getSuperBowlStage(): CampaignStage | undefined {
  return CAMPAIGN_STAGES.find(s => s.isSuperBowl)
}
