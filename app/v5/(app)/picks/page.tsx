'use client'

/**
 * V5 Picks Hub - Game Hub-style refined picks experience
 * 
 * Design: Compact, game-like, professional
 * - Same sizing philosophy as Game Hub
 * - Video background
 * - Compact typography (10-14px range)
 * - Subtle gradients
 */

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  usePicksStore, 
  formatTimeUntilLock,
} from '@/src/v5/store/picksStore'
import { 
  PICK_CATEGORIES, 
  CATEGORY_ORDER,
  PickCategory,
  CategoryIcon,
} from '@/src/v5/data/propPicks'
import { VideoBackground } from '@/components/ui/VideoBackground'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { 
  Trophy, 
  Clock, 
  ChevronRight, 
  Check, 
  Lock,
  Zap,
  Star,
  PartyPopper,
  Target,
  Ticket,
} from 'lucide-react'

const BACKGROUND_VIDEO = 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/4b5f0ad3-9f4e-413f-b44a-053e9af6240c/4b5f0ad3-9f4e-413f-b44a-053e9af6240c.mp4'
const BACKGROUND_POSTER = 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/16412705-ca65-400e-bb78-80ff29be860a/segments/2:2:1/Phoenix_Empty_NFL_football_field_at_night_dramatic_billowing_s_0.jpg'

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }

// Icons
const CategoryIcons: Record<CategoryIcon, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  football: Zap,
  star: Star,
  trophy: Trophy,
  party: PartyPopper,
  target: Target,
}

