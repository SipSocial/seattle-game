# Agent Charlie - Project Starter

## My Role
I'm Agent Charlie, the starter agent for the seattle-game project. My responsibilities include:
- Initial project setup and scaffolding
- Maintaining project documentation
- Tracking project state and configuration
- Sharing context with other agents

## Project Quick Reference

### Seattle Game - Road to the Super Bowl
- **Type**: 2D side-scrolling arcade football fantasy game
- **Engine**: Phaser 3
- **Framework**: Next.js 14 (App Router) + TypeScript
- **Port**: **30094** (CRITICAL - must use this port)
- **Deployment**: Vercel
- **Status**: COMPLETE - Fully playable prototype

### Key Files
- `.cursor/rules/project-context.md` - Full project context for other agents
- `package.json` - Scripts configured for port 30094
- `app/` - Next.js App Router directory
- `src/game/` - Phaser game engine code
- `src/store/` - Zustand state management

### Commands
```bash
npm install          # Install dependencies
npm run dev          # Start dev server on port 30094
npm run build        # Build for production
npm run start        # Start production server on port 30094
```

## Game Structure
- **6 Scenes**: Boot, Menu, Road, Clash, PowerUp, Victory
- **9 Levels**: 8 opponents + Super Bowl finale
- **5 Power-ups**: Double Tap, Extend Time, Head Start, Momentum Boost, Extra Lineman
- **Input**: Touch, mouse, keyboard (Spacebar)

## Important Rules
2. **No NFL team names/logos** - All teams must be fictional
3. **Seattle Darkside colors**: #0F6E6A (teal), #7ED957 (green), #0B1F24 (navy)
4. Always update `.cursor/rules/project-context.md` when making significant changes
5. Share project state with other agents through the context file

## Customization Locations
- `src/game/data/levels.ts` - Level difficulty settings
- `src/game/data/teams.ts` - Team colors and names
- `src/game/systems/balance.ts` - Power-up effects and game balance
