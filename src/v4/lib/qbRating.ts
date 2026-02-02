/**
 * QB Rating Calculations for Dark Side Football
 * 
 * Implements the official NFL Passer Rating formula plus
 * custom game-specific rating calculations.
 */

// ============================================================================
// Types
// ============================================================================

export interface QBPassingStats {
  completions: number
  attempts: number
  passingYards: number
  touchdowns: number
  interceptions: number
}

export interface ThrowQuality {
  perfect: number    // On-target, optimal timing
  good: number       // Catchable, minor timing issues
  late: number       // Delayed release, defender closing
  inaccurate: number // Off-target throws
}

export interface PocketStats {
  avgTimeInPocket: number      // Average milliseconds
  quickReleases: number        // Throws under 2s
  pressuredThrows: number      // Throws under duress
  sacksAllowed: number         // Times sacked
  escapesFromPocket: number    // Successful scrambles
}

export interface ComprehensiveQBStats extends QBPassingStats {
  throwQuality: ThrowQuality
  pocket: PocketStats
  yardsPerAttempt: number
  completionPercentage: number
  passerRating: number
  gameRating: number // Custom 0-100 score
}

// ============================================================================
// NFL Passer Rating Formula
// ============================================================================

/**
 * Calculate NFL Passer Rating
 * 
 * The official NFL formula calculates four components:
 * a = ((Comp/Att) - 0.3) × 5
 * b = ((Yds/Att) - 3) × 0.25
 * c = (TD/Att) × 20
 * d = 2.375 - ((Int/Att) × 25)
 * 
 * Each is capped between 0 and 2.375
 * Rating = ((a + b + c + d) / 6) × 100
 * 
 * Perfect rating: 158.3
 * 
 * @param stats - QB passing stats
 * @returns NFL passer rating (0-158.3)
 */
export function calculateNFLPasserRating(stats: QBPassingStats): number {
  const { completions, attempts, passingYards, touchdowns, interceptions } = stats
  
  // Avoid division by zero
  if (attempts === 0) return 0
  
  // Calculate each component
  const compPct = completions / attempts
  const ypa = passingYards / attempts
  const tdPct = touchdowns / attempts
  const intPct = interceptions / attempts
  
  // Component a: Completion percentage
  let a = (compPct - 0.3) * 5
  a = clamp(a, 0, 2.375)
  
  // Component b: Yards per attempt
  let b = (ypa - 3) * 0.25
  b = clamp(b, 0, 2.375)
  
  // Component c: Touchdown percentage
  let c = tdPct * 20
  c = clamp(c, 0, 2.375)
  
  // Component d: Interception percentage (inverted - lower is better)
  let d = 2.375 - (intPct * 25)
  d = clamp(d, 0, 2.375)
  
  // Final calculation
  const rating = ((a + b + c + d) / 6) * 100
  
  return roundToDecimals(rating, 1)
}

/**
 * Get letter grade based on NFL passer rating
 */
export function getPasserRatingGrade(rating: number): {
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F'
  label: string
  color: string
} {
  if (rating >= 120) return { grade: 'S', label: 'ELITE', color: '#FFD700' }
  if (rating >= 100) return { grade: 'A', label: 'EXCELLENT', color: '#00FF88' }
  if (rating >= 85) return { grade: 'B', label: 'GOOD', color: '#00BFFF' }
  if (rating >= 70) return { grade: 'C', label: 'AVERAGE', color: '#FFA500' }
  if (rating >= 50) return { grade: 'D', label: 'POOR', color: '#FF6B6B' }
  return { grade: 'F', label: 'FAILING', color: '#FF0000' }
}

// ============================================================================
// Game-Specific Rating
// ============================================================================

/**
 * Calculate custom game rating (0-100 scale)
 * 
 * Weighted components:
 * - 30% Completion percentage (scaled 0-100)
 * - 25% Yards per attempt (scaled, 10+ YPA = 100)
 * - 20% TD:INT ratio bonus
 * - 15% Throw quality score
 * - 10% Pocket presence
 */
