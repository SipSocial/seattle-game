import { NextRequest, NextResponse } from 'next/server'
import { createLeonardoClient, isLeonardoAvailable } from '@/src/lib/leonardo'
import { 
  getSpritePromptByKey, 
  getAllSpritePrompts, 
  getSpritesByCategory,
  getSpriteBatch,
  SpritePrompt 
} from '@/src/lib/spritePrompts'

/**
 * POST - Generate a single sprite or batch of sprites
 */
export async function POST(request: NextRequest) {
  try {
    const client = createLeonardoClient()

    if (!client) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'LEONARDO_API_KEY not configured',
          instructions: 'Set LEONARDO_API_KEY in your .env.local file'
        },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { 
      spriteKey, 
      category, 
      batchType, 
      numVariations = 1,
      scale = 4 
    } = body

    let sprites: SpritePrompt[] = []

    // Determine which sprites to generate
    if (spriteKey) {
      // Single sprite
      const sprite = getSpritePromptByKey(spriteKey)
      if (!sprite) {
        return NextResponse.json(
          {
            success: false,
            error: `Unknown sprite key: ${spriteKey}`,
            availableKeys: getAllSpritePrompts().map((s) => s.key),
          },
          { status: 400 }
        )
      }
      sprites = [sprite]
    } else if (category) {
      // All sprites in a category
      sprites = getSpritesByCategory(category)
      if (sprites.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Unknown category: ${category}`,
            availableCategories: ['defender', 'runner', 'powerup', 'field', 'ui', 'background'],
          },
          { status: 400 }
        )
      }
    } else if (batchType) {
      // Predefined batch
      sprites = getSpriteBatch(batchType)
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Provide spriteKey, category, or batchType',
          examples: {
            single: { spriteKey: 'defender-player' },
            category: { category: 'defender' },
            batch: { batchType: 'minimal' },
          },
        },
        { status: 400 }
      )
    }

    // Start generations for all sprites
    const generations = await Promise.all(
      sprites.map(async (sprite) => {
        try {
          const generationId = await client.generateImages({
            prompt: sprite.prompt,
            negativePrompt: sprite.negativePrompt,
            width: Math.min(1024, sprite.width * scale),
            height: Math.min(1024, sprite.height * scale),
            numImages: Math.min(numVariations, 4),
          })

          return {
            key: sprite.key,
            name: sprite.name,
            generationId,
            targetSize: { width: sprite.width, height: sprite.height },
            description: sprite.description,
            status: 'pending',
          }
        } catch (error) {
          return {
            key: sprite.key,
            name: sprite.name,
            error: error instanceof Error ? error.message : 'Generation failed',
            status: 'failed',
          }
        }
      })
    )

    const successCount = generations.filter(g => g.status === 'pending').length
    const failCount = generations.filter(g => g.status === 'failed').length

    return NextResponse.json({
      success: true,
      message: `Started ${successCount} sprite generation(s)${failCount > 0 ? `, ${failCount} failed` : ''}`,
      generations,
      pollEndpoint: '/api/leonardo/status/{generationId}',
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET - List available sprite prompts
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const batchType = searchParams.get('batch') as 'minimal' | 'standard' | 'complete' | null

  let sprites: SpritePrompt[]

  if (category) {
    sprites = getSpritesByCategory(category as SpritePrompt['category'])
  } else if (batchType) {
    sprites = getSpriteBatch(batchType)
  } else {
    sprites = getAllSpritePrompts()
  }

  // Group by category for easier browsing
  const grouped = sprites.reduce((acc, sprite) => {
    if (!acc[sprite.category]) {
      acc[sprite.category] = []
    }
    acc[sprite.category].push({
      key: sprite.key,
      name: sprite.name,
      description: sprite.description,
      size: { width: sprite.width, height: sprite.height },
      frameCount: sprite.frameCount,
    })
    return acc
  }, {} as Record<string, Array<{ key: string; name: string; description: string; size: { width: number; height: number }; frameCount?: number }>>)

  return NextResponse.json({
    success: true,
    apiAvailable: isLeonardoAvailable(),
    totalSprites: sprites.length,
    categories: Object.keys(grouped),
    batches: {
      minimal: getSpriteBatch('minimal').length,
      standard: getSpriteBatch('standard').length,
      complete: getSpriteBatch('complete').length,
    },
    sprites: grouped,
  })
}
