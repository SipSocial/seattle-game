---
name: dark-side-ux
description: Dark Side Football UX patterns for Coinbase-level polish, mobile-first gaming experiences, and premium sports brand feel. Use when building or editing UI to ensure consistent, high-quality user experience.
---

# Dark Side UX Design System

Premium mobile-first UX system combining Coinbase-level polish with gaming excitement and Nike-tier sports aesthetics.

---

## 1. DESIGN PHILOSOPHY

### Core Principles

1. **Coinbase-Level Polish** - Every interaction should feel considered, refined, and trustworthy
2. **Mobile-First Always** - Design for 375px viewport first, enhance for larger screens
3. **App-Like Experience** - Full-screen layouts, native gestures, no browser chrome feel
4. **Premium Sports Brand** - Nike, Madden, EA Sports quality in every detail
5. **Gaming Excitement** - Audio feedback, haptics, cinematic animations, reward moments

### Critical Rules

- **NEVER use emojis** - Always use Lucide icons or custom SVG icons
- **NEVER hardcode colors** - Always use CSS custom properties
- **NEVER hardcode font sizes** - Always use design token typography scale
- **NEVER use spinners** - Use skeleton loading states
- **NEVER open new tabs** - Use modals and bottom sheets

---

## 2. COLOR SYSTEM

All colors come from `globals.css` CSS custom properties.

### Primary Brand Colors

```css
--seahawks-navy: #002244      /* Primary backgrounds */
--seahawks-green: #69BE28     /* Accent, CTAs, success states */
--seahawks-grey: #A5ACAF      /* Muted text, disabled states */
--seahawks-white: #FFFFFF     /* Primary text */
```

### Extended Palette

```css
--seahawks-navy-light: #003366
--seahawks-navy-dark: #001a33
--seahawks-green-light: #8BD44A
--seahawks-green-dark: #4A9A1C
--seahawks-grey-light: #C4CACC
--seahawks-grey-dark: #7A8285
```

### Accent Colors

```css
--accent-gold: #FFD700        /* Premium, sponsor, special CTAs */
--accent-silver: #C0C0C0      /* Leaderboard 2nd place */
--accent-bronze: #CD7F32      /* Leaderboard 3rd place */
```

### Glass & Transparency

```css
--glass-white: rgba(255, 255, 255, 0.08)
--glass-white-hover: rgba(255, 255, 255, 0.12)
--glass-border: rgba(255, 255, 255, 0.15)
--shadow-glow: rgba(105, 190, 40, 0.4)
```

### Text Opacity Levels

```tsx
// Use for text hierarchy
'rgba(255, 255, 255, 0.95)'  // Primary text, headlines
'rgba(255, 255, 255, 0.9)'   // Body text
'rgba(255, 255, 255, 0.7)'   // Secondary text
'rgba(255, 255, 255, 0.5)'   // Labels, captions
'rgba(255, 255, 255, 0.3)'   // Very muted, legal text
'rgba(255, 215, 0, 0.7)'     // Gold accent text (sponsors)
```

---

## 3. TYPOGRAPHY SYSTEM

### Fluid Typography Scale (Use These)

```tsx
// Semantic sizes - preferred for all text
style={{ fontSize: 'var(--text-hero)' }}     // clamp(3rem, 2rem + 8vw, 7rem)
style={{ fontSize: 'var(--text-title)' }}    // clamp(1.75rem, 1rem + 5vw, 3.5rem)
style={{ fontSize: 'var(--text-subtitle)' }} // clamp(1rem, 0.75rem + 2vw, 1.75rem)
style={{ fontSize: 'var(--text-body)' }}     // clamp(0.875rem, 0.8rem + 0.5vw, 1rem)
style={{ fontSize: 'var(--text-caption)' }}  // clamp(0.6875rem, ... 0.8125rem)
style={{ fontSize: 'var(--text-micro)' }}    // clamp(0.5625rem, ... 0.6875rem)
```

### Modular Step Scale (For Precise Control)

