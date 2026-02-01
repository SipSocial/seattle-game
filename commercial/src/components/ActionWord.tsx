import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { COLORS, FONTS } from '../assets';

interface ActionWordProps {
  word: string;
  duration: number;
}

export const ActionWord: React.FC<ActionWordProps> = ({ word, duration }) => {
  const frame = useCurrentFrame();

  // Quick in, hold, quick out
  const opacity = interpolate(
    frame,
    [0, 3, duration - 3, duration],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const scale = interpolate(
    frame,
    [0, 5],
    [0.7, 1],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        ...FONTS.headline,
        fontSize: 200,
        color: COLORS.white,
        opacity,
        transform: `scale(${scale})`,
        textShadow: `0 0 80px ${COLORS.green}, 0 0 160px ${COLORS.green}30, 0 10px 40px rgba(0,0,0,0.9)`,
        letterSpacing: '0.1em',
      }}
    >
      {word}
    </div>
  );
};
