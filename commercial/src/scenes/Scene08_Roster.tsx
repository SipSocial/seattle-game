/**
 * Scene 08: Full Roster (34-38s)
 * All 11 defenders grid with "CHOOSE YOUR DEFENDER"
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Img } from 'remotion';
import { BoldText } from '../components';
import { COLORS, FONTS, PLAYERS } from '../assets';

export const Scene08_Roster: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.navy,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
      }}
    >
      {/* Title */}
      <BoldText
        fontSize={70}
        color={COLORS.white}
        animation="slam"
        glow={COLORS.green}
      >
        CHOOSE YOUR DEFENDER
      </BoldText>

      {/* Player grid - 2 rows */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          marginTop: 50,
        }}
      >
        {/* Row 1: 6 players */}
        <div style={{ display: 'flex', gap: 15 }}>
          {PLAYERS.slice(0, 6).map((player, i) => {
            const delay = i * 3;
            const opacity = interpolate(frame, [delay + 20, delay + 30], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const scale = interpolate(frame, [delay + 20, delay + 28], [0.8, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            return (
              <div
                key={player.id}
                style={{
                  width: 140,
                  height: 175,
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: `2px solid ${COLORS.green}`,
                  opacity,
                  transform: `scale(${scale})`,
                  boxShadow: `0 0 15px ${COLORS.green}40`,
                }}
              >
                <Img
                  src={player.image}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 5,
                    right: 5,
                    ...FONTS.number,
                    fontSize: 20,
                    color: COLORS.green,
                    textShadow: `1px 1px 0 ${COLORS.navy}`,
                  }}
                >
                  #{player.jersey}
                </div>
              </div>
            );
          })}
        </div>

        {/* Row 2: 5 players */}
        <div style={{ display: 'flex', gap: 15, justifyContent: 'center' }}>
          {PLAYERS.slice(6, 11).map((player, i) => {
            const delay = (i + 6) * 3;
            const opacity = interpolate(frame, [delay + 20, delay + 30], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const scale = interpolate(frame, [delay + 20, delay + 28], [0.8, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            return (
              <div
                key={player.id}
                style={{
                  width: 140,
                  height: 175,
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: `2px solid ${COLORS.green}`,
                  opacity,
                  transform: `scale(${scale})`,
                  boxShadow: `0 0 15px ${COLORS.green}40`,
                }}
              >
                <Img
                  src={player.image}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 5,
                    right: 5,
                    ...FONTS.number,
                    fontSize: 20,
                    color: COLORS.green,
                    textShadow: `1px 1px 0 ${COLORS.navy}`,
                  }}
                >
                  #{player.jersey}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
