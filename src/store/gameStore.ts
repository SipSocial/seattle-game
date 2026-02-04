import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PowerUpType } from '../game/data/powerups'
import { DEFAULT_DEFENDER } from '../game/data/roster'
import { 
  GAMES_PER_STAGE, 
  TOTAL_GAMES, 
  TOTAL_STAGES,
  getStageByGame, 
  getGameInStage,
  isStageComplete,
  isCampaignComplete,
  getDifficultyModifier,
  getCampaignProgress,
  CampaignStage 
} from '../game/data/campaign'

export interface LeaderboardEntry {
  id: string
  playerName: string
  jerseyNumber: number
  score: number
  wave: number
  tackles: number
  date: string
  hasEngaged?: boolean // True if user completed follow/enter/share
}

export interface ActivePowerUp {
  type: PowerUpType
  remainingTime: number
}

// Upgrade types for between-wave selection
export type UpgradeType = 
  | 'ADD_DEFENDER' 
  | 'SPEED_BOOST' 
  | 'TACKLE_RADIUS' 
  | 'EXTRA_LIFE'
  | 'HAZY_IPA' 
  | 'WATERMELON' 
  | 'LEMON_LIME' 
  | 'BLOOD_ORANGE'

export interface Upgrade {
  type: UpgradeType
  name: string
  description: string
  color: string // hex color string for React
  icon: 'teammate' | 'speed' | 'reach' | 'life' | 'slow' | 'health' | 'boost' | 'power'
}

// Modal state interfaces
export interface UpgradeModalState {
  isOpen: boolean
  upgrades: Upgrade[]
  selectedUpgrade: UpgradeType | null
}

export interface VictoryModalState {
  isOpen: boolean
  type: 'victory' | 'stage_complete' | 'super_bowl'
  stageId: number
  stageName: string
  bonusPoints: number
}

export interface BossIntroState {
  isOpen: boolean
  bossName: string
  bossType: string
}

export interface StageBannerState {
  isOpen: boolean
  cityName: string
  stageId: number
  gameInStage: number
  totalGamesInStage: number
}

export interface LoadingState {
  isOpen: boolean
  progress: number // 0-100
  message: string
}

export interface BrandingState {
  isOpen: boolean
}

// AR Mode state
export type CameraPermission = 'prompt' | 'granted' | 'denied'

export interface ARModeState {
  enabled: boolean
  cameraPermission: CameraPermission
}

// Per-stage completion tracking (dual mode)
export interface StageProgress {
  stageId: number
  qbCompleted: boolean      // Completed in QB mode
  defenseCompleted: boolean // Completed in Defense mode
  qbHighScore: number
  defenseHighScore: number
  qbStars: 0 | 1 | 2 | 3   // Performance rating
  defenseStars: 0 | 1 | 2 | 3
}

// Campaign progress tracking
export interface CampaignProgress {
  currentGame: number // 1-51
  currentStageId: number // 1-17
  gamesWon: number // Total games won
  totalScore: number // Cumulative score across campaign
  stagesUnlocked: number[] // Array of unlocked stage IDs
  stageHighScores: Record<number, number> // Best score per stage
  stageProgress: Record<number, StageProgress> // Dual mode progress per stage
  isCampaignComplete: boolean
  superBowlWon: boolean
  // V5 Entry Tracking
  totalEntries: number
  shareBonusUsed: boolean
}

// V5 Game Session State
export interface GameSession {
  isActive: boolean
  mode: 'qb' | 'defense' | null
  hideBottomNav: boolean
  currentStageId: number | null
  startTime: number | null
  stats: {
    tackles?: number
    sacks?: number
    interceptions?: number
    passBreakups?: number
    yardsAllowed?: number
    touchdownsAllowed?: number
    score?: number
    won?: boolean
  } | null
}

interface GameState {
  // Player selection
  selectedDefender: number
  selectedOffense: number
  playerName: string
  
  // Game mode - 'qb' for QB Legend, 'defense' for Blockbuster Defense
  playMode: 'qb' | 'defense' | null

