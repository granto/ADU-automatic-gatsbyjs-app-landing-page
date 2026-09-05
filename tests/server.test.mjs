import { spawn } from "node:child_process"
import test from "node:test"
import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
test("real loopback HTTP serves HTML, all assets, noindex, and genuine 404", async () => {
  const child = spawn(process.execPath, ["scripts/serve.mjs"], {
    env: { ...process.env, PORT: "0" },
    stdio: ["ignore", "pipe", "pipe"],
  })
  try {
    const url = await new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error("server readiness timed out")),
        5000
      )
      child.once("error", reject)
      child.stdout.on("data", (data) => {
        const match = String(data).match(/http:\/\/127\.0\.0\.1:\d+/)
        if (match) {
          clearTimeout(timer)
          resolve(match[0])
        }
      })
      child.once("exit", (code) => {
        clearTimeout(timer)
        reject(new Error("server exited " + code))
      })
    })
    for (const [path, type] of [
      ["/", "text/html"],
      ["/site.css", "text/css"],
      ["/site.js", "text/javascript"],
      ["/social-card.png", "image/png"],
      ["/favicon.svg", "image/svg+xml"],
      ["/fonts/InterVariable.woff2", "font/woff2"],
      ["/sitemap.xml", "application/xml"],
      ["/robots.txt", "text/plain"],
    ]) {
      const response = await fetch(url + path)
      assert.equal(response.status, 200, path)
      assert.ok(response.headers.get("content-type").includes(type), path)
      assert.match(response.headers.get("x-robots-tag"), /noindex/)
      const actual = Buffer.from(await response.arrayBuffer())
      const expected = await readFile(
        "public" + (path === "/" ? "/index.html" : path)
      )
      assert.deepEqual(actual, expected, path)
    }
    const missing = await fetch(url + "/missing-page")
    assert.equal(missing.status, 404)
    assert.match(await missing.text(), /This page isn't here/)
    assert.match(missing.headers.get("x-robots-tag"), /noindex/)
  } finally {
    child.kill("SIGTERM")
  }
})
