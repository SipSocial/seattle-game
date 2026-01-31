'use client'

import { useRef, useEffect, useState, useMemo, useCallback } from 'react'
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
  onPlaneClick?: () => void
}

export function FlightPath({
  currentStageId,
  completedStageIds,
  onArrival,
  airplaneImageUrl,
  showAirplane = true,
  onPlaneClick,
}: FlightPathProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const planeContainerRef = useRef<HTMLDivElement>(null)
  const planeImageRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [isAnimating, setIsAnimating] = useState(false)
  
  // Touch/drag interaction refs (like PlayerSelect)
  const targetX = useRef(0)
  const targetY = useRef(0)
  const currentX = useRef(0)
  const currentY = useRef(0)
  const isTouching = useRef(false)
  const animationRef = useRef<number>(0)
  const [isDragging, setIsDragging] = useState(false)

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

  // Buttery smooth 3D touch tracking for plane (like PlayerSelect)
  useEffect(() => {
    if (!showAirplane) return

    let cachedRect: DOMRect | null = null

    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor

    const applyTransforms = () => {
      const lerpFactor = isTouching.current ? 0.15 : 0.08
      currentX.current = lerp(currentX.current, targetX.current, lerpFactor)
      currentY.current = lerp(currentY.current, targetY.current, lerpFactor)

      // 3D rotation and translation based on drag
      const rotateY = currentX.current * 25 // More dramatic rotation
      const rotateX = -currentY.current * 15
      const translateX = currentX.current * 30
      const translateY = currentY.current * 20
      const scale = 1 + Math.abs(currentX.current) * 0.1 // Slight scale on drag

      if (planeContainerRef.current) {
        planeContainerRef.current.style.transform = `
          rotateY(${rotateY}deg)
          rotateX(${rotateX}deg)
          translateX(${translateX}px)
          translateY(${translateY}px)
          scale(${scale})
        `
      }

      if (planeImageRef.current) {
        // Parallax effect on the image
        planeImageRef.current.style.transform = `translateZ(30px) translateX(${currentX.current * 15}px)`
      }

      animationRef.current = requestAnimationFrame(applyTransforms)
    }

    animationRef.current = requestAnimationFrame(applyTransforms)

    const updatePosition = (clientX: number, clientY: number) => {
      if (!cachedRect) cachedRect = planeContainerRef.current?.getBoundingClientRect() || null
      if (!cachedRect) return
      targetX.current = ((clientX - cachedRect.left) / cachedRect.width - 0.5) * 2
      targetY.current = ((clientY - cachedRect.top) / cachedRect.height - 0.5) * 2
    }

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      isTouching.current = true
      setIsDragging(true)
      cachedRect = planeContainerRef.current?.getBoundingClientRect() || null
      if (e.touches[0]) updatePosition(e.touches[0].clientX, e.touches[0].clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      if (e.touches[0]) updatePosition(e.touches[0].clientX, e.touches[0].clientY)
    }

    const handleTouchEnd = () => {
      isTouching.current = false
      setIsDragging(false)
      targetX.current = 0
      targetY.current = 0
      cachedRect = null
    }

    const handleMouseDown = (e: MouseEvent) => {
      isTouching.current = true
      setIsDragging(true)
      cachedRect = planeContainerRef.current?.getBoundingClientRect() || null
      updatePosition(e.clientX, e.clientY)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (isTouching.current) {
        updatePosition(e.clientX, e.clientY)
      }
    }

    const handleMouseUp = () => {
      isTouching.current = false
      setIsDragging(false)
      targetX.current = 0
      targetY.current = 0
      cachedRect = null
    }

    const handleMouseLeave = () => {
      if (isTouching.current) {
        isTouching.current = false
        setIsDragging(false)
        targetX.current = 0
        targetY.current = 0
        cachedRect = null
      }
    }

    const el = planeContainerRef.current
    if (el) {
      el.addEventListener('touchstart', handleTouchStart, { passive: false })
      el.addEventListener('touchmove', handleTouchMove, { passive: false })
      el.addEventListener('touchend', handleTouchEnd)
      el.addEventListener('mousedown', handleMouseDown)
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      el.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      cancelAnimationFrame(animationRef.current)
      if (el) {
        el.removeEventListener('touchstart', handleTouchStart)
        el.removeEventListener('touchmove', handleTouchMove)
        el.removeEventListener('touchend', handleTouchEnd)
        el.removeEventListener('mousedown', handleMouseDown)
        el.removeEventListener('mouseleave', handleMouseLeave)
      }
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [showAirplane])

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

  // Keep plane within viewport bounds
  const constrainedPlanePos = useMemo(() => {
    const padding = 60 // Keep plane 60px from edges
    const planeWidth = 96 // Half of plane size
    const planeHeight = 48
    
    // Clamp position to viewport bounds
    const x = Math.max(padding + planeWidth, Math.min(dimensions.width - padding - planeWidth, airplanePos.x))
    const y = Math.max(padding + planeHeight, Math.min(dimensions.height - padding - planeHeight, airplanePos.y))
    
    return { x, y, angle: airplanePos.angle }
  }, [airplanePos, dimensions])

  return (
    <div ref={containerRef} className="absolute inset-0">
      <svg
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0 pointer-events-none"
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

      {/* Interactive Airplane with 3D touch/drag */}
      {showAirplane && pathData && (
        <motion.div
          className="absolute pointer-events-auto"
          style={{
            left: constrainedPlanePos.x,
            top: constrainedPlanePos.y,
            x: '-50%',
            y: '-50%',
            rotate: constrainedPlanePos.angle,
            perspective: '1000px',
            zIndex: 30,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        >
          {/* 3D Container for touch interaction */}
          <div
            ref={planeContainerRef}
            className="relative cursor-grab active:cursor-grabbing select-none"
            style={{
              transformStyle: 'preserve-3d',
              touchAction: 'none',
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
            }}
            onClick={onPlaneClick}
          >
            {/* Large touch target area - invisible but increases hit area */}
            <div 
              className="absolute inset-0 -m-8 pointer-events-auto"
              style={{ 
                width: 'calc(100% + 64px)', 
                height: 'calc(100% + 64px)',
                marginLeft: '-32px',
                marginTop: '-32px',
              }}
            />
            
            {/* Glow effect that intensifies when dragging */}
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                transform: 'scale(2)',
                background: isDragging
                  ? 'radial-gradient(circle, rgba(105, 190, 40, 0.5) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(105, 190, 40, 0.2) 0%, transparent 70%)',
              }}
              animate={{
                scale: isDragging ? 2.5 : 2,
              }}
              transition={{ duration: 0.3 }}
            />

            {/* Engine trail / vapor effect */}
            <motion.div
              className="absolute -left-8 top-1/2 -translate-y-1/2 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: isDragging ? [0.5, 0.9, 0.5] : [0.3, 0.6, 0.3],
                scaleX: isDragging ? 1.5 : 1,
              }}
              transition={{ duration: isDragging ? 0.4 : 0.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div
                className="w-16 h-4 rounded-full"
                style={{
                  background: 'linear-gradient(to left, rgba(105, 190, 40, 0.8), rgba(105, 190, 40, 0.3), transparent)',
                  filter: 'blur(4px)',
                }}
              />
            </motion.div>

            {/* Secondary engine glow */}
            <motion.div
              className="absolute -left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              animate={{ 
                opacity: isDragging ? [0.7, 1, 0.7] : [0.5, 1, 0.5],
                scale: isDragging ? [1, 1.5, 1] : [0.8, 1.2, 0.8],
              }}
              transition={{ duration: isDragging ? 0.2 : 0.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div
                className="w-6 h-6 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(105, 190, 40, 1) 0%, rgba(105, 190, 40, 0) 70%)',
                }}
              />
            </motion.div>

            {/* Plane image wrapper with parallax */}
            <div
              ref={planeImageRef}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {airplaneImageUrl ? (
                <motion.img
                  src={airplaneImageUrl}
                  alt="Dark Side Team Plane"
                  className="w-48 h-24 object-contain select-none"
                  draggable={false}
                  style={{
                    filter: isDragging 
                      ? 'drop-shadow(0 8px 30px rgba(105, 190, 40, 1)) drop-shadow(0 0 50px rgba(0, 34, 68, 0.8))'
                      : 'drop-shadow(0 4px 20px rgba(105, 190, 40, 0.8)) drop-shadow(0 0 30px rgba(0, 34, 68, 0.6))',
                  }}
                  animate={{
                    y: isDragging ? 0 : [-2, 2, -2],
                  }}
                  transition={{
                    duration: 2,
                    repeat: isDragging ? 0 : Infinity,
                    ease: 'easeInOut',
                  }}
                />
              ) : (
                // Default airplane icon (bigger)
                <motion.div
                  className="relative select-none"
                  style={{
                    filter: isDragging 
                      ? 'drop-shadow(0 8px 30px rgba(105, 190, 40, 1))'
                      : 'drop-shadow(0 4px 20px rgba(105, 190, 40, 0.8))',
                  }}
                  animate={{
                    y: isDragging ? 0 : [-2, 2, -2],
                  }}
                  transition={{
                    duration: 2,
                    repeat: isDragging ? 0 : Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <svg
                    width="96"
                    height="48"
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
                      <animate
                        attributeName="r"
                        values="2;4;2"
                        dur="0.5s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </svg>
                </motion.div>
              )}
            </div>

            {/* Drag hint */}
            <motion.div
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: isDragging ? 0 : 0.6 }}
              transition={{ delay: 2 }}
            >
              <span className="text-[10px] text-[#69BE28] uppercase tracking-wider font-bold">
                Drag to inspect
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default FlightPath
