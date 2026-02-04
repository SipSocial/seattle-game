/**
 * DARK SIDE FOOTBALL — SPLASH TRAILER V3
 * 
 * HOLLYWOOD × EPIC GAMES QUALITY TRAILER
 * 
 * Shows all app features:
 * - Dark Side Defense game
 * - QB Legend (coming soon)
 * - Prop Picks (Kalshi-style predictions)
 * - Live questions during the game
 * - Leaderboard competition
 * - Scan & Win instant prizes
 * - Big Game Giveaway
 * 
 * Uses:
 * - Leonardo AI backgrounds (stadiums, SF, Seattle, plane)
 * - Actual app screenshots in phone mockups
 * - ElevenLabs voiceover
 * - Premium SFX
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
} from 'remotion';
import { 
  PLAYERS_TRANSPARENT,
  CAMPAIGN,
  DRINKSIP,
} from './assets';

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

// App screenshots (captured from actual app)
const SCREENS = {
  gameHub: staticFile('screens/game-hub.png'),
  picksHub: staticFile('screens/picks-hub.png'),
  live: staticFile('screens/live.png'),
  leaderboard: staticFile('screens/leaderboard.png'),
  profile: staticFile('screens/profile.png'),
  scratchCard: staticFile('screens/scratch-card.png'),
};

// Superhero player assets - ALL from local sprites folder
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

// ============================================================================
// THEME
// ============================================================================
const THEME = {
  colors: {
    bg: '#020408',
    ink: '#F8F9FC',
    inkDim: 'rgba(248,249,252,0.7)',
    green: '#69BE28',
    gold: '#FFD700',
    navy: '#002244',
  },
  type: {
    mega: 160,
    huge: 100,
    big: 70,
    mid: 48,
    small: 32,
  },
};

const FPS = 30;

// ============================================================================
// TIMING - 30 seconds @ 30fps = 900 frames
// ============================================================================
const SCENES = {
  // 0-3s: DrinkSip Presents + DARK SIDE title (longer hold)
  intro: { start: 0, end: 3 * FPS },
  
  // 3-5s: Plane over map
  title: { start: 3 * FPS, end: 5 * FPS },
  
  // 5-7s: Game Hub reveal (Dark Side Defense)
  gameHub: { start: 5 * FPS, end: 7 * FPS },
  
  // 7-9s: Picks feature
  picks: { start: 7 * FPS, end: 9 * FPS },
  
  // 9-11s: Live questions during the game
  live: { start: 9 * FPS, end: 11 * FPS },
  
  // 11-13s: Scan & Win scratch card
  scanWin: { start: 11 * FPS, end: 13 * FPS },
  
  // 13-15s: Leaderboard + Profile
  features: { start: 13 * FPS, end: 15 * FPS },
  
  // 15-18s: SF destination + Big Game Giveaway
  giveaway: { start: 15 * FPS, end: 18 * FPS },
  
  // 18-25s: Player showcase (4 superhero players)
  players: { start: 18 * FPS, end: 25 * FPS },
  
  // 25-30s: CTA - Enter now  
  cta: { start: 25 * FPS, end: 30 * FPS },
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
// PHONE MOCKUP COMPONENT - JUMBO SIZE
// ============================================================================
const PhoneMockup: React.FC<{
  screen: string;
  scale?: number;
  tilt?: number;
  glowColor?: string;
}> = ({ screen, scale = 1.4, tilt = 0, glowColor = THEME.colors.green }) => {
  return (
    <div
      style={{
        position: 'relative',
        width: 340 * scale,
        height: 680 * scale,
        borderRadius: 44 * scale,
        background: 'linear-gradient(145deg, #1a1a2e, #0a0a1e)',
        border: `3px solid #3a3a5a`,
        boxShadow: `
          0 60px 120px rgba(0,0,0,0.6),
          0 0 80px ${hexToRgba(glowColor, 0.35)},
          inset 0 0 0 1px rgba(255,255,255,0.08),
          0 0 0 1px rgba(0,0,0,0.5)
        `,
        overflow: 'hidden',
        transform: `perspective(1200px) rotateY(${tilt}deg)`,
      }}
    >
      {/* Screen bezel */}
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
// SMOKE OVERLAY - ENHANCED VFX
// ============================================================================
const SmokeOverlay: React.FC<{ intensity?: number }> = ({ intensity = 0.5 }) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame * 0.015) * 40;
  const pulse = 0.8 + 0.2 * Math.sin(frame * 0.05);
  
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* Bottom smoke billowing */}
      <div
        style={{
          position: 'absolute',
          inset: '-30%',
          background: `radial-gradient(ellipse 140% 70% at ${50 + drift * 0.5}% 95%, rgba(255,255,255,${0.12 * intensity * pulse}), transparent 55%)`,
          filter: 'blur(80px)',
        }}
      />
      {/* Green stadium glow */}
      <div
        style={{
          position: 'absolute',
          inset: '-20%',
          background: `radial-gradient(ellipse 100% 50% at ${50 - drift * 0.3}% 100%, rgba(105,190,40,${0.1 * intensity}), transparent 50%)`,
          filter: 'blur(100px)',
        }}
      />
      {/* Top atmospheric haze */}
      <div
        style={{
          position: 'absolute',
          inset: '-20%',
          background: `radial-gradient(ellipse 80% 40% at 50% 5%, rgba(105,190,40,${0.04 * intensity}), transparent 40%)`,
          filter: 'blur(60px)',
        }}
      />
      {/* Side stadium lights */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 30% 60% at 5% 30%, rgba(255,255,255,${0.03 * intensity}), transparent 50%),
            radial-gradient(ellipse 30% 60% at 95% 30%, rgba(255,255,255,${0.03 * intensity}), transparent 50%)
          `,
          filter: 'blur(40px)',
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
          background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 30%, rgba(0,0,0,0.7) 100%)',
        }}
      />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, transparent 100%)' }} />
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 1: DRINKSIP PRESENTS + DARK SIDE TITLE
// ============================================================================
const SceneIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: DrinkSip logo (0-45 frames / 0-1.5s)
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 140, mass: 1 },
  });
  const presentsOpacity = interpolate(frame, [20, 35], [0, 1], { extrapolateRight: 'clamp' });
  const logoOpacity = interpolate(frame, [0, 10, 45, 55], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Phase 2: DARK SIDE title (45-90 frames / 1.5-3s)
  const titleEnter = spring({
    frame: Math.max(0, frame - 50),
    fps,
    config: { damping: 14, stiffness: 180, mass: 0.8 },
  });
  const titleOpacity = interpolate(frame, [45, 55], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.bg }}>
      <AbsoluteFill>
        <Img
          src={ASSETS.stadium}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.25) blur(4px)',
          }}
        />
      </AbsoluteFill>
      
      <SmokeOverlay intensity={0.6} />
      <Vignette />

      {/* Phase 1: DrinkSip Presents */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: logoOpacity }}>
        <div style={{ textAlign: 'center', transform: `scale(${logoScale})` }}>
          <Img
            src={DRINKSIP.logo}
            style={{
              height: 120,
              width: 'auto',
              filter: 'drop-shadow(0 15px 50px rgba(255,215,0,0.5))',
            }}
          />
          <div
            style={{
              marginTop: 24,
              fontFamily: 'Arial, sans-serif',
              fontWeight: 700,
              fontSize: 32,
              letterSpacing: '0.35em',
              color: THEME.colors.gold,
              opacity: presentsOpacity,
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
        <div style={{ textAlign: 'center', transform: `scale(${0.9 + 0.12 * titleEnter})` }}>
          <div
            style={{
              fontFamily: 'Arial Black, Impact, sans-serif',
              fontWeight: 900,
              fontSize: 140,
              lineHeight: 0.85,
              letterSpacing: '-0.02em',
              background: `linear-gradient(180deg, ${THEME.colors.ink} 0%, ${THEME.colors.green} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: `0 0 100px ${THEME.colors.green}`,
            }}
          >
            DARK SIDE
          </div>
          <div
            style={{
              marginTop: 20,
              fontFamily: 'Arial, sans-serif',
              fontWeight: 600,
              fontSize: 28,
              letterSpacing: '0.25em',
              color: THEME.colors.inkDim,
            }}
          >
            THE FOOTBALL GAME
          </div>
          <div
            style={{
              marginTop: 16,
              fontFamily: 'Arial, sans-serif',
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: '0.15em',
              color: THEME.colors.green,
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
// SCENE 2: PLANE OVER US MAP
// ============================================================================
const SceneTitle: React.FC = () => {
  const frame = useCurrentFrame();

  // Plane flies from left to right (Seattle to SF direction)
  const planeX = interpolate(frame, [0, 60], [-700, 400], { extrapolateRight: 'clamp' });
  const planeY = interpolate(frame, [0, 60], [100, -50], { extrapolateRight: 'clamp' });
  const planeScale = interpolate(frame, [0, 60], [0.9, 1.1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.bg }}>
      <AbsoluteFill>
        <Img
          src={ASSETS.usMap}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.5)',
          }}
        />
      </AbsoluteFill>

      <SmokeOverlay intensity={0.6} />

      {/* Plane flying LEFT to RIGHT */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Img
          src={ASSETS.plane}
          style={{
            width: 750,
            height: 'auto',
            transform: `translate(${planeX}px, ${planeY}px) scale(${planeScale}) rotate(-5deg) scaleX(1)`,
            filter: 'drop-shadow(0 60px 120px rgba(0,0,0,0.7))',
          }}
        />
      </AbsoluteFill>

      <Vignette />

      {/* Simple text overlay */}
      <AbsoluteFill
        style={{
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: 180,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: 'Arial Black, Impact, sans-serif',
              fontWeight: 900,
              fontSize: 36,
              letterSpacing: '0.2em',
              color: THEME.colors.inkDim,
            }}
          >
            ROAD TO
          </div>
          <div
            style={{
              fontFamily: 'Arial Black, Impact, sans-serif',
              fontWeight: 900,
              fontSize: 70,
              letterSpacing: '0.05em',
              color: THEME.colors.gold,
              textShadow: `0 0 60px ${THEME.colors.gold}`,
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
// SCENE 3: GAME HUB - BIGGER SCREEN & TEXT
// ============================================================================
const SceneGameHub: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phoneEnter = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 200, mass: 0.7 },
  });

  const textOpacity = interpolate(frame, [10, 25], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.bg }}>
      <AbsoluteFill>
        <Img
          src={ASSETS.stadium}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.3)',
          }}
        />
      </AbsoluteFill>

      <SmokeOverlay intensity={0.6} />
      <Vignette />

      {/* JUMBO Phone mockup */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ transform: `translateY(${80 - 80 * phoneEnter}px) scale(${0.85 + 0.2 * phoneEnter})` }}>
          <PhoneMockup screen={SCREENS.gameHub} scale={1.5} />
        </div>
      </AbsoluteFill>

      {/* BIGGER Text overlay */}
      <AbsoluteFill
        style={{
          padding: 40,
          justifyContent: 'flex-start',
          paddingTop: 60,
          opacity: textOpacity,
        }}
      >
        <div
          style={{
            fontFamily: 'Arial Black, Impact, sans-serif',
            fontWeight: 900,
            fontSize: 64,
            color: THEME.colors.green,
            letterSpacing: '0.03em',
            textShadow: `0 0 40px ${THEME.colors.green}`,
          }}
        >
          PLAY THE GAME
        </div>
        <div
          style={{
            marginTop: 12,
            fontFamily: 'Arial, sans-serif',
            fontWeight: 700,
            fontSize: 28,
            color: THEME.colors.ink,
          }}
        >
          Earn entries from home
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 4: PICKS - BIGGER SCREEN & TEXT
// ============================================================================
const ScenePicks: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phoneEnter = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 220, mass: 0.6 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.bg }}>
      <AbsoluteFill>
        <Img
          src={ASSETS.stadium}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.3)',
          }}
        />
      </AbsoluteFill>

      <SmokeOverlay intensity={0.5} />
      <Vignette />

      {/* JUMBO phone */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ transform: `scale(${0.9 + 0.15 * phoneEnter}) translateY(${50 - 50 * phoneEnter}px)` }}>
          <PhoneMockup screen={SCREENS.picksHub} scale={1.5} />
        </div>
      </AbsoluteFill>

      {/* BIGGER Text overlay */}
      <AbsoluteFill
        style={{
          padding: 40,
          justifyContent: 'flex-end',
          paddingBottom: 100,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: 'Arial Black, Impact, sans-serif',
              fontWeight: 900,
              fontSize: 72,
              color: THEME.colors.ink,
              letterSpacing: '0.02em',
              textShadow: '0 4px 0 rgba(0,0,0,0.3)',
            }}
          >
            PROP PICKS
          </div>
          <div
            style={{
              marginTop: 14,
              fontFamily: 'Arial, sans-serif',
              fontWeight: 700,
              fontSize: 28,
              color: THEME.colors.green,
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
// SCENE 5: LIVE - BIGGER SCREEN & TEXT
// ============================================================================
const SceneLive: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phoneEnter = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 200, mass: 0.7 },
  });

  const pulse = 0.6 + 0.4 * Math.sin(frame * 0.25);

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.bg }}>
      <AbsoluteFill>
        <Img
          src={ASSETS.stadium}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.3)',
          }}
        />
      </AbsoluteFill>

      <SmokeOverlay intensity={0.6} />
      <Vignette />

      {/* JUMBO Phone mockup */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ transform: `scale(${0.9 + 0.15 * phoneEnter})` }}>
          <PhoneMockup screen={SCREENS.live} scale={1.5} glowColor="#FF4444" />
        </div>
      </AbsoluteFill>

      {/* LIVE badge - BIGGER */}
      <AbsoluteFill style={{ padding: 40, justifyContent: 'flex-start', paddingTop: 50 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 14,
            padding: '18px 28px',
            background: 'rgba(255,0,0,0.25)',
            borderRadius: 100,
            border: '3px solid rgba(255,0,0,0.6)',
            boxShadow: `0 0 ${40 + 25 * pulse}px rgba(255,0,0,0.5)`,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: '#FF0000',
              boxShadow: '0 0 15px #FF0000',
            }}
          />
          <span
            style={{
              fontFamily: 'Arial Black, Impact, sans-serif',
              fontWeight: 900,
              fontSize: 28,
              color: '#FF4444',
              letterSpacing: '0.12em',
            }}
          >
            LIVE GAMEDAY
          </span>
        </div>
      </AbsoluteFill>

      {/* BIGGER Text overlay */}
      <AbsoluteFill
        style={{
          padding: 40,
          justifyContent: 'flex-end',
          paddingBottom: 100,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: 'Arial Black, Impact, sans-serif',
              fontWeight: 900,
              fontSize: 64,
              color: THEME.colors.ink,
              textShadow: '0 4px 0 rgba(0,0,0,0.3)',
            }}
          >
            PREDICT PLAYS
          </div>
          <div
            style={{
              marginTop: 12,
              fontFamily: 'Arial, sans-serif',
              fontWeight: 700,
              fontSize: 26,
              color: THEME.colors.green,
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
// SCENE 6: SCAN & WIN - BIGGER
// ============================================================================
const SceneScanWin: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phoneEnter = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 200, mass: 0.7 },
  });

  const sparkle = 0.7 + 0.3 * Math.sin(frame * 0.25);

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.bg }}>
      <AbsoluteFill>
        <Img
          src={ASSETS.stadium}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.3)',
          }}
        />
      </AbsoluteFill>

      <SmokeOverlay intensity={0.6} />
      <Vignette />

      {/* JUMBO Phone with scratch card */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ transform: `scale(${0.9 + 0.15 * phoneEnter}) translateY(${40 - 40 * phoneEnter}px)` }}>
          <PhoneMockup screen={SCREENS.scratchCard} scale={1.5} glowColor={THEME.colors.gold} />
        </div>
      </AbsoluteFill>

      {/* BIGGER Text overlay */}
      <AbsoluteFill
        style={{
          padding: 40,
          justifyContent: 'flex-start',
          paddingTop: 50,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: 'Arial Black, Impact, sans-serif',
              fontWeight: 900,
              fontSize: 72,
              color: THEME.colors.gold,
              textShadow: `0 0 ${50 * sparkle}px ${THEME.colors.gold}`,
            }}
          >
            SCAN & WIN
          </div>
          <div
            style={{
              marginTop: 14,
              fontFamily: 'Arial, sans-serif',
              fontWeight: 700,
              fontSize: 28,
              color: THEME.colors.ink,
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
// SCENE 6B: FEATURES (LEADERBOARD + PROFILE)
// ============================================================================
const SceneFeatures: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phone1Enter = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 200, mass: 0.7 },
  });

  const phone2Enter = spring({
    frame: Math.max(0, frame - 12),
    fps,
    config: { damping: 16, stiffness: 200, mass: 0.7 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.bg }}>
      <AbsoluteFill>
        <Img
          src={ASSETS.stadium}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.3)',
          }}
        />
      </AbsoluteFill>

      <SmokeOverlay intensity={0.5} />
      <Vignette />

      {/* Two phones */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <div style={{ transform: `translateX(${-60 + 60 * phone1Enter}px) rotate(-4deg)`, opacity: phone1Enter }}>
            <PhoneMockup screen={SCREENS.leaderboard} scale={1} tilt={8} />
          </div>
          <div style={{ transform: `translateX(${60 - 60 * phone2Enter}px) rotate(4deg)`, opacity: phone2Enter }}>
            <PhoneMockup screen={SCREENS.profile} scale={1} tilt={-8} />
          </div>
        </div>
      </AbsoluteFill>

      {/* Labels */}
      <AbsoluteFill
        style={{
          padding: 50,
          justifyContent: 'flex-end',
          paddingBottom: 100,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Arial Black', fontSize: 48, color: THEME.colors.green }}>
            COMPETE & CLIMB
          </div>
          <div style={{ fontSize: 22, color: THEME.colors.inkDim, marginTop: 8 }}>
            Track your entries • Climb the ranks
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 7: GIVEAWAY
// ============================================================================
const SceneGiveaway: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const zoom = interpolate(frame, [0, 120], [1.15, 1], { extrapolateRight: 'clamp' });

  const pop = spring({
    frame: Math.max(0, frame - 20),
    fps,
    config: { damping: 14, stiffness: 220, mass: 0.7 },
  });

  const sweepX = interpolate(frame, [0, 90], [-600, 600]);

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.bg }}>
      {/* SF Golden Gate background */}
      <AbsoluteFill>
        <Img
          src={ASSETS.sanFrancisco}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${zoom})`,
            filter: 'brightness(0.5) contrast(1.15)',
          }}
        />
      </AbsoluteFill>

      <SmokeOverlay intensity={0.6} />
      <Vignette />

      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', transform: `scale(${0.92 + 0.1 * pop})` }}>
          <div
            style={{
              fontFamily: 'Arial Black, Impact, sans-serif',
              fontWeight: 900,
              fontSize: 140,
              color: THEME.colors.ink,
              textShadow: `0 0 100px ${THEME.colors.gold}`,
            }}
          >
            WIN
          </div>

          {/* Ticket card */}
          <div
            style={{
              position: 'relative',
              width: 800,
              padding: '40px 50px',
              background: `linear-gradient(135deg, ${THEME.colors.gold} 0%, #B8860B 100%)`,
              borderRadius: 36,
              boxShadow: `0 0 120px ${hexToRgba(THEME.colors.gold, 0.5)}`,
              transform: 'rotate(-2deg)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: -100,
                transform: `translateX(${sweepX}px) rotate(15deg)`,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              }}
            />
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div style={{ fontFamily: 'Arial', fontWeight: 900, fontSize: 26, letterSpacing: '0.15em', color: THEME.colors.navy }}>
                THE BIG GAME GIVEAWAY
              </div>
              <div style={{ fontFamily: 'Arial Black', fontWeight: 900, fontSize: 70, color: THEME.colors.navy, lineHeight: 1 }}>
                2 TICKETS
              </div>
              <div style={{ marginTop: 12, fontFamily: 'Arial', fontWeight: 700, fontSize: 22, color: 'rgba(0,34,68,0.7)' }}>
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
// SCENE 8: PLAYER SHOWCASE - 4 SUPERHERO PLAYERS
// ============================================================================
const ScenePlayerShowcase: React.FC = () => {
  const frame = useCurrentFrame();

  const players = HERO_PLAYERS; // Lawrence, Williams, Murphy, Emmanwori
  const totalFrames = 7 * FPS; // 7 seconds for 4 players
  const framesPerPlayer = Math.floor(totalFrames / 4); // ~52 frames each
  const idx = Math.min(Math.floor(frame / framesPerPlayer), players.length - 1);
  const segmentFrame = frame - idx * framesPerPlayer;

  const player = players[idx];
  const scale = interpolate(segmentFrame, [0, framesPerPlayer], [1, 1.1]);
  const opacity = interpolate(segmentFrame, [0, 8, framesPerPlayer - 10, framesPerPlayer], [0, 1, 1, 0]);
  const playerY = interpolate(segmentFrame, [0, 12], [60, 0], { extrapolateRight: 'clamp' });
  const glowPulse = 0.6 + 0.4 * Math.sin(segmentFrame * 0.12);

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.bg }}>
      {/* Stadium background */}
      <AbsoluteFill>
        <Img
          src={ASSETS.stadium}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${scale})`,
            filter: 'brightness(0.3) blur(2px)',
          }}
        />
      </AbsoluteFill>

      <SmokeOverlay intensity={0.8} />

      {/* Player hero image - SUPERHERO transparent PNG */}
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
            width: '140%',
            height: 'auto',
            maxHeight: '90%',
            objectFit: 'contain',
            objectPosition: 'bottom center',
            transform: `translateY(${playerY}px) scale(${scale})`,
            filter: `drop-shadow(0 0 ${80 * glowPulse}px ${THEME.colors.green})`,
          }}
        />
      </AbsoluteFill>

      {/* Enhanced green hero glow behind player */}
      <AbsoluteFill style={{ pointerEvents: 'none', opacity: opacity * glowPulse * 0.6 }}>
        <div
          style={{
            position: 'absolute',
            bottom: '5%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            height: '70%',
            background: `radial-gradient(ellipse at center bottom, ${THEME.colors.green}50 0%, transparent 55%)`,
            filter: 'blur(100px)',
          }}
        />
      </AbsoluteFill>

      <Vignette />

      {/* JUMBO Player name overlay */}
      <AbsoluteFill
        style={{
          padding: 40,
          paddingBottom: 100,
          justifyContent: 'flex-end',
          opacity,
        }}
      >
        <div
          style={{
            fontFamily: 'Arial Black, Impact, sans-serif',
            fontWeight: 900,
            fontSize: 110,
            lineHeight: 0.85,
            color: THEME.colors.ink,
            textShadow: `
              0 0 80px ${THEME.colors.green},
              0 5px 0 ${THEME.colors.green}
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
            gap: 28,
            alignItems: 'center',
          }}
        >
          <span 
            style={{ 
              fontFamily: 'Arial Black', 
              fontWeight: 900, 
              fontSize: 56, 
              color: THEME.colors.green,
              textShadow: `0 0 40px ${THEME.colors.green}`,
            }}
          >
            #{player.jersey}
          </span>
          <span style={{ fontFamily: 'Arial', fontWeight: 700, fontSize: 36, color: THEME.colors.inkDim }}>
            {player.position}
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 9: CTA - PLANE LANDS IN CENTER
// ============================================================================
const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Plane continuously descends into center of screen
  const planeY = interpolate(frame, [0, 150], [-500, 350], { extrapolateRight: 'clamp' });
  const planeScale = interpolate(frame, [0, 150], [0.5, 1.1], { extrapolateRight: 'clamp' });
  const planeRotate = interpolate(frame, [0, 150], [-12, 5], { extrapolateRight: 'clamp' });

  const enter = spring({
    frame: Math.max(0, frame - 20),
    fps,
    config: { damping: 14, stiffness: 180, mass: 0.7 },
  });

  const pulse = 0.6 + 0.4 * Math.sin(frame * 0.18);

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.bg }}>
      <AbsoluteFill>
        <Img
          src={ASSETS.seattle}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.35)',
          }}
        />
      </AbsoluteFill>

      <SmokeOverlay intensity={0.6} />

      {/* Plane landing - COMES DOWN INTO CENTER */}
      <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center' }}>
        <Img
          src={ASSETS.plane}
          style={{
            width: 650,
            height: 'auto',
            transform: `translateY(${planeY}px) scale(${planeScale}) rotate(${planeRotate}deg)`,
            filter: `drop-shadow(0 40px 100px rgba(0,0,0,0.6)) drop-shadow(0 0 40px ${THEME.colors.green}40)`,
          }}
        />
      </AbsoluteFill>

      <Vignette />

      {/* CTA - BIGGER */}
      <AbsoluteFill
        style={{
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: 140,
        }}
      >
        <div style={{ textAlign: 'center', transform: `scale(${0.92 + 0.1 * enter})` }}>
          <div
            style={{
              fontFamily: 'Arial Black, Impact, sans-serif',
              fontWeight: 900,
              fontSize: 120,
              color: THEME.colors.ink,
              textShadow: `0 0 ${80 + 50 * pulse}px ${THEME.colors.green}`,
            }}
          >
            ENTER NOW
          </div>

          <div
            style={{
              marginTop: 28,
              display: 'inline-flex',
              padding: '24px 56px',
              borderRadius: 100,
              background: `linear-gradient(135deg, ${THEME.colors.green} 0%, #4CAF50 100%)`,
              boxShadow: `0 0 ${50 + 35 * pulse}px ${THEME.colors.green}`,
            }}
          >
            <span
              style={{
                fontFamily: 'Arial Black, Impact, sans-serif',
                fontWeight: 900,
                fontSize: 36,
                color: THEME.colors.navy,
                letterSpacing: '0.04em',
              }}
            >
              game.drinksip.com
            </span>
          </div>

          <div
            style={{
              marginTop: 20,
              fontFamily: 'Arial, sans-serif',
              fontWeight: 700,
              fontSize: 24,
              color: THEME.colors.inkDim,
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
// AUDIO LAYER
// ============================================================================
const AudioLayer: React.FC = () => {
  return (
    <>
      <Audio src={staticFile('audio/bed.mp3')} volume={0.3} startFrom={0} />
      
      {/* SFX cues */}
      <Sequence from={60}><Audio src={staticFile('audio/slam.mp3')} volume={0.85} /></Sequence>
      <Sequence from={150}><Audio src={staticFile('audio/snap.mp3')} volume={0.5} /></Sequence>
      <Sequence from={240}><Audio src={staticFile('audio/snap.mp3')} volume={0.5} /></Sequence>
      <Sequence from={330}><Audio src={staticFile('audio/snap.mp3')} volume={0.5} /></Sequence>
      <Sequence from={420}><Audio src={staticFile('audio/snap.mp3')} volume={0.5} /></Sequence>
      <Sequence from={510}><Audio src={staticFile('audio/jackpot.mp3')} volume={0.9} /></Sequence>
      <Sequence from={750}><Audio src={staticFile('audio/confirm.mp3')} volume={0.6} /></Sequence>
      <Sequence from={870}><Audio src={staticFile('audio/endhit.mp3')} volume={0.95} /></Sequence>
    </>
  );
};

// ============================================================================
// MAIN COMPOSITION - 30 SECONDS
// ============================================================================
export const SplashTrailerV3: React.FC = () => {
  return (
    <AbsoluteFill>
      <AudioLayer />

      <Sequence from={SCENES.intro.start} durationInFrames={SCENES.intro.end - SCENES.intro.start}>
        <SceneIntro />
      </Sequence>

      <Sequence from={SCENES.title.start} durationInFrames={SCENES.title.end - SCENES.title.start}>
        <SceneTitle />
      </Sequence>

      <Sequence from={SCENES.gameHub.start} durationInFrames={SCENES.gameHub.end - SCENES.gameHub.start}>
        <SceneGameHub />
      </Sequence>

      <Sequence from={SCENES.picks.start} durationInFrames={SCENES.picks.end - SCENES.picks.start}>
        <ScenePicks />
      </Sequence>

      <Sequence from={SCENES.live.start} durationInFrames={SCENES.live.end - SCENES.live.start}>
        <SceneLive />
      </Sequence>

      <Sequence from={SCENES.scanWin.start} durationInFrames={SCENES.scanWin.end - SCENES.scanWin.start}>
        <SceneScanWin />
      </Sequence>

      <Sequence from={SCENES.features.start} durationInFrames={SCENES.features.end - SCENES.features.start}>
        <SceneFeatures />
      </Sequence>

      <Sequence from={SCENES.giveaway.start} durationInFrames={SCENES.giveaway.end - SCENES.giveaway.start}>
        <SceneGiveaway />
      </Sequence>

      <Sequence from={SCENES.players.start} durationInFrames={SCENES.players.end - SCENES.players.start}>
        <ScenePlayerShowcase />
      </Sequence>

      <Sequence from={SCENES.cta.start} durationInFrames={SCENES.cta.end - SCENES.cta.start}>
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};

export default SplashTrailerV3;
