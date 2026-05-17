import { NextResponse, type NextRequest } from "next/server";
import { isoDateInQuizTimeZone } from "@/lib/dates";
import { cronEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest) {
  const env = cronEnv();
  const bearer = request.headers.get("authorization");
  const adminSecret = request.headers.get("x-admin-secret");
  return bearer === `Bearer ${env.CRON_SECRET}` || adminSecret === env.CRON_SECRET;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const date = url.searchParams.get("date") ?? isoDateInQuizTimeZone();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("daily_sets")
    .update({ generation_status: "ready", generation_error: null })
    .eq("quiz_date", date)
    .eq("generation_status", "pending")
    .select("id, quiz_date, source, generation_status")
    .single();

  if (error) {
    return NextResponse.json({ error: `Could not approve daily set: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({ dailySet: data });
}
