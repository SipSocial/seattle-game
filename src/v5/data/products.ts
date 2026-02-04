/**
 * DrinkSip Product Catalog
 * 
 * Product data for the shop carousel and discovery page.
 * Links to DrinkSip.com for now, Shopify SDK later.
 */

export interface Product {
  id: string
  name: string
  shortName: string
  description: string
  price: number
  priceLabel: string
  image: string
  badge?: 'NEW' | 'LIMITED' | 'BEST SELLER'
  shopifyHandle?: string
  available: boolean
}

export const PRODUCTS: Product[] = [
  {
    id: '311-hazy-ipa',
    name: '311 Hazy IPA',
    shortName: '311 Hazy',
    description: 'Collaboration with 311. Tropical hops, smooth finish. The ultimate session IPA.',
    price: 14.99,
    priceLabel: '$14.99 / 6-pack',
    image: 'https://cdn.shopify.com/s/files/1/0407/8580/5468/files/311_Hazy_IPA_607644d9-92cb-4a02-af68-0eb18d34063a.png?v=1759017824',
    badge: 'NEW',
    shopifyHandle: '311-hazy-ipa',
    available: true,
  },
  {
    id: 'hazy-ipa',
    name: 'Hazy IPA',
    shortName: 'Hazy IPA',
    description: 'Juicy, hazy, packed with flavor. Bold hops without the buzz.',
    price: 13.99,
    priceLabel: '$13.99 / 6-pack',
    image: 'https://cdn.shopify.com/s/files/1/0407/8580/5468/files/Hazy_IPA_0645f5ce-2ec5-4fda-87ee-fb36a4ee4295.png?v=1759017824',
    badge: 'BEST SELLER',
    shopifyHandle: 'hazy-ipa',
    available: true,
  },
  {
    id: 'deftones-tone-zero',
    name: 'Deftones Tone Zero Lager',
    shortName: 'Tone Zero',
    description: 'Collaboration with Deftones. Clean, crisp, zero-proof lager with attitude.',
    price: 14.99,
    priceLabel: '$14.99 / 6-pack',
    image: 'https://cdn.shopify.com/s/files/1/0407/8580/5468/files/Deftones_Tone_Zero_Lager_dcc52426-36ee-42ee-a3b5-b49f7d2d7480.png?v=1759017824',
    badge: 'LIMITED',
    shopifyHandle: 'deftones-tone-zero-lager',
    available: true,
  },
  {
    id: 'blood-orange-refresher',
    name: 'Blood Orange Refresher',
    shortName: 'Blood Orange',
    description: 'Bright citrus burst. Sparkling, refreshing, perfect for any occasion.',
    price: 12.99,
    priceLabel: '$12.99 / 6-pack',
    image: 'https://cdn.shopify.com/s/files/1/0407/8580/5468/files/Blood_Orange_Refresher_82f1cfff-dfdd-44c5-bb02-6f8e74183f36.png?v=1759017824',
    shopifyHandle: 'blood-orange-refresher',
    available: true,
  },
  {
    id: 'watermelon-refresher',
    name: 'Watermelon Refresher',
    shortName: 'Watermelon',
    description: 'Sweet summer vibes. Natural watermelon flavor, zero calories.',
    price: 12.99,
    priceLabel: '$12.99 / 6-pack',
    image: 'https://cdn.shopify.com/s/files/1/0407/8580/5468/files/Watermelon_Refresher_e64ca8fe-8af8-43b5-8b3a-d20dc04152c2.png?v=1759017823',
    badge: 'BEST SELLER',
    shopifyHandle: 'watermelon-refresher',
    available: true,
  },
  {
    id: 'lemon-lime-refresher',
    name: 'Lemon Lime Refresher',
    shortName: 'Lemon Lime',
    description: 'Classic citrus combo. Crisp, clean, endlessly refreshing.',
    price: 12.99,
    priceLabel: '$12.99 / 6-pack',
    image: 'https://cdn.shopify.com/s/files/1/0407/8580/5468/files/Lemon_Lime_Refresher_9565ca39-8832-48ab-8c6b-bcd0899f87e9.png?v=1759017824',
    shopifyHandle: 'lemon-lime-refresher',
    available: true,
  },
]

// Shop URL for external links
export const DRINKSIP_SHOP_URL = 'https://drinksip.com/collections/all'

export function getProductUrl(product: Product): string {
  if (product.shopifyHandle) {
    return `https://drinksip.com/products/${product.shopifyHandle}`
  }
  return DRINKSIP_SHOP_URL
}
