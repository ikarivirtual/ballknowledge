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
          "Generate exactly five original hard multiple-choice quiz questions for knowledgeable FIFA World Cup fans. Focus mainly on the 2002, 2006, 2010, 2014, and 2018 tournaments, with occasional 1998 or 2022 context only when useful. Prefer memorable but non-obvious details: knockout-stage scorers, group-stage surprises, red cards, managers, venues, penalty shootouts, Golden Ball/Boot races, squads, and unusual match facts. Avoid basic questions about winners, host nations, generic rules, or current club football. Return strict JSON only."
      },
      {
        role: "user",
        content: `Create the daily Ball Knowledge quiz for ${date}. Difficulty should suit fans who remember World Cups from the 2000s and 2010s in detail. Each question must have four plausible choices, one correctChoice index from 0 to 3, and a concise explanation that names the relevant tournament, match, player, or team.`
      }
    ],
    text: {
      format: zodTextFormat(generatedSetSchema, "daily_football_quiz")
    }
  });

  return generatedSetSchema.parse(response.output_parsed);
}

async function insertSet(date: string, set: GeneratedSet, source: "openai" | "fallback", error?: string) {
  const supabase = createAdminClient();

  const { data: existing, error: existingError } = await supabase
    .from("daily_sets")
    .select("id")
    .eq("quiz_date", date)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return existing.id as string;

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

  return dailySet.id as string;
}

export async function generateDailySet(date: string, options: { replaceExisting?: boolean } = {}): Promise<GenerationResult> {
  if (options.replaceExisting) {
    const supabase = createAdminClient();
    const { error } = await supabase.from("daily_sets").delete().eq("quiz_date", date);
    if (error) throw error;
  }

  try {
    const generatedSet = await fetchGeneratedSet(date);
    const setId = await insertSet(date, generatedSet, "openai");
    return { date, source: "openai", setId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown generation error";
    const setId = await insertSet(date, fallbackQuestionSet, "fallback", message);
    return { date, source: "fallback", setId, error: message };
  }
}
