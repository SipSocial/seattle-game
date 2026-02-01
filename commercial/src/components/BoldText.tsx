import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { COLORS, FONTS } from '../assets';

interface BoldTextProps {
  children: string;
  fontSize?: number;
  color?: string;
  delay?: number;
  animation?: 'slam' | 'slide-up' | 'fade' | 'letters';
  shadow?: boolean;
  glow?: string;
  style?: React.CSSProperties;
}

export const BoldText: React.FC<BoldTextProps> = ({
  children,
  fontSize = 80,
  color = COLORS.white,
  delay = 0,
  animation = 'slam',
  shadow = true,
  glow,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - delay);

  // Animation calculations
  let opacity = 1;
  let transform = 'none';
  let scale = 1;

  switch (animation) {
    case 'slam':
      scale = spring({
        frame: localFrame,
        fps,
        config: { damping: 15, stiffness: 200, mass: 0.8 },
        from: 1.3,
        to: 1,
      });
      opacity = interpolate(localFrame, [0, 4], [0, 1], { extrapolateRight: 'clamp' });
      transform = `scale(${scale})`;
      break;

    case 'slide-up':
      const y = spring({
        frame: localFrame,
        fps,
        config: { damping: 20, stiffness: 150 },
        from: 60,
        to: 0,
      });
      opacity = interpolate(localFrame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
      transform = `translateY(${y}px)`;
      break;

    case 'fade':
      opacity = interpolate(localFrame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
      break;

    case 'letters':
      opacity = interpolate(localFrame, [0, 5], [0, 1], { extrapolateRight: 'clamp' });
      break;
  }

  if (localFrame < 0) {
    opacity = 0;
  }

  const textShadow = shadow
    ? `0 4px 20px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.9)`
    : 'none';

  const glowShadow = glow
    ? `0 0 40px ${glow}, 0 0 80px ${glow}50`
    : '';

  return (
    <div
      style={{
        ...FONTS.headline,
        fontSize,
        color,
        opacity,
        transform,
        textShadow: glowShadow ? `${textShadow}, ${glowShadow}` : textShadow,
        lineHeight: 1.1,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
