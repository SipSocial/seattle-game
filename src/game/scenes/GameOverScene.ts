import * as Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONTS, hexToCSS } from '../config/phaserConfig'
import { useGameStore } from '../../store/gameStore'
import { AudioManager } from '../systems/AudioManager'
import { getStageByGame } from '../data/campaign'

export class GameOverScene extends Phaser.Scene {
  private nameInput: string = ''
  private nameText!: Phaser.GameObjects.Text
  private cursorVisible = true
  private isCampaignMode = false

  constructor() {
    super({ key: 'GameOverScene' })
  }

  init(data: { isCampaignMode?: boolean }): void {
    this.isCampaignMode = data.isCampaignMode ?? false
  }

  create(): void {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5051b6de-b0ce-411d-bf90-110293cecd7e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GameOverScene.ts:create',message:'GameOverScene create started',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    this.cameras.main.fadeIn(400)
    this.cameras.main.setBackgroundColor(COLORS.navy)
    
    this.nameInput = ''
    
    const { score, wave, tackles, highScore, playerName } = useGameStore.getState()
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5051b6de-b0ce-411d-bf90-110293cecd7e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GameOverScene.ts:create:afterStore',message:'Store state retrieved',data:{score,wave,tackles,highScore,playerName},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    
    if (playerName) {
      this.nameInput = playerName
    }

    this.createBackground()
    this.createHeader(score, highScore)
    this.createStats(wave, tackles)
    this.createNameEntry()
    this.createButtons()
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5051b6de-b0ce-411d-bf90-110293cecd7e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GameOverScene.ts:create:complete',message:'GameOverScene create completed',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
  }

  private createBackground(): void {
    const graphics = this.add.graphics()
    
    // Dark gradient
    for (let y = 0; y < GAME_HEIGHT; y++) {
      const progress = y / GAME_HEIGHT
      const r = Math.floor(0)
      const g = Math.floor(26 * (1 - progress * 0.5))
      const b = Math.floor(51 * (1 - progress * 0.3))
      graphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1)
      graphics.fillRect(0, y, GAME_WIDTH, 1)
    }
    
