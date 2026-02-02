/**
 * V4 Defense Playbook
 * 
 * Defensive play definitions including:
 * - Base formations (3-4, 4-3, Nickel, Dime, Goal Line)
 * - Coverage schemes (Man, Zone variants, Blitz packages)
 * - Player assignments and responsibilities
 * - AI behavior hints for offense reaction
 */

// ============================================================================
// TYPES
// ============================================================================

export type DefensiveFormation = '3-4' | '4-3' | 'nickel' | 'dime' | 'goal-line' | 'prevent'

export type CoverageScheme = 
  | 'cover-0'    // Pure man, no safety help
  | 'cover-1'    // Man with single high safety
  | 'cover-2'    // Two deep safeties, zone underneath
  | 'cover-3'    // Three deep, four under zone
  | 'cover-4'    // Quarters coverage
  | 'cover-6'    // Cover 4 on one side, cover 2 on other

export type BlitzType = 
  | 'none'
  | 'lb-blitz'        // Linebacker blitz
  | 'corner-blitz'    // Corner blitz
  | 'safety-blitz'    // Safety blitz
  | 'zone-blitz'      // Zone blitz with DL dropping
  | 'all-out'         // Everyone rushes

export type DefenderRole = 
  | 'nose-tackle'
  | 'defensive-tackle'
  | 'defensive-end'
  | 'outside-linebacker'
  | 'inside-linebacker'
  | 'middle-linebacker'
  | 'cornerback'
  | 'free-safety'
  | 'strong-safety'

export type DefenderAssignment =
  | 'rush'            // Rush the QB
  | 'contain'         // Edge contain
  | 'spy'             // QB spy
  | 'man-coverage'    // Man-to-man on specific receiver
  | 'zone-flat'       // Flat zone coverage
  | 'zone-hook'       // Hook/curl zone
  | 'zone-deep-third' // Deep third zone
  | 'zone-deep-half'  // Deep half zone
  | 'zone-deep-quarter' // Deep quarter zone

export interface DefenderPosition {
  /** Position offset from center of LOS (x = horizontal, y = depth from LOS) */
  offsetX: number
  offsetY: number
  role: DefenderRole
  assignment: DefenderAssignment
  /** If man coverage, index of receiver to cover (0-based) */
  manTarget?: number
  /** Zone area to defend (for zone assignments) */
  zoneArea?: { minX: number, maxX: number, minY: number, maxY: number }
}

export interface DefensivePlay {
  id: string
  name: string
  displayName: string
  formation: DefensiveFormation
  coverage: CoverageScheme
  blitz: BlitzType
  description: string
  
  /** Player positions - D-Line first, then LBs, then DBs */
  positions: DefenderPosition[]
  
  /** Number of pass rushers */
  rushers: number
  
  /** Good against these offensive concepts */
  strongAgainst: string[]
  
  /** Weak against these offensive concepts */
  weakAgainst: string[]
  
  /** Difficulty to execute (affects timing windows) */
  difficulty: 'easy' | 'medium' | 'hard'
}

// ============================================================================
// POSITION CONSTANTS (scaled pixels)
// ============================================================================

const SCALE = 0.55 // Match offense route scale

const POS = {
  // D-Line positions (at or near LOS)
  NT: { x: 0, y: 5 },           // Nose tackle
  DT_L: { x: -40 * SCALE, y: 5 },
  DT_R: { x: 40 * SCALE, y: 5 },
  DE_L: { x: -90 * SCALE, y: 3 },
  DE_R: { x: 90 * SCALE, y: 3 },
  
  // Linebacker positions (5-8 yards off LOS)
  OLB_L: { x: -110 * SCALE, y: -60 },
  OLB_R: { x: 110 * SCALE, y: -60 },
  ILB_L: { x: -35 * SCALE, y: -50 },
  ILB_R: { x: 35 * SCALE, y: -50 },
  MLB: { x: 0, y: -55 },
  
  // DB positions (10+ yards off LOS)
  CB_L: { x: -150 * SCALE, y: -80 },
  CB_R: { x: 150 * SCALE, y: -80 },
  SLOT_L: { x: -80 * SCALE, y: -70 },
  SLOT_R: { x: 80 * SCALE, y: -70 },
  FS: { x: 0, y: -180 },
  SS: { x: 40 * SCALE, y: -140 },
}

