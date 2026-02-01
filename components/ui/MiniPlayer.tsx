'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  useSoundtrackStore, 
  useCurrentArtist,
  useIsPlayerVisible,
  useSoundtrackControls,
} from '@/src/store/soundtrackStore'
import { getTrackDisplayTitle } from '@/src/game/data/soundtrack'

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface MiniPlayerProps {
  /** Position of the player - 'top' or 'bottom' */
  position?: 'top' | 'bottom'
  /** Additional offset from the edge (in pixels) */
  offset?: number
  /** Variant style - 'default' is the full player, 'slim' is just text bar */
  variant?: 'default' | 'slim'
}

// ----------------------------------------------------------------------------
// Icons
// ----------------------------------------------------------------------------

const PlayIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
)

const PauseIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
  </svg>
)

const ChevronUpIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
)

// ----------------------------------------------------------------------------
// Animation Configs
// ----------------------------------------------------------------------------

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }

const slideDown = {
  initial: { y: -60, opacity: 0, scale: 0.95 },
  animate: { y: 0, opacity: 1, scale: 1 },
  exit: { y: -60, opacity: 0, scale: 0.95 },
}

const slideUp = {
  initial: { y: 60, opacity: 0, scale: 0.95 },
  animate: { y: 0, opacity: 1, scale: 1 },
  exit: { y: 60, opacity: 0, scale: 0.95 },
}

// ----------------------------------------------------------------------------
// Marquee Component
// ----------------------------------------------------------------------------

function MarqueeText({ text, className }: { text: string; className?: string }) {
  // Only animate if text is long enough to need scrolling
  const shouldAnimate = text.length > 25
  
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      {shouldAnimate ? (
        <motion.div
          className="inline-block"
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: text.length * 0.15,
              ease: 'linear',
            },
          }}
        >
          <span>{text}</span>
          <span style={{ paddingLeft: '48px' }}>{text}</span>
        </motion.div>
      ) : (
        <span>{text}</span>
      )}
    </div>
  )
}

// ----------------------------------------------------------------------------
// MiniPlayer Component
// ----------------------------------------------------------------------------

