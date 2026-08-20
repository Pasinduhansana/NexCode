import { resolveApiHandler, pathParamsFromSegments } from "../lib/api/resolve-handler.js";

/**
 * Single Vercel serverless function that fronts every /api/* route.
 * Keeps the project on 1 deployed function (Hobby plan cap: 12) instead of
 * one function per route — see lib/api/resolve-handler.js for the routing table
 * and lib/api-handlers/ for the actual handler implementations.
 */

function buildCors(req) {
  const origin = req.headers.origin;
  if (!origin) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
}

export default async function handler(req, res) {
  const corsHeaders = buildCors(req);
  for (const [key, value] of Object.entries(corsHeaders)) {
    res.setHeader(key, value);
  }

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  // Derive path segments from the query param or fall back to req.path
  let segments;
  if (req.query.path) {
    segments = Array.isArray(req.query.path) ? req.query.path : [req.query.path];
  } else {
    // fallback: infer from the request path (e.g. /api/auth/login)
    const path = (req.path || '').replace(/^\/api/i, '').trim();
    segments = path ? path.split('/').filter((s) => s) : [];
  }

  // Ensure POST for auth/login (the consolidated handler delegates to per‑route handlers,
  // but some calls may hit this file directly – return a clear 405 instead of a generic error).
  const joined = segments.join("/");
  if (joined === "auth/login" && req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const routeHandler = await resolveApiHandler(segments);
  if (!routeHandler) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  req.query = { ...req.query, ...pathParamsFromSegments(segments) };
  delete req.query.path;

  try {
    await routeHandler(req, res);
  } catch (err) {
    console.error("[api] handler error", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
