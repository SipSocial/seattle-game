/**
 * Scene 04: Player Montage (10-18s)
 * Rapid cuts of 4 players, then hero shot of DeMarcus
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, Sequence, Img, interpolate } from 'remotion';
import { COLORS, FONTS, FEATURED_PLAYERS, FPS } from '../assets';

const PlayerSlide: React.FC<{ player: typeof FEATURED_PLAYERS[0]; isHero?: boolean }> = ({ 
  player, 
  isHero = false 
}) => {
  const frame = useCurrentFrame();

  // Slide in from right
  const x = interpolate(frame, [0, 8], [100, 0], {
    extrapolateRight: 'clamp',
  });

  const opacity = interpolate(frame, [0, 5], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(frame, [0, 10], [1.1, 1], {
    extrapolateRight: 'clamp',
  });

  // Glow for hero
  const glow = isHero ? 25 + Math.sin(frame * 0.15) * 10 : 15;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.navy,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Green radial glow */}
      <div
        style={{
          position: 'absolute',
          width: isHero ? 700 : 500,
          height: isHero ? 700 : 500,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.green}30 0%, transparent 70%)`,
          filter: `blur(${glow}px)`,
        }}
      />

      {/* Player image */}
      <div
        style={{
          position: 'relative',
          opacity,
          transform: `translateX(${x}px) scale(${scale})`,
        }}
      >
        <div
          style={{
            width: isHero ? 450 : 350,
            height: isHero ? 560 : 440,
            borderRadius: 16,
            overflow: 'hidden',
            border: `4px solid ${COLORS.green}`,
            boxShadow: `0 0 ${glow}px ${COLORS.green}, 0 20px 60px rgba(0,0,0,0.6)`,
          }}
        >
          <Img
            src={player.image}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>

        {/* Jersey number */}
        <div
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            ...FONTS.number,
            fontSize: isHero ? 70 : 50,
            color: COLORS.green,
            textShadow: `0 0 15px ${COLORS.navy}, 2px 2px 0 ${COLORS.navy}`,
          }}
        >
          #{player.jersey}
        </div>
      </div>

      {/* Player name - hero only */}
      {isHero && (
        <div
          style={{
            position: 'absolute',
            bottom: 100,
            ...FONTS.headline,
            fontSize: 60,
            color: COLORS.white,
            textShadow: '0 4px 20px rgba(0,0,0,0.8)',
            opacity: interpolate(frame, [15, 25], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        >
          {player.lastName}
        </div>
      )}
    </AbsoluteFill>
  );
};

export const Scene04_PlayerMontage: React.FC = () => {
  // 8 seconds total = 240 frames at 30fps
  // First 3 players: ~1.3s each (40 frames)
  // Hero (DeMarcus): ~4s (120 frames)

  return (
    <AbsoluteFill>
      {/* Witherspoon */}
      <Sequence from={0} durationInFrames={40}>
        <PlayerSlide player={FEATURED_PLAYERS[0]} />
      </Sequence>

      {/* Williams */}
      <Sequence from={40} durationInFrames={40}>
        <PlayerSlide player={FEATURED_PLAYERS[1]} />
      </Sequence>

      {/* Nwosu */}
      <Sequence from={80} durationInFrames={40}>
        <PlayerSlide player={FEATURED_PLAYERS[2]} />
      </Sequence>

      {/* DeMarcus - Hero shot */}
      <Sequence from={120} durationInFrames={120}>
        <PlayerSlide player={FEATURED_PLAYERS[3]} isHero />
      </Sequence>
    </AbsoluteFill>
  );
};
