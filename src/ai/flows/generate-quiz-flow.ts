'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a multiple-choice quiz
 * based on a list of flashcards.
 * - generateQuiz - A function that generates the quiz.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FlashcardSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

const GenerateQuizInputSchema = z.object({
  flashcards: z.array(FlashcardSchema).describe('An array of flashcards, each with a question and an answer.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const QuizQuestionSchema = z.object({
    question: z.string().describe('The quiz question, based on the flashcard content.'),
    options: z.array(z.string()).describe('An array of 4 possible answers (3 incorrect, 1 correct).'),
    correctAnswer: z.string().describe('The exact text of the correct answer from the options array.'),
});

const GenerateQuizOutputSchema = z.object({
  questions: z.array(QuizQuestionSchema).describe('An array of 5 quiz questions.').length(5),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;


export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `Eres un profesor experto creando evaluaciones. A partir de la siguiente lista de tarjetas de estudio (pregunta y respuesta), crea un quiz de opción múltiple en español.

Reglas:
- Genera exactamente 5 preguntas.
- Cada pregunta debe tener 4 opciones de respuesta.
- Solo una de las opciones debe ser correcta.
- Las preguntas y opciones deben basarse **únicamente** en la información proporcionada en las tarjetas. No inventes información.
- Las opciones incorrectas (distractores) deben ser plausibles pero claramente incorrectas según el contenido de las tarjetas.

Tarjetas de estudio proporcionadas:
{{#each flashcards}}
- Pregunta: {{{this.question}}}
  Respuesta: {{{this.answer}}}
{{/each}}

Devuelve el quiz como un objeto JSON con el formato especificado. Asegúrate de que el 'correctAnswer' coincida exactamente con una de las 'options'.`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
