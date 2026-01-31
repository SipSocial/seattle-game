import { NextRequest, NextResponse } from 'next/server'
import { createLeonardoClient } from '@/src/lib/leonardo'

// Disable caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface SelectedSprite {
  playerId: string
  playerName: string
  imageUrl: string
  imageId: string
}

// Extract generation ID from Leonardo CDN URL
function extractGenerationId(url: string): string | null {
  const match = url.match(/generations\/([a-f0-9-]+)\//)
  return match ? match[1] : null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sprites } = body as { sprites: SelectedSprite[] }

    if (!sprites || sprites.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No sprites provided' },
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

    const results = []

    for (const sprite of sprites) {
      try {
        // Extract generation ID from URL
        const generationId = extractGenerationId(sprite.imageUrl)
        if (!generationId) {
          results.push({
            playerId: sprite.playerId,
            playerName: sprite.playerName,
            success: false,
            error: 'Could not extract generation ID from URL'
          })
          continue
        }

        console.log(`[Batch Remove BG] Processing ${sprite.playerName} (gen: ${generationId})`)

        // Get the actual image ID from the generation
        const genResult = await client.getGeneration(generationId)
        if (genResult.generations_by_pk.generated_images.length === 0) {
          results.push({
            playerId: sprite.playerId,
            playerName: sprite.playerName,
            success: false,
            error: 'No images in generation'
          })
          continue
        }

        // Find the matching image or use first one
        const imageId = genResult.generations_by_pk.generated_images[0].id

        // Remove background
        const jobId = await client.removeBackground(imageId)
        console.log(`[Batch Remove BG] Started job ${jobId} for ${sprite.playerName}`)

        results.push({
          playerId: sprite.playerId,
          playerName: sprite.playerName,
          success: true,
          jobId,
          originalUrl: sprite.imageUrl,
        })

        // Small delay between requests to avoid rate limiting
        await new Promise(r => setTimeout(r, 500))

      } catch (error) {
        console.error(`Error processing ${sprite.playerName}:`, error)
        results.push({
          playerId: sprite.playerId,
          playerName: sprite.playerName,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Started background removal for ${results.filter(r => r.success).length}/${sprites.length} sprites`
    })
  } catch (error) {
    console.error('Batch remove background error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process batch' 
      },
      { status: 500 }
    )
  }
}
