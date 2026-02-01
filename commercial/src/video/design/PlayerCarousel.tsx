/**
 * DARK SIDE GAME — Player Carousel
 * One player at a time, CENTERED, BIG. No stacking.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img } from 'remotion';
import { THEME, CAROUSEL, PLAYERS } from './theme';
import { LabelPill } from './Typography';

interface PlayerData {
  name: string;
  number: string;
  role: string;
  image: string;
}

interface PlayerCarouselProps {
  players?: PlayerData[];
  startFrame?: number;
}

export const PlayerCarousel: React.FC<PlayerCarouselProps> = ({
  players = PLAYERS,
  startFrame = CAROUSEL.startFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate which player is currently visible
  const relativeFrame = frame; // Frame relative to carousel start (already in Sequence)
  const segmentLength = CAROUSEL.segmentLength;
  
  const playerIndex = Math.min(
    Math.floor(relativeFrame / segmentLength),
    players.length - 1
  );
  
  const segmentFrame = relativeFrame - (playerIndex * segmentLength);
  const player = players[playerIndex];
  
  if (!player) return null;

  // Transition animations
  const enter = spring({
    frame: segmentFrame,
    fps,
    config: { damping: 18, stiffness: 220, mass: 0.8 },
  });

  // Slide and fade
  const slideX = interpolate(segmentFrame, [0, 8, segmentLength - 8, segmentLength], [120, 0, 0, -120], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  
  const opacity = interpolate(segmentFrame, [0, 8, segmentLength - 8, segmentLength], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Get last name for display
  const lastName = player.name.split(' ').pop() || player.name;

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      {/* Player image - CENTERED and BIG */}
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transform: `translateX(${slideX}px) scale(${0.96 + 0.06 * enter})`,
          opacity,
        }}
      >
        <Img
          src={player.image}
          style={{
            height: 1260,
            width: 'auto',
            objectFit: 'contain',
            filter: 'drop-shadow(0 40px 120px rgba(0,0,0,0.55))',
          }}
        />
      </div>

      {/* UI Overlay */}
      <AbsoluteFill
        style={{
          padding: `${THEME.safe.top}px ${THEME.safe.right}px ${THEME.safe.bottom}px ${THEME.safe.left}px`,
          boxSizing: 'border-box',
          pointerEvents: 'none',
          opacity,
        }}
      >
        {/* Top row: pills */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <LabelPill text="DARK SIDE DEFENSE" />
          <LabelPill text="SELECT" accent />
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Bottom row: player info */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
          {/* Name and role */}
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: THEME.font.main,
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '-0.03em',
                fontSize: 90,
                lineHeight: 0.92,
                color: THEME.colors.ink,
                textShadow: `0 0 26px rgba(105,190,40,0.22)`,
              }}
            >
              {lastName}
            </div>
            <div
              style={{
                marginTop: 10,
                fontFamily: THEME.font.main,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontSize: 40,
                color: THEME.colors.inkDim,
              }}
            >
              {player.role}
            </div>
          </div>

          {/* Ghost jersey number */}
          <div
            style={{
              fontFamily: THEME.font.main,
              fontWeight: 900,
              fontSize: 130,
              letterSpacing: '-0.06em',
              color: THEME.colors.inkGhost,
              lineHeight: 1,
            }}
          >
            #{player.number}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
