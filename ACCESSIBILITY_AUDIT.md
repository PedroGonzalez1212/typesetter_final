# Accessibility Audit — The Typesetter (WCAG 2.2 AA)

**Status:** Phase 3 complete. All "Will fix" items are applied and verified. Nothing is committed or deployed.
**Date:** 2026-11-17 · **Standard:** WCAG 2.2 Level AA · **§ references:** "Lineamientos de accesibilidad para etapa de diseño web" v1.0 (G. Muñoz)
**Method:** code review, plus headless Microsoft Edge 157 (Chromium) at 320–1440 px. Checks covered the Tab order, computed focus styles, the Chromium accessibility tree (CDP), reflow, WCAG text spacing, mocked `fetch` form submissions, and pixel comparison before and after the changes.
**Not done:** testing with real NVDA. The NVDA lines in §6 are the expected announcements, derived from the verified accessibility tree. Final confirmation is left to the consultant.

---

## 0. Site map

| Item | Finding |
|---|---|
| Pages | **1:** `index.html` (one-page site). There are no other HTML files. |
| CSS | `css/styles.css` holds the base and desktop styles (≥1024 px). `css/responsive.css` holds tablet (768–1023) and mobile (<768). Google Fonts loads Titillium Web and Nunito. |
| JS | `js/main.js` (vanilla, one IIFE). |
| Languages | **English only.** `<html lang="en" translate="no">`. There is no ES version and no language selector. |
| Desktop rendering | A fixed 1244 px canvas, `transform: scale(vw/1244)` (0.25–1.35). The hero is counter-scaled to fill the viewport. Below 1024 px the layout is fluid. |
| Header | `<header class="hero">` contains the logo, the `<h1>` tagline in a speech bubble, and `<nav aria-label="Main">` with 4 in-page links. **It is not sticky** and scrolls away. |
| Mobile menu | None. The nav is always visible. |
| Sections | Skip link → header → **main** (Expertise `#services`, Methodology `#methodology`, Our Brand Evolution `#brand-evolution` + video, Contact `#contact`) → footer. |
| Intro/gate, carousel, modals | None. |
| Video | "Our Brand Evolution". It is lazy-loaded and autoplays **muted and looped** once 50 % visible, and pauses off-screen. It does not autoplay under `prefers-reduced-motion`. The overlay has a Play/Pause button and a "Sound off/on" toggle. |
| Animations | Scroll-drawn colour line ("worm"), nav bars joining on scroll, Methodology reveal on scroll, hero bubble and typing effect, Expertise cards expanding on hover (desktop) or tap (touch), feature icons animating on hover or tap, and the Send ring animation. |
| Form | Sends to Web3Forms by `fetch` (unchanged). The fields are `name`, `email`, `phone`, `company`, `service` (hidden, built from **checkbox chips**, not a `<select>`), `service_other`, `message`, and the `botcheck` honeypot. |

---

## 1. Changed files (this audit)

Counts are relative to the working tree before Phase 2; the existing uncommitted edits are untouched.

| File | Lines | What changed |
|---|---|---|
| `index.html` | +46 / −35 | Skip link. `<main id="main-content">` wrapper. Each card gets a `<button>` inside its `<h3>` and `id`s on the panels; the `<article>` loses `tabindex`. Step labels become `<h3>` and footer titles `<h2>`. `aria-hidden` on the decorative SVGs. `lang="es"` on the address. Sound button loses `aria-pressed`. Form: SR-only `<label for>`s, `id`s, `autocomplete`, `required`, SR-only legend text, Other hint with `aria-controls`, `aria-hidden` on the honeypot, `type="submit"`, and the status line is always present. |
| `css/styles.css` | +77 / −3 | The allowed additions (`.sr-only`, `.skip-link`, the `:where()` focus-visible rule, the `[tabindex="-1"]` reset, the reduced-motion block), the `.ex-toggle` reset with an ink ring on the card, and `.send` ring colour. Rendering-neutral hooks: `.footer-head{font-size:inherit}`, `.send[aria-disabled]` added to the existing disabled rule, `.video-sound.is-on` (was `[aria-pressed]`), and `.form-status:empty{display:none}` removed (replaced by `.sr-only`). |
| `js/main.js` | +81 / −23 | Card `aria-expanded`/`aria-hidden`/`inert` sync and Escape. Delayed status announcements and SR-only messages. `aria-invalid` + `aria-describedby` handling. Submit handler with `aria-disabled`. h1 SR-only text node. Sound class toggle. Anchor focus. Reduced-motion scroll. |
| `css/responsive.css` | — | Not modified. |
| `ACCESSIBILITY_AUDIT.md` | new | This report. |

