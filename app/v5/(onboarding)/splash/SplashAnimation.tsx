'use client'

/**
 * DARK SIDE FOOTBALL — REACT SPLASH ANIMATION
 * 
 * Premium 60fps React + Framer Motion version
 * Replaces video for crisp, native resolution rendering
 * 
 * Duration: 30 seconds
 * Resolution: Native device resolution (not fixed 1080p)
 */

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, useAnimationFrame } from 'framer-motion'
import Image from 'next/image'

// ============================================================================
// DESIGN SYSTEM
// ============================================================================
const DESIGN = {
  colors: {
    navy: '#002244',
    green: '#69BE28',
    gold: '#FFD700',
    ink: '#F8F9FC',
    inkDim: 'rgba(248,249,252,0.6)',
    grey: '#A5ACAF',
    bg: '#020408',
  },
  fonts: {
    hero: '"Bebas Neue", "Oswald", "Impact", sans-serif',
    title: '"Oswald", "Arial Black", sans-serif',
    body: '"Inter", "Helvetica Neue", Arial, sans-serif',
  },
}

// ============================================================================
// ASSETS
// ============================================================================
const DRINKSIP_LOGO = 'https://drinksip.com/cdn/shop/files/DrinkSip-Primary-Logo-for-Web_-_Copy_small_55182640-be2f-4a9a-af3e-3c9ea7582c69.png?v=1659115921&width=500'

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
// TIMING (in seconds)
// ============================================================================
const SCENES = {
  intro: { start: 0, end: 5 },
  mapFlight: { start: 5, end: 7 },
  gameHub: { start: 7, end: 9 },
  picks: { start: 9, end: 11 },
  live: { start: 11, end: 13 },
  scanWin: { start: 13, end: 15 },
  features: { start: 15, end: 17 },
  giveaway: { start: 17, end: 19 },
  players: { start: 19, end: 26 },
  cta: { start: 26, end: 30 },
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
    setTime(Math.min(elapsed, 30)) // Cap at 30 seconds
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
  
  // Phase 1: DrinkSip (0-2.5s)
  const logoOpacity = interpolate(localTime, [0, 0.5], [0, 1]) * interpolate(localTime, [2.2, 2.8], [1, 0])
  const logoScale = 0.9 + 0.1 * interpolate(localTime, [0, 0.8], [0, 1])
  const presentsOpacity = interpolate(localTime, [0.8, 1.5], [0, 1])
  
  // Phase 2: Dark Side (2.5-5s)
  const titleOpacity = interpolate(localTime, [2.5, 3], [0, 1])
  const titleScale = 0.85 + 0.15 * interpolate(localTime, [2.5, 3.2], [0, 1])
  const subtitleOpacity = interpolate(localTime, [3.3, 3.8], [0, 1])
  const playFromHomeOpacity = interpolate(localTime, [3.8, 4.3], [0, 1])
  
  return (
    <AbsoluteFill style={{ backgroundColor: DESIGN.colors.bg }}>
      {/* Stadium background */}
      <AbsoluteFill>
        <img src={ASSETS.stadium} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.15) blur(6px)' }} />
      </AbsoluteFill>
      
      <SmokeOverlay intensity={0.4} time={time} />
      <Vignette />
      
      {/* Phase 1: DrinkSip */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: logoOpacity }}>
        <div style={{ textAlign: 'center', transform: `scale(${logoScale})` }}>
          <img
            src={DRINKSIP_LOGO}
            alt="DrinkSip"
            style={{ height: 100, width: 'auto', filter: 'drop-shadow(0 20px 60px rgba(255,215,0,0.5))' }}
          />
          <div
            style={{
              marginTop: 24,
              fontFamily: DESIGN.fonts.title,
              fontWeight: 600,
              fontSize: 'clamp(16px, 5vw, 24px)',
              letterSpacing: '0.4em',
              color: DESIGN.colors.gold,
              opacity: presentsOpacity,
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
              fontWeight: 900,
              fontSize: 'clamp(60px, 20vw, 120px)',
              lineHeight: 0.85,
              letterSpacing: '-0.02em',
              background: `linear-gradient(180deg, ${DESIGN.colors.ink} 20%, ${DESIGN.colors.green} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: `0 0 120px ${DESIGN.colors.green}`,
            }}
          >
            DARK SIDE
          </div>
          <div
            style={{
              marginTop: 16,
              fontFamily: DESIGN.fonts.title,
              fontWeight: 500,
              fontSize: 'clamp(14px, 4vw, 22px)',
              letterSpacing: '0.25em',
              color: DESIGN.colors.inkDim,
              opacity: subtitleOpacity,
            }}
          >
            THE FOOTBALL GAME
          </div>
          <div
            style={{
              marginTop: 14,
              fontFamily: DESIGN.fonts.title,
              fontWeight: 700,
              fontSize: 'clamp(12px, 3.5vw, 20px)',
              letterSpacing: '0.15em',
              color: DESIGN.colors.green,
              opacity: playFromHomeOpacity,
              textShadow: `0 0 30px ${DESIGN.colors.green}`,
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
// SCENE 2: MAP FLIGHT
// ============================================================================
function SceneMapFlight({ time }: { time: number }) {
  const localTime = time - SCENES.mapFlight.start
  const duration = SCENES.mapFlight.end - SCENES.mapFlight.start
  
  const progress = interpolate(localTime, [0, duration], [0, 1])
  const planeX = interpolate(progress, [0, 1], [-300, 200])
  const planeY = interpolate(progress, [0, 1], [100, -50])
  const planeScale = 0.9 + 0.2 * progress
  const textOpacity = interpolate(localTime, [0.5, 1], [0, 1])
  
  return (
    <AbsoluteFill style={{ backgroundColor: DESIGN.colors.bg }}>
      <AbsoluteFill>
        <img src={ASSETS.usMap} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.45) contrast(1.1)' }} />
      </AbsoluteFill>
      
      <SmokeOverlay intensity={0.5} time={time} />
      
      {/* Plane */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <img
          src={ASSETS.plane}
          alt=""
          style={{
            width: 'clamp(200px, 60vw, 400px)',
            height: 'auto',
            transform: `translate(${planeX}px, ${planeY}px) scale(${planeScale}) rotate(-8deg)`,
            filter: 'drop-shadow(0 60px 100px rgba(0,0,0,0.7))',
            willChange: 'transform',
          }}
        />
      </AbsoluteFill>
      
      <Vignette />
      
      {/* Text */}
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '15%', opacity: textOpacity }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: DESIGN.fonts.title, fontWeight: 600, fontSize: 'clamp(16px, 5vw, 28px)', letterSpacing: '0.25em', color: DESIGN.colors.inkDim }}>
            ROAD TO
          </div>
          <div style={{ fontFamily: DESIGN.fonts.hero, fontWeight: 900, fontSize: 'clamp(36px, 12vw, 60px)', letterSpacing: '0.02em', color: DESIGN.colors.gold, textShadow: `0 0 80px ${DESIGN.colors.gold}`, marginTop: 6 }}>
            SAN FRANCISCO
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

// ============================================================================
// SCENE 3: GAME HUB
// ============================================================================
function SceneGameHub({ time }: { time: number }) {
  const localTime = time - SCENES.gameHub.start
  const phoneScale = 0.85 + 0.2 * interpolate(localTime, [0, 0.5], [0, 1])
  const phoneY = 60 - 60 * interpolate(localTime, [0, 0.5], [0, 1])
  const textOpacity = interpolate(localTime, [0.4, 0.9], [0, 1])
  
  return (
    <AbsoluteFill style={{ backgroundColor: DESIGN.colors.bg }}>
      <AbsoluteFill>
        <img src={ASSETS.stadium} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.25)' }} />
      </AbsoluteFill>
      
      <SmokeOverlay intensity={0.6} time={time} />
      <Vignette />
      
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ transform: `translateY(${phoneY}px) scale(${phoneScale})`, willChange: 'transform' }}>
          <PhoneMockup screen={SCREENS.gameHub} scale={1.3} />
        </div>
      </AbsoluteFill>
      
      <AbsoluteFill style={{ padding: 32, paddingTop: '10%', justifyContent: 'flex-start', opacity: textOpacity }}>
        <div style={{ fontFamily: DESIGN.fonts.hero, fontWeight: 900, fontSize: 'clamp(36px, 12vw, 56px)', color: DESIGN.colors.green, letterSpacing: '0.02em', textShadow: `0 0 60px ${DESIGN.colors.green}` }}>
          PLAY THE GAME
        </div>
        <div style={{ marginTop: 10, fontFamily: DESIGN.fonts.title, fontWeight: 600, fontSize: 'clamp(14px, 4vw, 22px)', color: DESIGN.colors.ink, letterSpacing: '0.05em' }}>
          Earn entries from home
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

// ============================================================================
// SCENE 4: PICKS
// ============================================================================
function ScenePicks({ time }: { time: number }) {
  const localTime = time - SCENES.picks.start
  const phoneScale = 0.9 + 0.15 * interpolate(localTime, [0, 0.4], [0, 1])
  const phoneY = 40 - 40 * interpolate(localTime, [0, 0.4], [0, 1])
  
  return (
    <AbsoluteFill style={{ backgroundColor: DESIGN.colors.bg }}>
      <AbsoluteFill>
        <img src={ASSETS.stadium} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.25)' }} />
      </AbsoluteFill>
      
      <SmokeOverlay intensity={0.5} time={time} />
      <Vignette />
      
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ transform: `scale(${phoneScale}) translateY(${phoneY}px)`, willChange: 'transform' }}>
          <PhoneMockup screen={SCREENS.picksHub} scale={1.3} />
        </div>
      </AbsoluteFill>
      
      <AbsoluteFill style={{ padding: 32, justifyContent: 'flex-end', paddingBottom: '12%' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: DESIGN.fonts.hero, fontWeight: 900, fontSize: 'clamp(40px, 14vw, 64px)', color: DESIGN.colors.ink, letterSpacing: '0.01em', textShadow: '0 4px 0 rgba(0,0,0,0.3)' }}>
            PROP PICKS
          </div>
          <div style={{ marginTop: 12, fontFamily: DESIGN.fonts.title, fontWeight: 600, fontSize: 'clamp(14px, 4vw, 22px)', color: DESIGN.colors.green, letterSpacing: '0.08em' }}>
            25 props • Win a signed jersey
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

// ============================================================================
// SCENE 5: LIVE
// ============================================================================
function SceneLive({ time }: { time: number }) {
  const localTime = time - SCENES.live.start
  const phoneScale = 0.9 + 0.15 * interpolate(localTime, [0, 0.4], [0, 1])
  const pulse = 0.6 + 0.4 * Math.sin(time * 3)
  
  return (
    <AbsoluteFill style={{ backgroundColor: DESIGN.colors.bg }}>
      <AbsoluteFill>
        <img src={ASSETS.stadium} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.25)' }} />
      </AbsoluteFill>
      
      <SmokeOverlay intensity={0.6} time={time} />
      <Vignette />
      
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ transform: `scale(${phoneScale})`, willChange: 'transform' }}>
          <PhoneMockup screen={SCREENS.live} scale={1.3} glowColor="#FF3333" />
        </div>
      </AbsoluteFill>
      
      {/* LIVE badge */}
      <AbsoluteFill style={{ padding: 32, justifyContent: 'flex-start', paddingTop: '8%' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 24px',
            background: 'rgba(255,0,0,0.2)',
            borderRadius: 100,
            border: '2px solid rgba(255,0,0,0.5)',
            boxShadow: `0 0 ${30 + 20 * pulse}px rgba(255,0,0,0.5)`,
            width: 'fit-content',
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF0000', boxShadow: '0 0 20px #FF0000' }} />
          <span style={{ fontFamily: DESIGN.fonts.title, fontWeight: 700, fontSize: 'clamp(14px, 4vw, 20px)', color: '#FF4444', letterSpacing: '0.12em' }}>
            LIVE GAMEDAY
          </span>
        </div>
      </AbsoluteFill>
      
      <AbsoluteFill style={{ padding: 32, justifyContent: 'flex-end', paddingBottom: '12%' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: DESIGN.fonts.hero, fontWeight: 900, fontSize: 'clamp(36px, 12vw, 56px)', color: DESIGN.colors.ink, textShadow: '0 4px 0 rgba(0,0,0,0.3)' }}>
            PREDICT PLAYS
          </div>
          <div style={{ marginTop: 10, fontFamily: DESIGN.fonts.title, fontWeight: 600, fontSize: 'clamp(14px, 4vw, 22px)', color: DESIGN.colors.green, letterSpacing: '0.06em' }}>
            Answer fast • Earn bonus entries
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

// ============================================================================
// SCENE 6: SCAN & WIN
// ============================================================================
function SceneScanWin({ time }: { time: number }) {
  const localTime = time - SCENES.scanWin.start
  const phoneScale = 0.9 + 0.15 * interpolate(localTime, [0, 0.4], [0, 1])
  const phoneY = 30 - 30 * interpolate(localTime, [0, 0.4], [0, 1])
  const sparkle = 0.7 + 0.3 * Math.sin(time * 3)
  
  return (
    <AbsoluteFill style={{ backgroundColor: DESIGN.colors.bg }}>
      <AbsoluteFill>
        <img src={ASSETS.stadium} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.25)' }} />
      </AbsoluteFill>
      
      <SmokeOverlay intensity={0.6} time={time} />
      <Vignette />
      
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ transform: `scale(${phoneScale}) translateY(${phoneY}px)`, willChange: 'transform' }}>
          <PhoneMockup screen={SCREENS.scratchCard} scale={1.3} glowColor={DESIGN.colors.gold} />
        </div>
      </AbsoluteFill>
      
      <AbsoluteFill style={{ padding: 32, justifyContent: 'flex-start', paddingTop: '8%' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: DESIGN.fonts.hero, fontWeight: 900, fontSize: 'clamp(40px, 14vw, 64px)', color: DESIGN.colors.gold, textShadow: `0 0 ${60 * sparkle}px ${DESIGN.colors.gold}` }}>
            SCAN & WIN
          </div>
          <div style={{ marginTop: 12, fontFamily: DESIGN.fonts.title, fontWeight: 600, fontSize: 'clamp(14px, 4vw, 22px)', color: DESIGN.colors.ink, letterSpacing: '0.06em' }}>
            Daily prizes • Bonus entries
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

// ============================================================================
// SCENE 7: FEATURES (Leaderboard + Profile)
// ============================================================================
function SceneFeatures({ time }: { time: number }) {
  const localTime = time - SCENES.features.start
  const phone1Progress = interpolate(localTime, [0, 0.5], [0, 1])
  const phone2Progress = interpolate(localTime, [0.3, 0.8], [0, 1])
  
  return (
    <AbsoluteFill style={{ backgroundColor: DESIGN.colors.bg }}>
      <AbsoluteFill>
        <img src={ASSETS.stadium} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.25)' }} />
      </AbsoluteFill>
      
      <SmokeOverlay intensity={0.5} time={time} />
      <Vignette />
      
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ transform: `translateX(${-40 + 40 * phone1Progress}px) rotate(-5deg)`, opacity: phone1Progress }}>
            <PhoneMockup screen={SCREENS.leaderboard} scale={0.85} tilt={8} />
          </div>
          <div style={{ transform: `translateX(${40 - 40 * phone2Progress}px) rotate(5deg)`, opacity: phone2Progress }}>
            <PhoneMockup screen={SCREENS.profile} scale={0.85} tilt={-8} />
          </div>
        </div>
      </AbsoluteFill>
      
      <AbsoluteFill style={{ padding: 32, justifyContent: 'flex-end', paddingBottom: '12%' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: DESIGN.fonts.hero, fontSize: 'clamp(32px, 10vw, 48px)', color: DESIGN.colors.green, textShadow: `0 0 40px ${DESIGN.colors.green}` }}>
            COMPETE & CLIMB
          </div>
          <div style={{ fontSize: 'clamp(12px, 3.5vw, 20px)', color: DESIGN.colors.inkDim, marginTop: 10, fontFamily: DESIGN.fonts.title, letterSpacing: '0.05em' }}>
            Track your entries • Climb the ranks
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

// ============================================================================
// SCENE 8: GIVEAWAY
// ============================================================================
function SceneGiveaway({ time }: { time: number }) {
  const localTime = time - SCENES.giveaway.start
  const duration = SCENES.giveaway.end - SCENES.giveaway.start
  
  const zoom = interpolate(localTime, [0, duration], [1.12, 1])
  const cardScale = 0.9 + 0.12 * interpolate(localTime, [0.5, 1], [0, 1])
  const sweepX = interpolate(localTime, [0, duration], [-300, 300])
  
  return (
    <AbsoluteFill style={{ backgroundColor: DESIGN.colors.bg }}>
      <AbsoluteFill>
        <img src={ASSETS.sanFrancisco} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`, filter: 'brightness(0.45) contrast(1.1)' }} />
      </AbsoluteFill>
      
      <SmokeOverlay intensity={0.6} time={time} />
      <Vignette />
      
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', transform: `scale(${cardScale})` }}>
          <div style={{ fontFamily: DESIGN.fonts.hero, fontWeight: 900, fontSize: 'clamp(60px, 20vw, 110px)', color: DESIGN.colors.ink, textShadow: `0 0 100px ${DESIGN.colors.gold}` }}>
            WIN
          </div>
          
          {/* Premium ticket card */}
          <div
            style={{
              position: 'relative',
              width: 'clamp(280px, 80vw, 500px)',
              padding: '28px 40px',
              background: `linear-gradient(135deg, ${DESIGN.colors.gold} 0%, #B8860B 100%)`,
              borderRadius: 24,
              boxShadow: `0 0 100px ${hexToRgba(DESIGN.colors.gold, 0.5)}`,
              transform: 'rotate(-2deg)',
              overflow: 'hidden',
              margin: '0 auto',
            }}
          >
            {/* Shine sweep */}
            <div
              style={{
                position: 'absolute',
                inset: -60,
                transform: `translateX(${sweepX}px) rotate(15deg)`,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                willChange: 'transform',
              }}
            />
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div style={{ fontFamily: DESIGN.fonts.title, fontWeight: 700, fontSize: 'clamp(12px, 3.5vw, 18px)', letterSpacing: '0.18em', color: DESIGN.colors.navy }}>
                THE BIG GAME GIVEAWAY
              </div>
              <div style={{ fontFamily: DESIGN.fonts.hero, fontWeight: 900, fontSize: 'clamp(36px, 12vw, 56px)', color: DESIGN.colors.navy, lineHeight: 1.1 }}>
                2 TICKETS
              </div>
              <div style={{ marginTop: 8, fontFamily: DESIGN.fonts.body, fontWeight: 600, fontSize: 'clamp(12px, 3vw, 18px)', color: 'rgba(0,34,68,0.7)' }}>
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
// SCENE 9: PLAYERS
// ============================================================================
function ScenePlayerShowcase({ time }: { time: number }) {
  const localTime = time - SCENES.players.start
  const duration = SCENES.players.end - SCENES.players.start
  const framesPerPlayer = duration / 4
  const idx = Math.min(Math.floor(localTime / framesPerPlayer), HERO_PLAYERS.length - 1)
  const segmentTime = localTime - idx * framesPerPlayer
  
  const player = HERO_PLAYERS[idx]
  const scale = interpolate(segmentTime, [0, framesPerPlayer], [1, 1.08])
  const opacity = interpolate(segmentTime, [0, 0.3], [0, 1]) * interpolate(segmentTime, [framesPerPlayer - 0.4, framesPerPlayer], [1, 0])
  const playerY = interpolate(segmentTime, [0, 0.5], [60, 0])
  const glowPulse = 0.6 + 0.4 * Math.sin(segmentTime * 2)
  
  return (
    <AbsoluteFill style={{ backgroundColor: DESIGN.colors.bg }}>
      <AbsoluteFill>
        <img src={ASSETS.stadium} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})`, filter: 'brightness(0.2) blur(3px)' }} />
      </AbsoluteFill>
      
      <SmokeOverlay intensity={0.8} time={time} />
      
      {/* Player */}
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', opacity }}>
        <img
          src={player.image}
          alt={player.lastName}
          style={{
            width: '110%',
            height: 'auto',
            maxHeight: '80%',
            objectFit: 'contain',
            objectPosition: 'bottom center',
            transform: `translateY(${playerY}px) scale(${scale})`,
            filter: `drop-shadow(0 0 ${80 * glowPulse}px ${DESIGN.colors.green})`,
            willChange: 'transform, filter',
          }}
        />
      </AbsoluteFill>
      
      {/* Hero glow */}
      <AbsoluteFill style={{ pointerEvents: 'none', opacity: opacity * glowPulse * 0.5 }}>
        <div
          style={{
            position: 'absolute',
            bottom: '5%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '85%',
            height: '65%',
            background: `radial-gradient(ellipse at center bottom, ${DESIGN.colors.green}50 0%, transparent 50%)`,
            filter: 'blur(120px)',
          }}
        />
      </AbsoluteFill>
      
      <Vignette />
      
      {/* Player name */}
      <AbsoluteFill style={{ padding: 32, paddingBottom: '12%', justifyContent: 'flex-end', opacity }}>
        <div style={{ fontFamily: DESIGN.fonts.hero, fontWeight: 900, fontSize: 'clamp(48px, 16vw, 90px)', lineHeight: 0.85, color: DESIGN.colors.ink, textShadow: `0 0 80px ${DESIGN.colors.green}, 0 4px 0 ${DESIGN.colors.green}`, letterSpacing: '-0.02em' }}>
          {player.lastName}
        </div>
        <div style={{ marginTop: 14, display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ fontFamily: DESIGN.fonts.hero, fontWeight: 900, fontSize: 'clamp(28px, 10vw, 48px)', color: DESIGN.colors.green, textShadow: `0 0 40px ${DESIGN.colors.green}` }}>
            #{player.jersey}
          </span>
          <span style={{ fontFamily: DESIGN.fonts.title, fontWeight: 600, fontSize: 'clamp(18px, 6vw, 30px)', color: DESIGN.colors.inkDim, letterSpacing: '0.08em' }}>
            {player.position}
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

// ============================================================================
// SCENE 10: CTA
// ============================================================================
function SceneCTA({ time }: { time: number }) {
  const localTime = time - SCENES.cta.start
  const duration = SCENES.cta.end - SCENES.cta.start
  
  const planeY = interpolate(localTime, [0, duration], [-300, 200])
  const planeScale = interpolate(localTime, [0, duration], [0.4, 1.15])
  const planeRotate = interpolate(localTime, [0, duration], [-15, 8])
  const textScale = 0.9 + 0.12 * interpolate(localTime, [0.8, 1.5], [0, 1])
  const pulse = 0.6 + 0.4 * Math.sin(time * 2.5)
  
  return (
    <AbsoluteFill style={{ backgroundColor: DESIGN.colors.bg }}>
      <AbsoluteFill>
        <img src={ASSETS.seattle} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.3)' }} />
      </AbsoluteFill>
      
      <SmokeOverlay intensity={0.6} time={time} />
      
      {/* Plane */}
      <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center' }}>
        <img
          src={ASSETS.plane}
          alt=""
          style={{
            width: 'clamp(200px, 50vw, 350px)',
            height: 'auto',
            transform: `translateY(${planeY}px) scale(${planeScale}) rotate(${planeRotate}deg)`,
            filter: `drop-shadow(0 50px 100px rgba(0,0,0,0.6)) drop-shadow(0 0 50px ${DESIGN.colors.green}40)`,
            willChange: 'transform',
          }}
        />
      </AbsoluteFill>
      
      <Vignette />
      
      {/* CTA */}
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '15%' }}>
        <div style={{ textAlign: 'center', transform: `scale(${textScale})` }}>
          <div style={{ fontFamily: DESIGN.fonts.hero, fontWeight: 900, fontSize: 'clamp(48px, 16vw, 100px)', color: DESIGN.colors.ink, textShadow: `0 0 ${80 + 50 * pulse}px ${DESIGN.colors.green}` }}>
            ENTER NOW
          </div>
          
          <div
            style={{
              marginTop: 24,
              display: 'inline-flex',
              padding: '18px 44px',
              borderRadius: 100,
              background: `linear-gradient(135deg, ${DESIGN.colors.green} 0%, #4CAF50 100%)`,
              boxShadow: `0 0 ${50 + 30 * pulse}px ${DESIGN.colors.green}`,
            }}
          >
            <span style={{ fontFamily: DESIGN.fonts.hero, fontWeight: 900, fontSize: 'clamp(20px, 6vw, 30px)', color: DESIGN.colors.navy, letterSpacing: '0.03em' }}>
              game.drinksip.com
            </span>
          </div>
          
          <div style={{ marginTop: 18, fontFamily: DESIGN.fonts.title, fontWeight: 600, fontSize: 'clamp(14px, 4vw, 20px)', color: DESIGN.colors.inkDim, letterSpacing: '0.08em' }}>
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
    if (time >= 30 && onComplete) {
      setIsPlaying(false)
      onComplete()
    }
  }, [time, onComplete])
  
  // Audio sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = muted
      if (isPlaying && time < 30) {
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
      
      {/* Progress bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'rgba(255,255,255,0.1)',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${(time / 30) * 100}%`,
            background: DESIGN.colors.green,
            transition: 'width 0.1s linear',
          }}
        />
      </div>
      
      {/* Controls */}
      <div
        style={{
          position: 'absolute',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
          right: 16,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}
      >
        {/* Mute button */}
        <button
          onClick={onMuteToggle}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 16,
          }}
        >
          {muted ? '🔇' : '🔊'}
        </button>
        
        {/* Skip button */}
        {showSkip && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => {
              setIsPlaying(false)
              onSkip?.()
            }}
            style={{
              padding: '10px 20px',
              borderRadius: 100,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            Skip <span style={{ fontSize: 12 }}>→</span>
          </motion.button>
        )}
      </div>
      
      {/* Tap for sound hint */}
      {muted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'absolute',
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
            left: 16,
            padding: '8px 14px',
            borderRadius: 100,
            background: 'rgba(0,0,0,0.6)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.8)',
            fontSize: 12,
            pointerEvents: 'none',
          }}
        >
          Tap 🔇 for sound
        </motion.div>
      )}
    </div>
  )
}
