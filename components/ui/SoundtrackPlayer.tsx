'use client'

import { useSoundtrackSync } from '@/src/store/soundtrackStore'
import { MiniPlayer, type MiniPlayerProps } from './MiniPlayer'
import { FullPlayer } from './FullPlayer'
import { ArtistProfile } from './ArtistProfile'

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface SoundtrackPlayerProps {
  /** Position of the mini player - 'top' or 'bottom' */
  position?: MiniPlayerProps['position']
  /** Additional offset from the edge (in pixels) */
  offset?: MiniPlayerProps['offset']
}

// ----------------------------------------------------------------------------
// SoundtrackPlayer Component
// Wraps all player views and handles state sync
// Add this once at the app root level
// ----------------------------------------------------------------------------

export function SoundtrackPlayer({ position = 'bottom', offset = 0 }: SoundtrackPlayerProps) {
  // Sync SoundtrackManager with Zustand store
  useSoundtrackSync()
  
  return (
    <>
      <MiniPlayer position={position} offset={offset} />
      <FullPlayer />
      <ArtistProfile />
    </>
  )
}

export default SoundtrackPlayer
