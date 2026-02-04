/**
 * Prop Picks Data - 25 Big Game Questions
 * 
 * Categories:
 * - game: Game & Score Props
 * - players: Player Performance Props
 * - outcome: Outcome & Honors Props
 * - fun: Fun & Novelty Props
 * - tiebreaker: Final score prediction
 * 
 * DESIGN NOTE: No emojis - all icons handled via Lucide in UI components
 */

export type PickType = 'boolean' | 'choice' | 'over_under' | 'numeric'

export type PickCategory = 'game' | 'players' | 'outcome' | 'fun' | 'tiebreaker'

// Icon identifiers for Lucide icons (rendered in UI)
export type CategoryIcon = 'football' | 'star' | 'trophy' | 'party' | 'target'
export type OptionIcon = 'check' | 'x' | 'arrow-up' | 'arrow-down' | 'circle'

export interface PickOption {
  id: string
  label: string
  icon?: OptionIcon // Optional icon hint for UI
}

export interface PropPick {
  id: string
  category: PickCategory
  question: string
  shortQuestion?: string // For card display
  type: PickType
  options: PickOption[]
  value?: number // For over/under questions
  unit?: string // "yards", "points", etc.
  points?: number // Points for correct answer
}

export interface PickAnswer {
  pickId: string
  optionId: string
  value?: number // For numeric answers
  answeredAt: number // timestamp
}

// Category metadata for UI - icons rendered via Lucide in components
export const PICK_CATEGORIES: Record<PickCategory, { 
  name: string
  icon: CategoryIcon
  description: string
  color: string
}> = {
  game: {
    name: 'Game Props',
    icon: 'football',
    description: 'Score, timing & game flow',
    color: '#69BE28',
  },
  players: {
    name: 'Player Props',
    icon: 'star',
    description: 'Individual performances',
    color: '#00B4D8',
  },
  outcome: {
    name: 'Outcome Props',
    icon: 'trophy',
    description: 'Winners & honors',
    color: '#FFD700',
  },
  fun: {
    name: 'Fun Props',
    icon: 'party',
    description: 'Novelty & entertainment',
    color: '#FF6B6B',
  },
  tiebreaker: {
    name: 'Tiebreaker',
    icon: 'target',
    description: 'Predict the final score',
    color: '#A855F7',
  },
}

