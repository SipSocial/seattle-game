/**
 * DARK SIDE DEFENSE — V5 "THE REAL ONE"
 * 
 * This is for Seattle fans who are bored during Super Bowl week.
 * This is about pride, fantasy, and hope.
 * 
 * Story:
 * 1. The problem: No Seahawks football this week
 * 2. The solution: You can play as the defense
 * 3. The leader: DeMarcus Lawrence and his crew
 * 4. The fantasy: Command the Dark Side Defense
 * 5. The reward: Win tickets to watch him play for real
 * 6. The action: Play now
 */
import React from 'react';
import { 
  AbsoluteFill, 
  Sequence, 
  useCurrentFrame, 
  useVideoConfig,
  interpolate, 
  spring,
  Img,
} from 'remotion';
import { 
  COLORS, 
  DEMARCUS, 
  CREW,
  PLAYERS,
  DRINKSIP, 
  CAMPAIGN,
} from './assets';

// ============================================================================
// CONSTANTS
// ============================================================================
const FPS = 30;

// Breathing room - let moments land
const SCENES = {
  problem: { start: 0, end: 4 * FPS },         // 0-4s: The problem
  solution: { start: 4 * FPS, end: 8 * FPS },   // 4-8s: The solution
  leader: { start: 8 * FPS, end: 14 * FPS },    // 8-14s: DeMarcus + crew
  fantasy: { start: 14 * FPS, end: 19 * FPS },  // 14-19s: Choose your defender
  reward: { start: 19 * FPS, end: 25 * FPS },   // 19-25s: Win tickets
  action: { start: 25 * FPS, end: 30 * FPS },   // 25-30s: Play now
};

// Clean typography
const Type = {
  headline: {
    fontFamily: 'Arial Black, sans-serif',
    fontWeight: 900,
    letterSpacing: '-0.01em',
    lineHeight: 1.1,
  },
  body: {
    fontFamily: 'Arial, sans-serif',
    fontWeight: 600,
    letterSpacing: '0.08em',
  },
};

// ============================================================================
// SCENE 1: THE PROBLEM (0-4s)
// "No Seahawks in the Super Bowl this year."
// Let it breathe. Let it hurt.
// ============================================================================
const Scene1Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const textOpacity = interpolate(frame, [0, 20, 100, 120], [0, 1, 1, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
      {/* Seattle skyline - faded, nostalgic */}
      <AbsoluteFill style={{ opacity: 0.15 }}>
        <Img
          src={CAMPAIGN.seattleImage}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            filter: 'grayscale(0.7) brightness(0.6)',
          }}
        />
      </AbsoluteFill>

      {/* Text - centered, simple, emotional */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 60,
          opacity: textOpacity,
        }}
      >
        <div
          style={{
            ...Type.headline,
            fontSize: 52,
            color: COLORS.white,
            textAlign: 'center',
            maxWidth: 800,
          }}
        >
          No Seahawks in the Super Bowl this year.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 2: THE SOLUTION (4-8s)
