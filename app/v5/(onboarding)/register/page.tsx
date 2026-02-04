'use client'

/**
 * Dark Side Football - Premium Registration Wizard
 * 
 * Rebuilt with north star design principles:
 * - Video background + gradient overlays
 * - Glassmorphism cards
 * - Lucide icons only (no emojis)
 * - Compact typography (10-14px)
 * - Full clickable checkbox rows
 * - Premium gold/green accents
 */

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mail, 
  User, 
  MapPin, 
  CheckCircle2, 
  ChevronLeft, 
  Sparkles,
  Check,
  X,
} from 'lucide-react'

// === ASSETS ===
const BACKGROUND_VIDEO = 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/4b5f0ad3-9f4e-413f-b44a-053e9af6240c/4b5f0ad3-9f4e-413f-b44a-053e9af6240c.mp4'
const BACKGROUND_POSTER = 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/16412705-ca65-400e-bb78-80ff29be860a/segments/2:2:1/Phoenix_Empty_NFL_football_field_at_night_dramatic_billowing_s_0.jpg'
const DRINKSHIP_LOGO = 'https://cdn.shopify.com/s/files/1/0407/8580/5468/files/DrinkSip_Logo_SVG.svg?v=1759624477'

// === DESIGN SYSTEM ===
const COLORS = {
  navy: '#002244',
  green: '#69BE28',
  greenLight: '#7DD33B',
  gold: '#FFD700',
  goldDark: '#FFA500',
  white: '#FFFFFF',
  textPrimary: 'rgba(255,255,255,0.9)',
  textSecondary: 'rgba(255,255,255,0.5)',
  textMuted: 'rgba(255,255,255,0.3)',
  border: 'rgba(255,255,255,0.1)',
  borderGreen: 'rgba(105,190,40,0.3)',
  glass: 'rgba(0,34,68,0.6)',
  glassLight: 'rgba(0,34,68,0.4)',
}

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }

// === LEGAL CONTENT - Ultra simple bullet points ===
const TERMS_BULLETS = [
  'US residents only',
  '21+ to play',
  'No purchase necessary',
  'Earn entries: register, play, picks, live',
  'Grand prize: Big Game tickets + travel',
  'Not affiliated with NFL or Apple',
  'Void where prohibited',
]

const PRIVACY_BULLETS = [
  'We collect: email, name, address',
  'Used for: prizes, leaderboards',
  'Marketing only if you opt-in',
  'Data encrypted & secure',
  'Never sold to anyone',
  'Delete anytime: privacy@drinksip.com',
]

// === COMPONENT: Legal Modal - Ultra simple ===
function LegalModal({
  isOpen,
  onClose,
  type,
}: {
  isOpen: boolean
  onClose: () => void
  type: 'terms' | 'privacy'
}) {
  const isTerms = type === 'terms'
  const bullets = isTerms ? TERMS_BULLETS : PRIVACY_BULLETS
  const title = isTerms ? 'Terms' : 'Privacy'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          {/* Backdrop */}
          <motion.div
            onClick={onClose}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(12px)',
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={spring}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '380px',
              background: COLORS.navy,
              borderRadius: '16px 16px 0 0',
              border: `1px solid ${COLORS.border}`,
              borderBottom: 'none',
            }}
          >
            {/* Drag Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
              <div style={{ width: '32px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.15)' }} />
            </div>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 16px' }}>
              <h2 style={{ 
                fontSize: 'var(--text-subtitle, 18px)', 
                fontWeight: 700, 
                color: COLORS.white,
              }}>
                {title}
              </h2>
              <motion.button
                onClick={onClose}
                whileTap={{ scale: 0.9 }}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.08)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={14} color={COLORS.textSecondary} />
              </motion.button>
            </div>

            {/* Bullets */}
            <div style={{ padding: '0 20px 20px' }}>
              {bullets.map((bullet, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '10px 0',
                    borderBottom: idx < bullets.length - 1 ? `1px solid ${COLORS.border}` : 'none',
                  }}
                >
                  <Check size={14} color={COLORS.green} style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ fontSize: 'var(--text-body, 14px)', color: COLORS.textPrimary }}>
                    {bullet}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ 
              padding: '12px 20px', 
              borderTop: `1px solid ${COLORS.border}`,
              paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
            }}>
              <p style={{ fontSize: 'var(--text-caption, 12px)', color: COLORS.textMuted, textAlign: 'center' }}>
                DrinkSip, Inc. • Delaware • {isTerms ? 'legal' : 'privacy'}@drinksip.com
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// === STEP CONFIG ===
const STEPS = [
  { id: 1, title: 'Email', icon: Mail },
  { id: 2, title: 'Name', icon: User },
  { id: 3, title: 'Address', icon: MapPin },
  { id: 4, title: 'Confirm', icon: CheckCircle2 },
]

