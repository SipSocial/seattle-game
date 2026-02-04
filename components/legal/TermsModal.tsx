'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { GradientButton } from '@/components/ui/GradientButton'

interface LegalModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TermsModal({ isOpen, onClose }: LegalModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal Container */}
          <motion.div
            className="relative z-10 w-full h-full flex flex-col"
            style={{
              maxWidth: '640px',
              maxHeight: '100vh',
              background: '#002244',
            }}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between shrink-0"
              style={{
                padding: '16px 20px',
                paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(0, 34, 68, 0.95)',
              }}
            >
              <div>
                <h1
                  className="font-black uppercase tracking-wide text-white"
                  style={{ fontSize: 'var(--text-subtitle)', fontFamily: 'var(--font-oswald), sans-serif' }}
                >
                  Terms of Service
                </h1>
                <p
                  className="uppercase tracking-widest"
                  style={{ fontSize: 'var(--text-micro)', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}
                >
                  DrinkSip LLC • Last Updated: February 2026
                </p>
              </div>

              {/* Close Button */}
              <motion.button
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            {/* Scrollable Content */}
            <div
              className="flex-1 overflow-y-auto"
              style={{
                padding: '24px 20px',
                paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 100px)',
              }}
            >
              <div
                className="rounded-2xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '24px',
                }}
              >
                {/* Introduction */}
                <Section title="1. Agreement to Terms">
                  <p>
                    By accessing or using the Dark Side Football game and related promotional services 
                    (collectively, the &ldquo;Services&rdquo;) operated by DrinkSip LLC (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), 
                    you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to 
                    these Terms, you may not access or use the Services.
                  </p>
                  <p>
                    These Terms constitute a legally binding agreement between you and DrinkSip LLC 
                    governing your use of the Services. Please read them carefully.
                  </p>
                </Section>

                <Section title="2. Eligibility Requirements">
                  <p>
                    To participate in our Services and any associated promotional activities, you must:
                  </p>
                  <ul>
                    <li>Be a legal resident of the United States</li>
                    <li>Be at least 18 years of age (or the age of majority in your state of residence)</li>
                    <li>Have a valid email address for prize notification and fulfillment</li>
                    <li>Not be an employee, contractor, or immediate family member of DrinkSip LLC, its affiliates, or promotional partners</li>
                  </ul>
                  <p>
                    <strong>Age Verification:</strong> For promotions involving alcoholic beverage partners 
                    (if applicable in the future), participants must be 21 years of age or older. We reserve 
                    the right to request age verification documentation before prize fulfillment.
                  </p>
                </Section>

                <Section title="3. Sweepstakes & Promotional Rules">
                  <Subsection title="3.1 No Purchase Necessary">
                    <p>
                      <strong>NO PURCHASE OR PAYMENT OF ANY KIND IS NECESSARY TO ENTER OR WIN.</strong> A purchase 
                      or payment will not increase your chances of winning. All federal, state, and local laws 
                      and regulations apply. Void where prohibited by law.
                    </p>
                  </Subsection>

                  <Subsection title="3.2 Promotional Period">
                    <p>
                      Each promotional period, sweepstakes, or giveaway will have specific start and end dates 
                      disclosed at the time of promotion. Entries received outside the promotional period will 
                      not be eligible for prizes.
                    </p>
                  </Subsection>

                  <Subsection title="3.3 Entry Methods">
                    <p>
                      Eligible participants may enter promotions through the methods specified for each 
                      individual promotion, which may include but are not limited to: game participation, 
                      email registration, or alternate methods of entry as disclosed.
                    </p>
                  </Subsection>

                  <Subsection title="3.4 Winner Selection & Notification">
                    <p>
                      Winners will be selected at random from all eligible entries unless otherwise specified. 
                      Winners will be notified via the email address provided at registration within 5 business 
                      days of selection. Failure to respond within 14 days may result in forfeiture of prize.
                    </p>
                  </Subsection>

                  <Subsection title="3.5 Odds of Winning">
                    <p>
                      Odds of winning depend on the total number of eligible entries received during the 
                      promotional period.
                    </p>
                  </Subsection>
                </Section>

                <Section title="4. Prize Fulfillment Terms">
                  <Subsection title="4.1 General Prize Conditions">
                    <p>
                      All prizes are non-transferable, non-exchangeable, and have no cash value unless otherwise 
                      specified. No prize substitution permitted except at the sole discretion of DrinkSip LLC, 
                      which reserves the right to substitute a prize of equal or greater value.
                    </p>
                  </Subsection>

                  <Subsection title="4.2 Travel Prize Disclaimers">
                    <p>
                      For travel prizes including airline tickets, hotel accommodations, or event tickets:
                    </p>
                    <ul>
                      <li>Travel dates and arrangements are subject to availability and blackout dates</li>
                      <li>Winner is responsible for all ground transportation, meals, and incidental expenses unless explicitly stated</li>
                      <li>Valid government-issued photo ID and/or passport required for travel</li>
                      <li>Travel companions must meet all eligibility requirements</li>
                      <li>DrinkSip LLC is not responsible for flight delays, cancellations, or other travel disruptions</li>
                      <li>Travel prizes must be redeemed within 12 months of notification unless otherwise specified</li>
                      <li>Failure to meet eligibility requirements may result in forfeiture of travel prize</li>
                    </ul>
                  </Subsection>

                  <Subsection title="4.3 Food & Beverage Promotional Items">
                    <p>
                      Promotional products and prizes may include food, beverages, and related merchandise. 
                      Recipients acknowledge and accept all responsibility for any dietary restrictions, 
                      allergies, or health considerations. DrinkSip LLC makes no representations regarding 
                      nutritional content or allergen information beyond what is provided by product manufacturers.
                    </p>
                  </Subsection>

                  <Subsection title="4.4 Tax Responsibility">
                    <p>
                      All federal, state, and local taxes on prizes are the sole responsibility of the winner. 
                      Winners may be required to complete IRS Form W-9 for prizes valued at $600 or more. 
                      Failure to provide required tax documentation may result in prize forfeiture.
                    </p>
                  </Subsection>
                </Section>

                <Section title="5. Food & Beverage Industry Compliance">
                  <p>
                    DrinkSip LLC operates primarily in the non-alcoholic beverage sector. Our promotional 
                    activities focus on non-alcoholic products and are designed to be appropriate for 
                    participants of legal age (18+).
                  </p>
                  <p>
                    <strong>Alcohol-Related Promotions:</strong> Any future promotions involving alcoholic 
                    beverage partners will be clearly marked and will require age verification (21+ for U.S. 
                    residents). Such promotions will comply with all applicable alcohol advertising and 
                    promotional regulations in applicable jurisdictions.
                  </p>
                  <p>
                    We encourage responsible consumption of all food and beverage products and do not 
                    encourage excessive consumption of any products, alcoholic or otherwise.
                  </p>
                </Section>

                <Section title="6. User Data & Consent">
                  <p>
                    By participating in our Services, you consent to the collection, use, and disclosure 
                    of your personal information as described in our Privacy Policy. This includes:
                  </p>
                  <ul>
                    <li>Collection of email address, name, and shipping address for prize fulfillment</li>
                    <li>Communication regarding promotional activities, winners, and new promotions</li>
                    <li>Sharing of necessary information with prize fulfillment partners</li>
                    <li>Use of aggregate, anonymized data for analytics and service improvement</li>
                  </ul>
                  <p>
                    You may withdraw consent at any time by contacting us at legal@drinksip.com, 
                    understanding that withdrawal may affect your ability to participate in promotions 
                    or receive prizes.
                  </p>
                </Section>

                <Section title="7. Intellectual Property">
                  <p>
                    All content, graphics, user interface, trademarks, logos, and software associated with 
                    the Services are owned by or licensed to DrinkSip LLC and are protected by copyright, 
                    trademark, and other intellectual property laws.
                  </p>
                  <p>
                    The &ldquo;Dark Side Football&rdquo; name, game mechanics, and associated branding are proprietary 
                    to DrinkSip LLC. Unauthorized use, reproduction, or distribution is strictly prohibited.
                  </p>
                </Section>

                <Section title="8. Limitation of Liability">
                  <p className="uppercase" style={{ color: '#69BE28', fontWeight: 700 }}>
                    PLEASE READ THIS SECTION CAREFULLY AS IT LIMITS OUR LIABILITY TO YOU.
                  </p>
                  <p>
                    TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, DRINKSIP LLC, ITS AFFILIATES, 
                    OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AND PROMOTIONAL PARTNERS SHALL NOT BE 
                    LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, 
                    INCLUDING BUT NOT LIMITED TO:
                  </p>
                  <ul>
                    <li>Loss of profits, data, use, or goodwill</li>
                    <li>Personal injury or property damage arising from your participation in the Services</li>
                    <li>Any conduct or content of any third party related to the Services</li>
                    <li>Unauthorized access, use, or alteration of your data</li>
                    <li>Travel-related incidents, accidents, or injuries during prize fulfillment</li>
                    <li>Technical failures, service interruptions, or data loss</li>
                  </ul>
                  <p>
                    IN NO EVENT SHALL OUR AGGREGATE LIABILITY EXCEED THE GREATER OF ONE HUNDRED DOLLARS 
                    ($100) OR THE AMOUNT YOU PAID US, IF ANY, IN THE PAST SIX MONTHS FOR THE SERVICES 
                    GIVING RISE TO THE CLAIM.
                  </p>
                  <p>
                    SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES, SO 
                    SOME OF THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU.
                  </p>
                </Section>

                <Section title="9. Indemnification">
                  <p>
                    You agree to indemnify, defend, and hold harmless DrinkSip LLC, its affiliates, officers, 
                    directors, employees, agents, and promotional partners from and against any and all claims, 
                    damages, obligations, losses, liabilities, costs, and expenses (including reasonable 
                    attorney&apos;s fees) arising from:
                  </p>
                  <ul>
                    <li>Your use of and access to the Services</li>
                    <li>Your violation of these Terms</li>
                    <li>Your violation of any third-party right, including intellectual property rights</li>
                    <li>Any claim that your actions caused damage to a third party</li>
                  </ul>
                </Section>

                <Section title="10. Disclaimer of Warranties">
                  <p>
                    THE SERVICES ARE PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, 
                    EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF 
                    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                  </p>
                  <p>
                    DrinkSip LLC does not warrant that the Services will be uninterrupted, error-free, 
                    secure, or free of viruses or other harmful components.
                  </p>
                </Section>

                <Section title="11. Dispute Resolution & Arbitration">
                  <p>
                    Any dispute, controversy, or claim arising out of or relating to these Terms or the 
                    Services shall be resolved through binding arbitration administered by the American 
                    Arbitration Association in accordance with its Commercial Arbitration Rules.
                  </p>
                  <p>
                    <strong>Class Action Waiver:</strong> YOU AGREE THAT ANY CLAIMS WILL BE BROUGHT IN 
                    YOUR INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED 
                    CLASS OR REPRESENTATIVE PROCEEDING.
                  </p>
                  <p>
                    The arbitration shall be conducted in the State of Washington, and judgment on the 
                    award may be entered in any court having jurisdiction thereof.
                  </p>
                </Section>

                <Section title="12. Governing Law">
                  <p>
                    These Terms shall be governed by and construed in accordance with the laws of the 
                    State of Washington, United States, without regard to its conflict of law provisions.
                  </p>
                </Section>

                <Section title="13. Modifications to Terms">
                  <p>
                    DrinkSip LLC reserves the right to modify these Terms at any time. Material changes 
                    will be communicated via email or prominent notice on our Services. Your continued 
                    use of the Services following any modifications constitutes acceptance of the updated Terms.
                  </p>
                </Section>

                <Section title="14. Severability">
                  <p>
                    If any provision of these Terms is found to be unenforceable or invalid, that provision 
                    shall be limited or eliminated to the minimum extent necessary so that these Terms shall 
                    otherwise remain in full force and effect.
                  </p>
                </Section>

                <Section title="15. Entire Agreement">
                  <p>
                    These Terms, together with our Privacy Policy and any additional terms for specific 
                    promotions, constitute the entire agreement between you and DrinkSip LLC regarding 
                    the use of the Services.
                  </p>
                </Section>

                <Section title="16. Contact Information">
                  <p>
                    For questions about these Terms of Service, please contact:
                  </p>
                  <div
                    className="rounded-xl"
                    style={{
                      background: 'rgba(105, 190, 40, 0.1)',
                      border: '1px solid rgba(105, 190, 40, 0.2)',
                      padding: '16px',
                      marginTop: '12px',
                    }}
                  >
                    <p style={{ margin: 0, fontWeight: 600 }}>DrinkSip LLC</p>
                    <p style={{ margin: '4px 0 0 0', color: 'rgba(255,255,255,0.7)' }}>
                      Legal Department<br />
                      Email: legal@drinksip.com
                    </p>
                  </div>
                </Section>
              </div>
            </div>

            {/* Footer with Accept Button */}
            <div
              className="shrink-0"
              style={{
                padding: '16px 20px',
                paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(0, 34, 68, 0.98)',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
              }}
            >
              <GradientButton size="lg" fullWidth onClick={onClose}>
                I Agree to Terms of Service
              </GradientButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Helper Components
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <h2
        className="font-bold uppercase tracking-wide"
        style={{
          fontSize: 'var(--text-body)',
          color: '#69BE28',
          marginBottom: '12px',
          fontFamily: 'var(--font-oswald), sans-serif',
        }}
      >
        {title}
      </h2>
      <div
        className="legal-content"
        style={{
          fontSize: 'var(--text-body)',
          color: 'rgba(255, 255, 255, 0.85)',
          lineHeight: 1.7,
        }}
      >
        {children}
      </div>
      <style jsx>{`
        .legal-content p {
          margin-bottom: 12px;
        }
        .legal-content p:last-child {
          margin-bottom: 0;
        }
        .legal-content ul {
          margin: 12px 0;
          padding-left: 24px;
        }
        .legal-content li {
          margin-bottom: 8px;
          position: relative;
        }
        .legal-content li::marker {
          color: #69BE28;
        }
        .legal-content strong {
          color: #fff;
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: '16px', marginBottom: '16px' }}>
      <h3
        className="font-semibold"
        style={{
          fontSize: 'var(--text-body)',
          color: 'rgba(255, 255, 255, 0.9)',
          marginBottom: '8px',
        }}
      >
        {title}
      </h3>
      <div
        className="legal-content"
        style={{
          fontSize: 'var(--text-body)',
          color: 'rgba(255, 255, 255, 0.85)',
          lineHeight: 1.7,
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default TermsModal
