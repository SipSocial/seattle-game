// ============================================================================
// SOUNDTRACK MANAGER
// Handles background music playback with crossfading between screens
// Implements a natural, non-jarring audio experience similar to Madden
// ============================================================================

import { 
  getTrack, 
  getTracksForScreen, 
  type Track, 
  type ScreenType 
} from '../data/soundtrack'
import { AudioManager } from './AudioManager'

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export type PlaybackState = 'stopped' | 'warming' | 'playing' | 'paused' | 'loading'

export interface SoundtrackState {
  currentTrack: Track | null
  playbackState: PlaybackState
  currentTime: number
  duration: number
  volume: number
  muted: boolean
  isWarmingUp: boolean  // True when music is in warm-up phase
}

type StateListener = (state: SoundtrackState) => void

// ----------------------------------------------------------------------------
// Audio Experience Configuration
// These values create a natural, non-jarring music experience
// ----------------------------------------------------------------------------

const AUDIO_EXPERIENCE = {
  // Delay before music starts after user interaction (ms)
  // Gives user time to settle into the page
  WARMUP_DELAY: 2000,
  
  // Duration of the volume swell from 0 to target (ms)
  // Long gradual build - 6 seconds to feel natural
  SWELL_DURATION: 6000,
  
  // Starting volume ratio (0-1) during warm-up
  // Nearly silent - just a hint of music
  INITIAL_VOLUME: 0.01,
  
  // Volume at the end of warm-up before full swell
  WARMUP_TARGET_VOLUME: 0.25,
  
  // Crossfade duration between screens (ms)
  CROSSFADE_DURATION: 1500,
  
  // Quick fade for game start (ms)
  QUICK_FADE_DURATION: 200,
  
  // How many steps in volume animations (smoothness)
  ANIMATION_STEPS: 60,
}

// ----------------------------------------------------------------------------
// SoundtrackManager Singleton
// ----------------------------------------------------------------------------

class SoundtrackManagerClass {
  private static instance: SoundtrackManagerClass | null = null
  
  // Dual audio elements for crossfading
  private playerA: HTMLAudioElement | null = null
  private playerB: HTMLAudioElement | null = null
  private activePlayer: 'A' | 'B' = 'A'
  
  // State
  private currentTrack: Track | null = null
  private playbackState: PlaybackState = 'stopped'
  private volume: number = 0.7  // Target volume when fully engaged
  private currentVolume: number = 0  // Actual current volume
  private muted: boolean = false
  private currentScreen: ScreenType | null = null
  private isWarmingUp: boolean = false
  
  // Timers
  private warmupTimer: ReturnType<typeof setTimeout> | null = null
  private swellAnimationId: number | null = null
  
  // Listeners
  private listeners: Set<StateListener> = new Set()
  private timeUpdateInterval: ReturnType<typeof setInterval> | null = null
  
  private constructor() {
    // Private constructor for singleton
  }
  
  static getInstance(): SoundtrackManagerClass {
    if (!SoundtrackManagerClass.instance) {
      SoundtrackManagerClass.instance = new SoundtrackManagerClass()
    }
    return SoundtrackManagerClass.instance
  }
  
  // --------------------------------------------------------------------------
  // Initialization
  // --------------------------------------------------------------------------
  
  init(): void {
    if (typeof window === 'undefined') return
    
    // Create audio elements if they don't exist
    if (!this.playerA) {
      this.playerA = this.createAudioElement('soundtrack-player-a')
    }
    if (!this.playerB) {
      this.playerB = this.createAudioElement('soundtrack-player-b')
    }
    
    // Start time update interval
    if (!this.timeUpdateInterval) {
      this.timeUpdateInterval = setInterval(() => {
        if (this.playbackState === 'playing' || this.playbackState === 'warming') {
          this.notifyListeners()
        }
      }, 250)
    }
    
    console.log('[SoundtrackManager] Initialized with natural audio experience')
  }
  
