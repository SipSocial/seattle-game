# Seattle Seahawks Defense - Road to Super Bowl LX

A premium, mobile-first browser game featuring the Seattle Seahawks' "Dark Side" defense on their journey to Super Bowl LX. Built with Next.js, Phaser 3, and Leonardo AI.

**Live Demo**: https://seattle-game.vercel.app

---

## Game Overview

### Campaign Mode
Follow the 2025 Seattle Seahawks schedule from Week 1 through the Super Bowl in San Francisco. Face real opponents (49ers, Steelers, Rams, Patriots) across 20 stages with increasing difficulty.

### Endless Mode
Survive infinite waves of runners. Compete for high scores on the leaderboard.

### Gameplay
- **Select your defender** from the 11 defensive starters
- **Control your player** by dragging to move
- **Tackle runners** coming down the field
- **Build combos** to charge the 12th Man Megaphone
- **Catch power-ups** for boosts and abilities

---

## Screenshots

| Player Selection | Campaign Map | Gameplay |
|------------------|--------------|----------|
| 3D rotating players with animated backgrounds | Interactive US map with flight path | Wave-based defense gameplay |

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm
- Leonardo AI API key (for asset generation)

### Installation

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
```

Open [http://localhost:3004](http://localhost:3004)

> **Note**: The app runs on port **3004** (configured in package.json)

### Production Build

```bash
npm run build
npm run start
```

### Deploy to Vercel

```bash
vercel --prod
```

---

## Features

### Visual
- 🎨 Photorealistic 3D player renders via Leonardo AI
- 🌌 Animated video backgrounds
- ✨ Smooth 60fps animations with Framer Motion
- 📱 Mobile-first responsive design
- 🏈 Real player likenesses and stats

### Gameplay
- 🏆 20-stage campaign following 2025 Seahawks schedule
- ♾️ Endless mode with high score tracking
- 🎮 Touch, mouse, and keyboard support
- ⚡ DrinksIP-branded power-ups
- 📣 12th Man Megaphone super ability

### Technical
- ⚛️ React + Next.js 14 App Router
- 🎮 Phaser 3 game engine
- 📦 Zustand state management
- 🖼️ Leonardo AI for dynamic asset generation
- 🚀 Vercel edge deployment

---

## Project Structure

```
seattle-game/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Home/landing page
│   ├── play/                     # Game entry point
│   ├── campaign/                 # Campaign map
│   ├── mockup/                   # Player selection
│   ├── admin/                    # Asset generation tools
│   └── api/                      # API routes
│       └── leonardo/             # Leonardo AI integration
│
├── components/game/              # React game components
│   ├── CampaignMapV2.tsx         # Interactive US map
│   ├── PlayerSelect.tsx          # Player selection UI
│   └── StageTransition.tsx       # Stage entry screen
│
├── src/
│   ├── game/                     # Phaser game code
│   │   ├── scenes/               # Game scenes
│   │   └── data/                 # Game data files
│   ├── store/                    # Zustand state
│   └── lib/                      # Utilities & API clients
│
└── .cursor/rules/                # Documentation
    ├── ARCHITECTURE.md           # Technical design
    ├── DESIGN_PLAN.md            # Visual guidelines
    ├── RULES.md                  # Coding standards
    └── AGENT_WORKFLOW.md         # Multi-agent process
```

---

## Customization

### Campaign Data
Edit `src/game/data/campaign.ts`:
- Stage order and opponents
- Difficulty settings per stage
- City locations on map

### Roster
Edit `src/game/data/roster.ts`:
- Player names and numbers
- Positions and stats
- Starter lineup

### Power-Ups
Edit `src/game/data/powerups.ts`:
- Power-up effects
- Duration and strength
- Visual styling

### Colors
Edit `src/game/config/phaserConfig.ts`:
- Seahawks colors: Navy (#002244), Green (#69BE28)
- UI colors and gradients

---

## Leonardo AI Integration

The game uses Leonardo AI for photorealistic asset generation:

### Admin Tools
- `/admin/players` - Generate player portraits
- `/admin/sprites` - Generate game sprites

### Generated Assets
- Player portraits (transparent PNG)
- Stadium backgrounds (animated video)
- Campaign map (US map at night)
- Dark Side team plane (animated)
- City backgrounds for each stage

### API Endpoints
- `POST /api/leonardo/generate` - Start generation
- `GET /api/leonardo/status/[id]` - Check status
- `POST /api/players/remove-background` - Remove backgrounds

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Game Engine | Phaser 3 |
| State | Zustand |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| AI Assets | Leonardo AI |
| Deployment | Vercel |

---

## Documentation

Full documentation lives in `.cursor/rules/`:

| Document | Purpose |
|----------|---------|
| `project-context.md` | Current state & quick reference |
| `ARCHITECTURE.md` | Technical architecture & data flow |
| `DESIGN_PLAN.md` | Visual design & UI patterns |
| `RULES.md` | Coding standards & best practices |
| `AGENT_WORKFLOW.md` | Multi-agent collaboration guide |

---

## Development

### Commands

```bash
npm run dev      # Start dev server (port 3004)
npm run build    # Production build
npm run lint     # Run ESLint
npm run start    # Start production server
```

### Key Files

| Purpose | Location |
|---------|----------|
| Game state | `src/store/gameStore.ts` |
| Phaser config | `src/game/config/phaserConfig.ts` |
| Campaign data | `src/game/data/campaign.ts` |
| Player images | `src/game/data/playerImages.ts` |
| Leonardo assets | `src/game/data/campaignAssets.ts` |

---

## Credits

- **Game Design**: DeMarcus Lawrence & Team
- **Development**: Cursor AI Agents
- **Assets**: Leonardo AI
- **Brand Integration**: DrinkSip

---

## License

Private project - Seattle Seahawks Defense Game

---

## Links

- **Live Game**: https://seattle-game.vercel.app
- **Repository**: https://github.com/SipSocial/seattle-game
- **Leonardo AI**: https://leonardo.ai
- **Vercel**: https://vercel.com
