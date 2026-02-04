'use client'

/**
 * Profile Tab - Premium user profile with Coinbase-level polish
 * 
 * Design: Nike-level polish with clean card-based layouts
 * Features:
 * - User avatar with glow effect
 * - Hero-sized animated entry counter
 * - Quick stats row (rank, games, win rate)
 * - Premium action cards with GlassCard
 * - Mini leaderboard preview
 * - Sponsor footer
 */

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Ticket, 
  Gamepad2, 
  Trophy, 
  Percent,
  Camera, 
  Gift, 
  Share2, 
  Settings, 
  ChevronRight,
  Clock,
  TrendingUp,
  Store,
  User,
} from 'lucide-react'
import { VideoBackground } from '@/components/ui/VideoBackground'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { GhostButton } from '@/components/ui/GhostButton'
import { useV5GameStore, getDrawingCountdown } from '@/src/v5/store/v5GameStore'
import { usePicksStore } from '@/src/v5/store/picksStore'

const BACKGROUND_VIDEO = 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/4b5f0ad3-9f4e-413f-b44a-053e9af6240c/4b5f0ad3-9f4e-413f-b44a-053e9af6240c.mp4'
const BACKGROUND_POSTER = 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/16412705-ca65-400e-bb78-80ff29be860a/segments/2:2:1/Phoenix_Empty_NFL_football_field_at_night_dramatic_billowing_s_0.jpg'

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }

// Animated counter component
function AnimatedCounter({ 
  value, 
  duration = 1500,
  style = {},
}: { 
  value: number
  duration?: number
  style?: React.CSSProperties
}) {
  const [displayValue, setDisplayValue] = useState(0)
  
  useEffect(() => {
    if (value === 0) {
      setDisplayValue(0)
      return
    }
    
    const startTime = Date.now()
    const startValue = displayValue
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.floor(startValue + (value - startValue) * eased)
      
      setDisplayValue(current)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration])
  
  return (
    <span style={style}>
      {displayValue.toLocaleString()}
    </span>
  )
}

// Action card component with GlassCard styling
function ActionCard({ 
  icon, 
  title, 
  subtitle, 
  href, 
  onClick,
  variant = 'default',
  badge,
}: { 
  icon: React.ReactNode
  title: string
  subtitle: string
  href?: string
  onClick?: () => void
  variant?: 'default' | 'green'
  badge?: string
}) {
  const router = useRouter()
  
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick()
    } else if (href) {
      router.push(href)
    }
  }, [onClick, href, router])
  
  return (
    <GlassCard 
      variant={variant} 
      padding="md" 
      hover
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
        {/* Icon */}
        <div 
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: variant === 'green' 
              ? 'linear-gradient(135deg, rgba(105, 190, 40, 0.3), rgba(105, 190, 40, 0.1))'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        
        {/* Text */}
        <div style={{ flex: 1 }}>
          <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
            <p 
              style={{
                fontSize: 'var(--text-body)',
                fontWeight: 600,
                color: 'white',
                letterSpacing: '0.02em',
              }}
            >
              {title}
            </p>
            {badge && (
              <span 
                style={{
                  padding: '2px 8px',
                  fontSize: 'var(--text-micro)',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  color: '#002244',
                  background: '#69BE28',
                  borderRadius: '4px',
                }}
              >
                {badge}
              </span>
            )}
          </div>
          <p 
            style={{
              fontSize: 'var(--text-caption)',
              color: 'rgba(255, 255, 255, 0.5)',
              marginTop: '2px',
            }}
          >
            {subtitle}
          </p>
        </div>
        
        {/* Chevron */}
        <ChevronRight 
          className="w-5 h-5" 
          style={{ color: 'rgba(255, 255, 255, 0.3)', flexShrink: 0 }} 
        />
      </div>
    </GlassCard>
  )
}

