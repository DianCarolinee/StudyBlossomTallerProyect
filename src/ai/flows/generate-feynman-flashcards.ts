'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating Feynman flashcards based on a given study topic.
 *
 * The flow takes a study topic as input and returns a set of flashcards.
 * - generateFeynmanFlashcards - A function that generates flashcards based on the Feynman technique.
 * - GenerateFeynmanFlashcardsInput - The input type for the generateFeynmanFlashcards function.
 * - GenerateFeynmanFlashcardsOutput - The return type for the generateFeynmanFlashcards function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFeynmanFlashcardsInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate flashcards.'),
});
export type GenerateFeynmanFlashcardsInput = z.infer<typeof GenerateFeynmanFlashcardsInputSchema>;

const GenerateFeynmanFlashcardsOutputSchema = z.object({
  flashcards: z.array(z.object({
    question: z.string().describe('The question for the front of the a flashcard, maximum 15 words.'),
    answer: z.string().describe('The answer for the back of the flashcard, maximum 15 words.'),
  })).describe('An array of exactly 5 flashcards with questions and answers.').length(5),
});
export type GenerateFeynmanFlashcardsOutput = z.infer<typeof GenerateFeynmanFlashcardsOutputSchema>;

export async function generateFeynmanFlashcards(input: GenerateFeynmanFlashcardsInput): Promise<GenerateFeynmanFlashcardsOutput> {
  return generateFeynmanFlashcardsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFeynmanFlashcardsPrompt',
  input: {schema: GenerateFeynmanFlashcardsInputSchema},
  output: {schema: GenerateFeynmanFlashcardsOutputSchema},
  prompt: `Eres un experto en la técnica Feynman. Genera una serie de tarjetas de estudio en español para el tema: {{{topic}}}.

Cada tarjeta debe tener una 'pregunta' y una 'respuesta'.
- La pregunta debe estar en el anverso.
- La respuesta debe estar en el reverso.
- Tanto la pregunta como la respuesta deben tener un máximo de 15 palabras.
- Explica el concepto en términos sencillos.
- Genera exactamente 5 tarjetas de estudio. No generes más ni menos de 5.

Devuelve las tarjetas como un array de objetos JSON.

Ejemplo:
{
  "flashcards": [
    {
      "question": "¿Qué es la fotosíntesis?",
      "answer": "El proceso que usan las plantas para convertir la energía luminosa en energía química."
    }
  ]
}
`,
});

const generateFeynmanFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateFeynmanFlashcardsFlow',
    inputSchema: GenerateFeynmanFlashcardsInputSchema,
    outputSchema: GenerateFeynmanFlashcardsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
