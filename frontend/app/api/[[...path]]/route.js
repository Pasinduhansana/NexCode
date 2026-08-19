import { NextResponse } from "next/server";
import { resolveApiHandler, pathParamsFromSegments } from "@/lib/api/resolve-handler";
import { runNodeHandler } from "@/lib/api/node-adapter";

async function handleRequest(request, context) {
  const path = context.params?.path ?? [];
  const handler = await resolveApiHandler(path);
  if (!handler) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const queryExtra = pathParamsFromSegments(path);
  return runNodeHandler(handler, request, {
    params: context.params,
    queryExtra,
  });
}

export const dynamic = "force-dynamic";

export async function GET(request, context) {
  return handleRequest(request, context);
}

export async function POST(request, context) {
  return handleRequest(request, context);
}

export async function PUT(request, context) {
  return handleRequest(request, context);
}

export async function PATCH(request, context) {
  return handleRequest(request, context);
}

export async function DELETE(request, context) {
  return handleRequest(request, context);
}
