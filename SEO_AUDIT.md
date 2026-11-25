# SEO + AI-search audit — The Typesetter

**Date:** 2026-11-25 · **Phase:** 1 (audit, read-only) · **Status:** waiting for OK before any edit.
No file in the site was modified. The only new file is this report (and a local test server / Lighthouse JSONs in the scratchpad, outside the repo).

> **Update 2026-11-25 — Phase 2 applied, Phase 3 verified locally.** Sections 0–8 below are the Phase 1 audit as written. Where they conflict with your decisions, **§9 onward wins** (canonical host is **www**, SEO-14 was retracted, fonts are self-hosted, etc.). Nothing is committed or deployed.
>
> **Read this first — the biggest finding is not a code issue.**
> The site in this repo is **not what is live**. Production serves an older *"Our website is under construction"* page (different files, `Last-Modified: 20 Oct 2026`), and staging serves a **2024 Bootstrap boilerplate** ("Welcome to The Typesetter"). So everything about the repo was audited on a local server, and everything about hosts/headers/redirects on the real servers. Phase 3 "before/after" will compare the repo build against the repo build, with the live page shown only as reference.

---

## 0. Step 0 — Map of the site

### 0.1 Repo files (`git ls-files` + working tree)

| File | Purpose | Weight |
|---|---|---|
| `index.html` | The only page (one-page site, 4 `<section>` + hero + footer) | 21,061 B |
| `css/styles.css`, `css/responsive.css` | All styles (render-blocking, un-minified, no hash) | 24,792 / 7,636 B |
| `js/main.js` | All behaviour: worm line, hero typing, cards, form (Web3Forms fetch), video, anchors | 35,421 B |
| `assets/img/logo-tts-color.png` | Hero logo (LCP) + footer logo, 985×881 | 30,760 B |
| `assets/img/tuv-certified.png` | Footer cert, 1434×725 (shown at 128 px wide) | 63,948 B |
| `assets/img/logo-great-place-to-work.png` | Footer, 88×161 | 8,666 B |
| `assets/img/favicon.png` | Only icon, 64×64 | 1,165 B |
| `assets/video/tts-intro-poster.jpg` | Video poster, 1920×1080 | 59,268 B |
| `assets/video/tts-intro-1080.mp4` / `.webm` / `-720.mp4` | "Our Brand Evolution" video | 4.42 MB / **4.65 MB** / 2.57 MB |
| `ACCESSIBILITY_AUDIT.md` | Previous audit | 28,759 B |
| `assets/img/Attachment (1).png` | **Untracked**, 518×308, referenced nowhere → must not be deployed | 3,859 B |

**Does not exist in the repo:** `robots.txt`, `sitemap.xml`, `.htaccess`, `llms.txt`, `404.html`, `favicon.ico`, apple-touch-icon, web manifest. No fonts are self-hosted (Google Fonts: Titillium Web + Nunito). No other HTML pages.

Page weight (repo build, Lighthouse): ~344 KB over 15 requests (11 first-party/Google-Fonts, 4 woff2 from `fonts.gstatic.com`). The 2.5–4.6 MB video is `preload="none"`, loaded only when ≥50 % visible.

### 0.2 Live servers (curl, 2026-11-25)

Server: `LTC-h3` (LatinCloud). Error pages have the Apache/LiteSpeed `iso-8859-1` look, so `.htaccess` is very likely honoured — **not confirmed** (see open questions).

| Request | Result |
|---|---|
| `http://thetypesetter.com.ar` | **308** → `https://thetypesetter.com.ar/` → 200 |
| `http://www.thetypesetter.com.ar` | **308** → `https://www.thetypesetter.com.ar/` → **200** (stays on www) |
| `https://thetypesetter.com.ar` | 200, 6,738 B |
| `https://www.thetypesetter.com.ar` | **200, same page** (no redirect to the other host) |
| `http://staging.thetypesetter.com.ar` | **200**, 22,879 B, 2024 boilerplate page, no redirect to HTTPS |
| `https://staging.thetypesetter.com.ar` | **TLS fails: self-signed cert `CN=invalid`** |

Production `https://thetypesetter.com.ar/` headers:

```
Content-Type: text/html; charset=utf-8     Content-Encoding: br (when asked)
Cache-Control: max-age=0                    Vary: Accept-Encoding
Content-Security-Policy: upgrade-insecure-requests
Alt-Svc: h3=":443"                          (HTTP/3 available)
No Strict-Transport-Security, no X-Content-Type-Options, no Referrer-Policy, no X-Robots-Tag
```
Static images on prod: `Cache-Control: max-age=2592000` (30 d, server default).
Staging headers: only `X-Content-Type-Options: nosniff`; **no X-Robots-Tag, no auth**.

`<meta name="robots">`: production (old page) = `index, follow`. Repo `index.html` = none. Staging (old page) = none.

Root files on production: `robots.txt` 404 · `sitemap.xml` 404 · `llms.txt` 404 · `favicon.ico` 404 · `manifest.webmanifest` 404 · random URL → 404 (correct status, unbranded Apache page, no soft-200).
Root files on staging: **`robots.txt` 200 = `User-agent: * / Disallow:` (allow everything)** · `favicon.ico` 200 · sitemap/llms 404.

---

