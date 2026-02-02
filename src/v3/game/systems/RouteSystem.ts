/**
 * Route System
 * 
 * Manages receiver routes with proper timing windows:
 * - Stem: Initial release off line
 * - Break: Route cut/change direction  
 * - Separation: Optimal throwing window
 * - Recovery: Defender catching up
 */

import { V3_CONFIG, getDifficultyForWeek } from '../config/gameConfig'

// ============================================================================
// TYPES
// ============================================================================

export interface RouteWaypoint {
  x: number  // Offset from LOS center
  y: number  // Offset from LOS (negative = upfield)
  time: number // Progress 0-1 when receiver reaches this point
}

export interface RouteDefinition {
  name: string
  startOffset: { x: number, y: number }
  waypoints: RouteWaypoint[]
  perfectWindow: { start: number, end: number }
  routeType: 'quick' | 'medium' | 'deep'
}

export type RoutePhase = 'stem' | 'break' | 'separation' | 'recovery'

export type ThrowQuality = 'perfect' | 'good' | 'late' | 'veryLate' | 'early' | 'notOpen'

export interface RouteState {
  progress: number // 0-1
  phase: RoutePhase
  isOpen: boolean
  throwQuality: ThrowQuality
  position: { x: number, y: number }
  velocity: { x: number, y: number }
  openness: number // 0-1, how open (for visual feedback)
}

// ============================================================================
// ROUTE DEFINITIONS
// ============================================================================

// Route offsets scaled to fit within the visible field area
// Field center is 200, playable area is roughly 60-340 (280px wide) due to stadium image perspective
const ROUTE_SCALE = 0.55 // Scale factor to bring routes inside visible field

