# Dark Side Football V3 - Technical Refactor Plan

## Executive Summary

This document outlines the technical changes required to transform the current V3 prototype into a world-class mobile football game. The refactor focuses on game feel, flow, and mechanics - NOT new features or assets.

---

## Current State Analysis

### What Exists

| Component | Location | Status |
|-----------|----------|--------|
| OffenseScene | `src/v3/game/scenes/OffenseScene.ts` | Functional but flat |
| DefenseScene | `src/v3/game/scenes/DefenseScene.ts` | Skeleton only |
| V3 Game Store | `src/v3/store/v3GameStore.ts` | Good foundation |
| Game Page | `app/v3/game/page.tsx` | React UI working |
| Play Cards | `app/v3/game/page.tsx` | Good design |
| Scoreboard | `app/v3/game/components/Scoreboard.tsx` | Exists |

### Critical Problems in Current OffenseScene

1. **No Explicit State Machine**
   - Uses simple `phase` string
   - No entry/exit handlers
   - No minimum durations

2. **Instant Transitions**
   - Pre-snap → countdown is instant
   - Routes start immediately
   - Catches resolve instantly

3. **No Anticipation Phase**
   - Pre-snap has no tension build
   - No camera movement
   - No audio swell

4. **Throwing Is Not Skill-Based**
   - Just tap any open receiver
   - No timing windows
   - No throw quality system

5. **Camera Is Robotic**
   - Hard-coded offsets
   - No easing transitions
   - Jumps on state changes

6. **YAC Is Basic**
   - Just run forward
   - Jukes are instant lane changes
   - No slow-mo on success

7. **Magic Numbers Everywhere**
   - Constants scattered in code
   - No tuning config
   - Hard to balance

---

## Refactor Architecture

### New File Structure

```
src/v3/game/
├── config/
│   └── gameConfig.ts          # All tunable constants
├── core/
│   ├── StateMachine.ts        # Generic state machine
│   └── GameStateMachine.ts    # Play state implementation
├── systems/
│   ├── CameraController.ts    # Camera with easing
│   ├── AudioController.ts     # V3-specific audio
│   ├── RouteSystem.ts         # Route timing/windows
│   ├── ThrowSystem.ts         # Throw quality calculation
│   └── YACController.ts       # Run-after-catch logic
├── entities/
│   ├── Player.ts              # Base player class
│   ├── Quarterback.ts         # QB-specific logic
│   ├── Receiver.ts            # Receiver + routes
│   ├── Defender.ts            # Defensive player AI
│   └── Football.ts            # Ball physics
├── scenes/
│   ├── OffenseScene.ts        # Refactored offense
│   └── DefenseScene.ts        # (Phase 2)
└── data/
    ├── plays.ts               # Play definitions
    └── routes.ts              # Route definitions
```

### Configuration System

Create a centralized config file:

