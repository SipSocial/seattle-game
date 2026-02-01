/**
 * DARK SIDE DEFENSE — V4 HIGH-ENERGY GAME RELEASE
 * 
 * CORE FEELING: Defense feels powerful. Fast. Addictive.
 * CREATIVE IDEA: Defense isn't passive. Defense is the weapon.
 * 
 * RULES:
 * - Cuts every 0.4-1.2 seconds
 * - Nothing holds longer than 2 seconds
 * - Speed > clarity
 * - Players as motion elements, not portraits
 * - UI = punchy game HUD, not website
 * - Words = hits, not captions
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
} from './assets';

// ============================================================================
// CONSTANTS
// ============================================================================
const FPS = 30;
const SCREEN_WIDTH = 1080;
const SCREEN_HEIGHT = 1920;

// Aggressive timing - cuts every 0.4-1.2 seconds
const SCENES = {
  scrollKiller: { start: 0, end: 2 * FPS },        // 0-2s - DEFENSE slam
  chaosBurst: { start: 2 * FPS, end: 6 * FPS },     // 2-6s - rapid flashes
  playerControl: { start: 6 * FPS, end: 9 * FPS },  // 6-9s - selector snap
  powerRamp: { start: 9 * FPS, end: 14 * FPS },     // 9-14s - speed ramps, verbs
  rewardSpike: { start: 14 * FPS, end: 18 * FPS },  // 14-18s - slowdown, WIN, ticket
  snapBack: { start: 18 * FPS, end: 22 * FPS },     // 18-22s - rapid flashes
  actionCommand: { start: 22 * FPS, end: 27 * FPS }, // 22-27s - URL, QR, PLAY NOW
};

// Typography - one heavy font, massive
const Type = {
  impact: {
    fontFamily: 'Impact, Arial Black, sans-serif',
    fontWeight: 900,
    letterSpacing: '-0.02em',
    lineHeight: 0.9,
    textTransform: 'uppercase' as const,
  },
};

// ============================================================================
// SCENE 1: SCROLL KILLER (0-2s)
// Full-frame color. One huge word: DEFENSE. Hard hit. Immediate cut.
// ============================================================================
const Scene1ScrollKiller: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slam in with scale
  const scale = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 300 },
    from: 4,
    to: 1,
  });
  const opacity = interpolate(frame, [0, 3], [0, 1], { extrapolateRight: 'clamp' });

  // Screen shake
  const shakeIntensity = frame < 10 ? (10 - frame) * 2 : 0;
  const shakeX = Math.sin(frame * 3) * shakeIntensity;
  const shakeY = Math.cos(frame * 4) * shakeIntensity * 0.5;

  // Flash
  const flashOpacity = interpolate(frame, [0, 4, 8], [1, 0.8, 0], { extrapolateRight: 'clamp' });

  // Exit flash
  const exitFlash = interpolate(frame, [55, 60], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.green,
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      {/* DEFENSE - massive */}
      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity,
          transform: `scale(${scale})`,
        }}
      >
        <div
          style={{
            ...Type.impact,
            fontSize: 180,
            color: COLORS.navy,
            textShadow: '0 10px 40px rgba(0,0,0,0.4)',
          }}
        >
          DEFENSE
        </div>
      </AbsoluteFill>

      {/* Flash */}
      <AbsoluteFill style={{ backgroundColor: '#fff', opacity: flashOpacity, pointerEvents: 'none' }} />
      
      {/* Exit flash */}
      <AbsoluteFill style={{ backgroundColor: '#000', opacity: exitFlash, pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 2: CHAOS BURST (2-6s)
// Rapid flashes. Motion silhouettes. Impacts. UI fragments.
// Words: HIT, REACT, CONTROL
// ============================================================================
const Scene2ChaosBurst: React.FC = () => {
  const frame = useCurrentFrame();

  // 4 seconds = 120 frames
  // Cuts every ~12-15 frames (0.4-0.5s)
  const cutIndex = Math.floor(frame / 12);
  const cutFrame = frame % 12;

  // Flash on each cut
  const cutFlash = interpolate(cutFrame, [0, 3], [0.8, 0], { extrapolateRight: 'clamp' });

  // Content sequence
  const sequence = [
    { type: 'word', content: 'HIT', bg: COLORS.navy },
    { type: 'player', index: 0, bg: '#000' },
    { type: 'word', content: 'REACT', bg: COLORS.green },
    { type: 'player', index: 1, bg: '#000' },
    { type: 'word', content: 'CONTROL', bg: COLORS.navy },
    { type: 'player', index: 2, bg: '#000' },
    { type: 'word', content: 'TACKLE', bg: COLORS.green },
    { type: 'player', index: 3, bg: '#000' },
    { type: 'word', content: 'DOMINATE', bg: COLORS.navy },
    { type: 'player', index: 4, bg: '#000' },
  ];

  const current = sequence[cutIndex % sequence.length];

  // Scale punch on each cut
  const scale = interpolate(cutFrame, [0, 4], [1.3, 1], { extrapolateRight: 'clamp' });

  // Player crops - aggressive, partial views
  const playerCrops = [
    { top: '20%', left: '-20%', rotation: 8 },
    { top: '-10%', left: '30%', rotation: -12 },
    { top: '30%', left: '-30%', rotation: 15 },
    { top: '-20%', left: '20%', rotation: -8 },
    { top: '10%', left: '-10%', rotation: 5 },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: current.bg as string, overflow: 'hidden' }}>
      {current.type === 'word' && (
        <AbsoluteFill
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${scale})`,
          }}
        >
          <div
            style={{
              ...Type.impact,
              fontSize: 200,
              color: current.bg === COLORS.green ? COLORS.navy : COLORS.green,
              textShadow: '0 8px 40px rgba(0,0,0,0.5)',
            }}
          >
            {current.content}
          </div>
        </AbsoluteFill>
      )}

      {current.type === 'player' && (
        <AbsoluteFill style={{ overflow: 'hidden' }}>
          {/* Motion blur effect */}
          <div
            style={{
              position: 'absolute',
              top: playerCrops[(current as any).index].top,
              left: playerCrops[(current as any).index].left,
              transform: `rotate(${playerCrops[(current as any).index].rotation}deg) scale(${scale * 1.5})`,
              filter: 'blur(2px) brightness(0.8)',
            }}
          >
            <Img
              src={CREW[(current as any).index]?.image || DEMARCUS.image}
              style={{
                height: SCREEN_HEIGHT * 1.4,
                width: 'auto',
              }}
            />
          </div>
          
          {/* Impact line */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: 8,
              background: `linear-gradient(90deg, transparent, ${COLORS.green}, transparent)`,
              transform: `translateY(-50%) scaleX(${interpolate(cutFrame, [0, 8], [0, 1])})`,
            }}
          />
        </AbsoluteFill>
      )}

      {/* Cut flash */}
      <AbsoluteFill style={{ backgroundColor: '#fff', opacity: cutFlash, pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 3: PLAYER CONTROL MOMENT (6-9s)
// Screen snaps into massive UI selector. One defender fills frame.
// "I choose / I control" feeling.
// ============================================================================
const Scene3PlayerControl: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Snap animation
  const snapScale = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 250 },
    from: 0.3,
    to: 1,
  });

  // UI border pulse
  const borderGlow = 15 + Math.sin(frame * 0.3) * 10;

  // Screen shake
  const shakeIntensity = frame < 8 ? (8 - frame) * 1.5 : 0;
  const shakeX = Math.sin(frame * 2.5) * shakeIntensity;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#000',
        transform: `translateX(${shakeX}px)`,
      }}
    >
      {/* Player - massive, fills frame */}
      <div
        style={{
          position: 'absolute',
          top: '5%',
          left: '50%',
          transform: `translateX(-50%) scale(${snapScale})`,
        }}
      >
        <Img
          src={DEMARCUS.image}
          style={{
            height: SCREEN_HEIGHT * 0.85,
            width: 'auto',
            filter: `drop-shadow(0 0 ${borderGlow}px ${COLORS.green})`,
          }}
        />
      </div>

      {/* UI Frame overlay */}
      <div
        style={{
          position: 'absolute',
          top: 100,
          left: 60,
          right: 60,
          bottom: 200,
          border: `6px solid ${COLORS.green}`,
          borderRadius: 24,
          boxShadow: `0 0 ${borderGlow * 2}px ${COLORS.green}60, inset 0 0 ${borderGlow}px ${COLORS.green}30`,
          opacity: snapScale,
        }}
      />

      {/* Corner brackets */}
      {[
        { top: 80, left: 40 },
        { top: 80, right: 40 },
        { bottom: 180, left: 40 },
        { bottom: 180, right: 40 },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            ...pos,
            width: 40,
            height: 40,
            borderColor: COLORS.green,
            borderWidth: 4,
            borderStyle: 'solid',
            borderTopWidth: i < 2 ? 4 : 0,
            borderBottomWidth: i >= 2 ? 4 : 0,
            borderLeftWidth: i % 2 === 0 ? 4 : 0,
            borderRightWidth: i % 2 === 1 ? 4 : 0,
            opacity: snapScale,
          }}
        />
      ))}

      {/* SELECT text */}
      <div
        style={{
          position: 'absolute',
          bottom: 100,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: interpolate(frame, [20, 35], [0, 1], { extrapolateRight: 'clamp' }),
        }}
      >
        <div
          style={{
            ...Type.impact,
            fontSize: 72,
            color: COLORS.green,
            textShadow: `0 0 30px ${COLORS.green}`,
          }}
        >
          SELECT
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 4: POWER RAMP (9-14s)
// Speed ramps. Screen shake. Bass hits. Big verbs slam.
// DOMINATE, SHUT IT DOWN, OWN THE DRIVE
// ============================================================================
const Scene4PowerRamp: React.FC = () => {
  const frame = useCurrentFrame();

  // 5 seconds = 150 frames
  // Rapid cuts with verbs
  const verbs = ['DOMINATE', 'SHUT DOWN', 'OWN IT', 'CONTROL', 'CRUSH'];
  const cutDuration = 25;
  const verbIndex = Math.min(Math.floor(frame / cutDuration), verbs.length - 1);
  const cutFrame = frame % cutDuration;

  // Scale slam
  const scale = interpolate(cutFrame, [0, 5, 20], [2.5, 1, 1.05], { extrapolateRight: 'clamp' });

  // Screen shake
  const shakeIntensity = cutFrame < 8 ? (8 - cutFrame) * 2 : 0;
  const shakeX = Math.sin(cutFrame * 2.5) * shakeIntensity;
  const shakeY = Math.cos(cutFrame * 3) * shakeIntensity * 0.5;

  // Flash
  const flash = interpolate(cutFrame, [0, 4], [1, 0], { extrapolateRight: 'clamp' });

  // Alternating colors
  const bgColor = verbIndex % 2 === 0 ? '#000' : COLORS.navy;
  const textColor = verbIndex % 2 === 0 ? COLORS.green : COLORS.white;

  // Speed lines
  const lineOpacity = interpolate(cutFrame, [5, 15], [0.8, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgColor,
        transform: `translate(${shakeX}px, ${shakeY}px)`,
        overflow: 'hidden',
      }}
    >
      {/* Speed lines */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: `${i * 5 + 2}%`,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, transparent, ${COLORS.green}40, transparent)`,
            opacity: lineOpacity,
            transform: `translateX(${(cutFrame - 10) * 20}px)`,
          }}
        />
      ))}

      {/* Verb */}
      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${scale})`,
        }}
      >
        <div
          style={{
            ...Type.impact,
            fontSize: verbs[verbIndex].length > 7 ? 140 : 180,
            color: textColor,
            textShadow: `0 0 60px ${COLORS.green}, 0 10px 40px rgba(0,0,0,0.8)`,
          }}
        >
          {verbs[verbIndex]}
        </div>
      </AbsoluteFill>

      {/* Flash */}
      <AbsoluteFill style={{ backgroundColor: '#fff', opacity: flash, pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 5: REWARD SPIKE (14-18s)
// Sudden slowdown. Brief silence. WIN massive. Ticket full-frame.
// This should feel like a jackpot.
// ============================================================================
const Scene5RewardSpike: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: WIN (0-40 frames)
  // Phase 2: Ticket (40-120 frames)
  const phase = frame < 40 ? 1 : 2;

  // WIN animation
  const winScale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 100 },
    from: 0.3,
    to: 1,
  });
  const winOpacity = interpolate(frame, [0, 15, 35, 45], [0, 1, 1, 0], { extrapolateRight: 'clamp' });

  // Ticket animation
  const ticketFrame = Math.max(0, frame - 40);
  const ticketScale = spring({
    frame: ticketFrame,
    fps,
    config: { damping: 12, stiffness: 80 },
    from: 0.5,
    to: 1,
  });
  const ticketOpacity = interpolate(ticketFrame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  // Gold glow pulse
  const glowIntensity = 40 + Math.sin(frame * 0.1) * 15;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Gold radial */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, ${COLORS.gold}20 0%, transparent 50%)`,
        }}
      />

      {/* WIN */}
      {phase === 1 && (
        <AbsoluteFill
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: winOpacity,
            transform: `scale(${winScale})`,
          }}
        >
          <div
            style={{
              ...Type.impact,
              fontSize: 280,
              color: COLORS.gold,
              textShadow: `0 0 100px ${COLORS.gold}, 0 15px 60px rgba(0,0,0,0.9)`,
            }}
          >
            WIN
          </div>
        </AbsoluteFill>
      )}

      {/* Ticket - FULL FRAME */}
      {phase === 2 && (
        <AbsoluteFill
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: ticketOpacity,
            transform: `scale(${ticketScale})`,
            padding: 60,
          }}
        >
          <div
            style={{
              width: '100%',
              padding: '60px 50px',
              background: `linear-gradient(135deg, ${COLORS.gold} 0%, ${COLORS.goldDark} 100%)`,
              borderRadius: 32,
              boxShadow: `0 0 ${glowIntensity}px ${COLORS.gold}, 0 30px 80px rgba(0,0,0,0.6)`,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                ...Type.impact,
                fontSize: 36,
                color: COLORS.navy,
                letterSpacing: '0.15em',
                marginBottom: 20,
              }}
            >
              SUPER BOWL LX
            </div>
            <div
              style={{
                ...Type.impact,
                fontSize: 100,
                color: COLORS.navy,
                lineHeight: 1,
              }}
            >
              2 TICKETS
            </div>
            <div
              style={{
                ...Type.impact,
                fontSize: 28,
                color: 'rgba(0,34,68,0.7)',
                marginTop: 24,
                letterSpacing: '0.08em',
              }}
            >
              FEBRUARY 9
            </div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 6: SNAP BACK TO SPEED (18-22s)
