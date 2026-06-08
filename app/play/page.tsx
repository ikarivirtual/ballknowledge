import { cookies } from "next/headers";
import type { Metadata } from "next";
import { generateDailySet } from "@/lib/generate-daily-set";
import { isoDateInQuizTimeZone } from "@/lib/dates";
import { calculateQuizScore } from "@/lib/scoring";
import { createAdminClient } from "@/lib/supabase/admin";
import { QuizForm } from "@/components/quiz-form";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Play Today's Daily Football Quiz",
  description:
    "Play today's Ball Knowledge football trivia game: five fresh football questions, one attempt, instant scoring, and answer explanations.",
  path: "/play",
  keywords: ["daily football quiz", "football trivia game", "daily trivia quiz"]
});

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) {
    return String(error.message);
  }
  return "Unknown Supabase or generation error";
}

async function getTodayQuiz() {
  const admin = createAdminClient();
  const today = isoDateInQuizTimeZone();

  let initialSet;
  try {
    initialSet = await admin
      .from("daily_sets")
      .select("id, quiz_date, source, generation_status")
      .eq("quiz_date", today)
      .maybeSingle();
  } catch (error) {
    return {
      error: `Could not connect to Supabase: ${errorMessage(error)}`,
      dailySet: null,
      questions: []
    };
  }

  if (initialSet.error) {
    return {
      error: `Could not connect to Supabase: ${initialSet.error.message}`,
      dailySet: null,
      questions: []
    };
  }

  let dailySet = initialSet.data;

  if (!dailySet) {
    try {
      await generateDailySet(today);
      const retry = await admin
        .from("daily_sets")
        .select("id, quiz_date, source, generation_status")
        .eq("quiz_date", today)
        .single();

      if (retry.error) {
        return {
          error: `Could not load today's generated quiz: ${retry.error.message}`,
          dailySet: null,
          questions: []
        };
      }

      dailySet = retry.data;
    } catch (error) {
      const message = errorMessage(error);
      return {
        error: `Could not prepare today's quiz: ${message}`,
        dailySet: null,
        questions: []
      };
    }
  }

  if (!dailySet) {
    return {
      error: "Today's quiz is not available yet.",
      dailySet: null,
      questions: []
    };
  }

  if (dailySet.generation_status !== "ready") {
    return {
      error:
        dailySet.generation_status === "pending"
          ? "Today's quiz has been generated and is waiting for admin review."
          : "Today's quiz is not available yet.",
      dailySet: null,
      questions: []
    };
  }

  const { data: questions, error: questionsError } = await admin
    .from("questions")
    .select("id, position, prompt, choices, explanation, correct_choice")
    .eq("set_id", dailySet.id)
    .order("position", { ascending: true });

  if (questionsError) {
    return {
      error: `Could not load today's questions: ${questionsError.message}`,
      dailySet: null,
      questions: []
    };
  }

  return { dailySet, questions: questions ?? [] };
}

export default async function PlayPage() {
  const quiz = await getTodayQuiz();
  if (quiz.error) {
    return (
      <section className="panel stack">
        <p className="kicker">Daily special unavailable</p>
        <h1>Today&apos;s quiz is unavailable</h1>
        <p className="subtitle">{quiz.error}</p>
        <p className="muted">
          If this is a local setup issue, check the Supabase values in `.env`, confirm the
          migrations have been applied, and restart the dev server.
        </p>
      </section>
    );
  }

  if (!quiz.dailySet || quiz.questions.length !== 5) {
    return (
      <section className="panel stack">
        <h1>Today&apos;s quiz is warming up</h1>
        <p className="subtitle">The daily set is not available yet. Try again shortly.</p>
      </section>
    );
  }

  const admin = createAdminClient();
  const playerId = (await cookies()).get("ball_knowledge_player_id")?.value;
  const { data: attempt } = playerId
    ? await admin
        .from("attempts")
        .select("answers, score, correct_count, total_score, duration_seconds, player_name")
        .eq("player_id", playerId)
        .eq("set_id", quiz.dailySet.id)
        .maybeSingle()
    : { data: null };

  const questions = quiz.questions.map((question) => ({
    id: question.id as string,
    position: question.position as number,
    prompt: question.prompt as string,
    choices: question.choices as string[],
    explanation: question.explanation as string
  }));

  const correctChoices = attempt
    ? quiz.questions.map((question) => question.correct_choice as number)
    : undefined;
  const fallbackScore = attempt
    ? calculateQuizScore(
        (attempt.correct_count as number | null) ?? (attempt.score as number),
        (attempt.duration_seconds as number | null) ?? 0
      )
    : null;

  return (
    <section className="stack">
      <div className="hero">
        <p className="kicker">Extra fresh football trivia</p>
        <h1>Today&apos;s five</h1>
        <p className="subtitle">
          One shot, five football questions, server-scored for {quiz.dailySet.quiz_date}.
        </p>
      </div>
      <QuizForm
        questions={questions}
        existingAttempt={
          attempt
            ? {
                score: attempt.score as number,
                correctCount: (attempt.correct_count as number | null) ?? (attempt.score as number),
                totalScore: (attempt.total_score as number | null) ?? fallbackScore?.totalScore ?? (attempt.score as number) * 1000,
                speedBonus: fallbackScore?.speedBonus ?? 0,
                durationSeconds: (attempt.duration_seconds as number | null) ?? 0,
                playerName: (attempt.player_name as string | null) ?? "Guest",
                answers: attempt.answers as number[],
                correctChoices: correctChoices ?? []
              }
            : null
        }
      />
    </section>
  );
}
