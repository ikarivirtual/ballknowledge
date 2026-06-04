import type { GeneratedSet } from "@/lib/question-schema";
import { normalizeQuestionPrompt, questionPromptSimilarity } from "@/lib/question-history";

type ValidationOptions = {
  recentPrompts?: string[];
};

const riskyPatterns = [
  /\bfirst\b/i,
  /\bonly\b/i,
  /\byoungest\b/i,
  /\boldest\b/i,
  /\bmost\b/i,
  /\brecord\b/i,
  /\bever\b/i
];

function hasAnchor(text: string) {
  return /\b(19|20)\d{2}\b/.test(text) || /\b\d+-\d+\b/.test(text) || /\b(final|semi-final|quarter-final|group stage)\b/i.test(text);
}

export function validateGeneratedSet(set: GeneratedSet, options: ValidationOptions = {}) {
  const issues: string[] = [];
  const prompts = new Set<string>();
  const promptTexts: string[] = [];
  const recentPrompts = options.recentPrompts ?? [];

  set.questions.forEach((question, index) => {
    const label = `Q${index + 1}`;
    const normalizedPrompt = normalizeQuestionPrompt(question.prompt);
    const choices = new Set(question.choices.map((choice) => choice.trim().toLowerCase()));

    if (prompts.has(normalizedPrompt)) {
      issues.push(`${label}: duplicate prompt.`);
    }

    if (promptTexts.some((promptText) => questionPromptSimilarity(promptText, question.prompt) >= 0.72)) {
      issues.push(`${label}: closely rewords another question in this set.`);
    }

    prompts.add(normalizedPrompt);
    promptTexts.push(question.prompt);

    const repeatedPrompt = recentPrompts.find((recentPrompt) => {
      const normalizedRecentPrompt = normalizeQuestionPrompt(recentPrompt);
      return normalizedRecentPrompt === normalizedPrompt || questionPromptSimilarity(recentPrompt, question.prompt) >= 0.72;
    });

    if (repeatedPrompt) {
      issues.push(`${label}: repeats or closely rewords a recent question: "${repeatedPrompt}".`);
    }

    if (choices.size !== 4) {
      issues.push(`${label}: choices must be four distinct answers.`);
    }

    if (!question.choices[question.correctChoice]) {
      issues.push(`${label}: correctChoice does not point to a choice.`);
    }

    if (!hasAnchor(question.explanation)) {
      issues.push(`${label}: explanation needs a verifiable anchor such as a year, score, tournament stage, or final.`);
    }

    const combined = `${question.prompt} ${question.explanation}`;
    if (riskyPatterns.some((pattern) => pattern.test(combined))) {
      issues.push(`${label}: uses risky first/only/record-style wording that needs human-grade certainty.`);
    }
  });

  return issues;
}
