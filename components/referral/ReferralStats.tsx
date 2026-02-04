'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Gift, ChevronRight } from 'lucide-react'
import { GlassCard } from '../ui/GlassCard'
import { useReferralStore } from '@/src/v5/store/referralStore'

interface ReferralStatsProps {
  /** Link to full referral page */
  href?: string
  /** Callback when card is clicked */
  onClick?: () => void
  /** Show compact version */
  compact?: boolean
}

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }

export function ReferralStats({ 
  href, 
  onClick,
  compact = false,
}: ReferralStatsProps) {
  const { 
    referralCount, 
    bonusEntries, 
    initialize,
    referralCode,
    canEarnMoreEntries,
  } = useReferralStore()
  
  // Initialize on mount
  useEffect(() => {
    if (!referralCode) {
      initialize()
    }
  }, [referralCode, initialize])
  
  const canEarn = canEarnMoreEntries()
  
  // Compact version for inline display
  if (compact) {
    return (
      <motion.div
        className="flex items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={spring}
      >
        <div className="flex items-center gap-1">
          <Users size={14} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
          <span 
            className="font-bold"
            style={{
              fontSize: 'var(--step-0)',
              color: 'rgba(255, 255, 255, 0.9)',
              fontFamily: 'var(--font-oswald), sans-serif',
            }}
          >
            {referralCount}
          </span>
          <span 
            className="text-[11px]"
            style={{ color: 'rgba(255, 255, 255, 0.5)' }}
          >
            referrals
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <Gift size={14} style={{ color: '#69BE28' }} />
          <span 
            className="font-bold"
            style={{
              fontSize: 'var(--step-0)',
              color: '#69BE28',
              fontFamily: 'var(--font-oswald), sans-serif',
            }}
          >
            +{bonusEntries}
          </span>
          <span 
            className="text-[11px]"
            style={{ color: 'rgba(255, 255, 255, 0.5)' }}
          >
            entries
          </span>
        </div>
      </motion.div>
    )
  }
  
  // Full card version
  const CardWrapper = href ? 'a' : 'div'
  const cardProps = href 
    ? { href, style: { display: 'block', textDecoration: 'none' } }
    : onClick 
      ? { onClick, style: { cursor: 'pointer' } }
      : {}
  
  return (
    <CardWrapper {...cardProps}>
      <GlassCard 
        padding="md" 
        hover={!!(href || onClick)}
        variant="default"
      >
        <div className="flex items-center justify-between">
          {/* Left: Icon and Label */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center"
              style={{
                width: '40px',
                height: '40px',
                background: 'rgba(105, 190, 40, 0.15)',
                borderRadius: '10px',
              }}
            >
              <Gift size={20} style={{ color: '#69BE28' }} />
            </div>
            
            <div>
              <h4 
                className="font-bold uppercase tracking-wide"
                style={{ 
                  fontSize: 'var(--step-0)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontFamily: 'var(--font-oswald), sans-serif',
                  marginBottom: '2px',
                }}
              >
                Referral Rewards
              </h4>
              <p 
                style={{ 
                  fontSize: 'var(--text-caption)',
                  color: 'rgba(255, 255, 255, 0.5)',
                }}
              >
                {canEarn 
                  ? 'Invite friends to earn bonus entries'
                  : 'Maximum bonus entries reached!'
                }
              </p>
            </div>
          </div>
          
          {/* Right: Stats and Arrow */}
          <div className="flex items-center gap-4">
            {/* Stats */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div 
                  className="font-bold"
                  style={{
                    fontSize: 'var(--step-1)',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontFamily: 'var(--font-oswald), sans-serif',
                    lineHeight: 1,
                  }}
                >
                  {referralCount}
                </div>
                <span 
                  className="text-[10px] uppercase tracking-wider"
                  style={{ color: 'rgba(255, 255, 255, 0.4)' }}
                >
                  Friends
                </span>
              </div>
              
              <div 
                style={{ 
                  width: '1px', 
                  height: '24px', 
                  background: 'rgba(255, 255, 255, 0.1)' 
                }} 
              />
              
              <div className="text-right">
                <div 
                  className="font-bold"
                  style={{
                    fontSize: 'var(--step-1)',
                    color: '#69BE28',
                    fontFamily: 'var(--font-oswald), sans-serif',
                    lineHeight: 1,
                  }}
                >
                  +{bonusEntries}
                </div>
                <span 
                  className="text-[10px] uppercase tracking-wider"
                  style={{ color: 'rgba(255, 255, 255, 0.4)' }}
                >
                  Entries
                </span>
              </div>
            </div>
            
            {/* Arrow */}
            {(href || onClick) && (
              <ChevronRight 
                size={20} 
                style={{ color: 'rgba(255, 255, 255, 0.3)' }} 
              />
            )}
          </div>
        </div>
      </GlassCard>
    </CardWrapper>
  )
}

export default ReferralStats
