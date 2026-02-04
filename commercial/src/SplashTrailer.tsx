/**
 * DARK SIDE DEFENSE — SPLASH TRAILER
 * 
 * 15-second cinematic trailer designed for splash page
 * Resolution: 1080x1920 (9:16 vertical mobile)
 * 
 * Design principles:
 * - High energy, suspenseful
 * - Large jumbo text - "Dark Side" feeling
 * - Player showcase - the heroes
 * - Quick cuts, dramatic reveals
 * - Ends with anticipation for the game
 * 
 * Flow (15 seconds @ 30fps = 450 frames):
 * 1. 0-2s: BLACK → "THE DARK SIDE" (dramatic reveal)
 * 2. 2-5s: Player Hero Shots (3 players, huge, cinematic)
 * 3. 5-7s: "DEFENSE" slam (title lock)
 * 4. 7-10s: Action words rapid fire (TACKLE / DEFEND / DOMINATE)
 * 5. 10-13s: "WIN SUPER BOWL TICKETS" (gold, premium)
 * 6. 13-15s: "ENTER NOW" pulse (anticipation for CTA)
 */
import React from 'react';
import { 
  AbsoluteFill, 
  Sequence, 
  useCurrentFrame, 
  useVideoConfig,
  interpolate, 
  spring,
  Img,
  Audio,
} from 'remotion';
import { 
  PLAYERS_TRANSPARENT,
  COLORS,
  SUPER_BOWL,
} from './assets';

// ============================================================================
// THEME
// ============================================================================
const THEME = {
  w: 1080,
  h: 1920,
  fps: 30,
  
  safe: {
    top: 110,
    bottom: 220,
    left: 70,
    right: 70,
  },
  
  colors: {
    bg0: '#030508',
    bg1: '#0A0D14',
    ink: '#F6F7FB',
    inkDim: 'rgba(246,247,251,0.7)',
    green: '#69BE28',
    greenDim: 'rgba(105,190,40,0.4)',
    gold: '#FFD700',
    goldDim: 'rgba(255,215,0,0.5)',
    navy: '#002244',
    cyan: '#00E5FF',
  },
  
  type: {
    mega: 200,
    giga: 140,
    huge: 100,
    big: 70,
    mid: 50,
    small: 34,
  },
};

