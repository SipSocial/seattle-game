'use client'

/**
 * V3 Results Page
 * 
 * Post-game stats, grade, and upgrade selection
 */

import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Suspense } from 'react'
import { GradientButton } from '@/components/ui/GradientButton'
import { GhostButton } from '@/components/ui/GhostButton'
import { GlassCard } from '@/components/ui/GlassCard'

// Animation configs
const smoothSpring = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: smoothSpring,
  },
}

function V3ResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Placeholder results - will be driven by game state
  const results = {
    won: true,
    homeScore: 28,
    awayScore: 14,
    grade: 'A',
    stats: {
      passingYards: 247,
      passingTDs: 3,
      completions: 18,
      attempts: 24,
      rushingYards: 42,
      sacks: 2,
      tackles: 6,
      interceptions: 1,
    },
  }

  const gradeColors: Record<string, string> = {
    'S': '#FFD700',
    'A': '#69BE28',
    'B': '#4ECDC4',
    'C': '#FFFFFF',
    'D': '#FF9500',
    'F': '#FF4444',
  }

  return (
    <div 
      className="fixed inset-0 flex flex-col"
      style={{
        background: results.won 
          ? 'linear-gradient(180deg, #0a1a0a 0%, #0d2818 50%, #0a0a0a 100%)'
          : 'linear-gradient(180deg, #1a0a0a 0%, #280d0d 50%, #0a0a0a 100%)',
      }}
    >
      {/* Victory/Defeat glow */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${results.won ? 'rgba(105, 190, 40, 0.2)' : 'rgba(255, 68, 68, 0.2)'} 0%, transparent 70%)`,
        }}
      />

      <motion.div
        className="relative z-10 flex flex-col h-full overflow-y-auto"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
          paddingLeft: '24px',
          paddingRight: '24px',
        }}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Result Header */}
        <motion.div 
          className="text-center mb-8"
          variants={fadeInUp}
        >
          <h1 
            className="text-5xl font-black uppercase tracking-tight mb-2"
            style={{ 
              fontFamily: 'var(--font-bebas)',
              color: results.won ? '#69BE28' : '#FF4444',
              textShadow: `0 0 60px ${results.won ? 'rgba(105, 190, 40, 0.5)' : 'rgba(255, 68, 68, 0.5)'}`,
            }}
          >
            {results.won ? 'VICTORY' : 'DEFEAT'}
          </h1>
          <div 
            className="text-4xl font-black"
            style={{ fontFamily: 'var(--font-bebas)', color: '#FFFFFF' }}
          >
            {results.homeScore} - {results.awayScore}
          </div>
        </motion.div>

        {/* Grade */}
        <motion.div 
          className="text-center mb-8"
          variants={fadeInUp}
        >
          <div 
            className="text-sm uppercase tracking-[0.3em] mb-2"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            Performance Grade
          </div>
          <div 
            className="text-8xl font-black"
            style={{ 
              fontFamily: 'var(--font-bebas)',
              color: gradeColors[results.grade] || '#FFFFFF',
              textShadow: `0 0 40px ${gradeColors[results.grade]}66`,
            }}
          >
            {results.grade}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="space-y-3 max-w-[360px] mx-auto w-full mb-8"
          variants={fadeInUp}
        >
          <div 
            className="text-xs uppercase tracking-[0.2em] mb-2"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            Offense
          </div>
          <GlassCard variant="dark" padding="md">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div 
                  className="text-2xl font-black"
                  style={{ fontFamily: 'var(--font-bebas)', color: '#FFFFFF' }}
                >
                  {results.stats.passingYards}
                </div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Passing Yards
                </div>
              </div>
              <div>
                <div 
                  className="text-2xl font-black"
                  style={{ fontFamily: 'var(--font-bebas)', color: '#69BE28' }}
                >
                  {results.stats.passingTDs}
                </div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Touchdowns
                </div>
              </div>
              <div>
                <div 
                  className="text-2xl font-black"
                  style={{ fontFamily: 'var(--font-bebas)', color: '#FFFFFF' }}
                >
                  {results.stats.completions}/{results.stats.attempts}
                </div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Completions
                </div>
              </div>
              <div>
                <div 
                  className="text-2xl font-black"
                  style={{ fontFamily: 'var(--font-bebas)', color: '#FFFFFF' }}
                >
                  {results.stats.rushingYards}
                </div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Rush Yards
                </div>
              </div>
            </div>
          </GlassCard>

          <div 
            className="text-xs uppercase tracking-[0.2em] mb-2 mt-4"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            Defense
          </div>
          <GlassCard variant="dark" padding="md">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div 
                  className="text-2xl font-black"
                  style={{ fontFamily: 'var(--font-bebas)', color: '#FF6B6B' }}
                >
                  {results.stats.sacks}
                </div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Sacks
                </div>
              </div>
              <div>
                <div 
                  className="text-2xl font-black"
                  style={{ fontFamily: 'var(--font-bebas)', color: '#FFFFFF' }}
                >
                  {results.stats.tackles}
                </div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Tackles
                </div>
              </div>
              <div>
                <div 
                  className="text-2xl font-black"
                  style={{ fontFamily: 'var(--font-bebas)', color: '#FFD700' }}
                >
                  {results.stats.interceptions}
                </div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  INTs
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <motion.div
          className="space-y-3 max-w-[340px] mx-auto w-full"
          variants={fadeInUp}
        >
          <GradientButton
            onClick={() => router.push('/campaign')}
            size="lg"
            fullWidth
          >
            CONTINUE
          </GradientButton>

          <GhostButton
            onClick={() => router.push('/v3/menu')}
            size="md"
            variant="subtle"
            fullWidth
          >
            MAIN MENU
          </GhostButton>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function V3ResultsPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <V3ResultsContent />
    </Suspense>
  )
}
