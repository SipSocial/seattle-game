'use client'

import { ReactNode, forwardRef } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'

interface GhostButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  variant?: 'default' | 'green'
}

const sizeStyles = {
  sm: {
    height: '36px',
    padding: '0 16px',
    fontSize: '11px',
  },
  md: {
    height: '44px',
    padding: '0 20px',
    fontSize: '12px',
  },
  lg: {
    height: '52px',
    padding: '0 28px',
    fontSize: '14px',
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
    className = '',
    disabled,
    style,
    ...props 
  }, ref) => {
    const s = sizeStyles[size]
    const isGreen = variant === 'green'
    
    return (
      <motion.button
        ref={ref}
        className={`
          relative overflow-hidden rounded-full
          flex items-center justify-center gap-2
          font-bold uppercase tracking-wider
          backdrop-blur-md
          transition-all
          ${fullWidth ? 'w-full' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
        style={{
          height: s.height,
          padding: s.padding,
          fontSize: s.fontSize,
          background: 'rgba(0, 0, 0, 0.4)',
          border: `1px solid ${isGreen ? 'rgba(105, 190, 40, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
          color: isGreen ? '#69BE28' : 'rgba(255, 255, 255, 0.8)',
          ...style,
        }}
        whileHover={!disabled ? { 
          background: isGreen ? 'rgba(105, 190, 40, 0.15)' : 'rgba(255, 255, 255, 0.1)',
          borderColor: isGreen ? 'rgba(105, 190, 40, 0.5)' : 'rgba(255, 255, 255, 0.2)',
          scale: 1.02,
        } : undefined}
        whileTap={!disabled ? { scale: 0.97 } : undefined}
        disabled={disabled}
        {...props}
      >
        {icon && iconPosition === 'left' && icon}
        <span>{children}</span>
        {icon && iconPosition === 'right' && icon}
      </motion.button>
    )
  }
)

GhostButton.displayName = 'GhostButton'

export default GhostButton
