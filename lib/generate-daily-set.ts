import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { fallbackQuestionSet } from "@/lib/fallback-questions";
import { generatedSetSchema, type GeneratedSet } from "@/lib/question-schema";
import { openAiEnv, reviewEnv } from "@/lib/env";
import { correctionsPrompt } from "@/lib/trivia-corrections";
import { factsForDate, factsPrompt, type TriviaFact } from "@/lib/world-cup-facts";
import { validateGeneratedSet } from "@/lib/validate-generated-set";

type GenerationResult = {
  date: string;
  source: "openai" | "fallback";
  setId: string;
  status: "ready" | "pending" | "failed";
  error?: string;
};

type GenerationSource = GenerationResult["source"];

type StoredSet = {
  setId: string;
  source: GenerationSource;
};

const generationAuditSchema = z.object({
  approved: z.boolean(),
  issues: z.array(z.string().min(1).max(240)).max(10)
}).strict();

const WORLD_CUP_THEME_START = "2026-05-17";
const WORLD_CUP_THEME_END = "2026-07-17";
const MAX_GENERATION_ATTEMPTS = 3;

function isWorldCupThemeDate(date: string) {
  return date >= WORLD_CUP_THEME_START && date <= WORLD_CUP_THEME_END;
}

function questionPromptForDate(date: string) {
  if (isWorldCupThemeDate(date)) {
    const facts = factsForDate(date);

    return {
      system:
        "Generate exactly five original hard multiple-choice quiz questions for knowledgeable FIFA World Cup fans. Use only the supplied verified facts as the source of truth. Do not add outside claims, dates, scores, scorers, venues, awards, or records that are not directly supported by the supplied facts. Avoid basic questions about generic football rules, current club squads, or domestic leagues. Avoid fragile wording such as first, only, youngest, oldest, most, or record unless the supplied fact explicitly says it. Return strict JSON only.",
      user: `Create the daily Ball Knowledge quiz for ${date}. Difficulty should suit fans who know World Cup history in detail. Each question must have four plausible choices, one correctChoice index from 0 to 3, and a concise explanation that is directly supported by the verified facts.\n\nVerified facts:\n${factsPrompt(facts)}`,
      facts
    };
  }

  return {
    system:
      `Generate exactly five original hard multiple-choice quiz questions for knowledgeable A-League fans. Focus on the 2005-06 through 2019-20 seasons: grand finals, premiers, finals series moments, cult players, marquees, derbies, expansion clubs, managers, venues, penalties, red cards, Asian Champions League context involving A-League clubs, and memorable but non-obvious regular-season details. Avoid basic questions about current squads, generic football rules, the Socceroos, or overseas club football. Avoid fragile wording such as first, only, youngest, oldest, most, or record unless you are certain the claim is historically exact. Known corrections:\n${correctionsPrompt()}\nReturn strict JSON only.`,
    user: `Create the daily Ball Knowledge quiz for ${date}. Difficulty should suit fans who remember the 2000s and 2010s A-League in detail. Each question must have four plausible choices, one correctChoice index from 0 to 3, and a concise explanation that names the relevant season, match, club, player, manager, or venue. Every answer and explanation must be fact-checkable from widely accepted football records.`,
    facts: []
  };
}

async function generateCandidateSet(
  openai: OpenAI,
  model: string,
  prompt: ReturnType<typeof questionPromptForDate>,
  previousIssues: string[]
) {
  const retryInstruction = previousIssues.length
    ? `Avoid these rejected issues from the previous attempt: ${previousIssues.join(" | ")}`
    : "No previous audit issues.";

  const response = await openai.responses.parse({
    model,
    input: [
      {
        role: "system",
        content: prompt.system
      },
      {
        role: "user",
        content: `${prompt.user}\n\n${retryInstruction}`
      }
    ],
    text: {
      format: zodTextFormat(generatedSetSchema, "daily_football_quiz")
    }
  });

  return generatedSetSchema.parse(response.output_parsed);
}

