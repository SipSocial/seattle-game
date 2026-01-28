/**
 * Premium Particle Effects System
 * Seattle Seahawks Defense - Stadium Atmosphere & Game Effects
 */

import * as Phaser from 'phaser'
import { COLORS } from '../config/phaserConfig'

/**
 * Stadium Atmosphere Particles
 * Creates floating particles that rise up like stadium confetti
 */
export function createStadiumParticles(
  scene: Phaser.Scene,
  count: number = 15,
  colors: number[] = [COLORS.green, COLORS.white, COLORS.grey]
): Phaser.GameObjects.Graphics[] {
  const particles: Phaser.GameObjects.Graphics[] = []
  const { width, height } = scene.scale

  for (let i = 0; i < count; i++) {
    const particle = scene.add.graphics()
    const color = colors[Math.floor(Math.random() * colors.length)]
    const alpha = 0.2 + Math.random() * 0.3
    const size = 1 + Math.random() * 2

    particle.fillStyle(color, alpha)
    particle.fillCircle(0, 0, size)

    const startX = Math.random() * width
    const startY = Math.random() * height
    particle.setPosition(startX, startY)

    // Floating animation
    scene.tweens.add({
      targets: particle,
      y: particle.y - 100 - Math.random() * 150,
      x: particle.x + (Math.random() - 0.5) * 60,
      alpha: 0,
      duration: 4000 + Math.random() * 4000,
      repeat: -1,
      delay: Math.random() * 3000,
      onRepeat: () => {
        particle.setPosition(Math.random() * width, height + 20)
        particle.setAlpha(alpha)
      },
    })

    particles.push(particle)
  }

  return particles
}

/**
 * Tackle Impact Effect
 * Creates a burst of particles and expanding rings on tackle
 */
export function createTackleEffect(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: number = COLORS.green,
  intensity: 'normal' | 'big' = 'normal'
): void {
  const particleCount = intensity === 'big' ? 16 : 10
  const ringCount = intensity === 'big' ? 3 : 2
  const maxDistance = intensity === 'big' ? 60 : 40

  // Particle burst
  for (let i = 0; i < particleCount; i++) {
    const particle = scene.add.graphics()
    const particleColor = i % 3 === 0 ? COLORS.green : i % 3 === 1 ? color : COLORS.white
    const size = intensity === 'big' ? 3 + Math.random() * 3 : 2 + Math.random() * 2

    particle.fillStyle(particleColor, 1)
    particle.fillCircle(0, 0, size)
    particle.setPosition(x, y)

    const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.5
    const distance = maxDistance + Math.random() * 20

    scene.tweens.add({
      targets: particle,
      x: x + Math.cos(angle) * distance,
      y: y + Math.sin(angle) * distance,
      alpha: 0,
      scale: 0.3,
      duration: 400 + Math.random() * 100,
      ease: 'Power2',
      onComplete: () => particle.destroy(),
    })
  }

  // Expanding rings
  for (let i = 0; i < ringCount; i++) {
    const ring = scene.add.graphics()
    ring.lineStyle(4 - i, color, 1 - i * 0.3)
    ring.strokeCircle(x, y, 15)

    scene.tweens.add({
      targets: ring,
      scaleX: 2.5 + i * 0.5,
      scaleY: 2.5 + i * 0.5,
      alpha: 0,
      duration: 350 + i * 100,
      ease: 'Power2',
      delay: i * 50,
      onComplete: () => ring.destroy(),
    })
  }

  // Flash effect
  const flash = scene.add.graphics()
  flash.fillStyle(0xffffff, 0.4)
  flash.fillCircle(x, y, intensity === 'big' ? 40 : 25)

  scene.tweens.add({
    targets: flash,
    alpha: 0,
    scale: 2,
    duration: 200,
    onComplete: () => flash.destroy(),
  })
}

/**
 * Touchdown Scored Effect
 * Creates a dramatic red flash and particle explosion
 */
export function createTouchdownEffect(scene: Phaser.Scene): void {
  const { width, height } = scene.scale

  // Full-screen red flash
  const flash = scene.add.graphics()
  flash.fillStyle(0xff0000, 0.3)
  flash.fillRect(0, 0, width, height)
  flash.setDepth(1000)

  scene.tweens.add({
    targets: flash,
    alpha: 0,
    duration: 300,
    onComplete: () => flash.destroy(),
  })

  // Falling particles from endzone
  for (let i = 0; i < 20; i++) {
    const particle = scene.add.graphics()
    particle.fillStyle(COLORS.dlRed, 0.8)
    particle.fillCircle(0, 0, 2 + Math.random() * 2)

    particle.setPosition(30 + Math.random() * (width - 60), height - 50)

    scene.tweens.add({
      targets: particle,
      y: particle.y - 100,
      x: particle.x + (Math.random() - 0.5) * 100,
      alpha: 0,
      rotation: Math.random() * Math.PI * 4,
      duration: 800 + Math.random() * 400,
      ease: 'Power2',
      delay: Math.random() * 200,
      onComplete: () => particle.destroy(),
    })
  }
}

/**
 * Power-Up Collect Effect
 * Creates sparkles and glow when collecting a power-up
 */
