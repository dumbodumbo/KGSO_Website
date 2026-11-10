# Development guide

There is no package manager and no build. Edit files and reload.

## Run locally

```bash
python -m http.server 5500
```

Open <http://localhost:5500>. Any static server works. Prefer a server over opening `index.html` via `file://`.

## Checks

```bash
node scripts/verify-refs.js        # every local href/src/srcset/url()/asset string resolves; lists orphans; checks Markdown links
node --check js/intro.js           # syntax check for one file; repeat per file
```

PowerShell, all files: `Get-ChildItem js\*.js | % { node --check $_.FullName }`

Neither check renders the page. Always eyeball the intro, scrolling, popup and galleries in a real browser, on desktop and a phone-sized viewport.

## Conventions

- **Section ids** are lowercase single words (`#about`, `#modules`); the navbar links match them.
- **CSS class prefixes** per section: `cd-` countdown, `vid-` video, `reg-` registration, `kx-` shared section chrome, `st-` stats, `mc-` modules carousel, `sc-` schedule, `lg-` legacy, `fq-` FAQ, `ct-` contact. Use the prefix of the file you are in.
- **State classes** are `is-*` (`is-open`, `is-active`, `is-nav-open`, `is-paused`, `is-live`, `is-on`); page-level state lives on `<html>` (`intro-lock`, `intro-done`, `reg-lock`, `nav-open`, `reduced-motion`).
- **JS** is ES5-style IIFEs with `'use strict'`, one file per section, no modules. Cross-file hooks are explicit `window.KGSO*` globals or the `kgso:*` events (see [ARCHITECTURE.md](ARCHITECTURE.md)). `REGISTER_LINKS` and `GUIDEBOOK_URL` are top-level `const`s on purpose, for easy editing.
- **Data attributes** mark behavior hooks: `data-register`, `data-register-close`, `data-reg`, `data-sc-reg`, `data-guidebook`, `data-count`, `data-scramble`, `data-src`.
- **Respect reduced motion**: JS checks `html.reduced-motion` or the media query; keep new animations conditional on it.

## Cache busting

Static files are referenced as `path?v=N` (for example `css/style.css?v=24`, `assets/bg/background.webp?v=5`). When you change a CSS, JS or asset file, increment its `N` in **every** place it is referenced:

- the `<link>`/`<script>`/`<img>`/`<source>`/`<video>` tags in `index.html`
- the `<link rel="preload">` and the head script's `decodeImg(...)` calls for the background and logo/helmet
- `url()` / `image-set()` in `css/style.css` (background)

Each file has its own counter; counters are not global. Do not rename files just to bust cache.

## Add a section

1. Add `<section id="name" class="kx-sec" aria-labelledby="name-title">` in `index.html` `<main>` at the right position. Copy the `kx-head` title block from an existing section.
2. Add a navbar link `<a href="#name">` in `#site-nav`.
3. Create `css/name.css` with a two-letter prefix and add `<link rel="stylesheet" href="css/name.css?v=1">` after the other section styles.
4. If it needs JS, create `js/name.js` as an IIFE that returns early when `document.getElementById('name')` is missing, and add `<script defer src="js/name.js?v=1"></script>` after `faq.js`. Guard on `window.gsap` if you use it.
5. If it adds ScrollTrigger animations, call `ScrollTrigger.refresh()` after layout changes (see `legacy.js`/`modules.js` for patterns).
6. Update the diagram in `docs/architecture/application-structure.md` and the copy in `ARCHITECTURE.md`.
7. Run the checks above.

## Where things go

- Page-wide base, navbar, background, companion helmet: `css/style.css`.
- Section-specific styles: that section's CSS file.
- Images, video: `assets/` (see [ASSETS.md](ASSETS.md)). Reference with root-relative paths from `index.html` and `../assets/...` from CSS.
- Docs: `docs/`; diagram sources: `docs/architecture/`.

## Editing diagrams

Mermaid sources are in `docs/architecture/*.md`. After editing one, copy the block into the matching section of `ARCHITECTURE.md`. GitHub and most Markdown viewers render Mermaid; keep labels that contain `#`, `(`, `:` or `'` inside double quotes.

## Updating placeholders

See the Configuration section of the [README](../README.md).
