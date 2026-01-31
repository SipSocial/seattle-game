'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CampaignMap } from '@/components/game/CampaignMap'
import { useGameStore } from '@/src/store/gameStore'

export default function CampaignPage() {
  const router = useRouter()
  const setGameMode = useGameStore((s) => s.setGameMode)
  const [mounted, setMounted] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSelectStage = useCallback((stageId: number) => {
    setIsExiting(true)
    // Set campaign mode and navigate to play
    setGameMode('campaign')
    setTimeout(() => {
      router.push('/play')
    }, 200)
  }, [setGameMode, router])

  const handleBack = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => {
      router.push('/')
    }, 200)
  }, [router])

  return (
    <motion.div
      className="fixed inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: mounted && !isExiting ? 1 : 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <CampaignMap 
        onSelectStage={handleSelectStage}
        onBack={handleBack}
      />
    </motion.div>
  )
}
