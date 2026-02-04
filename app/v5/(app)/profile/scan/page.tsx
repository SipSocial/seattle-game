'use client'

/**
 * Scan Page - Product scanning for bonus entries and instant wins
 * 
 * Features:
 * - Daily scan limit with countdown
 * - Camera viewfinder
 * - Photo verification flow
 * - Scratch card for instant win
 * - Entry celebration
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { GhostButton } from '@/components/ui/GhostButton'
import { CameraView } from '@/components/scan/CameraView'
import { VerificationProgress } from '@/components/scan/VerificationProgress'
import { ScratchCard } from '@/components/scan/ScratchCard'
import { useScanStore, useNextScanCountdown, type Prize } from '@/src/v5/store/scanStore'
import { BottomNav } from '@/app/v5/components/BottomNav'
import { 
  Camera, 
  Check, 
  Ticket, 
  Sparkles, 
  Clock, 
  Trophy, 
  ThumbsUp, 
  Gift,
  ArrowLeft,
  Gamepad2,
} from 'lucide-react'

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }

type ScanPhase = 
  | 'ready'
  | 'camera'
  | 'verifying'
  | 'entry-earned'
  | 'scratch'
  | 'complete'
  | 'already-scanned'

export default function ScanPage() {
  const [phase, setPhase] = useState<ScanPhase>('ready')
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [instantWinResult, setInstantWinResult] = useState<{ won: boolean; prize?: Prize } | null>(null)

  const { 
    checkDailyLimit, 
    canScanToday, 
    startScan, 
    submitPhoto, 
    rollInstantWin,
    completeScan,
    resetCurrentScan,
    totalScans,
    totalWins,
    debugResetDailyLimit,
  } = useScanStore()

  const countdown = useNextScanCountdown()

  // Check daily limit on mount
  useEffect(() => {
    const canScan = checkDailyLimit()
    if (!canScan) {
      setPhase('already-scanned')
    }
  }, [checkDailyLimit])

  const handleStartScan = useCallback(() => {
    startScan()
    setPhase('camera')
  }, [startScan])

  const handlePhotoCapture = useCallback(async (photoDataUrl: string) => {
    setCapturedPhoto(photoDataUrl)
    await submitPhoto(photoDataUrl)
    setPhase('verifying')
  }, [submitPhoto])

  const handleCancelScan = useCallback(() => {
    resetCurrentScan()
    setCapturedPhoto(null)
    setPhase('ready')
  }, [resetCurrentScan])

  const handleVerified = useCallback(async () => {
    setPhase('entry-earned')
    const result = rollInstantWin()
    setInstantWinResult(result)
    setTimeout(() => {
      setPhase('scratch')
    }, 2000)
  }, [rollInstantWin])

  const handleScratchComplete = useCallback(() => {
    if (instantWinResult) {
      completeScan(instantWinResult.won, instantWinResult.prize)
    }
    setPhase('complete')
  }, [completeScan, instantWinResult])

  const formatCountdown = () => {
    if (!countdown) return ''
    const { hours, minutes, seconds } = countdown
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div 
      className="fixed inset-0 flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #000A14 0%, #001428 100%)',
      }}
    >
      {/* Header */}
      <header 
        className="relative z-20 flex items-center justify-between"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
          paddingBottom: '16px',
          paddingLeft: 'var(--space-4)',
          paddingRight: 'var(--space-4)',
        }}
      >
        <Link href="/v5/profile">
          <motion.div
            className="flex items-center"
            style={{ gap: 'var(--space-2)' }}
            whileTap={{ scale: 0.95 }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </div>
          </motion.div>
        </Link>
        
        {/* Debug button (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={debugResetDailyLimit}
            style={{ 
              fontSize: 'var(--text-micro)',
              color: '#69BE28',
              opacity: 0.5,
            }}
          >
            [Reset]
          </button>
        )}
      </header>

      {/* Main content */}
      <main 
        className="flex-1 overflow-y-auto"
        style={{
          paddingLeft: 'var(--space-6)',
          paddingRight: 'var(--space-6)',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px) + 24px)',
        }}
      >
        <AnimatePresence mode="wait">
          {/* Ready state */}
          {phase === 'ready' && canScanToday && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center"
              style={{ gap: 'var(--space-fluid-lg)', paddingTop: 'var(--space-fluid-xl)' }}
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="relative"
              >
                <div 
                  className="w-24 h-24 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(105, 190, 40, 0.2) 0%, rgba(105, 190, 40, 0.1) 100%)',
                    border: '2px solid rgba(105, 190, 40, 0.3)',
                  }}
                >
                  <Camera className="w-12 h-12" style={{ color: '#69BE28' }} />
                </div>
                {/* Pulse ring */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: '2px solid rgba(105, 190, 40, 0.5)' }}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>

              {/* Title */}
              <div className="text-center">
                <h1
                  style={{
                    fontSize: 'var(--text-title)',
                    fontFamily: 'var(--font-oswald)',
                    fontWeight: 700,
                    color: 'rgba(255, 255, 255, 0.95)',
                    marginBottom: 'var(--space-2)',
                  }}
                >
                  Scan for Bonus Entry
                </h1>
                <p
                  style={{
                    fontSize: 'var(--text-body)',
                    color: 'rgba(255, 255, 255, 0.6)',
                    maxWidth: '280px',
                  }}
                >
                  Take a photo of your DrinkSip product to earn a bonus entry + instant win chance!
                </p>
              </div>

              {/* Instructions */}
              <GlassCard padding="md" className="w-full max-w-sm">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {[
                    { icon: <Camera className="w-5 h-5" style={{ color: '#69BE28' }} />, text: 'Take a clear photo of your DrinkSip can' },
                    { icon: <Check className="w-5 h-5" style={{ color: '#69BE28' }} />, text: 'We verify it\'s a valid product' },
                    { icon: <Ticket className="w-5 h-5" style={{ color: '#FFD700' }} />, text: 'Earn +1 bonus entry' },
                    { icon: <Sparkles className="w-5 h-5" style={{ color: '#FFD700' }} />, text: 'Scratch to win prizes!' },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center" style={{ gap: 'var(--space-3)' }}>
                      {step.icon}
                      <span style={{ fontSize: 'var(--text-body)', color: 'rgba(255,255,255,0.8)' }}>
                        {step.text}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Stats */}
              <div className="flex" style={{ gap: 'var(--space-6)' }}>
                <div className="text-center">
                  <p style={{ 
                    fontSize: 'var(--step-2)', 
                    fontWeight: 700, 
                    color: '#69BE28',
                    fontFamily: 'var(--font-oswald)',
                  }}>
                    {totalScans}
                  </p>
                  <p style={{ fontSize: 'var(--text-caption)', color: 'rgba(255,255,255,0.5)' }}>
                    Total Scans
                  </p>
                </div>
                <div className="text-center">
                  <p style={{ 
                    fontSize: 'var(--step-2)', 
                    fontWeight: 700, 
                    color: '#FFD700',
                    fontFamily: 'var(--font-oswald)',
                  }}>
                    {totalWins}
                  </p>
                  <p style={{ fontSize: 'var(--text-caption)', color: 'rgba(255,255,255,0.5)' }}>
                    Prizes Won
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="w-full max-w-sm">
                <GradientButton
                  size="lg"
                  fullWidth
                  onClick={handleStartScan}
                  icon={<Camera className="w-5 h-5" />}
                  iconPosition="left"
                >
                  Start Scanning
                </GradientButton>
              </div>
            </motion.div>
          )}

          {/* Already scanned state */}
          {phase === 'already-scanned' && (
            <motion.div
              key="already-scanned"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center"
              style={{ gap: 'var(--space-fluid-lg)', paddingTop: 'var(--space-fluid-xl)' }}
            >
              <GlassCard padding="lg" className="w-full max-w-sm text-center">
                <div className="flex justify-center" style={{ marginBottom: 'var(--space-4)' }}>
                  <Clock className="w-12 h-12" style={{ color: '#FFD700' }} />
                </div>
                <h2
                  style={{
                    fontSize: 'var(--text-title)',
                    fontFamily: 'var(--font-oswald)',
                    fontWeight: 700,
                    color: 'rgba(255, 255, 255, 0.95)',
                    marginBottom: 'var(--space-2)',
                  }}
                >
                  Already Scanned Today
                </h2>
                <p
                  style={{
                    fontSize: 'var(--text-body)',
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginBottom: 'var(--space-6)',
                  }}
                >
                  Come back tomorrow for another bonus entry and instant win chance!
                </p>

                {/* Countdown */}
                {countdown && (
                  <div 
                    className="mx-auto rounded-xl"
                    style={{
                      padding: 'var(--space-4) var(--space-6)',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <p
                      style={{
                        fontSize: 'var(--text-caption)',
                        color: 'rgba(255, 255, 255, 0.5)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginBottom: '4px',
                      }}
                    >
                      Next scan available in
                    </p>
                    <p
                      style={{
                        fontSize: 'var(--step-3)',
                        fontFamily: 'var(--font-oswald)',
                        fontWeight: 700,
                        color: '#69BE28',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {formatCountdown()}
                    </p>
                  </div>
                )}

                {/* Stats */}
                <div 
                  className="flex justify-center"
                  style={{ 
                    gap: 'var(--space-8)',
                    marginTop: 'var(--space-6)',
                    paddingTop: 'var(--space-6)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div className="text-center">
                    <p style={{ 
                      fontSize: 'var(--step-2)', 
                      fontWeight: 700, 
                      color: '#69BE28',
                      fontFamily: 'var(--font-oswald)',
                    }}>
                      {totalScans}
                    </p>
                    <p style={{ fontSize: 'var(--text-caption)', color: 'rgba(255,255,255,0.5)' }}>
                      Total Scans
                    </p>
                  </div>
                  <div className="text-center">
                    <p style={{ 
                      fontSize: 'var(--step-2)', 
                      fontWeight: 700, 
                      color: '#FFD700',
                      fontFamily: 'var(--font-oswald)',
                    }}>
                      {totalWins}
                    </p>
                    <p style={{ fontSize: 'var(--text-caption)', color: 'rgba(255,255,255,0.5)' }}>
                      Prizes Won
                    </p>
                  </div>
                </div>
              </GlassCard>

              <Link href="/v5/profile" className="w-full max-w-sm">
                <GhostButton size="lg" fullWidth variant="subtle">
                  Back to Profile
                </GhostButton>
              </Link>
            </motion.div>
          )}

          {/* Camera phase */}
          {phase === 'camera' && (
            <motion.div
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col"
              style={{ paddingTop: 'var(--space-3)' }}
            >
              <h2
                className="text-center"
                style={{
                  fontSize: 'var(--text-subtitle)',
                  fontFamily: 'var(--font-oswald)',
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.9)',
                  marginBottom: 'var(--space-4)',
                }}
              >
                Scan Your DrinkSip
              </h2>
              <div className="flex-1">
                <CameraView
                  onCapture={handlePhotoCapture}
                  onCancel={handleCancelScan}
                />
              </div>
            </motion.div>
          )}

          {/* Verifying phase */}
          {phase === 'verifying' && capturedPhoto && (
            <motion.div
              key="verifying"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center"
              style={{ paddingTop: 'var(--space-fluid-2xl)' }}
            >
              <VerificationProgress
                photoUrl={capturedPhoto}
                onVerified={handleVerified}
              />
            </motion.div>
          )}

          {/* Entry earned celebration */}
          {phase === 'entry-earned' && (
            <motion.div
              key="entry-earned"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center"
              style={{ paddingTop: 'var(--space-fluid-2xl)' }}
            >
              <GlassCard padding="lg" variant="green" className="w-full max-w-sm text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                  className="flex justify-center"
                  style={{ marginBottom: 'var(--space-4)' }}
                >
                  <Sparkles className="w-16 h-16" style={{ color: '#69BE28' }} />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{
                    fontSize: 'var(--text-title)',
                    fontFamily: 'var(--font-oswald)',
                    fontWeight: 700,
                    color: '#69BE28',
                    marginBottom: 'var(--space-2)',
                  }}
                >
                  Entry Earned!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  style={{
                    fontSize: 'var(--text-body)',
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}
                >
                  +1 entry added to your Big Game total
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center justify-center"
                  style={{ gap: 'var(--space-2)', marginTop: 'var(--space-6)' }}
                >
                  <div 
                    className="w-2 h-2 rounded-full bg-green-400"
                    style={{ animation: 'pulse 1s infinite' }}
                  />
                  <p style={{ fontSize: 'var(--text-caption)', color: 'rgba(255,255,255,0.5)' }}>
                    Preparing instant win...
                  </p>
                </motion.div>
              </GlassCard>
            </motion.div>
          )}

          {/* Scratch card phase */}
          {phase === 'scratch' && instantWinResult && (
            <motion.div
              key="scratch"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center"
              style={{ paddingTop: 'var(--space-fluid-lg)' }}
            >
              <ScratchCard
                isWinner={instantWinResult.won}
                prize={instantWinResult.prize}
                onComplete={handleScratchComplete}
              />
            </motion.div>
          )}

          {/* Complete phase */}
          {phase === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center"
              style={{ gap: 'var(--space-fluid-lg)', paddingTop: 'var(--space-fluid-xl)' }}
            >
              <GlassCard padding="lg" className="w-full max-w-sm text-center">
                <div className="flex justify-center" style={{ marginBottom: 'var(--space-4)' }}>
                  {instantWinResult?.won 
                    ? <Trophy className="w-12 h-12" style={{ color: '#FFD700' }} /> 
                    : <ThumbsUp className="w-12 h-12" style={{ color: '#69BE28' }} />
                  }
                </div>
                <h2
                  style={{
                    fontSize: 'var(--text-title)',
                    fontFamily: 'var(--font-oswald)',
                    fontWeight: 700,
                    color: instantWinResult?.won ? '#FFD700' : 'rgba(255, 255, 255, 0.95)',
                    marginBottom: 'var(--space-2)',
                  }}
                >
                  {instantWinResult?.won ? 'Congratulations!' : 'Scan Complete!'}
                </h2>
                
                {instantWinResult?.won && instantWinResult.prize ? (
                  <div>
                    <p
                      style={{
                        fontSize: 'var(--step-1)',
                        color: '#69BE28',
                        fontWeight: 600,
                        marginBottom: 'var(--space-2)',
                      }}
                    >
                      You won: {instantWinResult.prize.name}
                    </p>
                    <p
                      style={{
                        fontSize: 'var(--text-body)',
                        color: 'rgba(255, 255, 255, 0.6)',
                      }}
                    >
                      Check your email for claim instructions.
                    </p>
                  </div>
                ) : (
                  <p
                    style={{
                      fontSize: 'var(--text-body)',
                      color: 'rgba(255, 255, 255, 0.6)',
                    }}
                  >
                    Your entry has been recorded. Come back tomorrow for another chance!
                  </p>
                )}

                {/* Summary */}
                <div 
                  className="flex justify-center"
                  style={{ 
                    gap: 'var(--space-8)',
                    marginTop: 'var(--space-6)',
                    paddingTop: 'var(--space-6)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div className="text-center">
                    <p style={{ 
                      fontSize: 'var(--step-2)', 
                      fontWeight: 700, 
                      color: '#69BE28',
                      fontFamily: 'var(--font-oswald)',
                    }}>
                      +1
                    </p>
                    <p style={{ fontSize: 'var(--text-caption)', color: 'rgba(255,255,255,0.5)' }}>
                      Entry Earned
                    </p>
                  </div>
                  {instantWinResult?.won && (
                    <div className="text-center">
                      <div className="flex justify-center">
                        <Gift className="w-6 h-6" style={{ color: '#FFD700' }} />
                      </div>
                      <p style={{ fontSize: 'var(--text-caption)', color: 'rgba(255,255,255,0.5)' }}>
                        Prize Won
                      </p>
                    </div>
                  )}
                </div>
              </GlassCard>

              <div className="w-full max-w-sm" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <Link href="/v5/game">
                  <GradientButton size="lg" fullWidth icon={<Gamepad2 className="w-5 h-5" />} iconPosition="left">
                    Play for More Entries
                  </GradientButton>
                </Link>
                <Link href="/v5/profile">
                  <GhostButton size="lg" fullWidth variant="subtle">
                    Back to Profile
                  </GhostButton>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Nav - hide during camera phase */}
      {phase !== 'camera' && <BottomNav />}
    </div>
  )
}
