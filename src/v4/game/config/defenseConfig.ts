/**
 * V4 Defense Mode Configuration
 * 
 * All tunable constants for defensive gameplay.
 * Similar structure to V3 offense config.
 */

export const DEFENSE_CONFIG = {
  // ============================================================================
  // TIMING (all durations in milliseconds)
  // ============================================================================
  timing: {
    preSnap: {
      minDuration: 750,
      adjustmentWindow: 5000,  // Time allowed to adjust positions
    },
    snap: {
      duration: 200,
      cameraShakeIntensity: 0.004,
      cameraShakeDuration: 80,
    },
    play: {
      maxPocketTime: 5000,    // Max time QB has before forced throw
      routeDuration: 4000,     // How long routes develop
      minTimeBeforeThrow: 1500, // Min time before QB can throw
    },
    ballFlight: {
      baseSpeed: 16,
      maxDuration: 800,
    },
    yac: {
      maxDuration: 10000,     // Max YAC phase before forced end
      tackleAnimationMs: 300,
    },
    postPlay: {
      resultDisplayMs: 1500,
      fieldResetMs: 1200,
    },
  },

  // ============================================================================
  // DEFENDER ATTRIBUTES
  // ============================================================================
  defenders: {
    dLine: {
      baseSpeed: 4.0,
      rushSpeedBonus: 1.5,
      sackRadius: 20,
      containAngle: 45,
    },
    linebacker: {
      baseSpeed: 3.8,
      zoneSpeed: 3.2,
      manSpeed: 3.6,
      pursuitAngle: 0.8,
    },
    defensive_back: {
      baseSpeed: 4.2,
      ballHawkSpeed: 4.5,    // Speed when ball is in air
      coverageRadius: 35,     // Ideal coverage distance
      interceptRadius: 30,    // Must be within this to attempt INT
    },
  },

  // ============================================================================
  // RUSH MOVES
  // ============================================================================
  rushMoves: {
    swim: {
      cooldownMs: 2000,
      durationMs: 300,
      speedMultiplier: 1.8,
      successWindow: 200,     // Timing window for perfect execution
    },
    bull: {
      cooldownMs: 2500,
      durationMs: 400,
      speedMultiplier: 1.2,
      pushDistance: 20,
    },
    spin: {
      cooldownMs: 3000,
      durationMs: 350,
      speedMultiplier: 2.0,
      invulnerabilityMs: 200, // Can't be blocked during spin
    },
    rip: {
      cooldownMs: 2000,
      durationMs: 280,
      speedMultiplier: 1.6,
    },
  },

  // ============================================================================
  // COVERAGE ACTIONS
  // ============================================================================
  coverageActions: {
    jump: {
      cooldownMs: 1500,
      heightPx: 40,
      durationMs: 400,
      timingWindows: {
        perfect: 150,   // ms before ball arrives
        good: 300,
        late: 500,
      },
    },
    dive: {
      cooldownMs: 2000,
      distancePx: 35,
      durationMs: 300,
      recoveryMs: 500,  // Time to get back up
    },
    swat: {
      cooldownMs: 1000,
      radiusPx: 25,
      successChance: 0.7,
    },
  },

  // ============================================================================
  // INTERCEPTION CHANCES
  // ============================================================================
  interception: {
    perfect: {
      baseChance: 0.85,
      bonusPerSkill: 0.02,
    },
    good: {
      baseChance: 0.40,
      bonusPerSkill: 0.03,
    },
    late: {
      baseChance: 0.10,
      bonusPerSkill: 0.01,
    },
    contested: {
      defenderAdvantage: 0.15,
    },
  },

  // ============================================================================
  // TACKLE MECHANICS
  // ============================================================================
  tackle: {
    baseRadius: 18,
    diveBonus: 10,
    missedTackleRecoveryMs: 800,
    hitStickChance: 0.2,      // Chance of causing fumble on big hit
    armTackleChance: 0.6,     // Chance ball carrier breaks weak tackle
  },

  // ============================================================================
  // AI OFFENSE BEHAVIOR
  // ============================================================================
  aiOffense: {
    qb: {
      dropbackDistance: 50,
      dropbackDurationMs: 500,
      pressureThreshold: 0.7,  // Pressure level that forces quick throw
      readProgressionMs: 800,  // Time between reads
    },
    receivers: {
      baseSpeed: 3.2,
      separationSpeed: 3.8,   // Burst off breaks
      routeAccuracy: 0.9,     // How precisely they run routes
    },
    playCalling: {
      quickPassOnBlitz: 0.7,  // Chance of quick pass when blitzing
      deepPassOnCover2: 0.3,  // Tendencies based on defense
    },
  },

  // ============================================================================
  // SCORING
  // ============================================================================
  scoring: {
    sack: 100,
    tackleForLoss: 75,
    tackle: 25,
    passBreakup: 50,
    interception: 200,
    pick6Bonus: 300,          // Additional for return TD
    touchdownAllowed: -150,
    bigPlayAllowed: -50,      // 20+ yard play
    thirdDownStop: 75,
    fourthDownStop: 100,
    redZoneStop: 100,
  },

  // ============================================================================
  // DIFFICULTY SCALING
  // ============================================================================
  difficulty: {
    week1to3: {
      qbAccuracyMult: 0.8,
      receiverSpeedMult: 0.85,
      throwWindowMult: 0.9,    // Smaller = easier for D
      tackleRadiusMult: 1.15,
    },
    week4to6: {
      qbAccuracyMult: 0.9,
      receiverSpeedMult: 0.92,
      throwWindowMult: 0.95,
      tackleRadiusMult: 1.1,
    },
    week7to10: {
      qbAccuracyMult: 1.0,
      receiverSpeedMult: 1.0,
      throwWindowMult: 1.0,
      tackleRadiusMult: 1.0,
    },
    week11to14: {
      qbAccuracyMult: 1.05,
      receiverSpeedMult: 1.05,
      throwWindowMult: 1.05,
      tackleRadiusMult: 0.95,
    },
    week15to17: {
      qbAccuracyMult: 1.1,
      receiverSpeedMult: 1.1,
      throwWindowMult: 1.1,
      tackleRadiusMult: 0.9,
    },
    superBowl: {
      qbAccuracyMult: 1.15,
      receiverSpeedMult: 1.15,
      throwWindowMult: 1.15,
      tackleRadiusMult: 0.85,
    },
  },

  // ============================================================================
  // CAMERA
  // ============================================================================
  camera: {
    viewHeight: 700,
    preSnap: {
      offsetY: -350,
      zoom: 1.0,
      easeSpeed: 0.015,
    },
    inPlay: {
      followQB: true,
      offsetY: -300,
      easeSpeed: 0.05,
    },
    ballInAir: {
      trackBall: true,
      zoom: 0.98,
      easeSpeed: 0.12,
    },
    yac: {
      trackCarrier: true,
      offsetY: -250,
      zoom: 0.95,
      easeSpeed: 0.1,
    },
    tackle: {
      shakeIntensity: 0.006,
      shakeDuration: 120,
      zoomIn: 1.05,
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
    yardLength: 10,
  },

  // ============================================================================
  // VISUAL EFFECTS
  // ============================================================================
  effects: {
    controlled: {
      glowColor: 0x00FFFF,
      glowAlpha: 0.5,
      pulseSpeed: 600,
    },
    sack: {
      flashColor: 0x69BE28,
      flashDuration: 200,
      cameraShake: 0.008,
    },
    interception: {
      flashColor: 0xFFD700,
      flashDuration: 300,
      slowMo: 0.3,
      slowMoDuration: 500,
    },
    tackle: {
      dustParticles: 8,
      impactRing: true,
    },
  },

  // ============================================================================
  // AUDIO (placeholder volumes)
  // ============================================================================
  audio: {
    snap: 0.6,
    rushMove: 0.5,
    tackle: 0.7,
    sack: 0.8,
    interception: 0.9,
    crowdOnBigPlay: 0.85,
  },
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getDifficultyForWeek(week: number) {
  if (week <= 3) return DEFENSE_CONFIG.difficulty.week1to3
  if (week <= 6) return DEFENSE_CONFIG.difficulty.week4to6
  if (week <= 10) return DEFENSE_CONFIG.difficulty.week7to10
  if (week <= 14) return DEFENSE_CONFIG.difficulty.week11to14
  if (week <= 17) return DEFENSE_CONFIG.difficulty.week15to17
  return DEFENSE_CONFIG.difficulty.superBowl
}

export function getInterceptionChance(
  timing: 'perfect' | 'good' | 'late',
  defenderSkill: number = 0,
  isContested: boolean = false
): number {
  const base = DEFENSE_CONFIG.interception[timing]
  let chance = base.baseChance + (defenderSkill * base.bonusPerSkill)
  
  if (isContested) {
    chance += DEFENSE_CONFIG.interception.contested.defenderAdvantage
  }
  
  return Math.min(0.95, Math.max(0.05, chance))
}

export function calculatePlayScore(result: {
  type: string
  yardsAllowed: number
  isThirdDown?: boolean
  isFourthDown?: boolean
  isRedZone?: boolean
}): number {
  const scoring = DEFENSE_CONFIG.scoring
  let score = 0
  
  switch (result.type) {
    case 'sack':
      score = scoring.sack
      break
    case 'tackleForLoss':
      score = scoring.tackleForLoss
      break
    case 'tackle':
      score = scoring.tackle
      break
    case 'passBreakup':
      score = scoring.passBreakup
      break
    case 'interception':
      score = scoring.interception
      break
    case 'touchdown':
      score = scoring.touchdownAllowed
      break
    default:
      score = 0
  }
  
  // Bonuses
  if (result.yardsAllowed >= 20 && result.type !== 'interception') {
    score += scoring.bigPlayAllowed
  }
  
  if ((result.isThirdDown || result.isFourthDown) && 
      ['sack', 'tackleForLoss', 'passBreakup', 'interception'].includes(result.type)) {
    score += result.isFourthDown ? scoring.fourthDownStop : scoring.thirdDownStop
  }
  
  if (result.isRedZone && ['sack', 'interception', 'passBreakup'].includes(result.type)) {
    score += scoring.redZoneStop
  }
  
  return score
}

export type DefenseConfigType = typeof DEFENSE_CONFIG
