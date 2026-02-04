/**
 * Live Questions Data - Real-time game questions per quarter
 * 
 * Each quarter has 5 questions that drop during gameplay.
 * Users have 60 seconds to answer each question.
 */

export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'OT'

export type LiveQuestionStatus = 
  | 'pending'      // Not yet dropped
  | 'active'       // Currently accepting answers
  | 'locked'       // Time expired, waiting for resolution
  | 'resolved'     // Correct answer revealed

export interface LiveQuestionOption {
  id: string
  label: string
  emoji?: string
}

export interface LiveQuestion {
  id: string
  quarter: Quarter
  questionNumber: number  // 1-5 within quarter
  question: string
  shortQuestion?: string
  options: LiveQuestionOption[]
  correctOptionId?: string  // Set after resolution
  points: number
  timeLimit: number  // seconds (default 60)
}

export interface LiveAnswer {
  questionId: string
  optionId: string
  answeredAt: number  // timestamp
  correct?: boolean   // Set after resolution
}

// Quarter metadata for UI
export const QUARTER_INFO: Record<Quarter, {
  name: string
  shortName: string
  description: string
  color: string
}> = {
  Q1: {
    name: 'First Quarter',
    shortName: 'Q1',
    description: 'Opening drives',
    color: '#69BE28',
  },
  Q2: {
    name: 'Second Quarter',
    shortName: 'Q2',
    description: 'Building momentum',
    color: '#00B4D8',
  },
  Q3: {
    name: 'Third Quarter',
    shortName: 'Q3',
    description: 'Halftime adjustments',
    color: '#FFD700',
  },
  Q4: {
    name: 'Fourth Quarter',
    shortName: 'Q4',
    description: 'Crunch time',
    color: '#FF6B6B',
  },
  OT: {
    name: 'Overtime',
    shortName: 'OT',
    description: 'Sudden victory',
    color: '#A855F7',
  },
}

export const QUARTER_ORDER: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4', 'OT']

