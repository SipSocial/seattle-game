import React from "react";
import { Composition } from "remotion";
import { Commercial60 } from "./Video";
import { Commercial30 } from "./Video30";
import { CommercialVertical as CommercialVerticalOld } from "./VideoVertical";
import { CommercialVerticalV2 } from "./VideoVerticalV2";
import { CommercialVerticalV3 } from "./VideoVerticalV3";
import { CommercialVerticalV4 } from "./VideoVerticalV4";
import { CommercialVerticalV5 } from "./VideoVerticalV5";
import { CommercialVerticalV6 } from "./VideoVerticalV6";
import { CommercialVerticalV7 } from "./VideoVerticalV7";
import { CommercialVerticalV8 } from "./VideoVerticalV8";
import { CommercialVerticalV8Audio } from "./VideoVerticalV8Audio";
import { CommercialVertical } from "./video/CommercialVertical";

// Video settings
const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* DARK SIDE GAME - MASTER VERSION */}
      <Composition
        id="DarkSideGameVertical"
        component={CommercialVertical}
        durationInFrames={30 * FPS}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{
          urlText: "game.drinksip.com",
          qrUrl: "https://game.drinksip.com",
          gameTitle: "DARK SIDE GAME",
        }}
      />

      {/* V8 Audio - XBOX × APPLE with music + SFX */}
      <Composition
        id="VerticalV8Audio"
        component={CommercialVerticalV8Audio}
        durationInFrames={30 * FPS}
        fps={FPS}
        width={1080}
        height={1920}
      />

      {/* V8 - XBOX × APPLE: Full-viewport, giant text, clean UI (no audio) */}
      <Composition
        id="VerticalV8"
        component={CommercialVerticalV8}
        durationInFrames={30 * FPS}
        fps={FPS}
        width={1080}
        height={1920}
      />

      {/* V7 - Story + Carousel combined */}
      <Composition
        id="VerticalV7"
        component={CommercialVerticalV7}
        durationInFrames={30 * FPS}
        fps={FPS}
        width={1080}
        height={1920}
      />

      {/* V6 - Carousel version */}
      <Composition
        id="VerticalV6"
        component={CommercialVerticalV6}
        durationInFrames={30 * FPS}
        fps={FPS}
        width={1080}
        height={1920}
      />

      {/* V5 - Story-driven */}
      <Composition
        id="VerticalV5"
        component={CommercialVerticalV5}
        durationInFrames={30 * FPS}
        fps={FPS}
        width={1080}
        height={1920}
      />

      {/* V4 HIGH-ENERGY */}
      <Composition
        id="VerticalV4"
        component={CommercialVerticalV4}
        durationInFrames={27 * FPS}
        fps={FPS}
        width={1080}
        height={1920}
      />

      {/* V3 AGENCY-POLISHED */}
      <Composition
        id="VerticalV3"
        component={CommercialVerticalV3}
        durationInFrames={30 * FPS}
        fps={FPS}
        width={1080}
        height={1920}
      />

      {/* V2 - Previous iteration */}
      <Composition
        id="VerticalV2"
        component={CommercialVerticalV2}
        durationInFrames={30 * FPS}
        fps={FPS}
        width={1080}
        height={1920}
      />

      {/* 60-second commercial - 16:9 */}
      <Composition
        id="Commercial"
        component={Commercial60}
        durationInFrames={60 * FPS}
        fps={FPS}
        width={1920}
        height={1080}
      />

      {/* 30-second commercial - 16:9 */}
      <Composition
        id="Commercial30"
        component={Commercial30}
        durationInFrames={30 * FPS}
        fps={FPS}
        width={1920}
        height={1080}
      />

      {/* 30-second VERTICAL - 9:16 (Instagram Stories, TikTok, Reels) */}
      <Composition
        id="CommercialVertical"
        component={CommercialVertical}
        durationInFrames={30 * FPS}
        fps={FPS}
        width={1080}
        height={1920}
      />

      {/* 30-second square for feed */}
      <Composition
        id="Commercial30Square"
        component={Commercial30}
        durationInFrames={30 * FPS}
        fps={FPS}
        width={1080}
        height={1080}
      />
    </>
  );
};
