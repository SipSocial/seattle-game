# Seattle Game - Project Context

## Agent Information
- **Primary Agent**: Agent Charlie (starter agent)
- **Role**: Initial project setup, scaffolding, and project tracking
- **Purpose**: Maintain project state and share context with other agents

## Project Overview
- **Name**: seattle-game (Road to the Super Bowl)
- **Framework**: Next.js 14 with App Router
- **Game Engine**: Phaser 3
- **Language**: TypeScript
- **Deployment**: Vercel
- **Port**: **MUST RUN ON localhost:30094** (CRITICAL - not 3000)

## Project Structure
```
seattle-game/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx             # Marketing landing page
│   ├── globals.css          # Global styles (Tailwind v4)
│   ├── play/
│   │   ├── page.tsx         # Game route (client-only Phaser)
│   │   └── components/
│   │       ├── GameCanvas.tsx    # Phaser container
│   │       └── RotateOverlay.tsx # Portrait warning
│   ├── admin/sprites/page.tsx    # Asset generation UI
│   └── api/
│       ├── leonardo/        # Leonardo.ai integration
│       └── sprites/         # Sprite generation endpoints
├── src/
│   ├── game/
│   │   ├── config/phaserConfig.ts
│   │   ├── main.ts
│   │   ├── scenes/
│   │   │   ├── BootScene.ts
│   │   │   ├── MenuScene.ts
│   │   │   ├── RoadScene.ts       # Approach + encounter trigger
│   │   │   ├── ClashScene.ts      # Button-mash gameplay
│   │   │   ├── PowerUpScene.ts    # Power-up selection
│   │   │   └── VictoryScene.ts    # Super Bowl celebration
│   │   ├── data/
│   │   │   ├── levels.ts          # 9 level configs
│   │   │   └── teams.ts           # Team definitions + colors
│   │   └── systems/
│   │       ├── balance.ts         # Re-exports from store
│   │       └── input.ts           # Input utilities
│   ├── store/
│   │   └── gameStore.ts           # Zustand state (level, powerups, stats)
│   └── lib/
│       ├── leonardo.ts            # Leonardo.ai API client
│       ├── assetGenerator.ts      # Asset generation helpers
│       └── spritePrompts.ts       # Sprite prompt definitions
├── .env.local               # Leonardo API key
├── next.config.js
├── package.json
├── postcss.config.js
├── tsconfig.json
└── vercel.json
```

## Game Flow
```
Boot → Menu → Road → Clash → (Win) → PowerUp → Road → ... → Victory
                      ↓
                   (Lose) → Retry same level with assist
```

## Level Configuration
Located in `src/game/data/levels.ts`:

| Level | Opponent          | Target | Time  | Resistance | Speed |
|-------|-------------------|--------|-------|------------|-------|
| 1     | Crimson Forge     | 120    | 8.0s  | 4.0        | 140   |
| 2     | Iron Gold         | 150    | 7.5s  | 4.8        | 150   |
| 3     | Slate Storm       | 180    | 7.2s  | 5.6        | 155   |
| 4     | Midnight Violet   | 215    | 7.0s  | 6.4        | 160   |
| 5     | Burnt Orange      | 255    | 6.8s  | 7.4        | 165   |
| 6     | Arctic Surge      | 300    | 6.6s  | 8.6        | 170   |
| 7     | Forest Black      | 350    | 6.4s  | 10.0       | 175   |
| 8     | Solar Red         | 410    | 6.2s  | 11.6       | 180   |
| 9     | Black Gold Legion | 480    | 6.0s  | 13.5       | 190   |

## Power-Ups
Located in `src/store/gameStore.ts`:

- **DOUBLE_TAP_POWER**: +100% tap power
- **EXTEND_TIME**: +2 seconds
- **HEAD_START**: Start at 20% meter
- **MOMENTUM_BOOST**: -20% resistance
- **EXTRA_LINEMAN**: 6th defender + 10% power

## Key Mechanics

### Encounter Trigger (RoadScene)
- encounterX = GAME_WIDTH / 2 (400)
- Trigger when: leadDefenderX >= 360 AND leadOpponentX <= 440
- Both teams physically move toward center

### Retry Assist
- Each retry reduces targetForce by 5%
- Maximum reduction: 20% (after 4 retries)

### Debug Mode
- Press **D** key to toggle debug overlay
- Shows: phase, positions, encounter thresholds

## Brand Colors (Seattle Darkside)
- Primary: `#0F6E6A` (teal)
- Accent: `#7ED957` (green)
- Trim: `#0B1F24` (navy-charcoal)

## Critical Rules
- **Port 30094 is mandatory**
- **No NFL team names/logos**
- **Mobile-first design**
- **Client-only Phaser** (no SSR)

## Leonardo.ai Integration
- API key in `.env.local`
- Admin UI: `/admin/sprites`
- Endpoints: `/api/leonardo/*`, `/api/sprites/*`

## Last Updated
- 2026-01-23: Complete game implementation with fixed enemy approach
