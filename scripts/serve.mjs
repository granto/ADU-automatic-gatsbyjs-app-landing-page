import http from "node:http"
import { readFile } from "node:fs/promises"
import { resolve, extname } from "node:path"
const root = resolve("public")
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".txt": "text/plain",
}
const server = http.createServer(async (req, res) => {
  let path
  try {
    path = decodeURIComponent(new URL(req.url, "http://localhost").pathname)
  } catch {
    res.writeHead(400).end()
    return
  }
  const file = resolve(
    root,
    "." + (path.endsWith("/") ? path + "index.html" : path)
  )
  if (!file.startsWith(root + "/")) {
    res.writeHead(403).end()
    return
  }
  try {
    const data = await readFile(file)
    res.writeHead(200, {
      "Content-Type": types[extname(file)] || "application/octet-stream",
      "X-Robots-Tag": "noindex, nofollow",
    })
    res.end(data)
  } catch {
    res.writeHead(404, {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, follow",
    })
    res.end(await readFile(resolve(root, "404.html")))
  }
})
server.listen(Number(process.env.PORT || 4178), "127.0.0.1", () =>
  console.log("ADUroi local preview http://127.0.0.1:" + server.address().port)
)
