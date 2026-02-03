/**
 * UNIFIED COORDINATE SYSTEM
 * 
 * Single source of truth for converting between:
 * - Yard lines (0-100) - football field position
 * - Screen Y (0-100%) - visual position on screen
 * 
 * LAYOUT:
 * - YOUR end zone at BOTTOM of screen (Y = 90%)
 * - OPPONENT end zone at TOP of screen (Y = 10%)
 * - You advance UPWARD (toward lower Y values)
 * 
 * yardLine 0 (your goal) → Y = 90% (bottom)
 * yardLine 50 (midfield) → Y = 55% (middle)
 * yardLine 100 (their goal) → Y = 20% (top)
 */

// Field bounds in screen percentage
export const FIELD_Y_MIN = 12  // Top of playable area (opponent's end zone starts at 10%)
export const FIELD_Y_MAX = 88  // Bottom of playable area (your end zone starts at 90%)
export const FIELD_Y_RANGE = FIELD_Y_MAX - FIELD_Y_MIN // 76%

// Game timing constants (milliseconds)
export const GAME_SPEED = {
  ROUTE_DURATION: 3500,     // Time for routes to fully develop (was 2000)
  BALL_FLIGHT: 900,         // Time for ball to reach receiver
  POCKET_TIME_MAX: 4000,    // Max time in pocket before pressure
  DROPBACK_DURATION: 800,   // QB dropback animation
  RESULT_DISPLAY: 1200,     // Time to show result
  RESULT_DISPLAY_BIG: 2500, // Time for TDs/INTs
}

// Field constants
export const FIELD = {
  OWN_GOAL: 0,
  OWN_20: 20,
  MIDFIELD: 50,
  OPP_20: 80,
  OPP_GOAL: 100,
  FIRST_DOWN_YARDS: 10,
}

/**
 * Convert yard line to screen Y position
 * 
 * @param yardLine - Field position (0 = your goal, 100 = their goal)
 * @returns Screen Y percentage (0-100)
 */
export function yardToScreenY(yardLine: number): number {
  // yardLine 0 → 88% (bottom)
  // yardLine 100 → 12% (top)
  return FIELD_Y_MAX - (yardLine / 100) * FIELD_Y_RANGE
}

/**
 * Convert screen Y position back to yard line
 * 
 * @param screenY - Screen Y percentage (0-100)
 * @returns Yard line (0-100)
 */
export function screenYToYard(screenY: number): number {
  // 88% → yard 0
  // 12% → yard 100
  return ((FIELD_Y_MAX - screenY) / FIELD_Y_RANGE) * 100
}

/**
 * Get QB position for a given yard line
 * QB stands 5 yards behind the line of scrimmage
 */
export function getQBPosition(yardLine: number): { x: number; y: number } {
  const lineOfScrimmageY = yardToScreenY(yardLine)
  return {
    x: 0, // Center of field
    y: lineOfScrimmageY + 3.8, // ~5 yards behind LOS (3.8% = 5 yards at 0.76%/yard)
  }
}

/**
 * Get receiver position based on route progress
 * 
 * @param startYardLine - Where the play starts
 * @param routeYards - How many yards downfield the receiver runs
 * @param lateralOffset - X offset (-50 to 50)
 * @param progress - Route progress (0-1)
 */
export function getReceiverScreenPosition(
  startYardLine: number,
  routeYards: number,
  lateralOffset: number,
  progress: number
): { x: number; y: number } {
  // Calculate current yard line based on progress
  const currentYardLine = startYardLine + (routeYards * progress)
  
  return {
    x: lateralOffset * 0.7, // Scale lateral movement for mobile
    y: yardToScreenY(Math.min(100, currentYardLine)),
  }
}

/**
 * Get defender position - defenders are 5-10 yards ahead of receivers
 */
export function getDefenderPosition(receiverY: number, offset: number = 0): { x: number; y: number } {
  return {
    x: offset,
    y: Math.max(FIELD_Y_MIN, receiverY - 8), // 8% ahead (toward opponent's end zone = lower Y)
  }
}

/**
 * Calculate camera scroll based on yard line
 * Shows appropriate portion of field based on field position
 */
export function getCameraScroll(yardLine: number): number {
  // At own 20 (yardLine 20): show bottom of field (high scroll)
  // At opponent's 20 (yardLine 80): show top of field (low scroll)
  // Range: 0-40%
  return Math.max(0, Math.min(40, (80 - yardLine) * 0.6))
}

/**
 * Convert route waypoint to screen position
 * Waypoints use: x (-50 to 50), y (0 to 60 yards downfield)
 */
export function waypointToScreen(
  waypoint: { x: number; y: number },
  lineOfScrimmageYard: number
): { x: number; y: number } {
  // X: scale for mobile (-35 to 35)
  const screenX = waypoint.x * 0.7
  
  // Y: convert yards downfield to yard line, then to screen Y
  const targetYardLine = lineOfScrimmageYard + waypoint.y
  const screenY = yardToScreenY(Math.min(100, targetYardLine))
  
  return { x: screenX, y: screenY }
}
