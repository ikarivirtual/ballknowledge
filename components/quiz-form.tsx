"use client";

import { Trophy } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatDuration } from "@/lib/scoring";
import type { AttemptResult, Question } from "@/lib/types";

type Props = {
  questions: Question[];
  existingAttempt: AttemptResult | null;
};

export function QuizForm({ questions, existingAttempt }: Props) {
  const [answers, setAnswers] = useState<number[]>(existingAttempt?.answers ?? Array(5).fill(-1));
  const [result, setResult] = useState<AttemptResult | null>(existingAttempt);
  const [playerName, setPlayerName] = useState(existingAttempt?.playerName ?? "");
  const [elapsedSeconds, setElapsedSeconds] = useState(existingAttempt?.durationSeconds ?? 0);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const startedAt = useRef(Date.now());

  const complete = useMemo(() => answers.every((answer) => answer >= 0), [answers]);
  const cleanPlayerName = playerName.trim().replace(/\s+/g, " ");
  const readyToSubmit = complete && cleanPlayerName.length >= 2;

  useEffect(() => {
    if (result) return;

    const interval = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt.current) / 1000));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [result]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const durationSeconds = Math.floor((Date.now() - startedAt.current) / 1000);
    setPending(true);
    setError(null);

    const response = await fetch("/api/attempts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ answers, playerName: cleanPlayerName, durationSeconds })
    });

    const payload = await response.json();
    setPending(false);

    if (!response.ok) {
      setError(payload.error ?? "Could not submit attempt");
      return;
    }

    setElapsedSeconds(payload.durationSeconds ?? durationSeconds);
    setResult(payload);
  }

  return (
    <form className="panel stack" onSubmit={submit}>
      {result ? (
        <div className="result-banner" aria-live="polite">
          <strong>
            <Trophy size={18} aria-hidden="true" /> {result.totalScore.toLocaleString()} pts
          </strong>
          <span className="muted">
            {result.playerName}: {result.correctCount}/5 correct in {formatDuration(result.durationSeconds)} with{" "}
            {result.speedBonus.toLocaleString()} speed points.
          </span>
        </div>
      ) : null}

      {!result ? (
        <div className="player-row">
          <label className="text-field">
            <span>Username</span>
            <input
              maxLength={24}
              minLength={2}
              name="playerName"
              onChange={(event) => setPlayerName(event.target.value)}
              placeholder="e.g. CahillVolley"
              required
              value={playerName}
            />
          </label>
          <div className="timer" aria-live="polite">
            <span>Time</span>
            <strong>{formatDuration(elapsedSeconds)}</strong>
          </div>
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
        <button className="button" disabled={!readyToSubmit || pending} type="submit">
          {pending ? "Scoring..." : "Submit score"}
        </button>
      ) : null}
    </form>
  );
}
