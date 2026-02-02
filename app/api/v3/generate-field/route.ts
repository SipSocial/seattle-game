/**
 * V3 Field Background Generation API
 * 
 * Generates 9:16 portrait field backgrounds using Leonardo AI
 */

import { NextRequest, NextResponse } from 'next/server'
import { createLeonardoClient } from '@/src/lib/leonardo'

// Field prompt templates
const FIELD_PROMPTS = {
  'night': `NFL football field at night, 9:16 portrait orientation vertical view,
dark dramatic atmosphere, stadium lights creating powerful beams through billowing fog,
wet grass reflecting light, 50 yard line visible,
deep shadows, moody blue and navy tones,
neon green accents from field lighting,
professional broadcast quality, 8K photorealistic,
no players, no people, empty dramatic field,
volumetric lighting, cinematic depth`,

  'rain': `NFL football field during night rain storm, 9:16 portrait orientation vertical view,
rain droplets visible in stadium lights, puddles on turf reflecting lights,
dramatic wet conditions, fog mixing with rain,
dark navy sky, stadium lights piercing through,
neon green field paint glowing wet,
professional broadcast quality, 8K photorealistic,
no players, no people, empty atmospheric field`,

  'snow': `NFL football field during light snow at night, 9:16 portrait orientation vertical view,
light snow dusting on the field, snowflakes visible in stadium lights,
cold winter atmosphere, breath would be visible,
dark blue tones, warm stadium lights contrast,
neon green field markings visible through snow,
professional broadcast quality, 8K photorealistic,
no players, no people, winter football atmosphere`,
}

const FIELD_NEGATIVE = 'players, people, crowd, spectators, cartoon, anime, illustration, low quality, blurry, text, watermark, logos, advertisements, scoreboards, jumbotron'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { weather = 'night' } = body

    const prompt = FIELD_PROMPTS[weather as keyof typeof FIELD_PROMPTS]
    if (!prompt) {
      return NextResponse.json(
        { error: `Invalid weather type. Use: ${Object.keys(FIELD_PROMPTS).join(', ')}` },
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

    // Generate 9:16 portrait field (1080x1920 equivalent aspect ratio)
    const generationId = await client.generateImages({
      prompt,
      negativePrompt: FIELD_NEGATIVE,
      modelId: 'de7d3faf-762f-48e0-b3b7-9d27a9f1f6f6', // Phoenix 1.0
      width: 576,
      height: 1024,
      numImages: 4,
      guidance: 7,
    })

    return NextResponse.json({
      success: true,
      generationId,
      weather,
      message: `Started field generation for ${weather} conditions`,
    })
  } catch (error) {
    console.error('Error generating field background:', error)
    return NextResponse.json(
      { error: 'Failed to generate field', details: String(error) },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    availableWeathers: Object.keys(FIELD_PROMPTS),
    recommendedSize: '576x1024 (9:16)',
    description: 'Generate dramatic 9:16 portrait football field backgrounds',
  })
}
