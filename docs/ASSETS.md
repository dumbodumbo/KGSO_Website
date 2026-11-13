# Assets

All media lives under `assets/`. Nothing here is recompressed or converted by tooling; files are committed as exported. Sizes below are from the working tree (bytes / KB rounded).

## Inventory

### `assets/bg/`

| File | Size | Purpose |
|---|---|---|
| `background.webp` | 21 KB | Fixed page background (preloaded, decoded by the head script, used via `image-set()` in `css/style.css`) |
| `background.jpg` | 63 KB | JPEG fallback for the above |

### `assets/brand/`

| File | Size | Purpose |
|---|---|---|
| `logo-letters.webp` / `.png` | 65 KB / 89 KB | "KGS" letters of the logo in `#logo` (declared 1400x491); webp preloaded |
| `helmet.webp` / `.png` | 15 KB / 38 KB | Helmet that forms the "O" (declared 534x523); also copied into the companion helmet by `helmet-path.js` |
| `kgso-share.jpg` | 128 KB | Full KGSO logo on the space background; Open Graph / Twitter share image |
| `favicon.ico`, `favicon.png` (32), `favicon-48.png`, `apple-touch-icon.png` | 3 KB, 1 KB, 2 KB, 12 KB | Icons linked in `<head>` |
| `starfield.jpg` | 10 KB | **Unreferenced.** Kept as a possible background texture |
| `helmet-src.jpg` | 58 KB | **Unreferenced** source for the helmet; git-ignored (`*-src.*`) |
| `logo-original.jpg` | 119 KB | **Unreferenced** original logo; git-ignored |

### `assets/video/`

| File | Size | Purpose |
|---|---|---|
| `kgso-highlights.mp4` | 4.17 MB | Highlights video; attached lazily by `video.js` via `data-src` |
| `kgso-highlights-poster.jpg` | 43 KB | `<video poster>` and the Open Graph / Twitter image |
| `kgso-highlights-poster.webp` | 25 KB | **Unreferenced** WebP twin of the poster |
| `kgso-highlights-src.mp4` | 4.49 MB | **Unreferenced** pre-encode source; git-ignored and excluded from Vercel deploys |

### `assets/legacy/<year>/`

For each of 2024, 2025, 2026: `cover`, `g1`, `g2`, `g3`, each as `.webp` + `.jpg` (24 files, roughly 50-170 KB each, about 2.4 MB total). The HTML declares them as 720x1600 (portrait), lazy-loaded inside `<picture>` (webp source, jpg fallback). `cover` is used twice per year: the banner and the first gallery tile.

## Large assets

- `kgso-highlights.mp4` (4.17 MB) is the only large file shipped. It is not fetched until the video section nears the viewport (`preload="none"` + `data-src`).
- `kgso-highlights-src.mp4` (4.49 MB) is local-only; do not remove the ignore rules.
- Largest images: `legacy/2025/g3.jpg` (166 KB), `legacy/2025/cover.jpg` (162 KB), `brand/logo-letters.png` (180 KB).

## Unreferenced files

`node scripts/verify-refs.js` prints the current list. At the time of writing: `helmet-src.jpg`, `logo-original.jpg`, `starfield.jpg`, `kgso-highlights-poster.webp`, `kgso-highlights-src.mp4`. None were deleted: they are either source originals or possible future use. Remove `starfield.jpg` and the poster `.webp` if you are sure you do not need them.

## Naming

- Lowercase, hyphen-separated, descriptive: `logo-letters`, `kgso-highlights-poster`.
- Every raster used on the page ships as a modern + fallback pair (`.webp` + `.jpg`/`.png`) with the same base name.
- Source/original files carry `-src` or `-original` so `.gitignore` keeps them out of the repo.
- Legacy images: `assets/legacy/<year>/cover|g1|g2|g3.<ext>`.

## Add an asset

1. Put it in the matching folder (`brand/`, `bg/`, `video/`, `legacy/<year>/`).
2. Export the webp + fallback pair at final size; do not rely on CSS to downscale large images.
3. Reference it with a `?v=1` suffix and add `width`/`height` on `<img>`. Use `loading="lazy"` for anything below the fold.
4. For a new legacy year, add a new `<article class="lg-edition" data-year="YYYY">` in `index.html` (copy an existing one, including the `lg-btn-YYYY` / `lg-spill-YYYY` ids), a banner and 4 gallery images.
5. Run `node scripts/verify-refs.js`.
6. When replacing a file in place, bump its `?v=` everywhere it is referenced (see [DEVELOPMENT.md](DEVELOPMENT.md)).
