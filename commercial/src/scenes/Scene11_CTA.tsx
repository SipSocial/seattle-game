/**
 * Scene 11: Call to Action (50-56s)
 * PLAY FREE NOW + URL massive and unmissable
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Img } from 'remotion';
import { BoldText, CTAButton } from '../components';
import { COLORS, FONTS, GAME, CAMPAIGN } from '../assets';

export const Scene11_CTA: React.FC = () => {
  const frame = useCurrentFrame();

  // Background parallax
  const bgScale = interpolate(frame, [0, 180], [1.15, 1.05], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.navy }}>
      {/* Stadium background */}
      <AbsoluteFill style={{ opacity: 0.25 }}>
        <Img
          src={CAMPAIGN.stadiumImage}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${bgScale})`,
            filter: 'saturate(0.5)',
          }}
        />
      </AbsoluteFill>

      {/* Gradient overlay */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(135deg, ${COLORS.navy}dd 0%, ${COLORS.navy}aa 100%)`,
        }}
      />

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
        {/* PLAY FREE NOW */}
        <BoldText
          fontSize={80}
          color={COLORS.white}
          animation="slide-up"
          delay={0}
        >
          PLAY FREE NOW
        </BoldText>

        {/* URL Button */}
        <CTAButton text={GAME.url} delay={20} />

        {/* Enter to win reminder */}
        <div
          style={{
            ...FONTS.headline,
            fontSize: 44,
            color: COLORS.gold,
            opacity: interpolate(frame, [60, 80], [0, 1], { extrapolateRight: 'clamp' }),
            textShadow: `0 0 30px ${COLORS.gold}50`,
          }}
        >
          ENTER TO WIN
        </div>
      </AbsoluteFill>

      {/* Corner accents */}
      {[
        { top: 40, left: 40, borderTop: true, borderLeft: true },
        { top: 40, right: 40, borderTop: true, borderRight: true },
        { bottom: 40, left: 40, borderBottom: true, borderLeft: true },
        { bottom: 40, right: 40, borderBottom: true, borderRight: true },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            ...pos,
            width: 60,
            height: 60,
            borderColor: COLORS.green,
            borderWidth: 3,
            borderStyle: 'solid',
            borderTop: pos.borderTop ? undefined : 'none',
            borderBottom: pos.borderBottom ? undefined : 'none',
            borderLeft: pos.borderLeft ? undefined : 'none',
            borderRight: pos.borderRight ? undefined : 'none',
            opacity: 0.6,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