export const ROUTE_LIBRARY: Record<string, RouteDefinition> = {
  slant: {
    name: 'Slant',
    startOffset: { x: -140 * ROUTE_SCALE, y: -15 },
    waypoints: [
      { x: -120 * ROUTE_SCALE, y: -50, time: 0.2 },
      { x: -60 * ROUTE_SCALE, y: -150, time: 0.5 },
      { x: -20 * ROUTE_SCALE, y: -250, time: 0.8 },
      { x: 20 * ROUTE_SCALE, y: -350, time: 1.0 },
    ],
    perfectWindow: { start: 0.4, end: 0.65 },
    routeType: 'quick',
  },
  out: {
    name: 'Out',
    startOffset: { x: 130 * ROUTE_SCALE, y: -12 },
    waypoints: [
      { x: 130 * ROUTE_SCALE, y: -80, time: 0.3 },
      { x: 130 * ROUTE_SCALE, y: -150, time: 0.5 },
      { x: 150 * ROUTE_SCALE, y: -150, time: 0.7 },
      { x: 160 * ROUTE_SCALE, y: -150, time: 1.0 },
    ],
    perfectWindow: { start: 0.5, end: 0.75 },
    routeType: 'medium',
  },
  curl: {
    name: 'Curl',
    startOffset: { x: -130 * ROUTE_SCALE, y: -12 },
    waypoints: [
      { x: -130 * ROUTE_SCALE, y: -100, time: 0.35 },
      { x: -130 * ROUTE_SCALE, y: -180, time: 0.55 },
      { x: -120 * ROUTE_SCALE, y: -200, time: 0.7 },
      { x: -100 * ROUTE_SCALE, y: -190, time: 1.0 },
    ],
    perfectWindow: { start: 0.55, end: 0.8 },
    routeType: 'medium',
  },
  post: {
    name: 'Post',
    startOffset: { x: -150 * ROUTE_SCALE, y: -15 },
    waypoints: [
      { x: -150 * ROUTE_SCALE, y: -100, time: 0.25 },
      { x: -150 * ROUTE_SCALE, y: -200, time: 0.45 },
      { x: -80 * ROUTE_SCALE, y: -350, time: 0.75 },
      { x: 0, y: -450, time: 1.0 },
    ],
    perfectWindow: { start: 0.5, end: 0.75 },
    routeType: 'deep',
  },
  corner: {
    name: 'Corner',
    startOffset: { x: 150 * ROUTE_SCALE, y: -15 },
    waypoints: [
      { x: 150 * ROUTE_SCALE, y: -100, time: 0.25 },
      { x: 150 * ROUTE_SCALE, y: -200, time: 0.45 },
      { x: 160 * ROUTE_SCALE, y: -350, time: 0.75 },
      { x: 170 * ROUTE_SCALE, y: -450, time: 1.0 },
    ],
    perfectWindow: { start: 0.5, end: 0.75 },
    routeType: 'deep',
  },
  flat: {
    name: 'Flat',
    startOffset: { x: 60 * ROUTE_SCALE, y: 30 },
    waypoints: [
      { x: 30 * ROUTE_SCALE, y: 10, time: 0.2 },
      { x: -30 * ROUTE_SCALE, y: -20, time: 0.5 },
      { x: -100 * ROUTE_SCALE, y: -50, time: 0.8 },
      { x: -130 * ROUTE_SCALE, y: -60, time: 1.0 },
    ],
    perfectWindow: { start: 0.3, end: 0.55 },
    routeType: 'quick',
  },
  go: {
    name: 'Go/Streak',
    startOffset: { x: -150 * ROUTE_SCALE, y: -15 },
    waypoints: [
      { x: -150 * ROUTE_SCALE, y: -100, time: 0.2 },
      { x: -150 * ROUTE_SCALE, y: -200, time: 0.4 },
      { x: -150 * ROUTE_SCALE, y: -350, time: 0.7 },
      { x: -150 * ROUTE_SCALE, y: -500, time: 1.0 },
    ],
    perfectWindow: { start: 0.45, end: 0.75 },
    routeType: 'deep',
  },
  drag: {
    name: 'Drag',
    startOffset: { x: 0, y: -10 },
    waypoints: [
      { x: -30 * ROUTE_SCALE, y: -80, time: 0.25 },
      { x: -80 * ROUTE_SCALE, y: -100, time: 0.5 },
      { x: -130 * ROUTE_SCALE, y: -100, time: 0.75 },
      { x: -150 * ROUTE_SCALE, y: -100, time: 1.0 },
    ],
    perfectWindow: { start: 0.35, end: 0.6 },
    routeType: 'quick',
  },
}

// ============================================================================
// PLAY DEFINITIONS
// ============================================================================

export interface PlayDefinition {
  id: string
  name: string
  description: string
  routes: RouteDefinition[]
  // SVG paths for play card rendering
  cardPaths: string[]
}

// Seam route (vertical up the middle)
const seam: RouteDefinition = {
  name: 'Seam',
  startOffset: { x: 0, y: -10 },
  waypoints: [
    { x: 0, y: -100, time: 0.25 },
    { x: 0, y: -200, time: 0.5 },
    { x: 0, y: -350, time: 0.75 },
    { x: 0, y: -450, time: 1.0 },
  ],
  perfectWindow: { start: 0.45, end: 0.7 },
  routeType: 'deep',
}

// Wheel route
const wheel: RouteDefinition = {
  name: 'Wheel',
  startOffset: { x: 50 * ROUTE_SCALE, y: 25 },
  waypoints: [
    { x: -50 * ROUTE_SCALE, y: 0, time: 0.2 },
    { x: -100 * ROUTE_SCALE, y: -50, time: 0.4 },
    { x: -130 * ROUTE_SCALE, y: -200, time: 0.7 },
    { x: -140 * ROUTE_SCALE, y: -400, time: 1.0 },
  ],
  perfectWindow: { start: 0.5, end: 0.75 },
  routeType: 'deep',
}

// ============================================================================
// PLAY BOOK - 12 PLAYS synced with PlaybookPanel
// Order MUST match PlaybookPanel.tsx PLAYBOOK array
// ============================================================================

