'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating study recommendations for a Pomodoro session.
 *
 * - generatePomodoroRecommendations - A function that generates sub-topics and research sources.
 * - GeneratePomodoroRecommendationsInput - The input type for the function.
 * - GeneratePomodoroRecommendationsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePomodoroRecommendationsInputSchema = z.object({
  topic: z.string().describe('The main study topic.'),
});
export type GeneratePomodoroRecommendationsInput = z.infer<typeof GeneratePomodoroRecommendationsInputSchema>;

const SourceSchema = z.object({
    title: z.string().describe('The title of the source (e.g., article or video title).'),
    url: z.string().url().describe('The URL to the source.'),
    type: z.enum(['video', 'article', 'book', 'documentation']).describe('The type of the source.'),
});

const RecommendationSchema = z.object({
    subTopic: z.string().describe('A key sub-topic related to the main topic.'),
    sources: z.array(SourceSchema).length(3).describe('A list of exactly 3 recommended sources for the sub-topic.'),
});

const GeneratePomodoroRecommendationsOutputSchema = z.object({
  recommendations: z.array(RecommendationSchema).min(3).max(5).describe('An array of 3 to 5 recommendations, each with a sub-topic and sources.'),
});
export type GeneratePomodoroRecommendationsOutput = z.infer<typeof GeneratePomodoroRecommendationsOutputSchema>;


export async function generatePomodoroRecommendations(input: GeneratePomodoroRecommendationsInput): Promise<GeneratePomodoroRecommendationsOutput> {
  return generatePomodoroRecommendationsFlow(input);
}


const prompt = ai.definePrompt({
  name: 'generatePomodoroRecommendationsPrompt',
  input: {schema: GeneratePomodoroRecommendationsInputSchema},
  output: {schema: GeneratePomodoroRecommendationsOutputSchema},
  prompt: `Eres un asistente de investigación experto. Para el tema de estudio principal "{{{topic}}}", genera una lista de subtemas clave y fuentes de alta calidad para investigar durante una sesión de estudio Pomodoro.

Reglas:
- Genera entre 3 y 5 subtemas importantes.
- Para cada subtema, proporciona exactamente 3 fuentes de investigación (artículos, videos, documentación, etc.).
- Las fuentes deben ser de alta calidad, relevantes y accesibles a través de una URL.
- Devuelve la respuesta en el formato JSON especificado.
`,
});


const generatePomodoroRecommendationsFlow = ai.defineFlow(
  {
    name: 'generatePomodoroRecommendationsFlow',
    inputSchema: GeneratePomodoroRecommendationsInputSchema,
    outputSchema: GeneratePomodoroRecommendationsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
