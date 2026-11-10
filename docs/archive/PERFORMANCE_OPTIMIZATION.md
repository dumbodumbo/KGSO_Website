> **Archived reference note (Nov 2026).** Point-in-time snapshot; parts are outdated (e.g. mentions of a separate `legacy.html` page, which no longer exists - Legacy is an in-page section of `index.html`). For current docs see [docs/ARCHITECTURE.md](../ARCHITECTURE.md) and [README.md](../../README.md).

# KGSO Website — Performance & Code Quality Optimization

**Date:** 2026-11-08  
**Scope:** Static HTML/CSS/JS + GSAP CDN at `C:\Users\Solar Turbines User\KGSO_Website`  
**Constraint:** No redesign. Preserve design, animation feel, copy, layout, colors, typography, helmet bob/flames, legacy expand, intro. No new frameworks. No commit/push.

**Related:** SEO / favicon / reduced-motion / Inter font head load already done in `ENGINEERING_AUDIT.md` — not repeated here.

---

## 1. Baseline (before this pass)

| Item | Observation |
|------|-------------|
| Tree size | ~10.7 MB (dominated by `kgso-highlights.mp4` ~4.3 MB + backup `kgso-highlights-src.mp4` ~4.5 MB) |
| Legacy JPEGs (12) | ~1,370 KB |
| Hero stills | `logo-letters.png` 180 KB, `helmet.png` 64 KB, `background.jpg` 63 KB (~306 KB) |
| Video | Eager `<source>` + `preload="metadata"`; paused off-screen by `IntersectionObserver` |
| Scripts | Bottom-of-body classic scripts (order OK); helmet scroll already `{ passive: true }` |
| Duplicate toast | Identical `showToast` in `register.js` + `schedule.js` |
| Modules resize | Layout on every resize event (no debounce) |
| Local server | `http://localhost:5500` |

### Prioritized findings (this pass)

| P | Finding | Impact | Action |
|---|---------|--------|--------|
| P0 | Legacy + hero images served as large PNG/JPEG only | Bandwidth / LCP / gallery open cost | WebP via `<picture>` / `image-set` |
| P0 | Highlights MP4 (~4.3 MB) on critical path at parse | Early network + decode | Lazy-attach `src` near viewport (`preload="none"`) |
| P1 | Backup `kgso-highlights-src.mp4` (~4.5 MB) in tree | Deploy bloat if published | **Document only** — leave file; keep out of HTML |
| P1 | Scripts not `defer` | Minor parser coupling | Add `defer` (order preserved) |
| P2 | Duplicate toast helpers | Maintainability | Shared `window.KGSOToast` |
| P2 | Modules carousel resize thrash | Main-thread work | Debounce 120 ms |
| P2 | Two intro `resize` listeners | Small double work | Merge |
| P3 | Further video re-encode / drop quality | Quality / feel risk | **Deferred** |
| P3 | Remove intro particles / helmet bob | Feel change | **Do not** |
| P3 | Delete unused `*-old` / source assets | Needs archive confirmation | **Deferred** |
| P3 | Dead CSS purge | Risk of false positives | **Deferred** (only 100% unused) |
| P3 | Font subsetting beyond `display=swap` | Tooling / FOIT risk | **Deferred** |

---

## 2. Implemented (safe, UX-preserving)

### Images
- Generated sibling `.webp` for all legacy gallery JPEGs (q82) and hero stills (`logo-letters` / `helmet` **lossless**; `background` / poster q82).
- Home legacy banners + spill shots use `<picture>` (WebP + JPEG fallback); covers also `loading="lazy"`.
- Logo / helmet use `<picture>` with lossless WebP; `#logo > picture` / `#o-slot > picture` use `display: contents` so layout/GSAP targets unchanged.
- `#bg .bg-img` uses CSS `image-set(...webp, ...jpeg)`; head preload + inline decode prefer WebP with JPEG fallback.
- Intrinsic `width`/`height` retained; `fetchpriority="high"` only on LCP logo/helmet candidates.

