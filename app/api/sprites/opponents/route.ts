import { NextRequest, NextResponse } from 'next/server'
import { createLeonardoClient, isLeonardoAvailable, MODELS } from '../../../../src/lib/leonardo'
import { getOpponentFacePrompt, getAllOpponentFacePrompts, OpponentFacePrompt } from '../../../../src/lib/spritePrompts'

/**
 * POST /api/sprites/opponents
 * Generate opponent face sprite for a specific stage/team
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { stageId, teamName } = body

    if (!stageId && !teamName) {
      return NextResponse.json(
        { error: 'stageId or teamName is required' },
        { status: 400 }
      )
    }

    let facePrompt: OpponentFacePrompt | undefined

    if (stageId) {
      facePrompt = getOpponentFacePrompt(stageId)
    } else if (teamName) {
      facePrompt = getAllOpponentFacePrompts().find(
        f => f.teamName.toLowerCase().includes(teamName.toLowerCase())
      )
    }

    if (!facePrompt) {
      return NextResponse.json(
        { error: `No opponent face found for stageId: ${stageId} or teamName: ${teamName}` },
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

    // Start generation with sprite-optimized settings
    const generationId = await client.generateImages({
      prompt: facePrompt.prompt,
      negativePrompt: facePrompt.negativePrompt,
      modelId: MODELS.CREATIVE,
      width: Math.min(512, facePrompt.width * 4), // Scale up for quality
      height: Math.min(512, facePrompt.height * 4),
      numImages: 1,
      guidance: 8, // Higher guidance for more prompt adherence
    })

    return NextResponse.json({
      success: true,
      generationId,
      key: facePrompt.key,
      teamName: facePrompt.teamName,
      teamId: facePrompt.teamId,
      dimensions: {
        width: facePrompt.width,
        height: facePrompt.height,
      },
      message: 'Opponent face generation started. Poll /api/leonardo/status/[generationId] for results.',
    })
  } catch (error) {
    console.error('Opponent face generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/sprites/opponents
 * List all available opponent face prompts
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const stageId = searchParams.get('stageId')

  if (stageId) {
    const facePrompt = getOpponentFacePrompt(parseInt(stageId))
    if (!facePrompt) {
      return NextResponse.json(
        { error: `No opponent face found for stageId: ${stageId}` },
        { status: 404 }
      )
    }
    return NextResponse.json({
      face: {
        key: facePrompt.key,
        teamName: facePrompt.teamName,
        teamId: facePrompt.teamId,
        primaryColor: facePrompt.primaryColor,
        accentColor: facePrompt.accentColor,
        dimensions: {
          width: facePrompt.width,
          height: facePrompt.height,
        },
        promptPreview: facePrompt.prompt.substring(0, 100) + '...',
      },
    })
  }

  const allFaces = getAllOpponentFacePrompts().map(f => ({
    key: f.key,
    teamName: f.teamName,
    teamId: f.teamId,
    primaryColor: f.primaryColor,
    accentColor: f.accentColor,
    dimensions: {
      width: f.width,
      height: f.height,
    },
  }))

  return NextResponse.json({
    faces: allFaces,
    totalTeams: allFaces.length,
    apiAvailable: isLeonardoAvailable(),
  })
}
