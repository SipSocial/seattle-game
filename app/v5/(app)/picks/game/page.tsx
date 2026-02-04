'use client'

/**
 * Picks Game Page - Centered card with properly positioned buttons
 * 
 * Layout:
 * - Header at top
 * - Card centered in available space
 * - Buttons positioned just below card (not at bottom of screen)
 * - Accounts for tab bar (65px) + safe area
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useCallback, useState, useEffect } from 'react'
import { 
  usePicksStore,
  formatTimeUntilLock,
} from '@/src/v5/store/picksStore'
import {
  PROP_PICKS,
  PICK_CATEGORIES,
  CategoryIcon,
} from '@/src/v5/data/propPicks'
import { PickCard } from '@/components/picks/PickCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { GhostButton } from '@/components/ui/GhostButton'
import { 
  CheckCircle2, 
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
const totalPicks = PROP_PICKS.length

const CategoryIcons: Record<CategoryIcon, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  football: Zap,
  star: Star,
  trophy: Trophy,
  party: PartyPopper,
  target: Target,
}

export default function PicksGamePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  
  const {
    setAnswer,
    setTiebreakerScore,
    getAnswerForPick,
    getProgress,
    isLocked,
    isComplete,
    getTimeUntilLock,
    tiebreakerScore,
  } = usePicksStore()
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [timeUntilLock, setTimeUntilLock] = useState(getTimeUntilLock())
  const [showCompleteButton, setShowCompleteButton] = useState(false)
  
  const currentPick = PROP_PICKS[currentIndex]
  const progress = getProgress()
  const locked = isLocked()
  const complete = isComplete()
  const progressPercent = (progress.answered / progress.total) * 100
  const isUrgent = timeUntilLock < 3600000
  
  useEffect(() => { setMounted(true) }, [])
  
  useEffect(() => {
    const interval = setInterval(() => setTimeUntilLock(getTimeUntilLock()), 1000)
    return () => clearInterval(interval)
  }, [getTimeUntilLock])
  
  useEffect(() => { setShowCompleteButton(complete) }, [complete])
  
  const handleSelect = useCallback((optionId: string) => {
    if (!currentPick || locked) return
    setAnswer(currentPick.id, optionId)
    setTimeout(() => {
      if (currentIndex < totalPicks - 1) {
        setDirection(1)
        setCurrentIndex(currentIndex + 1)
      }
    }, 300)
  }, [currentPick, currentIndex, setAnswer, locked])
  
  const goToNext = useCallback(() => {
    if (currentIndex < totalPicks - 1) {
      setDirection(1)
      setCurrentIndex(currentIndex + 1)
    }
  }, [currentIndex])
  
  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1)
      setCurrentIndex(currentIndex - 1)
    }
  }, [currentIndex])
  
  const goToHub = useCallback(() => router.push('/v5/picks'), [router])
  const goToConfirm = useCallback(() => router.push('/v5/picks/confirm'), [router])
  
  if (!currentPick) return null
  
  const currentAnswer = getAnswerForPick(currentPick.id)
  const categoryMeta = PICK_CATEGORIES[currentPick.category]
  const isFirstPick = currentIndex === 0
  const isLastPick = currentIndex === totalPicks - 1
  const IconComponent = CategoryIcons[categoryMeta.icon]
  
  const cardVariants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0, scale: 0.9 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0, scale: 0.9 }),
  }

  return (
    <div 
      className="fixed inset-0 flex flex-col" 
      style={{ 
        background: '#002244',
        // Don't add bottom padding here - parent layout handles tab bar
      }}
    >
      {/* Gradient overlays */}
      <div className="absolute inset-x-0 top-0 pointer-events-none" style={{ height: '30%', background: 'linear-gradient(180deg, rgba(0,10,20,0.95) 0%, transparent 100%)' }} />

      {/* Header */}
      <motion.header 
        className="relative z-10 shrink-0"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : -10 }}
        transition={spring}
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
          paddingBottom: '12px',
          paddingLeft: '16px',
          paddingRight: '16px',
        }}
      >
        <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
          {/* Back button */}
          <motion.button
            onClick={goToHub}
            whileTap={{ scale: 0.9 }}
            className="flex items-center justify-center"
            style={{ 
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
            }}
          >
            <ChevronLeft size={18} color="white" />
          </motion.button>
          
          {/* Progress indicator */}
          <div className="text-center flex-1" style={{ marginLeft: '12px', marginRight: '12px' }}>
            <div className="flex items-center justify-center" style={{ gap: '6px', marginBottom: '2px' }}>
              <IconComponent style={{ width: '14px', height: '14px', color: categoryMeta.color }} />
              <span style={{ fontSize: '11px', color: categoryMeta.color, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
                {categoryMeta.name}
              </span>
            </div>
            <p style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', letterSpacing: '0.1em' }}>
              Pick {currentIndex + 1} of {totalPicks}
            </p>
          </div>
          
          {/* Timer */}
          <div className="flex items-center" style={{ gap: '4px' }}>
            {isUrgent && <Clock size={12} style={{ color: '#EF4444' }} />}
            <span style={{ fontSize: '12px', color: isUrgent ? '#EF4444' : '#69BE28', fontWeight: 600 }}>
              {formatTimeUntilLock(timeUntilLock)}
            </span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{ height: '4px', borderRadius: '100px', background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', borderRadius: '100px', background: '#69BE28' }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={spring}
            />
          </div>
        </div>
        
        {/* Picks counter */}
        <div className="flex items-center justify-center" style={{ gap: '6px' }}>
          <motion.span
            key={progress.answered}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            style={{ fontSize: '14px', color: '#69BE28', fontWeight: 700 }}
          >
            {progress.answered}
          </motion.span>
          <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', letterSpacing: '0.1em' }}>
            of {progress.total} picks
          </span>
          {complete && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={spring}>
              <CheckCircle2 size={14} style={{ color: '#69BE28' }} />
            </motion.div>
          )}
        </div>
      </motion.header>
      
      {/* Card + Controls container - positions content at optimal spot */}
      <div 
        className="relative z-10 flex-1 flex flex-col items-center overflow-hidden"
        style={{ padding: '24px 16px 16px' }}
      >
        {/* Card */}
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
            style={{ maxWidth: '400px' }}
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
        
        {/* Controls - directly below card with fixed margin */}
        <motion.div 
          className="w-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 10 }}
          transition={{ ...spring, delay: 0.1 }}
          style={{ maxWidth: '400px', marginTop: '24px' }}
        >
          {/* Complete button */}
          <AnimatePresence>
            {showCompleteButton && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={spring}
                style={{ marginBottom: '10px' }}
              >
                <GradientButton size="md" fullWidth onClick={goToConfirm} icon={<CheckCircle2 size={16} />} iconPosition="left">
                  COMPLETE PICKS
                </GradientButton>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Nav buttons */}
          <div className="flex" style={{ gap: '12px' }}>
            <GhostButton size="md" onClick={goToPrev} disabled={isFirstPick} style={{ flex: 1 }} icon={<ChevronLeft size={16} />} iconPosition="left">
              PREV
            </GhostButton>
            
            {currentAnswer ? (
              <GradientButton size="md" onClick={isLastPick ? goToConfirm : goToNext} style={{ flex: 2 }} icon={<ChevronRight size={16} />}>
                {isLastPick ? (complete ? 'REVIEW' : 'FINISH') : 'NEXT'}
              </GradientButton>
            ) : (
              <GhostButton size="md" variant="subtle" onClick={isLastPick ? goToConfirm : goToNext} style={{ flex: 2 }}>
                {isLastPick ? (complete ? 'REVIEW' : 'FINISH') : 'SKIP'}
              </GhostButton>
            )}
          </div>
          
          {/* Swipe hint */}
          <p className="text-center" style={{ marginTop: '14px', fontSize: '9px', color: 'rgba(255, 255, 255, 0.2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Swipe to navigate
          </p>
        </motion.div>
      </div>
    </div>
  )
}
