/**
 * Commercial Assets - Dark Side Defense Game Drop
 * Concept A: "The Dark Side Rises" - VERTICAL 9:16 KILLER VERSION
 */

// ============================================================================
// BRAND COLORS
// ============================================================================

export const COLORS = {
  navy: '#002244',
  green: '#69BE28',
  grey: '#A5ACAF',
  white: '#FFFFFF',
  black: '#000000',
  gold: '#FFD700',
  goldDark: '#B8860B',
};

// ============================================================================
// DRINKSIP
// ============================================================================

export const DRINKSIP = {
  logo: 'https://drinksip.com/cdn/shop/files/DrinkSip-Primary-Logo-for-Web_-_Copy_small_55182640-be2f-4a9a-af3e-3c9ea7582c69.png?v=1659115921&width=500',
  tagline: 'Wake Up Happy',
  products: [
    { 
      name: 'Hazy IPA', 
      effect: 'SLOW-MO',
      color: '#f4a460',
      image: 'https://cdn.shopify.com/s/files/1/0407/8580/5468/files/Hazy_IPA_87ecc479-28f1-49c7-9eba-3d8d7ed19e38.png?v=1760812593',
    },
    { 
      name: 'Watermelon', 
      effect: 'LIFE',
      color: '#ff6b8a',
      image: 'https://cdn.shopify.com/s/files/1/0407/8580/5468/files/Watermelon_Refresher_5730a5cf-a72a-4df9-aa14-d3342b088fe1.png?v=1760812569',
    },
    { 
      name: 'Lemon Lime', 
      effect: 'SPEED',
      color: '#adff2f',
      image: 'https://cdn.shopify.com/s/files/1/0407/8580/5468/files/Lemon_Lime_Refresher_9565ca39-8832-48ab-8c6b-bcd0899f87e9.png?v=1759017824',
    },
    { 
      name: 'Blood Orange', 
      effect: 'POWER',
      color: '#ff4500',
      image: 'https://cdn.shopify.com/s/files/1/0407/8580/5468/files/Blood_Orange_Refresher_82f1cfff-dfdd-44c5-bb02-6f8e74183f36.png?v=1759017824',
    },
  ],
};

// ============================================================================
// PLAYER ROSTER - TRANSPARENT PNG versions (no background)
// ============================================================================

