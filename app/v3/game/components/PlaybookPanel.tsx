'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useCallback, useMemo, useRef } from 'react'

// Haptic
function haptic(type: 'light' | 'success' | 'error' = 'light') {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(type === 'light' ? [8] : type === 'success' ? [10, 30, 15] : [40])
  }
}

export interface PlayDefinition {
  id: string
  name: string
  category: 'quick' | 'medium' | 'deep' | 'trick'
  routes: { path: string; startX: number; startY: number }[]
  unlockWeek: number
}

const CAT = {
  quick: { color: '#69BE28', icon: '⚡' },
  medium: { color: '#FFD700', icon: '🎯' },
  deep: { color: '#FF6B35', icon: '🚀' },
  trick: { color: '#9B59B6', icon: '✨' },
}

export const PLAYBOOK: PlayDefinition[] = [
  { id: 'slant-flood', name: 'SLANT', category: 'quick', unlockWeek: 1, routes: [{ path: 'M 20 85 L 45 45', startX: 20, startY: 85 }, { path: 'M 50 85 L 35 60', startX: 50, startY: 85 }, { path: 'M 80 85 L 90 55', startX: 80, startY: 85 }] },
  { id: 'quick-out', name: 'OUTS', category: 'quick', unlockWeek: 1, routes: [{ path: 'M 15 85 L 5 60', startX: 15, startY: 85 }, { path: 'M 50 90 L 35 75', startX: 50, startY: 90 }, { path: 'M 85 85 L 95 60', startX: 85, startY: 85 }] },
  { id: 'mesh', name: 'MESH', category: 'quick', unlockWeek: 1, routes: [{ path: 'M 25 85 L 25 60 L 75 60', startX: 25, startY: 85 }, { path: 'M 75 85 L 75 55 L 25 55', startX: 75, startY: 85 }, { path: 'M 50 90 L 50 40', startX: 50, startY: 90 }] },
  { id: 'curl-flat', name: 'CURL', category: 'medium', unlockWeek: 2, routes: [{ path: 'M 20 85 L 20 50 L 30 55', startX: 20, startY: 85 }, { path: 'M 55 90 L 30 75', startX: 55, startY: 90 }, { path: 'M 80 85 L 55 35', startX: 80, startY: 85 }] },
  { id: 'smash', name: 'SMASH', category: 'medium', unlockWeek: 2, routes: [{ path: 'M 20 85 L 20 55 L 30 60', startX: 20, startY: 85 }, { path: 'M 40 85 L 40 40 L 15 20', startX: 40, startY: 85 }, { path: 'M 80 85 L 80 55 L 70 60', startX: 80, startY: 85 }] },
  { id: 'levels', name: 'LEVELS', category: 'medium', unlockWeek: 2, routes: [{ path: 'M 25 85 L 25 65 L 10 65', startX: 25, startY: 85 }, { path: 'M 45 85 L 45 45 L 10 45', startX: 45, startY: 85 }, { path: 'M 65 85 L 65 25 L 10 20', startX: 65, startY: 85 }] },
  { id: 'four-verts', name: 'VERTS', category: 'deep', unlockWeek: 3, routes: [{ path: 'M 15 85 L 15 20', startX: 15, startY: 85 }, { path: 'M 38 85 L 38 22', startX: 38, startY: 85 }, { path: 'M 62 85 L 62 22', startX: 62, startY: 85 }, { path: 'M 85 85 L 85 20', startX: 85, startY: 85 }] },
  { id: 'post-corner', name: 'POST', category: 'deep', unlockWeek: 3, routes: [{ path: 'M 30 85 L 30 50 L 50 25', startX: 30, startY: 85 }, { path: 'M 70 85 L 70 50 L 90 30', startX: 70, startY: 85 }, { path: 'M 50 90 L 35 75', startX: 50, startY: 90 }] },
  { id: 'hail-mary', name: 'HAIL', category: 'deep', unlockWeek: 4, routes: [{ path: 'M 20 85 L 50 20', startX: 20, startY: 85 }, { path: 'M 40 85 L 50 22', startX: 40, startY: 85 }, { path: 'M 60 85 L 50 22', startX: 60, startY: 85 }, { path: 'M 80 85 L 50 20', startX: 80, startY: 85 }] },
  { id: 'wheel', name: 'WHEEL', category: 'trick', unlockWeek: 5, routes: [{ path: 'M 50 92 L 25 80 L 10 35', startX: 50, startY: 92 }, { path: 'M 35 85 L 35 55 L 45 60', startX: 35, startY: 85 }, { path: 'M 70 85 L 70 45', startX: 70, startY: 85 }] },
  { id: 'texas', name: 'TEXAS', category: 'trick', unlockWeek: 5, routes: [{ path: 'M 45 85 L 45 60 L 85 50', startX: 45, startY: 85 }, { path: 'M 55 92 L 55 70 L 20 60', startX: 55, startY: 92 }, { path: 'M 80 85 L 80 30', startX: 80, startY: 85 }] },
  { id: 'spider-2-y', name: 'SPIDER', category: 'trick', unlockWeek: 6, routes: [{ path: 'M 40 85 L 40 65 L 10 55', startX: 40, startY: 85 }, { path: 'M 50 92 L 75 75 L 90 45', startX: 50, startY: 92 }, { path: 'M 75 85 L 75 55 L 60 60', startX: 75, startY: 85 }] },
]

