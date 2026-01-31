import { NextRequest, NextResponse } from 'next/server'

// Disable caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

const LEONARDO_API_URL = 'https://cloud.leonardo.ai/api/rest/v1'

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const apiKey = process.env.LEONARDO_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'LEONARDO_API_KEY not configured' },
        { status: 500 }
      )
    }

    const { jobId } = params
    
    const response = await fetch(
      `${LEONARDO_API_URL}/variations/${jobId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        { success: false, error: `Leonardo API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const variation = data.generated_image_variation_generic?.[0]

    if (!variation) {
      return NextResponse.json({
        success: true,
        status: 'PENDING',
        complete: false,
        url: null,
      })
    }

    return NextResponse.json({
      success: true,
      status: variation.status,
      complete: variation.status === 'COMPLETE',
      url: variation.url,
      transformType: variation.transformType,
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
