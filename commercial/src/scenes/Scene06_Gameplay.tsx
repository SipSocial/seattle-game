/**
 * Scene 06: Gameplay Montage (22-30s)
 * Fast cuts with action words: TACKLE, COLLECT, DOMINATE
 */
import React from 'react';
import { AbsoluteFill, Sequence, Img, useCurrentFrame, interpolate } from 'remotion';
import { ActionWord, FlashTransition } from '../components';
import { COLORS, CAMPAIGN, PLAYERS, DRINKSIP, FPS } from '../assets';

// Background image that changes
const GameplayBG: React.FC<{ src: string }> = ({ src }) => {
  const frame = useCurrentFrame();

  const scale = interpolate(frame, [0, 80], [1.1, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <Img
        src={src}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
          filter: 'brightness(0.4) saturate(1.2)',
        }}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

export const Scene06_Gameplay: React.FC = () => {
  // 8 seconds = 240 frames
  // 3 action words, ~2.5s each

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      {/* TACKLE segment */}
      <Sequence from={0} durationInFrames={80}>
        <GameplayBG src={PLAYERS[2].image} />
        <AbsoluteFill
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActionWord word="TACKLE" duration={80} />
        </AbsoluteFill>
        <FlashTransition duration={6} />
      </Sequence>

      {/* COLLECT segment - show power-ups */}
      <Sequence from={80} durationInFrames={80}>
        <GameplayBG src={CAMPAIGN.stadiumImage} />
        <AbsoluteFill
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActionWord word="COLLECT" duration={80} />
        </AbsoluteFill>
        <FlashTransition duration={6} />
      </Sequence>

      {/* DOMINATE segment */}
      <Sequence from={160} durationInFrames={80}>
        <GameplayBG src={PLAYERS[7].image} />
        <AbsoluteFill
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActionWord word="DOMINATE" duration={80} />
        </AbsoluteFill>
        <FlashTransition duration={6} />
      </Sequence>
    </AbsoluteFill>
  );
};
