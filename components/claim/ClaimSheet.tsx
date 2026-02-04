'use client'

/**
 * ClaimSheet - Bottom sheet for claim confirmation
 * 
 * Features:
 * - Prize details recap
 * - Shipping address confirmation
 * - "Claim This Prize" button
 * - Terms reminder
 * - Success state with confetti
 * - Decline option
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { GradientButton } from '@/components/ui/GradientButton'
import { GhostButton } from '@/components/ui/GhostButton'
import { GlassCard } from '@/components/ui/GlassCard'
import { Input } from '@/components/ui/Input'
import { 
  Claim, 
  ShippingAddress,
  useClaimStore,
  formatClaimCountdown,
  getStatusDisplay,
} from '@/src/v5/store/claimStore'

interface ClaimSheetProps {
  claim: Claim | null
  isOpen: boolean
  onClose: () => void
}

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }

// Confetti particle component
function ConfettiParticle({ delay, x, color }: { delay: number; x: number; color: string }) {
  return (
    <motion.div
      initial={{ y: -20, x, opacity: 1, rotate: 0 }}
      animate={{ 
        y: 400, 
        x: x + (Math.random() - 0.5) * 100,
        opacity: 0,
        rotate: Math.random() * 720 - 360,
      }}
      transition={{ 
        duration: 2 + Math.random(),
        delay,
        ease: 'easeOut',
      }}
      style={{
        position: 'absolute',
        width: '10px',
        height: '10px',
        background: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
      }}
    />
  )
}

// Confetti celebration component
function Confetti() {
  const colors = ['#69BE28', '#FFD700', '#3B82F6', '#EF4444', '#A855F7', '#EC4899']
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    delay: Math.random() * 0.5,
    x: Math.random() * 300 - 150,
    color: colors[Math.floor(Math.random() * colors.length)],
  }))
  
  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 100 }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2">
        {particles.map(p => (
          <ConfettiParticle key={p.id} {...p} />
        ))}
      </div>
    </div>
  )
}

// Success state component
function SuccessState({ prizeName, onDone }: { prizeName: string; onDone: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={spring}
      className="text-center py-6"
    >
      <Confetti />
      
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ ...spring, delay: 0.2 }}
        style={{ fontSize: '72px', marginBottom: '16px' }}
      >
        🎉
      </motion.div>
      
      <h2
        style={{
          fontSize: 'var(--step-3)',
          fontWeight: 900,
          fontFamily: 'var(--font-oswald), sans-serif',
          color: '#69BE28',
          marginBottom: '8px',
        }}
      >
        PRIZE CLAIMED!
      </h2>
      
      <p
        style={{
          fontSize: '16px',
          color: 'rgba(255,255,255,0.8)',
          marginBottom: '24px',
        }}
      >
        Your <strong>{prizeName}</strong> is on its way!
      </p>
      
      <GlassCard variant="green" padding="md" style={{ marginBottom: '24px' }}>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: '24px' }}>📦</span>
          <div className="text-left">
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>
              What&apos;s Next?
            </p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
              You&apos;ll receive a shipping confirmation email with tracking info.
            </p>
          </div>
        </div>
      </GlassCard>
      
      <GradientButton size="lg" fullWidth onClick={onDone}>
        Done
      </GradientButton>
    </motion.div>
  )
}

// Address form component
function AddressForm({
  defaultAddress,
  onSubmit,
  onCancel,
}: {
  defaultAddress: ShippingAddress | null
  onSubmit: (address: ShippingAddress) => void
  onCancel: () => void
}) {
  const [address, setAddress] = useState<ShippingAddress>(
    defaultAddress || {
      name: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zip: '',
      phone: '',
    }
  )
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({})
  
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ShippingAddress, string>> = {}
    
    if (!address.name.trim()) newErrors.name = 'Name is required'
    if (!address.addressLine1.trim()) newErrors.addressLine1 = 'Address is required'
    if (!address.city.trim()) newErrors.city = 'City is required'
    if (!address.state.trim()) newErrors.state = 'State is required'
    if (!address.zip.trim()) newErrors.zip = 'ZIP code is required'
    else if (!/^\d{5}(-\d{4})?$/.test(address.zip)) newErrors.zip = 'Invalid ZIP code'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = () => {
    if (validate()) {
      onSubmit(address)
    }
  }
  
  const updateField = (field: keyof ShippingAddress, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }
  
  return (
    <div>
      <h3
        style={{
          fontSize: '14px',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.9)',
          marginBottom: '16px',
        }}
      >
        Shipping Address
      </h3>
      
      <div className="space-y-3">
        <Input
          label="Full Name"
          value={address.name}
          onChange={(value) => updateField('name', value)}
          error={errors.name}
          placeholder="John Doe"
        />
        
        <Input
          label="Address Line 1"
          value={address.addressLine1}
          onChange={(value) => updateField('addressLine1', value)}
          error={errors.addressLine1}
          placeholder="123 Main Street"
        />
        
        <Input
          label="Address Line 2 (Optional)"
          value={address.addressLine2 || ''}
          onChange={(value) => updateField('addressLine2', value)}
          placeholder="Apt 4B"
        />
        
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <Input
              label="City"
              value={address.city}
              onChange={(value) => updateField('city', value)}
              error={errors.city}
              placeholder="Seattle"
            />
          </div>
          <div className="col-span-1">
            <Input
              label="State"
              value={address.state}
              onChange={(value) => updateField('state', value.toUpperCase().slice(0, 2))}
              error={errors.state}
              placeholder="WA"
              maxLength={2}
            />
          </div>
          <div className="col-span-1">
            <Input
              label="ZIP"
              value={address.zip}
              onChange={(value) => updateField('zip', value)}
              error={errors.zip}
              placeholder="98101"
            />
          </div>
        </div>
        
        <Input
          label="Phone (Optional)"
          value={address.phone || ''}
          onChange={(value) => updateField('phone', value)}
          placeholder="(206) 555-0123"
          type="tel"
        />
      </div>
      
      <div style={{ marginTop: '24px' }} className="space-y-3">
        <GradientButton 
          size="lg" 
          fullWidth 
          onClick={handleSubmit}
          icon={<span style={{ fontSize: '16px' }}>🎁</span>}
        >
          Confirm & Claim Prize
        </GradientButton>
        
        <GhostButton 
          size="md" 
          fullWidth 
          variant="subtle"
          onClick={onCancel}
        >
          Cancel
        </GhostButton>
      </div>
    </div>
  )
}

export function ClaimSheet({ claim, isOpen, onClose }: ClaimSheetProps) {
  const [step, setStep] = useState<'details' | 'address' | 'success'>('details')
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false)
  
  const { 
    claimPrize, 
    declinePrize, 
    defaultAddress,
    setShowConfetti,
  } = useClaimStore()
  
  // Reset step when sheet opens/closes or claim changes
  useEffect(() => {
    if (!isOpen) {
      // Reset after close animation
      const timeout = setTimeout(() => {
        setStep('details')
        setShowDeclineConfirm(false)
      }, 300)
      return () => clearTimeout(timeout)
    }
  }, [isOpen, claim?.id])
  
  // Handle claim with address
  const handleClaim = useCallback((address: ShippingAddress) => {
    if (!claim) return
    
    const success = claimPrize(claim.id, address)
    if (success) {
      setStep('success')
    }
  }, [claim, claimPrize])
  
  // Handle decline
  const handleDecline = useCallback(() => {
    if (!claim) return
    
    declinePrize(claim.id)
    onClose()
  }, [claim, declinePrize, onClose])
  
  // Handle done after success
  const handleDone = useCallback(() => {
    setShowConfetti(false)
    onClose()
  }, [setShowConfetti, onClose])
  
  if (!claim) return null
  
  const { prize } = claim
  const timeRemaining = Math.max(0, claim.expiresAt - Date.now())
  
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={step === 'success' ? handleDone : onClose}
      title={step === 'success' ? undefined : 'Claim Your Prize'}
    >
      <AnimatePresence mode="wait">
        {/* Success State */}
        {step === 'success' && (
          <SuccessState 
            key="success"
            prizeName={prize.name} 
            onDone={handleDone} 
          />
        )}
        
        {/* Address Form */}
        {step === 'address' && (
          <motion.div
            key="address"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={spring}
          >
            <AddressForm
              defaultAddress={defaultAddress}
              onSubmit={handleClaim}
              onCancel={() => setStep('details')}
            />
          </motion.div>
        )}
        
        {/* Prize Details */}
        {step === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={spring}
          >
            {/* Prize Card */}
            <GlassCard variant="green" padding="lg" style={{ marginBottom: '20px' }}>
              <div className="text-center">
                <motion.span 
                  style={{ fontSize: '56px', display: 'block', marginBottom: '12px' }}
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  {prize.tier === 'grand' ? '🏆' : prize.tier === 'major' ? '🎖️' : '🎁'}
                </motion.span>
                
                <h2
                  style={{
                    fontSize: 'var(--step-2)',
                    fontWeight: 900,
                    fontFamily: 'var(--font-oswald), sans-serif',
                    color: 'white',
                    marginBottom: '8px',
                  }}
                >
                  {prize.name}
                </h2>
                
                <p
                  style={{
                    fontSize: '14px',
                    color: 'rgba(255,255,255,0.7)',
                    lineHeight: 1.5,
                  }}
                >
                  {prize.description}
                </p>
              </div>
            </GlassCard>
            
            {/* Countdown Warning */}
            <div
              className="flex items-center gap-3 p-4 rounded-xl mb-4"
              style={{
                background: 'rgba(255, 165, 0, 0.1)',
                border: '1px solid rgba(255, 165, 0, 0.2)',
              }}
            >
              <span style={{ fontSize: '20px' }}>⏰</span>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#FFA500' }}>
                  Claim Deadline
                </p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                  {formatClaimCountdown(timeRemaining)} to claim this prize
                </p>
              </div>
            </div>
            
            {/* Terms Reminder */}
            <p
              style={{
                fontSize: '11px',
                color: 'rgba(255,255,255,0.4)',
                textAlign: 'center',
                marginBottom: '20px',
              }}
            >
              By claiming, you agree to our{' '}
              <a 
                href="https://drinksip.com/terms" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#69BE28', textDecoration: 'underline' }}
              >
                Terms of Service
              </a>
              {' '}and{' '}
              <a 
                href="https://drinksip.com/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#69BE28', textDecoration: 'underline' }}
              >
                Privacy Policy
              </a>
            </p>
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <GradientButton 
                size="lg" 
                fullWidth 
                onClick={() => setStep('address')}
                icon={<span style={{ fontSize: '16px' }}>🎉</span>}
              >
                Claim This Prize
              </GradientButton>
              
              {/* Decline option */}
              {!showDeclineConfirm ? (
                <button
                  onClick={() => setShowDeclineConfirm(true)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.4)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  I don&apos;t want this prize
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 rounded-xl"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                  }}
                >
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginBottom: '12px' }}>
                    Are you sure? Declined prizes return to the prize pool and cannot be reclaimed.
                  </p>
                  <div className="flex gap-2">
                    <GhostButton 
                      size="sm" 
                      variant="subtle"
                      onClick={() => setShowDeclineConfirm(false)}
                      style={{ flex: 1 }}
                    >
                      Keep It
                    </GhostButton>
                    <button
                      onClick={handleDecline}
                      style={{
                        flex: 1,
                        padding: '8px 16px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#EF4444',
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '20px',
                        cursor: 'pointer',
                      }}
                    >
                      Yes, Decline
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </BottomSheet>
  )
}

export default ClaimSheet
