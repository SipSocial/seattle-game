'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { GhostButton } from '@/components/ui/GhostButton'
import { useGameStore, LeaderboardEntry } from '@/src/store/gameStore'

interface LeaderboardProps {
  isOpen: boolean
  onClose: () => void
}

export function Leaderboard({ isOpen, onClose }: LeaderboardProps) {
  const leaderboard = useGameStore((s) => s.leaderboard)
  const playerName = useGameStore((s) => s.playerName)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Content */}
          <motion.div
            className="relative z-10 w-full max-w-md px-4 max-h-[80vh]"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <GlassCard padding="lg">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-wide">
                    Leaderboard
                  </h2>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">
                    Top 10 Defenders
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10"
                >
                  <span className="text-white/60">✕</span>
                </button>
              </div>

              {/* Leaderboard List */}
              {leaderboard.length > 0 ? (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {leaderboard.map((entry, index) => (
                    <LeaderboardRow
                      key={entry.id}
                      entry={entry}
                      rank={index + 1}
                      isCurrentPlayer={entry.playerName === playerName}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🏈</div>
                  <p className="text-white/50 text-sm">
                    No scores yet. Be the first!
                  </p>
                </div>
              )}

              {/* Close Button */}
              <div className="mt-6">
                <GhostButton fullWidth onClick={onClose}>
                  Close
                </GhostButton>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================================================
// LEADERBOARD ROW
// ============================================================================

interface LeaderboardRowProps {
  entry: LeaderboardEntry
  rank: number
  isCurrentPlayer: boolean
}

function LeaderboardRow({ entry, rank, isCurrentPlayer }: LeaderboardRowProps) {
  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return null
    }
  }

  const rankEmoji = getRankEmoji(rank)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl
        ${isCurrentPlayer ? 'ring-2 ring-[#69BE28]/50' : ''}
      `}
      style={{
        background: isCurrentPlayer 
          ? 'rgba(105, 190, 40, 0.15)'
          : 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Rank */}
      <div 
        className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
        style={{
          background: rank <= 3 
            ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
            : 'rgba(255, 255, 255, 0.1)',
          color: rank <= 3 ? '#000' : '#fff',
        }}
      >
        {rankEmoji || rank}
      </div>

      {/* Name & Jersey */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span 
            className="font-bold text-white uppercase"
            style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
          >
            {entry.playerName}
          </span>
          <span className="text-[10px] text-white/40">
            #{entry.jerseyNumber}
          </span>
        </div>
        <div className="text-[10px] text-white/40">
          Wave {entry.wave} • {entry.tackles} tackles
        </div>
      </div>

      {/* Score */}
      <div 
        className="text-right font-black text-lg"
        style={{
          color: '#69BE28',
          fontFamily: 'var(--font-oswald), sans-serif',
        }}
      >
        {entry.score.toLocaleString()}
      </div>
    </motion.div>
  )
}

export default Leaderboard
