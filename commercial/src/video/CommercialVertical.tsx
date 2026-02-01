/**
 * DARK SIDE GAME — Main Composition
 * 30 seconds @ 30fps = 900 frames
 * 9:16 vertical (1080x1920)
 */
import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import {
  SCENES,
  Frame,
  UICorners,
  FullBleedTitle,
  WordSlam,
  PlayerCarousel,
  TicketWin,
  CTA,
  AudioTimeline,
} from './design';

interface CommercialVerticalProps {
  urlText?: string;
  qrUrl?: string;
  gameTitle?: string;
}

export const CommercialVertical: React.FC<CommercialVerticalProps> = ({
  urlText = 'game.drinksip.com',
  qrUrl = 'https://game.drinksip.com',
  gameTitle = 'DARK SIDE GAME',
}) => {
  return (
    <AbsoluteFill>
      {/* ================================================================
          AUDIO TIMELINE - Global, synced to all scenes
          ================================================================ */}
      <AudioTimeline />

      {/* ================================================================
          SCENE A (0:00–0:02) frames 0–59
          "NO FOOTBALL THIS WEEK"
          ================================================================ */}
      <Sequence from={SCENES.noFootball.start} durationInFrames={SCENES.noFootball.end - SCENES.noFootball.start}>
        <Frame accentMode="cyan" intensity={0.9}>
          <FullBleedTitle
            lines={['NO FOOTBALL', 'THIS WEEK']}
            slam={false}
            showBar={false}
          />
        </Frame>
      </Sequence>

      {/* ================================================================
          SCENE B (0:02–0:03) frames 60–89
          "JUST KIDDING."
          ================================================================ */}
      <Sequence from={SCENES.justKidding.start} durationInFrames={SCENES.justKidding.end - SCENES.justKidding.start}>
        <Frame accentMode="green" intensity={1.05}>
          <FullBleedTitle
            lines={['JUST', 'KIDDING.']}
            accentWord="KIDDING."
            slam={true}
          />
        </Frame>
      </Sequence>

      {/* ================================================================
          SCENE C (0:03–0:06) frames 90–179
          "THE DARK SIDE GAME"
          ================================================================ */}
      <Sequence from={SCENES.gameTitle.start} durationInFrames={SCENES.gameTitle.end - SCENES.gameTitle.start}>
        <Frame accentMode="green" intensity={1.15}>
          <FullBleedTitle
            lines={['THE', 'DARK SIDE', 'GAME']}
            accentWord="DARK"
            slam={true}
            sub="DEFENSE IS THE WEAPON"
          />
        </Frame>
      </Sequence>

      {/* ================================================================
          SCENE D (0:06–0:14) frames 180–419
          PLAYER CAROUSEL - One player at a time, big
          ================================================================ */}
      <Sequence from={SCENES.carousel.start} durationInFrames={SCENES.carousel.end - SCENES.carousel.start}>
        <Frame accentMode="cyan" intensity={1.0}>
          <UICorners />
          <PlayerCarousel />
        </Frame>
      </Sequence>

      {/* ================================================================
          SCENE E (0:14–0:18) frames 420–539
          VERB SLAMS: TACKLE / DEFEND / DOMINATE
          ================================================================ */}
      
      {/* TACKLE (frames 420–459) */}
      <Sequence from={SCENES.tackle.start} durationInFrames={SCENES.tackle.end - SCENES.tackle.start}>
        <Frame accentMode="green" intensity={1.15}>
          <WordSlam word="TACKLE" accentMode="green" />
        </Frame>
      </Sequence>

      {/* DEFEND (frames 460–499) */}
      <Sequence from={SCENES.defend.start} durationInFrames={SCENES.defend.end - SCENES.defend.start}>
        <Frame accentMode="cyan" intensity={1.15}>
          <WordSlam word="DEFEND" accentMode="cyan" />
        </Frame>
      </Sequence>

      {/* DOMINATE (frames 500–539) */}
      <Sequence from={SCENES.dominate.start} durationInFrames={SCENES.dominate.end - SCENES.dominate.start}>
        <Frame accentMode="green" intensity={1.15}>
          <WordSlam word="DOMINATE" accentMode="green" />
        </Frame>
      </Sequence>

      {/* ================================================================
          SCENE F (0:18–0:23) frames 540–689
          WIN 2 SUPER BOWL TICKETS - MASSIVE
          ================================================================ */}
      <Sequence from={SCENES.winTickets.start} durationInFrames={SCENES.winTickets.end - SCENES.winTickets.start}>
        <Frame accentMode="gold" intensity={1.25}>
          <TicketWin />
        </Frame>
      </Sequence>

      {/* ================================================================
          SCENE G (0:23–0:30) frames 690–899
          CTA - PLAY NOW + URL + QR
          ================================================================ */}
      <Sequence from={SCENES.cta.start} durationInFrames={SCENES.cta.end - SCENES.cta.start}>
        <Frame accentMode="green" intensity={1.05}>
          <CTA urlText={urlText} qrUrl={qrUrl} gameTitle={gameTitle} />
        </Frame>
      </Sequence>
    </AbsoluteFill>
  );
};
