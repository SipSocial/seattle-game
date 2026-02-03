'use client'

/**
 * Field - Premium football field visualization
 * 
 * Features:
 * - Realistic grass texture pattern
 * - Dynamic end zones with team branding
 * - Stadium atmosphere with crowd glow
 * - Line of scrimmage highlight
 * - First down marker
 * - Smooth scrolling based on field position
 */

import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'

interface FieldProps {
  yardLine: number // 0-100 (0 = own end zone, 100 = opponent end zone/TD)
  firstDownLine?: number // Yard line for first down
  className?: string
  phase?: string // Game phase for dynamic zoom
  zoom?: number // Override zoom (0.6 - 1.2)
  shake?: { intensity: number; duration: number } | null // Screen shake
}

export const Field = memo(function Field({ 
  yardLine, 
  firstDownLine,
  className = '',
  phase = 'PRE_SNAP',
  zoom: zoomOverride,
  shake,
}: FieldProps) {
  // UNIFIED COORDINATE SYSTEM:
  // YOUR end zone at BOTTOM (Y=90%), OPPONENT end zone at TOP (Y=10%)
  // yardLine 0 → Y=88%, yardLine 100 → Y=12%
  // You advance UPWARD (toward lower Y values)
  
  // DYNAMIC ZOOM: Zoom out as plays develop and near end zone
  const calculatedZoom = useMemo(() => {
    // Base zoom by phase
    let baseZoom = 1.0
    switch (phase) {
      case 'PRE_SNAP':
        baseZoom = 1.0
        break
      case 'SNAP':
      case 'DROPBACK':
        baseZoom = 0.95
        break
      case 'READ':
        // Zoom out more as routes develop
        baseZoom = 0.85
        break
      case 'THROW':
        baseZoom = 0.8
        break
      case 'BALL_FLIGHT':
        // Dynamic based on where ball is going
        baseZoom = 0.75
        break
      case 'CATCH':
      case 'RESULT':
        baseZoom = 0.8
        break
      default:
        baseZoom = 1.0
    }
    
    // Zoom out MORE when approaching end zone (can't see TD otherwise)
    if (yardLine > 60) {
      const endZoneFactor = (yardLine - 60) / 40 // 0 at 60, 1 at 100
      baseZoom = Math.max(0.6, baseZoom - endZoneFactor * 0.2)
    }
    
    return zoomOverride ?? baseZoom
  }, [phase, yardLine, zoomOverride])
  
  // Camera scroll: show more of the field as you advance
  // Adjusted for zoom - need to see more when zoomed out
  const scrollPercent = useMemo(() => {
    // Base scroll calculation
    const baseScroll = Math.max(5, Math.min(45, (85 - yardLine) * 0.65))
    
    // Adjust for zoom - when zoomed out, center more
    const zoomAdjustment = (1 - calculatedZoom) * 20
    return Math.max(0, baseScroll - zoomAdjustment)
  }, [yardLine, calculatedZoom])
  
  // Screen shake state
  const shakeTransform = useMemo(() => {
    if (!shake || shake.intensity === 0) return 'translate(0, 0)'
    const x = (Math.random() - 0.5) * shake.intensity * 2
    const y = (Math.random() - 0.5) * shake.intensity * 2
    return `translate(${x}px, ${y}px)`
  }, [shake])
  
  // Generate grass stripe pattern positions
  const grassStripes = useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => ({
      y: i * 4,
      isDark: i % 2 === 0,
    }))
  }, [])
  
  return (
    <motion.div 
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={{
        background: '#1a472a',
      }}
      animate={{
        x: shake ? (Math.random() - 0.5) * shake.intensity * 2 : 0,
        y: shake ? (Math.random() - 0.5) * shake.intensity * 2 : 0,
      }}
      transition={{ duration: 0.05 }}
    >
      {/* Stadium atmosphere - crowd glow at top */}
      <div 
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{
          height: '30%',
          background: `
            radial-gradient(ellipse 100% 100% at 50% 0%, 
              rgba(255,180,60,0.15) 0%, 
              rgba(255,120,40,0.08) 30%,
              transparent 70%
            )
          `,
          zIndex: 1,
        }}
      />
      
      {/* Stadium lights effect */}
      <div 
        className="absolute pointer-events-none"
        style={{
          top: '5%',
          left: '10%',
          width: '30%',
          height: '20%',
          background: 'radial-gradient(ellipse, rgba(255,255,200,0.1) 0%, transparent 60%)',
          zIndex: 1,
        }}
      />
      <div 
        className="absolute pointer-events-none"
        style={{
          top: '5%',
          right: '10%',
          width: '30%',
          height: '20%',
          background: 'radial-gradient(ellipse, rgba(255,255,200,0.1) 0%, transparent 60%)',
          zIndex: 1,
        }}
      />
      
      {/* Field container - scrolls and zooms based on yard line and phase */}
      <motion.div
        className="absolute inset-x-0"
        style={{
          height: '180%',
          transformOrigin: 'center center',
        }}
        animate={{
          y: `-${scrollPercent}%`,
          scale: calculatedZoom,
        }}
        transition={{ 
          y: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
          scale: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
        }}
      >
        {/* Grass stripe pattern */}
        {grassStripes.map(({ y, isDark }) => (
          <div
            key={y}
            className="absolute inset-x-0"
            style={{
              top: `${y}%`,
              height: '4.5%',
              background: isDark 
                ? 'linear-gradient(180deg, #1d5a2f 0%, #1a4f29 100%)' 
                : 'linear-gradient(180deg, #22693a 0%, #1e5c32 100%)',
            }}
          />
        ))}
        
        {/* OPPONENT End Zone (TOP - touchdown target!) */}
        <div
          className="absolute inset-x-0"
          style={{
            top: 0,
            height: '10%',
            background: 'linear-gradient(180deg, #aa0000 0%, #880000 80%, #660000 100%)',
            borderBottom: '4px solid #fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `
                repeating-linear-gradient(
                  -45deg,
                  transparent,
                  transparent 20px,
                  rgba(0,0,0,0.1) 20px,
                  rgba(0,0,0,0.1) 40px
                )
              `,
            }}
          />
          <span
            style={{
              fontSize: 'clamp(24px, 7vw, 40px)',
              fontWeight: 900,
              letterSpacing: '0.15em',
              color: 'rgba(255,255,255,0.5)',
              fontFamily: 'var(--font-oswald)',
              textTransform: 'uppercase',
              textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
              zIndex: 1,
            }}
          >
            TOUCHDOWN
          </span>
        </div>
        
        {/* Yard lines with numbers - UNIFIED COORDINATES */}
        {Array.from({ length: 21 }).map((_, i) => {
          const yard = i * 5
          const isMainLine = yard % 10 === 0
          // UNIFIED: yard 0 → Y=88%, yard 100 → Y=12%
          const yPosition = 88 - (yard / 100) * 76
          
          return (
            <div key={`yard-${yard}`}>
              {/* Yard line */}
              <div
                className="absolute inset-x-0"
                style={{
                  top: `${yPosition}%`,
                  height: isMainLine ? '3px' : '1px',
                  background: isMainLine 
                    ? 'rgba(255,255,255,0.7)' 
                    : 'rgba(255,255,255,0.25)',
                  boxShadow: isMainLine ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
                }}
              />
              
              {/* Yard numbers */}
              {isMainLine && yard > 0 && yard < 100 && (
                <>
                  <span
                    className="absolute pointer-events-none"
                    style={{
                      top: `${yPosition}%`,
                      left: '6%',
                      transform: 'translateY(-50%)',
                      fontSize: 'clamp(18px, 5vw, 28px)',
                      fontWeight: 900,
                      color: 'rgba(255,255,255,0.5)',
                      fontFamily: 'var(--font-oswald)',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                    }}
                  >
                    {yard <= 50 ? yard : 100 - yard}
                  </span>
                  <span
                    className="absolute pointer-events-none"
                    style={{
                      top: `${yPosition}%`,
                      right: '6%',
                      transform: 'translateY(-50%)',
                      fontSize: 'clamp(18px, 5vw, 28px)',
                      fontWeight: 900,
                      color: 'rgba(255,255,255,0.5)',
                      fontFamily: 'var(--font-oswald)',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                    }}
                  >
                    {yard <= 50 ? yard : 100 - yard}
                  </span>
                </>
              )}
            </div>
          )
        })}
        
        {/* Hash marks - UNIFIED COORDINATES */}
        {Array.from({ length: 80 }).map((_, i) => {
          if (i % 5 === 0) return null
          // UNIFIED: same formula as yard lines
          const yPosition = 88 - (i / 100) * 76
          
          return (
            <div key={`hash-${i}`} className="absolute inset-x-0" style={{ top: `${yPosition}%` }}>
              <div 
                style={{
                  position: 'absolute',
                  left: '30%',
                  width: '6px',
                  height: '2px',
                  background: 'rgba(255,255,255,0.3)',
                }}
              />
              <div 
                style={{
                  position: 'absolute',
                  right: '30%',
                  width: '6px',
                  height: '2px',
                  background: 'rgba(255,255,255,0.3)',
                }}
              />
            </div>
          )
        })}
        
        {/* YOUR End Zone (BOTTOM - your territory) */}
        <div
          className="absolute inset-x-0"
          style={{
            top: '90%',
            height: '10%',
            background: 'linear-gradient(0deg, #002244 0%, #003366 80%, #004488 100%)',
            borderTop: '4px solid #fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `
                repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 20px,
                  rgba(105,190,40,0.1) 20px,
                  rgba(105,190,40,0.1) 40px
                )
              `,
            }}
          />
          <span
            style={{
              fontSize: 'clamp(20px, 6vw, 36px)',
              fontWeight: 900,
              letterSpacing: '0.2em',
              color: '#69BE28',
              fontFamily: 'var(--font-oswald)',
              textTransform: 'uppercase',
              textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
              zIndex: 1,
            }}
          >
            DARK SIDE
          </span>
        </div>
      </motion.div>
      
      {/* Line of scrimmage - DYNAMICALLY positioned using UNIFIED formula */}
      <motion.div
        className="absolute inset-x-0 pointer-events-none"
        style={{
          // UNIFIED: yardLine 0 → 88%, yardLine 100 → 12%
          top: `${88 - (yardLine / 100) * 76}%`,
          height: '4px',
          zIndex: 15,
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent 5%, #00aaff 15%, #00aaff 85%, transparent 95%)',
            boxShadow: '0 0 20px rgba(0,170,255,0.6), 0 0 40px rgba(0,170,255,0.3)',
          }}
        />
        {/* LOS label */}
        <span
          style={{
            position: 'absolute',
            left: '4px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '9px',
            fontWeight: 700,
            color: '#00aaff',
            letterSpacing: '0.1em',
            textShadow: '0 1px 4px rgba(0,0,0,0.8)',
          }}
        >
          LOS
        </span>
      </motion.div>
      
      {/* First down marker - 10 yards ahead of LOS */}
      {firstDownLine !== undefined && firstDownLine <= 100 && (
        <motion.div
          className="absolute inset-x-0 pointer-events-none"
          style={{
            // UNIFIED: same formula as yard lines
            top: `${88 - (firstDownLine / 100) * 76}%`,
            height: '4px',
            zIndex: 14,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent 5%, #FFD700 15%, #FFD700 85%, transparent 95%)',
              boxShadow: '0 0 20px rgba(255,215,0,0.6)',
            }}
          />
          <span
            style={{
              position: 'absolute',
              right: '4px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '9px',
              fontWeight: 700,
              color: '#FFD700',
              letterSpacing: '0.05em',
              textShadow: '0 1px 4px rgba(0,0,0,0.8)',
            }}
          >
            1ST
          </span>
        </motion.div>
      )}
      
      {/* Sideline glow */}
      <div
        className="absolute top-0 bottom-0 left-0 pointer-events-none"
        style={{
          width: '6%',
          background: 'linear-gradient(90deg, rgba(255,255,255,0.08) 0%, transparent 100%)',
          borderRight: '2px solid rgba(255,255,255,0.2)',
        }}
      />
      <div
        className="absolute top-0 bottom-0 right-0 pointer-events-none"
        style={{
          width: '6%',
          background: 'linear-gradient(-90deg, rgba(255,255,255,0.08) 0%, transparent 100%)',
          borderLeft: '2px solid rgba(255,255,255,0.2)',
        }}
      />
      
      {/* Vignette overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 60%, 
              transparent 0%, 
              transparent 50%,
              rgba(0,0,0,0.4) 100%
            )
          `,
          zIndex: 2,
        }}
      />
    </motion.div>
  )
})