    // Subtle field glow
    const fieldGlow = this.add.graphics()
    fieldGlow.fillStyle(COLORS.green, 0.05)
    fieldGlow.fillEllipse(GAME_WIDTH / 2, GAME_HEIGHT, GAME_WIDTH, 200)
  }

  private createHeader(score: number, highScore: number): void {
    const centerX = GAME_WIDTH / 2
    const isNewHighScore = score >= highScore && score > 0

    // Game Over title
    const gameOverBg = this.add.graphics()
    gameOverBg.fillStyle(COLORS.dlRed, 0.2)
    gameOverBg.fillRoundedRect(centerX - 120, 50, 240, 50, 12)
    
    const title = this.add.text(centerX, 75, 'GAME OVER', {
      fontSize: '32px',
      color: hexToCSS(COLORS.white),
      fontFamily: FONTS.display,
      letterSpacing: 3,
    })
    title.setOrigin(0.5)
    title.setAlpha(0)
    
    this.tweens.add({
      targets: title,
      alpha: 1,
      y: title.y - 5,
      duration: 500,
      delay: 200,
      ease: 'Power2'
    })

    // Score display
    const scoreContainer = this.add.container(centerX, 160)
    
    const scoreBg = this.add.graphics()
    scoreBg.fillStyle(COLORS.navyLight, 0.6)
    scoreBg.fillRoundedRect(-100, -50, 200, 100, 16)
    
    if (isNewHighScore) {
      scoreBg.lineStyle(3, COLORS.gold, 1)
      scoreBg.strokeRoundedRect(-100, -50, 200, 100, 16)
    }
    
    const scoreLabel = this.add.text(0, -30, isNewHighScore ? '🏆 NEW HIGH SCORE!' : 'FINAL SCORE', {
      fontSize: isNewHighScore ? '12px' : '11px',
      color: hexToCSS(isNewHighScore ? COLORS.gold : COLORS.grey),
      fontFamily: FONTS.body,
      letterSpacing: 2,
    })
    scoreLabel.setOrigin(0.5)
    
    const scoreValue = this.add.text(0, 10, score.toLocaleString(), {
      fontSize: '42px',
      color: hexToCSS(COLORS.green),
      fontFamily: FONTS.display,
    })
    scoreValue.setOrigin(0.5)
    
    scoreContainer.add([scoreBg, scoreLabel, scoreValue])
    scoreContainer.setAlpha(0)
    scoreContainer.setScale(0.9)
    
    this.tweens.add({
      targets: scoreContainer,
      alpha: 1,
      scale: 1,
      duration: 600,
      delay: 400,
      ease: 'Back.easeOut'
    })
  }

  private createStats(wave: number, tackles: number): void {
    const centerX = GAME_WIDTH / 2
    
    const statsContainer = this.add.container(centerX, 250)
    
    // Wave stat
    const waveBg = this.add.graphics()
    waveBg.fillStyle(COLORS.navyLight, 0.4)
    waveBg.fillRoundedRect(-90, -20, 80, 40, 8)
    
    const waveLabel = this.add.text(-50, -8, 'WAVE', { fontSize: '9px', color: hexToCSS(COLORS.grey), fontFamily: FONTS.body })
    waveLabel.setOrigin(0.5)
    
    const waveValue = this.add.text(-50, 8, `${wave}`, { fontSize: '18px', color: hexToCSS(COLORS.white), fontFamily: FONTS.display })
    waveValue.setOrigin(0.5)
    
    // Tackles stat
    const tacklesBg = this.add.graphics()
    tacklesBg.fillStyle(COLORS.navyLight, 0.4)
    tacklesBg.fillRoundedRect(10, -20, 80, 40, 8)
    
    const tacklesLabel = this.add.text(50, -8, 'TACKLES', { fontSize: '9px', color: hexToCSS(COLORS.grey), fontFamily: FONTS.body })
    tacklesLabel.setOrigin(0.5)
    
    const tacklesValue = this.add.text(50, 8, `${tackles}`, { fontSize: '18px', color: hexToCSS(COLORS.white), fontFamily: FONTS.display })
    tacklesValue.setOrigin(0.5)
    
    statsContainer.add([waveBg, waveLabel, waveValue, tacklesBg, tacklesLabel, tacklesValue])
    statsContainer.setAlpha(0)
    
    this.tweens.add({
      targets: statsContainer,
      alpha: 1,
      duration: 400,
      delay: 600
    })
  }

  private createNameEntry(): void {
    const centerX = GAME_WIDTH / 2
    
    // Label
    const enterLabel = this.add.text(centerX, 300, 'ENTER YOUR INITIALS', {
      fontSize: '11px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
      letterSpacing: 2,
    })
    enterLabel.setOrigin(0.5)
    enterLabel.setAlpha(0)
    
    this.tweens.add({
      targets: enterLabel,
      alpha: 1,
      duration: 400,
      delay: 700
    })

    // Input display
    const inputBg = this.add.graphics()
    inputBg.fillStyle(COLORS.navyLight, 0.8)
    inputBg.fillRoundedRect(centerX - 80, 320, 160, 55, 12)
    inputBg.lineStyle(2, COLORS.green, 0.6)
    inputBg.strokeRoundedRect(centerX - 80, 320, 160, 55, 12)

    this.nameText = this.add.text(centerX, 347, this.nameInput + '_', {
      fontSize: '32px',
      color: hexToCSS(COLORS.white),
      fontFamily: FONTS.display,
      letterSpacing: 12,
    })
    this.nameText.setOrigin(0.5)

    // Blinking cursor
    this.time.addEvent({
      delay: 500,
      callback: () => {
        this.cursorVisible = !this.cursorVisible
        this.updateNameDisplay()
      },
      loop: true,
    })

    // Keyboard input
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Backspace') {
        this.nameInput = this.nameInput.slice(0, -1)
      } else if (event.key.length === 1 && /[a-zA-Z0-9]/.test(event.key) && this.nameInput.length < 3) {
        this.nameInput += event.key.toUpperCase()
      }
      this.updateNameDisplay()
    })

    // On-screen keyboard
    this.createOnScreenKeyboard(centerX, 400)
  }

  private updateNameDisplay(): void {
    const cursor = this.cursorVisible && this.nameInput.length < 3 ? '_' : ''
    this.nameText.setText(this.nameInput + cursor)
  }

  private createOnScreenKeyboard(x: number, y: number): void {
    const keys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const cols = 9
    const keyWidth = 34
    const keyHeight = 34
    const spacing = 4

    const startX = x - ((cols * (keyWidth + spacing)) / 2) + keyWidth / 2

    keys.split('').forEach((key, index) => {
      const col = index % cols
      const row = Math.floor(index / cols)
      const kx = startX + col * (keyWidth + spacing)
      const ky = y + row * (keyHeight + spacing)

      const bg = this.add.graphics()
      bg.fillStyle(COLORS.navyLight, 0.8)
      bg.fillRoundedRect(-keyWidth / 2, -keyHeight / 2, keyWidth, keyHeight, 6)

      const label = this.add.text(0, 0, key, {
        fontSize: '14px',
        color: hexToCSS(COLORS.white),
        fontFamily: FONTS.display,
      })
      label.setOrigin(0.5)

      const container = this.add.container(kx, ky, [bg, label])
      container.setSize(keyWidth, keyHeight)
      container.setInteractive({ useHandCursor: true })

      container.on('pointerdown', () => {
        AudioManager.playClick()
        if (this.nameInput.length < 3) {
          this.nameInput += key
          this.updateNameDisplay()
        }
        container.setScale(0.9)
      })

      container.on('pointerup', () => {
        container.setScale(1)
      })

      container.on('pointerover', () => {
        bg.clear()
        bg.fillStyle(COLORS.green, 0.6)
        bg.fillRoundedRect(-keyWidth / 2, -keyHeight / 2, keyWidth, keyHeight, 6)
        label.setColor(hexToCSS(COLORS.navy))
      })

      container.on('pointerout', () => {
        bg.clear()
        bg.fillStyle(COLORS.navyLight, 0.8)
        bg.fillRoundedRect(-keyWidth / 2, -keyHeight / 2, keyWidth, keyHeight, 6)
        label.setColor(hexToCSS(COLORS.white))
        container.setScale(1)
      })
    })

    // Backspace button
    const bsX = startX + 7 * (keyWidth + spacing)
    const bsY = y + 4 * (keyHeight + spacing)
    const bsWidth = keyWidth * 2 + spacing

    const bsBg = this.add.graphics()
    bsBg.fillStyle(COLORS.dlRed, 0.5)
    bsBg.fillRoundedRect(-bsWidth / 2, -keyHeight / 2, bsWidth, keyHeight, 6)

    const bsLabel = this.add.text(0, 0, '← DEL', {
      fontSize: '12px',
      color: hexToCSS(COLORS.white),
      fontFamily: FONTS.body,
    })
    bsLabel.setOrigin(0.5)

    const bsContainer = this.add.container(bsX + keyWidth / 2, bsY, [bsBg, bsLabel])
    bsContainer.setSize(bsWidth, keyHeight)
    bsContainer.setInteractive({ useHandCursor: true })

    bsContainer.on('pointerdown', () => {
      AudioManager.playClick()
      this.nameInput = this.nameInput.slice(0, -1)
      this.updateNameDisplay()
      bsContainer.setScale(0.95)
    })

    bsContainer.on('pointerup', () => {
      bsContainer.setScale(1)
    })
  }

  private createButtons(): void {
    const centerX = GAME_WIDTH / 2
    
    // Submit button
    this.createSubmitButton(centerX, 570)
    
    // Campaign-specific buttons
    if (this.isCampaignMode) {
      this.createCampaignButtons(centerX, 630)
    } else {
      // Play again button
      this.createRetryButton(centerX, 630)
    }
  }
  
  private createCampaignButtons(x: number, y: number): void {
    const { campaign } = useGameStore.getState()
    const currentStage = getStageByGame(campaign.currentGame)
    
    // Retry this game button
    const retryBtn = this.add.text(x, y, `RETRY ${currentStage.location.city.toUpperCase()}`, {
      fontSize: '14px',
      color: hexToCSS(COLORS.green),
      fontFamily: FONTS.body,
    })
    retryBtn.setOrigin(0.5)
    retryBtn.setInteractive({ useHandCursor: true })
    retryBtn.setAlpha(0)
    
    this.tweens.add({
      targets: retryBtn,
      alpha: 1,
      duration: 400,
      delay: 1000
    })

    retryBtn.on('pointerover', () => {
      retryBtn.setColor(hexToCSS(COLORS.greenLight))
      this.tweens.add({ targets: retryBtn, y: y - 2, duration: 150 })
    })
    
    retryBtn.on('pointerout', () => {
      retryBtn.setColor(hexToCSS(COLORS.green))
      this.tweens.add({ targets: retryBtn, y: y, duration: 150 })
    })
    
    retryBtn.on('pointerdown', () => {
      AudioManager.playClick()
      useGameStore.getState().startCampaignGame()
      this.cameras.main.fadeOut(300)
      this.time.delayedCall(300, () => {
        this.scene.start('RosterScene')
      })
    })
    
    // Back to map button
    const mapBtn = this.add.text(x, y + 35, 'BACK TO MAP', {
      fontSize: '12px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
    })
    mapBtn.setOrigin(0.5)
    mapBtn.setInteractive({ useHandCursor: true })
    mapBtn.setAlpha(0)
    
    this.tweens.add({
      targets: mapBtn,
      alpha: 0.7,
      duration: 400,
      delay: 1100
    })

    mapBtn.on('pointerover', () => {
      mapBtn.setColor(hexToCSS(COLORS.white))
    })
    
    mapBtn.on('pointerout', () => {
      mapBtn.setColor(hexToCSS(COLORS.grey))
    })
    
    mapBtn.on('pointerdown', () => {
      AudioManager.playClick()
      this.cameras.main.fadeOut(300)
      this.time.delayedCall(300, () => {
        this.scene.start('MapScene')
      })
    })
  }

  private createSubmitButton(x: number, y: number): void {
    const width = 220
    const height = 50
    
    const glow = this.add.graphics()
    glow.fillStyle(COLORS.green, 0.3)
    glow.fillRoundedRect(x - width/2 - 5, y - height/2 - 5, width + 10, height + 10, 16)
    glow.setAlpha(0)

    const bg = this.add.graphics()
    bg.fillStyle(COLORS.green, 1)
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12)
    
    const shine = this.add.graphics()
    shine.fillStyle(0xffffff, 0.2)
    shine.fillRoundedRect(-width / 2 + 4, -height / 2 + 4, width - 8, height/2 - 4, { tl: 8, tr: 8, bl: 0, br: 0 })

    const label = this.add.text(0, 0, 'SUBMIT SCORE', {
      fontSize: '18px',
      color: hexToCSS(COLORS.navy),
      fontFamily: FONTS.display,
    })
    label.setOrigin(0.5)

    const container = this.add.container(x, y, [bg, shine, label])
    container.setSize(width, height)
    container.setInteractive({ useHandCursor: true })
    container.setAlpha(0)
    
    this.tweens.add({
      targets: container,
      alpha: 1,
      duration: 400,
      delay: 900
    })

    container.on('pointerover', () => {
      this.tweens.add({ targets: container, scale: 1.05, duration: 150 })
      this.tweens.add({ targets: glow, alpha: 1, duration: 150 })
    })
    
    container.on('pointerout', () => {
      this.tweens.add({ targets: container, scale: 1, duration: 150 })
      this.tweens.add({ targets: glow, alpha: 0, duration: 150 })
    })
    
    container.on('pointerdown', () => container.setScale(0.95))

    container.on('pointerup', () => {
      AudioManager.playClick()
      const store = useGameStore.getState()
      const name = this.nameInput || 'AAA'
      
      store.setPlayerName(name)
      store.addLeaderboardEntry({
        playerName: name,
        jerseyNumber: store.selectedDefender,
        score: store.score,
        wave: store.wave,
        tackles: store.tackles,
      })

      this.cameras.main.fadeOut(300)
      this.time.delayedCall(300, () => {
        // Go to EngageScene first (Follow/Enter/Share CTAs)
        this.scene.start('EngageScene')
      })
    })
  }

  private createRetryButton(x: number, y: number): void {
    const retryBtn = this.add.text(x, y, 'PLAY AGAIN', {
      fontSize: '14px',
      color: hexToCSS(COLORS.grey),
      fontFamily: FONTS.body,
    })
    retryBtn.setOrigin(0.5)
    retryBtn.setInteractive({ useHandCursor: true })
    retryBtn.setAlpha(0)
    
    this.tweens.add({
      targets: retryBtn,
      alpha: 1,
      duration: 400,
      delay: 1000
    })

    retryBtn.on('pointerover', () => {
      retryBtn.setColor(hexToCSS(COLORS.green))
      this.tweens.add({ targets: retryBtn, y: y - 2, duration: 150 })
    })
    
    retryBtn.on('pointerout', () => {
      retryBtn.setColor(hexToCSS(COLORS.grey))
      this.tweens.add({ targets: retryBtn, y: y, duration: 150 })
    })
    
    retryBtn.on('pointerdown', () => {
      AudioManager.playClick()
      useGameStore.getState().startGame()
      this.cameras.main.fadeOut(300)
      this.time.delayedCall(300, () => {
        this.scene.start('GameScene')
      })
    })
  }
}
