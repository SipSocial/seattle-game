'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import { motion, useMotionValue, useSpring, useTransform, animate } from 'framer-motion'
import { CAMPAIGN_STAGES, CampaignStage } from '@/src/game/data/campaign'

// Map dimensions (normalized 0-1 coordinates mapped to viewport)
const MAP_ASPECT = 16 / 9

interface FlightPathProps {
  currentStageId: number
  completedStageIds: number[]
  onArrival?: (stageId: number) => void
  airplaneImageUrl?: string | null
  showAirplane?: boolean
}

export function FlightPath({
  currentStageId,
  completedStageIds,
  onArrival,
  airplaneImageUrl,
  showAirplane = true,
}: FlightPathProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [isAnimating, setIsAnimating] = useState(false)

  // Animation progress (0 = Seattle start, 1 = current stage)
  const progress = useMotionValue(0)
  const springProgress = useSpring(progress, { stiffness: 100, damping: 20 })

  // Airplane position on path
  const [airplanePos, setAirplanePos] = useState({ x: 0, y: 0, angle: 0 })

  // Get ordered stages for the flight path
  const orderedStages = useMemo(() => {
    return CAMPAIGN_STAGES.slice(0, currentStageId)
  }, [currentStageId])

  // Generate SVG path string from stage coordinates
  const pathData = useMemo(() => {
    if (dimensions.width === 0) return ''

    const points = orderedStages.map(stage => ({
      x: stage.location.coordinates.x * dimensions.width,
      y: stage.location.coordinates.y * dimensions.height,
    }))

    if (points.length === 0) return ''
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

    // Create smooth bezier curve through points
    let d = `M ${points[0].x} ${points[0].y}`

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]

      // Control points for smooth curve
      const cpX1 = prev.x + (curr.x - prev.x) * 0.5
      const cpY1 = prev.y
      const cpX2 = prev.x + (curr.x - prev.x) * 0.5
      const cpY2 = curr.y

      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`
    }

    return d
  }, [orderedStages, dimensions])

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height: rect.height })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Animate airplane along path
  useEffect(() => {
    if (!pathRef.current || pathData.length === 0) return

    const path = pathRef.current
    const totalLength = path.getTotalLength()

    const updateAirplanePosition = () => {
      const currentProgress = springProgress.get()
      const currentLength = currentProgress * totalLength

      const point = path.getPointAtLength(currentLength)
      const nextPoint = path.getPointAtLength(Math.min(currentLength + 5, totalLength))

      // Calculate angle
      const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI)

      setAirplanePos({ x: point.x, y: point.y, angle })
    }

    const unsubscribe = springProgress.on('change', updateAirplanePosition)
    updateAirplanePosition() // Initial position

    return unsubscribe
  }, [springProgress, pathData])

  // Animate to current stage on mount
  useEffect(() => {
    if (orderedStages.length > 0 && !isAnimating) {
      setIsAnimating(true)

      // Start from 0, animate to 1
      progress.set(0)

      const controls = animate(progress, 1, {
        duration: 2,
        ease: 'easeInOut',
        onComplete: () => {
          setIsAnimating(false)
          onArrival?.(currentStageId)
        },
      })

      return () => controls.stop()
    }
  }, [currentStageId, orderedStages.length])

  // Completed path length for drawing animation
  const completedPathLength = useTransform(springProgress, [0, 1], [0, 1])

  // Calculate city marker positions
  const cityPositions = useMemo(() => {
    return CAMPAIGN_STAGES.map(stage => ({
      id: stage.id,
      x: stage.location.coordinates.x * dimensions.width,
      y: stage.location.coordinates.y * dimensions.height,
      isCompleted: completedStageIds.includes(stage.id),
      isCurrent: stage.id === currentStageId,
      isLocked: stage.id > currentStageId,
      stage,
    }))
  }, [dimensions, completedStageIds, currentStageId])

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      <svg
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Glow filter for completed path */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradient for path */}
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#69BE28" stopOpacity="1" />
            <stop offset="100%" stopColor="#002244" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Background path (dashed, upcoming) */}
        <path
          d={pathData}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="3"
          strokeDasharray="8 8"
          strokeLinecap="round"
        />

        {/* Completed path (solid, glowing) */}
        <motion.path
          ref={pathRef}
          d={pathData}
          fill="none"
          stroke="#69BE28"
          strokeWidth="4"
          strokeLinecap="round"
          filter="url(#glow)"
          style={{
            pathLength: completedPathLength,
          }}
        />

        {/* Future path markers (dots along path) */}
        {CAMPAIGN_STAGES.slice(currentStageId).map((stage, i) => (
          <circle
            key={stage.id}
            cx={stage.location.coordinates.x * dimensions.width}
            cy={stage.location.coordinates.y * dimensions.height}
            r="4"
            fill="rgba(255, 255, 255, 0.2)"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
          />
        ))}
      </svg>

      {/* Airplane */}
      {showAirplane && pathData && (
        <motion.div
          className="absolute pointer-events-none"
          style={{
            left: airplanePos.x,
            top: airplanePos.y,
            x: '-50%',
            y: '-50%',
            rotate: airplanePos.angle,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {airplaneImageUrl ? (
            <img
              src={airplaneImageUrl}
              alt="Seahawks Plane"
              className="w-16 h-8 object-contain"
              style={{
                filter: 'drop-shadow(0 0 10px rgba(105, 190, 40, 0.6))',
              }}
            />
          ) : (
            // Default airplane icon
            <div
              className="relative"
              style={{
                filter: 'drop-shadow(0 0 10px rgba(105, 190, 40, 0.6))',
              }}
            >
              <svg
                width="48"
                height="24"
                viewBox="0 0 48 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Fuselage */}
                <path
                  d="M4 12L12 8L40 10L44 12L40 14L12 16L4 12Z"
                  fill="#002244"
                  stroke="#69BE28"
                  strokeWidth="1.5"
                />
                {/* Top wing */}
                <path
                  d="M18 10L28 4L32 10Z"
                  fill="#002244"
                  stroke="#69BE28"
                  strokeWidth="1"
                />
                {/* Bottom wing */}
                <path
                  d="M18 14L28 20L32 14Z"
                  fill="#002244"
                  stroke="#69BE28"
                  strokeWidth="1"
                />
                {/* Tail */}
                <path
                  d="M8 12L4 6L10 10Z"
                  fill="#002244"
                  stroke="#69BE28"
                  strokeWidth="1"
                />
                {/* Engine glow */}
                <circle cx="42" cy="12" r="3" fill="#69BE28" opacity="0.8">
                  <animate
                    attributeName="opacity"
                    values="0.5;1;0.5"
                    dur="0.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default FlightPath