  // Game session state (reset each game)
  score: number
  lives: number
  wave: number
  combo: number
  maxCombo: number
  tackles: number
  
  // 12th Man (Fan Meter) - builds up with consecutive tackles
  fanMeter: number // 0-100
  fanMeterActive: boolean // True when 12th Man is triggered
  
  // Power-up state
  activePowerUp: ActivePowerUp | null

  // Campaign state (persisted)
  campaign: CampaignProgress
  gameMode: 'campaign' | 'endless' // Toggle between campaign and classic endless mode

  // Leaderboard (persisted)
  leaderboard: LeaderboardEntry[]

  // High score tracking
  highScore: number
  
  // Social engagement tracking (persisted)
  hasFollowed: boolean
  hasEntered: boolean
  hasShared: boolean
  
  // UI Modal States (React overlays)
  upgradeModal: UpgradeModalState
  victoryModal: VictoryModalState
  bossIntro: BossIntroState
  stageBanner: StageBannerState
  loadingScreen: LoadingState
  brandingScreen: BrandingState
  arMode: ARModeState
  
  // Stats panel (shown in HUD)
  stats: {
    defenderCount: number
    speedBoost: number
    tackleRadius: number
    enemySlowdown: number
  }
  
  // V5 Session State
  session: GameSession
  
  // Actions
  setSelectedDefender: (jersey: number) => void
  setSelectedOffense: (jersey: number) => void
  setPlayerName: (name: string) => void
  setPlayMode: (mode: 'qb' | 'defense') => void
  
  // Game actions
  startGame: () => void
  addScore: (points: number) => void
  loseLife: () => void
  addLife: () => void
  incrementWave: () => void
  addTackle: () => void
  incrementCombo: () => void
  resetCombo: () => void
  
  // 12th Man actions
  addFanMeter: (amount: number) => void
  setFanMeter: (value: number) => void
  triggerFanMeter: () => void
  resetFanMeter: () => void
  
  // Power-up actions
  setActivePowerUp: (powerUp: ActivePowerUp | null) => void
  
  // Campaign actions
  setGameMode: (mode: 'campaign' | 'endless') => void
  startCampaignGame: () => void
  winCampaignGame: () => void
  loseCampaignGame: () => void
  resetCampaign: () => void
  getCurrentStage: () => CampaignStage
  getCampaignDifficulty: () => number
  
  // Dual mode progress actions
  completeStageQB: (stageId: number, score: number, stars: 0 | 1 | 2 | 3) => void
  completeStageDefense: (stageId: number, score: number, stars: 0 | 1 | 2 | 3) => void
  getStageProgress: (stageId: number) => StageProgress | null
  isStageFullyComplete: (stageId: number) => boolean
  
  // Social engagement actions
  setFollowed: () => void
  setEntered: () => void
  setShared: () => void
  
  // Leaderboard actions
  addLeaderboardEntry: (entry: Omit<LeaderboardEntry, 'id' | 'date'>) => void
  
  // UI Modal actions
  showUpgradeModal: (upgrades: Upgrade[]) => void
  hideUpgradeModal: () => void
  selectUpgrade: (type: UpgradeType) => void
  
  showVictoryModal: (type: 'victory' | 'stage_complete' | 'super_bowl', stageId: number, stageName: string, bonusPoints: number) => void
  hideVictoryModal: () => void
  
  showBossIntro: (bossName: string, bossType: string) => void
  hideBossIntro: () => void
  
  showStageBanner: (cityName: string, stageId: number, gameInStage: number, totalGamesInStage: number) => void
  hideStageBanner: () => void
  
  showLoadingScreen: (message?: string) => void
  updateLoadingProgress: (progress: number) => void
  hideLoadingScreen: () => void
  
  showBrandingScreen: () => void
  hideBrandingScreen: () => void
  
  // AR Mode actions
  setArMode: (enabled: boolean) => void
  setCameraPermission: (permission: CameraPermission) => void
  
  updateStats: (stats: Partial<GameState['stats']>) => void
  
