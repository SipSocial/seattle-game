'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: ReactNode
  required?: boolean
  disabled?: boolean
}

// Haptic feedback helper
const triggerHaptic = () => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(10)
  }
}

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }

// Checkmark path animation
const checkVariants = {
  unchecked: {
    pathLength: 0,
    opacity: 0,
  },
  checked: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.2, delay: 0.1 },
  },
}

export function Checkbox({ 
  checked, 
  onChange, 
  label, 
  required = false,
  disabled = false,
}: CheckboxProps) {
  const handleToggle = () => {
    if (!disabled) {
      triggerHaptic()
      onChange(!checked)
    }
  }
  
  return (
    <label
      className="flex items-start gap-3 cursor-pointer select-none"
      style={{
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {/* Hidden native checkbox for accessibility */}
      <input
        type="checkbox"
        checked={checked}
        onChange={handleToggle}
        required={required}
        disabled={disabled}
        className="sr-only"
      />
      
      {/* Custom checkbox */}
      <motion.div
        onClick={handleToggle}
        className="relative flex items-center justify-center shrink-0"
        style={{
          width: '24px',
          height: '24px',
          minWidth: '24px',
          minHeight: '24px',
          borderRadius: '6px',
          border: `2px solid ${checked ? '#69BE28' : 'rgba(255, 255, 255, 0.3)'}`,
          background: checked ? 'rgba(105, 190, 40, 0.15)' : 'rgba(255, 255, 255, 0.05)',
          marginTop: '2px',
        }}
        whileTap={!disabled ? { scale: 0.9 } : undefined}
        animate={{
          borderColor: checked ? '#69BE28' : 'rgba(255, 255, 255, 0.3)',
          backgroundColor: checked ? 'rgba(105, 190, 40, 0.15)' : 'rgba(255, 255, 255, 0.05)',
        }}
        transition={spring}
      >
        {/* Checkmark */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          style={{ position: 'absolute' }}
        >
          <motion.path
            d="M2.5 7L5.5 10L11.5 4"
            stroke="#69BE28"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial="unchecked"
            animate={checked ? 'checked' : 'unchecked'}
            variants={checkVariants}
          />
        </svg>
      </motion.div>
      
      {/* Label */}
      {label && (
        <span
          className="text-[14px] leading-relaxed"
          style={{ 
            color: 'rgba(255, 255, 255, 0.8)',
            paddingTop: '2px',
          }}
        >
          {label}
          {required && (
            <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
          )}
        </span>
      )}
    </label>
  )
}

export default Checkbox
