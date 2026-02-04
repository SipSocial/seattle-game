'use client'

/**
 * DARK SIDE FOOTBALL — SPLASH ANIMATION v2
 * 
 * BUTTERY SMOOTH • PIXEL PERFECT • ACCESSIBLE
 * 
 * Key improvements:
 * - Dark text shadows for readability over any background
 * - Simplified animation math for smooth 60fps
 * - Proper z-indexing and layering
 * - Larger, more accessible typography
 * - Fixed phone/text positioning relationships
 */

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useAnimationFrame } from 'framer-motion'
import { Volume2, VolumeX, ChevronRight } from 'lucide-react'

// ============================================================================
// DESIGN TOKENS
// ============================================================================
const COLORS = {
  navy: '#002244',
  green: '#69BE28',
  gold: '#FFD700',
  white: '#FFFFFF',
  black: '#000000',
}

// Text shadow for READABILITY (dark shadow + optional glow)
const TEXT_SHADOW = {
  // Primary readable shadow - ALWAYS use this
  readable: '0 2px 4px rgba(0,0,0,0.9), 0 4px 12px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.5)',
  // With green glow
  glowGreen: `0 2px 4px rgba(0,0,0,0.9), 0 4px 12px rgba(0,0,0,0.7), 0 0 40px ${COLORS.green}50`,
  // With gold glow
  glowGold: `0 2px 4px rgba(0,0,0,0.9), 0 4px 12px rgba(0,0,0,0.7), 0 0 40px ${COLORS.gold}50`,
  // Subtle for small text
  subtle: '0 1px 3px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.5)',
}

const FONTS = {
  hero: 'var(--font-bebas, "Bebas Neue"), var(--font-oswald, "Oswald"), "Arial Black", sans-serif',
  title: 'var(--font-oswald, "Oswald"), "Arial Black", sans-serif',
  body: '"Inter", "Helvetica Neue", Arial, sans-serif',
}

// DrinkSip logo
const DRINKSIP_LOGO = 'https://cdn.shopify.com/s/files/1/0407/8580/5468/files/DrinkSip_Logo_SVG.svg?v=1759624477'

// Assets
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
// TIMING - Simplified scene structure
// ============================================================================
const TOTAL_DURATION = 28 // Shorter, punchier
const SCENES = {
  intro: { start: 0, end: 5 },
  mapFlight: { start: 5, end: 7.5 },
  gameHub: { start: 7.5, end: 10 },
  picks: { start: 10, end: 12 },
  live: { start: 12, end: 14 },
  scanWin: { start: 14, end: 16 },
  features: { start: 16, end: 18 },
  giveaway: { start: 18, end: 20 },
  players: { start: 20, end: 25 },
  cta: { start: 25, end: 28 },
}

// ============================================================================
// ANIMATION HOOK - Simplified for smooth 60fps
// ============================================================================
function useAnimationTime(isPlaying: boolean) {
  const [time, setTime] = useState(0)
  const startRef = useRef<number | null>(null)
  
  useAnimationFrame((t) => {
    if (!isPlaying) {
      startRef.current = null
      return
    }
    if (startRef.current === null) startRef.current = t
    const elapsed = (t - startRef.current) / 1000
    setTime(Math.min(elapsed, TOTAL_DURATION))
  })
  
  return time
}

// ============================================================================
// UTILITIES - Smooth easing functions
// ============================================================================
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t))
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t)
}

// ============================================================================
// PRIMITIVES
// ============================================================================
function AbsoluteFill({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', ...style }}>
      {children}
    </div>
  )
}

