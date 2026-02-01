# Seattle Seahawks Defense - Game Mechanics

This document details all gameplay mechanics, systems, and formulas used in the game.

---

## Table of Contents

1. [Wave System](#wave-system)
2. [Wave Identity System](#wave-identity-system)
3. [Campaign Mode](#campaign-mode)
4. [Endless Mode](#endless-mode)
5. [DrinkSip Power-Up System](#drinksip-power-up-system)
6. [AI Defender System](#ai-defender-system)
7. [Scoring System](#scoring-system)
8. [Lives System](#lives-system)
9. [Fan Meter (12th Man)](#fan-meter-12th-man)
10. [Runner Types](#runner-types)
11. [Runner AI Behaviors](#runner-ai-behaviors)
12. [Collision System](#collision-system)
13. [Input System](#input-system)
14. [Upgrade System](#upgrade-system)
15. [Visual Feedback System](#visual-feedback-system)

---

## Wave System

### Core Mechanics

Waves are timed periods during which runners spawn continuously. Complete a wave by surviving until the timer expires and all runners are cleared.

### Wave Duration

```typescript
const BASE_WAVE_DURATION = 12000    // 12 seconds for wave 1
const WAVE_DURATION_INCREASE = 1500 // +1.5 seconds per wave
const MAX_WAVE_DURATION = 30000     // 30 seconds cap

function getWaveDuration(wave: number): number {
  return Math.min(MAX_WAVE_DURATION, BASE_WAVE_DURATION + (wave - 1) * WAVE_DURATION_INCREASE)
}
```

| Wave | Duration |
|------|----------|
| 1 | 12.0s |
| 2 | 13.5s |
| 3 | 15.0s |
| 5 | 18.0s |
| 10 | 25.5s |
| 13+ | 30.0s (max) |

### Spawn Intervals

```typescript
const BASE_SPAWN_INTERVAL = 900       // 900ms between spawns at wave 1
const MIN_SPAWN_INTERVAL = 200        // 200ms minimum
const SPAWN_REDUCTION_PER_WAVE = 50   // -50ms per wave

function getSpawnInterval(wave: number): number {
  return Math.max(MIN_SPAWN_INTERVAL, BASE_SPAWN_INTERVAL - (wave - 1) * SPAWN_REDUCTION_PER_WAVE)
}
```

### Wave Completion

A wave is complete when:
1. Wave timer reaches zero
2. All remaining runners on field are cleared (grace period)

After wave completion:
- Score bonus for wave cleared
- Upgrade selection (every wave in some modes)
- Wave counter increments

---

## Wave Identity System

Each wave has a unique theme and feel, with special modifiers that affect gameplay.

### Wave Themes (Cycle Every 10 Waves)

| Wave | Theme | Modifier | Effect |
|------|-------|----------|--------|
| 1 | TUTORIAL | Normal | Standard gameplay |
| 2 | SPEED INTRO | Normal | Forced Fast runners |
| 3 | HEAVY HITTERS | Tank Rush | More Tank runners, slower spawn |
| 4 | SWARM | Swarm | 50% faster spawn, smaller runners |
| 5 | BOSS WAVE | Boss Rush | Multiple boss spawns |
| 6 | FORMATIONS | Formation | Coordinated runner patterns |
| 7 | ELITE SQUAD | Elite | Star players and Jukers |
| 8 | SPEED DEMON | Speed Demon | 40% faster runners |
| 9 | ENDURANCE | Endurance | Extra long wave |
| 10 | CHAOS | Chaos | Random modifiers, 30% faster + more spawns |

### Wave Configuration

```typescript
interface WaveConfig {
  theme: string
  modifier: WaveModifier
  spawnMultiplier: number      // Affects spawn rate
  speedMultiplier: number      // Affects runner speed
  forcedTypes?: RunnerType[]   // Force specific runner types
  announcement?: string        // Text shown at wave start
  color?: number               // Theme color for UI
}
```

### Formation Spawns

Formation waves spawn runners in coordinated patterns:
- **Sweep**: 4 runners in diagonal line
- **Power**: Tank in front, 2 escorts behind
- **Spread**: 5 runners across all lanes simultaneously
- **Pincer**: 2 jukers on sides, tank in middle

---

## Campaign Mode

### Structure

- **20 stages** based on 2025 Seahawks schedule
- **3 games per stage** (60 total games)
- **5 waves per game** (fixed)

### Stages

| Stage | Week | Opponent | Location | Difficulty |
|-------|------|----------|----------|------------|
| 1 | Week 1 | 49ers | Seattle (Home) | 2 |
| 2 | Week 2 | Steelers | Pittsburgh | 3 |
| 3 | Week 3 | Saints | Seattle (Home) | 3 |
| 4 | Week 4 | Cardinals | Arizona | 4 |
| 5 | Week 5 | Buccaneers | Seattle (Home) | 4 |
| 6 | Week 6 | Jaguars | Jacksonville | 4 |
| 7 | Week 7 | Texans | Seattle (Home) | 5 |
| 8 | Week 8 | Commanders | Washington DC | 5 |
| 9 | Week 9 | Cardinals | Seattle (Home) | 5 |
| 10 | Week 10 | Rams | Los Angeles | 6 |
| 11 | Week 11 | Titans | Nashville | 6 |
| 12 | Week 12 | Vikings | Seattle (Home) | 6 |
| 13 | Week 13 | Falcons | Atlanta | 7 |
| 14 | Week 14 | Colts | Seattle (Home) | 7 |
| 15 | Week 15 | Rams | Seattle (Home) | 7 |
| 16 | Week 16 | Panthers | Carolina | 7 |
| 17 | Week 17 | 49ers | San Francisco | 8 |
| 18 | Divisional | 49ers | Seattle (Home) | 9 |
| 19 | NFC Champ | Rams | Seattle (Home) | 9 |
| 20 | Super Bowl | Patriots | San Francisco | 10 |

### Campaign Starting Lives

- **Regular Season**: 4 lives
- **Playoffs & Super Bowl**: 3 lives

---

## Endless Mode

### Structure

- Infinite waves with increasing difficulty
- No fixed wave limit
- Compete for high scores on leaderboard
- Starting lives: 4

### Progression

- Runner speed increases each wave
- Spawn interval decreases each wave
- Boss runners appear periodically (every 5 waves)
- New runner types unlock as waves progress
- Difficulty has no upper limit

---

## DrinkSip Power-Up System

### Overview

DrinkSip is a mixing power-up system where collecting drinks can be combined for enhanced effects.

### Drop Rate

```typescript
const POWER_UP_DROP_CHANCE = 0.25  // 25% chance on tackle
const MIX_WINDOW_MS = 5000         // 5 seconds to collect second drink
```

### Core Drinks (Solo Effects)

| Drink | Product | Duration | Effect |
|-------|---------|----------|--------|
| 🍺 Hazy IPA | Hazy IPA | 5s | Enemies 50% speed |
| 🍉 Watermelon | Watermelon Refresher | Instant | +1 life |
| 🍋 Lemon Lime | Lemon Lime Refresher | 6s | Player 150% speed |
| 🍊 Blood Orange | Blood Orange Refresher | 5s | Tackle radius 175% |

### Double-Up (Same Drink Twice)

| Double | Effect |
|--------|--------|
| 🍺🍺 Double Hazy | TIME FREEZE 3s, then 25% slow for 4s |
| 🍉🍉 Double Watermelon | Restore ALL lives to max (5) |
| 🍋🍋 Double Lemon Lime | Phase mode - 250% speed, auto-tackle |
| 🍊🍊 Double Blood Orange | SHOCKWAVE - clears all runners |

### Mix Combinations (Two Different Drinks)

| Mix | Ingredients | Effect |
|-----|-------------|--------|
| Hazy Melon | 🍺+🍉 | Slow-mo + regen 1 life per 2s |
| Citrus Haze | 🍺+🍋 | Enemies 50%, you 200% (bullet time) |
| Sunset IPA | 🍺+🍊 | Slow-mo + tackles create slowing shockwaves |
| Tropical Rush | 🍉+🍋 | +1 life + speed + 3x score multiplier |
| Melon Crush | 🍉+🍊 | +1 life + big hit + heal 0.5 per tackle |
| Citrus Blast | 🍋+🍊 | Speed + big hit + chain tackles |

### Ready Slot Mechanics

1. First drink collected goes to "Ready Slot" (shown in UI)
2. 5-second window to collect second drink
3. Same drink = Double-Up effect
4. Different drink = Mix combination
5. If window expires, solo effect activates
6. Tap Ready Slot to activate immediately

---

## AI Defender System

### Overview

AI defenders are computer-controlled teammates that assist the player.

### Characteristics

| Property | Player | AI Defender |
|----------|--------|-------------|
| Size | 100% | 50% |
| Lives | Infinite | 3 |
| Speed | Manual | 90 px/s |
| Tackle Radius | 1.8x base | 1.2x base |

### Maximum AI Defenders

```typescript
const MAX_AI_DEFENDERS = 6
```

### AI Behavior

1. **Targeting**: AI defenders target the nearest runner
2. **Movement**: Direct path toward target at constant speed
3. **Lives System**: Each AI has 3 lives, loses 1 when a runner scores near them
4. **Removal**: AI defender removed when lives reach 0

---

## Scoring System

### Base Points

| Runner Type | Base Points |
|-------------|-------------|
| Normal | 10 |
| Fast | 15 |
| Zigzag | 20 |
| Tank | 25 |
| Juker | 25 |
| Spinner | 25 |
| Freight | 30 |
| Reverse | 35 |
| Hail Mary | 50 |
| Star | 75 |
| Boss | 100 |

### Combo Multiplier

| Combo | Multiplier | Label |
|-------|------------|-------|
| 1 | 1.0x | - |
| 2 | 1.5x | 2x COMBO! |
| 3 | 2.0x | 3x COMBO! |
| 4+ | 3.0x | UNSTOPPABLE! |

### Close Call Bonuses

| Zone | Distance from Endzone | Bonus |
|------|----------------------|-------|
| Close Call | < 100px | +50% points |
| DENIED! | < 30px | +100% points (2x) |

### Chain Tackle Bonus

Tackles within 500ms of each other award chain bonus:
```
Chain Bonus = 10 × consecutiveTackles
```

### Score Calculation

```typescript
const comboMultiplier = Math.min(3, 1 + (combo - 1) * 0.5)
const powerUpMultiplier = activePowerUp?.scoreMultiplier || 1
const closeCallMultiplier = distanceFromEndzone < 30 ? 2 : distanceFromEndzone < 100 ? 1.5 : 1
const finalPoints = basePoints × comboMultiplier × powerUpMultiplier × closeCallMultiplier
```

---

## Lives System

### Starting Lives

| Mode | Starting Lives |
|------|----------------|
| Campaign (Regular Season) | 4 |
| Campaign (Playoffs/Super Bowl) | 3 |
| Endless Mode | 4 |

### Maximum Lives

```typescript
const MAX_LIVES = 5
```

### Gaining Lives

Lives can be gained via:
- `WATERMELON` drink (+1)
- `DOUBLE_WATERMELON` (restore to max)
- `TROPICAL_RUSH` mix (+1)
- `MELON_CRUSH` mix (+1, plus heal on tackle)
- Upgrade selection

---

## Fan Meter (12th Man)

### Overview

The Fan Meter represents crowd energy and grants a special ability when full.

### Mechanics

- Fan Meter ranges from 0-100
- Only starts building after wave 3
- Builds through consecutive tackles
- When full (100%), spawns Megaphone power-up

### 12th Man Effect

When Megaphone is collected:
1. Clears all runners on field
2. Awards 2x points for cleared runners
3. Strong visual/haptic feedback
4. Meter resets with cooldown

---

## Runner Types

### Original Types

| Type | Speed | Size | Health | Points | Behavior |
|------|-------|------|--------|--------|----------|
| Normal | 1.0x | 1.0x | 1 | 10 | Fake (hesitate then burst) |
| Fast | 1.8x | 0.8x | 1 | 15 | Juke (quick lateral cuts) |
| Tank | 0.6x | 1.4x | 2 | 25 | Freight (builds speed) |
| Zigzag | 1.2x | 1.0x | 1 | 20 | Spin (spiraling) |
| Boss | 0.4x | 2.2x | 5 | 100 | Straight |

### Arcade Types (Unlock by Wave)

| Type | Speed | Size | Health | Points | Unlocks | Behavior |
|------|-------|------|--------|--------|---------|----------|
| Juker | 1.4x | 0.9x | 1 | 25 | Wave 3 | Quick juke cuts |
| Freight | 0.5x | 1.3x | 2 | 30 | Wave 5 | Accelerates over distance |
| Spinner | 1.1x | 0.95x | 1 | 25 | Wave 6 | Spiraling movement |
| Reverse | 1.0x | 1.0x | 1 | 35 | Wave 7 | Can cut back up field |
| Hail Mary | 2.5x | 0.6x | 1 | 50 | Wave 8 | Ultra-fast straight run |
| Star | 0.9x | 1.2x | 3 | 75 | Wave 10 | Elite with stamina bar |

---

## Runner AI Behaviors

### Fake Behavior (Normal Runners)
- Hesitates mid-field for 400-700ms
- Then bursts forward at 150% speed
- Visual telegraph shows warning

### Juke Behavior (Fast, Juker, Star)
- Detects nearby defenders
- Quick lateral cut with 200ms duration
- 800ms cooldown between jukes
- Shoulder dip telegraph

### Freight Behavior (Tank, Freight)
- Starts at base speed
- Accelerates up to 2x speed over distance
- Shows "MAX SPEED!" warning at full power
- Doesn't dodge much

### Spin Behavior (Zigzag, Spinner)
- Spiraling movement pattern
- Hitbox rotates
- Harder to predict path

### Reverse Behavior
- 30-50% chance to cut back up field
- Triggers between y=400-550
- Moves 80px backwards
- Shows "REVERSE!" effect

### Hail Mary Behavior
- Straight line at 2.5x speed
- No dodging
- Motion blur effect
- High risk/reward target

---

## Collision System

### Circle-Circle Collision

```typescript
function checkCollision(
  x1: number, y1: number, r1: number,
  x2: number, y2: number, r2: number
): boolean {
  const dx = x2 - x1
  const dy = y2 - y1
  const distance = Math.sqrt(dx * dx + dy * dy)
  return distance < r1 + r2
}
```

### Collision Radii

| Entity | Radius |
|--------|--------|
| Defender (base) | 28 px |
| Runner | 14 px |
| Power-up | 24 px |

### Defender Collision Point

For photo-realistic player sprites:
- Collision is at **helmet level**, not feet
- Player has 1.8x base radius
- AI has 1.2x base radius

---

## Input System

### Supported Input Methods

1. **Touch** (primary): Drag to move defender
2. **Mouse**: Click and drag to move defender
3. **Keyboard**: Arrow keys or WASD

### Movement Zone Restriction

Defenders are restricted to the bottom 33% of the field:

```typescript
const DEFENDER_MIN_Y = 469  // GAME_HEIGHT * 0.67
```

### Player Movement Speed

```typescript
const DEFENDER_SPEED = 600  // pixels per second
```

---

## Upgrade System

### Between-Wave Upgrades

After each wave, players can choose from upgrades:

| Upgrade | Effect | Color | Icon |
|---------|--------|-------|------|
| Teammate | +1 AI Defender | Teal | 🏈 |
| Speed | +20% Movement | Green | ⚡ |
| Reach | +15% Tackle Range | Red | 💪 |
| Life | +1 Extra Life | Pink | ❤️ |
| Hazy IPA | Slow enemies 20% | Sandy | 🍺 |
| Watermelon | +2 Lives | Pink | 🍉 |
| Lemon Lime | +30% Speed | Green | 🍋 |
| Blood Orange | +25% Tackle Range | Orange | 🍊 |

---

## Visual Feedback System

### Combo Effects

| Combo | Screen Effect |
|-------|---------------|
| 2x | Edge glow (green) |
| 3x | Edge glow + screen shake + crowd cheer |
| 4x (MAX) | Red flash + fire mode aura + haptic feedback |

### Close Call Effects

- **CLOSE!**: Gold text, danger zone flash
- **DENIED!**: Large red text, strong shake, crowd roar, shockwave

### Runner AI Telegraphs

- **Fake**: Yellow indicator before burst
- **Juke**: Shoulder rotation before cut
- **Freight Max Speed**: "💨 MAX SPEED!" warning
- **Reverse**: "↩️ REVERSE!" announcement + screen flash

### Wave Announcements

Each wave shows themed announcement with:
- Wave number in theme color
- Theme name/modifier
- Color-matched screen flash
- Special audio for non-normal waves

---

## Constants Summary

```typescript
// Game dimensions
const GAME_WIDTH = 400
const GAME_HEIGHT = 700

// Defender
const DEFENDER_RADIUS = 28
const DEFENDER_SPEED = 600
const DEFENDER_MIN_Y = 469
const MAX_AI_DEFENDERS = 6
const AI_DEFENDER_SPEED = 90

// Runners
const RUNNER_RADIUS = 14
const BASE_RUNNER_SPEED = 70
const SPEED_PER_WAVE = 10
const MAX_RUNNER_SPEED = 220

// Power-ups
const POWER_UP_RADIUS = 20
const POWER_UP_DROP_CHANCE = 0.25
const MIX_WINDOW_MS = 5000

// Waves
const BASE_WAVE_DURATION = 12000
const WAVE_DURATION_INCREASE = 1500
const MAX_WAVE_DURATION = 30000
const BASE_SPAWN_INTERVAL = 900
const MIN_SPAWN_INTERVAL = 200
const SPAWN_REDUCTION_PER_WAVE = 50

// Lives
const STARTING_LIVES = 4
const MAX_LIVES = 5

// Campaign
const GAMES_PER_STAGE = 3
const TOTAL_STAGES = 20
const TOTAL_GAMES = 60
const MAX_WAVES_PER_CAMPAIGN_GAME = 5

// Scoring
const CLOSE_CALL_THRESHOLD = 100
const DENIED_THRESHOLD = 30
const CHAIN_TACKLE_WINDOW = 500
```

---

*Last Updated: 2026-01-31*
