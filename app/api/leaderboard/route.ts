import { NextResponse, type NextRequest } from "next/server";
import { isoDateInUTC, startOfWeekUTC } from "@/lib/dates";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const tabs = new Set(["daily", "weekly", "all-time"]);

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tab = url.searchParams.get("tab") ?? "daily";

  if (!tabs.has(tab)) {
    return NextResponse.json({ error: "Invalid tab" }, { status: 400 });
  }

  const admin = createAdminClient();
  let query = admin
    .from("attempts")
    .select("player_name, score, correct_count, total_score, duration_seconds, completed_at, daily_sets!inner(quiz_date)")
    .order("total_score", { ascending: false })
    .order("duration_seconds", { ascending: true })
    .limit(50);

  if (tab === "daily") {
    query = query.eq("daily_sets.quiz_date", isoDateInUTC());
  }

  if (tab === "weekly") {
    query = query.gte("completed_at", startOfWeekUTC());
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Could not load leaderboard" }, { status: 500 });
  }

  const rows = (data ?? []).map((row, index) => {
    return {
      rank: index + 1,
      name: row.player_name ?? "Guest",
      score: row.score,
      correctCount: row.correct_count ?? row.score,
      totalScore: row.total_score ?? row.score * 1000,
      durationSeconds: row.duration_seconds ?? 0,
      completedAt: row.completed_at
    };
  });

  return NextResponse.json({ rows });
}