export function calculateGameRating(
  passing: QBPassingStats,
  throwQuality: ThrowQuality,
  pocket: PocketStats
): number {
  const { completions, attempts, passingYards, touchdowns, interceptions } = passing
  
  if (attempts === 0) return 0
  
  // 1. Completion percentage (30%)
  const compPct = (completions / attempts) * 100
  const compScore = Math.min(100, compPct * 1.5) // 66.7% = 100
  
  // 2. Yards per attempt (25%)
  const ypa = passingYards / attempts
  const ypaScore = Math.min(100, ypa * 10) // 10 YPA = 100
  
  // 3. TD:INT ratio (20%)
  let tdIntScore: number
  if (interceptions === 0) {
    tdIntScore = touchdowns > 0 ? 100 : 50
  } else {
    const ratio = touchdowns / interceptions
    tdIntScore = Math.min(100, ratio * 25) // 4:1 ratio = 100
  }
  
  // 4. Throw quality (15%)
  const totalThrows = throwQuality.perfect + throwQuality.good + throwQuality.late + throwQuality.inaccurate
  let qualityScore = 50 // Default
  if (totalThrows > 0) {
    qualityScore = (
      (throwQuality.perfect * 100) +
      (throwQuality.good * 75) +
      (throwQuality.late * 40) +
      (throwQuality.inaccurate * 10)
    ) / totalThrows
  }
  
  // 5. Pocket presence (10%)
  const pressuredCompletions = pocket.pressuredThrows > 0 
    ? Math.min(100, 50 + (pocket.escapesFromPocket / pocket.pressuredThrows) * 50)
    : 50
  const quickReleaseBonus = Math.min(20, pocket.quickReleases * 2)
  const sackPenalty = Math.min(30, pocket.sacksAllowed * 10)
  const pocketScore = Math.max(0, Math.min(100, pressuredCompletions + quickReleaseBonus - sackPenalty))
  
  // Weighted total
  const gameRating = (
    (compScore * 0.30) +
    (ypaScore * 0.25) +
    (tdIntScore * 0.20) +
    (qualityScore * 0.15) +
    (pocketScore * 0.10)
  )
  
  return roundToDecimals(gameRating, 1)
}

/**
 * Get star rating (1-5) based on game rating
 */
export function getStarRating(gameRating: number): number {
  if (gameRating >= 90) return 5
  if (gameRating >= 75) return 4
  if (gameRating >= 60) return 3
  if (gameRating >= 40) return 2
  return 1
}

// ============================================================================
// Stat Calculations
// ============================================================================

/**
 * Calculate completion percentage
 */
export function calculateCompletionPercentage(completions: number, attempts: number): number {
  if (attempts === 0) return 0
  return roundToDecimals((completions / attempts) * 100, 1)
}

/**
 * Calculate yards per attempt
 */
export function calculateYardsPerAttempt(yards: number, attempts: number): number {
  if (attempts === 0) return 0
  return roundToDecimals(yards / attempts, 1)
}

/**
 * Calculate average time in pocket (ms to seconds)
 */
export function calculateAvgPocketTime(totalTimeMs: number, dropbacks: number): number {
  if (dropbacks === 0) return 0
  return roundToDecimals(totalTimeMs / dropbacks / 1000, 2)
}

/**
 * Calculate TD:INT ratio string
 */
export function getTdIntRatioString(touchdowns: number, interceptions: number): string {
  if (interceptions === 0) {
    return touchdowns > 0 ? `${touchdowns}:0` : '0:0'
  }
  const ratio = touchdowns / interceptions
  if (ratio >= 1) {
    return `${roundToDecimals(ratio, 1)}:1`
  }
  return `1:${roundToDecimals(1 / ratio, 1)}`
}

// ============================================================================
// Throw Quality Analysis
// ============================================================================

export type ThrowTiming = 'perfect' | 'good' | 'late' | 'inaccurate'

/**
 * Determine throw quality based on timing and accuracy
 * 
 * @param releaseTimeMs - Time from snap to release
 * @param targetDistance - Distance to receiver at release
 * @param defenderDistance - Distance of nearest defender at catch point
 * @param routeProgress - How far along the route (0-1)
 */
export function analyzeThrowQuality(
  releaseTimeMs: number,
  targetDistance: number,
  defenderDistance: number,
  routeProgress: number
): ThrowTiming {
  // Perfect throw: Quick release, tight window, on route break
  const isQuickRelease = releaseTimeMs < 2500
  const isTightWindow = defenderDistance < 3
  const isOnBreak = routeProgress >= 0.7 && routeProgress <= 1.0
  
  if (isQuickRelease && isOnBreak && targetDistance < 2) {
    return 'perfect'
  }
  
  // Good throw: Catchable, reasonable timing
  if (targetDistance < 3 && releaseTimeMs < 3500) {
    return 'good'
  }
  
  // Late throw: Slow release or defender closing
  if (releaseTimeMs > 3500 || (defenderDistance < 1.5 && routeProgress > 0.9)) {
    return 'late'
  }
  
  // Inaccurate: Poor targeting
  return 'inaccurate'
}

