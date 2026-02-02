'use client'

/**
 * V4 Defense Game Page
 * 
 * The blockbuster horde-style defense game where you control a defender
 * and tackle waves of runners. Premium mobile-first design.
 */

import { Suspense, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { LoadingSpinner } from '@/components/ui'

// Dynamic import for Phaser game - no SSR
const GameCanvas = dynamic(
  () => import('../../play/components/GameCanvas'),
  { 
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'var(--seahawks-navy-dark, #002244)' }}>
        <LoadingSpinner size="xl" text="Loading Defense Mode..." />
      </div>
    ),
  }
)

export default function DefenseGamePage() {
  // Set play mode on mount
  useEffect(() => {
    // Import store dynamically to avoid SSR issues
    import('@/src/store/gameStore').then(({ useGameStore }) => {
      useGameStore.getState().setPlayMode('defense')
    })
  }, [])

  return (
    <motion.div
      className="fixed inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ background: 'var(--seahawks-navy-dark, #002244)' }}
    >
      <Suspense fallback={
        <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'var(--seahawks-navy-dark, #002244)' }}>
          <LoadingSpinner size="xl" text="Loading Defense Mode..." />
        </div>
      }>
        <GameCanvas />
      </Suspense>
    </motion.div>
  )
}
