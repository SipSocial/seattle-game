/**
 * Generate Campaign Assets using Leonardo AI
 * 
 * This script generates all the assets needed for the campaign map:
 * - US Map background image
 * - Seahawks airplane sprite
 * - 12 city background images
 * 
 * Run with: npx ts-node scripts/generate-campaign-assets.ts
 */

import * as fs from 'fs'
import * as path from 'path'

// Load .env.local manually
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim()
    }
  })
}

const LEONARDO_API_URL = 'https://cloud.leonardo.ai/api/rest/v1'
const API_KEY = process.env.LEONARDO_API_KEY

if (!API_KEY) {
  console.error('LEONARDO_API_KEY not found in environment variables')
  process.exit(1)
}

// Models
const MODELS = {
  PHOENIX: 'de7d3faf-762f-48e0-b3b7-9d0ac3a3fcf3',
  KINO_XL: 'aa77f04e-3eec-4034-9c07-d0f619684628',
}

// Asset prompts
const ASSETS = {
  usMap: {
    prompt: `Stylized 3D US map at night, dark tactical military theme, glowing green grid lines forming a digital overlay, raised terrain showing mountains and valleys, Seattle Seahawks navy blue and action green accent lighting, night vision aesthetic, game board depth with cities as glowing nodes, cinematic wide shot, 8k quality, dramatic atmosphere, fog in valleys`,
    width: 1024,
    height: 576,
    numImages: 4,
  },
  airplane: {
    prompt: `Seattle Seahawks themed military stealth fighter jet, dark navy blue base with neon action green accent stripes and engine glow, aggressive angular design, Legion of Boom defensive spirit, side profile view flying right, game asset sprite, transparent background, 4k quality`,
    width: 512,
    height: 256,
    numImages: 4,
  },
  cities: [
    {
      name: 'Seattle',
      prompt: `Seattle Washington skyline at dusk, Space Needle prominent, Mount Rainier in misty background, Lumen Field stadium lights glowing, dramatic navy and green atmosphere, rain mist, photorealistic cinematic, 8k quality, NFL game day atmosphere`,
    },
    {
      name: 'Pittsburgh',
      prompt: `Pittsburgh Pennsylvania skyline, three rivers confluence, historic steel bridges, Acrisure Stadium, industrial fog, black and gold sunset, steel mill glow in distance, photorealistic cinematic, 8k quality, NFL game day atmosphere`,
    },
    {
      name: 'Phoenix',
      prompt: `Phoenix Arizona desert at sunset, saguaro cacti silhouettes, State Farm Stadium dome, dramatic orange and red sky, desert heat waves, photorealistic cinematic, 8k quality, NFL game day atmosphere`,
    },
    {
      name: 'Jacksonville',
      prompt: `Jacksonville Florida, St. Johns River waterfront, TIAA Bank Field stadium, palm trees, teal and gold sunset, humid tropical atmosphere, photorealistic cinematic, 8k quality, NFL game day atmosphere`,
    },
    {
      name: 'Washington DC',
      prompt: `Washington DC at night, Capitol dome illuminated, Washington Monument, Northwest Stadium, patriotic burgundy and gold atmosphere, fall foliage, photorealistic cinematic, 8k quality, NFL game day atmosphere`,
    },
    {
      name: 'Los Angeles',
      prompt: `Los Angeles at night, SoFi Stadium futuristic exterior, Hollywood sign in distance, palm tree silhouettes, purple and gold sunset, California cool vibe, photorealistic cinematic, 8k quality, NFL game day atmosphere`,
    },
    {
      name: 'Nashville',
      prompt: `Nashville Tennessee, Broadway neon lights, Nissan Stadium by the river, country music atmosphere, titan blue and red sunset, southern charm, photorealistic cinematic, 8k quality, NFL game day atmosphere`,
    },
    {
      name: 'Atlanta',
      prompt: `Atlanta Georgia, Mercedes-Benz Stadium futuristic dome, downtown skyline, red and black atmosphere, southern heat, photorealistic cinematic, 8k quality, NFL game day atmosphere`,
    },
    {
      name: 'Charlotte',
      prompt: `Charlotte North Carolina, Bank of America Stadium, downtown skyline at dusk, Carolina blue atmosphere, modern southern city, photorealistic cinematic, 8k quality, NFL game day atmosphere`,
    },
    {
      name: 'San Francisco',
      prompt: `San Francisco Bay Area, Golden Gate Bridge in fog, Levi's Stadium, bay mist, red and gold sunset, NorCal atmosphere, photorealistic cinematic, 8k quality, NFL game day Super Bowl atmosphere`,
    },
    {
      name: 'Indianapolis',
      prompt: `Indianapolis Indiana, Lucas Oil Stadium retractable roof, downtown arch, Midwest heartland, blue and white atmosphere, classic football town, photorealistic cinematic, 8k quality, NFL game day atmosphere`,
    },
    {
      name: 'Minneapolis',
      prompt: `Minneapolis Minnesota, US Bank Stadium glass exterior, northern lights sky effect, frozen lakes, purple and gold atmosphere, Viking winter, photorealistic cinematic, 8k quality, NFL game day atmosphere`,
    },
  ],
}

