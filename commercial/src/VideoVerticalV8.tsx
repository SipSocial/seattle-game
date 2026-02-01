/**
 * DARK SIDE DEFENSE — V8 "XBOX × APPLE"
 * 
 * Full-viewport, giant text, clean UI, oversized everything.
 * No stacking. No tiny cards. One player at a time, centered and HUGE.
 * 
 * Flow (30 seconds):
 * 1. NO FOOTBALL THIS WEEK (0-2s)
 * 2. JUST KIDDING (2-3s)
 * 3. THE DARK SIDE GAME (3-6s)
 * 4. Player carousel - one at a time, huge (6-14s)
 * 5. TACKLE / DEFEND / DOMINATE slams (14-18s)
 * 6. WIN 2 SUPER BOWL TICKETS (18-24s)
 * 7. CTA with game.drinksip.com + QR (24-30s)
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
} from 'remotion';
import { 
  PLAYERS_TRANSPARENT,
  DRINKSIP, 
  GAME, 
  SUPER_BOWL,
} from './assets';

// ============================================================================
// THEME - Xbox × Apple inspired
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
    bg0: '#05060A',
    bg1: '#0A0D14',
    ink: '#F6F7FB',
    inkDim: 'rgba(246,247,251,0.78)',
    accent: '#69BE28',  // Seahawks green
    accent2: '#00E5FF', // Cyan
    gold: '#FFD700',
    gold2: '#B8860B',
    navy: '#002244',
  },
  
  type: {
    mega: 160,
    giga: 130,
    huge: 100,
    big: 80,
    mid: 50,
    small: 34,
    micro: 26,
  },
  
  radius: {
    xl: 44,
    lg: 34,
    md: 26,
  },
};

// ============================================================================
// TIMING - 30 seconds @ 30fps = 900 frames
// ============================================================================
const FPS = 30;
const SCENES = {
  noFootball: { start: 0, end: 2 * FPS },           // 0-2s
  justKidding: { start: 2 * FPS, end: 3 * FPS },    // 2-3s
  gameTitle: { start: 3 * FPS, end: 6 * FPS },      // 3-6s
  carousel: { start: 6 * FPS, end: 14 * FPS },      // 6-14s (8s, ~1.3s per player)
  tackle: { start: 14 * FPS, end: 15.3 * FPS },     // 14-15.3s
  defend: { start: 15.3 * FPS, end: 16.6 * FPS },   // 15.3-16.6s
  dominate: { start: 16.6 * FPS, end: 18 * FPS },   // 16.6-18s
  winTickets: { start: 18 * FPS, end: 24 * FPS },   // 18-24s
  cta: { start: 24 * FPS, end: 30 * FPS },          // 24-30s
};

// ============================================================================
// BACKGROUND FX
// ============================================================================
const BackgroundFX: React.FC<{
  intensity?: number;
  accentMode?: 'green' | 'cyan' | 'gold';
}> = ({ intensity = 1, accentMode = 'green' }) => {
  const frame = useCurrentFrame();
  const t = frame / (FPS * 30);

  const vignette = interpolate(intensity, [0, 1], [0.25, 0.55]);
  const glow = interpolate(intensity, [0, 1], [0.18, 0.35]);

  const accent =
    accentMode === 'cyan'
      ? THEME.colors.accent2
      : accentMode === 'gold'
        ? THEME.colors.gold
        : THEME.colors.accent;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(1200px 1200px at 50% 15%, rgba(255,255,255,0.06), transparent 60%),
        radial-gradient(900px 900px at 20% 60%, ${hexToRgba(accent, 0.12 + glow * 0.3)}, transparent 65%),
        radial-gradient(900px 900px at 80% 70%, rgba(0,0,0,0.25), transparent 70%),
        linear-gradient(180deg, ${THEME.colors.bg1}, ${THEME.colors.bg0})`,
      }}
    >
      {/* Subtle scanline */}
      <AbsoluteFill
        style={{
          opacity: 0.08 * intensity,
          background:
            'repeating-linear-gradient(180deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 2px, transparent 6px)',
          transform: `translateY(${Math.sin(t * 8) * 6}px)`,
        }}
      />
      {/* Vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(1200px 1600px at 50% 45%, transparent 55%, rgba(0,0,0,${vignette}) 92%)`,
        }}
      />
    </AbsoluteFill>
  );
};

const hexToRgba = (hex: string, a: number) => {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${a})`;
};

// ============================================================================
// FRAME WRAPPER
// ============================================================================
const Frame: React.FC<{
  children: React.ReactNode;
  accentMode?: 'green' | 'cyan' | 'gold';
  intensity?: number;
}> = ({ children, accentMode = 'green', intensity = 1 }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.bg0 }}>
      <BackgroundFX intensity={intensity} accentMode={accentMode} />
      <AbsoluteFill>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// FULL-BLEED TITLE
// ============================================================================
const FullBleedTitle: React.FC<{
  lines: string[];
  accentWord?: string;
  accentMode?: 'green' | 'cyan' | 'gold';
  slam?: boolean;
  sub?: string;
}> = ({ lines, accentWord, accentMode = 'green', slam = true, sub }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = slam
    ? spring({
        frame,
        fps,
        config: { damping: 14, stiffness: 240, mass: 0.7 },
      })
    : 1;

  const shake = slam ? interpolate(s, [0.9, 1], [2.5, 0]) : 0;

  const accent =
    accentMode === 'cyan'
      ? THEME.colors.accent2
      : accentMode === 'gold'
        ? THEME.colors.gold
        : THEME.colors.accent;

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          width: '100%',
          textAlign: 'center',
          transform: `scale(${0.92 + 0.12 * s}) translate(${(Math.sin(frame * 0.7) * shake) / 2}px, ${(Math.cos(frame * 0.65) * shake) / 2}px)`,
          transformOrigin: '50% 50%',
          padding: `0 ${THEME.safe.left}px`,
        }}
      >
        {lines.map((ln, i) => (
          <div
            key={i}
            style={{
              fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              lineHeight: 0.88,
              fontSize: i === 0 && lines.length > 1 ? THEME.type.mega : THEME.type.giga,
              color: THEME.colors.ink,
              textTransform: 'uppercase',
            }}
          >
            {accentWord ? (
              <AccentText text={ln} accentWord={accentWord} accent={accent} ink={THEME.colors.ink} />
            ) : (
              ln
            )}
          </div>
        ))}

        {sub && (
          <div
            style={{
              marginTop: 28,
              fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
              fontWeight: 700,
              letterSpacing: '0.02em',
              fontSize: THEME.type.mid,
              lineHeight: 1.05,
              color: THEME.colors.inkDim,
              textTransform: 'uppercase',
            }}
          >
            {sub}
          </div>
        )}

        {/* Underline bar */}
        <div
          style={{
            marginTop: 34,
            marginLeft: 'auto',
            marginRight: 'auto',
            height: 10,
            width: '88%',
            maxWidth: 980,
            borderRadius: 999,
            background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
            opacity: 0.9,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

const AccentText: React.FC<{
  text: string;
  accentWord: string;
  accent: string;
  ink: string;
}> = ({ text, accentWord, accent, ink }) => {
  const parts = text.split(new RegExp(`(${escapeRegExp(accentWord)})`, 'i'));
  return (
    <>
      {parts.map((p, idx) => {
        const isAcc = p.toLowerCase() === accentWord.toLowerCase();
        return (
          <span
            key={idx}
            style={{
              color: isAcc ? accent : ink,
              textShadow: isAcc ? `0 0 26px ${accent}` : undefined,
            }}
          >
            {p}
          </span>
        );
      })}
    </>
  );
};

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ============================================================================
// UI CORNERS (Xbox-style frame)
// ============================================================================
const UICorners: React.FC = () => {
  const pad = 46;
  const len = 86;
  const thick = 6;

  const corner = (pos: React.CSSProperties) => (
    <div style={{ position: 'absolute', ...pos }}>
      <div
        style={{
          position: 'absolute',
          width: len,
          height: thick,
          background: 'rgba(255,255,255,0.18)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: thick,
          height: len,
          background: 'rgba(255,255,255,0.18)',
        }}
      />
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
// PLAYER CAROUSEL - ONE AT A TIME, HUGE
// ============================================================================
const PlayerCarousel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const players = PLAYERS_TRANSPARENT.slice(0, 6);
  const secondsPerPlayer = 1.3;
  const framesPerPlayer = Math.floor(secondsPerPlayer * fps);
  
  const idx = Math.min(Math.floor(frame / framesPerPlayer), players.length - 1);
  const segmentFrame = frame - idx * framesPerPlayer;
  const progress = segmentFrame / framesPerPlayer;

  const enter = spring({
    frame: segmentFrame,
    fps,
    config: { damping: 18, stiffness: 220, mass: 0.8 },
  });

  const slide = interpolate(progress, [0, 1], [140, -140]);
  const opacity = interpolate(progress, [0, 0.12, 0.88, 1], [0, 1, 1, 0]);

  const player = players[idx];
  if (!player) return null;

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <UICorners />

      {/* Player image - HUGE and centered */}
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transform: `translateX(${slide}px) scale(${0.96 + 0.06 * enter})`,
          opacity,
        }}
      >
        <Img
          src={player.image}
          style={{
            height: 1260,
            width: 'auto',
            objectFit: 'contain',
            filter: 'drop-shadow(0 40px 120px rgba(0,0,0,0.55))',
          }}
        />
      </div>

      {/* Overlays */}
      <AbsoluteFill
        style={{
          paddingLeft: THEME.safe.left,
          paddingRight: THEME.safe.right,
          paddingTop: THEME.safe.top,
          paddingBottom: THEME.safe.bottom,
          boxSizing: 'border-box',
          pointerEvents: 'none',
        }}
      >
        {/* Top labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <LabelPill text="DARK SIDE DEFENSE" />
          <LabelPill text="SELECT" accent />
        </div>

        <div style={{ flex: 1 }} />

        {/* Bottom info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 24,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '-0.03em',
                fontSize: 90,
                lineHeight: 0.92,
                color: THEME.colors.ink,
                textShadow: `0 0 26px rgba(105,190,40,0.22)`,
              }}
            >
              {player.lastName}
            </div>
            <div
              style={{
                marginTop: 10,
                fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontSize: 40,
                color: THEME.colors.inkDim,
              }}
            >
              {player.position}
            </div>
          </div>

          <div
            style={{
              fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
              fontWeight: 900,
              fontSize: 130,
              letterSpacing: '-0.06em',
              color: 'rgba(246,247,251,0.16)',
              lineHeight: 1,
            }}
          >
            #{player.jersey}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const LabelPill: React.FC<{ text: string; accent?: boolean }> = ({ text, accent }) => {
  return (
    <div
      style={{
        padding: '16px 22px',
        borderRadius: 999,
        border: '1px solid rgba(255,255,255,0.14)',
        background: 'rgba(0,0,0,0.24)',
        backdropFilter: 'blur(10px)',
        color: accent ? THEME.colors.accent : THEME.colors.ink,
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
        fontWeight: 900,
        letterSpacing: '0.10em',
        textTransform: 'uppercase',
        fontSize: 26,
      }}
    >
      {text}
    </div>
  );
};

// ============================================================================
// WIN TICKETS SCENE
// ============================================================================
const WinTickets: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 260, mass: 0.7 },
  });

  const glow = interpolate(pop, [0, 1], [0.1, 0.9]);

  // Light sweep
  const sweepX = interpolate(frame, [0, 60], [-520, 520]);

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <AbsoluteFill
        style={{
          paddingLeft: THEME.safe.left,
          paddingRight: THEME.safe.right,
          paddingTop: THEME.safe.top,
          paddingBottom: THEME.safe.bottom,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 40,
        }}
      >
        {/* WIN text */}
        <div
          style={{
            fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            textTransform: 'uppercase',
            color: THEME.colors.ink,
            fontSize: 180,
            lineHeight: 0.9,
            transform: `scale(${0.96 + 0.10 * pop})`,
            textShadow: `0 0 60px rgba(255,215,0,${0.25 + glow * 0.25})`,
          }}
        >
          WIN
        </div>

        {/* Ticket */}
        <div
          style={{
            position: 'relative',
            width: 900,
            padding: '50px 60px',
            background: `linear-gradient(135deg, ${THEME.colors.gold} 0%, ${THEME.colors.gold2} 100%)`,
            borderRadius: 40,
            boxShadow: `0 0 80px rgba(255,215,0,0.4), 0 40px 100px rgba(0,0,0,0.5)`,
            transform: `rotate(-3deg) scale(${0.96 + 0.08 * pop})`,
            overflow: 'hidden',
          }}
        >
          {/* Light sweep */}
          <div
            style={{
              position: 'absolute',
              inset: -120,
              transform: `translateX(${sweepX}px) rotate(18deg)`,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
              opacity: 0.6,
            }}
          />

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div
              style={{
                fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
                fontWeight: 900,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontSize: 32,
                color: THEME.colors.navy,
                marginBottom: 16,
              }}
            >
              {SUPER_BOWL.name}
            </div>
            <div
              style={{
                fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                textTransform: 'uppercase',
                fontSize: 90,
                color: THEME.colors.navy,
                lineHeight: 1,
              }}
            >
              2 TICKETS
            </div>
            <div
              style={{
                marginTop: 20,
                fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontSize: 26,
                color: 'rgba(0,34,68,0.7)',
              }}
            >
              {SUPER_BOWL.date} • {SUPER_BOWL.location}
            </div>
          </div>
        </div>

        {/* Subtext */}
        <div
          style={{
            fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
            fontWeight: 900,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            fontSize: 32,
            color: THEME.colors.gold,
            opacity: 0.95,
          }}
        >
          PLAY TO ENTER
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// CTA SCENE
// ============================================================================
const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 180, mass: 0.8 },
  });

  const qrOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <AbsoluteFill
        style={{
          paddingLeft: THEME.safe.left,
          paddingRight: THEME.safe.right,
          paddingTop: THEME.safe.top,
          paddingBottom: THEME.safe.bottom,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div
            style={{
              fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              fontSize: 60,
              lineHeight: 0.95,
              color: THEME.colors.ink,
            }}
          >
            {GAME.title}
          </div>
          <Img
            src={DRINKSIP.logo}
            style={{
              height: 56,
              width: 'auto',
              opacity: 0.95,
              filter: 'drop-shadow(0 14px 40px rgba(0,0,0,0.35))',
            }}
          />
        </div>

        {/* Center block */}
        <div
          style={{
            display: 'flex',
            gap: 40,
            alignItems: 'center',
            justifyContent: 'space-between',
            transform: `scale(${0.95 + 0.05 * enter})`,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                textTransform: 'uppercase',
                fontSize: 90,
                lineHeight: 0.92,
                color: THEME.colors.ink,
              }}
            >
              PLAY NOW
            </div>

            <div
              style={{
                marginTop: 14,
                fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
                fontWeight: 900,
                letterSpacing: '0.02em',
                fontSize: 52,
                color: THEME.colors.accent,
                textShadow: `0 0 28px rgba(105,190,40,0.25)`,
              }}
            >
              game.drinksip.com
            </div>

            <div
              style={{
                marginTop: 22,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 14,
                padding: '18px 22px',
                borderRadius: 999,
                background: 'rgba(105,190,40,0.14)',
                border: '1px solid rgba(105,190,40,0.28)',
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 999,
                  background: THEME.colors.accent,
                  boxShadow: '0 0 18px rgba(105,190,40,0.65)',
                }}
              />
              <div
                style={{
                  fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
                  fontWeight: 900,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  fontSize: 26,
                  color: THEME.colors.ink,
                }}
              >
                Scan to play
              </div>
            </div>
          </div>

          {/* QR Code placeholder (styled box) */}
          <div
            style={{
              width: 320,
              height: 320,
              borderRadius: 42,
              overflow: 'hidden',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 18px 60px rgba(0,0,0,0.45)',
              opacity: qrOpacity,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
                fontWeight: 900,
                fontSize: 20,
                color: THEME.colors.navy,
                textAlign: 'center',
                padding: 20,
              }}
            >
              QR CODE<br />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#666' }}>
                game.drinksip.com
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            opacity: 0.9,
          }}
        >
          <div
            style={{
              fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
              fontWeight: 900,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontSize: 26,
              color: THEME.colors.inkDim,
            }}
          >
            DARK SIDE DEFENSE
          </div>

          <div
            style={{
              fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
              fontWeight: 900,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontSize: 26,
              color: THEME.colors.inkDim,
            }}
          >
            MOBILE FIRST • IN BROWSER
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// MAIN COMPOSITION
// ============================================================================
export const CommercialVerticalV8: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* NO FOOTBALL THIS WEEK */}
      <Sequence from={SCENES.noFootball.start} durationInFrames={SCENES.noFootball.end - SCENES.noFootball.start}>
        <Frame intensity={0.9} accentMode="cyan">
          <FullBleedTitle lines={['NO FOOTBALL', 'THIS WEEK']} slam={false} />
        </Frame>
      </Sequence>

      {/* JUST KIDDING */}
      <Sequence from={SCENES.justKidding.start} durationInFrames={SCENES.justKidding.end - SCENES.justKidding.start}>
        <Frame intensity={1.05} accentMode="green">
          <FullBleedTitle lines={['JUST', 'KIDDING.']} accentWord="KIDDING." />
        </Frame>
      </Sequence>

      {/* THE DARK SIDE GAME */}
      <Sequence from={SCENES.gameTitle.start} durationInFrames={SCENES.gameTitle.end - SCENES.gameTitle.start}>
        <Frame intensity={1.15} accentMode="green">
          <FullBleedTitle lines={['THE', 'DARK SIDE', 'GAME']} accentWord="DARK" sub="DEFENSE IS THE WEAPON" />
        </Frame>
      </Sequence>

      {/* Player carousel */}
      <Sequence from={SCENES.carousel.start} durationInFrames={SCENES.carousel.end - SCENES.carousel.start}>
        <Frame intensity={1.0} accentMode="cyan">
          <PlayerCarousel />
        </Frame>
      </Sequence>

      {/* TACKLE */}
      <Sequence from={Math.floor(SCENES.tackle.start)} durationInFrames={Math.floor(SCENES.tackle.end - SCENES.tackle.start)}>
        <Frame intensity={1.15} accentMode="green">
          <FullBleedTitle lines={['TACKLE']} accentWord="TACKLE" />
        </Frame>
      </Sequence>

      {/* DEFEND */}
      <Sequence from={Math.floor(SCENES.defend.start)} durationInFrames={Math.floor(SCENES.defend.end - SCENES.defend.start)}>
        <Frame intensity={1.15} accentMode="cyan">
          <FullBleedTitle lines={['DEFEND']} accentWord="DEFEND" />
        </Frame>
      </Sequence>

      {/* DOMINATE */}
      <Sequence from={Math.floor(SCENES.dominate.start)} durationInFrames={Math.floor(SCENES.dominate.end - SCENES.dominate.start)}>
        <Frame intensity={1.15} accentMode="green">
          <FullBleedTitle lines={['DOMINATE']} accentWord="DOMINATE" />
        </Frame>
      </Sequence>

      {/* WIN TICKETS */}
      <Sequence from={SCENES.winTickets.start} durationInFrames={SCENES.winTickets.end - SCENES.winTickets.start}>
        <Frame intensity={1.25} accentMode="gold">
          <WinTickets />
        </Frame>
      </Sequence>

      {/* CTA */}
      <Sequence from={SCENES.cta.start} durationInFrames={SCENES.cta.end - SCENES.cta.start}>
        <Frame intensity={1.05} accentMode="green">
          <CTAScene />
        </Frame>
      </Sequence>
    </AbsoluteFill>
  );
};
