/**
 * Scene 03: No Football Hook (6-10s)
 * "NO FOOTBALL THIS WEEK" with glitch/shake
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, random } from 'remotion';
import { COLORS, FONTS } from '../assets';

export const Scene03_NoFootball: React.FC = () => {
  const frame = useCurrentFrame();

  // Text entrance
  const opacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(frame, [10, 20, 25], [0.9, 1.02, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Glitch effect (random jitter)
  const isGlitching = frame > 60 && frame < 100;
  const glitchX = isGlitching ? (random(`gx-${frame}`) - 0.5) * 15 : 0;
  const glitchY = isGlitching ? (random(`gy-${frame}`) - 0.5) * 8 : 0;

  // Exit fade
  const exitOpacity = interpolate(frame, [100, 120], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.black,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          ...FONTS.headline,
          fontSize: 110,
          color: COLORS.white,
          textAlign: 'center',
          opacity: opacity * exitOpacity,
          transform: `scale(${scale}) translate(${glitchX}px, ${glitchY}px)`,
          textShadow: '0 4px 30px rgba(0,0,0,0.8)',
        }}
      >
        NO FOOTBALL
        <br />
        THIS WEEK
      </div>

      {/* Scanline effect */}
      <AbsoluteFill
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(0,0,0,0.2) 3px,
            rgba(0,0,0,0.2) 6px
          )`,
          opacity: 0.4,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
