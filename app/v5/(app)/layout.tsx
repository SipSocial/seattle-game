'use client'

/**
 * App Layout - Main app shell WITH Bottom Navigation
 * 
 * Used for all authenticated/main app routes:
 * - Game, Picks, Live, Leaderboard, Profile tabs
 * - Bottom nav persists across all routes
 * - Content area has bottom padding for nav
 * - Bottom nav hidden during gameplay (v5GameStore.session.hideBottomNav)
 */

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { BottomNav } from '../components/BottomNav'
import { useHideBottomNav } from '@/src/store/gameStore'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const hideBottomNav = useHideBottomNav()
  
  // Detect game pages that need immediate rendering (no animation delay)
  const isGamePage = pathname?.includes('/game/defense') || pathname?.includes('/game/qb')

  // For game pages, skip all animation and render immediately
  if (isGamePage) {
    return (
      <div className="fixed inset-0 flex flex-col">
        <main
          className="flex-1"
          style={{
            paddingTop: 'env(safe-area-inset-top, 0px)',
            paddingLeft: 'env(safe-area-inset-left, 0px)',
            paddingRight: 'env(safe-area-inset-right, 0px)',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}
        >
          {children}
        </main>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex flex-col">
      {/* Main content area */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={pathname}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="flex-1 overflow-y-auto overflow-x-hidden"
          style={{
            paddingTop: 'env(safe-area-inset-top, 0px)',
            paddingLeft: 'env(safe-area-inset-left, 0px)',
            paddingRight: 'env(safe-area-inset-right, 0px)',
            // Bottom padding: 49px nav height + 16px buffer + safe area (only when nav visible)
            paddingBottom: hideBottomNav 
              ? 'env(safe-area-inset-bottom, 0px)'
              : 'calc(49px + 16px + env(safe-area-inset-bottom, 0px))',
          }}
        >
          {children}
        </motion.main>
      </AnimatePresence>

      {/* Bottom Navigation - hidden during gameplay */}
      <AnimatePresence>
        {!hideBottomNav && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <BottomNav />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
