'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GradientButton } from '@/components/ui/GradientButton'
import { CampaignStage } from '@/src/game/data/campaign'

interface StageTransitionProps {
  stage: CampaignStage
  onStart: () => void
  autoStartDelay?: number // ms before auto-starting (0 = no auto)
}

export function StageTransition({ stage, onStart, autoStartDelay = 0 }: StageTransitionProps) {
  const [countdown, setCountdown] = useState(autoStartDelay > 0 ? Math.ceil(autoStartDelay / 1000) : 0)

  useEffect(() => {
    if (autoStartDelay <= 0) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onStart()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [autoStartDelay, onStart])

  // Get opponent short name
  const opponentShort = stage.visuals.opponent.name.split(' ').slice(-1)[0]

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${stage.visuals.skyGradient[0]} 0%, ${stage.visuals.skyGradient[1]} 100%)`,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Atmospheric overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${stage.visuals.atmosphereColor}40 0%, transparent 70%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6">
        {/* Week Label */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-2"
        >
          <span 
            className="inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{
              background: stage.isPlayoff || stage.isSuperBowl 
                ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' 
                : 'rgba(105, 190, 40, 0.2)',
              color: stage.isPlayoff || stage.isSuperBowl ? '#000' : '#69BE28',
              border: '1px solid rgba(105, 190, 40, 0.3)',
            }}
          >
            {stage.weekLabel}
          </span>
        </motion.div>

        {/* Stage Name */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="text-4xl font-black uppercase text-white mb-2"
          style={{
            textShadow: `0 0 40px ${stage.visuals.atmosphereColor}`,
            fontFamily: 'var(--font-bebas), var(--font-oswald), sans-serif',
          }}
        >
          {stage.name}
        </motion.h1>

        {/* Matchup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-4 mb-8"
        >
          {/* Seahawks */}
          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center mb-1"
              style={{
                background: 'linear-gradient(135deg, #002244 0%, #001a33 100%)',
                border: '2px solid #69BE28',
                boxShadow: '0 0 20px rgba(105, 190, 40, 0.4)',
              }}
            >
              <span className="text-2xl font-black text-[#69BE28]">SEA</span>
            </div>
            <span className="text-[10px] text-white/60">Seahawks</span>
          </div>

          {/* VS */}
          <div 
            className="text-2xl font-black"
            style={{ color: 'rgba(255, 255, 255, 0.3)' }}
          >
            VS
          </div>

          {/* Opponent */}
          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center mb-1"
              style={{
                background: `linear-gradient(135deg, #${stage.visuals.opponent.primary.toString(16).padStart(6, '0')} 0%, #${stage.visuals.opponent.accent.toString(16).padStart(6, '0')} 100%)`,
                border: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <span className="text-2xl font-black text-white">
                {stage.location.abbreviation !== 'SEA' ? stage.location.abbreviation : opponentShort.substring(0, 3).toUpperCase()}
              </span>
            </div>
            <span className="text-[10px] text-white/60">{opponentShort}</span>
          </div>
        </motion.div>

        {/* Location & Weather */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-white/50 mb-8"
        >
          <span>{stage.location.isHome ? '🏠' : '✈️'}</span>
          <span className="ml-1">
            {stage.location.city}, {stage.location.state}
          </span>
          {stage.visuals.weather.type !== 'clear' && (
            <span className="ml-2">
              {stage.visuals.weather.type === 'rain' && '🌧️'}
              {stage.visuals.weather.type === 'snow' && '❄️'}
              {stage.visuals.weather.type === 'fog' && '🌫️'}
              {stage.visuals.weather.type === 'wind' && '💨'}
              {stage.visuals.weather.type === 'night' && '🌙'}
            </span>
          )}
        </motion.div>

        {/* Difficulty */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center gap-1 mb-8"
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-3 h-6 rounded-sm"
              style={{
                background: i < stage.difficulty 
                  ? 'linear-gradient(180deg, #E53935 0%, #B71C1C 100%)' 
                  : 'rgba(255, 255, 255, 0.1)',
              }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.7 + i * 0.05 }}
            />
          ))}
        </motion.div>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <GradientButton
            size="lg"
            onClick={onStart}
            icon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            }
          >
            {countdown > 0 ? `Starting in ${countdown}...` : 'Start Game'}
          </GradientButton>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default StageTransition