// ============================================================================
// ZONE DEFINITIONS
// ============================================================================

const ZONES = {
  FLAT_L: { minX: -200, maxX: -80, minY: -100, maxY: 0 },
  FLAT_R: { minX: 80, maxX: 200, minY: -100, maxY: 0 },
  HOOK_L: { minX: -120, maxX: -20, minY: -180, maxY: -60 },
  HOOK_R: { minX: 20, maxX: 120, minY: -180, maxY: -60 },
  DEEP_THIRD_L: { minX: -200, maxX: -65, minY: -400, maxY: -150 },
  DEEP_THIRD_M: { minX: -65, maxX: 65, minY: -400, maxY: -150 },
  DEEP_THIRD_R: { minX: 65, maxX: 200, minY: -400, maxY: -150 },
  DEEP_HALF_L: { minX: -200, maxX: 0, minY: -400, maxY: -150 },
  DEEP_HALF_R: { minX: 0, maxX: 200, minY: -400, maxY: -150 },
}

// ============================================================================
// PLAYBOOK DEFINITIONS
// ============================================================================

export const DEFENSE_PLAYBOOK: DefensivePlay[] = [
  // ============================================================================
  // 3-4 BASE PLAYS
  // ============================================================================
  {
    id: '3-4-cover-2',
    name: '3-4 Cover 2',
    displayName: 'COVER 2',
    formation: '3-4',
    coverage: 'cover-2',
    blitz: 'none',
    description: 'Two deep safeties split the field. Good against deep passes.',
    rushers: 3,
    strongAgainst: ['deep-routes', 'four-verts'],
    weakAgainst: ['quick-slants', 'middle-of-field'],
    difficulty: 'easy',
    positions: [
      // D-Line (3)
      { offsetX: POS.DE_L.x, offsetY: POS.DE_L.y, role: 'defensive-end', assignment: 'rush' },
      { offsetX: POS.NT.x, offsetY: POS.NT.y, role: 'nose-tackle', assignment: 'rush' },
      { offsetX: POS.DE_R.x, offsetY: POS.DE_R.y, role: 'defensive-end', assignment: 'rush' },
      // Linebackers (4)
      { offsetX: POS.OLB_L.x, offsetY: POS.OLB_L.y, role: 'outside-linebacker', assignment: 'zone-flat', zoneArea: ZONES.FLAT_L },
      { offsetX: POS.ILB_L.x, offsetY: POS.ILB_L.y, role: 'inside-linebacker', assignment: 'zone-hook', zoneArea: ZONES.HOOK_L },
      { offsetX: POS.ILB_R.x, offsetY: POS.ILB_R.y, role: 'inside-linebacker', assignment: 'zone-hook', zoneArea: ZONES.HOOK_R },
      { offsetX: POS.OLB_R.x, offsetY: POS.OLB_R.y, role: 'outside-linebacker', assignment: 'zone-flat', zoneArea: ZONES.FLAT_R },
      // DBs (4)
      { offsetX: POS.CB_L.x, offsetY: POS.CB_L.y, role: 'cornerback', assignment: 'zone-flat', zoneArea: ZONES.FLAT_L },
      { offsetX: POS.CB_R.x, offsetY: POS.CB_R.y, role: 'cornerback', assignment: 'zone-flat', zoneArea: ZONES.FLAT_R },
      { offsetX: -60, offsetY: -200, role: 'free-safety', assignment: 'zone-deep-half', zoneArea: ZONES.DEEP_HALF_L },
      { offsetX: 60, offsetY: -200, role: 'strong-safety', assignment: 'zone-deep-half', zoneArea: ZONES.DEEP_HALF_R },
    ],
  },
  {
    id: '3-4-cover-3',
    name: '3-4 Cover 3',
    displayName: 'COVER 3',
    formation: '3-4',
    coverage: 'cover-3',
    blitz: 'none',
    description: 'Three deep defenders, four underneath. Balanced coverage.',
    rushers: 3,
    strongAgainst: ['four-verts', 'deep-outs'],
    weakAgainst: ['curl-flat', 'seam-routes'],
    difficulty: 'easy',
    positions: [
      // D-Line (3)
      { offsetX: POS.DE_L.x, offsetY: POS.DE_L.y, role: 'defensive-end', assignment: 'rush' },
      { offsetX: POS.NT.x, offsetY: POS.NT.y, role: 'nose-tackle', assignment: 'rush' },
      { offsetX: POS.DE_R.x, offsetY: POS.DE_R.y, role: 'defensive-end', assignment: 'rush' },
      // Linebackers (4)
      { offsetX: POS.OLB_L.x, offsetY: POS.OLB_L.y, role: 'outside-linebacker', assignment: 'zone-flat', zoneArea: ZONES.FLAT_L },
      { offsetX: POS.ILB_L.x, offsetY: POS.ILB_L.y, role: 'inside-linebacker', assignment: 'zone-hook', zoneArea: ZONES.HOOK_L },
      { offsetX: POS.ILB_R.x, offsetY: POS.ILB_R.y, role: 'inside-linebacker', assignment: 'zone-hook', zoneArea: ZONES.HOOK_R },
      { offsetX: POS.OLB_R.x, offsetY: POS.OLB_R.y, role: 'outside-linebacker', assignment: 'zone-flat', zoneArea: ZONES.FLAT_R },
      // DBs (4)
      { offsetX: POS.CB_L.x, offsetY: -120, role: 'cornerback', assignment: 'zone-deep-third', zoneArea: ZONES.DEEP_THIRD_L },
      { offsetX: POS.CB_R.x, offsetY: -120, role: 'cornerback', assignment: 'zone-deep-third', zoneArea: ZONES.DEEP_THIRD_R },
      { offsetX: 0, offsetY: -220, role: 'free-safety', assignment: 'zone-deep-third', zoneArea: ZONES.DEEP_THIRD_M },
      { offsetX: POS.SS.x, offsetY: POS.SS.y, role: 'strong-safety', assignment: 'zone-hook', zoneArea: ZONES.HOOK_R },
    ],
  },
  {
    id: '3-4-man',
    name: '3-4 Man',
    displayName: 'MAN COVERAGE',
    formation: '3-4',
    coverage: 'cover-1',
    blitz: 'none',
    description: 'Man coverage with single high safety. Tight coverage.',
    rushers: 3,
    strongAgainst: ['crossing-routes', 'option-routes'],
    weakAgainst: ['go-routes', 'pick-plays'],
    difficulty: 'medium',
    positions: [
      // D-Line (3)
      { offsetX: POS.DE_L.x, offsetY: POS.DE_L.y, role: 'defensive-end', assignment: 'rush' },
      { offsetX: POS.NT.x, offsetY: POS.NT.y, role: 'nose-tackle', assignment: 'rush' },
      { offsetX: POS.DE_R.x, offsetY: POS.DE_R.y, role: 'defensive-end', assignment: 'rush' },
      // Linebackers (4) - LBs cover TEs/RBs
      { offsetX: POS.OLB_L.x, offsetY: POS.OLB_L.y, role: 'outside-linebacker', assignment: 'man-coverage', manTarget: 2 },
      { offsetX: POS.ILB_L.x, offsetY: POS.ILB_L.y, role: 'inside-linebacker', assignment: 'spy' },
      { offsetX: POS.ILB_R.x, offsetY: POS.ILB_R.y, role: 'inside-linebacker', assignment: 'zone-hook', zoneArea: ZONES.HOOK_R },
      { offsetX: POS.OLB_R.x, offsetY: POS.OLB_R.y, role: 'outside-linebacker', assignment: 'man-coverage', manTarget: 3 },
      // DBs (4)
      { offsetX: POS.CB_L.x, offsetY: POS.CB_L.y, role: 'cornerback', assignment: 'man-coverage', manTarget: 0 },
      { offsetX: POS.CB_R.x, offsetY: POS.CB_R.y, role: 'cornerback', assignment: 'man-coverage', manTarget: 1 },
      { offsetX: 0, offsetY: -200, role: 'free-safety', assignment: 'zone-deep-third', zoneArea: ZONES.DEEP_THIRD_M },
      { offsetX: POS.SS.x, offsetY: POS.SS.y, role: 'strong-safety', assignment: 'man-coverage', manTarget: 2 },
    ],
  },
  
  // ============================================================================
  // 4-3 BASE PLAYS
  // ============================================================================
  {
    id: '4-3-cover-2',
    name: '4-3 Cover 2',
    displayName: '4-3 ZONE',
    formation: '4-3',
    coverage: 'cover-2',
    blitz: 'none',
    description: 'Four down linemen with Cover 2 shell. Strong run defense.',
    rushers: 4,
    strongAgainst: ['run-plays', 'short-passes'],
    weakAgainst: ['deep-middle', 'post-routes'],
    difficulty: 'easy',
    positions: [
      // D-Line (4)
      { offsetX: POS.DE_L.x, offsetY: POS.DE_L.y, role: 'defensive-end', assignment: 'contain' },
      { offsetX: POS.DT_L.x, offsetY: POS.DT_L.y, role: 'defensive-tackle', assignment: 'rush' },
      { offsetX: POS.DT_R.x, offsetY: POS.DT_R.y, role: 'defensive-tackle', assignment: 'rush' },
      { offsetX: POS.DE_R.x, offsetY: POS.DE_R.y, role: 'defensive-end', assignment: 'contain' },
      // Linebackers (3)
      { offsetX: POS.OLB_L.x + 20, offsetY: POS.OLB_L.y, role: 'outside-linebacker', assignment: 'zone-flat', zoneArea: ZONES.FLAT_L },
      { offsetX: POS.MLB.x, offsetY: POS.MLB.y, role: 'middle-linebacker', assignment: 'zone-hook', zoneArea: ZONES.HOOK_L },
      { offsetX: POS.OLB_R.x - 20, offsetY: POS.OLB_R.y, role: 'outside-linebacker', assignment: 'zone-flat', zoneArea: ZONES.FLAT_R },
      // DBs (4)
      { offsetX: POS.CB_L.x, offsetY: POS.CB_L.y, role: 'cornerback', assignment: 'zone-flat', zoneArea: ZONES.FLAT_L },
      { offsetX: POS.CB_R.x, offsetY: POS.CB_R.y, role: 'cornerback', assignment: 'zone-flat', zoneArea: ZONES.FLAT_R },
      { offsetX: -60, offsetY: -200, role: 'free-safety', assignment: 'zone-deep-half', zoneArea: ZONES.DEEP_HALF_L },
      { offsetX: 60, offsetY: -200, role: 'strong-safety', assignment: 'zone-deep-half', zoneArea: ZONES.DEEP_HALF_R },
    ],
  },
  
  // ============================================================================
  // NICKEL PLAYS (5 DBs)
  // ============================================================================
  {
    id: 'nickel-cover-3',
    name: 'Nickel Cover 3',
    displayName: 'NICKEL',
    formation: 'nickel',
    coverage: 'cover-3',
    blitz: 'none',
    description: '5 DBs for passing situations. Extra slot corner.',
    rushers: 4,
    strongAgainst: ['3-receiver-sets', 'slot-routes'],
    weakAgainst: ['power-run', 'play-action'],
    difficulty: 'medium',
    positions: [
      // D-Line (4)
      { offsetX: POS.DE_L.x, offsetY: POS.DE_L.y, role: 'defensive-end', assignment: 'rush' },
      { offsetX: POS.DT_L.x, offsetY: POS.DT_L.y, role: 'defensive-tackle', assignment: 'rush' },
      { offsetX: POS.DT_R.x, offsetY: POS.DT_R.y, role: 'defensive-tackle', assignment: 'rush' },
      { offsetX: POS.DE_R.x, offsetY: POS.DE_R.y, role: 'defensive-end', assignment: 'rush' },
      // Linebackers (2)
      { offsetX: POS.ILB_L.x, offsetY: POS.ILB_L.y, role: 'inside-linebacker', assignment: 'zone-hook', zoneArea: ZONES.HOOK_L },
      { offsetX: POS.ILB_R.x, offsetY: POS.ILB_R.y, role: 'inside-linebacker', assignment: 'zone-hook', zoneArea: ZONES.HOOK_R },
      // DBs (5)
      { offsetX: POS.CB_L.x, offsetY: -120, role: 'cornerback', assignment: 'zone-deep-third', zoneArea: ZONES.DEEP_THIRD_L },
      { offsetX: POS.SLOT_L.x, offsetY: POS.SLOT_L.y, role: 'cornerback', assignment: 'zone-flat', zoneArea: ZONES.FLAT_L },
      { offsetX: POS.SLOT_R.x, offsetY: POS.SLOT_R.y, role: 'cornerback', assignment: 'zone-flat', zoneArea: ZONES.FLAT_R },
      { offsetX: POS.CB_R.x, offsetY: -120, role: 'cornerback', assignment: 'zone-deep-third', zoneArea: ZONES.DEEP_THIRD_R },
      { offsetX: 0, offsetY: -220, role: 'free-safety', assignment: 'zone-deep-third', zoneArea: ZONES.DEEP_THIRD_M },
    ],
  },
  
  // ============================================================================
  // DIME PLAYS (6 DBs)
  // ============================================================================
  {
    id: 'dime-cover-4',
    name: 'Dime Cover 4',
    displayName: 'DIME',
    formation: 'dime',
    coverage: 'cover-4',
    blitz: 'none',
    description: '6 DBs. Maximum pass coverage for obvious passing downs.',
    rushers: 4,
    strongAgainst: ['4-receiver-sets', 'hail-mary'],
    weakAgainst: ['run-plays', 'screens'],
    difficulty: 'medium',
    positions: [
      // D-Line (4)
      { offsetX: POS.DE_L.x, offsetY: POS.DE_L.y, role: 'defensive-end', assignment: 'rush' },
      { offsetX: POS.DT_L.x, offsetY: POS.DT_L.y, role: 'defensive-tackle', assignment: 'rush' },
      { offsetX: POS.DT_R.x, offsetY: POS.DT_R.y, role: 'defensive-tackle', assignment: 'rush' },
      { offsetX: POS.DE_R.x, offsetY: POS.DE_R.y, role: 'defensive-end', assignment: 'rush' },
      // Linebacker (1)
      { offsetX: POS.MLB.x, offsetY: POS.MLB.y, role: 'middle-linebacker', assignment: 'zone-hook', zoneArea: ZONES.HOOK_L },
      // DBs (6)
      { offsetX: POS.CB_L.x, offsetY: -130, role: 'cornerback', assignment: 'zone-deep-quarter', zoneArea: ZONES.DEEP_THIRD_L },
      { offsetX: POS.SLOT_L.x, offsetY: POS.SLOT_L.y, role: 'cornerback', assignment: 'zone-flat', zoneArea: ZONES.FLAT_L },
      { offsetX: POS.SLOT_R.x, offsetY: POS.SLOT_R.y, role: 'cornerback', assignment: 'zone-flat', zoneArea: ZONES.FLAT_R },
      { offsetX: POS.CB_R.x, offsetY: -130, role: 'cornerback', assignment: 'zone-deep-quarter', zoneArea: ZONES.DEEP_THIRD_R },
      { offsetX: -40, offsetY: -210, role: 'free-safety', assignment: 'zone-deep-quarter', zoneArea: ZONES.DEEP_HALF_L },
      { offsetX: 40, offsetY: -210, role: 'strong-safety', assignment: 'zone-deep-quarter', zoneArea: ZONES.DEEP_HALF_R },
    ],
  },
  
  // ============================================================================
  // BLITZ PLAYS
  // ============================================================================
  {
    id: 'lb-blitz',
    name: 'LB Blitz',
    displayName: 'LB BLITZ',
    formation: '3-4',
    coverage: 'cover-1',
    blitz: 'lb-blitz',
    description: 'Send both OLBs. High risk, high reward.',
    rushers: 5,
    strongAgainst: ['slow-developing', 'deep-drops'],
    weakAgainst: ['quick-throws', 'hot-routes'],
    difficulty: 'hard',
    positions: [
      // D-Line (3)
      { offsetX: POS.DE_L.x, offsetY: POS.DE_L.y, role: 'defensive-end', assignment: 'rush' },
      { offsetX: POS.NT.x, offsetY: POS.NT.y, role: 'nose-tackle', assignment: 'rush' },
      { offsetX: POS.DE_R.x, offsetY: POS.DE_R.y, role: 'defensive-end', assignment: 'rush' },
      // Linebackers (4) - OLBs blitz
      { offsetX: POS.OLB_L.x, offsetY: POS.OLB_L.y - 20, role: 'outside-linebacker', assignment: 'rush' },
      { offsetX: POS.ILB_L.x, offsetY: POS.ILB_L.y, role: 'inside-linebacker', assignment: 'zone-hook', zoneArea: ZONES.HOOK_L },
      { offsetX: POS.ILB_R.x, offsetY: POS.ILB_R.y, role: 'inside-linebacker', assignment: 'zone-hook', zoneArea: ZONES.HOOK_R },
      { offsetX: POS.OLB_R.x, offsetY: POS.OLB_R.y - 20, role: 'outside-linebacker', assignment: 'rush' },
      // DBs (4)
      { offsetX: POS.CB_L.x, offsetY: POS.CB_L.y, role: 'cornerback', assignment: 'man-coverage', manTarget: 0 },
      { offsetX: POS.CB_R.x, offsetY: POS.CB_R.y, role: 'cornerback', assignment: 'man-coverage', manTarget: 1 },
      { offsetX: 0, offsetY: -200, role: 'free-safety', assignment: 'zone-deep-third', zoneArea: ZONES.DEEP_THIRD_M },
      { offsetX: POS.SS.x, offsetY: POS.SS.y, role: 'strong-safety', assignment: 'man-coverage', manTarget: 2 },
    ],
  },
  {
    id: 'corner-blitz',
    name: 'Corner Blitz',
    displayName: 'CB BLITZ',
    formation: 'nickel',
    coverage: 'cover-1',
    blitz: 'corner-blitz',
    description: 'Disguised corner blitz. Catches offense off guard.',
    rushers: 5,
    strongAgainst: ['bootlegs', 'rollouts'],
    weakAgainst: ['slants-to-blitz-side', 'quick-screens'],
    difficulty: 'hard',
    positions: [
      // D-Line (4)
      { offsetX: POS.DE_L.x, offsetY: POS.DE_L.y, role: 'defensive-end', assignment: 'rush' },
      { offsetX: POS.DT_L.x, offsetY: POS.DT_L.y, role: 'defensive-tackle', assignment: 'rush' },
      { offsetX: POS.DT_R.x, offsetY: POS.DT_R.y, role: 'defensive-tackle', assignment: 'rush' },
      { offsetX: POS.DE_R.x, offsetY: POS.DE_R.y, role: 'defensive-end', assignment: 'contain' },
      // Linebackers (2)
      { offsetX: POS.ILB_L.x, offsetY: POS.ILB_L.y, role: 'inside-linebacker', assignment: 'zone-flat', zoneArea: ZONES.FLAT_L },
      { offsetX: POS.ILB_R.x, offsetY: POS.ILB_R.y, role: 'inside-linebacker', assignment: 'zone-hook', zoneArea: ZONES.HOOK_R },
      // DBs (5) - one CB blitzes
      { offsetX: POS.CB_L.x + 30, offsetY: POS.CB_L.y + 40, role: 'cornerback', assignment: 'rush' },
      { offsetX: POS.SLOT_L.x, offsetY: POS.SLOT_L.y, role: 'cornerback', assignment: 'man-coverage', manTarget: 0 },
      { offsetX: POS.SLOT_R.x, offsetY: POS.SLOT_R.y, role: 'cornerback', assignment: 'man-coverage', manTarget: 2 },
      { offsetX: POS.CB_R.x, offsetY: POS.CB_R.y, role: 'cornerback', assignment: 'man-coverage', manTarget: 1 },
      { offsetX: 0, offsetY: -220, role: 'free-safety', assignment: 'zone-deep-third', zoneArea: ZONES.DEEP_THIRD_M },
    ],
  },
  {
    id: 'all-out-blitz',
    name: 'All Out Blitz',
    displayName: 'ALL OUT',
    formation: '3-4',
    coverage: 'cover-0',
    blitz: 'all-out',
    description: 'Everyone rushes. Zero coverage. Sack or touchdown.',
    rushers: 7,
    strongAgainst: ['long-developing', 'confused-qb'],
    weakAgainst: ['everything-else', 'quick-throws'],
    difficulty: 'hard',
    positions: [
      // D-Line (3)
      { offsetX: POS.DE_L.x, offsetY: POS.DE_L.y, role: 'defensive-end', assignment: 'rush' },
      { offsetX: POS.NT.x, offsetY: POS.NT.y, role: 'nose-tackle', assignment: 'rush' },
      { offsetX: POS.DE_R.x, offsetY: POS.DE_R.y, role: 'defensive-end', assignment: 'rush' },
      // Linebackers (4) - all rush
      { offsetX: POS.OLB_L.x, offsetY: POS.OLB_L.y - 25, role: 'outside-linebacker', assignment: 'rush' },
      { offsetX: POS.ILB_L.x, offsetY: POS.ILB_L.y - 20, role: 'inside-linebacker', assignment: 'rush' },
      { offsetX: POS.ILB_R.x, offsetY: POS.ILB_R.y - 20, role: 'inside-linebacker', assignment: 'rush' },
      { offsetX: POS.OLB_R.x, offsetY: POS.OLB_R.y - 25, role: 'outside-linebacker', assignment: 'rush' },
      // DBs (4) - pure man, no help
      { offsetX: POS.CB_L.x, offsetY: POS.CB_L.y, role: 'cornerback', assignment: 'man-coverage', manTarget: 0 },
      { offsetX: POS.CB_R.x, offsetY: POS.CB_R.y, role: 'cornerback', assignment: 'man-coverage', manTarget: 1 },
      { offsetX: POS.SLOT_L.x, offsetY: POS.SLOT_L.y, role: 'free-safety', assignment: 'man-coverage', manTarget: 2 },
      { offsetX: POS.SLOT_R.x, offsetY: POS.SLOT_R.y, role: 'strong-safety', assignment: 'man-coverage', manTarget: 3 },
    ],
  },
  
  // ============================================================================
  // GOAL LINE
  // ============================================================================
  {
    id: 'goal-line',
    name: 'Goal Line',
    displayName: 'GOAL LINE',
    formation: 'goal-line',
    coverage: 'cover-0',
    blitz: 'none',
    description: 'Stacked box. Stop the run at all costs.',
    rushers: 6,
    strongAgainst: ['goal-line-run', 'qb-sneak'],
    weakAgainst: ['fade-routes', 'play-action'],
    difficulty: 'medium',
    positions: [
      // D-Line (5)
      { offsetX: POS.DE_L.x - 10, offsetY: POS.DE_L.y, role: 'defensive-end', assignment: 'rush' },
      { offsetX: POS.DT_L.x - 10, offsetY: POS.DT_L.y, role: 'defensive-tackle', assignment: 'rush' },
      { offsetX: POS.NT.x, offsetY: POS.NT.y, role: 'nose-tackle', assignment: 'rush' },
      { offsetX: POS.DT_R.x + 10, offsetY: POS.DT_R.y, role: 'defensive-tackle', assignment: 'rush' },
      { offsetX: POS.DE_R.x + 10, offsetY: POS.DE_R.y, role: 'defensive-end', assignment: 'rush' },
      // Linebackers (3)
      { offsetX: POS.ILB_L.x - 15, offsetY: -35, role: 'inside-linebacker', assignment: 'rush' },
      { offsetX: POS.MLB.x, offsetY: -40, role: 'middle-linebacker', assignment: 'spy' },
      { offsetX: POS.ILB_R.x + 15, offsetY: -35, role: 'inside-linebacker', assignment: 'rush' },
      // DBs (3)
      { offsetX: POS.CB_L.x + 20, offsetY: -60, role: 'cornerback', assignment: 'man-coverage', manTarget: 0 },
      { offsetX: POS.CB_R.x - 20, offsetY: -60, role: 'cornerback', assignment: 'man-coverage', manTarget: 1 },
      { offsetX: 0, offsetY: -100, role: 'free-safety', assignment: 'man-coverage', manTarget: 2 },
    ],
  },
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a defensive play by ID
 */
export function getDefensivePlay(id: string): DefensivePlay | undefined {
  return DEFENSE_PLAYBOOK.find(p => p.id === id)
}

/**
 * Get plays for a specific formation
 */
export function getPlaysByFormation(formation: DefensiveFormation): DefensivePlay[] {
  return DEFENSE_PLAYBOOK.filter(p => p.formation === formation)
}

/**
 * Get plays with blitz packages
 */
export function getBlitzPlays(): DefensivePlay[] {
  return DEFENSE_PLAYBOOK.filter(p => p.blitz !== 'none')
}

/**
 * Get safe zone coverage plays
 */
export function getZonePlays(): DefensivePlay[] {
  return DEFENSE_PLAYBOOK.filter(p => 
    p.coverage !== 'cover-0' && p.coverage !== 'cover-1' && p.blitz === 'none'
  )
}

/**
 * Get recommended plays against an offensive concept
 */
export function getRecommendedPlays(offensiveConcept: string): DefensivePlay[] {
  return DEFENSE_PLAYBOOK.filter(p => 
    p.strongAgainst.some(s => s.includes(offensiveConcept.toLowerCase()))
  )
}

/**
 * Calculate how many rushers a play sends
 */
export function getRusherCount(play: DefensivePlay): number {
  return play.positions.filter(p => 
    p.assignment === 'rush' || p.assignment === 'contain'
  ).length
}

/**
 * Check if position is in coverage
 */
export function isInCoverage(assignment: DefenderAssignment): boolean {
  return assignment.startsWith('man-') || assignment.startsWith('zone-')
}

/**
 * Get zone name for display
 */
export function getZoneDisplayName(assignment: DefenderAssignment): string {
  switch (assignment) {
    case 'zone-flat': return 'Flat'
    case 'zone-hook': return 'Hook'
    case 'zone-deep-third': return 'Deep 1/3'
    case 'zone-deep-half': return 'Deep 1/2'
    case 'zone-deep-quarter': return 'Deep 1/4'
    default: return ''
  }
}
