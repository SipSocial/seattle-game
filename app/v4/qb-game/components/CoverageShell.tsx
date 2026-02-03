'use client'

/**
 * CoverageShell - Pre-snap defensive coverage display
 * 
 * Shows the defense's coverage type before the snap:
 * - Cover 2 (two deep safeties)
 * - Cover 3 (single high safety with 3 deep zones)
 * - Man Coverage (each receiver has a shadow)
 * - Zone Coverage (areas covered, not specific players)
 * 
 * Also shows hot route audible buttons when available.
 */

import { memo, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type CoverageType = 'cover2' | 'cover3' | 'man' | 'zone' | 'blitz'

interface CoverageShellProps {
  isVisible: boolean
  coverageType: CoverageType
  showHotRoutes?: boolean
  onHotRoute?: (routeType: 'slant' | 'out' | 'go') => void
}

const COVERAGE_INFO: Record<CoverageType, {
  name: string
  shortName: string
  color: string
  description: string
  weakness: string
}> = {
  cover2: {
    name: 'COVER 2',
    shortName: 'C2',
    color: '#FF6B35',
    description: '2 deep safeties, 5 under',
    weakness: 'Deep middle seam',
  },
  cover3: {
    name: 'COVER 3',
    shortName: 'C3',
    color: '#9B59B6',
    description: 'Single high, 3 deep zones',
    weakness: 'Flats and short out',
  },
  man: {
    name: 'MAN COVERAGE',
    shortName: 'MAN',
    color: '#E74C3C',
    description: 'Each receiver shadowed',
    weakness: 'Pick plays, crossers',
  },
  zone: {
    name: 'ZONE',
    shortName: 'ZN',
    color: '#3498DB',
    description: 'Area coverage',
    weakness: 'Seams between zones',
  },
  blitz: {
    name: 'BLITZ',
    shortName: 'BLZ',
    color: '#FF0000',
    description: 'Extra rushers!',
    weakness: 'Quick slants, hot routes',
  },
}

export const CoverageShell = memo(function CoverageShell({
  isVisible,
  coverageType,
  showHotRoutes = false,
  onHotRoute,
}: CoverageShellProps) {
  const coverage = COVERAGE_INFO[coverageType]
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed"
          style={{
            top: 'calc(env(safe-area-inset-top, 0px) + 80px)',
            right: '12px',
            zIndex: 35,
          }}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.3 }}
        >
          {/* Coverage type badge */}
          <div
            style={{
              padding: '8px 12px',
              borderRadius: '12px',
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(8px)',
              border: `2px solid ${coverage.color}`,
              marginBottom: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: coverage.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 900,
                    color: '#fff',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {coverage.shortName}
                </span>
              </div>
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: coverage.color,
                    letterSpacing: '0.05em',
                  }}
                >
                  {coverage.name}
                </div>
                <div
                  style={{
                    fontSize: '9px',
                    color: 'rgba(255,255,255,0.5)',
                    marginTop: '1px',
                  }}
                >
                  Beat: {coverage.weakness}
                </div>
              </div>
            </div>
          </div>
          
          {/* Hot route audibles */}
          {showHotRoutes && onHotRoute && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div
                style={{
                  fontSize: '8px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.4)',
                  textAlign: 'center',
                  marginBottom: '2px',
                }}
              >
                HOT ROUTES
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {(['slant', 'out', 'go'] as const).map((route) => (
                  <motion.button
                    key={route}
                    onClick={() => onHotRoute(route)}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '8px',
                      background: 'rgba(105,190,40,0.2)',
                      border: '1px solid rgba(105,190,40,0.5)',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#69BE28',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}
                  >
                    {route}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
})

/**
 * Generate a random coverage type based on difficulty
 * Higher difficulty = more complex coverages and blitzes
 */
export function getRandomCoverage(difficulty: number): CoverageType {
  const rand = Math.random()
  
  if (difficulty >= 1.5) {
    // Hard mode - more man coverage and blitzes
    if (rand < 0.25) return 'blitz'
    if (rand < 0.5) return 'man'
    if (rand < 0.7) return 'cover3'
    if (rand < 0.85) return 'cover2'
    return 'zone'
  } else if (difficulty >= 1.0) {
    // Medium mode
    if (rand < 0.1) return 'blitz'
    if (rand < 0.3) return 'man'
    if (rand < 0.5) return 'cover3'
    if (rand < 0.75) return 'cover2'
    return 'zone'
  } else {
    // Easy mode - mostly zone
    if (rand < 0.05) return 'blitz'
    if (rand < 0.15) return 'man'
    if (rand < 0.35) return 'cover3'
    if (rand < 0.55) return 'cover2'
    return 'zone'
  }
}
