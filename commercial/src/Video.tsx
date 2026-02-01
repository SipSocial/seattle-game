/**
 * 60-Second Commercial - "The Dark Side Rises"
 * Concept A: Epic, cinematic game reveal
 */
import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import {
  Scene01_DateReveal,
  Scene02_SeattleFlash,
  Scene03_NoFootball,
  Scene04_PlayerMontage,
  Scene05_TitleReveal,
  Scene06_Gameplay,
  Scene07_Campaign,
  Scene08_Roster,
  Scene09_Giveaway,
  Scene10_PresentedBy,
  Scene11_CTA,
  Scene12_LogoLock,
} from './scenes';
import { SCENES_60, FPS } from './assets';

export const Commercial60: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Scene 1: Date Reveal (0-3s) */}
      <Sequence from={SCENES_60.dateReveal.start} durationInFrames={SCENES_60.dateReveal.end - SCENES_60.dateReveal.start}>
        <Scene01_DateReveal />
      </Sequence>

      {/* Scene 2: Seattle Flash (3-6s) */}
      <Sequence from={SCENES_60.seattleFlash.start} durationInFrames={SCENES_60.seattleFlash.end - SCENES_60.seattleFlash.start}>
        <Scene02_SeattleFlash />
      </Sequence>

      {/* Scene 3: No Football Hook (6-10s) */}
      <Sequence from={SCENES_60.noFootball.start} durationInFrames={SCENES_60.noFootball.end - SCENES_60.noFootball.start}>
        <Scene03_NoFootball />
      </Sequence>

      {/* Scene 4: Player Montage (10-18s) */}
      <Sequence from={SCENES_60.playerMontage.start} durationInFrames={SCENES_60.playerMontage.end - SCENES_60.playerMontage.start}>
        <Scene04_PlayerMontage />
      </Sequence>

      {/* Scene 5: Title Reveal (18-22s) */}
      <Sequence from={SCENES_60.titleReveal.start} durationInFrames={SCENES_60.titleReveal.end - SCENES_60.titleReveal.start}>
        <Scene05_TitleReveal />
      </Sequence>

      {/* Scene 6: Gameplay Montage (22-30s) */}
      <Sequence from={SCENES_60.gameplay.start} durationInFrames={SCENES_60.gameplay.end - SCENES_60.gameplay.start}>
        <Scene06_Gameplay />
      </Sequence>

      {/* Scene 7: Campaign Journey (30-34s) */}
      <Sequence from={SCENES_60.campaign.start} durationInFrames={SCENES_60.campaign.end - SCENES_60.campaign.start}>
        <Scene07_Campaign />
      </Sequence>

      {/* Scene 8: Full Roster (34-38s) */}
      <Sequence from={SCENES_60.roster.start} durationInFrames={SCENES_60.roster.end - SCENES_60.roster.start}>
        <Scene08_Roster />
      </Sequence>

      {/* Scene 9: Giveaway (38-46s) */}
      <Sequence from={SCENES_60.giveaway.start} durationInFrames={SCENES_60.giveaway.end - SCENES_60.giveaway.start}>
        <Scene09_Giveaway />
      </Sequence>

      {/* Scene 10: Presented By (46-50s) */}
      <Sequence from={SCENES_60.presentedBy.start} durationInFrames={SCENES_60.presentedBy.end - SCENES_60.presentedBy.start}>
        <Scene10_PresentedBy />
      </Sequence>

      {/* Scene 11: CTA (50-56s) */}
      <Sequence from={SCENES_60.cta.start} durationInFrames={SCENES_60.cta.end - SCENES_60.cta.start}>
        <Scene11_CTA />
      </Sequence>

      {/* Scene 12: Logo Lock (56-60s) */}
      <Sequence from={SCENES_60.logoLock.start} durationInFrames={SCENES_60.logoLock.end - SCENES_60.logoLock.start}>
        <Scene12_LogoLock />
      </Sequence>
    </AbsoluteFill>
  );
};
