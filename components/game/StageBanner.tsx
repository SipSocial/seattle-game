'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, useStageBanner } from '@/src/store/gameStore'

export function StageBanner() {
  const { isOpen, cityName, stageId, gameInStage, totalGamesInStage } = useStageBanner()
  const hideStageBanner = useGameStore((s) => s.hideStageBanner)
  
  // Auto-dismiss after 2.5 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        hideStageBanner()
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [isOpen, hideStageBanner])
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed z-50 pointer-events-none"
          style={{
            top: 'max(100px, calc(env(safe-area-inset-top) + 80px))',
            left: 0,
            right: 0,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="mx-auto w-fit"
            initial={{ y: -50, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -30, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Banner container */}
            <div
              className="relative px-8 py-4 rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(0,34,68,0.95) 0%, rgba(0,20,40,0.98) 100%)',
                border: '2px solid rgba(105,190,40,0.4)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 60px rgba(105,190,40,0.1)',
              }}
            >
              {/* Decorative corner accents */}
              <div 
                className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 rounded-tl-lg"
                style={{ borderColor: '#69BE28' }}
              />
              <div 
                className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 rounded-tr-lg"
                style={{ borderColor: '#69BE28' }}
              />
              <div 
                className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 rounded-bl-lg"
                style={{ borderColor: '#69BE28' }}
              />
              <div 
                className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 rounded-br-lg"
                style={{ borderColor: '#69BE28' }}
              />
              
              {/* Glow overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at top, rgba(105,190,40,0.1) 0%, transparent 60%)',
                }}
              />
              
              {/* Content */}
              <div className="relative text-center">
                {/* City name */}
                <motion.h1
                  className="text-3xl font-black uppercase tracking-wider"
                  style={{
                    color: '#69BE28',
                    fontFamily: 'var(--font-oswald), system-ui, sans-serif',
                    textShadow: '0 0 30px rgba(105,190,40,0.4)',
                  }}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {cityName.toUpperCase()}
                </motion.h1>
                
                {/* Stage info */}
                <motion.div
                  className="flex items-center justify-center gap-3 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span
                    className="text-sm uppercase tracking-widest"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                  >
                    Stage {stageId}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
                  <span
                    className="text-sm uppercase tracking-widest"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                  >
                    Game {gameInStage}/{totalGamesInStage}
                  </span>
                </motion.div>
                
                {/* Progress dots */}
                <motion.div
                  className="flex items-center justify-center gap-2 mt-3"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {Array.from({ length: totalGamesInStage }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: i < gameInStage 
                          ? '#69BE28' 
                          : i === gameInStage - 1
                            ? '#69BE28'
                            : 'rgba(255,255,255,0.2)',
                        boxShadow: i < gameInStage 
                          ? '0 0 8px rgba(105,190,40,0.6)' 
                          : 'none',
                      }}
                      animate={i === gameInStage - 1 ? {
                        scale: [1, 1.3, 1],
                        boxShadow: [
                          '0 0 8px rgba(105,190,40,0.6)',
                          '0 0 16px rgba(105,190,40,0.8)',
                          '0 0 8px rgba(105,190,40,0.6)',
                        ],
                      } : undefined}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default StageBanner
