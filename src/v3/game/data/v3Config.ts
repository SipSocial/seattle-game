/**
 * V3 Game Configuration
 * 
 * All tuning knobs for offense and defense gameplay
 * Inspired by QB Legend mechanics with Dark Side flavor
 */

// ============================================================================
// Clock Configuration (QB Legend Style)
// ============================================================================

export const CLOCK_CONFIG = {
  /** Milliseconds per quarter (1 minute like QB Legend) */
  quarterLengthMs: 60000,
  
  /** Number of quarters */
  quarters: 4,
  
  /** Total game time in ms (4 minutes) */
  totalGameMs: 60000 * 4,
  
  /** Whether to use play clock (QB Legend doesn't) */
  usePlayClock: false,
  
  /** Clock stops on: incomplete, out of bounds, touchdown, quarter end */
  clockStopsOn: ['incomplete', 'outOfBounds', 'touchdown', 'turnover', 'quarterEnd'] as const,
}

// ============================================================================
// Auto-Snap Timing Configuration
// ============================================================================

export const SNAP_TIMING = {
  /** Base snap delay in ms (Week 1 - easiest) */
  baseDelayMs: 3000,
  
  /** Minimum snap delay in ms (Week 17+ - hardest) */
  minDelayMs: 1000,
  
  /** Delay reduction per week: (3000-1000)/16 = 125ms per week */
  reductionPerWeek: 125,
  
  /** Whether to show visual countdown */
  visualCountdown: true,
  
  /** Whether to play audio countdown ("HUT HUT") */
  audioCountdown: true,
  
  /** Countdown steps to show (e.g., 3, 2, 1, HUT!) */
  countdownSteps: [3, 2, 1, 0] as const,
}

/**
 * Get snap delay for a given week
 * Week 1 = 3000ms, Week 17 = 1000ms
 */
export function getSnapDelay(weekId: number): number {
  const reduction = (weekId - 1) * SNAP_TIMING.reductionPerWeek
  return Math.max(SNAP_TIMING.minDelayMs, SNAP_TIMING.baseDelayMs - reduction)
}

// ============================================================================
// Rules Configuration
// ============================================================================

export const RULES_CONFIG = {
  /** Downs to gain first down */
  downsPerSeries: 4,
  
  /** Yards needed for first down */
  yardsForFirstDown: 20,
  
  /** Points for touchdown (includes extra point) */
  touchdownPoints: 7,
  
  /** Points for safety */
  safetyPoints: 2,
  
  /** Starting yard line after touchback */
  touchbackYardLine: 25,
  
  /** Field length in yards */
  fieldLength: 100,
}

// ============================================================================
// Offense Configuration
// ============================================================================

export const OFFENSE_CONFIG = {
  // === Movement Speeds (pixels per second) ===
  movement: {
    /** QB movement in pocket */
    qbPocketSpeed: 180,
    
    /** QB scramble speed */
    qbScrambleSpeed: 250,
    
    /** Receiver route running speed */
    receiverRouteSpeed: 220,
    
    /** Runner speed after catch */
    yacRunnerSpeed: 280,
    
    /** Ball flight speed */
    ballSpeed: 450,
  },
  
  // === Throwing Mechanics ===
  throwing: {
    /** Quick tap = bullet pass */
    bulletHoldMs: 0,
    
    /** Hold threshold for lob pass */
    lobHoldMs: 300,
    
    /** Bullet pass arc (lower = flatter) */
    bulletArc: 0.2,
    
    /** Lob pass arc (higher = floatier) */
    lobArc: 0.6,
  },
  
  // === Timing Windows ===
  timing: {
    /** Window when receiver is "open" at route break (ms) */
    openWindowMs: 800,
    
    /** Perfect throw bonus window within open window (ms) */
    perfectThrowMs: 300,
    
    /** Catch radius when receiver is open (pixels) */
    catchRadiusOpen: 45,
    
    /** Catch radius when receiver is contested (pixels) */
    catchRadiusContested: 20,
    
    /** Drop rate when contested (0-1) */
    contestedDropRate: 0.3,
  },
  
  // === Spin/Juke Mechanics ===
  juke: {
    /** Speed multiplier during juke */
    speedMultiplier: 1.5,
    
    /** Juke duration (ms) */
    durationMs: 400,
    
    /** Uses per play (QB Legend = 1) */
    usesPerPlay: 1,
    
    /** Invincibility during juke */
    invincible: true,
  },
  
  // === Pressure System ===
  pressure: {
    /** Time before pressure starts building (ms) */
    pressureStartMs: 1500,
    
    /** Time to max pressure (ms) */
    pressureMaxMs: 4000,
    
    /** Accuracy penalty at max pressure (0-1) */
    maxPressurePenalty: 0.4,
    
    /** Timing window shrink at max pressure (0-1) */
    windowShrinkAtMax: 0.5,
  },
}

// ============================================================================
// Defense Configuration
// ============================================================================

