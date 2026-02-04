'use client'

import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui'

interface SponsorCardProps {
  name: string
  tagline: string
  color: string
  url: string
  className?: string
}

const SPONSORS = [
  { name: 'KJR Radio', tagline: '950 AM Sports Radio', color: '#FF4444', url: '#' },
  { name: 'Simply Seattle', tagline: 'Official Merch Partner', color: '#4A90D9', url: '#' },
  { name: "Fat Zach's Pizza", tagline: 'Game Day Fuel', color: '#FFB347', url: '#' },
]

export function SponsorCard({ 
  name, 
  tagline, 
  color, 
  url,
  className = '' 
}: SponsorCardProps) {
  return (
    <motion.a
      href={url}
      className={`block ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <GlassCard
        variant="dark"
        padding="md"
        className="relative overflow-hidden"
        style={{
          transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
        }}
        whileHover={{
          boxShadow: `0 0 30px ${color}40, 0 8px 32px rgba(0, 0, 0, 0.3)`,
          borderColor: `${color}50`,
        }}
      >
        {/* Glow overlay on hover */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            background: `radial-gradient(circle at center, ${color}15 0%, transparent 70%)`,
          }}
        />

        {/* Content */}
        <div 
          className="relative z-10 flex items-center"
          style={{ gap: 'var(--space-4)' }}
        >
          {/* Logo placeholder */}
          <div
            className="flex-shrink-0 flex items-center justify-center rounded-xl"
            style={{
              width: '48px',
              height: '48px',
              background: `linear-gradient(135deg, ${color}25 0%, ${color}10 100%)`,
              border: `2px solid ${color}40`,
            }}
          >
            <span 
              style={{ 
                fontSize: '20px',
                fontWeight: 800,
                fontFamily: 'var(--font-oswald), sans-serif',
                color: color,
                textShadow: `0 0 10px ${color}60`,
              }}
            >
              {name.charAt(0)}
            </span>
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            <h3
              style={{
                fontSize: 'var(--text-body)',
                fontFamily: 'var(--font-oswald), sans-serif',
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.95)',
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                marginBottom: '2px',
              }}
            >
              {name}
            </h3>
            <p
              style={{
                fontSize: 'var(--text-caption)',
                color: 'rgba(255, 255, 255, 0.5)',
                letterSpacing: '0.02em',
              }}
            >
              {tagline}
            </p>
          </div>

          {/* Arrow indicator */}
          <motion.div
            className="flex-shrink-0"
            style={{
              color: 'rgba(255, 255, 255, 0.3)',
              fontSize: '18px',
            }}
            whileHover={{ x: 4, color: color }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            →
          </motion.div>
        </div>

        {/* Accent line at bottom */}
        <motion.div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: '2px',
            background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`,
            opacity: 0,
          }}
          whileHover={{ opacity: 0.6 }}
          transition={{ duration: 0.3 }}
        />
      </GlassCard>
    </motion.a>
  )
}

// Export sponsor data for convenience
export { SPONSORS }

// Helper component to render all sponsor cards
interface SponsorCardListProps {
  className?: string
  gap?: string
}

export function SponsorCardList({ 
  className = '',
  gap = 'var(--space-4)'
}: SponsorCardListProps) {
  return (
    <div 
      className={`flex flex-col ${className}`}
      style={{ gap }}
    >
      {SPONSORS.map((sponsor, index) => (
        <motion.div
          key={sponsor.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: index * 0.1,
            type: 'spring',
            stiffness: 300,
            damping: 25,
          }}
        >
          <SponsorCard {...sponsor} />
        </motion.div>
      ))}
    </div>
  )
}

export default SponsorCard