```typescript
// src/v3/game/config/gameConfig.ts

export const V3_CONFIG = {
  // ============ TIMING ============
  timing: {
    preSnap: {
      minDuration: 750,
      maxDuration: 1250,
      cameraTightening: 0.03, // 3% zoom
    },
    snap: {
      duration: 200,
      cameraShakeIntensity: 3,
      cameraShakeDuration: 100,
    },
    dropback: {
      duration: 400,
      qbDropDistance: 50, // pixels
    },
    pocket: {
      baseDuration: 5000,
      pressureStart: 3000,
      collapseSpeed: 500,
    },
    throw: {
      windupDuration: 80,
      releaseDuration: 120,
      baseSpeed: 14,
      perfectSpeedBonus: 2,
    },
    catch: {
      animationDuration: 200,
      contestedDuration: 350,
    },
    yac: {
      jukeCooldown: 2000,
      spinCooldown: 3000,
      slowMoDuration: 200,
      slowMoScale: 0.3,
    },
    postPlay: {
      touchdownCelebration: 2000,
      tackleAnimation: 500,
      sackAnimation: 600,
      incompleteDelay: 300,
      fieldResetDuration: 1000,
    },
  },
  
  // ============ ROUTES ============
  routes: {
    stem: { start: 0, end: 0.3 },
    break: { start: 0.3, end: 0.5 },
    separation: { start: 0.5, end: 0.8 },
    recovery: { start: 0.8, end: 1.0 },
  },
  
  // ============ TIMING WINDOWS ============
  throwWindows: {
    perfect: { start: 0.4, end: 0.6 },
    good: { start: 0.3, end: 0.7 },
    late: { start: 0.7, end: 0.9 },
    veryLate: { start: 0.9, end: 1.0 },
  },
  
  // ============ DIFFICULTY ============
  difficulty: {
    week1to3: {
      pressureTimer: 5000,
      windowBonus: 0.2,
      defenderSpeedMult: 0.9,
    },
    week4to6: {
      pressureTimer: 4500,
      windowBonus: 0.1,
      defenderSpeedMult: 1.0,
    },
    week7to10: {
      pressureTimer: 4000,
      windowBonus: 0,
      defenderSpeedMult: 1.0,
    },
    week11to14: {
      pressureTimer: 3500,
      windowBonus: -0.05,
      defenderSpeedMult: 1.05,
    },
    week15to17: {
      pressureTimer: 3000,
      windowBonus: -0.1,
      defenderSpeedMult: 1.1,
    },
    superBowl: {
      pressureTimer: 2500,
      windowBonus: -0.15,
      defenderSpeedMult: 1.15,
    },
  },
  
  // ============ CAMERA ============
  camera: {
    presnap: {
      offsetY: -150,
      zoom: 1.0,
    },
    pocket: {
      offsetY: -180,
      zoom: 1.02,
    },
    ballFlight: {
      trackSpeed: 0.15,
      leadAmount: 50,
    },
    yac: {
      offsetY: -200,
      zoom: 0.95,
      trackSpeed: 0.12,
    },
    touchdown: {
      cutAngle: true,
      zoomIn: 1.15,
    },
  },
  
  // ============ FIELD ============
  field: {
    width: 400,
    height: 1200,
    endZoneHeight: 100,
    yardLength: 10,
    margin: 15,
  },
  
  // ============ PLAYERS ============
  players: {
    qb: {
      size: 18,
      glowRadius: 28,
    },
    receiver: {
      size: 14,
      openGlowColor: 0xFFD700,
      coveredColor: 0x888888,
    },
    defender: {
      size: 12,
      baseSpeed: 2.8,
      yacSpeed: 4.5,
    },
  },
  
  // ============ DARK SIDE ENERGY ============
  darkSideEnergy: {
    perfectThrow: 15,
    successfulJuke: 10,
    firstDown: 10,
    touchdown: 25,
    bigPlay: 10, // 20+ yards
    decayPerPlay: 5,
    activeThreshold: 75,
    windowBonus: 0.05,
  },
  
  // ============ AUDIO ============
  audio: {
    crowdBaseVolume: 0.3,
    crowdPreSnapSwell: 0.15,
    crowdTouchdownPeak: 1.0,
  },
}

export type V3Config = typeof V3_CONFIG
```

---

## State Machine Implementation

### Generic State Machine

```typescript
// src/v3/game/core/StateMachine.ts

export interface State<T extends string> {
  id: T
  minDuration?: number
  onEnter?: () => void
  onUpdate?: (delta: number) => void
  onExit?: () => void
}

export class StateMachine<T extends string> {
  private states: Map<T, State<T>> = new Map()
  private currentState: State<T> | null = null
  private stateStartTime: number = 0
  
  addState(state: State<T>) {
    this.states.set(state.id, state)
  }
  
  transition(to: T, force: boolean = false) {
    const newState = this.states.get(to)
    if (!newState) return false
    
    // Check min duration unless forced
    if (!force && this.currentState?.minDuration) {
      const elapsed = Date.now() - this.stateStartTime
      if (elapsed < this.currentState.minDuration) {
        return false
      }
    }
    
    // Exit current state
    this.currentState?.onExit?.()
    
    // Enter new state
    this.currentState = newState
    this.stateStartTime = Date.now()
    newState.onEnter?.()
    
    return true
  }
  
  update(delta: number) {
    this.currentState?.onUpdate?.(delta)
  }
  
  getCurrentState(): T | null {
    return this.currentState?.id ?? null
  }
  
  getTimeInState(): number {
    return Date.now() - this.stateStartTime
  }
}
```