// Compact route icon
function RouteIcon({ play, size = 48 }: { play: PlayDefinition; size?: number }) {
  const cat = CAT[play.category]
  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size }}>
      <rect x="0" y="0" width="100" height="100" rx="14" fill="rgba(0,30,0,0.9)" />
      <line x1="10" y1="82" x2="90" y2="82" stroke="rgba(105,190,40,0.5)" strokeWidth="2" />
      {play.routes.map((r, i) => (
        <g key={i}>
          <path d={r.path} fill="none" stroke={cat.color} strokeWidth="3.5" strokeLinecap="round" />
          <circle cx={r.startX} cy={r.startY} r="5" fill="#fff" />
        </g>
      ))}
      <circle cx="50" cy="90" r="6" fill="#69BE28" />
    </svg>
  )
}

interface Props {
  currentWeek: number
  selectedPlayId: string | null
  onSelectPlay: (idx: number) => void
  isVisible: boolean
  gameState?: { down: number; yardsToGo: number; yardLine: number; quarter: number; clock: string }
}

export function PlaybookPanel({ currentWeek, onSelectPlay, isVisible, gameState }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)
  
  const plays = useMemo(() => 
    PLAYBOOK.filter(p => p.unlockWeek <= currentWeek + 1), 
    [currentWeek]
  )
  
  // Native scroll handling for better mobile support
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollRef.current) return
    isDragging.current = true
    startX.current = e.pageX - scrollRef.current.offsetLeft
    scrollLeft.current = scrollRef.current.scrollLeft
  }, [])
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX.current) * 1.5
    scrollRef.current.scrollLeft = scrollLeft.current - walk
  }, [])
  
  const handleMouseUp = useCallback(() => {
    isDragging.current = false
  }, [])
  
  const handlePlayClick = useCallback((play: PlayDefinition) => {
    // Prevent if we were dragging
    if (isDragging.current) {
      console.log('[PlaybookPanel] Ignoring click - was dragging')
      return
    }
    
    console.log('[PlaybookPanel] Play clicked:', play.name, 'locked:', play.unlockWeek > currentWeek)
    
    if (play.unlockWeek > currentWeek) {
      haptic('error')
      return
    }
    
    haptic('success')
    const globalIdx = PLAYBOOK.findIndex(p => p.id === play.id)
    console.log('[PlaybookPanel] Calling onSelectPlay with index:', globalIdx)
    onSelectPlay(globalIdx)
  }, [currentWeek, onSelectPlay])
  
  // iOS Safari specific touch handler
  const handleTouchStart = useCallback((play: PlayDefinition, e: React.TouchEvent) => {
    e.stopPropagation()
    // Mark that we started a touch (not a drag)
    isDragging.current = false
  }, [])
  
  const handleTouchEnd = useCallback((play: PlayDefinition, e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Only trigger if it wasn't a drag
    if (!isDragging.current) {
      console.log('[PlaybookPanel] Touch end - triggering play:', play.name)
      handlePlayClick(play)
    }
  }, [handlePlayClick])
  
  const state = gameState || { down: 1, yardsToGo: 10, yardLine: 25, quarter: 1, clock: '1:00' }
  const downText = ['1ST', '2ND', '3RD', '4TH'][state.down - 1] || '1ST'
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-0 left-0 right-0"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            zIndex: 9999, // Maximum z-index to ensure it's on top
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
            pointerEvents: 'auto', // Explicitly enable pointer events
          }}
        >
          {/* Glass panel container */}
          <div 
            style={{
              margin: '0 8px',
              background: 'linear-gradient(180deg, rgba(10,25,40,0.95) 0%, rgba(5,15,30,0.98) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(105,190,40,0.25)',
              borderRadius: '20px',
              boxShadow: '0 -4px 30px rgba(0,0,0,0.5), 0 0 60px rgba(105,190,40,0.1)',
              overflow: 'hidden',
            }}
          >
            {/* Header with down & distance */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 16px',
              background: 'rgba(0,0,0,0.4)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ 
                  fontSize: '16px', 
                  fontWeight: 800, 
                  color: '#69BE28',
                  fontFamily: 'var(--font-oswald)',
                  letterSpacing: '0.02em',
                }}>
                  {downText} & {state.yardsToGo}
                </span>
                <span style={{ 
                  fontSize: '11px', 
                  color: 'rgba(255,255,255,0.5)',
                  background: 'rgba(255,255,255,0.08)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                }}>
                  {state.yardLine > 50 ? `OPP ${100 - state.yardLine}` : `OWN ${state.yardLine}`}
                </span>
              </div>
              <motion.span 
                style={{ 
                  fontSize: '11px', 
                  color: '#69BE28',
                  letterSpacing: '0.1em',
                  fontWeight: 600,
                }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                SELECT PLAY
              </motion.span>
            </div>
            
            {/* Play cards - native horizontal scroll */}
            <div 
              ref={scrollRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ 
                display: 'flex',
                gap: '10px',
                padding: '12px 12px 14px',
                overflowX: 'auto',
                overflowY: 'hidden',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                cursor: 'grab',
              }}
            >
              {plays.map((play) => {
                const locked = play.unlockWeek > currentWeek
                const cat = CAT[play.category]
                return (
                  <div
                    key={play.id}
                    role="button"
                    tabIndex={locked ? -1 : 0}
                    onClick={() => !locked && handlePlayClick(play)}
                    onTouchStart={(e) => handleTouchStart(play, e)}
                    onTouchEnd={(e) => !locked && handleTouchEnd(play, e)}
                    onKeyDown={(e) => e.key === 'Enter' && !locked && handlePlayClick(play)}
                    aria-disabled={locked}
                    style={{
                      flexShrink: 0,
                      cursor: locked ? 'not-allowed' : 'pointer',
                      opacity: locked ? 0.4 : 1,
                      touchAction: 'manipulation',
                      WebkitTouchCallout: 'none',
                      WebkitUserSelect: 'none',
                      userSelect: 'none',
                      background: locked ? 'rgba(50,50,50,0.5)' : `linear-gradient(135deg, ${cat.color}20 0%, ${cat.color}08 100%)`,
                      border: `2px solid ${locked ? 'rgba(100,100,100,0.3)' : cat.color}`,
                      borderRadius: '14px',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      position: 'relative',
                      boxShadow: locked ? 'none' : `0 4px 20px ${cat.color}30`,
                      WebkitTapHighlightColor: 'transparent',
                      minWidth: '70px',
                    }}
                  >
                    <RouteIcon play={play} size={52} />
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#fff',
                      letterSpacing: '0.03em',
                      fontFamily: 'var(--font-oswald)',
                    }}>
                      {play.name}
                    </span>
                    {locked && (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.7)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <span style={{ fontSize: '16px' }}>🔒</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PlaybookPanel
