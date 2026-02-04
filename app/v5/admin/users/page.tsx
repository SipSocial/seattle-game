'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * User Management Page
 * 
 * Features:
 * - Paginated user table
 * - Search and filter
 * - Export CSV
 * - User details modal
 */

// Mock data - replace with Supabase queries
const MOCK_USERS = Array.from({ length: 150 }, (_, i) => ({
  id: `user_${i + 1}`,
  email: `user${i + 1}@example.com`,
  name: ['John Smith', 'Sarah Johnson', 'Mike Williams', 'Lisa Brown', 'James Davis', 'Emma Wilson', 'Tom Miller', 'Anna Taylor'][i % 8],
  entries: Math.floor(Math.random() * 50) + 1,
  gamesPlayed: Math.floor(Math.random() * 20),
  picksCompleted: Math.random() > 0.3,
  pwaInstalled: Math.random() > 0.4,
  createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  status: Math.random() > 0.05 ? 'active' : 'inactive',
}))

type SortField = 'email' | 'name' | 'entries' | 'createdAt' | 'status'
type SortDir = 'asc' | 'desc'

interface User {
  id: string
  email: string
  name: string
  entries: number
  gamesPlayed: number
  picksCompleted: boolean
  pwaInstalled: boolean
  createdAt: string
  status: string
}

export default function UsersPage() {
  const [users] = useState<User[]>(MOCK_USERS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [pwaFilter, setPwaFilter] = useState<'all' | 'installed' | 'not_installed'>('all')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const perPage = 20

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let result = [...users]
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(u => 
        u.email.toLowerCase().includes(searchLower) || 
        u.name.toLowerCase().includes(searchLower)
      )
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(u => u.status === statusFilter)
    }
    
    // PWA filter
    if (pwaFilter === 'installed') {
      result = result.filter(u => u.pwaInstalled)
    } else if (pwaFilter === 'not_installed') {
      result = result.filter(u => !u.pwaInstalled)
    }
    
    // Sort
    result.sort((a, b) => {
      let aVal: string | number = a[sortField]
      let bVal: string | number = b[sortField]
      
      if (typeof aVal === 'string') aVal = aVal.toLowerCase()
      if (typeof bVal === 'string') bVal = bVal.toLowerCase()
      
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    
    return result
  }, [users, search, statusFilter, pwaFilter, sortField, sortDir])

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / perPage)
  const paginatedUsers = filteredUsers.slice((page - 1) * perPage, page * perPage)

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  // Export CSV
  const exportCSV = () => {
    const headers = ['Email', 'Name', 'Entries', 'Games Played', 'Picks Completed', 'PWA Installed', 'Created At', 'Status']
    const rows = filteredUsers.map(u => [
      u.email,
      u.name,
      u.entries.toString(),
      u.gamesPlayed.toString(),
      u.picksCompleted ? 'Yes' : 'No',
      u.pwaInstalled ? 'Yes' : 'No',
      new Date(u.createdAt).toLocaleDateString(),
      u.status,
    ])
    
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Sort indicator
  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return (
      <svg 
        className={`w-4 h-4 ml-1 inline transition-transform ${sortDir === 'desc' ? 'rotate-180' : ''}`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    )
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
            Users
          </h1>
          <p className="text-white/50 text-sm mt-1">
            {filteredUsers.length.toLocaleString()} total users
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 self-start sm:self-auto"
          style={{ 
            background: 'linear-gradient(135deg, #69BE28 0%, #4A8B1A 100%)',
            color: '#002244',
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <svg 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by email or name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#69BE28]/50"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1) }}
          className="px-4 py-2 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#69BE28]/50 cursor-pointer"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* PWA Filter */}
        <select
          value={pwaFilter}
          onChange={(e) => { setPwaFilter(e.target.value as typeof pwaFilter); setPage(1) }}
          className="px-4 py-2 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#69BE28]/50 cursor-pointer"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <option value="all">All PWA</option>
          <option value="installed">Installed</option>
          <option value="not_installed">Not Installed</option>
        </select>
      </div>

      {/* Table */}
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
                <th 
                  className="px-4 py-3 text-left text-sm font-medium text-white/50 uppercase tracking-wider cursor-pointer hover:text-white/80 transition-colors"
                  onClick={() => handleSort('email')}
                >
                  Email <SortIndicator field="email" />
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-medium text-white/50 uppercase tracking-wider cursor-pointer hover:text-white/80 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  Name <SortIndicator field="name" />
                </th>
                <th 
                  className="px-4 py-3 text-center text-sm font-medium text-white/50 uppercase tracking-wider cursor-pointer hover:text-white/80 transition-colors"
                  onClick={() => handleSort('entries')}
                >
                  Entries <SortIndicator field="entries" />
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-white/50 uppercase tracking-wider">
                  PWA
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-medium text-white/50 uppercase tracking-wider cursor-pointer hover:text-white/80 transition-colors"
                  onClick={() => handleSort('createdAt')}
                >
                  Created <SortIndicator field="createdAt" />
                </th>
                <th 
                  className="px-4 py-3 text-center text-sm font-medium text-white/50 uppercase tracking-wider cursor-pointer hover:text-white/80 transition-colors"
                  onClick={() => handleSort('status')}
                >
                  Status <SortIndicator field="status" />
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-white/50 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3 text-white/80 text-sm">{user.email}</td>
                  <td className="px-4 py-3 text-white text-sm font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-center">
                    <span 
                      className="text-sm font-bold"
                      style={{ color: '#69BE28' }}
                    >
                      {user.entries}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {user.pwaInstalled ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">
                        ✓ Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white/10 text-white/40">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white/50 text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      user.status === 'active' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
          <p className="text-white/50 text-sm">
            Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, filteredUsers.length)} of {filteredUsers.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-white/50 text-sm">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl p-6"
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
                  User Details
                </h2>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider">Email</label>
                  <p className="text-white mt-1">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider">Name</label>
                  <p className="text-white mt-1">{selectedUser.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/40 text-xs uppercase tracking-wider">Entries</label>
                    <p className="text-2xl font-bold text-[#69BE28] mt-1">{selectedUser.entries}</p>
                  </div>
                  <div>
                    <label className="text-white/40 text-xs uppercase tracking-wider">Games Played</label>
                    <p className="text-2xl font-bold text-white mt-1">{selectedUser.gamesPlayed}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/40 text-xs uppercase tracking-wider">PWA Installed</label>
                    <p className={`mt-1 ${selectedUser.pwaInstalled ? 'text-blue-400' : 'text-white/50'}`}>
                      {selectedUser.pwaInstalled ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div>
                    <label className="text-white/40 text-xs uppercase tracking-wider">Picks Completed</label>
                    <p className={`mt-1 ${selectedUser.picksCompleted ? 'text-green-400' : 'text-white/50'}`}>
                      {selectedUser.picksCompleted ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider">Created At</label>
                  <p className="text-white/70 mt-1">
                    {new Date(selectedUser.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider">Status</label>
                  <p className={`mt-1 ${selectedUser.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedUser.status}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
