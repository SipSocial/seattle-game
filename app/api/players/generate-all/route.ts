import { NextResponse } from 'next/server'
import { createLeonardoClient, MODELS } from '@/src/lib/leonardo'
import { STARTERS, type Defender } from '@/src/game/data/roster'

/**
 * Generate fullscreen images for all starters
 * GET: Check status of ongoing generations
 * POST: Start generating for all starters
 */

// Store generation jobs in memory (would use DB in production)
const generationJobs: Map<string, {
  playerId: string
  playerName: string
  generationId: string
  status: 'pending' | 'complete' | 'failed'
  images: Array<{ id: string; url: string }>
  startedAt: Date
}> = new Map()

function getDefenderPrompt(player: Defender): string {
  const positionPose = {
    DL: 'defensive lineman three-point stance ready to rush, muscular powerful build',
    LB: 'linebacker athletic stance ready to tackle, intense focused expression',
    DB: 'defensive back coverage stance, agile athletic build ready to intercept'
  }
  
  const pose = positionPose[player.positionGroup] || positionPose.DL
  
  return `Photorealistic 3D render, Seattle Seahawks NFL defensive player #${player.jersey}, full body shot, ${pose}, wearing navy blue Seahawks jersey number ${player.jersey} with Action Green #69BE28 accents, Seahawks helmet with chrome facemask and hawk logo, dark dramatic NFL stadium at night, volumetric fog and atmospheric lighting, stadium lights creating dramatic rim lighting, moody cinematic atmosphere, Madden NFL 25 game quality, 8K ultra detailed, professional sports photography, navy blue and green color scheme, player centered in frame, looking intensely at camera through facemask`
}

const NEGATIVE_PROMPT = 'cartoon, anime, pixar, stylized, low quality, blurry, distorted, text, watermark, logo, 2D, flat, illustration, drawing, painting, unrealistic proportions, wrong colors, orange, purple, incorrect jersey, wrong number'

export async function GET() {
  // Return current generation status
  const jobs = Array.from(generationJobs.values())
  
  return NextResponse.json({
    totalStarters: STARTERS.length,
    jobs,
    pending: jobs.filter(j => j.status === 'pending').length,
    complete: jobs.filter(j => j.status === 'complete').length,
    failed: jobs.filter(j => j.status === 'failed').length,
  })
}

export async function POST() {
  const client = createLeonardoClient()
  if (!client) {
    return NextResponse.json({ success: false, error: 'Leonardo API not configured' }, { status: 500 })
  }
  
  const results: Array<{ playerId: string; playerName: string; generationId?: string; error?: string }> = []
  
  // Start generation for each starter (one at a time to avoid rate limits)
  for (const player of STARTERS) {
    const playerId = `def-${player.jersey}`
    
    // Skip if already generating or complete
    const existing = generationJobs.get(playerId)
    if (existing && (existing.status === 'pending' || existing.status === 'complete')) {
      results.push({ playerId, playerName: player.name, generationId: existing.generationId })
      continue
    }
    
    try {
      const prompt = getDefenderPrompt(player)
      
      const generationId = await client.generateImages({
        prompt,
        negativePrompt: NEGATIVE_PROMPT,
        modelId: MODELS.PHOENIX,
        width: 768,
        height: 1344, // 9:16 mobile ratio
        numImages: 4,
        guidance: 8,
      })
      
      generationJobs.set(playerId, {
        playerId,
        playerName: player.name,
        generationId,
        status: 'pending',
        images: [],
        startedAt: new Date()
      })
      
      results.push({ playerId, playerName: player.name, generationId })
      
      // Small delay between requests
      await new Promise(r => setTimeout(r, 1000))
      
    } catch (error) {
      results.push({ 
        playerId, 
        playerName: player.name, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
  }
  
  return NextResponse.json({
    success: true,
    message: `Started generation for ${results.filter(r => r.generationId).length} players`,
    results
  })
}
