'use client'

/**
 * V5 Defense Player Selection Page
 * 
 * Wrapper around the existing PlayerSelect component.
 * Shows the 3D carousel for defense player selection.
 * On select, navigates to the defense game with the player param.
 */

import { Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PlayerSelect from '@/app/play/components/PlayerSelect'
import { LoadingSpinner } from '@/components/ui'

function DefenseSelectContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const weekId = searchParams.get('weekId') || '1'
  
  const handlePlayerSelect = useCallback((jerseyNumber: number) => {
    // Navigate to defense game with player param
    router.push(`/v5/game/defense?weekId=${weekId}&player=${jerseyNumber}`)
  }, [router, weekId])
  
  return (
    <PlayerSelect 
      gameMode="defense" 
      onSelect={handlePlayerSelect} 
    />
  )
}

export default function DefenseSelectPage() {
  return (
    <Suspense fallback={
      <div 
        className="fixed inset-0 flex items-center justify-center" 
        style={{ background: '#002244' }}
      >
        <LoadingSpinner size="xl" text="Loading players..." />
      </div>
    }>
      <DefenseSelectContent />
    </Suspense>
  )
}