  private createAudioElement(id: string): HTMLAudioElement {
    const audio = document.createElement('audio')
    audio.id = id
    audio.preload = 'auto'
    audio.volume = 0  // Always start at 0, we control volume manually
    
    audio.addEventListener('ended', () => this.handleTrackEnd())
    audio.addEventListener('error', (e) => this.handleError(e))
    audio.addEventListener('canplay', () => this.handleCanPlay())
    audio.addEventListener('loadedmetadata', () => this.notifyListeners())
    
    return audio
  }
  
  // --------------------------------------------------------------------------
  // Natural Music Start System
  // --------------------------------------------------------------------------
  
  /**
   * Begin the natural music experience for a screen
   * This is the main entry point - it handles the warm-up delay and swell
   */
  async playForScreen(screen: ScreenType, options?: { 
    crossfade?: boolean
    immediate?: boolean  // Skip warm-up for screen transitions
  }): Promise<void> {
    // Skip if already playing for this screen
    if (this.currentScreen === screen && 
        (this.playbackState === 'playing' || this.playbackState === 'warming')) {
      return
    }
    
    this.currentScreen = screen
    const tracks = getTracksForScreen(screen)
    
    if (tracks.length === 0) {
      console.warn(`[SoundtrackManager] No tracks configured for screen: ${screen}`)
      return
    }
    
    const track = tracks[0]
    const shouldCrossfade = options?.crossfade ?? (this.playbackState === 'playing')
    const isImmediate = options?.immediate ?? false
    
    // If already playing, crossfade to new track
    if (shouldCrossfade && this.playbackState === 'playing') {
      await this.crossfadeTo(track, track.analysis?.recommendedStart ?? 0)
      return
    }
    
    // For fresh start, use natural warm-up
    if (!isImmediate && this.playbackState === 'stopped') {
      await this.startWithWarmup(track)
    } else {
      // Immediate start for screen transitions when music was already playing
      await this.play(track.id, { crossfade: shouldCrossfade })
    }
  }
  
  /**
   * Start music with the natural warm-up experience
   * Delay -> Quiet start -> Progressive swell
   */
  private async startWithWarmup(track: Track): Promise<void> {
    // Clear any existing warmup
    this.cancelWarmup()
    
    this.isWarmingUp = true
    this.playbackState = 'warming'
    this.currentTrack = track
    this.notifyListeners()
    
    console.log(`[SoundtrackManager] Starting warm-up for: ${track.title}`)
    
    // Wait for the warm-up delay
    await this.delay(AUDIO_EXPERIENCE.WARMUP_DELAY)
    
    // Check if we were cancelled during delay
    if (!this.isWarmingUp) return
    
    const player = this.getActivePlayer()
    if (!player) return
    
    try {
      // Set up the track
      const startTime = track.analysis?.recommendedStart ?? 0
      player.src = track.src
      player.currentTime = startTime
      
      // Start at whisper volume
      const initialVolume = this.muted ? 0 : this.volume * AUDIO_EXPERIENCE.INITIAL_VOLUME
      player.volume = initialVolume
      this.currentVolume = initialVolume
      
      await player.play()
      
      console.log(`[SoundtrackManager] Playing at whisper volume: ${(initialVolume * 100).toFixed(0)}%`)
      
      // Now do the progressive swell
      await this.progressiveSwell(player)
      
      this.isWarmingUp = false
      this.playbackState = 'playing'
      this.notifyListeners()
      
      console.log(`[SoundtrackManager] Music fully engaged: ${track.title}`)
      
    } catch (error) {
      console.error('[SoundtrackManager] Warm-up playback failed:', error)
      this.isWarmingUp = false
      this.playbackState = 'stopped'
      this.notifyListeners()
    }
  }
  
