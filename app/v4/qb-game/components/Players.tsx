'use client'

/**
 * Players - Clean, minimal player visualization
 * 
 * Defenders are AHEAD of receivers (toward end zone)
 * Simple circles with jersey numbers, no clutter
 * 
 * Hybrid Coverage System:
 * - ZONE: Defenders patrol zones, break toward ball when thrown
 * - MAN: Defenders mirror receivers with reaction delay
 * - BLITZ: One defender rushes toward QB
 */

import { memo, useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ReceiverState } from '../hooks/useGameState'
import { getTouchButtonProps, triggerHaptic } from '../hooks/useTouchHandlers'
import { CoverageType, CoverageBehavior, getCoverageBehavior } from '../lib/playbook'
import { HelmetCircle } from './HelmetSprite'

// ============================================================================
// DEFENDER TYPES AND COLORS
// ============================================================================

type DefenderPosition = 'CB' | 'S' | 'LB' | 'DL'

const DEFENDER_COLORS: Record<DefenderPosition, { bg: string; border: string }> = {
  CB: { bg: 'linear-gradient(135deg, #cc0000 0%, #880000 100%)', border: 'rgba(255,255,255,0.7)' },
  S: { bg: 'linear-gradient(135deg, #dd2200 0%, #991100 100%)', border: 'rgba(255,200,100,0.7)' },
  LB: { bg: 'linear-gradient(135deg, #aa0000 0%, #660000 100%)', border: 'rgba(255,255,255,0.5)' },
  DL: { bg: 'linear-gradient(135deg, #880000 0%, #440000 100%)', border: 'rgba(255,255,255,0.4)' },
}

// ============================================================================
// DEFENDER MOVEMENT STATES
// ============================================================================

type DefenderMovementState = 
  | 'patrol'      // Zone: patrolling zone area
  | 'mirror'      // Man: shadowing receiver
  | 'break'       // Breaking toward ball
  | 'rush'        // Blitz: rushing toward QB
  | 'idle'        // Pre-snap or waiting

// ============================================================================
// DEFENDER COMPONENT - With hybrid coverage behavior
// ============================================================================

interface DefenderProps {
  x: number
  y: number
  jersey: number
  position: DefenderPosition
  targetX?: number // For AI tracking
  targetY?: number
  coverageBehavior: CoverageBehavior
  movementState: DefenderMovementState
  isBlitzer?: boolean
  ballTargetX?: number // Ball destination for break-on-ball
  ballTargetY?: number
  qbY?: number // QB position for blitz rush
  useHelmet?: boolean
  opponentTeam?: string
}

