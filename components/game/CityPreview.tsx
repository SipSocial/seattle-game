'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CampaignStage } from '@/src/game/data/campaign'
import { getCityAsset } from '@/src/game/data/campaignAssets'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { GhostButton } from '@/components/ui/GhostButton'

interface CityPreviewProps {
  stage: CampaignStage
  isOpen: boolean
  onClose: () => void
  onPlay: () => void
  highScore?: number
  isLocked?: boolean
}

export function CityPreview({
  stage,
  isOpen,
  onClose,
  onPlay,
  highScore,
  isLocked = false,
}: CityPreviewProps) {
  const cityAsset = getCityAsset(stage.location.city)
  const opponentShort = stage.visuals.opponent.name.split(' ').slice(-1)[0]
  const primaryColor = `#${stage.visuals.opponent.primary.toString(16).padStart(6, '0')}`
  const accentColor = `#${stage.visuals.opponent.accent.toString(16).padStart(6, '0')}`

  // Use city asset background or fallback to gradient
  const backgroundImage = cityAsset?.backgroundImage
  const hasBackground = !!backgroundImage

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Fullscreen City Background */}
          <motion.div
            className="absolute inset-0 overflow-hidden"
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            {hasBackground ? (
              <img
                src={backgroundImage}
                alt={stage.location.city}
                className="w-full h-full object-cover"
              />
            ) : (
              // Fallback gradient based on team colors
              <div
                className="w-full h-full"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}40 0%, #002244 50%, ${accentColor}40 100%)`,
                }}
              />
            )}

            {/* Overlay gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
          </motion.div>

          {/* Content */}
          <motion.div
            className="relative z-10 w-full max-w-lg px-6"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            {/* Close button */}
            <motion.button
              className="absolute top-0 right-6 w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>

            {/* Stage Badge */}
            <motion.div
              className="flex justify-center mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
            >
              <div
                className="px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-wider"
                style={{
                  background:
                    stage.isPlayoff || stage.isSuperBowl
                      ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                      : 'linear-gradient(135deg, #69BE28 0%, #4a9c1c 100%)',
                  color: '#000',
                  boxShadow:
                    stage.isPlayoff || stage.isSuperBowl
                      ? '0 4px 20px rgba(255, 215, 0, 0.4)'
                      : '0 4px 20px rgba(105, 190, 40, 0.4)',
                }}
              >
                {stage.weekLabel}
              </div>
            </motion.div>

            {/* Matchup */}
            <div className="flex items-center justify-center gap-6 mb-6">
              {/* Seahawks */}
              <motion.div
                className="text-center"
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-2 mx-auto"
                  style={{
                    background: 'linear-gradient(135deg, #002244 0%, #001a33 100%)',
                    border: '3px solid #69BE28',
                    boxShadow: '0 0 30px rgba(105, 190, 40, 0.4)',
                  }}
                >
                  <span className="text-2xl font-black text-[#69BE28]">SEA</span>
                </div>
                <span className="text-xs text-white/60 uppercase tracking-wider">Seahawks</span>
              </motion.div>

              {/* VS */}
              <motion.div
                className="text-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                <div className="text-3xl font-black text-white/20">VS</div>
              </motion.div>

              {/* Opponent */}
              <motion.div
                className="text-center"
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-2 mx-auto"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
                    border: '3px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <span className="text-2xl font-black text-white">
                    {opponentShort.substring(0, 3).toUpperCase()}
                  </span>
                </div>
                <span className="text-xs text-white/60 uppercase tracking-wider">{opponentShort}</span>
              </motion.div>
            </div>

            {/* Stage Info */}
            <motion.div
              className="text-center mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              <h2 className="text-3xl font-black text-white uppercase mb-2">{stage.name}</h2>
              <p className="text-white/50 text-sm">
                {stage.location.isHome ? '🏠 Home Game' : '✈️ Away Game'} • {stage.location.city},{' '}
                {stage.location.state}
              </p>
              <p className="text-white/30 text-xs mt-1 italic">{stage.description}</p>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              className="flex justify-center gap-8 mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {/* Difficulty */}
              <div className="text-center">
                <div className="text-[9px] text-white/40 uppercase tracking-wider mb-1">
                  Difficulty
                </div>
                <div className="flex gap-1 justify-center">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-5 rounded-sm"
                      style={{
                        background:
                          i < stage.difficulty
                            ? i < 3
                              ? '#69BE28'
                              : i < 6
                              ? '#FFA500'
                              : '#E53935'
                            : 'rgba(255, 255, 255, 0.1)',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Weather */}
              <div className="text-center">
                <div className="text-[9px] text-white/40 uppercase tracking-wider mb-1">
                  Conditions
                </div>
                <div className="text-lg">
                  {stage.visuals.weather.type === 'rain' && '🌧️'}
                  {stage.visuals.weather.type === 'snow' && '❄️'}
                  {stage.visuals.weather.type === 'fog' && '🌫️'}
                  {stage.visuals.weather.type === 'heat' && '☀️'}
                  {stage.visuals.weather.type === 'wind' && '💨'}
                  {stage.visuals.weather.type === 'night' && '🌙'}
                  {stage.visuals.weather.type === 'clear' && '⛅'}
                </div>
                <div className="text-[10px] text-white/50 capitalize">{stage.visuals.weather.type}</div>
              </div>

              {/* High Score */}
              {highScore !== undefined && (
                <div className="text-center">
                  <div className="text-[9px] text-white/40 uppercase tracking-wider mb-1">
                    High Score
                  </div>
                  <div
                    className="text-xl font-black"
                    style={{ color: '#69BE28', fontFamily: 'var(--font-oswald), sans-serif' }}
                  >
                    {highScore.toLocaleString()}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="space-y-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              {isLocked ? (
                <>
                  <div
                    className="w-full py-3 px-6 rounded-xl text-center font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                    </svg>
                    Stage Locked
                  </div>
                  <p className="text-center text-xs text-white/40">
                    Complete previous stages to unlock
                  </p>
                </>
              ) : (
                <GradientButton
                  size="lg"
                  fullWidth
                  onClick={onPlay}
                  icon={
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  }
                >
                  {stage.isSuperBowl ? 'Play Super Bowl' : 'Start Game'}
                </GradientButton>
              )}

              <GhostButton fullWidth onClick={onClose}>
                Back to Map
              </GhostButton>
            </motion.div>

            {/* Landmarks */}
            <motion.div
              className="flex flex-wrap justify-center gap-2 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {stage.visuals.landmarks.map((landmark, i) => (
                <span
                  key={i}
                  className="px-2 py-1 rounded-full text-[10px] text-white/40"
                  style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                >
                  {landmark}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CityPreview
