/**
 * DARK SIDE DEFENSE — Remotion Root
 * 
 * Root composition for all video exports.
 * Primary: SplashVideo (10s cinematic trailer)
 */
import React from 'react';
import { Composition } from 'remotion';
import { SplashVideo } from './compositions/SplashVideo';

// Video specs
const VIDEO_CONFIG = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 300, // 10 seconds
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Main splash screen trailer - 10 seconds */}
      <Composition
        id="SplashVideo"
        component={SplashVideo}
        durationInFrames={VIDEO_CONFIG.durationInFrames}
        fps={VIDEO_CONFIG.fps}
        width={VIDEO_CONFIG.width}
        height={VIDEO_CONFIG.height}
      />
      
      {/* Future: Add more compositions here */}
      {/* <Composition id="GameplayTrailer" ... /> */}
      {/* <Composition id="WinAnnouncement" ... /> */}
    </>
  );
};