Web3Forms is unchanged: same endpoint, `access_key`, hidden fields, field names and `fetch` call. Class names, IDs used by CSS/JS, and the order of visible markup are preserved.

---

## 2. Findings — final status

### 2a. Fixed

| ID | Page/File | WCAG SC | Gary § | Severity | Issue | Fix applied | Status |
|---|---|---|---|---|---|---|---|
| A-01 | index.html | 1.3.1, 2.4.1 | §22 | Critical | No `<main>` landmark. | Added `<main id="main-content">` around the sections between the header and footer. Header and footer were not moved, and `display:contents` is not used. Pre-check found no selector or logic that depends on DOM depth; `meth.offsetTop` and its offsetParent (`.page`) are unchanged. | **Fixed** |
| A-02 | index.html, styles.css | 2.4.1 | §21 | Critical | No skip link. | "Skip to main content" is the first focusable element. It is visually hidden until focused, and moves focus to `<main>`. | **Fixed** |
| A-03 | index.html, styles.css, main.js | 2.4.7, 4.1.2, 1.3.1 | §12, §7, §25 | Critical | Cards were `<article tabindex="0">` with no focus indicator, name or state. | `<button type="button" aria-expanded aria-controls>` inside each `<h3>`, reset with `all: unset` (renders identically). `tabindex` removed from the article. The panel gets `aria-hidden="true"` + `inert` when collapsed and has both removed when expanded. It stays in sync for keyboard, hover (desktop) and tap (touch). The focus ring is on the card. See the deviation in §3. | **Fixed** |
| A-04 | styles.css | 2.4.7 | §12 | High | Fields had `outline:none` and no real replacement. | `:where(...):focus-visible{outline:3px solid currentColor;outline-offset:3px}`, which gives white on ink (15.96:1). `.send` uses a white ring. Existing focus styles (nav pill, chips, video buttons) still win. | **Fixed** |
| A-05 | main.js | 1.3.1, 4.1.2 | §3 | High | The h1 was announced as "Making globalcommunication easy". | The `aria-label` is removed. The full text goes in a separate SR-only text node ("Making global communication easy"), and the animated letters stay `aria-hidden`. Rendering is identical. | **Fixed** |
| A-06 | index.html, styles.css, main.js | 4.1.3 | §29 | High | The status line was `display:none` when empty, and success was never announced. | `#formStatus role="status"` is always in the DOM and uses `.sr-only` when empty or SR-only. The text is cleared and then set after 150 ms, so repeats are re-announced. It announces "Sending…" and "Thank you, your message has been sent." (SR-only), and the visible error messages. The button uses `aria-disabled` instead of `disabled`, so focus stays on Send. | **Fixed** |
| A-07 | index.html | 1.3.1, 3.3.2, 2.5.3 | §29 | High | No `<label>` elements. | SR-only `<label for>` per field, with the same text as the placeholder. The `aria-label`s are removed. The "Which service?" label is hidden together with its field. | **Fixed** (visible labels → D-02) |
| A-08 | index.html | 3.3.2 | §29 | High | Required fields were not exposed. | `required` on name, e-mail and message (`novalidate` is kept). The legend gets the SR-only text "(required, choose at least one)". `service_other` is required only when Other is checked. | **Fixed** (visible marker → D-02) |
| A-09 | main.js | 3.3.1, 3.3.3 | §29, §5 | High | Errors were not linked to fields. | Invalid fields and checkboxes get `aria-invalid="true"` + `aria-describedby="formStatus"`, both cleared when the field is edited. Focus moves to the first invalid field. | **Fixed** (per-field visible text → D-02) |
| A-10 | main.js | 2.4.3 | §11, §13 | Medium | Anchor links only scrolled. | The target gets `tabindex="-1"` and `focus({preventScroll:true})`. It works for the nav, the skip link and a URL hash on load. There is no ring on the sections. | **Fixed** |
| A-11 | index.html | 1.3.5 | §29 | Medium | No `autocomplete`. | `name`, `email`, `tel`, `organization`. | **Fixed** |
| A-12 | styles.css, main.js | 2.3.3, 2.2.2 | §24 | Medium | Reduced motion was only partly honoured. | Under `prefers-reduced-motion`, transitions and animations are instant, `scroll-behavior` is auto, and JS scrolling is instant. End states are pixel-identical to normal mode. The video does not autoplay (verified: paused, poster shown). | **Fixed** (worm → D-11) |
| A-13 | main.js | 1.4.13 | §23 | Medium | Hover-revealed card content couldn't be dismissed. | Escape closes the open card, whether opened by hover or keyboard, and returns focus to its button. | **Fixed** |
| A-14 | index.html | 1.3.1, 2.4.6 | §3 | Medium | Step titles were `<div>`s. | `<h3 class="step-label">`, which renders identically. | **Fixed** |
| A-15 | index.html, styles.css | 1.3.1 | §3 | Medium | Footer titles were `<div>`s. | `<h2 class="footer-head">` + `font-size:inherit`, which renders identically. | **Fixed** |
| A-16 | index.html | 1.1.1 | §16 | Low | Decorative feature SVGs were exposed. | `aria-hidden="true" focusable="false"`. | **Fixed** |
| A-17 | index.html, main.js, styles.css | 4.1.2 | §25 | Low | The sound toggle conveyed its state twice (text + `aria-pressed`). | `aria-pressed` removed. The visible text "Sound off"/"Sound on" conveys the state, and the CSS hook is now `.is-on`. | **Fixed** |
| A-18 | index.html | 3.1.2 | §28 | Low | Spanish address fragment. | `<span lang="es">Nazaret 2887, Piso 3 oficina 22</span>`. | **Fixed** |
| A-19 | index.html, main.js | 4.1.2, 2.1.1 | §7 | Low | Send was not a real submit. | `type="submit"` with a form `submit` handler and `preventDefault()`; the fetch is unchanged. Enter in a field now submits and runs validation. | **Fixed** |
| A-20 | index.html | 4.1.2 | §29 | Low | The Other → field relationship wasn't exposed. | `aria-controls="serviceOther"` + SR-only description "Shows a field to specify the service." The field and its label are `hidden` (out of AT and focus) until Other is checked. When checked, the field is the next Tab stop. | **Fixed** |
| A-21 | index.html | 4.1.2 | §29 | Low | Honeypot. | Added `aria-hidden="true"`. It already had `display:none`, `tabindex="-1"` and `autocomplete="off"`. | **Fixed** |

