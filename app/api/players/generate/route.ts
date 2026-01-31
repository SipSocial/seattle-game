import { NextRequest, NextResponse } from 'next/server'
import { createLeonardoClient, MODELS } from '@/src/lib/leonardo'
import { FULL_ROSTER, STARTERS, type Defender } from '@/src/game/data/roster'
import { OFFENSE_ROSTER, type OffensivePlayer } from '@/src/game/data/offenseRoster'

import { getPlayerReference, generateAccuratePlayerPrompt, PLAYER_NEGATIVE_PROMPT as ACCURATE_NEGATIVE } from '@/src/game/data/playerReferences'

/**
 * Realistic 3D Madden-style prompts for player generation
 * UPDATED: Matches the original good DeMarcus Lawrence style
 * - Full body visible (not too zoomed in)
 * - Dramatic dark stadium background
 * - Unique poses per player/position
 * - Proportional to actual player physique
 */
function getDefenderPrompt(player: Defender, style: 'card' | 'sprite' | 'action' | 'fullscreen'): string {
  // Try to get accurate reference data for this player
  const ref = getPlayerReference(player.jersey)
  
  if (ref && style === 'fullscreen') {
    // Use the accurate prompt with proper physical description and unique pose
    return generateAccuratePlayerPrompt(ref)
  }
  
  // Fallback prompts for players without reference data
  const positionPose: Record<string, string> = {
    DL: 'defensive lineman powerful stance ready to rush, muscular powerful build, weight forward',
    LB: 'linebacker athletic stance, hands ready, reading the play, balanced posture',
    DB: 'defensive back coverage stance, agile athletic build, long arms extended'
  }
  
  const pose = positionPose[player.positionGroup] || positionPose.DL
  
  const stylePrompts = {
    // Fullscreen - UPDATED: Less zoomed, full body visible, dramatic stadium
    fullscreen: `Photorealistic 3D render of NFL football player, Seattle Seahawks #${player.jersey} ${player.position}, ${pose}, wearing Seattle Seahawks navy blue jersey with number ${player.jersey} clearly visible, Action Green #69BE28 accents, Seahawks helmet with chrome facemask, FULL BODY visible from head to knees, dramatic dark NFL stadium at night, volumetric fog and atmospheric lighting, stadium spotlights creating rim lighting behind player, moody cinematic atmosphere, Madden NFL 25 game quality, 8K ultra detailed, professional sports photography composition, player centered with space around them, NOT too zoomed in`,
    
    card: `Photorealistic 3D render, Seattle Seahawks NFL defensive player #${player.jersey}, full body shot, ${pose}, wearing navy blue jersey number ${player.jersey}, Seahawks helmet chrome facemask, dark dramatic stadium background, volumetric fog, dramatic rim lighting, Madden NFL 25 quality, 8K detail, Action Green #69BE28 accents`,
    
    sprite: `Seattle Seahawks player #${player.jersey}, top-down 3/4 isometric view, ${pose}, navy helmet green accents, clean silhouette, transparent background, game asset style`,
    
    action: `Seattle Seahawks #${player.jersey}, ${player.positionGroup === 'DL' ? 'quarterback sack' : player.positionGroup === 'LB' ? 'tackling' : 'intercepting'}, dynamic action, stadium lights, dramatic lighting, Madden NFL screenshot quality`
  }
  
  return stylePrompts[style]
}

function getOffensivePrompt(player: OffensivePlayer, style: 'card' | 'sprite' | 'action'): string {
  const basePrompt = `Photorealistic 3D render of NFL football player, Seattle Seahawks offensive player`
  
  const poseByPosition = {
    QB: 'throwing football downfield, arm cocked back',
    RB: 'running with football tucked, explosive burst',
    WR: 'catching football with extended arms',
    TE: 'blocking stance or catching ball',
    FB: 'lead blocking position',
    OL: 'pass protection stance'
  }
  
  const stylePrompts = {
    card: `${basePrompt}, wearing white away jersey number ${player.jersey} with Action Green #69BE28 accents, large visible jersey number, Seahawks helmet, athletic build, ${poseByPosition[player.position] || 'athletic stance'}, professional studio lighting, grey-blue gradient background, full body shot, Madden NFL 25 game quality, 8K detail`,
    
    sprite: `${basePrompt}, white jersey number ${player.jersey}, top-down 3/4 isometric view, ${player.position === 'QB' ? 'quarterback drop back pose' : player.position === 'WR' ? 'receiver running route' : 'running with ball'}, clean silhouette, transparent background, game asset`,
    
    action: `${basePrompt}, jersey ${player.jersey}, ${poseByPosition[player.position] || 'in motion'}, dynamic action, stadium atmosphere, dramatic lighting, Madden NFL screenshot quality`
  }
  
  return stylePrompts[style]
}

