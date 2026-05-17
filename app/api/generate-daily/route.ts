import { NextResponse, type NextRequest } from "next/server";
import { generateDailySet } from "@/lib/generate-daily-set";
import { isoDateInQuizTimeZone } from "@/lib/dates";
import { cronEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest) {
  const env = cronEnv();
  const bearer = request.headers.get("authorization");
  const adminSecret = request.headers.get("x-admin-secret");
  return bearer === `Bearer ${env.CRON_SECRET}` || adminSecret === env.CRON_SECRET;
}

async function handler(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const requestedDate = url.searchParams.get("date");
  const force = url.searchParams.get("force") === "true";
  const date = requestedDate ?? isoDateInQuizTimeZone();
  const result = await generateDailySet(date, { replaceExisting: force });

  return NextResponse.json(result);
}

export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}
