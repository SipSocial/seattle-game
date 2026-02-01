'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useLoadingScreen } from '@/src/store/gameStore'

export function LoadingScreen() {
  const { isOpen, progress, message } = useLoadingScreen()
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{
            background: 'linear-gradient(180deg, #001428 0%, #002244 50%, #001428 100%)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Background pattern */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 50px,
                rgba(105,190,40,0.1) 50px,
                rgba(105,190,40,0.1) 51px
              )`,
            }}
          />
          
          {/* Content */}
          <div className="relative z-10 w-full px-8 text-center" style={{ maxWidth: '400px' }}>
            {/* 12 Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              style={{ marginBottom: '32px' }}
            >
              <div
                className="inline-flex items-center justify-center w-24 h-24 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(105,190,40,0.2) 0%, rgba(105,190,40,0.05) 100%)',
                  border: '3px solid rgba(105,190,40,0.4)',
                  boxShadow: '0 0 60px rgba(105,190,40,0.2)',
                }}
              >
                <motion.span
                  className="text-5xl font-black"
                  style={{
                    color: '#69BE28',
                    fontFamily: 'var(--font-bebas), var(--font-oswald), sans-serif',
                    textShadow: '0 0 30px rgba(105,190,40,0.5)',
                  }}
                  animate={{
                    textShadow: [
                      '0 0 30px rgba(105,190,40,0.5)',
                      '0 0 50px rgba(105,190,40,0.8)',
                      '0 0 30px rgba(105,190,40,0.5)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  12
                </motion.span>
              </div>
            </motion.div>
            
            {/* Title */}
            <motion.h1
              className="text-3xl font-black uppercase tracking-[0.15em]"
              style={{
                color: '#fff',
                fontFamily: 'var(--font-bebas), var(--font-oswald), sans-serif',
              }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              DARK SIDE
            </motion.h1>
            
            <motion.h2
              className="text-xl font-bold uppercase tracking-[0.2em]"
              style={{
                color: '#69BE28',
                fontFamily: 'var(--font-oswald), sans-serif',
                marginTop: '4px',
                marginBottom: '48px',
              }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              GAME
            </motion.h2>
            
            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #69BE28 0%, #8BD44A 50%, #69BE28 100%)',
                    backgroundSize: '200% 100%',
                    boxShadow: '0 0 20px rgba(105,190,40,0.5)',
                  }}
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${progress}%`,
                    backgroundPosition: ['0% 0%', '100% 0%'],
                  }}
                  transition={{
                    width: { type: 'spring', stiffness: 50, damping: 20 },
                    backgroundPosition: { duration: 1.5, repeat: Infinity, ease: 'linear' },
                  }}
                />
              </div>
              
              {/* Percentage */}
              <div 
                className="flex justify-between"
                style={{ marginTop: '12px' }}
              >
                <span
                  className="text-xs uppercase tracking-widest"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  {message}
                </span>
                <span
                  className="text-xs font-bold tabular-nums"
                  style={{ color: '#69BE28' }}
                >
                  {Math.round(progress)}%
                </span>
              </div>
            </motion.div>
            
            {/* Loading animation */}
            <motion.div
              className="flex items-center justify-center"
              style={{ gap: '8px', marginTop: '32px' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{ background: '#69BE28' }}
                  animate={{
                    y: [0, -8, 0],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </motion.div>
          </div>
          
          {/* Footer */}
          <motion.div
            className="absolute left-0 right-0 text-center"
            style={{ bottom: '32px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p
              className="text-xs uppercase tracking-[0.2em]"
              style={{ color: 'rgba(255,255,255,0.2)' }}
            >
              &ldquo;Turn the lights off on them&rdquo;
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LoadingScreen
