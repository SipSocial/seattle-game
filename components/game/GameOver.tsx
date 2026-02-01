'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { GhostButton } from '@/components/ui/GhostButton'
import { StatDisplay } from '@/components/ui/StatDisplay'
import { useGameStore } from '@/src/store/gameStore'

interface GameOverProps {
  isOpen: boolean
  onPlayAgain: () => void
  onChangePlayer: () => void
  onViewLeaderboard: () => void
}

export function GameOver({ isOpen, onPlayAgain, onChangePlayer, onViewLeaderboard }: GameOverProps) {
  const { score, wave, tackles, highScore, playerName, selectedDefender } = useGameStore()
  const [nameInput, setNameInput] = useState(playerName || '')
  const [isNewHighScore, setIsNewHighScore] = useState(false)
  const setPlayerName = useGameStore((s) => s.setPlayerName)
  const addLeaderboardEntry = useGameStore((s) => s.addLeaderboardEntry)

  useEffect(() => {
    if (isOpen) {
      setIsNewHighScore(score >= highScore && score > 0)
      if (playerName) setNameInput(playerName)
    }
  }, [isOpen, score, highScore, playerName])

  const handleSubmit = useCallback(() => {
    if (nameInput.length >= 1) {
      setPlayerName(nameInput)
      addLeaderboardEntry({
        playerName: nameInput.toUpperCase(),
        jerseyNumber: selectedDefender,
        score,
        wave,
        tackles,
      })
    }
    onPlayAgain()
  }, [nameInput, setPlayerName, addLeaderboardEntry, selectedDefender, score, wave, tackles, onPlayAgain])

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
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Content */}
        <motion.div
          className="relative z-10 w-full px-6"
          style={{ maxWidth: '400px' }}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <GlassCard padding="lg" className="text-center">
            {/* Header */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              style={{ marginBottom: '24px' }}
            >
              {isNewHighScore ? (
                <>
                  <div className="text-5xl" style={{ marginBottom: '12px' }}>🏆</div>
                  <h2 
                    className="text-3xl font-black uppercase"
                    style={{
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontFamily: 'var(--font-oswald), sans-serif',
                    }}
                  >
                    New High Score!
                  </h2>
                </>
              ) : (
                <>
                  <div className="text-5xl" style={{ marginBottom: '12px' }}>🏈</div>
                  <h2 
                    className="text-3xl font-black text-white uppercase"
                    style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                  >
                    Game Over
                  </h2>
                </>
              )}
            </motion.div>

            {/* Score */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ marginBottom: '32px' }}
            >
              <div 
                className="text-6xl font-black"
                style={{
                  color: '#69BE28',
                  fontFamily: 'var(--font-oswald), sans-serif',
                  textShadow: '0 0 30px rgba(105, 190, 40, 0.5)',
                }}
              >
                {score.toLocaleString()}
              </div>
              <div 
                className="text-sm uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}
              >
                Final Score
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center"
              style={{ gap: '56px', marginBottom: '32px' }}
            >
              <StatDisplay value={wave} label="Wave" size="md" />
              <StatDisplay value={tackles} label="Tackles" size="md" />
            </motion.div>

            {/* Name Entry */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{ marginBottom: '32px' }}
            >
              <label 
                className="block text-xs uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '12px' }}
              >
                Enter Your Initials
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value.toUpperCase().slice(0, 3))}
                maxLength={3}
                placeholder="AAA"
                className="w-32 h-14 rounded-xl text-center text-2xl font-black uppercase tracking-widest outline-none transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid rgba(105, 190, 40, 0.3)',
                  color: '#69BE28',
                  fontFamily: 'var(--font-oswald), sans-serif',
                }}
                onFocus={(e) => e.target.style.borderColor = '#69BE28'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(105, 190, 40, 0.3)'}
              />
            </motion.div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col"
              style={{ gap: '16px' }}
            >
              <GradientButton 
                size="lg" 
                fullWidth 
                onClick={handleSubmit}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                }
              >
                Play Again
              </GradientButton>

              <div className="flex" style={{ gap: '12px' }}>
                <GhostButton 
                  size="md"
                  fullWidth 
                  variant="green"
                  onClick={onChangePlayer}
                >
                  Change Player
                </GhostButton>
                <GhostButton 
                  size="md"
                  fullWidth
                  variant="subtle"
                  onClick={onViewLeaderboard}
                >
                  Leaderboard
                </GhostButton>
              </div>
            </motion.div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default GameOver
