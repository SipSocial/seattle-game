/**
 * V3 Dark Side Uniform Generation API
 * 
 * Generates player sprites in Dark Side uniforms using Leonardo AI
 */

import { NextRequest, NextResponse } from 'next/server'
import { createLeonardoClient } from '@/src/lib/leonardo'
import { 
  OFFENSE_PLAYER_PHYSICALS, 
  generateDarkSideOffensePrompt,
  getOffensePlayerPhysical,
} from '@/src/v3/lib/offensePlayerData'
import { PLAYER_REFERENCES, getPlayerReference } from '@/src/game/data/playerReferences'

// Dark Side uniform negative prompt
const DARK_SIDE_NEGATIVE = 'logos, team names, Seahawks, NFL logo, wordmarks, busy background, cartoon style, low quality, blurry, text, watermark, multiple people, crowd, stadium background'

// Defense player Dark Side prompt template
function generateDarkSideDefensePrompt(jersey: number): string {
  const ref = getPlayerReference(jersey)
  if (!ref) return ''
  
  return `Full body NFL ${ref.position} number ${jersey} in athletic ${ref.poseStyle},
${ref.physicalDescription},
helmet on with dark tinted visor down,
matte black satin jersey with subtle charcoal grey number ${jersey} barely visible,
no logos no team marks no wordmarks,
thin neon green accent stripe on shoulder seam and pants side stripe,
matte black helmet with dark grey facemask,
black gloves, black cleats,
photorealistic 3D render Madden NFL 25 quality,
flat neutral studio lighting for sprite extraction,
solid light grey background #E0E0E0 for easy removal,
full body visible from helmet to cleats centered in frame,
1536px height minimum,
8K photorealistic quality`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jerseys, type = 'offense' } = body

    if (!jerseys || !Array.isArray(jerseys) || jerseys.length === 0) {
      return NextResponse.json(
        { error: 'jerseys array is required' },
        { status: 400 }
      )
    }

    const client = createLeonardoClient()
    
    if (!client) {
      return NextResponse.json(
        { error: 'Leonardo API key not configured' },
        { status: 500 }
      )
    }
    
    const results: { jersey: number; generationId: string; prompt: string }[] = []

    for (const jersey of jerseys) {
      let prompt = ''
      
      if (type === 'offense') {
        const player = getOffensePlayerPhysical(jersey)
        if (!player) {
          console.warn(`No offensive player found for jersey ${jersey}`)
          continue
        }
        prompt = generateDarkSideOffensePrompt(player)
      } else {
        prompt = generateDarkSideDefensePrompt(jersey)
        if (!prompt) {
          console.warn(`No defensive player found for jersey ${jersey}`)
          continue
        }
      }

      // Generate with Phoenix model for photorealistic quality
      const generationId = await client.generateImages({
        prompt,
        negativePrompt: DARK_SIDE_NEGATIVE,
        modelId: 'de7d3faf-762f-48e0-b3b7-9d27a9f1f6f6', // Phoenix 1.0
        width: 768,
        height: 1024,
        numImages: 4, // Generate 4 variants
        guidance: 7,
      })

      results.push({ jersey, generationId, prompt })
    }

    return NextResponse.json({
      success: true,
      generations: results,
      message: `Started generation for ${results.length} players`,
    })
  } catch (error) {
    console.error('Error generating Dark Side uniforms:', error)
    return NextResponse.json(
      { error: 'Failed to generate uniforms', details: String(error) },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Return available players for generation
  const offensePlayers = OFFENSE_PLAYER_PHYSICALS.map(p => ({
    jersey: p.jersey,
    name: p.name,
    position: p.position,
    type: 'offense',
  }))

  const defensePlayers = PLAYER_REFERENCES.map(p => ({
    jersey: p.jersey,
    name: p.name,
    position: p.position,
    type: 'defense',
  }))

  return NextResponse.json({
    offense: offensePlayers,
    defense: defensePlayers,
    total: offensePlayers.length + defensePlayers.length,
  })
}
