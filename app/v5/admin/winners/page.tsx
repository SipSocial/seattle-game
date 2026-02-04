'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Winners Management Page
 * 
 * Features:
 * - Prize pool overview
 * - Winners list with claim status
 * - Manual winner selection (for drawing)
 * - Claim status filters
 */

// Mock data
const MOCK_PRIZES = [
  { 
    id: 'grand-prize',
    name: 'Big Game Tickets',
    description: '2 tickets to Super Bowl LX in San Francisco',
    tier: 'grand',
    quantity: 1,
    claimed: 0,
  },
  { 
    id: 'major-prize',
    name: 'Signed Jersey',
    description: 'DeMarcus Lawrence autographed Seahawks jersey',
    tier: 'major',
    quantity: 10,
    claimed: 0,
  },
  { 
    id: 'minor-prize',
    name: 'DrinkSip Bundle',
    description: '12-pack variety bundle + merch pack',
    tier: 'minor',
    quantity: 50,
    claimed: 12,
  },
]

const MOCK_WINNERS = [
  {
    id: 'w1',
    userId: 'user_42',
    email: 'winner1@example.com',
    name: 'John Smith',
    prizeId: 'minor-prize',
    prizeName: 'DrinkSip Bundle',
    status: 'claimed',
    claimedAt: '2026-02-01T14:30:00Z',
    expiresAt: '2026-02-08T23:59:59Z',
  },
  {
    id: 'w2',
    userId: 'user_89',
    email: 'winner2@example.com',
    name: 'Sarah Johnson',
    prizeId: 'minor-prize',
    prizeName: 'DrinkSip Bundle',
    status: 'pending',
    claimedAt: null,
    expiresAt: '2026-02-10T23:59:59Z',
  },
  {
    id: 'w3',
    userId: 'user_156',
    email: 'winner3@example.com',
    name: 'Mike Williams',
    prizeId: 'minor-prize',
    prizeName: 'DrinkSip Bundle',
    status: 'expired',
    claimedAt: null,
    expiresAt: '2026-01-28T23:59:59Z',
  },
]

// Mock eligible users for random selection
const MOCK_ELIGIBLE_USERS = [
  { id: 'user_12', email: 'eligible1@test.com', name: 'Tom Taylor', entries: 45 },
  { id: 'user_34', email: 'eligible2@test.com', name: 'Lisa Brown', entries: 38 },
  { id: 'user_56', email: 'eligible3@test.com', name: 'James Davis', entries: 52 },
  { id: 'user_78', email: 'eligible4@test.com', name: 'Emma Wilson', entries: 29 },
  { id: 'user_90', email: 'eligible5@test.com', name: 'Anna Miller', entries: 41 },
]

type ClaimStatus = 'all' | 'pending' | 'claimed' | 'expired' | 'declined'

