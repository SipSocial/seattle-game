/**
 * DARK SIDE FOOTBALL — SPLASH TRAILER V4
 * 
 * PREMIUM HOLLYWOOD × EPIC GAMES QUALITY TRAILER
 * 
 * KEY IMPROVEMENTS:
 * - Design system consistent (Oswald/Bebas fonts, proper colors)
 * - DrinkSip intro HOLDS MUCH LONGER (5s)
 * - Premium transitions and timing
 * - New hype music bed + proper SFX sync
 * - VO integration throughout
 * 
 * Resolution: 1080x1920 (9:16 vertical mobile)
 * Duration: 30 seconds @ 30fps = 900 frames
 */
import React from 'react';
import { 
  AbsoluteFill, 
  Sequence, 
  Audio,
  staticFile,
  useCurrentFrame, 
  useVideoConfig,
  interpolate, 
  spring,
  Img,
  Easing,
} from 'remotion';
import { 
  PLAYERS_TRANSPARENT,
  CAMPAIGN,
  DRINKSIP,
} from './assets';

// ============================================================================
// DESIGN SYSTEM - Matching app's premium styling
// ============================================================================
const DESIGN = {
  colors: {
    navy: '#002244',      // Primary background
    green: '#69BE28',     // Accent/CTA
    gold: '#FFD700',      // Premium highlights
    ink: '#F8F9FC',       // Primary text
    inkDim: 'rgba(248,249,252,0.6)', // Secondary text
    grey: '#A5ACAF',      // Muted
    bg: '#020408',        // Deep black
  },
  // For Remotion we use web-safe fallbacks since custom fonts may not load
  fonts: {
    hero: '"Bebas Neue", "Oswald", "Impact", "Arial Black", sans-serif',
    title: '"Oswald", "Arial Black", "Helvetica Neue", sans-serif',
    body: '"Inter", "Helvetica Neue", Arial, sans-serif',
  },
};

// ============================================================================
// LEONARDO AI ASSETS
// ============================================================================
const ASSETS = {
  stadium: CAMPAIGN.stadiumImage,
  sanFrancisco: CAMPAIGN.sanFranciscoImage,
  seattle: CAMPAIGN.seattleImage,
  usMap: CAMPAIGN.mapImage,
  plane: CAMPAIGN.planeImage,
};

// App screenshots
const SCREENS = {
  gameHub: staticFile('screens/game-hub.png'),
  picksHub: staticFile('screens/picks-hub.png'),
  live: staticFile('screens/live.png'),
  leaderboard: staticFile('screens/leaderboard.png'),
  profile: staticFile('screens/profile.png'),
  scratchCard: staticFile('screens/scratch-card.png'),
};

// Superhero player assets
const HERO_PLAYERS = [
  {
    id: 'lawrence',
    name: 'DEMARCUS LAWRENCE',
    firstName: 'DEMARCUS',
    lastName: 'LAWRENCE',
    jersey: 0,
    position: 'DE',
    image: staticFile('sprites/players/defense-0-demarcus-lawrence.png'),
  },
  {
    id: 'williams',
    name: 'LEONARD WILLIAMS',
    firstName: 'LEONARD',
    lastName: 'WILLIAMS',
    jersey: 99,
    position: 'DT',
    image: staticFile('sprites/players/defense-99-leonard-williams.png'),
  },
  {
    id: 'murphy',
    name: 'BYRON MURPHY II',
    firstName: 'BYRON',
    lastName: 'MURPHY II',
    jersey: 91,
    position: 'NT',
    image: staticFile('sprites/players/defense-91-byron-murphy-ii.png'),
  },
  {
    id: 'emmanwori',
    name: 'NICK EMMANWORI',
    firstName: 'NICK',
    lastName: 'EMMANWORI',
    jersey: 3,
    position: 'S',
    image: staticFile('sprites/players/defense-3-nick-emmanwori.png'),
  },
];

const FPS = 30;

