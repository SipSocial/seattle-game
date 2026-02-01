/**
 * DARK SIDE DEFENSE — V6 "THE ONE"
 * 
 * Based on V1 (the best foundation) with key fixes:
 * 1. DeMarcus HUGE first, then swipe through players like in-game selector
 * 2. Keep the strong DARK SIDE DEFENSE slam
 * 3. Player cards as full carousel - one big card at a time, swiping
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
// TIMING
// ============================================================================
const FPS = 30;
const SCENES = {
  hook: { start: 0, end: 3 * FPS },              // 0-3s
  playerSwipe: { start: 3 * FPS, end: 10 * FPS }, // 3-10s - DeMarcus then swipe carousel
  titleSlam: { start: 10 * FPS, end: 13 * FPS },  // 10-13s - DARK SIDE DEFENSE
  rosterCarousel: { start: 13 * FPS, end: 19 * FPS }, // 13-19s - Card carousel
  giveaway: { start: 19 * FPS, end: 25 * FPS },   // 19-25s - Win tickets
  cta: { start: 25 * FPS, end: 30 * FPS },        // 25-30s - Play now
};

// ============================================================================
// SCENE 1: HOOK (0-3s)
// "NO FOOTBALL THIS WEEK" - same as V1
// ============================================================================
const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 15, 70, 90], [0, 1, 1, 0], {
    extrapolateRight: 'clamp',
  });
  const scale = interpolate(frame, [0, 12], [0.85, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      {/* Subtle stadium bg */}
      <AbsoluteFill style={{ opacity: 0.15 }}>
        <Img
          src={CAMPAIGN.stadiumImage}
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.5)' }}
        />
      </AbsoluteFill>

      {/* Scanlines */}
      <AbsoluteFill
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(0,0,0,0.3) 4px, rgba(0,0,0,0.3) 8px)`,
          opacity: 0.4,
        }}
      />

      {/* Main text */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
          opacity,
          transform: `scale(${scale})`,
        }}
      >
        <div
          style={{
            ...FONTS.headline,
            fontSize: 95,
            color: COLORS.white,
            textAlign: 'center',
            lineHeight: 1.05,
            textShadow: '0 6px 40px rgba(0,0,0,0.9)',
          }}
        >
          NO FOOTBALL
        </div>
        <div
          style={{
            ...FONTS.headline,
            fontSize: 95,
            color: COLORS.white,
            textAlign: 'center',
            lineHeight: 1.05,
            textShadow: '0 6px 40px rgba(0,0,0,0.9)',
            marginTop: 10,
          }}
        >
          THIS WEEK
        </div>
        <div
          style={{
            ...FONTS.body,
            fontSize: 28,
            color: COLORS.green,
            marginTop: 40,
            letterSpacing: '0.15em',
          }}
        >
          ...UNTIL NOW
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 2: PLAYER SWIPE (3-10s)
// DeMarcus HUGE first (0-3s), then swipe through players like in-game (3-7s)
// ============================================================================
const Scene2PlayerSwipe: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 7 seconds = 210 frames
  // Phase 1: DeMarcus hero (0-90 frames / 0-3s)
  // Phase 2: Swipe carousel (90-210 frames / 3-7s)
  
  const phase = frame < 90 ? 1 : 2;
  const carouselFrame = Math.max(0, frame - 90);

  // DeMarcus entrance
  const demarcusY = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 60 },
    from: 300,
    to: 0,
  });
  const demarcusOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const demarcusScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
    from: 0.85,
    to: 1,
  });

  // DeMarcus exit for carousel
  const demarcusExit = phase === 2 ? interpolate(carouselFrame, [0, 15], [0, -400], { extrapolateRight: 'clamp' }) : 0;
  const demarcusExitOpacity = phase === 2 ? interpolate(carouselFrame, [0, 15], [1, 0], { extrapolateRight: 'clamp' }) : 1;

  // Carousel - swipe through 5 players
  const swipePlayers = PLAYERS_TRANSPARENT.slice(0, 6); // DeMarcus + 5 others
  const swipeDuration = 20; // frames per player
  const currentPlayerIndex = Math.min(Math.floor(carouselFrame / swipeDuration), swipePlayers.length - 1);
  const swipeProgress = (carouselFrame % swipeDuration) / swipeDuration;

  // Glow pulse
  const glowIntensity = 35 + Math.sin(frame * 0.08) * 12;

  // Title text
  const titleOpacity = interpolate(frame, [60, 85], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.navy }}>
      {/* Dark gradient */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center 80%, ${COLORS.navy} 0%, #000510 100%)`,
        }}
      />

      {/* Glow */}
      <div
        style={{
          position: 'absolute',
          bottom: 150,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.green}40 0%, transparent 60%)`,
          filter: `blur(${glowIntensity}px)`,
        }}
      />

      {/* PHASE 1: DeMarcus HUGE */}
      {phase === 1 && (
        <>
          <div
            style={{
              position: 'absolute',
              bottom: 100,
              left: '50%',
              transform: `translateX(-50%) translateY(${demarcusY}px) scale(${demarcusScale})`,
              opacity: demarcusOpacity,
            }}
          >
            <Img
              src={DEMARCUS.image}
              style={{
                height: 1200, // HUGE
                width: 'auto',
                filter: `drop-shadow(0 0 ${glowIntensity}px ${COLORS.green}60)`,
              }}
            />
          </div>

          {/* Name */}
          <div
            style={{
              position: 'absolute',
              bottom: 60,
              left: 0,
              right: 0,
              textAlign: 'center',
              opacity: titleOpacity,
            }}
          >
            <div
              style={{
                ...FONTS.headline,
                fontSize: 56,
                color: COLORS.white,
                textShadow: '0 4px 30px rgba(0,0,0,0.9)',
              }}
            >
              DEMARCUS LAWRENCE
            </div>
            <div
              style={{
                ...FONTS.body,
                fontSize: 22,
                color: COLORS.green,
                marginTop: 10,
                letterSpacing: '0.2em',
              }}
            >
              #0 • DEFENSIVE END
            </div>
          </div>
        </>
      )}

      {/* PHASE 2: Swipe Carousel - like in-game selector */}
      {phase === 2 && (
        <>
          {swipePlayers.map((player, i) => {
            // Calculate position for each player
            const relativeIndex = i - currentPlayerIndex;
            
            // Smooth transition
            const baseX = relativeIndex * 600;
            const slideOffset = swipeProgress * -600;
            const x = baseX + slideOffset;
            
            // Scale: current is biggest, others smaller
            const distanceFromCenter = Math.abs(relativeIndex - swipeProgress);
            const playerScale = interpolate(distanceFromCenter, [0, 1, 2], [1, 0.7, 0.5], { extrapolateRight: 'clamp' });
            const playerOpacity = interpolate(distanceFromCenter, [0, 1, 2], [1, 0.6, 0.3], { extrapolateRight: 'clamp' });
            
            // Only show nearby players
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
                  transition: 'transform 0.1s ease-out',
                }}
              >
                <Img
                  src={player.image}
                  style={{
                    height: 1000,
                    width: 'auto',
                    filter: distanceFromCenter < 0.5 
                      ? `drop-shadow(0 0 ${glowIntensity}px ${COLORS.green}60)` 
                      : 'brightness(0.6)',
                  }}
                />
              </div>
            );
          })}

          {/* Current player name */}
          <div
            style={{
              position: 'absolute',
              bottom: 60,
              left: 0,
              right: 0,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                ...FONTS.headline,
                fontSize: 48,
                color: COLORS.white,
                textShadow: '0 4px 30px rgba(0,0,0,0.9)',
              }}
            >
              {swipePlayers[currentPlayerIndex]?.name || ''}
            </div>
            <div
              style={{
                ...FONTS.body,
                fontSize: 20,
                color: COLORS.green,
                marginTop: 8,
                letterSpacing: '0.15em',
              }}
            >
              #{swipePlayers[currentPlayerIndex]?.jersey} • {swipePlayers[currentPlayerIndex]?.position}
            </div>
          </div>

          {/* Swipe indicator dots */}
          <div
            style={{
              position: 'absolute',
              bottom: 25,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            {swipePlayers.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === currentPlayerIndex ? 24 : 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: i === currentPlayerIndex ? COLORS.green : COLORS.grey,
                  transition: 'all 0.2s',
                }}
              />
            ))}
          </div>

          {/* "CHOOSE YOUR DEFENDER" header */}
          <div
            style={{
              position: 'absolute',
              top: 120,
              left: 0,
              right: 0,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                ...FONTS.headline,
                fontSize: 42,
                color: COLORS.white,
                textShadow: `0 0 30px ${COLORS.green}50`,
              }}
            >
              CHOOSE YOUR DEFENDER
            </div>
          </div>
        </>
      )}

      {/* DrinkSip - top */}
      <div
        style={{
          position: 'absolute',
          top: 50,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          opacity: phase === 1 ? titleOpacity : 0.7,
        }}
      >
        <div style={{ ...FONTS.body, fontSize: 12, color: COLORS.grey, letterSpacing: '0.25em' }}>
          PRESENTED BY
        </div>
        <Img src={DRINKSIP.logo} style={{ height: 45, width: 'auto' }} />
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 3: TITLE SLAM (10-13s)
// DARK SIDE / DEFENSE - same strong slam as V1
// ============================================================================
const Scene3TitleSlam: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Screen shake
  const shakeIntensity = frame < 20 ? (20 - frame) * 0.8 : 0;
  const shakeX = Math.sin(frame * 3) * shakeIntensity;
  const shakeY = Math.cos(frame * 4) * shakeIntensity * 0.5;

  // Line animations
  const line1Scale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 200, mass: 0.5 },
    from: 2.5,
    to: 1,
  });
  const line1Opacity = interpolate(frame, [0, 4], [0, 1], { extrapolateRight: 'clamp' });

  const line2Frame = Math.max(0, frame - 8);
  const line2Scale = spring({
    frame: line2Frame,
    fps,
    config: { damping: 10, stiffness: 200, mass: 0.5 },
    from: 2.5,
    to: 1,
  });
  const line2Opacity = interpolate(line2Frame, [0, 4], [0, 1], { extrapolateRight: 'clamp' });

  // Flash
  const flashOpacity = interpolate(frame, [0, 4, 10], [1, 0.5, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.black,
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      {/* Green radial */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, ${COLORS.green}25 0%, transparent 50%)`,
        }}
      />

      {/* Title */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
        }}
      >
        <div
          style={{
            ...FONTS.headline,
            fontSize: 140,
            color: COLORS.white,
            opacity: line1Opacity,
            transform: `scale(${line1Scale})`,
            textShadow: `0 0 80px ${COLORS.green}, 0 0 160px ${COLORS.green}40, 0 10px 40px rgba(0,0,0,0.9)`,
            lineHeight: 0.95,
          }}
        >
          DARK SIDE
        </div>
        <div
          style={{
            ...FONTS.headline,
            fontSize: 140,
            color: COLORS.green,
            opacity: line2Opacity,
            transform: `scale(${line2Scale})`,
            textShadow: `0 0 60px ${COLORS.green}, 0 10px 40px rgba(0,0,0,0.9)`,
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
// SCENE 4: ROSTER CAROUSEL (13-19s)
// Full card carousel - one BIG card at a time, swiping through
// ============================================================================
const Scene4RosterCarousel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 6 seconds = 180 frames
  // Show each card for ~30 frames, with swipe transition
  const rosterPlayers = [PLAYERS[0], PLAYERS[7], PLAYERS[1], PLAYERS[4], PLAYERS[5], PLAYERS[3]];
  const cardDuration = 28;
  const currentCardIndex = Math.min(Math.floor(frame / cardDuration), rosterPlayers.length - 1);
  const cardProgress = (frame % cardDuration) / cardDuration;

  // Card dimensions - ONE BIG CARD
  const cardWidth = 550;
  const cardHeight = 750;

  // Header
  const headerOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: '#050508' }}>
      {/* Header */}
      <div
        style={{
          position: 'absolute',
          top: 120,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: headerOpacity,
        }}
      >
        <div style={{ ...FONTS.headline, fontSize: 44, color: COLORS.white }}>
          THE ROSTER
        </div>
        <div style={{ ...FONTS.body, fontSize: 18, color: COLORS.green, marginTop: 10, letterSpacing: '0.2em' }}>
          SEATTLE SEAHAWKS DEFENSE
        </div>
      </div>

      {/* Card carousel */}
      <div
        style={{
          position: 'absolute',
          top: 250,
          left: 0,
          right: 0,
          height: cardHeight + 100,
          overflow: 'hidden',
        }}
      >
        {rosterPlayers.map((player, i) => {
          const relativeIndex = i - currentCardIndex;
          
          // Horizontal slide
          const baseX = relativeIndex * (cardWidth + 40);
          const slideOffset = cardProgress * -(cardWidth + 40);
          const x = baseX + slideOffset;
          
          // Scale and opacity based on position
          const distanceFromCenter = Math.abs(relativeIndex - cardProgress);
          const cardScale = interpolate(distanceFromCenter, [0, 1], [1, 0.85], { extrapolateRight: 'clamp' });
          const cardOpacity = interpolate(distanceFromCenter, [0, 1, 2], [1, 0.5, 0], { extrapolateRight: 'clamp' });

          if (Math.abs(relativeIndex) > 1.5) return null;

          return (
            <div
              key={player.id}
              style={{
                position: 'absolute',
                left: '50%',
                top: 0,
                transform: `translateX(calc(-50% + ${x}px)) scale(${cardScale})`,
                opacity: cardOpacity,
              }}
            >
              <div
                style={{
                  width: cardWidth,
                  height: cardHeight,
                  borderRadius: 28,
                  overflow: 'hidden',
                  border: `5px solid ${COLORS.green}`,
                  boxShadow: distanceFromCenter < 0.5 
                    ? `0 0 50px ${COLORS.green}70, 0 20px 60px rgba(0,0,0,0.7)`
                    : `0 0 20px ${COLORS.green}30, 0 15px 40px rgba(0,0,0,0.5)`,
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

                {/* Jersey number - BIG */}
                <div
                  style={{
                    position: 'absolute',
                    top: 20,
                    right: 24,
                    ...FONTS.headline,
                    fontSize: 72,
                    color: COLORS.green,
                    textShadow: `3px 3px 0 ${COLORS.navy}, 0 0 20px rgba(0,0,0,0.8)`,
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
                    padding: '40px 24px 28px',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.95))',
                  }}
                >
                  <div
                    style={{
                      ...FONTS.headline,
                      fontSize: 36,
                      color: COLORS.white,
                      textAlign: 'center',
                    }}
                  >
                    {player.lastName}
                  </div>
                  <div
                    style={{
                      ...FONTS.body,
                      fontSize: 18,
                      color: COLORS.green,
                      textAlign: 'center',
                      marginTop: 8,
                      letterSpacing: '0.15em',
                    }}
                  >
                    {player.position}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress dots */}
      <div
        style={{
          position: 'absolute',
          bottom: 150,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 12,
        }}
      >
        {rosterPlayers.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === currentCardIndex ? 28 : 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: i === currentCardIndex ? COLORS.green : 'rgba(105, 190, 40, 0.3)',
              transition: 'all 0.2s',
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 5: GIVEAWAY (19-25s)
// WIN tickets - same as V1 but cleaner
// ============================================================================
const Scene5Giveaway: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Gold particles
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    angle: (i / 25) * Math.PI * 2,
    speed: 4 + Math.random() * 4,
    size: 4 + Math.random() * 5,
  }));

  // Screen shake
  const shakeIntensity = frame < 12 ? (12 - frame) * 1.2 : 0;
  const shakeX = Math.sin(frame * 2.5) * shakeIntensity;
  const shakeY = Math.cos(frame * 3) * shakeIntensity * 0.5;

  // WIN animation
  const winScale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 120 },
    from: 0.5,
    to: 1,
  });
  const winOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  // Ticket
  const ticketOpacity = interpolate(frame, [25, 45], [0, 1], { extrapolateRight: 'clamp' });
  const ticketY = spring({
    frame: Math.max(0, frame - 25),
    fps,
    config: { damping: 14, stiffness: 70 },
    from: 50,
    to: 0,
  });

  // Glow
  const glowIntensity = 40 + Math.sin(frame * 0.1) * 15;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.black,
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      {/* Gold radial */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, ${COLORS.gold}20 0%, transparent 50%)`,
        }}
      />

      {/* Particles */}
      {frame < 60 &&
        particles.map((p) => {
          const distance = frame * p.speed;
          const x = Math.cos(p.angle) * distance;
          const y = Math.sin(p.angle) * distance;
          const opacity = interpolate(frame, [0, 60], [1, 0]);

          return (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                top: '35%',
                left: '50%',
                width: p.size,
                height: p.size,
                borderRadius: '50%',
                backgroundColor: COLORS.gold,
                transform: `translate(${x}px, ${y}px)`,
                opacity,
                boxShadow: `0 0 12px ${COLORS.gold}`,
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
          gap: 35,
          padding: 50,
        }}
      >
        {/* WIN */}
        <div
          style={{
            ...FONTS.headline,
            fontSize: 150,
            color: COLORS.gold,
            opacity: winOpacity,
            transform: `scale(${winScale})`,
            textShadow: `0 0 80px ${COLORS.gold}, 0 10px 50px rgba(0,0,0,0.9)`,
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
              width: 500,
              padding: '35px 45px',
              background: `linear-gradient(135deg, ${COLORS.gold} 0%, ${COLORS.goldDark} 100%)`,
              borderRadius: 24,
              boxShadow: `0 0 ${glowIntensity}px ${COLORS.gold}60, 0 25px 70px rgba(0,0,0,0.6)`,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                ...FONTS.body,
                fontSize: 22,
                color: COLORS.navy,
                letterSpacing: '0.2em',
                marginBottom: 12,
              }}
            >
              SUPER BOWL LX
            </div>
            <div
              style={{
                ...FONTS.headline,
                fontSize: 64,
                color: COLORS.navy,
                lineHeight: 1,
              }}
            >
              2 TICKETS
            </div>
            <div
              style={{
                ...FONTS.body,
                fontSize: 18,
                color: 'rgba(0,34,68,0.7)',
                marginTop: 16,
              }}
            >
              FEBRUARY 9 • SAN FRANCISCO
            </div>
          </div>
        </div>

        {/* Watch DeMarcus */}
        <div
          style={{
            ...FONTS.body,
            fontSize: 24,
            color: COLORS.grey,
            textAlign: 'center',
            opacity: interpolate(frame, [100, 130], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        >
          WATCH DEMARCUS COMPETE LIVE
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 6: CTA (25-30s)
// Play now - clean and confident
// ============================================================================
const Scene6CTA: React.FC = () => {
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

  const glow = 22 + Math.sin(frame * 0.12) * 10;

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
          gap: 30,
          padding: 50,
        }}
      >
        {/* Title */}
        <div style={{ textAlign: 'center', opacity: titleOpacity }}>
          <div
            style={{
              ...FONTS.headline,
              fontSize: 68,
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
              fontSize: 68,
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
              padding: '24px 55px',
              background: `linear-gradient(135deg, ${COLORS.green} 0%, #4a9e1c 100%)`,
              borderRadius: 18,
              boxShadow: `0 0 ${glow}px ${COLORS.green}, 0 15px 50px rgba(0,0,0,0.5)`,
            }}
          >
            <span
              style={{
                ...FONTS.headline,
                fontSize: 34,
                color: COLORS.white,
              }}
            >
              game.drinksip.com
            </span>
          </div>
        </div>

        {/* PLAY NOW */}
        <div
          style={{
            ...FONTS.headline,
            fontSize: 44,
            color: COLORS.gold,
            opacity: buttonOpacity,
            textShadow: `0 0 30px ${COLORS.gold}50`,
          }}
        >
          PLAY NOW
        </div>

        {/* Super Bowl date */}
        <div
          style={{
            ...FONTS.body,
            fontSize: 20,
            color: COLORS.grey,
            opacity: bottomOpacity,
            letterSpacing: '0.15em',
          }}
        >
          {SUPER_BOWL.name} • {SUPER_BOWL.date.toUpperCase()}
        </div>

        {/* DrinkSip */}
        <div
          style={{
            marginTop: 25,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            opacity: bottomOpacity,
          }}
        >
          <span style={{ ...FONTS.body, fontSize: 12, color: COLORS.grey, letterSpacing: '0.25em' }}>
            POWERED BY
          </span>
          <Img
            src={DRINKSIP.logo}
            style={{ height: 50, width: 'auto', filter: 'drop-shadow(0 4px 15px rgba(0,0,0,0.5))' }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// MAIN COMPOSITION
// ============================================================================
export const CommercialVerticalV6: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Sequence from={SCENES.hook.start} durationInFrames={SCENES.hook.end - SCENES.hook.start}>
        <Scene1Hook />
      </Sequence>

      <Sequence from={SCENES.playerSwipe.start} durationInFrames={SCENES.playerSwipe.end - SCENES.playerSwipe.start}>
        <Scene2PlayerSwipe />
      </Sequence>

      <Sequence from={SCENES.titleSlam.start} durationInFrames={SCENES.titleSlam.end - SCENES.titleSlam.start}>
        <Scene3TitleSlam />
      </Sequence>

      <Sequence from={SCENES.rosterCarousel.start} durationInFrames={SCENES.rosterCarousel.end - SCENES.rosterCarousel.start}>
        <Scene4RosterCarousel />
      </Sequence>

      <Sequence from={SCENES.giveaway.start} durationInFrames={SCENES.giveaway.end - SCENES.giveaway.start}>
        <Scene5Giveaway />
      </Sequence>

      <Sequence from={SCENES.cta.start} durationInFrames={SCENES.cta.end - SCENES.cta.start}>
        <Scene6CTA />
      </Sequence>
    </AbsoluteFill>
  );
};
