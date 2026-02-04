'use client'

/**
 * BottomNav - iOS Tab Bar style navigation
 * 
 * Design specs:
 * - 49pt height + safe area inset
 * - Blur backdrop (20px)
 * - 5 tabs: Game, Picks, Live, Leaderboard, Profile
 * - Active tab: #69BE28 (green)
 * - Inactive: rgba(255,255,255,0.5)
 * - Icons + labels
 */

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Tab configuration
const tabs = [
  {
    id: 'game',
    label: 'Game',
    href: '/v5/game',
    icon: GameIcon,
  },
  {
    id: 'picks',
    label: 'Picks',
    href: '/v5/picks',
    icon: PicksIcon,
  },
  {
    id: 'live',
    label: 'Live',
    href: '/v5/live',
    icon: LiveIcon,
  },
  {
    id: 'leaderboard',
    label: 'Board',
    href: '/v5/leaderboard',
    icon: LeaderboardIcon,
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/v5/profile',
    icon: ProfileIcon,
  },
]

// Simple SVG icons
function GameIcon({ active }: { active: boolean }) {
  return (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none"
      stroke={active ? '#69BE28' : 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z" />
    </svg>
  )
}

function PicksIcon({ active }: { active: boolean }) {
  return (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none"
      stroke={active ? '#69BE28' : 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

function LiveIcon({ active }: { active: boolean }) {
  return (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none"
      stroke={active ? '#69BE28' : 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" fill={active ? '#69BE28' : 'none'} />
      <path d="M16.24 7.76a6 6 0 0 1 0 8.49" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M7.76 16.24a6 6 0 0 1 0-8.49" />
      <path d="M4.93 19.07a10 10 0 0 1 0-14.14" />
    </svg>
  )
}

function LeaderboardIcon({ active }: { active: boolean }) {
  return (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none"
      stroke={active ? '#69BE28' : 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20v-6" />
      <path d="M6 20v-4" />
      <path d="M18 20v-8" />
      <circle cx="12" cy="10" r="2" fill={active ? '#69BE28' : 'none'} />
      <circle cx="6" cy="12" r="2" fill={active ? '#69BE28' : 'none'} />
      <circle cx="18" cy="8" r="2" fill={active ? '#69BE28' : 'none'} />
    </svg>
  )
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none"
      stroke={active ? '#69BE28' : 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  )
}

export function BottomNav() {
  const pathname = usePathname()
  
  // Determine active tab from pathname
  const getActiveTab = () => {
    for (const tab of tabs) {
      if (pathname.startsWith(tab.href)) {
        return tab.id
      }
    }
    return 'game'
  }
  
  const activeTab = getActiveTab()

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'rgba(0, 10, 20, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div 
        className="flex items-center justify-around"
        style={{ height: '49px' }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className="flex-1 flex flex-col items-center justify-center gap-1 touch-manipulation"
              style={{
                height: '100%',
                color: isActive ? '#69BE28' : 'rgba(255, 255, 255, 0.5)',
                textDecoration: 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="relative"
              >
                <Icon active={isActive} />
                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2"
                    style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '2px',
                      background: '#69BE28',
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </motion.div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: isActive ? 600 : 400,
                  letterSpacing: '0.02em',
                }}
              >
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </motion.nav>
  )
}