### Play State Machine

```typescript
// src/v3/game/core/GameStateMachine.ts

import { StateMachine, State } from './StateMachine'
import { V3_CONFIG } from '../config/gameConfig'

export type PlayState = 
  | 'PRE_SNAP'
  | 'SNAP'
  | 'DROPBACK'
  | 'READ'
  | 'THROW'
  | 'BALL_FLIGHT'
  | 'CATCH'
  | 'YAC'
  | 'TOUCHDOWN'
  | 'TACKLED'
  | 'OUT_OF_BOUNDS'
  | 'INCOMPLETE'
  | 'SACKED'
  | 'INTERCEPTION'
  | 'POST_PLAY'
  | 'QUARTER_END'
  | 'GAME_END'

export class GameStateMachine extends StateMachine<PlayState> {
  private scene: Phaser.Scene
  
  constructor(scene: Phaser.Scene) {
    super()
    this.scene = scene
    this.initializeStates()
  }
  
  private initializeStates() {
    // PRE_SNAP
    this.addState({
      id: 'PRE_SNAP',
      minDuration: V3_CONFIG.timing.preSnap.minDuration,
      onEnter: () => this.onPreSnapEnter(),
      onUpdate: (delta) => this.onPreSnapUpdate(delta),
      onExit: () => this.onPreSnapExit(),
    })
    
    // SNAP
    this.addState({
      id: 'SNAP',
      minDuration: V3_CONFIG.timing.snap.duration,
      onEnter: () => this.onSnapEnter(),
      onExit: () => this.transition('DROPBACK', true),
    })
    
    // ... (implement all states)
  }
  
  private onPreSnapEnter() {
    // Camera: begin subtle tightening
    // Audio: crowd swell
    // UI: emit event for play cards
    this.scene.events.emit('playState', 'PRE_SNAP')
  }
  
  private onPreSnapUpdate(delta: number) {
    // Subtle camera zoom
    // Player idle animations
  }
  
  private onPreSnapExit() {
    // Play cards dismiss
  }
  
  private onSnapEnter() {
    // Camera shake
    // Snap audio
    // Ball transfer animation
    this.scene.events.emit('playState', 'SNAP')
    
    // Auto-transition after animation
    this.scene.time.delayedCall(V3_CONFIG.timing.snap.duration, () => {
      this.transition('DROPBACK', true)
    })
  }
  
  // ... implement all state handlers
}
```

---

## Camera Controller

```typescript
// src/v3/game/systems/CameraController.ts

import { V3_CONFIG } from '../config/gameConfig'

interface CameraTarget {
  x: number
  y: number
  zoom: number
}

export class CameraController {
  private camera: Phaser.Cameras.Scene2D.Camera
  private targetX: number = 0
  private targetY: number = 0
  private targetZoom: number = 1
  private easeSpeed: number = 0.08
  
  constructor(camera: Phaser.Cameras.Scene2D.Camera) {
    this.camera = camera
  }
  
  setTarget(target: CameraTarget, easeSpeed?: number) {
    this.targetX = target.x
    this.targetY = target.y
    this.targetZoom = target.zoom
    if (easeSpeed) this.easeSpeed = easeSpeed
  }
  
  trackEntity(entity: { x: number, y: number }, offsetY: number = 0) {
    this.targetX = 0 // Keep centered horizontally
    this.targetY = entity.y + offsetY
  }
  
  shake(intensity: number, duration: number) {
    this.camera.shake(duration, intensity / 100)
  }
  
  flash(duration: number, r: number, g: number, b: number) {
    this.camera.flash(duration, r, g, b)
  }
  
  update() {
    // Smooth interpolation
    const currentX = this.camera.scrollX
    const currentY = this.camera.scrollY
    const currentZoom = this.camera.zoom
    
    this.camera.scrollX += (this.targetX - currentX) * this.easeSpeed
    this.camera.scrollY += (this.targetY - currentY) * this.easeSpeed
    this.camera.zoom += (this.targetZoom - currentZoom) * this.easeSpeed
    
    // Clamp to bounds
    this.camera.scrollY = Phaser.Math.Clamp(
      this.camera.scrollY,
      0,
      V3_CONFIG.field.height - this.camera.height / this.camera.zoom
    )
  }
  
  // Pre-snap: subtle tighten on QB
  preSnapMode(qbY: number) {
    this.targetY = qbY - V3_CONFIG.camera.presnap.offsetY
    this.targetZoom = V3_CONFIG.camera.presnap.zoom
    this.easeSpeed = 0.02 // Very slow
  }
  
  // Pocket: stable view
  pocketMode(qbY: number) {
    this.targetY = qbY - V3_CONFIG.camera.pocket.offsetY
    this.targetZoom = V3_CONFIG.camera.pocket.zoom
    this.easeSpeed = 0.05
  }
  
  // Ball flight: track ball
  ballFlightMode(ball: { x: number, y: number }) {
    this.trackEntity(ball, -V3_CONFIG.camera.ballFlight.leadAmount)
    this.easeSpeed = V3_CONFIG.camera.ballFlight.trackSpeed
  }
  
  // YAC: follow carrier, pull back
  yacMode(carrier: { x: number, y: number }) {
    this.targetY = carrier.y + V3_CONFIG.camera.yac.offsetY
    this.targetZoom = V3_CONFIG.camera.yac.zoom
    this.easeSpeed = V3_CONFIG.camera.yac.trackSpeed
  }
  
  // Touchdown: cinematic cut
  touchdownMode(endZoneY: number) {
    this.targetY = endZoneY - 100
    this.targetZoom = V3_CONFIG.camera.touchdown.zoomIn
    this.easeSpeed = 0.15 // Fast for drama
  }
}
```

