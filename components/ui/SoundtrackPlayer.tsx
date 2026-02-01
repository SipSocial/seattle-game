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
  /** Variant style - 'default' is full player, 'slim' is thin text bar */
  variant?: MiniPlayerProps['variant']
}

// ----------------------------------------------------------------------------
// SoundtrackPlayer Component
// Wraps all player views and handles state sync
// Add this once at the app root level
// ----------------------------------------------------------------------------

export function SoundtrackPlayer({ position = 'bottom', offset = 0, variant = 'default' }: SoundtrackPlayerProps) {
  // Sync SoundtrackManager with Zustand store
  useSoundtrackSync()
  
  return (
    <>
      <MiniPlayer position={position} offset={offset} variant={variant} />
      <FullPlayer />
      <ArtistProfile />
    </>
  )
}

export default SoundtrackPlayer
