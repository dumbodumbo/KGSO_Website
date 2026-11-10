> **Archived reference note (Nov 2026).** Point-in-time snapshot; parts are outdated (e.g. mentions of a separate `legacy.html` page, which no longer exists - Legacy is an in-page section of `index.html`). For current docs see [docs/ARCHITECTURE.md](../ARCHITECTURE.md) and [README.md](../../README.md).

# Cross-Device Optimization & Compatibility Audit

**Project:** KGSO Website  
**Date:** 2026-11-08  
**Method:** Code inspection of `index.html` + all section CSS/JS, plus **browser DevTools viewport emulation** (not physical hardware). Local server: `http://127.0.0.1:5500/`.

**Design constraint:** Preserve cinematic intro, helmet companion, flames, ticket FAQ, legacy banners — compatibility fixes only, not a redesign.

---

## Emulated viewports

| Viewport | Class | Overflow-x | Nav usable | Hero fit | Notes |
|---|---|---|---|---|---|
| 360×740 | Phone | Yes (nav + slight) | **No** — FAQ/Contact clipped | OK (2×2 countdown, Register in view) | Tiny nav targets (~13px) |
| 390×844 | Phone | Yes | **No** — Contact clipped | OK | Same nav failure |
| 430×932 | Phone | Yes | **No** — Contact clipped | OK | Helmet mid-right over FAQ tickets |
| 768×1024 | Tablet portrait | No | Yes (cramped, ~17px high) | OK | FAQ already stacked (≤900) |
| 820×1180 | Tablet portrait | No | Yes | OK | Legacy gallery 2×2 |
| 1024×1366 | Tablet portrait | No | Yes | OK | Desktop-like bar |
| 1024×768 | Tablet landscape | No | Yes | OK | |
| 1180×820 | Tablet landscape | No | Yes | OK | |
| 1366×768 | Laptop | No | Yes | OK | |
| 1440×900 | Desktop | No | Yes | OK | |
| 1920×1080 | Desktop | No | Yes | OK | |
| 844×390 | Short phone landscape | No | Yes | Tight but Register in view | Stacked hero path (`max-aspect-ratio` off) |

---

## Existing breakpoints (pre-fix)

| File | Breakpoints |
|---|---|
| `style.css` | 520px (nav font shrink only) |
| `countdown.css` | aspect-ratio 2/1 + 1/1 @ min-height 480 |
| `faq.css` | 900 (stack), 520 (compact ticket) |
| `modules.css` | 700 |
| `legacy.css` | 820 (2×2 gallery), 480 |
| `about.css` / `schedule.css` | 760, 420 |
| `video.css` | 700 |
| `register.css` | 520 |

**Gaps:** no hamburger/compact nav, no `env(safe-area-inset-*)`, sections use `min-height: 100vh` only, companion helmet size floor still large on narrow phones.

---

## Prioritized findings

### P0 — Must fix

1. **Nav overflow on phones (≤~480–520px)**  
   Seven uppercase links + brand in one row. At 360–430, **FAQ/Contact sit past the right edge**; `documentElement.scrollWidth` exceeds viewport. Link hit height ~13px (≪44px).  
   *Screenshot:* `page-2026-11-08T08-31-30` (360 hero + clipped nav).

2. **No safe-area padding on fixed `#navbar`**  
   Notch/home-indicator devices will put links under the status bar; `viewport-fit=cover` not set.

### P1 — High

3. **`100vh` section floors**  
   `#home` and `main section` use `min-height: 100vh`. On iOS this can exceed the visible viewport (URL bar), making hero/Register feel cut off or forcing extra scroll. Prefer `svh`/`dvh` with `vh` fallback.

4. **Companion helmet vs content on narrow screens**  
   Parks ~mid-right (`cy ≈ 48vh`, size up to ~64px below 600px). Does not cover Register on hero, but **overlaps FAQ tickets / right-side CTAs** while scrolling (pointer-events already none — visual obstruction only).  
   *Screenshot:* FAQ at ~430 with helmet over ticket stubs.

5. **Touch targets**  
   Nav links, module dots (~18–22px), video controls (min 28px), legacy close (36px) undersized for thumb use.

### P2 — Medium

6. **FAQ tickets**  
   Already stack at ≤900 with reduced tilt (±2°). On ~360, slight rotation + stub column can feel tight; text remains readable. Prefer near-zero tilt / slightly larger type on ≤420.

7. **Modules carousel**  
   Swipe + arrows present; arrows 40px on mobile (close to 44). Width capped at 100%. Low risk of page overflow if parent padding respected.

8. **Legacy**  
   Stacks; gallery already `2×2` ≤820. Hint text hidden ≤820 — OK. Close button slightly small.

