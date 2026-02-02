/**
 * Camera Controller V2 - SIMPLIFIED
 * 
 * Uses ONLY scroll-based positioning (not center-based).
 * Camera scrollY = top of viewport in world coordinates.
 * 
 * Field layout:
 *   Y = 0 ........... Opponent end zone (TOP - where we score)
 *   Y = 100 ......... Goal line
 *   Y = 850 ......... LOS (25 yard line from own end zone)
 *   Y = 1100 ........ Own goal line
 *   Y = 1200 ........ Own end zone (BOTTOM - where we start)
 * 
 * Camera scrollY should show the action area.
 * For Y=850 (LOS), we want it centered-ish in the 700px viewport.
 * scrollY = 850 - 400 = 450 would put LOS at 400px from top of viewport.
 */

import { V3_CONFIG } from '../config/gameConfig'

export type CameraMode = 
  | 'preSnap'
  | 'dropback'
  | 'pocket'
  | 'ballFlight'
  | 'yac'
  | 'touchdown'
  | 'reset'

export class CameraController {
  private camera: Phaser.Cameras.Scene2D.Camera
  
  // Target scroll position (what we're easing toward)
  private targetScrollY: number = 0
  private targetZoom: number = 1
  
  // Easing speed (0-1, higher = faster)
  private easeSpeed: number = 0.08
  
  // Entity tracking
  private trackedEntity: { x: number, y: number } | null = null
  private trackOffsetY: number = 0
  
  // Field/viewport constants
  private readonly FIELD_HEIGHT = V3_CONFIG.field.height // 1200
  private readonly VIEWPORT_HEIGHT = 700
  private readonly FIELD_WIDTH = V3_CONFIG.field.width // 400
  
  constructor(camera: Phaser.Cameras.Scene2D.Camera) {
    this.camera = camera
    
    // Set bounds to full field
    this.camera.setBounds(0, 0, this.FIELD_WIDTH, this.FIELD_HEIGHT)
  }
  
  /**
   * Call every frame to smoothly update camera
   */
  update(): void {
    // If tracking an entity, update target based on its position
    if (this.trackedEntity) {
      // Put tracked entity at center of viewport
      this.targetScrollY = this.trackedEntity.y - (this.VIEWPORT_HEIGHT / 2) + this.trackOffsetY
    }
    
    // Clamp target to valid scroll range
    const maxScrollY = this.FIELD_HEIGHT - this.VIEWPORT_HEIGHT
    this.targetScrollY = Math.max(0, Math.min(this.targetScrollY, maxScrollY))
    
    // Ease toward target
    const currentScrollY = this.camera.scrollY
    const currentZoom = this.camera.zoom
    
    const newScrollY = currentScrollY + (this.targetScrollY - currentScrollY) * this.easeSpeed
    const newZoom = currentZoom + (this.targetZoom - currentZoom) * this.easeSpeed
    
    this.camera.setScroll(0, newScrollY)
    this.camera.setZoom(newZoom)
  }
  
  /**
   * Set camera to show a specific Y position (centered in viewport)
   */
  lookAt(worldY: number, instant: boolean = false): void {
    this.trackedEntity = null
    this.targetScrollY = worldY - (this.VIEWPORT_HEIGHT / 2)
    
    if (instant) {
      const maxScrollY = this.FIELD_HEIGHT - this.VIEWPORT_HEIGHT
      const clampedY = Math.max(0, Math.min(this.targetScrollY, maxScrollY))
      this.camera.setScroll(0, clampedY)
    }
  }
  
  /**
   * Track an entity (ball carrier, ball in flight, etc.)
   */
  trackEntity(entity: { x: number, y: number }, offsetY: number = 0): void {
    this.trackedEntity = entity
    this.trackOffsetY = offsetY
  }
  
  /**
   * Stop tracking and hold current position
   */
  stopTracking(): void {
    this.trackedEntity = null
  }
  
  /**
   * Set easing speed (0.01 = very slow, 0.2 = fast)
   */
  setEaseSpeed(speed: number): void {
    this.easeSpeed = Math.max(0.01, Math.min(0.3, speed))
  }
  
  /**
   * Set target zoom (1.0-1.5 range for this game)
   */
  setZoom(zoom: number): void {
    this.targetZoom = Math.max(1.0, Math.min(1.5, zoom))
  }
  
  /**
   * Shake effect
   */
  shake(duration: number = 100, intensity: number = 0.005): void {
    this.camera.shake(duration, intensity)
  }
  
  /**
   * Tackle/juke shake - quick, punchy shake for impacts
   */
  tackleShake(): void {
    this.camera.shake(120, 0.006)
  }
  
  /**
   * Flash effect
   */
  flash(duration: number = 200, r: number = 255, g: number = 255, b: number = 255): void {
    this.camera.flash(duration, r, g, b)
  }
  
  // ============================================================================
  // MODE-BASED PRESETS
  // ============================================================================
  
  /**
   * Pre-snap: TIGHT on QB, building tension
   * Show QB and receivers lined up - contained view
   */
  preSnapMode(qbY: number): void {
    this.stopTracking()
    this.lookAt(qbY - 150) // Tight view showing play area
    this.setEaseSpeed(0.04) // Slow, deliberate
    this.setZoom(1.25) // Zoomed in for focus
  }
  
  /**
   * Dropback: Slight pullback to show route development
   */
  dropbackMode(qbY: number): void {
    this.stopTracking()
    this.lookAt(qbY - 200)
    this.setEaseSpeed(0.08)
    this.setZoom(1.20)
  }
  
  /**
   * Pocket/READ: See routes developing, find the open man
   */
  pocketMode(qbY: number): void {
    this.stopTracking()
    this.lookAt(qbY - 220) // Show routes developing
    this.setEaseSpeed(0.06)
    this.setZoom(1.15) // Balanced view
  }
  
  /**
   * Ball flight: Track ball to catch point
   */
  ballFlightMode(ball: { x: number, y: number }): void {
    this.trackEntity(ball, -100) // Lead toward target
    this.setEaseSpeed(0.10)
    this.setZoom(1.20)
  }
  
  /**
   * Catch: Quick zoom on the reception
   */
  catchMode(receiverY: number): void {
    this.stopTracking()
    this.lookAt(receiverY - 50)
    this.setEaseSpeed(0.15)
    this.setZoom(1.30) // Tight on catch
  }
  
  /**
   * Touchdown: Cinematic celebration
   */
  touchdownMode(endZoneY: number): void {
    this.stopTracking()
    this.lookAt(endZoneY + 80)
    this.setEaseSpeed(0.08)
    this.setZoom(1.35) // Celebration shot
  }
  
  /**
   * Reset: Snap back to new LOS position
   */
  resetMode(losY: number): void {
    this.stopTracking()
    this.lookAt(losY - 150, true)
    this.setZoom(1.25)
  }
  
  // ============================================================================
  // GETTERS
  // ============================================================================
  
  getScrollY(): number {
    return this.camera.scrollY
  }
  
  getViewportCenter(): { x: number, y: number } {
    return {
      x: this.camera.scrollX + this.FIELD_WIDTH / 2,
      y: this.camera.scrollY + this.VIEWPORT_HEIGHT / 2,
    }
  }
}
