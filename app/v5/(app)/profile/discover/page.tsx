'use client'

/**
 * Discover Hub - Shop, Sponsors, Where to Buy, Social
 * 
 * The DrinkSip Consumer Hub featuring:
 * - Shop DrinkSip product carousel
 * - Our Partners (sponsor showcase)
 * - Where to Buy (retail partners)
 * - Follow Us (social links)
 * - Contact Sales CTA
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { GhostButton } from '@/components/ui/GhostButton'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Input } from '@/components/ui/Input'
import { ProductCarousel } from '@/components/shop/ProductCarousel'
import { PRODUCTS } from '@/src/v5/data/products'
import { SPONSORS, TIER_LABELS, type SponsorTier } from '@/src/v5/data/sponsors'
import { getFeaturedRetailers } from '@/src/v5/data/retailers'
import { 
  ArrowLeft, 
  ChevronRight, 
  ExternalLink, 
  MapPin, 
  MessageCircle,
  Instagram,
  Twitter,
} from 'lucide-react'

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }

// TikTok icon (not in Lucide)
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
    </svg>
  )
}

// Social links
const SOCIAL_LINKS = [
  {
    id: 'instagram',
    name: 'Instagram',
    handle: '@drinksip',
    url: 'https://instagram.com/drinksip',
    icon: <Instagram className="w-6 h-6" />,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    handle: '@drinksip',
    url: 'https://tiktok.com/@drinksip',
    icon: <TikTokIcon className="w-6 h-6" />,
  },
  {
    id: 'twitter',
    name: 'X',
    handle: '@drinksipbeer',
    url: 'https://x.com/drinksipbeer',
    icon: <Twitter className="w-6 h-6" />,
  },
]

export default function DiscoverPage() {
  const [contactOpen, setContactOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [message, setMessage] = useState('')
  
  const featuredRetailers = getFeaturedRetailers()
  
  // Group sponsors by tier
  const sponsorsByTier = SPONSORS.reduce((acc, sponsor) => {
    if (!acc[sponsor.tier]) acc[sponsor.tier] = []
    acc[sponsor.tier].push(sponsor)
    return acc
  }, {} as Record<SponsorTier, typeof SPONSORS>)

  const handleSponsorClick = (sponsor: typeof SPONSORS[0]) => {
    console.log('[Analytics] Sponsor click:', sponsor.id)
    window.open(sponsor.website, '_blank')
  }

  const handleRetailerClick = (retailer: ReturnType<typeof getFeaturedRetailers>[0], action: 'site' | 'map') => {
    console.log('[Analytics] Retailer click:', retailer.id, action)
    const url = action === 'map' ? retailer.mapUrl : retailer.website
    if (url) window.open(url, '_blank')
  }

  const handleContactSubmit = () => {
    console.log('[Contact] Submit:', { email, company, message })
    setContactOpen(false)
    setEmail('')
    setCompany('')
    setMessage('')
  }

  return (
    <div 
      className="min-h-full"
      style={{
        background: 'linear-gradient(180deg, #000A14 0%, #001428 100%)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 100px)',
      }}
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="sticky top-0 z-40"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
          paddingBottom: '16px',
          paddingLeft: 'var(--space-4)',
          paddingRight: 'var(--space-4)',
          background: 'linear-gradient(180deg, rgba(0, 10, 20, 0.98) 0%, rgba(0, 10, 20, 0.9) 80%, transparent 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center" style={{ gap: 'var(--space-4)' }}>
          <Link href="/v5/profile">
            <motion.div
              className="flex items-center justify-center"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              whileHover={{ background: 'rgba(255, 255, 255, 0.12)' }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </motion.div>
          </Link>
          
          <h1
            style={{
              fontSize: 'var(--text-subtitle)',
              fontWeight: 700,
              fontFamily: 'var(--font-oswald), sans-serif',
              color: 'white',
              letterSpacing: '0.1em',
            }}
          >
            DISCOVER
          </h1>
        </div>
      </motion.header>

      {/* Content */}
      <div style={{ padding: '0 var(--space-5)' }}>
        {/* Section 1: Shop DrinkSip */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.1 }}
          style={{ marginBottom: 'var(--space-8)' }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-4)' }}>
            <h2 
              className="font-display uppercase"
              style={{ 
                fontSize: 'var(--text-body)',
                fontWeight: 700,
                color: 'white',
                letterSpacing: '0.1em',
              }}
            >
              Shop DrinkSip
            </h2>
            <Link 
              href="/v5/profile/shop"
              className="flex items-center"
              style={{ 
                color: '#69BE28',
                fontSize: 'var(--text-caption)',
                fontWeight: 600,
                gap: '4px',
              }}
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <ProductCarousel 
            products={PRODUCTS.slice(0, 4)} 
            compact 
          />
        </motion.section>

        {/* Section 2: Our Partners */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.2 }}
          style={{ marginBottom: 'var(--space-8)' }}
        >
          <h2 
            className="font-display uppercase"
            style={{ 
              fontSize: 'var(--text-body)',
              fontWeight: 700,
              color: 'white',
              letterSpacing: '0.1em',
              marginBottom: 'var(--space-4)',
            }}
          >
            Our Partners
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {(['presenting', 'major', 'supporting'] as SponsorTier[]).map((tier) => (
              sponsorsByTier[tier]?.length > 0 && (
                <div key={tier}>
                  <p 
                    style={{ 
                      fontSize: 'var(--text-micro)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.15em',
                      color: tier === 'presenting' ? 'rgba(255,215,0,0.6)' : 'rgba(255,255,255,0.4)',
                      marginBottom: 'var(--space-2)',
                    }}
                  >
                    {TIER_LABELS[tier]}
                  </p>
                  
                  <div className={tier === 'presenting' ? '' : 'grid grid-cols-2'} style={{ gap: 'var(--space-3)' }}>
                    {sponsorsByTier[tier].map((sponsor) => (
                      <GlassCard
                        key={sponsor.id}
                        hover
                        padding={tier === 'presenting' ? 'lg' : 'md'}
                        variant={tier === 'presenting' ? 'green' : 'default'}
                        onClick={() => handleSponsorClick(sponsor)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className={`flex ${tier === 'presenting' ? 'items-center' : 'flex-col'}`} style={{ gap: 'var(--space-4)' }}>
                          {/* Logo */}
                          <div 
                            className={`${tier === 'presenting' ? 'w-16 h-16' : 'w-12 h-12'} rounded-lg flex items-center justify-center`}
                            style={{ 
                              background: 'rgba(255,255,255,0.1)',
                              padding: 'var(--space-2)',
                              marginBottom: tier === 'presenting' ? 0 : 'var(--space-2)',
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={sponsor.logo} 
                              alt={sponsor.name}
                              className="w-full h-full object-contain"
                              style={{ filter: 'brightness(1.1)' }}
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 
                              className="font-bold text-white truncate"
                              style={{ fontSize: tier === 'presenting' ? 'var(--text-body)' : 'var(--text-caption)' }}
                            >
                              {sponsor.name}
                            </h3>
                            {tier === 'presenting' && (
                              <p 
                                style={{ 
                                  fontSize: 'var(--text-caption)',
                                  color: 'rgba(255,255,255,0.5)',
                                  lineHeight: 1.4,
                                  marginTop: '4px',
                                }}
                              >
                                {sponsor.description}
                              </p>
                            )}
                            {sponsor.tagline && (
                              <p 
                                style={{ 
                                  fontSize: 'var(--text-micro)',
                                  color: tier === 'presenting' ? '#69BE28' : 'rgba(255,255,255,0.4)',
                                  marginTop: '4px',
                                }}
                              >
                                {sponsor.tagline}
                              </p>
                            )}
                          </div>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </motion.section>

        {/* Section 3: Where to Buy */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.3 }}
          style={{ marginBottom: 'var(--space-8)' }}
        >
          <h2 
            className="font-display uppercase"
            style={{ 
              fontSize: 'var(--text-body)',
              fontWeight: 700,
              color: 'white',
              letterSpacing: '0.1em',
              marginBottom: 'var(--space-4)',
            }}
          >
            Where to Buy
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {featuredRetailers.map((retailer, i) => (
              <motion.div
                key={retailer.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...spring, delay: 0.3 + i * 0.05 }}
              >
                <GlassCard hover padding="md">
                  <div className="flex items-center" style={{ gap: 'var(--space-4)' }}>
                    {/* Logo */}
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.1)' }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={retailer.logo} 
                        alt={retailer.name}
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="font-bold text-white"
                        style={{ fontSize: 'var(--text-body)' }}
                      >
                        {retailer.name}
                      </h3>
                      <p 
                        style={{ 
                          fontSize: 'var(--text-caption)',
                          color: 'rgba(255,255,255,0.5)',
                          marginTop: '2px',
                        }}
                      >
                        {retailer.locations}
                      </p>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex" style={{ gap: 'var(--space-2)' }}>
                      {retailer.mapUrl && (
                        <motion.button
                          onClick={() => handleRetailerClick(retailer, 'map')}
                          className="flex items-center justify-center"
                          style={{ 
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'rgba(105,190,40,0.15)',
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <MapPin className="w-5 h-5" style={{ color: '#69BE28' }} />
                        </motion.button>
                      )}
                      {retailer.website && (
                        <motion.button
                          onClick={() => handleRetailerClick(retailer, 'site')}
                          className="flex items-center justify-center"
                          style={{ 
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'rgba(255,255,255,0.05)',
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ExternalLink className="w-5 h-5 text-white" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Section 4: Follow Us */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.4 }}
          style={{ marginBottom: 'var(--space-8)' }}
        >
          <h2 
            className="font-display uppercase"
            style={{ 
              fontSize: 'var(--text-body)',
              fontWeight: 700,
              color: 'white',
              letterSpacing: '0.1em',
              marginBottom: 'var(--space-4)',
            }}
          >
            Follow Us
          </h2>
          
          <div className="flex" style={{ gap: 'var(--space-3)' }}>
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <GlassCard hover padding="md" className="text-center">
                  <div 
                    className="mx-auto w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(105,190,40,0.2), rgba(105,190,40,0.05))',
                      color: '#69BE28',
                      marginBottom: 'var(--space-2)',
                    }}
                  >
                    {social.icon}
                  </div>
                  <p 
                    className="font-semibold text-white"
                    style={{ fontSize: 'var(--text-caption)' }}
                  >
                    {social.name}
                  </p>
                  <p 
                    style={{ 
                      fontSize: 'var(--text-micro)',
                      color: 'rgba(255,255,255,0.4)',
                      marginTop: '2px',
                    }}
                  >
                    {social.handle}
                  </p>
                </GlassCard>
              </a>
            ))}
          </div>
        </motion.section>

        {/* Section 5: Contact Sales */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.5 }}
          style={{ marginBottom: 'var(--space-8)' }}
        >
          <GlassCard variant="green" padding="lg">
            <div className="text-center">
              <div 
                className="mx-auto w-12 h-12 rounded-full flex items-center justify-center"
                style={{ 
                  background: 'rgba(105,190,40,0.2)',
                  marginBottom: 'var(--space-3)',
                }}
              >
                <MessageCircle className="w-6 h-6" style={{ color: '#69BE28' }} />
              </div>
              
              <h3 
                className="font-bold text-white"
                style={{ 
                  fontSize: 'var(--text-subtitle)',
                  marginBottom: 'var(--space-2)',
                }}
              >
                Interested in Carrying DrinkSip?
              </h3>
              <p 
                style={{ 
                  fontSize: 'var(--text-body)',
                  color: 'rgba(255,255,255,0.6)',
                  maxWidth: '280px',
                  margin: '0 auto',
                  marginBottom: 'var(--space-4)',
                }}
              >
                Partner with us to bring premium NA craft beer to your customers.
              </p>
              
              <GradientButton 
                size="md" 
                onClick={() => setContactOpen(true)}
              >
                Contact Sales
              </GradientButton>
            </div>
          </GlassCard>
        </motion.section>

        {/* DrinkSip Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: 'var(--space-4)',
            paddingBottom: 'var(--space-8)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="https://cdn.shopify.com/s/files/1/0407/8580/5468/files/DrinkSip_Logo_SVG.svg?v=1759624477"
            alt="DrinkSip"
            style={{ height: '28px', width: 'auto', opacity: 0.3, display: 'block' }}
          />
          <p 
            style={{ 
              fontSize: 'var(--text-micro)',
              color: 'rgba(255,255,255,0.3)',
              marginTop: 'var(--space-2)',
              textAlign: 'center',
            }}
          >
            Proudly owned by DeMarcus Lawrence
          </p>
        </motion.footer>
      </div>

      {/* Contact Sales Bottom Sheet */}
      <BottomSheet
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
        title="Contact Sales"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(value) => setEmail(value)}
            placeholder="your@email.com"
          />
          <Input
            label="Company Name"
            value={company}
            onChange={(value) => setCompany(value)}
            placeholder="Your business name"
          />
          <div>
            <label 
              className="block"
              style={{ 
                marginBottom: 'var(--space-2)',
                fontSize: 'var(--text-caption)',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us about your business..."
              rows={4}
              className="w-full rounded-xl text-white placeholder:text-white/30 resize-none"
              style={{
                padding: 'var(--space-4)',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: 'var(--text-body)',
              }}
            />
          </div>
          
          <div className="flex" style={{ gap: 'var(--space-3)', paddingTop: 'var(--space-2)' }}>
            <GhostButton 
              variant="subtle" 
              fullWidth 
              onClick={() => setContactOpen(false)}
            >
              Cancel
            </GhostButton>
            <GradientButton 
              fullWidth 
              onClick={handleContactSubmit}
              disabled={!email || !company}
            >
              Send Inquiry
            </GradientButton>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}