---

## Route System

```typescript
// src/v3/game/systems/RouteSystem.ts

import { V3_CONFIG } from '../config/gameConfig'

export interface RouteDefinition {
  startOffset: { x: number, y: number }
  path: { x: number, y: number }[] // Waypoints
  perfectWindow: { start: number, end: number }
}

export interface RouteState {
  progress: number // 0-1
  currentPhase: 'stem' | 'break' | 'separation' | 'recovery'
  isOpen: boolean
  timingQuality: 'perfect' | 'good' | 'late' | 'veryLate' | 'notOpen'
  defenderDistance: number
  position: { x: number, y: number }
}

export class RouteRunner {
  private route: RouteDefinition
  private startX: number
  private startY: number
  private progress: number = 0
  private difficulty: number
  
  constructor(route: RouteDefinition, losX: number, losY: number, difficulty: number) {
    this.route = route
    this.startX = losX + route.startOffset.x
    this.startY = losY + route.startOffset.y
    this.difficulty = difficulty
  }
  
  update(delta: number, routeDuration: number): RouteState {
    // Advance progress
    this.progress += (delta / 1000) / (routeDuration / 1000)
    this.progress = Math.min(1, this.progress)
    
    // Calculate position along path
    const position = this.calculatePosition(this.progress)
    
    // Determine phase
    const phase = this.getPhase(this.progress)
    
    // Calculate timing quality
    const timingQuality = this.getTimingQuality(this.progress)
    
    // Is receiver open?
    const windowBonus = this.getWindowBonus()
    const perfectWindow = {
      start: this.route.perfectWindow.start - windowBonus,
      end: this.route.perfectWindow.end + windowBonus,
    }
    const isOpen = this.progress >= perfectWindow.start && 
                   this.progress <= perfectWindow.end
    
    return {
      progress: this.progress,
      currentPhase: phase,
      isOpen,
      timingQuality,
      defenderDistance: 0, // Calculated by scene
      position,
    }
  }
  
  private calculatePosition(progress: number): { x: number, y: number } {
    const path = this.route.path
    const totalSegments = path.length
    const segmentProgress = progress * totalSegments
    const currentSegment = Math.min(Math.floor(segmentProgress), totalSegments - 1)
    const segmentFraction = segmentProgress - currentSegment
    
    const from = currentSegment === 0 
      ? { x: this.startX, y: this.startY }
      : path[currentSegment - 1]
    const to = path[currentSegment]
    
    return {
      x: this.startX + Phaser.Math.Linear(from.x, to.x, segmentFraction),
      y: this.startY + Phaser.Math.Linear(from.y, to.y, segmentFraction),
    }
  }
  
  private getPhase(progress: number): 'stem' | 'break' | 'separation' | 'recovery' {
    const r = V3_CONFIG.routes
    if (progress < r.stem.end) return 'stem'
    if (progress < r.break.end) return 'break'
    if (progress < r.separation.end) return 'separation'
    return 'recovery'
  }
  
  private getTimingQuality(progress: number) {
    const w = V3_CONFIG.throwWindows
    if (progress >= w.perfect.start && progress <= w.perfect.end) return 'perfect'
    if (progress >= w.good.start && progress <= w.good.end) return 'good'
    if (progress >= w.late.start && progress <= w.late.end) return 'late'
    if (progress >= w.veryLate.start) return 'veryLate'
    return 'notOpen'
  }
  
  private getWindowBonus(): number {
    // Lower difficulty = wider windows
    // This should factor in week and Dark Side Energy
    return 0 // Placeholder - implement with difficulty system
  }
}
```

