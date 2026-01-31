'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { VideoBackground } from '@/components/ui/VideoBackground'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { GhostButton } from '@/components/ui/GhostButton'
import { useGameStore } from '@/src/store/gameStore'
import { CAMPAIGN_STAGES, CampaignStage, TOTAL_STAGES, GAMES_PER_STAGE } from '@/src/game/data/campaign'

// Video background
const BACKGROUND_VIDEO = 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/4b5f0ad3-9f4e-413f-b44a-053e9af6240c/4b5f0ad3-9f4e-413f-b44a-053e9af6240c.mp4'
const BACKGROUND_POSTER = 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/16412705-ca65-400e-bb78-80ff29be860a/segments/2:2:1/Phoenix_Empty_NFL_football_field_at_night_dramatic_billowing_s_0.jpg'

interface CampaignMapProps {
  onSelectStage: (stageId: number) => void
  onBack: () => void
}

export function CampaignMap({ onSelectStage, onBack }: CampaignMapProps) {
  const campaign = useGameStore((s) => s.campaign)
  const [selectedStage, setSelectedStage] = useState<CampaignStage | null>(null)

  const isStageUnlocked = useCallback((stageId: number) => {
    return campaign.stagesUnlocked.includes(stageId)
  }, [campaign.stagesUnlocked])

  const currentStage = useMemo(() => {
    return CAMPAIGN_STAGES.find(s => s.id === campaign.currentStageId) || CAMPAIGN_STAGES[0]
  }, [campaign.currentStageId])

  // Group stages
  const regularSeasonStages = CAMPAIGN_STAGES.filter(s => !s.isPlayoff && !s.isSuperBowl && !s.isTutorial)
  const playoffStages = CAMPAIGN_STAGES.filter(s => s.isPlayoff)
  const superBowl = CAMPAIGN_STAGES.find(s => s.isSuperBowl)

  const progressPercent = (campaign.gamesWon / (TOTAL_STAGES * GAMES_PER_STAGE)) * 100

  const handleStageClick = (stage: CampaignStage) => {
    if (isStageUnlocked(stage.id)) {
      setSelectedStage(stage)
    }
  }

  const handlePlay = () => {
    if (selectedStage) {
      onSelectStage(selectedStage.id)
    }
  }

  return (
    <main className="fixed inset-0 overflow-hidden">
      {/* Video Background */}
      <VideoBackground 
        src={BACKGROUND_VIDEO}
        poster={BACKGROUND_POSTER}
        overlay={true}
        overlayOpacity={0.6}
      />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/90 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        
        {/* Header */}
        <header 
          className="px-4 pt-4 pb-2"
          style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}
        >
          <div className="flex items-center gap-4">
            <motion.button
              onClick={onBack}
              className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md"
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>

            <div className="flex-1">
              <motion.h1 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-black uppercase tracking-wide"
                style={{
                  background: 'linear-gradient(135deg, #69BE28 0%, #7ed957 50%, #FFFFFF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontFamily: 'var(--font-bebas), var(--font-oswald), sans-serif',
                }}
              >
                Road to Super Bowl
              </motion.h1>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">
                2025 Season • {campaign.gamesWon} Games Won
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <motion.div 
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            className="mt-4"
          >
            <div className="flex items-center justify-between text-[9px] text-white/40 uppercase tracking-wider mb-1">
              <span>Progress</span>
              <span>{progressPercent.toFixed(0)}%</span>
            </div>
            <div 
              className="h-2 rounded-full overflow-hidden"
              style={{ background: 'rgba(255, 255, 255, 0.1)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #69BE28 0%, #7ed957 100%)',
                  boxShadow: '0 0 20px rgba(105, 190, 40, 0.6)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </div>
          </motion.div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          
          {/* Current Game Highlight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard variant="green" padding="md">
              <div className="flex items-center gap-4">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, #${currentStage.visuals.opponent.primary.toString(16).padStart(6, '0')} 0%, #${currentStage.visuals.opponent.accent.toString(16).padStart(6, '0')} 100%)`,
                  }}
                >
                  <span className="text-white font-black text-lg">
                    {currentStage.weekLabel.replace('Week ', 'W')}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="text-[10px] text-[#69BE28] uppercase tracking-wider font-bold">
                    Next Game
                  </div>
                  <div className="text-white font-bold text-lg">
                    {currentStage.location.isHome ? 'vs' : '@'} {currentStage.visuals.opponent.name.split(' ').slice(-1)[0]}
                  </div>
                  <div className="text-white/50 text-xs">
                    {currentStage.name}
                  </div>
                </div>
                <GradientButton size="sm" onClick={() => handleStageClick(currentStage)}>
                  Play
                </GradientButton>
              </div>
            </GlassCard>
          </motion.div>

          {/* Regular Season */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 rounded-full bg-[#69BE28]" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Regular Season
              </h2>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {regularSeasonStages.map((stage, i) => (
                <StageCard
                  key={stage.id}
                  stage={stage}
                  isUnlocked={isStageUnlocked(stage.id)}
                  isCurrent={stage.id === campaign.currentStageId}
                  isCompleted={campaign.stageHighScores[stage.id] !== undefined}
                  onClick={() => handleStageClick(stage)}
                  delay={0.4 + i * 0.03}
                />
              ))}
            </div>
          </motion.section>

          {/* Playoffs */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 rounded-full bg-[#FFD700]" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Playoffs
              </h2>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {playoffStages.map((stage, i) => (
                <StageCard
                  key={stage.id}
                  stage={stage}
                  isUnlocked={isStageUnlocked(stage.id)}
                  isCurrent={stage.id === campaign.currentStageId}
                  isCompleted={campaign.stageHighScores[stage.id] !== undefined}
                  onClick={() => handleStageClick(stage)}
                  delay={0.7 + i * 0.05}
                  isPlayoff
                />
              ))}
            </div>
          </motion.section>

          {/* Super Bowl */}
          {superBowl && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="text-lg">🏆</div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Championship
                </h2>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <SuperBowlCard
                stage={superBowl}
                isUnlocked={isStageUnlocked(superBowl.id)}
                isCompleted={campaign.superBowlWon}
                onClick={() => handleStageClick(superBowl)}
              />
            </motion.section>
          )}

          {/* Bottom Padding */}
          <div className="h-8" />
        </div>
      </div>

      {/* Stage Preview Bottom Sheet */}
      <AnimatePresence>
        {selectedStage && (
          <StagePreviewSheet
            stage={selectedStage}
            onPlay={handlePlay}
            onClose={() => setSelectedStage(null)}
            highScore={campaign.stageHighScores[selectedStage.id]}
          />
        )}
      </AnimatePresence>
    </main>
  )
}

// ============================================================================
// STAGE CARD
// ============================================================================

interface StageCardProps {
  stage: CampaignStage
  isUnlocked: boolean
  isCurrent: boolean
  isCompleted: boolean
  onClick: () => void
  delay?: number
  isPlayoff?: boolean
}

function StageCard({ stage, isUnlocked, isCurrent, isCompleted, onClick, delay = 0, isPlayoff }: StageCardProps) {
  const opponentShort = stage.visuals.opponent.name.split(' ').slice(-1)[0]
  
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      onClick={onClick}
      disabled={!isUnlocked}
      className={`
        relative w-full text-left rounded-xl overflow-hidden
        ${!isUnlocked ? 'opacity-40' : ''}
      `}
      whileHover={isUnlocked ? { scale: 1.02 } : undefined}
      whileTap={isUnlocked ? { scale: 0.98 } : undefined}
    >
      {/* Background with team color accent */}
      <div 
        className="absolute inset-0"
        style={{
          background: isCurrent 
            ? 'linear-gradient(135deg, rgba(105, 190, 40, 0.2) 0%, rgba(105, 190, 40, 0.05) 100%)'
            : isCompleted
              ? 'linear-gradient(135deg, rgba(105, 190, 40, 0.15) 0%, rgba(0, 34, 68, 0.8) 100%)'
              : 'rgba(0, 34, 68, 0.6)',
          backdropFilter: 'blur(10px)',
        }}
      />
      
      {/* Team color bar */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{
          background: isCompleted 
            ? '#69BE28' 
            : `#${stage.visuals.opponent.primary.toString(16).padStart(6, '0')}`,
        }}
      />

      {/* Content */}
      <div className="relative p-3 pl-4">
        <div className="flex items-start justify-between">
          <div>
            <div 
              className="text-[9px] uppercase tracking-wider font-bold mb-0.5"
              style={{ color: isPlayoff ? '#FFD700' : '#69BE28' }}
            >
              {stage.weekLabel}
            </div>
            <div className="text-white font-bold text-sm">
              {stage.location.isHome ? 'vs' : '@'} {opponentShort}
            </div>
          </div>
          
          {/* Status */}
          {isCompleted ? (
            <div className="w-6 h-6 rounded-full bg-[#69BE28] flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : !isUnlocked ? (
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
              <svg className="w-3 h-3 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1C8.676 1 6 3.676 6 7v2H4v14h16V9h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4z"/>
              </svg>
            </div>
          ) : isCurrent ? (
            <motion.div 
              className="w-6 h-6 rounded-full bg-[#69BE28]/30 flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <div className="w-2 h-2 rounded-full bg-[#69BE28]" />
            </motion.div>
          ) : null}
        </div>

        {/* Difficulty dots */}
        <div className="flex gap-0.5 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: i < Math.ceil(stage.difficulty / 2) 
                  ? '#E53935' 
                  : 'rgba(255, 255, 255, 0.1)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Border */}
      <div 
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          border: isCurrent 
            ? '2px solid rgba(105, 190, 40, 0.5)' 
            : '1px solid rgba(255, 255, 255, 0.1)',
        }}
      />
    </motion.button>
  )
}

// ============================================================================
// SUPER BOWL CARD
// ============================================================================

interface SuperBowlCardProps {
  stage: CampaignStage
  isUnlocked: boolean
  isCompleted: boolean
  onClick: () => void
}

function SuperBowlCard({ stage, isUnlocked, isCompleted, onClick }: SuperBowlCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      disabled={!isUnlocked}
      className={`
        relative w-full text-left rounded-2xl overflow-hidden
        ${!isUnlocked ? 'opacity-40' : ''}
      `}
      whileHover={isUnlocked ? { scale: 1.02 } : undefined}
      whileTap={isUnlocked ? { scale: 0.98 } : undefined}
    >
      {/* Golden gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: isCompleted
            ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
            : isUnlocked
              ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 165, 0, 0.1) 100%)'
              : 'rgba(0, 34, 68, 0.6)',
          backdropFilter: 'blur(10px)',
        }}
      />

      {/* Content */}
      <div className="relative p-5 flex items-center gap-4">
        <div 
          className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
          style={{
            background: isCompleted 
              ? 'rgba(0, 0, 0, 0.2)' 
              : 'linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 165, 0, 0.2) 100%)',
            border: '2px solid rgba(255, 215, 0, 0.5)',
          }}
        >
          🏆
        </div>
        
        <div className="flex-1">
          <div 
            className="text-xs uppercase tracking-wider font-bold"
            style={{ color: isCompleted ? '#000' : '#FFD700' }}
          >
            Super Bowl LX
          </div>
          <div 
            className="text-xl font-black uppercase"
            style={{ color: isCompleted ? '#000' : '#fff' }}
          >
            {stage.name}
          </div>
          <div 
            className="text-sm"
            style={{ color: isCompleted ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.5)' }}
          >
            {stage.location.city}, {stage.location.state}
          </div>
        </div>

        {isCompleted && (
          <div className="text-4xl">👑</div>
        )}
        
        {!isUnlocked && (
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-white/40" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1C8.676 1 6 3.676 6 7v2H4v14h16V9h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4z"/>
            </svg>
          </div>
        )}
      </div>

      {/* Border */}
      <div 
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          border: '2px solid rgba(255, 215, 0, 0.3)',
        }}
      />
    </motion.button>
  )
}

