'use client'

/**
 * Week Preview Page - Simple redirect to game
 * 
 * For now, just redirects to the defense game for the selected week.
 * TODO: Add full preview screen with opponent details
 */

import { useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { getStageById, CAMPAIGN_STAGES } from '@/src/v5/store/v5GameStore'

interface PageProps {
  params: Promise<{ weekId: string }>
}

export default function WeekPreviewPage({ params }: PageProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const weekId = parseInt(resolvedParams.weekId, 10)
  
  // Get week data
  const week = getStageById(weekId)
  
  useEffect(() => {
    // Redirect to the defense game with this week
    if (week) {
      router.replace(`/v5/game/defense?weekId=${week.id}`)
    } else {
      router.replace('/v5/game/map')
    }
  }, [week, router])

  return (
    <div className="fixed inset-0 bg-[#002244] flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="text-white/70 text-lg font-medium"
      >
        {week ? `Loading ${week.name}...` : 'Redirecting...'}
      </motion.div>
    </div>
  )
}
