import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-[#0B1F24] to-[#0F6E6A] flex flex-col items-center justify-between p-4 py-6 text-white overflow-auto">
      {/* Hero Section */}
      <div className="w-full max-w-sm text-center space-y-4 flex-1 flex flex-col justify-center">
        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
          <span className="text-[#0F6E6A]" style={{ WebkitTextStroke: '2px #7ED957' }}>DARKSIDE</span>
          <br />
          <span className="text-[#7ED957]">DEFENSE</span>
        </h1>

        {/* Tagline */}
        <p className="text-base sm:text-lg text-gray-300 italic">
          Tackle Everything. Wake Up Happy.
        </p>

        {/* Team Badge - smaller on mobile */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#0F6E6A] flex items-center justify-center border-4 border-[#7ED957] shadow-lg shadow-[#7ED957]/30">
            <span className="text-2xl sm:text-3xl font-black text-white">21</span>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm">Pick your defender. Protect the end zone.</p>
        </div>

        {/* Game Description - condensed */}
        <div className="text-gray-300 text-sm sm:text-base px-2">
          <p>
            Drag to tackle runners before they score. 
            <span className="text-[#7ED957] font-semibold"> Level up. Survive.</span>
          </p>
        </div>

        {/* Features - 4 columns, compact */}
        <div className="grid grid-cols-4 gap-2 text-xs sm:text-sm">
          <div className="bg-[#0F6E6A]/40 rounded-lg p-2 sm:p-3 border border-[#7ED957]/30">
            <div className="text-[#7ED957] font-bold text-lg sm:text-xl">24</div>
            <div className="text-gray-400 text-[10px] sm:text-xs">Players</div>
          </div>
          <div className="bg-[#0F6E6A]/40 rounded-lg p-2 sm:p-3 border border-[#7ED957]/30">
            <div className="text-[#7ED957] font-bold text-lg sm:text-xl">8</div>
            <div className="text-gray-400 text-[10px] sm:text-xs">Upgrades</div>
          </div>
          <div className="bg-[#0F6E6A]/40 rounded-lg p-2 sm:p-3 border border-[#7ED957]/30">
            <div className="text-[#7ED957] font-bold text-lg sm:text-xl">4</div>
            <div className="text-gray-400 text-[10px] sm:text-xs">Enemies</div>
          </div>
          <div className="bg-[#0F6E6A]/40 rounded-lg p-2 sm:p-3 border border-[#7ED957]/30">
            <div className="text-[#7ED957] font-bold text-lg sm:text-xl">∞</div>
            <div className="text-gray-400 text-[10px] sm:text-xs">Waves</div>
          </div>
        </div>

        {/* DrinkSip Power-ups - compact */}
        <div className="bg-[#0B1F24]/60 rounded-lg p-3 border border-[#7ED957]/20">
          <p className="text-[10px] text-gray-500 mb-1">POWERED BY</p>
          <p className="text-base font-bold text-white">DrinkSip</p>
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 mt-1 text-[10px] sm:text-xs text-gray-400">
            <span>Hazy IPA</span>
            <span>•</span>
            <span>Watermelon</span>
            <span>•</span>
            <span>Lemon Lime</span>
            <span>•</span>
            <span>Blood Orange</span>
          </div>
        </div>

        {/* Play Button */}
        <Link
          href="/play"
          className="block w-full bg-[#7ED957] hover:bg-[#9AE87A] text-[#0B1F24] font-black text-xl sm:text-2xl px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-[#7ED957]/40"
        >
          PLAY NOW
        </Link>
      </div>

      {/* Footer - not absolute */}
      <footer className="text-center text-gray-600 text-[10px] sm:text-xs mt-4 pb-2">
        <p>Wake Up Happy™ • All teams fictional</p>
      </footer>
    </main>
  )
}
