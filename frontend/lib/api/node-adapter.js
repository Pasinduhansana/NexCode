import { NextResponse } from "next/server";

/**
 * Adapts a Vercel-style (req, res) handler to a Next.js App Router route handler,
 * and applies shared per-request guards at the single /api/* boundary:
 *   - X-Request-Id        (correlation header on every response)
 *   - CORS                (echo Origin when present; same-origin in prod)
 *   - body-size cap       (reject oversized payloads with 413, see S4)
 *   - error envelope      (consistent { error, code, requestId } on 500)
 * Route-specific auth (requireAuth) still lives inside each handler.
 */

// Max request body: 4 MB. Rejects memory-exhaustion DoS via large payloads.
const MAX_BODY_BYTES = 4 * 1024 * 1024;

function newRequestId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  }
}

// Same-origin in production (admin + API share an origin). When a browser sends
// an Origin header (localhost dev, or a future cross-origin admin), echo it back
// with credentials support. No "*" wildcard, to avoid credential leakage.
function buildCors(request) {
  const origin = request.headers.get("origin");
  if (!origin) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
}

// Read the raw request stream with a hard byte cap; throws on overflow.
async function readBodyCapped(request) {
  const reader = request.body?.getReader?.();
  if (!reader) return Buffer.alloc(0);
  const chunks = [];
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      received += value.length;
      if (received > MAX_BODY_BYTES) {
        const err = new Error("PAYLOAD_TOO_LARGE");
        err.code = "PAYLOAD_TOO_LARGE";
        throw err;
      }
      chunks.push(Buffer.from(value));
    }
  }
  return Buffer.concat(chunks);
}

function jsonResponse(status, payload, extraHeaders = {}) {
  return new NextResponse(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}

function envelope(message, code, status, requestId, corsHeaders) {
  return jsonResponse(
    status,
    { error: message, code, requestId },
    { "X-Request-Id": requestId, ...corsHeaders }
  );
}

export async function runNodeHandler(handler, request, { params, queryExtra = {} }) {
  const requestId = newRequestId();
  const corsHeaders = buildCors(request);
  const pathParts = params?.path ?? [];
  const url = new URL(request.url);
  const method = request.method;

  // CORS preflight.
  if (method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: { "X-Request-Id": requestId, ...corsHeaders },
    });
  }

  // Parse body (with size cap) for non-GET/HEAD requests.
  let body = null;
  if (method !== "GET" && method !== "HEAD") {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        const raw = await readBodyCapped(request);
        body = raw.length ? JSON.parse(raw.toString("utf8")) : {};
      } catch (e) {
        if (e?.code === "PAYLOAD_TOO_LARGE") {
          return envelope("Payload too large", "PAYLOAD_TOO_LARGE", 413, requestId, corsHeaders);
        }
        // Lenient: keep prior behaviour of treating malformed JSON as empty.
        body = {};
      }
    } else {
      body = {};
    }
  }

  const query = { ...Object.fromEntries(url.searchParams.entries()), ...queryExtra };
  if (pathParts.length >= 2) {
    // Dynamic segments are resolved by the router and passed via queryExtra
  }

  const reqHeaders = Object.fromEntries(request.headers.entries());
  const req = {
    method,
    url: url.pathname,
    headers: reqHeaders,
    query,
    body,
    requestId,
  };

  let statusCode = 200;
  const responseHeaders = {};
  let responseBody = null;
  let sentRaw = false;

  const res = {
    status(code) {
      statusCode = code;
      return res;
    },
    setHeader(key, value) {
      responseHeaders[key] = value;
      return res;
    },
    json(payload) {
      responseBody = payload;
      responseHeaders["Content-Type"] = "application/json";
      return res;
    },
    send(data) {
      sentRaw = true;
      responseBody = data;
      return res;
    },
  };

  try {
    await handler(req, res);
  } catch (err) {
    // Global error envelope for unhandled handler errors.
    return envelope(
      "Internal server error",
      "INTERNAL",
      500,
      requestId,
      corsHeaders
    );
  }

  // Attach shared guards to every successful response.
  responseHeaders["X-Request-Id"] = requestId;
  Object.assign(responseHeaders, corsHeaders);

  if (sentRaw && Buffer.isBuffer(responseBody)) {
    return new NextResponse(responseBody, {
      status: statusCode,
      headers: responseHeaders,
    });
  }

  if (responseBody !== null && typeof responseBody === "object" && !Buffer.isBuffer(responseBody)) {
    return NextResponse.json(responseBody, { status: statusCode, headers: responseHeaders });
  }

  if (responseBody !== null && typeof responseBody === "string") {
    return new NextResponse(responseBody, { status: statusCode, headers: responseHeaders });
  }

  return NextResponse.json(responseBody ?? {}, { status: statusCode, headers: responseHeaders });
}
