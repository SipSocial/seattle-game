import { NextRequest, NextResponse } from 'next/server'
import { createLeonardoClient } from '@/src/lib/leonardo'

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
    const { prompt, width = 512, height = 512, numImages = 1 } = body

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Start generation
    const generationId = await client.generateImages({
      prompt,
      width,
      height,
      numImages,
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
