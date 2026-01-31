/**
 * Campaign Map Assets - Leonardo AI Generated
 * 
 * This file stores URLs for all generated assets used in the campaign map.
 * Assets are generated via the /admin/campaign-assets page.
 */

export interface CityAsset {
  id: number
  city: string
  state: string
  stadium: string
  landmarks: string[]
  backgroundImage: string | null    // Leonardo city skyline/atmosphere
  stadiumImage: string | null       // Leonardo stadium view  
  videoBackground: string | null    // Optional video loop
  prompt: string                    // Leonardo prompt used
}

export interface MapAssets {
  // US Map background
  mapVideoUrl: string | null
  mapImageUrl: string | null
  mapPrompt: string
  
  // Seahawks airplane
  airplaneRightUrl: string | null
  airplaneLeftUrl: string | null
  airplaneIdleUrl: string | null
  airplanePrompt: string
}

// Default Leonardo prompts for map assets
export const MAP_PROMPTS = {
  usMap: `Stylized 3D US map at night, dark tactical military theme, glowing green grid lines forming a digital overlay, raised terrain showing mountains and valleys, Seattle Seahawks navy blue (#002244) and action green (#69BE28) accent lighting, night vision aesthetic, game board depth with cities as glowing nodes, cinematic wide shot, 8k quality, dramatic atmosphere, fog in valleys`,
  
  usMapVideo: `Cinematic animated US map at night, dark tactical theme, pulsing green grid lines, glowing city nodes, Seattle Seahawks colors navy and green, slow camera drift, atmospheric fog moving through terrain, stars in background, premium gaming aesthetic`,
  
  seahawksPlane: `Seattle Seahawks themed military stealth fighter jet, dark navy blue (#002244) base with neon action green (#69BE28) accent stripes and engine glow, aggressive angular design, Legion of Boom defensive spirit, side profile view flying right, game asset sprite, transparent background, 4k quality`,
  
  seahawksPlaneLeft: `Seattle Seahawks themed military stealth fighter jet, dark navy blue (#002244) base with neon action green (#69BE28) accent stripes and engine glow, aggressive angular design, Legion of Boom defensive spirit, side profile view flying left, game asset sprite, transparent background, 4k quality`,
  
  seahawksPlaneIdle: `Seattle Seahawks themed military stealth fighter jet parked on runway, dark navy blue (#002244) with neon action green (#69BE28) accents, defensive stance, top-down angled view, game asset, transparent background, 4k quality`,
}

// City-specific Leonardo prompts
export const CITY_PROMPTS: Record<string, string> = {
  Seattle: `Seattle Washington skyline at dusk, Space Needle prominent, Mount Rainier in misty background, Lumen Field stadium lights glowing, dramatic navy and green atmosphere, rain mist, photorealistic cinematic, 8k quality, NFL game day atmosphere`,
  
  Pittsburgh: `Pittsburgh Pennsylvania skyline, three rivers confluence, historic steel bridges, Acrisure Stadium, industrial fog, black and gold sunset, steel mill glow in distance, photorealistic cinematic, 8k quality, NFL game day atmosphere`,
  
  Phoenix: `Phoenix Arizona desert at sunset, saguaro cacti silhouettes, State Farm Stadium dome, dramatic orange and red sky, desert heat waves, photorealistic cinematic, 8k quality, NFL game day atmosphere`,
  
  Jacksonville: `Jacksonville Florida, St. Johns River waterfront, TIAA Bank Field stadium, palm trees, teal and gold sunset, humid tropical atmosphere, photorealistic cinematic, 8k quality, NFL game day atmosphere`,
  
  'Washington DC': `Washington DC at night, Capitol dome illuminated, Washington Monument, Northwest Stadium, patriotic burgundy and gold atmosphere, fall foliage, photorealistic cinematic, 8k quality, NFL game day atmosphere`,
  
  'Los Angeles': `Los Angeles at night, SoFi Stadium futuristic exterior, Hollywood sign in distance, palm tree silhouettes, purple and gold sunset, California cool vibe, photorealistic cinematic, 8k quality, NFL game day atmosphere`,
  
  Nashville: `Nashville Tennessee, Broadway neon lights, Nissan Stadium by the river, country music atmosphere, titan blue and red sunset, southern charm, photorealistic cinematic, 8k quality, NFL game day atmosphere`,
  
  Atlanta: `Atlanta Georgia, Mercedes-Benz Stadium futuristic dome, downtown skyline, red and black atmosphere, southern heat, photorealistic cinematic, 8k quality, NFL game day atmosphere`,
  
  Charlotte: `Charlotte North Carolina, Bank of America Stadium, downtown skyline at dusk, Carolina blue atmosphere, modern southern city, photorealistic cinematic, 8k quality, NFL game day atmosphere`,
  
  'San Francisco': `San Francisco Bay Area, Golden Gate Bridge in fog, Levi's Stadium, bay mist, red and gold sunset, NorCal atmosphere, photorealistic cinematic, 8k quality, NFL game day Super Bowl atmosphere`,
  
  Indianapolis: `Indianapolis Indiana, Lucas Oil Stadium retractable roof, downtown arch, Midwest heartland, blue and white atmosphere, classic football town, photorealistic cinematic, 8k quality, NFL game day atmosphere`,
  
  Minneapolis: `Minneapolis Minnesota, US Bank Stadium glass exterior, northern lights sky effect, frozen lakes, purple and gold atmosphere, Viking winter, photorealistic cinematic, 8k quality, NFL game day atmosphere`,
}

