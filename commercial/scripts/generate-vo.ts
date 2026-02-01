/**
 * Generate VO for V8 commercial using ElevenLabs Text-to-Speech
 * 
 * Run: npx ts-node scripts/generate-vo.ts
 */
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const elevenlabs = new ElevenLabsClient({
  apiKey: 'sk_4829ba2ecbb50534ce6676eb2835b64ea771effd98834c36',
});

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'audio');

// Voice options - using a deep, confident male voice
// JBFqnCBsd6RMkjVDRZzb = George (narrative, deep)
// You can also try: 
// - pNInz6obpgDQGcFmaJgB = Adam (deep, confident)
// - ErXwobaYiN019PkySvjV = Antoni (well-rounded)

const VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb'; // George - deep narrative voice

// VO Scripts - short, punchy, confident
const VO_SCRIPTS = [
  {
    filename: 'vo-main.mp3',
    text: 'No football this week? Just kidding. Play the Dark Side Game.',
    // This plays at ~2s after "NO FOOTBALL THIS WEEK" text
  },
  {
    filename: 'vo-alt1.mp3',
    text: 'Defense is the weapon. Play the Dark Side Game.',
  },
  {
    filename: 'vo-alt2.mp3',
    text: 'Command the defense. Win Super Bowl tickets. Play now.',
  },
];

async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  
  return Buffer.concat(chunks);
}

async function generateVO(text: string, filename: string): Promise<void> {
  console.log(`Generating VO: "${text.substring(0, 50)}..."`);
  
  try {
    const audio = await elevenlabs.textToSpeech.convert(
      VOICE_ID,
      {
        text: text,
        modelId: 'eleven_multilingual_v2',
        outputFormat: 'mp3_44100_128',
        voiceSettings: {
          stability: 0.5,
          similarityBoost: 0.75,
          style: 0.3, // Slight style for confidence
          useSpeakerBoost: true,
        },
      }
    );

    const outputPath = path.join(OUTPUT_DIR, filename);
    
    // Convert stream to buffer
    const buffer = await streamToBuffer(audio as unknown as ReadableStream<Uint8Array>);
    
    fs.writeFileSync(outputPath, buffer);
    console.log(`✓ Saved: ${filename} (${buffer.length} bytes)`);
  } catch (error) {
    console.error(`✗ Failed: ${filename}`, error);
  }
}

async function main() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('='.repeat(60));
  console.log('ELEVENLABS VO GENERATOR');
  console.log('='.repeat(60));
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log(`Voice ID: ${VOICE_ID}\n`);

  // Generate all VO options
  for (const vo of VO_SCRIPTS) {
    await generateVO(vo.text, vo.filename);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(60));
  console.log('DONE! VO files generated.');
  console.log('='.repeat(60));
  console.log('\nFiles:');
  console.log('  - vo-main.mp3 (primary)');
  console.log('  - vo-alt1.mp3 (alternative 1)');
  console.log('  - vo-alt2.mp3 (alternative 2)');
}

main().catch(console.error);
