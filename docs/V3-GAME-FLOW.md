# Dark Side Football V3 - Complete Game Flow Document

> **NORTH STAR**: Every action must have (1) Anticipation, (2) Execution, (3) Consequence

This document defines the complete gameplay flow for the V3 offensive experience. Defense will be added in Phase 2.

---

## Table of Contents

1. [Core Philosophy](#core-philosophy)
2. [State Machine](#state-machine)
3. [Pre-Snap Phase](#pre-snap-phase)
4. [Snap Phase](#snap-phase)
5. [Dropback & Read Phase](#dropback--read-phase)
6. [Throw Phase](#throw-phase)
7. [Ball Flight Phase](#ball-flight-phase)
8. [Catch Phase](#catch-phase)
9. [YAC Phase](#yac-phase)
10. [Play Resolution Phase](#play-resolution-phase)
11. [Post-Play Phase](#post-play-phase)
12. [Clock & Quarter System](#clock--quarter-system)
13. [Camera System](#camera-system)
14. [Audio System](#audio-system)
15. [Dark Side Energy System](#dark-side-energy-system)

---

## Core Philosophy

### What Makes This Game Feel Good

1. **Anticipation Before Action**
   - Pre-snap: camera tightens, crowd swells, routes animate onto field
   - Before throw: timing window builds tension
   - Before contact: slow-mo triggers for perfect jukes

2. **Execution Is Skill-Based**
   - Throwing is TIMING, not tap-and-hope
   - YAC requires reading defenders and making decisions
   - Perfect execution = expanded windows, better animations

3. **Consequence Is Felt**
   - Touchdowns explode with celebration
   - Sacks have weight and camera shake
   - Bad throws wobble and get picked

### What We Are NOT Building

- Instant resolution ("tap → done")
- Random stat-based outcomes
- Passive gameplay where you watch things happen
- Overcomplicated meters and bars

---

## State Machine

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           GAME STATE MACHINE                                  │
└──────────────────────────────────────────────────────────────────────────────┘

GAME STATES (outer):
  MENU → MAP → MATCH_PREVIEW → ROSTER → PLAYING → RESULTS

PLAY STATES (inner, during PLAYING):

  ┌─────────────┐
  │  PRE_SNAP   │ ← Initial state, play selection
  └──────┬──────┘
         │ player selects play
         ▼
  ┌─────────────┐
  │    SNAP     │ ← 150-250ms transition, camera shake, audio cue
  └──────┬──────┘
         │ automatic transition
         ▼
  ┌─────────────┐
  │  DROPBACK   │ ← QB drops back 5-7 yards, camera tracks
  └──────┬──────┘
         │ dropback complete (~400ms)
         ▼
  ┌─────────────┐
  │    READ     │ ← Main decision phase, routes running
  └──────┬──────┘
         │ player taps open receiver OR pocket collapses
         ▼
  ┌─────────────┐               ┌─────────────┐
  │   THROW     │──────────────▶│   SACKED    │ (if pressure timer expires)
  └──────┬──────┘               └──────┬──────┘
         │ ball released                │
         ▼                              │
  ┌─────────────┐                       │
  │ BALL_FLIGHT │                       │
  └──────┬──────┘                       │
         │ ball reaches receiver        │
         ▼                              │
  ┌─────────────┐   ┌─────────────┐     │
  │   CATCH     │──▶│ INCOMPLETE  │     │
  └──────┬──────┘   └──────┬──────┘     │
         │ successful       │            │
         ▼                  │            │
  ┌─────────────┐           │            │
  │     YAC     │           │            │
  └──────┬──────┘           │            │
         │                  │            │
    ┌────┴────┬─────────────┴────────────┤
    ▼         ▼                          ▼
┌────────┐ ┌────────────┐ ┌───────┐ ┌────────────┐
│TOUCHDOWN│ │OUT_OF_BOUNDS│ │TACKLED│ │  TURNOVER  │
└────┬───┘ └─────┬──────┘ └───┬───┘ └─────┬──────┘
     │           │            │           │
     └───────────┴────────────┴───────────┘
                       │
                       ▼
               ┌─────────────┐
               │  POST_PLAY  │ ← Stats update, field reset
               └──────┬──────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
   ┌─────────────┐         ┌─────────────┐
   │  PRE_SNAP   │         │ QUARTER_END │
   │  (next play)│         │  or GAME_END│
   └─────────────┘         └─────────────┘
```

### State Transition Rules

| From State    | To State      | Trigger                              | Duration  |
|---------------|---------------|--------------------------------------|-----------|
| PRE_SNAP      | SNAP          | Player selects play                  | 0ms       |
| SNAP          | DROPBACK      | Auto after snap animation            | 200ms     |
| DROPBACK      | READ          | QB reaches pocket position           | 400ms     |
| READ          | THROW         | Player taps open receiver            | 0ms       |
| READ          | SACKED        | Pressure timer expires (4-5s)        | 0ms       |
| THROW         | BALL_FLIGHT   | Throw animation complete             | 200ms     |
| BALL_FLIGHT   | CATCH         | Ball reaches receiver                | Variable  |
| BALL_FLIGHT   | INCOMPLETE    | Ball reaches ground/intercepted      | Variable  |
| CATCH         | YAC           | Catch animation complete             | 200ms     |
| YAC           | TOUCHDOWN     | Carrier crosses goal line            | 0ms       |
| YAC           | TACKLED       | Defender reaches carrier             | 0ms       |
| YAC           | OUT_OF_BOUNDS | Carrier exits sideline               | 0ms       |
| TOUCHDOWN     | POST_PLAY     | Celebration complete                 | 2000ms    |
| TACKLED       | POST_PLAY     | Tackle animation complete            | 500ms     |
| INCOMPLETE    | POST_PLAY     | Ball hits ground animation           | 300ms     |
| SACKED        | POST_PLAY     | Sack animation complete              | 600ms     |
| POST_PLAY     | PRE_SNAP      | Field reset animation                | 1000ms    |
| POST_PLAY     | QUARTER_END   | Clock reaches 0:00                   | 0ms       |
| QUARTER_END   | PRE_SNAP      | Quarter transition complete          | 2000ms    |
| QUARTER_END   | GAME_END      | Was Q4                               | 0ms       |

---

## Pre-Snap Phase

**Duration**: 750-1250ms (variable based on player)  
**Purpose**: Build anticipation, let player read defense, select play

### Required Behaviors

1. **Camera**
   - Locked behind QB at slight elevation
   - Subtle ease toward QB (2-3% zoom over duration)
   - No sudden movements

2. **Audio**
   - Crowd ambience swells 10-15%
   - Stadium atmosphere sounds
   - Optional: QB cadence audio cue

3. **Players**
   - QB in ready stance, subtle breathing idle
   - Receivers at line, foot shuffle idle animation
   - O-line in stance, slight weight shifts
   - ONE defender subtly shifts/creeps (telegraph danger)

4. **UI (React)**
   - Play cards animate IN from bottom (staggered, spring animation)
   - Each card shows mini route diagram
   - Down & distance visible at top
   - Clock ticking (but slower pace during pre-snap)

5. **Route Preview**
   - When hovering/focusing a play card, routes ghost onto field
   - One route may pulse (indicates high success probability)
   - Optional: defender highlights show coverage danger

### Exit Conditions
- Player taps a play card → transition to SNAP

---

## Snap Phase

**Duration**: 150-250ms  
**Purpose**: Punctuate the decision, signal action begins

### Required Behaviors

1. **Camera**
   - Micro shake (2-3px, 100ms)
   - Quick ease back to follow position

2. **Audio**
   - Sharp snap sound effect
   - Crowd roar begins building

3. **Players**
   - Ball snaps from center (quick animation)
   - O-line fires forward in blocking stance
   - QB receives ball, begins drop

4. **UI**
   - Play cards exit (fast slide down)
   - HUD enters minimal mode

### Exit Conditions
- Auto-transition after snap animation completes

---

## Dropback & Read Phase

**Duration**: 400ms dropback + 4-5s read window  
**Purpose**: Core decision-making phase

### Dropback Sub-Phase (400ms)

1. **Camera**
   - Track backward with QB
   - Slight pull-out to show developing routes

2. **QB**
   - Steps back 5-7 yards from LOS
   - Scanning animation (head turns)

3. **O-Line**
   - Engaged with pass rushers
   - Blocking animations active

### Read Sub-Phase (4-5 seconds)

1. **Pressure System** (INVISIBLE TO PLAYER)
   - Internal pressure timer starts at snap
   - Pressure increases based on:
     - Base difficulty (week-based)
     - Blitz packages
     - Time elapsed
   - At 80% pressure: O-line starts failing
   - At 100% pressure: pocket collapses → SACKED

2. **Route Running**
   - Each route has phases:
     - **Stem** (0-30%): Initial movement off line
     - **Break** (30-50%): Route cut/change direction
     - **Separation** (50-80%): Open window
     - **Recovery** (80-100%): Defender catches up
   - Visual indicators:
     - Open receiver: yellow highlight/glow
     - Covered receiver: no highlight
     - Dangerous throw: subtle red pulse

3. **Timing Windows**
   - Each receiver has a PERFECT WINDOW (e.g., 40-60% of route)
   - Window SIZE varies by:
     - Receiver skill (rating)
     - Defender coverage skill
     - Difficulty level
     - Dark Side Energy bonus
   - Visual feedback:
     - Perfect window: bright glow
     - Good window: medium glow
     - Late window: dim/flickering

4. **Camera**
   - Locked on pocket area
   - Subtle zoom adjustments based on route depth
   - Never loses sight of QB

5. **Audio**
   - Crowd noise level indicates pressure
   - Optional: heartbeat sfx at high pressure
   - Line blocking sounds

### Exit Conditions
- Player taps open receiver → THROW
- Pressure reaches 100% → SACKED
- All receivers covered (rare) → forced throw or scramble (future)

---

## Throw Phase

**Duration**: 150-200ms  
**Purpose**: Execute the pass with skill-based timing

### Timing Quality

The throw quality is determined by WHEN the player tapped:

| Tap Timing           | Result          | Visual Feedback             |
|---------------------|-----------------|----------------------------|
| Perfect (40-60%)    | Perfect spiral  | Clean release, tight spiral |
| Good (30-40, 60-70%)| Slightly off    | Minor wobble, still catchable|
| Late (70-90%)       | Contested       | Wobble, defender close     |
| Very Late (90%+)    | Dangerous       | Duck throw, likely PBU/INT |
| Early (0-30%)       | Not open yet    | Rushed throw, contested    |

### Required Behaviors

1. **QB Animation**
   - Wind-up (50-80ms)
   - Release (100ms)
   - Follow-through (hold pose)

2. **Camera**
   - Snap to ball trajectory line
   - Begin tracking ball immediately

3. **Audio**
   - Release sound (varies by throw quality)
   - Crowd anticipation rise

4. **Ball Creation**
   - Ball spawns at QB hand position
   - Trajectory calculated to receiver's projected position
   - Speed varies by throw distance

### Exit Conditions
- Throw animation complete → BALL_FLIGHT

---

## Ball Flight Phase

**Duration**: Variable (200-800ms based on distance)  
**Purpose**: Create tension during ball travel

### Required Behaviors

1. **Ball Movement**
   - Arc trajectory (parabolic)
   - Spin animation
   - Perfect throws: tight spiral
   - Bad throws: visible wobble

2. **Camera**
   - Track ball at slight lead
   - Show both ball and target area
   - Subtle motion blur direction

3. **Trail Effect**
   - Dark Side energy trail (green/neon)
   - Length/brightness based on throw quality

4. **Shadow**
   - Ball shadow on field
   - Size changes with ball height
   - Creates depth perception

5. **Audio**
   - Whoosh sound (doppler effect)
   - Crowd following ball

6. **Receiver/Defender**
   - Both converge on catch point
   - Animations telegraph outcome

### Exit Conditions
- Ball reaches catch radius → CATCH or INCOMPLETE
- Ball intercepted → TURNOVER

---

## Catch Phase

**Duration**: 150-250ms  
**Purpose**: Resolve the reception

### Catch Types

| Type       | Condition                     | Animation                    |
|------------|-------------------------------|------------------------------|
| Clean      | Perfect throw, open receiver  | Secure catch, tuck ball     |
| Contested  | Defender within 3 yards       | Contested animation, may drop|
| Spectacular| Deep throw, tight coverage    | Diving/leaping catch        |
| Dropped    | Bad throw, good coverage      | Ball bounces away           |
| Broken Up  | Defender breaks up play       | PBU animation               |

### Required Behaviors

1. **Receiver**
   - Turn to face upfield after catch
   - Ball secured animation

2. **Camera**
   - Quick center on receiver
   - Pull back for YAC view

3. **Audio**
   - Catch sound (hands on ball)
   - Crowd reaction

4. **UI**
   - "CATCH!" flash
   - Receiver name toast

### Exit Conditions
- Catch successful → YAC
- Catch failed → INCOMPLETE

---

## YAC Phase

**Duration**: Variable until tackle/TD/OOB  
**Purpose**: Player-controlled running with skill-based juking

### Controls

| Input          | Action              | Cooldown |
|----------------|---------------------|----------|
| Swipe Left     | Lane change left    | None     |
| Swipe Right    | Lane change right   | None     |
| Tap Left       | Juke left           | 2 seconds|
| Tap Right      | Juke right          | 2 seconds|
| Double Tap     | Spin move           | 3 seconds|
| Swipe Down     | Dive forward        | None     |

### Juke Success

- Perfect juke (defender within 30px): Triggers 150-200ms slow-mo
- Defender plays whiff animation
- Expanded path opens

### Required Behaviors

1. **Ball Carrier**
   - Runs toward end zone automatically
   - Player controls lateral movement
   - Lean animation on direction change
   - Speed varies by receiver rating

2. **Defenders**
   - Pursue ball carrier
   - Angle of pursuit AI
   - Speed increases as carrier advances

3. **Camera**
   - Pull back for spatial awareness
   - Track carrier with lead
   - Zoom in as TD approaches

4. **Audio**
   - Crowd volume increases toward end zone
   - Footstep sounds
   - Juke success sound

### Exit Conditions
- Carrier Y < end zone → TOUCHDOWN
- Carrier X exits bounds → OUT_OF_BOUNDS
- Defender collision → TACKLED

---

## Play Resolution Phase

### Touchdown Resolution

1. **Camera**
   - Cut to end zone angle (or smooth transition)
   - 200-300ms slow-mo as carrier crosses
   - Pull back for celebration view

2. **Audio**
   - Bass hit on crossing
   - Crowd explosion
   - Celebration music sting

3. **Visual Effects**
   - Neon Dark Side pulse from end zone
   - Particle burst (green/gold)
   - Camera flash effect

4. **Celebration**
   - 1.5-2 second signature celebration
   - Keep brief for pacing

### Tackle Resolution

1. **Camera**
   - Stop on impact
   - Slight shake (10-15px)

2. **Audio**
   - Impact sound
   - Crowd deflation

3. **Animation**
   - Momentum-based tackle direction
   - Ball carrier goes down

### Sack Resolution

1. **Camera**
   - Shake on impact (15-20px)
   - Quick zoom on QB

2. **Audio**
   - Heavy impact sound
   - Crowd groan

3. **Visual**
   - QB taken down animation
   - Loss of yards indicator

---

## Post-Play Phase

**Duration**: 1000-1500ms  
**Purpose**: Update state, reset field

### Required Behaviors

1. **Stats Update**
   - Down advances
   - Distance recalculates
   - Yard line moves

2. **Clock**
   - Run off time (6-10 seconds)
   - Exception: OOB stops clock

3. **Field Reset**
   - Players return to positions
   - LOS marker moves
   - First down line updates (if applicable)

4. **UI**
   - Down/distance update animation
   - Clock update
   - Optional: first down celebration

### Exit Conditions
- Field reset complete → PRE_SNAP
- Clock expired → QUARTER_END
- Turnover on downs → possession change

---

## Clock & Quarter System

### Rules

- 4 quarters per game
- 60 seconds (1 minute) per quarter
- Clock runs during:
  - Between plays (6-10 second runoff)
  - During play execution (real-time)
- Clock STOPS for:
  - Incomplete passes
  - Out of bounds
  - Touchdowns
  - First downs (brief pause)
  - Timeouts (future feature)

### UI Requirements

- Always visible clock
- Quarter indicator
- Visual indication WHY clock stopped

---

## Camera System

### Camera States

| Game State    | Camera Behavior                           |
|---------------|------------------------------------------|
| PRE_SNAP      | Locked behind QB, slight zoom in         |
| SNAP          | Micro shake, hold position               |
| DROPBACK      | Track QB backward                        |
| READ          | Stable, slight adjustments for routes    |
| THROW         | Snap to ball trajectory                  |
| BALL_FLIGHT   | Track ball with lead                     |
| CATCH         | Quick center on receiver                 |
| YAC           | Pull back, follow carrier                |
| TOUCHDOWN     | Cinematic cut to end zone                |
| TACKLED       | Stop on impact, slight shake             |

### Transition Rules

- NEVER teleport (always ease)
- Use appropriate easing curves:
  - Pre-snap: very slow ease
  - Ball flight: medium track
  - YAC: responsive follow
  - Touchdown: quick cut (intentional)

---

## Audio System

### Sound Categories

1. **Crowd Ambience** (continuous)
   - Baseline level during play
   - Swells pre-snap
   - Peaks on big plays

2. **Action SFX**
   - Snap pop
   - Ball release whoosh
   - Catch impact
   - Juke success
   - Tackle thud

3. **Feedback Stings**
   - Touchdown bass hit
   - First down chime
   - Sack impact

4. **UI Sounds**
   - Button taps
   - Play selection
   - Menu transitions

### Timing Is Critical

Audio cues MUST be synchronized with visual events. Late audio destroys immersion.

---

## Dark Side Energy System

### What It Is

An invisible energy meter that builds from successful plays and improves performance when active.

### Building Energy

| Action                | Energy Gained |
|----------------------|---------------|
| Perfect throw        | +15%          |
| Successful juke      | +10%          |
| First down           | +10%          |
| Touchdown            | +25%          |
| 20+ yard play        | +10%          |

### Energy Decay

- Decays 5% per play if not gaining
- Resets on turnover

### When Active (≥75%)

- Subtle visual pulse on screen edges
- Tighter camera (more focused)
- Timing windows slightly expanded (+5-10%)
- Jukes more responsive
- Receivers slightly faster

### What It Is NOT

- Visible meter (it's felt, not seen)
- Power creep (bonuses are subtle)
- Required to win (just makes it feel better)

---

## Difficulty Scaling

### Per-Week Difficulty

| Week  | Pressure Timer | Timing Windows | Defender Speed |
|-------|---------------|----------------|----------------|
| 1-3   | 5 seconds     | +20% wider     | 0.9x           |
| 4-6   | 4.5 seconds   | +10% wider     | 1.0x           |
| 7-10  | 4 seconds     | Normal         | 1.0x           |
| 11-14 | 3.5 seconds   | -5% narrower   | 1.05x          |
| 15-17 | 3 seconds     | -10% narrower  | 1.1x           |
| 18+   | 2.5 seconds   | -15% narrower  | 1.15x          |

---

## Implementation Phases

### Phase 1: One Perfect Play
- Implement full state machine
- One play (Slant Flood)
- Complete pre-snap → TD flow
- Basic camera system
- Core audio

### Phase 2: Full Drive
- Add all plays
- Implement down/distance system
- Add incomplete/sack states
- Clock system

### Phase 3: Full Game
- 4 quarters
- Scoring system
- Game end conditions
- Results screen

### Phase 4: Polish & Difficulty
- Dark Side Energy
- Difficulty ramp
- All celebrations
- Achievement triggers

---

*This document is the source of truth for V3 gameplay implementation.*
*Last Updated: 2026-02-02*