// "But you can still play as the defense."
// Spark of hope.
// ============================================================================
const Scene2Solution: React.FC = () => {
  const frame = useCurrentFrame();

  const line1Opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const line2Opacity = interpolate(frame, [30, 50], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [100, 120], [1, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 60,
          gap: 30,
          opacity: fadeOut,
        }}
      >
        <div
          style={{
            ...Type.body,
            fontSize: 24,
            color: COLORS.grey,
            textTransform: 'uppercase',
            opacity: line1Opacity,
          }}
        >
          But you can still
        </div>
        <div
          style={{
            ...Type.headline,
            fontSize: 64,
            color: COLORS.green,
            textAlign: 'center',
            opacity: line2Opacity,
            textShadow: `0 0 40px ${COLORS.green}50`,
          }}
        >
          Play as the Defense
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 3: THE LEADER (8-14s)
// DeMarcus Lawrence leads the Dark Side Defense.
// Show the man. Show the crew. Make it feel real.
// ============================================================================
const Scene3Leader: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // DeMarcus fades in with presence, not slam
  const demarcusOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  const demarcusY = interpolate(frame, [0, 40], [60, 0], { extrapolateRight: 'clamp' });

  // Text fades in
  const titleOpacity = interpolate(frame, [50, 80], [0, 1], { extrapolateRight: 'clamp' });

  // Crew fades in subtly
  const crewOpacity = interpolate(frame, [80, 120], [0, 0.7], { extrapolateRight: 'clamp' });

  // Glow
  const glowIntensity = 25 + Math.sin(frame * 0.06) * 10;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.navy }}>
      {/* Dark gradient */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 150% 100% at 50% 100%, ${COLORS.navy} 0%, #000510 100%)`,
        }}
      />

      {/* Rim light */}
      <div
        style={{
          position: 'absolute',
          bottom: 200,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 350,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${COLORS.green}30 0%, transparent 70%)`,
          filter: `blur(${glowIntensity}px)`,
        }}
      />

      {/* Crew - subtle, in the shadows */}
      <div
        style={{
          position: 'absolute',
          bottom: 280,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          opacity: crewOpacity,
        }}
      >
        {CREW.slice(0, 4).map((player, i) => {
          const offsetX = (i - 1.5) * 140;
          const scale = 0.45;
          return (
            <Img
              key={player.id}
              src={player.image}
              style={{
                position: 'absolute',
                left: '50%',
                height: 550,
                width: 'auto',
                transform: `translateX(calc(-50% + ${offsetX}px)) scale(${scale})`,
                filter: 'brightness(0.5) saturate(0.7)',
              }}
            />
          );
        })}
      </div>

      {/* DeMarcus - front and center, real presence */}
      <div
        style={{
          position: 'absolute',
          bottom: 200,
          left: '50%',
          transform: `translateX(-50%) translateY(${demarcusY}px)`,
          opacity: demarcusOpacity,
          zIndex: 10,
        }}
      >
        <Img
          src={DEMARCUS.image}
          style={{
            height: 1100,
            width: 'auto',
            filter: `drop-shadow(0 0 ${glowIntensity}px ${COLORS.green}50)`,
          }}
        />
      </div>

      {/* Title - at top */}
      <div
        style={{
          position: 'absolute',
          top: 160,
          left: 60,
          right: 60,
          textAlign: 'center',
          opacity: titleOpacity,
          zIndex: 20,
        }}
      >
        <div
          style={{
            ...Type.headline,
            fontSize: 48,
            color: COLORS.green,
          }}
        >
          The Dark Side Defense
        </div>
        <div
          style={{
            ...Type.body,
            fontSize: 18,
            color: COLORS.grey,
            marginTop: 16,
            letterSpacing: '0.15em',
          }}
        >
          LED BY
        </div>
        <div
          style={{
            ...Type.headline,
            fontSize: 36,
            color: COLORS.white,
            marginTop: 8,
          }}
        >
          DeMarcus Lawrence
        </div>
      </div>

      {/* DrinkSip - bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          opacity: titleOpacity * 0.8,
          zIndex: 20,
        }}
      >
        <div style={{ ...Type.body, fontSize: 11, color: COLORS.grey, letterSpacing: '0.2em' }}>
          PRESENTED BY
        </div>
        <Img src={DRINKSIP.logo} style={{ height: 38, width: 'auto' }} />
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 4: THE FANTASY (14-19s)
// "Choose your defender. Command the defense."
// Show the selection. Make it feel like a game.
// ============================================================================
const Scene4Fantasy: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

  // Two big cards - Lawrence and Witherspoon
  const cardPlayers = [PLAYERS[0], PLAYERS[7]];

  return (
    <AbsoluteFill style={{ backgroundColor: '#080810' }}>
      <div
        style={{
          position: 'absolute',
          top: 160,
          left: 60,
          right: 60,
          bottom: 220,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 35,
        }}
      >
        {/* Title */}
        <div style={{ textAlign: 'center', opacity: titleOpacity }}>
          <div style={{ ...Type.headline, fontSize: 44, color: COLORS.white }}>
            Choose Your Defender
          </div>
          <div style={{ ...Type.body, fontSize: 18, color: COLORS.grey, marginTop: 12 }}>
            COMMAND THE DEFENSE
          </div>
        </div>

        {/* Cards - big, readable, game-like */}
        <div style={{ display: 'flex', gap: 20 }}>
          {cardPlayers.map((player, i) => {
            const delay = 25 + i * 12;
            const cardOpacity = interpolate(frame, [delay, delay + 20], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const cardY = spring({
              frame: Math.max(0, frame - delay),
              fps,
              config: { damping: 14, stiffness: 70 },
              from: 40,
              to: 0,
            });

            const isFirst = i === 0;

            return (
              <div
                key={player.id}
                style={{
                  width: 340,
                  height: 480,
                  borderRadius: 20,
                  overflow: 'hidden',
                  border: `4px solid ${isFirst ? COLORS.green : 'rgba(105, 190, 40, 0.4)'}`,
                  boxShadow: isFirst
                    ? `0 0 30px ${COLORS.green}60`
                    : `0 0 15px ${COLORS.green}30`,
                  opacity: cardOpacity,
                  transform: `translateY(${cardY}px)`,
                  position: 'relative',
                  background: '#111',
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

                {/* Jersey */}
                <div
                  style={{
                    position: 'absolute',
                    top: 14,
                    right: 16,
                    ...Type.headline,
                    fontSize: 48,
                    color: COLORS.green,
                    textShadow: `2px 2px 0 ${COLORS.navy}`,
                  }}
                >
                  #{player.jersey}
                </div>

                {/* Name */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '28px 16px 18px',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.95))',
                  }}
                >
                  <div
                    style={{
                      ...Type.headline,
                      fontSize: 24,
                      color: COLORS.white,
                      textAlign: 'center',
                    }}
                  >
                    {player.lastName}
                  </div>
                  <div
                    style={{
                      ...Type.body,
                      fontSize: 13,
                      color: COLORS.green,
                      textAlign: 'center',
                      marginTop: 6,
                    }}
                  >
                    {player.position}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 5: THE REWARD (19-25s)
// "Win 2 tickets to Super Bowl LX"
// "Watch DeMarcus compete live."
// Make it feel like a real prize.
// ============================================================================
const Scene5Reward: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "Win" entrance
  const winOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const winScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
    from: 0.8,
    to: 1,
  });

  // Ticket entrance
  const ticketOpacity = interpolate(frame, [30, 55], [0, 1], { extrapolateRight: 'clamp' });
  const ticketY = spring({
    frame: Math.max(0, frame - 30),
    fps,
    config: { damping: 14, stiffness: 60 },
    from: 50,
    to: 0,
  });

  // Detail text
  const detailOpacity = interpolate(frame, [90, 120], [0, 1], { extrapolateRight: 'clamp' });

  // Glow
  const glowIntensity = 35 + Math.sin(frame * 0.08) * 15;

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
      {/* Gold ambient */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center 40%, ${COLORS.gold}10 0%, transparent 50%)`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 160,
          left: 60,
          right: 60,
          bottom: 220,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 35,
        }}
      >
        {/* Win */}
        <div
          style={{
            ...Type.headline,
            fontSize: 90,
            color: COLORS.gold,
            opacity: winOpacity,
            transform: `scale(${winScale})`,
            textShadow: `0 0 50px ${COLORS.gold}80`,
          }}
        >
          Win
        </div>

        {/* Ticket */}
        <div
          style={{
            opacity: ticketOpacity,
            transform: `translateY(${ticketY}px)`,
          }}
        >
          <div
            style={{
              width: 520,
              padding: '32px 40px',
              background: `linear-gradient(135deg, ${COLORS.gold} 0%, ${COLORS.goldDark} 100%)`,
              borderRadius: 20,
              boxShadow: `0 0 ${glowIntensity}px ${COLORS.gold}60, 0 20px 60px rgba(0,0,0,0.5)`,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                ...Type.body,
                fontSize: 20,
                color: COLORS.navy,
                letterSpacing: '0.18em',
                marginBottom: 12,
              }}
            >
              SUPER BOWL LX
            </div>
            <div
              style={{
                ...Type.headline,
                fontSize: 56,
                color: COLORS.navy,
                lineHeight: 1,
              }}
            >
              2 Tickets
            </div>
            <div
              style={{
                ...Type.body,
                fontSize: 16,
                color: 'rgba(0,34,68,0.7)',
                marginTop: 16,
              }}
            >
              February 9 • San Francisco
            </div>
          </div>
        </div>

        {/* Detail */}
        <div
          style={{
            textAlign: 'center',
            opacity: detailOpacity,
          }}
        >
          <div style={{ ...Type.body, fontSize: 20, color: COLORS.grey }}>
            Watch DeMarcus compete live.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 6: THE ACTION (25-30s)
