'use client'

/**
 * Picks Confirmation Page - Coinbase/Kalshi-quality summary
 * 
 * Shows:
 * - All picks summarized by category
 * - "Picks Locked" badge after deadline
 * - Edit button (if before deadline)
 * - Share picks CTA
 * - Entry bonus confirmation
 * - NO EMOJIS - Lucide icons only
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
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
  getPicksByCategory,
  getPickById,
  CategoryIcon,
} from '@/src/v5/data/propPicks'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { GhostButton } from '@/components/ui/GhostButton'
import { 
  CheckCircle, 
  Lock, 
  Edit3, 
  ChevronLeft,
  ChevronRight,
  Share2,
  Clock,
  Zap,
  Star,
  Trophy,
  PartyPopper,
  Target,
  Award,
} from 'lucide-react'

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }

// Icon mapping for categories - NO EMOJIS
const CategoryIcons: Record<CategoryIcon, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  football: Zap,
  star: Star,
  trophy: Trophy,
  party: PartyPopper,
  target: Target,
}

export default function PicksConfirmPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const {
    answers,
    tiebreakerScore,
    getProgress,
    isLocked,
    isComplete,
    getTimeUntilLock,
    lockPicks,
    getCategoryProgress,
  } = usePicksStore()
  
  const progress = getProgress()
  const locked = isLocked()
  const complete = isComplete()
  const [timeUntilLock, setTimeUntilLock] = useState(getTimeUntilLock())
  const [showShareToast, setShowShareToast] = useState(false)
  const isUrgent = timeUntilLock < 3600000
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Update countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUntilLock(getTimeUntilLock())
    }, 1000)
    return () => clearInterval(interval)
  }, [getTimeUntilLock])
  
  // Handle share
  const handleShare = async () => {
    const shareData = {
      title: 'My Big Game Picks',
      text: `I made my prop picks for the Big Game! ${progress.answered}/25 picks locked. Make yours at:`,
      url: window.location.origin + '/v5/picks',
    }
    
    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `${shareData.text}\n${shareData.url}`
        )
        setShowShareToast(true)
        setTimeout(() => setShowShareToast(false), 3000)
      }
    } catch (err) {
      console.log('Share failed:', err)
    }
  }
  
  // Handle lock picks
  const handleLockPicks = () => {
    if (complete) {
      lockPicks()
    }
  }
  
  // Get answer display for a pick
  const getAnswerDisplay = (pickId: string) => {
    const answer = answers.find(a => a.pickId === pickId)
    if (!answer) return null
    
    const pick = getPickById(pickId)
    if (!pick) return null
    
    // Handle tiebreaker
    if (pick.type === 'numeric' && tiebreakerScore) {
      return `${tiebreakerScore.seattle} - ${tiebreakerScore.patriots}`
    }
    
    const option = pick.options.find(o => o.id === answer.optionId)
    return option ? option.label : null
  }

  return (
    <div 
      className="min-h-full flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #000A14 0%, #001428 100%)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 100px)',
      }}
    >
      {/* Header */}
      <motion.header
        className="shrink-0"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : -10 }}
        transition={spring}
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + var(--space-4))',
          paddingBottom: 'var(--space-4)',
          paddingLeft: 'var(--space-5)',
          paddingRight: 'var(--space-5)',
        }}
      >
        {/* Navigation row */}
        <div 
          className="flex items-center justify-between" 
          style={{ marginBottom: 'var(--space-4)' }}
        >
          <Link href="/v5/picks">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="flex items-center justify-center"
              style={{ 
                width: '40px',
                height: '40px',
                borderRadius: '100px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer',
              }}
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </motion.button>
          </Link>
          
          <div className="flex-1" />
          
          {/* Share button */}
          <motion.button
            onClick={handleShare}
            whileTap={{ scale: 0.9 }}
            className="flex items-center justify-center"
            style={{ 
              width: '40px',
              height: '40px',
              borderRadius: '100px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
            }}
          >
            <Share2 className="w-5 h-5 text-white" />
          </motion.button>
        </div>
        
        {/* Title */}
        <div className="text-center">
          <h1 
            className="font-display"
            style={{ 
              fontSize: 'var(--text-title)',
              color: complete ? '#69BE28' : 'rgba(255, 255, 255, 0.9)',
              letterSpacing: '0.05em',
            }}
          >
            {complete ? 'PICKS READY' : 'YOUR PICKS'}
          </h1>
          <p 
            style={{ 
              marginTop: 'var(--space-2)',
              fontSize: 'var(--text-caption)',
              color: 'rgba(255, 255, 255, 0.5)',
            }}
          >
            {progress.answered} of {progress.total} picks made
          </p>
        </div>
      </motion.header>

      {/* Main content */}
      <div 
        style={{ 
          paddingLeft: 'var(--space-5)', 
          paddingRight: 'var(--space-5)',
          maxWidth: '480px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
          transition={{ ...spring, delay: 0.1 }}
          style={{ marginBottom: 'var(--space-5)' }}
        >
          <GlassCard
            padding="lg"
            variant={complete ? 'green' : 'default'}
          >
            <div className="flex items-center justify-between">
              {/* Status */}
              <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: complete 
                      ? 'rgba(105, 190, 40, 0.2)'
                      : locked
                        ? 'rgba(255, 215, 0, 0.15)'
                        : 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {complete ? (
                    <CheckCircle className="w-6 h-6" style={{ color: '#69BE28' }} />
                  ) : locked ? (
                    <Lock className="w-6 h-6" style={{ color: '#FFD700' }} />
                  ) : (
                    <Edit3 className="w-6 h-6" style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                  )}
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: 'var(--text-body)',
                      fontWeight: 600,
                      color: complete ? '#69BE28' : 'rgba(255, 255, 255, 0.9)',
                    }}
                  >
                    {locked 
                      ? 'Picks Locked'
                      : complete 
                        ? 'All Picks Made!'
                        : `${progress.total - progress.answered} picks remaining`
                    }
                  </h2>
                  <p
                    className="flex items-center"
                    style={{
                      fontSize: 'var(--text-caption)',
                      color: 'rgba(255, 255, 255, 0.5)',
                      marginTop: '2px',
                      gap: 'var(--space-1)',
                    }}
                  >
                    {locked ? (
                      'Results revealed after the game'
                    ) : (
                      <>
                        {isUrgent && <Clock className="w-3 h-3" style={{ color: '#EF4444' }} />}
                        <span style={{ color: isUrgent ? '#EF4444' : undefined }}>
                          Locks in {formatTimeUntilLock(timeUntilLock)}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>
              
              {/* Entry badge */}
              {complete && (
                <motion.div
                  className="flex items-center"
                  style={{
                    gap: 'var(--space-1)',
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: '100px',
                    background: 'rgba(255, 215, 0, 0.15)',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ ...spring, delay: 0.3 }}
                >
                  <Award className="w-4 h-4" style={{ color: '#FFD700' }} />
                  <span
                    style={{
                      fontSize: 'var(--text-caption)',
                      fontWeight: 600,
                      color: '#FFD700',
                    }}
                  >
                    +1 ENTRY
                  </span>
                </motion.div>
              )}
            </div>
            
            {/* Lock button (if complete but not locked) */}
            {complete && !locked && (
              <div style={{ marginTop: 'var(--space-4)' }}>
                <GradientButton
                  size="lg"
                  fullWidth
                  onClick={handleLockPicks}
                  icon={<Lock className="w-5 h-5" />}
                  iconPosition="left"
                >
                  LOCK MY PICKS
                </GradientButton>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Categories with picks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {CATEGORY_ORDER.map((category, categoryIndex) => {
            const categoryPicks = getPicksByCategory(category)
            const categoryMeta = PICK_CATEGORIES[category]
            const categoryProgress = getCategoryProgress(category)
            const IconComponent = CategoryIcons[categoryMeta.icon]
            const isCategoryComplete = categoryProgress.answered === categoryProgress.total
            
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
                transition={{ ...spring, delay: 0.15 + categoryIndex * 0.05 }}
              >
                <GlassCard padding="none" variant={isCategoryComplete ? 'green' : 'default'}>
                  {/* Category header */}
                  <div 
                    className="flex items-center justify-between"
                    style={{ 
                      padding: 'var(--space-4) var(--space-4) var(--space-3)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
                      <IconComponent 
                        className="w-5 h-5" 
                        style={{ color: categoryMeta.color }}
                      />
                      <h3
                        style={{
                          fontSize: 'var(--text-body)',
                          fontWeight: 600,
                          color: categoryMeta.color,
                          letterSpacing: '0.03em',
                        }}
                      >
                        {categoryMeta.name}
                      </h3>
                    </div>
                    <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                      <span
                        style={{
                          fontSize: 'var(--text-caption)',
                          color: 'rgba(255, 255, 255, 0.4)',
                        }}
                      >
                        {categoryProgress.answered}/{categoryProgress.total}
                      </span>
                      {isCategoryComplete && (
                        <CheckCircle className="w-4 h-4" style={{ color: '#69BE28' }} />
                      )}
                    </div>
                  </div>
                  
                  {/* Picks list */}
                  <div>
                    {categoryPicks.map((pick, pickIndex) => {
                      const answerDisplay = getAnswerDisplay(pick.id)
                      const hasAnswer = answerDisplay !== null
                      
                      return (
                        <Link
                          key={pick.id}
                          href={locked ? '#' : `/v5/picks/${category}`}
                          onClick={(e) => locked && e.preventDefault()}
                        >
                          <div
                            className="flex items-center justify-between"
                            style={{
                              padding: 'var(--space-3) var(--space-4)',
                              borderBottom: pickIndex < categoryPicks.length - 1 
                                ? '1px solid rgba(255, 255, 255, 0.04)' 
                                : 'none',
                              cursor: locked ? 'default' : 'pointer',
                            }}
                          >
                            <span
                              style={{
                                fontSize: 'var(--text-caption)',
                                color: hasAnswer 
                                  ? 'rgba(255, 255, 255, 0.8)' 
                                  : 'rgba(255, 255, 255, 0.4)',
                                flex: 1,
                                lineHeight: 1.4,
                              }}
                            >
                              {pick.shortQuestion || pick.question}
                            </span>
                            
                            <div 
                              className="flex items-center shrink-0" 
                              style={{ gap: 'var(--space-2)', marginLeft: 'var(--space-3)' }}
                            >
                              {hasAnswer ? (
                                <span
                                  style={{
                                    fontSize: 'var(--text-caption)',
                                    fontWeight: 600,
                                    color: '#69BE28',
                                  }}
                                >
                                  {answerDisplay}
                                </span>
                              ) : (
                                <span
                                  style={{
                                    fontSize: 'var(--text-caption)',
                                    color: 'rgba(255, 255, 255, 0.3)',
                                    fontStyle: 'italic',
                                  }}
                                >
                                  {locked ? '—' : 'Not answered'}
                                </span>
                              )}
                              {!locked && !hasAnswer && (
                                <ChevronRight 
                                  className="w-4 h-4" 
                                  style={{ color: 'rgba(255, 255, 255, 0.2)' }}
                                />
                              )}
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                  
                  {/* Edit button for incomplete categories */}
                  {!locked && categoryProgress.answered < categoryProgress.total && (
                    <Link href={`/v5/picks/${category}`}>
                      <div
                        className="flex items-center justify-center"
                        style={{
                          padding: 'var(--space-3) var(--space-4)',
                          borderTop: '1px dashed rgba(255, 255, 255, 0.1)',
                          gap: 'var(--space-2)',
                          cursor: 'pointer',
                        }}
                      >
                        <Edit3 className="w-4 h-4" style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                        <span
                          style={{
                            fontSize: 'var(--text-caption)',
                            color: 'rgba(255, 255, 255, 0.5)',
                          }}
                        >
                          Complete {categoryProgress.total - categoryProgress.answered} picks
                        </span>
                      </div>
                    </Link>
                  )}
                </GlassCard>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      {!complete && !locked && (
        <motion.div
          className="fixed bottom-0 left-0 right-0"
          style={{
            padding: 'var(--space-4)',
            background: 'linear-gradient(0deg, #001428 0%, transparent 100%)',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
          transition={{ delay: 0.5 }}
        >
          <div style={{ maxWidth: '420px', margin: '0 auto' }}>
            <Link href="/v5/picks/game">
              <GradientButton size="lg" fullWidth>
                CONTINUE PICKS
              </GradientButton>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Share toast */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            className="fixed left-1/2 flex items-center"
            style={{
              bottom: '120px',
              transform: 'translateX(-50%)',
              gap: 'var(--space-2)',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: '100px',
              background: 'rgba(105, 190, 40, 0.95)',
            }}
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
          >
            <CheckCircle className="w-4 h-4" style={{ color: '#002244' }} />
            <span
              style={{
                fontSize: 'var(--text-body)',
                fontWeight: 600,
                color: '#002244',
              }}
            >
              Link copied!
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
