import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { COLORS, FONTS } from '../assets';

interface TitleSlamProps {
  line1: string;
  line2: string;
  delay?: number;
}

export const TitleSlam: React.FC<TitleSlamProps> = ({
  line1,
  line2,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - delay);

  // Line 1 animation
  const line1Scale = spring({
    frame: localFrame,
    fps,
    config: { damping: 10, stiffness: 200, mass: 0.5 },
    from: 2,
    to: 1,
  });
  const line1Opacity = interpolate(localFrame, [0, 3], [0, 1], { extrapolateRight: 'clamp' });

  // Line 2 animation (delayed by 6 frames)
  const line2Frame = Math.max(0, localFrame - 6);
  const line2Scale = spring({
    frame: line2Frame,
    fps,
    config: { damping: 10, stiffness: 200, mass: 0.5 },
    from: 2,
    to: 1,
  });
  const line2Opacity = interpolate(line2Frame, [0, 3], [0, 1], { extrapolateRight: 'clamp' });

  // Screen shake on impact
  const shakeX = localFrame < 8 ? Math.sin(localFrame * 3) * (8 - localFrame) : 0;
  const shakeY = localFrame < 8 ? Math.cos(localFrame * 4) * (8 - localFrame) * 0.5 : 0;

  if (frame < delay) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      {/* DARK SIDE */}
      <div
        style={{
          ...FONTS.headline,
          fontSize: 180,
          color: COLORS.white,
          opacity: line1Opacity,
          transform: `scale(${line1Scale})`,
          textShadow: `0 0 60px ${COLORS.green}, 0 0 120px ${COLORS.green}40, 0 8px 30px rgba(0,0,0,0.8)`,
          lineHeight: 0.9,
        }}
      >
        {line1}
      </div>

      {/* DEFENSE */}
      <div
        style={{
          ...FONTS.headline,
          fontSize: 180,
          color: COLORS.green,
          opacity: line2Opacity,
          transform: `scale(${line2Scale})`,
          textShadow: `0 0 40px ${COLORS.green}, 0 8px 30px rgba(0,0,0,0.8)`,
          lineHeight: 0.9,
        }}
      >
        {line2}
      </div>
    </div>
  );
};