// ============================================================================
// TIMING - 30 seconds @ 30fps = 900 frames
// BETTER PACING - DrinkSip holds MUCH longer
// ============================================================================
const SCENES = {
  // 0-5s: DrinkSip Presents (HOLDS LONG) + DARK SIDE title
  intro: { start: 0, end: 5 * FPS },
  
  // 5-7s: Plane over US map to SF
  mapFlight: { start: 5 * FPS, end: 7 * FPS },
  
  // 7-9s: Game Hub reveal
  gameHub: { start: 7 * FPS, end: 9 * FPS },
  
  // 9-11s: Prop Picks
  picks: { start: 9 * FPS, end: 11 * FPS },
  
  // 11-13s: Live questions
  live: { start: 11 * FPS, end: 13 * FPS },
  
  // 13-15s: Scan & Win
  scanWin: { start: 13 * FPS, end: 15 * FPS },
  
  // 15-17s: Leaderboard + Profile
  features: { start: 15 * FPS, end: 17 * FPS },
  
  // 17-19s: Big Game Giveaway
  giveaway: { start: 17 * FPS, end: 19 * FPS },
  
  // 19-26s: Player showcase (4 players)
  players: { start: 19 * FPS, end: 26 * FPS },
  
  // 26-30s: Final CTA
  cta: { start: 26 * FPS, end: 30 * FPS },
};

// ============================================================================
// UTILITIES
// ============================================================================
const hexToRgba = (hex: string, a: number) => {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${a})`;
};

// ============================================================================
// PREMIUM PHONE MOCKUP
// ============================================================================
const PhoneMockup: React.FC<{
  screen: string;
  scale?: number;
  tilt?: number;
  glowColor?: string;
}> = ({ screen, scale = 1.4, tilt = 0, glowColor = DESIGN.colors.green }) => {
  return (
    <div
      style={{
        position: 'relative',
        width: 320 * scale,
        height: 660 * scale,
        borderRadius: 44 * scale,
        background: `linear-gradient(145deg, ${DESIGN.colors.navy}, #0a0a1e)`,
        border: `3px solid rgba(105,190,40,0.3)`,
        boxShadow: `
          0 60px 120px rgba(0,0,0,0.6),
          0 0 100px ${hexToRgba(glowColor, 0.4)},
          inset 0 0 0 1px rgba(255,255,255,0.08)
        `,
        overflow: 'hidden',
        transform: `perspective(1200px) rotateY(${tilt}deg)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 6 * scale,
          borderRadius: 38 * scale,
          overflow: 'hidden',
          background: '#000',
        }}
      >
        <Img
          src={screen}
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
          top: 12 * scale,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 90 * scale,
          height: 28 * scale,
          borderRadius: 14 * scale,
          background: '#000',
        }}
      />
    </div>
  );
};

// ============================================================================
// PREMIUM SMOKE OVERLAY
// ============================================================================
const SmokeOverlay: React.FC<{ intensity?: number }> = ({ intensity = 0.5 }) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame * 0.012) * 30;
  const pulse = 0.85 + 0.15 * Math.sin(frame * 0.04);
  
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* Bottom fog */}
      <div
        style={{
          position: 'absolute',
          inset: '-30%',
          background: `radial-gradient(ellipse 140% 60% at ${50 + drift * 0.5}% 100%, rgba(255,255,255,${0.1 * intensity * pulse}), transparent 50%)`,
          filter: 'blur(100px)',
        }}
      />
      {/* Green stadium glow */}
      <div
        style={{
          position: 'absolute',
          inset: '-20%',
          background: `radial-gradient(ellipse 100% 40% at ${50 - drift * 0.3}% 100%, rgba(105,190,40,${0.08 * intensity}), transparent 45%)`,
          filter: 'blur(120px)',
        }}
      />
      {/* Top atmosphere */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 80% 30% at 50% 0%, rgba(0,34,68,${0.3 * intensity}), transparent 40%)`,
          filter: 'blur(80px)',
        }}
      />
    </AbsoluteFill>
  );
};

