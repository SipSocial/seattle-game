# Dark Side Game V3 - Implementation Plan

## Overview

Build a new QB Legend-inspired football game featuring both OFFENSE and DEFENSE modes. Uses real Seahawks player names (Sam Darnold, DeMarcus Lawrence, JSN) in Dark Side branded uniforms (stealth black/grey, no logos).

**Inspired by:** "2 Minute Football QB Legend" (9.3/10 rating, 22K votes on CrazyGames)

**Game Length:** 4 x 1 minute quarters (4 min total, same as QB Legend)

---

## Routes Implemented (Phase 0)

| Route | Purpose | Status |
|-------|---------|--------|
| `/v3` | Redirect to menu | ✅ |
| `/v3/menu` | Main menu | ✅ |
| `/v3/map` | Campaign map (Road to Super Bowl) | ✅ |
| `/v3/match/[weekId]` | Matchup preview with opponent colors | ✅ |
| `/v3/roster` | Player selection (offense + defense) | ✅ |
| `/v3/game` | Phaser gameplay container + HUD | ✅ |
| `/v3/results` | Post-game stats, grade | ✅ |
| `/v3/admin/assets` | Asset picker for Dark Side uniforms | ✅ |

---

## Key Files Created

### Routes (`app/v3/`)
- `layout.tsx` - V3 layout with Dark Side theme
- `page.tsx` - Redirect to menu
- `menu/page.tsx` - Main menu with premium UI
- `map/page.tsx` - Reuses CampaignMapV2
- `match/[weekId]/page.tsx` - Opponent-specific theming
- `roster/page.tsx` - Dual offense/defense selection
- `game/page.tsx` - Phaser container with React HUD
- `results/page.tsx` - Stats, grade, upgrades
- `admin/assets/page.tsx` - Asset management

### Store (`src/v3/store/`)
- `v3GameStore.ts` - Complete game state management

### Game Data (`src/v3/game/data/`)
- `v3Config.ts` - All tuning knobs for gameplay

### Lib (`src/v3/lib/`)
- `offensePlayerData.ts` - Offensive player physicals for Dark Side uniforms

---

## Offensive Player Data (Phase 0A)

Added complete physical data for offensive starters:

| Jersey | Name | Position | Status |
|--------|------|----------|--------|
| 14 | Sam Darnold | QB | ✅ Data complete |
| 11 | Jaxon Smith-Njigba | WR | ✅ Data complete |
| 10 | Cooper Kupp | WR | ✅ Data complete |
| 88 | AJ Barner | TE | ✅ Data complete |
| 9 | Kenneth Walker III | RB | ✅ Data complete |

---

## Next Steps

### Phase 1: Design System Polish
- Extract reusable HUD components
- Verify 8px spacing grid
- Ensure 44px touch targets
- Safe area handling

### Phase 2: Asset Generation
- Generate Dark Side uniforms using Leonardo
- Background removal workflow
- Asset picker integration

### Phase 3: Field Background
- Generate 9:16 field image
- Ensure sprite contrast

### Phase 4: Offense MVP
- Implement QB Legend mechanics in Phaser
- Throw, catch, YAC, downs, clock

### Phase 5: Defense MVP
- Control DeMarcus Lawrence
- Pursuit, tackle, sack mechanics

### Phase 6-8: Integration & Polish
- Full game flow
- Endless modes
- Performance optimization

---

## Design Decisions

| Decision | Choice |
|----------|--------|
| Player Identity | Real names (Sam Darnold, JSN, DeMarcus Lawrence) |
| Uniforms | Dark Side brand (stealth black/grey, neon green accent) |
| DeMarcus Role | Default defender in Defense mode |
| Game Length | 4 x 1 minute quarters |
| Mode Balance | Offense and Defense equally important |
| V1 Impact | None - completely separate routes and store |
