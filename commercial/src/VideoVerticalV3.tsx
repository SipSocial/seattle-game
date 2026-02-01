/**
 * DARK SIDE DEFENSE — V3 AGENCY-POLISHED
 * 
 * FIXES APPLIED:
 * 1. Hero: Triangle composition, not stack. Lateral separation. Rotation variance.
 * 2. Asset variation: Mirroring, cropping, varied anchoring
 * 3. Player selection: 2 BIG cards, phone-readable
 * 4. Ticket: HOLY MOMENT - 50-60% frame, slow float, gold explosion
 * 5. CTA: Rebuilt from scratch, QR code, proper hierarchy
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
  GAME, 
  SUPER_BOWL,
} from './assets';

// ============================================================================
// SAFE AREAS
// ============================================================================
const SAFE = {
  top: 140,
  bottom: 220,
  sides: 90,
};

const SCREEN_WIDTH = 1080;
const SCREEN_HEIGHT = 1920;
const SAFE_HEIGHT = SCREEN_HEIGHT - SAFE.top - SAFE.bottom; // 1560px
const SAFE_WIDTH = SCREEN_WIDTH - SAFE.sides * 2; // 900px

// ============================================================================
// TIMING
// ============================================================================
const FPS = 30;
const SCENES = {
  hook: { start: 0, end: 3 * FPS },
  leader: { start: 3 * FPS, end: 10 * FPS },
  identity: { start: 10 * FPS, end: 13 * FPS },
  proof: { start: 13 * FPS, end: 19 * FPS },
  reward: { start: 19 * FPS, end: 25 * FPS },
  cta: { start: 25 * FPS, end: 30 * FPS },
};

// ============================================================================
// TYPOGRAPHY (2 families max, 2 weights max)
// ============================================================================
const Type = {
  hero: {
    fontFamily: 'Arial Black, Impact, sans-serif',
    fontWeight: 900,
    letterSpacing: '-0.02em',
    lineHeight: 0.95,
  },
  body: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontWeight: 600,
    letterSpacing: '0.1em',
  },
};

// ============================================================================
// SCENE 1: HOOK (0-3s)
// Minimal. Big. Clear tension.
// ============================================================================
const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 10, 70, 90], [0, 1, 1, 0], {
    extrapolateRight: 'clamp',
  });
  const scale = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 80 },
    from: 0.9,
    to: 1,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
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
        <div
          style={{
            ...Type.hero,
            fontSize: 82,
            color: COLORS.white,
            textAlign: 'center',
            textShadow: '0 4px 40px rgba(0,0,0,0.8)',
          }}
        >
          NO FOOTBALL
        </div>
        <div
          style={{
            ...Type.hero,
            fontSize: 82,
            color: COLORS.white,
            textAlign: 'center',
            textShadow: '0 4px 40px rgba(0,0,0,0.8)',
          }}
        >
          THIS WEEK?
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 2: HERO COMPOSITION (3-10s)
// TRIANGLE, NOT STACK. Lateral separation. Rotation variance. Real depth.
// ============================================================================
const Scene2Leader: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // DeMarcus entrance
  const demarcusY = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 50 },
    from: 250,
    to: 0,
  });
  const demarcusOpacity = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp' });

  // Crew entrance - delayed
  const crewDelay = 30;
  const crewOpacity = interpolate(frame, [crewDelay, crewDelay + 35], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Text appears after
  const textOpacity = interpolate(frame, [100, 130], [0, 1], { extrapolateRight: 'clamp' });

  // DeMarcus: 88% of safe height
  const demarcusHeight = SAFE_HEIGHT * 0.88;

  // TRIANGLE COMPOSITION - crew split left/right with lateral + vertical offset
  // Each has: x offset, y offset, scale, rotation, mirror, blur
  const crewLayout = [
    // BACK ROW (furthest, smallest, blurred)
    { x: -260, y: -180, scale: 0.42, rotate: 4, mirror: false, blur: 2, zIndex: 1 },
    { x: 260, y: -180, scale: 0.42, rotate: -4, mirror: true, blur: 2, zIndex: 1 },
    
    // MIDDLE ROW
    { x: -180, y: -60, scale: 0.52, rotate: 2, mirror: false, blur: 1, zIndex: 2 },
    { x: 180, y: -60, scale: 0.52, rotate: -2, mirror: true, blur: 1, zIndex: 2 },
    
    // FRONT ROW (closest to DeMarcus, larger)
    { x: -110, y: 40, scale: 0.62, rotate: 1, mirror: false, blur: 0, zIndex: 3 },
    { x: 110, y: 40, scale: 0.62, rotate: -1, mirror: true, blur: 0, zIndex: 3 },
  ];

  // Glow
  const glowPulse = 30 + Math.sin(frame * 0.08) * 12;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Dark gradient */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 130% 90% at 50% 90%, ${COLORS.navy} 0%, #000508 100%)`,
        }}
      />

      {/* Rim light behind DeMarcus */}
      <div
        style={{
          position: 'absolute',
          bottom: SAFE.bottom + 100,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 400,
          height: 500,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${COLORS.green}40 0%, transparent 65%)`,
          filter: `blur(${glowPulse}px)`,
        }}
      />

      {/* CREW - Triangle formation */}
      {CREW.slice(0, 6).map((player, i) => {
        const layout = crewLayout[i];
        const crewHeight = demarcusHeight * layout.scale;
        
        // Staggered entrance
        const staggerDelay = crewDelay + i * 4;
        const playerOpacity = interpolate(frame, [staggerDelay, staggerDelay + 20], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const playerY = spring({
          frame: Math.max(0, frame - staggerDelay),
          fps,
          config: { damping: 18, stiffness: 45 },
          from: 80,
          to: 0,
        });

        // Brightness based on depth (back = darker)
        const brightness = 0.45 + layout.scale * 0.5;

        return (
          <div
            key={player.id}
            style={{
              position: 'absolute',
              bottom: SAFE.bottom + layout.y,
              left: '50%',
              transform: `translateX(calc(-50% + ${layout.x}px)) translateY(${playerY}px) rotate(${layout.rotate}deg) scaleX(${layout.mirror ? -1 : 1})`,
              opacity: playerOpacity * crewOpacity,
              zIndex: layout.zIndex,
            }}
          >
            <Img
              src={player.image}
              style={{
                height: crewHeight,
                width: 'auto',
                filter: `brightness(${brightness}) saturate(0.8) blur(${layout.blur}px)`,
              }}
            />
          </div>
        );
      })}

      {/* DEMARCUS - Center, forward, dominant */}
      <div
        style={{
          position: 'absolute',
          bottom: SAFE.bottom,
          left: '50%',
          transform: `translateX(-50%) translateY(${demarcusY}px)`,
          opacity: demarcusOpacity,
          zIndex: 10,
        }}
      >
        <Img
          src={DEMARCUS.image}
          style={{
            height: demarcusHeight,
            width: 'auto',
            filter: `drop-shadow(0 0 ${glowPulse}px ${COLORS.green}60)`,
          }}
        />
      </div>

      {/* TEXT - Top, within safe area */}
      <div
        style={{
          position: 'absolute',
          top: SAFE.top + 30,
          left: SAFE.sides,
          right: SAFE.sides,
          textAlign: 'center',
          opacity: textOpacity,
          zIndex: 20,
        }}
      >
        <div style={{ ...Type.hero, fontSize: 52, color: COLORS.green }}>
          THE DARK SIDE
        </div>
        <div style={{ ...Type.hero, fontSize: 52, color: COLORS.white }}>
          DEFENSE
        </div>
        <div style={{ height: 20 }} />
        <div style={{ ...Type.body, fontSize: 18, color: COLORS.grey, letterSpacing: '0.2em' }}>
          LED BY
        </div>
        <div style={{ ...Type.hero, fontSize: 32, color: COLORS.white, marginTop: 8 }}>
          DEMARCUS LAWRENCE
        </div>
      </div>

      {/* DrinkSip - bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 50,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          opacity: textOpacity * 0.85,
          zIndex: 20,
        }}
      >
        <div style={{ ...Type.body, fontSize: 11, color: COLORS.grey, letterSpacing: '0.25em' }}>
          PRESENTED BY
        </div>
        <Img src={DRINKSIP.logo} style={{ height: 36, width: 'auto' }} />
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 3: IDENTITY SLAM (10-13s)
// Short. Heavy. Decisive.
// ============================================================================
const Scene3Identity: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Screen shake
  const shakeIntensity = frame < 12 ? Math.max(0, 12 - frame) * 1.5 : 0;
  const shakeX = Math.sin(frame * 2.5) * shakeIntensity;
  const shakeY = Math.cos(frame * 3) * shakeIntensity * 0.4;

  // Line 1
  const line1Scale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 180 },
    from: 2.8,
    to: 1,
  });
  const line1Opacity = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: 'clamp' });

  // Line 2 (delayed)
  const line2Frame = Math.max(0, frame - 10);
  const line2Scale = spring({
    frame: line2Frame,
    fps,
    config: { damping: 10, stiffness: 180 },
    from: 2.8,
    to: 1,
  });
  const line2Opacity = interpolate(line2Frame, [0, 6], [0, 1], { extrapolateRight: 'clamp' });

  // Flash
  const flashOpacity = interpolate(frame, [0, 4, 10], [1, 0, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#000',
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      {/* Green glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, ${COLORS.green}18 0%, transparent 55%)`,
        }}
      />

      {/* Title */}
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
        }}
      >
        <div
          style={{
            ...Type.hero,
            fontSize: 115,
            color: COLORS.white,
            opacity: line1Opacity,
            transform: `scale(${line1Scale})`,
            textShadow: `0 0 60px ${COLORS.green}, 0 8px 40px rgba(0,0,0,0.9)`,
          }}
        >
          DARK SIDE
        </div>
        <div
          style={{
            ...Type.hero,
            fontSize: 115,
            color: COLORS.green,
            opacity: line2Opacity,
            transform: `scale(${line2Scale})`,
            textShadow: `0 0 50px ${COLORS.green}, 0 8px 40px rgba(0,0,0,0.9)`,
          }}
        >
          DEFENSE
        </div>
      </div>

      {/* Flash */}
      <AbsoluteFill style={{ backgroundColor: '#fff', opacity: flashOpacity }} />
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 4: PROOF (13-19s)
// 2 BIG CARDS. Phone-readable. Faces dominate.
// ============================================================================
const Scene4Proof: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Only 2 cards - big and readable
  const cardPlayers = [PLAYERS[0], PLAYERS[7]]; // Lawrence, Witherspoon

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  // Card dimensions - 35%+ of screen width
  const cardWidth = 380; // ~35% of 1080
  const cardHeight = 520;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <AbsoluteFill
        style={{ background: `linear-gradient(180deg, #080810 0%, #000 100%)` }}
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
          gap: 35,
        }}
      >
        {/* Header */}
        <div style={{ opacity: titleOpacity, textAlign: 'center' }}>
          <div style={{ ...Type.hero, fontSize: 40, color: COLORS.white }}>
            CHOOSE YOUR
          </div>
          <div style={{ ...Type.hero, fontSize: 40, color: COLORS.green }}>
            DEFENDER
          </div>
        </div>

        {/* 2 Big Cards - side by side */}
        <div style={{ display: 'flex', gap: 24 }}>
          {cardPlayers.map((player, i) => {
            const delay = 20 + i * 10;
            const cardOpacity = interpolate(frame, [delay, delay + 15], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const cardY = spring({
              frame: Math.max(0, frame - delay),
              fps,
              config: { damping: 14, stiffness: 80 },
              from: 50,
              to: 0,
            });

            const isLeader = i === 0;

            return (
              <div
                key={player.id}
                style={{
                  width: cardWidth,
                  height: cardHeight,
                  borderRadius: 20,
                  overflow: 'hidden',
                  border: `5px solid ${isLeader ? COLORS.green : 'rgba(105, 190, 40, 0.5)'}`,
                  boxShadow: isLeader
                    ? `0 0 40px ${COLORS.green}80, 0 20px 60px rgba(0,0,0,0.6)`
                    : `0 0 20px ${COLORS.green}40, 0 20px 60px rgba(0,0,0,0.6)`,
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

                {/* Jersey - HUGE */}
                <div
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 20,
                    ...Type.hero,
                    fontSize: 56,
                    color: COLORS.green,
                    textShadow: `3px 3px 0 ${COLORS.navy}, 0 0 20px rgba(0,0,0,0.9)`,
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
                    padding: '30px 16px 20px',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.95))',
                  }}
                >
                  <div
                    style={{
                      ...Type.hero,
                      fontSize: 26,
                      color: COLORS.white,
                      textAlign: 'center',
                    }}
                  >
                    {player.lastName}
                  </div>
                  <div
                    style={{
                      ...Type.body,
                      fontSize: 14,
                      color: COLORS.green,
                      textAlign: 'center',
                      marginTop: 6,
                    }}
                  >
                    {player.position}
                  </div>
                </div>

                {/* Leader badge */}
                {isLeader && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      padding: '8px 14px',
                      background: COLORS.green,
                      borderRadius: 6,
                      ...Type.body,
                      fontSize: 12,
                      color: COLORS.navy,
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
// SCENE 5: REWARD (19-25s)
// HOLY MOMENT. Ticket is 50-60% of frame. Slow float. Gold explosion.
// Quiet, heavy, important.
// ============================================================================
const Scene5Reward: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "WIN" entrance
  const winScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 120 },
    from: 0.4,
    to: 1,
  });
  const winOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });

  // Ticket entrance - delayed, slow float
  const ticketDelay = 20;
  const ticketY = spring({
    frame: Math.max(0, frame - ticketDelay),
    fps,
    config: { damping: 18, stiffness: 40 },
    from: 80,
    to: 0,
  });
  const ticketOpacity = interpolate(frame, [ticketDelay, ticketDelay + 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Slow float after entrance
  const floatOffset = frame > ticketDelay + 30 ? Math.sin((frame - ticketDelay - 30) * 0.03) * 8 : 0;

  // Light sweep across ticket
  const sweepX = interpolate(frame, [ticketDelay + 10, ticketDelay + 60], [-100, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Gold particles - dust effect
  const particles = Array.from({ length: 35 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 600,
    y: (Math.random() - 0.5) * 400,
    size: 2 + Math.random() * 4,
    speed: 0.5 + Math.random() * 0.5,
    delay: Math.random() * 30,
  }));

  // Glow pulse
  const glowIntensity = 50 + Math.sin(frame * 0.08) * 20;

  // TICKET WIDTH: 55% of screen
  const ticketWidth = SCREEN_WIDTH * 0.55;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Dark with gold radial */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center 45%, ${COLORS.gold}12 0%, transparent 45%)`,
        }}
      />

      {/* Gold dust particles */}
      {particles.map((p) => {
        const pFrame = Math.max(0, frame - ticketDelay - p.delay);
        const pY = p.y - pFrame * p.speed;
        const pOpacity = interpolate(pFrame, [0, 20, 80], [0, 0.7, 0], { extrapolateRight: 'clamp' });

        return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              top: '45%',
              left: '50%',
              transform: `translate(${p.x}px, ${pY}px)`,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: COLORS.gold,
              opacity: pOpacity,
              boxShadow: `0 0 ${p.size * 2}px ${COLORS.gold}`,
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
          gap: 40,
        }}
      >
        {/* WIN - ENORMOUS */}
        <div
          style={{
            ...Type.hero,
            fontSize: 160,
            color: COLORS.gold,
            opacity: winOpacity,
            transform: `scale(${winScale})`,
            textShadow: `0 0 80px ${COLORS.gold}, 0 10px 50px rgba(0,0,0,0.9)`,
          }}
        >
          WIN
        </div>

        {/* TICKET - ENORMOUS, 55% width */}
        <div
          style={{
            opacity: ticketOpacity,
            transform: `translateY(${ticketY + floatOffset}px)`,
            position: 'relative',
          }}
        >
          {/* Light sweep */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: sweepX,
              width: 60,
              height: '100%',
              background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
              borderRadius: 20,
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              width: ticketWidth,
              padding: '36px 48px',
              background: `linear-gradient(135deg, ${COLORS.gold} 0%, ${COLORS.goldDark} 100%)`,
              borderRadius: 24,
              boxShadow: `0 0 ${glowIntensity}px ${COLORS.gold}70, 0 30px 80px rgba(0,0,0,0.6)`,
              textAlign: 'center',
            }}
          >
            {/* Super Bowl */}
            <div
              style={{
                ...Type.body,
                fontSize: 22,
                color: COLORS.navy,
                letterSpacing: '0.2em',
                marginBottom: 12,
              }}
            >
              SUPER BOWL LX
            </div>

            {/* 2 TICKETS - dominant */}
            <div
              style={{
                ...Type.hero,
                fontSize: 64,
                color: COLORS.navy,
                lineHeight: 1,
              }}
            >
              2 TICKETS
            </div>

            {/* Date */}
            <div
              style={{
                ...Type.body,
                fontSize: 18,
                color: 'rgba(0,34,68,0.7)',
                marginTop: 16,
                letterSpacing: '0.1em',
              }}
            >
              FEBRUARY 9 • SAN FRANCISCO
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 6: CTA (25-30s)
// Rebuilt from scratch. Proper hierarchy. QR code. Confident close.
// ============================================================================
const Scene6CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Staggered entrances
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const buttonOpacity = interpolate(frame, [15, 30], [0, 1], { extrapolateRight: 'clamp' });
  const buttonScale = spring({
    frame: Math.max(0, frame - 15),
    fps,
    config: { damping: 14, stiffness: 80 },
    from: 0.85,
    to: 1,
  });
  const qrOpacity = interpolate(frame, [35, 50], [0, 1], { extrapolateRight: 'clamp' });
  const bottomOpacity = interpolate(frame, [60, 80], [0, 1], { extrapolateRight: 'clamp' });

  // Glow pulse
  const glowIntensity = 25 + Math.sin(frame * 0.12) * 12;

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
          top: SAFE.top,
          left: SAFE.sides,
          right: SAFE.sides,
          bottom: SAFE.bottom,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 28,
        }}
      >
        {/* Title */}
        <div style={{ opacity: titleOpacity, textAlign: 'center' }}>
          <div style={{ ...Type.hero, fontSize: 58, color: COLORS.white }}>
            DARK SIDE
          </div>
          <div style={{ ...Type.hero, fontSize: 58, color: COLORS.green }}>
            DEFENSE
          </div>
        </div>

        {/* CTA Button - CORRECT URL */}
        <div
          style={{
            opacity: buttonOpacity,
            transform: `scale(${buttonScale})`,
          }}
        >
          <div
            style={{
              padding: '26px 52px',
              background: `linear-gradient(135deg, ${COLORS.green} 0%, #4a9e1c 100%)`,
              borderRadius: 16,
              boxShadow: `0 0 ${glowIntensity}px ${COLORS.green}, 0 15px 50px rgba(0,0,0,0.5)`,
            }}
          >
            <div
              style={{
                ...Type.hero,
                fontSize: 30,
                color: COLORS.white,
              }}
            >
              game.drinksip.com
            </div>
          </div>
        </div>

        {/* QR Code placeholder - large enough to scan */}
        <div
          style={{
            opacity: qrOpacity,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 140,
              height: 140,
              background: COLORS.white,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            }}
          >
            {/* QR placeholder - would be actual QR in production */}
            <div
              style={{
                ...Type.body,
                fontSize: 11,
                color: COLORS.navy,
                textAlign: 'center',
                padding: 12,
              }}
            >
              SCAN TO PLAY
            </div>
          </div>
        </div>

        {/* PLAY NOW */}
        <div
          style={{
            ...Type.hero,
            fontSize: 38,
            color: COLORS.gold,
            opacity: buttonOpacity,
            textShadow: `0 0 30px ${COLORS.gold}50`,
          }}
        >
          PLAY NOW
        </div>

        {/* Brand lockup */}
        <div
          style={{
            opacity: bottomOpacity,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            marginTop: 15,
          }}
        >
          <div style={{ ...Type.body, fontSize: 11, color: COLORS.grey, letterSpacing: '0.2em' }}>
            PRESENTED BY
          </div>
          <Img src={DRINKSIP.logo} style={{ height: 42, width: 'auto' }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// MAIN COMPOSITION
// ============================================================================
export const CommercialVerticalV3: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Sequence from={SCENES.hook.start} durationInFrames={SCENES.hook.end - SCENES.hook.start}>
        <Scene1Hook />
      </Sequence>

      <Sequence from={SCENES.leader.start} durationInFrames={SCENES.leader.end - SCENES.leader.start}>
        <Scene2Leader />
      </Sequence>

      <Sequence from={SCENES.identity.start} durationInFrames={SCENES.identity.end - SCENES.identity.start}>
        <Scene3Identity />
      </Sequence>

      <Sequence from={SCENES.proof.start} durationInFrames={SCENES.proof.end - SCENES.proof.start}>
        <Scene4Proof />
      </Sequence>

      <Sequence from={SCENES.reward.start} durationInFrames={SCENES.reward.end - SCENES.reward.start}>
        <Scene5Reward />
      </Sequence>

      <Sequence from={SCENES.cta.start} durationInFrames={SCENES.cta.end - SCENES.cta.start}>
        <Scene6CTA />
      </Sequence>
    </AbsoluteFill>
  );
};
