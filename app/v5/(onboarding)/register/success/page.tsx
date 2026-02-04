'use client'

/**
 * Dark Side Football - Registration Success
 * 
 * Premium success screen matching north star design
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  CheckCircle2, 
  Trophy,
  Gamepad2,
  Target,
  Share2,
} from 'lucide-react'

// === ASSETS ===
const BACKGROUND_VIDEO = 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/4b5f0ad3-9f4e-413f-b44a-053e9af6240c/4b5f0ad3-9f4e-413f-b44a-053e9af6240c.mp4'
const BACKGROUND_POSTER = 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/16412705-ca65-400e-bb78-80ff29be860a/segments/2:2:1/Phoenix_Empty_NFL_football_field_at_night_dramatic_billowing_s_0.jpg'
const DRINKSHIP_LOGO = 'https://cdn.shopify.com/s/files/1/0407/8580/5468/files/DrinkSip_Logo_SVG.svg?v=1759624477'

// === DESIGN SYSTEM ===
const COLORS = {
  navy: '#002244',
  green: '#69BE28',
  greenLight: '#7DD33B',
  gold: '#FFD700',
  goldDark: '#FFA500',
  white: '#FFFFFF',
  textPrimary: 'rgba(255,255,255,0.9)',
  textSecondary: 'rgba(255,255,255,0.5)',
  textMuted: 'rgba(255,255,255,0.3)',
  border: 'rgba(255,255,255,0.1)',
  borderGreen: 'rgba(105,190,40,0.3)',
  glass: 'rgba(0,34,68,0.6)',
}

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }

// === COMPONENT: Glass Card ===
function GlassCard({ 
  children, 
  style = {},
}: { 
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        background: COLORS.glass,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: `1px solid ${COLORS.border}`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// === COMPONENT: Entry Method Card ===
function EntryMethodCard({ 
  icon: Icon, 
  title, 
  onClick 
}: { 
  icon: React.ComponentType<{ size?: number; color?: string }>
  title: string
  onClick: () => void
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        padding: '16px 12px',
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${COLORS.border}`,
        borderRadius: '12px',
        cursor: 'pointer',
        flex: 1,
      }}
    >
      <Icon size={22} color={COLORS.green} />
      <span style={{ 
        fontSize: '11px', 
        fontWeight: 500,
        color: COLORS.textPrimary,
        letterSpacing: '0.02em',
      }}>
        {title}
      </span>
    </motion.button>
  )
}

export default function SuccessPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    setMounted(true)
    const name = localStorage.getItem('darkside_name')
    if (name) setUserName(name.split(' ')[0])
  }, [])

  return (
    <div className="fixed inset-0" style={{ background: COLORS.navy }}>
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster={BACKGROUND_POSTER}
        className="absolute inset-0 w-full h-full"
        style={{ objectFit: 'cover', objectPosition: 'center' }}
      >
        <source src={BACKGROUND_VIDEO} type="video/mp4" />
      </video>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div 
          className="absolute inset-x-0 top-0" 
          style={{ 
            height: '30%', 
            background: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)' 
          }} 
        />
        <div 
          className="absolute inset-x-0 bottom-0" 
          style={{ 
            height: '50%', 
            background: 'linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)' 
          }} 
        />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 h-full w-full flex flex-col justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: mounted ? 1 : 0 }}
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 40px)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
          paddingLeft: '20px',
          paddingRight: '20px',
        }}
      >
        {/* TOP: Success Hero */}
        <div style={{ textAlign: 'center' }}>
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ ...spring, delay: 0.2 }}
            style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 20px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${COLORS.green} 0%, ${COLORS.greenLight} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 32px rgba(105,190,40,0.4)`,
            }}
          >
            <CheckCircle2 size={40} color={COLORS.white} strokeWidth={2.5} />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.3 }}
            style={{
              fontSize: 'clamp(2rem, 8vw, 2.5rem)',
              fontWeight: 800,
              fontFamily: 'var(--font-oswald), sans-serif',
              background: `linear-gradient(180deg, ${COLORS.white} 20%, ${COLORS.green} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '8px',
            }}
          >
            YOU&apos;RE ENTERED!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ fontSize: '14px', color: COLORS.textSecondary }}
          >
            You have <span style={{ color: COLORS.green, fontWeight: 700 }}>1 entry</span> in the Big Game Ticket Giveaway
          </motion.p>
        </div>

        {/* MIDDLE: Entry Badge & Earn More */}
        <div style={{ maxWidth: '340px', margin: '0 auto', width: '100%' }}>
          {/* Entry Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...spring, delay: 0.5 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '14px 24px',
              background: 'transparent',
              border: `2px solid ${COLORS.gold}`,
              borderRadius: '100px',
              marginBottom: '24px',
            }}
          >
            <Trophy size={20} color={COLORS.gold} />
            <span style={{
              fontSize: '15px',
              fontWeight: 700,
              fontFamily: 'var(--font-oswald), sans-serif',
              letterSpacing: '0.1em',
              color: COLORS.gold,
            }}>
              1 ENTRY EARNED
            </span>
          </motion.div>

          {/* Earn More Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.6 }}
          >
            <GlassCard style={{ padding: '20px' }}>
              <p style={{
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: COLORS.textSecondary,
                textAlign: 'center',
                marginBottom: '16px',
              }}>
                EARN MORE ENTRIES
              </p>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <EntryMethodCard 
                  icon={Gamepad2} 
                  title="Play Game" 
                  onClick={() => router.push('/v5/game')} 
                />
                <EntryMethodCard 
                  icon={Target} 
                  title="Make Picks" 
                  onClick={() => router.push('/v5/picks')} 
                />
                <EntryMethodCard 
                  icon={Share2} 
                  title="Share" 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Dark Side Football',
                        text: 'Play Dark Side Football and win Big Game tickets!',
                        url: window.location.origin,
                      })
                    }
                  }} 
                />
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* BOTTOM: CTA & Sponsor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.7 }}
          style={{ maxWidth: '340px', margin: '0 auto', width: '100%' }}
        >
          {/* Continue Button */}
          <motion.button
            onClick={() => router.push('/v5/game')}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%',
              height: '52px',
              marginBottom: '20px',
              fontSize: '13px',
              fontWeight: 700,
              fontFamily: 'var(--font-oswald), sans-serif',
              letterSpacing: '0.08em',
              color: COLORS.navy,
              background: `linear-gradient(135deg, ${COLORS.green} 0%, ${COLORS.greenLight} 100%)`,
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(105,190,40,0.3)',
            }}
          >
            CONTINUE TO APP
          </motion.button>

          {/* Sponsor */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ 
              fontSize: '9px', 
              fontWeight: 500,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: COLORS.textMuted,
              marginBottom: '8px',
            }}>
              PRESENTED BY
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={DRINKSHIP_LOGO}
              alt="DrinkSip"
              style={{ height: '32px', width: 'auto', margin: '0 auto', opacity: 0.8 }}
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