// ============================================================================
// STAGE PREVIEW BOTTOM SHEET
// ============================================================================

interface StagePreviewSheetProps {
  stage: CampaignStage
  onPlay: () => void
  onClose: () => void
  highScore?: number
}

function StagePreviewSheet({ stage, onPlay, onClose, highScore }: StagePreviewSheetProps) {
  const opponentShort = stage.visuals.opponent.name.split(' ').slice(-1)[0]
  
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Sheet */}
      <motion.div
        className="relative z-10 w-full max-w-lg"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        <div 
          className="rounded-t-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(0, 34, 68, 0.98) 0%, rgba(0, 20, 40, 0.98) 100%)',
            backdropFilter: 'blur(20px)',
            paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
          }}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>

          {/* Team Color Bar */}
          <div 
            className="h-1 w-full"
            style={{
              background: `linear-gradient(90deg, #${stage.visuals.opponent.primary.toString(16).padStart(6, '0')} 0%, #${stage.visuals.opponent.accent.toString(16).padStart(6, '0')} 100%)`,
            }}
          />

          <div className="p-6">
            {/* Matchup */}
            <div className="flex items-center justify-center gap-6 mb-6">
              {/* Seahawks */}
              <div className="text-center">
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center mb-2"
                  style={{
                    background: 'linear-gradient(135deg, #002244 0%, #001a33 100%)',
                    border: '2px solid #69BE28',
                    boxShadow: '0 0 20px rgba(105, 190, 40, 0.3)',
                  }}
                >
                  <span className="text-xl font-black text-[#69BE28]">SEA</span>
                </div>
                <span className="text-[10px] text-white/60 uppercase tracking-wider">Seahawks</span>
              </div>

              {/* VS */}
              <div className="text-center">
                <div 
                  className="text-2xl font-black mb-1"
                  style={{ color: 'rgba(255, 255, 255, 0.2)' }}
                >
                  VS
                </div>
                <div 
                  className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    background: stage.isPlayoff || stage.isSuperBowl 
                      ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' 
                      : 'rgba(105, 190, 40, 0.2)',
                    color: stage.isPlayoff || stage.isSuperBowl ? '#000' : '#69BE28',
                  }}
                >
                  {stage.weekLabel}
                </div>
              </div>

              {/* Opponent */}
              <div className="text-center">
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center mb-2"
                  style={{
                    background: `linear-gradient(135deg, #${stage.visuals.opponent.primary.toString(16).padStart(6, '0')} 0%, #${stage.visuals.opponent.accent.toString(16).padStart(6, '0')} 100%)`,
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <span className="text-xl font-black text-white">{opponentShort.substring(0, 3).toUpperCase()}</span>
                </div>
                <span className="text-[10px] text-white/60 uppercase tracking-wider">{opponentShort}</span>
              </div>
            </div>

            {/* Stage Info */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-black text-white uppercase mb-1">
                {stage.name}
              </h3>
              <p className="text-sm text-white/50">
                {stage.location.isHome ? '🏠 Home' : '✈️ Away'} • {stage.location.city}, {stage.location.state}
              </p>
            </div>

            {/* Stats Row */}
            <div className="flex justify-center gap-8 mb-6">
              {/* Difficulty */}
              <div className="text-center">
                <div className="text-[9px] text-white/40 uppercase tracking-wider mb-1">Difficulty</div>
                <div className="flex gap-1">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-4 rounded-sm"
                      style={{
                        background: i < stage.difficulty 
                          ? 'linear-gradient(180deg, #E53935 0%, #B71C1C 100%)' 
                          : 'rgba(255, 255, 255, 0.1)',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* High Score */}
              {highScore !== undefined && (
                <div className="text-center">
                  <div className="text-[9px] text-white/40 uppercase tracking-wider mb-1">High Score</div>
                  <div 
                    className="text-xl font-black"
                    style={{ color: '#69BE28', fontFamily: 'var(--font-oswald), sans-serif' }}
                  >
                    {highScore.toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <GradientButton 
                size="lg" 
                fullWidth 
                onClick={onPlay}
                icon={
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                }
              >
                {stage.isSuperBowl ? 'Play Super Bowl' : 'Start Game'}
              </GradientButton>

              <GhostButton fullWidth onClick={onClose}>
                Cancel
              </GhostButton>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default CampaignMap
