'use client'

/**
 * PWA Install Guide - Professional Quality
 * 
 * Platform-specific instructions for adding to home screen:
 * - iOS: Safari share sheet -> Add to Home Screen
 * - Android: Install prompt or Chrome menu
 * - Desktop: Install button or address bar
 * 
 * Features:
 * - Auto-detect platform
 * - Check if already installed (standalone mode)
 * - Visual step-by-step guide with Lucide icons
 * - Progress indicator with spring animations
 * - Skip option for web users
 * - Success state with celebration
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  Share, 
  PlusSquare, 
  Check, 
  Smartphone, 
  Download, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Zap,
  Bell,
  Wifi,
  Shield,
} from 'lucide-react'
import { GradientButton, GhostButton, GlassCard } from '@/components/ui'

// Platform detection types
type Platform = 'ios' | 'android' | 'desktop' | 'unknown'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// Animation config
const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }
const springBouncy = { type: 'spring' as const, stiffness: 400, damping: 25 }

export default function InstallPage() {
  const router = useRouter()
  const [platform, setPlatform] = useState<Platform>('unknown')
  const [isStandalone, setIsStandalone] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isInstalling, setIsInstalling] = useState(false)
  const [installComplete, setInstallComplete] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Detect platform and standalone mode
  useEffect(() => {
    setMounted(true)
    
    const checkStandalone = () => {
      const isInStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                            (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
                            document.referrer.includes('android-app://');
      setIsStandalone(isInStandalone)
      
      const hasInstalled = localStorage.getItem('pwa_installed')
      
      if (isInStandalone || hasInstalled) {
        router.replace('/v5/game')
      }
    }
    
    const detectPlatform = (): Platform => {
      const ua = navigator.userAgent.toLowerCase()
      
      if (/iphone|ipad|ipod/.test(ua)) return 'ios'
      if (/android/.test(ua)) return 'android'
      if (/windows|macintosh|linux/.test(ua) && !/mobile/.test(ua)) return 'desktop'
      return 'unknown'
    }
    
    setPlatform(detectPlatform())
    checkStandalone()
    
    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        localStorage.setItem('pwa_installed', 'true')
        setInstallComplete(true)
        setTimeout(() => router.replace('/v5/game'), 1500)
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [router])

  // Listen for beforeinstallprompt (Android/Desktop)
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    
    window.addEventListener('appinstalled', () => {
      localStorage.setItem('pwa_installed', 'true')
      setInstallComplete(true)
      setTimeout(() => router.replace('/v5/game'), 1500)
    })
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [router])

  // Handle native install prompt (Android/Desktop)
  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return
    
    setIsInstalling(true)
    
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        localStorage.setItem('pwa_installed', 'true')
        setInstallComplete(true)
        setTimeout(() => router.replace('/v5/game'), 1500)
      }
    } catch (error) {
      console.error('Install failed:', error)
    } finally {
      setIsInstalling(false)
      setDeferredPrompt(null)
    }
  }, [deferredPrompt, router])

  // Skip installation
  const handleSkip = useCallback(() => {
    localStorage.setItem('pwa_install_skipped', 'true')
    router.replace('/v5/game')
  }, [router])

  // Mark as complete and continue
  const handleContinue = useCallback(() => {
    localStorage.setItem('pwa_installed', 'true')
    router.replace('/v5/game')
  }, [router])

  // If already in standalone mode, show nothing while redirecting
  if (isStandalone) {
    return null
  }

  // iOS-specific install steps
  const iosSteps = [
    {
      icon: Share,
      title: 'Tap Share',
      description: 'Find the share button at the bottom of Safari',
      highlight: 'Share icon',
    },
    {
      icon: PlusSquare,
      title: 'Add to Home Screen',
      description: 'Scroll down and tap "Add to Home Screen"',
      highlight: 'Add to Home Screen',
    },
    {
      icon: Check,
      title: 'Tap Add',
      description: 'Confirm by tapping "Add" in the top right',
      highlight: 'Add',
    },
  ]

  // Android Chrome steps (when no prompt available)
  const androidSteps = [
    {
      icon: MoreVertical,
      title: 'Tap Menu',
      description: "Find the three dots in Chrome's top right",
      highlight: 'Menu button',
    },
    {
      icon: Download,
      title: 'Install App',
      description: 'Select "Add to Home screen" or "Install app"',
      highlight: 'Install app',
    },
    {
      icon: Check,
      title: 'Confirm Install',
      description: 'Tap "Install" to add to your home screen',
      highlight: 'Install',
    },
  ]

  const steps = platform === 'ios' ? iosSteps : androidSteps

  // Benefits of installing
  const benefits = [
    { icon: Zap, label: 'Faster', description: 'Instant load' },
    { icon: Bell, label: 'Alerts', description: 'Get notified' },
    { icon: Wifi, label: 'Offline', description: 'Play anywhere' },
    { icon: Shield, label: 'Secure', description: 'Private data' },
  ]

  return (
    <div 
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #000A14 0%, #001428 50%, #002244 100%)',
      }}
    >
      {/* Background pattern */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(105, 190, 40, 0.08) 0%, transparent 50%)',
        }}
      />

      {/* Header */}
      <header 
        className="relative z-10 text-center shrink-0"
        style={{ 
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + var(--space-8))',
          paddingLeft: 'var(--space-6)',
          paddingRight: 'var(--space-6)',
        }}
      >
        <AnimatePresence>
          {mounted && (
            <>
              {/* Progress indicator */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex justify-center items-center"
                style={{ 
                  gap: 'var(--space-2)',
                  marginBottom: 'var(--space-4)',
                }}
              >
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    style={{
                      width: step === 4 ? '24px' : '8px',
                      height: '8px',
                      borderRadius: '4px',
                      background: step === 4 
                        ? 'linear-gradient(90deg, #69BE28, #8BD44A)' 
                        : step < 4 
                          ? '#69BE28' 
                          : 'rgba(255,255,255,0.2)',
                      boxShadow: step === 4 ? '0 0 12px rgba(105, 190, 40, 0.5)' : 'none',
                    }}
                  />
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ 
                  fontSize: 'var(--text-caption)',
                  color: 'rgba(255,255,255,0.5)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  marginBottom: 'var(--space-2)',
                }}
              >
                Final Step
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                style={{ 
                  fontSize: 'var(--text-title)',
                  fontFamily: 'var(--font-oswald), sans-serif',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'white',
                }}
              >
                Install the App
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{ 
                  marginTop: 'var(--space-2)',
                  fontSize: 'var(--text-body)',
                  color: 'rgba(255,255,255,0.5)',
                  lineHeight: 1.5,
                }}
              >
                Add to your home screen for the best experience
              </motion.p>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main 
        className="relative z-10 flex-1 flex flex-col justify-center overflow-hidden"
        style={{ 
          padding: 'var(--space-6)',
          gap: 'var(--space-6)',
        }}
      >
        <AnimatePresence mode="wait">
          {installComplete ? (
            /* Success State */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ ...springBouncy, delay: 0.1 }}
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #69BE28 0%, #4a9218 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  marginBottom: 'var(--space-6)',
                  color: '#002244',
                  boxShadow: '0 20px 60px rgba(105, 190, 40, 0.4), 0 0 80px rgba(105, 190, 40, 0.2)',
                }}
              >
                <Check size={48} strokeWidth={3} />
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{ 
                  fontSize: 'var(--text-subtitle)',
                  fontFamily: 'var(--font-oswald), sans-serif',
                  fontWeight: 700,
                  marginBottom: 'var(--space-2)',
                  color: '#69BE28',
                }}
              >
                App Installed!
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{ 
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: 'var(--text-body)',
                }}
              >
                Opening Dark Side Football...
              </motion.p>
            </motion.div>
          ) : deferredPrompt ? (
            /* Native Install Prompt Available (Android/Desktop) */
            <motion.div
              key="native"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
              style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}
            >
              {/* App Icon Preview */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                style={{
                  width: '100px',
                  height: '100px',
                  margin: '0 auto',
                  marginBottom: 'var(--space-6)',
                  background: 'linear-gradient(135deg, #002244 0%, #001428 100%)',
                  borderRadius: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(105, 190, 40, 0.4)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 80px rgba(105, 190, 40, 0.15)',
                }}
              >
                <span 
                  style={{ 
                    fontSize: '36px',
                    fontFamily: 'var(--font-bebas), var(--font-oswald), sans-serif',
                    fontWeight: 900,
                    color: '#69BE28',
                    letterSpacing: '0.05em',
                  }}
                >
                  DS
                </span>
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{ 
                  fontSize: 'var(--text-subtitle)',
                  fontFamily: 'var(--font-oswald), sans-serif',
                  fontWeight: 700,
                  marginBottom: 'var(--space-4)',
                  color: 'white',
                }}
              >
                Ready to Install
              </motion.h2>

              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{ 
                  color: 'rgba(255,255,255,0.6)',
                  marginBottom: 'var(--space-6)',
                  maxWidth: '280px',
                  margin: '0 auto',
                  fontSize: 'var(--text-body)',
                  lineHeight: 1.5,
                }}
              >
                Get the full experience with one tap
              </motion.p>

              {/* Benefits Grid */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-4"
                style={{ 
                  gap: 'var(--space-4)', 
                  marginTop: 'var(--space-6)',
                  marginBottom: 'var(--space-8)',
                }}
              >
                {benefits.map(({ icon: Icon, label, description }) => (
                  <div key={label} className="text-center">
                    <div 
                      className="flex items-center justify-center"
                      style={{ 
                        width: '48px', 
                        height: '48px', 
                        borderRadius: '14px',
                        background: 'rgba(105, 190, 40, 0.12)',
                        border: '1px solid rgba(105, 190, 40, 0.2)',
                        margin: '0 auto',
                        marginBottom: 'var(--space-2)',
                      }}
                    >
                      <Icon size={22} style={{ color: '#69BE28' }} />
                    </div>
                    <span style={{ 
                      display: 'block',
                      fontSize: 'var(--text-micro)', 
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.8)',
                      marginBottom: '2px',
                    }}>
                      {label}
                    </span>
                    <span style={{ 
                      display: 'block',
                      fontSize: 'var(--text-micro)', 
                      color: 'rgba(255,255,255,0.4)',
                    }}>
                      {description}
                    </span>
                  </div>
                ))}
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <GradientButton
                  size="lg"
                  fullWidth
                  onClick={handleInstallClick}
                  loading={isInstalling}
                  icon={<Download size={20} />}
                  iconPosition="left"
                >
                  {isInstalling ? 'Installing...' : 'Install Now'}
                </GradientButton>
              </motion.div>
            </motion.div>
          ) : (
            /* Manual Instructions (iOS) */
            <motion.div
              key="manual"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}
            >
              {/* App icon preview */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex justify-center"
                style={{ marginBottom: 'var(--space-6)' }}
              >
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #002244 0%, #001428 100%)',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid rgba(105, 190, 40, 0.4)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.4), 0 0 60px rgba(105, 190, 40, 0.15)',
                  }}
                >
                  <span 
                    style={{ 
                      fontSize: '32px',
                      fontFamily: 'var(--font-bebas), var(--font-oswald), sans-serif',
                      fontWeight: 900,
                      color: '#69BE28',
                    }}
                  >
                    DS
                  </span>
                </div>
              </motion.div>

              {/* Step indicators */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex justify-center"
                style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}
              >
                {steps.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      width: currentStep === index ? '28px' : '10px',
                      height: '10px',
                      borderRadius: '5px',
                      background: currentStep === index 
                        ? 'linear-gradient(90deg, #69BE28, #8BD44A)' 
                        : index < currentStep
                          ? '#69BE28'
                          : 'rgba(255,255,255,0.2)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: currentStep === index 
                        ? '0 2px 12px rgba(105, 190, 40, 0.5)' 
                        : 'none',
                    }}
                  />
                ))}
              </motion.div>

              {/* Current step card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={spring}
                >
                  <GlassCard variant="green" padding="lg">
                    <div className="flex items-start" style={{ gap: 'var(--space-4)' }}>
                      {/* Step icon */}
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={springBouncy}
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '16px',
                          background: 'linear-gradient(135deg, rgba(105, 190, 40, 0.25) 0%, rgba(105, 190, 40, 0.1) 100%)',
                          border: '1px solid rgba(105, 190, 40, 0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#69BE28',
                          flexShrink: 0,
                          boxShadow: '0 8px 24px rgba(105, 190, 40, 0.15)',
                        }}
                      >
                        {(() => {
                          const StepIcon = steps[currentStep].icon
                          return <StepIcon size={28} />
                        })()}
                      </motion.div>
                      
                      {/* Step content */}
                      <div className="flex-1" style={{ minWidth: 0 }}>
                        <div 
                          style={{ 
                            fontSize: 'var(--text-micro)',
                            color: '#69BE28',
                            textTransform: 'uppercase',
                            letterSpacing: '0.15em',
                            fontWeight: 600,
                            marginBottom: 'var(--space-2)',
                          }}
                        >
                          Step {currentStep + 1} of {steps.length}
                        </div>
                        <h3 
                          style={{ 
                            fontSize: 'var(--text-subtitle)',
                            fontFamily: 'var(--font-oswald), sans-serif',
                            fontWeight: 700,
                            color: 'white',
                            marginBottom: 'var(--space-2)',
                          }}
                        >
                          {steps[currentStep].title}
                        </h3>
                        <p 
                          style={{ 
                            fontSize: 'var(--text-body)',
                            color: 'rgba(255,255,255,0.6)',
                            lineHeight: 1.5,
                          }}
                        >
                          {steps[currentStep].description}
                        </p>
                        
                        {/* Visual hint */}
                        <div 
                          style={{ 
                            marginTop: 'var(--space-4)',
                            padding: 'var(--space-2) var(--space-4)',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                          }}
                        >
                          <div 
                            style={{ 
                              width: '8px', 
                              height: '8px', 
                              borderRadius: '50%',
                              background: '#69BE28',
                            }} 
                          />
                          <span style={{ 
                            fontSize: 'var(--text-micro)', 
                            color: 'rgba(255,255,255,0.7)',
                            fontWeight: 500,
                          }}>
                            Look for: {steps[currentStep].highlight}
                          </span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="flex justify-between items-center"
                style={{ marginTop: 'var(--space-6)' }}
              >
                <GhostButton
                  size="md"
                  variant="subtle"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  icon={<ChevronLeft size={18} />}
                  iconPosition="left"
                  style={{ opacity: currentStep === 0 ? 0.3 : 1 }}
                >
                  Back
                </GhostButton>
                
                {currentStep < steps.length - 1 ? (
                  <GhostButton
                    size="md"
                    variant="green"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    icon={<ChevronRight size={18} />}
                  >
                    Next
                  </GhostButton>
                ) : (
                  <GradientButton
                    size="md"
                    onClick={handleContinue}
                    icon={<Check size={18} />}
                  >
                    Done
                  </GradientButton>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer 
        className="relative z-10 shrink-0"
        style={{ 
          padding: 'var(--space-6)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + var(--space-6))',
        }}
      >
        {!installComplete && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{ maxWidth: '400px', margin: '0 auto' }}
          >
            <GhostButton
              size="md"
              fullWidth
              variant="subtle"
              onClick={handleSkip}
            >
              Skip for Now
            </GhostButton>
            
            <p 
              className="text-center"
              style={{ 
                marginTop: 'var(--space-4)',
                fontSize: 'var(--text-micro)',
                color: 'rgba(255,255,255,0.4)',
                lineHeight: 1.5,
              }}
            >
              You can always install later from your browser menu
            </p>
          </motion.div>
        )}
      </footer>
    </div>
  )
}
