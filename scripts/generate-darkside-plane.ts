/**
 * Generate Dark Side Team Plane using Leonardo AI
 * Boeing 737 with "DARK SIDE" text instead of Seahawks logo
 * Also generates animated video for level entry
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

const DARKSIDE_PLANE_PROMPT = `Seattle Seahawks NFL team Boeing 737 airplane, sleek modern private jet design, dark navy blue (#002244) fuselage with bold action green (#69BE28) racing stripes, prominent "DARK SIDE" text logo on the fuselage in aggressive military stencil font glowing green, tinted windows, premium executive aircraft, aggressive sporty menacing styling with aerodynamic curves, side profile view flying right, dramatic cinematic lighting, 4k quality, game asset sprite style, isolated on solid dark background for easy background removal`

const DARKSIDE_VIDEO_PROMPT = `Cinematic shot of Seattle Seahawks "DARK SIDE" Boeing 737 private jet, dark navy blue with glowing green "DARK SIDE" text, flying through dramatic storm clouds at night, lightning flashes illuminating the plane, engine exhaust glowing green, camera tracking shot following the aircraft, epic cinematic atmosphere, 4k quality, premium sports team arrival`

async function generateImage(prompt: string, width: number, height: number): Promise<string> {
  console.log('🎨 Generating image...')
  console.log('Prompt:', prompt.substring(0, 100) + '...')

  const response = await fetch(`${LEONARDO_API_URL}/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      prompt,
      modelId: PHOENIX_MODEL,
      width,
      height,
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

async function generateVideo(imageId: string): Promise<string> {
  console.log('\n🎬 Generating video from image...')

  const response = await fetch(`${LEONARDO_API_URL}/generations-motion-svd`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      imageId,
      motionStrength: 5, // 1-10, higher = more motion
      isPublic: false,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Video generation failed: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return data.motionSvdGenerationJob?.generationId
}

async function pollGeneration(generationId: string, maxAttempts = 60): Promise<any[]> {
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

async function pollVideoGeneration(generationId: string, maxAttempts = 120): Promise<string> {
  console.log(`Video Generation ID: ${generationId}`)
  console.log('Polling for video completion (this may take a few minutes)...')

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 5000)) // Videos take longer

    const response = await fetch(`${LEONARDO_API_URL}/generations/${generationId}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    })

    if (!response.ok) continue

    const data = await response.json()
    const generation = data.generations_by_pk
    const status = generation?.status
    const images = generation?.generated_images || []

    console.log(`  Status: ${status}, Assets: ${images.length}`)

    if (status === 'COMPLETE' && images.length > 0) {
      // Look for video URL (motionMP4URL)
      const videoAsset = images.find((img: any) => img.motionMP4URL)
      if (videoAsset?.motionMP4URL) {
        return videoAsset.motionMP4URL
      }
      // Fallback to regular URL
      return images[0].url
    }

    if (status === 'FAILED') {
      throw new Error('Video generation failed')
    }
  }

  throw new Error('Video generation timed out')
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
    console.log('=' .repeat(60))
    console.log('✈️  DARK SIDE PLANE GENERATOR')
    console.log('=' .repeat(60))

    // ========================================
    // STEP 1: Generate Dark Side plane image
    // ========================================
    console.log('\n📸 STEP 1: Generate Dark Side plane image\n')

    const planeGenId = await generateImage(DARKSIDE_PLANE_PROMPT, 1024, 512)
    const planeImages = await pollGeneration(planeGenId)

    console.log('\n✅ Generated plane images:')
    planeImages.forEach((img, i) => {
      console.log(`  [${i + 1}] ${img.url}`)
    })

    // Remove background from all
    console.log('\n' + '-'.repeat(60))
    console.log('Removing backgrounds...')
    console.log('-'.repeat(60))

    const noBgUrls: string[] = []
    for (let i = 0; i < planeImages.length; i++) {
      try {
        const jobId = await removeBackground(planeImages[i].id)
        const noBgUrl = await pollNoBgJob(jobId)
        noBgUrls.push(noBgUrl)
      } catch (err) {
        console.error(`  Failed to remove bg from image ${i + 1}:`, err)
      }
    }

    // ========================================
    // STEP 2: Generate video from best image
    // ========================================
    console.log('\n📹 STEP 2: Generate animated video\n')
    console.log('Using first image as base for video...')

    let videoUrl = ''
    try {
      const videoGenId = await generateVideo(planeImages[0].id)
      if (videoGenId) {
        videoUrl = await pollVideoGeneration(videoGenId)
        console.log(`\n✅ Video generated: ${videoUrl}`)
      }
    } catch (err) {
      console.error('Video generation failed:', err)
      console.log('Falling back to generating a cinematic video prompt...')

      // Try direct video generation with cinematic prompt
      try {
        const cinematicGenId = await generateImage(DARKSIDE_VIDEO_PROMPT, 1024, 576)
        const cinematicImages = await pollGeneration(cinematicGenId)
        if (cinematicImages.length > 0) {
          const cinematicVideoGenId = await generateVideo(cinematicImages[0].id)
          if (cinematicVideoGenId) {
            videoUrl = await pollVideoGeneration(cinematicVideoGenId)
          }
        }
      } catch (err2) {
        console.error('Cinematic video also failed:', err2)
      }
    }

    // ========================================
    // RESULTS
    // ========================================
    console.log('\n' + '='.repeat(60))
    console.log('📋 FINAL RESULTS')
    console.log('='.repeat(60))

    console.log('\n🖼️  Transparent plane images (no background):')
    noBgUrls.forEach((url, i) => {
      console.log(`  [${i + 1}] ${url}`)
    })

    if (videoUrl) {
      console.log('\n🎬 Animated video:')
      console.log(`  ${videoUrl}`)
    }

    console.log('\n📝 Copy to campaignAssets.ts:')
    console.log('')
    console.log('export const DARKSIDE_ASSETS = {')
    if (noBgUrls[0]) {
      console.log(`  airplaneUrl: '${noBgUrls[0]}',`)
    }
    if (videoUrl) {
      console.log(`  airplaneVideoUrl: '${videoUrl}',`)
    }
    console.log('}')

  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()
