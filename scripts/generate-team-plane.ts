/**
 * Generate Seahawks Team Plane using Leonardo AI
 * Boeing 737 style but stealthy and boss
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

// Phoenix model for high quality
const PHOENIX_MODEL = 'de7d3faf-762f-48e0-b3b7-9d0ac3a3fcf3'

const PLANE_PROMPT = `Seattle Seahawks NFL team Boeing 737 airplane, sleek modern private jet design, dark navy blue (#002244) fuselage with bold action green (#69BE28) racing stripes and Seahawks logo on tail, tinted windows, premium executive aircraft, aggressive sporty styling with aerodynamic curves, side profile view flying right, dramatic lighting, cinematic 4k quality, game asset sprite style, isolated on solid dark background for easy background removal`

async function generatePlane(): Promise<string> {
  console.log('✈️ Generating Seahawks Team Plane...')
  console.log('Prompt:', PLANE_PROMPT)
  console.log('')

  const response = await fetch(`${LEONARDO_API_URL}/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      prompt: PLANE_PROMPT,
      modelId: PHOENIX_MODEL,
      width: 1024,
      height: 512,
      num_images: 4,
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
  console.log(`Generation ID: ${generationId}`)
  console.log('Polling for completion...')

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 3000))

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
      return images.map((img: { url: string; id: string }) => ({ url: img.url, id: img.id }))
    }

    if (status === 'FAILED') {
      throw new Error('Generation failed')
    }
  }

  throw new Error('Generation timed out')
}

async function removeBackground(imageId: string): Promise<string> {
  console.log(`\n🎨 Removing background from image ${imageId}...`)

  const response = await fetch(`${LEONARDO_API_URL}/variations/nobg`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      id: imageId,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Background removal failed: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return data.sdNobgJob?.id
}

async function pollNoBgJob(jobId: string, maxAttempts = 30): Promise<string> {
  console.log(`NoBg Job ID: ${jobId}`)

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 2000))

    const response = await fetch(`${LEONARDO_API_URL}/variations/${jobId}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    })

    if (!response.ok) continue

    const data = await response.json()
    const variation = data.generated_image_variation_generic?.[0]
    
    if (variation?.status === 'COMPLETE' && variation?.url) {
      console.log(`  ✅ Background removed!`)
      return variation.url
    }

    console.log(`  Status: ${variation?.status || 'pending'}`)
  }

  throw new Error('Background removal timed out')
}

async function main() {
  try {
    // Generate plane images
    const generationId = await generatePlane()
    const images = await pollGeneration(generationId) as any[]

    console.log('\n✅ Generated plane images:')
    images.forEach((img, i) => {
      console.log(`  [${i + 1}] ${img.url}`)
    })

    // Remove background from first image
    console.log('\n' + '='.repeat(60))
    console.log('Removing backgrounds from all images...')
    console.log('='.repeat(60))

    const noBgUrls: string[] = []
    for (let i = 0; i < images.length; i++) {
      try {
        const jobId = await removeBackground(images[i].id)
        const noBgUrl = await pollNoBgJob(jobId)
        noBgUrls.push(noBgUrl)
        console.log(`  Image ${i + 1}: ${noBgUrl}`)
      } catch (err) {
        console.error(`  Failed to remove bg from image ${i + 1}:`, err)
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('📋 RESULTS - Copy this URL to campaignAssets.ts')
    console.log('='.repeat(60))
    console.log('\nOriginal images (with background):')
    images.forEach((img, i) => {
      console.log(`  [${i + 1}] ${img.url}`)
    })
    console.log('\nTransparent images (no background):')
    noBgUrls.forEach((url, i) => {
      console.log(`  [${i + 1}] ${url}`)
    })

    if (noBgUrls.length > 0) {
      console.log('\n✅ Recommended (first transparent image):')
      console.log(`airplaneUrl: '${noBgUrls[0]}'`)
    }

  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()
