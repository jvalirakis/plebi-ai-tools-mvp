import { NextResponse } from "next/server";
import { ingestEditorialSources } from "@/lib/editorial/ingest";

export const runtime = "nodejs";

function isAuthorized(request: Request) {
  const expectedSecret = process.env.CRON_SECRET ?? process.env.INGEST_SECRET;

  if (!expectedSecret) {
    return false;
  }

  return request.headers.get("authorization") === `Bearer ${expectedSecret}`;
}

function getPositiveIntegerParam(url: URL, name: string, fallback: number) {
  const value = Number(url.searchParams.get(name));
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

async function handleIngestion(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const summary = await ingestEditorialSources({
    maxSources: getPositiveIntegerParam(url, "maxSources", 8),
    maxItemsPerSource: getPositiveIntegerParam(url, "maxItems", 10),
    dryRun: url.searchParams.get("dryRun") === "1"
  });

  return NextResponse.json(summary);
}

export async function GET(request: Request) {
  return handleIngestion(request);
}

export async function POST(request: Request) {
  return handleIngestion(request);
}
