'use client'

import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { useCallback, useMemo } from 'react'

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
function RouteIcon({ play, size = 40 }: { play: PlayDefinition; size?: number }) {
  const cat = CAT[play.category]
  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size }}>
      <rect x="0" y="0" width="100" height="100" rx="14" fill="rgba(0,30,0,0.85)" />
      <line x1="10" y1="82" x2="90" y2="82" stroke="rgba(105,190,40,0.5)" strokeWidth="2" />
      {play.routes.map((r, i) => (
        <g key={i}>
          <path d={r.path} fill="none" stroke={cat.color} strokeWidth="3" strokeLinecap="round" />
          <circle cx={r.startX} cy={r.startY} r="4" fill="#fff" />
        </g>
      ))}
      <circle cx="50" cy="90" r="5" fill="#69BE28" />
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
  const plays = useMemo(() => 
    PLAYBOOK.filter(p => p.unlockWeek <= currentWeek + 1), 
    [currentWeek]
  )
  
  const handleTap = useCallback((play: PlayDefinition) => {
    if (play.unlockWeek > currentWeek) {
      haptic('error')
      return
    }
    haptic('success')
    const globalIdx = PLAYBOOK.findIndex(p => p.id === play.id)
    onSelectPlay(globalIdx)
  }, [currentWeek, onSelectPlay])
  
  const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
    // Just scrolling
  }, [])
  
  const state = gameState || { down: 1, yardsToGo: 10, yardLine: 25, quarter: 1, clock: '1:00' }
  const downText = ['1ST', '2ND', '3RD', '4TH'][state.down - 1] || '1ST'
  
  // Position panel based on field position
  // As we get closer to goal (yardLine increases), panel moves UP on screen
  // yardLine 20 (own territory) = bottom, yardLine 80+ (red zone) = higher
  const fieldProgress = Math.min(1, Math.max(0, (state.yardLine - 20) / 60)) // 0-1
  // Panel Y position: starts at ~55% from top, moves up to ~35%
  const panelTop = 55 - (fieldProgress * 20) // 55% → 35%
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute inset-x-0 z-30 pointer-events-none"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 400 }}
          style={{
            top: `${panelTop}%`,
          }}
        >
          {/* Floating glass panel */}
          <div 
            className="pointer-events-auto"
            style={{
              margin: '0 12px',
              background: 'rgba(5,15,25,0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              overflow: 'hidden',
            }}
          >
            {/* Down & distance header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              background: 'rgba(0,0,0,0.3)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: 800, 
                  color: '#69BE28',
                  fontFamily: 'var(--font-oswald)',
                }}>
                  {downText} & {state.yardsToGo}
                </span>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                  {state.yardLine > 50 ? `OPP ${100 - state.yardLine}` : state.yardLine}
                </span>
              </div>
              <span style={{ 
                fontSize: '9px', 
                color: 'rgba(255,255,255,0.35)',
                letterSpacing: '0.08em',
              }}>
                TAP TO SNAP
              </span>
            </div>
            
            {/* Play cards - horizontal scroll */}
            <div style={{ overflow: 'hidden', padding: '10px 0' }}>
              <motion.div
                drag="x"
                dragConstraints={{ left: -(plays.length * 54 - 200), right: 0 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                style={{
                  display: 'flex',
                  gap: '8px',
                  paddingLeft: '12px',
                  paddingRight: '40px',
                  cursor: 'grab',
                }}
              >
                {plays.map((play) => {
                  const locked = play.unlockWeek > currentWeek
                  const cat = CAT[play.category]
                  return (
                    <motion.div
                      key={play.id}
                      onClick={() => handleTap(play)}
                      whileTap={{ scale: locked ? 1 : 0.9 }}
                      style={{
                        flexShrink: 0,
                        cursor: locked ? 'not-allowed' : 'pointer',
                        opacity: locked ? 0.35 : 1,
                      }}
                    >
                      <div style={{
                        background: `${cat.color}15`,
                        border: `1px solid ${cat.color}50`,
                        borderRadius: '10px',
                        padding: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '3px',
                        position: 'relative',
                      }}>
                        <RouteIcon play={play} size={40} />
                        <span style={{
                          fontSize: '8px',
                          fontWeight: 700,
                          color: '#fff',
                          letterSpacing: '0.02em',
                        }}>
                          {play.name}
                        </span>
                        {locked && (
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0,0,0,0.6)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <span style={{ fontSize: '12px' }}>🔒</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PlaybookPanel
