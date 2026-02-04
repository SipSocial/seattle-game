'use client'

/**
 * V5 Leaderboard - Coinbase-quality player rankings
 * 
 * Design: Premium sports betting leaderboard with Nike-level polish
 * Features:
 * - Sticky header with filters
 * - User's highlighted position card (always visible at top)
 * - Gold/Silver/Bronze icons for top 3
 * - Alternating subtle backgrounds for 4+
 * - Rank change indicators with arrows
 * - Avatar circles with initials
 * - Pull-to-refresh visual
 * - Spring animations throughout
 */

import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { 
  Trophy, 
  Medal, 
  Crown, 
  Users, 
  TrendingUp, 
  ChevronUp, 
  ChevronDown,
  Clock,
  RefreshCw,
  Filter,
  Flame
} from 'lucide-react'
import { VideoBackground } from '@/components/ui/VideoBackground'
import { GlassCard } from '@/components/ui/GlassCard'
import { useGameStore } from '@/src/store/gameStore'
import { getDrawingCountdown } from '@/src/v5/store/v5GameStore'

const BACKGROUND_VIDEO = 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/4b5f0ad3-9f4e-413f-b44a-053e9af6240c/4b5f0ad3-9f4e-413f-b44a-053e9af6240c.mp4'
const BACKGROUND_POSTER = 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/16412705-ca65-400e-bb78-80ff29be860a/segments/2:2:1/Phoenix_Empty_NFL_football_field_at_night_dramatic_billowing_s_0.jpg'

// Animation configs
const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }
const springSnappy = { type: 'spring' as const, stiffness: 400, damping: 25 }

// Mock current user
const CURRENT_USER_ID = 'user_self'

// Placeholder data with rank changes
interface LeaderboardPlayer {
  id: string
  rank: number
  name: string
  entries: number
  change: number // positive = moved up, negative = moved down, 0 = no change
  streak?: number // consecutive days played
}

const mockLeaderboard: LeaderboardPlayer[] = [
  { id: '1', rank: 1, name: 'GridironKing', entries: 2847, change: 0, streak: 14 },
  { id: '2', rank: 2, name: 'SeahawksFan12', entries: 2523, change: 2, streak: 12 },
  { id: '3', rank: 3, name: 'DefenseWins', entries: 2191, change: -1, streak: 8 },
  { id: '4', rank: 4, name: 'GoHawks2026', entries: 1854, change: 3 },
  { id: '5', rank: 5, name: 'TwelveArmy', entries: 1712, change: -2 },
  { id: CURRENT_USER_ID, rank: 6, name: 'You', entries: 1598, change: 5, streak: 7 },
  { id: '7', rank: 7, name: 'SackLeader', entries: 1445, change: 0 },
  { id: '8', rank: 8, name: 'EndZoneHero', entries: 1287, change: -1 },
  { id: '9', rank: 9, name: 'NFCChamp', entries: 1156, change: 1 },
  { id: '10', rank: 10, name: 'SuperFan', entries: 1023, change: -3 },
  { id: '11', rank: 11, name: 'BlitzMaster', entries: 987, change: 2 },
  { id: '12', rank: 12, name: 'HawkNation', entries: 945, change: 0 },
  { id: '13', rank: 13, name: 'GreenLegion', entries: 912, change: -1 },
  { id: '14', rank: 14, name: 'TD_Machine', entries: 878, change: 4 },
  { id: '15', rank: 15, name: 'FieldGeneral', entries: 834, change: -2 },
]

// Get initials from name
const getInitials = (name: string): string => {
  if (name === 'You') return 'ME'
  const words = name.replace(/[0-9_]/g, ' ').trim().split(/\s+/)
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

// Get rank styling for top 3
const getRankConfig = (rank: number) => {
  if (rank === 1) {
    return {
      gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      color: '#1a1a2e',
      shadow: '0 4px 20px rgba(255, 215, 0, 0.35)',
      Icon: Crown,
      label: 'Champion',
    }
  }
  if (rank === 2) {
    return {
      gradient: 'linear-gradient(135deg, #E8E8E8 0%, #B0B0B0 100%)',
      color: '#1a1a2e',
      shadow: '0 4px 16px rgba(200, 200, 200, 0.25)',
      Icon: Medal,
      label: 'Runner Up',
    }
  }
  if (rank === 3) {
    return {
      gradient: 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)',
      color: '#FFFFFF',
      shadow: '0 4px 16px rgba(205, 127, 50, 0.25)',
      Icon: Trophy,
      label: 'Third Place',
    }
  }
  return null
}

