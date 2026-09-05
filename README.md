# ADUroi marketing landing

Decision-first cream / forest / mint marketing redesign. **Local candidate only. Not committed, published, or a declaration that the revamped app is live.**

## Build and verify

Requires Node 22+ and Python 3 (standard libraries only). There are no npm runtime or development dependencies.

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm test
CONTEXT=deploy-preview npm run build:preview
npm run serve # loopback http://127.0.0.1:4178
```

The output is `public/`. Default and preview builds emit **noindex meta, X-Robots-Tag in Netlify `_headers`, and robots.txt Disallow: /**. An explicit production build is only for an approved future release:

```sh
CONTEXT=production npm run build:production
```

`--production` is rejected in any non-production `CONTEXT`. A plain build remains noindex even when `CONTEXT=production`; no provider default enables indexing accidentally. The sitemap lists only the canonical homepage. The 404 is always noindex and is not in the sitemap. No SPA catch-all rewrite masks missing resources. The local server intentionally sends noindex regardless of artifact mode; provider `_headers` must be verified on a real draft preview before release.

## Source

- `src/index.html`: complete prerendered page, semantic landmarks, copy and native FAQ disclosures.
- `src/site.css`: responsive Inter/cream/forest/mint design matching the staged app tokens.
- `src/site.js`: progressive enhancement for the three goal perspectives; no fetch, storage, analytics or user data.
- `src/sample.json`: synthetic monthly comparison assumptions; tests verify reconciliation and rendered numbers.
- `site-config.js`: canonical brand metadata and existing app root.
- `scripts/build.mjs`: static build, SEO metadata, Open Graph, JSON-LD, robots, sitemap, security headers, 404.
- `static/`: real social PNG, favicon and locally hosted Inter v4.1 (SIL Open Font License included).
- `tests/landing.test.py`: generated HTML contracts for content, links, sample, accessibility structure, pricing/launch boundaries and SEO modes.

All three goal controls work as ordinary keyboard buttons, announce the selected perspective, and leave app destinations unchanged. With JavaScript disabled all substantive content and FAQs remain available, with an explicit perspective fallback. Native details/summary provide keyboard FAQ behavior. No app routes, backend attribution, customer fixtures, newsletter forms, payments or data collection are added.

## Why a bounded static build instead of Gatsby 2

The starting tree `d5f4b0b21165a63e0079c438efe047f9b5561410` is a 2019 Gatsby starter with unrelated template URLs, iOS assets and analytics configuration. `npm ci --ignore-scripts --no-audit --no-fund --dry-run` failed with EUSAGE: the lockfile was out of sync (including missing styled-components, Netlify and analytics plugins). The old pipeline also contains legacy Sharp/native-image processing and an offline service worker, unnecessary for this page. Repairing the legacy dependency graph would be a separate migration, not a bounded marketing implementation.

The authorized static fallback eliminates the broken dependency graph rather than performing an unreviewed major Gatsby upgrade. It preserves Netlify's ordinary `public/` static output and the canonical homepage. Superseded Gatsby entry points/configuration, template assets, and the stale Yarn lock are removed; all remain in Git history. No hosting linkage or build settings were changed. There are no third-party runtime requests, CDN scripts, or fonts.

## Source / live host mapping

Remote: `https://github.com/granto/ADU-automatic-gatsbyjs-app-landing-page.git`.

Live `https://aduroi.com/` serves a Bootstrap HTML site, not this baseline Gatsby starter (different markup/assets and copy). Public readback showed Netlify response headers, existing CTA destination `https://app.aduroi.com/`, blog `https://blog.aduroi.com/`, and contact `contact@aduroi.com`. Root robots.txt and sitemap.xml returned 404 before this work.

Parent's authenticated discovery: Netlify `aduroi`, site ID `6259e7a1-cbfd-49a9-9df1-e5e0d0d1a816`, maps aduroi.com; published deploy `5f8a2d8f83cc5793c51c8495` has no commit_ref and empty build_settings. Dashboard links this repository. **Do not assume a Git push deploys this site or that the old Git tree matches production.** Parent owns any external draft preview after review. Production source ownership / rollback must be confirmed before a real release.

## Claims and links

Prices reflect the current publicly advertised **$19 / $200 / $350 monthly** plans, not a verified billing-system offer. Redesign price, trial, plan limits, branding, PDFs, saved revisions and cost-estimate allowance remain explicitly pending. There are no fake testimonials, offers schema, aggregate ratings or new-flow CTAs. All app links go to the verified existing root, labelled current app or sign in. The sample clearly states it is synthetic, forthcoming, and not a forecast.

Founder story: `https://blog.aduroi.com/blog/why-build-an-adu/` (original 2020 account). Its historical legal/financing claims are not repeated as current guidance. Public app privacy/terms URLs were not verified; the footer transparently explains the boundary and directs people to the verified contact address instead of inventing legal pages.

## Remaining release gates

1. Parent's independent exact-tree code/content review and local/hosted responsive browser + keyboard/a11y acceptance (worker was instructed not to add browser tabs while 19 shared tabs existed).
2. Publish a **draft only**, verify noindex meta + response header, real social image/font MIME types, mobile/desktop layout, no console/CSP errors, correct 404 status and every external destination. Do not assume `_headers` proves the deployed HTTP behavior.
3. Confirm billing prices/terms, current app privacy/terms routes and contact handling with the owner. Replace pending links only with verified routes.
4. Confirm canonical Netlify source, production rollback artifact and deployment ownership; no automatic linkage is assumed.
5. Any change from forthcoming to live requires exact production feature verification, correct app entry points and approval. Preview publishing is not production-release authority.

Evidence is intentionally ignored under `.hermes/evidence/`. No commit, push, merge, deploy, secret access, paid provider call, app edit or blog edit is part of this work.
