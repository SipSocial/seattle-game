/**
 * Game Sound Effects Manager
 * 
 * Handles all sound effects for the QB game:
 * - Snap sound
 * - Throw whoosh
 * - Catch thud
 * - Crowd reactions
 * - Touchdown celebration
 * - Whistle
 */

// Sound effect types
export type SoundEffect = 
  | 'snap'
  | 'throw'
  | 'catch'
  | 'drop'
  | 'touchdown'
  | 'crowd_cheer'
  | 'crowd_groan'
  | 'crowd_roar'
  | 'whistle'
  | 'sack'
  | 'interception'
  | 'hit'
  | 'first_down'

// Audio context singleton
let audioContext: AudioContext | null = null

// Ambient crowd noise state
let ambientNoiseSource: AudioBufferSourceNode | null = null
let ambientGainNode: GainNode | null = null
let isAmbientPlaying = false

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  return audioContext
}

// Generate synthetic sound effects using Web Audio API
function generateTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.3
): void {
  try {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
  } catch {
    // Audio not available
  }
}

function generateNoise(duration: number, volume: number = 0.1): void {
  try {
    const ctx = getAudioContext()
    const bufferSize = ctx.sampleRate * duration
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = buffer.getChannelData(0)
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * volume
    }
    
    const source = ctx.createBufferSource()
    source.buffer = buffer
    
    const gainNode = ctx.createGain()
    gainNode.gain.setValueAtTime(volume, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    
    source.connect(gainNode)
    gainNode.connect(ctx.destination)
    source.start(ctx.currentTime)
  } catch {
    // Audio not available
  }
}

// Generate ambient crowd noise (looping)
function createAmbientCrowd(): void {
  if (isAmbientPlaying) return
  
  try {
    const ctx = getAudioContext()
    const bufferSize = ctx.sampleRate * 2 // 2 second loop
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate) // Stereo
    
    // Generate filtered noise that sounds like distant crowd
    for (let channel = 0; channel < 2; channel++) {
      const output = buffer.getChannelData(channel)
      let lastValue = 0
      
      for (let i = 0; i < bufferSize; i++) {
        // Low-pass filtered noise (sounds more like crowd rumble)
        const noise = Math.random() * 2 - 1
        lastValue = lastValue * 0.95 + noise * 0.05
        output[i] = lastValue * 0.3
      }
    }
    
    ambientNoiseSource = ctx.createBufferSource()
    ambientNoiseSource.buffer = buffer
    ambientNoiseSource.loop = true
    
    ambientGainNode = ctx.createGain()
    ambientGainNode.gain.setValueAtTime(0.08, ctx.currentTime) // Low volume
    
    // Add some filtering for more realistic crowd sound
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(800, ctx.currentTime)
    
    ambientNoiseSource.connect(filter)
    filter.connect(ambientGainNode)
    ambientGainNode.connect(ctx.destination)
    
    ambientNoiseSource.start(ctx.currentTime)
    isAmbientPlaying = true
  } catch {
    // Audio not available
  }
}

// Surge crowd volume (for big plays)
function surgeCrowd(intensity: number = 1.5, duration: number = 2): void {
  if (!ambientGainNode) return
  
  try {
    const ctx = getAudioContext()
    const baseVolume = 0.08
    ambientGainNode.gain.cancelScheduledValues(ctx.currentTime)
    ambientGainNode.gain.setValueAtTime(baseVolume * intensity, ctx.currentTime)
    ambientGainNode.gain.exponentialRampToValueAtTime(baseVolume, ctx.currentTime + duration)
  } catch {
    // Audio not available
  }
}

