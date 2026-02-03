/**
 * QB Game Logic - Pure functions for game rules
 * 
 * All game mechanics are defined here as pure functions.
 * This makes the game logic testable and predictable.
 */

// ============================================================================
// TYPES
// ============================================================================

export type ThrowTiming = 'perfect' | 'good' | 'early' | 'late' | 'veryLate'
export type CatchTiming = 'perfect' | 'good' | 'early' | 'late' | 'missed'

export type PassOutcome = 
  | 'touchdown'
  | 'complete'
  | 'incomplete'
  | 'interception'
  | 'sack'

export interface ThrowConfig {
  dropChance: number      // 0-1 probability of drop
  intChance: number       // 0-1 probability of interception
  yardBonus: number       // Extra yards for good throws
  spiralQuality: number   // 0-1, affects ball animation
}

export interface FieldPosition {
  yardLine: number        // 0 = own end zone, 100 = opponent end zone
  sideOfField: 'left' | 'middle' | 'right'
}

export interface DriveState {
  down: 1 | 2 | 3 | 4
  yardsToGo: number
  yardLine: number        // Current position (0-100)
  quarter: 1 | 2 | 3 | 4
  timeRemaining: number   // Seconds remaining in quarter
  score: { home: number; away: number }
}

export interface PlayResult {
  outcome: PassOutcome
  yardsGained: number
  newYardLine: number
  isTouchdown: boolean
  isFirstDown: boolean
  isTurnover: boolean
  description: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Throw timing windows (progress 0-1 during route) - TIGHTER for more skill
export const THROW_WINDOWS = {
  early: { min: 0.0, max: 0.40 },
  good: { min: 0.40, max: 0.48 },
  perfect: { min: 0.48, max: 0.58 },  // Narrowed from 20% to 10% window
  goodLate: { min: 0.58, max: 0.68 },
  late: { min: 0.68, max: 0.85 },
  veryLate: { min: 0.85, max: 1.0 },
}

// Catch timing windows (progress 0-1 during ball flight) - TIGHTER for more skill
export const CATCH_WINDOWS = {
  early: { min: 0.0, max: 0.55 },
  good: { min: 0.55, max: 0.72 },
  perfect: { min: 0.72, max: 0.82 },  // Narrowed from 15% to 10% window
  late: { min: 0.82, max: 0.92 },
  missed: { min: 0.92, max: 1.0 },    // Expanded miss window
}

// Throw quality affects completion probability - HARDER
export const THROW_QUALITY_TABLE: Record<ThrowTiming, ThrowConfig> = {
  perfect: { dropChance: 0.05, intChance: 0.01, yardBonus: 6, spiralQuality: 1.0 },
  good: { dropChance: 0.12, intChance: 0.04, yardBonus: 2, spiralQuality: 0.85 },
  early: { dropChance: 0.22, intChance: 0.08, yardBonus: 0, spiralQuality: 0.7 },
  late: { dropChance: 0.28, intChance: 0.12, yardBonus: -2, spiralQuality: 0.6 },
  veryLate: { dropChance: 0.45, intChance: 0.22, yardBonus: -5, spiralQuality: 0.3 },
}

// Catch timing affects the final outcome - LESS FORGIVING
export const CATCH_TIMING_MULTIPLIER: Record<CatchTiming, { dropMod: number; yardMod: number }> = {
  perfect: { dropMod: 0.4, yardMod: 1.3 },  // 60% less likely to drop (was 80%)
  good: { dropMod: 0.8, yardMod: 1.1 },     // 20% less likely to drop (was 40%)
  early: { dropMod: 1.5, yardMod: 0.7 },    // 50% more likely to drop
  late: { dropMod: 1.8, yardMod: 0.5 },     // 80% more likely to drop
  missed: { dropMod: 999, yardMod: 0 },     // Always drops
}

// Field boundaries
export const FIELD_BOUNDS = {
  OWN_END_ZONE: 0,
  OWN_GOAL_LINE: 10,
  OWN_20: 20,
  MIDFIELD: 50,
  OPP_20: 80,
  OPP_GOAL_LINE: 90,
  OPP_END_ZONE: 100,
}

// Quarter duration in seconds (90 seconds per quarter for extended gameplay)
export const QUARTER_DURATION = 90

// ============================================================================
// VARIABLE THROW PHYSICS
// ============================================================================

/**
 * Calculate ball flight duration based on throw distance
 * Short throws = 400ms (quick slants)
 * Deep throws = 1200ms (bombs with hang time)
 */
export function getBallFlightDuration(expectedYards: number): number {
  const minDuration = 300  // Short passes - bullet quick
  const maxDuration = 900  // Deep bombs - faster but still dramatic
  
  // Scale based on yards (5 yards = min, 40+ yards = max)
  const ratio = Math.min(1, Math.max(0, (expectedYards - 5) / 35))
  return Math.round(minDuration + ratio * (maxDuration - minDuration))
}

/**
 * Calculate arc height based on throw distance
 * Short = low bullet pass (5% arc)
 * Deep = high rainbow (20% arc)
 */
export function getBallArcHeight(expectedYards: number): number {
  const minArc = 5   // Bullet pass
  const maxArc = 20  // Rainbow
  
  const ratio = Math.min(1, Math.max(0, (expectedYards - 5) / 35))
  return minArc + ratio * (maxArc - minArc)
}

/**
 * Check if play is a "big play" (triggers superhero replay)
 * TD or 25+ yard gain
 */
export function isBigPlay(outcome: PassOutcome, yardsGained: number): boolean {
  return outcome === 'touchdown' || yardsGained >= 25
}

// ============================================================================
// THROW TIMING FUNCTIONS
// ============================================================================

/**
 * Determine throw timing based on route progress when throw is initiated
 */
export function getThrowTiming(routeProgress: number): ThrowTiming {
  if (routeProgress >= THROW_WINDOWS.perfect.min && routeProgress <= THROW_WINDOWS.perfect.max) {
    return 'perfect'
  }
  if (routeProgress >= THROW_WINDOWS.good.min && routeProgress < THROW_WINDOWS.perfect.min) {
    return 'good'
  }
  if (routeProgress > THROW_WINDOWS.perfect.max && routeProgress <= THROW_WINDOWS.goodLate.max) {
    return 'good'
  }
  if (routeProgress < THROW_WINDOWS.good.min) {
    return 'early'
  }
  if (routeProgress > THROW_WINDOWS.goodLate.max && routeProgress <= THROW_WINDOWS.late.max) {
    return 'late'
  }
  return 'veryLate'
}

/**
 * Determine catch timing based on ball flight progress when catch button is pressed
 */
export function getCatchTiming(ballFlightProgress: number): CatchTiming {
  if (ballFlightProgress >= CATCH_WINDOWS.perfect.min && ballFlightProgress <= CATCH_WINDOWS.perfect.max) {
    return 'perfect'
  }
  if (ballFlightProgress >= CATCH_WINDOWS.good.min && ballFlightProgress < CATCH_WINDOWS.perfect.min) {
    return 'good'
  }
  if (ballFlightProgress > CATCH_WINDOWS.perfect.max && ballFlightProgress <= CATCH_WINDOWS.late.max) {
    return 'late'
  }
  if (ballFlightProgress < CATCH_WINDOWS.good.min) {
    return 'early'
  }
  return 'missed'
}

// ============================================================================
// OUTCOME CALCULATION
// ============================================================================

/**
 * Calculate the outcome of a pass attempt
 */
export function calculatePassOutcome(
  throwTiming: ThrowTiming,
  catchTiming: CatchTiming,
  baseYards: number,
  defenderDistance: number,
  difficulty: number = 1.0
): { outcome: PassOutcome; yardsGained: number } {
  const throwConfig = THROW_QUALITY_TABLE[throwTiming]
  const catchMod = CATCH_TIMING_MULTIPLIER[catchTiming]
  
  // Missed catch is always incomplete
  if (catchTiming === 'missed') {
    return { outcome: 'incomplete', yardsGained: 0 }
  }
  
  // Calculate interception chance (increased by difficulty and tight coverage)
  const coverageFactor = defenderDistance < 30 ? 1.5 : defenderDistance < 50 ? 1.2 : 1.0
  const intChance = throwConfig.intChance * coverageFactor * difficulty
  
  if (Math.random() < intChance) {
    return { outcome: 'interception', yardsGained: 0 }
  }
  
  // Calculate drop chance
  const dropChance = throwConfig.dropChance * catchMod.dropMod * difficulty
  
  if (Math.random() < dropChance) {
    return { outcome: 'incomplete', yardsGained: 0 }
  }
  
  // Complete pass - calculate yards
  const yardsGained = Math.max(0, Math.round(
    (baseYards + throwConfig.yardBonus) * catchMod.yardMod
  ))
  
  return { outcome: 'complete', yardsGained }
}

// ============================================================================
// FIELD POSITION FUNCTIONS
// ============================================================================

/**
 * Clamp yard line to valid field bounds
 */
export function clampYardLine(yardLine: number): number {
  return Math.max(FIELD_BOUNDS.OWN_END_ZONE, Math.min(FIELD_BOUNDS.OPP_END_ZONE, yardLine))
}

/**
 * Check if a yard line is a touchdown
 */
export function isTouchdown(yardLine: number): boolean {
  return yardLine >= FIELD_BOUNDS.OPP_GOAL_LINE
}

/**
 * Check if a yard line is a safety (tackled in own end zone)
 */
export function isSafety(yardLine: number): boolean {
  return yardLine <= FIELD_BOUNDS.OWN_END_ZONE
}

/**
 * Calculate new yard line after a play
 */
export function calculateNewYardLine(currentYardLine: number, yardsGained: number): number {
  const newYardLine = currentYardLine + yardsGained
  return clampYardLine(newYardLine)
}

// ============================================================================
// DRIVE STATE FUNCTIONS
// ============================================================================

/**
 * Process a play result and return updated drive state
 */
export function processPlayResult(
  currentDrive: DriveState,
  result: { outcome: PassOutcome; yardsGained: number }
): { newDrive: DriveState; playResult: PlayResult } {
  const newYardLine = calculateNewYardLine(currentDrive.yardLine, result.yardsGained)
  const isTD = isTouchdown(newYardLine)
  const isFirstDown = result.yardsGained >= currentDrive.yardsToGo
  const isTurnover = result.outcome === 'interception' || 
    (currentDrive.down === 4 && !isFirstDown && result.outcome !== 'touchdown')
  
  let newDown = currentDrive.down
  let newYardsToGo = currentDrive.yardsToGo - result.yardsGained
  let newScore = { ...currentDrive.score }
  let description = ''
  
  // Handle touchdown
  if (isTD && result.outcome === 'complete') {
    newScore.home += 7
    description = 'TOUCHDOWN!'
    // Reset for kickoff
    return {
      newDrive: {
        ...currentDrive,
        yardLine: FIELD_BOUNDS.OWN_20,
        down: 1,
        yardsToGo: 10,
        score: newScore,
      },
      playResult: {
        outcome: 'touchdown',
        yardsGained: result.yardsGained,
        newYardLine,
        isTouchdown: true,
        isFirstDown: false,
        isTurnover: false,
        description,
      },
    }
  }
  
  // Handle first down
  if (isFirstDown && result.outcome === 'complete') {
    newDown = 1
    newYardsToGo = 10
    description = `FIRST DOWN! +${result.yardsGained} yards`
  } else if (result.outcome === 'complete') {
    // Short completion on 4th down = turnover on downs
    if (currentDrive.down === 4) {
      description = `SHORT! TURNOVER ON DOWNS! (+${result.yardsGained} yards)`
      return {
        newDrive: {
          ...currentDrive,
          yardLine: FIELD_BOUNDS.OWN_20,
          down: 1,
          yardsToGo: 10,
        },
        playResult: {
          outcome: 'complete',
          yardsGained: result.yardsGained,
          newYardLine,
          isTouchdown: false,
          isFirstDown: false,
          isTurnover: true,
          description,
        },
      }
    }
    newDown = (currentDrive.down + 1) as 1 | 2 | 3 | 4
    newYardsToGo = Math.max(1, currentDrive.yardsToGo - result.yardsGained)
    description = `Complete for ${result.yardsGained} yards`
  } else if (result.outcome === 'incomplete') {
    // FIXED: Don't cap at 4 - let turnover on downs trigger
    if (currentDrive.down === 4) {
      // Turnover on downs
      description = 'INCOMPLETE - TURNOVER ON DOWNS!'
      return {
        newDrive: {
          ...currentDrive,
          yardLine: FIELD_BOUNDS.OWN_20,
          down: 1,
          yardsToGo: 10,
        },
        playResult: {
          outcome: 'incomplete',
          yardsGained: 0,
          newYardLine: currentDrive.yardLine,
          isTouchdown: false,
          isFirstDown: false,
          isTurnover: true,
          description,
        },
      }
    }
    newDown = (currentDrive.down + 1) as 1 | 2 | 3 | 4
    newYardsToGo = currentDrive.yardsToGo
    description = 'INCOMPLETE'
  } else if (result.outcome === 'interception') {
    description = 'INTERCEPTED!'
    // Turnover - reset position
    return {
      newDrive: {
        ...currentDrive,
        yardLine: FIELD_BOUNDS.OWN_20,
        down: 1,
        yardsToGo: 10,
      },
      playResult: {
        outcome: 'interception',
        yardsGained: 0,
        newYardLine: currentDrive.yardLine,
        isTouchdown: false,
        isFirstDown: false,
        isTurnover: true,
        description,
      },
    }
  } else if (result.outcome === 'sack') {
    const yardsLost = 7
    const sackYardLine = calculateNewYardLine(currentDrive.yardLine, -yardsLost)
    
    // FIXED: Handle 4th down sack as turnover
    if (currentDrive.down === 4) {
      description = `SACKED ON 4TH DOWN! TURNOVER!`
      return {
        newDrive: {
          ...currentDrive,
          yardLine: FIELD_BOUNDS.OWN_20,
          down: 1,
          yardsToGo: 10,
        },
        playResult: {
          outcome: 'sack',
          yardsGained: -yardsLost,
          newYardLine: sackYardLine,
          isTouchdown: false,
          isFirstDown: false,
          isTurnover: true,
          description,
        },
      }
    }
    
    newDown = (currentDrive.down + 1) as 1 | 2 | 3 | 4
    newYardsToGo = currentDrive.yardsToGo + yardsLost
    description = `SACKED! -${yardsLost} yards`
    
    return {
      newDrive: {
        ...currentDrive,
        yardLine: sackYardLine,
        down: newDown,
        yardsToGo: newYardsToGo,
      },
      playResult: {
        outcome: 'sack',
        yardsGained: -yardsLost,
        newYardLine: sackYardLine,
        isTouchdown: false,
        isFirstDown: false,
        isTurnover: false,
        description,
      },
    }
  }
  
  // Check for turnover on downs
  if (newDown > 4) {
    return {
      newDrive: {
        ...currentDrive,
        yardLine: FIELD_BOUNDS.OWN_20,
        down: 1,
        yardsToGo: 10,
      },
      playResult: {
        outcome: result.outcome,
        yardsGained: result.yardsGained,
        newYardLine,
        isTouchdown: false,
        isFirstDown: false,
        isTurnover: true,
        description: 'TURNOVER ON DOWNS',
      },
    }
  }
  
  return {
    newDrive: {
      ...currentDrive,
      yardLine: newYardLine,
      down: newDown,
      yardsToGo: newYardsToGo,
    },
    playResult: {
      outcome: result.outcome,
      yardsGained: result.yardsGained,
      newYardLine,
      isTouchdown: false,
      isFirstDown,
      isTurnover: false,
      description,
    },
  }
}

// ============================================================================
// DIFFICULTY SCALING
// ============================================================================

/**
 * Get difficulty multiplier based on week/stage
 */
export function getDifficultyMultiplier(weekId: number): number {
  // Weeks 1-4: Easy (0.8-1.0)
  // Weeks 5-10: Medium (1.0-1.3)
  // Weeks 11-16: Hard (1.3-1.6)
  // Weeks 17-18: Playoffs (1.6-2.0)
  if (weekId <= 4) return 0.8 + (weekId - 1) * 0.05
  if (weekId <= 10) return 1.0 + (weekId - 5) * 0.05
  if (weekId <= 16) return 1.3 + (weekId - 11) * 0.05
  return 1.6 + (weekId - 17) * 0.2
}

/**
 * Get pocket time in milliseconds based on difficulty
 */
export function getPocketTime(weekId: number): number {
  const basePocketTime = 4000 // 4 seconds base - more pressure
  const difficulty = getDifficultyMultiplier(weekId)
  return Math.max(1800, basePocketTime / difficulty) // Min 1.8 seconds at hardest
}
