import { NextRequest, NextResponse } from 'next/server'
import { createLeonardoClient, MODELS } from '@/src/lib/leonardo'
import { FULL_ROSTER, STARTERS, type Defender } from '@/src/game/data/roster'
import { OFFENSE_ROSTER, type OffensivePlayer } from '@/src/game/data/offenseRoster'
import { 
  getAllDarkSidePlayers, 
  generatePromptForPlayer, 
  getPlayerForPrompt,
  DARK_SIDE_NEGATIVE_PROMPT,
  // Helmet generation
  getUniqueOpponentTeams,
  generateHelmetPrompt,
  HELMET_NEGATIVE_PROMPT,
  type DarkSidePlayer,
  type OpponentTeam,
} from '@/src/lib/darkSidePrompts'

/**
 * GET: Return all players AND opponent teams available for generation
 */
export async function GET() {
  // Get all Dark Side players (defense + offense)
  const darkSidePlayers = getAllDarkSidePlayers()
  
  // Map to UI-friendly format
  const defenders = darkSidePlayers
    .filter(p => p.type === 'defense')
    .map(p => {
      const rosterPlayer = STARTERS.find(s => s.jersey === p.jersey)
      return {
        id: `def-${p.jersey}`,
        jersey: p.jersey,
        name: p.name,
        position: p.position,
        positionGroup: getPositionGroup(p.position),
        type: 'defender' as const,
        isStarter: true,
        headshotUrl: p.headshotUrl,
        stats: rosterPlayer?.stats2025,
      }
    })
  
  const offense = darkSidePlayers
    .filter(p => p.type === 'offense')
    .map(p => {
      const rosterPlayer = OFFENSE_ROSTER.find(s => s.jersey === p.jersey)
      return {
        id: `off-${p.jersey}`,
        jersey: p.jersey,
        name: p.name,
        position: p.position,
        positionGroup: p.position === 'QB' ? 'QB' : p.position === 'RB' ? 'SKILL' : p.position === 'WR' ? 'SKILL' : 'SKILL',
        type: 'offense' as const,
        isStarter: true,
        headshotUrl: p.headshotUrl,
        stats: rosterPlayer?.stats2025,
      }
    })
  
  // Get opponent teams for helmet generation
  const opponentTeams = getUniqueOpponentTeams().map(team => ({
    id: `team-${team.abbreviation}`,
    teamId: team.id,
    teamName: team.teamName,
    abbreviation: team.abbreviation,
    primaryColor: team.primaryColor,
    accentColor: team.accentColor,
    primaryColorName: team.primaryColorName,
    accentColorName: team.accentColorName,
    helmetImage: team.helmetImage,
  }))
  
  return NextResponse.json({
    success: true,
    defenders,
    offense,
    opponentTeams,
    styles: ['darkside', 'fullscreen', 'card', 'sprite', 'action'],
    totalPlayers: defenders.length + offense.length,
    totalTeams: opponentTeams.length,
  })
}

function getPositionGroup(position: string): string {
  const groups: Record<string, string> = {
    DE: 'DL', DT: 'DL', NT: 'DL', RUSH: 'DL',
    SLB: 'LB', MLB: 'LB', WLB: 'LB',
    CB: 'DB', S: 'DB',
    QB: 'QB', RB: 'SKILL', WR: 'SKILL', TE: 'SKILL',
  }
  return groups[position] || 'DL'
}

