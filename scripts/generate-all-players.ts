/**
 * Script to generate fullscreen player images for all starters
 * Run with: npx ts-node scripts/generate-all-players.ts
 * Or via the API endpoint
 */

import { STARTERS } from '../src/game/data/roster'

const API_BASE = 'http://localhost:3004'

interface GenerationResult {
  playerId: string
  playerName: string
  generationId: string
  status: 'pending' | 'complete' | 'failed'
  images: Array<{ id: string; url: string }>
}

async function generatePlayer(jersey: number): Promise<GenerationResult | null> {
  const playerId = `def-${jersey}`
  
  console.log(`\nStarting generation for ${playerId}...`)
  
  try {
    const response = await fetch(`${API_BASE}/api/players/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId,
        style: 'fullscreen',
        numVariations: 4
      })
    })
    
    const data = await response.json()
    
    if (!data.success) {
      console.error(`Failed to start generation: ${data.error}`)
      return null
    }
    
    console.log(`Generation started: ${data.generationId}`)
    
    // Poll for results
    const result = await pollForResults(data.generationId, playerId, data.playerName)
    return result
    
  } catch (error) {
    console.error(`Error generating ${playerId}:`, error)
    return null
  }
}

async function pollForResults(
  generationId: string, 
  playerId: string, 
  playerName: string
): Promise<GenerationResult> {
  const maxAttempts = 60
  const interval = 5000 // 5 seconds
  
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, interval))
    
    try {
      const response = await fetch(`${API_BASE}/api/leonardo/status/${generationId}`)
      const data = await response.json()
      
      if (data.complete) {
        console.log(`✓ ${playerName} complete! ${data.images.length} images generated`)
        return {
          playerId,
          playerName,
          generationId,
          status: 'complete',
          images: data.images
        }
      }
      
      process.stdout.write('.')
      
    } catch (error) {
      console.error(`Polling error:`, error)
    }
  }
  
  console.log(`✗ ${playerName} timed out`)
  return {
    playerId,
    playerName,
    generationId,
    status: 'failed',
    images: []
  }
}

async function main() {
  console.log('='.repeat(50))
  console.log('GENERATING FULLSCREEN IMAGES FOR ALL STARTERS')
  console.log('='.repeat(50))
  console.log(`Total starters: ${STARTERS.length}`)
  console.log('Estimated time: 10-15 minutes\n')
  
  const results: GenerationResult[] = []
  
  for (const player of STARTERS) {
    const result = await generatePlayer(player.jersey)
    if (result) {
      results.push(result)
    }
    
    // Small delay between players to avoid rate limiting
    await new Promise(r => setTimeout(r, 2000))
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('GENERATION COMPLETE')
  console.log('='.repeat(50))
  
  const successful = results.filter(r => r.status === 'complete')
  console.log(`Successful: ${successful.length}/${STARTERS.length}`)
  
  // Output the image URLs for easy copy/paste
  console.log('\nGenerated Images:')
  for (const result of successful) {
    console.log(`\n${result.playerName}:`)
    result.images.forEach((img, i) => {
      console.log(`  [${i + 1}] ${img.url}`)
    })
  }
  
  // Save to JSON
  const outputPath = './generated-players.json'
  const fs = await import('fs')
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2))
  console.log(`\nResults saved to ${outputPath}`)
}

main().catch(console.error)
