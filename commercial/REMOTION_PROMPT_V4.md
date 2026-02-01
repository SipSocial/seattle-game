# REMOTION IMPLEMENTATION PROMPT — DARK SIDE DEFENSE v4

**Format:** 9:16 Vertical (1080 × 1920)
**Duration:** 27 seconds @ 30fps (810 frames)
**Purpose:** High-energy, scroll-stopping game release video

---

## THE CREATIVE MANDATE

This video exists to make the viewer feel **speed, control, impact, and dominance**.

**Defense feels powerful. Defense feels fast. Defense feels addictive.**

The viewer should feel this in their body before they understand anything intellectually.

---

## WHAT THIS VIDEO IS

- aggressive
- kinetic
- modern
- game-first
- dopamine-driven
- built for TikTok / Reels / Shorts

## WHAT THIS VIDEO IS NOT

- cinematic
- slow
- respectful
- posed
- explanatory
- "agency serious"

If it feels calm, polished, or pretty — it's wrong.

---

## VISUAL LANGUAGE

Think in:
- flashes
- snap cuts
- scale jumps
- motion blur
- UI slams
- impact words

The game should feel like it's **attacking the viewer's attention**.

---

## PACING RULES

- Cuts every **0.4–1.2 seconds** (12–36 frames)
- Nothing holds longer than 2 seconds (60 frames)
- One brief slowdown allowed only to make the reward hit harder
- Speed > clarity (clarity comes from repetition, not explanation)

---

## SCENE BREAKDOWN (27 seconds total)

### SCENE 1 — SCROLL KILLER (0–2s / frames 0–60)

**Purpose:** Stop thumbs.

- Full-frame navy `#002244` background
- One huge word slams in: **DEFENSE**
- Hard audio hit / screen shake
- Immediate cut

No logos. No faces. No context.

```tsx
// Frame timing
const SCENE_1 = { start: 0, end: 60 }
```

---

### SCENE 2 — CHAOS BURST (2–6s / frames 60–180)

**Purpose:** Establish energy.

- Rapid flashes of player silhouettes (0.4s each)
- Use cropped body parts: arms, shoulders, helmets
- Motion blur on entries
- Players appear only as movement, not portraits

**Impact words flash between cuts:**
- HIT (frame 70)
- REACT (frame 110)
- CONTROL (frame 150)

```tsx
const SCENE_2 = { start: 60, end: 180 }
```

---

### SCENE 3 — PLAYER CONTROL MOMENT (6–9s / frames 180–270)

**Purpose:** Show interactivity.

- Screen snaps into massive UI selector
- 2 player cards dominate (35%+ of width each)
- Aggressive snap animation with spring physics
- Green glow pulses

Text: **CHOOSE YOUR DEFENDER**

```tsx
const SCENE_3 = { start: 180, end: 270 }
```

---

### SCENE 4 — POWER RAMP (9–14s / frames 270–420)

**Purpose:** Make it feel physical.

- Speed ramps
- Screen shake
- Bass hits
- DrinkSip power-up cans flash with their colors

**Big verbs slam in:**
- DOMINATE (frame 290)
- SHUT IT DOWN (frame 340)
- OWN THE DRIVE (frame 390)

This should feel like **button-mashing energy**, not a movie.

```tsx
const SCENE_4 = { start: 270, end: 420 }
```

---

### SCENE 5 — REWARD SPIKE (14–18s / frames 420–540)

**Purpose:** Emotional payoff.

- Sudden slowdown (cut intensity by 80%)
- Brief silence (0.3s)
- Massive text: **WIN** (gold, 160px)
- Smash cut to HUGE Super Bowl ticket (55% frame width)
- Gold particle explosion
- Slow float animation

This should feel like a jackpot.

```tsx
const SCENE_5 = { start: 420, end: 540 }
```

---

### SCENE 6 — SNAP BACK TO SPEED (18–22s / frames 540–660)

**Purpose:** Regain momentum.

- Rapid flashes:
  - Game title
  - Player motion
  - Tackle impacts
  - UI elements
- Short. Violent. Fun.

```tsx
const SCENE_6 = { start: 540, end: 660 }
```

---

