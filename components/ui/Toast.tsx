'use client'

import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type ToastVariant = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  variant?: ToastVariant
  onClose: () => void
  duration?: number
  isVisible?: boolean
}

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }

const variantStyles: Record<ToastVariant, {
  background: string
  border: string
  icon: React.ReactNode
}> = {
  success: {
    background: 'rgba(105, 190, 40, 0.15)',
    border: 'rgba(105, 190, 40, 0.5)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="9" stroke="#69BE28" strokeWidth="2" />
        <path d="M6 10L9 13L14 7" stroke="#69BE28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  error: {
    background: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.5)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="9" stroke="#ef4444" strokeWidth="2" />
        <path d="M7 7L13 13M13 7L7 13" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  info: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'rgba(255, 255, 255, 0.3)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="9" stroke="white" strokeWidth="2" />
        <path d="M10 9V14M10 6V7" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
}

export function Toast({ 
  message, 
  variant = 'info', 
  onClose, 
  duration = 3000,
  isVisible = true,
}: ToastProps) {
  const styles = variantStyles[variant]
  
  // Auto-dismiss
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])
  
  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-[100] flex justify-center px-4"
          style={{
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
          }}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={spring}
        >
          <motion.div
            className="flex items-center gap-3"
            style={{
              padding: '14px 20px',
              paddingRight: '16px',
              background: styles.background,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: `1px solid ${styles.border}`,
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              maxWidth: '400px',
              width: '100%',
            }}
          >
            {/* Icon */}
            <div className="shrink-0">
              {styles.icon}
            </div>
            
            {/* Message */}
            <p
              className="flex-1 text-[14px] font-medium"
              style={{ color: 'rgba(255, 255, 255, 0.95)' }}
            >
              {message}
            </p>
            
            {/* Close button */}
            <motion.button
              onClick={handleClose}
              className="shrink-0 p-1 rounded-full"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                minWidth: '28px',
                minHeight: '28px',
              }}
              whileHover={{ background: 'rgba(255, 255, 255, 0.2)' }}
              whileTap={{ scale: 0.9 }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mx-auto">
                <path d="M4 4L12 12M12 4L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Toast container component for managing multiple toasts
interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastContainerProps {
  toasts: ToastItem[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast, index) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -50 }}
            animate={{ 
              opacity: 1, 
              y: index * 60,
            }}
            exit={{ opacity: 0, y: -50 }}
            transition={spring}
            className="pointer-events-auto"
          >
            <Toast
              message={toast.message}
              variant={toast.variant}
              onClose={() => onRemove(toast.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default Toast
