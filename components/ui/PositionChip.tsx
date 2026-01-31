'use client'

import { forwardRef } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'

interface PositionChipProps extends Omit<HTMLMotionProps<'span'>, 'children'> {
  position: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeStyles = {
  sm: {
    padding: '1px 8px',
    fontSize: '8px',
    minWidth: '32px',
  },
  md: {
    padding: '1px 10px',
    fontSize: '9px',
    minWidth: '36px',
  },
  lg: {
    padding: '2px 14px',
    fontSize: '10px',
    minWidth: '44px',
  },
}

export const PositionChip = forwardRef<HTMLSpanElement, PositionChipProps>(
  ({ position, size = 'md', className = '', style, ...props }, ref) => {
    const s = sizeStyles[size]
    
    return (
      <motion.span
        ref={ref}
        className={`
          inline-flex items-center justify-center
          rounded-full
          font-black uppercase tracking-widest
          ${className}
        `}
        style={{
          padding: s.padding,
          fontSize: s.fontSize,
          minWidth: s.minWidth,
          background: 'linear-gradient(135deg, #69BE28 0%, #4a9c1c 100%)',
          boxShadow: '0 4px 16px rgba(105, 190, 40, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
          color: '#000000',
          ...style,
        }}
        whileHover={{ scale: 1.05 }}
        {...props}
      >
        {position}
      </motion.span>
    )
  }
)

PositionChip.displayName = 'PositionChip'

export default PositionChip
