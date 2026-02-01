/**
 * DARK SIDE GAME — Typography Components
 * Full-bleed titles that fill the screen
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { THEME, hexToRgba } from './theme';
import type { AccentMode } from './Frame';

interface FullBleedTitleProps {
  lines: string[];
  accentWord?: string;
  accentMode?: AccentMode;
  slam?: boolean;      // Scale punch animation
  sub?: string;        // Optional subtitle
  showBar?: boolean;   // Gradient underline bar
}

export const FullBleedTitle: React.FC<FullBleedTitleProps> = ({
  lines,
  accentWord,
  accentMode = 'green',
  slam = true,
  sub,
  showBar = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slam animation
  const s = slam
    ? spring({
        frame,
        fps,
        config: { damping: 14, stiffness: 240, mass: 0.7 },
      })
    : 1;

  // Micro shake on slam
  const shake = slam ? interpolate(s, [0.9, 1], [2.5, 0], { extrapolateRight: 'clamp' }) : 0;

  // Get accent color
  const accent = accentMode === 'cyan'
    ? THEME.colors.cyan
    : accentMode === 'gold'
      ? THEME.colors.gold
      : accentMode === 'neutral'
        ? THEME.colors.ink
        : THEME.colors.green;

  // Determine font size based on number of lines
  const getLineSize = (lineIndex: number, totalLines: number): number => {
    if (totalLines === 1) return THEME.type.mega;
    if (totalLines === 2) return THEME.type.giga;
    if (totalLines === 3) return lineIndex === 0 ? THEME.type.huge : THEME.type.giga;
    return THEME.type.huge;
  };

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          width: '100%',
          textAlign: 'center',
          transform: `scale(${0.92 + 0.12 * s}) translate(${(Math.sin(frame * 0.7) * shake) / 2}px, ${(Math.cos(frame * 0.65) * shake) / 2}px)`,
          transformOrigin: '50% 50%',
          padding: `0 ${THEME.safe.left}px`,
        }}
      >
        {lines.map((ln, i) => (
          <div
            key={i}
            style={{
              fontFamily: THEME.font.main,
              fontWeight: 900,
              letterSpacing: '-0.04em',
              lineHeight: 0.88,
              fontSize: getLineSize(i, lines.length),
              color: THEME.colors.ink,
              textTransform: 'uppercase',
              textShadow: THEME.shadow.text,
            }}
          >
            {accentWord ? (
              <AccentText text={ln} accentWord={accentWord} accent={accent} />
            ) : (
              ln
            )}
          </div>
        ))}

        {sub && (
          <div
            style={{
              marginTop: 28,
              fontFamily: THEME.font.main,
              fontWeight: 700,
              letterSpacing: '0.02em',
              fontSize: THEME.type.mid,
              lineHeight: 1.05,
              color: THEME.colors.inkDim,
              textTransform: 'uppercase',
            }}
          >
            {sub}
          </div>
        )}

        {showBar && (
          <div
            style={{
              marginTop: 34,
              marginLeft: 'auto',
              marginRight: 'auto',
              height: 10,
              width: '88%',
              maxWidth: 980,
              borderRadius: THEME.radius.pill,
              background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
              opacity: 0.9,
            }}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};

// AccentText: highlights a specific word with accent color
const AccentText: React.FC<{
  text: string;
  accentWord: string;
  accent: string;
}> = ({ text, accentWord, accent }) => {
  const parts = text.split(new RegExp(`(${escapeRegExp(accentWord)})`, 'i'));
  return (
    <>
      {parts.map((p, idx) => {
        const isAcc = p.toLowerCase() === accentWord.toLowerCase();
        return (
          <span
            key={idx}
            style={{
              color: isAcc ? accent : THEME.colors.ink,
              textShadow: isAcc ? `0 0 26px ${accent}` : undefined,
            }}
          >
            {p}
          </span>
        );
      })}
    </>
  );
};

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Single word slam (for TACKLE, DEFEND, DOMINATE)
export const WordSlam: React.FC<{
  word: string;
  accentMode?: AccentMode;
}> = ({ word, accentMode = 'green' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 280, mass: 0.6 },
  });

  const accent = accentMode === 'cyan'
    ? THEME.colors.cyan
    : accentMode === 'gold'
      ? THEME.colors.gold
      : THEME.colors.green;

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          fontFamily: THEME.font.main,
          fontWeight: 900,
          letterSpacing: '-0.04em',
          lineHeight: 0.9,
          fontSize: THEME.type.mega,
          color: accent,
          textTransform: 'uppercase',
          textShadow: `0 0 40px ${hexToRgba(accent, 0.5)}, ${THEME.shadow.text}`,
          transform: `scale(${0.85 + 0.2 * scale})`,
        }}
      >
        {word}
      </div>
    </AbsoluteFill>
  );
};

// Label pill (for UI overlays)
export const LabelPill: React.FC<{
  text: string;
  accent?: boolean;
}> = ({ text, accent }) => {
  return (
    <div
      style={{
        padding: '16px 22px',
        borderRadius: THEME.radius.pill,
        border: '1px solid rgba(255,255,255,0.14)',
        background: 'rgba(0,0,0,0.24)',
        backdropFilter: 'blur(10px)',
        color: accent ? THEME.colors.green : THEME.colors.ink,
        fontFamily: THEME.font.main,
        fontWeight: 900,
        letterSpacing: '0.10em',
        textTransform: 'uppercase',
        fontSize: THEME.type.micro,
      }}
    >
      {text}
    </div>
  );
};
