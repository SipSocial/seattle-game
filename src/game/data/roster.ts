/**
 * Darkside Defensive Roster
 * Full 24-player defense - jersey numbers only (no names for trademark)
 */

export interface Defender {
  jersey: number
  position: 'DE' | 'DT' | 'LB' | 'EDGE' | 'CB' | 'S'
  positionGroup: 'DL' | 'LB' | 'DB'
}

// Defensive Line (6 players)
const DEFENSIVE_LINE: Defender[] = [
  { jersey: 90, position: 'DT', positionGroup: 'DL' },
  { jersey: 91, position: 'DT', positionGroup: 'DL' },
  { jersey: 94, position: 'DE', positionGroup: 'DL' },
  { jersey: 95, position: 'DT', positionGroup: 'DL' },
  { jersey: 98, position: 'DE', positionGroup: 'DL' },
  { jersey: 99, position: 'DE', positionGroup: 'DL' },
]

// Linebackers (10 players)
const LINEBACKERS: Defender[] = [
  { jersey: 0, position: 'EDGE', positionGroup: 'LB' },
  { jersey: 7, position: 'LB', positionGroup: 'LB' },
  { jersey: 13, position: 'LB', positionGroup: 'LB' },
  { jersey: 42, position: 'LB', positionGroup: 'LB' },
  { jersey: 48, position: 'LB', positionGroup: 'LB' },
  { jersey: 51, position: 'LB', positionGroup: 'LB' },
  { jersey: 52, position: 'LB', positionGroup: 'LB' },
  { jersey: 53, position: 'EDGE', positionGroup: 'LB' },
  { jersey: 57, position: 'LB', positionGroup: 'LB' },
  { jersey: 58, position: 'LB', positionGroup: 'LB' },
]

// Cornerbacks (4 players)
const CORNERBACKS: Defender[] = [
  { jersey: 21, position: 'CB', positionGroup: 'DB' },
  { jersey: 27, position: 'CB', positionGroup: 'DB' },
  { jersey: 28, position: 'CB', positionGroup: 'DB' },
  { jersey: 29, position: 'CB', positionGroup: 'DB' },
]

// Safeties (4 players)
const SAFETIES: Defender[] = [
  { jersey: 3, position: 'S', positionGroup: 'DB' },
  { jersey: 8, position: 'S', positionGroup: 'DB' },
  { jersey: 20, position: 'S', positionGroup: 'DB' },
  { jersey: 39, position: 'S', positionGroup: 'DB' },
]

// Full roster - sorted by jersey number for display
export const FULL_ROSTER: Defender[] = [
  ...DEFENSIVE_LINE,
  ...LINEBACKERS,
  ...CORNERBACKS,
  ...SAFETIES,
].sort((a, b) => a.jersey - b.jersey)

// Get defender by jersey number
export function getDefender(jersey: number): Defender | undefined {
  return FULL_ROSTER.find((d) => d.jersey === jersey)
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

// Default starting defender
export const DEFAULT_DEFENDER = 21 // Star corner
