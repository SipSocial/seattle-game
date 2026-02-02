/**
 * Stadium Field Background Generator
 * 
 * Generates top-down aerial view of stadium fields via Leonardo AI
 * These are tall portrait images (342x1024) that get scaled to 400x1200
 * and scroll with the gameplay camera.
 */

import { NextRequest, NextResponse } from 'next/server'
import { STADIUM_FIELD_PROMPTS, GENERATED_ASSETS } from '@/src/game/data/campaignAssets'

const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY
const LEONARDO_API_URL = 'https://cloud.leonardo.ai/api/rest/v1'

// Phoenix model for photorealistic results
const MODEL_ID = 'de7d3faf-762f-48e0-b3b7-9d0ac3a3fcf3'

export async function POST(request: NextRequest) {
  try {
    const { city } = await request.json()
    
    if (!city) {
      return NextResponse.json({ error: 'City name required' }, { status: 400 })
    }
    
    const prompt = STADIUM_FIELD_PROMPTS[city as keyof typeof STADIUM_FIELD_PROMPTS]
    if (!prompt) {
      return NextResponse.json({ 
        error: `No stadium prompt found for city: ${city}`,
        availableCities: Object.keys(STADIUM_FIELD_PROMPTS)
      }, { status: 400 })
    }
    
    if (!LEONARDO_API_KEY) {
      return NextResponse.json({ error: 'Leonardo API key not configured' }, { status: 500 })
    }
    
    // Start generation
    // Use 344x1024 (both divisible by 8) - scales to 400x1200 (1:3 ratio approximately)
    const response = await fetch(`${LEONARDO_API_URL}/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LEONARDO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        negative_prompt: 'blurry, low quality, distorted, text, watermark, logo, players, people, human figures, anime, cartoon, 3D render',
        modelId: MODEL_ID,
        width: 344,
        height: 1024,
        num_images: 4,
        guidance_scale: 7,
      }),
    })
    
    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ 
        error: 'Leonardo API error', 
        details: error 
      }, { status: response.status })
    }
    
    const data = await response.json()
    const generationId = data.sdGenerationJob?.generationId
    
    if (!generationId) {
      return NextResponse.json({ 
        error: 'No generation ID returned',
        response: data
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      generationId,
      city,
      prompt,
      message: 'Generation started. Poll /api/v3/stadium-field/[generationId] for results.',
    })
    
  } catch (error) {
    console.error('Stadium field generation error:', error)
    return NextResponse.json({ 
      error: 'Failed to start generation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  // Return current stadium field assets and available cities
  return NextResponse.json({
    stadiumFields: GENERATED_ASSETS.stadiumFields || {},
    availableCities: Object.keys(STADIUM_FIELD_PROMPTS),
    prompts: STADIUM_FIELD_PROMPTS,
  })
}