  // V5 Session actions
  startGameSession: (mode: 'qb' | 'defense', stageId?: number) => void
  endGameSession: (stats: GameSession['stats']) => void
  setHideBottomNav: (hide: boolean) => void
  
  // V5 Entry actions
  addEntries: (amount: number) => void
  addShareBonusEntry: () => void
  getEntriesFromScore: (score: number) => number
  completeStageWithEntries: (stageId: number, mode: 'qb' | 'defense', score: number, stars: 0 | 1 | 2 | 3) => void
  
  // Reset
  resetGame: () => void
}

const INITIAL_GAME_STATE = {
  score: 0,
  lives: 3,
  wave: 1,
  combo: 0,
  maxCombo: 0,
  tackles: 0,
  fanMeter: 0,
  fanMeterActive: false,
  activePowerUp: null,
}

const INITIAL_MODAL_STATES = {
  upgradeModal: {
    isOpen: false,
    upgrades: [] as Upgrade[],
    selectedUpgrade: null as UpgradeType | null,
  },
  victoryModal: {
    isOpen: false,
    type: 'victory' as const,
    stageId: 0,
    stageName: '',
    bonusPoints: 0,
  },
  bossIntro: {
    isOpen: false,
    bossName: '',
    bossType: '',
  },
  stageBanner: {
    isOpen: false,
    cityName: '',
    stageId: 0,
    gameInStage: 0,
    totalGamesInStage: 0,
  },
  loadingScreen: {
    isOpen: false,
    progress: 0,
    message: 'Loading...',
  },
  brandingScreen: {
    isOpen: false,
  },
  arMode: {
    enabled: false,
    cameraPermission: 'prompt' as CameraPermission,
  },
  stats: {
    defenderCount: 1,
    speedBoost: 0,
    tackleRadius: 0,
    enemySlowdown: 0,
  },
}

const INITIAL_CAMPAIGN_STATE: CampaignProgress = {
  currentGame: 1,
  currentStageId: 1,
  gamesWon: 0,
  totalScore: 0,
  stagesUnlocked: [1], // Stage 1 always unlocked
  stageHighScores: {},
  stageProgress: {}, // Dual mode progress per stage
  isCampaignComplete: false,
  superBowlWon: false,
  // V5 Entry Tracking
  totalEntries: 0,
  shareBonusUsed: false,
}