// ============================================================================
// TIMING - 15 seconds @ 30fps = 450 frames
// ============================================================================
const FPS = 30;
const SCENES = {
  darkSide: { start: 0, end: 2 * FPS },              // 0-2s: "THE DARK SIDE"
  players: { start: 2 * FPS, end: 5 * FPS },          // 2-5s: Player hero shots
  defense: { start: 5 * FPS, end: 7 * FPS },          // 5-7s: "DEFENSE" slam
  actionWords: { start: 7 * FPS, end: 10 * FPS },     // 7-10s: TACKLE/DEFEND/DOMINATE
  giveaway: { start: 10 * FPS, end: 13 * FPS },       // 10-13s: WIN TICKETS
  enterNow: { start: 13 * FPS, end: 15 * FPS },       // 13-15s: ENTER NOW pulse
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
// BACKGROUND FX
// ============================================================================
const BackgroundFX: React.FC<{
  intensity?: number;
  accentColor?: string;
}> = ({ intensity = 1, accentColor = THEME.colors.green }) => {
  const frame = useCurrentFrame();
  const t = frame / (FPS * 15);
  const vignette = 0.4 + intensity * 0.2;

  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(1000px 1000px at 50% 30%, ${hexToRgba(accentColor, 0.15)}, transparent 60%),
          radial-gradient(800px 800px at 80% 70%, rgba(0,0,0,0.4), transparent 70%),
          linear-gradient(180deg, ${THEME.colors.bg1}, ${THEME.colors.bg0})
        `,
      }}
    >
      {/* Subtle noise/grain */}
      <AbsoluteFill
        style={{
          opacity: 0.06,
          background: 'repeating-linear-gradient(180deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 2px, transparent 4px)',
          transform: `translateY(${Math.sin(t * 10) * 4}px)`,
        }}
      />
      {/* Heavy vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(1200px 1600px at 50% 50%, transparent 40%, rgba(0,0,0,${vignette}) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 1: "THE DARK SIDE" REVEAL
// ============================================================================
const SceneDarkSide: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Dramatic fade in
  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  
  // Spring slam for text
  const slam = spring({
    frame: Math.max(0, frame - 10),
    fps,
    config: { damping: 12, stiffness: 200, mass: 0.8 },
  });

  // Shake effect
  const shake = interpolate(slam, [0.85, 1], [6, 0], { extrapolateLeft: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.bg0 }}>
      <BackgroundFX intensity={1.2} accentColor={THEME.colors.green} />
      
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: fadeIn }}>
        <div
          style={{
            textAlign: 'center',
            transform: `scale(${0.9 + 0.15 * slam}) translate(${(Math.sin(frame * 0.8) * shake)}px, ${(Math.cos(frame * 0.7) * shake)}px)`,
          }}
        >
          {/* "THE" */}
          <div
            style={{
              fontFamily: 'Arial Black, Impact, sans-serif',
              fontWeight: 900,
              fontSize: 60,
              letterSpacing: '0.4em',
              color: THEME.colors.inkDim,
              marginBottom: 10,
            }}
          >
            THE
          </div>
          
          {/* "DARK SIDE" */}
          <div
            style={{
              fontFamily: 'Arial Black, Impact, sans-serif',
              fontWeight: 900,
              fontSize: THEME.type.mega,
              letterSpacing: '-0.02em',
              lineHeight: 0.85,
              color: THEME.colors.ink,
              textShadow: `0 0 80px ${THEME.colors.green}, 0 0 120px ${hexToRgba(THEME.colors.green, 0.5)}`,
            }}
          >
            DARK
            <br />
            SIDE
          </div>

          {/* Underline accent */}
          <div
            style={{
              marginTop: 30,
              height: 8,
              width: 600,
              marginLeft: 'auto',
              marginRight: 'auto',
              borderRadius: 999,
              background: `linear-gradient(90deg, transparent, ${THEME.colors.green}, transparent)`,
              opacity: 0.9,
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 2: PLAYER HERO SHOTS
// ============================================================================
const ScenePlayers: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Show 3 players, each for 1 second
  const players = [
    PLAYERS_TRANSPARENT[0], // Lawrence
    PLAYERS_TRANSPARENT[7], // Witherspoon
    PLAYERS_TRANSPARENT[1], // Williams
  ];
  
  const framesPerPlayer = 30; // 1 second each
  const idx = Math.min(Math.floor(frame / framesPerPlayer), players.length - 1);
  const segmentFrame = frame - idx * framesPerPlayer;
  const progress = segmentFrame / framesPerPlayer;

  const player = players[idx];
  if (!player) return null;

  // Entrance spring
  const enter = spring({
    frame: segmentFrame,
    fps,
    config: { damping: 16, stiffness: 200, mass: 0.8 },
  });

  // Slide and fade
  const slideX = interpolate(progress, [0, 1], [120, -120]);
  const opacity = interpolate(progress, [0, 0.1, 0.85, 1], [0, 1, 1, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.bg0 }}>
      <BackgroundFX intensity={1.0} accentColor={THEME.colors.cyan} />
      
      {/* Player image - HUGE */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div
          style={{
            transform: `translateX(${slideX}px) scale(${0.95 + 0.08 * enter})`,
            opacity,
          }}
        >
          <Img
            src={player.image}
            style={{
              height: 1400,
              width: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 50px 150px rgba(0,0,0,0.6))',
            }}
          />
        </div>
      </AbsoluteFill>

      {/* Player name overlay */}
      <AbsoluteFill
        style={{
          padding: THEME.safe.left,
          paddingBottom: THEME.safe.bottom,
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
          opacity,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'Arial Black, Impact, sans-serif',
              fontWeight: 900,
              fontSize: 90,
              letterSpacing: '-0.02em',
              lineHeight: 0.9,
              color: THEME.colors.ink,
              textShadow: `0 0 40px ${hexToRgba(THEME.colors.green, 0.4)}`,
            }}
          >
            {player.lastName}
          </div>
          <div
            style={{
              marginTop: 8,
              fontFamily: 'Arial, sans-serif',
              fontWeight: 800,
              fontSize: 36,
              letterSpacing: '0.15em',
              color: THEME.colors.green,
            }}
          >
            #{player.jersey} • {player.position}
          </div>
        </div>
      </AbsoluteFill>

      {/* Corner frame elements */}
      <CornerFrames />
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 3: "DEFENSE" SLAM
// ============================================================================
const SceneDefense: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slam = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 280, mass: 0.7 },
  });

  const shake = interpolate(slam, [0.9, 1], [10, 0], { extrapolateLeft: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.bg0 }}>
      <BackgroundFX intensity={1.4} accentColor={THEME.colors.green} />
      
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div
          style={{
            textAlign: 'center',
            transform: `scale(${0.85 + 0.2 * slam}) translate(${(Math.sin(frame) * shake)}px, ${(Math.cos(frame * 0.9) * shake)}px)`,
          }}
        >
          <div
            style={{
              fontFamily: 'Arial Black, Impact, sans-serif',
              fontWeight: 900,
              fontSize: THEME.type.mega,
              letterSpacing: '-0.02em',
              color: THEME.colors.green,
              textShadow: `0 0 100px ${THEME.colors.green}, 0 0 200px ${hexToRgba(THEME.colors.green, 0.6)}`,
            }}
          >
            DEFENSE
          </div>

          {/* Glowing bar */}
          <div
            style={{
              marginTop: 30,
              height: 10,
              width: 700,
              marginLeft: 'auto',
              marginRight: 'auto',
              borderRadius: 999,
              background: THEME.colors.green,
              boxShadow: `0 0 40px ${THEME.colors.green}, 0 0 80px ${hexToRgba(THEME.colors.green, 0.6)}`,
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 4: ACTION WORDS (TACKLE / DEFEND / DOMINATE)
// ============================================================================
const SceneActionWords: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = ['TACKLE', 'DEFEND', 'DOMINATE'];
  const colors = [THEME.colors.green, THEME.colors.cyan, THEME.colors.green];
  
  const framesPerWord = 30; // 1 second each
  const idx = Math.min(Math.floor(frame / framesPerWord), words.length - 1);
  const segmentFrame = frame - idx * framesPerWord;

  const word = words[idx];
  const color = colors[idx];

  // Slam in effect
  const slam = spring({
    frame: segmentFrame,
    fps,
    config: { damping: 12, stiffness: 300, mass: 0.6 },
  });

  const shake = interpolate(slam, [0.85, 1], [8, 0], { extrapolateLeft: 'clamp' });
  const opacity = interpolate(segmentFrame, [0, 5, 25, 30], [0, 1, 1, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.bg0 }}>
      <BackgroundFX intensity={1.3} accentColor={color} />
      
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div
          style={{
            textAlign: 'center',
            transform: `scale(${0.88 + 0.18 * slam}) translate(${(Math.sin(frame) * shake)}px, 0)`,
            opacity,
          }}
        >
          <div
            style={{
              fontFamily: 'Arial Black, Impact, sans-serif',
              fontWeight: 900,
              fontSize: THEME.type.giga,
              letterSpacing: '-0.02em',
              color: color,
              textShadow: `0 0 60px ${color}, 0 0 120px ${hexToRgba(color, 0.5)}`,
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
// SCENE 5: WIN TICKETS
// ============================================================================
const SceneGiveaway: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 220, mass: 0.7 },
  });

  // Gold shimmer sweep
  const sweepX = interpolate(frame, [0, 60], [-600, 600]);

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.bg0 }}>
      <BackgroundFX intensity={1.5} accentColor={THEME.colors.gold} />
      
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div
          style={{
            textAlign: 'center',
            transform: `scale(${0.92 + 0.12 * pop})`,
          }}
        >
          {/* WIN */}
          <div
            style={{
              fontFamily: 'Arial Black, Impact, sans-serif',
              fontWeight: 900,
              fontSize: 180,
              letterSpacing: '-0.02em',
              color: THEME.colors.ink,
              textShadow: `0 0 80px ${THEME.colors.gold}`,
              marginBottom: 20,
            }}
          >
            WIN
          </div>

          {/* Ticket card */}
          <div
            style={{
              position: 'relative',
              width: 850,
              padding: '40px 50px',
              background: `linear-gradient(135deg, ${THEME.colors.gold} 0%, #B8860B 100%)`,
              borderRadius: 36,
              boxShadow: `0 0 100px ${hexToRgba(THEME.colors.gold, 0.5)}, 0 40px 100px rgba(0,0,0,0.5)`,
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

            <div style={{ position: 'relative', zIndex: 1 }}>
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
// SCENE 6: ENTER NOW (anticipation pulse)
// ============================================================================
const SceneEnterNow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pulse = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 180, mass: 0.8 },
  });

  // Pulsing glow
  const glowIntensity = 0.5 + 0.3 * Math.sin(frame * 0.15);

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.bg0 }}>
      <BackgroundFX intensity={1.0} accentColor={THEME.colors.green} />
      
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div
          style={{
            textAlign: 'center',
            transform: `scale(${0.95 + 0.08 * pulse})`,
          }}
        >
          {/* ENTER NOW */}
          <div
            style={{
              fontFamily: 'Arial Black, Impact, sans-serif',
              fontWeight: 900,
              fontSize: THEME.type.giga,
              letterSpacing: '-0.02em',
              color: THEME.colors.ink,
              textShadow: `0 0 ${60 + 40 * glowIntensity}px ${THEME.colors.green}`,
            }}
          >
            ENTER
            <br />
            NOW
          </div>

          {/* Pulsing ring */}
          <div
            style={{
              marginTop: 40,
              width: 200,
              height: 200,
              marginLeft: 'auto',
              marginRight: 'auto',
              borderRadius: '50%',
              border: `4px solid ${THEME.colors.green}`,
              boxShadow: `0 0 ${30 + 20 * glowIntensity}px ${THEME.colors.green}, inset 0 0 ${20 + 15 * glowIntensity}px ${hexToRgba(THEME.colors.green, 0.3)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderTop: '40px solid transparent',
                borderBottom: '40px solid transparent',
                borderLeft: `60px solid ${THEME.colors.green}`,
                marginLeft: 15,
                filter: `drop-shadow(0 0 20px ${THEME.colors.green})`,
              }}
            />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// CORNER FRAMES (Xbox-style)
// ============================================================================
const CornerFrames: React.FC = () => {
  const pad = 40;
  const len = 70;
  const thick = 4;

  const corner = (pos: React.CSSProperties) => (
    <div style={{ position: 'absolute', ...pos }}>
      <div style={{ position: 'absolute', width: len, height: thick, background: 'rgba(255,255,255,0.2)' }} />
      <div style={{ position: 'absolute', width: thick, height: len, background: 'rgba(255,255,255,0.2)' }} />
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

// ============================================================================
// MAIN COMPOSITION - 15 SECONDS
// ============================================================================
export const SplashTrailer: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Scene 1: THE DARK SIDE (0-2s) */}
      <Sequence from={SCENES.darkSide.start} durationInFrames={SCENES.darkSide.end - SCENES.darkSide.start}>
        <SceneDarkSide />
      </Sequence>

      {/* Scene 2: Player Hero Shots (2-5s) */}
      <Sequence from={SCENES.players.start} durationInFrames={SCENES.players.end - SCENES.players.start}>
        <ScenePlayers />
      </Sequence>

      {/* Scene 3: DEFENSE (5-7s) */}
      <Sequence from={SCENES.defense.start} durationInFrames={SCENES.defense.end - SCENES.defense.start}>
        <SceneDefense />
      </Sequence>

      {/* Scene 4: Action Words (7-10s) */}
      <Sequence from={SCENES.actionWords.start} durationInFrames={SCENES.actionWords.end - SCENES.actionWords.start}>
        <SceneActionWords />
      </Sequence>

      {/* Scene 5: WIN TICKETS (10-13s) */}
      <Sequence from={SCENES.giveaway.start} durationInFrames={SCENES.giveaway.end - SCENES.giveaway.start}>
        <SceneGiveaway />
      </Sequence>

      {/* Scene 6: ENTER NOW (13-15s) */}
      <Sequence from={SCENES.enterNow.start} durationInFrames={SCENES.enterNow.end - SCENES.enterNow.start}>
        <SceneEnterNow />
      </Sequence>
    </AbsoluteFill>
  );
};

export default SplashTrailer;