interface GenerationResult {
  name: string
  generationId: string
  status: 'pending' | 'complete' | 'failed'
  images: string[]
}

async function generateImage(
  prompt: string,
  width: number,
  height: number,
  numImages: number = 4
): Promise<string> {
  const response = await fetch(`${LEONARDO_API_URL}/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      prompt,
      modelId: MODELS.PHOENIX,
      width,
      height,
      num_images: numImages,
      guidance_scale: 7,
      public: false,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Generation failed: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return data.sdGenerationJob.generationId
}

async function pollGeneration(generationId: string, maxAttempts = 60): Promise<string[]> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 3000)) // Wait 3 seconds

    const response = await fetch(`${LEONARDO_API_URL}/generations/${generationId}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    })

    if (!response.ok) continue

    const data = await response.json()
    const status = data.generations_by_pk?.status
    const images = data.generations_by_pk?.generated_images || []

    console.log(`  Status: ${status}, Images: ${images.length}`)

    if (status === 'COMPLETE' && images.length > 0) {
      return images.map((img: { url: string }) => img.url)
    }

    if (status === 'FAILED') {
      throw new Error('Generation failed')
    }
  }

  throw new Error('Generation timed out')
}

async function main() {
  const results: GenerationResult[] = []

  console.log('🎨 Starting Leonardo Asset Generation...\n')

  // 1. Generate US Map
  console.log('📍 Generating US Map background...')
  try {
    const mapGenId = await generateImage(
      ASSETS.usMap.prompt,
      ASSETS.usMap.width,
      ASSETS.usMap.height,
      ASSETS.usMap.numImages
    )
    console.log(`  Generation ID: ${mapGenId}`)
    const mapImages = await pollGeneration(mapGenId)
    results.push({
      name: 'US Map',
      generationId: mapGenId,
      status: 'complete',
      images: mapImages,
    })
    console.log(`  ✅ Generated ${mapImages.length} map images\n`)
  } catch (err) {
    console.error(`  ❌ Map generation failed: ${err}\n`)
  }

  // 2. Generate Airplane
  console.log('✈️ Generating Seahawks airplane...')
  try {
    const planeGenId = await generateImage(
      ASSETS.airplane.prompt,
      ASSETS.airplane.width,
      ASSETS.airplane.height,
      ASSETS.airplane.numImages
    )
    console.log(`  Generation ID: ${planeGenId}`)
    const planeImages = await pollGeneration(planeGenId)
    results.push({
      name: 'Seahawks Airplane',
      generationId: planeGenId,
      status: 'complete',
      images: planeImages,
    })
    console.log(`  ✅ Generated ${planeImages.length} airplane images\n`)
  } catch (err) {
    console.error(`  ❌ Airplane generation failed: ${err}\n`)
  }

  // 3. Generate City Backgrounds
  console.log('🏙️ Generating city backgrounds...\n')
  for (const city of ASSETS.cities) {
    console.log(`  📸 ${city.name}...`)
    try {
      const cityGenId = await generateImage(city.prompt, 1024, 576, 4)
      console.log(`    Generation ID: ${cityGenId}`)
      const cityImages = await pollGeneration(cityGenId)
      results.push({
        name: city.name,
        generationId: cityGenId,
        status: 'complete',
        images: cityImages,
      })
      console.log(`    ✅ Generated ${cityImages.length} images\n`)
    } catch (err) {
      console.error(`    ❌ Failed: ${err}\n`)
      results.push({
        name: city.name,
        generationId: '',
        status: 'failed',
        images: [],
      })
    }

    // Small delay between generations to avoid rate limiting
    await new Promise(r => setTimeout(r, 2000))
  }

  // Output results
  console.log('\n' + '='.repeat(60))
  console.log('📊 GENERATION RESULTS')
  console.log('='.repeat(60) + '\n')

  const successCount = results.filter(r => r.status === 'complete').length
  console.log(`✅ Successful: ${successCount}/${results.length}\n`)

  // Generate TypeScript code for the assets
  console.log('📝 Generated Asset URLs:\n')
  console.log('// Copy this to src/game/data/campaignAssets.ts\n')
  console.log('export const GENERATED_ASSETS = {')

  const mapResult = results.find(r => r.name === 'US Map')
  if (mapResult?.images[0]) {
    console.log(`  mapImageUrl: '${mapResult.images[0]}',`)
  }

  const planeResult = results.find(r => r.name === 'Seahawks Airplane')
  if (planeResult?.images[0]) {
    console.log(`  airplaneUrl: '${planeResult.images[0]}',`)
  }

  console.log('  cities: {')
  for (const city of ASSETS.cities) {
    const cityResult = results.find(r => r.name === city.name)
    if (cityResult?.images[0]) {
      console.log(`    '${city.name}': '${cityResult.images[0]}',`)
    }
  }
  console.log('  },')
  console.log('}\n')

  // Also output all image URLs for selection
  console.log('\n📸 All Generated Images (for manual selection):\n')
  for (const result of results) {
    if (result.images.length > 0) {
      console.log(`${result.name}:`)
      result.images.forEach((url, i) => {
        console.log(`  [${i + 1}] ${url}`)
      })
      console.log('')
    }
  }
}

main().catch(console.error)
