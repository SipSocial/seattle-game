'use client'

import { ReactNode, forwardRef } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'

interface GradientButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  loading?: boolean
}

const sizeStyles = {
  sm: {
    height: '40px',
    padding: '0 20px',
    fontSize: '12px',
    gap: '6px',
  },
  md: {
    height: '52px',
    padding: '0 28px',
    fontSize: '14px',
    gap: '8px',
  },
  lg: {
    height: '64px',
    padding: '0 36px',
    fontSize: '16px',
    gap: '12px',
  },
}

export const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ 
    children, 
    size = 'md',
    fullWidth = false,
    icon,
    iconPosition = 'right',
    loading = false,
    className = '',
    disabled,
    style,
    ...props 
  }, ref) => {
    const s = sizeStyles[size]
    
    return (
      <motion.button
        ref={ref}
        className={`
          relative overflow-hidden rounded-full
          flex items-center justify-center
          font-black uppercase tracking-wide
          transition-all
          ${fullWidth ? 'w-full' : ''}
          ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
        style={{
          height: s.height,
          padding: s.padding,
          fontSize: s.fontSize,
          gap: s.gap,
          background: 'linear-gradient(135deg, #69BE28 0%, #4a9c1c 100%)',
          boxShadow: '0 8px 32px rgba(105, 190, 40, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          color: '#002244',
          fontFamily: 'var(--font-oswald), "Oswald", sans-serif',
          ...style,
        }}
        whileHover={!disabled && !loading ? { 
          scale: 1.02,
          boxShadow: '0 12px 40px rgba(105, 190, 40, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
        } : undefined}
        whileTap={!disabled && !loading ? { scale: 0.97 } : undefined}
        disabled={disabled || loading}
        {...props}
      >
        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
          }}
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
        
        {/* Content */}
        {loading ? (
          <motion.div
            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <span className="relative z-10">{icon}</span>
            )}
            <span className="relative z-10">{children}</span>
            {icon && iconPosition === 'right' && (
              <span className="relative z-10">{icon}</span>
            )}
          </>
        )}
      </motion.button>
    )
  }
)

GradientButton.displayName = 'GradientButton'

export default GradientButton
