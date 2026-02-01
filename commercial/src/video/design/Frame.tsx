/**
 * DARK SIDE GAME — Frame Background System
 * Full-bleed background with gradient, grain, vignette
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { THEME, hexToRgba } from './theme';

export type AccentMode = 'green' | 'cyan' | 'gold' | 'neutral';

interface FrameProps {
  children: React.ReactNode;
  accentMode?: AccentMode;
  intensity?: number; // 0-1, controls glow intensity
}

export const Frame: React.FC<FrameProps> = ({ 
  children, 
  accentMode = 'green',
  intensity = 1,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.bg0 }}>
      <BackgroundFX accentMode={accentMode} intensity={intensity} />
      <AbsoluteFill>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

const BackgroundFX: React.FC<{ accentMode: AccentMode; intensity: number }> = ({ 
  accentMode, 
  intensity,
}) => {
  const frame = useCurrentFrame();
  const t = frame / THEME.duration;

  // Get accent color
  const accent = accentMode === 'cyan' 
    ? THEME.colors.cyan 
    : accentMode === 'gold' 
      ? THEME.colors.gold 
      : accentMode === 'neutral'
        ? THEME.colors.ink
        : THEME.colors.green;

  const vignette = 0.25 + (intensity * 0.3);
  const glow = 0.12 + (intensity * 0.2);

  return (
    <>
      {/* Base gradient */}
      <AbsoluteFill
        style={{
          background: `
            radial-gradient(1200px 1200px at 50% 15%, rgba(255,255,255,0.05), transparent 60%),
            radial-gradient(900px 900px at 20% 60%, ${hexToRgba(accent, glow)}, transparent 65%),
            radial-gradient(900px 900px at 80% 70%, rgba(0,0,0,0.25), transparent 70%),
            linear-gradient(180deg, ${THEME.colors.bg1}, ${THEME.colors.bg0})
          `,
        }}
      />
      
      {/* Subtle grain / scanlines */}
      <AbsoluteFill
        style={{
          opacity: 0.06 * intensity,
          background: 'repeating-linear-gradient(180deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 2px, transparent 5px)',
          transform: `translateY(${Math.sin(t * 8) * 4}px)`,
        }}
      />
      
      {/* Vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(1200px 1600px at 50% 45%, transparent 55%, rgba(0,0,0,${vignette}) 92%)`,
        }}
      />
    </>
  );
};

// UI Corner brackets (Xbox-style)
export const UICorners: React.FC<{ opacity?: number }> = ({ opacity = 0.18 }) => {
  const pad = 46;
  const len = 86;
  const thick = 5;

  const corner = (pos: React.CSSProperties) => (
    <div style={{ position: 'absolute', ...pos }}>
      <div style={{ position: 'absolute', width: len, height: thick, background: `rgba(255,255,255,${opacity})` }} />
      <div style={{ position: 'absolute', width: thick, height: len, background: `rgba(255,255,255,${opacity})` }} />
    </div>
  );

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {corner({ left: pad, top: pad })}
      {corner({ right: pad, top: pad, transform: 'scaleX(-1)' })}
      {corner({ left: pad, bottom: pad, transform: 'scaleY(-1)' })}
      {corner({ right: pad, bottom: pad, transform: 'scale(-1,-1)' })}
    </AbsoluteFill>
  );
};