const Defender = memo(function Defender({ 
  x, 
  y, 
  jersey, 
  position,
  targetX,
  targetY,
  coverageBehavior,
  movementState,
  isBlitzer = false,
  ballTargetX,
  ballTargetY,
  qbY,
  useHelmet = false,
  opponentTeam,
}: DefenderProps) {
  // Track current position with delayed tracking
  const [currentX, setCurrentX] = useState(x)
  const [currentY, setCurrentY] = useState(y)
  const [hasReacted, setHasReacted] = useState(false)
  
  // MAN coverage: 0.4-0.7s reaction delay before mirroring (tight coverage)
  useEffect(() => {
    if (coverageBehavior === 'man' && movementState === 'mirror' && !hasReacted) {
      const delay = 400 + Math.random() * 300 // 0.4-0.7s delay - very quick reactions
      const timer = setTimeout(() => setHasReacted(true), delay)
      return () => clearTimeout(timer)
    }
    if (movementState === 'patrol' || movementState === 'idle') {
      setHasReacted(false)
    }
  }, [coverageBehavior, movementState, hasReacted])
  
  // Smooth position updates
  useEffect(() => {
    let targetPosX = x
    let targetPosY = y
    
    if (movementState === 'mirror' && hasReacted && targetX !== undefined && targetY !== undefined) {
      // Man coverage: trail receiver with offset
      targetPosX = targetX + (position === 'CB' ? 3 : 5) * (x > 0 ? 1 : -1)
      targetPosY = Math.max(12, targetY - 3)
    } else if (movementState === 'break' && ballTargetX !== undefined && ballTargetY !== undefined) {
      // Break toward ball - sprint to catch point
      const dx = ballTargetX - currentX
      const dy = ballTargetY - currentY
      const dist = Math.sqrt(dx * dx + dy * dy)
      // Only break if within range (40% of field width)
      if (dist < 40) {
        targetPosX = currentX + dx * 0.6 // Fast break
        targetPosY = currentY + dy * 0.6
      }
    } else if (movementState === 'rush' && isBlitzer && qbY !== undefined) {
      // Blitz: rush toward QB (visual only)
      targetPosX = 0 // Rush toward center
      targetPosY = qbY - 2 // Stop just before QB
    }
    
    // Smooth interpolation (different speeds for different states) - aggressive D
    const speed = movementState === 'break' ? 0.22 : 
                  movementState === 'rush' ? 0.15 : 
                  movementState === 'mirror' ? 0.10 : 0.05
    
    const animate = () => {
      setCurrentX(prev => prev + (targetPosX - prev) * speed)
      setCurrentY(prev => prev + (targetPosY - prev) * speed)
    }
    
    const frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [x, y, targetX, targetY, movementState, hasReacted, ballTargetX, ballTargetY, isBlitzer, qbY, currentX, currentY, position])
  
  const colors = DEFENDER_COLORS[position]
  
  // Different animations based on movement state
  const getAnimation = () => {
    switch (movementState) {
      case 'patrol':
        // Zone patrol: sway side to side
        return { x: [0, -4, 4, 0], y: [0, -2, 0] }
      case 'mirror':
        // Man coverage: tight jitter
        return hasReacted ? { x: [0, -2, 2, 0], y: [0, -1, 0] } : { x: 0, y: [0, -2, 0] }
      case 'break':
        // Breaking on ball: aggressive lean
        return { x: 0, y: 0, scale: [1, 1.05, 1] }
      case 'rush':
        // Blitz rush: charging animation
        return { x: [0, -2, 2, 0], y: [-3, 0, -3], scale: [1, 1.08, 1] }
      default:
        return { x: 0, y: [0, -2, 0] }
    }
  }
  
  const animation = getAnimation()
  
  return (
    <motion.div
      className="absolute"
      style={{
        left: `calc(50% + ${currentX}%)`,
        top: `${currentY}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: movementState === 'break' || movementState === 'rush' ? 15 : 8,
      }}
      animate={animation}
      transition={{ 
        duration: movementState === 'patrol' ? 1.2 : 
                  movementState === 'rush' ? 0.2 : 
                  movementState === 'break' ? 0.25 : 0.8, 
        repeat: Infinity, 
        ease: 'easeInOut' 
      }}
    >
      {/* Position badge */}
      <div
        style={{
          position: 'absolute',
          top: '-16px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '1px 5px',
          borderRadius: '4px',
          background: 'rgba(0,0,0,0.7)',
          border: '1px solid rgba(255,255,255,0.3)',
        }}
      >
        <span style={{ 
          fontSize: '8px', 
          fontWeight: 700, 
          color: '#fff',
          letterSpacing: '0.05em',
        }}>
          {position}
        </span>
      </div>
      
      {/* Blitz indicator */}
      {isBlitzer && movementState === 'rush' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            position: 'absolute',
            top: '-28px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '2px 6px',
            borderRadius: '6px',
            background: '#ff4444',
            border: '1px solid #fff',
          }}
        >
          <span style={{ fontSize: '7px', fontWeight: 800, color: '#fff' }}>
            BLITZ!
          </span>
        </motion.div>
      )}
      
      {/* Player circle or helmet */}
      {useHelmet ? (
        <HelmetCircle
          team={opponentTeam}
          size={36}
          number={jersey}
          isDefense={true}
        />
      ) : (
        <div
          style={{
            width: 'clamp(30px, 8vw, 40px)',
            height: 'clamp(30px, 8vw, 40px)',
            borderRadius: '50%',
            background: colors.bg,
            border: `2px solid ${colors.border}`,
            boxShadow: movementState === 'break' 
              ? '0 3px 20px rgba(255,100,100,0.6)' 
              : movementState === 'rush'
              ? '0 3px 20px rgba(255,50,50,0.8)'
              : '0 3px 12px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize: 'clamp(11px, 3vw, 14px)',
              fontWeight: 800,
              color: '#fff',
              fontFamily: 'var(--font-oswald)',
            }}
          >
            {jersey}
          </span>
        </div>
      )}
    </motion.div>
  )
})

// ============================================================================
// QB COMPONENT - Green circle or helmet
// ============================================================================

interface QBProps {
  x: number
  y: number
  phase: string
  jersey: number
  useHelmet?: boolean
}

const QB = memo(function QB({ x, y, phase, jersey, useHelmet = false }: QBProps) {
  const isThrowing = phase === 'THROW' || phase === 'BALL_FLIGHT'
  
  return (
    <motion.div
      className="absolute"
      style={{
        left: `calc(50% + ${x}%)`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 20,
      }}
      animate={{
        scale: isThrowing ? 1.1 : 1,
      }}
      transition={{ duration: 0.2 }}
    >
      {useHelmet ? (
        <HelmetCircle
          team="seahawks"
          size={48}
          number={jersey}
          isDefense={false}
        />
      ) : (
        <div
          style={{
            width: 'clamp(44px, 12vw, 56px)',
            height: 'clamp(44px, 12vw, 56px)',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #69BE28 0%, #4a9a1c 100%)',
            border: '3px solid #fff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize: 'clamp(18px, 5vw, 24px)',
              fontWeight: 900,
              color: '#fff',
              fontFamily: 'var(--font-oswald)',
            }}
          >
            {jersey}
          </span>
        </div>
      )}
    </motion.div>
  )
})

// ============================================================================
// RECEIVER COMPONENT - Green circle, tappable
// ============================================================================

interface ReceiverProps {
  receiver: ReceiverState
  index: number
  onTarget: (index: number) => void
  isSelectable: boolean
}

const Receiver = memo(function Receiver({ 
  receiver, 
  index,
  onTarget, 
  isSelectable,
}: ReceiverProps) {
  const { x, y, isOpen, isTargeted } = receiver
  // 5 receivers: JSN, AJ Barner, Kupp, Lockett, Metcalf
  const jerseys = [11, 88, 10, 16, 14]
  
  const handleTap = () => {
    if (isSelectable) {
      triggerHaptic('medium')
      onTarget(index)
    }
  }
  
  return (
    <motion.div
      className="absolute"
      {...(isSelectable ? getTouchButtonProps(handleTap) : {})}
      style={{
        left: `calc(50% + ${x}%)`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: isTargeted ? 18 : 12,
        cursor: isSelectable ? 'pointer' : 'default',
      }}
      animate={{
        scale: isTargeted ? 1.2 : isOpen && isSelectable ? [1, 1.1, 1] : 1,
      }}
      transition={{ 
        duration: isOpen ? 0.5 : 0.2,
        repeat: isOpen && isSelectable ? Infinity : 0,
      }}
    >
      {/* Tap target area */}
      {isSelectable && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
          }}
        />
      )}
      
      {/* Open glow */}
      {isOpen && isSelectable && (
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(105,190,40,0.6) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
      )}
      
      {/* Player circle */}
      <div
        style={{
          width: 'clamp(36px, 10vw, 48px)',
          height: 'clamp(36px, 10vw, 48px)',
          borderRadius: '50%',
          background: isTargeted
            ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
            : isOpen
            ? 'linear-gradient(135deg, #69BE28 0%, #4a9a1c 100%)'
            : 'linear-gradient(135deg, #4a7a3a 0%, #3a6a2a 100%)',
          border: isTargeted ? '3px solid #fff' : '2px solid rgba(255,255,255,0.6)',
          boxShadow: isTargeted
            ? '0 0 25px rgba(255,215,0,0.6)'
            : isOpen
            ? '0 0 20px rgba(105,190,40,0.5)'
            : '0 3px 12px rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontSize: 'clamp(14px, 4vw, 18px)',
            fontWeight: 800,
            color: '#fff',
            fontFamily: 'var(--font-oswald)',
          }}
        >
          {jerseys[index] || index + 1}
        </span>
      </div>
      
      {/* OPEN label */}
      {isOpen && isSelectable && !isTargeted && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'absolute',
            top: '-22px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '2px 8px',
            borderRadius: '8px',
            background: '#69BE28',
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff' }}>
            OPEN
          </span>
        </motion.div>
      )}
    </motion.div>
  )
})

// ============================================================================
// PLAYERS CONTAINER
// ============================================================================

interface PlayersProps {
  qbPosition: { x: number; y: number }
  receivers: ReceiverState[]
  phase: string
  onTargetReceiver: (index: number) => void
  qbJerseyNumber?: number
  lineOfScrimmage: number // Y position of line of scrimmage
  difficulty?: number // For defender AI reaction time
  coverageType?: CoverageType // Defense coverage scheme
  ballThrown?: boolean // True when ball is in flight
  ballTarget?: { x: number; y: number } | null // Ball destination for break-on-ball
  useHelmets?: boolean // Enable helmet visuals (default: true)
  opponentTeam?: string // Team ID for opponent helmet colors
}

// Defender configuration for 7-defender formation
interface DefenderConfig {
  baseX: number
  baseY: number // Offset from LOS (negative = toward opponent)
  jersey: number
  position: DefenderPosition
  coversReceiverIndex?: number // Which receiver to track (if any)
}

const DEFENDER_FORMATION: DefenderConfig[] = [
  // Cornerbacks - shadow outside receivers
  { baseX: -35, baseY: -10, jersey: 24, position: 'CB', coversReceiverIndex: 0 },
  { baseX: 35, baseY: -10, jersey: 21, position: 'CB', coversReceiverIndex: 2 },
  // Safeties - deep zones
  { baseX: -15, baseY: -25, jersey: 33, position: 'S' },
  { baseX: 15, baseY: -25, jersey: 29, position: 'S' },
  // Linebackers - short/mid zones
  { baseX: -20, baseY: -8, jersey: 54, position: 'LB', coversReceiverIndex: 1 },
  { baseX: 0, baseY: -6, jersey: 52, position: 'LB' },
  { baseX: 20, baseY: -8, jersey: 58, position: 'LB', coversReceiverIndex: 3 },
]

export const Players = memo(function Players({
  qbPosition,
  receivers,
  phase,
  onTargetReceiver,
  qbJerseyNumber = 9,
  lineOfScrimmage,
  difficulty = 1.0,
  coverageType = 'zone',
  ballThrown = false,
  ballTarget = null,
  useHelmets = true,
  opponentTeam,
}: PlayersProps) {
  const isSelectablePhase = phase === 'READ'
  const showDefenders = ['READ', 'THROW', 'BALL_FLIGHT', 'DROPBACK', 'CATCH'].includes(phase)
  
  // Randomly select one LB as the blitzer for blitz coverage
  const blitzerIndex = useMemo(() => {
    if (coverageType !== 'blitz') return -1
    // LBs are indices 4, 5, 6 in DEFENDER_FORMATION
    return 4 + Math.floor(Math.random() * 3)
  }, [coverageType])
  
  // Convert coverage type to behavior (zone, man, blitz)
  const coverageBehavior = useMemo(() => getCoverageBehavior(coverageType), [coverageType])
  
  // Determine movement state based on phase and coverage
  const getMovementState = (config: typeof DEFENDER_FORMATION[0], index: number): DefenderMovementState => {
    // Pre-snap: idle
    if (phase === 'SNAP' || phase === 'DROPBACK') return 'idle'
    
    // Ball thrown: break toward ball (for nearby defenders)
    if (ballThrown && ballTarget) {
      // Check if defender is close enough to break
      const dx = (ballTarget.x || 0) - config.baseX
      const dist = Math.abs(dx)
      if (dist < 35) return 'break'
    }
    
    // Blitz: designated blitzer rushes
    if (coverageBehavior === 'blitz' && index === blitzerIndex) {
      return 'rush'
    }
    
    // Coverage-based behavior
    switch (coverageBehavior) {
      case 'zone':
        return 'patrol'
      case 'man':
        return config.coversReceiverIndex !== undefined ? 'mirror' : 'patrol'
      case 'blitz':
        // Non-blitzers play man
        return config.coversReceiverIndex !== undefined ? 'mirror' : 'patrol'
      default:
        return 'idle'
    }
  }
  
  // Build 7 defenders with hybrid coverage behavior
  const defenders = useMemo(() => {
    if (!showDefenders) return []
    
    return DEFENDER_FORMATION.map((config, i) => {
      // Base position relative to LOS
      const x = config.baseX
      const y = Math.max(12, lineOfScrimmage + config.baseY)
      
      // Target for man coverage (receiver tracking)
      let targetX = x
      let targetY = y
      
      if (config.coversReceiverIndex !== undefined && receivers[config.coversReceiverIndex]) {
        const coveredReceiver = receivers[config.coversReceiverIndex]
        targetX = coveredReceiver.x
        targetY = coveredReceiver.y
      }
      
      const movementState = getMovementState(config, i)
      
      return {
        ...config,
        x,
        y,
        targetX,
        targetY: Math.max(12, targetY),
        movementState,
        isBlitzer: i === blitzerIndex,
        ballTargetX: ballTarget?.x,
        ballTargetY: ballTarget?.y,
        qbY: qbPosition.y,
      }
    })
  }, [showDefenders, lineOfScrimmage, receivers, phase, coverageBehavior, ballThrown, ballTarget, blitzerIndex, qbPosition.y])
  
  return (
    <>
      {/* 7 Defenders with hybrid coverage behavior */}
      {defenders.map((def, i) => (
        <Defender 
          key={`def-${i}`} 
          x={def.x} 
          y={def.y} 
          jersey={def.jersey}
          position={def.position}
          targetX={def.targetX}
          targetY={def.targetY}
          coverageBehavior={coverageBehavior}
          movementState={def.movementState}
          isBlitzer={def.isBlitzer}
          ballTargetX={def.ballTargetX}
          ballTargetY={def.ballTargetY}
          qbY={def.qbY}
          useHelmet={useHelmets}
          opponentTeam={opponentTeam}
        />
      ))}
      
      {/* QB */}
      <QB 
        x={qbPosition.x} 
        y={qbPosition.y} 
        phase={phase} 
        jersey={qbJerseyNumber}
        useHelmet={useHelmets}
      />
      
      {/* Receivers */}
      {receivers.map((receiver, index) => (
        <Receiver
          key={index}
          receiver={receiver}
          index={index}
          onTarget={onTargetReceiver}
          isSelectable={isSelectablePhase}
        />
      ))}
    </>
  )
})
