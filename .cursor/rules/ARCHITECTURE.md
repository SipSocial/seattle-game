# Seattle Seahawks Defense - Architecture Documentation

## Overview

Seattle Seahawks Defense is a mobile-first, browser-based football game featuring the Seattle Seahawks' "Dark Side" defense on their journey to the Super Bowl. The game combines React/Next.js for UI with Phaser 3 for core gameplay.

---

## Tech Stack

### Core Technologies
| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend Framework** | Next.js 14+ (App Router) | React SSR, routing, API routes |
| **Game Engine** | Phaser 3 | Core gameplay, physics, rendering |
| **State Management** | Zustand | Global game state, persistence |
| **Styling** | Tailwind CSS | Utility-first responsive styling |
| **Animation** | Framer Motion | UI animations, transitions |
| **AI Assets** | Leonardo AI API | Dynamic image/video generation |
| **Deployment** | Vercel | Continuous deployment, edge functions |

### Key Dependencies
```json
{
  "next": "14.x",
  "react": "18.x",
  "phaser": "3.x",
  "zustand": "4.x",
  "framer-motion": "10.x",
  "tailwindcss": "4.x"
}
```

---

## Project Structure

```
seattle-game/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout with metadata
│   ├── page.tsx                  # Marketing landing page
│   ├── globals.css               # Global styles + Tailwind
│   ├── play/                     # Game route
│   │   ├── page.tsx              # Game loader (client-only)
│   │   └── components/
│   │       ├── GameCanvas.tsx    # Phaser container
│   │       └── RotateOverlay.tsx # Portrait orientation warning
│   ├── campaign/                 # Campaign map page
│   │   └── page.tsx
│   ├── mockup/                   # Player selection mockup
│   │   └── page.tsx
│   ├── admin/                    # Admin tools
│   │   ├── players/page.tsx      # Player sprite generator
│   │   └── sprites/page.tsx      # General sprite tools
│   ├── jerseys/                  # Jersey design page
│   │   └── page.tsx
│   └── api/                      # API routes
│       ├── leonardo/             # Leonardo AI integration
│       │   ├── generate/route.ts
│       │   ├── status/[generationId]/route.ts
│       │   ├── test/route.ts
│       │   └── variation-status/[jobId]/route.ts
│       ├── players/              # Player generation
│       │   ├── generate/route.ts
│       │   ├── generate-all/route.ts
│       │   ├── generate-transparent/route.ts
│       │   ├── generate-with-reference/route.ts
│       │   ├── remove-background/route.ts
│       │   └── remove-background-batch/route.ts
│       ├── sprites/              # Sprite generation
│       │   ├── generate/route.ts
│       │   └── opponents/route.ts
│       └── backgrounds/          # Background generation
│           └── generate/route.ts
│
├── components/                   # Shared React components
│   └── game/                     # Game-specific components
│       ├── CampaignMapV2.tsx     # Interactive US map
│       ├── CityMarker.tsx        # Map city markers
│       ├── CityPreview.tsx       # City preview modal
│       ├── FlightPath.tsx        # Airplane animation
│       ├── StageTransition.tsx   # Stage transition screens
│       ├── PlayerSelect.tsx      # Player selection UI
│       ├── GlassCard.tsx         # UI component
│       ├── GradientButton.tsx    # UI component
│       └── PositionChip.tsx      # Position badge
│
├── src/
│   ├── game/                     # Phaser game code
│   │   ├── config/
│   │   │   └── phaserConfig.ts   # Phaser configuration, colors, fonts
│   │   ├── main.ts               # Game initialization
│   │   ├── scenes/               # Phaser scenes
│   │   │   ├── BootScene.ts      # Initial loading
│   │   │   ├── MenuScene.ts      # Main menu
│   │   │   ├── RosterScene.ts    # Defender selection
│   │   │   ├── MapScene.ts       # Campaign map
│   │   │   ├── StageTransitionScene.ts  # Stage intro
│   │   │   ├── GameScene.ts      # Core gameplay
│   │   │   ├── GameOverScene.ts  # Loss screen
│   │   │   ├── EngageScene.ts    # Social engagement
│   │   │   ├── LeaderboardScene.ts # Scores
│   │   │   └── SuperBowlScene.ts # Victory celebration
│   │   ├── data/                 # Game data
│   │   │   ├── roster.ts         # Defensive roster
│   │   │   ├── offenseRoster.ts  # Offensive roster
│   │   │   ├── teams.ts          # Team definitions
│   │   │   ├── campaign.ts       # Campaign stages
│   │   │   ├── campaignAssets.ts # Leonardo-generated assets
│   │   │   ├── powerups.ts       # Power-up definitions
│   │   │   ├── playerImages.ts   # Player image URLs
│   │   │   ├── playerPhysicals.ts # Player physical stats
│   │   │   └── playerReferences.ts # Reference photo URLs
│   │   └── systems/              # Game systems
│   │       ├── AudioManager.ts   # Sound management
│   │       ├── ParticleEffects.ts # Visual effects
│   │       └── input.ts          # Input handling
│   │
│   ├── store/                    # State management
│   │   └── gameStore.ts          # Zustand store
│   │
│   └── lib/                      # Utilities
│       ├── leonardo.ts           # Leonardo AI client
│       ├── assetGenerator.ts     # Asset generation helpers
│       ├── backgroundCache.ts    # Background caching
│       ├── spritePrompts.ts      # AI prompts for sprites
│       └── stagePrompts.ts       # AI prompts for stages
│
├── scripts/                      # Build/generation scripts
│   ├── generate-all-players.ts
│   ├── generate-campaign-assets.ts
│   ├── generate-team-plane.ts
│   └── generate-darkside-plane.ts
│
├── .cursor/                      # Cursor IDE config
│   └── rules/                    # AI agent rules
│       ├── project-context.md
│       ├── ARCHITECTURE.md
│       ├── DESIGN_PLAN.md
│       ├── RULES.md
│       └── AGENT_WORKFLOW.md
│
├── .env.local                    # Environment variables
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
└── vercel.json                   # Vercel deployment config
```

