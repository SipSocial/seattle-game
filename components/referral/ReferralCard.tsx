'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Share2, Users, Gift, Copy, Check } from 'lucide-react'
import { GlassCard } from '../ui/GlassCard'
import { GradientButton } from '../ui/GradientButton'
import { Toast } from '../ui/Toast'
import { 
  useReferralStore, 
  formatReferralCode,
  getEntriesPerReferral,
  getMaxReferrals,
} from '@/src/v5/store/referralStore'

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }

export function ReferralCard() {
  const [copied, setCopied] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  
  const { 
    referralCode, 
    referralLink, 
    referralCount, 
    bonusEntries,
    initialize,
    generateReferralCode,
    getShareableLink,
  } = useReferralStore()
  
  // Initialize on mount
  useEffect(() => {
    if (!referralCode) {
      initialize()
    }
  }, [referralCode, initialize])
  
  // Handle share
  const handleShare = useCallback(async () => {
    const link = getShareableLink()
    
    // Check for Web Share API support
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Dark Side Football',
          text: `Use my referral code ${referralCode} to get bonus entries!`,
          url: link,
        })
        setToastMessage('Shared successfully!')
        setShowToast(true)
      } catch (err) {
        // User cancelled or error - fallback to copy
        if ((err as Error).name !== 'AbortError') {
          handleCopy()
        }
      }
    } else {
      // Fallback to copy
      handleCopy()
    }
  }, [referralCode, getShareableLink])
  
  // Handle copy to clipboard
  const handleCopy = useCallback(async () => {
    const link = getShareableLink()
    
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setToastMessage('Link copied to clipboard!')
      setShowToast(true)
      
      // Reset copied state after 2s
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = link
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      
      setCopied(true)
      setToastMessage('Link copied to clipboard!')
      setShowToast(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [getShareableLink])
  
  const formattedCode = referralCode ? formatReferralCode(referralCode) : '---'
  const entriesPerReferral = getEntriesPerReferral()
  const maxReferrals = getMaxReferrals()
  
  return (
    <>
      <GlassCard padding="lg" variant="default">
        {/* Header */}
        <div style={{ marginBottom: 'var(--space-fluid-md)' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '8px' }}>
            <Gift 
              size={20} 
              style={{ color: '#69BE28' }} 
            />
            <h3 
              className="font-bold uppercase tracking-wider"
              style={{ 
                fontSize: 'var(--text-subtitle)',
                color: 'rgba(255, 255, 255, 0.9)',
                fontFamily: 'var(--font-oswald), sans-serif',
              }}
            >
              Invite Friends
            </h3>
          </div>
          <p 
            style={{ 
              fontSize: 'var(--step-0)',
              color: 'rgba(255, 255, 255, 0.5)',
            }}
          >
            Earn {entriesPerReferral} bonus entries for each friend who joins (up to {maxReferrals} friends)
          </p>
        </div>
        
        {/* Referral Code Display */}
        <motion.div
          className="text-center"
          style={{
            padding: 'var(--space-fluid-md)',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '12px',
            marginBottom: 'var(--space-fluid-md)',
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
        >
          <span 
            className="text-[11px] uppercase tracking-widest block"
            style={{ 
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: '8px',
            }}
          >
            Your Referral Code
          </span>
          <div 
            className="font-black tracking-wide"
            style={{
              fontSize: 'var(--step-3)',
              color: '#69BE28',
              fontFamily: 'var(--font-oswald), sans-serif',
              letterSpacing: '0.15em',
            }}
          >
            {formattedCode}
          </div>
        </motion.div>
        
        {/* QR Code Placeholder */}
        <div
          className="flex items-center justify-center"
          style={{
            width: '120px',
            height: '120px',
            margin: '0 auto',
            marginBottom: 'var(--space-fluid-md)',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '2px dashed rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
          }}
        >
          <div className="text-center">
            <div 
              style={{ 
                fontSize: '32px',
                marginBottom: '4px',
              }}
            >
              📱
            </div>
            <span 
              className="text-[10px] uppercase tracking-wider"
              style={{ color: 'rgba(255, 255, 255, 0.3)' }}
            >
              QR Code
            </span>
          </div>
        </div>
        
        {/* Stats Row */}
        <div 
          className="flex justify-center"
          style={{ 
            gap: 'var(--space-fluid-lg)',
            marginBottom: 'var(--space-fluid-md)',
          }}
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-1" style={{ marginBottom: '4px' }}>
              <Users size={14} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
              <span 
                className="font-bold"
                style={{
                  fontSize: 'var(--step-2)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontFamily: 'var(--font-oswald), sans-serif',
                }}
              >
                {referralCount}
              </span>
            </div>
            <span 
              className="text-[10px] uppercase tracking-widest"
              style={{ color: 'rgba(255, 255, 255, 0.5)' }}
            >
              Friends Joined
            </span>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1" style={{ marginBottom: '4px' }}>
              <Gift size={14} style={{ color: '#69BE28' }} />
              <span 
                className="font-bold"
                style={{
                  fontSize: 'var(--step-2)',
                  color: '#69BE28',
                  fontFamily: 'var(--font-oswald), sans-serif',
                }}
              >
                {bonusEntries}
              </span>
            </div>
            <span 
              className="text-[10px] uppercase tracking-widest"
              style={{ color: 'rgba(255, 255, 255, 0.5)' }}
            >
              Bonus Entries
            </span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col" style={{ gap: '12px' }}>
          <GradientButton 
            size="lg" 
            fullWidth
            icon={<Share2 size={18} />}
            onClick={handleShare}
          >
            Share Your Code
          </GradientButton>
          
          <motion.button
            className="flex items-center justify-center gap-2 w-full"
            style={{
              height: '44px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '999px',
              fontSize: 'var(--step-0)',
              color: 'rgba(255, 255, 255, 0.8)',
              fontFamily: 'var(--font-oswald), sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              cursor: 'pointer',
            }}
            onClick={handleCopy}
            whileHover={{ 
              background: 'rgba(255, 255, 255, 0.12)',
              scale: 1.01,
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            {copied ? (
              <>
                <Check size={16} style={{ color: '#69BE28' }} />
                <span style={{ color: '#69BE28' }}>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Copy Link</span>
              </>
            )}
          </motion.button>
        </div>
      </GlassCard>
      
      {/* Toast */}
      <Toast
        message={toastMessage}
        variant="success"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={2500}
      />
    </>
  )
}

export default ReferralCard
