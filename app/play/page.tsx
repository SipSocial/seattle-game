'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Dynamically import the game component with no SSR
const GameCanvas = dynamic(() => import('./components/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#1a472a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#7ED957] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#7ED957] text-xl font-bold">Loading Game...</p>
      </div>
    </div>
  ),
})

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#1a472a] flex items-center justify-center">
          <p className="text-white">Loading...</p>
        </div>
      }
    >
      <GameCanvas />
    </Suspense>
  )
}
