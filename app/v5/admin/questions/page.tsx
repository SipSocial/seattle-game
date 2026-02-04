'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Live Questions Management Page
 * 
 * Features:
 * - Question list by quarter
 * - Add/edit questions
 * - Set correct answers
 * - Push question manually
 */

type QuestionType = 'boolean' | 'multiple_choice' | 'numeric'
type QuestionStatus = 'draft' | 'scheduled' | 'pushed' | 'closed' | 'resolved'

interface Question {
  id: string
  quarter: number
  questionText: string
  questionType: QuestionType
  options?: string[]
  correctAnswer: string | null
  status: QuestionStatus
  pushedAt: string | null
  closesAt: string | null
  responses: number
}

// Mock data
const MOCK_QUESTIONS: Question[] = [
  {
    id: 'q1',
    quarter: 1,
    questionText: 'Will either team score in the first 5 minutes?',
    questionType: 'boolean',
    correctAnswer: null,
    status: 'scheduled',
    pushedAt: null,
    closesAt: null,
    responses: 0,
  },
  {
    id: 'q2',
    quarter: 1,
    questionText: 'First scoring play will be a...',
    questionType: 'multiple_choice',
    options: ['Touchdown', 'Field Goal', 'Safety'],
    correctAnswer: null,
    status: 'draft',
    pushedAt: null,
    closesAt: null,
    responses: 0,
  },
  {
    id: 'q3',
    quarter: 1,
    questionText: 'Total points scored in Q1?',
    questionType: 'numeric',
    correctAnswer: null,
    status: 'draft',
    pushedAt: null,
    closesAt: null,
    responses: 0,
  },
  {
    id: 'q4',
    quarter: 2,
    questionText: 'Will there be a turnover before halftime?',
    questionType: 'boolean',
    correctAnswer: 'true',
    status: 'resolved',
    pushedAt: '2026-02-09T18:15:00Z',
    closesAt: '2026-02-09T18:17:00Z',
    responses: 423,
  },
  {
    id: 'q5',
    quarter: 2,
    questionText: 'Which team will score next?',
    questionType: 'multiple_choice',
    options: ['Seattle', 'New England', 'Neither'],
    correctAnswer: 'Seattle',
    status: 'resolved',
    pushedAt: '2026-02-09T18:30:00Z',
    closesAt: '2026-02-09T18:32:00Z',
    responses: 387,
  },
  {
    id: 'q6',
    quarter: 3,
    questionText: 'Will there be a challenge in Q3?',
    questionType: 'boolean',
    correctAnswer: null,
    status: 'scheduled',
    pushedAt: null,
    closesAt: null,
    responses: 0,
  },
  {
    id: 'q7',
    quarter: 4,
    questionText: 'Final score difference (closest wins)?',
    questionType: 'numeric',
    correctAnswer: null,
    status: 'scheduled',
    pushedAt: null,
    closesAt: null,
    responses: 0,
  },
]

const statusConfig = {
  draft: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Draft' },
  scheduled: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Scheduled' },
  pushed: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Live' },
  closed: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Closed' },
  resolved: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Resolved' },
}

