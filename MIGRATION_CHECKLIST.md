# UI/UX Migration Checklist
## Phaser → React (Mobile-First, Xbox/Madden/CoD Aesthetic)

**Design Reference:** `/mockup` page  
**Design Language:** Xbox Dashboard meets Madden meets Call of Duty  
**Approach:** Mobile-first, fully responsive, Tailwind CSS + Material Design  

---

## 📱 Design System Foundation

### Install Required Packages
- [ ] `@mui/material` - Material Design components
- [ ] `@mui/icons-material` - Material icons
- [ ] `@emotion/react` & `@emotion/styled` - MUI styling
- [ ] `framer-motion` - Smooth animations (60fps)
- [ ] `@fontsource/bebas-neue` - Bold display font
- [ ] `@fontsource/oswald` - Secondary display font

### Create Shared Components Library (`/components/ui/`)
- [ ] `GlassCard.tsx` - Frosted glass panels (backdrop-blur)
- [ ] `GradientButton.tsx` - Primary CTA with gradient + glow
- [ ] `GhostButton.tsx` - Secondary outline button
- [ ] `PositionChip.tsx` - Pill-shaped position badge (matches mockup)
- [ ] `StatDisplay.tsx` - Stat number with label
- [ ] `PlayerCard.tsx` - 3D player showcase with parallax
- [ ] `VideoBackground.tsx` - Looping video with fallback poster
- [ ] `NavigationArrows.tsx` - Left/right circular buttons
- [ ] `DotIndicator.tsx` - Carousel dot navigation
- [ ] `LoadingSpinner.tsx` - Seahawks-themed loading state
- [ ] `BottomSheet.tsx` - Mobile modal (slides up from bottom)
- [ ] `Toast.tsx` - Notification component

