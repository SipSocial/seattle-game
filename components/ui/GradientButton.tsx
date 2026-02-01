'use client'

import { ReactNode, forwardRef, useCallback } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { AudioManager } from '@/src/game/systems/AudioManager'

export interface ButtonSize {
  height: string
  paddingX: string
  fontSize: string
  gap: string
  iconSize: string
}

// Consistent button sizes using CSS custom properties
const BUTTON_SIZES: Record<'sm' | 'md' | 'lg' | 'xl', ButtonSize> = {
  sm: {
    height: 'var(--btn-height-sm)',
    paddingX: 'var(--btn-padding-sm)',
    fontSize: 'var(--btn-font-sm)',
    gap: 'var(--btn-gap-sm)',
    iconSize: '16px',
  },
  md: {
    height: 'var(--btn-height-md)',
    paddingX: 'var(--btn-padding-md)',
    fontSize: 'var(--btn-font-md)',
    gap: 'var(--btn-gap-md)',
    iconSize: '18px',
  },
  lg: {
    height: 'var(--btn-height-lg)',
    paddingX: 'var(--btn-padding-lg)',
    fontSize: 'var(--btn-font-lg)',
    gap: 'var(--btn-gap-lg)',
    iconSize: '20px',
  },
  xl: {
    height: 'var(--btn-height-xl)',
    paddingX: 'var(--btn-padding-xl)',
    fontSize: 'var(--btn-font-xl)',
    gap: 'var(--btn-gap-xl)',
    iconSize: '22px',
  },
}

interface GradientButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  loading?: boolean
  radius?: 'sm' | 'md' | 'lg' | 'full'
}

export const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ 
    children, 
    size = 'md',
    fullWidth = false,
    icon,
    iconPosition = 'right',
    loading = false,
    radius = 'full',
    className = '',
    disabled,
    style,
    onClick,
    ...props 
  }, ref) => {
    const s = BUTTON_SIZES[size]
    
    // Wrap onClick to add audio feedback - primary buttons get confirm sound
    const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !loading) {
        AudioManager.playConfirm()
      }
      onClick?.(e)
    }, [onClick, disabled, loading])
    
    const radiusMap = {
      sm: 'var(--btn-radius-sm)',
      md: 'var(--btn-radius-md)',
      lg: 'var(--btn-radius-lg)',
      full: 'var(--btn-radius-full)',
    }
    
    return (
      <motion.button
        ref={ref}
        className={`
          relative overflow-hidden
          inline-flex items-center justify-center
          font-bold uppercase tracking-wider
          select-none
          ${fullWidth ? 'w-full' : ''}
          ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
        style={{
          height: s.height,
          minHeight: s.height,
          paddingLeft: s.paddingX,
          paddingRight: s.paddingX,
          fontSize: s.fontSize,
          gap: s.gap,
          borderRadius: radiusMap[radius],
          background: 'linear-gradient(135deg, var(--seahawks-green) 0%, var(--seahawks-green-dark) 100%)',
          boxShadow: '0 4px 20px rgba(105, 190, 40, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          color: 'var(--seahawks-navy)',
          fontFamily: 'var(--font-oswald), "Oswald", sans-serif',
          letterSpacing: '0.08em',
          border: 'none',
          WebkitTapHighlightColor: 'transparent',
          ...style,
        }}
        whileHover={!disabled && !loading ? { 
          scale: 1.02,
          boxShadow: '0 8px 32px rgba(105, 190, 40, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
        } : undefined}
        whileTap={!disabled && !loading ? { scale: 0.97 } : undefined}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {/* Shine effect on hover */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
          }}
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
        
        {/* Content */}
        {loading ? (
          <motion.div
            style={{ 
              width: s.iconSize, 
              height: s.iconSize,
              borderWidth: '2px',
              borderStyle: 'solid',
              borderColor: 'currentColor',
              borderTopColor: 'transparent',
              borderRadius: '50%',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <span 
                className="relative z-10 flex items-center justify-center shrink-0"
                style={{ width: s.iconSize, height: s.iconSize }}
              >
                {icon}
              </span>
            )}
            <span className="relative z-10 whitespace-nowrap">{children}</span>
            {icon && iconPosition === 'right' && (
              <span 
                className="relative z-10 flex items-center justify-center shrink-0"
                style={{ width: s.iconSize, height: s.iconSize }}
              >
                {icon}
              </span>
            )}
          </>
        )}
      </motion.button>
    )
  }
)

GradientButton.displayName = 'GradientButton'

export default GradientButton
