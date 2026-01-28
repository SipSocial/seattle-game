/**
 * Audio Manager for Darkside Defense
 * Uses Web Audio API for sound effects
 * No external audio files - generates sounds procedurally
 */

class AudioManagerClass {
  private audioContext: AudioContext | null = null
  private enabled = true
  private volume = 0.5

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
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
   * Play a tackle sound - satisfying thump
   */
  public playTackle(): void {
    if (!this.enabled) return
    
    const ctx = this.getContext()
    const now = ctx.currentTime

    // Low thump
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.type = 'sine'
    osc.frequency.setValueAtTime(150, now)
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.1)
    
    gain.gain.setValueAtTime(this.volume * 0.4, now)
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
    
    noiseGain.gain.setValueAtTime(this.volume * 0.15, now)
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
    const now = ctx.currentTime

    // Deep bass hit
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.type = 'sine'
    osc.frequency.setValueAtTime(80, now)
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.2)
    
    gain.gain.setValueAtTime(this.volume * 0.6, now)
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
    const now = ctx.currentTime

    // Descending tone - sounds bad
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(400, now)
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.3)
    
    gain.gain.setValueAtTime(this.volume * 0.25, now)
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
      
      gain.gain.setValueAtTime(this.volume * 0.2, startTime)
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
    const now = ctx.currentTime

    // Ascending notes
    const notes = [400, 500, 600, 800]
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      const startTime = now + i * 0.1
      
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, startTime)
      
      gain.gain.setValueAtTime(this.volume * 0.25, startTime)
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
    const now = ctx.currentTime

    // Chunky confirmation sound
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.type = 'square'
    osc.frequency.setValueAtTime(200, now)
    osc.frequency.setValueAtTime(300, now + 0.05)
    osc.frequency.setValueAtTime(400, now + 0.1)
    
    gain.gain.setValueAtTime(this.volume * 0.15, now)
    gain.gain.setValueAtTime(this.volume * 0.2, now + 0.05)
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
      
      gain.gain.setValueAtTime(this.volume * 0.3, startTime)
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
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, now)
    
    gain.gain.setValueAtTime(this.volume * 0.1, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05)
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.start(now)
    osc.stop(now + 0.05)
  }

  /**
   * Resume audio context (needed after user interaction)
   */
  public resume(): void {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume()
    }
  }
}

// Singleton instance
export const AudioManager = new AudioManagerClass()