// Mini leaderboard preview
function MiniLeaderboard({ userRank }: { userRank: number }) {
  // Mock top 3 leaderboard
  const topPlayers = [
    { rank: 1, name: 'DarkSideFan12', entries: 847 },
    { rank: 2, name: 'SeahawksPride', entries: 756 },
    { rank: 3, name: 'HawkNation_99', entries: 698 },
  ]
  
  return (
    <div style={{ marginTop: 'var(--space-4)' }}>
      {topPlayers.map((player, i) => (
        <motion.div 
          key={player.rank}
          className="flex items-center justify-between"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...spring, delay: 0.3 + i * 0.05 }}
          style={{
            padding: 'var(--space-2) var(--space-3)',
            background: i === 0 
              ? 'linear-gradient(90deg, rgba(255, 215, 0, 0.1), transparent)'
              : 'transparent',
            borderRadius: '8px',
            marginBottom: '2px',
          }}
        >
          <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
            <span 
              style={{
                width: '24px',
                fontSize: 'var(--text-body)',
                fontWeight: 700,
                color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : '#CD7F32',
              }}
            >
              #{player.rank}
            </span>
            <span style={{ fontSize: 'var(--text-body)', color: 'rgba(255,255,255,0.8)' }}>
              {player.name}
            </span>
          </div>
          <span 
            style={{ 
              fontSize: 'var(--text-caption)', 
              color: '#69BE28', 
              fontWeight: 600,
              fontFamily: 'var(--font-oswald), sans-serif',
            }}
          >
            {player.entries}
          </span>
        </motion.div>
      ))}
      
      {/* Separator */}
      <div 
        style={{
          padding: 'var(--space-1) var(--space-3)',
          borderTop: '1px dashed rgba(255,255,255,0.1)',
          marginTop: 'var(--space-2)',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: 'var(--text-micro)', color: 'rgba(255,255,255,0.3)' }}>
          ...
        </span>
      </div>
      
      {/* User position */}
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ ...spring, delay: 0.45 }}
        style={{
          padding: 'var(--space-2) var(--space-3)',
          background: 'linear-gradient(90deg, rgba(105, 190, 40, 0.15), transparent)',
          borderRadius: '8px',
          border: '1px solid rgba(105, 190, 40, 0.3)',
        }}
      >
        <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
          <span 
            style={{ 
              width: '24px', 
              fontSize: 'var(--text-body)', 
              fontWeight: 700, 
              color: '#69BE28' 
            }}
          >
            #{userRank}
          </span>
          <span style={{ fontSize: 'var(--text-body)', color: 'white', fontWeight: 600 }}>
            You
          </span>
        </div>
        <div className="flex items-center" style={{ gap: '4px' }}>
          <TrendingUp className="w-3 h-3" style={{ color: '#69BE28' }} />
          <span style={{ fontSize: 'var(--text-micro)', color: '#69BE28' }}>
            12 spots today
          </span>
        </div>
      </motion.div>
    </div>
  )
}

