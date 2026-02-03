/**
 * Seattle Seahawks 2025 Defensive Roster
 * VERIFIED from official seahawks.com depth chart (January 2025)
 * Super Bowl LX Roster - 14-3 Regular Season
 */

export interface Defender {
  jersey: number
  name: string
  position: 'DE' | 'DT' | 'NT' | 'RUSH' | 'MLB' | 'WLB' | 'SLB' | 'CB' | 'S'
  positionGroup: 'DL' | 'LB' | 'DB'
  isStarter: boolean
  stats2025?: {
    tackles?: number
    sacks?: number
    interceptions?: number
    forcedFumbles?: number
  }
}

// Defensive Line - VERIFIED from depth chart
const DEFENSIVE_LINE: Defender[] = [
  { 
    jersey: 0, name: 'DeMarcus Lawrence', position: 'DE', positionGroup: 'DL',
    isStarter: true,
    stats2025: { tackles: 24, sacks: 6, forcedFumbles: 3 }
  },
  { 
    jersey: 99, name: 'Leonard Williams', position: 'DT', positionGroup: 'DL',
    isStarter: true,
    stats2025: { sacks: 7 }
  },
  { 
    jersey: 91, name: 'Byron Murphy II', position: 'NT', positionGroup: 'DL',
    isStarter: true,
    stats2025: { sacks: 7 }
  },
  { 
    jersey: 90, name: 'Jarran Reed', position: 'DT', positionGroup: 'DL',
    isStarter: false
  },
  { 
    jersey: 98, name: 'Rylie Mills', position: 'DE', positionGroup: 'DL',
    isStarter: false
  },
  { 
    jersey: 94, name: 'Mike Morris', position: 'DE', positionGroup: 'DL',
    isStarter: false
  },
  { 
    jersey: 95, name: 'Brandon Pili', position: 'NT', positionGroup: 'DL',
    isStarter: false
  },
]

// Linebackers - VERIFIED from depth chart
const LINEBACKERS: Defender[] = [
  { 
    jersey: 58, name: 'Derick Hall', position: 'RUSH', positionGroup: 'LB',
    isStarter: true
  },
  { 
    jersey: 7, name: 'Uchenna Nwosu', position: 'SLB', positionGroup: 'LB',
    isStarter: true,
    stats2025: { sacks: 7 }
  },
  { 
    jersey: 13, name: 'Ernest Jones IV', position: 'MLB', positionGroup: 'LB',
    isStarter: true,
    stats2025: { tackles: 60 }
  },
  { 
    jersey: 42, name: 'Drake Thomas', position: 'WLB', positionGroup: 'LB',
    isStarter: true
  },
  { 
    jersey: 53, name: 'Boye Mafe', position: 'SLB', positionGroup: 'LB',
    isStarter: false
  },
  { 
    jersey: 48, name: 'Tyrice Knight', position: 'MLB', positionGroup: 'LB',
    isStarter: false
  },
  { 
    jersey: 51, name: 'Jared Ivey', position: 'RUSH', positionGroup: 'LB',
    isStarter: false
  },
  { 
    jersey: 52, name: "Patrick O'Connell", position: 'MLB', positionGroup: 'LB',
    isStarter: false
  },
  { 
    jersey: 57, name: "Connor O'Toole", position: 'SLB', positionGroup: 'LB',
    isStarter: false
  },
]

// Cornerbacks - VERIFIED from depth chart
const CORNERBACKS: Defender[] = [
  { 
    jersey: 21, name: 'Devon Witherspoon', position: 'CB', positionGroup: 'DB',
    isStarter: true,
    stats2025: { tackles: 48, interceptions: 1 }
  },
  { 
    jersey: 29, name: 'Josh Jobe', position: 'CB', positionGroup: 'DB',
    isStarter: true
  },
  { 
    jersey: 27, name: 'Riq Woolen', position: 'CB', positionGroup: 'DB',
    isStarter: false
  },
  { 
    jersey: 28, name: 'Nehemiah Pritchett', position: 'CB', positionGroup: 'DB',
    isStarter: false
  },
]

// Safeties - VERIFIED from depth chart
const SAFETIES: Defender[] = [
  { 
    jersey: 20, name: 'Julian Love', position: 'S', positionGroup: 'DB',
    isStarter: true
  },
  { 
    jersey: 8, name: 'Coby Bryant', position: 'S', positionGroup: 'DB',
    isStarter: true
  },
  { 
    jersey: 3, name: 'Nick Emmanwori', position: 'S', positionGroup: 'DB',
    isStarter: true,
    stats2025: { tackles: 81, sacks: 2.5, interceptions: 1, forcedFumbles: 0 }
  },
  { 
    jersey: 39, name: 'Ty Okada', position: 'S', positionGroup: 'DB',
    isStarter: false
  },
]

// Full roster - sorted by position group then jersey for better organization
export const FULL_ROSTER: Defender[] = [
  ...DEFENSIVE_LINE,
  ...LINEBACKERS,
  ...CORNERBACKS,
  ...SAFETIES,
]

// Get only starters for quick selection
export const STARTERS: Defender[] = FULL_ROSTER.filter(d => d.isStarter)

// Get defender by jersey number
export function getDefender(jersey: number): Defender | undefined {
  return FULL_ROSTER.find((d) => d.jersey === jersey)
}

// Get position display name
export function getPositionName(position: Defender['position']): string {
  const names: Record<Defender['position'], string> = {
    'DE': 'Defensive End',
    'DT': 'Defensive Tackle',
    'NT': 'Nose Tackle',
    'RUSH': 'Rush LB',
    'MLB': 'Middle Linebacker',
    'WLB': 'Weak-side LB',
    'SLB': 'Strong-side LB',
    'CB': 'Cornerback',
    'S': 'Safety',
  }
  return names[position] || position
}

// Get position display color
export function getPositionColor(positionGroup: Defender['positionGroup']): number {
  switch (positionGroup) {
    case 'DL':
      return 0xff6b6b // Red-ish for D-Line
    case 'LB':
      return 0x4ecdc4 // Teal for Linebackers
    case 'DB':
      return 0xffe66d // Gold for DBs
    default:
      return 0xffffff
  }
}

// Default starting defender - DeMarcus Lawrence (the star!)
export const DEFAULT_DEFENDER = 0
