/**
 * DARK SIDE GAME — Ticket Win Moment
 * MASSIVE reward reveal. Must feel like jackpot.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile } from 'remotion';
import { THEME, hexToRgba } from './theme';

export const TicketWin: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Pop-in animation
  const pop = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 260, mass: 0.7 },
  });

  const glow = interpolate(pop, [0, 1], [0.1, 0.9]);
  
  // Light sweep across ticket
  const sweepX = interpolate(frame, [0, 80], [-600, 600], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <AbsoluteFill
        style={{
          padding: `${THEME.safe.top}px ${THEME.safe.right}px ${THEME.safe.bottom}px ${THEME.safe.left}px`,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 40,
        }}
      >
        {/* WIN - MASSIVE */}
        <div
          style={{
            fontFamily: THEME.font.main,
            fontWeight: 900,
            letterSpacing: '-0.04em',
            textTransform: 'uppercase',
            color: THEME.colors.ink,
            fontSize: THEME.type.mega,
            lineHeight: 0.9,
            transform: `scale(${0.96 + 0.12 * pop})`,
            textShadow: `0 0 60px ${hexToRgba(THEME.colors.gold, 0.25 + glow * 0.25)}, ${THEME.shadow.text}`,
          }}
        >
          WIN
        </div>

        {/* Ticket graphic - HUGE, partially cropped intentionally */}
        <div
          style={{
            position: 'relative',
            width: 920,
            padding: '50px 60px',
            background: `linear-gradient(135deg, ${THEME.colors.gold} 0%, ${THEME.colors.goldDark} 100%)`,
            borderRadius: THEME.radius.xl,
            boxShadow: `0 0 80px ${hexToRgba(THEME.colors.gold, 0.4)}, ${THEME.shadow.drop}`,
            transform: `rotate(-3deg) scale(${0.96 + 0.08 * pop})`,
            overflow: 'hidden',
          }}
        >
          {/* Sweep shine */}
          <div
            style={{
              position: 'absolute',
              inset: -120,
              transform: `translateX(${sweepX}px) rotate(18deg)`,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
              opacity: 0.6,
            }}
          />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div
              style={{
                fontFamily: THEME.font.main,
                fontWeight: 900,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontSize: 32,
                color: THEME.colors.navy,
                marginBottom: 16,
              }}
            >
              SUPER BOWL LX
            </div>
            <div
              style={{
                fontFamily: THEME.font.main,
                fontWeight: 900,
                letterSpacing: '-0.03em',
                textTransform: 'uppercase',
                fontSize: 100,
                color: THEME.colors.navy,
                lineHeight: 1,
              }}
            >
              2 TICKETS
            </div>
            <div
              style={{
                marginTop: 20,
                fontFamily: THEME.font.main,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontSize: 26,
                color: 'rgba(0,34,68,0.7)',
              }}
            >
              FEBRUARY 9, 2025 • NEW ORLEANS
            </div>
          </div>
        </div>

        {/* PLAY TO ENTER */}
        <div
          style={{
            fontFamily: THEME.font.main,
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
