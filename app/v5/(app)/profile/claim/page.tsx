'use client'

/**
 * Claim Center - Prize claim page with Coinbase-level polish
 * 
 * Features:
 * - "Your Prizes" header with back navigation
 * - Notification banner for pending claims
 * - Available prizes with claim buttons
 * - Claimed history with status badges
 * - Empty state with encouraging message
 */

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { GhostButton } from '@/components/ui/GhostButton'
import { GradientButton } from '@/components/ui/GradientButton'
import { PrizeCard } from '@/components/claim/PrizeCard'
import { ClaimSheet } from '@/components/claim/ClaimSheet'
import { 
  useClaimStore, 
  Claim,
  createDemoClaim,
} from '@/src/v5/store/claimStore'
import { 
  Gift, 
  Trophy, 
  Sparkles, 
  ClipboardList, 
  ArrowLeft, 
  Gamepad2,
  Target,
  Plus
} from 'lucide-react'

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }

// Empty state component
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className="text-center"
      style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ ...spring, delay: 0.2 }}
        className="flex justify-center"
        style={{ marginBottom: 'var(--space-4)' }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.05))',
            border: '2px solid rgba(255, 215, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Gift className="w-10 h-10" style={{ color: '#FFD700' }} />
        </div>
      </motion.div>
      
      <h2
        style={{
          fontSize: 'var(--text-subtitle)',
          fontWeight: 700,
          color: 'white',
          fontFamily: 'var(--font-oswald), sans-serif',
          marginBottom: 'var(--space-2)',
        }}
      >
        No Prizes Yet
      </h2>
      
      <p
        style={{
          fontSize: 'var(--text-body)',
          color: 'rgba(255,255,255,0.6)',
          marginBottom: 'var(--space-6)',
          maxWidth: '280px',
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: 1.6,
        }}
      >
        Keep playing Dark Side Defense and completing your picks to earn more entries!
      </p>
      
      <GlassCard variant="green" padding="md" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="flex items-center" style={{ gap: 'var(--space-4)' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(105, 190, 40, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Trophy className="w-6 h-6" style={{ color: '#69BE28' }} />
          </div>
          <div className="text-left flex-1">
            <p style={{ fontSize: 'var(--text-body)', fontWeight: 600, color: 'white' }}>
              Increase Your Chances
            </p>
            <p style={{ fontSize: 'var(--text-caption)', color: 'rgba(255,255,255,0.6)' }}>
              Each game you play earns more entries into the Big Game Giveaway!
            </p>
          </div>
        </div>
      </GlassCard>
      
      <div className="flex" style={{ gap: 'var(--space-3)' }}>
        <Link href="/v5/game" className="flex-1" style={{ textDecoration: 'none' }}>
          <GradientButton size="md" fullWidth icon={<Gamepad2 className="w-4 h-4" />} iconPosition="left">
            Play Game
          </GradientButton>
        </Link>
        <Link href="/v5/picks" className="flex-1" style={{ textDecoration: 'none' }}>
          <GhostButton size="md" fullWidth variant="green" icon={<Target className="w-4 h-4" />} iconPosition="left">
            Make Picks
          </GhostButton>
        </Link>
      </div>
    </motion.div>
  )
}

// Section header component
function SectionHeader({ 
  title, 
  count,
  icon,
}: { 
  title: string
  count?: number
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-4)' }}>
      <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
        {icon && <span>{icon}</span>}
        <h2
          style={{
            fontSize: 'var(--text-body)',
            fontWeight: 700,
            color: 'white',
            letterSpacing: '0.02em',
          }}
        >
          {title}
        </h2>
        {count !== undefined && count > 0 && (
          <span
            style={{
              padding: '2px 8px',
              fontSize: 'var(--text-micro)',
              fontWeight: 700,
              color: '#002244',
              background: '#69BE28',
              borderRadius: '10px',
            }}
          >
            {count}
          </span>
        )}
      </div>
    </div>
  )
}

// Tab selector for filtering history
function TabSelector({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: { id: string; label: string }[]
  activeTab: string
  onChange: (id: string) => void
}) {
  return (
    <div
      className="flex p-1 rounded-xl"
      style={{
        gap: '4px',
        marginBottom: 'var(--space-4)',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            flex: 1,
            padding: '8px 12px',
            fontSize: 'var(--text-caption)',
            fontWeight: 600,
            letterSpacing: '0.05em',
            color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.5)',
            background: activeTab === tab.id ? 'rgba(105, 190, 40, 0.2)' : 'transparent',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
          }}
          whileTap={{ scale: 0.98 }}
        >
          {tab.label}
        </motion.button>
      ))}
    </div>
  )
}

