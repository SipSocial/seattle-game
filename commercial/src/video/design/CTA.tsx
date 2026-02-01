/**
 * DARK SIDE GAME — CTA Screen
 * Big title, big URL, big QR. Clean and confident.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile } from 'remotion';
import { THEME } from './theme';
import { QRCode } from './QR';

interface CTAProps {
  urlText?: string;
  qrUrl?: string;
  gameTitle?: string;
}

export const CTA: React.FC<CTAProps> = ({
  urlText = 'game.drinksip.com',
  qrUrl = 'https://game.drinksip.com',
  gameTitle = 'DARK SIDE GAME',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Enter animation
  const enter = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 180, mass: 0.8 },
  });

  // QR fade in
  const qrOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <AbsoluteFill
        style={{
          padding: `${THEME.safe.top}px ${THEME.safe.right}px ${THEME.safe.bottom}px ${THEME.safe.left}px`,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Top: Title + Logo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div
            style={{
              fontFamily: THEME.font.main,
              fontWeight: 900,
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              fontSize: 60,
              lineHeight: 0.95,
              color: THEME.colors.ink,
            }}
          >
            {gameTitle}
          </div>
          {/* Optional DrinkSip logo */}
          {/* <Img src={staticFile('assets/logo-drinksip.png')} style={{ height: 56, width: 'auto' }} /> */}
        </div>

        {/* Middle: Main CTA content */}
        <div
          style={{
            display: 'flex',
            gap: 50,
            alignItems: 'center',
            justifyContent: 'space-between',
            transform: `scale(${0.95 + 0.05 * enter})`,
          }}
        >
          {/* Left side: Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* PLAY NOW */}
            <div
              style={{
                fontFamily: THEME.font.main,
                fontWeight: 900,
                letterSpacing: '-0.04em',
                textTransform: 'uppercase',
                fontSize: 100,
                lineHeight: 0.92,
                color: THEME.colors.ink,
              }}
            >
              PLAY NOW
            </div>

            {/* URL - Very large */}
            <div
              style={{
                marginTop: 14,
                fontFamily: THEME.font.main,
                fontWeight: 900,
                letterSpacing: '0.02em',
                fontSize: 56,
                color: THEME.colors.green,
                textShadow: `0 0 28px rgba(105,190,40,0.25)`,
              }}
            >
              {urlText}
            </div>

            {/* Scan to play pill */}
            <div
              style={{
                marginTop: 26,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 14,
                padding: '18px 24px',
                borderRadius: THEME.radius.pill,
                background: 'rgba(105,190,40,0.14)',
                border: '1px solid rgba(105,190,40,0.28)',
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: THEME.radius.pill,
                  background: THEME.colors.green,
                  boxShadow: '0 0 18px rgba(105,190,40,0.65)',
                }}
              />
              <div
                style={{
                  fontFamily: THEME.font.main,
                  fontWeight: 900,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  fontSize: 26,
                  color: THEME.colors.ink,
                }}
              >
                Scan to play
              </div>
            </div>
          </div>

          {/* Right side: QR Code - Large */}
          <div style={{ opacity: qrOpacity }}>
            <QRCode url={qrUrl} size={340} />
          </div>
        </div>

        {/* Bottom: Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.9 }}>
          <div
            style={{
              fontFamily: THEME.font.main,
              fontWeight: 900,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontSize: 26,
              color: THEME.colors.inkDim,
            }}
          >
            DARK SIDE DEFENSE
          </div>
          <div
            style={{
              fontFamily: THEME.font.main,
              fontWeight: 900,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontSize: 26,
              color: THEME.colors.inkDim,
            }}
          >
            MOBILE • IN BROWSER
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