```tsx
style={{ fontSize: 'var(--step-0)' }}   // 1rem base
style={{ fontSize: 'var(--step-1)' }}   // 1.2x
style={{ fontSize: 'var(--step-2)' }}   // 1.44x
style={{ fontSize: 'var(--step-3)' }}   // 1.728x
style={{ fontSize: 'var(--step-4)' }}   // 2.07x
style={{ fontSize: 'var(--step-5)' }}   // 2.49x
```

### Font Families

```tsx
// Display/Hero text (logos, big headlines)
fontFamily: 'var(--font-bebas), var(--font-oswald), sans-serif'

// Headings and buttons
fontFamily: 'var(--font-oswald), sans-serif'

// Body text
fontFamily: 'var(--font-inter), sans-serif'
```

### Text Styling Examples

```tsx
// Hero headline
<h1 
  className="font-display"
  style={{ 
    fontSize: 'var(--text-hero)',
    lineHeight: 0.9,
    letterSpacing: '0.02em',
  }}
>
  THE DARK SIDE
</h1>

// Section title
<h2
  style={{
    fontSize: 'var(--text-title)',
    fontFamily: 'var(--font-oswald), sans-serif',
    fontWeight: 700,
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.9)',
  }}
>
  Game Stats
</h2>

// Caption/label
<span
  style={{
    fontSize: 'var(--text-caption)',
    fontWeight: 500,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.5)',
  }}
>
  Total Score
</span>
```

### Text Gradients

```tsx
// Seahawks green gradient text
<span
  style={{
    background: 'linear-gradient(135deg, #69BE28 0%, #8BD44A 50%, #FFFFFF 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  }}
>
  VICTORY
</span>

// Hero text with glow
<h1
  style={{
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 40%, #69BE28 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    filter: 'drop-shadow(0 6px 60px rgba(105, 190, 40, 0.5))',
  }}
>
  THE DARK SIDE
</h1>
```

---

## 4. SPACING SYSTEM

### Static Spacing (8px Base Unit)

```tsx
--space-1: 4px     --space-6: 24px
--space-2: 8px     --space-8: 32px
--space-3: 12px    --space-10: 40px
--space-4: 16px    --space-12: 48px
--space-5: 20px    --space-16: 64px
```

### Fluid Spacing (Viewport-Responsive)

```tsx
style={{ padding: 'var(--space-fluid-xs)' }}   // clamp(0.5rem, 0.25rem + 1vw, 0.75rem)
style={{ gap: 'var(--space-fluid-sm)' }}       // clamp(0.75rem, 0.5rem + 1.5vw, 1.25rem)
style={{ margin: 'var(--space-fluid-md)' }}    // clamp(1rem, 0.75rem + 2vw, 1.75rem)
style={{ padding: 'var(--space-fluid-lg)' }}   // clamp(1.5rem, 1rem + 3vw, 2.5rem)
style={{ gap: 'var(--space-fluid-xl)' }}       // clamp(2rem, 1.5rem + 4vw, 4rem)
style={{ margin: 'var(--space-fluid-2xl)' }}   // clamp(3rem, 2rem + 6vw, 6rem)
```

### Standard Spacing Rules

| Context | Spacing |
|---------|---------|
| Between buttons | 16px (var(--space-4)) |
| Between major sections | 32px (var(--space-8)) |
| Between stat groups | 48px (var(--space-12)) |
| Page horizontal padding | 24px |
| Card internal padding | 16-24px |

---

## 5. LAYOUT PATTERNS

### Three-Zone Full-Screen Layout

The signature layout pattern: sponsor header, main content, action footer.

