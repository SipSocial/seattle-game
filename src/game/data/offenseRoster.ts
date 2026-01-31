/**
 * Seattle Seahawks 2025 Offensive Roster
 * VERIFIED from official seahawks.com depth chart (January 2025)
 * Super Bowl LX Roster - 14-3 Regular Season
 */

export interface OffensivePlayer {
  jersey: number
  name: string
  position: 'QB' | 'RB' | 'FB' | 'WR' | 'TE' | 'OL'
  positionGroup: 'QB' | 'SKILL' | 'OL'
  isStarter: boolean
  stats2025?: {
    passingYards?: number
    rushingYards?: number
    receivingYards?: number
    receptions?: number
    touchdowns?: number
  }
}

// Quarterbacks - VERIFIED from depth chart
const QUARTERBACKS: OffensivePlayer[] = [
  { 
    jersey: 14, name: 'Sam Darnold', position: 'QB', positionGroup: 'QB',
    isStarter: true,
    stats2025: { passingYards: 4048 }
  },
  { 
    jersey: 2, name: 'Drew Lock', position: 'QB', positionGroup: 'QB',
    isStarter: false
  },
  { 
    jersey: 6, name: 'Jalen Milroe', position: 'QB', positionGroup: 'QB',
    isStarter: false
  },
]

// Running Backs - VERIFIED from depth chart
const RUNNING_BACKS: OffensivePlayer[] = [
  { 
    jersey: 9, name: 'Kenneth Walker III', position: 'RB', positionGroup: 'SKILL',
    isStarter: true,
    stats2025: { rushingYards: 1027 }
  },
  { 
    jersey: 26, name: 'Zach Charbonnet', position: 'RB', positionGroup: 'SKILL',
    isStarter: false, // IR
    stats2025: { rushingYards: 730 }
  },
  { 
    jersey: 36, name: 'George Holani', position: 'RB', positionGroup: 'SKILL',
    isStarter: false
  },
  { 
    jersey: 40, name: 'Robbie Ouzts', position: 'FB', positionGroup: 'SKILL',
    isStarter: true
  },
  { 
    jersey: 38, name: 'Brady Russell', position: 'FB', positionGroup: 'SKILL',
    isStarter: false
  },
]

// Wide Receivers - VERIFIED from depth chart
const WIDE_RECEIVERS: OffensivePlayer[] = [
  { 
    jersey: 11, name: 'Jaxon Smith-Njigba', position: 'WR', positionGroup: 'SKILL',
    isStarter: true,
    stats2025: { receivingYards: 1793, receptions: 119 } // NFL LEADER
  },
  { 
    jersey: 10, name: 'Cooper Kupp', position: 'WR', positionGroup: 'SKILL',
    isStarter: true,
    stats2025: { receivingYards: 593 }
  },
  { 
    jersey: 22, name: 'Rashid Shaheed', position: 'WR', positionGroup: 'SKILL',
    isStarter: false // Speed/Returns
  },
  { 
    jersey: 19, name: 'Jake Bobo', position: 'WR', positionGroup: 'SKILL',
    isStarter: false
  },
  { 
    jersey: 83, name: 'Dareke Young', position: 'WR', positionGroup: 'SKILL',
    isStarter: false
  },
]

// Tight Ends - VERIFIED from depth chart
const TIGHT_ENDS: OffensivePlayer[] = [
  { 
    jersey: 88, name: 'AJ Barner', position: 'TE', positionGroup: 'SKILL',
    isStarter: true,
    stats2025: { receivingYards: 519 }
  },
  { 
    jersey: 81, name: 'Eric Saubert', position: 'TE', positionGroup: 'SKILL',
    isStarter: false
  },
  { 
    jersey: 89, name: 'Nick Kallerup', position: 'TE', positionGroup: 'SKILL',
    isStarter: false
  },
]

// Offensive Line - VERIFIED from depth chart
const OFFENSIVE_LINE: OffensivePlayer[] = [
  { jersey: 67, name: 'Charles Cross', position: 'OL', positionGroup: 'OL', isStarter: true },
  { jersey: 76, name: 'Grey Zabel', position: 'OL', positionGroup: 'OL', isStarter: true },
  { jersey: 61, name: 'Jalen Sundell', position: 'OL', positionGroup: 'OL', isStarter: true },
  { jersey: 75, name: 'Anthony Bradford', position: 'OL', positionGroup: 'OL', isStarter: true },
  { jersey: 72, name: 'Abraham Lucas', position: 'OL', positionGroup: 'OL', isStarter: true },
  { jersey: 74, name: 'Josh Jones', position: 'OL', positionGroup: 'OL', isStarter: false },
  { jersey: 64, name: 'Christian Haynes', position: 'OL', positionGroup: 'OL', isStarter: false },
  { jersey: 55, name: 'Olu Oluwatimi', position: 'OL', positionGroup: 'OL', isStarter: false },
]

// Full offensive roster
export const OFFENSE_ROSTER: OffensivePlayer[] = [
  ...QUARTERBACKS,
  ...RUNNING_BACKS,
  ...WIDE_RECEIVERS,
  ...TIGHT_ENDS,
  ...OFFENSIVE_LINE,
]

// Get only skill position starters (for QB Mode)
export const SKILL_STARTERS: OffensivePlayer[] = OFFENSE_ROSTER.filter(
  p => p.isStarter && p.positionGroup !== 'OL'
)

// Get receivers for passing targets
export const RECEIVERS: OffensivePlayer[] = [
  ...WIDE_RECEIVERS,
  ...TIGHT_ENDS,
  ...RUNNING_BACKS.filter(p => p.position === 'RB'), // RBs can catch
]

// Get player by jersey number
export function getOffensivePlayer(jersey: number): OffensivePlayer | undefined {
  return OFFENSE_ROSTER.find((p) => p.jersey === jersey)
}

// Get position display color
export function getOffensePositionColor(position: OffensivePlayer['position']): number {
  switch (position) {
    case 'QB':
      return 0x69be28 // Action Green for QB
    case 'RB':
    case 'FB':
      return 0x4ecdc4 // Teal for RBs
    case 'WR':
      return 0xffe66d // Gold for WRs
    case 'TE':
      return 0xff6b6b // Red-ish for TEs
    case 'OL':
      return 0x888888 // Grey for O-Line
    default:
      return 0xffffff
  }
}

// Default starting QB
export const DEFAULT_QB = 14 // Sam Darnold

// Starting receivers for route running
export const STARTING_RECEIVERS = [11, 10, 88] // JSN, Kupp, Barner
