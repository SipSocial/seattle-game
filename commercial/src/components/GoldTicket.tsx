import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { COLORS, FONTS, SUPER_BOWL } from '../assets';

interface GoldTicketProps {
  delay?: number;
}

export const GoldTicket: React.FC<GoldTicketProps> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - delay);

  // Entrance animation
  const scale = spring({
    frame: localFrame,
    fps,
    config: { damping: 12, stiffness: 100, mass: 0.7 },
    from: 0,
    to: 1,
  });

  const rotate = spring({
    frame: localFrame,
    fps,
    config: { damping: 15, stiffness: 80 },
    from: -15,
    to: 0,
  });

  // Shimmer position
  const shimmer = (localFrame * 8) % 600;

  // Glow pulse
  const glow = 15 + Math.sin(localFrame * 0.15) * 8;

  if (frame < delay) return null;

  return (
    <div
      style={{
        transform: `scale(${scale}) rotate(${rotate}deg)`,
        perspective: 1000,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 550,
          height: 220,
          background: `linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 40%, #1a1a1a 100%)`,
          borderRadius: 12,
          border: `4px solid ${COLORS.gold}`,
          boxShadow: `0 0 ${glow}px ${COLORS.gold}, 0 25px 80px rgba(0,0,0,0.7)`,
          overflow: 'hidden',
        }}
      >
        {/* Gold shimmer effect */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: shimmer - 150,
            width: 150,
            height: '100%',
            background: `linear-gradient(90deg, transparent, ${COLORS.gold}40, transparent)`,
            transform: 'skewX(-20deg)',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '25px 35px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {/* Super Bowl branding */}
          <div
            style={{
              ...FONTS.body,
              fontSize: 24,
              color: COLORS.gold,
              letterSpacing: '0.15em',
            }}
          >
            {SUPER_BOWL.name}
          </div>

          {/* 2 TICKETS */}
          <div
            style={{
              ...FONTS.headline,
              fontSize: 56,
              color: COLORS.white,
              marginTop: 8,
            }}
          >
            2 TICKETS
          </div>

          {/* Date and location */}
          <div
            style={{
              display: 'flex',
              gap: 30,
              marginTop: 12,
            }}
          >
            <div
              style={{
                ...FONTS.body,
                fontSize: 20,
                color: COLORS.green,
              }}
            >
              {SUPER_BOWL.date}
            </div>
            <div
              style={{
                ...FONTS.body,
                fontSize: 20,
                color: COLORS.grey,
              }}
            >
              {SUPER_BOWL.location}
            </div>
          </div>
        </div>

        {/* Perforated line */}
        <div
          style={{
            position: 'absolute',
            right: 80,
            top: 0,
            bottom: 0,
            width: 3,
            backgroundImage: `repeating-linear-gradient(to bottom, ${COLORS.gold} 0px, ${COLORS.gold} 10px, transparent 10px, transparent 20px)`,
          }}
        />

        {/* Stub */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 75,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              ...FONTS.body,
              fontSize: 12,
              color: COLORS.gold,
              transform: 'rotate(-90deg)',
              whiteSpace: 'nowrap',
              letterSpacing: '0.2em',
            }}
          >
            ADMIT TWO
          </div>
        </div>
      </div>
    </div>
  );
};
