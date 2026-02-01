'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, useBossIntro } from '@/src/store/gameStore'

export function BossIntro() {
  const { isOpen, bossName, bossType } = useBossIntro()
  const hideBossIntro = useGameStore((s) => s.hideBossIntro)
  
  // Auto-dismiss after 3 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        hideBossIntro()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOpen, hideBossIntro])
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Dark vignette overlay */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.9) 100%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          
          {/* Pulsing red glow */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(229,57,53,0.2) 0%, transparent 60%)',
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          
          {/* Lightning flashes */}
          <motion.div
            className="absolute inset-0 bg-white pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.3, 0, 0.15, 0],
            }}
            transition={{
              duration: 0.5,
              times: [0, 0.1, 0.3, 0.4, 0.5],
            }}
          />
          
          {/* Content */}
          <div className="relative z-10 text-center px-8">
            {/* Warning icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              style={{ marginBottom: '24px' }}
            >
              <motion.div
                className="inline-flex items-center justify-center w-24 h-24 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(229,57,53,0.3) 0%, rgba(229,57,53,0.1) 100%)',
                  border: '3px solid #E53935',
                  boxShadow: '0 0 40px rgba(229,57,53,0.5)',
                }}
                animate={{
                  boxShadow: [
                    '0 0 40px rgba(229,57,53,0.5)',
                    '0 0 80px rgba(229,57,53,0.8)',
                    '0 0 40px rgba(229,57,53,0.5)',
                  ],
                }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <svg 
                  className="w-12 h-12" 
                  viewBox="0 0 24 24" 
                  fill="#E53935"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              </motion.div>
            </motion.div>
            
            {/* BOSS WAVE text */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <motion.h1
                className="text-4xl font-black uppercase tracking-wider"
                style={{
                  fontFamily: 'var(--font-oswald), sans-serif',
                  background: 'linear-gradient(135deg, #E53935 0%, #FF6B6B 50%, #E53935 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
                animate={{
                  textShadow: [
                    '0 0 60px rgba(229,57,53,0.5)',
                    '0 0 100px rgba(229,57,53,0.8)',
                    '0 0 60px rgba(229,57,53,0.5)',
                  ],
                }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                BOSS WAVE
              </motion.h1>
            </motion.div>
            
            {/* Decorative line */}
            <motion.div
              className="flex items-center justify-center"
              style={{ gap: '16px', marginTop: '16px', marginBottom: '16px' }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <div className="h-0.5 w-20 bg-gradient-to-r from-transparent to-[#E53935]" />
              <motion.div
                className="w-3 h-3 rotate-45 bg-[#E53935]"
                animate={{ rotate: [45, 225, 45] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
              <div className="h-0.5 w-20 bg-gradient-to-l from-transparent to-[#E53935]" />
            </motion.div>
            
            {/* Boss name */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h2
                className="text-2xl font-bold uppercase tracking-wider"
                style={{
                  color: '#FFD700',
                  fontFamily: 'var(--font-oswald), sans-serif',
                  textShadow: '0 0 20px rgba(255,215,0,0.5)',
                }}
              >
                {bossName || 'Unknown Threat'}
              </h2>
              {bossType && (
                <p
                  className="text-sm uppercase tracking-widest"
                  style={{ color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}
                >
                  {bossType}
                </p>
              )}
            </motion.div>
            
            {/* Get ready text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-sm uppercase tracking-widest"
              style={{ color: 'rgba(255,255,255,0.4)', marginTop: '40px' }}
            >
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Get Ready...
              </motion.span>
            </motion.p>
          </div>
          
          {/* Screen shake effect container */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              x: [0, -3, 3, -2, 2, 0],
              y: [0, 2, -2, 3, -1, 0],
            }}
            transition={{
              duration: 0.4,
              delay: 0.1,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default BossIntro
