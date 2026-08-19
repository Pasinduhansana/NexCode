// Local dev-only API server. Mounts the real Vercel handler (api/[...path].js)
// on plain Node http so `vite`'s /api proxy has something to talk to, without
// depending on `vercel dev` (which fights this project's own "dev" script —
// see the recursive-invocation guard in the Vercel CLI).
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env");

if (existsSync(envPath)) {
  const envText = readFileSync(envPath, "utf8");
  for (const line of envText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    const value = rawValue.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
    process.env[key] = value;
  }
}

const { default: handler } = await import("../api/[...path].js");

const PORT = Number(process.env.API_DEV_PORT) || 3000;
const MAX_BODY_BYTES = 4 * 1024 * 1024;

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error("Payload too large"), { statusCode: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (!url.pathname.startsWith("/api/") && url.pathname !== "/api") {
    res.statusCode = 404;
    res.end("Not found");
    return;
  }

  const segments = url.pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);
  const query = Object.fromEntries(url.searchParams.entries());
  query.path = segments;

  let body = undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    try {
      const raw = await readBody(req);
      const contentType = req.headers["content-type"] || "";
      if (raw.length && contentType.includes("application/json")) {
        try {
          body = JSON.parse(raw.toString("utf8"));
        } catch {
          body = {};
        }
      } else {
        body = {};
      }
    } catch (err) {
      res.statusCode = err.statusCode || 400;
      res.end(err.message);
      return;
    }
  }

  req.query = query;
  req.body = body;

  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    if (!res.getHeader("Content-Type")) res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(payload));
    return res;
  };
  res.send = (data) => {
    res.end(data);
    return res;
  };

  try {
    await handler(req, res);
  } catch (err) {
    console.error("[dev-api] unhandled error", err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: "Internal server error" }));
    }
  }
});

server.listen(PORT, () => {
  console.log(`[dev-api] listening on http://localhost:${PORT}`);
});
