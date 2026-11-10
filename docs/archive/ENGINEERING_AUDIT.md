> **Archived reference note (Nov 2026).** Point-in-time snapshot; parts are outdated (e.g. mentions of a separate `legacy.html` page, which no longer exists - Legacy is an in-page section of `index.html`). For current docs see [docs/ARCHITECTURE.md](../ARCHITECTURE.md) and [README.md](../../README.md).

# KGSO Website — Engineering / Optimization / Security / QA Audit

**Date:** 2026-11-07  
**Scope:** Static multi-page site at `C:\Users\Solar Turbines User\KGSO_Website`  
**Constraint:** No redesign. Preserve visual design, animations, section order, copy, colors, typography, and interaction behavior unless a change is explicitly approved.

---

## 1. Discovery summary

### Architecture
- Static multi-page HTML (no backend, no build step).
- Pages: `index.html` (home + all primary sections), `legacy.html` (dedicated Legacy galleries — conversion in progress / present during this audit).
- Styles: modular CSS under `css/` (`style.css`, `intro.css`, `countdown.css`, `video.css`, `register.css`, `about.css`, `modules.css`, `schedule.css`, `legacy.css`, `legacy-page.css`, `faq.css`, `contact.css`).
- Scripts: vanilla JS under `js/` + GSAP 3.12.5 from jsDelivr CDN (`gsap`, `ScrollTrigger`, `MotionPathPlugin`).
- Fonts: Google Fonts — Anton, Press Start 2P, Silkscreen (head link); Inter via `@import` in `about.css` (also used by FAQ).
- Media: `assets/` — hero background, logo letters, helmet, highlights MP4 (~4.6 MB) + poster, legacy year galleries (2024–2026). Several unused `*-old` / source assets present.
- Git: branch `development`, **no commits yet**; working tree untracked. **No commit performed** (per instructions).

### Concurrent work note
Another agent was converting in-page Legacy into `legacy.html` during this audit. At audit time:
- Nav Legacy → `legacy.html`
- `#legacy` on home is a teaser with links into `legacy.html#kgso-YYYY`
- `js/legacy.js` is an empty stub still referenced from `index.html`
- Prefer not to rework Legacy structure further in this pass

### Baseline (observed, not invented)
| Item | Observation |
|------|-------------|
| Approx. tree size | ~7.1 MB (dominated by `kgso-highlights.mp4` ~4.6 MB) |
| Local server | `http://localhost:5500` already listening |
| Home title | `KGSO` |
| Console / GSAP | GSAP loaded on home; no script errors observed in a short Runtime check |
| Legacy page | Loads; landmarks present; no GSAP (expected) |
| Lighthouse | Not run end-to-end in this environment (automation focused on spot checks) |

---

## 2. Prioritized findings

### Critical
_None identified for a static brochure site with no auth, forms backend, or secret handling._

| ID | Finding | Location | Impact | Recommended fix | Approval needed? |
|----|---------|----------|--------|-----------------|------------------|
| — | — | — | — | — | — |

### High

| ID | Finding | Location | Impact | Recommended fix | Approval needed? |
|----|---------|----------|--------|-----------------|------------------|
| H1 | Missing meta description, Open Graph, Twitter cards, canonical | `index.html`, `legacy.html` `<head>` | Weak SEO / link previews | Add description + OG/Twitter + canonical placeholders; document real origin in README | **No** (placeholders OK) |
| H2 | No `robots.txt` / `sitemap.xml` | project root | Crawlers lack guidance | Add both; sitemap absolute URLs use documented placeholder origin until production domain is set | **No** |
| H3 | Highlights video ~4.6 MB autoplays (muted) | `assets/video/kgso-highlights.mp4`, `#video` | Heavy LCP/bandwidth on mobile | Re-encode / lower bitrate; keep poster; optional `preload="none"` tradeoff | **Yes** (may change start feel / quality) |
| H4 | Third-party GSAP via CDN without SRI/`crossorigin` | bottom of `index.html` | Supply-chain risk if CDN compromised | Pin + `integrity` + `crossorigin`, or vendor locally | **Yes** (wrong hash breaks site) |
| H5 | Unused legacy/source assets ship with the site | `assets/*-old*`, `helmet-src.jpg`, `logo-original.jpg`, `starfield.jpg`, `js/*.bak*` | Inflates deploy size (~0.7 MB+), noise | Remove from publish set or `/archive` after confirm | **Yes** (may be intentional backups) |

