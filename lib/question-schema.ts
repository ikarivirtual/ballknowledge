import { z } from "zod";

export const generatedQuestionSchema = z.object({
  prompt: z.string().min(20).max(240),
  choices: z.array(z.string().min(1).max(80)).length(4),
  correctChoice: z.number().int().min(0).max(3),
  explanation: z.string().min(20).max(280)
}).strict();

export const generatedSetSchema = z.object({
  questions: z.array(generatedQuestionSchema).length(5)
}).strict();

export type GeneratedSet = z.infer<typeof generatedSetSchema>;
