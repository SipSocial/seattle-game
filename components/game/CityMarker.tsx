'use client'

import { motion } from 'framer-motion'
import { CampaignStage } from '@/src/game/data/campaign'

interface CityMarkerProps {
  stage: CampaignStage
  x: number // Pixel position
  y: number
  isCompleted: boolean
  isCurrent: boolean
  isLocked: boolean
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
}

const sizeConfig = {
  sm: { outer: 16, inner: 10, label: 'text-[8px]' },
  md: { outer: 24, inner: 16, label: 'text-[10px]' },
  lg: { outer: 32, inner: 22, label: 'text-xs' },
}

export function CityMarker({
  stage,
  x,
  y,
  isCompleted,
  isCurrent,
  isLocked,
  onClick,
  size = 'md',
}: CityMarkerProps) {
  const config = sizeConfig[size]
  const isHome = stage.location.isHome

  // Get team colors
  const primaryColor = `#${stage.visuals.opponent.primary.toString(16).padStart(6, '0')}`
  const accentColor = `#${stage.visuals.opponent.accent.toString(16).padStart(6, '0')}`

  // Determine marker color based on state
  const markerColor = isCompleted
    ? '#69BE28' // Green for completed
    : isCurrent
    ? '#69BE28' // Green pulse for current
    : isLocked
    ? 'rgba(255, 255, 255, 0.2)' // Dim for locked
    : primaryColor // Team color for unlocked

  const glowColor = isCompleted || isCurrent ? 'rgba(105, 190, 40, 0.6)' : 'transparent'

  return (
    <motion.button
      className="absolute flex flex-col items-center pointer-events-auto"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
      }}
      onClick={isLocked ? undefined : onClick}
      disabled={isLocked}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      whileHover={!isLocked ? { scale: 1.2 } : undefined}
      whileTap={!isLocked ? { scale: 0.9 } : undefined}
    >
      {/* Outer ring with glow */}
      <motion.div
        className="relative rounded-full flex items-center justify-center"
        style={{
          width: config.outer,
          height: config.outer,
          background: isHome
            ? 'linear-gradient(135deg, #002244 0%, #001a33 100%)'
            : `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
          boxShadow: isCurrent
            ? `0 0 20px ${glowColor}, 0 0 40px ${glowColor}`
            : isCompleted
            ? `0 0 10px ${glowColor}`
            : 'none',
          border: isHome ? '2px solid #69BE28' : `2px solid ${accentColor}`,
        }}
        animate={
          isCurrent
            ? {
                boxShadow: [
                  `0 0 10px ${glowColor}, 0 0 20px ${glowColor}`,
                  `0 0 20px ${glowColor}, 0 0 40px ${glowColor}`,
                  `0 0 10px ${glowColor}, 0 0 20px ${glowColor}`,
                ],
              }
            : undefined
        }
        transition={
          isCurrent
            ? {
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : undefined
        }
      >
        {/* Inner circle */}
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: config.inner,
            height: config.inner,
            background: isCompleted
              ? '#69BE28'
              : isCurrent
              ? 'rgba(105, 190, 40, 0.3)'
              : isLocked
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Icon */}
          {isCompleted ? (
            <svg
              className="w-3 h-3 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : isLocked ? (
            <svg
              className="w-2 h-2 text-white/40"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 1C8.676 1 6 3.676 6 7v2H4v14h16V9h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4z" />
            </svg>
          ) : isCurrent ? (
            <motion.div
              className="w-2 h-2 rounded-full bg-[#69BE28]"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          ) : isHome ? (
            <span className="text-[8px] font-bold text-[#69BE28]">H</span>
          ) : null}
        </div>
      </motion.div>

      {/* Label */}
      <motion.div
        className={`
          mt-1 px-1.5 py-0.5 rounded-sm whitespace-nowrap
          ${config.label} font-bold uppercase tracking-wider
          ${isLocked ? 'opacity-30' : 'opacity-100'}
        `}
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          color: isCompleted || isCurrent ? '#69BE28' : '#fff',
          backdropFilter: 'blur(4px)',
        }}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: isLocked ? 0.3 : 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {stage.location.abbreviation}
      </motion.div>

      {/* Week label for current */}
      {isCurrent && (
        <motion.div
          className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider whitespace-nowrap"
          style={{
            background: 'linear-gradient(135deg, #69BE28 0%, #4a9c1c 100%)',
            color: '#000',
            boxShadow: '0 2px 8px rgba(105, 190, 40, 0.4)',
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {stage.weekLabel}
        </motion.div>
      )}

      {/* Opponent name on hover (desktop) */}
      <motion.div
        className="absolute top-full mt-1 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-[9px] font-medium whitespace-nowrap opacity-0 pointer-events-none"
        style={{
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
        whileHover={{ opacity: 1 }}
      >
        {stage.location.isHome ? 'vs' : '@'} {stage.visuals.opponent.name.split(' ').slice(-1)[0]}
      </motion.div>
    </motion.button>
  )
}

export default CityMarker
