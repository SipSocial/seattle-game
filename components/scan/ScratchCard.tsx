'use client'

/**
 * ScratchCard - Premium Daily Rewards Scratch Card
 * 
 * Design: Matches Game/Picks/Live pages with:
 * - Glassmorphic styling
 * - Fluid typography using CSS vars
 * - Premium animations
 * - Clean, modern layout
 */

import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GradientButton } from '../ui/GradientButton'
import { GlassCard } from '../ui/GlassCard'
import { Gift, Sparkles, Trophy } from 'lucide-react'

interface ScratchCardProps {
  onComplete: () => void
  isWinner: boolean
  prize?: {
    name: string
    description: string
    tier: 'gold' | 'silver' | 'bronze'
  }
}

interface Particle {
  id: number
  x: number
  y: number
  color: string
  rotation: number
  scale: number
}

const TIER_CONFIG = {
  gold: {
    primary: '#FFD700',
    secondary: '#FFA500',
    glow: 'rgba(255, 215, 0, 0.4)',
    text: 'JACKPOT!',
    icon: Trophy,
    gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
  },
  silver: {
    primary: '#69BE28',
    secondary: '#4CAF50',
    glow: 'rgba(105, 190, 40, 0.4)',
    text: 'WINNER!',
    icon: Sparkles,
    gradient: 'linear-gradient(135deg, #69BE28 0%, #A5E055 50%, #69BE28 100%)',
  },
  bronze: {
    primary: '#69BE28',
    secondary: '#4CAF50',
    glow: 'rgba(105, 190, 40, 0.3)',
    text: 'YOU WON!',
    icon: Gift,
    gradient: 'linear-gradient(135deg, #69BE28 0%, #8BC34A 50%, #69BE28 100%)',
  },
}

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }

export function ScratchCard({ onComplete, isWinner, prize }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scratchPercent, setScratchPercent] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const isDrawingRef = useRef(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)

  const tierConfig = useMemo(() => 
    prize?.tier ? TIER_CONFIG[prize.tier] : TIER_CONFIG.bronze,
    [prize?.tier]
  )

  const TierIcon = tierConfig.icon

  // Initialize scratch overlay
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height

    // Metallic gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#3a4a5a')
    gradient.addColorStop(0.3, '#4a5a6a')
    gradient.addColorStop(0.5, '#3a4a5a')
    gradient.addColorStop(0.7, '#4a5a6a')
    gradient.addColorStop(1, '#3a4a5a')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Add subtle noise texture
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 15
      data[i] = Math.min(255, Math.max(0, data[i] + noise))
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise))
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise))
    }
    ctx.putImageData(imageData, 0, 0)

    // Center text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.font = 'bold 14px var(--font-oswald), Oswald, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('SCRATCH TO REVEAL', width / 2, height / 2)
  }, [])

  const calculateScratchPercent = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return 0

    const ctx = canvas.getContext('2d')
    if (!ctx) return 0

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const pixels = imageData.data
    let transparent = 0
    const total = pixels.length / 4

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparent++
    }

    return (transparent / total) * 100
  }, [])

  const scratch = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, 25, 0, Math.PI * 2)
    ctx.fill()

    if (lastPointRef.current) {
      ctx.lineWidth = 50
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y)
      ctx.lineTo(x, y)
      ctx.stroke()
    }

    lastPointRef.current = { x, y }

    const percent = calculateScratchPercent()
    setScratchPercent(percent)

    if ('vibrate' in navigator && Math.random() > 0.8) {
      navigator.vibrate(3)
    }

    if (percent >= 50 && !isRevealed) {
      setIsRevealed(true)
      
      if (isWinner) {
        triggerConfetti()
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100, 50, 200])
        }
      }
    }
  }, [calculateScratchPercent, isRevealed, isWinner])

  const getPosition = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    
    if ('touches' in e) {
      const touch = e.touches[0]
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top }
    } else {
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
  }, [])

  const handleStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    isDrawingRef.current = true
    lastPointRef.current = null
    const pos = getPosition(e)
    if (pos) scratch(pos.x, pos.y)
  }, [getPosition, scratch])

  const handleMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    if (!isDrawingRef.current) return
    const pos = getPosition(e)
    if (pos) scratch(pos.x, pos.y)
  }, [getPosition, scratch])

  const handleEnd = useCallback(() => {
    isDrawingRef.current = false
    lastPointRef.current = null
  }, [])

  const triggerConfetti = useCallback(() => {
    const colors = ['#69BE28', '#FFD700', '#FFFFFF', '#A5E055', '#4CAF50']
    const newParticles: Particle[] = []

    for (let i = 0; i < 40; i++) {
      newParticles.push({
        id: i,
        x: 50 + Math.random() * 10 - 5,
        y: 50,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
      })
    }

    setParticles(newParticles)
    setShowConfetti(true)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={spring}
      className="w-full"
      style={{ maxWidth: '380px', margin: '0 auto' }}
    >
      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: `${10 * p.scale}px`,
                  height: `${10 * p.scale}px`,
                  background: p.color,
                  borderRadius: '2px',
                }}
                initial={{ x: 0, y: 0, rotate: p.rotation, opacity: 1 }}
                animate={{
                  x: (Math.random() - 0.5) * 500,
                  y: Math.random() * 400 + 100,
                  rotate: p.rotation + (Math.random() - 0.5) * 720,
                  opacity: 0,
                }}
                transition={{ duration: 2.5, ease: 'easeOut' }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <GlassCard padding="lg">
        {/* Header */}
        <div className="text-center" style={{ marginBottom: 'var(--space-fluid-md)' }}>
          <div 
            className="inline-flex items-center justify-center"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(105,190,40,0.2) 0%, rgba(105,190,40,0.05) 100%)',
              border: '1px solid rgba(105,190,40,0.3)',
              marginBottom: 'var(--space-3)',
            }}
          >
            <Gift className="w-6 h-6" style={{ color: '#69BE28' }} />
          </div>
          
          <h2
            className="font-display"
            style={{
              fontSize: 'var(--text-title)',
              letterSpacing: '0.02em',
              background: 'linear-gradient(180deg, #FFFFFF 20%, #69BE28 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: 'var(--space-1)',
            }}
          >
            DAILY REWARD
          </h2>
          
          <p style={{ fontSize: 'var(--text-caption)', color: 'rgba(255,255,255,0.5)' }}>
            Scratch to reveal your prize
          </p>
        </div>

        {/* Scratch Area */}
        <div
          className="relative overflow-hidden"
          style={{
            width: '100%',
            aspectRatio: '16/10',
            borderRadius: '16px',
            background: 'linear-gradient(145deg, rgba(0,34,68,0.8) 0%, rgba(0,20,40,0.9) 100%)',
            border: '2px solid rgba(105,190,40,0.3)',
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.4), 0 0 20px rgba(105,190,40,0.1)',
          }}
        >
          {/* Prize reveal underneath */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            {isWinner && prize ? (
              <motion.div
                className="text-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: isRevealed ? 1 : 0.8, opacity: isRevealed ? 1 : 0.2 }}
                transition={spring}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: isRevealed ? 1 : 0, rotate: isRevealed ? 0 : -180 }}
                  transition={{ ...spring, delay: 0.1 }}
                  className="inline-flex items-center justify-center"
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '20px',
                    background: `linear-gradient(135deg, ${tierConfig.primary}20 0%, ${tierConfig.primary}05 100%)`,
                    border: `2px solid ${tierConfig.primary}50`,
                    boxShadow: `0 0 30px ${tierConfig.glow}`,
                    marginBottom: 'var(--space-3)',
                  }}
                >
                  <TierIcon className="w-8 h-8" style={{ color: tierConfig.primary }} />
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: isRevealed ? 1 : 0, y: isRevealed ? 0 : 10 }}
                  transition={{ delay: 0.2 }}
                  className="font-display"
                  style={{
                    fontSize: 'var(--text-title)',
                    letterSpacing: '0.05em',
                    background: tierConfig.gradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: 'var(--space-2)',
                  }}
                >
                  {tierConfig.text}
                </motion.p>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isRevealed ? 1 : 0 }}
                  transition={{ delay: 0.3 }}
                  style={{
                    fontSize: 'var(--text-body)',
                    fontWeight: 600,
                    color: '#69BE28',
                  }}
                >
                  {prize.name}
                </motion.p>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isRevealed ? 0.6 : 0 }}
                  transition={{ delay: 0.4 }}
                  style={{
                    fontSize: 'var(--text-caption)',
                    color: 'rgba(255,255,255,0.5)',
                    marginTop: 'var(--space-1)',
                  }}
                >
                  {prize.description}
                </motion.p>
              </motion.div>
            ) : (
              <motion.div
                className="text-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: isRevealed ? 1 : 0.8, opacity: isRevealed ? 1 : 0.2 }}
                transition={spring}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: isRevealed ? 1 : 0 }}
                  className="inline-flex items-center justify-center"
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    marginBottom: 'var(--space-3)',
                  }}
                >
                  <Gift className="w-7 h-7" style={{ color: 'rgba(255,255,255,0.4)' }} />
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isRevealed ? 1 : 0 }}
                  className="font-display"
                  style={{
                    fontSize: 'var(--step-2)',
                    color: 'rgba(255,255,255,0.5)',
                    letterSpacing: '0.1em',
                  }}
                >
                  TRY AGAIN
                </motion.p>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isRevealed ? 0.5 : 0 }}
                  transition={{ delay: 0.2 }}
                  style={{
                    fontSize: 'var(--text-caption)',
                    color: 'rgba(255,255,255,0.4)',
                    marginTop: 'var(--space-2)',
                  }}
                >
                  Scan again tomorrow!
                </motion.p>
              </motion.div>
            )}
          </div>

          {/* Scratch overlay */}
          <AnimatePresence>
            {!isRevealed && (
              <motion.canvas
                ref={canvasRef}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Progress / Status */}
        <div className="text-center" style={{ marginTop: 'var(--space-fluid-md)' }}>
          {!isRevealed ? (
            <div>
              {/* Progress bar */}
              <div
                style={{
                  height: '4px',
                  borderRadius: '2px',
                  background: 'rgba(255,255,255,0.1)',
                  overflow: 'hidden',
                  marginBottom: 'var(--space-2)',
                }}
              >
                <motion.div
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #69BE28, #A5E055)',
                    borderRadius: '2px',
                  }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${Math.min(scratchPercent * 2, 100)}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <p style={{ fontSize: 'var(--text-caption)', color: 'rgba(255,255,255,0.4)' }}>
                {scratchPercent < 10 ? 'Use your finger to scratch' : 
                 scratchPercent < 30 ? 'Keep going...' : 
                 `${Math.round(scratchPercent)}% revealed`}
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GradientButton 
                size="lg" 
                fullWidth 
                onClick={onComplete}
              >
                {isWinner ? 'CLAIM REWARD' : 'CONTINUE'}
              </GradientButton>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="text-center"
          style={{ 
            marginTop: 'var(--space-fluid-md)',
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <p style={{ 
            fontSize: 'var(--text-micro)', 
            color: 'rgba(255,255,255,0.25)',
            letterSpacing: '0.15em',
          }}>
            DARK SIDE FOOTBALL • SCAN DAILY
          </p>
        </div>
      </GlassCard>
    </motion.div>
  )
}

export default ScratchCard