const typeLabels = {
  boolean: 'Yes/No',
  multiple_choice: 'Multiple Choice',
  numeric: 'Numeric',
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>(MOCK_QUESTIONS)
  const [selectedQuarter, setSelectedQuarter] = useState<number | 'all'>('all')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [showPushConfirm, setShowPushConfirm] = useState(false)
  const [pushingQuestion, setPushingQuestion] = useState<Question | null>(null)

  const filteredQuestions = selectedQuarter === 'all'
    ? questions
    : questions.filter(q => q.quarter === selectedQuarter)

  const quarterCounts = [1, 2, 3, 4].map(q => ({
    quarter: q,
    total: questions.filter(qn => qn.quarter === q).length,
    pending: questions.filter(qn => qn.quarter === q && ['draft', 'scheduled'].includes(qn.status)).length,
  }))

  const handleEdit = (question: Question | null) => {
    setEditingQuestion(question || {
      id: `q${questions.length + 1}`,
      quarter: 1,
      questionText: '',
      questionType: 'boolean',
      options: undefined,
      correctAnswer: null,
      status: 'draft',
      pushedAt: null,
      closesAt: null,
      responses: 0,
    })
    setShowEditModal(true)
  }

  const handleSave = () => {
    if (!editingQuestion) return
    
    const exists = questions.find(q => q.id === editingQuestion.id)
    if (exists) {
      setQuestions(questions.map(q => q.id === editingQuestion.id ? editingQuestion : q))
    } else {
      setQuestions([...questions, editingQuestion])
    }
    setShowEditModal(false)
    setEditingQuestion(null)
  }

  const handlePush = (question: Question) => {
    setPushingQuestion(question)
    setShowPushConfirm(true)
  }

  const confirmPush = () => {
    if (!pushingQuestion) return
    
    setQuestions(questions.map(q => 
      q.id === pushingQuestion.id 
        ? { 
            ...q, 
            status: 'pushed' as QuestionStatus,
            pushedAt: new Date().toISOString(),
            closesAt: new Date(Date.now() + 2 * 60 * 1000).toISOString(), // 2 min window
          }
        : q
    ))
    setShowPushConfirm(false)
    setPushingQuestion(null)
  }

  const handleSetAnswer = (questionId: string, answer: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { ...q, correctAnswer: answer, status: 'resolved' as QuestionStatus }
        : q
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 
            className="text-2xl lg:text-3xl font-black uppercase tracking-wider"
            style={{ 
              fontFamily: 'var(--font-oswald), sans-serif',
              color: '#69BE28',
            }}
          >
            Live Questions
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Manage in-game questions and answers
          </p>
        </div>
        <button
          onClick={() => handleEdit(null)}
          className="px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 self-start sm:self-auto"
          style={{ 
            background: 'linear-gradient(135deg, #69BE28 0%, #4A8B1A 100%)',
            color: '#002244',
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Question
        </button>
      </div>

      {/* Quarter Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {quarterCounts.map(({ quarter, total, pending }) => (
          <motion.button
            key={quarter}
            onClick={() => setSelectedQuarter(selectedQuarter === quarter ? 'all' : quarter)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`rounded-2xl p-4 text-left transition-all ${
              selectedQuarter === quarter ? 'ring-2 ring-[#69BE28]' : ''
            }`}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/40 text-sm uppercase tracking-wider">Q{quarter}</span>
              {pending > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs">
                  {pending} pending
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-oswald), sans-serif' }}>
              {total} <span className="text-white/40 text-sm font-normal">questions</span>
            </p>
          </motion.button>
        ))}
      </div>

      {/* Questions List */}
      <div 
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-sm font-medium text-white/50 uppercase tracking-wider">Quarter</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-white/50 uppercase tracking-wider">Question</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-white/50 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-white/50 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-white/50 uppercase tracking-wider">Responses</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-white/50 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuestions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-white/40">
                    No questions found
                  </td>
                </tr>
              ) : (
                filteredQuestions.map((question, index) => (
                  <motion.tr
                    key={question.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <span 
                        className="px-3 py-1 rounded-full text-sm font-bold"
                        style={{
                          background: 'rgba(105, 190, 40, 0.2)',
                          color: '#69BE28',
                        }}
                      >
                        Q{question.quarter}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-white font-medium">{question.questionText}</p>
                      {question.options && (
                        <p className="text-white/40 text-sm mt-1">
                          Options: {question.options.join(' / ')}
                        </p>
                      )}
                      {question.correctAnswer && (
                        <p className="text-green-400 text-sm mt-1">
                          Answer: {question.correctAnswer}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-white/60 text-sm">
                        {typeLabels[question.questionType]}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        statusConfig[question.status].bg
                      } ${statusConfig[question.status].text}`}>
                        {statusConfig[question.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-white/60">
                      {question.responses > 0 ? question.responses.toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Push button */}
                        {['draft', 'scheduled'].includes(question.status) && (
                          <button
                            onClick={() => handlePush(question)}
                            className="p-2 rounded-lg text-yellow-400 hover:bg-yellow-400/10 transition-all"
                            title="Push to users"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                          </button>
                        )}
                        
                        {/* Set answer button */}
                        {['pushed', 'closed'].includes(question.status) && !question.correctAnswer && (
                          <button
                            onClick={() => {
                              const answer = prompt('Enter correct answer:')
                              if (answer) handleSetAnswer(question.id, answer)
                            }}
                            className="p-2 rounded-lg text-green-400 hover:bg-green-400/10 transition-all"
                            title="Set correct answer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                        
                        {/* Edit button */}
                        <button
                          onClick={() => handleEdit(question)}
                          className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                          title="Edit question"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && editingQuestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl p-6"
              style={{
                background: 'linear-gradient(180deg, #001428 0%, #000A14 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 
                  className="text-xl font-black uppercase tracking-wider"
                  style={{ 
                    fontFamily: 'var(--font-oswald), sans-serif',
                    color: '#69BE28',
                  }}
                >
                  {questions.find(q => q.id === editingQuestion.id) ? 'Edit Question' : 'New Question'}
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Quarter */}
                <div>
                  <label className="text-white/50 text-sm uppercase tracking-wider mb-2 block">Quarter</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map(q => (
                      <button
                        key={q}
                        onClick={() => setEditingQuestion({ ...editingQuestion, quarter: q })}
                        className={`flex-1 py-2 rounded-xl font-medium transition-all ${
                          editingQuestion.quarter === q
                            ? 'bg-[#69BE28] text-[#002244]'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        Q{q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Text */}
                <div>
                  <label className="text-white/50 text-sm uppercase tracking-wider mb-2 block">Question</label>
                  <textarea
                    value={editingQuestion.questionText}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, questionText: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#69BE28]/50 resize-none"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                    placeholder="Enter your question..."
                  />
                </div>

                {/* Question Type */}
                <div>
                  <label className="text-white/50 text-sm uppercase tracking-wider mb-2 block">Type</label>
                  <select
                    value={editingQuestion.questionType}
                    onChange={(e) => setEditingQuestion({ 
                      ...editingQuestion, 
                      questionType: e.target.value as QuestionType,
                      options: e.target.value === 'multiple_choice' ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
                    })}
                    className="w-full px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#69BE28]/50"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <option value="boolean">Yes / No</option>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="numeric">Numeric</option>
                  </select>
                </div>

                {/* Options for multiple choice */}
                {editingQuestion.questionType === 'multiple_choice' && (
                  <div>
                    <label className="text-white/50 text-sm uppercase tracking-wider mb-2 block">Options (comma separated)</label>
                    <input
                      type="text"
                      value={editingQuestion.options?.join(', ') || ''}
                      onChange={(e) => setEditingQuestion({ 
                        ...editingQuestion, 
                        options: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                      })}
                      className="w-full px-4 py-3 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#69BE28]/50"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                      placeholder="Option 1, Option 2, Option 3"
                    />
                  </div>
                )}

                {/* Status */}
                <div>
                  <label className="text-white/50 text-sm uppercase tracking-wider mb-2 block">Status</label>
                  <select
                    value={editingQuestion.status}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, status: e.target.value as QuestionStatus })}
                    className="w-full px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#69BE28]/50"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all"
                  style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!editingQuestion.questionText}
                  className="flex-1 px-4 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                  style={{ 
                    background: 'linear-gradient(135deg, #69BE28 0%, #4A8B1A 100%)',
                    color: '#002244',
                  }}
                >
                  Save Question
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Push Confirmation Modal */}
      <AnimatePresence>
        {showPushConfirm && pushingQuestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowPushConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl p-6"
              style={{
                background: 'linear-gradient(180deg, #001428 0%, #000A14 100%)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-yellow-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <h2 
                  className="text-xl font-black uppercase tracking-wider mb-2"
                  style={{ 
                    fontFamily: 'var(--font-oswald), sans-serif',
                    color: '#FFD700',
                  }}
                >
                  Push Question?
                </h2>
                <p className="text-white/60 text-sm">
                  This will send a push notification to all users. The question will close in 2 minutes.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 mb-6">
                <p className="text-white font-medium">{pushingQuestion.questionText}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-white/40 text-sm">Q{pushingQuestion.quarter}</span>
                  <span className="text-white/40 text-sm">•</span>
                  <span className="text-white/40 text-sm">{typeLabels[pushingQuestion.questionType]}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPushConfirm(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all"
                  style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmPush}
                  className="flex-1 px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                  style={{ 
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    color: '#002244',
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Push Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
