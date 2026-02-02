import { NextRequest, NextResponse } from 'next/server'
import { createLeonardoClient, MODELS } from '@/src/lib/leonardo'

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
    const { 
      prompt, 
      negativePrompt,
      modelId = MODELS.PHOENIX, // Default to Phoenix for photorealistic
      width = 768, 
      height = 1024, 
      numImages = 1,
      guidance = 7,
    } = body

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Start generation with all parameters
    const generationId = await client.generateImages({
      prompt,
      negativePrompt,
      modelId,
      width,
      height,
      numImages,
      guidance,
    })

    return NextResponse.json({
      success: true,
      generationId,
      message: 'Generation started. Use /api/leonardo/status to check progress.',
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
