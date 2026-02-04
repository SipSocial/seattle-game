'use client'

/**
 * Help & FAQ Page - Comprehensive help center with expandable FAQ
 * 
 * Features:
 * - Expandable FAQ accordion with spring animations
 * - Contact section with email and social links
 * - Legal links (Terms, Privacy)
 * - Back navigation to profile
 */

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import { 
  ArrowLeft, 
  ChevronDown, 
  Mail, 
  MessageCircle,
  Twitter,
  Instagram,
  HelpCircle,
  Ticket,
  Calendar,
  Gift,
  Gamepad2,
  Headphones,
  FileText,
  Lock,
  ExternalLink,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { GhostButton } from '@/components/ui/GhostButton'

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }

// FAQ Data
const faqItems = [
  {
    id: 'earn-entries',
    icon: <Ticket className="w-5 h-5 text-[#69BE28]" />,
    question: 'How do I earn entries?',
    answer: `There are multiple ways to earn entries into the Big Game Giveaway:

• **Play the Game** – Each game session earns you entries based on your performance. The better you play, the more entries you earn!

• **Make Picks** – Complete your weekly prop predictions to earn 10 bonus entries.

• **Share the App** – Share Dark Side Football with friends to earn 5 entries per share.

• **Scan Products** – Purchase DrinkSip products and scan the QR code to earn 20 entries per product.

• **Daily Check-in** – Open the app daily to earn 1 bonus entry.`
  },
  {
    id: 'drawing-date',
    icon: <Calendar className="w-5 h-5 text-[#69BE28]" />,
    question: 'When is the drawing?',
    answer: `The Grand Prize Drawing will take place on **Saturday, February 8, 2026 at 2:00 PM PT**.

Winners will be notified via email and push notification within 24 hours of the drawing. Make sure your contact information is up to date!

You can track the countdown on your Profile page.`
  },
  {
    id: 'prizes',
    icon: <Gift className="w-5 h-5 text-[#69BE28]" />,
    question: 'What are the prizes?',
    answer: `**Grand Prize (1 Winner)**
• 2 tickets to the Big Game in New Orleans
• Round-trip airfare for 2
• 3-night hotel stay
• $1,000 spending cash
• VIP pre-game experience

**Second Prize (5 Winners)**
• $500 DrinkSip gift card
• Signed Seahawks merchandise
• 1-year DrinkSip subscription

**Third Prize (25 Winners)**
• $100 DrinkSip gift card
• Dark Side Football merch pack

**Daily Prizes**
• Random winners selected daily for DrinkSip product bundles`
  },
  {
    id: 'how-game-works',
    icon: <Gamepad2 className="w-5 h-5 text-[#69BE28]" />,
    question: 'How does the game work?',
    answer: `Dark Side Defense is a football strategy game where you call defensive plays to stop the opposing offense.

**Gameplay:**
1. Choose your defensive formation
2. Select your coverage type (Man, Zone, Blitz)
3. Try to predict the offensive play and counter it
4. Earn points for stops, sacks, and turnovers

**Scoring:**
• Tackle for loss: +10 points
• Sack: +25 points
• Interception: +50 points
• Forced fumble: +35 points

**Campaign Mode:**
Progress through 10 weeks of the season, facing increasingly difficult opponents. Complete all weeks to unlock bonus content!

**Entries:**
Your game score is converted to entries. Roughly 100 points = 1 entry.`
  },
  {
    id: 'contact-support',
    icon: <Headphones className="w-5 h-5 text-[#69BE28]" />,
    question: 'How do I contact support?',
    answer: `We're here to help! You can reach us through:

**Email Support**
support@drinksip.com
Response time: Within 24 hours

**Social Media**
DM us on Twitter or Instagram @DrinkSip

**Live Chat**
Available in the app during business hours:
Mon-Fri 9am-6pm PT

For urgent issues regarding prizes or account access, please email us with "URGENT" in the subject line.`
  },
]