---

## Architecture Layers

### 1. Presentation Layer (React)

**Purpose**: All UI, menus, overlays, and non-gameplay screens

```
React Components
├── Pages (Next.js App Router)
├── Game Components (Framer Motion animated)
├── UI Components (Tailwind styled)
└── Admin Tools
```

**Key Principle**: React handles EVERYTHING except core gameplay:
- Player selection screen
- Campaign map
- Stage transitions
- Settings/menus
- Game over screens
- Leaderboards

### 2. Game Engine Layer (Phaser)

**Purpose**: Core gameplay logic ONLY

```
Phaser Scenes
├── BootScene (initialization)
├── GameScene (actual gameplay)
└── [minimal others for legacy]
```

**Key Principle**: Phaser is strictly for:
- Player/runner collision detection
- Movement physics
- Score calculation
- Wave management
- Power-up logic

### 3. State Layer (Zustand)

**Purpose**: Single source of truth for all game state

```typescript
interface GameState {
  // Core game state
  score: number
  lives: number
  wave: number
  gameMode: 'campaign' | 'endless'
  
  // Campaign progress
  campaign: {
    currentGame: number
    currentStageId: number
    gamesWon: number
    stagesUnlocked: number[]
    stageHighScores: Record<number, number>
    superBowlWon: boolean
  }
  
  // Selected defender
  selectedDefender: Defender | null
  
  // Power-ups
  activePowerups: PowerUp[]
}
```

### 4. API Layer (Next.js API Routes)

**Purpose**: Server-side operations, AI integration

```
API Routes
├── /api/leonardo/*     # Leonardo AI generation
├── /api/players/*      # Player asset management
├── /api/sprites/*      # Sprite generation
└── /api/backgrounds/*  # Background generation
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERACTION                          │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      REACT UI LAYER                              │
│  ┌─────────┐  ┌──────────────┐  ┌────────────┐  ┌─────────────┐ │
│  │ Pages   │  │ Components   │  │ Animations │  │ Touch/Input │ │
│  └────┬────┘  └──────┬───────┘  └─────┬──────┘  └──────┬──────┘ │
└───────┼──────────────┼────────────────┼────────────────┼────────┘
        │              │                │                │
        └──────────────┴────────────────┴────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     ZUSTAND STATE STORE                          │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────────┐ │
│  │ Game    │  │ Campaign │  │ Settings │  │ Persist to        │ │
│  │ State   │  │ Progress │  │ & Prefs  │  │ localStorage      │ │
│  └─────────┘  └──────────┘  └──────────┘  └───────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
┌────────────────────────────┐  ┌────────────────────────────────┐
│       PHASER GAME          │  │        API ROUTES              │
│  ┌──────────────────────┐  │  │  ┌────────────────────────┐   │
│  │ GameScene            │  │  │  │ Leonardo AI            │   │
│  │ - Player physics     │  │  │  │ - Image generation     │   │
│  │ - Collision detect   │  │  │  │ - Video generation     │   │
│  │ - Wave spawning      │  │  │  │ - Background removal   │   │
│  │ - Score tracking     │  │  │  └────────────────────────┘   │
│  └──────────────────────┘  │  └────────────────────────────────┘
└────────────────────────────┘
```