// Sound effect implementations
const soundEffects: Record<SoundEffect, () => void> = {
  snap: () => {
    // Quick low thud
    generateTone(80, 0.08, 'triangle', 0.4)
    generateNoise(0.05, 0.2)
  },
  
  throw: () => {
    // Whoosh sound - rising frequency
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(200, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2)
    
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.3)
    
    // Add some air noise
    generateNoise(0.2, 0.08)
  },
  
  catch: () => {
    // Satisfying thud + leather sound
    generateTone(150, 0.1, 'triangle', 0.35)
    generateTone(300, 0.05, 'square', 0.1)
    generateNoise(0.08, 0.15)
  },
  
  drop: () => {
    // Dull thud
    generateTone(60, 0.15, 'sine', 0.2)
    generateNoise(0.1, 0.1)
  },
  
  touchdown: () => {
    // Triumphant chord
    generateTone(261, 0.5, 'sine', 0.25) // C
    setTimeout(() => generateTone(329, 0.4, 'sine', 0.2), 50) // E
    setTimeout(() => generateTone(392, 0.35, 'sine', 0.2), 100) // G
    setTimeout(() => generateTone(523, 0.6, 'sine', 0.3), 150) // High C
    
    // Crowd cheer
    setTimeout(() => {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => generateNoise(0.3, 0.1), i * 100)
      }
    }, 200)
  },
  
  crowd_cheer: () => {
    // Multiple bursts of noise with varying intensity
    for (let i = 0; i < 3; i++) {
      setTimeout(() => generateNoise(0.4, 0.15 - i * 0.03), i * 150)
    }
  },
  
  crowd_groan: () => {
    // Low rumble
    generateTone(80, 0.5, 'sine', 0.15)
    generateNoise(0.4, 0.05)
  },
  
  whistle: () => {
    // Sharp whistle sound
    generateTone(1200, 0.3, 'sine', 0.25)
    setTimeout(() => generateTone(1000, 0.2, 'sine', 0.2), 350)
  },
  
  sack: () => {
    // Heavy impact
    generateTone(50, 0.2, 'triangle', 0.5)
    generateNoise(0.15, 0.25)
    setTimeout(() => generateNoise(0.1, 0.1), 100)
  },
  
  interception: () => {
    // Negative sound
    generateTone(400, 0.1, 'sawtooth', 0.15)
    setTimeout(() => generateTone(300, 0.15, 'sawtooth', 0.12), 100)
    setTimeout(() => generateTone(200, 0.2, 'sawtooth', 0.1), 200)
  },
  
  crowd_roar: () => {
    // Intense crowd roar for touchdowns
    surgeCrowd(3, 4)
    for (let i = 0; i < 8; i++) {
      setTimeout(() => generateNoise(0.5, 0.2 - i * 0.02), i * 100)
    }
  },
  
  hit: () => {
    // Tackle/hit sound
    generateTone(80, 0.12, 'triangle', 0.4)
    generateNoise(0.1, 0.2)
    setTimeout(() => generateNoise(0.08, 0.1), 50)
  },
  
  first_down: () => {
    // Positive ding + crowd surge
    generateTone(523, 0.15, 'sine', 0.2) // High C
    generateTone(659, 0.2, 'sine', 0.15) // E
    surgeCrowd(1.5, 1.5)
  },
}

// Public API
export function playSound(effect: SoundEffect): void {
  if (typeof window === 'undefined') return
  
  try {
    soundEffects[effect]?.()
  } catch {
    // Silently fail if audio not available
  }
}

// Resume audio context on user interaction (required for mobile)
export function resumeAudioContext(): void {
  if (audioContext?.state === 'suspended') {
    audioContext.resume()
  }
}

// Start ambient crowd noise
export function startAmbientCrowd(): void {
  resumeAudioContext()
  createAmbientCrowd()
}

// Stop ambient crowd noise
export function stopAmbientCrowd(): void {
  if (ambientNoiseSource) {
    try {
      ambientNoiseSource.stop()
    } catch {
      // Already stopped
    }
    ambientNoiseSource = null
    isAmbientPlaying = false
  }
}

// Surge crowd for big plays
export function crowdReaction(type: 'cheer' | 'roar' | 'groan'): void {
  switch (type) {
    case 'roar':
      playSound('crowd_roar')
      break
    case 'cheer':
      playSound('crowd_cheer')
      surgeCrowd(1.3, 1)
      break
    case 'groan':
      playSound('crowd_groan')
      break
  }
}

// Map phase transitions to sounds
export function playSoundForPhase(phase: string, previousPhase: string): void {
  if (phase === previousPhase) return
  
  switch (phase) {
    case 'SNAP':
      playSound('snap')
      break
    case 'THROW':
      playSound('throw')
      break
    case 'BALL_FLIGHT':
      // Sound handled when catch happens
      break
  }
}

// Map results to sounds
export function playSoundForResult(outcome: string, isFirstDown: boolean = false): void {
  switch (outcome) {
    case 'touchdown':
      playSound('touchdown')
      crowdReaction('roar')
      break
    case 'complete':
      playSound('catch')
      if (isFirstDown) {
        playSound('first_down')
      } else {
        crowdReaction('cheer')
      }
      break
    case 'incomplete':
      playSound('drop')
      crowdReaction('groan')
      break
    case 'interception':
      playSound('interception')
      playSound('hit')
      crowdReaction('groan')
      break
    case 'sack':
      playSound('sack')
      playSound('hit')
      crowdReaction('groan')
      break
  }
}
