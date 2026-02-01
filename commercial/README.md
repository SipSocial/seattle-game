# Seattle Game Commercial - DeMarcus Lawrence x DrinkSip

High-energy game drop commercial built with [Remotion](https://remotion.dev) for the Seattle Seahawks Defense game launch.

## Quick Start

```bash
# Install dependencies
npm install

# Open Remotion Studio to preview
npm start

# Render all video formats
npm run build:all
```

## Video Compositions

| Composition | Duration | Resolution | Use Case |
|-------------|----------|------------|----------|
| `Commercial` | 60 sec | 1920x1080 (16:9) | YouTube, Web |
| `Commercial30` | 30 sec | 1920x1080 (16:9) | YouTube ads, TV |
| `Commercial30Vertical` | 30 sec | 1080x1920 (9:16) | Instagram Stories, TikTok, Reels |
| `Commercial30Square` | 30 sec | 1080x1080 (1:1) | Instagram Feed, Facebook |

## Render Commands

```bash
# Full 60-second commercial (YouTube/web)
npm run build:60

# 30-second versions
npm run build:30           # 16:9 landscape
npm run build:30-vertical  # 9:16 vertical (Stories/Reels)
npm run build:30-square    # 1:1 square (Feed)

# All social media formats at once
npm run build:social

# Everything
npm run build:all
```

## Scene Breakdown

### 60-Second Version

| Scene | Time | Content |
|-------|------|---------|
| **Intro** | 0-8s | "BORED THIS WEEK?" hook, stadium atmosphere, DrinkSip logo |
| **Hero** | 8-18s | DeMarcus Lawrence spotlight, #0 reveal, Dark Side plane fly-by |
| **Gameplay** | 18-35s | Fast cuts of cities/players, TACKLE/DEFEND/DOMINATE, DrinkSip power-ups |
| **Giveaway** | 35-48s | WIN 2X TICKETS, Super Bowl LX announcement, gold ticket animation |
| **CTA** | 48-60s | seattle-game.vercel.app, PLAY NOW. ENTER TO WIN., Powered by DrinkSip |

### 30-Second Version (condensed)

| Scene | Time | Content |
|-------|------|---------|
| **Hook** | 0-4s | Quick "BORED THIS WEEK?" |
| **Hero + Gameplay** | 4-20s | Combined DeMarcus reveal + fast game cuts |
| **Giveaway** | 20-26s | Condensed ticket giveaway |
| **CTA** | 26-30s | Quick call to action |

## Assets Used

### Leonardo AI Generated
- DeMarcus Lawrence + 10 player portraits (photorealistic 3D renders)
- 12 city backgrounds (Seattle, Pittsburgh, LA, San Francisco, etc.)
- US tactical map (night theme, green grid)
- Dark Side Boeing 737 (static PNG + animated MP4)
- Stadium atmosphere

### DrinkSip Branding
- Primary logo
- Power-up product images (Hazy IPA, Watermelon, Lemon Lime, Blood Orange)
- "Wake Up Happy" tagline

## Adding Audio

To add background music and sound effects:

1. Place audio files in `public/audio/`
2. Uncomment and update the Audio component in `Video.tsx`:

```tsx
import { Audio, staticFile } from 'remotion';

// Inside the component:
<Audio src={staticFile('audio/commercial-track.mp3')} />
```

Recommended audio style:
- Epic/intense game trailer music
- Stadium crowd ambience
- Bass drops and whoosh effects
- Duration: 60 seconds for full version

## Customization

### Colors (src/assets.ts)

```typescript
export const SEAHAWKS = {
  navy: '#002244',
  actionGreen: '#69BE28',
  wolf: '#A5ACAF',
  white: '#FFFFFF',
};
```

### Timing (src/assets.ts)

Adjust scene timing in `TIMING_60` and `TIMING_30` objects.

### Content

Update text, URLs, and dates in the `GAME` and `SUPER_BOWL` objects in `src/assets.ts`.

## Output Files

Rendered videos are saved to `/out/`:
- `60sec-16x9.mp4` - Full commercial
- `30sec-16x9.mp4` - Short landscape
- `30sec-9x16.mp4` - Vertical (Stories/TikTok)
- `30sec-1x1.mp4` - Square (Feed)

## Requirements

- Node.js 16+ or Bun 1.0.3+
- FFmpeg (included with Remotion)