### SCENE 7 — ACTION COMMAND (22–27s / frames 660–810)

**Purpose:** Action now.

- Big URL: **game.drinksip.com**
- Large QR code (140×140, scannable)
- One command: **PLAY NOW**
- DrinkSip presented by lock-up

Everything centered. Everything bold. Nothing extra.

```tsx
const SCENE_7 = { start: 660, end: 810 }
```

---

## COMPLETE ASSET LIBRARY

### BRAND COLORS

```tsx
export const COLORS = {
  navy: '#002244',
  green: '#69BE28',
  grey: '#A5ACAF',
  white: '#FFFFFF',
  black: '#000000',
  gold: '#FFD700',
  goldDark: '#B8860B',
};
```

### DRINKSIP BRAND

```tsx
export const DRINKSIP = {
  logo: 'https://drinksip.com/cdn/shop/files/DrinkSip-Primary-Logo-for-Web_-_Copy_small_55182640-be2f-4a9a-af3e-3c9ea7582c69.png?v=1659115921&width=500',
  tagline: 'Wake Up Happy',
  products: [
    { 
      name: 'Hazy IPA', 
      effect: 'SLOW-MO',
      color: '#f4a460',
      image: 'https://cdn.shopify.com/s/files/1/0407/8580/5468/files/Hazy_IPA_87ecc479-28f1-49c7-9eba-3d8d7ed19e38.png?v=1760812593',
    },
    { 
      name: 'Watermelon', 
      effect: 'LIFE',
      color: '#ff6b8a',
      image: 'https://cdn.shopify.com/s/files/1/0407/8580/5468/files/Watermelon_Refresher_5730a5cf-a72a-4df9-aa14-d3342b088fe1.png?v=1760812569',
    },
    { 
      name: 'Lemon Lime', 
      effect: 'SPEED',
      color: '#adff2f',
      image: 'https://cdn.shopify.com/s/files/1/0407/8580/5468/files/Lemon_Lime_Refresher_9565ca39-8832-48ab-8c6b-bcd0899f87e9.png?v=1759017824',
    },
    { 
      name: 'Blood Orange', 
      effect: 'POWER',
      color: '#ff4500',
      image: 'https://cdn.shopify.com/s/files/1/0407/8580/5468/files/Blood_Orange_Refresher_82f1cfff-dfdd-44c5-bb02-6f8e74183f36.png?v=1759017824',
    },
  ],
};
```

### PLAYER ROSTER — TRANSPARENT PNG (for motion/overlay)

