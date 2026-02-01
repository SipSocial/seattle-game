'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  useSoundtrackStore, 
  useSoundtrackControls,
} from '@/src/store/soundtrackStore'
import { 
  getTracksByArtist, 
  formatDuration,
  type Track,
} from '@/src/game/data/soundtrack'

// ----------------------------------------------------------------------------
// Icons
// ----------------------------------------------------------------------------

const BackIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
)

const InstagramIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

const SpotifyIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
)

const SoundCloudIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c-.009-.06-.052-.1-.084-.1zm-.899 1.019c-.058 0-.102.053-.108.11l-.2 1.125.2 1.085c.006.058.05.102.108.102.051 0 .094-.044.108-.102l.232-1.085-.232-1.125c-.014-.057-.057-.11-.108-.11zm1.818-1.406c-.064 0-.115.058-.125.119l-.203 2.537.203 2.445c.01.063.061.12.125.12.064 0 .115-.057.125-.12l.234-2.445-.234-2.537c-.01-.061-.061-.119-.125-.119zm.925-.437c-.074 0-.133.068-.142.137l-.19 2.973.19 2.868c.009.07.068.13.142.13.074 0 .133-.06.143-.13l.218-2.868-.218-2.973c-.01-.07-.069-.137-.143-.137zm.929-.174c-.082 0-.149.074-.159.152l-.176 3.146.176 2.992c.01.078.077.144.159.144.083 0 .149-.066.159-.144l.202-2.992-.202-3.146c-.01-.078-.076-.152-.159-.152zm.93-.057c-.091 0-.166.082-.175.168l-.163 3.203.163 3.068c.009.086.084.16.175.16.091 0 .166-.074.175-.16l.186-3.068-.186-3.203c-.009-.086-.084-.168-.175-.168zm2.787 3.231l-.144-3.549c-.007-.096-.089-.176-.191-.176-.098 0-.181.08-.19.176l-.131 3.549.131 3.015c.009.098.092.17.19.17.102 0 .184-.072.191-.17l.144-3.015zm-.926-.059l-.156-3.49c-.008-.1-.092-.183-.199-.183-.104 0-.188.083-.197.183l-.142 3.49.142 3.071c.009.1.093.175.197.175.107 0 .191-.075.199-.175l.156-3.071zm1.851.118l-.127-4.013c-.008-.106-.101-.193-.212-.193-.114 0-.206.087-.214.193l-.115 4.013.115 2.961c.008.108.1.187.214.187.111 0 .204-.079.212-.187l.127-2.961zm.926-.011l-.114-4.005c-.009-.114-.109-.207-.223-.207-.119 0-.218.093-.227.207l-.103 4.005.103 2.951c.009.115.108.2.227.2.114 0 .214-.085.223-.2l.114-2.951zm1.854.005l-.101-4.054c-.009-.12-.117-.218-.237-.218-.123 0-.229.098-.238.218l-.091 4.054.091 2.946c.009.121.115.211.238.211.12 0 .228-.09.237-.211l.101-2.946zm.925-.007l-.087-4.085c-.01-.125-.125-.228-.249-.228-.127 0-.24.103-.249.228l-.079 4.085.079 2.94c.009.125.122.22.249.22.124 0 .239-.095.249-.22l.087-2.94zm2.776.007l-.062-4.104c-.011-.131-.133-.238-.26-.238-.129 0-.25.107-.261.238l-.056 4.104.056 2.934c.011.131.132.23.261.23.127 0 .249-.099.26-.23l.062-2.934zm-.924-.011l-.074-4.093c-.01-.129-.127-.232-.254-.232-.129 0-.248.103-.258.232l-.067 4.093.067 2.936c.01.129.129.224.258.224.127 0 .244-.095.254-.224l.074-2.936zm4.563-.303c0-2.644-2.145-4.787-4.792-4.787-.736 0-1.433.167-2.055.463-.234.109-.296.22-.299.435v9.406c.003.211.166.386.376.403h6.77c1.755 0 3.18-1.424 3.18-3.181 0-1.259-.739-2.346-1.804-2.852-.271-.127-.543.041-.543.337l-.001.002c0 .159.088.305.227.378.779.408 1.31 1.224 1.31 2.163 0 1.347-1.094 2.441-2.442 2.441h-6.139V8.203c.547-.219 1.136-.341 1.755-.341 2.117 0 3.849 1.609 4.059 3.669.02.186.156.341.343.367.107.016.217.024.326.024.898 0 1.725.351 2.343.921.621.575.999 1.376.999 2.269 0 1.714-1.391 3.105-3.107 3.105h-.024v.001z"/>
  </svg>
)

const YouTubeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)

const PlayIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
)

const NowPlayingIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
  </svg>
)

// ----------------------------------------------------------------------------
// Animation Configs
// ----------------------------------------------------------------------------

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }

const slideRight = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '100%', opacity: 0 },
}

// ----------------------------------------------------------------------------
// Track List Item
// ----------------------------------------------------------------------------

function TrackListItem({ 
  track, 
  isCurrentTrack,
  onPlay,
}: { 
  track: Track
  isCurrentTrack: boolean
  onPlay: () => void
}) {
  return (
    <button
      onClick={onPlay}
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        padding: '12px 16px',
        background: isCurrentTrack ? 'rgba(105, 190, 40, 0.1)' : 'transparent',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        textAlign: 'left',
        gap: '12px',
        transition: 'background 0.2s ease',
      }}
      onMouseEnter={(e) => {
        if (!isCurrentTrack) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isCurrentTrack) {
          e.currentTarget.style.background = 'transparent'
        }
      }}
    >
      {/* Play/Now Playing Icon */}
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: isCurrentTrack 
            ? 'linear-gradient(135deg, #69BE28 0%, #4A9A1C 100%)' 
            : 'rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isCurrentTrack ? '#002244' : 'rgba(255, 255, 255, 0.6)',
          flexShrink: 0,
        }}
      >
        {isCurrentTrack ? <NowPlayingIcon /> : <PlayIcon />}
      </div>
      
      {/* Track Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: isCurrentTrack ? '#69BE28' : 'rgba(255, 255, 255, 0.9)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {track.title}
        </div>
        {track.featuring && (
          <div
            style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.5)',
              marginTop: '2px',
            }}
          >
            feat. {track.featuring}
          </div>
        )}
      </div>
      
      {/* Duration */}
      <span
        style={{
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.4)',
          fontFamily: 'var(--font-oswald), sans-serif',
          flexShrink: 0,
        }}
      >
        {formatDuration(track.duration)}
      </span>
    </button>
  )
}

// ----------------------------------------------------------------------------
// Social Link Button
// ----------------------------------------------------------------------------

function SocialLink({ 
  href, 
  icon, 
  label,
}: { 
  href: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 16px',
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        color: 'rgba(255, 255, 255, 0.8)',
        textDecoration: 'none',
        fontSize: '13px',
        fontWeight: 500,
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
      }}
    >
      {icon}
      {label}
    </a>
  )
}

// ----------------------------------------------------------------------------
// ArtistProfile Component
// ----------------------------------------------------------------------------

