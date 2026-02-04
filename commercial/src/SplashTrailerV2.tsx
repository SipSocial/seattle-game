/**
 * DARK SIDE DEFENSE — SPLASH TRAILER V2
 * 
 * Premium 20-second cinematic trailer with:
 * - Leonardo AI stadium/city backgrounds
 * - Dark Side Boeing 737 plane
 * - Smoke/fog effects
 * - Real player hero shots
 * - ElevenLabs voiceover + SFX
 * - SF Super Bowl destination
 * 
 * Resolution: 1080x1920 (9:16 vertical mobile)
 * Duration: 20 seconds @ 30fps = 600 frames
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
  PLAYERS,
  CAMPAIGN,
  SUPER_BOWL,
} from './assets';

// ============================================================================
// LEONARDO AI ASSETS
// ============================================================================
const ASSETS = {
  // Stadiums & Cities
  stadium: CAMPAIGN.stadiumImage, // Empty NFL field with smoke
  sanFrancisco: CAMPAIGN.sanFranciscoImage, // Golden Gate + Levi's Stadium
  seattle: CAMPAIGN.seattleImage, // Space Needle skyline
  usMap: CAMPAIGN.mapImage, // Dark tactical US map
  
  // The Dark Side Plane
  plane: CAMPAIGN.planeImage, // Seahawks Boeing 737
  
  // Additional Leonardo assets for atmosphere
  smokeVideo: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/4b5f0ad3-9f4e-413f-b44a-053e9af6240c/4b5f0ad3-9f4e-413f-b44a-053e9af6240c.mp4',
};

// ============================================================================
// THEME
// ============================================================================
const THEME = {
  w: 1080,
  h: 1920,
  fps: 30,
  
  safe: {
    top: 100,
    bottom: 180,
    left: 60,
    right: 60,
  },
  
  colors: {
    bg0: '#020408',
    bg1: '#0A1018',
    ink: '#F8F9FC',
    inkDim: 'rgba(248,249,252,0.7)',
    green: '#69BE28',
    greenGlow: 'rgba(105,190,40,0.6)',
    cyan: '#00E5FF',
    gold: '#FFD700',
    goldDark: '#B8860B',
    navy: '#002244',
  },
  
  type: {
    mega: 180,
    giga: 140,
    huge: 100,
    big: 70,
    mid: 48,
    small: 32,
  },
};

const FPS = 30;

// ============================================================================
// TIMING - 20 seconds @ 30fps = 600 frames
// ============================================================================
const SCENES = {
  // 0-3s: Stadium reveal + "NO FOOTBALL THIS WEEK"
  stadiumReveal: { start: 0, end: 3 * FPS },
  
  // 3-4s: "JUST KIDDING" glitch
  justKidding: { start: 3 * FPS, end: 4 * FPS },
  
  // 4-6s: Plane flying over US map + "THE DARK SIDE"
  planeReveal: { start: 4 * FPS, end: 6 * FPS },
  
  // 6-10s: Player hero carousel (4 players)
  players: { start: 6 * FPS, end: 10 * FPS },
  
  // 10-12s: Action words TACKLE/DEFEND/DOMINATE
  actionWords: { start: 10 * FPS, end: 12 * FPS },
  
  // 12-16s: SF Golden Gate + WIN SUPER BOWL TICKETS
  sfReveal: { start: 12 * FPS, end: 16 * FPS },
  
  // 16-20s: CTA with plane landing
  cta: { start: 16 * FPS, end: 20 * FPS },
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
// AUDIO LAYER
// ============================================================================
const AudioLayer: React.FC = () => {
  return (
    <>
      {/* Music bed - slightly louder for trailer impact */}
      <Audio
        src={staticFile('audio/bed.mp3')}
        volume={0.35}
        startFrom={0}
      />
      
      {/* VO - Shortened for 20s version */}
      <Sequence from={60}>
        <Audio src={staticFile('audio/vo/vo-01-no-football.mp3')} volume={1} />
      </Sequence>
      <Sequence from={90}>
        <Audio src={staticFile('audio/vo/vo-02-just-kidding.mp3')} volume={1} />
      </Sequence>
      <Sequence from={120}>
        <Audio src={staticFile('audio/vo/vo-03-dark-side-game.mp3')} volume={1} />
      </Sequence>
      <Sequence from={210}>
        <Audio src={staticFile('audio/vo/vo-04-choose-defender.mp3')} volume={1} />
      </Sequence>
      <Sequence from={300}>
        <Audio src={staticFile('audio/vo/vo-06-tackle.mp3')} volume={1} />
      </Sequence>
      <Sequence from={330}>
        <Audio src={staticFile('audio/vo/vo-07-defend.mp3')} volume={1} />
      </Sequence>
      <Sequence from={350}>
        <Audio src={staticFile('audio/vo/vo-08-dominate.mp3')} volume={1} />
      </Sequence>
      <Sequence from={380}>
        <Audio src={staticFile('audio/vo/vo-09-win-tickets.mp3')} volume={1} />
      </Sequence>
      <Sequence from={500}>
        <Audio src={staticFile('audio/vo/vo-11-play-now.mp3')} volume={1} />
      </Sequence>
      
      {/* SFX */}
      <Sequence from={90}>
        <Audio src={staticFile('audio/thump.mp3')} volume={0.8} />
      </Sequence>
      <Sequence from={120}>
        <Audio src={staticFile('audio/slam.mp3')} volume={0.9} />
      </Sequence>
      <Sequence from={180}>
        <Audio src={staticFile('audio/snap.mp3')} volume={0.5} />
      </Sequence>
      <Sequence from={240}>
        <Audio src={staticFile('audio/snap.mp3')} volume={0.5} />
      </Sequence>
      <Sequence from={300}>
        <Audio src={staticFile('audio/impact1.mp3')} volume={0.85} />
      </Sequence>
      <Sequence from={330}>
        <Audio src={staticFile('audio/impact2.mp3')} volume={0.85} />
      </Sequence>
      <Sequence from={350}>
        <Audio src={staticFile('audio/impact3.mp3')} volume={0.9} />
      </Sequence>
      <Sequence from={380}>
        <Audio src={staticFile('audio/jackpot.mp3')} volume={0.9} />
      </Sequence>
      <Sequence from={500}>
        <Audio src={staticFile('audio/confirm.mp3')} volume={0.6} />
      </Sequence>
      <Sequence from={580}>
        <Audio src={staticFile('audio/endhit.mp3')} volume={0.95} />
      </Sequence>
    </>
  );
};

