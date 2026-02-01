/**
 * Scene 07: Campaign Journey (30-34s)
 * US map with stats: 20 STAGES → 60 GAMES → 1 CHAMPIONSHIP
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Img, Sequence } from 'remotion';
import { BoldText, FlashTransition } from '../components';
import { COLORS, CAMPAIGN, FONTS } from '../assets';

const StatReveal: React.FC<{ number: string; label: string }> = ({ number, label }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  const scale = interpolate(frame, [0, 8, 12], [0.8, 1.05, 1], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        textAlign: 'center',
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          ...FONTS.headline,
          fontSize: 140,
          color: COLORS.green,
          textShadow: `0 0 40px ${COLORS.green}, 0 4px 20px rgba(0,0,0,0.8)`,
          lineHeight: 1,
        }}
      >
        {number}
      </div>
      <div
        style={{
          ...FONTS.body,
          fontSize: 40,
          color: COLORS.white,
          marginTop: 10,
          letterSpacing: '0.15em',
        }}
      >
        {label}
      </div>
    </div>
  );
};

export const Scene07_Campaign: React.FC = () => {
  const frame = useCurrentFrame();

  // Map zoom
  const mapScale = interpolate(frame, [0, 120], [1.2, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      {/* US Map background */}
      <AbsoluteFill style={{ opacity: 0.5 }}>
        <Img
          src={CAMPAIGN.mapImage}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${mapScale})`,
            filter: 'brightness(0.6)',
          }}
        />
      </AbsoluteFill>

      {/* Dark overlay */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%)`,
        }}
      />

      {/* Stats - cycling through */}
      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Sequence from={0} durationInFrames={40}>
          <StatReveal number="20" label="STAGES" />
        </Sequence>

        <Sequence from={40} durationInFrames={40}>
          <StatReveal number="60" label="GAMES" />
        </Sequence>

        <Sequence from={80} durationInFrames={40}>
          <StatReveal number="1" label="CHAMPIONSHIP" />
        </Sequence>
      </AbsoluteFill>

      <FlashTransition duration={5} />
    </AbsoluteFill>
  );
};
