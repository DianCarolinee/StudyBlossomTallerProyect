'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating motivational content
 * based on the AIDA (Attention, Interest, Desire, Action) model.
 *
 * - generateAidaEngagement - A function that generates the AIDA content.
 * - GenerateAidaEngagementInput - The input type for the function.
 * - GenerateAidaEngagementOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAidaEngagementInputSchema = z.object({
  topic: z.string().describe('The topic to generate motivational content for.'),
});
export type GenerateAidaEngagementInput = z.infer<typeof GenerateAidaEngagementInputSchema>;


const GenerateAidaEngagementOutputSchema = z.object({
  attention: z.string().describe('A surprising fact or counter-intuitive question to grab the user\'s attention. Max 15 words.'),
  interest: z.string().describe('A short paragraph that builds interest by connecting the topic to something the user cares about. Max 50 words.'),
  desire: z.array(z.string()).length(3).describe('A list of exactly 3 short bullet points showing the direct benefits of learning the topic.'),
});
export type GenerateAidaEngagementOutput = z.infer<typeof GenerateAidaEngagementOutputSchema>;


export async function generateAidaEngagement(input: GenerateAidaEngagementInput): Promise<GenerateAidaEngagementOutput> {
  return generateAidaEngagementFlow(input);
}


const prompt = ai.definePrompt({
  name: 'generateAidaEngagementPrompt',
  input: {schema: GenerateAidaEngagementInputSchema},
  output: {schema: GenerateAidaEngagementOutputSchema},
  prompt: `Eres un experto en marketing educativo y motivación. Para el tema "{{{topic}}}", genera contenido motivacional siguiendo el modelo AIDA (Atención, Interés, Deseo).

Reglas:
- **Atención:** Una pregunta contraintuitiva o un dato sorprendente para captar la atención. Máximo 15 palabras.
- **Interés:** Un párrafo corto que despierte interés conectando el tema con algo familiar o relevante para el usuario. Máximo 50 palabras.
- **Deseo:** Una lista de exactamente 3 beneficios directos y accionables que el usuario obtendrá al aprender el tema.
- Todo el contenido debe ser en español.

Ejemplo para el tema "Inteligencia Artificial":
{
  "attention": "¿Sabías que la IA que elige tu música usa matemáticas similares a las que predicen el clima?",
  "interest": "No es magia. Es la capacidad de encontrar patrones en millones de datos. Entenderlo es entender una de las fuerzas que moldean nuestro futuro, desde la medicina hasta el entretenimiento.",
  "desire": [
    "Crea pequeñas automatizaciones para simplificar tu día a día.",
    "Entiende las noticias sobre tecnología a un nivel que pocos pueden.",
    "Añade una habilidad fundamental y demandada a tu perfil profesional."
  ]
}`,
});


const generateAidaEngagementFlow = ai.defineFlow(
  {
    name: 'generateAidaEngagementFlow',
    inputSchema: GenerateAidaEngagementInputSchema,
    outputSchema: GenerateAidaEngagementOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
