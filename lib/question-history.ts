import { createAdminClient } from "@/lib/supabase/admin";
import type { GeneratedSet } from "@/lib/question-schema";

export type QuestionHistorySource = "openai" | "fallback";

const HISTORY_PROMPT_LIMIT = 1000;
const missingHistoryTableCodes = new Set(["42P01", "PGRST205"]);

const fillerWords = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "did",
  "for",
  "in",
  "of",
  "on",
  "the",
  "to",
  "was",
  "were",
  "what",
  "which",
  "who",
  "with"
]);

type SupabaseErrorLike = {
  code?: string;
  message?: string;
};

function isMissingQuestionHistoryTable(error: SupabaseErrorLike) {
  const message = error.message ?? "";

  return (
    (error.code && missingHistoryTableCodes.has(error.code)) ||
    (message.includes("question_history") && (message.includes("does not exist") || message.includes("schema cache")))
  );
}

export function normalizeQuestionPrompt(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function keywordSet(text: string) {
  return new Set(normalizeQuestionPrompt(text).split(" ").filter((word) => word.length > 2 && !fillerWords.has(word)));
}

export function questionPromptSimilarity(left: string, right: string) {
  const leftWords = keywordSet(left);
  const rightWords = keywordSet(right);
  if (!leftWords.size || !rightWords.size) return 0;

  const intersection = [...leftWords].filter((word) => rightWords.has(word)).length;
  const union = new Set([...leftWords, ...rightWords]).size;

  return intersection / union;
}

async function fetchPromptsFromExistingQuestions(date: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("daily_sets")
    .select("questions(prompt)")
    .lt("quiz_date", date)
    .order("quiz_date", { ascending: false })
    .limit(HISTORY_PROMPT_LIMIT);

  if (error) throw error;

  return (data ?? [])
    .flatMap((set) => {
      const questions = set.questions as { prompt?: unknown }[] | null;
      return questions?.map((question) => question.prompt).filter((prompt): prompt is string => typeof prompt === "string") ?? [];
    })
    .slice(0, HISTORY_PROMPT_LIMIT);
}

export async function fetchQuestionHistoryPrompts(date: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("question_history")
    .select("prompt")
    .lt("quiz_date", date)
    .order("quiz_date", { ascending: false })
    .limit(HISTORY_PROMPT_LIMIT);

  if (error) {
    if (isMissingQuestionHistoryTable(error)) {
      return fetchPromptsFromExistingQuestions(date);
    }

    throw error;
  }

  return (data ?? []).map((row) => row.prompt).filter((prompt): prompt is string => typeof prompt === "string");
}

export async function recordQuestionHistory(date: string, setId: string, set: GeneratedSet, source: QuestionHistorySource) {
  const supabase = createAdminClient();
  const rows = set.questions.map((question, index) => ({
    quiz_date: date,
    set_id: setId,
    source,
    position: index + 1,
    prompt: question.prompt,
    normalized_prompt: normalizeQuestionPrompt(question.prompt),
    choices: question.choices,
    correct_choice: question.correctChoice,
    explanation: question.explanation
  }));

  const { error } = await supabase.from("question_history").upsert(rows, {
    onConflict: "normalized_prompt",
    ignoreDuplicates: true
  });

  if (error && !isMissingQuestionHistoryTable(error)) {
    throw error;
  }
}
