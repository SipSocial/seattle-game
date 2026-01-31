'use client'

import { motion } from 'framer-motion'

interface DotIndicatorProps {
  total: number
  current: number
  onSelect?: (index: number) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeStyles = {
  sm: { dot: 6, active: 24, gap: 4 },
  md: { dot: 8, active: 32, gap: 6 },
  lg: { dot: 10, active: 40, gap: 8 },
}

export function DotIndicator({
  total,
  current,
  onSelect,
  size = 'md',
  className = '',
}: DotIndicatorProps) {
  const s = sizeStyles[size]
  
  return (
    <div className={`flex items-center justify-center ${className}`} style={{ gap: s.gap }}>
      {Array.from({ length: total }).map((_, i) => (
        <motion.button
          key={i}
          onClick={() => onSelect?.(i)}
          className="rounded-full transition-all"
          style={{
            height: s.dot,
            cursor: onSelect ? 'pointer' : 'default',
          }}
          animate={{
            width: i === current ? s.active : s.dot,
            backgroundColor: i === current ? '#69BE28' : 'rgba(255, 255, 255, 0.2)',
            boxShadow: i === current 
              ? '0 0 12px rgba(105, 190, 40, 0.5)' 
              : 'none',
          }}
          whileHover={onSelect ? {
            backgroundColor: i === current ? '#69BE28' : 'rgba(255, 255, 255, 0.4)',
          } : undefined}
          transition={{ duration: 0.2 }}
        />
      ))}
    </div>
  )
}

export default DotIndicator
