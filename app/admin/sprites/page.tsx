'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface SpriteInfo {
  key: string
  name: string
  description: string
  size: { width: number; height: number }
  frameCount?: number
}

interface GenerationJob {
  spriteKey: string
  generationId: string
  status: 'pending' | 'complete' | 'failed'
  images: Array<{ id: string; url: string }>
}

export default function SpritesAdminPage() {
  const [sprites, setSprites] = useState<SpriteInfo[]>([])
  const [jobs, setJobs] = useState<GenerationJob[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSprites()
  }, [])

  async function fetchSprites() {
    try {
      const response = await fetch('/api/sprites/generate')
      const data = await response.json()
      if (data.success) {
        setSprites(data.sprites)
      }
    } catch (err) {
      setError('Failed to fetch sprites')
    } finally {
      setLoading(false)
    }
  }

  async function generateSprite(spriteKey: string) {
    setGenerating(spriteKey)
    setError(null)

    try {
      const response = await fetch('/api/sprites/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spriteKey, numVariations: 2 }),
      })

      const data = await response.json()

      if (data.success) {
        const newJob: GenerationJob = {
          spriteKey,
          generationId: data.generationId,
          status: 'pending',
          images: [],
        }
        setJobs((prev) => [...prev, newJob])

        // Start polling for results
        pollForResults(data.generationId, spriteKey)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to start generation')
    } finally {
      setGenerating(null)
    }
  }

  async function pollForResults(generationId: string, spriteKey: string) {
    const maxAttempts = 30
    const interval = 3000

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((resolve) => setTimeout(resolve, interval))

      try {
        const response = await fetch(`/api/leonardo/status/${generationId}`)
        const data = await response.json()

        if (data.complete) {
          setJobs((prev) =>
            prev.map((job) =>
              job.generationId === generationId
                ? { ...job, status: 'complete', images: data.images }
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

  const defenderSprites = sprites.filter((s) => s.key.startsWith('defender'))
  const objectSprites = sprites.filter(
    (s) => !s.key.startsWith('defender') && !s.key.startsWith('powerup')
  )
  const powerupSprites = sprites.filter((s) => s.key.startsWith('powerup'))

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1F24] flex items-center justify-center">
        <div className="text-[#7ED957]">Loading sprites...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B1F24] text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#7ED957]">Sprite Generator</h1>
            <p className="text-gray-400 mt-1">
              Generate game assets using Leonardo.ai
            </p>
          </div>
          <Link
            href="/"
            className="text-gray-400 hover:text-white transition-colors"
          >
            Back to Game
          </Link>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Defender Sprites */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-[#0F6E6A] mb-4">
            Defender Sprites
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {defenderSprites.map((sprite) => (
              <SpriteCard
                key={sprite.key}
                sprite={sprite}
                generating={generating === sprite.key}
                onGenerate={() => generateSprite(sprite.key)}
                job={jobs.find((j) => j.spriteKey === sprite.key)}
              />
            ))}
          </div>
        </section>

        {/* Game Objects */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-[#0F6E6A] mb-4">Game Objects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {objectSprites.map((sprite) => (
              <SpriteCard
                key={sprite.key}
                sprite={sprite}
                generating={generating === sprite.key}
                onGenerate={() => generateSprite(sprite.key)}
                job={jobs.find((j) => j.spriteKey === sprite.key)}
              />
            ))}
          </div>
        </section>

        {/* Power-ups */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-[#0F6E6A] mb-4">Power-up Icons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {powerupSprites.map((sprite) => (
              <SpriteCard
                key={sprite.key}
                sprite={sprite}
                generating={generating === sprite.key}
                onGenerate={() => generateSprite(sprite.key)}
                job={jobs.find((j) => j.spriteKey === sprite.key)}
              />
            ))}
          </div>
        </section>

        {/* Generated Images */}
        {jobs.some((j) => j.images.length > 0) && (
          <section>
            <h2 className="text-xl font-bold text-[#0F6E6A] mb-4">
              Generated Assets
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {jobs
                .filter((j) => j.images.length > 0)
                .flatMap((job) =>
                  job.images.map((img) => (
                    <div
                      key={img.id}
                      className="bg-[#1a3d3d] rounded-lg p-4 border border-[#0F6E6A]"
                    >
                      <img
                        src={img.url}
                        alt={job.spriteKey}
                        className="w-full aspect-square object-contain bg-black/50 rounded mb-2"
                      />
                      <p className="text-xs text-gray-400 truncate">{job.spriteKey}</p>
                      <a
                        href={img.url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#7ED957] hover:underline"
                      >
                        Download
                      </a>
                    </div>
                  ))
                )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function SpriteCard({
  sprite,
  generating,
  onGenerate,
  job,
}: {
  sprite: SpriteInfo
  generating: boolean
  onGenerate: () => void
  job?: GenerationJob
}) {
  return (
    <div className="bg-[#1a3d3d] rounded-lg p-4 border border-[#0F6E6A]/50">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-bold text-white">{sprite.name}</h3>
        <span className="text-xs text-gray-500">
          {sprite.size.width}x{sprite.size.height}
        </span>
      </div>
      <p className="text-sm text-gray-400 mb-4">{sprite.description}</p>
      {sprite.frameCount && sprite.frameCount > 1 && (
        <p className="text-xs text-[#7ED957] mb-2">
          Animation: {sprite.frameCount} frames
        </p>
      )}

      {job?.status === 'pending' && (
        <div className="flex items-center gap-2 text-yellow-400 text-sm mb-2">
          <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          Generating...
        </div>
      )}

      {job?.status === 'complete' && (
        <div className="text-green-400 text-sm mb-2">
          Generated {job.images.length} image(s)
        </div>
      )}

      {job?.status === 'failed' && (
        <div className="text-red-400 text-sm mb-2">Generation failed</div>
      )}

      <button
        onClick={onGenerate}
        disabled={generating || job?.status === 'pending'}
        className="w-full bg-[#0F6E6A] hover:bg-[#7ED957] disabled:bg-gray-600 disabled:cursor-not-allowed text-white hover:text-[#0B1F24] font-medium py-2 px-4 rounded transition-colors text-sm"
      >
        {generating ? 'Starting...' : 'Generate'}
      </button>
    </div>
  )
}