**Not applied (decided):** `aria-current` in the nav. The nav is not persistent and has no visible current state (agreed with the client).

---

## 3. Deviations from the brief

- **Focus ring colour on Expertise cards (A-03):** it uses `--ink` (#22221E) instead of `currentColor`. The ring is drawn **outside** the card (3 px, offset 3 px). It was measured against the pixels actually behind it, sampled from screenshots:
  - 1280 px: the background is white or the green colour line → **minimum 9.03:1**.
  - 375 px: the background is white → **15.96:1**.
  - Against any brand colour the colour line might cross: ink vs teal 3.87, magenta 3.50, orange 8.42, green 9.03. All are ≥3:1.
  - `currentColor` (white) would fail on the white page (1:1).
- **Send button ring:** `outline-color:#fff` (15.96:1 on ink), because its `currentColor` is ink on an ink background.
- **Status line:** per your instructions, one element (`#formStatus`, `role="status"`) is used for everything. "Sending…" and success are SR-only for now, so D-04 stays open.
- **Video under reduced motion:** this was already implemented (`userPaused` starts true). Verified: it is paused, has never played, and Chromium shows the poster.

---

## 4. Pixel-compare results

Baseline and after captures were made in headless Edge with the random typing delay pinned and video playback stubbed, so frames are deterministic. Two baseline runs differed by 0 px.

| Test | Widths | Captures | Result |
|---|---|---|---|
| Page at top + every 700 px scroll step (covers the colour line at each step) | 375 / 768 / 1280 / 1440 | 32 viewport shots | **0 px difference** |
| Colour line `stroke-dashoffset` of every path, step `is-on` states, nav-bar heights, `#methodology.offsetTop`/offsetParent, page height — at every scroll step | same | 32 states | **Identical** (line draws at the same scroll positions) |
| `<main>` wrapper alone (checked before the other edits) | same | 32 | **0 px** |
| Card open (hover on desktop, tap on touch) | same | 4 | 3 identical. 1280 px: ±1 colour-level differences in the card shadow, while the original build differs from itself by ±2 between runs → rendering noise |
| Form error state, Other field shown, Sound on | same | 12 | 11 identical. 1440 error state: differences identical in size to the original's own run-to-run noise (3071 vs 3074 px) |
| Reduced motion: top of page | same | 4 | **0 px** |
| Reduced motion: Methodology, fully settled | same | 4 | **0 bytes** (at 1.6 s the old build was still mid-animation; the new one is already at its end state, as intended) |

Not applicable: an open mobile menu (none exists) and a sticky header (none exists). Focus states are not part of the comparison because they are the allowed additions (skip link, focus rings).

---

## 5. Verification (re-check of each fixed item)

| Check | Result |
|---|---|
| Landmarks | `banner` (header) → `navigation "Main"` → `main#main-content` → `contentinfo` (footer). Only the skip link is outside them. |
| Headings | H1 "Making global communication easy". H2 Expertise > H3 ×4 cards + H3 ×3 features. H2 Methodology > H3 Explore / Design / Produce / Deliver & Improve. H2 Our Brand Evolution. H2 Contact us. H2 Our offices / Contact us at / Our Quality Policy. No skipped levels. |
| Card disclosure | The CDP tree shows heading L3 > button "e-Learning & Video" `expanded=false`. The collapsed panel is `ignored` (out of the tree) and `inert`. Enter/Space toggles, Escape closes and keeps focus on the button. Desktop hover opens and syncs the state; a mouse click on a hovered card does not close it (previous behaviour kept). Mobile tap toggles. |
| Skip link | First Tab stop, 177×40 px at the top left. Enter moves focus to `MAIN#main-content`; the next Tab reaches the first card button. |
| Nav anchors | "Methodology" + Enter moves focus to `SECTION#methodology` (no ring), and the next Tab goes to the next control after the section. |
| Form, empty submit | Focus moves to Name. Name, E-mail, the 5 checkboxes and Message get `aria-invalid="true"` + `aria-describedby="formStatus"`. The status text is visible and announced, and a repeat submit re-announces it (mutation log: text → "" → text). |
| Form, editing | Typing clears `aria-invalid`/`describedby` on that field. Checking a chip clears all the chips. |
| Other | The checkbox reveals the field and its label (`required`). The next Tab lands on the field. Unchecking hides both. |
| Mocked success | Status sequence: "Sending…" [sr-only] → "Thank you, your message has been sent." [sr-only]. During the send: `aria-disabled="true"` and focus stays on Send. Afterwards: the form resets and focus stays on Send. |
| Mocked failure (server message / network error) | "Sending…" [sr-only] → server message or "We couldn't send your message…" [visible]. `aria-disabled` is removed and focus stays on Send. |
| Enter in a text field | Submits and runs validation. |
| `autocomplete` | name, email, tel, organization. botcheck=off. |
| Focus rings (computed) | Skip link and footer link: 3 px ink. Fields and textarea: 3 px white. Send: 3 px white. Cards: 3 px ink on the card. Nav, chips and video buttons: unchanged custom styles. |
| Reduced motion | `scroll-behavior:auto`. Video paused, poster shown. Transitions are instant. |
| Sound toggle | "Sound on", class `is-on`, ink background, no `aria-pressed`. |
| Validity | No duplicate IDs. Every `aria-controls`/`aria-describedby`/`for` points to an existing ID. No positive tabindex. `main.js` passes `node --check`. Line endings stay CRLF. |

---

## 6. Tab order and expected NVDA announcements (index.html)

The order is the same at 1280 and 375 px. NVDA wording is derived from the verified accessibility tree (NVDA 2024+, Chrome/Edge, focus mode on Tab).

| # | Element | Expected NVDA announcement |
|---|---|---|
| 1 | Skip link (appears at top left) | "Skip to main content, link" (NVDA 2023.1+: "same page link") |
| 2–5 | Nav: Services, Methodology, Our Brand Evolution, Contact Us | First item: "banner landmark, Main navigation landmark, list with 4 items, Services, link". Then "Methodology, link"… |
| 6–9 | Expertise card buttons | First: "main landmark, Expertise, heading level 2… e-Learning & Video, button, collapsed". Enter: "expanded". Escape: "collapsed". |
| 10 | Video Play | "Our Brand Evolution… Play video, button". When activated: "Pause video, button" |
| 11 | Sound | "Sound off, button". Activated: "Sound on, button" |
| 12 | Name | "Contact us… Name, edit, required, blank" |
| 13 | E-mail | "E-mail, edit, required, blank" |
| 14 | Phone | "Phone, edit, blank" |
| 15 | Company | "Company, edit, blank" |
| 16–20 | Service checkboxes | First: "I'm interested in: (required, choose at least one), grouping, e-Learning & Video, check box, not checked". The last: "Other, check box, not checked, Shows a field to specify the service." |
| (20a) | Which service? (only when Other is checked) | "Which service?, edit, required, blank" |
| 21 | Message | "Message, edit, multi line, required, blank" |
| 22 | Send | "Send, button" |
| 23 | Footer e-mail | "content info landmark… hello@thetypesetter.com.ar, link" |

**Errors:** focus lands on the first invalid field: "Name, edit, required, invalid entry, Please fill in your name, a valid e-mail, a service and a message." The status line also speaks the message once (polite).
**Sending/Success:** "Sending…" and then "Thank you, your message has been sent." Focus stays on Send.
**Failure:** "We couldn't send your message. Please try again or email us directly." (or the Web3Forms message).
**Headings list (NVDA+F7):** see §5 "Headings". **Landmarks list:** banner, navigation Main, main, content info.
**Browse mode:** collapsed card details are skipped until expanded. Methodology text, features and the footer are always readable, including content not yet revealed by scrolling.

---

## 7. Requires design/content decision — for the consultant, grouped by Gary §

Not applied: each of these needs a visual or copy change.

### §4 — Text contrast (1.4.3)
- **[High] D-01 — White or brand-coloured text below 4.5:1 (or 3:1 for large text).**
  - White on the orange (1.90) and green (1.77) Expertise cards fails for both title and body text. White on teal fails for 15 px body text (4.13).
  - Feature titles in green or orange on white fail (1.77 / 1.90).
  - Methodology step labels in green or orange fail, and step numbers in white on green or orange fail.
  - Nav labels on hover/focus fail: white on green, orange and teal.
  - The checked "Brand & Marketing" chip fails (white on teal, 4.13).
  - Proposal: use ink text on green/orange (8.4–9.0:1), darken teal for white text, and add darker "text" variants of green and orange. Full ratios are in §8.

### §5 / §29 — Colour-only information and forms (1.4.1, 3.3.1, 3.3.2)
- **[High] D-02 — Form labels, required marker, error text.**
  - Placeholders are the only visible labels.
  - There is no visible required marker.
  - Invalid fields are shown only by an orange border, with one generic message.
  - Proposal: persistent visible labels, a "* required" convention, and a per-field visible error text (e.g. "Enter a valid e-mail") with an icon or prefix.
  - **Full 3.3.1 compliance needs visible error text** (copy to be approved by the client).
- **[Medium] D-04 — Visible success/sending message.**
  - Success is currently visible only as "Sent" inside the button for about 4 s (screen readers do get "Thank you, your message has been sent.").
  - Proposal: show the same text in the visible status line (copy pending client approval).

### §6 / §12 — Non-text contrast and focus indicator (1.4.11, 2.4.7)
- **[High] D-03 — Indicators below 3:1.**
  - The nav focus/hover pill is the only nav focus indicator: green 1.77, orange 1.90 against white.
  - The card "+" icon on green/orange cards: 1.58 / 1.66.
  - The Play icon #C1C1C1 on the white poster: 1.80.
  - Proposal: a darker pill or an extra outline for nav focus, an ink "+" icon on light cards, and a darker Play icon.

### §10 — Target size (2.5.8)
- **[Low] D-10 — All targets pass the 24 px minimum.**
  - The footer e-mail link (20 px tall) passes via the spacing exception.
  - The recommended 44 px is not met: nav 36, fields 34–42, chips 37–43, Send 36–42, Sound 34.

### §11 / §17 / §23 — Hover-only content and truncation (2.1.1, 1.4.13)
- **[High] D-05 — Methodology text is truncated on desktop.**
  - The 5-line clip with a fade hides text in 3 of 4 steps (Explore, Produce, Deliver & Improve).
  - The full text appears only on **mouse hover**, so keyboard and touch users at desktop widths can't read it. Screen readers get the full text.
  - Proposal: remove the clip (let the boxes grow).

### §17 — Resize text (1.4.4)
- **[High] D-07 — Browser zoom is cancelled by the scaled desktop canvas.**
  - On a 1280 px screen, zoom at **110 % and 125 % does not enlarge text** (it stays at about 16.5 px), because the canvas scale drops as zoom rises.
  - From 150 % the tablet/mobile layout takes over (200 % gives 32 px text, and 320 px reflows with no horizontal scroll). Text-only zoom (Firefox) overflows the fixed canvas.
  - Proposal: drop or cap the canvas scaling. This is an architecture change and should be prioritised.

### §18 — Text spacing (1.4.12)
- **[Medium] D-06 — Fixed heights clip text when spacing is increased.**
  - With WCAG spacing on desktop, the open Expertise card clips about 110 px of text (fixed 298 px row).
  - Methodology texts clip further.
  - Feature text overflows its white card by up to 70 px (fixed 436 px height).
  - Mobile and tablet pass.
  - Proposal: use min-height or auto heights.

### §24 — Motion and media (2.2.2, 1.2.x, 2.3.3)
- **[Medium] D-08 — Video.**
  - It autoplays muted and loops for over 5 s.
  - Pausing works (the whole video is a labelled Play/Pause button), but **no visible pause control is shown while playing**.
  - The video has an audio track. If it contains speech or meaningful on-screen text, it needs captions (`<track kind="captions">`) and a short text alternative. **Content owner: please confirm.**
- **[Low] D-11 — Scroll-drawn colour line and nav-bar join still animate under reduced motion.**
  - They are scroll-linked (user-driven), so this is not an AA failure.
  - Proposal: under reduced motion, show the line fully drawn and the bars joined.

### §26 — Card affordance
- **[Low] D-13 — Feature boxes look interactive but aren't.**
  - They have `cursor:pointer` and a tap animation on touch, but no function.
  - Proposal: remove the pointer cursor.

### §28 — Language
- **[Low] D-12 — Browser translation is blocked for the whole page.**
  - `translate="no"` + `notranslate` block auto-translation, which hurts users who rely on it.
  - This is not an AA failure.
  - Proposal: restrict it to the brand name or logo.

---

## 8. Contrast table

Brand tokens: green `--g #ABD125`, magenta `--m #E51A54`, teal `--t #008A98`, orange `--o #FFAB00`, ink `--ink #22221E`. "Large" = ≥24 px, or ≥18.66 px bold.

| Element | FG | BG | Ratio | Req | Result |
|---|---|---|---|---|---|
| Body / feature / step text | #22221E | #FFFFFF | 15.96:1 | 4.5:1 | Pass |
| Hero h1 | #222222 | #FFFFFF | 15.91:1 | 4.5:1 | Pass |
| Nav label (default) | #22221E | #FFFFFF | 15.96:1 | 4.5:1 | Pass |
| Nav label hover/focus — Services | #FFFFFF | #ABD125 | 1.77:1 | 4.5:1 | **Fail** |
| Nav label hover/focus — Methodology | #FFFFFF | #E51A54 | 4.56:1 | 4.5:1 | Pass |
| Nav label hover/focus — Our Brand Evolution | #FFFFFF | #008A98 | 4.13:1 | 4.5:1 | **Fail** |
| Nav label hover/focus — Contact Us | #FFFFFF | #FFAB00 | 1.90:1 | 4.5:1 | **Fail** |
| Nav focus pill vs page — green / magenta / teal / orange | various | #FFFFFF | 1.77 / 4.56 / 4.13 / 1.90 | 3:1 | **Fail** / Pass / Pass / **Fail** |
| Card title (large) — orange / teal / green / magenta | #FFFFFF | various | 1.90 / 4.13 / 1.77 / 4.56 | 3:1 | **Fail** / Pass / **Fail** / Pass |
| Card sub/desc (15 px) — orange / teal / green / magenta | #FFFFFF | various | 1.90 / 4.13 / 1.77 / 4.56 | 4.5:1 | **Fail** / **Fail** / **Fail** / Pass |
| Card "+" icon (white 80 %) — orange / green / teal / magenta | blended | various | 1.66 / 1.58 / 3.20 / 3.31 | 3:1 | **Fail** / **Fail** / Pass / Pass |
| Feature title (large) — green / magenta / orange | various | #FFFFFF | 1.77 / 4.56 / 1.90 | 3:1 | **Fail** / Pass / **Fail** |
| Step label (large) — green / teal / magenta / orange | various | #FFFFFF | 1.77 / 4.13 / 4.56 / 1.90 | 3:1 | **Fail** / Pass / Pass / **Fail** |
| Step number white — green / teal / magenta / orange | #FFFFFF | various | 1.77 / 4.13 / 4.56 / 1.90 | 3:1 | **Fail** / Pass / Pass / **Fail** |
| Showcase titles / form text | #FFFFFF | #22221E | 15.96:1 | 4.5:1 | Pass |
| Placeholder / legend | #D9D9D4 | #22221E | 11.27:1 | 4.5:1 | Pass |
| Field & chip border | #E6E6E2 | #22221E | 12.76:1 | 3:1 | Pass |
| Field focus (old: border change only) | #FFFFFF | #E6E6E2 | 1.25:1 | 3:1 | Was fail → **fixed** (3 px white ring, 15.96:1) |
| Invalid border | #FFAB00 | #22221E | 8.42:1 | 3:1 | Pass (colour-only → D-02) |
| Chip text unchecked | #FFFFFF | #22221E | 15.96:1 | 4.5:1 | Pass |
| Chip checked — ink/orange, white/teal, ink/green, white/magenta, ink/white | — | — | 8.42 / 4.13 / 9.03 / 4.56 / 15.96 | 4.5:1 | Pass / **Fail** / Pass / Pass / Pass |
| Chip checked fill vs ink — orange / teal / green / magenta | — | #22221E | 8.42 / 3.87 / 9.03 / 3.50 | 3:1 | Pass |
| Chip focus outline | #FFFFFF | #22221E | 15.96:1 | 3:1 | Pass |
| Send button text / button vs bg | #22221E / #FFF | #FFF / #22221E | 15.96:1 | 4.5 / 3:1 | Pass |
| Send focus ring (new) | #FFFFFF | #22221E | 15.96:1 | 3:1 | Pass |
| Form status text | #FFFFFF | #22221E | 15.96:1 | 4.5:1 | Pass |
| Sound button / on state | #22221E / #FFF | #FFF / #22221E | 15.96:1 | 4.5:1 | Pass |
| Sound focus outline (teal on ink) | #008A98 | #22221E | 3.87:1 | 3:1 | Pass |
| Video Play focus outline (teal on poster) | #008A98 | #FFFFFF | 4.13:1 | 3:1 | Pass (over moving video: variable) |
| Play icon on poster | #C1C1C1 | #FFFFFF | 1.80:1 | 3:1 | **Fail** |
| Footer text / e-mail link | #22221E | #FFFFFF | 15.96:1 | 4.5:1 | Pass |
| Skip link text | #22221E | #FFFFFF | 15.96:1 | 4.5:1 | Pass |
| Skip link / footer link focus ring | #22221E | #FFFFFF | 15.96:1 | 3:1 | Pass |
| Card focus ring (ink) vs actual background outside card | #22221E | white / colour line | ≥ 9.03:1 measured (worst case vs magenta line 3.50) | 3:1 | Pass |

Decorative only (no requirement): feature icons, hero bands, stripes, colour line, footer bar, step-text fade mask.

---

## 9. Already passing (before this audit)

- `<html lang="en">`, and a descriptive, unique `<title>`.
- One `<h1>`. H2/H3 structure for sections, cards and features with no skipped levels.
- `<nav aria-label="Main">` uses `<ul><li><a href>`. Navigation uses `<a>` and actions use `<button>`. There are no clickable divs with real function.
- No positive `tabindex`, no keyboard traps and no single-key shortcuts. DOM order matches the visual order at all breakpoints.
- Custom focus styles on nav links, chips and video buttons.
- No sticky header, so focus is never obscured (2.4.11) and `scroll-padding-top` isn't needed.
- Reflow: no horizontal scroll at 320 px (400 %) or 640 px (200 %).
- Text spacing passes on mobile and tablet.
- Scroll-reveal content (Methodology) stays in the accessibility tree and is never focusable while invisible.
- Logos and certification alt texts match the images.
- The decorative worm, bubble and stripes are `aria-hidden`.
- The video autoplays muted (1.4.2 OK), and the Play/Pause name updates.
- Fieldset/legend on the service checkboxes, with real checkboxes and visible text names. Focus moves to the first invalid field. The honeypot is unreachable.
- No modals, tooltips, submenus or carousel. No duplicate IDs.