export const PLAY_BOOK: PlayDefinition[] = [
  // ORDER MUST MATCH PlaybookPanel.tsx PLAYBOOK array!
  // 12 plays total
  
  // === WEEK 1: QUICK (3 plays) ===
  // 0: slant-flood
  {
    id: 'slant-flood',
    name: 'SLANT FLOOD',
    description: 'Quick slants',
    routes: [
      { ...ROUTE_LIBRARY.slant, startOffset: { x: -100 * ROUTE_SCALE, y: -15 } },
      { ...ROUTE_LIBRARY.drag, startOffset: { x: 0, y: -10 } },
      { ...ROUTE_LIBRARY.out, startOffset: { x: 100 * ROUTE_SCALE, y: -15 } },
    ],
    cardPaths: ['M 15 80 L 40 40', 'M 50 80 L 30 55', 'M 85 80 L 95 50'],
  },
  // 1: quick-out
  {
    id: 'quick-out',
    name: 'QUICK OUT',
    description: 'Fast outs',
    routes: [
      { ...ROUTE_LIBRARY.out, startOffset: { x: -110 * ROUTE_SCALE, y: -12 }, 
        waypoints: ROUTE_LIBRARY.out.waypoints.map(w => ({ ...w, x: -Math.abs(w.x) })) },
      { ...ROUTE_LIBRARY.flat, startOffset: { x: 40 * ROUTE_SCALE, y: 25 } },
      { ...ROUTE_LIBRARY.out, startOffset: { x: 110 * ROUTE_SCALE, y: -12 } },
    ],
    cardPaths: ['M 10 80 L 0 55', 'M 50 85 L 30 70', 'M 90 80 L 100 55'],
  },
  // 2: mesh
  {
    id: 'mesh',
    name: 'MESH',
    description: 'Crossing drags',
    routes: [
      { ...ROUTE_LIBRARY.drag, startOffset: { x: -90 * ROUTE_SCALE, y: -12 } },
      { ...ROUTE_LIBRARY.drag, startOffset: { x: 90 * ROUTE_SCALE, y: -12 },
        waypoints: ROUTE_LIBRARY.drag.waypoints.map(w => ({ ...w, x: -w.x })) },
      { ...seam, startOffset: { x: 0, y: 25 } },
    ],
    cardPaths: ['M 20 80 L 20 55 L 80 55', 'M 80 80 L 80 50 L 20 50', 'M 50 85 L 50 35'],
  },
  
  // === WEEK 2: MEDIUM (3 plays) ===
  // 3: curl-flat
  {
    id: 'curl-flat',
    name: 'CURL FLAT',
    description: 'Curls + outlet',
    routes: [
      { ...ROUTE_LIBRARY.curl, startOffset: { x: -90 * ROUTE_SCALE, y: -12 } },
      { ...ROUTE_LIBRARY.flat, startOffset: { x: 40 * ROUTE_SCALE, y: 30 } },
      { ...ROUTE_LIBRARY.post, startOffset: { x: 90 * ROUTE_SCALE, y: -12 } },
    ],
    cardPaths: ['M 15 80 L 15 45 L 25 50', 'M 55 85 L 25 70', 'M 85 80 L 60 30'],
  },
  // 4: smash
  {
    id: 'smash',
    name: 'SMASH',
    description: 'Corner + hitch',
    routes: [
      { ...ROUTE_LIBRARY.curl, startOffset: { x: -110 * ROUTE_SCALE, y: -12 } },
      { ...ROUTE_LIBRARY.corner, startOffset: { x: -50 * ROUTE_SCALE, y: -12 },
        waypoints: ROUTE_LIBRARY.corner.waypoints.map(w => ({ ...w, x: -Math.abs(w.x) })) },
      { ...ROUTE_LIBRARY.curl, startOffset: { x: 110 * ROUTE_SCALE, y: -12 },
        waypoints: ROUTE_LIBRARY.curl.waypoints.map(w => ({ ...w, x: -w.x })) },
    ],
    cardPaths: ['M 15 80 L 15 50 L 25 55', 'M 35 80 L 35 35 L 10 15', 'M 85 80 L 85 50 L 75 55'],
  },
  // 5: levels
  {
    id: 'levels',
    name: 'LEVELS',
    description: 'Three-level flood',
    routes: [
      { ...ROUTE_LIBRARY.out, startOffset: { x: -90 * ROUTE_SCALE, y: -12 },
        waypoints: [
          { x: -90 * ROUTE_SCALE, y: -60, time: 0.3 },
          { x: -130 * ROUTE_SCALE, y: -60, time: 0.6 },
          { x: -150 * ROUTE_SCALE, y: -60, time: 1.0 },
        ] },
      { ...ROUTE_LIBRARY.out, startOffset: { x: -50 * ROUTE_SCALE, y: -12 },
        waypoints: [
          { x: -50 * ROUTE_SCALE, y: -120, time: 0.4 },
          { x: -130 * ROUTE_SCALE, y: -120, time: 0.7 },
          { x: -150 * ROUTE_SCALE, y: -120, time: 1.0 },
        ] },
      { ...ROUTE_LIBRARY.corner, startOffset: { x: 0, y: -12 },
        waypoints: ROUTE_LIBRARY.corner.waypoints.map(w => ({ ...w, x: -Math.abs(w.x) })) },
    ],
    cardPaths: ['M 20 80 L 20 60 L 5 60', 'M 40 80 L 40 40 L 5 40', 'M 60 80 L 60 20 L 5 15'],
  },
  
  // === WEEK 3-4: DEEP (3 plays) ===
  // 6: four-verts
  {
    id: 'four-verts',
    name: 'FOUR VERTS',
    description: 'All go routes',
    routes: [
      { ...ROUTE_LIBRARY.go, startOffset: { x: -110 * ROUTE_SCALE, y: -15 } },
      { ...ROUTE_LIBRARY.go, startOffset: { x: -40 * ROUTE_SCALE, y: -10 }, 
        waypoints: ROUTE_LIBRARY.go.waypoints.map(w => ({ ...w, x: w.x + 60 * ROUTE_SCALE })) },
      { ...ROUTE_LIBRARY.go, startOffset: { x: 40 * ROUTE_SCALE, y: -10 },
        waypoints: ROUTE_LIBRARY.go.waypoints.map(w => ({ ...w, x: -w.x - 60 * ROUTE_SCALE })) },
      { ...ROUTE_LIBRARY.go, startOffset: { x: 110 * ROUTE_SCALE, y: -15 },
        waypoints: ROUTE_LIBRARY.go.waypoints.map(w => ({ ...w, x: -w.x })) },
    ],
    cardPaths: ['M 10 80 L 10 15', 'M 35 80 L 35 18', 'M 65 80 L 65 18', 'M 90 80 L 90 15'],
  },
  // 7: post-corner
  {
    id: 'post-corner',
    name: 'POST CORNER',
    description: 'Double move',
    routes: [
      { ...ROUTE_LIBRARY.post, startOffset: { x: -100 * ROUTE_SCALE, y: -15 } },
      { ...ROUTE_LIBRARY.corner, startOffset: { x: 100 * ROUTE_SCALE, y: -15 } },
      { ...ROUTE_LIBRARY.flat, startOffset: { x: 40 * ROUTE_SCALE, y: 25 } },
    ],
    cardPaths: ['M 25 80 L 25 45 L 50 20', 'M 75 80 L 75 45 L 95 25', 'M 50 85 L 30 70'],
  },
  // 8: hail-mary
  {
    id: 'hail-mary',
    name: 'HAIL MARY',
    description: 'Prayer ball',
    routes: [
      { ...ROUTE_LIBRARY.go, startOffset: { x: -110 * ROUTE_SCALE, y: -15 },
        waypoints: [
          { x: -80 * ROUTE_SCALE, y: -100, time: 0.2 },
          { x: -30 * ROUTE_SCALE, y: -250, time: 0.5 },
          { x: 0, y: -450, time: 0.8 },
          { x: 0, y: -550, time: 1.0 },
        ] },
      { ...ROUTE_LIBRARY.go, startOffset: { x: -40 * ROUTE_SCALE, y: -12 },
        waypoints: [
          { x: -20 * ROUTE_SCALE, y: -100, time: 0.25 },
          { x: 0, y: -300, time: 0.6 },
          { x: 0, y: -500, time: 1.0 },
        ] },
      { ...ROUTE_LIBRARY.go, startOffset: { x: 40 * ROUTE_SCALE, y: -12 },
        waypoints: [
          { x: 20 * ROUTE_SCALE, y: -100, time: 0.25 },
          { x: 0, y: -300, time: 0.6 },
          { x: 0, y: -500, time: 1.0 },
        ] },
      { ...ROUTE_LIBRARY.go, startOffset: { x: 110 * ROUTE_SCALE, y: -15 },
        waypoints: [
          { x: 80 * ROUTE_SCALE, y: -100, time: 0.2 },
          { x: 30 * ROUTE_SCALE, y: -250, time: 0.5 },
          { x: 0, y: -450, time: 0.8 },
          { x: 0, y: -550, time: 1.0 },
        ] },
    ],
    cardPaths: ['M 15 80 L 50 15', 'M 40 80 L 50 18', 'M 60 80 L 50 18', 'M 85 80 L 50 15'],
  },
  
  // === WEEK 5-6: TRICK (3 plays) ===
  // 9: wheel
  {
    id: 'wheel',
    name: 'WHEEL',
    description: 'RB wheel route',
    routes: [
      { ...wheel, startOffset: { x: 40 * ROUTE_SCALE, y: 25 } },
      { ...ROUTE_LIBRARY.curl, startOffset: { x: -80 * ROUTE_SCALE, y: -12 } },
      { ...seam, startOffset: { x: 80 * ROUTE_SCALE, y: -12 } },
    ],
    cardPaths: ['M 50 88 L 20 75 L 5 30', 'M 30 80 L 30 50 L 40 55', 'M 75 80 L 75 40'],
  },
  // 10: texas
  {
    id: 'texas',
    name: 'TEXAS',
    description: 'TE/RB cross',
    routes: [
      { ...ROUTE_LIBRARY.drag, startOffset: { x: -60 * ROUTE_SCALE, y: -12 },
        waypoints: ROUTE_LIBRARY.drag.waypoints.map(w => ({ ...w, x: -w.x })) },
      { ...ROUTE_LIBRARY.flat, startOffset: { x: 40 * ROUTE_SCALE, y: 25 } },
      { ...ROUTE_LIBRARY.go, startOffset: { x: 100 * ROUTE_SCALE, y: -15 },
        waypoints: ROUTE_LIBRARY.go.waypoints.map(w => ({ ...w, x: -w.x })) },
    ],
    cardPaths: ['M 40 80 L 40 55 L 85 45', 'M 55 88 L 55 65 L 15 55', 'M 85 80 L 85 25'],
  },
  // 11: spider-2-y
  {
    id: 'spider-2-y',
    name: 'SPIDER 2 Y',
    description: 'Gruden special',
    routes: [
      { ...ROUTE_LIBRARY.flat, startOffset: { x: -60 * ROUTE_SCALE, y: -12 } },
      { ...wheel, startOffset: { x: 40 * ROUTE_SCALE, y: 25 },
        waypoints: [
          { x: 80 * ROUTE_SCALE, y: 0, time: 0.2 },
          { x: 120 * ROUTE_SCALE, y: -80, time: 0.5 },
          { x: 140 * ROUTE_SCALE, y: -250, time: 0.8 },
          { x: 150 * ROUTE_SCALE, y: -400, time: 1.0 },
        ] },
      { ...ROUTE_LIBRARY.curl, startOffset: { x: 100 * ROUTE_SCALE, y: -15 },
        waypoints: ROUTE_LIBRARY.curl.waypoints.map(w => ({ ...w, x: -w.x })) },
    ],
    cardPaths: ['M 35 80 L 35 60 L 5 50', 'M 50 88 L 80 70 L 95 40', 'M 80 80 L 80 50 L 65 55'],
  },
]

