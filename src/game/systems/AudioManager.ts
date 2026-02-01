/**
 * Audio Manager for Dark Side Game
 * Professional-grade Web Audio API implementation
 * 
 * Features:
 * - Robust initialization with extensive debugging
 * - Distinctive, musically-designed sounds
 * - ADSR envelopes for professional sound shaping
 * - Proper gain staging and mixing
 * - Comprehensive error handling and logging
 */

// Debug mode - set to true to see all audio events in console
const DEBUG_AUDIO = true

function log(...args: unknown[]) {
  if (DEBUG_AUDIO) {
    console.log('[Audio]', ...args)
  }
}

function warn(...args: unknown[]) {
  console.warn('[Audio]', ...args)
}

// Audio state
enum AudioState {
  UNINITIALIZED = 'UNINITIALIZED',
  SUSPENDED = 'SUSPENDED',
  RUNNING = 'RUNNING',
  CLOSED = 'CLOSED',
}

class AudioManagerClass {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private state: AudioState = AudioState.UNINITIALIZED
  private enabled = true
  private volume = 0.8
  private initAttempts = 0
  private maxInitAttempts = 3
  
  // Track sounds played for debugging
  private soundsPlayed = 0
  private lastSoundTime = 0
  
  // State change listeners
  private stateListeners: Set<(state: AudioState) => void> = new Set()
  
  // ============================================
  // INITIALIZATION
  // ============================================
  
  /**
   * Initialize the audio context
   * Call this as early as possible
   */
  public init(): boolean {
    if (this.ctx && this.state !== AudioState.CLOSED) {
      log('Already initialized, state:', this.state)
      return true
    }
    
    if (typeof window === 'undefined') {
      warn('No window object - SSR environment')
      return false
    }
    
    this.initAttempts++
    log(`Initializing audio (attempt ${this.initAttempts}/${this.maxInitAttempts})...`)
    
    try {
      const AudioContextClass = window.AudioContext || 
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      
      if (!AudioContextClass) {
        warn('Web Audio API not supported in this browser')
        return false
      }
      
      this.ctx = new AudioContextClass()
      
      // Create master gain node
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.value = this.volume
      this.masterGain.connect(this.ctx.destination)
      
      // Update state
      this.syncState()
      
      // Listen for state changes
      this.ctx.addEventListener('statechange', () => {
        this.syncState()
      })
      
      log('Initialized successfully!')
      log('  Sample rate:', this.ctx.sampleRate)
      log('  State:', this.ctx.state)
      log('  Base latency:', this.ctx.baseLatency, 'ms')
      
      return true
    } catch (e) {
      warn('Failed to initialize:', e)
      return false
    }
  }
  
  private syncState(): void {
    if (!this.ctx) {
      this.setState(AudioState.UNINITIALIZED)
      return
    }
    
    switch (this.ctx.state) {
      case 'suspended': this.setState(AudioState.SUSPENDED); break
      case 'running': this.setState(AudioState.RUNNING); break
      case 'closed': this.setState(AudioState.CLOSED); break
    }
  }
  
  private setState(newState: AudioState): void {
    if (this.state === newState) return
    
    const prevState = this.state
    this.state = newState
    
    log('State changed:', prevState, '->', newState)
    
    // Notify listeners
    this.stateListeners.forEach(listener => {
      try {
        listener(newState)
      } catch (e) {
        warn('State listener error:', e)
      }
    })
  }
  
  /**
   * Subscribe to state changes
   * Returns unsubscribe function
   */
  public onStateChange(listener: (state: AudioState) => void): () => void {
    this.stateListeners.add(listener)
    return () => {
      this.stateListeners.delete(listener)
    }
  }
  
  /**
   * Unlock audio - MUST be called from user interaction
   */
  public async unlock(): Promise<boolean> {
    log('Unlock requested...')
    
    // Initialize if needed
    if (!this.ctx) {
      if (!this.init()) {
        warn('Failed to init during unlock')
        return false
      }
    }
    
    if (!this.ctx) {
      warn('No context after init')
      return false
    }
    
    // Already running?
    if (this.ctx.state === 'running') {
      log('Already running!')
      return true
    }
    
    try {
      log('Resuming context...')
      await this.ctx.resume()
      
      // iOS needs a silent sound to fully unlock
      log('Playing silent buffer for iOS...')
      await this.playSilent()
      
      this.syncState()
      
      // Use our internal state tracking
      const success = this.state === AudioState.RUNNING
      log('Unlock result:', success ? 'SUCCESS' : 'FAILED', '- state:', this.state)
      
      if (success) {
        // Play a test sound to confirm
        this.playTestBeep()
      }
      
      return success
    } catch (e) {
      warn('Unlock failed:', e)
      return false
    }
  }
  
