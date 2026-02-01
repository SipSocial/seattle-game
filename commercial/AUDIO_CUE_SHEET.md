# DARK SIDE DEFENSE — V8 AUDIO CUE SHEET

## Audio Direction
**Style:** Modern, minimal, confident, bassy (not cinematic)  
**Vibe:** Clean & techy (Xbox × Apple console boot + sports swagger)  
**FPS:** 30  
**Duration:** 30 seconds (900 frames)

---

## MUSIC BED

**File:** `public/audio/bed.mp3`

**Characteristics:**
- 130–150 BPM
- Tight kick + sub bass
- Clean synth stabs
- NO choir / NO trailer brass
- NO melodic cheesiness

**Levels:** -18 to -12 LUFS (quiet enough for SFX to punch through)

**Suggested sources:**
- Epidemic Sound: search "minimal electronic" or "tech trailer"
- Artlist: search "corporate tech" or "gaming intro"
- Uppbeat: free, search "electronic minimal"

---

## SFX CUE LIST

| Frame | Time | Scene | SFX | Notes |
|-------|------|-------|-----|-------|
| 0 | 0.0s | NO FOOTBALL | (bed low) | Music restrained |
| 60 | 2.0s | JUST KIDDING | `thump.mp3` | Single hard bassy thump |
| 62 | 2.07s | | `glitch.mp3` | Micro glitch tick (optional) |
| 90 | 3.0s | DARK SIDE GAME | `slam.mp3` | Big slam + sub drop |
| 93 | 3.1s | | `poweron.mp3` | Power-on synth stab |
| 180 | 6.0s | Player 1 | `snap.mp3` | UI snap + whoosh |
| 219 | 7.3s | Player 2 | `snap.mp3` | |
| 258 | 8.6s | Player 3 | `snap.mp3` | |
| 297 | 9.9s | Player 4 | `snap.mp3` | |
| 336 | 11.2s | Player 5 | `snap.mp3` | |
| 375 | 12.5s | Player 6 | `snap.mp3` | |
| 420 | 14.0s | TACKLE | `impact1.mp3` | Impact hit + whoosh |
| 459 | 15.3s | DEFEND | `impact2.mp3` | Different texture |
| 498 | 16.6s | DOMINATE | `impact3.mp3` | Biggest hit |
| 534 | 17.8s | | (silence) | 0.2s silence before WIN |
| 540 | 18.0s | WIN | `jackpot.mp3` | Jackpot hit + shimmer |
| 549 | 18.3s | | (bed drops) | Music drops 0.3-0.6s |
| 567 | 18.9s | | (bed returns) | Music comes back bigger |
| 720 | 24.0s | CTA | `confirm.mp3` | Soft confirm tick |
| 750 | 25.0s | QR appears | `bleep.mp3` | Subtle scanline/bleep |
| 891 | 29.7s | End | `endhit.mp3` | Clean final hit |

---

## REQUIRED AUDIO FILES

Place in `commercial/public/audio/`:

```
audio/
  bed.mp3          # 30s music bed (130-150 BPM, minimal electronic)
  thump.mp3        # Short bassy thump (~0.2s)
  glitch.mp3       # Micro glitch tick (~0.1s)
  slam.mp3         # Big slam + sub drop (~0.4s)
  poweron.mp3      # Power-on synth stab (~0.3s)
  snap.mp3         # UI snap + soft whoosh (~0.2s)
  impact1.mp3      # Impact hit texture 1 (~0.3s)
  impact2.mp3      # Impact hit texture 2 (~0.3s)
  impact3.mp3      # Impact hit texture 3 (~0.3s)
  jackpot.mp3      # Jackpot shimmer (~0.6s)
  confirm.mp3      # Soft confirm tick (~0.15s)
  bleep.mp3        # Scanline bleep (~0.2s)
  endhit.mp3       # Clean final hit (~0.3s)
```

---

## VOLUME LEVELS

| Type | Level | Notes |
|------|-------|-------|
| Music bed | -18 to -12 dB | Quiet, supportive |
| Impact hits | -6 to -3 dB | Punchy, noticeable |
| UI SFX | -12 to -9 dB | Clean, not distracting |
| Jackpot | -6 dB | Standout moment |
| Final hit | -3 dB | Strong finish |

---

## RULE

**Fewer SFX, louder intent.**

Don't overload. Let each sound breathe.
