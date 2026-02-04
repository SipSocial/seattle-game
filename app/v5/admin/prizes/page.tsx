'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  Gift,
  Package,
  TrendingUp,
  Edit2,
  Trash2,
  Plus,
  X,
  Check,
  Clock,
  Award,
  AlertCircle,
} from 'lucide-react'
import { GlassCard } from '@/components/ui'
import {
  usePrizeStore,
  usePrizes,
  useTotalWins,
  useWinRate,
  usePrizeInventory,
  useWins,
  formatWinDate,
  getInventoryPercentage,
  isLowInventory,
  isOutOfStock,
  type Prize,
  type PrizeTier,
} from '@/src/v5/store/prizeStore'
import { PRIZE_TIER_CONFIG } from '@/src/v5/data/defaultPrizes'

/**
 * Admin Prize Dashboard
 * 
 * Manages prizes for the scratch card feature:
 * - View prize inventory and stats
 * - Add/edit/delete prizes
 * - Toggle prize active status
 * - View recent wins
 */

// ============================================================================
// Tier Colors & Config
// ============================================================================

const TIER_COLORS = {
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
} as const

// ============================================================================
// Stat Card Component
// ============================================================================

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color: string
}

function StatCard({ title, value, subtitle, icon, color }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}20` }}
        >
          <div style={{ color }}>{icon}</div>
        </div>
      </div>

      <div>
        <h3 className="text-white/50 text-sm uppercase tracking-wider mb-1">{title}</h3>
        <p
          className="text-3xl font-black"
          style={{
            fontFamily: 'var(--font-oswald), sans-serif',
            color: color,
          }}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {subtitle && <p className="text-white/40 text-sm mt-1">{subtitle}</p>}
      </div>
    </motion.div>
  )
}

// ============================================================================
// Tier Badge Component
// ============================================================================

function TierBadge({ tier }: { tier: PrizeTier }) {
  const config = PRIZE_TIER_CONFIG[tier]
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider"
      style={{
        background: `${config.color}20`,
        color: config.color,
        border: `1px solid ${config.color}40`,
      }}
    >
      <span>{config.icon}</span>
      {tier}
    </span>
  )
}

// ============================================================================
// Progress Bar Component
// ============================================================================

function InventoryBar({ remaining, total }: { remaining: number; total: number }) {
  const percentage = total > 0 ? (remaining / total) * 100 : 0
  const isLow = remaining <= 10 && remaining > 0
  const isEmpty = remaining === 0

  let barColor = '#69BE28' // Green
  if (isLow) barColor = '#F59E0B' // Amber
  if (isEmpty) barColor = '#EF4444' // Red

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-white/50 mb-1">
        <span>{remaining} remaining</span>
        <span>{total} total</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: barColor }}
        />
      </div>
    </div>
  )
}

// ============================================================================
// Toggle Switch Component
// ============================================================================

function ToggleSwitch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      style={{
        background: checked ? 'rgba(105, 190, 40, 0.3)' : 'rgba(255, 255, 255, 0.1)',
        border: `1px solid ${checked ? 'rgba(105, 190, 40, 0.5)' : 'rgba(255, 255, 255, 0.2)'}`,
      }}
    >
      <motion.div
        layout
        className="absolute top-0.5 w-5 h-5 rounded-full"
        style={{
          left: checked ? 'calc(100% - 22px)' : '2px',
          background: checked ? '#69BE28' : 'rgba(255, 255, 255, 0.5)',
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  )
}

// ============================================================================
// Prize Card Component
// ============================================================================

interface PrizeCardProps {
  prize: Prize
  onEdit: (prize: Prize) => void
  onDelete: (id: string) => void
  onToggle: (id: string) => void
}

function PrizeCard({ prize, onEdit, onDelete, onToggle }: PrizeCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(prize.id)
      setConfirmDelete(false)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-xl p-4"
      style={{
        background: prize.isActive ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.01)',
        border: `1px solid ${
          prize.isActive ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.04)'
        }`,
        opacity: prize.isActive ? 1 : 0.6,
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Prize Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-white font-medium truncate">{prize.name}</h3>
            <TierBadge tier={prize.tier} />
            {isOutOfStock(prize) && (
              <span className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Out of stock
              </span>
            )}
            {isLowInventory(prize) && !isOutOfStock(prize) && (
              <span className="text-xs text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Low stock
              </span>
            )}
          </div>
          <p className="text-white/40 text-sm line-clamp-1">{prize.description}</p>
        </div>

        {/* Odds */}
        <div className="text-center sm:w-20">
          <p className="text-xs text-white/40 uppercase tracking-wider">Odds</p>
          <p className="text-lg font-bold text-white">{prize.odds}%</p>
        </div>

        {/* Inventory */}
        <div className="sm:w-40">
          <InventoryBar remaining={prize.remainingInventory} total={prize.totalInventory} />
        </div>

        {/* Active Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">Active</span>
          <ToggleSwitch checked={prize.isActive} onChange={() => onToggle(prize.id)} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(prize)}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all"
            title="Edit prize"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className={`p-2 rounded-lg transition-all ${
              confirmDelete
                ? 'text-red-400 bg-red-400/10'
                : 'text-white/60 hover:text-red-400 hover:bg-white/5'
            }`}
            title={confirmDelete ? 'Click again to confirm' : 'Delete prize'}
          >
            {confirmDelete ? <Check className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================================
// Prize Form Modal
// ============================================================================

interface PrizeFormData {
  name: string
  description: string
  tier: PrizeTier
  odds: number
  totalInventory: number
  isActive: boolean
}

interface PrizeFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: PrizeFormData) => void
  editingPrize?: Prize | null
}

function PrizeFormModal({ isOpen, onClose, onSave, editingPrize }: PrizeFormModalProps) {
  const [formData, setFormData] = useState<PrizeFormData>({
    name: '',
    description: '',
    tier: 'bronze',
    odds: 10,
    totalInventory: 100,
    isActive: true,
  })

  useEffect(() => {
    if (editingPrize) {
      setFormData({
        name: editingPrize.name,
        description: editingPrize.description,
        tier: editingPrize.tier,
        odds: editingPrize.odds,
        totalInventory: editingPrize.totalInventory,
        isActive: editingPrize.isActive,
      })
    } else {
      setFormData({
        name: '',
        description: '',
        tier: 'bronze',
        odds: 10,
        totalInventory: 100,
        isActive: true,
      })
    }
  }, [editingPrize, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="rounded-2xl p-6"
              style={{
                background: 'linear-gradient(180deg, rgba(0, 10, 20, 0.98) 0%, rgba(0, 20, 40, 0.98) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2
                  className="text-xl font-black uppercase tracking-wider"
                  style={{
                    fontFamily: 'var(--font-oswald), sans-serif',
                    color: '#69BE28',
                  }}
                >
                  {editingPrize ? 'Edit Prize' : 'Add Prize'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm text-white/60 mb-2">Prize Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Free 6-Pack"
                    required
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#69BE28]/50"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm text-white/60 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the prize..."
                    rows={3}
                    required
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#69BE28]/50 resize-none"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  />
                </div>

                {/* Tier & Odds Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Tier */}
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Tier</label>
                    <select
                      value={formData.tier}
                      onChange={(e) => setFormData({ ...formData, tier: e.target.value as PrizeTier })}
                      className="w-full px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#69BE28]/50 appearance-none cursor-pointer"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <option value="gold" style={{ background: '#001020' }}>
                        🏆 Gold - Grand Prize
                      </option>
                      <option value="silver" style={{ background: '#001020' }}>
                        🥈 Silver - Major Prize
                      </option>
                      <option value="bronze" style={{ background: '#001020' }}>
                        🎁 Bronze - Instant Win
                      </option>
                    </select>
                  </div>

                  {/* Odds */}
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Odds (%)</label>
                    <input
                      type="number"
                      value={formData.odds}
                      onChange={(e) =>
                        setFormData({ ...formData, odds: Math.max(0, Math.min(100, Number(e.target.value))) })
                      }
                      min={0}
                      max={100}
                      step={0.1}
                      required
                      className="w-full px-4 py-3 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#69BE28]/50"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    />
                  </div>
                </div>

                {/* Inventory & Active Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Inventory */}
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Total Inventory</label>
                    <input
                      type="number"
                      value={formData.totalInventory}
                      onChange={(e) =>
                        setFormData({ ...formData, totalInventory: Math.max(1, Number(e.target.value)) })
                      }
                      min={1}
                      required
                      className="w-full px-4 py-3 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#69BE28]/50"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    />
                  </div>

                  {/* Active */}
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Active</label>
                    <div
                      className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <ToggleSwitch
                        checked={formData.isActive}
                        onChange={() => setFormData({ ...formData, isActive: !formData.isActive })}
                      />
                      <span className="text-white/60 text-sm">
                        {formData.isActive ? 'Prize is active' : 'Prize is inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl font-bold uppercase tracking-wider transition-all duration-200"
                    style={{
                      background: 'linear-gradient(135deg, #69BE28 0%, #4A8B1A 100%)',
                      color: '#002244',
                      fontFamily: 'var(--font-oswald), sans-serif',
                    }}
                  >
                    {editingPrize ? 'Save Changes' : 'Add Prize'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================================================
// Recent Win Item Component
// ============================================================================

function RecentWinItem({
  prizeName,
  tier,
  wonAt,
  claimed,
}: {
  prizeName: string
  tier: PrizeTier
  wonAt: number
  claimed: boolean
}) {
  const tierConfig = PRIZE_TIER_CONFIG[tier]

  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
        style={{ background: `${tierConfig.color}20` }}
      >
        {tierConfig.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white/80 text-sm truncate">{prizeName}</p>
        <div className="flex items-center gap-2">
          <TierBadge tier={tier} />
          <span className="text-white/30 text-xs">{formatWinDate(wonAt)}</span>
        </div>
      </div>
      <span
        className={`text-xs px-2 py-1 rounded-full ${
          claimed
            ? 'bg-green-400/10 text-green-400'
            : 'bg-amber-400/10 text-amber-400'
        }`}
      >
        {claimed ? 'Claimed' : 'Pending'}
      </span>
    </div>
  )
}

// ============================================================================
// Main Dashboard Component
// ============================================================================

export default function AdminPrizesDashboard() {
  const prizes = usePrizes()
  const totalWins = useTotalWins()
  const winRate = useWinRate()
  const { total: totalInventory, remaining: remainingInventory } = usePrizeInventory()
  const wins = useWins()
  const { initializePrizes, addPrize, updatePrize, deletePrize, togglePrize, resetToDefaults } =
    usePrizeStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null)

  // Initialize prizes on mount
  useEffect(() => {
    initializePrizes()
  }, [initializePrizes])

  // Calculate stats
  const activePrizesCount = prizes.filter((p) => p.isActive).length
  const recentWins = wins.slice(0, 10)

  // Handlers
  const handleAddPrize = () => {
    setEditingPrize(null)
    setIsModalOpen(true)
  }

  const handleEditPrize = (prize: Prize) => {
    setEditingPrize(prize)
    setIsModalOpen(true)
  }

  const handleSavePrize = (data: PrizeFormData) => {
    if (editingPrize) {
      updatePrize(editingPrize.id, {
        ...data,
        remainingInventory: data.totalInventory, // Reset remaining if total changed
      })
    } else {
      addPrize({
        ...data,
        remainingInventory: data.totalInventory,
      })
    }
  }

  const handleDeletePrize = (id: string) => {
    deletePrize(id)
  }

  const handleTogglePrize = (id: string) => {
    togglePrize(id)
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
            Prize Management
          </h1>
          <p className="text-white/50 text-sm mt-1">Manage scratch card prizes and inventory</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (confirm('Reset all prizes to defaults? This will clear all wins.')) {
                resetToDefaults()
              }
            }}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
            style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Reset
          </button>
          <button
            onClick={handleAddPrize}
            className="px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #69BE28 0%, #4A8B1A 100%)',
              color: '#002244',
              fontFamily: 'var(--font-oswald), sans-serif',
            }}
          >
            <Plus className="w-4 h-4" />
            Add Prize
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Wins"
          value={totalWins}
          subtitle="All-time winners"
          icon={<Trophy className="w-5 h-5" />}
          color="#FFD700"
        />
        <StatCard
          title="Win Rate"
          value={`${winRate.toFixed(1)}%`}
          subtitle="Per scratch"
          icon={<TrendingUp className="w-5 h-5" />}
          color="#69BE28"
        />
        <StatCard
          title="Inventory"
          value={`${remainingInventory}/${totalInventory}`}
          subtitle={`${totalInventory > 0 ? Math.round((remainingInventory / totalInventory) * 100) : 0}% remaining`}
          icon={<Package className="w-5 h-5" />}
          color="#3B82F6"
        />
        <StatCard
          title="Active Prizes"
          value={activePrizesCount}
          subtitle={`${prizes.length} total configured`}
          icon={<Gift className="w-5 h-5" />}
          color="#8B5CF6"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prize List - 2 columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 rounded-2xl p-5"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/80 font-medium flex items-center gap-2">
              <Award className="w-5 h-5 text-[#69BE28]" />
              All Prizes
            </h3>
            <span className="text-xs text-white/30">{prizes.length} prizes</span>
          </div>

          {prizes.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/40">No prizes configured</p>
              <button
                onClick={handleAddPrize}
                className="mt-4 px-4 py-2 rounded-xl text-sm font-medium text-[#69BE28] hover:bg-[#69BE28]/10 transition-all"
                style={{ border: '1px solid rgba(105, 190, 40, 0.3)' }}
              >
                Add your first prize
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {prizes.map((prize) => (
                  <PrizeCard
                    key={prize.id}
                    prize={prize}
                    onEdit={handleEditPrize}
                    onDelete={handleDeletePrize}
                    onToggle={handleTogglePrize}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Recent Wins - 1 column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1 rounded-2xl p-5"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/80 font-medium flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#FFD700]" />
              Recent Wins
            </h3>
            <span className="text-xs text-white/30">Last 10</span>
          </div>

          {recentWins.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/40">No wins yet</p>
              <p className="text-white/30 text-sm mt-1">Wins will appear here</p>
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto">
              {recentWins.map((win) => (
                <RecentWinItem
                  key={win.id}
                  prizeName={win.prizeName}
                  tier={win.tier}
                  wonAt={win.wonAt}
                  claimed={win.claimed}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Prize Form Modal */}
      <PrizeFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingPrize(null)
        }}
        onSave={handleSavePrize}
        editingPrize={editingPrize}
      />
    </div>
  )
}