// Quick stat display
function QuickStat({ 
  icon, 
  value, 
  label,
  color = 'white',
}: { 
  icon: React.ReactNode
  value: string | number
  label: string
  color?: string
}) {
  return (
    <div className="flex flex-col items-center" style={{ flex: 1 }}>
      <div className="flex items-center justify-center" style={{ marginBottom: '4px' }}>
        {icon}
      </div>
      <p 
        style={{
          fontSize: 'var(--step-2)',
          fontWeight: 700,
          color: color,
          fontFamily: 'var(--font-oswald), sans-serif',
        }}
      >
        {value}
      </p>
      <p 
        style={{
          fontSize: 'var(--text-micro)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'rgba(255, 255, 255, 0.4)',
          marginTop: '2px',
        }}
      >
        {label}
      </p>
    </div>
  )
}

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false)
  const [drawingCountdown, setDrawingCountdown] = useState(() => getDrawingCountdown())
  const router = useRouter()
  
  // Get data from stores
  const { campaign } = useV5GameStore()
  const { isComplete } = usePicksStore()
  
  // Calculate entry breakdown
  const gameEntries = campaign?.totalEntries ?? 0
  const picksEntries = isComplete() ? 10 : 0
  const shareEntries = 0
  const scanEntries = 0
  const totalEntries = gameEntries + picksEntries + shareEntries + scanEntries
  
  // Mock data for demo
  const userName = 'Guest User'
  const userInitials = 'GU'
  const userRank = 47
  const gamesPlayed = campaign?.gamesWon ?? 0
  const winRate = gamesPlayed > 0 ? Math.round((gamesPlayed / (gamesPlayed + 2)) * 100) : 0
  
  // Update drawing countdown
  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setDrawingCountdown(getDrawingCountdown())
    }, 60000)
    return () => clearInterval(interval)
  }, [])
  
  // Handle share
  const handleShare = useCallback(async () => {
    const shareData = {
      title: 'Dark Side Football',
      text: 'Play Dark Side Defense and win Big Game tickets!',
      url: 'https://drinksip.com/play',
    }
    
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // User cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`)
      } catch {
        console.error('Failed to copy')
      }
    }
  }, [])

  return (
    <div className="min-h-full" style={{ background: 'var(--seahawks-navy-dark, #002244)' }}>
      {/* Background */}
      <VideoBackground 
        src={BACKGROUND_VIDEO}
        poster={BACKGROUND_POSTER}
        overlay={true}
        overlayOpacity={0.8}
      />

      {/* Gradient overlays */}
      <div className="fixed inset-0 z-[1] pointer-events-none">
        <div 
          className="absolute inset-x-0 top-0"
          style={{ 
            height: '40%',
            background: 'linear-gradient(180deg, rgba(0,10,20,0.95) 0%, transparent 100%)',
          }}
        />
        <div 
          className="absolute inset-x-0 bottom-0"
          style={{ 
            height: '30%',
            background: 'linear-gradient(0deg, rgba(0,10,20,0.95) 0%, transparent 100%)',
          }}
        />
      </div>

      {/* Content */}
      <motion.div 
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: mounted ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + var(--space-6))',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 100px)',
          paddingLeft: 'var(--space-5)',
          paddingRight: 'var(--space-5)',
        }}
      >
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          
          {/* Avatar Section */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : -20 }}
            transition={{ ...spring, delay: 0.1 }}
            style={{ marginBottom: 'var(--space-5)' }}
          >
            {/* Avatar with glow - Compact sizing */}
            <motion.div 
              className="mx-auto flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: mounted ? 1 : 0.8, opacity: mounted ? 1 : 0 }}
              transition={{ ...spring, delay: 0.15 }}
              style={{ 
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(105, 190, 40, 0.3), rgba(105, 190, 40, 0.1))',
                border: '2px solid rgba(105, 190, 40, 0.5)',
                boxShadow: '0 0 24px rgba(105, 190, 40, 0.3), 0 0 48px rgba(105, 190, 40, 0.15)',
                marginBottom: 'var(--space-3)',
              }}
            >
              <span 
                style={{ 
                  fontSize: 'var(--step-2)', 
                  fontWeight: 900, 
                  color: '#69BE28',
                  fontFamily: 'var(--font-oswald), sans-serif',
                  letterSpacing: '0.02em',
                }}
              >
                {userInitials}
              </span>
            </motion.div>
            
            {/* Username */}
            <h1 
              className="font-display"
              style={{ 
                fontSize: 'var(--text-subtitle)',
                color: 'white',
                letterSpacing: '0.05em',
                marginBottom: 'var(--space-2)',
              }}
            >
              {userName.toUpperCase()}
            </h1>
            
            {/* Edit Profile Button */}
            <Link href="/v5/profile/settings">
              <GhostButton size="sm" variant="subtle" icon={<User className="w-4 h-4" />} iconPosition="left">
                Edit Profile
              </GhostButton>
            </Link>
          </motion.div>

          {/* Entry Counter Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ ...spring, delay: 0.2 }}
            style={{ marginBottom: 'var(--space-5)' }}
          >
            <GlassCard variant="green" padding="lg">
              <div className="text-center">
                {/* Label */}
                <p 
                  style={{ 
                    fontSize: 'var(--text-micro)',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'rgba(255, 255, 255, 0.5)',
                    marginBottom: 'var(--space-2)',
                  }}
                >
                  Your Total Entries
                </p>
                
                {/* Entry Counter - Balanced sizing */}
                <div 
                  className="flex items-center justify-center" 
                  style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}
                >
                  <Ticket className="w-6 h-6" style={{ color: '#FFD700' }} />
                  <AnimatedCounter
                    value={totalEntries}
                    style={{
                      fontSize: 'var(--step-5)',
                      fontWeight: 900,
                      color: '#69BE28',
                      fontFamily: 'var(--font-oswald), var(--font-bebas), sans-serif',
                      textShadow: '0 0 24px rgba(105, 190, 40, 0.5)',
                      lineHeight: 1,
                    }}
                  />
                </div>
                
                {/* Subtitle */}
                <p 
                  style={{ 
                    fontSize: 'var(--text-caption)',
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  entries in Big Game Giveaway
                </p>
              </div>
              
              {/* Drawing countdown */}
              <div 
                className="flex items-center justify-center"
                style={{ 
                  marginTop: 'var(--space-4)',
                  paddingTop: 'var(--space-4)',
                  borderTop: '1px solid rgba(255, 215, 0, 0.2)',
                  gap: 'var(--space-2)',
                }}
              >
                <Clock className="w-4 h-4" style={{ color: '#FFD700' }} />
                <p style={{ fontSize: 'var(--text-caption)', color: 'rgba(255, 215, 0, 0.8)' }}>
                  Drawing in{' '}
                  <strong style={{ color: '#FFD700' }}>
                    {drawingCountdown.isLive 
                      ? 'LIVE NOW' 
                      : `${drawingCountdown.days}d ${drawingCountdown.hours}h ${drawingCountdown.minutes}m`
                    }
                  </strong>
                </p>
              </div>
            </GlassCard>
          </motion.div>

          {/* Quick Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ ...spring, delay: 0.25 }}
            style={{ marginBottom: 'var(--space-5)' }}
          >
            <GlassCard variant="default" padding="md">
              <div className="flex items-center">
                <QuickStat 
                  icon={<Trophy className="w-5 h-5" style={{ color: '#FFD700' }} />}
                  value={`#${userRank}`}
                  label="Rank"
                  color="#FFD700"
                />
                <div style={{ 
                  width: '1px', 
                  height: '40px', 
                  background: 'rgba(255,255,255,0.1)' 
                }} />
                <QuickStat 
                  icon={<Gamepad2 className="w-5 h-5" style={{ color: '#69BE28' }} />}
                  value={gamesPlayed}
                  label="Games"
                  color="#69BE28"
                />
                <div style={{ 
                  width: '1px', 
                  height: '40px', 
                  background: 'rgba(255,255,255,0.1)' 
                }} />
                <QuickStat 
                  icon={<Percent className="w-5 h-5" style={{ color: 'white' }} />}
                  value={`${winRate}%`}
                  label="Win Rate"
                />
              </div>
            </GlassCard>
          </motion.div>

          {/* Action Cards */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ ...spring, delay: 0.3 }}
            style={{ marginBottom: 'var(--space-5)' }}
          >
            <h3 
              style={{
                fontSize: 'var(--text-micro)',
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(255, 255, 255, 0.4)',
                marginBottom: 'var(--space-4)',
              }}
            >
              Quick Actions
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <ActionCard 
                icon={<Camera className="w-5 h-5" style={{ color: '#69BE28' }} />}
                title="Scan & Win"
                subtitle="Scan products for bonus entries"
                href="/v5/profile/scan"
                variant="green"
                badge="NEW"
              />
              <ActionCard 
                icon={<Gift className="w-5 h-5" style={{ color: '#FFD700' }} />}
                title="Claim Prizes"
                subtitle="View and claim rewards"
                href="/v5/profile/claim"
              />
              <ActionCard 
                icon={<Store className="w-5 h-5" style={{ color: 'white' }} />}
                title="Shop & Discover"
                subtitle="Products and retailers"
                href="/v5/profile/discover"
              />
              <ActionCard 
                icon={<Share2 className="w-5 h-5" style={{ color: 'white' }} />}
                title="Share & Earn"
                subtitle="Invite friends for 5 entries"
                onClick={handleShare}
              />
              <ActionCard 
                icon={<Settings className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.7)' }} />}
                title="Settings"
                subtitle="Account and notifications"
                href="/v5/profile/settings"
              />
            </div>
          </motion.section>

          {/* Leaderboard Preview */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ ...spring, delay: 0.35 }}
            style={{ marginBottom: 'var(--space-5)' }}
          >
            <GlassCard variant="default" padding="md">
              <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-2)' }}>
                <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                  <Trophy className="w-5 h-5" style={{ color: '#FFD700' }} />
                  <h3 
                    style={{
                      fontSize: 'var(--text-body)',
                      fontWeight: 600,
                      color: 'white',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Leaderboard
                  </h3>
                </div>
                <Link 
                  href="/v5/leaderboard"
                  className="flex items-center"
                  style={{
                    fontSize: 'var(--text-caption)',
                    color: '#69BE28',
                    textDecoration: 'none',
                    fontWeight: 600,
                    gap: '4px',
                  }}
                >
                  View Full
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              
              <MiniLeaderboard userRank={userRank} />
            </GlassCard>
          </motion.section>

          {/* Play Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ ...spring, delay: 0.4 }}
            style={{ marginBottom: 'var(--space-5)' }}
          >
            <Link href="/v5/game" style={{ display: 'block' }}>
              <GradientButton size="lg" fullWidth icon={<Gamepad2 className="w-5 h-5" />}>
                Play & Earn Entries
              </GradientButton>
            </Link>
          </motion.div>

          {/* Sponsor Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: mounted ? 1 : 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
            style={{
              paddingTop: 'var(--space-6)',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <p 
              style={{ 
                fontSize: 'var(--text-micro)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(255, 215, 0, 0.4)',
                marginBottom: 'var(--space-3)',
              }}
            >
              PRESENTED BY
            </p>
            
            {/* DrinkSip Logo */}
            <div 
              style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginBottom: 'var(--space-4)' 
              }}
            >
              <a 
                href="https://drinksip.com" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="https://cdn.shopify.com/s/files/1/0407/8580/5468/files/DrinkSip_Logo_SVG.svg?v=1759624477"
                  alt="DrinkSip"
                  style={{ 
                    height: '32px', 
                    width: 'auto', 
                    opacity: 0.7,
                    display: 'block',
                  }}
                />
              </a>
            </div>
            
            {/* Partner links */}
            <div 
              className="flex items-center justify-center" 
              style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}
            >
              <a 
                href="https://kjrradio.com" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  fontSize: 'var(--text-micro)', 
                  color: 'rgba(255,255,255,0.3)',
                  textDecoration: 'none',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                }}
              >
                KJR RADIO
              </a>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
              <a 
                href="https://simplyseattle.com" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  fontSize: 'var(--text-micro)', 
                  color: 'rgba(255,255,255,0.3)',
                  textDecoration: 'none',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                }}
              >
                SIMPLY SEATTLE
              </a>
            </div>
            
            {/* App version */}
            <p 
              style={{
                fontSize: 'var(--text-micro)',
                color: 'rgba(255,255,255,0.2)',
              }}
            >
              Dark Side Football v5.0.0
            </p>
          </motion.footer>
          
        </div>
      </motion.div>
    </div>
  )
}
