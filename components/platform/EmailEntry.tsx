'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useV3GameStore } from '@/src/v3/store/v3GameStore'

interface EmailEntryProps {
  onComplete?: () => void
  title?: string
  subtitle?: string
  buttonText?: string
  showEntryCount?: boolean
}

export function EmailEntry({
  onComplete,
  title = 'Enter to Win',
  subtitle = 'Super Bowl LX Tickets',
  buttonText = 'Enter Now',
  showEntryCount = true,
}: EmailEntryProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const { setUserEmail, entries, user } = useV3GameStore()
  
  // If already entered with email, show success state
  const alreadyEntered = !!user.email
  
  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Store email locally (Supabase sync will come later)
      setUserEmail(email)
      setIsSuccess(true)
      
      // Small delay for animation
      setTimeout(() => {
        onComplete?.()
      }, 1500)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (alreadyEntered || isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm mx-auto text-center"
      >
        <div className="glass-card rounded-2xl p-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ background: 'var(--seahawks-green)' }}
          >
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          
          <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-oswald)' }}>
            You&apos;re In!
          </h3>
          <p className="text-white/60 text-sm mb-4">
            {user.email || email}
          </p>
          
          {showEntryCount && (
            <div className="flex items-center justify-center gap-2 text-sm">
              <span style={{ color: 'var(--seahawks-green)' }} className="font-bold">
                {entries.length}
              </span>
              <span className="text-white/60">
                {entries.length === 1 ? 'entry' : 'entries'} earned
              </span>
            </div>
          )}
        </div>
      </motion.div>
    )
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-sm mx-auto"
    >
      <div className="glass-card rounded-2xl p-6">
        <h2 
          className="text-2xl font-black text-center uppercase mb-1"
          style={{ fontFamily: 'var(--font-oswald)' }}
        >
          {title}
        </h2>
        <p 
          className="text-center mb-6"
          style={{ 
            fontFamily: 'var(--font-oswald)',
            color: 'var(--seahawks-green)',
            fontSize: 'var(--text-subtitle)',
          }}
        >
          {subtitle}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-all"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                fontSize: 'var(--text-body)',
              }}
              disabled={isSubmitting}
            />
            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm mt-2"
              >
                {error}
              </motion.p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || !email}
            className="w-full py-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-all disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, var(--seahawks-green) 0%, var(--seahawks-green-dark) 100%)',
              color: 'white',
              fontFamily: 'var(--font-oswald)',
              boxShadow: '0 4px 20px rgba(105,190,40,0.4)',
            }}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Entering...
              </span>
            ) : (
              buttonText
            )}
          </button>
        </form>
        
        <p className="text-center text-white/40 text-xs mt-4">
          Play games & share to earn more entries
        </p>
      </div>
    </motion.div>
  )
}
