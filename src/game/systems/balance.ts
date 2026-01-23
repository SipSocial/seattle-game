/**
 * Balance System - Re-exported from store for backwards compatibility
 * Main logic is now in src/store/gameStore.ts
 */

export {
  type PowerUpId,
  type ClashModifiers,
  getDefaultModifiers,
  applyPowerUp,
  POWERUP_POOL,
  getRandomPowerUps,
} from '../../store/gameStore'

export { BASE_TAP_POWER, getAdjustedTargetForce } from '../data/levels'