export default function ClaimCenterPage() {
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [historyTab, setHistoryTab] = useState<'all' | 'claimed' | 'other'>('all')
  
  const {
    getPendingClaims,
    getHistoryClaims,
    addClaim,
    showConfetti,
    setShowConfetti,
  } = useClaimStore()
  
  const pendingClaims = getPendingClaims()
  const historyClaims = getHistoryClaims()
  
  // Filter history based on tab
  const filteredHistory = historyClaims.filter((claim) => {
    if (historyTab === 'all') return true
    if (historyTab === 'claimed') return claim.status === 'claimed' || claim.status === 'shipped'
    return claim.status === 'expired' || claim.status === 'declined'
  })
  
  // Handle opening claim sheet
  const handleOpenClaim = useCallback((claim: Claim) => {
    setSelectedClaim(claim)
    setIsSheetOpen(true)
  }, [])
  
  // Handle closing claim sheet
  const handleCloseSheet = useCallback(() => {
    setIsSheetOpen(false)
    // Clear selection after animation
    setTimeout(() => setSelectedClaim(null), 300)
  }, [])
  
  // Clear confetti after animation
  useEffect(() => {
    if (showConfetti) {
      const timeout = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timeout)
    }
  }, [showConfetti, setShowConfetti])
  
  // For demo: Add demo claim button (only in development)
  const handleAddDemoClaim = useCallback(() => {
    const demoClaim = createDemoClaim()
    addClaim(demoClaim)
  }, [addClaim])
  
  const hasNoClaims = pendingClaims.length === 0 && historyClaims.length === 0
  
  return (
    <div
      className="min-h-full"
      style={{
        background: 'linear-gradient(180deg, #000A14 0%, #001428 100%)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 100px)',
      }}
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="sticky top-0 z-40"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
          paddingBottom: '16px',
          paddingLeft: 'var(--space-4)',
          paddingRight: 'var(--space-4)',
          background: 'linear-gradient(180deg, rgba(0, 10, 20, 0.98) 0%, rgba(0, 10, 20, 0.9) 80%, transparent 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center" style={{ gap: 'var(--space-4)' }}>
          <Link href="/v5/profile">
            <motion.div
              className="flex items-center justify-center"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              whileHover={{ background: 'rgba(255, 255, 255, 0.12)' }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </motion.div>
          </Link>
          
          <h1
            style={{
              fontSize: 'var(--text-subtitle)',
              fontWeight: 700,
              fontFamily: 'var(--font-oswald), sans-serif',
              color: 'white',
              letterSpacing: '0.1em',
            }}
          >
            YOUR PRIZES
          </h1>
        </div>
      </motion.header>

      {/* Content */}
      <div style={{ padding: '0 var(--space-5)' }}>
        {/* Notification Banner for pending claims */}
        <AnimatePresence>
          {pendingClaims.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={spring}
              style={{ marginBottom: 'var(--space-6)' }}
            >
              <GlassCard 
                variant="green" 
                padding="md"
                style={{
                  boxShadow: '0 0 40px rgba(105, 190, 40, 0.2)',
                }}
              >
                <div className="flex items-center" style={{ gap: 'var(--space-4)' }}>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                    }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'rgba(105, 190, 40, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Sparkles className="w-6 h-6" style={{ color: '#69BE28' }} />
                  </motion.div>
                  <div className="flex-1">
                    <p style={{ fontSize: 'var(--text-body)', fontWeight: 700, color: '#69BE28' }}>
                      Congratulations!
                    </p>
                    <p style={{ fontSize: 'var(--text-caption)', color: 'rgba(255,255,255,0.7)' }}>
                      You have {pendingClaims.length} prize{pendingClaims.length > 1 ? 's' : ''} waiting to be claimed!
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {hasNoClaims && <EmptyState />}

        {/* Pending Claims */}
        {pendingClaims.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.1 }}
            style={{ marginBottom: 'var(--space-8)' }}
          >
            <SectionHeader 
              title="Ready to Claim" 
              count={pendingClaims.length}
              icon={<Gift className="w-5 h-5" style={{ color: '#FFD700' }} />}
            />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {pendingClaims.map((claim, i) => (
                <motion.div
                  key={claim.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...spring, delay: 0.15 + i * 0.1 }}
                >
                  <PrizeCard 
                    claim={claim} 
                    onClaim={() => handleOpenClaim(claim)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* History */}
        {historyClaims.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.2 }}
          >
            <SectionHeader 
              title="Prize History" 
              icon={<ClipboardList className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.7)' }} />}
            />
            
            <TabSelector
              tabs={[
                { id: 'all', label: 'All' },
                { id: 'claimed', label: 'Claimed' },
                { id: 'other', label: 'Other' },
              ]}
              activeTab={historyTab}
              onChange={(id) => setHistoryTab(id as typeof historyTab)}
            />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <AnimatePresence mode="popLayout">
                {filteredHistory.map((claim) => (
                  <motion.div
                    key={claim.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={spring}
                  >
                    <PrizeCard 
                      claim={claim} 
                      compact
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {filteredHistory.length === 0 && (
                <p 
                  className="text-center"
                  style={{ 
                    paddingTop: 'var(--space-8)',
                    paddingBottom: 'var(--space-8)',
                    fontSize: 'var(--text-body)', 
                    color: 'rgba(255,255,255,0.4)',
                  }}
                >
                  No prizes in this category
                </p>
              )}
            </div>
          </motion.section>
        )}

        {/* Demo button - only show in development */}
        {process.env.NODE_ENV === 'development' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center"
            style={{ marginTop: 'var(--space-8)' }}
          >
            <motion.button
              onClick={handleAddDemoClaim}
              className="inline-flex items-center"
              style={{
                padding: '8px 16px',
                gap: 'var(--space-2)',
                fontSize: 'var(--text-micro)',
                color: 'rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.05)',
                border: '1px dashed rgba(255,255,255,0.1)',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
              whileHover={{ background: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4" />
              Add Demo Prize (Dev Only)
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Claim Sheet */}
      <ClaimSheet
        claim={selectedClaim}
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
      />
    </div>
  )
}
