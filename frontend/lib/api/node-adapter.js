import { NextResponse } from "next/server";

/**
 * Adapts a Vercel-style (req, res) handler to a Next.js App Router route handler.
 */
export async function runNodeHandler(handler, request, { params, queryExtra = {} }) {
  const pathParts = params?.path ?? [];
  const url = new URL(request.url);

  let body = null;
  const method = request.method;
  if (method !== "GET" && method !== "HEAD") {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        body = await request.json();
      } catch {
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

  await handler(req, res);

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
