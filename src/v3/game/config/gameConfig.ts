/**
 * V3 Game Configuration
 * 
 * All tunable constants in one place.
 * Change values here to adjust game feel without touching code.
 */

export const V3_CONFIG = {
  // ============================================================================
  // TIMING (all durations in milliseconds)
  // ============================================================================
  timing: {
    preSnap: {
      minDuration: 750,
      cameraTightening: 0.025, // 2.5% zoom over duration
      crowdSwellDuration: 600,
    },
    snap: {
      duration: 200,
      cameraShakeIntensity: 0.003,
      cameraShakeDuration: 100,
    },
    dropback: {
      duration: 400,
      qbDropDistance: 50, // pixels
      cameraPullback: 20, // pixels
    },
    read: {
      basePocketTime: 5000, // Time before sack - more time to read
      routeDuration: 3500, // SLOWED - routes develop over 3.5 seconds
      pressureWarningAt: 0.65, // Earlier warning
      defenderReactionDelay: 200, // Faster defender reaction
    },
    throw: {
      windupDuration: 80,
      releaseDuration: 150,
      baseSpeed: 16,
      perfectSpeedBonus: 3,
      wobblySpeedPenalty: -2,
    },
    ballFlight: {
      maxDuration: 800, // Cap for long throws
      arcHeight: 60, // Peak height of arc
    },
    catch: {
      cleanDuration: 200,
      contestedDuration: 350,
      spectacularDuration: 500,
    },
    yac: {
      jukeCooldown: 2000,
      spinCooldown: 3000,
      slowMoDuration: 180,
      slowMoTimeScale: 0.25,
      slowMoRecovery: 300,
    },
    postPlay: {
      touchdownPause: 300, // Slow-mo crossing
      touchdownCelebration: 2000,
      tackleAnimation: 500,
      sackAnimation: 600,
      incompleteDelay: 400,
      fieldResetDuration: 1200,
    },
    clockRunoff: {
      normal: 8, // seconds
      quickHuddle: 6,
      twoMinute: 0, // No runoff
    },
  },
  
  // ============================================================================
  // ROUTE PHASES (as percentages of route progress)
  // ============================================================================
  routes: {
    stem: { start: 0, end: 0.3 },
    break: { start: 0.3, end: 0.5 },
    separation: { start: 0.5, end: 0.8 },
    recovery: { start: 0.8, end: 1.0 },
  },
  
  // ============================================================================
  // THROW TIMING WINDOWS (as percentages of route progress)
  // ============================================================================
  throwWindows: {
    perfect: { start: 0.45, end: 0.65 },
    good: { start: 0.35, end: 0.75 },
    late: { start: 0.75, end: 0.9 },
    veryLate: { start: 0.9, end: 1.0 },
    early: { start: 0, end: 0.35 },
  },
  
  // ============================================================================
  // THROW QUALITY OUTCOMES
  // ============================================================================
  throwQuality: {
    perfect: {
      catchRadius: 1.3, // 30% larger
      ballSpeed: 1.2,
      spiralTightness: 1.0,
      interceptChance: 0,
    },
    good: {
      catchRadius: 1.1,
      ballSpeed: 1.0,
      spiralTightness: 0.8,
      interceptChance: 0.05,
    },
    late: {
      catchRadius: 0.9,
      ballSpeed: 0.9,
      spiralTightness: 0.4, // Wobble
      interceptChance: 0.15,
    },
    veryLate: {
      catchRadius: 0.6,
      ballSpeed: 0.8,
      spiralTightness: 0.2, // Duck
      interceptChance: 0.35,
    },
    early: {
      catchRadius: 0.8,
      ballSpeed: 1.1, // Rushed
      spiralTightness: 0.5,
      interceptChance: 0.1,
    },
  },
  
  // ============================================================================
  // DIFFICULTY BY WEEK
  // ============================================================================
  difficulty: {
    week1to3: {
      pocketTimeMult: 1.2, // 20% more time
      windowBonus: 0.15, // 15% wider windows
      defenderSpeedMult: 0.85,
      defenderReactionDelay: 200,
    },
    week4to6: {
      pocketTimeMult: 1.1,
      windowBonus: 0.08,
      defenderSpeedMult: 0.95,
      defenderReactionDelay: 150,
    },
    week7to10: {
      pocketTimeMult: 1.0,
      windowBonus: 0,
      defenderSpeedMult: 1.0,
      defenderReactionDelay: 100,
    },
    week11to14: {
      pocketTimeMult: 0.9,
      windowBonus: -0.05,
      defenderSpeedMult: 1.08,
      defenderReactionDelay: 75,
    },
    week15to17: {
      pocketTimeMult: 0.8,
      windowBonus: -0.1,
      defenderSpeedMult: 1.15,
      defenderReactionDelay: 50,
    },
    superBowl: {
      pocketTimeMult: 0.7,
      windowBonus: -0.12,
      defenderSpeedMult: 1.2,
      defenderReactionDelay: 25,
    },
  },
  
  // ============================================================================
  // CAMERA
  // ============================================================================
  camera: {
    viewHeight: 700,
    preSnap: {
      offsetY: -400, // Below LOS (positive = down field)
      zoom: 1.0,
      easeSpeed: 0.015,
    },
    snap: {
      shakeIntensity: 0.004,
      shakeDuration: 80,
    },
    dropback: {
      offsetY: -350,
      zoom: 1.02,
      easeSpeed: 0.04,
    },
    pocket: {
      offsetY: -300,
      zoom: 1.0,
      easeSpeed: 0.05,
    },
    ballFlight: {
      leadAmount: 80,
      trackSpeed: 0.12,
      zoom: 0.98,
    },
    catch: {
      snapSpeed: 0.2,
      zoom: 1.05,
    },
    yac: {
      offsetY: -250,
      zoom: 0.92,
      trackSpeed: 0.1,
      pullBackOnSpeed: 0.02,
    },
    touchdown: {
      zoomIn: 1.1,
      slowMoZoom: 1.15,
      easeSpeed: 0.15,
    },
    tackle: {
      shakeIntensity: 0.006,
      shakeDuration: 120,
    },
  },
  
  // ============================================================================
  // FIELD DIMENSIONS
  // ============================================================================
  field: {
    width: 400,
    height: 1200,
    playableWidth: 370,
    margin: 15,
    endZoneHeight: 100,
    yardLength: 10, // Pixels per yard
    losToQb: 50, // QB stands 5 yards behind LOS
  },
  
  // ============================================================================
  // PLAYER SIZES & SPEEDS
  // ============================================================================
  players: {
    qb: {
      radius: 18,
      glowRadius: 26,
      color: 0x111111,
      glowColor: 0x69BE28,
    },
    receiver: {
      radius: 14,
      color: 0x111111,
      glowColor: 0x69BE28,
      openHighlight: 0xFFD700,
      baseSpeed: 2.8, // SLOWED DOWN - receivers shouldn't dust DBs
    },
    defender: {
      radius: 12,
      baseSpeed: 2.6, // Slightly slower than receivers during routes
      yacSpeed: 3.5, // SLOWED pursuit speed during YAC
      pursuitAngle: 0.85, // How well they anticipate
    },
    lineman: {
      radius: 14,
      color: 0x111111,
      glowColor: 0x69BE28,
    },
    ball: {
      radius: 7,
      color: 0x7C4A03,
    },
  },
  
  // ============================================================================
  // YAC CONTROLS
  // ============================================================================
  yac: {
    baseRunSpeed: 3.0, // SLOWED DOWN - more time to juke/react
    sprintSpeedBonus: 1.0, // Less sprint bonus
    laneChangeDistance: 35,
    laneChangeDuration: 180,
    jukeDistance: 35, // REDUCED from 70 - more subtle jukes
    jukeDuration: 150, // Slightly longer animation
    spinDistance: 35,
    spinDuration: 280,
    diveDistance: 30,
    diveDuration: 220,
    tackleRadius: 20, // Slightly larger tackle zone
    perfectJukeRadius: 40, // Slightly larger perfect juke window
  },
  
  // ============================================================================
  // DARK SIDE ENERGY
  // ============================================================================
  darkSideEnergy: {
    gains: {
      perfectThrow: 15,
      goodThrow: 8,
      successfulJuke: 12,
      perfectJuke: 20,
      firstDown: 10,
      bigPlay: 12, // 20+ yards
      touchdown: 30,
    },
    decay: {
      perPlay: 5,
      onSack: 15,
      onInterception: 25,
      onIncomplete: 3,
    },
    activeThreshold: 70,
    maxEnergy: 100,
    bonuses: {
      windowExpansion: 0.08, // 8% wider windows
      receiverSpeed: 0.05, // 5% faster
      jukeWindow: 0.1, // 10% more forgiving
    },
    visuals: {
      pulseSpeed: 1.2, // Hz
      glowIntensity: 0.3,
      cameraZoomBonus: 0.02,
    },
  },
  
  // ============================================================================
  // AUDIO LEVELS
  // ============================================================================
  audio: {
    crowd: {
      baseVolume: 0.25,
      preSnapSwell: 0.4,
      touchdownPeak: 0.9,
      sackDrop: 0.15,
    },
    sfx: {
      snapVolume: 0.6,
      throwVolume: 0.5,
      catchVolume: 0.55,
      jukeVolume: 0.4,
      tackleVolume: 0.7,
      touchdownVolume: 0.85,
    },
  },
  
  // ============================================================================
  // VISUAL EFFECTS
  // ============================================================================
  effects: {
    ballTrail: {
      length: 8,
      color: 0x69BE28,
      alpha: 0.4,
    },
    receiverGlow: {
      pulseSpeed: 600,
      openAlpha: 0.5,
      perfectAlpha: 0.8,
    },
    touchdown: {
      flashColor: { r: 105, g: 190, b: 40 },
      flashDuration: 300,
      particleCount: 25,
    },
    juke: {
      slowMoTint: 0x001100,
      slowMoVignette: 0.3,
    },
  },
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getDifficultyForWeek(week: number) {
  if (week <= 3) return V3_CONFIG.difficulty.week1to3
  if (week <= 6) return V3_CONFIG.difficulty.week4to6
  if (week <= 10) return V3_CONFIG.difficulty.week7to10
  if (week <= 14) return V3_CONFIG.difficulty.week11to14
  if (week <= 17) return V3_CONFIG.difficulty.week15to17
  return V3_CONFIG.difficulty.superBowl
}

export function getPocketTime(week: number): number {
  const difficulty = getDifficultyForWeek(week)
  return V3_CONFIG.timing.read.basePocketTime * difficulty.pocketTimeMult
}

export function getThrowWindow(week: number, windowType: keyof typeof V3_CONFIG.throwWindows) {
  const difficulty = getDifficultyForWeek(week)
  const baseWindow = V3_CONFIG.throwWindows[windowType]
  const bonus = difficulty.windowBonus
  
  return {
    start: Math.max(0, baseWindow.start - bonus),
    end: Math.min(1, baseWindow.end + bonus),
  }
}

export function getDefenderSpeed(week: number, isYac: boolean): number {
  const difficulty = getDifficultyForWeek(week)
  const baseSpeed = isYac 
    ? V3_CONFIG.players.defender.yacSpeed 
    : V3_CONFIG.players.defender.baseSpeed
  return baseSpeed * difficulty.defenderSpeedMult
}

export type V3ConfigType = typeof V3_CONFIG