const INITIAL_SESSION_STATE: GameSession = {
  isActive: false,
  mode: null,
  hideBottomNav: false,
  currentStageId: null,
  startTime: null,
  stats: null,
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedDefender: DEFAULT_DEFENDER,
      selectedOffense: 4, // Default to Sam Darnold #4
      playerName: '',
      playMode: null,
      ...INITIAL_GAME_STATE,
      ...INITIAL_MODAL_STATES,
      campaign: INITIAL_CAMPAIGN_STATE,
      session: INITIAL_SESSION_STATE,
      gameMode: 'campaign' as const,
      leaderboard: [],
      highScore: 0,
      hasFollowed: false,
      hasEntered: false,
      hasShared: false,

      // Player selection
      setSelectedDefender: (jersey) => set({ selectedDefender: jersey }),
      setSelectedOffense: (jersey) => set({ selectedOffense: jersey }),
      setPlayerName: (name) => set({ playerName: name.toUpperCase().slice(0, 3) }),
      setPlayMode: (mode) => set({ playMode: mode }),

      // Game actions
      startGame: () => set({ ...INITIAL_GAME_STATE }),
      
      addScore: (points) => {
        const { score, combo, highScore } = get()
        const multiplier = 1 + (combo * 0.5) // 1x, 1.5x, 2x, 2.5x, 3x
        const cappedMultiplier = Math.min(multiplier, 3)
        const newScore = score + Math.floor(points * cappedMultiplier)
        set({ 
          score: newScore,
          highScore: Math.max(highScore, newScore),
        })
      },
      
      loseLife: () => {
        const { lives } = get()
        set({ lives: Math.max(0, lives - 1) })
      },
      
      addLife: () => {
        const { lives } = get()
        set({ lives: Math.min(5, lives + 1) }) // Max 5 lives
      },
      
      incrementWave: () => {
        const { wave } = get()
        set({ wave: wave + 1 })
      },
      
      addTackle: () => {
        const { tackles } = get()
        set({ tackles: tackles + 1 })
      },
      
      incrementCombo: () => {
        const { combo, maxCombo } = get()
        const newCombo = Math.min(combo + 1, 4) // Max 4 for 3x multiplier
        set({ 
          combo: newCombo,
          maxCombo: Math.max(maxCombo, newCombo),
        })
      },
      
      resetCombo: () => set({ combo: 0 }),
      
      // 12th Man (Fan Meter) actions
      addFanMeter: (amount) => {
        const { fanMeter, wave } = get()
        // Only start building fan meter after wave 3
        if (wave < 3) return
        const newMeter = Math.min(100, fanMeter + amount)
        set({ fanMeter: newMeter })
      },
      
      setFanMeter: (value) => {
        set({ fanMeter: Math.min(100, Math.max(0, value)) })
      },
      
      triggerFanMeter: () => {
        set({ fanMeterActive: true, fanMeter: 0 })
      },
      
      resetFanMeter: () => {
        set({ fanMeterActive: false })
      },

      // Power-up actions
      setActivePowerUp: (powerUp) => set({ activePowerUp: powerUp }),
      
      // Campaign actions
      setGameMode: (mode) => set({ gameMode: mode }),
      
      startCampaignGame: () => {
        const { campaign } = get()
        // Start a new game in campaign mode
        set({ 
          ...INITIAL_GAME_STATE,
          // Apply campaign difficulty modifier to starting lives
          lives: campaign.currentStageId >= 16 ? 3 : 4, // Fewer lives in playoffs
        })
      },
      
      winCampaignGame: () => {
        const { campaign, score } = get()
        const newGamesWon = campaign.gamesWon + 1
        const newTotalScore = campaign.totalScore + score
        const newCurrentGame = campaign.currentGame + 1
        const newStageId = getStageByGame(newCurrentGame).id
        
        // Check if we're unlocking a new stage
        const stagesUnlocked = [...campaign.stagesUnlocked]
        if (!stagesUnlocked.includes(newStageId)) {
          stagesUnlocked.push(newStageId)
        }
        
        // Update stage high score
        const stageHighScores = { ...campaign.stageHighScores }
        const currentStageId = campaign.currentStageId
        if (!stageHighScores[currentStageId] || score > stageHighScores[currentStageId]) {
          stageHighScores[currentStageId] = score
        }
        
        // Check if campaign is complete
        const campaignComplete = isCampaignComplete(newGamesWon)
        const superBowlWon = campaignComplete && campaign.currentStageId === TOTAL_STAGES
        
        set({
          campaign: {
            ...campaign,
            currentGame: campaignComplete ? campaign.currentGame : newCurrentGame,
            currentStageId: campaignComplete ? campaign.currentStageId : newStageId,
            gamesWon: newGamesWon,
            totalScore: newTotalScore,
            stagesUnlocked,
            stageHighScores,
            isCampaignComplete: campaignComplete,
            superBowlWon,
          }
        })
      },
      
      loseCampaignGame: () => {
        // In campaign mode, losing a game doesn't reset progress
        // Player can retry the same game
        const { campaign, score } = get()
        
        // Still track score for stats
        set({
          campaign: {
            ...campaign,
            totalScore: campaign.totalScore + score,
          }
        })
      },
      
      resetCampaign: () => {
        set({
          campaign: INITIAL_CAMPAIGN_STATE,
        })
      },
      
      getCurrentStage: () => {
        const { campaign } = get()
        return getStageByGame(campaign.currentGame)
      },
      
      getCampaignDifficulty: () => {
        const { campaign } = get()
        return getDifficultyModifier(campaign.currentGame)
      },
      
      // Dual mode progress actions
      completeStageQB: (stageId, score, stars) => {
        const { campaign } = get()
        const existing = campaign.stageProgress[stageId] || {
          stageId,
          qbCompleted: false,
          defenseCompleted: false,
          qbHighScore: 0,
          defenseHighScore: 0,
          qbStars: 0 as const,
          defenseStars: 0 as const,
        }
        
        const newStageProgress: StageProgress = {
          ...existing,
          qbCompleted: true,
          qbHighScore: Math.max(existing.qbHighScore, score),
          qbStars: Math.max(existing.qbStars, stars) as 0 | 1 | 2 | 3,
        }
        
        // Unlock next stage if both modes not required, or if already unlocked
        const stagesUnlocked = [...campaign.stagesUnlocked]
        const nextStageId = stageId + 1
        if (!stagesUnlocked.includes(nextStageId) && nextStageId <= TOTAL_STAGES) {
          stagesUnlocked.push(nextStageId)
        }
        
        set({
          campaign: {
            ...campaign,
            stageProgress: {
              ...campaign.stageProgress,
              [stageId]: newStageProgress,
            },
            stagesUnlocked,
            totalScore: campaign.totalScore + score,
          },
        })
      },
      
      completeStageDefense: (stageId, score, stars) => {
        const { campaign } = get()
        const existing = campaign.stageProgress[stageId] || {
          stageId,
          qbCompleted: false,
          defenseCompleted: false,
          qbHighScore: 0,
          defenseHighScore: 0,
          qbStars: 0 as const,
          defenseStars: 0 as const,
        }
        
        const newStageProgress: StageProgress = {
          ...existing,
          defenseCompleted: true,
          defenseHighScore: Math.max(existing.defenseHighScore, score),
          defenseStars: Math.max(existing.defenseStars, stars) as 0 | 1 | 2 | 3,
        }
        
        // Unlock next stage
        const stagesUnlocked = [...campaign.stagesUnlocked]
        const nextStageId = stageId + 1
        if (!stagesUnlocked.includes(nextStageId) && nextStageId <= TOTAL_STAGES) {
          stagesUnlocked.push(nextStageId)
        }
        
        set({
          campaign: {
            ...campaign,
            stageProgress: {
              ...campaign.stageProgress,
              [stageId]: newStageProgress,
            },
            stagesUnlocked,
            totalScore: campaign.totalScore + score,
          },
        })
      },
      
      getStageProgress: (stageId) => {
        const { campaign } = get()
        return campaign.stageProgress[stageId] || null
      },
      
      isStageFullyComplete: (stageId) => {
        const { campaign } = get()
        const progress = campaign.stageProgress[stageId]
        if (!progress) return false
        return progress.qbCompleted && progress.defenseCompleted
      },
      
      // Social engagement actions
      setFollowed: () => set({ hasFollowed: true }),
      setEntered: () => set({ hasEntered: true }),
      setShared: () => set({ hasShared: true }),

      // Leaderboard
      addLeaderboardEntry: (entry) => {
        const { leaderboard, hasFollowed, hasEntered, hasShared } = get()
        const hasEngaged = hasFollowed && hasEntered && hasShared
        const newEntry: LeaderboardEntry = {
          ...entry,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          date: new Date().toISOString(),
          hasEngaged,
        }
        
        // Add and sort by score, keep top 10
        const updated = [...leaderboard, newEntry]
          .sort((a, b) => b.score - a.score)
          .slice(0, 10)
        
        set({ leaderboard: updated })
      },

      // UI Modal actions
      showUpgradeModal: (upgrades) => {
        set({
          upgradeModal: {
            isOpen: true,
            upgrades,
            selectedUpgrade: null,
          }
        })
      },
      
      hideUpgradeModal: () => {
        set({
          upgradeModal: {
            ...get().upgradeModal,
            isOpen: false,
          }
        })
      },
      
      selectUpgrade: (type) => {
        set({
          upgradeModal: {
            ...get().upgradeModal,
            selectedUpgrade: type,
            isOpen: false,
          }
        })
      },
      
      showVictoryModal: (type, stageId, stageName, bonusPoints) => {
        set({
          victoryModal: {
            isOpen: true,
            type,
            stageId,
            stageName,
            bonusPoints,
          }
        })
      },
      
      hideVictoryModal: () => {
        set({
          victoryModal: {
            ...get().victoryModal,
            isOpen: false,
          }
        })
      },
      
      showBossIntro: (bossName, bossType) => {
        set({
          bossIntro: {
            isOpen: true,
            bossName,
            bossType,
          }
        })
      },
      
      hideBossIntro: () => {
        set({
          bossIntro: {
            ...get().bossIntro,
            isOpen: false,
          }
        })
      },
      
      showStageBanner: (cityName, stageId, gameInStage, totalGamesInStage) => {
        set({
          stageBanner: {
            isOpen: true,
            cityName,
            stageId,
            gameInStage,
            totalGamesInStage,
          }
        })
      },
      
      hideStageBanner: () => {
        set({
          stageBanner: {
            ...get().stageBanner,
            isOpen: false,
          }
        })
      },
      
      showLoadingScreen: (message = 'Loading...') => {
        set({
          loadingScreen: {
            isOpen: true,
            progress: 0,
            message,
          }
        })
      },
      
      updateLoadingProgress: (progress) => {
        set({
          loadingScreen: {
            ...get().loadingScreen,
            progress,
          }
        })
      },
      
      hideLoadingScreen: () => {
        set({
          loadingScreen: {
            ...get().loadingScreen,
            isOpen: false,
          }
        })
      },
      
      showBrandingScreen: () => {
        set({ brandingScreen: { isOpen: true } })
      },
      
      hideBrandingScreen: () => {
        set({ brandingScreen: { isOpen: false } })
      },
      
      // AR Mode actions
      setArMode: (enabled) => {
        set({
          arMode: {
            ...get().arMode,
            enabled,
          }
        })
      },
      
      setCameraPermission: (permission) => {
        set({
          arMode: {
            ...get().arMode,
            cameraPermission: permission,
          }
        })
      },
      
      updateStats: (newStats) => {
        set({
          stats: {
            ...get().stats,
            ...newStats,
          }
        })
      },
      
      // V5 Session actions
      startGameSession: (mode, stageId) => {
        set({
          session: {
            isActive: true,
            mode,
            hideBottomNav: true,
            currentStageId: stageId ?? get().campaign.currentStageId,
            startTime: Date.now(),
            stats: null,
          },
          playMode: mode, // Sync with existing playMode
        })
      },
      
      endGameSession: (stats) => {
        const { session, campaign } = get()
        
        // Calculate entries from score
        const entriesEarned = stats?.score 
          ? get().getEntriesFromScore(stats.score)
          : 0
        
        // Add entries if won
        const newEntries = stats?.won && entriesEarned > 0
          ? campaign.totalEntries + entriesEarned
          : campaign.totalEntries
        
        set({
          session: {
            ...session,
            isActive: false,
            hideBottomNav: false,
            stats,
          },
          campaign: {
            ...campaign,
            totalEntries: newEntries,
          },
        })
      },
      
      setHideBottomNav: (hide) => {
        set((state) => ({
          session: {
            ...state.session,
            hideBottomNav: hide,
          },
        }))
      },
      
      // V5 Entry actions
      addEntries: (amount) => {
        set((state) => ({
          campaign: {
            ...state.campaign,
            totalEntries: state.campaign.totalEntries + amount,
          },
        }))
      },
      
      addShareBonusEntry: () => {
        const { campaign } = get()
        if (!campaign.shareBonusUsed) {
          set({
            campaign: {
              ...campaign,
              totalEntries: campaign.totalEntries + 1,
              shareBonusUsed: true,
            },
          })
        }
      },
      
      getEntriesFromScore: (score) => {
        // Calculate entries based on score tiers
        // Higher scores = more entries
        if (score >= 10000) return 5 // Gold tier
        if (score >= 5000) return 3  // Silver tier
        if (score >= 1000) return 2  // Bronze tier
        return 1 // Participation
      },
      
      completeStageWithEntries: (stageId, mode, score, stars) => {
        // Complete stage using existing methods
        if (mode === 'qb') {
          get().completeStageQB(stageId, score, stars)
        } else {
          get().completeStageDefense(stageId, score, stars)
        }
        
        // Add entries based on score
        const entriesEarned = get().getEntriesFromScore(score)
        get().addEntries(entriesEarned)
      },

      // Reset
      resetGame: () => set({ ...INITIAL_GAME_STATE, ...INITIAL_MODAL_STATES, session: INITIAL_SESSION_STATE }),
    }),
    {
      name: 'darkside-defense-storage',
      partialize: (state) => ({
        selectedDefender: state.selectedDefender,
        playerName: state.playerName,
        campaign: state.campaign,
        gameMode: state.gameMode,
        leaderboard: state.leaderboard,
        highScore: state.highScore,
        hasFollowed: state.hasFollowed,
        hasEntered: state.hasEntered,
        hasShared: state.hasShared,
        arMode: state.arMode,
      }),
      // Merge function to handle old persisted data missing new fields
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<GameState>
        return {
          ...currentState,
          ...persisted,
          // Ensure campaign has all required fields with defaults
          campaign: {
            ...INITIAL_CAMPAIGN_STATE,
            ...(persisted.campaign || {}),
            // V5 fields with defaults
            totalEntries: persisted.campaign?.totalEntries ?? 0,
            shareBonusUsed: persisted.campaign?.shareBonusUsed ?? false,
          },
        }
      },
    }
  )
)