export default function PicksPage() {
  const [mounted, setMounted] = useState(false)
  const { 
    getProgress, 
    getCategoryProgress, 
    isLocked, 
    isComplete,
    getTimeUntilLock,
  } = usePicksStore()
  
  const progress = getProgress()
  const locked = isLocked()
  const complete = isComplete()
  const [timeUntilLock, setTimeUntilLock] = useState(getTimeUntilLock())
  
  useEffect(() => { setMounted(true) }, [])
  
  useEffect(() => {
    const interval = setInterval(() => setTimeUntilLock(getTimeUntilLock()), 1000)
    return () => clearInterval(interval)
  }, [getTimeUntilLock])
  
  const getCTA = () => {
    if (locked) return { text: 'VIEW MY PICKS', href: '/v5/picks/confirm' }
    if (complete) return { text: 'REVIEW PICKS', href: '/v5/picks/confirm' }
    if (progress.answered > 0) return { text: 'CONTINUE PICKS', href: '/v5/picks/game' }
    return { text: 'MAKE YOUR PICKS', href: '/v5/picks/game' }
  }
  
  const cta = getCTA()
  const progressPercent = (progress.answered / progress.total) * 100
  const isUrgent = timeUntilLock < 3600000

  return (
    <div className="min-h-full" style={{ background: '#002244' }}>
      {/* Background */}
      <VideoBackground 
        src={BACKGROUND_VIDEO}
        poster={BACKGROUND_POSTER}
        overlay={true}
        overlayOpacity={0.8}
      />

      {/* Gradient overlays */}
      <div className="fixed inset-0 z-[1] pointer-events-none">
        <div 
          className="absolute inset-x-0 top-0"
          style={{ 
            height: '30%',
            background: 'linear-gradient(180deg, rgba(0,10,20,0.95) 0%, transparent 100%)',
          }}
        />
        <div 
          className="absolute inset-x-0 bottom-0"
          style={{ 
            height: '40%',
            background: 'linear-gradient(0deg, rgba(0,10,20,0.95) 0%, transparent 100%)',
          }}
        />
      </div>

      {/* Content */}
      <motion.div 
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: mounted ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 100px)',
          paddingLeft: '20px',
          paddingRight: '20px',
        }}
      >
        <div style={{ maxWidth: '384px', margin: '0 auto' }}>
          
          {/* Header */}
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : -20 }}
            transition={{ ...spring, delay: 0.1 }}
            style={{ marginBottom: '24px' }}
          >
            <div>
              <h1 
                className="font-display"
                style={{ 
                  fontSize: 'clamp(1.75rem, 8vw, 2.5rem)',
                  letterSpacing: '0.02em',
                  background: 'linear-gradient(180deg, #FFFFFF 20%, #69BE28 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                PROP PICKS
              </h1>
              <p style={{ 
                fontSize: '10px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
              }}>
                25 picks to win a signed jersey
              </p>
            </div>
            
            {/* Status Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '100px',
                background: locked 
                  ? 'rgba(239, 68, 68, 0.15)' 
                  : 'rgba(105, 190, 40, 0.15)',
                border: locked
                  ? '1px solid rgba(239, 68, 68, 0.3)'
                  : '1px solid rgba(105, 190, 40, 0.3)',
              }}
            >
              {locked ? (
                <Lock className="w-3 h-3" style={{ color: '#EF4444' }} />
              ) : (
                <motion.div 
                  style={{ 
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#69BE28',
                  }}
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              <span 
                style={{ 
                  fontSize: '10px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: locked ? '#EF4444' : '#69BE28',
                  fontWeight: 600,
                }}
              >
                {locked ? 'LOCKED' : 'OPEN'}
              </span>
            </div>
          </motion.div>
          
          {/* Progress Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ ...spring, delay: 0.15 }}
            style={{ marginBottom: '20px' }}
          >
            <GlassCard variant={complete ? 'green' : 'default'} padding="md">
              <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                <div>
                  <p style={{ 
                    fontSize: '10px',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.5)',
                    marginBottom: '4px',
                  }}>
                    Your Progress
                  </p>
                  <p style={{ 
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#fff',
                  }}>
                    {progress.answered} of {progress.total}
                  </p>
                </div>
                
                {/* Timer */}
                {!locked && (
                  <div className="text-right">
                    <p style={{ 
                      fontSize: '10px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.4)',
                      marginBottom: '4px',
                    }}>
                      Locks in
                    </p>
                    <div className="flex items-center justify-end" style={{ gap: '4px' }}>
                      {isUrgent && <Clock className="w-3.5 h-3.5" style={{ color: '#EF4444' }} />}
                      <p style={{ 
                        fontSize: '14px',
                        fontWeight: 700,
                        color: isUrgent ? '#EF4444' : '#69BE28',
                      }}>
                        {formatTimeUntilLock(timeUntilLock)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Progress Bar */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  height: '6px',
                  borderRadius: '100px',
                  background: 'rgba(255,255,255,0.1)',
                  overflow: 'hidden',
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    style={{
                      height: '100%',
                      borderRadius: '100px',
                      background: 'linear-gradient(90deg, #69BE28 0%, #7DD33B 100%)',
                    }}
                  />
                </div>
              </div>
              
              {/* CTA */}
              <Link href={cta.href} style={{ display: 'block' }}>
                <GradientButton size="md" fullWidth>
                  {cta.text}
                </GradientButton>
              </Link>
              
              {!complete && (
                <p style={{ 
                  textAlign: 'center',
                  marginTop: '12px',
                  fontSize: '10px',
                  color: 'rgba(255,255,255,0.4)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}>
                  Complete all for +1 entry
                </p>
              )}
            </GlassCard>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: mounted ? 1 : 0 }}
            transition={{ delay: 0.2 }}
            style={{ marginBottom: '20px' }}
          >
            <p style={{
              fontSize: '10px',
              color: 'rgba(255, 255, 255, 0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              marginBottom: '12px',
            }}>
              Categories
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {CATEGORY_ORDER.map((category, index) => (
                <CategoryCard
                  key={category}
                  category={category}
                  progress={getCategoryProgress(category)}
                  delay={0.15 + index * 0.03}
                  locked={locked}
                  mounted={mounted}
                />
              ))}
            </div>
          </motion.div>

          {/* Prize Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ ...spring, delay: 0.35 }}
          >
            <GlassCard padding="md" style={{ background: 'rgba(255, 215, 0, 0.08)', border: '1px solid rgba(255, 215, 0, 0.25)' }}>
              <div className="flex items-center" style={{ gap: '12px' }}>
                <div 
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(255,215,0,0.3) 0%, rgba(255,215,0,0.1) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Trophy className="w-5 h-5" style={{ color: '#FFD700' }} />
                </div>
                <p style={{ 
                  fontSize: '12px',
                  color: '#FFD700',
                  fontWeight: 500,
                  lineHeight: 1.4,
                }}>
                  Top picks scorer wins a signed DeMarcus Lawrence jersey!
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

// Compact Category Card
interface CategoryCardProps {
  category: PickCategory
  progress: { answered: number; total: number }
  delay: number
  locked: boolean
  mounted: boolean
}

function CategoryCard({ category, progress, delay, locked, mounted }: CategoryCardProps) {
  const meta = PICK_CATEGORIES[category]
  const isComplete = progress.answered === progress.total
  const progressPercent = (progress.answered / progress.total) * 100
  const IconComponent = CategoryIcons[meta.icon]
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: mounted ? 1 : 0, x: mounted ? 0 : -10 }}
      transition={{ ...spring, delay }}
    >
      <Link href={locked ? '/v5/picks/confirm' : `/v5/picks/${category}`}>
        <motion.div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 16px',
            borderRadius: '14px',
            background: isComplete
              ? 'rgba(105, 190, 40, 0.1)'
              : 'rgba(255, 255, 255, 0.04)',
            border: isComplete
              ? '1px solid rgba(105, 190, 40, 0.3)'
              : '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(8px)',
            cursor: 'pointer',
          }}
          whileHover={{ scale: 1.01, background: 'rgba(255,255,255,0.06)' }}
          whileTap={{ scale: 0.99 }}
        >
          {/* Icon */}
          <div
            style={{ 
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: `${meta.color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <IconComponent className="w-4 h-4" style={{ color: meta.color }} />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between" style={{ marginBottom: '6px' }}>
              <p style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.9)',
              }}>
                {meta.name}
              </p>
              <span style={{
                fontSize: '12px',
                color: isComplete ? '#69BE28' : 'rgba(255, 255, 255, 0.5)',
                fontWeight: 600,
              }}>
                {progress.answered}/{progress.total}
              </span>
            </div>
            
            {/* Progress bar */}
            <div style={{ 
              height: '4px',
              borderRadius: '100px',
              background: 'rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
            }}>
              <motion.div
                style={{
                  height: '100%',
                  borderRadius: '100px',
                  background: isComplete 
                    ? '#69BE28' 
                    : meta.color,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ ...spring, delay: delay + 0.1 }}
              />
            </div>
          </div>
          
          {/* Chevron / Check */}
          <div style={{ flexShrink: 0 }}>
            {isComplete ? (
              <div
                style={{ 
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#69BE28',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Check className="w-3.5 h-3.5" style={{ color: '#002244' }} />
              </div>
            ) : (
              <ChevronRight className="w-4 h-4" style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
            )}
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}
