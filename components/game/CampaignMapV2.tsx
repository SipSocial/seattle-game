'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { VideoBackground } from '@/components/ui/VideoBackground'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { GhostButton } from '@/components/ui/GhostButton'
import { FlightPath } from './FlightPath'
import { CityMarker } from './CityMarker'
import { CityPreview } from './CityPreview'
import { useGameStore } from '@/src/store/gameStore'
import { CAMPAIGN_STAGES, CampaignStage } from '@/src/game/data/campaign'
import { PLACEHOLDER_ASSETS, getCityAsset } from '@/src/game/data/campaignAssets'
import { AudioManager } from '@/src/game/systems/AudioManager'

// Default background (will be replaced with Leonardo-generated map)
const MAP_VIDEO = PLACEHOLDER_ASSETS.mapVideo
const MAP_POSTER = PLACEHOLDER_ASSETS.mapPoster

// Unique location type for grouping multiple games
interface UniqueLocation {
  key: string
  city: string
  state: string
  coordinates: { x: number; y: number }
  stages: CampaignStage[]
  // Derived status based on stages
  hasCurrentGame: boolean
  hasCompletedGames: boolean
  hasUnlockedGames: boolean
  gamesCount: number
  // The stage to show by default (current > first unlocked > first)
  primaryStage: CampaignStage
}

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
  const [selectedLocation, setSelectedLocation] = useState<UniqueLocation | null>(null)
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

  // Group stages by unique locations (no overlapping bubbles)
  const uniqueLocations = useMemo(() => {
    const locationMap = new Map<string, UniqueLocation>()

    CAMPAIGN_STAGES.forEach(stage => {
      const key = `${stage.location.coordinates.x}-${stage.location.coordinates.y}`

      if (locationMap.has(key)) {
        // Add stage to existing location
        const existing = locationMap.get(key)!
        existing.stages.push(stage)
        existing.gamesCount++

        // Update status
        if (stage.id === campaign.currentStageId) {
          existing.hasCurrentGame = true
          existing.primaryStage = stage
        }
        if (completedStageIds.includes(stage.id)) {
          existing.hasCompletedGames = true
        }
        if (isStageUnlocked(stage.id)) {
          existing.hasUnlockedGames = true
          // If no current game, use first unlocked as primary
          if (!existing.hasCurrentGame && !existing.primaryStage) {
            existing.primaryStage = stage
          }
        }
      } else {
        // Create new location
        locationMap.set(key, {
          key,
          city: stage.location.city,
          state: stage.location.state,
          coordinates: stage.location.coordinates,
          stages: [stage],
          hasCurrentGame: stage.id === campaign.currentStageId,
          hasCompletedGames: completedStageIds.includes(stage.id),
          hasUnlockedGames: isStageUnlocked(stage.id),
          gamesCount: 1,
          primaryStage: stage,
        })
      }
    })

    return Array.from(locationMap.values())
  }, [campaign.currentStageId, completedStageIds, isStageUnlocked])

  // Handle marker click - show location picker if multiple games, or preview if single
  const handleMarkerClick = useCallback((location: UniqueLocation) => {
    if (location.gamesCount === 1) {
      // Single game - go directly to preview
      setSelectedStage(location.primaryStage)
    } else {
      // Multiple games - show location picker
      setSelectedLocation(location)
    }
  }, [])

  // Handle selecting a specific stage from location picker
  const handleStageSelect = useCallback((stage: CampaignStage) => {
    setSelectedLocation(null)
    setSelectedStage(stage)
  }, [])

  // Handle play button
  const handlePlay = useCallback(() => {
    if (selectedStage && isStageUnlocked(selectedStage.id)) {
      onSelectStage(selectedStage.id)
    }
  }, [selectedStage, isStageUnlocked, onSelectStage])

  // Handle plane arrival
  const handlePlaneArrival = useCallback(() => {
    setShowPlaneArrived(true)
    // Auto-show current stage after plane arrives
    setTimeout(() => {
      setSelectedStage(currentStage)
    }, 500)
  }, [currentStage])

  // Calculate unique location positions for markers
  const locationPositions = useMemo(() => {
    return uniqueLocations.map(location => ({
      location,
      x: location.coordinates.x * dimensions.width,
      y: location.coordinates.y * dimensions.height,
    }))
  }, [uniqueLocations, dimensions])

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
            onClick={() => { AudioManager.playMenuClick(); onBack(); }}
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

        {/* Unique Location Markers (no overlaps) - z-index above plane (35) */}
        {locationPositions.map(({ location, x, y }) => (
          <motion.button
            key={location.key}
            className="absolute pointer-events-auto"
            style={{
              left: x,
              top: y,
              transform: 'translate(-50%, -50%)',
              zIndex: location.hasCurrentGame ? 50 : location.hasUnlockedGames ? 45 : 40,
            }}
            onClick={() => { AudioManager.playNavigate(); handleMarkerClick(location); }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 + Math.random() * 0.5, type: 'spring' }}
          >
            {/* Outer glow ring - pulsing for unlocked playable locations */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                transform: 'scale(1.5)',
                background: location.hasCurrentGame
                  ? 'radial-gradient(circle, rgba(105, 190, 40, 0.5) 0%, transparent 70%)'
                  : location.hasUnlockedGames && !location.hasCompletedGames
                  ? 'radial-gradient(circle, rgba(105, 190, 40, 0.35) 0%, transparent 70%)'
                  : location.hasCompletedGames
                  ? 'radial-gradient(circle, rgba(105, 190, 40, 0.2) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
              }}
              animate={
                location.hasUnlockedGames && !location.hasCurrentGame && !location.hasCompletedGames
                  ? { scale: [1.5, 1.8, 1.5], opacity: [1, 0.7, 1] }
                  : {}
              }
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Main marker */}
            <motion.div
              className={`relative flex items-center justify-center rounded-full transition-all ${
                location.hasCurrentGame ? 'w-12 h-12' : location.hasUnlockedGames ? 'w-11 h-11' : 'w-10 h-10'
              }`}
              style={{
                background: location.hasCurrentGame
                  ? 'linear-gradient(135deg, #69BE28 0%, #4a9c1c 100%)'
                  : location.hasUnlockedGames && !location.hasCompletedGames
                  ? 'linear-gradient(135deg, #1a4a1a 0%, #0d3a0d 100%)'
                  : location.hasCompletedGames
                  ? 'linear-gradient(135deg, #002244 0%, #001a33 100%)'
                  : 'linear-gradient(135deg, #333 0%, #222 100%)',
                border: location.hasCurrentGame
                  ? '3px solid #69BE28'
                  : location.hasUnlockedGames && !location.hasCompletedGames
                  ? '2px solid #69BE28'
                  : location.hasCompletedGames
                  ? '2px solid #69BE28'
                  : '2px solid rgba(255, 255, 255, 0.2)',
                boxShadow: location.hasCurrentGame
                  ? '0 0 30px rgba(105, 190, 40, 0.6)'
                  : location.hasUnlockedGames && !location.hasCompletedGames
                  ? '0 0 20px rgba(105, 190, 40, 0.4)'
                  : location.hasCompletedGames
                  ? '0 4px 20px rgba(0, 0, 0, 0.4)'
                  : '0 2px 10px rgba(0, 0, 0, 0.3)',
              }}
              animate={
                location.hasUnlockedGames && !location.hasCurrentGame && !location.hasCompletedGames
                  ? { scale: [1, 1.05, 1] }
                  : {}
              }
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Icon or abbreviation */}
              {location.hasCurrentGame ? (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-3 h-3 rounded-full bg-white"
                />
              ) : location.hasUnlockedGames && !location.hasCompletedGames ? (
                // Playable location - show play icon
                <motion.svg 
                  className="w-5 h-5 text-[#69BE28]" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <path d="M8 5v14l11-7z" />
                </motion.svg>
              ) : location.hasCompletedGames ? (
                <svg className="w-5 h-5 text-[#69BE28]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                </svg>
              )}

              {/* Game count badge - animated for playable locations */}
              {location.gamesCount > 1 && (
                <motion.div
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{
                    background: location.hasCurrentGame || (location.hasUnlockedGames && !location.hasCompletedGames)
                      ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                      : 'linear-gradient(135deg, #69BE28 0%, #4a9c1c 100%)',
                    color: '#000',
                    border: '2px solid #002244',
                    boxShadow: location.hasUnlockedGames && !location.hasCompletedGames
                      ? '0 0 10px rgba(255, 215, 0, 0.6)'
                      : 'none',
                  }}
                  animate={
                    location.hasUnlockedGames && !location.hasCompletedGames
                      ? { scale: [1, 1.15, 1] }
                      : {}
                  }
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {location.gamesCount}
                </motion.div>
              )}
            </motion.div>

            {/* City label */}
            <div
              className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-center"
              style={{ top: location.hasCurrentGame ? '56px' : location.hasUnlockedGames ? '52px' : '48px' }}
            >
              <div
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                style={{
                  background: location.hasCurrentGame || (location.hasUnlockedGames && !location.hasCompletedGames)
                    ? 'rgba(0, 34, 68, 0.9)'
                    : 'rgba(0, 0, 0, 0.6)',
                  color: location.hasCurrentGame 
                    ? '#69BE28' 
                    : location.hasUnlockedGames && !location.hasCompletedGames
                    ? '#69BE28'
                    : 'rgba(255, 255, 255, 0.7)',
                  border: location.hasUnlockedGames && !location.hasCompletedGames
                    ? '1px solid rgba(105, 190, 40, 0.4)'
                    : 'none',
                }}
              >
                {location.city}
                {location.hasUnlockedGames && !location.hasCompletedGames && !location.hasCurrentGame && (
                  <span className="ml-1 text-[#FFD700]">▶</span>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Bottom Quick Play Panel - 64px bottom padding for audio bar (48px) + 16px gap */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 64px)' }}
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

      {/* Location Picker Modal (for cities with multiple games) */}
      <AnimatePresence>
        {selectedLocation && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => { AudioManager.playMenuClick(); setSelectedLocation(null); }}
            />

            {/* City background */}
            {getCityAsset(selectedLocation.city)?.backgroundImage && (
              <motion.div
                className="absolute inset-0 overflow-hidden opacity-30"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
              >
                <img
                  src={getCityAsset(selectedLocation.city)?.backgroundImage || ''}
                  alt={selectedLocation.city}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}

            {/* Panel */}
            <motion.div
              className="relative z-10 w-full max-w-md mx-4 mb-4 sm:mb-0"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <GlassCard variant="green" padding="lg">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-black text-white uppercase">
                      {selectedLocation.city}
                    </h2>
                    <p className="text-xs text-white/50">
                      {selectedLocation.gamesCount} games at this location
                    </p>
                  </div>
                  <motion.button
                    onClick={() => { AudioManager.playMenuClick(); setSelectedLocation(null); }}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>

                {/* Games list */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedLocation.stages.map((stage, index) => {
                    const isCompleted = completedStageIds.includes(stage.id)
                    const isCurrent = stage.id === campaign.currentStageId
                    const isUnlocked = isStageUnlocked(stage.id)
                    const opponentShort = stage.visuals.opponent.name.split(' ').slice(-1)[0]

                    return (
                      <motion.button
                        key={stage.id}
                        className="w-full text-left p-3 rounded-xl transition-all"
                        style={{
                          background: isCurrent
                            ? 'linear-gradient(135deg, rgba(105, 190, 40, 0.3) 0%, rgba(0, 34, 68, 0.3) 100%)'
                            : 'rgba(255, 255, 255, 0.05)',
                          border: isCurrent
                            ? '2px solid #69BE28'
                            : '1px solid rgba(255, 255, 255, 0.1)',
                          opacity: isUnlocked ? 1 : 0.5,
                        }}
                        onClick={() => { if (isUnlocked) AudioManager.playSelect(); handleStageSelect(stage); }}
                        whileHover={{ scale: isUnlocked ? 1.02 : 1 }}
                        whileTap={{ scale: isUnlocked ? 0.98 : 1 }}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="flex items-center gap-3">
                          {/* Status icon */}
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              background: isCompleted
                                ? 'linear-gradient(135deg, #69BE28 0%, #4a9c1c 100%)'
                                : isCurrent
                                ? 'linear-gradient(135deg, #69BE28 0%, #002244 100%)'
                                : 'rgba(255, 255, 255, 0.1)',
                            }}
                          >
                            {isCompleted ? (
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                              </svg>
                            ) : isCurrent ? (
                              <motion.div
                                className="w-2 h-2 rounded-full bg-white"
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              />
                            ) : !isUnlocked ? (
                              <svg className="w-4 h-4 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                              </svg>
                            ) : (
                              <span className="text-white/60 text-xs font-bold">
                                {index + 1}
                              </span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className="text-[10px] font-bold uppercase tracking-wider"
                                style={{
                                  color: stage.isPlayoff || stage.isSuperBowl ? '#FFD700' : '#69BE28',
                                }}
                              >
                                {stage.weekLabel}
                              </span>
                              {isCurrent && (
                                <span className="text-[9px] bg-[#69BE28] text-black px-1.5 py-0.5 rounded-full font-bold uppercase">
                                  Next
                                </span>
                              )}
                            </div>
                            <div className="text-white font-bold truncate">
                              {stage.location.isHome ? 'vs' : '@'} {opponentShort}
                            </div>
                          </div>

                          {/* Arrow */}
                          {isUnlocked && (
                            <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </div>
                      </motion.button>
                    )
                  })}
                </div>

                {/* Quick play button for current game at this location */}
                {selectedLocation.hasCurrentGame && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <GradientButton
                      size="md"
                      fullWidth
                      onClick={() => {
                        const currentGameHere = selectedLocation.stages.find(
                          s => s.id === campaign.currentStageId
                        )
                        if (currentGameHere) {
                          setSelectedLocation(null)
                          onSelectStage(currentGameHere.id)
                        }
                      }}
                    >
                      Play {selectedLocation.stages.find(s => s.id === campaign.currentStageId)?.weekLabel}
                    </GradientButton>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* City Preview Modal */}
      <CityPreview
        stage={selectedStage || currentStage}
        isOpen={!!selectedStage}
        onClose={() => setSelectedStage(null)}
        onPlay={handlePlay}
        highScore={
          selectedStage ? campaign.stageHighScores[selectedStage.id] : undefined
        }
        isLocked={selectedStage ? !isStageUnlocked(selectedStage.id) : false}
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
