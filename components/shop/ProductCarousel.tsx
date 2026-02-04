'use client'

/**
 * ProductCarousel - 3D Product Carousel
 * 
 * Reuses the player select pattern for products.
 * Features:
 * - 3D tilt effect on touch/mouse
 * - Smooth swipe between products
 * - Add to cart / Buy now CTAs
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GradientButton } from '@/components/ui/GradientButton'
import { GlassCard } from '@/components/ui/GlassCard'
import { NavigationArrows } from '@/components/ui/NavigationArrows'
import { DotIndicator } from '@/components/ui/DotIndicator'
import { Product, getProductUrl } from '@/src/v5/data/products'

// Spring config for smooth animations
const smoothSpring = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
  mass: 1,
}

const fastSpring = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 35,
  mass: 0.8,
}

interface ProductCarouselProps {
  products: Product[]
  onBuyNow?: (product: Product) => void
  showFullUI?: boolean
  compact?: boolean
}

export function ProductCarousel({ 
  products, 
  onBuyNow,
  showFullUI = true,
  compact = false,
}: ProductCarouselProps) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const productContainerRef = useRef<HTMLDivElement>(null)
  const productImageRef = useRef<HTMLDivElement>(null)
  
  // Smooth animation refs for 3D effect
  const targetX = useRef(0)
  const targetY = useRef(0)
  const currentX = useRef(0)
  const currentY = useRef(0)
  const animationRef = useRef<number>(0)
  const isTouching = useRef(false)

  const product = products[index]

  // Navigation
  const go = useCallback((dir: 1 | -1) => {
    setDirection(dir)
    setIndex((i) => (i + dir + products.length) % products.length)
    if (navigator.vibrate) navigator.vibrate(10)
  }, [products.length])

  // Handle buy
  const handleBuyNow = useCallback(() => {
    if (onBuyNow) {
      onBuyNow(product)
    } else {
      window.open(getProductUrl(product), '_blank')
    }
    if (navigator.vibrate) navigator.vibrate([50, 30, 100])
  }, [product, onBuyNow])

  // Keyboard nav
  useEffect(() => {
    if (!showFullUI) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [go, showFullUI])

  // 3D touch tracking (only for full UI mode)
  useEffect(() => {
    if (!showFullUI) return
    
    let cachedRect: DOMRect | null = null
    
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor
    
    const applyTransforms = () => {
      const lerpFactor = isTouching.current ? 0.12 : 0.06
      currentX.current = lerp(currentX.current, targetX.current, lerpFactor)
      currentY.current = lerp(currentY.current, targetY.current, lerpFactor)
      
      const rotateY = currentX.current * 6
      const rotateX = -currentY.current * 4
      const translateX = currentX.current * 12
      const translateY = currentY.current * 8
      
      if (productContainerRef.current) {
        productContainerRef.current.style.transform = `
          rotateY(${rotateY}deg) 
          rotateX(${rotateX}deg) 
          translateX(${translateX}px) 
          translateY(${translateY}px)
        `
      }
      
      if (productImageRef.current) {
        productImageRef.current.style.transform = `translateZ(30px) translateX(${currentX.current * 8}px)`
      }
      
      animationRef.current = requestAnimationFrame(applyTransforms)
    }
    
    animationRef.current = requestAnimationFrame(applyTransforms)
    
    const updatePosition = (clientX: number, clientY: number) => {
      if (!cachedRect) cachedRect = containerRef.current?.getBoundingClientRect() || null
      if (!cachedRect) return
      targetX.current = ((clientX - cachedRect.left) / cachedRect.width - 0.5) * 2
      targetY.current = ((clientY - cachedRect.top) / cachedRect.height - 0.5) * 2
    }

    const handleTouchStart = (e: TouchEvent) => {
      isTouching.current = true
      cachedRect = containerRef.current?.getBoundingClientRect() || null
      if (e.touches[0]) updatePosition(e.touches[0].clientX, e.touches[0].clientY)
    }
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) updatePosition(e.touches[0].clientX, e.touches[0].clientY)
    }
    
    const handleTouchEnd = () => {
      isTouching.current = false
      targetX.current = 0
      targetY.current = 0
      cachedRect = null
    }

    const handleMouseMove = (e: MouseEvent) => updatePosition(e.clientX, e.clientY)
    const handleMouseLeave = () => { targetX.current = 0; targetY.current = 0; cachedRect = null }
    const handleResize = () => { cachedRect = null }

    const container = containerRef.current
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: true })
      container.addEventListener('touchmove', handleTouchMove, { passive: true })
      container.addEventListener('touchend', handleTouchEnd, { passive: true })
      container.addEventListener('touchcancel', handleTouchEnd, { passive: true })
      container.addEventListener('mousemove', handleMouseMove, { passive: true })
      container.addEventListener('mouseleave', handleMouseLeave, { passive: true })
      window.addEventListener('resize', handleResize, { passive: true })
    }

    return () => {
      cancelAnimationFrame(animationRef.current)
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart)
        container.removeEventListener('touchmove', handleTouchMove)
        container.removeEventListener('touchend', handleTouchEnd)
        container.removeEventListener('touchcancel', handleTouchEnd)
        container.removeEventListener('mousemove', handleMouseMove)
        container.removeEventListener('mouseleave', handleMouseLeave)
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [showFullUI])

  // Slide variants
  const slideVariants = useMemo(() => ({
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95,
    }),
  }), [])

  if (!product) return null

  // Compact mode for horizontal scroll carousel
  if (compact) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6" style={{ scrollSnapType: 'x mandatory' }}>
        {products.map((p, i) => (
          <motion.div
            key={p.id}
            className="flex-shrink-0 w-[200px]"
            style={{ scrollSnapAlign: 'start' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...smoothSpring, delay: i * 0.05 }}
          >
            <GlassCard 
              hover 
              padding="sm"
              onClick={() => {
                setIndex(i)
                if (onBuyNow) onBuyNow(p)
                else window.open(getProductUrl(p), '_blank')
              }}
              style={{ cursor: 'pointer' }}
            >
              {/* Badge */}
              {p.badge && (
                <div 
                  className="absolute top-2 right-2 z-10"
                  style={{
                    padding: '2px 8px',
                    fontSize: '9px',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    color: p.badge === 'LIMITED' ? '#002244' : '#002244',
                    background: p.badge === 'LIMITED' ? '#FFD700' : '#69BE28',
                    borderRadius: '4px',
                  }}
                >
                  {p.badge}
                </div>
              )}
              
              {/* Product Image */}
              <div 
                className="relative aspect-square mb-3"
                style={{ 
                  background: 'radial-gradient(ellipse at center, rgba(105,190,40,0.1) 0%, transparent 70%)',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={p.image} 
                  alt={p.name}
                  className="w-full h-full object-contain"
                  style={{
                    filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.4))',
                  }}
                />
              </div>
              
              {/* Product Info */}
              <h3 
                className="font-bold text-white mb-1"
                style={{ fontSize: '14px', lineHeight: 1.2 }}
              >
                {p.shortName}
              </h3>
              <p 
                style={{ 
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#69BE28',
                }}
              >
                {p.priceLabel}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    )
  }

  // Full carousel mode
  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full min-h-[500px] flex flex-col"
      style={{ 
        perspective: '1200px', 
        touchAction: 'pan-y',
      }}
    >
      {/* 3D Product Container */}
      <div 
        ref={productContainerRef}
        className="flex-1 flex items-center justify-center relative"
        style={{
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {/* Glow Effect */}
        <div 
          className="absolute w-[80%] h-[200px] rounded-full blur-3xl"
          style={{ 
            bottom: '60px',
            background: 'radial-gradient(ellipse, rgba(105,190,40,0.2) 0%, transparent 70%)',
          }}
        />
        
        {/* Product Image */}
        <div 
          ref={productImageRef}
          className="relative w-full h-full flex items-center justify-center"
          style={{ 
            maxWidth: '320px',
            willChange: 'transform',
          }}
        >
          <AnimatePresence mode="popLayout" custom={direction}>
            <motion.div
              key={product.id}
              className="absolute inset-0 flex items-center justify-center"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={fastSpring}
            >
              {/* Badge */}
              {product.badge && (
                <motion.div 
                  className="absolute top-4 right-4 z-10"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ ...smoothSpring, delay: 0.1 }}
                  style={{
                    padding: '4px 12px',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    color: product.badge === 'LIMITED' ? '#002244' : '#002244',
                    background: product.badge === 'LIMITED' ? '#FFD700' : '#69BE28',
                    borderRadius: '6px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  }}
                >
                  {product.badge}
                </motion.div>
              )}
              
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-auto max-h-[300px] object-contain"
                style={{
                  filter: 'drop-shadow(0 20px 60px rgba(0,0,0,0.5)) drop-shadow(0 0 40px rgba(105,190,40,0.15))',
                }}
                draggable={false}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Product Info */}
      <AnimatePresence mode="popLayout">
        <motion.div 
          key={product.id}
          className="text-center px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={smoothSpring}
        >
          {/* Name */}
          <h2 
            className="font-display uppercase"
            style={{ 
              fontSize: 'var(--text-subtitle, 20px)',
              fontWeight: 800,
              color: 'white',
              letterSpacing: '0.02em',
              marginBottom: '4px',
            }}
          >
            {product.name}
          </h2>
          
          {/* Price */}
          <p 
            className="font-bold"
            style={{ 
              fontSize: '18px',
              color: '#69BE28',
              marginBottom: '8px',
            }}
          >
            {product.priceLabel}
          </p>
          
          {/* Description */}
          <p 
            style={{ 
              fontSize: 'var(--text-body, 14px)',
              color: 'rgba(255,255,255,0.6)',
              maxWidth: '280px',
              margin: '0 auto 16px',
              lineHeight: 1.5,
            }}
          >
            {product.description}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {showFullUI && (
        <NavigationArrows onPrev={() => go(-1)} onNext={() => go(1)} />
      )}

      {/* Bottom Controls */}
      <motion.div 
        className="flex flex-col items-center w-full px-6"
        style={{ gap: '12px', paddingBottom: '16px' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...smoothSpring, delay: 0.2 }}
      >
        {/* Dot Indicator */}
        <DotIndicator 
          total={products.length} 
          current={index}
          onSelect={(i) => {
            if (i !== index) {
              setDirection(i > index ? 1 : -1)
              setIndex(i)
            }
          }}
        />

        {/* Buy Now Button */}
        {showFullUI && (
          <GradientButton 
            size="lg" 
            fullWidth 
            onClick={handleBuyNow}
            style={{ maxWidth: '320px' }}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          >
            Buy Now
          </GradientButton>
        )}
      </motion.div>
    </div>
  )
}

export default ProductCarousel
