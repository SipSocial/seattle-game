'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { Share2, Copy, MessageCircle, Check } from 'lucide-react'
import { ShareCard } from './ShareCard'

export interface ShareSheetProps {
  isOpen: boolean
  onClose: () => void
  shareData: {
    title: string
    text: string
    url: string
  }
  variant?: 'game-result' | 'referral' | 'general'
  cardData?: {
    score?: number
    mode?: 'qb' | 'defense'
    referralCode?: string
    message?: string
  }
}

// Haptic feedback helper
const triggerHaptic = (pattern: number | number[] = 10) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern)
  }
}

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }

// Twitter/X icon component
function TwitterIcon({ size = 20 }: { size?: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

// Instagram icon component
function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

interface ShareOption {
  id: string
  label: string
  icon: React.ReactNode
  gradient?: string
  onClick: () => void
  available?: boolean
}

export function ShareSheet({ 
  isOpen, 
  onClose, 
  shareData, 
  variant = 'general',
  cardData,
}: ShareSheetProps) {
  const [copied, setCopied] = useState(false)
  const [canNativeShare, setCanNativeShare] = useState(false)
  
  // Check for native share support
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      setCanNativeShare(true)
    }
  }, [])
  
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])
  
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])
  
  const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      triggerHaptic()
      onClose()
    }
  }, [onClose])
  
  // Native share
  const handleNativeShare = useCallback(async () => {
    triggerHaptic()
    try {
      await navigator.share({
        title: shareData.title,
        text: shareData.text,
        url: shareData.url,
      })
    } catch (err) {
      // User cancelled or error - silent fail
      console.log('Share cancelled or failed:', err)
    }
  }, [shareData])
  
  // Copy link
  const handleCopyLink = useCallback(async () => {
    triggerHaptic([10, 50, 10])
    try {
      await navigator.clipboard.writeText(shareData.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [shareData.url])
  
  // Twitter/X share
  const handleTwitterShare = useCallback(() => {
    triggerHaptic()
    const text = encodeURIComponent(`${shareData.text}`)
    const url = encodeURIComponent(shareData.url)
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      '_blank',
      'noopener,noreferrer'
    )
  }, [shareData])
  
  // Instagram Stories (deep link)
  const handleInstagramShare = useCallback(() => {
    triggerHaptic()
    // Instagram Stories URL scheme
    // Note: This only works on mobile when Instagram is installed
    const instagramUrl = `instagram-stories://share?source_application=darksideapp`
    
    // Try to open Instagram, fallback to regular Instagram
    const timeout = setTimeout(() => {
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer')
    }, 500)
    
    window.location.href = instagramUrl
    
    // If we're still here after a moment, the app didn't open
    window.addEventListener('blur', () => clearTimeout(timeout), { once: true })
  }, [])
  
  // SMS share
  const handleSMSShare = useCallback(() => {
    triggerHaptic()
    const body = encodeURIComponent(`${shareData.text} ${shareData.url}`)
    window.location.href = `sms:?body=${body}`
  }, [shareData])
  
  // Build share options
  const shareOptions: ShareOption[] = [
    ...(canNativeShare ? [{
      id: 'native',
      label: 'Share',
      icon: <Share2 size={22} />,
      gradient: 'linear-gradient(135deg, #69BE28 0%, #4a8c1c 100%)',
      onClick: handleNativeShare,
      available: true,
    }] : []),
    {
      id: 'copy',
      label: copied ? 'Copied!' : 'Copy Link',
      icon: copied ? <Check size={22} /> : <Copy size={22} />,
      gradient: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      onClick: handleCopyLink,
      available: true,
    },
    {
      id: 'twitter',
      label: 'X / Twitter',
      icon: <TwitterIcon size={22} />,
      gradient: 'linear-gradient(135deg, #1a1a1a 0%, #000 100%)',
      onClick: handleTwitterShare,
      available: true,
    },
    {
      id: 'instagram',
      label: 'Instagram',
      icon: <InstagramIcon size={22} />,
      gradient: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #F77737 100%)',
      onClick: handleInstagramShare,
      available: true,
    },
    {
      id: 'sms',
      label: 'Messages',
      icon: <MessageCircle size={22} />,
      gradient: 'linear-gradient(135deg, #34C759 0%, #248A3D 100%)',
      onClick: handleSMSShare,
      available: true,
    },
  ]
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50"
            style={{
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          
          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50"
            style={{
              background: 'rgba(0, 34, 68, 0.98)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderBottom: 'none',
              paddingBottom: 'env(safe-area-inset-bottom, 24px)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={spring}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.1, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div
                className="rounded-full"
                style={{
                  width: '36px',
                  height: '5px',
                  background: 'rgba(255, 255, 255, 0.3)',
                }}
              />
            </div>
            
            {/* Title */}
            <div
              className="px-6 pb-4 pt-2 text-center"
              style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              <h2
                className="font-bold uppercase tracking-wider"
                style={{
                  fontSize: 'var(--step-1)',
                  fontFamily: 'var(--font-oswald), sans-serif',
                  color: 'rgba(255, 255, 255, 0.9)',
                }}
              >
                Share
              </h2>
            </div>
            
            {/* Content */}
            <div className="px-6 py-6">
              {/* Preview Card */}
              <div style={{ marginBottom: '24px' }}>
                <ShareCard variant={variant} data={cardData} />
              </div>
              
              {/* Share options grid */}
              <div
                className="grid"
                style={{
                  gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
                  gap: '12px',
                }}
              >
                {shareOptions.filter(o => o.available).map((option, index) => (
                  <motion.button
                    key={option.id}
                    className="flex flex-col items-center justify-center rounded-2xl"
                    style={{
                      padding: '16px 8px',
                      background: option.gradient,
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      cursor: 'pointer',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...spring, delay: index * 0.05 }}
                    whileHover={{ scale: 1.05, borderColor: 'rgba(255, 255, 255, 0.2)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={option.onClick}
                  >
                    <div
                      className="flex items-center justify-center"
                      style={{
                        color: 'rgba(255, 255, 255, 0.95)',
                        marginBottom: '8px',
                      }}
                    >
                      {option.icon}
                    </div>
                    <span
                      className="text-center whitespace-nowrap"
                      style={{
                        fontSize: 'var(--text-caption)',
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontFamily: 'var(--font-oswald), sans-serif',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {option.label}
                    </span>
                  </motion.button>
                ))}
              </div>
              
              {/* Cancel button */}
              <motion.button
                className="w-full mt-6 rounded-full"
                style={{
                  padding: '14px 24px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                }}
                whileHover={{ background: 'rgba(255, 255, 255, 0.1)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  triggerHaptic()
                  onClose()
                }}
              >
                <span
                  className="uppercase tracking-wider font-semibold"
                  style={{
                    fontSize: 'var(--text-body)',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontFamily: 'var(--font-oswald), sans-serif',
                  }}
                >
                  Cancel
                </span>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ShareSheet
