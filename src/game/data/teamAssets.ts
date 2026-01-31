/**
 * TEAM ASSETS - Photo-realistic opponent team branding
 * 
 * Contains helmet images, team colors, and visual assets for each opponent
 * Generated via Leonardo AI for premium Madden-style appearance
 */

export interface TeamAsset {
  id: number
  teamName: string
  abbreviation: string
  primaryColor: number
  accentColor: number
  helmetImage: string // Leonardo AI generated helmet
  logoImage?: string
  runnerSprite?: string // Team-colored runner
  jerseyColor: string // CSS color for fallback
}

// All opponent teams from the campaign (ordered by stage)
export const TEAM_ASSETS: Record<number, TeamAsset> = {
  // Stage 1: San Francisco 49ers (Home opener)
  1: {
    id: 1,
    teamName: 'San Francisco 49ers',
    abbreviation: 'SF',
    primaryColor: 0xAA0000,
    accentColor: 0xB3995D,
    helmetImage: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/placeholder-49ers-helmet.png',
    jerseyColor: '#AA0000',
  },
  
  // Stage 2: Pittsburgh Steelers
  2: {
    id: 2,
    teamName: 'Pittsburgh Steelers',
    abbreviation: 'PIT',
    primaryColor: 0xFFB612,
    accentColor: 0x101820,
    helmetImage: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/placeholder-steelers-helmet.png',
    jerseyColor: '#FFB612',
  },
  
  // Stage 3: New Orleans Saints
  3: {
    id: 3,
    teamName: 'New Orleans Saints',
    abbreviation: 'NO',
    primaryColor: 0xD3BC8D,
    accentColor: 0x101820,
    helmetImage: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/placeholder-saints-helmet.png',
    jerseyColor: '#D3BC8D',
  },
  
  // Stage 4: Arizona Cardinals
  4: {
    id: 4,
    teamName: 'Arizona Cardinals',
    abbreviation: 'ARI',
    primaryColor: 0x97233F,
    accentColor: 0xFFB612,
    helmetImage: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/placeholder-cardinals-helmet.png',
    jerseyColor: '#97233F',
  },
  
  // Stage 5: Tampa Bay Buccaneers
  5: {
    id: 5,
    teamName: 'Tampa Bay Buccaneers',
    abbreviation: 'TB',
    primaryColor: 0xD50A0A,
    accentColor: 0x34302B,
    helmetImage: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/placeholder-bucs-helmet.png',
    jerseyColor: '#D50A0A',
  },
  
  // Stage 6: Jacksonville Jaguars
  6: {
    id: 6,
    teamName: 'Jacksonville Jaguars',
    abbreviation: 'JAX',
    primaryColor: 0x006778,
    accentColor: 0xD7A22A,
    helmetImage: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/placeholder-jaguars-helmet.png',
    jerseyColor: '#006778',
  },
  
  // Stage 7: Houston Texans
  7: {
    id: 7,
    teamName: 'Houston Texans',
    abbreviation: 'HOU',
    primaryColor: 0x03202F,
    accentColor: 0xA71930,
    helmetImage: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/placeholder-texans-helmet.png',
    jerseyColor: '#03202F',
  },
  
  // Stage 8: Washington Commanders
  8: {
    id: 8,
    teamName: 'Washington Commanders',
    abbreviation: 'WAS',
    primaryColor: 0x5A1414,
    accentColor: 0xFFB612,
    helmetImage: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/placeholder-commanders-helmet.png',
    jerseyColor: '#5A1414',
  },
  
  // Stage 9: Arizona Cardinals (rematch)
  9: {
    id: 9,
    teamName: 'Arizona Cardinals',
    abbreviation: 'ARI',
    primaryColor: 0x97233F,
    accentColor: 0xFFB612,
    helmetImage: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/placeholder-cardinals-helmet.png',
    jerseyColor: '#97233F',
  },
  
  // Stage 10: Los Angeles Rams
  10: {
    id: 10,
    teamName: 'Los Angeles Rams',
    abbreviation: 'LAR',
    primaryColor: 0x003594,
    accentColor: 0xFFA300,
    helmetImage: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/placeholder-rams-helmet.png',
    jerseyColor: '#003594',
  },
  
  // Stage 11: Tennessee Titans
  11: {
    id: 11,
    teamName: 'Tennessee Titans',
    abbreviation: 'TEN',
    primaryColor: 0x4B92DB,
    accentColor: 0x0C2340,
    helmetImage: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/placeholder-titans-helmet.png',
    jerseyColor: '#4B92DB',
  },
  
  // Stage 12: Minnesota Vikings
  12: {
    id: 12,
    teamName: 'Minnesota Vikings',
    abbreviation: 'MIN',
    primaryColor: 0x4F2683,
    accentColor: 0xFFC62F,
    helmetImage: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/placeholder-vikings-helmet.png',
    jerseyColor: '#4F2683',
  },
  
  // Stage 13: Atlanta Falcons
  13: {
    id: 13,
    teamName: 'Atlanta Falcons',
    abbreviation: 'ATL',
    primaryColor: 0xA71930,
    accentColor: 0x000000,
    helmetImage: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/placeholder-falcons-helmet.png',
    jerseyColor: '#A71930',
  },
  
  // Stage 14: Indianapolis Colts
  14: {
    id: 14,
    teamName: 'Indianapolis Colts',
    abbreviation: 'IND',
    primaryColor: 0x002C5F,
    accentColor: 0xA2AAAD,
    helmetImage: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/placeholder-colts-helmet.png',
    jerseyColor: '#002C5F',
  },
  
  // Stage 15: Los Angeles Rams (rematch)
  15: {
    id: 15,
    teamName: 'Los Angeles Rams',
    abbreviation: 'LAR',
    primaryColor: 0x003594,
    accentColor: 0xFFA300,
    helmetImage: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/placeholder-rams-helmet.png',
    jerseyColor: '#003594',
  },
  
  // Stage 16: Carolina Panthers
  16: {
    id: 16,
    teamName: 'Carolina Panthers',
    abbreviation: 'CAR',
    primaryColor: 0x0085CA,
    accentColor: 0x101820,
    helmetImage: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/placeholder-panthers-helmet.png',
    jerseyColor: '#0085CA',
  },
  
  // Stage 17: San Francisco 49ers (Season Finale)
  17: {
    id: 17,
    teamName: 'San Francisco 49ers',
    abbreviation: 'SF',
    primaryColor: 0xAA0000,
    accentColor: 0xB3995D,
    helmetImage: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/placeholder-49ers-helmet.png',
    jerseyColor: '#AA0000',
  },
  
  // Stage 18: Divisional Playoff - 49ers
  18: {
    id: 18,
    teamName: 'San Francisco 49ers',
    abbreviation: 'SF',
    primaryColor: 0xAA0000,
    accentColor: 0xB3995D,
    helmetImage: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/placeholder-49ers-helmet-playoff.png',
    jerseyColor: '#AA0000',
  },
  
  // Stage 19: NFC Championship - Rams
  19: {
    id: 19,
    teamName: 'Los Angeles Rams',
    abbreviation: 'LAR',
    primaryColor: 0x003594,
    accentColor: 0xFFA300,
    helmetImage: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/placeholder-rams-helmet-championship.png',
    jerseyColor: '#003594',
  },
  
  // Stage 20: Super Bowl - Patriots
  20: {
    id: 20,
    teamName: 'New England Patriots',
    abbreviation: 'NE',
    primaryColor: 0x002244,
    accentColor: 0xC60C30,
    helmetImage: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/placeholder-patriots-helmet-sb.png',
    jerseyColor: '#002244',
  },
}

