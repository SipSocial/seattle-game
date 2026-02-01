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
// Constants - Following 8-point grid system
// ----------------------------------------------------------------------------

/** Height of the audio bar (8-point grid: 48px) */
export const AUDIO_BAR_HEIGHT = 48

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface MiniPlayerProps {
  /** Position is always bottom - this prop is ignored but kept for backwards compatibility */
  position?: 'top' | 'bottom'
  /** Additional offset from the edge (in pixels) - rarely needed */
  offset?: number
  /** Variant is always slim now - this prop is ignored but kept for backwards compatibility */
  variant?: 'default' | 'slim'
}

// ----------------------------------------------------------------------------
// Animation Configs - Using design system spring
// ----------------------------------------------------------------------------

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }

// ----------------------------------------------------------------------------
// Marquee Component for scrolling text
// ----------------------------------------------------------------------------

function MarqueeText({ text }: { text: string }) {
  const shouldAnimate = text.length > 30
  
  return (
    <div className="overflow-hidden whitespace-nowrap">
      {shouldAnimate ? (
        <motion.div
          className="inline-block"
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: text.length * 0.12,
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
// MiniPlayer Component - Slim full-bleed bar at bottom
// ----------------------------------------------------------------------------

export function MiniPlayer({ offset = 0 }: MiniPlayerProps) {
  const playerView = useSoundtrackStore((state) => state.playerView)
  const currentTrack = useSoundtrackStore((state) => state.currentTrack)
  const isPlaying = useSoundtrackStore((state) => state.isPlaying)
  const isLoading = useSoundtrackStore((state) => state.isLoading)
  const expandPlayer = useSoundtrackStore((state) => state.expandPlayer)
  const isVisible = useIsPlayerVisible()
  const artist = useCurrentArtist()
  const controls = useSoundtrackControls()
  
  const shouldShow = isVisible && playerView === 'mini' && currentTrack
  
  if (!shouldShow) return null
  
  const trackTitle = currentTrack ? getTrackDisplayTitle(currentTrack) : ''
  const artistName = artist?.name || 'Unknown Artist'
  const displayText = `${trackTitle} • ${artistName}`
  
  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          className="fixed left-0 right-0 z-40"
          style={{ 
            bottom: `calc(env(safe-area-inset-bottom, 0px) + ${offset}px)`,
          }}
          initial={{ y: AUDIO_BAR_HEIGHT, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: AUDIO_BAR_HEIGHT, opacity: 0 }}
          transition={spring}
        >
          {/* Full-bleed bar - no rounded corners, edge-to-edge */}
          <div
            style={{
              height: `${AUDIO_BAR_HEIGHT}px`,
              background: 'linear-gradient(180deg, rgba(0, 20, 40, 0.98) 0%, rgba(0, 10, 25, 1) 100%)',
              borderTop: '1px solid rgba(105, 190, 40, 0.25)',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 'max(16px, env(safe-area-inset-left, 16px))',
              paddingRight: 'max(16px, env(safe-area-inset-right, 16px))',
              gap: '12px',
            }}
          >
            {/* Music icon with pulse when playing */}
            <motion.div
              animate={isPlaying ? { 
                scale: [1, 1.15, 1],
                opacity: [0.7, 1, 0.7],
              } : { scale: 1, opacity: 0.5 }}
              transition={isPlaying ? { repeat: Infinity, duration: 1.2, ease: 'easeInOut' } : {}}
              style={{
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#69BE28',
                flexShrink: 0,
              }}
            >
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
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
                fontSize: '12px',
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.75)',
              }}
            >
              <MarqueeText text={displayText} />
            </button>
            
            {/* Play/Pause Button - 32px (8-point grid) */}
            <button
              onClick={() => controls.togglePlayPause()}
              disabled={isLoading}
              style={{
                width: '32px',
                height: '32px',
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
              }}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83" />
                  </svg>
                </motion.div>
              ) : isPlaying ? (
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            
            {/* Expand Button - 24px */}
            <button
              onClick={expandPlayer}
              style={{
                width: '24px',
                height: '24px',
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default MiniPlayer
