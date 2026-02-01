// ============================================================================
// SOUNDTRACK DATA
// Game soundtrack configuration with artists, tracks, and screen assignments
// ============================================================================

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface Artist {
  id: string
  name: string
  image: string           // Artist photo URL
  bio: string             // Short bio
  social?: {
    instagram?: string
    spotify?: string
    soundcloud?: string
    youtube?: string
  }
}

export interface TrackSection {
  type: 'intro' | 'verse' | 'prechorus' | 'hook' | 'drop' | 'bridge' | 'outro'
  startTime: number       // seconds
  endTime: number         // seconds
  energy: number          // 0-1 scale (for matching screen intensity)
  label?: string          // e.g. "I'm Him" hook
}

export interface Track {
  id: string
  title: string
  artistId: string
  src: string             // Audio file path (relative to public/)
  duration: number        // Total duration in seconds
  coverArt?: string       // Album/single artwork URL
  bpm?: number            // For potential beat-sync features
  featuring?: string      // Featured artist(s)
  isInstrumental?: boolean      // True if instrumental version
  parentTrackId?: string        // Links instrumental to parent vocal track
  
  // Song analysis data (populated from external tool or manually)
  analysis?: {
    sections: TrackSection[]
    recommendedStart: number    // Best point to start for instant impact
    loopPoints?: {              // For seamless looping on menu screens
      start: number
      end: number
    }
  }
}

export type ScreenType = 'home' | 'playerSelect' | 'campaign'

export interface SoundtrackConfig {
  artists: Artist[]
  tracks: Track[]
  screenMusic: Record<ScreenType, string[]>  // Screen -> Track IDs
}

// ----------------------------------------------------------------------------
// Artist Data
// ----------------------------------------------------------------------------

export const ARTISTS: Artist[] = [
  {
    id: 'big-enzo',
    name: 'BIG ENZO',
    image: 'https://enzomcfly.com/cdn/shop/files/Enzo_New_Logo-10.png?v=1752205466&width=190',
    bio: '', // Bio to be added
    social: {
      instagram: 'https://instagram.com/enzomcfly',
      youtube: 'https://youtube.com/c/enzomcfly',
      soundcloud: 'https://soundcloud.com/enzomcfly',
    },
  },
  {
    id: 'sauce-walka',
    name: 'Sauce Walka',
    image: 'https://i.scdn.co/image/ab6761610000e5eb8ae7f2aaa9817a704a87ea36',
    bio: '', // Bio to be added
    social: {
      instagram: 'https://instagram.com/saborthedon',
      spotify: 'https://open.spotify.com/artist/0Y3agQaa6g2r0YmHPOO9rh',
      youtube: 'https://youtube.com/@SauceWalka',
    },
  },
  {
    id: 'tha-real-rob',
    name: 'Tha Real Rob',
    image: 'https://i1.sndcdn.com/avatars-000684741987-c5kq9x-t500x500.jpg',
    bio: 'Seattle-born rapper writing music since 4th grade.',
    social: {
      instagram: 'https://instagram.com/realrob100',
    },
  },
]

// ----------------------------------------------------------------------------
// Track Data
// ----------------------------------------------------------------------------

