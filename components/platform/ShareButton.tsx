'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useV3GameStore } from '@/src/v3/store/v3GameStore'

interface ShareButtonProps {
  score?: number
  gamesWon?: number
  week?: number
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  onShare?: () => void
}

export function ShareButton({
  score,
  gamesWon,
  week,
  variant = 'primary',
  size = 'md',
  onShare,
}: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false)
  const [hasShared, setHasShared] = useState(false)
  
  const { addEntry, entries } = useV3GameStore()
  
  // Check if already shared this session
  const alreadyShared = entries.some(e => e.type === 'share')
  
  const handleShare = async () => {
    setIsSharing(true)
    
    const shareData = {
      title: 'Dark Side Football',
      text: score 
        ? `I scored ${score.toLocaleString()} points in Dark Side Football! Can you beat me? 🏈`
        : `I'm on my way to Super Bowl LX in Dark Side Football! 🏈`,
      url: typeof window !== 'undefined' ? window.location.origin : 'https://darksidefootball.com',
    }
    
    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData)
        // Add share entry
        addEntry('share')
        setHasShared(true)
        onShare?.()
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`)
        addEntry('share')
        setHasShared(true)
        onShare?.()
      }
    } catch (err) {
      // User cancelled or error - don't add entry
      console.log('Share cancelled or failed')
    } finally {
      setIsSharing(false)
    }
  }
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-xs gap-1',
    md: 'px-4 py-3 text-sm gap-2',
    lg: 'px-6 py-4 text-base gap-2',
  }
  
  const getStyles = () => {
    if (hasShared || alreadyShared) {
      return {
        background: 'rgba(105,190,40,0.2)',
        border: '1px solid rgba(105,190,40,0.3)',
        color: 'var(--seahawks-green)',
      }
    }
    
    switch (variant) {
      case 'primary':
        return {
          background: 'linear-gradient(135deg, var(--seahawks-green) 0%, var(--seahawks-green-dark) 100%)',
          color: 'white',
          boxShadow: '0 4px 20px rgba(105,190,40,0.4)',
        }
      case 'secondary':
        return {
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: 'white',
        }
      case 'ghost':
        return {
          background: 'transparent',
          border: '2px solid var(--seahawks-grey)',
          color: 'var(--seahawks-grey)',
        }
    }
  }
  
  return (
    <motion.button
      onClick={handleShare}
      disabled={isSharing}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center justify-center rounded-xl font-bold uppercase tracking-wider transition-all ${sizeClasses[size]}`}
      style={{
        fontFamily: 'var(--font-oswald)',
        ...getStyles(),
      }}
    >
      {isSharing ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : hasShared || alreadyShared ? (
        <>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Shared
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
          {!alreadyShared && (
            <span className="text-xs opacity-60">+1 entry</span>
          )}
        </>
      )}
    </motion.button>
  )
}
