# Architecture

KGSO is a single static page (`index.html`) plus per-section CSS and vanilla JS files. There is no framework, bundler, package manager, backend or database. GSAP 3.12.5 (core, ScrollTrigger, MotionPathPlugin) and Google Fonts come from CDNs.

The diagrams below are embedded copies of the sources in [`docs/architecture/`](architecture/). Edit the source files, then paste the Mermaid block here (see [DEVELOPMENT.md](DEVELOPMENT.md)).

## Key runtime concepts

| Concept | Where | What it does |
|---|---|---|
| Intro gate classes on `<html>` | head script in `index.html`, `js/intro.js` | `intro-lock` (no scroll), `intro-hide` (page hidden), `intro-pre` (hero hidden until GSAP is ready; removed by an 8 s safety timeout), `intro-done` (set when finished), `reduced-motion` |
| `kgso:intro-complete` | dispatched by `intro.js` `complete()` | `helmet-path.js` initialises on it; the flame ticker in `intro.js` is removed on it |
| Companion helmet | `js/helmet-path.js` | Creates `#companion` and a scrubbed ScrollTrigger timeline; exposes `window.KGSOHelmetPath` (`init`, `rebuild`) |
| Registration popup | `js/register.js` | Any `[data-register]` opens `#register`; exposes `window.KGSORegister` (`open`, `close`, `links`, `toast`) and `window.KGSOToast` |
| Link placeholders | `REGISTER_LINKS` in `register.js`, `GUIDEBOOK_URL` in `schedule.js` | `'#'` means "not set": the click shows a "coming soon" toast |
| Mobile menu | `js/nav.js` | Toggles `is-nav-open` on `#navbar` and `nav-open` on `<html>` (max-width 900px) |
| Registration scroll lock | `js/register.js` | `reg-lock` on `<html>`, background siblings set `inert` |
| Persistence | head script | None. Only removes two old `sessionStorage` keys so the intro always plays |

## 1. System architecture

```mermaid
flowchart LR
  user["Visitor browser"]
  subgraph host["Vercel static hosting"]
    html["index.html"]
    css["css/*.css"]
    js["js/*.js"]
    assets["assets/*"]
    seo["robots.txt, sitemap.xml"]
  end
  subgraph cdn["Third-party CDNs"]
    gsap["jsDelivr: GSAP 3.12.5, ScrollTrigger, MotionPathPlugin (SRI pinned)"]
    fonts["Google Fonts: Anton, Inter, Press Start 2P, Silkscreen"]
  end
  subgraph ext["External links (new tab / mail client)"]
    forms["Google Forms (internal / external registration, placeholders)"]
    guide["Guidebook URL (placeholder)"]
    insta["Instagram: reel and two profiles"]
    mail["mailto: stem.society@kgs.edu.pk"]
  end
  user --> html
  html --> css
  html --> js
  html --> assets
  html --> gsap
  html --> fonts
  user -. crawlers .-> seo
  js -. click .-> forms
  js -. click .-> guide
  html -. click .-> insta
  html -. click .-> mail
```

## 2. Application structure

`css/about.css` also holds the shared `kx-*` section styles used by About, Scale, Modules, Schedule, Legacy, FAQ and Contact. `css/style.css` holds the global base, navbar, background and companion helmet.

```mermaid
flowchart TB
  subgraph overlays["Overlays outside #page"]
    intro["#intro: logo, helmet, #countdown, #fx canvas, skip button<br/>css/intro.css, css/countdown.css<br/>js/intro.js, js/countdown.js"]
    reg["#register modal and #reg-toast<br/>css/register.css, js/register.js"]
  end
  subgraph page["#page"]
    nav["#navbar and #site-nav<br/>css/style.css, js/nav.js"]
    home["#home<br/>css/style.css, js/helmet-path.js"]
    video["#video<br/>css/video.css, js/video.js"]
    about["#about<br/>css/about.css"]
    scale["#scale (stat count-ups)<br/>css/about.css, js/modules.js"]
    modules["#modules (13 card carousel)<br/>css/modules.css, js/modules.js"]
    schedule["#schedule<br/>css/schedule.css, js/schedule.js"]
    legacy["#legacy (2026, 2025, 2024)<br/>css/legacy.css, js/legacy.js"]
    faq["#faq (5 tickets)<br/>css/faq.css, js/faq.js"]
    contact["#contact and #footer<br/>css/contact.css"]
    nav --> home --> video --> about --> scale --> modules --> schedule --> legacy --> faq --> contact
  end
  companion["#companion helmet (created by helmet-path.js, appended to body)"]
  intro -. "kgso:intro-complete" .-> companion
```

## 3. Component and module relationships

Scripts are all `defer`red and run in the order listed in `index.html`.

