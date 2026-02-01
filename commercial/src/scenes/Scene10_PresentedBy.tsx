/**
 * Scene 10: Presented By (46-50s)
 * DeMarcus portrait + DrinkSip logo side by side
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Img } from 'remotion';
import { COLORS, FONTS, DEMARCUS, DRINKSIP } from '../assets';

export const Scene10_PresentedBy: React.FC = () => {
  const frame = useCurrentFrame();

  // DeMarcus slide in from left
  const playerX = interpolate(frame, [0, 20], [-200, 0], {
    extrapolateRight: 'clamp',
  });
  const playerOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Logo slide in from right
  const logoX = interpolate(frame, [10, 30], [200, 0], {
    extrapolateRight: 'clamp',
  });
  const logoOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // "Presented by" fade
  const textOpacity = interpolate(frame, [25, 40], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Glow
  const glow = 15 + Math.sin(frame * 0.1) * 5;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.navy,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 100,
      }}
    >
      {/* DeMarcus portrait */}
      <div
        style={{
          opacity: playerOpacity,
          transform: `translateX(${playerX}px)`,
        }}
      >
        <div
          style={{
            width: 320,
            height: 400,
            borderRadius: 16,
            overflow: 'hidden',
            border: `4px solid ${COLORS.green}`,
            boxShadow: `0 0 ${glow}px ${COLORS.green}, 0 20px 60px rgba(0,0,0,0.5)`,
          }}
        >
          <Img
            src={DEMARCUS.image}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      </div>

      {/* Center divider and text */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          opacity: textOpacity,
        }}
      >
        <div
          style={{
            ...FONTS.body,
            fontSize: 28,
            color: COLORS.grey,
            letterSpacing: '0.2em',
          }}
        >
          PRESENTED BY
        </div>
      </div>

      {/* DrinkSip logo */}
      <div
        style={{
          opacity: logoOpacity,
          transform: `translateX(${logoX}px)`,
        }}
      >
        <Img
          src={DRINKSIP.logo}
          style={{
            height: 120,
            width: 'auto',
            filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.5))',
          }}
        />
        <div
          style={{
            ...FONTS.body,
            fontSize: 18,
            color: COLORS.grey,
            textAlign: 'center',
            marginTop: 15,
            letterSpacing: '0.15em',
          }}
        >
          {DRINKSIP.tagline.toUpperCase()}
        </div>
      </div>
    </AbsoluteFill>
  );
};
