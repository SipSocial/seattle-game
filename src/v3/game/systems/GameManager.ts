/**
 * V3 Game Manager
 * 
 * Orchestrates the complete game flow:
 * - Manages quarters (Q1, Q3 = Offense | Q2, Q4 = Defense)
 * - Tracks score, stats, and game state
 * - Switches between Phaser scenes
 * - Emits events for React HUD updates
 */

import { CLOCK_CONFIG, RULES_CONFIG, getDifficultyModifiers } from '../data/v3Config'

// ============================================================================
// Types
// ============================================================================

export type GamePhase = 
  | 'loading'
  | 'quarterIntro'
  | 'playing'
  | 'quarterEnd'
  | 'halftime'
  | 'gameOver'

export type PossessionType = 'offense' | 'defense'

export interface GameScore {
  darkSide: number
  opponent: number
}

export interface QuarterStats {
  touchdowns: number
  yardsGained: number
  firstDowns: number
  sacks: number
  turnovers: number
  completions: number
  attempts: number
  tackles: number
}

export interface FullGameStats {
  quarters: QuarterStats[]
  total: QuarterStats
  timeOfPossession: number
  biggestPlay: number
  mvpPlayer: string | null
}

export interface GameManagerState {
  phase: GamePhase
  quarter: number
  clockMs: number
  possession: PossessionType
  score: GameScore
  down: number
  yardsToGo: number
  ballPosition: number // Yard line (0-100, where 100 = opponent end zone)
  currentStats: QuarterStats
  fullStats: FullGameStats
  weekId: number
  opponentName: string
}

export type GameEventType =
  | 'touchdown'
  | 'fieldGoal'
  | 'safety'
  | 'turnover'
  | 'sack'
  | 'firstDown'
  | 'tackle'
  | 'incomplete'
  | 'interception'
  | 'fumble'

export interface GameEvent {
  type: GameEventType
  quarter: number
  clockMs: number
  possession: PossessionType
  yards?: number
  player?: string
}

type StateListener = (state: GameManagerState) => void
type EventListener = (event: GameEvent) => void

// ============================================================================
// Game Manager Singleton
// ============================================================================

class GameManagerClass {
  private static instance: GameManagerClass | null = null
  
  // Phaser game reference
  private game: Phaser.Game | null = null
  
  // State
  private state: GameManagerState = this.getInitialState(1, 'Opponent')
  
  // Listeners
  private stateListeners: Set<StateListener> = new Set()
  private eventListeners: Set<EventListener> = new Set()
  
  // Timer
  private clockInterval: number | null = null
  
  private constructor() {}
  
  static getInstance(): GameManagerClass {
    if (!GameManagerClass.instance) {
      GameManagerClass.instance = new GameManagerClass()
    }
    return GameManagerClass.instance
  }
  
  // ============================================================================
  // Initialization
  // ============================================================================
  
  private getInitialState(weekId: number, opponentName: string): GameManagerState {
    return {
      phase: 'loading',
      quarter: 1,
      clockMs: CLOCK_CONFIG.quarterLengthMs,
      possession: 'offense', // Player starts on offense
      score: { darkSide: 0, opponent: 0 },
      down: 1,
      yardsToGo: RULES_CONFIG.yardsForFirstDown,
      ballPosition: RULES_CONFIG.touchbackYardLine,
      currentStats: this.getEmptyStats(),
      fullStats: {
        quarters: [],
        total: this.getEmptyStats(),
        timeOfPossession: 0,
        biggestPlay: 0,
        mvpPlayer: null,
      },
      weekId,
      opponentName,
    }
  }
  
  private getEmptyStats(): QuarterStats {
    return {
      touchdowns: 0,
      yardsGained: 0,
      firstDowns: 0,
      sacks: 0,
      turnovers: 0,
      completions: 0,
      attempts: 0,
      tackles: 0,
    }
  }
  