```mermaid
flowchart TB
  headjs["Inline script in head<br/>adds intro-lock, intro-hide, intro-pre, reduced-motion<br/>sets window.__kgsoBgReady"]
  gsap["GSAP, ScrollTrigger, MotionPathPlugin (CDN)"]
  countdown["countdown.js<br/>ticks to 22 Jan 2027, fills .cd-num"]
  intro["intro.js<br/>timeline, flame canvas, skip, parallax,<br/>reveal() then complete()"]
  helmet["helmet-path.js<br/>window.KGSOHelmetPath: init, rebuild"]
  nav["nav.js<br/>toggles is-nav-open and html.nav-open"]
  video["video.js<br/>lazy MP4, play/mute, IntersectionObserver, ring canvases"]
  modules["modules.js<br/>stat count-ups, modules carousel"]
  register["register.js<br/>window.KGSORegister, window.KGSOToast<br/>const REGISTER_LINKS"]
  schedule["schedule.js<br/>const GUIDEBOOK_URL"]
  legacy["legacy.js<br/>expand/collapse year galleries"]
  faq["faq.js<br/>accordion"]
  headjs --> intro
  gsap --> intro
  gsap --> helmet
  gsap --> modules
  gsap --> register
  gsap --> legacy
  intro -- "dispatches kgso:intro-complete" --> helmet
  intro -- "calls KGSOHelmetPath.rebuild after hash scroll" --> helmet
  countdown -. "Register button lives in #countdown markup (data-register)" .-> register
  register -- "reads REGISTER_LINKS via KGSORegister.links" --> schedule
  register -- "KGSOToast" --> schedule
  modules -. "reads #register hidden state" .-> register
```

## 4. Data and interaction flow

Page load and intro:

```mermaid
sequenceDiagram
  actor V as Visitor
  participant H as Head script
  participant I as intro.js
  participant C as countdown.js
  participant P as helmet-path.js
  participant S as ScrollTrigger
  V->>H: open or refresh page
  H->>H: scroll to top, add intro-lock intro-hide intro-pre
  H->>H: decode background webp (fallback jpg) as __kgsoBgReady
  C->>C: tick every second until 22 Jan 2027
  I->>I: wait for fonts and decoded logo/helmet (2.5s cap)
  I->>V: letters fade in, helmet flies in with flame particles
  alt Skip clicked
    V->>I: Skip intro
    I->>I: quickHandoff
  end
  I->>I: reveal(): drop intro-hide, fade in background
  I->>I: complete(): drop intro-lock, add intro-done
  I-->>P: event kgso:intro-complete
  P->>S: create scrubbed timeline (start 0, end max)
  I->>V: scroll to location.hash target or top
  V->>S: scroll
  S->>P: letters and countdown dissolve, helmet parks at right
```

Interactions after load:

```mermaid
flowchart TB
  scroll["Scroll"] --> st["ScrollTrigger: parallax bg, helmet companion, stat count-ups (once)"]
  scroll --> io["IntersectionObserver in video.js: pause off-screen, attach MP4 near viewport"]
  navclick["Navbar link"] --> anchor["Native #anchor scroll"]
  menu["Menu button / Esc / outside click"] --> navjs["nav.js: toggle is-nav-open and html.nav-open"]
  regbtn["Any [data-register] element"] --> modal["register.js opens #register, adds html.reg-lock, inerts background"]
  modal --> card["Pick Internal or External"]
  card -- "URL set" --> forms["Google Form in new tab, modal closes"]
  card -- "still '#'" --> toast["KGSOToast: Form link coming soon"]
  sched["Schedule buttons"] -- "URL set" --> forms
  sched -- "still '#'" --> toast
  carousel["Modules arrows, dots, keys, swipe"] --> mc["modules.js re-centres cards"]
  lg["Legacy banner or close button, Esc"] --> lgjs["legacy.js animates spill height and shots"]
  faqbtn["FAQ ticket"] --> faqjs["faq.js toggles is-open and aria-expanded"]
  links["Contact links, video CTA"] --> ext["Instagram profiles / reel (new tab), mailto"]
```

## 5. Repository structure

```mermaid
flowchart LR
  root["KGSO_Website/"]
  root --> index["index.html (single page)"]
  root --> seo["robots.txt, sitemap.xml"]
  root --> readme["README.md"]
  root --> ignores[".gitignore, .vercelignore"]
  root --> css["css/<br/>style, intro, countdown, video, register,<br/>about, modules, schedule, legacy, faq, contact"]
  root --> js["js/<br/>countdown, intro, helmet-path, nav, video,<br/>modules, register, schedule, legacy, faq"]
  root --> scripts["scripts/verify-refs.js"]
  root --> assets["assets/"]
  root --> docs["docs/"]
  assets --> brand["brand/ logo, helmet, favicons"]
  assets --> bg["bg/ page background"]
  assets --> video["video/ highlights MP4 and poster"]
  assets --> legacy["legacy/2024, 2025, 2026 gallery stills"]
  docs --> arch["ARCHITECTURE.md, DEVELOPMENT.md, ASSETS.md, DEPLOYMENT.md"]
  docs --> diagrams["architecture/ diagram sources"]
```
