# KGSO Website

Static multi-page site for the **Karachi Grammar School Olympiad (KGSO)** — no backend, no build step.

## Local setup

From the project root:

```bash
python -m http.server 5500
```

Then open [http://localhost:5500](http://localhost:5500) (`index.html`).

Any static file server works (Live Server, `npx serve`, nginx, etc.).

## Structure

| Path | Role |
|------|------|
| `index.html` | Home: intro, countdown, video, about, modules, schedule, expandable Legacy galleries, FAQ, contact, register modal |
| `css/` | Section stylesheets |
| `js/` | Vanilla JS (intro, helmet path, modules carousel, FAQ, register, etc.) |
| `assets/brand/` | Logo letters, helmet, favicons, starfield / source backups |
| `assets/bg/` | Page background |
| `assets/video/` | Highlights MP4, poster, optional src backup |
| `assets/legacy/2024\|2025\|2026/` | Year gallery stills (jpg + webp) |
| `docs/` | Engineering / performance / cross-device notes |
| `robots.txt` / `sitemap.xml` | Crawler hints |

**CDN:** GSAP 3.12.5 (jsDelivr). **Fonts:** Google Fonts (Anton, Inter, Press Start 2P, Silkscreen).

## Before production deploy

1. Replace every `https://example.com` placeholder in:
   - `index.html` (canonical + Open Graph / Twitter URLs)
   - `robots.txt` (`Sitemap:`)
   - `sitemap.xml` (`<loc>`)
2. Paste real Google Form URLs in `js/register.js` (`REGISTER_LINKS`) and the guidebook URL in `js/schedule.js` (`GUIDEBOOK_URL`).
3. Optional: drop unused source backups from the publish set after confirming they are not needed (`assets/brand/*-src*`, `logo-original.jpg`, `starfield.jpg`, `assets/video/kgso-highlights-src.mp4`).

## Static hosting — security notes (CSP)

Do **not** ship a naive `Content-Security-Policy` `<meta>` that blocks Google Fonts or the GSAP CDN — that will break the site.

Prefer **HTTP response headers** on the host (Netlify `_headers`, Vercel headers, nginx, Cloudflare). Example starting point (tune after testing):

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  media-src 'self';
  connect-src 'self';
  frame-ancestors 'none';
  base-uri 'self'
```

Also consider: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.

Inline scripts in `index.html` require `'unsafe-inline'` in `script-src` unless you move them to files or add nonces.

## License / credit

Site credit: Muhammad Hassan Jamshaid (see footer on the home page).
