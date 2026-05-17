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

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const date = url.searchParams.get("date") ?? isoDateInQuizTimeZone();
  const admin = createAdminClient();

  const { data: dailySet, error: setError } = await admin
    .from("daily_sets")
    .select("id, quiz_date, source, generation_status, generation_error")
    .eq("quiz_date", date)
    .single();

  if (setError || !dailySet) {
    return NextResponse.json({ error: "Daily set not found" }, { status: 404 });
  }

  const { data: questions, error: questionError } = await admin
    .from("questions")
    .select("position, prompt, choices, correct_choice, explanation")
    .eq("set_id", dailySet.id)
    .order("position", { ascending: true });

  if (questionError) {
    return NextResponse.json({ error: `Could not load questions: ${questionError.message}` }, { status: 500 });
  }

  return NextResponse.json({ dailySet, questions });
}
