'use client'

/**
 * Onboarding Layout - No Bottom Navigation
 * 
 * Used for:
 * - Splash/trailer gate
 * - Registration wizard
 * - PWA install guide
 * 
 * Full-screen experience without app shell chrome
 */

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
