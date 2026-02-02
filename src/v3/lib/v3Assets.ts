/**
 * V3 Asset Manifest
 * 
 * Stores selected assets for V3 gameplay
 * Updated via asset picker or generation scripts
 */

export interface PlayerAsset {
  jersey: number
  name: string
  position: string
  type: 'offense' | 'defense'
  imageUrl: string | null
  variants: string[]
  generationId: string | null
  status: 'pending' | 'generating' | 'ready' | 'error'
  lastUpdated: string | null
}

export interface HelmetAsset {
  id: string
  name: string
  type: 'darkside' | 'opponent'
  opponentWeek?: number
  imageUrl: string | null
  status: 'pending' | 'generating' | 'ready' | 'error'
}

export interface FieldAsset {
  id: string
  name: string
  perspective: '9x16' | '16x9' | 'overhead'
  weather: 'night' | 'day' | 'rain' | 'snow'
  imageUrl: string | null
  status: 'pending' | 'generating' | 'ready' | 'error'
}

export interface V3AssetManifest {
  version: string
  lastUpdated: string
  players: {
    offense: PlayerAsset[]
    defense: PlayerAsset[]
  }
  helmets: HelmetAsset[]
  fields: FieldAsset[]
}

// Placeholder sprite (simple football player silhouette)
// Will be replaced with Leonardo-generated Dark Side uniforms
const PLACEHOLDER_PLAYER_SPRITE = 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/16412705-ca65-400e-bb78-80ff29be860a/segments/2:2:1/Phoenix_Empty_NFL_football_field_at_night_dramatic_billowing_s_0.jpg'

// Placeholder field background
const PLACEHOLDER_FIELD_9x16 = 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/16412705-ca65-400e-bb78-80ff29be860a/segments/2:2:1/Phoenix_Empty_NFL_football_field_at_night_dramatic_billowing_s_0.jpg'

// Initial manifest with placeholder assets for development
export const V3_ASSETS: V3AssetManifest = {
  version: '3.0.0',
  lastUpdated: new Date().toISOString(),
  players: {
    offense: [
      {
        jersey: 14,
        name: 'Sam Darnold',
        position: 'QB',
        type: 'offense',
        imageUrl: PLACEHOLDER_PLAYER_SPRITE,
        variants: [],
        generationId: null,
        status: 'pending',
        lastUpdated: null,
      },
      {
        jersey: 11,
        name: 'Jaxon Smith-Njigba',
        position: 'WR',
        type: 'offense',
        imageUrl: PLACEHOLDER_PLAYER_SPRITE,
        variants: [],
        generationId: null,
        status: 'pending',
        lastUpdated: null,
      },
      {
        jersey: 10,
        name: 'Cooper Kupp',
        position: 'WR',
        type: 'offense',
        imageUrl: PLACEHOLDER_PLAYER_SPRITE,
        variants: [],
        generationId: null,
        status: 'pending',
        lastUpdated: null,
      },
      {
        jersey: 88,
        name: 'AJ Barner',
        position: 'TE',
        type: 'offense',
        imageUrl: PLACEHOLDER_PLAYER_SPRITE,
        variants: [],
        generationId: null,
        status: 'pending',
        lastUpdated: null,
      },
      {
        jersey: 9,
        name: 'Kenneth Walker III',
        position: 'RB',
        type: 'offense',
        imageUrl: PLACEHOLDER_PLAYER_SPRITE,
        variants: [],
        generationId: null,
        status: 'pending',
        lastUpdated: null,
      },
    ],
    defense: [
      {
        jersey: 0,
        name: 'DeMarcus Lawrence',
        position: 'DE',
        type: 'defense',
        imageUrl: PLACEHOLDER_PLAYER_SPRITE,
        variants: [],
        generationId: null,
        status: 'pending',
        lastUpdated: null,
      },
      {
        jersey: 99,
        name: 'Leonard Williams',
        position: 'DT',
        type: 'defense',
        imageUrl: PLACEHOLDER_PLAYER_SPRITE,
        variants: [],
        generationId: null,
        status: 'pending',
        lastUpdated: null,
      },
      {
        jersey: 21,
        name: 'Devon Witherspoon',
        position: 'CB',
        type: 'defense',
        imageUrl: PLACEHOLDER_PLAYER_SPRITE,
        variants: [],
        generationId: null,
        status: 'pending',
        lastUpdated: null,
      },
    ],
  },
  helmets: [
    {
      id: 'darkside',
      name: 'Dark Side',
      type: 'darkside',
      imageUrl: null,
      status: 'pending',
    },
  ],
  fields: [
    {
      id: 'field-9x16-night',
      name: 'Night Game (9:16)',
      perspective: '9x16',
      weather: 'night',
      imageUrl: PLACEHOLDER_FIELD_9x16,
      status: 'ready',
    },
  ],
}

// Export placeholder constants for use in gameplay
export const PLACEHOLDERS = {
  playerSprite: PLACEHOLDER_PLAYER_SPRITE,
  field9x16: PLACEHOLDER_FIELD_9x16,
}

// Helper to get player asset
export function getPlayerAsset(jersey: number, type: 'offense' | 'defense'): PlayerAsset | undefined {
  const list = type === 'offense' ? V3_ASSETS.players.offense : V3_ASSETS.players.defense
  return list.find(p => p.jersey === jersey)
}

// Helper to update player asset (for use in API routes)
export function updatePlayerAsset(
  jersey: number,
  type: 'offense' | 'defense',
  updates: Partial<PlayerAsset>
): void {
  const list = type === 'offense' ? V3_ASSETS.players.offense : V3_ASSETS.players.defense
  const index = list.findIndex(p => p.jersey === jersey)
  if (index !== -1) {
    list[index] = { ...list[index], ...updates, lastUpdated: new Date().toISOString() }
  }
}

// Get all pending assets count
export function getPendingAssetsCount(): number {
  const offensePending = V3_ASSETS.players.offense.filter(p => p.status === 'pending').length
  const defensePending = V3_ASSETS.players.defense.filter(p => p.status === 'pending').length
  const helmetsPending = V3_ASSETS.helmets.filter(h => h.status === 'pending').length
  const fieldsPending = V3_ASSETS.fields.filter(f => f.status === 'pending').length
  return offensePending + defensePending + helmetsPending + fieldsPending
}

// Get ready assets count
export function getReadyAssetsCount(): number {
  const offenseReady = V3_ASSETS.players.offense.filter(p => p.status === 'ready').length
  const defenseReady = V3_ASSETS.players.defense.filter(p => p.status === 'ready').length
  const helmetsReady = V3_ASSETS.helmets.filter(h => h.status === 'ready').length
  const fieldsReady = V3_ASSETS.fields.filter(f => f.status === 'ready').length
  return offenseReady + defenseReady + helmetsReady + fieldsReady
}
