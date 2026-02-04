'use client'

/**
 * QuarterTabs - Quarter navigation for live questions
 * 
 * Features:
 * - Q1, Q2, Q3, Q4, OT tabs
 * - Active/inactive states
 * - Completion indicators
 * - Smooth animations
 */

import { motion } from 'framer-motion'
import { Quarter, QUARTER_ORDER, QUARTER_INFO } from '@/src/v5/data/liveQuestions'

const spring = { type: 'spring' as const, stiffness: 400, damping: 30 }

interface QuarterTabsProps {
  selectedQuarter: Quarter
  currentQuarter: Quarter
  onSelect: (quarter: Quarter) => void
  quarterProgress: Record<Quarter, { answered: number; correct: number; total: number }>
  isGameActive: boolean
}

export function QuarterTabs({
  selectedQuarter,
  currentQuarter,
  onSelect,
  quarterProgress,
  isGameActive,
}: QuarterTabsProps) {
  return (
    <div 
      className="flex gap-2 p-1 rounded-2xl"
      style={{
        background: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      {QUARTER_ORDER.map((quarter) => {
        const isSelected = quarter === selectedQuarter
        const isCurrent = quarter === currentQuarter && isGameActive
        const progress = quarterProgress[quarter]
        const isComplete = progress.answered === progress.total && progress.total > 0
        const quarterInfo = QUARTER_INFO[quarter]
        
        // Determine if quarter is locked (future quarters during game)
        const currentIndex = QUARTER_ORDER.indexOf(currentQuarter)
        const quarterIndex = QUARTER_ORDER.indexOf(quarter)
        const isLocked = isGameActive && quarterIndex > currentIndex
        
        return (
          <motion.button
            key={quarter}
            className="relative flex-1 py-3 px-2 rounded-xl text-center"
            style={{
              background: isSelected 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'transparent',
              opacity: isLocked ? 0.4 : 1,
              cursor: isLocked ? 'not-allowed' : 'pointer',
            }}
            onClick={() => !isLocked && onSelect(quarter)}
            whileHover={!isLocked ? { scale: 1.02 } : undefined}
            whileTap={!isLocked ? { scale: 0.98 } : undefined}
            transition={spring}
            disabled={isLocked}
          >
            {/* Active indicator */}
            {isSelected && (
              <motion.div
                className="absolute inset-0 rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${quarterInfo.color}20 0%, transparent 100%)`,
                  border: `1px solid ${quarterInfo.color}40`,
                }}
                layoutId="activeTab"
                transition={spring}
              />
            )}
            
            {/* Live pulse for current quarter */}
            {isCurrent && (
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                style={{ background: '#FF4444' }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
            
            {/* Content */}
            <div className="relative z-10">
              <span
                className="block font-bold"
                style={{
                  fontSize: '14px',
                  color: isSelected ? quarterInfo.color : 'rgba(255, 255, 255, 0.7)',
                  letterSpacing: '0.05em',
                }}
              >
                {quarter}
              </span>
              
              {/* Progress indicator */}
              {progress.total > 0 && (
                <div className="flex justify-center gap-0.5 mt-1">
                  {Array.from({ length: progress.total }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: i < progress.answered
                          ? i < progress.correct
                            ? '#69BE28'
                            : 'rgba(255, 255, 255, 0.5)'
                          : 'rgba(255, 255, 255, 0.15)',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Completion checkmark */}
            {isComplete && (
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: '#69BE28' }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={spring}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                >
                  <path
                    d="M2 5L4 7L8 3"
                    stroke="#002244"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

export default QuarterTabs
