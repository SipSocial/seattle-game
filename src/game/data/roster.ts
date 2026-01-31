/**
 * Seattle Seahawks 2025 Defensive Roster
 * Real players with names and jersey numbers
 */

export interface Defender {
  jersey: number
  name: string
  position: 'DE' | 'DT' | 'LB' | 'EDGE' | 'CB' | 'S'
  positionGroup: 'DL' | 'LB' | 'DB'
}

// Defensive Line (6 players)
const DEFENSIVE_LINE: Defender[] = [
  { jersey: 99, name: 'Leonard Williams', position: 'DE', positionGroup: 'DL' },
  { jersey: 98, name: 'Rylie Mills', position: 'DE', positionGroup: 'DL' },
  { jersey: 94, name: 'Mike Morris', position: 'DE', positionGroup: 'DL' },
  { jersey: 91, name: 'Byron Murphy II', position: 'DT', positionGroup: 'DL' },
  { jersey: 90, name: 'Jarran Reed', position: 'DT', positionGroup: 'DL' },
  { jersey: 95, name: 'Brandon Pili', position: 'DT', positionGroup: 'DL' },
]

// Linebackers (10 players)
const LINEBACKERS: Defender[] = [
  { jersey: 0, name: 'DeMarcus Lawrence', position: 'EDGE', positionGroup: 'LB' },
  { jersey: 58, name: 'Derick Hall', position: 'EDGE', positionGroup: 'LB' },
  { jersey: 53, name: 'Boye Mafe', position: 'EDGE', positionGroup: 'LB' },
  { jersey: 7, name: 'Uchenna Nwosu', position: 'EDGE', positionGroup: 'LB' },
  { jersey: 13, name: 'Ernest Jones IV', position: 'LB', positionGroup: 'LB' },
  { jersey: 48, name: 'Tyrice Knight', position: 'LB', positionGroup: 'LB' },
  { jersey: 51, name: 'Jared Ivey', position: 'LB', positionGroup: 'LB' },
  { jersey: 57, name: "Connor O'Toole", position: 'LB', positionGroup: 'LB' },
  { jersey: 42, name: 'Drake Thomas', position: 'LB', positionGroup: 'LB' },
  { jersey: 52, name: "Patrick O'Connell", position: 'LB', positionGroup: 'LB' },
]

// Cornerbacks (4 players)
const CORNERBACKS: Defender[] = [
  { jersey: 21, name: 'Devon Witherspoon', position: 'CB', positionGroup: 'DB' },
  { jersey: 27, name: 'Riq Woolen', position: 'CB', positionGroup: 'DB' },
  { jersey: 29, name: 'Josh Jobe', position: 'CB', positionGroup: 'DB' },
  { jersey: 28, name: 'Nehemiah Pritchett', position: 'CB', positionGroup: 'DB' },
]

// Safeties (4 players)
const SAFETIES: Defender[] = [
  { jersey: 8, name: 'Coby Bryant', position: 'S', positionGroup: 'DB' },
  { jersey: 3, name: 'Nick Emmanwori', position: 'S', positionGroup: 'DB' },
  { jersey: 20, name: 'Julian Love', position: 'S', positionGroup: 'DB' },
  { jersey: 39, name: 'Ty Okada', position: 'S', positionGroup: 'DB' },
]

// Full roster - sorted by position group then jersey for better organization
export const FULL_ROSTER: Defender[] = [
  ...DEFENSIVE_LINE,
  ...LINEBACKERS,
  ...CORNERBACKS,
  ...SAFETIES,
]

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

// Default starting defender - Devon Witherspoon (star corner)
export const DEFAULT_DEFENDER = 21
