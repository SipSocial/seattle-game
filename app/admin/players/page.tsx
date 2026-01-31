'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Player {
  id: string
  jersey: number
  name: string
  position: string
  positionGroup: string
  type: 'defender' | 'offense'
  isStarter: boolean
  stats?: Record<string, number>
}

interface GeneratedImage {
  id: string
  url: string
  selected?: boolean
}

interface GenerationJob {
  playerId: string
  playerName: string
  style: string
  generationId: string
  status: 'pending' | 'complete' | 'failed'
  images: GeneratedImage[]
}

interface SelectedSprite {
  playerId: string
  playerName: string
  style: string
  imageUrl: string
  imageId: string
  selectedAt: string
}

interface ReferenceImage {
  playerId: string
  url: string
}

export default function PlayerSpritesPage() {
  const [defenders, setDefenders] = useState<Player[]>([])
  const [offense, setOffense] = useState<Player[]>([])
  const [jobs, setJobs] = useState<GenerationJob[]>([])
  const [selections, setSelections] = useState<SelectedSprite[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'defenders' | 'offense'>('defenders')
  const [selectedStyle, setSelectedStyle] = useState<'card' | 'sprite' | 'action' | 'fullscreen'>('fullscreen')
  const [batchGenerating, setBatchGenerating] = useState(false)
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([])
  const [useReferences, setUseReferences] = useState(true)

  useEffect(() => {
    fetchPlayers()
    loadSelections()
  }, [])

  async function fetchPlayers() {
    try {
      const response = await fetch('/api/players/generate')
      const data = await response.json()
      if (data.success) {
        setDefenders(data.defenders)
        setOffense(data.offense)
      }
    } catch (err) {
      setError('Failed to fetch players')
    } finally {
      setLoading(false)
    }
  }

  function loadSelections() {
    const saved = localStorage.getItem('playerSpriteSelections')
    if (saved) {
      setSelections(JSON.parse(saved))
    }
  }

  function saveSelection(playerId: string, playerName: string, style: string, imageUrl: string, imageId: string) {
    const newSelection: SelectedSprite = {
      playerId,
      playerName,
      style,
      imageUrl,
      imageId,
      selectedAt: new Date().toISOString()
    }
    
    // Replace existing selection for this player+style
    const updated = selections.filter(s => !(s.playerId === playerId && s.style === style))
    updated.push(newSelection)
    setSelections(updated)
    localStorage.setItem('playerSpriteSelections', JSON.stringify(updated))
  }

  function setReferenceImage(playerId: string, url: string) {
    const updated = referenceImages.filter(r => r.playerId !== playerId)
    if (url) {
      updated.push({ playerId, url })
    }
    setReferenceImages(updated)
    localStorage.setItem('playerReferenceImages', JSON.stringify(updated))
  }

  function getReferenceImage(playerId: string): string | undefined {
    return referenceImages.find(r => r.playerId === playerId)?.url
  }

  // Load saved reference images on mount
  useEffect(() => {
    const saved = localStorage.getItem('playerReferenceImages')
    if (saved) {
      setReferenceImages(JSON.parse(saved))
    }
  }, [])

  async function generatePlayer(player: Player, forceWithoutRef = false) {
    setGenerating(player.id)
    setError(null)

    const referenceUrl = getReferenceImage(player.id)
    const shouldUseReference = useReferences && referenceUrl && !forceWithoutRef

    try {
      let response: Response
      
      if (shouldUseReference) {
        // Use the new reference-based generation
        response = await fetch('/api/players/generate-with-reference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            jersey: player.jersey,
            referenceImageUrl: referenceUrl,
            style: selectedStyle,
            numImages: 4 
          }),
        })
      } else {
        // Use the standard generation
        response = await fetch('/api/players/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            playerId: player.id, 
            style: selectedStyle,
            numVariations: 4 
          }),
        })
      }

      const data = await response.json()

      if (data.success || data.generationId) {
        const newJob: GenerationJob = {
          playerId: player.id,
          playerName: data.playerName || player.name,
          style: selectedStyle,
          generationId: data.generationId,
          status: 'pending',
          images: [],
        }
        setJobs((prev) => [...prev.filter(j => j.playerId !== player.id || j.style !== selectedStyle), newJob])

        // Start polling for results
        pollForResults(data.generationId, player.id)
      } else {
        setError(data.error || 'Generation failed')
      }
    } catch (err) {
      setError('Failed to start generation')
    } finally {
      setGenerating(null)
    }
  }

  async function pollForResults(generationId: string, playerId: string) {
    const maxAttempts = 60
    const interval = 3000

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((resolve) => setTimeout(resolve, interval))

      try {
        const response = await fetch(`/api/leonardo/status/${generationId}`)
        const data = await response.json()
        console.log(`Poll ${i + 1}: Status=${data.status}, Images=${data.images?.length || 0}`)

        if (data.complete) {
          console.log('Generation complete! Images:', data.images)
          setJobs((prev) =>
            prev.map((job) =>
              job.generationId === generationId
                ? { ...job, status: 'complete', images: data.images.map((img: { id: string; url: string }) => ({ ...img, selected: false })) }
                : job
            )
          )
          return
        }
      } catch (err) {
        console.error('Polling error:', err)
      }
    }

    // Timeout
    setJobs((prev) =>
      prev.map((job) =>
        job.generationId === generationId ? { ...job, status: 'failed' } : job
      )
    )
  }

  function getJobForPlayer(playerId: string, style: string) {
    return jobs.find(j => j.playerId === playerId && j.style === style)
  }

  function getSelectionForPlayer(playerId: string, style: string) {
    return selections.find(s => s.playerId === playerId && s.style === style)
  }

  const players = activeTab === 'defenders' ? defenders : offense

  if (loading) {
    return (
      <div className="min-h-screen bg-[#002244] flex items-center justify-center">
        <div className="text-[#69BE28] text-xl">Loading players...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#002244] text-white">
      {/* Header */}
      <header className="bg-[#001a33] border-b border-[#69BE28]/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#69BE28]">Player Sprite Generator</h1>
            <p className="text-gray-400 text-sm">Generate 3D Madden-style player renders</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              {selections.length} sprites selected
            </span>
            <Link
              href="/"
              className="bg-[#69BE28] text-[#002244] px-4 py-2 rounded font-bold hover:bg-[#7ed957] transition"
            >
              Back to Game
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
            {error}
            <button onClick={() => setError(null)} className="ml-4 underline">Dismiss</button>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-8">
          {/* Tab Switcher */}
          <div className="flex bg-[#001a33] rounded-lg p-1">
            <button
              onClick={() => setActiveTab('defenders')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                activeTab === 'defenders'
                  ? 'bg-[#69BE28] text-[#002244]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Defense ({defenders.length})
            </button>
            <button
              onClick={() => setActiveTab('offense')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                activeTab === 'offense'
                  ? 'bg-[#69BE28] text-[#002244]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Offense ({offense.length})
            </button>
          </div>

          {/* Style Selector */}
          <div className="flex bg-[#001a33] rounded-lg p-1">
            {(['fullscreen', 'card', 'sprite', 'action'] as const).map((style) => (
              <button
                key={style}
                onClick={() => setSelectedStyle(style)}
                className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                  selectedStyle === style
                    ? 'bg-[#69BE28] text-[#002244]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {style === 'fullscreen' ? 'Fullscreen (Mobile)' : style === 'card' ? 'Player Card' : style === 'sprite' ? 'Game Sprite' : 'Action Shot'}
              </button>
            ))}
          </div>
          
          {/* Reference Toggle */}
          <label className="flex items-center gap-2 bg-[#001a33] px-4 py-2 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={useReferences}
              onChange={(e) => setUseReferences(e.target.checked)}
              className="w-4 h-4 accent-[#69BE28]"
            />
            <span className="text-sm">Use Reference Photos</span>
          </label>
          
          {/* Batch Generate Button */}
          <button
            onClick={async () => {
              if (batchGenerating) return
              setBatchGenerating(true)
              const starters = players.filter(p => p.isStarter)
              for (const player of starters) {
                const existingSelection = getSelectionForPlayer(player.id, selectedStyle)
                if (!existingSelection) {
                  await generatePlayer(player)
                  // Wait a bit between requests to avoid rate limiting
                  await new Promise(r => setTimeout(r, 2000))
                }
              }
              setBatchGenerating(false)
            }}
            disabled={batchGenerating}
            className="bg-[#69BE28] hover:bg-[#7ed957] disabled:bg-gray-600 text-[#002244] font-bold px-6 py-2 rounded-lg transition"
          >
            {batchGenerating ? 'Generating All...' : `Generate All Starters (${players.filter(p => p.isStarter && !getSelectionForPlayer(p.id, selectedStyle)).length} remaining)`}
          </button>
        </div>

        {/* Player Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {players.map((player) => {
            const job = getJobForPlayer(player.id, selectedStyle)
            const selection = getSelectionForPlayer(player.id, selectedStyle)
            const refImage = getReferenceImage(player.id)
            
            return (
              <PlayerCard
                key={player.id}
                player={player}
                style={selectedStyle}
                job={job}
                selection={selection}
                generating={generating === player.id}
                onGenerate={() => generatePlayer(player)}
                onGenerateWithoutRef={() => generatePlayer(player, true)}
                onSelect={(imageUrl, imageId) => saveSelection(player.id, player.name, selectedStyle, imageUrl, imageId)}
                referenceImageUrl={refImage}
                onReferenceChange={(url) => setReferenceImage(player.id, url)}
                useReferences={useReferences}
              />
            )
          })}
        </div>

        {/* Selected Sprites Summary */}
        {selections.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-[#69BE28] mb-4">Selected Sprites ({selections.length})</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {selections.map((sel) => (
                <div key={`${sel.playerId}-${sel.style}`} className="bg-[#001a33] rounded-lg p-3 border border-[#69BE28]/30">
                  <img
                    src={sel.imageUrl}
                    alt={sel.playerName}
                    className="w-full aspect-square object-cover rounded mb-2"
                  />
                  <p className="text-sm font-medium truncate">{sel.playerName}</p>
                  <p className="text-xs text-gray-400 capitalize">{sel.style}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(selections, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'selected-sprites.json'
                a.click()
              }}
              className="mt-4 bg-[#69BE28] text-[#002244] px-6 py-2 rounded font-bold hover:bg-[#7ed957] transition"
            >
              Export Selections
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function PlayerCard({
  player,
  style,
  job,
  selection,
  generating,
  onGenerate,
  onGenerateWithoutRef,
  onSelect,
  referenceImageUrl,
  onReferenceChange,
  useReferences,
}: {
  player: Player
  style: string
  job?: GenerationJob
  selection?: SelectedSprite
  generating: boolean
  onGenerate: () => void
  onGenerateWithoutRef: () => void
  onSelect: (imageUrl: string, imageId: string) => void
  referenceImageUrl?: string
  onReferenceChange: (url: string) => void
  useReferences: boolean
}) {
  const [refInput, setRefInput] = useState(referenceImageUrl || '')
  
  const positionColors: Record<string, string> = {
    DL: 'bg-red-600',
    LB: 'bg-teal-600',
    DB: 'bg-yellow-600',
    QB: 'bg-green-600',
    SKILL: 'bg-blue-600',
    OL: 'bg-gray-600',
  }
  
  const hasReference = !!referenceImageUrl

  return (
    <div className="bg-[#001a33] rounded-xl overflow-hidden border border-[#69BE28]/20 hover:border-[#69BE28]/50 transition">
      {/* Player Header */}
      <div className="p-4 border-b border-[#69BE28]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-black text-[#69BE28]">#{player.jersey}</div>
            <div>
              <h3 className="font-bold text-lg">{player.name}</h3>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded ${positionColors[player.positionGroup] || 'bg-gray-600'}`}>
                  {player.position}
                </span>
                {player.isStarter && (
                  <span className="text-xs text-[#69BE28]">Starter</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        {player.stats && (
          <div className="flex gap-3 mt-3 text-xs text-gray-400">
            {Object.entries(player.stats).map(([key, value]) => (
              <span key={key}>
                {key.replace(/([A-Z])/g, ' $1').trim()}: <span className="text-white">{value}</span>
              </span>
            ))}
          </div>
        )}
        
        {/* Reference Image Input */}
        {useReferences && (
          <div className="mt-3 space-y-2">
            <label className="text-xs text-gray-400 block">
              Reference Photo URL {hasReference && <span className="text-[#69BE28]">✓</span>}
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={refInput}
                onChange={(e) => setRefInput(e.target.value)}
                onBlur={() => onReferenceChange(refInput)}
                placeholder="https://seahawks.com/.../player.jpg"
                className="flex-1 bg-[#002244] border border-gray-600 rounded px-2 py-1 text-xs text-white placeholder-gray-500 focus:border-[#69BE28] focus:outline-none"
              />
              {refInput && (
                <button
                  onClick={() => {
                    setRefInput('')
                    onReferenceChange('')
                  }}
                  className="text-red-400 hover:text-red-300 text-xs px-2"
                >
                  Clear
                </button>
              )}
            </div>
            {hasReference && (
              <div className="mt-2">
                <img
                  src={referenceImageUrl}
                  alt="Reference"
                  className="w-16 h-16 object-cover rounded border border-[#69BE28]/50"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Generation Status */}
      <div className="p-4">
        {!job && !selection && (
          <div className="space-y-2">
            <button
              onClick={onGenerate}
              disabled={generating}
              className={`w-full ${
                useReferences && hasReference 
                  ? 'bg-gradient-to-r from-[#69BE28] to-teal-500' 
                  : 'bg-[#69BE28]'
              } hover:brightness-110 disabled:bg-gray-600 disabled:cursor-not-allowed text-[#002244] font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2`}
            >
              {generating ? (
                <>
                  <div className="w-5 h-5 border-2 border-[#002244] border-t-transparent rounded-full animate-spin" />
                  {useReferences && hasReference ? 'Uploading & Generating...' : 'Starting...'}
                </>
              ) : (
                <>
                  {useReferences && hasReference ? (
                    <>🎯 Generate with Reference</>
                  ) : (
                    <>Generate {style.charAt(0).toUpperCase() + style.slice(1)}</>
                  )}
                </>
              )}
            </button>
            {useReferences && hasReference && (
              <button
                onClick={onGenerateWithoutRef}
                disabled={generating}
                className="w-full text-gray-400 hover:text-white text-xs py-1 transition"
              >
                or generate without reference
              </button>
            )}
          </div>
        )}

        {job?.status === 'pending' && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-12 h-12 border-4 border-[#69BE28] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-[#69BE28] font-medium">Generating variations...</p>
            <p className="text-gray-400 text-sm">This may take 30-60 seconds</p>
            <p className="text-gray-500 text-xs mt-2 font-mono">ID: {job.generationId}</p>
            <a 
              href={`https://app.leonardo.ai/generations/${job.generationId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#69BE28] text-xs underline mt-1 hover:text-[#7ed957]"
            >
              View on Leonardo →
            </a>
          </div>
        )}

        {job?.status === 'failed' && (
          <div className="text-center py-4">
            <p className="text-red-400 mb-2">Generation failed</p>
            <button
              onClick={onGenerate}
              className="text-[#69BE28] underline hover:text-[#7ed957]"
            >
              Try again
            </button>
          </div>
        )}

        {job?.status === 'complete' && job.images.length > 0 && (
          <div>
            <p className="text-sm text-gray-400 mb-3">Select your preferred version:</p>
            <div className="grid grid-cols-2 gap-2">
              {job.images.map((img, idx) => {
                const isSelected = selection?.imageId === img.id
                return (
                  <div key={img.id} className="relative">
                    <button
                      onClick={() => onSelect(img.url, img.id)}
                      className={`w-full relative rounded-lg overflow-hidden border-2 transition ${
                        isSelected
                          ? 'border-[#69BE28] ring-2 ring-[#69BE28]/50'
                          : 'border-transparent hover:border-gray-500'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`${player.name} variation ${idx + 1}`}
                        className="w-full aspect-square object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23333" width="100" height="100"/><text x="50%" y="50%" fill="%23999" text-anchor="middle" dy=".3em" font-size="12">Error</text></svg>'
                        }}
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#69BE28]/20 flex items-center justify-center">
                          <div className="bg-[#69BE28] text-[#002244] px-2 py-1 rounded text-xs font-bold">
                            SELECTED
                          </div>
                        </div>
                      )}
                    </button>
                    <a
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded hover:bg-black"
                    >
                      Open
                    </a>
                  </div>
                )
              })}
            </div>
            <a 
              href={`https://app.leonardo.ai/generations/${job.generationId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-[#69BE28] text-xs underline mt-3 hover:text-[#7ed957]"
            >
              View all on Leonardo →
            </a>
          </div>
        )}
        
        {job?.status === 'complete' && job.images.length === 0 && (
          <div className="text-center py-4">
            <p className="text-yellow-400 mb-2">No images returned</p>
            <a 
              href={`https://app.leonardo.ai/generations/${job.generationId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#69BE28] underline text-sm hover:text-[#7ed957]"
            >
              Check on Leonardo directly →
            </a>
            <button
              onClick={onGenerate}
              className="block mx-auto mt-2 text-gray-400 underline hover:text-white text-sm"
            >
              Try again
            </button>
          </div>
        )}

        {/* Show current selection if no job running */}
        {selection && !job && (
          <div>
            <p className="text-sm text-gray-400 mb-2">Current selection:</p>
            <div className="relative">
              <img
                src={selection.imageUrl}
                alt={player.name}
                className="w-full rounded-lg border-2 border-[#69BE28]"
              />
              <button
                onClick={onGenerate}
                className="absolute bottom-2 right-2 bg-[#002244]/80 text-[#69BE28] px-3 py-1 rounded text-sm hover:bg-[#002244] transition"
              >
                Regenerate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
