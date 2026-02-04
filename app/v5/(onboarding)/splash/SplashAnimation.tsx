'use client'

/**
 * DARK SIDE FOOTBALL — REACT SPLASH ANIMATION
 * 
 * Premium 60fps React + Framer Motion version
 * Replaces video for crisp, native resolution rendering
 * 
 * Duration: 32 seconds (production-tuned for cinematic pacing)
 * Resolution: Native device resolution (not fixed 1080p)
 */

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, useAnimationFrame } from 'framer-motion'
import Image from 'next/image'
import { Volume2, VolumeX, SkipForward, ChevronRight } from 'lucide-react'

// ============================================================================
// DESIGN SYSTEM - Matching North Star exactly
// ============================================================================
const DESIGN = {
  colors: {
    navy: '#002244',        // Primary background
    green: '#69BE28',       // Primary accent, CTAs
    gold: '#FFD700',        // Sponsor, prizes
    ink: 'rgba(255,255,255,0.9)',  // Primary text
    inkDim: 'rgba(255,255,255,0.5)', // Secondary/labels
    inkMuted: 'rgba(255,255,255,0.2)', // Very muted
    grey: '#A5ACAF',        // Muted text
    bg: '#002244',          // Using navy as bg (not pure black)
  },
  fonts: {
    hero: 'var(--font-bebas, "Bebas Neue"), var(--font-oswald, "Oswald"), sans-serif',
    title: 'var(--font-oswald, "Oswald"), "Arial Black", sans-serif',
    body: '"Inter", "Helvetica Neue", Arial, sans-serif',
  },
  // 8px grid spacing
  space: {
    xxs: 4,   // Tight heading-to-body
    xs: 8,    // Small gaps
    sm: 12,   // Default gaps
    md: 16,   // Medium gaps
    lg: 24,   // Large gaps
    xl: 32,   // Extra large
    '2xl': 48,
  },
  // Letter spacing by element
  tracking: {
    tight: '-0.02em',   // Hero text
    normal: '0',        // Body
    wide: '0.1em',      // Titles
    wider: '0.15em',    // Subtitles
    widest: '0.2em',    // Labels/captions
  },
}

// ============================================================================
// ASSETS
// ============================================================================
// DrinkSip SVG logo from CDN (per design system)
const DRINKSIP_LOGO = 'https://cdn.shopify.com/s/files/1/0407/8580/5468/files/DrinkSip_Logo_SVG.svg?v=1759624477'

const ASSETS = {
  stadium: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/16412705-ca65-400e-bb78-80ff29be860a/segments/2:2:1/Phoenix_Empty_NFL_football_field_at_night_dramatic_billowing_s_0.jpg',
  usMap: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/2561ee31-7e9b-4de3-9cf2-536e5facde5a/segments/2:4:1/Phoenix_Stylized_3D_US_map_at_night_dark_tactical_military_the_0.jpg',
  plane: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/25a25712-b04b-48f6-b9ae-e8bd3122b674/variations/Default_Seattle_Seahawks_NFL_team_Boeing_737_airplane_sleek_mo_0_25a25712-b04b-48f6-b9ae-e8bd3122b674_0.png',
  seattle: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/1f736005-c2ed-4755-b762-4fc99e7062a1/segments/4:4:1/Phoenix_Seattle_Washington_skyline_at_dusk_Space_Needle_promin_0.jpg',
  sanFrancisco: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/f2e5cdfb-ec9b-4d48-825d-6fe7c3a7b3ed/segments/1:4:1/Phoenix_San_Francisco_Bay_Area_Golden_Gate_Bridge_in_fog_Levis_0.jpg',
}

const SCREENS = {
  gameHub: '/screens/game-hub.png',
  picksHub: '/screens/picks-hub.png',
  live: '/screens/live.png',
  leaderboard: '/screens/leaderboard.png',
  profile: '/screens/profile.png',
  scratchCard: '/screens/scratch-card.png',
}

const HERO_PLAYERS = [
  { id: 'lawrence', lastName: 'LAWRENCE', jersey: 0, position: 'DE', image: '/sprites/players/defense-0-demarcus-lawrence.png' },
  { id: 'williams', lastName: 'WILLIAMS', jersey: 99, position: 'DT', image: '/sprites/players/defense-99-leonard-williams.png' },
  { id: 'murphy', lastName: 'MURPHY II', jersey: 91, position: 'NT', image: '/sprites/players/defense-91-byron-murphy-ii.png' },
  { id: 'emmanwori', lastName: 'EMMANWORI', jersey: 3, position: 'S', image: '/sprites/players/defense-3-nick-emmanwori.png' },
]

// ============================================================================
// TIMING (in seconds) - Production-tuned for cinematic pacing
// ============================================================================
const TOTAL_DURATION = 32
const SCENES = {
  intro: { start: 0, end: 5.5 },         // +0.5s for better hold
  mapFlight: { start: 5.5, end: 8 },     // +0.5s for readability
  gameHub: { start: 8, end: 10.5 },      // +0.5s for phone settle
  picks: { start: 10.5, end: 12.5 },     // 2s
  live: { start: 12.5, end: 14.5 },      // 2s
  scanWin: { start: 14.5, end: 16.5 },   // 2s
  features: { start: 16.5, end: 18.5 },  // 2s
  giveaway: { start: 18.5, end: 20.5 },  // 2s
  players: { start: 20.5, end: 27.5 },   // 7s for player showcase
  cta: { start: 27.5, end: 32 },         // 4.5s for strong CTA hold
}

