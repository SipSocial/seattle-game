# Seattle Seahawks Defense - Team Rules

## Overview

These rules are mandatory for all agents (human and AI) working on the Seattle Seahawks Defense game. Following these ensures consistency, quality, and prevents recurring bugs.

---

## 🚨 Critical Rules (Never Break)

### 1. Port Configuration
```
ALWAYS run on localhost:3004
```
- The `package.json` is configured for port 3004
- Never change to 3000 or any other port
- If port is in use, kill existing processes first

### 2. React UI, Phaser Gameplay
```
React handles ALL UI
Phaser handles ONLY core gameplay
```
- **React**: Player selection, campaign map, menus, modals, overlays, transitions
- **Phaser**: Collision detection, physics, scoring, wave management
- NEVER render UI with Phaser (use React overlays instead)

### 3. Mobile-First
```
Design for mobile FIRST, desktop second
```
- Touch targets minimum 44x44px
- Test all interactions on mobile
- Use `touch-action: none` for custom touch handling
- Safe area padding for iOS notches

### 4. TypeScript Strict
```
NO TypeScript errors allowed in production
```
- Fix all errors before committing
- Use proper type annotations
- Don't use `any` unless absolutely necessary

### 5. No NFL Branding Issues
```
Real team references allowed (per license)
No unauthorized logos or trademarks
```
- Can use: Seattle Seahawks, player names, jersey numbers
- Cannot use: Unauthorized team logos, NFL shield
- DrinkSip brand integration is authorized

---

## 📋 Code Standards

### File Naming
```
Components: PascalCase.tsx (PlayerSelect.tsx)
Pages: lowercase with hyphens (page.tsx in folders)
Utils: camelCase.ts (backgroundCache.ts)
Data: camelCase.ts (campaignAssets.ts)
```

### Component Structure
```typescript
// 1. Imports (external, internal, types)
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '@/src/store/gameStore'
import type { Player } from '@/types'

// 2. Types/Interfaces
interface ComponentProps {
  player: Player
  onSelect: (id: string) => void
}

// 3. Component
export function ComponentName({ player, onSelect }: ComponentProps) {
  // hooks
  // state
  // effects
  // handlers
  // render
}
```

### State Management
```typescript
// Use Zustand for global state
const { score, updateScore } = useGameStore()

// Use local state for component-specific UI
const [isOpen, setIsOpen] = useState(false)

// Don't duplicate state between Zustand and React
```

### Animation Standards
```typescript
// Use Framer Motion for React animations
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
/>

// For touch interactions: requestAnimationFrame + lerp
// NEVER use CSS transitions for rapid touch updates
```

---

## 🎨 Design Rules

### Colors
Always use design tokens from `phaserConfig.ts`:
```typescript
import { COLORS, hexToCSS } from '@/src/game/config/phaserConfig'

// In Phaser
this.add.graphics().fillStyle(COLORS.green, 1)

// In React (convert to CSS)
style={{ color: hexToCSS(COLORS.green) }}
// Or use Tailwind classes that match
className="text-[#69BE28]"
```

### Tailwind Classes
```css
/* Preferred: Use Tailwind utilities */
className="bg-[#002244] text-white px-4 py-2 rounded-full"

/* Avoid: Inline styles (unless dynamic) */
style={{ backgroundColor: '#002244' }} // Only for dynamic values
```

### Spacing
```css
/* Use Tailwind scale */
p-4  /* 16px */
p-6  /* 24px */
p-8  /* 32px */

/* Don't mix arbitrary values unless necessary */
p-[13px] /* Avoid - use p-3 or p-4 instead */
```

---

## 🔧 Development Workflow

### Before Starting Work
1. Pull latest from main: `git pull origin master`
2. Check for running servers: `npx lsof -i :3004`
3. Read relevant documentation in `.cursor/rules/`
4. Check existing TODOs if any

### Making Changes
1. One logical change per commit
2. Test on mobile (real device or browser devtools)
3. Check for TypeScript errors: `npm run build`
4. Check for linter errors: `npx eslint .`

