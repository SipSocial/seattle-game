'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '../ui/GlassCard'

interface VerificationProgressProps {
  photoUrl: string
  onVerified: () => void
  onError?: () => void
}

type VerificationStep = 'uploading' | 'analyzing' | 'verifying' | 'success' | 'error'

const STEPS = [
  { key: 'uploading', label: 'Uploading photo...', duration: 800 },
  { key: 'analyzing', label: 'Analyzing image...', duration: 1200 },
  { key: 'verifying', label: 'Verifying DrinkSip...', duration: 1000 },
  { key: 'success', label: 'Verified!', duration: 0 },
] as const

export function VerificationProgress({ photoUrl, onVerified, onError }: VerificationProgressProps) {
  const [currentStep, setCurrentStep] = useState<VerificationStep>('uploading')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let cancelled = false
    let totalElapsed = 0

    const runSteps = async () => {
      for (let i = 0; i < STEPS.length - 1; i++) {
        if (cancelled) return

        const step = STEPS[i]
        setCurrentStep(step.key as VerificationStep)

        // Animate progress for this step
        const startProgress = (i / (STEPS.length - 1)) * 100
        const endProgress = ((i + 1) / (STEPS.length - 1)) * 100
        const stepDuration = step.duration
        const stepStart = totalElapsed

        await new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            if (cancelled) {
              clearInterval(interval)
              resolve()
              return
            }

            totalElapsed += 50
            const stepElapsed = totalElapsed - stepStart
            const stepProgress = Math.min(stepElapsed / stepDuration, 1)
            setProgress(startProgress + (endProgress - startProgress) * stepProgress)

            if (stepProgress >= 1) {
              clearInterval(interval)
              resolve()
            }
          }, 50)
        })
      }

      if (!cancelled) {
        setCurrentStep('success')
        setProgress(100)
        // Short delay before calling onVerified
        setTimeout(() => {
          if (!cancelled) onVerified()
        }, 800)
      }
    }

    runSteps()

    return () => {
      cancelled = true
    }
  }, [onVerified])

  const stepIndex = STEPS.findIndex(s => s.key === currentStep)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <GlassCard padding="lg" className="text-center">
        {/* Photo preview */}
        <div 
          className="relative mx-auto overflow-hidden rounded-xl mb-6"
          style={{
            width: '120px',
            height: '120px',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl}
            alt="Scanned product"
            className="w-full h-full object-cover"
          />
          
          {/* Scanning overlay */}
          <AnimatePresence>
            {currentStep !== 'success' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
                style={{
                  background: 'rgba(105, 190, 40, 0.2)',
                }}
              >
                {/* Scanning line */}
                <motion.div
                  className="absolute left-0 right-0 h-1"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, #69BE28 50%, transparent 100%)',
                    boxShadow: '0 0 12px #69BE28',
                  }}
                  animate={{
                    top: ['0%', '100%', '0%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success checkmark */}
          <AnimatePresence>
            {currentStep === 'success' && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  background: 'rgba(105, 190, 40, 0.85)',
                }}
              >
                <motion.svg
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <motion.path
                    d="M20 6L9 17l-5-5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  />
                </motion.svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Step indicator */}
        <div className="mb-4">
          <motion.p
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              fontSize: 'var(--text-subtitle)',
              fontFamily: 'var(--font-oswald)',
              fontWeight: 600,
              color: currentStep === 'success' ? '#69BE28' : 'rgba(255, 255, 255, 0.9)',
            }}
          >
            {STEPS.find(s => s.key === currentStep)?.label}
          </motion.p>
        </div>

        {/* Progress bar */}
        <div 
          className="relative overflow-hidden rounded-full mb-6"
          style={{
            height: '8px',
            background: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: 'linear-gradient(90deg, #69BE28 0%, #8EE048 100%)',
              boxShadow: '0 0 12px rgba(105, 190, 40, 0.5)',
            }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Step dots */}
        <div className="flex justify-center" style={{ gap: 'var(--space-3)' }}>
          {STEPS.slice(0, -1).map((step, i) => (
            <motion.div
              key={step.key}
              className="rounded-full"
              style={{
                width: '8px',
                height: '8px',
                background: i <= stepIndex ? '#69BE28' : 'rgba(255, 255, 255, 0.2)',
              }}
              animate={{
                scale: i === stepIndex ? [1, 1.3, 1] : 1,
              }}
              transition={{
                duration: 0.6,
                repeat: i === stepIndex ? Infinity : 0,
              }}
            />
          ))}
        </div>

        {/* Success message */}
        <AnimatePresence>
          {currentStep === 'success' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 pt-6"
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="flex items-center justify-center" style={{ gap: 'var(--space-2)' }}>
                <span style={{ fontSize: '24px' }}>🎉</span>
                <p
                  style={{
                    fontSize: 'var(--text-body)',
                    color: '#69BE28',
                    fontWeight: 600,
                  }}
                >
                  +1 Entry Earned!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  )
}

export default VerificationProgress
