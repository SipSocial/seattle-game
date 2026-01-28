import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0B1F24] to-[#0F6E6A] flex flex-col items-center justify-center p-6 text-white">
      {/* Hero Section */}
      <div className="max-w-md text-center space-y-6">
        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-black tracking-tight">
          <span className="text-[#0F6E6A]" style={{ WebkitTextStroke: '2px #7ED957' }}>DARKSIDE</span>
          <br />
          <span className="text-[#7ED957]">DEFENSE</span>
        </h1>

        {/* Tagline */}
        <p className="text-xl text-gray-300 italic">
          Tackle Everything. Wake Up Happy.
        </p>

        {/* Team Badge */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-24 h-24 rounded-full bg-[#0F6E6A] flex items-center justify-center border-4 border-[#7ED957] shadow-lg shadow-[#7ED957]/30">
            <span className="text-4xl font-black text-white">21</span>
          </div>
          <p className="text-gray-400 text-sm">Pick your defender. Protect the end zone.</p>
        </div>

        {/* Game Description */}
        <div className="space-y-3 text-gray-300 text-base">
          <p>
            Endless waves of offensive players are charging your end zone. 
            <span className="text-[#7ED957] font-semibold"> Drag to tackle.</span> Don&apos;t let them score.
          </p>
          <p>
            Level up between waves. Build your squad. 
            <span className="text-[#7ED957] font-semibold"> How long can you survive?</span>
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-[#0F6E6A]/40 rounded-xl p-4 border border-[#7ED957]/30">
            <div className="text-[#7ED957] font-bold text-2xl">24</div>
            <div className="text-gray-400">Defenders</div>
          </div>
          <div className="bg-[#0F6E6A]/40 rounded-xl p-4 border border-[#7ED957]/30">
            <div className="text-[#7ED957] font-bold text-2xl">8</div>
            <div className="text-gray-400">Upgrades</div>
          </div>
          <div className="bg-[#0F6E6A]/40 rounded-xl p-4 border border-[#7ED957]/30">
            <div className="text-[#7ED957] font-bold text-2xl">4</div>
            <div className="text-gray-400">Enemy Types</div>
          </div>
          <div className="bg-[#0F6E6A]/40 rounded-xl p-4 border border-[#7ED957]/30">
            <div className="text-[#7ED957] font-bold text-2xl">∞</div>
            <div className="text-gray-400">Waves</div>
          </div>
        </div>

        {/* DrinkSip Power-ups */}
        <div className="bg-[#0B1F24]/60 rounded-xl p-4 border border-[#7ED957]/20">
          <p className="text-xs text-gray-500 mb-2">POWERED BY</p>
          <p className="text-lg font-bold text-white">DrinkSip</p>
          <div className="flex justify-center gap-2 mt-2 text-xs text-gray-400">
            <span>🍺 Hazy IPA</span>
            <span>•</span>
            <span>🍉 Watermelon</span>
            <span>•</span>
            <span>🍋 Lemon Lime</span>
            <span>•</span>
            <span>🍊 Blood Orange</span>
          </div>
        </div>

        {/* Play Button */}
        <Link
          href="/play"
          className="inline-block w-full bg-[#7ED957] hover:bg-[#9AE87A] text-[#0B1F24] font-black text-2xl px-12 py-5 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-[#7ED957]/40"
        >
          PLAY NOW
        </Link>

        {/* Instructions */}
        <div className="text-gray-500 text-xs space-y-1">
          <p>Drag your defender to tackle incoming runners.</p>
          <p>Works best on mobile. Portrait mode.</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 text-center text-gray-600 text-xs">
        <p>Wake Up Happy™</p>
        <p className="mt-1">All teams and characters are fictional.</p>
      </footer>
    </main>
  )
}
