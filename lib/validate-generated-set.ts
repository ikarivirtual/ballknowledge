import type { GeneratedSet } from "@/lib/question-schema";

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

export function validateGeneratedSet(set: GeneratedSet) {
  const issues: string[] = [];
  const prompts = new Set<string>();

  set.questions.forEach((question, index) => {
    const label = `Q${index + 1}`;
    const choices = new Set(question.choices.map((choice) => choice.trim().toLowerCase()));

    if (prompts.has(question.prompt.trim().toLowerCase())) {
      issues.push(`${label}: duplicate prompt.`);
    }
    prompts.add(question.prompt.trim().toLowerCase());

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