export function ArtistProfile() {
  const playerView = useSoundtrackStore((state) => state.playerView)
  const selectedArtist = useSoundtrackStore((state) => state.selectedArtist)
  const currentTrack = useSoundtrackStore((state) => state.currentTrack)
  const hideArtist = useSoundtrackStore((state) => state.hideArtist)
  const controls = useSoundtrackControls()
  
  const shouldShow = playerView === 'artist' && selectedArtist
  
  if (!shouldShow) return null
  
  const artistTracks = selectedArtist ? getTracksByArtist(selectedArtist.id) : []
  const social = selectedArtist?.social
  
  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col overflow-hidden"
          variants={slideRight}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={spring}
        >
          {/* Background */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, #001428 0%, #000810 100%)',
            }}
          />
          
          {/* Artist image blur background */}
          {selectedArtist?.image && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '50%',
                background: `url(${selectedArtist.image}) center/cover`,
                filter: 'blur(60px)',
                opacity: 0.2,
              }}
            />
          )}
          
          {/* Content */}
          <div
            className="relative z-10 h-full flex flex-col overflow-y-auto"
            style={{
              paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
              paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 24px',
                marginBottom: '24px',
              }}
            >
              <button
                onClick={hideArtist}
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
                <BackIcon />
              </button>
              
              <span
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'rgba(255, 255, 255, 0.5)',
                }}
              >
                Artist
              </span>
              
              <div style={{ width: '40px' }} />
            </div>
            
            {/* Artist Photo */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '24px',
                padding: '0 24px',
                position: 'relative',
              }}
            >
              {/* Glow effect */}
              <motion.div
                animate={{ 
                  scale: [1, 1.15, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 4, 
                  ease: 'easeInOut' 
                }}
                style={{
                  position: 'absolute',
                  width: '220px',
                  height: '220px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(105, 190, 40, 0.5) 0%, transparent 70%)',
                  filter: 'blur(30px)',
                }}
              />
              
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ ...spring, delay: 0.1 }}
                style={{
                  width: '180px',
                  height: '180px',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5), 0 0 80px rgba(105, 190, 40, 0.2)',
                  background: '#002244',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '3px solid rgba(105, 190, 40, 0.3)',
                  position: 'relative',
                }}
              >
                {selectedArtist?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedArtist.image}
                    alt={selectedArtist.name}
                    style={{ 
                      width: '80%', 
                      height: '80%', 
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: '64px',
                      fontWeight: 900,
                      color: '#69BE28',
                      fontFamily: 'var(--font-oswald), sans-serif',
                    }}
                  >
                    {selectedArtist?.name.charAt(0) || '?'}
                  </span>
                )}
              </motion.div>
            </div>
            
            {/* Artist Name */}
            <h1
              style={{
                fontSize: '32px',
                fontWeight: 900,
                color: 'rgba(255, 255, 255, 0.95)',
                fontFamily: 'var(--font-oswald), sans-serif',
                textAlign: 'center',
                marginBottom: '12px',
                padding: '0 24px',
              }}
            >
              {selectedArtist?.name}
            </h1>
            
            {/* Bio */}
            <p
              style={{
                fontSize: '14px',
                lineHeight: 1.6,
                color: 'rgba(255, 255, 255, 0.6)',
                textAlign: 'center',
                padding: '0 32px',
                marginBottom: '24px',
              }}
            >
              {selectedArtist?.bio}
            </p>
            
            {/* Social Links */}
            {social && Object.keys(social).length > 0 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  padding: '0 24px',
                  marginBottom: '32px',
                }}
              >
                {social.instagram && (
                  <SocialLink href={social.instagram} icon={<InstagramIcon />} label="Instagram" />
                )}
                {social.spotify && (
                  <SocialLink href={social.spotify} icon={<SpotifyIcon />} label="Spotify" />
                )}
                {social.soundcloud && (
                  <SocialLink href={social.soundcloud} icon={<SoundCloudIcon />} label="SoundCloud" />
                )}
                {social.youtube && (
                  <SocialLink href={social.youtube} icon={<YouTubeIcon />} label="YouTube" />
                )}
              </div>
            )}
            
            {/* Tracks Section */}
            <div style={{ padding: '0 16px' }}>
              <h2
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'rgba(255, 255, 255, 0.4)',
                  marginBottom: '16px',
                  paddingLeft: '8px',
                }}
              >
                Tracks
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {artistTracks.map((track) => (
                  <TrackListItem
                    key={track.id}
                    track={track}
                    isCurrentTrack={currentTrack?.id === track.id}
                    onPlay={() => controls.play(track.id)}
                  />
                ))}
              </div>
              
              {artistTracks.length === 0 && (
                <p
                  style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.4)',
                    textAlign: 'center',
                    padding: '24px',
                  }}
                >
                  No tracks available
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ArtistProfile
