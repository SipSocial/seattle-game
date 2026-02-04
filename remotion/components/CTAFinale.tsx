/**
 * CTAFinale - Scene 4 (8-10 seconds)
 * 
 * Final call to action:
 * - "PLAY NOW" button animation
 * - Countdown to drawing
 * - App install teaser
 * - game.drinksip.com URL
 */
import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import { THEME } from '../compositions/SplashVideo';

export const CTAFinale: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        paddingLeft: THEME.safe.left,
        paddingRight: THEME.safe.right,
        paddingTop: THEME.safe.top,
        paddingBottom: THEME.safe.bottom,
      }}
    >
      {/* Header: Dark Side Game */}
      <Header frame={frame} fps={fps} />

      {/* Center: Play Now CTA */}
      <PlayNowCTA frame={frame} fps={fps} />

      {/* Bottom: URL and countdown */}
      <Footer frame={frame} fps={fps} />

      {/* Pulsing border effect */}
      <PulsingBorder frame={frame} />
    </AbsoluteFill>
  );
};

// Header component
interface HeaderProps {
  frame: number;
  fps: number;
}

const Header: React.FC<HeaderProps> = ({ frame, fps }) => {
  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 140 },
  });

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        opacity: headerSpring,
        transform: `translateY(${interpolate(headerSpring, [0, 1], [-20, 0])}px)`,
      }}
    >
      <div
        style={{
          fontFamily: THEME.font,
          fontWeight: 900,
          fontSize: 48,
          letterSpacing: '-0.02em',
          textTransform: 'uppercase',
          color: THEME.colors.ink,
          lineHeight: 1,
        }}
      >
        THE DARK<br />SIDE GAME
      </div>
      
      {/* Live indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 20px',
          borderRadius: 999,
          background: 'rgba(105,190,40,0.15)',
          border: '1px solid rgba(105,190,40,0.3)',
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: THEME.colors.green,
            boxShadow: `0 0 12px ${THEME.colors.green}`,
            animation: 'pulse 1s ease-in-out infinite',
          }}
        />
        <span
          style={{
            fontFamily: THEME.font,
            fontWeight: 800,
            fontSize: 20,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: THEME.colors.green,
          }}
        >
          LIVE
        </span>
      </div>
    </div>
  );
};

// Play Now CTA button
interface PlayNowCTAProps {
  frame: number;
  fps: number;
}

const PlayNowCTA: React.FC<PlayNowCTAProps> = ({ frame, fps }) => {
  const ctaSpring = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { damping: 12, stiffness: 200, mass: 0.7 },
  });

  // Pulse effect
  const pulse = interpolate(
    Math.sin(frame * 0.15),
    [-1, 1],
    [0.98, 1.02]
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Main CTA button */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          transform: `scale(${(0.9 + 0.1 * ctaSpring) * pulse})`,
          opacity: ctaSpring,
        }}
      >
        <div
          style={{
            padding: '36px 80px',
            borderRadius: 24,
            background: `linear-gradient(135deg, ${THEME.colors.green} 0%, #4a9c1a 100%)`,
            boxShadow: `
              0 0 60px rgba(105,190,40,0.4),
              0 20px 60px rgba(0,0,0,0.4),
              inset 0 1px 0 rgba(255,255,255,0.2)
            `,
          }}
        >
          <span
            style={{
              fontFamily: THEME.font,
              fontWeight: 900,
              fontSize: 72,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              color: 'white',
              textShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}
          >
            PLAY NOW
          </span>
        </div>

        {/* Free to play badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            opacity: 0.9,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: THEME.colors.cyan,
            }}
          />
          <span
            style={{
              fontFamily: THEME.font,
              fontWeight: 700,
              fontSize: 26,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: THEME.colors.inkDim,
            }}
          >
            FREE TO PLAY • IN BROWSER
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Footer with URL and countdown
interface FooterProps {
  frame: number;
  fps: number;
}

const Footer: React.FC<FooterProps> = ({ frame, fps }) => {
  const footerSpring = spring({
    frame: Math.max(0, frame - 15),
    fps,
    config: { damping: 16, stiffness: 120 },
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: THEME.safe.left,
        right: THEME.safe.right,
        bottom: THEME.safe.bottom,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
        opacity: footerSpring,
        transform: `translateY(${interpolate(footerSpring, [0, 1], [30, 0])}px)`,
      }}
    >
      {/* URL */}
      <div
        style={{
          fontFamily: THEME.font,
          fontWeight: 900,
          fontSize: 44,
          color: THEME.colors.green,
          textShadow: `0 0 30px ${THEME.colors.green}`,
        }}
      >
        game.drinksip.com
      </div>

      {/* Countdown */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <span
          style={{
            fontFamily: THEME.font,
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: THEME.colors.inkDim,
          }}
        >
          DRAWING CLOSES
        </span>
        <div
          style={{
            padding: '10px 18px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <span
            style={{
              fontFamily: THEME.font,
              fontWeight: 900,
              fontSize: 24,
              color: THEME.colors.gold,
            }}
          >
            FEB 9
          </span>
        </div>
      </div>

      {/* Tagline */}
      <div
        style={{
          marginTop: 8,
          fontFamily: THEME.font,
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'rgba(246,247,251,0.5)',
        }}
      >
        DARK SIDE DEFENSE • MOBILE FIRST
      </div>
    </div>
  );
};

// Pulsing border effect
interface PulsingBorderProps {
  frame: number;
}

const PulsingBorder: React.FC<PulsingBorderProps> = ({ frame }) => {
  const opacity = interpolate(
    Math.sin(frame * 0.1),
    [-1, 1],
    [0.1, 0.25]
  );

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* Corner accents */}
      {[
        { top: 40, left: 40 },
        { top: 40, right: 40, transform: 'scaleX(-1)' },
        { bottom: 40, left: 40, transform: 'scaleY(-1)' },
        { bottom: 40, right: 40, transform: 'scale(-1,-1)' },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            ...pos,
            opacity,
          }}
        >
          <div
            style={{
              width: 60,
              height: 4,
              background: THEME.colors.green,
              borderRadius: 2,
            }}
          />
          <div
            style={{
              width: 4,
              height: 60,
              background: THEME.colors.green,
              borderRadius: 2,
            }}
          />
        </div>
      ))}
    </AbsoluteFill>
  );
};