// ============================================================================
// HOOKS
// ============================================================================
function useAnimationTime(isPlaying: boolean) {
  const [time, setTime] = useState(0)
  const startTimeRef = useRef<number | null>(null)
  
  useAnimationFrame((t) => {
    if (!isPlaying) {
      startTimeRef.current = null
      return
    }
    if (startTimeRef.current === null) {
      startTimeRef.current = t
    }
    const elapsed = (t - startTimeRef.current) / 1000 // Convert to seconds
    setTime(Math.min(elapsed, TOTAL_DURATION)) // Cap at total duration
  })
  
  return time
}

function useDeviceCapability() {
  const [isHighEnd, setIsHighEnd] = useState(true)
  
  useEffect(() => {
    const cores = navigator.hardwareConcurrency || 4
    const memory = (navigator as any).deviceMemory || 4
    setIsHighEnd(cores >= 4 && memory >= 4)
  }, [])
  
  return { isHighEnd }
}

// ============================================================================
// UTILITIES
// ============================================================================
function interpolate(value: number, inputRange: [number, number], outputRange: [number, number], clamp = true): number {
  const [inMin, inMax] = inputRange
  const [outMin, outMax] = outputRange
  const ratio = (value - inMin) / (inMax - inMin)
  const result = outMin + ratio * (outMax - outMin)
  if (clamp) {
    return Math.min(Math.max(result, Math.min(outMin, outMax)), Math.max(outMin, outMax))
  }
  return result
}

function hexToRgba(hex: string, a: number): string {
  const h = hex.replace('#', '')
  const bigint = parseInt(h, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r},${g},${b},${a})`
}

// ============================================================================
// PRIMITIVES
// ============================================================================
function AbsoluteFill({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function PhoneMockup({ screen, scale = 1.4, tilt = 0, glowColor = DESIGN.colors.green }: {
  screen: string
  scale?: number
  tilt?: number
  glowColor?: string
}) {
  return (
    <div
      style={{
        position: 'relative',
        width: 220 * scale,
        height: 460 * scale,
        borderRadius: 32 * scale,
        background: `linear-gradient(145deg, ${DESIGN.colors.navy}, #0a0a1e)`,
        border: `2px solid rgba(105,190,40,0.3)`,
        boxShadow: `
          0 40px 80px rgba(0,0,0,0.6),
          0 0 60px ${hexToRgba(glowColor, 0.4)},
          inset 0 0 0 1px rgba(255,255,255,0.08)
        `,
        overflow: 'hidden',
        transform: `perspective(1200px) rotateY(${tilt}deg)`,
        willChange: 'transform',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 4 * scale,
          borderRadius: 28 * scale,
          overflow: 'hidden',
          background: '#000',
        }}
      >
        <img
          src={screen}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
      {/* Dynamic Island */}
      <div
        style={{
          position: 'absolute',
          top: 8 * scale,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 60 * scale,
          height: 20 * scale,
          borderRadius: 10 * scale,
          background: '#000',
        }}
      />
    </div>
  )
}

function SmokeOverlay({ intensity = 0.5, time }: { intensity?: number; time: number }) {
  const drift = Math.sin(time * 0.5) * 30
  const pulse = 0.85 + 0.15 * Math.sin(time * 1.5)
  
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          inset: '-30%',
          background: `radial-gradient(ellipse 140% 60% at ${50 + drift * 0.5}% 100%, rgba(255,255,255,${0.1 * intensity * pulse}), transparent 50%)`,
          filter: 'blur(100px)',
          willChange: 'transform',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: '-20%',
          background: `radial-gradient(ellipse 100% 40% at ${50 - drift * 0.3}% 100%, rgba(105,190,40,${0.08 * intensity}), transparent 45%)`,
          filter: 'blur(120px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 80% 30% at 50% 0%, rgba(0,34,68,${0.3 * intensity}), transparent 40%)`,
          filter: 'blur(80px)',
        }}
      />
    </AbsoluteFill>
  )
}

function Vignette() {
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.75) 100%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 160, background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, transparent 100%)' }} />
    </AbsoluteFill>
  )
}

