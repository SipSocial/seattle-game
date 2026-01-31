'use client'

import { ReactNode, forwardRef } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
  variant?: 'default' | 'green' | 'dark'
  hover?: boolean
  blur?: 'sm' | 'md' | 'lg'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const variants = {
  default: {
    bg: 'rgba(255, 255, 255, 0.05)',
    bgHover: 'rgba(255, 255, 255, 0.08)',
    border: 'rgba(255, 255, 255, 0.1)',
  },
  green: {
    bg: 'rgba(105, 190, 40, 0.1)',
    bgHover: 'rgba(105, 190, 40, 0.15)',
    border: 'rgba(105, 190, 40, 0.3)',
  },
  dark: {
    bg: 'rgba(0, 0, 0, 0.4)',
    bgHover: 'rgba(0, 0, 0, 0.5)',
    border: 'rgba(255, 255, 255, 0.05)',
  },
}

const blurValues = {
  sm: 'blur(4px)',
  md: 'blur(10px)',
  lg: 'blur(20px)',
}

const paddingValues = {
  none: '0',
  sm: '12px',
  md: '16px',
  lg: '24px',
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ 
    children, 
    variant = 'default', 
    hover = false, 
    blur = 'md',
    padding = 'md',
    className = '',
    style,
    ...props 
  }, ref) => {
    const v = variants[variant]
    
    return (
      <motion.div
        ref={ref}
        className={`rounded-2xl ${className}`}
        style={{
          background: v.bg,
          border: `1px solid ${v.border}`,
          backdropFilter: blurValues[blur],
          WebkitBackdropFilter: blurValues[blur],
          padding: paddingValues[padding],
          ...style,
        }}
        whileHover={hover ? {
          background: v.bgHover,
          scale: 1.01,
        } : undefined}
        transition={{ duration: 0.15 }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

GlassCard.displayName = 'GlassCard'

export default GlassCard
