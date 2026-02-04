/**
 * Render Splash Trailer
 * 
 * Renders the 15-second cinematic splash trailer
 * Output: public/video/trailer.mp4
 * 
 * Usage: npx ts-node scripts/render-splash-trailer.ts
 * Or: npm run render:splash
 */

import { execSync } from 'child_process';
import * as path from 'path';

const OUTPUT_PATH = path.join(__dirname, '../../public/video/trailer.mp4');

console.log('🎬 Rendering Splash Trailer...');
console.log('   Composition: SplashTrailer');
console.log('   Duration: 15 seconds');
console.log('   Resolution: 1080x1920 (9:16)');
console.log('   Output:', OUTPUT_PATH);
console.log('');

try {
  execSync(
    `npx remotion render src/index.ts SplashTrailer "${OUTPUT_PATH}" --codec h264 --crf 18`,
    {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
    }
  );
  
  console.log('');
  console.log('✅ Splash Trailer rendered successfully!');
  console.log('   Output:', OUTPUT_PATH);
} catch (error) {
  console.error('❌ Render failed:', error);
  process.exit(1);
}
