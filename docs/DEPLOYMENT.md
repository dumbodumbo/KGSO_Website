# Deployment

The site is plain static files hosted on Vercel. There is no build command and no output directory beyond the project root.

## Before the first public release

1. Replace every `https://example.com` with the production origin in:
   - `index.html` (`canonical`, `og:url`, `og:image`, `twitter:image`)
   - `robots.txt` (`Sitemap:`)
   - `sitemap.xml` (`<loc>`)
2. Set `REGISTER_LINKS` in `js/register.js` and `GUIDEBOOK_URL` in `js/schedule.js`, then bump their `?v=` in `index.html`.
3. Run `node scripts/verify-refs.js`.
4. Test in a browser (intro, scroll, popup, galleries, mobile).

## What gets deployed

`.vercelignore` excludes `docs/`, plan files, source backups (`*-src.*`, `*.bak*`, `assets/brand/logo-original.jpg`), logs and editor folders. `.gitignore` excludes similar source backups; `docs/` is committed but not deployed.

## Known issue: CLI deploys from the git folder

`vercel` CLI deployments run from this git working folder can be blocked by Vercel's commit-author check. Workaround (a convention, not enforced by any script): copy the project to a folder without a `.git` directory and run the deploy from there, for example:

```powershell
robocopy . ..\KGSO_Deploy /E /XD .git .cursor node_modules
cd ..\KGSO_Deploy
vercel --prod
```

The `.vercel/` link folder (project id) is local and git-ignored; copy it into the deploy folder if the CLI asks to relink. Git-connected deploys from the Vercel dashboard are an alternative if the author check can be satisfied.

## Security headers (optional)

A `<meta>` Content-Security-Policy would break Google Fonts or the GSAP CDN, so use response headers instead (a `vercel.json` `headers` block). A starting point, to be tested before use:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; media-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

`'unsafe-inline'` is needed because `index.html` has an inline head script and inline `<style>`; the GSAP script tags already use SRI hashes. No `vercel.json` exists today.