// ============================================================================
// SCENE 1: INTRO - DrinkSip Presents + Dark Side Title
// ============================================================================
function SceneIntro({ time }: { time: number }) {
  const localTime = time
  
  // Phase 1: DrinkSip (0-3s) - slower, more dramatic
  const logoOpacity = interpolate(localTime, [0, 0.8], [0, 1]) * interpolate(localTime, [2.5, 3.2], [1, 0])
  const logoScale = 0.9 + 0.1 * interpolate(localTime, [0, 1.0], [0, 1])
  const presentsOpacity = interpolate(localTime, [1.0, 1.8], [0, 1])
  
  // Phase 2: Dark Side (3-5.5s) - extended fades for readability
  const titleOpacity = interpolate(localTime, [2.8, 3.6], [0, 1])
  const titleScale = 0.85 + 0.15 * interpolate(localTime, [2.8, 3.5], [0, 1])
  const subtitleOpacity = interpolate(localTime, [3.7, 4.4], [0, 1])
  const playFromHomeOpacity = interpolate(localTime, [4.5, 5.2], [0, 1])
  
  return (
    <AbsoluteFill style={{ backgroundColor: DESIGN.colors.bg }}>
      {/* Stadium background */}
      <AbsoluteFill>
        <img src={ASSETS.stadium} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.15) blur(6px)' }} />
      </AbsoluteFill>
      
      <SmokeOverlay intensity={0.4} time={time} />
      <Vignette />
      
      {/* Phase 1: DrinkSip - Perfectly centered */}
      <AbsoluteFill 
        style={{ 
          justifyContent: 'center', 
          alignItems: 'center', 
          opacity: logoOpacity,
        }}
      >
        <div 
          style={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center', 
            transform: `scale(${logoScale})`,
            width: '100%',
            padding: `0 ${DESIGN.space.lg}px`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={DRINKSIP_LOGO}
            alt="DrinkSip"
            style={{ 
              height: 'clamp(56px, 14vw, 80px)', 
              width: 'auto', 
              display: 'block',
              margin: '0 auto',
              opacity: 0.9,
            }}
          />
          <div
            style={{
              marginTop: DESIGN.space.md,
              fontFamily: DESIGN.fonts.title,
              fontWeight: 500,
              fontSize: 'clamp(16px, 4vw, 22px)',
              letterSpacing: DESIGN.tracking.widest,
              color: DESIGN.colors.gold,
              opacity: presentsOpacity,
              textAlign: 'center',
              textTransform: 'uppercase',
            }}
          >
            PRESENTS
          </div>
        </div>
      </AbsoluteFill>
      
      {/* Phase 2: Dark Side */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: titleOpacity }}>
        <div style={{ textAlign: 'center', transform: `scale(${titleScale})` }}>
          <div
            style={{
              fontFamily: DESIGN.fonts.hero,
              fontWeight: 400,
              fontSize: 'clamp(56px, 18vw, 100px)',
              lineHeight: 0.9,
              letterSpacing: DESIGN.tracking.tight,
              color: DESIGN.colors.ink,
              textShadow: `0 0 80px ${DESIGN.colors.green}`,
            }}
          >
            DARK SIDE
          </div>
          <div
            style={{
              marginTop: DESIGN.space.xs,
              fontFamily: DESIGN.fonts.title,
              fontWeight: 400,
              fontSize: 'clamp(12px, 3.5vw, 18px)',
              letterSpacing: DESIGN.tracking.wider,
              color: DESIGN.colors.inkDim,
              opacity: subtitleOpacity,
              textTransform: 'uppercase',
            }}
          >
            THE FOOTBALL GAME
          </div>
          <div
            style={{
              marginTop: DESIGN.space.xs,
              fontFamily: DESIGN.fonts.title,
              fontWeight: 600,
              fontSize: 'clamp(10px, 2.5vw, 14px)',
              letterSpacing: DESIGN.tracking.wider,
              color: DESIGN.colors.green,
              opacity: playFromHomeOpacity,
              textShadow: `0 0 30px ${DESIGN.colors.green}`,
              textTransform: 'uppercase',
            }}
          >
            PLAY FROM HOME
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

// ============================================================================
// SCENE 2: MAP FLIGHT - Plane ASCENDS from center up to top (flies away)
// ============================================================================
function SceneMapFlight({ time }: { time: number }) {
  const localTime = time - SCENES.mapFlight.start
  const duration = SCENES.mapFlight.end - SCENES.mapFlight.start
  
  // Reverse of CTA - ascend from center up to top (flying away)
  const progress = interpolate(localTime, [0, duration], [0, 1])
  const easedProgress = progress * progress * (3 - 2 * progress) // smoothstep
  const planeY = 100 - 450 * easedProgress // 100 to -350 (ascend UP the screen)
  const planeScale = 1.0 - 0.6 * easedProgress // 1.0 to 0.4 (shrinks as it flies away)
  const planeRotate = 5 - 20 * easedProgress // 5 to -15 (nose tilts up as it climbs)
  const textOpacity = interpolate(localTime, [0.2, 0.9], [0, 1]) // Earlier fade-in for readability
  
  return (
    <AbsoluteFill style={{ backgroundColor: DESIGN.colors.bg }}>
      <AbsoluteFill>
        <img src={ASSETS.usMap} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.5) contrast(1.1)' }} />
      </AbsoluteFill>
      
      <SmokeOverlay intensity={0.4} time={time} />
      
      {/* Plane - ascends from center up (flying away, no flip - text readable) */}
      <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center' }}>
        <img
          src={ASSETS.plane}
          alt=""
          style={{
            width: 'clamp(180px, 45vw, 300px)',
            height: 'auto',
            // No flip - text stays readable, rotate for climb angle
            transform: `translateY(${planeY}px) scale(${planeScale}) rotate(${planeRotate}deg)`,
            filter: `drop-shadow(0 40px 80px rgba(0,0,0,0.6)) drop-shadow(0 0 40px ${DESIGN.colors.green}30)`,
            willChange: 'transform',
          }}
        />
      </AbsoluteFill>
      
      <Vignette />
      
      {/* Text - Premium styling, no dark shadows */}
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '18%', opacity: textOpacity }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontFamily: DESIGN.fonts.title, 
            fontWeight: 600, 
            fontSize: 'clamp(14px, 4vw, 22px)', 
            letterSpacing: '0.2em', 
            color: 'rgba(255,255,255,0.7)',
          }}>
            ROAD TO
          </div>
          <div style={{ 
            fontFamily: DESIGN.fonts.hero, 
            fontWeight: 900, 
            fontSize: 'clamp(32px, 10vw, 52px)', 
            letterSpacing: '0.02em', 
            color: DESIGN.colors.gold, 
            textShadow: `0 0 60px ${DESIGN.colors.gold}`,
            marginTop: 4,
          }}>
            SAN FRANCISCO
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

