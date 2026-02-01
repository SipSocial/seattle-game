'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, useUpgradeModal, Upgrade, UpgradeType } from '@/src/store/gameStore'

// SVG Icons for each upgrade type
const UpgradeIcons: Record<Upgrade['icon'], React.FC<{ className?: string }>> = {
  teammate: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-7 9c0-2.67 5.33-4 7-4s7 1.33 7 4v1H5v-1zm14-9c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1 3c0-.78-.28-1.48-.72-2.04.44-.16.91-.26 1.42-.26 1.1 0 2 .9 2 2v1h-2.7v-.7z"/>
    </svg>
  ),
  speed: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2.05v2.02c3.95.49 7 3.85 7 7.93 0 1.55-.45 3-1.22 4.22l1.42 1.42C21.32 15.93 22 14.04 22 12c0-5.18-3.95-9.45-9-9.95zM12 6c-3.31 0-6 2.69-6 6 0 1.55.59 2.95 1.55 4.02l-1.42 1.42C4.73 15.81 4 13.99 4 12c0-4.42 3.58-8 8-8v2zm0 12c-3.31 0-6-2.69-6-6h2c0 2.21 1.79 4 4 4s4-1.79 4-4h2c0 3.31-2.69 6-6 6z"/>
      <path d="M12 8l-4 4h8l-4-4z"/>
    </svg>
  ),
  reach: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93s3.06-7.44 7-7.93v15.86zm2 0V4.07c3.94.49 7 3.85 7 7.93s-3.06 7.44-7 7.93z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  life: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  ),
  slow: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 17c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1-1 .45-1 1zm0-14v4h2V5.08c3.39.49 6 3.39 6 6.92 0 3.87-3.13 7-7 7s-7-3.13-7-7c0-1.68.59-3.22 1.58-4.42L12 13l1.41-1.41-6.8-6.8C4.26 6.46 3 9.05 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9-4.03-9-9-9h-1z"/>
    </svg>
  ),
  health: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/>
    </svg>
  ),
  boost: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
    </svg>
  ),
  power: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  ),
}

interface UpgradeCardProps {
  upgrade: Upgrade
  index: number
  onSelect: (type: UpgradeType) => void
}

function UpgradeCard({ upgrade, index, onSelect }: UpgradeCardProps) {
  const IconComponent = UpgradeIcons[upgrade.icon]
  
  return (
    <motion.button
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
      transition={{ 
        delay: 0.1 + index * 0.08,
        type: 'spring',
        stiffness: 400,
        damping: 30,
      }}
      onClick={() => onSelect(upgrade.type)}
      className="w-full relative overflow-hidden rounded-2xl outline-none focus:outline-none active:scale-[0.98] transition-transform"
      style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(15,15,15,0.9) 100%)',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: `${upgrade.color}50`,
      }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
        style={{ backgroundColor: upgrade.color }}
      />
      
      {/* Content row - MORE PADDING */}
      <div className="flex items-center gap-5 py-5 pl-7 pr-5">
        {/* Icon - larger with more breathing room */}
        <div
          className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full"
          style={{
            backgroundColor: `${upgrade.color}20`,
            border: `2px solid ${upgrade.color}60`,
            color: upgrade.color,
          }}
        >
          <IconComponent className="w-7 h-7" />
        </div>
        
        {/* Text - with proper spacing */}
        <div className="flex-1 min-w-0 text-left py-1">
          <h3
            className="text-xl font-bold uppercase tracking-wide text-white mb-1"
            style={{ fontFamily: 'var(--font-oswald), system-ui, sans-serif' }}
          >
            {upgrade.name}
          </h3>
          <p className="text-sm text-white/50">
            {upgrade.description}
          </p>
        </div>
        
        {/* Arrow - with more space from edge */}
        <div className="flex-shrink-0 ml-2">
          <svg 
            className="w-6 h-6" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke={upgrade.color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </div>
    </motion.button>
  )
}

export function UpgradeSelect() {
  const { isOpen, upgrades } = useUpgradeModal()
  const selectUpgrade = useGameStore((s) => s.selectUpgrade)
  
  const handleSelect = (type: UpgradeType) => {
    selectUpgrade(type)
  }
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
            paddingLeft: 'env(safe-area-inset-left)',
            paddingRight: 'env(safe-area-inset-right)',
          }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-black/90 via-[#001a33]/95 to-[#002244]/95"
            style={{ backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
          
          {/* Full height flex container */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8">
            
            {/* Content wrapper with max-width */}
            <div className="w-full max-w-[340px]">
              
              {/* Header - more vertical spacing */}
              <motion.div
                className="text-center mb-10"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.05 }}
              >
                {/* Decorative line */}
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="h-px w-14 bg-gradient-to-r from-transparent to-[#69BE28]/60" />
                  <div className="w-2 h-2 rotate-45 bg-[#69BE28]" />
                  <div className="h-px w-14 bg-gradient-to-l from-transparent to-[#69BE28]/60" />
                </div>
                
                <h1
                  className="text-3xl font-bold uppercase tracking-wide text-white mb-2"
                  style={{ fontFamily: 'var(--font-oswald), system-ui, sans-serif' }}
                >
                  Choose Upgrade
                </h1>
                <p className="text-sm uppercase tracking-widest text-white/40">
                  Power up your defense
                </p>
              </motion.div>
              
              {/* Upgrade Cards */}
              <div className="flex flex-col" style={{ gap: '16px' }}>
                {upgrades.map((upgrade, index) => (
                  <UpgradeCard
                    key={upgrade.type}
                    upgrade={upgrade}
                    index={index}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
              
              {/* Footer hint - more spacing above */}
              <motion.p
                className="text-center mt-10 text-xs uppercase tracking-widest text-white/25"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Tap to select
              </motion.p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default UpgradeSelect
