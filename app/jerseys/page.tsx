'use client'

import { useState } from 'react'

// Clean DeMarcus jerseys - Seattle colors, no logo hallucination
const JERSEY_OPTIONS = [
  { id: 1, url: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/12a6f851-7e25-4874-af01-47dee569eb11/segments/1:4:1/Phoenix_Photorealistic_3D_render_of_NFL_defensive_end_DeMarcus_0.jpg' },
  { id: 2, url: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/12a6f851-7e25-4874-af01-47dee569eb11/segments/2:4:1/Phoenix_Photorealistic_3D_render_of_NFL_defensive_end_DeMarcus_0.jpg' },
  { id: 3, url: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/12a6f851-7e25-4874-af01-47dee569eb11/segments/3:4:1/Phoenix_Photorealistic_3D_render_of_NFL_defensive_end_DeMarcus_0.jpg' },
  { id: 4, url: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/12a6f851-7e25-4874-af01-47dee569eb11/segments/4:4:1/Phoenix_Photorealistic_3D_render_of_NFL_defensive_end_DeMarcus_0.jpg' },
  { id: 5, url: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/9c3b07b5-6b87-478d-9784-92a95a3cf8c4/segments/1:4:1/Phoenix_Photorealistic_NFL_football_player_full_body_render_mu_0.jpg' },
  { id: 6, url: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/9c3b07b5-6b87-478d-9784-92a95a3cf8c4/segments/2:4:1/Phoenix_Photorealistic_NFL_football_player_full_body_render_mu_0.jpg' },
  { id: 7, url: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/9c3b07b5-6b87-478d-9784-92a95a3cf8c4/segments/3:4:1/Phoenix_Photorealistic_NFL_football_player_full_body_render_mu_0.jpg' },
  { id: 8, url: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/9c3b07b5-6b87-478d-9784-92a95a3cf8c4/segments/4:4:1/Phoenix_Photorealistic_NFL_football_player_full_body_render_mu_0.jpg' },
  { id: 9, url: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/449fd740-3b1f-46d3-a931-45c7c1789d33/segments/2:2:1/Phoenix_Hyper_realistic_3D_NFL_player_in_custom_football_jerse_0.jpg' },
  { id: 10, url: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/449fd740-3b1f-46d3-a931-45c7c1789d33/segments/1:2:1/Phoenix_Hyper_realistic_3D_NFL_player_in_custom_football_jerse_0.jpg' },
]

export default function JerseysPage() {
  const [selected, setSelected] = useState<number | null>(null)
  const [fullscreen, setFullscreen] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold text-center mb-2">DrinkSip Jersey Options</h1>
      <p className="text-center text-gray-400 mb-6">DeMarcus Lawrence - Seattle Colors</p>
      
      {/* Fullscreen Modal */}
      {fullscreen !== null && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setFullscreen(null)}
        >
          <img 
            src={JERSEY_OPTIONS[fullscreen].url} 
            alt={`Option ${fullscreen + 1}`}
            className="max-h-[90vh] max-w-full object-contain"
          />
          <button 
            className="absolute top-4 right-4 text-white text-4xl"
            onClick={() => setFullscreen(null)}
          >
            ×
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xl font-bold">
            Option {fullscreen + 1}
          </div>
        </div>
      )}

      {/* Grid of options */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-7xl mx-auto">
        {JERSEY_OPTIONS.map((jersey, idx) => (
          <div 
            key={jersey.id}
            className={`relative rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
              selected === idx ? 'ring-4 ring-green-500 scale-105' : 'hover:scale-102'
            }`}
            onClick={() => setFullscreen(idx)}
          >
            <img 
              src={jersey.url} 
              alt={`Jersey Option ${jersey.id}`}
              className="w-full aspect-[3/4] object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
              <div className="text-center font-bold">Option {jersey.id}</div>
            </div>
            <button
              className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center ${
                selected === idx ? 'bg-green-500' : 'bg-white/20'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                setSelected(selected === idx ? null : idx)
              }}
            >
              {selected === idx ? '✓' : ''}
            </button>
          </div>
        ))}
      </div>

      {selected !== null && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-green-600 px-8 py-3 rounded-full font-bold text-lg">
          Selected: Option {selected + 1}
        </div>
      )}
    </div>
  )
}
