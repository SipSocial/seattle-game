---
name: design-tokens
description: Dark Side Football design tokens - colors, typography, spacing. Reference when building UI.
---

# Design Tokens

## Colors

```css
/* Primary */
--seahawks-navy: #002244
--seahawks-green: #69BE28
--seahawks-grey: #A5ACAF

/* Accent */
--gold: #FFD700
--gold-dark: #FFA500

/* Text */
--text-primary: rgba(255,255,255,0.9)
--text-secondary: rgba(255,255,255,0.5)
--text-muted: rgba(255,255,255,0.3)

/* Borders */
--border: rgba(255,255,255,0.1)
--border-green: rgba(105,190,40,0.3)

/* Glass */
--glass: rgba(0,34,68,0.6)
--glass-light: rgba(0,34,68,0.4)
```

## Typography

```css
/* Fluid Scale */
--text-hero: clamp(3rem, 2rem + 8vw, 7rem)
--text-title: clamp(1.75rem, 1rem + 5vw, 3.5rem)
--text-subtitle: clamp(1rem, 0.75rem + 2vw, 1.75rem)
--text-body: clamp(0.875rem, 0.8rem + 0.5vw, 1rem)
--text-caption: clamp(0.6875rem, ... 0.8125rem)
--text-micro: clamp(0.5625rem, ... 0.6875rem)

/* Fonts */
--font-bebas: 'Bebas Neue', sans-serif  /* Heroes */
--font-oswald: 'Oswald', sans-serif     /* Titles */
```

## Spacing

```css
/* Fluid */
--space-fluid-xs: clamp(0.5rem, 0.25rem + 1vw, 0.75rem)
--space-fluid-sm: clamp(0.75rem, 0.5rem + 1.5vw, 1.25rem)
--space-fluid-md: clamp(1rem, 0.75rem + 2vw, 1.75rem)
--space-fluid-lg: clamp(1.5rem, 1rem + 3vw, 2.5rem)
--space-fluid-xl: clamp(2rem, 1.5rem + 4vw, 4rem)

/* Static (8px grid) */
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 20px
--space-6: 24px
--space-8: 32px
```

## Animation

```tsx
// Spring config
const spring = { type: 'spring', stiffness: 300, damping: 28 }
const springHeavy = { type: 'spring', stiffness: 200, damping: 22 }

// Entry animation
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={spring}
```

## Component Patterns

### GlassCard
```tsx
style={{
  background: 'rgba(0,34,68,0.6)',
  backdropFilter: 'blur(20px)',
  borderRadius: '16px',
  border: '1px solid rgba(255,255,255,0.1)',
}}
```

### Gradient Text
```tsx
style={{
  background: 'linear-gradient(180deg, #FFFFFF 20%, #69BE28 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}}
```

### Gold Button
```tsx
style={{
  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
  color: '#002244',
  boxShadow: '0 4px 20px rgba(255,215,0,0.3)',
}}
```

### Green Button
```tsx
style={{
  background: 'linear-gradient(135deg, #69BE28 0%, #7DD33B 100%)',
  color: '#002244',
  boxShadow: '0 4px 20px rgba(105,190,40,0.3)',
}}
```

## Icons

Always use Lucide React:
```tsx
import { Trophy, Shield, Lock } from 'lucide-react'

<Trophy size={20} color="#FFD700" />
```

Never use emojis in UI.

## Safe Areas

```tsx
style={{
  paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
  paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
}}
```