// ============================================================================
// ROUTE RUNNER CLASS
// ============================================================================

export class RouteRunner {
  private route: RouteDefinition
  private losX: number
  private losY: number
  private week: number
  private darkSideBonus: number
  
  private progress: number = 0
  private previousPosition: { x: number, y: number } = { x: 0, y: 0 }
  
  constructor(
    route: RouteDefinition, 
    losX: number, 
    losY: number, 
    week: number = 1,
    darkSideBonus: number = 0
  ) {
    this.route = route
    this.losX = losX
    this.losY = losY
    this.week = week
    this.darkSideBonus = darkSideBonus
    
    // Initialize at start position
    this.previousPosition = this.getPositionAtProgress(0)
  }
  
  /**
   * Update route progress
   * @param delta Frame delta in ms
   * @param routeDurationMs Total route duration
   */
  update(delta: number, routeDurationMs: number): RouteState {
    // Advance progress
    this.progress += (delta / routeDurationMs)
    this.progress = Math.min(1, this.progress)
    
    // Calculate current position
    const currentPosition = this.getPositionAtProgress(this.progress)
    
    // Calculate velocity for animations
    const velocity = {
      x: currentPosition.x - this.previousPosition.x,
      y: currentPosition.y - this.previousPosition.y,
    }
    this.previousPosition = currentPosition
    
    // Determine phase
    const phase = this.getPhase()
    
    // Calculate openness and throw quality
    const { isOpen, throwQuality, openness } = this.calculateOpenness()
    
    return {
      progress: this.progress,
      phase,
      isOpen,
      throwQuality,
      position: currentPosition,
      velocity,
      openness,
    }
  }
  
