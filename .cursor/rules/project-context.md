# Seattle Game - Project Context

## Quick Reference

| Item | Value |
|------|-------|
| **Project** | Seattle Seahawks Defense - Road to Super Bowl |
| **Status** | Active Development |
| **Port** | `localhost:3004` (CRITICAL) |
| **Live URL** | https://seattle-game.vercel.app |
| **Repo** | https://github.com/SipSocial/seattle-game |

---

## Agent Information

| Agent | Role | Primary Tasks |
|-------|------|---------------|
| **Agent Charlie** | Starter/Coordinator | Setup, docs, handoffs |
| **Explore Agents** | Code investigation | Finding patterns, understanding flow |
| **Shell Agents** | Commands | Git, npm, deployments |
| **General Agents** | Implementation | Feature development |

---

## Tech Stack

```
Framework:    Next.js 14 (App Router)
Game Engine:  Phaser 3
Language:     TypeScript
Styling:      Tailwind CSS v4
Animation:    Framer Motion
State:        Zustand
AI Assets:    Leonardo AI
Deployment:   Vercel
```

---

## Project Structure (Key Paths)

```
seattle-game/
├── app/                          # Next.js pages & API
│   ├── page.tsx                  # Home/landing
│   ├── play/page.tsx             # Game entry
│   ├── campaign/page.tsx         # Campaign map
│   ├── mockup/page.tsx           # Player selection
│   └── api/                      # API routes
│       └── leonardo/             # AI generation
│
├── components/game/              # React game components
│   ├── CampaignMapV2.tsx         # US map with cities
│   ├── FlightPath.tsx            # Dark Side plane
│   ├── StageTransition.tsx       # Stage entry animation
│   └── PlayerSelect.tsx          # Defender selection
│
├── src/game/                     # Phaser game code
│   ├── scenes/                   # Game scenes
│   │   ├── GameScene.ts          # Core gameplay
│   │   └── ...
│   └── data/                     # Game data
│       ├── roster.ts             # Player roster
│       ├── campaign.ts           # Campaign stages
│       └── campaignAssets.ts     # Leonardo assets
│
├── src/store/gameStore.ts        # Zustand global state
│
└── .cursor/rules/                # Documentation
    ├── ARCHITECTURE.md           # System design
    ├── DESIGN_PLAN.md            # Visual guidelines
    ├── RULES.md                  # Coding standards
    ├── AGENT_WORKFLOW.md         # Multi-agent process
    └── project-context.md        # This file
```

---

## Current Campaign (2025 Seahawks Schedule)

20 stages following the actual 2025 season:

| # | Week | Opponent | Location | Home/Away |
|---|------|----------|----------|-----------|
| 1 | Week 1 | 49ers | Seattle | Home |
| 2 | Week 2 | Steelers | Pittsburgh | Away |
| 3 | Week 3 | Saints | Seattle | Home |
| 4 | Week 4 | Cardinals | Arizona | Away |
| 5 | Week 5 | Buccaneers | Seattle | Home |
| 6 | Week 6 | Jaguars | Jacksonville | Away |
| 7 | Week 7 | Texans | Seattle | Home |
| 8 | Week 8 | Commanders | Washington | Away |
| 9 | Week 9 | Cardinals | Seattle | Home |
| 10 | Week 10 | Rams | Los Angeles | Away |
| 11 | Week 11 | Titans | Nashville | Away |
| 12 | Week 12 | Vikings | Seattle | Home |
| 13 | Week 13 | Falcons | Atlanta | Away |
| 14 | Week 14 | Colts | Seattle | Home |
| 15 | Week 15 | Rams | Seattle | Home |
| 16 | Week 16 | Panthers | Carolina | Away |
| 17 | Week 17 | 49ers | San Francisco | Away |
| 18 | Divisional | 49ers | Seattle | Home |
| 19 | NFC Championship | Rams | Seattle | Home |
| 20 | **Super Bowl LX** | Patriots | San Francisco | Neutral |

---

## Defensive Roster (11 Starters)

| # | Name | Position |
|---|------|----------|
| 0 | DeMarcus Lawrence | DE |
| 99 | Leonard Williams | DT |
| 91 | Byron Murphy II | NT |
| 58 | Derick Hall | RUSH |
| 7 | Uchenna Nwosu | SLB |
| 13 | Ernest Jones IV | MLB |
| 42 | Drake Thomas | WLB |
| 21 | Devon Witherspoon | CB |
| 29 | Josh Jobe | CB |
| 20 | Julian Love | S |
| 8 | Coby Bryant | S |

---

## Leonardo AI Assets

### Generated Assets (in `campaignAssets.ts`)
- US Map background (video)
- Dark Side Boeing 737 plane (transparent PNG)
- Dark Side plane animation (MP4 video)
- 12 city background images

### Player Images (in `playerImages.ts`)
- 11 defender portraits (4 variants each)
- Photorealistic 3D Madden-style renders

---

## Gameplay Mechanics

### Core Loop
```
Home → Campaign/Endless → Select Defender → Stage Transition → 
Gameplay (waves) → Game Over/Victory → Repeat
```

### Defense Mode (Current)
- Control defender (drag to move)
- Runners come from top
- Collision = tackle
- Survive waves, score points
- Megaphone power-up clears field

