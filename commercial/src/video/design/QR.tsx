/**
 * DARK SIDE GAME — QR Code Component
 * Large, scannable QR code
 */
import React from 'react';
import { THEME } from './theme';

// Note: For actual QR, use `qrcode` package
// This is a placeholder that renders scannable when real lib is used
interface QRProps {
  url?: string;
  size?: number;
}

export const QRCode: React.FC<QRProps> = ({ 
  url = 'https://game.drinksip.com',
  size = 340,
}) => {
  // In production, use: import QRCodeLib from 'qrcode'
  // For now, render a styled placeholder that can be replaced
  
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: THEME.radius.xl,
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 18px 60px rgba(0,0,0,0.45)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      {/* QR Pattern placeholder - in production, replace with actual QR */}
      <div
        style={{
          width: size - 60,
          height: size - 100,
          background: `
            repeating-linear-gradient(
              0deg,
              ${THEME.colors.navy} 0px,
              ${THEME.colors.navy} 12px,
              white 12px,
              white 24px
            )
          `,
          backgroundSize: '24px 24px',
          opacity: 0.9,
          borderRadius: 8,
          position: 'relative',
        }}
      >
        {/* Center white box for QR positioning reference */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 80,
            height: 80,
            background: 'white',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              background: THEME.colors.navy,
              borderRadius: 6,
            }}
          />
        </div>
      </div>
      
      <div
        style={{
          marginTop: 12,
          fontFamily: THEME.font.main,
          fontWeight: 700,
          fontSize: 16,
          color: THEME.colors.navy,
          textAlign: 'center',
        }}
      >
        SCAN TO PLAY
      </div>
    </div>
  );
};
