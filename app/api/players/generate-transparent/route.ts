import { NextRequest, NextResponse } from 'next/server'
import { createLeonardoClient, MODELS } from '@/src/lib/leonardo'

// Disable caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Optimized prompt for transparent PNG generation - PHOTOREALISTIC style
function getTransparentPlayerPrompt(jersey: number, name: string, position: string): string {
  return `Photorealistic 3D render of NFL football player, Seattle Seahawks #${jersey} ${position}, FULL BODY visible from head to feet, wearing Seattle Seahawks navy blue jersey with number ${jersey} clearly visible, Action Green #69BE28 accents, Seahawks helmet with chrome facemask, muscular athletic build, dynamic confident stance, dramatic rim lighting from behind, studio lighting, isolated subject on plain transparent background, Madden NFL 25 game quality, 8K ultra detailed, professional sports photography, sharp focus, clean edges for cutout`
}

const TRANSPARENT_NEGATIVE_PROMPT = 'background, environment, stadium, field, sky, crowds, ground, floor, shadows on ground, blurry, low quality, distorted, text, watermark, multiple people, cropped, partial body, cartoon, anime, illustration, painting'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jersey, name, position, numImages = 4 } = body

    if (jersey === undefined || !name || !position) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: jersey, name, position' },
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

    const prompt = getTransparentPlayerPrompt(jersey, name, position)
    console.log(`[Transparent Gen] Generating ${name} #${jersey}`)
    console.log(`[Transparent Gen] Prompt: ${prompt}`)

    // Use Phoenix for photorealistic quality with transparency
    const generationId = await client.generateImages({
      prompt,
      negativePrompt: TRANSPARENT_NEGATIVE_PROMPT,
      modelId: MODELS.PHOENIX,
      width: 768,
      height: 1024,
      numImages: Math.min(4, Math.max(1, numImages)),
      guidance: 8,
      transparency: true, // Native transparent PNG
    })

    return NextResponse.json({
      success: true,
      generationId,
      playerName: name,
      jersey,
      position,
      prompt,
      transparent: true,
    })
  } catch (error) {
    console.error('Transparent generation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Generation failed' 
      },
      { status: 500 }
    )
  }
}
