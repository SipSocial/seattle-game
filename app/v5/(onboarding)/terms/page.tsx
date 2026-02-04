'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronLeft, Check } from 'lucide-react'

const BULLETS = [
  'US residents only',
  '21+ to play',
  'No purchase necessary',
  'Earn entries: register, play, picks, live',
  'Grand prize: Big Game tickets + travel',
  'Not affiliated with NFL or Apple',
  'Void where prohibited',
]

export default function TermsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen" style={{ background: '#002244' }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        background: 'rgba(0,34,68,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', gap: '16px' }}>
          <motion.button
            onClick={() => router.back()}
            whileTap={{ scale: 0.9 }}
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              cursor: 'pointer',
            }}
          >
            <ChevronLeft size={20} color="white" />
          </motion.button>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'white' }}>Terms</h1>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
        {BULLETS.map((bullet, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.03 }}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '14px 0',
              borderBottom: idx < BULLETS.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
            }}
          >
            <Check size={16} color="#69BE28" style={{ marginTop: '2px', flexShrink: 0 }} />
            <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.9)' }}>{bullet}</span>
          </motion.div>
        ))}

        {/* Footer */}
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
            DrinkSip, Inc. • Delaware
          </p>
          <p style={{ fontSize: '12px', color: '#69BE28', marginTop: '4px' }}>
            legal@drinksip.com
          </p>
        </div>
      </div>
    </div>
  )
}
