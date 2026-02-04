/**
 * BrandHype - Scene 3 (5-8 seconds)
 * 
 * Features:
 * - DrinkSip logo animation
 * - "WIN BIG GAME TICKETS" reveal
 * - Gold particle effects
 * - Prize value callout ($10,000+ value)
 */
import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import { THEME } from '../compositions/SplashVideo';

export const BrandHype: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene lasts 90 frames (3 seconds)
  // Phase 1: Logo reveal (0-30)
  // Phase 2: Prize reveal (30-60)
  // Phase 3: Value callout (60-90)

  return (
    <AbsoluteFill>
      {/* DrinkSip branding */}
      <LogoReveal frame={frame} fps={fps} />

      {/* Prize ticket */}
      <PrizeReveal frame={frame} fps={fps} />

      {/* Gold particles */}
      <GoldParticles frame={frame} />

      {/* Value callout */}
      <ValueCallout frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};

// DrinkSip logo reveal
interface LogoRevealProps {
  frame: number;
  fps: number;
}

const LogoReveal: React.FC<LogoRevealProps> = ({ frame, fps }) => {
  const logoSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 180 },
  });

  const opacity = interpolate(frame, [0, 10, 25, 35], [0, 1, 1, 0]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          transform: `scale(${0.9 + 0.1 * logoSpring})`,
        }}
      >
        {/* DrinkSip text logo */}
        <div
          style={{
            fontFamily: THEME.font,
            fontWeight: 900,
            fontSize: 80,
            letterSpacing: '-0.02em',
            color: THEME.colors.ink,
            textShadow: '0 4px 40px rgba(0,0,0,0.5)',
          }}
        >
          DrinkSip
        </div>
        <div
          style={{
            fontFamily: THEME.font,
            fontWeight: 700,
            fontSize: THEME.type.small,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: THEME.colors.inkDim,
          }}
        >
          PRESENTS
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Prize ticket reveal
interface PrizeRevealProps {
  frame: number;
  fps: number;
}

const PrizeReveal: React.FC<PrizeRevealProps> = ({ frame, fps }) => {
  const prizeFrame = Math.max(0, frame - 30);
  
  const prizeSpring = spring({
    frame: prizeFrame,
    fps,
    config: { damping: 12, stiffness: 200, mass: 0.7 },
  });

  const opacity = interpolate(frame, [28, 38, 85, 90], [0, 1, 1, 0.8]);

  if (frame < 28) return null;

  // Light sweep animation
  const sweepX = interpolate(prizeFrame, [0, 60], [-400, 400]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
      }}
    >
      {/* WIN text */}
      <div
        style={{
          position: 'absolute',
          top: '22%',
          fontFamily: THEME.font,
          fontWeight: 900,
          fontSize: THEME.type.mega,
          letterSpacing: '-0.04em',
          textTransform: 'uppercase',
          color: THEME.colors.ink,
          textShadow: `0 0 60px ${THEME.colors.gold}`,
          transform: `scale(${0.9 + 0.15 * prizeSpring})`,
        }}
      >
        WIN
      </div>

      {/* Gold ticket */}
      <div
        style={{
          position: 'relative',
          width: 860,
          padding: '44px 50px',
          background: `linear-gradient(135deg, ${THEME.colors.gold} 0%, ${THEME.colors.goldDark} 100%)`,
          borderRadius: 36,
          boxShadow: `0 0 80px rgba(255,215,0,0.4), 0 40px 100px rgba(0,0,0,0.5)`,
          transform: `rotate(-2deg) scale(${0.94 + 0.08 * prizeSpring})`,
          overflow: 'hidden',
        }}
      >
        {/* Light sweep */}
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
              fontFamily: THEME.font,
              fontWeight: 900,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontSize: 28,
              color: THEME.colors.navy,
              marginBottom: 12,
            }}
          >
            SUPER BOWL LIX
          </div>
          <div
            style={{
              fontFamily: THEME.font,
              fontWeight: 900,
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              fontSize: 76,
              color: THEME.colors.navy,
              lineHeight: 1,
            }}
          >
            BIG GAME TICKETS
          </div>
          <div
            style={{
              marginTop: 16,
              fontFamily: THEME.font,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontSize: 22,
              color: 'rgba(0,34,68,0.7)',
            }}
          >
            FEB 9, 2025 • NEW ORLEANS
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Gold particle effects
interface GoldParticlesProps {
  frame: number;
}

const GoldParticles: React.FC<GoldParticlesProps> = ({ frame }) => {
  const particleOpacity = interpolate(frame, [30, 40, 85, 90], [0, 0.8, 0.8, 0]);
  
  if (particleOpacity <= 0) return null;

  // Generate deterministic particles
  const particles = Array.from({ length: 20 }, (_, i) => {
    const seed = i * 1337;
    const x = (seed % 100);
    const startY = ((seed * 7) % 100);
    const speed = 0.5 + ((seed * 3) % 10) / 10;
    const size = 4 + ((seed * 11) % 8);
    const delay = (seed % 20);
    
    const y = startY + (frame - 30 - delay) * speed;
    
    return { x, y: y % 120, size, opacity: 0.3 + ((seed * 5) % 7) / 10 };
  });

  return (
    <AbsoluteFill style={{ opacity: particleOpacity, pointerEvents: 'none' }}>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: THEME.colors.gold,
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 2}px ${THEME.colors.gold}`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

// Value callout
interface ValueCalloutProps {
  frame: number;
  fps: number;
}

const ValueCallout: React.FC<ValueCalloutProps> = ({ frame, fps }) => {
  const valueFrame = Math.max(0, frame - 55);
  
  const valueSpring = spring({
    frame: valueFrame,
    fps,
    config: { damping: 16, stiffness: 160 },
  });

  if (frame < 55) return null;

  return (
    <AbsoluteFill
      style={{
        paddingBottom: THEME.safe.bottom + 80,
        justifyContent: 'flex-end',
        alignItems: 'center',
        opacity: valueSpring,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '18px 32px',
          borderRadius: 999,
          background: 'rgba(255,215,0,0.12)',
          border: '1px solid rgba(255,215,0,0.3)',
          backdropFilter: 'blur(10px)',
          transform: `translateY(${interpolate(valueSpring, [0, 1], [20, 0])}px)`,
        }}
      >
        <div
          style={{
            fontFamily: THEME.font,
            fontWeight: 900,
            fontSize: 36,
            color: THEME.colors.gold,
            textShadow: `0 0 20px ${THEME.colors.gold}`,
          }}
        >
          $10,000+
        </div>
        <div
          style={{
            fontFamily: THEME.font,
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: THEME.colors.inkDim,
          }}
        >
          VALUE
        </div>
      </div>
    </AbsoluteFill>
  );
};
