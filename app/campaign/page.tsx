'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CampaignMapV2 } from '@/components/game/CampaignMapV2'
import { useGameStore } from '@/src/store/gameStore'
import { GENERATED_ASSETS } from '@/src/game/data/campaignAssets'

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
      <CampaignMapV2 
        onSelectStage={handleSelectStage}
        onBack={handleBack}
        mapImageUrl={GENERATED_ASSETS.mapImageUrl}
        airplaneUrl={GENERATED_ASSETS.airplaneUrl}
      />
    </motion.div>
  )
}