### Medium

| ID | Finding | Location | Impact | Recommended fix | Approval needed? |
|----|---------|----------|--------|-----------------|------------------|
| M1 | `scroll-behavior: smooth` ignores reduced motion | `css/style.css` | A11y: forced smooth scroll for reduce-motion users | Gate with `@media (prefers-reduced-motion: reduce)` | **No** |
| M2 | Inter loaded via CSS `@import` | `css/about.css` L1 | Extra render-blocking round-trip; duplicates Google Fonts pipeline | Add Inter to the existing `<head>` fonts URL; drop `@import` | **No** (same fonts; FOIT timing may improve slightly) |
| M3 | Stub `legacy.js` still loaded | `index.html` script tag + `js/legacy.js` | Extra request for no-op | Remove script tag once Legacy conversion settled; delete file if unused | **Defer** (concurrent Legacy work) |
| M4 | Registration / guidebook URLs are `#` | `js/register.js`, `js/schedule.js` | Users see “coming soon” toasts | Paste real Google Form / guidebook URLs when ready | **Yes** (content/ops) |
| M5 | External `target="_blank"` uses `noopener` only | contact / video / reg links | Minor tab-napping hardening gap | Use `rel="noopener noreferrer"` | **No** |
| M6 | Sparse document title | `index.html` `<title>KGSO</title>` | Weak SERP / bookmark clarity | Expand title (e.g. include Olympiad / school) without changing on-page brand treatment | **No** |
| M7 | Hero / logo `<img>` lack width/height | `#logo` images | Possible CLS before CSS applies | Add intrinsic `width`/`height` matching files | **No** |
| M8 | No favicon / app icons | `<head>` | Browser tab / bookmark polish | Add favicon derived from helmet/logo | **Yes** (brand asset choice) |
| M9 | `legacy.html` has no `<footer>` | `legacy.html` | Landmark inconsistency vs home | Add matching credit footer if desired | **Yes** (adds visible content) |
| M10 | Production CSP not documented | hosting | XSS mitigation on static host | Document recommended CSP in README (headers, not a brittle `<meta>` that blocks GSAP/Fonts) | **No** (docs only) |

### Low

| ID | Finding | Location | Impact | Recommended fix | Approval needed? |
|----|---------|----------|--------|-----------------|------------------|
| L1 | No project README | root | Onboarding friction | Add setup (python http.server), structure, static-hosting notes | **No** |
| L2 | Backup file in tree | `js/helmet-path.js.bak-busy-v6` | Clutter / accidental publish | Delete or move out of web root | **No** if confirmed unused |
| L3 | Cover banners on home could lazy-load | `#legacy` covers | Slightly defer below-fold bytes | `loading="lazy"` on teaser covers | **No** |
| L4 | Nav density on narrow viewports | `#navbar` | Existing small-font stacking (~520px media) | Optional hamburger — **redesign** | **Yes** |
| L5 | Cache-bust query params vary by file | CSS/JS `?v=` | Fine if intentional; risk of stale if one bump missed | Keep bumping on edit; optional single build hash later | **Defer** |
| L6 | Home still contains `#legacy` teaser + separate page | index + legacy | Intentional during split; watch for duplicate SEO content | After conversion settles, ensure only one canonical gallery body; keep teaser or remove | **Yes** / coordinated with Legacy agent |