// Selector hooks for common state
export const useScore = () => useGameStore((state) => state.score)
export const useLives = () => useGameStore((state) => state.lives)
export const useWave = () => useGameStore((state) => state.wave)
export const useCombo = () => useGameStore((state) => state.combo)
export const useLeaderboard = () => useGameStore((state) => state.leaderboard)
export const useFanMeter = () => useGameStore((state) => state.fanMeter)
export const useSocialEngagement = () => useGameStore((state) => ({
  hasFollowed: state.hasFollowed,
  hasEntered: state.hasEntered,
  hasShared: state.hasShared,
  isFullyEngaged: state.hasFollowed && state.hasEntered && state.hasShared,
}))

// Campaign selector hooks
export const useCampaign = () => useGameStore((state) => state.campaign)
export const useGameMode = () => useGameStore((state) => state.gameMode)
export const useCampaignProgress = () => useGameStore((state) => ({
  currentGame: state.campaign.currentGame,
  currentStageId: state.campaign.currentStageId,
  gamesWon: state.campaign.gamesWon,
  totalGames: TOTAL_GAMES,
  totalStages: TOTAL_STAGES,
  progress: getCampaignProgress(state.campaign.gamesWon),
  isComplete: state.campaign.isCampaignComplete,
  superBowlWon: state.campaign.superBowlWon,
}))

