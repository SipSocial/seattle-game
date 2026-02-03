/**
 * Player Rosters for V3 Game
 * 
 * Offense and Defense player data with superhero sprite images
 */

export interface PlayerData {
  jersey: number
  name: string
  position: string
  stats: Record<string, number>
  imageFront: string
  side: 'offense' | 'defense'
}

// ============================================================================
// OFFENSE ROSTER
// ============================================================================

export const OFFENSE_PLAYERS: PlayerData[] = [
  {
    jersey: 14,
    name: 'Sam Darnold',
    position: 'QB',
    stats: { passYards: 4319, touchdowns: 35, rating: 102.5 },
    imageFront: '/sprites/players/offense-14-sam-darnold.png',
    side: 'offense',
  },
  {
    jersey: 11,
    name: 'Jaxon Smith-Njigba',
    position: 'WR',
    stats: { receptions: 100, recYards: 1130, touchdowns: 6 },
    imageFront: '/sprites/players/offense-11-jaxon-smith-njigba.png',
    side: 'offense',
  },
  {
    jersey: 10,
    name: 'Cooper Kupp',
    position: 'WR',
    stats: { receptions: 67, recYards: 710, touchdowns: 6 },
    imageFront: '/sprites/players/offense-10-cooper-kupp.png',
    side: 'offense',
  },
  {
    jersey: 88,
    name: 'AJ Barner',
    position: 'TE',
    stats: { receptions: 42, recYards: 519, touchdowns: 4 },
    imageFront: '/sprites/players/offense-88-aj-barner.png',
    side: 'offense',
  },
  {
    jersey: 9,
    name: 'Kenneth Walker III',
    position: 'RB',
    stats: { rushYards: 965, touchdowns: 8, ypc: 4.5 },
    imageFront: '/sprites/players/offense-9-kenneth-walker-iii.png',
    side: 'offense',
  },
]

// ============================================================================
// DEFENSE ROSTER
// ============================================================================

export const DEFENSE_PLAYERS: PlayerData[] = [
  {
    jersey: 0,
    name: 'DeMarcus Lawrence',
    position: 'DE',
    stats: { tackles: 53, sacks: 6, forcedFumbles: 3 },
    imageFront: '/sprites/players/defense-0-demarcus-lawrence.png',
    side: 'defense',
  },
  {
    jersey: 99,
    name: 'Leonard Williams',
    position: 'DT',
    stats: { tackles: 62, sacks: 7, qbHits: 22 },
    imageFront: '/sprites/players/defense-99-leonard-williams.png',
    side: 'defense',
  },
  {
    jersey: 91,
    name: 'Byron Murphy II',
    position: 'DT',
    stats: { tackles: 62, sacks: 7, qbHits: 13 },
    imageFront: '/sprites/players/defense-91-byron-murphy-ii.png',
    side: 'defense',
  },
  {
    jersey: 58,
    name: 'Derick Hall',
    position: 'EDGE',
    stats: { tackles: 30, sacks: 2, qbHits: 13 },
    imageFront: '/sprites/players/defense-58-derick-hall.png',
    side: 'defense',
  },
  {
    jersey: 7,
    name: 'Uchenna Nwosu',
    position: 'OLB',
    stats: { tackles: 35, sacks: 7, qbHits: 15 },
    imageFront: '/sprites/players/defense-7-uchenna-nwosu.png',
    side: 'defense',
  },
  {
    jersey: 13,
    name: 'Ernest Jones IV',
    position: 'MLB',
    stats: { tackles: 126, interceptions: 5, passDefended: 7 },
    imageFront: '/sprites/players/defense-13-ernest-jones-iv.png',
    side: 'defense',
  },
  {
    jersey: 42,
    name: 'Drake Thomas',
    position: 'LB',
    stats: { tackles: 96, sacks: 3.5, tfl: 10 },
    imageFront: '/sprites/players/defense-42-drake-thomas.png',
    side: 'defense',
  },
  {
    jersey: 21,
    name: 'Devon Witherspoon',
    position: 'CB',
    stats: { tackles: 72, interceptions: 1, passDefended: 7 },
    imageFront: '/sprites/players/defense-21-devon-witherspoon.png',
    side: 'defense',
  },
  {
    jersey: 29,
    name: 'Josh Jobe',
    position: 'CB',
    stats: { tackles: 54, interceptions: 1, passDefended: 12 },
    imageFront: '/sprites/players/defense-29-josh-jobe.png',
    side: 'defense',
  },
  {
    jersey: 20,
    name: 'Julian Love',
    position: 'S',
    stats: { tackles: 34, interceptions: 1, passDefended: 6 },
    imageFront: '/sprites/players/defense-20-julian-love.png',
    side: 'defense',
  },
  {
    jersey: 8,
    name: 'Coby Bryant',
    position: 'S',
    stats: { tackles: 66, interceptions: 4, passDefended: 7 },
    imageFront: '/sprites/players/defense-8-coby-bryant.png',
    side: 'defense',
  },
  {
    jersey: 3,
    name: 'Nick Emmanwori',
    position: 'S',
    stats: { tackles: 81, passDefended: 11, sacks: 2.5 },
    imageFront: '/sprites/players/defense-3-nick-emmanwori.png',
    side: 'defense',
  },
]

// ============================================================================
// EXPORTS
// ============================================================================

export const ALL_PLAYERS = [...OFFENSE_PLAYERS, ...DEFENSE_PLAYERS]

export function getPlayerByJersey(jersey: number): PlayerData | undefined {
  return ALL_PLAYERS.find(p => p.jersey === jersey)
}

export function getOffenseStarters(): PlayerData[] {
  return OFFENSE_PLAYERS
}

export function getDefenseStarters(): PlayerData[] {
  return DEFENSE_PLAYERS
}
