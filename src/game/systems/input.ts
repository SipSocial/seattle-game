import * as Phaser from 'phaser'

export type TapCallback = () => void

export class InputSystem {
  private scene: Phaser.Scene
  private callback: TapCallback | null = null
  private enabled: boolean = false
  private lastTapTime: number = 0
  private minTapInterval: number = 16 // ~60fps, minimal debounce

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  enable(callback: TapCallback): void {
    this.callback = callback
    this.enabled = true
    this.setupInputListeners()
  }

  disable(): void {
    this.enabled = false
    this.callback = null
    this.removeInputListeners()
  }

  private setupInputListeners(): void {
    // Pointer (touch/mouse) input
    this.scene.input.on('pointerdown', this.handleTap, this)

    // Keyboard input (Spacebar)
    if (this.scene.input.keyboard) {
      this.scene.input.keyboard.on('keydown-SPACE', this.handleTap, this)
    }
  }

  private removeInputListeners(): void {
    this.scene.input.off('pointerdown', this.handleTap, this)

    if (this.scene.input.keyboard) {
      this.scene.input.keyboard.off('keydown-SPACE', this.handleTap, this)
    }
  }

  private handleTap = (): void => {
    if (!this.enabled || !this.callback) return

    const now = Date.now()
    if (now - this.lastTapTime < this.minTapInterval) return

    this.lastTapTime = now
    this.callback()
  }

  destroy(): void {
    this.disable()
  }
}

// Utility to create a tappable button
export function createTapButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  text: string,
  callback: () => void,
  options?: {
    fillColor?: number
    hoverColor?: number
    textColor?: string
    fontSize?: string
    borderRadius?: number
  }
): Phaser.GameObjects.Container {
  const {
    fillColor = 0x0f6e6a,
    hoverColor = 0x7ed957,
    textColor = '#ffffff',
    fontSize = '24px',
    borderRadius = 12,
  } = options || {}

  const container = scene.add.container(x, y)

  // Button background
  const bg = scene.add.graphics()
  bg.fillStyle(fillColor, 1)
  bg.fillRoundedRect(-width / 2, -height / 2, width, height, borderRadius)

  // Button text
  const label = scene.add.text(0, 0, text, {
    fontFamily: 'Arial, sans-serif',
    fontSize: fontSize,
    color: textColor,
    fontStyle: 'bold',
  })
  label.setOrigin(0.5)

  container.add([bg, label])

  // Interactive zone
  const hitArea = new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height)
  container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains)

  // Hover effects
  container.on('pointerover', () => {
    bg.clear()
    bg.fillStyle(hoverColor, 1)
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, borderRadius)
  })

  container.on('pointerout', () => {
    bg.clear()
    bg.fillStyle(fillColor, 1)
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, borderRadius)
  })

  container.on('pointerdown', callback)

  return container
}
