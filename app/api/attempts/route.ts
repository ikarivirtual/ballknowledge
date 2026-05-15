import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { isoDateInUTC } from "@/lib/dates";
import { calculateQuizScore } from "@/lib/scoring";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const attemptSchema = z.object({
  answers: z.array(z.number().int().min(0).max(3)).length(5),
  playerName: z.string().trim().min(2).max(24),
  durationSeconds: z.number().int().min(0).max(3600)
}).strict();

export async function POST(request: Request) {
  const body = attemptSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid answers" }, { status: 400 });
  }

  const admin = createAdminClient();
  const cookieStore = await cookies();
  const existingPlayerId = cookieStore.get("ball_knowledge_player_id")?.value;
  const playerId = z.string().uuid().safeParse(existingPlayerId).success
    ? existingPlayerId!
    : crypto.randomUUID();
  const playerName = body.data.playerName.replace(/\s+/g, " ");

  const today = isoDateInUTC();
  const { data: dailySet, error: setError } = await admin
    .from("daily_sets")
    .select("id")
    .eq("quiz_date", today)
    .single();

  if (setError || !dailySet) {
    return NextResponse.json({ error: "Today's quiz is not available" }, { status: 404 });
  }

  const { data: existing, error: existingError } = await admin
    .from("attempts")
    .select("id, score, correct_count, total_score, duration_seconds, player_name")
    .eq("player_id", playerId)
    .eq("set_id", dailySet.id)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: "Could not check attempt" }, { status: 500 });
  }

  if (existing) {
    return NextResponse.json(
      {
        error: "Already attempted today",
        score: existing.score,
        correctCount: existing.correct_count ?? existing.score,
        totalScore: existing.total_score ?? existing.score * 1000,
        durationSeconds: existing.duration_seconds ?? 0,
        playerName: existing.player_name ?? "Guest"
      },
      { status: 409 }
    );
  }

  const { data: questions, error: questionError } = await admin
    .from("questions")
    .select("correct_choice")
    .eq("set_id", dailySet.id)
    .order("position", { ascending: true });

  if (questionError || !questions || questions.length !== 5) {
    return NextResponse.json({ error: "Today's quiz is incomplete" }, { status: 500 });
  }

  const correctChoices = questions.map((question) => question.correct_choice as number);
  const correctCount = body.data.answers.reduce((total, answer, index) => {
    return total + (answer === correctChoices[index] ? 1 : 0);
  }, 0);
  const score = calculateQuizScore(correctCount, body.data.durationSeconds);

  const { error: insertError } = await admin.from("attempts").insert({
    player_id: playerId,
    player_name: playerName,
    set_id: dailySet.id,
    answers: body.data.answers,
    score: score.correctCount,
    correct_count: score.correctCount,
    duration_seconds: score.durationSeconds,
    total_score: score.totalScore
  });

  if (insertError) {
    return NextResponse.json({ error: "Attempt could not be saved" }, { status: 409 });
  }

  const response = NextResponse.json({
    score: score.correctCount,
    correctCount: score.correctCount,
    totalScore: score.totalScore,
    speedBonus: score.speedBonus,
    durationSeconds: score.durationSeconds,
    playerName,
    answers: body.data.answers,
    correctChoices
  });
  response.cookies.set("ball_knowledge_player_id", playerId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365
  });

  return response;
}