// ============================================================================
// SCENE 3: GAME HUB - Premium styling, no dark shadows
// ============================================================================
function SceneGameHub({ time }: { time: number }) {
  const localTime = time - SCENES.gameHub.start
  // Slower phone entry for more impact
  const phoneScale = 0.85 + 0.2 * interpolate(localTime, [0, 0.8], [0, 1])
  const phoneY = 50 - 50 * interpolate(localTime, [0, 0.8], [0, 1])
  const textOpacity = interpolate(localTime, [0.7, 1.4], [0, 1]) // Delay until phone settles
  
  return (
    <AbsoluteFill style={{ backgroundColor: DESIGN.colors.bg }}>
      <AbsoluteFill>
        <img src={ASSETS.stadium} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.3)' }} />
      </AbsoluteFill>
      
      <SmokeOverlay intensity={0.5} time={time} />
      <Vignette />
      
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ transform: `translateY(${phoneY}px) scale(${phoneScale})`, willChange: 'transform' }}>
          <PhoneMockup screen={SCREENS.gameHub} scale={1.2} />
        </div>
      </AbsoluteFill>
      
      <AbsoluteFill style={{ padding: DESIGN.space.lg, paddingTop: '12%', justifyContent: 'flex-start', opacity: textOpacity }}>
        <div style={{ 
          fontFamily: DESIGN.fonts.hero, 
          fontWeight: 400, 
          fontSize: 'clamp(28px, 9vw, 44px)', 
          color: DESIGN.colors.green, 
          letterSpacing: DESIGN.tracking.tight, 
          textShadow: `0 0 40px ${DESIGN.colors.green}`,
        }}>
          PLAY THE GAME
        </div>
        <div style={{ 
          marginTop: 6, 
          fontFamily: DESIGN.fonts.title, 
          fontWeight: 400, 
          fontSize: 'clamp(11px, 2.5vw, 14px)', 
          color: DESIGN.colors.inkDim, 
          letterSpacing: DESIGN.tracking.wider,
          textTransform: 'uppercase',
        }}>
          Earn entries from home
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

// ============================================================================
// SCENE 4: PICKS - Premium styling, glow shadows only
// ============================================================================
function ScenePicks({ time }: { time: number }) {
  const localTime = time - SCENES.picks.start
  const phoneScale = 0.9 + 0.15 * interpolate(localTime, [0, 0.6], [0, 1])
  const phoneY = 35 - 35 * interpolate(localTime, [0, 0.6], [0, 1])
  const textOpacity = interpolate(localTime, [0.5, 1.2], [0, 1]) // Fade in text
  
  return (
    <AbsoluteFill style={{ backgroundColor: DESIGN.colors.bg }}>
      <AbsoluteFill>
        <img src={ASSETS.stadium} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.3)' }} />
      </AbsoluteFill>
      
      <SmokeOverlay intensity={0.5} time={time} />
      <Vignette />
      
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ transform: `scale(${phoneScale}) translateY(${phoneY}px)`, willChange: 'transform' }}>
          <PhoneMockup screen={SCREENS.picksHub} scale={1.2} />
        </div>
      </AbsoluteFill>
      
      <AbsoluteFill style={{ padding: DESIGN.space.lg, justifyContent: 'flex-end', paddingBottom: '14%', opacity: textOpacity }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontFamily: DESIGN.fonts.hero, 
            fontWeight: 400, 
            fontSize: 'clamp(32px, 11vw, 52px)', 
            color: DESIGN.colors.ink, 
            letterSpacing: DESIGN.tracking.tight, 
            textShadow: `0 0 60px ${DESIGN.colors.green}`,
          }}>
            PROP PICKS
          </div>
          <div style={{ 
            marginTop: 6, 
            fontFamily: DESIGN.fonts.title, 
            fontWeight: 400, 
            fontSize: 'clamp(10px, 2.5vw, 13px)', 
            color: DESIGN.colors.green, 
            letterSpacing: DESIGN.tracking.wider,
            textTransform: 'uppercase',
          }}>
            25 props • Win a signed jersey
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

