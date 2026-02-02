'use client'

/**
 * V3 Coverage Selector Component
 * 
 * Pre-snap coverage selection for defense mode
 * Displays MAN / ZONE / BLITZ options
 */

import { motion } from 'framer-motion'
import { PlaycallCard } from './PlaycallCard'
import type { CoverageType } from '@/src/v3/store/v3GameStore'

interface CoverageSelectorProps {
  selected: CoverageType
  onSelect: (coverage: CoverageType) => void
  disabled?: boolean
  className?: string
}

const COVERAGE_OPTIONS: {
  type: CoverageType
  label: string
  icon: string
  description: string
}[] = [
  {
    type: 'man',
    label: 'MAN',
    icon: '👤',
    description: 'Tight coverage',
  },
  {
    type: 'zone',
    label: 'ZONE',
    icon: '🛡️',
    description: 'Read & react',
  },
  {
    type: 'blitz',
    label: 'BLITZ',
    icon: '⚡',
    description: 'All-out rush',
  },
]

export function CoverageSelector({
  selected,
  onSelect,
  disabled = false,
  className = '',
}: CoverageSelectorProps) {
  return (
    <motion.div
      className={`px-4 py-3 ${className}`}
      style={{
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div
        className="text-[10px] uppercase tracking-[0.3em] text-center mb-3"
        style={{
          color: 'rgba(255, 255, 255, 0.5)',
          fontFamily: 'var(--font-oswald)',
        }}
      >
        SELECT COVERAGE
      </div>

      <div className="grid grid-cols-3 gap-2">
        {COVERAGE_OPTIONS.map((option) => (
          <PlaycallCard
            key={option.type}
            label={option.label}
            icon={option.icon}
            description={option.description}
            selected={selected === option.type}
            onSelect={() => onSelect(option.type)}
            variant="defense"
            disabled={disabled}
          />
        ))}
      </div>
    </motion.div>
  )
}

export default CoverageSelector
