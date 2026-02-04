/**
 * Retail Partners Data
 * 
 * Where to buy DrinkSip products in the Seattle area.
 */

export interface Retailer {
  id: string
  name: string
  logo: string
  description: string
  website?: string
  mapUrl?: string
  locations: string
  featured: boolean
}

export const RETAILERS: Retailer[] = [
  {
    id: 'total-wine',
    name: 'Total Wine & More',
    logo: '/retailers/total-wine.png',
    description: 'Premium selection of NA beverages. Multiple Seattle locations.',
    website: 'https://www.totalwine.com',
    mapUrl: 'https://maps.google.com/?q=Total+Wine+Seattle',
    locations: '6 locations in Seattle metro',
    featured: true,
  },
  {
    id: 'bevmo',
    name: 'BevMo!',
    logo: '/retailers/bevmo.png',
    description: 'Your one-stop beverage destination.',
    website: 'https://www.bevmo.com',
    mapUrl: 'https://maps.google.com/?q=BevMo+Seattle',
    locations: '4 locations in Seattle metro',
    featured: true,
  },
  {
    id: 'pcc',
    name: 'PCC Community Markets',
    logo: '/retailers/pcc.png',
    description: "Seattle's favorite natural grocery co-op.",
    website: 'https://www.pccmarkets.com',
    mapUrl: 'https://maps.google.com/?q=PCC+Community+Markets+Seattle',
    locations: '16 locations across Puget Sound',
    featured: true,
  },
  {
    id: 'metropolitan-market',
    name: 'Metropolitan Market',
    logo: '/retailers/metro-market.png',
    description: 'Local Seattle grocer with curated beverage selection.',
    website: 'https://metropolitan-market.com',
    mapUrl: 'https://maps.google.com/?q=Metropolitan+Market+Seattle',
    locations: '6 Seattle locations',
    featured: true,
  },
  {
    id: 'whole-foods',
    name: 'Whole Foods Market',
    logo: '/retailers/whole-foods.png',
    description: 'Quality groceries with extensive NA beer selection.',
    website: 'https://www.wholefoodsmarket.com',
    mapUrl: 'https://maps.google.com/?q=Whole+Foods+Seattle',
    locations: '10+ Seattle area stores',
    featured: false,
  },
  {
    id: 'qfc',
    name: 'QFC',
    logo: '/retailers/qfc.png',
    description: 'Quality Food Centers. Available at select locations.',
    website: 'https://www.qfc.com',
    mapUrl: 'https://maps.google.com/?q=QFC+Seattle',
    locations: 'Select Seattle locations',
    featured: false,
  },
]

// Get featured retailers only
export function getFeaturedRetailers(): Retailer[] {
  return RETAILERS.filter(r => r.featured)
}

// Get all retailers
export function getAllRetailers(): Retailer[] {
  return RETAILERS
}