```tsx
export const PLAYERS_TRANSPARENT = [
  {
    id: 'lawrence',
    name: 'DEMARCUS LAWRENCE',
    firstName: 'DEMARCUS',
    lastName: 'LAWRENCE',
    jersey: 0,
    position: 'DE',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/332d7473-6c1f-4bb8-b05f-3153ead9f23e/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_332d7473-6c1f-4bb8-b05f-3153ead9f23e_0.png',
  },
  {
    id: 'williams',
    name: 'LEONARD WILLIAMS',
    firstName: 'LEONARD',
    lastName: 'WILLIAMS',
    jersey: 99,
    position: 'DT',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/140da1c5-350a-435a-9020-e0dcb37e5bd3/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_140da1c5-350a-435a-9020-e0dcb37e5bd3_0.png',
  },
  {
    id: 'murphy',
    name: 'BYRON MURPHY II',
    firstName: 'BYRON',
    lastName: 'MURPHY II',
    jersey: 91,
    position: 'NT',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/8e36992d-ac71-49b5-b3ad-7b1b2c8c6278/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_8e36992d-ac71-49b5-b3ad-7b1b2c8c6278_0.png',
  },
  {
    id: 'hall',
    name: 'DERICK HALL',
    firstName: 'DERICK',
    lastName: 'HALL',
    jersey: 58,
    position: 'EDGE',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/9d86de1b-8b70-4cab-a879-0fea0e2e5880/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_9d86de1b-8b70-4cab-a879-0fea0e2e5880_0.png',
  },
  {
    id: 'nwosu',
    name: 'UCHENNA NWOSU',
    firstName: 'UCHENNA',
    lastName: 'NWOSU',
    jersey: 7,
    position: 'OLB',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/5e219974-5422-4683-ac72-ffb5b321819c/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_5e219974-5422-4683-ac72-ffb5b321819c_0.png',
  },
  {
    id: 'jones',
    name: 'ERNEST JONES IV',
    firstName: 'ERNEST',
    lastName: 'JONES IV',
    jersey: 13,
    position: 'MLB',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/f982ec62-3c44-4672-adf4-b1dbeb228012/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_f982ec62-3c44-4672-adf4-b1dbeb228012_0.png',
  },
  {
    id: 'thomas',
    name: 'DRAKE THOMAS',
    firstName: 'DRAKE',
    lastName: 'THOMAS',
    jersey: 42,
    position: 'LB',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/d2833c29-06cf-43b8-a66f-d90d72a09c51/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_d2833c29-06cf-43b8-a66f-d90d72a09c51_0.png',
  },
  {
    id: 'witherspoon',
    name: 'DEVON WITHERSPOON',
    firstName: 'DEVON',
    lastName: 'WITHERSPOON',
    jersey: 21,
    position: 'CB',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/df5df5a0-9f26-463f-a540-bf0e2fd20f83/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_df5df5a0-9f26-463f-a540-bf0e2fd20f83_0.png',
  },
  {
    id: 'jobe',
    name: 'JOSH JOBE',
    firstName: 'JOSH',
    lastName: 'JOBE',
    jersey: 29,
    position: 'CB',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/89892bc5-c800-4790-95aa-e7a50a4cc1b6/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_89892bc5-c800-4790-95aa-e7a50a4cc1b6_0.png',
  },
  {
    id: 'love',
    name: 'JULIAN LOVE',
    firstName: 'JULIAN',
    lastName: 'LOVE',
    jersey: 20,
    position: 'S',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/4cf6ca19-acc7-43ac-ab46-893692b85a36/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_4cf6ca19-acc7-43ac-ab46-893692b85a36_0.png',
  },
  {
    id: 'bryant',
    name: 'COBY BRYANT',
    firstName: 'COBY',
    lastName: 'BRYANT',
    jersey: 8,
    position: 'S',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/10d006eb-a852-43cc-acc2-748cefc882bc/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_10d006eb-a852-43cc-acc2-748cefc882bc_0.png',
  },
];
```

### PLAYER ROSTER — CARD VERSIONS (with background)

