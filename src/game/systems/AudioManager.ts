/**
 * Audio Manager for Darkside Defense
 * Uses Web Audio API for sound effects
 * No external audio files - generates sounds procedurally
 */

class AudioManagerClass {
  private audioContext: AudioContext | null = null
  private enabled = true
  private volume = 0.7 // Increased for mobile
  private unlocked = false
  private crowdAmbientNode: OscillatorNode | null = null
  private crowdGainNode: GainNode | null = null
  private crowdIntensity = 1.0 // 0-1, controlled by stage

  private getContext(): AudioContext | null {
    // Don't create context until user has interacted
    if (!this.unlocked) return null
    
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      } catch (e) {
        console.warn('Web Audio API not supported')
        return null
      }
    }
    return this.audioContext
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol))
  }

  /**
   * Unlock audio - MUST be called from a user interaction event
   * This creates the audio context and resumes it
   */
  public unlock(): void {
    if (this.unlocked) return
    
    try {
      // Create context during user interaction
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Resume if suspended
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume()
      }
      
      // Play a silent sound to fully unlock on iOS
      const buffer = this.audioContext.createBuffer(1, 1, 22050)
      const source = this.audioContext.createBufferSource()
      source.buffer = buffer
      source.connect(this.audioContext.destination)
      source.start(0)
      
      this.unlocked = true
      console.log('Audio unlocked')
    } catch (e) {
      console.warn('Failed to unlock audio:', e)
    }
  }

  /**
   * Resume audio context (alias for unlock for compatibility)
   */
  public resume(): void {
    this.unlock()
  }

  /**
   * Play a tackle sound - satisfying thump
   */
  public playTackle(): void {
    if (!this.enabled) return
    
    const ctx = this.getContext()
    if (!ctx) return
    
    const now = ctx.currentTime

    // Low thump
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.type = 'sine'
    osc.frequency.setValueAtTime(150, now)
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.1)
    
    gain.gain.setValueAtTime(this.volume * 0.5, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.start(now)
    osc.stop(now + 0.15)

    // Click layer
    const noise = ctx.createOscillator()
    const noiseGain = ctx.createGain()
    
    noise.type = 'square'
    noise.frequency.setValueAtTime(300, now)
    noise.frequency.exponentialRampToValueAtTime(100, now + 0.05)
    
    noiseGain.gain.setValueAtTime(this.volume * 0.2, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08)
    
    noise.connect(noiseGain)
    noiseGain.connect(ctx.destination)
    
    noise.start(now)
    noise.stop(now + 0.08)
  }

  /**
   * Play big tackle sound - for tanks
   */
  public playBigTackle(): void {
    if (!this.enabled) return
    
    const ctx = this.getContext()
    if (!ctx) return
    
    const now = ctx.currentTime

    // Deep bass hit
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.type = 'sine'
    osc.frequency.setValueAtTime(80, now)
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.2)
    
    gain.gain.setValueAtTime(this.volume * 0.7, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25)
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.start(now)
    osc.stop(now + 0.25)
  }

  /**
   * Play touchdown/enemy scored sound - negative feedback
   */
  public playTouchdown(): void {
    if (!this.enabled) return
    
    const ctx = this.getContext()
    if (!ctx) return
    
    const now = ctx.currentTime

    // Descending tone - sounds bad
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(400, now)
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.3)
    
    gain.gain.setValueAtTime(this.volume * 0.3, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35)
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.start(now)
    osc.stop(now + 0.35)
  }

  /**
   * Play power-up collect sound - refreshing pop
   */
  public playPowerUp(): void {
    if (!this.enabled) return
    
    const ctx = this.getContext()
    if (!ctx) return
    
    const now = ctx.currentTime

    // Rising sparkle
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      const startTime = now + i * 0.05
      const freq = 600 + i * 200
      
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, startTime)
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, startTime + 0.1)
      
      gain.gain.setValueAtTime(this.volume * 0.25, startTime)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15)
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      osc.start(startTime)
      osc.stop(startTime + 0.15)
    }
  }

  /**
   * Play wave complete sound - victory fanfare
   */
  public playWaveComplete(): void {
    if (!this.enabled) return
    
    const ctx = this.getContext()
    if (!ctx) return
    
    const now = ctx.currentTime

    // Ascending notes
    const notes = [400, 500, 600, 800]
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      const startTime = now + i * 0.1
      
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, startTime)
      
      gain.gain.setValueAtTime(this.volume * 0.3, startTime)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2)
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      osc.start(startTime)
      osc.stop(startTime + 0.25)
    })
  }

  /**
   * Play upgrade selected sound
   */
  public playUpgrade(): void {
    if (!this.enabled) return
    
    const ctx = this.getContext()
    if (!ctx) return
    
    const now = ctx.currentTime

    // Chunky confirmation sound
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.type = 'square'
    osc.frequency.setValueAtTime(200, now)
    osc.frequency.setValueAtTime(300, now + 0.05)
    osc.frequency.setValueAtTime(400, now + 0.1)
    
    gain.gain.setValueAtTime(this.volume * 0.2, now)
    gain.gain.setValueAtTime(this.volume * 0.25, now + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2)
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.start(now)
    osc.stop(now + 0.2)
  }

  /**
   * Play game over sound
   */
  public playGameOver(): void {
    if (!this.enabled) return
    
    const ctx = this.getContext()
    if (!ctx) return
    
    const now = ctx.currentTime

    // Sad descending tones
    const notes = [400, 350, 300, 200]
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      const startTime = now + i * 0.15
      
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, startTime)
      osc.frequency.exponentialRampToValueAtTime(freq * 0.8, startTime + 0.2)
      
      gain.gain.setValueAtTime(this.volume * 0.35, startTime)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3)
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      osc.start(startTime)
      osc.stop(startTime + 0.35)
    })
  }

  /**
   * Play UI click sound
   */
  public playClick(): void {
    if (!this.enabled) return
    
    const ctx = this.getContext()
    if (!ctx) return
    
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, now)
    
    gain.gain.setValueAtTime(this.volume * 0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05)
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.start(now)
    osc.stop(now + 0.05)
  }

  /**
   * Play 12th Man crowd roar - epic stadium eruption sound
   * Used when the fan meter activates
   */
  public playCrowdRoar(): void {
    if (!this.enabled) return
    
    const ctx = this.getContext()
    if (!ctx) return
    
    const now = ctx.currentTime

    // Create layered crowd noise effect using filtered noise
    // Layer 1: Low rumble (crowd roar base)
    const lowOsc = ctx.createOscillator()
    const lowGain = ctx.createGain()
    
    lowOsc.type = 'sawtooth'
    lowOsc.frequency.setValueAtTime(60, now)
    lowOsc.frequency.linearRampToValueAtTime(80, now + 0.3)
    lowOsc.frequency.linearRampToValueAtTime(60, now + 1.0)
    
    lowGain.gain.setValueAtTime(0, now)
    lowGain.gain.linearRampToValueAtTime(this.volume * 0.4, now + 0.15)
    lowGain.gain.setValueAtTime(this.volume * 0.4, now + 0.8)
    lowGain.gain.exponentialRampToValueAtTime(0.01, now + 1.5)
    
    lowOsc.connect(lowGain)
    lowGain.connect(ctx.destination)
    
    lowOsc.start(now)
    lowOsc.stop(now + 1.5)
    
    // Layer 2: Mid-frequency crowd noise
    const midOsc = ctx.createOscillator()
    const midGain = ctx.createGain()
    
    midOsc.type = 'triangle'
    midOsc.frequency.setValueAtTime(200, now)
    midOsc.frequency.linearRampToValueAtTime(300, now + 0.2)
    midOsc.frequency.linearRampToValueAtTime(250, now + 0.8)
    
    midGain.gain.setValueAtTime(0, now)
    midGain.gain.linearRampToValueAtTime(this.volume * 0.3, now + 0.1)
    midGain.gain.exponentialRampToValueAtTime(0.01, now + 1.2)
    
    midOsc.connect(midGain)
    midGain.connect(ctx.destination)
    
    midOsc.start(now)
    midOsc.stop(now + 1.2)
    
    // Layer 3: High frequency "roar" harmonics
    for (let i = 0; i < 4; i++) {
      const highOsc = ctx.createOscillator()
      const highGain = ctx.createGain()
      
      const startTime = now + i * 0.05
      const freq = 400 + i * 100 + Math.random() * 50
      
      highOsc.type = 'sine'
      highOsc.frequency.setValueAtTime(freq, startTime)
      highOsc.frequency.linearRampToValueAtTime(freq * 1.2, startTime + 0.3)
      
      highGain.gain.setValueAtTime(0, startTime)
      highGain.gain.linearRampToValueAtTime(this.volume * 0.15, startTime + 0.1)
      highGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.8)
      
      highOsc.connect(highGain)
      highGain.connect(ctx.destination)
      
      highOsc.start(startTime)
      highOsc.stop(startTime + 0.8)
    }
    
    // Impact boom at start
    const boom = ctx.createOscillator()
    const boomGain = ctx.createGain()
    
    boom.type = 'sine'
    boom.frequency.setValueAtTime(100, now)
    boom.frequency.exponentialRampToValueAtTime(30, now + 0.3)
    
    boomGain.gain.setValueAtTime(this.volume * 0.6, now)
    boomGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4)
    
    boom.connect(boomGain)
    boomGain.connect(ctx.destination)
    
    boom.start(now)
    boom.stop(now + 0.4)
  }

  /**
   * Play fan meter building sound - anticipation effect
   */
  public playFanMeterPulse(): void {
    if (!this.enabled) return
    
    const ctx = this.getContext()
    if (!ctx) return
    
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.type = 'sine'
    osc.frequency.setValueAtTime(150, now)
    osc.frequency.linearRampToValueAtTime(200, now + 0.1)
    
    gain.gain.setValueAtTime(this.volume * 0.1, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.start(now)
    osc.stop(now + 0.15)
  }
  
  /**
   * Set crowd intensity level (0-1)
   * Used by campaign mode to match stage atmosphere
   */
  public setCrowdIntensity(intensity: number): void {
    this.crowdIntensity = Math.max(0, Math.min(1, intensity))
    
    // Update gain if ambient is playing
    if (this.crowdGainNode) {
      this.crowdGainNode.gain.setTargetAtTime(
        this.volume * 0.15 * this.crowdIntensity,
        this.audioContext?.currentTime || 0,
        0.5
      )
    }
  }
  
  /**
   * Play a crowd cheer burst - intensity-aware
   */
  public playCrowdCheer(): void {
    if (!this.enabled) return
    
    const ctx = this.getContext()
    if (!ctx) return
    
    const now = ctx.currentTime
    const intensity = this.crowdIntensity

    // Scale cheer based on crowd intensity
    const cheerVolume = this.volume * 0.3 * intensity
    
    // Multi-layer cheer
    const layers = Math.ceil(intensity * 4) // More layers for higher intensity
    
    for (let i = 0; i < layers; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      const startTime = now + i * 0.03
      const freq = 200 + i * 50 + Math.random() * 30
      
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, startTime)
      osc.frequency.linearRampToValueAtTime(freq * 1.2, startTime + 0.15)
      
      gain.gain.setValueAtTime(cheerVolume * 0.5, startTime)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4)
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      osc.start(startTime)
      osc.stop(startTime + 0.4)
    }
  }
  
  /**
   * Play boss warning horn - epic low horn sound
   */
  public playBossWarning(): void {
    if (!this.enabled) return
    
    const ctx = this.getContext()
    if (!ctx) return
    
    const now = ctx.currentTime

    // Deep horn
    const horn = ctx.createOscillator()
    const hornGain = ctx.createGain()
    
    horn.type = 'sawtooth'
    horn.frequency.setValueAtTime(100, now)
    horn.frequency.linearRampToValueAtTime(80, now + 0.5)
    
    hornGain.gain.setValueAtTime(this.volume * 0.5, now)
    hornGain.gain.setValueAtTime(this.volume * 0.5, now + 0.3)
    hornGain.gain.exponentialRampToValueAtTime(0.01, now + 0.8)
    
    horn.connect(hornGain)
    hornGain.connect(ctx.destination)
    
    horn.start(now)
    horn.stop(now + 0.8)
    
    // Ominous sub bass
    const sub = ctx.createOscillator()
    const subGain = ctx.createGain()
    
    sub.type = 'sine'
    sub.frequency.setValueAtTime(40, now)
    
    subGain.gain.setValueAtTime(this.volume * 0.6, now)
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 1.0)
    
    sub.connect(subGain)
    subGain.connect(ctx.destination)
    
    sub.start(now)
    sub.stop(now + 1.0)
  }
  
  /**
   * Play victory touchdown fanfare - celebratory
   */
  public playVictoryFanfare(): void {
    if (!this.enabled) return
    
    const ctx = this.getContext()
    if (!ctx) return
    
    const now = ctx.currentTime

    // Major chord progression
    const notes = [
      { freq: 523, delay: 0 }, // C5
      { freq: 659, delay: 0 }, // E5
      { freq: 784, delay: 0 }, // G5
      { freq: 1047, delay: 0.3 }, // C6
    ]
    
    notes.forEach(({ freq, delay }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + delay)
      
      gain.gain.setValueAtTime(this.volume * 0.25, now + delay)
      gain.gain.setValueAtTime(this.volume * 0.25, now + delay + 0.3)
      gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.6)
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      osc.start(now + delay)
      osc.stop(now + delay + 0.6)
    })
  }
}

// Singleton instance
export const AudioManager = new AudioManagerClass()
