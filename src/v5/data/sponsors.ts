/**
 * Sponsor Data
 * 
 * Partners and sponsors for the Dark Side Football app.
 * Organized by tier: Presenting, Major, Supporting
 */

export type SponsorTier = 'presenting' | 'major' | 'supporting'

export interface Sponsor {
  id: string
  name: string
  tier: SponsorTier
  logo: string
  website: string
  description: string
  tagline?: string
}

export const SPONSORS: Sponsor[] = [
  // Presenting Sponsor
  {
    id: 'drinksip',
    name: 'DrinkSip',
    tier: 'presenting',
    logo: 'https://cdn.shopify.com/s/files/1/0407/8580/5468/files/DrinkSip_Logo_SVG.svg?v=1759624477',
    website: 'https://drinksip.com',
    description: 'Non-alcoholic craft beer. Proudly owned by DeMarcus Lawrence.',
    tagline: 'Sip Different',
  },
  
  // Major Sponsors
  {
    id: 'kjr-radio',
    name: 'KJR Radio',
    tier: 'major',
    logo: '/sponsors/kjr-radio.png',
    website: 'https://www.kjram.com',
    description: "Seattle's home for sports talk. Covering the Seahawks 24/7.",
    tagline: 'Sports Radio 93.3 KJR',
  },
  {
    id: 'simply-seattle',
    name: 'Simply Seattle',
    tier: 'major',
    logo: '/sponsors/simply-seattle.png',
    website: 'https://simplyseattle.com',
    description: 'The best Seattle sports apparel and gear. Local and authentic.',
    tagline: 'Seattle Sports Apparel',
  },
  
  // Supporting Sponsors
  {
    id: 'fat-zachs',
    name: "Fat Zach's Pizza",
    tier: 'supporting',
    logo: '/sponsors/fat-zachs.png',
    website: 'https://fatzachspizza.com',
    description: 'Legendary pizza in Tacoma & Seattle. Game day headquarters.',
    tagline: 'Best Pizza in the PNW',
  },
]

// Helper to get sponsors by tier
export function getSponsorsByTier(tier: SponsorTier): Sponsor[] {
  return SPONSORS.filter(s => s.tier === tier)
}

// Get all sponsors grouped by tier
export function getSponsorsGrouped(): Record<SponsorTier, Sponsor[]> {
  return {
    presenting: getSponsorsByTier('presenting'),
    major: getSponsorsByTier('major'),
    supporting: getSponsorsByTier('supporting'),
  }
}

// Tier display labels
export const TIER_LABELS: Record<SponsorTier, string> = {
  presenting: 'Presenting Partner',
  major: 'Major Partners',
  supporting: 'Supporting Partners',
}
