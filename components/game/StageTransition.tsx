'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GradientButton } from '@/components/ui/GradientButton'
import { CampaignStage } from '@/src/game/data/campaign'
import { GENERATED_ASSETS } from '@/src/game/data/campaignAssets'

interface StageTransitionProps {
  stage: CampaignStage
  onStart: () => void
  autoStartDelay?: number // ms before auto-starting (0 = no auto)
  planeVideoUrl?: string
}

export function StageTransition({ 
  stage, 
  onStart, 
  autoStartDelay = 0,
  planeVideoUrl = GENERATED_ASSETS.airplaneVideoUrl,
}: StageTransitionProps) {
  const [countdown, setCountdown] = useState(autoStartDelay > 0 ? Math.ceil(autoStartDelay / 1000) : 0)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

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

  // Show content after video plays for a bit
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true)
    }, 1500) // Show content after 1.5s
    return () => clearTimeout(timer)
  }, [])

  // Get opponent short name
  const opponentShort = stage.visuals.opponent.name.split(' ').slice(-1)[0]

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${stage.visuals.skyGradient[0]} 0%, ${stage.visuals.skyGradient[1]} 100%)`,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Dark Side Plane Video Background */}
      {planeVideoUrl && (
        <motion.div
          className="absolute inset-0 z-0 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            loop
            onLoadedData={() => setVideoLoaded(true)}
            className="absolute w-full h-full object-cover"
            style={{
              filter: 'brightness(0.6) contrast(1.2)',
            }}
          >
            <source src={planeVideoUrl} type="video/mp4" />
          </video>
          
          {/* Video overlay gradient */}
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, 
                ${stage.visuals.skyGradient[0]}90 0%, 
                transparent 30%, 
                transparent 70%, 
                ${stage.visuals.skyGradient[1]}90 100%)`,
            }}
          />
          
          {/* Vignette effect */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.5) 100%)',
            }}
          />
        </motion.div>
      )}

      {/* Atmospheric overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${stage.visuals.atmosphereColor}40 0%, transparent 70%)`,
        }}
      />

      {/* Content */}
      <AnimatePresence>
        {showContent && (
          <motion.div 
            className="relative z-20 text-center px-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Week Label */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
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
              transition={{ delay: 0.2, type: 'spring' }}
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
              transition={{ delay: 0.3 }}
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
                <span className="text-[10px] text-white/60">Dark Side</span>
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
              transition={{ delay: 0.4 }}
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
              transition={{ delay: 0.5 }}
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
                  transition={{ delay: 0.55 + i * 0.03 }}
                />
              ))}
            </motion.div>

            {/* Start Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading indicator while video loads */}
      <AnimatePresence>
        {!showContent && (
          <motion.div
            className="absolute inset-0 z-30 flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="flex flex-col items-center gap-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
            >
              {/* Plane flying animation */}
              <motion.div
                animate={{ 
                  x: [-100, 100, -100],
                  y: [-5, 5, -5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(105, 190, 40, 0.8))',
                }}
              >
                <svg
                  width="80"
                  height="40"
                  viewBox="0 0 48 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 12L12 8L40 10L44 12L40 14L12 16L4 12Z"
                    fill="#002244"
                    stroke="#69BE28"
                    strokeWidth="1.5"
                  />
                  <path d="M18 10L28 4L32 10Z" fill="#002244" stroke="#69BE28" strokeWidth="1" />
                  <path d="M18 14L28 20L32 14Z" fill="#002244" stroke="#69BE28" strokeWidth="1" />
                  <path d="M8 12L4 6L10 10Z" fill="#002244" stroke="#69BE28" strokeWidth="1" />
                  <circle cx="42" cy="12" r="3" fill="#69BE28" opacity="0.8">
                    <animate attributeName="opacity" values="0.5;1;0.5" dur="0.3s" repeatCount="indefinite" />
                  </circle>
                </svg>
              </motion.div>
              <span className="text-[#69BE28] text-sm font-bold uppercase tracking-widest">
                Dark Side Arriving...
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default StageTransition
