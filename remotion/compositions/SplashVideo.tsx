/**
 * DARK SIDE DEFENSE — Splash Video Composition
 * 
 * 10-second cinematic trailer (300 frames @ 30fps)
 * Resolution: 1080x1920 (9:16 vertical mobile)
 * 
 * Scene Breakdown:
 * 1. 0-2s (0-60): Game Highlights - Quick cuts, "DEFEND THE DARK SIDE"
 * 2. 2-5s (60-150): Player Showcase - DeMarcus Lawrence & Nick Emmanwori
 * 3. 5-8s (150-240): Brand Hype - DrinkSip & Prize Reveal
 * 4. 8-10s (240-300): CTA - "PLAY NOW" with countdown
 */
import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { GameHighlights } from '../components/GameHighlights';
import { PlayerShowcase } from '../components/PlayerShowcase';
import { BrandHype } from '../components/BrandHype';
import { CTAFinale } from '../components/CTAFinale';
import { BackgroundFX } from '../components/BackgroundFX';

// Theme constants
export const THEME = {
  colors: {
    navy: '#002244',      // Seahawks primary
    green: '#69BE28',     // Seahawks action green
    bg0: '#05060A',       // Deepest black
    bg1: '#0A0D14',       // Dark navy
    ink: '#F6F7FB',       // Primary text
    inkDim: 'rgba(246,247,251,0.78)',
    gold: '#FFD700',
    goldDark: '#B8860B',
    cyan: '#00E5FF',
  },
  type: {
    mega: 160,
    huge: 100,
    big: 70,
    mid: 44,
    small: 32,
  },
  safe: {
    top: 110,
    bottom: 220,
    left: 70,
    right: 70,
  },
  font: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

// Scene timing (frames at 30fps)
export const SCENES = {
  highlights: { start: 0, end: 60 },       // 0-2s
  showcase: { start: 60, end: 150 },       // 2-5s
  brandHype: { start: 150, end: 240 },     // 5-8s
  cta: { start: 240, end: 300 },           // 8-10s
};

export const SplashVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.bg0 }}>
      {/* Scene 1: Game Highlights (0-2s) */}
      <Sequence 
        from={SCENES.highlights.start} 
        durationInFrames={SCENES.highlights.end - SCENES.highlights.start}
      >
        <BackgroundFX accentColor={THEME.colors.green} intensity={1.0}>
          <GameHighlights />
        </BackgroundFX>
      </Sequence>

      {/* Scene 2: Player Showcase (2-5s) */}
      <Sequence 
        from={SCENES.showcase.start} 
        durationInFrames={SCENES.showcase.end - SCENES.showcase.start}
      >
        <BackgroundFX accentColor={THEME.colors.cyan} intensity={1.1}>
          <PlayerShowcase />
        </BackgroundFX>
      </Sequence>

      {/* Scene 3: Brand Hype (5-8s) */}
      <Sequence 
        from={SCENES.brandHype.start} 
        durationInFrames={SCENES.brandHype.end - SCENES.brandHype.start}
      >
        <BackgroundFX accentColor={THEME.colors.gold} intensity={1.2}>
          <BrandHype />
        </BackgroundFX>
      </Sequence>

      {/* Scene 4: CTA Finale (8-10s) */}
      <Sequence 
        from={SCENES.cta.start} 
        durationInFrames={SCENES.cta.end - SCENES.cta.start}
      >
        <BackgroundFX accentColor={THEME.colors.green} intensity={1.0}>
          <CTAFinale />
        </BackgroundFX>
      </Sequence>
    </AbsoluteFill>
  );
};