// ============================================================================
// SCENE 5: LIVE - Premium styling, glow shadows only
// ============================================================================
function SceneLive({ time }: { time: number }) {
  const localTime = time - SCENES.live.start
  const phoneScale = 0.9 + 0.15 * interpolate(localTime, [0, 0.6], [0, 1])
  const pulse = 0.6 + 0.4 * Math.sin(time * 3)
  const badgeOpacity = interpolate(localTime, [0.4, 1.1], [0, 1]) // Fade in badge
  
  return (
    <AbsoluteFill style={{ backgroundColor: DESIGN.colors.bg }}>
      <AbsoluteFill>
        <img src={ASSETS.stadium} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.3)' }} />
      </AbsoluteFill>
      
      <SmokeOverlay intensity={0.5} time={time} />
      <Vignette />
      
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ transform: `scale(${phoneScale})`, willChange: 'transform' }}>
          <PhoneMockup screen={SCREENS.live} scale={1.2} glowColor="#FF4444" />
        </div>
      </AbsoluteFill>
      
      {/* LIVE badge - GlassCard style */}
      <AbsoluteFill style={{ padding: DESIGN.space.lg, justifyContent: 'flex-start', paddingTop: '12%', opacity: badgeOpacity }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: DESIGN.space.xs,
            padding: '10px 16px',
            background: 'rgba(255,68,68,0.1)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: 100,
            border: '1px solid rgba(255,68,68,0.3)',
            width: 'fit-content',
          }}
        >
          <div style={{ 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            background: '#FF4444', 
            boxShadow: `0 0 ${10 + 8 * pulse}px #FF4444`,
          }} />
          <span style={{ 
            fontFamily: DESIGN.fonts.title, 
            fontWeight: 500, 
            fontSize: 12, 
            color: '#FF6666', 
            letterSpacing: DESIGN.tracking.wider,
            textTransform: 'uppercase',
          }}>
            LIVE GAMEDAY
          </span>
        </div>
      </AbsoluteFill>
      
      <AbsoluteFill style={{ padding: DESIGN.space.lg, justifyContent: 'flex-end', paddingBottom: '14%' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontFamily: DESIGN.fonts.hero, 
            fontWeight: 400, 
            fontSize: 'clamp(28px, 9vw, 44px)', 
            color: DESIGN.colors.ink, 
            letterSpacing: DESIGN.tracking.tight,
            textShadow: `0 0 60px ${DESIGN.colors.green}`,
          }}>
            PREDICT PLAYS
          </div>
          <div style={{ 
            marginTop: 6, 
            fontFamily: DESIGN.fonts.title, 
            fontWeight: 400, 
            fontSize: 'clamp(10px, 2.5vw, 13px)', 
            color: DESIGN.colors.green, 
            letterSpacing: DESIGN.tracking.wider,
            textTransform: 'uppercase',
          }}>
            Answer fast • Earn bonus entries
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

// ============================================================================
// SCENE 6: SCAN & WIN - Premium styling
// ============================================================================
function SceneScanWin({ time }: { time: number }) {
  const localTime = time - SCENES.scanWin.start
  const phoneScale = 0.9 + 0.15 * interpolate(localTime, [0, 0.6], [0, 1])
  const phoneY = 25 - 25 * interpolate(localTime, [0, 0.6], [0, 1])
  const sparkle = 0.7 + 0.3 * Math.sin(time * 3)
  const textOpacity = interpolate(localTime, [0.5, 1.2], [0, 1]) // Fade in text
  
  return (
    <AbsoluteFill style={{ backgroundColor: DESIGN.colors.bg }}>
      <AbsoluteFill>
        <img src={ASSETS.stadium} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.3)' }} />
      </AbsoluteFill>
      
      <SmokeOverlay intensity={0.5} time={time} />
      <Vignette />
      
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ transform: `scale(${phoneScale}) translateY(${phoneY}px)`, willChange: 'transform' }}>
          <PhoneMockup screen={SCREENS.scratchCard} scale={1.2} glowColor={DESIGN.colors.gold} />
        </div>
      </AbsoluteFill>
      
      <AbsoluteFill style={{ padding: DESIGN.space.lg, justifyContent: 'flex-start', paddingTop: '12%', opacity: textOpacity }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontFamily: DESIGN.fonts.hero, 
            fontWeight: 400, 
            fontSize: 'clamp(32px, 11vw, 52px)', 
            color: DESIGN.colors.gold, 
            letterSpacing: DESIGN.tracking.tight,
            textShadow: `0 0 ${40 + 20 * sparkle}px ${DESIGN.colors.gold}`,
          }}>
            SCAN & WIN
          </div>
          <div style={{ 
            marginTop: 6, 
            fontFamily: DESIGN.fonts.title, 
            fontWeight: 400, 
            fontSize: 'clamp(10px, 2.5vw, 13px)', 
            color: DESIGN.colors.inkDim, 
            letterSpacing: DESIGN.tracking.wider,
            textTransform: 'uppercase',
          }}>
            Daily prizes • Bonus entries
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

// ============================================================================
// SCENE 7: FEATURES (Leaderboard + Profile) - Premium styling
// ============================================================================
function SceneFeatures({ time }: { time: number }) {
  const localTime = time - SCENES.features.start
  const phone1Progress = interpolate(localTime, [0, 0.7], [0, 1])  // Slower
  const phone2Progress = interpolate(localTime, [0.3, 1.0], [0, 1]) // Slower
  const textOpacity = interpolate(localTime, [0.7, 1.4], [0, 1]) // Fade in text after phones
  
  return (
    <AbsoluteFill style={{ backgroundColor: DESIGN.colors.bg }}>
      <AbsoluteFill>
        <img src={ASSETS.stadium} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.3)' }} />
      </AbsoluteFill>
      
      <SmokeOverlay intensity={0.5} time={time} />
      <Vignette />
      
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ transform: `translateX(${-30 + 30 * phone1Progress}px) rotate(-4deg)`, opacity: phone1Progress }}>
            <PhoneMockup screen={SCREENS.leaderboard} scale={0.8} tilt={6} />
          </div>
          <div style={{ transform: `translateX(${30 - 30 * phone2Progress}px) rotate(4deg)`, opacity: phone2Progress }}>
            <PhoneMockup screen={SCREENS.profile} scale={0.8} tilt={-6} />
          </div>
        </div>
      </AbsoluteFill>
      
      <AbsoluteFill style={{ padding: DESIGN.space.lg, justifyContent: 'flex-end', paddingBottom: '14%', opacity: textOpacity }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontFamily: DESIGN.fonts.hero, 
            fontWeight: 400,
            fontSize: 'clamp(26px, 8vw, 40px)', 
            color: DESIGN.colors.green, 
            letterSpacing: DESIGN.tracking.tight,
            textShadow: `0 0 40px ${DESIGN.colors.green}`,
          }}>
            COMPETE & CLIMB
          </div>
          <div style={{ 
            fontSize: 'clamp(10px, 2.5vw, 13px)', 
            color: DESIGN.colors.inkDim, 
            marginTop: 6, 
            fontFamily: DESIGN.fonts.title, 
            fontWeight: 400,
            letterSpacing: DESIGN.tracking.wider,
            textTransform: 'uppercase',
          }}>
            Track your entries • Climb the ranks
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

