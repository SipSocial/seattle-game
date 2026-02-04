/**
 * BackgroundFX - Premium background effects layer
 * 
 * Features:
 * - Radial gradient with accent color
 * - Subtle scanlines
 * - Vignette overlay
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { THEME } from '../compositions/SplashVideo';

interface BackgroundFXProps {
  children: React.ReactNode;
  accentColor?: string;
  intensity?: number;
}

// Utility: hex to rgba
const hexToRgba = (hex: string, alpha: number): string => {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
};

export const BackgroundFX: React.FC<BackgroundFXProps> = ({ 
  children, 
  accentColor = THEME.colors.green,
  intensity = 1,
}) => {
  const frame = useCurrentFrame();
  const t = frame / 300; // Normalize to 0-1 over 10s

  const vignette = 0.25 + (intensity * 0.3);
  const glowStrength = 0.12 + (intensity * 0.18);

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.bg0 }}>
      {/* Gradient background */}
      <AbsoluteFill
        style={{
          background: `
            radial-gradient(1200px 1200px at 50% 15%, rgba(255,255,255,0.06), transparent 60%),
            radial-gradient(900px 900px at 20% 60%, ${hexToRgba(accentColor, glowStrength)}, transparent 65%),
            radial-gradient(900px 900px at 80% 70%, rgba(0,0,0,0.25), transparent 70%),
            linear-gradient(180deg, ${THEME.colors.bg1}, ${THEME.colors.bg0})
          `,
        }}
      />

      {/* Animated scanlines */}
      <AbsoluteFill
        style={{
          opacity: 0.06 * intensity,
          background:
            'repeating-linear-gradient(180deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 2px, transparent 5px)',
          transform: `translateY(${Math.sin(t * Math.PI * 4) * 4}px)`,
        }}
      />

      {/* Vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(1200px 1600px at 50% 45%, transparent 55%, rgba(0,0,0,${vignette}) 92%)`,
        }}
      />

      {/* Content */}
      <AbsoluteFill>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
