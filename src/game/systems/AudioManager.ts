/**
 * Audio Manager for Dark Side Game
 * Robust Web Audio API implementation with proper lifecycle management
 * 
 * Key features:
 * - Guaranteed audio unlock on first user interaction
 * - Sound queuing for pre-unlock plays
 * - Proper AudioContext state management
 * - Singleton pattern with React-friendly unlock hooks
 */

// Sound types for queuing
type SoundType = 
  // Game sounds
  | 'tackle' | 'bigTackle' | 'touchdown' | 'powerUp' 
  | 'waveComplete' | 'upgrade' | 'gameOver' | 'click'
  | 'crowdRoar' | 'fanMeterPulse' | 'crowdCheer' | 'bossWarning' | 'victoryFanfare'
  // UI/Menu sounds
  | 'menuClick' | 'menuHover' | 'menuBack'
  | 'navigate' | 'navigateHeavy'
  | 'select' | 'confirm' | 'cancel'
  | 'swoosh' | 'transition'
  | 'playerSwipe' | 'playerSelect'
  | 'success' | 'error' | 'notification'

// Audio state enum for clarity
enum AudioState {
  UNINITIALIZED = 'UNINITIALIZED',  // No context created yet
  SUSPENDED = 'SUSPENDED',           // Context created but suspended (needs user gesture)
  RUNNING = 'RUNNING',               // Fully operational
  CLOSED = 'CLOSED',                 // Context closed (cleanup)
}

class AudioManagerClass {
  private audioContext: AudioContext | null = null
  private state: AudioState = AudioState.UNINITIALIZED
  private enabled = true
  private volume = 0.7
  private crowdIntensity = 1.0
  
  // Queue for sounds played before audio is unlocked
  private pendingQueue: SoundType[] = []
  private maxQueueSize = 5 // Prevent queue explosion
  
  // Listeners for state changes
  private stateListeners: Set<(state: AudioState) => void> = new Set()
  
  // Master gain for volume control
  private masterGain: GainNode | null = null
  
  // ============================================
  // INITIALIZATION & STATE MANAGEMENT
  // ============================================
  
  /**
   * Initialize AudioContext - call this early, but audio won't play until unlock()
   * Safe to call multiple times
   */
  public init(): void {
    if (this.audioContext) return
    if (typeof window === 'undefined') return
    
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioContextClass) {
        console.warn('[AudioManager] Web Audio API not supported')
        return
      }
      
      this.audioContext = new AudioContextClass()
      
      // Create master gain
      this.masterGain = this.audioContext.createGain()
      this.masterGain.gain.value = this.volume
      this.masterGain.connect(this.audioContext.destination)
      
      // Update state based on context state
      this.updateState()
      
      // Listen for state changes (browser may suspend/resume)
      this.audioContext.addEventListener('statechange', () => {
        this.updateState()
      })
      