// Generated Leonardo AI Assets (January 2026)
export const GENERATED_ASSETS = {
  mapImageUrl: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/2561ee31-7e9b-4de3-9cf2-536e5facde5a/segments/2:4:1/Phoenix_Stylized_3D_US_map_at_night_dark_tactical_military_the_0.jpg',
  airplaneUrl: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/638533f7-2dc5-4593-b9b5-288d4c8d24fa/segments/1:4:1/Phoenix_Seattle_Seahawks_themed_military_stealth_fighter_jet_d_0.jpg',
  cities: {
    'Seattle': 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/1f736005-c2ed-4755-b762-4fc99e7062a1/segments/4:4:1/Phoenix_Seattle_Washington_skyline_at_dusk_Space_Needle_promin_0.jpg',
    'Pittsburgh': 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/cce31f27-1fb1-4762-9655-53e8949d1640/segments/3:4:1/Phoenix_Pittsburgh_Pennsylvania_skyline_three_rivers_confluenc_0.jpg',
    'Phoenix': 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/bc26177c-33bc-42ce-86ee-9a5d5b0d616f/segments/1:4:1/Phoenix_Phoenix_Arizona_desert_at_sunset_saguaro_cacti_silhoue_0.jpg',
    'Jacksonville': 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/d7e2a53f-b3b9-43ce-bf47-23b755460a55/segments/2:4:1/Phoenix_Jacksonville_Florida_St_Johns_River_waterfront_TIAA_Ba_0.jpg',
    'Washington DC': 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/03489624-502b-4a71-a3e9-3e5e3379c854/segments/3:4:1/Phoenix_Washington_DC_at_night_Capitol_dome_illuminated_Washin_0.jpg',
    'Los Angeles': 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/6ec6e962-3d55-4b86-8b03-9da32162f5ac/segments/1:4:1/Phoenix_Los_Angeles_at_night_SoFi_Stadium_futuristic_exterior_0.jpg',
    'Nashville': 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/d4ee20f2-48c8-4018-92cf-c6f5b70c19aa/segments/3:4:1/Phoenix_Nashville_Tennessee_Broadway_neon_lights_Nissan_Stadiu_0.jpg',
    'Atlanta': 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/29406333-f8bf-4f49-b24a-c19b1712c2e4/segments/1:4:1/Phoenix_Atlanta_Georgia_MercedesBenz_Stadium_futuristic_dome_d_0.jpg',
    'Charlotte': 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/d65a8a97-9e70-4342-a61d-0814cfcbf088/segments/4:4:1/Phoenix_Charlotte_North_Carolina_Bank_of_America_Stadium_downt_0.jpg',
    'San Francisco': 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/f2e5cdfb-ec9b-4d48-825d-6fe7c3a7b3ed/segments/1:4:1/Phoenix_San_Francisco_Bay_Area_Golden_Gate_Bridge_in_fog_Levis_0.jpg',
    'Indianapolis': 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/05eb7428-129f-4c9d-8374-70226d3d7f61/segments/1:4:1/Phoenix_Indianapolis_Indiana_Lucas_Oil_Stadium_retractable_roo_0.jpg',
    'Minneapolis': 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/93e0c861-abb5-4e01-91f0-549a1d47a5a8/segments/3:4:1/Phoenix_Minneapolis_Minnesota_US_Bank_Stadium_glass_exterior_n_0.jpg',
  },
}

