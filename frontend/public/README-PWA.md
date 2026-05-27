# PWA Icons

This folder is where the PWA manifest icons live. `pwa-icon.svg` is the source
of truth for the brand mark; the build needs three raster sizes referenced by
`vite.config.ts`:

- `pwa-192x192.png` (192×192, transparent or opaque)
- `pwa-512x512.png` (512×512)
- `pwa-maskable-512x512.png` (512×512, with ~10% safe padding for maskable
  rendering on Android)
- `apple-touch-icon.png` (180×180)

Quick way to regenerate them on the command line (requires ImageMagick or
`@vite-pwa/assets-generator`):

```bash
# With @vite-pwa/assets-generator (recommended)
npx @vite-pwa/assets-generator --preset minimal public/pwa-icon.svg

# Or with ImageMagick
magick public/pwa-icon.svg -resize 192x192 public/pwa-192x192.png
magick public/pwa-icon.svg -resize 512x512 public/pwa-512x512.png
magick public/pwa-icon.svg -resize 180x180 public/apple-touch-icon.png
```

Until you generate these files the manifest will still install but will fall
back to the SVG favicon on desktop.
