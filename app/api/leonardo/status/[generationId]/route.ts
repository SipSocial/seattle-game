import { NextRequest, NextResponse } from 'next/server'
import { createLeonardoClient } from '@/src/lib/leonardo'

// Disable caching for this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: { generationId: string } }
) {
  try {
    const client = createLeonardoClient()

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'LEONARDO_API_KEY not configured' },
        { status: 500 }
      )
    }

    const { generationId } = params
    const result = await client.getGeneration(generationId)
    
    console.log(`[Status API] Generation ${generationId}:`, JSON.stringify(result, null, 2))

    const status = result.generations_by_pk.status
    // Include all images regardless of NSFW flag (Leonardo flags sports content as NSFW due to "celebrity" detection)
    const images = result.generations_by_pk.generated_images
      .filter((img) => img.url) // Only include images with URLs
      .map((img) => ({
        id: img.id,
        url: img.url,
      }))

    return NextResponse.json({
      success: true,
      status,
      complete: status === 'COMPLETE',
      images: status === 'COMPLETE' ? images : [],
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
