# EFFINITY App Icons

This directory should contain PWA app icons in multiple sizes.

## Required Icon Sizes

Generate the following PNG files from the EFFINITY logo:

- `icon-72.png` - 72x72px
- `icon-96.png` - 96x96px
- `icon-128.png` - 128x128px
- `icon-144.png` - 144x144px
- `icon-152.png` - 152x152px
- `icon-192.png` - 192x192px
- `icon-384.png` - 384x384px
- `icon-512.png` - 512x512px
- `apple-touch-icon.png` - 180x180px
- `favicon.ico` - 32x32px

## Icon Design Guidelines

### Background
- Use EFFINITY brand gradient: `linear-gradient(135deg, #0E1A2B 0%, #2979FF 100%)`
- Or solid royal blue: `#2979FF`

### Logo Placement
- Center the EFFINITY logo icon
- Logo should occupy 60-70% of icon space
- Maintain 15-20% padding on all sides
- Use white version of logo on brand background

### Technical Requirements
- PNG format with transparency
- sRGB color space
- Optimized file size (use tools like ImageOptim)
- Sharp edges (no anti-aliasing artifacts)

## Platform-Specific Requirements

### iOS (Apple Touch Icon)
- Size: 180x180px
- No transparency (use solid background)
- No rounded corners (iOS adds them automatically)
- High contrast for visibility

### Android
- Sizes: 192x192px and 512x512px most important
- Can use transparency
- Maskable icon support (add 10% safe zone)

### PWA
- 192x192px for app launcher
- 512x512px for splash screen
- Both should be "any maskable" purpose

### Favicon
- 32x32px ICO format
- Also provide 16x16px for browser tabs
- Simple, recognizable design

## Generation Tools

### Recommended Tools
1. **Figma** - Design icons with precise specs
2. **Sketch** - Export multiple sizes at once
3. **ImageMagick** - Batch resize from SVG:
   ```bash
   convert logo.svg -resize 192x192 icon-192.png
   ```
4. **PWA Asset Generator** - Automated icon generation:
   ```bash
   npx pwa-asset-generator logo.svg ./icons --background "#2979FF"
   ```

## Testing Checklist

- [ ] All icons display clearly at their size
- [ ] Logo is centered and properly padded
- [ ] Colors match brand guidelines
- [ ] No pixelation or blurriness
- [ ] Proper contrast for visibility
- [ ] Files optimized for web
- [ ] manifest.json references correct paths
- [ ] Icons appear correctly in browser (test PWA install)

## Notes

For production deployment, generate these icons using the SVG logo files in `/public/logo/` with proper brand colors and spacing.

Current Status: PLACEHOLDER - Icons need to be generated from logo SVGs.
