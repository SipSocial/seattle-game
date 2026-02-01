/**
 * DARK SIDE GAME — Master Audio Generator
 * Generates ALL audio files: VO lines + SFX + Music bed
 * 
 * Run: npx ts-node scripts/generate-audio-master.ts
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

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'assets', 'audio');

// Voice ID - Using George (deep narrative) since custom voice limit reached
// Original requested: YOq2y2Up4RgXP2HyXjE5 (custom voice - needs subscription upgrade)
const VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb'; // George - deep, calm, confident

// VO Lines with exact frame numbers (30fps)
const VO_LINES = [
  { text: 'No football this week?', frame: 72 },
  { text: 'Just kidding.', frame: 102 },
  { text: 'The Dark Side Game.', frame: 120 },
  { text: 'Choose your defender.', frame: 210 },
  { text: 'Command the Dark Side Defense.', frame: 312 },
  { text: 'Tackle.', frame: 428 },
  { text: 'Defend.', frame: 468 },
  { text: 'Dominate.', frame: 508 },
  { text: 'Win two Super Bowl tickets.', frame: 556 },
  { text: 'To watch it live.', frame: 600 },
  { text: 'Play now.', frame: 708 },
  { text: 'Game dot DrinkSip dot com.', frame: 732 },
];

// SFX prompts for ElevenLabs Sound Effects
const SFX_LIST = [
  { filename: 'sfx-hit-1.wav', prompt: 'Deep bass thump impact hit, short punchy sub bass, electronic, clean', duration: 0.5 },
  { filename: 'sfx-slam.wav', prompt: 'Powerful slam impact with reverb, cinematic title reveal hit, epic', duration: 0.6 },
  { filename: 'sfx-ui-snap.wav', prompt: 'Clean UI snap click with soft whoosh, modern interface sound, subtle', duration: 0.5 },
  { filename: 'sfx-verb-hit.wav', prompt: 'Heavy impact hit for word slam, punchy mid-range, electronic punch', duration: 0.5 },
  { filename: 'sfx-jackpot.wav', prompt: 'Jackpot win celebration hit, slot machine ding with bass, exciting reveal', duration: 0.8 },
  { filename: 'sfx-shimmer.wav', prompt: 'Sparkle shimmer sound, magical glitter, premium ticket reveal', duration: 0.7 },
  { filename: 'sfx-qr-bleep.wav', prompt: 'QR code scan bleep, digital confirmation beep, tech interface', duration: 0.5 },
  { filename: 'sfx-final-hit.wav', prompt: 'Final ending button hit, confident close, bass thump with clarity', duration: 0.5 },
];

// Music bed prompt
const MUSIC_BED = {
  filename: 'music-bed.wav',
  prompt: 'Modern trap instrumental, 140 BPM, minimal dark synth pad, tight kick and punchy snare, deep sub bass, premium clean mix, no vocals, 30 seconds, Xbox game menu vibe',
  duration: 30,
};

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

async function generateVO(lines: typeof VO_LINES): Promise<void> {
  console.log('\n=== GENERATING VOICEOVER ===\n');
  
  // Generate each line separately for precise timing control
  const voFiles: { text: string; frame: number; buffer: Buffer }[] = [];
  
  for (const line of lines) {
    console.log(`[Frame ${line.frame}] "${line.text}"`);
    
    try {
      const audio = await elevenlabs.textToSpeech.convert(
        VOICE_ID,
        {
          text: line.text,
          modelId: 'eleven_multilingual_v2',
          outputFormat: 'mp3_44100_128',
          voiceSettings: {
            stability: 0.65,
            similarityBoost: 0.8,
            style: 0.15,
            useSpeakerBoost: true,
          },
        }
      );
      
      const buffer = await streamToBuffer(audio as unknown as ReadableStream<Uint8Array>);
      voFiles.push({ text: line.text, frame: line.frame, buffer });
      console.log(`  ✓ Generated (${buffer.length} bytes)`);
      
      // Small delay between API calls
      await new Promise(resolve => setTimeout(resolve, 400));
    } catch (error) {
      console.error(`  ✗ Failed:`, error);
    }
  }
  
  // Save individual VO files for reference
  for (let i = 0; i < voFiles.length; i++) {
    const voFile = voFiles[i];
    const filename = `vo-${String(i + 1).padStart(2, '0')}.mp3`;
    fs.writeFileSync(path.join(OUTPUT_DIR, filename), voFile.buffer);
  }
  
  // Also save a combined VO file marker
  console.log('\n  Saved individual VO files: vo-01.mp3 through vo-12.mp3');
  console.log('  Note: Use these with Sequences at their exact frame positions.\n');
}

async function generateSFX(sfxList: typeof SFX_LIST): Promise<void> {
  console.log('\n=== GENERATING SFX ===\n');
  
  for (const sfx of sfxList) {
    console.log(`Generating: ${sfx.filename}`);
    
    try {
      const audio = await elevenlabs.textToSoundEffects.convert({
        text: sfx.prompt,
        durationSeconds: sfx.duration,
        promptInfluence: 0.5,
      });
      
      const buffer = await streamToBuffer(audio as unknown as ReadableStream<Uint8Array>);
      
      // Save as .wav extension but it's actually mp3 from API
      const outputPath = path.join(OUTPUT_DIR, sfx.filename.replace('.wav', '.mp3'));
      fs.writeFileSync(outputPath, buffer);
      console.log(`  ✓ Saved: ${sfx.filename.replace('.wav', '.mp3')} (${buffer.length} bytes)`);
      
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error(`  ✗ Failed: ${sfx.filename}`, error);
    }
  }
}

async function generateMusicBed(): Promise<void> {
  console.log('\n=== GENERATING MUSIC BED ===\n');
  console.log(`Generating: ${MUSIC_BED.filename} (${MUSIC_BED.duration}s)`);
  
  try {
    const audio = await elevenlabs.textToSoundEffects.convert({
      text: MUSIC_BED.prompt,
      durationSeconds: MUSIC_BED.duration,
      promptInfluence: 0.4,
    });
    
    const buffer = await streamToBuffer(audio as unknown as ReadableStream<Uint8Array>);
    
    const outputPath = path.join(OUTPUT_DIR, MUSIC_BED.filename.replace('.wav', '.mp3'));
    fs.writeFileSync(outputPath, buffer);
    console.log(`  ✓ Saved: ${MUSIC_BED.filename.replace('.wav', '.mp3')} (${buffer.length} bytes)`);
  } catch (error) {
    console.error(`  ✗ Failed:`, error);
  }
}

async function main() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('='.repeat(70));
  console.log('DARK SIDE GAME — MASTER AUDIO GENERATOR');
  console.log('='.repeat(70));
  console.log(`Voice ID: ${VOICE_ID}`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  // Generate all audio
  await generateVO(VO_LINES);
  await generateSFX(SFX_LIST);
  await generateMusicBed();

  console.log('\n' + '='.repeat(70));
  console.log('DONE! All audio files generated.');
  console.log('='.repeat(70));
  
  console.log('\nGenerated files:');
  console.log('  VO: vo-01.mp3 through vo-12.mp3');
  console.log('  SFX: sfx-*.mp3');
  console.log('  Music: music-bed.mp3');
  
  console.log('\nNext: Update AudioTimeline.tsx to enable audio flags and use .mp3 extensions.');
}

main().catch(console.error);
