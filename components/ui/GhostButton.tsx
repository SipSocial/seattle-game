'use client'

import { ReactNode, forwardRef } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'

export interface ButtonSize {
  height: string
  paddingX: string
  fontSize: string
  gap: string
  iconSize: string
}

// Consistent button sizes - MUST match GradientButton
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

interface GhostButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  variant?: 'default' | 'green' | 'subtle'
  radius?: 'sm' | 'md' | 'lg' | 'full'
}

const VARIANTS = {
  default: {
    bg: 'rgba(255, 255, 255, 0.06)',
    bgHover: 'rgba(255, 255, 255, 0.12)',
    border: 'rgba(255, 255, 255, 0.15)',
    borderHover: 'rgba(255, 255, 255, 0.25)',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  green: {
    bg: 'rgba(105, 190, 40, 0.08)',
    bgHover: 'rgba(105, 190, 40, 0.18)',
    border: 'rgba(105, 190, 40, 0.25)',
    borderHover: 'rgba(105, 190, 40, 0.5)',
    color: 'var(--seahawks-green)',
  },
  subtle: {
    bg: 'transparent',
    bgHover: 'rgba(255, 255, 255, 0.08)',
    border: 'transparent',
    borderHover: 'rgba(255, 255, 255, 0.15)',
    color: 'rgba(255, 255, 255, 0.7)',
  },
}

export const GhostButton = forwardRef<HTMLButtonElement, GhostButtonProps>(
  ({ 
    children, 
    size = 'md',
    fullWidth = false,
    icon,
    iconPosition = 'right',
    variant = 'default',
    radius = 'full',
    className = '',
    disabled,
    style,
    ...props 
  }, ref) => {
    const s = BUTTON_SIZES[size]
    const v = VARIANTS[variant]
    
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
          font-semibold uppercase tracking-wider
          backdrop-blur-sm
          select-none
          ${fullWidth ? 'w-full' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
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
          background: v.bg,
          border: `1.5px solid ${v.border}`,
          color: v.color,
          fontFamily: 'var(--font-oswald), "Oswald", sans-serif',
          letterSpacing: '0.08em',
          WebkitTapHighlightColor: 'transparent',
          ...style,
        }}
        whileHover={!disabled ? { 
          background: v.bgHover,
          borderColor: v.borderHover,
          scale: 1.02,
        } : undefined}
        whileTap={!disabled ? { scale: 0.97 } : undefined}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        disabled={disabled}
        {...props}
      >
        {icon && iconPosition === 'left' && (
          <span 
            className="flex items-center justify-center shrink-0"
            style={{ width: s.iconSize, height: s.iconSize }}
          >
            {icon}
          </span>
        )}
        <span className="whitespace-nowrap">{children}</span>
        {icon && iconPosition === 'right' && (
          <span 
            className="flex items-center justify-center shrink-0"
            style={{ width: s.iconSize, height: s.iconSize }}
          >
            {icon}
          </span>
        )}
      </motion.button>
    )
  }
)

GhostButton.displayName = 'GhostButton'

export default GhostButton
