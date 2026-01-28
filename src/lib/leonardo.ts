/**
 * Leonardo.ai API Client
 * Premium Asset Generation for Seattle Seahawks Defense Game
 */

const LEONARDO_API_URL = 'https://cloud.leonardo.ai/api/rest/v1'

// Leonardo AI Model IDs
export const MODELS = {
  CREATIVE: '6bef9f1b-29cb-40c7-b9df-32b51c1f67d3', // Leonardo Creative
  LIGHTNING: '1e60896f-3c26-4296-8ecc-53e2afecc132', // Leonardo Lightning
  DIFFUSION: '2af7b21a-c6f7-43cb-b8cd-b8c1ebc30f92', // Leonardo Diffusion XL
  KINO: '8e95dd21-63e7-4d74-8a87-a8a4b9e8e64c', // Leonardo Kino
} as const

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
    status: 'PENDING' | 'COMPLETE' | 'FAILED'
  }
}

export interface GenerateParams {
  prompt: string
  negativePrompt?: string
  modelId?: string
  width?: number
  height?: number
  numImages?: number
  guidance?: number
  styleUUID?: string
  seed?: number
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
   * Returns a generation ID for polling
   */
  async generateImages(params: GenerateParams): Promise<string> {
    const {
      prompt,
      negativePrompt = 'blurry, low quality, distorted, text, watermark, realistic photo',
      modelId = MODELS.CREATIVE,
      width = 512,
      height = 512,
      numImages = 1,
      guidance = 7,
      seed,
    } = params

    const response = await this.request<GenerationResponse>('/generations', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        negative_prompt: negativePrompt,
        modelId,
        width: Math.min(1024, Math.max(64, width)), // Clamp to valid range
        height: Math.min(1024, Math.max(64, height)),
        num_images: Math.min(4, Math.max(1, numImages)),
        guidance_scale: guidance,
        promptMagic: true,
        public: false,
        ...(seed !== undefined && { seed }),
      }),
    })

    return response.sdGenerationJob.generationId
  }

  /**
   * Get generation status and results
   */
  async getGeneration(generationId: string): Promise<GenerationResult> {
    return this.request<GenerationResult>(`/generations/${generationId}`)
  }

  /**
   * Wait for generation to complete with progress callback
   */
  async waitForGeneration(
    generationId: string,
    options: {
      maxAttempts?: number
      intervalMs?: number
      onProgress?: (attempt: number, status: string) => void
    } = {}
  ): Promise<string[]> {
    const { maxAttempts = 30, intervalMs = 2000, onProgress } = options

    for (let i = 0; i < maxAttempts; i++) {
      const result = await this.getGeneration(generationId)
      const status = result.generations_by_pk.status

      if (onProgress) {
        onProgress(i + 1, status)
      }

      if (status === 'COMPLETE') {
        return result.generations_by_pk.generated_images.map((img) => img.url)
      }

      if (status === 'FAILED') {
        throw new Error('Image generation failed')
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs))
    }

    throw new Error('Generation timed out')
  }

  /**
   * Generate and wait for completion
   */
  async generateAndWait(params: GenerateParams): Promise<string[]> {
    const generationId = await this.generateImages(params)
    return this.waitForGeneration(generationId)
  }

  /**
   * Generate sprite with optimized settings
   */
  async generateSprite(params: {
    prompt: string
    negativePrompt?: string
    width: number
    height: number
    scale?: number
  }): Promise<string> {
    const { prompt, negativePrompt, width, height, scale = 4 } = params

    // Generate at higher resolution for quality
    const scaledWidth = Math.min(1024, width * scale)
    const scaledHeight = Math.min(1024, height * scale)

    const generationId = await this.generateImages({
      prompt,
      negativePrompt,
      width: scaledWidth,
      height: scaledHeight,
      numImages: 1,
      guidance: 8, // Higher guidance for more prompt adherence
    })

    const urls = await this.waitForGeneration(generationId)
    return urls[0]
  }

  /**
   * Get user info and remaining credits
   */
  async getUserInfo(): Promise<{ 
    user: { 
      id: string
      username: string
      subscriptionTokens: number
      subscriptionGptTokens: number
    } 
  }> {
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
 * Check if Leonardo API is available
 */
export function isLeonardoAvailable(): boolean {
  return !!process.env.LEONARDO_API_KEY
}

/**
 * Game-specific asset generation prompts (legacy compatibility)
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
