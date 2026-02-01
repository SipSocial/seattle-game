/**
 * Scene 02: Seattle Flash (3-6s)
 * Quick flash of Seattle skyline, then black
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Img } from 'remotion';
import { COLORS, CAMPAIGN } from '../assets';

export const Scene02_SeattleFlash: React.FC = () => {
  const frame = useCurrentFrame();

  // Quick flash in and out
  const imageOpacity = interpolate(frame, [0, 8, 50, 70], [0, 0.7, 0.7, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // White flash at start
  const flashOpacity = interpolate(frame, [0, 10], [1, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      {/* Seattle skyline */}
      <AbsoluteFill style={{ opacity: imageOpacity }}>
        <Img
          src={CAMPAIGN.seattleImage}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'saturate(0.6) brightness(0.7)',
          }}
        />
      </AbsoluteFill>

      {/* Dark overlay */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)`,
        }}
      />

      {/* Thunder flash */}
      <AbsoluteFill
        style={{
          backgroundColor: COLORS.white,
          opacity: flashOpacity,
        }}
      />
    </AbsoluteFill>
  );
};
