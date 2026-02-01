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

const ExpandIcon = () => (
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

export function MiniPlayer() {
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
  
  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          className="fixed left-3 right-3 z-40"
          style={{
            top: 'calc(env(safe-area-inset-top, 0px) + 8px)',
          }}
          variants={slideDown}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={spring}
        >
          {/* Floating glass pill container */}
          <div
            style={{
              background: 'rgba(0, 34, 68, 0.75)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '12px',
              border: '1px solid rgba(105, 190, 40, 0.25)',
              boxShadow: isPlaying 
                ? '0 4px 24px rgba(0, 0, 0, 0.4), 0 0 20px rgba(105, 190, 40, 0.15)'
                : '0 4px 24px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                gap: '10px',
              }}
            >
              {/* Artist Image - Compact */}
              <motion.div
                animate={isPlaying ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                transition={isPlaying ? { repeat: Infinity, duration: 2, ease: 'easeInOut' } : {}}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: '#002244',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isPlaying 
                    ? '0 0 12px rgba(105, 190, 40, 0.4)' 
                    : 'none',
                  border: '1px solid rgba(105, 190, 40, 0.3)',
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
                      padding: '3px',
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: '14px',
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
                  className="text-[12px] font-medium"
                />
              </button>
              
              {/* Play/Pause Button - Compact */}
              <button
                onClick={() => controls.togglePlayPause()}
                disabled={isLoading}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(105, 190, 40, 0.15)',
                  border: '1px solid rgba(105, 190, 40, 0.3)',
                  color: '#69BE28',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(105, 190, 40, 0.25)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(105, 190, 40, 0.15)'
                }}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    style={{ width: '14px', height: '14px' }}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                  </motion.div>
                ) : isPlaying ? (
                  <PauseIcon />
                ) : (
                  <PlayIcon />
                )}
              </button>
              
              {/* Expand Button - Compact */}
              <button
                onClick={expandPlayer}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
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
