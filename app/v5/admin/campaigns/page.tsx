'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Campaign CMS Page
 * 
 * Features:
 * - Current campaign config
 * - Prize pool settings
 * - Date/deadline controls
 * - Feature flags (QB game unlock)
 */

interface Campaign {
  id: string
  slug: string
  name: string
  description: string
  startsAt: string
  endsAt: string
  gameEndsAt: string
  picksLockAt: string
  drawingAt: string
  active: boolean
  prizePool: {
    grandPrize: string
    grandPrizeValue: number
    majorPrizes: string
    majorPrizeCount: number
    minorPrizes: string
    minorPrizeCount: number
  }
  entryMethods: {
    game: boolean
    picks: boolean
    live: boolean
    share: boolean
    scan: boolean
  }
  featureFlags: {
    qbGameUnlocked: boolean
    liveQuestionsEnabled: boolean
    shopEnabled: boolean
    scanEnabled: boolean
    shareBonus: number
  }
}

// Mock current campaign
const MOCK_CAMPAIGN: Campaign = {
  id: 'camp-1',
  slug: 'super-bowl-2026',
  name: 'Big Game Giveaway 2026',
  description: 'Win tickets to Super Bowl LX in San Francisco! Play Dark Side Defense, make your picks, and enter to win.',
  startsAt: '2026-02-05T00:00:00Z',
  endsAt: '2026-02-09T23:59:59Z',
  gameEndsAt: '2026-02-07T14:00:00Z',
  picksLockAt: '2026-02-09T15:30:00Z',
  drawingAt: '2026-02-07T16:00:00Z',
  active: true,
  prizePool: {
    grandPrize: '2 Super Bowl LX Tickets',
    grandPrizeValue: 15000,
    majorPrizes: 'DeMarcus Lawrence Signed Jersey',
    majorPrizeCount: 10,
    minorPrizes: 'DrinkSip Bundle Pack',
    minorPrizeCount: 50,
  },
  entryMethods: {
    game: true,
    picks: true,
    live: true,
    share: true,
    scan: false,
  },
  featureFlags: {
    qbGameUnlocked: false,
    liveQuestionsEnabled: true,
    shopEnabled: true,
    scanEnabled: false,
    shareBonus: 5,
  },
}

const PAST_CAMPAIGNS = [
  { id: 'camp-test', slug: 'test-campaign', name: 'Test Campaign', active: false, entries: 234 },
]

