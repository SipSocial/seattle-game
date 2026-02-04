'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

/**
 * Sponsor Analytics Page
 * 
 * Features:
 * - Sponsor cards with metrics
 * - Impressions, clicks, CTR
 * - Click timeline
 * - Export data
 */

// Mock data - replace with Supabase queries
const MOCK_SPONSORS = [
  {
    id: 'drinksip',
    name: 'DrinkSip',
    tier: 'presenting',
    logo: 'https://cdn.shopify.com/s/files/1/0407/8580/5468/files/DrinkSip_Logo_SVG.svg?v=1759624477',
    impressions: 45230,
    clicks: 4523,
    ctr: 10.0,
    weeklyData: [
      { day: 'Mon', impressions: 5420, clicks: 542 },
      { day: 'Tue', impressions: 6230, clicks: 623 },
      { day: 'Wed', impressions: 7100, clicks: 710 },
      { day: 'Thu', impressions: 5890, clicks: 589 },
      { day: 'Fri', impressions: 7820, clicks: 782 },
      { day: 'Sat', impressions: 6340, clicks: 634 },
      { day: 'Sun', impressions: 6430, clicks: 643 },
    ],
  },
  {
    id: 'kjr-radio',
    name: 'KJR Radio',
    tier: 'major',
    logo: '/sponsors/kjr-radio.png',
    impressions: 38450,
    clicks: 2692,
    ctr: 7.0,
    weeklyData: [
      { day: 'Mon', impressions: 4820, clicks: 337 },
      { day: 'Tue', impressions: 5430, clicks: 380 },
      { day: 'Wed', impressions: 5900, clicks: 413 },
      { day: 'Thu', impressions: 4890, clicks: 342 },
      { day: 'Fri', impressions: 6520, clicks: 456 },
      { day: 'Sat', impressions: 5640, clicks: 395 },
      { day: 'Sun', impressions: 5250, clicks: 369 },
    ],
  },
  {
    id: 'simply-seattle',
    name: 'Simply Seattle',
    tier: 'major',
    logo: '/sponsors/simply-seattle.png',
    impressions: 36780,
    clicks: 3310,
    ctr: 9.0,
    weeklyData: [
      { day: 'Mon', impressions: 4520, clicks: 407 },
      { day: 'Tue', impressions: 5230, clicks: 471 },
      { day: 'Wed', impressions: 5600, clicks: 504 },
      { day: 'Thu', impressions: 4690, clicks: 422 },
      { day: 'Fri', impressions: 6120, clicks: 551 },
      { day: 'Sat', impressions: 5420, clicks: 488 },
      { day: 'Sun', impressions: 5200, clicks: 468 },
    ],
  },
  {
    id: 'fat-zachs',
    name: "Fat Zach's Pizza",
    tier: 'supporting',
    logo: '/sponsors/fat-zachs.png',
    impressions: 28900,
    clicks: 1734,
    ctr: 6.0,
    weeklyData: [
      { day: 'Mon', impressions: 3820, clicks: 229 },
      { day: 'Tue', impressions: 4130, clicks: 248 },
      { day: 'Wed', impressions: 4400, clicks: 264 },
      { day: 'Thu', impressions: 3690, clicks: 221 },
      { day: 'Fri', impressions: 4820, clicks: 289 },
      { day: 'Sat', impressions: 4120, clicks: 247 },
      { day: 'Sun', impressions: 3920, clicks: 235 },
    ],
  },
]

const tierColors = {
  presenting: '#FFD700',
  major: '#69BE28',
  supporting: '#3B82F6',
}

const tierLabels = {
  presenting: 'Presenting Partner',
  major: 'Major Partner',
  supporting: 'Supporting Partner',
}

function SponsorCard({ sponsor, isSelected, onSelect }: { 
  sponsor: typeof MOCK_SPONSORS[0]
  isSelected: boolean
  onSelect: () => void
}) {
  const tierColor = tierColors[sponsor.tier as keyof typeof tierColors]
  
  return (
    <motion.div
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`rounded-2xl p-5 cursor-pointer transition-all ${
        isSelected ? 'ring-2' : ''
      }`}
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: `1px solid ${isSelected ? tierColor : 'rgba(255, 255, 255, 0.08)'}`,
        ['--tw-ring-color' as string]: tierColor,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden"
          style={{ background: 'rgba(255, 255, 255, 0.1)' }}
        >
          {sponsor.logo.startsWith('http') ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={sponsor.logo} alt={sponsor.name} className="w-10 h-10 object-contain" />
          ) : (
            <span className="text-2xl">🏢</span>
          )}
        </div>
        <div 
          className="px-2 py-1 rounded-full text-[10px] font-bold uppercase"
          style={{ 
            background: `${tierColor}20`,
            color: tierColor,
          }}
        >
          {tierLabels[sponsor.tier as keyof typeof tierLabels]}
        </div>
      </div>
      
      <h3 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'var(--font-oswald), sans-serif' }}>
        {sponsor.name}
      </h3>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-white/40 text-xs uppercase tracking-wider">Impressions</p>
          <p className="text-xl font-bold text-white">{sponsor.impressions.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-white/40 text-xs uppercase tracking-wider">Clicks</p>
          <p className="text-xl font-bold text-white">{sponsor.clicks.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-white/40 text-xs uppercase tracking-wider">CTR</p>
          <p className="text-xl font-bold" style={{ color: tierColor }}>{sponsor.ctr}%</p>
        </div>
      </div>
    </motion.div>
  )
}

