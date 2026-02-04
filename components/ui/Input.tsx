'use client'

import { forwardRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface InputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'tel' | 'number'
  error?: string
  disabled?: boolean
  label?: string
  className?: string
  name?: string
  autoComplete?: string
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  maxLength?: number
}

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }

// Shake animation for error state
const shakeAnimation = {
  x: [0, -10, 10, -10, 10, -5, 5, 0],
  transition: { duration: 0.5 }
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    value, 
    onChange, 
    placeholder, 
    type = 'text', 
    error, 
    disabled,
    label,
    className = '',
    name,
    autoComplete,
    onFocus: externalOnFocus,
    onBlur: externalOnBlur,
    maxLength,
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const [hasError, setHasError] = useState(false)
    
    // Trigger shake when error changes
    const shouldShake = error && !hasError
    if (shouldShake) {
      setHasError(true)
      setTimeout(() => setHasError(false), 500)
    }
    
    const getBorderColor = () => {
      if (error) return 'rgba(239, 68, 68, 0.8)' // red
      if (isFocused) return 'rgba(105, 190, 40, 0.8)' // green
      return 'rgba(255, 255, 255, 0.15)'
    }
    
    const getBoxShadow = () => {
      if (error) return '0 0 0 3px rgba(239, 68, 68, 0.2), 0 0 20px rgba(239, 68, 68, 0.1)'
      if (isFocused) return '0 0 0 3px rgba(105, 190, 40, 0.2), 0 0 20px rgba(105, 190, 40, 0.1)'
      return 'none'
    }
    
    return (
      <div className={`w-full ${className}`}>
        {/* Label */}
        {label && (
          <label
            className="block mb-2 text-[12px] uppercase tracking-widest font-medium"
            style={{ color: 'rgba(255, 255, 255, 0.6)' }}
          >
            {label}
          </label>
        )}
        
        {/* Input wrapper */}
        <motion.div
          animate={hasError ? shakeAnimation : {}}
        >
          <motion.input
            ref={ref}
            type={type}
            value={value}
            name={name}
            autoComplete={autoComplete}
            maxLength={maxLength}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            onFocus={(e) => {
              setIsFocused(true)
              externalOnFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              externalOnBlur?.(e)
            }}
            className="w-full outline-none"
            style={{
              height: '52px',
              padding: '0 18px',
              fontSize: 'var(--step-0)',
              fontFamily: 'inherit',
              color: disabled ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.95)',
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: `1px solid ${getBorderColor()}`,
              borderRadius: '14px',
              boxShadow: getBoxShadow(),
              transition: 'border-color 0.2s, box-shadow 0.2s',
              cursor: disabled ? 'not-allowed' : 'text',
              opacity: disabled ? 0.6 : 1,
            }}
            animate={{
              borderColor: getBorderColor(),
            }}
            transition={spring}
          />
        </motion.div>
        
        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-2 text-[12px] font-medium"
              style={{ color: '#ef4444' }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