function PhoneMockup({ screen, scale = 1.2 }: { screen: string; scale?: number }) {
  return (
    <div
      style={{
        position: 'relative',
        width: 220 * scale,
        height: 460 * scale,
        borderRadius: 32 * scale,
        background: 'linear-gradient(145deg, #0a1628, #0a0a1a)',
        border: '2px solid rgba(105,190,40,0.4)',
        boxShadow: `
          0 0 0 1px rgba(255,255,255,0.05),
          0 20px 60px rgba(0,0,0,0.8),
          0 0 80px rgba(105,190,40,0.3)
        `,
        overflow: 'hidden',
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
        <img src={screen} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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

function DarkOverlay({ intensity = 0.7 }: { intensity?: number }) {
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* Top gradient - stronger for text readability */}
      <div 
        style={{ 
          position: 'absolute', 
          inset: 0,
          background: `linear-gradient(180deg, 
            rgba(0,0,0,${0.8 * intensity}) 0%, 
            rgba(0,0,0,${0.3 * intensity}) 25%,
            transparent 50%,
            rgba(0,0,0,${0.3 * intensity}) 75%,
            rgba(0,0,0,${0.9 * intensity}) 100%
          )`,
        }} 
      />
      {/* Vignette */}
      <div 
        style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
        }} 
      />
    </AbsoluteFill>
  )
}

