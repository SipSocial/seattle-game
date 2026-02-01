/**
 * DARK SIDE GAME — Design System Theme
 * Xbox × Apple keynote × Madden UI
 */

export const THEME = {
  // Canvas dimensions
  width: 1080,
  height: 1920,
  fps: 30,
  duration: 900, // 30 seconds
  
  // Safe zones (minimal to allow edge-to-edge)
  safe: {
    top: 110,
    bottom: 220,
    left: 70,
    right: 70,
  },
  
  // Color palette
  colors: {
    // Backgrounds
    bg0: '#05060A',      // Deepest black
    bg1: '#0A0D14',      // Dark navy
    bg2: '#0F1318',      // Slightly lighter
    
    // Primary ink
    ink: '#F6F7FB',
    inkDim: 'rgba(246,247,251,0.78)',
    inkGhost: 'rgba(246,247,251,0.16)',
    
    // Accents
    green: '#69BE28',
    cyan: '#00E5FF',
    gold: '#FFD700',
    goldDark: '#B8860B',
    
    // Brand
    navy: '#002244',
  },
  
  // Typography scale (tuned for 9:16)
  type: {
    mega: 180,    // WIN, biggest moments
    giga: 140,    // Main titles
    huge: 110,    // Scene titles
    big: 80,      // Secondary headlines
    mid: 50,      // Labels
    small: 34,    // Chips/pills
    micro: 26,    // Fine print
  },
  
  // Font stack
  font: {
    main: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  
  // Border radii
  radius: {
    xl: 44,
    lg: 34,
    md: 26,
    sm: 16,
    pill: 999,
  },
  
  // Shadows
  shadow: {
    glow: (color: string, intensity = 0.3) => `0 0 60px rgba(${hexToRgbValues(color)}, ${intensity})`,
    drop: '0 40px 100px rgba(0,0,0,0.5)',
    text: '0 4px 30px rgba(0,0,0,0.9)',
  },
} as const;

// Scene timing (frames at 30fps)
export const SCENES = {
  noFootball: { start: 0, end: 60 },           // 0:00–0:02
  justKidding: { start: 60, end: 90 },         // 0:02–0:03
  gameTitle: { start: 90, end: 180 },          // 0:03–0:06
  carousel: { start: 180, end: 420 },          // 0:06–0:14
  tackle: { start: 420, end: 460 },            // 0:14–0:15.33
  defend: { start: 460, end: 500 },            // 0:15.33–0:16.67
  dominate: { start: 500, end: 540 },          // 0:16.67–0:18
  winTickets: { start: 540, end: 690 },        // 0:18–0:23
  cta: { start: 690, end: 900 },               // 0:23–0:30
} as const;

// Player carousel timing
export const CAROUSEL = {
  startFrame: 180,
  switchFrames: [180, 220, 260, 300, 340, 380],
  segmentLength: 40,
  transitionIn: 8,
  transitionOut: 8,
} as const;

// Audio cue points (frames)
export const AUDIO_CUES = {
  // Music
  musicDipStart: 538,
  musicDipEnd: 560,
  
  // SFX
  hit1: 60,           // JUST KIDDING
  slam: 90,           // Title slam
  carouselSnaps: [180, 220, 260, 300, 340, 380],
  verbHits: [420, 460, 500],
  jackpot: 540,
  shimmer: 548,
  ctaConfirm: 690,
  qrBleep: 720,
  finalHit: 894,
  
  // VO cues (for reference; VO is one file starting at frame 72)
  voStart: 72,
} as const;

// Player data (using URLs from Leonardo AI)
export const PLAYERS = [
  { 
    name: 'DeMarcus Lawrence', 
    number: '90', 
    role: 'DEFENSIVE END', 
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/332d7473-6c1f-4bb8-b05f-3153ead9f23e/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_332d7473-6c1f-4bb8-b05f-3153ead9f23e_0.png',
  },
  { 
    name: 'Leonard Williams', 
    number: '99', 
    role: 'DEFENSIVE TACKLE', 
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/140da1c5-350a-435a-9020-e0dcb37e5bd3/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_140da1c5-350a-435a-9020-e0dcb37e5bd3_0.png',
  },
  { 
    name: 'Byron Murphy II', 
    number: '21', 
    role: 'CORNERBACK', 
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/a3ec2da7-6972-4e21-a776-f16e8bbd5c92/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_a3ec2da7-6972-4e21-a776-f16e8bbd5c92_0.png',
  },
  { 
    name: 'Boye Mafe', 
    number: '53', 
    role: 'LINEBACKER', 
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/6ee1f5cd-5bf7-406f-a08a-54ca5f22ebfe/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_6ee1f5cd-5bf7-406f-a08a-54ca5f22ebfe_0.png',
  },
  { 
    name: 'Rayshawn Jenkins', 
    number: '2', 
    role: 'SAFETY', 
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/4b9fd16b-c44c-4d59-88e3-6a0e2cf90ab0/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_4b9fd16b-c44c-4d59-88e3-6a0e2cf90ab0_0.png',
  },
  { 
    name: "Dre'Mont Jones", 
    number: '93', 
    role: 'DEFENSIVE END', 
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/c6a7c11e-a6b9-4f74-bf17-3d99e7b9f1a7/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_c6a7c11e-a6b9-4f74-bf17-3d99e7b9f1a7_0.png',
  },
] as const;

// Utility: hex to RGB values
function hexToRgbValues(hex: string): string {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r},${g},${b}`;
}

// Utility: hex to rgba
export function hexToRgba(hex: string, alpha: number): string {
  return `rgba(${hexToRgbValues(hex)}, ${alpha})`;
}
