// ============================================================================
// SOUNDTRACK MANAGER
// Handles background music playback with crossfading between screens
// Separate from AudioManager which handles game SFX
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

export type PlaybackState = 'stopped' | 'playing' | 'paused' | 'loading'

export interface SoundtrackState {
  currentTrack: Track | null
  playbackState: PlaybackState
  currentTime: number
  duration: number
  volume: number
  muted: boolean
}

type StateListener = (state: SoundtrackState) => void

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
  private volume: number = 0.7
  private muted: boolean = false
  private currentScreen: ScreenType | null = null
  
  // Listeners
  private listeners: Set<StateListener> = new Set()
  private timeUpdateInterval: ReturnType<typeof setInterval> | null = null
  
  // Crossfade settings
  private readonly CROSSFADE_DURATION = 1500 // ms
  private readonly QUICK_FADE_DURATION = 200 // ms for game start
  
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
        if (this.playbackState === 'playing') {
          this.notifyListeners()
        }
      }, 250)
    }
    
    console.log('[SoundtrackManager] Initialized')
  }
  
  private createAudioElement(id: string): HTMLAudioElement {
    const audio = document.createElement('audio')
    audio.id = id
    audio.preload = 'auto'
    audio.volume = this.volume
    
    audio.addEventListener('ended', () => this.handleTrackEnd())
    audio.addEventListener('error', (e) => this.handleError(e))
    audio.addEventListener('canplay', () => this.handleCanPlay())
    audio.addEventListener('loadedmetadata', () => this.notifyListeners())
    
    return audio
  }
  
  // --------------------------------------------------------------------------
  // Playback Control
  // --------------------------------------------------------------------------
  
  /**
   * Play a specific track
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
      await this.playTrack(track, startTime)
    }
  }
  
  /**
   * Play music for a specific screen
   */
  async playForScreen(screen: ScreenType, options?: { crossfade?: boolean }): Promise<void> {
    // Skip if already playing for this screen
    if (this.currentScreen === screen && this.playbackState === 'playing') {
      return
    }
    
    this.currentScreen = screen
    const tracks = getTracksForScreen(screen)
    
    if (tracks.length === 0) {
      console.warn(`[SoundtrackManager] No tracks configured for screen: ${screen}`)
      return
    }
    
    // For now, play the first track. Later we can add shuffle/rotation
    const track = tracks[0]
    const shouldCrossfade = options?.crossfade ?? (this.playbackState === 'playing')
    
    await this.play(track.id, { crossfade: shouldCrossfade })
  }
  
  private async playTrack(track: Track, startTime: number = 0): Promise<void> {
    const player = this.getActivePlayer()
    if (!player) return
    
    this.playbackState = 'loading'
    this.currentTrack = track
    this.notifyListeners()
    
    try {
      player.src = track.src
      player.currentTime = startTime
      player.volume = this.muted ? 0 : this.volume
      
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
    const player = this.getActivePlayer()
    if (player && this.playbackState === 'playing') {
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
    if (this.playbackState === 'playing') {
      this.pause()
    } else if (this.playbackState === 'paused') {
      await this.resume()
    }
  }
  
  /**
   * Stop playback completely
   */
  stop(options?: { fadeOut?: number }): void {
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
    }
    
    this.playbackState = 'stopped'
    this.currentTrack = null
    this.currentScreen = null
    this.notifyListeners()
  }
  
  /**
   * Stop music with whistle SFX (for game start transition)
   * Quick fade out -> brief silence -> whistle plays
   */
  async stopWithWhistle(): Promise<void> {
    const player = this.getActivePlayer()
    if (!player) return
    
    // Quick fade out
    await this.fadeOut(player, this.QUICK_FADE_DURATION)
    
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
        this.fadeOut(outgoingPlayer, this.CROSSFADE_DURATION),
        this.fadeIn(incomingPlayer, this.CROSSFADE_DURATION),
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
        
        if (currentStep >= steps) {
          clearInterval(interval)
          audio.volume = targetVolume
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
        
        if (currentStep >= steps) {
          clearInterval(interval)
          audio.volume = 0
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
    if (player && !this.muted) {
      player.volume = this.volume
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
      player.volume = muted ? 0 : this.volume
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
  
  // --------------------------------------------------------------------------
  // Event Handlers
  // --------------------------------------------------------------------------
  
  private handleTrackEnd(): void {
    // For now, loop the current track
    // Later we can add playlist support
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
