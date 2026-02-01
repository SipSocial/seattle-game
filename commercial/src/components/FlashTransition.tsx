import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { COLORS } from '../assets';

interface FlashTransitionProps {
  color?: string;
  duration?: number;
}

export const FlashTransition: React.FC<FlashTransitionProps> = ({
  color = COLORS.white,
  duration = 8,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, duration], [0.9, 0], {
    extrapolateRight: 'clamp',
  });

  if (frame >= duration) return null;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: color,
        opacity,
      }}
    />
  );
};
