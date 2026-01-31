'use client'

import { forwardRef } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'

interface StatDisplayProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  value: string | number
  label: string
  size?: 'sm' | 'md' | 'lg'
  glow?: boolean
}

const sizeStyles = {
  sm: {
    valueSize: '20px',
    labelSize: '8px',
  },
  md: {
    valueSize: '30px',
    labelSize: '9px',
  },
  lg: {
    valueSize: '42px',
    labelSize: '10px',
  },
}

// Format stat labels for display
const formatLabel = (label: string): string => {
  const labelMap: Record<string, string> = {
    forcedFumbles: 'FF',
    interceptions: 'INT',
    passDefended: 'PD',
    qbHits: 'QB HITS',
    tfl: 'TFL',
    tackles: 'TACKLES',
    sacks: 'SACKS',
  }
  return labelMap[label] || label.toUpperCase()
}

export const StatDisplay = forwardRef<HTMLDivElement, StatDisplayProps>(
  ({ value, label, size = 'md', glow = true, className = '', style, ...props }, ref) => {
    const s = sizeStyles[size]
    
    return (
      <motion.div
        ref={ref}
        className={`text-center ${className}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={style}
        {...props}
      >
        <div
          className="font-black text-white"
          style={{
            fontSize: s.valueSize,
            fontFamily: 'var(--font-oswald), "Oswald", sans-serif',
            textShadow: glow ? '0 0 20px rgba(105, 190, 40, 0.5)' : 'none',
          }}
        >
          {value}
        </div>
        <div
          className="uppercase tracking-wider font-bold"
          style={{
            fontSize: s.labelSize,
            color: 'rgba(105, 190, 40, 0.6)',
          }}
        >
          {formatLabel(label)}
        </div>
      </motion.div>
    )
  }
)

StatDisplay.displayName = 'StatDisplay'

export default StatDisplay