### Design Tokens (`/styles/tokens.ts`)
- [ ] Colors: Navy (#002244), Action Green (#69BE28), White, Glass overlays
- [ ] Gradients: Button gradient, text gradient, background gradient
- [ ] Shadows: Glow effects (green glow, shadow depths)
- [ ] Spacing: Mobile-first scale (4, 8, 12, 16, 24, 32, 48)
- [ ] Typography: Font families, sizes, weights
- [ ] Animations: Transition durations, easing curves

---

## 🎮 Pages to Migrate (Phaser → React)

### 1. HOME PAGE (`/`) - ✅ Already React
**Current:** Basic React page  
**Status:** Needs reskin to match mockup aesthetic  

- [ ] Add video background (billowing smoke from mockup)
- [ ] Apply glass card styling to stats panel
- [ ] Update button to match mockup's gradient pill button
- [ ] Add parallax/3D hover effects
- [ ] Mobile touch optimization
- [ ] Safe area insets for notched phones
- [ ] Reduce visual clutter - focus on primary CTA

### 2. PLAYER SELECT (`/play`) - ✅ Already React (PlayerSelect.tsx)
**Current:** Already using React component  
**Status:** Sync with mockup, remove duplicates  

- [ ] Delete `/mockup/page.tsx` (merge into PlayerSelect)
- [ ] Ensure buttery smooth 3D touch (RAF + lerp)
- [ ] Update chip styling to match mockup
- [ ] Video background with poster fallback
- [ ] Player stats display
- [ ] Swipe gestures for player switching
- [ ] Haptic feedback on selection
- [ ] Preload next/prev player images

### 3. MENU SCENE → REMOVE
**Current:** `MenuScene.ts` (706 lines Phaser)  
**Action:** DELETE - Home page (`/`) replaces this  

- [ ] Delete `src/game/scenes/MenuScene.ts`
- [ ] Remove from scene registration in Phaser config
- [ ] Ensure `/` home page has all menu functionality

### 4. ROSTER SCENE → REMOVE  
**Current:** `RosterScene.ts` (542 lines Phaser)  
**Action:** DELETE - PlayerSelect.tsx replaces this  

- [ ] Delete `src/game/scenes/RosterScene.ts`
- [ ] Delete `src/game/scenes/PlayerSelectScene.ts`
- [ ] Remove from scene registration

### 5. MAP SCENE → React Component
**Current:** `MapScene.ts` (1,296 lines Phaser)  
**Action:** Create `/map` or embed in `/play`  

New: `components/CampaignMap.tsx`
- [ ] SVG or CSS-based US map with route
- [ ] City nodes with team logos
- [ ] Current position marker with glow
- [ ] Stage preview modal (BottomSheet on mobile)
- [ ] Scroll/drag navigation
- [ ] Progress indicators per city
- [ ] Lock icons for locked stages
- [ ] Smooth scroll-to on stage select
- [ ] Touch-friendly city tap targets (min 48px)

### 6. GAME OVER → React Overlay
**Current:** `GameOverScene.ts` (633 lines Phaser)  
**Action:** Create React overlay component  

New: `components/GameOver.tsx`
- [ ] Overlay on top of paused Phaser canvas
- [ ] Player showcase (same as PlayerSelect)
- [ ] Score display with animation
- [ ] Stats grid (wave, tackles, combo)
- [ ] Name entry input (3 chars)
- [ ] "Play Again" primary button
- [ ] "Change Player" secondary button
- [ ] "View Leaderboard" tertiary button
- [ ] Share button with social icons
- [ ] High score celebration animation

### 7. LEADERBOARD → React Component
**Current:** `LeaderboardScene.ts` (Phaser)  
**Action:** Create `/leaderboard` page or modal  

New: `components/Leaderboard.tsx`
- [ ] Glass card list of entries
- [ ] Rank, name, score, wave columns
- [ ] Current player highlight
- [ ] Scroll list (virtualized if needed)
- [ ] Pull-to-refresh on mobile
- [ ] Filter tabs (All Time, Today, Friends)
- [ ] Share score button

### 8. STAGE TRANSITION → React Component
**Current:** `StageTransitionScene.ts` (Phaser)  
**Action:** Create React overlay  

New: `components/StageTransition.tsx`
- [ ] Full-screen overlay with team logo
- [ ] "WEEK X" display
- [ ] Opponent team name and logo
- [ ] Difficulty indicator
- [ ] "START GAME" button
- [ ] Auto-transition after delay
- [ ] Entry animation (fade + scale)

### 9. SUPER BOWL SCENE → React Component
**Current:** `SuperBowlScene.ts` (Phaser)  
**Action:** Create celebration overlay  

New: `components/SuperBowlVictory.tsx`
- [ ] Confetti animation
- [ ] Trophy display
- [ ] "SUPER BOWL CHAMPIONS" text
- [ ] Final stats summary
- [ ] Share victory button
- [ ] "New Campaign" button
- [ ] Credits/thank you

### 10. ENGAGE SCENE → React Modal
**Current:** `EngageScene.ts` (Phaser)  
**Action:** Create React modal/bottom sheet  

New: `components/EngageModal.tsx`
- [ ] Social follow buttons (Instagram, TikTok, etc.)
- [ ] Email signup
- [ ] Share buttons
- [ ] Progress indicators for engagement
- [ ] Reward preview (bonus lives, etc.)
- [ ] Skip button (subtle)

---

## 🎮 Phaser Scenes to KEEP

### GameScene.ts - THE ACTUAL GAME
**Status:** Keep in Phaser - this is real gameplay  
- [ ] Review for any UI that should be React overlays
- [ ] Extract HUD to React overlay (score, lives, wave)
- [ ] Keep physics, sprites, collisions in Phaser

### BootScene.ts - Asset Loading
**Status:** Keep but simplify  
- [ ] Loading screen could be React with progress bar
- [ ] Or keep simple Phaser preload

---

## 🧩 React Components to Create

### Layout Components
- [ ] `AppShell.tsx` - Main app wrapper with safe areas
- [ ] `MobileNav.tsx` - Bottom navigation (if needed)
- [ ] `Header.tsx` - Minimal header with back button

### Game Integration
- [ ] `GameCanvas.tsx` - ✅ Exists, refine
- [ ] `GameHUD.tsx` - React overlay for score/lives/wave
- [ ] `PauseMenu.tsx` - Pause overlay
- [ ] `PowerUpIndicator.tsx` - Active power-up display
- [ ] `FanMeter.tsx` - 12th Man meter display
- [ ] `ComboCounter.tsx` - Combo multiplier display

### Data Display
- [ ] `PlayerShowcase.tsx` - Reusable 3D player display
- [ ] `TeamLogo.tsx` - Team logos with fallback
- [ ] `StageCard.tsx` - Campaign stage info card
- [ ] `StatGrid.tsx` - Grid of stat displays

---

## 📁 Files to DELETE

### Phaser Scenes (Replace with React)
- [ ] `src/game/scenes/MenuScene.ts`
- [ ] `src/game/scenes/RosterScene.ts`
- [ ] `src/game/scenes/PlayerSelectScene.ts`
- [ ] `src/game/scenes/MapScene.ts`
- [ ] `src/game/scenes/GameOverScene.ts`
- [ ] `src/game/scenes/LeaderboardScene.ts`
- [ ] `src/game/scenes/StageTransitionScene.ts`
- [ ] `src/game/scenes/SuperBowlScene.ts`
- [ ] `src/game/scenes/EngageScene.ts`

### Phaser UI Systems (Replace with React components)
- [ ] `src/game/systems/PremiumUI.ts` - Move to React components

### Duplicate Pages
- [ ] `app/mockup/page.tsx` - Merge into PlayerSelect.tsx

---

## 🎨 Style Guidelines (Xbox/Madden/CoD Aesthetic)

### Color Palette
```
Primary:      #69BE28 (Action Green)
Primary Dark: #4a9c1c
Navy:         #002244
Navy Light:   #003055
White:        #FFFFFF
Glass BG:     rgba(255,255,255,0.05-0.1)
Glass Border: rgba(255,255,255,0.1)
Text Muted:   rgba(165,172,175,0.6)
```

### Typography
```
Display:  Bebas Neue / Oswald (all caps, tight tracking)
Body:     System font stack
Numbers:  Oswald (tabular, bold)
```

### Component Styles
```
Buttons:      Rounded-full (pill), gradient bg, glow shadow
Cards:        Rounded-2xl, glass bg, subtle border, backdrop-blur
Chips:        Rounded-full, small, gradient bg
Inputs:       Rounded-xl, glass bg, green focus ring
```

### Animations
```
Transitions:  150-300ms ease-out
Page Entry:   Fade + scale (400ms)
Buttons:      Scale on press (0.97)
Hover:        Glow intensity increase
Parallax:     8° rotation max, 15px translate max
```

### Mobile-First Rules
```
- Touch targets: min 48px
- Safe area insets: env(safe-area-inset-*)
- Prevent zoom: touch-action where needed
- Haptic feedback: navigator.vibrate()
- Bottom-heavy UI: Primary actions at thumb reach
- Video: poster fallback, muted autoplay
```

---

## 📋 Migration Order (Recommended)

### Phase 1: Foundation
1. [ ] Install dependencies (MUI, Framer Motion, fonts)
2. [ ] Create design tokens
3. [ ] Create base UI components (GlassCard, GradientButton, etc.)
4. [ ] Create VideoBackground component

### Phase 2: Core Flow
5. [ ] Reskin Home page (`/`)
6. [ ] Polish PlayerSelect (merge mockup code)
7. [ ] Delete mockup page
8. [ ] Create GameOver overlay
9. [ ] Create GameHUD overlay

### Phase 3: Campaign
10. [ ] Create CampaignMap component
11. [ ] Create StageTransition overlay
12. [ ] Create SuperBowlVictory overlay
13. [ ] Delete Phaser map/transition scenes

### Phase 4: Secondary
14. [ ] Create Leaderboard component
15. [ ] Create EngageModal
16. [ ] Create PauseMenu
17. [ ] Delete remaining Phaser scenes

### Phase 5: Cleanup
18. [ ] Remove unused Phaser scene files
19. [ ] Remove PremiumUI.ts
20. [ ] Update Phaser config (only GameScene + BootScene)
21. [ ] Performance audit
22. [ ] Mobile testing (iOS Safari, Android Chrome)

---

## 🧪 Testing Checklist

### Mobile Devices
- [ ] iPhone SE (small screen)
- [ ] iPhone 14 Pro (notch + dynamic island)
- [ ] iPhone 14 Pro Max (large screen)
- [ ] Android (various)
- [ ] iPad (tablet breakpoint)

### Interactions
- [ ] Touch responsiveness (no 300ms delay)
- [ ] Swipe gestures work smoothly
- [ ] Scroll momentum feels native
- [ ] No janky animations
- [ ] Video plays on iOS (muted autoplay)

### Performance
- [ ] 60fps animations
- [ ] No layout thrashing
- [ ] Images lazy loaded
- [ ] Bundle size reasonable
- [ ] First paint < 2s

---

## Current Tech Stack

**Framework:** Next.js 14  
**Styling:** Tailwind CSS 4  
**State:** Zustand  
**Game Engine:** Phaser 3 (gameplay only)  
**Audio:** Howler.js  

**To Add:**
- Material UI (MUI) v5
- Framer Motion
- Custom fonts (Bebas Neue, Oswald)

---

*Last Updated: January 30, 2026*