9. **Decorative video rings/sparks**  
   Extend past frame; `#video { overflow: hidden }` contains most bleed. Residual document `scrollWidth` +1–2px on phones — soft `overflow-x: clip` on root helps.

10. **Hover-only affordances**  
    FAQ/legacy/register open on **click/tap** already. Module tilt gated behind `(hover: hover)`. Register/FAQ hover styles lack strong `:active` parity on some controls (minor).

### P3 — Low / watch

11. **Short landscape (844×390)** — stacked hero works; padding tight but Register visible.  
12. **Title `white-space: nowrap`** — “Scale & Legacy” fits at 360 in current font clamp; watch if copy grows.  
13. **Intro / helmet / flames** — leave intact; no change requested beyond tuck/scale of companion.

---

## Design compromise questions (ask before changing)

- Is a **hamburger / slide-down mobile menu** acceptable vs. horizontal-scroll nav with fade? (Recommended: hamburger — clearer targets, no redesign of desktop bar.)  
- May the parked companion **shrink further / sit higher** on ≤420px so it does not sit on FAQ stubs? (Recommended: yes — still present, just smaller.)  
- FAQ: OK to force **0° tilt below 420px** while keeping ticket chrome? (Recommended: yes.)

---

## Fix plan (Phase 3–4)

| # | Fix | Touch |
|---|---|---|
| 1 | Mobile menu ≤900px; desktop bar unchanged | `index.html`, `style.css`, `js/nav.js` |
| 2 | `viewport-fit=cover` + navbar safe-area padding | `index.html`, `style.css` |
| 3 | `min-height: 100vh` → add `100svh` (and home `100dvh` where useful) | `style.css` |
| 4 | Smaller / higher park for companion on very small widths | `helmet-path.js` |
| 5 | Module arrows ≥44px; larger dots; video btn min 44 on small | `modules.css`, `video.css` |
| 6 | FAQ near-flat tilt + readability on ≤420 | `faq.css` |
| 7 | Root `overflow-x: clip`; legacy close ≥44 | `style.css`, `legacy.css` |
| 8 | Tap `:active` parity where cheap | `faq.css`, `register.css`, `legacy.css` |
| 9 | Bump `?v=` on changed CSS/JS | `index.html` |

---

## Phase 5–6 status (post-fix re-test)

Emulation re-checked after fixes (same viewport set; not physical devices).

| Issue | Status |
|---|---|
| Nav overflow / clipped links on phones | **Fixed** — hamburger ≤900px; desktop bar unchanged (>900). Open menu uses opaque panel + full-page scrim; lifts `#page` above floating `#intro`. Touch rows 48px; toggle 44×44. |
| Safe-area on fixed nav | **Fixed** — `viewport-fit=cover` + `env(safe-area-inset-*)` on navbar / hero / body gutters. (Emulators return 0 inset; CSS ready for notches.) |
| `100vh` iOS risk | **Fixed** — sections use `100vh` + `100svh`; `#home` also `100dvh`. |
| Hero / countdown / Register on phones | **OK** — Register in view at 360×740 and 844×390; short-height countdown tighten added. |
| Modules carousel | **Improved** — arrows 44px; dots 44px hit area on ≤700. Swipe unchanged. |
| FAQ tickets on narrow | **Improved** — `0deg` tilt ≤420; stacked layout ≤900 preserved. |
| Legacy banners / gallery | **OK** — already stack + 2×2 ≤820; close control 44px. |
| Companion helmet vs CTAs | **Improved** — ≤420: smaller park (~36–48px) and higher (`~34vh`). pointer-events still none. |
| Hover-only FAQ/legacy/register | **OK** — click/tap already; `:active` parity added where cheap. |
| Document overflow-x on phones | **Fixed** — `overflow-x: clip` on html/body; nav no longer extends scrollWidth. |

### Remaining / watch

- Physical device QA still recommended (notch, iOS URL-bar `dvh` feel, real touch swipe on modules).
- Open mobile menu briefly covers floating logo/countdown by design (scrim); desktop look unchanged.
- Module/video decorative bleed is clipped; no further redesign of film-strip sparks.
- If hamburger at tablet portrait (768–900) feels too early, breakpoint can move to ~720 — ask before changing.

### Design compromise confirmations used

1. **Hamburger mobile menu** (not horizontal scroll) — implemented.  
2. **Smaller / higher companion** on ≤420 — implemented.  
3. **0° FAQ tilt on ≤420** — implemented (ticket chrome kept).

### Cache bust

Changed assets bumped in `index.html`: `style.css?v=21`, `intro.css?v=8`, `countdown.css?v=7`, `video.css?v=5`, `register.css?v=2`, `about.css?v=3`, `modules.css?v=3`, `legacy.css?v=6`, `faq.css?v=2`, `helmet-path.js?v=47`, new `nav.js?v=2`.

No commit / push performed.
