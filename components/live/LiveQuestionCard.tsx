'use client'

/**
 * LiveQuestionCard - Time-sensitive question card with countdown
 * 
 * Features:
 * - Circular countdown timer
 * - Answer buttons
 * - Time's up state
 * - Correct/incorrect feedback
 * - Smooth animations
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useCallback } from 'react'
import { LiveQuestion, LiveQuestionStatus, LiveQuestionOption } from '@/src/v5/data/liveQuestions'
import { formatCountdown } from '@/src/v5/store/liveStore'

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }

// Haptic feedback helper
const triggerHaptic = (pattern: 'light' | 'medium' | 'heavy' = 'light') => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    const durations = { light: 10, medium: 20, heavy: 40 }
    navigator.vibrate(durations[pattern])
  }
}

interface LiveQuestionCardProps {
  question: LiveQuestion
  status: LiveQuestionStatus
  timeRemaining: number
  selectedOptionId?: string
  correctOptionId?: string
  onAnswer: (optionId: string) => void
  disabled?: boolean
}

export function LiveQuestionCard({
  question,
  status,
  timeRemaining,
  selectedOptionId,
  correctOptionId,
  onAnswer,
  disabled = false,
}: LiveQuestionCardProps) {
  const [displayTime, setDisplayTime] = useState(timeRemaining)
  
  // Update display time
  useEffect(() => {
    setDisplayTime(timeRemaining)
  }, [timeRemaining])
  
  // Calculate progress for ring
  const progress = Math.min(1, displayTime / (question.timeLimit * 1000))
  const circumference = 2 * Math.PI * 44 // radius = 44
  const strokeDashoffset = circumference * (1 - progress)
  
  // Determine ring color based on time
  const getRingColor = () => {
    if (progress > 0.5) return '#69BE28'
    if (progress > 0.25) return '#FFD700'
    return '#FF4444'
  }
  
  const handleAnswer = useCallback((optionId: string) => {
    if (disabled || status !== 'active' || selectedOptionId) return
    triggerHaptic('medium')
    onAnswer(optionId)
  }, [disabled, status, selectedOptionId, onAnswer])

  const isResolved = status === 'resolved'
  const isLocked = status === 'locked'
  const isActive = status === 'active'
  const hasAnswered = !!selectedOptionId
  
  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={spring}
    >
      <div
        className="rounded-3xl p-6 relative overflow-hidden"
        style={{
          background: 'rgba(0, 34, 68, 0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${isResolved 
            ? (selectedOptionId === correctOptionId ? 'rgba(105, 190, 40, 0.5)' : 'rgba(255, 68, 68, 0.5)')
            : 'rgba(255, 255, 255, 0.1)'}`,
          boxShadow: isResolved
            ? (selectedOptionId === correctOptionId 
              ? '0 0 30px rgba(105, 190, 40, 0.3)'
              : '0 0 30px rgba(255, 68, 68, 0.3)')
            : '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Timer + Question header */}
        <div className="flex items-start gap-4 mb-6">
          {/* Countdown ring */}
          <div className="relative flex-shrink-0">
            <svg width="80" height="80" viewBox="0 0 100 100">
              {/* Background ring */}
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="6"
              />
              
              {/* Progress ring */}
              {isActive && (
                <motion.circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke={getRingColor()}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  transform="rotate(-90 50 50)"
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 0.5, ease: 'linear' }}
                />
              )}
              
              {/* Center content */}
              <foreignObject x="15" y="15" width="70" height="70">
                <div className="w-full h-full flex flex-col items-center justify-center">
                  {isActive ? (
                    <>
                      <span
                        className="font-display"
                        style={{
                          fontSize: '20px',
                          fontWeight: 700,
                          color: getRingColor(),
                        }}
                      >
                        {formatCountdown(displayTime)}
                      </span>
                      <span
                        style={{
                          fontSize: '9px',
                          color: 'rgba(255, 255, 255, 0.4)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                        }}
                      >
                        Left
                      </span>
                    </>
                  ) : isLocked ? (
                    <span
                      style={{
                        fontSize: '11px',
                        color: 'rgba(255, 255, 255, 0.5)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'center',
                      }}
                    >
                      Locked
                    </span>
                  ) : isResolved ? (
                    selectedOptionId === correctOptionId ? (
                      <motion.span
                        style={{ fontSize: '28px' }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={spring}
                      >
                        ✓
                      </motion.span>
                    ) : (
                      <motion.span
                        style={{ fontSize: '28px' }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={spring}
                      >
                        ✗
                      </motion.span>
                    )
                  ) : (
                    <span
                      style={{
                        fontSize: '11px',
                        color: 'rgba(255, 255, 255, 0.3)',
                        textTransform: 'uppercase',
                      }}
                    >
                      Soon
                    </span>
                  )}
                </div>
              </foreignObject>
            </svg>
          </div>
          
          {/* Question text */}
          <div className="flex-1 pt-2">
            {/* Question number badge */}
            <div
              className="inline-flex items-center gap-2 px-2 py-1 rounded-full mb-2"
              style={{ background: 'rgba(105, 190, 40, 0.15)' }}
            >
              <span
                style={{
                  fontSize: '10px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#69BE28',
                  fontWeight: 600,
                }}
              >
                Q{question.questionNumber} • {question.points} PTS
              </span>
            </div>
            
            <h3
              style={{
                fontSize: 'var(--text-body)',
                color: 'rgba(255, 255, 255, 0.95)',
                fontWeight: 600,
                lineHeight: 1.4,
              }}
            >
              {question.question}
            </h3>
          </div>
        </div>

        {/* Answer options */}
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="wait">
            {question.options.map((option, index) => (
              <AnswerButton
                key={option.id}
                option={option}
                isSelected={selectedOptionId === option.id}
                isCorrect={correctOptionId === option.id}
                isResolved={isResolved}
                isActive={isActive}
                hasAnswered={hasAnswered}
                disabled={disabled || !isActive || hasAnswered}
                onSelect={() => handleAnswer(option.id)}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Status feedback */}
        <AnimatePresence>
          {isResolved && hasAnswered && (
            <motion.div
              className="mt-4 p-3 rounded-xl text-center"
              style={{
                background: selectedOptionId === correctOptionId
                  ? 'rgba(105, 190, 40, 0.15)'
                  : 'rgba(255, 68, 68, 0.15)',
              }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={spring}
            >
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: selectedOptionId === correctOptionId
                    ? '#69BE28'
                    : '#FF4444',
                }}
              >
                {selectedOptionId === correctOptionId
                  ? `+${question.points} points!`
                  : 'Incorrect'}
              </span>
            </motion.div>
          )}
          
          {isLocked && !hasAnswered && (
            <motion.div
              className="mt-4 p-3 rounded-xl text-center"
              style={{ background: 'rgba(255, 255, 255, 0.05)' }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={spring}
            >
              <span
                style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.5)',
                }}
              >
                Time&apos;s up! No answer submitted.
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// Answer button component
interface AnswerButtonProps {
  option: LiveQuestionOption
  isSelected: boolean
  isCorrect: boolean
  isResolved: boolean
  isActive: boolean
  hasAnswered: boolean
  disabled: boolean
  onSelect: () => void
  index: number
}

function AnswerButton({
  option,
  isSelected,
  isCorrect,
  isResolved,
  isActive,
  hasAnswered,
  disabled,
  onSelect,
  index,
}: AnswerButtonProps) {
  // Determine button state colors
  const getBackground = () => {
    if (isResolved) {
      if (isCorrect) return 'rgba(105, 190, 40, 0.25)'
      if (isSelected) return 'rgba(255, 68, 68, 0.25)'
    }
    if (isSelected) return 'rgba(105, 190, 40, 0.2)'
    return 'rgba(255, 255, 255, 0.05)'
  }
  
  const getBorder = () => {
    if (isResolved) {
      if (isCorrect) return '2px solid #69BE28'
      if (isSelected) return '2px solid #FF4444'
    }
    if (isSelected) return '2px solid #69BE28'
    return '2px solid rgba(255, 255, 255, 0.1)'
  }
  
  const getTextColor = () => {
    if (isResolved && isCorrect) return '#69BE28'
    if (isResolved && isSelected && !isCorrect) return '#FF4444'
    if (isSelected) return '#69BE28'
    return 'rgba(255, 255, 255, 0.9)'
  }

  return (
    <motion.button
      className="w-full text-left rounded-xl relative overflow-hidden"
      style={{
        padding: '14px 18px',
        background: getBackground(),
        border: getBorder(),
        opacity: disabled && !isSelected && !isCorrect ? 0.5 : 1,
        cursor: disabled ? 'default' : 'pointer',
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...spring, delay: index * 0.05 }}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      onClick={onSelect}
      disabled={disabled}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {option.emoji && (
            <span style={{ fontSize: '20px' }}>{option.emoji}</span>
          )}
          <span
            style={{
              fontSize: '15px',
              fontWeight: 600,
              color: getTextColor(),
            }}
          >
            {option.label}
          </span>
        </div>

        {/* Selection/correct indicator */}
        {(isSelected || (isResolved && isCorrect)) && (
          <motion.div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{
              background: isResolved
                ? (isCorrect ? '#69BE28' : '#FF4444')
                : '#69BE28',
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={spring}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
            >
              {isResolved && !isCorrect && isSelected ? (
                <path
                  d="M4 4L10 10M10 4L4 10"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M2.5 7L5.5 10L11.5 4"
                  stroke="#002244"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          </motion.div>
        )}
      </div>

      {/* Selection glow */}
      {isSelected && isActive && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(105, 190, 40, 0.2) 0%, transparent 70%)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.button>
  )
}

export default LiveQuestionCard
