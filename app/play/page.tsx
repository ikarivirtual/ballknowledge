import { cookies } from "next/headers";
import { generateDailySet } from "@/lib/generate-daily-set";
import { isoDateInUTC } from "@/lib/dates";
import { createAdminClient } from "@/lib/supabase/admin";
import { QuizForm } from "@/components/quiz-form";

export const dynamic = "force-dynamic";

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) {
    return String(error.message);
  }
  return "Unknown Supabase or generation error";
}

async function getTodayQuiz() {
  const admin = createAdminClient();
  const today = isoDateInUTC();

  let initialSet;
  try {
    initialSet = await admin
      .from("daily_sets")
      .select("id, quiz_date, source")
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
        .select("id, quiz_date, source")
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
        <h1>Setup needed</h1>
        <p className="subtitle">{quiz.error}</p>
        <p className="muted">
          Add real Supabase values to `.env.local`, run the migrations, and restart the dev server.
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
        .select("answers, score")
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
                answers: attempt.answers as number[],
                correctChoices: correctChoices ?? []
              }
            : null
        }
      />
    </section>
  );
}