// All 25 Prop Picks - NO EMOJIS
export const PROP_PICKS: PropPick[] = [
  // ============ GAME PROPS (6) ============
  {
    id: 'first-score-type',
    category: 'game',
    question: 'What will be the first score of the game?',
    shortQuestion: 'First Score Type',
    type: 'choice',
    options: [
      { id: 'touchdown', label: 'Touchdown' },
      { id: 'field-goal', label: 'Field Goal' },
    ],
    points: 5,
  },
  {
    id: 'total-odd-even',
    category: 'game',
    question: 'Will the total game points be odd or even?',
    shortQuestion: 'Total Points Odd/Even',
    type: 'choice',
    options: [
      { id: 'odd', label: 'Odd' },
      { id: 'even', label: 'Even' },
    ],
    points: 5,
  },
  {
    id: 'first-half-winner',
    category: 'game',
    question: 'Who will be winning at halftime?',
    shortQuestion: 'First Half Leader',
    type: 'choice',
    options: [
      { id: 'seattle', label: 'Seattle' },
      { id: 'patriots', label: 'Patriots' },
      { id: 'tie', label: 'Tie' },
    ],
    points: 10,
  },
  {
    id: 'first-td-team',
    category: 'game',
    question: 'Which team will score the first touchdown?',
    shortQuestion: 'First TD Team',
    type: 'choice',
    options: [
      { id: 'seattle', label: 'Seattle' },
      { id: 'patriots', label: 'Patriots' },
    ],
    points: 10,
  },
  {
    id: 'both-17-plus',
    category: 'game',
    question: 'Will both teams score 17+ points?',
    shortQuestion: 'Both Teams 17+',
    type: 'boolean',
    options: [
      { id: 'yes', label: 'Yes', icon: 'check' },
      { id: 'no', label: 'No', icon: 'x' },
    ],
    points: 5,
  },
  {
    id: 'total-points-band',
    category: 'game',
    question: 'What will be the total points range?',
    shortQuestion: 'Total Points Range',
    type: 'choice',
    options: [
      { id: 'under-40', label: 'Under 40', icon: 'arrow-down' },
      { id: '40-50', label: '40-50' },
      { id: 'over-50', label: 'Over 50', icon: 'arrow-up' },
    ],
    points: 10,
  },

  // ============ PLAYER PROPS (8) ============
  {
    id: 'walker-td',
    category: 'players',
    question: 'Will Kenneth Walker III score a touchdown?',
    shortQuestion: 'Walker TD',
    type: 'boolean',
    options: [
      { id: 'yes', label: 'Yes', icon: 'check' },
      { id: 'no', label: 'No', icon: 'x' },
    ],
    points: 5,
  },
  {
    id: 'stevenson-td',
    category: 'players',
    question: 'Will Rhamondre Stevenson score a touchdown?',
    shortQuestion: 'Stevenson TD',
    type: 'boolean',
    options: [
      { id: 'yes', label: 'Yes', icon: 'check' },
      { id: 'no', label: 'No', icon: 'x' },
    ],
    points: 5,
  },
  {
    id: 'first-td-scorer',
    category: 'players',
    question: 'Who will score the first touchdown of the game?',
    shortQuestion: 'First TD Scorer',
    type: 'choice',
    options: [
      { id: 'walker', label: 'K. Walker III' },
      { id: 'smith-njigba', label: 'J. Smith-Njigba' },
      { id: 'metcalf', label: 'DK Metcalf' },
      { id: 'other', label: 'Other Player' },
    ],
    points: 15,
  },
  {
    id: 'walker-rushing-yards',
    category: 'players',
    question: 'Kenneth Walker III rushing yards over/under 75.5?',
    shortQuestion: 'Walker Rushing Yards',
    type: 'over_under',
    options: [
      { id: 'over', label: 'Over 75.5', icon: 'arrow-up' },
      { id: 'under', label: 'Under 75.5', icon: 'arrow-down' },
    ],
    value: 75.5,
    unit: 'yards',
    points: 5,
  },
  {
    id: 'jsn-receptions',
    category: 'players',
    question: 'Jaxon Smith-Njigba receptions over/under 5.5?',
    shortQuestion: 'JSN Receptions',
    type: 'over_under',
    options: [
      { id: 'over', label: 'Over 5.5', icon: 'arrow-up' },
      { id: 'under', label: 'Under 5.5', icon: 'arrow-down' },
    ],
    value: 5.5,
    unit: 'receptions',
    points: 5,
  },
  {
    id: 'metcalf-receiving-yards',
    category: 'players',
    question: 'DK Metcalf receiving yards over/under 70.5?',
    shortQuestion: 'Metcalf Receiving Yards',
    type: 'over_under',
    options: [
      { id: 'over', label: 'Over 70.5', icon: 'arrow-up' },
      { id: 'under', label: 'Under 70.5', icon: 'arrow-down' },
    ],
    value: 70.5,
    unit: 'yards',
    points: 5,
  },
  {
    id: 'qb-passing-yards',
    category: 'players',
    question: 'Geno Smith passing yards over/under 265.5?',
    shortQuestion: 'Geno Passing Yards',
    type: 'over_under',
    options: [
      { id: 'over', label: 'Over 265.5', icon: 'arrow-up' },
      { id: 'under', label: 'Under 265.5', icon: 'arrow-down' },
    ],
    value: 265.5,
    unit: 'yards',
    points: 5,
  },
  {
    id: 'qb-rushing-yards',
    category: 'players',
    question: 'Geno Smith rushing yards over/under 15.5?',
    shortQuestion: 'Geno Rushing Yards',
    type: 'over_under',
    options: [
      { id: 'over', label: 'Over 15.5', icon: 'arrow-up' },
      { id: 'under', label: 'Under 15.5', icon: 'arrow-down' },
    ],
    value: 15.5,
    unit: 'yards',
    points: 5,
  },

  // ============ OUTCOME PROPS (3) ============
  {
    id: 'mvp-winner',
    category: 'outcome',
    question: 'Who will win Super Bowl MVP?',
    shortQuestion: 'Super Bowl MVP',
    type: 'choice',
    options: [
      { id: 'seattle-qb', label: 'Seattle QB' },
      { id: 'seattle-other', label: 'Seattle Other' },
      { id: 'patriots-player', label: 'Patriots Player' },
    ],
    points: 15,
  },
  {
    id: 'cover-spread',
    category: 'outcome',
    question: 'Will the winning team cover the spread (-3)?',
    shortQuestion: 'Cover the Spread',
    type: 'boolean',
    options: [
      { id: 'yes', label: 'Yes (Win by 4+)', icon: 'check' },
      { id: 'no', label: 'No (Win by 1-3)', icon: 'x' },
    ],
    points: 5,
  },
  {
    id: 'overtime',
    category: 'outcome',
    question: 'Will the game go to overtime?',
    shortQuestion: 'Overtime',
    type: 'boolean',
    options: [
      { id: 'yes', label: 'Yes', icon: 'check' },
      { id: 'no', label: 'No', icon: 'x' },
    ],
    points: 10,
  },

  // ============ FUN PROPS (7) ============
  {
    id: 'coin-toss',
    category: 'fun',
    question: 'What will be the coin toss result?',
    shortQuestion: 'Coin Toss',
    type: 'choice',
    options: [
      { id: 'heads', label: 'Heads' },
      { id: 'tails', label: 'Tails' },
    ],
    points: 5,
  },
  {
    id: 'anthem-length',
    category: 'fun',
    question: 'National anthem length over/under 2 minutes?',
    shortQuestion: 'Anthem Length',
    type: 'over_under',
    options: [
      { id: 'over', label: 'Over 2:00', icon: 'arrow-up' },
      { id: 'under', label: 'Under 2:00', icon: 'arrow-down' },
    ],
    value: 2,
    unit: 'minutes',
    points: 5,
  },
  {
    id: 'anthem-cry',
    category: 'fun',
    question: 'Will a player or coach cry during the anthem?',
    shortQuestion: 'Anthem Tears',
    type: 'boolean',
    options: [
      { id: 'yes', label: 'Yes', icon: 'check' },
      { id: 'no', label: 'No', icon: 'x' },
    ],
    points: 5,
  },
  {
    id: 'gatorade-color',
    category: 'fun',
    question: 'What color Gatorade will be dumped on the winning coach?',
    shortQuestion: 'Gatorade Color',
    type: 'choice',
    options: [
      { id: 'orange', label: 'Orange' },
      { id: 'blue', label: 'Blue' },
      { id: 'green', label: 'Lime/Green' },
      { id: 'clear', label: 'Clear/Water' },
    ],
    points: 10,
  },
  {
    id: 'gatorade-dumped',
    category: 'fun',
    question: 'Will Gatorade be dumped on the winning coach?',
    shortQuestion: 'Gatorade Dump',
    type: 'boolean',
    options: [
      { id: 'yes', label: 'Yes', icon: 'check' },
      { id: 'no', label: 'No', icon: 'x' },
    ],
    points: 5,
  },
  {
    id: 'longest-play',
    category: 'fun',
    question: 'Longest play of the game over/under 45.5 yards?',
    shortQuestion: 'Longest Play',
    type: 'over_under',
    options: [
      { id: 'over', label: 'Over 45.5', icon: 'arrow-up' },
      { id: 'under', label: 'Under 45.5', icon: 'arrow-down' },
    ],
    value: 45.5,
    unit: 'yards',
    points: 5,
  },
  {
    id: 'safety',
    category: 'fun',
    question: 'Will there be a safety in the game?',
    shortQuestion: 'Safety Scored',
    type: 'boolean',
    options: [
      { id: 'yes', label: 'Yes', icon: 'check' },
      { id: 'no', label: 'No', icon: 'x' },
    ],
    points: 10,
  },

  // ============ TIEBREAKER (1) ============
  {
    id: 'final-score',
    category: 'tiebreaker',
    question: 'Predict the final score (Seattle vs Patriots)',
    shortQuestion: 'Final Score',
    type: 'numeric',
    options: [], // No preset options for numeric
    points: 25,
  },
]

