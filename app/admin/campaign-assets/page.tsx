'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { VideoBackground } from '@/components/ui/VideoBackground'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { GhostButton } from '@/components/ui/GhostButton'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { 
  CAMPAIGN_CITIES, 
  MAP_PROMPTS, 
  PLACEHOLDER_ASSETS,
  CityAsset 
} from '@/src/game/data/campaignAssets'

// Background
const BG_VIDEO = PLACEHOLDER_ASSETS.mapVideo
const BG_POSTER = PLACEHOLDER_ASSETS.mapPoster

type AssetCategory = 'map' | 'airplane' | 'cities'
type GenerationStatus = 'idle' | 'generating' | 'polling' | 'complete' | 'error'

interface GeneratedImage {
  url: string
  selected: boolean
}

interface GenerationState {
  status: GenerationStatus
  generationId: string | null
  images: GeneratedImage[]
  error: string | null
}

export default function CampaignAssetsPage() {
  const [activeCategory, setActiveCategory] = useState<AssetCategory>('map')
  const [selectedCity, setSelectedCity] = useState<CityAsset | null>(null)
  
  // Generation states
  const [mapGen, setMapGen] = useState<GenerationState>({
    status: 'idle', generationId: null, images: [], error: null
  })
  const [airplaneGen, setAirplaneGen] = useState<GenerationState>({
    status: 'idle', generationId: null, images: [], error: null
  })
  const [cityGens, setCityGens] = useState<Record<number, GenerationState>>({})
  
  // Custom prompts
  const [mapPrompt, setMapPrompt] = useState(MAP_PROMPTS.usMap)
  const [airplanePrompt, setAirplanePrompt] = useState(MAP_PROMPTS.seahawksPlane)

  // Generate image via API
  const generateImage = useCallback(async (
    prompt: string,
    width: number,
    height: number,
    numImages: number = 4
  ): Promise<string> => {
    const response = await fetch('/api/leonardo/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, width, height, numImages }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to start generation')
    }
    
    const data = await response.json()
    return data.generationId
  }, [])

  // Poll for generation status
  const pollGeneration = useCallback(async (generationId: string): Promise<string[]> => {
    const maxAttempts = 30
    const intervalMs = 2000
    
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(r => setTimeout(r, intervalMs))
      
      const response = await fetch(`/api/leonardo/status/${generationId}`)
      if (!response.ok) continue
      
      const data = await response.json()
      
      if (data.status === 'COMPLETE' && data.images?.length > 0) {
        return data.images.map((img: { url: string }) => img.url)
      }
      
      if (data.status === 'FAILED') {
        throw new Error('Generation failed')
      }
    }
    
    throw new Error('Generation timed out')
  }, [])

  // Handle map generation
  const handleGenerateMap = useCallback(async () => {
    setMapGen({ status: 'generating', generationId: null, images: [], error: null })
    
    try {
      const genId = await generateImage(mapPrompt, 1024, 576, 4) // 16:9 aspect
      setMapGen(prev => ({ ...prev, status: 'polling', generationId: genId }))
      
      const urls = await pollGeneration(genId)
      setMapGen({
        status: 'complete',
        generationId: genId,
        images: urls.map(url => ({ url, selected: false })),
        error: null,
      })
    } catch (err) {
      setMapGen(prev => ({
        ...prev,
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
      }))
    }
  }, [mapPrompt, generateImage, pollGeneration])

  // Handle airplane generation
  const handleGenerateAirplane = useCallback(async () => {
    setAirplaneGen({ status: 'generating', generationId: null, images: [], error: null })
    
    try {
      const genId = await generateImage(airplanePrompt, 512, 256, 4)
      setAirplaneGen(prev => ({ ...prev, status: 'polling', generationId: genId }))
      
      const urls = await pollGeneration(genId)
      setAirplaneGen({
        status: 'complete',
        generationId: genId,
        images: urls.map(url => ({ url, selected: false })),
        error: null,
      })
    } catch (err) {
      setAirplaneGen(prev => ({
        ...prev,
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
      }))
    }
  }, [airplanePrompt, generateImage, pollGeneration])

  // Handle city generation
  const handleGenerateCity = useCallback(async (city: CityAsset) => {
    setCityGens(prev => ({
      ...prev,
      [city.id]: { status: 'generating', generationId: null, images: [], error: null }
    }))
    
    try {
      const genId = await generateImage(city.prompt, 1024, 576, 4)
      setCityGens(prev => ({
        ...prev,
        [city.id]: { ...prev[city.id], status: 'polling', generationId: genId }
      }))
      
      const urls = await pollGeneration(genId)
      setCityGens(prev => ({
        ...prev,
        [city.id]: {
          status: 'complete',
          generationId: genId,
          images: urls.map(url => ({ url, selected: false })),
          error: null,
        }
      }))
    } catch (err) {
      setCityGens(prev => ({
        ...prev,
        [city.id]: {
          ...prev[city.id],
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error',
        }
      }))
    }
  }, [generateImage, pollGeneration])

  // Toggle image selection
  const toggleImageSelection = useCallback((
    category: 'map' | 'airplane' | 'city',
    index: number,
    cityId?: number
  ) => {
    if (category === 'map') {
      setMapGen(prev => ({
        ...prev,
        images: prev.images.map((img, i) => ({
          ...img,
          selected: i === index ? !img.selected : false // Single select
        }))
      }))
    } else if (category === 'airplane') {
      setAirplaneGen(prev => ({
        ...prev,
        images: prev.images.map((img, i) => ({
          ...img,
          selected: i === index ? !img.selected : false
        }))
      }))
    } else if (category === 'city' && cityId) {
      setCityGens(prev => ({
        ...prev,
        [cityId]: {
          ...prev[cityId],
          images: prev[cityId].images.map((img, i) => ({
            ...img,
            selected: i === index ? !img.selected : false
          }))
        }
      }))
    }
  }, [])

  // Get selected URLs for export
  const getSelectedAssets = useCallback(() => {
    const mapUrl = mapGen.images.find(i => i.selected)?.url || null
    const airplaneUrl = airplaneGen.images.find(i => i.selected)?.url || null
    
    const cities: Record<string, string> = {}
    Object.entries(cityGens).forEach(([id, gen]) => {
      const selected = gen.images.find(i => i.selected)
      if (selected) {
        const city = CAMPAIGN_CITIES.find(c => c.id === parseInt(id))
        if (city) cities[city.city] = selected.url
      }
    })
    
    return { mapUrl, airplaneUrl, cities }
  }, [mapGen, airplaneGen, cityGens])

  // Copy assets to clipboard
  const handleCopyAssets = useCallback(() => {
    const assets = getSelectedAssets()
    const code = `// Generated Campaign Assets
export const GENERATED_ASSETS = ${JSON.stringify(assets, null, 2)}`
    navigator.clipboard.writeText(code)
    alert('Assets copied to clipboard!')
  }, [getSelectedAssets])

  return (
    <main className="min-h-screen relative">
      {/* Background */}
      <VideoBackground src={BG_VIDEO} poster={BG_POSTER} overlay overlayOpacity={0.7} />
      
      {/* Header */}
      <header 
        className="sticky top-0 z-50 backdrop-blur-xl px-4 py-3"
        style={{ 
          background: 'rgba(0, 34, 68, 0.8)',
          borderBottom: '1px solid rgba(105, 190, 40, 0.2)',
          paddingTop: 'max(12px, env(safe-area-inset-top))',
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 
            className="text-xl font-black uppercase tracking-wide"
            style={{
              background: 'linear-gradient(135deg, #69BE28 0%, #FFFFFF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Campaign Assets
          </h1>
          
          <GhostButton size="sm" onClick={handleCopyAssets}>
            Copy Selected
          </GhostButton>
        </div>
        
        {/* Category Tabs */}
        <div className="max-w-6xl mx-auto flex gap-2 mt-3">
          {(['map', 'airplane', 'cities'] as AssetCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`
                px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all
                ${activeCategory === cat 
                  ? 'bg-[#69BE28] text-black' 
                  : 'bg-white/10 text-white/60 hover:bg-white/20'}
              `}
            >
              {cat === 'map' ? 'US Map' : cat === 'airplane' ? 'Airplane' : 'Cities'}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* MAP SECTION */}
          {activeCategory === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <GlassCard padding="lg">
                <h2 className="text-lg font-bold text-white mb-4">US Map Background</h2>
                
                {/* Prompt Editor */}
                <div className="mb-4">
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">
                    Leonardo Prompt
                  </label>
                  <textarea
                    value={mapPrompt}
                    onChange={(e) => setMapPrompt(e.target.value)}
                    className="w-full h-32 bg-black/30 border border-white/10 rounded-lg p-3 text-white text-sm resize-none focus:outline-none focus:border-[#69BE28]/50"
                  />
                </div>
                
                {/* Generate Button */}
                <GradientButton
                  onClick={handleGenerateMap}
                  disabled={mapGen.status === 'generating' || mapGen.status === 'polling'}
                  loading={mapGen.status === 'generating' || mapGen.status === 'polling'}
                >
                  {mapGen.status === 'generating' ? 'Starting...' : 
                   mapGen.status === 'polling' ? 'Generating...' : 
                   'Generate Map Images'}
                </GradientButton>
                
                {/* Error */}
                {mapGen.error && (
                  <p className="text-red-400 text-sm mt-3">{mapGen.error}</p>
                )}
                
                {/* Results Grid */}
                {mapGen.images.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-bold text-white/70 mb-3">
                      Select an image (click to select):
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {mapGen.images.map((img, i) => (
                        <motion.button
                          key={i}
                          onClick={() => toggleImageSelection('map', i)}
                          className={`
                            relative rounded-xl overflow-hidden aspect-video
                            ${img.selected ? 'ring-4 ring-[#69BE28]' : 'ring-1 ring-white/20'}
                          `}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <img 
                            src={img.url} 
                            alt={`Map option ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {img.selected && (
                            <div className="absolute inset-0 bg-[#69BE28]/20 flex items-center justify-center">
                              <div className="w-10 h-10 rounded-full bg-[#69BE28] flex items-center justify-center">
                                <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          )}

          {/* AIRPLANE SECTION */}
          {activeCategory === 'airplane' && (
            <motion.div
              key="airplane"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <GlassCard padding="lg">
                <h2 className="text-lg font-bold text-white mb-4">Seahawks Airplane Sprite</h2>
                
                {/* Prompt Editor */}
                <div className="mb-4">
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">
                    Leonardo Prompt
                  </label>
                  <textarea
                    value={airplanePrompt}
                    onChange={(e) => setAirplanePrompt(e.target.value)}
                    className="w-full h-32 bg-black/30 border border-white/10 rounded-lg p-3 text-white text-sm resize-none focus:outline-none focus:border-[#69BE28]/50"
                  />
                </div>
                
                {/* Generate Button */}
                <GradientButton
                  onClick={handleGenerateAirplane}
                  disabled={airplaneGen.status === 'generating' || airplaneGen.status === 'polling'}
                  loading={airplaneGen.status === 'generating' || airplaneGen.status === 'polling'}
                >
                  {airplaneGen.status === 'generating' ? 'Starting...' : 
                   airplaneGen.status === 'polling' ? 'Generating...' : 
                   'Generate Airplane Sprites'}
                </GradientButton>
                
                {/* Error */}
                {airplaneGen.error && (
                  <p className="text-red-400 text-sm mt-3">{airplaneGen.error}</p>
                )}
                
                {/* Results Grid */}
                {airplaneGen.images.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-bold text-white/70 mb-3">
                      Select an image:
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {airplaneGen.images.map((img, i) => (
                        <motion.button
                          key={i}
                          onClick={() => toggleImageSelection('airplane', i)}
                          className={`
                            relative rounded-xl overflow-hidden aspect-[2/1] bg-black/50
                            ${img.selected ? 'ring-4 ring-[#69BE28]' : 'ring-1 ring-white/20'}
                          `}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <img 
                            src={img.url} 
                            alt={`Airplane option ${i + 1}`}
                            className="w-full h-full object-contain"
                          />
                          {img.selected && (
                            <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[#69BE28] flex items-center justify-center">
                              <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          )}

          {/* CITIES SECTION */}
          {activeCategory === 'cities' && (
            <motion.div
              key="cities"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* City List */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {CAMPAIGN_CITIES.map((city) => {
                  const gen = cityGens[city.id]
                  const hasSelected = gen?.images.some(i => i.selected)
                  
                  return (
                    <motion.button
                      key={city.id}
                      onClick={() => setSelectedCity(city)}
                      className={`
                        relative p-4 rounded-xl text-left transition-all
                        ${selectedCity?.id === city.id 
                          ? 'bg-[#69BE28]/20 ring-2 ring-[#69BE28]' 
                          : 'bg-white/5 ring-1 ring-white/10 hover:bg-white/10'}
                      `}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-white font-bold text-sm">{city.city}</div>
                      <div className="text-white/40 text-xs">{city.state}</div>
                      
                      {/* Status indicator */}
                      <div className="absolute top-2 right-2">
                        {gen?.status === 'generating' || gen?.status === 'polling' ? (
                          <LoadingSpinner size="sm" />
                        ) : hasSelected ? (
                          <div className="w-5 h-5 rounded-full bg-[#69BE28] flex items-center justify-center">
                            <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : gen?.images.length ? (
                          <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
                            <span className="text-[10px] text-black font-bold">{gen.images.length}</span>
                          </div>
                        ) : null}
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              {/* Selected City Detail */}
              {selectedCity && (
                <GlassCard padding="lg">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white">{selectedCity.city}</h2>
                      <p className="text-white/50 text-sm">{selectedCity.stadium}</p>
                    </div>
                    <GhostButton size="sm" onClick={() => setSelectedCity(null)}>
                      Close
                    </GhostButton>
                  </div>
                  
                  {/* Landmarks */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedCity.landmarks.map((lm, i) => (
                      <span 
                        key={i}
                        className="px-2 py-1 rounded-full text-xs bg-white/10 text-white/60"
                      >
                        {lm}
                      </span>
                    ))}
                  </div>
                  
                  {/* Prompt Display */}
                  <div className="mb-4 p-3 bg-black/30 rounded-lg">
                    <p className="text-xs text-white/70 leading-relaxed">
                      {selectedCity.prompt}
                    </p>
                  </div>
                  
                  {/* Generate Button */}
                  <GradientButton
                    onClick={() => handleGenerateCity(selectedCity)}
                    disabled={
                      cityGens[selectedCity.id]?.status === 'generating' || 
                      cityGens[selectedCity.id]?.status === 'polling'
                    }
                    loading={
                      cityGens[selectedCity.id]?.status === 'generating' || 
                      cityGens[selectedCity.id]?.status === 'polling'
                    }
                  >
                    Generate {selectedCity.city} Images
                  </GradientButton>
                  
                  {/* Error */}
                  {cityGens[selectedCity.id]?.error && (
                    <p className="text-red-400 text-sm mt-3">
                      {cityGens[selectedCity.id].error}
                    </p>
                  )}
                  
                  {/* Results Grid */}
                  {cityGens[selectedCity.id]?.images.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-bold text-white/70 mb-3">
                        Select an image:
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {cityGens[selectedCity.id].images.map((img, i) => (
                          <motion.button
                            key={i}
                            onClick={() => toggleImageSelection('city', i, selectedCity.id)}
                            className={`
                              relative rounded-xl overflow-hidden aspect-video
                              ${img.selected ? 'ring-4 ring-[#69BE28]' : 'ring-1 ring-white/20'}
                            `}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <img 
                              src={img.url} 
                              alt={`${selectedCity.city} option ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {img.selected && (
                              <div className="absolute inset-0 bg-[#69BE28]/20 flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-[#69BE28] flex items-center justify-center">
                                  <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                </GlassCard>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
