/**
 * Generate all VO lines for the Master Audio prompt
 * Each line is generated separately for precise timing control in Remotion
 * 
 * Run: npx ts-node scripts/generate-vo-master.ts
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

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'audio', 'vo');

// Voice: George - deep narrative voice (street-tech vibe: modern, slightly gritty, minimal)
// Alternative voices to try:
// - pNInz6obpgDQGcFmaJgB = Adam (deeper, more authoritative)
// - ErXwobaYiN019PkySvjV = Antoni (warm, confident)
// - 29vD33N1CtxCmqQRPOHJ = Drew (athletic, energetic)
const VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb'; // George

// VO Lines with exact frame numbers (30fps)
// Each line is generated as a separate file for precise Remotion sequencing
const VO_LINES = [
  // Scene 2: "JUST KIDDING" (frames 60-89)
  { 
    filename: 'vo-01-no-football.mp3', 
    text: 'No football this week?',
    frame: 72,
    note: 'questioning, slight pause after'
  },
  
  // Scene 3: "THE DARK SIDE GAME" (frames 90-179)
  { 
    filename: 'vo-02-just-kidding.mp3', 
    text: 'Just kidding.',
    frame: 102,
    note: 'confident smirk, short'
  },
  { 
    filename: 'vo-03-dark-side-game.mp3', 
    text: 'The Dark Side Game.',
    frame: 120,
    note: 'name drop - cool, certain, like dropping a title'
  },
  
  // Scene 4: Player carousel (frames 180-419)
  { 
    filename: 'vo-04-choose-defender.mp3', 
    text: 'Choose your defender.',
    frame: 210,
    note: 'direct command, clean'
  },
  { 
    filename: 'vo-05-command-defense.mp3', 
    text: 'Command the Dark Side Defense.',
    frame: 312,
    note: 'proud, powerful'
  },
  
  // Scene 5: "TACKLE / DEFEND / DOMINATE" (frames 420-539)
  { 
    filename: 'vo-06-tackle.mp3', 
    text: 'Tackle.',
    frame: 428,
    note: 'cold, minimal, one word'
  },
  { 
    filename: 'vo-07-defend.mp3', 
    text: 'Defend.',
    frame: 468,
    note: 'cold, minimal, one word'
  },
  { 
    filename: 'vo-08-dominate.mp3', 
    text: 'Dominate.',
    frame: 508,
    note: 'cold, minimal, slightly more weight'
  },
  
  // Scene 6: "WIN 2 SUPER BOWL TICKETS" (frames 540-689)
  { 
    filename: 'vo-09-win-tickets.mp3', 
    text: 'Win two Super Bowl tickets.',
    frame: 556,
    note: 'emotional peak, serious, not hype'
  },
  { 
    filename: 'vo-10-watch-live.mp3', 
    text: 'To watch it live.',
    frame: 600,
    note: 'weight, this matters'
  },
  
  // Scene 7: CTA (frames 690-899)
  { 
    filename: 'vo-11-play-now.mp3', 
    text: 'Play now.',
    frame: 708,
    note: 'direct CTA, confident'
  },
  { 
    filename: 'vo-12-url.mp3', 
    text: 'Game dot DrinkSip dot com.',
    frame: 732,
    note: 'slow, clear, each word distinct'
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

async function generateVO(line: typeof VO_LINES[0]): Promise<void> {
  console.log(`[Frame ${line.frame}] "${line.text}"`);
  console.log(`  Note: ${line.note}`);
  
  try {
    const audio = await elevenlabs.textToSpeech.convert(
      VOICE_ID,
      {
        text: line.text,
        modelId: 'eleven_multilingual_v2',
        outputFormat: 'mp3_44100_128',
        voiceSettings: {
          stability: 0.65,        // Slightly more stable for clarity
          similarityBoost: 0.8,   // Keep voice consistent
          style: 0.15,            // Subtle style - street-tech minimal
          useSpeakerBoost: true,
        },
      }
    );

    const outputPath = path.join(OUTPUT_DIR, line.filename);
    const buffer = await streamToBuffer(audio as unknown as ReadableStream<Uint8Array>);
    
    fs.writeFileSync(outputPath, buffer);
    console.log(`  ✓ Saved: ${line.filename} (${buffer.length} bytes)\n`);
  } catch (error) {
    console.error(`  ✗ Failed: ${line.filename}`, error);
  }
}

async function main() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('='.repeat(70));
  console.log('MASTER VO GENERATOR - DARK SIDE GAME COMMERCIAL');
  console.log('='.repeat(70));
  console.log(`Voice: George (street-tech vibe)`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Total lines: ${VO_LINES.length}\n`);

  // Generate all VO lines
  for (const line of VO_LINES) {
    await generateVO(line);
    // Small delay between API calls
    await new Promise(resolve => setTimeout(resolve, 400));
  }

  console.log('='.repeat(70));
  console.log('DONE! All VO lines generated.');
  console.log('='.repeat(70));
  
  console.log('\nVO SYNC REFERENCE:');
  console.log('-'.repeat(70));
  for (const line of VO_LINES) {
    const seconds = (line.frame / 30).toFixed(2);
    console.log(`Frame ${String(line.frame).padStart(3)}: (${seconds}s) "${line.text}"`);
  }
  console.log('-'.repeat(70));
  
  console.log('\nREMOTION USAGE:');
  console.log(`
// Add to VideoVerticalV8Audio.tsx:
${VO_LINES.map(l => `<Sequence from={${l.frame}}><Audio src={staticFile('audio/vo/${l.filename}')} volume={1} /></Sequence>`).join('\n')}
`);
}

main().catch(console.error);
