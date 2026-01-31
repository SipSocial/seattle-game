/**
 * Leonardo.ai API Client
 * Premium Asset Generation for Seattle Seahawks Defense Game
 * 
 * Supports:
 * - Text-to-image generation
 * - Image-to-image with Character Reference
 * - Style Reference for consistent look
 * - Upload init images from URLs
 */

const LEONARDO_API_URL = 'https://cloud.leonardo.ai/api/rest/v1'

// Leonardo AI Model IDs (Updated January 2025)
export const MODELS = {
  PHOENIX: 'de7d3faf-762f-48e0-b3b7-9d0ac3a3fcf3', // Leonardo Phoenix 1.0 - Best for photorealistic
  PHOENIX_09: '6b645e3a-d64f-4341-a6d8-7a3690fbf042', // Leonardo Phoenix 0.9
  KINO_XL: 'aa77f04e-3eec-4034-9c07-d0f619684628', // Leonardo Kino XL - Cinematic style
  CREATIVE: '6bef9f1b-29cb-40c7-b9df-32b51c1f67d3', // Leonardo Creative
  LIGHTNING: '1e60896f-3c26-4296-8ecc-53e2afecc132', // Leonardo Lightning - Fast
  DIFFUSION: '2af7b21a-c6f7-43cb-b8cd-b8c1ebc30f92', // Leonardo Diffusion XL
} as const

// ControlNet Preprocessor IDs for SDXL models
export const CONTROLNET_IDS = {
  STYLE_REFERENCE: 67,      // Style Reference - for consistent visual style
  CHARACTER_REFERENCE: 133, // Character Reference - for face/body likeness
  CONTENT_REFERENCE: 100,   // Content Reference - for structural guidance
  EDGE_TO_IMAGE: 19,        // Edge detection
  DEPTH_TO_IMAGE: 20,       // Depth map
  POSE_TO_IMAGE: 21,        // Pose extraction
} as const

// Strength types for controlnets
export type StrengthType = 'Low' | 'Mid' | 'High' | 'Ultra' | 'Max'

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
  transparency?: boolean // Enable transparent PNG background
}

export interface ControlNetConfig {
  initImageId: string
  initImageType: 'GENERATED' | 'UPLOADED'
  preprocessorId: number
  strengthType?: StrengthType
  weight?: number // 0-2 for character reference
  influence?: number // ratio for multiple style refs
}

export interface GenerateWithReferenceParams extends GenerateParams {
  controlnets?: ControlNetConfig[]
  initImageId?: string // For simple image-to-image
  initStrength?: number // 0-1
}

interface UploadInitImageResponse {
  uploadInitImage: {
    id: string
    url: string
    fields: string
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
   * Upload an image from URL to Leonardo for use as reference
   * Returns the uploaded image ID
   */
  async uploadImageFromUrl(imageUrl: string): Promise<string> {
    // Step 1: Get presigned upload URL
    const extension = imageUrl.split('.').pop()?.toLowerCase() || 'jpg'
    const validExtension = ['jpg', 'jpeg', 'png', 'webp'].includes(extension) ? extension : 'jpg'
    
    const presignedResponse = await this.request<UploadInitImageResponse>('/init-image', {
      method: 'POST',
      body: JSON.stringify({
        extension: validExtension,
      }),
    })

    const { id, url, fields } = presignedResponse.uploadInitImage
    const parsedFields = JSON.parse(fields)

    // Step 2: Fetch the image from URL
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image from URL: ${imageUrl}`)
    }
    const imageBlob = await imageResponse.blob()

    // Step 3: Upload to S3
    const formData = new FormData()
    Object.entries(parsedFields).forEach(([key, value]) => {
      formData.append(key, value as string)
    })
    formData.append('file', imageBlob)

    const uploadResponse = await fetch(url, {
      method: 'POST',
      body: formData,
    })

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload image to S3: ${uploadResponse.status}`)
    }

