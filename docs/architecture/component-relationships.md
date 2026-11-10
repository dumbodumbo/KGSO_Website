# Component and module relationships

How the JS files depend on each other. Scripts are all `defer`red and run in the order listed in `index.html`: GSAP libs, `countdown`, `intro`, `helmet-path`, `nav`, `video`, `modules`, `register`, `schedule`, `legacy`, `faq`.

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

Notes:

- `modules.js` only reads `#register` (`modal.hidden`) so carousel arrow keys are ignored while the popup is open.
- `schedule.js` falls back to writing into `#reg-toast` itself if `KGSOToast` is missing.
- `intro.js`, `helmet-path.js` and `legacy.js`/`modules.js` degrade when GSAP is absent (intro completes immediately; helmet-path and legacy return early).
- `window.__kgsoIntro` is a debug handle for the intro timeline; nothing in the site depends on it.