// Rapid flashes. Logo. Motion. Impacts. UI.
// Short. Violent. Fun.
// ============================================================================
const Scene6SnapBack: React.FC = () => {
  const frame = useCurrentFrame();

  // 4 seconds = 120 frames
  // Ultra rapid cuts - 10 frames each
  const cutIndex = Math.floor(frame / 10);
  const cutFrame = frame % 10;

  const sequence = [
    { type: 'logo' },
    { type: 'player', index: 0 },
    { type: 'word', content: 'DARK' },
    { type: 'player', index: 1 },
    { type: 'word', content: 'SIDE' },
    { type: 'player', index: 2 },
    { type: 'logo' },
    { type: 'word', content: 'DEFENSE' },
    { type: 'player', index: 3 },
    { type: 'logo' },
    { type: 'player', index: 4 },
    { type: 'word', content: 'PLAY' },
  ];

  const current = sequence[cutIndex % sequence.length];
  const scale = interpolate(cutFrame, [0, 3], [1.4, 1], { extrapolateRight: 'clamp' });
  const flash = interpolate(cutFrame, [0, 3], [0.7, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: '#000', overflow: 'hidden' }}>
      {current.type === 'logo' && (
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0,
            transform: `scale(${scale})`,
          }}
        >
          <div style={{ ...Type.impact, fontSize: 100, color: COLORS.white }}>DARK SIDE</div>
          <div style={{ ...Type.impact, fontSize: 100, color: COLORS.green }}>DEFENSE</div>
        </AbsoluteFill>
      )}

      {current.type === 'word' && (
        <AbsoluteFill
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${scale})`,
            backgroundColor: COLORS.green,
          }}
        >
          <div style={{ ...Type.impact, fontSize: 200, color: COLORS.navy }}>
            {(current as any).content}
          </div>
        </AbsoluteFill>
      )}

      {current.type === 'player' && (
        <AbsoluteFill style={{ overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute',
              top: '-20%',
              left: '-20%',
              transform: `scale(${scale * 1.3}) rotate(${((current as any).index - 2) * 5}deg)`,
              filter: 'brightness(0.7)',
            }}
          >
            <Img
              src={CREW[(current as any).index]?.image || DEMARCUS.image}
              style={{ height: SCREEN_HEIGHT * 1.5, width: 'auto' }}
            />
          </div>
        </AbsoluteFill>
      )}

      <AbsoluteFill style={{ backgroundColor: '#fff', opacity: flash, pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 7: ACTION COMMAND (22-27s)
// Big URL. Large QR. PLAY NOW. Everything centered. Everything bold.
// ============================================================================
const Scene7ActionCommand: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Staggered entrances
  const urlScale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 100 },
    from: 0.7,
    to: 1,
  });
  const urlOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  const qrOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: 'clamp' });
  const playOpacity = interpolate(frame, [50, 70], [0, 1], { extrapolateRight: 'clamp' });

  // Glow pulse
  const glow = 20 + Math.sin(frame * 0.15) * 10;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.navy }}>
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 50,
          padding: 60,
        }}
      >
        {/* URL - massive button */}
        <div
          style={{
            opacity: urlOpacity,
            transform: `scale(${urlScale})`,
          }}
        >
          <div
            style={{
              padding: '36px 60px',
              background: `linear-gradient(135deg, ${COLORS.green} 0%, #4a9e1c 100%)`,
              borderRadius: 20,
              boxShadow: `0 0 ${glow}px ${COLORS.green}, 0 20px 60px rgba(0,0,0,0.5)`,
            }}
          >
            <div
              style={{
                ...Type.impact,
                fontSize: 42,
                color: COLORS.white,
              }}
            >
              game.drinksip.com
            </div>
          </div>
        </div>

        {/* QR Code - large */}
        <div
          style={{
            opacity: qrOpacity,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 200,
              height: 200,
              background: COLORS.white,
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 15px 50px rgba(0,0,0,0.4)',
            }}
          >
            <div
              style={{
                ...Type.impact,
                fontSize: 16,
                color: COLORS.navy,
                textAlign: 'center',
              }}
            >
              SCAN<br/>TO<br/>PLAY
            </div>
          </div>
        </div>

        {/* PLAY NOW */}
        <div
          style={{
            opacity: playOpacity,
            ...Type.impact,
            fontSize: 80,
            color: COLORS.gold,
            textShadow: `0 0 40px ${COLORS.gold}50`,
          }}
        >
          PLAY NOW
        </div>

        {/* DrinkSip */}
        <div
          style={{
            opacity: playOpacity,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{ fontSize: 14, color: COLORS.grey, letterSpacing: '0.2em' }}>
            PRESENTED BY
          </div>
          <Img src={DRINKSIP.logo} style={{ height: 50, width: 'auto' }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// MAIN COMPOSITION
// ============================================================================
export const CommercialVerticalV4: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Sequence from={SCENES.scrollKiller.start} durationInFrames={SCENES.scrollKiller.end - SCENES.scrollKiller.start}>
        <Scene1ScrollKiller />
      </Sequence>

      <Sequence from={SCENES.chaosBurst.start} durationInFrames={SCENES.chaosBurst.end - SCENES.chaosBurst.start}>
        <Scene2ChaosBurst />
      </Sequence>

      <Sequence from={SCENES.playerControl.start} durationInFrames={SCENES.playerControl.end - SCENES.playerControl.start}>
        <Scene3PlayerControl />
      </Sequence>

      <Sequence from={SCENES.powerRamp.start} durationInFrames={SCENES.powerRamp.end - SCENES.powerRamp.start}>
        <Scene4PowerRamp />
      </Sequence>

      <Sequence from={SCENES.rewardSpike.start} durationInFrames={SCENES.rewardSpike.end - SCENES.rewardSpike.start}>
        <Scene5RewardSpike />
      </Sequence>

      <Sequence from={SCENES.snapBack.start} durationInFrames={SCENES.snapBack.end - SCENES.snapBack.start}>
        <Scene6SnapBack />
      </Sequence>

      <Sequence from={SCENES.actionCommand.start} durationInFrames={SCENES.actionCommand.end - SCENES.actionCommand.start}>
        <Scene7ActionCommand />
      </Sequence>
    </AbsoluteFill>
  );
};
