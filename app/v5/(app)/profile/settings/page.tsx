'use client'

/**
 * Settings Page - Simplified, premium quality
 * 
 * Design: Minimal, essential settings only
 * - Notifications toggle
 * - Sign out
 * - Delete account
 * - App version
 */

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { 
  ArrowLeft,
  Bell,
  LogOut,
  Trash2,
  X,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { GhostButton } from '@/components/ui/GhostButton'

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }

// Toggle Switch Component
function Toggle({ 
  enabled, 
  onChange, 
}: { 
  enabled: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <motion.button
      onClick={() => onChange(!enabled)}
      className="relative shrink-0"
      style={{
        width: '48px',
        height: '28px',
        borderRadius: '14px',
        background: enabled 
          ? 'linear-gradient(135deg, #69BE28, #5AAD1E)'
          : 'rgba(255, 255, 255, 0.1)',
        border: enabled 
          ? '1px solid rgba(105, 190, 40, 0.5)'
          : '1px solid rgba(255, 255, 255, 0.15)',
        cursor: 'pointer',
      }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute rounded-full"
        style={{
          top: '3px',
          width: '22px',
          height: '22px',
          background: 'white',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
        }}
        animate={{
          left: enabled ? '22px' : '3px',
        }}
        transition={spring}
      />
    </motion.button>
  )
}

// Delete Account Modal
function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  const [confirmText, setConfirmText] = useState('')
  const canDelete = confirmText.toLowerCase() === 'delete'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            className="relative z-10 w-full"
            style={{ maxWidth: '360px', padding: '24px' }}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={spring}
          >
            <GlassCard padding="lg" variant="dark">
              <motion.button
                onClick={onClose}
                className="absolute flex items-center justify-center"
                style={{ 
                  top: '16px', 
                  right: '16px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={18} color="rgba(255,255,255,0.7)" />
              </motion.button>

              <div 
                className="mx-auto flex items-center justify-center"
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '2px solid rgba(239, 68, 68, 0.4)',
                  marginBottom: '20px',
                }}
              >
                <AlertTriangle size={28} color="#EF4444" />
              </div>

              <h2 
                className="text-center"
                style={{
                  fontFamily: 'var(--font-oswald), sans-serif',
                  fontSize: 'clamp(20px, 5vw, 24px)',
                  fontWeight: 700,
                  color: 'white',
                  letterSpacing: '0.08em',
                  marginBottom: '12px',
                }}
              >
                DELETE ACCOUNT?
              </h2>

              <p 
                className="text-center"
                style={{
                  fontFamily: 'var(--font-oswald), sans-serif',
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  lineHeight: 1.5,
                  marginBottom: '24px',
                }}
              >
                This action cannot be undone. All your progress and entries will be permanently deleted.
              </p>

              <div style={{ marginBottom: '24px' }}>
                <p 
                  style={{
                    fontFamily: 'var(--font-oswald), sans-serif',
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    letterSpacing: '0.1em',
                    marginBottom: '8px',
                  }}
                >
                  Type <strong style={{ color: '#EF4444' }}>DELETE</strong> to confirm
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type DELETE here"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontFamily: 'var(--font-oswald), sans-serif',
                    fontSize: '15px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <motion.button
                  onClick={onConfirm}
                  disabled={!canDelete}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '100px',
                    fontFamily: 'var(--font-oswald), sans-serif',
                    fontSize: '14px',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    background: canDelete 
                      ? 'linear-gradient(135deg, #EF4444, #DC2626)' 
                      : 'rgba(255, 255, 255, 0.1)',
                    color: canDelete ? 'white' : 'rgba(255, 255, 255, 0.3)',
                    border: 'none',
                    cursor: canDelete ? 'pointer' : 'not-allowed',
                    opacity: canDelete ? 1 : 0.5,
                  }}
                  whileTap={canDelete ? { scale: 0.98 } : undefined}
                >
                  Delete My Account
                </motion.button>
                <GhostButton size="lg" fullWidth variant="subtle" onClick={onClose}>
                  Cancel
                </GhostButton>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load notification preference
    const saved = localStorage.getItem('darkside-notifications')
    if (saved !== null) {
      setNotifications(saved === 'true')
    }
  }, [])

  const handleNotificationChange = useCallback((enabled: boolean) => {
    setNotifications(enabled)
    localStorage.setItem('darkside-notifications', String(enabled))
  }, [])

  const handleSignOut = useCallback(() => {
    localStorage.clear()
    window.location.href = '/v5'
  }, [])

  const handleDeleteAccount = useCallback(() => {
    localStorage.clear()
    window.location.href = '/v5'
  }, [])

  return (
    <div 
      className="min-h-full"
      style={{
        background: 'linear-gradient(180deg, #001428 0%, #002244 50%, #001A33 100%)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 120px)',
      }}
    >
      {/* Header */}
      <motion.header
        className="sticky top-0 z-40 flex items-center"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
          paddingBottom: '16px',
          paddingLeft: '24px',
          paddingRight: '24px',
          gap: '16px',
          background: 'linear-gradient(180deg, rgba(0,20,40,0.98) 0%, rgba(0,20,40,0.9) 80%, transparent 100%)',
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : -20 }}
        transition={spring}
      >
        <Link href="/v5/profile">
          <motion.div
            className="flex items-center justify-center"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={22} color="white" />
          </motion.div>
        </Link>
        <h1 
          style={{
            fontFamily: 'var(--font-oswald), sans-serif',
            fontSize: 'clamp(18px, 4.5vw, 22px)',
            fontWeight: 700,
            color: 'white',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          SETTINGS
        </h1>
      </motion.header>

      {/* Content */}
      <div style={{ padding: '8px 24px' }}>
        
        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
          transition={{ ...spring, delay: 0.1 }}
          style={{ marginBottom: '16px' }}
        >
          <GlassCard padding="md">
            <div className="flex items-center" style={{ gap: '16px' }}>
              <div 
                className="flex items-center justify-center"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, rgba(105, 190, 40, 0.2) 0%, rgba(105, 190, 40, 0.08) 100%)',
                  border: '1px solid rgba(105, 190, 40, 0.3)',
                  flexShrink: 0,
                }}
              >
                <Bell size={22} color="#69BE28" />
              </div>
              <div style={{ flex: 1 }}>
                <p 
                  style={{ 
                    fontFamily: 'var(--font-oswald), sans-serif',
                    fontSize: '16px',
                    color: 'white',
                    fontWeight: 600,
                    letterSpacing: '0.03em',
                  }}
                >
                  Push Notifications
                </p>
                <p 
                  style={{ 
                    fontFamily: 'var(--font-oswald), sans-serif',
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    marginTop: '2px',
                    letterSpacing: '0.05em',
                  }}
                >
                  Game alerts and prize updates
                </p>
              </div>
              <Toggle enabled={notifications} onChange={handleNotificationChange} />
            </div>
          </GlassCard>
        </motion.div>

        {/* Account Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
          transition={{ ...spring, delay: 0.15 }}
          style={{ marginBottom: '16px' }}
        >
          <GlassCard padding="none">
            {/* Sign Out */}
            <motion.button
              onClick={handleSignOut}
              className="w-full flex items-center"
              style={{ 
                padding: '18px 20px',
                gap: '16px',
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div 
                className="flex items-center justify-center"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  flexShrink: 0,
                }}
              >
                <LogOut size={20} color="rgba(255,255,255,0.7)" />
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <p 
                  style={{ 
                    fontFamily: 'var(--font-oswald), sans-serif',
                    fontSize: '16px',
                    color: 'white',
                    fontWeight: 500,
                    letterSpacing: '0.03em',
                  }}
                >
                  Sign Out
                </p>
                <p 
                  style={{ 
                    fontFamily: 'var(--font-oswald), sans-serif',
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.4)',
                    marginTop: '2px',
                    letterSpacing: '0.05em',
                  }}
                >
                  You can sign back in anytime
                </p>
              </div>
              <ChevronRight size={20} color="rgba(255,255,255,0.3)" />
            </motion.button>

            {/* Delete Account */}
            <motion.button
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center"
              style={{ 
                padding: '18px 20px',
                gap: '16px',
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div 
                className="flex items-center justify-center"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  flexShrink: 0,
                }}
              >
                <Trash2 size={20} color="#EF4444" />
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <p 
                  style={{ 
                    fontFamily: 'var(--font-oswald), sans-serif',
                    fontSize: '16px',
                    color: '#EF4444',
                    fontWeight: 500,
                    letterSpacing: '0.03em',
                  }}
                >
                  Delete Account
                </p>
                <p 
                  style={{ 
                    fontFamily: 'var(--font-oswald), sans-serif',
                    fontSize: '12px',
                    color: 'rgba(239, 68, 68, 0.6)',
                    marginTop: '2px',
                    letterSpacing: '0.05em',
                  }}
                >
                  Permanently remove your data
                </p>
              </div>
              <ChevronRight size={20} color="rgba(239,68,68,0.4)" />
            </motion.button>
          </GlassCard>
        </motion.div>

        {/* App Info */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: mounted ? 1 : 0 }}
          transition={{ delay: 0.3 }}
          style={{ paddingTop: '32px' }}
        >
          <p 
            style={{
              fontFamily: 'var(--font-oswald), sans-serif',
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.3)',
              letterSpacing: '0.1em',
            }}
          >
            Dark Side Football v5.0
          </p>
          <p 
            style={{
              fontFamily: 'var(--font-oswald), sans-serif',
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.2)',
              marginTop: '6px',
              letterSpacing: '0.1em',
            }}
          >
            © 2026 DrinkSip
          </p>
        </motion.div>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
      />
    </div>
  )
}
