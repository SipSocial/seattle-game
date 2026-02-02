'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EmailEntry } from '@/components/platform/EmailEntry'
import { LeaderboardTable } from '@/components/platform/LeaderboardTable'
import { GradientButton } from '@/components/ui/GradientButton'
import { GhostButton } from '@/components/ui/GhostButton'
import { useV3GameStore, useV3User } from '@/src/v3/store/v3GameStore'

interface GameResultsProps {
  isOpen: boolean
  score: number
  won: boolean
  stats: {
    yardsGained: number
    touchdowns: number
    interceptions: number
    sacks: number
    completions: number
    attempts: number
  }
  onPlayAgain: () => void
  onShare: () => void
  onHome: () => void
}

type Tab = 'results' | 'leaderboard' | 'share'

export function GameResults({
  isOpen,
  score,
  won,
  stats,
  onPlayAgain,
  onShare,
  onHome,
}: GameResultsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('results')
  const [showEmailEntry, setShowEmailEntry] = useState(true)
  const user = useV3User()
  const { addEntry, submitScore } = useV3GameStore()

  // If user has email, skip email entry
  const hasEmail = !!user.email

  const handleEmailComplete = () => {
    setShowEmailEntry(false)
    // Add entry for email signup
    addEntry('email')
  }

  const handlePlayAgain = () => {
    // Add entry for playing another game
    addEntry('play')
    onPlayAgain()
  }

  const handleShare = async () => {
    // Add entry for sharing
    addEntry('share')
    
    // Share functionality
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Dark Side Football',
          text: `I scored ${score} points on Dark Side Football! Can you beat me?`,
          url: window.location.origin,
        })
      } catch (e) {
        // User cancelled or share failed
      }
    } else {
      // Fallback - copy link
      navigator.clipboard.writeText(`${window.location.origin}?ref=share`)
      onShare()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: won 
              ? 'linear-gradient(180deg, rgba(0,17,34,0.95) 0%, rgba(105,190,40,0.2) 100%)'
              : 'linear-gradient(180deg, rgba(0,17,34,0.95) 0%, rgba(0,0,0,0.95) 100%)',
            backdropFilter: 'blur(10px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Content */}
        <motion.div
          className="relative z-10 w-full h-full flex flex-col overflow-hidden"
          style={{ maxWidth: '420px' }}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {/* Header */}
          <div className="flex-shrink-0 text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              {won ? (
                <div className="text-6xl mb-4">🏆</div>
              ) : (
                <div className="text-6xl mb-4">🏈</div>
              )}
            </motion.div>
            
            <h1 
              className="text-4xl font-black uppercase"
              style={{
                fontFamily: 'var(--font-oswald)',
                background: won 
                  ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                  : 'linear-gradient(135deg, #FFFFFF 0%, #AAAAAA 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {won ? 'Victory!' : 'Game Over'}
            </h1>
            
            {/* Score */}
            <div 
              className="text-7xl font-black mt-4"
              style={{
                fontFamily: 'var(--font-oswald)',
                color: 'var(--seahawks-green)',
                textShadow: '0 0 40px rgba(105,190,40,0.5)',
              }}
            >
              {score.toLocaleString()}
            </div>
            <div 
              className="text-xs uppercase tracking-widest mt-2"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              Final Score
            </div>
          </div>

          {/* Tabs */}
          <div 
            className="flex-shrink-0 flex justify-center gap-2 px-4"
            style={{ marginBottom: 'var(--space-4)' }}
          >
            {(['results', 'leaderboard', 'share'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 py-2 rounded-full text-xs uppercase tracking-wider transition-all"
                style={{
                  fontFamily: 'var(--font-oswald)',
                  background: activeTab === tab 
                    ? 'var(--seahawks-green)' 
                    : 'rgba(255,255,255,0.1)',
                  color: activeTab === tab ? 'white' : 'rgba(255,255,255,0.6)',
                }}
              >
                {tab === 'results' && 'Stats'}
                {tab === 'leaderboard' && 'Leaders'}
                {tab === 'share' && 'Share'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div 
            className="flex-1 overflow-y-auto px-4"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 180px)' }}
          >
            <AnimatePresence mode="wait">
              {activeTab === 'results' && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  {/* Stats Grid */}
                  <div 
                    className="glass-card rounded-2xl p-6"
                    style={{ marginBottom: 'var(--space-4)' }}
                  >
                    <h3 
                      className="text-sm uppercase tracking-widest mb-4"
                      style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-oswald)' }}
                    >
                      Game Stats
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <StatItem 
                        label="Yards Gained" 
                        value={stats.yardsGained.toString()} 
                        highlight={stats.yardsGained > 100}
                      />
                      <StatItem 
                        label="Touchdowns" 
                        value={stats.touchdowns.toString()} 
                        highlight={stats.touchdowns > 0}
                      />
                      <StatItem 
                        label="Completion %" 
                        value={stats.attempts > 0 ? `${Math.round((stats.completions / stats.attempts) * 100)}%` : '0%'} 
                      />
                      <StatItem 
                        label="INTs Thrown" 
                        value={stats.interceptions.toString()} 
                        negative={stats.interceptions > 0}
                      />
                      <StatItem 
                        label="Sacks Taken" 
                        value={stats.sacks.toString()} 
                        negative={stats.sacks > 0}
                      />
                      <StatItem 
                        label="Completions" 
                        value={`${stats.completions}/${stats.attempts}`} 
                      />
                    </div>
                  </div>

                  {/* Email Entry (if not already entered) */}
                  {showEmailEntry && !hasEmail && (
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                      <EmailEntry 
                        onComplete={handleEmailComplete}
                        title="Enter to Win"
                        subtitle="Super Bowl LX Tickets"
                        buttonText="Enter Now"
                      />
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'leaderboard' && (
                <motion.div
                  key="leaderboard"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-card rounded-2xl p-4"
                >
                  <h3 
                    className="text-sm uppercase tracking-widest mb-4 text-center"
                    style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-oswald)' }}
                  >
                    Top Players
                  </h3>
                  <LeaderboardTable maxEntries={10} />
                </motion.div>
              )}

              {activeTab === 'share' && (
                <motion.div
                  key="share"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-card rounded-2xl p-6 text-center"
                >
                  <div className="text-5xl mb-4">🎯</div>
                  <h3 
                    className="text-xl font-bold mb-2"
                    style={{ fontFamily: 'var(--font-oswald)', color: 'white' }}
                  >
                    Share to Earn Entries
                  </h3>
                  <p className="text-white/60 text-sm mb-6">
                    Share your score with friends and earn extra entries for the Super Bowl LX ticket giveaway!
                  </p>
                  
                  <button
                    onClick={handleShare}
                    className="w-full py-4 rounded-xl font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-3"
                    style={{
                      background: 'linear-gradient(135deg, #1DA1F2 0%, #0077B5 100%)',
                      color: 'white',
                      fontFamily: 'var(--font-oswald)',
                    }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                    Share Score
                  </button>
                  
                  <p className="text-white/40 text-xs mt-4">
                    +1 entry per share
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Fixed Bottom Actions */}
          <div 
            className="fixed bottom-0 left-0 right-0 p-4"
            style={{
              background: 'linear-gradient(0deg, rgba(0,17,34,1) 0%, rgba(0,17,34,0.9) 80%, transparent 100%)',
              paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
            }}
          >
            <div className="max-w-sm mx-auto space-y-3">
              <GradientButton 
                size="lg" 
                fullWidth 
                onClick={handlePlayAgain}
              >
                Play Again (+1 Entry)
              </GradientButton>
              
              <GhostButton 
                size="md" 
                fullWidth 
                variant="subtle"
                onClick={onHome}
              >
                Back to Home
              </GhostButton>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function StatItem({ 
  label, 
  value, 
  highlight = false, 
  negative = false 
}: { 
  label: string
  value: string
  highlight?: boolean
  negative?: boolean
}) {
  return (
    <div className="text-center">
      <div 
        className="text-2xl font-bold"
        style={{ 
          fontFamily: 'var(--font-oswald)',
          color: negative 
            ? '#FF4444' 
            : highlight 
              ? 'var(--seahawks-green)' 
              : 'white',
        }}
      >
        {value}
      </div>
      <div 
        className="text-xs uppercase tracking-wider mt-1"
        style={{ color: 'rgba(255,255,255,0.5)' }}
      >
        {label}
      </div>
    </div>
  )
}

export default GameResults
