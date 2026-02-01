/**
 * DARK SIDE DEFENSE — V7 "THE COMPLETE ONE"
 * 
 * Combines:
 * - V5's emotional story arc (problem → solution → reward → action)
 * - V6's visual polish (DeMarcus huge, swipe carousel, card carousel)
 * 
 * Flow:
 * 1. THE PROBLEM: No Seahawks this Super Bowl
 * 2. THE SOLUTION: But you can play as the defense (DeMarcus huge + swipe)
 * 3. THE IDENTITY: DARK SIDE DEFENSE slam
 * 4. THE GAME: Card carousel showing the roster
 * 5. THE REWARD: Win 2 Super Bowl tickets
 * 6. THE ACTION: Play now
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
  FONTS,
  DEMARCUS, 
  PLAYERS,
  PLAYERS_TRANSPARENT,
  DRINKSIP, 
  GAME, 
  SUPER_BOWL,
  CAMPAIGN,
} from './assets';

// ============================================================================
// TIMING - 30 seconds
// ============================================================================
const FPS = 30;
const SCENES = {
  problem: { start: 0, end: 3 * FPS },           // 0-3s
  solution: { start: 3 * FPS, end: 9 * FPS },    // 3-9s - DeMarcus + swipe
  identity: { start: 9 * FPS, end: 12 * FPS },   // 9-12s - DARK SIDE DEFENSE
  game: { start: 12 * FPS, end: 18 * FPS },      // 12-18s - Card carousel
  reward: { start: 18 * FPS, end: 24 * FPS },    // 18-24s - Win tickets
  action: { start: 24 * FPS, end: 30 * FPS },    // 24-30s - Play now
};

// ============================================================================
// SCENE 1: THE PROBLEM (0-3s)
// "No Seahawks in the Super Bowl." - emotional hook
// ============================================================================
const Scene1Problem: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 15, 70, 90], [0, 1, 1, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#050508' }}>
      {/* Seattle skyline - faded */}
      <AbsoluteFill style={{ opacity: 0.12 }}>
        <Img
          src={CAMPAIGN.seattleImage}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            filter: 'grayscale(0.8) brightness(0.5)',
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 50,
          opacity,
        }}
      >
        <div
          style={{
            ...FONTS.headline,
            fontSize: 56,
            color: COLORS.white,
            textAlign: 'center',
            lineHeight: 1.2,
            textShadow: '0 4px 30px rgba(0,0,0,0.9)',
          }}
        >
          No Seahawks in the Super Bowl this year.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 2: THE SOLUTION (3-9s)
