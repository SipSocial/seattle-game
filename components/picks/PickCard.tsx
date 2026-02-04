'use client'

/**
 * PickCard - Compact, game-like prop pick card
 * 
 * Design: Matches Game Hub compact aesthetic
 * - Smaller padding (16px)
 * - Compact fonts (12-16px range)
 * - 44px touch targets
 * - Subtle borders and shadows
 */

import { motion, PanInfo } from 'framer-motion'
import { useCallback, useState } from 'react'
import { PropPick, PickOption } from '@/src/v5/data/propPicks'
import { TiebreakerScore } from '@/src/v5/store/picksStore'
import { 
  Check, 
  ChevronUp,
  ChevronDown,
  Target,
  Zap,
} from 'lucide-react'

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }
const springBouncy = { type: 'spring' as const, stiffness: 500, damping: 25 }

const triggerHaptic = () => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(10)
  }
}

interface PickCardProps {
  pick: PropPick
  selectedOptionId?: string
  tiebreakerScore?: TiebreakerScore | null
  onSelect: (optionId: string) => void
  onTiebreakerChange?: (score: TiebreakerScore) => void
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  disabled?: boolean
}

export function PickCard({
  pick,
  selectedOptionId,
  tiebreakerScore,
  onSelect,
  onTiebreakerChange,
  onSwipeLeft,
  onSwipeRight,
  disabled = false,
}: PickCardProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsDragging(false)
      if (info.offset.x < -100 || info.velocity.x < -500) {
        onSwipeLeft?.()
      } else if (info.offset.x > 100 || info.velocity.x > 500) {
        onSwipeRight?.()
      }
    },
    [onSwipeLeft, onSwipeRight]
  )

  const handleOptionSelect = (optionId: string) => {
    if (disabled) return
    triggerHaptic()
    onSelect(optionId)
  }

  // Tiebreaker
  if (pick.type === 'numeric') {
    return (
      <TiebreakerCard
        pick={pick}
        tiebreakerScore={tiebreakerScore}
        onTiebreakerChange={onTiebreakerChange}
        disabled={disabled}
      />
    )
  }

  const hasSelection = !!selectedOptionId

  return (
    <motion.div
      className="w-full"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
    >
      <div
        style={{
          background: hasSelection
            ? 'rgba(105, 190, 40, 0.06)'
            : 'rgba(255, 255, 255, 0.03)',
          border: hasSelection
            ? '1.5px solid rgba(105, 190, 40, 0.35)'
            : '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        {/* Category + Points Header */}
        <div style={{ padding: '14px 16px 0' }}>
          <div
            className="inline-flex items-center"
            style={{
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '100px',
              background: 'rgba(105, 190, 40, 0.1)',
              border: '1px solid rgba(105, 190, 40, 0.2)',
            }}
          >
            <Zap size={10} color="#69BE28" />
            <span
              style={{
                fontSize: '9px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#69BE28',
                fontWeight: 600,
              }}
            >
              {pick.category}
            </span>
            {pick.points && (
              <>
                <div style={{ width: '1px', height: '8px', background: 'rgba(105, 190, 40, 0.25)' }} />
                <span
                  style={{
                    fontSize: '9px',
                    color: 'rgba(105, 190, 40, 0.7)',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                  }}
                >
                  {pick.points} PTS
                </span>
              </>
            )}
          </div>
        </div>

        {/* Question */}
        <div style={{ padding: '12px 16px 14px' }}>
          <h2
            style={{
              fontSize: '15px',
              color: 'rgba(255, 255, 255, 0.95)',
              fontWeight: 600,
              lineHeight: 1.4,
            }}
          >
            {pick.question}
          </h2>
        </div>

        {/* Over/Under value */}
        {pick.type === 'over_under' && pick.value !== undefined && (
          <div
            style={{
              margin: '0 16px 12px',
              padding: '12px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-oswald)',
                fontSize: '28px',
                color: '#69BE28',
                fontWeight: 700,
              }}
            >
              {pick.value}
            </span>
            {pick.unit && (
              <span
                style={{
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.4)',
                  marginLeft: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                {pick.unit}
              </span>
            )}
          </div>
        )}

        {/* Options */}
        <div
          style={{
            padding: '0 16px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            pointerEvents: isDragging ? 'none' : 'auto',
          }}
        >
          {pick.options.map((option, index) => (
            <OptionButton
              key={option.id}
              option={option}
              isSelected={selectedOptionId === option.id}
              onSelect={() => handleOptionSelect(option.id)}
              disabled={disabled}
              pickType={pick.type}
              index={index}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// Option Button - Compact
interface OptionButtonProps {
  option: PickOption
  isSelected: boolean
  onSelect: () => void
  disabled: boolean
  pickType: string
  index: number
}

function OptionButton({ 
  option, 
  isSelected, 
  onSelect, 
  disabled, 
  index 
}: OptionButtonProps) {
  const getIcon = () => {
    if (option.icon === 'arrow-up' || option.id === 'over') {
      return <ChevronUp size={16} />
    }
    if (option.icon === 'arrow-down' || option.id === 'under') {
      return <ChevronDown size={16} />
    }
    return null
  }

  const icon = getIcon()

  return (
    <motion.button
      className="w-full text-left relative"
      style={{
        padding: '12px 14px',
        borderRadius: '12px',
        minHeight: '48px',
        background: isSelected
          ? 'rgba(105, 190, 40, 0.12)'
          : 'rgba(255, 255, 255, 0.02)',
        border: isSelected
          ? '1.5px solid rgba(105, 190, 40, 0.5)'
          : '1px solid rgba(255, 255, 255, 0.06)',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      whileHover={!disabled ? { 
        scale: 1.01,
        background: isSelected 
          ? 'rgba(105, 190, 40, 0.15)'
          : 'rgba(255, 255, 255, 0.04)',
      } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      onClick={onSelect}
      disabled={disabled}
      transition={spring}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center" style={{ gap: '10px' }}>
          {/* Icon or letter */}
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: isSelected 
                ? 'rgba(105, 190, 40, 0.2)'
                : 'rgba(255, 255, 255, 0.04)',
              border: isSelected
                ? '1px solid rgba(105, 190, 40, 0.35)'
                : '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isSelected ? '#69BE28' : 'rgba(255, 255, 255, 0.45)',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            {icon || String.fromCharCode(65 + index)}
          </div>

          <span
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: isSelected ? '#69BE28' : 'rgba(255, 255, 255, 0.85)',
            }}
          >
            {option.label}
          </span>
        </div>

        {/* Check indicator */}
        <div
          style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            border: isSelected ? 'none' : '1.5px solid rgba(255, 255, 255, 0.12)',
            background: isSelected ? '#69BE28' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={springBouncy}
            >
              <Check size={12} color="white" strokeWidth={3} />
            </motion.div>
          )}
        </div>
      </div>
    </motion.button>
  )
}

// Tiebreaker Card - Compact
interface TiebreakerCardProps {
  pick: PropPick
  tiebreakerScore?: TiebreakerScore | null
  onTiebreakerChange?: (score: TiebreakerScore) => void
  disabled: boolean
}

function TiebreakerCard({
  pick,
  tiebreakerScore,
  onTiebreakerChange,
  disabled,
}: TiebreakerCardProps) {
  const [seattle, setSeattle] = useState(tiebreakerScore?.seattle ?? 0)
  const [patriots, setPatriots] = useState(tiebreakerScore?.patriots ?? 0)

  const handleScoreChange = (team: 'seattle' | 'patriots', value: number) => {
    if (disabled) return
    const clampedValue = Math.max(0, Math.min(99, value))
    
    if (team === 'seattle') {
      setSeattle(clampedValue)
      onTiebreakerChange?.({ seattle: clampedValue, patriots })
    } else {
      setPatriots(clampedValue)
      onTiebreakerChange?.({ seattle, patriots: clampedValue })
    }
  }

  const hasScore = seattle > 0 || patriots > 0

  return (
    <motion.div className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={spring}>
      <div
        style={{
          background: hasScore
            ? 'rgba(168, 85, 247, 0.06)'
            : 'rgba(255, 255, 255, 0.03)',
          border: hasScore
            ? '1.5px solid rgba(168, 85, 247, 0.35)'
            : '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '14px 16px 0' }}>
          <div
            className="inline-flex items-center"
            style={{
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '100px',
              background: 'rgba(168, 85, 247, 0.1)',
              border: '1px solid rgba(168, 85, 247, 0.2)',
            }}
          >
            <Target size={10} color="#A855F7" />
            <span
              style={{
                fontSize: '9px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#A855F7',
                fontWeight: 600,
              }}
            >
              TIEBREAKER
            </span>
          </div>
        </div>

        {/* Question */}
        <div style={{ padding: '12px 16px' }}>
          <h2
            style={{
              fontSize: '15px',
              color: 'rgba(255, 255, 255, 0.95)',
              fontWeight: 600,
              lineHeight: 1.4,
            }}
          >
            {pick.question}
          </h2>
        </div>

        {/* Score inputs */}
        <div 
          className="flex items-center justify-center"
          style={{ padding: '0 16px', gap: '12px' }}
        >
          {/* Seattle */}
          <div className="flex-1 text-center">
            <div
              style={{
                marginBottom: '6px',
                fontSize: '10px',
                fontWeight: 600,
                color: '#69BE28',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Seattle
            </div>
            <input
              type="number"
              min="0"
              max="99"
              value={seattle || ''}
              placeholder="0"
              onChange={(e) => handleScoreChange('seattle', parseInt(e.target.value) || 0)}
              style={{
                width: '100%',
                textAlign: 'center',
                fontFamily: 'var(--font-oswald)',
                fontSize: '28px',
                fontWeight: 700,
                color: '#69BE28',
                background: 'rgba(105, 190, 40, 0.08)',
                border: '1.5px solid rgba(105, 190, 40, 0.25)',
                borderRadius: '12px',
                padding: '10px',
                outline: 'none',
              }}
              disabled={disabled}
            />
          </div>

          <div
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'rgba(255, 255, 255, 0.15)',
              paddingTop: '20px',
            }}
          >
            -
          </div>

          {/* Patriots */}
          <div className="flex-1 text-center">
            <div
              style={{
                marginBottom: '6px',
                fontSize: '10px',
                fontWeight: 600,
                color: '#0066CC',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Patriots
            </div>
            <input
              type="number"
              min="0"
              max="99"
              value={patriots || ''}
              placeholder="0"
              onChange={(e) => handleScoreChange('patriots', parseInt(e.target.value) || 0)}
              style={{
                width: '100%',
                textAlign: 'center',
                fontFamily: 'var(--font-oswald)',
                fontSize: '28px',
                fontWeight: 700,
                color: '#0066CC',
                background: 'rgba(0, 102, 204, 0.08)',
                border: '1.5px solid rgba(0, 102, 204, 0.25)',
                borderRadius: '12px',
                padding: '10px',
                outline: 'none',
              }}
              disabled={disabled}
            />
          </div>
        </div>

        {/* Total */}
        <div
          style={{
            margin: '14px 16px',
            padding: '10px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.03)',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.4)',
              letterSpacing: '0.08em',
            }}
          >
            TOTAL:{' '}
          </span>
          <span
            style={{
              fontSize: '14px',
              fontWeight: 700,
              color: 'white',
            }}
          >
            {seattle + patriots}
          </span>
        </div>

        {/* Footer */}
        <div style={{ padding: '0 16px 14px', textAlign: 'center' }}>
          <span
            style={{
              fontSize: '10px',
              color: 'rgba(255, 255, 255, 0.35)',
              letterSpacing: '0.08em',
            }}
          >
            Used for tiebreaker if scores match
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default PickCard