```tsx
<div className="fixed inset-0 overflow-hidden" style={{ background: '#002244' }}>
  {/* Background layer */}
  <VideoBackground src="/video.mp4" />
  
  {/* Gradient overlays */}
  <div className="absolute inset-0 z-[1] pointer-events-none">
    <div 
      className="absolute inset-x-0 top-0"
      style={{ 
        height: '35%',
        background: 'linear-gradient(180deg, rgba(0,10,20,0.95) 0%, rgba(0,10,20,0.7) 40%, transparent 100%)',
      }}
    />
    <div 
      className="absolute inset-x-0 bottom-0"
      style={{ 
        height: '60%',
        background: 'linear-gradient(0deg, rgba(0,10,20,0.98) 0%, rgba(0,10,20,0.85) 35%, transparent 100%)',
      }}
    />
  </div>

  {/* Content - three zones */}
  <div className="relative z-10 h-full w-full flex flex-col">
    {/* TOP: Branding/Header */}
    <header
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 32px)',
        paddingLeft: '24px',
        paddingRight: '24px',
      }}
    >
      {/* Sponsor logo, app title */}
    </header>

    {/* MIDDLE: Flexible spacer */}
    <div className="flex-1" />

    {/* HERO: Main content */}
    <main
      className="text-center"
      style={{ paddingLeft: '24px', paddingRight: '24px' }}
    >
      {/* Hero headline, subtitle, value prop */}
    </main>

    {/* BOTTOM: CTA zone */}
    <footer
      style={{
        paddingTop: '40px',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)',
        paddingLeft: '24px',
        paddingRight: '24px',
      }}
    >
      <div style={{ maxWidth: '360px', margin: '0 auto' }}>
        <GradientButton size="lg" fullWidth>Primary Action</GradientButton>
      </div>
    </footer>
  </div>
</div>
```

### Safe Area Handling

Always account for device notches and home indicators:

```tsx
// Top safe area (notch)
paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)'

// Bottom safe area (home indicator)
paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)'

// Use CSS utility classes
className="safe-area-top safe-area-bottom"
className="safe-area-all"
```

### Content Width Constraints

```tsx
// Button containers
style={{ maxWidth: '360px', margin: '0 auto' }}

// Card containers  
style={{ maxWidth: '400px', margin: '0 auto' }}

// Wide content
style={{ maxWidth: '500px', margin: '0 auto' }}

// Use design tokens
style={{ maxWidth: 'var(--container-content)' }}  // 400px
style={{ maxWidth: 'var(--container-lg)' }}       // 512px
```

---

## 6. ANIMATION PATTERNS

### Spring Physics (Default)

Use spring physics for all motion - feels more natural than easing.

```tsx
import { motion } from 'framer-motion'

// Standard spring (most uses)
const spring = { type: 'spring', stiffness: 300, damping: 28 }

// Snappy spring (buttons, interactions)
const springSnappy = { type: 'spring', stiffness: 400, damping: 25 }

// Heavy spring (large elements, modals)
const springHeavy = { type: 'spring', stiffness: 200, damping: 20 }
```

### Entrance Animations

```tsx
// Fade + slide up (default entrance)
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={spring}
>

// Scale entrance (logos, icons)
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={spring}
>

// Slide from bottom (sheets, cards)
<motion.div
  initial={{ y: '100%' }}
  animate={{ y: 0 }}
  transition={spring}
>
```

### Staggered Entrances

```tsx
const STAGGER = {
  logo: 0.2,
  title: 0.4,
  subtitle: 0.6,
  cta: 0.8,
  footer: 1.0,
}

<motion.h1
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ ...spring, delay: STAGGER.title }}
>
```

### Hover & Tap States

```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.97 }}
  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
>
```

### Exit Animations

```tsx
import { AnimatePresence } from 'framer-motion'

<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={spring}
    >
      {/* Content */}
    </motion.div>
  )}
</AnimatePresence>
```

---

## 7. HAPTIC FEEDBACK

Trigger haptic feedback on key interactions for native feel.

```tsx
// Standard haptic helper
const triggerHaptic = () => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(10)  // Short tap
  }
}

// Pattern for buttons (CTA moment)
const triggerHapticCTA = () => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([20, 40, 20])  // Success pattern
  }
}

// Use on interactions
const handlePress = () => {
  triggerHaptic()
  // ... action
}
```

---

## 8. COMPONENT LIBRARY

### Buttons