export const PLAYERS_TRANSPARENT = [
  {
    id: 'lawrence',
    name: 'DEMARCUS LAWRENCE',
    firstName: 'DEMARCUS',
    lastName: 'LAWRENCE',
    jersey: 0,
    position: 'DE',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/332d7473-6c1f-4bb8-b05f-3153ead9f23e/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_332d7473-6c1f-4bb8-b05f-3153ead9f23e_0.png',
  },
  {
    id: 'williams',
    name: 'LEONARD WILLIAMS',
    firstName: 'LEONARD',
    lastName: 'WILLIAMS',
    jersey: 99,
    position: 'DT',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/140da1c5-350a-435a-9020-e0dcb37e5bd3/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_140da1c5-350a-435a-9020-e0dcb37e5bd3_0.png',
  },
  {
    id: 'murphy',
    name: 'BYRON MURPHY II',
    firstName: 'BYRON',
    lastName: 'MURPHY II',
    jersey: 91,
    position: 'NT',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/8e36992d-ac71-49b5-b3ad-7b1b2c8c6278/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_8e36992d-ac71-49b5-b3ad-7b1b2c8c6278_0.png',
  },
  {
    id: 'hall',
    name: 'DERICK HALL',
    firstName: 'DERICK',
    lastName: 'HALL',
    jersey: 58,
    position: 'EDGE',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/9d86de1b-8b70-4cab-a879-0fea0e2e5880/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_9d86de1b-8b70-4cab-a879-0fea0e2e5880_0.png',
  },
  {
    id: 'nwosu',
    name: 'UCHENNA NWOSU',
    firstName: 'UCHENNA',
    lastName: 'NWOSU',
    jersey: 7,
    position: 'OLB',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/5e219974-5422-4683-ac72-ffb5b321819c/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_5e219974-5422-4683-ac72-ffb5b321819c_0.png',
  },
  {
    id: 'jones',
    name: 'ERNEST JONES IV',
    firstName: 'ERNEST',
    lastName: 'JONES IV',
    jersey: 13,
    position: 'MLB',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/f982ec62-3c44-4672-adf4-b1dbeb228012/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_f982ec62-3c44-4672-adf4-b1dbeb228012_0.png',
  },
  {
    id: 'thomas',
    name: 'DRAKE THOMAS',
    firstName: 'DRAKE',
    lastName: 'THOMAS',
    jersey: 42,
    position: 'LB',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/d2833c29-06cf-43b8-a66f-d90d72a09c51/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_d2833c29-06cf-43b8-a66f-d90d72a09c51_0.png',
  },
  {
    id: 'witherspoon',
    name: 'DEVON WITHERSPOON',
    firstName: 'DEVON',
    lastName: 'WITHERSPOON',
    jersey: 21,
    position: 'CB',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/df5df5a0-9f26-463f-a540-bf0e2fd20f83/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_df5df5a0-9f26-463f-a540-bf0e2fd20f83_0.png',
  },
  {
    id: 'jobe',
    name: 'JOSH JOBE',
    firstName: 'JOSH',
    lastName: 'JOBE',
    jersey: 29,
    position: 'CB',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/89892bc5-c800-4790-95aa-e7a50a4cc1b6/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_89892bc5-c800-4790-95aa-e7a50a4cc1b6_0.png',
  },
  {
    id: 'love',
    name: 'JULIAN LOVE',
    firstName: 'JULIAN',
    lastName: 'LOVE',
    jersey: 20,
    position: 'S',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/4cf6ca19-acc7-43ac-ab46-893692b85a36/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_4cf6ca19-acc7-43ac-ab46-893692b85a36_0.png',
  },
  {
    id: 'bryant',
    name: 'COBY BRYANT',
    firstName: 'COBY',
    lastName: 'BRYANT',
    jersey: 8,
    position: 'S',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/10d006eb-a852-43cc-acc2-748cefc882bc/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_10d006eb-a852-43cc-acc2-748cefc882bc_0.png',
  },
];

// ============================================================================
// PLAYER ROSTER - CARD versions (with background, for selection cards)
// ============================================================================