export const DEFENSE_CONFIG = {
  // === Movement Speeds ===
  movement: {
    /** Player-controlled defender speed */
    playerDefenderSpeed: 280,
    
    /** AI defender speed */
    aiDefenderSpeed: 240,
    
    /** Speed boost when on correct pursuit angle */
    pursuitAngleBonus: 1.15,
  },
  
  // === Tackle Mechanics ===
  tackle: {
    /** Distance for tackle attempt (pixels) */
    tackleRadius: 40,
    
    /** Perfect tackle timing window (ms) */
    perfectTackleWindowMs: 200,
    
    /** Chance to miss if tackle too early */
    earlyTackleMissRate: 0.35,
    
    /** Cooldown between tackle attempts (ms) */
    tackleCooldownMs: 600,
    
    /** Dive tackle distance bonus */
    diveTackleRadiusBonus: 1.4,
    
    /** Dive tackle miss rate */
    diveTackleMissRate: 0.5,
  },
  
  // === Pass Rush ===
  passRush: {
    /** Distance from QB for sack (pixels) */
    sackRadius: 35,
    
    /** Distance for QB pressure effect (pixels) */
    pressureRadius: 100,
    
    /** AI QB throw window (ms) - time before AI throws */
    aiQbThrowWindowMs: 2500,
  },
  
  // === Coverage Types ===
  coverage: {
    man: {
      /** Speed bonus vs assigned receiver */
      speedBonus: 1.1,
      /** Reaction delay to route breaks (ms) */
      reactionDelayMs: 0,
      /** Penalty vs other receivers */
      offReceiverPenalty: 0.7,
    },
    zone: {
      /** Speed in zone */
      speedMultiplier: 1.0,
      /** React to ball in air */
      breakOnBall: true,
      /** Zone coverage gap (vulnerability) */
      seamVulnerability: 0.3,
    },
    blitz: {
      /** Pass rush speed bonus */
      passRushSpeedBonus: 1.35,
      /** Coverage weakness (fewer defenders) */
      coverageSpeedPenalty: 0.75,
      /** Extra pressure buildup speed */
      pressureMultiplier: 1.5,
    },
  },
}

// ============================================================================
// Difficulty Scaling
// ============================================================================

export interface DifficultyModifiers {
  /** Timing window multiplier (>1 = easier) */
  timingWindowMultiplier: number
  /** Defender speed multiplier (<1 = easier) */
  defenderSpeedMultiplier: number
  /** Open window visibility (>1 = more obvious) */
  openIndicatorStrength: number
  /** AI coverage reaction delay (>0 = slower) */
  coverageReactionDelayMs: number
  /** Contested catch rate modifier */
  contestedCatchBonus: number
}

export const DIFFICULTY_BY_WEEK: Record<number, DifficultyModifiers> = {
  // Week 1-4: Easy
  1: { timingWindowMultiplier: 1.3, defenderSpeedMultiplier: 0.7, openIndicatorStrength: 1.5, coverageReactionDelayMs: 300, contestedCatchBonus: 0.2 },
  2: { timingWindowMultiplier: 1.25, defenderSpeedMultiplier: 0.75, openIndicatorStrength: 1.4, coverageReactionDelayMs: 250, contestedCatchBonus: 0.15 },
  3: { timingWindowMultiplier: 1.2, defenderSpeedMultiplier: 0.8, openIndicatorStrength: 1.3, coverageReactionDelayMs: 200, contestedCatchBonus: 0.1 },
  4: { timingWindowMultiplier: 1.15, defenderSpeedMultiplier: 0.85, openIndicatorStrength: 1.2, coverageReactionDelayMs: 150, contestedCatchBonus: 0.1 },
  
  // Week 5-8: Medium
  5: { timingWindowMultiplier: 1.1, defenderSpeedMultiplier: 0.9, openIndicatorStrength: 1.1, coverageReactionDelayMs: 100, contestedCatchBonus: 0.05 },
  6: { timingWindowMultiplier: 1.05, defenderSpeedMultiplier: 0.95, openIndicatorStrength: 1.0, coverageReactionDelayMs: 50, contestedCatchBonus: 0.05 },
  7: { timingWindowMultiplier: 1.0, defenderSpeedMultiplier: 1.0, openIndicatorStrength: 1.0, coverageReactionDelayMs: 0, contestedCatchBonus: 0 },
  8: { timingWindowMultiplier: 1.0, defenderSpeedMultiplier: 1.0, openIndicatorStrength: 0.9, coverageReactionDelayMs: 0, contestedCatchBonus: 0 },
  
  // Week 9-12: Medium-Hard
  9: { timingWindowMultiplier: 0.95, defenderSpeedMultiplier: 1.05, openIndicatorStrength: 0.8, coverageReactionDelayMs: 0, contestedCatchBonus: -0.05 },
  10: { timingWindowMultiplier: 0.9, defenderSpeedMultiplier: 1.1, openIndicatorStrength: 0.7, coverageReactionDelayMs: 0, contestedCatchBonus: -0.05 },
  11: { timingWindowMultiplier: 0.85, defenderSpeedMultiplier: 1.15, openIndicatorStrength: 0.6, coverageReactionDelayMs: 0, contestedCatchBonus: -0.1 },
  12: { timingWindowMultiplier: 0.85, defenderSpeedMultiplier: 1.15, openIndicatorStrength: 0.5, coverageReactionDelayMs: 0, contestedCatchBonus: -0.1 },
  
  // Week 13-17: Hard
  13: { timingWindowMultiplier: 0.8, defenderSpeedMultiplier: 1.2, openIndicatorStrength: 0.4, coverageReactionDelayMs: 0, contestedCatchBonus: -0.15 },
  14: { timingWindowMultiplier: 0.8, defenderSpeedMultiplier: 1.2, openIndicatorStrength: 0.3, coverageReactionDelayMs: 0, contestedCatchBonus: -0.15 },
  15: { timingWindowMultiplier: 0.75, defenderSpeedMultiplier: 1.25, openIndicatorStrength: 0.2, coverageReactionDelayMs: 0, contestedCatchBonus: -0.15 },
  16: { timingWindowMultiplier: 0.75, defenderSpeedMultiplier: 1.25, openIndicatorStrength: 0.2, coverageReactionDelayMs: 0, contestedCatchBonus: -0.2 },
  17: { timingWindowMultiplier: 0.7, defenderSpeedMultiplier: 1.3, openIndicatorStrength: 0.1, coverageReactionDelayMs: 0, contestedCatchBonus: -0.2 },
  
  // Playoffs: Very Hard
  18: { timingWindowMultiplier: 0.65, defenderSpeedMultiplier: 1.35, openIndicatorStrength: 0, coverageReactionDelayMs: 0, contestedCatchBonus: -0.25 },
  19: { timingWindowMultiplier: 0.6, defenderSpeedMultiplier: 1.4, openIndicatorStrength: 0, coverageReactionDelayMs: 0, contestedCatchBonus: -0.25 },
  
  // Super Bowl: Elite
  20: { timingWindowMultiplier: 0.55, defenderSpeedMultiplier: 1.45, openIndicatorStrength: 0, coverageReactionDelayMs: 0, contestedCatchBonus: -0.3 },
}