```tsx
export const PLAYERS = [
  {
    id: 'lawrence',
    name: 'DEMARCUS LAWRENCE',
    firstName: 'DEMARCUS',
    lastName: 'LAWRENCE',
    jersey: 0,
    position: 'DE',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/3ba453a4-62a6-49a5-8202-d2446a0f5aac/segments/1:4:1/Phoenix_Photorealistic_3D_render_of_NFL_football_player_Seattl_0.jpg',
  },
  {
    id: 'williams',
    name: 'LEONARD WILLIAMS',
    firstName: 'LEONARD',
    lastName: 'WILLIAMS',
    jersey: 99,
    position: 'DT',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/ef2fd7e7-c402-44d0-8e59-ffe22303fbe8/segments/1:4:1/Phoenix_Photorealistic_3D_render_Seattle_Seahawks_NFL_defensiv_0.jpg',
  },
  {
    id: 'murphy',
    name: 'BYRON MURPHY II',
    firstName: 'BYRON',
    lastName: 'MURPHY II',
    jersey: 91,
    position: 'NT',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/d8c452c6-a27a-48bd-a5c6-8c7f56d75602/segments/1:4:1/Phoenix_Photorealistic_3D_render_Seattle_Seahawks_NFL_defensiv_0.jpg',
  },
  {
    id: 'hall',
    name: 'DERICK HALL',
    firstName: 'DERICK',
    lastName: 'HALL',
    jersey: 58,
    position: 'EDGE',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/9a34de39-ddf8-4c51-8d14-c8037b9d0e00/segments/1:4:1/Phoenix_Photorealistic_3D_render_Seattle_Seahawks_NFL_defensiv_0.jpg',
  },
  {
    id: 'nwosu',
    name: 'UCHENNA NWOSU',
    firstName: 'UCHENNA',
    lastName: 'NWOSU',
    jersey: 7,
    position: 'OLB',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/6e28c6a0-a5ec-4d46-8709-d142428cffae/segments/1:4:1/Phoenix_Photorealistic_3D_render_Seattle_Seahawks_NFL_defensiv_0.jpg',
  },
  {
    id: 'jones',
    name: 'ERNEST JONES IV',
    firstName: 'ERNEST',
    lastName: 'JONES IV',
    jersey: 13,
    position: 'MLB',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/5295f146-49d1-4dd2-862d-05a8032b4dbf/segments/1:4:1/Phoenix_Photorealistic_3D_render_Seattle_Seahawks_NFL_defensiv_0.jpg',
  },
  {
    id: 'thomas',
    name: 'DRAKE THOMAS',
    firstName: 'DRAKE',
    lastName: 'THOMAS',
    jersey: 42,
    position: 'LB',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/328cb3d7-4478-4f6a-b4b4-c1c4df1df2cf/segments/1:4:1/Phoenix_Photorealistic_3D_render_Seattle_Seahawks_NFL_defensiv_0.jpg',
  },
  {
    id: 'witherspoon',
    name: 'DEVON WITHERSPOON',
    firstName: 'DEVON',
    lastName: 'WITHERSPOON',
    jersey: 21,
    position: 'CB',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/b9eee629-8964-4222-893d-7d6c6b9f3166/segments/1:4:1/Phoenix_Photorealistic_3D_render_Seattle_Seahawks_NFL_defensiv_0.jpg',
  },
  {
    id: 'jobe',
    name: 'JOSH JOBE',
    firstName: 'JOSH',
    lastName: 'JOBE',
    jersey: 29,
    position: 'CB',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/114c8f3d-5347-4fc3-a0be-debd09d626b0/segments/1:4:1/Phoenix_Photorealistic_3D_render_Seattle_Seahawks_NFL_defensiv_0.jpg',
  },
  {
    id: 'love',
    name: 'JULIAN LOVE',
    firstName: 'JULIAN',
    lastName: 'LOVE',
    jersey: 20,
    position: 'S',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/8e44f952-0a2e-43ed-b4f8-2f7c4a6f4609/segments/1:4:1/Phoenix_Photorealistic_3D_render_Seattle_Seahawks_NFL_defensiv_0.jpg',
  },
  {
    id: 'bryant',
    name: 'COBY BRYANT',
    firstName: 'COBY',
    lastName: 'BRYANT',
    jersey: 8,
    position: 'S',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/fe695e8e-0473-4ef6-8b32-adb7e39c762c/segments/1:4:1/Phoenix_Photorealistic_3D_render_Seattle_Seahawks_NFL_defensiv_0.jpg',
  },
];
```

### CAMPAIGN MAP ASSETS

```tsx
export const CAMPAIGN = {
  mapImage: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/2561ee31-7e9b-4de3-9cf2-536e5facde5a/segments/2:4:1/Phoenix_Stylized_3D_US_map_at_night_dark_tactical_military_the_0.jpg',
  planeImage: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/25a25712-b04b-48f6-b9ae-e8bd3122b674/variations/Default_Seattle_Seahawks_NFL_team_Boeing_737_airplane_sleek_mo_0_25a25712-b04b-48f6-b9ae-e8bd3122b674_0.png',
  planeVideo: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/9f2a04f7-2211-4b9e-98ea-b49ef7fe51d1/9f2a04f7-2211-4b9e-98ea-b49ef7fe51d1.mp4',
  stadiumImage: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/16412705-ca65-400e-bb78-80ff29be860a/segments/2:2:1/Phoenix_Empty_NFL_football_field_at_night_dramatic_billowing_s_0.jpg',
  seattleImage: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/1f736005-c2ed-4755-b762-4fc99e7062a1/segments/4:4:1/Phoenix_Seattle_Washington_skyline_at_dusk_Space_Needle_promin_0.jpg',
  sanFranciscoImage: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/f2e5cdfb-ec9b-4d48-825d-6fe7c3a7b3ed/segments/1:4:1/Phoenix_San_Francisco_Bay_Area_Golden_Gate_Bridge_in_fog_Levis_0.jpg',
};
```