### Power-ups (DrinksIP branded)
| Power-up | Effect |
|----------|--------|
| Hazy IPA | Slows runners |
| Watermelon | Shield (1 hit protection) |
| Lemon Lime | Speed boost |
| Blood Orange | Freeze all runners |

---

## Key Features

### Player Selection
- 3D touch rotation (lerp + RAF for 60fps)
- Animated video background
- Swipe/arrow to change players
- Stats display

### Campaign Map
- Interactive US map (Leonardo-generated)
- City markers grouped by location
- Dark Side plane (3D draggable)
- Location picker modal for multi-game cities
- Stage preview with city background

### Stage Transitions
- Dark Side plane video animation
- Team matchup display
- Loading animation

---

## Recent Changes (Latest First)

### 2026-01-30
- ✅ Deploy with 3D airplane interaction
- ✅ Campaign map location grouping
- ✅ Dark Side plane video generation
- ✅ City preview modal for locked/unlocked stages
- ✅ 3D touch/drag for airplane

### 2026-01-30 (Earlier)
- ✅ Player chip redesign
- ✅ Smooth touch interaction (lerp + RAF)
- ✅ UI/React architecture migration
- ✅ Framer Motion animations

### 2026-01-29
- ✅ Campaign map overhaul with Leonardo assets
- ✅ Player reference photo system
- ✅ Background removal for player images

---

## Known Issues

1. **iOS Video Autoplay**: Requires user interaction to start
   - Workaround: Touch-to-play fallback implemented

2. **Player Likenesses**: AI can't generate exact player faces without reference photos
   - Solution: Use Character Reference with uploaded photos

3. **DrinkSip Logo**: AI hallucinates when logo used as init_image
   - Solution: Describe logo in prompt text only

---

## Environment Variables

Required in `.env.local`:
```
LEONARDO_API_KEY=xxx
```

---

## Commands

```bash
# Development
npm run dev          # localhost:3004

# Build & Deploy
npm run build        # Production build
vercel --prod        # Deploy to Vercel

# Troubleshooting
rm -rf .next         # Clear cache
npx lsof -i :3004    # Find port usage
```

---

## Documentation Index

| Doc | Purpose |
|-----|---------|
| `ARCHITECTURE.md` | Technical architecture, data flow |
| `DESIGN_PLAN.md` | Visual design, UI patterns |
| `RULES.md` | Coding standards, do's/don'ts |
| `AGENT_WORKFLOW.md` | Multi-agent collaboration |
| `AGENT_CHARLIE.md` | Starter agent reference |

---

## Next Steps (Priority Order)

1. [ ] Generate accurate player images with reference photos
2. [ ] Implement DrinkSip jersey variants
3. [ ] Add e-commerce end screen
4. [ ] Leaderboard integration
5. [ ] Social sharing features
6. [ ] Offensive mode (Retro Bowl style QB mode)

---

*Last Updated: 2026-01-30*

---

## Current State (Feb 2026)

### Dark Side Sprite Generator
- Working at `/admin/players`
- 16 players wired up (11 defense, 5 offense)
- Dark Side superhero prompt template finalized:
  - Navy blue tactical armor uniform
  - Neon green #69BE28 accents
  - Cape, helmet with dark visor
  - Full body from helmet to cleats
  - Stadium background with volumetric lighting
  - NO LOGOS (described positively to avoid AI inserting brands)

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/darkSidePrompts.ts` | Dark Side prompt generator |
| `app/admin/players/page.tsx` | Sprite generation UI |
| `src/game/data/playerReferences.ts` | Defense player data (11 players) |
| `src/v3/lib/offensePlayerData.ts` | Offense player data (5 players) |

### Design Decisions
- **Phoenix model** for photorealistic generation
- Prompts kept **under 1500 chars** for Leonardo API
- Reference photos optional (detailed prompts work without them)
- Superhero aesthetic: tactical armor, cape, visor helmet
- Described as "no visible text or branding" rather than "no logos" (positive framing avoids AI hallucinating logos)

---

## V3 Game Architecture

The V3 version introduces a new game flow with offense/defense modes:

```
/v3                 -> Main entry point
/v3/game            -> Game UI wrapper
/v3/roster          -> Player selection
/v3/map             -> Campaign map
/v3/match           -> Match screen
/v3/results         -> Post-game results
/v3/admin           -> Asset generation
```

### V3 Key Files

```
src/v3/
+-- game/
|   +-- data/v3Config.ts      # Game configuration
|   +-- scenes/
|   |   +-- DefenseScene.ts   # Defense gameplay
|   |   +-- OffenseScene.ts   # Offense gameplay
|   +-- systems/
|       +-- GameManager.ts    # Game state management
+-- lib/
|   +-- offensePlayerData.ts  # Offense roster
|   +-- v3Assets.ts           # Asset management
+-- store/
    +-- v3GameStore.ts        # Zustand store for V3
```

---

## Pending Work

### Immediate
- [ ] Generate all 16 player sprites with Dark Side template
- [ ] Build play selection UI
- [ ] Implement game flow (menu -> roster -> match -> results)

### Short Term
- [ ] Generate opponent helmets (20 teams)
- [ ] Field backgrounds for home/away games
- [ ] Stage transition animations

### Future
- [ ] Offensive mode gameplay (QB mechanics)
- [ ] Leaderboard integration
- [ ] DrinkSip e-commerce end screen
- [ ] Social sharing features

---

*Last Updated: 2026-02-01*
