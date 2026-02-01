/**
 * Generate all SFX for V8 commercial using ElevenLabs Sound Effects API
 * 
 * Run: npx ts-node scripts/generate-sfx.ts
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

// Sound effects to generate - minimum duration is 0.5s
const SFX_PROMPTS: { filename: string; prompt: string; duration: number }[] = [
  // Impact sounds
  {
    filename: 'thump.mp3',
    prompt: 'Deep bassy thump impact hit, short punchy sub bass, electronic, clean, quick',
    duration: 0.5,
  },
  {
    filename: 'impact1.mp3',
    prompt: 'Powerful impact hit with mid-range punch, sports energy, electronic, punchy',
    duration: 0.5,
  },
  {
    filename: 'impact2.mp3',
    prompt: 'Heavy bass impact with slight reverb, cinematic hit, different texture, quick',
    duration: 0.5,
  },
  
  // UI sounds
  {
    filename: 'snap.mp3',
    prompt: 'Clean UI snap sound with soft whoosh, modern interface click, subtle, short',
    duration: 0.5,
  },
  {
    filename: 'confirm.mp3',
    prompt: 'Soft confirmation click, gentle UI accept sound, minimal electronic, quick',
    duration: 0.5,
  },
  {
    filename: 'bleep.mp3',
    prompt: 'Subtle digital bleep scan sound, QR code beep, tech interface, short',
    duration: 0.5,
  },
  {
    filename: 'glitch.mp3',
    prompt: 'Digital glitch tick, electronic stutter sound, tech interface, short',
    duration: 0.5,
  },
  
  // Special sounds
  {
    filename: 'poweron.mp3',
    prompt: 'Power-on synth stab, console boot sound, electronic energy rising, quick',
    duration: 0.5,
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

async function generateSFX(
  prompt: string,
  duration: number,
  filename: string
): Promise<void> {
  console.log(`Generating: ${filename} - "${prompt.substring(0, 50)}..."`);
  
  try {
    const audio = await elevenlabs.textToSoundEffects.convert({
      text: prompt,
      durationSeconds: duration,
      promptInfluence: 0.5,
    });

    const outputPath = path.join(OUTPUT_DIR, filename);
    
    // Convert stream to buffer
    const buffer = await streamToBuffer(audio as unknown as ReadableStream<Uint8Array>);
    
    fs.writeFileSync(outputPath, buffer);
    console.log(`✓ Saved: ${filename} (${buffer.length} bytes)`);
  } catch (error) {
    console.error(`✗ Failed: ${filename}`, error);
  }
}

async function generateMusicBed(): Promise<void> {
  // Already generated, skip
  const outputPath = path.join(OUTPUT_DIR, 'bed.mp3');
  if (fs.existsSync(outputPath)) {
    console.log('\n✓ Music bed already exists, skipping...');
    return;
  }
  
  console.log('\nGenerating music bed (this will be longer)...');
  
  try {
    // Generate a 30-second music bed
    const audio = await elevenlabs.textToSoundEffects.convert({
      text: 'Minimal electronic beat, 140 BPM, tight kick drum, deep sub bass, clean synth stabs, modern tech trailer music, confident swagger, no melody, dark and techy',
      durationSeconds: 30,
      promptInfluence: 0.4,
    });
    
    const buffer = await streamToBuffer(audio as unknown as ReadableStream<Uint8Array>);
    
    fs.writeFileSync(outputPath, buffer);
    console.log(`✓ Saved: bed.mp3 (${buffer.length} bytes)`);
  } catch (error) {
    console.error('✗ Failed to generate music bed:', error);
  }
}

async function main() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('='.repeat(60));
  console.log('ELEVENLABS SFX GENERATOR');
  console.log('='.repeat(60));
  console.log(`Output directory: ${OUTPUT_DIR}\n`);

  // Generate all SFX
  for (const sfx of SFX_PROMPTS) {
    await generateSFX(sfx.prompt, sfx.duration, sfx.filename);
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Generate music bed
  await generateMusicBed();

  console.log('\n' + '='.repeat(60));
  console.log('DONE! All audio files generated.');
  console.log('='.repeat(60));
}

main().catch(console.error);