### CITY BACKGROUNDS (12 cities)

```tsx
export const CITY_IMAGES = {
  'Seattle': 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/1f736005-c2ed-4755-b762-4fc99e7062a1/segments/4:4:1/Phoenix_Seattle_Washington_skyline_at_dusk_Space_Needle_promin_0.jpg',
  'Pittsburgh': 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/cce31f27-1fb1-4762-9655-53e8949d1640/segments/3:4:1/Phoenix_Pittsburgh_Pennsylvania_skyline_three_rivers_confluenc_0.jpg',
  'Phoenix': 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/bc26177c-33bc-42ce-86ee-9a5d5b0d616f/segments/1:4:1/Phoenix_Phoenix_Arizona_desert_at_sunset_saguaro_cacti_silhoue_0.jpg',
  'Jacksonville': 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/d7e2a53f-b3b9-43ce-bf47-23b755460a55/segments/2:4:1/Phoenix_Jacksonville_Florida_St_Johns_River_waterfront_TIAA_Ba_0.jpg',
  'Washington DC': 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/03489624-502b-4a71-a3e9-3e5e3379c854/segments/3:4:1/Phoenix_Washington_DC_at_night_Capitol_dome_illuminated_Washin_0.jpg',
  'Los Angeles': 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/6ec6e962-3d55-4b86-8b03-9da32162f5ac/segments/1:4:1/Phoenix_Los_Angeles_at_night_SoFi_Stadium_futuristic_exterior_0.jpg',
  'Nashville': 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/d4ee20f2-48c8-4018-92cf-c6f5b70c19aa/segments/3:4:1/Phoenix_Nashville_Tennessee_Broadway_neon_lights_Nissan_Stadiu_0.jpg',
  'Atlanta': 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/29406333-f8bf-4f49-b24a-c19b1712c2e4/segments/1:4:1/Phoenix_Atlanta_Georgia_MercedesBenz_Stadium_futuristic_dome_d_0.jpg',
  'Charlotte': 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/d65a8a97-9e70-4342-a61d-0814cfcbf088/segments/4:4:1/Phoenix_Charlotte_North_Carolina_Bank_of_America_Stadium_downt_0.jpg',
  'San Francisco': 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/f2e5cdfb-ec9b-4d48-825d-6fe7c3a7b3ed/segments/1:4:1/Phoenix_San_Francisco_Bay_Area_Golden_Gate_Bridge_in_fog_Levis_0.jpg',
  'Indianapolis': 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/05eb7428-129f-4c9d-8374-70226d3d7f61/segments/1:4:1/Phoenix_Indianapolis_Indiana_Lucas_Oil_Stadium_retractable_roo_0.jpg',
  'Minneapolis': 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/93e0c861-abb5-4e01-91f0-549a1d47a5a8/segments/3:4:1/Phoenix_Minneapolis_Minnesota_US_Bank_Stadium_glass_exterior_n_0.jpg',
};
```

### GAME INFO

```tsx
export const GAME = {
  title: 'DARK SIDE DEFENSE',
  url: 'game.drinksip.com',
  stages: 20,
  games: 60,
};

export const SUPER_BOWL = {
  name: 'SUPER BOWL LX',
  date: 'FEBRUARY 9',
  shortDate: 'FEB 9',
  location: 'SAN FRANCISCO',
  tickets: '2 SUPER BOWL TICKETS',
};
```

---

## TYPOGRAPHY SYSTEM

```tsx
export const TYPE = {
  // Massive impact headlines
  hero: {
    fontFamily: 'Arial Black, Impact, sans-serif',
    fontWeight: 900,
    letterSpacing: '-0.02em',
    lineHeight: 0.95,
    textTransform: 'uppercase',
  },
  // Supporting text
  body: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
};

// Typography rules:
// - One heavy font
// - Few words
// - Massive size
// - Used as impact punches, not sentences
// - Words should feel like HITS, not captions
```

---

## SAFE AREAS (9:16)

