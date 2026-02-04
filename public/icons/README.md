# PWA Icons

This folder contains icons for the Dark Side Football PWA.

## Required Icons

Generate the following PNG files from `icon.svg`:

| File | Size | Purpose |
|------|------|---------|
| `icon-192.png` | 192x192 | Standard PWA icon |
| `icon-192-maskable.png` | 192x192 | Maskable (with padding) |
| `icon-512.png` | 512x512 | High-res PWA icon |
| `icon-512-maskable.png` | 512x512 | Maskable (with padding) |
| `apple-touch-icon.png` | 180x180 | iOS home screen |

## Splash Screens (iOS)

| File | Size | Device |
|------|------|--------|
| `splash-1170x2532.png` | 1170x2532 | iPhone 12/13/14 |
| `splash-1284x2778.png` | 1284x2778 | iPhone 12/13/14 Pro Max |

## Generation Commands

Using ImageMagick:

```bash
# Standard icons
convert icon.svg -resize 192x192 icon-192.png
convert icon.svg -resize 512x512 icon-512.png
convert icon.svg -resize 180x180 apple-touch-icon.png

# Maskable icons (with 20% padding for safe area)
convert icon.svg -resize 154x154 -gravity center -extent 192x192 -background "#002244" icon-192-maskable.png
convert icon.svg -resize 410x410 -gravity center -extent 512x512 -background "#002244" icon-512-maskable.png
```

## Notes

- Maskable icons need a "safe zone" (inner 80%) for the actual content
- Apple touch icons should have no transparency
- All icons should use the brand colors: Navy (#002244) and Green (#69BE28)