---

## React Components Affected

| Component | Location | Changes Required |
|-----------|----------|------------------|
| Game Page | `app/v3/game/page.tsx` | Listen to new state events, add pressure indicator |
| Scoreboard | `app/v3/game/components/Scoreboard.tsx` | Add clock stop indicator |
| PlaySelector | `app/v3/game/components/PlaySelector.tsx` | Add route preview on hover |
| DownDistance | `app/v3/game/components/DownDistance.tsx` | Add first down animation |
| PressureMeter | `app/v3/game/components/PressureMeter.tsx` | New - subtle edge glow |
| PlayResult | `app/v3/game/components/PlayResult.tsx` | Add result animations |

---

## Phased Rollout

### Phase 1: One Perfect Play (Week 1)

**Goal**: Single play from pre-snap to touchdown works perfectly

**Deliverables**:
- [ ] State machine implemented
- [ ] Pre-snap anticipation (camera, audio)
- [ ] Snap transition with shake
- [ ] Dropback animation
- [ ] Routes with timing windows
- [ ] Timing-based throw quality
- [ ] Ball flight with trail
- [ ] YAC with slow-mo jukes
- [ ] Touchdown celebration

**Success Criteria**: Play the same play 10 times and it feels satisfying every time

### Phase 2: Full Drive (Week 2)

**Goal**: Complete drive from 25-yard line to touchdown

**Deliverables**:
- [ ] All 3 plays working
- [ ] Incomplete passes
- [ ] Sack mechanics
- [ ] Down & distance system
- [ ] Clock management
- [ ] First down celebration
- [ ] Field position reset

**Success Criteria**: Complete a drive with varied plays and realistic down/distance

### Phase 3: Full Game (Week 3)

**Goal**: 4-quarter game with scoring

**Deliverables**:
- [ ] Quarter transitions
- [ ] Score system
- [ ] Game end conditions
- [ ] Results screen
- [ ] Campaign integration

**Success Criteria**: Play a full game against Week 1 opponent

### Phase 4: Polish & Difficulty (Week 4)

**Goal**: Ready for public release

**Deliverables**:
- [ ] All 18 weeks difficulty balanced
- [ ] Dark Side Energy system
- [ ] All celebrations
- [ ] Tutorial flow
- [ ] Performance optimization
- [ ] Bug fixes from testing

**Success Criteria**: External playtesters rate it 8+ on feel

---

## Debug & Tuning

### Debug Panel Features

- Toggle state machine visualization
- Show timing windows graphically
- Display pressure meter
- Camera bounds overlay
- Route progress indicators
- Frame time monitor

### Tuning Workflow

1. All timing values in `gameConfig.ts`
2. Hot reload during development
3. Record gameplay sessions
4. Analyze with timing overlays
5. Adjust and iterate

---

## Testing Checklist

Before each phase completion:

- [ ] No instant transitions
- [ ] Camera never teleports
- [ ] Audio synced with visuals
- [ ] Touch controls responsive
- [ ] No jank on state changes
- [ ] Feels better than previous version

---

*This document guides all V3 technical implementation.*
*Last Updated: 2026-02-02*