```tsx
import { GradientButton, GhostButton } from '@/components/ui'

// Primary CTA - green gradient, glow shadow
<GradientButton size="lg" fullWidth>
  Enter Giveaway
</GradientButton>

// Secondary action - glass morphism
<GhostButton size="lg" fullWidth variant="green">
  View Picks
</GhostButton>

// Tertiary/subtle action
<GhostButton size="md" fullWidth variant="subtle">
  Settings
</GhostButton>

// Button with icon
<GradientButton size="lg" icon={<ChevronRight />} iconPosition="right">
  Continue
</GradientButton>

// Button sizes: 'sm' | 'md' | 'lg' | 'xl'
// Button radii: 'sm' | 'md' | 'lg' | 'full' (default)
```

### Cards

```tsx
import { GlassCard } from '@/components/ui'

// Default glass card
<GlassCard padding="lg">
  {/* Content */}
</GlassCard>

// Green variant (for success/highlight)
<GlassCard variant="green" padding="md">
  {/* Content */}
</GlassCard>

// Dark variant (for overlays)
<GlassCard variant="dark" blur="lg">
  {/* Content */}
</GlassCard>

// With hover effect
<GlassCard hover padding="md">
  {/* Clickable content */}
</GlassCard>
```

### Bottom Sheet

```tsx
import { BottomSheet } from '@/components/ui'

<BottomSheet
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Select Option"
>
  {/* Content */}
</BottomSheet>
```

### Toast Notifications

```tsx
import { Toast } from '@/components/ui'

<Toast
  message="Pick submitted successfully!"
  variant="success"  // 'success' | 'error' | 'info'
  isVisible={showToast}
  onClose={() => setShowToast(false)}
  duration={3000}
/>
```

### Bottom Navigation

```tsx
import { BottomNav } from '@/components/ui'

<BottomNav
  currentTab={activeTab}
  onTabChange={(tab) => setActiveTab(tab)}
/>
// Tabs: 'game' | 'picks' | 'live' | 'leaderboard' | 'profile'
```

### Video Background

```tsx
import { VideoBackground } from '@/components/ui'

<VideoBackground
  src="/video.mp4"
  poster="/poster.jpg"
  overlay={true}
  overlayOpacity={0.3}
/>
```

---

## 9. AUDIO FEEDBACK

Use AudioManager for consistent sound design.

```tsx
import { AudioManager } from '@/src/game/systems/AudioManager'

// Button clicks (auto-wired in GradientButton/GhostButton)
AudioManager.playConfirm()     // Primary button
AudioManager.playMenuClick()   // Secondary button

// Game events
AudioManager.playSuccess()     // Win/achievement
AudioManager.playError()       // Error/failure
```

---

## 10. STATE MANAGEMENT

Use Zustand for all client state.

```tsx
import { create } from 'zustand'

// Store pattern
interface GameStore {
  score: number
  addScore: (points: number) => void
}

export const useGameStore = create<GameStore>((set) => ({
  score: 0,
  addScore: (points) => set((state) => ({ score: state.score + points })),
}))

// Usage in component
const { score, addScore } = useGameStore()
```

### Available Stores

- `v5GameStore` - Main game state
- `picksStore` - Prop picks state
- `liveStore` - Live game Q&A state
- `claimStore` - Prize claiming flow
- `scanStore` - Receipt scanning state

---

## 11. SPONSOR BRANDING

### DrinkSip Logo

Always use the official SVG from CDN:

```tsx
{/* eslint-disable-next-line @next/next/no-img-element */}
<img 
  src="https://cdn.shopify.com/s/files/1/0407/8580/5468/files/DrinkSip_Logo_SVG.svg?v=1759624477"
  alt="DrinkSip"
  style={{ 
    height: 'clamp(48px, 10vw, 72px)', 
    width: 'auto',
    filter: 'drop-shadow(0 4px 20px rgba(255, 215, 0, 0.3))',
  }}
/>
```

### Sponsor Text Styling

```tsx
// "Powered by" style
<span
  style={{
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '0.35em',
    textTransform: 'uppercase',
    color: 'rgba(255, 215, 0, 0.7)',
  }}
>
  DrinkSip presents...
</span>

// Secondary sponsor credits
<p
  style={{
    fontSize: '9px',
    fontWeight: 500,
    letterSpacing: '0.25em',
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.45)',
  }}
>
  Presented by KJR Radio & Simply Seattle
</p>
```

---

## 12. ANTI-PATTERNS (NEVER DO)