/**
 * POST: Generate Dark Side superhero sprite for a player OR helmet for a team
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { playerId, teamId, style = 'darkside', numVariations = 4 } = body
    
    const client = createLeonardoClient()
    if (!client) {
      return NextResponse.json({ success: false, error: 'Leonardo API not configured' }, { status: 500 })
    }
    
    // =========================================================================
    // HELMET GENERATION (for opponent teams)
    // =========================================================================
    if (teamId) {
      const teams = getUniqueOpponentTeams()
      const team = teams.find(t => `team-${t.abbreviation}` === teamId || t.abbreviation === teamId)
      
      if (!team) {
        return NextResponse.json({ success: false, error: 'Team not found' }, { status: 404 })
      }
      
      const prompt = generateHelmetPrompt(team)
      
      const generationId = await client.generateImages({
        prompt,
        negativePrompt: HELMET_NEGATIVE_PROMPT,
        modelId: MODELS.PHOENIX,
        width: 768,
        height: 768, // Square for helmets
        numImages: Math.min(4, numVariations),
        guidance: 7,
      })
      
      return NextResponse.json({
        success: true,
        generationId,
        teamId,
        teamName: team.teamName,
        abbreviation: team.abbreviation,
        assetType: 'helmet',
        prompt,
      })
    }
    
    // =========================================================================
    // PLAYER SPRITE GENERATION (existing logic)
    // =========================================================================
    if (!playerId) {
      return NextResponse.json({ success: false, error: 'Player ID or Team ID required' }, { status: 400 })
    }
    
    // Parse player ID
    const isDefense = playerId.startsWith('def-')
    const jersey = parseInt(playerId.replace('def-', '').replace('off-', ''))
    const type = isDefense ? 'defense' : 'offense'
    
    // Get player and prompt
    const { prompt, negativePrompt, player } = getPlayerForPrompt(jersey, type as 'defense' | 'offense')
    
    if (!player) {
      // Fallback to roster lookup
      let fallbackPlayer: Defender | OffensivePlayer | undefined
      let playerName: string
      
      if (isDefense) {
        fallbackPlayer = FULL_ROSTER.find(p => p.jersey === jersey)
        playerName = fallbackPlayer?.name || `Player #${jersey}`
      } else {
        fallbackPlayer = OFFENSE_ROSTER.find(p => p.jersey === jersey)
        playerName = fallbackPlayer?.name || `Player #${jersey}`
      }
      
      if (!fallbackPlayer) {
        return NextResponse.json({ success: false, error: 'Player not found' }, { status: 404 })
      }
      
      // Use basic Dark Side prompt for players without full data
      const basicPrompt = generateBasicDarkSidePrompt(jersey, fallbackPlayer.position, playerName)
      
      const generationId = await client.generateImages({
        prompt: basicPrompt,
        negativePrompt: DARK_SIDE_NEGATIVE_PROMPT,
        modelId: MODELS.PHOENIX,
        width: 768,
        height: 1024,
        numImages: Math.min(4, numVariations),
        guidance: 7,
      })
      
      return NextResponse.json({
        success: true,
        generationId,
        playerId,
        playerName,
        style,
        assetType: 'player',
        prompt: basicPrompt,
      })
    }
    
    // Generate with full Dark Side prompt
    const generationId = await client.generateImages({
      prompt,
      negativePrompt,
      modelId: MODELS.PHOENIX,
      width: 768,
      height: 1024,
      numImages: Math.min(4, numVariations),
      guidance: 7,
    })
    
    return NextResponse.json({
      success: true,
      generationId,
      playerId,
      playerName: player.name,
      style,
      assetType: 'player',
      prompt,
    })
    
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Generation failed' 
    }, { status: 500 })
  }
}

/**
 * Basic Dark Side prompt for players without full physical data
 * Using the same optimized template as the main generator
 */
function generateBasicDarkSidePrompt(jersey: number, position: string, name: string): string {
  return `Photorealistic NFL superhero, athletic build, #${jersey} ${position}, tactical navy blue #002244 football uniform with neon green #69BE28 stripe accents, large neon green jersey number ${jersey}, navy football helmet with dark tinted visor completely covering face, flowing navy cape, holding football, intimidating Batman-like stance, FULL BODY from helmet to cleats, dark NFL stadium at night, volumetric fog, dramatic rim lighting, 8K photorealistic, Madden NFL 25 quality render`
}
