import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0B1F24] to-[#1a472a] flex flex-col items-center justify-center p-6 text-white">
      {/* Hero Section */}
      <div className="max-w-2xl text-center space-y-8">
        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tight">
          <span className="text-white">ROAD TO THE</span>
          <br />
          <span className="text-[#FFD700]">SUPER BOWL</span>
        </h1>

        {/* Team Badge */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-20 h-20 rounded-full bg-[#0F6E6A] flex items-center justify-center border-4 border-[#7ED957]">
            <span className="text-3xl font-black text-[#7ED957]">SD</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#7ED957]">
            SEATTLE DARKSIDE
          </h2>
          <p className="text-gray-400 italic">Defensive Dynasty</p>
        </div>

        {/* Description */}
        <div className="space-y-4 text-gray-300">
          <p className="text-lg md:text-xl">
            Command your elite defensive unit on an epic journey to claim the championship trophy.
          </p>
          <p className="text-base md:text-lg">
            Face <span className="text-[#7ED957] font-semibold">9 challenging opponents</span> in rapid button-mashing clashes. 
            Earn power-ups, break through offensive lines, and march your way to glory!
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-[#0F6E6A]/30 rounded-lg p-3 border border-[#0F6E6A]">
            <div className="text-[#7ED957] font-bold text-2xl">9</div>
            <div className="text-gray-400">Stages</div>
          </div>
          <div className="bg-[#0F6E6A]/30 rounded-lg p-3 border border-[#0F6E6A]">
            <div className="text-[#7ED957] font-bold text-2xl">5</div>
            <div className="text-gray-400">Power-Ups</div>
          </div>
          <div className="bg-[#0F6E6A]/30 rounded-lg p-3 border border-[#0F6E6A]">
            <div className="text-[#7ED957] font-bold text-2xl">TAP</div>
            <div className="text-gray-400">To Win</div>
          </div>
          <div className="bg-[#0F6E6A]/30 rounded-lg p-3 border border-[#0F6E6A]">
            <div className="text-[#7ED957] font-bold text-2xl">1</div>
            <div className="text-gray-400">Trophy</div>
          </div>
        </div>

        {/* Play Button */}
        <Link
          href="/play"
          className="inline-block bg-[#0F6E6A] hover:bg-[#7ED957] text-white hover:text-[#0B1F24] font-bold text-xl md:text-2xl px-12 py-5 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#7ED957]/50"
        >
          PLAY NOW
        </Link>

        {/* Instructions */}
        <div className="text-gray-500 text-sm space-y-1">
          <p>Tap rapidly to fill your Force meter before time runs out!</p>
          <p>Best played in landscape mode on mobile devices.</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 text-center text-gray-600 text-xs">
        <p>A Drink Sip Refresher Experience</p>
        <p className="mt-1">All teams and characters are fictional.</p>
      </footer>
    </main>
  )
}
