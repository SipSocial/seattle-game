'use client'

/**
 * PlaybookPanel - Premium play selection interface
 * 
 * Features:
 * - Horizontal scrolling play cards
 * - Route preview diagrams
 * - Difficulty indicators
 * - Category color coding
 * - Locked play previews
 */

import { memo, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlayDefinition, getAvailablePlays, PLAYBOOK, CATEGORY_COLORS } from '../lib/playbook'
import { getTouchButtonProps, triggerHaptic } from '../hooks/useTouchHandlers'

// ============================================================================
// ROUTE PREVIEW COMPONENT
// ============================================================================

interface RoutePreviewProps {
  play: PlayDefinition
  size?: number
  color?: string
}

const RoutePreview = memo(function RoutePreview({ play, size = 50, color }: RoutePreviewProps) {
  const categoryConfig = CATEGORY_COLORS[play.category]
  const categoryColor = color || categoryConfig?.primary || '#69BE28'
  
  // Generate SVG paths for each route
  const routePaths = useMemo(() => {
    return play.routes.map((route, i) => {
      // Start at first waypoint
      const firstWp = route.waypoints[0]
      if (!firstWp) return { d: '', key: i }
      
      const startX = 25 + firstWp.x * 0.4 // Scale to fit
      const startY = 40 - firstWp.y * 0.35 // Invert Y and scale
      
      // Create path from waypoints
      let d = `M ${startX} ${startY}`
      route.waypoints.slice(1).forEach((wp) => {
        const x = 25 + wp.x * 0.4
        const y = 40 - wp.y * 0.35
        d += ` L ${x} ${y}`
      })
      
      return { d, key: i }
    })
  }, [play])
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 50 50"
      style={{ overflow: 'visible' }}
    >
      {/* Field background */}
      <rect x="5" y="5" width="40" height="40" fill="rgba(26,71,42,0.8)" rx="4" />
      
      {/* Yard lines */}
      {[15, 25, 35].map(y => (
        <line 
          key={y} 
          x1="8" 
          y1={y} 
          x2="42" 
          y2={y} 
          stroke="rgba(255,255,255,0.2)" 
          strokeWidth="0.5" 
        />
      ))}
      
      {/* Route lines */}
      {routePaths.map(({ d, key }) => (
        <path
          key={key}
          d={d}
          fill="none"
          stroke={categoryColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />
      ))}
      
      {/* Route endpoints (receivers) */}
      {play.routes.map((route, i) => {
        const lastWp = route.waypoints[route.waypoints.length - 1]
        const x = 25 + (lastWp?.x || 0) * 0.4
        const y = 40 - (lastWp?.y || 0) * 0.35
        return (
          <circle
            key={`endpoint-${i}`}
            cx={x}
            cy={y}
            r="3"
            fill={categoryColor}
            stroke="#fff"
            strokeWidth="1"
          />
        )
      })}
      
      {/* QB position */}
      <circle cx="25" cy="42" r="4" fill="#69BE28" stroke="#fff" strokeWidth="1.5" />
      <text x="25" y="44" textAnchor="middle" fontSize="4" fill="#fff" fontWeight="bold">QB</text>
    </svg>
  )
})

// ============================================================================
// PLAY CARD COMPONENT
// ============================================================================

interface PlayCardProps {
  play: PlayDefinition
  isLocked: boolean
  onSelect: (play: PlayDefinition) => void
}

