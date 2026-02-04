'use client'

/**
 * Live Questions Page - Game Hub-style compact experience
 * 
 * Design: Compact, game-like, professional
 * - Same sizing philosophy as Game Hub (10-14px text)
 * - Video background
 * - Subtle gradients
 * - Refined spacing
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { 
  Clock, 
  CheckCircle, 
  Lock, 
  Trophy, 
  AlertCircle, 
  Radio,
  Bell,
  XCircle,
  Zap,
  Timer,
} from 'lucide-react'
import { VideoBackground } from '@/components/ui/VideoBackground'
import { GlassCard } from '@/components/ui/GlassCard'
import { GhostButton } from '@/components/ui'
import { 
  Quarter, 
  QUARTER_ORDER,
  QUARTER_INFO,
  getQuestionsByQuarter,
  LiveQuestion,
} from '@/src/v5/data/liveQuestions'
import {
  useLiveStore,
  formatTimeUntilGame,
  getGameStartDateFormatted,
  GAME_START_TIME,
  formatCountdown,
} from '@/src/v5/store/liveStore'

const BACKGROUND_VIDEO = 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/4b5f0ad3-9f4e-413f-b44a-053e9af6240c/4b5f0ad3-9f4e-413f-b44a-053e9af6240c.mp4'
const BACKGROUND_POSTER = 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/16412705-ca65-400e-bb78-80ff29be860a/segments/2:2:1/Phoenix_Empty_NFL_football_field_at_night_dramatic_billowing_s_0.jpg'

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }
const springFast = { type: 'spring' as const, stiffness: 400, damping: 30 }

const triggerHaptic = (pattern: 'light' | 'medium' | 'heavy' = 'light') => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate({ light: 10, medium: 20, heavy: 40 }[pattern])
  }
}

export default function LivePage() {
  const [mounted, setMounted] = useState(false)
  const [timeUntilGame, setTimeUntilGame] = useState(0)
  const [celebratingQuestionId, setCelebratingQuestionId] = useState<string | null>(null)
  
  const gameStatus = useLiveStore(state => state.gameStatus)
  const selectedQuarter = useLiveStore(state => state.selectedQuarter)
  const currentQuarter = useLiveStore(state => state.currentQuarter)
  const pushEnabled = useLiveStore(state => state.pushEnabled)
  const questionStates = useLiveStore(state => state.questionStates)
  const answers = useLiveStore(state => state.answers)
  
  const setSelectedQuarter = useLiveStore(state => state.setSelectedQuarter)
  const submitAnswer = useLiveStore(state => state.submitAnswer)
  const setPushEnabled = useLiveStore(state => state.setPushEnabled)
  const getTimeRemaining = useLiveStore(state => state.getTimeRemaining)
  const getQuarterScore = useLiveStore(state => state.getQuarterScore)
  const getTotalScore = useLiveStore(state => state.getTotalScore)
  const getAnswer = useLiveStore(state => state.getAnswer)
  
  useEffect(() => { setMounted(true) }, [])
  
  useEffect(() => {
    if (!mounted) return
    const updateTime = () => setTimeUntilGame(Math.max(0, GAME_START_TIME - Date.now()))
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [mounted])
  
  const handleEnableNotifications = useCallback(async () => {
    if (!('Notification' in window)) return
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setPushEnabled(true)
        triggerHaptic('medium')
      }
    } catch (e) { console.error(e) }
  }, [setPushEnabled])
  
  const handleAnswer = useCallback((questionId: string, optionId: string) => {
    const success = submitAnswer(questionId, optionId)
    if (success) triggerHaptic('medium')
    return success
  }, [submitAnswer])
  
  useEffect(() => {
    answers.forEach(answer => {
      if (answer.correct === true && celebratingQuestionId !== answer.questionId) {
        const state = questionStates[answer.questionId]
        if (state?.status === 'resolved') {
          setCelebratingQuestionId(answer.questionId)
          triggerHaptic('heavy')
          setTimeout(() => setCelebratingQuestionId(null), 2000)
        }
      }
    })
  }, [answers, questionStates, celebratingQuestionId])
  
  const quarterProgress = useMemo(() => {
    return QUARTER_ORDER.reduce((acc, quarter) => {
      const questions = getQuestionsByQuarter(quarter)
      const answeredCount = questions.filter(q => answers.some(a => a.questionId === q.id)).length
      const correctCount = questions.filter(q => answers.find(a => a.questionId === q.id)?.correct === true).length
      acc[quarter] = { answered: answeredCount, correct: correctCount, total: questions.length }
      return acc
    }, {} as Record<Quarter, { answered: number; correct: number; total: number }>)
  }, [answers])
  
  const selectedQuarterQuestions = useMemo(() => getQuestionsByQuarter(selectedQuarter), [selectedQuarter])
  
  const countdown = formatTimeUntilGame(timeUntilGame)
  const isPreGame = timeUntilGame > 0 || gameStatus === 'pre_game'
  const isGameActive = gameStatus === 'in_progress'
  const totalScore = getTotalScore()

  return (
    <div className="min-h-full" style={{ background: '#002244' }}>
      {/* Background */}
      <VideoBackground 
        src={BACKGROUND_VIDEO}
        poster={BACKGROUND_POSTER}
        overlay={true}
        overlayOpacity={0.8}
      />

      {/* Gradient overlays */}
      <div className="fixed inset-0 z-[1] pointer-events-none">
        <div className="absolute inset-x-0 top-0" style={{ height: '30%', background: 'linear-gradient(180deg, rgba(0,10,20,0.95) 0%, transparent 100%)' }} />
        <div className="absolute inset-x-0 bottom-0" style={{ height: '30%', background: 'linear-gradient(0deg, rgba(0,10,20,0.95) 0%, transparent 100%)' }} />
      </div>

      {/* Content */}
      <motion.div 
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: mounted ? 1 : 0 }}
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 20px)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 100px)',
          paddingLeft: '20px',
          paddingRight: '20px',
        }}
      >
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          
          {/* Header */}
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : -20 }}
            transition={{ ...spring, delay: 0.1 }}
            style={{ marginBottom: '20px' }}
          >
            <div className="flex items-center" style={{ gap: '12px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(105, 190, 40, 0.15)',
                border: '1px solid rgba(105, 190, 40, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Radio className="w-4 h-4" style={{ color: '#69BE28' }} />
              </div>
              <div>
                <h1 className="font-display" style={{ 
                  fontSize: 'clamp(1.5rem, 6vw, 2rem)',
                  letterSpacing: '0.02em',
                  background: 'linear-gradient(180deg, #FFFFFF 20%, #69BE28 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  LIVE
                </h1>
                <p style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                  Predict plays for entries
                </p>
              </div>
            </div>
            
            {totalScore > 0 && (
              <motion.div
                className="flex items-center"
                style={{ gap: '6px', padding: '6px 12px', borderRadius: '100px', background: 'rgba(105, 190, 40, 0.15)', border: '1px solid rgba(105, 190, 40, 0.3)' }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <Trophy className="w-3.5 h-3.5" style={{ color: '#69BE28' }} />
                <span style={{ fontSize: '14px', color: '#69BE28', fontWeight: 700 }}>{totalScore}</span>
              </motion.div>
            )}
          </motion.div>
          
          {/* Quarter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 10 }}
            transition={{ ...spring, delay: 0.15 }}
            style={{ marginBottom: '20px' }}
          >
            <QuarterTabs
              selectedQuarter={selectedQuarter}
              currentQuarter={currentQuarter}
              onSelect={setSelectedQuarter}
              quarterProgress={quarterProgress}
              isGameActive={isGameActive}
            />
          </motion.div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {isPreGame ? (
              <PreGameContent key="pre-game" countdown={countdown} gameDate={getGameStartDateFormatted()} />
            ) : (
              <QuarterContent
                key={`quarter-${selectedQuarter}`}
                quarter={selectedQuarter}
                questions={selectedQuarterQuestions}
                questionStates={questionStates}
                onAnswer={handleAnswer}
                getTimeRemaining={getTimeRemaining}
                getAnswer={getAnswer}
                quarterScore={getQuarterScore(selectedQuarter)}
                isActive={isGameActive && currentQuarter === selectedQuarter}
                celebratingQuestionId={celebratingQuestionId}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Notification Banner */}
      <AnimatePresence>
        {!pushEnabled && isPreGame && (
          <motion.div
            className="fixed left-0 right-0 z-30"
            style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 84px)', paddingLeft: '20px', paddingRight: '20px' }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ ...spring, delay: 0.5 }}
          >
            <GlassCard variant="green" padding="sm">
              <div className="flex items-center" style={{ gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(105, 190, 40, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bell className="w-4 h-4" style={{ color: '#69BE28' }} />
                </div>
                <div className="flex-1" style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: 'white' }}>Get notified when questions drop</p>
                </div>
                <GhostButton size="sm" variant="green" onClick={handleEnableNotifications}>Enable</GhostButton>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Quarter Tabs - Compact
function QuarterTabs({ selectedQuarter, currentQuarter, onSelect, quarterProgress, isGameActive }: {
  selectedQuarter: Quarter
  currentQuarter: Quarter
  onSelect: (q: Quarter) => void
  quarterProgress: Record<Quarter, { answered: number; correct: number; total: number }>
  isGameActive: boolean
}) {
  const visibleQuarters = QUARTER_ORDER.filter(q => q !== 'OT' || isGameActive && currentQuarter === 'OT' || quarterProgress['OT'].answered > 0)
  
  return (
    <div className="flex" style={{ gap: '4px', padding: '4px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)' }}>
      {visibleQuarters.map((quarter) => {
        const isSelected = quarter === selectedQuarter
        const isCurrent = quarter === currentQuarter && isGameActive
        const progress = quarterProgress[quarter]
        const isComplete = progress.answered === progress.total && progress.total > 0
        const isLocked = isGameActive && QUARTER_ORDER.indexOf(quarter) > QUARTER_ORDER.indexOf(currentQuarter)
        
        return (
          <motion.button
            key={quarter}
            className="relative flex-1 flex flex-col items-center justify-center"
            style={{
              padding: '8px 4px',
              borderRadius: '8px',
              background: isSelected ? 'rgba(105, 190, 40, 0.2)' : 'transparent',
              opacity: isLocked ? 0.4 : 1,
              cursor: isLocked ? 'not-allowed' : 'pointer',
              minHeight: '44px',
            }}
            onClick={() => !isLocked && onSelect(quarter)}
            whileTap={!isLocked ? { scale: 0.95 } : undefined}
            disabled={isLocked}
          >
            {isCurrent && (
              <motion.div
                className="absolute"
                style={{ top: '4px', right: '4px', width: '6px', height: '6px', borderRadius: '50%', background: '#FF4444' }}
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            )}
            <span style={{ fontSize: '12px', color: isSelected ? '#69BE28' : 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{quarter}</span>
            <div className="flex" style={{ gap: '2px', marginTop: '4px' }}>
              {isComplete ? <CheckCircle className="w-3 h-3" style={{ color: '#69BE28' }} /> : (
                progress.total > 0 ? Array.from({ length: progress.total }).map((_, i) => (
                  <div key={i} style={{ width: '4px', height: '4px', borderRadius: '50%', background: i < progress.correct ? '#69BE28' : i < progress.answered ? '#FF4444' : 'rgba(255,255,255,0.2)' }} />
                )) : <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>{progress.total}</span>
              )}
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}

// Pre-Game Content - Compact
function PreGameContent({ countdown, gameDate }: { countdown: { days: number; hours: number; minutes: number; seconds: number }; gameDate: string }) {
  return (
    <motion.div className="text-center" style={{ paddingTop: '32px', paddingBottom: '32px' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={spring}>
      <motion.div className="relative mx-auto flex items-center justify-center" style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(105, 190, 40, 0.1)', border: '1px solid rgba(105, 190, 40, 0.3)', marginBottom: '20px' }}>
        {[0, 1, 2].map((i) => (
          <motion.div key={i} className="absolute inset-0 rounded-full" style={{ border: '1px solid rgba(105, 190, 40, 0.2)' }}
            animate={{ scale: [1, 1.5 + i * 0.1], opacity: [0.4, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}
        <Radio className="w-6 h-6" style={{ color: '#69BE28' }} />
      </motion.div>
      
      <h2 style={{ fontSize: '14px', color: 'white', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>QUESTIONS DROP AT KICKOFF</h2>
      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '24px' }}>{gameDate}</p>
      
      <GlassCard variant="default" padding="md" style={{ maxWidth: '320px', margin: '0 auto', marginBottom: '20px' }}>
        <div className="grid grid-cols-4" style={{ gap: '8px' }}>
          {[{ v: countdown.days, l: 'Days' }, { v: countdown.hours, l: 'Hrs' }, { v: countdown.minutes, l: 'Min' }, { v: countdown.seconds, l: 'Sec' }].map(({ v, l }) => (
            <div key={l} className="text-center">
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#69BE28', fontFamily: 'var(--font-oswald)' }}>{v.toString().padStart(2, '0')}</div>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{l}</div>
            </div>
          ))}
        </div>
      </GlassCard>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '320px', margin: '0 auto' }}>
        {[{ i: <Zap className="w-4 h-4" style={{ color: '#69BE28' }} />, t: 'Answer quickly for bonus points' },
          { i: <Timer className="w-4 h-4" style={{ color: '#69BE28' }} />, t: '60 seconds per question' },
          { i: <Trophy className="w-4 h-4" style={{ color: '#69BE28' }} />, t: 'Correct answers earn entries' }].map(({ i, t }, idx) => (
          <div key={idx} className="flex items-center" style={{ gap: '12px', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            {i}<span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{t}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// Quarter Content
function QuarterContent({ quarter, questions, questionStates, onAnswer, getTimeRemaining, getAnswer, quarterScore, isActive, celebratingQuestionId }: {
  quarter: Quarter
  questions: LiveQuestion[]
  questionStates: Record<string, { question: LiveQuestion; status: 'pending' | 'active' | 'locked' | 'resolved' }>
  onAnswer: (qId: string, oId: string) => boolean
  getTimeRemaining: (qId: string) => number
  getAnswer: (qId: string) => { questionId: string; optionId: string; correct?: boolean } | undefined
  quarterScore: { correct: number; total: number; points: number }
  isActive: boolean
  celebratingQuestionId: string | null
}) {
  const allPending = questions.every(q => questionStates[q.id]?.status === 'pending')
  
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={spring}>
      <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
        <div>
          <div className="flex items-center" style={{ gap: '8px' }}>
            <h3 style={{ fontSize: '14px', color: 'white', letterSpacing: '0.08em', fontWeight: 600, textTransform: 'uppercase' }}>
              {quarter === 'OT' ? 'OVERTIME' : `QUARTER ${quarter.replace('Q', '')}`}
            </h3>
            {isActive && <span style={{ padding: '2px 6px', borderRadius: '100px', background: 'rgba(255, 68, 68, 0.2)', fontSize: '9px', fontWeight: 600, color: '#FF4444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>LIVE</span>}
          </div>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{quarterScore.correct}/{quarterScore.total} correct</p>
        </div>
        {quarterScore.points > 0 && (
          <div className="flex items-center" style={{ gap: '4px', padding: '4px 10px', borderRadius: '8px', background: 'rgba(105, 190, 40, 0.15)' }}>
            <Trophy className="w-3 h-3" style={{ color: '#69BE28' }} />
            <span style={{ fontSize: '12px', color: '#69BE28', fontWeight: 600 }}>+{quarterScore.points}</span>
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {questions.map((question, index) => {
          const state = questionStates[question.id]
          if (!state) return null
          return (
            <QuestionCard
              key={question.id}
              question={question}
              status={state.status}
              timeRemaining={getTimeRemaining(question.id)}
              selectedOptionId={getAnswer(question.id)?.optionId}
              correctOptionId={state.question.correctOptionId}
              onAnswer={(oId) => onAnswer(question.id, oId)}
              disabled={!isActive}
              index={index}
              isCelebrating={celebratingQuestionId === question.id}
            />
          )
        })}
      </div>
      
      {allPending && (
        <div className="text-center" style={{ paddingTop: '32px', paddingBottom: '32px' }}>
          <div className="flex items-center justify-center mx-auto" style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', marginBottom: '12px' }}>
            <Clock className="w-6 h-6" style={{ color: 'rgba(255,255,255,0.3)' }} />
          </div>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Questions appear when quarter starts</p>
        </div>
      )}
    </motion.div>
  )
}

// Question Card - Compact
function QuestionCard({ question, status, timeRemaining, selectedOptionId, correctOptionId, onAnswer, disabled, index, isCelebrating }: {
  question: LiveQuestion
  status: 'pending' | 'active' | 'locked' | 'resolved'
  timeRemaining: number
  selectedOptionId?: string
  correctOptionId?: string
  onAnswer: (oId: string) => void
  disabled: boolean
  index: number
  isCelebrating: boolean
}) {
  const progress = Math.min(1, timeRemaining / (question.timeLimit * 1000))
  const getTimerColor = () => progress > 0.5 ? '#69BE28' : progress > 0.25 ? '#FFD700' : '#FF4444'
  
  const isResolved = status === 'resolved'
  const isActive = status === 'active'
  const hasAnswered = !!selectedOptionId
  const isCorrect = selectedOptionId === correctOptionId

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: index * 0.03 }}>
      <GlassCard 
        variant="default" 
        padding="none"
        style={{
          border: isCelebrating ? '1.5px solid #69BE28' : isResolved && hasAnswered ? `1.5px solid ${isCorrect ? 'rgba(105,190,40,0.4)' : 'rgba(255,68,68,0.3)'}` : isActive ? '1.5px solid rgba(105,190,40,0.3)' : '1px solid rgba(255,255,255,0.08)',
          boxShadow: isCelebrating ? '0 0 24px rgba(105,190,40,0.3)' : 'none',
          opacity: status === 'pending' || status === 'locked' ? 0.7 : 1,
        }}
      >
        <div style={{ padding: '14px' }}>
          {/* Header */}
          <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
            <div className="flex items-center" style={{ gap: '6px', padding: '4px 8px', borderRadius: '100px', background: isActive ? 'rgba(105,190,40,0.15)' : isResolved && isCorrect ? 'rgba(105,190,40,0.15)' : isResolved && hasAnswered ? 'rgba(255,68,68,0.15)' : 'rgba(255,255,255,0.05)' }}>
              {isActive && <Radio className="w-3 h-3" style={{ color: '#69BE28' }} />}
              {status === 'locked' && <Lock className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.5)' }} />}
              {status === 'pending' && <Clock className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.4)' }} />}
              {isResolved && hasAnswered && isCorrect && <CheckCircle className="w-3 h-3" style={{ color: '#69BE28' }} />}
              {isResolved && hasAnswered && !isCorrect && <XCircle className="w-3 h-3" style={{ color: '#FF4444' }} />}
              {isResolved && !hasAnswered && <AlertCircle className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.5)' }} />}
              <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: isActive ? '#69BE28' : isResolved && isCorrect ? '#69BE28' : isResolved && hasAnswered ? '#FF4444' : 'rgba(255,255,255,0.5)' }}>
                {isActive ? 'LIVE' : status === 'locked' ? 'LOCKED' : status === 'pending' ? 'UPCOMING' : isCorrect ? 'CORRECT' : hasAnswered ? 'WRONG' : 'MISSED'}
              </span>
            </div>
            
            {isActive ? (
              <div className="flex items-center" style={{ gap: '6px' }}>
                <div style={{ width: '32px', height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: getTimerColor(), width: `${progress * 100}%` }} />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: getTimerColor() }}>{formatCountdown(timeRemaining)}</span>
              </div>
            ) : (
              <span style={{ fontSize: '11px', color: isCorrect ? '#69BE28' : 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                {isResolved && isCorrect ? `+${question.points}` : `${question.points} pts`}
              </span>
            )}
          </div>
          
          {/* Question */}
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)', fontWeight: 500, lineHeight: 1.4, marginBottom: '12px' }}>{question.question}</p>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {question.options.map((option) => {
              const isOptionSelected = selectedOptionId === option.id
              const isOptionCorrect = correctOptionId === option.id
              const isDisabled = disabled || !isActive || hasAnswered
              
              return (
                <motion.button
                  key={option.id}
                  className="w-full text-left"
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: isResolved && isOptionCorrect ? 'rgba(105,190,40,0.15)' : isResolved && isOptionSelected && !isOptionCorrect ? 'rgba(255,68,68,0.1)' : isOptionSelected ? 'rgba(105,190,40,0.1)' : 'rgba(255,255,255,0.03)',
                    border: isResolved && isOptionCorrect ? '1.5px solid #69BE28' : isResolved && isOptionSelected && !isOptionCorrect ? '1.5px solid rgba(255,68,68,0.5)' : isOptionSelected ? '1.5px solid rgba(105,190,40,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    opacity: isDisabled && !isOptionSelected && !isOptionCorrect ? 0.6 : 1,
                    cursor: isDisabled ? 'default' : 'pointer',
                  }}
                  onClick={() => !isDisabled && onAnswer(option.id)}
                  whileTap={!isDisabled ? { scale: 0.98 } : undefined}
                  disabled={isDisabled}
                >
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: '12px', fontWeight: 500, color: isOptionCorrect && isResolved ? '#69BE28' : isOptionSelected && isResolved && !isOptionCorrect ? '#FF4444' : isOptionSelected ? '#69BE28' : 'rgba(255,255,255,0.85)' }}>{option.label}</span>
                    {(isOptionSelected || (isResolved && isOptionCorrect)) && (
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: isResolved ? (isOptionCorrect ? '#69BE28' : '#FF4444') : '#69BE28', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isResolved && !isOptionCorrect && isOptionSelected ? <XCircle className="w-3 h-3" style={{ color: 'white' }} /> : <CheckCircle className="w-3 h-3" style={{ color: 'white' }} />}
                      </div>
                    )}
                  </div>
                </motion.button>
              )
            })}
          </div>

          {/* Result feedback */}
          {isResolved && hasAnswered && (
            <div className="flex items-center justify-center" style={{ marginTop: '10px', padding: '8px', borderRadius: '8px', gap: '6px', background: isCorrect ? 'rgba(105,190,40,0.1)' : 'rgba(255,68,68,0.1)' }}>
              {isCorrect ? <><Trophy className="w-3.5 h-3.5" style={{ color: '#69BE28' }} /><span style={{ fontSize: '12px', fontWeight: 600, color: '#69BE28' }}>+{question.points} points!</span></> : <><XCircle className="w-3.5 h-3.5" style={{ color: '#FF4444' }} /><span style={{ fontSize: '12px', color: '#FF4444' }}>Not this time</span></>}
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  )
}
