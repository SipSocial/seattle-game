/**
 * Playbook - Play definitions with routes
 * 
 * Each play defines routes that receivers will run.
 * Routes are defined as paths with waypoints.
 */

// ============================================================================
// TYPES
// ============================================================================

export type RouteType = 
  | 'slant'
  | 'out'
  | 'in'
  | 'curl'
  | 'corner'
  | 'post'
  | 'go'
  | 'flat'
  | 'wheel'
  | 'drag'
  | 'hitch'

export type PlayCategory = 'quick' | 'medium' | 'deep' | 'trick'

// Coverage types match CoverageShell.tsx for consistency
export type CoverageType = 'cover2' | 'cover3' | 'man' | 'zone' | 'blitz'

// Map detailed coverage to behavior type for defender AI
export type CoverageBehavior = 'zone' | 'man' | 'blitz'

export function getCoverageBehavior(coverage: CoverageType): CoverageBehavior {
  switch (coverage) {
    case 'man':
      return 'man'
    case 'blitz':
      return 'blitz'
    default:
      // cover2, cover3, zone all use zone behavior
      return 'zone'
  }
}

export interface RouteWaypoint {
  x: number  // -50 to 50 (left to right, 0 = center)
  y: number  // 0 to 100 (line of scrimmage to downfield)
  timing: number // 0-1 progress when reaching this point
}

export interface ReceiverRoute {
  receiverIndex: number  // Which receiver runs this route
  type: RouteType
  waypoints: RouteWaypoint[]
  perfectWindow: { start: number; end: number }  // When the receiver is most open
  expectedYards: number  // Average yards if complete
}

export interface PlayDefinition {
  id: string
  name: string
  shortName: string  // For display in playbook panel
  category: PlayCategory
  unlockWeek: number
  routes: ReceiverRoute[]
  description: string
  // Defense coverage options this play is effective against
  bestAgainst?: CoverageType[]
}

/**
 * Get a random defense coverage type based on difficulty
 * This is a duplicate of getRandomCoverage from CoverageShell - 
 * kept here for module independence
 */
export function getDefenseCoverage(difficulty: number): CoverageType {
  const rand = Math.random()
  
  if (difficulty >= 1.5) {
    // Hard mode - more man coverage and blitzes
    if (rand < 0.25) return 'blitz'
    if (rand < 0.5) return 'man'
    if (rand < 0.7) return 'cover3'
    if (rand < 0.85) return 'cover2'
    return 'zone'
  } else if (difficulty >= 1.0) {
    // Medium mode
    if (rand < 0.1) return 'blitz'
    if (rand < 0.3) return 'man'
    if (rand < 0.5) return 'cover3'
    if (rand < 0.75) return 'cover2'
    return 'zone'
  } else {
    // Easy mode - mostly zone
    if (rand < 0.05) return 'blitz'
    if (rand < 0.15) return 'man'
    if (rand < 0.35) return 'cover3'
    if (rand < 0.55) return 'cover2'
    return 'zone'
  }
}

// ============================================================================
// CATEGORY COLORS
// ============================================================================

export const CATEGORY_COLORS: Record<PlayCategory, { primary: string; bg: string }> = {
  quick: { primary: '#69BE28', bg: 'rgba(105,190,40,0.15)' },
  medium: { primary: '#FFD700', bg: 'rgba(255,215,0,0.12)' },
  deep: { primary: '#FF6B35', bg: 'rgba(255,107,53,0.12)' },
  trick: { primary: '#9B59B6', bg: 'rgba(155,89,182,0.12)' },
}

// ============================================================================
// PLAYBOOK
// ============================================================================

