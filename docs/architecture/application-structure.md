# Application structure

Everything lives in one page, `index.html`. Sections appear in document order below, with the CSS and JS that drive each. `css/about.css` also holds the shared `kx-*` section styles (title row, panels, sparks) used by About, Scale, Modules, Schedule, Legacy, FAQ and Contact. `css/style.css` holds the global base, navbar, background and the companion helmet.

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
