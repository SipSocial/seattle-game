'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function GiveawayPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasEntered, setHasEntered] = useState(false)
  const [entries, setEntries] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('giveawayEntries')
    if (saved) {
      setEntries(parseInt(saved))
      setHasEntered(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email')
      return
    }
    
    setIsSubmitting(true)
    setError('')
    
    await new Promise(r => setTimeout(r, 1000))
    
    localStorage.setItem('giveawayEmail', email)
    localStorage.setItem('giveawayEntries', '1')
    setEntries(1)
    setHasEntered(true)
    setIsSubmitting(false)
    
    if (navigator.vibrate) navigator.vibrate([20, 40, 20])
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #000A14 0%, #001428 50%, #000A14 100%)',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
        }}
      >
        <Link
          href="/campaign"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2}>
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        
        {hasEntered && (
          <div
            style={{
              padding: '8px 14px',
              borderRadius: '20px',
              background: 'rgba(105,190,40,0.2)',
              border: '1px solid rgba(105,190,40,0.4)',
              fontSize: '13px',
              fontWeight: 600,
              color: '#69BE28',
            }}
          >
            🎟️ {entries} {entries === 1 ? 'Entry' : 'Entries'}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main style={{ padding: '20px', paddingBottom: '60px' }}>
        
        {/* Hero Section */}
        <motion.section
          style={{ textAlign: 'center', marginBottom: '40px' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'rgba(255,215,0,0.15)',
              border: '1px solid rgba(255,215,0,0.3)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: '#FFD700',
              marginBottom: '16px',
            }}
          >
            FREE TO ENTER
          </div>
          
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 10vw, 4rem)',
              fontWeight: 900,
              lineHeight: 0.95,
              margin: 0,
              background: 'linear-gradient(180deg, #fff 20%, #FFD700 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '12px',
            }}
          >
            WIN 2 TICKETS
          </h1>
          
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
            Super Bowl LX • February 9, 2026
          </p>
        </motion.section>

        {/* Golden Ticket */}
        <motion.section
          style={{ 
            display: 'flex', 
            justifyContent: 'center',
            marginBottom: '40px',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '320px',
              aspectRatio: '2/1',
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
              borderRadius: '16px',
              padding: '20px',
              position: 'relative',
              boxShadow: '0 20px 60px rgba(255,215,0,0.3)',
            }}
          >
            {/* Ticket holes */}
            <div style={{
              position: 'absolute',
              left: '-12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '24px',
              height: '24px',
              background: '#000A14',
              borderRadius: '50%',
            }} />
            <div style={{
              position: 'absolute',
              right: '-12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '24px',
              height: '24px',
              background: '#000A14',
              borderRadius: '50%',
            }} />
            
            {/* Ticket content */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(0,0,0,0.5)', letterSpacing: '0.1em' }}>
                  ADMIT TWO
                </div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#1a1a1a', marginTop: '4px' }}>
                  SUPER BOWL LX
                </div>
              </div>
              <div style={{ fontSize: '32px' }}>🏆</div>
            </div>
            
            <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(0,0,0,0.7)' }}>February 9, 2026</div>
                <div style={{ fontSize: '10px', color: 'rgba(0,0,0,0.5)' }}>San Francisco, CA</div>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: 'rgba(0,0,0,0.2)' }}>×2</div>
            </div>
          </div>
        </motion.section>

        {/* Entry Form or Success */}
        <motion.section
          style={{ maxWidth: '400px', margin: '0 auto' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {!hasEntered ? (
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                style={{
                  width: '100%',
                  padding: '18px 20px',
                  fontSize: '16px',
                  borderRadius: '14px',
                  border: error ? '2px solid #FF6B6B' : '2px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  outline: 'none',
                  marginBottom: '12px',
                  boxSizing: 'border-box',
                }}
              />
              
              {error && (
                <p style={{ color: '#FF6B6B', fontSize: '13px', margin: '0 0 12px 4px' }}>{error}</p>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '18px',
                  fontSize: '16px',
                  fontWeight: 800,
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
                  color: '#000',
                  cursor: isSubmitting ? 'wait' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                  boxShadow: '0 8px 30px rgba(255,215,0,0.3)',
                }}
              >
                {isSubmitting ? 'Entering...' : 'ENTER TO WIN'}
              </button>
              
              <p style={{ 
                textAlign: 'center', 
                fontSize: '11px', 
                color: 'rgba(255,255,255,0.4)',
                marginTop: '16px',
                lineHeight: 1.5,
              }}>
                By entering, you agree to receive marketing emails.<br />
                No purchase necessary. Must be 21+.
              </p>
            </form>
          ) : (
            <div style={{ textAlign: 'center' }}>
              {/* Success checkmark */}
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #69BE28 0%, #4a9c1c 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  boxShadow: '0 10px 30px rgba(105,190,40,0.4)',
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth={3}>
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#69BE28', margin: '0 0 8px' }}>
                YOU'RE ENTERED!
              </h2>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: '0 0 30px' }}>
                You have <strong style={{ color: '#FFD700' }}>{entries}</strong> entry in the drawing
              </p>
              
              {/* Bonus entries box */}
              <div
                style={{
                  background: 'rgba(255,215,0,0.1)',
                  border: '1px solid rgba(255,215,0,0.25)',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '24px',
                  textAlign: 'left',
                }}
              >
                <h3 style={{ 
                  fontSize: '12px', 
                  fontWeight: 700, 
                  color: '#FFD700', 
                  margin: '0 0 16px',
                  letterSpacing: '0.1em',
                }}>
                  🎮 EARN BONUS ENTRIES
                </h3>
                
                {[
                  { action: 'Play QB Legend mode', bonus: '+1' },
                  { action: 'Play Dark Side Defense', bonus: '+1' },
                  { action: 'Win a game', bonus: '+2' },
                  { action: 'Share with friends', bonus: '+3' },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: '10px',
                      marginBottom: i < 3 ? '8px' : 0,
                    }}
                  >
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>{item.action}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#69BE28' }}>{item.bonus}</span>
                  </div>
                ))}
              </div>
              
              {/* Action buttons */}
              <Link
                href="/play"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '16px',
                  fontSize: '15px',
                  fontWeight: 700,
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #69BE28 0%, #4a9c1c 100%)',
                  color: '#000',
                  textDecoration: 'none',
                  textAlign: 'center',
                  marginBottom: '12px',
                  boxShadow: '0 8px 24px rgba(105,190,40,0.3)',
                }}
              >
                PLAY TO EARN MORE
              </Link>
              
              <Link
                href="/campaign"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '14px',
                  fontSize: '14px',
                  fontWeight: 600,
                  borderRadius: '12px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  textAlign: 'center',
                }}
              >
                Back to Campaign
              </Link>
            </div>
          )}
        </motion.section>

        {/* Sponsor */}
        <section style={{ textAlign: 'center', marginTop: '50px' }}>
          <p style={{ 
            fontSize: '10px', 
            letterSpacing: '0.2em', 
            color: 'rgba(255,255,255,0.3)',
            marginBottom: '12px',
          }}>
            PRESENTED BY
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://cdn.shopify.com/s/files/1/0407/8580/5468/files/DrinkSip_Logo_SVG.svg"
            alt="DrinkSip"
            style={{ height: '28px', opacity: 0.6 }}
          />
          <p style={{ 
            fontSize: '11px', 
            color: 'rgba(255,255,255,0.25)',
            marginTop: '8px',
          }}>
            DrinkSip × DeMarcus Lawrence
          </p>
        </section>
      </main>
    </div>
  )
}
