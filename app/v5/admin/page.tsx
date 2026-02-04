'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

/**
 * Admin Dashboard Overview
 * 
 * Key metrics:
 * - Total signups, PWA installs (% of signups)
 * - Games played, picks completed
 * - Entries in pool
 * - Charts/graphs and recent activity feed
 */

// Mock data - replace with real Supabase queries
const MOCK_METRICS = {
  signups: { total: 2847, today: 156, trend: +12.4 },
  installs: { total: 1823, rate: 64.0, ios: 892, android: 931 },
  engagement: { dau: 423, gamesPerUser: 3.2, picksRate: 67.5 },
  entries: { total: 12458, game: 8234, picks: 2847, live: 1127, share: 250 },
  sponsors: { impressions: 45230, clicks: 4523, ctr: 10.0 },
  revenue: { shopViews: 892, purchases: 34, amount: 1247.50 },
}

const MOCK_ACTIVITY = [
  { id: 1, type: 'signup', user: 'john@example.com', time: '2 min ago', detail: 'New registration' },
  { id: 2, type: 'game', user: 'sarah@test.com', time: '5 min ago', detail: 'Completed game: 450 score' },
  { id: 3, type: 'picks', user: 'mike@demo.com', time: '8 min ago', detail: 'Submitted 25 picks' },
  { id: 4, type: 'install', user: 'lisa@web.com', time: '12 min ago', detail: 'PWA installed (iOS)' },
  { id: 5, type: 'sponsor', user: 'james@mail.com', time: '15 min ago', detail: 'Clicked: KJR Radio' },
  { id: 6, type: 'share', user: 'anna@site.com', time: '18 min ago', detail: 'Shared app via Twitter' },
  { id: 7, type: 'live', user: 'tom@example.com', time: '22 min ago', detail: 'Answered Q4 question' },
  { id: 8, type: 'signup', user: 'emma@test.com', time: '25 min ago', detail: 'New registration' },
]

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: number
  icon: React.ReactNode
  color: string
}

function MetricCard({ title, value, subtitle, trend, icon, color }: MetricCardProps) {
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
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
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
        {subtitle && (
          <p className="text-white/40 text-sm mt-1">{subtitle}</p>
        )}
      </div>
    </motion.div>
  )
}

function SimpleBarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map(d => d.value))
  
  return (
    <div className="flex items-end justify-between gap-2 h-32">
      {data.map((item, index) => (
        <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(item.value / max) * 100}%` }}
            transition={{ delay: index * 0.05, duration: 0.5 }}
            className="w-full rounded-t-lg"
            style={{ background: `linear-gradient(180deg, ${color} 0%, ${color}80 100%)` }}
          />
          <span className="text-[10px] text-white/40 uppercase tracking-wider">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

function ActivityItem({ activity }: { activity: typeof MOCK_ACTIVITY[0] }) {
  const typeConfig = {
    signup: { color: '#69BE28', icon: '👤' },
    game: { color: '#F59E0B', icon: '🎮' },
    picks: { color: '#8B5CF6', icon: '📋' },
    install: { color: '#3B82F6', icon: '📱' },
    sponsor: { color: '#EC4899', icon: '🏢' },
    share: { color: '#06B6D4', icon: '🔗' },
    live: { color: '#EF4444', icon: '⚡' },
  }
  
  const config = typeConfig[activity.type as keyof typeof typeConfig] || { color: '#69BE28', icon: '•' }
  
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
        style={{ background: `${config.color}20` }}
      >
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white/80 text-sm truncate">{activity.user}</p>
        <p className="text-white/40 text-xs">{activity.detail}</p>
      </div>
      <span className="text-white/30 text-xs shrink-0">{activity.time}</span>
    </div>
  )
}

export default function AdminDashboard() {
  const [metrics] = useState(MOCK_METRICS)
  const [activity] = useState(MOCK_ACTIVITY)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      setLastRefresh(new Date())
      // TODO: Fetch real data from Supabase
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const weeklyData = [
    { label: 'Mon', value: 342 },
    { label: 'Tue', value: 478 },
    { label: 'Wed', value: 523 },
    { label: 'Thu', value: 389 },
    { label: 'Fri', value: 612 },
    { label: 'Sat', value: 845 },
    { label: 'Sun', value: 658 },
  ]

  const entryBreakdown = [
    { label: 'Game', value: metrics.entries.game },
    { label: 'Picks', value: metrics.entries.picks },
    { label: 'Live', value: metrics.entries.live },
    { label: 'Share', value: metrics.entries.share },
  ]

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
            Dashboard
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Real-time metrics overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/30 text-sm">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <button
            onClick={() => setLastRefresh(new Date())}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
            style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Signups"
          value={metrics.signups.total}
          subtitle={`+${metrics.signups.today} today`}
          trend={metrics.signups.trend}
          color="#69BE28"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />
        <MetricCard
          title="PWA Installs"
          value={metrics.installs.total}
          subtitle={`${metrics.installs.rate}% of signups`}
          color="#3B82F6"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          }
        />
        <MetricCard
          title="Games Played"
          value={metrics.engagement.gamesPerUser}
          subtitle="Avg games per user"
          color="#F59E0B"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <MetricCard
          title="Total Entries"
          value={metrics.entries.total}
          subtitle="In prize pool"
          trend={8.2}
          color="#8B5CF6"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          }
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="DAU"
          value={metrics.engagement.dau}
          subtitle="Daily active users"
          color="#06B6D4"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
        <MetricCard
          title="Picks Rate"
          value={`${metrics.engagement.picksRate}%`}
          subtitle="Users who completed picks"
          color="#EC4899"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <MetricCard
          title="Sponsor CTR"
          value={`${metrics.sponsors.ctr}%`}
          subtitle={`${metrics.sponsors.clicks.toLocaleString()} clicks`}
          color="#EF4444"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          }
        />
        <MetricCard
          title="Shop Revenue"
          value={`$${metrics.revenue.amount.toLocaleString()}`}
          subtitle={`${metrics.revenue.purchases} purchases`}
          color="#10B981"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Signups Chart */}
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
          <h3 className="text-white/80 font-medium mb-4">Weekly Signups</h3>
          <SimpleBarChart data={weeklyData} color="#69BE28" />
        </motion.div>

        {/* Entry Breakdown Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-1 rounded-2xl p-5"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <h3 className="text-white/80 font-medium mb-4">Entry Breakdown</h3>
          <SimpleBarChart data={entryBreakdown} color="#8B5CF6" />
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-1 rounded-2xl p-5"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/80 font-medium">Recent Activity</h3>
            <span className="text-xs text-white/30">Live</span>
          </div>
          <div className="max-h-[280px] overflow-y-auto">
            {activity.map(item => (
              <ActivityItem key={item.id} activity={item} />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Platform Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl p-5"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <h3 className="text-white/80 font-medium mb-4">Platform Installs</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
            <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center text-2xl">
              🍎
            </div>
            <div>
              <p className="text-white/40 text-sm">iOS</p>
              <p className="text-2xl font-bold text-white">{metrics.installs.ios.toLocaleString()}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[#3B82F6] font-medium">
                {Math.round((metrics.installs.ios / metrics.installs.total) * 100)}%
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
            <div className="w-12 h-12 rounded-xl bg-[#69BE28]/20 flex items-center justify-center text-2xl">
              🤖
            </div>
            <div>
              <p className="text-white/40 text-sm">Android</p>
              <p className="text-2xl font-bold text-white">{metrics.installs.android.toLocaleString()}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[#69BE28] font-medium">
                {Math.round((metrics.installs.android / metrics.installs.total) * 100)}%
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
