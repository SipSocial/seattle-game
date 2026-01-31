import { NextRequest, NextResponse } from 'next/server'
import { createLeonardoClient, isLeonardoAvailable, MODELS } from '../../../../src/lib/leonardo'
import { CAMPAIGN_STAGES } from '../../../../src/game/data/campaign'
import { getBestStagePrompt, getStageBackgroundPrompt } from '../../../../src/lib/stagePrompts'

/**
 * POST /api/backgrounds/generate
 * Generate a background for a specific stage using Leonardo AI
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { stageId, type = 'background' } = body

    if (!stageId || typeof stageId !== 'number') {
      return NextResponse.json(
        { error: 'stageId is required and must be a number' },
        { status: 400 }
      )
    }

    const stage = CAMPAIGN_STAGES.find(s => s.id === stageId)
    if (!stage) {
      return NextResponse.json(
        { error: `Stage ${stageId} not found` },
        { status: 404 }
      )
    }

    if (!isLeonardoAvailable()) {
      return NextResponse.json(
        { error: 'Leonardo API key not configured' },
        { status: 503 }
      )
    }

    const client = createLeonardoClient()
    if (!client) {
      return NextResponse.json(
        { error: 'Failed to create Leonardo client' },
        { status: 500 }
      )
    }

    // Get the prompt for this stage
    const prompt = getBestStagePrompt(stageId)
    const stageAsset = getStageBackgroundPrompt(stage)

    // Start generation
    const generationId = await client.generateImages({
      prompt,
      negativePrompt: stageAsset.negativePrompt,
      modelId: MODELS.CREATIVE,
      width: 512, // Slightly larger than game width for quality
      height: 384,
      numImages: 1,
      guidance: 7,
    })

    return NextResponse.json({
      success: true,
      generationId,
      stageId,
      stageName: stage.name,
      city: stage.location.city,
      message: 'Background generation started. Poll /api/leonardo/status/[generationId] for results.',
    })
  } catch (error) {
    console.error('Background generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/backgrounds/generate
 * Get all stage info for background generation
 */
export async function GET() {
  const stages = CAMPAIGN_STAGES.map(stage => ({
    id: stage.id,
    name: stage.name,
    city: stage.location.city,
    state: stage.location.state,
    skyGradient: stage.visuals.skyGradient,
    weather: stage.visuals.weather.type,
    prompt: getBestStagePrompt(stage.id).substring(0, 100) + '...',
  }))

  return NextResponse.json({
    stages,
    totalStages: CAMPAIGN_STAGES.length,
    apiAvailable: isLeonardoAvailable(),
  })
}
