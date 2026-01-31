import { NextRequest, NextResponse } from 'next/server'
import { createLeonardoClient } from '@/src/lib/leonardo'

// Disable caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageId, generationId: genId } = body

    // Need either a Leonardo generated image ID or generation ID
    if (!imageId && !genId) {
      return NextResponse.json(
        { success: false, error: 'Missing imageId or generationId from Leonardo generation' },
        { status: 400 }
      )
    }

    const client = createLeonardoClient()
    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Leonardo API not configured' },
        { status: 500 }
      )
    }

    let targetImageId = imageId

    // If we only have generation ID, get the first image from that generation
    if (!targetImageId && genId) {
      console.log(`[Remove BG] Getting images from generation: ${genId}`)
      const result = await client.getGeneration(genId)
      if (result.generations_by_pk.generated_images.length > 0) {
        targetImageId = result.generations_by_pk.generated_images[0].id
      } else {
        return NextResponse.json(
          { success: false, error: 'No images found in generation' },
          { status: 400 }
        )
      }
    }

    console.log(`[Remove BG] Removing background from image: ${targetImageId}`)

    // Remove background using Leonardo's nobg endpoint
    const generationId = await client.removeBackground(targetImageId)
    console.log(`[Remove BG] Generation started: ${generationId}`)

    return NextResponse.json({
      success: true,
      generationId,
      originalImageId: targetImageId,
    })
  } catch (error) {
    console.error('Remove background error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to remove background' 
      },
      { status: 500 }
    )
  }
}