  /**
   * Initialize a new game
   */
  async startGame(
    container: HTMLElement,
    weekId: number,
    opponentName: string
  ): Promise<void> {
    // Reset state
    this.state = this.getInitialState(weekId, opponentName)
    this.notifyStateListeners()
    
    // Dynamic import Phaser
    const Phaser = (await import('phaser')).default
    const { OffenseScene } = await import('../scenes/OffenseScene')
    const { DefenseScene } = await import('../scenes/DefenseScene')
    
    // Create Phaser game
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: container,
      width: 360,
      height: 640,
      backgroundColor: '#0a1a0d',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [OffenseScene, DefenseScene],
      physics: {
        default: 'arcade',
        arcade: { debug: false },
      },
    }
    
    this.game = new Phaser.Game(config)
    
    // Wait for game to be ready
    await new Promise<void>((resolve) => {
      this.game!.events.once('ready', () => {
        this.setupSceneListeners()
        resolve()
      })
      
      // Fallback timeout
      setTimeout(resolve, 1000)
    })
    
    // Start quarter intro
    this.showQuarterIntro()
  }
  
  /**
   * Setup event listeners for Phaser scenes
   */
  private setupSceneListeners() {
    if (!this.game) return
    
    const offenseScene = this.game.scene.getScene('OffenseScene')
    const defenseScene = this.game.scene.getScene('DefenseScene')
    
    // Offense scene events
    if (offenseScene) {
      offenseScene.events.on('touchdown', () => this.handleTouchdown('offense'))
      offenseScene.events.on('firstDown', (data: { yards: number }) => this.handleFirstDown(data.yards))
      offenseScene.events.on('incomplete', () => this.handleIncomplete())
      offenseScene.events.on('sack', () => this.handleSack('offense'))
      offenseScene.events.on('interception', () => this.handleTurnover('interception'))
      offenseScene.events.on('playComplete', (data: { yards: number }) => this.handlePlayComplete(data.yards))
      offenseScene.events.on('gameStateUpdate', (state: Partial<GameManagerState>) => {
        // Sync pressure, selected receiver, etc.
        Object.assign(this.state, state)
        this.notifyStateListeners()
      })
    }
    
    // Defense scene events
    if (defenseScene) {
      defenseScene.events.on('sack', () => this.handleSack('defense'))
      defenseScene.events.on('tackle', (data: { yards: number }) => this.handleTackle(data.yards))
      defenseScene.events.on('opponentTouchdown', () => this.handleTouchdown('defense'))
      defenseScene.events.on('turnoverOnDowns', () => this.handleTurnover('downs'))
      defenseScene.events.on('interception', () => this.handleTurnover('interception'))
      defenseScene.events.on('gameStateUpdate', (state: Partial<GameManagerState>) => {
        Object.assign(this.state, state)
        this.notifyStateListeners()
      })
    }
  }
  
  // ============================================================================
  // Quarter Flow
  // ============================================================================
  
  private showQuarterIntro() {
    this.state.phase = 'quarterIntro'
    this.notifyStateListeners()
    
    // Determine possession for this quarter
    // Q1, Q3 = Offense | Q2, Q4 = Defense
    this.state.possession = (this.state.quarter % 2 === 1) ? 'offense' : 'defense'
    
    // Reset ball position for new quarter
    if (this.state.quarter === 1 || this.state.quarter === 3) {
      this.state.ballPosition = RULES_CONFIG.touchbackYardLine
      this.state.down = 1
      this.state.yardsToGo = RULES_CONFIG.yardsForFirstDown
    }
    
    // After intro delay, start playing
    setTimeout(() => {
      this.startQuarter()
    }, 2500)
  }
  
  private startQuarter() {
    this.state.phase = 'playing'
    this.state.clockMs = CLOCK_CONFIG.quarterLengthMs
    this.state.currentStats = this.getEmptyStats()
    
    // Start the appropriate scene
    if (this.game) {
      const sceneKey = this.state.possession === 'offense' ? 'OffenseScene' : 'DefenseScene'
      const otherScene = this.state.possession === 'offense' ? 'DefenseScene' : 'OffenseScene'
      
      // Stop other scene, start current
      this.game.scene.stop(otherScene)
      this.game.scene.start(sceneKey, { weekId: this.state.weekId })
    }
    
    // Start clock
    this.startClock()
    this.notifyStateListeners()
  }
  
  private startClock() {
    if (this.clockInterval) {
      clearInterval(this.clockInterval)
    }
    
    const tickMs = 100
    this.clockInterval = window.setInterval(() => {
      if (this.state.phase !== 'playing') return
      
      this.state.clockMs -= tickMs
      
      if (this.state.clockMs <= 0) {
        this.state.clockMs = 0
        this.endQuarter()
      }
      
      this.notifyStateListeners()
    }, tickMs)
  }
  
  private stopClock() {
    if (this.clockInterval) {
      clearInterval(this.clockInterval)
      this.clockInterval = null
    }
  }
  
  private endQuarter() {
    this.stopClock()
    
    // Save quarter stats
    this.state.fullStats.quarters.push({ ...this.state.currentStats })
    
    // Accumulate total stats
    const total = this.state.fullStats.total
    const current = this.state.currentStats
    total.touchdowns += current.touchdowns
    total.yardsGained += current.yardsGained
    total.firstDowns += current.firstDowns
    total.sacks += current.sacks
    total.turnovers += current.turnovers
    total.completions += current.completions
    total.attempts += current.attempts
    total.tackles += current.tackles
    
    this.state.phase = 'quarterEnd'
    this.notifyStateListeners()
    
    // Check for halftime or game over
    setTimeout(() => {
      if (this.state.quarter === 2) {
        this.showHalftime()
      } else if (this.state.quarter >= 4) {
        this.endGame()
      } else {
        this.state.quarter++
        this.showQuarterIntro()
      }
    }, 2000)
  }
  
  private showHalftime() {
    this.state.phase = 'halftime'
    this.notifyStateListeners()
    
    // After halftime, start Q3
    setTimeout(() => {
      this.state.quarter = 3
      this.showQuarterIntro()
    }, 4000)
  }
  
  private endGame() {
    this.state.phase = 'gameOver'
    
    // Determine MVP
    const stats = this.state.fullStats.total
    if (stats.touchdowns >= 3) {
      this.state.fullStats.mvpPlayer = 'Sam Darnold'
    } else if (stats.sacks >= 2) {
      this.state.fullStats.mvpPlayer = 'DeMarcus Lawrence'
    }
    
    this.notifyStateListeners()
    
    // Cleanup
    this.destroy()
  }
  
  // ============================================================================
  // Game Events
  // ============================================================================
  
  private handleTouchdown(side: PossessionType) {
    const event: GameEvent = {
      type: 'touchdown',
      quarter: this.state.quarter,
      clockMs: this.state.clockMs,
      possession: side,
    }
    
    if (side === 'offense') {
      // Player scored on offense
      this.state.score.darkSide += RULES_CONFIG.touchdownPoints
      this.state.currentStats.touchdowns++
    } else {
      // Opponent scored (player was on defense)
      this.state.score.opponent += RULES_CONFIG.touchdownPoints
    }
    
    // Reset for next drive
    this.state.ballPosition = RULES_CONFIG.touchbackYardLine
    this.state.down = 1
    this.state.yardsToGo = RULES_CONFIG.yardsForFirstDown
    
    this.notifyEventListeners(event)
    this.notifyStateListeners()
  }
  
  private handleFirstDown(yards: number) {
    this.state.currentStats.firstDowns++
    this.state.currentStats.yardsGained += yards
    this.state.ballPosition += yards
    this.state.down = 1
    this.state.yardsToGo = RULES_CONFIG.yardsForFirstDown
    
    // Update biggest play
    if (yards > this.state.fullStats.biggestPlay) {
      this.state.fullStats.biggestPlay = yards
    }
    
    const event: GameEvent = {
      type: 'firstDown',
      quarter: this.state.quarter,
      clockMs: this.state.clockMs,
      possession: this.state.possession,
      yards,
    }
    
    this.notifyEventListeners(event)
    this.notifyStateListeners()
  }
  
  private handlePlayComplete(yards: number) {
    this.state.currentStats.yardsGained += yards
    this.state.ballPosition += yards
    this.state.yardsToGo -= yards
    
    if (this.state.yardsToGo <= 0) {
      // Got first down
      this.handleFirstDown(yards)
    } else {
      // Next down
      this.state.down++
      
      if (this.state.down > 4) {
        // Turnover on downs
        this.handleTurnover('downs')
      }
    }
    
    this.notifyStateListeners()
  }
  
  private handleIncomplete() {
    this.state.currentStats.attempts++
    this.state.down++
    
    if (this.state.down > 4) {
      this.handleTurnover('downs')
    }
    
    const event: GameEvent = {
      type: 'incomplete',
      quarter: this.state.quarter,
      clockMs: this.state.clockMs,
      possession: this.state.possession,
    }
    
    this.notifyEventListeners(event)
    this.notifyStateListeners()
  }
  
  private handleSack(side: PossessionType) {
    this.state.currentStats.sacks++
    
    if (side === 'offense') {
      // Player got sacked
      this.state.ballPosition -= 7
      this.state.yardsToGo += 7
      this.state.down++
    } else {
      // Player got a sack on defense (good!)
      // Ball moves back for opponent
    }
    
    if (this.state.down > 4) {
      this.handleTurnover('downs')
    }
    
    const event: GameEvent = {
      type: 'sack',
      quarter: this.state.quarter,
      clockMs: this.state.clockMs,
      possession: this.state.possession,
      yards: -7,
    }
    
    this.notifyEventListeners(event)
    this.notifyStateListeners()
  }
  
  private handleTackle(yards: number) {
    this.state.currentStats.tackles++
    
    const event: GameEvent = {
      type: 'tackle',
      quarter: this.state.quarter,
      clockMs: this.state.clockMs,
      possession: this.state.possession,
      yards,
    }
    
    this.notifyEventListeners(event)
    this.notifyStateListeners()
  }
  
  private handleTurnover(type: 'interception' | 'fumble' | 'downs') {
    this.state.currentStats.turnovers++
    
    const event: GameEvent = {
      type: type === 'downs' ? 'turnover' : type,
      quarter: this.state.quarter,
      clockMs: this.state.clockMs,
      possession: this.state.possession,
    }
    
    // Flip possession within scene (opponent gets ball)
    this.state.down = 1
    this.state.yardsToGo = RULES_CONFIG.yardsForFirstDown
    this.state.ballPosition = 100 - this.state.ballPosition // Flip field position
    
    this.notifyEventListeners(event)
    this.notifyStateListeners()
  }
  
  // ============================================================================
  // Public API
  // ============================================================================
  
  /**
   * Get current game state
   */
  getState(): GameManagerState {
    return { ...this.state }
  }
  
  /**
   * Subscribe to state changes
   */
  subscribe(listener: StateListener): () => void {
    this.stateListeners.add(listener)
    return () => this.stateListeners.delete(listener)
  }
  
  /**
   * Subscribe to game events
   */
  onEvent(listener: EventListener): () => void {
    this.eventListeners.add(listener)
    return () => this.eventListeners.delete(listener)
  }
  
  /**
   * Pause the game
   */
  pause() {
    this.stopClock()
    if (this.game) {
      this.game.scene.pause(this.state.possession === 'offense' ? 'OffenseScene' : 'DefenseScene')
    }
  }
  
  /**
   * Resume the game
   */
  resume() {
    this.startClock()
    if (this.game) {
      this.game.scene.resume(this.state.possession === 'offense' ? 'OffenseScene' : 'DefenseScene')
    }
  }
  
  /**
   * Get the Phaser game instance
   */
  getPhaserGame(): Phaser.Game | null {
    return this.game
  }
  
  /**
   * Cleanup
   */
  destroy() {
    this.stopClock()
    
    if (this.game) {
      this.game.destroy(true)
      this.game = null
    }
    
    this.stateListeners.clear()
    this.eventListeners.clear()
  }
  
  // ============================================================================
  // Notification
  // ============================================================================
  
  private notifyStateListeners() {
    const stateCopy = { ...this.state }
    this.stateListeners.forEach(listener => listener(stateCopy))
  }
  
  private notifyEventListeners(event: GameEvent) {
    this.eventListeners.forEach(listener => listener(event))
  }
}

// Export singleton
export const GameManager = GameManagerClass.getInstance()
export type { GameManagerClass }
