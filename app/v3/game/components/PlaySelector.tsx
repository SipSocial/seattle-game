'use client'

/**
 * Play Selector - Pre-snap play calling interface
 * 
 * Premium glassmorphic bottom sheet with 3 horizontal play cards
 * Uses fluid design tokens throughout
 */

import { motion, AnimatePresence } from 'framer-motion'

export interface PlayOption {
  id: string
  name: string
  description: string
  routes: string[]
  riskLevel: 'safe' | 'balanced' | 'aggressive'
}

interface PlaySelectorProps {
  isVisible: boolean
  plays: PlayOption[]
  selectedPlay: string | null
  onSelectPlay: (playId: string) => void
  onConfirm: () => void
}

const RISK_STYLES = {
  safe: {
    bg: 'linear-gradient(135deg, rgba(105, 190, 40, 0.15) 0%, rgba(105, 190, 40, 0.05) 100%)',
    border: 'rgba(105, 190, 40, 0.5)',
    text: 'var(--seahawks-green)',
    glow: '0 0 20px rgba(105, 190, 40, 0.3)',
  },
  balanced: {
    bg: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.05) 100%)',
    border: 'rgba(255, 215, 0, 0.5)',
    text: 'var(--accent-gold)',
    glow: '0 0 20px rgba(255, 215, 0, 0.3)',
  },
  aggressive: {
    bg: 'linear-gradient(135deg, rgba(255, 68, 68, 0.15) 0%, rgba(255, 68, 68, 0.05) 100%)',
    border: 'rgba(255, 68, 68, 0.5)',
    text: '#FF4444',
    glow: '0 0 20px rgba(255, 68, 68, 0.3)',
  },
}

// SVG route icons for cleaner look
const RouteIcon = ({ type, isActive }: { type: string; isActive: boolean }) => {
  const color = isActive ? 'currentColor' : 'rgba(255,255,255,0.3)'
  const size = 20
  
  const paths: Record<string, string> = {
    slant: 'M4 16 L10 10 L16 4',
    out: 'M4 10 L8 10 L16 10',
    go: 'M10 16 L10 4',
    curl: 'M4 14 L10 8 L10 12',
    post: 'M4 16 L10 10 L16 4',
    flat: 'M4 12 L16 12',
    drag: 'M4 10 L8 10 L12 10 L16 10',
  }
  
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <path d={paths[type] || 'M10 10 L14 6'} />
    </svg>
  )
}

export function PlaySelector({
  isVisible,
  plays,
  selectedPlay,
  onSelectPlay,
  onConfirm,
}: PlaySelectorProps) {
  const spring = { type: 'spring' as const, stiffness: 400, damping: 35 }
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute inset-x-0 bottom-0 z-30"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={spring}
        >
          {/* Glassmorphic container */}
          <div
            style={{
              background: 'linear-gradient(0deg, rgba(0, 17, 34, 0.98) 0%, rgba(0, 17, 34, 0.85) 80%, transparent 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              paddingTop: 'var(--space-fluid-md)',
              paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + var(--space-fluid-sm))',
              paddingLeft: 'var(--space-fluid-sm)',
              paddingRight: 'var(--space-fluid-sm)',
            }}
          >
            {/* Header */}
            <motion.div
              className="text-center"
              style={{ marginBottom: 'var(--space-fluid-sm)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <p
                style={{
                  fontSize: 'var(--text-micro)',
                  color: 'rgba(255,255,255,0.4)',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-oswald)',
                }}
              >
                Select Play
              </p>
            </motion.div>

            {/* Play Cards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'var(--space-2)',
                maxWidth: '400px',
                margin: '0 auto',
              }}
            >
              {plays.map((play, index) => {
                const isSelected = selectedPlay === play.id
                const risk = RISK_STYLES[play.riskLevel]
                
                return (
                  <motion.button
                    key={play.id}
                    onClick={() => onSelectPlay(play.id)}
                    className="text-center"
                    style={{
                      padding: 'var(--space-3)',
                      background: isSelected ? risk.bg : 'rgba(255,255,255,0.03)',
                      border: `1.5px solid ${isSelected ? risk.border : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 'var(--card-radius-md)',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: isSelected ? risk.glow : 'none',
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + index * 0.05, ...spring }}
                    whileTap={{ scale: 0.96 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    {/* Route Icons */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '2px',
                        marginBottom: 'var(--space-2)',
                        color: isSelected ? risk.text : 'rgba(255,255,255,0.3)',
                      }}
                    >
                      {play.routes.slice(0, 3).map((route, i) => (
                        <RouteIcon key={i} type={route} isActive={isSelected} />
                      ))}
                    </div>

                    {/* Play Name */}
                    <div
                      style={{
                        fontSize: 'var(--step-0)',
                        fontFamily: 'var(--font-oswald)',
                        fontWeight: 600,
                        color: isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
                        letterSpacing: '0.02em',
                        marginBottom: '4px',
                        transition: 'color 0.2s ease',
                      }}
                    >
                      {play.name.toUpperCase()}
                    </div>

                    {/* Risk Level Badge */}
                    <div
                      style={{
                        fontSize: 'var(--text-micro)',
                        color: risk.text,
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        opacity: isSelected ? 1 : 0.5,
                        fontWeight: 500,
                      }}
                    >
                      {play.riskLevel}
                    </div>
                  </motion.button>
                )
              })}
            </div>

            {/* Confirm Action */}
            <AnimatePresence>
              {selectedPlay && (
                <motion.div
                  style={{ marginTop: 'var(--space-fluid-md)', textAlign: 'center' }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={spring}
                >
                  <motion.button
                    onClick={onConfirm}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      padding: 'var(--space-3) var(--space-6)',
                      background: 'linear-gradient(135deg, var(--seahawks-green) 0%, var(--seahawks-green-dark) 100%)',
                      color: 'var(--seahawks-navy)',
                      border: 'none',
                      borderRadius: 'var(--btn-radius-full)',
                      fontSize: 'var(--step-0)',
                      fontFamily: 'var(--font-oswald)',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      boxShadow: '0 4px 24px rgba(105, 190, 40, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                    }}
                    whileHover={{ scale: 1.02, boxShadow: '0 6px 32px rgba(105, 190, 40, 0.5)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Snap Ball</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Default plays for offense
export const DEFAULT_OFFENSE_PLAYS: PlayOption[] = [
  {
    id: 'slant-flood',
    name: 'Slant Flood',
    description: 'Quick slant routes with outlet',
    routes: ['slant', 'out', 'go'],
    riskLevel: 'safe',
  },
  {
    id: 'curl-flat',
    name: 'Curl Flat',
    description: 'Curls with flat route check-down',
    routes: ['curl', 'flat', 'go'],
    riskLevel: 'balanced',
  },
  {
    id: 'four-verts',
    name: 'Four Verts',
    description: 'Aggressive deep attack',
    routes: ['go', 'go', 'post'],
    riskLevel: 'aggressive',
  },
]
