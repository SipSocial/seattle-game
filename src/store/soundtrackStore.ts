// ============================================================================
// SOUNDTRACK STORE
// Zustand store for soundtrack state and UI
// Syncs with SoundtrackManager and provides React-friendly state access
// ============================================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Track, Artist, ScreenType } from '../game/data/soundtrack'
import { getTrackArtist } from '../game/data/soundtrack'

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export type PlayerView = 'hidden' | 'mini' | 'full' | 'artist'

export interface SoundtrackUIState {
  // Player UI
  playerView: PlayerView
  selectedArtist: Artist | null
  
  // Playback state (synced from SoundtrackManager)
  currentTrack: Track | null
  isPlaying: boolean
  isPaused: boolean
  isLoading: boolean
  currentTime: number
  duration: number
  
  // User preferences (persisted)
  volume: number
  muted: boolean
  musicEnabled: boolean  // Master toggle for soundtrack
}

export interface SoundtrackActions {
  // UI Actions
  setPlayerView: (view: PlayerView) => void
  expandPlayer: () => void
  minimizePlayer: () => void
  closePlayer: () => void
  showArtist: (artist: Artist) => void
  hideArtist: () => void
  
  // Playback state sync (called by SoundtrackManager listener)
  syncPlaybackState: (state: {
    currentTrack: Track | null
    isPlaying: boolean
    isPaused: boolean
    isLoading: boolean
    currentTime: number
    duration: number
  }) => void
  
  // User preferences
  setVolume: (volume: number) => void
  setMuted: (muted: boolean) => void
  toggleMute: () => void
  setMusicEnabled: (enabled: boolean) => void
  toggleMusic: () => void
}

export type SoundtrackStore = SoundtrackUIState & SoundtrackActions

// ----------------------------------------------------------------------------
// Initial State
// ----------------------------------------------------------------------------

const initialState: SoundtrackUIState = {
  playerView: 'hidden',
  selectedArtist: null,
  
  currentTrack: null,
  isPlaying: false,
  isPaused: false,
  isLoading: false,
  currentTime: 0,
  duration: 0,
  
  volume: 0.7,
  muted: false,
  musicEnabled: true,
}

// ----------------------------------------------------------------------------
// Store
// ----------------------------------------------------------------------------

export const useSoundtrackStore = create<SoundtrackStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // ----------------------------------------------------------------------
      // UI Actions
      // ----------------------------------------------------------------------
      
      setPlayerView: (view) => set({ playerView: view }),
      
      expandPlayer: () => set({ playerView: 'full' }),
      
      minimizePlayer: () => set({ playerView: 'mini', selectedArtist: null }),
      
      closePlayer: () => set({ playerView: 'hidden', selectedArtist: null }),
      
      showArtist: (artist) => set({ 
        playerView: 'artist', 
        selectedArtist: artist 
      }),
      
      hideArtist: () => set({ 
        playerView: 'full', 
        selectedArtist: null 
      }),
      
      // ----------------------------------------------------------------------
      // Playback State Sync
      // ----------------------------------------------------------------------
      
      syncPlaybackState: (state) => {
        const { playerView, musicEnabled } = get()
        
        set({
          currentTrack: state.currentTrack,
          isPlaying: state.isPlaying,
          isPaused: state.isPaused,
          isLoading: state.isLoading,
          currentTime: state.currentTime,
          duration: state.duration,
          // Auto-show mini player when track starts playing
          playerView: state.currentTrack && musicEnabled && playerView === 'hidden' 
            ? 'mini' 
            : playerView,
        })
      },
      
      // ----------------------------------------------------------------------
      // User Preferences
      // ----------------------------------------------------------------------
      
      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
      
      setMuted: (muted) => set({ muted }),
      
      toggleMute: () => set((state) => ({ muted: !state.muted })),
      
      setMusicEnabled: (enabled) => set({ 
        musicEnabled: enabled,
        // Hide player if music is disabled
        playerView: enabled ? get().playerView : 'hidden',
      }),
      
      toggleMusic: () => {
        const { musicEnabled } = get()
        get().setMusicEnabled(!musicEnabled)
      },
    }),
    {
      name: 'dark-side-soundtrack',
      // Only persist user preferences
      partialize: (state) => ({
        volume: state.volume,
        muted: state.muted,
        musicEnabled: state.musicEnabled,
      }),
    }
  )
)

