/**
 * PlayerShowcase - Scene 2 (2-5 seconds)
 * 
 * Features:
 * - DeMarcus Lawrence & Nick Emmanwori superhero sprites
 * - Player stats with spring animation
 * - "ELITE DEFENSE" text overlay
 * - Dynamic player transitions
 */
import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
  staticFile,
} from 'remotion';
import { THEME } from '../compositions/SplashVideo';

// Player data using local sprites
const FEATURED_PLAYERS = [
  {
    name: 'DeMarcus Lawrence',
    number: '0',
    position: 'DEFENSIVE END',
    sprite: staticFile('sprites/players/defense-0-demarcus-lawrence.png'),
    stats: { tackles: 47, sacks: 8.5, forced: 3 },
  },
  {
    name: 'Nick Emmanwori',
    number: '3',
    position: 'SAFETY',
    sprite: staticFile('sprites/players/defense-3-nick-emmanwori.png'),
    stats: { tackles: 89, ints: 2, pbu: 8 },
  },
];

export const PlayerShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene lasts 90 frames (3 seconds)
  // Switch player at frame 45
  const playerIndex = frame < 45 ? 0 : 1;
  const localFrame = frame < 45 ? frame : frame - 45;
  const player = FEATURED_PLAYERS[playerIndex];

  // Spring animation for player entrance
  const enterSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 16, stiffness: 180, mass: 0.8 },
  });

  // Slide and fade for player
  const slideX = interpolate(enterSpring, [0, 1], [100, 0]);
  const playerOpacity = interpolate(localFrame, [0, 8, 37, 45], [0, 1, 1, 0.3]);

  return (
    <AbsoluteFill>
      {/* "ELITE DEFENSE" header */}
      <EliteDefenseHeader frame={frame} fps={fps} />

      {/* Player sprite - centered and large */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          transform: `translateX(${slideX}px) scale(${0.95 + 0.05 * enterSpring})`,
          opacity: playerOpacity,
        }}
      >
        <Img
          src={player.sprite}
          style={{
            height: 1100,
            width: 'auto',
            objectFit: 'contain',
            filter: 'drop-shadow(0 40px 100px rgba(0,0,0,0.6))',
          }}
        />
      </AbsoluteFill>

      {/* Player info overlay */}
      <PlayerInfoOverlay 
        player={player} 
        frame={localFrame} 
        fps={fps}
        enterSpring={enterSpring}
      />

      {/* Stats panel */}
      <StatsPanel 
        player={player} 
        frame={localFrame} 
        fps={fps}
      />
    </AbsoluteFill>
  );
};

// Elite Defense header
interface HeaderProps {
  frame: number;
  fps: number;
}

const EliteDefenseHeader: React.FC<HeaderProps> = ({ frame, fps }) => {
  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 160 },
  });

  return (
    <AbsoluteFill
      style={{
        paddingTop: THEME.safe.top,
        paddingLeft: THEME.safe.left,
        paddingRight: THEME.safe.right,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          opacity: headerSpring,
          transform: `translateY(${interpolate(headerSpring, [0, 1], [-20, 0])}px)`,
        }}
      >
        <div
          style={{
            padding: '16px 32px',
            borderRadius: 999,
            background: 'rgba(105,190,40,0.15)',
            border: '1px solid rgba(105,190,40,0.3)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <span
            style={{
              fontFamily: THEME.font,
              fontWeight: 900,
              fontSize: THEME.type.mid,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: THEME.colors.green,
              textShadow: `0 0 20px ${THEME.colors.green}`,
            }}
          >
            ELITE DEFENSE
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Player info at bottom
interface PlayerInfoProps {
  player: typeof FEATURED_PLAYERS[0];
  frame: number;
  fps: number;
  enterSpring: number;
}

const PlayerInfoOverlay: React.FC<PlayerInfoProps> = ({ 
  player, 
  frame, 
  fps, 
  enterSpring,
}) => {
  const infoDelay = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { damping: 18, stiffness: 140 },
  });

  return (
    <AbsoluteFill
      style={{
        paddingLeft: THEME.safe.left,
        paddingRight: THEME.safe.right,
        paddingBottom: THEME.safe.bottom,
        justifyContent: 'flex-end',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          opacity: infoDelay,
          transform: `translateY(${interpolate(infoDelay, [0, 1], [30, 0])}px)`,
        }}
      >
        {/* Name and position */}
        <div>
          <div
            style={{
              fontFamily: THEME.font,
              fontWeight: 900,
              fontSize: 72,
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              color: THEME.colors.ink,
              lineHeight: 0.95,
              textShadow: '0 4px 30px rgba(0,0,0,0.8)',
            }}
          >
            {player.name.split(' ')[1]}
          </div>
          <div
            style={{
              marginTop: 8,
              fontFamily: THEME.font,
              fontWeight: 800,
              fontSize: THEME.type.small,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: THEME.colors.inkDim,
            }}
          >
            {player.position}
          </div>
        </div>

        {/* Jersey number */}
        <div
          style={{
            fontFamily: THEME.font,
            fontWeight: 900,
            fontSize: 120,
            letterSpacing: '-0.06em',
            color: 'rgba(246,247,251,0.12)',
            lineHeight: 1,
          }}
        >
          #{player.number}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Stats panel
interface StatsPanelProps {
  player: typeof FEATURED_PLAYERS[0];
  frame: number;
  fps: number;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ player, frame, fps }) => {
  const statsDelay = spring({
    frame: Math.max(0, frame - 15),
    fps,
    config: { damping: 16, stiffness: 120 },
  });

  const stats = Object.entries(player.stats);

  return (
    <AbsoluteFill
      style={{
        paddingLeft: THEME.safe.left,
        paddingRight: THEME.safe.right,
        paddingTop: 200,
        alignItems: 'flex-end',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          opacity: statsDelay,
          transform: `translateX(${interpolate(statsDelay, [0, 1], [40, 0])}px)`,
        }}
      >
        {stats.map(([key, value], i) => {
          const statSpring = spring({
            frame: Math.max(0, frame - 18 - i * 4),
            fps,
            config: { damping: 14, stiffness: 160 },
          });

          return (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 12,
                opacity: statSpring,
                transform: `translateX(${interpolate(statSpring, [0, 1], [20, 0])}px)`,
              }}
            >
              <span
                style={{
                  fontFamily: THEME.font,
                  fontWeight: 900,
                  fontSize: 42,
                  color: THEME.colors.green,
                  textShadow: `0 0 20px ${THEME.colors.green}`,
                }}
              >
                {value}
              </span>
              <span
                style={{
                  fontFamily: THEME.font,
                  fontWeight: 700,
                  fontSize: 22,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: THEME.colors.inkDim,
                }}
              >
                {key.toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