  /**
   * Get position at specific progress
   */
  getPositionAtProgress(progress: number): { x: number, y: number } {
    const waypoints = this.route.waypoints
    
    // GOAL LINE BOUNDARY - never go past Y=100 (opponent end zone)
    const GOAL_LINE = 100
    const SIDELINE_MIN = 15
    const SIDELINE_MAX = 385
    
    const clampPosition = (pos: { x: number, y: number }) => ({
      x: Math.max(SIDELINE_MIN, Math.min(SIDELINE_MAX, pos.x)),
      y: Math.max(GOAL_LINE, pos.y), // Can't go past goal line
    })
    
    if (progress <= 0) {
      return clampPosition({
        x: this.losX + this.route.startOffset.x,
        y: this.losY + this.route.startOffset.y,
      })
    }
    
    if (progress >= 1) {
      const last = waypoints[waypoints.length - 1]
      return clampPosition({
        x: this.losX + last.x,
        y: this.losY + last.y,
      })
    }
    
    // Find which segment we're in
    let prevWaypoint = {
      x: this.route.startOffset.x,
      y: this.route.startOffset.y,
      time: 0,
    }
    
    for (const wp of waypoints) {
      if (progress <= wp.time) {
        // Interpolate between prevWaypoint and wp
        const segmentProgress = (progress - prevWaypoint.time) / (wp.time - prevWaypoint.time)
        
        return clampPosition({
          x: this.losX + prevWaypoint.x + (wp.x - prevWaypoint.x) * segmentProgress,
          y: this.losY + prevWaypoint.y + (wp.y - prevWaypoint.y) * segmentProgress,
        })
      }
      prevWaypoint = wp
    }
    
    // Fallback
    const last = waypoints[waypoints.length - 1]
    return clampPosition({
      x: this.losX + last.x,
      y: this.losY + last.y,
    })
  }
  
