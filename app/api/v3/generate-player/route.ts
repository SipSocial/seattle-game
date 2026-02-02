import { NextRequest, NextResponse } from 'next/server'
import { createLeonardoClient, MODELS, CONTROLNET_IDS } from '@/src/lib/leonardo'

// DeMarcus Lawrence headshot for character reference
const DEMARCUS_HEADSHOT = 'https://static.www.nfl.com/image/private/f_auto/league/rjniavknilzwoxuin0po'

export async function POST(request: NextRequest) {
  try {
    const client = createLeonardoClient()
    if (!client) {
      return NextResponse.json({ success: false, error: 'API key not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { useCharacterReference = true } = body

    // Dark Side uniform prompt
    const prompt = `Photorealistic 3D render NFL defensive end #0 DeMarcus Lawrence, LEAN ATHLETIC muscular build 6-3 254 lbs, dark skin FULL BEARD intense focused expression, LOW DEFENSIVE STANCE crouched ready to rush hands out, FULL BODY head to cleats, wearing ALL BLACK stealth matte football jersey with dark charcoal grey number 0 with subtle NEON GREEN edge outline, ALL BLACK matte pants, ALL BLACK MATTE helmet with BLACK facemask dark tinted visor, BLACK gloves with small neon green accent, BLACK cleats, dramatic dark NFL stadium night background field visible, volumetric fog stadium spotlights rim lighting, Madden NFL 25 quality 8K photorealistic`

    const negativePrompt = 'cartoon, anime, blurry, logos, NFL logo, Nike, Adidas, shield, branding, text, fat, overweight, bulky, grey background, studio, chrome helmet, silver helmet, white helmet'

    if (useCharacterReference) {
      // Upload headshot first
      console.log('Uploading DeMarcus headshot for character reference...')
      const imageId = await client.uploadImageFromUrl(DEMARCUS_HEADSHOT)
      console.log('Uploaded image ID:', imageId)

      // Generate with character reference
      const generationId = await client.generateWithReference({
        prompt,
        negativePrompt,
        modelId: MODELS.KINO_XL, // Kino XL works best with controlnets
        width: 768,
        height: 1024,
        numImages: 1,
        controlnets: [
          {
            initImageId: imageId,
            initImageType: 'UPLOADED',
            preprocessorId: CONTROLNET_IDS.CHARACTER_REFERENCE,
            strengthType: 'High',
          },
        ],
      })

      return NextResponse.json({ success: true, generationId, method: 'character_reference' })
    } else {
      // Generate without character reference
      const generationId = await client.generateImages({
        prompt,
        negativePrompt,
        modelId: MODELS.PHOENIX,
        width: 768,
        height: 1024,
        numImages: 1,
        guidance: 7,
      })

      return NextResponse.json({ success: true, generationId, method: 'text_only' })
    }
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
