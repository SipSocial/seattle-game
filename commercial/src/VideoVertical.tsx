/**
 * 30-Second VERTICAL Commercial (9:16) - "The Dark Side Rises"
 * KILLER VERSION - DeMarcus huge, crew stacked, no dead space
 */
import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, Img, spring, useVideoConfig } from 'remotion';
import { BoldText, TitleSlam, GoldTicket, CTAButton, FlashTransition } from './components';
import { 
  SCENES_VERTICAL, FPS, COLORS, FONTS, 
  DEMARCUS, CREW, PLAYERS, PLAYERS_TRANSPARENT,
  DRINKSIP, GAME, SUPER_BOWL, CAMPAIGN 
} from './assets';

// ============================================================================
// SCENE 1: HOOK (0-3s)
// "NO FOOTBALL THIS WEEK" - bold, fills the screen
// ============================================================================
const HookScene: React.FC = () => {
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

      {/* Main text - HUGE, centered */}
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

      <FlashTransition duration={8} />
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 2: SQUAD REVEAL (3-10s)
// DeMarcus HUGE in front, crew stacked behind - transparent PNGs
// ============================================================================
const SquadRevealScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // DeMarcus entrance - spring from bottom
  const demarcusY = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 80, mass: 1 },
    from: 400,
    to: 0,
  });
  const demarcusScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
    from: 0.8,
    to: 1,
  });
  const demarcusOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  // Crew fade in staggered
  const crewOpacity = interpolate(frame, [30, 60], [0, 1], { extrapolateRight: 'clamp' });

  // Glow pulse
  const glowIntensity = 40 + Math.sin(frame * 0.1) * 15;

  // Title fade in
  const titleOpacity = interpolate(frame, [90, 120], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.navy }}>
      {/* Dark radial gradient */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center 70%, ${COLORS.navy} 0%, #000510 100%)`,
        }}
      />

      {/* Green glow behind DeMarcus */}
      <div
        style={{
          position: 'absolute',
          bottom: 100,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.green}50 0%, transparent 60%)`,
          filter: `blur(${glowIntensity}px)`,
        }}
      />

      {/* CREW - stacked behind DeMarcus (3 on each side) */}
      <div
        style={{
          position: 'absolute',
          bottom: 350,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 0,
          opacity: crewOpacity,
        }}
      >
        {/* Left side crew */}
        {CREW.slice(0, 3).map((player, i) => {
          const offsetX = -(i + 1) * 120;
          const offsetY = i * 30;
          const playerScale = 0.55 - i * 0.08;
          const playerOpacity = 0.9 - i * 0.15;

          return (
            <Img
              key={player.id}
              src={player.image}
              style={{
                position: 'absolute',
                left: '50%',
                height: 500,
                width: 'auto',
                transform: `translateX(calc(-50% + ${offsetX}px)) translateY(${offsetY}px) scale(${playerScale})`,
                opacity: playerOpacity,
                filter: `brightness(${0.7 - i * 0.1})`,
              }}
            />
          );
        })}

        {/* Right side crew */}
        {CREW.slice(3, 6).map((player, i) => {
          const offsetX = (i + 1) * 120;
          const offsetY = i * 30;
          const playerScale = 0.55 - i * 0.08;
          const playerOpacity = 0.9 - i * 0.15;

          return (
            <Img
              key={player.id}
              src={player.image}
              style={{
                position: 'absolute',
                left: '50%',
                height: 500,
                width: 'auto',
                transform: `translateX(calc(-50% + ${offsetX}px)) translateY(${offsetY}px) scale(${playerScale})`,
                opacity: playerOpacity,
                filter: `brightness(${0.7 - i * 0.1})`,
              }}
            />
          );
        })}
      </div>

      {/* DEMARCUS - MASSIVE, front and center */}
      <div
        style={{
          position: 'absolute',
          bottom: 80,
          left: '50%',
          transform: `translateX(-50%) translateY(${demarcusY}px) scale(${demarcusScale})`,
          opacity: demarcusOpacity,
        }}
      >
        <Img
          src={DEMARCUS.image}
          style={{
            height: 900,
            width: 'auto',
            filter: 'drop-shadow(0 0 60px rgba(105, 190, 40, 0.5))',
          }}
        />
      </div>

      {/* Jersey number overlay */}
      <div
        style={{
          position: 'absolute',
          top: 120,
          left: '50%',
          transform: 'translateX(-50%)',
          ...FONTS.number,
          fontSize: 200,
          color: COLORS.green,
          opacity: interpolate(frame, [60, 90], [0, 0.3], { extrapolateRight: 'clamp' }),
          textShadow: `0 0 80px ${COLORS.green}`,
        }}
      >
        #0
      </div>

      {/* "PRESENTED BY" + DrinkSip logo - TOP */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 15,
          opacity: titleOpacity,
        }}
      >
        <div
          style={{
            ...FONTS.body,
            fontSize: 18,
            color: COLORS.grey,
            letterSpacing: '0.25em',
          }}
        >
          PRESENTED BY
        </div>
        <Img
          src={DRINKSIP.logo}
          style={{
            height: 60,
            width: 'auto',
            filter: 'drop-shadow(0 4px 15px rgba(0,0,0,0.6))',
          }}
        />
      </div>

      {/* DeMarcus name - bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: titleOpacity,
        }}
      >
        <div
          style={{
            ...FONTS.headline,
            fontSize: 52,
            color: COLORS.white,
            textShadow: '0 4px 30px rgba(0,0,0,0.9)',
          }}
        >
          DEMARCUS LAWRENCE
        </div>
        <div
          style={{
            ...FONTS.body,
            fontSize: 24,
            color: COLORS.green,
            marginTop: 8,
            letterSpacing: '0.2em',
          }}
        >
          & THE DARK SIDE DEFENSE
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 3: TITLE SLAM (10-13s)
// DARK SIDE / DEFENSE - massive impact
// ============================================================================
const TitleSlamScene: React.FC = () => {
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

      <FlashTransition color={COLORS.white} duration={10} />
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 4: GAMEPLAY (13-19s)
// Action words + player selection cards
// ============================================================================
const GameplayScene: React.FC = () => {
  const frame = useCurrentFrame();

  // 6 seconds = 180 frames
  // Phase 1: Action words (0-90 frames)
  // Phase 2: Player cards (90-180 frames)

  const showCards = frame >= 90;

  const words = ['TACKLE', 'DEFEND', 'DOMINATE'];
  const wordIndex = Math.min(Math.floor(frame / 30), 2);
  const wordFrame = frame % 30;

  const cardPlayers = [PLAYERS[0], PLAYERS[7], PLAYERS[1], PLAYERS[4]]; // Lawrence, Witherspoon, Williams, Nwosu

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      {/* Action words phase */}
      {!showCards && (
        <AbsoluteFill
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              ...FONTS.headline,
              fontSize: 160,
              color: COLORS.white,
              opacity: interpolate(wordFrame, [0, 4, 24, 30], [0, 1, 1, 0]),
              transform: `scale(${interpolate(wordFrame, [0, 6], [0.7, 1], { extrapolateRight: 'clamp' })})`,
              textShadow: `0 0 80px ${COLORS.green}, 0 10px 50px rgba(0,0,0,0.9)`,
              letterSpacing: '0.08em',
            }}
          >
            {words[wordIndex]}
          </div>

          {wordFrame < 4 && <FlashTransition duration={4} />}
        </AbsoluteFill>
      )}

      {/* Player cards phase */}
      {showCards && (
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 30,
            gap: 20,
          }}
        >
          {/* Title */}
          <div
            style={{
              ...FONTS.headline,
              fontSize: 50,
              color: COLORS.white,
              textShadow: `0 0 30px ${COLORS.green}`,
              marginBottom: 20,
              opacity: interpolate(frame - 90, [0, 15], [0, 1], { extrapolateRight: 'clamp' }),
            }}
          >
            CHOOSE YOUR DEFENDER
          </div>

          {/* Cards grid - 2x2 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 20,
            }}
          >
            {cardPlayers.map((player, i) => {
              const delay = i * 6;
              const cardOpacity = interpolate(frame - 90, [delay, delay + 12], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });
              const cardScale = interpolate(frame - 90, [delay, delay + 10], [0.8, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });

              return (
                <div
                  key={player.id}
                  style={{
                    width: 220,
                    height: 280,
                    borderRadius: 16,
                    overflow: 'hidden',
                    border: `4px solid ${COLORS.green}`,
                    boxShadow: `0 0 25px ${COLORS.green}60, 0 15px 40px rgba(0,0,0,0.6)`,
                    opacity: cardOpacity,
                    transform: `scale(${cardScale})`,
                    position: 'relative',
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
                      right: 10,
                      ...FONTS.number,
                      fontSize: 36,
                      color: COLORS.green,
                      textShadow: `2px 2px 0 ${COLORS.navy}`,
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
                      padding: '12px 10px',
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
                    }}
                  >
                    <div
                      style={{
                        ...FONTS.headline,
                        fontSize: 18,
                        color: COLORS.white,
                        textAlign: 'center',
                      }}
                    >
                      {player.lastName}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 5: GIVEAWAY (19-25s)
// WIN 2 SUPER BOWL TICKETS - gold explosion
// ============================================================================
const GiveawayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Gold particles
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    angle: (i / 30) * Math.PI * 2,
    speed: 5 + Math.random() * 5,
    size: 4 + Math.random() * 6,
  }));

  // Screen shake
  const shakeIntensity = frame < 12 ? (12 - frame) * 1.5 : 0;
  const shakeX = Math.sin(frame * 2.5) * shakeIntensity;
  const shakeY = Math.cos(frame * 3) * shakeIntensity * 0.6;

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
          background: `radial-gradient(ellipse at center, ${COLORS.gold}30 0%, transparent 50%)`,
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
                top: '40%',
                left: '50%',
                width: p.size,
                height: p.size,
                borderRadius: '50%',
                backgroundColor: COLORS.gold,
                transform: `translate(${x}px, ${y}px)`,
                opacity,
                boxShadow: `0 0 15px ${COLORS.gold}`,
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
          gap: 35,
          padding: 40,
        }}
      >
        {/* WIN */}
        <div
          style={{
            ...FONTS.headline,
            fontSize: 130,
            color: COLORS.gold,
            textShadow: `0 0 60px ${COLORS.gold}, 0 8px 40px rgba(0,0,0,0.9)`,
            opacity: interpolate(frame, [5, 15], [0, 1], { extrapolateRight: 'clamp' }),
            transform: `scale(${interpolate(frame, [5, 12], [0.7, 1], { extrapolateRight: 'clamp' })})`,
          }}
        >
          WIN
        </div>

        {/* Ticket */}
        <GoldTicket delay={20} />

        {/* Watch DeMarcus */}
        <div
          style={{
            ...FONTS.body,
            fontSize: 26,
            color: COLORS.grey,
            textAlign: 'center',
            letterSpacing: '0.1em',
            opacity: interpolate(frame, [80, 100], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        >
          WATCH DEMARCUS
          <br />
          COMPETE LIVE
        </div>
      </AbsoluteFill>

      <FlashTransition color={COLORS.gold} duration={10} />
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 6: CTA (25-30s)
// URL massive, logo lock, DrinkSip
// ============================================================================
const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();

  const glow = 25 + Math.sin(frame * 0.12) * 12;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.navy }}>
      {/* Subtle bg */}
      <AbsoluteFill style={{ opacity: 0.2 }}>
        <Img
          src={CAMPAIGN.stadiumImage}
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.4)' }}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          background: `linear-gradient(to bottom, ${COLORS.navy}ee 0%, ${COLORS.navy}dd 100%)`,
        }}
      />

      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 30,
          padding: 40,
        }}
      >
        {/* Game title */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              ...FONTS.headline,
              fontSize: 70,
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
              fontSize: 70,
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
            padding: '22px 50px',
            background: `linear-gradient(135deg, ${COLORS.green} 0%, #4a9e1c 100%)`,
            borderRadius: 16,
            boxShadow: `0 0 ${glow}px ${COLORS.green}, 0 15px 50px rgba(0,0,0,0.5)`,
            opacity: interpolate(frame, [10, 25], [0, 1], { extrapolateRight: 'clamp' }),
            transform: `scale(${interpolate(frame, [10, 22], [0.85, 1], { extrapolateRight: 'clamp' })})`,
          }}
        >
          <span
            style={{
              ...FONTS.headline,
              fontSize: 36,
              color: COLORS.white,
            }}
          >
            {GAME.url}
          </span>
        </div>

        {/* PLAY NOW */}
        <div
          style={{
            ...FONTS.headline,
            fontSize: 40,
            color: COLORS.gold,
            opacity: interpolate(frame, [40, 60], [0, 1], { extrapolateRight: 'clamp' }),
            textShadow: `0 0 30px ${COLORS.gold}50`,
          }}
        >
          PLAY NOW
        </div>

        {/* Super Bowl date */}
        <div
          style={{
            ...FONTS.body,
            fontSize: 22,
            color: COLORS.grey,
            opacity: interpolate(frame, [60, 80], [0, 1], { extrapolateRight: 'clamp' }),
            letterSpacing: '0.15em',
          }}
        >
          {SUPER_BOWL.name} • {SUPER_BOWL.date.toUpperCase()}
        </div>

        {/* DrinkSip - BIGGER */}
        <div
          style={{
            marginTop: 30,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            opacity: interpolate(frame, [80, 100], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        >
          <span
            style={{
              ...FONTS.body,
              fontSize: 14,
              color: COLORS.grey,
              letterSpacing: '0.25em',
            }}
          >
            POWERED BY
          </span>
          <Img
            src={DRINKSIP.logo}
            style={{
              height: 55,
              width: 'auto',
              filter: 'drop-shadow(0 4px 15px rgba(0,0,0,0.5))',
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// MAIN COMPOSITION
// ============================================================================
export const CommercialVertical: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Scene 1: Hook (0-3s) */}
      <Sequence from={SCENES_VERTICAL.hook.start} durationInFrames={SCENES_VERTICAL.hook.end - SCENES_VERTICAL.hook.start}>
        <HookScene />
      </Sequence>

      {/* Scene 2: Squad Reveal (3-10s) */}
      <Sequence from={SCENES_VERTICAL.squadReveal.start} durationInFrames={SCENES_VERTICAL.squadReveal.end - SCENES_VERTICAL.squadReveal.start}>
        <SquadRevealScene />
      </Sequence>

      {/* Scene 3: Title Slam (10-13s) */}
      <Sequence from={SCENES_VERTICAL.titleSlam.start} durationInFrames={SCENES_VERTICAL.titleSlam.end - SCENES_VERTICAL.titleSlam.start}>
        <TitleSlamScene />
      </Sequence>

      {/* Scene 4: Gameplay (13-19s) */}
      <Sequence from={SCENES_VERTICAL.gameplay.start} durationInFrames={SCENES_VERTICAL.gameplay.end - SCENES_VERTICAL.gameplay.start}>
        <GameplayScene />
      </Sequence>

      {/* Scene 5: Giveaway (19-25s) */}
      <Sequence from={SCENES_VERTICAL.giveaway.start} durationInFrames={SCENES_VERTICAL.giveaway.end - SCENES_VERTICAL.giveaway.start}>
        <GiveawayScene />
      </Sequence>

      {/* Scene 6: CTA (25-30s) */}
      <Sequence from={SCENES_VERTICAL.cta.start} durationInFrames={SCENES_VERTICAL.cta.end - SCENES_VERTICAL.cta.start}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
};