  private async playSilent(): Promise<void> {
    if (!this.ctx) return
    
    const buffer = this.ctx.createBuffer(1, 1, 22050)
    const source = this.ctx.createBufferSource()
    source.buffer = buffer
    source.connect(this.ctx.destination)
    source.start(0)
    
    return new Promise(resolve => {
      source.onended = () => resolve()
      setTimeout(resolve, 50)
    })
  }
  
  /**
   * Quick test beep to confirm audio is working
   */
  private playTestBeep(): void {
    if (!this.ctx || !this.masterGain) return
    
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    
    osc.type = 'sine'
    osc.frequency.value = 440
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1)
    
    osc.connect(gain)
    gain.connect(this.masterGain)
    
    osc.start()
    osc.stop(this.ctx.currentTime + 0.1)
    
    log('Test beep played')
  }
  
  // Alias for backwards compatibility
  public resume(): Promise<boolean> {
    return this.unlock()
  }
  
  // ============================================
  // SETTINGS
  // ============================================
  
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled
    log('Enabled:', enabled)
  }
  
  public isEnabled(): boolean {
    return this.enabled
  }
  
  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol))
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05)
    }
    log('Volume:', this.volume)
  }
  
  public getVolume(): number {
    return this.volume
  }
  
  public getState(): AudioState {
    return this.state
  }
  
  public isReady(): boolean {
    return this.state === AudioState.RUNNING
  }
  
  public getStats(): { soundsPlayed: number; lastSoundTime: number; state: string } {
    return {
      soundsPlayed: this.soundsPlayed,
      lastSoundTime: this.lastSoundTime,
      state: this.state,
    }
  }
  
  // ============================================
  // SOUND HELPERS
  // ============================================
  
  private canPlay(): boolean {
    if (!this.enabled) {
      log('Sound skipped - disabled')
      return false
    }
    
    if (!this.ctx || !this.masterGain) {
      log('Sound skipped - no context')
      return false
    }
    
    if (this.state !== AudioState.RUNNING) {
      log('Sound skipped - state:', this.state)
      // Try to init/unlock
      this.unlock()
      return false
    }
    
    return true
  }
  
  private trackSound(name: string): void {
    this.soundsPlayed++
    this.lastSoundTime = Date.now()
    log(`Playing: ${name} (#${this.soundsPlayed})`)
  }
  
  private now(): number {
    return this.ctx?.currentTime ?? 0
  }
  
  /**
   * Create an oscillator with gain, connected to master
   */
  private osc(type: OscillatorType = 'sine'): { o: OscillatorNode; g: GainNode } | null {
    if (!this.ctx || !this.masterGain) return null
    
    const o = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    
    o.type = type
    o.connect(g)
    g.connect(this.masterGain)
    
    return { o, g }
  }
  
  /**
   * Create a noise source (white noise)
   */
  private noise(duration: number): { source: AudioBufferSourceNode; g: GainNode } | null {
    if (!this.ctx || !this.masterGain) return null
    
    const bufferSize = this.ctx.sampleRate * duration
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }
    
    const source = this.ctx.createBufferSource()
    source.buffer = buffer
    
    const g = this.ctx.createGain()
    source.connect(g)
    g.connect(this.masterGain)
    
    return { source, g }
  }
  
  // ============================================
  // UI SOUNDS - Distinctive & Musical
  // ============================================
  
  /**
   * CLICK - Primary button press
   * Punchy, satisfying click with sub bass
   */
  public playClick(): void {
    if (!this.canPlay()) return
    this.trackSound('click')
    
    const t = this.now()
    
    // Main click - sine with fast attack
    const main = this.osc('sine')
    if (main) {
      main.o.frequency.setValueAtTime(800, t)
      main.o.frequency.exponentialRampToValueAtTime(400, t + 0.05)
      
      main.g.gain.setValueAtTime(0.3, t)
      main.g.gain.exponentialRampToValueAtTime(0.001, t + 0.08)
      
      main.o.start(t)
      main.o.stop(t + 0.08)
    }
    
    // Sub thump
    const sub = this.osc('sine')
    if (sub) {
      sub.o.frequency.setValueAtTime(150, t)
      sub.o.frequency.exponentialRampToValueAtTime(60, t + 0.06)
      
      sub.g.gain.setValueAtTime(0.25, t)
      sub.g.gain.exponentialRampToValueAtTime(0.001, t + 0.1)
      
      sub.o.start(t)
      sub.o.stop(t + 0.1)
    }
  }
  
  /**
   * NAVIGATE - Arrow/pagination click
   * Quick, snappy tick
   */
  public playNavigate(): void {
    if (!this.canPlay()) return
    this.trackSound('navigate')
    
    const t = this.now()
    
    // High tick
    const tick = this.osc('triangle')
    if (tick) {
      tick.o.frequency.setValueAtTime(2000, t)
      tick.o.frequency.exponentialRampToValueAtTime(1200, t + 0.02)
      
      tick.g.gain.setValueAtTime(0.15, t)
      tick.g.gain.exponentialRampToValueAtTime(0.001, t + 0.04)
      
      tick.o.start(t)
      tick.o.stop(t + 0.04)
    }
    
    // Body
    const body = this.osc('sine')
    if (body) {
      body.o.frequency.setValueAtTime(600, t)
      body.o.frequency.exponentialRampToValueAtTime(400, t + 0.03)
      
      body.g.gain.setValueAtTime(0.12, t)
      body.g.gain.exponentialRampToValueAtTime(0.001, t + 0.05)
      
      body.o.start(t)
      body.o.stop(t + 0.05)
    }
  }
  
  /**
   * CONFIRM - Primary action confirmation
   * Triumphant major chord with shimmer
   */
  public playConfirm(): void {
    if (!this.canPlay()) return
    this.trackSound('confirm')
    
    const t = this.now()
    
    // C major chord: C4, E4, G4
    const freqs = [261.63, 329.63, 392.00]
    
    freqs.forEach((freq, i) => {
      const node = this.osc('sine')
      if (!node) return
      
      const start = t + i * 0.015
      
      node.o.frequency.setValueAtTime(freq, start)
      node.o.frequency.exponentialRampToValueAtTime(freq * 1.01, start + 0.15)
      
      node.g.gain.setValueAtTime(0.2, start)
      node.g.gain.linearRampToValueAtTime(0.15, start + 0.1)
      node.g.gain.exponentialRampToValueAtTime(0.001, start + 0.3)
      
      node.o.start(start)
      node.o.stop(start + 0.3)
    })
    
    // High sparkle
    const sparkle = this.osc('sine')
    if (sparkle) {
      sparkle.o.frequency.setValueAtTime(1568, t + 0.05) // G5
      
      sparkle.g.gain.setValueAtTime(0.1, t + 0.05)
      sparkle.g.gain.exponentialRampToValueAtTime(0.001, t + 0.25)
      
      sparkle.o.start(t + 0.05)
      sparkle.o.stop(t + 0.25)
    }
    
    // Impact
    const impact = this.osc('sine')
    if (impact) {
      impact.o.frequency.setValueAtTime(130, t)
      impact.o.frequency.exponentialRampToValueAtTime(65, t + 0.1)
      
      impact.g.gain.setValueAtTime(0.3, t)
      impact.g.gain.exponentialRampToValueAtTime(0.001, t + 0.15)
      
      impact.o.start(t)
      impact.o.stop(t + 0.15)
    }
  }
  
  /**
   * MENU CLICK - Secondary button
   * Softer, warmer click
   */
  public playMenuClick(): void {
    if (!this.canPlay()) return
    this.trackSound('menuClick')
    
    const t = this.now()
    
    // Warm tone
    const main = this.osc('sine')
    if (main) {
      main.o.frequency.setValueAtTime(600, t)
      main.o.frequency.exponentialRampToValueAtTime(450, t + 0.04)
      
      main.g.gain.setValueAtTime(0.18, t)
      main.g.gain.exponentialRampToValueAtTime(0.001, t + 0.08)
      
      main.o.start(t)
      main.o.stop(t + 0.08)
    }
    
    // Soft harmonic
    const harm = this.osc('triangle')
    if (harm) {
      harm.o.frequency.setValueAtTime(900, t)
      
      harm.g.gain.setValueAtTime(0.06, t)
      harm.g.gain.exponentialRampToValueAtTime(0.001, t + 0.05)
      
      harm.o.start(t)
      harm.o.stop(t + 0.05)
    }
  }
  
  /**
   * PLAYER SWIPE - Carousel navigation
   * Whooshy, energetic swipe
   */
  public playPlayerSwipe(): void {
    if (!this.canPlay()) return
    this.trackSound('playerSwipe')
    
    const t = this.now()
    
    // Swoosh up
    const swoosh = this.osc('sawtooth')
    if (swoosh) {
      swoosh.o.frequency.setValueAtTime(200, t)
      swoosh.o.frequency.exponentialRampToValueAtTime(800, t + 0.08)
      swoosh.o.frequency.exponentialRampToValueAtTime(400, t + 0.15)
      
      swoosh.g.gain.setValueAtTime(0.08, t)
      swoosh.g.gain.linearRampToValueAtTime(0.12, t + 0.05)
      swoosh.g.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
      
      swoosh.o.start(t)
      swoosh.o.stop(t + 0.18)
    }
    
    // Air texture
    const noise = this.noise(0.15)
    if (noise) {
      noise.g.gain.setValueAtTime(0.03, t)
      noise.g.gain.linearRampToValueAtTime(0.05, t + 0.05)
      noise.g.gain.exponentialRampToValueAtTime(0.001, t + 0.15)
      
      noise.source.start(t)
      noise.source.stop(t + 0.15)
    }
  }
  
  /**
   * PLAYER SELECT - Choosing a player
   * Epic, heroic confirmation
   */
  public playPlayerSelect(): void {
    if (!this.canPlay()) return
    this.trackSound('playerSelect')
    
    const t = this.now()
    
    // Power chord: G2, D3, G3, B3, D4
    const freqs = [98, 147, 196, 247, 294]
    
    freqs.forEach((freq, i) => {
      const node = this.osc('sine')
      if (!node) return
      
      const start = t + i * 0.01
      
      node.o.frequency.setValueAtTime(freq, start)
      
      node.g.gain.setValueAtTime(0.15, start)
      node.g.gain.linearRampToValueAtTime(0.1, start + 0.2)
      node.g.gain.exponentialRampToValueAtTime(0.001, start + 0.5)
      
      node.o.start(start)
      node.o.stop(start + 0.5)
    })
    
    // Bass drop
    const bass = this.osc('sine')
    if (bass) {
      bass.o.frequency.setValueAtTime(80, t)
      bass.o.frequency.exponentialRampToValueAtTime(40, t + 0.2)
      
      bass.g.gain.setValueAtTime(0.4, t)
      bass.g.gain.exponentialRampToValueAtTime(0.001, t + 0.25)
      
      bass.o.start(t)
      bass.o.stop(t + 0.25)
    }
    
    // Shimmer cascade
    for (let i = 0; i < 5; i++) {
      const shimmer = this.osc('triangle')
      if (!shimmer) continue
      
      const start = t + 0.1 + i * 0.03
      const freq = 1000 + i * 200
      
      shimmer.o.frequency.setValueAtTime(freq, start)
      
      shimmer.g.gain.setValueAtTime(0.05, start)
      shimmer.g.gain.exponentialRampToValueAtTime(0.001, start + 0.12)
      
      shimmer.o.start(start)
      shimmer.o.stop(start + 0.12)
    }
  }
  
  /**
   * SELECT - Generic selection (upgrade cards, etc)
   * Two-note affirmative rise
   */
  public playSelect(): void {
    if (!this.canPlay()) return
    this.trackSound('select')
    
    const t = this.now()
    
    // Note 1: C5
    const n1 = this.osc('sine')
    if (n1) {
      n1.o.frequency.setValueAtTime(523, t)
      
      n1.g.gain.setValueAtTime(0.2, t)
      n1.g.gain.exponentialRampToValueAtTime(0.001, t + 0.1)
      
      n1.o.start(t)
      n1.o.stop(t + 0.1)
    }
    
    // Note 2: E5
    const n2 = this.osc('sine')
    if (n2) {
      n2.o.frequency.setValueAtTime(659, t + 0.06)
      
      n2.g.gain.setValueAtTime(0.22, t + 0.06)
      n2.g.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
      
      n2.o.start(t + 0.06)
      n2.o.stop(t + 0.18)
    }
  }
  
  // ============================================
  // GAME SOUNDS
  // ============================================
  
  /**
   * TACKLE - Player tackles runner
   * Satisfying impact thump
   */
  public playTackle(): void {
    if (!this.canPlay()) return
    this.trackSound('tackle')
    
    const t = this.now()
    
    // Main impact
    const impact = this.osc('sine')
    if (impact) {
      impact.o.frequency.setValueAtTime(180, t)
      impact.o.frequency.exponentialRampToValueAtTime(60, t + 0.08)
      
      impact.g.gain.setValueAtTime(0.4, t)
      impact.g.gain.exponentialRampToValueAtTime(0.001, t + 0.12)
      
      impact.o.start(t)
      impact.o.stop(t + 0.12)
    }
    
    // Crunch layer
    const crunch = this.osc('square')
    if (crunch) {
      crunch.o.frequency.setValueAtTime(400, t)
      crunch.o.frequency.exponentialRampToValueAtTime(150, t + 0.04)
      
      crunch.g.gain.setValueAtTime(0.1, t)
      crunch.g.gain.exponentialRampToValueAtTime(0.001, t + 0.06)
      
      crunch.o.start(t)
      crunch.o.stop(t + 0.06)
    }
  }
  
  /**
   * BIG TACKLE - Tank/Boss tackle
   * Deeper, more powerful impact
   */
  public playBigTackle(): void {
    if (!this.canPlay()) return
    this.trackSound('bigTackle')
    
    const t = this.now()
    
    // Deep impact
    const impact = this.osc('sine')
    if (impact) {
      impact.o.frequency.setValueAtTime(100, t)
      impact.o.frequency.exponentialRampToValueAtTime(30, t + 0.15)
      
      impact.g.gain.setValueAtTime(0.5, t)
      impact.g.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
      
      impact.o.start(t)
      impact.o.stop(t + 0.2)
    }
    
    // Rumble
    const rumble = this.osc('sawtooth')
    if (rumble) {
      rumble.o.frequency.setValueAtTime(60, t)
      rumble.o.frequency.exponentialRampToValueAtTime(25, t + 0.2)
      
      rumble.g.gain.setValueAtTime(0.15, t)
      rumble.g.gain.exponentialRampToValueAtTime(0.001, t + 0.25)
      
      rumble.o.start(t)
      rumble.o.stop(t + 0.25)
    }
  }
  
  /**
   * TOUCHDOWN - Enemy scores (negative)
   * Descending disappointed tone
   */
  public playTouchdown(): void {
    if (!this.canPlay()) return
    this.trackSound('touchdown')
    
    const t = this.now()
    
    // Sad descending tone
    const main = this.osc('sawtooth')
    if (main) {
      main.o.frequency.setValueAtTime(500, t)
      main.o.frequency.exponentialRampToValueAtTime(150, t + 0.25)
      
      main.g.gain.setValueAtTime(0.2, t)
      main.g.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
      
      main.o.start(t)
      main.o.stop(t + 0.3)
    }
  }
  
  /**
   * POWER UP - Collect power-up
   * Sparkly rising chime
   */
  public playPowerUp(): void {
    if (!this.canPlay()) return
    this.trackSound('powerUp')
    
    const t = this.now()
    
    // Ascending sparkle
    for (let i = 0; i < 4; i++) {
      const node = this.osc('sine')
      if (!node) continue
      
      const start = t + i * 0.04
      const freq = 800 + i * 200
      
      node.o.frequency.setValueAtTime(freq, start)
      node.o.frequency.exponentialRampToValueAtTime(freq * 1.2, start + 0.1)
      
      node.g.gain.setValueAtTime(0.15, start)
      node.g.gain.exponentialRampToValueAtTime(0.001, start + 0.15)
      
      node.o.start(start)
      node.o.stop(start + 0.15)
    }
  }
  
  /**
   * WAVE COMPLETE - Beat a wave
   * Victorious ascending arpeggio
   */
  public playWaveComplete(): void {
    if (!this.canPlay()) return
    this.trackSound('waveComplete')
    
    const t = this.now()
    
    // C major arpeggio: C4, E4, G4, C5
    const notes = [262, 330, 392, 523]
    
    notes.forEach((freq, i) => {
      const node = this.osc('sine')
      if (!node) return
      
      const start = t + i * 0.08
      
      node.o.frequency.setValueAtTime(freq, start)
      
      node.g.gain.setValueAtTime(0.2, start)
      node.g.gain.linearRampToValueAtTime(0.15, start + 0.1)
      node.g.gain.exponentialRampToValueAtTime(0.001, start + 0.25)
      
      node.o.start(start)
      node.o.stop(start + 0.25)
    })
  }
  
  /**
   * UPGRADE - Selected an upgrade
   * Satisfying confirmation with power
   */
  public playUpgrade(): void {
    if (!this.canPlay()) return
    this.trackSound('upgrade')
    
    const t = this.now()
    
    // Chunky confirmation
    const main = this.osc('square')
    if (main) {
      main.o.frequency.setValueAtTime(200, t)
      main.o.frequency.setValueAtTime(300, t + 0.05)
      main.o.frequency.setValueAtTime(400, t + 0.1)
      
      main.g.gain.setValueAtTime(0.15, t)
      main.g.gain.setValueAtTime(0.18, t + 0.05)
      main.g.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
      
      main.o.start(t)
      main.o.stop(t + 0.2)
    }
    
    // Shine
    const shine = this.osc('sine')
    if (shine) {
      shine.o.frequency.setValueAtTime(1200, t + 0.08)
      
      shine.g.gain.setValueAtTime(0.1, t + 0.08)
      shine.g.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
      
      shine.o.start(t + 0.08)
      shine.o.stop(t + 0.2)
    }
  }
  
  /**
   * GAME OVER - Game ended
   * Sad descending minor
   */
  public playGameOver(): void {
    if (!this.canPlay()) return
    this.trackSound('gameOver')
    
    const t = this.now()
    
    // Descending minor: A4, F4, D4, A3
    const notes = [440, 349, 294, 220]
    
    notes.forEach((freq, i) => {
      const node = this.osc('triangle')
      if (!node) return
      
      const start = t + i * 0.15
      
      node.o.frequency.setValueAtTime(freq, start)
      node.o.frequency.exponentialRampToValueAtTime(freq * 0.95, start + 0.2)
      
      node.g.gain.setValueAtTime(0.25, start)
      node.g.gain.exponentialRampToValueAtTime(0.001, start + 0.3)
      
      node.o.start(start)
      node.o.stop(start + 0.3)
    })
  }
  
  /**
   * CROWD ROAR - Fan meter activation
   * Epic crowd explosion
   */
  public playCrowdRoar(): void {
    if (!this.canPlay()) return
    this.trackSound('crowdRoar')
    
    const t = this.now()
    
    // Bass rumble
    const bass = this.osc('sawtooth')
    if (bass) {
      bass.o.frequency.setValueAtTime(80, t)
      bass.o.frequency.linearRampToValueAtTime(100, t + 0.3)
      bass.o.frequency.linearRampToValueAtTime(70, t + 1.0)
      
      bass.g.gain.setValueAtTime(0, t)
      bass.g.gain.linearRampToValueAtTime(0.3, t + 0.15)
      bass.g.gain.setValueAtTime(0.3, t + 0.7)
      bass.g.gain.exponentialRampToValueAtTime(0.001, t + 1.2)
      
      bass.o.start(t)
      bass.o.stop(t + 1.2)
    }
    
    // Crowd noise simulation
    const noise = this.noise(1.5)
    if (noise) {
      noise.g.gain.setValueAtTime(0, t)
      noise.g.gain.linearRampToValueAtTime(0.08, t + 0.1)
      noise.g.gain.setValueAtTime(0.08, t + 0.8)
      noise.g.gain.exponentialRampToValueAtTime(0.001, t + 1.5)
      
      noise.source.start(t)
      noise.source.stop(t + 1.5)
    }
    
    // Impact boom
    const boom = this.osc('sine')
    if (boom) {
      boom.o.frequency.setValueAtTime(120, t)
      boom.o.frequency.exponentialRampToValueAtTime(40, t + 0.2)
      
      boom.g.gain.setValueAtTime(0.4, t)
      boom.g.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
      
      boom.o.start(t)
      boom.o.stop(t + 0.3)
    }
  }
  
  /**
   * FAN METER PULSE - Building anticipation
   */
  public playFanMeterPulse(): void {
    if (!this.canPlay()) return
    this.trackSound('fanMeterPulse')
    
    const t = this.now()
    
    const pulse = this.osc('sine')
    if (pulse) {
      pulse.o.frequency.setValueAtTime(200, t)
      pulse.o.frequency.linearRampToValueAtTime(250, t + 0.08)
      
      pulse.g.gain.setValueAtTime(0.1, t)
      pulse.g.gain.exponentialRampToValueAtTime(0.001, t + 0.12)
      
      pulse.o.start(t)
      pulse.o.stop(t + 0.12)
    }
  }
  
  /**
   * CROWD CHEER - Positive crowd reaction
   */
  public playCrowdCheer(): void {
    if (!this.canPlay()) return
    this.trackSound('crowdCheer')
    
    const t = this.now()
    
    // Layered cheer
    for (let i = 0; i < 4; i++) {
      const node = this.osc('triangle')
      if (!node) continue
      
      const start = t + i * 0.02
      const freq = 250 + i * 60 + Math.random() * 30
      
      node.o.frequency.setValueAtTime(freq, start)
      node.o.frequency.linearRampToValueAtTime(freq * 1.15, start + 0.15)
      
      node.g.gain.setValueAtTime(0.12, start)
      node.g.gain.exponentialRampToValueAtTime(0.001, start + 0.35)
      
      node.o.start(start)
      node.o.stop(start + 0.35)
    }
  }
  
  /**
   * BOSS WARNING - Boss appearing
   * Ominous horn
   */
  public playBossWarning(): void {
    if (!this.canPlay()) return
    this.trackSound('bossWarning')
    
    const t = this.now()
    
    // Deep warning horn
    const horn = this.osc('sawtooth')
    if (horn) {
      horn.o.frequency.setValueAtTime(110, t)
      horn.o.frequency.linearRampToValueAtTime(90, t + 0.5)
      
      horn.g.gain.setValueAtTime(0.35, t)
      horn.g.gain.setValueAtTime(0.35, t + 0.4)
      horn.g.gain.exponentialRampToValueAtTime(0.001, t + 0.7)
      
      horn.o.start(t)
      horn.o.stop(t + 0.7)
    }
    
    // Sub bass
    const sub = this.osc('sine')
    if (sub) {
      sub.o.frequency.setValueAtTime(45, t)
      
      sub.g.gain.setValueAtTime(0.4, t)
      sub.g.gain.exponentialRampToValueAtTime(0.001, t + 0.8)
      
      sub.o.start(t)
      sub.o.stop(t + 0.8)
    }
  }
  
  /**
   * VICTORY FANFARE - Won the game/stage
   * Triumphant major fanfare
   */
  public playVictoryFanfare(): void {
    if (!this.canPlay()) return
    this.trackSound('victoryFanfare')
    
    const t = this.now()
    
    // Major chord: C4, E4, G4, then C5
    const chord = [262, 330, 392]
    
    chord.forEach(freq => {
      const node = this.osc('sine')
      if (!node) return
      
      node.o.frequency.setValueAtTime(freq, t)
      
      node.g.gain.setValueAtTime(0.2, t)
      node.g.gain.linearRampToValueAtTime(0.15, t + 0.3)
      node.g.gain.exponentialRampToValueAtTime(0.001, t + 0.6)
      
      node.o.start(t)
      node.o.stop(t + 0.6)
    })
    
    // High C5 after delay
    const high = this.osc('sine')
    if (high) {
      high.o.frequency.setValueAtTime(523, t + 0.25)
      
      high.g.gain.setValueAtTime(0.25, t + 0.25)
      high.g.gain.linearRampToValueAtTime(0.2, t + 0.5)
      high.g.gain.exponentialRampToValueAtTime(0.001, t + 0.8)
      
      high.o.start(t + 0.25)
      high.o.stop(t + 0.8)
    }
  }
  
  // ============================================
  // CROWD INTENSITY (for campaign mode)
  // ============================================
  
  private crowdIntensity = 1.0
  
  public setCrowdIntensity(intensity: number): void {
    this.crowdIntensity = Math.max(0, Math.min(1, intensity))
    log('Crowd intensity:', this.crowdIntensity)
  }
}

// Singleton
export const AudioManager = new AudioManagerClass()
export { AudioState }