// ============================================================================
// CINEMATIC VIGNETTE
// ============================================================================
const Vignette: React.FC = () => {
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.75) 100%)',
        }}
      />
      {/* Top gradient */}
      <div 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          height: 100, 
          background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)' 
        }} 
      />
      {/* Bottom gradient */}
      <div 
        style={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          height: 200, 
          background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, transparent 100%)' 
        }} 
      />
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 1: DRINKSIP PRESENTS (HOLDS LONG) + DARK SIDE
// 5 seconds total - proper pacing
// ============================================================================
const SceneIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const totalFrames = 5 * FPS; // 150 frames

  // Phase 1: DrinkSip logo fade in and HOLD (0-2.5s = 0-75 frames)
  const logoEnter = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 120, mass: 1 },
  });
  const logoOpacity = interpolate(
    frame, 
    [0, 15, 70, 85], 
    [0, 1, 1, 0], 
    { extrapolateRight: 'clamp' }
  );
  const presentsOpacity = interpolate(frame, [25, 45], [0, 1], { extrapolateRight: 'clamp' });

  // Phase 2: DARK SIDE title (2.5-5s = 75-150 frames)
  const titleFrame = Math.max(0, frame - 80);
  const titleEnter = spring({
    frame: titleFrame,
    fps,
    config: { damping: 16, stiffness: 200, mass: 0.8 },
  });
  const titleOpacity = interpolate(frame, [75, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  
  // Subtitle stagger
  const subtitleOpacity = interpolate(frame, [100, 115], [0, 1], { extrapolateRight: 'clamp' });
  const playFromHomeOpacity = interpolate(frame, [115, 130], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: DESIGN.colors.bg }}>
      {/* Stadium background - very subtle */}
      <AbsoluteFill>
        <Img
          src={ASSETS.stadium}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.15) blur(6px)',
          }}
        />
      </AbsoluteFill>
      
      <SmokeOverlay intensity={0.4} />
      <Vignette />

      {/* Phase 1: DrinkSip Presents - CENTERED AND HOLDING */}
      <AbsoluteFill 
        style={{ 
          justifyContent: 'center', 
          alignItems: 'center', 
          opacity: logoOpacity 
        }}
      >
        <div 
          style={{ 
            textAlign: 'center', 
            transform: `scale(${0.9 + 0.1 * logoEnter})` 
          }}
        >
          {/* DrinkSip Logo - BIGGER */}
          <Img
            src={DRINKSIP.logo}
            style={{
              height: 140,
              width: 'auto',
              filter: 'drop-shadow(0 20px 60px rgba(255,215,0,0.5))',
            }}
          />
          {/* PRESENTS text */}
          <div
            style={{
              marginTop: 32,
              fontFamily: DESIGN.fonts.title,
              fontWeight: 600,
              fontSize: 28,
              letterSpacing: '0.4em',
              color: DESIGN.colors.gold,
              opacity: presentsOpacity,
              textTransform: 'uppercase',
            }}
          >
            PRESENTS
          </div>
        </div>
      </AbsoluteFill>

      {/* Phase 2: DARK SIDE Title */}
      <AbsoluteFill 
        style={{ 
          justifyContent: 'center', 
          alignItems: 'center', 
          opacity: titleOpacity,
        }}
      >
        <div 
          style={{ 
            textAlign: 'center', 
            transform: `scale(${0.85 + 0.15 * titleEnter})` 
          }}
        >
          {/* Main title - DARK SIDE */}
          <div
            style={{
              fontFamily: DESIGN.fonts.hero,
              fontWeight: 900,
              fontSize: 150,
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
          
          {/* Subtitle - THE FOOTBALL GAME */}
          <div
            style={{
              marginTop: 24,
              fontFamily: DESIGN.fonts.title,
              fontWeight: 500,
              fontSize: 26,
              letterSpacing: '0.25em',
              color: DESIGN.colors.inkDim,
              opacity: subtitleOpacity,
            }}
          >
            THE FOOTBALL GAME
          </div>
          
          {/* PLAY FROM HOME */}
          <div
            style={{
              marginTop: 20,
              fontFamily: DESIGN.fonts.title,
              fontWeight: 700,
              fontSize: 24,
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
  );
};

// ============================================================================
// SCENE 2: PLANE FLIGHT OVER US MAP
// ============================================================================
const SceneMapFlight: React.FC = () => {
  const frame = useCurrentFrame();

  // Plane flies left to right (Seattle -> SF direction)
  const progress = interpolate(frame, [0, 60], [0, 1], { extrapolateRight: 'clamp' });
  const planeX = interpolate(progress, [0, 1], [-800, 500]);
  const planeY = interpolate(progress, [0, 1], [200, -100]);
  const planeScale = 0.9 + 0.2 * progress;
  
  const textOpacity = interpolate(frame, [15, 30], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: DESIGN.colors.bg }}>
      <AbsoluteFill>
        <Img
          src={ASSETS.usMap}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.45) contrast(1.1)',
          }}
        />
      </AbsoluteFill>

      <SmokeOverlay intensity={0.5} />

      {/* Plane flying */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Img
          src={ASSETS.plane}
          style={{
            width: 700,
            height: 'auto',
            transform: `translate(${planeX}px, ${planeY}px) scale(${planeScale}) rotate(-8deg)`,
            filter: 'drop-shadow(0 60px 100px rgba(0,0,0,0.7))',
          }}
        />
      </AbsoluteFill>

      <Vignette />

      {/* Text overlay */}
      <AbsoluteFill
        style={{
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: 200,
          opacity: textOpacity,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: DESIGN.fonts.title,
              fontWeight: 600,
              fontSize: 32,
              letterSpacing: '0.25em',
              color: DESIGN.colors.inkDim,
            }}
          >
            ROAD TO
          </div>
          <div
            style={{
              fontFamily: DESIGN.fonts.hero,
              fontWeight: 900,
              fontSize: 72,
              letterSpacing: '0.02em',
              color: DESIGN.colors.gold,
              textShadow: `0 0 80px ${DESIGN.colors.gold}`,
              marginTop: 8,
            }}
          >
            SAN FRANCISCO
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 3: GAME HUB
// ============================================================================
const SceneGameHub: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phoneEnter = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 180, mass: 0.7 },
  });
  const textOpacity = interpolate(frame, [12, 28], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: DESIGN.colors.bg }}>
      <AbsoluteFill>
        <Img
          src={ASSETS.stadium}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.25)',
          }}
        />
      </AbsoluteFill>

      <SmokeOverlay intensity={0.6} />
      <Vignette />

      {/* Phone mockup */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ 
          transform: `translateY(${80 - 80 * phoneEnter}px) scale(${0.85 + 0.2 * phoneEnter})` 
        }}>
          <PhoneMockup screen={SCREENS.gameHub} scale={1.5} />
        </div>
      </AbsoluteFill>

      {/* Text */}
      <AbsoluteFill
        style={{
          padding: 48,
          justifyContent: 'flex-start',
          paddingTop: 70,
          opacity: textOpacity,
        }}
      >
        <div
          style={{
            fontFamily: DESIGN.fonts.hero,
            fontWeight: 900,
            fontSize: 68,
            color: DESIGN.colors.green,
            letterSpacing: '0.02em',
            textShadow: `0 0 60px ${DESIGN.colors.green}`,
          }}
        >
          PLAY THE GAME
        </div>
        <div
          style={{
            marginTop: 16,
            fontFamily: DESIGN.fonts.title,
            fontWeight: 600,
            fontSize: 28,
            color: DESIGN.colors.ink,
            letterSpacing: '0.05em',
          }}
        >
          Earn entries from home
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 4: PROP PICKS
// ============================================================================
const ScenePicks: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phoneEnter = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 200, mass: 0.6 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: DESIGN.colors.bg }}>
      <AbsoluteFill>
        <Img
          src={ASSETS.stadium}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.25)',
          }}
        />
      </AbsoluteFill>

      <SmokeOverlay intensity={0.5} />
      <Vignette />

      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ 
          transform: `scale(${0.9 + 0.15 * phoneEnter}) translateY(${50 - 50 * phoneEnter}px)` 
        }}>
          <PhoneMockup screen={SCREENS.picksHub} scale={1.5} />
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          padding: 48,
          justifyContent: 'flex-end',
          paddingBottom: 120,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: DESIGN.fonts.hero,
              fontWeight: 900,
              fontSize: 76,
              color: DESIGN.colors.ink,
              letterSpacing: '0.01em',
              textShadow: '0 4px 0 rgba(0,0,0,0.3)',
            }}
          >
            PROP PICKS
          </div>
          <div
            style={{
              marginTop: 16,
              fontFamily: DESIGN.fonts.title,
              fontWeight: 600,
              fontSize: 26,
              color: DESIGN.colors.green,
              letterSpacing: '0.08em',
            }}
          >
            25 props • Win a signed jersey
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 5: LIVE PREDICTIONS
// ============================================================================
const SceneLive: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phoneEnter = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 180, mass: 0.7 },
  });

  const pulse = 0.6 + 0.4 * Math.sin(frame * 0.2);

  return (
    <AbsoluteFill style={{ backgroundColor: DESIGN.colors.bg }}>
      <AbsoluteFill>
        <Img
          src={ASSETS.stadium}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.25)',
          }}
        />
      </AbsoluteFill>

      <SmokeOverlay intensity={0.6} />
      <Vignette />

      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ transform: `scale(${0.9 + 0.15 * phoneEnter})` }}>
          <PhoneMockup screen={SCREENS.live} scale={1.5} glowColor="#FF3333" />
        </div>
      </AbsoluteFill>

      {/* LIVE badge */}
      <AbsoluteFill style={{ padding: 48, justifyContent: 'flex-start', paddingTop: 60 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 14,
            padding: '18px 32px',
            background: 'rgba(255,0,0,0.2)',
            borderRadius: 100,
            border: '3px solid rgba(255,0,0,0.5)',
            boxShadow: `0 0 ${40 + 30 * pulse}px rgba(255,0,0,0.5)`,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: '#FF0000',
              boxShadow: '0 0 20px #FF0000',
            }}
          />
          <span
            style={{
              fontFamily: DESIGN.fonts.title,
              fontWeight: 700,
              fontSize: 26,
              color: '#FF4444',
              letterSpacing: '0.12em',
            }}
          >
            LIVE GAMEDAY
          </span>
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          padding: 48,
          justifyContent: 'flex-end',
          paddingBottom: 120,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: DESIGN.fonts.hero,
              fontWeight: 900,
              fontSize: 68,
              color: DESIGN.colors.ink,
              textShadow: '0 4px 0 rgba(0,0,0,0.3)',
            }}
          >
            PREDICT PLAYS
          </div>
          <div
            style={{
              marginTop: 14,
              fontFamily: DESIGN.fonts.title,
              fontWeight: 600,
              fontSize: 26,
              color: DESIGN.colors.green,
              letterSpacing: '0.06em',
            }}
          >
            Answer fast • Earn bonus entries
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 6: SCAN & WIN
// ============================================================================
const SceneScanWin: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phoneEnter = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 180, mass: 0.7 },
  });

  const sparkle = 0.7 + 0.3 * Math.sin(frame * 0.2);

  return (
    <AbsoluteFill style={{ backgroundColor: DESIGN.colors.bg }}>
      <AbsoluteFill>
        <Img
          src={ASSETS.stadium}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.25)',
          }}
        />
      </AbsoluteFill>

      <SmokeOverlay intensity={0.6} />
      <Vignette />

      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ 
          transform: `scale(${0.9 + 0.15 * phoneEnter}) translateY(${40 - 40 * phoneEnter}px)` 
        }}>
          <PhoneMockup screen={SCREENS.scratchCard} scale={1.5} glowColor={DESIGN.colors.gold} />
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          padding: 48,
          justifyContent: 'flex-start',
          paddingTop: 60,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: DESIGN.fonts.hero,
              fontWeight: 900,
              fontSize: 76,
              color: DESIGN.colors.gold,
              textShadow: `0 0 ${60 * sparkle}px ${DESIGN.colors.gold}`,
            }}
          >
            SCAN & WIN
          </div>
          <div
            style={{
              marginTop: 16,
              fontFamily: DESIGN.fonts.title,
              fontWeight: 600,
              fontSize: 26,
              color: DESIGN.colors.ink,
              letterSpacing: '0.06em',
            }}
          >
            Daily prizes • Bonus entries
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 7: LEADERBOARD + PROFILE
// ============================================================================
const SceneFeatures: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phone1Enter = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 180, mass: 0.7 },
  });

  const phone2Enter = spring({
    frame: Math.max(0, frame - 10),
    fps,
    config: { damping: 18, stiffness: 180, mass: 0.7 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: DESIGN.colors.bg }}>
      <AbsoluteFill>
        <Img
          src={ASSETS.stadium}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.25)',
          }}
        />
      </AbsoluteFill>

      <SmokeOverlay intensity={0.5} />
      <Vignette />

      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <div style={{ 
            transform: `translateX(${-60 + 60 * phone1Enter}px) rotate(-5deg)`, 
            opacity: phone1Enter 
          }}>
            <PhoneMockup screen={SCREENS.leaderboard} scale={1} tilt={8} />
          </div>
          <div style={{ 
            transform: `translateX(${60 - 60 * phone2Enter}px) rotate(5deg)`, 
            opacity: phone2Enter 
          }}>
            <PhoneMockup screen={SCREENS.profile} scale={1} tilt={-8} />
          </div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          padding: 48,
          justifyContent: 'flex-end',
          paddingBottom: 120,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div 
            style={{ 
              fontFamily: DESIGN.fonts.hero, 
              fontSize: 56, 
              color: DESIGN.colors.green,
              textShadow: `0 0 40px ${DESIGN.colors.green}`,
            }}
          >
            COMPETE & CLIMB
          </div>
          <div 
            style={{ 
              fontSize: 24, 
              color: DESIGN.colors.inkDim, 
              marginTop: 12,
              fontFamily: DESIGN.fonts.title,
              letterSpacing: '0.05em',
            }}
          >
            Track your entries • Climb the ranks
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 8: BIG GAME GIVEAWAY
// ============================================================================
const SceneGiveaway: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const zoom = interpolate(frame, [0, 60], [1.12, 1], { extrapolateRight: 'clamp' });

  const cardEnter = spring({
    frame: Math.max(0, frame - 15),
    fps,
    config: { damping: 16, stiffness: 200, mass: 0.7 },
  });

  const sweepX = interpolate(frame, [0, 60], [-500, 500]);

  return (
    <AbsoluteFill style={{ backgroundColor: DESIGN.colors.bg }}>
      <AbsoluteFill>
        <Img
          src={ASSETS.sanFrancisco}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${zoom})`,
            filter: 'brightness(0.45) contrast(1.1)',
          }}
        />
      </AbsoluteFill>

      <SmokeOverlay intensity={0.6} />
      <Vignette />

      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', transform: `scale(${0.9 + 0.12 * cardEnter})` }}>
          <div
            style={{
              fontFamily: DESIGN.fonts.hero,
              fontWeight: 900,
              fontSize: 140,
              color: DESIGN.colors.ink,
              textShadow: `0 0 100px ${DESIGN.colors.gold}`,
            }}
          >
            WIN
          </div>

          {/* Premium ticket card */}
          <div
            style={{
              position: 'relative',
              width: 780,
              padding: '44px 56px',
              background: `linear-gradient(135deg, ${DESIGN.colors.gold} 0%, #B8860B 100%)`,
              borderRadius: 36,
              boxShadow: `0 0 100px ${hexToRgba(DESIGN.colors.gold, 0.5)}`,
              transform: 'rotate(-2deg)',
              overflow: 'hidden',
            }}
          >
            {/* Shine sweep */}
            <div
              style={{
                position: 'absolute',
                inset: -80,
                transform: `translateX(${sweepX}px) rotate(15deg)`,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              }}
            />
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div 
                style={{ 
                  fontFamily: DESIGN.fonts.title, 
                  fontWeight: 700, 
                  fontSize: 24, 
                  letterSpacing: '0.18em', 
                  color: DESIGN.colors.navy 
                }}
              >
                THE BIG GAME GIVEAWAY
              </div>
              <div 
                style={{ 
                  fontFamily: DESIGN.fonts.hero, 
                  fontWeight: 900, 
                  fontSize: 72, 
                  color: DESIGN.colors.navy, 
                  lineHeight: 1.1 
                }}
              >
                2 TICKETS
              </div>
              <div 
                style={{ 
                  marginTop: 12, 
                  fontFamily: DESIGN.fonts.body, 
                  fontWeight: 600, 
                  fontSize: 22, 
                  color: 'rgba(0,34,68,0.7)' 
                }}
              >
                Drawing Saturday • San Francisco
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 9: PLAYER SHOWCASE - 4 SUPERHERO PLAYERS
// ============================================================================
const ScenePlayerShowcase: React.FC = () => {
  const frame = useCurrentFrame();

  const players = HERO_PLAYERS;
  const totalFrames = 7 * FPS; // 7 seconds
  const framesPerPlayer = Math.floor(totalFrames / 4);
  const idx = Math.min(Math.floor(frame / framesPerPlayer), players.length - 1);
  const segmentFrame = frame - idx * framesPerPlayer;

  const player = players[idx];
  const scale = interpolate(segmentFrame, [0, framesPerPlayer], [1, 1.08]);
  const opacity = interpolate(
    segmentFrame, 
    [0, 10, framesPerPlayer - 12, framesPerPlayer], 
    [0, 1, 1, 0]
  );
  const playerY = interpolate(segmentFrame, [0, 15], [80, 0], { extrapolateRight: 'clamp' });
  const glowPulse = 0.6 + 0.4 * Math.sin(segmentFrame * 0.1);

  return (
    <AbsoluteFill style={{ backgroundColor: DESIGN.colors.bg }}>
      <AbsoluteFill>
        <Img
          src={ASSETS.stadium}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${scale})`,
            filter: 'brightness(0.2) blur(3px)',
          }}
        />
      </AbsoluteFill>

      <SmokeOverlay intensity={0.8} />

      {/* Player hero image */}
      <AbsoluteFill 
        style={{ 
          justifyContent: 'flex-end', 
          alignItems: 'center',
          opacity,
        }}
      >
        <Img
          src={player.image}
          style={{
            width: '130%',
            height: 'auto',
            maxHeight: '88%',
            objectFit: 'contain',
            objectPosition: 'bottom center',
            transform: `translateY(${playerY}px) scale(${scale})`,
            filter: `drop-shadow(0 0 ${100 * glowPulse}px ${DESIGN.colors.green})`,
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
      <AbsoluteFill
        style={{
          padding: 48,
          paddingBottom: 120,
          justifyContent: 'flex-end',
          opacity,
        }}
      >
        <div
          style={{
            fontFamily: DESIGN.fonts.hero,
            fontWeight: 900,
            fontSize: 110,
            lineHeight: 0.85,
            color: DESIGN.colors.ink,
            textShadow: `
              0 0 80px ${DESIGN.colors.green},
              0 4px 0 ${DESIGN.colors.green}
            `,
            letterSpacing: '-0.02em',
          }}
        >
          {player.lastName}
        </div>
        <div
          style={{
            marginTop: 20,
            display: 'flex',
            gap: 24,
            alignItems: 'center',
          }}
        >
          <span 
            style={{ 
              fontFamily: DESIGN.fonts.hero, 
              fontWeight: 900, 
              fontSize: 56, 
              color: DESIGN.colors.green,
              textShadow: `0 0 40px ${DESIGN.colors.green}`,
            }}
          >
            #{player.jersey}
          </span>
          <span 
            style={{ 
              fontFamily: DESIGN.fonts.title, 
              fontWeight: 600, 
              fontSize: 36, 
              color: DESIGN.colors.inkDim,
              letterSpacing: '0.08em',
            }}
          >
            {player.position}
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 10: FINAL CTA
// ============================================================================
const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Plane descends into center
  const planeY = interpolate(frame, [0, 120], [-600, 400], { extrapolateRight: 'clamp' });
  const planeScale = interpolate(frame, [0, 120], [0.4, 1.15], { extrapolateRight: 'clamp' });
  const planeRotate = interpolate(frame, [0, 120], [-15, 8], { extrapolateRight: 'clamp' });

  const textEnter = spring({
    frame: Math.max(0, frame - 25),
    fps,
    config: { damping: 16, stiffness: 160, mass: 0.8 },
  });

  const pulse = 0.6 + 0.4 * Math.sin(frame * 0.15);

  return (
    <AbsoluteFill style={{ backgroundColor: DESIGN.colors.bg }}>
      <AbsoluteFill>
        <Img
          src={ASSETS.seattle}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.3)',
          }}
        />
      </AbsoluteFill>

      <SmokeOverlay intensity={0.6} />

      {/* Plane landing */}
      <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center' }}>
        <Img
          src={ASSETS.plane}
          style={{
            width: 600,
            height: 'auto',
            transform: `translateY(${planeY}px) scale(${planeScale}) rotate(${planeRotate}deg)`,
            filter: `drop-shadow(0 50px 100px rgba(0,0,0,0.6)) drop-shadow(0 0 50px ${DESIGN.colors.green}40)`,
          }}
        />
      </AbsoluteFill>

      <Vignette />

      {/* CTA */}
      <AbsoluteFill
        style={{
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: 160,
        }}
      >
        <div style={{ textAlign: 'center', transform: `scale(${0.9 + 0.12 * textEnter})` }}>
          <div
            style={{
              fontFamily: DESIGN.fonts.hero,
              fontWeight: 900,
              fontSize: 120,
              color: DESIGN.colors.ink,
              textShadow: `0 0 ${100 + 60 * pulse}px ${DESIGN.colors.green}`,
            }}
          >
            ENTER NOW
          </div>

          <div
            style={{
              marginTop: 32,
              display: 'inline-flex',
              padding: '26px 60px',
              borderRadius: 100,
              background: `linear-gradient(135deg, ${DESIGN.colors.green} 0%, #4CAF50 100%)`,
              boxShadow: `0 0 ${60 + 40 * pulse}px ${DESIGN.colors.green}`,
            }}
          >
            <span
              style={{
                fontFamily: DESIGN.fonts.hero,
                fontWeight: 900,
                fontSize: 36,
                color: DESIGN.colors.navy,
                letterSpacing: '0.03em',
              }}
            >
              game.drinksip.com
            </span>
          </div>

          <div
            style={{
              marginTop: 24,
              fontFamily: DESIGN.fonts.title,
              fontWeight: 600,
              fontSize: 24,
              color: DESIGN.colors.inkDim,
              letterSpacing: '0.08em',
            }}
          >
            Drawing Saturday • San Francisco
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// AUDIO LAYER - NEW PREMIUM AUDIO MIX
// ============================================================================
const AudioLayer: React.FC = () => {
  return (
    <>
      {/* Lil Rob - Land of the 12s - skip intro, start at HOOK (10s = 300 frames) */}
      <Audio 
        src={staticFile('audio/music-lilrob.mp4')} 
        volume={0.35}
        startFrom={300}
      />
      
      {/* SFX cues - synced to transitions */}
      {/* Intro slam at Dark Side reveal */}
      <Sequence from={80}>
        <Audio src={staticFile('audio/slam.mp3')} volume={0.9} />
      </Sequence>
      
      {/* Scene transitions - impact hits */}
      <Sequence from={SCENES.mapFlight.start}>
        <Audio src={staticFile('audio/impact1.mp3')} volume={0.7} />
      </Sequence>
      
      <Sequence from={SCENES.gameHub.start}>
        <Audio src={staticFile('audio/snap.mp3')} volume={0.6} />
      </Sequence>
      
      <Sequence from={SCENES.picks.start}>
        <Audio src={staticFile('audio/snap.mp3')} volume={0.6} />
      </Sequence>
      
      <Sequence from={SCENES.live.start}>
        <Audio src={staticFile('audio/snap.mp3')} volume={0.6} />
      </Sequence>
      
      <Sequence from={SCENES.scanWin.start}>
        <Audio src={staticFile('audio/jackpot.mp3')} volume={0.85} />
      </Sequence>
      
      <Sequence from={SCENES.features.start}>
        <Audio src={staticFile('audio/snap.mp3')} volume={0.6} />
      </Sequence>
      
      <Sequence from={SCENES.giveaway.start}>
        <Audio src={staticFile('audio/jackpot.mp3')} volume={0.9} />
      </Sequence>
      
      {/* Player showcase impacts */}
      <Sequence from={SCENES.players.start}>
        <Audio src={staticFile('audio/impact2.mp3')} volume={0.8} />
      </Sequence>
      <Sequence from={SCENES.players.start + 52}>
        <Audio src={staticFile('audio/impact1.mp3')} volume={0.8} />
      </Sequence>
      <Sequence from={SCENES.players.start + 104}>
        <Audio src={staticFile('audio/impact2.mp3')} volume={0.8} />
      </Sequence>
      <Sequence from={SCENES.players.start + 156}>
        <Audio src={staticFile('audio/impact3.mp3')} volume={0.8} />
      </Sequence>
      
      {/* Final CTA */}
      <Sequence from={SCENES.cta.start}>
        <Audio src={staticFile('audio/slam.mp3')} volume={0.95} />
      </Sequence>
      
      <Sequence from={SCENES.cta.start + 60}>
        <Audio src={staticFile('audio/confirm.mp3')} volume={0.7} />
      </Sequence>
      
      {/* End hit */}
      <Sequence from={880}>
        <Audio src={staticFile('audio/endhit.mp3')} volume={1} />
      </Sequence>
    </>
  );
};

