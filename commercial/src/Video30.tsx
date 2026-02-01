/**
 * 30-Second Commercial - Condensed "The Dark Side Rises"
 * Faster pacing, core beats only
 */
import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, Img } from 'remotion';
import {
  Scene03_NoFootball,
  Scene05_TitleReveal,
  Scene09_Giveaway,
  Scene12_LogoLock,
} from './scenes';
import { TitleSlam, BoldText, CTAButton, GoldTicket, FlashTransition } from './components';
import { SCENES_30, FPS, COLORS, FONTS, FEATURED_PLAYERS, PLAYERS, DEMARCUS, DRINKSIP, GAME, SUPER_BOWL, CAMPAIGN } from './assets';

/**
 * Condensed Player Montage for 30-second version
 * 2 players + DeMarcus hero in 4 seconds
 */
const PlayerMontageCondensed: React.FC = () => {
  const frame = useCurrentFrame();

  // 4 seconds = 120 frames
  // 2 quick players (30 frames each) + DeMarcus (60 frames)
  const currentPlayer =
    frame < 30 ? 0 : // Witherspoon
    frame < 60 ? 1 : // Williams
    2; // DeMarcus

  const player = [FEATURED_PLAYERS[0], FEATURED_PLAYERS[1], DEMARCUS][currentPlayer];
  const isHero = currentPlayer === 2;
  const localFrame = frame - (currentPlayer === 0 ? 0 : currentPlayer === 1 ? 30 : 60);

  const opacity = interpolate(localFrame, [0, 5], [0, 1], { extrapolateRight: 'clamp' });
  const scale = interpolate(localFrame, [0, 8], [1.1, 1], { extrapolateRight: 'clamp' });
  const glow = isHero ? 20 : 12;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.navy,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Green glow */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.green}30 0%, transparent 70%)`,
          filter: `blur(${glow}px)`,
        }}
      />

      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
        }}
      >
        <div
          style={{
            width: isHero ? 380 : 300,
            height: isHero ? 475 : 375,
            borderRadius: 12,
            overflow: 'hidden',
            border: `3px solid ${COLORS.green}`,
            boxShadow: `0 0 ${glow}px ${COLORS.green}, 0 15px 50px rgba(0,0,0,0.5)`,
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
        </div>

        {/* Jersey number */}
        <div
          style={{
            position: 'absolute',
            top: 15,
            right: 15,
            ...FONTS.number,
            fontSize: isHero ? 55 : 40,
            color: COLORS.green,
            textShadow: `2px 2px 0 ${COLORS.navy}`,
          }}
        >
          #{player.jersey}
        </div>

        {/* Name for hero only */}
        {isHero && (
          <div
            style={{
              position: 'absolute',
              bottom: -50,
              left: '50%',
              transform: 'translateX(-50%)',
              ...FONTS.headline,
              fontSize: 40,
              color: COLORS.white,
              whiteSpace: 'nowrap',
              opacity: interpolate(localFrame, [15, 25], [0, 1], { extrapolateRight: 'clamp' }),
            }}
          >
            {player.lastName}
          </div>
        )}
      </div>

      {/* Flash on cut */}
      {(localFrame < 4) && (
        <AbsoluteFill
          style={{
            backgroundColor: COLORS.white,
            opacity: interpolate(localFrame, [0, 4], [0.6, 0]),
          }}
        />
      )}
    </AbsoluteFill>
  );
};

/**
 * Condensed Gameplay - faster action words
 */
const GameplayCondensed: React.FC = () => {
  const frame = useCurrentFrame();
  
  // 6 seconds = 180 frames
  // 3 words, 60 frames each
  const words = ['TACKLE', 'COLLECT', 'DOMINATE'];
  const wordIndex = Math.min(Math.floor(frame / 60), 2);
  const wordFrame = frame % 60;

  const word = words[wordIndex];
  const bgImages = [PLAYERS[2].image, CAMPAIGN.stadiumImage, PLAYERS[7].image];

  const opacity = interpolate(wordFrame, [0, 5, 50, 60], [0, 1, 1, 0], {
    extrapolateRight: 'clamp',
  });
  const scale = interpolate(wordFrame, [0, 8], [0.7, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      <AbsoluteFill>
        <Img
          src={bgImages[wordIndex]}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.35)',
          }}
        />
      </AbsoluteFill>

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
            fontSize: 180,
            color: COLORS.white,
            opacity,
            transform: `scale(${scale})`,
            textShadow: `0 0 60px ${COLORS.green}, 0 8px 30px rgba(0,0,0,0.9)`,
            letterSpacing: '0.1em',
          }}
        >
          {word}
        </div>
      </AbsoluteFill>

      {wordFrame < 5 && <FlashTransition duration={5} />}
    </AbsoluteFill>
  );
};

/**
 * Condensed Giveaway
 */
const GiveawayCondensed: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.black,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 30,
      }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, ${COLORS.gold}20 0%, transparent 50%)`,
        }}
      />

      <BoldText fontSize={120} color={COLORS.gold} animation="slam" glow={COLORS.gold}>
        WIN
      </BoldText>

      <GoldTicket delay={15} />

      <FlashTransition color={COLORS.gold} duration={8} />
    </AbsoluteFill>
  );
};

