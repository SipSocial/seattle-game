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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.08 } }}
      transition={{ 
        delay: index * 0.05,
        duration: 0.25,
        ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad - smooth deceleration
      }}
      onClick={() => onSelect(upgrade.type)}
      className="w-full relative overflow-hidden rounded-2xl outline-none focus:outline-none active:scale-[0.98] transition-transform"
      style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(15,15,15,0.9) 100%)',
        border: `1px solid ${upgrade.color}50`,
        willChange: 'transform, opacity',
      }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 rounded-l-2xl"
        style={{ width: '6px', backgroundColor: upgrade.color }}
      />
      
      {/* Content row */}
      <div 
        className="flex items-center"
        style={{ gap: '20px', padding: '20px 20px 20px 28px' }}
      >
        {/* Icon */}
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-full"
          style={{
            width: '56px',
            height: '56px',
            backgroundColor: `${upgrade.color}20`,
            border: `2px solid ${upgrade.color}60`,
            color: upgrade.color,
          }}
        >
          <IconComponent className="w-7 h-7" />
        </div>
        
        {/* Text */}
        <div className="flex-1 min-w-0 text-left">
          <h3
            className="text-xl font-bold uppercase tracking-wide text-white"
            style={{ fontFamily: 'var(--font-oswald), sans-serif', marginBottom: '4px' }}
          >
            {upgrade.name}
          </h3>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
            {upgrade.description}
          </p>
        </div>
        
        {/* Arrow */}
        <div className="flex-shrink-0">
          <svg 
            width="24"
            height="24"
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
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ 
              background: 'linear-gradient(180deg, rgba(0,0,0,0.92) 0%, rgba(0,26,51,0.95) 50%, rgba(0,34,68,0.95) 100%)',
              backdropFilter: 'blur(8px)',
            }}
          />
          
          {/* Content */}
          <motion.div 
            className="relative z-10 w-full"
            style={{ 
              maxWidth: '380px',
              padding: '24px',
              willChange: 'transform, opacity',
            }}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Header */}
            <div className="text-center" style={{ marginBottom: '40px' }}>
              {/* Decorative line */}
              <div 
                className="flex items-center justify-center"
                style={{ gap: '12px', marginBottom: '16px' }}
              >
                <div 
                  className="bg-gradient-to-r from-transparent to-[#69BE28]/60"
                  style={{ height: '1px', width: '56px' }}
                />
                <div 
                  className="bg-[#69BE28]"
                  style={{ width: '8px', height: '8px', transform: 'rotate(45deg)' }}
                />
                <div 
                  className="bg-gradient-to-l from-transparent to-[#69BE28]/60"
                  style={{ height: '1px', width: '56px' }}
                />
              </div>
              
              <h1
                className="font-black uppercase tracking-wide text-white"
                style={{ 
                  fontFamily: 'var(--font-oswald), sans-serif',
                  fontSize: '32px',
                  marginBottom: '8px',
                }}
              >
                Choose Upgrade
              </h1>
              <p 
                className="uppercase tracking-widest"
                style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}
              >
                Power up your defense
              </p>
            </div>
            
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
            
            {/* Footer hint */}
            <motion.p
              className="text-center uppercase tracking-widest"
              style={{ marginTop: '40px', fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.2 }}
            >
              Tap to select
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default UpgradeSelect