// Accordion Item Component
function AccordionItem({ 
  item, 
  isOpen, 
  onToggle,
  index,
}: { 
  item: typeof faqItems[0]
  isOpen: boolean
  onToggle: () => void
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.1 + index * 0.05 }}
    >
      <GlassCard 
        padding="none"
        variant={isOpen ? 'green' : 'default'}
        style={{ overflow: 'hidden' }}
      >
        {/* Question Header */}
        <motion.button
          onClick={onToggle}
          className="w-full flex items-center gap-4 text-left"
          style={{
            padding: '16px 20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
          whileTap={{ scale: 0.99 }}
        >
          {/* Icon */}
          <div 
            className="shrink-0 flex items-center justify-center rounded-xl"
            style={{
              width: '40px',
              height: '40px',
              background: isOpen 
                ? 'rgba(105, 190, 40, 0.2)' 
                : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${isOpen ? 'rgba(105, 190, 40, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
            }}
          >
            {item.icon}
          </div>
          
          {/* Question */}
          <span 
            className="flex-1"
            style={{
              fontSize: 'var(--text-body)',
              fontWeight: 600,
              color: isOpen ? '#69BE28' : 'white',
              letterSpacing: '0.02em',
            }}
          >
            {item.question}
          </span>
          
          {/* Chevron */}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <ChevronDown 
              className="w-5 h-5"
              style={{ color: isOpen ? '#69BE28' : 'rgba(255, 255, 255, 0.4)' }}
            />
          </motion.div>
        </motion.button>
        
        {/* Answer Content */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ 
                height: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              style={{ overflow: 'hidden' }}
            >
              <div 
                style={{
                  padding: '0 20px 20px 20px',
                  marginLeft: '56px', // Align with question text
                }}
              >
                <div 
                  style={{
                    fontSize: 'var(--text-caption)',
                    lineHeight: 1.7,
                    color: 'rgba(255, 255, 255, 0.7)',
                    whiteSpace: 'pre-line',
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: item.answer
                      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: white; font-weight: 600;">$1</strong>')
                      .replace(/•/g, '<span style="color: #69BE28;">•</span>')
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  )
}

// Contact Link Component
function ContactLink({
  icon,
  label,
  href,
  external = false,
}: {
  icon: React.ReactNode
  label: string
  href: string
  external?: boolean
}) {
  const content = (
    <motion.div
      whileTap={{ scale: 0.97 }}
      className="flex items-center gap-4 p-4 rounded-xl"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <span className="text-[#69BE28]">{icon}</span>
      <span 
        className="flex-1"
        style={{
          fontSize: 'var(--text-body)',
          fontWeight: 500,
          color: 'white',
        }}
      >
        {label}
      </span>
      {external && (
        <ExternalLink className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
      )}
    </motion.div>
  )
  
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
        {content}
      </a>
    )
  }
  
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      {content}
    </Link>
  )
}

// Legal Link Component
function LegalLink({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode
  label: string
  href: string
}) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <motion.div
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-4 p-4 rounded-xl"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <span className="text-white/50">{icon}</span>
        <span 
          className="flex-1"
          style={{
            fontSize: 'var(--text-body)',
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.8)',
          }}
        >
          {label}
        </span>
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </motion.div>
    </Link>
  )
}

