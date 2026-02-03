'use client'

/**
 * HelmetSprite - Procedural football helmet rendering
 * 
 * Renders a stylized helmet with:
 * - Team colors (primary + accent)
 * - Face mask lines
 * - Optional logo/number overlay
 * 
 * Uses pure CSS/SVG for instant rendering.
 * For higher quality, Leonardo AI helmets can be loaded from /helmets/preview
 */

import { memo } from 'react'

export interface HelmetColors {
  primary: string    // Main helmet color
  accent: string     // Face mask and trim color
  secondary?: string // Optional stripe/logo color
}

// Preset team colors
export const TEAM_HELMETS: Record<string, HelmetColors> = {
  seahawks: {
    primary: '#002244',
    accent: '#69BE28',
    secondary: '#A5ACAF',
  },
  niners: {
    primary: '#AA0000',
    accent: '#B3995D',
    secondary: '#FFFFFF',
  },
  rams: {
    primary: '#003594',
    accent: '#FFA300',
    secondary: '#FFFFFF',
  },
  cardinals: {
    primary: '#97233F',
    accent: '#000000',
    secondary: '#FFB612',
  },
  cowboys: {
    primary: '#041E42',
    accent: '#869397',
    secondary: '#FFFFFF',
  },
  packers: {
    primary: '#203731',
    accent: '#FFB612',
    secondary: '#FFFFFF',
  },
  chiefs: {
    primary: '#E31837',
    accent: '#FFB612',
    secondary: '#FFFFFF',
  },
  bills: {
    primary: '#00338D',
    accent: '#C60C30',
    secondary: '#FFFFFF',
  },
  ravens: {
    primary: '#241773',
    accent: '#9E7C0C',
    secondary: '#000000',
  },
  eagles: {
    primary: '#004C54',
    accent: '#A5ACAF',
    secondary: '#000000',
  },
}

interface HelmetSpriteProps {
  /** Team ID or custom colors */
  team?: string
  colors?: HelmetColors
  /** Size in pixels (width = height) */
  size?: number
  /** Jersey number to display */
  number?: number
  /** Direction helmet faces ('left' | 'right') */
  facing?: 'left' | 'right'
  /** Additional CSS class */
  className?: string
}

export const HelmetSprite = memo(function HelmetSprite({
  team,
  colors: customColors,
  size = 40,
  number,
  facing = 'right',
  className = '',
}: HelmetSpriteProps) {
  // Get colors from team preset or custom
  const colors = customColors || (team ? TEAM_HELMETS[team] : TEAM_HELMETS.seahawks)
  
  const scale = facing === 'left' ? -1 : 1
  
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        position: 'relative',
        transform: `scaleX(${scale})`,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        style={{ overflow: 'visible' }}
      >
        {/* Helmet shell */}
        <defs>
          <linearGradient id={`helmet-grad-${team || 'custom'}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="50%" stopColor={colors.primary} />
            <stop offset="100%" stopColor={darken(colors.primary, 0.3)} />
          </linearGradient>
          
          {/* Highlight */}
          <radialGradient id={`helmet-highlight-${team || 'custom'}`} cx="30%" cy="30%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        
        {/* Main helmet shape - rounded rectangle */}
        <path
          d="M 20 50 
             Q 20 15, 55 15 
             Q 90 15, 90 50 
             Q 90 85, 55 85 
             Q 20 85, 20 50 Z"
          fill={`url(#helmet-grad-${team || 'custom'})`}
          stroke={colors.accent}
          strokeWidth="2"
        />
        
        {/* Helmet highlight */}
        <ellipse
          cx="45"
          cy="40"
          rx="20"
          ry="15"
          fill={`url(#helmet-highlight-${team || 'custom'})`}
        />
        
        {/* Center stripe (optional) */}
        {colors.secondary && (
          <path
            d="M 52 18 Q 55 50, 52 82"
            fill="none"
            stroke={colors.secondary}
            strokeWidth="4"
            strokeLinecap="round"
          />
        )}
        
        {/* Ear hole */}
        <circle
          cx="30"
          cy="55"
          r="6"
          fill={darken(colors.primary, 0.4)}
          stroke={colors.accent}
          strokeWidth="1"
        />
        
        {/* Face mask - horizontal bars */}
        <g stroke={colors.accent} strokeWidth="3" strokeLinecap="round">
          {/* Top bar */}
          <path d="M 15 40 Q 5 45, 5 55 Q 5 65, 15 70" fill="none" />
          
          {/* Horizontal bars */}
          <line x1="15" y1="45" x2="5" y2="50" />
          <line x1="15" y1="55" x2="2" y2="55" />
          <line x1="15" y1="65" x2="5" y2="60" />
          
          {/* Chin guard */}
          <path d="M 15 72 Q 8 75, 8 80 Q 8 85, 20 88" fill="none" />
        </g>
        
        {/* Jersey number (mirrored if facing left) */}
        {number && (
          <text
            x="60"
            y="58"
            fontSize="22"
            fontWeight="900"
            fill="#fff"
            fontFamily="var(--font-oswald), sans-serif"
            textAnchor="middle"
            style={{
              transform: facing === 'left' ? 'scaleX(-1)' : undefined,
              transformOrigin: '60px 55px',
            }}
          >
            {number}
          </text>
        )}
      </svg>
    </div>
  )
})

/**
 * Simple player circle with helmet styling
 * For use in the game field - simpler than full helmet
 */
export const HelmetCircle = memo(function HelmetCircle({
  team,
  colors: customColors,
  size = 40,
  number,
  isDefense = false,
  className = '',
}: {
  team?: string
  colors?: HelmetColors
  size?: number
  number?: number
  isDefense?: boolean
  className?: string
}) {
  const colors = customColors || (team ? TEAM_HELMETS[team] : 
    isDefense ? { primary: '#cc0000', accent: '#fff', secondary: '#880000' } : TEAM_HELMETS.seahawks)
  
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${darken(colors.primary, 0.2)} 100%)`,
        border: `2px solid ${colors.accent}`,
        boxShadow: '0 3px 12px rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {/* Face mask lines */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          pointerEvents: 'none',
        }}
      >
        <g stroke={colors.accent} strokeWidth="2" strokeLinecap="round" opacity="0.6">
          <line x1="15" y1="40" x2="25" y2="40" />
          <line x1="10" y1="50" x2="25" y2="50" />
          <line x1="15" y1="60" x2="25" y2="60" />
        </g>
      </svg>
      
      {/* Jersey number */}
      {number && (
        <span
          style={{
            fontSize: size * 0.4,
            fontWeight: 800,
            color: '#fff',
            fontFamily: 'var(--font-oswald), sans-serif',
            zIndex: 1,
          }}
        >
          {number}
        </span>
      )}
    </div>
  )
})

// Helper function to darken a color
function darken(hex: string, amount: number): string {
  // Remove # if present
  const color = hex.replace('#', '')
  
  // Parse RGB
  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)
  
  // Darken
  const newR = Math.max(0, Math.round(r * (1 - amount)))
  const newG = Math.max(0, Math.round(g * (1 - amount)))
  const newB = Math.max(0, Math.round(b * (1 - amount)))
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
}