async function auditGeneratedSet(openai: OpenAI, model: string, set: GeneratedSet) {
  const response = await openai.responses.parse({
    model,
    input: [
      {
        role: "system",
        content:
          `You are a strict football trivia fact-checker. Audit the proposed quiz before publication. Reject the entire set if any question has a wrong answer, ambiguous wording, mismatched explanation, dubious date, misleading superlative, or a claim that a knowledgeable fan would reasonably dispute. Be especially careful with first/only/record claims. Known corrections:\n${correctionsPrompt()}\nReturn approved=false with concise issues if anything needs fixing; otherwise approved=true with no issues.`
      },
      {
        role: "user",
        content: JSON.stringify(set)
      }
    ],
    text: {
      format: zodTextFormat(generationAuditSchema, "daily_football_quiz_audit")
    }
  });

  return generationAuditSchema.parse(response.output_parsed);
}

async function auditGeneratedSetAgainstFacts(
  openai: OpenAI,
  model: string,
  set: GeneratedSet,
  facts: TriviaFact[]
) {
  if (!facts.length) return { approved: true, issues: [] };

  const response = await openai.responses.parse({
    model,
    input: [
      {
        role: "system",
        content:
          "You are a strict source-grounding auditor. The quiz is allowed to use only the supplied verified facts. Reject the set if any prompt, correct answer, distractor implication, or explanation depends on outside knowledge not present in the facts, or if the generated answer is not directly supported by the facts."
      },
      {
        role: "user",
        content: `Verified facts:\n${factsPrompt(facts)}\n\nQuiz:\n${JSON.stringify(set)}`
      }
    ],
    text: {
      format: zodTextFormat(generationAuditSchema, "daily_football_quiz_source_audit")
    }
  });

  return generationAuditSchema.parse(response.output_parsed);
}

async function fetchGeneratedSet(date: string): Promise<GeneratedSet> {
  const env = openAiEnv();

  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const prompt = questionPromptForDate(date);
  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  let auditIssues: string[] = [];

  for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const generatedSet = await generateCandidateSet(openai, env.OPENAI_MODEL, prompt, auditIssues);
    const deterministicIssues = validateGeneratedSet(generatedSet);

    if (deterministicIssues.length) {
      auditIssues = deterministicIssues;
      continue;
    }

    const audit = await auditGeneratedSet(openai, env.OPENAI_MODEL, generatedSet);

    if (!audit.approved) {
      auditIssues = audit.issues.length ? audit.issues : [`Attempt ${attempt} failed fact-check audit.`];
      continue;
    }

    const sourceAudit = await auditGeneratedSetAgainstFacts(openai, env.OPENAI_MODEL, generatedSet, prompt.facts);

    if (sourceAudit.approved) {
      return generatedSet;
    }

    auditIssues = sourceAudit.issues.length ? sourceAudit.issues : [`Attempt ${attempt} failed source-grounding audit.`];
  }

  throw new Error(`Generated quiz failed fact-check audit: ${auditIssues.join(" | ")}`);
}

async function insertSet(date: string, set: GeneratedSet, source: GenerationSource, error?: string): Promise<StoredSet & { status: GenerationResult["status"] }> {
  const supabase = createAdminClient();
  const status = error ? "failed" : reviewEnv().ADMIN_REVIEW_REQUIRED === "true" && source === "openai" ? "pending" : "ready";

  const { data: existing, error: existingError } = await supabase
    .from("daily_sets")
    .select("id, source, generation_status")
    .eq("quiz_date", date)
    .maybeSingle();

  if (existingError) throw existingError;

  if (existing) {
    const existingSource = existing.source as GenerationSource;
    const canReplaceFallback =
      (existingSource === "fallback" || existing.generation_status === "failed") &&
      (source === "openai" || source === "fallback");

    if (!canReplaceFallback) {
      return { setId: existing.id as string, source: existingSource, status: existing.generation_status as GenerationResult["status"] };
    }

    const { count, error: attemptError } = await supabase
      .from("attempts")
      .select("id", { count: "exact", head: true })
      .eq("set_id", existing.id);

    if (attemptError) throw attemptError;

    if ((count ?? 0) > 0) {
      return { setId: existing.id as string, source: existingSource, status: existing.generation_status as GenerationResult["status"] };
    }

    const { error: deleteError } = await supabase.from("daily_sets").delete().eq("id", existing.id);
    if (deleteError) throw deleteError;
  }

  const { data: dailySet, error: setError } = await supabase
    .from("daily_sets")
    .insert({
      quiz_date: date,
      source,
      generation_status: status,
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

  return { setId: dailySet.id as string, source, status };
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