---

## Communication Between Layers

### React ↔ Phaser Communication

**React → Phaser**: Event-based
```typescript
// React emits events that Phaser listens to
window.dispatchEvent(new CustomEvent('game:start', { detail: { defender } }))

// Phaser scene
this.game.events.on('game:start', (data) => { ... })
```

**Phaser → React**: Store updates + events
```typescript
// Phaser updates Zustand store
useGameStore.getState().updateScore(100)

// Phaser emits events for UI updates
window.dispatchEvent(new CustomEvent('game:over', { detail: { score } }))
```

### State Persistence

```typescript
// Zustand with localStorage persistence
export const useGameStore = create(
  persist(
    (set, get) => ({
      // state and actions
    }),
    {
      name: 'seattle-game-storage',
      partialize: (state) => ({
        campaign: state.campaign,
        selectedDefender: state.selectedDefender,
        settings: state.settings,
      }),
    }
  )
)
```

---

## Design Tokens

### Colors
```typescript
export const COLORS = {
  // Seahawks primary
  navy: 0x002244,
  green: 0x69BE28,
  white: 0xffffff,
  
  // UI
  navyLight: 0x1a3a5c,
  grey: 0x8b98a5,
  gold: 0xFFD700,
  
  // Semantic
  success: 0x69BE28,
  danger: 0xff4444,
  warning: 0xFFD700,
}
```

### Typography
```typescript
export const FONTS = {
  display: '"Bebas Neue", "Impact", sans-serif',
  body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
}
```

### Spacing (Tailwind scale)
- `4px` increments: `1`, `2`, `3`, `4`, `5`, `6`, `8`, `10`, `12`, `16`, `20`, `24`

---

## Performance Considerations

### Mobile Optimization
1. **Touch handling**: Use `requestAnimationFrame` + `lerp` for smooth 60fps touch
2. **Image loading**: Preload player images before showing selection
3. **Animation**: Use `framer-motion` with hardware-accelerated transforms
4. **No heavy effects**: Limit particle systems, avoid blur on mobile

### React Optimization
1. **Client-only Phaser**: Use `dynamic import` with `ssr: false`
2. **Memoization**: `useMemo`/`useCallback` for expensive calculations
3. **State updates**: Batch Zustand updates to minimize re-renders

### Asset Loading
1. **Lazy load Leonardo assets**: Load on-demand, cache aggressively
2. **Image preloading**: Use Next.js `Image` component with priority
3. **Video backgrounds**: Use `preload="auto"` with poster fallback

---

## Deployment

### Vercel Configuration
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

### Environment Variables
```
LEONARDO_API_KEY=xxx
NEXT_PUBLIC_APP_URL=https://seattle-game.vercel.app
```

### Deploy Commands
```bash
# Preview deployment
vercel

# Production deployment
vercel --prod

# Force rebuild
vercel --prod --force
```

---

## Testing Checklist

### Before Deployment
- [ ] Game starts and reaches gameplay
- [ ] Touch/swipe controls work on mobile
- [ ] Player selection rotates smoothly
- [ ] Campaign map navigation works
- [ ] Stage transitions play video
- [ ] No console errors
- [ ] Build completes without TypeScript errors
- [ ] Mobile responsiveness verified

### Critical Paths
1. Home → Play → Select Defender → Start Game → Gameplay
2. Campaign Map → Select Stage → Stage Transition → Gameplay
3. Endless Mode → Gameplay → Game Over → Leaderboard