// ============================================================================
// SCENE 8: GIVEAWAY - Premium styling
// ============================================================================
function SceneGiveaway({ time }: { time: number }) {
  const localTime = time - SCENES.giveaway.start
  const duration = SCENES.giveaway.end - SCENES.giveaway.start
  
  const zoom = interpolate(localTime, [0, duration], [1.1, 1])
  const cardScale = 0.9 + 0.1 * interpolate(localTime, [0.5, 1.2], [0, 1]) // Slower
  const cardOpacity = interpolate(localTime, [0.3, 1.0], [0, 1]) // Fade in
  const sweepX = interpolate(localTime, [0, duration], [-250, 250])
  
  return (
    <AbsoluteFill style={{ backgroundColor: DESIGN.colors.bg }}>
      <AbsoluteFill>
        <img src={ASSETS.sanFrancisco} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`, filter: 'brightness(0.5) contrast(1.1)' }} />
      </AbsoluteFill>
      
      <SmokeOverlay intensity={0.5} time={time} />
      <Vignette />
      
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: cardOpacity }}>
        <div style={{ textAlign: 'center', transform: `scale(${cardScale})` }}>
          <div style={{ 
            fontFamily: DESIGN.fonts.hero, 
            fontWeight: 400, 
            fontSize: 'clamp(50px, 16vw, 80px)', 
            color: DESIGN.colors.ink, 
            letterSpacing: DESIGN.tracking.tight,
            textShadow: `0 0 60px ${DESIGN.colors.gold}`,
          }}>
            WIN
          </div>
          
          {/* Premium ticket card */}
          <div
            style={{
              position: 'relative',
              width: 'clamp(240px, 70vw, 360px)',
              padding: `${DESIGN.space.lg}px ${DESIGN.space.xl}px`,
              background: `linear-gradient(135deg, ${DESIGN.colors.gold} 0%, #C4960E 100%)`,
              borderRadius: DESIGN.space.md,
              boxShadow: `0 0 60px ${hexToRgba(DESIGN.colors.gold, 0.4)}`,
              transform: 'rotate(-1deg)',
              overflow: 'hidden',
              margin: '0 auto',
            }}
          >
            {/* Shine sweep */}
            <div
              style={{
                position: 'absolute',
                inset: -50,
                transform: `translateX(${sweepX}px) rotate(15deg)`,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                willChange: 'transform',
              }}
            />
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div style={{ 
                fontFamily: DESIGN.fonts.title, 
                fontWeight: 500, 
                fontSize: 11, 
                letterSpacing: DESIGN.tracking.widest, 
                color: DESIGN.colors.navy,
                textTransform: 'uppercase',
              }}>
                THE BIG GAME GIVEAWAY
              </div>
              <div style={{ 
                fontFamily: DESIGN.fonts.hero, 
                fontWeight: 400, 
                fontSize: 'clamp(28px, 9vw, 42px)', 
                color: DESIGN.colors.navy, 
                lineHeight: 1,
                letterSpacing: DESIGN.tracking.tight,
              }}>
                2 TICKETS
              </div>
              <div style={{ 
                marginTop: DESIGN.space.xs, 
                fontFamily: DESIGN.fonts.body, 
                fontWeight: 500, 
                fontSize: 11, 
                color: 'rgba(0,34,68,0.6)',
                letterSpacing: DESIGN.tracking.wide,
              }}>
                Drawing Saturday • San Francisco
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

// ============================================================================
// SCENE 9: PLAYERS - Premium styling, glow only
// ============================================================================
function ScenePlayerShowcase({ time }: { time: number }) {
  const localTime = time - SCENES.players.start
  const duration = SCENES.players.end - SCENES.players.start
  const framesPerPlayer = duration / 4
  const idx = Math.min(Math.floor(localTime / framesPerPlayer), HERO_PLAYERS.length - 1)
  const segmentTime = localTime - idx * framesPerPlayer
  
  const player = HERO_PLAYERS[idx]
  
  // Smooth easing function
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
  const easeInCubic = (t: number) => t * t * t
  
  // Buttery smooth transitions with easing
  const fadeInProgress = Math.min(segmentTime / 0.8, 1) // 0.8s fade in
  const fadeOutProgress = Math.max((segmentTime - (framesPerPlayer - 0.6)) / 0.6, 0) // 0.6s fade out
  const fadeIn = easeOutCubic(fadeInProgress)
  const fadeOut = 1 - easeInCubic(fadeOutProgress)
  const opacity = fadeIn * fadeOut
  
  const scaleProgress = segmentTime / framesPerPlayer
  const scale = 1 + 0.05 * easeOutCubic(scaleProgress) // Subtle zoom
  
  const moveProgress = Math.min(segmentTime / 1.0, 1) // 1s movement
  const playerY = 40 * (1 - easeOutCubic(moveProgress)) // Smooth slide up
  
  const glowPulse = 0.7 + 0.3 * Math.sin(segmentTime * 1.5)
  
  return (
    <AbsoluteFill style={{ backgroundColor: DESIGN.colors.bg }}>
      <AbsoluteFill>
        <img 
          src={ASSETS.stadium} 
          alt="" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover', 
            transform: `scale(${scale})`, 
            filter: 'brightness(0.25) blur(2px)',
            transition: 'transform 0.3s ease-out',
          }} 
        />
      </AbsoluteFill>
      
      <SmokeOverlay intensity={0.7} time={time} />
      
      {/* Player - with smooth CSS transitions */}
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', opacity, transition: 'opacity 0.15s ease-out' }}>
        <img
          src={player.image}
          alt={player.lastName}
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '75%',
            objectFit: 'contain',
            objectPosition: 'bottom center',
            transform: `translateY(${playerY}px) scale(${scale})`,
            filter: `drop-shadow(0 0 ${50 * glowPulse}px ${DESIGN.colors.green})`,
            willChange: 'transform, opacity, filter',
          }}
        />
      </AbsoluteFill>
      
      {/* Hero glow */}
      <AbsoluteFill style={{ pointerEvents: 'none', opacity: opacity * glowPulse * 0.4 }}>
        <div
          style={{
            position: 'absolute',
            bottom: '5%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            height: '60%',
            background: `radial-gradient(ellipse at center bottom, ${DESIGN.colors.green}40 0%, transparent 50%)`,
            filter: 'blur(100px)',
          }}
        />
      </AbsoluteFill>
      
      <Vignette />
      
      {/* Player name - glow only */}
      <AbsoluteFill style={{ padding: DESIGN.space.lg, paddingBottom: '14%', justifyContent: 'flex-end', opacity }}>
        <div style={{ 
          fontFamily: DESIGN.fonts.hero, 
          fontWeight: 400, 
          fontSize: 'clamp(40px, 14vw, 64px)', 
          lineHeight: 0.9, 
          color: DESIGN.colors.ink, 
          textShadow: `0 0 50px ${DESIGN.colors.green}`,
          letterSpacing: DESIGN.tracking.tight,
        }}>
          {player.lastName}
        </div>
        <div style={{ marginTop: 6, display: 'flex', gap: DESIGN.space.sm, alignItems: 'center' }}>
          <span style={{ 
            fontFamily: DESIGN.fonts.hero, 
            fontWeight: 400, 
            fontSize: 'clamp(24px, 8vw, 36px)', 
            color: DESIGN.colors.green, 
            textShadow: `0 0 30px ${DESIGN.colors.green}`,
          }}>
            #{player.jersey}
          </span>
          <span style={{ 
            fontFamily: DESIGN.fonts.title, 
            fontWeight: 400, 
            fontSize: 'clamp(14px, 4vw, 20px)', 
            color: DESIGN.colors.inkDim, 
            letterSpacing: DESIGN.tracking.wider,
            textTransform: 'uppercase',
          }}>
            {player.position}
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