      console.log('[AudioManager] Initialized, state:', this.state)
    } catch (e) {
      console.warn('[AudioManager] Failed to initialize:', e)
    }
  }
  
  /**
   * Update internal state from AudioContext state
   */
  private updateState(): void {
    if (!this.audioContext) {
      this.setState(AudioState.UNINITIALIZED)
      return
    }
    
    switch (this.audioContext.state) {
      case 'suspended':
        this.setState(AudioState.SUSPENDED)
        break
      case 'running':
        this.setState(AudioState.RUNNING)
        break
      case 'closed':
        this.setState(AudioState.CLOSED)
        break
    }
  }
  
  /**
   * Set state and notify listeners
   */
  private setState(newState: AudioState): void {
    if (this.state === newState) return
    
    const prevState = this.state
    this.state = newState
    
    console.log('[AudioManager] State change:', prevState, '->', newState)
    
    // Notify listeners
    this.stateListeners.forEach(listener => listener(newState))
    
    // If we just became RUNNING, flush the queue
    if (newState === AudioState.RUNNING && prevState !== AudioState.RUNNING) {
      this.flushQueue()
    }
  }
  
  /**
   * Unlock audio - MUST be called from a user interaction event handler
   * Returns a promise that resolves when audio is fully ready
   */
  public async unlock(): Promise<boolean> {
    // Initialize if not already
    if (!this.audioContext) {
      this.init()
    }
    
    if (!this.audioContext) {
      console.warn('[AudioManager] Cannot unlock - no AudioContext')
      return false
    }
    
    // Already running
    if (this.state === AudioState.RUNNING) {
      return true
    }
    
    try {
      // Resume the context
      await this.audioContext.resume()
      
      // iOS Safari requires playing a silent buffer to fully unlock
      await this.playSilentBuffer()
      
      this.updateState()
      
      const isRunning = this.audioContext.state === 'running'
      console.log('[AudioManager] Unlocked successfully, running:', isRunning)
      return isRunning
    } catch (e) {
      console.warn('[AudioManager] Unlock failed:', e)
      return false
    }
  }
  
  /**
   * Play a silent buffer to unlock iOS audio
   */
  private async playSilentBuffer(): Promise<void> {
    if (!this.audioContext) return
    
    const buffer = this.audioContext.createBuffer(1, 1, 22050)
    const source = this.audioContext.createBufferSource()
    source.buffer = buffer
    source.connect(this.audioContext.destination)
    source.start(0)
    
    // Wait for it to finish
    return new Promise(resolve => {
      source.onended = () => resolve()
      // Fallback timeout
      setTimeout(resolve, 100)
    })
  }
  
  /**
   * Alias for unlock (backwards compatibility)
   */
  public async resume(): Promise<boolean> {
    return this.unlock()
  }
  
  /**
   * Get current audio state
   */
  public getState(): AudioState {
    return this.state
  }
  
  /**
   * Check if audio is ready to play
   */
  public isReady(): boolean {
    return this.state === AudioState.RUNNING
  }
  
  /**
   * Subscribe to state changes
   */
  public onStateChange(listener: (state: AudioState) => void): () => void {
    this.stateListeners.add(listener)
    return () => this.stateListeners.delete(listener)
  }
  
  // ============================================
  // SETTINGS
  // ============================================
  
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }
  
  public isEnabled(): boolean {
    return this.enabled
  }
  
  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol))
    
    // Update master gain if available
    if (this.masterGain && this.audioContext) {
      this.masterGain.gain.setTargetAtTime(
        this.volume,
        this.audioContext.currentTime,
        0.05 // Smooth transition
      )
    }
  }
  
  public getVolume(): number {
    return this.volume
  }
  
  public setCrowdIntensity(intensity: number): void {
    this.crowdIntensity = Math.max(0, Math.min(1, intensity))
  }
  
  // ============================================
  // QUEUE MANAGEMENT
  // ============================================
  
  /**
   * Add sound to queue if not ready, or play immediately
   */
  private queueOrPlay(soundType: SoundType, playFn: () => void): void {
    if (!this.enabled) return
    
    if (this.state === AudioState.RUNNING) {
      playFn()
    } else {
      // Queue for later (but limit queue size)
      if (this.pendingQueue.length < this.maxQueueSize) {
        this.pendingQueue.push(soundType)
      }
    }
  }
  
  /**
   * Flush queued sounds
   */
  private flushQueue(): void {
    console.log('[AudioManager] Flushing queue:', this.pendingQueue.length, 'sounds')
    
    const queue = [...this.pendingQueue]
    this.pendingQueue = []
    
    // Play each queued sound with slight delay between
    queue.forEach((soundType, index) => {
      setTimeout(() => {
        this.playSoundByType(soundType)
      }, index * 50)
    })
  }
  
  /**
   * Play a sound by its type
   */
  private playSoundByType(type: SoundType): void {
    switch (type) {
      // Game sounds
      case 'tackle': this.playTackleImmediate(); break
      case 'bigTackle': this.playBigTackleImmediate(); break
      case 'touchdown': this.playTouchdownImmediate(); break
      case 'powerUp': this.playPowerUpImmediate(); break
      case 'waveComplete': this.playWaveCompleteImmediate(); break
      case 'upgrade': this.playUpgradeImmediate(); break
      case 'gameOver': this.playGameOverImmediate(); break
      case 'click': this.playClickImmediate(); break
      case 'crowdRoar': this.playCrowdRoarImmediate(); break
      case 'fanMeterPulse': this.playFanMeterPulseImmediate(); break
      case 'crowdCheer': this.playCrowdCheerImmediate(); break
      case 'bossWarning': this.playBossWarningImmediate(); break
      case 'victoryFanfare': this.playVictoryFanfareImmediate(); break
      // UI/Menu sounds
      case 'menuClick': this.playMenuClickImmediate(); break
      case 'menuHover': this.playMenuHoverImmediate(); break
      case 'menuBack': this.playMenuBackImmediate(); break
      case 'navigate': this.playNavigateImmediate(); break
      case 'navigateHeavy': this.playNavigateHeavyImmediate(); break
      case 'select': this.playSelectImmediate(); break
      case 'confirm': this.playConfirmImmediate(); break
      case 'cancel': this.playCancelImmediate(); break
      case 'swoosh': this.playSwooshImmediate(); break
      case 'transition': this.playTransitionImmediate(); break
      case 'playerSwipe': this.playPlayerSwipeImmediate(); break
      case 'playerSelect': this.playPlayerSelectImmediate(); break
      case 'success': this.playSuccessImmediate(); break
      case 'error': this.playErrorImmediate(); break
      case 'notification': this.playNotificationImmediate(); break
    }
  }
  
  // ============================================
  // SOUND HELPERS
  // ============================================
  
  /**
   * Get current time, or 0 if not ready
   */
  private now(): number {
    return this.audioContext?.currentTime ?? 0
  }
  
  /**
   * Create an oscillator connected to master gain
   */
  private createOsc(type: OscillatorType = 'sine'): { osc: OscillatorNode; gain: GainNode } | null {
    if (!this.audioContext || !this.masterGain) return null
    
    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()
    
    osc.type = type
    osc.connect(gain)
    gain.connect(this.masterGain)
    
    return { osc, gain }
  }
  
  // ============================================
  // PUBLIC SOUND METHODS (with queueing)
  // ============================================
  
  public playTackle(): void {
    this.queueOrPlay('tackle', () => this.playTackleImmediate())
  }
  
  public playBigTackle(): void {
    this.queueOrPlay('bigTackle', () => this.playBigTackleImmediate())
  }
  
  public playTouchdown(): void {
    this.queueOrPlay('touchdown', () => this.playTouchdownImmediate())
  }
  
  public playPowerUp(): void {
    this.queueOrPlay('powerUp', () => this.playPowerUpImmediate())
  }
  
  public playWaveComplete(): void {
    this.queueOrPlay('waveComplete', () => this.playWaveCompleteImmediate())
  }
  
  public playUpgrade(): void {
    this.queueOrPlay('upgrade', () => this.playUpgradeImmediate())
  }
  
  public playGameOver(): void {
    this.queueOrPlay('gameOver', () => this.playGameOverImmediate())
  }
  
  public playClick(): void {
    this.queueOrPlay('click', () => this.playClickImmediate())
  }
  
  public playCrowdRoar(): void {
    this.queueOrPlay('crowdRoar', () => this.playCrowdRoarImmediate())
  }
  
  public playFanMeterPulse(): void {
    this.queueOrPlay('fanMeterPulse', () => this.playFanMeterPulseImmediate())
  }
  
  public playCrowdCheer(): void {
    this.queueOrPlay('crowdCheer', () => this.playCrowdCheerImmediate())
  }
  
  public playBossWarning(): void {
    this.queueOrPlay('bossWarning', () => this.playBossWarningImmediate())
  }
  
  public playVictoryFanfare(): void {
    this.queueOrPlay('victoryFanfare', () => this.playVictoryFanfareImmediate())
  }
  
  // ============================================
  // UI/MENU SOUND METHODS
  // ============================================
  
  /**
   * Menu click - crisp, satisfying tap
   */
  public playMenuClick(): void {
    this.queueOrPlay('menuClick', () => this.playMenuClickImmediate())
  }
  
  /**
   * Menu hover - subtle hint
   */
  public playMenuHover(): void {
    this.queueOrPlay('menuHover', () => this.playMenuHoverImmediate())
  }
  
  /**
   * Menu back - soft reverse swoosh
   */
  public playMenuBack(): void {
    this.queueOrPlay('menuBack', () => this.playMenuBackImmediate())
  }
  
  /**
   * Navigate - arrow clicks, pagination
   */
  public playNavigate(): void {
    this.queueOrPlay('navigate', () => this.playNavigateImmediate())
  }
  
  /**
   * Navigate heavy - significant navigation action
   */
  public playNavigateHeavy(): void {
    this.queueOrPlay('navigateHeavy', () => this.playNavigateHeavyImmediate())
  }
  
  /**
   * Select - choosing an option
   */
  public playSelect(): void {
    this.queueOrPlay('select', () => this.playSelectImmediate())
  }
  
  /**
   * Confirm - finalizing a choice (stronger than select)
   */
  public playConfirm(): void {
    this.queueOrPlay('confirm', () => this.playConfirmImmediate())
  }
  
  /**
   * Cancel - backing out of something
   */
  public playCancel(): void {
    this.queueOrPlay('cancel', () => this.playCancelImmediate())
  }
  
  /**
   * Swoosh - page/screen transitions
   */
  public playSwoosh(): void {
    this.queueOrPlay('swoosh', () => this.playSwooshImmediate())
  }
  
  /**
   * Transition - modal opening/closing
   */
  public playTransition(): void {
    this.queueOrPlay('transition', () => this.playTransitionImmediate())
  }
  
  /**
   * Player swipe - swiping between players in carousel
   */
  public playPlayerSwipe(): void {
    this.queueOrPlay('playerSwipe', () => this.playPlayerSwipeImmediate())
  }
  
  /**
   * Player select - selecting a player to play as
   */
  public playPlayerSelect(): void {
    this.queueOrPlay('playerSelect', () => this.playPlayerSelectImmediate())
  }
  
  /**
   * Success - positive feedback
   */
  public playSuccess(): void {
    this.queueOrPlay('success', () => this.playSuccessImmediate())
  }
  
  /**
   * Error - negative feedback
   */
  public playError(): void {
    this.queueOrPlay('error', () => this.playErrorImmediate())
  }
  
  /**
   * Notification - attention getter
   */
  public playNotification(): void {
    this.queueOrPlay('notification', () => this.playNotificationImmediate())
  }
  
  // ============================================
  // IMMEDIATE SOUND IMPLEMENTATIONS
  // ============================================
  
  private playTackleImmediate(): void {
    const nodes = this.createOsc('sine')
    if (!nodes) return
    
    const { osc, gain } = nodes
    const now = this.now()
    
    osc.frequency.setValueAtTime(150, now)
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.1)
    
    gain.gain.setValueAtTime(0.5, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)
    
    osc.start(now)
    osc.stop(now + 0.15)
    
    // Click layer
    const click = this.createOsc('square')
    if (click) {
      click.osc.frequency.setValueAtTime(300, now)
      click.osc.frequency.exponentialRampToValueAtTime(100, now + 0.05)
      click.gain.gain.setValueAtTime(0.2, now)
      click.gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08)
      click.osc.start(now)
      click.osc.stop(now + 0.08)
    }
  }
  
  private playBigTackleImmediate(): void {
    const nodes = this.createOsc('sine')
    if (!nodes) return
    
    const { osc, gain } = nodes
    const now = this.now()
    
    osc.frequency.setValueAtTime(80, now)
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.2)
    
    gain.gain.setValueAtTime(0.7, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25)
    
    osc.start(now)
    osc.stop(now + 0.25)
  }
  
  private playTouchdownImmediate(): void {
    const nodes = this.createOsc('sawtooth')
    if (!nodes) return
    
    const { osc, gain } = nodes
    const now = this.now()
    
    osc.frequency.setValueAtTime(400, now)
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.3)
    
    gain.gain.setValueAtTime(0.3, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35)
    
    osc.start(now)
    osc.stop(now + 0.35)
  }
  
  private playPowerUpImmediate(): void {
    const now = this.now()
    
    for (let i = 0; i < 3; i++) {
      const nodes = this.createOsc('sine')
      if (!nodes) continue
      
      const { osc, gain } = nodes
      const startTime = now + i * 0.05
      const freq = 600 + i * 200
      
      osc.frequency.setValueAtTime(freq, startTime)
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, startTime + 0.1)
      
      gain.gain.setValueAtTime(0.25, startTime)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15)
      
      osc.start(startTime)
      osc.stop(startTime + 0.15)
    }
  }
  
  private playWaveCompleteImmediate(): void {
    const now = this.now()
    const notes = [400, 500, 600, 800]
    
    notes.forEach((freq, i) => {
      const nodes = this.createOsc('sine')
      if (!nodes) return
      
      const { osc, gain } = nodes
      const startTime = now + i * 0.1
      
      osc.frequency.setValueAtTime(freq, startTime)
      
      gain.gain.setValueAtTime(0.3, startTime)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2)
      
      osc.start(startTime)
      osc.stop(startTime + 0.25)
    })
  }
  
  private playUpgradeImmediate(): void {
    const nodes = this.createOsc('square')
    if (!nodes) return
    
    const { osc, gain } = nodes
    const now = this.now()
    
    osc.frequency.setValueAtTime(200, now)
    osc.frequency.setValueAtTime(300, now + 0.05)
    osc.frequency.setValueAtTime(400, now + 0.1)
    
    gain.gain.setValueAtTime(0.2, now)
    gain.gain.setValueAtTime(0.25, now + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2)
    
    osc.start(now)
    osc.stop(now + 0.2)
  }
  
  private playGameOverImmediate(): void {
    const now = this.now()
    const notes = [400, 350, 300, 200]
    
    notes.forEach((freq, i) => {
      const nodes = this.createOsc('triangle')
      if (!nodes) return
      
      const { osc, gain } = nodes
      const startTime = now + i * 0.15
      
      osc.frequency.setValueAtTime(freq, startTime)
      osc.frequency.exponentialRampToValueAtTime(freq * 0.8, startTime + 0.2)
      
      gain.gain.setValueAtTime(0.35, startTime)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3)
      
      osc.start(startTime)
      osc.stop(startTime + 0.35)
    })
  }
  
  private playClickImmediate(): void {
    const nodes = this.createOsc('sine')
    if (!nodes) return
    
    const { osc, gain } = nodes
    const now = this.now()
    
    osc.frequency.setValueAtTime(800, now)
    
    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05)
    
    osc.start(now)
    osc.stop(now + 0.05)
  }
  
  private playCrowdRoarImmediate(): void {
    const now = this.now()
    
    // Layer 1: Low rumble
    const low = this.createOsc('sawtooth')
    if (low) {
      low.osc.frequency.setValueAtTime(60, now)
      low.osc.frequency.linearRampToValueAtTime(80, now + 0.3)
      low.osc.frequency.linearRampToValueAtTime(60, now + 1.0)
      
      low.gain.gain.setValueAtTime(0, now)
      low.gain.gain.linearRampToValueAtTime(0.4, now + 0.15)
      low.gain.gain.setValueAtTime(0.4, now + 0.8)
      low.gain.gain.exponentialRampToValueAtTime(0.01, now + 1.5)
      
      low.osc.start(now)
      low.osc.stop(now + 1.5)
    }
    
    // Layer 2: Mid-frequency
    const mid = this.createOsc('triangle')
    if (mid) {
      mid.osc.frequency.setValueAtTime(200, now)
      mid.osc.frequency.linearRampToValueAtTime(300, now + 0.2)
      mid.osc.frequency.linearRampToValueAtTime(250, now + 0.8)
      
      mid.gain.gain.setValueAtTime(0, now)
      mid.gain.gain.linearRampToValueAtTime(0.3, now + 0.1)
      mid.gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2)
      
      mid.osc.start(now)
      mid.osc.stop(now + 1.2)
    }
    
    // Layer 3: High harmonics
    for (let i = 0; i < 4; i++) {
      const high = this.createOsc('sine')
      if (!high) continue
      
      const startTime = now + i * 0.05
      const freq = 400 + i * 100 + Math.random() * 50
      
      high.osc.frequency.setValueAtTime(freq, startTime)
      high.osc.frequency.linearRampToValueAtTime(freq * 1.2, startTime + 0.3)
      
      high.gain.gain.setValueAtTime(0, startTime)
      high.gain.gain.linearRampToValueAtTime(0.15, startTime + 0.1)
      high.gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.8)
      
      high.osc.start(startTime)
      high.osc.stop(startTime + 0.8)
    }
    
    // Impact boom
    const boom = this.createOsc('sine')
    if (boom) {
      boom.osc.frequency.setValueAtTime(100, now)
      boom.osc.frequency.exponentialRampToValueAtTime(30, now + 0.3)
      
      boom.gain.gain.setValueAtTime(0.6, now)
      boom.gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4)
      
      boom.osc.start(now)
      boom.osc.stop(now + 0.4)
    }
  }
  
  private playFanMeterPulseImmediate(): void {
    const nodes = this.createOsc('sine')
    if (!nodes) return
    
    const { osc, gain } = nodes
    const now = this.now()
    
    osc.frequency.setValueAtTime(150, now)
    osc.frequency.linearRampToValueAtTime(200, now + 0.1)
    
    gain.gain.setValueAtTime(0.1, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)
    
    osc.start(now)
    osc.stop(now + 0.15)
  }
  
  private playCrowdCheerImmediate(): void {
    const now = this.now()
    const intensity = this.crowdIntensity
    const cheerVolume = 0.3 * intensity
    const layers = Math.ceil(intensity * 4)
    
    for (let i = 0; i < layers; i++) {
      const nodes = this.createOsc('triangle')
      if (!nodes) continue
      
      const { osc, gain } = nodes
      const startTime = now + i * 0.03
      const freq = 200 + i * 50 + Math.random() * 30
      
      osc.frequency.setValueAtTime(freq, startTime)
      osc.frequency.linearRampToValueAtTime(freq * 1.2, startTime + 0.15)
      
      gain.gain.setValueAtTime(cheerVolume * 0.5, startTime)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4)
      
      osc.start(startTime)
      osc.stop(startTime + 0.4)
    }
  }
  
  private playBossWarningImmediate(): void {
    const now = this.now()
    
    // Deep horn
    const horn = this.createOsc('sawtooth')
    if (horn) {
      horn.osc.frequency.setValueAtTime(100, now)
      horn.osc.frequency.linearRampToValueAtTime(80, now + 0.5)
      
      horn.gain.gain.setValueAtTime(0.5, now)
      horn.gain.gain.setValueAtTime(0.5, now + 0.3)
      horn.gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8)
      
      horn.osc.start(now)
      horn.osc.stop(now + 0.8)
    }
    
    // Sub bass
    const sub = this.createOsc('sine')
    if (sub) {
      sub.osc.frequency.setValueAtTime(40, now)
      
      sub.gain.gain.setValueAtTime(0.6, now)
      sub.gain.gain.exponentialRampToValueAtTime(0.01, now + 1.0)
      
      sub.osc.start(now)
      sub.osc.stop(now + 1.0)
    }
  }
  
  private playVictoryFanfareImmediate(): void {
    const now = this.now()
    
    const notes = [
      { freq: 523, delay: 0 },    // C5
      { freq: 659, delay: 0 },    // E5
      { freq: 784, delay: 0 },    // G5
      { freq: 1047, delay: 0.3 }, // C6
    ]
    
    notes.forEach(({ freq, delay }) => {
      const nodes = this.createOsc('sine')
      if (!nodes) return
      
      const { osc, gain } = nodes
      const startTime = now + delay
      
      osc.frequency.setValueAtTime(freq, startTime)
      
      gain.gain.setValueAtTime(0.25, startTime)
      gain.gain.setValueAtTime(0.25, startTime + 0.3)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.6)
      
      osc.start(startTime)
      osc.stop(startTime + 0.6)
    })
  }
  
  // ============================================
  // UI/MENU SOUND IMPLEMENTATIONS
  // ============================================
  
  /**
   * Menu click - crisp, tactile tap with subtle warmth
   */
  private playMenuClickImmediate(): void {
    const now = this.now()
    
    // Primary click - warm mid tone
    const click = this.createOsc('sine')
    if (click) {
      click.osc.frequency.setValueAtTime(880, now) // A5
      click.osc.frequency.exponentialRampToValueAtTime(660, now + 0.04) // E5
      
      click.gain.gain.setValueAtTime(0.18, now)
      click.gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06)
      
      click.osc.start(now)
      click.osc.stop(now + 0.06)
    }
    
    // Subtle harmonic layer
    const harm = this.createOsc('triangle')
    if (harm) {
      harm.osc.frequency.setValueAtTime(1320, now) // E6
      
      harm.gain.gain.setValueAtTime(0.06, now)
      harm.gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03)
      
      harm.osc.start(now)
      harm.osc.stop(now + 0.03)
    }
  }
  
  /**
   * Menu hover - very subtle hint
   */
  private playMenuHoverImmediate(): void {
    const now = this.now()
    
    const nodes = this.createOsc('sine')
    if (!nodes) return
    
    const { osc, gain } = nodes
    
    osc.frequency.setValueAtTime(1200, now)
    
    gain.gain.setValueAtTime(0.04, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.02)
    
    osc.start(now)
    osc.stop(now + 0.02)
  }
  
  /**
   * Menu back - soft descending whoosh
   */
  private playMenuBackImmediate(): void {
    const now = this.now()
    
    // Descending tone
    const main = this.createOsc('sine')
    if (main) {
      main.osc.frequency.setValueAtTime(600, now)
      main.osc.frequency.exponentialRampToValueAtTime(300, now + 0.12)
      
      main.gain.gain.setValueAtTime(0.12, now)
      main.gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)
      
      main.osc.start(now)
      main.osc.stop(now + 0.15)
    }
    
    // Soft air layer
    const air = this.createOsc('triangle')
    if (air) {
      air.osc.frequency.setValueAtTime(400, now)
      air.osc.frequency.exponentialRampToValueAtTime(200, now + 0.1)
      
      air.gain.gain.setValueAtTime(0.06, now)
      air.gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12)
      
      air.osc.start(now)
      air.osc.stop(now + 0.12)
    }
  }
  
  /**
   * Navigate - arrows, pagination dots
   */
  private playNavigateImmediate(): void {
    const now = this.now()
    
    // Quick tick
    const tick = this.createOsc('sine')
    if (tick) {
      tick.osc.frequency.setValueAtTime(1000, now)
      tick.osc.frequency.exponentialRampToValueAtTime(800, now + 0.03)
      
      tick.gain.gain.setValueAtTime(0.12, now)
      tick.gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05)
      
      tick.osc.start(now)
      tick.osc.stop(now + 0.05)
    }
    
    // Soft pop
    const pop = this.createOsc('triangle')
    if (pop) {
      pop.osc.frequency.setValueAtTime(500, now)
      
      pop.gain.gain.setValueAtTime(0.08, now)
      pop.gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04)
      
      pop.osc.start(now)
      pop.osc.stop(now + 0.04)
    }
  }
  
  /**
   * Navigate heavy - significant navigation with weight
   */
  private playNavigateHeavyImmediate(): void {
    const now = this.now()
    
    // Chunky mid thump
    const thump = this.createOsc('sine')
    if (thump) {
      thump.osc.frequency.setValueAtTime(200, now)
      thump.osc.frequency.exponentialRampToValueAtTime(100, now + 0.08)
      
      thump.gain.gain.setValueAtTime(0.2, now)
      thump.gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12)
      
      thump.osc.start(now)
      thump.osc.stop(now + 0.12)
    }
    
    // Click layer
    const click = this.createOsc('square')
    if (click) {
      click.osc.frequency.setValueAtTime(800, now)
      click.osc.frequency.exponentialRampToValueAtTime(400, now + 0.03)
      
      click.gain.gain.setValueAtTime(0.08, now)
      click.gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05)
      
      click.osc.start(now)
      click.osc.stop(now + 0.05)
    }
  }
  
  /**
   * Select - choosing an option (gentle confirmation)
   */
  private playSelectImmediate(): void {
    const now = this.now()
    
    // Two-note rise
    const note1 = this.createOsc('sine')
    if (note1) {
      note1.osc.frequency.setValueAtTime(523, now) // C5
      
      note1.gain.gain.setValueAtTime(0.15, now)
      note1.gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08)
      
      note1.osc.start(now)
      note1.osc.stop(now + 0.08)
    }
    
    const note2 = this.createOsc('sine')
    if (note2) {
      note2.osc.frequency.setValueAtTime(659, now + 0.05) // E5
      
      note2.gain.gain.setValueAtTime(0.18, now + 0.05)
      note2.gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)
      
      note2.osc.start(now + 0.05)
      note2.osc.stop(now + 0.15)
    }
  }
  
  /**
   * Confirm - finalizing a choice (triumphant)
   */
  private playConfirmImmediate(): void {
    const now = this.now()
    
    // Major chord burst
    const freqs = [523, 659, 784] // C5, E5, G5
    
    freqs.forEach((freq, i) => {
      const nodes = this.createOsc('sine')
      if (!nodes) return
      
      const { osc, gain } = nodes
      const startTime = now + i * 0.02
      
      osc.frequency.setValueAtTime(freq, startTime)
      osc.frequency.exponentialRampToValueAtTime(freq * 1.02, startTime + 0.15)
      
      gain.gain.setValueAtTime(0.15, startTime)
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.1)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25)
      
      osc.start(startTime)
      osc.stop(startTime + 0.25)
    })
    
    // Sparkle top
    const sparkle = this.createOsc('triangle')
    if (sparkle) {
      sparkle.osc.frequency.setValueAtTime(1568, now + 0.06) // G6
      
      sparkle.gain.gain.setValueAtTime(0.1, now + 0.06)
      sparkle.gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2)
      
      sparkle.osc.start(now + 0.06)
      sparkle.osc.stop(now + 0.2)
    }
  }
  
  /**
   * Cancel - backing out (gentle negative)
   */
  private playCancelImmediate(): void {
    const now = this.now()
    
    // Descending minor feel
    const note1 = this.createOsc('sine')
    if (note1) {
      note1.osc.frequency.setValueAtTime(440, now) // A4
      note1.osc.frequency.exponentialRampToValueAtTime(392, now + 0.08) // G4
      
      note1.gain.gain.setValueAtTime(0.12, now)
      note1.gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1)
      
      note1.osc.start(now)
      note1.osc.stop(now + 0.1)
    }
    
    const note2 = this.createOsc('sine')
    if (note2) {
      note2.osc.frequency.setValueAtTime(349, now + 0.05) // F4
      
      note2.gain.gain.setValueAtTime(0.1, now + 0.05)
      note2.gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)
      
      note2.osc.start(now + 0.05)
      note2.osc.stop(now + 0.15)
    }
  }
  
  /**
   * Swoosh - page/screen transitions
   */
  private playSwooshImmediate(): void {
    const now = this.now()
    
    // Filtered noise simulation
    const swoosh = this.createOsc('sawtooth')
    if (swoosh) {
      swoosh.osc.frequency.setValueAtTime(100, now)
      swoosh.osc.frequency.exponentialRampToValueAtTime(800, now + 0.1)
      swoosh.osc.frequency.exponentialRampToValueAtTime(200, now + 0.2)
      
      swoosh.gain.gain.setValueAtTime(0.08, now)
      swoosh.gain.gain.linearRampToValueAtTime(0.12, now + 0.08)
      swoosh.gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25)
      
      swoosh.osc.start(now)
      swoosh.osc.stop(now + 0.25)
    }
    
    // Air layer
    const air = this.createOsc('triangle')
    if (air) {
      air.osc.frequency.setValueAtTime(300, now)
      air.osc.frequency.exponentialRampToValueAtTime(600, now + 0.15)
      
      air.gain.gain.setValueAtTime(0.05, now)
      air.gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2)
      
      air.osc.start(now)
      air.osc.stop(now + 0.2)
    }
  }
  
  /**
   * Transition - modal opening/closing
   */
  private playTransitionImmediate(): void {
    const now = this.now()
    
    // Soft shimmer
    for (let i = 0; i < 3; i++) {
      const nodes = this.createOsc('sine')
      if (!nodes) continue
      
      const { osc, gain } = nodes
      const startTime = now + i * 0.03
      const freq = 800 + i * 200
      
      osc.frequency.setValueAtTime(freq, startTime)
      osc.frequency.exponentialRampToValueAtTime(freq * 1.1, startTime + 0.1)
      
      gain.gain.setValueAtTime(0.08, startTime)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.12)
      
      osc.start(startTime)
      osc.stop(startTime + 0.12)
    }
  }
  
  /**
   * Player swipe - swiping between players in carousel
   */
  private playPlayerSwipeImmediate(): void {
    const now = this.now()
    
    // Whoosh with character
    const main = this.createOsc('sine')
    if (main) {
      main.osc.frequency.setValueAtTime(400, now)
      main.osc.frequency.exponentialRampToValueAtTime(600, now + 0.06)
      main.osc.frequency.exponentialRampToValueAtTime(450, now + 0.12)
      
      main.gain.gain.setValueAtTime(0.1, now)
      main.gain.gain.linearRampToValueAtTime(0.14, now + 0.04)
      main.gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)
      
      main.osc.start(now)
      main.osc.stop(now + 0.15)
    }
    
    // Texture layer
    const texture = this.createOsc('triangle')
    if (texture) {
      texture.osc.frequency.setValueAtTime(200, now)
      texture.osc.frequency.exponentialRampToValueAtTime(350, now + 0.08)
      
      texture.gain.gain.setValueAtTime(0.06, now)
      texture.gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1)
      
      texture.osc.start(now)
      texture.osc.stop(now + 0.1)
    }
  }
  
  /**
   * Player select - selecting a player (heroic moment)
   */
  private playPlayerSelectImmediate(): void {
    const now = this.now()
    
    // Heroic chord with power
    const baseFreqs = [196, 247, 294, 392] // G3, B3, D4, G4
    
    baseFreqs.forEach((freq, i) => {
      const nodes = this.createOsc('sine')
      if (!nodes) return
      
      const { osc, gain } = nodes
      const startTime = now + i * 0.02
      
      osc.frequency.setValueAtTime(freq, startTime)
      
      gain.gain.setValueAtTime(0.12, startTime)
      gain.gain.linearRampToValueAtTime(0.1, startTime + 0.15)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4)
      
      osc.start(startTime)
      osc.stop(startTime + 0.4)
    })
    
    // Power hit
    const hit = this.createOsc('sine')
    if (hit) {
      hit.osc.frequency.setValueAtTime(100, now)
      hit.osc.frequency.exponentialRampToValueAtTime(50, now + 0.15)
      
      hit.gain.gain.setValueAtTime(0.25, now)
      hit.gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2)
      
      hit.osc.start(now)
      hit.osc.stop(now + 0.2)
    }
    
    // Shimmer top
    for (let i = 0; i < 4; i++) {
      const sparkle = this.createOsc('triangle')
      if (!sparkle) continue
      
      const startTime = now + 0.08 + i * 0.04
      const freq = 1200 + i * 200
      
      sparkle.osc.frequency.setValueAtTime(freq, startTime)
      
      sparkle.gain.gain.setValueAtTime(0.06, startTime)
      sparkle.gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1)
      
      sparkle.osc.start(startTime)
      sparkle.osc.stop(startTime + 0.1)
    }
  }
  
  /**
   * Success - positive feedback
   */
  private playSuccessImmediate(): void {
    const now = this.now()
    
    // Ascending major
    const notes = [523, 659, 784, 1047] // C5, E5, G5, C6
    
    notes.forEach((freq, i) => {
      const nodes = this.createOsc('sine')
      if (!nodes) return
      
      const { osc, gain } = nodes
      const startTime = now + i * 0.06
      
      osc.frequency.setValueAtTime(freq, startTime)
      
      gain.gain.setValueAtTime(0.12, startTime)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15)
      
      osc.start(startTime)
      osc.stop(startTime + 0.15)
    })
  }
  
  /**
   * Error - negative feedback
   */
  private playErrorImmediate(): void {
    const now = this.now()
    
    // Buzzy error tone
    const buzz = this.createOsc('sawtooth')
    if (buzz) {
      buzz.osc.frequency.setValueAtTime(150, now)
      buzz.osc.frequency.setValueAtTime(140, now + 0.08)
      buzz.osc.frequency.setValueAtTime(150, now + 0.16)
      
      buzz.gain.gain.setValueAtTime(0.15, now)
      buzz.gain.gain.setValueAtTime(0.08, now + 0.08)
      buzz.gain.gain.setValueAtTime(0.12, now + 0.16)
      buzz.gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25)
      
      buzz.osc.start(now)
      buzz.osc.stop(now + 0.25)
    }
  }
  
  /**
   * Notification - attention getter
   */
  private playNotificationImmediate(): void {
    const now = this.now()
    
    // Two-tone chime
    const tone1 = this.createOsc('sine')
    if (tone1) {
      tone1.osc.frequency.setValueAtTime(880, now) // A5
      
      tone1.gain.gain.setValueAtTime(0.15, now)
      tone1.gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12)
      
      tone1.osc.start(now)
      tone1.osc.stop(now + 0.12)
    }
    
    const tone2 = this.createOsc('sine')
    if (tone2) {
      tone2.osc.frequency.setValueAtTime(1320, now + 0.08) // E6
      
      tone2.gain.gain.setValueAtTime(0.12, now + 0.08)
      tone2.gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2)
      
      tone2.osc.start(now + 0.08)
      tone2.osc.stop(now + 0.2)
    }
    
    // Soft harmonic
    const harm = this.createOsc('triangle')
    if (harm) {
      harm.osc.frequency.setValueAtTime(1760, now) // A6
      
      harm.gain.gain.setValueAtTime(0.04, now)
      harm.gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)
      
      harm.osc.start(now)
      harm.osc.stop(now + 0.15)
    }
  }
}

// Singleton instance
export const AudioManager = new AudioManagerClass()

// Export state enum for external use
export { AudioState }