// Sample live questions - 5 per quarter (20 regular + 5 OT)
export const LIVE_QUESTIONS: LiveQuestion[] = [
  // ============ Q1 - Opening Quarter ============
  {
    id: 'q1-1',
    quarter: 'Q1',
    questionNumber: 1,
    question: 'Will there be a touchdown in the first 5 minutes?',
    shortQuestion: 'TD in first 5 min?',
    options: [
      { id: 'yes', label: 'Yes', emoji: '🏈' },
      { id: 'no', label: 'No', emoji: '❌' },
    ],
    points: 10,
    timeLimit: 60,
  },
  {
    id: 'q1-2',
    quarter: 'Q1',
    questionNumber: 2,
    question: 'Will the next play be a run or a pass?',
    shortQuestion: 'Run or Pass?',
    options: [
      { id: 'run', label: 'Run', emoji: '🏃' },
      { id: 'pass', label: 'Pass', emoji: '🎯' },
    ],
    points: 5,
    timeLimit: 30,
  },
  {
    id: 'q1-3',
    quarter: 'Q1',
    questionNumber: 3,
    question: 'Will there be a turnover before the end of Q1?',
    shortQuestion: 'Turnover in Q1?',
    options: [
      { id: 'yes', label: 'Yes', emoji: '🔄' },
      { id: 'no', label: 'No', emoji: '❌' },
    ],
    points: 10,
    timeLimit: 60,
  },
  {
    id: 'q1-4',
    quarter: 'Q1',
    questionNumber: 4,
    question: 'Will the next drive result in points?',
    shortQuestion: 'Points on next drive?',
    options: [
      { id: 'yes', label: 'Yes', emoji: '✅' },
      { id: 'no', label: 'No', emoji: '❌' },
    ],
    points: 10,
    timeLimit: 60,
  },
  {
    id: 'q1-5',
    quarter: 'Q1',
    questionNumber: 5,
    question: 'Which team will have more total yards at the end of Q1?',
    shortQuestion: 'More yards in Q1?',
    options: [
      { id: 'seattle', label: 'Seattle', emoji: '🦅' },
      { id: 'patriots', label: 'Patriots', emoji: '🔵' },
    ],
    points: 15,
    timeLimit: 60,
  },

  // ============ Q2 - Second Quarter ============
  {
    id: 'q2-1',
    quarter: 'Q2',
    questionNumber: 1,
    question: 'Will there be a scoring play in the next 3 minutes?',
    shortQuestion: 'Score in 3 min?',
    options: [
      { id: 'yes', label: 'Yes', emoji: '🎯' },
      { id: 'no', label: 'No', emoji: '❌' },
    ],
    points: 10,
    timeLimit: 60,
  },
  {
    id: 'q2-2',
    quarter: 'Q2',
    questionNumber: 2,
    question: 'Will there be a sack on the next defensive series?',
    shortQuestion: 'Sack coming?',
    options: [
      { id: 'yes', label: 'Yes', emoji: '💥' },
      { id: 'no', label: 'No', emoji: '❌' },
    ],
    points: 10,
    timeLimit: 45,
  },
  {
    id: 'q2-3',
    quarter: 'Q2',
    questionNumber: 3,
    question: 'Will there be a penalty in the next 2 minutes?',
    shortQuestion: 'Penalty coming?',
    options: [
      { id: 'yes', label: 'Yes', emoji: '🚩' },
      { id: 'no', label: 'No', emoji: '❌' },
    ],
    points: 5,
    timeLimit: 60,
  },
  {
    id: 'q2-4',
    quarter: 'Q2',
    questionNumber: 4,
    question: 'Will the team with the ball score before halftime?',
    shortQuestion: 'Score before half?',
    options: [
      { id: 'yes', label: 'Yes', emoji: '✅' },
      { id: 'no', label: 'No', emoji: '❌' },
    ],
    points: 10,
    timeLimit: 60,
  },
  {
    id: 'q2-5',
    quarter: 'Q2',
    questionNumber: 5,
    question: 'Which team will be leading at halftime?',
    shortQuestion: 'Halftime leader?',
    options: [
      { id: 'seattle', label: 'Seattle', emoji: '🦅' },
      { id: 'patriots', label: 'Patriots', emoji: '🔵' },
      { id: 'tie', label: 'Tied', emoji: '🤝' },
    ],
    points: 15,
    timeLimit: 60,
  },

  // ============ Q3 - Third Quarter ============
  {
    id: 'q3-1',
    quarter: 'Q3',
    questionNumber: 1,
    question: 'Who will get the ball first in the second half?',
    shortQuestion: 'Second half kickoff?',
    options: [
      { id: 'seattle', label: 'Seattle', emoji: '🦅' },
      { id: 'patriots', label: 'Patriots', emoji: '🔵' },
    ],
    points: 5,
    timeLimit: 60,
  },
  {
    id: 'q3-2',
    quarter: 'Q3',
    questionNumber: 2,
    question: 'Will the opening drive of Q3 result in points?',
    shortQuestion: 'Q3 opening points?',
    options: [
      { id: 'yes', label: 'Yes', emoji: '✅' },
      { id: 'no', label: 'No', emoji: '❌' },
    ],
    points: 10,
    timeLimit: 60,
  },
  {
    id: 'q3-3',
    quarter: 'Q3',
    questionNumber: 3,
    question: 'Will there be a big play (20+ yards) in Q3?',
    shortQuestion: 'Big play in Q3?',
    options: [
      { id: 'yes', label: 'Yes', emoji: '🚀' },
      { id: 'no', label: 'No', emoji: '❌' },
    ],
    points: 10,
    timeLimit: 60,
  },
  {
    id: 'q3-4',
    quarter: 'Q3',
    questionNumber: 4,
    question: 'Will there be a challenge or review in Q3?',
    shortQuestion: 'Review in Q3?',
    options: [
      { id: 'yes', label: 'Yes', emoji: '📺' },
      { id: 'no', label: 'No', emoji: '❌' },
    ],
    points: 10,
    timeLimit: 60,
  },
  {
    id: 'q3-5',
    quarter: 'Q3',
    questionNumber: 5,
    question: 'Which team will score more points in Q3?',
    shortQuestion: 'Q3 scoring leader?',
    options: [
      { id: 'seattle', label: 'Seattle', emoji: '🦅' },
      { id: 'patriots', label: 'Patriots', emoji: '🔵' },
      { id: 'tie', label: 'Same', emoji: '🤝' },
    ],
    points: 15,
    timeLimit: 60,
  },

  // ============ Q4 - Fourth Quarter ============
  {
    id: 'q4-1',
    quarter: 'Q4',
    questionNumber: 1,
    question: 'Will the leading team extend their lead in Q4?',
    shortQuestion: 'Leader extends?',
    options: [
      { id: 'yes', label: 'Yes', emoji: '📈' },
      { id: 'no', label: 'No', emoji: '📉' },
    ],
    points: 10,
    timeLimit: 60,
  },
  {
    id: 'q4-2',
    quarter: 'Q4',
    questionNumber: 2,
    question: 'Will there be a turnover in the final 10 minutes?',
    shortQuestion: 'Late turnover?',
    options: [
      { id: 'yes', label: 'Yes', emoji: '🔄' },
      { id: 'no', label: 'No', emoji: '❌' },
    ],
    points: 10,
    timeLimit: 60,
  },
  {
    id: 'q4-3',
    quarter: 'Q4',
    questionNumber: 3,
    question: 'Will the trailing team score a touchdown?',
    shortQuestion: 'Comeback TD?',
    options: [
      { id: 'yes', label: 'Yes', emoji: '🏈' },
      { id: 'no', label: 'No', emoji: '❌' },
    ],
    points: 10,
    timeLimit: 60,
  },
  {
    id: 'q4-4',
    quarter: 'Q4',
    questionNumber: 4,
    question: 'Will the game be decided by one score (8 pts or less)?',
    shortQuestion: 'Close game?',
    options: [
      { id: 'yes', label: 'Yes', emoji: '😰' },
      { id: 'no', label: 'No', emoji: '💪' },
    ],
    points: 15,
    timeLimit: 60,
  },
  {
    id: 'q4-5',
    quarter: 'Q4',
    questionNumber: 5,
    question: 'Will the final 2 minutes include a timeout?',
    shortQuestion: 'Late timeout?',
    options: [
      { id: 'yes', label: 'Yes', emoji: '⏱️' },
      { id: 'no', label: 'No', emoji: '❌' },
    ],
    points: 5,
    timeLimit: 60,
  },

  // ============ OT - Overtime ============
  {
    id: 'ot-1',
    quarter: 'OT',
    questionNumber: 1,
    question: 'Who will win the overtime coin toss?',
    shortQuestion: 'OT coin toss?',
    options: [
      { id: 'seattle', label: 'Seattle', emoji: '🦅' },
      { id: 'patriots', label: 'Patriots', emoji: '🔵' },
    ],
    points: 5,
    timeLimit: 30,
  },
  {
    id: 'ot-2',
    quarter: 'OT',
    questionNumber: 2,
    question: 'Will the coin toss winner choose to receive?',
    shortQuestion: 'Winner receives?',
    options: [
      { id: 'yes', label: 'Yes', emoji: '🏈' },
      { id: 'no', label: 'No', emoji: '🛡️' },
    ],
    points: 5,
    timeLimit: 30,
  },
  {
    id: 'ot-3',
    quarter: 'OT',
    questionNumber: 3,
    question: 'Will the first possession result in a touchdown?',
    shortQuestion: 'First OT TD?',
    options: [
      { id: 'yes', label: 'Yes', emoji: '🏈' },
      { id: 'no', label: 'No', emoji: '❌' },
    ],
    points: 15,
    timeLimit: 60,
  },
  {
    id: 'ot-4',
    quarter: 'OT',
    questionNumber: 4,
    question: 'How will the game end?',
    shortQuestion: 'Game-ender?',
    options: [
      { id: 'td', label: 'Touchdown', emoji: '🏈' },
      { id: 'fg', label: 'Field Goal', emoji: '🥅' },
      { id: 'other', label: 'Defensive Score', emoji: '🛡️' },
    ],
    points: 15,
    timeLimit: 60,
  },
  {
    id: 'ot-5',
    quarter: 'OT',
    questionNumber: 5,
    question: 'Will overtime last more than one possession per team?',
    shortQuestion: 'Extended OT?',
    options: [
      { id: 'yes', label: 'Yes', emoji: '⏰' },
      { id: 'no', label: 'No', emoji: '⚡' },
    ],
    points: 10,
    timeLimit: 60,
  },
]

// Helper functions
export function getQuestionsByQuarter(quarter: Quarter): LiveQuestion[] {
  return LIVE_QUESTIONS.filter(q => q.quarter === quarter)
}

export function getQuestionById(id: string): LiveQuestion | undefined {
  return LIVE_QUESTIONS.find(q => q.id === id)
}

export function getQuarterProgress(
  answers: LiveAnswer[],
  quarter: Quarter
): { answered: number; correct: number; total: number } {
  const quarterQuestions = getQuestionsByQuarter(quarter)
  const quarterAnswers = answers.filter(a => 
    quarterQuestions.some(q => q.id === a.questionId)
  )
  const correctAnswers = quarterAnswers.filter(a => a.correct === true)
  
  return {
    answered: quarterAnswers.length,
    correct: correctAnswers.length,
    total: quarterQuestions.length,
  }
}

export function getTotalLiveScore(answers: LiveAnswer[]): number {
  return answers
    .filter(a => a.correct === true)
    .reduce((score, answer) => {
      const question = getQuestionById(answer.questionId)
      return score + (question?.points || 0)
    }, 0)
}