// ============================================================================
// SCENE 1: INTRO
// ============================================================================
function SceneIntro({ time }: { time: number }) {
  // Phase 1: DrinkSip logo (0-2.5s)
  const logoProgress = smoothstep(Math.min(time / 0.8, 1))
  const logoFadeOut = time > 2 ? smoothstep((time - 2) / 0.5) : 0
  const logoOpacity = logoProgress * (1 - logoFadeOut)
  const presentsOpacity = time > 0.8 ? smoothstep((time - 0.8) / 0.6) * (1 - logoFadeOut) : 0
  
  // Phase 2: Dark Side title (2.5-5s)
  const titleProgress = time > 2.5 ? smoothstep((time - 2.5) / 0.8) : 0
  const subtitleProgress = time > 3.2 ? smoothstep((time - 3.2) / 0.6) : 0
  const taglineProgress = time > 3.8 ? smoothstep((time - 3.8) / 0.6) : 0
  
  return (
    <AbsoluteFill style={{ background: COLORS.navy }}>
      {/* Stadium bg - very dark */}
      <AbsoluteFill>
        <img 
          src={ASSETS.stadium} 
          alt="" 
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.15) saturate(0.8)' }} 
        />
      </AbsoluteFill>
      
      <DarkOverlay intensity={0.6} />
      
      {/* Phase 1: DrinkSip */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: logoOpacity }}>
        <div style={{ textAlign: 'center', transform: `scale(${0.9 + 0.1 * logoProgress})` }}>
          <img
            src={DRINKSIP_LOGO}
            alt="DrinkSip"
            style={{ 
              height: 'clamp(56px, 14vw, 80px)', 
              width: 'auto',
              filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.5))',
            }}
          />
          <div
            style={{
              marginTop: 16,
              fontFamily: FONTS.title,
              fontWeight: 600,
              fontSize: 'clamp(14px, 4vw, 20px)',
              letterSpacing: '0.25em',
              color: COLORS.gold,
              textShadow: TEXT_SHADOW.subtle,
              textTransform: 'uppercase',
              opacity: presentsOpacity,
            }}
          >
            PRESENTS
          </div>
        </div>
      </AbsoluteFill>
      
      {/* Phase 2: Dark Side */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: titleProgress }}>
        <div style={{ textAlign: 'center', transform: `scale(${0.85 + 0.15 * titleProgress})` }}>
          <h1
            style={{
              fontFamily: FONTS.hero,
              fontWeight: 400,
              fontSize: 'clamp(64px, 20vw, 120px)',
              lineHeight: 0.9,
              letterSpacing: '-0.02em',
              color: COLORS.white,
              textShadow: TEXT_SHADOW.glowGreen,
              margin: 0,
            }}
          >
            DARK SIDE
          </h1>
          <div
            style={{
              marginTop: 8,
              fontFamily: FONTS.title,
              fontWeight: 500,
              fontSize: 'clamp(14px, 4vw, 22px)',
              letterSpacing: '0.2em',
              color: 'rgba(255,255,255,0.7)',
              textShadow: TEXT_SHADOW.subtle,
              textTransform: 'uppercase',
              opacity: subtitleProgress,
            }}
          >
            THE FOOTBALL GAME
          </div>
          <div
            style={{
              marginTop: 12,
              fontFamily: FONTS.title,
              fontWeight: 600,
              fontSize: 'clamp(12px, 3vw, 16px)',
              letterSpacing: '0.15em',
              color: COLORS.green,
              textShadow: TEXT_SHADOW.glowGreen,
              textTransform: 'uppercase',
              opacity: taglineProgress,
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
  const progress = easeInOutCubic(Math.min(localTime / duration, 1))
  
  // Plane ascends from center to top
  const planeY = 50 - 150 * progress // % from center
  const planeScale = 1 - 0.4 * progress
  const planeRotate = 5 - 15 * progress
  
  const textOpacity = smoothstep(Math.min(localTime / 0.8, 1))
  
  return (
    <AbsoluteFill style={{ background: COLORS.navy }}>
      <AbsoluteFill>
        <img 
          src={ASSETS.usMap} 
          alt="" 
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.5) contrast(1.1)' }} 
        />
      </AbsoluteFill>
      
      <DarkOverlay intensity={0.5} />
      
      {/* Plane */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <img
          src={ASSETS.plane}
          alt=""
          style={{
            width: 'clamp(180px, 45vw, 300px)',
            height: 'auto',
            transform: `translateY(${planeY}%) scale(${planeScale}) rotate(${planeRotate}deg)`,
            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6))',
          }}
        />
      </AbsoluteFill>
      
      {/* Text - BOTTOM with readable shadows */}
      <AbsoluteFill 
        style={{ 
          justifyContent: 'flex-end', 
          alignItems: 'center', 
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 15%)',
          opacity: textOpacity,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontFamily: FONTS.title, 
            fontWeight: 600, 
            fontSize: 'clamp(14px, 4vw, 20px)', 
            letterSpacing: '0.2em', 
            color: 'rgba(255,255,255,0.8)',
            textShadow: TEXT_SHADOW.readable,
            textTransform: 'uppercase',
          }}>
            ROAD TO
          </div>
          <div style={{ 
            fontFamily: FONTS.hero, 
            fontWeight: 400, 
            fontSize: 'clamp(36px, 12vw, 60px)', 
            letterSpacing: '-0.01em', 
            color: COLORS.gold, 
            textShadow: TEXT_SHADOW.glowGold,
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
// SCENE 3-6: PHONE SHOWCASE SCENES
// ============================================================================
function PhoneScene({ 
  time, 
  sceneStart, 
  screen, 
  title, 
  subtitle, 
  titleColor = COLORS.white,
  subtitleColor = COLORS.green,
  textPosition = 'bottom',
}: { 
  time: number
  sceneStart: number
  screen: string
  title: string
  subtitle: string
  titleColor?: string
  subtitleColor?: string
  textPosition?: 'top' | 'bottom'
}) {
  const localTime = time - sceneStart
  const phoneProgress = easeOutCubic(Math.min(localTime / 0.6, 1))
  const textProgress = smoothstep(Math.max(0, Math.min((localTime - 0.4) / 0.5, 1)))
  
  const phoneY = 30 * (1 - phoneProgress)
  const phoneScale = 0.9 + 0.1 * phoneProgress
  
  return (
    <AbsoluteFill style={{ background: COLORS.navy }}>
      <AbsoluteFill>
        <img 
          src={ASSETS.stadium} 
          alt="" 
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.25)' }} 
        />
      </AbsoluteFill>
      
      <DarkOverlay intensity={0.6} />
      
      {/* Phone - centered */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ 
          transform: `translateY(${phoneY}px) scale(${phoneScale})`,
          opacity: phoneProgress,
        }}>
          <PhoneMockup screen={screen} scale={1.15} />
        </div>
      </AbsoluteFill>
      
      {/* Text */}
      <AbsoluteFill 
        style={{ 
          justifyContent: textPosition === 'top' ? 'flex-start' : 'flex-end', 
          alignItems: 'center',
          padding: 24,
          paddingTop: textPosition === 'top' ? 'calc(env(safe-area-inset-top, 0px) + 10%)' : 24,
          paddingBottom: textPosition === 'bottom' ? 'calc(env(safe-area-inset-bottom, 0px) + 12%)' : 24,
          opacity: textProgress,
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 340 }}>
          <h2 style={{ 
            fontFamily: FONTS.hero, 
            fontWeight: 400, 
            fontSize: 'clamp(32px, 11vw, 52px)', 
            color: titleColor, 
            letterSpacing: '-0.01em', 
            textShadow: TEXT_SHADOW.glowGreen,
            margin: 0,
            lineHeight: 1,
          }}>
            {title}
          </h2>
          <p style={{ 
            marginTop: 8, 
            fontFamily: FONTS.title, 
            fontWeight: 500, 
            fontSize: 'clamp(11px, 3vw, 14px)', 
            color: subtitleColor, 
            letterSpacing: '0.15em',
            textShadow: TEXT_SHADOW.subtle,
            textTransform: 'uppercase',
          }}>
            {subtitle}
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

function SceneGameHub({ time }: { time: number }) {
  return (
    <PhoneScene
      time={time}
      sceneStart={SCENES.gameHub.start}
      screen={SCREENS.gameHub}
      title="PLAY THE GAME"
      subtitle="Earn entries from home"
      titleColor={COLORS.green}
      textPosition="top"
    />
  )
}

function ScenePicks({ time }: { time: number }) {
  return (
    <PhoneScene
      time={time}
      sceneStart={SCENES.picks.start}
      screen={SCREENS.picksHub}
      title="PROP PICKS"
      subtitle="25 props • Win a signed jersey"
      textPosition="bottom"
    />
  )
}

function SceneLive({ time }: { time: number }) {
  const localTime = time - SCENES.live.start
  const badgeOpacity = smoothstep(Math.min(localTime / 0.6, 1))
  const pulse = 0.6 + 0.4 * Math.sin(time * 3)
  
  return (
    <AbsoluteFill style={{ background: COLORS.navy }}>
      <AbsoluteFill>
        <img 
          src={ASSETS.stadium} 
          alt="" 
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.25)' }} 
        />
      </AbsoluteFill>
      
      <DarkOverlay intensity={0.6} />
      
      {/* Phone */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ 
          transform: `scale(${0.9 + 0.1 * badgeOpacity})`,
          opacity: badgeOpacity,
        }}>
          <PhoneMockup screen={SCREENS.live} scale={1.15} />
        </div>
      </AbsoluteFill>
      
      {/* LIVE badge - TOP */}
      <AbsoluteFill 
        style={{ 
          padding: 24, 
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 10%)',
          justifyContent: 'flex-start', 
          alignItems: 'center',
          opacity: badgeOpacity,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 18px',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(12px)',
            borderRadius: 100,
            border: '1px solid rgba(255,68,68,0.4)',
          }}
        >
          <div style={{ 
            width: 10, 
            height: 10, 
            borderRadius: '50%', 
            background: '#FF4444', 
            boxShadow: `0 0 ${10 + 8 * pulse}px #FF4444`,
          }} />
          <span style={{ 
            fontFamily: FONTS.title, 
            fontWeight: 600, 
            fontSize: 13, 
            color: '#FF6666', 
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            textShadow: TEXT_SHADOW.subtle,
          }}>
            LIVE GAMEDAY
          </span>
        </div>
      </AbsoluteFill>
      
      {/* Text - BOTTOM */}
      <AbsoluteFill 
        style={{ 
          padding: 24, 
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12%)',
          justifyContent: 'flex-end', 
          alignItems: 'center',
          opacity: badgeOpacity,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ 
            fontFamily: FONTS.hero, 
            fontWeight: 400, 
            fontSize: 'clamp(32px, 11vw, 52px)', 
            color: COLORS.white, 
            textShadow: TEXT_SHADOW.glowGreen,
            margin: 0,
          }}>
            PREDICT PLAYS
          </h2>
          <p style={{ 
            marginTop: 8, 
            fontFamily: FONTS.title, 
            fontWeight: 500, 
            fontSize: 'clamp(11px, 3vw, 14px)', 
            color: COLORS.green, 
            letterSpacing: '0.15em',
            textShadow: TEXT_SHADOW.subtle,
            textTransform: 'uppercase',
          }}>
            Answer fast • Earn bonus entries
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

