'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  useSoundtrackStore, 
  useCurrentArtist,
  usePlaybackProgress,
  useSoundtrackControls,
} from '@/src/store/soundtrackStore'
import { getTrackDisplayTitle, formatDuration } from '@/src/game/data/soundtrack'

// ----------------------------------------------------------------------------
// Icons
// ----------------------------------------------------------------------------

const PlayIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
)

const PauseIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
  </svg>
)

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
)

const SkipBackIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
  </svg>
)

const SkipForwardIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
  </svg>
)

const VolumeIcon = ({ muted }: { muted: boolean }) => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    {muted ? (
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    )}
  </svg>
)

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

// ----------------------------------------------------------------------------
// Animation Configs
// ----------------------------------------------------------------------------

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }

const slideUp = {
  initial: { y: '100%', opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: '100%', opacity: 0 },
}

// ----------------------------------------------------------------------------
// Progress Bar Component
// ----------------------------------------------------------------------------

function ProgressBar({ 
  progress, 
  currentTime, 
  duration,
  onSeek,
}: { 
  progress: number
  currentTime: number
  duration: number
  onSeek: (percent: number) => void
}) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    onSeek(Math.max(0, Math.min(1, percent)))
  }
  
  return (
    <div style={{ width: '100%' }}>
      {/* Progress Track */}
      <div
        onClick={handleClick}
        style={{
          width: '100%',
          height: '4px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '2px',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Progress Fill */}
        <motion.div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, #69BE28 0%, #8BD44A 100%)',
            borderRadius: '2px',
            width: `${progress * 100}%`,
          }}
          transition={{ duration: 0.1 }}
        />
      </div>
      
      {/* Time Display */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '8px',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.5)',
            fontFamily: 'var(--font-oswald), sans-serif',
          }}
        >
          {formatDuration(currentTime)}
        </span>
        <span
          style={{
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.5)',
            fontFamily: 'var(--font-oswald), sans-serif',
          }}
        >
          {formatDuration(duration)}
        </span>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------------
// Volume Slider Component
// ----------------------------------------------------------------------------

function VolumeSlider() {
  const volume = useSoundtrackStore((state) => state.volume)
  const muted = useSoundtrackStore((state) => state.muted)
  const setVolume = useSoundtrackStore((state) => state.setVolume)
  const toggleMute = useSoundtrackStore((state) => state.toggleMute)
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value))
  }
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button
        onClick={toggleMute}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.6)',
          cursor: 'pointer',
          padding: '4px',
        }}
      >
        <VolumeIcon muted={muted} />
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={muted ? 0 : volume}
        onChange={handleChange}
        style={{
          width: '80px',
          accentColor: '#69BE28',
        }}
      />
    </div>
  )
}

// ----------------------------------------------------------------------------
// FullPlayer Component
// ----------------------------------------------------------------------------

export function FullPlayer() {
  const playerView = useSoundtrackStore((state) => state.playerView)
  const currentTrack = useSoundtrackStore((state) => state.currentTrack)
  const isPlaying = useSoundtrackStore((state) => state.isPlaying)
  const isLoading = useSoundtrackStore((state) => state.isLoading)
  const currentTime = useSoundtrackStore((state) => state.currentTime)
  const duration = useSoundtrackStore((state) => state.duration)
  const minimizePlayer = useSoundtrackStore((state) => state.minimizePlayer)
  const showArtist = useSoundtrackStore((state) => state.showArtist)
  
  const artist = useCurrentArtist()
  const progress = usePlaybackProgress()
  const controls = useSoundtrackControls()
  
  const shouldShow = playerView === 'full' && currentTrack
  
  if (!shouldShow) return null
  
  const trackTitle = currentTrack ? getTrackDisplayTitle(currentTrack) : ''
  const artistName = artist?.name || 'Unknown Artist'
  
  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col"
          variants={slideUp}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={spring}
        >
          {/* Backdrop */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, #001428 0%, #000810 100%)',
            }}
          />
          
          {/* Album art glow effect */}
          {currentTrack?.coverArt && (
            <div
              style={{
                position: 'absolute',
                top: '20%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '300px',
                height: '300px',
                background: `url(${currentTrack.coverArt}) center/cover`,
                filter: 'blur(80px)',
                opacity: 0.3,
              }}
            />
          )}
          
          {/* Content */}
          <div
            className="relative z-10 h-full flex flex-col"
            style={{
              paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
              paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
              paddingLeft: '24px',
              paddingRight: '24px',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <button
                onClick={minimizePlayer}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <CloseIcon />
              </button>
              
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'rgba(255, 255, 255, 0.5)',
                }}
              >
                Now Playing
              </span>
              
              <div style={{ width: '40px' }} /> {/* Spacer for centering */}
            </div>
            
            {/* Album Art */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px 0',
                position: 'relative',
              }}
            >
              {/* Pulsing glow effect behind album art */}
              <motion.div
                animate={isPlaying ? { 
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.5, 0.3],
                } : { scale: 1, opacity: 0.2 }}
                transition={isPlaying ? { 
                  repeat: Infinity, 
                  duration: 3, 
                  ease: 'easeInOut' 
                } : {}}
                style={{
                  position: 'absolute',
                  width: '320px',
                  height: '320px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(105, 190, 40, 0.4) 0%, transparent 70%)',
                  filter: 'blur(40px)',
                }}
              />
              
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ ...spring, delay: 0.1 }}
                style={{
                  width: '280px',
                  height: '280px',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 100px rgba(105, 190, 40, 0.2)',
                  background: '#002244',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '3px solid rgba(105, 190, 40, 0.3)',
                  position: 'relative',
                }}
              >
                {currentTrack?.coverArt ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentTrack.coverArt}
                    alt={trackTitle}
                    style={{ 
                      width: '85%', 
                      height: '85%', 
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: '80px',
                      fontWeight: 900,
                      color: '#69BE28',
                      fontFamily: 'var(--font-oswald), sans-serif',
                    }}
                  >
                    ♪
                  </span>
                )}
              </motion.div>
            </div>
            
            {/* Track Info */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h1
                style={{
                  fontSize: '24px',
                  fontWeight: 900,
                  color: 'rgba(255, 255, 255, 0.95)',
                  fontFamily: 'var(--font-oswald), sans-serif',
                  marginBottom: '8px',
                }}
              >
                {trackTitle}
              </h1>
              
              <button
                onClick={() => artist && showArtist(artist)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#69BE28',
                  fontSize: '16px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <UserIcon />
                {artistName}
              </button>
            </div>
            
            {/* Progress Bar */}
            <div style={{ marginBottom: '24px' }}>
              <ProgressBar
                progress={progress}
                currentTime={currentTime}
                duration={duration}
                onSeek={controls.seekPercent}
              />
            </div>
            
            {/* Playback Controls */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '32px',
                marginBottom: '24px',
              }}
            >
              {/* Skip Back */}
              <button
                onClick={() => controls.seek(0)}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <SkipBackIcon />
              </button>
              
              {/* Play/Pause */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => controls.togglePlayPause()}
                disabled={isLoading}
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #69BE28 0%, #4A9A1C 100%)',
                  border: 'none',
                  color: '#002244',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 8px 32px rgba(105, 190, 40, 0.4)',
                }}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                  </motion.div>
                ) : isPlaying ? (
                  <PauseIcon size={32} />
                ) : (
                  <PlayIcon size={32} />
                )}
              </motion.button>
              
              {/* Skip Forward */}
              <button
                onClick={() => controls.seek(duration)}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <SkipForwardIcon />
              </button>
            </div>
            
            {/* Volume Control */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <VolumeSlider />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default FullPlayer
