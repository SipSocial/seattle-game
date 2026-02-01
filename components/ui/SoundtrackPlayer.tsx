'use client'

import { useSoundtrackSync } from '@/src/store/soundtrackStore'
import { MiniPlayer, AUDIO_BAR_HEIGHT } from './MiniPlayer'
import { FullPlayer } from './FullPlayer'
import { ArtistProfile } from './ArtistProfile'

// Re-export height for use in pages
export { AUDIO_BAR_HEIGHT }

// ----------------------------------------------------------------------------
// SoundtrackPlayer Component
// Wraps all player views and handles state sync
// The mini player is always at the bottom, full-width, edge-to-edge
// ----------------------------------------------------------------------------

export function SoundtrackPlayer() {
  // Sync SoundtrackManager with Zustand store
  useSoundtrackSync()
  
  return (
    <>
      <MiniPlayer />
      <FullPlayer />
      <ArtistProfile />
    </>
  )
}

export default SoundtrackPlayer
