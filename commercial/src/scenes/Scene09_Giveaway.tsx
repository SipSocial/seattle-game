/**
 * Scene 09: Giveaway (38-46s)
 * WIN 2 SUPER BOWL TICKETS with gold explosion
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { BoldText, GoldTicket, FlashTransition } from '../components';
import { COLORS, FONTS, SUPER_BOWL } from '../assets';

export const Scene09_Giveaway: React.FC = () => {
  const frame = useCurrentFrame();

  // Gold particles
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    angle: (i / 30) * Math.PI * 2 + Math.random() * 0.5,
    speed: 4 + Math.random() * 4,
    size: 3 + Math.random() * 5,
  }));

  // Screen shake on entrance
  const shakeIntensity = frame < 15 ? (15 - frame) * 1.2 : 0;
  const shakeX = Math.sin(frame * 2.5) * shakeIntensity;
  const shakeY = Math.cos(frame * 3) * shakeIntensity * 0.6;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.black,
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      {/* Gold radial glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, ${COLORS.gold}25 0%, transparent 50%)`,
        }}
      />

      {/* Explosion particles */}
      {frame < 50 &&
        particles.map((p) => {
          const distance = frame * p.speed;
          const x = Math.cos(p.angle) * distance;
          const y = Math.sin(p.angle) * distance;
          const opacity = interpolate(frame, [0, 50], [1, 0]);

          return (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: p.size,
                height: p.size,
                borderRadius: '50%',
                backgroundColor: COLORS.gold,
                transform: `translate(${x}px, ${y}px)`,
                opacity,
                boxShadow: `0 0 10px ${COLORS.gold}`,
              }}
            />
          );
        })}

      {/* Content */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 40,
        }}
      >
        {/* WIN */}
        <BoldText
          fontSize={160}
          color={COLORS.gold}
          animation="slam"
          delay={5}
          glow={COLORS.gold}
        >
          WIN
        </BoldText>

        {/* Ticket graphic */}
        <GoldTicket delay={25} />

        {/* Watch DeMarcus */}
        <div
          style={{
            ...FONTS.body,
            fontSize: 32,
            color: COLORS.grey,
            letterSpacing: '0.1em',
            opacity: interpolate(frame, [80, 100], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        >
          WATCH DEMARCUS COMPETE LIVE
        </div>
      </AbsoluteFill>

      {/* Gold flash */}
      <FlashTransition color={COLORS.gold} duration={12} />
    </AbsoluteFill>
  );
};