// Dual progress selector hooks
export const useStageProgress = (stageId: number) => useGameStore((state) => state.campaign.stageProgress[stageId] || null)
export const useAllStageProgress = () => useGameStore((state) => state.campaign.stageProgress)

// UI Modal selector hooks
export const useUpgradeModal = () => useGameStore((state) => state.upgradeModal)
export const useVictoryModal = () => useGameStore((state) => state.victoryModal)
export const useBossIntro = () => useGameStore((state) => state.bossIntro)
export const useStageBanner = () => useGameStore((state) => state.stageBanner)
export const useLoadingScreen = () => useGameStore((state) => state.loadingScreen)
export const useBrandingScreen = () => useGameStore((state) => state.brandingScreen)
export const usePlayerStats = () => useGameStore((state) => state.stats)

// AR Mode selector hooks
export const useArMode = () => useGameStore((state) => state.arMode)
export const useIsArEnabled = () => useGameStore((state) => state.arMode.enabled)

// V5 Session selector hooks
export const useSession = () => useGameStore((state) => state.session)
export const useHideBottomNav = () => useGameStore((state) => state.session.hideBottomNav)
export const useIsGameActive = () => useGameStore((state) => state.session.isActive)

// V5 Entry selector hooks
export const useTotalEntries = () => useGameStore((state) => state.campaign.totalEntries)
export const useShareBonusUsed = () => useGameStore((state) => state.campaign.shareBonusUsed)