export function createPowerUpEffect(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: number
): void {
  // Sparkles burst
  for (let i = 0; i < 12; i++) {
    const sparkle = scene.add.graphics()
    sparkle.fillStyle(color, 1)

    // Star shape
    sparkle.beginPath()
    for (let j = 0; j < 5; j++) {
      const angle = (j / 5) * Math.PI * 2 - Math.PI / 2
      const innerAngle = angle + Math.PI / 5
      const outerRadius = 4
      const innerRadius = 2

      if (j === 0) {
        sparkle.moveTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius)
      } else {
        sparkle.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius)
      }
      sparkle.lineTo(Math.cos(innerAngle) * innerRadius, Math.sin(innerAngle) * innerRadius)
    }
    sparkle.closePath()
    sparkle.fillPath()

    sparkle.setPosition(x, y)

    const angle = (i / 12) * Math.PI * 2
    const distance = 50 + Math.random() * 30

    scene.tweens.add({
      targets: sparkle,
      x: x + Math.cos(angle) * distance,
      y: y + Math.sin(angle) * distance,
      alpha: 0,
      rotation: Math.random() * Math.PI * 2,
      scale: 0.5,
      duration: 600,
      ease: 'Power2',
      delay: i * 30,
      onComplete: () => sparkle.destroy(),
    })
  }

  // Glow ring
  const glow = scene.add.graphics()
  glow.lineStyle(4, color, 0.8)
  glow.strokeCircle(x, y, 20)

  scene.tweens.add({
    targets: glow,
    scaleX: 3,
    scaleY: 3,
    alpha: 0,
    duration: 500,
    ease: 'Power2',
    onComplete: () => glow.destroy(),
  })
}

/**
 * Wave Complete Celebration
 * Creates confetti and celebration effects
 */
export function createWaveCompleteEffect(scene: Phaser.Scene): void {
  const { width, height } = scene.scale
  const colors = [COLORS.green, COLORS.gold, COLORS.white, COLORS.lbTeal]

  // Confetti burst
  for (let i = 0; i < 50; i++) {
    const confetti = scene.add.graphics()
    const color = colors[Math.floor(Math.random() * colors.length)]

    confetti.fillStyle(color, 1)
    confetti.fillRect(-3, -6, 6, 12) // Rectangle confetti

    const startX = Math.random() * width
    confetti.setPosition(startX, -20)

    const endX = startX + (Math.random() - 0.5) * 200
    const endY = height + 50

    scene.tweens.add({
      targets: confetti,
      x: endX,
      y: endY,
      rotation: Math.random() * Math.PI * 6,
      duration: 2000 + Math.random() * 1000,
      ease: 'Sine.easeIn',
      delay: Math.random() * 500,
      onComplete: () => confetti.destroy(),
    })
  }

  // Green flash
  const flash = scene.add.graphics()
  flash.fillStyle(COLORS.green, 0.15)
  flash.fillRect(0, 0, width, height)

  scene.tweens.add({
    targets: flash,
    alpha: 0,
    duration: 800,
    onComplete: () => flash.destroy(),
  })
}

/**
 * Combo Effect
 * Creates escalating visual feedback for combos
 */
export function createComboEffect(
  scene: Phaser.Scene,
  x: number,
  y: number,
  comboCount: number
): void {
  const intensity = Math.min(comboCount / 5, 1)
  const greenColor = new Phaser.Display.Color(105, 190, 40)
  const goldColor = new Phaser.Display.Color(255, 215, 0)
  const color = Phaser.Display.Color.Interpolate.ColorWithColor(
    greenColor,
    goldColor,
    100,
    Math.floor(intensity * 100)
  )
  const blendedColor = Phaser.Display.Color.GetColor(color.r, color.g, color.b)

  // Ring size based on combo
  const ringSize = 20 + comboCount * 5
  const ring = scene.add.graphics()
  ring.lineStyle(3 + intensity * 2, blendedColor, 1)
  ring.strokeCircle(x, y, ringSize)

  scene.tweens.add({
    targets: ring,
    scaleX: 2,
    scaleY: 2,
    alpha: 0,
    duration: 400,
    onComplete: () => ring.destroy(),
  })

  // Particle count based on combo
  const particleCount = 4 + comboCount * 2
  for (let i = 0; i < particleCount; i++) {
    const particle = scene.add.graphics()
    particle.fillStyle(blendedColor, 1)
    particle.fillCircle(0, 0, 2 + intensity * 2)
    particle.setPosition(x, y)

    const angle = (i / particleCount) * Math.PI * 2
    const distance = 30 + comboCount * 10

    scene.tweens.add({
      targets: particle,
      x: x + Math.cos(angle) * distance,
      y: y + Math.sin(angle) * distance,
      alpha: 0,
      duration: 300 + Math.random() * 100,
      onComplete: () => particle.destroy(),
    })
  }
}

/**
 * Stadium Lights Flicker Effect
 * Creates dramatic lighting for special moments
 */
export function createStadiumLightFlicker(scene: Phaser.Scene): void {
  const { width } = scene.scale

  const light = scene.add.graphics()
  light.fillStyle(0xffffff, 0.1)
  light.fillEllipse(width / 2, -50, width * 1.5, 300)

  // Quick flicker sequence
  const flickerTimes = [0, 100, 200, 400, 600]
  flickerTimes.forEach((delay, i) => {
    scene.time.delayedCall(delay, () => {
      light.setAlpha(i % 2 === 0 ? 0.2 : 0.05)
    })
  })

  scene.time.delayedCall(800, () => {
    scene.tweens.add({
      targets: light,
      alpha: 0,
      duration: 500,
      onComplete: () => light.destroy(),
    })
  })
}

/**
 * Spawn Warning Effect
 * Visual warning before a tough wave
 */
export function createSpawnWarning(scene: Phaser.Scene): void {
  const { width } = scene.scale

  const warning = scene.add.graphics()
  warning.fillStyle(0xff0000, 0.1)
  warning.fillRect(0, 0, width, 70)

  scene.tweens.add({
    targets: warning,
    alpha: 0.3,
    duration: 200,
    yoyo: true,
    repeat: 3,
    onComplete: () => warning.destroy(),
  })
}
