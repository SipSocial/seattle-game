'use client'

import { motion } from 'framer-motion'

interface ProgressBarProps {
  progress: number // 0-100
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'gradient'
}

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }

const sizeStyles = {
  sm: { height: '4px', borderRadius: '2px' },
  md: { height: '8px', borderRadius: '4px' },
  lg: { height: '12px', borderRadius: '6px' },
}

const variantStyles = {
  default: {
    fill: '#69BE28',
    glow: 'rgba(105, 190, 40, 0.4)',
  },
  success: {
    fill: '#22c55e',
    glow: 'rgba(34, 197, 94, 0.4)',
  },
  gradient: {
    fill: 'linear-gradient(90deg, #69BE28 0%, #8BD44A 50%, #69BE28 100%)',
    glow: 'rgba(105, 190, 40, 0.4)',
  },
}

export function ProgressBar({ 
  progress, 
  showLabel = false,
  size = 'md',
  variant = 'default',
}: ProgressBarProps) {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, progress))
  const styles = sizeStyles[size]
  const colors = variantStyles[variant]
  
  return (
    <div className="w-full">
      {/* Label */}
      {showLabel && (
        <div 
          className="flex justify-between items-center mb-2"
          style={{ paddingLeft: '2px', paddingRight: '2px' }}
        >
          <span
            className="text-[12px] uppercase tracking-widest font-medium"
            style={{ color: 'rgba(255, 255, 255, 0.6)' }}
          >
            Progress
          </span>
          <motion.span
            key={clampedProgress}
            className="text-[14px] font-bold"
            style={{ 
              color: '#69BE28',
              fontFamily: 'var(--font-oswald), sans-serif',
            }}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={spring}
          >
            {Math.round(clampedProgress)}%
          </motion.span>
        </div>
      )}
      
      {/* Track */}
      <div
        className="relative overflow-hidden w-full"
        style={{
          height: styles.height,
          borderRadius: styles.borderRadius,
          background: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Fill */}
        <motion.div
          className="absolute inset-y-0 left-0"
          style={{
            background: variant === 'gradient' ? colors.fill : colors.fill,
            borderRadius: styles.borderRadius,
            boxShadow: `0 0 10px ${colors.glow}`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ ...spring, delay: 0.1 }}
        />
        
        {/* Shine effect */}
        {clampedProgress > 0 && (
          <motion.div
            className="absolute inset-y-0"
            style={{
              width: '50%',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
              borderRadius: styles.borderRadius,
            }}
            initial={{ left: '-50%' }}
            animate={{ left: '100%' }}
            transition={{
              duration: 1.5,
              delay: 0.5,
              repeat: Infinity,
              repeatDelay: 3,
              ease: 'easeInOut',
            }}
          />
        )}
      </div>
    </div>
  )
}

// Segmented progress variant for picks/steps
interface SegmentedProgressProps {
  current: number
  total: number
  showLabel?: boolean
}

export function SegmentedProgress({ 
  current, 
  total, 
  showLabel = false 
}: SegmentedProgressProps) {
  return (
    <div className="w-full">
      {/* Label */}
      {showLabel && (
        <div 
          className="flex justify-between items-center mb-2"
          style={{ paddingLeft: '2px', paddingRight: '2px' }}
        >
          <span
            className="text-[12px] uppercase tracking-widest font-medium"
            style={{ color: 'rgba(255, 255, 255, 0.6)' }}
          >
            Completed
          </span>
          <span
            className="text-[14px] font-bold"
            style={{ 
              color: '#69BE28',
              fontFamily: 'var(--font-oswald), sans-serif',
            }}
          >
            {current} / {total}
          </span>
        </div>
      )}
      
      {/* Segments */}
      <div className="flex gap-1 w-full">
        {Array.from({ length: total }).map((_, index) => {
          const isComplete = index < current
          const isCurrent = index === current
          
          return (
            <motion.div
              key={index}
              className="flex-1 h-2 rounded-full"
              style={{
                background: isComplete 
                  ? '#69BE28' 
                  : isCurrent 
                    ? 'rgba(105, 190, 40, 0.4)' 
                    : 'rgba(255, 255, 255, 0.1)',
                boxShadow: isComplete ? '0 0 8px rgba(105, 190, 40, 0.4)' : 'none',
              }}
              initial={false}
              animate={{
                scale: isCurrent ? [1, 1.1, 1] : 1,
              }}
              transition={{
                scale: {
                  duration: 1,
                  repeat: isCurrent ? Infinity : 0,
                  ease: 'easeInOut',
                },
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

export default ProgressBar