  /**
   * Progressive volume swell using easeInOut curve
   * Creates the natural "music coming in" feeling
   */
  private progressiveSwell(audio: HTMLAudioElement): Promise<void> {
    return new Promise((resolve) => {
      if (this.muted) {
        resolve()
        return
      }
      
      const startVolume = audio.volume
      const targetVolume = this.volume
      const duration = AUDIO_EXPERIENCE.SWELL_DURATION
      const steps = AUDIO_EXPERIENCE.ANIMATION_STEPS
      const stepDuration = duration / steps
      let currentStep = 0
      
      const animate = () => {
        currentStep++
        
        // Check if cancelled
        if (!this.isWarmingUp && this.playbackState !== 'playing') {
          resolve()
          return
        }
        
        // EaseInOut curve: slow start, fast middle, slow end
        // Using sine easing for natural perception
        const t = currentStep / steps
        const easedT = -(Math.cos(Math.PI * t) - 1) / 2
        
        const volumeDelta = targetVolume - startVolume
        const newVolume = startVolume + (volumeDelta * easedT)
        
        audio.volume = Math.min(Math.max(newVolume, 0), 1)
        this.currentVolume = audio.volume
        
        if (currentStep >= steps) {
          audio.volume = targetVolume
          this.currentVolume = targetVolume
          resolve()
        } else {
          this.swellAnimationId = requestAnimationFrame(() => {
            setTimeout(animate, stepDuration)
          })
        }
      }
      
      animate()
    })
  }
  
