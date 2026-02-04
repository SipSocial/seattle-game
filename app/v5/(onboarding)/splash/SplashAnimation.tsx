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
      
      {/* Phase 1: DrinkSip - Perfectly centered with proper spacing */}
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
            padding: '0 24px',
          }}
        >
          <img
            src={DRINKSIP_LOGO}
            alt="DrinkSip"
            style={{ 
              height: 'clamp(70px, 18vw, 110px)', 
              width: 'auto', 
              display: 'block',
              margin: '0 auto',
              filter: 'drop-shadow(0 16px 50px rgba(255,215,0,0.5))',
            }}
          />
          <div
            style={{
              marginTop: 'clamp(16px, 4vw, 28px)',
              fontFamily: DESIGN.fonts.title,
              fontWeight: 500,
              fontSize: 'clamp(14px, 4vw, 20px)',
              letterSpacing: '0.35em',
              color: DESIGN.colors.gold,
              opacity: presentsOpacity,
              textAlign: 'center',
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
// SCENE 2: MAP FLIGHT - Plane flies LEFT to RIGHT (Seattle → San Francisco)
// ============================================================================
function SceneMapFlight({ time }: { time: number }) {
  const localTime = time - SCENES.mapFlight.start
  const duration = SCENES.mapFlight.end - SCENES.mapFlight.start
  
  const progress = interpolate(localTime, [0, duration], [0, 1])
  // Plane flies LEFT to RIGHT: start off-screen left, end center-right
  const planeX = interpolate(progress, [0, 1], [-350, 150])
  const planeY = interpolate(progress, [0, 1], [50, -30])
  const planeScale = 0.85 + 0.25 * progress
  const textOpacity = interpolate(localTime, [0.5, 1], [0, 1])
  
  return (
    <AbsoluteFill style={{ backgroundColor: DESIGN.colors.bg }}>
      <AbsoluteFill>
        <img src={ASSETS.usMap} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.5) contrast(1.1)' }} />
      </AbsoluteFill>
      
      <SmokeOverlay intensity={0.4} time={time} />
      
      {/* Plane - flies LEFT to RIGHT naturally (no flip - text readable) */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <img
          src={ASSETS.plane}
          alt=""
          style={{
            width: 'clamp(200px, 50vw, 340px)',
            height: 'auto',
            // No flip - plane asset already faces the correct direction for readable text
            transform: `translate(${planeX}px, ${planeY}px) scale(${planeScale}) rotate(-8deg)`,
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
  const phoneScale = 0.85 + 0.2 * interpolate(localTime, [0, 0.5], [0, 1])
  const phoneY = 50 - 50 * interpolate(localTime, [0, 0.5], [0, 1])
  const textOpacity = interpolate(localTime, [0.4, 0.9], [0, 1])
  
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
      
      <AbsoluteFill style={{ padding: 24, paddingTop: '12%', justifyContent: 'flex-start', opacity: textOpacity }}>
        <div style={{ 
          fontFamily: DESIGN.fonts.hero, 
          fontWeight: 900, 
          fontSize: 'clamp(28px, 9vw, 44px)', 
          color: DESIGN.colors.green, 
          letterSpacing: '0.02em', 
          textShadow: `0 0 50px ${DESIGN.colors.green}`,
        }}>
          PLAY THE GAME
        </div>
        <div style={{ 
          marginTop: 8, 
          fontFamily: DESIGN.fonts.title, 
          fontWeight: 500, 
          fontSize: 'clamp(13px, 3.5vw, 18px)', 
          color: 'rgba(255,255,255,0.8)', 
          letterSpacing: '0.15em',
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
  const phoneScale = 0.9 + 0.15 * interpolate(localTime, [0, 0.4], [0, 1])
  const phoneY = 35 - 35 * interpolate(localTime, [0, 0.4], [0, 1])
  
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
      
      <AbsoluteFill style={{ padding: 24, justifyContent: 'flex-end', paddingBottom: '14%' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontFamily: DESIGN.fonts.hero, 
            fontWeight: 900, 
            fontSize: 'clamp(32px, 11vw, 52px)', 
            color: DESIGN.colors.ink, 
            letterSpacing: '0.02em', 
            textShadow: `0 0 50px rgba(255,255,255,0.3)`,
          }}>
            PROP PICKS
          </div>
          <div style={{ 
            marginTop: 10, 
            fontFamily: DESIGN.fonts.title, 
            fontWeight: 500, 
            fontSize: 'clamp(13px, 3.5vw, 18px)', 
            color: DESIGN.colors.green, 
            letterSpacing: '0.15em',
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
  const phoneScale = 0.9 + 0.15 * interpolate(localTime, [0, 0.4], [0, 1])
  const pulse = 0.6 + 0.4 * Math.sin(time * 3)
  
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
      
      {/* LIVE badge - compact and premium */}
      <AbsoluteFill style={{ padding: 24, justifyContent: 'flex-start', paddingTop: '12%' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            background: 'rgba(255,68,68,0.15)',
            borderRadius: 100,
            border: '1px solid rgba(255,68,68,0.4)',
            boxShadow: `0 0 ${25 + 15 * pulse}px rgba(255,68,68,0.4)`,
            width: 'fit-content',
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF4444', boxShadow: '0 0 15px #FF4444' }} />
          <span style={{ 
            fontFamily: DESIGN.fonts.title, 
            fontWeight: 600, 
            fontSize: 'clamp(12px, 3.5vw, 16px)', 
            color: '#FF6666', 
            letterSpacing: '0.15em',
          }}>
            LIVE GAMEDAY
          </span>
        </div>
      </AbsoluteFill>
      
      <AbsoluteFill style={{ padding: 24, justifyContent: 'flex-end', paddingBottom: '14%' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontFamily: DESIGN.fonts.hero, 
            fontWeight: 900, 
            fontSize: 'clamp(28px, 9vw, 44px)', 
            color: DESIGN.colors.ink, 
            letterSpacing: '0.02em',
            textShadow: `0 0 50px rgba(255,255,255,0.3)`,
          }}>
            PREDICT PLAYS
          </div>
          <div style={{ 
            marginTop: 10, 
            fontFamily: DESIGN.fonts.title, 
            fontWeight: 500, 
            fontSize: 'clamp(13px, 3.5vw, 18px)', 
            color: DESIGN.colors.green, 
            letterSpacing: '0.15em',
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
  const phoneScale = 0.9 + 0.15 * interpolate(localTime, [0, 0.4], [0, 1])
  const phoneY = 25 - 25 * interpolate(localTime, [0, 0.4], [0, 1])
  const sparkle = 0.7 + 0.3 * Math.sin(time * 3)
  
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
      
      <AbsoluteFill style={{ padding: 24, justifyContent: 'flex-start', paddingTop: '12%' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontFamily: DESIGN.fonts.hero, 
            fontWeight: 900, 
            fontSize: 'clamp(32px, 11vw, 52px)', 
            color: DESIGN.colors.gold, 
            letterSpacing: '0.02em',
            textShadow: `0 0 ${50 * sparkle}px ${DESIGN.colors.gold}`,
          }}>
            SCAN & WIN
          </div>
          <div style={{ 
            marginTop: 10, 
            fontFamily: DESIGN.fonts.title, 
            fontWeight: 500, 
            fontSize: 'clamp(13px, 3.5vw, 18px)', 
            color: 'rgba(255,255,255,0.8)', 
            letterSpacing: '0.15em',
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
  const phone1Progress = interpolate(localTime, [0, 0.5], [0, 1])
  const phone2Progress = interpolate(localTime, [0.3, 0.8], [0, 1])
  
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
      
      <AbsoluteFill style={{ padding: 24, justifyContent: 'flex-end', paddingBottom: '14%' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontFamily: DESIGN.fonts.hero, 
            fontWeight: 900,
            fontSize: 'clamp(26px, 8vw, 40px)', 
            color: DESIGN.colors.green, 
            letterSpacing: '0.02em',
            textShadow: `0 0 40px ${DESIGN.colors.green}`,
          }}>
            COMPETE & CLIMB
          </div>
          <div style={{ 
            fontSize: 'clamp(12px, 3.5vw, 16px)', 
            color: 'rgba(255,255,255,0.7)', 
            marginTop: 10, 
            fontFamily: DESIGN.fonts.title, 
            fontWeight: 500,
            letterSpacing: '0.15em',
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
  const cardScale = 0.9 + 0.1 * interpolate(localTime, [0.5, 1], [0, 1])
  const sweepX = interpolate(localTime, [0, duration], [-250, 250])
  
  return (
    <AbsoluteFill style={{ backgroundColor: DESIGN.colors.bg }}>
      <AbsoluteFill>
        <img src={ASSETS.sanFrancisco} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`, filter: 'brightness(0.5) contrast(1.1)' }} />
      </AbsoluteFill>
      
      <SmokeOverlay intensity={0.5} time={time} />
      <Vignette />
      
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', transform: `scale(${cardScale})` }}>
          <div style={{ 
            fontFamily: DESIGN.fonts.hero, 
            fontWeight: 900, 
            fontSize: 'clamp(50px, 16vw, 90px)', 
            color: DESIGN.colors.ink, 
            letterSpacing: '0.02em',
            textShadow: `0 0 80px ${DESIGN.colors.gold}`,
          }}>
            WIN
          </div>
          
          {/* Premium ticket card */}
          <div
            style={{
              position: 'relative',
              width: 'clamp(260px, 75vw, 420px)',
              padding: '24px 32px',
              background: `linear-gradient(135deg, ${DESIGN.colors.gold} 0%, #C4960E 100%)`,
              borderRadius: 20,
              boxShadow: `0 0 80px ${hexToRgba(DESIGN.colors.gold, 0.4)}`,
              transform: 'rotate(-1.5deg)',
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
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
                willChange: 'transform',
              }}
            />
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div style={{ 
                fontFamily: DESIGN.fonts.title, 
                fontWeight: 600, 
                fontSize: 'clamp(11px, 3vw, 15px)', 
                letterSpacing: '0.15em', 
                color: DESIGN.colors.navy,
              }}>
                THE BIG GAME GIVEAWAY
              </div>
              <div style={{ 
                fontFamily: DESIGN.fonts.hero, 
                fontWeight: 900, 
                fontSize: 'clamp(32px, 10vw, 48px)', 
                color: DESIGN.colors.navy, 
                lineHeight: 1.1,
                letterSpacing: '0.02em',
              }}>
                2 TICKETS
              </div>
              <div style={{ 
                marginTop: 6, 
                fontFamily: DESIGN.fonts.body, 
                fontWeight: 500, 
                fontSize: 'clamp(11px, 2.5vw, 14px)', 
                color: 'rgba(0,34,68,0.6)',
                letterSpacing: '0.1em',
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
  const scale = interpolate(segmentTime, [0, framesPerPlayer], [1, 1.06])
  const opacity = interpolate(segmentTime, [0, 0.3], [0, 1]) * interpolate(segmentTime, [framesPerPlayer - 0.4, framesPerPlayer], [1, 0])
  const playerY = interpolate(segmentTime, [0, 0.5], [50, 0])
  const glowPulse = 0.6 + 0.4 * Math.sin(segmentTime * 2)
  
  return (
    <AbsoluteFill style={{ backgroundColor: DESIGN.colors.bg }}>
      <AbsoluteFill>
        <img src={ASSETS.stadium} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})`, filter: 'brightness(0.25) blur(2px)' }} />
      </AbsoluteFill>
      
      <SmokeOverlay intensity={0.7} time={time} />
      
      {/* Player */}
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', opacity }}>
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
            filter: `drop-shadow(0 0 ${60 * glowPulse}px ${DESIGN.colors.green})`,
            willChange: 'transform, filter',
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
      
      {/* Player name - glow only, no drop shadow */}
      <AbsoluteFill style={{ padding: 24, paddingBottom: '14%', justifyContent: 'flex-end', opacity }}>
        <div style={{ 
          fontFamily: DESIGN.fonts.hero, 
          fontWeight: 900, 
          fontSize: 'clamp(40px, 14vw, 72px)', 
          lineHeight: 0.85, 
          color: DESIGN.colors.ink, 
          textShadow: `0 0 60px ${DESIGN.colors.green}`,
          letterSpacing: '0.02em',
        }}>
          {player.lastName}
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 14, alignItems: 'center' }}>
          <span style={{ 
            fontFamily: DESIGN.fonts.hero, 
            fontWeight: 900, 
            fontSize: 'clamp(24px, 8vw, 40px)', 
            color: DESIGN.colors.green, 
            textShadow: `0 0 30px ${DESIGN.colors.green}`,
          }}>
            #{player.jersey}
          </span>
          <span style={{ 
            fontFamily: DESIGN.fonts.title, 
            fontWeight: 500, 
            fontSize: 'clamp(16px, 5vw, 24px)', 
            color: 'rgba(255,255,255,0.7)', 
            letterSpacing: '0.15em',
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
  const textScale = 0.9 + 0.12 * interpolate(localTime, [0.8, 1.5], [0, 1])
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
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '16%' }}>
        <div style={{ textAlign: 'center', transform: `scale(${textScale})` }}>
          <div style={{ 
            fontFamily: DESIGN.fonts.hero, 
            fontWeight: 900, 
            fontSize: 'clamp(40px, 14vw, 80px)', 
            color: DESIGN.colors.ink, 
            letterSpacing: '0.02em',
            textShadow: `0 0 ${60 + 40 * pulse}px ${DESIGN.colors.green}`,
          }}>
            ENTER NOW
          </div>
          
          <div
            style={{
              marginTop: 20,
              display: 'inline-flex',
              padding: '16px 36px',
              borderRadius: 100,
              background: `linear-gradient(135deg, ${DESIGN.colors.green} 0%, #5CBF3A 100%)`,
              boxShadow: `0 0 ${40 + 25 * pulse}px ${DESIGN.colors.green}`,
            }}
          >
            <span style={{ 
              fontFamily: DESIGN.fonts.hero, 
              fontWeight: 900, 
              fontSize: 'clamp(18px, 5vw, 26px)', 
              color: DESIGN.colors.navy, 
              letterSpacing: '0.03em',
            }}>
              game.drinksip.com
            </span>
          </div>
          
          <div style={{ 
            marginTop: 14, 
            fontFamily: DESIGN.fonts.title, 
            fontWeight: 500, 
            fontSize: 'clamp(12px, 3.5vw, 16px)', 
            color: 'rgba(255,255,255,0.6)', 
            letterSpacing: '0.15em',
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