export const PLAYERS = [
  {
    id: 'lawrence',
    name: 'DEMARCUS LAWRENCE',
    firstName: 'DEMARCUS',
    lastName: 'LAWRENCE',
    jersey: 0,
    position: 'DE',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/3ba453a4-62a6-49a5-8202-d2446a0f5aac/segments/1:4:1/Phoenix_Photorealistic_3D_render_of_NFL_football_player_Seattl_0.jpg',
  },
  {
    id: 'williams',
    name: 'LEONARD WILLIAMS',
    firstName: 'LEONARD',
    lastName: 'WILLIAMS',
    jersey: 99,
    position: 'DT',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/ef2fd7e7-c402-44d0-8e59-ffe22303fbe8/segments/1:4:1/Phoenix_Photorealistic_3D_render_Seattle_Seahawks_NFL_defensiv_0.jpg',
  },
  {
    id: 'murphy',
    name: 'BYRON MURPHY II',
    firstName: 'BYRON',
    lastName: 'MURPHY II',
    jersey: 91,
    position: 'NT',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/d8c452c6-a27a-48bd-a5c6-8c7f56d75602/segments/1:4:1/Phoenix_Photorealistic_3D_render_Seattle_Seahawks_NFL_defensiv_0.jpg',
  },
  {
    id: 'hall',
    name: 'DERICK HALL',
    firstName: 'DERICK',
    lastName: 'HALL',
    jersey: 58,
    position: 'EDGE',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/9a34de39-ddf8-4c51-8d14-c8037b9d0e00/segments/1:4:1/Phoenix_Photorealistic_3D_render_Seattle_Seahawks_NFL_defensiv_0.jpg',
  },
  {
    id: 'nwosu',
    name: 'UCHENNA NWOSU',
    firstName: 'UCHENNA',
    lastName: 'NWOSU',
    jersey: 7,
    position: 'OLB',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/6e28c6a0-a5ec-4d46-8709-d142428cffae/segments/1:4:1/Phoenix_Photorealistic_3D_render_Seattle_Seahawks_NFL_defensiv_0.jpg',
  },
  {
    id: 'jones',
    name: 'ERNEST JONES IV',
    firstName: 'ERNEST',
    lastName: 'JONES IV',
    jersey: 13,
    position: 'MLB',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/5295f146-49d1-4dd2-862d-05a8032b4dbf/segments/1:4:1/Phoenix_Photorealistic_3D_render_Seattle_Seahawks_NFL_defensiv_0.jpg',
  },
  {
    id: 'thomas',
    name: 'DRAKE THOMAS',
    firstName: 'DRAKE',
    lastName: 'THOMAS',
    jersey: 42,
    position: 'LB',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/328cb3d7-4478-4f6a-b4b4-c1c4df1df2cf/segments/1:4:1/Phoenix_Photorealistic_3D_render_Seattle_Seahawks_NFL_defensiv_0.jpg',
  },
  {
    id: 'witherspoon',
    name: 'DEVON WITHERSPOON',
    firstName: 'DEVON',
    lastName: 'WITHERSPOON',
    jersey: 21,
    position: 'CB',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/b9eee629-8964-4222-893d-7d6c6b9f3166/segments/1:4:1/Phoenix_Photorealistic_3D_render_Seattle_Seahawks_NFL_defensiv_0.jpg',
  },
  {
    id: 'jobe',
    name: 'JOSH JOBE',
    firstName: 'JOSH',
    lastName: 'JOBE',
    jersey: 29,
    position: 'CB',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/114c8f3d-5347-4fc3-a0be-debd09d626b0/segments/1:4:1/Phoenix_Photorealistic_3D_render_Seattle_Seahawks_NFL_defensiv_0.jpg',
  },
  {
    id: 'love',
    name: 'JULIAN LOVE',
    firstName: 'JULIAN',
    lastName: 'LOVE',
    jersey: 20,
    position: 'S',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/8e44f952-0a2e-43ed-b4f8-2f7c4a6f4609/segments/1:4:1/Phoenix_Photorealistic_3D_render_Seattle_Seahawks_NFL_defensiv_0.jpg',
  },
  {
    id: 'bryant',
    name: 'COBY BRYANT',
    firstName: 'COBY',
    lastName: 'BRYANT',
    jersey: 8,
    position: 'S',
    image: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/fe695e8e-0473-4ef6-8b32-adb7e39c762c/segments/1:4:1/Phoenix_Photorealistic_3D_render_Seattle_Seahawks_NFL_defensiv_0.jpg',
  },
];

// Get specific players - TRANSPARENT versions for hero shots
export const DEMARCUS = PLAYERS_TRANSPARENT[0];
export const CREW = PLAYERS_TRANSPARENT.slice(1, 7); // 6 crew members behind DeMarcus

// For selection cards - use the card versions
export const FEATURED_PLAYERS = [PLAYERS[7], PLAYERS[1], PLAYERS[4], PLAYERS[0]]; // Witherspoon, Williams, Nwosu, Lawrence

// ============================================================================
// CAMPAIGN ASSETS
// ============================================================================

export const CAMPAIGN = {
  mapImage: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/2561ee31-7e9b-4de3-9cf2-536e5facde5a/segments/2:4:1/Phoenix_Stylized_3D_US_map_at_night_dark_tactical_military_the_0.jpg',
  planeImage: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/25a25712-b04b-48f6-b9ae-e8bd3122b674/variations/Default_Seattle_Seahawks_NFL_team_Boeing_737_airplane_sleek_mo_0_25a25712-b04b-48f6-b9ae-e8bd3122b674_0.png',
  stadiumImage: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/16412705-ca65-400e-bb78-80ff29be860a/segments/2:2:1/Phoenix_Empty_NFL_football_field_at_night_dramatic_billowing_s_0.jpg',
  seattleImage: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/1f736005-c2ed-4755-b762-4fc99e7062a1/segments/4:4:1/Phoenix_Seattle_Washington_skyline_at_dusk_Space_Needle_promin_0.jpg',
  sanFranciscoImage: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/f2e5cdfb-ec9b-4d48-825d-6fe7c3a7b3ed/segments/1:4:1/Phoenix_San_Francisco_Bay_Area_Golden_Gate_Bridge_in_fog_Levis_0.jpg',
};