// ============================================================================
// SCENE 10: CTA - Plane descends fully into center
// ============================================================================
function SceneCTA({ time }: { time: number }) {
  const localTime = time - SCENES.cta.start
  const duration = SCENES.cta.end - SCENES.cta.start
  
  // Plane descends from top to CENTER of mobile screen (where the field is)
  // Extended flight path for dramatic landing
  const progress = interpolate(localTime, [0, duration], [0, 1])
  const easedProgress = progress * progress * (3 - 2 * progress) // smoothstep for smooth decel
  // Y goes from -400 (off top) to 380 (center of mobile screen)
  const planeY = -400 + 780 * easedProgress // -400 to 380
  const planeScale = 0.3 + 0.8 * easedProgress // 0.3 to 1.1
  const planeRotate = -15 + 20 * easedProgress // -15 to 5 (nose down to level)
  const textScale = 0.9 + 0.12 * interpolate(localTime, [1.0, 2.0], [0, 1]) // Delayed for impact
  const textOpacity = interpolate(localTime, [0.8, 1.6], [0, 1]) // Fade in text
  const pulse = 0.6 + 0.4 * Math.sin(time * 2.5)
  
  return (
    <AbsoluteFill style={{ backgroundColor: DESIGN.colors.bg }}>
      <AbsoluteFill>
        <img src={ASSETS.seattle} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.35)' }} />
      </AbsoluteFill>
      
      <SmokeOverlay intensity={0.5} time={time} />
      
      {/* Plane - descends into center of screen (no flip - text readable) */}
      <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center' }}>
        <img
          src={ASSETS.plane}
          alt=""
          style={{
            width: 'clamp(160px, 40vw, 260px)',
            height: 'auto',
            // No flip - plane text stays readable, rotate for descent angle
            transform: `translateY(${planeY}px) scale(${planeScale}) rotate(${planeRotate}deg)`,
            filter: `drop-shadow(0 40px 80px rgba(0,0,0,0.5)) drop-shadow(0 0 40px ${DESIGN.colors.green}30)`,
            willChange: 'transform',
          }}
        />
      </AbsoluteFill>
      
      <Vignette />
      
      {/* CTA - Premium styling */}
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '16%', opacity: textOpacity }}>
        <div style={{ textAlign: 'center', transform: `scale(${textScale})` }}>
          <div style={{ 
            fontFamily: DESIGN.fonts.hero, 
            fontWeight: 400, 
            fontSize: 'clamp(40px, 14vw, 72px)', 
            color: DESIGN.colors.ink, 
            letterSpacing: DESIGN.tracking.tight,
            textShadow: `0 0 ${50 + 30 * pulse}px ${DESIGN.colors.green}`,
          }}>
            ENTER NOW
          </div>
          
          <div
            style={{
              marginTop: DESIGN.space.lg,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 52,
              paddingLeft: 32,
              paddingRight: 32,
              borderRadius: 100,
              background: `linear-gradient(135deg, ${DESIGN.colors.green} 0%, #5CBF3A 100%)`,
              boxShadow: `0 0 ${30 + 20 * pulse}px ${DESIGN.colors.green}`,
            }}
          >
            <span style={{ 
              fontFamily: DESIGN.fonts.hero, 
              fontWeight: 400, 
              fontSize: 'clamp(18px, 5vw, 24px)', 
              color: DESIGN.colors.navy, 
              letterSpacing: DESIGN.tracking.tight,
            }}>
              game.drinksip.com
            </span>
          </div>
          
          <div style={{ 
            marginTop: DESIGN.space.sm, 
            fontFamily: DESIGN.fonts.title, 
            fontWeight: 400, 
            fontSize: 11, 
            color: DESIGN.colors.inkDim, 
            letterSpacing: DESIGN.tracking.wider,
            textTransform: 'uppercase',
          }}>
            Drawing Saturday • San Francisco
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
interface SplashAnimationProps {
  onComplete?: () => void
  onSkip?: () => void
  muted?: boolean
  onMuteToggle?: () => void
}