## 1. Lighthouse baseline (3 runs, median)

Lighthouse mobile (simulated slow-4G, 4× CPU) and desktop preset, Edge headless. **Caveat:** the repo build was served by Python `http.server` (HTTP/1.0, no compression, no cache headers), so "cache/compression" insights and absolute LCP are pessimistic versus LatinCloud (which already serves brotli, h3). Use them as a relative baseline. Production rows measure the **old coming-soon page**, not the repo build. CrUX field data: not available to me (no API key; a site this new is probably below the CrUX threshold) — **not checked**.

| Target | Perf | A11y | Best Pr. | SEO | FCP | LCP | TBT | CLS | Requests / KB |
|---|---|---|---|---|---|---|---|---|---|
| Repo build · mobile | **88** | 100 | 100 | **91** | 2.0 s | **3.7 s** | 5 ms | 0 | 15 / 336 |
| Repo build · desktop | 98 | 100 | 100 | **91** | 0.59 s | 1.13 s | 0 ms | 0.001 | 15 / 336 |
| Prod (old page) · mobile | 91 | 100 | 100 | 100 | 1.7 s | 2.9 s | 160 ms | 0.01 | 12 / 2,683 |
| Prod (old page) · desktop | 98 | 100 | 100 | 100 | 0.59 s | 0.99 s | 22 ms | 0.002 | 12 / 2,624 |

INP can't be measured in lab; TBT is the proxy (excellent). The only SEO audit failing on the repo build is *"Document does not have a meta description"* (91 → 100 once added).
**LCP element (mobile):** `img.hero-logo` (`logo-tts-color.png`) — discoverable in HTML, not lazy, but no `fetchpriority="high"`, no `width/height`, and queued behind 3 render-blocking stylesheets (est. 380 ms).

Other Lighthouse items on the repo build: unsized images (3 footer imgs), unminified CSS (9 KiB) / JS (13 KiB), unused CSS (11 KiB), image delivery (PNG → ~146 KiB potential), main-thread work 2.3 s *(simulated)*.

---

## 2. Findings

Severity: Critical / High / Medium / Low / Info. Category: **FIX** = Will fix · **DECIDE** = Requires design/content/owner decision.