/**
 * Get difficulty modifiers for a given week
 */
export function getDifficultyModifiers(weekId: number): DifficultyModifiers {
  return DIFFICULTY_BY_WEEK[weekId] || DIFFICULTY_BY_WEEK[7] // Default to week 7 (baseline)
}

// ============================================================================
// Route Definitions
// ============================================================================

export interface RouteDefinition {
  name: string
  /** Initial angle (degrees, 0 = straight up) */
  startAngle: number
  /** Depth of route in yards */
  depth: number
  /** Yard line where route breaks */
  breakDepth: number | null
  /** Angle after break */
  breakAngle: number | null
  /** Route speed multiplier */
  speedMultiplier: number
}

export const ROUTES: Record<string, RouteDefinition> = {
  slant: {
    name: 'Slant',
    startAngle: 0,
    depth: 8,
    breakDepth: 3,
    breakAngle: 45,
    speedMultiplier: 1.0,
  },
  out: {
    name: 'Out',
    startAngle: 0,
    depth: 10,
    breakDepth: 8,
    breakAngle: 90,
    speedMultiplier: 0.95,
  },
  go: {
    name: 'Go',
    startAngle: 0,
    depth: 40,
    breakDepth: null,
    breakAngle: null,
    speedMultiplier: 1.1,
  },
  curl: {
    name: 'Curl',
    startAngle: 0,
    depth: 12,
    breakDepth: 12,
    breakAngle: 180,
    speedMultiplier: 0.9,
  },
  post: {
    name: 'Post',
    startAngle: 0,
    depth: 20,
    breakDepth: 12,
    breakAngle: 45,
    speedMultiplier: 1.05,
  },
  corner: {
    name: 'Corner',
    startAngle: 0,
    depth: 20,
    breakDepth: 12,
    breakAngle: -45,
    speedMultiplier: 1.05,
  },
  flat: {
    name: 'Flat',
    startAngle: 90,
    depth: 3,
    breakDepth: null,
    breakAngle: null,
    speedMultiplier: 0.85,
  },
  drag: {
    name: 'Drag',
    startAngle: 0,
    depth: 5,
    breakDepth: 5,
    breakAngle: 90,
    speedMultiplier: 0.9,
  },
}

// ============================================================================
// Play Packages
// ============================================================================

export interface PlayPackage {
  name: string
  routes: string[] // Route names for each receiver position
}

export const OFFENSE_PLAYS: PlayPackage[] = [
  { name: 'Slant Flood', routes: ['slant', 'out', 'go'] },
  { name: 'Curl Flat', routes: ['curl', 'flat', 'go'] },
  { name: 'Four Verticals', routes: ['go', 'go', 'post'] },
  { name: 'Mesh', routes: ['drag', 'drag', 'curl'] },
  { name: 'Smash', routes: ['corner', 'flat', 'out'] },
  { name: 'Spacing', routes: ['out', 'slant', 'flat'] },
]

export const DEFENSE_PLAYS = ['man', 'zone', 'blitz'] as const
export type DefensePlay = typeof DEFENSE_PLAYS[number]