// "Play now at game.drinksip.com"
// Clean. Confident. Simple.
// ============================================================================
const Scene6Action: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const buttonOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: 'clamp' });
  const buttonScale = spring({
    frame: Math.max(0, frame - 20),
    fps,
    config: { damping: 12, stiffness: 80 },
    from: 0.9,
    to: 1,
  });
  const bottomOpacity = interpolate(frame, [60, 90], [0, 1], { extrapolateRight: 'clamp' });

  const glowIntensity = 20 + Math.sin(frame * 0.12) * 10;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.navy }}>
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${COLORS.navy} 0%, #000510 100%)`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 160,
          left: 60,
          right: 60,
          bottom: 160,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 35,
        }}
      >
        {/* Game title */}
        <div style={{ textAlign: 'center', opacity: titleOpacity }}>
          <div style={{ ...Type.headline, fontSize: 52, color: COLORS.white }}>
            Dark Side Defense
          </div>
        </div>

        {/* CTA Button */}
        <div
          style={{
            opacity: buttonOpacity,
            transform: `scale(${buttonScale})`,
          }}
        >
          <div
            style={{
              padding: '26px 50px',
              background: `linear-gradient(135deg, ${COLORS.green} 0%, #4a9e1c 100%)`,
              borderRadius: 16,
              boxShadow: `0 0 ${glowIntensity}px ${COLORS.green}, 0 15px 50px rgba(0,0,0,0.4)`,
            }}
          >
            <div
              style={{
                ...Type.headline,
                fontSize: 30,
                color: COLORS.white,
              }}
            >
              game.drinksip.com
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div
          style={{
            opacity: buttonOpacity,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 160,
              height: 160,
              background: COLORS.white,
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
            }}
          >
            <div
              style={{
                ...Type.body,
                fontSize: 12,
                color: COLORS.navy,
                textAlign: 'center',
              }}
            >
              SCAN TO PLAY
            </div>
          </div>
        </div>

        {/* Play Now */}
        <div
          style={{
            ...Type.headline,
            fontSize: 42,
            color: COLORS.gold,
            opacity: buttonOpacity,
            textShadow: `0 0 30px ${COLORS.gold}40`,
          }}
        >
          Play Now
        </div>

        {/* DrinkSip */}
        <div
          style={{
            opacity: bottomOpacity,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div style={{ ...Type.body, fontSize: 11, color: COLORS.grey, letterSpacing: '0.2em' }}>
            PRESENTED BY
          </div>
          <Img src={DRINKSIP.logo} style={{ height: 45, width: 'auto' }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// MAIN COMPOSITION
// ============================================================================
export const CommercialVerticalV5: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Sequence from={SCENES.problem.start} durationInFrames={SCENES.problem.end - SCENES.problem.start}>
        <Scene1Problem />
      </Sequence>

      <Sequence from={SCENES.solution.start} durationInFrames={SCENES.solution.end - SCENES.solution.start}>
        <Scene2Solution />
      </Sequence>

      <Sequence from={SCENES.leader.start} durationInFrames={SCENES.leader.end - SCENES.leader.start}>
        <Scene3Leader />
      </Sequence>

      <Sequence from={SCENES.fantasy.start} durationInFrames={SCENES.fantasy.end - SCENES.fantasy.start}>
        <Scene4Fantasy />
      </Sequence>

      <Sequence from={SCENES.reward.start} durationInFrames={SCENES.reward.end - SCENES.reward.start}>
        <Scene5Reward />
      </Sequence>

      <Sequence from={SCENES.action.start} durationInFrames={SCENES.action.end - SCENES.action.start}>
        <Scene6Action />
      </Sequence>
    </AbsoluteFill>
  );
};
