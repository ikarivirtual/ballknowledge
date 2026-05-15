import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { fallbackQuestionSet } from "@/lib/fallback-questions";
import { generatedSetSchema, type GeneratedSet } from "@/lib/question-schema";
import { openAiEnv } from "@/lib/env";

type GenerationResult = {
  date: string;
  source: "openai" | "fallback";
  setId: string;
  error?: string;
};

type GenerationSource = GenerationResult["source"];

type StoredSet = {
  setId: string;
  source: GenerationSource;
};

async function fetchGeneratedSet(date: string): Promise<GeneratedSet> {
  const env = openAiEnv();

  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const response = await openai.responses.parse({
    model: env.OPENAI_MODEL,
    input: [
      {
        role: "system",
        content:
          "Generate exactly five original hard multiple-choice quiz questions for knowledgeable A-League fans. Focus on the 2005-06 through 2019-20 seasons: grand finals, premiers, finals series moments, cult players, marquees, derbies, expansion clubs, managers, venues, penalties, red cards, Asian Champions League context involving A-League clubs, and memorable but non-obvious regular-season details. Avoid basic questions about current squads, generic football rules, the Socceroos, or overseas club football. Return strict JSON only."
      },
      {
        role: "user",
        content: `Create the daily Ball Knowledge quiz for ${date}. Difficulty should suit fans who remember the 2000s and 2010s A-League in detail. Each question must have four plausible choices, one correctChoice index from 0 to 3, and a concise explanation that names the relevant season, match, club, player, manager, or venue.`
      }
    ],
    text: {
      format: zodTextFormat(generatedSetSchema, "daily_football_quiz")
    }
  });

  return generatedSetSchema.parse(response.output_parsed);
}

async function insertSet(date: string, set: GeneratedSet, source: GenerationSource, error?: string): Promise<StoredSet> {
  const supabase = createAdminClient();

  const { data: existing, error: existingError } = await supabase
    .from("daily_sets")
    .select("id, source, generation_status")
    .eq("quiz_date", date)
    .maybeSingle();

  if (existingError) throw existingError;

  if (existing) {
    const existingSource = existing.source as GenerationSource;
    const canUpgradeFallback =
      source === "openai" && (existingSource === "fallback" || existing.generation_status === "failed");

    if (!canUpgradeFallback) {
      return { setId: existing.id as string, source: existingSource };
    }

    const { count, error: attemptError } = await supabase
      .from("attempts")
      .select("id", { count: "exact", head: true })
      .eq("set_id", existing.id);

    if (attemptError) throw attemptError;

    if ((count ?? 0) > 0) {
      return { setId: existing.id as string, source: existingSource };
    }

    const { error: deleteError } = await supabase.from("daily_sets").delete().eq("id", existing.id);
    if (deleteError) throw deleteError;
  }

  const { data: dailySet, error: setError } = await supabase
    .from("daily_sets")
    .insert({
      quiz_date: date,
      source,
      generation_status: error ? "failed" : "ready",
      generation_error: error ?? null
    })
    .select("id")
    .single();

  if (setError) throw setError;

  const questions = set.questions.map((question, index) => ({
    set_id: dailySet.id,
    position: index + 1,
    prompt: question.prompt,
    choices: question.choices,
    correct_choice: question.correctChoice,
    explanation: question.explanation
  }));

  const { error: questionError } = await supabase.from("questions").insert(questions);
  if (questionError) throw questionError;

  return { setId: dailySet.id as string, source };
}

export async function generateDailySet(date: string, options: { replaceExisting?: boolean } = {}): Promise<GenerationResult> {
  if (options.replaceExisting) {
    const supabase = createAdminClient();
    const { error } = await supabase.from("daily_sets").delete().eq("quiz_date", date);
    if (error) throw error;
  }

  try {
    const generatedSet = await fetchGeneratedSet(date);
    const stored = await insertSet(date, generatedSet, "openai");
    return { date, ...stored };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown generation error";
    const stored = await insertSet(date, fallbackQuestionSet, "fallback", message);
    return { date, ...stored, error: message };
  }
}
