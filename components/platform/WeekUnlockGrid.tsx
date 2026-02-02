'use client'

import { motion } from 'framer-motion'
import { useV3GameStore, useV3Campaign } from '@/src/v3/store/v3GameStore'
import { CAMPAIGN_STAGES } from '@/src/game/data/campaign'

interface WeekUnlockGridProps {
  onSelectWeek?: (week: number) => void
}

export function WeekUnlockGrid({ onSelectWeek }: WeekUnlockGridProps) {
  const { isWeekUnlocked, dailyUnlocks } = useV3GameStore()
  const campaign = useV3Campaign()
  
  // 18 weeks total: 17 regular + Super Bowl
  const weeks = Array.from({ length: 18 }, (_, i) => i + 1)
  
  const getWeekStatus = (week: number): 'locked' | 'available' | 'completed' | 'current' => {
    if (campaign.weeksCompleted.includes(week)) return 'completed'
    if (week === campaign.currentWeek) return 'current'
    if (isWeekUnlocked(week)) return 'available'
    return 'locked'
  }
  
  const getWeekLabel = (week: number): string => {
    if (week === 18) return 'SB'
    return `W${week}`
  }
  
  const getOpponentName = (week: number): string => {
    // Map week to opponent (simplified)
    const opponents: Record<number, string> = {
      1: '49ers', 2: 'Steelers', 3: 'Saints', 4: 'Cardinals',
      5: 'Buccaneers', 6: 'Jaguars', 7: 'Texans', 8: 'Commanders',
      9: 'Cardinals', 10: 'Rams', 11: 'Titans', 12: 'Vikings',
      13: 'Falcons', 14: 'Colts', 15: 'Rams', 16: 'Panthers',
      17: '49ers', 18: 'Patriots',
    }
    return opponents[week] || 'TBD'
  }
  
  return (
    <div className="w-full">
      <div className="grid grid-cols-6 gap-2">
        {weeks.map((week) => {
          const status = getWeekStatus(week)
          const isClickable = status === 'available' || status === 'current'
          
          return (
            <motion.button
              key={week}
              onClick={() => isClickable && onSelectWeek?.(week)}
              disabled={!isClickable}
              whileHover={isClickable ? { scale: 1.05 } : undefined}
              whileTap={isClickable ? { scale: 0.95 } : undefined}
              className={`
                relative aspect-square rounded-lg flex flex-col items-center justify-center
                transition-all
                ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
              `}
              style={{
                background: status === 'completed' 
                  ? 'linear-gradient(135deg, rgba(105,190,40,0.3) 0%, rgba(105,190,40,0.1) 100%)'
                  : status === 'current'
                  ? 'linear-gradient(135deg, rgba(105,190,40,0.5) 0%, rgba(105,190,40,0.3) 100%)'
                  : status === 'available'
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(255,255,255,0.02)',
                border: status === 'current' 
                  ? '2px solid var(--seahawks-green)'
                  : status === 'completed'
                  ? '1px solid rgba(105,190,40,0.3)'
                  : '1px solid rgba(255,255,255,0.1)',
                opacity: status === 'locked' ? 0.4 : 1,
              }}
            >
              {/* Week number */}
              <span 
                className="font-bold text-sm"
                style={{ 
                  fontFamily: 'var(--font-oswald)',
                  color: status === 'locked' ? 'var(--seahawks-grey)' : 'white',
                }}
              >
                {getWeekLabel(week)}
              </span>
              
              {/* Status icon */}
              {status === 'completed' && (
                <svg className="absolute top-1 right-1 w-3 h-3" fill="var(--seahawks-green)" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              
              {status === 'locked' && (
                <svg className="absolute top-1 right-1 w-3 h-3 text-white/30" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              )}
            </motion.button>
          )
        })}
      </div>
      
      {/* Legend */}
      <div className="flex justify-center gap-4 mt-4 text-xs text-white/40">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ background: 'var(--seahawks-green)' }} />
          <span>Current</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ background: 'rgba(105,190,40,0.3)' }} />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded opacity-40" style={{ background: 'rgba(255,255,255,0.05)' }} />
          <span>Locked</span>
        </div>
      </div>
      
      {/* Next unlock info */}
      <p className="text-center text-white/40 text-xs mt-4">
        {dailyUnlocks.unlockedWeeks.length < 18 
          ? `${18 - dailyUnlocks.unlockedWeeks.length} more games unlock tomorrow`
          : 'All games unlocked!'}
      </p>
    </div>
  )
}
