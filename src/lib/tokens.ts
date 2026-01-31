/**
 * Design Tokens - Xbox/Madden/CoD Aesthetic
 * Mobile-first design system for Seahawks Defense game
 */

// =============================================================================
// COLORS
// =============================================================================

export const colors = {
  // Primary brand
  primary: '#69BE28',        // Action Green
  primaryDark: '#4a9c1c',    // Darker green for gradients
  primaryLight: '#7ed957',   // Lighter green for highlights
  
  // Navy palette
  navy: '#002244',           // Primary navy
  navyLight: '#003055',      // Lighter navy
  navyDark: '#001428',       // Darker navy for backgrounds
  
  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  
  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(165, 172, 175, 0.8)',
  textMuted: 'rgba(165, 172, 175, 0.6)',
  textDisabled: 'rgba(165, 172, 175, 0.3)',
  
  // Glass effects
  glass: {
    bg: 'rgba(255, 255, 255, 0.05)',
    bgHover: 'rgba(255, 255, 255, 0.08)',
    bgActive: 'rgba(255, 255, 255, 0.1)',
    border: 'rgba(255, 255, 255, 0.1)',
    borderHover: 'rgba(255, 255, 255, 0.15)',
  },
  
  // Green glass (for selected states)
  greenGlass: {
    bg: 'rgba(105, 190, 40, 0.1)',
    bgHover: 'rgba(105, 190, 40, 0.15)',
    border: 'rgba(105, 190, 40, 0.3)',
    borderHover: 'rgba(105, 190, 40, 0.5)',
  },
  
  // Status colors
  success: '#69BE28',
  error: '#E53935',
  warning: '#FFB300',
  info: '#0088CC',
} as const

// =============================================================================
// GRADIENTS
// =============================================================================

export const gradients = {
  // Button gradient (primary CTA)
  button: 'linear-gradient(135deg, #69BE28 0%, #4a9c1c 100%)',
  buttonHover: 'linear-gradient(135deg, #7ed957 0%, #69BE28 100%)',
  
  // Text gradient (hero text)
  text: 'linear-gradient(135deg, #69BE28 0%, #7ed957 50%, #69BE28 100%)',
  textHero: 'linear-gradient(135deg, #69BE28 0%, #8BD44A 40%, #FFFFFF 100%)',
  
  // Background gradients
  background: 'linear-gradient(165deg, #001428 0%, #002244 35%, #003055 70%, #001a33 100%)',
  backgroundRadial: 'radial-gradient(ellipse at 50% 0%, rgba(105,190,40,0.5) 0%, transparent 70%)',
  
  // Glass panel
  glass: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
  
  // Overlay gradients
  overlayTop: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
  overlayBottom: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
  
  // Shine effect for buttons
  shine: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
} as const

// =============================================================================
// SHADOWS
// =============================================================================

export const shadows = {
  // Green glow effects
  glow: {
    sm: '0 0 10px rgba(105, 190, 40, 0.3)',
    md: '0 0 20px rgba(105, 190, 40, 0.4)',
    lg: '0 0 40px rgba(105, 190, 40, 0.5)',
    xl: '0 0 60px rgba(105, 190, 40, 0.6)',
  },
  
  // Button shadows
  button: '0 8px 32px rgba(105, 190, 40, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
  buttonHover: '0 12px 40px rgba(105, 190, 40, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
  
  // Card shadows
  card: '0 4px 20px rgba(0, 0, 0, 0.3)',
  cardHover: '0 8px 30px rgba(0, 0, 0, 0.4)',
  
  // Chip/badge shadows
  chip: '0 4px 16px rgba(105, 190, 40, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
  
  // Text shadows
  textGlow: '0 0 20px rgba(105, 190, 40, 0.5)',
  textDrop: '0 4px 20px rgba(105, 190, 40, 0.4)',
} as const

// =============================================================================
// SPACING (Mobile-first scale)
// =============================================================================

export const spacing = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
} as const

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const typography = {
  // Font families
  fontFamily: {
    display: '"Bebas Neue", "Oswald", sans-serif',
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
  },
  
  // Font sizes (mobile-first)
  fontSize: {
    xs: '10px',
    sm: '12px',
    base: '14px',
    lg: '16px',
    xl: '18px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
    '6xl': '60px',
    '7xl': '72px',
  },
  
  // Font weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },
  
  // Line heights
  lineHeight: {
    none: 1,
    tight: 1.1,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Letter spacing
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.05em',
    wider: '0.1em',
    widest: '0.2em',
    ultrawide: '0.3em',
  },
} as const

// =============================================================================
// BORDER RADIUS
// =============================================================================

export const borderRadius = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
} as const

// =============================================================================
// ANIMATIONS
// =============================================================================

export const animations = {
  // Durations
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
  },
  
  // Easing curves
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // Common transitions
  transition: {
    all: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    colors: 'background-color 150ms, border-color 150ms, color 150ms',
  },
} as const

// =============================================================================
// BREAKPOINTS (Mobile-first)
// =============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// =============================================================================
// Z-INDEX
// =============================================================================

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  popover: 50,
  toast: 60,
} as const

// =============================================================================
// MOBILE-FIRST HELPERS
// =============================================================================

export const mobile = {
  // Minimum touch target size
  touchTarget: '48px',
  
  // Safe area CSS
  safeAreaTop: 'env(safe-area-inset-top)',
  safeAreaBottom: 'env(safe-area-inset-bottom)',
  safeAreaLeft: 'env(safe-area-inset-left)',
  safeAreaRight: 'env(safe-area-inset-right)',
  
  // Max content width for readability
  maxContentWidth: '428px',
} as const

// =============================================================================
// CSS CUSTOM PROPERTIES (for Tailwind/CSS usage)
// =============================================================================

export const cssVariables = `
  :root {
    --color-primary: #69BE28;
    --color-primary-dark: #4a9c1c;
    --color-primary-light: #7ed957;
    --color-navy: #002244;
    --color-navy-light: #003055;
    --color-navy-dark: #001428;
    
    --font-display: "Bebas Neue", "Oswald", sans-serif;
    --font-body: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    
    --shadow-glow: 0 0 20px rgba(105, 190, 40, 0.4);
    --shadow-button: 0 8px 32px rgba(105, 190, 40, 0.4);
    
    --gradient-button: linear-gradient(135deg, #69BE28 0%, #4a9c1c 100%);
    --gradient-background: linear-gradient(165deg, #001428 0%, #002244 35%, #003055 70%, #001a33 100%);
  }
`
