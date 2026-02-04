'use client'

import { motion } from 'framer-motion'

interface Sponsor {
  name: string
  tagline: string
  color: string
  url: string
}

const SPONSORS: Sponsor[] = [
  { name: 'KJR Radio', tagline: '950 AM Sports Radio', color: '#FF4444', url: '#' },
  { name: 'Simply Seattle', tagline: 'Official Merch Partner', color: '#4A90D9', url: '#' },
  { name: "Fat Zach's Pizza", tagline: 'Game Day Fuel', color: '#FFB347', url: '#' },
]

interface SponsorBannerProps {
  sponsors?: Sponsor[]
  speed?: number // Duration of one full cycle in seconds
  className?: string
}

export function SponsorBanner({ 
  sponsors = SPONSORS, 
  speed = 20,
  className = '' 
}: SponsorBannerProps) {
  // Duplicate sponsors for seamless loop
  const duplicatedSponsors = [...sponsors, ...sponsors, ...sponsors]

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Gradient fade edges */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, rgba(0, 34, 68, 0.95) 0%, transparent 100%)',
        }}
      />
      <div 
        className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(270deg, rgba(0, 34, 68, 0.95) 0%, transparent 100%)',
        }}
      />

      {/* Scrolling content */}
      <div 
        className="flex items-center"
        style={{ 
          padding: 'var(--space-3) 0',
        }}
      >
        {/* Presented by label */}
        <div 
          className="flex-shrink-0 px-4"
          style={{
            fontSize: 'var(--text-micro)',
            color: 'rgba(255, 255, 255, 0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            fontWeight: 600,
          }}
        >
          Presented by
        </div>

        {/* Marquee wrapper */}
        <div className="flex-1 overflow-hidden">
          <motion.div
            className="flex items-center"
            style={{ gap: 'var(--space-8)' }}
            animate={{
              x: ['0%', '-33.333%'],
            }}
            transition={{
              x: {
                duration: speed,
                repeat: Infinity,
                ease: 'linear',
              },
            }}
          >
            {duplicatedSponsors.map((sponsor, index) => (
              <a
                key={`${sponsor.name}-${index}`}
                href={sponsor.url}
                className="flex-shrink-0 flex items-center group"
                style={{ gap: 'var(--space-2)' }}
              >
                {/* Sponsor logo placeholder */}
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{
                    width: '32px',
                    height: '32px',
                    background: `linear-gradient(135deg, ${sponsor.color}33 0%, ${sponsor.color}11 100%)`,
                    border: `1px solid ${sponsor.color}44`,
                  }}
                >
                  <span 
                    style={{ 
                      fontSize: '14px',
                      fontWeight: 700,
                      color: sponsor.color,
                    }}
                  >
                    {sponsor.name.charAt(0)}
                  </span>
                </div>

                {/* Sponsor name */}
                <span
                  className="whitespace-nowrap transition-colors duration-200"
                  style={{
                    fontSize: 'var(--text-caption)',
                    fontFamily: 'var(--font-oswald), sans-serif',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.7)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  {sponsor.name}
                </span>

                {/* Separator dot */}
                <span
                  className="mx-4"
                  style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                  }}
                />
              </a>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default SponsorBanner
