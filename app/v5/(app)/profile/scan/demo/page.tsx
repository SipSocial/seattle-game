'use client'

/**
 * Scratch Card Demo - For screenshot capture
 */

import { ScratchCard } from '@/components/scan/ScratchCard'

export default function ScratchCardDemo() {
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-6"
      style={{
        background: 'linear-gradient(180deg, #000A14 0%, #001428 100%)',
      }}
    >
      <ScratchCard
        onComplete={() => {}}
        isWinner={true}
        prize={{
          name: 'Free DrinkSip',
          description: 'One free can of any flavor',
          tier: 'gold',
        }}
      />
    </div>
  )
}