export default function WinnersPage() {
  const [prizes] = useState(MOCK_PRIZES)
  const [winners, setWinners] = useState(MOCK_WINNERS)
  const [statusFilter, setStatusFilter] = useState<ClaimStatus>('all')
  const [showDrawModal, setShowDrawModal] = useState(false)
  const [selectedPrize, setSelectedPrize] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawnWinner, setDrawnWinner] = useState<typeof MOCK_ELIGIBLE_USERS[0] | null>(null)

  const filteredWinners = statusFilter === 'all' 
    ? winners 
    : winners.filter(w => w.status === statusFilter)

  const tierColors = {
    grand: '#FFD700',
    major: '#69BE28',
    minor: '#3B82F6',
  }

  const statusColors = {
    pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
    claimed: { bg: 'bg-green-500/20', text: 'text-green-400' },
    expired: { bg: 'bg-red-500/20', text: 'text-red-400' },
    declined: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
  }

  const handleDraw = () => {
    if (!selectedPrize) return
    
    setIsDrawing(true)
    setDrawnWinner(null)
    
    // Simulate random selection with animation
    let iterations = 0
    const maxIterations = 20
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * MOCK_ELIGIBLE_USERS.length)
      setDrawnWinner(MOCK_ELIGIBLE_USERS[randomIndex])
      iterations++
      
      if (iterations >= maxIterations) {
        clearInterval(interval)
        setIsDrawing(false)
      }
    }, 100)
  }

  const confirmWinner = () => {
    if (!drawnWinner || !selectedPrize) return
    
    const prize = prizes.find(p => p.id === selectedPrize)
    const newWinner = {
      id: `w${winners.length + 1}`,
      userId: drawnWinner.id,
      email: drawnWinner.email,
      name: drawnWinner.name,
      prizeId: selectedPrize,
      prizeName: prize?.name || '',
      status: 'pending' as const,
      claimedAt: null,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }
    
    setWinners([newWinner, ...winners])
    setShowDrawModal(false)
    setDrawnWinner(null)
    setSelectedPrize(null)
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
            Winners
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Prize pool management and winner selection
          </p>
        </div>
        <button
          onClick={() => setShowDrawModal(true)}
          className="px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 self-start sm:self-auto"
          style={{ 
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            color: '#002244',
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          Draw Winner
        </button>
      </div>

      {/* Prize Pool Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {prizes.map((prize) => (
          <motion.div
            key={prize.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${tierColors[prize.tier as keyof typeof tierColors]}40`,
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div 
                className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                style={{ 
                  background: `${tierColors[prize.tier as keyof typeof tierColors]}20`,
                  color: tierColors[prize.tier as keyof typeof tierColors],
                }}
              >
                {prize.tier}
              </div>
              <span className="text-white/40 text-sm">
                {prize.claimed}/{prize.quantity}
              </span>
            </div>
            
            <h3 
              className="text-lg font-bold text-white mb-1"
              style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
            >
              {prize.name}
            </h3>
            <p className="text-white/50 text-sm">{prize.description}</p>
            
            {/* Progress bar */}
            <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(prize.claimed / prize.quantity) * 100}%` }}
                className="h-full rounded-full"
                style={{ background: tierColors[prize.tier as keyof typeof tierColors] }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Winners Filter */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'claimed', 'expired', 'declined'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              statusFilter === status
                ? 'bg-[#69BE28] text-[#002244]'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status === 'pending' && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                {winners.filter(w => w.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Winners Table */}
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
                <th className="px-4 py-3 text-left text-sm font-medium text-white/50 uppercase tracking-wider">Winner</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-white/50 uppercase tracking-wider">Prize</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-white/50 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-white/50 uppercase tracking-wider">Expires</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-white/50 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWinners.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-white/40">
                    No winners found
                  </td>
                </tr>
              ) : (
                filteredWinners.map((winner) => (
                  <tr 
                    key={winner.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white font-medium">{winner.name}</p>
                        <p className="text-white/50 text-sm">{winner.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/80">{winner.prizeName}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        statusColors[winner.status as keyof typeof statusColors].bg
                      } ${statusColors[winner.status as keyof typeof statusColors].text}`}>
                        {winner.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/50 text-sm">
                      {new Date(winner.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {winner.status === 'pending' && (
                          <>
                            <button
                              className="p-2 rounded-lg text-green-400 hover:bg-green-400/10 transition-all"
                              title="Mark as claimed"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              className="p-2 rounded-lg text-yellow-400 hover:bg-yellow-400/10 transition-all"
                              title="Send reminder"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                              </svg>
                            </button>
                          </>
                        )}
                        <button
                          className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                          title="View details"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Draw Winner Modal */}
      <AnimatePresence>
        {showDrawModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => { if (!isDrawing) setShowDrawModal(false) }}
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
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#002244]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h2 
                  className="text-2xl font-black uppercase tracking-wider"
                  style={{ 
                    fontFamily: 'var(--font-oswald), sans-serif',
                    color: '#FFD700',
                  }}
                >
                  Draw Winner
                </h2>
              </div>

              {/* Prize Selection */}
              {!drawnWinner && (
                <div className="mb-6">
                  <label className="text-white/50 text-sm uppercase tracking-wider mb-2 block">
                    Select Prize
                  </label>
                  <select
                    value={selectedPrize || ''}
                    onChange={(e) => setSelectedPrize(e.target.value)}
                    disabled={isDrawing}
                    className="w-full px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <option value="">Choose a prize...</option>
                    {prizes.filter(p => p.claimed < p.quantity).map(prize => (
                      <option key={prize.id} value={prize.id}>
                        {prize.name} ({prize.quantity - prize.claimed} remaining)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Drawing Animation */}
              {(isDrawing || drawnWinner) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl bg-white/5 text-center"
                >
                  {isDrawing ? (
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 0.3 }}
                    >
                      <p className="text-white/50 text-sm mb-2">Selecting winner...</p>
                      <p className="text-xl font-bold text-white">{drawnWinner?.name || '...'}</p>
                    </motion.div>
                  ) : drawnWinner && (
                    <div>
                      <p className="text-[#69BE28] text-sm mb-2">🎉 Winner Selected!</p>
                      <p className="text-2xl font-bold text-white mb-1">{drawnWinner.name}</p>
                      <p className="text-white/50">{drawnWinner.email}</p>
                      <p className="text-white/40 text-sm mt-2">{drawnWinner.entries} entries</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {!drawnWinner ? (
                  <>
                    <button
                      onClick={() => setShowDrawModal(false)}
                      disabled={isDrawing}
                      className="flex-1 px-4 py-3 rounded-xl font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
                      style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDraw}
                      disabled={!selectedPrize || isDrawing}
                      className="flex-1 px-4 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                      style={{ 
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                        color: '#002244',
                      }}
                    >
                      {isDrawing ? 'Drawing...' : 'Draw Now'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setDrawnWinner(null)}
                      className="flex-1 px-4 py-3 rounded-xl font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all"
                      style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    >
                      Redraw
                    </button>
                    <button
                      onClick={confirmWinner}
                      className="flex-1 px-4 py-3 rounded-xl font-bold transition-all"
                      style={{ 
                        background: 'linear-gradient(135deg, #69BE28 0%, #4A8B1A 100%)',
                        color: '#002244',
                      }}
                    >
                      Confirm Winner
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