### Colors

```tsx
// BAD - Hardcoded colors
className="bg-gray-200 text-blue-600"
style={{ color: '#333', background: '#f5f5f5' }}

// GOOD - Design tokens
style={{ color: 'var(--seahawks-green)', background: 'var(--seahawks-navy)' }}
className="bg-seahawks-navy text-seahawks-green"
```

### Typography

```tsx
// BAD - Hardcoded font sizes
style={{ fontSize: '16px' }}
className="text-lg"

// GOOD - Design token scale
style={{ fontSize: 'var(--text-body)' }}
className="text-body"
```

### Icons

```tsx
// BAD - Emojis
<span>🏈 Football</span>
<span>✅ Complete</span>

// GOOD - Lucide icons or custom SVG
import { Trophy, Check, Football } from 'lucide-react'
<Trophy size={24} color="#69BE28" />
<Check size={20} />
```

### Loading States

```tsx
// BAD - Spinner
<div className="animate-spin">⏳</div>
<Spinner />

// GOOD - Skeleton loading
<div 
  className="animate-pulse rounded-lg"
  style={{ 
    width: '100%', 
    height: '48px',
    background: 'rgba(255, 255, 255, 0.1)',
  }}
/>
```

### Navigation

```tsx
// BAD - Opens new tab
<a href="/page" target="_blank">Link</a>

// GOOD - In-app navigation
import Link from 'next/link'
<Link href="/page">Link</Link>

// For external content, use modals
<BottomSheet isOpen={showRules} onClose={() => setShowRules(false)}>
  {/* Rules content */}
</BottomSheet>
```

### Spacing

```tsx
// BAD - Arbitrary values
style={{ margin: '17px', padding: '13px' }}

// GOOD - 8px grid or design tokens
style={{ margin: 'var(--space-4)', padding: 'var(--space-3)' }}
style={{ margin: '16px', padding: '12px' }}  // 8px multiples OK
```

---

## 13. ACCESSIBILITY

### Touch Targets

All interactive elements must be at least 48x48px:

```tsx
style={{
  minWidth: '48px',
  minHeight: '48px',
}}
```

### Motion Sensitivity

Respect user preferences for reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Tap Highlight

Disable default tap highlight for native feel:

```tsx
style={{
  WebkitTapHighlightColor: 'transparent',
}}
```

---

## 14. REFERENCE FILES

Study these files for pattern examples:

| Pattern | File |
|---------|------|
| Splash/landing page | `app/v5/(onboarding)/splash/page.tsx` |
| Three-zone layout | `app/page.tsx` |
| Form pattern | `app/v5/(onboarding)/register/page.tsx` |
| Bottom navigation | `components/ui/BottomNav.tsx` |
| Primary button | `components/ui/GradientButton.tsx` |
| Secondary button | `components/ui/GhostButton.tsx` |
| Glass cards | `components/ui/GlassCard.tsx` |
| Bottom sheet modal | `components/ui/BottomSheet.tsx` |
| Toast notifications | `components/ui/Toast.tsx` |
| Video background | `components/ui/VideoBackground.tsx` |
| Design tokens | `app/globals.css` |

---

## 15. CHECKLIST FOR NEW PAGES

Before considering a page complete, verify:

- [ ] Using `fixed inset-0` for full-screen layouts
- [ ] Safe area insets applied to top/bottom padding
- [ ] Content width constrained (max-width: 360-400px for CTAs)
- [ ] All spacing uses design tokens or 8px multiples
- [ ] All colors use CSS custom properties
- [ ] All font sizes use typography scale tokens
- [ ] No emojis anywhere - using Lucide icons instead
- [ ] Gradient overlays for background contrast
- [ ] Spring physics on all Framer Motion animations
- [ ] Staggered entrance animations for hero content
- [ ] Buttons have hover/tap states with scale transforms
- [ ] Haptic feedback on key interactions
- [ ] Audio feedback on button presses
- [ ] Touch targets minimum 48x48px
- [ ] Bottom sheets for modals (not new tabs)
- [ ] Loading states use skeletons (not spinners)
- [ ] DrinkSip logo from CDN (not text)
