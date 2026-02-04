# Dark Side Football - Architecture

## Overview

Dark Side Football is a sweepstakes gaming platform by DrinkSip, Inc. combining mobile football games with consumer engagement features.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| UI | React 18 + Tailwind CSS |
| Animation | Framer Motion |
| State | Zustand |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Hosting | Vercel |
| Video | Remotion |
| Icons | Lucide React |

## Directory Structure

```
seattle-game/
├── app/
│   ├── v5/                    # V5 Consumer App
│   │   ├── (app)/             # Main app routes (with BottomNav)
│   │   │   ├── game/          # Game hub + defense/QB games
│   │   │   ├── picks/         # Prop betting
│   │   │   ├── live/          # Live questions
│   │   │   ├── leaderboard/   # Rankings
│   │   │   └── profile/       # User profile + scan/shop
│   │   ├── (onboarding)/      # Onboarding routes (no nav)
│   │   │   ├── splash/        # Entry video
│   │   │   ├── register/      # 4-step wizard
│   │   │   ├── terms/         # Legal
│   │   │   └── privacy/       # Legal
│   │   └── admin/             # Admin dashboard
│   ├── api/                   # API routes
│   └── play/                  # Legacy game routes
├── components/
│   ├── ui/                    # Shared UI components
│   ├── game/                  # Game-specific components
│   ├── platform/              # Platform features
│   ├── claim/                 # Prize claiming
│   ├── live/                  # Live questions
│   ├── picks/                 # Picks components
│   ├── scan/                  # Product scanning
│   ├── sharing/               # Social sharing
│   └── sponsors/              # Sponsor tracking
├── src/
│   ├── v5/
│   │   ├── store/             # Zustand stores
│   │   ├── data/              # Static data
│   │   └── lib/               # Utilities
│   ├── game/                  # Phaser game engine
│   └── lib/
│       └── supabase/          # Supabase client + types
├── commercial/                # Remotion video project
├── public/
│   ├── sprites/               # Player images
│   ├── video/                 # Trailer video
│   └── sw.js                  # Service worker
└── .cursor/
    ├── rules/                 # AI agent context
    └── skills/                # Design system docs
```

## Route Groups

### (app) - Main Application
Protected routes with BottomNav. User must be registered.

| Route | Purpose |
|-------|---------|
| `/v5/game` | Game hub - campaign progress |
| `/v5/picks` | Prop picks categories |
| `/v5/live` | Live quarter questions |
| `/v5/leaderboard` | Rankings + entries |
| `/v5/profile` | User profile + settings |

### (onboarding) - Entry Flow
Public routes without BottomNav.

| Route | Purpose |
|-------|---------|
| `/v5/splash` | Video trailer + entry |
| `/v5/register` | 4-step registration |
| `/v5/register/success` | Confirmation |

### admin - Dashboard
Password-protected admin area.

| Route | Purpose |
|-------|---------|
| `/v5/admin` | Dashboard metrics |
| `/v5/admin/users` | User management |
| `/v5/admin/winners` | Prize selection |
| `/v5/admin/campaigns` | Contest management |

## State Management

### Zustand Stores (`src/v5/store/`)

| Store | Purpose |
|-------|---------|
| `v5GameStore` | Campaign progress, entries |
| `picksStore` | User picks state |
| `liveStore` | Live questions state |
| `scanStore` | Product scan state |
| `claimStore` | Prize claims |
| `prizeStore` | Prize pool |
| `referralStore` | Referral tracking |

## Database Schema

### Core Tables (Supabase)

```
users           - Extended profiles
campaigns       - Contest definitions
picks           - User predictions
live_questions  - Quarter questions
prizes          - Prize pool
claims          - Winner claims
sponsors        - Sponsor config
game_entries    - Entry tracking
product_scans   - Retail execution
```

## Key Patterns

### 1. Video Background
```tsx
<VideoBackground 
  src={VIDEO_URL}
  poster={POSTER_URL}
  overlay={true}
  overlayOpacity={0.75}
/>
```

### 2. GlassCard
```tsx
<GlassCard variant="default" padding="md">
  {children}
</GlassCard>
```

### 3. Typography Tokens
```tsx
style={{ fontSize: 'var(--text-title)' }}
style={{ fontSize: 'var(--text-body)' }}
style={{ fontSize: 'var(--text-caption)' }}
```

### 4. Spring Animation
```tsx
const spring = { type: 'spring', stiffness: 300, damping: 28 }
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_ADMIN_PASSWORD=
LEONARDO_API_KEY=
```

## Deployment

- **Production**: Vercel (auto-deploy from master)
- **Preview**: Vercel (auto-deploy from PRs)
- **Database**: Supabase (managed PostgreSQL)
