# KGSO Website

Single-page static site for the **Karachi Grammar School STEM Olympiad (KGSO)**, run by the KGS STEM Society. No backend, no package manager, no build step.


## Run it locally

- **Mac:** double-click `Start KGSO (Mac).command`. It starts a small local server and opens the site at http://localhost:8000. The first time, macOS may block it: right-click the file, choose Open, then Open again.
- **Windows:** double-click `Start KGSO (Windows).bat`.
- **Any system with Python 3:** in this folder run `python3 -m http.server 8000`, then open http://localhost:8000.

Close the terminal window to stop the server.

## What it is

The main page (`index.html`) with a GSAP-driven intro and countdown, highlights video, About, Scale & Legacy stats, a Modules carousel (13 modules), Schedule (22-24 January 2027), expandable Legacy galleries (2024-2026), FAQ, Contact, and a registration popup. Two pages sit beside it: `vendors.html` (crashed snack rocket and vendor crates) and `sponsors.html` (sponsor cards by tier).

## Stack

- Plain HTML, CSS and vanilla JavaScript (one CSS and one JS file per section)
- GSAP 3.12.5 + ScrollTrigger + MotionPathPlugin from jsDelivr (SRI-pinned)
- Google Fonts: Anton, Inter, Press Start 2P, Silkscreen
- Hosted on Vercel as static files

## Structure

```
index.html          the main page
vendors.html        vendors page (js/vendors.js, js/pixel.js, css/vendors.css)
sponsors.html       sponsors page (css/pages.css)
css/                pages (vendors + sponsors), style, intro, countdown, video, register, about, modules, schedule, legacy, faq, contact
js/                 transition (fade between pages), pixel + vendors (vendors page), countdown, intro, helmet-path, nav, video, modules, register, schedule, legacy, faq
assets/
  brand/            logo, helmet, favicons (+ local-only source originals)
  bg/               page background (webp + jpg)
  video/            highlights mp4 + poster
  legacy/<year>/    2024, 2025, 2026 gallery stills (webp + jpg)
scripts/            verify-refs.js (reference checker)
docs/               architecture, development, assets, deployment 
robots.txt, sitemap.xml
```

## Getting started

There is nothing to install. Serve the folder with any static server:

```bash
python -m http.server 5500
```

Open <http://localhost:5500>. Optional checks (Node.js only, no dependencies):

```bash
node scripts/verify-refs.js
```

## Configuration

These values are placeholders today and must be set by hand:

| What | Where | Notes |
|---|---|---|
| Registration form URLs | `REGISTER_LINKS` (`internal`, `external`) in `js/register.js` | `'#'` shows a "Form link coming soon" toast; also drives the Schedule registration buttons |
| Guidebook URL | `GUIDEBOOK_URL` in `js/schedule.js` | `'#'` shows "Guidebook coming soon" |
| Production domain | `https://example.com` in `index.html` (canonical, `og:url`, `og:image`, `twitter:image`), `robots.txt`, `sitemap.xml` | Replace with the real origin |
| Vendors | `VENDORS` at the top of `js/vendors.js` | Name, what they serve, stall, and which pixel snack shows on the crate |
| Sponsors | the cards in `sponsors.html` | Name, plus a logo `<img>` in place of the "Logo" box |
| Event date | `TARGET` in `js/countdown.js` (22 Jan 2027, visitor local time) | Schedule dates are in `index.html` |

After changing a file, bump its `?v=N` in `index.html` (see [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)).

## Documentation

- [Architecture and diagrams](docs/ARCHITECTURE.md) (diagram sources in [docs/architecture/](docs/architecture/system-architecture.md))
- [Development guide](docs/DEVELOPMENT.md): conventions, cache busting, adding a section
- [Assets](docs/ASSETS.md): inventory, large files, naming
- [Deployment](docs/DEPLOYMENT.md): Vercel notes, pre-release checklist, headers

## Development guidelines

- Keep one CSS and one JS file per section; follow the class prefixes in the development guide.
- Respect `prefers-reduced-motion` in new animations.
- Do not commit source originals (`*-src.*`, `logo-original.jpg`); they are git-ignored.
- Run `node scripts/verify-refs.js` after moving or renaming any file.

## Known issues

- Registration and guidebook links are unset placeholders.
- `example.com` SEO placeholders are still in place.
- Vercel CLI deploys from the git folder can be blocked by the commit-author check; deploy from a git-free copy (see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)). This is a documented workaround, not enforced.
- No automated tests; visual behavior is checked manually in a browser.
- A few assets are unreferenced (listed in [docs/ASSETS.md](docs/ASSETS.md)).

## Credit

Developed by [Muhammad Hassan Jamshed](https://github.com/Hassan-jamshaid-dev) (see the page footer).