export function MiniPlayer({ position = 'bottom', offset = 0, variant = 'default' }: MiniPlayerProps) {
  const playerView = useSoundtrackStore((state) => state.playerView)
  const currentTrack = useSoundtrackStore((state) => state.currentTrack)
  const isPlaying = useSoundtrackStore((state) => state.isPlaying)
  const isLoading = useSoundtrackStore((state) => state.isLoading)
  const expandPlayer = useSoundtrackStore((state) => state.expandPlayer)
  const isVisible = useIsPlayerVisible()
  const artist = useCurrentArtist()
  const controls = useSoundtrackControls()
  
  // Only show when in mini view and we have a track
  const shouldShow = isVisible && playerView === 'mini' && currentTrack
  
  if (!shouldShow) return null
  
  const trackTitle = currentTrack ? getTrackDisplayTitle(currentTrack) : ''
  const artistName = artist?.name || 'Unknown Artist'
  const displayText = `${trackTitle} • ${artistName}`
  
  // Determine positioning based on prop
  const isTop = position === 'top'
  const positionStyle = isTop
    ? { top: `calc(env(safe-area-inset-top, 0px) + 8px + ${offset}px)` }
    : { bottom: `calc(env(safe-area-inset-bottom, 0px) + 8px + ${offset}px)` }
  
  const animationVariants = isTop ? slideDown : slideUp
  const ExpandIcon = isTop ? ChevronDownIcon : ChevronUpIcon
  
  // Slim variant - just a thin scrolling text bar
  if (variant === 'slim') {
    return (
      <AnimatePresence>
        {shouldShow && (
          <motion.div
            className="fixed left-0 right-0 z-40"
            style={{ bottom: `calc(env(safe-area-inset-bottom, 0px) + ${offset}px)` }}
            variants={slideUp}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={spring}
          >
            {/* Slim glass bar */}
            <div
              style={{
                background: 'linear-gradient(180deg, rgba(0, 34, 68, 0.95) 0%, rgba(0, 20, 40, 0.98) 100%)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderTop: '1px solid rgba(105, 190, 40, 0.3)',
                boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.4)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 16px',
                  gap: '12px',
                }}
              >
                {/* Music icon with glow when playing */}
                <motion.div
                  animate={isPlaying ? { 
                    scale: [1, 1.1, 1],
                    opacity: [0.8, 1, 0.8],
                  } : { scale: 1, opacity: 0.6 }}
                  transition={isPlaying ? { repeat: Infinity, duration: 1.5, ease: 'easeInOut' } : {}}
                  style={{
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#69BE28',
                    flexShrink: 0,
                  }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                </motion.div>
                
                {/* Scrolling Text - takes full width */}
                <button
                  onClick={expandPlayer}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                  }}
                >
                  <MarqueeText
                    text={displayText}
                    className="text-[12px] font-medium text-white/80"
                  />
                </button>
                
                {/* Compact Play/Pause */}
                <button
                  onClick={() => controls.togglePlayPause()}
                  disabled={isLoading}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: isPlaying 
                      ? 'linear-gradient(135deg, #69BE28 0%, #4A9A1C 100%)'
                      : 'rgba(105, 190, 40, 0.2)',
                    border: 'none',
                    color: isPlaying ? '#001428' : '#69BE28',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    >
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83" />
                      </svg>
                    </motion.div>
                  ) : isPlaying ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
                
                {/* Expand chevron */}
                <button
                  onClick={expandPlayer}
                  style={{
                    width: '24px',
                    height: '24px',
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <ChevronUpIcon />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }
  
  // Default variant - full floating pill player
  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          className="fixed left-3 right-3 z-40"
          style={positionStyle}
          variants={animationVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={spring}
        >
          {/* Floating glass pill container */}
          <div
            style={{
              background: 'rgba(0, 34, 68, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '14px',
              border: '1px solid rgba(105, 190, 40, 0.3)',
              boxShadow: isPlaying 
                ? '0 4px 24px rgba(0, 0, 0, 0.5), 0 0 24px rgba(105, 190, 40, 0.2)'
                : '0 4px 24px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 14px',
                gap: '12px',
              }}
            >
              {/* Artist Image - Compact */}
              <motion.div
                animate={isPlaying ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                transition={isPlaying ? { repeat: Infinity, duration: 2, ease: 'easeInOut' } : {}}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: '#001428',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isPlaying 
                    ? '0 0 16px rgba(105, 190, 40, 0.5)' 
                    : '0 2px 8px rgba(0, 0, 0, 0.3)',
                  border: '2px solid rgba(105, 190, 40, 0.4)',
                }}
              >
                {currentTrack?.coverArt ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentTrack.coverArt}
                    alt={trackTitle}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'contain',
                      padding: '4px',
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: '16px',
                      fontWeight: 900,
                      color: '#69BE28',
                      fontFamily: 'var(--font-oswald), sans-serif',
                    }}
                  >
                    ♪
                  </span>
                )}
              </motion.div>
              
              {/* Track Info - Tappable to expand */}
              <button
                onClick={expandPlayer}
                style={{
                  flex: 1,
                  minWidth: 0,
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}
              >
                <MarqueeText
                  text={displayText}
                  className="text-[13px] font-medium"
                />
              </button>
              
              {/* Play/Pause Button */}
              <button
                onClick={() => controls.togglePlayPause()}
                disabled={isLoading}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: isPlaying 
                    ? 'linear-gradient(135deg, #69BE28 0%, #4A9A1C 100%)'
                    : 'rgba(105, 190, 40, 0.15)',
                  border: isPlaying ? 'none' : '1px solid rgba(105, 190, 40, 0.3)',
                  color: isPlaying ? '#001428' : '#69BE28',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                  boxShadow: isPlaying ? '0 4px 16px rgba(105, 190, 40, 0.4)' : 'none',
                }}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    style={{ width: '16px', height: '16px' }}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                  </motion.div>
                ) : isPlaying ? (
                  <PauseIcon />
                ) : (
                  <PlayIcon />
                )}
              </button>
              
              {/* Expand Button */}
              <button
                onClick={expandPlayer}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                }}
              >
                <ExpandIcon />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default MiniPlayer
