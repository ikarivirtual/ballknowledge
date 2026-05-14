"use client";

import { Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import type { AttemptResult, Question } from "@/lib/types";

type Props = {
  questions: Question[];
  existingAttempt: AttemptResult | null;
};

export function QuizForm({ questions, existingAttempt }: Props) {
  const [answers, setAnswers] = useState<number[]>(existingAttempt?.answers ?? Array(5).fill(-1));
  const [result, setResult] = useState<AttemptResult | null>(existingAttempt);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const complete = useMemo(() => answers.every((answer) => answer >= 0), [answers]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const response = await fetch("/api/attempts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ answers })
    });

    const payload = await response.json();
    setPending(false);

    if (!response.ok) {
      setError(payload.error ?? "Could not submit attempt");
      return;
    }

    setResult(payload);
  }

  return (
    <form className="panel stack" onSubmit={submit}>
      {result ? (
        <div className="result-banner" aria-live="polite">
          <strong>
            <Trophy size={18} aria-hidden="true" /> Score: {result.score}/5
          </strong>
          <span className="muted">Your score is locked for today.</span>
        </div>
      ) : null}

      {questions.map((question, questionIndex) => (
        <fieldset className="question" key={question.id} disabled={Boolean(result)}>
          <legend>
            <span>Q{question.position}</span> {question.prompt}
          </legend>
          <div className="choices">
            {question.choices.map((choice, choiceIndex) => {
              const isCorrect = result?.correctChoices[questionIndex] === choiceIndex;
              const isPicked = answers[questionIndex] === choiceIndex;
              return (
                <label className="choice" key={choice}>
                  <input
                    name={`question-${question.id}`}
                    type="radio"
                    checked={isPicked}
                    onChange={() => {
                      setAnswers((current) => current.map((answer, index) => (index === questionIndex ? choiceIndex : answer)));
                    }}
                  />
                  <span>
                    {choice}
                    {result && isCorrect ? " - correct" : ""}
                    {result && isPicked && !isCorrect ? " - your pick" : ""}
                  </span>
                </label>
              );
            })}
          </div>
          {result ? <p className="muted">{question.explanation}</p> : null}
        </fieldset>
      ))}

      {error ? <p className="error">{error}</p> : null}
      {!result ? (
        <button className="button" disabled={!complete || pending} type="submit">
          {pending ? "Scoring..." : "Submit score"}
        </button>
      ) : null}
    </form>
  );
}
