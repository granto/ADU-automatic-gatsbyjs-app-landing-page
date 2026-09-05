import { readFile, writeFile, mkdir, cp, rm } from "node:fs/promises"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import config from "../site-config.js"
const root = fileURLToPath(new URL("../", import.meta.url))
const previewContext =
  process.env.CONTEXT && process.env.CONTEXT !== "production"
if (process.argv.includes("--production") && previewContext)
  throw new Error("Refusing production indexing in a non-production CONTEXT")
const production = process.argv.includes("--production") && !previewContext
const robots = production ? "index, follow" : "noindex, follow"
const esc = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
const publicDir = resolve(root, "public")
await rm(publicDir, { recursive: true, force: true })
await mkdir(publicDir, { recursive: true })
const head = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(config.title)}</title>
<meta name="description" content="${esc(config.description)}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${config.url}">
<meta name="theme-color" content="#f8f5ed">
<meta property="og:type" content="website">
<meta property="og:site_name" content="ADUroi">
<meta property="og:title" content="${esc(config.title)}">
<meta property="og:description" content="${esc(config.description)}">
<meta property="og:url" content="${config.url}">
<meta property="og:image" content="${config.url}social-card.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="ADUroi. Make the ADU decision clearer. Forthcoming experience.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(config.title)}">
<meta name="twitter:description" content="${esc(config.description)}">
<meta name="twitter:image" content="${config.url}social-card.png">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/InterVariable.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/site.css">
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", name: "ADUroi", url: config.url, description: config.description }).replaceAll("<", "\\u003c")}</script>`
const html = (await readFile(resolve(root, "src/index.html"), "utf8")).replace(
  "<!-- HEAD -->",
  head
)
await writeFile(resolve(publicDir, "index.html"), html)
await cp(resolve(root, "static"), publicDir, { recursive: true })
for (const file of ["site.css", "site.js"])
  await cp(resolve(root, "src", file), resolve(publicDir, file))
await writeFile(
  resolve(publicDir, "robots.txt"),
  production
    ? `User-agent: *\nAllow: /\nSitemap: ${config.url}sitemap.xml\n`
    : "User-agent: *\nDisallow: /\n"
)
await writeFile(
  resolve(publicDir, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${config.url}</loc></url></urlset>\n`
)
await writeFile(
  resolve(publicDir, "404.html"),
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Page not found — ADUroi</title><meta name="robots" content="noindex, follow"><link rel="stylesheet" href="/site.css"></head><body><main class="wrap error-page"><p class="eyebrow">ADUroi / 404</p><h1>This page isn't here.</h1><p>Return to ADUroi to explore the current app and forthcoming experience.</p><a class="button primary" href="/">Back to ADUroi</a></main></body></html>`
)
await writeFile(
  resolve(publicDir, "_headers"),
  `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'\n${production ? "" : "  X-Robots-Tag: noindex, nofollow\n"}/404.html\n  X-Robots-Tag: noindex, follow\n`
)
console.log(
  `Built ${production ? "production (crawlable)" : "preview (noindex)"}: ${publicDir}`
)