// "But you can play as the defense" + DeMarcus HUGE + swipe carousel
// ============================================================================
const Scene2Solution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 6 seconds = 180 frames
  // Phase 1: Text + DeMarcus reveal (0-90 frames)
  // Phase 2: Swipe carousel (90-180 frames)
  
  const phase = frame < 90 ? 1 : 2;
  const carouselFrame = Math.max(0, frame - 90);

  // Text fade
  const textOpacity = interpolate(frame, [0, 20, 60, 85], [0, 1, 1, 0], { extrapolateRight: 'clamp' });

  // DeMarcus entrance
  const demarcusY = spring({
    frame: Math.max(0, frame - 25),
    fps,
    config: { damping: 14, stiffness: 50 },
    from: 300,
    to: 0,
  });
  const demarcusOpacity = interpolate(frame, [25, 50], [0, 1], { extrapolateRight: 'clamp' });

  // DeMarcus exit for carousel
  const demarcusExitOpacity = phase === 2 ? interpolate(carouselFrame, [0, 15], [1, 0], { extrapolateRight: 'clamp' }) : 1;

  // Carousel
  const swipePlayers = PLAYERS_TRANSPARENT.slice(0, 5);
  const swipeDuration = 18;
  const currentPlayerIndex = Math.min(Math.floor(carouselFrame / swipeDuration), swipePlayers.length - 1);
  const swipeProgress = (carouselFrame % swipeDuration) / swipeDuration;

  // Glow
  const glowIntensity = 30 + Math.sin(frame * 0.08) * 10;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.navy }}>
      {/* Dark gradient */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center 85%, ${COLORS.navy} 0%, #000510 100%)`,
        }}
      />

      {/* Glow */}
      <div
        style={{
          position: 'absolute',
          bottom: 120,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 450,
          height: 450,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.green}35 0%, transparent 60%)`,
          filter: `blur(${glowIntensity}px)`,
        }}
      />

      {/* PHASE 1: Text + DeMarcus */}
      {phase === 1 && (
        <>
          {/* Message */}
          <div
            style={{
              position: 'absolute',
              top: 150,
              left: 50,
              right: 50,
              textAlign: 'center',
              opacity: textOpacity,
              zIndex: 20,
            }}
          >
            <div style={{ ...FONTS.body, fontSize: 22, color: COLORS.grey, letterSpacing: '0.15em' }}>
              BUT YOU CAN STILL
            </div>
            <div
              style={{
                ...FONTS.headline,
                fontSize: 52,
                color: COLORS.green,
                marginTop: 12,
                textShadow: `0 0 30px ${COLORS.green}50`,
              }}
            >
              PLAY AS THE DEFENSE
            </div>
          </div>

          {/* DeMarcus - HUGE */}
          <div
            style={{
              position: 'absolute',
              bottom: 80,
              left: '50%',
              transform: `translateX(-50%) translateY(${demarcusY}px)`,
              opacity: demarcusOpacity * demarcusExitOpacity,
            }}
          >
            <Img
              src={DEMARCUS.image}
              style={{
                height: 1150,
                width: 'auto',
                filter: `drop-shadow(0 0 ${glowIntensity}px ${COLORS.green}50)`,
              }}
            />
          </div>

          {/* DeMarcus name */}
          <div
            style={{
              position: 'absolute',
              bottom: 50,
              left: 0,
              right: 0,
              textAlign: 'center',
              opacity: demarcusOpacity,
              zIndex: 20,
            }}
          >
            <div style={{ ...FONTS.headline, fontSize: 44, color: COLORS.white }}>
              DEMARCUS LAWRENCE
            </div>
            <div style={{ ...FONTS.body, fontSize: 18, color: COLORS.green, marginTop: 8 }}>
              #0 • DEFENSIVE END
            </div>
          </div>
        </>
      )}

      {/* PHASE 2: Swipe Carousel */}
      {phase === 2 && (
        <>
          {/* Header */}
          <div
            style={{
              position: 'absolute',
              top: 130,
              left: 0,
              right: 0,
              textAlign: 'center',
            }}
          >
            <div style={{ ...FONTS.headline, fontSize: 38, color: COLORS.white }}>
              CHOOSE YOUR DEFENDER
            </div>
          </div>

          {/* Swipe players */}
          {swipePlayers.map((player, i) => {
            const relativeIndex = i - currentPlayerIndex;
            const baseX = relativeIndex * 500;
            const slideOffset = swipeProgress * -500;
            const x = baseX + slideOffset;
            
            const distanceFromCenter = Math.abs(relativeIndex - swipeProgress);
            const playerScale = interpolate(distanceFromCenter, [0, 1, 2], [1, 0.65, 0.4], { extrapolateRight: 'clamp' });
            const playerOpacity = interpolate(distanceFromCenter, [0, 1, 2], [1, 0.5, 0.2], { extrapolateRight: 'clamp' });
            
            if (Math.abs(relativeIndex) > 2) return null;

            return (
              <div
                key={player.id}
                style={{
                  position: 'absolute',
                  bottom: 180,
                  left: '50%',
                  transform: `translateX(calc(-50% + ${x}px)) scale(${playerScale})`,
                  opacity: playerOpacity,
                }}
              >
                <Img
                  src={player.image}
                  style={{
                    height: 950,
                    width: 'auto',
                    filter: distanceFromCenter < 0.5 
                      ? `drop-shadow(0 0 ${glowIntensity}px ${COLORS.green}50)` 
                      : 'brightness(0.5)',
                  }}
                />
              </div>
            );
          })}

          {/* Current player name */}
          <div
            style={{
              position: 'absolute',
              bottom: 55,
              left: 0,
              right: 0,
              textAlign: 'center',
            }}
          >
            <div style={{ ...FONTS.headline, fontSize: 40, color: COLORS.white }}>
              {swipePlayers[currentPlayerIndex]?.name || ''}
            </div>
            <div style={{ ...FONTS.body, fontSize: 16, color: COLORS.green, marginTop: 6 }}>
              #{swipePlayers[currentPlayerIndex]?.jersey} • {swipePlayers[currentPlayerIndex]?.position}
            </div>
          </div>

          {/* Dots */}
          <div
            style={{
              position: 'absolute',
              bottom: 25,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {swipePlayers.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === currentPlayerIndex ? 22 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: i === currentPlayerIndex ? COLORS.green : COLORS.grey,
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* DrinkSip - top */}
      <div
        style={{
          position: 'absolute',
          top: 45,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          opacity: 0.8,
        }}
      >
        <div style={{ ...FONTS.body, fontSize: 10, color: COLORS.grey, letterSpacing: '0.2em' }}>
          PRESENTED BY
        </div>
        <Img src={DRINKSIP.logo} style={{ height: 38, width: 'auto' }} />
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 3: THE IDENTITY (9-12s)
// DARK SIDE DEFENSE - strong slam
// ============================================================================
const Scene3Identity: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Screen shake
  const shakeIntensity = frame < 15 ? (15 - frame) * 1 : 0;
  const shakeX = Math.sin(frame * 3) * shakeIntensity;
  const shakeY = Math.cos(frame * 4) * shakeIntensity * 0.4;

  // Line 1
  const line1Scale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 180 },
    from: 2.5,
    to: 1,
  });
  const line1Opacity = interpolate(frame, [0, 5], [0, 1], { extrapolateRight: 'clamp' });

  // Line 2
  const line2Frame = Math.max(0, frame - 8);
  const line2Scale = spring({
    frame: line2Frame,
    fps,
    config: { damping: 10, stiffness: 180 },
    from: 2.5,
    to: 1,
  });
  const line2Opacity = interpolate(line2Frame, [0, 5], [0, 1], { extrapolateRight: 'clamp' });

  // Flash
  const flashOpacity = interpolate(frame, [0, 5, 12], [1, 0.4, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.black,
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      {/* Green glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, ${COLORS.green}20 0%, transparent 50%)`,
        }}
      />

      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            ...FONTS.headline,
            fontSize: 130,
            color: COLORS.white,
            opacity: line1Opacity,
            transform: `scale(${line1Scale})`,
            textShadow: `0 0 70px ${COLORS.green}, 0 8px 40px rgba(0,0,0,0.9)`,
            lineHeight: 0.95,
          }}
        >
          DARK SIDE
        </div>
        <div
          style={{
            ...FONTS.headline,
            fontSize: 130,
            color: COLORS.green,
            opacity: line2Opacity,
            transform: `scale(${line2Scale})`,
            textShadow: `0 0 50px ${COLORS.green}, 0 8px 40px rgba(0,0,0,0.9)`,
            lineHeight: 0.95,
          }}
        >
          DEFENSE
        </div>
      </AbsoluteFill>

      {/* Flash */}
      <AbsoluteFill style={{ backgroundColor: '#fff', opacity: flashOpacity, pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 4: THE GAME (12-18s)
// Card carousel - showing the full roster, one card at a time
// ============================================================================
const Scene4Game: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 6 seconds = 180 frames
  const rosterPlayers = [PLAYERS[0], PLAYERS[7], PLAYERS[1], PLAYERS[4], PLAYERS[5]];
  const cardDuration = 32;
  const currentCardIndex = Math.min(Math.floor(frame / cardDuration), rosterPlayers.length - 1);
  const cardProgress = (frame % cardDuration) / cardDuration;

  // Card size - BIG
  const cardWidth = 500;
  const cardHeight = 680;

  const headerOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: '#050508' }}>
      {/* Header */}
      <div
        style={{
          position: 'absolute',
          top: 130,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: headerOpacity,
        }}
      >
        <div style={{ ...FONTS.headline, fontSize: 40, color: COLORS.white }}>
          11 DEFENDERS
        </div>
        <div style={{ ...FONTS.body, fontSize: 16, color: COLORS.green, marginTop: 10, letterSpacing: '0.2em' }}>
          SEATTLE SEAHAWKS DEFENSE
        </div>
      </div>

      {/* Card carousel */}
      <div
        style={{
          position: 'absolute',
          top: 260,
          left: 0,
          right: 0,
          height: cardHeight + 80,
          overflow: 'hidden',
        }}
      >
        {rosterPlayers.map((player, i) => {
          const relativeIndex = i - currentCardIndex;
          const baseX = relativeIndex * (cardWidth + 30);
          const slideOffset = cardProgress * -(cardWidth + 30);
          const x = baseX + slideOffset;
          
          const distanceFromCenter = Math.abs(relativeIndex - cardProgress);
          const cardScale = interpolate(distanceFromCenter, [0, 1], [1, 0.8], { extrapolateRight: 'clamp' });
          const cardOpacity = interpolate(distanceFromCenter, [0, 1, 2], [1, 0.4, 0], { extrapolateRight: 'clamp' });

          if (Math.abs(relativeIndex) > 1.5) return null;

          return (
            <div
              key={player.id}
              style={{
                position: 'absolute',
                left: '50%',
                transform: `translateX(calc(-50% + ${x}px)) scale(${cardScale})`,
                opacity: cardOpacity,
              }}
            >
              <div
                style={{
                  width: cardWidth,
                  height: cardHeight,
                  borderRadius: 24,
                  overflow: 'hidden',
                  border: `4px solid ${COLORS.green}`,
                  boxShadow: distanceFromCenter < 0.5 
                    ? `0 0 40px ${COLORS.green}60, 0 20px 50px rgba(0,0,0,0.7)`
                    : `0 0 15px ${COLORS.green}30`,
                  background: '#111',
                }}
              >
                <Img
                  src={player.image}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* Jersey */}
                <div
                  style={{
                    position: 'absolute',
                    top: 18,
                    right: 22,
                    ...FONTS.headline,
                    fontSize: 64,
                    color: COLORS.green,
                    textShadow: `3px 3px 0 ${COLORS.navy}`,
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
                    padding: '35px 20px 24px',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.95))',
                  }}
                >
                  <div style={{ ...FONTS.headline, fontSize: 32, color: COLORS.white, textAlign: 'center' }}>
                    {player.lastName}
                  </div>
                  <div style={{ ...FONTS.body, fontSize: 16, color: COLORS.green, textAlign: 'center', marginTop: 6 }}>
                    {player.position}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dots */}
      <div
        style={{
          position: 'absolute',
          bottom: 170,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 10,
        }}
      >
        {rosterPlayers.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === currentCardIndex ? 24 : 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: i === currentCardIndex ? COLORS.green : 'rgba(105, 190, 40, 0.3)',
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 5: THE REWARD (18-24s)
// Win 2 Super Bowl tickets
// ============================================================================
const Scene5Reward: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    angle: (i / 20) * Math.PI * 2,
    speed: 3 + Math.random() * 3,
    size: 3 + Math.random() * 4,
  }));

  // WIN animation
  const winScale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 100 },
    from: 0.6,
    to: 1,
  });
  const winOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  // Ticket
  const ticketOpacity = interpolate(frame, [25, 45], [0, 1], { extrapolateRight: 'clamp' });
  const ticketY = spring({
    frame: Math.max(0, frame - 25),
    fps,
    config: { damping: 14, stiffness: 60 },
    from: 40,
    to: 0,
  });

  // Detail
  const detailOpacity = interpolate(frame, [90, 120], [0, 1], { extrapolateRight: 'clamp' });

  // Glow
  const glowIntensity = 35 + Math.sin(frame * 0.1) * 12;

  return (
    <AbsoluteFill style={{ backgroundColor: '#050508' }}>
      {/* Gold radial */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, ${COLORS.gold}15 0%, transparent 50%)`,
        }}
      />

      {/* Particles */}
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
                top: '32%',
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

      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 30,
          padding: 50,
        }}
      >
        {/* WIN */}
        <div
          style={{
            ...FONTS.headline,
            fontSize: 130,
            color: COLORS.gold,
            opacity: winOpacity,
            transform: `scale(${winScale})`,
            textShadow: `0 0 60px ${COLORS.gold}, 0 8px 40px rgba(0,0,0,0.9)`,
          }}
        >
          WIN
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
              width: 480,
              padding: '30px 40px',
              background: `linear-gradient(135deg, ${COLORS.gold} 0%, ${COLORS.goldDark} 100%)`,
              borderRadius: 22,
              boxShadow: `0 0 ${glowIntensity}px ${COLORS.gold}55, 0 20px 60px rgba(0,0,0,0.6)`,
              textAlign: 'center',
            }}
          >
            <div style={{ ...FONTS.body, fontSize: 20, color: COLORS.navy, letterSpacing: '0.18em', marginBottom: 10 }}>
              SUPER BOWL LX
            </div>
            <div style={{ ...FONTS.headline, fontSize: 58, color: COLORS.navy, lineHeight: 1 }}>
              2 TICKETS
            </div>
            <div style={{ ...FONTS.body, fontSize: 16, color: 'rgba(0,34,68,0.7)', marginTop: 14 }}>
              FEBRUARY 9 • SAN FRANCISCO
            </div>
          </div>
        </div>

        {/* Watch DeMarcus */}
        <div
          style={{
            ...FONTS.body,
            fontSize: 22,
            color: COLORS.grey,
            textAlign: 'center',
            opacity: detailOpacity,
          }}
        >
          WATCH DEMARCUS COMPETE LIVE
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 6: THE ACTION (24-30s)
// Play now - clean CTA
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

  const glow = 20 + Math.sin(frame * 0.12) * 8;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.navy }}>
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${COLORS.navy} 0%, #000510 100%)`,
        }}
      />

      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 28,
          padding: 50,
        }}
      >
        {/* Title */}
        <div style={{ textAlign: 'center', opacity: titleOpacity }}>
          <div
            style={{
              ...FONTS.headline,
              fontSize: 62,
              color: COLORS.white,
              textShadow: `0 0 ${glow}px ${COLORS.green}`,
              lineHeight: 1,
            }}
          >
            DARK SIDE
          </div>
          <div
            style={{
              ...FONTS.headline,
              fontSize: 62,
              color: COLORS.green,
              textShadow: `0 0 ${glow}px ${COLORS.green}`,
              lineHeight: 1,
            }}
          >
            DEFENSE
          </div>
        </div>

        {/* URL Button */}
        <div
          style={{
            opacity: buttonOpacity,
            transform: `scale(${buttonScale})`,
          }}
        >
          <div
            style={{
              padding: '22px 48px',
              background: `linear-gradient(135deg, ${COLORS.green} 0%, #4a9e1c 100%)`,
              borderRadius: 16,
              boxShadow: `0 0 ${glow}px ${COLORS.green}, 0 12px 45px rgba(0,0,0,0.5)`,
            }}
          >
            <span style={{ ...FONTS.headline, fontSize: 30, color: COLORS.white }}>
              game.drinksip.com
            </span>
          </div>
        </div>

        {/* QR Code */}
        <div
          style={{
            opacity: buttonOpacity,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 130,
              height: 130,
              background: COLORS.white,
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 35px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{ ...FONTS.body, fontSize: 10, color: COLORS.navy, textAlign: 'center' }}>
              SCAN TO PLAY
            </div>
          </div>
        </div>

        {/* PLAY NOW */}
        <div
          style={{
            ...FONTS.headline,
            fontSize: 40,
            color: COLORS.gold,
            opacity: buttonOpacity,
            textShadow: `0 0 25px ${COLORS.gold}40`,
          }}
        >
          PLAY NOW
        </div>

        {/* DrinkSip */}
        <div
          style={{
            opacity: bottomOpacity,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ ...FONTS.body, fontSize: 10, color: COLORS.grey, letterSpacing: '0.2em' }}>
            POWERED BY
          </span>
          <Img src={DRINKSIP.logo} style={{ height: 42, width: 'auto' }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// MAIN COMPOSITION
// ============================================================================
export const CommercialVerticalV7: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Sequence from={SCENES.problem.start} durationInFrames={SCENES.problem.end - SCENES.problem.start}>
        <Scene1Problem />
      </Sequence>

      <Sequence from={SCENES.solution.start} durationInFrames={SCENES.solution.end - SCENES.solution.start}>
        <Scene2Solution />
      </Sequence>

      <Sequence from={SCENES.identity.start} durationInFrames={SCENES.identity.end - SCENES.identity.start}>
        <Scene3Identity />
      </Sequence>

      <Sequence from={SCENES.game.start} durationInFrames={SCENES.game.end - SCENES.game.start}>
        <Scene4Game />
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
