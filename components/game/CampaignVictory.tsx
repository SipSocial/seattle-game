'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useGameStore, useVictoryModal } from '@/src/store/gameStore'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { GhostButton } from '@/components/ui/GhostButton'
import { StatDisplay } from '@/components/ui/StatDisplay'

export function CampaignVictory() {
  const router = useRouter()
  const { isOpen, type, stageId, stageName, bonusPoints } = useVictoryModal()
  const { score, wave, tackles } = useGameStore()
  const hideVictoryModal = useGameStore((s) => s.hideVictoryModal)
  
  const handleGiveaway = () => {
    hideVictoryModal()
    router.push('/v4/giveaway')
  }
  
  const getTitle = () => {
    switch (type) {
      case 'super_bowl':
        return 'SUPER BOWL CHAMPION!'
      case 'stage_complete':
        return 'STAGE COMPLETE!'
      default:
        return 'VICTORY!'
    }
  }
  
  const getIcon = () => {
    switch (type) {
      case 'super_bowl':
        return (
          <motion.div
            className="text-7xl"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            🏆
          </motion.div>
        )
      case 'stage_complete':
        return (
          <motion.div
            className="text-6xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ⭐
          </motion.div>
        )
      default:
        return (
          <motion.div
            className="text-6xl"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            🏈
          </motion.div>
        )
    }
  }
  
  const getTitleGradient = () => {
    switch (type) {
      case 'super_bowl':
        return 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)'
      case 'stage_complete':
        return 'linear-gradient(135deg, #69BE28 0%, #8BD44A 100%)'
      default:
        return 'linear-gradient(135deg, #69BE28 0%, #4a9c1c 100%)'
    }
  }
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop with confetti effect */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: type === 'super_bowl' 
                ? 'linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(50,30,0,0.95) 100%)'
                : 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,34,68,0.95) 100%)',
              backdropFilter: 'blur(8px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
          
          {/* Animated background particles */}
          {type === 'super_bowl' && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    background: i % 2 === 0 ? '#FFD700' : '#69BE28',
                  }}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ 
                    y: '100vh',
                    opacity: [0, 1, 1, 0],
                    rotate: 360,
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: 'linear',
                  }}
                />
              ))}
            </div>
          )}
          
          {/* Content */}
          <motion.div
            className="relative z-10 w-full px-6"
            style={{ maxWidth: '420px' }}
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <GlassCard padding="lg" className="text-center">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                style={{ marginBottom: '16px' }}
              >
                {getIcon()}
              </motion.div>
              
              {/* Title */}
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-black uppercase tracking-wider"
                style={{
                  background: getTitleGradient(),
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontFamily: 'var(--font-oswald), sans-serif',
                  marginBottom: '8px',
                }}
              >
                {getTitle()}
              </motion.h1>
              
              {/* Stage name */}
              {stageName && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg uppercase tracking-wide"
                  style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}
                >
                  {stageName}
                </motion.p>
              )}
              
              {/* Score */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.45, type: 'spring' }}
                style={{ marginBottom: '32px' }}
              >
                <div 
                  className="text-6xl font-black"
                  style={{
                    color: '#69BE28',
                    fontFamily: 'var(--font-oswald), sans-serif',
                    textShadow: '0 0 30px rgba(105, 190, 40, 0.5)',
                  }}
                >
                  {score.toLocaleString()}
                </div>
                <div 
                  className="text-sm uppercase tracking-widest"
                  style={{ color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}
                >
                  Score
                </div>
              </motion.div>
              
              {/* Stats */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center"
                style={{ gap: '56px', marginBottom: '32px' }}
              >
                <StatDisplay value={wave} label="Wave" size="md" />
                <StatDisplay value={tackles} label="Tackles" size="md" />
              </motion.div>
              
              {/* Bonus points */}
              {bonusPoints > 0 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6, type: 'spring' }}
                  className="rounded-xl"
                  style={{
                    background: 'rgba(105,190,40,0.15)',
                    border: '1px solid rgba(105,190,40,0.3)',
                    padding: '16px 24px',
                    marginBottom: '32px',
                  }}
                >
                  <div 
                    className="text-sm uppercase tracking-widest"
                    style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}
                  >
                    Stage Bonus
                  </div>
                  <div
                    className="text-3xl font-black"
                    style={{
                      color: '#69BE28',
                      fontFamily: 'var(--font-oswald), sans-serif',
                    }}
                  >
                    +{bonusPoints.toLocaleString()}
                  </div>
                </motion.div>
              )}
              
              {/* Action buttons */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                <GradientButton
                  size="lg"
                  fullWidth
                  onClick={hideVictoryModal}
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  }
                >
                  {type === 'super_bowl' ? 'Celebrate!' : 'Continue'}
                </GradientButton>
                
                <GhostButton
                  size="lg"
                  fullWidth
                  variant="green"
                  onClick={handleGiveaway}
                >
                  🎁 Enter Giveaway
                </GhostButton>
              </motion.div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CampaignVictory
