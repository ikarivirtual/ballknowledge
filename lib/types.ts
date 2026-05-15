export type Question = {
  id: string;
  position: number;
  prompt: string;
  choices: string[];
  explanation: string;
};

export type AttemptResult = {
  score: number;
  correctCount: number;
  totalScore: number;
  speedBonus: number;
  durationSeconds: number;
  playerName: string;
  answers: number[];
  correctChoices: number[];
};
