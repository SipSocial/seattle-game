'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { VideoBackground } from '@/components/ui/VideoBackground'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { FlightPath } from './FlightPath'
import { CityMarker } from './CityMarker'
import { CityPreview } from './CityPreview'
import { useGameStore } from '@/src/store/gameStore'
import { CAMPAIGN_STAGES, CampaignStage } from '@/src/game/data/campaign'
import { PLACEHOLDER_ASSETS } from '@/src/game/data/campaignAssets'

// Default background (will be replaced with Leonardo-generated map)
const MAP_VIDEO = PLACEHOLDER_ASSETS.mapVideo
const MAP_POSTER = PLACEHOLDER_ASSETS.mapPoster

interface CampaignMapV2Props {
  onSelectStage: (stageId: number) => void
  onBack: () => void
  // Optional custom assets from Leonardo
  mapVideoUrl?: string | null
  mapImageUrl?: string | null
  airplaneUrl?: string | null
}

export function CampaignMapV2({
  onSelectStage,
  onBack,
  mapVideoUrl,
  mapImageUrl,
  airplaneUrl,
}: CampaignMapV2Props) {
  const campaign = useGameStore((s) => s.campaign)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [selectedStage, setSelectedStage] = useState<CampaignStage | null>(null)
  const [showPlaneArrived, setShowPlaneArrived] = useState(false)

  // Get completed stage IDs
  const completedStageIds = useMemo(() => {
    return campaign.stagesUnlocked.filter(id => campaign.stageHighScores[id] !== undefined)
  }, [campaign.stagesUnlocked, campaign.stageHighScores])

  // Current stage
  const currentStage = useMemo(() => {
    return CAMPAIGN_STAGES.find(s => s.id === campaign.currentStageId) || CAMPAIGN_STAGES[0]
  }, [campaign.currentStageId])

  // Progress calculation
  const progressPercent = useMemo(() => {
    return ((campaign.currentStageId - 1) / CAMPAIGN_STAGES.length) * 100
  }, [campaign.currentStageId])

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (mapContainerRef.current) {
        const rect = mapContainerRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height: rect.height })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Check if stage is unlocked
  const isStageUnlocked = useCallback(
    (stageId: number) => {
      return campaign.stagesUnlocked.includes(stageId)
    },
    [campaign.stagesUnlocked]
  )

  // Handle marker click
  const handleMarkerClick = useCallback((stage: CampaignStage) => {
    if (isStageUnlocked(stage.id)) {
      setSelectedStage(stage)
    }
  }, [isStageUnlocked])

  // Handle play button
  const handlePlay = useCallback(() => {
    if (selectedStage) {
      onSelectStage(selectedStage.id)
    }
  }, [selectedStage, onSelectStage])

  // Handle plane arrival
  const handlePlaneArrival = useCallback(() => {
    setShowPlaneArrived(true)
    // Auto-show current stage after plane arrives
    setTimeout(() => {
      setSelectedStage(currentStage)
    }, 500)
  }, [currentStage])

  // Calculate city marker positions
  const cityPositions = useMemo(() => {
    return CAMPAIGN_STAGES.map(stage => ({
      stage,
      x: stage.location.coordinates.x * dimensions.width,
      y: stage.location.coordinates.y * dimensions.height,
      isCompleted: completedStageIds.includes(stage.id),
      isCurrent: stage.id === campaign.currentStageId,
      isLocked: !isStageUnlocked(stage.id),
    }))
  }, [dimensions, completedStageIds, campaign.currentStageId, isStageUnlocked])

  return (
    <main className="fixed inset-0 overflow-hidden">
      {/* Video/Image Background - US Map */}
      {mapVideoUrl ? (
        <VideoBackground src={mapVideoUrl} overlay overlayOpacity={0.3} />
      ) : mapImageUrl ? (
        <div className="absolute inset-0">
          <img
            src={mapImageUrl}
            alt="US Map"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
      ) : (
        <VideoBackground src={MAP_VIDEO} poster={MAP_POSTER} overlay overlayOpacity={0.4} />
      )}

      {/* Grid overlay for tactical look */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(105, 190, 40, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(105, 190, 40, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Top gradient */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10" />

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/90 to-transparent pointer-events-none z-10" />

      {/* Header */}
      <header
        className="relative z-20 px-4 pt-4"
        style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}
      >
        <div className="flex items-center gap-4">
          {/* Back button */}
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
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>

          {/* Title */}
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

          {/* Current stage indicator */}
          <GlassCard padding="sm" className="hidden sm:block">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#69BE28] animate-pulse" />
              <span className="text-xs text-white/70">{currentStage.weekLabel}</span>
            </div>
          </GlassCard>
        </div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          className="mt-4"
        >
          <div className="flex items-center justify-between text-[9px] text-white/40 uppercase tracking-wider mb-1">
            <span>Seattle</span>
            <span>{progressPercent.toFixed(0)}%</span>
            <span>Super Bowl</span>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: 'rgba(255, 255, 255, 0.1)' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #69BE28 0%, #FFD700 100%)',
                boxShadow: '0 0 20px rgba(105, 190, 40, 0.6)',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </motion.div>
      </header>

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className="absolute inset-0 z-0"
        style={{ top: 120, bottom: 100 }}
      >
        {/* Flight Path with Airplane */}
        <FlightPath
          currentStageId={campaign.currentStageId}
          completedStageIds={completedStageIds}
          onArrival={handlePlaneArrival}
          airplaneImageUrl={airplaneUrl}
          showAirplane={true}
        />

        {/* City Markers */}
        {cityPositions.map(({ stage, x, y, isCompleted, isCurrent, isLocked }) => (
          <CityMarker
            key={stage.id}
            stage={stage}
            x={x}
            y={y}
            isCompleted={isCompleted}
            isCurrent={isCurrent}
            isLocked={isLocked}
            onClick={() => handleMarkerClick(stage)}
            size={isCurrent ? 'lg' : 'md'}
          />
        ))}
      </div>

      {/* Bottom Quick Play Panel */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20"
        style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.5, type: 'spring', stiffness: 200 }}
          className="px-4"
        >
          <GlassCard variant="green" padding="md">
            <div className="flex items-center gap-4">
              {/* Opponent icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, #${currentStage.visuals.opponent.primary
                    .toString(16)
                    .padStart(6, '0')} 0%, #${currentStage.visuals.opponent.accent
                    .toString(16)
                    .padStart(6, '0')} 100%)`,
                }}
              >
                <span className="text-white font-black text-sm">
                  {currentStage.weekLabel.replace('Week ', 'W')}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-[#69BE28] uppercase tracking-wider font-bold">
                  Next Game
                </div>
                <div className="text-white font-bold truncate">
                  {currentStage.location.isHome ? 'vs' : '@'}{' '}
                  {currentStage.visuals.opponent.name.split(' ').slice(-1)[0]}
                </div>
              </div>

              {/* Play button */}
              <GradientButton size="sm" onClick={() => setSelectedStage(currentStage)}>
                Play
              </GradientButton>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* City Preview Modal */}
      <CityPreview
        stage={selectedStage || currentStage}
        isOpen={!!selectedStage}
        onClose={() => setSelectedStage(null)}
        onPlay={handlePlay}
        highScore={
          selectedStage ? campaign.stageHighScores[selectedStage.id] : undefined
        }
      />

      {/* Legend */}
      <motion.div
        className="absolute left-4 bottom-32 z-20 hidden sm:block"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2 }}
      >
        <GlassCard padding="sm">
          <div className="text-[9px] text-white/50 uppercase tracking-wider mb-2">Legend</div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#69BE28]" />
              <span className="text-[10px] text-white/60">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-[#69BE28] bg-transparent animate-pulse" />
              <span className="text-[10px] text-white/60">Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-white/20" />
              <span className="text-[10px] text-white/60">Locked</span>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </main>
  )
}

export default CampaignMapV2