/**
 * Calculate expected completion probability
 * Based on throw quality and defender proximity
 */
export function getExpectedCompletionProbability(
  throwTiming: ThrowTiming,
  defenderDistance: number,
  receiverSeparation: number
): number {
  const baseProb: Record<ThrowTiming, number> = {
    perfect: 0.95,
    good: 0.80,
    late: 0.55,
    inaccurate: 0.25,
  }
  
  let probability = baseProb[throwTiming]
  
  // Adjust for defender proximity
  if (defenderDistance < 1) probability *= 0.6
  else if (defenderDistance < 2) probability *= 0.8
  else if (defenderDistance > 4) probability *= 1.1
  
  // Adjust for receiver separation
  if (receiverSeparation > 3) probability *= 1.15
  else if (receiverSeparation < 1) probability *= 0.7
  
  return clamp(probability, 0, 1)
}

// ============================================================================
// Bonus & Scoring
// ============================================================================

/**
 * Calculate bonus points for exceptional plays
 */
export function calculatePlayBonus(
  yardsGained: number,
  throwTiming: ThrowTiming,
  isTouchdown: boolean,
  isThirdDownConversion: boolean,
  yardsAfterCatch: number
): number {
  let bonus = 0
  
  // Base yards bonus
  bonus += Math.floor(yardsGained / 5) * 10
  
  // Throw quality bonus
  if (throwTiming === 'perfect') bonus += 25
  else if (throwTiming === 'good') bonus += 10
  
  // Touchdown bonus
  if (isTouchdown) bonus += 100
  
  // Third down conversion
  if (isThirdDownConversion) bonus += 50
  
  // Big YAC plays
  if (yardsAfterCatch > 10) bonus += 25
  else if (yardsAfterCatch > 5) bonus += 10
  
  // Big play bonus
  if (yardsGained >= 40) bonus += 75
  else if (yardsGained >= 25) bonus += 40
  else if (yardsGained >= 15) bonus += 20
  
  return bonus
}

/**
 * Calculate total game score based on all stats
 */
export function calculateTotalGameScore(
  stats: QBPassingStats,
  throwQuality: ThrowQuality,
  bonusPoints: number
): number {
  const { passingYards, touchdowns, interceptions, completions } = stats
  
  let score = 0
  
  // Base scoring
  score += passingYards * 1                    // 1 point per yard
  score += touchdowns * 100                    // 100 per TD
  score += completions * 5                     // 5 per completion
  score -= interceptions * 50                  // -50 per INT
  
  // Throw quality bonuses
  score += throwQuality.perfect * 20           // 20 per perfect throw
  score += throwQuality.good * 5               // 5 per good throw
  
  // Add accumulated bonuses
  score += bonusPoints
  
  return Math.max(0, score)
}

// ============================================================================
// Formatting Utilities
// ============================================================================

/**
 * Format passer rating for display
 */
export function formatPasserRating(rating: number): string {
  return rating.toFixed(1)
}

/**
 * Format completion percentage for display
 */
export function formatCompletionPercentage(pct: number): string {
  return `${pct.toFixed(1)}%`
}

/**
 * Format time in pocket (seconds)
 */
export function formatPocketTime(seconds: number): string {
  return `${seconds.toFixed(2)}s`
}

/**
 * Format yards
 */
export function formatYards(yards: number): string {
  return `${yards} YDS`
}

/**
 * Get performance summary text
 */
export function getPerformanceSummary(
  passerRating: number,
  gameRating: number,
  touchdowns: number,
  interceptions: number
): string {
  const grade = getPasserRatingGrade(passerRating)
  
  if (passerRating >= 120 && interceptions === 0) {
    return 'LEGENDARY PERFORMANCE'
  }
  if (passerRating >= 100 && touchdowns >= 3) {
    return 'DOMINANT SHOWING'
  }
  if (gameRating >= 80) {
    return 'STELLAR GAME'
  }
  if (gameRating >= 60) {
    return 'SOLID OUTING'
  }
  if (gameRating >= 40) {
    return 'NEEDS IMPROVEMENT'
  }
  return 'ROUGH DAY'
}

// ============================================================================
// Helpers
// ============================================================================

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function roundToDecimals(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

// ============================================================================
// Exports for Testing
// ============================================================================

export const _internal = {
  clamp,
  roundToDecimals,
}
