const POINTS_PER_CORRECT = 1000;
const MAX_SPEED_SECONDS = 300;
const SPEED_POINTS_PER_CORRECT = 300;

export function calculateQuizScore(correctCount: number, durationSeconds: number) {
  const safeCorrect = Math.max(0, Math.min(5, Math.trunc(correctCount)));
  const safeDuration = Math.max(0, Math.trunc(durationSeconds));
  const baseScore = safeCorrect * POINTS_PER_CORRECT;
  const speedSeconds = Math.max(0, MAX_SPEED_SECONDS - safeDuration);
  const speedBonus = Math.round((speedSeconds / MAX_SPEED_SECONDS) * SPEED_POINTS_PER_CORRECT * safeCorrect);

  return {
    correctCount: safeCorrect,
    durationSeconds: safeDuration,
    baseScore,
    speedBonus,
    totalScore: baseScore + speedBonus
  };
}

export function formatDuration(seconds: number) {
  const safeSeconds = Math.max(0, Math.trunc(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;

  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}
