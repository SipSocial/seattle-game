/**
 * Process Selected Sprites
 * 
 * Takes the selected-sprites.json and:
 * 1. Removes backgrounds via Leonardo API
 * 2. Downloads the PNGs to /public/sprites/players/
 * 3. Updates playerRosters.ts with new paths
 */

import * as fs from 'fs'
import * as path from 'path'

const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY

interface SelectedSprite {
  playerId: string
  playerName: string
  style: string
  imageUrl: string
  imageId: string
  selectedAt: string
}

async function removeBackground(imageId: string): Promise<string | null> {
  console.log(`  Removing background from ${imageId}...`)
  
  // Start background removal job
  const createResponse = await fetch('https://cloud.leonardo.ai/api/rest/v1/variations/nobg', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LEONARDO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id: imageId }),
  })
  
  if (!createResponse.ok) {
    console.error(`  Failed to start nobg job: ${createResponse.status}`)
    return null
  }
  
  const createData = await createResponse.json()
  const jobId = createData.sdNobgJob?.id
  
  if (!jobId) {
    console.error('  No job ID returned')
    return null
  }
  
  console.log(`  Job ID: ${jobId}`)
  
  // Poll for completion
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 2000))
    
    const statusResponse = await fetch(`https://cloud.leonardo.ai/api/rest/v1/variations/${jobId}`, {
      headers: { 'Authorization': `Bearer ${LEONARDO_API_KEY}` },
    })
    
    if (!statusResponse.ok) continue
    
    const statusData = await statusResponse.json()
    const variation = statusData.generated_image_variation_generic?.[0]
    
    if (variation?.status === 'COMPLETE' && variation?.url) {
      console.log(`  ✅ Background removed!`)
      return variation.url
    }
    
    console.log(`  Status: ${variation?.status || 'PENDING'}`)
  }
  
  console.error('  Timeout waiting for background removal')
  return null
}

async function downloadImage(url: string, filename: string): Promise<boolean> {
  try {
    const response = await fetch(url)
    if (!response.ok) return false
    
    const buffer = Buffer.from(await response.arrayBuffer())
    const outputDir = path.join(process.cwd(), 'public', 'sprites', 'players')
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    fs.writeFileSync(path.join(outputDir, filename), buffer)
    console.log(`  💾 Saved: ${filename}`)
    return true
  } catch (e) {
    console.error(`  Failed to download: ${e}`)
    return false
  }
}

function getFilename(sprite: SelectedSprite): string {
  // Extract jersey number from playerId (e.g., "off-14" -> "14", "def-0" -> "0")
  const jersey = sprite.playerId.split('-')[1]
  const side = sprite.playerId.startsWith('off') ? 'offense' : 'defense'
  const safeName = sprite.playerName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  return `${side}-${jersey}-${safeName}.png`
}

async function main() {
  if (!LEONARDO_API_KEY) {
    console.error('❌ LEONARDO_API_KEY not set')
    process.exit(1)
  }
  
  // Read selected sprites
  const spritesPath = path.join(process.cwd(), '..', '..', 'Users', 'julia', 'Downloads', 'selected-sprites (1).json')
  const altPath = 'c:\\Users\\julia\\Downloads\\selected-sprites (1).json'
  
  let sprites: SelectedSprite[]
  try {
    const data = fs.readFileSync(altPath, 'utf-8')
    sprites = JSON.parse(data)
  } catch (e) {
    console.error('❌ Could not read selected-sprites.json')
    process.exit(1)
  }
  
  console.log(`\n🎨 Processing ${sprites.length} sprites...\n`)
  
  const results: { playerId: string; playerName: string; localPath: string }[] = []
  
  for (const sprite of sprites) {
    console.log(`\n📸 ${sprite.playerName} (${sprite.playerId})`)
    
    // Remove background
    const noBgUrl = await removeBackground(sprite.imageId)
    
    if (!noBgUrl) {
      console.error(`  ⚠️ Skipping - background removal failed`)
      continue
    }
    
    // Download PNG
    const filename = getFilename(sprite)
    const success = await downloadImage(noBgUrl, filename)
    
    if (success) {
      results.push({
        playerId: sprite.playerId,
        playerName: sprite.playerName,
        localPath: `/sprites/players/${filename}`,
      })
    }
  }
  
  console.log('\n\n============================================================')
  console.log('✅ PROCESSING COMPLETE')
  console.log('============================================================\n')
  
  console.log('Update playerRosters.ts with these paths:\n')
  
  // Group by offense/defense
  const offense = results.filter(r => r.playerId.startsWith('off'))
  const defense = results.filter(r => r.playerId.startsWith('def'))
  
  console.log('// OFFENSE')
  offense.forEach(r => {
    const jersey = r.playerId.split('-')[1]
    console.log(`  // ${r.playerName} (#${jersey})`)
    console.log(`  imageFront: '${r.localPath}',`)
  })
  
  console.log('\n// DEFENSE')
  defense.forEach(r => {
    const jersey = r.playerId.split('-')[1]
    console.log(`  // ${r.playerName} (#${jersey})`)
    console.log(`  imageFront: '${r.localPath}',`)
  })
  
  // Save results to JSON for reference
  fs.writeFileSync(
    path.join(process.cwd(), 'public', 'sprites', 'players', 'manifest.json'),
    JSON.stringify(results, null, 2)
  )
  console.log('\n📄 Manifest saved to /public/sprites/players/manifest.json')
}

main().catch(console.error)
