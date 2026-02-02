# Leonardo AI Asset Pipeline - Dark Side Uniforms

## Overview

This document describes the end-to-end workflow for generating Dark Side branded player sprites using Leonardo AI.

---

## Asset Categories

### 1. Player Sprites (Priority)

**Offensive Players:**
| Jersey | Name | Position | Status |
|--------|------|----------|--------|
| 14 | Sam Darnold | QB | Pending |
| 11 | Jaxon Smith-Njigba | WR | Pending |
| 10 | Cooper Kupp | WR | Pending |
| 88 | AJ Barner | TE | Pending |
| 9 | Kenneth Walker III | RB | Pending |

**Defensive Players:**
| Jersey | Name | Position | Status |
|--------|------|----------|--------|
| 0 | DeMarcus Lawrence | DE | Pending |
| 99 | Leonard Williams | DT | Pending |
| 21 | Devon Witherspoon | CB | Pending |

### 2. Helmets

- Dark Side helmet (matte black, dark grey facemask)
- Opponent helmets (generic colors, no logos)

### 3. Field Backgrounds

- 9:16 night game field (QB POV looking downfield)
- Day game variant
- Weather variants (rain, snow)

---

## Dark Side Uniform Specification

```
JERSEY:
- Matte black satin finish
- Subtle charcoal grey numbers (barely visible)
- NO logos, NO team marks, NO wordmarks

ACCENTS:
- Thin neon green (#69BE28) stripe on:
  - Shoulder seam
  - Pants side stripe
  - Collar trim (subtle)

HELMET:
- Matte black shell
- Dark grey facemask
- Dark tinted visor

ACCESSORIES:
- Black gloves
- Black cleats
```

---

## Generation Workflow

### Step 1: Prepare Player Data

Player physical data is in:
- Offense: `src/v3/lib/offensePlayerData.ts`
- Defense: `src/game/data/playerReferences.ts`

Each player has:
- Physical description (height, weight, build, skin tone)
- Pose style (dropback stance, route-running, pass rush, etc.)
- Reference headshot URL (for Character Reference ControlNet)

### Step 2: Generate via API

**Endpoint:** `POST /api/v3/generate-uniform`

```json
{
  "jerseys": [14, 11, 10],
  "type": "offense"
}
```

**Response:**
```json
{
  "success": true,
  "generations": [
    { "jersey": 14, "generationId": "abc123...", "prompt": "..." },
    { "jersey": 11, "generationId": "def456...", "prompt": "..." }
  ]
}
```

### Step 3: Poll for Completion

**Endpoint:** `GET /api/leonardo/status/{generationId}`

Poll every 3 seconds until status is `COMPLETE` or `FAILED`.

### Step 4: Background Removal

If the generated image has background artifacts:

**Option A: Leonardo Background Removal**
```typescript
const client = createLeonardoClient()
const jobId = await client.removeBackground(imageId)
const result = await client.waitForGeneration(jobId)
```

**Option B: Local Script (Fallback)**
```bash
npx ts-node scripts/remove-bg.ts --input player.png --output player-clean.png
```

### Step 5: Quality Review

1. Check silhouette clarity at small sizes
2. Verify no logos or team marks visible
3. Confirm green accent is subtle but visible
4. Ensure consistent lighting across all players

### Step 6: Import to Manifest

Update `src/v3/lib/v3Assets.ts` with CDN URLs:

```typescript
{
  jersey: 14,
  name: 'Sam Darnold',
  position: 'QB',
  type: 'offense',
  imageUrl: 'https://cdn.leonardo.ai/users/.../image.png',
  variants: ['url1', 'url2', 'url3', 'url4'],
  status: 'ready',
}
```

---

## Prompt Templates

### QB (Sam Darnold #14)

```
Full body NFL quarterback number 14 in athletic dropback stance,
6-3 225 lbs athletic QB build light skin clean-cut appearance strong arm poised in pocket,
helmet on with dark tinted visor down,
matte black satin jersey with subtle charcoal grey number 14 barely visible,
no logos no team marks no wordmarks,
thin neon green accent stripe on shoulder seam and pants side stripe,
matte black helmet with dark grey facemask,
black gloves gripping football,
black cleats,
photorealistic 3D render Madden NFL 25 quality,
flat neutral studio lighting for sprite extraction,
solid light grey background #E0E0E0 for easy removal,
full body visible from helmet to cleats centered in frame,
1536px height minimum,
8K photorealistic quality

Negative: logos, team names, Seahawks, wordmarks, busy background, cartoon style, low quality, blurry, text, watermark
```

