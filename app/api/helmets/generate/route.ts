import { NextRequest, NextResponse } from 'next/server'
import { createLeonardoClient, MODELS } from '@/src/lib/leonardo'
import { TEAM_ASSETS } from '@/src/game/data/teamAssets'

/**
 * Generate photo-realistic helmet images for opponent teams
 * POST /api/helmets/generate
 * Body: { teamId?: number } - If provided, generates for that team only. Otherwise generates all.
 */
export async function POST(request: NextRequest) {
  try {
    const client = createLeonardoClient()

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'LEONARDO_API_KEY not configured' },
        { status: 500 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { teamId } = body

    // Get teams to generate
    const teamsToGenerate = teamId 
      ? [TEAM_ASSETS[teamId]].filter(Boolean)
      : Object.values(TEAM_ASSETS)

    if (teamsToGenerate.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No teams found' },
        { status: 400 }
      )
    }

    // De-duplicate teams (some appear multiple times in schedule)
    const uniqueTeams = new Map()
    teamsToGenerate.forEach(team => {
      if (!uniqueTeams.has(team.abbreviation)) {
        uniqueTeams.set(team.abbreviation, team)
      }
    })

    const generations: Array<{ team: string; abbreviation: string; generationId: string }> = []

    // Generate helmets for each unique team
    for (const team of uniqueTeams.values()) {
      const prompt = `Photorealistic 3D render of an NFL football helmet, 
        ${team.teamName} team colors, 
        primary color ${team.jerseyColor}, 
        glossy surface with reflections, 
        professional studio lighting, 
        dramatic angle showing front-side view, 
        black background with subtle gradient,
        highly detailed facemask in grey chrome,
        professional sports photography quality,
        8K UHD, hyperrealistic render`

      const negativePrompt = `logo, text, watermark, blurry, low quality, cartoon, 
        anime, illustration, 2D, flat, distorted, deformed, ugly`

      const generationId = await client.generateImages({
        prompt,
        negativePrompt,
        modelId: MODELS.PHOENIX, // Best for photorealistic
        width: 768,
        height: 768,
        numImages: 4, // Generate 4 options per team
        guidance: 8,
      })

      generations.push({
        team: team.teamName,
        abbreviation: team.abbreviation,
        generationId,
      })

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    return NextResponse.json({
      success: true,
      message: `Started ${generations.length} helmet generations`,
      generations,
      previewUrl: '/helmets/preview',
    })
  } catch (error) {
    console.error('Helmet generation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Get the list of teams that need helmet generation
 */
export async function GET() {
  const teams = Object.values(TEAM_ASSETS)
  
  // De-duplicate
  const uniqueTeams = new Map()
  teams.forEach(team => {
    if (!uniqueTeams.has(team.abbreviation)) {
      uniqueTeams.set(team.abbreviation, {
        id: team.id,
        teamName: team.teamName,
        abbreviation: team.abbreviation,
        primaryColor: team.primaryColor.toString(16).padStart(6, '0'),
        accentColor: team.accentColor.toString(16).padStart(6, '0'),
        jerseyColor: team.jerseyColor,
        currentHelmetImage: team.helmetImage,
      })
    }
  })

  return NextResponse.json({
    success: true,
    teams: Array.from(uniqueTeams.values()),
    totalUnique: uniqueTeams.size,
  })
}