/**
 * Get team asset by stage ID
 */
export function getTeamAsset(stageId: number): TeamAsset | undefined {
  return TEAM_ASSETS[stageId]
}

/**
 * Get all unique teams (de-duplicated)
 */
export function getUniqueTeams(): TeamAsset[] {
  const seen = new Set<string>()
  const unique: TeamAsset[] = []
  
  Object.values(TEAM_ASSETS).forEach(team => {
    if (!seen.has(team.abbreviation)) {
      seen.add(team.abbreviation)
      unique.push(team)
    }
  })
  
  return unique
}

/**
 * Leonardo AI prompt template for generating team helmets
 */
export function getHelmetPrompt(team: TeamAsset): string {
  return `Photorealistic 3D render of NFL ${team.teamName} football helmet, 
    team colors ${team.jerseyColor}, glossy surface, studio lighting, 
    clean white background, side profile view, highly detailed,
    professional sports equipment photography, 4K quality`
}

/**
 * Leonardo AI prompt template for runner sprites
 */
export function getRunnerPrompt(team: TeamAsset): string {
  return `Photorealistic 3D render of NFL football player running with ball, 
    ${team.teamName} jersey and uniform, team colors ${team.jerseyColor},
    dynamic running pose, transparent background, full body shot,
    professional sports illustration, 4K quality`
}
