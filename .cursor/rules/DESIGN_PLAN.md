# Seattle Seahawks Defense - Design Plan

## Project Vision

Create a **viral, mobile-first football game** that feels like **"Madden meets Call of Duty meets Xbox"** - premium, modern, and immersive. The game celebrates the Seattle Seahawks' "Dark Side" defense with photorealistic 3D player renders, cinematic animations, and a campaign journey to the Super Bowl.

---

## Design Philosophy

### Core Principles

1. **Mobile-First**: Every design decision prioritizes touch interaction and portrait/landscape mobile experience
2. **Premium Feel**: Xbox game store quality - dark themes, glass effects, smooth animations
3. **Buttery Smooth**: 60fps animations, no jank, responsive to touch at all times
4. **Immersive**: Leonardo AI-generated assets create photorealistic, atmospheric environments
5. **DrinksIP Integration**: Tasteful brand integration for DeMarcus Lawrence's DrinkSip beer brand

### Visual Direction

**Aesthetic**: Dark, dramatic, professional sports gaming
- Navy blue (#002244) as primary background
- Seahawks Action Green (#69BE28) as accent
- Glass morphism effects for UI panels
- Volumetric fog and stadium lighting for atmosphere
- Photorealistic 3D player renders (not cartoon/stylized)

---

## Design System

### Color Palette

```css
/* Primary - Seahawks */
--seahawks-navy: #002244;
--seahawks-green: #69BE28;
--seahawks-wolf-grey: #A5ACAF;

/* UI */
--navy-light: #1a3a5c;
--navy-dark: #001122;
--grey-text: #8b98a5;
--white: #ffffff;
--gold: #FFD700;

/* Semantic */
--success: #69BE28;
--danger: #ff4444;
--warning: #FFD700;
--info: #4BA3FF;

/* Gradients */
--gradient-navy: linear-gradient(180deg, #0a1628 0%, #001122 100%);
--gradient-green: linear-gradient(135deg, #69BE28 0%, #4a9c1c 100%);
--glass-bg: rgba(0, 34, 68, 0.8);
```

### Typography

```css
/* Display - Headers, player names, big text */
font-family: "Bebas Neue", "Impact", sans-serif;
letter-spacing: 0.1em;
text-transform: uppercase;

/* Body - Stats, descriptions, UI text */
font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
font-weight: 400;
```

### Component Library

| Component | Usage | Style |
|-----------|-------|-------|
| `GlassCard` | Containers, modals | Navy bg + border + blur |
| `GradientButton` | Primary CTAs | Green gradient + glow |
| `PositionChip` | Player positions | Pill shape, matches button |
| `StatLabel` | Player stats | Muted grey, small caps |

---

## Page Designs

### 1. Home Page (`/`)

**Purpose**: Marketing landing, first impression

**Layout**:
```
┌─────────────────────────────────────┐
│  LOGO                    [PLAY NOW] │
├─────────────────────────────────────┤
│                                     │
│    SEATTLE SEAHAWKS                 │
│    DARKSIDE DEFENSE                 │
│                                     │
│    [Hero Image/Video]               │
│                                     │
│    Road to Super Bowl LX            │
│                                     │
├─────────────────────────────────────┤
│    Feature Cards (3)                │
│    - Campaign Mode                  │
│    - Endless Mode                   │
│    - Leaderboard                    │
├─────────────────────────────────────┤
│    [PLAY NOW - Full Width Button]   │
└─────────────────────────────────────┘
```

### 2. Player Selection (`/play` → PlayerSelect)

**Purpose**: Choose your defender with immersive 3D interaction

**Layout**:
```
┌─────────────────────────────────────┐
│  CHOOSE YOUR DEFENDER               │
├─────────────────────────────────────┤
│                                     │
│    [Animated Video Background]      │
│                                     │
│    ┌─────────────────────────────┐  │
│    │                             │  │
│    │   [Player Image]            │  │
│    │   3D Rotation on Touch      │  │
│    │                             │  │
│    └─────────────────────────────┘  │
│                                     │
│    < ○ ○ ● ○ ○ >  (Pagination)     │
│                                     │
│    [Position Badge]                 │
│    PLAYER NAME                      │
│    Stats: FF | SACKS | TACKLES      │
│                                     │
│    [SELECT PLAYER Button]           │
└─────────────────────────────────────┘
```

**Interactions**:
- Swipe left/right to change players
- Touch and drag player for 3D rotation
- Smooth spring-back animation on release
- Stats appear with staggered animation

### 3. Campaign Map (`/campaign`)

**Purpose**: Road to Super Bowl journey visualization

**Layout**:
```
┌─────────────────────────────────────┐
│  ROAD TO THE SUPER BOWL    [Back]   │
├─────────────────────────────────────┤
│                                     │
│    [US Map - Leonardo Generated]    │
│    [Video Background - Animated]    │
│                                     │
│    ○ Seattle (Week 1)               │
│    ├── Pittsburgh                   │
│    ├── New Orleans                  │
│    ├── ... (stages)                 │
│    └── San Francisco (Super Bowl)   │
│                                     │
│    [Dark Side Plane - 3D Draggable] │
│                                     │
├─────────────────────────────────────┤
│    Stage Preview Modal              │
│    - City background                │
│    - Opponent info                  │
│    - Weather/difficulty             │
│    [PLAY GAME Button]               │
└─────────────────────────────────────┘
```

### 4. Stage Transition

**Purpose**: Cinematic entry to each game

**Layout**:
```
┌─────────────────────────────────────┐
│                                     │
│    [Dark Side Plane Video]          │
│    (Flying in animation)            │
│                                     │
│    vs                               │
│                                     │
│    SEATTLE SEAHAWKS                 │
│    Dark Side Defense                │
│                                     │
│    vs                               │
│                                     │
│    SAN FRANCISCO 49ERS              │
│    Week 1 • Lumen Field             │
│                                     │
│    [Loading indicator]              │
│                                     │
└─────────────────────────────────────┘
```

### 5. Gameplay (GameScene - Phaser)

**Purpose**: Core game mechanics

**HUD Layout**:
```
┌─────────────────────────────────────┐
│  Wave 3/5        Score: 12,450      │
│  ❤️❤️❤️                              │
├─────────────────────────────────────┤
│                                     │
│         [GAMEPLAY AREA]             │
│                                     │
│    Runners come from top            │
│    Player defender at bottom        │
│    Drag to move                     │
│                                     │
├─────────────────────────────────────┤
│  [Megaphone Power-up Meter]         │
│  ████████████░░░░░░ 75%             │
└─────────────────────────────────────┘
```

---

## Animation Guidelines

### Timing Functions

```css
/* Standard ease - most transitions */
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
duration: 300ms;

/* Spring - interactive elements, player rotation */
type: spring
stiffness: 400
damping: 30

/* Dramatic - stage transitions, reveals */
duration: 600ms
ease: [0.22, 1, 0.36, 1]
```

### Animation Principles

1. **Staggered entries**: Children animate in sequence (50-100ms delay)
2. **Spring physics**: Interactive elements use spring, not easing
3. **GPU acceleration**: Always use `transform` and `opacity`
4. **Reduced motion**: Respect `prefers-reduced-motion`

### Touch Interaction

```typescript
// Player 3D rotation implementation
const lerp = (start, end, factor) => start + (end - start) * factor

// Use requestAnimationFrame for smooth 60fps
function animate() {
  currentX.current = lerp(currentX.current, targetX.current, 
    isTouching ? 0.15 : 0.08)
  
  element.style.transform = `
    perspective(1000px)
    rotateY(${currentX.current * 15}deg)
    rotateX(${currentY.current * -10}deg)
  `
  
  requestAnimationFrame(animate)
}
```

---

## Leonardo AI Asset Generation

### Asset Types

| Asset | Prompt Style | Resolution | Format |
|-------|-------------|------------|--------|
| Player Portraits | Photorealistic 3D, Madden NFL 25 quality | 1024x1024 | PNG (transparent) |
| Stadium Backgrounds | Dark dramatic, volumetric fog, spotlights | 1920x1080 | Video (MP4) |
| Map Background | US map at night, tactical military theme | 1920x1080 | Image/Video |
| Team Plane | Boeing 737, "Dark Side" branding | 1024x512 | PNG (transparent) |
| City Backgrounds | Photorealistic skylines, dusk/night | 1920x1080 | Image |

### Generation Workflow

1. **Admin page** (`/admin/players`) generates options
2. **User selects** preferred variants
3. **Selections stored** in `playerImages.ts` / `campaignAssets.ts`
4. **Production uses** CDN-hosted Leonardo URLs

### Prompt Templates

**Player Portrait**:
```
Photorealistic 3D render of NFL football player [NAME] #[NUMBER], 
Seattle Seahawks, [POSITION], FULL BODY visible from helmet to knees, 
[UNIQUE_POSE], muscular [HEIGHT] [WEIGHT] [BUILD] build, 
dark dramatic football stadium background with billowing fog and smoke, 
spotlight from above, wet turf reflecting lights, 
Madden NFL 25 game quality, 8K ultra photorealistic
```

**Stadium Background**:
```
Dark dramatic NFL football stadium at night, empty field, 
volumetric fog drifting across turf, powerful spotlight beams, 
stadium lights in distance, moody blue teal lighting, 
Seahawks navy blue with Action Green accents, boss entrance vibe,
cinematic sports photography, 8K
```

---

## Mobile-First Responsive Design

### Breakpoints

```css
/* Mobile (default) */
max-width: 100%

/* Tablet */
@media (min-width: 768px) { }

/* Desktop */
@media (min-width: 1024px) { }
```

### Touch Targets

- Minimum size: 44x44 pixels (Apple HIG)
- Buttons: `min-h-12` (48px) for primary actions
- Spacing: `gap-4` minimum between touchable elements

### Safe Areas

```css
/* iOS notch/home indicator */
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
```

### Orientation Handling

- **Portrait**: Menus, player selection, campaign map
- **Landscape**: Core gameplay (with RotateOverlay for portrait)

---

## Implementation Priorities

### Phase 1: Core Experience ✅
- [x] Player selection with 3D rotation
- [x] Animated video backgrounds
- [x] Campaign map with stage selection
- [x] Stage transition animations
- [x] Core gameplay mechanics

### Phase 2: Polish ✅
- [x] Smooth touch interactions (lerp + RAF)
- [x] Position chip redesign
- [x] Location picker modal for overlapping cities
- [x] Dark Side plane with 3D interaction
- [x] Plane animation video

### Phase 3: Enhanced Assets
- [ ] All 11 defenders with accurate likenesses
- [ ] Reference photo-based generation
- [ ] DrinkSip jersey variants
- [ ] All opponent team helmets

### Phase 4: Engagement
- [ ] Leaderboard integration
- [ ] Social sharing
- [ ] Achievement system
- [ ] DrinkSip e-commerce end screen

---

## Quality Checklist

### Before Each Deploy
- [ ] No TypeScript errors in build
- [ ] Touch interactions smooth on mobile
- [ ] Animations don't jank
- [ ] Videos autoplay on mobile
- [ ] No overlapping UI elements
- [ ] Safe area padding correct
- [ ] All images load (no broken CDN links)

### Performance Targets
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Performance: > 80
- No layout shifts (CLS < 0.1)