  /**
   * Get current phase of route
   */
  private getPhase(): RoutePhase {
    const r = V3_CONFIG.routes
    if (this.progress < r.stem.end) return 'stem'
    if (this.progress < r.break.end) return 'break'
    if (this.progress < r.separation.end) return 'separation'
    return 'recovery'
  }
  
  /**
   * Calculate openness based on timing windows
   */
  private calculateOpenness(): { isOpen: boolean, throwQuality: ThrowQuality, openness: number } {
    const difficulty = getDifficultyForWeek(this.week)
    const windowBonus = difficulty.windowBonus + this.darkSideBonus
    
    // Adjust perfect window based on difficulty
    const perfectWindow = {
      start: Math.max(0, this.route.perfectWindow.start - windowBonus),
      end: Math.min(1, this.route.perfectWindow.end + windowBonus),
    }
    
    // Throw quality windows (adjusted for difficulty)
    const windows = V3_CONFIG.throwWindows
    const adjustedWindows = {
      perfect: {
        start: Math.max(0, windows.perfect.start - windowBonus),
        end: Math.min(1, windows.perfect.end + windowBonus),
      },
      good: {
        start: Math.max(0, windows.good.start - windowBonus * 0.5),
        end: Math.min(1, windows.good.end + windowBonus * 0.5),
      },
      late: windows.late,
      veryLate: windows.veryLate,
      early: windows.early,
    }
    
    const p = this.progress
    
    // Determine throw quality
    let throwQuality: ThrowQuality
    if (p >= adjustedWindows.perfect.start && p <= adjustedWindows.perfect.end) {
      throwQuality = 'perfect'
    } else if (p >= adjustedWindows.good.start && p <= adjustedWindows.good.end) {
      throwQuality = 'good'
    } else if (p >= adjustedWindows.late.start && p <= adjustedWindows.late.end) {
      throwQuality = 'late'
    } else if (p >= adjustedWindows.veryLate.start) {
      throwQuality = 'veryLate'
    } else if (p <= adjustedWindows.early.end) {
      throwQuality = 'early'
    } else {
      throwQuality = 'notOpen'
    }
    
    // Is receiver "open" (catchable)?
    const isOpen = throwQuality !== 'notOpen' && throwQuality !== 'veryLate'
    
    // Openness gradient for visuals (0 = covered, 1 = wide open)
    let openness = 0
    if (throwQuality === 'perfect') {
      // Peak openness in middle of perfect window
      const windowCenter = (perfectWindow.start + perfectWindow.end) / 2
      const distFromCenter = Math.abs(p - windowCenter) / ((perfectWindow.end - perfectWindow.start) / 2)
      openness = 1 - (distFromCenter * 0.3) // 0.7 to 1.0 in perfect window
    } else if (throwQuality === 'good') {
      openness = 0.5
    } else if (throwQuality === 'late' || throwQuality === 'early') {
      openness = 0.25
    }
    
    return { isOpen, throwQuality, openness }
  }
  
  /**
   * Get the route definition
   */
  getRoute(): RouteDefinition {
    return this.route
  }
  
  /**
   * Reset for next play
   */
  reset(): void {
    this.progress = 0
    this.previousPosition = this.getPositionAtProgress(0)
  }
}

// ============================================================================
// THROW QUALITY UTILITIES
// ============================================================================

export function getThrowQualityConfig(quality: ThrowQuality) {
  const cfg = V3_CONFIG.throwQuality
  switch (quality) {
    case 'perfect': return cfg.perfect
    case 'good': return cfg.good
    case 'late': return cfg.late
    case 'veryLate': return cfg.veryLate
    case 'early': return cfg.early
    default: return cfg.good
  }
}

export function shouldBallBeIntercepted(quality: ThrowQuality): boolean {
  const config = getThrowQualityConfig(quality)
  return Math.random() < config.interceptChance
}
