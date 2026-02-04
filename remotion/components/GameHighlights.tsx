/**
 * GameHighlights - Scene 1 (0-2 seconds)
 * 
 * High-energy intro with quick cuts:
 * - Fast text slams: "DEFEND THE DARK SIDE"
 * - Motion blur transitions
 * - Professional sports broadcast feel
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

export const GameHighlights: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene lasts 60 frames (2 seconds)
  // Split into 3 quick cuts
  const cut1End = 20;  // "DEFEND"
  const cut2End = 40;  // "THE DARK"
  const cut3End = 60;  // "SIDE"

  return (
    <AbsoluteFill>
      {/* Cut 1: DEFEND (0-20 frames) */}
      {frame < cut1End && (
        <TextSlam 
          text="DEFEND" 
          frame={frame} 
          fps={fps}
          accentColor={THEME.colors.green}
        />
      )}

      {/* Cut 2: THE DARK (20-40 frames) */}
      {frame >= cut1End && frame < cut2End && (
        <TextSlam 
          text="THE DARK" 
          frame={frame - cut1End} 
          fps={fps}
          accentColor={THEME.colors.cyan}
        />
      )}

      {/* Cut 3: SIDE (40-60 frames) */}
      {frame >= cut2End && (
        <TextSlam 
          text="SIDE" 
          frame={frame - cut2End} 
          fps={fps}
          accentColor={THEME.colors.green}
          isFinal
        />
      )}

      {/* Motion blur overlay for transitions */}
      <TransitionFlash frame={frame} cuts={[cut1End, cut2End]} />
    </AbsoluteFill>
  );
};

// Text slam component with spring animation
interface TextSlamProps {
  text: string;
  frame: number;
  fps: number;
  accentColor: string;
  isFinal?: boolean;
}

const TextSlam: React.FC<TextSlamProps> = ({ 
  text, 
  frame, 
  fps, 
  accentColor,
  isFinal = false,
}) => {
  const slamIn = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 300, mass: 0.6 },
  });

  const scale = interpolate(slamIn, [0, 1], [2.5, 1]);
  const opacity = interpolate(slamIn, [0, 0.3, 1], [0, 1, 1]);
  
  // Screen shake effect
  const shake = interpolate(slamIn, [0.8, 1], [6, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const shakeX = Math.sin(frame * 2.1) * shake;
  const shakeY = Math.cos(frame * 1.9) * shake;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      <div
        style={{
          fontFamily: THEME.font,
          fontWeight: 900,
          fontSize: isFinal ? THEME.type.mega : THEME.type.huge,
          letterSpacing: '-0.04em',
          textTransform: 'uppercase',
          color: THEME.colors.ink,
          textShadow: `
            0 0 60px ${accentColor},
            0 4px 30px rgba(0,0,0,0.8)
          `,
          transform: `scale(${scale})`,
          opacity,
        }}
      >
        {text}
      </div>

      {/* Accent underline */}
      <div
        style={{
          position: 'absolute',
          bottom: '38%',
          width: interpolate(slamIn, [0, 1], [0, 80]) + '%',
          height: 8,
          borderRadius: 999,
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          opacity: slamIn * 0.8,
        }}
      />
    </AbsoluteFill>
  );
};

// Flash transition between cuts
interface TransitionFlashProps {
  frame: number;
  cuts: number[];
}

const TransitionFlash: React.FC<TransitionFlashProps> = ({ frame, cuts }) => {
  // Calculate flash opacity for each cut point
  let flashOpacity = 0;
  
  for (const cutFrame of cuts) {
    const distFromCut = Math.abs(frame - cutFrame);
    if (distFromCut < 3) {
      flashOpacity = Math.max(flashOpacity, interpolate(distFromCut, [0, 3], [0.7, 0]));
    }
  }

  if (flashOpacity <= 0) return null;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'white',
        opacity: flashOpacity,
        mixBlendMode: 'overlay',
      }}
    />
  );
};
