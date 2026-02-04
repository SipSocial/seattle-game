'use client'

/**
 * V5 Category Picks Page - Coinbase/Kalshi-quality card swipe experience
 * 
 * Premium features:
 * - Full-screen cards for each question
 * - Buttery smooth swipe animations
 * - Segmented progress bar
 * - Premium betting slip feel
 * - GlassCard styling throughout
 * - NO EMOJIS - Lucide icons only
 * 
 * Design: Senior designer level polish
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useState, useEffect } from 'react'
import { 
  usePicksStore,
  formatTimeUntilLock,
} from '@/src/v5/store/picksStore'
import {
  PickCategory,
  PICK_CATEGORIES,
  getPicksByCategory,
  getNextCategory,
  CATEGORY_ORDER,
  CategoryIcon,
} from '@/src/v5/data/propPicks'
import { PickCard } from '@/components/picks/PickCard'
import { SegmentedProgress } from '@/components/ui/ProgressBar'
import { GhostButton } from '@/components/ui/GhostButton'
import { GradientButton } from '@/components/ui/GradientButton'
import { 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Zap,
  Star,
  Trophy,
  PartyPopper,
  Target,
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

export default function CategoryPicksPage() {
  const params = useParams()
  const router = useRouter()
  const category = params.category as PickCategory
  
  const {
    setAnswer,
    setTiebreakerScore,
    getAnswerForPick,
    getCategoryProgress,
    getProgress,
    isLocked,
    getTimeUntilLock,
    tiebreakerScore,
  } = usePicksStore()
  
  // Validate category
  const isValidCategory = CATEGORY_ORDER.includes(category)
  const categoryMeta = isValidCategory ? PICK_CATEGORIES[category] : null
  const categoryPicks = isValidCategory ? getPicksByCategory(category) : []
  
  // Local state for current pick index within this category
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0) // -1 for prev, 1 for next
  const [timeUntilLock, setTimeUntilLock] = useState(getTimeUntilLock())
  const [mounted, setMounted] = useState(false)
  
  const currentPick = categoryPicks[currentIndex]
  const progress = getCategoryProgress(category)
  const totalProgress = getProgress()
  const locked = isLocked()
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
  
  // Redirect if invalid category
  useEffect(() => {
    if (!isValidCategory) {
      router.replace('/v5/picks')
    }
  }, [isValidCategory, router])
  
  // Handle answer selection
  const handleSelect = useCallback((optionId: string) => {
    if (!currentPick || locked) return
    
    setAnswer(currentPick.id, optionId)
    
    // Auto-advance after selection with small delay
    setTimeout(() => {
      if (currentIndex < categoryPicks.length - 1) {
        setDirection(1)
        setCurrentIndex(currentIndex + 1)
      }
    }, 300)
  }, [currentPick, currentIndex, categoryPicks.length, setAnswer, locked])
  
  // Navigation handlers
  const goToNext = useCallback(() => {
    if (currentIndex < categoryPicks.length - 1) {
      setDirection(1)
      setCurrentIndex(currentIndex + 1)
    } else {
      // End of category - go to next category or confirm
      const nextCategory = getNextCategory(category)
      if (nextCategory) {
        router.push(`/v5/picks/${nextCategory}`)
      } else {
        router.push('/v5/picks/confirm')
      }
    }
  }, [currentIndex, categoryPicks.length, category, router])
  
  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1)
      setCurrentIndex(currentIndex - 1)
    } else {
      // Start of category - go to previous category
      const categoryIndex = CATEGORY_ORDER.indexOf(category)
      if (categoryIndex > 0) {
        const prevCategory = CATEGORY_ORDER[categoryIndex - 1]
        router.push(`/v5/picks/${prevCategory}`)
      } else {
        router.push('/v5/picks')
      }
    }
  }, [currentIndex, category, router])
  
  const goToHub = useCallback(() => {
    router.push('/v5/picks')
  }, [router])
  
  if (!isValidCategory || !categoryMeta || !currentPick) {
    return null
  }
  
  const currentAnswer = getAnswerForPick(currentPick.id)
  const isLastPick = currentIndex === categoryPicks.length - 1
  const isLastCategory = category === 'tiebreaker'
  
  // Get icon component
  const IconComponent = CategoryIcons[categoryMeta.icon]
  
  // Animation variants for card transitions
  const cardVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.9,
    }),
  }

  return (
    <div 
      className="fixed inset-0 flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #000A14 0%, #001428 100%)',
      }}
    >
      {/* Header */}
      <motion.header 
        className="shrink-0"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : -10 }}
        transition={spring}
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + var(--space-3))',
          paddingBottom: 'var(--space-3)',
          paddingLeft: 'var(--space-4)',
          paddingRight: 'var(--space-4)',
        }}
      >
        <div 
          className="flex items-center justify-between" 
          style={{ marginBottom: 'var(--space-3)' }}
        >
          {/* Back button */}
          <motion.button
            onClick={goToHub}
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
          
          {/* Category title with icon */}
          <div className="text-center">
            <div 
              className="flex items-center justify-center" 
              style={{ gap: 'var(--space-2)' }}
            >
              <IconComponent 
                className="w-5 h-5" 
                style={{ color: categoryMeta.color }}
              />
              <h1
                className="font-display"
                style={{
                  fontSize: 'var(--text-body)',
                  color: categoryMeta.color,
                  letterSpacing: '0.05em',
                }}
              >
                {categoryMeta.name.toUpperCase()}
              </h1>
            </div>
            <p
              style={{
                fontSize: 'var(--text-micro)',
                color: 'rgba(255, 255, 255, 0.4)',
                marginTop: 'var(--space-1)',
              }}
            >
              {currentIndex + 1} of {categoryPicks.length}
            </p>
          </div>
          
          {/* Timer */}
          <div 
            className="text-right flex items-center"
            style={{ 
              minWidth: '60px',
              gap: 'var(--space-1)',
            }}
          >
            {isUrgent && <Clock className="w-4 h-4" style={{ color: '#EF4444' }} />}
            <span
              className="font-display"
              style={{
                fontSize: 'var(--text-body)',
                color: isUrgent ? '#EF4444' : '#69BE28',
                fontWeight: 600,
              }}
            >
              {formatTimeUntilLock(timeUntilLock)}
            </span>
          </div>
        </div>
        
        {/* Progress bar */}
        <SegmentedProgress 
          current={progress.answered} 
          total={progress.total}
        />
        
        {/* Overall progress */}
        <div
          className="text-center"
          style={{
            marginTop: 'var(--space-2)',
            fontSize: 'var(--text-micro)',
            color: 'rgba(255, 255, 255, 0.3)',
          }}
        >
          {totalProgress.answered}/{totalProgress.total} total picks
        </div>
      </motion.header>
      
      {/* Card area */}
      <div 
        className="flex-1 flex items-center justify-center overflow-hidden"
        style={{
          paddingLeft: 'var(--space-4)',
          paddingRight: 'var(--space-4)',
          paddingTop: 'var(--space-4)',
          paddingBottom: 'var(--space-4)',
        }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentPick.id}
            custom={direction}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={spring}
            className="w-full"
          >
            <PickCard
              pick={currentPick}
              selectedOptionId={currentAnswer?.optionId}
              tiebreakerScore={tiebreakerScore}
              onSelect={handleSelect}
              onTiebreakerChange={setTiebreakerScore}
              onSwipeLeft={goToNext}
              onSwipeRight={goToPrev}
              disabled={locked}
            />
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Bottom navigation */}
      <motion.div 
        className="shrink-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
        transition={{ ...spring, delay: 0.2 }}
        style={{
          paddingLeft: 'var(--space-4)',
          paddingRight: 'var(--space-4)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 100px)',
        }}
      >
        <div className="flex" style={{ gap: 'var(--space-3)' }}>
          {/* Previous */}
          <div style={{ flex: 1 }}>
            <GhostButton 
              size="lg" 
              fullWidth
              onClick={goToPrev}
              icon={<ChevronLeft className="w-5 h-5" />}
              iconPosition="left"
            >
              PREV
            </GhostButton>
          </div>
          
          {/* Next / Skip / Finish */}
          <div style={{ flex: 2 }}>
            {currentAnswer ? (
              <GradientButton 
                size="lg" 
                fullWidth
                onClick={goToNext}
                icon={<ChevronRight className="w-5 h-5" />}
              >
                {isLastPick && isLastCategory
                  ? 'FINISH'
                  : isLastPick
                    ? 'NEXT CATEGORY'
                    : 'NEXT'
                }
              </GradientButton>
            ) : (
              <GhostButton 
                size="lg" 
                fullWidth
                variant="subtle"
                onClick={goToNext}
              >
                {isLastPick && isLastCategory
                  ? 'FINISH'
                  : isLastPick
                    ? 'NEXT CATEGORY'
                    : 'SKIP'
                }
              </GhostButton>
            )}
          </div>
        </div>
        
        {/* Swipe hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center"
          style={{
            marginTop: 'var(--space-3)',
            fontSize: 'var(--text-micro)',
            color: 'rgba(255, 255, 255, 0.3)',
          }}
        >
          Swipe left/right to navigate
        </motion.p>
      </motion.div>
    </div>
  )
}
