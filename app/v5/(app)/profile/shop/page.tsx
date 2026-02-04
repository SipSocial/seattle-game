'use client'

/**
 * Shop Page - Full Product Carousel
 * 
 * 3D parallax product carousel with instant buy functionality.
 * Links to DrinkSip.com for now, Shopify SDK integration later.
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ProductCarousel } from '@/components/shop/ProductCarousel'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { GradientButton } from '@/components/ui/GradientButton'
import { GhostButton } from '@/components/ui/GhostButton'
import { PRODUCTS, getProductUrl, DRINKSIP_SHOP_URL, type Product } from '@/src/v5/data/products'
import { ArrowLeft, ExternalLink, Minus, Plus, ShoppingBag } from 'lucide-react'

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }

export default function ShopPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  
  const handleBuyNow = (product: Product) => {
    setSelectedProduct(product)
    setQuantity(1)
  }

  const handleCheckout = () => {
    if (selectedProduct) {
      const url = getProductUrl(selectedProduct)
      window.open(url, '_blank')
      setSelectedProduct(null)
    }
  }

  const totalPrice = selectedProduct ? (selectedProduct.price * quantity).toFixed(2) : '0.00'

  return (
    <div 
      className="min-h-full flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #000A14 0%, #001428 50%, #000A14 100%)',
      }}
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="relative z-20"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
          paddingBottom: '16px',
          paddingLeft: 'var(--space-4)',
          paddingRight: 'var(--space-4)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center" style={{ gap: 'var(--space-4)' }}>
            <Link href="/v5/profile/discover">
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
              SHOP
            </h1>
          </div>
          
          {/* Visit Store Link */}
          <a
            href={DRINKSIP_SHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center rounded-full"
            style={{ 
              padding: '8px 12px',
              gap: 'var(--space-2)',
              background: 'rgba(105,190,40,0.15)',
              color: '#69BE28',
              fontSize: 'var(--text-caption)',
              fontWeight: 600,
            }}
          >
            <span>Visit Store</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </motion.header>

      {/* DrinkSip Branding */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...spring, delay: 0.1 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingLeft: 'var(--space-6)',
          paddingRight: 'var(--space-6)',
          paddingTop: 'var(--space-2)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="https://cdn.shopify.com/s/files/1/0407/8580/5468/files/DrinkSip_Logo_SVG.svg?v=1759624477"
          alt="DrinkSip"
          style={{ height: '36px', width: 'auto', opacity: 0.9, display: 'block' }}
        />
        <p 
          style={{ 
            fontSize: 'var(--text-micro)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)',
            marginTop: 'var(--space-2)',
            textAlign: 'center',
          }}
        >
          Premium NA Craft Beer
        </p>
      </motion.div>

      {/* Product Carousel */}
      <motion.div
        className="flex-1 min-h-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...spring, delay: 0.15 }}
      >
        <ProductCarousel 
          products={PRODUCTS}
          onBuyNow={handleBuyNow}
          showFullUI
        />
      </motion.div>

      {/* Bottom padding for nav */}
      <div style={{ height: 'calc(80px + env(safe-area-inset-bottom, 0px))' }} />

      {/* Buy Sheet */}
      <BottomSheet
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title="Quick Buy"
      >
        {selectedProduct && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Product Summary */}
            <div className="flex items-center" style={{ gap: 'var(--space-4)' }}>
              <div 
                className="w-20 h-20 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(105,190,40,0.1)' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name}
                  className="w-16 h-16 object-contain"
                />
              </div>
              <div className="flex-1">
                <h3 
                  className="font-bold text-white"
                  style={{ fontSize: 'var(--text-body)' }}
                >
                  {selectedProduct.name}
                </h3>
                <p 
                  className="font-semibold"
                  style={{ 
                    fontSize: 'var(--text-body)',
                    color: '#69BE28',
                    marginTop: '2px',
                  }}
                >
                  {selectedProduct.priceLabel}
                </p>
              </div>
            </div>

            {/* Quantity Selector */}
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
                Quantity
              </label>
              <div className="flex items-center" style={{ gap: 'var(--space-4)' }}>
                <motion.button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex items-center justify-center text-xl font-bold"
                  style={{ 
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Minus className="w-5 h-5" />
                </motion.button>
                <span 
                  className="text-2xl font-bold text-white min-w-[40px] text-center"
                  style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                >
                  {quantity}
                </span>
                <motion.button
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex items-center justify-center text-xl font-bold"
                  style={{ 
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(105,190,40,0.15)',
                    color: '#69BE28',
                    border: '1px solid rgba(105,190,40,0.3)',
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Total */}
            <div 
              className="flex items-center justify-between rounded-xl"
              style={{ 
                padding: 'var(--space-4)',
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              <span 
                style={{ 
                  fontSize: 'var(--text-body)',
                  color: 'rgba(255,255,255,0.6)',
                }}
              >
                Total
              </span>
              <span 
                className="font-bold text-white"
                style={{ 
                  fontSize: 'var(--step-3)',
                  fontFamily: 'var(--font-oswald), sans-serif',
                }}
              >
                ${totalPrice}
              </span>
            </div>

            {/* Actions */}
            <div className="flex" style={{ gap: 'var(--space-3)' }}>
              <GhostButton 
                variant="subtle" 
                fullWidth 
                onClick={() => setSelectedProduct(null)}
              >
                Cancel
              </GhostButton>
              <GradientButton 
                fullWidth 
                onClick={handleCheckout}
                icon={<ShoppingBag className="w-5 h-5" />}
                iconPosition="left"
              >
                Buy on DrinkSip.com
              </GradientButton>
            </div>

            {/* Note */}
            <p 
              className="text-center"
              style={{ 
                fontSize: 'var(--text-micro)',
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              You&apos;ll be redirected to DrinkSip.com to complete your purchase
            </p>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
