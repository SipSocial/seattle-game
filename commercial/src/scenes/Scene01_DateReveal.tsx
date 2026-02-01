/**
 * Scene 01: Date Reveal (0-3s)
 * Black screen, bass rumble, "FEBRUARY 2026" fades in
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { COLORS, FONTS } from '../assets';

export const Scene01_DateReveal: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [15, 45, 75, 90], [0, 1, 1, 0], {
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
          ...FONTS.body,
          fontSize: 32,
          color: COLORS.grey,
          letterSpacing: '0.3em',
          opacity,
        }}
      >
        FEBRUARY 2026
      </div>
    </AbsoluteFill>
  );
};