// US States
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
]

// === COMPONENT: Glass Card ===
function GlassCard({ 
  children, 
  className = '',
  style = {},
}: { 
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className={className}
      style={{
        background: COLORS.glass,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: `1px solid ${COLORS.border}`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// === COMPONENT: Premium Input ===
function PremiumInput({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  required = false,
  autoComplete,
}: {
  label: string
  placeholder: string
  type?: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  autoComplete?: string
}) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label
        style={{
          display: 'block',
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: COLORS.textSecondary,
          marginBottom: '8px',
        }}
      >
        {label} {required && <span style={{ color: COLORS.green }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{
          width: '100%',
          padding: '14px 16px',
          fontSize: '14px',
          color: COLORS.white,
          background: 'rgba(255,255,255,0.05)',
          border: `1px solid ${COLORS.border}`,
          borderRadius: '12px',
          outline: 'none',
          transition: 'border-color 0.2s, background 0.2s',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = COLORS.green
          e.target.style.background = 'rgba(105,190,40,0.05)'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = COLORS.border
          e.target.style.background = 'rgba(255,255,255,0.05)'
        }}
      />
    </div>
  )
}

// === COMPONENT: Premium Select ===
function PremiumSelect({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
  required?: boolean
}) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label
        style={{
          display: 'block',
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: COLORS.textSecondary,
          marginBottom: '8px',
        }}
      >
        {label} {required && <span style={{ color: COLORS.green }}>*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '14px 16px',
          fontSize: '14px',
          color: value ? COLORS.white : COLORS.textSecondary,
          background: 'rgba(255,255,255,0.05)',
          border: `1px solid ${COLORS.border}`,
          borderRadius: '12px',
          outline: 'none',
          cursor: 'pointer',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          backgroundSize: '16px',
        }}
      >
        <option value="" style={{ background: COLORS.navy }}>Select state</option>
        {options.map((opt) => (
          <option key={opt} value={opt} style={{ background: COLORS.navy }}>{opt}</option>
        ))}
      </select>
    </div>
  )
}

