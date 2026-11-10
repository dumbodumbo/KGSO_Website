# Data and interaction flow

No data is persisted. The head script calls `sessionStorage.removeItem` for two legacy keys (`kgso_skip_intro`, `kgso_intro_seen`) so the intro always plays; nothing is written to `localStorage` or `sessionStorage`. There are no network requests besides static files, the CDNs and outbound links.

## Page load and intro

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

## User interactions after load

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