function ClickTimeline({ data, color }: { data: typeof MOCK_SPONSORS[0]['weeklyData']; color: string }) {
  const maxClicks = Math.max(...data.map(d => d.clicks))
  
  return (
    <div className="space-y-3">
      {data.map((day, index) => (
        <motion.div
          key={day.day}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center gap-4"
        >
          <span className="text-white/40 text-sm w-10">{day.day}</span>
          <div className="flex-1 h-6 rounded-full bg-white/5 overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(day.clicks / maxClicks) * 100}%` }}
              transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${color} 0%, ${color}80 100%)` }}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/60">
              {day.clicks.toLocaleString()}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default function SponsorsPage() {
  const [sponsors] = useState(MOCK_SPONSORS)
  const [selectedSponsor, setSelectedSponsor] = useState<typeof MOCK_SPONSORS[0] | null>(sponsors[0])

  // Export data
  const exportData = () => {
    const headers = ['Sponsor', 'Tier', 'Impressions', 'Clicks', 'CTR']
    const rows = sponsors.map(s => [
      s.name,
      s.tier,
      s.impressions.toString(),
      s.clicks.toString(),
      `${s.ctr}%`,
    ])
    
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sponsor_analytics_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Calculate totals
  const totals = {
    impressions: sponsors.reduce((sum, s) => sum + s.impressions, 0),
    clicks: sponsors.reduce((sum, s) => sum + s.clicks, 0),
    ctr: sponsors.reduce((sum, s) => sum + s.clicks, 0) / sponsors.reduce((sum, s) => sum + s.impressions, 0) * 100,
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
            Sponsors
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Partner analytics and performance
          </p>
        </div>
        <button
          onClick={exportData}
          className="px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 self-start sm:self-auto"
          style={{ 
            background: 'linear-gradient(135deg, #69BE28 0%, #4A8B1A 100%)',
            color: '#002244',
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Data
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <p className="text-white/40 text-sm uppercase tracking-wider mb-2">Total Impressions</p>
          <p className="text-3xl font-black text-white" style={{ fontFamily: 'var(--font-oswald), sans-serif' }}>
            {totals.impressions.toLocaleString()}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-5"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <p className="text-white/40 text-sm uppercase tracking-wider mb-2">Total Clicks</p>
          <p className="text-3xl font-black text-white" style={{ fontFamily: 'var(--font-oswald), sans-serif' }}>
            {totals.clicks.toLocaleString()}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-5"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <p className="text-white/40 text-sm uppercase tracking-wider mb-2">Average CTR</p>
          <p className="text-3xl font-black" style={{ fontFamily: 'var(--font-oswald), sans-serif', color: '#69BE28' }}>
            {totals.ctr.toFixed(1)}%
          </p>
        </motion.div>
      </div>

      {/* Sponsor Grid + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sponsor Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sponsors.map((sponsor) => (
            <SponsorCard
              key={sponsor.id}
              sponsor={sponsor}
              isSelected={selectedSponsor?.id === sponsor.id}
              onSelect={() => setSelectedSponsor(sponsor)}
            />
          ))}
        </div>

        {/* Click Timeline Detail */}
        <div 
          className="rounded-2xl p-5"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {selectedSponsor ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
                  style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                >
                  {selectedSponsor.logo.startsWith('http') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selectedSponsor.logo} alt={selectedSponsor.name} className="w-8 h-8 object-contain" />
                  ) : (
                    <span className="text-xl">🏢</span>
                  )}
                </div>
                <div>
                  <h3 className="text-white font-bold">{selectedSponsor.name}</h3>
                  <p className="text-white/40 text-sm">Weekly Click Timeline</p>
                </div>
              </div>
              
              <ClickTimeline 
                data={selectedSponsor.weeklyData} 
                color={tierColors[selectedSponsor.tier as keyof typeof tierColors]}
              />
              
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-white/40 text-xs uppercase">Avg Daily Clicks</p>
                    <p className="text-lg font-bold text-white">
                      {Math.round(selectedSponsor.clicks / 7).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs uppercase">Peak Day</p>
                    <p className="text-lg font-bold text-white">
                      {selectedSponsor.weeklyData.reduce((max, d) => d.clicks > max.clicks ? d : max).day}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-white/40">
              Select a sponsor to view details
            </div>
          )}
        </div>
      </div>

      {/* Placement Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl p-5"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <h3 className="text-white font-bold mb-4">Placement Performance</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { name: 'Splash Screen', impressions: 12450, clicks: 1245, color: '#FFD700' },
            { name: 'Header Strip', impressions: 45230, clicks: 2261, color: '#69BE28' },
            { name: 'Discover Page', impressions: 28900, clicks: 4335, color: '#3B82F6' },
            { name: 'Game Results', impressions: 18720, clicks: 1872, color: '#8B5CF6' },
          ].map((placement) => (
            <div 
              key={placement.name}
              className="p-4 rounded-xl bg-white/5"
            >
              <div 
                className="w-8 h-8 rounded-lg mb-3 flex items-center justify-center"
                style={{ background: `${placement.color}20` }}
              >
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ background: placement.color }}
                />
              </div>
              <p className="text-white/60 text-sm mb-1">{placement.name}</p>
              <p className="text-xl font-bold text-white">{placement.impressions.toLocaleString()}</p>
              <p className="text-sm mt-1" style={{ color: placement.color }}>
                {((placement.clicks / placement.impressions) * 100).toFixed(1)}% CTR
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
