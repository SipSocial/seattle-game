'use client'

/**
 * GAME MODE SELECTION - Premium Nike-Level Design
 * 
 * Epic game mode selector featuring:
 * - Two distinct game experiences
 * - Premium glassmorphic cards with glow effects
 * - Smooth 60fps animations
 * - Haptic feedback integration
 * - Apple-level visual polish
 */

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'

// Background assets
const BACKGROUND_VIDEO = 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/4b5f0ad3-9f4e-413f-b44a-053e9af6240c/4b5f0ad3-9f4e-413f-b44a-053e9af6240c.mp4'
const BACKGROUND_POSTER = 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/16412705-ca65-400e-bb78-80ff29be860a/segments/2:2:1/Phoenix_Empty_NFL_football_field_at_night_dramatic_billowing_s_0.jpg'

// Premium spring animations
const smoothSpring = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 35,
}

interface GameModeSelectProps {
  onSelectMode: (mode: 'qb' | 'defense') => void
  offensePlayerName?: string
  defensePlayerName?: string
}

interface GameModeCardProps {
  mode: 'qb' | 'defense'
  title: string
  subtitle: string
  icon: React.ReactNode
  playerName?: string
  gradient: string
  glowColor: string
  isHovered: boolean
  onHover: (hovered: boolean) => void
  onSelect: () => void
}

function GameModeCard({
  title,
  subtitle,
  icon,
  playerName,
  gradient,
  glowColor,
  isHovered,
  onHover,
  onSelect,
}: GameModeCardProps) {
  const handleTap = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([15, 30, 15])
    }
    onSelect()
  }, [onSelect])

  return (
    <motion.button
      className="relative w-full text-left overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(25,45,65,0.92) 0%, rgba(15,30,50,0.98) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '20px',
        border: `1px solid ${isHovered ? `${glowColor}60` : 'rgba(255,255,255,0.08)'}`,
        boxShadow: isHovered 
          ? `0 16px 48px rgba(0,0,0,0.4), 0 0 40px ${glowColor}20`
          : '0 8px 24px rgba(0,0,0,0.3)',
        padding: '20px',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onTouchStart={() => onHover(true)}
      onTouchEnd={() => onHover(false)}
      onClick={handleTap}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={smoothSpring}
    >
      {/* Top accent gradient */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: gradient,
        }}
      />

      {/* Content - horizontal layout */}
      <div className="flex items-center" style={{ gap: '16px' }}>
        {/* Icon */}
        <motion.div
          className="flex-shrink-0 flex items-center justify-center"
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: `linear-gradient(135deg, ${glowColor}20 0%, ${glowColor}05 100%)`,
            border: `1px solid ${glowColor}30`,
          }}
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={smoothSpring}
        >
          {icon}
        </motion.div>
        
        {/* Text content */}
        <div className="flex-1 min-w-0">
          {/* Subtitle */}
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: glowColor,
            }}
          >
            {subtitle}
          </span>

          {/* Title */}
          <h3
            className="font-display"
            style={{
              fontSize: '1.75rem',
              lineHeight: 1.1,
              color: '#fff',
              marginTop: '2px',
            }}
          >
            {title}
          </h3>

          {/* Player name */}
          {playerName && (
            <span
              style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.5)',
                marginTop: '4px',
                display: 'block',
              }}
            >
              as <span style={{ color: glowColor, fontWeight: 600 }}>{playerName}</span>
            </span>
          )}
        </div>
        
        {/* Arrow */}
        <motion.div
          className="flex-shrink-0 flex items-center justify-center"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: isHovered ? gradient : 'rgba(255,255,255,0.05)',
            border: isHovered ? 'none' : '1px solid rgba(255,255,255,0.1)',
          }}
          animate={{ x: isHovered ? 3 : 0 }}
          transition={smoothSpring}
        >
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke={isHovered ? '#000' : 'rgba(255,255,255,0.5)'} 
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </motion.div>
      </div>
    </motion.button>
  )
}

// Icons
const QBIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" style={{ width: '55%', height: '55%' }}>
    {/* Football */}
    <ellipse cx="24" cy="24" rx="18" ry="11" fill="#8B4513" stroke="#5D3A1A" strokeWidth="2"/>
    <path d="M9 24 L39 24" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M13 20 L13 28 M17 19 L17 29 M21 18.5 L21 29.5 M25 18.5 L25 29.5 M29 19 L29 29 M33 20 L33 28" stroke="white" strokeWidth="1" strokeLinecap="round"/>
    {/* Motion lines */}
    <path d="M41 17 L46 12" stroke="#69BE28" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M43 24 L48 24" stroke="#69BE28" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M41 31 L46 36" stroke="#69BE28" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
)

const DefenseIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" style={{ width: '55%', height: '55%' }}>
    {/* Shield */}
    <path 
      d="M24 3 L42 10 L42 25 C42 36 33 44 24 46 C15 44 6 36 6 25 L6 10 Z" 
      fill="url(#shieldGrad)" 
      stroke="#001428"
      strokeWidth="2"
    />
    <defs>
      <linearGradient id="shieldGrad" x1="24" y1="3" x2="24" y2="46" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#00A8E8"/>
        <stop offset="100%" stopColor="#005f99"/>
      </linearGradient>
    </defs>
    {/* 12 */}
    <text x="24" y="31" textAnchor="middle" fill="#fff" fontWeight="900" fontSize="16" fontFamily="system-ui">12</text>
  </svg>
)

export default function GameModeSelect({ 
  onSelectMode,
  offensePlayerName,
  defensePlayerName,
}: GameModeSelectProps) {
  const [hoveredMode, setHoveredMode] = useState<'qb' | 'defense' | null>(null)

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#000A14' }}>
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={BACKGROUND_POSTER}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.35 }}
        >
          <source src={BACKGROUND_VIDEO} type="video/mp4" />
        </video>
        
        {/* Gradient overlays */}
        <div 
          className="absolute inset-x-0 top-0"
          style={{ 
            height: '40%',
            background: 'linear-gradient(180deg, #000A14 0%, transparent 100%)',
          }}
        />
        <div 
          className="absolute inset-x-0 bottom-0"
          style={{ 
            height: '50%',
            background: 'linear-gradient(0deg, #000A14 0%, transparent 100%)',
          }}
        />
      </div>

      {/* Content */}
      <motion.div 
        className="relative z-10 h-full w-full flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <header 
          className="flex-shrink-0 text-center"
          style={{
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)',
            paddingBottom: '20px',
            paddingLeft: '24px',
            paddingRight: '24px',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...smoothSpring, delay: 0.1 }}
          >
            <span
              className="block uppercase font-bold"
              style={{
                fontSize: '10px',
                letterSpacing: '0.3em',
                color: 'rgba(255, 215, 0, 0.5)',
                marginBottom: '8px',
              }}
            >
              Choose Your Path
            </span>
            <h1
              className="font-display"
              style={{
                fontSize: 'clamp(2rem, 10vw, 3rem)',
                lineHeight: 0.9,
                background: 'linear-gradient(180deg, #FFFFFF 30%, #69BE28 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              SELECT MODE
            </h1>
          </motion.div>
        </header>

        {/* Game Mode Cards */}
        <main 
          className="flex-1 flex flex-col justify-center"
          style={{
            padding: '0 20px',
            gap: '12px',
            maxWidth: '420px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          {/* QB Legend Mode */}
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...smoothSpring, delay: 0.2 }}
          >
            <GameModeCard
              mode="qb"
              title="QB LEGEND"
              subtitle="Offense"
              icon={<QBIcon />}
              playerName={offensePlayerName}
              gradient="linear-gradient(135deg, #69BE28 0%, #4a9a1c 100%)"
              glowColor="#69BE28"
              isHovered={hoveredMode === 'qb'}
              onHover={(h) => setHoveredMode(h ? 'qb' : null)}
              onSelect={() => onSelectMode('qb')}
            />
          </motion.div>

          {/* Defense Mode */}
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...smoothSpring, delay: 0.3 }}
          >
            <GameModeCard
              mode="defense"
              title="DARK SIDE"
              subtitle="Defense"
              icon={<DefenseIcon />}
              playerName={defensePlayerName}
              gradient="linear-gradient(135deg, #00A8E8 0%, #0077B6 100%)"
              glowColor="#00A8E8"
              isHovered={hoveredMode === 'defense'}
              onHover={(h) => setHoveredMode(h ? 'defense' : null)}
              onSelect={() => onSelectMode('defense')}
            />
          </motion.div>
        </main>

        {/* Footer hint */}
        <footer
          className="flex-shrink-0 text-center"
          style={{
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
            paddingTop: '12px',
          }}
        >
          <motion.p
            style={{
              fontSize: '10px',
              letterSpacing: '0.08em',
              color: 'rgba(255,255,255,0.2)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Tap to select
          </motion.p>
        </footer>
      </motion.div>
    </div>
  )
}
