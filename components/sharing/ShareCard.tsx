'use client'

import { motion } from 'framer-motion'

export interface ShareCardProps {
  variant: 'game-result' | 'referral' | 'general'
  data?: {
    score?: number
    mode?: 'qb' | 'defense'
    referralCode?: string
    message?: string
  }
}

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }

export function ShareCard({ variant, data }: ShareCardProps) {
  return (
    <motion.div
      className="relative overflow-hidden"
      style={{
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(0, 34, 68, 0.95) 0%, rgba(0, 20, 40, 0.98) 100%)',
        padding: '2px',
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={spring}
    >
      {/* Gradient border effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(105, 190, 40, 0.5) 0%, rgba(105, 190, 40, 0.1) 50%, rgba(105, 190, 40, 0.3) 100%)',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'xor',
          WebkitMaskComposite: 'xor',
          padding: '2px',
        }}
      />
      
      {/* Glow effect */}
      <div
        className="absolute -inset-4 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(105, 190, 40, 0.15) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />
      
      {/* Card inner content */}
      <div
        className="relative"
        style={{
          borderRadius: '14px',
          background: 'linear-gradient(180deg, rgba(0, 34, 68, 0.98) 0%, rgba(0, 20, 40, 1) 100%)',
          padding: 'var(--space-fluid-md)',
        }}
      >
        {/* DrinkSip branding */}
        <div className="flex items-center justify-center" style={{ marginBottom: '16px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="https://cdn.shopify.com/s/files/1/0407/8580/5468/files/DrinkSip_Logo_SVG.svg?v=1759624477"
            alt="DrinkSip"
            style={{ height: '28px', width: 'auto', opacity: 0.9 }}
          />
        </div>
        
        {/* Content based on variant */}
        {variant === 'game-result' && (
          <GameResultContent score={data?.score} mode={data?.mode} />
        )}
        
        {variant === 'referral' && (
          <ReferralContent referralCode={data?.referralCode} />
        )}
        
        {variant === 'general' && (
          <GeneralContent message={data?.message} />
        )}
        
        {/* Footer */}
        <div 
          className="text-center"
          style={{ 
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <span
            className="uppercase tracking-widest"
            style={{
              fontSize: 'var(--text-micro)',
              color: 'rgba(255, 255, 255, 0.4)',
              fontFamily: 'var(--font-oswald), sans-serif',
            }}
          >
            Dark Side Football
          </span>
        </div>
      </div>
    </motion.div>
  )
}

function GameResultContent({ score, mode }: { score?: number; mode?: 'qb' | 'defense' }) {
  const modeLabel = mode === 'defense' ? 'Defense Mode' : 'QB Mode'
  
  return (
    <div className="text-center">
      {/* Mode label */}
      <div
        className="inline-block px-3 py-1 rounded-full"
        style={{
          background: 'rgba(105, 190, 40, 0.15)',
          border: '1px solid rgba(105, 190, 40, 0.3)',
          marginBottom: '12px',
        }}
      >
        <span
          className="uppercase tracking-wider"
          style={{
            fontSize: 'var(--text-caption)',
            color: 'var(--seahawks-green)',
            fontFamily: 'var(--font-oswald), sans-serif',
          }}
        >
          {modeLabel}
        </span>
      </div>
      
      {/* Score display */}
      <div style={{ marginBottom: '8px' }}>
        <span
          style={{
            fontSize: 'var(--text-hero)',
            fontFamily: 'var(--font-bebas), var(--font-oswald), sans-serif',
            color: 'var(--seahawks-green)',
            lineHeight: 1,
            display: 'block',
          }}
        >
          {score?.toLocaleString() ?? 0}
        </span>
        <span
          className="uppercase tracking-widest"
          style={{
            fontSize: 'var(--text-caption)',
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          Points
        </span>
      </div>
      
      {/* Trophy emoji */}
      <div style={{ fontSize: '2rem', marginTop: '8px' }}>🏈</div>
    </div>
  )
}

function ReferralContent({ referralCode }: { referralCode?: string }) {
  return (
    <div className="text-center">
      {/* Icon */}
      <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎁</div>
      
      {/* Title */}
      <h3
        className="uppercase"
        style={{
          fontSize: 'var(--text-subtitle)',
          fontFamily: 'var(--font-oswald), sans-serif',
          color: 'rgba(255, 255, 255, 0.9)',
          marginBottom: '8px',
          letterSpacing: '0.05em',
        }}
      >
        Join the Dark Side
      </h3>
      
      {/* Referral code */}
      {referralCode && (
        <div
          className="inline-block px-4 py-2 rounded-lg"
          style={{
            background: 'rgba(105, 190, 40, 0.1)',
            border: '1px dashed rgba(105, 190, 40, 0.4)',
            marginTop: '8px',
          }}
        >
          <span
            className="uppercase tracking-wider font-bold"
            style={{
              fontSize: 'var(--text-body)',
              color: 'var(--seahawks-green)',
              fontFamily: 'var(--font-oswald), sans-serif',
            }}
          >
            {referralCode}
          </span>
        </div>
      )}
      
      <p
        style={{
          fontSize: 'var(--text-caption)',
          color: 'rgba(255, 255, 255, 0.5)',
          marginTop: '12px',
        }}
      >
        Use my code for bonus rewards!
      </p>
    </div>
  )
}

function GeneralContent({ message }: { message?: string }) {
  return (
    <div className="text-center">
      {/* Football icon */}
      <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🏈</div>
      
      {/* Title */}
      <h3
        className="uppercase"
        style={{
          fontSize: 'var(--text-subtitle)',
          fontFamily: 'var(--font-oswald), sans-serif',
          color: 'rgba(255, 255, 255, 0.9)',
          marginBottom: '8px',
          letterSpacing: '0.05em',
        }}
      >
        Dark Side Football
      </h3>
      
      {/* Custom message */}
      {message && (
        <p
          style={{
            fontSize: 'var(--text-body)',
            color: 'rgba(255, 255, 255, 0.7)',
            marginTop: '8px',
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>
      )}
    </div>
  )
}

export default ShareCard
