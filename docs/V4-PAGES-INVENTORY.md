# V4 Pages Inventory

## Pages to Preserve (Screenshot Reference)

### 1. Home Page - `/` (app/page.tsx)
- **Description**: Nike-level design with video background, gradient buttons
- **Key Features**: 
  - VideoBackground component
  - SoundtrackPlayer integration
  - GradientButton, GhostButton components
  - 3-zone flex layout (sponsor/title/actions)
- **Status**: PRESERVE - Move to V4 home

### 2. Player Carousel Selection - `/mockup` (app/mockup/page.tsx)
- **Description**: Swipeable superhero player carousel ⭐ USE THIS FOR V4
- **Key Features**:
  - AnimatePresence for smooth transitions
  - Full-screen player images with glow effects
  - Stats display (SACKS, TACKLES, FF, etc.)
  - Position chip badges
  - Dot navigation
  - Swipe/arrow key controls
- **Status**: PRESERVE - THIS IS THE PRIMARY PLAYER SELECTOR

### 3. Campaign Map - `/campaign` (app/campaign/page.tsx)
- **Description**: Dark side plane map with city nodes
- **Key Features**:
  - CampaignMapV2 component
  - Leonardo-generated US map image
  - Airplane asset
  - City preview modals
  - Soundtrack integration
- **Status**: PRESERVE - Move to V4 campaign

### 4. V3 Map - `/v3/map` (app/v3/map/page.tsx)
- **Description**: V3 version of campaign map
- **Key Features**: Same as campaign, routes to V3 game
- **Status**: MERGE with campaign or keep for V3

### 5. V3 Football Game - `/v3/game` (app/v3/game/page.tsx)
- **Description**: QB passing game with timing mechanics
- **Key Features**:
  - Phaser 3 OffenseSceneV2
  - PlaybookPanel (compact, floating)
  - CATCH timing button
  - Receiver routes, defender coverage
  - Ball flight visualization
- **Status**: PRESERVE - This is Game 2 (Football)

### 6. Original Game - `/play` (app/play/page.tsx)
- **Description**: Original Phaser defense game
- **Key Features**:
  - GameScene (tackle runners)
  - Power-ups, waves, megaphone
- **Status**: PRESERVE - This is Game 1 (Blockbuster)

### 7. V3 Roster - `/v3/roster` (app/v3/roster/page.tsx)
- **Description**: Player selection with GlassCard style
- **Key Features**: NOT the carousel - don't use this
- **Status**: REPLACE with carousel from mockup

---

## Admin Pages to Preserve (Sprite Generators)

### 8. Player Sprites Admin - `/admin/players` (app/admin/players/page.tsx)
- **Description**: Generate player sprites via Leonardo API
- **Key Features**:
  - Defenders tab, Offense tab, Opponents tab
  - Multiple styles: darkside, card, sprite, action, fullscreen
  - Batch generation
  - Selection storage
- **Status**: PRESERVE - Critical for asset generation

### 9. Sprites Admin - `/admin/sprites` (app/admin/sprites/page.tsx)
- **Description**: General sprite generation
- **Key Features**: Basic sprite generation workflow
- **Status**: PRESERVE

### 10. Campaign Assets Admin - `/admin/campaign-assets` (app/admin/campaign-assets/page.tsx)
- **Description**: Campaign-specific asset management
- **Status**: PRESERVE

### 11. V3 Assets Admin - `/v3/admin/assets` (app/v3/admin/assets/page.tsx)
- **Description**: V3-specific asset management
- **Status**: PRESERVE

---

## V4 Unified Structure

```
/v4
├── page.tsx                    # Home (from current /)
├── campaign/
│   └── page.tsx               # Campaign map with dark side plane
├── select/
│   ├── offense/
│   │   └── page.tsx           # Carousel player select for OFFENSE
│   └── defense/
│       └── page.tsx           # Carousel player select for DEFENSE
├── game/
│   ├── offense/
│   │   └── page.tsx           # Football game (QB mode) - from V3
│   └── defense/
│       └── page.tsx           # Original tackle game - from /play
├── results/
│   └── page.tsx               # Game results screen
├── leaderboard/
│   └── page.tsx               # Leaderboards with QB ratings
├── giveaway/
│   └── page.tsx               # Shopify buy button + giveaway
└── admin/
    ├── sprites/               # Preserve current admin/sprites
    └── players/               # Preserve current admin/players
```

---

## Selected Sprites JSON
- Path: `c:\Users\julia\Downloads\selected-sprites (1).json`
- Contains 16 selected player images from Leonardo AI
- Players: Cooper Kupp, AJ Barner, JSN, Sam Darnold, KW3, Byron Murphy II, Derick Hall, DeMarcus Lawrence, Uchenna Nwosu, Ernest Jones IV, Drake Thomas, Devon Witherspoon, Josh Jobe, Julian Love, Coby Bryant, Leonard Williams

---

## Component Inventory

### UI Components (components/ui/)
- VideoBackground.tsx
- GlassCard.tsx
- GradientButton.tsx
- GhostButton.tsx
- SoundtrackPlayer.tsx
- MiniPlayer.tsx
- FullPlayer.tsx
- DotIndicator.tsx
- NavigationArrows.tsx
- PositionChip.tsx
- StatDisplay.tsx
- ArtistProfile.tsx
- LoadingSpinner.tsx

### Game Components (components/game/)
- CampaignMapV2.tsx
- CityPreview.tsx
- StageTransition.tsx
- (Various Phaser scene components)

### Platform Components (components/platform/)
- EmailEntry.tsx
- EntryCounter.tsx
- LeaderboardTable.tsx
- ShareButton.tsx
- WeekUnlockGrid.tsx
