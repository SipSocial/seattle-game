'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState('lb')
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const positions = [
    { id: 'lb', name: 'Linebackers', count: 10, color: '#00897B', icon: '🦅', desc: 'Speed & Coverage' },
    { id: 'dl', name: 'D-Line', count: 6, color: '#E53935', icon: '💪', desc: 'Power & Pressure' },
    { id: 'cb', name: 'Corners', count: 4, color: '#FFB300', icon: '🔒', desc: 'Lockdown Coverage' },
    { id: 'sf', name: 'Safeties', count: 4, color: '#7B1FA2', icon: '👁️', desc: 'Last Line Defense' },
  ]

  return (
    <main 
      className="h-[100dvh] flex flex-col overflow-hidden relative"
      style={{
        background: 'linear-gradient(165deg, #001428 0%, #002244 35%, #003055 70%, #001a33 100%)',
      }}
    >
      {/* Ambient glow effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-[30%] -left-[20%] w-[70%] h-[60%] rounded-full opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(105,190,40,0.15) 0%, transparent 70%)' }}
        />
        <div 
          className="absolute -bottom-[20%] -right-[20%] w-[60%] h-[50%] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(0,136,204,0.2) 0%, transparent 70%)' }}
        />
        {/* Floating particles */}
        {mounted && Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${10 + (i * 7) % 80}%`,
              top: `${5 + (i * 13) % 90}%`,
              backgroundColor: i % 3 === 0 ? '#69BE28' : '#ffffff',
              opacity: 0.2 + (i % 3) * 0.1,
              animation: `particle-float ${8 + i % 4}s linear ${i * 0.5}s infinite`,
            }}
          />
        ))}
      </div>

      {/* ===== TOP SECTION: Brand & Hero ===== */}
      <section className="relative z-10 px-6 pt-[max(env(safe-area-inset-top),20px)]">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {/* 12 Badge - Integrated with brand */}
          <div 
            className="relative opacity-0 animate-scale-in"
            style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
          >
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center relative"
              style={{ 
                background: 'linear-gradient(135deg, #69BE28 0%, #4A9A1C 100%)',
                boxShadow: '0 0 40px rgba(105,190,40,0.5), 0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              <div 
                className="absolute inset-[3px] rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #002244 0%, #001a33 100%)' }}
              >
                <span 
                  className="text-3xl text-white"
                  style={{ 
                    fontFamily: 'var(--font-bebas), var(--font-oswald), sans-serif',
                    textShadow: '0 2px 10px rgba(105,190,40,0.5)',
                  }}
                >
                  12
                </span>
              </div>
              {/* Pulse ring */}
              <div 
                className="absolute inset-0 rounded-full animate-ping"
                style={{ 
                  background: 'transparent',
                  border: '2px solid rgba(105,190,40,0.4)',
                  animationDuration: '2s',
                }}
              />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-4">
          <h1 
            className="leading-[0.85] tracking-tight opacity-0 animate-hero-text"
            style={{ 
              animationDelay: '0.2s', 
              animationFillMode: 'forwards',
              fontFamily: 'var(--font-bebas), var(--font-oswald), sans-serif',
            }}
          >
            <span 
              className="block text-[clamp(3.5rem,15vw,5rem)]"
              style={{ 
                background: 'linear-gradient(135deg, #69BE28 0%, #8BD44A 40%, #FFFFFF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 4px 20px rgba(105,190,40,0.3))',
              }}
            >
              SEAHAWKS
            </span>
            <span 
              className="block text-[clamp(2.5rem,11vw,3.5rem)] text-white"
              style={{ letterSpacing: '0.15em' }}
            >
              DEFENSE
            </span>
          </h1>
          <p 
            className="text-sm mt-2 opacity-0 animate-slide-up"
            style={{ 
              animationDelay: '0.4s', 
              animationFillMode: 'forwards',
              color: 'rgba(165,172,175,0.8)',
              fontStyle: 'italic',
              letterSpacing: '0.1em',
            }}
          >
            The Legion Lives On
          </p>
        </div>
      </section>

      {/* ===== MIDDLE SECTION: Game Info & CTA ===== */}
      <section className="flex-1 flex flex-col justify-center relative z-10 px-6">
        {/* Stats Bar - Glass Card */}
        <div 
          className="rounded-2xl p-4 mb-5 opacity-0 animate-slide-up"
          style={{ 
            animationDelay: '0.5s', 
            animationFillMode: 'forwards',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div className="flex justify-around">
            {[
              { value: '24', label: 'DEFENDERS', icon: '🛡️' },
              { value: '8', label: 'POWER-UPS', icon: '⚡' },
              { value: '∞', label: 'WAVES', icon: '🌊' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div 
                  className="text-xl font-bold"
                  style={{ 
                    color: '#69BE28', 
                    fontFamily: 'var(--font-oswald), sans-serif',
                    textShadow: '0 0 20px rgba(105,190,40,0.5)',
                  }}
                >
                  {stat.value}
                </div>
                <div 
                  className="text-[9px] tracking-wider"
                  style={{ color: 'rgba(165,172,175,0.6)' }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Primary CTA */}
        <Link
          href="/play"
          className="block w-full text-center py-5 rounded-2xl opacity-0 animate-scale-in active:scale-[0.97] transition-all relative overflow-hidden group"
          style={{ 
            animationDelay: '0.6s', 
            animationFillMode: 'forwards',
            background: 'linear-gradient(135deg, #69BE28 0%, #4A9A1C 100%)',
            boxShadow: '0 8px 40px rgba(105,190,40,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset',
          }}
        >
          <span 
            className="relative z-10 text-xl"
            style={{ 
              color: '#002244',
              fontFamily: 'var(--font-oswald), sans-serif',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            ENTER THE FIELD
          </span>
          {/* Shine effect */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
              transform: 'skewX(-20deg) translateX(-100%)',
              animation: 'shimmer 2s infinite',
            }}
          />
        </Link>

        {/* Quick Instructions */}
        <div 
          className="flex justify-center gap-8 mt-4 opacity-0 animate-slide-up"
          style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}
        >
          {[
            { step: '1', text: 'Pick Defender' },
            { step: '2', text: 'Drag to Tackle' },
            { step: '3', text: 'Survive Waves' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ 
                  background: 'rgba(105,190,40,0.2)',
                  color: '#69BE28',
                  border: '1px solid rgba(105,190,40,0.3)',
                }}
              >
                {item.step}
              </div>
              <span className="text-[10px]" style={{ color: 'rgba(165,172,175,0.5)' }}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== BOTTOM SECTION: Position Selector ===== */}
      <section className="relative z-10 px-6 pb-2">
        <h2 
          className="text-[11px] text-center mb-3 tracking-[0.25em] opacity-0 animate-slide-up"
          style={{ 
            animationDelay: '0.8s',
            animationFillMode: 'forwards',
            fontFamily: 'var(--font-oswald), sans-serif',
            color: 'rgba(165,172,175,0.6)',
          }}
        >
          SELECT POSITION GROUP
        </h2>
        
        {/* Position Cards - Stacked */}
        <div className="space-y-2">
          {positions.map((pos, i) => (
            <button
              key={pos.id}
              onClick={() => setSelectedPosition(pos.id)}
              className="w-full flex items-center gap-3 rounded-xl px-4 py-3 transition-all active:scale-[0.98] opacity-0 animate-slide-up text-left"
              style={{
                animationDelay: `${0.85 + i * 0.08}s`,
                animationFillMode: 'forwards',
                background: selectedPosition === pos.id 
                  ? 'linear-gradient(135deg, rgba(105,190,40,0.15) 0%, rgba(105,190,40,0.05) 100%)'
                  : 'rgba(255,255,255,0.03)',
                border: selectedPosition === pos.id 
                  ? '1px solid rgba(105,190,40,0.4)'
                  : '1px solid rgba(255,255,255,0.06)',
                boxShadow: selectedPosition === pos.id 
                  ? '0 4px 20px rgba(105,190,40,0.15)'
                  : 'none',
              }}
            >
              {/* Icon */}
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ 
                  background: `linear-gradient(135deg, ${pos.color} 0%, ${pos.color}99 100%)`,
                  boxShadow: selectedPosition === pos.id ? `0 4px 15px ${pos.color}50` : 'none',
                }}
              >
                {pos.icon}
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div 
                  className="text-white text-base font-medium"
                  style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                >
                  {pos.name}
                </div>
                <div className="text-[11px]" style={{ color: 'rgba(165,172,175,0.5)' }}>
                  {pos.desc}
                </div>
              </div>
              
              {/* Player count */}
              <div className="text-right shrink-0">
                <div 
                  className="text-lg font-bold"
                  style={{ 
                    color: selectedPosition === pos.id ? '#69BE28' : 'rgba(255,255,255,0.6)',
                    fontFamily: 'var(--font-oswald), sans-serif',
                  }}
                >
                  {pos.count}
                </div>
                <div className="text-[9px]" style={{ color: 'rgba(165,172,175,0.4)' }}>
                  PLAYERS
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer 
        className="relative z-10 px-6 py-3 text-center opacity-0 animate-slide-up safe-area-bottom"
        style={{ 
          animationDelay: '1.2s', 
          animationFillMode: 'forwards',
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-[9px] tracking-wider" style={{ color: 'rgba(165,172,175,0.3)' }}>
            POWERED BY
          </span>
          <span 
            className="text-xs font-medium"
            style={{ 
              fontFamily: 'var(--font-oswald), sans-serif',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            DrinkSip
          </span>
          <div className="flex gap-1.5 text-[10px]">
            <span>🍺</span><span>🍉</span><span>🍋</span><span>🍊</span>
          </div>
        </div>
        <p className="text-[8px]" style={{ color: 'rgba(165,172,175,0.2)' }}>
          Not affiliated with Seattle Seahawks or NFL • A fan tribute to the Legion of Boom
        </p>
      </footer>

      {/* Edge glow */}
      <div 
        className="fixed bottom-0 left-0 right-0 h-40 pointer-events-none z-0"
        style={{
          background: 'linear-gradient(to top, rgba(0,20,40,0.95) 0%, transparent 100%)',
        }}
      />
    </main>
  )
}
