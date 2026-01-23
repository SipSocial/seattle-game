import { NextRequest, NextResponse } from 'next/server'
import { createLeonardoClient } from '@/src/lib/leonardo'
import { getSpritePromptByKey, getAllSpritePrompts } from '@/src/lib/spritePrompts'

export async function POST(request: NextRequest) {
  try {
    const client = createLeonardoClient()

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'LEONARDO_API_KEY not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { spriteKey, numVariations = 1 } = body

    if (!spriteKey) {
      return NextResponse.json(
        { success: false, error: 'spriteKey is required' },
        { status: 400 }
      )
    }

    const spritePrompt = getSpritePromptByKey(spriteKey)

    if (!spritePrompt) {
      return NextResponse.json(
        {
          success: false,
          error: `Unknown sprite key: ${spriteKey}`,
          availableKeys: getAllSpritePrompts().map((s) => s.key),
        },
        { status: 400 }
      )
    }

    // Start generation
    const generationId = await client.generateImages({
      prompt: spritePrompt.prompt,
      width: spritePrompt.width * 4, // Generate at 4x for quality, downscale later
      height: spritePrompt.height * 4,
      numImages: Math.min(numVariations, 4), // Max 4 variations
    })

    return NextResponse.json({
      success: true,
      generationId,
      sprite: {
        name: spritePrompt.name,
        key: spritePrompt.key,
        targetSize: { width: spritePrompt.width, height: spritePrompt.height },
        description: spritePrompt.description,
      },
      message: 'Sprite generation started. Poll /api/leonardo/status/{generationId} for results.',
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

export async function GET() {
  // Return list of available sprite prompts
  const sprites = getAllSpritePrompts()

  return NextResponse.json({
    success: true,
    sprites: sprites.map((s) => ({
      key: s.key,
      name: s.name,
      description: s.description,
      size: { width: s.width, height: s.height },
      frameCount: s.frameCount,
    })),
  })
}