export const PLAYBOOK: PlayDefinition[] = [
  // === QUICK PASSES (Week 1) ===
  {
    id: 'slant-flood',
    name: 'Slant Flood',
    shortName: 'SLANT',
    category: 'quick',
    unlockWeek: 1,
    description: 'Quick slants with a flat route underneath',
    routes: [
      {
        receiverIndex: 0,
        type: 'slant',
        waypoints: [
          { x: -25, y: 0, timing: 0 },
          { x: -10, y: 12, timing: 0.5 },
          { x: 5, y: 25, timing: 1 },
        ],
        perfectWindow: { start: 0.4, end: 0.6 },
        expectedYards: 8,
      },
      {
        receiverIndex: 1,
        type: 'flat',
        waypoints: [
          { x: 5, y: 0, timing: 0 },
          { x: 20, y: 3, timing: 0.4 },
          { x: 35, y: 5, timing: 1 },
        ],
        perfectWindow: { start: 0.3, end: 0.5 },
        expectedYards: 5,
      },
      {
        receiverIndex: 2,
        type: 'slant',
        waypoints: [
          { x: 25, y: 0, timing: 0 },
          { x: 10, y: 12, timing: 0.5 },
          { x: -5, y: 25, timing: 1 },
        ],
        perfectWindow: { start: 0.45, end: 0.65 },
        expectedYards: 10,
      },
    ],
  },
  {
    id: 'quick-out',
    name: 'Quick Outs',
    shortName: 'OUTS',
    category: 'quick',
    unlockWeek: 1,
    description: 'Quick out routes to the sidelines',
    routes: [
      {
        receiverIndex: 0,
        type: 'out',
        waypoints: [
          { x: -20, y: 0, timing: 0 },
          { x: -20, y: 8, timing: 0.4 },
          { x: -40, y: 8, timing: 1 },
        ],
        perfectWindow: { start: 0.35, end: 0.55 },
        expectedYards: 6,
      },
      {
        receiverIndex: 1,
        type: 'drag',
        waypoints: [
          { x: 0, y: 0, timing: 0 },
          { x: -15, y: 5, timing: 0.5 },
          { x: -30, y: 5, timing: 1 },
        ],
        perfectWindow: { start: 0.4, end: 0.6 },
        expectedYards: 5,
      },
      {
        receiverIndex: 2,
        type: 'out',
        waypoints: [
          { x: 20, y: 0, timing: 0 },
          { x: 20, y: 8, timing: 0.4 },
          { x: 40, y: 8, timing: 1 },
        ],
        perfectWindow: { start: 0.35, end: 0.55 },
        expectedYards: 6,
      },
    ],
  },
  {
    id: 'mesh',
    name: 'Mesh Concept',
    shortName: 'MESH',
    category: 'quick',
    unlockWeek: 1,
    description: 'Crossing routes that mesh in the middle',
    routes: [
      {
        receiverIndex: 0,
        type: 'drag',
        waypoints: [
          { x: -25, y: 0, timing: 0 },
          { x: -15, y: 6, timing: 0.3 },
          { x: 15, y: 6, timing: 0.7 },
          { x: 30, y: 8, timing: 1 },
        ],
        perfectWindow: { start: 0.5, end: 0.7 },
        expectedYards: 7,
      },
      {
        receiverIndex: 1,
        type: 'go',
        waypoints: [
          { x: 0, y: 0, timing: 0 },
          { x: 0, y: 20, timing: 0.5 },
          { x: 0, y: 40, timing: 1 },
        ],
        perfectWindow: { start: 0.6, end: 0.8 },
        expectedYards: 15,
      },
      {
        receiverIndex: 2,
        type: 'drag',
        waypoints: [
          { x: 25, y: 0, timing: 0 },
          { x: 15, y: 6, timing: 0.3 },
          { x: -15, y: 6, timing: 0.7 },
          { x: -30, y: 8, timing: 1 },
        ],
        perfectWindow: { start: 0.5, end: 0.7 },
        expectedYards: 7,
      },
    ],
  },

  // === MEDIUM PASSES (Week 2) ===
  {
    id: 'curl-flat',
    name: 'Curl Flat',
    shortName: 'CURL',
    category: 'medium',
    unlockWeek: 2,
    description: 'Curl routes with flat option',
    routes: [
      {
        receiverIndex: 0,
        type: 'curl',
        waypoints: [
          { x: -25, y: 0, timing: 0 },
          { x: -25, y: 15, timing: 0.6 },
          { x: -20, y: 12, timing: 1 },
        ],
        perfectWindow: { start: 0.55, end: 0.75 },
        expectedYards: 12,
      },
      {
        receiverIndex: 1,
        type: 'flat',
        waypoints: [
          { x: 0, y: 0, timing: 0 },
          { x: -20, y: 3, timing: 0.5 },
          { x: -35, y: 3, timing: 1 },
        ],
        perfectWindow: { start: 0.35, end: 0.55 },
        expectedYards: 4,
      },
      {
        receiverIndex: 2,
        type: 'corner',
        waypoints: [
          { x: 25, y: 0, timing: 0 },
          { x: 25, y: 12, timing: 0.4 },
          { x: 40, y: 25, timing: 1 },
        ],
        perfectWindow: { start: 0.5, end: 0.7 },
        expectedYards: 18,
      },
    ],
  },
  {
    id: 'smash',
    name: 'Smash Concept',
    shortName: 'SMASH',
    category: 'medium',
    unlockWeek: 2,
    description: 'High-low concept with hitch and corner',
    routes: [
      {
        receiverIndex: 0,
        type: 'hitch',
        waypoints: [
          { x: -25, y: 0, timing: 0 },
          { x: -25, y: 6, timing: 0.5 },
          { x: -28, y: 5, timing: 1 },
        ],
        perfectWindow: { start: 0.4, end: 0.6 },
        expectedYards: 5,
      },
      {
        receiverIndex: 1,
        type: 'corner',
        waypoints: [
          { x: -10, y: 0, timing: 0 },
          { x: -10, y: 12, timing: 0.4 },
          { x: -30, y: 25, timing: 1 },
        ],
        perfectWindow: { start: 0.55, end: 0.75 },
        expectedYards: 20,
      },
      {
        receiverIndex: 2,
        type: 'hitch',
        waypoints: [
          { x: 25, y: 0, timing: 0 },
          { x: 25, y: 6, timing: 0.5 },
          { x: 28, y: 5, timing: 1 },
        ],
        perfectWindow: { start: 0.4, end: 0.6 },
        expectedYards: 5,
      },
    ],
  },

  // === DEEP PASSES (Week 3) ===
  {
    id: 'five-verts',
    name: 'Five Verticals',
    shortName: 'VERTS',
    category: 'deep',
    unlockWeek: 3,
    description: 'All 5 receivers run go routes - max vertical threat',
    routes: [
      {
        receiverIndex: 0,
        type: 'go',
        waypoints: [
          { x: -38, y: 0, timing: 0 },
          { x: -38, y: 30, timing: 0.5 },
          { x: -38, y: 60, timing: 1 },
        ],
        perfectWindow: { start: 0.6, end: 0.8 },
        expectedYards: 35,
      },
      {
        receiverIndex: 1,
        type: 'go',
        waypoints: [
          { x: -18, y: 0, timing: 0 },
          { x: -18, y: 30, timing: 0.5 },
          { x: -18, y: 60, timing: 1 },
        ],
        perfectWindow: { start: 0.6, end: 0.8 },
        expectedYards: 28,
      },
      {
        receiverIndex: 2,
        type: 'go',
        waypoints: [
          { x: 0, y: 0, timing: 0 },
          { x: 0, y: 30, timing: 0.5 },
          { x: 0, y: 60, timing: 1 },
        ],
        perfectWindow: { start: 0.55, end: 0.75 },
        expectedYards: 25,
      },
      {
        receiverIndex: 3,
        type: 'go',
        waypoints: [
          { x: 18, y: 0, timing: 0 },
          { x: 18, y: 30, timing: 0.5 },
          { x: 18, y: 60, timing: 1 },
        ],
        perfectWindow: { start: 0.6, end: 0.8 },
        expectedYards: 28,
      },
      {
        receiverIndex: 4,
        type: 'go',
        waypoints: [
          { x: 38, y: 0, timing: 0 },
          { x: 38, y: 30, timing: 0.5 },
          { x: 38, y: 60, timing: 1 },
        ],
        perfectWindow: { start: 0.6, end: 0.8 },
        expectedYards: 35,
      },
    ],
  },
  {
    id: 'post-corner',
    name: 'Post Corner',
    shortName: 'POST',
    category: 'deep',
    unlockWeek: 3,
    description: 'Post route with corner combo',
    routes: [
      {
        receiverIndex: 0,
        type: 'post',
        waypoints: [
          { x: -25, y: 0, timing: 0 },
          { x: -25, y: 15, timing: 0.4 },
          { x: -5, y: 35, timing: 1 },
        ],
        perfectWindow: { start: 0.55, end: 0.75 },
        expectedYards: 25,
      },
      {
        receiverIndex: 1,
        type: 'flat',
        waypoints: [
          { x: 0, y: 0, timing: 0 },
          { x: -15, y: 3, timing: 0.5 },
          { x: -25, y: 3, timing: 1 },
        ],
        perfectWindow: { start: 0.35, end: 0.55 },
        expectedYards: 4,
      },
      {
        receiverIndex: 2,
        type: 'corner',
        waypoints: [
          { x: 25, y: 0, timing: 0 },
          { x: 25, y: 15, timing: 0.4 },
          { x: 45, y: 30, timing: 1 },
        ],
        perfectWindow: { start: 0.5, end: 0.7 },
        expectedYards: 22,
      },
    ],
  },

  // === TRICK PLAYS (Week 5) ===
  {
    id: 'wheel',
    name: 'Wheel Route',
    shortName: 'WHEEL',
    category: 'trick',
    unlockWeek: 5,
    description: 'RB wheel route for big play',
    routes: [
      {
        receiverIndex: 0,
        type: 'curl',
        waypoints: [
          { x: -25, y: 0, timing: 0 },
          { x: -25, y: 12, timing: 0.5 },
          { x: -20, y: 10, timing: 1 },
        ],
        perfectWindow: { start: 0.45, end: 0.65 },
        expectedYards: 10,
      },
      {
        receiverIndex: 1,
        type: 'wheel',
        waypoints: [
          { x: 5, y: -5, timing: 0 },
          { x: -10, y: 0, timing: 0.2 },
          { x: -25, y: 8, timing: 0.4 },
          { x: -35, y: 30, timing: 0.7 },
          { x: -40, y: 50, timing: 1 },
        ],
        perfectWindow: { start: 0.6, end: 0.8 },
        expectedYards: 35,
      },
      {
        receiverIndex: 2,
        type: 'go',
        waypoints: [
          { x: 25, y: 0, timing: 0 },
          { x: 25, y: 25, timing: 0.5 },
          { x: 25, y: 50, timing: 1 },
        ],
        perfectWindow: { start: 0.65, end: 0.85 },
        expectedYards: 28,
      },
    ],
  },
  {
    id: 'texas',
    name: 'Texas Route',
    shortName: 'TEXAS',
    category: 'trick',
    unlockWeek: 5,
    description: 'RB angle route with crossers',
    routes: [
      {
        receiverIndex: 0,
        type: 'in',
        waypoints: [
          { x: -25, y: 0, timing: 0 },
          { x: -25, y: 12, timing: 0.4 },
          { x: 10, y: 12, timing: 1 },
        ],
        perfectWindow: { start: 0.5, end: 0.7 },
        expectedYards: 12,
      },
      {
        receiverIndex: 1,
        type: 'flat',
        waypoints: [
          { x: 5, y: -5, timing: 0 },
          { x: 20, y: 3, timing: 0.3 },
          { x: 35, y: 15, timing: 0.7 },
          { x: 40, y: 25, timing: 1 },
        ],
        perfectWindow: { start: 0.55, end: 0.75 },
        expectedYards: 18,
      },
      {
        receiverIndex: 2,
        type: 'go',
        waypoints: [
          { x: 30, y: 0, timing: 0 },
          { x: 30, y: 25, timing: 0.5 },
          { x: 30, y: 50, timing: 1 },
        ],
        perfectWindow: { start: 0.65, end: 0.85 },
        expectedYards: 30,
      },
    ],
  },
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get plays available for a given week
 */
export function getAvailablePlays(weekId: number): PlayDefinition[] {
  return PLAYBOOK.filter(play => play.unlockWeek <= weekId)
}

/**
 * Get a play by ID
 */
export function getPlayById(id: string): PlayDefinition | undefined {
  return PLAYBOOK.find(play => play.id === id)
}

/**
 * Calculate receiver position at a given route progress
 * 
 * Uses UNIFIED COORDINATE SYSTEM from coordinates.ts
 * 
 * Waypoint coordinates:
 * - x: -50 to 50 (left to right, 0 = center)
 * - y: 0 to 60 (yards downfield from line of scrimmage)
 * 
 * Screen coordinates:
 * - x: scaled for mobile (-35 to 35)
 * - y: 0-100% (lower Y = toward opponent's end zone at TOP)
 * 
 * You advance UPWARD on screen (decreasing Y values)
 */
export function getReceiverPosition(
  route: ReceiverRoute,
  progress: number,
  lineOfScrimmageY: number
): { x: number; y: number } {
  const waypoints = route.waypoints
  
  // Scale factors - aligned with field coordinate system (76% range for 100 yards)
  const xScale = 0.85  // Lateral movement (wider spread)
  const yScale = 0.76  // Vertical movement - matches field (76% / 100 yards)
  
  // Receivers run UPWARD (decreasing Y) toward opponent's end zone at TOP
  const getScaledPos = (wp: { x: number; y: number }) => ({
    x: wp.x * xScale,
    y: lineOfScrimmageY - (wp.y * yScale), // SUBTRACT to move toward top (opponent's end zone)
  })
  
  if (progress <= 0) {
    return getScaledPos(waypoints[0])
  }
  
  if (progress >= 1) {
    return getScaledPos(waypoints[waypoints.length - 1])
  }
  
  // Find the two waypoints we're between
  for (let i = 0; i < waypoints.length - 1; i++) {
    const current = waypoints[i]
    const next = waypoints[i + 1]
    
    if (progress >= current.timing && progress <= next.timing) {
      const segmentProgress = (progress - current.timing) / (next.timing - current.timing)
      const interpolated = {
        x: current.x + (next.x - current.x) * segmentProgress,
        y: current.y + (next.y - current.y) * segmentProgress,
      }
      return getScaledPos(interpolated)
    }
  }
  
  // Fallback
  return getScaledPos(waypoints[waypoints.length - 1])
}

/**
 * Check if receiver is in their perfect window
 */
export function isInPerfectWindow(route: ReceiverRoute, progress: number): boolean {
  return progress >= route.perfectWindow.start && progress <= route.perfectWindow.end
}
