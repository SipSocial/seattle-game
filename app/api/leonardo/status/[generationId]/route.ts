import { NextRequest, NextResponse } from 'next/server'
import { createLeonardoClient } from '@/src/lib/leonardo'

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

    const status = result.generations_by_pk.status
    const images = result.generations_by_pk.generated_images.map((img) => ({
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
