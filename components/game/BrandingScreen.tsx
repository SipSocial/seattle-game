'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, useBrandingScreen } from '@/src/store/gameStore'

export function BrandingScreen() {
  const { isOpen } = useBrandingScreen()
  const hideBrandingScreen = useGameStore((s) => s.hideBrandingScreen)
  
  // Auto-dismiss after 2.5 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        hideBrandingScreen()
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [isOpen, hideBrandingScreen])
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{
            background: 'linear-gradient(180deg, #001020 0%, #002244 50%, #001020 100%)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
        >
          {/* Animated background glow */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(105,190,40,0.15) 0%, transparent 60%)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          
          {/* Content */}
          <div className="relative z-10 text-center">
            {/* Large 12 */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay: 0.2,
              }}
            >
              <motion.div
                className="text-[140px] font-black leading-none"
                style={{
                  color: '#69BE28',
                  fontFamily: 'var(--font-bebas), var(--font-oswald), sans-serif',
                  textShadow: '0 0 80px rgba(105,190,40,0.6), 0 0 120px rgba(105,190,40,0.3)',
                }}
                animate={{
                  textShadow: [
                    '0 0 80px rgba(105,190,40,0.6), 0 0 120px rgba(105,190,40,0.3)',
                    '0 0 100px rgba(105,190,40,0.8), 0 0 160px rgba(105,190,40,0.5)',
                    '0 0 80px rgba(105,190,40,0.6), 0 0 120px rgba(105,190,40,0.3)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                12
              </motion.div>
            </motion.div>
            
            {/* DARK SIDE */}
            <motion.h1
              className="text-4xl font-black uppercase tracking-[0.2em]"
              style={{
                color: '#fff',
                fontFamily: 'var(--font-bebas), var(--font-oswald), sans-serif',
                marginTop: '8px',
              }}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              DARK SIDE
            </motion.h1>
            
            {/* GAME */}
            <motion.h2
              className="text-2xl font-bold uppercase tracking-[0.4em]"
              style={{
                color: '#69BE28',
                fontFamily: 'var(--font-oswald), sans-serif',
                marginTop: '4px',
              }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              GAME
            </motion.h2>
            
            {/* Decorative lines */}
            <motion.div
              className="flex items-center justify-center mt-10"
              style={{ gap: '24px' }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div className="h-px w-24 bg-gradient-to-r from-transparent to-[#69BE28]" />
              <motion.div
                className="w-2 h-2 rounded-full bg-[#69BE28]"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <div className="h-px w-24 bg-gradient-to-l from-transparent to-[#69BE28]" />
            </motion.div>
            
            {/* Tagline */}
            <motion.p
              className="text-sm uppercase tracking-[0.2em]"
              style={{ color: 'rgba(255,255,255,0.5)', marginTop: '24px' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              &ldquo;Turn the lights off on them&rdquo;
            </motion.p>
          </div>
          
          {/* Sponsor footer */}
          <motion.div
            className="absolute left-0 right-0 text-center"
            style={{ bottom: '40px' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <p
              className="text-[10px] uppercase tracking-[0.3em]"
              style={{ color: 'rgba(255,215,0,0.4)' }}
            >
              Powered by
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="https://cdn.shopify.com/s/files/1/0407/8580/5468/files/DrinkSip_Logo_SVG.svg?v=1759624477"
              alt="DrinkSip"
              style={{ height: '40px', width: 'auto', margin: '8px auto 0', opacity: 0.7 }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default BrandingScreen