export const TRACKS: Track[] = [
  {
    id: 'im-him',
    title: "I'm Him",
    artistId: 'big-enzo',
    featuring: 'Sauce Walka',
    src: '/audio/music/im-him.mp3',
    duration: 180,  // TODO: Update with actual duration
    coverArt: 'https://enzomcfly.com/cdn/shop/files/Enzo_New_Logo-10.png?v=1752205466&width=400',
    bpm: 140,  // TODO: Update with actual BPM
    analysis: {
      sections: [
        // TODO: Fill in from audio analysis tool
        { type: 'intro', startTime: 0, endTime: 15, energy: 0.5 },
        { type: 'hook', startTime: 15, endTime: 30, energy: 1.0, label: "I'm Him" },
        { type: 'verse', startTime: 30, endTime: 60, energy: 0.7 },
        { type: 'hook', startTime: 60, endTime: 75, energy: 1.0, label: "I'm Him" },
      ],
      recommendedStart: 15,  // Start at hook for immediate impact
      loopPoints: { start: 15, end: 120 },
    },
  },
  {
    id: 'clean-on-ice',
    title: 'Clean on Ice',
    artistId: 'big-enzo',
    src: '/audio/music/clean-on-ice.m4a',
    duration: 180,
    coverArt: 'https://enzomcfly.com/cdn/shop/files/Enzo_New_Logo-10.png?v=1752205466&width=400',
    bpm: 135,
    analysis: {
      sections: [
        { type: 'intro', startTime: 0, endTime: 15, energy: 0.4 },
        { type: 'verse', startTime: 15, endTime: 45, energy: 0.6 },
        { type: 'hook', startTime: 45, endTime: 65, energy: 0.95, label: 'Hype Drop' },
        { type: 'verse', startTime: 65, endTime: 100, energy: 0.7 },
        { type: 'hook', startTime: 100, endTime: 120, energy: 1.0, label: 'Peak Energy' },
      ],
      recommendedStart: 45,  // Start at the hype hook section
      loopPoints: { start: 45, end: 150 },
    },
  },
  {
    id: 'keep-goin-in',
    title: 'Keep Goin In',
    artistId: 'big-enzo',
    src: '/audio/music/keep-goin-in.mp3',
    duration: 209,  // 3:28.70 from FFmpeg
    coverArt: 'https://enzomcfly.com/cdn/shop/files/Enzo_New_Logo-10.png?v=1752205466&width=400',
    bpm: 130,
    analysis: {
      sections: [
        { type: 'intro', startTime: 0, endTime: 12, energy: 0.5 },
        { type: 'verse', startTime: 12, endTime: 45, energy: 0.7 },
        { type: 'hook', startTime: 45, endTime: 60, energy: 0.9 },
      ],
      recommendedStart: 12,  // Skip intro, start at verse
    },
  },
  {
    id: 'keep-goin-in-instrumental',
    title: 'Keep Goin In',
    artistId: 'big-enzo',
    src: '/audio/music/keep-goin-in-instrumental.mp3',
    duration: 209,  // 3:28.70 from FFmpeg
    coverArt: 'https://enzomcfly.com/cdn/shop/files/Enzo_New_Logo-10.png?v=1752205466&width=400',
    bpm: 130,
    isInstrumental: true,
    parentTrackId: 'keep-goin-in',
    analysis: {
      sections: [
        { type: 'intro', startTime: 0, endTime: 12, energy: 0.5 },
        { type: 'verse', startTime: 12, endTime: 45, energy: 0.7 },
        { type: 'hook', startTime: 45, endTime: 60, energy: 0.9 },
      ],
      recommendedStart: 12,  // Skip intro, start at verse
    },
  },
  {
    id: 'land-of-the-12s',
    title: 'Land of the 12s',
    artistId: 'tha-real-rob',
    src: '/audio/music/land-of-the-12s.mp4',
    duration: 180,  // Approximate
    coverArt: 'https://i1.sndcdn.com/avatars-000684741987-c5kq9x-t500x500.jpg',
    bpm: 140,
    analysis: {
      sections: [
        { type: 'intro', startTime: 0, endTime: 10, energy: 0.5 },
        { type: 'hook', startTime: 10, endTime: 35, energy: 0.9, label: 'Seattle Anthem' },
        { type: 'verse', startTime: 35, endTime: 70, energy: 0.75 },
        { type: 'hook', startTime: 70, endTime: 95, energy: 1.0 },
      ],
      recommendedStart: 10,  // Start at the hook for Seattle energy
      loopPoints: { start: 10, end: 150 },
    },
  },
]

// ----------------------------------------------------------------------------
// Screen Music Assignments
// ----------------------------------------------------------------------------

export const SCREEN_MUSIC: Record<ScreenType, string[]> = {
  // Home (Main Menu) - Clean on Ice starting at the hype drop
  home: ['clean-on-ice'],
  
  // Player Select - Instrumental for clean browsing without vocal distraction
  playerSelect: ['keep-goin-in-instrumental'],
  
  // Campaign Map - Seattle anthem by Tha Real Rob
  campaign: ['land-of-the-12s'],
}

// ----------------------------------------------------------------------------
// Full Configuration Export
// ----------------------------------------------------------------------------

export const SOUNDTRACK_CONFIG: SoundtrackConfig = {
  artists: ARTISTS,
  tracks: TRACKS,
  screenMusic: SCREEN_MUSIC,
}

// ----------------------------------------------------------------------------
// Helper Functions
// ----------------------------------------------------------------------------

/**
 * Get a track by ID
 */
export function getTrack(trackId: string): Track | undefined {
  return TRACKS.find(t => t.id === trackId)
}

/**
 * Get an artist by ID
 */
export function getArtist(artistId: string): Artist | undefined {
  return ARTISTS.find(a => a.id === artistId)
}

/**
 * Get the artist for a track
 */
export function getTrackArtist(track: Track): Artist | undefined {
  return getArtist(track.artistId)
}

/**
 * Get tracks for a specific screen
 */
export function getTracksForScreen(screen: ScreenType): Track[] {
  const trackIds = SCREEN_MUSIC[screen] || []
  return trackIds.map(id => getTrack(id)).filter((t): t is Track => t !== undefined)
}

/**
 * Get all tracks by an artist
 */
export function getTracksByArtist(artistId: string): Track[] {
  return TRACKS.filter(t => t.artistId === artistId)
}

/**
 * Format track duration as MM:SS
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Get display string for track (includes featuring artist and instrumental label)
 */
export function getTrackDisplayTitle(track: Track): string {
  let title = track.title
  if (track.featuring) {
    title = `${title} (feat. ${track.featuring})`
  }
  if (track.isInstrumental) {
    title = `${title} (Instrumental)`
  }
  return title
}

/**
 * Get the parent vocal track for an instrumental
 */
export function getParentTrack(track: Track): Track | undefined {
  if (track.parentTrackId) {
    return getTrack(track.parentTrackId)
  }
  return undefined
}
