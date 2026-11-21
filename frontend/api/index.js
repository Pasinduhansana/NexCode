import { resolveApiHandler, pathParamsFromSegments } from "../lib/api/resolve-handler.js";

/**
 * Single Vercel serverless function that fronts every /api/* route.
 * Keeps the project on 1 deployed function (Hobby plan cap: 12) instead of
 * one function per route — see lib/api/resolve-handler.js for the routing table
 * and lib/api-handlers/ for the actual handler implementations.
 *
 * Vercel's frameworkless `api/` directory does not support Next.js-style
 * catch-all files ([...path].js is a Next.js-only feature), so every /api/*
 * request is funnelled here by the `/api/(.*)` rewrite in vercel.json, which
 * forwards the original path as the `path` query parameter. Segments are also
 * derived from req.path / req.url as a fallback.
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

  // Derive the route path segments. Priority:
  //  1. `path` query param set by the vercel.json rewrite (or dev server).
  //  2. `path` in the raw request URL's query string.
  //  3. req.path / req.url pathname (stripped of the /api prefix).
  const decode = (s) => {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  };
  const splitSegments = (value) =>
    String(value)
      .split("/")
      .map((s) => decode(s))
      .filter(Boolean);

  let segments;
  if (req.query && req.query.path !== undefined && req.query.path !== null && req.query.path !== "") {
    segments = Array.isArray(req.query.path)
      ? req.query.path.map((s) => decode(s)).filter(Boolean)
      : splitSegments(req.query.path);
  } else {
    const urlQuery = (req.url || "").split("?")[1] || "";
    const pathFromUrlQuery = new URLSearchParams(urlQuery).get("path");
    if (pathFromUrlQuery) {
      segments = splitSegments(pathFromUrlQuery);
    } else {
      const path = (req.path || (req.url || "").split("?")[0]).replace(/^\/api\/?/, "");
      segments = splitSegments(path);
    }
  }

  // Ensure POST for auth/login (the consolidated handler delegates to per‑route handlers,
  // but some calls may hit this file directly – return a clear 405 instead of a generic error).
  const joined = segments.join("/");
  if (joined === "auth/login" && req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  let routeHandler;
  try {
    routeHandler = await resolveApiHandler(segments);
  } catch (err) {
    console.error("[api] handler resolution failed", err);
    return res.status(500).json({ error: "Handler failed to load" });
  }
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
