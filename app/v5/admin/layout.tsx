'use client'

import { useState, useEffect, ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Admin Layout - Super Admin Dashboard
 * 
 * Features:
 * - Password protection (env var check)
 * - Sidebar navigation with icons
 * - Dark theme consistent with app
 * - Desktop-first but mobile-friendly
 * - No bottom nav (separate from main app)
 */

// Simple password protection - in production use proper auth
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'darkside2026'

interface NavItem {
  href: string
  label: string
  icon: ReactNode
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/v5/admin',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    href: '/v5/admin/users',
    label: 'Users',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
  },
  {
    href: '/v5/admin/winners',
    label: 'Winners',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
  {
    href: '/v5/admin/sponsors',
    label: 'Sponsors',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    href: '/v5/admin/questions',
    label: 'Questions',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: '/v5/admin/campaigns',
    label: 'Campaigns',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
  },
  {
    href: '/v5/admin/prizes',
    label: 'Prizes',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>
    ),
  },
]

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('admin_authenticated', 'true')
      onLogin()
    } else {
      setError(true)
      setTimeout(() => setError(false), 2000)
    }
  }

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: 'linear-gradient(180deg, #000A14 0%, #001428 100%)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-4"
      >
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 
              className="text-3xl font-black uppercase tracking-wider"
              style={{ 
                fontFamily: 'var(--font-oswald), sans-serif',
                color: '#69BE28',
              }}
            >
              Admin Access
            </h1>
            <p className="text-sm text-white/50 mt-2">
              Dark Side Football Dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className={`
                  w-full px-4 py-3 rounded-xl
                  text-white placeholder-white/40
                  focus:outline-none focus:ring-2
                  transition-all duration-200
                  ${error ? 'ring-2 ring-red-500' : 'focus:ring-[#69BE28]/50'}
                `}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${error ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
                }}
                autoFocus
              />
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mt-2"
                >
                  Invalid password
                </motion.p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold uppercase tracking-wider transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #69BE28 0%, #4A8B1A 100%)',
                color: '#002244',
                fontFamily: 'var(--font-oswald), sans-serif',
              }}
            >
              Enter Dashboard
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              href="/v5" 
              className="text-sm text-white/40 hover:text-white/60 transition-colors"
            >
              ← Back to App
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function Sidebar({ sidebarOpen }: { sidebarOpen: boolean }) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        className={`
          fixed top-0 left-0 h-full w-[280px] z-50
          flex flex-col
          lg:translate-x-0 lg:static lg:z-auto
        `}
        style={{
          background: 'linear-gradient(180deg, #000A14 0%, #001020 100%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link href="/v5/admin" className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #69BE28 0%, #4A8B1A 100%)' }}
            >
              <svg className="w-6 h-6 text-[#002244]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h2 
                className="font-black uppercase tracking-wider"
                style={{ 
                  fontFamily: 'var(--font-oswald), sans-serif',
                  color: '#69BE28',
                  fontSize: '14px',
                }}
              >
                Dark Side
              </h2>
              <p className="text-xs text-white/50">Admin Dashboard</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = item.href === '/v5/admin' 
                ? pathname === '/v5/admin'
                : pathname.startsWith(item.href)
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl
                      transition-all duration-200
                      ${isActive 
                        ? 'bg-[#69BE28]/10 text-[#69BE28]' 
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-[#69BE28]"
                      />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <Link
            href="/v5"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white/60 hover:bg-white/5 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            <span className="font-medium">Back to App</span>
          </Link>
        </div>
      </motion.aside>
    </>
  )
}

function Header({ 
  sidebarOpen, 
  setSidebarOpen,
  onLogout,
}: { 
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  onLogout: () => void
}) {
  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6 h-16"
      style={{
        background: 'rgba(0, 10, 20, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex-1 lg:hidden" />

      {/* Search (desktop) */}
      <div className="hidden lg:flex items-center flex-1">
        <div className="relative w-full max-w-md">
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
            placeholder="Search users, campaigns..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#69BE28]/50"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Refresh */}
        <button 
          className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all"
          title="Refresh data"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        {/* Logout */}
        <button 
          onClick={onLogout}
          className="p-2 rounded-xl text-white/60 hover:text-red-400 hover:bg-white/5 transition-all"
          title="Logout"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  )
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    // Check if already authenticated
    const auth = localStorage.getItem('admin_authenticated')
    if (auth === 'true') {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated')
    setIsAuthenticated(false)
  }

  if (isLoading) {
    return (
      <div 
        className="fixed inset-0 flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #000A14 0%, #001428 100%)' }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-[#69BE28] border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={() => setIsAuthenticated(true)} />
  }

  return (
    <div 
      className="min-h-screen flex"
      style={{ background: 'linear-gradient(180deg, #000A14 0%, #001428 100%)' }}
    >
      <Sidebar sidebarOpen={sidebarOpen} />
      
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen}
          onLogout={handleLogout}
        />
        
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
