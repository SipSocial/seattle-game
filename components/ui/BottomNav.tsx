'use client'

import { motion } from 'framer-motion'
import { useCallback } from 'react'

export type TabId = 'game' | 'picks' | 'live' | 'leaderboard' | 'profile'

interface Tab {
  id: TabId
  label: string
  icon: React.ReactNode
}

interface BottomNavProps {
  currentTab: TabId
  onTabChange: (tab: TabId) => void
}

// Icon components for each tab
const GameIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#69BE28' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 11h4M8 9v4M15 12h.01M18 10h.01" />
    <rect x="2" y="6" width="20" height="12" rx="2" />
  </svg>
)

const PicksIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#69BE28' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
  </svg>
)

const LiveIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#69BE28' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="2" fill={active ? '#69BE28' : 'currentColor'} />
    <path d="M16.24 7.76a6 6 0 010 8.49m-8.48-.01a6 6 0 010-8.49m11.31-2.82a10 10 0 010 14.14m-14.14 0a10 10 0 010-14.14" />
  </svg>
)

const LeaderboardIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#69BE28' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 21v-6M12 21V9M16 21v-4M6 21h12" />
  </svg>
)

const ProfileIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#69BE28' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const tabs: Tab[] = [
  { id: 'game', label: 'Game', icon: <GameIcon active={false} /> },
  { id: 'picks', label: 'Picks', icon: <PicksIcon active={false} /> },
  { id: 'live', label: 'Live', icon: <LiveIcon active={false} /> },
  { id: 'leaderboard', label: 'Board', icon: <LeaderboardIcon active={false} /> },
  { id: 'profile', label: 'Profile', icon: <ProfileIcon active={false} /> },
]

// Haptic feedback helper
const triggerHaptic = () => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(10)
  }
}

export function BottomNav({ currentTab, onTabChange }: BottomNavProps) {
  const handleTabPress = useCallback((tabId: TabId) => {
    if (tabId !== currentTab) {
      triggerHaptic()
      onTabChange(tabId)
    }
  }, [currentTab, onTabChange])

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        height: 'calc(49px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'rgba(0, 34, 68, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <div 
        className="flex items-center justify-around h-[49px] px-2"
        style={{ maxWidth: '500px', margin: '0 auto' }}
      >
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => handleTabPress(tab.id)}
              className="relative flex flex-col items-center justify-center flex-1 h-full"
              style={{
                minWidth: '48px',
                minHeight: '48px',
                WebkitTapHighlightColor: 'transparent',
              }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-full"
                  style={{ background: '#69BE28' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                />
              )}
              
              {/* Icon */}
              <div
                className="flex items-center justify-center"
                style={{
                  color: isActive ? '#69BE28' : 'rgba(255, 255, 255, 0.5)',
                  marginBottom: '2px',
                }}
              >
                {tab.id === 'game' && <GameIcon active={isActive} />}
                {tab.id === 'picks' && <PicksIcon active={isActive} />}
                {tab.id === 'live' && <LiveIcon active={isActive} />}
                {tab.id === 'leaderboard' && <LeaderboardIcon active={isActive} />}
                {tab.id === 'profile' && <ProfileIcon active={isActive} />}
              </div>
              
              {/* Label */}
              <span
                className="text-[10px] uppercase tracking-wider font-medium"
                style={{
                  color: isActive ? '#69BE28' : 'rgba(255, 255, 255, 0.5)',
                  fontFamily: 'var(--font-oswald), sans-serif',
                }}
              >
                {tab.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav
