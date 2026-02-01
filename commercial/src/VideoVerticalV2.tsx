/**
 * DARK SIDE DEFENSE — HARMON-LEVEL GAME COMMERCIAL (9:16)
 * 
 * SINGLE IDEA: "You don't play as one hero. You command a defense."
 * 
 * POWER DYNAMIC:
 * - DeMarcus Lawrence is the leader
 * - The Dark Side Defense is the weapon
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
  Audio,
  staticFile,
} from 'remotion';
import { 
  COLORS, 
  FONTS,
  DEMARCUS, 
  CREW,
  PLAYERS,
  DRINKSIP, 
  GAME, 
  SUPER_BOWL,
} from './assets';

// ============================================================================
// SAFE AREAS (HARD RULES)
// ============================================================================
const SAFE = {
  top: 140,
  bottom: 220,
  sides: 90,
};

const SAFE_HEIGHT = 1920 - SAFE.top - SAFE.bottom; // 1560px
const SAFE_WIDTH = 1080 - SAFE.sides * 2; // 900px

// ============================================================================
// TIMING (30 seconds @ 30fps = 900 frames)
// ============================================================================
const FPS = 30;
const SCENES = {
  hook: { start: 0, end: 3 * FPS },           // 0-3s
  leader: { start: 3 * FPS, end: 10 * FPS },   // 3-10s
  identity: { start: 10 * FPS, end: 13 * FPS }, // 10-13s
  proof: { start: 13 * FPS, end: 19 * FPS },    // 13-19s
  reward: { start: 19 * FPS, end: 25 * FPS },   // 19-25s
  cta: { start: 25 * FPS, end: 30 * FPS },      // 25-30s
};

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

// Consistent text styling
const Title: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  opacity?: number;
  transform?: string;
}> = ({ children, size = 72, color = COLORS.white, opacity = 1, transform }) => (
  <div
    style={{
      fontFamily: 'Arial Black, Impact, sans-serif',
      fontWeight: 900,
      fontSize: size,
      color,
      textTransform: 'uppercase',
      letterSpacing: '-0.02em',
      textAlign: 'center',
      lineHeight: 0.95,
      opacity,
      transform,
      textShadow: '0 4px 30px rgba(0,0,0,0.8)',
    }}
  >
    {children}
  </div>
);

const Subtitle: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  opacity?: number;
}> = ({ children, size = 24, color = COLORS.grey, opacity = 1 }) => (
  <div
    style={{
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontWeight: 600,
      fontSize: size,
      color,
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      textAlign: 'center',
      opacity,
    }}
  >
    {children}
  </div>
);

// ============================================================================
// SCENE 1: THE HOOK (0-3s)
// Purpose: Stop the scroll with authority.
// Minimal text. Big type. High contrast. Clear tension.
// ============================================================================
const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Simple fade in, hold, fade out
  const opacity = interpolate(frame, [0, 8, 70, 90], [0, 1, 1, 0], {
    extrapolateRight: 'clamp',
  });

  // Subtle scale for weight
  const scale = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 100 },
    from: 0.92,
    to: 1,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Centered within safe area */}
      <div
        style={{
          position: 'absolute',
          top: SAFE.top,
          left: SAFE.sides,
          right: SAFE.sides,
          bottom: SAFE.bottom,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          opacity,
          transform: `scale(${scale})`,
        }}
      >
        <Title size={88}>NO FOOTBALL</Title>
        <Title size={88}>THIS WEEK?</Title>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 2: THE LEADER + THE UNIT (3-10s)
// Purpose: Declare the power structure.
// DeMarcus enters first. Defense stacks behind. Poster-worthy.
// ============================================================================
const Scene2Leader: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // DeMarcus entrance - rises from bottom with authority
  const demarcusY = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 60 },
    from: 300,
    to: 0,
  });
  const demarcusOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const demarcusScale = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 80 },
    from: 0.9,
    to: 1,
  });

  // Crew entrance - delayed, subtler
  const crewDelay = 25;
  const crewOpacity = interpolate(frame, [crewDelay, crewDelay + 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const crewY = spring({
    frame: Math.max(0, frame - crewDelay),
    fps,
    config: { damping: 20, stiffness: 50 },
    from: 100,
    to: 0,
  });

  // Text appears after visuals establish
  const textOpacity = interpolate(frame, [80, 100], [0, 1], { extrapolateRight: 'clamp' });

  // Glow pulse (subtle)
  const glowIntensity = 30 + Math.sin(frame * 0.08) * 10;

  // DeMarcus height: 85% of safe area height
  const demarcusHeight = SAFE_HEIGHT * 0.85;

  // Crew positioning - shallow V formation behind DeMarcus
  const crewPositions = [
    // Left side (back to front)
    { x: -180, y: 60, scale: 0.55, zIndex: 1 },
    { x: -120, y: 30, scale: 0.65, zIndex: 2 },
    { x: -70, y: 10, scale: 0.72, zIndex: 3 },
    // Right side (back to front)
    { x: 180, y: 60, scale: 0.55, zIndex: 1 },
    { x: 120, y: 30, scale: 0.65, zIndex: 2 },
    { x: 70, y: 10, scale: 0.72, zIndex: 3 },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.navy }}>
      {/* Dark gradient base */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 120% 80% at 50% 85%, ${COLORS.navy} 0%, #000510 100%)`,
        }}
      />

      {/* Shared light source glow - behind all players */}
      <div
        style={{
          position: 'absolute',
          bottom: SAFE.bottom + 50,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 500,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${COLORS.green}35 0%, transparent 70%)`,
          filter: `blur(${glowIntensity}px)`,
        }}
      />

      {/* CREW - Stacked behind DeMarcus in V formation */}
      <div
        style={{
          position: 'absolute',
          bottom: SAFE.bottom,
          left: '50%',
          transform: `translateX(-50%) translateY(${crewY}px)`,
          opacity: crewOpacity,
        }}
      >
        {CREW.slice(0, 6).map((player, i) => {
          const pos = crewPositions[i];
          const crewHeight = demarcusHeight * pos.scale;

          return (
            <Img
              key={player.id}
              src={player.image}
              style={{
                position: 'absolute',
                bottom: 0,
                left: '50%',
                height: crewHeight,
                width: 'auto',
                transform: `translateX(calc(-50% + ${pos.x}px)) translateY(${pos.y}px)`,
                zIndex: pos.zIndex,
                filter: `brightness(${0.6 + pos.scale * 0.3}) saturate(0.85)`,
              }}
            />
          );
        })}
      </div>

      {/* DEMARCUS - The Leader, front and center */}
      <div
        style={{
          position: 'absolute',
          bottom: SAFE.bottom,
          left: '50%',
          transform: `translateX(-50%) translateY(${demarcusY}px) scale(${demarcusScale})`,
          opacity: demarcusOpacity,
          zIndex: 10,
        }}
      >
        <Img
          src={DEMARCUS.image}
          style={{
            height: demarcusHeight,
            width: 'auto',
            filter: `drop-shadow(0 0 ${glowIntensity}px rgba(105, 190, 40, 0.4))`,
          }}
        />
      </div>

      {/* TEXT - Within safe area, above players */}
      <div
        style={{
          position: 'absolute',
          top: SAFE.top + 40,
          left: SAFE.sides,
          right: SAFE.sides,
          textAlign: 'center',
          opacity: textOpacity,
          zIndex: 20,
        }}
      >
        <Title size={56} color={COLORS.green}>THE DARK SIDE</Title>
        <Title size={56}>DEFENSE</Title>
        <div style={{ height: 24 }} />
        <Subtitle size={20} color={COLORS.grey}>LED BY</Subtitle>
        <div style={{ height: 8 }} />
        <Subtitle size={28} color={COLORS.white}>DEMARCUS LAWRENCE</Subtitle>
      </div>

      {/* DrinkSip - bottom safe area */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          opacity: textOpacity * 0.9,
          zIndex: 20,
        }}
      >
        <Subtitle size={12} color={COLORS.grey}>PRESENTED BY</Subtitle>
        <Img
          src={DRINKSIP.logo}
          style={{ height: 40, width: 'auto' }}
        />
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 3: THE IDENTITY SLAM (10-13s)
// Purpose: Burn the idea into memory.
// Short. Heavy. Decisive. Typography bold, minimal, centered.
// ============================================================================
const Scene3Identity: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Screen shake on impact
  const shakeIntensity = frame < 15 ? Math.max(0, 15 - frame) * 1.2 : 0;
  const shakeX = Math.sin(frame * 2.8) * shakeIntensity;
  const shakeY = Math.cos(frame * 3.2) * shakeIntensity * 0.5;

  // Line 1: DARK SIDE
  const line1Scale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 200 },
    from: 3,
    to: 1,
  });
  const line1Opacity = interpolate(frame, [0, 5], [0, 1], { extrapolateRight: 'clamp' });

  // Line 2: DEFENSE (delayed by 8 frames)
  const line2Frame = Math.max(0, frame - 8);
  const line2Scale = spring({
    frame: line2Frame,
    fps,
    config: { damping: 12, stiffness: 200 },
    from: 3,
    to: 1,
  });
  const line2Opacity = interpolate(line2Frame, [0, 5], [0, 1], { extrapolateRight: 'clamp' });

  // Flash on first impact
  const flashOpacity = interpolate(frame, [0, 3, 8], [0.9, 0, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#000',
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      {/* Green radial glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, ${COLORS.green}20 0%, transparent 60%)`,
        }}
      />

      {/* Centered title */}
      <div
        style={{
          position: 'absolute',
          top: SAFE.top,
          left: SAFE.sides,
          right: SAFE.sides,
          bottom: SAFE.bottom,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
        }}
      >
        <div
          style={{
            opacity: line1Opacity,
            transform: `scale(${line1Scale})`,
          }}
        >
          <Title size={120} color={COLORS.white}>DARK SIDE</Title>
        </div>
        <div
          style={{
            opacity: line2Opacity,
            transform: `scale(${line2Scale})`,
          }}
        >
          <Title size={120} color={COLORS.green}>DEFENSE</Title>
        </div>
      </div>

      {/* Impact flash */}
      <AbsoluteFill
        style={{
          backgroundColor: COLORS.white,
          opacity: flashOpacity,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 4: PROOF (13-19s)
// Purpose: Show this is a real system, not marketing fluff.
// Player selection UI. DeMarcus highlighted. Clean, game-quality.
// "I'm choosing a defense, not a skin."
// ============================================================================
const Scene4Proof: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Show 4 players: Lawrence (highlighted), then 3 others
  const rosterPlayers = [
    { ...PLAYERS[0], highlight: true },  // Lawrence
    PLAYERS[7],  // Witherspoon
    PLAYERS[1],  // Williams
    PLAYERS[4],  // Nwosu
  ];

  // Title fade in
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  // Card dimensions - LARGE and readable
  const cardWidth = 200;
  const cardHeight = 260;
  const cardGap = 16;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Subtle dark gradient */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, #0a0a15 0%, #000 100%)`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: SAFE.top,
          left: SAFE.sides,
          right: SAFE.sides,
          bottom: SAFE.bottom,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 40,
        }}
      >
        {/* Header */}
        <div style={{ opacity: titleOpacity }}>
          <Title size={44}>CHOOSE YOUR</Title>
          <Title size={44} color={COLORS.green}>DEFENDER</Title>
        </div>

        {/* Cards - 2x2 grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(2, ${cardWidth}px)`,
            gap: cardGap,
          }}
        >
          {rosterPlayers.map((player, i) => {
            const delay = 20 + i * 5;
            const cardOpacity = interpolate(frame, [delay, delay + 12], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const cardY = interpolate(frame, [delay, delay + 15], [30, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            const isHighlight = (player as any).highlight;
            const borderColor = isHighlight ? COLORS.green : 'rgba(105, 190, 40, 0.4)';
            const borderWidth = isHighlight ? 4 : 2;
            const glowSize = isHighlight ? 20 : 8;

            return (
              <div
                key={player.id}
                style={{
                  width: cardWidth,
                  height: cardHeight,
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: `${borderWidth}px solid ${borderColor}`,
                  boxShadow: `0 0 ${glowSize}px ${borderColor}, 0 10px 30px rgba(0,0,0,0.5)`,
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

                {/* Jersey number */}
                <div
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 12,
                    fontFamily: 'Impact, Arial Black, sans-serif',
                    fontSize: 32,
                    fontWeight: 900,
                    color: COLORS.green,
                    textShadow: `2px 2px 0 ${COLORS.navy}, 0 0 10px rgba(0,0,0,0.8)`,
                  }}
                >
                  #{player.jersey}
                </div>

                {/* Name bar */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '20px 12px 14px',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.95))',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'Arial Black, sans-serif',
                      fontSize: 16,
                      fontWeight: 900,
                      color: COLORS.white,
                      textTransform: 'uppercase',
                      textAlign: 'center',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {player.lastName}
                  </div>
                  <div
                    style={{
                      fontFamily: 'Arial, sans-serif',
                      fontSize: 11,
                      color: COLORS.green,
                      textTransform: 'uppercase',
                      textAlign: 'center',
                      letterSpacing: '0.1em',
                      marginTop: 4,
                    }}
                  >
                    {player.position}
                  </div>
                </div>

                {/* Highlight indicator for DeMarcus */}
                {isHighlight && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      padding: '4px 10px',
                      background: COLORS.green,
                      borderRadius: 4,
                      fontFamily: 'Arial, sans-serif',
                      fontSize: 10,
                      fontWeight: 700,
                      color: COLORS.navy,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    LEADER
                  </div>
                )}
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
// Purpose: Emotional spike. Ticket is BIG. Minimal copy.
// ============================================================================
const Scene5Reward: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "WIN" entrance
  const winScale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 150 },
    from: 0.5,
    to: 1,
  });
  const winOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

  // Ticket entrance (delayed)
  const ticketDelay = 15;
  const ticketY = spring({
    frame: Math.max(0, frame - ticketDelay),
    fps,
    config: { damping: 14, stiffness: 80 },
    from: 60,
    to: 0,
  });
  const ticketOpacity = interpolate(frame, [ticketDelay, ticketDelay + 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Details (delayed more)
  const detailsOpacity = interpolate(frame, [70, 90], [0, 1], { extrapolateRight: 'clamp' });

  // Gold particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    angle: (i / 20) * Math.PI * 2 + Math.random() * 0.5,
    speed: 3 + Math.random() * 4,
    size: 3 + Math.random() * 4,
    delay: Math.random() * 10,
  }));

  // Glow pulse
  const glowIntensity = 35 + Math.sin(frame * 0.1) * 15;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Gold radial */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center 40%, ${COLORS.gold}15 0%, transparent 50%)`,
        }}
      />

      {/* Particles */}
      {frame > 5 && frame < 80 &&
        particles.map((p) => {
          const pFrame = Math.max(0, frame - 5 - p.delay);
          const distance = pFrame * p.speed;
          const x = Math.cos(p.angle) * distance;
          const y = Math.sin(p.angle) * distance - pFrame * 0.5;
          const opacity = interpolate(pFrame, [0, 10, 50], [0, 1, 0], { extrapolateRight: 'clamp' });

          return (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                top: '38%',
                left: '50%',
                width: p.size,
                height: p.size,
                borderRadius: '50%',
                backgroundColor: COLORS.gold,
                transform: `translate(${x}px, ${y}px)`,
                opacity,
                boxShadow: `0 0 8px ${COLORS.gold}`,
              }}
            />
          );
        })}

      <div
        style={{
          position: 'absolute',
          top: SAFE.top,
          left: SAFE.sides,
          right: SAFE.sides,
          bottom: SAFE.bottom,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 30,
        }}
      >
        {/* WIN */}
        <div
          style={{
            opacity: winOpacity,
            transform: `scale(${winScale})`,
          }}
        >
          <Title size={140} color={COLORS.gold}>WIN</Title>
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
              width: 380,
              padding: '28px 36px',
              background: `linear-gradient(135deg, ${COLORS.gold} 0%, ${COLORS.goldDark} 100%)`,
              borderRadius: 16,
              boxShadow: `0 0 ${glowIntensity}px ${COLORS.gold}60, 0 20px 50px rgba(0,0,0,0.5)`,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: 'Arial Black, sans-serif',
                fontSize: 18,
                fontWeight: 900,
                color: COLORS.navy,
                letterSpacing: '0.15em',
                marginBottom: 8,
              }}
            >
              SUPER BOWL LX
            </div>
            <div
              style={{
                fontFamily: 'Arial Black, sans-serif',
                fontSize: 48,
                fontWeight: 900,
                color: COLORS.navy,
                lineHeight: 1,
              }}
            >
              2 TICKETS
            </div>
            <div
              style={{
                fontFamily: 'Arial, sans-serif',
                fontSize: 16,
                fontWeight: 700,
                color: 'rgba(0,34,68,0.7)',
                letterSpacing: '0.1em',
                marginTop: 10,
              }}
            >
              FEBRUARY 9 • SAN FRANCISCO
            </div>
          </div>
        </div>

        {/* Detail */}
        <div style={{ opacity: detailsOpacity, textAlign: 'center' }}>
          <Subtitle size={22} color={COLORS.grey}>WATCH DEMARCUS</Subtitle>
          <Subtitle size={22} color={COLORS.white}>COMPETE LIVE</Subtitle>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 6: CTA (25-30s)
// Purpose: Action without friction. One action. Clear button. End clean.
// ============================================================================
const Scene6CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Element entrances
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const buttonOpacity = interpolate(frame, [15, 30], [0, 1], { extrapolateRight: 'clamp' });
  const buttonScale = spring({
    frame: Math.max(0, frame - 15),
    fps,
    config: { damping: 12, stiffness: 100 },
    from: 0.9,
    to: 1,
  });
  const brandOpacity = interpolate(frame, [50, 70], [0, 1], { extrapolateRight: 'clamp' });

  // Glow pulse on button
  const glowIntensity = 20 + Math.sin(frame * 0.15) * 10;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.navy }}>
      {/* Subtle gradient */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${COLORS.navy} 0%, #000510 100%)`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: SAFE.top,
          left: SAFE.sides,
          right: SAFE.sides,
          bottom: SAFE.bottom,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
        }}
      >
        {/* Game title */}
        <div style={{ opacity: titleOpacity }}>
          <Title size={64}>DARK SIDE</Title>
          <Title size={64} color={COLORS.green}>DEFENSE</Title>
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
              padding: '24px 56px',
              background: `linear-gradient(135deg, ${COLORS.green} 0%, #4a9e1c 100%)`,
              borderRadius: 14,
              boxShadow: `0 0 ${glowIntensity}px ${COLORS.green}, 0 12px 40px rgba(0,0,0,0.4)`,
            }}
          >
            <div
              style={{
                fontFamily: 'Arial Black, sans-serif',
                fontSize: 32,
                fontWeight: 900,
                color: COLORS.white,
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
              }}
            >
              {GAME.url}
            </div>
          </div>
        </div>

        {/* PLAY NOW */}
        <div style={{ opacity: buttonOpacity }}>
          <Title size={36} color={COLORS.gold}>PLAY NOW</Title>
        </div>

        {/* Brand lockup */}
        <div
          style={{
            opacity: brandOpacity,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            marginTop: 20,
          }}
        >
          <Subtitle size={12} color={COLORS.grey}>PRESENTED BY</Subtitle>
          <Img
            src={DRINKSIP.logo}
            style={{ height: 45, width: 'auto' }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// MAIN COMPOSITION
// ============================================================================
export const CommercialVerticalV2: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Scene 1: The Hook (0-3s) */}
      <Sequence from={SCENES.hook.start} durationInFrames={SCENES.hook.end - SCENES.hook.start}>
        <Scene1Hook />
      </Sequence>

      {/* Scene 2: The Leader + The Unit (3-10s) */}
      <Sequence from={SCENES.leader.start} durationInFrames={SCENES.leader.end - SCENES.leader.start}>
        <Scene2Leader />
      </Sequence>

      {/* Scene 3: The Identity Slam (10-13s) */}
      <Sequence from={SCENES.identity.start} durationInFrames={SCENES.identity.end - SCENES.identity.start}>
        <Scene3Identity />
      </Sequence>

      {/* Scene 4: Proof (13-19s) */}
      <Sequence from={SCENES.proof.start} durationInFrames={SCENES.proof.end - SCENES.proof.start}>
        <Scene4Proof />
      </Sequence>

      {/* Scene 5: The Reward (19-25s) */}
      <Sequence from={SCENES.reward.start} durationInFrames={SCENES.reward.end - SCENES.reward.start}>
        <Scene5Reward />
      </Sequence>

      {/* Scene 6: CTA (25-30s) */}
      <Sequence from={SCENES.cta.start} durationInFrames={SCENES.cta.end - SCENES.cta.start}>
        <Scene6CTA />
      </Sequence>

      {/* AUDIO - Uncomment when audio file is added to public folder */}
      {/* 
      <Audio src={staticFile('trailer-music.mp3')} volume={0.8} />
      <Sequence from={SCENES.identity.start}>
        <Audio src={staticFile('impact.mp3')} volume={1} />
      </Sequence>
      */}
    </AbsoluteFill>
  );
};
