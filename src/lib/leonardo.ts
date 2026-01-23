/**
 * Leonardo.ai API Client
 * Used for generating and fetching game assets
 */

const LEONARDO_API_URL = 'https://cloud.leonardo.ai/api/rest/v1'

interface GenerationResponse {
  sdGenerationJob: {
    generationId: string
  }
}

interface GenerationResult {
  generations_by_pk: {
    generated_images: Array<{
      id: string
      url: string
      likeCount: number
      nsfw: boolean
    }>
    status: string
  }
}

export class LeonardoClient {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${LEONARDO_API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Leonardo API error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  /**
   * Generate images using Leonardo.ai
   */
  async generateImages(params: {
    prompt: string
    negativePrompt?: string
    modelId?: string
    width?: number
    height?: number
    numImages?: number
    styleUUID?: string
  }): Promise<string> {
    const {
      prompt,
      negativePrompt = 'blurry, low quality, distorted',
      modelId = '6bef9f1b-29cb-40c7-b9df-32b51c1f67d3', // Leonardo Creative
      width = 512,
      height = 512,
      numImages = 1,
    } = params

    const response = await this.request<GenerationResponse>('/generations', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        negative_prompt: negativePrompt,
        modelId,
        width,
        height,
        num_images: numImages,
        promptMagic: true,
        public: false,
      }),
    })

    return response.sdGenerationJob.generationId
  }

  /**
   * Get generation results by ID
   */
  async getGeneration(generationId: string): Promise<GenerationResult> {
    return this.request<GenerationResult>(`/generations/${generationId}`)
  }

  /**
   * Wait for generation to complete and return image URLs
   */
  async waitForGeneration(
    generationId: string,
    maxAttempts = 30,
    intervalMs = 2000
  ): Promise<string[]> {
    for (let i = 0; i < maxAttempts; i++) {
      const result = await this.getGeneration(generationId)

      if (result.generations_by_pk.status === 'COMPLETE') {
        return result.generations_by_pk.generated_images.map((img) => img.url)
      }

      if (result.generations_by_pk.status === 'FAILED') {
        throw new Error('Image generation failed')
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs))
    }

    throw new Error('Generation timed out')
  }

  /**
   * Generate and wait for completion
   */
  async generateAndWait(params: {
    prompt: string
    negativePrompt?: string
    width?: number
    height?: number
    numImages?: number
  }): Promise<string[]> {
    const generationId = await this.generateImages(params)
    return this.waitForGeneration(generationId)
  }

  /**
   * Get user info and credits
   */
  async getUserInfo(): Promise<{ user: { id: string; username: string } }> {
    return this.request('/me')
  }
}

/**
 * Create a Leonardo client instance
 */
export function createLeonardoClient(): LeonardoClient | null {
  const apiKey = process.env.LEONARDO_API_KEY

  if (!apiKey) {
    console.warn('LEONARDO_API_KEY not found in environment variables')
    return null
  }

  return new LeonardoClient(apiKey)
}

/**
 * Game-specific asset generation prompts
 */
export const GAME_ASSET_PROMPTS = {
  // Seattle Darkside helmet
  seattleHelmet: {
    prompt:
      'Football helmet, teal color #0F6E6A, green accent stripe #7ED957, dark navy trim #0B1F24, side view, game asset, clean vector style, transparent background, no text',
    width: 256,
    height: 256,
  },

  // Opponent helmets (generate per team)
  opponentHelmet: (teamName: string, primaryColor: string, accentColor: string) => ({
    prompt: `Football helmet, ${primaryColor} primary color, ${accentColor} accent stripe, side view, game asset, clean vector style, transparent background, no text, ${teamName} team`,
    width: 256,
    height: 256,
  }),

  // Player sprite
  playerSprite: (jerseyColor: string) => ({
    prompt: `2D pixel art football player, ${jerseyColor} jersey, defensive stance, side view, game sprite, retro arcade style, transparent background`,
    width: 128,
    height: 128,
  }),

  // Football field turf texture
  turfTexture: {
    prompt:
      'Green grass football field texture, yard line markings, top down view, seamless tileable pattern, game texture',
    width: 512,
    height: 512,
  },

  // Trophy
  trophy: {
    prompt:
      'Golden championship trophy, football theme, shiny metallic, game asset, clean style, transparent background',
    width: 256,
    height: 256,
  },

  // Power-up icons
  powerUpIcon: (type: string) => ({
    prompt: `Game power-up icon, ${type}, glowing effect, teal and green colors, circular badge, game UI element, transparent background`,
    width: 128,
    height: 128,
  }),
}