// === COMPONENT: Premium Checkbox ===
function PremiumCheckbox({
  checked,
  onChange,
  children,
  required = false,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        width: '100%',
        padding: '16px',
        background: checked ? 'rgba(105,190,40,0.08)' : 'transparent',
        border: 'none',
        borderBottom: `1px solid ${COLORS.border}`,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 0.2s',
      }}
    >
      {/* Checkbox */}
      <motion.div
        animate={{
          borderColor: checked ? COLORS.green : 'rgba(255,255,255,0.3)',
          backgroundColor: checked ? 'rgba(105,190,40,0.2)' : 'rgba(255,255,255,0.05)',
        }}
        transition={spring}
        style={{
          width: '24px',
          height: '24px',
          minWidth: '24px',
          borderRadius: '6px',
          border: `2px solid ${checked ? COLORS.green : 'rgba(255,255,255,0.3)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AnimatePresence>
          {checked && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={spring}
            >
              <Check size={14} color={COLORS.green} strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Label */}
      <span style={{ 
        fontSize: '13px', 
        lineHeight: 1.5, 
        color: COLORS.textPrimary,
        flex: 1,
      }}>
        {children}
        {required && <span style={{ color: COLORS.green, marginLeft: '4px' }}>*</span>}
      </span>
    </button>
  )
}

// === COMPONENT: Progress Bar ===
function ProgressBar({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const progress = (currentStep / totalSteps) * 100
  
  return (
    <div style={{ 
      height: '3px', 
      background: 'rgba(255,255,255,0.1)', 
      borderRadius: '2px',
      overflow: 'hidden',
    }}>
      <motion.div
        initial={false}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{
          height: '100%',
          background: `linear-gradient(90deg, ${COLORS.green} 0%, ${COLORS.greenLight} 100%)`,
          borderRadius: '2px',
        }}
      />
    </div>
  )
}

// === COMPONENT: Step Header ===
function StepHeader({ 
  step, 
  title, 
  onBack, 
  showBack = true 
}: { 
  step: number
  title: string 
  onBack: () => void
  showBack?: boolean
}) {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      position: 'relative',
      marginBottom: '16px',
    }}>
      {showBack && (
        <motion.button
          onClick={onBack}
          whileTap={{ scale: 0.9 }}
          style={{
            position: 'absolute',
            left: 0,
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '10px',
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={20} color={COLORS.white} />
        </motion.button>
      )}
      
      <div style={{ textAlign: 'center' }}>
        <p style={{ 
          fontSize: '9px', 
          fontWeight: 600,
          letterSpacing: '0.2em', 
          textTransform: 'uppercase',
          color: COLORS.green,
          marginBottom: '4px',
        }}>
          STEP {step} OF 4
        </p>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: 700,
          fontFamily: 'var(--font-oswald), sans-serif',
          color: COLORS.white,
        }}>
          {title}
        </h2>
      </div>
    </div>
  )
}

// === COMPONENT: Continue Button ===
function ContinueButton({ 
  onClick, 
  disabled = false, 
  loading = false,
  children = 'Continue',
}: { 
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  children?: React.ReactNode
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      style={{
        width: '100%',
        height: '52px',
        fontSize: '13px',
        fontWeight: 700,
        fontFamily: 'var(--font-oswald), sans-serif',
        letterSpacing: '0.08em',
        color: disabled ? 'rgba(0,34,68,0.5)' : COLORS.navy,
        background: disabled 
          ? 'rgba(255,215,0,0.3)' 
          : `linear-gradient(135deg, ${COLORS.gold} 0%, ${COLORS.goldDark} 100%)`,
        border: 'none',
        borderRadius: '12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : '0 4px 20px rgba(255,215,0,0.3)',
        transition: 'all 0.2s',
      }}
    >
      {loading ? 'Processing...' : children}
    </motion.button>
  )
}

// === MAIN COMPONENT ===
export default function RegisterPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // Form state - persisted to localStorage
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreePrivacy, setAgreePrivacy] = useState(false)
  const [agreeMarketing, setAgreeMarketing] = useState(false)
  
  // Modal state
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  // Load saved form data on mount
  useEffect(() => {
    setMounted(true)
    
    // Restore form data from localStorage
    const saved = localStorage.getItem('darkside_register_form')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        if (data.email) setEmail(data.email)
        if (data.firstName) setFirstName(data.firstName)
        if (data.lastName) setLastName(data.lastName)
        if (data.address) setAddress(data.address)
        if (data.city) setCity(data.city)
        if (data.state) setState(data.state)
        if (data.zip) setZip(data.zip)
        if (data.step) setStep(data.step)
      } catch {
        // Ignore parse errors
      }
    }
  }, [])

  // Save form data whenever it changes
  useEffect(() => {
    if (!mounted) return
    
    const formData = {
      email,
      firstName,
      lastName,
      address,
      city,
      state,
      zip,
      step,
    }
    localStorage.setItem('darkside_register_form', JSON.stringify(formData))
  }, [mounted, email, firstName, lastName, address, city, state, zip, step])

  const canContinue = useCallback(() => {
    switch (step) {
      case 1:
        return email.includes('@') && email.includes('.')
      case 2:
        return firstName.trim().length > 0 && lastName.trim().length > 0
      case 3:
        return address.trim().length > 0 && city.trim().length > 0 && state.length > 0 && zip.length >= 5
      case 4:
        return agreeTerms && agreePrivacy
      default:
        return false
    }
  }, [step, email, firstName, lastName, address, city, state, zip, agreeTerms, agreePrivacy])

  const nextStep = useCallback(() => {
    if (step < 4) {
      setStep(step + 1)
    }
  }, [step])

  const prevStep = useCallback(() => {
    if (step > 1) {
      setStep(step - 1)
    }
  }, [step])

  const handleSubmit = useCallback(async () => {
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Store registration data
      localStorage.setItem('darkside_registered', 'true')
      localStorage.setItem('darkside_email', email)
      localStorage.setItem('darkside_name', `${firstName} ${lastName}`)
      localStorage.setItem('darkside_address', JSON.stringify({ address, city, state, zip }))
      
      // Clear form draft since we're done
      localStorage.removeItem('darkside_register_form')
      
      // Navigate to success
      router.push('/v5/register/success')
    } catch {
      setLoading(false)
    }
  }, [email, firstName, lastName, address, city, state, zip, router])

  const stepConfig = STEPS[step - 1]

  return (
    <div className="fixed inset-0" style={{ background: COLORS.navy }}>
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster={BACKGROUND_POSTER}
        className="absolute inset-0 w-full h-full"
        style={{ objectFit: 'cover', objectPosition: 'center' }}
      >
        <source src={BACKGROUND_VIDEO} type="video/mp4" />
      </video>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div 
          className="absolute inset-x-0 top-0" 
          style={{ 
            height: '30%', 
            background: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)' 
          }} 
        />
        <div 
          className="absolute inset-x-0 bottom-0" 
          style={{ 
            height: '50%', 
            background: 'linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)' 
          }} 
        />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 h-full w-full flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: mounted ? 1 : 0 }}
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
          paddingLeft: '16px',
          paddingRight: '16px',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '12px' }}>
          <StepHeader 
            step={step} 
            title={stepConfig.title} 
            onBack={prevStep} 
            showBack={step > 1} 
          />
          <ProgressBar currentStep={step} totalSteps={4} />
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto" style={{ paddingBottom: '100px' }}>
          <AnimatePresence mode="wait">
            {/* Step 1: Email */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={spring}
              >
                {/* Hero */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ 
                    width: '56px', 
                    height: '56px', 
                    margin: '0 auto 16px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, rgba(105,190,40,0.2) 0%, rgba(105,190,40,0.1) 100%)`,
                    border: `1px solid ${COLORS.borderGreen}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Mail size={24} color={COLORS.green} />
                  </div>
                  <h1 style={{
                    fontSize: 'clamp(1.5rem, 6vw, 2rem)',
                    fontWeight: 800,
                    fontFamily: 'var(--font-oswald), sans-serif',
                    background: `linear-gradient(180deg, ${COLORS.white} 20%, ${COLORS.green} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '8px',
                  }}>
                    GET YOUR FIRST ENTRY
                  </h1>
                  <p style={{ fontSize: '13px', color: COLORS.textSecondary }}>
                    Enter your email to join the Big Game Ticket Giveaway
                  </p>
                </div>

                {/* Form */}
                <GlassCard style={{ padding: '20px' }}>
                  <PremiumInput
                    label="Email Address"
                    placeholder="Enter your email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    required
                    autoComplete="email"
                  />
                </GlassCard>

                <p style={{ 
                  marginTop: '16px', 
                  fontSize: '10px', 
                  color: COLORS.textMuted, 
                  textAlign: 'center',
                  letterSpacing: '0.05em',
                }}>
                  No purchase necessary. Must be 21+.
                </p>
              </motion.div>
            )}

            {/* Step 2: Name */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={spring}
              >
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ 
                    width: '56px', 
                    height: '56px', 
                    margin: '0 auto 16px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, rgba(105,190,40,0.2) 0%, rgba(105,190,40,0.1) 100%)`,
                    border: `1px solid ${COLORS.borderGreen}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <User size={24} color={COLORS.green} />
                  </div>
                  <h1 style={{
                    fontSize: 'clamp(1.5rem, 6vw, 2rem)',
                    fontWeight: 800,
                    fontFamily: 'var(--font-oswald), sans-serif',
                    background: `linear-gradient(180deg, ${COLORS.white} 20%, ${COLORS.green} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '8px',
                  }}>
                    TELL US YOUR NAME
                  </h1>
                  <p style={{ fontSize: '13px', color: COLORS.textSecondary }}>
                    So we know who to congratulate when you win!
                  </p>
                </div>

                <GlassCard style={{ padding: '20px' }}>
                  <PremiumInput
                    label="First Name"
                    placeholder="First name"
                    value={firstName}
                    onChange={setFirstName}
                    required
                    autoComplete="given-name"
                  />
                  <PremiumInput
                    label="Last Name"
                    placeholder="Last name"
                    value={lastName}
                    onChange={setLastName}
                    required
                    autoComplete="family-name"
                  />
                </GlassCard>
              </motion.div>
            )}

            {/* Step 3: Address */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={spring}
              >
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ 
                    width: '56px', 
                    height: '56px', 
                    margin: '0 auto 16px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, rgba(105,190,40,0.2) 0%, rgba(105,190,40,0.1) 100%)`,
                    border: `1px solid ${COLORS.borderGreen}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <MapPin size={24} color={COLORS.green} />
                  </div>
                  <h1 style={{
                    fontSize: 'clamp(1.5rem, 6vw, 2rem)',
                    fontWeight: 800,
                    fontFamily: 'var(--font-oswald), sans-serif',
                    background: `linear-gradient(180deg, ${COLORS.white} 20%, ${COLORS.green} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '8px',
                  }}>
                    DELIVERY ADDRESS
                  </h1>
                  <p style={{ fontSize: '13px', color: COLORS.textSecondary }}>
                    Where should we send your prizes?
                  </p>
                </div>

                <GlassCard style={{ padding: '20px' }}>
                  <PremiumInput
                    label="Street Address"
                    placeholder="123 Main St"
                    value={address}
                    onChange={setAddress}
                    required
                    autoComplete="street-address"
                  />
                  <PremiumInput
                    label="City"
                    placeholder="City"
                    value={city}
                    onChange={setCity}
                    required
                    autoComplete="address-level2"
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <PremiumSelect
                      label="State"
                      value={state}
                      onChange={setState}
                      options={US_STATES}
                      required
                    />
                    <PremiumInput
                      label="ZIP Code"
                      placeholder="12345"
                      value={zip}
                      onChange={setZip}
                      required
                      autoComplete="postal-code"
                    />
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* Step 4: Confirm */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={spring}
              >
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ 
                    width: '56px', 
                    height: '56px', 
                    margin: '0 auto 16px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, rgba(255,215,0,0.2) 0%, rgba(255,165,0,0.1) 100%)`,
                    border: '1px solid rgba(255,215,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Sparkles size={24} color={COLORS.gold} />
                  </div>
                  <h1 style={{
                    fontSize: 'clamp(1.5rem, 6vw, 2rem)',
                    fontWeight: 800,
                    fontFamily: 'var(--font-oswald), sans-serif',
                    background: `linear-gradient(180deg, ${COLORS.white} 20%, ${COLORS.gold} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '8px',
                  }}>
                    ALMOST THERE!
                  </h1>
                  <p style={{ fontSize: '13px', color: COLORS.textSecondary }}>
                    Review and accept to get your entry
                  </p>
                </div>

                <GlassCard style={{ padding: '0', overflow: 'hidden' }}>
                  <PremiumCheckbox
                    checked={agreeTerms}
                    onChange={setAgreeTerms}
                    required
                  >
                    I agree to the{' '}
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setShowTermsModal(true); }}
                      style={{ 
                        color: COLORS.green, 
                        textDecoration: 'underline', 
                        background: 'none', 
                        border: 'none', 
                        padding: 0, 
                        font: 'inherit',
                        cursor: 'pointer',
                      }}
                    >
                      Terms of Service
                    </button>
                  </PremiumCheckbox>
                  
                  <PremiumCheckbox
                    checked={agreePrivacy}
                    onChange={setAgreePrivacy}
                    required
                  >
                    I agree to the{' '}
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setShowPrivacyModal(true); }}
                      style={{ 
                        color: COLORS.green, 
                        textDecoration: 'underline', 
                        background: 'none', 
                        border: 'none', 
                        padding: 0, 
                        font: 'inherit',
                        cursor: 'pointer',
                      }}
                    >
                      Privacy Policy
                    </button>
                  </PremiumCheckbox>
                  
                  <PremiumCheckbox
                    checked={agreeMarketing}
                    onChange={setAgreeMarketing}
                  >
                    I want to receive marketing emails about DrinkSip products and promotions
                  </PremiumCheckbox>
                </GlassCard>

                <p style={{ 
                  marginTop: '16px', 
                  fontSize: '10px', 
                  color: COLORS.textMuted, 
                  textAlign: 'center',
                  letterSpacing: '0.03em',
                }}>
                  By continuing, your IP address and timestamp will be recorded for legal compliance.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fixed Bottom CTA */}
        <div 
          style={{ 
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            padding: '16px',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
            background: 'linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 70%, transparent 100%)',
            zIndex: 20,
          }}
        >
          <ContinueButton
            onClick={step === 4 ? handleSubmit : nextStep}
            disabled={!canContinue()}
            loading={loading}
          >
            {step === 4 ? 'Get My Entry' : 'Continue'}
          </ContinueButton>
        </div>
      </motion.div>

      {/* Legal Modals */}
      <LegalModal 
        isOpen={showTermsModal} 
        onClose={() => setShowTermsModal(false)} 
        type="terms" 
      />
      <LegalModal 
        isOpen={showPrivacyModal} 
        onClose={() => setShowPrivacyModal(false)} 
        type="privacy" 
      />
    </div>
  )
}