### Video
- Removed eager `<source>`; `preload="none"` + `data-src`; `video.js` attaches `src` when near viewport (`rootMargin: 200px`) then plays (unless user-paused). Off-screen pause behavior kept.
- `kgso-highlights-src.mp4` **not** referenced; left on disk as backup.

### JS
- All GSAP + app scripts: `defer` (document order unchanged).
- Helmet scroll listener already passive — unchanged.
- Shared toast: `window.KGSOToast` / `KGSORegister.toast`; `schedule.js` uses it.
- Modules carousel resize debounced (120 ms).
- Intro: single resize handler for canvas + pre-reveal logo staging.

### CSS
- Small additions only for `picture` / `image-set` (no visual redesign).
- No speculative dead-rule deletion.

### Cache bust
- Bumped `?v=` on changed CSS/JS/assets (`style` 15, `intro` 7, `legacy` 5, `video.js` 6, `modules` 4, `register` 3, `schedule` 2, `legacy.js` 5, `intro.js` 11, `helmet-path` 46, image `?v=` where URLs changed).

---

## 3. Deferred / do-not-implement (trade-off)

| Item | Why stopped |
|------|-------------|
| Re-encode / lower bitrate of `kgso-highlights.mp4` | May change start feel / quality |
| Delete `kgso-highlights-src.mp4` | Backup; confirm before publish strip |
| Delete `helmet-src.jpg`, `logo-original.jpg`, `starfield.jpg`, other archives | Intentional backups possible |
| Kill intro particles / helmet bob / flame density | Explicitly out of scope |
| Aggressive JPEG recompress of originals | Visual risk; WebP covers modern browsers |
| Font file subsetting | Tooling; Press Start / Silkscreen must stay |
| Dead CSS purge | Not 100% proven unused without coverage tooling |
| Full Lighthouse CI scores | Spot-checked in browser; no automated LH run in this pass |

---

## 4. Before / after measurements

### Bytes (approximate)

| Bundle | Before | After (modern browsers) | Notes |
|--------|--------|-------------------------|-------|
| Hero stills (logo+helmet+bg) | ~306 KB | ~157 KB WebP | PNG/JPEG kept as fallback |
| Legacy 12 images | ~1,370 KB JPEG | ~935 KB WebP | JPEG fallbacks retained |
| Image critical-path sum (hero + legacy) | ~1,676 KB | ~1,092 KB | **~584 KB saved** when WebP chosen |
| Highlights MP4 | ~4.3 MB early | Same file, **deferred until near `#video`** | `src` backup ~4.5 MB still on disk, not linked |
| Deploy tree | ~10.7 MB | ~11.8 MB | Tree grew: WebP siblings added; publish can omit `*-src` / archives |

### Runtime verification (`http://localhost:5500`)

| Check | Result |
|-------|--------|
| Intro / skip path | OK (`intro-done`, GSAP present) |
| Logo WebP + helmet WebP | `currentSrc` → `.webp` |
| BG `image-set` | WebP selected |
| Scroll logo letters fade | `.letters` autoAlpha → 0 while companion visible |
| Modules carousel next | Biology becomes current |
| Legacy open / close | Expanded then collapsed |
| FAQ ticket | Expanded with answer |
| Register modal + shared toast | Modal opens; toast “Form link coming soon” |
| Video lazy src | Empty until near section; then MP4 plays; off-screen pause OK |
| Console | No script errors observed in spot checks |

---

## 5. Files touched

- `PERFORMANCE_OPTIMIZATION.md` (new)
- `index.html`
- `css/style.css`, `css/intro.css`, `css/legacy.css`
- `js/video.js`, `js/register.js`, `js/schedule.js`, `js/modules.js`, `js/intro.js`
- New assets: `assets/**/*.webp` (16 files: 12 legacy + logo, helmet, background, poster)

---

## 6. Publish notes

- Prefer excluding from production zip/CDN: `assets/video/kgso-highlights-src.mp4`, `assets/brand/helmet-src.jpg`, `assets/brand/logo-original.jpg`, `assets/brand/starfield.jpg` (confirm with owner first).
- Keep JPEG/PNG fallbacks alongside WebP.
- Replace `example.com` origin placeholders when the real domain is known (SEO pass already documented).