const PlayCard = memo(function PlayCard({ play, isLocked, onSelect }: PlayCardProps) {
  const categoryConfig = CATEGORY_COLORS[play.category]
  const categoryColor = categoryConfig?.primary || '#69BE28'
  
  // Calculate average expected yards from routes
  const expectedYards = useMemo(() => {
    if (play.routes.length === 0) return 0
    const total = play.routes.reduce((sum, r) => sum + r.expectedYards, 0)
    return Math.round(total / play.routes.length)
  }, [play.routes])
  
  const handleSelect = useCallback(() => {
    if (!isLocked) {
      triggerHaptic('medium')
      onSelect(play)
    }
  }, [isLocked, onSelect, play])
  
  return (
    <motion.div
      {...(isLocked ? {} : getTouchButtonProps(handleSelect))}
      style={{
        flex: '0 0 auto',
        width: '120px',
        padding: '12px',
        borderRadius: '16px',
        background: isLocked 
          ? 'rgba(50,50,50,0.8)'
          : 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: isLocked
          ? '2px solid rgba(100,100,100,0.3)'
          : `2px solid ${categoryColor}50`,
        boxShadow: isLocked
          ? 'none'
          : `0 4px 20px ${categoryColor}30`,
        opacity: isLocked ? 0.5 : 1,
        cursor: isLocked ? 'not-allowed' : 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
      whileTap={isLocked ? {} : { scale: 0.95 }}
      whileHover={isLocked ? {} : { 
        borderColor: categoryColor,
        boxShadow: `0 6px 25px ${categoryColor}50`,
      }}
    >
      {/* Category indicator */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: categoryColor,
          opacity: isLocked ? 0.3 : 1,
        }}
      />
      
      {/* Route preview */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '8px',
          filter: isLocked ? 'grayscale(1)' : 'none',
        }}
      >
        <RoutePreview play={play} size={60} color={isLocked ? '#666' : categoryColor} />
      </div>
      
      {/* Play name */}
      <div style={{ textAlign: 'center' }}>
        <span
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 700,
            color: isLocked ? '#888' : '#fff',
            fontFamily: 'var(--font-oswald)',
            letterSpacing: '0.05em',
            marginBottom: '4px',
          }}
        >
          {play.name}
        </span>
        
        {/* Category badge */}
        <span
          style={{
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: '8px',
            fontSize: '9px',
            fontWeight: 600,
            color: isLocked ? '#666' : categoryColor,
            background: isLocked ? 'rgba(100,100,100,0.3)' : `${categoryColor}20`,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          {play.category}
        </span>
      </div>
      
      {/* Expected yards */}
      {!isLocked && (
        <div
          style={{
            marginTop: '8px',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            ~{expectedYards} YDS
          </span>
        </div>
      )}
      
      {/* Lock overlay */}
      {isLocked && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.4)',
          }}
        >
          <div
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              background: 'rgba(0,0,0,0.8)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)">
              <path d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6-9h-1V6A5 5 0 0 0 7 6v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2zM8.9 6a3.1 3.1 0 0 1 6.2 0v2H8.9V6z" />
            </svg>
            <span style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
              LOCKED
            </span>
          </div>
        </div>
      )}
    </motion.div>
  )
})

// ============================================================================
// PLAYBOOK PANEL COMPONENT
// ============================================================================

interface PlaybookPanelProps {
  weekId: number
  onSelectPlay: (play: PlayDefinition) => void
  isVisible: boolean
}

export const PlaybookPanel = memo(function PlaybookPanel({
  weekId,
  onSelectPlay,
  isVisible,
}: PlaybookPanelProps) {
  const availablePlays = useMemo(() => getAvailablePlays(weekId), [weekId])
  const availableIds = useMemo(() => new Set(availablePlays.map(p => p.id)), [availablePlays])
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            paddingBottom: 'env(safe-area-inset-bottom, 16px)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#69BE28',
                  letterSpacing: '0.15em',
                  textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                }}
              >
                SELECT PLAY
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                ({availablePlays.length} available)
              </span>
            </div>
            
            {/* Swipe hint */}
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.4)',
                }}
              >
                Swipe
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
              </svg>
            </motion.div>
          </div>
          
          {/* Scrollable play cards */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              padding: '8px 16px 16px',
              overflowX: 'auto',
              overflowY: 'hidden',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {/* Available plays first */}
            {availablePlays.map(play => (
              <PlayCard
                key={play.id}
                play={play}
                isLocked={false}
                onSelect={onSelectPlay}
              />
            ))}
            
            {/* Locked plays */}
            {PLAYBOOK.filter(p => !availableIds.has(p.id)).slice(0, 3).map(play => (
              <PlayCard
                key={play.id}
                play={play}
                isLocked={true}
                onSelect={onSelectPlay}
              />
            ))}
          </div>
          
          {/* Gradient fade on edges */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              width: '20px',
              background: 'linear-gradient(90deg, rgba(0,34,68,0.8) 0%, transparent 100%)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              width: '20px',
              background: 'linear-gradient(-90deg, rgba(0,34,68,0.8) 0%, transparent 100%)',
              pointerEvents: 'none',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
})
