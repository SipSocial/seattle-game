/**
 * DARK SIDE GAME — Audio Timeline
 * Music bed + SFX + VO synced to exact frames
 * 
 * Audio files in public/assets/audio/:
 * - music-bed.mp3 (30s)
 * - vo-01.mp3 through vo-12.mp3 (individual VO lines)
 * - sfx-*.mp3 (sound effects)
 */
import React from 'react';
import { Audio, Sequence, staticFile, useCurrentFrame, interpolate } from 'remotion';
import { AUDIO_CUES } from './theme';

// Volume levels
const VOLUME = {
  music: 0.35,      // Lower for VO clarity
  musicDip: 0.10,   // Dip at WIN moment
  vo: 1.0,
  sfx: 0.80,
  sfxLight: 0.50,
};

// VO line frame cues (matches generate-audio-master.ts)
const VO_CUES = [
  { file: 'vo-01.mp3', frame: 72 },   // "No football this week?"
  { file: 'vo-02.mp3', frame: 102 },  // "Just kidding."
  { file: 'vo-03.mp3', frame: 120 },  // "The Dark Side Game."
  { file: 'vo-04.mp3', frame: 210 },  // "Choose your defender."
  { file: 'vo-05.mp3', frame: 312 },  // "Command the Dark Side Defense."
  { file: 'vo-06.mp3', frame: 428 },  // "Tackle."
  { file: 'vo-07.mp3', frame: 468 },  // "Defend."
  { file: 'vo-08.mp3', frame: 508 },  // "Dominate."
  { file: 'vo-09.mp3', frame: 556 },  // "Win two Super Bowl tickets."
  { file: 'vo-10.mp3', frame: 600 },  // "To watch it live."
  { file: 'vo-11.mp3', frame: 708 },  // "Play now."
  { file: 'vo-12.mp3', frame: 732 },  // "Game dot DrinkSip dot com."
];

/**
 * MusicBed with volume dip at frame 538-560
 */
const MusicBed: React.FC = () => {
  const frame = useCurrentFrame();
  
  // Volume dip around WIN moment (frames 538-560)
  const volume = interpolate(
    frame,
    [0, AUDIO_CUES.musicDipStart - 2, AUDIO_CUES.musicDipStart, AUDIO_CUES.musicDipEnd, AUDIO_CUES.musicDipEnd + 10, 900],
    [VOLUME.music, VOLUME.music, VOLUME.musicDip, VOLUME.musicDip, VOLUME.music, VOLUME.music],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <Audio
      src={staticFile('assets/audio/music-bed.mp3')}
      volume={volume}
      startFrom={0}
    />
  );
};

/**
 * VoiceOver - 12 individual lines at exact frame positions
 */
const VoiceOver: React.FC = () => {
  return (
    <>
      {VO_CUES.map((cue) => (
        <Sequence key={cue.file} from={cue.frame}>
          <Audio src={staticFile(`assets/audio/${cue.file}`)} volume={VOLUME.vo} />
        </Sequence>
      ))}
    </>
  );
};

/**
 * SFX Layer - all sound effects at exact frame positions
 */
const SFXLayer: React.FC = () => {
  return (
    <>
      {/* Scene B: JUST KIDDING hit (frame 60) */}
      <Sequence from={AUDIO_CUES.hit1}>
        <Audio src={staticFile('assets/audio/sfx-hit-1.mp3')} volume={VOLUME.sfx} />
      </Sequence>

      {/* Scene C: Title slam (frame 90) */}
      <Sequence from={AUDIO_CUES.slam}>
        <Audio src={staticFile('assets/audio/sfx-slam.mp3')} volume={VOLUME.sfx} />
      </Sequence>

      {/* Scene D: Carousel snaps (frames 180, 220, 260, 300, 340, 380) */}
      {AUDIO_CUES.carouselSnaps.map((frame) => (
        <Sequence key={`snap-${frame}`} from={frame}>
          <Audio src={staticFile('assets/audio/sfx-ui-snap.mp3')} volume={VOLUME.sfxLight} />
        </Sequence>
      ))}

      {/* Scene E: Verb hits (frames 420, 460, 500) */}
      {AUDIO_CUES.verbHits.map((frame) => (
        <Sequence key={`verb-${frame}`} from={frame}>
          <Audio src={staticFile('assets/audio/sfx-verb-hit.mp3')} volume={VOLUME.sfx} />
        </Sequence>
      ))}

      {/* Scene F: Jackpot (frame 540) */}
      <Sequence from={AUDIO_CUES.jackpot}>
        <Audio src={staticFile('assets/audio/sfx-jackpot.mp3')} volume={VOLUME.sfx} />
      </Sequence>

      {/* Scene F: Shimmer (frame 548) */}
      <Sequence from={AUDIO_CUES.shimmer}>
        <Audio src={staticFile('assets/audio/sfx-shimmer.mp3')} volume={VOLUME.sfxLight} />
      </Sequence>

      {/* Scene G: CTA confirm (frame 690) */}
      <Sequence from={AUDIO_CUES.ctaConfirm}>
        <Audio src={staticFile('assets/audio/sfx-ui-snap.mp3')} volume={VOLUME.sfxLight} />
      </Sequence>

      {/* Scene G: QR bleep (frame 720) */}
      <Sequence from={AUDIO_CUES.qrBleep}>
        <Audio src={staticFile('assets/audio/sfx-qr-bleep.mp3')} volume={VOLUME.sfxLight} />
      </Sequence>

      {/* Scene G: Final hit (frame 894) */}
      <Sequence from={AUDIO_CUES.finalHit}>
        <Audio src={staticFile('assets/audio/sfx-final-hit.mp3')} volume={VOLUME.sfx} />
      </Sequence>
    </>
  );
};

/**
 * Main AudioTimeline component
 * Include once at root level of composition
 */
export const AudioTimeline: React.FC = () => {
  return (
    <>
      <MusicBed />
      <VoiceOver />
      <SFXLayer />
    </>
  );
};
