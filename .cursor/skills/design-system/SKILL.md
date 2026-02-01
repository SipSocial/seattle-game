---
name: design-system
description: Seahawks Defense app design system with consistent buttons, spacing, typography, and layout patterns. Use when creating or editing UI components, styling pages, fixing layout issues, or adding new screens to ensure visual consistency.
---

# Dark Side Game Design System

This skill ensures consistent styling across all UI components using established design tokens and proper spacing.

## CRITICAL: 8-Point Grid System

**ALL spacing must use multiples of 8 pixels.** This is non-negotiable.

| Size | Value | Use Case |
|------|-------|----------|
| 4px | Micro | Icon gaps only |
| 8px | XS | Tight related elements |
| 12px | SM | Small padding |
| 16px | MD | Default button gaps, small sections |
| 24px | LG | Section padding, modal headers |
| 32px | XL | Major section breaks |
| 40px | 2XL | Large gaps |
| 48px | 3XL | Between stat groups |
| 56px | 4XL | Very large gaps |

## CRITICAL: Use Inline Styles for Spacing

**DO NOT use Tailwind spacing classes like `space-y-4`, `gap-3`, `mb-6` for layout-critical spacing.**

Instead, use explicit inline styles:

```tsx
// BAD - Tailwind classes are hard to debug and inconsistent
<div className="space-y-3 mb-6 gap-4">

// GOOD - Explicit pixel values, easy to verify
<div className="flex flex-col" style={{ gap: '16px' }}>
<div style={{ marginBottom: '32px' }}>
<div style={{ height: '24px' }} /> // Spacer
```

## Full-Screen Page Layout

Use flexbox with `justify-between` for three-zone layouts:

```tsx
<div className="fixed inset-0 bg-[#002244]">
  {/* Background layers */}
  <VideoBackground />
  
  {/* Gradient overlays */}
  <div className="absolute inset-0 z-[1] pointer-events-none">
    <div className="absolute inset-x-0 top-0 h-[200px]" 
         style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)' }} />
    <div className="absolute inset-x-0 bottom-0 h-[400px]" 
         style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)' }} />
  </div>

  {/* Content - three zones */}
  <div 
    className="relative z-10 h-full w-full flex flex-col justify-between"
    style={{
      paddingTop: 'calc(env(safe-area-inset-top, 0px) + 48px)',
      paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
      paddingLeft: '24px',
      paddingRight: '24px',
    }}
  >
    {/* TOP: Branding/Header */}
    <header className="text-center">...</header>

    {/* MIDDLE: Main content/buttons */}
    <main style={{ maxWidth: '340px', margin: '0 auto' }}>...</main>

    {/* BOTTOM: Footer/sponsor */}
    <footer className="text-center">...</footer>
  </div>
</div>
```

## Button Spacing

Buttons should have generous vertical spacing between them:

```tsx
{/* Primary buttons - 16px gap */}
<Link href="/campaign" style={{ display: 'block' }}>
  <GradientButton size="lg" fullWidth>Road to Super Bowl</GradientButton>
</Link>

<div style={{ height: '16px' }} />

<Link href="/play" style={{ display: 'block' }}>
  <GhostButton size="lg" fullWidth variant="green">Endless Mode</GhostButton>
</Link>

{/* Tertiary button - extra 8px separation */}
<div style={{ height: '24px' }} />

<Link href="/settings" style={{ display: 'block' }}>
  <GhostButton size="md" fullWidth variant="subtle">Settings</GhostButton>
</Link>
```

## Modal/Overlay Layout

```tsx
<motion.div className="fixed inset-0 z-50 flex items-center justify-center">
  {/* Backdrop */}
  <motion.div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

  {/* Content */}
  <motion.div 
    className="relative z-10 w-full px-6"
    style={{ maxWidth: '400px' }}
  >
    <GlassCard padding="lg" className="text-center">
      {/* Header - 32px below */}
      <div style={{ marginBottom: '32px' }}>
        <div className="text-5xl" style={{ marginBottom: '12px' }}>🏆</div>
        <h2 className="text-3xl font-black">Title</h2>
      </div>

      {/* Stats - 48px gaps between items */}
      <div className="flex justify-center" style={{ gap: '48px', marginBottom: '32px' }}>
        <StatDisplay value={100} label="Score" />
        <StatDisplay value={5} label="Wave" />
      </div>

      {/* Buttons - 16px gaps */}
      <div className="flex flex-col" style={{ gap: '16px' }}>
        <GradientButton size="lg" fullWidth>Primary</GradientButton>
        <GhostButton size="lg" fullWidth variant="green">Secondary</GhostButton>
      </div>
    </GlassCard>
  </motion.div>
</motion.div>
```

## Typography

| Element | Font | Size | Tracking |
|---------|------|------|----------|
| Hero/Logo | `--font-bebas` | 56px+ | tight |
| Title | `--font-oswald` | 28-36px | 0.1em |
| Subtitle | `--font-oswald` | 18-24px | 0.15em |
| Labels | default | 10-12px | 0.2em+ |
| Body | default | 14-16px | normal |

```tsx
// Hero text
<h1 style={{ fontFamily: 'var(--font-bebas), var(--font-oswald), sans-serif' }}>
  DARK SIDE
</h1>

// Stats/Numbers
<div style={{ 
  color: '#69BE28', 
  fontFamily: 'var(--font-oswald), sans-serif',
  fontSize: '32px',
  fontWeight: 900,
}}>
  1,234
</div>

// Labels
<span 
  className="text-[11px] uppercase tracking-widest"
  style={{ color: 'rgba(255,255,255,0.5)' }}
>
  Score
</span>
```

## Colors

```tsx
// Primary brand
'#002244'  // Navy (backgrounds)
'#69BE28'  // Green (accent, CTAs)
'#A5ACAF'  // Grey (muted text)

// Text opacity levels
'rgba(255,255,255,0.9)'  // Primary text
'rgba(255,255,255,0.5)'  // Secondary/labels
'rgba(255,255,255,0.2)'  // Very muted
'rgba(165,172,175,0.5)'  // Grey labels

// Gold sponsor
'rgba(255,215,0,0.4)'  // "Powered by"
```

## DrinkSip Sponsor Logo

Always use the SVG from CDN:

```tsx
{/* eslint-disable-next-line @next/next/no-img-element */}
<img 
  src="https://cdn.shopify.com/s/files/1/0407/8580/5468/files/DrinkSip_Logo_SVG.svg?v=1759624477"
  alt="DrinkSip"
  style={{ height: '48px', width: 'auto', opacity: 0.85 }}
/>
```

## Animation

Use Framer Motion with spring physics:

```tsx
const spring = { type: 'spring', stiffness: 300, damping: 28 }

// Page/modal entrance
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={spring}

// Scale entrance (logos, icons)
initial={{ scale: 0.9, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
```

## Checklist for New Pages/Modals

- [ ] Using `fixed inset-0` for full-screen layouts
- [ ] Safe area insets applied to padding
- [ ] Content width constrained (max-width: 340-420px)
- [ ] All spacing in 8px multiples using inline styles
- [ ] 16px minimum gap between buttons
- [ ] 32px gap between major sections
- [ ] 48px+ gap between stat groups
- [ ] Using design system fonts and colors
- [ ] DrinkSip logo from CDN (not text)
- [ ] Gradient overlays for background contrast
