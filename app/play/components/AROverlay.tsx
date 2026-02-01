'use client'

import { motion } from 'framer-motion'

interface AROverlayProps {
  isActive: boolean
}

/**
 * AROverlay - Minimal, non-intrusive AR frame overlay
 * Only shows corner brackets to frame the AR experience
 * Positioned to not conflict with game elements or HUD
 */
export function AROverlay({ isActive }: AROverlayProps) {
  if (!isActive) return null

  // Corner bracket size
  const cornerSize = 40
  const strokeColor = '#69BE28'
  const strokeOpacity = 0.7

  return (
    <div 
      className="fixed inset-0 pointer-events-none"
      style={{ 
        zIndex: 15,
        // Safe area insets for proper positioning on all devices
        padding: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
      }}
    >
      {/* Corner Brackets Container - positioned relative to game area */}
      <div 
        className="absolute"
        style={{
          // Position below the HUD (score/wave area is ~100px)
          top: 'max(110px, calc(env(safe-area-inset-top) + 100px))',
          left: 12,
          right: 12,
          // Leave room for bottom safe area
          bottom: 'max(20px, env(safe-area-inset-bottom))',
        }}
      >
        {/* Top Left Corner */}
        <motion.svg
          width={cornerSize}
          height={cornerSize}
          viewBox="0 0 40 40"
          fill="none"
          className="absolute top-0 left-0"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <path
            d="M2 16V4C2 2.89543 2.89543 2 4 2H16"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity={strokeOpacity}
            style={{ filter: 'drop-shadow(0 0 4px rgba(105,190,40,0.5))' }}
          />
        </motion.svg>

        {/* Top Right Corner */}
        <motion.svg
          width={cornerSize}
          height={cornerSize}
          viewBox="0 0 40 40"
          fill="none"
          className="absolute top-0 right-0"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          <path
            d="M24 2H36C37.1046 2 38 2.89543 38 4V16"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity={strokeOpacity}
            style={{ filter: 'drop-shadow(0 0 4px rgba(105,190,40,0.5))' }}
          />
        </motion.svg>

        {/* Bottom Left Corner */}
        <motion.svg
          width={cornerSize}
          height={cornerSize}
          viewBox="0 0 40 40"
          fill="none"
          className="absolute bottom-0 left-0"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <path
            d="M2 24V36C2 37.1046 2.89543 38 4 38H16"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity={strokeOpacity}
            style={{ filter: 'drop-shadow(0 0 4px rgba(105,190,40,0.5))' }}
          />
        </motion.svg>

        {/* Bottom Right Corner */}
        <motion.svg
          width={cornerSize}
          height={cornerSize}
          viewBox="0 0 40 40"
          fill="none"
          className="absolute bottom-0 right-0"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.3 }}
        >
          <path
            d="M38 24V36C38 37.1046 37.1046 38 36 38H24"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity={strokeOpacity}
            style={{ filter: 'drop-shadow(0 0 4px rgba(105,190,40,0.5))' }}
          />
        </motion.svg>
      </div>
    </div>
  )
}
