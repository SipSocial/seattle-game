'use client'

import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
  className?: string
}

const sizeStyles = {
  sm: { spinner: 24, border: 2, text: '12px' },
  md: { spinner: 40, border: 3, text: '14px' },
  lg: { spinner: 56, border: 4, text: '16px' },
  xl: { spinner: 72, border: 5, text: '18px' },
}

export function LoadingSpinner({
  size = 'md',
  text,
  className = '',
}: LoadingSpinnerProps) {
  const s = sizeStyles[size]
  
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <motion.div
        style={{
          width: s.spinner,
          height: s.spinner,
          border: `${s.border}px solid rgba(105, 190, 40, 0.2)`,
          borderTopColor: '#69BE28',
          borderRadius: '50%',
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-bold uppercase tracking-wider"
          style={{
            fontSize: s.text,
            color: '#69BE28',
            fontFamily: 'var(--font-oswald), "Oswald", sans-serif',
          }}
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}

export default LoadingSpinner
