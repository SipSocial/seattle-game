'use client'

import { useState, useEffect } from 'react'

interface Team {
  id: number
  teamName: string
  abbreviation: string
  primaryColor: string
  accentColor: string
  jerseyColor: string
  currentHelmetImage: string
}

interface Generation {
  team: string
  abbreviation: string
  generationId: string
  status?: 'PENDING' | 'COMPLETE' | 'FAILED'
  images?: string[]
}

export default function HelmetPreviewPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [pollingActive, setPollingActive] = useState(false)

  // Load teams on mount
  useEffect(() => {
    loadTeams()
  }, [])

  // Poll for generation status
  useEffect(() => {
    if (!pollingActive || generations.length === 0) return

    const interval = setInterval(async () => {
      const pending = generations.filter(g => g.status === 'PENDING' || !g.status)
      if (pending.length === 0) {
        setPollingActive(false)
        return
      }

      // Check status for each pending generation
      const updated = await Promise.all(
        generations.map(async (gen) => {
          if (gen.status === 'COMPLETE' || gen.status === 'FAILED') return gen

          try {
            const res = await fetch(`/api/leonardo/status/${gen.generationId}`)
            const data = await res.json()
            
            if (data.status === 'COMPLETE') {
              return {
                ...gen,
                status: 'COMPLETE' as const,
                images: data.images || [],
              }
            } else if (data.status === 'FAILED') {
              return { ...gen, status: 'FAILED' as const }
            }
          } catch (e) {
            console.error('Status check failed:', e)
          }
          return gen
        })
      )

      setGenerations(updated)
    }, 3000)

    return () => clearInterval(interval)
  }, [pollingActive, generations])

  const loadTeams = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/helmets/generate')
      const data = await res.json()
      if (data.success) {
        setTeams(data.teams)
      }
    } catch (e) {
      console.error('Failed to load teams:', e)
    }
    setLoading(false)
  }

  const generateAllHelmets = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/helmets/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      
      if (data.success) {
        setGenerations(data.generations.map((g: Generation) => ({
          ...g,
          status: 'PENDING',
        })))
        setPollingActive(true)
      }
    } catch (e) {
      console.error('Generation failed:', e)
    }
    setGenerating(false)
  }

  const generateSingleHelmet = async (teamId: number) => {
    setGenerating(true)
    try {
      const res = await fetch('/api/helmets/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId }),
      })
      const data = await res.json()
      
      if (data.success && data.generations.length > 0) {
        setGenerations(prev => [
          ...prev.filter(g => g.abbreviation !== data.generations[0].abbreviation),
          { ...data.generations[0], status: 'PENDING' },
        ])
        setPollingActive(true)
      }
    } catch (e) {
      console.error('Generation failed:', e)
    }
    setGenerating(false)
  }

  const completedCount = generations.filter(g => g.status === 'COMPLETE').length
  const pendingCount = generations.filter(g => g.status === 'PENDING' || !g.status).length

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a1628] to-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            NFL Helmet Generator
          </h1>
          <p className="text-white/60">
            Generate photo-realistic opponent helmets using Leonardo AI
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-white/80 mb-1">
                {teams.length} unique teams in schedule
              </p>
              {generations.length > 0 && (
                <p className="text-sm text-white/50">
                  {completedCount} complete, {pendingCount} pending
                </p>
              )}
            </div>
            
            <button
              onClick={generateAllHelmets}
              disabled={generating || pollingActive}
              className="px-6 py-3 bg-gradient-to-r from-[#69BE28] to-[#4a9c1c] 
                       text-white font-bold rounded-xl shadow-lg shadow-green-500/30
                       hover:shadow-green-500/50 transition-all disabled:opacity-50"
            >
              {generating ? 'Starting...' : pollingActive ? 'Generating...' : 'Generate All Helmets'}
            </button>
          </div>

          {/* Progress bar */}
          {generations.length > 0 && (
            <div className="mt-4">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#69BE28] to-[#4a9c1c] transition-all"
                  style={{ width: `${(completedCount / generations.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teams.map((team) => {
            const gen = generations.find(g => g.abbreviation === team.abbreviation)
            
            return (
              <div 
                key={team.abbreviation}
                className="bg-white/5 rounded-2xl overflow-hidden border border-white/10
                         hover:border-[#69BE28]/50 transition-all group"
              >
                {/* Team header */}
                <div 
                  className="p-4 flex items-center gap-3"
                  style={{ 
                    background: `linear-gradient(135deg, #${team.primaryColor}40 0%, transparent 100%)` 
                  }}
                >
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg"
                    style={{ 
                      backgroundColor: `#${team.primaryColor}`,
                      color: parseInt(team.primaryColor, 16) > 0x888888 ? '#000' : '#fff'
                    }}
                  >
                    {team.abbreviation}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">{team.teamName}</h3>
                    <p className="text-white/50 text-xs">#{team.primaryColor}</p>
                  </div>
                </div>

                {/* Generated images or placeholder */}
                <div className="p-4">
                  {gen?.status === 'COMPLETE' && gen.images && gen.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {gen.images.map((url, i) => (
                        <img 
                          key={i}
                          src={url}
                          alt={`${team.teamName} helmet ${i + 1}`}
                          className="w-full aspect-square object-cover rounded-lg 
                                   cursor-pointer hover:scale-105 transition-transform
                                   border-2 border-transparent hover:border-[#69BE28]"
                          onClick={() => setSelectedTeam(url)}
                        />
                      ))}
                    </div>
                  ) : gen?.status === 'PENDING' ? (
                    <div className="aspect-square flex items-center justify-center bg-white/5 rounded-lg">
                      <div className="text-center">
                        <div className="animate-spin w-8 h-8 border-2 border-[#69BE28] border-t-transparent rounded-full mx-auto mb-2" />
                        <p className="text-white/50 text-sm">Generating...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-square flex items-center justify-center bg-white/5 rounded-lg">
                      <button
                        onClick={() => generateSingleHelmet(team.id)}
                        disabled={generating}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 
                                 text-white text-sm rounded-lg transition-all"
                      >
                        Generate
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Fullscreen preview modal */}
        {selectedTeam && (
          <div 
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-8"
            onClick={() => setSelectedTeam(null)}
          >
            <img 
              src={selectedTeam}
              alt="Helmet preview"
              className="max-w-full max-h-full object-contain rounded-2xl"
            />
            <button 
              className="absolute top-8 right-8 text-white/50 hover:text-white text-4xl"
              onClick={() => setSelectedTeam(null)}
            >
              &times;
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