```tsx
const SAFE = {
  top: 140,      // TikTok UI zone
  bottom: 220,   // TikTok engagement zone
  sides: 90,     // Edge breathing room
};

const SCREEN_WIDTH = 1080;
const SCREEN_HEIGHT = 1920;
const SAFE_HEIGHT = SCREEN_HEIGHT - SAFE.top - SAFE.bottom; // 1560px
const SAFE_WIDTH = SCREEN_WIDTH - SAFE.sides * 2; // 900px
```

---

## ANIMATION PRIMITIVES

### Screen Shake

```tsx
const shakeIntensity = Math.max(0, 12 - frame) * 1.5;
const shakeX = Math.sin(frame * 2.5) * shakeIntensity;
const shakeY = Math.cos(frame * 3) * shakeIntensity * 0.4;
```

### Impact Spring

```tsx
const scale = spring({
  frame,
  fps,
  config: { damping: 10, stiffness: 180 },
  from: 2.8,
  to: 1,
});
```

### Glow Pulse

```tsx
const glowIntensity = 30 + Math.sin(frame * 0.08) * 12;
// Use in boxShadow: `0 0 ${glowIntensity}px ${COLORS.green}`
```

### Flash Transition

```tsx
const flashOpacity = interpolate(frame, [0, 4, 10], [1, 0, 0], {
  extrapolateRight: 'clamp',
});
```

---

## PLAYER USAGE RULES

- Players are used as **motion elements**, not heroes
- No static standing poses
- Crop aggressively: arms, shoulders, helmets
- Faces appear briefly, never linger
- Movement > identity

This avoids bad stacking and asset repetition.

**For Scene 2 Chaos Burst:**
- Use `PLAYERS_TRANSPARENT` array
- Crop to show only upper body/arms
- Mirror some players with `scaleX(-1)`
- Add motion blur with `filter: blur(2px)`

**For Scene 3 Player Cards:**
- Use `PLAYERS` array (with backgrounds)
- Only show 2 cards maximum
- Card width: 380px (35% of screen)

---

## POWER-UP VISUALS (Scene 4)

```tsx
const POWER_UPS = [
  { name: 'SLOW-MO', color: '#f4a460', product: 'Hazy IPA' },
  { name: 'LIFE', color: '#ff6b8a', product: 'Watermelon' },
  { name: 'SPEED', color: '#adff2f', product: 'Lemon Lime' },
  { name: 'POWER', color: '#ff4500', product: 'Blood Orange' },
];
```

Flash each power-up with its color for 0.3s during the power ramp.

---

## TICKET REWARD (Scene 5)

```tsx
// Ticket dimensions: 55% of screen width
const ticketWidth = SCREEN_WIDTH * 0.55; // ~594px

// Gold particle system
const particles = Array.from({ length: 35 }, (_, i) => ({
  x: (Math.random() - 0.5) * 600,
  y: (Math.random() - 0.5) * 400,
  size: 2 + Math.random() * 4,
  speed: 0.5 + Math.random() * 0.5,
}));

// Slow float after entrance
const floatOffset = Math.sin(frame * 0.03) * 8;
```

---

## AUDIO DIRECTION (CRITICAL)

This video lives or dies by sound.

**Required elements:**
- Heavy beat (120+ BPM)
- Strong bass on impacts
- UI click/whoosh sounds on text slams
- One silence beat (0.3s) before the reward reveal
- The sound should make the phone feel alive

**Beat sync points (frames):**
- 0: Bass hit (DEFENSE)
- 60: Beat starts
- 70, 110, 150: Hits on HIT/REACT/CONTROL
- 270: Bass drop (DOMINATE)
- 420: Silence begins
- 450: Triumphant swell (WIN)
- 660: Final beat section

---

## SCALE RULE

If you're wondering: "Is this too big?"

It's probably still too small.

**Small dies on mobile.**

---

## FINAL TEST (PASS / FAIL)

**PASS if viewer says:**
- "That looks intense"
- "I want to try that"
- "What is this game?"

**FAIL if viewer says:**
- "Looks polished"
- "Looks cinematic"
- "I get it but…"

---

## CREATIVE NORTH STAR

**This is a game you feel before you understand.**

That's the bar.