function SceneScanWin({ time }: { time: number }) {
  return (
    <PhoneScene
      time={time}
      sceneStart={SCENES.scanWin.start}
      screen={SCREENS.scratchCard}
      title="SCAN & WIN"
      subtitle="Daily prizes • Bonus entries"
      titleColor={COLORS.gold}
      subtitleColor="rgba(255,255,255,0.7)"
      textPosition="top"
    />
  )
}

// ============================================================================
// SCENE 7: FEATURES (Two phones)
// ============================================================================
function SceneFeatures({ time }: { time: number }) {
  const localTime = time - SCENES.features.start
  const phone1Progress = easeOutCubic(Math.min(localTime / 0.6, 1))
  const phone2Progress = easeOutCubic(Math.max(0, Math.min((localTime - 0.2) / 0.6, 1)))
  const textProgress = smoothstep(Math.max(0, Math.min((localTime - 0.5) / 0.5, 1)))
  
  return (
    <AbsoluteFill style={{ background: COLORS.navy }}>
      <AbsoluteFill>
        <img 
          src={ASSETS.stadium} 
          alt="" 
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.25)' }} 
        />
      </AbsoluteFill>
      
      <DarkOverlay intensity={0.6} />
      
      {/* Two phones */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ 
            transform: `translateX(${-20 + 20 * phone1Progress}px) rotate(-4deg)`, 
            opacity: phone1Progress,
          }}>
            <PhoneMockup screen={SCREENS.leaderboard} scale={0.75} />
          </div>
          <div style={{ 
            transform: `translateX(${20 - 20 * phone2Progress}px) rotate(4deg)`, 
            opacity: phone2Progress,
          }}>
            <PhoneMockup screen={SCREENS.profile} scale={0.75} />
          </div>
        </div>
      </AbsoluteFill>
      
      {/* Text - BOTTOM */}
      <AbsoluteFill 
        style={{ 
          padding: 24, 
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12%)',
          justifyContent: 'flex-end', 
          alignItems: 'center',
          opacity: textProgress,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ 
            fontFamily: FONTS.hero, 
            fontWeight: 400, 
            fontSize: 'clamp(28px, 9vw, 44px)', 
            color: COLORS.green, 
            textShadow: TEXT_SHADOW.glowGreen,
            margin: 0,
          }}>
            COMPETE & CLIMB
          </h2>
          <p style={{ 
            marginTop: 8, 
            fontFamily: FONTS.title, 
            fontWeight: 500, 
            fontSize: 'clamp(11px, 3vw, 14px)', 
            color: 'rgba(255,255,255,0.7)', 
            letterSpacing: '0.15em',
            textShadow: TEXT_SHADOW.subtle,
            textTransform: 'uppercase',
          }}>
            Track your entries • Climb the ranks
          </p>
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
  const contentProgress = easeOutCubic(Math.min(localTime / 0.8, 1))
  const sweepX = -200 + 400 * (localTime / 2)
  
  return (
    <AbsoluteFill style={{ background: COLORS.navy }}>
      <AbsoluteFill>
        <img 
          src={ASSETS.sanFrancisco} 
          alt="" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover', 
            filter: 'brightness(0.4) contrast(1.1)',
            transform: `scale(${1.1 - 0.1 * contentProgress})`,
          }} 
        />
      </AbsoluteFill>
      
      <DarkOverlay intensity={0.5} />
      
      {/* Content */}
      <AbsoluteFill 
        style={{ 
          justifyContent: 'center', 
          alignItems: 'center', 
          opacity: contentProgress,
        }}
      >
        <div style={{ textAlign: 'center', transform: `scale(${0.9 + 0.1 * contentProgress})` }}>
          <h2 style={{ 
            fontFamily: FONTS.hero, 
            fontWeight: 400, 
            fontSize: 'clamp(56px, 18vw, 90px)', 
            color: COLORS.white, 
            textShadow: TEXT_SHADOW.glowGold,
            margin: 0,
          }}>
            WIN
          </h2>
          
          {/* Ticket card */}
          <div
            style={{
              position: 'relative',
              width: 'clamp(260px, 75vw, 380px)',
              padding: '24px 32px',
              marginTop: 16,
              background: `linear-gradient(135deg, ${COLORS.gold} 0%, #C4960E 100%)`,
              borderRadius: 16,
              boxShadow: `0 0 60px rgba(255,215,0,0.4), 0 20px 40px rgba(0,0,0,0.3)`,
              transform: 'rotate(-1deg)',
              overflow: 'hidden',
            }}
          >
            {/* Shine */}
            <div
              style={{
                position: 'absolute',
                inset: -60,
                transform: `translateX(${sweepX}px) rotate(15deg)`,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                width: 100,
              }}
            />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ 
                fontFamily: FONTS.title, 
                fontWeight: 600, 
                fontSize: 11, 
                letterSpacing: '0.25em', 
                color: COLORS.navy,
                textTransform: 'uppercase',
              }}>
                THE BIG GAME GIVEAWAY
              </div>
              <div style={{ 
                fontFamily: FONTS.hero, 
                fontWeight: 400, 
                fontSize: 'clamp(32px, 10vw, 48px)', 
                color: COLORS.navy, 
                lineHeight: 1.1,
                marginTop: 4,
              }}>
                2 TICKETS
              </div>
              <div style={{ 
                marginTop: 8, 
                fontFamily: FONTS.body, 
                fontWeight: 600, 
                fontSize: 11, 
                color: 'rgba(0,34,68,0.7)',
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
// SCENE 9: PLAYERS - Simplified for buttery smooth transitions
// ============================================================================
function ScenePlayerShowcase({ time }: { time: number }) {
  const localTime = time - SCENES.players.start
  const duration = SCENES.players.end - SCENES.players.start
  const playerDuration = duration / HERO_PLAYERS.length
  
  // Current player index
  const playerIndex = Math.min(Math.floor(localTime / playerDuration), HERO_PLAYERS.length - 1)
  const player = HERO_PLAYERS[playerIndex]
  
  // Time within current player
  const segmentTime = localTime - playerIndex * playerDuration
  
  // Simple crossfade - no complex math
  const fadeIn = easeOutCubic(Math.min(segmentTime / 0.5, 1))
  const fadeOut = segmentTime > playerDuration - 0.4 
    ? 1 - easeOutCubic((segmentTime - (playerDuration - 0.4)) / 0.4) 
    : 1
  const opacity = fadeIn * fadeOut
  
  const slideUp = 30 * (1 - fadeIn)
  
  return (
    <AbsoluteFill style={{ background: COLORS.navy }}>
      <AbsoluteFill>
        <img 
          src={ASSETS.stadium} 
          alt="" 
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.2) blur(2px)' }} 
        />
      </AbsoluteFill>
      
      <DarkOverlay intensity={0.5} />
      
      {/* Player image */}
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center' }}>
        <img
          key={player.id}
          src={player.image}
          alt={player.lastName}
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '70%',
            objectFit: 'contain',
            objectPosition: 'bottom center',
            opacity,
            transform: `translateY(${slideUp}px)`,
            filter: `drop-shadow(0 0 40px ${COLORS.green}60)`,
          }}
        />
      </AbsoluteFill>
      
      {/* Player name - BOTTOM LEFT */}
      <AbsoluteFill 
        style={{ 
          padding: 24, 
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12%)',
          justifyContent: 'flex-end', 
          alignItems: 'flex-start',
          opacity,
        }}
      >
        <div>
          <h2 style={{ 
            fontFamily: FONTS.hero, 
            fontWeight: 400, 
            fontSize: 'clamp(44px, 15vw, 72px)', 
            lineHeight: 0.9, 
            color: COLORS.white, 
            textShadow: TEXT_SHADOW.glowGreen,
            margin: 0,
          }}>
            {player.lastName}
          </h2>
          <div style={{ marginTop: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ 
              fontFamily: FONTS.hero, 
              fontWeight: 400, 
              fontSize: 'clamp(28px, 9vw, 44px)', 
              color: COLORS.green, 
              textShadow: TEXT_SHADOW.glowGreen,
            }}>
              #{player.jersey}
            </span>
            <span style={{ 
              fontFamily: FONTS.title, 
              fontWeight: 500, 
              fontSize: 'clamp(16px, 5vw, 22px)', 
              color: 'rgba(255,255,255,0.7)', 
              letterSpacing: '0.15em',
              textShadow: TEXT_SHADOW.subtle,
              textTransform: 'uppercase',
            }}>
              {player.position}
            </span>
          </div>
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
  const progress = easeInOutCubic(Math.min(localTime / duration, 1))
  
  // Plane descends into frame
  const planeY = -300 + 450 * progress
  const planeScale = 0.4 + 0.6 * progress
  const planeRotate = -12 + 15 * progress
  
  const textOpacity = smoothstep(Math.max(0, Math.min((localTime - 0.5) / 0.6, 1)))
  const pulse = 0.7 + 0.3 * Math.sin(time * 2.5)
  
  return (
    <AbsoluteFill style={{ background: COLORS.navy }}>
      <AbsoluteFill>
        <img 
          src={ASSETS.seattle} 
          alt="" 
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.35)' }} 
        />
      </AbsoluteFill>
      
      <DarkOverlay intensity={0.6} />
      
      {/* Plane */}
      <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: '10%' }}>
        <img
          src={ASSETS.plane}
          alt=""
          style={{
            width: 'clamp(160px, 40vw, 260px)',
            height: 'auto',
            transform: `translateY(${planeY}px) scale(${planeScale}) rotate(${planeRotate}deg)`,
            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))',
          }}
        />
      </AbsoluteFill>
      
      {/* CTA */}
      <AbsoluteFill 
        style={{ 
          justifyContent: 'flex-end', 
          alignItems: 'center', 
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 14%)',
          padding: 24,
          opacity: textOpacity,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ 
            fontFamily: FONTS.hero, 
            fontWeight: 400, 
            fontSize: 'clamp(48px, 16vw, 80px)', 
            color: COLORS.white, 
            textShadow: TEXT_SHADOW.glowGreen,
            margin: 0,
          }}>
            ENTER NOW
          </h2>
          
          {/* CTA Button */}
          <div
            style={{
              marginTop: 24,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 56,
              paddingLeft: 36,
              paddingRight: 36,
              borderRadius: 100,
              background: `linear-gradient(135deg, ${COLORS.green} 0%, #5CBF3A 100%)`,
              boxShadow: `0 0 ${25 + 15 * pulse}px ${COLORS.green}`,
            }}
          >
            <span style={{ 
              fontFamily: FONTS.hero, 
              fontWeight: 400, 
              fontSize: 'clamp(20px, 6vw, 28px)', 
              color: COLORS.navy, 
              letterSpacing: '-0.01em',
            }}>
              game.drinksip.com
            </span>
          </div>
          
          <p style={{ 
            marginTop: 16, 
            fontFamily: FONTS.title, 
            fontWeight: 500, 
            fontSize: 12, 
            color: 'rgba(255,255,255,0.6)', 
            letterSpacing: '0.15em',
            textShadow: TEXT_SHADOW.subtle,
            textTransform: 'uppercase',
          }}>
            Drawing Saturday • San Francisco
          </p>
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
  
  // Show skip after 2s
  useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), 2000)
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
        audioRef.current.currentTime = time + 10
        audioRef.current.play().catch(() => {})
      }
    }
  }, [muted, isPlaying])
  
  // Scene router
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
        background: COLORS.navy,
        overflow: 'hidden',
      }}
    >
      {/* Audio */}
      <audio ref={audioRef} src="/audio/music/land-of-the-12s.mp4" loop={false} preload="auto" />
      
      {/* Current scene */}
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
          zIndex: 100,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${(time / TOTAL_DURATION) * 100}%`,
            background: COLORS.green,
            transition: 'width 0.1s linear',
          }}
        />
      </div>
      
      {/* Controls */}
      <div
        style={{
          position: 'absolute',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
          right: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          zIndex: 100,
        }}
      >
        {/* Mute toggle */}
        <motion.button
          onClick={onMuteToggle}
          whileTap={{ scale: 0.95 }}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: muted ? 'rgba(255,255,255,0.5)' : COLORS.green,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </motion.button>
        
        {/* Skip */}
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
                height: 40,
                paddingLeft: 16,
                paddingRight: 12,
                borderRadius: 100,
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.9)',
                fontSize: 12,
                fontFamily: FONTS.title,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
              }}
            >
              Skip
              <ChevronRight size={16} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
