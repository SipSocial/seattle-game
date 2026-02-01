'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { AudioManager, AudioState } from '@/src/game/systems/AudioManager'

/**
 * React hook for managing audio state and unlock
 * 
 * Usage:
 * const { isReady, unlock } = useAudio()
 * 
 * // Call unlock on any user interaction before game starts
 * <button onClick={() => { unlock(); startGame(); }}>Start Game</button>
 */
export function useAudio() {
  const [state, setState] = useState<AudioState>(AudioManager.getState())
  const [isReady, setIsReady] = useState(AudioManager.isReady())
  
  // Track if we've attempted unlock
  const unlockAttempted = useRef(false)
  
  // Initialize audio context early
  useEffect(() => {
    AudioManager.init()
    
    // Subscribe to state changes
    const unsubscribe = AudioManager.onStateChange((newState) => {
      setState(newState)
      setIsReady(newState === AudioState.RUNNING)
    })
    
    // Sync initial state
    setState(AudioManager.getState())
    setIsReady(AudioManager.isReady())
    
    return unsubscribe
  }, [])
  
  /**
   * Unlock audio - call this from user interaction handlers
   * Returns true if unlock succeeded
   */
  const unlock = useCallback(async (): Promise<boolean> => {
    unlockAttempted.current = true
    return AudioManager.unlock()
  }, [])
  
  /**
   * Set volume (0-1)
   */
  const setVolume = useCallback((volume: number) => {
    AudioManager.setVolume(volume)
  }, [])
  
  /**
   * Enable/disable audio
   */
  const setEnabled = useCallback((enabled: boolean) => {
    AudioManager.setEnabled(enabled)
  }, [])
  
  /**
   * Play a click sound (useful for UI interactions)
   */
  const playClick = useCallback(() => {
    AudioManager.playClick()
  }, [])
  
  return {
    state,
    isReady,
    unlock,
    setVolume,
    setEnabled,
    playClick,
    volume: AudioManager.getVolume(),
    enabled: AudioManager.isEnabled(),
  }
}

/**
 * Simple hook that just unlocks audio on mount
 * Use this in components where the user has already interacted
 */
export function useAudioUnlock() {
  const hasUnlocked = useRef(false)
  
  // Initialize on mount
  useEffect(() => {
    AudioManager.init()
  }, [])
  
  /**
   * Call this from onClick handlers to ensure audio is unlocked
   */
  const ensureUnlocked = useCallback(async () => {
    if (!hasUnlocked.current) {
      hasUnlocked.current = true
      await AudioManager.unlock()
    }
  }, [])
  
  return ensureUnlocked
}

/**
 * Global audio unlock handler
 * Attaches a one-time listener to document for first interaction
 */
export function useGlobalAudioUnlock() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Initialize immediately
    AudioManager.init()
    
    // If already unlocked, nothing to do
    if (AudioManager.isReady()) return
    
    const handleInteraction = () => {
      AudioManager.unlock()
      // Remove listeners after first interaction
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
      document.removeEventListener('keydown', handleInteraction)
    }
    
    document.addEventListener('click', handleInteraction, { once: true })
    document.addEventListener('touchstart', handleInteraction, { once: true })
    document.addEventListener('keydown', handleInteraction, { once: true })
    
    return () => {
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
      document.removeEventListener('keydown', handleInteraction)
    }
  }, [])
}
