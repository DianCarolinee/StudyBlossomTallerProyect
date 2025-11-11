import * as z from "zod";

export const StudyGoalSchema = z.object({
  goalName: z
    .string()
    .min(2, { message: "El nombre de la meta debe tener al menos 2 caracteres." }),
  studyTime: z.coerce
    .number()
    .min(1, { message: "El tiempo de estudio debe ser de al menos 1 hora." }),
  topic: z
    .string()
    .min(2, { message: "El tema debe tener al menos 2 caracteres." }),
});

export type StudyGoal = z.infer<typeof StudyGoalSchema>;


export const StudySessionEntrySchema = StudyGoalSchema.extend({
  id: z.string(),
  userId: z.string(),
  mode: z.string(),
  createdAt: z.date().or(z.string().datetime()),
});

export type StudySessionEntry = z.infer<typeof StudySessionEntrySchema>;


export interface FlashcardData {
  question: string;
  answer: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}