export default function CampaignsPage() {
  const [campaign, setCampaign] = useState<Campaign>(MOCK_CAMPAIGN)
  const [hasChanges, setHasChanges] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState<'settings' | 'prizes' | 'features'>('settings')

  const updateCampaign = (updates: Partial<Campaign>) => {
    setCampaign({ ...campaign, ...updates })
    setHasChanges(true)
  }

  const updatePrizePool = (updates: Partial<Campaign['prizePool']>) => {
    setCampaign({ ...campaign, prizePool: { ...campaign.prizePool, ...updates } })
    setHasChanges(true)
  }

  const updateEntryMethods = (updates: Partial<Campaign['entryMethods']>) => {
    setCampaign({ ...campaign, entryMethods: { ...campaign.entryMethods, ...updates } })
    setHasChanges(true)
  }

  const updateFeatureFlags = (updates: Partial<Campaign['featureFlags']>) => {
    setCampaign({ ...campaign, featureFlags: { ...campaign.featureFlags, ...updates } })
    setHasChanges(true)
  }

  const handleSave = () => {
    // TODO: Save to Supabase
    setShowSaveConfirm(true)
    setTimeout(() => {
      setShowSaveConfirm(false)
      setHasChanges(false)
    }, 2000)
  }

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
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
            Campaigns
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Configure contests, prizes, and features
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-yellow-400 text-sm"
            >
              Unsaved changes
            </motion.span>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50"
            style={{ 
              background: hasChanges 
                ? 'linear-gradient(135deg, #69BE28 0%, #4A8B1A 100%)'
                : 'rgba(255, 255, 255, 0.1)',
              color: hasChanges ? '#002244' : 'rgba(255, 255, 255, 0.4)',
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save Changes
          </button>
        </div>
      </div>

      {/* Active Campaign Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(105, 190, 40, 0.1) 0%, rgba(0, 34, 68, 0.3) 100%)',
          border: '1px solid rgba(105, 190, 40, 0.3)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-sm font-medium uppercase tracking-wider">Active Campaign</span>
          </div>
          <div className="text-white/40 text-sm">
            Slug: <code className="text-white/60 bg-white/10 px-2 py-0.5 rounded">{campaign.slug}</code>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-oswald), sans-serif' }}>
          {campaign.name}
        </h2>
        <p className="text-white/60">{campaign.description}</p>
        
        {/* Timeline */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-3 rounded-xl bg-white/5">
            <p className="text-white/40 text-xs uppercase tracking-wider">Starts</p>
            <p className="text-white font-medium mt-1">{formatDateTime(campaign.startsAt)}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5">
            <p className="text-white/40 text-xs uppercase tracking-wider">Game Ends</p>
            <p className="text-white font-medium mt-1">{formatDateTime(campaign.gameEndsAt)}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5">
            <p className="text-white/40 text-xs uppercase tracking-wider">Picks Lock</p>
            <p className="text-white font-medium mt-1">{formatDateTime(campaign.picksLockAt)}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5">
            <p className="text-white/40 text-xs uppercase tracking-wider">Drawing</p>
            <p className="text-white font-medium mt-1">{formatDateTime(campaign.drawingAt)}</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {(['settings', 'prizes', 'features'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium uppercase tracking-wider transition-all border-b-2 -mb-px ${
              activeTab === tab
                ? 'text-[#69BE28] border-[#69BE28]'
                : 'text-white/40 border-transparent hover:text-white/60'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div 
        className="rounded-2xl p-6"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white mb-4">Campaign Settings</h3>
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/50 text-sm uppercase tracking-wider mb-2 block">Campaign Name</label>
                <input
                  type="text"
                  value={campaign.name}
                  onChange={(e) => updateCampaign({ name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#69BE28]/50"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                />
              </div>
              <div>
                <label className="text-white/50 text-sm uppercase tracking-wider mb-2 block">Slug</label>
                <input
                  type="text"
                  value={campaign.slug}
                  onChange={(e) => updateCampaign({ slug: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#69BE28]/50"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                />
              </div>
            </div>

            <div>
              <label className="text-white/50 text-sm uppercase tracking-wider mb-2 block">Description</label>
              <textarea
                value={campaign.description}
                onChange={(e) => updateCampaign({ description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#69BE28]/50 resize-none"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              />
            </div>

            {/* Dates */}
            <h4 className="text-white/80 font-medium mt-6 mb-4">Important Dates</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/50 text-sm uppercase tracking-wider mb-2 block">Campaign Start</label>
                <input
                  type="datetime-local"
                  value={campaign.startsAt.slice(0, 16)}
                  onChange={(e) => updateCampaign({ startsAt: new Date(e.target.value).toISOString() })}
                  className="w-full px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#69BE28]/50"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                />
              </div>
              <div>
                <label className="text-white/50 text-sm uppercase tracking-wider mb-2 block">Campaign End</label>
                <input
                  type="datetime-local"
                  value={campaign.endsAt.slice(0, 16)}
                  onChange={(e) => updateCampaign({ endsAt: new Date(e.target.value).toISOString() })}
                  className="w-full px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#69BE28]/50"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                />
              </div>
              <div>
                <label className="text-white/50 text-sm uppercase tracking-wider mb-2 block">Game Entries Close</label>
                <input
                  type="datetime-local"
                  value={campaign.gameEndsAt.slice(0, 16)}
                  onChange={(e) => updateCampaign({ gameEndsAt: new Date(e.target.value).toISOString() })}
                  className="w-full px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#69BE28]/50"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                />
              </div>
              <div>
                <label className="text-white/50 text-sm uppercase tracking-wider mb-2 block">Picks Lock Time</label>
                <input
                  type="datetime-local"
                  value={campaign.picksLockAt.slice(0, 16)}
                  onChange={(e) => updateCampaign({ picksLockAt: new Date(e.target.value).toISOString() })}
                  className="w-full px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#69BE28]/50"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-white/50 text-sm uppercase tracking-wider mb-2 block">Live Drawing</label>
                <input
                  type="datetime-local"
                  value={campaign.drawingAt.slice(0, 16)}
                  onChange={(e) => updateCampaign({ drawingAt: new Date(e.target.value).toISOString() })}
                  className="w-full px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#69BE28]/50"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                />
              </div>
            </div>

            {/* Entry Methods */}
            <h4 className="text-white/80 font-medium mt-6 mb-4">Entry Methods</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Object.entries(campaign.entryMethods).map(([key, enabled]) => (
                <button
                  key={key}
                  onClick={() => updateEntryMethods({ [key]: !enabled } as Partial<Campaign['entryMethods']>)}
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${
                    enabled
                      ? 'bg-[#69BE28]/20 text-[#69BE28] border border-[#69BE28]/30'
                      : 'bg-white/5 text-white/40 border border-white/10'
                  }`}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'prizes' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white mb-4">Prize Pool</h3>
            
            {/* Grand Prize */}
            <div 
              className="p-4 rounded-xl"
              style={{ 
                background: 'rgba(255, 215, 0, 0.1)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🏆</span>
                <span className="text-yellow-400 text-sm font-bold uppercase tracking-wider">Grand Prize</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Prize Name</label>
                  <input
                    type="text"
                    value={campaign.prizePool.grandPrize}
                    onChange={(e) => updatePrizePool({ grandPrize: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  />
                </div>
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Estimated Value ($)</label>
                  <input
                    type="number"
                    value={campaign.prizePool.grandPrizeValue}
                    onChange={(e) => updatePrizePool({ grandPrizeValue: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Major Prizes */}
            <div 
              className="p-4 rounded-xl"
              style={{ 
                background: 'rgba(105, 190, 40, 0.1)',
                border: '1px solid rgba(105, 190, 40, 0.3)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🎽</span>
                <span className="text-[#69BE28] text-sm font-bold uppercase tracking-wider">Major Prizes</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Prize Name</label>
                  <input
                    type="text"
                    value={campaign.prizePool.majorPrizes}
                    onChange={(e) => updatePrizePool({ majorPrizes: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#69BE28]/50"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  />
                </div>
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Quantity</label>
                  <input
                    type="number"
                    value={campaign.prizePool.majorPrizeCount}
                    onChange={(e) => updatePrizePool({ majorPrizeCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#69BE28]/50"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Minor Prizes */}
            <div 
              className="p-4 rounded-xl"
              style={{ 
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">📦</span>
                <span className="text-blue-400 text-sm font-bold uppercase tracking-wider">Minor Prizes</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Prize Name</label>
                  <input
                    type="text"
                    value={campaign.prizePool.minorPrizes}
                    onChange={(e) => updatePrizePool({ minorPrizes: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  />
                </div>
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Quantity</label>
                  <input
                    type="number"
                    value={campaign.prizePool.minorPrizeCount}
                    onChange={(e) => updatePrizePool({ minorPrizeCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Total Value */}
            <div className="p-4 rounded-xl bg-white/5 flex items-center justify-between">
              <span className="text-white/60">Total Prize Pool Value</span>
              <span className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-oswald), sans-serif' }}>
                ${(campaign.prizePool.grandPrizeValue + (campaign.prizePool.majorPrizeCount * 250) + (campaign.prizePool.minorPrizeCount * 50)).toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white mb-4">Feature Flags</h3>
            
            <div className="space-y-4">
              {/* QB Game Unlock */}
              <div 
                className="p-4 rounded-xl flex items-center justify-between"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div>
                  <h4 className="text-white font-medium">QB Legend Game</h4>
                  <p className="text-white/50 text-sm">Unlock the quarterback offense game mode</p>
                </div>
                <button
                  onClick={() => updateFeatureFlags({ qbGameUnlocked: !campaign.featureFlags.qbGameUnlocked })}
                  className={`relative w-14 h-8 rounded-full transition-all ${
                    campaign.featureFlags.qbGameUnlocked ? 'bg-[#69BE28]' : 'bg-white/20'
                  }`}
                >
                  <motion.div
                    animate={{ x: campaign.featureFlags.qbGameUnlocked ? 24 : 4 }}
                    className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg"
                  />
                </button>
              </div>

              {/* Live Questions */}
              <div 
                className="p-4 rounded-xl flex items-center justify-between"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div>
                  <h4 className="text-white font-medium">Live Questions</h4>
                  <p className="text-white/50 text-sm">Enable in-game quarter questions</p>
                </div>
                <button
                  onClick={() => updateFeatureFlags({ liveQuestionsEnabled: !campaign.featureFlags.liveQuestionsEnabled })}
                  className={`relative w-14 h-8 rounded-full transition-all ${
                    campaign.featureFlags.liveQuestionsEnabled ? 'bg-[#69BE28]' : 'bg-white/20'
                  }`}
                >
                  <motion.div
                    animate={{ x: campaign.featureFlags.liveQuestionsEnabled ? 24 : 4 }}
                    className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg"
                  />
                </button>
              </div>

              {/* Shop */}
              <div 
                className="p-4 rounded-xl flex items-center justify-between"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div>
                  <h4 className="text-white font-medium">DrinkSip Shop</h4>
                  <p className="text-white/50 text-sm">Show in-app product shop</p>
                </div>
                <button
                  onClick={() => updateFeatureFlags({ shopEnabled: !campaign.featureFlags.shopEnabled })}
                  className={`relative w-14 h-8 rounded-full transition-all ${
                    campaign.featureFlags.shopEnabled ? 'bg-[#69BE28]' : 'bg-white/20'
                  }`}
                >
                  <motion.div
                    animate={{ x: campaign.featureFlags.shopEnabled ? 24 : 4 }}
                    className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg"
                  />
                </button>
              </div>

              {/* Product Scan */}
              <div 
                className="p-4 rounded-xl flex items-center justify-between"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div>
                  <h4 className="text-white font-medium">Product Scan</h4>
                  <p className="text-white/50 text-sm">Enable product verification for bonus entries</p>
                </div>
                <button
                  onClick={() => updateFeatureFlags({ scanEnabled: !campaign.featureFlags.scanEnabled })}
                  className={`relative w-14 h-8 rounded-full transition-all ${
                    campaign.featureFlags.scanEnabled ? 'bg-[#69BE28]' : 'bg-white/20'
                  }`}
                >
                  <motion.div
                    animate={{ x: campaign.featureFlags.scanEnabled ? 24 : 4 }}
                    className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg"
                  />
                </button>
              </div>

              {/* Share Bonus */}
              <div 
                className="p-4 rounded-xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-white font-medium">Share Bonus Entries</h4>
                    <p className="text-white/50 text-sm">Bonus entries awarded for sharing the app</p>
                  </div>
                  <span className="text-2xl font-bold text-[#69BE28]" style={{ fontFamily: 'var(--font-oswald), sans-serif' }}>
                    +{campaign.featureFlags.shareBonus}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={campaign.featureFlags.shareBonus}
                  onChange={(e) => updateFeatureFlags({ shareBonus: parseInt(e.target.value) })}
                  className="w-full accent-[#69BE28]"
                />
                <div className="flex justify-between text-white/30 text-xs mt-1">
                  <span>0</span>
                  <span>5</span>
                  <span>10</span>
                  <span>15</span>
                  <span>20</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Past Campaigns */}
      <div 
        className="rounded-2xl p-6"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <h3 className="text-lg font-bold text-white mb-4">Past Campaigns</h3>
        {PAST_CAMPAIGNS.length === 0 ? (
          <p className="text-white/40 text-center py-8">No past campaigns</p>
        ) : (
          <div className="space-y-3">
            {PAST_CAMPAIGNS.map((camp) => (
              <div 
                key={camp.id}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5"
              >
                <div>
                  <p className="text-white font-medium">{camp.name}</p>
                  <p className="text-white/40 text-sm">{camp.slug}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/60">{camp.entries.toLocaleString()} entries</p>
                  <span className="text-white/30 text-xs">Completed</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Confirmation Toast */}
      <AnimatePresence>
        {showSaveConfirm && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div 
              className="px-6 py-3 rounded-xl flex items-center gap-3"
              style={{
                background: 'linear-gradient(135deg, #69BE28 0%, #4A8B1A 100%)',
              }}
            >
              <svg className="w-5 h-5 text-[#002244]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-[#002244] font-medium">Changes saved successfully!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