/**
 * Condensed CTA + Presented By combined
 */
const CTACondensed: React.FC = () => {
  const frame = useCurrentFrame();

  const glow = 18 + Math.sin(frame * 0.15) * 8;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.navy,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 25,
      }}
    >
      {/* URL */}
      <CTAButton text={GAME.url} delay={0} />

      {/* Enter to win */}
      <div
        style={{
          ...FONTS.headline,
          fontSize: 36,
          color: COLORS.gold,
          opacity: interpolate(frame, [30, 45], [0, 1], { extrapolateRight: 'clamp' }),
        }}
      >
        ENTER TO WIN
      </div>

      {/* DrinkSip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginTop: 20,
          opacity: interpolate(frame, [45, 60], [0, 1], { extrapolateRight: 'clamp' }),
        }}
      >
        <span style={{ ...FONTS.body, fontSize: 14, color: COLORS.grey, letterSpacing: '0.2em' }}>
          POWERED BY
        </span>
        <Img src={DRINKSIP.logo} style={{ height: 35 }} />
      </div>
    </AbsoluteFill>
  );
};

/**
 * Condensed Logo Lock
 */
const LogoLockCondensed: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const glow = 15 + Math.sin(frame * 0.1) * 8;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.black,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
      }}
    >
      <div
        style={{
          ...FONTS.headline,
          fontSize: 70,
          color: COLORS.white,
          textAlign: 'center',
          textShadow: `0 0 ${glow}px ${COLORS.green}`,
          lineHeight: 1.1,
        }}
      >
        DARK SIDE
        <br />
        <span style={{ color: COLORS.green }}>DEFENSE</span>
      </div>

      <div
        style={{
          ...FONTS.body,
          fontSize: 18,
          color: COLORS.gold,
          marginTop: 30,
          letterSpacing: '0.15em',
        }}
      >
        {SUPER_BOWL.name} • {SUPER_BOWL.date.toUpperCase()}
      </div>
    </AbsoluteFill>
  );
};

export const Commercial30: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Scene 1: No Football (0-2s) */}
      <Sequence from={SCENES_30.noFootball.start} durationInFrames={SCENES_30.noFootball.end - SCENES_30.noFootball.start}>
        <Scene03_NoFootball />
      </Sequence>

      {/* Scene 2: Player Montage Condensed (2-6s) */}
      <Sequence from={SCENES_30.playerMontage.start} durationInFrames={SCENES_30.playerMontage.end - SCENES_30.playerMontage.start}>
        <PlayerMontageCondensed />
      </Sequence>

      {/* Scene 3: Title Reveal (6-8s) */}
      <Sequence from={SCENES_30.titleReveal.start} durationInFrames={SCENES_30.titleReveal.end - SCENES_30.titleReveal.start}>
        <Scene05_TitleReveal />
      </Sequence>

      {/* Scene 4: Gameplay Condensed (8-14s) */}
      <Sequence from={SCENES_30.gameplay.start} durationInFrames={SCENES_30.gameplay.end - SCENES_30.gameplay.start}>
        <GameplayCondensed />
      </Sequence>

      {/* Scene 5: Giveaway Condensed (14-20s) */}
      <Sequence from={SCENES_30.giveaway.start} durationInFrames={SCENES_30.giveaway.end - SCENES_30.giveaway.start}>
        <GiveawayCondensed />
      </Sequence>

      {/* Scene 6: CTA Condensed (20-24s) */}
      <Sequence from={SCENES_30.presentedBy.start} durationInFrames={SCENES_30.presentedBy.end - SCENES_30.presentedBy.start}>
        <CTACondensed />
      </Sequence>

      {/* Scene 7: CTA part 2 (24-28s) */}
      <Sequence from={SCENES_30.cta.start} durationInFrames={SCENES_30.cta.end - SCENES_30.cta.start}>
        <CTACondensed />
      </Sequence>

      {/* Scene 8: Logo Lock (28-30s) */}
      <Sequence from={SCENES_30.logoLock.start} durationInFrames={SCENES_30.logoLock.end - SCENES_30.logoLock.start}>
        <LogoLockCondensed />
      </Sequence>
    </AbsoluteFill>
  );
};
