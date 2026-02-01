/**
 * Scene 12: Final Logo Lock (56-60s)
 * Clean logo lockup with DrinkSip
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Img } from 'remotion';
import { COLORS, FONTS, GAME, DRINKSIP, SUPER_BOWL } from '../assets';

export const Scene12_LogoLock: React.FC = () => {
  const frame = useCurrentFrame();

  // Fade in
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Scale
  const scale = interpolate(frame, [0, 15], [0.95, 1], {
    extrapolateRight: 'clamp',
  });

  // Glow pulse
  const glow = 20 + Math.sin(frame * 0.1) * 10;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.black,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      {/* Game title */}
      <div
        style={{
          ...FONTS.headline,
          fontSize: 90,
          color: COLORS.white,
          textShadow: `0 0 ${glow}px ${COLORS.green}, 0 4px 20px rgba(0,0,0,0.8)`,
          textAlign: 'center',
          lineHeight: 1.1,
        }}
      >
        DARK SIDE
        <br />
        <span style={{ color: COLORS.green }}>DEFENSE</span>
      </div>

      {/* Powered by DrinkSip */}
      <div
        style={{
          marginTop: 50,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 15,
        }}
      >
        <div
          style={{
            ...FONTS.body,
            fontSize: 16,
            color: COLORS.grey,
            letterSpacing: '0.25em',
          }}
        >
          POWERED BY
        </div>
        <Img
          src={DRINKSIP.logo}
          style={{
            height: 50,
            width: 'auto',
            filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.5))',
          }}
        />
      </div>

      {/* URL small */}
      <div
        style={{
          position: 'absolute',
          bottom: 50,
          ...FONTS.body,
          fontSize: 22,
          color: COLORS.grey,
          letterSpacing: '0.1em',
        }}
      >
        {GAME.url}
      </div>

      {/* Super Bowl reminder */}
      <div
        style={{
          position: 'absolute',
          bottom: 90,
          ...FONTS.body,
          fontSize: 18,
          color: COLORS.gold,
          letterSpacing: '0.15em',
        }}
      >
        {SUPER_BOWL.name} • {SUPER_BOWL.date.toUpperCase()}
      </div>
    </AbsoluteFill>
  );
};