// Helper functions
export function getPicksByCategory(category: PickCategory): PropPick[] {
  return PROP_PICKS.filter(pick => pick.category === category)
}

export function getPickById(id: string): PropPick | undefined {
  return PROP_PICKS.find(pick => pick.id === id)
}

export function getCategoryProgress(
  answers: PickAnswer[], 
  category: PickCategory
): { answered: number; total: number } {
  const categoryPicks = getPicksByCategory(category)
  const answeredPicks = categoryPicks.filter(pick => 
    answers.some(a => a.pickId === pick.id)
  )
  return {
    answered: answeredPicks.length,
    total: categoryPicks.length,
  }
}

export function getTotalProgress(answers: PickAnswer[]): { answered: number; total: number } {
  return {
    answered: answers.length,
    total: PROP_PICKS.length,
  }
}

export function isAllPicksComplete(answers: PickAnswer[]): boolean {
  return answers.length === PROP_PICKS.length
}

// Category order for navigation
export const CATEGORY_ORDER: PickCategory[] = [
  'game',
  'players',
  'outcome',
  'fun',
  'tiebreaker',
]

export function getNextCategory(current: PickCategory): PickCategory | null {
  const currentIndex = CATEGORY_ORDER.indexOf(current)
  if (currentIndex === -1 || currentIndex >= CATEGORY_ORDER.length - 1) {
    return null
  }
  return CATEGORY_ORDER[currentIndex + 1]
}

export function getPrevCategory(current: PickCategory): PickCategory | null {
  const currentIndex = CATEGORY_ORDER.indexOf(current)
  if (currentIndex <= 0) {
    return null
  }
  return CATEGORY_ORDER[currentIndex - 1]
}