// ----------------------------------------------------------------------------
// Selectors (for common derived state)
// ----------------------------------------------------------------------------

/**
 * Get the current track's artist
 */
export function useCurrentArtist(): Artist | undefined {
  const currentTrack = useSoundtrackStore((state) => state.currentTrack)
  return currentTrack ? getTrackArtist(currentTrack) : undefined
}

/**
 * Check if the player should be visible
 */
export function useIsPlayerVisible(): boolean {
  return useSoundtrackStore((state) => 
    state.playerView !== 'hidden' && state.musicEnabled
  )
}

/**
 * Get playback progress as percentage (0-1)
 */
export function usePlaybackProgress(): number {
  const currentTime = useSoundtrackStore((state) => state.currentTime)
  const duration = useSoundtrackStore((state) => state.duration)
  return duration > 0 ? currentTime / duration : 0
}

// ----------------------------------------------------------------------------
// Hook for syncing with SoundtrackManager
// ----------------------------------------------------------------------------

import { useEffect } from 'react'
import { SoundtrackManager, type SoundtrackState } from '../game/systems/SoundtrackManager'

/**
 * Hook to sync SoundtrackManager state with Zustand store
 * Call this once at app root level
 */
export function useSoundtrackSync(): void {
  const syncPlaybackState = useSoundtrackStore((state) => state.syncPlaybackState)
  const volume = useSoundtrackStore((state) => state.volume)
  const muted = useSoundtrackStore((state) => state.muted)
  const musicEnabled = useSoundtrackStore((state) => state.musicEnabled)
  
  // Initialize SoundtrackManager
  useEffect(() => {
    SoundtrackManager.init()
  }, [])
  
  // Subscribe to SoundtrackManager state changes
  useEffect(() => {
    const unsubscribe = SoundtrackManager.subscribe((state: SoundtrackState) => {
      syncPlaybackState({
        currentTrack: state.currentTrack,
        // Consider both 'playing' and 'warming' as playing for UI purposes
        isPlaying: state.playbackState === 'playing' || state.playbackState === 'warming',
        isPaused: state.playbackState === 'paused',
        isLoading: state.playbackState === 'loading',
        currentTime: state.currentTime,
        duration: state.duration,
      })
    })
    
    return unsubscribe
  }, [syncPlaybackState])
  
  // Sync volume changes to SoundtrackManager
  useEffect(() => {
    SoundtrackManager.setVolume(volume)
  }, [volume])
  
  // Sync mute state to SoundtrackManager
  useEffect(() => {
    SoundtrackManager.setMuted(muted || !musicEnabled)
  }, [muted, musicEnabled])
}

// ----------------------------------------------------------------------------
// Convenience hooks for playback control
// ----------------------------------------------------------------------------

/**
 * Hook for playback controls
 */
export function useSoundtrackControls() {
  return {
    play: (trackId: string) => SoundtrackManager.play(trackId),
    playForScreen: (screen: ScreenType) => SoundtrackManager.playForScreen(screen),
    pause: () => SoundtrackManager.pause(),
    resume: () => SoundtrackManager.resume(),
    togglePlayPause: () => SoundtrackManager.togglePlayPause(),
    stop: () => SoundtrackManager.stop(),
    stopWithWhistle: () => SoundtrackManager.stopWithWhistle(),
    seek: (time: number) => SoundtrackManager.seek(time),
    seekPercent: (percent: number) => SoundtrackManager.seekPercent(percent),
  }
}
