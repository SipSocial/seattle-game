import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig, Img } from 'remotion';
import { COLORS, FONTS } from '../assets';

interface PlayerRevealProps {
  image: string;
  jersey: number;
  name?: string;
  delay?: number;
  showName?: boolean;
  showJersey?: boolean;
  size?: number;
}

export const PlayerReveal: React.FC<PlayerRevealProps> = ({
  image,
  jersey,
  name,
  delay = 0,
  showName = false,
  showJersey = true,
  size = 400,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - delay);

  // Scale spring animation
  const scale = spring({
    frame: localFrame,
    fps,
    config: { damping: 12, stiffness: 120, mass: 0.6 },
    from: 0.8,
    to: 1,
  });

  // Opacity
  const opacity = interpolate(localFrame, [0, 8], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Glow pulse (subtle)
  const glowIntensity = 15 + Math.sin(localFrame * 0.1) * 5;

  if (frame < delay) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      {/* Player image container */}
      <div
        style={{
          position: 'relative',
          width: size,
          height: size * 1.25,
          borderRadius: 16,
          overflow: 'hidden',
          border: `3px solid ${COLORS.green}`,
          boxShadow: `0 0 ${glowIntensity}px ${COLORS.green}, 0 20px 60px rgba(0,0,0,0.6)`,
        }}
      >
        <Img
          src={image}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Jersey number - top right */}
        {showJersey && (
          <div
            style={{
              position: 'absolute',
              top: 15,
              right: 15,
              ...FONTS.number,
              fontSize: size * 0.2,
              color: COLORS.green,
              textShadow: `0 0 20px ${COLORS.navy}, 2px 2px 0 ${COLORS.navy}, -2px -2px 0 ${COLORS.navy}`,
            }}
          >
            #{jersey}
          </div>
        )}
      </div>

      {/* Player name */}
      {showName && name && (
        <div
          style={{
            marginTop: 20,
            ...FONTS.headline,
            fontSize: size * 0.09,
            color: COLORS.white,
            textShadow: '0 2px 10px rgba(0,0,0,0.8)',
            opacity: interpolate(localFrame, [10, 20], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        >
          {name}
        </div>
      )}
    </div>
  );
};
