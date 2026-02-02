'use client'

import { motion } from 'framer-motion'
import { useV3Leaderboard, useV3User } from '@/src/v3/store/v3GameStore'

interface LeaderboardTableProps {
  maxEntries?: number
  showRank?: boolean
  highlightCurrentUser?: boolean
}

export function LeaderboardTable({
  maxEntries = 10,
  showRank = true,
  highlightCurrentUser = true,
}: LeaderboardTableProps) {
  const scores = useV3Leaderboard()
  const user = useV3User()
  
  const displayScores = scores.slice(0, maxEntries)
  
  if (displayScores.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/40 text-sm">No scores yet</p>
        <p className="text-white/60 text-xs mt-2">Be the first to play!</p>
      </div>
    )
  }
  
  return (
    <div className="w-full">
      {/* Header */}
      <div 
        className="grid gap-2 px-4 py-2 text-xs uppercase tracking-wider"
        style={{ 
          gridTemplateColumns: showRank ? '40px 1fr 80px 60px' : '1fr 80px 60px',
          color: 'var(--seahawks-grey)',
        }}
      >
        {showRank && <span>Rank</span>}
        <span>Player</span>
        <span className="text-right">Score</span>
        <span className="text-right">Wins</span>
      </div>
      
      {/* Entries */}
      <div className="space-y-2">
        {displayScores.map((score, index) => {
          const isCurrentUser = highlightCurrentUser && user.email === score.email
          const rank = index + 1
          
          return (
            <motion.div
              key={`${score.email}-${score.timestamp}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="grid gap-2 px-4 py-3 rounded-xl transition-all"
              style={{ 
                gridTemplateColumns: showRank ? '40px 1fr 80px 60px' : '1fr 80px 60px',
                background: isCurrentUser 
                  ? 'linear-gradient(135deg, rgba(105,190,40,0.2) 0%, rgba(105,190,40,0.1) 100%)'
                  : 'rgba(255,255,255,0.05)',
                border: isCurrentUser 
                  ? '1px solid rgba(105,190,40,0.3)'
                  : '1px solid transparent',
              }}
            >
              {showRank && (
                <span 
                  className="font-bold"
                  style={{ 
                    fontFamily: 'var(--font-oswald)',
                    color: rank <= 3 ? 'var(--seahawks-green)' : 'var(--seahawks-grey)',
                  }}
                >
                  {rank <= 3 ? (
                    <span className="flex items-center justify-center w-6 h-6 rounded-full text-xs"
                      style={{
                        background: rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32',
                        color: '#000',
                      }}
                    >
                      {rank}
                    </span>
                  ) : (
                    `#${rank}`
                  )}
                </span>
              )}
              
              <div className="flex items-center gap-2 min-w-0">
                <span 
                  className="truncate font-medium"
                  style={{ color: isCurrentUser ? 'var(--seahawks-green)' : 'white' }}
                >
                  {score.username}
                </span>
                {isCurrentUser && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--seahawks-green)', color: 'white' }}>
                    You
                  </span>
                )}
              </div>
              
              <span 
                className="text-right font-bold tabular-nums"
                style={{ 
                  fontFamily: 'var(--font-oswald)',
                  color: 'white',
                }}
              >
                {score.totalScore.toLocaleString()}
              </span>
              
              <span 
                className="text-right tabular-nums"
                style={{ color: 'var(--seahawks-grey)' }}
              >
                {score.gamesWon}
              </span>
            </motion.div>
          )
        })}
      </div>
      
      {/* Current user not in top */}
      {highlightCurrentUser && user.email && !displayScores.some(s => s.email === user.email) && (
        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <p className="text-center text-white/40 text-xs mb-2">Your best</p>
          {/* Would show user's score if we had it */}
        </div>
      )}
    </div>
  )
}
