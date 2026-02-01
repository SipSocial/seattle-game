import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { COLORS, FONTS } from '../assets';

interface CTAButtonProps {
  text: string;
  delay?: number;
}

export const CTAButton: React.FC<CTAButtonProps> = ({ text, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - delay);

  // Scale entrance
  const scale = spring({
    frame: localFrame,
    fps,
    config: { damping: 12, stiffness: 150 },
    from: 0.8,
    to: 1,
  });

  const opacity = interpolate(localFrame, [0, 10], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Glow pulse
  const glow = 20 + Math.sin(localFrame * 0.12) * 10;

  if (frame < delay) return null;

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          padding: '25px 80px',
          background: `linear-gradient(135deg, ${COLORS.green} 0%, #4a9e1c 100%)`,
          borderRadius: 16,
          boxShadow: `0 0 ${glow}px ${COLORS.green}, 0 15px 50px rgba(0,0,0,0.5)`,
        }}
      >
        <span
          style={{
            ...FONTS.headline,
            fontSize: 56,
            color: COLORS.white,
            textShadow: '0 2px 10px rgba(0,0,0,0.3)',
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};