// ============================================================================
// GAME INFO
// ============================================================================

export const GAME = {
  title: 'DARK SIDE DEFENSE',
  url: 'seattle-game.vercel.app',
  stages: 20,
  games: 60,
};

export const SUPER_BOWL = {
  name: 'SUPER BOWL LX',
  date: 'FEBRUARY 9',
  shortDate: 'FEB 9',
  location: 'SAN FRANCISCO',
  tickets: '2 SUPER BOWL TICKETS',
};

// ============================================================================
// TIMING CONSTANTS (30fps)
// ============================================================================

export const FPS = 30;

// 60-second version timing
export const SCENES_60 = {
  dateReveal: { start: 0, end: 3 * FPS },
  seattleFlash: { start: 3 * FPS, end: 6 * FPS },
  noFootball: { start: 6 * FPS, end: 10 * FPS },
  playerMontage: { start: 10 * FPS, end: 18 * FPS },
  titleReveal: { start: 18 * FPS, end: 22 * FPS },
  gameplay: { start: 22 * FPS, end: 30 * FPS },
  campaign: { start: 30 * FPS, end: 34 * FPS },
  roster: { start: 34 * FPS, end: 38 * FPS },
  giveaway: { start: 38 * FPS, end: 46 * FPS },
  presentedBy: { start: 46 * FPS, end: 50 * FPS },
  cta: { start: 50 * FPS, end: 56 * FPS },
  logoLock: { start: 56 * FPS, end: 60 * FPS },
};

// 30-second version timing
export const SCENES_30 = {
  noFootball: { start: 0, end: 2 * FPS },
  playerMontage: { start: 2 * FPS, end: 6 * FPS },
  titleReveal: { start: 6 * FPS, end: 8 * FPS },
  gameplay: { start: 8 * FPS, end: 14 * FPS },
  giveaway: { start: 14 * FPS, end: 20 * FPS },
  presentedBy: { start: 20 * FPS, end: 24 * FPS },
  cta: { start: 24 * FPS, end: 28 * FPS },
  logoLock: { start: 28 * FPS, end: 30 * FPS },
};

// 30-second VERTICAL version timing
export const SCENES_VERTICAL = {
  hook: { start: 0, end: 3 * FPS },              // 0-3s - "NO FOOTBALL THIS WEEK"
  squadReveal: { start: 3 * FPS, end: 10 * FPS }, // 3-10s - DeMarcus hero + crew stacked
  titleSlam: { start: 10 * FPS, end: 13 * FPS },  // 10-13s - DARK SIDE DEFENSE
  gameplay: { start: 13 * FPS, end: 19 * FPS },   // 13-19s - Action words + cards
  giveaway: { start: 19 * FPS, end: 25 * FPS },   // 19-25s - WIN TICKETS
  cta: { start: 25 * FPS, end: 30 * FPS },        // 25-30s - URL + logo lock
};

// ============================================================================
// TYPOGRAPHY STYLES
// ============================================================================

export const FONTS = {
  // Primary headlines - condensed, ultra bold
  headline: {
    fontFamily: 'Arial Black, Impact, sans-serif',
    fontWeight: 900,
    letterSpacing: '-0.02em',
    textTransform: 'uppercase' as const,
  },
  // Secondary text - clean, readable
  body: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
  },
  // Numbers - impact
  number: {
    fontFamily: 'Impact, Arial Black, sans-serif',
    fontWeight: 900,
    letterSpacing: '-0.03em',
  },
};