export default function HelpPage() {
  const [openId, setOpenId] = useState<string | null>(null)
  
  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id)
  }
  
  return (
    <div 
      className="min-h-full pb-24"
      style={{
        background: 'linear-gradient(180deg, #000A14 0%, #001428 100%)',
      }}
    >
      {/* Header */}
      <motion.header
        className="sticky top-0 z-20 flex items-center gap-4 px-4 py-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        style={{
          background: 'linear-gradient(180deg, rgba(0, 10, 20, 0.95) 0%, rgba(0, 10, 20, 0.8) 100%)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        {/* Back Button */}
        <Link href="/v5/profile">
          <GhostButton 
            size="sm" 
            variant="subtle"
            icon={<ArrowLeft className="w-5 h-5" />}
            iconPosition="left"
            style={{ paddingLeft: '12px', paddingRight: '16px' }}
          >
            Back
          </GhostButton>
        </Link>
        
        {/* Title */}
        <div className="flex-1 text-center">
          <h1 
            style={{
              fontSize: 'var(--text-subtitle)',
              fontWeight: 700,
              color: 'white',
              fontFamily: 'var(--font-oswald), sans-serif',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Help & FAQ
          </h1>
        </div>
        
        {/* Spacer for centering */}
        <div style={{ width: '72px' }} />
      </motion.header>

      {/* Hero Section */}
      <motion.section
        className="px-6 py-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.05 }}
      >
        <motion.div
          className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...spring, delay: 0.1 }}
          style={{ 
            background: 'linear-gradient(135deg, rgba(105, 190, 40, 0.2), rgba(105, 190, 40, 0.05))',
            border: '2px solid rgba(105, 190, 40, 0.3)',
          }}
        >
          <HelpCircle className="w-10 h-10 text-[#69BE28]" />
        </motion.div>
        
        <h2 
          style={{
            fontSize: 'var(--text-title)',
            fontWeight: 800,
            color: 'white',
            fontFamily: 'var(--font-oswald), sans-serif',
            letterSpacing: '0.05em',
            marginBottom: '8px',
          }}
        >
          How can we help?
        </h2>
        
        <p 
          style={{
            fontSize: 'var(--text-body)',
            color: 'rgba(255, 255, 255, 0.6)',
            maxWidth: '280px',
            margin: '0 auto',
          }}
        >
          Find answers to common questions or get in touch with our team.
        </p>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        className="px-6 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <h3 
          style={{
            fontSize: 'var(--text-micro)',
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(255, 255, 255, 0.4)',
            marginBottom: '16px',
          }}
        >
          Frequently Asked Questions
        </h3>
        
        <div className="space-y-3">
          {faqItems.map((item, index) => (
            <AccordionItem
              key={item.id}
              item={item}
              isOpen={openId === item.id}
              onToggle={() => toggleAccordion(item.id)}
              index={index}
            />
          ))}
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section
        className="px-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.3 }}
      >
        <h3 
          style={{
            fontSize: 'var(--text-micro)',
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(255, 255, 255, 0.4)',
            marginBottom: '16px',
          }}
        >
          Contact Us
        </h3>
        
        <div className="space-y-3">
          <ContactLink 
            icon={<Mail className="w-5 h-5" />}
            label="support@drinksip.com"
            href="mailto:support@drinksip.com"
            external
          />
          <ContactLink 
            icon={<Twitter className="w-5 h-5" />}
            label="@DrinkSip on Twitter"
            href="https://twitter.com/DrinkSip"
            external
          />
          <ContactLink 
            icon={<Instagram className="w-5 h-5" />}
            label="@DrinkSip on Instagram"
            href="https://instagram.com/DrinkSip"
            external
          />
          <ContactLink 
            icon={<MessageCircle className="w-5 h-5" />}
            label="Live Chat (9am-6pm PT)"
            href="#"
          />
        </div>
      </motion.section>

      {/* Legal Section */}
      <motion.section
        className="px-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.35 }}
      >
        <h3 
          style={{
            fontSize: 'var(--text-micro)',
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(255, 255, 255, 0.4)',
            marginBottom: '16px',
          }}
        >
          Legal
        </h3>
        
        <div className="space-y-3">
          <LegalLink 
            icon={<FileText className="w-5 h-5" />}
            label="Terms of Service"
            href="/v5/legal/terms"
          />
          <LegalLink 
            icon={<Lock className="w-5 h-5" />}
            label="Privacy Policy"
            href="/v5/legal/privacy"
          />
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="px-6 py-8 text-center"
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <p 
          style={{
            fontSize: 'var(--text-micro)',
            color: 'rgba(255, 255, 255, 0.3)',
            marginBottom: '8px',
          }}
        >
          Still have questions?
        </p>
        <a 
          href="mailto:support@drinksip.com"
          style={{
            fontSize: 'var(--text-body)',
            color: '#69BE28',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Get in touch →
        </a>
        
        <p 
          style={{
            marginTop: '24px',
            fontSize: 'var(--text-micro)',
            color: 'rgba(255,255,255,0.2)',
          }}
        >
          Dark Side Football v5.0.0
        </p>
      </motion.footer>
    </div>
  )
}
