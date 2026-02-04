'use client'

/**
 * PrizeCard - Premium prize display card with countdown and status
 * 
 * Features:
 * - Prize image and details
 * - 7-day claim countdown with urgency colors
 * - Status badge (Pending, Claimed, Expired, Declined)
 * - "Claim Now" CTA or status indicator
 * - Glassmorphic design
 */

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { 
  Claim, 
  ClaimStatus,
  formatClaimCountdown, 
  getStatusDisplay 
} from '@/src/v5/store/claimStore'

interface PrizeCardProps {
  claim: Claim
  onClaim?: () => void
  compact?: boolean
}

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }

// Countdown component with live updates
function ClaimCountdown({ expiresAt }: { expiresAt: number }) {
  const [timeLeft, setTimeLeft] = useState(0)
  
  useEffect(() => {
    const calculate = () => {
      const now = Date.now()
      setTimeLeft(Math.max(0, expiresAt - now))
    }
    
    calculate()
    const interval = setInterval(calculate, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [expiresAt])
  
  // Determine urgency color
  const getUrgencyColor = () => {
    const hoursLeft = timeLeft / (1000 * 60 * 60)
    if (hoursLeft <= 6) return '#EF4444'  // Red - critical
    if (hoursLeft <= 24) return '#F59E0B' // Orange - warning
    if (hoursLeft <= 48) return '#FBBF24' // Yellow - attention
    return '#69BE28'                       // Green - plenty of time
  }
  
  if (timeLeft <= 0) {
    return (
      <span style={{ color: '#EF4444', fontWeight: 600 }}>
        Expired
      </span>
    )
  }
  
  return (
    <span style={{ color: getUrgencyColor(), fontWeight: 600 }}>
      {formatClaimCountdown(timeLeft)}
    </span>
  )
}

// Status badge component
function StatusBadge({ status }: { status: ClaimStatus }) {
  const display = getStatusDisplay(status)
  
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 10px',
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        color: display.color,
        background: display.bg,
        borderRadius: '12px',
        border: `1px solid ${display.color}30`,
      }}
    >
      {status === 'pending' && <span style={{ fontSize: '8px' }}>●</span>}
      {status === 'shipped' && <span>📦</span>}
      {display.label}
    </span>
  )
}

// Tier badge
function TierBadge({ tier }: { tier: 'grand' | 'major' | 'minor' }) {
  const tierConfig = {
    grand: { label: 'Grand Prize', color: '#FFD700', emoji: '🏆' },
    major: { label: 'Major Prize', color: '#C0C0C0', emoji: '🎖️' },
    minor: { label: 'Prize', color: '#CD7F32', emoji: '🎁' },
  }
  
  const config = tierConfig[tier]
  
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '10px',
        fontWeight: 600,
        letterSpacing: '0.05em',
        color: config.color,
      }}
    >
      <span>{config.emoji}</span>
      {config.label.toUpperCase()}
    </span>
  )
}

export function PrizeCard({ claim, onClaim, compact = false }: PrizeCardProps) {
  const { prize, status, expiresAt } = claim
  const isPending = status === 'pending'
  
  if (compact) {
    // Compact version for history list
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
      >
        <GlassCard 
          variant={isPending ? 'green' : 'default'} 
          padding="md"
          hover={isPending}
        >
          <div className="flex items-center gap-4">
            {/* Prize image */}
            <div
              className="shrink-0 rounded-xl flex items-center justify-center"
              style={{
                width: '56px',
                height: '56px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <span style={{ fontSize: '28px' }}>
                {prize.tier === 'grand' ? '🏆' : prize.tier === 'major' ? '🎖️' : '🎁'}
              </span>
            </div>
            
            {/* Details */}
            <div className="flex-1 min-w-0">
              <h3
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'white',
                  marginBottom: '4px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {prize.name}
              </h3>
              <div className="flex items-center gap-2">
                <StatusBadge status={status} />
                {isPending && (
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                    <ClaimCountdown expiresAt={expiresAt} />
                  </span>
                )}
              </div>
            </div>
            
            {/* Action */}
            {isPending && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onClaim}
                style={{
                  padding: '8px 16px',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: '#002244',
                  background: '#69BE28',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                }}
              >
                Claim
              </motion.button>
            )}
          </div>
        </GlassCard>
      </motion.div>
    )
  }
  
  // Full card version
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
    >
      <GlassCard 
        variant={isPending ? 'green' : 'default'} 
        padding="none"
        style={{
          overflow: 'hidden',
          boxShadow: isPending 
            ? '0 8px 32px rgba(105, 190, 40, 0.2)' 
            : undefined,
        }}
      >
        {/* Prize Image Header */}
        <div
          className="relative flex items-center justify-center"
          style={{
            height: '160px',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)',
          }}
        >
          {/* Glow effect for pending */}
          {isPending && (
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(circle at center, rgba(105, 190, 40, 0.1) 0%, transparent 70%)',
              }}
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
          
          {/* Prize emoji/image */}
          <motion.span 
            style={{ fontSize: '72px' }}
            animate={isPending ? {
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0],
            } : undefined}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {prize.tier === 'grand' ? '🏆' : prize.tier === 'major' ? '🎖️' : '🎁'}
          </motion.span>
          
          {/* Tier badge */}
          <div className="absolute top-4 left-4">
            <TierBadge tier={prize.tier} />
          </div>
          
          {/* Status badge */}
          <div className="absolute top-4 right-4">
            <StatusBadge status={status} />
          </div>
        </div>
        
        {/* Prize Details */}
        <div style={{ padding: '20px' }}>
          <h2
            style={{
              fontSize: 'var(--step-2)',
              fontWeight: 900,
              fontFamily: 'var(--font-oswald), sans-serif',
              letterSpacing: '0.02em',
              color: 'white',
              marginBottom: '8px',
            }}
          >
            {prize.name}
          </h2>
          
          <p
            style={{
              fontSize: '14px',
              lineHeight: 1.5,
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '16px',
            }}
          >
            {prize.description}
          </p>
          
          {/* Countdown for pending */}
          {isPending && (
            <div
              className="flex items-center justify-between p-4 rounded-xl mb-4"
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '16px' }}>⏰</span>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                  Claim by
                </span>
              </div>
              <div style={{ fontSize: '14px' }}>
                <ClaimCountdown expiresAt={expiresAt} />
              </div>
            </div>
          )}
          
          {/* Claim button for pending */}
          {isPending && onClaim && (
            <GradientButton
              size="lg"
              fullWidth
              onClick={onClaim}
              icon={<span style={{ fontSize: '16px' }}>🎉</span>}
            >
              Claim This Prize
            </GradientButton>
          )}
          
          {/* Shipping info for claimed/shipped */}
          {(status === 'claimed' || status === 'shipped') && claim.shippingAddress && (
            <div
              className="p-4 rounded-xl"
              style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span style={{ fontSize: '14px' }}>📍</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#3B82F6' }}>
                  Shipping To
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                {claim.shippingAddress.name}<br />
                {claim.shippingAddress.addressLine1}<br />
                {claim.shippingAddress.addressLine2 && <>{claim.shippingAddress.addressLine2}<br /></>}
                {claim.shippingAddress.city}, {claim.shippingAddress.state} {claim.shippingAddress.zip}
              </p>
              
              {claim.trackingNumber && (
                <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                    Tracking: 
                  </span>
                  <span style={{ fontSize: '11px', color: '#3B82F6', marginLeft: '4px' }}>
                    {claim.trackingNumber}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  )
}

export default PrizeCard
