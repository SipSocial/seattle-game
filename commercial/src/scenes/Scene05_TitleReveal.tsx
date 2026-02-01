/**
 * Scene 05: Title Reveal (18-22s)
 * DARK SIDE / DEFENSE slam in with impact
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { TitleSlam, FlashTransition } from '../components';
import { COLORS } from '../assets';

export const Scene05_TitleReveal: React.FC = () => {
  const frame = useCurrentFrame();

  // Screen shake
  const shakeIntensity = frame < 20 ? (20 - frame) * 0.4 : 0;
  const shakeX = Math.sin(frame * 3) * shakeIntensity;
  const shakeY = Math.cos(frame * 4) * shakeIntensity * 0.5;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.black,
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      {/* Radial green glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, ${COLORS.green}20 0%, transparent 60%)`,
        }}
      />

      {/* Title */}
      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <TitleSlam line1="DARK SIDE" line2="DEFENSE" delay={5} />
      </AbsoluteFill>

      {/* White flash on entrance */}
      <FlashTransition color={COLORS.white} duration={10} />
    </AbsoluteFill>
  );
};