### Explicitly out of scope / do not change
- Helmet motion path / `helmet-path.js` timings  
- Flame / intro FX behavior  
- FAQ ticket visual design  
- Copy, colors, typography, section order  
- Introducing frameworks or a bundler  

---

## 3. Implementation plan (safe only)

Will implement after this file exists:
1. SEO metas + canonical placeholders on `index.html` and `legacy.html`
2. `robots.txt`, `sitemap.xml` (placeholder origin `https://example.com` — replace on deploy)
3. Reduced-motion scroll-behavior gate
4. Inter moved into head font URL; remove `@import`
5. `noopener noreferrer` on external links
6. Intrinsic dimensions + lazy-load on safe images
7. Richer `<title>` / descriptions (copy for meta only)
8. Delete confirmed backup `.bak` file
9. `README.md` (setup, structure, CSP notes for static hosting)
10. Leave Legacy conversion files alone beyond SEO head tags

---

## 4. FINAL REPORT

**Verified:** 2026-11-07 against `http://localhost:5500` (home + `legacy.html`).

### Fixed (safe, UX-preserving)

| Item | Change |
|------|--------|
| SEO head tags | Title/description, canonical, OG, Twitter on `index.html` + `legacy.html` (origin placeholder `https://example.com`) |
| Crawlers | Added `robots.txt`, `sitemap.xml` |
| Reduced motion | `scroll-behavior: auto` when `prefers-reduced-motion: reduce` (`css/style.css` → `?v=10`) |
| Fonts | Inter moved into head Google Fonts URL; removed `about.css` `@import` (`?v=2`) |
| External links | `rel="noopener noreferrer"` on `target="_blank"` links |
| Images | Intrinsic `width`/`height` on logo/helmet + legacy gallery/teaser covers; lazy-load on home teaser covers |
| Docs | `README.md` (python server, structure, CSP header notes — no CSP meta) |
| Dead file | Removed `js/helmet-path.js.bak-busy-v6` |

### Deferred / needs approval

| Item | Why |
|------|-----|
| Video re-encode / `preload` change | May change start feel / quality (H3) |
| GSAP SRI / local vendor | Wrong integrity breaks site (H4) |
| Delete unused `assets/*-old*` etc. | May be intentional archives (H5) |
| Real form / guidebook URLs | Ops content (M4) |
| Favicon | Brand asset choice (M8) |
| Footer on `legacy.html` | Adds visible UI (M9) |
| Remove stub `legacy.js` script tag | Concurrent Legacy conversion (M3) |
| Helmet path / flames / FAQ look / copy | Explicitly out of scope |
| Replace `example.com` placeholders | Requires real production domain |

### Files changed

- `ENGINEERING_AUDIT.md` (new)
- `README.md` (new)
- `robots.txt` (new)
- `sitemap.xml` (new)
- `index.html`
- `legacy.html`
- `css/style.css`
- `css/about.css`
- Deleted: `js/helmet-path.js.bak-busy-v6`

### Before / after measurements

| Metric | Before | After |
|--------|--------|-------|
| Home `<title>` | `KGSO` | `KGSO — Karachi Grammar School Olympiad` |
| Meta description / OG / canonical | Absent | Present (placeholder origin) |
| `robots.txt` / `sitemap.xml` | Absent | Served at localhost |
| Tree size | ~7.1 MB | ~7.1 MB (video still dominates; bak removed ~13 KB) |
| Console / GSAP (home spot check) | GSAP OK | GSAP OK; pages render; Legacy galleries load |
| Lighthouse scores | Not captured in this pass | Not captured |

### Spot-check notes

- Home: intro → main content accessible; modules carousel, FAQ tickets, contact links present; Legacy teaser links point at `legacy.html#kgso-YYYY`.
- `legacy.html`: SEO metas present; 12 gallery images have dimensions; nav `aria-current="page"` on Legacy.
- No redesign; animation timings and helmet path untouched.