### WR (JSN #11)

```
Full body NFL wide receiver number 11 in athletic route-running stance,
6-0 200 lbs lean athletic receiver build dark skin young explosive player,
arms in running motion,
helmet on with dark tinted visor,
matte black satin jersey with subtle charcoal grey number 11,
no logos no team marks,
thin neon green accent stripe on shoulders,
matte black helmet with dark grey facemask,
black gloves,
black cleats,
photorealistic 3D render Madden NFL 25 quality,
flat neutral studio lighting,
solid light grey background #E0E0E0,
full body helmet to cleats,
1536px height,
8K quality

Negative: logos, team names, busy background, cartoon, blurry
```

### Defender (DeMarcus #0)

```
Full body NFL defensive end number 0 in aggressive pass rush stance,
6-3 254 lbs powerful athletic build dark skin full beard intense expression,
helmet on visor down,
matte black satin jersey with charcoal grey number 0,
no logos no team marks,
thin neon green accent on shoulders and pants,
matte black helmet with dark grey facemask,
black gloves,
muscular arms,
photorealistic 3D render Madden NFL 25 quality,
flat neutral studio lighting,
solid light grey background #E0E0E0,
full body helmet to cleats,
1536px height,
8K quality

Negative: logos, team names, busy background, cartoon, blurry
```

### 9:16 Field Background

```
First person POV from NFL quarterback standing at line of scrimmage,
looking downfield toward end zone 40 yards away,
9:16 portrait aspect ratio vertical mobile game format,
night game with dramatic stadium lights creating god rays through light fog,
crisp bright green artificial turf with white yard lines and hash marks,
no logos no team branding no text on field,
silhouette players in distance for depth,
photorealistic ESPN broadcast quality,
cinematic depth of field with sharp focus on near field,
1280x2272 resolution or 720x1280 minimum,
8K quality

Negative: logos, team names, text, watermarks, cartoon
```

---

## Asset Naming Convention

```
# Players
player_{position}_{jersey}_darkside_v3.png
# Example: player_qb_14_darkside_v3.png

# Helmets
helmet_darkside_v3.png
helmet_opponent_{color}_v3.png

# Fields
field_9x16_night_v3.webp
field_9x16_rain_v3.webp
```

---

## Background Removal Script

Create `scripts/remove-bg.ts` if Leonardo removal has artifacts:

```typescript
import sharp from 'sharp'

async function removeBackground(input: string, output: string) {
  // Use sharp to detect and remove grey background
  const image = sharp(input)
  const { data, info } = await image
    .raw()
    .toBuffer({ resolveWithObject: true })

  // Remove near-grey pixels (#E0E0E0 ± tolerance)
  // Implementation details...
  
  await sharp(data, { raw: info })
    .png()
    .toFile(output)
}
```

---

## Quality Checklist

Before marking an asset as "ready":

- [ ] No logos or team marks visible
- [ ] Green accent is subtle but visible
- [ ] Silhouette is clear at 100x200px
- [ ] Background is fully transparent
- [ ] Consistent lighting with other players
- [ ] Pose matches the player's role (QB stance, WR running, etc.)
- [ ] Number is visible but not prominent

---

## Troubleshooting

### Generation fails
- Check Leonardo API credits
- Verify prompt doesn't exceed token limit
- Try with fewer images (2 instead of 4)

### Background removal leaves artifacts
- Use local script with stricter color tolerance
- Manual cleanup in image editor for hero assets

### Colors look wrong
- Ensure "flat neutral studio lighting" is in prompt
- Add "consistent lighting" to negative prompt
- Generate on clear day, not foggy/rainy conditions

---

## API Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v3/generate-uniform` | POST | Generate Dark Side uniforms |
| `/api/v3/generate-uniform` | GET | List available players |
| `/api/leonardo/status/{id}` | GET | Check generation status |
| `/api/players/remove-background` | POST | Remove background from image |

---

*Last Updated: 2026-02-01*
