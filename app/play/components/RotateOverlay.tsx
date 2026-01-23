'use client'

export default function RotateOverlay() {
  return (
    <div className="fixed inset-0 bg-[#0B1F24]/95 flex flex-col items-center justify-center z-[9999] p-8">
      {/* Rotate Icon */}
      <div className="mb-8 animate-pulse">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#7ED957"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-[spin_3s_ease-in-out_infinite]"
        >
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12" y2="18" />
        </svg>
      </div>

      {/* Phone rotation animation */}
      <div className="relative w-24 h-16 mb-8">
        <div
          className="absolute inset-0 border-4 border-[#0F6E6A] rounded-lg animate-[rotatePhone_2s_ease-in-out_infinite]"
          style={{
            transformOrigin: 'center center',
          }}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#7ED957] rounded-full" />
        </div>
      </div>

      {/* Text */}
      <h2 className="text-[#7ED957] text-2xl font-bold mb-2 text-center">
        Rotate Your Device
      </h2>
      <p className="text-gray-400 text-center max-w-xs">
        For the best gameplay experience, please rotate your device to landscape mode.
      </p>

      {/* Seattle Darkside branding */}
      <div className="mt-8 flex items-center gap-2 text-[#0F6E6A]">
        <div className="w-8 h-8 rounded-full bg-[#0F6E6A] flex items-center justify-center">
          <span className="text-xs font-bold text-[#7ED957]">SD</span>
        </div>
        <span className="text-sm">Seattle Darkside</span>
      </div>

      <style jsx>{`
        @keyframes rotatePhone {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-20deg);
          }
          75% {
            transform: rotate(90deg);
          }
        }
      `}</style>
    </div>
  )
}
