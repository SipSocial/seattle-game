'use client'

import { forwardRef, useCallback } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { AudioManager } from '@/src/game/systems/AudioManager'

interface NavigationArrowProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  direction: 'left' | 'right'
  size?: 'sm' | 'md' | 'lg'
}

const sizeStyles = {
  sm: { button: 40, icon: 16 },
  md: { button: 48, icon: 20 },
  lg: { button: 56, icon: 24 },
}

export const NavigationArrow = forwardRef<HTMLButtonElement, NavigationArrowProps>(
  ({ direction, size = 'md', className = '', disabled, onClick, ...props }, ref) => {
    const s = sizeStyles[size]
    
    // Wrap onClick to add audio feedback
    const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled) {
        AudioManager.playClick()
      }
      onClick?.(e)
    }, [onClick, disabled])
    
    return (
      <motion.button
        ref={ref}
        className={`
          rounded-full
          flex items-center justify-center
          backdrop-blur-md
          transition-all
          ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
        style={{
          width: s.button,
          height: s.button,
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(105, 190, 40, 0.3)',
        }}
        whileHover={!disabled ? {
          background: 'rgba(105, 190, 40, 0.2)',
          borderColor: 'rgba(105, 190, 40, 0.6)',
          scale: 1.05,
        } : undefined}
        whileTap={!disabled ? { scale: 0.9 } : undefined}
        disabled={disabled}
        onClick={handleClick}
        {...props}
      >
        <svg
          width={s.icon}
          height={s.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#69BE28"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {direction === 'left' ? (
            <path d="M15 19l-7-7 7-7" />
          ) : (
            <path d="M9 5l7 7-7 7" />
          )}
        </svg>
      </motion.button>
    )
  }
)

NavigationArrow.displayName = 'NavigationArrow'

interface NavigationArrowsProps {
  onPrev: () => void
  onNext: () => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disablePrev?: boolean
  disableNext?: boolean
}

export function NavigationArrows({
  onPrev,
  onNext,
  size = 'md',
  className = '',
  disablePrev = false,
  disableNext = false,
}: NavigationArrowsProps) {
  return (
    <>
      <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${className}`}>
        <NavigationArrow
          direction="left"
          size={size}
          onClick={onPrev}
          disabled={disablePrev}
        />
      </div>
      <div className={`absolute right-4 top-1/2 -translate-y-1/2 ${className}`}>
        <NavigationArrow
          direction="right"
          size={size}
          onClick={onNext}
          disabled={disableNext}
        />
      </div>
    </>
  )
}

export default NavigationArrows
