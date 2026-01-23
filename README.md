# Road to the Super Bowl - Seattle Darkside

A fast, arcade-style, mobile-first 2D side-scrolling football fantasy game built with Next.js and Phaser 3.

## Game Overview

Control the **Seattle Darkside** defensive unit as you march down the field toward the Super Bowl! Face 9 challenging opponents in rapid button-mashing clashes. Win each battle to earn power-ups and continue your journey to victory.

### Gameplay

- **Road Scene**: Watch your team march forward toward each opponent
- **Clash Scene**: Tap rapidly to fill your Force meter before time runs out
- **Power-Up Selection**: Choose from 3 random power-ups after each victory
- **9 Levels**: Progress through 8 opponents + the Super Bowl finale

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:30094](http://localhost:30094) with your browser.

**Important**: The app runs on port **30094** (not the default 3000).

### Build for Production

```bash
npm run build
npm run start
```

## Deployment

This project is configured for Vercel deployment:

1. Push your code to a Git repository
2. Import your repository in [Vercel](https://vercel.com)
3. Vercel will automatically detect Next.js and deploy your app

## Project Structure

```
seattle-game/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Marketing landing page
│   ├── play/
│   │   ├── page.tsx        # Game route (client-only Phaser)
│   │   └── components/
│   │       └── RotateOverlay.tsx  # Portrait mode warning
│   └── globals.css         # Global styles
├── src/
│   ├── game/
│   │   ├── config/
│   │   │   └── phaserConfig.ts    # Phaser configuration
│   │   ├── scenes/
│   │   │   ├── BootScene.ts       # Initial scene
│   │   │   ├── MenuScene.ts        # Main menu
│   │   │   ├── RoadScene.ts        # Marching to opponent
│   │   │   ├── ClashScene.ts       # Button-mash gameplay
│   │   │   ├── PowerUpScene.ts     # Power-up selection
│   │   │   └── VictoryScene.ts     # Super Bowl victory
│   │   ├── data/
│   │   │   ├── levels.ts           # 9 level configurations
│   │   │   └── teams.ts            # Team data & colors
│   │   ├── systems/
│   │   │   ├── input.ts            # Input handling (touch/mouse/keyboard)
│   │   │   └── balance.ts          # Game balance & math
│   │   └── main.ts                 # Phaser game instance
│   └── store/
│       └── gameStore.ts            # Zustand state management
├── next.config.js          # Next.js configuration
├── vercel.json             # Vercel deployment settings
└── tsconfig.json           # TypeScript configuration
```

## Customization

### Adjusting Difficulty

Edit level configurations in `src/game/data/levels.ts`:
- `targetForce`: Required force to win
- `timeLimitSec`: Time limit per clash
- `opponentResistance`: How fast force decays

### Modifying Power-Ups

Edit power-up pool and effects in:
- `src/game/systems/balance.ts` - Power-up definitions and effects

### Changing Team Colors

Edit team colors in `src/game/data/teams.ts`:
- Seattle Darkside: `#0F6E6A` (primary), `#7ED957` (accent), `#0B1F24` (trim)
- Opponent teams: Each has unique color palette

## Game Features

- 9-stage progression system
- Button-mash gameplay mechanic
- Retry assist system (5% reduction per retry, max 20%)
- 5 power-up types with unique effects
- Mobile-first design with portrait/landscape handling
- Touch, mouse, and keyboard input support
- Procedural graphics (no external assets required)
- Victory celebration with confetti
- State persistence across sessions

## Brand & Legal

- **No NFL team names, logos, or branding**
- **No real team references**
- All teams are fictional
- Seattle Darkside uses custom color scheme: `#0F6E6A`, `#7ED957`, `#0B1F24`

## Tech Stack

- **Next.js 14+** (App Router)
- **TypeScript**
- **Phaser 3** (game engine)
- **Zustand** (state management)
- **Tailwind CSS** (styling)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Phaser 3 Documentation](https://photonstorm.github.io/phaser3-docs/)
- [Vercel Documentation](https://vercel.com/docs)
