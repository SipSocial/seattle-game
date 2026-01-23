/**
 * Team Definitions for Road to the Super Bowl
 * All teams are fictional - NO NFL references
 */

export interface TeamColors {
  primary: string
  accent: string
  trim: string
}

export interface Team {
  id: string
  name: string
  shortName: string
  colors: TeamColors
}

// Seattle Darkside - The player's team
export const SEATTLE_DARKSIDE: Team = {
  id: 'seattle-darkside',
  name: 'Seattle Darkside',
  shortName: 'SEA',
  colors: {
    primary: '#0F6E6A',   // Teal jersey
    accent: '#7ED957',     // Green accent
    trim: '#0B1F24',       // Navy-charcoal trim
  },
}

// Opponent teams with exact colors as specified
export const OPPONENTS: Record<string, Team> = {
  'crimson-forge': {
    id: 'crimson-forge',
    name: 'Crimson Forge',
    shortName: 'CFG',
    colors: {
      primary: '#8B1E2D',
      accent: '#F2C14E',
      trim: '#1A0B0E',
    },
  },
  'iron-gold': {
    id: 'iron-gold',
    name: 'Iron Gold',
    shortName: 'IRG',
    colors: {
      primary: '#C9A227',
      accent: '#2D2D2D',
      trim: '#111111',
    },
  },
  'slate-storm': {
    id: 'slate-storm',
    name: 'Slate Storm',
    shortName: 'SLS',
    colors: {
      primary: '#5B6C77',
      accent: '#D7E0E7',
      trim: '#1C2329',
    },
  },
  'midnight-violet': {
    id: 'midnight-violet',
    name: 'Midnight Violet',
    shortName: 'MDV',
    colors: {
      primary: '#4B2E83',
      accent: '#CBB7FF',
      trim: '#140B24',
    },
  },
  'burnt-orange': {
    id: 'burnt-orange',
    name: 'Burnt Orange',
    shortName: 'BTO',
    colors: {
      primary: '#C4511E',
      accent: '#FFD29D',
      trim: '#1E0F08',
    },
  },
  'arctic-surge': {
    id: 'arctic-surge',
    name: 'Arctic Surge',
    shortName: 'ARS',
    colors: {
      primary: '#DDEEFF',
      accent: '#4BA3FF',
      trim: '#0A1A2B',
    },
  },
  'forest-black': {
    id: 'forest-black',
    name: 'Forest Black',
    shortName: 'FBK',
    colors: {
      primary: '#1C2B22',
      accent: '#78C850',
      trim: '#0A0F0C',
    },
  },
  'solar-red': {
    id: 'solar-red',
    name: 'Solar Red',
    shortName: 'SLR',
    colors: {
      primary: '#B11226',
      accent: '#FFD166',
      trim: '#1A0508',
    },
  },
  'black-gold-legion': {
    id: 'black-gold-legion',
    name: 'Black Gold Legion',
    shortName: 'BGL',
    colors: {
      primary: '#0B0B0B',
      accent: '#D4AF37',
      trim: '#1B1B1B',
    },
  },
}

export function getOpponentById(id: string): Team {
  return OPPONENTS[id] || OPPONENTS['crimson-forge']
}

export function getOpponentByLevel(level: number): Team {
  const opponentIds = Object.keys(OPPONENTS)
  const index = Math.max(0, Math.min(level - 1, opponentIds.length - 1))
  return OPPONENTS[opponentIds[index]]
}

// Helper to convert hex color to number for Phaser
export function hexToNumber(hex: string): number {
  return parseInt(hex.replace('#', ''), 16)
}