// Unique cities from the 2025 schedule (with generated backgrounds)
export const CAMPAIGN_CITIES: CityAsset[] = [
  {
    id: 1,
    city: 'Seattle',
    state: 'Washington',
    stadium: 'Lumen Field',
    landmarks: ['Space Needle', 'Mount Rainier', 'Puget Sound'],
    backgroundImage: GENERATED_ASSETS.cities['Seattle'],
    stadiumImage: null,
    videoBackground: null,
    prompt: CITY_PROMPTS['Seattle'],
  },
  {
    id: 2,
    city: 'Pittsburgh',
    state: 'Pennsylvania', 
    stadium: 'Acrisure Stadium',
    landmarks: ['Three Rivers', 'Steel Bridges', 'Point State Park'],
    backgroundImage: GENERATED_ASSETS.cities['Pittsburgh'],
    stadiumImage: null,
    videoBackground: null,
    prompt: CITY_PROMPTS['Pittsburgh'],
  },
  {
    id: 3,
    city: 'Phoenix',
    state: 'Arizona',
    stadium: 'State Farm Stadium',
    landmarks: ['Saguaro Cacti', 'Camelback Mountain', 'Desert Sunset'],
    backgroundImage: GENERATED_ASSETS.cities['Phoenix'],
    stadiumImage: null,
    videoBackground: null,
    prompt: CITY_PROMPTS['Phoenix'],
  },
  {
    id: 4,
    city: 'Jacksonville',
    state: 'Florida',
    stadium: 'TIAA Bank Field',
    landmarks: ['St. Johns River', 'Palm Trees', 'Beaches'],
    backgroundImage: GENERATED_ASSETS.cities['Jacksonville'],
    stadiumImage: null,
    videoBackground: null,
    prompt: CITY_PROMPTS['Jacksonville'],
  },
  {
    id: 5,
    city: 'Washington DC',
    state: 'District of Columbia',
    stadium: 'Northwest Stadium',
    landmarks: ['Capitol Dome', 'Washington Monument', 'Lincoln Memorial'],
    backgroundImage: GENERATED_ASSETS.cities['Washington DC'],
    stadiumImage: null,
    videoBackground: null,
    prompt: CITY_PROMPTS['Washington DC'],
  },
  {
    id: 6,
    city: 'Los Angeles',
    state: 'California',
    stadium: 'SoFi Stadium',
    landmarks: ['Hollywood Sign', 'Palm Trees', 'Pacific Ocean'],
    backgroundImage: GENERATED_ASSETS.cities['Los Angeles'],
    stadiumImage: null,
    videoBackground: null,
    prompt: CITY_PROMPTS['Los Angeles'],
  },
  {
    id: 7,
    city: 'Nashville',
    state: 'Tennessee',
    stadium: 'Nissan Stadium',
    landmarks: ['Broadway Neon', 'Cumberland River', 'Country Music Hall'],
    backgroundImage: GENERATED_ASSETS.cities['Nashville'],
    stadiumImage: null,
    videoBackground: null,
    prompt: CITY_PROMPTS['Nashville'],
  },
  {
    id: 8,
    city: 'Atlanta',
    state: 'Georgia',
    stadium: 'Mercedes-Benz Stadium',
    landmarks: ['CNN Center', 'Centennial Park', 'Peachtree Street'],
    backgroundImage: GENERATED_ASSETS.cities['Atlanta'],
    stadiumImage: null,
    videoBackground: null,
    prompt: CITY_PROMPTS['Atlanta'],
  },
  {
    id: 9,
    city: 'Charlotte',
    state: 'North Carolina',
    stadium: 'Bank of America Stadium',
    landmarks: ['Uptown Skyline', 'NASCAR Hall of Fame', 'Freedom Park'],
    backgroundImage: GENERATED_ASSETS.cities['Charlotte'],
    stadiumImage: null,
    videoBackground: null,
    prompt: CITY_PROMPTS['Charlotte'],
  },
  {
    id: 10,
    city: 'San Francisco',
    state: 'California',
    stadium: "Levi's Stadium",
    landmarks: ['Golden Gate Bridge', 'Bay Fog', 'Silicon Valley'],
    backgroundImage: GENERATED_ASSETS.cities['San Francisco'],
    stadiumImage: null,
    videoBackground: null,
    prompt: CITY_PROMPTS['San Francisco'],
  },
  {
    id: 11,
    city: 'Indianapolis',
    state: 'Indiana',
    stadium: 'Lucas Oil Stadium',
    landmarks: ['Monument Circle', 'Soldiers and Sailors Monument', 'Canal Walk'],
    backgroundImage: GENERATED_ASSETS.cities['Indianapolis'],
    stadiumImage: null,
    videoBackground: null,
    prompt: CITY_PROMPTS['Indianapolis'],
  },
  {
    id: 12,
    city: 'Minneapolis',
    state: 'Minnesota',
    stadium: 'US Bank Stadium',
    landmarks: ['Stone Arch Bridge', 'Chain of Lakes', 'Northern Lights'],
    backgroundImage: GENERATED_ASSETS.cities['Minneapolis'],
    stadiumImage: null,
    videoBackground: null,
    prompt: CITY_PROMPTS['Minneapolis'],
  },
]

// Default map assets (will be populated from admin page)
export const DEFAULT_MAP_ASSETS: MapAssets = {
  mapVideoUrl: null,
  mapImageUrl: null,
  mapPrompt: MAP_PROMPTS.usMap,
  airplaneRightUrl: null,
  airplaneLeftUrl: null, 
  airplaneIdleUrl: null,
  airplanePrompt: MAP_PROMPTS.seahawksPlane,
}

// Placeholder video/image for development
export const PLACEHOLDER_ASSETS = {
  mapVideo: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/4b5f0ad3-9f4e-413f-b44a-053e9af6240c/4b5f0ad3-9f4e-413f-b44a-053e9af6240c.mp4',
  mapPoster: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/16412705-ca65-400e-bb78-80ff29be860a/segments/2:2:1/Phoenix_Empty_NFL_football_field_at_night_dramatic_billowing_s_0.jpg',
}

/**
 * Get city asset by city name
 */
export function getCityAsset(cityName: string): CityAsset | undefined {
  return CAMPAIGN_CITIES.find(c => c.city === cityName)
}

/**
 * Get all unique cities in order of campaign schedule
 */
export function getUniqueCities(): CityAsset[] {
  return CAMPAIGN_CITIES
}