// Shimmer loading row
const ShimmerRow = ({ index }: { index: number }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ ...spring, delay: 0.1 + index * 0.03 }}
    style={{ marginBottom: 'var(--space-3)' }}
  >
    <div
      style={{
        padding: 'var(--space-4)',
        borderRadius: '16px',
        background: 'rgba(255, 255, 255, 0.03)',
      }}
    >
      <div className="flex items-center" style={{ gap: 'var(--space-4)' }}>
        <div 
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
        <div 
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            animationDelay: '0.1s',
          }}
        />
        <div style={{ flex: 1 }}>
          <div 
            style={{
              width: '100px',
              height: '14px',
              borderRadius: '7px',
              marginBottom: '6px',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              animationDelay: '0.2s',
            }}
          />
          <div 
            style={{
              width: '60px',
              height: '10px',
              borderRadius: '5px',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              animationDelay: '0.3s',
            }}
          />
        </div>
        <div 
          style={{
            width: '50px',
            height: '20px',
            borderRadius: '10px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            animationDelay: '0.4s',
          }}
        />
      </div>
    </div>
  </motion.div>
)

// Avatar component with initials
const Avatar = ({ 
  name, 
  isCurrentUser,
  size = 32,
}: { 
  name: string
  isCurrentUser: boolean
  size?: number
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isCurrentUser 
        ? 'linear-gradient(135deg, rgba(105, 190, 40, 0.3) 0%, rgba(105, 190, 40, 0.1) 100%)'
        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      border: isCurrentUser 
        ? '1.5px solid rgba(105, 190, 40, 0.5)'
        : '1px solid rgba(255, 255, 255, 0.1)',
      flexShrink: 0,
    }}
  >
    <span
      style={{
        fontFamily: 'var(--font-oswald), sans-serif',
        fontSize: size * 0.4,
        fontWeight: 700,
        letterSpacing: '0.02em',
        color: isCurrentUser ? '#69BE28' : 'rgba(255, 255, 255, 0.7)',
      }}
    >
      {getInitials(name)}
    </span>
  </div>
)

// Rank change indicator
const RankChange = ({ change }: { change: number }) => {
  if (change === 0) {
    return (
      <span
        style={{
          fontFamily: 'var(--font-oswald), sans-serif',
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.3)',
        }}
      >
        --
      </span>
    )
  }

  const isUp = change > 0
  return (
    <div
      className="flex items-center"
      style={{ 
        gap: '1px',
        color: isUp ? '#69BE28' : '#FF6B6B',
      }}
    >
      {isUp ? (
        <ChevronUp size={12} strokeWidth={2.5} />
      ) : (
        <ChevronDown size={12} strokeWidth={2.5} />
      )}
      <span
        style={{
          fontFamily: 'var(--font-oswald), sans-serif',
          fontSize: '11px',
          fontWeight: 600,
        }}
      >
        {Math.abs(change)}
      </span>
    </div>
  )
}

