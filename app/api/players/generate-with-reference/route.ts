import { NextRequest, NextResponse } from 'next/server'
import { createLeonardoClient, MODELS, CONTROLNET_IDS } from '@/src/lib/leonardo'
import { getPlayerReference, generateAccuratePlayerPrompt, PLAYER_NEGATIVE_PROMPT } from '@/src/game/data/playerReferences'

/**
 * POST /api/players/generate-with-reference
 * 
 * Generate accurate player images using a reference photo
 * Uses Leonardo AI Character Reference for facial/body likeness
 * 
 * Body:
 * - jersey: number - Player jersey number
 * - referenceImageUrl: string - URL of reference photo (headshot or body shot)
 * - style: 'fullscreen' | 'card' | 'action' - Generation style
 * - numImages: number - Number of variations (1-4)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      jersey, 
      referenceImageUrl, 
      style = 'fullscreen',
      numImages = 4 
    } = body

    if (!jersey) {
      return NextResponse.json(
        { error: 'Missing required field: jersey' },
        { status: 400 }
      )
    }

    if (!referenceImageUrl) {
      return NextResponse.json(
        { error: 'Missing required field: referenceImageUrl' },
        { status: 400 }
      )
    }

    // Get player reference data
    const player = getPlayerReference(jersey)
    if (!player) {
      return NextResponse.json(
        { error: `Player with jersey #${jersey} not found` },
        { status: 404 }
      )
    }

    const client = createLeonardoClient()
    if (!client) {
      return NextResponse.json(
        { error: 'Leonardo API key not configured' },
        { status: 500 }
      )
    }

    // Step 1: Upload reference image to Leonardo
    console.log(`Uploading reference image for ${player.name}...`)
    const referenceImageId = await client.uploadImageFromUrl(referenceImageUrl)
    console.log(`Reference image uploaded with ID: ${referenceImageId}`)

    // Step 2: Generate prompt with physical attributes and unique pose
    const prompt = generateAccuratePlayerPrompt(player)
    console.log(`Generated prompt: ${prompt}`)

    // Step 3: Generate with Character Reference
    const generationId = await client.generateWithReference({
      prompt,
      negativePrompt: PLAYER_NEGATIVE_PROMPT,
      modelId: MODELS.KINO_XL,
      width: style === 'fullscreen' ? 768 : 512,
      height: style === 'fullscreen' ? 1024 : 768,
      numImages: Math.min(4, Math.max(1, numImages)),
      guidance: 8,
      controlnets: [
        {
          initImageId: referenceImageId,
          initImageType: 'UPLOADED',
          preprocessorId: CONTROLNET_IDS.CHARACTER_REFERENCE,
          strengthType: 'High', // High strength for best likeness
        },
      ],
    })

    return NextResponse.json({
      success: true,
      generationId,
      player: {
        jersey: player.jersey,
        name: player.name,
        position: player.position,
        height: player.height,
        weight: player.weight,
        build: player.build,
      },
      referenceImageId,
      prompt,
    })
  } catch (error) {
    console.error('Error generating player with reference:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    )
  }
}
