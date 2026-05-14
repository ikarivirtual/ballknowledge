import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { isoDateInUTC } from "@/lib/dates";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const attemptSchema = z.object({
  answers: z.array(z.number().int().min(0).max(3)).length(5)
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
  const playerName = `Guest ${playerId.slice(0, 4).toUpperCase()}`;

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
    .select("id, score")
    .eq("player_id", playerId)
    .eq("set_id", dailySet.id)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: "Could not check attempt" }, { status: 500 });
  }

  if (existing) {
    return NextResponse.json({ error: "Already attempted today", score: existing.score }, { status: 409 });
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
  const score = body.data.answers.reduce((total, answer, index) => {
    return total + (answer === correctChoices[index] ? 1 : 0);
  }, 0);

  const { error: insertError } = await admin.from("attempts").insert({
    player_id: playerId,
    player_name: playerName,
    set_id: dailySet.id,
    answers: body.data.answers,
    score
  });

  if (insertError) {
    return NextResponse.json({ error: "Attempt could not be saved" }, { status: 409 });
  }

  const response = NextResponse.json({ score, answers: body.data.answers, correctChoices });
  response.cookies.set("ball_knowledge_player_id", playerId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365
  });

  return response;
}