  private cancelWarmup(): void {
    if (this.warmupTimer) {
      clearTimeout(this.warmupTimer)
      this.warmupTimer = null
    }
    if (this.swellAnimationId) {
      cancelAnimationFrame(this.swellAnimationId)
      this.swellAnimationId = null
    }
    this.isWarmingUp = false
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => {
      this.warmupTimer = setTimeout(resolve, ms)
    })
  }
  
  // --------------------------------------------------------------------------
  // Direct Playback Control
  // --------------------------------------------------------------------------
  
  /**
   * Play a specific track directly (no warm-up)
   */
  async play(trackId: string, options?: { 
    crossfade?: boolean
    startTime?: number 
  }): Promise<void> {
    const track = getTrack(trackId)
    if (!track) {
      console.error(`[SoundtrackManager] Track not found: ${trackId}`)
      return
    }
    
    const startTime = options?.startTime ?? track.analysis?.recommendedStart ?? 0
    const shouldCrossfade = options?.crossfade ?? false
    
    if (shouldCrossfade && this.playbackState === 'playing') {
      await this.crossfadeTo(track, startTime)
    } else {
      await this.playTrackDirect(track, startTime)
    }
  }
  
  private async playTrackDirect(track: Track, startTime: number = 0): Promise<void> {
    this.cancelWarmup()
    
    const player = this.getActivePlayer()
    if (!player) return
    
    this.playbackState = 'loading'
    this.currentTrack = track
    this.notifyListeners()
    
    try {
      player.src = track.src
      player.currentTime = startTime
      
      const targetVolume = this.muted ? 0 : this.volume
      player.volume = targetVolume
      this.currentVolume = targetVolume
      
      await player.play()
      this.playbackState = 'playing'
      this.notifyListeners()
      
      console.log(`[SoundtrackManager] Playing: ${track.title}`)
    } catch (error) {
      console.error('[SoundtrackManager] Playback failed:', error)
      this.playbackState = 'stopped'
      this.notifyListeners()
    }
  }
  
  /**
   * Pause playback
   */
  pause(): void {
    this.cancelWarmup()
    
    const player = this.getActivePlayer()
    if (player && (this.playbackState === 'playing' || this.playbackState === 'warming')) {
      player.pause()
      this.playbackState = 'paused'
      this.notifyListeners()
    }
  }
  
  /**
   * Resume playback
   */
  async resume(): Promise<void> {
    const player = this.getActivePlayer()
    if (player && this.playbackState === 'paused') {
      try {
        await player.play()
        this.playbackState = 'playing'
        this.notifyListeners()
      } catch (error) {
        console.error('[SoundtrackManager] Resume failed:', error)
      }
    }
  }
  
  /**
   * Toggle play/pause
   */
  async togglePlayPause(): Promise<void> {
    if (this.playbackState === 'playing' || this.playbackState === 'warming') {
      this.pause()
    } else if (this.playbackState === 'paused') {
      await this.resume()
    }
  }
  
  /**
   * Stop playback completely
   */
  stop(options?: { fadeOut?: number }): void {
    this.cancelWarmup()
    
    const player = this.getActivePlayer()
    if (!player) return
    
    if (options?.fadeOut) {
      this.fadeOut(player, options.fadeOut).then(() => {
        this.stopImmediate()
      })
    } else {
      this.stopImmediate()
    }
  }
  
  private stopImmediate(): void {
    const player = this.getActivePlayer()
    if (player) {
      player.pause()
      player.currentTime = 0
      player.volume = 0
    }
    
    this.playbackState = 'stopped'
    this.currentTrack = null
    this.currentScreen = null
    this.currentVolume = 0
    this.notifyListeners()
  }
  
  /**
   * Stop music with whistle SFX (for game start transition)
   * Quick fade out -> brief silence -> whistle plays
   */
  async stopWithWhistle(): Promise<void> {
    this.cancelWarmup()
    
    const player = this.getActivePlayer()
    if (!player) return
    
    // Quick fade out
    await this.fadeOut(player, AUDIO_EXPERIENCE.QUICK_FADE_DURATION)
    
    // Stop playback
    this.stopImmediate()
    
    // Brief pause then play whistle
    await new Promise(resolve => setTimeout(resolve, 100))
    AudioManager.playWhistle()
  }
  
  // --------------------------------------------------------------------------
  // Crossfading
  // --------------------------------------------------------------------------
  
  private async crossfadeTo(track: Track, startTime: number = 0): Promise<void> {
    const outgoingPlayer = this.getActivePlayer()
    const incomingPlayer = this.getInactivePlayer()
    
    if (!outgoingPlayer || !incomingPlayer) return
    
    // Switch active player
    this.activePlayer = this.activePlayer === 'A' ? 'B' : 'A'
    this.currentTrack = track
    this.notifyListeners()
    
    // Prepare incoming track
    incomingPlayer.src = track.src
    incomingPlayer.currentTime = startTime
    incomingPlayer.volume = 0
    
    try {
      await incomingPlayer.play()
      
      // Crossfade
      await Promise.all([
        this.fadeOut(outgoingPlayer, AUDIO_EXPERIENCE.CROSSFADE_DURATION),
        this.fadeIn(incomingPlayer, AUDIO_EXPERIENCE.CROSSFADE_DURATION),
      ])
      
      // Stop outgoing player
      outgoingPlayer.pause()
      outgoingPlayer.currentTime = 0
      
      console.log(`[SoundtrackManager] Crossfaded to: ${track.title}`)
    } catch (error) {
      console.error('[SoundtrackManager] Crossfade failed:', error)
    }
  }
  
  private fadeIn(audio: HTMLAudioElement, duration: number): Promise<void> {
    return new Promise((resolve) => {
      const targetVolume = this.muted ? 0 : this.volume
      const steps = 20
      const stepDuration = duration / steps
      const volumeStep = targetVolume / steps
      let currentStep = 0
      
      const interval = setInterval(() => {
        currentStep++
        audio.volume = Math.min(volumeStep * currentStep, targetVolume)
        this.currentVolume = audio.volume
        
        if (currentStep >= steps) {
          clearInterval(interval)
          audio.volume = targetVolume
          this.currentVolume = targetVolume
          resolve()
        }
      }, stepDuration)
    })
  }
  
  private fadeOut(audio: HTMLAudioElement, duration: number): Promise<void> {
    return new Promise((resolve) => {
      const startVolume = audio.volume
      const steps = 20
      const stepDuration = duration / steps
      const volumeStep = startVolume / steps
      let currentStep = 0
      
      const interval = setInterval(() => {
        currentStep++
        audio.volume = Math.max(startVolume - (volumeStep * currentStep), 0)
        this.currentVolume = audio.volume
        
        if (currentStep >= steps) {
          clearInterval(interval)
          audio.volume = 0
          this.currentVolume = 0
          resolve()
        }
      }, stepDuration)
    })
  }
  
  // --------------------------------------------------------------------------
  // Volume Control
  // --------------------------------------------------------------------------
  
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))
    
    const player = this.getActivePlayer()
    if (player && !this.muted && this.playbackState === 'playing') {
      player.volume = this.volume
      this.currentVolume = this.volume
    }
    
    this.notifyListeners()
  }
  
  getVolume(): number {
    return this.volume
  }
  
  setMuted(muted: boolean): void {
    this.muted = muted
    
    const player = this.getActivePlayer()
    if (player) {
      if (muted) {
        player.volume = 0
        this.currentVolume = 0
      } else if (this.playbackState === 'playing') {
        player.volume = this.volume
        this.currentVolume = this.volume
      }
    }
    
    this.notifyListeners()
  }
  
  toggleMute(): void {
    this.setMuted(!this.muted)
  }
  
  isMuted(): boolean {
    return this.muted
  }
  
  // --------------------------------------------------------------------------
  // Seeking
  // --------------------------------------------------------------------------
  
  seek(time: number): void {
    const player = this.getActivePlayer()
    if (player && this.currentTrack) {
      player.currentTime = Math.max(0, Math.min(time, player.duration || this.currentTrack.duration))
      this.notifyListeners()
    }
  }
  
  seekPercent(percent: number): void {
    const player = this.getActivePlayer()
    if (player) {
      const duration = player.duration || this.currentTrack?.duration || 0
      this.seek(duration * Math.max(0, Math.min(1, percent)))
    }
  }
  
  // --------------------------------------------------------------------------
  // State Access
  // --------------------------------------------------------------------------
  
  getState(): SoundtrackState {
    const player = this.getActivePlayer()
    
    return {
      currentTrack: this.currentTrack,
      playbackState: this.playbackState,
      currentTime: player?.currentTime ?? 0,
      duration: player?.duration || this.currentTrack?.duration || 0,
      volume: this.volume,
      muted: this.muted,
      isWarmingUp: this.isWarmingUp,
    }
  }
  
  getCurrentTrack(): Track | null {
    return this.currentTrack
  }
  
  getPlaybackState(): PlaybackState {
    return this.playbackState
  }
  
  getCurrentTime(): number {
    return this.getActivePlayer()?.currentTime ?? 0
  }
  
  getDuration(): number {
    const player = this.getActivePlayer()
    return player?.duration || this.currentTrack?.duration || 0
  }
  
  isPlaying(): boolean {
    return this.playbackState === 'playing' || this.playbackState === 'warming'
  }
  
  // --------------------------------------------------------------------------
  // Event Handlers
  // --------------------------------------------------------------------------
  
  private handleTrackEnd(): void {
    // Loop the current track
    const player = this.getActivePlayer()
    if (player && this.currentTrack) {
      const loopStart = this.currentTrack.analysis?.loopPoints?.start ?? 0
      player.currentTime = loopStart
      player.play().catch(console.error)
    }
  }
  
  private handleError(event: Event): void {
    console.error('[SoundtrackManager] Audio error:', event)
    this.playbackState = 'stopped'
    this.notifyListeners()
  }
  
  private handleCanPlay(): void {
    // Audio is ready to play
  }
  
  // --------------------------------------------------------------------------
  // Listeners
  // --------------------------------------------------------------------------
  
  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener)
    
    // Immediately call with current state
    listener(this.getState())
    
    return () => {
      this.listeners.delete(listener)
    }
  }
  
  private notifyListeners(): void {
    const state = this.getState()
    this.listeners.forEach(listener => listener(state))
  }
  
  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------
  
  private getActivePlayer(): HTMLAudioElement | null {
    return this.activePlayer === 'A' ? this.playerA : this.playerB
  }
  
  private getInactivePlayer(): HTMLAudioElement | null {
    return this.activePlayer === 'A' ? this.playerB : this.playerA
  }
  
  // --------------------------------------------------------------------------
  // Cleanup
  // --------------------------------------------------------------------------
  
  destroy(): void {
    this.cancelWarmup()
    
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval)
      this.timeUpdateInterval = null
    }
    
    this.stop()
    
    this.playerA?.remove()
    this.playerB?.remove()
    this.playerA = null
    this.playerB = null
    
    this.listeners.clear()
    
    SoundtrackManagerClass.instance = null
    
    console.log('[SoundtrackManager] Destroyed')
  }
}

// Export singleton instance
export const SoundtrackManager = SoundtrackManagerClass.getInstance()
