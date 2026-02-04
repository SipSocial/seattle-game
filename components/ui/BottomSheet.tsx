'use client'

import { ReactNode, useCallback, useEffect } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
}

// Haptic feedback helper
const triggerHaptic = () => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(10)
  }
}

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }

export function BottomSheet({ isOpen, onClose, children, title }: BottomSheetProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])
  
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])
  
  const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Close if dragged down more than 100px or with velocity > 500
    if (info.offset.y > 100 || info.velocity.y > 500) {
      triggerHaptic()
      onClose()
    }
  }, [onClose])
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          
          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50"
            style={{
              background: 'rgba(0, 34, 68, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderBottom: 'none',
              paddingBottom: 'env(safe-area-inset-bottom, 24px)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={spring}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.1, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div
                className="rounded-full"
                style={{
                  width: '36px',
                  height: '5px',
                  background: 'rgba(255, 255, 255, 0.3)',
                }}
              />
            </div>
            
            {/* Title */}
            {title && (
              <div
                className="px-6 pb-4 pt-2 text-center"
                style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
              >
                <h2
                  className="font-bold uppercase tracking-wider"
                  style={{
                    fontSize: 'var(--step-1)',
                    fontFamily: 'var(--font-oswald), sans-serif',
                    color: 'rgba(255, 255, 255, 0.9)',
                  }}
                >
                  {title}
                </h2>
              </div>
            )}
            
            {/* Content */}
            <div className="px-6 py-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default BottomSheet
