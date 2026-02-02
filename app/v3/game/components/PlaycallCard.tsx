'use client'

/**
 * V3 Playcall Card Component
 * 
 * Selectable card for route/coverage selection
 * Glass morphism style with selection highlight
 */

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface PlaycallCardProps {
  label: string
  description?: string
  icon?: ReactNode
  selected?: boolean
  onSelect: () => void
  variant?: 'offense' | 'defense'
  disabled?: boolean
  className?: string
}

export function PlaycallCard({
  label,
  description,
  icon,
  selected = false,
  onSelect,
  variant = 'offense',
  disabled = false,
  className = '',
}: PlaycallCardProps) {
  const colors = {
    offense: {
      selected: 'rgba(105, 190, 40, 0.25)',
      border: 'var(--seahawks-green)',
      glow: 'rgba(105, 190, 40, 0.4)',
    },
    defense: {
      selected: 'rgba(255, 107, 107, 0.25)',
      border: '#FF6B6B',
      glow: 'rgba(255, 107, 107, 0.4)',
    },
  }

  const c = colors[variant]

  return (
    <motion.button
      className={`
        relative rounded-xl p-4 text-center
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={{
        background: selected ? c.selected : 'rgba(255, 255, 255, 0.05)',
        border: `2px solid ${selected ? c.border : 'rgba(255, 255, 255, 0.1)'}`,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: selected ? `0 0 20px ${c.glow}` : 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
      whileHover={!disabled ? { scale: 1.03, borderColor: c.border } : undefined}
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={disabled ? undefined : onSelect}
      disabled={disabled}
    >
      {/* Selection indicator */}
      {selected && (
        <motion.div
          className="absolute top-2 right-2 w-3 h-3 rounded-full"
          style={{ background: c.border }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        />
      )}

      {/* Icon */}
      {icon && (
        <div
          className="text-3xl mb-2"
          style={{
            filter: selected ? `drop-shadow(0 0 8px ${c.glow})` : 'none',
          }}
        >
          {icon}
        </div>
      )}

      {/* Label */}
      <div
        className="text-sm font-bold uppercase tracking-wider mb-1"
        style={{
          fontFamily: 'var(--font-oswald)',
          color: selected ? c.border : '#FFFFFF',
        }}
      >
        {label}
      </div>

      {/* Description */}
      {description && (
        <div
          className="text-xs"
          style={{ color: 'rgba(255, 255, 255, 0.5)' }}
        >
          {description}
        </div>
      )}
    </motion.button>
  )
}

export default PlaycallCard