// ============================================================================
// SMOKE OVERLAY
// ============================================================================
const SmokeOverlay: React.FC<{ intensity?: number }> = ({ intensity = 0.4 }) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame * 0.02) * 30;
  
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* Animated fog layers */}
      <div
        style={{
          position: 'absolute',
          inset: '-20%',
          background: `radial-gradient(ellipse 120% 60% at ${50 + drift * 0.5}% 90%, rgba(255,255,255,${0.08 * intensity}), transparent 50%)`,
          filter: 'blur(60px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: '-20%',
          background: `radial-gradient(ellipse 100% 50% at ${50 - drift * 0.3}% 100%, rgba(105,190,40,${0.06 * intensity}), transparent 45%)`,
          filter: 'blur(80px)',
        }}
      />
      {/* Top fog */}
      <div
        style={{
          position: 'absolute',
          inset: '-20%',
          background: `radial-gradient(ellipse 80% 40% at 50% 5%, rgba(0,0,0,${0.5 * intensity}), transparent 50%)`,
          filter: 'blur(40px)',
        }}
      />
    </AbsoluteFill>
  );
};

// ============================================================================
// CINEMATIC VIGNETTE
// ============================================================================
const CinematicVignette: React.FC<{ color?: string }> = ({ color = '#000' }) => {
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 100% 100% at 50% 50%, transparent 30%, ${hexToRgba(color, 0.7)} 100%)`,
        }}
      />
      {/* Letterbox bars for cinematic feel */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, transparent 100%)' }} />
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 1: STADIUM REVEAL
// ============================================================================
const SceneStadiumReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const zoom = interpolate(frame, [0, 90], [1.15, 1], { extrapolateRight: 'clamp' });
  const textOpacity = interpolate(frame, [30, 50], [0, 1], { extrapolateRight: 'clamp' });
  
  const slam = spring({
    frame: Math.max(0, frame - 35),
    fps,
    config: { damping: 12, stiffness: 200, mass: 0.8 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.bg0 }}>
      {/* Stadium background */}
      <AbsoluteFill>
        <Img
          src={ASSETS.stadium}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${zoom})`,
            filter: 'brightness(0.6) contrast(1.1)',
          }}
        />
      </AbsoluteFill>

      <SmokeOverlay intensity={0.6} />
      <CinematicVignette />

      {/* Text overlay */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: textOpacity }}>
        <div
          style={{
            textAlign: 'center',
            transform: `scale(${0.9 + 0.12 * slam})`,
          }}
        >
          <div
            style={{
              fontFamily: 'Arial Black, Impact, sans-serif',
              fontWeight: 900,
              fontSize: THEME.type.giga,
              letterSpacing: '-0.02em',
              lineHeight: 0.9,
              color: THEME.colors.ink,
              textShadow: `0 0 80px ${THEME.colors.cyan}, 0 8px 60px rgba(0,0,0,0.8)`,
            }}
          >
            NO FOOTBALL
            <br />
            THIS WEEK
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 2: JUST KIDDING
// ============================================================================
const SceneJustKidding: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slam = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 280, mass: 0.6 },
  });

  const shake = interpolate(slam, [0.85, 1], [12, 0], { extrapolateLeft: 'clamp' });
  const glitch = Math.sin(frame * 2) * 3 * (1 - slam);

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.bg0 }}>
      {/* Glitch background */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(135deg, ${THEME.colors.bg1} 0%, ${THEME.colors.navy} 100%)`,
        }}
      />
      
      {/* Glitch lines */}
      <AbsoluteFill style={{ opacity: 0.15 }}>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: `${12 + i * 12}%`,
              height: 4,
              background: THEME.colors.green,
              transform: `translateX(${Math.sin((frame + i * 10) * 0.5) * 100}px)`,
              opacity: Math.random() > 0.5 ? 1 : 0,
            }}
          />
        ))}
      </AbsoluteFill>

      <SmokeOverlay intensity={0.3} />
      <CinematicVignette />

      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div
          style={{
            textAlign: 'center',
            transform: `scale(${0.85 + 0.2 * slam}) translate(${glitch + (Math.sin(frame) * shake)}px, ${(Math.cos(frame * 0.9) * shake)}px)`,
          }}
        >
          <div
            style={{
              fontFamily: 'Arial Black, Impact, sans-serif',
              fontWeight: 900,
              fontSize: THEME.type.mega,
              letterSpacing: '-0.02em',
              lineHeight: 0.85,
              color: THEME.colors.green,
              textShadow: `0 0 100px ${THEME.colors.green}, 0 0 200px ${hexToRgba(THEME.colors.green, 0.5)}`,
            }}
          >
            JUST
            <br />
            KIDDING.
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 3: PLANE REVEAL
// ============================================================================
const ScenePlaneReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Plane flies across
  const planeX = interpolate(frame, [0, 60], [-600, 200], { extrapolateRight: 'clamp' });
  const planeY = interpolate(frame, [0, 60], [200, -50], { extrapolateRight: 'clamp' });
  const planeScale = interpolate(frame, [0, 60], [0.6, 1], { extrapolateRight: 'clamp' });

  const titleOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: 'clamp' });
  
  const slam = spring({
    frame: Math.max(0, frame - 25),
    fps,
    config: { damping: 14, stiffness: 220, mass: 0.7 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.bg0 }}>
      {/* US Map background */}
      <AbsoluteFill>
        <Img
          src={ASSETS.usMap}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.5) contrast(1.2)',
          }}
        />
      </AbsoluteFill>

      <SmokeOverlay intensity={0.5} />

      {/* Plane */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Img
          src={ASSETS.plane}
          style={{
            width: 800,
            height: 'auto',
            transform: `translate(${planeX}px, ${planeY}px) scale(${planeScale}) rotate(-8deg)`,
            filter: 'drop-shadow(0 50px 100px rgba(0,0,0,0.6))',
          }}
        />
      </AbsoluteFill>

      <CinematicVignette />

      {/* Title */}
      <AbsoluteFill 
        style={{ 
          justifyContent: 'flex-end', 
          alignItems: 'center',
          paddingBottom: THEME.safe.bottom + 100,
          opacity: titleOpacity,
        }}
      >
        <div
          style={{
            textAlign: 'center',
            transform: `scale(${0.9 + 0.12 * slam})`,
          }}
        >
          <div
            style={{
              fontFamily: 'Arial Black, Impact, sans-serif',
              fontWeight: 900,
              fontSize: 60,
              letterSpacing: '0.3em',
              color: THEME.colors.inkDim,
              marginBottom: 10,
            }}
          >
            THE
          </div>
          <div
            style={{
              fontFamily: 'Arial Black, Impact, sans-serif',
              fontWeight: 900,
              fontSize: THEME.type.giga,
              letterSpacing: '-0.02em',
              lineHeight: 0.85,
              color: THEME.colors.ink,
              textShadow: `0 0 80px ${THEME.colors.green}`,
            }}
          >
            DARK SIDE
          </div>
          <div
            style={{
              marginTop: 20,
              height: 6,
              width: 500,
              marginLeft: 'auto',
              marginRight: 'auto',
              borderRadius: 999,
              background: `linear-gradient(90deg, transparent, ${THEME.colors.green}, transparent)`,
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 4: PLAYER HEROES
// ============================================================================
const ScenePlayerHeroes: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 4 players, 1 second each
  const players = [
    PLAYERS[0], // Lawrence - card version with background
    PLAYERS[7], // Witherspoon
    PLAYERS[1], // Williams
    PLAYERS[4], // Nwosu
  ];
  
  const framesPerPlayer = 30;
  const idx = Math.min(Math.floor(frame / framesPerPlayer), players.length - 1);
  const segmentFrame = frame - idx * framesPerPlayer;

  const player = players[idx];
  if (!player) return null;

  const enter = spring({
    frame: segmentFrame,
    fps,
    config: { damping: 16, stiffness: 200, mass: 0.8 },
  });

  const slideX = interpolate(segmentFrame, [0, framesPerPlayer], [80, -80]);
  const opacity = interpolate(segmentFrame, [0, 5, 25, 30], [0, 1, 1, 0]);
  const zoom = interpolate(segmentFrame, [0, framesPerPlayer], [1.05, 1.15]);

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.bg0 }}>
      {/* Player card as full background */}
      <AbsoluteFill style={{ opacity }}>
        <Img
          src={player.image}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `translateX(${slideX}px) scale(${zoom})`,
            filter: 'brightness(0.8) contrast(1.1)',
          }}
        />
      </AbsoluteFill>

      <SmokeOverlay intensity={0.5} />
      <CinematicVignette />

      {/* Corner frames */}
      <CornerFrames />

      {/* Player info */}
      <AbsoluteFill
        style={{
          padding: THEME.safe.left,
          paddingBottom: THEME.safe.bottom,
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
          opacity,
        }}
      >
        <div style={{ transform: `scale(${0.95 + 0.08 * enter})` }}>
          <div
            style={{
              fontFamily: 'Arial Black, Impact, sans-serif',
              fontWeight: 900,
              fontSize: 100,
              letterSpacing: '-0.02em',
              lineHeight: 0.9,
              color: THEME.colors.ink,
              textShadow: `0 0 60px ${hexToRgba(THEME.colors.green, 0.5)}, 0 8px 40px rgba(0,0,0,0.8)`,
            }}
          >
            {player.lastName}
          </div>
          <div
            style={{
              marginTop: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 20,
            }}
          >
            <div
              style={{
                fontFamily: 'Arial, sans-serif',
                fontWeight: 800,
                fontSize: 36,
                letterSpacing: '0.15em',
                color: THEME.colors.green,
                textShadow: `0 0 30px ${THEME.colors.green}`,
              }}
            >
              #{player.jersey}
            </div>
            <div
              style={{
                fontFamily: 'Arial, sans-serif',
                fontWeight: 700,
                fontSize: 32,
                letterSpacing: '0.1em',
                color: THEME.colors.inkDim,
              }}
            >
              {player.position}
            </div>
          </div>
        </div>
      </AbsoluteFill>

      {/* Top label */}
      <AbsoluteFill
        style={{
          padding: THEME.safe.left,
          paddingTop: THEME.safe.top,
          opacity,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <LabelPill text="DARK SIDE DEFENSE" />
          <LabelPill text="SELECT" accent />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 5: ACTION WORDS
// ============================================================================
const SceneActionWords: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = ['TACKLE', 'DEFEND', 'DOMINATE'];
  const colors = [THEME.colors.green, THEME.colors.cyan, THEME.colors.green];
  
  const framesPerWord = 20;
  const idx = Math.min(Math.floor(frame / framesPerWord), words.length - 1);
  const segmentFrame = frame - idx * framesPerWord;

  const word = words[idx];
  const color = colors[idx];

  const slam = spring({
    frame: segmentFrame,
    fps,
    config: { damping: 10, stiffness: 300, mass: 0.5 },
  });

  const shake = interpolate(slam, [0.85, 1], [10, 0], { extrapolateLeft: 'clamp' });
  const opacity = interpolate(segmentFrame, [0, 3, 17, 20], [0, 1, 1, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.bg0 }}>
      {/* Stadium background faded */}
      <AbsoluteFill>
        <Img
          src={ASSETS.stadium}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.25) contrast(1.1) blur(3px)',
          }}
        />
      </AbsoluteFill>

      <SmokeOverlay intensity={0.7} />
      <CinematicVignette />

      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div
          style={{
            textAlign: 'center',
            transform: `scale(${0.85 + 0.2 * slam}) translate(${(Math.sin(frame) * shake)}px, 0)`,
            opacity,
          }}
        >
          <div
            style={{
              fontFamily: 'Arial Black, Impact, sans-serif',
              fontWeight: 900,
              fontSize: THEME.type.mega,
              letterSpacing: '-0.02em',
              color: color,
              textShadow: `0 0 100px ${color}, 0 0 200px ${hexToRgba(color, 0.5)}`,
            }}
          >
            {word}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 6: SF SUPER BOWL
// ============================================================================
const SceneSFSuperBowl: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const zoom = interpolate(frame, [0, 120], [1.1, 1], { extrapolateRight: 'clamp' });
  
  const pop = spring({
    frame: Math.max(0, frame - 20),
    fps,
    config: { damping: 14, stiffness: 220, mass: 0.7 },
  });

  const sweepX = interpolate(frame, [0, 80], [-600, 600]);

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.bg0 }}>
      {/* SF Golden Gate background */}
      <AbsoluteFill>
        <Img
          src={ASSETS.sanFrancisco}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${zoom})`,
            filter: 'brightness(0.55) contrast(1.15)',
          }}
        />
      </AbsoluteFill>

      <SmokeOverlay intensity={0.6} />
      <CinematicVignette />

      {/* Content */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', transform: `scale(${0.92 + 0.1 * pop})` }}>
          {/* WIN */}
          <div
            style={{
              fontFamily: 'Arial Black, Impact, sans-serif',
              fontWeight: 900,
              fontSize: 180,
              letterSpacing: '-0.02em',
              color: THEME.colors.ink,
              textShadow: `0 0 100px ${THEME.colors.gold}, 0 8px 60px rgba(0,0,0,0.8)`,
              marginBottom: 30,
            }}
          >
            WIN
          </div>

          {/* Ticket card */}
          <div
            style={{
              position: 'relative',
              width: 850,
              padding: '45px 55px',
              background: `linear-gradient(135deg, ${THEME.colors.gold} 0%, ${THEME.colors.goldDark} 100%)`,
              borderRadius: 36,
              boxShadow: `0 0 120px ${hexToRgba(THEME.colors.gold, 0.5)}, 0 40px 100px rgba(0,0,0,0.6)`,
              transform: 'rotate(-2deg)',
              overflow: 'hidden',
            }}
          >
            {/* Shimmer */}
            <div
              style={{
                position: 'absolute',
                inset: -100,
                transform: `translateX(${sweepX}px) rotate(15deg)`,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                opacity: 0.7,
              }}
            />

            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: 900,
                  fontSize: 28,
                  letterSpacing: '0.15em',
                  color: THEME.colors.navy,
                  marginBottom: 12,
                }}
              >
                {SUPER_BOWL.name}
              </div>
              <div
                style={{
                  fontFamily: 'Arial Black, Impact, sans-serif',
                  fontWeight: 900,
                  fontSize: 80,
                  letterSpacing: '-0.02em',
                  color: THEME.colors.navy,
                  lineHeight: 1,
                }}
              >
                2 TICKETS
              </div>
              <div
                style={{
                  marginTop: 14,
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: 700,
                  fontSize: 24,
                  letterSpacing: '0.1em',
                  color: 'rgba(0,34,68,0.7)',
                }}
              >
                {SUPER_BOWL.date} • {SUPER_BOWL.location}
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 7: CTA
// ============================================================================
const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Plane lands
  const planeY = interpolate(frame, [0, 60], [-400, 50], { extrapolateRight: 'clamp' });
  const planeScale = interpolate(frame, [0, 60], [0.7, 0.9], { extrapolateRight: 'clamp' });

  const enter = spring({
    frame: Math.max(0, frame - 30),
    fps,
    config: { damping: 16, stiffness: 180, mass: 0.8 },
  });

  const pulse = 0.5 + 0.3 * Math.sin(frame * 0.15);

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.bg0 }}>
      {/* Seattle skyline background */}
      <AbsoluteFill>
        <Img
          src={ASSETS.seattle}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.4) contrast(1.1)',
          }}
        />
      </AbsoluteFill>

      <SmokeOverlay intensity={0.5} />

      {/* Plane */}
      <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: 100 }}>
        <Img
          src={ASSETS.plane}
          style={{
            width: 600,
            height: 'auto',
            transform: `translateY(${planeY}px) scale(${planeScale}) rotate(-5deg)`,
            filter: 'drop-shadow(0 30px 80px rgba(0,0,0,0.5))',
          }}
        />
      </AbsoluteFill>

      <CinematicVignette />

      {/* CTA Content */}
      <AbsoluteFill
        style={{
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: THEME.safe.bottom + 50,
        }}
      >
        <div style={{ textAlign: 'center', transform: `scale(${0.95 + 0.08 * enter})` }}>
          <div
            style={{
              fontFamily: 'Arial Black, Impact, sans-serif',
              fontWeight: 900,
              fontSize: THEME.type.huge,
              letterSpacing: '-0.02em',
              color: THEME.colors.ink,
              textShadow: `0 0 ${60 + 40 * pulse}px ${THEME.colors.green}, 0 8px 40px rgba(0,0,0,0.8)`,
              marginBottom: 20,
            }}
          >
            PLAY NOW
          </div>

          {/* Pulsing button */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px 60px',
              borderRadius: 999,
              background: `linear-gradient(135deg, ${THEME.colors.green} 0%, #4CAF50 100%)`,
              boxShadow: `0 0 ${40 + 30 * pulse}px ${THEME.colors.green}, 0 20px 60px rgba(0,0,0,0.5)`,
            }}
          >
            <div
              style={{
                fontFamily: 'Arial Black, Impact, sans-serif',
                fontWeight: 900,
                fontSize: 36,
                letterSpacing: '0.1em',
                color: THEME.colors.navy,
              }}
            >
              ENTER THE GIVEAWAY
            </div>
          </div>

          <div
            style={{
              marginTop: 30,
              fontFamily: 'Arial, sans-serif',
              fontWeight: 700,
              fontSize: 24,
              letterSpacing: '0.1em',
              color: THEME.colors.inkDim,
            }}
          >
            game.drinksip.com
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================
const CornerFrames: React.FC = () => {
  const pad = 40;
  const len = 70;
  const thick = 4;

  const corner = (pos: React.CSSProperties) => (
    <div style={{ position: 'absolute', ...pos }}>
      <div style={{ position: 'absolute', width: len, height: thick, background: 'rgba(255,255,255,0.25)' }} />
      <div style={{ position: 'absolute', width: thick, height: len, background: 'rgba(255,255,255,0.25)' }} />
    </div>
  );

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {corner({ left: pad, top: pad })}
      {corner({ right: pad, top: pad, transform: 'scaleX(-1)' })}
      {corner({ left: pad, bottom: pad, transform: 'scaleY(-1)' })}
      {corner({ right: pad, bottom: pad, transform: 'scale(-1,-1)' })}
    </AbsoluteFill>
  );
};

