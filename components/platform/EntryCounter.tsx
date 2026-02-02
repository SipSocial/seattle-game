'use client'

import { motion } from 'framer-motion'
import { useV3Entries } from '@/src/v3/store/v3GameStore'

interface EntryCounterProps {
  showBreakdown?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function EntryCounter({
  showBreakdown = false,
  size = 'md',
}: EntryCounterProps) {
  const entries = useV3Entries()
  
  const emailEntries = entries.filter(e => e.type === 'email').length
  const playEntries = entries.filter(e => e.type === 'play').length
  const shareEntries = entries.filter(e => e.type === 'share').length
  const totalEntries = entries.length
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }
  
  const numberSizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  }
  
  return (
    <div className={`text-center ${sizeClasses[size]}`}>
      <motion.div
        key={totalEntries}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`font-black ${numberSizeClasses[size]}`}
        style={{ 
          fontFamily: 'var(--font-oswald)',
          color: 'var(--seahawks-green)',
        }}
      >
        {totalEntries}
      </motion.div>
      
      <p className="text-white/60 uppercase tracking-wider" style={{ fontSize: 'var(--text-caption)' }}>
        {totalEntries === 1 ? 'Entry' : 'Entries'} Earned
      </p>
      
      {showBreakdown && totalEntries > 0 && (
        <div className="flex justify-center gap-4 mt-4 text-xs">
          {emailEntries > 0 && (
            <div className="flex items-center gap-1 text-white/40">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{emailEntries}</span>
            </div>
          )}
          
          {playEntries > 0 && (
            <div className="flex items-center gap-1 text-white/40">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{playEntries}</span>
            </div>
          )}
          
          {shareEntries > 0 && (
            <div className="flex items-center gap-1 text-white/40">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>{shareEntries}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
