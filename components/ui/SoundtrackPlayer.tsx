'use client'

import { useEffect } from 'react'
import { useSoundtrackSync } from '@/src/store/soundtrackStore'
import { MiniPlayer } from './MiniPlayer'
import { FullPlayer } from './FullPlayer'
import { ArtistProfile } from './ArtistProfile'

// ----------------------------------------------------------------------------
// SoundtrackPlayer Component
// Wraps all player views and handles state sync
// Add this once at the app root level
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