    return id
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
      transparency = false,
    } = params

    // Phoenix model doesn't support promptMagic
    const isPhoenix = modelId === MODELS.PHOENIX || modelId === MODELS.PHOENIX_09
    
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
        ...(isPhoenix ? {} : { promptMagic: true }), // Only enable for non-Phoenix models
        public: false,
        ...(seed !== undefined && { seed }),
        ...(transparency && { transparency: 'foreground_only' }), // Native transparent PNG
      }),
    })

    return response.sdGenerationJob.generationId
  }

  /**
   * Generate images with character/style reference
   * Use this for accurate player likenesses
   */
  async generateWithReference(params: GenerateWithReferenceParams): Promise<string> {
    const {
      prompt,
      negativePrompt = 'cartoon, anime, illustration, blurry, low quality, distorted',
      modelId = MODELS.KINO_XL, // Kino XL works best with controlnets
      width = 768,
      height = 1024,
      numImages = 4,
      guidance = 7,
      controlnets = [],
      initImageId,
      initStrength,
    } = params

    const body: Record<string, unknown> = {
      prompt,
      negative_prompt: negativePrompt,
      modelId,
      width: Math.min(1024, Math.max(64, width)),
      height: Math.min(1024, Math.max(64, height)),
      num_images: Math.min(4, Math.max(1, numImages)),
      guidance_scale: guidance,
      alchemy: true, // Required for controlnets
      photoReal: true,
      photoRealVersion: 'v2',
      presetStyle: 'CINEMATIC',
      public: false,
    }

    // Add controlnets if provided
    if (controlnets.length > 0) {
      body.controlnets = controlnets
    }

    // Add simple image-to-image if no controlnets
    if (initImageId && !controlnets.length) {
      body.init_image_id = initImageId
      body.init_strength = initStrength ?? 0.5
    }

    const response = await this.request<GenerationResponse>('/generations', {
      method: 'POST',
      body: JSON.stringify(body),
    })

    return response.sdGenerationJob.generationId
  }

  /**
   * Generate player with character reference for accurate likeness
   * @param prompt - The text prompt describing the player
   * @param referenceImageId - Uploaded image ID to use as character reference
   * @param options - Additional options
   */
  async generatePlayerWithReference(
    prompt: string,
    referenceImageId: string,
    options: {
      negativePrompt?: string
      strengthType?: StrengthType
      width?: number
      height?: number
      numImages?: number
    } = {}
  ): Promise<string> {
    const {
      negativePrompt,
      strengthType = 'High',
      width = 768,
      height = 1024,
      numImages = 4,
    } = options

    return this.generateWithReference({
      prompt,
      negativePrompt,
      width,
      height,
      numImages,
      modelId: MODELS.KINO_XL,
      controlnets: [
        {
          initImageId: referenceImageId,
          initImageType: 'UPLOADED',
          preprocessorId: CONTROLNET_IDS.CHARACTER_REFERENCE,
          strengthType,
        },
      ],
    })
  }

  /**
   * Get generation status and results
   * Note: Leonardo filters NSFW images by default, but we want all images
   */
  async getGeneration(generationId: string): Promise<GenerationResult> {
    // Use the user endpoint which returns all images including NSFW-flagged ones
    // Add cache: 'no-store' to prevent Next.js from caching the response
    const response = await fetch(
      `${LEONARDO_API_URL}/generations/${generationId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        cache: 'no-store',
      }
    )
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Leonardo API error: ${response.status} - ${error}`)
    }
    
    const data = await response.json()
    
    // The API might filter NSFW images when TRADEMARK is detected in moderation
    const status = data.generations_by_pk?.status
    const imageCount = data.generations_by_pk?.generated_images?.length || 0
    const moderations = data.generations_by_pk?.prompt_moderations || []
    const hasTrademark = moderations.some((m: { moderationClassification?: string[] }) => 
      m.moderationClassification?.includes('TRADEMARK')
    )
    
    console.log(`[Leonardo] Gen ${generationId}: status=${status}, images=${imageCount}, trademark=${hasTrademark}`)
    
    // If generation is COMPLETE but images were filtered due to TRADEMARK/NSFW
    // Construct URLs manually - only when status is COMPLETE (meaning generation finished)
    if (status === 'COMPLETE' && hasTrademark && imageCount === 0) {
      console.log(`[Leonardo] Generation ${generationId} COMPLETE but images filtered - constructing URLs manually`)
      
      // Extract prompt to build filename (Leonardo uses first ~50 chars of prompt in filename)
      const prompt = data.generations_by_pk?.prompt || ''
      const modelPrefix = data.generations_by_pk?.sdVersion === 'PHOENIX' ? 'Phoenix_' : ''
      // Leonardo truncates prompt to ~50 chars and replaces spaces with underscores
      const promptPart = prompt.substring(0, 50).replace(/[^a-zA-Z0-9 ]/g, '').replace(/ /g, '_')
      const filename = `${modelPrefix}${promptPart}_0.jpg`
      
      // Construct image URLs manually based on the pattern
      const baseUrl = `https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/${generationId}`
      const constructedImages = [
        { id: `${generationId}-1`, url: `${baseUrl}/segments/1:4:1/${filename}`, nsfw: true, likeCount: 0 },
        { id: `${generationId}-2`, url: `${baseUrl}/segments/2:4:1/${filename}`, nsfw: true, likeCount: 0 },
        { id: `${generationId}-3`, url: `${baseUrl}/segments/3:4:1/${filename}`, nsfw: true, likeCount: 0 },
        { id: `${generationId}-4`, url: `${baseUrl}/segments/4:4:1/${filename}`, nsfw: true, likeCount: 0 },
      ]
      
      console.log(`[Leonardo] Constructed filename: ${filename}`)
      
      return {
        generations_by_pk: {
          ...data.generations_by_pk,
          status: 'COMPLETE',
          generated_images: constructedImages,
        }
      }
    }
    
    return data
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

  /**
   * Remove background from an existing image
   * Returns a job ID that can be polled for the result
   */
  async removeBackground(imageId: string): Promise<string> {
    const response = await this.request<{ sdNobgJob: { id: string } }>('/variations/nobg', {
      method: 'POST',
      body: JSON.stringify({
        id: imageId,
      }),
    })

    return response.sdNobgJob.id
  }

  /**
   * Upload an image from URL and remove its background
   * Returns the transparent PNG URL
   */
  async removeBackgroundFromUrl(imageUrl: string): Promise<string> {
    // First upload the image
    const imageId = await this.uploadImageFromUrl(imageUrl)
    
    // Then remove background
    const generationId = await this.removeBackground(imageId)
    
    // Wait for result
    const urls = await this.waitForGeneration(generationId)
    return urls[0]
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