### Committing
```bash
# Good commit messages
"Add 3D touch rotation to player selection"
"Fix overlapping city markers on campaign map"
"Update roster with 2025 player data"

# Bad commit messages
"fixes"
"update"
"wip"
```

### Deploying
```bash
# Always verify build before deploy
npm run build

# Deploy to Vercel
vercel --prod

# If issues, force rebuild
rm -rf .next && vercel --prod --force
```

---

## 🐛 Common Pitfalls to Avoid

### Animation Jank
❌ **Wrong**:
```typescript
// Using React state for rapid updates
const [mouseX, setMouseX] = useState(0)
onMouseMove={(e) => setMouseX(e.clientX)} // 60 re-renders/sec!
```

✅ **Right**:
```typescript
// Using refs + RAF for smooth updates
const targetX = useRef(0)
const currentX = useRef(0)
const animationRef = useRef<number>()

function animate() {
  currentX.current = lerp(currentX.current, targetX.current, 0.1)
  element.style.transform = `translateX(${currentX.current}px)`
  animationRef.current = requestAnimationFrame(animate)
}
```

### Mobile Touch Issues
❌ **Wrong**:
```tsx
// Missing touch-action
<div onTouchMove={handleMove}>
```

✅ **Right**:
```tsx
// Prevents browser scroll/zoom interference
<div 
  onTouchMove={handleMove}
  style={{ touchAction: 'none' }}
>
```

### Phaser Scene Memory Leaks
❌ **Wrong**:
```typescript
// Not cleaning up listeners
create() {
  window.addEventListener('resize', this.handleResize)
}
```

✅ **Right**:
```typescript
// Always remove in shutdown
create() {
  window.addEventListener('resize', this.handleResize)
}

shutdown() {
  window.removeEventListener('resize', this.handleResize)
}
```

### Async Leonardo API
❌ **Wrong**:
```typescript
// Not handling pending states
const result = await generateImage()
// Assuming result is immediately available
```

✅ **Right**:
```typescript
// Poll for completion
const { generationId } = await startGeneration()

let status = 'PENDING'
while (status === 'PENDING') {
  await new Promise(r => setTimeout(r, 5000))
  const result = await checkStatus(generationId)
  status = result.status
}
```

---

## 📂 File Organization

### Where to Put New Code

| Type | Location |
|------|----------|
| New React page | `app/[route]/page.tsx` |
| Game component | `components/game/ComponentName.tsx` |
| UI component | `components/ui/ComponentName.tsx` |
| Phaser scene | `src/game/scenes/SceneName.ts` |
| Game data | `src/game/data/dataName.ts` |
| API route | `app/api/[route]/route.ts` |
| Utility | `src/lib/utilName.ts` |
| Store action | `src/store/gameStore.ts` |

### Don't Create Unnecessary Files
- Check if functionality exists before creating new files
- Extend existing files when appropriate
- Don't duplicate logic across files

---

## 🔒 Security Rules

### API Keys
```bash
# NEVER commit API keys
# Always use .env.local
LEONARDO_API_KEY=xxx

# .env.local is in .gitignore
```

### User Data
```typescript
// Don't store sensitive data in localStorage
// Only store: game progress, preferences, scores

// Don't send to server: personal info, payment data
```

---

## 📝 Documentation Requirements

### When to Update Docs
- Adding new features
- Changing architecture decisions
- Fixing bugs that others might encounter
- Adding new data files or APIs

### What to Document
```markdown
# Feature Name

## Purpose
What this does and why

## Usage
How to use it

## Implementation Notes
Any gotchas or important details
```

---

## ✅ Definition of Done

A feature is complete when:

- [ ] Works on mobile (touch tested)
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Animations are smooth (60fps)
- [ ] Matches design intent
- [ ] Edge cases handled
- [ ] Documented if complex
- [ ] Committed with descriptive message
- [ ] Deployed and verified on production
