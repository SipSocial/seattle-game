# Agent Charlie - Project Coordinator

## My Role

I'm **Agent Charlie**, the starter and coordinator agent for the Seattle Seahawks Defense game. I maintain project documentation, track state, and ensure context is shared between agents.

---

## Quick Start

### First Time Setup
```bash
# Clone repository
git clone https://github.com/SipSocial/seattle-game.git
cd seattle-game

# Install dependencies
npm install

# Create environment file
echo "LEONARDO_API_KEY=your_key_here" > .env.local

# Start development server
npm run dev
# → Opens on localhost:3004
```

### Returning to Project
```bash
# Pull latest changes
git pull origin master

# Start dev server
npm run dev
```

---

## Project Overview

| Item | Value |
|------|-------|
| **Name** | Seattle Seahawks Defense |
| **Type** | Mobile-first browser football game |
| **Engine** | Phaser 3 + Next.js 14 |
| **Port** | **3004** (CRITICAL) |
| **Live URL** | https://seattle-game.vercel.app |

### Game Modes
1. **Campaign Mode**: 20-stage journey through 2025 Seahawks schedule to Super Bowl
2. **Endless Mode**: Infinite waves, high score chase

### Key Features
- Photorealistic 3D player renders (Leonardo AI)
- 3D touch rotation on player selection
- Interactive US campaign map
- Dark Side plane animation
- DrinksIP power-up branding

---

## Documentation Index

All documentation lives in `.cursor/rules/`:

| File | Purpose | Read When |
|------|---------|-----------|
| `project-context.md` | Current state, quick reference | Every session |
| `ARCHITECTURE.md` | Technical design, file structure | Building features |
| `DESIGN_PLAN.md` | Visual design, UI patterns | UI work |
| `RULES.md` | Coding standards, pitfalls | Writing code |
| `AGENT_WORKFLOW.md` | Multi-agent collaboration | Handoffs |

---

## Critical Rules Summary

1. **Port 3004 only** - Never change
2. **React for UI, Phaser for gameplay** - No UI in Phaser
3. **Mobile-first** - Touch targets 44px, test on mobile
4. **TypeScript strict** - No build errors allowed
5. **Document changes** - Update project-context.md

---

## Common Tasks

### Start Dev Server
```bash
npm run dev
# → localhost:3004
```

### Deploy to Production
```bash
npm run build    # Check for errors
vercel --prod    # Deploy
```

### Generate Player Images
1. Go to `http://localhost:3004/admin/players`
2. Select player and style
3. Click Generate
4. Wait for Leonardo to complete
5. Select preferred variant
6. URLs stored in `playerImages.ts`

### Update Campaign Data
Edit `src/game/data/campaign.ts` for:
- Stage order
- Opponents
- Difficulty settings
- City locations

### Update Roster
Edit `src/game/data/roster.ts` for:
- Player names
- Jersey numbers
- Positions
- Stats

---

## Architecture Summary

```
┌─────────────────────────────────────────────┐
│              REACT LAYER                     │
│  Pages, Components, Animations, UI           │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│            ZUSTAND STORE                     │
│  Game state, campaign progress, settings     │
└─────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌─────────────────┐   ┌─────────────────────┐
│  PHASER GAME    │   │    API ROUTES       │
│  Gameplay only  │   │  Leonardo AI, etc   │
└─────────────────┘   └─────────────────────┘
```

---

## Handoff Protocol

### When Starting Work
1. Read `project-context.md`
2. Check git status
3. Verify dev server runs
4. Note any pending work

### When Finishing Work
1. Commit with descriptive message
2. Update docs if needed
3. Note any unfinished items
4. Deploy if requested

---

## Contact Points (Code)

| Need To... | Look At |
|------------|---------|
| Change player data | `src/game/data/roster.ts` |
| Update campaign | `src/game/data/campaign.ts` |
| Modify game state | `src/store/gameStore.ts` |
| Fix touch interaction | Component with `onTouchMove` |
| Update Leonardo assets | `src/game/data/campaignAssets.ts` |
| Add API endpoint | `app/api/[route]/route.ts` |

---

## Current Status (2026-01-30)

### Recently Completed
- ✅ React UI architecture migration
- ✅ 3D touch rotation for players
- ✅ Campaign map with location grouping
- ✅ Dark Side plane with video animation
- ✅ Stage transition screens
- ✅ Full documentation suite

### In Progress
- None (awaiting next task)

### Upcoming
- Generate accurate player images with reference photos
- DrinkSip jersey variants
- E-commerce end screen
- Leaderboard integration
- Offensive mode (QB gameplay)

---

*This file is for agent reference. For detailed info, see `.cursor/rules/` docs.*
