# Dark Side App - Design Consistency Master Checklist

**Goal:** Apple-quality UI, Madden-grade pacing, Super Bowl-level polish across ALL pages.

**Design System Principles:**
- Typography: Oswald/Bebas for headers, proper letter-spacing
- Spacing: Explicit pixel values (8px multiples), fluid clamp() for responsive
- Colors: Navy #002244, Green #69BE28, proper opacity levels
- Components: Glassmorphic cards, gradient buttons, cinematic overlays

---

## TYPOGRAPHY CONSISTENCY

- [ ] 1. All page headers use `fontFamily: 'var(--font-oswald)'` or `var(--font-bebas)`
- [ ] 2. All headers have proper `letterSpacing: '0.08em'` to `'0.15em'`
- [ ] 3. All uppercase labels use `textTransform: 'uppercase'`
- [ ] 4. Body text uses `clamp()` for responsive sizing
- [ ] 5. No default system fonts visible anywhere
- [ ] 6. Countdown/timer numbers use Oswald with proper weight (700)
- [ ] 7. Score displays use consistent green (#69BE28) color
- [ ] 8. Caption text uses proper opacity (0.4-0.6)
- [ ] 9. Micro text (10-12px) has wide letter-spacing (0.15em+)
- [ ] 10. All "YOU" badges use same styling across pages

---

## SPACING CONSISTENCY

- [ ] 11. All pages use 24px horizontal padding (not var(--space-*) inconsistently)
- [ ] 12. Safe area insets applied to all page headers
- [ ] 13. Bottom padding accounts for tab bar (100px+)
- [ ] 14. Card internal padding is consistent (16-20px)
- [ ] 15. Button gaps are 12-16px
- [ ] 16. Section gaps are 24-32px
- [ ] 17. Header-to-content gap is consistent (20-24px)
- [ ] 18. Icon-to-text gaps are 8-16px
- [ ] 19. No cramped or overly-spaced layouts
- [ ] 20. Progress bars have consistent height (6-8px)

---

## PAGE-BY-PAGE FIXES

### Home/Hub Page
- [ ] 21. Hero section matches premium styling
- [ ] 22. Quick action cards have consistent styling
- [ ] 23. Entry counter matches leaderboard style

### Game Hub Page
- [ ] 24. Mode selection cards are premium quality
- [ ] 25. Player cards have proper image handling
- [ ] 26. Stage transition is smooth and minimal

### Live Questions Page
- [ ] 27. Header uses Oswald font properly
- [ ] 28. Quarter tabs have premium styling
- [ ] 29. Question cards have proper borders/shadows
- [ ] 30. Timer displays are consistent
- [ ] 31. Answer options have proper hover/active states
- [ ] 32. Countdown uses Oswald numbers

### Picks Hub Page
- [ ] 33. Header gradient text uses Bebas font
- [ ] 34. Progress bar matches other pages
- [ ] 35. Category cards have consistent icon styling
- [ ] 36. Timer/countdown matches Live page
- [ ] 37. "Complete picks" messaging is consistent

### Picks Game Page
- [ ] 38. Navigation buttons positioned correctly (not too low)
- [ ] 39. Card styling matches Picks Hub cards
- [ ] 40. Progress indicator matches hub
- [ ] 41. Category badges use same colors
- [ ] 42. Swipe hint text is subtle
- [ ] 43. Bottom safe area properly handled
- [ ] 44. Timer in header matches hub timer

### Leaderboard Page
- [ ] 45. Player names don't overflow/truncate poorly
- [ ] 46. Rank badges have proper min-width
- [ ] 47. Avatar initials are properly sized
- [ ] 48. Score numbers align properly
- [ ] 49. "ENTRIES" label consistent sizing
- [ ] 50. User position card matches row styling
- [ ] 51. Filter tabs have proper active states
- [ ] 52. Streak flame icons are consistent

### Profile Page
- [ ] 53. Avatar display matches leaderboard style
- [ ] 54. Stats cards are premium quality
- [ ] 55. Entry history list is consistent
- [ ] 56. Settings link has proper styling

### Settings Page
- [ ] 57. Simplify to essential sections only
- [ ] 58. Toggle switches are premium quality
- [ ] 59. Section headers use Oswald font
- [ ] 60. Danger actions (delete) have proper red styling
- [ ] 61. Remove unnecessary complexity
- [ ] 62. Modal dialogs match app style

---

## COMPONENT CONSISTENCY

### Buttons
- [ ] 63. GradientButton has consistent green gradient
- [ ] 64. GhostButton has proper border opacity
- [ ] 65. Button text uses Oswald font
- [ ] 66. Icon buttons have consistent sizing
- [ ] 67. Disabled states are consistent

### Cards
- [ ] 68. GlassCard variants are used correctly
- [ ] 69. Card borders use proper opacity (0.1-0.15)
- [ ] 70. Card shadows are subtle and consistent
- [ ] 71. Green variant cards have proper glow

### Progress Bars
- [ ] 72. All progress bars use same height
- [ ] 73. Gradient style is consistent
- [ ] 74. Glow effect on completion
- [ ] 75. Background track color is consistent

### Icons
- [ ] 76. Lucide icons used everywhere (no emojis)
- [ ] 77. Icon sizes are consistent per context
- [ ] 78. Icon colors match design system
- [ ] 79. Icon containers have gradient backgrounds

### Badges/Chips
- [ ] 80. Status badges use same border-radius
- [ ] 81. "LIVE" badges are animated consistently
- [ ] 82. "YOU" badges are styled the same
- [ ] 83. Category badges use correct colors

---

## ANIMATION CONSISTENCY

- [ ] 84. All spring animations use same config
- [ ] 85. Page transitions are smooth
- [ ] 86. Card hover effects are subtle
- [ ] 87. Button tap effects use scale(0.95-0.98)
- [ ] 88. Loading states use consistent spinners
- [ ] 89. Skeleton loaders have shimmer animation
- [ ] 90. Count-up animations for numbers

---

## MOBILE/RESPONSIVE

- [ ] 91. All pages work on 320px width
- [ ] 92. Safe area insets respected
- [ ] 93. Touch targets are 44px minimum
- [ ] 94. No horizontal scroll issues
- [ ] 95. Text doesn't overflow containers
- [ ] 96. Images scale properly
- [ ] 97. Tab bar doesn't overlap content

---

## ACCESSIBILITY

- [ ] 98. Color contrast meets WCAG standards
- [ ] 99. Interactive elements have focus states
- [ ] 100. Touch targets are adequate size

---

## PRIORITY FIXES (Immediate)

1. **Picks Game Page** - Buttons too low, styling mismatch
2. **Leaderboard** - Name truncation, CSS wrapping
3. **Settings** - Needs simplification
4. **Picks Hub vs Picks Game** - Styling consistency
5. **Live Page** - Ensure new styling is applied

---

## Completed
<!-- Move items here as they're done -->

- [x] Live Page - Typography upgrade (Oswald fonts)
- [x] Picks Hub Page - Typography upgrade (Oswald/Bebas fonts)
- [x] StageTransition - Minimal redesign

---

*Last Updated: Feb 3, 2026*