const NEGATIVE_PROMPT = 'cartoon, anime, pixar, stylized, low quality, blurry, distorted, text, watermark, logo, 2D, flat, illustration, drawing, painting, unrealistic proportions, wrong colors, orange, purple, incorrect jersey, wrong number, too zoomed in, cropped, close-up face only, headshot only'

export async function GET() {
  // Return list of players available for generation
  const defenders = STARTERS.map(p => ({
    id: `def-${p.jersey}`,
    jersey: p.jersey,
    name: p.name,
    position: p.position,
    positionGroup: p.positionGroup,
    type: 'defender',
    isStarter: p.isStarter,
    stats: p.stats2025
  }))
  
  const offense = OFFENSE_ROSTER.filter(p => p.isStarter && p.positionGroup !== 'OL').map(p => ({
    id: `off-${p.jersey}`,
    jersey: p.jersey,
    name: p.name,
    position: p.position,
    positionGroup: p.positionGroup,
    type: 'offense',
    isStarter: p.isStarter,
    stats: p.stats2025
  }))
  
  return NextResponse.json({
    success: true,
    defenders,
    offense,
    styles: ['card', 'sprite', 'action'],
    totalPlayers: defenders.length + offense.length
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { playerId, style = 'card', numVariations = 4 } = body
    
    if (!playerId) {
      return NextResponse.json({ success: false, error: 'Player ID required' }, { status: 400 })
    }
    
    const client = createLeonardoClient()
    if (!client) {
      return NextResponse.json({ success: false, error: 'Leonardo API not configured' }, { status: 500 })
    }
    
    // Find the player
    let prompt: string
    let playerName: string
    
    if (playerId.startsWith('def-')) {
      const jersey = parseInt(playerId.replace('def-', ''))
      const player = FULL_ROSTER.find(p => p.jersey === jersey)
      if (!player) {
        return NextResponse.json({ success: false, error: 'Player not found' }, { status: 404 })
      }
      prompt = getDefenderPrompt(player, style)
      playerName = player.name
    } else if (playerId.startsWith('off-')) {
      const jersey = parseInt(playerId.replace('off-', ''))
      const player = OFFENSE_ROSTER.find(p => p.jersey === jersey)
      if (!player) {
        return NextResponse.json({ success: false, error: 'Player not found' }, { status: 404 })
      }
      prompt = getOffensivePrompt(player, style)
      playerName = player.name
    } else {
      return NextResponse.json({ success: false, error: 'Invalid player ID format' }, { status: 400 })
    }
    
    // Generate multiple variations
    const dimensions = {
      sprite: { width: 512, height: 512 },
      card: { width: 768, height: 1024 },
      action: { width: 1024, height: 768 },
      fullscreen: { width: 768, height: 1344 }, // 9:16 mobile ratio
    }
    const dim = dimensions[style as keyof typeof dimensions] || dimensions.fullscreen
    
    const generationId = await client.generateImages({
      prompt,
      negativePrompt: NEGATIVE_PROMPT,
      modelId: MODELS.PHOENIX, // Leonardo Phoenix 1.0 - Best for photorealistic
      width: dim.width,
      height: dim.height,
      numImages: Math.min(4, numVariations),
      guidance: 8,
    })
    
    return NextResponse.json({
      success: true,
      generationId,
      playerId,
      playerName,
      style,
      prompt // Include for debugging
    })
    
  } catch (error) {
    console.error('Player generation error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Generation failed' 
    }, { status: 500 })
  }
}