| ID | # | Where | Issue | Evidence | Sev. | Cat. | Proposed fix |
|---|---|---|---|---|---|---|---|
| SEO-01 | 2 | staging server | Staging is **indexable**: HTTP 200, no `X-Robots-Tag`, no auth, `robots.txt` allows all, HTTPS cert invalid | curl section 0.2 | **Critical** | FIX (+ owner action) | Staging-only `.htaccess`: `X-Robots-Tag: noindex, nofollow` + `robots.txt` `Disallow: /` (also basic auth if you want — DECIDE). Valid TLS cert on staging = hosting/owner action. Make sure the staging `.htaccess`/robots are **never** copied to production (separate files, I'll add a deploy note). |
| SEO-02 | 1 | prod host | Two live hosts with identical content: apex and `www` both 200 (duplicate content). Old page's canonical points to **www**; you described production as the **apex** | curl 0.2 | **High** | DECIDE → FIX | Confirm apex (`https://thetypesetter.com.ar`) as canonical. Then one rule: `http/https × apex/www` → `https://thetypesetter.com.ar/` in a single hop. |
| SEO-03 | 1 | prod | HTTP→HTTPS uses **308**, and `http://www` → `https://www` first (would be a 2-hop chain once www→apex exists) | curl 0.2 | Medium | FIX | Single-hop 301 rules, tested on staging first. (308 is equivalent for Google; 301 is what you asked for.) |
| SEO-04 | 5 | `index.html` | No meta description (Lighthouse SEO 91). Title exists (49 chars, brand + tagline, no service keyword) | LH `meta-description` | High | FIX after copy OK | Insert approved description (+ optionally title) — drafts in §3. |
| SEO-05 | 6 | `index.html` | No canonical, no `meta robots`, no `theme-color` | source | High | FIX | `<link rel="canonical" href="https://thetypesetter.com.ar/">` (host per SEO-02), same URL in og:url and sitemap. No copy involved. |
| SEO-06 | 3 | root | No `robots.txt` (404). Today every crawler is allowed by default (incl. AI trainers). Nothing blocks CSS/JS/img | curl | High | FIX (file) + DECIDE (AI policy) | Create `robots.txt` with `Sitemap:` line. Bot rules per §5 — **I will not block or allow any AI bot without your decision.** |
| SEO-07 | 4 | root | No `sitemap.xml` | curl | High | FIX | One canonical URL, `lastmod` = deploy date of this build (see Q5). |
| SEO-08 | 13 | `index.html` | No structured data | source | High | FIX | JSON-LD graph: `Organization` (+ `WebSite`, 4 `Service` nodes). Only values visible on page — sketch in §3.5. |
| SEO-09 | 14 | `index.html` | No Open Graph / Twitter tags. Only image available is the 1920×1080 video poster (16:9, not 1200×630, and is a video frame) | source | Medium | FIX tags / DECIDE image | Add og:type/site_name/url/locale/title/description + `twitter:card`. `og:image`: **design decision** (a purpose-made 1200×630). |
| SEO-10 | 10 | hero logo (LCP) | LCP 3.7 s mobile (lab). LCP image has no `fetchpriority`, no dimensions, 985×881 PNG shown ~156 px wide; 3 render-blocking CSS ahead of it | LH `lcp-discovery`, `render-blocking` | High | FIX | `fetchpriority="high"` + `width/height` on `.hero-logo`; `<link rel="preload" as="image" fetchpriority="high">`; optimise image (SEO-12). |
| SEO-11 | 9/10 | 4 `<img>` | No `width/height` on hero + footer logos/certs (CSS already sets width + `height:auto`, so adding attributes cannot change rendering) | LH `unsized-images` | Medium | FIX | Add intrinsic dimensions; `loading="lazy" decoding="async"` on the 3 footer images only. |
| SEO-12 | 9 | `assets/img/*.png` | PNGs oversized: `tuv-certified.png` 1434 px for 128 px display (64 KB); logo 985 px for ≤178 px display | LH `image-delivery` ~146 KiB | Medium | FIX (carefully) | Re-encode losslessly (WebP lossless / optimised PNG) with `<picture>` fallback; keep pixel-identical, verified by screenshot diff. Lossy only if you OK it. |
| SEO-13 | 10 | `<head>` | Render-blocking: Google Fonts CSS + `styles.css` + `responsive.css`; 2 third-party origins (`fonts.googleapis/gstatic`). `display=swap` already present | LH | Medium | DECIDE (optional) | Self-hosting fonts removes 2 third-party origins and ~380 ms blocking and allows preload, but adds font binaries and must prove zero visual shift. Not applied unless you approve. `rel=preconnect` already there. |
| SEO-14 | 9/11 | `index.html:179-181` | `<source media="(min-width:768px)">` inside `<video>` is **not honoured by browsers** (spec: only `<picture>`). If so, mobile gets the first playable source = the **4.65 MB 1080p webm**, not the 720p mp4. The webm is also *larger* than the mp4. Not LCP-critical (lazy, `preload=none`, poster present) but costs mobile data | spec; **to verify with a network log in Phase 2** | Medium | FIX after verifying | Choose source in the existing JS (`matchMedia`) or reorder; no visual change. Touching JS needs your OK — report as optional. |
| SEO-15 | 11 | server | `Cache-Control: max-age=0` on HTML (fine). CSS/JS unversioned → can't be `immutable`. Brotli and HTTP/3 already on | curl | Medium | FIX | Cache rules: images/video/fonts 1 y, CSS/JS 1 week with revalidation (no hashes). `Vary: Accept-Encoding` kept. |
| SEO-16 | 18 | server | No HSTS, `nosniff`, Referrer-Policy on prod | curl | Medium | FIX | HSTS (start `max-age=300`, **no `includeSubDomains`/`preload`** — staging has an invalid cert), `nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`. CSP → report-only draft in §5. Existing `upgrade-insecure-requests` kept. |
| SEO-17 | 17 | root | No branded 404 (Apache default; correct 404 status, no soft-200) | curl | Medium | FIX + DECIDE | `404.html` + `ErrorDocument 404`. Needs absolute asset paths; reuse header/footer structure. Copy = DRAFT §3.4. Design check: the hero's nav anchors (`#services`…) would need `/#services`; I'd keep the 404 minimal unless you want the full hero. |
| SEO-18 | 17 | `<head>` | Icon set incomplete: only `favicon.png` 64×64. No `favicon.ico`, no apple-touch-icon (180×180), no manifest, no theme-color. Old prod has `assets/img/apple-touch-icon.png` (HTTP 200) | curl | Medium | FIX links / DECIDE assets | Add `<link rel="icon" sizes>`, `apple-touch-icon`, `site.webmanifest`, `theme-color`. A sharp 180/192/512 px icon must come from a designed source; upscaling the 64 px file would look blurry. Old prod's apple-touch-icon may be reusable — please confirm. |
| SEO-19 | 7 | `<html translate="no">` + `<meta name="google" content="notranslate">` | Tells Chrome/Google not to offer translation. Not an indexing blocker, but for an international audience (translation company) it prevents browser translation | source | Medium | DECIDE | Report only: keep or remove is a business call. Not a11y-relevant (`lang="en"` stays). |
| SEO-20 | 15 | root | No `llms.txt` | curl | Medium | FIX after copy OK | DRAFT §3.3. |
| SEO-21 | 15 | NAP | **Old prod page** shows `clientsuccessteam@…` and two phones; the repo page shows only `hello@thetypesetter.com.ar` and no phones. After deploy the JSON-LD/Google may still carry old data | prod HTML vs `index.html:264` | Medium | DECIDE | Confirm `hello@` as the single contact; JSON-LD will use only what the repo page shows. Old data in Google Business Profile / directories = owner action. |
| SEO-22 | 8 | `index.html:42` | `<h1>` = "Making global communication easy" (brand only in logo alt `"the typesetter"`). Outline is otherwise logical: h1 → h2 Expertise/Methodology/Our Brand Evolution/Contact us → h3 cards; footer h2s | source | Low | Report only | Brand + services live in `<title>`/description/JSON-LD instead. Text can't change. |
| SEO-23 | 16 | page | The page has **no external profile links** (LinkedIn was on the old page only), so `sameAs` would be empty. mailto is the only link out; no `target=_blank` → no `rel` needed. External reachability: LinkedIn returns 403 to curl (bot-wall, not a real error) | source | Low | DECIDE | Whether to add a visible LinkedIn link = content/design decision. Until then JSON-LD has no `sameAs`. |
| SEO-24 | 12 | JS-dependent | **No-JS check (source analysis, not a browser run):** all headings, services, step text, form, footer/address/email are in the initial HTML ✔. H1 is plain text that JS then splits for the typing effect ✔. Caveat: `.step-text`/`.step-num` are `opacity:0` until JS adds `.is-on`, and `.ex-more` is collapsed — present for crawlers, invisible to a no-JS human | `styles.css:397,406,278` | Low | Report only | A `<noscript>` style would fix it but is outside the allowed change list. |
| SEO-25 | 10 | `main.js:~451` | Permanent `requestAnimationFrame` loop (also reads `scrollY` each frame; no scroll listener at all). TBT is only 5 ms so no CWV issue; it keeps the CPU awake while idle | source, LH TBT | Low | Report only | Possible later optimisation (pause when line isn't moving). Not touching JS logic now. |
| SEO-26 | 9 | repo | Untracked `assets/img/Attachment (1).png` unreferenced | `git status` | Low | Report | Don't deploy it. |
| SEO-27 | 17 | all | No console errors (LH `errors-in-console` clean), no mixed content, no broken internal anchors (`#services`, `#methodology`, `#brand-evolution`, `#contact`, `#main-content` all exist) | LH + source | Info | — | — |
| SEO-28 | 1/17 | deploy | Prod and staging do not run this repo. Deploying will replace the old page whose assets live at `assets/css/`, `assets/js/`, `assets/fonts/`, `logo-tts.png`… (still served) | curl | Info | — | Old files will stay as orphans unless removed; I'll list them at deploy time. |

**Accessibility conflicts:** none found so far. All proposed changes are head/attribute/server level. One to watch in Phase 2: the 404 page must carry skip link + landmarks + heading levels like the main page.

---

## 3. DRAFT copy for client approval (nothing inserted yet)

### 3.1 `<title>` (target 50–60 chars) — current: *The Typesetter — Making global communication easy* (49)
- **A (58):** `The Typesetter | Translation, Localization & Accessibility`
- **B (54):** `The Typesetter — Content Globalization & Accessibility`
- *Option 0:* keep the current title.

> Note for Candelaria: the brief says "translation, localization and accessibility", but the page itself lists **four** services (e-Learning & Video, Brand & Marketing, Digital Accessibility, Content Globalization). Titles A/B follow the brief; if the other two services matter for search, say so.

### 3.2 Meta description (140–160) + og/twitter text
- **A (153):** `The Typesetter is a team in Córdoba, Argentina providing translation, video localization, digital accessibility, e-learning and brand services worldwide.`
- **B (154):** `20 years of translation, localization and accessibility services for agencies and companies worldwide. ISO 9001 & ISO 17100 certified. Córdoba, Argentina.`
- og:title / twitter:title = chosen title; og:description / twitter:description = chosen description. `og:locale` = `en_US`, `og:type` = `website`, `og:site_name` = `The Typesetter`.
- **Claims to confirm:** "20 years" (appears only in the video transcript), "ISO 9001 & ISO 17100" (only in the cert image alt, "TÜV Rheinland Certified — ISO 9001:2015, ISO 17100:2015"), "agencies and companies" (not on the new page's copy; it was on the old prod description). Option A avoids all three claims.

### 3.3 `llms.txt` (DRAFT)
```
# The Typesetter

> The Typesetter is a company based in Córdoba, Argentina, with an office in Florida, USA. Tagline: "Making global communication easy."

## Services
- Content Globalization: Translation, Multilingual DTP, Video Localization, Subtitling, Voice-over, Dubbing.
- Digital Accessibility: Document Remediation, Large Print, Alt Text, Audio Description, Closed Captions.
- e-Learning & Video: e-Learning Courses, AI Capsules, Motion Graphics, Corporate Assets, Training Experiences.
- Brand & Marketing: Visual Identity, Websites, Landing Pages, Social Media Campaigns, Analytics.

## Quality
- Certifications shown on the website: ISO 9001:2015 and ISO 17100:2015 (TÜV Rheinland); Great Place To Work, Certified 2026 Argentina.

## Offices
- Córdoba, Argentina: Nazaret 2887, Piso 3, Oficina 22
- Florida, USA: 255 Aragon Avenue, 2nd Floor, Coral Gables, 33134

## Contact
- Email: hello@thetypesetter.com.ar
- Website: https://thetypesetter.com.ar/
```
(Every line is already on the page. Founding "20 years" left out until approved.)

### 3.4 404 page (DRAFT)
- Heading: `Page not found`
- Text: `The page you’re looking for doesn’t exist or has moved.`
- Link: `Back to the home page` → `/`

### 3.5 JSON-LD sketch (all values visible on page)
`Organization` (type `ProfessionalService` only if you want it to count as a local business): `name` The Typesetter · `url` https://thetypesetter.com.ar/ · `logo` `/assets/img/logo-tts-color.png` · `email` hello@thetypesetter.com.ar · two `PostalAddress` (Córdoba AR "Nazaret 2887, Piso 3, Oficina 22"; Coral Gables, Florida US, "255 Aragon Avenue, 2nd Floor", 33134) · `slogan` "Making global communication easy" · `makesOffer`/`Service` ×4 with the names and sub-lists shown on the cards. **Omitted on purpose:** `telephone` (not on page), `sameAs` (no visible profile link), ratings/reviews/prices/awards, `FAQPage` (no FAQ), `hasCredential` for ISO (only in an image alt — your call). `WebSite` node: name + url, no `SearchAction`.

### 3.6 Alt texts
Existing alts are accurate and stay (`the typesetter`, `TÜV Rheinland Certified — ISO 9001:2015, ISO 17100:2015`, `Great Place To Work — Certified 2026 Argentina`). The hero + footer logo share one alt — fine for a11y. No new alt proposed.

---

## 4. International / hreflang
Single English version, `<html lang="en">` correct, inline `lang="es"` on the Córdoba address stays. **No hreflang added.** When the Spanish version exists: separate URLs (`/es/`), reciprocal `hreflang` incl. `x-default`, per-language canonical, per-language sitemap entries, and remove `translate="no"` (SEO-19).

## 5. Owner-decision material (report only)

**robots.txt / AI crawler policy** — currently *no robots.txt*, so everything is allowed, including trainers. Suggested starting point (not applied):
| Bot | Purpose | Suggestion |
|---|---|---|
| Googlebot, Bingbot | search | Allow |
| OAI-SearchBot, ChatGPT-User, Claude-SearchBot, PerplexityBot | AI search / on-demand answers (this is what gets you cited) | Allow — needed for AI visibility |
| GPTBot, ClaudeBot, Google-Extended, CCBot | model training | Your call. Blocking costs little visibility; allowing helps being "known" by models. (Google-Extended only affects Gemini/Vertex training, not Search or AI Overviews.) |

**Security headers** — apply HSTS/nosniff/Referrer-Policy (SEO-16). **CSP — report only**, not applied. A starting point that I believe would not break Web3Forms or the video, to test in `Content-Security-Policy-Report-Only` first:
`default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; media-src 'self'; connect-src https://api.web3forms.com; form-action https://api.web3forms.com; base-uri 'self'; upgrade-insecure-requests` (`'unsafe-inline'` is needed for the many inline `style=` attributes).

## 6. Open questions for you
1. **Canonical host:** confirm apex `https://thetypesetter.com.ar` (www → apex).
2. **`.htaccess`:** I can't read the live one (403). Does one exist on prod/staging? Please send its contents (or let me know if it's LiteSpeed/Apache) so I back it up and merge instead of replace. I can only test redirect rules on staging, which currently has the 2024 site and a broken certificate — OK to test there over HTTP?
3. **Staging:** noindex header only, or also basic auth? Who fixes the TLS cert on staging?
4. **Title / description:** which options (§3.1–3.2), or keep current title?
5. **Sitemap `lastmod`:** date of the deploy of this build — OK?
6. **Icons / OG image:** do you have a 512×512 icon source and a 1200×630 share image? Otherwise they go to the Design list.
7. **Fonts self-hosting (SEO-13)** and **video source selection via JS (SEO-14):** apply, or skip?
8. **`translate="no"`:** keep?
9. **404:** minimal page or full hero header?
10. Is the repo build meant to replace production as-is? (SEO-28: old files will remain on the server.)

## 7. What I could not verify
No field/CrUX data; no real-device INP; throttling is Lighthouse's simulated 4G, not a 375 px/1440 px manual run; Search Console/Bing indexing state (including whether staging is already indexed) is unknown to me; `.htaccess` contents unknown; no-JS result is from source reading, not a rendered run.

## 8. Phase 2 safety plan (when you say OK)
Baseline screenshots at 375/768/1280/1440 (top, mid-scroll with line drawn, footer) before editing; pixel-compare after; stop and show diff if anything moves. Back up `.htaccess` before touching. Redirects tested with curl on staging first. No commit, no deploy, no analytics, no third-party additions, Web3Forms markup and `main.js` untouched unless you approve SEO-14.

---

# 9. Phase 2 + 3 — what was done

Canonical host everywhere: **`https://www.thetypesetter.com.ar/`** (canonical, og:url, og:image, twitter:image, sitemap, robots.txt, llms.txt, JSON-LD). Nothing committed or deployed. Web3Forms markup, `js/main.js`, header/footer structure and every accessibility attribute untouched.

## 9.1 Changed / new files

| File | Change |
|---|---|
| `index.html` | `<head>`: title, description, canonical, robots, theme-color, OG + Twitter, preload (hero logo, 2 fonts), JSON-LD; Google Fonts links + preconnects **removed**. Body: `width/height` + `fetchpriority="high"` on hero logo; `width/height` + `loading="lazy" decoding="async"` on the 3 footer images; brand video `preload="none"` → `"metadata"` |
| `css/styles.css` | + 7 self-hosted `@font-face` rules (`font-display: swap`, same as the Google URL); `.footer-logo` got `height:auto` (it was the only sized image without it; needed so the new `height` attribute doesn't stretch it — identical rendering) |
| `assets/fonts/` (new, 5 files, 88 KB) | `nunito-latin-var.woff2` (one variable file, declared for 300/800/900 like Google did), `titillium-web-{300,400,600,700}.woff2`. Latin subset only (covers é, ó, ’, —, …). Source: Google Fonts (SIL OFL) |
| `404.html` (new) | Minimal page: skip link, `<header>` logo, `<main>` h1 + text + link, **same footer markup/classes**; absolute asset paths; `noindex`; no hero/video/JS. Copy = **DRAFT** |
| `robots.txt`, `sitemap.xml`, `llms.txt` (new) | As specified in your point 11 |
| `htaccess.seo-block` (new) | `# BEGIN/END TYPESETTER SEO` block, to merge by hand. No `.htaccess` created |
| `htaccess.staging-block` (new) | `# BEGIN/END TYPESETTER STAGING LOCK`: `X-Robots-Tag: noindex, nofollow, noarchive` + basic auth (placeholder `AuthUserFile` path) |

## 9.2 Findings — final status

| ID | Status | Note |
|---|---|---|
| SEO-01 staging indexable | **Ready, not live** | `htaccess.staging-block`. Owner actions: valid certificate, check which folder the subdomain points to (serves an unrelated 2024 site), create the `.htpasswd` |
| SEO-02 / 03 host + redirects | **Ready, not live** | In `htaccess.seo-block`: apex → `https://www` in one 308; `http://www` → `https://www` in one 308. **Untested** — staging has the wrong site and broken TLS, so the rules must be tested right after merging (see checklist). Merge note: remove any existing http→https/www rules from the live file |
| SEO-04 / 05 title, description, canonical, robots, theme-color | **Done** | Title/description = Option A, **PROVISIONAL — pending client approval (Candelaria)** |
| SEO-06 / 07 robots.txt, sitemap | **Done** | Training bots allowed with a commented-out opt-out block = **pending client decision**. Sitemap `lastmod` 2026-11-25 (set to the real deploy date if different) |
| SEO-08 JSON-LD | **Done** | `ProfessionalService` + `WebSite`, parsed OK; every value found on the page (AR/US are the ISO codes for the visible "Argentina"/"USA"). No `sameAs` (no profile linked on the page), no phones, ratings, prices, awards, FAQ |
| SEO-09 OG/Twitter | **Done / design asset pending** | Tags point to `https://www.thetypesetter.com.ar/assets/og/og-image.jpg`, which **does not exist yet**, so previews have no image until it is uploaded. No `og:image:alt` (would be new copy) |
| SEO-10 / 11 LCP + image dimensions | **Done** | Hero logo: `width/height`, `fetchpriority=high`, `<link rel=preload as=image>`. LCP 3.64 s → 2.95 s (7-run median, simulated mobile) |
| SEO-12 image re-encode | **Done (commit 2)** | Lossless WebP (same pixel dimensions, decoded RGBA verified identical) for hero/footer logo, TÜV and Great Place To Work via `<picture>` with the PNG as fallback `<img>` (width/height/alt/classes unchanged); hero preload now `type="image/webp"`. 103 KB of PNG → 41 KB of WebP. No resizing. `404.html` uses the same markup. `.webp` MIME added to `htaccess.seo-block` |
| SEO-13 fonts | **Done** | Self-hosted; 2 third-party origins removed (15 → 12 requests, 0 third-party). Preloaded only `nunito` (hero/headings) and `titillium-web-400` (body). **Pixel-compare: 12/12 screenshots identical** (see 9.3) |
| SEO-14 video source order | **Retracted — no issue** | Your correction was right. Network log (Playwright, 375 px / 1440 px): Chromium and Firefox download `tts-intro-720.mp4` at 375 and `tts-intro-1080.webm` at 1440; WebKit reports the same `currentSrc` (its request log was empty, so only `currentSrc` is evidence there). Source order already is media-qualified first, fallback last. Only change: `preload="metadata"` (no effect before the JS sets `src`, no extra requests, reduced-motion logic untouched). Side note: the 1080 webm (4.65 MB) is *larger* than the 1080 mp4 (4.42 MB); re-encoding or dropping it is a possible later saving |
| SEO-15 / 16 cache + security headers | **Ready, not live** | In `htaccess.seo-block`. Fonts: 1 y + `immutable`. Hashed CSS/JS: 1 y + `immutable` (rule ready; files aren't hashed today). Current CSS/JS: 1 week + revalidate (**not** immutable: unhashed files would go stale after an edit). Images/video 30 d. HTML 5 min. HSTS `max-age=31536000` (no `includeSubDomains`, no `preload`). CSP **report-only** |
| SEO-17 404 | **Done (file) / ready (server)** | `404.html` + `ErrorDocument 404 /404.html`. Must return a real 404 — verify after merge. Lighthouse on the page: A11y 100, Best Practices 100 (SEO 58 only because it is deliberately `noindex`) |
| SEO-18 favicon set / manifest | **Design list** | **No vector logo/isotype exists in the repo** (only PNGs; the 64 px favicon would upscale blurry), so no set was generated. Existing `favicon.png` link kept. Specs in §9.5. Manifest deferred until the icons exist |
| SEO-19 `translate="no"` | Kept (your call) | |
| SEO-20 llms.txt | **Done — pending client approval** | Hold back from upload until approved. Added same-page links because Lighthouse's `llms-txt` audit flags files without links |
| SEO-21 NAP | Open | Old page's `clientsuccessteam@` + phones disappear on deploy; Google Business Profile / directories still need updating (owner) |
| SEO-22, 23, 24, 25, 26 | Report only | Unchanged from Phase 1. SEO-26: **do not upload** `assets/img/Attachment (1).png`, `ACCESSIBILITY_AUDIT.md`, `SEO_AUDIT.md`, `htaccess.*` |
| Critical-CSS inlining | **Not applied (reported)** | With the fonts self-hosted, the only render-blocking resources are the two same-origin stylesheets (32 KB). The page is a JS-scaled canvas; an extracted "above-the-fold subset" would be fragile and a pixel diff can't prove it for every state. Lighthouse still lists them (~300 ms simulated) |

## 9.3 Verification

**Pixel-compare** (Edge headless, 375/768/1280/1440 px × top, mid-scroll with the line drawn, footer; two baseline runs were identical to each other, so the method is deterministic): **0 differing pixels in all 12**. One real diff showed up mid-way: `.footer-logo` stretched because the new `height` attribute met a CSS rule without `height:auto`. It was caught by the document-height check (5,715 → 6,508 px), fixed in CSS and re-verified.

**Lighthouse (local build, simulated mobile slow-4G / desktop preset).** Before = original `index.html`, after = current. 3-run medians plus 4 extra runs each (7 total) because TBT turned out to be very noisy.

| Metric | Original (mobile, 7 runs) | Commit 1 (mobile, 7 runs) | **Final, commit 2 (mobile, 7 runs)** | Original → final (desktop, 3 runs) |
|---|---|---|---|---|
| SEO | 92 | 100 | **100** | 91 → **100** |
| Accessibility / Best Practices | 100 / 100 | 100 / 100 | **100 / 100** | 100 / 100 → 100 / 100 |
| Performance | 88 | 85 | **88** | 98 → **100** |
| LCP | 3.64 s | 2.95 s | **3.02 s** | 1.13 s → **0.69 s** |
| FCP | 2.00 s | 1.52 s | **1.64 s** | 0.59 s → **0.38 s** |
| TBT | 5 ms | 356 ms | **317 ms** | 0 → 0 ms |
| CLS | 0 | 0 | **0** | 0.001 → **0** |
| Requests / weight | 15 / 336 KB | 12 / 269 KB | **12 / 251 KB** | 15 / 336 KB → 12 / 251 KB |

Per-run mobile Performance/TBT (final): 88/317, 78/573, 91/227, 74/700, 91/242, 78/561, 91/180 — i.e. 74–91, noise dominated.

Honest reading (final): **SEO +8/+9, mobile LCP −0.6 s (desktop −0.45 s), FCP earlier, −3 requests, −85 KB, no third-party origins, CLS 0.** The mobile Performance *score* is back to the original 88 (median), not better: **mobile TBT stays higher in the lab than in the original build** (median 317 ms vs 5 ms; individual runs range 180–700 ms vs 1–268 ms). Lighthouse's simulated TBT depends on where the page's layout work lands relative to FCP, and run-to-run noise is large. Profiling (see §10) shows the biggest long task is the page's first forced layout, not `main.js` logic, which is why the two `main.js` changes (§10) did not move TBT. Desktop is clean (100 / TBT 0).

**Other checks**
- JSON-LD: parses; all values present in the page text.
- `sitemap.xml`: well-formed XML, one URL. `robots.txt` / `llms.txt` get `text/plain` only once the `.htaccess` block is live (the local Python server can't show it) — check after deploy.
- Accessibility essentials: Lighthouse A11y 100 on both pages; no landmark / skip-link / label / heading / aria / focus / reduced-motion code was touched (diff = `<head>` + image attributes + `preload` value).
- Not re-runnable until deploy: curl on host variants and staging (production and staging still serve the old pages).

## 9.4 Deploy checklist

1. **Lock staging first.** Create the htpasswd file outside the web root; put `htaccess.staging-block` into staging's `.htaccess` (staging only). `curl -I https://staging…` → expect `401` + `X-Robots-Tag: noindex, nofollow, noarchive`. Fix the certificate (AutoSSL/Let's Encrypt) and confirm the subdomain's document root.
2. **Upload order (production):** `assets/fonts/*`, `assets/img/*` (not `Attachment (1).png`), `assets/video/*`, `css/*`, `js/main.js`, `404.html`, `robots.txt`, `sitemap.xml`, `llms.txt` **(only after client OK)**, `index.html` last. Do **not** upload anything on the deploy-exclude list below.

   **Deploy-exclude list (stays in the repo, never goes to the server):**
   - `ACCESSIBILITY_AUDIT.md`, `SEO_AUDIT.md` (and any `*.md`)
   - `htaccess.seo-block`, `htaccess.staging-block` (their content is merged by hand into `.htaccess`)
   - `.git/`, `.gitignore`
   - `assets/img/Attachment (1).png` (untracked, unreferenced)
   - Any scratch/test files (e.g. `t_*.html`, `nf-*.png`, Lighthouse JSON)
3. **`.htaccess` merge:** back up the live file (`.htaccess.bak-YYYYMMDD`); paste `htaccess.seo-block` between its markers; delete any older http→https / www / HSTS / compression / cache rules that duplicate it. If anything returns 500, restore the backup (probably an unsupported directive: `ErrorDocument`, the `FilesMatch`/`ForceType` and `Require` lines are not wrapped in `IfModule`).
4. **Curl checks on production** (each variant should reach the target in one hop):
   - `http://thetypesetter.com.ar/`, `https://thetypesetter.com.ar/`, `http://www.…`, `https://www.…` → final `https://www.thetypesetter.com.ar/`, at most 1 redirect, status `308`, then `200`.
   - Headers on `https://www…/`: no `X-Robots-Tag`; present `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `Content-Security-Policy-Report-Only`, `Cache-Control: max-age=300`, `Content-Encoding: br`.
   - `/robots.txt` and `/llms.txt` → `text/plain; charset=utf-8`; `/sitemap.xml` → 200 XML; `/nonexistent` → **404** with the branded page (not 200); `/SEO_AUDIT.md` → 403/404; a `.woff2` → `immutable`.
   - DevTools console: no relevant CSP report-only violations; the contact form still submits.
5. **Search engines:** verify the **www** property in Google Search Console and Bing Webmaster Tools (domain property if possible), submit `https://www.thetypesetter.com.ar/sitemap.xml`, request indexing of the home page, and check in Search Console that staging isn't indexed.
6. Re-run Lighthouse on production and compare with §9.3; test the JSON-LD in Google's Rich Results Test / Schema validator.

## 9.5 Requires design / content / owner decision (final list)

**Client (Candelaria)**
- Approve **title + meta description (Option A, provisional)**, or Option B / the old title.
- Approve `llms.txt` and the 404 copy ("Page not found / The page you’re looking for doesn’t exist or has moved. / Back to the home page").
- Decide whether **training bots** (GPTBot, ClaudeBot, Google-Extended, CCBot) stay allowed (default) or the commented block in `robots.txt` gets activated.
- Confirm `hello@thetypesetter.com.ar` as the single public contact; decide whether to show a LinkedIn link (it would also enable `sameAs`).

**Design (you)**
- `assets/og/og-image.jpg` — **1200×630 px**, JPG, under ~300 KB, key content inside the central ~1000×500 safe zone, no tiny text. Without it, shared links show no image.
- Icon source (vector logo/isotype, SVG) to generate: `favicon.svg`, `favicon.ico` (32 px), `apple-touch-icon.png` (180×180, opaque background), `icon-192.png`, `icon-512.png` (+ maskable 512 if wanted) and `site.webmanifest`. (Old production already has an `apple-touch-icon.png`, reusable only if it is the current brand.)
- Optional: resized (@2x) logo/cert PNGs for real image savings; a smaller video encode.

**Owner actions**
- Install a valid certificate on staging (AutoSSL/Let's Encrypt), check its document root, create the basic-auth credentials.
- Merge `htaccess.seo-block` into the live `.htaccess` (send me the live file if you want me to produce the merged version).
- Google Search Console + Bing Webmaster verification and sitemap submission; Google Business Profile; directory listings; update old NAP (phones / `clientsuccessteam@`) wherever it was published.
- Later: `includeSubDomains` / `preload` for HSTS once staging has a valid certificate; enforce the CSP after the report-only period; treat the `js/main.js` start-up cost (TBT) as a separate task; the future Spanish version (see §4).

---

# 10. Commit 2 — `main.js` start-up (A + B), WebP images

**`js/main.js` (8 lines):**
- **A:** `window load` and `document.fonts.ready` now call the existing rAF-coalesced `queueRefresh()` instead of `refresh()` directly (`markClippedSteps` runs in the following rAF; the deep-link `scrollToHash` still runs after the refresh).
- **B:** in `fluidMeasure()`, the `getBoundingClientRect` reads of the nav items now happen before `renderWorm()` / `updateSteps()` write to the DOM.
- Not applied (your decision): C (`innerText` precompute), D (gating the `tick` loop), `content-visibility`.

**Verification (all against the commit-1 build):** 12/12 screenshots at 375/768/1280/1440 px — 0 differing pixels; document heights 5,306 / 4,592 / 5,715 px (412 / 768 / 1440 wide) unchanged; **line animation frame by frame**: 100 consecutive rAF frames after instant jumps to mid-page, end, back to top and a second mid point, at 412, 768 and 1440 px, recording every line segment's `stroke-dashoffset`, nav-bar heights, step `.is-on` state and nav class → **0 of 1,200 frames differ** (the baseline itself was re-run first and is deterministic); deep links `/#services`, `#methodology`, `#brand-evolution`, `#contact` land at identical scroll positions and focus at 412 and 1440 px.

**Result:** no measurable TBT change (see §9.3). The gain is a small amount of avoided duplicate work, not a user-visible difference.

**Not done:** the request to apply a standalone `.htaccess` — I don't have that earlier message (the last instruction I received said not to create or overwrite `.htaccess` in the repo and that you'd send the live file). No `.htaccess` was created; `htaccess.seo-block` is unchanged apart from the `.webp` MIME line. If you want a standalone file with `<IfModule>` wrappers (uploaded last, deleted if the site returns 500), tell me and I'll generate it as a separate, clearly-named file.