export default function SplashAnimation({ onComplete, onSkip, muted = true, onMuteToggle }: SplashAnimationProps) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [showSkip, setShowSkip] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const time = useAnimationTime(isPlaying)
  const { isHighEnd } = useDeviceCapability()
  
  // Show skip button after 3s
  useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), 3000)
    return () => clearTimeout(timer)
  }, [])
  
  // Handle completion
  useEffect(() => {
    if (time >= TOTAL_DURATION && onComplete) {
      setIsPlaying(false)
      onComplete()
    }
  }, [time, onComplete])
  
  // Audio sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = muted
      if (isPlaying && time < TOTAL_DURATION) {
        audioRef.current.currentTime = time + 10 // Start at hype section (10s in)
        audioRef.current.play().catch(() => {})
      }
    }
  }, [muted, isPlaying])
  
  // Determine which scene to show
  const getCurrentScene = () => {
    if (time < SCENES.intro.end) return <SceneIntro time={time} />
    if (time < SCENES.mapFlight.end) return <SceneMapFlight time={time} />
    if (time < SCENES.gameHub.end) return <SceneGameHub time={time} />
    if (time < SCENES.picks.end) return <ScenePicks time={time} />
    if (time < SCENES.live.end) return <SceneLive time={time} />
    if (time < SCENES.scanWin.end) return <SceneScanWin time={time} />
    if (time < SCENES.features.end) return <SceneFeatures time={time} />
    if (time < SCENES.giveaway.end) return <SceneGiveaway time={time} />
    if (time < SCENES.players.end) return <ScenePlayerShowcase time={time} />
    return <SceneCTA time={time} />
  }
  
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: DESIGN.colors.bg,
        overflow: 'hidden',
      }}
    >
      {/* Audio */}
      <audio ref={audioRef} src="/audio/music/land-of-the-12s.mp4" loop={false} preload="auto" />
      
      {/* Scene */}
      {getCurrentScene()}
      
      {/* ========== ULTRA-MINIMAL CONTROLS ========== */}
      
      {/* Tiny bottom progress line */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          background: 'rgba(255,255,255,0.1)',
          zIndex: 100,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${(time / TOTAL_DURATION) * 100}%`,
            background: DESIGN.colors.green,
            transition: 'width 0.15s linear',
          }}
        />
      </div>
      
      {/* Corner controls - icon only */}
      <div
        style={{
          position: 'absolute',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
          right: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          zIndex: 100,
        }}
      >
        {/* Sound toggle - icon only */}
        <motion.button
          onClick={onMuteToggle}
          whileTap={{ scale: 0.95 }}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: muted ? 'rgba(255,255,255,0.5)' : DESIGN.colors.green,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </motion.button>
        
        {/* Skip - compact pill */}
        <AnimatePresence>
          {showSkip && (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setIsPlaying(false)
                onSkip?.()
              }}
              style={{
                height: 36,
                paddingLeft: 14,
                paddingRight: 10,
                borderRadius: 100,
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.9)',
                fontSize: 11,
                fontFamily: 'var(--font-oswald), "Oswald", sans-serif',
                fontWeight: 500,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              Skip
              <ChevronRight size={14} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