const LabelPill: React.FC<{ text: string; accent?: boolean }> = ({ text, accent }) => {
  return (
    <div
      style={{
        padding: '14px 20px',
        borderRadius: 999,
        border: '1px solid rgba(255,255,255,0.2)',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(10px)',
        color: accent ? THEME.colors.green : THEME.colors.ink,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 800,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        fontSize: 22,
      }}
    >
      {text}
    </div>
  );
};

// ============================================================================
// MAIN COMPOSITION - 20 SECONDS
// ============================================================================
export const SplashTrailerV2: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* AUDIO LAYER */}
      <AudioLayer />

      {/* Scene 1: Stadium Reveal (0-3s) */}
      <Sequence from={SCENES.stadiumReveal.start} durationInFrames={SCENES.stadiumReveal.end - SCENES.stadiumReveal.start}>
        <SceneStadiumReveal />
      </Sequence>

      {/* Scene 2: Just Kidding (3-4s) */}
      <Sequence from={SCENES.justKidding.start} durationInFrames={SCENES.justKidding.end - SCENES.justKidding.start}>
        <SceneJustKidding />
      </Sequence>

      {/* Scene 3: Plane Reveal (4-6s) */}
      <Sequence from={SCENES.planeReveal.start} durationInFrames={SCENES.planeReveal.end - SCENES.planeReveal.start}>
        <ScenePlaneReveal />
      </Sequence>

      {/* Scene 4: Player Heroes (6-10s) */}
      <Sequence from={SCENES.players.start} durationInFrames={SCENES.players.end - SCENES.players.start}>
        <ScenePlayerHeroes />
      </Sequence>

      {/* Scene 5: Action Words (10-12s) */}
      <Sequence from={SCENES.actionWords.start} durationInFrames={SCENES.actionWords.end - SCENES.actionWords.start}>
        <SceneActionWords />
      </Sequence>

      {/* Scene 6: SF Super Bowl (12-16s) */}
      <Sequence from={SCENES.sfReveal.start} durationInFrames={SCENES.sfReveal.end - SCENES.sfReveal.start}>
        <SceneSFSuperBowl />
      </Sequence>

      {/* Scene 7: CTA (16-20s) */}
      <Sequence from={SCENES.cta.start} durationInFrames={SCENES.cta.end - SCENES.cta.start}>
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};

export default SplashTrailerV2;