// ============================================================================
// MAIN COMPOSITION
// ============================================================================
export const SplashTrailerV4: React.FC = () => {
  return (
    <AbsoluteFill>
      <AudioLayer />

      <Sequence 
        from={SCENES.intro.start} 
        durationInFrames={SCENES.intro.end - SCENES.intro.start}
      >
        <SceneIntro />
      </Sequence>

      <Sequence 
        from={SCENES.mapFlight.start} 
        durationInFrames={SCENES.mapFlight.end - SCENES.mapFlight.start}
      >
        <SceneMapFlight />
      </Sequence>

      <Sequence 
        from={SCENES.gameHub.start} 
        durationInFrames={SCENES.gameHub.end - SCENES.gameHub.start}
      >
        <SceneGameHub />
      </Sequence>

      <Sequence 
        from={SCENES.picks.start} 
        durationInFrames={SCENES.picks.end - SCENES.picks.start}
      >
        <ScenePicks />
      </Sequence>

      <Sequence 
        from={SCENES.live.start} 
        durationInFrames={SCENES.live.end - SCENES.live.start}
      >
        <SceneLive />
      </Sequence>

      <Sequence 
        from={SCENES.scanWin.start} 
        durationInFrames={SCENES.scanWin.end - SCENES.scanWin.start}
      >
        <SceneScanWin />
      </Sequence>

      <Sequence 
        from={SCENES.features.start} 
        durationInFrames={SCENES.features.end - SCENES.features.start}
      >
        <SceneFeatures />
      </Sequence>

      <Sequence 
        from={SCENES.giveaway.start} 
        durationInFrames={SCENES.giveaway.end - SCENES.giveaway.start}
      >
        <SceneGiveaway />
      </Sequence>

      <Sequence 
        from={SCENES.players.start} 
        durationInFrames={SCENES.players.end - SCENES.players.start}
      >
        <ScenePlayerShowcase />
      </Sequence>

      <Sequence 
        from={SCENES.cta.start} 
        durationInFrames={SCENES.cta.end - SCENES.cta.start}
      >
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};

export default SplashTrailerV4;
