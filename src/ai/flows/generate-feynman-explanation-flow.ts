
'use server';
/**
 * @fileOverview This file defines Genkit flows for the Feynman learning technique.
 * It includes flows to get an initial explanation and to analyze a user's explanation.
 * - getFeynmanExplanation - Provides a simple explanation of a topic.
 * - analyzeFeynmanExplanation - Analyzes the user's explanation and provides feedback.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Schema for getting the initial explanation
const FeynmanExplanationInputSchema = z.object({
  topic: z.string().describe('The topic to be explained.'),
});
const FeynmanExplanationOutputSchema = z.object({
  explanation: z.string().describe('A simple, concise explanation of the topic, suitable for a beginner.'),
});
export type FeynmanExplanationOutput = z.infer<typeof FeynmanExplanationOutputSchema>;


// Schema for analyzing the user's explanation
const FeynmanAnalysisInputSchema = z.object({
    topic: z.string().describe('The original topic of study.'),
    userExplanation: z.string().describe("The user's attempt to explain the topic."),
});
const FeynmanAnalysisOutputSchema = z.object({
    gaps: z.string().describe("Feedback identifying gaps or misconceptions in the user's explanation. Use bullet points."),
    simplifications: z.string().describe("Feedback suggesting how to simplify complex parts of the user's explanation. Use bullet points."),
});
export type FeynmanAnalysisOutput = z.infer<typeof FeynmanAnalysisOutputSchema>;


/**
 * Generates a simple, initial explanation of a topic.
 */
export async function getFeynmanExplanation(
  topic: string
): Promise<FeynmanExplanationOutput | { error: string }> {
  try {
    const result = await explanationFlow({ topic });
    if (!result || !result.explanation) {
      return { error: "Could not generate an explanation. The topic might be too broad." };
    }
    return result;
  } catch (e: any) {
    console.error(e);
    return { error: e.message || "An unexpected error occurred while generating the explanation." };
  }
}

/**
 * Analyzes a user's explanation and provides feedback.
 */
export async function analyzeFeynmanExplanation(
  topic: string,
  userExplanation: string
): Promise<FeynmanAnalysisOutput | { error: string }> {
   try {
    const result = await analysisFlow({ topic, userExplanation });
    if (!result || !result.gaps || !result.simplifications) {
      return { error: "Could not analyze the explanation." };
    }
    return result;
  } catch (e: any) {
    console.error(e);
    return { error: e.message || "An unexpected error occurred while analyzing the explanation." };
  }
}


// Prompt & Flow for the initial explanation
const explanationPrompt = ai.definePrompt({
  name: 'feynmanExplanationPrompt',
  input: {schema: FeynmanExplanationInputSchema},
  output: {schema: FeynmanExplanationOutputSchema},
  prompt: `Eres un experto en la técnica Feynman. Para el tema "{{{topic}}}", genera una explicación muy simple y concisa, como si se la estuvieras explicando a un niño de 12 años. Usa analogías si es posible. No excedas las 100 palabras.`,
});

const explanationFlow = ai.defineFlow(
  {
    name: 'feynmanExplanationFlow',
    inputSchema: FeynmanExplanationInputSchema,
    outputSchema: FeynmanExplanationOutputSchema,
  },
  async (input) => {
    const {output} = await explanationPrompt(input);
    return output!;
  }
);


// Prompt & Flow for analyzing the user's explanation
const analysisPrompt = ai.definePrompt({
    name: 'feynmanAnalysisPrompt',
    input: {schema: FeynmanAnalysisInputSchema},
    output: {schema: FeynmanAnalysisOutputSchema},
    prompt: `Eres un profesor experto en la técnica Feynman. El tema de estudio es "{{{topic}}}".
La explicación del estudiante es: "{{{userExplanation}}}"

Analiza su explicación y divídela en dos partes:
1.  **gaps**: Identifica 1-2 brechas clave o conceptos erróneos. Sé directo.
2.  **simplifications**: Sugiere 1-2 formas de simplificar las partes complejas.

Usa guiones (-) para cada punto. Dirígete al estudiante en segunda persona.

Ejemplo de formato de salida:
{
  "gaps": "- No mencionaste el rol del núcleo en la célula.\\n- Confundiste mitocondria con cloroplasto.",
  "simplifications": "- En lugar de 'orgánulo membranoso', prueba 'el centro de control'.\\n- Compara la célula con una pequeña fábrica."
}`,
});

const analysisFlow = ai.defineFlow(
  {
    name: 'feynmanAnalysisFlow',
    inputSchema: FeynmanAnalysisInputSchema,
    outputSchema: FeynmanAnalysisOutputSchema,
  },
  async (input) => {
    const {output} = await analysisPrompt(input);
    return output!;
  }
);
