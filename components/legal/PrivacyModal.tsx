'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface LegalModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PrivacyModal({ isOpen, onClose }: LegalModalProps) {
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
                  Privacy Policy
                </h1>
                <p
                  className="uppercase tracking-widest"
                  style={{ fontSize: 'var(--text-micro)', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}
                >
                  DrinkSip LLC • Effective: February 2026
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
                paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 40px)',
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
                <Section title="1. Introduction">
                  <p>
                    DrinkSip LLC (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) respects your privacy and is committed 
                    to protecting your personal information. This Privacy Policy explains how we collect, 
                    use, disclose, and safeguard your information when you use our Dark Side Football game 
                    and related services (the &ldquo;Services&rdquo;).
                  </p>
                  <p>
                    Please read this Privacy Policy carefully. By accessing or using our Services, you 
                    acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.
                  </p>
                </Section>

                <Section title="2. Information We Collect">
                  <Subsection title="2.1 Information You Provide Directly">
                    <p>We may collect the following information that you voluntarily provide:</p>
                    <ul>
                      <li><strong>Contact Information:</strong> Email address, name, and phone number (optional)</li>
                      <li><strong>Shipping Information:</strong> Physical address for prize fulfillment purposes</li>
                      <li><strong>Account Information:</strong> Username or display name, if you create an account</li>
                      <li><strong>Age Verification:</strong> Date of birth or age confirmation for age-restricted promotions</li>
                      <li><strong>Communication Records:</strong> Content of emails or messages you send to us</li>
                    </ul>
                  </Subsection>

                  <Subsection title="2.2 Information Collected Automatically">
                    <p>When you use our Services, we may automatically collect:</p>
                    <ul>
                      <li><strong>Device Information:</strong> Device type, operating system, unique device identifiers, and mobile network information</li>
                      <li><strong>Usage Data:</strong> Game statistics, scores, play patterns, session duration, and feature usage</li>
                      <li><strong>Log Data:</strong> IP address, browser type, access times, pages viewed, and referring URL</li>
                      <li><strong>Location Data:</strong> Approximate geographic location based on IP address (city/state level only)</li>
                    </ul>
                  </Subsection>

                  <Subsection title="2.3 Cookies and Tracking Technologies">
                    <p>We use cookies, web beacons, and similar tracking technologies to:</p>
                    <ul>
                      <li>Remember your preferences and settings</li>
                      <li>Analyze usage patterns and improve our Services</li>
                      <li>Deliver targeted content and promotional messages</li>
                      <li>Measure the effectiveness of our marketing campaigns</li>
                    </ul>
                    <p>
                      You can control cookies through your browser settings, but disabling cookies may 
                      limit your ability to use certain features of our Services.
                    </p>
                  </Subsection>
                </Section>

                <Section title="3. How We Use Your Information">
                  <p>We use the information we collect for the following purposes:</p>
                  
                  <Subsection title="3.1 Service Delivery">
                    <ul>
                      <li>Provide, maintain, and improve our Services</li>
                      <li>Process prize entries and fulfill prizes to winners</li>
                      <li>Communicate with you about promotions, updates, and customer service</li>
                      <li>Personalize your experience and deliver relevant content</li>
                    </ul>
                  </Subsection>

                  <Subsection title="3.2 Analytics and Improvement">
                    <ul>
                      <li>Analyze usage patterns to improve game mechanics and user experience</li>
                      <li>Conduct research and development for new features</li>
                      <li>Monitor and analyze trends, usage, and activities</li>
                      <li>Detect, investigate, and prevent fraudulent or unauthorized activities</li>
                    </ul>
                  </Subsection>

                  <Subsection title="3.3 Marketing and Promotions">
                    <ul>
                      <li>Send promotional communications (with your consent where required)</li>
                      <li>Administer sweepstakes, contests, and other promotions</li>
                      <li>Deliver targeted advertising and measure campaign effectiveness</li>
                    </ul>
                  </Subsection>

                  <Subsection title="3.4 Legal and Safety">
                    <ul>
                      <li>Comply with legal obligations and regulatory requirements</li>
                      <li>Enforce our Terms of Service and protect our rights</li>
                      <li>Protect the safety and security of our users and third parties</li>
                    </ul>
                  </Subsection>
                </Section>

                <Section title="4. Information Sharing">
                  <p>
                    We do not sell your personal information. We may share your information in the 
                    following limited circumstances:
                  </p>

                  <Subsection title="4.1 Prize Fulfillment Partners">
                    <p>
                      We share shipping information with third-party fulfillment partners solely for 
                      the purpose of delivering prizes. These partners are contractually obligated to 
                      use your information only for prize delivery and to maintain appropriate security measures.
                    </p>
                  </Subsection>

                  <Subsection title="4.2 Service Providers">
                    <p>
                      We may share information with service providers who perform services on our behalf, 
                      including:
                    </p>
                    <ul>
                      <li>Hosting and infrastructure providers</li>
                      <li>Analytics and data processing services</li>
                      <li>Email and communication platforms</li>
                      <li>Payment processors (if applicable)</li>
                    </ul>
                  </Subsection>

                  <Subsection title="4.3 Legal Requirements">
                    <p>
                      We may disclose information if required to do so by law or in response to valid 
                      requests by public authorities (e.g., court order, subpoena, or government investigation).
                    </p>
                  </Subsection>

                  <Subsection title="4.4 Business Transfers">
                    <p>
                      In the event of a merger, acquisition, or sale of assets, your information may be 
                      transferred as part of that transaction. We will notify you of any such change.
                    </p>
                  </Subsection>

                  <Subsection title="4.5 With Your Consent">
                    <p>
                      We may share your information for other purposes with your explicit consent.
                    </p>
                  </Subsection>
                </Section>

                <Section title="5. Location Data">
                  <p>
                    <strong>IP-Based Location:</strong> We collect approximate geographic location (city/state) 
                    based on your IP address to verify eligibility for U.S.-only promotions, deliver 
                    relevant content, and analyze regional usage patterns.
                  </p>
                  <p>
                    <strong>Device Location:</strong> We do not request access to precise GPS location data 
                    from your device. If we introduce features requiring precise location in the future, 
                    we will obtain your explicit consent first.
                  </p>
                </Section>

                <Section title="6. Data Retention">
                  <p>
                    We retain your personal information for as long as necessary to fulfill the purposes 
                    outlined in this Privacy Policy, unless a longer retention period is required or 
                    permitted by law. Specifically:
                  </p>
                  <ul>
                    <li><strong>Account Information:</strong> Retained while your account is active and for 3 years after last activity</li>
                    <li><strong>Prize Fulfillment Data:</strong> Retained for 7 years for tax and legal compliance</li>
                    <li><strong>Analytics Data:</strong> Retained in aggregated, anonymized form indefinitely</li>
                    <li><strong>Marketing Preferences:</strong> Retained until you opt out or request deletion</li>
                  </ul>
                  <p>
                    Upon request, we will delete or anonymize your personal information within 30 days, 
                    except where retention is required for legal compliance.
                  </p>
                </Section>

                <Section title="7. Data Security">
                  <p>
                    We implement appropriate technical and organizational measures to protect your 
                    personal information, including:
                  </p>
                  <ul>
                    <li>Encryption of data in transit using TLS/SSL</li>
                    <li>Secure storage with access controls and authentication</li>
                    <li>Regular security assessments and monitoring</li>
                    <li>Employee training on data protection practices</li>
                  </ul>
                  <p>
                    However, no method of transmission over the Internet or electronic storage is 100% 
                    secure. While we strive to use commercially acceptable means to protect your 
                    information, we cannot guarantee absolute security.
                  </p>
                </Section>

                <Section title="8. Your Rights and Choices">
                  <Subsection title="8.1 Access and Portability">
                    <p>
                      You have the right to request access to the personal information we hold about you. 
                      Upon verified request, we will provide your information in a commonly used, 
                      machine-readable format.
                    </p>
                  </Subsection>

                  <Subsection title="8.2 Correction">
                    <p>
                      You may request that we correct inaccurate or incomplete personal information.
                    </p>
                  </Subsection>

                  <Subsection title="8.3 Deletion">
                    <p>
                      You may request deletion of your personal information. We will comply except where 
                      retention is necessary for legal compliance, completion of transactions, or 
                      legitimate business purposes.
                    </p>
                  </Subsection>

                  <Subsection title="8.4 Opt-Out of Marketing">
                    <p>
                      You may opt out of marketing communications at any time by clicking the &ldquo;unsubscribe&rdquo; 
                      link in our emails or contacting us directly. Note that you may still receive 
                      transactional communications (e.g., prize notifications, account updates).
                    </p>
                  </Subsection>

                  <Subsection title="8.5 How to Exercise Your Rights">
                    <p>
                      To exercise any of these rights, please contact us at privacy@drinksip.com. We will 
                      respond to verified requests within 45 days. We may request additional information 
                      to verify your identity.
                    </p>
                  </Subsection>
                </Section>

                <Section title="9. California Privacy Rights (CCPA/CPRA)">
                  <p>
                    If you are a California resident, you have additional rights under the California 
                    Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA):
                  </p>
                  
                  <Subsection title="9.1 Right to Know">
                    <p>
                      You have the right to request information about the categories and specific pieces 
                      of personal information we have collected, the sources of collection, our business 
                      purposes, and the categories of third parties with whom we share information.
                    </p>
                  </Subsection>

                  <Subsection title="9.2 Right to Delete">
                    <p>
                      You have the right to request deletion of your personal information, subject to 
                      certain exceptions.
                    </p>
                  </Subsection>

                  <Subsection title="9.3 Right to Opt-Out of Sale/Sharing">
                    <p>
                      <strong>We do not sell personal information.</strong> We do not share personal 
                      information for cross-context behavioral advertising purposes.
                    </p>
                  </Subsection>

                  <Subsection title="9.4 Right to Non-Discrimination">
                    <p>
                      We will not discriminate against you for exercising your privacy rights.
                    </p>
                  </Subsection>

                  <Subsection title="9.5 Authorized Agents">
                    <p>
                      You may designate an authorized agent to make requests on your behalf. We require 
                      written authorization and identity verification.
                    </p>
                  </Subsection>

                  <Subsection title="9.6 Financial Incentives">
                    <p>
                      Participation in our promotional activities may require submission of personal 
                      information. The value of this information is reasonably related to the prizes 
                      offered and the cost of administering promotions.
                    </p>
                  </Subsection>
                </Section>

                <Section title="10. Children&apos;s Privacy">
                  <p>
                    Our Services are not intended for children under 13 years of age. We do not knowingly 
                    collect personal information from children under 13. If we become aware that we have 
                    collected personal information from a child under 13, we will take steps to delete 
                    such information promptly.
                  </p>
                  <p>
                    If you are a parent or guardian and believe your child has provided us with personal 
                    information, please contact us at privacy@drinksip.com.
                  </p>
                </Section>

                <Section title="11. Third-Party Links">
                  <p>
                    Our Services may contain links to third-party websites or services. We are not 
                    responsible for the privacy practices of these third parties. We encourage you to 
                    review the privacy policies of any third-party sites you visit.
                  </p>
                </Section>

                <Section title="12. International Users">
                  <p>
                    Our Services are operated in the United States and intended for U.S. residents. 
                    If you access our Services from outside the United States, please be aware that 
                    your information may be transferred to, stored, and processed in the United States, 
                    where data protection laws may differ from those in your jurisdiction.
                  </p>
                </Section>

                <Section title="13. Changes to This Policy">
                  <p>
                    We may update this Privacy Policy from time to time. We will notify you of any 
                    material changes by posting the new Privacy Policy on this page and updating the 
                    &ldquo;Effective Date&rdquo; at the top. We encourage you to review this Privacy Policy periodically.
                  </p>
                  <p>
                    Material changes will be communicated via email to registered users at least 30 days 
                    before taking effect.
                  </p>
                </Section>

                <Section title="14. Contact Us">
                  <p>
                    If you have questions, concerns, or requests regarding this Privacy Policy or our 
                    data practices, please contact us:
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
                      Privacy Team<br />
                      Email: privacy@drinksip.com<br />
                      Response Time: Within 45 days for verified requests
                    </p>
                  </div>

                  <div
                    className="rounded-xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      padding: '16px',
                      marginTop: '16px',
                    }}
                  >
                    <p style={{ margin: 0, fontSize: 'var(--text-caption)', color: 'rgba(255,255,255,0.6)' }}>
                      <strong style={{ color: 'rgba(255,255,255,0.8)' }}>For California Residents:</strong><br />
                      To exercise your CCPA/CPRA rights, email privacy@drinksip.com with the subject line 
                      &ldquo;California Privacy Request&rdquo; and include your full name and email address associated 
                      with your account.
                    </p>
                  </div>
                </Section>
              </div>
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

export default PrivacyModal
