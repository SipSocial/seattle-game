'use client'

import { motion } from 'framer-motion'

export default function RotateOverlay() {
  return (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-center z-[9999]"
      style={{ 
        background: 'linear-gradient(180deg, #001020 0%, #002244 50%, #001020 100%)',
        padding: '32px',
      }}
    >
      {/* Animated glow background */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(105,190,40,0.1) 0%, transparent 60%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 text-center">
        {/* Phone rotation animation */}
        <motion.div 
          className="flex items-center justify-center"
          style={{ marginBottom: '40px' }}
        >
          <motion.div
            className="relative"
            style={{ 
              width: '60px', 
              height: '100px',
              border: '3px solid rgba(105,190,40,0.6)',
              borderRadius: '12px',
              background: 'rgba(0,34,68,0.8)',
            }}
            animate={{
              rotate: [0, 0, 90, 90, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
              times: [0, 0.2, 0.5, 0.8, 1],
            }}
          >
            {/* Screen indicator */}
            <div 
              className="absolute rounded"
              style={{
                top: '8px',
                left: '6px',
                right: '6px',
                bottom: '20px',
                background: 'rgba(105,190,40,0.15)',
                border: '1px solid rgba(105,190,40,0.3)',
              }}
            />
            {/* Home button */}
            <motion.div 
              className="absolute rounded-full"
              style={{
                bottom: '6px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '10px',
                height: '10px',
                background: '#69BE28',
              }}
              animate={{
                boxShadow: [
                  '0 0 8px rgba(105,190,40,0.3)',
                  '0 0 16px rgba(105,190,40,0.6)',
                  '0 0 8px rgba(105,190,40,0.3)',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>

        {/* Rotation arrows */}
        <motion.div
          className="flex items-center justify-center"
          style={{ marginBottom: '32px' }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <svg 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#69BE28" 
            strokeWidth="2"
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
          </svg>
        </motion.div>

        {/* Text */}
        <h2 
          className="text-2xl font-black uppercase tracking-wide"
          style={{ 
            color: '#69BE28',
            fontFamily: 'var(--font-oswald), sans-serif',
            marginBottom: '12px',
          }}
        >
          Rotate Your Device
        </h2>
        <p 
          className="text-center"
          style={{ 
            color: 'rgba(255,255,255,0.5)', 
            maxWidth: '280px',
            margin: '0 auto',
            lineHeight: '1.6',
          }}
        >
          For the best gameplay experience, please rotate your device to landscape mode.
        </p>

        {/* Branding */}
        <div 
          className="flex items-center justify-center"
          style={{ marginTop: '48px', gap: '12px' }}
        >
          <div 
            className="rounded-full flex items-center justify-center"
            style={{
              width: '36px',
              height: '36px',
              background: 'rgba(105,190,40,0.2)',
              border: '2px solid rgba(105,190,40,0.4)',
            }}
          >
            <span 
              className="font-black"
              style={{ 
                color: '#69BE28', 
                fontSize: '12px',
                fontFamily: 'var(--font-oswald), sans-serif',
              }}
            >
              12
            </span>
          </div>
          <span 
            className="text-sm uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            Dark Side Game
          </span>
        </div>
      </div>
    </div>
  )
}