// Leaderboard row component
const LeaderboardRow = ({ 
  player, 
  index,
  isCurrentUser = false,
}: { 
  player: LeaderboardPlayer
  index: number
  isCurrentUser?: boolean
}) => {
  const rankConfig = getRankConfig(player.rank)
  const isTopThree = player.rank <= 3
  const isEvenRow = index % 2 === 0
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...spring, delay: 0.05 + index * 0.03 }}
      whileHover={{ scale: 1.01 }}
      style={{
        padding: '16px',
        borderRadius: '16px',
        background: isCurrentUser 
          ? 'rgba(105, 190, 40, 0.08)'
          : isTopThree 
            ? 'rgba(255, 255, 255, 0.04)'
            : isEvenRow 
              ? 'rgba(255, 255, 255, 0.02)' 
              : 'transparent',
        border: isCurrentUser 
          ? '1.5px solid rgba(105, 190, 40, 0.4)'
          : isTopThree 
            ? '1px solid rgba(255, 255, 255, 0.08)'
            : '1px solid transparent',
        marginBottom: '8px',
        transition: 'background 0.2s ease',
      }}
    >
      <div className="flex items-center" style={{ gap: '12px' }}>
        {/* Rank Badge */}
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: rankConfig?.gradient || 'rgba(255, 255, 255, 0.05)',
            color: rankConfig?.color || 'rgba(255, 255, 255, 0.6)',
            boxShadow: rankConfig?.shadow || 'none',
            flexShrink: 0,
            fontFamily: 'var(--font-oswald), sans-serif',
            fontWeight: 700,
            fontSize: isTopThree ? '14px' : '16px',
          }}
        >
          {rankConfig?.Icon ? (
            <rankConfig.Icon size={18} strokeWidth={2.5} />
          ) : (
            player.rank
          )}
        </div>

        {/* Avatar */}
        <Avatar name={player.name} isCurrentUser={isCurrentUser} size={32} />

        {/* Name & Meta - Fixed width with proper truncation */}
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <div className="flex items-center" style={{ gap: '8px' }}>
            <span 
              style={{ 
                fontFamily: 'var(--font-oswald), sans-serif',
                fontSize: '15px',
                fontWeight: 600,
                color: isCurrentUser ? '#69BE28' : 'rgba(255, 255, 255, 0.9)',
                letterSpacing: '0.02em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100px',
                display: 'block',
              }}
            >
              {player.name}
            </span>
            {isCurrentUser && (
              <span 
                style={{ 
                  fontFamily: 'var(--font-oswald), sans-serif',
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#002244',
                  background: '#69BE28',
                  padding: '3px 6px',
                  borderRadius: '4px',
                  flexShrink: 0,
                }}
              >
                YOU
              </span>
            )}
          </div>
          
          <div className="flex items-center" style={{ gap: '10px', marginTop: '3px' }}>
            {rankConfig?.label && (
              <span
                style={{
                  fontFamily: 'var(--font-oswald), sans-serif',
                  fontSize: '10px',
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  color: 'rgba(255, 255, 255, 0.4)',
                }}
              >
                {rankConfig.label}
              </span>
            )}
            {player.streak && player.streak >= 5 && (
              <div 
                className="flex items-center"
                style={{ gap: '3px', color: '#FF9500' }}
              >
                <Flame size={10} />
                <span
                  style={{
                    fontFamily: 'var(--font-oswald), sans-serif',
                    fontSize: '10px',
                    fontWeight: 600,
                  }}
                >
                  {player.streak}d
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Rank Change */}
        <div style={{ width: '32px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <RankChange change={player.change} />
        </div>

        {/* Entries - Fixed width */}
        <div className="text-right" style={{ width: '70px', flexShrink: 0 }}>
          <p 
            style={{ 
              fontFamily: 'var(--font-oswald), sans-serif',
              fontSize: isTopThree ? '20px' : '18px',
              color: isTopThree ? '#69BE28' : 'rgba(255, 255, 255, 0.8)',
              lineHeight: 1,
              fontWeight: 700,
              letterSpacing: '0.02em',
            }}
          >
            {player.entries.toLocaleString()}
          </p>
          <p style={{ 
            fontFamily: 'var(--font-oswald), sans-serif',
            fontSize: '9px',
            fontWeight: 500,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(255, 255, 255, 0.3)',
            marginTop: '3px',
          }}>
            ENTRIES
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// User Position Card (prominent, always visible)
const UserPositionCard = ({ 
  rank, 
  entries, 
  isInTopTen,
  change,
}: { 
  rank: number | null
  entries: number
  isInTopTen: boolean
  change: number
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ ...spring, delay: 0.15 }}
  >
    <GlassCard 
      variant="green" 
      padding="none"
      style={{
        padding: 'var(--space-5)',
        border: isInTopTen 
          ? '2px solid rgba(105, 190, 40, 0.5)' 
          : '1px solid rgba(105, 190, 40, 0.3)',
        boxShadow: isInTopTen 
          ? '0 8px 40px rgba(105, 190, 40, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
          : '0 4px 20px rgba(105, 190, 40, 0.1)',
      }}
    >
      <div className="flex items-center" style={{ gap: 'var(--space-4)' }}>
        {/* Rank Display */}
        <div 
          style={{ 
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(105, 190, 40, 0.25) 0%, rgba(105, 190, 40, 0.08) 100%)',
            border: '2px solid rgba(105, 190, 40, 0.3)',
            flexShrink: 0,
          }}
        >
          {rank ? (
            <>
              <span 
                style={{ 
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'rgba(255, 255, 255, 0.5)',
                  marginBottom: '2px',
                }}
              >
                RANK
              </span>
              <span 
                className="font-display"
                style={{ 
                  fontSize: 'var(--step-2)',
                  color: '#69BE28',
                  fontFamily: 'var(--font-oswald), sans-serif',
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                #{rank}
              </span>
            </>
          ) : (
            <span 
              style={{ 
                fontSize: 'var(--text-body)',
                color: 'rgba(255, 255, 255, 0.4)',
              }}
            >
              --
            </span>
          )}
        </div>
        
        {/* User Info */}
        <div style={{ flex: 1 }}>
          <div className="flex items-center" style={{ gap: 'var(--space-2)', marginBottom: '4px' }}>
            <p style={{ 
              fontSize: 'var(--text-caption)',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'rgba(255, 255, 255, 0.5)',
            }}>
              YOUR RANKING
            </p>
            {isInTopTen && (
              <div 
                className="flex items-center"
                style={{ 
                  gap: '4px',
                  background: 'rgba(105, 190, 40, 0.2)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                }}
              >
                <TrendingUp size={12} color="#69BE28" />
                <span style={{ fontSize: '10px', color: '#69BE28', fontWeight: 600 }}>
                  TOP 10
                </span>
              </div>
            )}
          </div>
          <p style={{ 
            fontSize: 'var(--text-body)',
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.8)',
          }}>
            {entries > 0 ? 'Keep earning to climb!' : 'Play games to get ranked'}
          </p>
          {change !== 0 && rank && (
            <div className="flex items-center" style={{ gap: '4px', marginTop: '4px' }}>
              <RankChange change={change} />
              <span style={{ 
                fontSize: 'var(--text-micro)',
                color: 'rgba(255, 255, 255, 0.4)',
              }}>
                since yesterday
              </span>
            </div>
          )}
        </div>
        
        {/* User Entries */}
        <div className="text-right">
          <p 
            className="font-display"
            style={{ 
              fontSize: 'var(--step-3)',
              color: '#69BE28',
              lineHeight: 1,
              fontFamily: 'var(--font-oswald), sans-serif',
              fontWeight: 700,
            }}
          >
            {entries.toLocaleString()}
          </p>
          <p style={{ 
            fontSize: '10px',
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'rgba(255, 255, 255, 0.4)',
            marginTop: '4px',
          }}>
            ENTRIES
          </p>
        </div>
      </div>
    </GlassCard>
  </motion.div>
)

// Pull-to-refresh indicator
const PullToRefresh = ({ isPulling, progress }: { isPulling: boolean; progress: number }) => (
  <AnimatePresence>
    {isPulling && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 48 }}
        exit={{ opacity: 0, height: 0 }}
        className="flex items-center justify-center"
        style={{ overflow: 'hidden' }}
      >
        <motion.div
          animate={{ rotate: progress >= 1 ? 360 : 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <RefreshCw 
            size={20} 
            style={{ 
              color: progress >= 1 ? '#69BE28' : 'rgba(255, 255, 255, 0.4)',
              opacity: Math.min(progress, 1),
            }} 
          />
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
)

export default function LeaderboardPage() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isPulling, setIsPulling] = useState(false)
  const [pullProgress, setPullProgress] = useState(0)
  const [activeFilter, setActiveFilter] = useState<'all' | 'week' | 'today'>('all')
  const [drawingCountdown, setDrawingCountdown] = useState(() => getDrawingCountdown())
  
  // Get user data from store
  const totalEntries = useGameStore((state) => state.campaign.totalEntries)
  
  // Find current user in leaderboard
  const currentUserData = useMemo(() => {
    const user = mockLeaderboard.find(p => p.id === CURRENT_USER_ID)
    return user || null
  }, [])

  // User's rank from mock data or calculated
  const userRank = useMemo(() => {
    if (currentUserData) return currentUserData.rank
    if (totalEntries === 0) return null
    const position = mockLeaderboard.findIndex(p => totalEntries > p.entries) + 1
    return position === 0 ? mockLeaderboard.length + 1 : position
  }, [totalEntries, currentUserData])

  const isInTopTen = userRank !== null && userRank <= 10
  
  useEffect(() => {
    setMounted(true)
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])
  
  // Update drawing countdown every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setDrawingCountdown(getDrawingCountdown())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Pull-to-refresh handling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (scrollRef.current?.scrollTop === 0) {
      setIsPulling(true)
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isPulling && scrollRef.current?.scrollTop === 0) {
      const touch = e.touches[0]
      const progress = Math.min(touch.clientY / 150, 1.2)
      setPullProgress(progress)
    }
  }, [isPulling])

  const handleTouchEnd = useCallback(() => {
    if (pullProgress >= 1) {
      // Trigger refresh
      setIsLoading(true)
      setTimeout(() => setIsLoading(false), 800)
    }
    setIsPulling(false)
    setPullProgress(0)
  }, [pullProgress])

  // Filter buttons
  const filters = [
    { id: 'all' as const, label: 'All Time' },
    { id: 'week' as const, label: 'This Week' },
    { id: 'today' as const, label: 'Today' },
  ]

  return (
    <div 
      className="fixed inset-0 overflow-hidden"
      style={{ background: '#002244' }}
    >
      {/* Background */}
      <VideoBackground 
        src={BACKGROUND_VIDEO}
        poster={BACKGROUND_POSTER}
        overlay={true}
        overlayOpacity={0.85}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div 
          className="absolute inset-x-0 top-0"
          style={{ 
            height: '30%',
            background: 'linear-gradient(180deg, rgba(0,15,30,0.98) 0%, rgba(0,15,30,0.7) 50%, transparent 100%)',
          }}
        />
        <div 
          className="absolute inset-x-0 bottom-0"
          style={{ 
            height: '20%',
            background: 'linear-gradient(0deg, rgba(0,15,30,0.98) 0%, transparent 100%)',
          }}
        />
      </div>

      {/* Sticky Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : -20 }}
        transition={{ ...spring, delay: 0.05 }}
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
          paddingBottom: 'var(--space-4)',
          paddingLeft: 'var(--space-5)',
          paddingRight: 'var(--space-5)',
          background: 'linear-gradient(180deg, rgba(0,15,30,0.98) 0%, rgba(0,15,30,0.95) 80%, transparent 100%)',
        }}
      >
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          {/* Title Row */}
          <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-4)' }}>
            <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, rgba(105, 190, 40, 0.2) 0%, rgba(105, 190, 40, 0.08) 100%)',
                  border: '1px solid rgba(105, 190, 40, 0.3)',
                }}
              >
                <Users size={20} color="#69BE28" />
              </div>
              <div>
                <h1 
                  className="font-display"
                  style={{ 
                    fontSize: 'var(--text-subtitle)',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    color: 'rgba(255, 255, 255, 0.95)',
                    fontFamily: 'var(--font-oswald), sans-serif',
                  }}
                >
                  LEADERBOARD
                </h1>
                <p style={{ 
                  fontSize: 'var(--text-micro)',
                  color: 'rgba(255, 255, 255, 0.4)',
                }}>
                  {mockLeaderboard.length} players competing
                </p>
              </div>
            </div>
            
            {/* Filter icon */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              transition={springSnappy}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Filter size={18} color="rgba(255, 255, 255, 0.6)" />
            </motion.button>
          </div>

          {/* Filter Tabs */}
          <div 
            className="flex"
            style={{ 
              gap: 'var(--space-2)',
              padding: '4px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
            }}
          >
            {filters.map((filter) => (
              <motion.button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                whileTap={{ scale: 0.96 }}
                transition={springSnappy}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: 'var(--text-caption)',
                  fontWeight: 600,
                  letterSpacing: '0.03em',
                  background: activeFilter === filter.id 
                    ? 'rgba(105, 190, 40, 0.15)' 
                    : 'transparent',
                  color: activeFilter === filter.id 
                    ? '#69BE28' 
                    : 'rgba(255, 255, 255, 0.5)',
                  border: activeFilter === filter.id 
                    ? '1px solid rgba(105, 190, 40, 0.3)' 
                    : '1px solid transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                {filter.label}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.header>

      {/* Scrollable Content */}
      <motion.div 
        ref={scrollRef}
        className="relative z-10 h-full overflow-y-auto overflow-x-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: mounted ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 140px)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 100px)',
          paddingLeft: 'var(--space-4)',
          paddingRight: 'var(--space-4)',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          
          {/* Pull to Refresh */}
          <PullToRefresh isPulling={isPulling} progress={pullProgress} />
          
          {/* User Position Card */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <UserPositionCard 
              rank={userRank}
              entries={currentUserData?.entries || totalEntries}
              isInTopTen={isInTopTen}
              change={currentUserData?.change || 0}
            />
          </div>

          {/* Section Label */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: mounted ? 1 : 0 }}
            transition={{ ...spring, delay: 0.2 }}
            className="flex items-center justify-between"
            style={{ marginBottom: 'var(--space-3)' }}
          >
            <p style={{ 
              fontSize: 'var(--text-micro)',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'rgba(255, 255, 255, 0.4)',
            }}>
              TOP PLAYERS
            </p>
            <div className="flex items-center" style={{ gap: '6px' }}>
              <div 
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#69BE28',
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              />
              <p style={{ 
                fontSize: 'var(--text-micro)',
                color: 'rgba(255, 255, 255, 0.3)',
              }}>
                Live
              </p>
            </div>
          </motion.div>

          {/* Leaderboard List */}
          <div>
            {isLoading ? (
              [...Array(8)].map((_, i) => (
                <ShimmerRow key={i} index={i} />
              ))
            ) : (
              mockLeaderboard.map((player, index) => (
                <LeaderboardRow 
                  key={player.id} 
                  player={player} 
                  index={index}
                  isCurrentUser={player.id === CURRENT_USER_ID}
                />
              ))
            )}
          </div>

          {/* Drawing Countdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ ...spring, delay: 0.4 }}
            style={{ marginTop: 'var(--space-6)' }}
          >
            <GlassCard variant="dark" padding="md">
              <div className="flex items-center justify-between">
                <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
                  <div 
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(255,215,0,0.05) 100%)',
                      border: '1px solid rgba(255, 215, 0, 0.2)',
                    }}
                  >
                    <Clock size={18} style={{ color: '#FFD700' }} />
                  </div>
                  <div>
                    <p style={{ 
                      fontSize: 'var(--text-caption)',
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#FFD700',
                    }}>
                      NEXT DRAWING
                    </p>
                    <p style={{ 
                      fontSize: 'var(--text-micro)',
                      color: 'rgba(255, 255, 255, 0.4)',
                      marginTop: '2px',
                    }}>
                      Saturday 2PM PT
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  {drawingCountdown.isLive ? (
                    <motion.div 
                      className="flex items-center"
                      style={{ gap: '6px' }}
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <div 
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#FF3B30',
                        }}
                      />
                      <span
                        style={{ 
                          fontSize: 'var(--text-subtitle)',
                          fontWeight: 700,
                          color: '#FF3B30',
                          fontFamily: 'var(--font-oswald), sans-serif',
                        }}
                      >
                        LIVE
                      </span>
                    </motion.div>
                  ) : (
                    <p 
                      className="font-display"
                      style={{ 
                        fontSize: 'var(--text-subtitle)',
                        fontWeight: 700,
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontFamily: 'var(--font-oswald), sans-serif',
                      }}
                    >
                      {drawingCountdown.days}d {drawingCountdown.hours}h {drawingCountdown.minutes}m
                    </p>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: mounted ? 1 : 0 }}
            transition={{ ...spring, delay: 0.5 }}
            className="text-center"
            style={{ 
              marginTop: 'var(--space-6)',
              fontSize: 'var(--text-micro)',
              color: 'rgba(255, 255, 255, 0.2)',
            }}
          >
            Rankings update in real-time
          </motion.p>
          
        </div>
      </motion.div>

      {/* Shimmer animation + pulse keyframes */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
