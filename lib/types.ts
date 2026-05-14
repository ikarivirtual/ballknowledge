export type Question = {
  id: string;
  position: number;
  prompt: string;
  choices: string[];
  explanation: string;
};

export type AttemptResult = {
  score: number;
  answers: number[];
  correctChoices: number[];
};
