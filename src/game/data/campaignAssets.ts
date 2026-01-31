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

// Unique cities from the 2025 schedule
export const CAMPAIGN_CITIES: CityAsset[] = [
  {
    id: 1,
    city: 'Seattle',
    state: 'Washington',
    stadium: 'Lumen Field',
    landmarks: ['Space Needle', 'Mount Rainier', 'Puget Sound'],
    backgroundImage: null,
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
    backgroundImage: null,
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
    backgroundImage: null,
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
    backgroundImage: null,
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
    backgroundImage: null,
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
    backgroundImage: null,
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
    backgroundImage: null,
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
    backgroundImage: null,
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
    backgroundImage: null,
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
    backgroundImage: null,
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
    backgroundImage: null,
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
    backgroundImage: null,
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
